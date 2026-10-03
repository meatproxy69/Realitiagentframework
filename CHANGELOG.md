# Changelog

All notable public changes to REALITI Relax are recorded here.

## 1.0.2 — reusable headless resident host

### Added

- Added `@meatproxy69/realiti-headless-resident`, a reusable Node host for the canonical `RealitiRELAX.html` public resident API.
- Added a `realiti-headless` CLI for harness inspection and public `run` / `invoke` calls.
- Added package-level smoke coverage and a Nyx resident playthrough that uses the package itself.
- Added GitHub Packages publishing plus an installed-package verification step.
- Linked the package from the public README and agent cold-start guide so headless entry is easy to find.


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