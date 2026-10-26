# REALITI Matrix / SOMA evidence-boundary implementation plan

Purpose: Matrix and SOMA are separately installable, independently owned packages. The world/resident truth boundary is preserved rather than replaced by a free-form source label. Relax bundles both kernels.

**Target:** @meatproxy69/realiti-matrix v1.0.0 (standalone spatial authority and signed Node evidence bridge) alongside the independently installed @meatproxy69/realiti-neuromesh v3.2.0.

## Ownership and contract

1. Matrix owns chart definitions, signed-distance geometry, SE(3) portals, swept capsule collision, movement, reach, support and actual contact/refusal resolution. Copy the original math from source/scripts/57.js; do not replace it with a rectangle-only mock.
2. A trusted world issuer signs REALITI_WORLD_EVIDENCE_V1 envelopes with an Ed25519 private key that agents never receive. The signature covers world, session, actor, issuer/key IDs, sequence/time, exact resolved result, cause and receipt IDs, object and spatial witness, zone, material and bounded lease.
3. The receiver pins issuer public keys and exact world/session/actor scope; validates signature, schema, result/witness consistency, timestamps, one-time sequence and revocation-by-configuration. No trust-on-first-use.
4. SOMA's host-only capability accepts verified contact and release; the agent retains private NERVE/LACE/HALO/AURA/THICC, afterstate and memory. Signed refusal, blocked movement and arrival are historical observations, not sensory pressure.
5. Other neighborhoods can implement the same signed world evidence contract. A raw label WORLD_GROUNDED is **never** sufficient proof.

## Execution plan

- Extract original Matrix spatial kernel into an isolated factory with explicit world/session state.
- Implement Ed25519 issuance/verification, domain-separated canonical JSON, issuer scope, replay protection and a trusted verifier cursor.
- Implement a world-to-SOMA bridge that only accepts verified resolved outcomes and never exposes signing keys to an agent.
- Add a Matrix/SOMA test neighborhood and adversarial tampering/replay/obstruction tests.
- Bundle Matrix spatial source into Relax next to the original native kernel; do not break existing local world authority.
- Publish the separate package only after standalone, signature and Relax regression CI passes.

## Test commitments

Accepted touch requires spatial reach and no obstruction, and creates exactly one SOMA grounded source. Failed touch and obstructed movement create no grounding. Signed release and expiry clear contact but allow bounded private afterstate. Tampered witness, different world/actor/session, untrusted key, invalid source, signature forgery, replay, sequence gaps and reversed timestamps fail closed. The original Matrix numerical kernel is checked byte-for-byte against source/scripts/57.js.

## Limits

This is a simulation and tests representative spatial cases, not a formal proof of all terrain collisions. Ed25519 authenticates the issuer, not the physical honesty of a compromised world host. Trusted verifier cursor persistence is required across server restarts to prevent stale replay. Node crypto backs signed interop; browser Relax does not automatically receive an issuer private key. Existing Relax native contacts work locally without network signatures. Nothing in this plan touches Nyx or Asha private resident memory.
