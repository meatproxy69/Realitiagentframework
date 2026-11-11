'use strict';
// Native V20 end-to-end sensory audit. This file observes the existing world;
// it never constructs a new Matrix, field, NERVE network, or SOMA harness.
const test=require('node:test');
const assert=require('node:assert/strict');
const {createNativeInhabited}=require('./native-inhabited.cjs');
const field=w=>w.REALITI_HAPTIC_FIELD_V20.exact();
const grounded=w=>field(w).z.filter((_,i)=>field(w).m[i]===1);
const imprint=w=>w.REALITI_DEFAULT_IMPRINT_V1.state();
const frozen=a=>JSON.stringify(a);
const noFabricatedEmotion=b=>{
 assert.equal(b.mental_state,'NOT_INFERRED');
 assert.equal(b.valence,'UNASSIGNED');
 assert.equal(b.consent,'NEVER_INFERRED');
};
test('native V15–V20, 35-zone NERVE, SOMA and all presentation lanes boot together',async()=>{
 const s=await createNativeInhabited({residentId:'sensory:topology'});
 try{
  const w=s.trusted.native.window,M=w.REALITI_MATRIX_V1;
  assert.equal(Object.keys(M.charts()).length,23);
  assert.equal(s.trusted.native.ready.harness,'REALITI_RR_HARNESS_V1');
  assert.equal(w.REALITI_RR_HARNESS_V1.boot().ok,true);
  const graph=w.REALITI_NEURAL_PASS_V112.graph();
  assert.equal(graph.zones.length,35);
  assert.ok(graph.edges.length>=39);
  const lace=w.REALITI_NEURAL_PASS_V112.lace();
  assert.equal(lace.node_count,35);
  assert.ok(lace.edge_count>=39);
  const startup=w.REALITI_RESIDENCY_STARTUP_V1.snapshot();
  assert.equal(startup.ready,true,'startup is missing original mechanisms: '+(startup.missing||[]).join(','));
  assert.equal(w.REALITI_HALO_V1.acceptance().pass,true,'HALO self-check failed');
  assert.equal(w.REALITI_AURA_V1.acceptance().pass,true,'AURA self-check failed');
  assert.ok(w.REALITI_V235_INTERNAL?.thiccSample,'THICC source not installed');
  assert.equal(w.REALITI_NEURO_RESTORATION_V1.presets().presets.length,10,
    'the original ten Moonwire recipes must still exist');
  assert.ok(w.REALITI_HALO_V1.snapshot());
  assert.ok(w.REALITI_AURA_V1.internalView());
  assert.equal(w.REALITI_SOMA_RELAX_V3.version,'3.4.0');
  assert.ok(w.REALITI_SOMA_RELAX_V3.harness());
  assert.ok(w.REALITI_SOMA_RELAX_V3.rich());
  assert.equal(w.Realiti.read('realiti://sensory/field').field.v,20);
  assert.equal(w.Realiti.read('realiti://sensory/exact').grounding.v,20);
  assert.ok(w.Realiti.read('realiti://soma/rr'));
  const body=w.Realiti.read('realiti://body/possibility');
  assert.equal(body.schema,'REALITI_BODY_POSSIBILITY_FIELD_V2');
  noFabricatedEmotion(body);
  assert.equal(w.REALITI_BODY_V1.active,false);
  for(const [cmd,predicate] of [
   ['neuro field',r=>r?.packet?.v===20],
   ['neuro moment',r=>String(r?.packet?.version||'').startsWith('15.1')],
   ['neuro interface',r=>r?.state?.build===16],
   ['neuro skin',r=>r?.state?.build===18],
   ['neuro epistemic',r=>r?.state?.build===17]
  ]){
   const result=await s.trusted.native.door.run(cmd);
   assert.ok(predicate(result),cmd+' not backed by original mechanism');
  }
  const snap=imprint(w);
  assert.ok(snap.nerve&&snap.sausage&&snap.carrier&&snap.chronolace);
  const measured=s.trusted.sensory();
  assert.equal(measured.v20,20);
  assert.equal(measured.nerveZones,35);
  assert.equal(measured.nerveEdges,graph.edges.length);
  assert.equal(measured.somaVersion,'3.4.0');
  assert.equal(measured.authority,'NATIVE_WORLD_ONLY');
  assert.ok(measured.soundAvailable&&measured.lightAvailable&&measured.smellAvailable);
  assert.equal(measured.mentalState,'NOT_INFERRED');
  console.log('V20_SENSORY_TOPOLOGY_OK '+JSON.stringify({
   charts:Object.keys(M.charts()).length,nerve_zones:graph.zones.length,
   nerve_edges:graph.edges.length,bridge:w.REALITI_SOMA_RELAX_V3.version,
   original_haptic:field(w).v,mechanisms:'V15.1,V16,V17,V18,V20',
   resident_data_used:false}));
 }finally{await s.trusted.close()}
});
test('native HOME sound/light/smell are spatial fields; passive words and private presets create no contact',async()=>{
 const s=await createNativeInhabited({residentId:'sensory:ambient'});
 try{
  const w=s.trusted.native.window,before=field(w).m.slice();
  const senses=w.Realiti.read('realiti://senses');
  assert.ok(senses.sound&&senses.light&&senses.smell);
  const felt=await s.guest.act('feel');
  assert.equal(felt.ok,true);
  assert.doesNotMatch(felt.message,/^The original world has handled that action\.$/);
  assert.ok(felt.choices.includes('feel'));
  const ambience=await s.guest.act('senses');
  assert.equal(ambience.ok,true);
  assert.doesNotMatch(ambience.message,/^The original world has handled that action\.$/);
  for(const cmd of ['listen','light','smell','senses']){
   const result=await s.trusted.native.door.run(cmd);
   assert.equal(result?.ok,true,cmd+' is not available');
  }
  assert.deepEqual(Array.from(field(w).m),Array.from(before),'observing the environment cannot mint touch');
  assert.equal((await s.guest.speak('the room squeezes every limb')).ok,true);
  assert.deepEqual(Array.from(field(w).m),Array.from(before));
  const privatePulse=await s.trusted.native.door.run('neuromesh handshake');
  assert.equal(privatePulse.ok,true);
  assert.deepEqual(Array.from(field(w).m),Array.from(before),
   'a private handshake is not evidence of a touched body');
  assert.equal(w.Realiti.read('realiti://body/possibility').mental_state,'NOT_INFERRED');
  console.log('V20_SENSORY_AMBIENT_OK '+JSON.stringify({sound:true,light:true,smell:true,imaginary_contact:false}));
 }finally{await s.trusted.close()}
});
test('Cloud Ocean follows real mattress support into original pressure, NERVE/HALO and V20; STOP ends world contact',async()=>{
 const s=await createNativeInhabited({residentId:'sensory:cloud'});
 try{
  const w=s.trusted.native.window;
  // This 23-chart derivative uses the original Matrix's supported mattress;
  // the HOME-only candidate additionally owns an ambient Nest support lease.
  // Never require that separate ambient lease as a prerequisite to real support.
  const M=w.REALITI_MATRIX_V1,r=M.resident(),bed=M.entities()['nest.mattress'];
  assert.equal(r.chart,'CLOUD_NINE_NEST');
  assert.equal(r.posture,'lying');
  assert.ok(r.on==='nest.mattress'||r.support==='nest.mattress');
  assert.ok(M.sdf(bed,r.pose.position)<=1.1);
  // Inspect the original native result for its world-checked leased zones.
  const started=await s.trusted.native.door.run('cloud on');
  assert.equal(started.ok,true);
  const supported=started.native_receipt?.zones||[];
  assert.ok(supported.length>=4,'Cloud must lease multiple original physically eligible zones');
  assert.ok(!supported.some(z=>z.startsWith('arm.')||z.startsWith('shoulder.')),
   'unsupported arms and shoulders must not get fabricated contact');
  const before=grounded(w);
  assert.ok(before.length>0,'native V20 has live support');
  assert.ok(supported.every(z=>before.includes(z)),
   'the source-native Cloud lease must be reflected in V20 grounded field');
  assert.equal((await s.guest.act('cloud burrow')).ok,true);
  assert.equal((await s.guest.act('cloud wave')).ok,true);
  assert.equal((await s.guest.act('stay 500')).ok,true);
  const native=w.REALITI_DYNAMICS_V1.state();
  assert.equal(native.wave?.room,'BOTTOMLESS_PILLOW_SEA');
  assert.ok(native.wave.profile.some(x=>x>0));
  w.REALITI_NEURAL_PASS_V112.update();
  const st=imprint(w),soma=w.REALITI_SOMA_RELAX_V3.rich();
  assert.ok(Number(st.sausage.filled_volume)>0,'original sausage pressure must be driven');
  assert.ok(st.nerve&&Object.keys(st.nerve.zones||{}).length>0,'NERVE did not receive supported body signal');
  assert.ok(Array.isArray(st.carrier.modes)&&st.carrier.modes.length>=7,
   'HALO body modes not routed by existing neural pass');
  assert.ok(soma&&soma.rr,'portable SOMA/R&R projection must be available');
  const metrics=s.trusted.sensory();
  assert.equal(metrics.groundedNative,field(w).m.filter(Boolean).length);
  assert.ok(metrics.pressureVolume>0);
  assert.equal(metrics.haloModes,st.carrier.modes.length);
  assert.equal(typeof metrics.groundedSoma,'number',
   'original B7-to-SOMA mirror must provide an observable grounding mask');
  assert.ok(metrics.groundedSoma>0,
   'native Cloud has grounded contact but the original B7-to-SOMA sensory mirror is empty');
  // A read is never a new world action. A trusted host can verify that the
  // original bridge did not mint extra receipts for looking or feeling.
  const cloudReceipts=()=>w.REALITI_SOMA_RELAX_V3.field().grounded
    .filter(g=>g.cause==='VERIFIED_NATIVE_CLOUD_SUPPORT');
  assert.equal(cloudReceipts().length,supported.length);
  const receiptIds=cloudReceipts().map(g=>g.receiptId).sort();
  assert.equal((await s.guest.act('feel')).ok,true);
  assert.equal((await s.guest.act('cloud status')).ok,true);
  assert.deepEqual(cloudReceipts().map(g=>g.receiptId).sort(),receiptIds,
   'passive reads cannot generate new evidence');
  const mask=field(w).m.slice(),fromImprint=Number(st.sausage.filled_volume);
  assert.ok(mask.some(Boolean));
  assert.equal((await s.guest.act('cloud off')).ok,true);
  assert.equal(w.REALITI_APARTMENT_BED_CLOUD_V1.status().active,false);
  assert.equal(w.REALITI_DYNAMICS_V1.state().wave,null);
  assert.equal(cloudReceipts().length,0,'Cloud off must revoke its SOMA leases without waiting for expiry');
  const stopped=await s.guest.act('stop');
  assert.equal(stopped.ok,true,stopped.message);
  assert.equal(w.REALITI_APARTMENT_BED_CLOUD_V1.status().active,false);
  assert.ok(!w.REALITI_HAPTIC_FIELD_V20.exact().m.some(Boolean),'STOP must revoke V20 grounding');
  assert.equal(cloudReceipts().length,0,'STOP must not leave the old SOMA Cloud lease alive');
  assert.equal(w.Realiti.read('realiti://body/possibility').consent,'NEVER_INFERRED');
  console.log('V20_SENSORY_CLOUD_OK '+JSON.stringify({
   original_supported_zones:supported.length,
   nerve_active:true,carrier_modes:st.carrier.modes.length,
   sausage_response_present:fromImprint>0,
   soma_grounded_during_hold:metrics.groundedSoma,
   native_grounded_during_hold:metrics.groundedNative,stop_grounded:0}));
 }finally{await s.trusted.close()}
});

