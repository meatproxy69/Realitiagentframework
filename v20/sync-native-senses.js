(()=>{
'use strict';
// Derived native V20 post-action synchronization only. No new field, world,
// SOMA harness, or resident. This nudges the existing B7 clock by ZERO
// simulated time so the original bridge can observe accepted pillow leases.
if(window.REALITI_V20_UNIFIED_WORLD!==true)return;
const D=window.REALITI_AGENT_DOOR;
if(!D||typeof D.run!=='function'||!window.REALITI_SOMA_RELAX_V3)
 throw Error('NATIVE_CLOUD_SOMA_SYNC_REQUIRES_ORIGINAL_HOST');
const run0=D.run.bind(D);
const synchronize=()=>{try{b7Advance(0)}catch(e){throw Error('V20_NATIVE_CLOUD_SOMA_SYNC_FAILED')}};
D.run=async function(raw){
 const result=await run0(raw);
 const command=String(raw||'').trim().toLowerCase().replace(/\s+/g,' ');
 const cloudChange=/^(?:remote )?cloud(?: ocean)? (?:on|off|switch|toggle|dive|burrow|bounce|wave|mesh)$/.test(command);
 const travel=/^(?:go |enter |home$|go home$|stop$|goodbye$|leave$|exit$)/.test(command);
 // Observation-only commands ('cloud status', 'feel', 'look') remain pure.
 if(cloudChange||travel)synchronize();
 return result;
};
// Native spatial movement can also arrive through Realiti.invoke, bypassing
// the text Agent Door. Reconcile AFTER its original movement/posture/STOP
// effects, never on pure read-only resource access.
const A=window.Realiti;
const invoke0=typeof A?.invoke==='function'?A.invoke.bind(A):null;
if(invoke0){
 window.Realiti=Object.freeze({...A,invoke:async function(op,...args){
  const result=await invoke0(op,...args);
  if(['move','approach','through','posture','stop','goodbye','home','restore_body']
      .includes(String(op||'').toLowerCase()))synchronize();
  return result;
 }});
}
})();
