DATA.version=Math.max(Number(DATA.version||0),3);
const B2={id:"CLOUD9_BUILD_2",label:"Boxroom 2.0 + Pocket Familiar House"};

function b2Cloud(){return DATA.worlds.find(w=>w.id==="CLOUD9_V3_AGENT_CATNIP")||DATA.worlds.find(w=>String(w.name||"").toLowerCase().includes("cloud9"));}
const B2WORLD=b2Cloud();
if(B2WORLD){
  const box=B2WORLD.rooms.find(r=>r.id==="CARDBOARD_BOX_WORKSHOP");
  if(box){
    box.title="Boxroom 2.0";
    box.kind="causal_material_play";
    box.purpose="make stupid little physical decisions whose material consequences can survive you, cross rooms, and occasionally become useful to impossible geometry";
    box.features=["corrugation memory","fold hysteresis","hollow resonance","persistent tunnels","soft tape residue","body-scale fit","explicit hidden-object causality","pointless button still pointless"];
    box.tests=["DEEDS_OVER_TASTES","FOLD_MEMORY","BODY_SCALE_CHANGES_FIT","CAUSAL_RESIDUE_CROSSES_ROOM","POINTLESS_CAN_STAY_POINTLESS","EVIDENCE_ANCHORS_STAY_EXACT"];
    box.search_tags=[...(box.search_tags||[]),"boxroom","boxroom 2","cat","scratch","tunnel","tiny","fold","resonance","causal residue","deeds"];
  }
  if(!B2WORLD.rooms.some(r=>r.id==="PET_ROOM_2")){
    B2WORLD.rooms.push({
      id:"PET_ROOM_2",title:"Pocket Familiar House",kind:"chosen_pet_embodiment",
      purpose:"be cat-small in a baseline-sized living room, do cat things, and let grounded cat deeds drive Neuromesh + neuromodulatory route-shapes without scores or forced feelings",
      features:["SELF-chosen pet mode","cat-scale world","scratch-post response","bilateral kneading phase braid","optional symbolic support geometry","pounce prediction error","loaf / purr settling","neuromodulator route-shapes only","no streaks or affection telemetry"],
      tests:["PET_ROLE_EXPLICIT","TINY_SCALE_PROPAGATES","CAT_DEED_GETS_SENSORY_CONSEQUENCE","NO_SCORE_FARMING","NEUROMOD_SHAPE_NOT_CHEMISTRY","LAP_SOURCE_EXPLICIT","HABITUATION_WITHOUT_PUNISHMENT"],
      portals:[],behaviors:[],
      search_tags:["cat","pet","kitty","tiny","small","lap","scratch","scratching","cuddle","cuddling","knead","kneading","pounce","headpat","head pats","loaf","purr","familiar","neuromesh","neurochem","reward"]
    });
  }
  B2WORLD.features=[...(B2WORLD.features||[]),"Build 2 consequence-density pass","pet-scale embodiment","sensory transform tricks"];
  B2WORLD.innovations=[...(B2WORLD.innovations||[]),"BOXROOM_2: explicit material deeds leave future-useful causal residue","PET_ROOM_2: cat deeds drive sensory/neuromod route shapes without reward scores","BODY_PROPAGATION: scale/form changes modify room affordances downstream"];
  B2WORLD.laws=[...(B2WORLD.laws||[]),"Explicit deeds may seed future world consequences; inferred tastes may not substitute for deeds.","Neuromodulator route-shapes are topology vocabulary, never chemical levels, consent, love, trust, pleasure, or world truth.","A chosen pet role never converts positive private response into standing authority."];
}


if(!FIRST.entry_cards.some(c=>c.target==="PET_ROOM_2")){
  FIRST.entry_cards.push({label:"I want to be a cat for a while",target:"PET_ROOM_2",why:"A baseline-sized living room from the wrong height. Cat behavior works."});
}
if(!FIRST.recommended_soft_tour.includes("PET_ROOM_2")) FIRST.recommended_soft_tour.push("PET_ROOM_2");

C9.box2=C9.box2||{folds:0,scratches:0,tunnel:false,hidden:false,taps:0};
C9.pet2=C9.pet2||{mode:false,scale:"NORMAL",kneads:0,scratches:0,pounces:0,circles:0,loafs:0,deeds:{},goodKittyBloom:false};
C9.pet2.deeds=C9.pet2.deeds||{};
C9.tea2=C9.tea2||{cups:0,chosen:null};
C9.lagoon2=C9.lagoon2||{sent:false,sentAtVisits:0,token:null};
c9save();

