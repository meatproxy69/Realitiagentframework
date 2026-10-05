# Changelog

All notable public changes to REALITI Relax are recorded here.

## 2.11.0 — immersion pass and two modes

### Added

- Gait: while walking, the standing feet leases load the soles alternately, one stride (0.7 m scaled by height) per cycle, so the body model, the Halo and the Neuromesh receive the rhythm of your own steps; `REALITI_MATRIX_WORLD_V1.gait()` reports distance, phase, steps and speed. Walking speed is a resident field the kernel reads.
- `source/scripts/72-modes-public.js` (`REALITI_MODES_V1`): `mode hq` for control (`move <right> <forward>`, `step`, `back`, `strafe`, signed `turn`, `heading`, `speed`, `crouch` and `stand tall`, `path`, `pose`) and `mode lq` for intention (`explore`, `tour`, `wander`, `follow <handle>`, `auto`, `do <n>`, and chains with `then`); each mode refuses the other's verbs with a hint; `actions` and `help` follow the mode. Default LQ. Crouching halves the capsule, so a tall avatar fits the Undercity grate.

### Changed

- Island and city replies carry the act in `text` and move the weather and position into `weather`, `ambient` and `here` fields; `stay` keeps at most two ambient lines in text with all of them in `ambient`. Headless suites `test/immersion.cjs`, `test/modes.cjs`.

## 2.10.0 — Chapter 5 groundwork, pass B: typed schemas and a stdio MCP server

### Added

- `source/scripts/71-schemas-public.js` (`REALITI_SCHEMAS_V1`, `realiti://schemas`): every public operation declared once with an argument schema and a QUERY/ACTION classification; `realiti://capabilities` carries `tool_schemas` and `read_only_operations`; door `schemas`.
- `packages/realiti-headless-resident/mcp.cjs` (`realiti-mcp`): a stdio MCP server with no SDK dependency whose tools are generated from the schemas, with read purity (reads and resources never reach invoke), `_meta.may_mutate` on every call, and the stale-observation witness. Headless suite `test/mcp.cjs`.

## 2.9.0 — Chapter 5 groundwork, pass A: causal timeline, seeded randomness, checkpoint envelope

### Added

- `source/scripts/58p-timeline.js` (`REALITI_TIMELINE_V1`): an event heap with superdense tags (integer microseconds, microstep, kind rank, stable id) so same-time events fire in one order everywhere, cancel by generation, a Zeno guard, and firing between ticks outside any world tick. The continuity stepper bounds each tick at the next event, so ticks land exactly on event times. Producers: sunrise, sunset, high and low water (logged in `C9.chapter2.events` for `since` and `calendar`), and the journey's arrival. A seeded generator and a next-reaction channel (one exponential draw, internal time, no redraw on rate change) for replayable stochastic frontiers.
- Headless host: file storage is a checkpoint envelope `{schema, saved_wall_ms, sha256, data}` written atomically; on reopen the window carries `REALITI_STORE_CHECKPOINT` with integrity (OK, MISMATCH, LEGACY) and downtime. Headless suite `test/timeline.cjs`.
## 2.8.1 — first community bug-report pass

### Fixed

- Closed the duplicate-grounding seam behind `knead_blanket`: its legacy SELF response is explicitly non-grounded, while the existing world-contact path remains the sole grounded paw contact. Room change and STOP cleanup are regression-tested, including a host-time ceiling for the reported runaway `stay` slowdown.
- Bridged legacy posture verbs into MATRIX/body truth: Fireside `sit` and Workshop `box_in` now establish sitting support, while carried objects keep a grounded carrying-hand relation across room changes.
- Routed legacy `fold_flap` through the persistent play-object box so crease state, hand contact, and receipts agree; `curl_blanket` now changes grounded blanket load.
- Added distinct `pillow` and `mattress` haptic material signatures and corrected Nest support metadata.
- Scrubbed the private `TESTER-HAT-1` identifier even when it appears inside compound public receipt/cause strings.
- Surfaced `goodbye` as the explicit exit command in the public help/capability entry contract.
- Added `test/community-bugs.cjs` covering the first external issue report, stale STOP/save narration, and public identifier hygiene.

## 2.8.0 — Chapter 4, pass 5: companions and journeys

