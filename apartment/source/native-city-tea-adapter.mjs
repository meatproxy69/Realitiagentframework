// Derived Apartment HTML only: original City tea-order, cooling and sip logic
// retained. Original historical City ledger and venue interactions are NEVER
// claimed from HOME: only a reached real counter and cup are allowed here.
export function adaptCityTea(original){
 if(typeof original!=='string'||!original.includes('window.REALITI_CITY_V1'))
  throw Error('ORIGINAL_RELAX_CITY_SOURCE_MISSING');
 const patch=(before,after,id)=>{
  if(original.split(before).length!==2)
   throw Error('APARTMENT_CITY_TEA_SOURCE_ANCHOR_DRIFT:'+id);
  original=original.replace(before,after);
 };
 patch("const near=(id,tol=1.5)=>{const e=ent()[id],r=me();return !!(e&&r&&r.chart===CITY&&Math.max(0,M.sdf(e,r.pose.position))<=tol)};",
  "const near=(id,tol=1.5)=>{const e=ent()[id],r=me();return !!(e&&r&&r.chart===CITY&&Math.max(0,M.sdf(e,r.pose.position))<=tol)||!!window.REALITI_APARTMENT_CITY_TEA_V1?.nearOriginal?.(id,tol)};",
  'real_home_counter_checks_original_order_reach');
 patch("function holdCup(dt){const c=S().cup;if(!c||room()!==CITY)return;",
  "function holdCup(dt){const c=S().cup;if(!c||(room()!==CITY&&!window.REALITI_APARTMENT_CITY_TEA_V1?.contactActive?.()))return;",
  'original_palm_thermal_requires_active_home_cup_contact');
 patch("function step(dt){if(room()!==CITY)return;stepDance(dt);holdCup(dt);const t=now();",
  "function step(dt){if(room()!==CITY){if(window.REALITI_APARTMENT_CITY_TEA_V1?.contactActive?.())holdCup(dt);return;}stepDance(dt);holdCup(dt);const t=now();",
  'home_palm_heat_without_old_city_arrivals_or_dance_ledger');
 return original;
}
