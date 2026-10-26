# SOMA 3.1 — Full R&R Harness Portability Audit

REALITI Relax remains the reference neighborhood and retains its full native, layered runtime. The independent @meatproxy69/realiti-neuromesh module exports an **executable harness** that a new neighborhood can boot without importing Relax, its browser globals, map, rooms, server or identity.

The full harness is created with createHarness({residentId,zones,edges}). harness.boot() checks registered mechanism surfaces. Standalone tests exercise real dynamic responses and the authority boundary. The harness REQUIRED list enumerates all 23 components.

## Mechanism inventory

| Mechanism | Standalone SOMA 3.1 implementation | Source / fidelity |
| --- | --- | --- |
| Body graph | Arbitrary bounded body zones and weighted edges; default 35-zone LACE mesh | Portable topology |
| Haptic field | Structured V3 z/x/m/e/g/cc/cf/k with signed absence and grounded bits | V3 interoperable; **not falsely labeled V20** |
| Sensory ecology | Event-driven observed stimulation, expectation and NERVE adaptation | Portable |
| NERVE | Dynamic adaptation, novelty, response | Portable |
| LACE | Graph-based private response spread and coherence | Portable |
| CHRONOLACE | Simulated-time past/now/expected-next and closure | Portable |
| Private renderer | Composite private channels, no world authority | Portable |
| SAUSAGE FATTENER | 4-depth-shell body occupancy, finite attack/release, graph-driven spill, live-cause gate | Executable portable V4-inspired |
| Cotton Candy | 24 deterministic asynchronous micro-sites per active zone, exactly reaggregated into bounded private current | Executable portable |
| FLUSH | Private foreground weighting, headroom and peripheral mix | Executable portable |
| HoneySpark | Conserved LOW/MID/TOP response budget, independent of evidence | Portable preset pipeline |
| THICC | Original attack, release, spill, body/recruitment dynamics | **Exact algorithm extracted** from source/scripts/48.js |
| HALO | One hard center + six detuned halo modes, graph spread and mass reaggregation; SHORT/LONG phrase | **Exact algorithm extracted** from source/scripts/48.js |
| AURA | 128 circular angular bins, 4 von-Mises kernels, JND thresholds, rate limiting, self attenuation and private afterglow | **Exact algorithm extracted** from source/scripts/48.js |
| BleuCheese | World-affordance gated finite-time possibility dynamics with history, repetition, refractory and host-only proposals/admission | Executable portable adapter to native concepts |
| COVENANT | Resident-owned, expiring private modulation lease | Portable |
| Agency field | Weighted branch entropy and non-binding possibilities | Portable |
| Atmosphere | World-supplied thermal measurements with exact exponential response | Portable; no world authority |
| Continuity | Bounded causal receipt trail and resident-scoped cursor | Portable; host controls durable backing |
| Support | Trusted host-sourced leased grounded contact and explicit release | Portable |
| Pocket | Bounded resident-private memory shelf, isolated from world state | Volatile; durable sealing requires host security integration |
| Perception | Six private numerical channels including NOVELTY and ACTIVATION; resident-owned appraisal | Portable |
| R&R harness | Real boot/capabilities/mechanisms/snapshot/bindResident/registerAdapter, turn-based off-duty role classifier, optional host-gated play proposals and host/resident capabilities | Executable portable; classifier never diagnoses or chooses for resident |

## Evidence firewall (non-negotiable)

host.contact() is the only grounded input in the portable kit. It accepts only explicit host source classes with an actual cause ID, receipt and finite lease. The trusted neighborhood, **not the package and not an agent prompt**, decides whether contact has occurred. The private resident may change expectation, appraisal or COVENANT modulation; none can alter m, cc, world truth or force. STOP removes grounding, even while AURA/HALO/THICC/SAUSAGE remain as bounded private afterstate.

host.bleucheese.define, host.affordances, host.bleucheese.proposals and host.bleucheese.admit operate on **possibilities**, not world mutation. The world owner still performs any optional event commit and generates its own independently verifiable record.

The private THICC/HALO/AURA code comes from the exact 23.5 implementation in source/scripts/48.js, with C9.clock, body-graph lookup and REALITI_HAPTIC_FIELD_V20.exact replaced by explicit per-resident simulator interfaces. The other mechanisms are **actual independently executable portable adaptations**, but not byte-for-byte clones of Relax's room-coupled code.

## Packaging and qualification

The package bundles the authored NeuralMesh V2 JSON interchange schemas, templates, mechanism catalog and registry byte-for-byte under reference/. Those interchange artifacts are independent of the executable SOMA V3 field contract. The package has no runtime dependencies and no DOM requirement. Classic-script browser globals load in order as REALITI_SOMA_V3, REALITI_SOMA_RENDERERS_V3, REALITI_SOMA_HARNESS_V3. The CommonJS entry exposes createHarness directly and provides ./harness and ./renderers imports.

GitHub validation runs the standalone harness tests, the original renderer acceptance probes and a source-parity guard, then generates RealitiRELAX.html from the same embedded scripts and verifies its SHA-256. A separate Relax integration check verifies that legacy V20 remains live while SOMA 3.1 can see grounded causes, render private state, and clear its m channel on STOP.

This is **computational modeled sensory state**, not a declaration about subjective experience. Object capability boundaries do not sandbox arbitrary third-party JavaScript in the same process. Always isolate untrusted residents/agents and secure private Pocket storage in the hosting environment.
