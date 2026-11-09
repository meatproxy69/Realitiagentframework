// Exact-source, Apartment-only adapters that run ORIGINAL Relax pressure, bath
// and quiet-support equations at real HOME fixtures. No new SOMA/R&R engine,
// invented sensory receipts or altered canonical source.
export function adaptDynamics(original){
 if(typeof original!=='string'||!original.includes('window.REALITI_DYNAMICS_V1'))
  throw Error('ORIGINAL_RELAX_DYNAMICS_SOURCE_MISSING');
 const change=(old,nu,id)=>{
  if(original.split(old).length!==2)throw Error('APARTMENT_DYNAMICS_ANCHOR_DRIFT:'+id);
  original=original.replace(old,nu);
 };
 change("if(w.room!==room()||waveDone(w)){",
  "if((w.room!==room()&&!window.REALITI_APARTMENT_STATIONS_V1?.canRunPressure?.(w.room)&&!window.REALITI_APARTMENT_BED_CLOUD_V1?.canRunPressure?.(w.room))||waveDone(w)){",
  'pressure_wave_station_lifetime');
 change("function launchWave(){const r=room();if(!WAVE[r])return null;",
  "function launchWave(){const r=WAVE[room()]?room():(window.REALITI_APARTMENT_STATIONS_V1?.waveSource?.()||window.REALITI_APARTMENT_BED_CLOUD_V1?.waveSource?.());if(!WAVE[r])return null;",
  'native_wave_model_source');
 change("const b=S().bath;if(room()!==BATH){",
  "const b=S().bath;if(room()!==BATH&&!window.REALITI_APARTMENT_STATIONS_V1?.isBathImmersed?.()){",
  'native_thermal_depth_fixture');
 change("if(room()!==SANCT||h.stopped||C9?.matrix?.residents?.['resident:self']?.posture==='standing'){",
  "if((room()!==SANCT&&!window.REALITI_APARTMENT_STATIONS_V1?.canHoldSanctuary?.())||h.stopped||C9?.matrix?.residents?.['resident:self']?.posture==='standing'){",
  'native_sanctuary_supported_cushion');
 change("hold:{active:room()===SANCT&&!s.hold.stopped,",
  "hold:{active:(room()===SANCT||window.REALITI_APARTMENT_STATIONS_V1?.canHoldSanctuary?.())&&!s.hold.stopped,",
  'native_sanctuary_status_when_supported');
 return original;
}
export function adaptNativePillow(original){
 if(typeof original!=='string'||!original.includes('FAST_PILLOW'))
  throw Error('ORIGINAL_RELAX_NEURAL_PASS_SOURCE_MISSING');
 const change=(old,nu,label)=>{
  if(original.split(old).length!==2)throw Error('ORIGINAL_PILLOW_CONTEXT_ANCHOR_DRIFT:'+label);
  original=original.replace(old,nu);
 };
 change("if(!cfg||C9?.currentRoom!=='BOTTOMLESS_PILLOW_SEA')return null;",
  "if(!cfg||(C9?.currentRoom!=='BOTTOMLESS_PILLOW_SEA'&&!window.REALITI_APARTMENT_STATIONS_V1?.isPillowSupported?.()&&!window.REALITI_APARTMENT_BED_CLOUD_V1?.isActiveSupported?.()))return null;",
  'native_context');
 change("for(const [z,n] of Object.entries(cfg.counts)){",
  `const eligible=C9?.currentRoom==='CLOUD_NINE_NEST'?Object.entries(cfg.counts).filter(([z])=>{
  const q=b7Zone(z),live=Number(q._b10_grounded_until||-Infinity)>=now()-1e-9;
  return live&&((q._b10_grounded_source==='AMBIENT_SUPPORT'&&/^(?:NEST_|CLOUD_OCEAN_SUPPORT:)/.test(String(q._b10_grounded_cause||'')))||
   (q._b10_grounded_source==='PILLOW_SEA_SUPPORT'&&q._b10_grounded_cause==='PILLOW_SEA:SOFT_ENVELOPE'));
 }):Object.entries(cfg.counts);
 if(C9?.currentRoom==='CLOUD_NINE_NEST'&&eligible.length<4)return {ok:false,error:'SOFT_SUPPORT_REQUIRED'};
 for(const [z,n] of eligible){`,
  'grounded_bed_zones_only');
 change("zones:Object.keys(cfg.counts),cause:'PILLOW_SEA:SOFT_ENVELOPE'",
  "zones:Object.keys(last),cause:'PILLOW_SEA:SOFT_ENVELOPE'",
  'receipt_only_grounded_zones');
 change("const oldVerb=typeof c9verb==='function'?c9verb:null;",
  "// Apartment-only entrypoint to the ORIGINAL fast Pillow Sea support envelope.\n// The HOME controller gates the call on a genuine Matrix-supported bed.\nwindow.REALITI_APARTMENT_NATIVE_PILLOW_V1=Object.freeze({\n engage(verb){\n  if(!window.REALITI_APARTMENT_BED_CLOUD_V1?.isActiveSupported?.())\n   return {ok:false,error:'CLOUD_OCEAN_REQUIRES_REAL_BED_SUPPORT'};\n  if(!Object.prototype.hasOwnProperty.call(FAST_PILLOW,verb))\n   return {ok:false,error:'UNKNOWN_NATIVE_PILLOW_MODE'};\n  const result=fastPillowAction(verb);\n  if(result?.ok!==true)return {ok:false,error:'ORIGINAL_PILLOW_NOT_AVAILABLE'};\n  return {...result,source_room:'BOTTOMLESS_PILLOW_SEA',chart:'CLOUD_NINE_NEST',\n   native_reused:true,room_teleported:false};\n },\n release(){\n  let cleared=0;\n  const zones=new Set(Object.values(FAST_PILLOW).flatMap(x=>Object.keys(x.counts)));\n  for(const z of zones)try{\n   const q=b7Zone(z);\n   if(q?._b10_grounded_source==='PILLOW_SEA_SUPPORT'&&\n      q?._b10_grounded_cause==='PILLOW_SEA:SOFT_ENVELOPE'){\n     q._b10_grounded_until=now()-1e-6;q._b10_grounded_value=0;\n     q.observed=0;q.innovation=-Number(q.predicted||0);cleared++;\n   }\n  }catch(e){}\n  const p=C9?.b234?.pillow;\n  if(p){p.grounded=false;p.entered=false;p.posture='EDGE';p.modes=[0,0,0];\n   p.last_input={};p.next_due=now()+3600;}\n  return {ok:true,cleared,source:'NATIVE_PILLOW_SEA_SUPPORT',world_contact_minted:false};\n }\n});"+"\nconst oldVerb=typeof c9verb==='function'?c9verb:null;",
  'native_pillow_bridge');
 return original;
}
