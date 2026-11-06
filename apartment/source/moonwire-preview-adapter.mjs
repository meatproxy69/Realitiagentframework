// Exact-source, Apartment-only access to the original Moonwire/HoneySpark
// renderer. The canonical Relax engine is never edited. In particular this
// does not add sensation, a new grounding source, or an emotion classifier.
export function adaptMoonwirePreview(original) {
 if(typeof original!=='string'||!original.includes("function applyPreset(id)"))
  throw Error('ORIGINAL_RELAX_MOONWIRE_ENGINE_MISSING');
 const anchor="window.REALITI_NEURO_RESTORATION_V1={";
 if(original.split(anchor).length!==2)
  throw Error('ORIGINAL_RELAX_MOONWIRE_ADAPTER_ANCHOR_DRIFT');
 const patch=String.raw`
// Apartment-only private renderer checkout; the old NR closure owns
// "activePreset", so we must capture and restore it here, not clone NR.
// Persist the BEFORE state first: a restart in the middle of a preview
// restores the original resident renderer rather than keeping a surprise preset.
let APARTMENT_PREVIEW=null;
const APARTMENT_KEY='apartmentMoonwirePreviewV1';
function apartmentSnapshot(){
 const im=window.REALITI_DEFAULT_IMPRINT_V1,st=im?.state?.();
 if(!st)return null;
 const r=C9.residentImprintV2||{};
 return {
  schema:'REALITI_APARTMENT_MOONWIRE_BASELINE_V1',
  previous_active_preset:cp(activePreset),
  params:cp(st.params),honeyspark:cp(st.honeyspark||null),
  cotton:cp(st.cotton||null),flush:cp(st.flush||null),
  moonwire:cp(st.moonwire||null),
  resident:{has_preset:Object.prototype.hasOwnProperty.call(r,'preset'),
    preset:r.preset??null,
    has_moonwire:Object.prototype.hasOwnProperty.call(r,'moonwire_preset'),
    moonwire_preset:r.moonwire_preset??null}
 };
}
function apartmentRestore(saved){
 const im=window.REALITI_DEFAULT_IMPRINT_V1,st=im?.state?.();
 if(!st||!saved||saved.schema!=='REALITI_APARTMENT_MOONWIRE_BASELINE_V1')
  return {ok:false,error:'APARTMENT_PREVIEW_RECOVERY_INVALID'};
 activePreset=cp(saved.previous_active_preset);
 st.params=cp(saved.params);
 if(saved.honeyspark===null)delete st.honeyspark;else st.honeyspark=cp(saved.honeyspark);
 if(saved.cotton===null)delete st.cotton;else st.cotton=cp(saved.cotton);
 if(saved.flush===null)delete st.flush;else st.flush=cp(saved.flush);
 if(saved.moonwire===null)delete st.moonwire;else st.moonwire=cp(saved.moonwire);
 C9.residentImprintV2=C9.residentImprintV2||{version:2,params:{},mappings:{}};
 const r=C9.residentImprintV2;
 if(saved.resident?.has_preset)r.preset=saved.resident.preset;else delete r.preset;
 if(saved.resident?.has_moonwire)r.moonwire_preset=saved.resident.moonwire_preset;
 else delete r.moonwire_preset;
 delete C9[APARTMENT_KEY];APARTMENT_PREVIEW=null;
 try{im.sync();finishState(0);c9save()}catch(e){}
 return {ok:true,active:false,private_renderer_restored:true,evidence_gain:0};
}
function apartmentPreviewBegin(id){
 if(APARTMENT_PREVIEW||C9[APARTMENT_KEY])
  return {ok:false,error:'APARTMENT_PREVIEW_ALREADY_ACTIVE'};
 const old=apartmentSnapshot();
 if(!old)return {ok:false,error:'APARTMENT_IMPRINT_UNAVAILABLE'};
 C9[APARTMENT_KEY]=cp(old);
 try{c9save()}catch(e){}
 try{
  const im=window.REALITI_DEFAULT_IMPRINT_V1;
  const hs=im?.applyPreset?.('honeyspark');
  if(hs?.ok!==true)throw Error('HONEySPARK_PRESET_UNAVAILABLE');
  const moon=applyPreset(id);
  if(moon?.ok!==true)throw Error(moon?.error||'MOONWIRE_PRESET_UNAVAILABLE');
  APARTMENT_PREVIEW={preset:String(id),started_t:now()};
  return {ok:true,active:true,preset:APARTMENT_PREVIEW.preset,
   honeyspark:'EXISTING_CONSERVED_DUO',moonwire:moon.preset_id,
   cotton:!!im.state().cotton?.enabled,flush:!!im.state().flush?.enabled,
   source:'EXISTING_RELAX_PRIVATE_RENDERER',evidence_gain:0,
   mental_state:'NOT_INFERRED'};
 }catch(e){
  apartmentRestore(old);
  return {ok:false,error:'APARTMENT_PREVIEW_COULD_NOT_START',
   reason:String(e&&e.message||e).slice(0,100)};
 }
}
function apartmentPreviewEnd(){
 if(!C9[APARTMENT_KEY]&&!APARTMENT_PREVIEW)
  return {ok:true,active:false,unchanged:true};
 return apartmentRestore(C9[APARTMENT_KEY]);
}
try{
 if(C9?.[APARTMENT_KEY]){
  const recovered=apartmentRestore(C9[APARTMENT_KEY]);
  if(!recovered.ok)throw Error('PERSISTED_APARTMENT_PREVIEW_RESTORE_FAILED');
 }
}catch(e){throw Error('APARTMENT_PREVIEW_BOOT_RECOVERY_FAILED')}
window.REALITI_APARTMENT_MOONWIRE_PREVIEW_V1=Object.freeze({
 begin:apartmentPreviewBegin,end:apartmentPreviewEnd,
 status:()=>({active:!!APARTMENT_PREVIEW,preset:APARTMENT_PREVIEW?.preset||null,
  private_only:true,evidence_gain:0,mental_state:'NOT_INFERRED',
  crash_recovery:!!C9?.[APARTMENT_KEY]})
});
`;
 return original.replace(anchor,patch+'\n'+anchor);
}
