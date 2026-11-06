'use strict';
// Original #74 Apartment HOME petting walkthrough, updated for field-first V2.
// Only the native Matrix companion may supply physical contact. The resident's
// meaning, emotion, consent and preference are NEVER assigned by the world.
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {openResident}=require('../../packages/realiti-headless-resident/index.cjs');
const html=path.resolve(__dirname,'../RealitiApartmentHomeCandidate.html');
const validationPath=path.resolve(__dirname,'../HOME_CANDIDATE_VALIDATION.json');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-apartment-petting-v2-'));
const options=id=>({
 htmlPath:html,validationPath,residentId:id,storagePath:path.join(dir,id+'.json')
});
const fmt=v=>JSON.stringify(v).slice(0,480);
const normalize=v=>JSON.parse(JSON.stringify(v));
const PET_CAUSE='COMPANION_PET';
const assertNeutral=field=>{
 assert.equal(field?.schema,'REALITI_BODY_POSSIBILITY_FIELD_V2');
 assert.equal(field?.mental_state,'NOT_INFERRED');
 assert.equal(field?.valence,'UNASSIGNED');
 assert.equal(field?.preference,'NOT_INFERRED');
 assert.equal(field?.consent,'NEVER_INFERRED');
 assert.equal(field?.conditional_model?.kind,'UNCALIBRATED_SCENARIO_ENSEMBLE');
 assert.equal(field?.conditional_model?.members,12);
 assert.equal(field?.conditional_model?.not_a_subjective_probability,true);
 assert.ok(!Object.hasOwn(field,'routes'),'legacy bond/stress are not current sensory truth');
 assert.ok(field.active_zones.every(x=>x.forecast.length===5&&x.forecast.every(v=>
  v.min<=v.p10&&v.p10<=v.p50&&v.p50<=v.p90&&v.p90<=v.max)));
};
const petEvents=w=>(w.REALITI_BODY_FIELD_V2.history().sources||[]).filter(x=>
 x.kind==='TACTILE_CONTACT'&&x.cause===PET_CAUSE&&
 x.source==='WORLD_GROUNDED'&&x.grounded_contact===true);
