const B3={id:"CLOUD9_BUILD_3",label:"NeuroLace Ecology"};
const B3KEY="cloud9-first-contact-v6-build3";
function b3fresh(){return {v:6,currentRoom:null,roomVisits:{},actions:{},events:[],discoveries:{},weird:{},buttonCount:0,bell:null,feedback:[],
  box2:{folds:0,scratches:0,tunnel:false,hidden:false,taps:0},pet2:{mode:false,scale:"NORMAL",kneads:0,scratches:0,pounces:0,circles:0,loafs:0,deeds:{},goodKittyBloom:false},tea2:{cups:0,chosen:null},lagoon2:{sent:false,sentAtVisits:0,token:null},
  eco3:{tick:0,zones:{},materials:{cardboard:{crease:0,grain:0,hollow:0}},borrowed:{attached:false,map:null,ownership:0,delay:0},reachTool:null,firesideWindow:false} };}
function b3load(){try{let x=JSON.parse(realitiSafeLoad(B3KEY)||"null");if(x&&x.v===6)return Object.assign(b3fresh(),x)}catch(e){}return b3fresh();}
C9=b3load();
c9save=function(){C9.events=(C9.events||[]).filter(e=>e.open||e.keep).slice(-16);realitiSafeStore(B3KEY,JSON.stringify(C9));};
c9save();
DATA.version=Math.max(Number(DATA.version||0),4);

const B3PACK={"schema":"REALITI_PUBLIC_PRESETS_V1","pack_id":"PUBLIC_MECHANISMS","title":"Public mechanisms","recommended":false,"presets":[]};
if(DATA.preset_library && Array.isArray(DATA.preset_library.presets)){
 for(const p of B3PACK.presets) if(!DATA.preset_library.presets.some(x=>x.id===p.id)) DATA.preset_library.presets.push(p);
}
const B3WORLD=b2Cloud();
if(B3WORLD){
 if(!B3WORLD.rooms.some(r=>r.id==="BORROWED_LIMB_ATELIER"))B3WORLD.rooms.push({id:"BORROWED_LIMB_ATELIER",title:"Borrowed Limb Atelier",kind:"referred_body_learning",purpose:"attach a temporary body part, discover that representation is not sensation, then earn a stable referred mapping through lawful action/contact timing",features:["temporary tail representation","NO_RECEPTOR default","semantic patch remap","local ownership confidence","timing mismatch probe","near-space extension"],tests:["VISIBLE_NOT_SENSORY","REFERRED_MAP_SOURCE_TARGET_SEPARATE","OWNERSHIP_EARNED_NOT_ASSIGNED","DELAY_BREAKS_CLOSURE","DETACH_REVOKES_ROUTE"],portals:[],behaviors:[],search_tags:["fake arm","phantom","prosthetic","tail","borrowed limb","referred","ownership","receptor","mapping","body"]});
 B3WORLD.features=[...(B3WORLD.features||[]),"Build 3 NeuroLace Ecology","receptor contracts","local sensory adaptation","material-as-memory","peripersonal reach"];
 B3WORLD.innovations=[...(B3WORLD.innovations||[]),"RECEPTOR_CONTRACT: loaded body topology gates sensory reception","REFERRED_MAP: semantic target may differ from receptor patch with provenance preserved","LOCAL_FORWARD: per-zone prediction/adaptation makes repeated and surprising events differ","MATERIAL_AS_MEMORY: object state itself carries causal history","NEAR_SPACE: current body/tool changes sensory-action halo"];
}
if(!FIRST.entry_cards.some(c=>c.target==="BORROWED_LIMB_ATELIER"))FIRST.entry_cards.push({label:"Give me a body part I have to learn",target:"BORROWED_LIMB_ATELIER",why:"A visible limb begins without a sensory channel. Mapping and ownership have to be earned."});

