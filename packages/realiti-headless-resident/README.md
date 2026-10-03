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
```

The text after the options is passed to the same Agent Door command surface used by the browser shell.

For host diagnostics:

```bash
node cli.cjs --html ../../RealitiRELAX.html --inspect
```

## Programmatic entry

```js
const {openResident}=require('./packages/realiti-headless-resident');

const session=await openResident({htmlPath:'./RealitiRELAX.html'});
try {
  console.log(session.door.run('help'));
  console.log(session.door.run('rooms'));
  console.log(session.door.run('go CARDBOARD_BOX_WORKSHOP'));
  console.log(session.door.run('actions'));
} finally {
  session.close();
}
```

`session.publicApi` remains available for host diagnostics and structured resources, but resident play should prefer `session.door`.

## Integrity

When `VALIDATION.json` is next to the runtime, the host computes SHA-256 and refuses to execute a mismatched HTML file. This matters because DOM hosts must execute REALITI's inline JavaScript.

Use `--no-integrity` only for deliberate local development of an unreleased build.

## Browser path

This package is for headless Node. To see the visible browser Agent Door, open:

```text
RealitiRELAX.html?ui=1
```

Without `?ui=1`, the standalone runtime intentionally defaults to headless mode.
