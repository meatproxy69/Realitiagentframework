// Derived Apartment artifact ONLY. The original Archipelago analytic terrain,
// current, wind and actual boat integrator remain the source of numerical truth.
// A reached HOME sea table can run that exact integrator without teleporting
// the resident into an unregistered island or building another sensory stack.
export function adaptArchipelago(original){
 if(typeof original!=='string'||!original.includes("window.REALITI_ARCHIPELAGO_V1"))
  throw Error('ORIGINAL_RELAX_ARCHIPELAGO_SOURCE_MISSING');
 const patch=(before,after,id)=>{
  if(original.split(before).length!==2)
   throw Error('APARTMENT_ARCHIPELAGO_ANCHOR_DRIFT:'+id);
  original=original.replace(before,after);
 };
 patch("function stepBoat(dt){const b=boat(),r=me();if(!r||r.chart!==ISLE)return;const E=M.entities()['harbor.boat'];",
  "function stepBoat(dt){const b=boat(),r=me();if(!r||(r.chart!==ISLE&&!window.REALITI_APARTMENT_SEA_TABLE_V1?.connected?.()))return;const E=M.entities()['harbor.boat'];",
  'original_boat_integrator_reuses_home_station');
 patch("if(b.aboard){r.pose.position=[b.x,b.y,SEA+.9];r.v=[0,0,0];r.intent=null}",
  "if(b.aboard&&r.chart===ISLE){r.pose.position=[b.x,b.y,SEA+.9];r.v=[0,0,0];r.intent=null}",
  'tabletop_control_never_moves_real_body_out_of_home');
 patch("function step(dt){if(room()!==ISLE)return;stepBoat(dt);exposure(dt);markSeen()}",
  "function step(dt){if(room()!==ISLE){if(window.REALITI_APARTMENT_SEA_TABLE_V1?.connected?.()){stepBoat(dt);window.REALITI_APARTMENT_SEA_TABLE_V1?.sync?.()}return;}stepBoat(dt);exposure(dt);markSeen()}",
  'sea_table_original_timestep_and_public_position');
 return original;
}