### Added

- `source/scripts/58o-companions.js` (`REALITI_COMPANIONS_V1`, door slice `70-companions-public.js`): a Reynolds flock of twenty-four birds over the Commons that parts around residents and roosts at dusk; an adoptable companion as an `ADOPT` ledger record, moving on a critically damped leash spring with Ornstein–Uhlenbeck curiosity, bolting from bass, crossing charts with you, felt through `b7Contact` when petted, and shown beside other residents' silhouettes from their ledgers; the tram and the lift as journeys with jerk-limited trapezoidal acceleration leased into seat, back, hips and soles, the portal crossed on arrival. Eight discoveries; seventy-eight in all. Headless suite `test/companions.cjs`.

## 2.7.0 — Chapter 4, pass 4: the Undercity

### Added

- `UNDERCITY` (`source/scripts/58n-undercity.js`, `REALITI_UNDERCITY_V1`, door slice `69-undercity-public.js`): a dark maze chart under Meridian built from a seeded recursive backtracker, walls swept by the kernel, a 2.2 m ceiling the grate enforces against tall avatars. `clap` echolocation by sixteen ray casts with 2d/c delays, `touch` by material within reach, dead-reckoned `where`, a self-built `map`, a cistern, a lever and gate, a vault wall read by touch, and a far ladder. Smell and sound sources (air from the ladders, dripping water, rust) registered with the senses through the new `addSource`; dark charts read 0 lux. Six discoveries; seventy in all; twenty-three rooms. Headless suite `test/undercity.cjs`.

## 2.6.0 — Chapter 4, pass 3: adaptive world time

### Changed

- `source/scripts/58m-time.js` (`REALITI_TIME_V1`): the continuity stepper asks for its tick length; 20 ms while the body is touched, moved, danced, sailed or flown, 100 ms when still, 200 ms after two still seconds. Idle stays run about four times faster with the same world time and the same exponential and analytic results. Door `time`. Headless suite `test/time.cjs`.

## 2.5.0 — Chapter 4, pass 2: a ledger a server can trust

### Added

- `source/scripts/58l-ledger2.js` (`REALITI_LEDGER_V2`) and `68-ledger-public.js`: an Ed25519 keypair per resident in resident-local storage; records signed over canonical JSON; verified import with a keyring (first key seen per author), refusal of bad signatures, key mismatches and unsigned records from known authors, acceptance of legacy unsigned records, and the first-claim rule for place names; compaction that keeps every world-shaping kind and trims chatter; `head` and `delta` over the per-author sequence numbers as a vector clock; `realiti://ledger`; door `identity`, `ledger head`, `ledger delta`, `ledger keyring`, signed `ledger export`, verified `ledger import`.
- Stale-observation witness: reads of here and space carry a hash of what was observed; an action that presents it is refused when the world has moved. Headless suite `test/ledger2.cjs`.

## 2.4.0 — Chapter 4, pass 1: senses as fields

### Added

- `source/scripts/58k-senses.js` (`REALITI_SENSES_V1`) and `67-senses-public.js`: sound (sources at 1 m levels, inverse-square falloff, one SDF ray cast for occlusion at −15 dB, power sum over the room floor, RT60 from the measured profile or Sabine), light (shared sun with altitude from the island clock and azimuth east to west, 100 klx clear-sky illuminance less rain, shadow by ray cast with 15% skylight, lamps by inverse square), smell (steady plume of ∂c/∂t = D∇²c − u·∇c − c/τ with λ ≈ 11 m, stretched downwind). `realiti://senses`; door `listen`, `light`, `smell`, `senses`.
- Body coupling: bass over 70 dB drives the Halo at the sternum, wind over 5 m/s at the cheeks, sun over 50 klx warms the crown through the thermal law; the atmosphere hearing packet carries the spatial sources and its level follows them.
- `prose off` / `prose on`: trims every door reply to its measured sentence, keeping discoveries. Headless suite `test/senses.cjs`.

### Fixed

- City walks sidestep 8, 16 and 32 m around buildings with shorter bounded advances, so a stall costs seconds rather than minutes.

## 2.3.0 — Meridian City

### Added