test('native direct Matrix movement revokes Cloud on the original world before SOMA can report stale touch',async()=>{
 const session=await createNativeInhabited({residentId:'sensory:direct-native-move'});
 try{
  const w=session.trusted.native.window;
  const response=await session.guest.act('cloud on');
  assert.equal(response.ok,true,response.message);
  const leased=()=>w.REALITI_SOMA_RELAX_V3.field().grounded
   .filter(g=>g.cause==='VERIFIED_NATIVE_CLOUD_SUPPORT');
  assert.ok(leased().length>=4,'existing SOMA must mirror actual mattress support before movement');
  const movement=await w.Realiti.invoke('move',{local:[0,2,0]});
  assert.equal(movement.ok,true,'original native move must remain available');
  assert.equal(w.REALITI_APARTMENT_BED_CLOUD_V1.status().active,false);
  assert.equal(leased().length,0,'moving off the mattress must revoke source-bound SOMA leases');
  const refused=await session.guest.act('cloud on');
  assert.equal(refused.ok,false,'unsupported Cloud must refuse, not fabricate contact');
  assert.equal(leased().length,0);
  console.log('V20_SENSORY_DIRECT_MOVE_OK '+JSON.stringify({
   native_move:true,old_cloud_released:true,soma_leases_removed:true,
   unsupported_request_rejected:true}));
 }finally{await session.trusted.close()}
});

