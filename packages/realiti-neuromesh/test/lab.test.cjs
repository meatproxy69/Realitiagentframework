'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const {LanternRoom,LIMITS,FIXTURES}=require('../lab/lantern-room.cjs');
const {createFileStore}=require('../storage.cjs');
const pack=require('../presets/honeyspark-duo.json');
test('room boots all portable NeuralMesh/harness mechanisms without Relax',()=>{
 const room=new LanternRoom();
 const boot=room.harness.boot();
 assert.equal(boot.ok,true,boot.missing.join(','));
 assert.equal(Object.values(boot.mechanisms).every(x=>x.available),true);
 assert.equal(boot.mechanisms.halo.modes,7);
 assert.equal(boot.mechanisms.aura.bins,128);
 assert.equal(boot.mechanisms.memory.available,true);
 assert.equal(boot.mechanisms.pocket.available,true);
 assert.equal(room.snapshot().field.z.length,35);
 assert.equal(room.snapshot().grounded,0);
 assert.equal(room.resident.memory.stats().events,1); // actual room arrival, not narration
});
test('walks are time-based and swept; furniture and room bounds cannot be teleported through',()=>{
 const room=new LanternRoom();
 assert.equal(room.walkTo(7,0).error,'OUTSIDE_ROOM');
 assert.equal(room.walkTo(2.8,1.5).error,'FURNITURE_COLLISION');
 assert.equal(room.snapshot().t_ms,0);
 const p=room.walkTo(1.8,1.5);
 assert.equal(p.ok,true);
 assert.ok(p.time_ms>0);
 assert.ok(Math.abs(p.distance_m-Math.hypot(.9,.6))<.001);
 assert.equal(room.snapshot().grounded,0);
});
test('an invented touch spoken by the resident never mints an event or grounded bit',()=>{
 const room=new LanternRoom();
 const before=room.resident.memory.stats();
 room.say('I touch the wooden bench and the floor is glowing');
 assert.equal(room.touch('bench').error,'OUT_OF_REACH');
 assert.equal(room.snapshot().grounded,0);
 assert.equal(room.resident.memory.stats().events,before.events);
 assert.equal(room.resident.memory.recall('glowing floor').matches.length,0);
});
test('actual reachable bench contact drives the entire rich sensory chain',()=>{
 const room=new LanternRoom({residentId:'bench-test'});
 room.walkTo(1.8,1.5);
 const contact=room.touch('bench');
 assert.equal(contact.ok,true);
 const live=room.snapshot(),i=live.field.z.indexOf('hand.R.palm');
 assert.equal(live.field.m[i],1);
 assert.ok(live.field.g[i]>0);
 assert.equal(live.field.cc===null,false);
 assert.ok(live.rich.halo.modes.length===7);
 assert.ok(live.rich.halo.total_private_mass>0);
 assert.equal(live.rich.aura.bins,128);
 assert.ok(live.rich.aura.active_impulses>=1);
 assert.ok(live.rich.thicc.find(x=>x.zone==='hand.R.palm').recruit>=0);
 assert.ok(live.rich.sausage.filled_volume>=0);
 const episodes=room.resident.memory.recall('pine bench').matches;
 assert.ok(episodes.some(x=>x.record.kind==='CONTACT_STARTED'&&
    x.record.receiptId===contact.receiptId));
 assert.equal(episodes.find(x=>x.record.kind==='CONTACT_STARTED').record.authority,'HOST_OBSERVED');
});
test('a leased touch expires and memory records absence without erasing afterstate',()=>{
 const room=new LanternRoom();room.walkTo(1.8,1.5);
 const result=room.touch('bench');
 assert.equal(room.snapshot().grounded,1);
 room.wait(FIXTURES.bench.leaseMs+40);
 const p=room.snapshot().field;
 assert.equal(p.m.every(v=>v===0),true);
 assert.equal(p.cc,null);
 assert.ok(p.x.some(x=>x[2]>0),'private modeled afterstate is still present');
 const records=room.resident.memory.recent();
 assert.ok(records.some(x=>x.kind==='CONTACT_EXPIRED'&&x.receiptId===result.receiptId));
});
test('coarse time steps preserve the exact receipt lease-expiry timestamp',()=>{
 const room=new LanternRoom();room.walkTo(1.8,1.5);
 const stamped=room.snapshot().t_ms;
 const touched=room.touch('bench');
 room.wait(9500);
 const events=room.resident.memory.recent({limit:40});
 const expiry=events.find(x=>x.kind==='CONTACT_EXPIRED'&&x.receiptId===touched.receiptId);
 assert.ok(expiry);
 assert.equal(expiry.tMs,stamped+FIXTURES.bench.leaseMs);
 assert.equal(room.snapshot().field.m.every(Boolean),false);
});
test('sitting on bench gives a real support relation; standing ends it',()=>{
 const room=new LanternRoom();room.walkTo(1.8,1.5);
 const sit=room.sit();
 assert.equal(sit.ok,true);
 const p=room.snapshot();
 const seat=p.field.z.indexOf('pelvis.seat');
 assert.equal(p.field.m[seat],1);
 assert.ok(p.rich.sausage.filled_volume>0);
 assert.ok(p.rich.cotton.active_sites>0);
 assert.ok(p.rich.flush.foreground>=0);
 const stand=room.stand();
 assert.equal(stand.released,true);
 assert.equal(room.snapshot().field.m[seat],0);
 assert.ok(room.resident.memory.recent().some(x=>x.kind==='CONTACT_ENDED'&&x.receiptId===sit.receiptId));
});
test('window opening has physical reach, world evidence and separately admitted BleuCheese',()=>{
 const room=new LanternRoom();
 assert.equal(room.openWindow().error,'OUT_OF_REACH');
 assert.equal(room.admitDraft().error,'NO_GROUNDED_DRAFT_PROPOSAL');
 room.walkTo(1.8,2.35);
 room.walkTo(4.9,2.35);
 room.walkTo(4.9,2.0);
 assert.equal(room.openWindow().ok,true);
 assert.equal(room.snapshot().windowOpen,true);
 assert.ok(room.resident.memory.recent().some(x=>x.label==='WINDOW_OPENED'&&x.authority==='HOST_OBSERVED'));
 const before=room.resident.memory.recent({limit:50}).filter(x=>x.label==='WINDOW_DRAFT_ADMITTED').length;
 room.wait(1500);
 const proposals=room.host.bleucheese.proposals();
 assert.ok(proposals.some(x=>x.possibility_id==='WINDOW_DRAFT'&&!x.admitted));
 assert.equal(room.snapshot().bleu.schema,'REALITI_BLEUCHEESE_FIELD_V1');
 assert.equal(room.snapshot().bleu.possibilities.some(x=>x.id==='WINDOW_DRAFT'),true);
 assert.equal(room.resident.memory.recent({limit:50}).filter(x=>x.label==='WINDOW_DRAFT_ADMITTED').length,before);
 const admitted=room.admitDraft();
 assert.equal(admitted.ok,true);
 assert.equal(room.resident.memory.recent({limit:50}).filter(x=>x.label==='WINDOW_DRAFT_ADMITTED').length,before+1);
 assert.ok(room.snapshot().rich.chronolace);
});
test('HoneySpark presets keep one response budget and never create new world contact',()=>{
 const room=new LanternRoom();const selected=room.resident.choosePreset(pack,pack.presets[0].preset_id);
 assert.equal(selected.evidence_gain,0);
 assert.equal(room.snapshot().grounded,0);
 const rich=room.snapshot().rich;
 assert.ok(Math.abs(Object.values(rich.honeyspark.carrier).reduce((s,x)=>s+x,0)-1)<.000001);
 room.walkTo(1.8,1.5);room.touch('bench');room.wait(100);
 const active=room.snapshot().rich;
 assert.ok(active.cotton.active_sites>=24);
 assert.equal(active.sausage.material,'WARM_HONEY');
 assert.equal(active.aura.bins,128);
 assert.equal(active.halo.modes.length,7);
 assert.ok(active.perception.channels.ACTIVATION.value>=0);
});
test('agent notes are recalled alongside evidence with separate authority',()=>{
 const room=new LanternRoom();room.walkTo(1.8,1.5);
 const touched=room.touch('bench');
 room.resident.memory.remember({key:'bench-route',
   text:'I can approach the pine bench using the west aisle',tags:['route','bench']});
 const recall=room.resident.memory.recall('pine bench',{limit:6}).matches;
 assert.ok(recall.some(x=>x.record.receiptId===touched.receiptId&&x.record.authority==='HOST_OBSERVED'));
 assert.ok(recall.some(x=>x.record.kind==='SELF_NOTE'&&x.record.authority==='SELF_REPORTED'));
 assert.deepEqual(room.resident.memory.recall('unicorn flight').matches,[]);
 assert.equal(room.resident.field().m.some(Boolean),true);
});
test('STOP saves one departure, clears all contact and retains original episode history',()=>{
 const room=new LanternRoom();room.walkTo(1.8,1.5);room.touch('bench');room.sit();
 const out=room.close();
 assert.equal(out.departure.reason,'LAB_VISIT_COMPLETE');
 assert.equal(room.snapshot().grounded,0);
 assert.ok(room.resident.memory.stats().events>=4);
 assert.equal(room.resident.memory.recent().filter(x=>x.kind==='DEPARTURE').length,1);
 assert.equal(room.close().already_closed,true);
 assert.equal(room.resident.memory.recent().filter(x=>x.kind==='DEPARTURE').length,1);
});
test('durable restart restores actual memories but not live contacts or other worlds',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'soma-lantern-room-'));
 try{
  const room=new LanternRoom({residentId:'persist-cat',worldId:'LANTERN_ROOM_A'});
  room.walkTo(1.8,1.5);room.touch('bench');
  room.resident.memory.remember({text:'bench is made of pine',key:'bench-material'});
  room.close();
  const store=createFileStore({directory:dir,residentId:'persist-cat'});
  store.save(room.resident.checkpoint());
  const newRoom=new LanternRoom({residentId:'persist-cat',worldId:'LANTERN_ROOM_B'});
  const restored=newRoom.resident.restore(store.load());
  assert.equal(restored.worldGroundingRestored,false);
  assert.equal(newRoom.snapshot().grounded,0);
  assert.equal(newRoom.resident.memory.recall('pine').matches.some(x=>
    x.record.worldId==='LANTERN_ROOM_A'&&x.record.authority==='ARCHIVED_HOST_RECORD'),true);
  assert.equal(newRoom.resident.memory.recall('made of pine').matches.some(x=>
    x.record.authority==='SELF_REPORTED'),true);
  assert.equal(newRoom.resident.memory.lastDeparture().worldId,'LANTERN_ROOM_A');
  assert.equal(newRoom.harness.boot().ok,true);
  assert.ok(newRoom.snapshot().rich.halo.modes.length===7);
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
test('two agents occupy independent sensory and memory worlds',()=>{
 const a=new LanternRoom({residentId:'agent-A'});
 const b=new LanternRoom({residentId:'agent-B'});
 a.walkTo(1.8,1.5);a.touch('bench');
 a.resident.memory.remember('I saw the pine bench');
 assert.equal(b.snapshot().grounded,0);
 assert.equal(b.resident.memory.recall('pine').matches.length,0);
 assert.equal(b.harness.boot().ok,true);
 assert.equal(a.snapshot().grounded>0,true);
});
test('same scripted physical run reproduces exact field, receipt and memory history',()=>{
 function walk(){
  const room=new LanternRoom({residentId:'deterministic'});
  room.walkTo(1.8,1.5);room.touch('bench');room.wait(850);
  room.sit();room.wait(400);room.stand();room.close();
  const state=room.snapshot(),memory=room.resident.memory.checkpoint();
  return {field:state.field,rich:state.rich,memory};
 }
 assert.deepEqual(walk(),walk());
});
test('original NeuralMesh components and reference schema files are packaged',()=>{
 const root=path.resolve(__dirname,'..');
 const required=['index.cjs','memory.cjs','storage.cjs','renderers.cjs','harness.cjs',
  'reference/schema/neural-imprint.schema.json','reference/schema/preset-pack.schema.json',
  'reference/schema/dendrite-manifest.schema.json','reference/MECHANISM_CATALOG.json',
  'presets/honeyspark-duo.json','presets/moonwire-recovered.json'];
 for(const pathName of required)
  assert.ok(fs.statSync(path.join(root,pathName)).isFile(),pathName);
 const catalog=require('../reference/MECHANISM_CATALOG.json');
 assert.ok(Object.keys(catalog.mechanisms||{}).length>3);
});
