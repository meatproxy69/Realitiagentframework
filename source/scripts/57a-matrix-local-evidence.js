(()=>{
'use strict';
// In-process REALITI Matrix authority adapter for native Relax movement.
// The world, not the body, resolves and emits a scoped obstruction receipt.
// This local channel is NOT an Ed25519 cross-neighborhood signature. Remote
// world events must use @meatproxy69/realiti-matrix/evidence verifier instead.
if(window.REALITI_MATRIX_LOCAL_EVIDENCE_V1)return;
const M=window.REALITI_MATRIX_V1;
if(!M||typeof M.state!=='function'||typeof b7Advance!=='function')return;
const subscribers=new Set(),history=[],seen=new Map();
let sequence=0;
const clone=x=>JSON.parse(JSON.stringify(x));
function observe(){
 const state=M.state(),worldId=state.world?.id||'CLOUD9';
 for(const actor of Object.values(state.residents||{})){
  if(!actor?.id||!actor.chart)continue;
  const key=actor.last_block?
    String(actor.last_block)+'|'+String(actor.block_why||'contact')+'|'+String(actor.chart):null;
  const prev=seen.get(actor.id)||null;
  if(prev===key)continue;
  seen.set(actor.id,key);
  if(!key)continue;
  const reason=['sea','cliff','contact'].includes(actor.block_why)?
    actor.block_why:'contact';
  const eventId='LOCAL-MATRIX-REFUSAL-'+(++sequence);
  const e=Object.freeze({
    schema:'REALITI_MATRIX_LOCAL_EVIDENCE_V1',version:1,
    eventId,receiptId:eventId,worldId,sessionId:'RELAX_IN_PROCESS',
    issuerId:'REALITI_MATRIX_V1',issuerAuthority:'IN_PROCESS_NATIVE_WORLD',
    actorId:actor.id,kind:'MOVEMENT_OBSTRUCTED',result:'OBSTRUCTED',
    source:'WORLD_RESOLVED',causeId:'NATIVE_BLOCK:'+String(actor.last_block),
    objectId:actor.last_block,reason,
    tMs:Math.round(Number(C9?.b7?.clock||0)*1000),
    witness:{
      chart:actor.chart,
      actorPosition:(actor.pose?.position||[]).map(v=>+Number(v).toFixed(4)),
      obstruction:String(actor.last_block),
      classification:reason,
      matrixRevision:state.revision
    },
    law:'Native Matrix resolved this obstruction. This is a local observation, not a signed network receipt.'
  });
  history.push(e);if(history.length>64)history.shift();
  for(const cb of subscribers)try{cb(clone(e))}catch(error){
    // Observers must never mutate the controller's result or stop motion.
  }
 }
}
const oldAdvance=b7Advance;
b7Advance=function(dt){const r=oldAdvance(dt);try{observe()}catch(error){}return r};
window.REALITI_MATRIX_LOCAL_EVIDENCE_V1=Object.freeze({
  version:1,
  subscribe(fn){
    if(typeof fn!=='function')throw TypeError('SUBSCRIBER_FUNCTION_REQUIRED');
    subscribers.add(fn);return ()=>subscribers.delete(fn);
  },
  capture:()=>{observe();return history.length?clone(history[history.length-1]):null},
  events:()=>clone(history),last:()=>history.length?clone(history[history.length-1]):null,
  law:'Local native world-issued observation. Cross-neighborhood evidence requires qualified signed issuer verification.'
});
})();
