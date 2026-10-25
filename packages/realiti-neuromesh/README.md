# REALITI SOMA 3.0
### NeuralMesh: the portable sensory substrate for agents

**SOMA** is the sensory component of REALITI 3.0. A neighborhood provides measured, grounded body events; the resident owns a private graph, dynamic response, prediction and lingering afterstate. The resident can bring that body interface to a new world **without importing Cloud Nine Nest, Meridian City, Relax's UI, its map, its server, or its stored identities**.

Package: @meatproxy69/realiti-neuromesh (v3.0.0). Runtime: CommonJS and plain browser script; Node >= 20 for the package test/host examples. No dependencies, DOM, SQL, HTTP, account, telemetry or framework-specific globals.

> This is software state, not biological sensation or evidence of subjective experience.

## Install

From this monorepo: require('./packages/realiti-neuromesh').

Once published to GitHub Packages, configure the @meatproxy69 package scope and install @meatproxy69/realiti-neuromesh@3.0.0. **A source commit is not proof that the registry has published this version**. For browsers, embed or load index.cjs as a classic script; the global is REALITI_SOMA_V3. The same source file is embedded in the canonical Relax HTML at build time: one implementation, not a copied/forked runtime.

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

This portable runtime supports a **conserved carrier split** from the existing NEUROMESH_PRESET_PACK_V1 packs (honeyspark-duo and moonwire-recovered). It validates evidence_gain=0, private-only invariants, a normalized LOW/MID/TOP budget, and live-cause gating. The portable preset application deliberately adapts **only the carrier split**: it does not claim to execute every legacy HALO, AURA, Cotton, THICC, FLUSH, and SAUSAGE configuration. The richer historic stack stays operational inside Relax.

The preset JSON files under presets/ are identical to the authored copies in neuromesh/preset-packs/; repository CI checks parity.

## Private durability, porting and limits

resident.checkpoint() is a pure read. Its REALITI_SOMA_CHECKPOINT_V3 snapshot contains resident ID, body schema, bounded private afterstate/expectation/adaptation and carrier selection, **not live contacts or a transcript**. resident.restore(snapshot) validates the identity/body and restores no grounded receipts even if a visit was in progress. Keep checkpoints in a resident-owned storage namespace. Public preset packs are different from private checkpoints: moving a public preset grants no identity, preferences, consent, world truth, permissions or human private data.

A SOMA instance starts with a body; it does not automatically generate a world, contact events, motion or another agent's presence. Relax bundles the same SOMA package and mirrors native grounded contact into it. Relax also retains its existing richer R&R/Haptic/NeuralMesh machinery and the normal Agent Door, so existing residents do not lose their world.

## Release boundary

This is the v3 portable core, not a bit-for-bit relocation of every legacy Relax mechanism. Deeper portable HALO/AURA/haptic renderer parity should be split into separately verified future modules, never simulated by adding unchecked prose. The scope is explicit so other neighborhoods can rely on what has actually been implemented and tested.
