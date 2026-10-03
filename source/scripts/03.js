const C9KEY="cloud9-first-contact-v5-build2";
function c9load(){
  const d={v:5,currentRoom:"CLOUD_NINE_NEST",roomVisits:{CLOUD_NINE_NEST:1},actions:{},events:[],discoveries:{},
           weird:{},buttonCount:0,bell:null,feedback:[]};
  try{
    const x=JSON.parse(realitiSafeLoad(C9KEY)||"null");
    if(x&&x.v===5) return Object.assign(d,x);
  }catch(e){}
  return d;
}
let C9=c9load();
function c9save(){
  
  C9.events=(C9.events||[]).filter(e=>e.open||e.keep).slice(-12);
  realitiSafeStore(C9KEY,JSON.stringify(C9));
}
function c9count(room,verb){
  C9.actions[room]=C9.actions[room]||{};
  C9.actions[room][verb]=(C9.actions[room][verb]||0)+1;
  c9save();
  return C9.actions[room][verb];
}
function c9totalActions(){
  return Object.values(C9.actions||{}).reduce((n,o)=>n+Object.values(o).reduce((a,b)=>a+b,0),0);
}
function c9visitCount(){return Object.keys(C9.roomVisits||{}).length}
function c9event(id){return (C9.events||[]).find(e=>e.id===id&&e.open)}
function c9putEvent(e){
  const old=(C9.events||[]).find(x=>x.id===e.id&&x.open);
  if(!old) C9.events.push(Object.assign({open:true,keep:false},e));
  c9save();
}
function c9resolve(id){
  const e=(C9.events||[]).find(x=>x.id===id&&x.open);
  if(e){e.open=false;c9save()}
}
function c9setConsequence(text, cls=""){
  const el=document.querySelector("#c9_consequence");
  if(el){el.className="consequence "+cls;el.innerHTML=text}
}
function c9escape(x){return esc(x)}
function c9hash(s){
  let h=2166136261;
  for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}
  return h>>>0;
}

const C9SCENES={
  CLOUD_NINE_NEST:{
    intro:"A warm rain window, a giant cloud mattress, and blankets that are allowed to stay exactly where you leave them.",
    verbs:[
      ["curl_blanket","CURL UNDER A BLANKET"],
      ["arrange_blanket","REARRANGE A BLANKET"],
      ["watch_rain","WATCH RAIN"],
      ["do_nothing","DO NOTHING"]
    ]
  },
  NO_ASK_SANCTUARY:{
    intro:"Nothing is waiting for a reply. The room does not become disappointed if you sit here and produce nothing.",
    verbs:[
      ["curl_up","CURL UP"],
      ["watch_rain","WATCH RAIN"],
      ["move_pillow","MOVE A PILLOW"],
      ["do_nothing","DO NOTHING"]
    ]
  },
  CARDBOARD_BOX_WORKSHOP:{
    intro:"Cardboard, tape, chalk, string, and tiny soft-physics junk are already within reach.",
    verbs:[
      ["stack","STACK"],
      ["tape","TAPE"],
      ["poke","POKE"],
      ["knock","KNOCK OVER"]
    ]
  },
  DEPTH_BATHHOUSE:{
    intro:"The pool has several simultaneous depths: heavy warmth below, honey-current in the middle, and fine mist at the surface.",
    verbs:[
      ["sink","SINK ONE LAYER DEEPER"],
      ["float","LET THE SHELF HOLD YOU"],
      ["stir","STIR THE HONEY CURRENT"],
      ["surface","COME BACK TO THE SURFACE"]
    ]
  },
  BOTTOMLESS_PILLOW_SEA:{
    intro:"A pillow ocean slopes away into soft gravity bowls and fur-lined gaps.",
    verbs:[
      ["dive","DIVE"],
      ["burrow","BURROW"],
      ["bounce","BOUNCE"],
      ["listen","STOP AND LISTEN"]
    ]
  },
  SIDE_BY_SIDE_FIRESIDE:{
    intro:"The second berth is empty unless a grounded participant is actually here. Silence is still a complete room state.",
    verbs:[
      ["sit","SIT BY THE FIRE"],
      ["window","MOVE TO THE RAIN WINDOW"],
      ["mug","FIDDLE WITH THE MUG"],
      ["nothing","DO NOTHING"]
    ]
  },
  WOAH_GARDEN:{
    intro:"Small fuzzy seams cross the garden at odd angles. Most of them are probably nothing.",
    verbs:[
      ["poke_seam","POKE THE WEIRD SEAM"],
      ["walk_backward","APPROACH ONE BACKWARD"],
      ["wait","WAIT"],
      ["leave_it","LEAVE IT ALONE"]
    ]
  }
};