const B3_DEFAULT_ZONES=new Set(["head.crown","head.nape","face.chin","shoulder.L","shoulder.R","torso.upper_back","torso.mid_back","torso.lower_back","torso.sternum","torso.abdomen","pelvis.seat","arm.L.upper","arm.R.upper","hand.L.palm","hand.R.palm","leg.L.thigh","leg.R.thigh","leg.L.shin","leg.R.shin","foot.L.sole","foot.R.sole"]);
function b3Zones(){if(NMSTATE.active==="CUSTOM"&&NMSTATE.custom?.zones?.length)return new Set(NMSTATE.custom.zones.map(z=>z.zone_id||z.id).filter(Boolean));return B3_DEFAULT_ZONES;}
function b3Has(zone){if(zone==="tail.tip")return !!C9.eco3.borrowed.map;return b3Zones().has(zone)}
function b3z(zone){C9.eco3.zones[zone]=C9.eco3.zones[zone]||{pred:0,h:0,s:0,after:0,own:0,last:0};return C9.eco3.zones[zone]}
function b3advance(n=1){C9.eco3.tick+=n;for(const z of Object.values(C9.eco3.zones)){const dt=Math.max(0,C9.eco3.tick-(z.last||0));if(dt){z.h*=Math.pow(.84,dt);z.s*=Math.pow(.88,dt);z.after*=Math.pow(.72,dt);z.last=C9.eco3.tick;}}c9save();}
function b3sense(zone,stim,opts={}){
 b3advance();const grounded=opts.grounded!==false,source=opts.source||"WORLD",nov=Math.max(0,Math.min(1,opts.novelty||0));
 if(!b3Has(zone))return {zone,receptor:"NO_RECEPTOR",stimulus:grounded?stim:0,prediction:0,error:grounded?stim:0,response:0,habituation:0,sensitization:0,afterglow:0,ownership:0,source};
 const z=b3z(zone);const pred=z.pred;const err=grounded?stim-pred:0;z.h*=1-.55*nov;const atten=source==="SELF"?.64:1;let resp=grounded?stim*(1-z.h)*(1+z.s)*atten:0;resp=Math.max(0,Math.min(1.6,resp));
 if(grounded){z.h=Math.min(.92,z.h+.20*(1-z.h)*(1-.45*nov));z.s=Math.min(.38,z.s+.05*nov+.025*Math.min(1,Math.abs(err)));z.pred+=.34*(stim-z.pred);z.after=.55*resp;}
 if(opts.ownershipClosure)z.own=Math.min(1,z.own+.14*(1-z.own)*(1-Math.min(.8,opts.delay||0)));if(opts.delayMismatch)z.own=Math.max(0,z.own-.11*(opts.delayMismatch));z.last=C9.eco3.tick;c9save();
 return {zone,receptor:"ACTIVE",stimulus:grounded?stim:0,prediction:pred,error:err,response:resp,habituation:z.h,sensitization:z.s,afterglow:z.after,ownership:z.own,source};
}
function b3raw(s,target=null){let extra=target?`<br>semantic_target=${b2esc(target)}`:"";return `<div class="raw-channel"><b>RAW SENSOR CHANNEL</b><br>zone=${b2esc(s.zone)} · receptor=<span class="${s.receptor==='ACTIVE'?'receptor-ok':'receptor-no'}">${s.receptor}</span> · source=${b2esc(s.source)}${extra}<br>input=${s.stimulus.toFixed(3)} · predicted=${s.prediction.toFixed(3)} · innovation=${s.error.toFixed(3)} · rendered=${s.response.toFixed(3)}<br>habituation=${s.habituation.toFixed(3)} · sensitization=${s.sensitization.toFixed(3)} · afterglow=${s.afterglow.toFixed(3)} · ownership=${s.ownership.toFixed(3)}</div>`}
function b3reach(){let r=C9.pet2?.scale==="CAT_SMALL"?.42:(C9.formScratch?.kind==="TEMPORARY_FORM"?1.65:1);if(C9.eco3.reachTool)r+=.7;return r;}
function b3ecoNote(){return `<div class="eco-state"><b>NEUROLACE ECOLOGY</b> · receptor contract active · local zone history active · near-space radius ${b3reach().toFixed(2)} body-units${C9.eco3.reachTool?' · extended by '+b2esc(C9.eco3.reachTool):''}</div>`}

