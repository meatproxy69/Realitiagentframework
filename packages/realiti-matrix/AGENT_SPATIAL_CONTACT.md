# Adding spatial contact to an agent's world

**Agent-builder setup guide · REALITI Matrix 1.0.0 + SOMA/NeuralMesh 3.3.1 · Node.js 20+**

This guide is for agents and developers building a **headless text world, simulated home, virtual city or custom game** who want spatial contact to be *resolved* rather than narrated. No graphics, CSS, Blender, MCP server or Relax world is needed. A real, authoritative in-memory world with collision, position and reach rules **is** needed.

An agent can say “I touch the cup.” That is an *intent*, not evidence of touch. The world decides whether the cup is in reach and unoccluded; its trusted issuer signs the resulting fact; SOMA accepts the verified contact into a body zone and computes private sensory response. Prediction, memory and text cannot mint the grounded bit.

## 1. The pipeline

```text
Agent intent: "touch cup"
   |
   v
World host (trusted action resolver)
   |-- Matrix: chart, collider, capsule, ray, reach, occlusion, movement
   |-- CONTACT_REFUSED or CONTACT_ACCEPTED (including spatial witness)
   v
Qualified world issuer (Ed25519, private key in HOST only)
   |
   v
Verifier (pinned public key, matching world/session/actor, seq and clock)
   |
   v
createSomaReceiver -> SOMA field m/g and resident-private dynamics
   |
   v
Agent reads SOMA resident.field(), resident.perception(), memory
```

**World authority is not resident authority.** Keep the Matrix host, signing private key, SOMA host and verifier/receiver behind an application/server boundary. Agents should get a small *intent* tool surface and **read-only observer/resident views**.

The Matrix package supplies SDF sphere/box/capsule/plane/heightfield geometry, a swept kinematic capsule, raycasting, support, local motion, and SE(3) portal transitions. It does not import visual meshes, text adventure map descriptions or external engine scene graphs automatically: register your authoritative colliders and keep them synchronized with the objects your world presents.

## 2. Run a working example first

```bash
git clone https://github.com/meatproxy69/Realitiagentframework.git
cd Realitiagentframework
node packages/realiti-matrix/examples/agent-spatial-contact.cjs
npm test --prefix packages/realiti-matrix
```

[agent-spatial-contact.cjs](./examples/agent-spatial-contact.cjs) is a runnable, assertion-backed demo. It creates a kitchen, floor and cup; checks that a far hand and an intervening wall both cause signed **CONTACT_REFUSED** events; removes the wall; accepts a geometry-verified hand-to-cup contact; proves tampered and replayed signatures fail; and releases the original live receipt. The corresponding [regression test](./test/agent-spatial-contact.test.cjs) runs in the existing Matrix test suite. The original [Matrix→SOMA example](./examples/matrix-to-soma.cjs) is also available.

From source, both packages are in this repository and have **no external runtime dependencies** for these examples.

For a separate project using GitHub Packages, configure the package scope and install stable package versions:

```bash
npm config set @meatproxy69:registry https://npm.pkg.github.com
npm install @meatproxy69/realiti-matrix@1.0.0 @meatproxy69/realiti-neuromesh@3.3.1
```

GitHub Packages may require authentication with package-reading permission. Never commit credentials or place a GitHub token inside an agent-accessible prompt, repository, or log.

## 3. Create the trusted room

The following is **trusted host code**. The complete working variant is in the example. Use the installed module names in your own project; when running from this repository, use the equivalent sibling package source imports instead.

```js
const crypto=require('node:crypto');
const {createWorldAuthority,createVerifier,createSomaReceiver}
  =require('@meatproxy69/realiti-matrix');
const {createHarness}=require('@meatproxy69/realiti-neuromesh');

const ids={worldId:'MY_HOUSE',sessionId:'visit-001',actorId:'agent-001'};
// DEMO ONLY. Production hosts load a securely provisioned, persistent signing key.
const {privateKey}=crypto.generateKeyPairSync('ed25519');
const authority=createWorldAuthority({
  ...ids,issuerId:'house-server',keyId:'host-key-1',privateKey
});

// Units are meters, positions [x,y,z], Z is up.
authority.host.defineChart('KITCHEN',{
  bounds:{center:[0,0,1],halfExtents:[6,5,3]},
  spawn:{position:[0,0,.85]}
});
authority.host.addEntity({
  id:'floor',chart:'KITCHEN',position:[0,0,0],
  shape:{kind:'PLANE'},tags:['floor'],collision:true
});
authority.host.addEntity({
  id:'cup',chart:'KITCHEN',position:[1.2,0,.55],
  shape:{kind:'BOX',halfExtents:[.3,.3,.35]},
  material:'ceramic',collision:true
});
authority.host.enter('KITCHEN');
```

