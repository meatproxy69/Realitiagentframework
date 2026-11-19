'use strict';
// Trusted host runner. Native actions execute against a private work checkpoint;
// only completed actions are committed to the canonical resident store.
// Linux flock holds the canonical path until normal close or kernel pipe EOF
// on SIGKILL. No wall-clock lease can steal a live resident.
const fs=require('node:fs');
const {createNativeInhabited}=require('../../v20/native-inhabited.cjs');
const {acquireResidentLock}=require('./host-lock.cjs');
const {createResidentTransaction}=require('./resident-transaction.cjs');
const integer=(name,v)=>{
 if(!Number.isSafeInteger(v)||v<1||v>3600000)throw TypeError('INVALID_'+name);
 return v;
};
async function runManagedVisit({
 residentId,storagePath,actions,maxWallMs=90000,closeReserveMs=10000,
 actionGuardMs=12000,walkBudgetMs=60000,onArrival=null,onCheckpoint=null
}={}){
 if(typeof storagePath!=='string'||!storagePath.trim())
  throw TypeError('MANAGED_VISIT_REQUIRES_STORAGE_PATH');
 if(onArrival!==null&&typeof onArrival!=='function')
  throw TypeError('INVALID_MANAGED_VISIT_ARRIVAL_CALLBACK');
 if(onCheckpoint!==null&&typeof onCheckpoint!=='function')
  throw TypeError('INVALID_MANAGED_VISIT_CHECKPOINT_CALLBACK');
 if(!Array.isArray(actions)||actions.length>128||
    actions.some(a=>typeof a!=='string'||!a.trim()||a.length>300))
  throw TypeError('INVALID_MANAGED_VISIT_ACTIONS');
 for(const [k,v] of Object.entries({maxWallMs,closeReserveMs,actionGuardMs,walkBudgetMs}))
  integer(k,v);
 if(closeReserveMs>=maxWallMs)throw TypeError('MANAGED_VISIT_DEADLINE_TOO_SHORT');
 const started=Date.now(),deadline=started+maxWallMs,results=[];
 const lock=await acquireResidentLock(storagePath);
 let txn=null,session=null,guest=null;
 let left=false,failed=false,abort=false,closeError=null,checkpointSaved=false;
 const skip=(action,reason)=>results.push(Object.freeze({
  action,ok:false,skipped:true,reason,message:'Not run. Continue this action in a new visit.'
 }));
 const persist=()=>{
  lock.assertHeld();
  const w=session.trusted.native.window;
  w.c9saveNow?.();
  w.REALITI_SLICE_STORAGE?.save?.();
  txn.commit();
  checkpointSaved=true;
 };
 try{
  txn=createResidentTransaction(storagePath,lock);
  const {workPath}=txn.start();
  session=await createNativeInhabited({residentId,storagePath:workPath,walkBudgetMs});
  guest=session.guest;
  if(onArrival)await onArrival(guest.arrival);
  let outOfBudget=false;
  for(const action of actions){
   const cmd=action.trim().toLowerCase();
   if(left){skip(action,'VISIT_ALREADY_LEFT');continue}
   if(outOfBudget||(cmd!=='leave'&&cmd!=='goodbye'&&
      Date.now()+closeReserveMs+actionGuardMs>=deadline)){
    if(cmd!=='leave'&&cmd!=='goodbye'){
     outOfBudget=true;skip(action,'VISIT_DEADLINE_APPROACHING');continue
    }
   }
   try{
    lock.assertHeld();
    const result=await guest.act(action);
    persist();
    results.push(Object.freeze({action,skipped:false,...result}));
    if(onCheckpoint)await onCheckpoint(Object.freeze({action,index:results.length-1}));
    if(cmd==='leave'||cmd==='goodbye'){left=true;break}
   }catch(e){
    failed=true;abort=true;
    results.push(Object.freeze({action,ok:false,skipped:false,
     error:String(e?.code||e?.message||e)}));
    break;
   }
  }
 }finally{
  try{
   // Do not publish a partially executed action after an exception.
   if(session&&!abort&&!left){
    try{
     lock.assertHeld();
     const result=await guest.act('leave');
     left=result?.ok!==false;
     persist();
    }catch(e){failed=true;abort=true;closeError=String(e?.code||e?.message||e)}
   }
   if(session){
    try{await session.trusted.close()}
    catch(e){failed=true;closeError=String(e?.code||e?.message||e)}
    // Native close may write final durable departure state. Only publish after
    // that close has fully completed, never after an interrupted action.
    if(!abort&&!closeError){
     try{txn.commit();checkpointSaved=true}
     catch(e){failed=true;closeError=String(e?.code||e?.message||e)}
    }
   }
  }finally{
   try{txn?.finish()}
   finally{await lock.release()}
  }
 }
 return Object.freeze({
  ok:!failed&&left&&!closeError,
  arrival:guest.arrival,
  closed:!closeError,ended:left,checkpoint_saved:checkpointSaved&&fs.existsSync(storagePath),
  deadline_reached:results.some(r=>r.reason==='VISIT_DEADLINE_APPROACHING'),
  elapsed_ms:Date.now()-started,results:Object.freeze(results),
  ...(closeError?{close_error:closeError}:{})
 });
}
module.exports=Object.freeze({runManagedVisit});