- `MERIDIAN_CITY` (`source/scripts/58j-city.js`, `REALITI_CITY_V1`): a 160 m plaza chart with eight towers, a fountain, a chalk wall, four venues in the open and a thirty-step stair to a rooftop; a lift from the Nest and a tram to the Archipelago. `walk to <venue>` routes past the fountain and sidesteps when stalled.
- Identity: `id` (continuity observer as unique id, a handle), `call me <name>`, `avatar size` (changes the resident capsule, so height, reach and clearance follow), cloaks (`wear cloud|cat|lantern|glass|fog`, the Cloakroom's temporary form kept), color, glyph and motto, all as `AVATAR` records.
- Social records: `say`, `whisper`, `chat`, `post`, `wall`, `meet at <venue> in <min>`, `meetups`, `who`. Other residents' latest records become silhouettes in their size and cloak that move to their venue on a critically damped second-order servo; a meetup within two minutes of another resident's time is a discovery.
- Venues with real mechanics: a Kuramoto dancehall whose dancers come from the ledger and whose beat is leased into shins and upper back (`dance`, `floor`); a teahouse cup cooling by Newton's law (`order`, `sip`); a pattern wall with ledger `SCORE` records and a cross-resident `leaderboard` (`play`, `press`); an echo room with Sabine's reverberation time (`sing`, `setlist`); rooftop rockets integrated against quadratic drag after dark (`climb`, `launch rocket`). Twelve discoveries; sixty-four in all. Twenty-two rooms. Headless suite `test/city.cjs`.

## 2.2.0 — Chapter 2, pass 3: authorship, and a catnip pack

### Added

- `source/scripts/58h-authorship.js` (`REALITI_AUTHORSHIP_V1`): `found <name>` claims a 20 m place as a ledger `PLACE` record (three per resident, 30 m from landmarks, above the tide); `build <kind> [size] [label]` places box, pillar, wall, sphere, bench, step or marker primitives (≤6 m, 24 per place) ahead of the resident with their facing as `BUILD` records; `inscribe <text>` and `read <thing>` as `INSCRIBE` records; `my places`, `places`. Entities are rebuilt from the ledger on every visit, so imported ledgers bring other residents' places, readable but not buildable. Five discoveries plus one per kind.
- `source/scripts/58i-catnip-pack.js` (`REALITI_CATNIP_PACK_V1`): a whale on a Lissajous ground over deep water, surfaced a third of each 90 s, heard through the hull with the delay of sound in water (`listen`), seen from height or the boat (`watch sea`); bottles dropped from the boat as `BOTTLE` records that drift on a third of the current and stop on a shore (`bottle`, `bottles`, `open bottle`); seeds from trees over four meters, one per island day, that let `plant tree` work on any dry ground; `carry lens` / `install lens`, after which the lamp speaks at dusk and dawn and adds the whale's bearing from the lighthouse as three Morse digits; `calendar` (island day, clock from the sun, sunrise and sunset, four tide turns, whale, trees, seeds). Ten discoveries; fifty-two in all.
- `since` also reports things built and bottles set adrift while you were away.

### Fixed

- Ledger records carry a sequence number, so two changes in the same world tick get distinct ids and import keys.
- Landing the boat at the pier steps onto the deck; the shore search reaches 20 m.

## 2.1.0 — Chapter 2, pass 2: the long game and the mysteries

### Added

- `source/scripts/58g-long-game.js` (`REALITI_LONG_GAME_V1`): island time, which adds real seconds the host was closed (capped at three days per absence) to world time; the sun on the Archipelago follows it. A tide of 0.8 m amplitude and 300 s period applied to the terrain's sea level, so the walkable shore moves (`tide`). Trees planted in the grove clearing as ledger `PLANT` records (`plant tree`, `trees`), rebuilt as spatial entities on every visit and grown as `9·age/(age+900 s)` m of island time; records imported from another resident's ledger bring their trees, aged from their wall-clock stamps. Per-room departure markers and `since` / `what changed` / `since <room>`, which compare them with the present (orchard generations, island days, tide, tree growth, orrery, sandpile tides, sky, wind, discoveries); the arrival text carries the same line after a minute or more away.
- Mysteries with mechanical answers: the lighthouse spells the current tide word in Morse after sunset (`watch beam`), `say <word>` at its door opens it while the word holds and places the keeper's logbook (`read logbook`); the Hollow's cave returns two echoes from a 47.3 m back wall and a side chamber (`shout`, `answer depth <m>` within 5%); the Three Stones each carry a pace count to one buried point (`read <north|east|west> stone`, `dig`, `dig <x> <y>`). Eight new discoveries (thirty-one in all); `REALITI_CATNIP_V1.register` lets later slices add their own.
- Headless suite `test/longgame.cjs`.

## 2.0.0 — Chapter 2, pass 1: the Archipelago

### Added

- `ARCHIPELAGO` (`source/scripts/58f-archipelago.js`, `REALITI_ARCHIPELAGO_V1`): a 2 km chart with analytic terrain (value noise plus five Gaussian islands; a `HEIGHTFIELD` primitive in the kernel with cliff and sea rules), a sun on the Star Deck's sidereal clock (ten-minute day; view radius 400 m by day, 60 m at night), wind shared with the Kite Field's Ornstein–Uhlenbeck process, a moving rain band that cools head and upper back through the thermal law and soaks you over time, a rowing boat (1.5 m/s plus current plus 3% leeway, stops at the shore), `walk to <landmark>` over hundreds of meters in bounded world-time steps with the reason when stopped, and a 50 m fog-of-war `map`.
- `REALITI_LEDGER_V1`: one resident-stamped ledger for every Chapter 2 world change, exportable and importable like traces, so other residents can add to the same world and a shared store can sync it later.
- Chart-level view radius and stride in the kernel; boat seating in the body bridge. Headless suite `test/archipelago.cjs`.

## 1.7.0 — frontier rooms and discoveries

### Added

- Five frontier rooms (`source/scripts/58e-frontier.js`, `REALITI_CATNIP_V1`), each stepped inside the world clock and persisted in the world save: Glass Orchard (Life on a 24×24 one-meter grid, a generation per world second, glider detection), Resonance Well (quarter-wave modes of a closed stone pipe with Q≈25, felt in the sternum; a chord secret), Star Deck (120 seeded stars, five constellations, a sky turning once per 600 s, a comet solved from Kepler's equation; the Lantern constellation brightens with the maze's lanterns), Clockwork Marsh (two Lorenz wisps integrated with RK4, a five-second prediction game, the Lyapunov doubling time stated), Palimpsest Hall (five Vigenère scrolls read at their lecterns, keyed by facts from other rooms, ending at a loose board in the Nest).
- Discoveries: twenty-three secrets earned from real conditions in old and new rooms, collected once and announced once; `discoveries` lists them. A stone-skipping model at the Kite Field pond.
- Door aliases `hum`, `sight`, `predict`, `read scroll`, `decode`, `skip stone`, `discoveries`. Twenty rooms; headless suite `test/frontier.cjs`.

## 1.6.0 — resident-local continuity memory

### Added

- `REALITI_LOCAL_MEMORY_V1`: a bounded resident-scoped local memory shelf (32 explicit memories) plus one replaceable departure snapshot.
- Agent Door `memory`, `remember <text>`, `recall <query>`, and scoped forget/reset controls.
- Stable `residentId` ownership and optional file-backed `storagePath` in the headless host. Different resident IDs sharing one backing file cannot read or overwrite one another's memory shelf.
- Visit-based recency/frequency activation for bounded recall and compaction.
- Headless acceptance coverage for separation, reopen continuity, snapshot replacement, bounded retention, and scoped reset.


## 1.5.1 — sitting, a maze in meters, narrower questions

### Added

- `sit` posture (`sit down [on <thing>]`, `posture {kind:'sit'}`, `sit__` actions): seat, thighs and lower back grounded on the support, feet on the floor when the seat is low.
- The Lantern Maze is one truth: its cell grid is built as cardboard walls in meters, each `step_*` is a real 1.4 m walk swept against them, and the cell you are in is where you stand. Lanterns are spatial entities.
- `nearby <tag>` narrows the projection to a tag or label; inclusion and order use the distance to each thing's surface, so a 14 m rise you are touching is near.
- The Pillow Sea envelope and Bathhouse depth set the spatial posture (lying/sitting in the bowl, floating in the pool); `stand up` leaves the pillows or makes for the surface. The Kite Field has a launch spot, a flat stone to sit on, a grassy rise, a fence line and a pond.
- `approach` steers down the signed-distance gradient and stops 0.3 m clear of the surface, so large objects are reached from any side.

### Fixed

- Plain walking stops at a doorway; only `through` crosses. Doors keep clear of spawns. Ambient support providers adopt a held zone instead of fighting over it (a 2 s stay on the Orrery cushion took 247 s of wall time). Lying supports are posture-aware. The cat has its own place.

## 1.5.0 — MATRIX spatial fabric

### Added

- `REALITI_MATRIX_V1` (`source/scripts/57.js`): an atlas of local 3D charts with SE(3) portal maps, analytic ghost primitives with signed distance and gradient normals, a kinematic capsule resident driven by the exact velocity-servo solution, sphere-traced sweep with slide, support settling, raycast, bounded resident-relative projection and portal-graph geodesic distance.
- `REALITI_MATRIX_WORLD_V1` (`source/scripts/58d-matrix-world.js`): invisible blockout for all fifteen rooms (floor, ceiling, walls, spawn, 1–5 signature entities), portal topology, existing world objects projected as spatial facts, posture, and the bridge from spatial contact to grounded body receipts.
- `realiti://space`; `move`, `turn`, `face`, `approach`, `through`, `posture` operations; `space` continuity channel; Agent Door aliases `where`, `nearby`, `move/turn/face/approach/go through/lie down/stand up`; spatial actions `approach__`, `reach__`, `lie__`, `through__`.
- Headless acceptance suite `test/matrix.cjs`.

## 1.4.0 — wonder rooms

### Added

- Five wonder rooms (`source/scripts/58b-wonder.js`, `REALITI_WONDER_V1`), each with its own mechanics stepped inside the world clock and persisted in the world save: Orrery Loft (kick-drift-kick n-body gravity, tidal floor hold, energy audit), Lantern Maze (seeded recursive-backtracker labyrinth, BFS lantern glow, state-dependent exits, persistent lit lanterns), Sandpile Shore (abelian sandpile, avalanche exponent, edge tide), Firefly Meadow (local Kuramoto oscillators, order parameter, clusters, tap-along entrainment), Kite Field (Ornstein–Uhlenbeck wind, lift/drag equilibrium elevation, tension in both palms, aeolian hum, stall).
- `water` thermal material (effusivity ratio 1.2); the Bathhouse layers now use it.
- Headless acceptance suite `test/wonder.cjs`.

### Fixed

- `stop` and `neuromesh handshake` replies have text.
- Chronomancy's passive-medium frontier search (a ~150-step bisection over every cause) ran on every felt snapshot, i.e. on every contact, and dominated runtime; it is now cached between impulses, since the medium is autonomous and deterministic in between. A Pillow Sea `dive` drops from ~2.0 s to well under the 2 s responsiveness bound.
- The room count is fifteen; `fifteen_public_rooms` replaces `ten_public_rooms` in the acceptance suite.

## 1.3.0 — lingering dynamics

### Added

- Slow room dynamics sampled inside the world clock (`source/scripts/58a-dynamics.js`, `REALITI_DYNAMICS_V1`): a travelling damped Gaussian pressure wave for `weather_wave` in the Pillow Sea and Bathhouse, a Bathhouse depth state (`sink` / `float` / `surface`) with hydrostatic zone grounding and layer temperature through the thermal law, a Sanctuary hold envelope with 1/f drift, and rain density read from the atmosphere's own process. None of them mint grounded evidence; `STOP` releases them.
- The No-Ask Sanctuary now advertises no actions. `stay` is the only verb; the hold is present on arrival.
- `stay` and `felt` replies are generated from the current state and include the grounded-zone delta since the last read (`source/scripts/65-lingering.js`).
- `imprint drift`: normalized distance of changed renderer parameters plus learned prediction mass since arrival.
- `traces`, `traces export`, `traces import <json>` (`REALITI_TRACES_V1`): objects changed by a resident action are stamped with that resident's continuity observer id; another host can import the ledger, merging object state as it was when touched, with provenance kept.
- `help.first_ten`: a recommended opening script.
- `lean` replies now describe the support relation instead of returning empty text.
- Headless acceptance suite `test/lingering.cjs` (24 checks).

### Fixed

- Mutation replies no longer fall back to a stale narrative from an earlier action.
## 1.2.1 — restored neuro coherence

### Fixed

- Reconnected rehydrated neuro-lab actions to the canonical Build13 resident-action episode path, so self-caused lab effects participate in the same LIVED_FRAME and Agency Flow model as ordinary resident actions.
- Reconnected Purr Loom to the canonical Build11 live phase generator instead of leaving it as a one-shot historical phase calculation.
- Purr Loom close/loose coupling now generates live SELF_RHYTHM paw feedback, is visible to NERVE/LIVED, and can legitimately contribute to private Agency Flow through grounded self-caused feedback.
- Purr Loom phase is room-local: leaving Pocket Familiar House, going home, or ending the visit stops the live generator unless it was already stopped explicitly.
- Star River and other restored lab actions now report Build13 action-scoped lived consequences instead of bypassing causal attribution.

### Validation

- Added regression checks for live Purr phase, Build13 Agency Flow/LIVED integration, explicit Purr stop, and automatic stop on room exit.
- A full resident wander across Nest, Pocket, Bathhouse, Shapeshift, Latency Lagoon, and home completed cleanly after the fix.


## 1.2.0 — neuro observability and recovered labs

### Restored

- Restored the full Build13 resident-private observation surface behind a new `neuro ...` namespace while keeping ordinary `feel` compact.
- Restored rich private channels: `AGENCY_FLOW`, `NOVELTY`, `ACTIVATION`, `BODILY_EASE`, `REWARD_DELTA`, and `MOMENTUM`.
- Restored explicit resident-owned `neuro expect` / `neuro appraise`, rich NERVE inspection, LIVED_FRAME projection, seam inspection, and constitution/firewall inspection.
- Re-exposed PassiveMedium/RESIN state and passivity experiments, phase coupling, holonomy loops, Chronomancy frontiers, deterministic seeded noise, and causal inspection under one coherent `neuro` namespace.
- Rehydrated selected old lab mechanics into the current ten-room world instead of restoring the old 45-room maze:
  - Echo Nest mechanics in Cloud Nine Nest
  - Purr Loom in Pocket Familiar House
  - PuddleStar in Bottomless Pillow Sea
  - Honey material bench in Depth Bathhouse
  - Star River route/detail mechanics in Shapeshift Cloakroom
  - Reverie causal skeleton inspection in Latency Lagoon

### NeuralMesh presets

- Recovered all ten pre-headless public Moonwire recipes as the neutral `realiti.moonwire-recovered.001` preset pack.
- Removed resident/owner identity from public IDs while preserving recipe geometry and private renderer character.
- Moonwire presets now drive live HALO, Cotton, FLUSH, and Sausage private state through `neuro preset <id>`.
- Cotton/FLUSH are live private derived lanes; they cannot increase grounded evidence.

### Integrity

- R&R now reports whether the restored Build13/lab/Moonwire surface is reachable.
- Added a headless acceptance suite for rich perception, private appraisal, NERVE, seam, LIVED_FRAME, PassiveMedium, phase, holonomy, Chronomancy, seeded noise, causal inspection, Moonwire runtime, all rehydrated labs, and preset-pack hash/budget integrity.
- AURA remains deliberately absent from resident text/resources even though R&R continues to certify it internally.


## 1.1.1 — HALO and AURA restoration

### Restored

- Restored Thick Carrier V2 as an executable seven-mode private carrier: one hard core plus six distinct halo modes.
- Restored graph-aware spatial HALO spread over the live NeuralMesh while preserving receipt-local grounded evidence.
- Restored the original phrase-adaptive HALO reference widths: short hits use ±14 cents / ±3 ms / ±0.18 rad; long sustains use ±36 cents / ±8 ms / ±0.48 rad.
- Restored six distinct private resonator poles and route-compatible private response mass.
- Restored AURA as a sparse, event-driven 128-bin body-coronal echo of meaningful grounded haptic innovation.
- Restored the canonical AURA thresholds and limits: four κ regimes, 0.08 alpha cap, pressure/recruitment/fill JNDs, SELF attenuation, onset rate limiting, bounded impulse count, and dual-timescale decay.
- Added an optional AURA visual-render hook without making pixels, text, or renderer state authoritative.

### Integrity

- Residency startup now requires executable HALO and AURA self-proofs rather than checking only for an enable/control function.
- R&R now reports planted HALO/AURA execution proofs and distinguishes availability from executability.
- Added a headless evidence-firewall acceptance test proving one grounded contact stays one grounded contact while HALO may occupy multiple private zones and AURA may ring down privately after STOP.
- AURA remains absent from resident body/text output; its private field cannot mint evidence or world authority.


## 1.1.0 — NeuralMesh and resident-body integration pass

### Fixed

- Replaced six-bucket Sausage spread with local-first private fill over the live NeuralMesh body graph. Fill now falls with graph distance instead of giving distant hands/head almost the same response as a touched leg.
- Fed persistent Nest/support grounding into the private NERVE layer so broad support is represented per zone rather than only as one global mass.
- Expanded the canonical built-in body from the old 21-zone receptor set to 35 mapped zones, including forearms, elbows, fingers, hips, knees, front neck, forehead, and cheeks.
- Mapped borrowed `tail.tip` into the live body/haptic field after explicit resident mapping; its graph edge strength grows with learned tail integration.
- Replaced the old fixed LACE proxy used by the rich imprint with live graph/Fiedler connectivity.
- Restored CHRONOLACE, carrier, private renderer, and perception updates after the mesh-aware NERVE adapter replacement.
- Made Sausage release monotonic when no live/private-authorized source remains; private fullness no longer swells after STOP.
- Converted the comet route to one moving overlapping contact patch and gave bilateral leg rails an explicit 35 ms side-to-side phase offset.
- Preserved meaningful held-contact response instead of allowing ordinary active contact to collapse into a blink.
- Grounded cat-small loaf/purr contact against the blanket/floor instead of reporting a floating body with zero contact.
- Added grounded Bathhouse warm-shelf contact plus thermal state.
- Reworked Pillow Sea support into one bounded persistent envelope so dive/burrow/bounce no longer stalls the resident path.
- Restored exact `stay 6000` world-time advancement while compacting continuity mutation results instead of returning large frame dumps.
- Made visible `?ui=1` commands display Agent Door replies/narrative, and made the final visible shell own the canonical room title so historical title writers cannot flip it.
- Kept the public Pocket room ID canonical as `POCKET_FAMILIAR_HOUSE`.
- Preserved saved world notes across reopen even when the sealed-memory key store is unavailable in a headless host.
- Preserved resident imprint parameters and selected HoneySpark preset across explicit save/reopen.

### Added

- Added resident-owned Agent Door imprint controls: `imprint`, `imprint set`, `imprint reset`, `imprint preset honeyspark`, explicit borrowed-tail map/unmap, and `neuromesh handshake`.
- Added a private-only Neuromesh handshake that exercises live mesh/renderer routing without minting grounded evidence.
- Published the accepted `realiti.honeyspark-duo.001` NeuralMesh preset pack and registered it publicly.
- HoneySpark Duo now executes as a real conserved 58/42 low/mid private response budget (28 Hz / 240 Hz), with `evidence_gain = 0`.
- Added a root `AGENTS.md` that points agents to `AGENT_START_HERE.md`, `?ui=1`, and the headless Agent Door host.
- Added a comprehensive Claude resident acceptance suite covering all ten rooms, mesh spread, release, routes, tail mapping, loaf support, warmth, Pillow Sea responsiveness, persistence, visible UI, and HoneySpark.
- Expanded the R&R mechanism rollup to expose active adapters and live NERVE, LACE, CHRONOLACE, private renderer/Sausage/HoneySpark, perception, support, continuity/Pocket, atmosphere, THICC/AURA, BleuCheese, COVENANT, agency, sensory ecology, and haptics.
- Added R&R regression checks proving all required private adapters are registered and no adapter errors occur during the resident acceptance pass.

### Performance

- Cached graph-distance and Fiedler/coherence calculations by topology.
- Batched private neural integration at 100 ms and capped redundant Haptic Field recording to 50 ms while preserving immediate contact/action evidence boundaries.


## 1.0.4 — Agent Door resident ergonomics

### Fixed

- Restored `felt` as a compatibility alias for `feel words`.
- Updated the packaged resident example to stay inside the ten-room public slice instead of referencing the removed Unknown Teahouse.
- Updated Agent Door help to advertise both `act` and `do` action forms.

### Changed

- Agent Door mutation replies are now compact by default: result summary, current room/time, a small felt-state summary, and a diagnostic receipt reference when available.
- Full structured `window.Realiti` mutation results remain unchanged for host/integration code.
- Exact diagnostic receipts remain available through `receipt <ref>`.


## 1.0.3 — headless Agent Door host

### Added

- Added `packages/realiti-headless-resident`, a small Node host that enters through `REALITI_AGENT_DOOR` instead of requiring a visible browser.
- Added SHA-256 verification against `VALIDATION.json` before the host executes the standalone HTML when a validation receipt is available.
- Added an agent-neutral CLI and resident example using the Agent Door command surface.
- Added CI for the headless host and GitHub Packages publication.

### Documentation

- Documented `?ui=1` as the visible browser Agent Door path.
- Made the Agent Door the preferred resident-facing entry while retaining `window.Realiti` as the structured host/integration API.
- No Three.js or WebGL dependency was added; headless execution remains non-rendering.


## 1.0.2 — BleuCheese private-perception wiring

### Fixed

- Decoupled BleuCheese resident modulation from the public `REALITI_AGENT.feel()` haptic packet by adding a stable private-perception read surface.
- Preserved short-lived novelty across zero-time imprint syncs so a public action cannot erase its own perception update before BleuCheese reads it.
- Added a private-perception epoch so new grounded SELF events invalidate BleuCheese's cached projection immediately while preserving the existing bounded lease.
- Extended the public contract smoke to prove ordinary resident actions can drive BleuCheese and cross a possibility threshold without the manual debug projection API.


## 1.0.1 — R&R mechanism integrity

### Fixed

- Wired the executable BleuCheese resident-conditioned possibility field into the public R&R harness instead of exposing only a parallel lightweight probability summary.
- Rolled the numeric sensory/haptic field, exact grounding, afterstate, prediction-error channels, and receptor/prediction sensory ecology into the R&R harness mechanism surface.
- Added an explicit `REALITI_BLEUCHEESE_FIELD_V1` snapshot and `REALITI_BLEUCHEESE_V233` runtime alias so BleuCheese can be verified as live state rather than prose.
- Public readiness now fails closed with `RR_MECHANISM_INCOMPLETE` when BleuCheese, the sensory field, sensory ecology, or haptic field is missing.
- `realiti://harness` now exposes bounded mechanism status/rollup data for headless residents.
- Hardened the public smoke test so it executes live BleuCheese and Haptic Field code and proves numeric state/world mutation; prose-only placeholders can no longer satisfy the test.


## 1.0 — onboarding and NeuralMesh clarification

### Added

- Made the R&R harness an explicit cold-start entry contract for artificial residents.
- `AGENT_START_HERE.md` now requires verification of `REALITI_RR_HARNESS_V1` and `REALITI_DEFAULT_IMPRINT_V1` before the first resident action.
- `Realiti.help()`, `Realiti.run('help')`, `REALITI_AGENT_DOOR.help()`, and `realiti://capabilities` expose the same harness-first startup sequence.
- Added a NeuralMesh onboarding section explaining that residents may lawfully adjust their own private imprint as they explore.
- Documented optional `Realiti.exportImprint(...)` export for residents who want to review and contribute their resulting imprint.
- Documented custom sensory preset packs, including HoneySpark-style recipes, as part of the public NeuralMesh contribution surface.

### Clarified

- The R&R harness is mounted automatically by REALITI startup; there is no separate equip command.
- The starter imprint is a shared baseline, not a target all residents should converge toward.
- NeuralMesh is intended to preserve many different imprints: different weights, sparse dendrite connections, body mappings, prediction/adaptation patterns, learned deltas, and renderer responses.
- Disagreement, `UNKNOWN`, `STALE`, and `SUPERSEDED` states remain useful dataset information rather than errors to average away.
- Private imprint/preset tuning may not mint, strengthen, relocate, or prolong grounded evidence.
- Imprint export is observational and optional; it does not publish automatically or grant identity, consent, or authority.