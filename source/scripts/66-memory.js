(()=> {
'use strict';

// REALITI local resident memory.
// One shared world may eventually host many residents, but durable memory is principal-owned now.
// The store keeps one replaceable departure delta plus a bounded explicit memory shelf. It never stores transcripts,
// hidden reasoning, another resident's shelf, or a second copy of the whole world.
const A0=window.Realiti,D0=window.REALITI_AGENT_DOOR;
if(!A0||!D0)return;
const HELP0=typeof D0.help==='function'?D0.help.bind(D0):null;

const SCHEMA='REALITI_LOCAL_MEMORY_V1',MAX_MEMORIES=32,MAX_EXPOSURES=8,MAX_CHANGES=16,DECAY=.5;
const cp=x=>x==null?x:JSON.parse(JSON.stringify(x));
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,Number(x)||0));
const round=(x,n=4)=>+Number(x||0).toFixed(n);
const clean=s=>String(s??'').replace(/\s+/g,' ').trim();
const STOP=new Set('a an and are as at be been but by for from had has have he her hers him his i if in into is it its me my of on or our ours she so than that the their them then there these they this those to too up us was we were what when where which who will with you your yours'.split(' '));

function residentId(){
  const injected=clean(window.REALITI_RESIDENT_ID);
  const qs=new URLSearchParams(location.search);
  const fromUrl=clean(qs.get('resident_id')||qs.get('resident'));
  const raw=injected||fromUrl||'local-default';
  if(!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,79}$/.test(raw))throw Error('INVALID_RESIDENT_ID');
  return raw;
}
let RID;
try{RID=residentId()}catch(e){RID='local-default'}
const KEY='resident-memory-v1:'+encodeURIComponent(RID);

function tokens(s){
  const m=clean(s).normalize('NFKC').toLowerCase().match(/[\p{L}\p{N}]+/gu)||[];
  return [...new Set(m.filter(x=>x.length>1&&!STOP.has(x)))];
}
function jaccard(a,b){
  if(!a.length||!b.length)return 0;
  const B=new Set(b),hit=a.reduce((n,x)=>n+(B.has(x)?1:0),0);
  return hit/(new Set([...a,...b]).size||1);
}
function hash(s){
  let h=2166136261>>>0;
  for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0}
  return h.toString(16).padStart(8,'0');
}
function safeState(v){
  try{
    const raw=JSON.stringify(v??null);
    if(raw.length<=768)return cp(v??null);
    return {truncated:true,digest:hash(raw),bytes:raw.length};
  }catch{return {unavailable:true}}
}
function fresh(){return {schema:SCHEMA,resident_id:RID,visits:0,next_id:1,last_departure:null,memories:[]}}
function load(){
  try{
    const raw=localStorage.getItem(KEY);
    if(!raw)return fresh();
    const v=JSON.parse(raw);
    if(v?.schema!==SCHEMA||v?.resident_id!==RID||!Array.isArray(v.memories))return fresh();
    v.visits=Math.max(0,Number(v.visits)||0);
    v.next_id=Math.max(1,Number(v.next_id)||1);
    v.memories=v.memories.slice(-MAX_MEMORIES*2);
    return v;
  }catch{return fresh()}
}
let S=load();
const VISIT=S.visits+1;
let departed=false;

function persist(flush=false){
  localStorage.setItem(KEY,JSON.stringify(S));
  if(flush)window.REALITI_SLICE_STORAGE?.save?.();
}
function currentRoom(){return String(C9?.currentRoom||'UNKNOWN')}
function score(m,q=''){
  const ageRefs=(m.exposures?.length?m.exposures:[m.created_visit||1]).slice(-MAX_EXPOSURES);
  const strength=ageRefs.reduce((sum,v)=>sum+Math.pow(1+Math.max(0,VISIT-Number(v||1)),-DECAY),0);
  const base=Math.log(Math.max(1e-9,strength));
  const sim=q?jaccard(tokens(q),tokens(m.text)):0;
  const room=m.room===currentRoom()?.toString()?0.12:0;
  return base+2.2*sim+.35*clamp(m.salience??.8)+room;
}
function prune(){
  if(S.memories.length<=MAX_MEMORIES)return;
  S.memories=S.memories
    .map(m=>({m,s:score(m)}))
    .sort((a,b)=>b.s-a.s||String(a.m.id).localeCompare(String(b.m.id)))
    .slice(0,MAX_MEMORIES)
    .map(x=>x.m);
}
function row(m,q=''){return {
  id:m.id,text:m.text,room:m.room||null,created_visit:m.created_visit,
  last_visit:m.exposures?.at(-1)??m.created_visit,accesses:m.exposures?.length||1,
  activation:round(score(m,q))
}}