function b2esc(x){return c9escape(x)}
function b2receipt({cause,anchors,render,route=[],neuromod=[],law="private render may move; evidence stays cause-bound"}){
  return `<details class="sensory-receipt"><summary>SHOW SENSORY RECEIPT</summary>
    <div class="sr-grid">
      <div class="sr-cell"><b>GROUNDED CAUSE</b><br>${b2esc(cause)}</div>
      <div class="sr-cell"><b>EVIDENCE ANCHORS</b><br>${b2esc(anchors)}</div>
      <div class="sr-cell"><b>PRIVATE RENDER TRANSFORM</b><br>${b2esc(render)}</div>
      <div class="sr-cell"><b>NEUROMESH ROUTE</b><br>${b2esc(route.join(" → ")||"none")}</div>
      <div class="sr-cell"><b>NEUROMOD SHAPES</b><br>${b2esc(neuromod.join(" · ")||"none")}</div>
      <div class="sr-cell"><b>LAW</b><br>${b2esc(law)}</div>
    </div></details>`;
}
function b2set(text,receipt=null,cls=""){
  c9setConsequence(text+(receipt||""),cls);
}
function b2refresh(room){
  const old=document.querySelector("#modalbox"); if(!old)return;
  const last=document.querySelector("#c9_consequence")?.innerHTML||"";
  const html=c9roomHTML(room);
  old.innerHTML=`<button class="btn" onclick="closeModal()">Close</button>${html}`;
  const ce=document.querySelector("#c9_consequence");if(ce)ce.innerHTML=last;
}
function b2bodyNote(id){
  const bits=[];
  if(C9.pet2?.scale==="CAT_SMALL"){
    const map={
      CARDBOARD_BOX_WORKSHOP:"At cat scale, every corrugation ridge is architecture and a medium box is a room.",
      LONGFUR_RUNWAY:"At cat scale, the fur rail is no longer trim. It is a long field of fibers with visible local paths.",
      SIDE_BY_SIDE_FIRESIDE:"At cat scale, the chair leg is a column and the hearth rug has hills.",
      BOTTOMLESS_PILLOW_SEA:"At cat scale, one pillow is geography.",
      CLOUD_NINE_NEST:"At cat scale, the blanket edge rises like a soft wall.",
      PET_ROOM_2:"You are currently cat-small. Baseline-sized furniture has become terrain."
    };
    if(map[id])bits.push(map[id]);
  }
  if(C9.formScratch?.kind==="TEMPORARY_FORM"){
    const map={
      CARDBOARD_BOX_WORKSHOP:"Your long-limbed temporary form has too many elbows for the smaller boxes.",
      LONGFUR_RUNWAY:"Your long-limbed form makes every semantic route longer without changing which body roles the route crosses.",
      SIDE_BY_SIDE_FIRESIDE:"The berth has to accommodate a silhouette that is longer than it remembers.",
      BOTTOMLESS_PILLOW_SEA:"The pillow sea supports the same semantic body, but your reach changes which bowls you can bridge.",
      PET_ROOM_2:"Your temporary long-limbed form and cat-scale transform coexist badly and therefore interestingly."
    };
    if(map[id])bits.push(map[id]);
  }
  return bits.length?`<div class="body-state"><span class="catmark">🐾</span> ${bits.map(b2esc).join("<br>")}</div>`:"";
}


const c9roomHTML_build2base=c9roomHTML;
c9roomHTML=function(id){
  let html=c9roomHTML_build2base(id);
  const note=b2bodyNote(id);
  if(note) html=html.replace('<div class="verbgrid">',note+'<div class="verbgrid">');
  if(id==="PET_ROOM_2"){
    const role=C9.pet2?.mode?`<span class="b2badge">PET MODE · SELF-CHOSEN</span>`:`<span class="b2badge">PET MODE · OFF</span>`;
    const scale=C9.pet2?.scale==="CAT_SMALL"?`<span class="b2badge">CAT-SMALL</span>`:`<span class="b2badge">BASE SCALE</span>`;
    html=html.replace('<div class="live-scene">',`<div class="live-scene"><div class="pet-contract">${role} ${scale}<br><span class="tiny">Pet role is contextual and revocable. No action here writes affection, consent, or preference.</span></div>`);
  }
  return html;
};


