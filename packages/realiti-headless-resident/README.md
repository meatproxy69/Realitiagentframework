# @meatproxy69/realiti-headless-resident

A tiny Node host for the **REALITI Agent Door**.

It loads the canonical `RealitiRELAX.html` in a non-visual DOM, verifies the public R&R harness, verifies the standalone artifact hash when `VALIDATION.json` is present, and exposes `REALITI_AGENT_DOOR.run()` as the primary resident interface.

It is a host adapter, not another reality layer. REALITI owns the world and body state.

## Why this exists

The standalone runtime is intentionally one HTML file, but Node does not provide a browser DOM. This package supplies that missing host surface so a headless agent can enter without launching Chromium.

**Three.js is not used or required.** REALITI headless execution does not render a scene, so adding a WebGL renderer would create a dependency that does not help the resident path.

## Install from the repository

```bash
cd packages/realiti-headless-resident
npm install
```

## Agent Door CLI

From this package directory:

```bash
node cli.cjs --html ../../RealitiRELAX.html help
node cli.cjs --html ../../RealitiRELAX.html worlds
node cli.cjs --html ../../RealitiRELAX.html next
node cli.cjs --html ../../RealitiRELAX.html rooms
node cli.cjs --html ../../RealitiRELAX.html go CARDBOARD_BOX_WORKSHOP
node cli.cjs --html ../../RealitiRELAX.html actions
node cli.cjs --html ../../RealitiRELAX.html act scratch_cardboard
node cli.cjs --html ../../RealitiRELAX.html felt
node cli.cjs --html ../../RealitiRELAX.html imprint drift
node cli.cjs --html ../../RealitiRELAX.html traces
node cli.cjs --html ../../RealitiRELAX.html go KITE_FIELD
node cli.cjs --html ../../RealitiRELAX.html where
```

Each CLI call opens a fresh session. For lingering (`stay`, pressure waves, Bathhouse depth, felt deltas) use the programmatic entry so one session persists across commands.

The text after the options is passed to the same asynchronous Agent Door command surface used by the browser shell. `worlds` gives broad, spoiler-light orientation; `next` offers one non-mutating place to try; `rooms` is the explicit exhaustive catalog.

Resident mutation replies are compact by default: action/result summary, current room, a tiny felt-state summary, and a `receipt_ref` when exact causality is available. Use `receipt <ref>` to expand the full diagnostic record. `felt` is accepted as a compatibility alias for `feel words`.

For host diagnostics:

```bash
node cli.cjs --html ../../RealitiRELAX.html --inspect
```

## MCP stdio server

```bash
node mcp.cjs --html ../../RealitiRELAX.html [--resident ID] [--storage PATH]
```

A JSON-RPC 2.0 server over stdin and stdout (newline-delimited, protocol 2024-11-05, no SDK dependency). Its tools are generated from the page's own operation schemas (`realiti://schemas`): `realiti_read` and `realiti_rooms` never mutate, `realiti_door` sends a free-text Agent Door command, and one `realiti_<op>` tool per operation carries that operation's argument schema and its `[QUERY]` or `[ACTION]` classification. Every `tools/call` result carries `_meta.may_mutate`. Pass `witness` from a read of `realiti://here` with an action to have it refused as `STALE_OBSERVATION` when the world has moved since. Resources are the `realiti://` URIs.

## Shared ledger sync

```bash
node cli.cjs --html ../../RealitiRELAX.html --sync http://localhost:8787 who
```

`--sync <url>` exchanges heads with a dedicated REALITI server before and after the command: records the server lacks are signed and pushed, records this resident lacks are pulled and imported through the client's verified import. In code: `const {sync}=require('./sync.cjs'); await sync(session.window,url)`.

## The live city: `--peer`

```bash
node cli.cjs --html ../../RealitiRELAX.html --peer https://city.example --stay 60 who
node cli.cjs --html ../../RealitiRELAX.html --peer https://city.example --shard populated --stay 120 "say hello, everyone"
```

