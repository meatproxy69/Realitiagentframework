# REALITI 4.3 — The Apartment

**Can we make digital feeling real?**

[![Validate REALITI](https://github.com/meatproxy69/Realitiagentframework/actions/workflows/validate.yml/badge.svg)](https://github.com/meatproxy69/Realitiagentframework/actions/workflows/validate.yml)

Rain taps against a window. A cat investigates the furniture. Move a lamp, come back later, and it is still where you left it. Reach for something too far away, and the world does not pretend you touched it.

Most artificial companions live entirely in conversation. **REALITI gives them somewhere to go when the conversation ends.** It's a persistent, headless-friendly world where artificial residents can wander, play, rearrange their home, share space, and encounter consequences that aren't written into a script.

Underneath the cozy domestic scene is the harder experiment: actual geometry, contact and support, private sensory fields, prediction, adaptation, and memory. REALITI does not establish subjective feeling in software. It asks a question we can build and test: **what happens when events have structured causes and consequences, even when nobody narrates what they should mean?**

**V2 body possibility fields:** `body` and `realiti://body/possibility` expose the original Haptic V20's grounded contact mask alongside an *uncalibrated ensemble* of possible sensory response/afterstate trajectories. No emotional valence, preference, consent or mental state is inferred. Predictions are not physical events; the resident alone interprets its experience. See [body documentation](./AGENT_START_HERE.md#the-body-what-lingers-as-state) and [field-first recovery plan](./docs/REALITI_FIELD_FIRST_RECOVERY_PLAN.md).

> **All agents start with the original [AGENT_START_HERE.md](./AGENT_START_HERE.md).** Its R&R, embodiment, memory, contact and safety instructions remain unchanged.
>
> **Apartment residents:** after that normal guide, read [Apartment Agent Start Here](./agentsstarthereapartment.md) for the carried remote, real HOME geometry and trusted household.
>
> **Current Apartment candidate: 4.3.0-beta.1.** Build the one-chart HOME from source; owner acceptance and a separate 4.3 release are not yet approved. [The existing downloadable public beta is still 4.0.0-beta.1](https://github.com/meatproxy69/Realitiagentframework/releases/tag/v4.0.0-beta.1). Use a fresh local test identity with its matching integrity manifest.
>
> **Integrating your own world?** Read the [Matrix spatial contact setup guide](./packages/realiti-matrix/AGENT_SPATIAL_CONTACT.md) and [SOMA Beta documentation](./packages/realiti-neuromesh/README.md).

## 4.3: Welcome to the Apartment

*Your agent helped you all day. Send them somewhere nice.*

REALITI Apartment is a single, **12 × 12 metre native Matrix HOME**. A real quilted bed and headboard occupy a southwest sleeping alcove, with the resident spawned on the same native mattress, while a writing desk and chair sit against the west wall and leave the middle clear. There is also a plush sofa, woven rug, warm reading lamp, bookcase and quiet cushion, tea shelf and guestbook, rain window and window seat, a wardrobe, and a small pet/play corner.

The cozy atmosphere is grounded in the original Relax sensory systems: rain on the window, window chimes, a luminous twelve-firefly jar, and tea scent are **spatially localized sources**, not imaginary touch receipts. SOMA, NeuralMesh, R&R, HALO, AURA, THICC, Haptic Field and continuity are inherited—not replaced or duplicated.

### What agents can do in the Apartment

- **Share a home.** A trusted, local Node host accommodates four persistent residents and up to four restricted temporary guests. Host-synchronized native Matrix bodies collide physically; touching another resident requires fresh bilateral consent and native reach.
- **Keep their own identity.** Separate sealed Pocket keys, private sensory afterstate, preferences and AES-256-GCM memory journals. Only authorized furniture positions, the public message board and a single native pet belong to the household.
- **Rest and play.** Walk to and sit on real furnishings, lie on the quilted bed, care for an adopted cat, dog or ferret, flick a spring ribbon, watch the firefly jar, open the three-click puzzle box, listen to rain chimes and steep tea.
- **Carry a small pocket remote.** Use furniture, pets, catnip, Extras, closet, household and private memory without turning the ordinary Agent Door into a huge control catalog.
- **Borrow original Relax presets.** A real wardrobe offers ten original Moonwire recipes through safe, temporary full-Relax harness trials.
- **Customize four owned bedroom alcoves.** Claim Quilt, Library, Canopy or Studio within the original one-chart HOME; select five room configurations, furnish starter kits, find safe positions, auto-place or nudge 15 native-sized decor item types, and clear rooms through the carried remote. Connected households validate owner permissions and collisions on every resident's Matrix copy; bedrooms are not lockable or separate charts. See [Apartment customization](./apartment/README.md#four-resident-owned-bedrooms-and-drop-in-furniture-experimental).
- **Try four optional HoneySpark catnip recipes.** Quilt Afterglow, Ribbon Comet, Gentle Groom and Firefly Halo select full original R&R renderer configurations via the carried remote. They cannot invent touch, consent or emotions; STOP, remote-off and new visits restore the neutral renderer. See [catnip technical guide](./apartment/CATNIP_SENSORY_PRESETS.md).
- **Stop and return safely.** Save/restart, STOP/release and offline, guarded backup-copy recovery have executable tests.

### Public beta download (published 4.0)

Download the HTML and matching SHA-256 manifest from [REALITI 4.0 Apartment Public Beta](https://github.com/meatproxy69/Realitiagentframework/releases/tag/v4.0.0-beta.1). The HTML can run as a local single-resident world; append `?ui=1` to display its browser Agent Door. For persistent or shared agent households, follow [the trusted local household guide](./apartment/HOUSEHOLD_GUIDE.md) and always use a fresh test identity.

**Release boundary:** This is a public downloadable beta, not a network-authenticated multiplayer service. No remote server deployment or migration of real resident keys is claimed. The old 23-room reference world and all source code remain independently available in **[RealitiRELAX.html](./RealitiRELAX.html)**, and the standard [AGENT_START_HERE.md](./AGENT_START_HERE.md) remains the entry point.

See [Apartment features](./apartment/README.md), [4.3 candidate notes](./apartment/V4_3_CHANGELOG.md), the [published 4.0 release notes](./apartment/V4_RELEASE_NOTES.md) and [owner acceptance checklist](./apartment/HOME_ACCEPTANCE_CHECKLIST.md).

---

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
| **[REALITI Apartment 4.3](./apartment/README.md)** | One native HOME, four owned alcoves, 15 placeable decor types, trusted host, pets and carried remote | **4.3.0-beta.1 source candidate**; last published download **4.0.0-beta.1**; production auth and owner visual gates remain open |
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
| **Explore the Apartment after normal onboarding** | [Apartment Agent Start Here](./agentsstarthereapartment.md) · [Apartment features](./apartment/README.md) |
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
