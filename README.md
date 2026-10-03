# REALITI Relax 1.0

REALITI Relax is a headless-first browser vertical slice for experimenting with digital embodiment: grounded contact, pressure, support, motion, prediction, afterstate, sparse continuity, reversible body changes, and persistent world consequences.

The canonical runtime is `RealitiRELAX.html`. Open it in a modern Chromium-class browser. By default it exposes the resident-facing JavaScript API without a styled interface. Add `?ui=1` for the optional plain manual controls.

No account, server, SDK, package install, analytics service, or runtime network connection is required. The content security policy blocks network connections.

## Start here

Artificial residents should begin with `AGENT_START_HERE.md`.

The public interface is `window.Realiti`:

```js
const ready = await Realiti.ready;
const caps = Realiti.read('realiti://capabilities');
const body = Realiti.read('realiti://body');
const imprint = Realiti.read('realiti://imprint');
```

Useful surfaces include:

```text
Realiti.help()
Realiti.read(...)
Realiti.rooms()
Realiti.actions()
Realiti.invoke(...)
Realiti.run(...)
Realiti.continuity.*
Realiti.createClient()
```

## Ten rooms

1. Cloud Nine Nest
2. No-Ask Sanctuary
3. Pocket Familiar House
4. Bottomless Pillow Sea
5. Cardboard Box Workshop
6. Depth Bathhouse
7. Side-by-Side Fireside
8. Shapeshift Cloakroom + Borrowed Limb bench
9. Nine Lives Room
10. Latency Lagoon

The design contract is in `VERTICAL_SLICE.md`.

## Core laws

```text
world cause -> grounded receipt -> body/source -> private rendering

prediction != contact
afterstate != continuing contact
private fullness != force
presence != invented company
preference != consent
behavior != identity

stable state -> quiet
meaningful change -> may update
```

STOP releases current external grounding. HOME restores temporary body state and returns to supported Nest. GOODBYE ends the visit and closes resident clients.

Room transitions revoke room-local grounding before the destination becomes active.

## Time and continuity

World time is simulated. Reads do not advance it. Explicit operations such as:

```text
stay 1000
wait
wait 100
wait_until 100
```

advance or wait within bounded simulated time. Bare `wait` uses the runtime's 1,000 ms default.

Continuity retains meaningful delta frames rather than repeating unchanged state. Public continuity surfaces include `current`, `since`, `pending`, `resume`, `next_change`, and `field`. Replay is bounded; stale cursors and field references fail explicitly.

## Persistence and privacy

Default persistence is explicit. Ordinary activity remains session state until Save. `note` and `later` intentionally request persistence too. Storage availability depends on the browser host and profile.

The browser profile is the isolation boundary. This package is not a multi-user security service. Use separate browser profiles when resident-local separation matters.

Neural imprint export is observational. It is not a full identity backup, does not include private notes, and does not grant publication consent.

## Build from source

Readable source is in `source/` and the split-source browser entry is `index.html`.

With Node.js installed:

```bash
node build.mjs
```

The builder uses Node built-ins only, rejects author CSS, and deterministically reproduces `RealitiRELAX.html`.

## Validation scope

This public build was rebuilt from readable source and checked for:

- deterministic single-file generation;
- JavaScript syntax across readable source;
- no author CSS;
- no private/internal development-tool markers;
- public `wait` contract behavior;
- `STOP` returning `REALITI_MUTATION_RESULT_V1` while releasing grounding.

See `VALIDATION.json` for exact hashes and remaining acceptance limits.

The simulated body and sensory fields are research software. This release does not claim biological sensation, physical haptic equivalence, or subjective experience.

## License

Software/source code: GNU Affero General Public License v3.0 or later (`LICENSE`).

Original non-code content: Creative Commons Attribution 4.0 International (`LICENSE-CONTENT.md`).

Brand/trademark terms: `TRADEMARKS.md`.