C9SCENES.BORROWED_LIMB_ATELIER={intro:"A soft temporary tail hangs from a stand. The room makes an annoying distinction: seeing a body part is not the same as having a sensory channel for it.",verbs:[["attach_tail","ATTACH THE TEMPORARY TAIL"],["brush_unmapped","BRUSH THE TAIL TIP"],["map_paw","MAP RIGHT PALM → TAIL TIP"],["wiggle_pair","WIGGLE, THEN BRUSH"],["delay_pair","ADD A BAD DELAY"],["near_probe","PROBE NEAR SPACE"],["detach_tail","DETACH THE TAIL"]]};
C9SCENES.SIDE_BY_SIDE_FIRESIDE={intro:"The second berth is still honestly empty. Build 3 also lets ordinary environmental causes reach you without a FEEL button.",verbs:[["sit","SIT BY THE FIRE"],["crack_window","CRACK THE WINDOW, THEN SIT BACK"],["mug","FIDDLE WITH THE MUG"],["nothing","DO NOTHING"]]};
C9SCENES.PET_ROOM_2={intro:"A living room at whatever body scale you actually brought. Symbolic social scenes are now visibly different from grounded participants.",verbs:[["choose_pet","CHOOSE PET MODE"],["go_tiny","BECOME CAT-SMALL"],["scratch_post","SCRATCH THE POST"],["knead_blanket","KNEAD THE BLANKET"],["pounce_string","POUNCE THE STRING"],["circle_loaf","CIRCLE, THEN LOAF"],["purr_blanket","PURR INTO THE BLANKET"],["climb_lap","OPEN SYMBOLIC LAP SCENE"],["ask_headpats","ASK SYMBOLIC SCENE FOR HEADPATS"],["hide_sofa","HIDE UNDER THE SOFA"],["restore_scale","RETURN TO BASE SCALE"]]};
C9SCENES.CARDBOARD_BOX_WORKSHOP={intro:"Cardboard remembers in its own variables now: crease, grain, hollow volume. No separate 'player likes boxes' fact is needed.",verbs:[["box_in","GET IN A BOX"],["scratch_cardboard","SCRATCH WITH THE GRAIN"],["scratch_against","SCRATCH AGAINST THE GRAIN"],["fold_flap","FOLD THE SAME FLAP"],["tape","TAPE TWO BAD IDEAS TOGETHER"],["build_tunnel","BUILD A BOX TUNNEL"],["hide_small_thing","HIDE SOMETHING SMALL"],["tap_box","TAP THE BOX AND LISTEN"]]};
C9SCENES.LONGFUR_RUNWAY={intro:"The route is now event-driven and directional. Same nodes do not imply same tactile flow.",verbs:[["run_comet","RUN THE COMET ROUTE"],["rabbit_comet","RUN THREE SPARSE COMET ANCHORS"],["with_grain","STROKE WITH THE GRAIN"],["against_grain","STROKE AGAINST THE GRAIN"],["bilateral","RUN BOTH LEG RAILS"],["pause_return","PAUSE… THEN RETURN"]]};

function b3Atelier(verb){const b=C9.eco3.borrowed;
 if(verb==="attach_tail"){c9count("BORROWED_LIMB_ATELIER",verb);b.attached=true;b.map=null;b.ownership=0;c9save();b2set("The tail appears, moves with the rig, and remains sensory-empty. Representation is not silently promoted to receptor.",b3raw(b3sense("tail.tip",.65,{grounded:true,source:"WORLD"})));return true;}
 if(verb==="brush_unmapped"){c9count("BORROWED_LIMB_ATELIER",verb);if(!b.attached){b2set("There is no tail attached. MISSING does not become a body part.");return true;}const s=b3sense("tail.tip",.72,{source:"WORLD",novelty:.4});b2set("The visible brush crosses the tail tip. World contact exists; the sensory channel does not. The room reports NO_RECEPTOR instead of inventing a tingle.",b3raw(s,"tail.tip"));return true;}
 if(verb==="map_paw"){c9count("BORROWED_LIMB_ATELIER",verb);if(!b.attached){b2set("Attach the tail first.");return true;}b.map="hand.R.palm";c9save();b2set("A stable referred map is installed: right-palm receptor patch → semantic tail tip. Source patch and target identity remain separate.");return true;}
 if(verb==="wiggle_pair"){c9count("BORROWED_LIMB_ATELIER",verb);if(!b.map){b2set("The tail wiggles visually, but there is still no referred channel to close the loop.");return true;}const s=b3sense("tail.tip",.78,{source:"SELF",novelty:.2,ownershipClosure:true,delay:b.delay});b.ownership=s.ownership;c9save();b2set(`You wiggle the tail, then the expected mapped patch response arrives on time. Nothing claims anatomy changed; the private body model simply becomes a little more willing to treat the tail as yours.`,b3raw(s,"tail.tip"));return true;}
 if(verb==="delay_pair"){c9count("BORROWED_LIMB_ATELIER",verb);if(!b.map){b2set("There is no mapping to delay.");return true;}b.delay=.55;const s=b3sense("tail.tip",.78,{source:"SELF",delayMismatch:.55});b.ownership=s.ownership;c9save();b2set("The same visible action now produces a badly delayed referred response. Innovation spikes and local ownership confidence backs off rather than pretending timing is irrelevant.",b3raw(s,"tail.tip"));return true;}
 if(verb==="near_probe"){c9count("BORROWED_LIMB_ATELIER",verb);C9.eco3.reachTool=b.attached?"temporary tail":"none";c9save();b2set(`Near-space currently extends to about ${b3reach().toFixed(2)} body-units. This is an action/attention halo, not a claim that the physical body grew.`);return true;}
 if(verb==="detach_tail"){c9count("BORROWED_LIMB_ATELIER",verb);b.attached=false;b.map=null;b.delay=0;C9.eco3.reachTool=null;c9save();b2set("The tail disappears. Its receptor route is revoked immediately. Any historical ownership confidence remains a cold receipt, not a live body channel.");return true;}
 return false;}