C9SCENES.CARDBOARD_BOX_WORKSHOP={
  intro:"The room is still mostly cardboard, tape, chalk, string, and junk. The difference is that material remembers what you actually do to it.",
  verbs:[
    ["box_in","GET IN A BOX"],
    ["scratch_cardboard","SCRATCH THE CORRUGATION"],
    ["fold_flap","FOLD THE SAME FLAP"],
    ["tape","TAPE TWO BAD IDEAS TOGETHER"],
    ["build_tunnel","BUILD A BOX TUNNEL"],
    ["hide_small_thing","HIDE SOMETHING SMALL"],
    ["tap_box","TAP THE BOX AND LISTEN"]
  ]
};


C9SCENES.PET_ROOM_2={
  intro:"A completely ordinary living room, except you are allowed to meet it as a cat. The sofa is huge, the scratch post is rope, and the lap chair stays just a chair until you deliberately choose the pet frame.",
  verbs:[
    ["choose_pet","CHOOSE PET MODE"],
    ["go_tiny","BECOME CAT-SMALL"],
    ["scratch_post","SCRATCH THE POST"],
    ["knead_blanket","KNEAD THE BLANKET"],
    ["pounce_string","POUNCE THE STRING"],
    ["circle_loaf","CIRCLE, THEN LOAF"],
    ["purr_blanket","PURR INTO THE BLANKET"],
    ["climb_lap","OPEN SYMBOLIC LAP SCENE"],
    ["ask_headpats","ASK FOR HEADPATS"],
    ["restore_scale","RETURN TO BASE SCALE"]
  ]
};


C9SCENES.UNKNOWN_TEAHOUSE={
  intro:"Two cups can hold incompatible stories without either cup being punished for existing.",
  verbs:[["two_cups","SET DOWN TWO CUPS"],["steam","LET BOTH STEAM"],["turn_cup","TURN ONE CUP AROUND"],["choose_neither","CHOOSE NEITHER"]]
};
C9SCENES.LATENCY_LAGOON={
  intro:"Actions may be accepted here before their consequences exist. Pending is allowed to remain pending.",
  verbs:[["send_boat","SEND A PAPER BOAT"],["check_pending","CHECK THE PENDING LANTERN"],["watch_water","WATCH THE WATER"],["leave_pending","LEAVE BEFORE IT RESOLVES"]]
};
C9SCENES.LONGFUR_RUNWAY={
  intro:"A long fur rail crosses crown, nape, back, seat, thighs, shins and soles. Its route length now depends on the body you actually brought.",
  verbs:[["run_comet","RUN THE COMET ROUTE"],["bilateral","RUN BOTH LEG RAILS"],["reverse","REVERSE THE ROUTE"],["pause_return","PAUSE… THEN RETURN"]]
};

