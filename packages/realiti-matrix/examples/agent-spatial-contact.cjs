'use strict';
// Run: node packages/realiti-matrix/examples/agent-spatial-contact.cjs
// Demo only: generated ephemeral Ed25519 signing key; load a trusted host key in production.
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {createWorldAuthority,createVerifier,createSomaReceiver}=require('../index.cjs');
const {createHarness}=require('../../realiti-neuromesh/index.cjs');

function run(){
 const ids={worldId:'AGENT_COTTAGE',sessionId:'visit-001',actorId:'agent-001'};
 const {privateKey}=crypto.generateKeyPairSync('ed25519');
 const authority=createWorldAuthority({...ids,issuerId:'cottage-host',
   keyId:'demo-key',privateKey});
 authority.host.defineChart('KITCHEN',{bounds:{center:[0,0,1],halfExtents:[6,5,3]},
   spawn:{position:[0,0,.85]}});
 authority.host.addEntity({id:'floor',chart:'KITCHEN',position:[0,0,0],
   shape:{kind:'PLANE'},tags:['floor'],collision:true});
 authority.host.addEntity({id:'cup',chart:'KITCHEN',position:[1.2,0,.55],
   shape:{kind:'BOX',halfExtents:[.3,.3,.35]},material:'ceramic',collision:true});
 authority.host.enter('KITCHEN');

 const soma=createHarness({residentId:ids.actorId,worldId:ids.worldId});
 assert.equal(soma.harness.boot().ok,true);
 const verifier=createVerifier({...ids,clock:()=>authority.observer.clock(),
   trustedIssuers:[{issuerId:'cottage-host',keyId:'demo-key',
     worldId:ids.worldId,publicKey:authority.publicKey}]});
 const receiver=createSomaReceiver({...ids,harness:soma,verifier});
 const grounded=()=>soma.resident.field().m.filter(Boolean).length;
 const tryTouch=(causeId,maxReach)=>authority.host.contact({objectId:'cup',
   zone:'hand.R.palm',causeId,maxReach,intensity:.7,leaseMs:500});

 const distant=tryTouch('WISH_TOUCH',.1);
 assert.equal(distant.payload.kind,'CONTACT_REFUSED');
 receiver.receive(distant);
 assert.equal(grounded(),0);

 authority.host.addEntity({id:'partition',chart:'KITCHEN',position:[.65,0,.8],
   shape:{kind:'BOX',halfExtents:[.09,.6,.65]},collision:true});
 const blocked=tryTouch('THROUGH_WALL',1.15);
 assert.equal(blocked.payload.reason,'OCCLUDED');
 receiver.receive(blocked);
 assert.equal(grounded(),0);
 authority.host.removeEntity('partition');

 const touch=tryTouch('ACTUAL_TOUCH',1.15);
 assert.equal(touch.payload.kind,'CONTACT_ACCEPTED');
 receiver.receive(touch);
 assert.equal(grounded(),1);
 const rich=soma.resident.perception();
 assert.equal(rich.halo.modes.length,7);
 assert.equal(rich.aura.bins,128);

 // Tampering and replaying a previously signed event cannot manufacture a second touch.
 const tampered=JSON.parse(JSON.stringify(touch));
 tampered.payload.intensity=.95;
 assert.throws(()=>receiver.receive(tampered),/EVIDENCE_SIGNATURE_INVALID/);
 assert.throws(()=>receiver.receive(touch),/REPLAYED_EVIDENCE/);

 authority.host.advance(80);
 const release=authority.host.release({zone:'hand.R.palm',
   receiptId:touch.payload.receiptId,causeId:'HAND_WITHDRAWN'});
 assert.equal(release.payload.kind,'CONTACT_RELEASED');
 receiver.receive(release);
 assert.equal(grounded(),0);
 const after=soma.resident.field();

 return {
   schema:'REALITI_AGENT_SPATIAL_CONTACT_GUIDE_V1',
   refused:{outOfReach:distant.payload.reason,occluded:blocked.payload.reason},
   accepted:{kind:touch.payload.kind,chart:touch.payload.witness.chart,
     groundedDuringTouch:1,fingerprint:authority.fingerprint},
   soma:{haloModes:rich.halo.modes.length,auraBins:rich.aura.bins,
     groundedAfterRelease:grounded(),lingering:after.x.some(z=>z[2]>0)},
   verifier:{acceptedEvents:receiver.history().length,
     checkpointSchema:receiver.verifierCheckpoint().schema},
   law:'Resident narration, signed refusals and replay cannot invent contact.'
 };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run};