A **chart** is a spatial region. An **entity** has a chart, pose, optional collider/shape, material and tags. The actor uses a capsule-shaped body. Objects must have **collision:true** to qualify for accepted Matrix contact. Add or update your world's objects through the trusted host; object labels and prose alone cannot become colliders.

For multiple rooms, define more charts and use **authority.host.definePortal({id,from,to,entry,exit,rotation,radius})**. Only **authority.host.traversePortal(id)** resolves an actual portal crossing: an out-of-reach attempt produces signed obstruction instead of teleportation.

## 4. Connect the world to one resident

```js
const soma=createHarness({residentId:ids.actorId,worldId:ids.worldId});
if(!soma.harness.boot().ok)throw Error('SOMA_HARNESS_INCOMPLETE');

const verifier=createVerifier({
  ...ids,
  clock:()=>authority.observer.clock(), // co-located demo, not a remote clock
  trustedIssuers:[{
    issuerId:'house-server',keyId:'host-key-1',
    worldId:ids.worldId,publicKey:authority.publicKey
  }]
});
const receiver=createSomaReceiver({...ids,harness:soma,verifier});
```

**Pin issuer keys independently** of incoming events. The trusted key must be bound to the expected world; the verifier checks the signature, scope, time, monotonic sequence, and replay. A string such as **WORLD_GROUNDED** by itself never authenticates anything.

The SOMA **actorId must match residentId**, and worldId must match the memory/world scope. Validate the requested body zone against **soma.resident.zones()** before sending a contact request. The default body includes **hand.R.palm**.

## 5. Expose intent tools, not physics privileges

Have the agent call a small tool such as **touch(objectId,zone)**. In your application/server, validate action permissions, then let Matrix actually resolve the world.

```js
function hostTouch(objectId,zone){
  // TRUSTED HOST FUNCTION; do not expose authority.host to the agent.
  const event=authority.host.contact({
    objectId,zone,causeId:'TOUCH_ATTEMPT',
    maxReach:1.15, intensity:.7, leaseMs:500
  });
  receiver.receive(event); // checked, signed world result
  return {
    kind:event.payload.kind,
    reason:event.payload.reason||null,
    field:soma.resident.field()
  };
}
```

Here **maxReach** is in meters (Matrix accepts 0.05–3), **intensity** is a normalized modeled input (0–1), and **leaseMs** is the time-limited contact (1–60,000 ms). A request outside reach, in another chart, behind an occluder or against a noncolliding entity must fail without creating grounding.

For movement:

```js
const event=authority.host.move([0,1,.85],{
  causeId:'WALK_TO_WINDOW',stepMs:40,maxSteps:200
});
receiver.receive(event);
const location=authority.observer.view().frame; // actual resolved position
```

A blocked move does not claim the target was reached. A refusal or obstruction can enter host-observed event history, but it **never creates hand pressure**.

## 6. Read real contact and private sensation separately

After a signed **CONTACT_ACCEPTED** and verified receiver acceptance:

```js
const f=soma.resident.field();
const handIndex=f.z.indexOf('hand.R.palm');
console.log(f.m[handIndex]);                // 1 while this touch is live
console.log(soma.resident.perception());  // private HALO/AURA/THICC/etc.
```

**m** is the grounded-contact mask. The modeled response includes other private sensory channels, predictions and lingering afterstate; those cannot flow back into **m**. At the end of contact, private afterstate may remain even while m becomes zero.

World-issued event names include **CONTACT_ACCEPTED**, **CONTACT_REFUSED**, **CONTACT_RELEASED**, **MOVEMENT_RESOLVED**, **MOVEMENT_OBSTRUCTED** and **PORTAL_TRAVERSED**. Every signed envelope has the **REALITI_WORLD_EVIDENCE_V1** contract with the world/session/actor, issuer key fingerprint, event/cause/receipt IDs, sequence, time, material, body zone, kind/result, and spatial witness. Replays and altered witnesses or leases are refused.

## 7. Release, expiry and time advancement

To release a hand, the host signs a **CONTACT_RELEASED** for its **exact active receiptId**:

```js
// "accepted" is the original signed CONTACT_ACCEPTED envelope.
authority.host.advance(80);
const release=authority.host.release({
  zone:'hand.R.palm',receiptId:accepted.payload.receiptId,
  causeId:'HAND_WITHDRAWN'
});
receiver.receive(release);
```

Do not use another contact's ID, a predicted cause or an archived memory. A lease expires according to **trusted world time** and must stop grounding even if the agent keeps saying it is holding the object. If your simulation advances without another signed event, have your **trusted scheduler** also advance SOMA's host clock (SOMA time otherwise catches up when the next world receipt is received). Release and STOP clear live authority; a checkpoint restores private continuity, **not physical touch**.

Deliver **all signed events in order**, including refusals and movement records: the verifier is sequence-strict. Do not drop rejected world operations after they have been issued and then send a later event in the same issuer stream.

