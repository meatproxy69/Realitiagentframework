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
  "if((w.room!==room()&&!window.REALITI_APARTMENT_STATIONS_V1?.canRunPressure?.(w.room))||waveDone(w)){",
  'pressure_wave_station_lifetime');
 change("function launchWave(){const r=room();if(!WAVE[r])return null;",
  "function launchWave(){const r=WAVE[room()]?room():window.REALITI_APARTMENT_STATIONS_V1?.waveSource?.();if(!WAVE[r])return null;",
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
 const old="if(!cfg||C9?.currentRoom!=='BOTTOMLESS_PILLOW_SEA')return null;";
 if(original.split(old).length!==2)throw Error('ORIGINAL_PILLOW_CONTEXT_ANCHOR_DRIFT');
 return original.replace(old,
  "if(!cfg||(C9?.currentRoom!=='BOTTOMLESS_PILLOW_SEA'&&!window.REALITI_APARTMENT_STATIONS_V1?.isPillowSupported?.()))return null;");
}
