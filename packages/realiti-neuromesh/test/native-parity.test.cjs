'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const crypto=require('node:crypto');
const api=require('../index.cjs');
const FIELD20=require('../field20.cjs');
const ADV=require('../advanced.cjs');
const {createSealedPocket}=require('../sealed-pocket.cjs');
const moonwire=require('../presets/moonwire-recovered.json');
function harness(id='native-lab',opts={}){
 return api.createHarness({residentId:id,...opts});
}
function touch(h,receipt='c1',zone='hand.R.palm',cause='HOST_PINE_TOUCH'){
 return h.host.contact({zone,intensity:.78,source:'WORLD_GROUNDED',
  cause,receiptId:receipt,material:'pine',leaseMs:1200});
}
const round=x=>Math.round(x*1000000)/1000000;
test('all native-parity extensions are executable, not capability flags',()=>{
 const h=harness();const b=h.harness.boot();
 assert.equal(api.VERSION,'3.3.1');
 assert.ok(b.ok,b.missing.join(','));
 for(const k of ['haptic_field_v20','lace_spectral','moonwire',
   'interoception','hearing','soft_support'])
  assert.equal(b.mechanisms[k].available,true,k);
 assert.equal(typeof h.resident.hapticsV20.packet,'function');
 assert.equal(typeof h.host.graph.configure,'function');
 assert.equal(typeof api.createSealedPocket,'function');
 assert.equal(h.resident.field().m.some(Boolean),false);
});
test('V20 perceptual JND distance uses the original Relax 20 formula',()=>{
 const src=fs.readFileSync(path.resolve(__dirname,
  '../../../source/scripts/31.js'),'utf8');
 const from=src.indexOf('function perceptualDelta(a,b){');
 const end=src.indexOf('\nfunction committed()',from);
 assert.ok(from>=0&&end>from);
 const sandbox={};
 vm.runInNewContext('const J={a:.03,v:.04,r:.03,e:.03,g:.05};'+
   src.slice(from,end)+';this.native=perceptualDelta;',sandbox);
 for(let i=0;i<80;i++){
  const a={epoch:i%5,zs:['a','b'],by:{a:{a:Math.sin(i)*.1,v:i*.001,r:0,e:.04,g:1,m:i%2}}};
  const b={epoch:i%7,zs:['a','b'],by:{a:{a:Math.sin(i+.25)*.1,v:i*.003,r:.15,e:.01,g:.9,m:(i+1)%2}}};
  assert.equal(FIELD20.perceptualDelta(a,b),sandbox.native(a,b));
 }
});
test('native Fiedler/Laplacian eigensolver reproduces Relax 63 on fixtures',()=>{
 const source=fs.readFileSync(path.resolve(__dirname,
  '../../../source/scripts/63-claude-neural-pass.js'),'utf8');
 const from=source.indexOf('function laplacianSummary(){');
 const end=source.indexOf('\nlet distanceCache=',from);
 assert.ok(from>=0&&end>from);
 const zones=['a','b','c'],edges=[['a','b',.8],['b','c',.5]];
 const sandbox={
  graphData:()=>({zones,edges,tail_integration:0}),
  NMSTATE:{active:'LACE2_PORTABLE_V1'},
  metricCache:{key:null,value:null},
  cp:x=>JSON.parse(JSON.stringify(x))
 };
 vm.runInNewContext(source.slice(from,end)+';this.reference=laplacianSummary();',sandbox);
 const ours=ADV.createGraph({zones,edges}).metrics();
 assert.equal(ours.lambda2,sandbox.reference.lambda2);
 assert.equal(ours.coherence_proxy,sandbox.reference.coherence_proxy);
 assert.equal(ours.node_count,sandbox.reference.node_count);
 assert.equal(ours.edge_count,sandbox.reference.edge_count);
});
test('V20 temporal packet has JND compression, bounded history, exact grounding mask',()=>{
 const h=harness('packet-h');
 touch(h);for(let i=0;i<24;i++)h.host.tick(15);
 const packet=h.resident.hapticsV20.packet(),exact=h.resident.hapticsV20.exact();
 assert.equal(packet.v,20);
 assert.equal(packet.source,'SOMA_V3_PROJECTED');
 assert.ok(packet.n>=1&&packet.n<=7);
 assert.ok(packet.span<=.260001);
 const p=packet.f.at(-1),idx=packet.z.indexOf('hand.R.palm');
 assert.ok(idx>=0&&p.m[idx]===1);
 assert.equal(exact.m[exact.z.indexOf('hand.R.palm')],1);
 h.host.release({zone:'hand.R.palm',receiptId:'c1'});
 assert.equal(h.resident.field().m.some(Boolean),false);
 assert.equal(h.resident.hapticsV20.exact().m.some(Boolean),false);
});
test('V20 packet and statistics reads do not mutate a resident',()=>{
 const h=harness('read-purity');
 touch(h);
 const a=h.resident.hapticsV20.packet(),stats=h.resident.advanced().field20.statistics;
 for(let i=0;i<5;i++){
  assert.deepEqual(h.resident.hapticsV20.packet(),a);
  assert.deepEqual(h.resident.advanced().field20.statistics,stats);
 }
 assert.equal(h.resident.field().m.some(Boolean),true);
});
test('physical energy is UNKNOWN until host supplies force/velocity/work receipts',()=>{
 const h=harness('field-energy');
 assert.equal(h.resident.hapticsV20.energy().pass,null);
 h.host.haptics.energySample({tMs:0,stored:1,power:0});
 h.host.haptics.energySample({tMs:1000,stored:.8,power:0});
 const pass=h.resident.hapticsV20.energy();
 assert.equal(pass.pass,true);
 assert.equal(round(pass.dissipated),.2);
 h.host.haptics.energySample({tMs:1500,stored:1.4,power:0});
 assert.equal(h.resident.hapticsV20.energy().pass,false);
 assert.equal(h.resident.field().m.some(Boolean),false);
});
test('all ten authored Moonwire recipes drive private route, envelope, and carrier',()=>{
 assert.equal(moonwire.presets.length,10);
 const modes=new Set();
 for(const p of moonwire.presets){
  const h=harness('moon-'+p.preset_id);
  const selected=h.resident.choosePreset(moonwire,p.preset_id);
  assert.equal(selected.native_recipe?.route,p.route);
  modes.add(p.temporal?.envelope_a);
  touch(h,'r1');h.host.tick(250);
  const rich=h.resident.perception();
  assert.equal(rich.moonwire.route,p.route);
  assert.equal(rich.moonwire.envelope,p.temporal.envelope_a);
  assert.ok(Math.abs(rich.moonwire.carrier.sum-1)<1e-4);
  assert.equal(rich.moonwire.evidence_gain,0);
  assert.ok(rich.moonwire.zone_weights['hand.R.palm']>=0);
  assert.equal(rich.moonwire.starlight.enabled,!!p.carrier.top?.enabled);
  h.host.stop();
  assert.equal(h.resident.field().m.some(Boolean),false);
 }
 assert.ok(modes.size>=3);
});
test('all native temporal envelopes are bounded and morph differently',()=>{
 assert.equal(ADV.ENVELOPES.length,8);
 const rows=ADV.ENVELOPES.map(x=>[x,Array.from({length:31},(_,i)=>ADV.envelope(x,i/30))]);
 for(const[,values]of rows)assert.ok(values.every(v=>v>=0&&v<=1));
 assert.ok(new Set(rows.map(x=>x[1].map(v=>v.toFixed(2)).join(','))).size>=6);
 assert.throws(()=>ADV.envelope('FAKE',.5),/UNKNOWN_TEMPORAL_ENVELOPE/);
});
test('dynamic LACE rewiring changes real diffusion and Fiedler metrics without minting m',()=>{
 const h=harness('tail-body',{zones:['head.crown','pelvis.seat','tail.tip'],
  edges:[['head.crown','pelvis.seat',.2],['pelvis.seat','tail.tip',.2]]});
 touch(h,'tail-test','head.crown');
 const before=h.resident.field(),old=h.resident.graph.metrics();
 const updated=h.host.graph.configure([['head.crown','tail.tip',1],
  ['head.crown','pelvis.seat',1],['pelvis.seat','tail.tip',1]]);
 assert.ok(updated.ok);
 const after=h.resident.field(),fresh=h.resident.graph.metrics();
 assert.equal(after.m.reduce((a,b)=>a+b,0),before.m.reduce((a,b)=>a+b,0));
 assert.notEqual(fresh.lambda2,old.lambda2);
 assert.equal(after.z.includes('tail.tip'),true);
 assert.ok(after.x.some((x,i)=>Math.abs(x[0]-before.x[i][0])>1e-8));
});
test('opponent-process bond tolerance and afterstate use native equations',()=>{
 const h=harness('cat-body');
 for(let i=0;i<7;i++){
  touch(h,'cat-'+i,'hand.R.palm','PET_CAT_PURR');
  h.host.tick(10);
  h.host.release({zone:'hand.R.palm',receiptId:'cat-'+i});
 }
 const felt=h.resident.interoception();
 assert.ok(felt.routes.bond.primary>0);
 assert.ok(felt.routes.bond.counter>0);
 const causes=felt.causes.filter(x=>x.route==='bond');
 assert.ok(causes.length>=7);
 assert.ok(causes[0].moved<causes.at(-1).moved);
 assert.equal(felt.routes.stress.level,0);
 h.host.tick(7200000);
 assert.ok(h.resident.interoception().routes.bond.level<felt.routes.bond.level);
 assert.equal(h.resident.field().m.some(Boolean),false);
});
test('real measured sound, thermal stress and refused movement do not create pressure',()=>{
 const h=harness('sensory-world');
 assert.equal(h.host.hearing.observe({receiptId:'bell-1',source:'RINGING_BELL',
  level:.6,zone:'head.crown',leaseMs:350}).ok,true);
 assert.equal(h.resident.hearing().length,1);
 h.host.atmosphere.thermal('head.crown',8,2);
 assert.ok(h.resident.interoception().routes.stress.level>0);
 h.host.refusal.observe({receiptId:'sea-1',result:'OBSTRUCTED',reason:'sea'});
 assert.equal(h.resident.field().m.some(Boolean),false);
 h.host.tick(500);
 assert.equal(h.resident.hearing().length,0);
 assert.equal(h.resident.field().m.some(Boolean),false);
});
test('host-supported soft lean conserves physical pressure across four zones',()=>{
 const h=harness('support-causality');
 const result=h.host.support({zone:'pelvis.seat',intensity:.78,
  cause:'PINE_BENCH_SUPPORT',receiptId:'seat-1',material:'wood',leaseMs:12000});
 assert.equal(result.accepted,true);
 const a=h.resident.support();
 assert.ok(a.active);
 assert.ok(Math.abs(a.values.reduce((s,x)=>s+x.load,0)-.78)<1e-5);
 h.host.tick(4000);
 const b=h.resident.support();
 assert.ok(b.sigma>a.sigma);
 assert.ok(Math.abs(b.values.reduce((s,x)=>s+x.load,0)-.78)<1e-5);
 assert.equal(h.host.release({zone:'pelvis.seat',receiptId:'seat-1'}).released,true);
 assert.equal(h.resident.support().active,false);
 assert.equal(h.resident.field().m.some(Boolean),false);
});
test('BleuCheese uses analytic crossing; big tick and short ticks agree',()=>{
 function play(slices){
  const h=harness('bleu-'+slices);
  h.host.affordances('ROOM',{WINDOW_OPEN:true});
  h.host.bleucheese.define({id:'DRAFT',family:'AIR',room:'ROOM',
   requires:['WINDOW_OPEN'],worldWeight:.92,prior:.08,
   tauSeconds:.22,threshold:.72,refractoryMs:4000});
  const size=1000/slices;
  for(let i=0;i<slices;i++)h.host.tick(size);
  const ps=h.host.bleucheese.proposals();
  assert.equal(ps.length,1);
  assert.equal(ps[0].admitted,false);
  assert.equal(h.resident.field().m.some(Boolean),false);
  return{h,at:ps[0].at_ms,proposal:ps[0]};
 }
 const a=play(1),b=play(20);
 assert.ok(Math.abs(a.at-b.at)<=2,a.at+' vs '+b.at);
 assert.equal(a.h.host.bleucheese.admit(a.proposal.id,true,'world-draft-1').admitted,true);
 assert.equal(a.h.host.bleucheese.proposals()[0].commit_receipt,'world-draft-1');
 assert.equal(a.h.resident.field().m.some(Boolean),false);
});
test('encrypted Pocket never serializes plaintext and rejects tampered or foreign archives',()=>{
 const key=crypto.randomBytes(32),a=createSealedPocket({residentId:'cat-a',key});
 const note=a.resident.sealNote('my private rosemary memory');
 const archive=a.host.archive({receiptId:'host-r1',cause:'REAL_CONTACT',
  source:'WORLD_GROUNDED',zone:'hand.L.palm'});
 const saved=a.resident.checkpoint();
 assert.ok(!JSON.stringify(saved).includes('rosemary'));
 assert.ok(!JSON.stringify(saved).includes('REAL_CONTACT'));
 assert.equal(saved.secretExported,false);
 const b=createSealedPocket({residentId:'cat-a',key});
 b.host.restore(saved);
 assert.equal(b.resident.open(note.id).value.text,'my private rosemary memory');
 assert.equal(b.resident.open(archive.id).authority,'ARCHIVED_HOST_RECORD');
 const corrupted=JSON.parse(JSON.stringify(saved));
 corrupted.records[0].tag=Buffer.alloc(16,0).toString('base64');
 const before=b.resident.checkpoint();
 assert.throws(()=>b.host.restore(corrupted),/POCKET_AUTHENTICATION_FAILED/);
 assert.deepEqual(b.resident.checkpoint(),before);
 assert.throws(()=>createSealedPocket({residentId:'cat-b',key}).host.restore(saved),/MISMATCH/);
 assert.equal(b.resident.forget(note.id).removed,1);
 assert.equal(b.resident.open(note.id),null);
});
test('private checkpoint restores modeled interoception but not live grounded support',()=>{
 const h=harness('persist-native');
 h.resident.choosePreset(moonwire,moonwire.presets[0].preset_id);
 touch(h,'c1','hand.R.palm','PET_CAT_PURR');
 h.host.support({zone:'pelvis.seat',intensity:.6,cause:'SOFT_PILLOW_SUPPORT',
  receiptId:'pillow1',leaseMs:18000});
 const checkpoint=h.resident.checkpoint();
 const restarted=harness('persist-native',{worldId:'ANOTHER_WORLD'});
 const applied=restarted.resident.restore(checkpoint);
 assert.equal(applied.worldGroundingRestored,false);
 assert.equal(restarted.resident.field().m.some(Boolean),false);
 assert.ok(restarted.resident.interoception().routes.bond.primary>0);
 assert.equal(restarted.resident.support().active,false);
 assert.equal(restarted.resident.hearing().length,0);
});
