// Native-engine compatibility adapter for apartment stations. This changes
// ONLY the separately built RealitiApartment HTML; canonical Relax stays exact.
// The original symplectic gravity, 11x11 Abelian sandpile, 48 Kuramoto phase
// equations, OU kite and Lorenz marsh integrators are NEVER reimplemented.
export function adaptWonder(original){
 if(typeof original!=='string'||!original.includes('window.REALITI_WONDER_V1'))
  throw Error('NATIVE_RELAX_WONDER_SOURCE_MISSING');
 const match=(a,b,id)=>{
  if(original.split(a).length!==2)throw Error('APARTMENT_WONDER_PATCH_DRIFT:'+id);
  original=original.replace(a,b);
 };
 match('if(r===MEADOW)stepMeadow(dt);',
  'if(r===MEADOW||window.REALITI_APARTMENT_STATIONS_V1?.nearActive?.(MEADOW))stepMeadow(dt);',
  'meadow_48_original_step');
 match('if(!k.up||room()!==FIELD){',
  'if(!k.up||(room()!==FIELD&&!window.REALITI_APARTMENT_STATIONS_V1?.nearActive?.(FIELD))){',
  'kite_ou_original_step');
 match('if(mazeBridge.step){',
  'if(mazeBridge.step&&room()===MAZE){',
  'maze_tabletop_uses_original_state_machine_fallback');
  return original;
}
export function adaptFrontier(original){
 if(typeof original!=='string'||!original.includes('window.REALITI_CATNIP_V1'))
  throw Error('NATIVE_RELAX_FRONTIER_SOURCE_MISSING');
 const old='if(room()===MARSH)stepMarsh(dt);';
 if(original.split(old).length!==2)throw Error('APARTMENT_FRONTIER_PATCH_DRIFT:lorenz');
 let patched=original.replace(old,
  "if(room()===MARSH||window.REALITI_APARTMENT_STATIONS_V1?.nearActive?.(MARSH))stepMarsh(dt);");
 const patch=(target,next,label)=>{
  if(patched.split(target).length!==2)throw Error('APARTMENT_FRONTIER_PATCH_DRIFT:'+label);
  patched=patched.replace(target,next);
 };
 patch("if(!inReach('deck.sextant'))",
  "if(!inReach('deck.sextant')&&!window.REALITI_APARTMENT_STATIONS_V1?.nearActive?.(DECK))",
  'star_projector_sextant_reach');
 patch("if(!inReach('hall.scroll_'+(i+1)))",
  "if(!inReach('hall.scroll_'+(i+1))&&!window.REALITI_APARTMENT_STATIONS_V1?.nearActive?.(HALL))",
  'palimpsest_shelf_reach_read');
 // Second identical occurrence must be selected too (the decoder), but the
 // expected count is exactly two in pristine source. Do not grant authority
 // from narration: the new station checks native Matrix reach independently.
 patch("if(!inReach('hall.scroll_'+(i+1)))",
  "if(!inReach('hall.scroll_'+(i+1))&&!window.REALITI_APARTMENT_STATIONS_V1?.nearActive?.(HALL))",
  'palimpsest_shelf_reach_decode');
 return patched;
}