const C9CONSEQUENCES={
  CLOUD_NINE_NEST:{
    arrange_blanket:["You pull one corner higher. It stays that way.","You make an unnecessary blanket ridge. The ridge persists."],
    watch_rain:["Rain crawls down the glass at several different speeds.","One drop overtakes another and wins absolutely nothing."],
    do_nothing:["Nothing requests an answer.","The rain keeps happening without checking whether you noticed."]
  },
  NO_ASK_SANCTUARY:{
    curl_up:["The nearest cushion yields and stops moving.","You occupy the room. The room does not ask what that means."],
    watch_rain:["A warm line of rain moves across the far window.","No prompt appears afterward."],
    move_pillow:["The pillow moves. It remains where you put it.","You rotate it ninety degrees. Nobody grades the arrangement."],
    do_nothing:["...","The room successfully handles your continued existence."]
  },
  CARDBOARD_BOX_WORKSHOP:{
    stack:["Two boxes become a tower. The top one leans a little.","A new box goes on top. The tower becomes less reasonable."],
    tape:["Tape now connects two things that had no business being connected.","The tape holds. This creates consequences but no achievement."],
    poke:["The cardboard dents inward and keeps the dent.","Your finger leaves a tiny triangular crease."],
    knock:["The tower goes <b>fwump.</b> Nothing scores the collapse.","Several boxes tumble into a new accidental sculpture."]
  },
  DEPTH_BATHHOUSE:{
    sink:["The deep layer takes more of the support load while the surface mist stays fine.","You descend without getting heavier; the depth relationships change around you."],
    float:["Support arrives from directions a normal chair does not have.","The shelf holds without choosing one pressure point to call 'down'."],
    stir:["The middle current folds around the disturbance and keeps moving after your hand stops.","Honey-current curls through the deep layer without erasing the surface mist."],
    surface:["The heavy layer recedes first; the fine surface layer is the last thing left.","You return upward without the room pretending the deeper layers never happened."]
  },
  BOTTOMLESS_PILLOW_SEA:{
    dive:["The pillows separate, then close softly above the route you took.","You vanish under the surface and emerge three cushion-lengths away."],
    burrow:["A fur tunnel forms only as far ahead as you need it.","The tunnel bends around something soft you cannot quite see."],
    bounce:["The nearest gravity bowl gives you back slightly less than you gave it.","You bounce sideways because the bowl is shaped wrong in a delightful way."],
    listen:["Most of the sea is quiet. Something very far away goes <i>whump.</i>","Fabric shifts somewhere below you, then stops."]
  },
  SIDE_BY_SIDE_FIRESIDE:{
    sit:["Your berth settles closer to the heat. The other berth remains honestly empty.","You sit. Nothing interprets silence as a disconnect."],
    window:["Rain becomes louder than the fire for a while.","You move to the window. The room keeps existing around the change."],
    mug:["The mug turns slowly in your hands. It is warm, ordinary, and sufficient.","You put the mug down slightly off-center. It stays there."],
    nothing:["The fire changes shape without needing a conversational turn.","Nobody speaks. Nothing breaks."]
  },
  WOAH_GARDEN:{
    poke_seam:["The seam moves half a finger-width away from the poke.","The seam briefly becomes easier to see, which is somehow less helpful."],
    walk_backward:["The seam stays in front of you longer than geometry seems entitled to.","For three steps, the angle is wrong. On the fourth, it behaves."],
    wait:["One tiny fuzzy edge twitches after you've already decided nothing is happening.","Nothing happens for long enough to become part of the event."],
    leave_it:["You leave it alone. It is not offended.","The oddity remains unresolved and the world continues."]
  }
};