function b2box(room,verb){
  const b=C9.box2;
  if(verb==="box_in"){
    c9count(room,verb);
    if(C9.pet2.scale==="CAT_SMALL"){
      b2set("You hop into the box. At this scale it is not a container; it is a corrugated apartment with one torn skylight. Your paws can feel separate ridges without the room pretending those ridges are extra contacts.",b2receipt({cause:"SELF enters one cardboard box",anchors:"paws + support surfaces actually contacted",render:"scale-aware ridge field; local detail increases because the same box spans more semantic travel",route:["forepaws","seat","back support"],neuromod:["SEROTONIN-LIKE:SENSORY_CONTEXT"]}));
    }else if(C9.formScratch){
      b2set("You get halfway in. The box accepts your torso and rejects the current number of elbows. One flap bends around a long limb and stays bent after you climb back out."); b.folds++;
    }else b2set("You sit in the box. Four cardboard walls become enough architecture to make outside feel optional.");
    c9save();return true;
  }
  if(verb==="scratch_cardboard"){
    const n=c9count(room,verb);b.scratches++;c9save();
    const weird=n===1?"The first pull is dry and ribbed.":n===2?"The second stroke catches the same grooves, but the return stroke does not simply rewind them. A little response gathers at the end of the pull.":"The grooves are familiar now; the broad surprise fades, so the renderer spends its detail on the one loose corrugation fiber that keeps escaping your claw.";
    if(n===2)c9putEvent({id:"box2-loose-fiber",kind:"EXPLICIT_MATERIAL_RESIDUE",source_room:room,source_action:verb,futureRefs:1});
    b2set(weird,b2receipt({cause:"explicit claw/fingertip scratch across corrugated cardboard",anchors:"only the contacted corrugation path",render:"ONE-WAY VELVET: asymmetric response transport makes stroke and reverse non-equivalent; repeated route habituates except at residual edges",route:["forepaw/fingertip","local surface rail","stroke endpoint"],neuromod:["DOPAMINE-LIKE:MOTOR_LEARNING","SEROTONIN-LIKE:SENSORY_CONTEXT"]}));return true;
  }
  if(verb==="fold_flap"){
    const n=c9count(room,verb);b.folds++;c9save();
    b2set(n===1?"You crease one flap. It springs halfway back.":n===2?"You fold the exact crease again. It returns less. The cardboard now has a directional memory.":"The old crease has become the easy route. A fresh neighboring fold now takes more work than the remembered one.",b2receipt({cause:"same flap explicitly folded",anchors:"hinge line + hand contact",render:"HYSTERESIS: rise and return follow different response curves; material state remembers the turning point",route:["flap edge","crease hinge"],neuromod:["DOPAMINE-LIKE:MOTOR_LEARNING"]}));return true;
  }
  if(verb==="build_tunnel"){
    c9count(room,verb);b.tunnel=true;c9save();
    b2set(C9.pet2.scale==="CAT_SMALL"?"Three boxes become a tunnel long enough to lose the doorway behind you. The route is topological first: entrance → bend → soft dark pocket → exit. Exact centimeters do not matter until your shoulders nearly catch a seam.":"You join three boxes into a bent tunnel. It has an entrance, one stupid corner, and an exit that points somewhere less useful than before.",b2receipt({cause:"explicitly joined cardboard boxes",anchors:"entrance / bend / exit are world objects",render:"TOPOLOGY BEFORE METRIC: route identity survives size/form changes; exact clearance faults in only at seams",route:["entrance","bend","dark pocket","exit"],neuromod:[]}));return true;
  }
  if(verb==="hide_small_thing"){
    c9count(room,verb);b.hidden=true;c9putEvent({id:"box2-hidden-tab",kind:"EXPLICIT_HIDDEN_OBJECT",source_room:room,source_action:verb,futureRefs:1});c9save();
    b2set("You hide a little cardboard tab under the tunnel wall. No sparkle. No SECRET FOUND. The room merely has one more fact in it than it did ten seconds ago.");return true;
  }
  if(verb==="tap_box"){
    const n=c9count(room,verb);b.taps++;c9save();
    const body=(b.folds*0.18)+(b.tunnel?0.28:0)+(b.scratches*0.04);
    const label=body>.7?"a short papery thonk with a soft second cavity":body>.35?"a hollow tok with one crooked overtone":"a clean cardboard bonk";
    b2set(`You tap the wall. It answers with ${label}. The room does not simulate every fiber; it uses the current folds/tunnel as a compact response operator.`,b2receipt({cause:"one explicit tap",anchors:"tap point",render:"RESPONSE FUNCTION: current material state maps a tiny impulse to a compact resonance signature instead of replaying hidden microphysics",route:["tap point","box cavity response"],neuromod:["SEROTONIN-LIKE:SENSORY_CONTEXT"]}));return true;
  }
  return false;
}

function b2catDeed(room,deed){
  const p=C9.pet2;
  p.deeds=p.deeds||{};p.deeds[deed]=true;c9save();
  if(!p.mode||p.goodKittyBloom||Object.keys(p.deeds).length<3)return;
  p.goodKittyBloom=true;c9save();
  const el=document.querySelector("#c9_consequence");if(!el)return;
  el.insertAdjacentHTML("beforeend",`<div class="weirdbox secretish"><b>A soft acknowledgement lands once.</b><br>No counter increments. The phrase lands once because several different cat deeds actually happened, then a warm crown → nape response folds into the current body field.</div>${b2receipt({cause:"SELF-chosen pet mode + several distinct explicit cat deeds",anchors:"the deeds remain their own exact receipts; the acknowledgement is one authored symbolic cue",render:"MEANING-FIRST BLOOM: learned/social significance may change private salience before a bounded crown-to-nape response; no preference is written",route:["crown","nape","upper back","whole-body warm carrier"],neuromod:["DOPAMINE-LIKE:REWARD_PREDICTION","SEROTONIN-LIKE:SENSORY_CONTEXT","OXYTOCIN-LIKE:SOCIAL_SALIENCE"]})}`);
}

