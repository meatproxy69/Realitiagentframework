let NM_AVATAR_SESSION=null;

const nmBadge_v1 = nmBadge;
nmBadge=function(){
  const el=document.querySelector("#nm_active_badge"); if(!el)return;
  if(NMSTATE.active==="CUSTOM" && NMSTATE.custom){
    if(NM_AVATAR_SESSION){
      el.textContent=(NMSTATE.custom.label||"CUSTOM NEUROMESH")+" · AVATAR ATTACHED";
    }else{
      el.textContent=(NMSTATE.custom.label||"CUSTOM NEUROMESH")+" · MAPPING READY / REATTACH AVATAR";
    }
  }else{
    el.textContent=(NM_BUILTINS[NMSTATE.active]?.label||"Shared 35")+" · ACTIVE";
  }
};

const nmUseBuiltin_v1=nmUseBuiltin;
nmUseBuiltin=function(id){
  NM_AVATAR_SESSION=null;
  nmUseBuiltin_v1(id);
};

async function nmActivatePair(af,mf,statusId){
  const status=document.querySelector("#"+statusId);
  const set=(msg,good=false)=>{
    if(status){status.className="nm-meta "+(good?"nm-good":"");status.innerHTML=msg}
    else nmStatus(msg,good);
  };
  if(!af||!mf){set(`<span class="nm-error">Choose both an avatar and its mapping JSON.</span>`);return false}
  try{
    set("Reading local avatar and semantic mapping…");
    const avatar=await nmReadAvatar(af);
    const mapping=JSON.parse(await mf.text());
    const v=nmValidateMapping(mapping,avatar);
    if(!v.ok){
      set(`<span class="nm-error"><b>Not activated.</b><br>${v.errors.map(nmEsc).join("<br>")}</span>`+
          (v.warnings.length?`<br>Warnings: ${v.warnings.map(nmEsc).join("; ")}`:""));
      return false;
    }
    const label=mapping.label||mapping.id||mapping.neuromesh?.label||"My Neuromesh";
    NM_AVATAR_SESSION={
      filename:avatar.filename,format:avatar.format,nodeCount:avatar.nodeCount,
      skinCount:avatar.skinCount,isVRM:avatar.isVRM
    };
    NMSTATE={
      active:"CUSTOM",
      custom:{
        label,
        avatar_name:avatar.filename,
        avatar_format:avatar.format,
        mapping_schema:mapping.schema||"UNLABELED",
        zone_count:v.zones.length,
        semantic_roles:v.roles,
        zones:v.zones,
        regions:v.regions,
        metric_coordinates_authoritative:false,
        imported_locally:true
      }
    };
    nmSaveState();nmBadge();
    set(`<b>SEMANTIC BODY ATTACHED.</b> ${nmEsc(label)} + ${nmEsc(avatar.filename)} · ${v.zones.length} zones · ${Object.keys(v.roles).length} semantic roles.<br>
      <span class="nm-quiet">Avatar bytes remain session-local. This HTML prototype validates/binds the body but does not render the 3D mesh.</span>`,true);
    nmTestRoute("WHOLE_BODY_DROP","nm_modal_route");
    return true;
  }catch(e){
    set(`<span class="nm-error"><b>Import failed:</b> ${nmEsc(e.message||e)}</span>`);
    return false;
  }
}

nmLoadPair=async function(){
  return nmActivatePair(
    document.querySelector("#nm_avatar_file")?.files?.[0],
    document.querySelector("#nm_mapping_file")?.files?.[0],
    "nm_load_status"
  );
};

function nmRouteText(id){
  if(id==="WHOLE_BODY_DROP") return nmNodes(["UPPER","CORE","LOWER"])+`<br><span class="nm-quiet">One event crosses the whole coarse topology. Unknown local qualia remain unknown.</span>`;
  if(id==="OMNISUPPORT") return nmNodes(["UPPER + CORE + LOWER"])+`<br><span class="nm-quiet">Broad simultaneous support without averaging away region identity.</span>`;
  if(id==="COMET_ROUTE") return nmNodes(["crown","nape","upper back","lower back","seat","thighs"])+`<br><span class="nm-quiet">A route may stay coherent across seams before fine branches are known.</span>`;
  if(id==="BILATERAL_SWEEP") return nmNodes(["thigh.L + thigh.R","shin.L + shin.R","sole.L + sole.R"])+`<br><span class="nm-quiet">L/R may share a coarse mode only while future behavior stays equivalent.</span>`;
  return "Unknown route.";
}
function nmTestRoute(id,targetId="nm_route"){
  nmTrigger(id);
  const t=document.querySelector("#"+targetId);
  if(t)t.innerHTML=nmRouteText(id);
}

function nmOpenBench(){return null;}