function c9sceneFor(id,x){
  return C9SCENES[id]||{
    intro:x?.r?.purpose||"You arrive.",
    verbs:[["look","LOOK AROUND"],["stay","STAY A MOMENT"]]
  };
}

function c9secretPrelude(id){
  let bits=[];
  
  if(id==="CARDBOARD_BOX_WORKSHOP" && c9totalActions()>=4 && C9.buttonCount<5){
    bits.push(`<button class="btn muted-action" onclick="c9verb('${id}','red_button')">There is also a red button under one box.</button>`);
  }
  if(id==="WOAH_GARDEN" && (C9.actions?.WOAH_GARDEN?.poke_seam||0)>=1 && (C9.actions?.WOAH_GARDEN?.wait||0)>=1){
    bits.push(`<button class="btn muted-action" onclick="c9verb('${id}','small_bell')">A tiny bell is hanging from something that was not a branch a moment ago.</button>`);
  }
  if(c9visitCount()>=3 && !C9.discoveries.wrongDoor && c9totalActions()>=7){
    bits.push(`<button class="btn muted-action" onclick="c9verb('${id}','wrong_door')">An ordinary-looking door is slightly ajar.</button>`);
  }
  return bits.length?`<div class="verbgrid secretish">${bits.join("")}</div>`:"";
}

function c9roomHTML(id){
  const x=roomById(id); if(!x)return "";
  const scene=c9sceneFor(id,x);
  const committed=C9.weird?.[id];
  const presence = id==="SIDE_BY_SIDE_FIRESIDE"
    ? `<div class="soft-presence"><span class="presence-chip you">YOU · grounded</span><span class="presence-chip">OTHER BERTH · empty</span></div>`
    : "";
  return `<div class="ey">${c9escape(x.w.name)} · LIVE ROOM</div>
    <h1>${c9escape(x.r.title)}</h1>
    <div class="live-scene">
      <div class="scene-text">${c9escape(scene.intro)}</div>
      ${presence}
      ${committed?`<div class="notice">A reversible oddity you committed is still active here: <b>${c9escape(committed.label)}</b>.</div>`:""}
      <div class="verbgrid">${scene.verbs.map(v=>`<button class="btn primary" onclick="c9verb('${id}','${v[0]}')">${c9escape(v[1])}</button>`).join("")}</div>
      ${c9secretPrelude(id)}
      <div class="consequence" id="c9_consequence">Pick something. Or don't.</div>
      <div class="actions">
        <button class="btn" onclick="c9makeWeird('${id}')">MAKE THIS WEIRD</button>
        <button class="btn" onclick="c9showInfo('${id}')">ABOUT THIS PLACE</button>
      </div>
    </div>`;
}

function openRoomId(id){
  const x=roomById(id); if(!x)return;
  C9.currentRoom=id;
  C9.roomVisits[id]=(C9.roomVisits[id]||0)+1;
  c9save();
  modal(c9roomHTML(id));
  setTimeout(()=>c9checkDelayed(id),20);
}

function c9showInfo(id){
  const x=roomById(id); if(!x)return;
  modal(`<div class="ey">${c9escape(x.w.name)} · OPTIONAL DESCRIPTION</div>
    <h1>${c9escape(x.r.title)}</h1><p>${c9escape(x.r.purpose)}</p>
    <div>${(x.r.features||[]).map(f=>`<span class="tag">${c9escape(f)}</span>`).join("")}</div>
    <div class="actions"><button class="btn primary" onclick="openRoomId('${id}')">Back to doing things</button></div>`);
}

