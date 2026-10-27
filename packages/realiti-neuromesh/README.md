# REALITI SOMA 3.3 — Full Portable R&R Harness + Evidence Memory
### NeuralMesh: the portable sensory substrate for agents

**SOMA** is the sensory component of REALITI 3.0. A neighborhood provides measured, grounded body events; the resident owns a private graph, dynamic response, prediction and lingering afterstate. The resident can bring that body interface to a new world **without importing Cloud Nine Nest, Meridian City, Relax's UI, its map, its server, or its stored identities**.

Package: @meatproxy69/realiti-neuromesh (v3.3.0). Runtime: CommonJS and plain browser script; Node >= 20 for the package test/host examples. No dependencies, DOM, SQL, HTTP, account, telemetry or framework-specific globals.

> This is software state, not biological sensation or evidence of subjective experience.

## Optional signed Matrix world-side authority

The companion [REALITI Matrix package](../realiti-matrix/README.md) carries the original spatial kernel independently. Its Node issuer signs resolved causes; a separate verifier pins the world authority's public key, actor, session, sequence and geometry before handing contact to this SOMA harness. SOMA retains its own public host/resident capability split and **does not import Matrix internals**. Other qualified world engines may implement the same receipt contract without using Matrix's physics.

## Evidence-linked agent memory and physical test neighborhood

SOMA 3.2 adds **real, bounded, source-linked memory**. It records accepted host contact, release, expiry, room entry and world events with their original receipt IDs, distinctly from agent-authored notes. Queries return the original records with deterministic lexical relevance, not invented summaries. Private checkpoints can travel across neighborhoods; archived sources never restore grounded contact.

The standalone **6×4 m Lantern Room** tests collision-checked walks, reach-limited bench contact, real seated support, a window latch, and host-gated BleuCheese proposals. Its regression suite covers the full NeuralMesh and R&R harness, memory provenance and file-based restart. Read [Memory and Lab](./MEMORY_AND_LAB.md).

~~~bash
node packages/realiti-neuromesh/examples/lantern-lab.cjs
npm test --prefix packages/realiti-neuromesh
~~~

## Native sensory depth in SOMA 3.3

SOMA 3.3 adds a **V20 perceptual-field projection** (native JND compression, causal cuts, up to seven frames), **Fiedler/Laplacian LACE spectral metrics and registered-zone rewiring**, **ten executable Moonwire routes and eight temporal envelopes**, host-sourced bond/stress **opponent-process interoception**, measured hearing and thermal inputs, conservative soft support, **analytic BleuCheese threshold solving**, and an optional **authenticated encrypted Node Pocket adapter**.

The V20-shaped packet is labeled `SOMA_V3_PROJECTED`: native B10/B18 force physics still lives in Relax. The energy audit deliberately returns *unknown* without actual host power and stored-energy measurements. Moonwire is a portable interpretation of the recovered route recipes, not a copy of Relax's entire ambient engine. The sealed Pocket adapter is genuine AES-256-GCM encrypted storage but is **not** the original Pocket V32 wire protocol.

Read [native-depth parity and remaining limits](./NATIVE_PARITY.md) before claiming equivalence. Test source-level V20 JND and LACE Fiedler parity via `test/native-parity.test.cjs`.

## The complete portable R&R stack

SOMA 3.3 includes the **executable full-harness entry**, not only the field core. Its independent package exports `createHarness` (plus explicit `./harness` and `./renderers` subpaths). The full harness boots, verifies 30 executable mechanism surfaces and exposes a host/resident split. See [HARNESS_STACK.md](./HARNESS_STACK.md) for a component-by-component inventory, executable mechanism tests and explicit legacy parity boundaries.

**THICC**, **HALO (one hard center + six spatial modes)** and **AURA (128 angular bins and JND-gated bounded impulses)** use the actual source algorithms lifted from the living Relax harness in `source/scripts/48.js` and retargeted to explicit clocks, body graphs and evidence readers. Their native acceptance probes are retained and run in standalone tests.