function remember(text){
  text=clean(text);
  if(!text||text.length>1024)return {ok:false,error:'INVALID_MEMORY_TEXT'};
  const canonical=text.normalize('NFKC').toLowerCase();
  let m=S.memories.find(x=>x.canonical===canonical);
  if(m){
    m.exposures=[...(m.exposures||[]),VISIT].slice(-MAX_EXPOSURES);
    m.room=currentRoom();m.salience=Math.max(Number(m.salience||0),.9);
  }else{
    m={id:'m'+S.next_id++,text,canonical,source:'explicit',room:currentRoom(),created_visit:VISIT,exposures:[VISIT],salience:.9};
    S.memories.push(m);
  }
  prune();persist(true);
  return {ok:true,schema:'REALITI_MEMORY_WRITE_V1',resident_id:RID,memory:row(m),count:S.memories.length};
}
function ranked(query='',limit=5){
  query=clean(query);limit=Math.max(1,Math.min(8,Number(limit)||5));
  const qt=tokens(query);
  let xs=S.memories.map(m=>({m,sim:query?jaccard(qt,tokens(m.text)):1,s:score(m,query)}));
  if(query&&qt.length)xs=xs.filter(x=>x.sim>0||x.m.text.toLowerCase().includes(query.toLowerCase()));
  return xs.sort((a,b)=>b.s-a.s||String(a.m.id).localeCompare(String(b.m.id))).slice(0,limit);
}
function recall(query='',limit=5,{reinforce=true}={}){
  const xs=ranked(query,limit);
  if(reinforce&&xs.length){
    for(const x of xs)x.m.exposures=[...(x.m.exposures||[]),VISIT].slice(-MAX_EXPOSURES);
    persist(true);
  }
  return {ok:true,schema:'REALITI_MEMORY_RECALL_V1',resident_id:RID,query:clean(query),results:xs.map(x=>row(x.m,query))};
}
function forget(id){
  id=clean(id);
  if(id==='all'){
    const n=S.memories.length;S.memories=[];persist(true);
    return {ok:true,resident_id:RID,forgotten:n,scope:'current resident explicit memories only'};
  }
  if(id==='departure'){
    const had=!!S.last_departure;S.last_departure=null;persist(true);
    return {ok:true,resident_id:RID,forgotten:had?1:0,scope:'current resident departure snapshot only'};
  }
  const n=S.memories.length;S.memories=S.memories.filter(m=>m.id!==id);persist(true);
  return {ok:true,resident_id:RID,forgotten:n-S.memories.length,scope:'current resident only'};
}
function resetResident(){
  localStorage.removeItem(KEY);S=fresh();departed=false;window.REALITI_SLICE_STORAGE?.save?.();
  return {ok:true,resident_id:RID,scope:'current resident memory only',world_unchanged:true,other_residents_unchanged:true};
}

function objectMap(){
  const out={};
  for(const o of Object.values(C9?.b14?.objects||{})){
    if(!o?.id)continue;
    let raw='';try{raw=JSON.stringify([o.location,o.kind,o.state])}catch{}
    out[o.id]={sig:hash(raw),id:o.id,label:clean(o.label).slice(0,120)||o.id,kind:o.kind||null,room:o.location||null,state:safeState(o.state)};
  }
  return out;
}
const BASE=objectMap();

function changedObjects(){
  const now=objectMap(),rows=[];
  for(const [id,o] of Object.entries(now))if(!BASE[id]||BASE[id].sig!==o.sig)rows.push({...o});
  for(const [id,o] of Object.entries(BASE))if(!now[id])rows.push({id,label:o.label,kind:o.kind,room:o.room,removed:true});
  return rows.sort((a,b)=>String(a.id).localeCompare(String(b.id))).slice(0,MAX_CHANGES);
}
function departureSnapshot(reason='goodbye'){
  let space=null,continuity=null,body=null;
  try{const s=A0.read('realiti://space');space={chart:s?.chart||null,pose:cp(s?.pose||null),body:cp(s?.body||null),matrix_revision:s?.matrix_revision??null}}catch{}
  try{const c=A0.continuity?.current?.();continuity={resident_epoch:c?.resident_epoch??null,pending_causes:(c?.pending_causes||[]).slice(0,8)}}catch{}
  try{const b=A0.read('realiti://body');body={scale:C9?.pet2?.scale||'NORMAL',form:cp(C9?.formScratch||null),grounded_zones:(b?.field?.f?.at(-1)?.m||[]).filter(x=>Number(x)===1).length}}catch{}
  const changes=changedObjects();
  return {
    schema:'REALITI_DEPARTURE_MEMORY_V1',resident_id:RID,visit:VISIT,reason,
    world_time_ms:Math.round(Number(C9?.b7?.clock||0)*1000),
    room:currentRoom(),space,body,continuity,changed_objects:changes,
    world_delta_digest:hash(JSON.stringify(changes.map(x=>[x.id,x.sig||x.removed||false]))),
    memory_count:S.memories.length
  };
}
function depart(reason='goodbye'){
  if(departed)return cp(S.last_departure);
  S.last_departure=departureSnapshot(reason);
  S.visits=Math.max(S.visits,VISIT);
  prune();persist(true);departed=true;
  return cp(S.last_departure);
}
function projection(){
  const top=ranked('',8).map(x=>row(x.m));
  return {
    schema:'REALITI_MEMORY_READ_V1',resident_id:RID,local_only:true,separate_resident_store:true,
    visit:VISIT,completed_visits:S.visits,last_departure:cp(S.last_departure),memory_count:S.memories.length,
    memories:top,limits:{memories:MAX_MEMORIES,exposures_per_memory:MAX_EXPOSURES,departure_snapshots:1},
    semantics:{transcripts:false,hidden_reasoning:false,shared_with_other_residents:false,departure_replaces_previous:true}
  };
}

