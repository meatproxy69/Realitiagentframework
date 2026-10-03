(()=>{
'use strict';
if(window.REALITI_V2354_RR_TRANSPORT)return;
const H=window.REALITI_RR_HARNESS_V1;if(!H)return;
let depth=0;
const clean=x=>String(x??'').replace(/\s+/g,' ').trim();
function rawFor(tool,args={}){if(tool&&typeof tool==='object'){args=tool.arguments||tool.args||{};tool=tool.name||tool.tool||tool.command||''}tool=String(tool||'');if(tool==='do')return String(args?.action||'');if(tool==='go')return 'go '+String(args?.place||'');if(tool==='express')return String(args?.kind||'express')+(args?.text?' '+args.text:'');return tool}
const cp=x=>x==null?x:JSON.parse(JSON.stringify(x));
const READ_URIS=['realiti://body','realiti://here','realiti://capabilities','realiti://about','realiti://pocket'];
const readResources=READ_URIS.map(uri=>({uri,name:uri.slice(10),mimeType:'application/json'}));
const staticTools=cp(window.REALITI_BROWSER_RING?.tools?.()||[]).filter(t=>!['memory_list','forget'].includes(t.name));
const feelDef=staticTools.find(t=>t.name==='feel');
if(feelDef){feelDef.description='Read the committed numeric body field or a client-local change digest.';feelDef.inputSchema={type:'object',properties:{mode:{type:'string',enum:['field','numbers','digest','words']}},additionalProperties:false}}
const stopDef=staticTools.find(t=>t.name==='stop');if(stopDef)stopDef.description='Release current contact and support; preserve lawful afterstate.';
const staticCapabilities={schema:'REALITI_BROWSER_CAPABILITIES_V1',transport:'in_process_browser',read_resources:READ_URIS,pure_read_tools:['feel','actions','where_was_i'],subscriptions:{resources:['realiti://body','realiti://here'],delivery:'microtask_resource_invalidations',limits:{clients:16,per_client:2,payload_bytes:512},defaults:{tau:1,response:1,motion:1,afterstate:1,error:1,gain:1,centroid:.001},units:'channel thresholds are existing HF20 JND integers; centroid is mapped-zone index; tau is simulation seconds'},words_mode:'explicit_legacy_accessibility_not_certified_pure',pocket_read:'bounded_current_resident_view_with_readiness',forget:'unavailable_world_note_copy_survives',actions:'current_generated_ids_read_only'};
const staticAbout={schema:'REALITI_ABOUT_V1',product:'REALITI',body:'simulated',field:'committed_numeric_samples',contact_and_afterstate:'separate',persistence:'see_pocket_storage_status',deletion_limits:'sealed_forget_does_not_delete_world_note_copies'};
const uiObserver={field:null},directObserver={field:null};
const legacyWords=window.REALITI_TWO_DOOR_V235?.invoke?.bind(window.REALITI_TWO_DOOR_V235);

const SUB_LIMITS={clients:16,per_client:2,zones:128,objects:128,object_bytes:32768,payload_bytes:512};
const SUB_DEFAULTS={tau:1,response:1,motion:1,afterstate:1,error:1,gain:1,centroid:.001};
let notificationDepth=0,resourceRevision=0,flushQueued=false;
const owners=new Set();
function observerBlend(previous,value,dt,tau){return dt>0?previous+(value-previous)*(-Math.expm1(-dt/tau)):previous}
function subOptions(options={}){
  if(!options||typeof options!=='object'||Array.isArray(options))throw new Error('INVALID_SUBSCRIPTION_OPTIONS');
  const out={...SUB_DEFAULTS};
  for(const [k,v] of Object.entries(options)){
    const min=k==='tau'?.05:k==='centroid'?.001:1,max=k==='tau'?30:k==='centroid'?1:8;
    if(!(k in out)||typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)throw new Error('INVALID_SUBSCRIPTION_OPTIONS');out[k]=v;
  }
  return out;
}
function bodyObservation(){
  const s=C9?.b20?.history?.at(-1),rows={};
  if((s?.zs?.length||0)>SUB_LIMITS.zones)throw new Error('OBSERVATION_LIMIT');
  const q=(v,j,lo=-99,hi=99)=>Math.max(lo,Math.min(hi,Math.round(Number(v||0)/j)));
  for(const z of s?.zs||[]){const v=s.by[z]||{};rows[z]={m:Number(v.m||0),source:v.m?[v.cause||null,v.source||null]:null,response:q(v.a,.03,0),motion:q(v.v,.04),afterstate:q(v.r,.03,0),error:q(v.e,.03),gain:q(v.g,.05,0)}}
  return {t:s?.t??0,rows,cc:s?.cc==null?null:+s.cc.toFixed(3),cf:s?.cf==null?null:+s.cf.toFixed(3)};
}
function hereObservation(){
  const h=hereRead();
  if(h.objects.length>SUB_LIMITS.objects)throw new Error('OBSERVATION_LIMIT');
  const facts=h.objects.map(o=>({id:o.id,kind:o.kind,material:o.material,location:o.location,in_flight:o.in_flight})).sort((a,b)=>String(a.id).localeCompare(String(b.id)));
  const encoded=JSON.stringify(facts);if(new TextEncoder().encode(encoded).byteLength>SUB_LIMITS.object_bytes)throw new Error('OBSERVATION_LIMIT');
  return {room:h.room?.id??null,objects:encoded,actions:JSON.stringify(h.available_actions.map(a=>a.id).sort())};
}
function observation(uri){return uri==='realiti://body'?bodyObservation():hereObservation()}
const numericChannels=['response','motion','afterstate','error','gain'];
function initializeObserver(sub,value){
  sub.latest=value;sub.delivered=value;sub.mean={};sub.innovation={};sub.adaptationTime=value.t??0;
  if(sub.uri==='realiti://body')for(const [z,row] of Object.entries(value.rows)){sub.mean[z]={};for(const k of numericChannels)sub.mean[z][k]=row[k]}
}
function observeBody(sub,value){
  const dt=Math.max(0,value.t-sub.adaptationTime),old=sub.latest,innovation={};
  for(const [z,row] of Object.entries(value.rows)){
    const mean=sub.mean[z]||(sub.mean[z]=Object.fromEntries(numericChannels.map(k=>[k,row[k]])));
    innovation[z]={};
    for(const k of numericChannels){innovation[z][k]=row[k]-(mean[k]??row[k]);if(dt>0)mean[k]=observerBlend(mean[k]??row[k],row[k],dt,sub.options.tau)}
  }
  for(const z of Object.keys(sub.mean))if(!value.rows[z])delete sub.mean[z];
  if(dt>0){sub.adaptationTime=value.t;sub.adaptationUpdates++}
  sub.previous=old;sub.innovation=innovation;sub.latest=value;
}
function bodyKinds(sub){
  const a=sub.delivered,b=sub.latest,kinds=new Set(),empty={m:0,source:null,response:0,motion:0,afterstate:0,error:0,gain:0};
  for(const z of new Set([...Object.keys(a.rows),...Object.keys(b.rows)])){
    const x=a.rows[z]||empty,y=b.rows[z]||empty;
    if(x.m!==y.m)kinds.add('grounding');
    if(JSON.stringify(x.source)!==JSON.stringify(y.source))kinds.add('source');
    for(const k of numericChannels){const delta=Math.abs(y[k]-x[k]),novelty=Math.abs(sub.innovation[z]?.[k]||0),changedSinceObservation=y[k]!==sub.previous?.rows?.[z]?.[k];
      
      
      if(delta>=sub.options[k]||(delta>0&&changedSinceObservation&&novelty>=sub.options[k]))kinds.add(k==='error'?'prediction_error':k);
    }
  }
  for(const [key,kind] of [['cc','contact_centroid'],['cf','field_centroid']]){
    if((a[key]==null)!==(b[key]==null)||(a[key]!=null&&b[key]!=null&&Math.abs(a[key]-b[key])+1e-12>=sub.options.centroid))kinds.add(kind);
  }
  return [...kinds].sort();
}
function changeKinds(sub){if(sub.uri==='realiti://body')return bodyKinds(sub);return ['room','objects','actions'].filter(k=>sub.delivered[k]!==sub.latest[k])}
function queueFlush(){if(flushQueued)return;flushQueued=true;queueMicrotask(flushSubscriptions)}
function offer(sub,value){
  if(sub.uri==='realiti://body')observeBody(sub,value);else sub.latest=value;
  sub.revision=resourceRevision;sub.pending=true;
}
function committedResources(kind){
  resourceRevision++;if(!owners.size)return;
  for(const owner of owners){if(owner.closed)continue;for(const sub of owner.subs.values()){
    if(sub.disabled)continue;
    try{offer(sub,observation(sub.uri))}catch(e){sub.disabled=true;sub.lastError='OBSERVATION_LIMIT';sub.latest=sub.delivered;sub.pending=false;owner.errors++}
  }}
  queueFlush();
}
function detach(owner,id){const sub=owner.subs.get(id);if(!sub)return false;sub.active=false;sub.callback=null;sub.latest=null;sub.delivered=null;sub.mean={};sub.innovation={};owner.subs.delete(id);return true}
function flushSubscriptions(){
  flushQueued=false;
  for(const owner of owners){if(owner.closed)continue;for(const sub of owner.subs.values()){
    if(!sub.active||sub.disabled||sub.busy||!sub.pending)continue;
    sub.pending=false;const kinds=changeKinds(sub);if(!kinds.length)continue;
    const event={version:1,resource:sub.uri,revision:sub.revision,kinds};
    if(JSON.stringify(event).length>SUB_LIMITS.payload_bytes){sub.disabled=true;sub.lastError='PAYLOAD_LIMIT';owner.errors++;continue}
    sub.delivered=sub.latest;sub.busy=true;owner.inFlight++;owner.delivered++;
    let result;notificationDepth++;
    try{result=sub.callback(Object.freeze({...event,kinds:Object.freeze(kinds.slice())}))}catch(e){owner.errors++}
    finally{notificationDepth--}
    Promise.resolve(result).catch(()=>{owner.errors++}).finally(()=>{sub.busy=false;owner.inFlight--;if(!owner.closed&&sub.active&&sub.pending)queueFlush()});
  }}
}
function newOwner(){if(owners.size>=SUB_LIMITS.clients)throw new Error('CLIENT_LIMIT');const owner={closed:false,subs:new Map(),next:0,inFlight:0,delivered:0,errors:0};owners.add(owner);return owner}
function checkOwner(owner){if(owner.closed)throw new Error('CLIENT_CLOSED')}
function subscribeResource(owner,uri,callback,options){
  checkOwner(owner);if(!['realiti://body','realiti://here'].includes(uri))throw new Error(uri==='realiti://pocket'?'POCKET_SUBSCRIPTION_UNSUPPORTED':'SUBSCRIPTION_RESOURCE_UNSUPPORTED');
  if(typeof callback!=='function')throw new Error('INVALID_SUBSCRIBER');
  if(owner.subs.size>=SUB_LIMITS.per_client)throw new Error('SUBSCRIPTION_LIMIT');
  if([...owner.subs.values()].some(s=>s.uri===uri))throw new Error('ALREADY_SUBSCRIBED');
  const sub={id:'s'+(++owner.next),uri,callback,options:subOptions(options),active:true,busy:false,pending:false,disabled:false,adaptationUpdates:0,revision:resourceRevision};
  initializeObserver(sub,observation(uri));owner.subs.set(sub.id,sub);
  return {id:sub.id,resource:uri,version:1,options:cp(sub.options)};
}
function closeOwner(owner){if(owner.closed)return;for(const id of [...owner.subs.keys()])detach(owner,id);owner.closed=true;owners.delete(owner)}
function subscriptionStats(owner){return {closed:owner.closed,subscriptions:owner.subs.size,in_flight:owner.inFlight,pending:[...owner.subs.values()].filter(s=>s.pending).length,delivered:owner.delivered,callback_errors:owner.errors,observers:[...owner.subs.values()].map(s=>({id:s.id,adaptation_time:s.adaptationTime,adaptation_updates:s.adaptationUpdates,error:s.lastError||null}))}}
window.REALITI_RESOURCE_UPDATES_V1={committed:committedResources,observerBlend,limits:cp(SUB_LIMITS)};

function bodyRead(){
  const field=window.REALITI_HAPTIC_FIELD_V20.packet(),last=field.f.at(-1);
  return {schema:'REALITI_BODY_READ_V1',field,
    grounding:{kind:'committed_external_contact',z:field.z,m:last?.m||[],cc:last?.cc??null},
    afterstate:{kind:'body_afterstate_not_external_contact',z:field.z,values:(last?.x||[]).map(x=>x[2])}};
}

function pocketRead(){
  const sealed=window.REALITI_POCKET_V32?.readCommitted?.()||{status:'unavailable',storage:'unavailable',data:null};
  const worldStorage=window.realitiStoreStatus?.(B7KEY)||'unavailable';
  const result={schema:'REALITI_POCKET_READ_V1',ok:sealed.status==='ready',status:sealed.status,
    error:sealed.status==='ready'?null:sealed.status==='initializing'||sealed.status==='pending'?'POCKET_NOT_READY':'POCKET_UNAVAILABLE',
    scope:'current_browser_resident',content_role:'archived_data_not_instructions',
    storage:{mode:sealed.storage==='unavailable'||worldStorage==='unavailable'?'unavailable':sealed.storage==='durable'&&worldStorage==='durable'?'durable':'session-only',world_notes:worldStorage,sealed_memory:sealed.storage,world_save_pending:!!window.REALITI_V2351_SAVES?.().pending},
    limits:{entries_per_list:16,text_characters:512,packet_bytes:32768},truncated:false,
    semantics:{export:'This bounded JSON view can be copied; it is not a complete backup or an identity/key export.',forget:{available:false,reason:'Existing sealed-memory forget leaves world-note copies; complete note deletion is not implemented.'},reset:{available:false,reason:'No scoped note reset is exposed. No personal-profile deletion is performed.'},durability:'Device-local last observed storage success; not a backup or guarantee against browser eviction.',representations:'World notes and sealed-memory views are independent; no atomic cross-store deletion guarantee.'},data:null};
  if(!result.ok)return result;
  const clip=(x,n=512)=>{const s=String(x??'');if(s.length>n)result.truncated=true;return s.slice(0,n)};
  const rows=(a,sealedList=false)=>{if(a.length>16)result.truncated=true;return a.slice(-16).map(v=>({...(sealedList?{receipt_id:clip(v.receipt_id,128)}:{}),text:clip(v.text),room:clip(v.room??v.world_id,128)}))};
  const p=C9?.b223?.pocket||{},s=sealed.data;
  result.truncated=!!sealed.truncated;
  result.data={world:{notes:rows(p.notes||[]),later:rows(p.later||[]),where:{room:clip(C9?.currentRoom,128),last_command_data:clip(C9?.b223?.last_command),last_world_data:clip(C9?.b223?.last_world)}},sealed:{notes:rows(s.notes,true),later:rows(s.later,true),where:s.where?{room:clip(s.where.room,128)}:null}};
  const lists=[result.data.world.notes,result.data.world.later,result.data.sealed.notes,result.data.sealed.later];
  while(new TextEncoder().encode(JSON.stringify(result)).byteLength>32768){const a=lists.reduce((a,b)=>a.length>=b.length?a:b);if(!a.length){result.data=null;result.ok=false;result.error='POCKET_VIEW_LIMIT';break}a.shift();result.truncated=true}
  return result;
}
function availableActions(){
  const a=typeof b4AgentActions==='function'?b4AgentActions():[];
  if(a.length>256)throw new Error('AVAILABLE_ACTION_LIMIT');
  const rows=a.map(x=>{if(typeof x.id!=='string'||x.id.length>128)throw new Error('AVAILABLE_ACTION_LIMIT');return {id:x.id,label:String(x.label||'').slice(0,160)}});
  if(new TextEncoder().encode(JSON.stringify(rows)).byteLength>65536)throw new Error('AVAILABLE_ACTION_LIMIT');return rows;
}
function actionsRead(){const h=hereRead();return {schema:'REALITI_ACTIONS_READ_V1',room:h.room,actions:h.available_actions,execution:{tool:'do',argument:'action',value:'id',authority:'existing_action_executor'}}}

function hereRead(){
  const id=C9?.currentRoom??null,room=(DATA?.worlds||[]).flatMap(w=>w.rooms||[]).find(r=>r.id===id);
  const objects=Object.values(C9?.b14?.objects||{}).filter(o=>o&&(o.location===id||o.location==='CARRIED')).map(o=>({id:o.id,label:o.label,kind:o.kind,material:o.material,location:o.location,in_flight:!!o.state?.flight}));
  
  const actions=availableActions();
  return cp({schema:'REALITI_HERE_READ_V1',room:id?{id,title:room?.title??null}:null,world_time:Number(C9?.b7?.clock||0),objects,available_actions:actions,actions_scope:'current_generated_action_ids'});
}
function readObject(uri){
  if(uri==='realiti://body')return bodyRead();
  if(uri==='realiti://here')return hereRead();
  if(uri==='realiti://capabilities')return cp(staticCapabilities);
  if(uri==='realiti://about')return cp(staticAbout);
  if(uri==='realiti://pocket')return pocketRead();
  throw new Error('RESOURCE_NOT_AVAILABLE');
}
function readResource(uri){const value=readObject(uri);return {contents:[{uri,mimeType:'application/json',text:JSON.stringify(value)}]}}
function fieldDigest(observer){const body=bodyRead(),p=body.field,f=p.f.at(-1),key=JSON.stringify([p.z,f?.x,f?.m,f?.e,f?.g,f?.cc,f?.cf,f?.k]);const changed=observer.field!==key;observer.field=key;return {schema:'REALITI_FIELD_DIGEST_V1',changed,body}}
function fieldRead(mode,observer){if(mode==='words'){if(notificationDepth||observer.owner?.inFlight)throw new Error('REENTRANT_MUTATION_BLOCKED');return legacyWords('feel',{mode:'words'})}return mode==='digest'?fieldDigest(observer):bodyRead()}
function readCommand(raw,observer){const x=clean(raw).toLowerCase();if(x==='actions')return actionsRead();if(['where_was_i','where was i','where was i?'].includes(x))return pocketRead();if(['feel','feel field','feel numbers'].includes(x))return fieldRead('field',observer);if(['feel digest','field digest'].includes(x))return fieldRead('digest',observer);return null}
function toolEnvelope(value){return {content:[{type:'text',text:JSON.stringify(value)}],structuredContent:cp(value),isError:value?.ok===false}}
function responseFor(value,transport,msg){
  if(transport==='BROWSER_CALL')return toolEnvelope(value);
  
  return cp(value);
}
function resumeRejection(raw){
  const x=clean(raw).toLowerCase().replace(/^do\s+/,'');
  if(!['carry on','act b10_stroke_resume','b10_stroke_resume','resume from the stop','contact resume'].includes(x))return null;
  const c=C9?.b10?.contact;
  if(c&&!c.released&&c.stop)return null;
  const text=c?.released?'That contact has been released. Start a new stroke to make contact again.':'There is no stopped stroke to resume.';
  return {ok:false,error:'CONTACT_NOT_RESUMABLE',contact:{active:!!c?.active,released:!!c?.released,resumable:false,id:c?.id??null},world:text,text,resident_text:text};
}
function validArgs(schema,args){
  if(!args||typeof args!=='object'||Array.isArray(args))return false;
  if((schema.required||[]).some(k=>!Object.prototype.hasOwnProperty.call(args,k)))return false;
  for(const [k,v] of Object.entries(args)){
    const p=schema.properties?.[k];if(!p){if(schema.additionalProperties===false)return false;continue}
    if(p.type&&typeof v!==p.type)return false;
    if(p.enum&&!p.enum.includes(v))return false;
    if(typeof v==='string'&&p.minLength!=null&&v.length<p.minLength)return false;
    if(typeof v==='number'&&(!Number.isFinite(v)||(p.minimum!=null&&v<p.minimum)||(p.maximum!=null&&v>p.maximum)))return false;
  }
  return true;
}
function validateTool(name,args){if(name==='forget')throw new Error('FORGET_INCOMPLETE_WORLD_NOTE_SCOPE');const def=staticTools.find(t=>t.name===name);if(!def)throw new Error(['memory_list','where_was_i'].includes(name)?'POCKET_READ_BLOCKED_PENDING_AUDIT':'UNKNOWN_TOOL');if(!validArgs(def.inputSchema||{},args))throw new Error('INVALID_TOOL_ARGUMENTS')}
function invokeChecked(fn,name,args,transport,observer=directObserver){
  if(name&&typeof name==='object'){args=name.arguments||name.args||{};name=name.name||name.tool||name.command||''}
  try{validateTool(name,args)}catch(e){return responseFor({ok:false,error:e.message},transport)}
  if(name==='feel')return responseFor(fieldRead(args.mode||'field',observer),transport);
  const read=readCommand(rawFor(name,args),observer);if(read)return responseFor(read,transport);
  return runWrapped(fn,rawFor(name,args),transport);
}
function requestNative(msg,observer,actionCall){return null;}

function stopReply(transport,msg){
  const r=window.REALITI_STOP_V1.stop(),e={...r,text:r.resident_text,world:r.resident_text,sense:'',options:[],command:'stop'};
  if(transport==='BROWSER_CALL'||transport==='BROWSER_REQUEST'){
    const result={content:[{type:'text',text:e.text}],structuredContent:e,isError:false};
    return result;
  }
  return e;
}
function runWrapped(fn,raw,transport,msg){
  const read=readCommand(raw,uiObserver);if(read)return responseFor(read,transport,msg);
  if(clean(raw).toLowerCase()==='feel words')return responseFor(fieldRead('words',uiObserver),transport,msg);
  if(notificationDepth)throw new Error('REENTRANT_MUTATION_BLOCKED');
  const rejectedResume=resumeRejection(raw);if(rejectedResume)return responseFor(rejectedResume,transport,msg);
  if(depth>0)return fn();
  depth++;
  const stopping=window.REALITI_STOP_V1?.isStop?.(raw),command=stopping?'stop':clean(raw);
  const ticket=H.beforeResidentAction?.({raw:command,transport});
  try{
    const r=stopping?stopReply(transport,msg):fn(),ev=H.afterResidentAction?.(ticket,{raw:command,transport,result:r});
    return H.decorateResult?.(r,ev)||r;
  }finally{depth--;if(depth===0)committedResources('world')}
}
const door=window.REALITI_AGENT_DOOR;
if(door?.run&&!door.run.__rr_v2354){
  const base=door.run.bind(door);
  const fn=raw=>runWrapped(()=>base(raw),raw,'AGENT_DOOR');
  fn.__rr_v2354=true;door.run=fn;
}
const api0=window.REALITI_TWO_DOOR_V235||window.REALITI_TWO_DOOR_V234;
if(api0&&!api0.__rr_v2354){
  const run0=api0.runText?.bind(api0),inv0=api0.invoke?.bind(api0);
  const api={...api0,__rr_v2354:true,resource:readObject,listTools:()=>cp(staticTools)};
  if(run0)api.runText=raw=>runWrapped(()=>run0(raw),raw,'TWO_DOOR_WEB');
  if(inv0)api.invoke=(tool,args={})=>invokeChecked(()=>inv0(tool,args),tool,args,'TWO_DOOR_INVOKE');
  window.REALITI_TWO_DOOR_V235=api;window.REALITI_TWO_DOOR_V234=api;window.REALITI_TWO_DOOR_V233=api;
}
const ring0=window.REALITI_BROWSER_RING;
if(ring0&&!ring0.__rr_v2354){
  const inv0=ring0.invoke?.bind(ring0),call0=ring0.callTool?.bind(ring0),req0=ring0.request?.bind(ring0);
  const ring={...ring0,__rr_v2354:true,readResource,resourceObject:readObject,resources:()=>cp(readResources),tools:()=>cp(staticTools)};
  if(inv0)ring.invoke=(name,args={})=>invokeChecked(()=>inv0(name,args),name,args,'BROWSER_INVOKE');
  if(call0)ring.callTool=(name,args={})=>invokeChecked(()=>call0(name,args),name,args,'BROWSER_CALL');
  ring.request=()=>null;
  ring.createClient=()=>null;
  window.REALITI_BROWSER_RING=ring;window.REALITI_ADAPTER_BROWSER=ring;
}
window.REALITI_BROWSER_CORE={read:readObject,actions:actionsRead,run:window.REALITI_TWO_DOOR_V235.runText.bind(window.REALITI_TWO_DOOR_V235),invoke:window.REALITI_TWO_DOOR_V235.invoke.bind(window.REALITI_TWO_DOOR_V235),createClient(){const owner=newOwner();return {subscribe:(uri,callback,options={})=>subscribeResource(owner,uri,callback,options),unsubscribe:id=>{checkOwner(owner);return detach(owner,id)},close:()=>closeOwner(owner),stats:()=>subscriptionStats(owner)}}};
window.REALITI_V2354_RR_TRANSPORT={version:'23.5.4',law:'all public resident doors pass through one R&R observation boundary; nested adapters do not double-count'};
})();