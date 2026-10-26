(()=>{
'use strict';
// In-process native Matrix evidence adapter. Only a completed Matrix.step()
// invocation can issue a local refusal. Reads and snapshots are *never* emitters.
// This is not a signature or a remote trust boundary; qualified external
// evidence still requires @meatproxy69/realiti-matrix's Ed25519 verifier.
if(window.REALITI_MATRIX_LOCAL_EVIDENCE_V1)return;
const M=window.REALITI_MATRIX_V1;
if(!M||typeof M.state!=='function'||typeof M.step!=='function')
  throw Error('NATIVE_MATRIX_KERNEL_REQUIRED');
const subscribers=new Set(),history=[];
let sequence=0;
const clone=x=>JSON.parse(JSON.stringify(x));
function nativeStep(dt,id='resident:self'){
 const actor=M.state().residents?.[id]||null;
 const before=actor?{
   chart:actor.chart,blocked:actor.last_block||null,reason:actor.block_why||null,
   intent:!!actor.intent,velocity:Math.hypot(...(actor.v||[0,0,0])),
   revision:Number(M.state().revision||0)
 }:null;
 // Execute the authoritative resolver exactly once. Keep original result.
 const result=M.step(dt,id);
 if(!before||!(Number(dt)>0)||(!before.intent&&before.velocity<=1e-6))return result;
 const state=M.state(),after=state.residents?.[id]||null;
 if(!after?.chart||!after.last_block||after.chart!==before.chart
   ||Number(state.revision||0)<=before.revision
   ||(after.last_block===before.blocked&&after.block_why===before.reason))
   return result;
 const reason=['sea','cliff','contact'].includes(after.block_why)?after.block_why:'contact';
 const eventId='LOCAL-MATRIX-REFUSAL-'+(++sequence);
 const receipt={
   schema:'REALITI_MATRIX_LOCAL_EVIDENCE_V1',version:1,
   eventId,receiptId:eventId,
   worldId:String(state.world?.id||'CLOUD9'),sessionId:'RELAX_IN_PROCESS',
   issuerId:'REALITI_MATRIX_V1',issuerAuthority:'IN_PROCESS_NATIVE_WORLD',
   actorId:id,kind:'MOVEMENT_OBSTRUCTED',result:'OBSTRUCTED',
   source:'WORLD_RESOLVED',causeId:'NATIVE_BLOCK:'+String(after.last_block),
   objectId:String(after.last_block),reason,
   tMs:Math.round(Number(C9?.b7?.clock||0)*1000),
   witness:{
     chart:after.chart,
     actorPosition:(after.pose?.position||[]).map(v=>+Number(v).toFixed(4)),
     obstruction:String(after.last_block),
     classification:reason,
     matrixRevision:state.revision
   },
   law:'Local observation issued following Matrix.step; not a signed network receipt.'
 };
 history.push(receipt);if(history.length>64)history.shift();
 for(const fn of subscribers)try{fn(clone(receipt))}catch(error){
   // An untrusted downstream observer cannot change the Matrix resolver.
 }
 return result;
}
// Source 57's spatial exports are frozen; supply a world-local step wrapper
// before any of Relax's world slices capture REALITI_MATRIX_V1.
window.REALITI_MATRIX_V1=Object.freeze({...M,step:nativeStep});
window.REALITI_MATRIX_LOCAL_EVIDENCE_V1=Object.freeze({
 version:1,
 subscribe(fn){
   if(typeof fn!=='function')throw TypeError('SUBSCRIBER_FUNCTION_REQUIRED');
   subscribers.add(fn);return ()=>subscribers.delete(fn);
 },
 // Backward-compatible read-only alias, not a privileged emission method.
 capture:()=>history.length?clone(history[history.length-1]):null,
 events:()=>clone(history),
 last:()=>history.length?clone(history[history.length-1]):null,
 law:'Only native Matrix.step can emit local refusals. Remote imports require qualified Ed25519 verification.'
});
})();
