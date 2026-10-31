'use strict';
// Trusted household furniture authority. The original Matrix, collision tests,
// entrances, and per-resident preferences stay intact. Only 2D fixture positions
// are committed to the public house; private styles/materials never leak.
const SCHEMA='REALITI_APARTMENT_SHARED_SCENE_V1';
const HOME='CLOUD_NINE_NEST';
const clone=x=>JSON.parse(JSON.stringify(x));
const fail=(error,details={})=>({ok:false,error,...details});
const coords=p=>Array.isArray(p)&&p.length===2&&p.every(n=>typeof n==='number'&&
 Number.isFinite(n)&&Math.abs(n)<=100);
function createSharedScene({getData,persist,participants,atHome}={}){
 if([getData,persist,participants,atHome].some(x=>typeof x!=='function'))
  throw TypeError('INVALID_SCENE_MANAGER_DEPENDENCIES');
 const spatial=entry=>entry.session.window.REALITI_APARTMENT_FURNITURE_V1;
 function validatePersisted(scene,known){
  if(scene==null)return null;
  if(scene.schema!==SCHEMA||!Number.isSafeInteger(scene.revision)||scene.revision<0||
     !scene.positions||typeof scene.positions!=='object'||Array.isArray(scene.positions)||
     !Array.isArray(known)||new Set(known).size!==known.length||
     Object.keys(scene.positions).length!==known.length)
   throw Error('SHARED_SCENE_INVALID_CHECKPOINT');
  for(const name of Object.keys(scene.positions)){
   if(!known.includes(name)||!coords(scene.positions[name]))
    throw Error('SHARED_SCENE_INVALID_COORDINATES');
  }
  return scene;
 }
 function ensure(entry){
  const f=spatial(entry);
  if(!f?.defaultsShared||!f?.applyShared||!f?.previewShared)
   throw Error('APARTMENT_SHARED_FURNITURE_BRIDGE_MISSING');
  const canonical=Object.fromEntries(Object.entries(f.defaultsShared())
   .map(([name,position])=>[name,position.slice(0,2)]));
  const known=Object.keys(canonical);
  const data=getData();
  if(!data.scene){
   data.scene={schema:SCHEMA,revision:0,positions:canonical};
   try{persist()}catch(e){data.scene=null;throw e}
  }
  validatePersisted(data.scene,known);
  return data.scene;
 }
 function apply(entry){
  const scene=ensure(entry),f=spatial(entry);
  for(const [name,xy] of Object.entries(scene.positions)){
   const e=entry.session.window.REALITI_MATRIX_V1.entities()[f.view()?.fixtures?.[name]?.id];
   if(!e)throw Error('APARTMENT_SHARED_ENTITY_MISSING:'+name);
   const here=e.pose.position;
   if(here[0]!==xy[0]||here[1]!==xy[1]||
      !e.tags.includes('household-host-shared')){
    const result=f.applyShared(name,xy.slice());
    if(!result?.ok)throw Error('SHARED_SCENE_APPLY_REFUSED:'+name);
   }
  }
  return {ok:true,revision:scene.revision};
 }
 function view(){
  const scene=getData().scene;
  return {ok:true,schema:SCHEMA,connected:!!scene,
   revision:scene?.revision||0,positions:clone(scene?.positions||{}),
   valid_objects:scene?Object.keys(scene.positions):[],
   shared_authority:!!scene,owner:'TRUSTED_HOUSEHOLD_HOST',
   privacy:'Only public positions are synchronized. Resident color, texture, styles and private memory remain independent.',
   law:'A persisted layout is world geometry, not embodied contact. Moves require host-verified Matrix clearance from every online participant.'};
 }
 function move(actor,name,x,y,expectedRevision){
  const members=participants();
  if(!members.includes(actor)||actor.role!=='resident')return fail('SHARED_SCENE_RESIDENT_ONLY');
  if(!atHome(actor))return fail('SHARED_SCENE_HOME_ONLY');
  const scene=ensure(actor);
  if(expectedRevision!=null&&expectedRevision!==scene.revision)
   return fail('SHARED_SCENE_REVISION_CONFLICT',{current_revision:scene.revision});
  if(!Object.prototype.hasOwnProperty.call(scene.positions,name))
   return fail('SHARED_SCENE_UNKNOWN_FIXTURE');
  if(!Number.isFinite(x)||!Number.isFinite(y))return fail('INVALID_COORDINATES');
  const proposed=[+x.toFixed(2),+y.toFixed(2)];
  if(!coords(proposed))return fail('INVALID_COORDINATES');
  if(scene.positions[name][0]===proposed[0]&&scene.positions[name][1]===proposed[1])
   return {ok:true,unchanged:true,name,position:proposed,revision:scene.revision};
  // Synchronize everyone to the last accepted public geometry before testing a
  // new location; stale private layout cannot be silently promoted to authority.
  for(const entry of members)apply(entry);
  const errors=[];
  for(const entry of members){
   const outcome=spatial(entry).previewShared(name,...proposed);
   if(!outcome?.ok)errors.push({participant:entry.id,
    error:outcome?.error||'UNKNOWN_MATRIX_REFUSAL',obstacle:outcome?.obstacle||null});
  }
  if(errors.length)return fail('SHARED_SCENE_MATRIX_REFUSED',{refusals:errors,
   current_revision:scene.revision});
  const before=clone(scene);
  scene.positions[name]=proposed;scene.revision++;
  try{persist()}catch(e){
   getData().scene=before;
   return fail('SHARED_SCENE_PERSIST_FAILED');
  }
  // All commits are validated against all active native Matrix copies before
  // writing the shared checkpoint. Reassert the exact persisted coordinates.
  for(const entry of members)apply(entry);
  return {ok:true,schema:'REALITI_APARTMENT_SHARED_MOVE_V1',
   changed:name,position:proposed,revision:scene.revision,
   by:actor.id,verified_participants:members.length,
   source:'TRUSTED_HOST_ALL_MATRIX_INSTANCES',
   original_relax_stack_unchanged:true};
 }
 return Object.freeze({ensure,apply,view,move,validatePersisted});
}
module.exports={createSharedScene};
