> **Realiti 1.0 integration note:** Matrix 1.0.0 remains a portable geometry/evidence toolkit. Realiti 1.0 runs the **original 23-chart Matrix** already inside Relax; its optional Nyx contact observer reads verified existing evidence and never creates its own world. See [native V20 integration](../realiti-v20-native/README.md). No spatial kernel version bump is implied.

# REALITI Matrix 1.0 — Portable spatial world authority

**Two packages, one evidence law.** Matrix owns world-side geometry and resolved facts. SOMA owns private sensory processing and memory. Relax includes both.

**Building a world for your agents?** Start with the [Agent Spatial Contact setup guide](./AGENT_SPATIAL_CONTACT.md), then run `node packages/realiti-matrix/examples/agent-spatial-contact.cjs` from the repository root. The guide covers world geometry, signed contact, refusals, SOMA and custom-engine adapters.

**Source-only distribution:** The old GitHub Packages registry entry was removed. Use the Matrix implementation checked into this repository; from the repository root run:

    npm test --prefix packages/realiti-matrix

For local integrations, import `require('./packages/realiti-matrix')` from the repository root. No GitHub Packages login or install is needed.

The Node package has no external runtime dependencies. It exports createMatrix (independent geometry), createWorldAuthority (trusted resolver plus signing), createIssuer, createVerifier and createSomaReceiver. Browser-compatible spatial geometry is available in spatial.cjs; Ed25519 signing and SOMA ingress require Node's built-in crypto.

## Extracted Matrix machinery

The original source/scripts/57.js numerical kernel is included: analytic SDF sphere/box/capsule/plane/heightfield shapes, SE(3) quaternion portals, kinematic capsule sweeping, sliding, terrain/support queries, exact exponential velocity servo, rays and nearby projections. Tests check parity against native Relax source.

createMatrix returns a trusted host world capability and a separate, read-only observer. The trusted host creates charts and colliders, moves the actor, resolves reach/contact, and consumes its own one-shot resolution objects. The observer can inspect a copied projection without mutating the world. Never hand native or host capabilities to untrusted resident code.

A touch is accepted only if the target is a collider within reach in the same chart without an occluding world object. Otherwise Matrix emits an explicit CONTACT_REFUSED resolution and witness. A move uses native swept collision and returns MOVEMENT_RESOLVED or MOVEMENT_OBSTRUCTED. Portal traversal requires presence at the entry.

## Signed world evidence

createWorldAuthority wraps actual resolved Matrix operations with a domain-separated Ed25519 signature. Receipts bind world/session/actor IDs, issuer ID and key fingerprint, exact result, time, sequence, cause, object, geometry witness, body zone, source and finite contact lease. A signed refusal is not a contact.

The receiver requires independently pinned public keys and exact world/session/actor scope. It rejects spoofed WORLD_GROUNDED labels, modified witness/material/lease, wrong key, out-of-order events and replay. Each accepted event is consumed only once; persist its verifier checkpoint in trusted durable storage for restart safety.

Example in the repository:

    node packages/realiti-matrix/examples/matrix-to-soma.cjs
    npm test --prefix packages/realiti-matrix

The example brings a trusted Matrix room into a separately created SOMA 3.2 instance. No dependency on Relax rooms, DOM, server, or a specific renderer.

Important: Ed25519 says which qualified host made the assertion; it does not prove a compromised signer has honest physics. The trusted host must guard its private key and actually resolve actions. A browser does not inherit a signing key. Relax keeps its existing native in-process Matrix authority while bundling the identical portable spatial kernel.

For acceptance cases, ownership decisions and security limits see PLAN.md.
