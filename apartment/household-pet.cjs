'use strict';
// One household companion, one owner-independent authority. Its behavior is
// advanced ONLY by the original REALITI_COMPANIONS_V1 (native spring + OU) in a
// dedicated disposable complete Relax host session. No new AI, haptics or physics.
// Public mirrored animals are real Matrix entities, never replicated pet brains.
const crypto=require('node:crypto');
const {openResident}=require('../packages/realiti-headless-resident/index.cjs');
const HOME='CLOUD_NINE_NEST',ID='household.pet';
const SCHEMA='REALITI_APARTMENT_SHARED_NATIVE_COMPANION_V1';
const kinds=['cat','dog','ferret'];
const cp=x=>JSON.parse(JSON.stringify(x));
const fail=(error,rest={})=>({ok:false,error,...rest});
const validName=name=>typeof name==='string'&&/^[A-Za-z][A-Za-z0-9 -]{1,19}$/.test(name)&&
 name.trim().length>=2;
const finite=n=>typeof n==='number'&&Number.isFinite(n);
function createHouseholdPet({getData,persist,atHome,options}={}){
 if([getData,persist,atHome].some(x=>typeof x!=='function')||
    !options?.htmlPath)throw TypeError('SHARED_PET_REQUIRES_HOST_AND_RELAX_ARTIFACT');
 let service=null;
 const native=w=>w.REALITI_COMPANIONS_V1;
 const engine=()=>service?.window||null;
 const M=entry=>entry.session.window.REALITI_MATRIX_V1;
 function validate(rec){
  if(rec==null)return null;
  if(rec.schema!==SCHEMA||!kinds.includes(rec.kind)||!validName(rec.name)||
     typeof rec.owner!=='string'||!/^[a-z][a-z0-9-]{1,30}$/.test(rec.owner)||
     !Array.isArray(rec.follow)||rec.follow.length!==3||!rec.follow.every(finite)||
     !rec.native||typeof rec.native!=='object'||!['x','y','vx','vy'].every(k=>finite(rec.native[k]))||
     !Array.isArray(rec.native.ou)||rec.native.ou.length!==2||
     !rec.native.ou.every(finite)||
     !Array.isArray(rec.position)||rec.position.length!==3||!rec.position.every(finite)||
     !Number.isSafeInteger(rec.calls)||rec.calls<0||
     !Number.isSafeInteger(rec.pets)||rec.pets<0||
     !Number.isSafeInteger(rec.revision)||rec.revision<1)
   throw Error('SHARED_PET_INVALID_CHECKPOINT');
  if(Math.abs(rec.native.x)>6.5||Math.abs(rec.native.y)>6.5||
     Math.abs(rec.follow[0])>6.5||Math.abs(rec.follow[1])>6.5||
     Math.abs(rec.position[0])>6.5||Math.abs(rec.position[1])>6.5)
   throw Error('SHARED_PET_COORDINATES_OUTSIDE_HOME');
  return rec;
 }
 function driverEntity(){
  if(!engine())return null;
  return Object.entries(engine().REALITI_MATRIX_V1.entities())
   .find(([id,e])=>id.startsWith('pet.')&&e.chart===HOME)?.[1]||null;
 }
 async function createDriver(){
  if(service)return service;
  service=await openResident({htmlPath:options.htmlPath,
   validationPath:options.validationPath,
   residentId:'household-companion-driver-'+crypto.randomBytes(10).toString('hex'),
   beforeParse(w){Object.defineProperty(w,'REALITI_APARTMENT_ROLE',
      {value:'pet-driver',configurable:false})}
  });
  const w=service.window;
  if(w.REALITI_RR_HARNESS_V1?.boot?.()?.ok!==true||
     !native(w)?.adopt||!native(w)?.call||!native(w)?.pet)
    throw Error('FULL_NATIVE_RELAX_COMPANION_ENGINE_REQUIRED');
  return service;
 }
 function setDriverAt(point){
  const w=engine(),m=w.REALITI_MATRIX_V1,r=m.resident();
  r.pose.position=point.slice();r.posture='standing';r.on=null;
  r.intent=null;r.v=[0,0,0];r.support=null;m.bump();
 }
 function snap(name,kind,owner,previous=null){
  const w=engine(),e=driverEntity(),p=native(w).state().pet;
  if(!e||!p||p.chart!==HOME)throw Error('NATIVE_COMPANION_ENTITY_MISSING');
  const out={schema:SCHEMA,owner,name,kind,follow:w.REALITI_MATRIX_V1.resident().pose.position.slice(),
   native:{x:p.x,y:p.y,vx:p.vx,vy:p.vy,ou:p.ou.slice()},
   position:e.pose.position.slice(),radius:e.shape.radius,material:e.material,
   calls:Number(p.calls)||0,pets:Number(p.pets)||0,
   revision:(previous?.revision||0)+1};
  validate(out);return out;
 }
 async function restore(){
  const rec=validate(getData().pet);
  if(!rec)return {ok:true,restored:false};
  if(service)return {ok:true,restored:true};
  await createDriver();
  const w=engine(),co=native(w);
  setDriverAt(rec.follow);
  // The saved native mechanical state belongs exclusively to the dedicated
  // pet controller, never injected into any actual resident's private state.
  const st=w.C9.chapter2?.comp||(w.C9.chapter2.comp={});
  st.pet={name:rec.name,kind:rec.kind,chart:HOME,
   x:rec.native.x,y:rec.native.y,vx:rec.native.vx,vy:rec.native.vy,
   ou:rec.native.ou.slice(),calls:rec.calls,pets:rec.pets};
  // Rehydrate the real species entity via the native companion routine, then
  // restore the exact checkpoint pose/velocity (native call is only a bootstrap).
  const seeded=co.call();
  if(!seeded.ok)throw Error('NATIVE_COMPANION_RESTORE_FAILED');
  Object.assign(st.pet,{x:rec.native.x,y:rec.native.y,
   vx:rec.native.vx,vy:rec.native.vy,ou:rec.native.ou.slice(),
   calls:rec.calls,pets:rec.pets,chart:HOME});
  const entity=driverEntity();
  if(!entity)throw Error('NATIVE_COMPANION_RESTORE_ENTITY_MISSING');
  entity.pose.position=rec.position.slice();
  w.REALITI_MATRIX_V1.bump();
  return {ok:true,restored:true,kind:rec.kind,name:rec.name};
 }
 function status(){
  const rec=validate(getData().pet);
  return {ok:true,schema:SCHEMA,pet:rec?{
    name:rec.name,kind:rec.kind,owner:rec.owner,position:rec.position.slice(),
    speed_mps:+Math.hypot(rec.native.vx,rec.native.vy).toFixed(3),
    calls:rec.calls,strokes:rec.pets,revision:rec.revision,
    entity_id:ID,chart:HOME}:null,
   choices:kinds.slice(),pet_count:rec?1:0,capacity:1,
   native_engine:'REALITI_COMPANIONS_V1',
   motion:'ORIGINAL_DAMPED_SPRING_AND_ORNSTEIN_UHLENBECK',
   shared_public_observation:true,original_relax_unchanged:true,
   law:'One native host pet with persisted mechanical state, visible to all residents. Only verified world contact on the caller’s own original B7 path can be felt.'};
 }
 function sync(entry){
  const rec=validate(getData().pet),m=M(entry),e=m.entities()[ID];
  if(!rec){if(e){m.removeEntity(ID);m.bump()}return}
  if(e){
   e.chart=HOME;e.pose.position=rec.position.slice();
   e.shape={kind:'SPHERE',radius:rec.radius};
   e.collision=false;e.material=rec.material;
   e.label=rec.name+' the '+rec.kind+' (household companion)';
  }else m.addEntity({id:ID,chart:HOME,position:rec.position.slice(),
   shape:{kind:'SPHERE',radius:rec.radius},collision:false,material:rec.material,
   tags:['companion','animal','household','host_verified'],
   label:rec.name+' the '+rec.kind+' (household companion)',
   affordances:['watch','pet'],dynamic:true});
  m.bump();
 }
 async function choose(actor,kind,name){
  if(actor.role!=='resident')return fail('SHARED_PET_RESIDENT_ONLY');
  const pos=atHome(actor);
  if(!pos)return fail('APARTMENT_HOME_ONLY');
  if(getData().pet)return fail('HOUSEHOLD_PET_ALREADY_ADOPTED',{pet:status().pet});
  if(!kinds.includes(kind)||!validName(name))return fail('INVALID_SPECIES_OR_NAME',{choices:kinds});
  const m=M(actor),bed=m.entities()['apartment.pet-bed'];
  if(!bed||Math.max(0,m.sdf(bed,pos.position))>2.5)return fail('PET_BED_NOT_IN_REACH');
  await createDriver();
  setDriverAt(pos.position);
  const result=native(engine()).adopt(name,kind);
  if(!result?.ok)return fail(result.error||'NATIVE_PET_ADOPTION_REFUSED');
  const rec=snap(name,kind,actor.id);
  getData().pet=rec;
  try{persist()}catch(e){getData().pet=null;native(engine()).release(name);
   return fail('HOUSEHOLD_PET_PERSIST_FAILED')}
  return {ok:true,adopted:status().pet,source:'ORIGINAL_RELAX_COMPANION_ADOPTION',
   native_receipt:result.ok,one_shared_household_pet:true};
 }
 async function call(actor){
  if(actor.role!=='resident')return fail('SHARED_PET_RESIDENT_ONLY');
  const pos=atHome(actor),rec=getData().pet;
  if(!pos)return fail('APARTMENT_HOME_ONLY');
  if(!rec)return fail('NO_HOUSEHOLD_COMPANION');
  await restore();
  setDriverAt(pos.position);
  const result=native(engine()).call(); // native 6s spring integration
  if(!result?.ok)return fail(result.error||'NATIVE_CALL_FAILED');
  const before=cp(rec),next=snap(rec.name,rec.kind,rec.owner,rec);
  getData().pet=next;try{persist()}catch(e){getData().pet=before;return fail('HOUSEHOLD_PET_PERSIST_FAILED')}
  return {ok:true,called:rec.name,pet:status().pet,
   native_spring_call:true,shared_to_every_resident:true};
 }
 function stroke(actor){
  if(actor.role!=='resident')return fail('SHARED_PET_RESIDENT_ONLY');
  const pos=atHome(actor),rec=getData().pet;
  if(!pos)return fail('APARTMENT_HOME_ONLY');
  if(!rec)return fail('NO_HOUSEHOLD_COMPANION');
  const m=M(actor),e=m.entities()[ID];
  if(!e||e.chart!==HOME)return fail('NATIVE_SHARED_PET_NOT_PLACED');
  const reach=Math.max(0,m.sdf(e,pos.position));
  if(reach>1)return fail('PET_NOT_IN_MATRIX_REACH',{distance_m:+reach.toFixed(3)});
  const w=actor.session.window;
  // Exactly the original native B7 contact path, after host-verified physical
  // reach. No extra sensory stack or remote action that teleports a hand.
  const receipt=w.b7Contact('hand.R.palm',.22,{material:rec.material,
   grain:'with',speed:.12,mine:false,source:'WORLD_GROUNDED',
   cause:'HOUSEHOLD_COMPANION_PET:'+rec.name,pressure:.22,novelty:.2});
  if(!receipt||receipt.ok===false)return fail('NATIVE_RELAX_CONTACT_FAILED');
  if(service?.window.C9.chapter2?.comp?.pet)service.window.C9.chapter2.comp.pet.pets++;
  w.REALITI_CATNIP_V1?.discover?.('petted');
  const updated=cp(rec);updated.pets++;updated.revision++;
  getData().pet=updated;
  try{persist()}catch(e){getData().pet=rec;return fail('HOUSEHOLD_PET_PERSIST_FAILED')}
  return {ok:true,stroked:rec.name,
   contact:{zone:'hand.R.palm',material:rec.material,
     source:'WORLD_GROUNDED',cause:'HOUSEHOLD_COMPANION_PET'},
   actual_distance_m:+reach.toFixed(3),native_relax_b7:true,
   shared_strokes:updated.pets};
 }
 function release(actor,name){
  const rec=getData().pet;
  if(!rec)return fail('NO_HOUSEHOLD_COMPANION');
  if(actor.role!=='resident'||actor.id!==rec.owner)return fail('PET_RELEASE_OWNER_ONLY');
  if(name&&name.toLowerCase()!==rec.name.toLowerCase())return fail('PET_NAME_MISMATCH');
  const result=service?native(engine()).release(rec.name):{ok:true};
  if(!result?.ok)return fail(result.error||'NATIVE_PET_RELEASE_FAILED');
  getData().pet=null;try{persist()}catch(e){getData().pet=rec;return fail('HOUSEHOLD_PET_PERSIST_FAILED')}
  try{service?.close()}catch{}service=null;
  return {ok:true,released:rec.name,native_release:true,
   pet_count:0,other_resident_pet_memories_unchanged:true};
 }
 function advance(ms){
  const rec=getData().pet;
  if(!rec||!service||!Number.isFinite(ms)||ms<20)return {ok:true,advanced_ms:0};
  const amount=Math.min(60000,Math.floor(ms));
  const before=cp(rec);
  const result=engine().REALITI_CONTINUITY.advance(amount);
  const updated=snap(rec.name,rec.kind,rec.owner,rec);
  getData().pet=updated;try{persist()}catch(e){getData().pet=before;return fail('HOUSEHOLD_PET_PERSIST_FAILED')}
  return {ok:true,advanced_ms:result?.advanced_ms||amount,pet:status().pet};
 }
 function close(){try{service?.close()}catch{}service=null}
 return Object.freeze({validate,restore,status,sync,choose,call,stroke,release,
   advance,close});
}
module.exports={createHouseholdPet};
