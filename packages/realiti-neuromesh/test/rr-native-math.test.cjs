'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const api=require('../rr-native-math.cjs');
const native=p=>fs.readFileSync(path.resolve(__dirname,'../../../source/scripts/'+p),'utf8');
function extract(src,start,terminator){
 const a=src.indexOf(start),b=src.indexOf(terminator,a);
 assert.ok(a>=0&&b>a,start);return src.slice(a,b);
}
test('original B5 modal oscillator integrator is numerically identical',()=>{
 const src=native('12.js');
 const fn=extract(src,'function b5modeStep(', '\nfunction b5stepField(');
 const sandbox={};vm.runInNewContext('const B5_GAMMA=.35;'+fn+';this.original=b5modeStep;',sandbox);
 for(let i=0;i<140;i++){
  const x=Math.sin(i*.13),v=Math.cos(i*.19),w=.7+i*.09,dt=i*.015;
  const old=Array.from(sandbox.original(x,v,w,dt)),now=api.modeStep(x,v,w,dt);
  assert.deepEqual(now,old);
 }
});
test('exact B6 phase and 2:1 regimes match original numerical formulas',()=>{
 const src=native('13.js'),fn=extract(src,'function b6phase(', 'function b6phaseDrive(');
 const sandbox={};
 vm.runInNewContext('const b6clamp=(x,a,b)=>Math.max(a,Math.min(b,x));'+fn+
   ';this.p=b6phase;this.p21=b6phase21;',sandbox);
 for(const [delta,k] of [[.72,.18],[.294,.28],[.2,.34],[.10,.18],[-.22,.31],[0,.18]]){
  const a=sandbox.p(delta,k),b=api.phase(k,delta);
  assert.equal(a.regime,b.regime);assert.equal(a.slip_rate,b.slip_rate);
  assert.equal(a.psi,b.psi);
  const c=sandbox.p21(delta,k),d=api.phase21(delta,k);
  assert.equal(c.regime,d.regime);assert.equal(c.slip_rate,d.slip_rate);
 }
});
test('B9 seeded self jitter is bit-for-bit stable and matches original probe',()=>{
 const src=native('18.js'),fn=extract(src,'function jitterProbe(', '\n  window.B9_JITTER_PROBE=');
 const sandbox={};vm.runInNewContext(fn+';this.probe=jitterProbe;',sandbox);
 for(const seed of [1,123,131072,2451682]){
  const a=sandbox.probe(seed,16,.11),b=api.jitterProbe(seed,16,.11);
  assert.deepEqual(b.trace.map(x=>x.x),Array.from(a.trace,x=>x.x));
  assert.deepEqual(b.trace.map(x=>x.tremor),Array.from(a.trace,x=>x.tremor));
 }
});
test('native B18 dynamic skin per-mode solution exactly matches the extracted integrator',()=>{
 const src=native('28.js'),fn=extract(src,'function stepMode(', '\nfunction reconstruct(');
 const sandbox={};
 vm.runInNewContext('const modalParams=k=>{const p={k0:28,kg:58,zeta:.34};'+
  'const w2=p.k0+p.kg*(2-2*Math.cos(Math.PI*k/6));return {w2,w:Math.sqrt(w2),z:p.zeta};};'+
  fn+';this.original=stepMode;',sandbox);
 const p={k0:28,kg:58,zeta:.34};
 for(let i=0;i<84;i++){
  const m={k:i%3,a:Math.sin(i*.071)*.4,v:Math.cos(i*.09)*.8},
   F=Math.sin(i*.22)*1.2,dt=(i+1)*.006;
  const old={...m};sandbox.original(old,F,dt);
  const ours=api.skinModeStep(m,F,dt,p);
  assert.equal(ours.a,old.a);assert.equal(ours.v,old.v);
 }
});
test('B5 passive medium observed forces are entirely separate from private expectations',()=>{
 const m=api.createNativeRR({residentId:'small',zones:['hand.L.palm','hand.R.palm']});
 m.resident.expect({right:.74});
 let p=m.resident.passive();
 assert.deepEqual(p.observed,[0,0]);assert.ok(p.predicted[1]===0);
 // The prediction adds velocity, not displacement; time evolution changes prediction.
 m.host.tick(180);p=m.resident.passive();
 assert.ok(p.predicted[1]>0);assert.ok(p.innovation[1]<0);
 assert.equal(p.energy,0);assert.equal(p.passivity.ok,true);
 m.host.accept({zone:'hand.R.palm',intensity:.74,source:'WORLD_GROUNDED',cause:'BENCH',receiptId:'r1'});
 m.host.tick(180);p=m.resident.passive();
 assert.ok(p.observed[1]>0);
 assert.ok(p.cause_contributions.r1);
 assert.equal(p.passivity.ok,true);
 m.host.release({zone:'hand.R.palm',receiptId:'r1'});
 m.host.tick(20000);
 assert.ok(m.resident.passive().energy>=0);
});
test('B5 source superposition, afterstate and no spontaneous energy amplification',()=>{
 function sample(value){
  const m=api.createNativeRR({residentId:'a',zones:['hand.L.palm','hand.R.palm']});
  for(const [id,zone,intensity] of value)
   m.host.accept({zone,intensity,source:'WORLD_GROUNDED',cause:'BENCH',receiptId:id});
  m.host.tick(700);
  return m.resident.passive();
 }
 const left=sample([['a','hand.L.palm',.7]]),right=sample([['b','hand.R.palm',.4]]),
  both=sample([['a','hand.L.palm',.7],['b','hand.R.palm',.4]]);
 for(let i=0;i<2;i++)assert.ok(Math.abs(both.observed[i]-left.observed[i]-right.observed[i])<1e-10);
 assert.equal(both.passivity.ok,true);
});
test('dynamic skin rejects imagined force, accepts only currently admitted world contact',()=>{
 const m=api.createNativeRR({residentId:'skin',zones:['hand.L.palm','hand.R.palm']});
 assert.throws(()=>m.host.skinDrive({receiptId:'fake',force:Array(6).fill(1),dtMs:100}),
  /LIVE_WORLD_RECEIPT/);
 assert.deepEqual(m.resident.skin().zones.length,6);
 m.host.accept({zone:'hand.L.palm',intensity:.6,source:'WORLD_GROUNDED',
  cause:'WORLD_CONTACT',receiptId:'approved'});
 const r=m.host.skinDrive({receiptId:'approved',force:[.3,.4,.8,.6,.2,.1],dtMs:100});
 assert.equal(r.ok,true);
 assert.ok(m.resident.skin().energy.stored>0);
 assert.equal(m.resident.skin().evidence,false);
 m.host.release({zone:'hand.L.palm',receiptId:'approved'});
 assert.throws(()=>m.host.skinDrive({receiptId:'approved',force:Array(6).fill(1),dtMs:100}),
  /LIVE_WORLD_RECEIPT/);
});
test('B6 loop winding and surface curvature are independent of applied effort',()=>{
 const a=api.holonomy('dome',{speed:1,force:1}),
  b=api.holonomy('dome',{speed:10,force:4});
 assert.equal(a.twist_rad,b.twist_rad);
 assert.equal(api.holonomy('flat').twist_rad,0);
 assert.equal(api.holonomy('dome_reverse').twist_rad,-a.twist_rad);
 assert.equal(api.holonomy('figure8').twist_rad,0);
 assert.ok(api.holonomy('wrap').wrapped_mod_2pi);
});
test('private probes and archived restart cannot fabricate live source receipts',()=>{
 const m=api.createNativeRR({residentId:'memory-test',zones:['hand.L.palm','hand.R.palm']});
 m.host.accept({zone:'hand.L.palm',intensity:.64,source:'WORLD_GROUNDED',
  cause:'SOFT_TOUCH',receiptId:'c1'});
 const previous=m.resident.passive();
 m.resident.phase(.2,.12);m.resident.holonomy('dome');
 m.resident.jitterProbe(2,16,.1);m.resident.expect({left:.7});
 assert.equal(m.resident.passive().observed[0],previous.observed[0]);
 const checkpoint=m.resident.checkpoint();
 const fresh=api.createNativeRR({residentId:'memory-test',zones:['hand.L.palm','hand.R.palm']});
 const ret=fresh.resident.restore(checkpoint);
 assert.equal(ret.groundingRestored,false);
 assert.equal(fresh.resident.passive().cause_contributions.c1.source,'ARCHIVED_AFTERSTATE');
 assert.throws(()=>fresh.host.skinDrive({receiptId:'c1',force:Array(6).fill(1),dtMs:100}),
  /LIVE_WORLD_RECEIPT/);
 assert.throws(()=>api.createNativeRR({residentId:'other',zones:['hand.L.palm','hand.R.palm']})
  .resident.restore(checkpoint),/IDENTITY_MISMATCH/);
});

