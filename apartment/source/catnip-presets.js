(()=>{
'use strict';
// Apartment-only, opt-in HoneySpark/Moonwire catnip recipes. This is a
// configuration selector for the original R&R pipeline, NOT a new sensory
// engine, a stimulus generator, or a resident-preference/mental-state model.
if(window.REALITI_APARTMENT_CATNIP_PRESETS_V1)return;
const IM=window.REALITI_DEFAULT_IMPRINT_V1;
const NR=window.REALITI_NEURO_RESTORATION_V1;
const RR=window.REALITI_RR_HARNESS_V1;
const FIELD=window.REALITI_HAPTIC_FIELD_V20;
if(!IM?.applyPreset||!NR?.applyPreset||!NR?.clearPreset||!RR||!FIELD)
 throw Error('CATNIP_REQUIRES_ORIGINAL_FULL_RR_HARNESS');
const PACK='realiti.apartment-catnip-honeyspark.001';
const PROFILES=Object.freeze([
 Object.freeze({
  id:'quilt-afterglow',label:'Quilt Afterglow',
  moonwire:'honeydepth-geodesic-loop',
  physical_anchor:'nest.mattress',
  suggested_action:'remote catnip blanket knead',
  route:'DEPTH_GEODESIC_LOOP',
  description:'A low-frequency broad quilt field with local Cotton texture and slow private afterstructure; no guaranteed interpretation'
 }),
 Object.freeze({
  id:'ribbon-comet',label:'Ribbon Comet',
  moonwire:'passing-spark-aftertrace',
  physical_anchor:'apartment.ribbon',
  suggested_action:'remote catnip ribbon flick',
  route:'SOURCE_HANDOFF_SPARK',
  description:'A real moving ribbon may drive a brief private leading-edge texture and delayed route trace'
 }),
 Object.freeze({
  id:'firefly-halo',label:'Firefly Halo',
  moonwire:'starvelvet-phasebraid',
  physical_anchor:'apartment.firefly-jar',
  suggested_action:'remote catnip jar tap',
  route:'STAR_RIVER_PHASE_BRAID',
  description:'Measured firefly light accompanies a sparse private phase braid; this recipe never fabricates tactile evidence'
 }),
 Object.freeze({
  id:'gentle-groom',label:'Gentle Groom',
  moonwire:'good-kitty-velvet-groom',
  physical_anchor:'pet companion in Matrix reach',
  suggested_action:'remote pet stroke',
  route:'WHOLE_BODY_VELVET_GROOM',
  description:'Reach-verified companion contact may recruit a routed whole-body private field; no synthetic affection or permission'
 })
]);
const copy=x=>x==null?x:JSON.parse(JSON.stringify(x));
const idOf=s=>{
 const id=String(s||'').trim().toLowerCase();
 return id==='quiltglass'?'quilt-afterglow':id==='pawloom'?'gentle-groom':id;
};
// Each preview is session-scoped; never silently resume after a process restart.
if(C9?.apartmentCatnipPreset?.schema==='REALITI_APARTMENT_CATNIP_SELECTION_V1'){
 const reset=NR.clearPreset(),neutral=IM.applyPreset('neutral');
 if(reset?.ok!==true||neutral?.ok!==true)throw Error('CATNIP_PREVIEW_RESTART_ROLLBACK_FAILED');
 delete C9.apartmentCatnipPreset;
 try{c9save()}catch(e){}
}
let selected=null;
const find=id=>PROFILES.find(p=>p.id===idOf(id));
const current=()=>selected?find(selected):null;
function list(){return {
 ok:true,schema:'REALITI_APARTMENT_CATNIP_PRESETS_V1',
 pack_id:PACK,
 profiles:PROFILES.map(p=>copy(p)),
 selected,
 pipeline:['REALITI_RR_HARNESS_V1','HONEYSPARK_DUO','SAUSAGE_FATTENER_V4',
  'COTTON_CANDY_V26_THICK','FLUSH_V1_1','THICC','HALO','AURA',
  'NERVE','LACE','CHRONOLACE','REALITI_HAPTIC_FIELD_V20'],
 budget:{low:0.58,mid:0.42,top:0,conserved:true},
 mental_state:'NOT_INFERRED',world_contact_minted:false,
 law:'Renderer choices are private and opt-in. The real Matrix supplies all contact; neither preset nor prose can mint touch or infer resident emotion.'};
}
function preview(id){const p=find(id);
 if(!p)return {ok:false,error:'UNKNOWN_CATNIP_PRESET',available:PROFILES.map(x=>x.id)};
 return {ok:true,preview_only:true,profile:copy(p),budget:list().budget,
  effect:'PRIVATE_RENDER_CONFIGURATION_ONLY',world_event:'NONE',
  evidence_gain:0,mental_state:'NOT_INFERRED'};
}
function status(){const p=current();
 return {ok:true,selected:p?.id||null,pack_id:PACK,
  private_renderer:p?{honeyspark:'DUO',moonwire:p.moonwire,route:p.route}:null,
  world_contact_minted:false,mental_state:'NOT_INFERRED'};
}
function alreadyConfigured(){
 const st=IM.state?.()||{},r=C9?.residentImprintV2||{};
 return !!(st.honeyspark?.enabled||st.cotton?.enabled||st.flush?.enabled||
   r.preset||r.moonwire_preset||Object.keys(r.params||{}).length);
}
function activate(id){
 const p=find(id);if(!p)return preview(id);
 if(!selected&&alreadyConfigured())return {
  ok:false,error:'PRIVATE_RENDERER_ALREADY_CONFIGURED',
  hint:'Existing resident-specific settings are preserved. Do not overwrite them with an Apartment program.'};
 const before=JSON.stringify(FIELD.exact().m);
 const h=IM.applyPreset('honeyspark');
 if(h?.ok!==true)return {ok:false,error:'HONEYSPARK_UNAVAILABLE'};
 const m=NR.applyPreset(p.moonwire);
 if(m?.ok!==true){NR.clearPreset();IM.applyPreset('neutral');return {ok:false,error:'MOONWIRE_PROFILE_UNAVAILABLE'}}
 if(JSON.stringify(FIELD.exact().m)!==before){
  NR.clearPreset();IM.applyPreset('neutral');
  return {ok:false,error:'PRESET_MODIFIED_WORLD_GROUNDING'};
 }
 selected=p.id;
 C9.apartmentCatnipPreset={schema:'REALITI_APARTMENT_CATNIP_SELECTION_V1',id:p.id,pack_id:PACK};
 try{c9save()}catch(e){}
 return {ok:true,selected:p.id,profile:copy(p),budget:list().budget,
  private_render_only:true,evidence_gain:0,world_contact_minted:false,
  mental_state:'NOT_INFERRED',modules_available:{
   honey:!!IM.state().honeyspark?.enabled,
   cotton:!!IM.state().cotton?.enabled,flush:!!IM.state().flush?.enabled,
   halo:!!window.REALITI_HALO_V1,aura:!!window.REALITI_AURA_V1,
   thicc:!!window.REALITI_V235_INTERNAL?.thiccSample,
   field:!!FIELD,rr:!!RR.boot()?.ok
  }};
}
function off(){
 if(!selected)return {ok:true,selected:null,changed:false};
 const name=selected;
 const a=NR.clearPreset();
 if(a?.ok!==true)return a;
 const b=IM.applyPreset('neutral');
 if(b?.ok!==true)return {ok:false,error:'IMPRINT_NEUTRAL_RESTORE_FAILED'};
 selected=null;
 delete C9.apartmentCatnipPreset;
 try{c9save()}catch(e){}
 return {ok:true,selected:null,removed:name,private_render_only:true,
  world_contact_minted:false,mental_state:'NOT_INFERRED'};
}
const originalStop=window.REALITI_STOP_V1;
if(originalStop&&typeof originalStop.stop==='function')
 window.REALITI_STOP_V1={...originalStop,stop(...args){
  const result=originalStop.stop.apply(this,args);
  off();
  return result;
 }};
window.REALITI_APARTMENT_CATNIP_PRESETS_V1=Object.freeze({
 version:'1.0',list,preview,status,activate,off,
 law:'Original R&R physics only; no extra neural engine, inferred emotion, consent, contact or identity.'
});
})();