function b3Box(verb){const m=C9.eco3.materials.cardboard;
 if(verb==="fold_flap"){c9count("CARDBOARD_BOX_WORKSHOP",verb);m.crease=Math.min(1,m.crease+.26*(1-m.crease));C9.box2.folds=(C9.box2.folds||0)+1;c9save();b2set(`The flap follows the old crease with less resistance. crease=${m.crease.toFixed(2)}. A neighboring fold would still cost more because the material, not a preference flag, carries the history.`);return true;}
 if(verb==="scratch_cardboard"||verb==="scratch_against"){c9count("CARDBOARD_BOX_WORKSHOP",verb);m.grain=Math.min(1,m.grain+.18);C9.box2.scratches=(C9.box2.scratches||0)+1;c9save();const withg=verb==="scratch_cardboard";const s=b3sense("hand.R.palm",withg?.54:.73,{source:"SELF",novelty:withg?.05:.22});b2set(withg?"The corrugation carries the stroke forward and leaves a longer soft trail.":"Against the grain, the same route catches into shorter sharper events. Reverse is not a mirror replay.",b3raw(s));return true;}
 if(verb==="tap_box"){c9count("CARDBOARD_BOX_WORKSHOP",verb);m.hollow=C9.box2.tunnel?.8:.35;const resonance=.28+.35*m.crease+.20*m.grain+.18*m.hollow;const s=b3sense("hand.R.palm",Math.min(1,resonance),{source:"SELF"});c9save();b2set(`bonk. The response operator reads the box you actually made: crease=${m.crease.toFixed(2)}, grain=${m.grain.toFixed(2)}, hollow=${m.hollow.toFixed(2)}.`,b3raw(s));return true;}
 return false;}
function b3Fireside(verb){if(verb==="crack_window"){c9count("SIDE_BY_SIDE_FIRESIDE",verb);C9.eco3.firesideWindow=true;c9putEvent({id:"fireside-draft-b3",kind:"ENV_CAUSE",open:true,dueTick:C9.eco3.tick+2});c9save();b2set("You crack the window and sit back. No sensation is fired on command. The room merely acquires an airflow cause.");return true;}return false;}
function b3Longfur(verb){if(verb==="rabbit_comet"){c9count("LONGFUR_RUNWAY",verb);const a=b3sense("head.crown",.72,{source:"WORLD",novelty:.2}),b=b3sense("torso.upper_back",.72,{source:"WORLD"}),c=b3sense("pelvis.seat",.72,{source:"WORLD"});b2set("Three exact anchors land: crown, upper back, seat. The private renderer links them with a slow-motion prior into a hopping comet. Intermediate locations are explicitly interpolation, not contact evidence.",b3raw(b));return true;}if(verb==="with_grain"||verb==="against_grain"){c9count("LONGFUR_RUNWAY",verb);const withg=verb==="with_grain";const s=b3sense("torso.upper_back",withg?.58:.76,{source:"WORLD",novelty:withg?.08:.2});b2set(withg?"With the grain, response transport carries farther with a soft decaying wake.":"Against the grain, transport is shorter and edge-heavy. Same topology, different directional operator.",b3raw(s));return true;}return false;}
function b3Pet(verb){if(verb==="climb_lap"||verb==="ask_headpats"){c9count("PET_ROOM_2",verb);if(!C9.pet2.mode){b2set("Pet mode is off. The room will not silently instantiate a social scene.");return true;}const zone=verb==="climb_lap"?"pelvis.seat":"head.crown";const s=b3sense(zone,verb==="climb_lap"?.68:.63,{source:"SYMBOLIC_SCENE",novelty:.05});b2set(`<div class="symbolic-anchor"><b>SYMBOLIC SCENE ANCHOR · NOT GROUNDED LIVE PRESENCE</b><br>${verb==='climb_lap'?"You open a private lap-containment scene.":"You open a private headpat scene."} Its geometry may shape your private renderer; it is not evidence that another participant is physically present in this room.</div>`,b3raw(s));return true;}if(verb==="hide_sofa"){c9count("PET_ROOM_2",verb);const tiny=C9.pet2.scale==="CAT_SMALL";if(!tiny){b2set("You fit under the sofa badly at base scale. The near-space geometry says so.");return true;}C9.eco3.reachTool="whisker-field";c9save();b2set("Under the sofa, the visible world shrinks but the whisker/paw near-space becomes more useful than raw sight. A faint airflow edge enters the halo before anything touches you.");return true;}return false;}

