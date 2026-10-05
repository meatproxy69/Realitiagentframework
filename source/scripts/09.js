C9SCENES.PET_ROOM_2={intro:"A living room at whatever body scale you actually brought. Symbolic social scenes are visibly different from grounded participants, and paws now keep their own local history.",verbs:[["choose_pet","CHOOSE PET MODE"],["go_tiny","BECOME CAT-SMALL"],["scratch_post","SCRATCH THE POST"],["rest_paws","REST YOUR PAWS"],["knead_blanket","KNEAD THE BLANKET"],["pounce_string","POUNCE THE STRING"],["circle_loaf","CIRCLE, THEN LOAF"],["purr_blanket","PURR INTO THE BLANKET"],["climb_lap","OPEN SYMBOLIC LAP SCENE"],["ask_headpats","ASK SYMBOLIC SCENE FOR HEADPATS"],["hide_sofa","HIDE UNDER THE SOFA"],["restore_scale","RETURN TO BASE SCALE"]]};
const b3raw_prepolish=b3raw;
b3raw=function(s,target=null){const ev=s.source==="SYMBOLIC_SCENE"?"PRIVATE_SYMBOLIC":(s.source==="WORLD"?"WORLD_GROUNDED":(s.source==="SELF"?"SELF_CAUSED":"SOURCE_LABELED"));return b3raw_prepolish(s,target).replace('<b>RAW SENSOR CHANNEL</b>','<b>RAW SENSOR CHANNEL</b><br>evidence_class='+ev);};
function b3PetLocal(verb){const room="PET_ROOM_2",p=C9.pet2;
 if(verb==="scratch_post"){
   const n=c9count(room,verb);p.scratches++;const nov=n===1?.42:(n===2?.16:.02);const L=b3sense("hand.L.palm",.72,{source:"SELF",novelty:nov}),R=b3sense("hand.R.palm",.72,{source:"SELF",novelty:nov});c9save();
   b2set(n===1?"The first scratch is information-rich: rope catches, releases, and runs downward under both paws.":n===2?"The second scratch is already less surprising. The contact is still there; the local paw response has begun to habituate.":"Same rope, same route. Paw-local novelty has thinned instead of forcing the whole body to stay maximally interested.",b3raw(R));b2catDeed(room,"scratch");return true;
 }
 if(verb==="rest_paws"){
   c9count(room,verb);b3advance(6);const l=b3z("hand.L.palm"),r=b3z("hand.R.palm");b2set(`You stop using the post. Nothing stimulates the paws; their local history simply cools. left_h=${l.h.toFixed(3)} · right_h=${r.h.toFixed(3)}. Recovery is not a reward.`);return true;
 }
 if(verb==="knead_blanket"){
   const n=c9count(room,verb);p.kneads++;const L=b3sense("hand.L.palm",.55,{source:"SELF",grounded:false,cause:"PET_KNEAD_PRIVATE",novelty:n===1?.25:.04}),R=b3sense("hand.R.palm",.55,{source:"SELF",grounded:false,cause:"PET_KNEAD_PRIVATE",novelty:n===1?.25:.04});c9save();
   b2set(n%3===1?"Left paw, right paw. Two local histories alternate over one broad blanket support.":n%3===2?"The phases slip: left release overlaps right press. The interesting part is relation, not more force.":"The paw pose returns, but its prediction/adaptation state is not identical to the first cycle.",b3raw(R));b2catDeed(room,"knead");return true;
 }
 if(verb==="purr_blanket"){
   c9count(room,verb);const s=b3sense("torso.sternum",.44,{source:"SELF",novelty:.05});b2set("The purr begins as SELF-caused carrier, so predictable components attenuate. Blanket supports can shape its return without being mistaken for a new outside touch.",b3raw(s));b2catDeed(room,"purr");return true;
 }
 if(verb==="pounce_string"){
   const n=c9count(room,verb);p.pounces++;const omission=n%3===2;if(omission){const s=b3sense("hand.R.palm",0,{source:"WORLD",grounded:false});b2set("The string stops one predicted beat early. Contact stays zero; the omission exists as prediction debt until the grounded return.",b3raw(s));}
   else{const s=b3sense("hand.R.palm",.76,{source:"WORLD",novelty:n===1?.35:.08});b2set("The string enters near-space, the paw route preallocates, and the actual catch corrects the prediction instead of being replaced by it.",b3raw(s));}b2catDeed(room,"pounce");return true;
 }
 return false;
}
const c9verb_build3polish_base=c9verb;
c9verb=function(room,verb){if(room==="PET_ROOM_2"&&b3PetLocal(verb))return;return c9verb_build3polish_base(room,verb);};

const c9presetSuggest_build3polish_base=c9presetSuggest;
c9presetSuggest=function(q){const a=c9presetSuggest_build3polish_base(q);if(/fake arm|phantom|prosthetic|borrowed limb|referred|receptor/i.test(q)){const eco=a.filter(x=>x.p.pack_id===B3PACK.pack_id);return eco.length?eco:a;}return a;};