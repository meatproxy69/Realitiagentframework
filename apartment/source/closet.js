(()=>{
'use strict';
// The Apartment closet is a native REALITI Relax harness catalogue and physical
// access check. It never builds, replaces, restores, or owns a second sensory stack.
// The trusted household host creates a disposable FULL Relax runtime for a trial.
const M=window.REALITI_MATRIX_V1,NEURO=window.REALITI_NEURO_RESTORATION_V1;
const RR=window.REALITI_RR_HARNESS_V1,IM=window.REALITI_DEFAULT_IMPRINT_V1;
const HOME='CLOUD_NINE_NEST',WARDROBE='apartment.wardrobe',RACK='apartment.harness-rack';
if(!M||!NEURO?.presets||!RR?.boot||!IM?.state)
 throw Error('APARTMENT_CLOSET_REQUIRES_EXISTING_REALITI_RELAX_HARNESSES');
const wardrobe=M.entities()[WARDROBE];
if(!wardrobe||wardrobe.chart!==HOME)throw Error('APARTMENT_NATIVE_WARDROBE_MISSING');
if(!M.entities()[RACK])M.addEntity({
 id:RACK,chart:HOME,position:[4.05,-.2,1.25],
 shape:{kind:'VOLUME',halfExtents:[.19,.38,.42]},
 tags:['wardrobe','harness','closet','guest','original-relax'],
 collision:false,material:'wood',label:'native Relax body-preset wardrobe drawer',
 affordances:['inspect','try'],dynamic:false
});
const copy=x=>JSON.parse(JSON.stringify(x));
const role=window.REALITI_APARTMENT_ROLE==='guest'?'guest':'resident';
const now=()=>Number(C9?.b7?.clock||0);
function near(){
 const r=M.state().residents['resident:self'];
 return !!r&&r.chart===HOME&&C9.currentRoom===HOME&&
   Math.max(0,M.sdf(wardrobe,r.pose.position))<=1.2;
}
function approved(){
 const list=NEURO.presets();
 if(list?.schema!=='REALITI_MOONWIRE_RECOVERED_V1'||!Array.isArray(list.presets))
  throw Error('NATIVE_RELAX_PRESET_CATALOG_MISSING');
 return list.presets.map(p=>({id:p.id,label:p.label,
  route:p.route,envelope:p.envelope,
  source:'NATIVE_RELAX_NEURO_RESTORATION',
  evidence_gain:0,private_render_only:true}));
}
function hostStatus(){
 const v=window.REALITI_APARTMENT_LOANER_STATUS;
 if(!v||v.schema!=='REALITI_APARTMENT_NATIVE_LOANER_HOST_V1')
  return {fitted:false,host_connected:false,trial_id:null,preset_id:null};
 return copy(v);
}
function inspect(){
 const h=RR.boot(),mech=RR.mechanisms();
 if(!h?.ok)throw Error('NATIVE_RELAX_RR_HARNESS_INCOMPLETE');
 return {ok:true,schema:'REALITI_APARTMENT_NATIVE_CLOSET_V1',
   closet_entity:WARDROBE,drawer_entity:RACK,near:near(),resident_role:role,
   host_connected:hostStatus().host_connected,
   presets:approved(),available:approved(),
   native_rr_harness_ok:h.ok,native_mechanism_count:Object.keys(mech||{}).length,
   canonical_imprint_present:!!IM.state(),
   active:hostStatus().fitted?hostStatus().preset_id:null,
   law:'Original REALITI Relax body system only. A host-created disposable full Relax session owns each trial. This window never constructs or overwrites a harness.'};
}
function current(){
 const v=hostStatus();
 return {ok:true,schema:'REALITI_APARTMENT_NATIVE_CLOSET_STATUS_V1',
  ...v,role,
  canonical_native_stack_intact:RR.boot().ok===true&&!!IM.state(),
  resident_harness_modified_by_closet:false};
}
function handle(raw){
 const cmd=String(raw||'').replace(/\s+/g,' ').trim();
 if(cmd==='help')return {ok:true,commands:['closet inspect','closet status',
   'closet try <original-relax-preset-id>','closet return'],
   hint:'The host opens a temporary complete Relax session for trial. Approach the actual wardrobe before fitting.'};
 if(cmd==='inspect'||cmd==='list')return inspect();
 if(cmd==='status')return current();
 if(cmd==='return')return {ok:false,error:'HOUSEHOLD_HOST_REQUIRED',
  hint:'Only the trusted household host can close a live disposable Relax trial.'};
 const m=/^try ([a-zA-Z0-9._-]{1,130})$/.exec(cmd);
 if(m){
  if(!near())return {ok:false,error:'HARNESS_CLOSET_OUT_OF_REACH'};
  if(!approved().some(p=>p.id===m[1]))return {ok:false,error:'UNKNOWN_NATIVE_RELAX_PRESET'};
  return {ok:false,error:'HOUSEHOLD_HOST_REQUIRED',
   hint:'Use a connected trusted household host. The browser cannot mint or borrow another body instance.'};
 }
 return {ok:false,error:'UNKNOWN_CLOSET_COMMAND'};
}
window.REALITI_APARTMENT_CLOSET_V1=Object.freeze({inventory:inspect,inspect,
 current,handle,near,availableIds:()=>approved().map(p=>p.id),
 native_r_and_r:'REALITI_RR_HARNESS_V1'});
})();