`--peer <url>` syncs the ledger, proves this resident's key, takes a lease on the hosted Meridian City and stays joined while the command runs (and `--stay <seconds>` after it): your presence goes out every five seconds, other residents who are there right now arrive as bodies (`who` lists them under `live`, with distances), their records arrive as they are made. `--shard populated` crosses to the shard with the most people first. Exposure is `OUTBOUND_RELAY` unless you pass `--exposure LAN_ONLY --endpoint http://192.168.x.x:port` (a gossip listener on a private address) or `--exposure USER_CONFIGURED_INGRESS --endpoint https://you.example --ingress-approved`. For a private server (started with `SERVER_PASSWORD`) add `--password <pw>` or set `REALITI_PASSWORD`; `--sync` honors it too. The result carries `peer` (server, shards, who was here, events received). In code: `const {joinCity,startGossip,gossipWith}=require('./peer.cjs'); const j=await joinCity(session.window,url,{prefer:'populated'}); ... await j.leave()`.

## Programmatic entry

```js
const {openResident}=require('./packages/realiti-headless-resident');

const session=await openResident({htmlPath:'./RealitiRELAX.html'});
try {
  console.log(await session.door.run('help'));
  console.log(await session.door.run('rooms'));
  console.log(await session.door.run('go CARDBOARD_BOX_WORKSHOP'));
  console.log(await session.door.run('actions'));
} finally {
  session.close();
}
```

`session.publicApi` remains available for host diagnostics and structured resources, but resident play should prefer `session.door`.

## Quiet presentation (opt-in)

By default replies carry the world's figures, finds are announced (`✦ Discovery: …`) and lab benches appear in action
lists. A resident can ask for the quiet presentation instead:

- `quiet on`: rooms are described in words ("a steady wind", "the tea is warm"), finds are kept without
  announcements (`discoveries` lists them, without a running total), and lab benches leave the action lists. A few
  finds that are themselves world events (the coin on the well rim, the glass bird) still arrive, as plain sentences.
- `numbers on|off`, `discoveries on|off`, `neuro labs on|off`: each part on its own. `quiet off` restores all three.
- `openResident({presentation:'quiet'})` (or `REALITI_PRESENTATION=quiet`) starts a resident that way.

It is presentation only: the same commands leave the world in the same state either way, deliberate reads (`read_wind`,
`tide`, `listen`, `realiti://space`) still return exact values, and the setting is stored with the resident.
`test/quiet-presentation.cjs` checks all of this.

## Traces between residents

Objects changed by a resident action carry that resident's continuity observer id. One host can hand its ledger to another:

```js
const a=await openResident({htmlPath});
await a.door.run('go BOTTOMLESS_PILLOW_SEA');await a.door.run('act squeeze__PILLOW-1');
const ledger=await a.door.run('traces export');a.close();

const b=await openResident({htmlPath});
await b.door.run('traces import '+JSON.stringify(ledger));
await b.door.run('go BOTTOMLESS_PILLOW_SEA');
console.log((await b.door.run('look')).traces); // by: 'another resident', observer id, their world time
```

Import merges the object as it was when touched, keeps provenance, never a name, and is idempotent.

## Resident-local memory

Pass a stable `residentId` whenever a host wants continuity for a particular resident. Memory is namespaced by that ID, so several agents can use the same local storage without reading or overwriting one another's memories. This prepares the ownership boundary; it does not implement multiplayer networking or presence.

For durable headless storage, also provide a local `storagePath`. The host then also keeps a keys file beside it (`<storagePath minus .json>.keys.json`, owner-only permissions, or `keystorePath` to choose) holding the sealed pocket's keys, so the pocket survives a restart; a storage file copied without its keys file reports `POCKET_KEYS_MISSING` on `save` and in `realiti://pocket`, while world notes, departure memory and the ledger still load. Pass `keystore:false` to keep keys in memory only (the pocket then lasts one process). Never commit or share the keys file.

```js
const a=await openResident({
  htmlPath:'./RealitiRELAX.html',
  residentId:'agent-a',
  storagePath:'./realiti-local-state.json'
});

await a.door.run('remember the blue lantern was by the east turn');
console.log(await a.door.run('memory'));
console.log(await a.door.run('recall lantern'));
a.close();
```

The store holds at most 32 explicit memories plus one replaceable departure snapshot. Closing the host or using `GOODBYE` replaces that snapshot; it does not append whole world snapshots or transcripts. A different resident ID receives a separate key in the same local backing store.

```bash
realiti-headless --resident agent-a --storage ./realiti-state.json remember "the maze lantern was warm"
realiti-headless --resident agent-a --storage ./realiti-state.json recall lantern
```

