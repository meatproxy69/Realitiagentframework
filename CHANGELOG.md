# Changelog

All notable public changes to REALITI Relax are recorded here.

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