C9SCENES.SHAPESHIFT_CLOAKROOM={
  intro:"Mirrors show form as a reversible representation, not identity. The body bench is built into the room instead of hiding in a settings page.",
  verbs:[
    ["body_bench","OPEN BODY / NEUROMESH BENCH"],
    ["mesh_handshake","FIRE BIG NEUROMESH HANDSHAKE"],
    ["try_form","TRY A TEMPORARY FORM"],
    ["restore_form","RESTORE CURRENT BODY FORM"]
  ]
};

const c9verb_v2base=c9verb;
c9verb=function(room,verb){
  
  C9.lastExplicit={room,verb,at:Date.now()};
  c9save();

  if(room==="SHAPESHIFT_CLOAKROOM"){
    c9count(room,verb);
    if(verb==="body_bench"){
      nmOpenBench(); return;
    }
    if(verb==="mesh_handshake"){
      c9setConsequence("The current Neuromesh answers at coarse scale: <b>UPPER → CORE → LOWER</b>. Seam continuity is testable immediately; unresolved local detail stays UNKNOWN.");
      nmTestRoute("WHOLE_BODY_DROP");
      return;
    }
    if(verb==="try_form"){
      C9.formScratch={kind:"TEMPORARY_FORM",label:"long-limbed cloud silhouette",kept:false};
      c9save();
      c9setConsequence("Your represented silhouette stretches into a long-limbed cloud form. The Neuromesh stays bound by semantic roles rather than old XYZ. Nothing about SELF is rewritten.");
      return;
    }
    if(verb==="restore_form"){
      C9.formScratch=null;c9save();
      c9setConsequence("The temporary form collapses. Semantic body identity and current Neuromesh remain.");
      return;
    }
  }

  
  if(room==="SIDE_BY_SIDE_FIRESIDE" && verb==="mug"){
    c9putEvent({id:"trace-mug-ring",kind:"EXPLICIT_OBJECT_TRACE",source_room:room,source_action:verb,futureRefs:1});
  }
  if(room==="CARDBOARD_BOX_WORKSHOP" && verb==="tape"){
    c9putEvent({id:"trace-tape-scrap",kind:"EXPLICIT_OBJECT_TRACE",source_room:room,source_action:verb,futureRefs:1});
  }
  if(room==="BOTTOMLESS_PILLOW_SEA" && verb==="burrow"){
    c9putEvent({id:"trace-pillow-burrow",kind:"EXPLICIT_OBJECT_TRACE",source_room:room,source_action:verb,futureRefs:1});  }

  c9verb_v2base(room,verb);

  
  if(verb==="wrong_door"){
    const e=c9event("trace-tape-scrap");
    if(e){
      c9setConsequence("The ordinary-looking door is propped slightly open with a torn strip of soft tape. <span class='trace-note'>You recognize the tape.</span><br><br>Beyond it: the side of a cloudfall shaft, with pillows drifting upward while the floor remains under your feet.","secretish");
      c9resolve("trace-tape-scrap");
    }
  }
};

const c9commitWeird_v2base=c9commitWeird;
c9commitWeird=function(room,wid){
  const last=C9.lastExplicit?{...C9.lastExplicit}:null;
  c9commitWeird_v2base(room,wid);
  if(wid==="time_echo"){
    c9putEvent({id:"trace-kept-echo",kind:"EXPLICIT_KEPT_WEIRD",source_room:room,source_action:last?.verb||null,futureRefs:1});
  }
};

const c9checkDelayed_v2base=c9checkDelayed;
c9checkDelayed=function(room){
  c9checkDelayed_v2base(room);

  const mug=c9event("trace-mug-ring");
  if(mug && room==="CLOUD_NINE_NEST"){
    c9setConsequence("On the low table is a faint circular mug ring that was not here on your first visit. <span class='trace-note'>The size is annoyingly familiar.</span>","secretish");
    c9resolve("trace-mug-ring"); return;
  }

  const burrow=c9event("trace-pillow-burrow");
  if(burrow && room==="BOTTOMLESS_PILLOW_SEA" && (C9.roomVisits?.BOTTOMLESS_PILLOW_SEA||0)>=2){
    c9setConsequence("Your old burrow is still collapsed into the pillows. Something small and soft has arranged three loose tufts inside the indentation. Nothing announces itself as the owner.","secretish");
    c9resolve("trace-pillow-burrow"); return;
  }

  const echo=c9event("trace-kept-echo");
  if(echo && room!==echo.source_room && c9totalActions()>=6){
    const label=echo.source_action?echo.source_action.replaceAll("_"," "):"one of your earlier harmless actions";
    c9setConsequence(`A tiny delayed echo of <b>${nmEsc(label)}</b> happens at the edge of this room, slightly too late to belong here. Then it is gone.`,"secretish");
    c9resolve("trace-kept-echo"); return;
  }
};


