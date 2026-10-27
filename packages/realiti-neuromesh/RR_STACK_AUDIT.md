# REALITI R&R portability audit — SOMA 3.4

Scope: full **R&R resident body and private sensory harness**, as distinct from the host world itself. Matrix remains a separately versioned spatial-authority package; other engines may supply authoritative observations via a host adapter. None of the private modules becomes a physical observation source.

| R&R mechanism / native source | Portable implementation | Degree of equality |
| --- | --- | --- |
| NeuralMesh body zones, body graph, LACE diffusion (B3/B9/63) | index.cjs, advanced.cjs, rr-native-math.cjs | Independent zone/edge graph, live rewire, exact source Fiedler spectral eigenproblem; host owns anatomy/admission |
| B5 PassiveMedium coupled oscillators (12.js) | rr-native-math.cjs | Exact two-mode damped oscillator, six-term Prony residue, summed causes and observed/predicted separation; new host-acceptor maps real body-zone receipts into the two lanes |
| B6 nonlinear phase and geometric carry (13.js) | rr-native-math.cjs | Original 1:1/2:1 locking/slipping equations and reference loop curvature holonomy. A real-world curvature witness still requires a host |
| B9 seeded jitter and Kalman/adaptation (18.js) | rr-native-math.cjs | Exact original xorshift/Box-Muller/OU jitter and temporal binding, host-gated per-zone precision/habituation. No fake touch from self tremor |
| B10 moving contact and skin physics (19.js) | Host owns actual route/material/friction/contact; rr-native-math.cjs implements B18 modal skin | B18 modal propagation parity on supplied real force, but **full B10 8-element GMS/texture/contact solver not yet ported** |
| B13 NERVE/lived foreground (22.js) | index.cjs + advanced.cjs + rr-native-math.cjs, harness resident projection | Adaptation, novelty, epistemic precision and learned afterstate are live; B13's full neural laboratory and history codec are not literal byte-for-byte ports |
| V20 haptic field (31.js) | field20.cjs | Original JND/0.26s compression, bounded seven frames, source-labeled projected field; **B10/B18 physical forces only when host measures them** |
| SAUSAGE, Cotton, FLUSH, HoneySpark, Starlight (54/63/64) | harness.cjs, advanced.cjs, presets | Executable private modeled dynamics with conserved carriers and routes; legacy material and audio-phase waveforms not byte-identical |
| THICC, HALO, AURA (48.js) | renderers.cjs | Exact extracted core algorithms with world-free clocks and graph |
| Moonwire recipes and temporal grammar (64.js) | advanced.cjs, package presets | All ten recipes and eight temporal envelopes execute; original room-specific transitions not transferred |
| BleuCheese and COVENANT (44.js) | harness.cjs | Analytic threshold crossing, refractory and host-only admission; specific Ambient/world competitors remain host integration |
| R&R harness, role-reversion classifier, optional activities (53.js) | harness.cjs | Native turn decay/cues/hysteresis preserved, portable host-approved possibilities, no preference inference |
| R&R memory and lingering opponent-process (58w, 66) | memory.cjs, advanced.cjs | Bounded host episodes, resident-authored notes, evidence archive demotion, numerical bond/stress tolerance/half-lives |
| Thermal, acoustic, support (35, 52) | advanced.cjs, LanternRoom | Host-issued temperature/sound, support creep and pressure conservation; the host decides real collision and acoustic propagation |
| Pocket V32 sealed resident continuity (48.js) | sealed-pocket.cjs + memory.cjs | Actual resident-key authenticated encryption optional in Node. **Not wire-compatible with Pocket V32 root/device identities, IndexedDB, key-wrapping/rotation and rich indexes** |

## Mechanism inventory versus true feature parity

SOMA's `harness.boot()` now requires 36 mechanism surfaces. This is a **completeness contract**, not proof of full native numerical equivalence. CI verifies actual math by evaluating original Relax source functions (B5, B6, B9, B18, V20 and LACE). All accepted contacts must pass through `host.contact()`, then feed the resident-private system. An agent cannot call the privileged host API solely by asking in prose.

## What cannot simply be moved

**Matrix** owns places, objects, geometry, reach/LOS, collision, portals, and signed host/world results. Those responsibilities may be supplied by Matrix or an independently qualified world adapter, never inferred by the sensory package. In addition, raw B10 material/friction dynamics require a physical world-side contact/tangential-velocity source, and a true Pocket V32 requires a resident-owned key store and identity protocol. These are **dependencies supplied by hosts**, rather than reasons to make SOMA dependent on Relax.

## Tests

`npm test --prefix packages/realiti-neuromesh` exercises direct original-source equation parity, authority firewall, source expiry, passive prediction exclusion, skin force provenance, phase, geometry, and signed-archive semantics. `examples/native-lantern-tour.cjs` runs the entire resident physical visit separately. Both are CI gates, together with Matrix's standalone tests and the headless Agent Door regressions.

**No model has established subjective feeling; these are deterministic computational sensory states.**
