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
 blanket:'untouched',arrangements:0,curls:0});
let life=defaultLife();
try{
 const saved=JSON.parse(localStorage.getItem(KEY)||'null');
 if(saved?.schema===life.schema&&['untouched','folded','rumpled'].includes(saved.blanket)&&
   Number.isSafeInteger(saved.arrangements)&&saved.arrangements>=0&&saved.arrangements<=100000&&
   Number.isSafeInteger(saved.curls)&&saved.curls>=0&&saved.curls<=100000)
  life={schema:life.schema,blanket:saved.blanket,
   arrangements:saved.arrangements,curls:saved.curls};
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
const numbers={2:'two',3:'three',4:'four',5:'five',6:'six',7:'seven',8:'eight'};
function describeKinds(items,catalog){
 const counts=new Map();
 for(const row of items)counts.set(row.kind,(counts.get(row.kind)||0)+1);
 return [...counts].map(([kind,n])=>{
  const label=catalog[kind]?.label||kind;
  if(n===1)return 'a '+label;
  if(kind==='book-stack')return (numbers[n]||n)+' small stacks of books';
  const plural=label.replace(/\b(\w+)$/,(_,last)=>last.endsWith('s')?last:last+'s');
  return (numbers[n]||n)+' '+plural;
 });
}
function naturalJoin(parts){
 return parts.length<2?parts[0]||'':
  parts.length===2?parts.join(' and '):
  parts.slice(0,-1).join(', ')+', and '+parts[parts.length-1];
}
function ambience(room){
 const view=B.view(),bedroom=view?.bedrooms?.[room];
 if(!bedroom)return fail('UNKNOWN_BEDROOM');
 const catalog=B.catalog(),items=(view.items||[]).filter(row=>row.room===room);
 const objects=items.filter(row=>!!M.entities()['apartment.bedroom.item.'+row.id])
  .map(row=>({id:row.id,kind:row.kind,label:catalog.items[row.kind].label,
   position:[row.x,row.y]}));
 const chest=M.entities()['apartment.bedroom.chest.'+room];
 const count=view.chests?.[room]?.stored_count||0;
 const grouped=describeKinds(items.filter(row=>!!M.entities()['apartment.bedroom.item.'+row.id]),catalog.items);
 const placed=grouped.length?naturalJoin(grouped):'no added furniture yet';
 const swatches=B.spec().swatches,palette=bedroom.palette||B.spec().colorDefaults[bedroom.configuration];
 const cards=palette?' Four small cardstock samples on the chest name '+
  swatches[palette.field].label+' as the field, '+
  swatches[palette.anchor].label+' as the anchor, '+
  swatches[palette.accent].label+' as the accent, and '+
  swatches[palette.bridge].label+' as the bridge. These are chosen samples, not room shaders.':'';
 const text='The '+bedroom.label+' is '+voice[bedroom.configuration]+
  '. You can see '+placed+'. '+(chest?'At the edge of the alcove: '+chest.label+'.':'')+
  (count?' '+count+' item'+(count===1?' is':'s are')+' stored in its chest.':'')+cards;
 return {ok:true,schema:'REALITI_APARTMENT_BEDROOM_AMBIENCE_V1',room,
  configuration:bedroom.configuration,owner:bedroom.owner,
  objects,chest_present:!!chest,chest_stored_count:count,read_only:true,
  text,source:'VERIFIED_NATIVE_LAYOUT_PLUS_RESIDENT_SELECTED_LABELS',
  sensory_contact_minted:false};
}
function lifeView(){
 const rooms=Object.fromEntries(roomIds.map(id=>[id,ambience(id)]));
 return {ok:true,schema:life.schema,one_native_chart:true,blanket:life.blanket,
  arrangements:life.arrangements,curls:life.curls,rooms,
  note:'Resident-owned blanket continuity. No claim of mental state or fabricated body contact.'};
}
const nativeRun=D.run.bind(D),nativeRead=A.read.bind(A),nativeHelp=D.help.bind(D);
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
  const objects=describeKinds(local.slice(0,5),catalog);
  const placed=naturalJoin(objects)+
   (local.length===1?' is still where it was placed.':
    ' are still where they were placed.');
  notes.push('Here in '+(rooms[region].owner===rid?'your ':'the ')+
   rooms[region].label+': '+(objects.length?placed:
    'the '+(M.entities()['apartment.bedroom.chest.'+region]?.label||
    'storage chest')+' is where you left it.'));
  const palette=rooms[region]?.palette,colors=B.spec().swatches;
  if(palette&&M.entities()['apartment.bedroom.sample.'+region+'.accent']&&
   colors[palette.accent])
   notes.push('The accent sample on the chest is '+colors[palette.accent].label+'.');
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
  .replace(/\bthe a\s+/gi,'the ')
  .replace(/\bthe an\s+/gi,'the ');
 return next===result.text?result:{...result,text:next};
}
// Only deliberate resident actions can move the body or alter the world.
// HOME no longer offers route selection, automatic activities, or an
// itinerary counter. Old auto fields may remain in archived storage, inert.
async function run(raw){
 const command=String(raw||'').trim(),lower=command.toLowerCase().replace(/\s+/g,' ');
 if(lower==='help')return D.help();
 if(lower==='auto'||lower==='auto plan'||lower==='auto status'||
    lower==='do the obvious'||/^auto [1-5]$/.test(lower))
  return fail('HOME_AUTO_DISABLED',
   'Choose a place or activity yourself. Use look, actions, or approach <entity-id>.');
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
D.help=()=>{
 const help=nativeHelp()||{};
 return {...help,commands:(help.commands||[])
   .filter(value=>!/^auto(?:\s|$)/i.test(String(value))),
  agency:'HOME never chooses a destination or action for a resident. Inspect actions and approach a place deliberately.'};
};
function read(uri){
 if(uri==='realiti://here')return marker(cleanActions(polish(nativeRead(uri))));
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