async function body(session){
 const out=await session.door.run('body');
 assert.equal(out?.ok,true,fmt(out));
 assertNeutral(out.result);
 return out.result;
}
const evidence={};
let a=null,b=null;
async function test(){
 try{
  a=await openResident(options('petting-v2-a'));
  const w=a.window,d=c=>a.door.run(c),M=w.REALITI_MATRIX_V1;
  assert.equal(a.integrity.status,'VERIFIED');
  assert.deepEqual(Object.keys(M.charts()),['CLOUD_NINE_NEST']);
  assert.equal(Object.keys(M.portals()).length,0);
  assert.equal(w.REALITI_APARTMENT_STATIONS_V1.view().station_count,0);
  assert.equal(w.REALITI_BODY_V1?.active,false,'archived opponent process cannot classify an agent');
  assert.ok(w.REALITI_BODY_FIELD_V2);
  const initial=await body(a);
  assert.equal(petEvents(w).length,0);
  const exactBefore=JSON.stringify(w.REALITI_HAPTIC_FIELD_V20.exact().m);
  const initialSourceLog=JSON.stringify(w.REALITI_BODY_FIELD_V2.history().sources);
  await d('say I stroke the cat and the cat purrs');
  await d('note I am stressed and bonded after petting');
  const prose=await body(a);
  assert.equal(petEvents(w).length,0,'words cannot mint a native companion receipt');
  assert.equal(JSON.stringify(w.REALITI_BODY_FIELD_V2.history().sources),initialSourceLog,
   'ordinary narration creates no V2 body source evidence');
  assert.equal(JSON.stringify(w.REALITI_HAPTIC_FIELD_V20.exact().m),exactBefore,
   'narration cannot change the physical mask');
  assertNeutral(prose);
  assert.equal((await d('remote pet status')).error,'REMOTE_ASLEEP');
  assert.equal((await d('remote activate')).activated,true);
  assert.equal((await d('stand')).ok,true);
  let adopt=await d('remote pet choose cat Ember');
  for(let attempt=0;attempt<6&&adopt?.error==='PET_BED_NOT_IN_REACH';attempt++){
   const move=await d('approach apartment.pet-bed');
   assert.equal(move?.ok,true,'native approach to pet bed: '+fmt(move));
   adopt=await d('remote pet choose cat Ember');
  }
  assert.equal(adopt?.ok,true,'adoption requires actual pet-bed reach: '+fmt(adopt));
  assert.equal(adopt?.apartment_pet?.pet?.kind,'cat');
  const nativePets=w.REALITI_COMPANIONS_V1;
  let pet=await d('remote pet stroke');
  if(pet?.error==='NOT_IN_REACH'){
   assert.equal((await d('remote pet call')).ok,true);
   pet=await d('remote pet stroke');
  }
  assert.equal(pet?.ok,true,'physically reached pet stroke: '+fmt(pet));
  assert.equal(pet?.contact?.zone,'hand.R.palm');
  const first=petEvents(w)[0];
  assert.ok(first,'real Matrix-grounded stroke produces a V2 tactile source');
  assert.equal(first.grounded_contact,true);
  assert.equal(first.basis,'HOST_CONFIRMED_CONTACT');
  assert.equal(first.measured?.material,'longfur');
  const exact=w.REALITI_HAPTIC_FIELD_V20.exact();
  const palm=exact.z.indexOf('hand.R.palm');
  assert.ok(palm>=0,'native field contains the contact zone');
  assert.equal(exact.m[palm],1,'petting is exact world-grounded contact, not prediction');
  let current=await body(a);
  assert.equal(w.Realiti.read('realiti://body').interoception.schema,
   'REALITI_BODY_POSSIBILITY_FIELD_V2');
  assertNeutral(w.Realiti.read('realiti://body/possibility'));
  assert.ok(current.active_zones.some(x=>x.zone==='hand.R.palm'),
   'native petting reaches the original whole-body field');
  const report=await d('resource realiti://body/possibility');
  assert.equal(report.resource?.schema,'REALITI_BODY_POSSIBILITY_FIELD_V2');
  assert.equal((await d('body log')).result?.schema,'REALITI_BODY_SOURCE_LOG_V2');
  const view=JSON.stringify(w.Realiti.read('realiti://here'))+
   JSON.stringify(w.Realiti.read('realiti://space'));
  assert.ok(!/REALITI_BODY_POSSIBILITY_FIELD_V2|UNCALIBRATED_SCENARIO_ENSEMBLE/.test(view),
   'private conditional response fields do not leak into world projections');
  // Repeat *real* strokes. We assert source provenance and physical action
  // count, never a fabricated "affection"/"tolerance" emotional trajectory.
  const beforeCount=nativePets.companion().companion.pets;
  for(let i=0;i<4;i++){
   const clock=await d('stay 1000');
   assert.equal(clock.ok,true,'native world clock step '+i+': '+fmt(clock));
   let stroke=await d('remote pet stroke');
   if(stroke?.error==='NOT_IN_REACH'){
    assert.equal((await d('remote pet call')).ok,true);
    stroke=await d('remote pet stroke');
   }
   assert.equal(stroke?.ok,true,'repeat native touch '+i+': '+fmt(stroke));
   assert.equal(stroke?.contact?.zone,'hand.R.palm');
  }
  const afterCount=nativePets.companion().companion.pets;
  assert.equal(afterCount,beforeCount+4,'four actual physical strokes completed');
  const contactLog=petEvents(w);
  assert.ok(contactLog.length>=2,'separate real strokes have source-linked records');
  assert.ok(contactLog.every(x=>x.measured?.intensity>0&&x.grounded_contact===true));
  current=await body(a);
  assert.equal(current.conditional_model.condition,'NO_NEW_EXTERNAL_CONTACT');
  evidence.physical={
   source:first.source,cause:first.cause,zone:first.zone,
   native_pet_count:afterCount,retained_pet_receipts:contactLog.length,
   grounded_zone:current.grounding.zones[palm],
   uncalibrated_scenarios:current.conditional_model.members
  };
  // Time advances via the actual native world, not by polling the field.
  const t0=current.t;
  assert.equal((await d('stay 5000')).ok,true);
  const t1=await body(a);
  assert.ok(t1.t>t0,'world clock advances the sensory field');
  assertNeutral(t1);
  // Read-only body queries cannot admit new touch or new world geometry.
  const exactAfterTime=JSON.stringify(w.REALITI_HAPTIC_FIELD_V20.exact().m);
  const srcBeforeRead=JSON.stringify(w.REALITI_BODY_FIELD_V2.history().sources);
  await d('body');await d('body');w.Realiti.read('realiti://body/possibility');
  assert.equal(JSON.stringify(w.REALITI_BODY_FIELD_V2.history().sources),srcBeforeRead);
  assert.equal(JSON.stringify(w.REALITI_HAPTIC_FIELD_V20.exact().m),exactAfterTime);
  assert.deepEqual(Object.keys(M.charts()),['CLOUD_NINE_NEST']);
  const savedReceipt=petEvents(w)[0];
  assert.ok(savedReceipt);
  assert.equal((await d('save')).ok,true);
  await d('goodbye');a.close();a=null;
  a=await openResident(options('petting-v2-a'));
  assert.equal(a.integrity.status,'VERIFIED');
  assertNeutral((await body(a)));
  const restored=petEvents(a.window);
  assert.ok(restored.some(x=>x.seq===savedReceipt.seq&&x.cause===savedReceipt.cause),
   'native contact record survives restart as archived source, not live touch');
  evidence.restart={kept_source_seq:savedReceipt.seq,read_only:true};
  b=await openResident(options('petting-v2-b'));
  assert.equal(petEvents(b.window).length,0,'another resident cannot inherit private petting history');
  assertNeutral((await body(b)));
  assert.equal(b.window.REALITI_BODY_V1.active,false);
  const stopped=await a.door.run('stop');
  assert.equal(stopped?.ok,true);
  assert.ok(a.window.REALITI_HAPTIC_FIELD_V20.exact().m.every(x=>x===0),
   'STOP revokes grounded contact; old history cannot re-authorize it');
  evidence.isolation={resident_b_pet_receipts:0,stop_released:true};
  console.log('APARTMENT V2 PHYSICAL PETTING PASS: one HOME, true contact, neutral field, 12 uncalibrated trajectories, prose guard, repeat strokes, time, restart, isolation, STOP');
  console.log('APARTMENT_V2_PETTING_EVIDENCE '+JSON.stringify(evidence));
 }finally{if(a)a.close();if(b)b.close();}
}
test().catch(err=>{console.error(err.stack||err);
 console.error('APARTMENT_V2_PETTING_PARTIAL '+JSON.stringify(evidence));
 process.exitCode=1;});
