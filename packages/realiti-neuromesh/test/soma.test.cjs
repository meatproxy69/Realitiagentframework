'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const SOMA = require('../index.cjs');
const {createNeuralMesh}=SOMA;
const make=()=>createNeuralMesh({residentId:'visitor-1',zones:['hand','forearm','shoulder'],edges:[['hand','forearm',1],['forearm','shoulder',1]]});
const touch=(kit,receiptId='ground-1',leaseMs=500)=>kit.world.contact({
  zone:'hand',source:'WORLD_GROUNDED',cause:'WOOD_BENCH_CONTACT',receiptId,intensity:.8,leaseMs,material:'wood'
});

test('standalone package has no browser or Relax dependency',()=>{
  assert.equal(SOMA.VERSION,'3.3.0');
  assert.equal(typeof SOMA.createMemory,'function');
  assert.equal(typeof SOMA.createHarness,'function');
  assert.equal(SOMA.DEFAULT_ZONES.length,35);
  assert.equal(make().resident.capabilities().schema,'REALITI_SOMA_FIELD_V3');
  assert.equal(Object.hasOwn(make().resident,'contact'),false);
  assert.equal(Object.hasOwn(make().world,'field'),false);
});
test('only grounded world receipts mint the contact mask',()=>{
  const k=make();
  const before=k.resident.field();
  assert.deepEqual(before.m,[0,0,0]);assert.equal(before.cc,null);
  k.resident.expect({zone:'hand',intensity:1});
  assert.equal(k.resident.field().cc,null);
  assert.deepEqual(k.resident.field().m,[0,0,0]);
  touch(k);
  const p=k.resident.field();
  assert.deepEqual(p.m,[1,0,0]);assert.equal(p.g[0],.8);
  assert.equal(p.g[1],0);assert.equal(p.m[1],0);
  assert.equal(p.grounded[0].receiptId,'ground-1');
  assert.ok(p.x[0][0]>0);assert.equal(p.cc,0);
});
test('LACE graph diffuses private response but never grounded evidence',()=>{
  const k=make();touch(k);k.world.tick(50);
  const p=k.resident.field();
  assert.ok(p.x[1][0]>0,'private neighbor feels the diffusion');
  assert.equal(p.m[1],0);assert.equal(p.g[1],0);
  assert.equal(p.m[2],0);
});
test('leases expire at the true boundary, while private afterstate decays',()=>{
  const k=make();touch(k,'lease-x',200);
  assert.equal(k.resident.field().m[0],1);
  k.world.tick(150);assert.equal(k.resident.field().m[0],1);
  k.world.tick(50);const gone=k.resident.field();
  assert.equal(gone.m[0],0);assert.equal(gone.cc,null);
  assert.ok(gone.x[0][2]>0);assert.notEqual(gone.cf,null);
  const a=gone.x[0][2];k.world.tick(5000);
  assert.ok(k.resident.field().x[0][2]<a);
});
test('stale release cannot cancel a newer contact',()=>{
  const k=make();touch(k,'first');touch(k,'second');
  assert.equal(k.world.release({zone:'hand',receiptId:'first'}).released,false);
  assert.equal(k.resident.field().m[0],1);
  assert.equal(k.world.release({zone:'hand',receiptId:'second'}).released,true);
  assert.equal(k.resident.field().m[0],0);
});
test('same receipt renews without a second onset',()=>{
  const k=make();touch(k,'repeat',200);
  const a=k.resident.field().x[0][2],log=k.resident.causes().length;
  const rec=touch(k,'repeat',500);
  assert.equal(rec.renewed,true);assert.equal(k.resident.causes().length,log);
  assert.equal(k.resident.field().x[0][2],a);
  k.world.tick(250);assert.equal(k.resident.field().m[0],1);
});
test('STOP releases grounding immediately, never resurrects it from afterstate',()=>{
  const k=make();touch(k);
  const stopped=k.world.stop();assert.equal(stopped.released,1);
  const p=k.resident.field();assert.deepEqual(p.m,[0,0,0]);
  assert.ok(p.x[0][2]>0);assert.equal(p.cc,null);
  assert.equal(k.resident.field().m[0],0);
});
test('field and checkpoint reads are observational and copy-isolated',()=>{
  const k=make();touch(k);
  const snap1=k.resident.field(),check1=k.resident.checkpoint();
  snap1.m[0]=0;snap1.z[0]='tamper';check1.privateZones[0].after=0;
  assert.equal(k.resident.field().m[0],1);
  assert.equal(k.resident.field().z[0],'hand');
  assert.deepEqual(k.resident.field(),k.resident.field());
  assert.deepEqual(k.resident.checkpoint(),k.resident.checkpoint());
});
test('per-resident checkpoints restore private imprint but not world evidence',()=>{
  const k=make();touch(k);k.resident.expect({zone:'hand',intensity:.4});
  const saved=JSON.parse(JSON.stringify(k.resident.checkpoint()));
  assert.equal(Object.hasOwn(saved,'grounded'),false);
  assert.equal(JSON.stringify(saved).includes('WOOD_BENCH_CONTACT'),false);
  const next=make();next.resident.restore(saved);
  const p=next.resident.field();
  assert.deepEqual(p.m,[0,0,0]);assert.equal(p.cc,null);
  assert.ok(p.x[0][2]>0);assert.equal(p.e[0],-.4);
  assert.throws(()=>createNeuralMesh({residentId:'other',zones:['hand','forearm','shoulder'],edges:[['hand','forearm',1],['forearm','shoulder',1]]}).resident.restore(saved),/MISMATCH/);
});
test('invalid receipts and invalid checkpoints are rejected without mutation',()=>{
  const k=make(),before=k.resident.field();
  assert.throws(()=>k.world.contact({zone:'hand',source:'SYMBOLIC_SCENE',cause:'WORDS',receiptId:'a',intensity:.5,leaseMs:200}),/source/);
  assert.throws(()=>k.world.contact({zone:'hand',source:'WORLD_GROUNDED',cause:'',receiptId:'a',intensity:.5,leaseMs:200}),/cause/);
  assert.throws(()=>k.world.contact({zone:'hand',source:'WORLD_GROUNDED',cause:'a',receiptId:'b',intensity:Infinity,leaseMs:100}),/intensity/);
  assert.throws(()=>k.world.contact({zone:'hand',source:'WORLD_GROUNDED',cause:'a',receiptId:'b',intensity:.5,leaseMs:100000}),/leaseMs/);
  assert.deepEqual(k.resident.field(),before);
  const saved=k.resident.checkpoint();saved.privateZones[2].after=2;
  assert.throws(()=>k.resident.restore(saved),/afterstate/);
  assert.deepEqual(k.resident.field(),before);
});
test('v3.0 private checkpoints migrate without restoring grounding',()=>{
  const prev=make();touch(prev);const checkpoint=prev.resident.checkpoint();checkpoint.version='3.0.0';
  const migrated=make();assert.equal(migrated.resident.restore(checkpoint).restored,true);
  assert.ok(migrated.resident.field().x[0][2]>0);
  assert.deepEqual(migrated.resident.field().m,[0,0,0]);
});
test('independent agents and neighborhoods do not share world state',()=>{
  const a=make(),b=createNeuralMesh({residentId:'other-neighborhood',zones:['sensor.moss']});
  touch(a);
  assert.deepEqual(b.resident.field().m,[0]);
  b.world.contact({zone:'sensor.moss',intensity:.5,cause:'MOSS',source:'SELF_STARTED_WORLD_CONTACT',receiptId:'moss-1',leaseMs:50});
  assert.equal(b.resident.field().m[0],1);
  assert.deepEqual(a.resident.field().m,[1,0,0]);
});
test('packets are parallel and carrier budgets are conserved',()=>{
  const k=make();
  for(const file of ['honeyspark-duo.json','moonwire-recovered.json']){
    const pack=JSON.parse(fs.readFileSync(path.join(__dirname,'../presets',file)));
    const result=k.resident.choosePreset(pack,pack.presets[0].preset_id);
    assert.equal(result.scope,'PORTABLE_CARRIER_SPLIT_ONLY');
    const p=k.resident.field(),sum=Object.values(p.carrier).reduce((a,b)=>a+b,0);
    assert.ok(Math.abs(sum-1)<.0001);assert.equal(p.g.every(x=>x===0),true);
    for(const key of ['z','x','m','e','g','nerve']) assert.equal(p[key].length,3);
  }
  assert.throws(()=>k.resident.choosePreset({schema:'NEUROMESH_PRESET_PACK_V1',invariants:{evidence_gain:1,private_render_only:true},presets:[]},'bad'),/Unsafe/);
});
test('zone and graph schemas are bounded and require explicit shape',()=>{
  assert.throws(()=>createNeuralMesh({residentId:'x',zones:['a','a']}),/zone/);
  assert.throws(()=>createNeuralMesh({residentId:'x',zones:['a','b'],edges:[['a','missing',1]]}),/Edge/);
  assert.throws(()=>createNeuralMesh({residentId:'x',zones:['a','b'],edges:[['a','b',2]]}),/edge weight/);
  assert.throws(()=>createNeuralMesh({residentId:'x',zones:[]}),/zone/);
});