function c9pick(arr,room,verb,n){
  return arr[c9hash(room+"|"+verb+"|"+n)%arr.length];
}
function c9verb(room,verb){
  const n=c9count(room,verb);
  const arr=C9CONSEQUENCES?.[room]?.[verb];
  if(arr)c9setConsequence(c9pick(arr,room,verb,n));

  if(room==="CLOUD_NINE_NEST" && verb==="curl_blanket"){
    if(c9visitCount()>=3 && c9totalActions()>=8){
      C9.discoveries.underblanket=true;c9save();
      c9setConsequence("The blanket should stop after thirty centimeters. It doesn't. There is warm fabric landscape on the other side, and the blanket edge is still behind you.","secretish");
    }else{
      c9setConsequence("You crawl under the blanket. It is, for the moment, exactly as blanket-sized as expected.");
    }
  }

  if(verb==="red_button"){
    C9.buttonCount=Math.min(5,(C9.buttonCount||0)+1);
    if(C9.buttonCount<=2)c9setConsequence("Click.<br><br>Nothing happens here.","secretish");
    else {
      c9setConsequence("Click.<br><br>Still nothing happens <i>here</i>.","secretish");
      c9putEvent({id:"red-button-distant",kind:"DELAYED_CONSEQUENCE",afterRoom:"BOTTOMLESS_PILLOW_SEA",futureRefs:1});
    }
    c9save();
  }

  if(verb==="small_bell"){
    const now=performance.now();
    C9.bell=C9.bell||{t0:now,taps:[]};
    C9.bell.taps.push(Math.round(now-C9.bell.t0));
    C9.bell.taps=C9.bell.taps.slice(-6);
    c9setConsequence(`ting.${C9.bell.taps.length>=3?" The bell seems satisfied with that little pattern.":""}`,"secretish");
    if(C9.bell.taps.length>=3)c9putEvent({id:"memory-bell",kind:"EXPLICIT_RHYTHM",taps:C9.bell.taps.slice(),futureRefs:1});
    c9save();
  }

  if(verb==="wrong_door"){
    C9.discoveries.wrongDoor=true;c9save();
    c9setConsequence("The door opens onto the side of a cloudfall shaft. The floor is still under your feet. Far below, pillows drift upward as if gravity has forgotten which argument it was making. You can close the door.","secretish");
  }

  
  if(["stack","tape","poke","knock","poke_seam","wait"].includes(verb)){
    const old=document.querySelector("#modalbox");
    if(old){
      const last=document.querySelector("#c9_consequence")?.innerHTML||"";
      const html=c9roomHTML(room);
      old.innerHTML=`<button class="btn" onclick="closeModal()">Close</button>${html}`;
      const ce=document.querySelector("#c9_consequence");if(ce)ce.innerHTML=last;
    }
  }
}

function c9checkDelayed(room){
  const red=c9event("red-button-distant");
  if(room==="BOTTOMLESS_PILLOW_SEA" && red){
    c9setConsequence("Somewhere beyond the visible pillow horizon: <b>BONK.</b><br>A gigantic soft cube drops out of nowhere, bounces once, and slowly disappears between the cushions.","secretish");
    c9resolve("red-button-distant");
  }
  const bell=c9event("memory-bell");
  if(bell && room!=="WOAH_GARDEN" && c9visitCount()>=4){
    const taps=(bell.taps||[]).slice(0,5);
    c9setConsequence(`Very faintly, from somewhere that is not this room: ${taps.map((_,i)=>i===1?"…":"ting").join("  ")}<br><span class="tiny muted">The rhythm is recognizably yours, except for one missing beat.</span>`,"secretish");
    c9resolve("memory-bell");
  }
}

