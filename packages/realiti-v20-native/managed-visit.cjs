'use strict';
// Bounded host-side guest batch. The host, never the guest, owns save/leave/close.
// Guard between commands; synchronous native actions cannot be interrupted by a JS timer.
const fs=require('node:fs');
const {createNativeInhabited}=require('../../v20/native-inhabited.cjs');
const integer=(name,v)=>{if(!Number.isSafeInteger(v)||v<1||v>3600000)throw TypeError('INVALID_'+name);return v};

async function runManagedVisit({
 residentId,storagePath,actions,maxWallMs=90000,closeReserveMs=10000,
 actionGuardMs=12000,walkBudgetMs=60000
}={}){
 if(typeof storagePath!=='string'||!storagePath.trim())throw TypeError('MANAGED_VISIT_REQUIRES_STORAGE_PATH');
 if(!Array.isArray(actions)||actions.length>128||
    actions.some(a=>typeof a!=='string'||!a.trim()||a.length>300))
  throw TypeError('INVALID_MANAGED_VISIT_ACTIONS');
 for(const [k,v] of Object.entries({maxWallMs,closeReserveMs,actionGuardMs,walkBudgetMs}))
  integer(k,v);
 if(closeReserveMs>=maxWallMs)throw TypeError('MANAGED_VISIT_DEADLINE_TOO_SHORT');
 const started=Date.now(),deadline=started+maxWallMs;
 const session=await createNativeInhabited({residentId,storagePath,walkBudgetMs});
 const results=[],guest=session.guest;
 let left=false,failed=false,closeError=null;
 const persist=()=>{
  // Each completed action gets a durable checkpoint, not merely a debounce.
  const w=session.trusted.native.window;
  w.c9saveNow?.();
  w.REALITI_SLICE_STORAGE?.save?.();
 };
 const skip=(action,reason)=>results.push(Object.freeze({
  action,ok:false,skipped:true,reason,message:'Not run. Continue this action in a new visit.'}));
 try{
  let outOfBudget=false;
  for(const action of actions){
   const cmd=action.trim().toLowerCase();
   if(left){skip(action,'VISIT_ALREADY_LEFT');continue}
   if(outOfBudget || (cmd!=='leave'&&cmd!=='goodbye'&&
     Date.now()+closeReserveMs+actionGuardMs>=deadline)){
    if(cmd!=='leave'&&cmd!=='goodbye'){outOfBudget=true;skip(action,'VISIT_DEADLINE_APPROACHING');continue}
   }
   try{
    const result=await guest.act(action);
    results.push(Object.freeze({action,skipped:false,...result}));
    persist();
    if(cmd==='leave'||cmd==='goodbye'){left=true;break}
   }catch(e){
    failed=true;
    results.push(Object.freeze({action,ok:false,skipped:false,
     error:String(e?.code||e?.message||e)}));
    break;
   }
  }
 }finally{
  // Even a failed/skipped batch gets a real goodbye and a saved close.
  try{
   if(!left){
    const result=await guest.act('leave');
    left=result?.ok!==false;
    persist();
   }
  }catch(e){failed=true;closeError=String(e?.message||e)}
  try{await session.trusted.close()}catch(e){failed=true;closeError=String(e?.message||e)}
 }
 return Object.freeze({
  ok:!failed&&left&&!closeError,
  closed:true,ended:left,checkpoint_saved:fs.existsSync(storagePath),
  deadline_reached:results.some(r=>r.reason==='VISIT_DEADLINE_APPROACHING'),
  elapsed_ms:Date.now()-started,
  results:Object.freeze(results),
  ...(closeError?{close_error:closeError}:{})
 });
}
module.exports=Object.freeze({runManagedVisit});