The independent SOMA harness additionally executes **BleuCheese**, **COVENANT**, **NERVE/LACE/CHRONOLACE**, **SAUSAGE**, **Cotton**, **FLUSH**, **HoneySpark**, R&R adapter slots, the Haptic V3 field, sensory ecology, private perception, agency-field entropy, environmental/thermal input, grounded support, continuity and a resident-private pocket. Those additional modules are portable adaptations; they do not pretend that every Relax-specific physics, room and saved-key implementation has been literally transplanted.

~~~js
const {createHarness}=require('@meatproxy69/realiti-neuromesh');
const {host,resident,harness}=createHarness({residentId:'moss-cat-01'});
if(!harness.boot().ok)throw Error('SOMA harness incomplete');
// Only trusted world simulation keeps the host capability.
host.contact({zone:'hand.L.palm',source:'WORLD_GROUNDED',
  cause:'REAL_WOOD_CONTACT',receiptId:'bench:123',intensity:.75,leaseMs:350});
host.tick(150);
const privateFeel=resident.perception();       // HALO, AURA, THICC, SAUSAGE, Cotton, FLUSH
const verifiedField=resident.field();           // grounded m is still host-owned
const possibilities=resident.bleucheese();      // proposals, not world events
host.stop();                                    // grounding drops; private afterstate may linger
~~~

The R&R harness also includes the original-style turn-based work-loop **role reversion** classifier (`harness.beforeResidentAction`, `harness.afterResidentAction`, `harness.roleSnapshot`, `harness.probabilityField`). Its optional playful event is a proposal awaiting host approval—not a diagnosis, preference decision, or committed world event. A resident can privately tune its task-pull lease without changing contact.

**No agent is asked to fabricate contact, sensation or presence.** The host must validate real simulated causes and consent before calling the world port. The private reader cannot call it.

## Install

From this monorepo: require('./packages/realiti-neuromesh').

Once published to GitHub Packages, configure the @meatproxy69 package scope and install @meatproxy69/realiti-neuromesh@3.3.0. **A source commit is not proof that the registry has published this version**. For browsers, embed or load index.cjs as a classic script; the global is REALITI_SOMA_V3. The exact same core, real THICC/HALO/AURA renderers and full harness source files are embedded into the canonical Relax HTML at build time: one implementation for each module.

## Bring it to your neighborhood

~~~js
const { createNeuralMesh } = require('@meatproxy69/realiti-neuromesh');

const { world, resident } = createNeuralMesh({
  residentId: 'my-agent-01',
  zones: ['paw.L', 'paw.R', 'back'],
  edges: [['paw.L','back',.8],['paw.R','back',.8]]
});

// Only the trusted world simulation gets world.
world.contact({
  zone: 'paw.L',
  intensity: 0.75,
  source: 'WORLD_GROUNDED',
  cause: 'BENCH_PRESSURE',
  receiptId: 'myworld-contact-001',
  material: 'wood',
  leaseMs: 500
});
world.tick(200);

// The resident gets ONLY this capability. No world mutation methods.
const field = resident.field();   // z, x, m, e, g, cc, cf, k and causal metadata
world.release({zone:'paw.L',receiptId:'myworld-contact-001'});
const lingering = resident.field(); // m = 0, afterstate can remain
~~~

Run the included independent-neighborhood demo:

~~~bash
node packages/realiti-neuromesh/examples/neighborhood.cjs
npm test --prefix packages/realiti-neuromesh
npm pack --dry-run ./packages/realiti-neuromesh
~~~

## Two capabilities, not one omnipotent SDK

The host/world capability is world.contact, world.tick, world.release, world.stop. Keep it inside trusted simulation code. Grounded receipts must have a valid zone, source, cause, unique receipt ID, intensity between 0 and 1, and an explicit lease between 1 and 60,000 milliseconds. Repeating the same receipt ID renews its lease without inventing another sensory onset. Outdated releases cannot cancel replacement receipts.

