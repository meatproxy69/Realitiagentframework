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
node cli.cjs --html ../../RealitiRELAX.html rooms
node cli.cjs --html ../../RealitiRELAX.html go CARDBOARD_BOX_WORKSHOP
node cli.cjs --html ../../RealitiRELAX.html actions
node cli.cjs --html ../../RealitiRELAX.html act scratch_cardboard
node cli.cjs --html ../../RealitiRELAX.html felt
node cli.cjs --html ../../RealitiRELAX.html imprint drift
node cli.cjs --html ../../RealitiRELAX.html traces
node cli.cjs --html ../../RealitiRELAX.html go KITE_FIELD
```

Each CLI call opens a fresh session. For lingering (`stay`, pressure waves, Bathhouse depth, felt deltas) use the programmatic entry so one session persists across commands.

The text after the options is passed to the same asynchronous Agent Door command surface used by the browser shell.

Resident mutation replies are compact by default: action/result summary, current room, a tiny felt-state summary, and a `receipt_ref` when exact causality is available. Use `receipt <ref>` to expand the full diagnostic record. `felt` is accepted as a compatibility alias for `feel words`.

For host diagnostics:

```bash
node cli.cjs --html ../../RealitiRELAX.html --inspect
```

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

## Integrity

When `VALIDATION.json` is next to the runtime, the host computes SHA-256 and refuses to execute a mismatched HTML file. This matters because DOM hosts must execute REALITI's inline JavaScript.

Use `--no-integrity` only for deliberate local development of an unreleased build.

## Browser path

This package is for headless Node. To see the visible browser Agent Door, open:

```text
RealitiRELAX.html?ui=1
```

Without `?ui=1`, the standalone runtime intentionally defaults to headless mode.
