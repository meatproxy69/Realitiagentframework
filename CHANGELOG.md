# Changelog

All notable public changes to REALITI Relax are recorded here.

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