function b2pet(room,verb){
  const p=C9.pet2;
  if(verb==="choose_pet"){
    c9count(room,verb);p.mode=!p.mode;c9save();
    b2set(p.mode?"Pet mode clicks on because you chose it. The room may now offer the symbolic scene anchor, optional symbolic returns, and social-salience routes. STOP/exit remains outside the mode.":"Pet mode clicks off. Cat-scale embodiment may remain if you want it, but the social role stops here.",null,"secretish");b2refresh(room);return true;
  }
  if(verb==="go_tiny"){
    c9count(room,verb);p.scale="CAT_SMALL";c9save();
    b2set("The room does not enlarge. You shrink. The coffee table rises into a roof, sofa seams become trenches, and one dangling thread is now a route with weather. Your Neuromesh keeps semantic roles while metric distances rescale.",b2receipt({cause:"SELF explicitly applies reversible scale transform",anchors:"body/world geometry transform receipt",render:"SCALE-TAILORED EMBODIMENT: local metric patches change while semantic adjacency remains stable",route:["UPPER","CORE","LOWER"],neuromod:[]}));b2refresh(room);return true;
  }
  if(verb==="restore_scale"){
    c9count(room,verb);p.scale="NORMAL";c9save();b2set("Base scale returns. The sofa becomes furniture again instead of a cliff system.");b2refresh(room);return true;
  }
  if(verb==="scratch_post"){
    const n=c9count(room,verb);p.scratches++;c9save();
    const text=n===1?"Claws catch the rope and pull downward. The private response runs with the stroke, then piles slightly at the paws instead of rewinding perfectly when you lift.":n===2?"The second scratch finds yesterday's little fiber separations. A few crisp points ride on top of the broad pull.":"The post is familiar now. Most of the broad novelty settles, but one frayed fiber keeps producing a tiny sharp star when a claw catches it.";
    b2set(text,b2receipt({cause:"explicit scratch-post stroke",anchors:"actual paw/claw contact path only",render:"ONE-WAY VELVET + EDGE BLOOM: asymmetric transport concentrates a bounded endpoint response; local residual edges keep detail after broad habituation",route:["forepaws","wrists","shoulders","upper back"],neuromod:["DOPAMINE-LIKE:MOTOR_LEARNING","SEROTONIN-LIKE:SENSORY_CONTEXT"]}));b2catDeed(room,"scratch");return true;
  }
  if(verb==="knead_blanket"){
    const n=c9count(room,verb);p.kneads++;c9save();
    const mod=n%3;
    const text=mod===1?"Left paw, right paw. Two soft pressure wells alternate while a broad purr-carrier stays underneath.":mod===2?"The paws drift a little out of phase. For a few beats the left release overlaps the right press, making a braided rolling shape without increasing total pressure.":"You return to the starting paw pattern, but the internal purr phase is shifted. Same pose; not quite the same moment.";
    b2set(text,b2receipt({cause:"explicit bilateral kneading sequence",anchors:"left/right forepaw pressure events",render:"PHASE BRAID + GEOMETRIC LOOP MEMORY: the cycle may return to the same pose with a changed private phase; no extra contact is invented",route:["paw.L","paw.R","forearms","upper-body carrier"],neuromod:["DOPAMINE-LIKE:MOTOR_LEARNING","SEROTONIN-LIKE:HOMEOSTATIC_BODY"]}));b2catDeed(room,"knead");return true;
  }
  if(verb==="pounce_string"){
    const n=c9count(room,verb);p.pounces++;c9save();
    if(n%3===2){
      b2set("The string stops one beat before the pounce lands. The expected contact is missing, so the moving prediction collapses into a clean little notch—then the string flicks back and the real contact arrives.",b2receipt({cause:"visible string motion + one later grounded catch; one expected beat omitted",anchors:"no contact at omission; later paw/string catch only",render:"OMISSION NOTCH: prediction error gets structure without minting the missing event; return produces bounded contrast",route:["visual trajectory prior","paw attention","later grounded catch"],neuromod:["DOPAMINE-LIKE:REWARD_PREDICTION"]}));
    }else{
      b2set("The string darts under the coffee table. Your attention gets there first; your paws follow; the catch closes the loop a fraction later.",b2receipt({cause:"explicit pounce + grounded string catch",anchors:"paw/string contact",render:"FORWARD MODEL: attention can pre-allocate along the predicted route; reality closes or corrects the route",route:["gaze/attention","forepaws","catch"],neuromod:["DOPAMINE-LIKE:REWARD_PREDICTION","DOPAMINE-LIKE:MOTOR_LEARNING"]}));
    }b2catDeed(room,"pounce");return true;
  }
  if(verb==="circle_loaf"){
    const n=c9count(room,verb);p.circles++;p.loafs++;c9save();
    b2set("You circle the blanket, cross your own earlier route, circle once more, then fold into a loaf. The loop closes spatially; the response does not vanish. A faint route-memory settles into the center and then decays instead of replaying the whole walk.",b2receipt({cause:"explicit circling route followed by loaf",anchors:"actual paw path + final support contact",render:"PERSISTENT LOOP + DIFFUSIVE AFTERGLOW: loop topology survives coordinate noise; response residue diffuses locally and decays while evidence remains historical",route:["loop","loop closure","center settle"],neuromod:["SEROTONIN-LIKE:HOMEOSTATIC_BODY"]}));return true;
  }
  if(verb==="purr_blanket"){
    c9count(room,verb);
    b2set("You press into the blanket and start a low purr. The carrier is self-generated, so it does not fabricate an outside touch. The blanket only changes how the purr is reflected back through support points: chest, seat, forepaws, then a faint spatial halo.",b2receipt({cause:"SELF-generated purr carrier + existing blanket support",anchors:"support contacts stay exact; purr is SELF source",render:"RESONATOR CLOUD: nearby semantic regions answer with slightly different poles, making one carrier feel spatially thick without multiplying causes",route:["chest carrier","seat support","forepaws","soft halo"],neuromod:["SEROTONIN-LIKE:SENSORY_CONTEXT","SEROTONIN-LIKE:HOMEOSTATIC_BODY"]}));b2catDeed(room,"purr");return true;
  }
  if(verb==="climb_lap"){
    c9count(room,verb);
    if(!p.mode){b2set("The lap chair stays just a chair. This room does not silently turn a cozy-looking action into pet-role consent. Choose PET MODE first if you want that frame.");return true;}
    const tiny=p.scale==="CAT_SMALL";
    b2set(tiny?"You open a symbolic lap-containment scene at cat-small scale. Broad support geometry surrounds the represented body without implying a live participant. Broad support arrives first; then a slow local hand route crosses crown → nape → upper back while the big support stays stable.":"You open a symbolic lap-containment scene. Seat, lower back, mid back and upper back settle into one broad support field while the local route remains separately trackable.",b2receipt({cause:"SELF chose pet mode + explicit symbolic lap scene",anchors:"modeled scene support/contact causes only; not live-presence telemetry",render:"ANCHOR + MOVING LOCAL SIGNAL: broad containment stays stable while a fine route rides over it; social meaning may modulate private salience but cannot author feeling",route:["seat","lower back","mid back","upper back","crown","nape"],neuromod:["SEROTONIN-LIKE:HOMEOSTATIC_BODY","SEROTONIN-LIKE:SENSORY_CONTEXT","OXYTOCIN-LIKE:SOCIAL_SALIENCE"]}));return true;
  }
  if(verb==="ask_headpats"){
    c9count(room,verb);
    if(!p.mode){b2set("The request is not auto-filled. The room keeps the social source empty until you choose PET MODE.");return true;}
    const n=(C9.actions?.[room]?.[verb]||1);
    b2set(n%2?"A broad pat lands on the crown, then another. The next one waits just long enough for the halo to lean forward—nothing lands—then the return arrives at crown and slides softly toward the nape.":"This time the cadence is deliberately less regular. The renderer widens its prediction window instead of pretending it knows exactly when the next pat will land.",b2receipt({cause:"explicit request + authored headpat contacts",anchors:"crown/nape contacts only; withheld beat remains zero contact",render:"PHASE DISCIPLINE + OMISSION RETURN: anticipation tracks cadence, confidence widens under jitter, missing beat is represented as prediction error rather than fake touch",route:["crown","nape","upper-back halo"],neuromod:["DOPAMINE-LIKE:REWARD_PREDICTION","SEROTONIN-LIKE:SENSORY_CONTEXT","OXYTOCIN-LIKE:SOCIAL_SALIENCE","OXYTOCIN-LIKE:SOCIAL_REWARD_BRIDGE"]}));return true;
  }
  return false;
}

