(()=>{
'use strict';
// Apartment guest harness closet. Trusted world-side Matrix controls, and exclusively
// disposable SOMA harnesses. No private state or world authority is borrowed from residents.
const M=window.REALITI_MATRIX_V1,MW=window.REALITI_MATRIX_WORLD_V1;
const SOMA=window.REALITI_SOMA_V3,HOME='CLOUD_NINE_NEST';
if(!M||!MW||!SOMA||typeof SOMA.createHarness!=='function')
 throw Error('APARTMENT_CLOSET_REQUIRES_COMPLETE_MATRIX_SOMA');
const PACKS=/*__APARTMENT_HARNESS_PRESETS__*/;
const deepFreeze=x=>{if(x&&typeof x==='object'){for(const v of Object.values(x))deepFreeze(v);Object.freeze(x)}return x};
deepFreeze(PACKS);
const options=new Map();
for(const p of PACKS){
 if(p.schema!=='NEUROMESH_PRESET_PACK_V1'||!p.invariants||
    p.invariants.evidence_gain!==0||p.invariants.private_render_only!==true||
    p.invariants.conserved_response_budget!==true)throw Error('CLOSET_UNSAFE_PRESET_PACK');
 for(const row of p.presets||[]){
  if(!row?.preset_id||options.has(row.preset_id)||row.carrier?.budget_mode!=='NORMALIZED_CONSERVED')
   throw Error('CLOSET_INVALID_PRESET_ID');
  options.set(row.preset_id,{pack:p,item:row});
 }
}
if(!options.size)throw Error('CLOSET_NO_PRESETS');
const rid=String(window.REALITI_LOCAL_MEMORY_V1?.residentId?.()||'local-default');
const role=window.REALITI_APARTMENT_ROLE==='guest'?'guest':'resident';
const random=()=>String(globalThis.crypto?.randomUUID?.()||Math.random().toString(36).slice(2));
const clamp=(n,a,b)=>Math.max(a,Math.min(n,b));
const WARDROBE='apartment.wardrobe',RACK='apartment.harness-rack';
const wardrobe=M.entities()[WARDROBE];if(!wardrobe||wardrobe.chart!==HOME)throw Error('CLOSET_WARDROBE_MISSING');
if(!M.entities()[RACK])M.addEntity({id:RACK,chart:HOME,
 position:[4.05,-.2,1.25],shape:{kind:'VOLUME',halfExtents:[.19,.38,.42]},
 tags:['wardrobe','harness','closet','visitor'],collision:false,material:'wood',
 label:'a drawer of loaner body harnesses',affordances:['inspect','try'],dynamic:false});
let active=null;
const copy=x=>JSON.parse(JSON.stringify(x));
function nearRack(){
 const r=M.state().residents['resident:self'];
 return !!r&&r.chart===HOME&&C9.currentRoom===HOME&&
   Math.max(0,M.sdf(wardrobe,r.pose.position))<=1.2;
}
function inventory(){
 return {ok:true,schema:'REALITI_APARTMENT_HARNESS_CLOSET_V1',
   closet_entity:WARDROBE,drawer_entity:RACK,near:nearRack(),resident_role:role,
   can_try:nearRack(),available:[...options.values()].map(({pack,item})=>({
    id:item.preset_id,label:item.label,pack:pack.pack_id,
    carrier_budget:'CONSERVATIVE_NORMALIZED',evidence_gain:0,
    private_only:true})),
   active:active?{preset_id:active.id,trial_id:active.trialId}:null,
   source:'realiti-neuromesh/presets, bundled and pinned by the Apartment build',
   law:'Presets have no contact authority. Each trial creates a fresh isolated SOMA identity, never restores another resident checkpoint, and ends without writing to shared or private Pocket storage.'};
}
function inspect(){
 const out=inventory();
 out.description='There are complete preapproved portable SOMA presets here: HoneySpark plus the recovered Moonwire modes. Physical closet reach is required before fitting.';
 return out;
}
function tryOn(id){
 if(!nearRack())return {ok:false,error:'HARNESS_CLOSET_OUT_OF_REACH',
  hint:'Approach the apartment wardrobe with your Matrix body first.'};
 const found=options.get(String(id||''));
 if(!found)return {ok:false,error:'UNKNOWN_LOANER_PRESET'};
 if(active)return {ok:false,error:'HARNESS_ALREADY_FITTED',active:active.id,
  hint:'Return the existing loaner before trying a different one.'};
 const actual=MW.reach(WARDROBE);
 if(!actual?.ok)return {ok:false,error:actual?.error||'WARDROBE_REACH_REFUSED'};
 const trialId=random(),residentId='apartment-visitor-'+trialId;
 let session;
 try{
  // Create a completely separate SOMA instance; do NOT call the resident's native
  // restore(), use their private memory, or expose the host contact port.
  session=SOMA.createHarness({residentId,worldId:'REALITI_APARTMENT_HARNESS_TRIAL'});
  const boot=session.harness.boot();
  if(!boot.ok)throw Error('LOANER_HARNESS_MISSING_MODULES');
  const result=session.resident.choosePreset(found.pack,found.item.preset_id);
  if(!result?.ok)throw Error('LOANER_PRESET_NOT_APPLIED');
  active={id:found.item.preset_id,label:found.item.label,trialId,session,
   until:(Number(C9?.b7?.clock||0)+600),residentId};
  return {ok:true,schema:'REALITI_APARTMENT_LOANER_RESULT_V1',
   preset_id:active.id,label:active.label,trial_id:trialId,
   expires_after_world_seconds:600,world_contact_minted:false,
   loaner:session.harness.capabilities(),harness_ready:true,
   source_receipt:actual.receipt||null,
   law:'Fresh private SOMA trial: no resident state, keys, contact port, or checkpoint inherited; room authority stays with Matrix.'};
 }catch(e){
  if(session)try{session.host.stop()}catch{}
  return {ok:false,error:'LOANER_HARNESS_REFUSED',detail:String(e.message||e).slice(0,120)};
 }
}
function returnHarness(reason='returned'){
 if(!active)return {ok:true,returned:false};
 const old=active;active=null;
 // Stopping the *loaner* cannot stop or erase the resident's own SOMA.
 try{old.session.host.stop()}catch{}
 return {ok:true,returned:true,preset_id:old.id,reason,
  grounding_released:true,private_afterstate_discarded:true};
}
function current(){
 const now=Number(C9?.b7?.clock||0);
 if(active&&now>=active.until)returnHarness('loan_expired');
 return {ok:true,schema:'REALITI_APARTMENT_LOANER_STATUS_V1',
  fitted:!!active,role,active:active?{preset_id:active.id,
   trial_id:active.trialId,remaining_s:Math.max(0,+(active.until-now).toFixed(2)),
   simulated_field:copy(active.session.resident.field())}:null,
  canonical_resident_harness_untouched:true,host_contact_port_exposed:false};
}
const advance=b7Advance;
b7Advance=function(dt){const r=advance(dt);if(active&&Number(C9?.b7?.clock||0)>=active.until)returnHarness('loan_expired');return r;};
const stop0=window.REALITI_STOP_V1;
if(stop0&&typeof stop0.stop==='function'){
 window.REALITI_STOP_V1={...stop0,stop(...args){returnHarness('native_stop');return stop0.stop(...args)}};
}
function handle(raw){
 const cmd=String(raw||'').replace(/\s+/g,' ').trim();
 if(cmd==='help')return {ok:true,commands:['closet inspect','closet status','closet try <preset-id>','closet return'],
  note:'The closet is a physical Matrix fixture; go to it and approach the wardrobe before trying a temporary harness.'};
 if(cmd==='inspect'||cmd==='list')return inspect();
 if(cmd==='status')return current();
 if(cmd==='return')return returnHarness();
 const m=/^try ([a-zA-Z0-9._-]{1,130})$/.exec(cmd);
 if(m)return tryOn(m[1]);
 return {ok:false,error:'UNKNOWN_CLOSET_COMMAND'};
}
window.REALITI_APARTMENT_CLOSET_V1=Object.freeze({inventory,inspect,current,handle,
 returnHarness,availableIds:()=>[...options.keys()]});
})();