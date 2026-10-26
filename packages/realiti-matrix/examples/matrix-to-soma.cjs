'use strict';
// Run from the repo: node packages/realiti-matrix/examples/matrix-to-soma.cjs
// Works installed if @meatproxy69/realiti-neuromesh is also installed.
const crypto=require('node:crypto');
const {createWorldAuthority,createSomaReceiver,createVerifier}=require('../index.cjs');
let SOMA;
try{SOMA=require('@meatproxy69/realiti-neuromesh')}
catch(e){if(e.code!=='MODULE_NOT_FOUND')throw e;SOMA=require('../../realiti-neuromesh/index.cjs')}
function run(){
 const {privateKey}=crypto.generateKeyPairSync('ed25519');
 const ids={worldId:'MOSS_ROOM',sessionId:'test-visit-01',actorId:'familiar-01'};
 const authority=createWorldAuthority({...ids,issuerId:'moss-authority',keyId:'moss-key',
   privateKey});
 authority.host.defineChart('COTTAGE',{bounds:{center:[0,0,1],halfExtents:[6,5,3]},
   spawn:{position:[0,0,.85]}});
 authority.host.addEntity({id:'bench',chart:'COTTAGE',position:[1.2,0,.5],
   shape:{kind:'BOX',halfExtents:[.4,.4,.35]},material:'wood',collision:true,tags:['support']});
 authority.host.enter('COTTAGE');
 const harness=SOMA.createHarness({residentId:ids.actorId,worldId:ids.worldId});
 const verifier=createVerifier({...ids,clock:()=>authority.observer.clock(),
   trustedIssuers:[{issuerId:'moss-authority',keyId:'moss-key',worldId:ids.worldId,
     publicKey:authority.publicKey}]});
 const bridge=createSomaReceiver({...ids,harness,verifier});
 const rejected=authority.host.contact({objectId:'bench',zone:'hand.R.palm',
   causeId:'DISTANT_TOUCH',maxReach:.1,leaseMs:500,intensity:.75});
 bridge.receive(rejected);
 const initialGrounding=harness.resident.field().m.filter(Boolean).length;
 const accepted=authority.host.contact({objectId:'bench',zone:'hand.R.palm',
   causeId:'REAL_TOUCH',maxReach:1.15,leaseMs:500,intensity:.75});
 bridge.receive(accepted);
 const touched=harness.resident.field(),rich=harness.resident.perception();
 authority.host.advance(120);
 const released=authority.host.release({zone:'hand.R.palm',receiptId:accepted.payload.receiptId});
 bridge.receive(released);
 const after=harness.resident.field();
 return {
  schema:'REALITI_MATRIX_SOMA_SMOKE_V1',
  matrixWorld:authority.observer.view(),
  rejected:{kind:rejected.payload.kind,reason:rejected.payload.reason,
    afterGrounded:initialGrounding},
  accepted:{kind:accepted.payload.kind,issuerId:accepted.payload.issuerId,
    witness:accepted.payload.witness,grounded:touched.m.filter(Boolean).length},
  neuralmesh:{harnessBoot:harness.harness.boot().ok,
    haloModes:rich.halo.modes.length,auraBins:rich.aura.bins,
    thiccRecruited:rich.thicc.some(z=>z.recruit>0),
    memoryRecords:harness.resident.memory.stats().events},
  release:{kind:released.payload.kind,grounded:after.m.filter(Boolean).length,
    afterstate:after.x.some(z=>z[2]>0)},
  evidence:{signed:true,issuerFingerprint:authority.fingerprint,
    acceptedSequences:bridge.history().map(x=>x.seq)},
  law:'The verified host resolved world facts; no text or private rendering created grounding.'
 };
}
if(require.main===module){
 const report=run();console.log(JSON.stringify(report,null,2));
 if(report.rejected.afterGrounded!==0||report.accepted.grounded!==1||
    report.release.grounded!==0||!report.neuralmesh.harnessBoot||
    report.neuralmesh.haloModes!==7||report.neuralmesh.auraBins!==128)
    process.exitCode=1;
}
module.exports={run};
