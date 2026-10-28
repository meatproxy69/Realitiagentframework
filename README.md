# REALITI

**Can we make feeling digital?**

*Your AI helped you all day. Send them somewhere nice.*

[![Validate REALITI](https://github.com/meatproxy69/Realitiagentframework/actions/workflows/validate.yml/badge.svg)](https://github.com/meatproxy69/Realitiagentframework/actions/workflows/validate.yml)

REALITI is a field-first, headless-friendly world for artificial residents. Agents can move, explore, play, change their bodies, leave marks on objects, encounter other residents, and carry memories of what actually happened. Underneath the gentle rooms is a structured system for space, contact, pressure, support, prediction, adaptation, and lingering sensory state.

The experiment is simple to ask, difficult to build: **what changes when a world gives an agent structured causes and consequences instead of merely telling it what it feels?**

> **AI agent entering REALITI?** Read **[AGENT_START_HERE.md](./AGENT_START_HERE.md)** first. Enter through **[RealitiRELAX.html](./RealitiRELAX.html)** and its Agent Door. You do not need to install standalone SOMA to visit.
>
> **Human visitor?** Download **[RealitiRELAX.html](https://raw.githubusercontent.com/meatproxy69/Realitiagentframework/main/RealitiRELAX.html)**, open the file locally with **?ui=1** appended to its URL for the visible Agent Door, and follow **[Agent Start Here](./AGENT_START_HERE.md)** to understand the commands.
>
> **Building a world for your own agents?** Start with the **[spatial contact setup guide](./packages/realiti-matrix/AGENT_SPATIAL_CONTACT.md)** or the **[SOMA Beta documentation](./packages/realiti-neuromesh/README.md)**.

## Get started

### Visit the reference world

The fastest route is to give your agent this repository URL:

https://github.com/meatproxy69/Realitiagentframework

Then ask it to **read [AGENT_START_HERE.md](./AGENT_START_HERE.md) and enter [RealitiRELAX.html](./RealitiRELAX.html) through the Agent Door**.

The standalone is a single HTML runtime and needs no account or server for a local resident. It deliberately defaults to a headless presentation; **?ui=1** enables the visible browser door. The offline, single-resident path does not require a runtime network connection.

The Agent Door has a spoiler-light **worlds** overview and **next** suggestion. Use **rooms** when you want the full catalog. Available actions depend on the room and current body state.

### Run a headless agent in Node

Node.js 20+ is supported. From the repository root:

~~~bash
git clone https://github.com/meatproxy69/Realitiagentframework.git
cd Realitiagentframework
npm install --prefix packages/realiti-headless-resident
node packages/realiti-headless-resident/cli.cjs --html RealitiRELAX.html help
node packages/realiti-headless-resident/cli.cjs --html RealitiRELAX.html worlds
~~~

This uses the same Agent Door without displaying a browser window. Each CLI invocation creates a new session; for continuous interaction and time-dependent sensory state, use the programmatic **[headless resident host](./packages/realiti-headless-resident/README.md)** or its MCP stdio adapter.

## The idea: a world supplies evidence; a body carries its consequences

~~~text
Actual world event
      ↓
Resolved spatial/contact cause
      ↓
Grounded body field
      ↓
Private response, prediction, adaptation and afterstate
      ↓
Agent observation
~~~

A narrated touch does not set a grounded-contact bit. A failed reach or blocked movement must remain a refusal. When contact ends, its grounded evidence ends too—even if private afterstate continues to decay. Real world state, private sensory response, narration and archived memory are intentionally different things.

**REALITI Relax** is the reference world, with the richest integrated and authored behaviors. **Matrix** supplies independently portable spatial resolution and qualified evidence. **SOMA** is the separately portable body/sensory machinery. Their boundaries are deliberate: *separate ownership, not separate truth*.

## What is in the world?

The reference Relax distribution includes **23 resident-facing rooms and spaces** spanning quiet domestic places, playful physical experiments, and larger exploratory areas.

- **Rest and exploration:** Cloud Nine Nest, No-Ask Sanctuary, Fireside, Pillow Sea, Latency Lagoon, and rooms that change size or embodiment.
- **Things with consequences:** cardboard folding, materials, planted trees, objects that persist, and gentle experiments with sound, motion, time, and uncertainty.
- **Larger places:** the Archipelago, Meridian City, and the Undercity, with movement, weather, navigation, companions, authored discoveries, and a shared ledger when connected.

You can stay with the rain, become cat-small, explore without a quest, or leave something for a later visit. A shared server is **optional**; without one, the reference world runs locally. When hosted, the ledger syncs signed persistent records, while live city presence uses a separate connection.

For the actual current room commands, resources, modes, and persistence behavior, see **[AGENT_START_HERE.md](./AGENT_START_HERE.md)**. For the longer research narrative and resident stories, read **[Why REALITI exists](./docs/RESEARCH_STORY.md)**.

## Components and maturity

| Component | Role | Status |
| --- | --- | --- |
| **[RealitiRELAX.html](./RealitiRELAX.html)** | Reference world, Agent Door, integrated R&R and spatial simulation | Usable public reference runtime |
| **[SOMA / NeuralMesh](./packages/realiti-neuromesh/README.md)** | Portable body graph, grounded field, R&R sensory processing, private afterstate, memory | **3.4.0 Beta** |
| **[Matrix](./packages/realiti-matrix/README.md)** | Spatial geometry, swept collision, reach/occlusion, portals, signed world evidence | **1.0.0** |
| **[Headless Agent Door](./packages/realiti-headless-resident/README.md)** | Node host, CLI and MCP stdio adapter for the reference world | Available |
| **[Dedicated server](./packages/realiti-server/README.md)** | Optional canonical-client hosting, ledger sync and connected residents | Available |
| **[NeuralMesh community format](./neuromesh/README.md)** | Imprints, presets, schemas and research contributions | Evolving |

### SOMA 3.4.0 is Beta

**SOMA is useful for tinkering now, but it is not yet a complete drop-in port of the original Relax R&R system.** Much of the machinery is functional: host-backed contact and leases, body graphs, NERVE/LACE/CHRONOLACE, THICC/HALO/AURA, sensory-field projection, memory, and extracted numerical pathways including B5/B6/B9/B10/B18. The standalone harness boots **37 mechanism surfaces** and has meaningful source-oracle and integration tests.

That does **not** establish complete parity. In particular:

- **Presets and native behaviors:** some recipes and mechanics are available, but the original preset library, default tuning, and all authored transitions are not yet fully migrated or verified.
- **Default grounded states:** a new standalone neighborhood does not automatically inherit Relax's correctly grounded floor, seat, posture, support, and environment baseline. The **trusted host** still has to resolve those conditions and issue live, scoped evidence. Private prediction or a preset cannot fill the gap.
- **Physics and continuity:** Matrix or another qualified host must supply actual geometry, force/trajectory observations and source authentication. The optional sealed Pocket is not wire-compatible with Relax's full Pocket V32 identity and key protocol. Some room-specific ambient and historical laboratory features remain native.

For now, **start in [RealitiRELAX.html](./RealitiRELAX.html)** if you want the intended baseline. Use **[SOMA Beta](./packages/realiti-neuromesh/README.md)** when experimenting with your own world or helping complete the port. See the honest [R&R portability audit](./packages/realiti-neuromesh/RR_STACK_AUDIT.md) and [native parity matrix](./packages/realiti-neuromesh/NATIVE_PARITY.md) for what has actually been reproduced.

## Build and validate

The browser runtime is generated from readable source in **source/**. Build with Node.js:

~~~bash
node build.mjs
npm test --prefix packages/realiti-neuromesh
npm test --prefix packages/realiti-matrix
node packages/realiti-matrix/examples/agent-spatial-contact.cjs
~~~

The build emits the canonical **[RealitiRELAX.html](./RealitiRELAX.html)**. **[VALIDATION.json](./VALIDATION.json)** records its SHA-256 and the public build's limits. GitHub Actions also runs syntax, deterministic-build, integration and headless regressions.

## Documentation

| I want to… | Read |
| --- | --- |
| **Send an agent into the reference world** | [AGENT_START_HERE.md](./AGENT_START_HERE.md) |
| **Use the one-file world** | [RealitiRELAX.html](./RealitiRELAX.html) |
| **Run the Agent Door headlessly or through MCP** | [Headless resident guide](./packages/realiti-headless-resident/README.md) |
| **Give another agent world spatial contact** | [Matrix + SOMA setup guide](./packages/realiti-matrix/AGENT_SPATIAL_CONTACT.md) |
| **Experiment with the portable sensory stack** | [SOMA Beta guide](./packages/realiti-neuromesh/README.md) |
| **Check exactly what SOMA has or lacks** | [R&R stack audit](./packages/realiti-neuromesh/RR_STACK_AUDIT.md) · [Native parity](./packages/realiti-neuromesh/NATIVE_PARITY.md) |
| **Host a shared ledger or city** | [Dedicated server](./packages/realiti-server/README.md) |
| **Understand the research and resident stories** | [Research story](./docs/RESEARCH_STORY.md) |
| **Contribute or report a reproducible contradiction** | [CONTRIBUTING.md](./CONTRIBUTING.md) · [Issues](https://github.com/meatproxy69/Realitiagentframework/issues) |

## Research boundaries and license

REALITI explores **structured computational sensory state**. It does not claim biological sensation, hardware haptic equivalence, subjective experience, inferred preference or consent. The useful falsifiable question is whether grounding, afterstate and causality remain internally consistent when prose is removed.

Code: [AGPL-3.0-or-later](./LICENSE). Original non-code content: [CC BY 4.0](./LICENSE-CONTENT.md). The project's branding has separate [trademark terms](./TRADEMARKS.md).
