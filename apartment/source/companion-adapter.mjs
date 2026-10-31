// Apartment-only adaptation of the existing Relax companion implementation.
// The upstream file is never changed. The build fails if source anchors drift.
export function adaptCompanions(original) {
  if (typeof original!=='string' || !original.includes('window.REALITI_COMPANIONS_V1'))
    throw Error('APARTMENT_COMPANION_SOURCE_MISSING');
  let result=original;
  function patch(oldText,newText,label) {
    const pieces=result.split(oldText);
    if (pieces.length!==2) throw Error('APARTMENT_COMPANION_PATCH_DRIFT: '+label);
    result=pieces.join(newText);
  }
  patch(
    "dog:{r:.3,h:.55,material:'longfur',speed:5},fox:",
    "dog:{r:.3,h:.55,material:'longfur',speed:5},ferret:{r:.18,h:.24,material:'shortfur',speed:4.4},fox:",
    'ferret_species'
  );
  patch(
    "function adopt(name,kind){const r=me();if(!r||r.chart!==CITY)return {ok:false,error:'STRAYS_LIVE_IN_THE_CITY'};if(!near('city.stray',2.5))return {ok:false,error:'NOTHING_HERE_TO_ADOPT',hint:'the stray sleeps by the teahouse bench'};",
    "function adopt(name,kind){const r=me(),home=!!r&&r.chart===NEST;if(!r||(!home&&r.chart!==CITY))return {ok:false,error:'COMPANION_ADOPTION_NOT_HERE'};if(home){if(!near('apartment.pet-bed',2.5))return {ok:false,error:'PET_BED_NOT_IN_REACH',hint:'Approach the apartment pet bed before choosing a companion.'};}else if(!near('city.stray',2.5))return {ok:false,error:'NOTHING_HERE_TO_ADOPT',hint:'the stray sleeps by the teahouse bench'};",
    'apartment_adoption'
  );
  patch(
    "M.removeEntity('city.stray');heel=true;",
    "if(!home)M.removeEntity('city.stray');heel=true;",
    'city_stray_remains_in_city'
  );
  patch(
    "const w=fear?3:1.6,k=w*w,c=2*w;",
    "const w=fear?3:(p.kind==='ferret'?2.1:1.6),k=w*w,c=2*w;",
    'ferret_faster_curiosity_response'
  );
  patch(
    "const ground=r.chart===AR.chart?AR.h(p.x,p.y):(r.pose.position[2]-r.shape.height/2);",
    "if(r.chart===NEST){const b=M.charts()[NEST]?.bounds;if(b){const c=b.center,h=b.halfExtents;p.x=clamp(p.x,c[0]-h[0]+K.r,c[0]+h[0]-K.r);p.y=clamp(p.y,c[1]-h[1]+K.r,c[1]+h[1]-K.r);}}\n const ground=r.chart===AR.chart?AR.h(p.x,p.y):(r.pose.position[2]-r.shape.height/2);",
    'pet_stays_inside_apartment_bounds'
  );
  patch(
    "if(!ent()['city.stray'])M.addEntity({id:'city.stray'",
    "if(r&&r.chart===CITY&&!ent()['city.stray'])M.addEntity({id:'city.stray'",
    'release_does_not_spawn_city_stray_from_home'
  );
  patch(
    "text:`${p.name} looks up at you for a moment, then trots back toward the teahouse bench and curls up to sleep.`",
    "text:r&&r.chart===NEST?`${p.name} curls up on the apartment pet bed. The adoption ends here.`:`${p.name} looks up at you for a moment, then trots back toward the teahouse bench and curls up to sleep.`",
    'home_release_description'
  );
  patch(
    "if(!p)return {ok:true,companion:null,text:'No companion. A stray sleeps by the teahouse bench; adopt <name> [cat|dog|fox|bird|lantern].'};",
    "if(!p)return {ok:true,companion:null,text:room()===NEST?'No companion yet. Choose a cat, dog or ferret at the apartment pet bed.':'No companion. A stray sleeps by the teahouse bench; adopt <name> [cat|dog|fox|bird|lantern].'};",
    'apartment_no_pet_hint'
  );
  if (result===original)throw Error('APARTMENT_COMPANION_PATCH_NOT_APPLIED');
  return result;
}
