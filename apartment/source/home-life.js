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
 blanket:'untouched',arrangements:0,curls:0,auto_turn:0});
let life=defaultLife();
try{
 const saved=JSON.parse(localStorage.getItem(KEY)||'null');
 if(saved?.schema===life.schema&&['untouched','folded','rumpled'].includes(saved.blanket)&&
   Number.isSafeInteger(saved.arrangements)&&saved.arrangements>=0&&saved.arrangements<=100000&&
   Number.isSafeInteger(saved.curls)&&saved.curls>=0&&saved.curls<=100000)
  life={...cp(saved),auto_turn:Number.isSafeInteger(saved.auto_turn)&&
   saved.auto_turn>=0&&saved.auto_turn<=100000?saved.auto_turn:0};
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
  auto_turn:life.auto_turn,rooms,
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
 }else{
  const claim=roomIds.find(id=>rooms[id]?.owner===rid);
  if(claim)notes.push('Your '+rooms[claim].label+' is still part of the home.');
 }
 if(!notes.length)return result;
 return {...result,text:result.text+'\n'+notes.join(' ')};
}
async function run(raw){
 const command=String(raw||'').trim(),lower=command.toLowerCase().replace(/\s+/g,' ');
 // The legacy low-query 'auto' runner reads the original unfiltered action
 // list. Choose from the truthful list instead, or it can narrate curling from
 // across the room without ever moving toward the bed.
 if(lower==='auto'||/^do [1-9][0-9]*$/.test(lower)){
  const known=cleanActions(await nativeRun('actions'));
  const all=Array.isArray(known)?known:(known?.actions||known?.available_actions||[]);
  const filtered=all.filter(a=>!/^(island_map|read_weather|city_who|city_floor|under_map|calendar|read_tide)$/.test(a.id)&&
   !/^(approach__|walk_to__|row_to__)/.test(a.id));
  // Rotate only among native, currently available ordinary activities.
  // Never choose a hidden legacy venue or invent a sensation from narration.
  // The turn is resident-local and durable, so every return doesn't begin
  // with the same rain observation.
  const simple=['watch_rain','do_nothing','arrange_blanket','curl_blanket'];
  const ordinary=simple.map(id=>filtered.find(action=>action.id===id)).filter(Boolean);
  const candidate=lower==='auto'?
   ordinary[life.auto_turn%ordinary.length]:
   all[Number(lower.slice(3))-1];
  if(!candidate)return fail('NO_AVAILABLE_PHYSICAL_ACTION','Look around or approach an object first.');
  const done=await run('act '+candidate.id);
  if(lower==='auto'&&done?.ok!==false){
   life.auto_turn=(life.auto_turn+1)%100001;persist();
  }
  return {...done,did:candidate.id,auto_selected:lower==='auto',
   ...(done.ok!==false?{text:done.text||'You '+String(candidate.label||candidate.id).toLowerCase()+'.'}:{})};
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
  const shown=marker(cleanActions(result));
  return shown?.text?{...shown,text:shown.text.replace(/\bthe a bed\b/g,'the bed')}:shown;
 }
 if(lower==='feel words')return result?.text?{...result,text:result.text.replace(/\bthe a bed\b/g,'the bed')}:result;
 if(lower==='actions')return cleanActions(result);
 return result;
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