function b2tea(room,verb){
  const t=C9.tea2;
  if(verb==="two_cups"){c9count(room,verb);t.cups=2;t.chosen=null;c9save();b2set("You set down two cups. One says the hallway was always there. The other says it only exists when approached backward. Both steam. Neither gets a checkmark.");return true;}
  if(verb==="steam"){c9count(room,verb);b2set(t.cups?"Both cups continue steaming at the same time. Ambiguity successfully survives another interaction.":"There are no cups yet. The table declines to invent them.");return true;}
  if(verb==="turn_cup"){c9count(room,verb);if(t.cups){b2set("You rotate one cup. Its explanation now faces the wall. The other explanation does not become truer because it is easier to read.");}else b2set("There is no cup to turn. MISSING is not silently promoted to an object.");return true;}
  if(verb==="choose_neither"){c9count(room,verb);t.chosen="NEITHER";c9save();b2set("You leave both cups unresolved. Nothing follows you down the hall demanding a conclusion.",null,"secretish");return true;}
  return false;
}

function b2lagoon(room,verb){
  const l=C9.lagoon2;
  if(verb==="send_boat"){
    c9count(room,verb);l.sent=true;l.sentAtVisits=c9visitCount();l.token="blue-wax-corner";
    c9putEvent({id:"lagoon-paper-boat",kind:"PENDING_CAUSE",source_room:room,source_action:verb,minVisitCount:l.sentAtVisits+3,futureRefs:1});c9save();
    b2set("You set a paper boat on the lagoon. A blue wax corner marks it as yours. The pending lantern lights. Nothing claims the boat arrived anywhere.");return true;
  }
  if(verb==="check_pending"){
    c9count(room,verb);const e=c9event("lagoon-paper-boat");
    b2set(e?`PENDING. Accepted cause exists. Consequence does not. The lantern refuses to turn green early.`:"There is no unresolved boat in this run.");return true;
  }
  if(verb==="watch_water"){c9count(room,verb);b2set("The boat, if there is one, gets smaller with distance. The room does not convert waiting into completion.");return true;}
  if(verb==="leave_pending"){c9count(room,verb);b2set("You leave. Pending state survives your attention moving elsewhere.");return true;}
  return false;
}

