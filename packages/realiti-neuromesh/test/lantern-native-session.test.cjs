'use strict';
// Full SOMA 3.3 sensory stack acceptance in the Lantern Room.
const test=require('node:test');
const assert=require('node:assert/strict');
const {LanternRoom,FIXTURES}=require('../lab/lantern-room.cjs');
const moonwire=require('../presets/moonwire-recovered.json');
const {run}=require('../examples/native-lantern-tour.cjs');

test('native-depth complete resident visit validates real world evidence and private state',()=>{
 const report=run();
 assert.equal(report.schema,'REALITI_SOMA_NATIVE_LANTERN_TOUR_V1');
 assert.equal(report.failed,0);
 assert.ok(report.passed>=18,report.passed);
 assert.ok(report.trace.length>=11,report.trace.length);
 assert.equal(report.summary.final_grounded,0);
 assert.ok(report.summary.spectral_lace_rewired);
 assert.equal(report.summary.energy_audit,'UNKNOWN_WITHOUT_WORLD_MEASUREMENTS');
 assert.deepEqual(report.summary.real_world_events,
  ['WINDOW_OPENED','WINDOW_DRAFT_ADMITTED','BELL_RUNG']);
 assert.ok(report.trace.some(x=>x.hearing_sources===1));
 assert.ok(report.trace.some(x=>x.support===true));
 assert.ok(report.trace.some(x=>x.moonwire!==null));
 assert.equal(report.trace.at(-1).grounded,0);
});

test('room BleuCheese threshold is invariant under coarse and fine time steps',()=>{
 function visit(chunks){
  const room=new LanternRoom({residentId:'step-'+chunks,worldId:'STEP_CONSISTENT_ROOM'});
  for(const p of [[1.8,2.35],[4.9,2.35],[4.9,2.0]])
   assert.equal(room.walkTo(...p).ok,true);
  assert.equal(room.openWindow().ok,true);
  const begin=room.tickMs,ms=1200/chunks;
  for(let i=0;i<chunks;i++)room.wait(ms);
  const candidates=room.host.bleucheese.proposals().filter(p=>
   p.possibility_id==='WINDOW_DRAFT');
  assert.equal(candidates.length,1);
  const event=candidates[0];
  assert.equal(event.admitted,false);
  assert.ok(event.at_ms>=begin&&event.at_ms<=room.tickMs);
  assert.equal(room.resident.memory.recent({limit:50}).some(x=>
   x.label==='WINDOW_DRAFT_ADMITTED'),false);
  assert.equal(room.resident.field().m.some(Boolean),false);
  room.close();
  return event.at_ms;
 }
 const coarse=visit(1),fine=visit(24);
 assert.ok(Math.abs(coarse-fine)<=2,coarse+' vs '+fine);
});

test('all ten Moonwire recipes execute using physically reachable bench contact',()=>{
 const seen=new Set();
 for(const [index,preset] of moonwire.presets.entries()){
  const room=new LanternRoom({
   residentId:'moonwire-room-'+index,worldId:'PHYSICAL_MOONWIRE_ROOM'
  });
  const selected=room.resident.choosePreset(moonwire,preset.preset_id);
  assert.equal(room.snapshot().grounded,0);
  assert.equal(selected.native_recipe?.route,preset.route);
  assert.equal(room.walkTo(1.8,1.5).ok,true);
  const rec=room.touch('bench');
  assert.equal(rec.ok,true);
  room.wait(120);
  const state=room.snapshot(),recipe=state.rich.native.moonwire;
  assert.equal(recipe.id,preset.preset_id);
  assert.equal(recipe.route,preset.route);
  assert.equal(recipe.envelope,preset.temporal.envelope_a);
  assert.ok(recipe.response>=0&&recipe.response<=1);
  assert.equal(recipe.evidence_gain,0);
  assert.ok(Math.abs(recipe.carrier.sum-1)<1e-4);
  assert.ok(recipe.zone_weights['hand.R.palm']>=0);
  assert.equal(state.field.m[state.field.z.indexOf('hand.R.palm')],1);
  seen.add(recipe.route);
  room.close();
  assert.equal(room.snapshot().grounded,0);
 }
 assert.equal(seen.size,10);
});

