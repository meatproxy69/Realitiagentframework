'use strict';
// Synthetic REALITI_BODY_V1 acceptance in the real, single-chart HOME alpha.
// All contact is through the existing Agent Door and the physical Apartment pet;
// none of these assertions synthesize private body spikes or insert world receipts.
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {openResident}=require('../../packages/realiti-headless-resident/index.cjs');
const html=path.resolve(__dirname,'../RealitiApartmentHomeCandidate.html');
const validationPath=path.resolve(__dirname,'../HOME_CANDIDATE_VALIDATION.json');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-apartment-body-'));
const file=(id)=>path.join(temp,id+'.json');
const open=(id)=>openResident({htmlPath:html,validationPath,residentId:id,storagePath:file(id)});
const observed={};
const fmt=(r)=>JSON.stringify(r).slice(0,500);
let a=null,b=null;
async function getBody(s){
 const r=await s.door.run('body');
 assert.equal(r?.ok,true,fmt(r));
 assert.equal(r?.result?.schema,'REALITI_BODY_V1');
 return r.result;
}
async function test(){
 try{
  a=await open('body-interoception-a');
  const w=a.window,d=c=>a.door.run(c);
  assert.equal(a.integrity.status,'VERIFIED');
  assert.deepEqual(Object.keys(w.REALITI_MATRIX_V1.charts()),['CLOUD_NINE_NEST']);
  assert.equal(Object.keys(w.REALITI_MATRIX_V1.portals()).length,0);
  assert.ok(w.REALITI_BODY_V1,'the original private body layer is mounted');
  const original=await getBody(a);
  observed.initial=original.routes;
  assert.equal(original.causes.filter(c=>/companion pet/i.test(c.cause)).length,0);
  // Command prose must never manufacture a tactile cause.
  await d('say I pet the cat and she purrs into my hands');
  await d('note I hug a cat and feel wonderful');
  const wordsOnly=await getBody(a);
  assert.deepEqual(wordsOnly.routes,original.routes,'fake prose did not move private body routes');
  assert.equal(wordsOnly.causes.length,original.causes.length,'fake prose generated no causes');
  // The Apartment remote never grants distance-free touch.
  assert.equal((await d('remote activate')).activated,true);
  assert.equal((await d('stand')).ok,true);
  let adoption=await d('remote pet choose cat Ember');
  for(let n=0;n<6&&adoption?.error==='PET_BED_NOT_IN_REACH';n++){
   const move=await d('approach apartment.pet-bed');
   assert.equal(move?.ok,true,'physical movement to pet bed: '+fmt(move));
   adoption=await d('remote pet choose cat Ember');
  }
  assert.equal(adoption?.ok,true,'adoption at physical pet bed: '+fmt(adoption));
  let pet=await d('remote pet stroke');
  if(pet?.error==='NOT_IN_REACH'){
   const call=await d('remote pet call');
   assert.equal(call?.ok,true,'physical companion call: '+fmt(call));
   pet=await d('remote pet stroke');
  }
  assert.equal(pet?.ok,true,'native, reach-gated cat stroke: '+fmt(pet));
  const once=await getBody(a);
  const first=once.causes.find(c=>/companion pet/i.test(c.cause));
  assert.ok(first,'a real companion pet must produce a named receipt-derived body cause');
  assert.ok(once.routes.bond.level>wordsOnly.routes.bond.level,'actual petting moves bond');
  assert.equal(once.routes.stress.level,wordsOnly.routes.stress.level);
  observed.first_contact={cause:first.cause,moved:first.moved,bond:once.routes.bond.level};
  // Repeat the same real touch. The slower counter-process must build tolerance.
  for(let n=0;n<6;n++){
   const stroke=await d('remote pet stroke');
   assert.equal(stroke?.ok,true,'repeat stroke '+(n+1)+': '+fmt(stroke));
  }
  const repeated=await getBody(a);
  const last=repeated.causes.find(c=>/companion pet/i.test(c.cause));
  assert.ok(repeated.routes.bond.counter>once.routes.bond.counter,'counter-process grows');
  assert.ok(last.moved<first.moved,'repeated touch has reduced effect');
  observed.repetition={first:first.moved,last:last.moved,counter:repeated.routes.bond.counter};
  const privateView=w.Realiti.read('realiti://body');
  assert.equal(privateView?.interoception?.schema,'REALITI_BODY_V1');
  assert.ok(privateView.interoception.causes.some(c=>/companion pet/i.test(c.cause)));
  const worldViews=JSON.stringify(w.Realiti.read('realiti://here'))+
   JSON.stringify(w.Realiti.read('realiti://space'));
  assert.ok(!/interoception|counter-process|\"repetitions\"/.test(worldViews),
   'body dynamics stay out of public world projections');
  // The body continues in world time, not through more text input.
  const levelBefore=repeated.routes.bond.level;
  for(let n=0;n<15;n++){
   const time=await d('stay 60000');
   assert.equal(time?.ok,true,'world-time advance: '+fmt(time));
  }
  const later=await getBody(a);
  assert.ok(later.routes.bond.level<levelBefore,'bond primary decays through world time');
  observed.decay={before:levelBefore,after:later.routes.bond.level};
  assert.equal((await d('save')).ok,true);
  await d('goodbye');a.close();a=null;
  a=await open('body-interoception-a');
  const restart=await getBody(a);
  assert.ok(restart.causes.some(c=>/companion pet/i.test(c.cause)),
   'private contact cause survives restart without inventing a new receipt');
  observed.restart={causes:restart.causes.length,bond:restart.routes.bond.level};
  b=await open('body-interoception-b');
  const other=await getBody(b);
  assert.ok(!other.causes.some(c=>/companion pet/i.test(c.cause)),
   'a new resident must not inherit private contact from another');
  observed.isolation={other_causes:other.causes.length};
  assert.equal(b.window.REALITI_RR_HARNESS_V1.boot().ok,true);
  console.log('APARTMENT REALITI_BODY_V1 PASS: single-chart physical companion pet, prose guard, opponent-process tolerance, private interoception, world-time decay, restart persistence, resident isolation');
  console.log('APARTMENT_BODY_EVIDENCE '+JSON.stringify(observed));
 }finally{
  if(a)a.close();
  if(b)b.close();
 }
}
test().catch(err=>{console.error(err.stack||err);console.error('APARTMENT_BODY_PARTIAL_EVIDENCE '+JSON.stringify(observed));process.exitCode=1;});