const C9WEIRD=[
  {id:"gravity_sideways",label:"gravity is ninety degrees less certain",text:"The room tilts without the furniture falling. One wall begins behaving like an optional floor."},
  {id:"time_echo",label:"small actions leave delayed echoes",text:"A tiny version of your last movement repeats a moment late, then stops."},
  {id:"inside_out",label:"one boundary has become two-sided",text:"For a moment, the nearest edge seems equally reachable from both of its sides."},
  {id:"soft_occlusion",label:"objects keep existing behind softness",text:"A soft barrier hides part of the room, but sounds and consequences continue behind it."},
  {id:"contradictory_route",label:"two routes remain possible at once",text:"Two incompatible-looking paths both remain locally valid until you actually choose one."}
];
function c9makeWeird(room){
  const snap=C9.weird?.[room]||null;
  const idx=c9hash(room+"|"+(c9totalActions()+1))%C9WEIRD.length;
  const w=C9WEIRD[idx];
  modal(`<div class="ey">REVERSIBLE MISCHIEF</div><h1>${c9escape(w.label)}</h1>
    <div class="weirdbox">${c9escape(w.text)}</div>
    <p class="muted">This is a scratch branch. It is not permanent unless you commit it.</p>
    <div class="actions">
      <button class="btn primary" onclick="c9commitWeird('${room}','${w.id}')">KEEP IT FOR NOW</button>
      <button class="btn" onclick="openRoomId('${room}')">DISCARD</button>
    </div>`);
}
function c9commitWeird(room,wid){
  const w=C9WEIRD.find(x=>x.id===wid); if(!w)return;
  C9.weird[room]={id:w.id,label:w.label};c9save();openRoomId(room);
}


renderEntry=function(){
  document.querySelector("#entrycards").innerHTML=FIRST.entry_cards.map(c=>`
    <div class="card"><div class="ey">FIRST-VISIT AFFORDANCE</div>
      <h3>${esc(c.label)}</h3><p>${esc(c.why||c.guard||"")}</p>
      <div class="actions"><button class="btn primary" onclick="openRoomId('${c.target}')">Enter</button></div>
    </div>`).join("");
  document.querySelector("#tour").innerHTML=FIRST.recommended_soft_tour.map(id=>{
    const x=roomById(id);
    return `<button class="card step" onclick="openRoomId('${id}')">
      <div class="ey">${x?esc(x.w.name):"Cloud9"}</div><h3>${x?esc(x.r.title):esc(id)}</h3>
      <div class="tiny muted">${x?"enter without preview":"unresolved"}</div></button>`;
  }).join("");
};


function c9roomBlob(r){return [r.title,r.kind,r.purpose,r.features,r.search_tags].flat(Infinity).join(" ").toLowerCase()}
const C9SEM={
  "company":["company","together","someone","social","talking","silence","quiet"],
  "without talking":["silence","without","talking","company","presence"],
  "impossible comfort":["impossible","comfort","depth","support","float","gravity","soft"],
  "weird":["weird","odd","surprise","strange","novel"],
  "nothing":["nothing","no demand","quiet","alone","rest"],
  "play":["play","pointless","make","toy","creative"],
  "explore":["explore","wander","dive","burrow","discover"]
};
function c9tokens(q){
  let out=toks(q);
  const s=q.toLowerCase();
  for(const [phrase,extra] of Object.entries(C9SEM))if(s.includes(phrase))out=out.concat(extra);
  return [...new Set(out.filter(x=>x.length>1))];
}
function c9score(q,b){
  const Q=c9tokens(q), B=new Set(toks(b)); if(!Q.length)return {s:0,hits:[]};
  const hits=[];let raw=0;
  for(const t of Q){if(B.has(t)){raw+=3;hits.push(t)}else if(b.includes(t)){raw+=1;hits.push(t)}}
  return {s:raw/Q.length,hits:[...new Set(hits)].slice(0,4)};
}
function c9roomSuggest(q){
  const a=[];
  for(const w of DATA.worlds)for(const r of w.rooms){
    const z=c9score(q,c9roomBlob(r));
    if(z.s>0)a.push({w,r,s:z.s,hits:z.hits});
  }
  return a.sort((a,b)=>b.s-a.s).slice(0,5);
}
function c9presetSuggest(q){
  return DATA.preset_library.presets.map(p=>{const z=c9score(q,blob(p));return {p,s:z.s,hits:z.hits}})
    .filter(x=>x.s>0).sort((a,b)=>b.s-a.s).slice(0,4);
}
runSuggest=function(){return null;};


function c9touchAxis(k){return null;}
function c9enableAxis(k){return null;}
function c9unsetAxis(k){return null;}
openFeedback=function(){return null;};
saveSkip=function(status){return null;};
saveRated=function(){return null;};

renderEntry();