'use strict';
// Real offline recovery drill. NEVER uses production data. Rejects active host,
// incomplete keys, altered encrypted journals, symlinks and overlapping paths.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {createHousehold}=require('../household.cjs');
const {rehearse}=require('../rehearse-home-backup.cjs');
const html=path.resolve(__dirname,'../RealitiApartmentHomeCandidate.html');
const validationPath=path.resolve(__dirname,'../HOME_CANDIDATE_VALIDATION.json');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
(async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-offline-rehearsal-'));
 const source=path.join(root,'private-house'),destination=path.join(root,'restored-drill');
 const args={source,destination,htmlPath:html,validationPath};
 let house=await createHousehold({dir:source,htmlPath:html,validationPath});
 const alice=await house.joinResident('alice'),bob=await house.joinResident('bob');
 await alice.run('remote activate');
 assert.equal((await alice.run('remote memory remember A violet door in the rain')).ok,true);
 assert.equal((await alice.run('remote household post Cat is asleep')).ok,true);
 assert.equal((await alice.run('save')).ok,true);
 // Active household owns a real host.lock. Refuse snapshot even if source path
 // is readable: no silent copy or unwitting checkpoint race.
 await assert.rejects(rehearse(args),/REHEARSAL_HOST_LOCK_PRESENT/);
 assert.equal(fs.existsSync(destination),false);
 await house.close();house=null;
 const key=path.join(source,'residents','alice','world.keys.json');
 const journal=path.join(source,'residents','alice','journal.enc.json');
 const before={key:hash(key),journal:hash(journal),shared:hash(path.join(source,'household.json'))};
 const result=await rehearse(args);
 assert.equal(result.ok,true);
 assert.equal(result.source_unchanged,true);
 assert.equal(result.restored_residents,2);
 assert.equal(result.original_source_bytes_modified,0);
 assert.ok(result.files_copied>=9);
 assert.ok(result.bytes_copied>0);
 assert.equal(JSON.stringify(result).includes('violet door'),false,
  'operator output never exposes private note plaintext');
 assert.equal(hash(key),before.key);
 assert.equal(hash(journal),before.journal);
 assert.equal(hash(path.join(source,'household.json')),before.shared);
 assert.equal(fs.existsSync(path.join(source,'host.lock')),false);
 assert.equal(fs.existsSync(path.join(destination,'host.lock')),false);
 assert.equal(hash(path.join(destination,'residents','alice','world.keys.json')),before.key,
  'resident private Pocket key must survive the copied backup');
 assert.equal(hash(path.join(destination,'residents','alice','journal.key')),
  hash(path.join(source,'residents','alice','journal.key')));
 await assert.rejects(rehearse(args),/REHEARSAL_DESTINATION_EXISTS/);
 await assert.rejects(rehearse({...args,destination:path.join(source,'nested-copy')}),
  /REHEARSAL_PATHS_OVERLAP/);
 const incomplete=path.join(root,'source-missing-keys');
 fs.cpSync(source,incomplete,{recursive:true});
 fs.unlinkSync(path.join(incomplete,'residents','alice','world.keys.json'));
 await assert.rejects(rehearse({...args,source:incomplete,
  destination:path.join(root,'copy-missing-keys')}),
  /REHEARSAL_INCOMPLETE_RESIDENT_KEY_DATA/);
 const corrupt=path.join(root,'source-corrupt-cipher');
 fs.cpSync(source,corrupt,{recursive:true});
 const file=path.join(corrupt,'residents','alice','journal.enc.json');
 const blob=JSON.parse(fs.readFileSync(file,'utf8'));blob.tag=Buffer.alloc(16).toString('base64');
 fs.writeFileSync(file,JSON.stringify(blob));
 await assert.rejects(rehearse({...args,source:corrupt,
  destination:path.join(root,'copy-corrupt-cipher')}),
  /PRIVATE_JOURNAL_AUTHENTICATION_FAILED/);
 // Defective household checkpoint must not be re-stamped or imported.
 const invalid=path.join(root,'source-bad-checkpoint');
 fs.cpSync(source,invalid,{recursive:true});
 const cp=path.join(invalid,'household.json'),v=JSON.parse(fs.readFileSync(cp,'utf8'));
 v.revision+=1;fs.writeFileSync(cp,JSON.stringify(v));
 await assert.rejects(rehearse({...args,source:invalid,
  destination:path.join(root,'copy-bad-checkpoint')}),
  /REHEARSAL_HOUSEHOLD_CHECKPOINT_INVALID/);
 if(process.platform!=='win32'){
  const linked=path.join(root,'source-with-symlink');
  fs.cpSync(source,linked,{recursive:true});
  fs.symlinkSync(path.join(source,'household.json'),path.join(linked,'spoof.json'));
  await assert.rejects(rehearse({...args,source:linked,
   destination:path.join(root,'copy-with-link')}),
   /REHEARSAL_SYMLINK_REFUSED/);
 }
 console.log('HOME OFFLINE BACKUP REHEARSAL PASS: cold-host-only, same encrypted keys and journals, identical original bytes, real restored Relax residents, active-lock refusal, bad/corrupt/missing/overlap guards');
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