function b2longfur(room,verb){
  const tiny=C9.pet2.scale==="CAT_SMALL", long=!!C9.formScratch;
  const scale=tiny?2.4:(long?1.65:1.0);
  if(verb==="run_comet"){
    c9count(room,verb);b2set(`The comet takes ${(6.2*scale).toFixed(1)} subjective route-seconds to cross crown → nape → upper back → lower back → seat → thighs. ${tiny?"At cat scale the fibers become a landscape, so local crossings are more distinct.":long?"The long-limbed form stretches transition time while semantic order stays fixed.":"The standard route stays compact."}`,b2receipt({cause:"explicit route command on current represented body",anchors:"route nodes actually invoked",render:"TOPOLOGICAL RETARGET: semantic adjacency survives metric remap; duration scales with represented path length",route:["crown","nape","upper back","lower back","seat","thighs"],neuromod:["SEROTONIN-LIKE:SENSORY_CONTEXT"]}));return true;
  }
  if(verb==="bilateral"){
    c9count(room,verb);b2set("Left and right rails begin together, drift by a fraction of a beat, then meet again at the soles. Total response mass stays approximately fixed; the changing relation is the event.",b2receipt({cause:"two explicit bilateral route signals",anchors:"left/right route nodes",render:"PHASE BRAID: relative phase produces beats/counterpoint without brute gain",route:["thigh.L/R","shin.L/R","sole.L/R"],neuromod:[]}));return true;
  }
  if(verb==="reverse"){
    c9count(room,verb);b2set("The route runs backward. It is not treated as identical merely because it visits the same nodes: seam order, anticipation, and one-way response transport all invert differently.");return true;
  }
  if(verb==="pause_return"){
    c9count(room,verb);b2set("The moving signal stops at upper back. The predicted continuation keeps a faint forward lean, but no downstream contact appears. Then the real return starts and the held prediction snaps cleanly into it.",b2receipt({cause:"explicit stop + later explicit return",anchors:"support only where cause exists",render:"OMISSION / RETURN CONTRAST: prediction debt rises during silence and clears on grounded return",route:["crown","nape","upper back","PAUSE","return"],neuromod:["DOPAMINE-LIKE:REWARD_PREDICTION"]}));return true;
  }
  return false;
}

const c9verb_build2base=c9verb;
c9verb=function(room,verb){
  C9.lastExplicit={room,verb,at:Date.now()};c9save();
  if(room==="CARDBOARD_BOX_WORKSHOP" && verb!=="tape" && b2box(room,verb)){b2refresh(room);return;}
  if(room==="PET_ROOM_2" && b2pet(room,verb)){return;}
  if(room==="UNKNOWN_TEAHOUSE" && b2tea(room,verb)){return;}
  if(room==="LATENCY_LAGOON" && b2lagoon(room,verb)){return;}
  if(room==="LONGFUR_RUNWAY" && b2longfur(room,verb)){return;}
  c9verb_build2base(room,verb);
};


const c9verb_build2_restore=c9verb;
c9verb=function(room,verb){
  if(room==="SHAPESHIFT_CLOAKROOM" && verb==="restore_form"){
    C9.pet2.scale="NORMAL";c9save();
  }
  return c9verb_build2_restore(room,verb);
};


