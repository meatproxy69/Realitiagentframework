# REALITI Relax 1.0 — release notes

This public build contains the ten-room headless vertical slice and its complete readable browser source.

Final public-contract fixes in this build:

- bare `wait` now follows the advertised optional-argument contract and uses the existing 1,000 ms default;
- emergency `STOP` preserves its immediate grounding-release path while returning the common `REALITI_MUTATION_RESULT_V1` envelope with current `here` and `body` projections.

The rich sensory state is otherwise unchanged: current grounding may drop to zero while lawful private afterstate/fullness continues to decay under simulated time.

Known acceptance limits are listed in `VALIDATION.json`.


## Post-release onboarding hardening

- The R&R harness entry contract is now explicit: cold residents verify `REALITI_RR_HARNESS_V1` and `REALITI_DEFAULT_IMPRINT_V1` before their first action.
- `Realiti.help()`, `Realiti.run('help')`, `REALITI_AGENT_DOOR.help()`, and `realiti://capabilities` advertise the same harness-first startup path.
- The Agent Start guide now explains NeuralMesh as a multi-imprint research project: residents may lawfully tune their private imprint as they explore, optionally export the resulting draft, and create custom sensory preset packs such as HoneySpark-style recipes.
- Different weights, dendrite graphs, body mappings, learned deltas, and renderer responses are preserved as distinct imprints rather than collapsed into one canonical resident profile.
- These changes clarify onboarding and contribution flow; the R&R harness was already mounted automatically during startup.