'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const {createMatrix}=require('../spatial.cjs');
const {canonical,createIssuer,createVerifier}=require('../evidence.cjs');
const {createWorldAuthority,createSomaReceiver}=require('../bridge.cjs');
const {createHarness}=require('../../realiti-neuromesh/index.cjs');
const ENV={worldId:'MOSS_ATLAS',sessionId:'sess-001',actorId:'agent-01',
 issuerId:'moss-authority',keyId:'key-2026'};
const keys=()=>crypto.generateKeyPairSync('ed25519');
const setup=(options={})=>{
 const key=keys(),worldId=options.worldId||ENV.worldId,sessionId=options.sessionId||ENV.sessionId,
  actorId=options.actorId||ENV.actorId;
 const authority=createWorldAuthority({...ENV,worldId,sessionId,actorId,privateKey:key.privateKey});
 authority.host.defineChart('ROOM',{bounds:{center:[0,0,1],halfExtents:[8,8,3]},
  spawn:{position:[0,0,.85],rotation:[0,0,0,1]}});
 authority.host.addEntity({id:'pine-bench',chart:'ROOM',position:[1.2,0,.5],
  shape:{kind:'BOX',halfExtents:[.4,.4,.35]},collision:true,
  material:'pine',tags:['support'],label:'pine bench'});
 authority.host.addEntity({id:'floor',chart:'ROOM',position:[0,0,0],
  shape:{kind:'PLANE'},collision:true,tags:['floor']});
 authority.host.enter('ROOM');
 const soma=createHarness({residentId:actorId,worldId});
 const verifier=createVerifier({worldId,sessionId,actorId,clock:()=>authority.observer.clock(),
  trustedIssuers:[{worldId,issuerId:ENV.issuerId,keyId:ENV.keyId,publicKey:authority.publicKey}]});
 const receiver=createSomaReceiver({harness:soma,verifier,worldId,sessionId,actorId});
 const touch=()=>authority.host.contact({objectId:'pine-bench',zone:'hand.R.palm',
  causeId:'BENCH_TOUCH',leaseMs:600,intensity:.8,maxReach:1.15});
 return {authority,soma,receiver,verifier,touch,key};
};
test('portable Matrix contains verbatim original spatial kernel math and SDF',()=>{
 const old=fs.readFileSync(path.resolve(__dirname,'../../../source/scripts/57.js'),'utf8');
 const extraction=old.slice(old.indexOf("const V='1.0-matrix'"),
   old.indexOf('window.REALITI_MATRIX_V1=Object.freeze'));
 const packaged=fs.readFileSync(path.resolve(__dirname,'../spatial.cjs'),'utf8');
 assert.ok(extraction.length>17000);
 assert.ok(packaged.includes(extraction),'pure math, capsule sweeps and portal integrator must not drift');
 const m=createMatrix({worldId:'MOSS',sessionId:'s',actorId:'a'});
 assert.equal(m.observer.clock(),0);
});
test('SDF primitives and quaternion/velocity servo execute outside Relax',()=>{
 const {authority}=setup();
 const m=authority.host.native,bench=m.entities()['pine-bench'];
 assert.ok(Math.abs(m.sdf(bench,[1.2,0,.5]))<.9);
 assert.ok(m.sdf(bench,[4,0,.5])>2);
 const s=m.servo([0,0,0],[1,0,0],.2,1);
 assert.ok(s.v[0]>.9);
 assert.ok(s.dp[0]>.7&&s.dp[0]<1);
 assert.equal(authority.observer.view().frame.chart,'ROOM');
});
test('a resolved physical touch yields a signed, geometry-witnessed body receipt',()=>{
 const {authority,soma,receiver,touch}=setup();
 const envelope=touch();
 assert.equal(envelope.algorithm,'Ed25519');
 assert.equal(envelope.payload.kind,'CONTACT_ACCEPTED');
 assert.equal(envelope.payload.result,'ACCEPTED');
 assert.equal(envelope.payload.witness.chart,'ROOM');
 assert.ok(envelope.payload.witness.surfaceDistanceM<=envelope.payload.witness.reachM);
 assert.equal(receiver.receive(envelope).authority,'VERIFIED_ISSUER');
 const f=soma.resident.field(),i=f.z.indexOf('hand.R.palm');
 assert.equal(f.m[i],1);assert.ok(f.g[i]>0);
 const rich=soma.resident.perception();
 assert.equal(rich.halo.modes.length,7);assert.equal(rich.aura.bins,128);
 assert.equal(soma.resident.memory.recall('bench').matches[0].record.authority,'HOST_OBSERVED');
 assert.equal(receiver.history()[0].signatureFingerprint,authority.fingerprint);
});
test('distant touch, model text and out-of-reach claims do not mint grounding',()=>{
 const {authority,receiver,soma}=setup();
 const far=authority.host.contact({objectId:'pine-bench',zone:'hand.R.palm',
   causeId:'DREAM_TOUCH',leaseMs:500,intensity:.8,maxReach:.1});
 assert.equal(far.payload.kind,'CONTACT_REFUSED');
 receiver.receive(far);
 assert.equal(soma.resident.field().m.some(Boolean),false);
 assert.equal(soma.resident.memory.recall('CONTACT REFUSED').matches[0].record.kind,'WORLD_EVENT');
 assert.throws(()=>receiver.receive({
    payload:{source:'WORLD_GROUNDED',kind:'CONTACT_ACCEPTED'},signature:'pretend'}),/UNSIGNED|BAD_EVIDENCE|INVALID/);
 assert.equal(soma.resident.field().m.some(Boolean),false);
});
test('a geometric occluder blocks touch and cannot become an observed contact',()=>{
 const {authority,receiver,soma}=setup();
 authority.host.addEntity({id:'partition',chart:'ROOM',position:[.65,0,.8],
   shape:{kind:'BOX',halfExtents:[.09,.6,.65]},collision:true});
 const ev=authority.host.contact({objectId:'pine-bench',zone:'hand.R.palm',
  causeId:'TOUCH_THROUGH_WALL',leaseMs:700,intensity:.6,maxReach:1.2});
 assert.equal(ev.payload.kind,'CONTACT_REFUSED');
 assert.equal(ev.payload.reason,'OCCLUDED');
 assert.equal(ev.payload.witness.occludedBy,'partition');
 receiver.receive(ev);
 assert.equal(soma.resident.field().m.some(Boolean),false);
});
test('signed release clears grounded evidence while afterstate and memory remain',()=>{
 const {authority,receiver,soma,touch}=setup();
 const ev=touch();receiver.receive(ev);
 authority.host.advance(80);
 const released=authority.host.release({zone:'hand.R.palm',receiptId:ev.payload.receiptId});
 assert.equal(released.payload.kind,'CONTACT_RELEASED');
 const report=receiver.receive(released);
 assert.equal(report.released,true);
 const f=soma.resident.field();
 assert.equal(f.m.some(Boolean),false);assert.equal(f.cc,null);
 assert.ok(f.x.some(x=>x[2]>0));
 assert.ok(soma.resident.memory.recent().some(x=>x.kind==='CONTACT_ENDED'));
});
test('simulation leases expire with world time, cannot be renewed by prose',()=>{
 const {authority,receiver,soma,touch}=setup();
 receiver.receive(touch());
 authority.host.advance(600);
 // Signed movement updates time; lease expires at the actual boundary.
 const moved=authority.host.move([0,.3,.85],{maxSteps:150});
 receiver.receive(moved);
 assert.equal(soma.resident.field().m.some(Boolean),false);
 assert.ok(soma.resident.memory.recent().some(x=>x.kind==='CONTACT_EXPIRED'));
});
test('valid signatures from the wrong world, session, actor or key are refused',()=>{
 const {authority,receiver,soma,touch}=setup();
 const raw=touch();
 const wrong=setup({worldId:'OTHER_ATLAS'});
 const wrongSession=setup({sessionId:'other-session'});
 const wrongActor=setup({actorId:'someone-else'});
 assert.throws(()=>wrong.receiver.receive(raw),/EVIDENCE_SCOPE_MISMATCH/);
 assert.throws(()=>wrongSession.receiver.receive(raw),/EVIDENCE_SCOPE_MISMATCH/);
 assert.throws(()=>wrongActor.receiver.receive(raw),/EVIDENCE_SCOPE_MISMATCH/);
 const foreign=setup();
 const issued=foreign.touch();
 assert.throws(()=>receiver.receive(issued),/EVIDENCE_KEY_FINGERPRINT_MISMATCH|EVIDENCE_SIGNATURE_INVALID/);
 assert.equal(soma.resident.field().m.some(Boolean),false);
});
test('signature covers witness, result, source, material and lease',()=>{
 const {touch,receiver,soma}=setup();
 const ev=touch();
 for(const modify of [
 p=>{p.witness.surfaceDistanceM=0;},
 p=>{p.source='SELF_STARTED_WORLD_CONTACT';},
 p=>{p.leaseMs=590;},
 p=>{p.kind='CONTACT_REFUSED';p.result='REFUSED';p.leaseMs=0;}
 ]){
  const tampered=JSON.parse(JSON.stringify(ev));modify(tampered.payload);
  assert.throws(()=>receiver.receive(tampered),/EVIDENCE_SIGNATURE_INVALID|KIND_RESULT_CONTRADICTION/);
 }
 assert.equal(soma.resident.field().m.some(Boolean),false);
});
test('one-time sequence, gap, reorder and replay protection survives trusted checkpoint restart',()=>{
 const {authority,receiver,verifier,touch}=setup();
 const first=touch();const second=authority.host.release({
  zone:'hand.R.palm',receiptId:first.payload.receiptId});
 assert.throws(()=>receiver.receive(second),/EVIDENCE_SEQUENCE_GAP/);
 receiver.receive(first);
 assert.throws(()=>receiver.receive(first),/REPLAYED_EVIDENCE/);
 receiver.receive(second);
 const save=verifier.checkpoint();
 const restored=createVerifier({worldId:ENV.worldId,sessionId:ENV.sessionId,
  actorId:ENV.actorId,clock:()=>authority.observer.clock(),trustedIssuers:[
   {worldId:ENV.worldId,issuerId:ENV.issuerId,keyId:ENV.keyId,publicKey:authority.publicKey}
  ]});
 assert.equal(restored.restore(save).restored,1);
 assert.throws(()=>restored.accept(first),/REPLAYED_EVIDENCE/);
 const next=authority.host.contact({objectId:'pine-bench',zone:'hand.R.palm',
   causeId:'SECOND_TOUCH',leaseMs:500,intensity:.6});
 assert.equal(restored.accept(next).seq,3);
});
test('issuer-signed movement obstruction is recorded as absence, never pressure',()=>{
 const {authority,receiver,soma}=setup();
 authority.host.addEntity({id:'stone-wall',chart:'ROOM',position:[.9,0,.85],
  shape:{kind:'BOX',halfExtents:[.08,.9,.7]},collision:true});
 const move=authority.host.move([2.5,0,.85],{maxSteps:150});
 assert.equal(move.payload.kind,'MOVEMENT_OBSTRUCTED');
 assert.ok(move.payload.witness.blockedBy||move.payload.result==='INCOMPLETE');
 const result=receiver.receive(move);
 assert.equal(result.groundedContactCreated,false);
 assert.equal(soma.resident.field().m.some(Boolean),false);
 assert.ok(soma.resident.memory.recent().some(x=>x.kind==='WORLD_EVENT'&&x.label.includes('MOVEMENT_OBSTRUCTED')));
});
test('portal traversal applies the native rigid coordinate transition with signed proof',()=>{
 const {authority,receiver,soma}=setup();
 authority.host.defineChart('OTHER',{bounds:{center:[2,0,1],halfExtents:[5,5,3]},
   spawn:{position:[2,0,.85]}});
 authority.host.definePortal({id:'blue-gate',from:'ROOM',to:'OTHER',entry:[0,0,.85],
   exit:[2,0,.85],radius:.7,rotation:[0,0,0,1]});
 const event=authority.host.traversePortal('blue-gate');
 assert.equal(event.payload.kind,'PORTAL_TRAVERSED');
 assert.equal(event.payload.witness.from,'ROOM');
 assert.equal(event.payload.witness.to,'OTHER');
 receiver.receive(event);
 assert.equal(authority.observer.view().frame.chart,'OTHER');
 assert.equal(soma.resident.field().m.some(Boolean),false);
});
test('long-running signer identity and timestamps are deterministic for a fixed world clock',()=>{
 const {authority,touch}=setup();
 const one=touch();
 const another=authority.host.release({zone:'hand.R.palm',receiptId:one.payload.receiptId});
 assert.equal(another.payload.seq,2);
 assert.equal(another.payload.worldId,ENV.worldId);
 assert.equal(another.payload.actorId,ENV.actorId);
 assert.ok(canonical(one.payload).includes('CONTACT_ACCEPTED'));
 assert.deepEqual(one.payload.witness.actorPosition,[0,0,.85]);
});