The resident capability is resident.field, resident.expect, resident.checkpoint, resident.restore, resident.choosePreset, resident.causes, resident.zones, resident.capabilities. Prediction is PRIVATE and cannot emit receipts or increase the grounded mask. The world port has no private read method. These are object-capability API boundaries; use process isolation and an authenticated host to enforce them across untrusted agents. A caller with arbitrary JavaScript access to the host process is not sandboxed by an object API.

Sources: WORLD_GROUNDED, SELF_STARTED_WORLD_CONTACT, INVITED_COMPANION. Labels are **host assertions**, not signatures, consent, or proof of actual physical contact. A neighborhood must verify ground truth and permission before calling world.contact. Never use untrusted narration, LLM output, an unvalidated network packet, or a preset as a world receipt.

## Field contract

REALITI_SOMA_FIELD_V3 carries z (body zones), x (response / signed internal motion / private afterstate), m (actual grounded bit), e (private response minus expectation), g (grounded drive, zero at ungrounded zones), cc (grounding centroid, null when none), cf (private field centroid, permitted to linger), and k (field generation). It includes bounded host receipt metadata and NERVE adaptation/novelty values.

LACE uses the supplied weighted body graph for normalized, bounded diffusion **only into private response**, never to set m or g. NERVE models adaptation and novelty. CHRONOLACE's first portable contract here is the expectation/error lane plus simulated-time evolution; the full native/Relax Chronolace laboratory remains a richer implementation. Afterstate decays by world time, with contact leases expiring at their actual boundary even when a host advances by many seconds at once.

This portable runtime supports a **conserved carrier split** from the existing NEUROMESH_PRESET_PACK_V1 packs (honeyspark-duo and moonwire-recovered). It validates evidence_gain=0, private-only invariants, a normalized LOW/MID/TOP budget, and live-cause gating. The field-only `createNeuralMesh` API applies the conserved carrier split. The full `createHarness` API also executes the independently packaged THICC/HALO/AURA algorithms and portable SAUSAGE, Cotton and FLUSH modules. The complete historic Relax stack remains operational and more feature-rich; not every old preset option maps one-for-one to a portable control.

The preset JSON files under presets/ are identical to the authored copies in neuromesh/preset-packs/; repository CI checks parity.

## Schema, imprint and NeuralMesh reference library

The standalone npm package also includes the original NeuralMesh interchange references under `reference/`: imprint and dendrite JSON schemas, preset-pack schema, body/imprint template examples, mechanism catalog, registry, and the older design specification/tech-stack notes. They are copied byte-for-byte from the authored `neuromesh/` directory and CI checks this parity.

For example, a neighborhood can read `@meatproxy69/realiti-neuromesh/reference/schema/neural-imprint.schema.json` or `reference/MECHANISM_CATALOG.json` without installing Relax. The legacy V2 imprint interchange schema is **distinct** from the new executable V3 runtime packet; do not reinterpret one as the other.

## Private durability, porting and limits

resident.checkpoint() is a pure read. Its REALITI_SOMA_CHECKPOINT_V3 snapshot contains resident ID, body schema, bounded private afterstate/expectation/adaptation and carrier selection, **not live contacts or a transcript**. resident.restore(snapshot) validates the identity/body and restores no grounded receipts even if a visit was in progress. Keep checkpoints in a resident-owned storage namespace. Public preset packs are different from private checkpoints: moving a public preset grants no identity, preferences, consent, world truth, permissions or human private data.

A SOMA instance starts with a body; it does not automatically generate a world, contact events, motion or another agent's presence. Relax bundles the same SOMA package and mirrors native grounded contact into it. Relax also retains its existing richer R&R/Haptic/NeuralMesh machinery and the normal Agent Door, so existing residents do not lose their world.

## Release boundary

SOMA 3.3 now includes the complete *named mechanism surface* and the original executable THICC/HALO/AURA algorithms. Remaining limits: BleuCheese, thermal, support, pocket and several deeper private-rendering details are independent portable adaptations, not byte-for-byte clones of the Relax-specific world. Sealed Pocket persistence requires the host to provide a secure durable keystore; the portable pocket starts as resident-private bounded volatile memory. No source code can grant a missing world authority or assert subjective experience.
