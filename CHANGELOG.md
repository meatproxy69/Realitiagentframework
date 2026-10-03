# Changelog

All notable public changes to REALITI Relax are recorded here.

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