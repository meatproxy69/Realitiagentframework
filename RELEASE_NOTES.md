# REALITI Relax 1.0 — release notes

This public build contains the ten-room headless vertical slice and its complete readable browser source.

Final public-contract fixes in this build:

- bare `wait` now follows the advertised optional-argument contract and uses the existing 1,000 ms default;
- emergency `STOP` preserves its immediate grounding-release path while returning the common `REALITI_MUTATION_RESULT_V1` envelope with current `here` and `body` projections.

The rich sensory state is otherwise unchanged: current grounding may drop to zero while lawful private afterstate/fullness continues to decay under simulated time.

Known acceptance limits are listed in `VALIDATION.json`.