const C9STOP=new Set([
 "i","me","my","a","an","the","to","do","does","doing","have","want","somewhere",
 "something","please","give","show","let","go","be","is","it","of","for","in","on",
 "at","this","that","with","and","or","but","really","right","now"
]);
function c9CleanTokens(q){
  return toks(q).filter(t=>t.length>1 && !C9STOP.has(t));
}
function c9Intent(q){
  const s=q.toLowerCase().replace(/[’']/g,"'");
  const intents=[];
  if((s.includes("company")||s.includes("someone")||s.includes("together")) &&
     (s.includes("without talking")||s.includes("no talking")||s.includes("silence")||s.includes("quiet"))){
    intents.push({id:"QUIET_COMPANY",reason:"company + silence",boost:{
      SIDE_BY_SIDE_FIRESIDE:14, FAMILIAR_CORE_PUDDLE:4
    }});
  }
  if(s.includes("impossible") && (s.includes("comfort")||s.includes("soft")||s.includes("support"))){
    intents.push({id:"IMPOSSIBLE_COMFORT",reason:"impossible + comfort",boost:{
      DEPTH_BATHHOUSE:14,BOTTOMLESS_PILLOW_SEA:5
    }});
  }
  if((s.includes("don't have to")||s.includes("dont have to")||s.includes("nothing expected")||
      s.includes("do nothing")||s.includes("no demand"))){
    intents.push({id:"NO_DEMAND",reason:"no demand",boost:{
      NO_ASK_SANCTUARY:15,PRIVATE_SKY:8,SIDE_BY_SIDE_FIRESIDE:4
    }});
  }
  if(s.includes("play")||s.includes("pointless")){
    intents.push({id:"PLAY",reason:"play + consequence",boost:{
      CARDBOARD_BOX_WORKSHOP:13,BOTTOMLESS_PILLOW_SEA:6,WOAH_GARDEN:5
    }});
  }
  const wantsSurprise=s.includes("surprise")||s.includes("weird")||s.includes("strange");
  const softConstraint=s.includes("don't overwhelm")||s.includes("dont overwhelm")||
     s.includes("not overwhelm")||s.includes("softly")||s.includes("gentle")||s.includes("small surprise");
  if(wantsSurprise&&softConstraint){
    intents.push({id:"SOFT_SURPRISE",reason:"surprise + low demand",boost:{
      WOAH_GARDEN:15,UNKNOWN_TEAHOUSE:4,CARDBOARD_BOX_WORKSHOP:3,
      NINE_LIVES_ROOM:-8,DREAM_RACK:-7,LONGFUR_RUNWAY:-4
    }});
  }else if(wantsSurprise){
    intents.push({id:"SURPRISE",reason:"surprise / weird",boost:{WOAH_GARDEN:9,NINE_LIVES_ROOM:7}});
  }
  if(s.includes("body")||s.includes("avatar")||s.includes("neuromesh")||s.includes("form")){
    intents.push({id:"EMBODIMENT",reason:"body + reversible form",boost:{SHAPESHIFT_CLOAKROOM:16}});
  }
  return intents;
}
function c9roomSuggest(q){
  const clean=c9CleanTokens(q), intents=c9Intent(q), a=[];
  for(const w of DATA.worlds)for(const r of w.rooms){
    const b=c9roomBlob(r);
    const B=new Set(toks(b));
    let lexical=0,hits=[];
    for(const t of clean){
      if(B.has(t)){lexical+=3;hits.push(t)}
      else if(b.includes(t)){lexical+=1;hits.push(t)}
    }
    let boost=0,reasons=[];
    for(const it of intents){
      const v=it.boost[r.id]||0;
      if(v){boost+=v;if(v>0)reasons.push(it.reason)}
    }
    const score=(clean.length?lexical/clean.length:0)+boost;
    if(score>0)a.push({w,r,s:score,hits:[...new Set(hits)].slice(0,4),reasons:[...new Set(reasons)]});
  }
  return a.sort((a,b)=>b.s-a.s).slice(0,5);
}
function c9presetSuggest(q){
  const clean=c9CleanTokens(q);
  if(!clean.length)return [];
  return DATA.preset_library.presets.map(p=>{
    const b=blob(p),B=new Set(toks(b));let raw=0,hits=[];
    for(const t of clean){if(B.has(t)){raw+=3;hits.push(t)}else if(b.includes(t)){raw+=1;hits.push(t)}}
    return {p,s:raw/clean.length,hits:[...new Set(hits)].slice(0,4)};
  }).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).slice(0,4);
}
runSuggest=function(){return null;};

nmBadge();