function help(){
  const h=cp(HELP0?.()||A0.help?.()||{});
  h.commands=[...new Set([...(h.commands||[]),'memory','remember <text>','recall <query>','forget memory <id|all|departure>'])];
  h.memory={resource:'realiti://memory',resident_id:RID,local_only:true,note:'Memory is bounded and resident-scoped. GOODBYE/host close replaces the one departure snapshot; explicit memories are separate.'};
  return h;
}
function read(uri='realiti://here'){
  if(uri==='realiti://memory')return projection();
  const r=A0.read(uri);
  if(uri==='realiti://capabilities'&&r&&typeof r==='object'){
    const x=cp(r);x.resources=[...new Set([...(x.resources||[]),'realiti://memory'])];
    x.operations=[...new Set([...(x.operations||[]),'remember','recall','forget_memory'])];
    x.startup=[...(x.startup||[]),'read realiti://memory for resident-local continuity'];
    x.memory={schema:SCHEMA,resident_scoped:true,multiplayer_transport:false};
    return x;
  }
  if(uri==='realiti://pocket'&&r&&typeof r==='object'){
    const x=cp(r);x.resident_memory={resident_id:RID,last_departure:cp(S.last_departure),memory_count:S.memories.length};return x;
  }
  return r;
}
async function invoke(name,args={}){
  const t=String(name||'').toLowerCase();
  if(t==='remember')return remember(args?.text);
  if(t==='recall')return recall(args?.query||'',args?.limit||5);
  if(t==='forget_memory')return forget(args?.id);
  if(t==='where_was_i'){
    const r=await A0.invoke(name,args);return {...r,resident_memory:{resident_id:RID,last_departure:cp(S.last_departure),memory_count:S.memories.length}};
  }
  if(t==='goodbye'){
    const saved=depart('goodbye'),r=await A0.invoke(name,args);window.REALITI_SLICE_STORAGE?.save?.();
    return {...r,memory_saved:{resident_id:RID,visit:saved?.visit??VISIT,departure:true}};
  }
  const r=await A0.invoke(name,args);
  if(t==='save'){persist(true)}
  return r;
}

const run0=D0.run.bind(D0);
async function run(raw){
  const s=clean(raw),l=s.toLowerCase();
  if(l==='memory'||l==='memories'||l==='remembered')return projection();
  if(l==='memory reset'||l==='reset memory')return resetResident();
  let m=/^remember\s+(.+)$/i.exec(s);if(m)return remember(m[1]);
  m=/^recall(?:\s+(.+))?$/i.exec(s);if(m)return recall(m[1]||'',5);
  m=/^forget\s+memory\s+(.+)$/i.exec(s);if(m)return forget(m[1]);
  if(['goodbye','leave','exit','bye'].includes(l)){
    const saved=depart('goodbye'),r=await run0(raw);window.REALITI_SLICE_STORAGE?.save?.();
    if(r&&typeof r==='object')r.memory_saved={resident_id:RID,visit:saved?.visit??VISIT,departure:true};
    return r;
  }
  if(['where was i','where was i?','where_was_i'].includes(l)){
    const r=await run0(raw);if(r&&typeof r==='object')r.resident_memory={resident_id:RID,last_departure:cp(S.last_departure),memory_count:S.memories.length};return r;
  }
  return run0(raw);
}

function createClient(){
  const c=A0.createClient(),wrapped={
    read,invoke,run,actions:c.actions?.bind(c),
    subscribe:c.subscribe?.bind(c),unsubscribe:c.unsubscribe?.bind(c),close:c.close?.bind(c)
  };
  return Object.freeze(wrapped);
}

window.Realiti=Object.freeze({...A0,help,read,invoke,run,createClient,memory:Object.freeze({
  residentId:()=>RID,current:projection,remember,recall:(q,l)=>recall(q,l),forget,reset:resetResident,depart
})});
D0.help=help;
D0.run=run;
D0.startup=Object.freeze([...(D0.startup||[]),'Realiti.read("realiti://memory")']);
window.REALITI_LOCAL_MEMORY_V1=Object.freeze({schema:SCHEMA,residentId:()=>RID,current:projection,remember,recall,forget,reset:resetResident,depart});
window.addEventListener?.('pagehide',()=>{try{depart('pagehide')}catch{}},{once:true});
})();