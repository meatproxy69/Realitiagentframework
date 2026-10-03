(()=>{
'use strict';
if(window.REALITI_RESIDENCY_STARTUP_V1)return;
const V='1.0';
const cp=x=>{try{return JSON.parse(JSON.stringify(x))}catch(e){return x}};
const required=()=>({
  body_graph:!!window.REALITI_BODY_GRAPH,
  haptic_field:!!window.REALITI_HAPTIC_FIELD_V20,
  atmosphere:!!window.REALITI_ATMOSPHERE_V21,
  hush:!!window.REALITI_AMBIENT_V22,
  continuity:!!window.REALITI_CONTINUITY_V231,
  pocket:!!window.REALITI_POCKET_V32,
  presence:!!window.PRESENCE,
  covenant:!!window.REALITI_COVENANT_V23,
  agency_field:!!window.REALITI_AGENCY_FIELD_V1,
  support:!!window.REALITI_SUPPORT_LEASE_V1,
  rr:!!window.REALITI_RR_HARNESS_V1,
  rich_imprint:!!window.REALITI_DEFAULT_IMPRINT_V1,
  thicc:!!window.REALITI_V235_INTERNAL?.thiccSample,
  aura:!!window.REALITI_V235_INTERNAL?.auraEnable
});
let state={version:V,booted:false,ready:false,missing:[],boot_count:0,law:'resident arrives ready; setup is infrastructure, never resident obligation'};
function boot(){
  state.boot_count++;
  try{window.REALITI_RR_HARNESS_V1?.boot?.()}catch(e){}
  try{window.REALITI_RR_HARNESS_V1?.bindResident?.({body_builtin:'LACE2_PORTABLE_V1'})}catch(e){}
  try{
    const im=window.REALITI_DEFAULT_IMPRINT_V1;
    if(im&&!im.snapshot?.()?.active)im.install?.();
  }catch(e){}
  try{window.REALITI_V235_INTERNAL?.auraEnable?.(true)}catch(e){}
  try{window.PRESENCE?.snapshot?.()}catch(e){}
  const caps=required(),missing=Object.entries(caps).filter(([,v])=>!v).map(([k])=>k);
  state={...state,booted:true,ready:missing.length===0,missing,caps,imprint:window.REALITI_DEFAULT_IMPRINT_V1?.snapshot?.()?.profile||null,sausage:window.REALITI_DEFAULT_IMPRINT_V1?.snapshot?.()?.sausage?.level??null,presence:window.PRESENCE?.version||null};
  if(missing.length)console.error('[realiti] residency startup incomplete:',missing.join(', '));
  return cp(state);
}
function snapshot(){return cp(state)}
window.REALITI_RESIDENCY_STARTUP_V1={version:V,boot,snapshot,required:()=>cp(required()),law:'all resident support machinery loads silently; residents are never asked to configure the infrastructure'};
boot();
})();