test('boundary attacks cannot consume time, issue receipts, or fake contact',()=>{
 const room=new LanternRoom({residentId:'boundary-lab'});
 const start=room.snapshot();
 for(const [x,y,why] of [
   [1e15,1e15,'OUTSIDE_ROOM'],
   [5.81,3.7,'OUTSIDE_ROOM'],
   [2.8,1.5,'FURNITURE_COLLISION'],
   [Number.POSITIVE_INFINITY,1,'INVALID_POSITION'],
   [Number.NaN,.5,'INVALID_POSITION']
 ]) {
  const denied=room.walkTo(x,y);
  assert.equal(denied.ok,false);
  assert.equal(denied.error,why);
 }
 assert.equal(room.ringBell().error,'OUT_OF_REACH');
 room.say('The brass bell rings and the air is cold');
 const after=room.snapshot();
 assert.deepEqual(after.position,start.position);
 assert.equal(after.t_ms,start.t_ms);
 assert.equal(after.memory.events,start.memory.events);
 assert.equal(after.grounded,0);
 assert.equal(room.resident.hearing().length,0);
 assert.equal(room.walkTo(1.8,1.5).ok,true);
 const contact=room.touch('bench');
 assert.equal(contact.receiptId.endsWith(':1'),true,
  'refused actions must not mint receipt IDs');
 assert.equal(room.snapshot().grounded,1);
 room.wait(FIXTURES.bench.leaseMs+1);
 assert.equal(room.snapshot().grounded,0);
});

test('a multi-minute seated visit renews ONE grounded receipt without resetting soft creep',()=>{
 const room=new LanternRoom({residentId:'long-sit-full'});
 assert.equal(room.walkTo(1.8,1.5).ok,true);
 const start=room.sit();
 assert.equal(start.ok,true);
 const before=room.resident.support();
 assert.equal(before.active,true);
 assert.equal(before.receiptId,start.receiptId);
 room.wait(90000);
 const state=room.snapshot(),after=room.resident.support();
 const seat=state.field.z.indexOf('pelvis.seat');
 assert.equal(state.seated,true);
 assert.equal(state.field.m[seat],1,'physical support must remain grounded while seated');
 assert.equal(after.active,true);
 assert.equal(after.receiptId,start.receiptId,'no invented replacement support');
 assert.ok(after.age_s>85,'the support creep clock must not restart upon lease renewal');
 assert.ok(after.sigma>before.sigma,'the same conserved load must spread over time');
 assert.ok(Math.abs(after.values.reduce((s,x)=>s+x.load,0)-.84)<1e-5);
 const onsets=room.resident.memory.recent({limit:50}).filter(e=>
  e.kind==='CONTACT_STARTED'&&e.receiptId===start.receiptId);
 assert.equal(onsets.length,1,'renewed support must not mint another onset');
 assert.equal(room.stand().released,true);
 assert.equal(room.resident.support().active,false);
 assert.equal(room.snapshot().field.m[seat],0);
 room.close();
});
test('STOP clears contact and support and preserves archived evidence',()=>{
 const room=new LanternRoom({residentId:'stop-full'});
 room.walkTo(1.8,1.5);
 assert.equal(room.sit().ok,true);
 assert.ok(room.snapshot().grounded>=1);
 const eventsBefore=room.resident.memory.stats().events;
 room.close();
 const state=room.snapshot();
 assert.equal(state.grounded,0);
 assert.equal(state.field.cc,null);
 assert.equal(state.rich.native.support.active,false);
 assert.equal(room.resident.hearing().length,0);
 assert.ok(room.resident.memory.stats().events>=eventsBefore+2);
 assert.equal(room.resident.memory.recent({limit:50})
  .filter(x=>x.kind==='DEPARTURE').length,1);
 assert.throws(()=>room.ringBell(),/ROOM_VISIT_ENDED/);
 assert.equal(room.close().already_closed,true);
});
