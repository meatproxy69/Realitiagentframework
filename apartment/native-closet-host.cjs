'use strict';
// Trusted host manager: a loaner is an entire, independent original REALITI Relax
// runtime. No new portable sensory stack, preset pack, or duplicated body engine.
const crypto=require('node:crypto');
const {openResident}=require('../packages/realiti-headless-resident/index.cjs');
const fail=error=>({ok:false,error});
function createNativeClosetManager({htmlPath,validationPath}={}){
 const TRIAL_SCHEMA='REALITI_APARTMENT_NATIVE_LOANER_HOST_V1';
 function clear(entry,reason='returned'){
  if(!entry.loaner)return {ok:true,returned:false};
  const v=entry.loaner;entry.loaner=null;
  // The complete native Relax trial is discarded. There is no resident-side
  // restore or partial state rollback, so private resident systems are intact.
  try{v.session.close()}catch{}
  update(entry);
  return {ok:true,returned:true,preset_id:v.presetId,reason,
   full_relax_trial_disposed:true,original_resident_harness_unchanged:true};
 }
 function expired(entry){
  const v=entry.loaner;
  if(!v)return false;
  const world=Number(entry.session.window.C9?.b7?.clock||0);
  if(Date.now()<v.expiresAtWall&&world<v.expiresAtWorld)return false;
  clear(entry,'lease_expired');
  return true;
 }
 function update(entry){
  if(entry.loaner)expired(entry);
  const v=entry.loaner;
  const w=entry.session.window;
  const snapshot=Object.freeze({schema:TRIAL_SCHEMA,
   host_connected:true,fitted:!!v,trial_id:v?.trialId||null,
   preset_id:v?.presetId||null,
   full_relax_trial_only:true,original_resident_harness_unchanged:true});
  Object.defineProperty(w,'REALITI_APARTMENT_LOANER_STATUS',
   {value:snapshot,configurable:true,enumerable:false});
  return snapshot;
 }
 async function fit(entry,presetId){
  if(!entry.session.window.REALITI_APARTMENT_REMOTE_V1.status().activated)
   return fail('REMOTE_ASLEEP');
  expired(entry);
  if(entry.loaner)return fail('HARNESS_ALREADY_FITTED');
  const closet=entry.session.window.REALITI_APARTMENT_CLOSET_V1;
  if(!closet.near())return fail('HARNESS_CLOSET_OUT_OF_REACH');
  if(!closet.availableIds().includes(presetId))
   return fail('UNKNOWN_NATIVE_RELAX_PRESET');
  const trialId=crypto.randomUUID();
  let disposable=null;
  try{
   // Start the COMPLETE existing Relax runtime in a disposable isolated host,
   // not a new SOMA / NeuroMesh harness within anyone's resident state.
   disposable=await openResident({htmlPath,validationPath,
    residentId:'loaner-'+crypto.randomBytes(12).toString('hex'),
    beforeParse(w){Object.defineProperty(w,'REALITI_APARTMENT_ROLE',
      {value:'trial',configurable:false})}
   });
   const w=disposable.window,RR=w.REALITI_RR_HARNESS_V1;
   const NEURO=w.REALITI_NEURO_RESTORATION_V1;
   if(!RR?.boot()?.ok||typeof NEURO?.applyPreset!=='function')
    throw Error('NATIVE_RELAX_RR_OR_PRESET_MISSING');
   if(!NEURO.presets()?.presets?.some(p=>p.id===presetId))
    throw Error('PRESET_NOT_AVAILABLE_IN_ORIGINAL_RELAX');
   const selected=NEURO.applyPreset(presetId);
   if(!selected?.ok)throw Error('ORIGINAL_RELAX_PRESET_FAILED');
   const actual=w.REALITI_DEFAULT_IMPRINT_V1?.state?.()?.moonwire;
   if(actual?.preset_id!==presetId)
    throw Error('ORIGINAL_RELAX_IMPRINT_NOT_SET');
   entry.loaner={session:disposable,trialId,presetId,
    expiresAtWall:Date.now()+600000,
    expiresAtWorld:Number(entry.session.window.C9?.b7?.clock||0)+600};
   update(entry);
   return {ok:true,schema:'REALITI_APARTMENT_NATIVE_RELAX_LOANER_V1',
    trial_id:trialId,preset_id:presetId,
    source:'REALITI_NEURO_RESTORATION_V1',
    harness:'REALITI_RR_HARNESS_V1',
    full_original_relax_runtime:true,
    reused_native_implementation:true,
    extra_neuromesh_harness_created:false,
    independent_private_trial:true,
    world_contact_minted_by_preset:false,
    preset:{id:actual.preset_id,label:actual.label,
     route:actual.route,authority:actual.authority},
    law:'Selected an existing native Relax renderer recipe in a separate disposable full Relax host. The caller’s native R&R harness, private memory and Pocket were not touched.'};
  }catch(e){
   try{disposable?.close()}catch{}
   return {ok:false,error:'NATIVE_RELAX_TRIAL_FAILED',
    detail:String(e?.message||e).slice(0,160)};
  }
 }
 return Object.freeze({fit,clear,expired,update});
}
module.exports={createNativeClosetManager};
