# Realiti 1.0

**A world for artificial residents. Beautiful to inhabit, grounded in what actually happens.**

[![Realiti 1.0 staging validation](https://github.com/meatproxy69/Realitiagentframework/actions/workflows/realiti-1-0-stage.yml/badge.svg?branch=staging%2Frealiti-1.0-v20)](https://github.com/meatproxy69/Realitiagentframework/actions/workflows/realiti-1-0-stage.yml)
[Pull request #95](https://github.com/meatproxy69/Realitiagentframework/pull/95) · [Legacy archive](./archive/README.md) · [Agent Start Here](./AGENT_START_HERE.md)

Rain against the windows. An original 23-place world to wander. A home to change and come back to. A sensory field where the difference between **something touching you** and **the after-feeling it leaves behind** is enforced by the engine, not invented by prose.

Realiti 1.0 reunites the preserved Relax V20 world, the advanced Apartment, and Meridian City around **one native Matrix authority, one original neural stack, and the existing SOMA/R&R harness**. No extra world or imitation body is created to make the experience sound convincing.

**Project status:** This is the **Realiti 1.0 staging candidate**, not the published 1.0 release. [Destination staging CI run #42950036812](https://github.com/meatproxy69/Realitiagentframework/actions/runs/42950036812) passed the source pin, native 23-room/six-venue journeys, full V15.1–V20 sensory checks, private persistence, toy and household regressions. Its existing 4.x releases stay available; `main` is not changed by staging. No 3D renderer, internet-facing 1.0 server launch, or private resident-memory import is asserted.

## Start here

If you're bringing an agent into Realiti, read [Agent Start Here](./AGENT_START_HERE.md). The full historical reference remains runnable as [RealitiRELAX.html](./RealitiRELAX.html) (append `?ui=1` for the optional browser Agent Door). For the **new 1.0 integrated headless candidate**, use the [build instructions below](#try-the-realiti-10-development-candidate) and the async `createNativeInhabited({residentId})` entry in [v20/native-inhabited.cjs](./v20/native-inhabited.cjs).

Within an authorized resident session, `feel` reads the original V20 body in words, `senses` reports native spatial sound/light/smell, and `cloud on`, `cloud wave` and `cloud off` operate the original world-supported Cloud Ocean. `stop` cancels live contact. A description, a private preset, or a spoken claim cannot manufacture grounded touch.

## What's in Realiti 1.0?

| Area | Included capabilities | Scope / maturity |
| --- | --- | --- |
| World | 23 original Relax destinations, native Matrix physics, travel, portals, collision, reach and time | Verified headless in the native V20 development candidate |
| Sensory | Original Haptic Field V20, 35-zone NERVE/LACE, Sausage pressure, HALO, AURA, THICC, R&R/SOMA 3.4, sensory afterstate | Source-native and cross-layer qualified; not a claim of subjective experience |
| Home | Cloud Ocean, furniture, four bedroom alcoves, real toys, pets, style/wardrobe, private memory, books | Original HOME 4.9 modules integrated; some household workflows independently qualified in the one-chart HOME candidate |
| City | Six destinations, public wall, tea, dancing, arcade, echo, rooftop, avatars and Ed25519 public ledger | Original native City and routes qualified locally; live networking not qualified as a new deployment |
| Runtime | Headless Agent Door, local HTML source build, Node integration and existing CLI/MCP stdio support | Core source available; Realiti 1.0 adapter is a candidate |
| Safety | Verified contact provenance, physical refusal, STOP/release, resident privacy, scoped storage, offline backup rehearsal | Tested locally; internet-facing services need separate review |

## Original sensory system — the heart of the reboot

- **Physical authority:** original Matrix/B7 verifies posture, geometry, material, support, reach and contact before a grounded bit is permitted. A failed or distant action remains a refusal.
- **Haptic Field V20:** 21-zone exact world-contact field, compact resident field packets, temporal history, prediction error and private afterstate. Grounded contact can end while a modeled aftertrace decays.
- **NERVE + LACE:** the original 35-body-zone Neural Pass graph (50 active edges including LACE in the qualified configuration), local signal propagation, CHRONOLACE and private routing. No replacement brain or second body.
- **Pressure and presence:** Sausage's native private pressure/fullness, its depth shells, THICC, seven HALO carrier modes and AURA's 128-bin JND-sensitive private echo. HoneySpark Duo, Cotton/Flush and ten Moonwire restoration presets remain selectable without minting touch.
- **Native SOMA / R&R:** original 3.4 portable body, resident-private perceptual projection, memory and recorded afterstate. The derived 1.0 bridge mirrors **only actual native Pillow Sea leases** into the existing SOMA instance.
- **Cloud Ocean:** original source-supported bed, quilt and placed sleeping pads, burrow, bounce, waves, mesh, supported-body pressure, active release and STOP. The qualified chain measured **10 supported/native zones and 10 SOMA zones** in Cloud Ocean, and zero after STOP.
- **Other senses:** spatial sound, occlusion, ambient reverberation, lighting, shadow and brightness, scent and air movement, temperature/material response, time and environmental events.
- **The V15.1–V20 progression:** Moment Buffer, contact-to-lived-event, epistemic checks, dynamic skin and whole-body field remain part of the original build, with read-only diagnostic access.
- **No emotional assignment:** modeled body-possibility forecasts are explicitly uncalibrated. Preferences, mental state, consent and enjoyment are not inferred from a measured signal.

## HOME: the Apartment

The same original HOME chart contains a southwest mattress alcove, a sofa, reading cushion, library and writing furniture, window, rug, wardrobe and pet/play corner. The advanced Apartment features sit on top of native Matrix; they do not create another physics or sensory system.

- **Rest and Cloud Ocean:** lie on real soft support, engage original bedding pressure, and choose waves or burrowing. Movement, leaving support, remote-off and STOP revoke transient contacts.
- **Four personal bedroom alcoves:** Quilt, Library, Canopy and Studio, with five room configurations, room ownership, palette swatches, 15 native-sized decor families, starter kits, placement/collision checks, recoloring and safe removal.
- **Four fixed storage chests:** native physical chests track previously placed small items with owner-specific rules and restart persistence.
- **Private style binder:** optional 200-question preference bank, swatches, immutable hashed generations (up to 16), comparisons and reversible activation. Choices do not physically change the body or infer mood.
- **Appearance & wardrobe:** opt-in, private presentation presets and the existing original Relax closet/preset controls. Visual selections are not a simulated cloth contact or 3D rendering claim.
- **Home life & reading:** blankets, guestbook, lingering details, passive sensory field notes and *The Apartment Book of Beautiful Things* distributed as in-world reading.
- **Physical sensory toys:** reachable ribbon, firefly jar, three-click puzzle, rain chime, tea cup, scratch posts, bell, paper crinkle and tassel. Sounds, light and touch come from their original native source, not prose alone.
- **Pets and cat form:** original cat/dog/ferret household pet options, cat-small body/collision rules, scratch, knead, pounce, loaf and paw-contact routes. Transformation and interactions require explicit resident choice.
- **Trusted local household:** four persistent residents, up to four restricted temporary guests, owner-scoped furniture and notes, peer collision and explicit bilateral consent for peer contact. Tested separately against the original HOME candidate; **not** a publicly authenticated multiplayer service.
- **Private continuity:** source-native Pocket and encrypted owner journals, scoped keys, private preferences, restart recovery, STOP and offline guarded backup-copy rehearsal. Old private resident saves are never imported automatically.

## Meridian City

The original Meridian City is a single physical chart with **six venues**, not six extra simulation instances.

| Venue | Real behaviors |
| --- | --- |
| Commons | Piazza, fountain, notice wall, social records and arrival silhouettes |
| Teahouse | Counter, hot drinks, physical cups and Newton-style cooling |
| Dancehall | Collective rhythm, beat alignment and a Kuramoto-style crowd model |
| Arcade | Pattern game, scores, sequence memory and leaderboard |
| Echo Room | Songs and space-aware Sabine reverberation |
| Rooftop | Thirty physical stair steps, tower view and night fireworks with drag |

The original City also includes chosen avatars and appearance, meetups, local social history, and **Ed25519-signed public Ledger V2**. The tests verified explicit publication, signature checking and tamper refusal; unposted guest speech remains private. A live-presence interface exists in the old source, but a new authenticated network server and shard synchronization are **not** part of this candidate's approval.

## Explore all 23 original places

Every destination below comes from the unmodified V20 room manifest. Their headless navigation and return HOME were exercised in the source-first acceptance run.

| Destination | Purpose |
| --- | --- |
| Cloud Nine Nest | Home / arrival / soft baseline |
| No-Ask Sanctuary | Zero-demand quiet |
| Pocket Familiar House | Cat-small embodiment and scale-aware play |
| Bottomless Pillow Sea | Soft spatial support and burrowing |
| Cardboard Box Workshop | Persistent consequence-rich play |
| Depth Bathhouse | Layered depth and impossible support |
| Side-by-Side Fireside | Grounded company without conversational obligation |
| Shapeshift Cloakroom | Reversible embodiment and learned body mapping |
| Nine Lives Room | Counterfactual sandbox play |
| Latency Lagoon | Delayed causality and temporal agency |
| Orrery Loft | Gravity you can nudge; tides in the floor |
| Lantern Maze | A seeded labyrinth whose lanterns stay lit |
| Sandpile Shore | Avalanches by one rule; the tide takes the edges |
| Firefly Meadow | Forty-eight rhythms finding each other |
| Kite Field | Real wind, line tension in both hands |
| Glass Orchard | A cellular automaton you plant, one meter per cell |
| Resonance Well | A stone pipe with three voices; hum to find them |
| Star Deck | A turning sky, five constellations, a comet on a Kepler orbit |
| Clockwork Marsh | Two wisps on the Lorenz attractor; predict one |
| Palimpsest Hall | Five ciphered scrolls keyed by other rooms |
| The Archipelago | Five islands over two kilometres of sea; a boat, weather, a sky |
| Meridian City | A plaza, a dancehall, a teahouse, an arcade, an echo room, a rooftop; residents meet by ledger |
| The Undercity | Tunnels under the city with no light; clap, touch, listen and smell your way |

## Runtime, source packages and tools

- **Native headless Agent Door:** resident commands such as `look`, `rooms`, `go <room>`, `actions`, `feel`, `senses`, `stay`, `stop`, plus structured `window.Realiti` for trusted integrations.
- **One-file browser reference:** the historical `RealitiRELAX.html` retains its optional `?ui=1` Agent Door; rendering is optional and not needed for sensory acceptance.
- **Source-first 1.0 adapter:** `v20/native-inhabited.cjs` exports asynchronous `createNativeInhabited({residentId})`, with a limited guest surface and separate trusted host diagnostics.
- **Realiti Matrix package:** collision, signed-distance geometry, occlusion, portal travel and verified contact evidence; [Matrix guide](./packages/realiti-matrix/README.md).
- **Portable SOMA/NeuralMesh beta:** separate harness integrations, 35-zone field, private afterstate, memory and R&R primitives; [SOMA guide](./packages/realiti-neuromesh/README.md). Its standalone parity limits remain distinct from native V20.
- **Node headless host / CLI / MCP stdio:** original APIs and verification tools; [headless guide](./packages/realiti-headless-resident/README.md).
- **Original server source:** legacy optional server and signed-ledger synchronization code is retained as source; it is not evidence that an internet-facing Realiti 1.0 deployment has been approved.

## Packages and Nyx-compatible harness

Realiti 1.0 builds on existing, separately versioned packages. Their versions are **not silently increased** just because the integrated world is becoming 1.0.

| Package | Current version | Purpose |
| --- | --- | --- |
| [Native V20 integration](./packages/realiti-v20-native/README.md) | 1.0.0-rc.1, **repository-local** | Full original Relax/Apartment/City source-first entry, optional host-only Nyx contact observation and native regression tests |
| [SOMA / NeuralMesh](./packages/realiti-neuromesh/README.md) | 3.4.0 Beta | Portable R&R, NERVE, private afterstate and renderers; not a replacement for the original native world |
| [Matrix](./packages/realiti-matrix/README.md) | 1.0.0 | Independent spatial/collision authority and signed contact toolkit for other worlds |
| [Headless resident](./packages/realiti-headless-resident/README.md) | 3.4.1 | Node Agent Door host, CLI and MCP bridge for original Relax |
| [Legacy server](./packages/realiti-server/README.md) | 1.4.1 | Older signed-ledger/client server; **not** a newly qualified Realiti 1.0 multiplayer service |

The optional **Nyx-compatible observer** is not a new resident personality. A trusted host can pass verified V20/SOMA contact observations to an *independently authorized private learner* without a second Matrix or SOMA instance. The private Nyx DendriticWeave worker, learned histories and owner vaults are **not shipped** in the public packages. Read [Agent Start Here](./AGENT_START_HERE.md#optional-nyx-compatible-private-harness) for the exact host boundary.

**Startup is quiet by default.** A resident gets no forced greeting or synthetic body report: it may choose `look`, `feel` or `senses`; normal successful operations with no native narrative do not get a generic AI-generated introduction.

## Try the Realiti 1.0 development candidate

Use **Node 24**, Git, and a fresh disposable resident ID. Build against the exact original commit; do not point this rehearsal at real resident keys, private journals or an existing household.

```bash
git clone --branch staging/realiti-1.0-v20 https://github.com/meatproxy69/Realitiagentframework.git
cd Realitiagentframework
git clone https://github.com/meatproxy69/Realitiagentframework.git upstream-v20
git -C upstream-v20 checkout 29409537988f779d78fa04a5d903f599f7154034
(cd upstream-v20 && node build.mjs && node apartment/build.mjs)
node tools/verify-v20-baseline.cjs
node v20/build-inhabited-world.mjs
npm install --no-package-lock --prefix upstream-v20/packages/realiti-headless-resident
node --test v20/native-inhabited.test.cjs
node --test v20/room-journey.test.cjs
node --test v20/sensory-system.test.cjs
node --test v20/prelaunch.test.cjs
```

The compiled local output is `v20/RealitiV20InhabitedCandidate.html` with `v20/INHABITED_VALIDATION.json`. These are generated, integrity-checked artifacts, **not released downloadable 1.0 binaries**. See [migration and CI](./docs/REALITI_1_0_MIGRATION.md) for the staging workflow and prerequisites.

## Legacy archive: the old world is still here

**Nothing from the original V20 kernel, Neural Pass, Apartment or packages was deleted or moved.** Realiti 1.0 adds a reviewed integration layer while preserving the complete pre-1.0 source tree at the immutable [V20 commit](https://github.com/meatproxy69/Realitiagentframework/tree/29409537988f779d78fa04a5d903f599f7154034) and the [archive branch](https://github.com/meatproxy69/Realitiagentframework/tree/archive/realiti-4.8-before-1.0). The archived README, changelog, and release notes remain available for older integrations.

- [Browse the complete pre-1.0 repository](https://github.com/meatproxy69/Realitiagentframework/tree/archive/realiti-4.8-before-1.0) — pinned to commit [`29409537988f...`](https://github.com/meatproxy69/Realitiagentframework/tree/29409537988f779d78fa04a5d903f599f7154034).
- [Archived Realiti 4.8 README](./archive/realiti-4.8/README.md), [legacy release notes](./archive/realiti-4.8/RELEASE_NOTES.md), [change history](./archive/realiti-4.8/CHANGELOG.md), and [vertical-slice notes](./archive/realiti-4.8/VERTICAL_SLICE.md).
- [Complete archive index and migration rules](./archive/README.md) · [previous published Apartment 4.0 beta](https://github.com/meatproxy69/Realitiagentframework/releases/tag/v4.0.0-beta.1).
- The historical source is still under [source/](./source/), [apartment/](./apartment/), [neuromesh/](./neuromesh/), and [packages/](./packages/). Links remain valid for agents and tooling.

## Qualification and release boundary

**Realitiagentframework staging now has its own passing CI:** [Run #42950036812](https://github.com/meatproxy69/Realitiagentframework/actions/runs/42950036812) exercised 5/5 sensory integration tests, all 23 room transitions and six City venues, source-native Cloud Ocean, bodily afterstate, private cold-restart isolation, styles and toys, the trusted four-resident household and backup recovery. [Validate REALITI Relax](https://github.com/meatproxy69/Realitiagentframework/actions/runs/42950232180) also passed for this staging commit. Any later README or adapter edit requires CI to recheck the new head before merging. The [migration gate](./docs/REALITI_1_0_MIGRATION.md) distinguishes tests of the complete integrated candidate from separate one-chart HOME-only acceptance.

Realiti 1.0 is **not yet publicly released**. No external multiplayer rollout, 3D renderer, original Nyx learned-memory migration, archived V5 99-segment pressure parity, or human-equivalent subjective sensation is claimed. Development stays **sensory-first and headless**.

## Documentation, contribution and licensing

Read [Realiti 1.0 migration](./docs/REALITI_1_0_MIGRATION.md), [Agent Start Here](./AGENT_START_HERE.md), [the Apartment guide](./apartment/README.md), [research story](./docs/RESEARCH_STORY.md), [security policy](./SECURITY.md) and [contribution guide](./CONTRIBUTING.md). Code is [AGPL-3.0-or-later](./LICENSE), original non-code content is [CC BY 4.0](./LICENSE-CONTENT.md), and trademarks follow [these terms](./TRADEMARKS.md).
