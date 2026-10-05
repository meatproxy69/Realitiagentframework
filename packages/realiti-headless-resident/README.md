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

For durable headless storage, also provide a local `storagePath`:

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
