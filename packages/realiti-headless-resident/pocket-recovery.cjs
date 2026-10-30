#!/usr/bin/env node
'use strict';
// Offline, operator-authorized recovery for issue #50. Never run against a live host.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const POCKET_KEY = 'realiti-pocket-v32-local';
const STORE_SCHEMA = 'REALITI_STORE_CHECKPOINT_V1';
const KEYS_SCHEMA = 'REALITI_HOST_KEYSTORE_V1';
const POCKET_SCHEMA = 'REALITI_POCKET_V32';
const PRIVATE_NAMES = ['root-private-v1', 'device-private-v1', 'keyring-epoch-v1', 'cache-key-v1', 'cap-root-v1'];
const POCKET_FIELDS = new Set(['schema', 'backend', 'resident', 'device', 'receipts', 'wrapped', 'cache_sealed', 'tombstones', 'deletion', 'settings', 'stats', 'key_store']);
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const record = x => !!x && typeof x === 'object' && !Array.isArray(x);
const fail = code => { const e = new Error(code); e.code = code; throw e; };
const keyPathFor = p => String(p).replace(/\.json$/i, '') + '.keys.json';
function readRegular(file) {
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink()) fail('RECOVERY_REGULAR_FILE_REQUIRED: ' + file);
  return fs.readFileSync(file);
}
function decodeJson(bytes, label) {
  try { return JSON.parse(bytes.toString('utf8')); }
  catch { fail('RECOVERY_INVALID_JSON: ' + label); }
}
function load(storagePath, keystorePath, residentId) {
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,79}$/.test(String(residentId || ''))) fail('RECOVERY_RESIDENT_ID_REQUIRED');
  const storeBytes = readRegular(storagePath), keysBytes = readRegular(keystorePath);
  const envelope = decodeJson(storeBytes, 'storage'), keyfile = decodeJson(keysBytes, 'keystore');
  if (!record(envelope) || envelope.schema !== STORE_SCHEMA || !record(envelope.data) || !/^[a-f0-9]{64}$/.test(envelope.sha256 || '')) fail('RECOVERY_CHECKPOINT_SCHEMA_REQUIRED');
  if (hash(JSON.stringify(envelope.data)) !== envelope.sha256) fail('RECOVERY_CHECKPOINT_INTEGRITY_MISMATCH');
  if (!record(keyfile) || keyfile.schema !== KEYS_SCHEMA || !record(keyfile.keys)) fail('RECOVERY_KEYSTORE_SCHEMA_REQUIRED');
  const pocketKeys = Object.keys(envelope.data).filter(k => k === POCKET_KEY || k.endsWith('realiti-pocket-v32-local'));
  if (pocketKeys.length !== 1 || pocketKeys[0] !== POCKET_KEY || typeof envelope.data[POCKET_KEY] !== 'string') fail('RECOVERY_AMBIGUOUS_POCKET');
  const memoryKeys = Object.keys(envelope.data).filter(k => k.startsWith('resident-memory-v1:'));
  const expectedMemory = 'resident-memory-v1:' + encodeURIComponent(residentId);
  // Pocket keys are NOT resident-namespaced. Refuse a shared backing file to avoid destroying a second Pocket's keys.
  if (memoryKeys.length !== 1 || memoryKeys[0] !== expectedMemory) fail('RECOVERY_SHARED_OR_UNVERIFIED_RESIDENT');
  const memory = decodeJson(Buffer.from(envelope.data[expectedMemory]), 'resident memory');
  if (memory?.schema !== 'REALITI_LOCAL_MEMORY_V1' || memory.resident_id !== residentId) fail('RECOVERY_RESIDENT_MEMORY_MISMATCH');
  const pocket = decodeJson(Buffer.from(envelope.data[POCKET_KEY]), 'Pocket');
  if (!record(pocket) || pocket.schema !== POCKET_SCHEMA || !record(pocket.resident) || !/^resident:/.test(pocket.resident.id || '') || !record(pocket.resident.root_public_jwk) || !record(pocket.receipts) || !record(pocket.wrapped)) fail('RECOVERY_POCKET_SCHEMA_UNEXPECTED');
  if (Object.keys(pocket).some(k => !POCKET_FIELDS.has(k))) fail('RECOVERY_UNKNOWN_POCKET_FIELDS');
  if (Object.prototype.hasOwnProperty.call(keyfile.keys, 'root-private-v1')) fail('RECOVERY_ROOT_KEY_PRESENT_REFUSE_TO_DISCARD');
  const receiptCount = Object.keys(pocket.receipts).length, wrappedCount = Object.keys(pocket.wrapped).length;
  if (!receiptCount && !wrappedCount) fail('RECOVERY_NO_STRANDED_SEALED_RECORDS');
  const fingerprint = hash(Buffer.concat([storeBytes, Buffer.from([0]), keysBytes]));
  const confirmation = 'ABANDON:' + pocket.resident.id + ':' + fingerprint.slice(0, 16);
  return {
    storeBytes, keysBytes, envelope, keyfile, pocket, fingerprint,
    plan: {
      status: 'DRY_RUN_ONLY', scope: 'ONE_STRANDED_NONEMPTY_SEALED_POCKET',
      storage_path: storagePath, keystore_path: keystorePath, resident_id: residentId,
      old_pocket_identity: pocket.resident.id, sealed_receipts: receiptCount, wrapped_keys: wrappedCount,
      sealed_cache: !!pocket.cache_sealed,
      keys_to_remove: PRIVATE_NAMES.filter(k => Object.prototype.hasOwnProperty.call(keyfile.keys, k)),
      other_storage_entries_preserved: Object.keys(envelope.data).length - 1,
      unrelated_keystore_entries_preserved: Object.keys(keyfile.keys).filter(k => !PRIVATE_NAMES.includes(k)).length,
      file_fingerprint: fingerprint, confirmation,
      warning: 'Irrecoverable ciphertext will be abandoned. Restore missing original identity keys instead if possible. Stop EVERY host using these files before applying. A new cryptographic Pocket identity will be minted on next launch; the external residentId is unchanged.'
    }
  };
}
function inspectPocketRecovery({storagePath, keystorePath, residentId}) {
  const sp = path.resolve(storagePath), kp = path.resolve(keystorePath || keyPathFor(sp));
  if (sp === kp) fail('RECOVERY_PATH_COLLISION');
  return load(sp, kp, residentId).plan;
}
function exclusiveWrite(filename, bytes, mode = 0o600) {
  const fd = fs.openSync(filename, 'wx', mode);
  try { fs.writeFileSync(fd, bytes); fs.fsyncSync(fd); }
  finally { fs.closeSync(fd); }
}
function stageReplacement(filename, bytes) {
  const tmp = filename + '.pocket-recovery-stage-' + process.pid + '-' + crypto.randomBytes(5).toString('hex');
  exclusiveWrite(tmp, bytes);
  return tmp;
}
function replaceFromBackup(target, backup) {
  const tmp = stageReplacement(target, fs.readFileSync(backup));
  try { fs.renameSync(tmp, target); } finally { if (fs.existsSync(tmp)) fs.unlinkSync(tmp); }
}
function applyPocketRecovery({storagePath, keystorePath, residentId, confirmation, offlineConfirmed = false}) {
  if (!offlineConfirmed) fail('RECOVERY_OFFLINE_ACK_REQUIRED');
  const sp = path.resolve(storagePath), kp = path.resolve(keystorePath || keyPathFor(sp));
  if (sp === kp) fail('RECOVERY_PATH_COLLISION');
  const lock = sp + '.pocket-recovery.lock', pending = sp + '.pocket-recovery.pending.json';
  const lockFd = fs.openSync(lock, 'wx', 0o600);
  let backupStore, backupKeys, stageStore, stageKeys, replaced = false;
  try {
    if (fs.existsSync(pending)) fail('RECOVERY_PENDING_JOURNAL_RESTORE_FIRST');
    const original = load(sp, kp, residentId);
    if (!confirmation || confirmation !== original.plan.confirmation) fail('RECOVERY_CONFIRMATION_MISMATCH');
    const id = new Date().toISOString().replace(/[:.]/g, '-') + '-' + crypto.randomBytes(4).toString('hex');
    backupStore = sp + '.pocket-recovery-' + id + '.bak';
    backupKeys = kp + '.pocket-recovery-' + id + '.bak';
    // Exact byte-for-byte backups, owner-only. Keep both until two restart tests have passed.
    exclusiveWrite(backupStore, original.storeBytes);
    exclusiveWrite(backupKeys, original.keysBytes);
    const changedPocket = { ...original.pocket, receipts: {}, wrapped: {}, cache_sealed: null, tombstones: {}, deletion: {}, stats: {cold_scans: 0} };
    // Retain the old public resident+device records: the existing EMPTY-pocket recovery safely mints and verifies a
    // new durable root/device pair. Removing public identity here would bypass its re-mint durability guard.
    const data = { ...original.envelope.data, [POCKET_KEY]: JSON.stringify(changedPocket) };
    const store = { ...original.envelope, saved_wall_ms: Date.now(), sha256: hash(JSON.stringify(data)), data };
    const nextKeys = { ...original.keyfile.keys };
    for (const k of PRIVATE_NAMES) delete nextKeys[k];
    const keyfile = { ...original.keyfile, keys: nextKeys };
    const storeOut = Buffer.from(JSON.stringify(store, null, 2));
    const keysOut = Buffer.from(JSON.stringify(keyfile, null, 2));
    stageStore = stageReplacement(sp, storeOut);
    stageKeys = stageReplacement(kp, keysOut);
    exclusiveWrite(pending, Buffer.from(JSON.stringify({schema: 'REALITI_POCKET_RECOVERY_JOURNAL_V1', status: 'PREPARED', backup_storage: backupStore, backup_keystore: backupKeys, before: original.fingerprint, after_storage: hash(storeOut), after_keystore: hash(keysOut)}, null, 2)));
    if (hash(readRegular(sp)) !== hash(original.storeBytes) || hash(readRegular(kp)) !== hash(original.keysBytes)) fail('RECOVERY_FILES_CHANGED_WHILE_PREPARING');
    // Individual renames are atomic, but no filesystem promises a two-file transaction. The pending journal and
    // retained backups permit recovery from interruption between the two renames. Never run against a live host.
    fs.renameSync(stageKeys, kp); stageKeys = null; replaced = true;
    fs.renameSync(stageStore, sp); stageStore = null;
    if (hash(readRegular(sp)) !== hash(storeOut) || hash(readRegular(kp)) !== hash(keysOut)) fail('RECOVERY_POST_WRITE_MISMATCH');
    fs.unlinkSync(pending);
    return { status: 'RECOVERY_APPLIED_RESTART_VERIFICATION_REQUIRED', resident_id: residentId, previous_pocket_identity: original.pocket.resident.id, new_pocket_identity: 'MINTED_ON_NEXT_LAUNCH', backup_storage: backupStore, backup_keystore: backupKeys, restored_other_storage_entries: original.plan.other_storage_entries_preserved, next: 'Restart with the SAME residentId/storagePath, check ready.pocket=ready and save=device-local, stop and restart again, and verify resident memory/world state. Retain both backups until verified.' };
  } catch (e) {
    if (replaced) {
      try { replaceFromBackup(kp, backupKeys); replaceFromBackup(sp, backupStore); replaced = false; }
      catch (rollbackError) { e.message += '; ROLLBACK_FAILED: ' + rollbackError.message + '; restore backups named in ' + pending; }
    }
    if (!replaced && fs.existsSync(pending)) fs.unlinkSync(pending);
    throw e;
  } finally {
    if (stageStore && fs.existsSync(stageStore)) fs.unlinkSync(stageStore);
    if (stageKeys && fs.existsSync(stageKeys)) fs.unlinkSync(stageKeys);
    fs.closeSync(lockFd); fs.unlinkSync(lock);
  }
}
module.exports = { inspectPocketRecovery, applyPocketRecovery };
if (require.main === module) {
  try {
    const args = process.argv.slice(2), opt = {};
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--apply') opt.apply = true;
      else if (args[i] === '--offline-confirmed') opt.offlineConfirmed = true;
      else if (['--storage', '--keystore', '--resident-id', '--confirm'].includes(args[i]) && args[i + 1]) opt[args[i].slice(2)] = args[++i];
      else fail('RECOVERY_UNKNOWN_OR_INCOMPLETE_ARGUMENT: ' + args[i]);
    }
    if (!opt.storage || !opt['resident-id']) fail('USAGE: node pocket-recovery.cjs --storage STATE.json --resident-id ID [--keystore KEYS.json] [--apply --offline-confirmed --confirm TOKEN]');
    const common = {storagePath: opt.storage, keystorePath: opt.keystore, residentId: opt['resident-id']};
    console.log(JSON.stringify(opt.apply ? applyPocketRecovery({...common, offlineConfirmed: opt.offlineConfirmed, confirmation: opt.confirm}) : inspectPocketRecovery(common), null, 2));
  } catch (e) { console.error(JSON.stringify({ok: false, error: e.code || e.message})); process.exitCode = 1; }
}