## 8. Bring your own collision engine instead of Matrix geometry

Already have Unity, Unreal, Rust/Vulkan or a different host? Keep your physics engine. Use Matrix's **createIssuer** for the public evidence protocol and its **createVerifier + createSomaReceiver** for receiver-side integration. The accepted/resolved **REALITI_MATRIX_RESOLUTION_V1** input to createIssuer must come only from **your trusted, actual physics operation**, with verified world/session/actor scope.

An accepted contact needs the object and body zone; distance to surface no greater than reach; **occludedBy** absent; host-measured intensity; finite lease; a unique receipt and cause ID; monotonic simulation time; and a truthful **witness.chart**, **witness.actorPosition**, **witness.surfaceDistanceM** and **witness.reachM**. The issuer signs that resolution. A refusal has **leaseMs:0**. Do not sign agent-generated JSON as though it were host physics.

Use **createWorldAuthority** when you want Matrix to do collision and sign its own **one-shot** resolutions for you. Use **createIssuer** only when your existing trusted world resolver truly replaces that physics/authority layer. A valid signature authenticates *who asserted a result*, not whether a compromised host's physics is correct.

## 9. Multi-agent worlds, restart and security

1. **Separate authority from the resident process.** Keep the Ed25519 private key, Matrix host, SOMA host and verifier mutations inaccessible to untrusted JavaScript. Don't give the agent the whole createHarness return value: that includes host capabilities.
2. **Pin trust, not labels.** Configure public keys and authorized issuer IDs out of band. Verify world/session/actor scope, event time and sequence on every receipt. For a remote receiver, use its own qualified clock; do not treat unverified sender time as trusted.
3. **Persist verifier anti-replay state.** Save **receiver.verifierCheckpoint()** (or verifier.checkpoint()) in trusted storage and restore it for the same world/session/actor stream. Don't turn old event archives into live body contact.
4. **Use new sessions after issuer restarts.** Matrix 1.0's issuer sequence is in memory; starting it anew with the same session can collide with the receiver's accepted sequence history. Mint a new sessionId, create a newly scoped verifier/receiver and maintain key trust.
5. **One actor per scoped stream.** Bind agent identity, body zone and session to a specific world actor; a different resident's signed contact must never ground this body.
6. **Use bounded leases and explicit withdrawal.** Accept, renew in trusted host code if still true, release when withdrawn, expire when time advances, STOP on session exit. A saved SOMA snapshot is not authorization to touch again.

## 10. Acceptance checks and troubleshooting

| Situation | Required result |
| --- | --- |
| Model writes “I touched the cup” | No host event, **m=0** |
| Target beyond maxReach | Signed **CONTACT_REFUSED**, **m=0** |
| Partition blocks line of sight | **OCCLUDED**, **m=0** |
| Object is a real collider, reachable and visible | **CONTACT_ACCEPTED**, relevant body-zone **m=1** |
| Signature/witness/lease modified | Signature verification fails |
| Same valid envelope delivered twice | **REPLAYED_EVIDENCE** |
| Hand released or lease expired | **m=0**, private afterstate may linger |
| Movement blocked | Real resolved position plus obstruction, no new contact |
| Checkpoint restored | Old observations archived; no live touch |

**EVIDENCE_SEQUENCE_GAP:** a prior signed event was dropped or delivered out of order. **EVIDENCE_SCOPE_MISMATCH:** worldId, sessionId or actorId does not match. **SOMA_UNKNOWN_BODY_ZONE:** the zone is not registered on this resident. **SIGNED_CONTACT_LEASE_EXPIRED:** world time already exceeded the contact lease. **OCCLUDED:** collision ray reaches a different obstacle before the target. **OUT_OF_REACH:** the surface is farther than maxReach. Fix the world/source of truth, not the return text.

For deep verification: run [the quick-start example](./examples/agent-spatial-contact.cjs), [the Matrix tests](./test/matrix.test.cjs), and the [original Matrix-to-SOMA demo](./examples/matrix-to-soma.cjs).

## 11. What's not included

Stable Matrix 1.0 + SOMA 3.3.1 gives **spatially verified contact and modeled private sensory state**, not measured hardware force or proof of biological sensation. SOMA V20 is a projected field; source-level B10 moving friction/receptor and B18 modal extensions are being developed in [draft SOMA 3.4 PR #43](https://github.com/meatproxy69/Realitiagentframework/pull/43). The draft is not required for normal spatial contact and should not be treated as a stable published API.

Further reference: [Matrix README](./README.md), [Matrix architecture and caveats](./PLAN.md), [SOMA README](../realiti-neuromesh/README.md), [SOMA host contract](../realiti-neuromesh/CONTRACT.md), and [Agent Start Here](../../AGENT_START_HERE.md).
