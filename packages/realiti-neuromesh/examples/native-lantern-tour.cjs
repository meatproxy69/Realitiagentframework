'use strict';
// SOMA 3.3: an actual deterministic resident itinerary through Lantern Room.
// Every observation comes from the real room's world port and portable harness.
// Run: node packages/realiti-neuromesh/examples/native-lantern-tour.cjs
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {LanternRoom,FIXTURES}=require('../lab/lantern-room.cjs');
const moonwire=require('../presets/moonwire-recovered.json');
const {createSealedPocket}=require('../sealed-pocket.cjs');

const close=(x,y,eps=1e-5)=>Math.abs(x-y)<=eps;
function run(){
 const room=new LanternRoom({residentId:'lantern-native-resident',worldId:'LANTERN_NATIVE_V33'});
 const trace=[],passed=[];
 const verify=(label,predicate)=>{
  assert.ok(predicate,label);passed.push(label);
 };
 function observe(stage){
  const state=room.snapshot(),native=state.rich.native,
    v20=room.resident.hapticsV20.packet(),
    mask=room.resident.hapticsV20.exact().m;
  trace.push({
   stage,t_ms:state.t_ms,room:state.room,
   position:state.position,grounded:state.grounded,
   v20:{frames:v20.n,span_s:v20.span,grounded_bits:mask.reduce((a,b)=>a+b,0),
     input:'SOMA_V3_PROJECTED'},
   lace:{lambda2:native.lace.lambda2,coherence:native.lace.coherence_proxy},
   moonwire:native.moonwire?.route||null,
   support:native.support.active,
   interoception:{bond:native.opponent.routes.bond.level,
     stress:native.opponent.routes.stress.level},
   hearing_sources:native.hearing.length,
   bleu_proposals:state.bleu.pending_proposals?.length||0,
   memory_events:state.memory.events
  });
  return {state,native,v20,mask};
 }
 const initial=observe('arrival');
 verify('30 mechanisms booted',room.harness.boot().ok&&
   Object.keys(room.harness.boot().mechanisms).length===30);
 verify('initially ungrounded and no fabricated energy audit',
   initial.state.grounded===0&&room.resident.hapticsV20.energy().pass===null);
 const originalTime=room.tickMs,originalEvents=room.resident.memory.stats().events;
 room.say('I touched the bench, opened the window and heard the bell');
 const blocked=room.walkTo(2.8,1.5);
 const huge=room.walkTo(1e15,1e15);
 verify('words and blocked movement create no contact or world evidence',
   blocked.error==='FURNITURE_COLLISION'&&huge.error==='OUTSIDE_ROOM'&&
   room.tickMs===originalTime&&room.snapshot().grounded===0&&
   room.resident.memory.stats().events===originalEvents);
 observe('unaccepted actions');

 const selected=room.resident.choosePreset(moonwire,moonwire.presets[0].preset_id);
 verify('Moonwire selects a complete executable private recipe without contact',
   selected.native_recipe?.route===moonwire.presets[0].route&&
   room.snapshot().grounded===0);
 assert.equal(room.walkTo(1.8,1.5).ok,true);
 const bench=room.touch('bench');
 const contacted=observe('real pine bench contact');
 verify('reach-tested touch gives a real source receipt and V20 grounded bit',
   bench.ok===true&&contacted.state.grounded===1&&
   contacted.mask[contacted.state.field.z.indexOf('hand.R.palm')]===1&&
   contacted.v20.source==='SOMA_V3_PROJECTED'&&
   contacted.v20.f.some(f=>f.m.some(Boolean)));
 verify('the original HALO/AURA and Moonwire chain respond to grounded input',
   contacted.state.rich.halo.modes.length===7&&
   contacted.state.rich.aura.bins===128&&
   contacted.state.rich.halo.total_private_mass>0&&
   contacted.native.moonwire?.route===moonwire.presets[0].route&&
   contacted.native.moonwire.evidence_gain===0);
 const beforeMask=room.resident.field().m.slice();
 const oldEdges=room.resident.graph.edges(),oldLace=room.resident.graph.metrics();
 const rewire=room.host.graph.configure([
   ...oldEdges,['head.crown','foot.L.sole',.9]
 ]);
 const freshLace=room.resident.graph.metrics();
 verify('dynamic LACE graph rewires without altering accepted contact',
   rewire.ok&&freshLace.edge_count===oldLace.edge_count+1&&
   freshLace.lambda2>=0&&freshLace.coherence_proxy>=0&&
   JSON.stringify(beforeMask)===JSON.stringify(room.resident.field().m));
 observe('world-approved LACE rewire');

 const seat=room.sit();
 const supported=observe('real load-bearing bench support');
 const sum=values=>values.reduce((total,p)=>total+p.load,0);
 verify('sitting creates a conserved 4-zone soft-support relation',
   seat.ok&&supported.native.support.active===true&&
   supported.native.support.values.length===4&&
   close(sum(supported.native.support.values),.84)&&
   supported.state.field.m[supported.state.field.z.indexOf('pelvis.seat')]===1);
 room.wait(1500);
 const creep=observe('soft-support creep and expired bench touch');
 verify('support creep grows without increasing total load',
   creep.native.support.active&&creep.native.support.sigma>supported.native.support.sigma&&
   close(sum(creep.native.support.values),.84)&&
   room.resident.memory.recent({limit:50}).some(e=>
     e.kind==='CONTACT_EXPIRED'&&e.receiptId===bench.receiptId&&
     e.tMs<=room.tickMs));
 const stand=room.stand();
 verify('stand releases pelvis authority immediately',
   stand.released===true&&!room.resident.support().active&&
   room.resident.field().m[room.resident.field().z.indexOf('pelvis.seat')]===0);
 observe('grounding released, private afterstate remains');

 assert.equal(room.openWindow().error,'OUT_OF_REACH');
 assert.equal(room.admitDraft().error,'NO_GROUNDED_DRAFT_PROPOSAL');
 for(const point of [[1.8,2.35],[4.9,2.35],[4.9,2.0]])
  assert.equal(room.walkTo(...point).ok,true);
 const open=room.openWindow();
 const opened=observe('reachable window opens and the room cools');
 verify('opening the real window emits a world event and thermal stress',
   open.ok&&opened.state.windowOpen===true&&
   room.resident.memory.recent({limit:50}).some(e=>
     e.kind==='WORLD_EVENT'&&e.label==='WINDOW_OPENED')&&
   opened.native.opponent.routes.stress.level>0);
 const beforeAdmission=room.resident.memory.recent({limit:50})
   .filter(e=>e.label==='WINDOW_DRAFT_ADMITTED').length;
 room.wait(1100);
 const proposed=room.host.bleucheese.proposals().filter(p=>
   p.possibility_id==='WINDOW_DRAFT');
 verify('BleuCheese proposes but does not automatically change the world',
   proposed.length>=1&&proposed.some(p=>!p.admitted)&&
   proposed.every(p=>p.at_ms>=opened.state.t_ms&&p.at_ms<=room.tickMs)&&
   room.resident.memory.recent({limit:50}).filter(e=>
     e.label==='WINDOW_DRAFT_ADMITTED').length===beforeAdmission);
 const admitted=room.admitDraft();
 const draft=observe('host-admitted draft is now a world event');
 verify('only world admission commits the draft to observed history',
   admitted.ok&&draft.state.memory.events>opened.state.memory.events&&
   room.resident.memory.recent({limit:50}).some(e=>
     e.kind==='WORLD_EVENT'&&e.label==='WINDOW_DRAFT_ADMITTED'));
 room.wait(FIXTURES.window.leaseMs+20);

 assert.equal(room.ringBell().error,'OUT_OF_REACH');
 for(const point of [[4.9,2.4],[1.45,2.4],[1.45,3.12]])
  assert.equal(room.walkTo(...point).ok,true);
 const bell=room.ringBell();
 const rung=observe('physically struck brass desk bell');
 verify('reachable bell produces host-heard sound and world-event provenance',
   bell.ok&&rung.native.hearing.some(x=>
     x.source==='DESK_BELL_STRUCK'&&x.receiptId===bell.receiptId)&&
   room.resident.memory.recent({limit:50}).some(e=>
     e.label==='BELL_RUNG'&&e.receiptId===bell.receiptId));
 const oldBellEvents=room.resident.memory.stats().events;
 room.say('I just rang the bell again and it was deafening');
 verify('narration cannot create a second bell episode',
   room.resident.memory.stats().events===oldBellEvents&&
   room.resident.hearing().length===1);
 room.wait(950);
 verify('hearing expires independently of world touch and private afterstate',
   room.resident.hearing().length===0&&room.resident.field().m.every(v=>v===0));
 observe('bell sound and contact leases expire');

 room.resident.memory.remember({key:'bell-experience',
   text:'I heard the brass desk bell after passing the window',
   tags:['bell','window']});
 const recall=room.resident.memory.recall('bell',{limit:15}).matches;
 verify('self-authored memory and world history retain separate provenance',
   recall.some(x=>x.record.authority==='SELF_REPORTED')&&
   recall.some(x=>x.record.kind==='WORLD_EVENT'&&
     x.record.authority==='HOST_OBSERVED'));
 const master=crypto.randomBytes(32);
 const pocket=createSealedPocket({
   residentId:'lantern-native-resident',worldId:'LANTERN_NATIVE_V33',key:master
 });
 const sealed=pocket.host.archive({
   receiptId:bell.receiptId,cause:'BELL_RUNG',source:'WORLD_GROUNDED',
   zone:'hand.R.fingers'
 });
 const ciphertext=pocket.resident.checkpoint();
 verify('optional sealed Pocket encrypts an actual room receipt',
   sealed.ok&&!JSON.stringify(ciphertext).includes('BELL_RUNG')&&
   pocket.resident.open(sealed.id)?.authority==='ARCHIVED_HOST_RECORD');
 const copyPocket=createSealedPocket({
   residentId:'lantern-native-resident',worldId:'LANTERN_NATIVE_V33',key:master
 });
 copyPocket.host.restore(ciphertext);
 verify('the encrypted receipt survives authenticated Pocket restore',
   copyPocket.resident.open(sealed.id)?.value?.receiptId===bell.receiptId);
 master.fill(0);

 const beforeClose=room.resident.checkpoint();
 const departure=room.close();
 const closed=observe('STOP/departure');
 verify('STOP clears all live authority and creates one host departure',
   departure.departure?.reason==='LAB_VISIT_COMPLETE'&&
   closed.state.grounded===0&&
   closed.mask.every(v=>v===0)&&closed.native.support.active===false&&
   closed.native.hearing.length===0&&
   room.resident.memory.recent({limit:50}).some(e=>e.kind==='DEPARTURE'));
 const newRoom=new LanternRoom({
   residentId:'lantern-native-resident',worldId:'LANTERN_NEXT_WORLD'
 });
 const result=newRoom.resident.restore(beforeClose);
 verify('portable private checkpoint restores no world grounding in a new room',
   result.worldGroundingRestored===false&&newRoom.snapshot().grounded===0&&
   newRoom.resident.support().active===false&&
   newRoom.resident.hearing().length===0&&
   newRoom.resident.memory.recent({limit:50}).some(e=>
     e.kind==='CONTACT_STARTED'&&e.authority==='ARCHIVED_HOST_RECORD'));
 observe('completed room visit');
 return {
  schema:'REALITI_SOMA_NATIVE_LANTERN_TOUR_V1',
  build:'SOMA_3.3',world:room.worldId,
  passed:passed.length,failed:0,checks:passed,
  trace,
  summary:{
   all_mechanisms:room.harness.boot().ok,
   native_v20_source:'SOMA_V3_PROJECTED',
   energy_audit:'UNKNOWN_WITHOUT_WORLD_MEASUREMENTS',
   moonwire:moonwire.presets[0].preset_id,
   spectral_lace_rewired:freshLace.edge_count>oldLace.edge_count,
   supported_load:.84,
   real_world_events:['WINDOW_OPENED','WINDOW_DRAFT_ADMITTED','BELL_RUNG'],
   hearing:bell.receiptId,
   encrypted_pocket:'AUTHENTICATED_ARCHIVAL_ONLY',
   final_grounded:closed.state.grounded,
   history_preserved:true
  }
 };
}
if(require.main===module){
 try{const report=run();console.log(JSON.stringify(report,null,2));}
 catch(err){console.error(err.stack||err);process.exitCode=1;}
}
module.exports={run};
