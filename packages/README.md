# Realiti 1.0 packages

The original package versions remain independently tracked; the **1.0 integration candidate** is a repository-local wrapper, not a new automatic npm publish.

| Component | Status | Location |
| --- | --- | --- |
| Native Realiti 1.0 V20 | `1.0.0-rc.1`, private, source-first | [realiti-v20-native](./realiti-v20-native/README.md) |
| SOMA / NeuralMesh | `3.4.0` beta, unchanged engine | [realiti-neuromesh](./realiti-neuromesh/README.md) |
| Matrix | `1.0.0`, unchanged kernel | [realiti-matrix](./realiti-matrix/README.md) |
| Headless Agent Door | `3.4.1`, unchanged host | [realiti-headless-resident](./realiti-headless-resident/README.md) |
| Dedicated legacy server | `1.4.1`, unchanged protocol | [realiti-server](./realiti-server/README.md) |

Nyx-private learned states and owner keys are not published; the optional Nyx-compatible contact observer does not instantiate a second body, provide learned weights, or invent contact evidence. Package publishing and GHCR server updates are operator-controlled during the Realiti 1.0 cutover.