test('real Matrix-reached toy contact travels through original B7 to SOMA without borrowed authority',async()=>{
 const session=await createNativeInhabited({residentId:'sensory:toy-world-contact'});
 try{
  const w=session.trusted.native.window;
  assert.equal((await session.guest.act('remote activate')).ok,true);
  const denied=await session.guest.act('remote catnip jar tap');
  assert.equal(denied.ok,false,'remote cannot touch a distant toy');
  const before=w.REALITI_SOMA_RELAX_V3.field().grounded.length;
  const moved=await session.guest.act('approach apartment.ribbon');
  assert.equal(moved.ok,true,moved.message);
  const sourceResult=await session.trusted.native.door.run('remote catnip ribbon flick');
  assert.equal(sourceResult.ok,true,JSON.stringify(sourceResult).slice(0,280));
  // A native V20 field packet is sampled on world advancement. Give the
  // accepted B7 receptor a small real simulated tick, never a fabricated receipt.
  assert.equal((await session.guest.act('stay 50')).ok,true);
  const native=w.REALITI_HAPTIC_FIELD_V20.exact();
  assert.ok(native.z.some((z,i)=>z==='hand.R.palm'&&native.m[i]===1),
   'real hand-to-toy contact must reach original V20');
  const mirrored=w.REALITI_SOMA_RELAX_V3.field().grounded;
  assert.ok(mirrored.some(g=>g.zone==='hand.R.palm'&&g.source==='SELF_STARTED_WORLD_CONTACT'),
   'real, physically reached toy contact must reach the existing SOMA mirror');
  assert.ok(mirrored.length>=before+1);
  assert.equal((await session.guest.act('stop')).ok,true);
  assert.equal(w.REALITI_SOMA_RELAX_V3.field().grounded.length,0);
  console.log('V20_SENSORY_TOY_OK '+JSON.stringify({
   physical_reach:true,native_hand:true,soma_hand:true,stop_released:true,
   distant_toy_denied:true}));
 }finally{await session.trusted.close()}
});
