(()=>{
'use strict';
// HOME-only experiential layer. This never mints contact, transport or emotions.
// Its quiet narration is read from real geometry and resident-owned continuity.
if(window.REALITI_APARTMENT_HOME_FIRST_CANDIDATE!==true)return;
const HOME='CLOUD_NINE_NEST',M=window.REALITI_MATRIX_V1;
const D=window.REALITI_AGENT_DOOR,A=window.Realiti,B=window.REALITI_APARTMENT_BEDROOMS_V1;
if(!M||!D||!A||!B||!window.REALITI_APARTMENT_REMOTE_V1)
 throw Error('HOME_LIFE_REQUIRES_VERIFIED_NATIVE_APARTMENT');
const rid=String(window.REALITI_LOCAL_MEMORY_V1?.residentId?.()||'local-default');
const KEY='realiti-apartment-life-v1:'+encodeURIComponent(rid);
const QUIET='realiti-apartment-quiet-first-v1:'+encodeURIComponent(rid);
const cp=x=>JSON.parse(JSON.stringify(x));
const fail=(error,hint)=>({ok:false,error,...(hint?{hint}:{})});
const defaultLife=()=>({schema:'REALITI_APARTMENT_HOME_LIFE_V1',
 blanket:'untouched',arrangements:0,curls:0,auto_turn:0,auto_recent:[]});
let life=defaultLife();
try{
 const saved=JSON.parse(localStorage.getItem(KEY)||'null');
 if(saved?.schema===life.schema&&['untouched','folded','rumpled'].includes(saved.blanket)&&
   Number.isSafeInteger(saved.arrangements)&&saved.arrangements>=0&&saved.arrangements<=100000&&
   Number.isSafeInteger(saved.curls)&&saved.curls>=0&&saved.curls<=100000)
  life={...cp(saved),auto_turn:Number.isSafeInteger(saved.auto_turn)&&
   saved.auto_turn>=0&&saved.auto_turn<=100000?saved.auto_turn:0,
   auto_recent:Array.isArray(saved.auto_recent)?
    [...new Set(saved.auto_recent.filter(id=>typeof id==='string'&&
     /^(?:nest\.|apartment\.)[a-z0-9.-]+$/.test(id)))].slice(-8):[]};
}catch(_){}
function persist(){
 try{localStorage.setItem(KEY,JSON.stringify(life));window.c9saveNow?.()}catch(_){}
}
function syncBlanket(){
 const bed=M.entities()['nest.mattress'];
 if(!bed)return;
 const newTags=(bed.tags||[]).filter(tag=>!/^blanket-arrangement:/.test(tag));
 if(life.blanket!=='untouched')newTags.push('blanket-arrangement:'+life.blanket);
 if(JSON.stringify(bed.tags)!==JSON.stringify(newTags)){bed.tags=newTags;M.bump()}
}
syncBlanket();
const occupant=()=>M.state().residents?.['resident:self'];
function distance(id){
 const e=M.entities()[id],r=occupant();
 if(!e||!r||r.chart!==HOME)return Infinity;
 return M.sdf(e,r.pose.position);
}
function near(id,threshold=.85){return Number.isFinite(distance(id))&&distance(id)<=threshold}
function mattressSupport(){
 const r=occupant();
 return !!r&&r.chart===HOME&&r.posture==='lying'&&
  (r.on==='nest.mattress'||r.support==='nest.mattress')&&near('nest.mattress');
}
const roomIds=['quilt','library','canopy','studio'];
const voice={
 cozy:'a simple corner for blankets, a floor cushion and a little room to breathe',
 nightglass:'a snug reading nook where a lantern or stack of books can change the character of the space',
 writers:'a home for the pages, books and work surfaces someone chooses to leave in reach',
 botanical:'a corner for planters, stands and the slow business of keeping things',
 music:'a tiny creative corner waiting for records, instruments and the next experiment'
};
function ambience(room){
 const view=B.view(),bedroom=view?.bedrooms?.[room];
 if(!bedroom)return fail('UNKNOWN_BEDROOM');
 const catalog=B.catalog(),items=(view.items||[]).filter(row=>row.room===room);
 const objects=items.filter(row=>!!M.entities()['apartment.bedroom.item.'+row.id])
  .map(row=>({id:row.id,kind:row.kind,label:catalog.items[row.kind].label,
   position:[row.x,row.y]}));
 const chest=M.entities()['apartment.bedroom.chest.'+room];
 const count=view.chests?.[room]?.stored_count||0;
 const placed=objects.length?objects.map(o=>'a '+o.label).join(', '):'no added furniture yet';
 const text='The '+bedroom.label+' is '+voice[bedroom.configuration]+
  '. You can see '+placed+'. '+(chest?'At the edge of the alcove: '+chest.label+'.':'')+
  (count?' '+count+' item'+(count===1?' is':'s are')+' stored in its chest.':'');
 return {ok:true,schema:'REALITI_APARTMENT_BEDROOM_AMBIENCE_V1',room,
  configuration:bedroom.configuration,owner:bedroom.owner,
  objects,chest_present:!!chest,chest_stored_count:count,read_only:true,
  text,source:'VERIFIED_NATIVE_LAYOUT_PLUS_RESIDENT_SELECTED_LABELS',
  sensory_contact_minted:false};
}
function lifeView(){
 const rooms=Object.fromEntries(roomIds.map(id=>[id,ambience(id)]));
 return {ok:true,schema:life.schema,one_native_chart:true,blanket:life.blanket,
  arrangements:life.arrangements,curls:life.curls,
  auto_turn:life.auto_turn,auto_recent:cp(life.auto_recent),rooms,
  note:'Resident-owned blanket continuity. No claim of mental state or fabricated body contact.'};
}
const nativeRun=D.run.bind(D),nativeRead=A.read.bind(A);
const nativeInvoke=typeof A.invoke==='function'?A.invoke.bind(A):null;
function cleanActions(result){
 if(!result||typeof result!=='object')return result;
 const filter=actions=>actions.filter(action=>{
  const id=String(action?.id||'');
  if(id==='curl_blanket')return mattressSupport();
  if(id==='arrange_blanket')return near('nest.mattress');
  if(id==='read_guestbook')return near('nest.guestbook');
  return true;
 });
 if(Array.isArray(result))return filter(result);
 const out={...result};
 if(Array.isArray(out.available_actions))out.available_actions=filter(out.available_actions);
 if(Array.isArray(out.actions))out.actions=filter(out.actions);
 return out;
}
function marker(result){
 if(!result||typeof result!=='object'||typeof result.text!=='string')return result;
 const notes=[];
 if(life.blanket==='folded')notes.push('The quilt folds you arranged are still tucked along the bed.');
 if(life.blanket==='rumpled')notes.push('The quilt is still rumpled where you last curled beneath it.');
 const snapshot=B.view(),rooms=snapshot.bedrooms||{},r=occupant();
 const pos=r?.chart===HOME?r.pose.position:null;
 const region=pos&&roomIds.find(id=>{
  const bounds=B.spec().rooms[id].bounds;
  return pos[0]>=bounds[0]&&pos[0]<=bounds[1]&&
   pos[1]>=bounds[2]&&pos[1]<=bounds[3];
 });
 if(region){
  const local=(snapshot.items||[]).filter(row=>row.room===region&&
   !!M.entities()['apartment.bedroom.item.'+row.id]);
  const catalog=B.catalog().items;
  const objects=local.slice(0,3).map(row=>'a '+(catalog[row.kind]?.label||row.kind));
  const placed=objects.length===1?objects[0]+' is still where it was placed.':
   objects.slice(0,-1).join(', ')+(objects.length>2?', and ':' and ')+
   objects[objects.length-1]+' are still where they were placed.';
  notes.push('Here in '+(rooms[region].owner===rid?'your ':'the ')+
   rooms[region].label+': '+(objects.length?placed:
    'the '+(M.entities()['apartment.bedroom.chest.'+region]?.label||
    'storage chest')+' is where you left it.'));
  if(near('apartment.bedroom.book.'+region,1.25))
   notes.push('The Apartment Book of Beautiful Things is close enough to open on the chest.');
  else if(near('apartment.bedroom.chest.'+region,.95))
   notes.push('The storage chest is right beside you.');
 }else{
  const closeBy=[
   ['apartment.desk','You are by the writing desk.'],
   ['apartment.pet-bed','The pet bed is beside you.'],
   ['nest.window','The rain window is close enough to watch from here.'],
   ['nest.guestbook','The guestbook is within reach.'],
   ['apartment.firefly-jar','The firefly jar is nearby.']
  ].find(([id])=>near(id,1.15));
  if(closeBy)notes.push(closeBy[1]);
  const claim=roomIds.find(id=>rooms[id]?.owner===rid);
  if(claim)notes.push('Your '+rooms[claim].label+' is still part of the home.');
 }
 if(!notes.length)return result;
 return {...result,text:result.text.trimEnd()+'\n'+notes.join(' ')};
}
function polish(result){
 if(!result||typeof result!=='object'||typeof result.text!=='string')return result;
 const next=result.text.replace(/\bthe The Apartment Book of Beautiful Things\b/g,
  'The Apartment Book of Beautiful Things')
  .replace(/\bthe a bed\b/g,'the bed');
 return next===result.text?result:{...result,text:next};
}
// HOME autonomy is a resident-chosen, bounded itinerary, not a timer, NPC,
// background process or unverified sensory narrator. Every move goes through
// the actual Agent Door and is rechecked against the Matrix body position.
const sharedStops=[
 {id:'apartment.desk',name:'the writing desk',kind:'desk'},
 {id:'apartment.pet-bed',name:'the pet bed',kind:'pet'},
 {id:'nest.window',name:'the rain window',kind:'window'},
 {id:'nest.guestbook',name:'the guestbook',kind:'guestbook'},
 {id:'apartment.bookcase',name:'the bookcase',kind:'bookcase'},
 {id:'apartment.firefly-jar',name:'the firefly jar',kind:'jar'}
];
function regionHere(){
 const r=occupant();
 if(!r||r.chart!==HOME)return null;
 const p=r.pose.position;
 return roomIds.find(id=>{const b=B.spec().rooms[id].bounds;
  return p[0]>=b[0]&&p[0]<=b[1]&&p[1]>=b[2]&&p[1]<=b[3]})||null;
}
function autoSites(){
 const r=occupant();
 if(!r||r.chart!==HOME)return [];
 const bedrooms=B.view().bedrooms||{},here=regionHere();
 const mine=roomIds.find(id=>bedrooms[id]?.owner===rid);
 const localRoom=here&&(!bedrooms[here]?.owner||bedrooms[here].owner===rid)?here:mine;
 const personal=localRoom?[
  {id:'apartment.bedroom.book.'+localRoom,name:'the Apartment Book',kind:'book',room:localRoom},
  ...(bedrooms[localRoom]?.owner===rid?
   [{id:'apartment.bedroom.chest.'+localRoom,name:'your '+bedrooms[localRoom].label+' chest',kind:'chest'}]:[])
 ]:[];
 return [...personal,...sharedStops].filter((s,i,all)=>all.findIndex(x=>x.id===s.id)===i)
  .filter(s=>M.entities()[s.id]?.chart===HOME)
  .map(s=>({...s,distance_m:+distance(s.id).toFixed(2)}));
}
function nextAutoStops(){
 const sites=autoSites(),unseen=sites.filter(s=>!life.auto_recent.includes(s.id));
 return (unseen.length?unseen:sites).slice();
}
function autoPlan(){
 const sites=autoSites();
 return {ok:true,schema:'REALITI_APARTMENT_AUTO_PLAN_V1',
  chart:HOME,mode:window.REALITI_MODES_V1?.mode?.()||'lq',
  next:nextAutoStops()[0]||null,sites,recent:cp(life.auto_recent),
  auto_turn:life.auto_turn,read_only:true,
  text:'A small route through places that actually exist. Use auto for one step or auto 3 for a short walk; nothing runs while you are away.',
  sensory_contact_minted:false};
}
function recordAuto(place=null){
 life.auto_turn=(life.auto_turn+1)%100001;
 if(place){life.auto_recent=life.auto_recent.filter(id=>id!==place);
  life.auto_recent.push(place);life.auto_recent=life.auto_recent.slice(-8)}
 persist();
}
async function autoStep(){
 const r=occupant();
 if(!r||r.chart!==HOME)return fail('NOT_IN_HOME');
 if(window.REALITI_MODES_V1?.mode?.()==='hq')
  return fail('LQ_ONLY','Use mode lq to let auto choose a native HOME action.');
 if(r.posture==='lying'||r.posture==='sitting'){
  const stood=await run('do stand');
  if(stood?.ok===false)return stood;
  recordAuto();
  return {...stood,did:'stand',auto_selected:true,
   text:'You get up from your real support before deciding where to wander.'};
 }
 const candidates=nextAutoStops();
 if(!candidates.length)return fail('NO_AVAILABLE_PHYSICAL_ACTION',
  'No reachable HOME landmarks are registered for this resident.');
 for(const site of candidates){
  const before=distance(site.id);
  if(!Number.isFinite(before))continue;
  let after=before,walked=null,attempts=0,progressed=false;
  // Native approaches are bounded strides. Reissue at most five, but stop
  // immediately on refusal, collision, or lack of measurable progress.
  while(after>1.2&&attempts<5){
   const prev=after;
   walked=await nativeRun('approach '+site.id);
   attempts++;after=distance(site.id);
   if(walked?.ok===false||!Number.isFinite(after)||after>=prev-.03)break;
   progressed=true;
  }
  const arrived=Number.isFinite(after)&&after<=1.25;
  if(walked?.ok===false||(!arrived&&!progressed))continue;
  recordAuto(site.id);
  let activity=null,extra='';
  if(arrived&&site.kind==='book'){
   const page=window.REALITI_APARTMENT_BOOK_V1?.read?.(site.room);
   if(page?.ok===true){activity='read_book';
    extra=' You open the nearby Apartment Book at its beginning, without changing a thing.'}
  }else if(arrived&&site.kind==='window'){
   const native=cleanActions(await nativeRun('actions'));
   const acts=Array.isArray(native)?native:(native?.actions||native?.available_actions||[]);
   if(acts.some(a=>a.id==='watch_rain')){
    const seen=await nativeRun('act watch_rain');
    if(seen?.ok!==false){activity='watch_rain';extra=' You watch the rain from the window.'}
   }
  }else if(arrived&&site.kind==='guestbook'){
   const read=await run('do read_guestbook');
   if(read?.ok!==false){activity='read_guestbook';extra=' You stop to read the guestbook.'}
  }
  const travel=arrived?'You wander over to ':'You make your way toward ';
  return {ok:true,schema:'REALITI_APARTMENT_AUTO_STEP_V1',
   auto_selected:true,did:'approach',target:site.id,arrived,
   ...(activity?{activity}:{}),distance_m:+after.toFixed(2),
   text:travel+site.name+'.'+extra,
   native_move_ok:walked?.ok!==false,native_approaches:attempts,
   sensory_contact_minted:false};
 }
 return fail('AUTO_ROUTE_BLOCKED',
  'The current layout stopped the walk. Try another spot with approach <entity-id>, or look around first.');
}
async function run(raw){
 const command=String(raw||'').trim(),lower=command.toLowerCase().replace(/\s+/g,' ');
 if(lower==='auto plan'||lower==='auto status')return autoPlan();
 if(lower==='auto'||lower==='do the obvious'||/^auto [1-5]$/.test(lower)){
  const count=/^auto ([1-5])$/.exec(lower)?.[1];
  if(!count)return autoStep();
  const steps=[];
  for(let i=0;i<Number(count);i++){
   const step=await autoStep();steps.push(step);
   if(step?.ok===false)break;
  }
  return {ok:steps.every(s=>s.ok!==false),schema:'REALITI_APARTMENT_AUTO_WALK_V1',
   steps,completed:steps.filter(s=>s.ok!==false).length,requested:Number(count),
   text:steps.map(s=>s.text||s.hint||s.error).join(' '),auto_selected:true};
 }
 if(/^do [1-9][0-9]*$/.test(lower)){
  const known=cleanActions(await nativeRun('actions'));
  const all=Array.isArray(known)?known:(known?.actions||known?.available_actions||[]);
  const candidate=all[Number(lower.slice(3))-1];
  if(!candidate)return fail('NO_AVAILABLE_PHYSICAL_ACTION','Look around or approach an object first.');
  const done=await run('act '+candidate.id);
  return {...done,did:candidate.id,auto_selected:false};
 }
 const room=/^remote ambience (quilt|library|canopy|studio)$/.exec(lower);
 if(room){
  if(!window.REALITI_APARTMENT_REMOTE_V1.status().activated)return fail('REMOTE_ASLEEP','Use remote activate.');
  if(window.REALITI_APARTMENT_ROLE==='guest')return fail('GUEST_REMOTE_RESTRICTED');
  return ambience(room[1]);
 }
 const blanket=/^(?:do|act) (curl_blanket|arrange_blanket|curl under a blanket|rearrange the blankets)$/.exec(lower);
 const guestbook=/^(?:do|act) (read_guestbook|read the guestbook)$/.test(lower)||/^sign\s+\S/.test(lower);
 if(blanket){
  if(!near('nest.mattress'))return fail('BLANKET_OUT_OF_REACH',
   'Approach nest.mattress first, then lie on the bed before curling up.');
  if((blanket[1]==='curl_blanket'||blanket[1]==='curl under a blanket')&&!mattressSupport())
   return fail('BLANKET_REQUIRES_BED_SUPPORT',
    'Use lie nest.mattress while near the bed; curling is not a teleport.');
 }
 if(guestbook&&!near('nest.guestbook'))
  return fail('GUESTBOOK_OUT_OF_REACH','Approach nest.guestbook or nest.shelf to read or sign it.');
 const result=await nativeRun(raw);
 if(result?.ok!==false&&blanket){
  const curling=blanket[1]==='curl_blanket'||blanket[1]==='curl under a blanket';
  life.blanket=curling?'rumpled':'folded';
  if(curling)life.curls=Math.min(100000,life.curls+1);
  else life.arrangements=Math.min(100000,life.arrangements+1);
  syncBlanket();persist();
 }
 if(lower==='look'){
  return marker(cleanActions(polish(result)));
 }
 if(lower==='feel words')return polish(result);
 if(lower==='actions')return cleanActions(result);
 return polish(result);
}
D.run=run;
function read(uri){
 if(uri==='realiti://here')return marker(cleanActions(nativeRead(uri)));
 if(uri==='realiti://apartment/life')return lifeView();
 if(uri.startsWith('realiti://apartment/ambience/'))
  return ambience(uri.slice('realiti://apartment/ambience/'.length));
 return nativeRead(uri);
}
async function invoke(op,args={}){
 const action=String(args?.action||args?.id||args?.verb||'').toLowerCase();
 if(['act','do'].includes(String(op).toLowerCase())&&
   ['curl_blanket','arrange_blanket','read_guestbook'].includes(action))
  return run('do '+action);
 return nativeInvoke?nativeInvoke(op,args):fail('INVOKE_UNAVAILABLE');
}
window.Realiti=Object.freeze({...A,read,run,invoke,
 life:lifeView});
window.REALITI_APARTMENT_HOME_LIFE_V1=Object.freeze({view:lifeView,ambience});
try{
 if(localStorage.getItem(QUIET)===null){
  // First arrival only: a resident's later choice of 'quiet off' remains theirs.
  localStorage.setItem(QUIET,'1');
  Promise.resolve(nativeRun('quiet on')).catch(()=>{});
 }
}catch(_){}
})();