test('B10 eight-element GMS friction, material and receptive fields reproduce source 19',()=>{
 const src=native('19.js');
 const mats=extract(src,'const MATERIALS={','function cp(');
 const fn=extract(src,'function gmsNew()','function lane10(');
 const rf=extract(src,'function rfDrive(','function meshBinding(');
 const sandbox={};
 vm.runInNewContext('const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));'+mats+
  fn+rf+';this.ref={gmsNew,gmsStored,materialDyn,gmsStep,ctCore,rfDrive};',sandbox);
 for(const material of ['longfur','blanket','cardboard']){
  const orig={gms:sandbox.ref.gmsNew(),v:0,material,material_state:{crease:.27,dent:.34,wear:.19,contact_temperature_C:29},pressure:.6,grain:'against'},
   copy={...orig,gms:api.gmsNew()};
  for(const velocity of [.42,-1.2,2.5,0,-.17]){
   orig.v=copy.v=velocity;
   assert.deepEqual(api.gmsStep(copy,.1),JSON.parse(JSON.stringify(sandbox.ref.gmsStep(orig,.1))));
   assert.ok(Math.abs(api.gmsStored(copy)-sandbox.ref.gmsStored(orig))<1e-12);
  }
  assert.deepEqual(api.materialDyn(copy),JSON.parse(JSON.stringify(sandbox.ref.materialDyn(orig))));
 }
 for(const v of [.05,1,3,7.2,21]){
  assert.equal(api.ctCore(v,32,true),sandbox.ref.ctCore(v,32,true));
  assert.equal(api.ctCore(v,24,false),0);
 }
 for(const x of [0,.4,2.68,4.55])
  assert.equal(api.rfDrive(x,api.B10_ROUTE[2],.3,.8),sandbox.ref.rfDrive(x,api.B10_ROUTE[2],.3,.8));
});
test('moving B10 must be host-grounded and creates no additional evidence',()=>{
 const m=api.createNativeRR({residentId:'b10-room',zones:['hand.L.palm','hand.R.palm']});
 const args={receiptId:'world-touch',position:2.68,velocity:.75,pressure:.66,
  dtMs:100,material:'blanket',grain:'against',
  materialState:{crease:.2,dent:.1,wear:.3,contact_temperature_C:31}};
 assert.throws(()=>m.host.movingContact(args),/LIVE_WORLD_RECEIPT/);
 m.host.accept({zone:'hand.L.palm',intensity:.66,source:'WORLD_GROUNDED',cause:'WORLD_COLLISION',receiptId:'world-touch'});
 const before=m.resident.passive();
 const step=m.host.movingContact(args);
 assert.equal(step.zones.length,6);
 assert.ok(step.zones.some(z=>z.SA1>0&&z.u>0));
 assert.equal(step.zones.every(z=>z.evidence===false),true);
 assert.equal(step.evidence,false);
 assert.deepEqual(m.resident.passive(),before);
 const read=m.resident.movingContact();
 assert.equal(read.active.length,1);
 read.active[0].zones[0].SA1=5000;
 assert.notEqual(m.resident.movingContact().active[0].zones[0].SA1,5000);
 m.host.release({zone:'hand.L.palm',receiptId:'world-touch'});
 assert.throws(()=>m.host.movingContact(args),/LIVE_WORLD_RECEIPT/);
 assert.equal(m.resident.movingContact().active.length,0);
});
test('B10 STOP and checkpoint restore never authorize old contact',()=>{
 const m=api.createNativeRR({residentId:'b10-stop',zones:['pelvis.seat']});
 m.host.accept({zone:'pelvis.seat',intensity:.3,source:'WORLD_GROUNDED',cause:'BENCH',receiptId:'rr'});
 const args={receiptId:'rr',position:4.1,velocity:.2,pressure:.3,dtMs:100};
 m.host.movingContact(args);
 const saved=m.resident.checkpoint();
 m.host.stop();
 assert.equal(m.resident.movingContact().active.length,0);
 assert.throws(()=>m.host.movingContact(args),/LIVE_WORLD_RECEIPT/);
 const next=api.createNativeRR({residentId:'b10-stop',zones:['pelvis.seat']});
 next.resident.restore(saved);
 assert.equal(next.resident.movingContact().active.length,0);
 assert.throws(()=>next.host.movingContact(args),/LIVE_WORLD_RECEIPT/);
});