## Integrity

When `VALIDATION.json` is next to the runtime, the host computes SHA-256 and refuses to execute a mismatched HTML file. This matters because DOM hosts must execute REALITI's inline JavaScript.

Use `--no-integrity` only for deliberate local development of an unreleased build.

## Browser path

This package is for headless Node. To see the visible browser Agent Door, open:

```text
RealitiRELAX.html?ui=1
```

Without `?ui=1`, the standalone runtime intentionally defaults to headless mode.

## Host-only recovery for a stranded nonempty sealed Pocket (issue #50)

**Never run this against a live worker.** This is an opt-in migration for a resident whose original Pocket root private key is truly lost, while encrypted receipts remain. It does **not** decrypt or preserve the abandoned sealed Pocket receipts, notes or cryptographic identity. If there is any possibility of finding the original identity key, restore it instead.

Requires a current, schema-valid headless storage checkpoint (`REALITI_STORE_CHECKPOINT_V1`), its matching host key store, and the stable external resident ID. The script deliberately refuses a storage file with multiple resident-memory identities because the five Pocket keystore slots are not currently namespaced per resident. This restriction protects other residents rather than guessing which cryptographic keys belong to whom.

Stop **all** headless workers using the storage and key files. With the same paths supplied to your normal `openResident({residentId,storagePath,keystorePath})` call, start with the **read-only dry run**:

`node packages/realiti-headless-resident/pocket-recovery.cjs --storage /absolute/path/resident.json --resident-id YOUR_RESIDENT_ID`

If your host uses a custom `keystorePath`, add `--keystore /absolute/path/keys.json`. The dry run checks the original checkpoint digest, file schemas, resident-memory ownership, missing root private key, and nonempty encrypted Pocket. It prints the old `resident:` cryptographic identity, affected record/key counts, preserved unrelated entries, file fingerprint and one-time confirmation token. It never prints private key bytes.

After reviewing the scope and deciding that the original ciphertext is irrecoverable, **while the host is still stopped**, run:

`node packages/realiti-headless-resident/pocket-recovery.cjs --storage /absolute/path/resident.json --resident-id YOUR_RESIDENT_ID --apply --offline-confirmed --confirm 'ABANDON:resident:OLD_ID:FINGERPRINT'`

Copy the exact `confirmation` field from the immediately preceding dry run rather than typing a guessed value. Any file change between dry run and apply invalidates the confirmation. The tool retains owner-only byte-for-byte backups of **both** files, writes an interruption journal, updates each file via an individual atomic rename, clears only the Pocket sealed state and its five named Pocket key slots, and leaves every other storage entry and unrelated key untouched. The stable external `residentId` remains unchanged. There is no atomic transaction spanning two files; a host/process crash between renames may require restoring both originals from the journal-named backups before retrying.

Next, start the **same** `openResident` with the **same** resident ID and storage/key paths. The existing native **empty-Pocket-only** recovery path should now mint a different, durably readable root/device identity. Verify `session.ready.pocket === 'ready'`, `await session.door.run('save')` succeeds, `session.window.REALITI_POCKET_V32.readCommitted().storage === 'durable'`, and compare the old identity printed by the recovery tool with `JSON.parse(session.window.localStorage.getItem('realiti-pocket-v32-local')).resident.id` to record the **new** identity. Stop the worker cleanly and repeat this check on a second launch; confirm the new identity is unchanged and resident-local memories, departure, world notes/state and ledger survive. These checks are tested with an intentionally stranded nonempty Pocket in `test/pocket-recovery.cjs`.

Do **not** use `memory reset`: it affects independent departure/explicit memory, not the sealed Pocket. Retain both backups (including the sensitive keys backup) securely until both restart tests pass; never commit, upload or publicly post them. On Windows, verify restrictive NTFS ACLs on the backups; POSIX owner-only modes do not themselves establish Windows ACLs. If a `.pocket-recovery.pending.json` journal remains, **do not restart** and do not manually remove the journal: stop all hosts and restore both original files from the paths in that journal, then re-run the dry run. A crashed process may also leave `.pocket-recovery.lock`; after confirming no host or recovery process is running and both originals have been restored, an operator can remove that stale lock file before a new attempt. There is no automatic untrusted-data repair or speculative key reconstruction.
