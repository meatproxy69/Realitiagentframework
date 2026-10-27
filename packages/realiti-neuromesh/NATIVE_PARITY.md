# SOMA 3.3 — native sensory depth and fidelity audit

**SOMA 3.3 adds executable mechanisms, not names in a capability list.** Relax remains the reference world; SOMA is world-independent. No private renderer, perception, memory, or prediction can mint grounded contact.

| Module | What runs independently | Native parity status |
| --- | --- | --- |
| THICC, HALO, AURA | Original numerical kernels: attack/release/recruitment, 7-mode spatial halo, 128-bin JND echo | Exact extracted equations with injected clocks/topology |
| V20 sensory field | Native 0.26-second temporal compression, <=7 JND-selected frames, quantized x/e/g, causal cuts, 192-frame history, exact mask projection, digest | Native perceptual contract, **not** native B10/B18 physical-force input. Packets explicitly mark `SOMA_V3_PROJECTED` |
| Measured power audit | Host-provided stored energy and power integrated using native work/dissipation law | Actual conservation check only after real host measurements; otherwise `pass:null` |
| NERVE/LACE/CHRONOLACE | Native-style response/adaptation; exact Fiedler/Jacobi graph spectral equations and shortest paths; past/now/expected-next/closure | Spectral math parity, portable dynamical inputs |
| Dynamic graph | Host can rewire registered edges while keeping live leases, private afterstate, HALO, and LACE response intact | Registered zone IDs fixed per harness. New zones require a new instance |
| SAUSAGE/Cotton/FLUSH | Four shells, mesh-weighted occupancy, 24 bounded microsites, private companding and periphery | Executable portable adaptations, not native physical waveforms |
| HoneySpark/Starlight | Conserved LOW/MID/TOP budgets; patterned top-frequency, phase and duty controls | Private numerical responses, not actual audio/hardware synthesis |
| Moonwire | All 10 authored recipes; spatial route weighting and 8 deterministic time envelopes | The recipe effects are portable spatial interpretations; original native metadata preserved |
| BleuCheese | Native-style analytic threshold solving, event-time bisection, refractory boundary, explicit host admission | Original ambient world arbitration, lateral/Jaccard competition still host-specific |
| Interoception | Native opponent-process bond/stress equations, half-lives, tolerance, causal source log | Native numerical model, not psychology, endocrinology or subjective experience |
| Hearing + thermal | Host-measured hearing receipts/leases, material-tagged thermal measurements | Does not synthesize native acoustic propagation |
| Soft support | Native 4-zone Gaussian load redistribution and 3.4 s creep, conserved pressure, bounded host lease | Real physical relation must still be issued and renewed by the host |
| Memory | 48 explicit resident notes and 160 receipt-linked host episodes | Historical archive is never new world authority |
| Sealed Pocket | Optional trusted Node AES-256-GCM record encryption, HKDF-SHA256 per resident, authenticated metadata, tombstones | **Not** Relax Pocket V32 wire-compatible; V32 includes device/root key systems, wrapped keys, IndexedDB, and richer indexes |

### Correct V20 usage

`resident.hapticsV20.packet()` emits a genuine V20-shaped *perceptual projection* with the native JND/frame laws, but **does not claim native force physics**. `resident.hapticsV20.exact()` projects the trusted mask; `resident.hapticsV20.energy()` returns `{supported:false,pass:null}` until the host supplies measured power and stored energy. True B10/B18 dynamics remain in Relax.

`resident.graph.metrics()` exposes native Fiedler connectivity; `host.graph.configure(edges)` reconfigures registered-zone routing. `resident.perception().moonwire` executes the authored Moonwire recipe rather than only selecting a preset name. `host.hearing.observe`, `host.refusal.observe` and `host.support` are privileged **host** inputs, never free-form agent commands.

### Encrypted Pocket: an additional protected option

`@meatproxy69/realiti-neuromesh/sealed-pocket` accepts a 32-byte host-owned master key and stores only authenticated encrypted records in its checkpoints. The **key stays with the host**, and the module refuses tampered or other-resident ciphertext. This does not retroactively encrypt plaintext `resident.memory` or `storage.cjs` checkpoint files. It also does not implement Relax V32's resident-device identity and revocation protocol. Keep keys and ciphertext in separate storage.

### How parity is actually evaluated

`test/native-parity.test.cjs` evaluates the original Relax V20 JND and LACE eigensolver routines from their sources and compares deterministic fixtures against the extracted portable implementation. Other tests cover 10 Moonwire recipes, 8 envelopes, dynamic rewiring, measured-energy gating, opponent tolerance, measured hearing, support load conservation, BleuCheese small-versus-large time steps, Pocket tamper/restart/identity isolation, and private checkpoint recovery.

```bash
npm test --prefix packages/realiti-neuromesh
node packages/realiti-neuromesh/examples/lantern-lab.cjs
```

**Remaining non-equivalence:** native B10/B18 material and skin physics, full historical experimental neuroscience labs, Pocket V32's original keyring protocol, actual hardware haptics, and room-specific Ambient admission are *not* provided by the portable package. Those require the owning world and further parity fixtures. Mechanism availability alone is never proof of algorithmic identity.