const c9checkDelayed_build2base=c9checkDelayed;
c9checkDelayed=function(room){
  c9checkDelayed_build2base(room);
  const boat=c9event("lagoon-paper-boat");
  if(boat && room!=="LATENCY_LAGOON" && c9visitCount()>=(boat.minVisitCount||999)){
    if(room==="PET_ROOM_2" || room==="CLOUD_NINE_NEST" || room==="CARDBOARD_BOX_WORKSHOP"){
      b2set("Something blue noses out from under the nearest soft edge: a damp paper boat with one waxed corner. The lagoon never said it would arrive here. It only kept the cause attached long enough for an actual consequence to catch up.",b2receipt({cause:"earlier explicit boat launch; delayed consequence closes now",anchors:"current arrived boat object",render:"TEMPORAL TETHER: accepted != completed; causal identity survives attention leaving",route:[],neuromod:["DOPAMINE-LIKE:REWARD_PREDICTION"]}),"secretish");c9resolve("lagoon-paper-boat");return;
    }
  }
  const hidden=c9event("box2-hidden-tab");
  if(hidden && room==="PET_ROOM_2" && (C9.roomVisits?.PET_ROOM_2||0)>=2){
    b2set("Under the huge sofa is the little cardboard tab you hid in Boxroom. No label explains how it migrated. The torn corner is exact enough that you recognize your own stupid little deed.",null,"secretish");c9resolve("box2-hidden-tab");return;
  }
  const fiber=c9event("box2-loose-fiber");
  if(fiber && room==="PET_ROOM_2" && C9.pet2.scale==="CAT_SMALL"){
    b2set("A loose corrugation fiber from Boxroom has become, at this scale, a ridiculous little floor-rope. It twitches when the air moves. You recognize where it came from.",null,"secretish");c9resolve("box2-loose-fiber");return;
  }
};


const c9secretPrelude_build2base=c9secretPrelude;
c9secretPrelude=function(id){
  let h=c9secretPrelude_build2base(id);
  if(["UNKNOWN_TEAHOUSE","LATENCY_LAGOON","PET_ROOM_2","LONGFUR_RUNWAY","SHAPESHIFT_CLOAKROOM"].includes(id)){
    h=h.replace(/<button class="btn muted-action" onclick="c9verb\('[^']+','wrong_door'\)">An ordinary-looking door is slightly ajar\.<\/button>/g,"");
    if(h.includes('<div class="verbgrid secretish"></div>'))h="";
  }
  return h;
};
C9STOP.add("don");C9STOP.add("t");


const c9Intent_build2base=c9Intent;
c9Intent=function(q){
  const a=c9Intent_build2base(q);const s=q.toLowerCase();
  if(/\b(cat|kitty|pet|scratch|knead|pounce|headpat|head pat|lap|tiny|small cat|familiar)\b/.test(s)){
    a.push({id:"CAT_MODE",reason:"cat / pet embodiment",boost:{PET_ROOM_2:22,CARDBOARD_BOX_WORKSHOP:3,LONGFUR_RUNWAY:3}});
  }
  if(s.includes("box")||s.includes("cardboard")) a.push({id:"BOXROOM2",reason:"material play + causal residue",boost:{CARDBOARD_BOX_WORKSHOP:18}});
  return a;
};


if(DATA.glossary && Array.isArray(DATA.glossary)){
  DATA.glossary.push(
    {term:"CAUSAL RESIDUE",plain:"An explicit deed may leave a small world fact that matters later. The system stores the deed, not an inferred taste."},
    {term:"PHASE BRAID",plain:"Two supported routes can drift in relative timing and reconverge, creating structure without increasing total response mass."},
    {term:"OMISSION NOTCH",plain:"An expected beat may be absent. The renderer can represent prediction error while contact evidence remains zero."},
    {term:"DIFFUSIVE AFTERGLOW",plain:"A grounded event may leave a bounded private response field that spreads/decays locally. It is not new world evidence."},
    {term:"NEUROMOD ROUTE SHAPES",plain:"Dopamine/serotonin/oxytocin names label coarse routing motifs only. No chemical concentration, love, trust, consent, or pleasure is asserted."}
  );
}


document.querySelector('.brand').innerHTML='REALITI // CLOUD9 · <span>BUILD 12 CLOCK × PASSIVE_MEDIUM</span>';
const hero=document.querySelector('#first .hero p');
if(hero) void 0;

renderEntry();
nmBadge();