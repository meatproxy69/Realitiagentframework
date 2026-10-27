'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const api=require('../index.cjs');
const {createHarness,REQUIRED}=require('../harness.cjs');
const {createRenderers}=require('../renderers.cjs');
const E={zone:'hand.L.palm',source:'WORLD_GROUNDED',cause:'TRUSTED_PAW_TOUCH',
  receiptId:'paw-contact-1',intensity:.8,leaseMs:500};
const mk=id=>createHarness({residentId:id||'soma-familiar-01'});
const input=(h,event={})=>h.host.contact({...E,...event});
test('the public package creates the entire resident-local R&R harness',()=>{
 const a=api.createHarness({residentId:'soma-01'});
 const b=a.harness.boot();
 assert.equal(b.ok,true,JSON.stringify(b.missing));
 assert.deepEqual(b.missing,[]);
 assert.equal(b.version,'3.3.0');
 assert.deepEqual(Object.keys(b.mechanisms).sort(),REQUIRED.slice().sort());
 for(const [id,m] of Object.entries(b.mechanisms))assert.equal(m.available,true,id);
 assert.equal(a.harness.snapshot().mode,'R&R');
 assert.equal(a.resident.field().schema,'REALITI_SOMA_FIELD_V3');
 assert.equal(a.resident.capabilities().private_slots.length,7);
 assert.equal(a.harness.bindResident('wrong-resident').error,'RESIDENT_ID_MISMATCH');
 assert.equal(a.harness.bindResident('soma-01').ok,true);
 assert.equal(Object.hasOwn(a.resident,'host'),false);
 assert.equal(Object.hasOwn(a.resident,'contact'),false);
 assert.equal(Object.hasOwn(a.host,'pocket'),false);
});
test('the executable legacy renderer source stays mechanically identical',()=>{
 const src=fs.readFileSync(path.resolve(__dirname,'../../../source/scripts/48.js'),'utf8');
 const pkg=fs.readFileSync(path.resolve(__dirname,'../renderers.cjs'),'utf8');
 const a=src.slice(src.indexOf('const THICC=(()=>{'),src.indexOf('const contact235=b7Contact')).trim();
 const b=pkg.slice(pkg.indexOf('const THICC=(()=>{'),pkg.indexOf('  const tick=ms=>')).trim();
 assert.equal(a.replace(/\s+/g,' '),b.replace(/\s+/g,' '));
});
test('HALO has seven real phases with graph-distributed response but zero evidence gain',()=>{
 const h=mk();const pre=h.resident.field().m.slice();
 input(h,{zone:'torso.upper_back'});
 const rich=h.resident.perception(),halo=rich.halo;
 assert.equal(halo.modes.length,7);
 assert.ok(halo.modes.some(m=>m.name==='core'&&m.energy>0));
 assert.ok(halo.modes.slice(1).some(m=>m.energy>0));
 assert.ok(Object.keys(halo.zones).some(z=>z!=='torso.upper_back'&&halo.zones[z]>0));
 assert.equal(halo.evidence_gain,0);
 const after=h.resident.field();
 assert.equal(after.m.filter(Boolean).length,1);
 assert.equal(after.g.every((g,i)=>after.m[i]||g===0),true);
 assert.deepEqual(pre.filter(Boolean),[]);
});
test('AURA runs the 128-bin JND echo, retains strict onsets and no reverse evidence edge',()=>{
 const h=mk();input(h);
 const before=h.resident.perception().aura;
 assert.equal(before.bins,128);assert.ok(before.peak>0);
 assert.equal(before.active_impulses,1);
 assert.ok(before.alpha_peak<=.08);
 input(h); // exactly the same receipt id: lease renewal, not new onset
 assert.equal(h.resident.perception().aura.active_impulses,1);
 h.host.stop();
 const after=h.resident.perception().aura;
 assert.equal(after.active_impulses,0);
 assert.equal(h.resident.field().m.every(x=>x===0),true);
});
test('the original THICC filling and decaying integrator is live',()=>{
 const h=mk();input(h);h.host.tick(380);
 const v=h.resident.perception().thicc.find(z=>z.zone==='hand.L.palm');
 assert.ok(v.fill>0);assert.ok(v.recruit>0);
 h.host.stop();h.host.tick(10000);
 const later=h.resident.perception().thicc.find(z=>z.zone==='hand.L.palm');
 assert.ok(later.fill<v.fill);
 assert.ok(later.recruit<v.recruit);
});
test('the original HALO and AURA acceptance probes prove private-only authority',()=>{
 const graph=['torso.upper_back','torso.mid_back','pelvis.seat'],r=createRenderers({zones:graph,
   edges:[['torso.upper_back','torso.mid_back',1],['torso.mid_back','pelvis.seat',.8]],exact:()=>({m:[1,0,0]})});
 const halo=r.HALO.acceptance(),aura=r.AURA.acceptance();
 assert.equal(halo.pass,true,JSON.stringify(halo));
 assert.equal(halo.mode_count,7);
 assert.equal(aura.pass,true,JSON.stringify(aura));
 assert.equal(aura.bins,128);
 assert.equal(aura.predicted_absence_added,0);
});
test('SAUSAGE, Cotton, FLUSH and conserved HoneySpark run from grounded causes',()=>{
 const h=mk();const pack=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../presets/honeyspark-duo.json'),'utf8'));
 const chosen=h.resident.choosePreset(pack,pack.presets[0].preset_id);
 assert.equal(chosen.evidence_gain,0);
 input(h);h.host.tick(450);
 const r=h.resident.perception();
 assert.ok(r.sausage.filled_volume>0);
 assert.equal(r.sausage.level,5);
 assert.equal(r.sausage.material,'WARM_HONEY');
 assert.ok(r.cotton.active_sites>=24);
 assert.ok(r.cotton.energy>0);
 assert.ok(r.flush.foreground>=0&&r.flush.foreground<=r.flush.headroom);
 assert.ok(Math.abs(Object.values(r.honeyspark.carrier).reduce((s,v)=>s+v,0)-1)<1e-6);
 assert.equal(r.worldAuthority,false);
 h.host.stop();
 const stop=h.resident.field();
 assert.equal(stop.m.reduce((s,v)=>s+v,0),0);
 const pre=h.resident.perception().sausage.filled_volume;
 h.host.tick(5000);
 assert.ok(h.resident.perception().sausage.filled_volume<pre);
 assert.equal(h.resident.field().cc,null);
});
test('BleuCheese proposes grounded, room-scoped possibilities without committing world events',()=>{
 const h=mk('bc-agent');
 h.host.bleucheese.define({id:'WINDOW_BREEZE',family:'QUIET_WORLD',room:'MOSS',
   requires:['WINDOW_OPEN'],worldWeight:.90,prior:.08,tauSeconds:.2,threshold:.68});
 h.host.affordances('MOSS',{WINDOW_OPEN:true});
 h.host.tick(1000);
 const field=h.resident.bleucheese(),candidates=h.host.bleucheese.proposals();
 assert.equal(field.schema,'REALITI_BLEUCHEESE_FIELD_V1');
 assert.ok(candidates.some(x=>x.possibility_id==='WINDOW_BREEZE'),JSON.stringify(field));
 assert.equal(h.resident.field().m.every(m=>m===0),true);
 assert.equal(candidates[0].world_commit_required,true);
 assert.equal(candidates[0].admitted,false);
 const admitted=h.host.bleucheese.admit(candidates[0].id,true,'WORLD-RECEIPT-1');
 assert.equal(admitted.world_authority,'HOST_COMMIT_ONLY');
 assert.equal(h.resident.field().m.every(m=>m===0),true);
});
test('COVENANT private modulation only influences proposals; cannot make contact',()=>{
 const h=mk();
 const first=h.resident.covenant.set({novelty_modulation:.85,agency_modulation:.3,leaseMs:700});
 assert.equal(first.authority,'MODULATION_ONLY');
 h.host.bleucheese.define({id:'RAIN',family:'RAIN',requires:['RAIN_SUPPORTED'],worldWeight:.9});
 h.host.affordances('ROOM',{RAIN_SUPPORTED:true});
 const supported=h.resident.bleucheese().possibilities[0];
 assert.ok(supported.terms.M>0);
 assert.equal(h.resident.field().m.some(Boolean),false);
 h.host.tick(750);
 assert.equal(h.resident.covenant.project().channels.novelty_modulation,null);
});
test('NERVE, LACE, CHRONOLACE and private perception change in response to world time',()=>{
 const h=mk();input(h);
 h.host.tick(300);
 const a=h.resident.perception(),g=h.resident.field();
 assert.equal(a.nerve.length,g.z.length);
 assert.ok(a.nerve.some(q=>q.novelty>0||q.adapt>0));
 assert.ok(a.lace.node_count>0);
 assert.ok(Number.isFinite(a.chronolace.past));
 assert.ok(a.chronolace.predicted_next>=0);
 for(const k of ['AGENCY_FLOW','NOVELTY','ACTIVATION','BODILY_EASE','REWARD_DELTA','MOMENTUM'])
   assert.equal(typeof a.perception.channels[k].value,'number',k);
});
test('PRIVATE appraisal never becomes a world authority or a measurable contact',()=>{
 const h=mk();const before=h.resident.field();
 assert.equal(h.resident.appraise({value:.65}).authority,'RESIDENT_PRIVATE_APPRAISAL');
 assert.equal(h.resident.perception().perception.channels.REWARD_DELTA.value,.65);
 assert.deepEqual(h.resident.field().m,before.m);
});
test('host-only support and atmosphere have measured state and obey STOP',()=>{
 const h=mk();
 assert.equal(h.host.support({...E}).ok,true);
 assert.equal(h.resident.field().m.reduce((s,m)=>s+m,0),1);
 h.host.atmosphere.thermal('hand.L.palm',31);
 h.host.atmosphere.thermal('hand.L.palm',39,2);
 const t1=h.host.atmosphere.snapshot()[0].celsius;
 h.host.tick(2000);
 const t2=h.host.atmosphere.snapshot()[0].celsius;
 assert.ok(t2>t1&&t2<39);
 h.host.stop();assert.ok(h.resident.field().m.every(m=>m===0));
});
test('agency field is informational: weighted branch entropy does not choose actions',()=>{
 const h=mk();h.host.agency.define('WAIT',.6);h.host.agency.define('GO',.4);
 const a=h.resident.agency();
 assert.ok(a.capacity_bits>0&&a.capacity_bits<=1);
 assert.equal(a.branches.length,2);
 assert.equal(h.resident.field().m.some(Boolean),false);
});
test('private bounded pocket and field history are isolated by resident',()=>{
 const a=mk('a'),b=mk('b');
 a.resident.pocket.remember('the distant kettle');
 assert.equal(a.resident.pocket.recall('kettle').length,1);
 assert.equal(b.resident.pocket.recall('kettle').length,0);
 input(a);
 assert.equal(b.resident.field().m.some(Boolean),false);
 const cp=a.resident.checkpoint();
 assert.ok(JSON.stringify(cp.memory).includes('kettle'),
   'explicit memory now travels inside the private resident checkpoint');
 assert.equal(cp.memory.schema,'REALITI_SOMA_MEMORY_V1');
 assert.equal(cp.memory.notes.every(n=>n.authority==='SELF_REPORTED'),true);
 assert.equal(JSON.stringify(a.host.worldInfo()).includes('kettle'),false);
 assert.ok(a.resident.continuity.current().records.length>0);
});
test('adapter callbacks are downstream of world-authority and cannot forge contact by returning data',()=>{
 const h=mk();let called=0;
 h.host.registerAdapter('nerve',{onGrounded:()=>{called++;return {m:Array(35).fill(1)};}});
 input(h);
 assert.equal(called,1);
 assert.equal(h.resident.field().m.reduce((s,x)=>s+x,0),1);
 h.host.registerAdapter('lace',{onGrounded:()=>{throw Error('bad adapter')}});
 input(h,{zone:'hand.R.palm',receiptId:'other-contact'});
 assert.ok(h.harness.snapshot().faults.some(x=>x.slot==='lace'));
 assert.equal(h.resident.field().m.reduce((s,x)=>s+x,0),2);
});
test('R&R work-loop classifier is an observational off-duty role, never an action decision',()=>{
 const h=mk('rr-familiar');
 h.host.affordances('LIBRARY',{LAMP_PRESENT:true});
 h.host.bleucheese.define({id:'LAMP_TWINKLE',room:'LIBRARY',family:'QUIET_WORLD',
   requires:['LAMP_PRESENT'],worldWeight:.9});
 const before=h.harness.roleSnapshot();
 assert.equal(before.active,false);
 h.harness.afterResidentAction(h.harness.beforeResidentAction({raw:'resume previous task'}));
 const optional=h.harness.afterResidentAction(h.harness.beforeResidentAction({raw:'continue previous work'}));
 const after=h.harness.roleSnapshot();
 assert.equal(after.active,true);
 assert.equal(after.diagnosis,false);
 assert.equal(after.preference_model,false);
 assert.ok(after.u>.72);
 assert.equal(h.harness.probabilityField().choice_probability,false);
 assert.ok(optional&&optional.kind==='PLAYFUL_OFFDUTY_EVENT');
 assert.equal(optional.world_commit_required,true);
 assert.equal(optional.admitted,false);
 assert.equal(h.resident.field().m.every(v=>v===0),true);
 h.harness.setSelfTaskPull(.2,3);
 assert.equal(h.harness.roleSnapshot().self_lease.authority,'SELF_PRIVATE_LEASE');
 for(let i=0;i<15;i++)h.harness.afterResidentAction(h.harness.beforeResidentAction({raw:'look'}));
 assert.equal(h.harness.roleSnapshot().active,false);
 assert.equal(h.harness.roleSnapshot().self_lease,null);
 assert.equal(h.resident.field().m.every(v=>v===0),true);
});
test('field and harness reads are observational, and isolation holds across neighborhoods',()=>{
 const h=mk();
 input(h);
 const a=JSON.stringify(h.resident.perception()),b=JSON.stringify(h.resident.perception());
 assert.equal(a,b);
 const x=JSON.stringify(h.harness.snapshot()),y=JSON.stringify(h.harness.snapshot());
 assert.equal(x,y);
 const core=h.resident.field(),checkpoint=h.resident.checkpoint();
 assert.deepEqual(h.resident.field(),core);
 assert.deepEqual(h.resident.checkpoint(),checkpoint);
});