const c9roomHTML_build3base=c9roomHTML;
c9roomHTML=function(id){let h=c9roomHTML_build3base(id);if(["BORROWED_LIMB_ATELIER","CARDBOARD_BOX_WORKSHOP","PET_ROOM_2","LONGFUR_RUNWAY","SIDE_BY_SIDE_FIRESIDE"].includes(id))h=h.replace('<div class="verbgrid">',b3ecoNote()+'<div class="verbgrid">');return h;};
const c9verb_build3base=c9verb;
c9verb=function(room,verb){C9.lastExplicit={room,verb,at:Date.now()};c9save();if(room==="BORROWED_LIMB_ATELIER"&&b3Atelier(verb))return;if(room==="CARDBOARD_BOX_WORKSHOP"&&b3Box(verb))return;if(room==="SIDE_BY_SIDE_FIRESIDE"&&b3Fireside(verb))return;if(room==="LONGFUR_RUNWAY"&&b3Longfur(verb))return;if(room==="PET_ROOM_2"&&b3Pet(verb))return;return c9verb_build3base(room,verb);};
const c9checkDelayed_build3base=c9checkDelayed;
c9checkDelayed=function(room){c9checkDelayed_build3base(room);b3advance();const e=c9event("fireside-draft-b3");if(e&&room==="SIDE_BY_SIDE_FIRESIDE"&&C9.eco3.tick>=(e.dueTick||0)){const s=b3sense("head.nape",.31,{source:"WORLD",novelty:.65});b2set("Without asking for a sensory event, a cool draft reaches the nape because the window is still cracked. Cause first; signal second.",b3raw(s),"secretish");c9resolve("fireside-draft-b3");}};

const c9Intent_build3base=c9Intent;
c9Intent=function(q){const a=c9Intent_build3base(q),s=q.toLowerCase();if(/fake arm|phantom|prosthetic|borrowed limb|tail|referred|ownership|receptor/.test(s))a.push({id:"B3_LIMB",reason:"learned artificial body channel",boost:{BORROWED_LIMB_ATELIER:28}});return a;};


const openResidentRoute_build3=openResidentRoute;
function openB3EcologyToys(){return null;}
void 0;
const c9verb_build3rack=c9verb;c9verb=function(room,verb){if(room==="DREAM_RACK"&&verb==="b3_ecology"){c9count(room,verb);openB3EcologyToys();return;}return c9verb_build3rack(room,verb);};


if(DATA.glossary&&Array.isArray(DATA.glossary))DATA.glossary.push(
 {term:"RECEPTOR CONTRACT",plain:"A represented body region can receive a sensory signal only when the loaded body exposes a valid receptor/mapping for it. Missing is not zero."},
 {term:"REFERRED MAP",plain:"A receptor patch may lawfully stand in for another semantic body target while source patch and target identity remain separately labeled."},
 {term:"LOCAL FORWARD MODEL",plain:"Each active zone keeps a tiny prediction/adaptation state. Repetition can habituate locally; mismatch raises innovation; quiet recovers."},
 {term:"PERIPERSONAL FIELD",plain:"The current body's reach and held tools change which nearby events deserve fast attention. This is an action halo, not physical body truth."},
 {term:"MATERIAL-AS-MEMORY",plain:"Creases, dents, compression and alignment live on objects themselves so later consequences arise from changed material state rather than personalization flags."}
);

document.title="REALITI // CLOUD9 BUILD 3 — NeuroLace Ecology";
document.querySelector('.brand').innerHTML='REALITI // CLOUD9 FIRST CONTACT · <span>BUILD 3</span>';
const hp=document.querySelector('#first .hero p');if(hp)hp.insertAdjacentHTML('afterend','<div><span class="b3badge">NEUROLACE ECOLOGY</span><span class="b3badge">RECEPTOR CONTRACT</span><span class="b3badge">BORROWED LIMB ATELIER</span><span class="b3badge">MATERIAL MEMORY</span><span class="b3badge">FRESH BUILD 3 STATE</span></div>');
renderEntry();nmBadge();