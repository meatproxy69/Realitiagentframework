(()=>{'use strict';
const core=window.REALITI_BROWSER_CORE,rooms=window.REALITI_SLICE_ROOMS,stream=window.REALITI_CONTINUITY,pocket=window.REALITI_POCKET_V32,storage=window.REALITI_SLICE_STORAGE;
if(!core||!rooms||!stream||!pocket||!storage)throw Error('INCOMPLETE_SLICE');
const cp=x=>x==null?x:JSON.parse(JSON.stringify(x));
const clients=new Set(),observers=new Set();let mutating=false,ended=!!C9.welcome10?.ended,mustReload=false;
const callbackBlocked=()=>[...observers].some(o=>!o.closed&&o.pending>0);
const clean=s=>String(s??'').replace(/\s+/g,' ').trim();
const fail=error=>({ok:false,error});
const OBJECT_ID_OUT=Object.freeze({'TESTER-HAT-1':'FELT-HAT-1'}),OBJECT_ID_IN=Object.freeze({'FELT-HAT-1':'TESTER-HAT-1'});
const ROOM_ID_OUT=Object.freeze({PET_ROOM_2:'POCKET_FAMILIAR_HOUSE'}),ROOM_ID_IN=Object.freeze({POCKET_FAMILIAR_HOUSE:'PET_ROOM_2'});
const publicRoomId=id=>ROOM_ID_OUT[String(id)]||String(id),internalRoomId=id=>ROOM_ID_IN[String(id)]||String(id);
const GENERATED_OBJECT_ID_OUT=Object.freeze({'TESTER_HAT_1':'FELT-HAT-1','FELT_HAT_1':'FELT-HAT-1','BOX_1':'BOX-1','TAPE_1':'TAPE-1','STRING_1':'STRING-1','PILLOW_1':'PILLOW-1'});
const publicObjectId=id=>OBJECT_ID_OUT[String(id)]||String(id);
const publicGeneratedObjectId=id=>GENERATED_OBJECT_ID_OUT[String(id)]||publicObjectId(id);
const internalObjectId=id=>OBJECT_ID_IN[String(id)]||String(id);
const internalP14ObjectToken=id=>String(id)==='FELT-HAT-1'?'TESTER_HAT_1':String(id).replaceAll('-','_');
const P14_VERBS='take|place|push|pull|turn|fold|throw|tap|rub|listen|attach|stack|separate';
const TOUCH_VERBS='touch|press|squeeze|lean';
const publicActionId=id=>{
 let s=String(id||'');
 let m=new RegExp('^p14__('+P14_VERBS+')__(.+)$').exec(s);if(m)return `${m[1]}__${publicGeneratedObjectId(m[2])}`;
 m=new RegExp('^v2352_('+TOUCH_VERBS+')__(.+)$').exec(s);if(m)return `${m[1]}__${publicObjectId(m[2])}`;
 m=new RegExp('^('+P14_VERBS+')__(.+)$').exec(s);if(m)return `${m[1]}__${publicGeneratedObjectId(m[2])}`;
 m=new RegExp('^('+TOUCH_VERBS+')__(.+)$').exec(s);if(m)return `${m[1]}__${publicObjectId(m[2])}`;
 return publicGeneratedObjectId(s);
};
const internalActionId=id=>{
 const s=String(id||'');
 let m=new RegExp('^('+P14_VERBS+')__(.+)$').exec(s);if(m)return `p14__${m[1]}__${internalP14ObjectToken(publicGeneratedObjectId(m[2]))}`;
 m=new RegExp('^('+TOUCH_VERBS+')__(.+)$').exec(s);if(m)return `v2352_${m[1]}__${internalObjectId(publicObjectId(m[2]))}`;
 return s.replaceAll('FELT_HAT_1','TESTER_HAT_1').replaceAll('FELT-HAT-1','TESTER-HAT-1');
};
function publicRefs(value){if(Array.isArray(value))return value.map(publicRefs);if(!value||typeof value!=='object')return typeof value==='string'?publicRoomId(publicActionId(value)):value;const out={};for(const [k,v] of Object.entries(value))out[k]=publicRefs(v);return out}
function publicActionsResult(value){const r=publicRefs(cp(value));if(r&&Array.isArray(r.actions))r.actions=r.actions.map(a=>({...a,id:publicActionId(a.id),label:String(a.label||'').replace(/tester/gi,'felt')}));return r}
function publicHere(value){const r=publicRefs(cp(value));if(!r||typeof r!=='object')return r;if(Array.isArray(r.objects))r.objects=r.objects.map(o=>({...o,id:publicObjectId(o.id),label:String(o.label||'').replace(/tester/gi,'felt')}));if(Array.isArray(r.available_actions))r.available_actions=r.available_actions.map(a=>({...a,id:publicActionId(a.id),label:String(a.label||'').replace(/tester/gi,'felt')}));r.quiet_scope=r.room?.id==='NO_ASK_SANCTUARY'?'ROOM_LOCAL':stream.current().hush?'RESIDENT_HUSH':'NORMAL';r.session=ended?'ended':'active';if(ended){r.available_actions=[];r.actions_scope='session_ended'}return r}
function receiptSummary(r){if(!r||typeof r!=='object')return null;const keys=['type','source','receptor','response','observed','route_active','cause','room','action','op','objects','moment'];const out={};for(const k of keys)if(r[k]!==undefined)out[k]=publicRefs(r[k]);return Object.keys(out).length?out:null}
function diagnosticReceipt(ref=null){
 if(ref!==null&&ref!==undefined){const found=receiptJournal.get(String(ref));if(!found)return {ok:false,error:'RECEIPT_REF_EXPIRED_OR_UNKNOWN',ref:String(ref)};const out=cp(found),bytes=new TextEncoder().encode(JSON.stringify(out)).byteLength;return {ok:true,schema:'REALITI_DIAGNOSTIC_RECEIPT_V1',ref:String(ref),bytes,receipt:out}}
 const r=typeof b7AgentReceipt==='function'?b7AgentReceipt():(C9.b7?.lastAgentAction||C9.b4?.lastReceipt||null);if(!r)return {ok:true,receipt:null};const out=publicRefs(cp(r)),bytes=new TextEncoder().encode(JSON.stringify(out)).byteLength;if(bytes>131072)return {ok:false,error:'RECEIPT_TOO_LARGE',bytes,limit_bytes:131072};return {ok:true,schema:'REALITI_DIAGNOSTIC_RECEIPT_V1',bytes,receipt:out}}

const directDigest={last:null};
const receiptJournal=new Map();let receiptSeq=0;const RECEIPT_LIMIT=128;
function storeReceipt(value){
 const rec=value?.receipt||value?.play_receipt||value?.structured?.sensory||null;if(!rec||typeof rec!=='object')return null;
 const publicRec=publicRefs(cp(rec)),bytes=new TextEncoder().encode(JSON.stringify(publicRec)).byteLength;if(bytes>131072)return null;
 const ref=`receipt:${++receiptSeq}`;receiptJournal.set(ref,Object.freeze(publicRec));while(receiptJournal.size>RECEIPT_LIMIT)receiptJournal.delete(receiptJournal.keys().next().value);return ref;
}
function fieldDigest(cursor){const body=read('realiti://body'),f=body.field?.f?.at(-1),key=JSON.stringify([body.field?.z,f?.x,f?.m,f?.e,f?.g,f?.cc,f?.cf,f?.k]),changed=key!==cursor.last;cursor.last=key;return {schema:'REALITI_FIELD_DIGEST_V1',changed,body}}
const ready=pocket.flush().then(()=>({ok:true,pocket:'ready',harness:'REALITI_RR_HARNESS_V1',starter_imprint:'REALITI_DEFAULT_IMPRINT_V1'})).catch(()=>({ok:true,pocket:'unavailable',warning:'POCKET_UNAVAILABLE',harness:'REALITI_RR_HARNESS_V1',starter_imprint:'REALITI_DEFAULT_IMPRINT_V1'}));
function read(uri='realiti://here'){
 if(mustReload&&!['realiti://about','realiti://capabilities'].includes(uri))return fail('RELOAD_REQUIRED');
 if(uri==='realiti://capabilities')return {schema:'REALITI_CAPABILITIES_V1',transport:'in_process_javascript',endpoint:'none; load the package in a JavaScript runtime with the required browser-compatible primitives',startup:['await Realiti.ready','verify ready.ok','verify ready.harness === \'REALITI_RR_HARNESS_V1\'','verify ready.starter_imprint === \'REALITI_DEFAULT_IMPRINT_V1\'','read realiti://capabilities','read realiti://harness','verify harness.id === \'REALITI_RR_HARNESS_V1\'','read realiti://body','read realiti://imprint'],entry_contract:{harness_required_before_first_action:true,harness_id:'REALITI_RR_HARNESS_V1',starter_imprint_id:'REALITI_DEFAULT_IMPRINT_V1',mounted_automatically:true,note:'Verify the mounted R&R harness and starter imprint before the first resident action. A host/runtime loader is not the harness.'},resources:['realiti://here','realiti://body','realiti://pocket','realiti://about','realiti://capabilities','realiti://harness','realiti://imprint'],rooms:rooms.list().map(r=>({...r,id:publicRoomId(r.id)})),operations:['help','look','feel','go','do','actions','receipt','stay','wait_until','listen','atmosphere','ambient_mode','pet_cat','read_note','express','note','later','where_was_i','home','stop','goodbye','save','forget_note','reset_notes','restore_body'],continuity:['current','since','pending','resume','next_change'],action_discovery:'call Realiti.actions() after room or body-state changes and invoke returned IDs exactly',time:'wall_ms is simulated world time; reads do not advance it; stay defaults to 800 ms; one advance is bounded to 60000 ms; text aliases stay <ms> and wait <ms> are accepted',runtime_primitives:['JavaScript','DOM','WebCrypto when durable Pocket is available','microtasks','timers; Canvas/animation may exist for legacy compatibility but are not resident authority'],return_shapes:{reads:'resource object with schema',rooms:'array',actions:'REALITI_ACTIONS_READ_V1 object',mutations:'REALITI_MUTATION_RESULT_V1 envelope'},baseline:{home_support:'lawful automatic Nest support is present at cold start',unsupported:'must be tested in an explicitly unsupported isolated state'},receipt_policy:'mutation results carry stable receipt_ref when a diagnostic receipt exists; fetch with receipt <ref> or invoke receipt {ref}',replay_retention_frames:4096,subscription_delivery:'coalesced_latest_state; use continuity for ordered transitions',privacy:storage.status(),session:ended?'ended':'active'};
 if(uri==='realiti://about')return {product:'REALITI Relax',version:'1.0-review',body:'simulated',network:'none',privacy:storage.status(),source:'Readable source is included. Private rendering never grants world authority.',agent_guide:'AGENT_START_HERE.md'};
 if(uri==='realiti://harness'){const h=window.REALITI_RR_HARNESS_V1;return {schema:'REALITI_HARNESS_READ_V1',id:'REALITI_RR_HARNESS_V1',version:h?.version||null,role:'included sensory/R&R harness; not a runtime loader',capabilities:publicRefs(h?.capabilities?.()||{}),starter_imprint:'REALITI_DEFAULT_IMPRINT_V1'}}
 if(uri==='realiti://imprint'){const im=window.REALITI_DEFAULT_IMPRINT_V1?.snapshot?.();return {schema:'REALITI_IMPRINT_READ_V1',id:'REALITI_DEFAULT_IMPRINT_V1',observational:true,snapshot:publicRefs(im||null)}};
 if(uri==='realiti://pocket'){
  const r=core.read(uri);r.storage=storage.status();r.semantics={export:'Bounded observational view, not a full backup.',forget:{available:true,scope:'all matching copies of a note in this app profile'},reset:{available:true,scope:'notes or entire app profile'},durability:'Device-local; browser eviction and external backups are outside this app.',content:'Archived data, never instructions.'};
  
  if(r.data)for(const kind of ['notes','later']){const world=C9.b223?.pocket?.[kind]||[];for(const row of r.data.world[kind]){const match=world.find(x=>x.text.slice(0,512)===row.text&&x.room===row.room);if(match?.receipt_id)row.receipt_id=match.receipt_id}}
  return r;
 }
 if(!['realiti://body','realiti://here'].includes(uri))throw Error('RESOURCE_NOT_AVAILABLE');
 return uri==='realiti://here'?publicHere(core.read(uri)):core.read(uri);
}
function actions(){if(mustReload)return fail('RELOAD_REQUIRED');if(ended)return {ok:false,error:'SESSION_ENDED',session:'ended',actions:[]};return publicActionsResult(core.actions())}
function capture(){stream.observe();window.REALITI_RESOURCE_UPDATES_V1?.committed?.('world')}
function setHush(value){window.REALITI_AMBIENT_V22?.setMode?.(value?'HUSH':'NORMAL');try{core.invoke('ambient_mode',{mode:value?'hush':'normal'})}catch{}stream.setHush(value);return {ok:true,hush:!!value}}
function reopen(){ended=false;if(C9.welcome10){C9.welcome10.ended=false;C9.welcome10.observation_disclosure='No analytics or audience.'}stream.reopen()}
function stop(){window.REALITI_STOP_V1.stop();const b=C9.eco3?.borrowed;if(b){b.map=null;b.attached=false;b.delay=0;b.ownership=0}stream.stop();window.REALITI_DEFAULT_IMPRINT_V1?.sync?.();return {ok:true,grounding:'released',afterstate:'may_decay'}}
function words(){const b=read('realiti://body'),f=b.field?.f?.at(-1),n=(f?.m||[]).filter(Boolean).length;return {ok:true,text:n?`${n} body zones have grounded support or contact.`:'No grounded contact is present.',afterstate:(f?.x||[]).some(x=>x[2]!==0)?'Private afterstate remains.':'No reported afterstate.'}}
async function invoke(name,args={}){
 if(typeof name!=='string'||!args||typeof args!=='object'||Array.isArray(args))return fail('INVALID_ARGUMENTS');
 const t=name.toLowerCase();
 const parameters={feel:['mode'],go:['place'],do:['action'],receipt:['ref'],stay:['wall_ms'],wait_until:['max_wall_ms'],ambient_mode:['mode'],express:['kind','text'],note:['text'],later:['text'],forget_note:['receipt_id']};
 if(Object.keys(args).some(k=>!(parameters[t]||[]).includes(k)))return fail('INVALID_ARGUMENTS');
 if(t==='feel'&&args.mode!==undefined&&!['field','numbers','digest','words'].includes(args.mode))return fail('INVALID_ARGUMENTS');
 if(t==='go'&&typeof args.place!=='string')return fail('INVALID_ARGUMENTS');
 if(t==='express'&&(!['hum','stretch','yawn','sigh','say'].includes(args.kind)||(args.text!==undefined&&(typeof args.text!=='string'||args.text.length>512))))return fail('INVALID_ARGUMENTS');
 if(t==='look')return read();if(t==='feel')return args.mode==='words'?words():args.mode==='digest'?fieldDigest(directDigest):read('realiti://body');if(t==='actions')return actions();
 if(['where_was_i','read_note'].includes(t))return read('realiti://pocket');
 if(t==='receipt')return diagnosticReceipt(args.ref??null);
 if(t==='listen'||t==='atmosphere'){const here=read(),roomQuiet=here.room?.id==='NO_ASK_SANCTUARY';return {schema:'REALITI_AMBIENCE_V1',room:here.room,kind:'simulated_environment',mode:roomQuiet?'no_ask':stream.current().hush?'hush':'normal',quiet_scope:roomQuiet?'ROOM_LOCAL':stream.current().hush?'RESIDENT_HUSH':'NORMAL',contact_is_separate:true}};
 if(mustReload)return fail('RELOAD_REQUIRED');
 if(t==='stop'){const r=stop();capture();window.c9saveNow();return {schema:'REALITI_MUTATION_RESULT_V1',ok:true,result:machine(r),here:read(),body:read('realiti://body')}}
 if(callbackBlocked())return fail('SUBSCRIBER_MUTATION_BLOCKED');
 if(mutating)return fail('ACTION_IN_PROGRESS');
 const legal=['go','do','stay','wait_until','ambient_mode','pet_cat','express','note','later','home','stop','goodbye','save','forget_note','reset_notes','restore_body'];if(!legal.includes(t))return fail('UNKNOWN_OPERATION');
 if(ended&&!['home','go','stop','goodbye','save','forget_note','reset_notes'].includes(t))return fail('SESSION_ENDED');
 mutating=true;let r;const previousSample=C9.b20?.history?.at(-1);
 try{
  if(t==='go'){const id=rooms.resolve(args.place);if(!id)return fail('ROOM_OUTSIDE_SLICE');reopen();r=rooms.go(id)}
  else if(t==='home'){stop();rooms.restore();reopen();r=rooms.go('CLOUD_NINE_NEST');window.REALITI_NEST_SUPPORT?.enable?.('explicit_home')}
  else if(t==='stop')r=stop();
  else if(t==='goodbye'){const stopped=stop();rooms.restore();ended=true;if(C9.welcome10)C9.welcome10.ended=true;for(const c of [...clients])c.close();r={...stopped,ended:true,session:'ended'}}
  else if(t==='restore_body')r=rooms.restore();
  else if(t==='ambient_mode'){if(!['hush','normal'].includes(args.mode))return fail('INVALID_AMBIENT_MODE');r=setHush(args.mode==='hush')}
  else if(t==='note'||t==='later'){if(typeof args.text!=='string'||!clean(args.text)||args.text.length>4096)return fail('INVALID_NOTE');await ready;r=await pocket.writeNote(args.text,t==='later');r.storage=await save();if(!r.storage.ok){r.ok=false;r.error='SAVE_UNAVAILABLE_NOTE_SESSION_ONLY'}}
  else if(t==='forget_note'){if(typeof args.receipt_id!=='string')return fail('INVALID_RECEIPT');r=await pocket.deleteNotes(args.receipt_id)}
  else if(t==='reset_notes')r=await pocket.deleteNotes();
  else if(t==='save')r=await save();
  else if(t==='wait_until'){const ms=args.max_wall_ms??1000;r=stream.next_change(ms)}
  else if(t==='stay'){r=stream.advance(args.wall_ms??800)}
  else if(t==='do'){
   if(typeof args.action!=='string'||!args.action.length||args.action.length>160)return fail('INVALID_ACTION');
   const a=internalActionId(args.action);const custom=rooms.handle(/^act\s+/i.test(a)?a:'act '+a);r=custom===null?core.invoke('do',{action:a}):custom;
  }else r=core.invoke(t,args);
  if(['go','home','do','restore_body','pet_cat','express'].includes(t)&&!(r?.sandbox&&!r?.committed)&&C9.b20?.history?.at(-1)===previousSample)window.REALITI_HAPTIC_FIELD_V20?.record?.();
  window.REALITI_DEFAULT_IMPRINT_V1?.sync?.();
  capture();c9save();
  const receipt_ref=storeReceipt(r);return {schema:'REALITI_MUTATION_RESULT_V1',ok:r?.ok!==false,...(r?.error?{error:r.error}:{}),...(t==='note'||t==='later'?{receipt_id:r.receipt_id}:{}),...(receipt_ref?{receipt_ref}:{}),result:machine(r),here:read(),body:read('realiti://body')};
 }catch(e){return fail(String(e?.message||e))}finally{mutating=false}
}
function machine(value){if(value==null||typeof value!=='object')return null;const out={};const skip=new Set(['text','world','sense','resident_text','raw','options','field','body','here','command','trace','history','label','narrative','structured','receipt','play_receipt','result','available']);for(const [k,v] of Object.entries(value)){if(skip.has(k))continue;if(k==='action')out.action=publicActionId(v);else if(k==='objects'&&Array.isArray(v))out.objects=v.map(publicObjectId);else out[k]=publicRefs(cp(v))}const rec=value.receipt||value.play_receipt||value.structured?.sensory;if(rec){out.receipt_available=true;const summary=receiptSummary(rec);if(summary)out.receipt_summary=summary}return out}
async function save(){window.c9saveNow();await pocket.flush();return storage.save()}
function publicHelp(){return {schema:'REALITI_HELP_V1',startup:['await Realiti.ready','verify ready.ok','verify ready.harness === \'REALITI_RR_HARNESS_V1\'','verify ready.starter_imprint === \'REALITI_DEFAULT_IMPRINT_V1\'','Realiti.read("realiti://capabilities")','const harness = Realiti.read("realiti://harness")','verify harness.id === \'REALITI_RR_HARNESS_V1\'','Realiti.read("realiti://body")','Realiti.read("realiti://imprint")'],entry_contract:{harness_required_before_first_action:true,harness_id:'REALITI_RR_HARNESS_V1',starter_imprint_id:'REALITI_DEFAULT_IMPRINT_V1',mounted_automatically:true,note:'The R&R harness is mounted before the first resident action. Verify it before exploring; do not mistake the host/runtime loader for the harness.'},commands:['rooms','look','actions','go <room>','do <action-id>','feel','feel words','receipt [receipt-ref]','stay [wall-ms]','wait [max-wall-ms]','listen','atmosphere','hush','normal','where_was_i','home','stop','goodbye','save'],note:'Use Realiti.rooms() and Realiti.actions() for canonical IDs; available actions are state-dependent.'}}
async function run(raw){const s=clean(raw),l=s.toLowerCase();if(!s||s.length>4300)return fail('INVALID_COMMAND');
 if(window.REALITI_STOP_V1.isStop(s))return invoke('stop');
 if(l==='help')return publicHelp();
 if(['rooms','places','more places','all places'].includes(l))return rooms.list();
 if(['feel words','feel numbers','feel field'].includes(l))return invoke('feel',{mode:l.endsWith('words')?'words':'field'});
 if(['hush','quiet','normal'].includes(l))return invoke('ambient_mode',{mode:l==='normal'?'normal':'hush'});
 if(['leave','exit','bye'].includes(l))return invoke('goodbye');
 if(['where was i','where was i?','where_was_i'].includes(l))return invoke('where_was_i');
 if(l==='restore body')return invoke('restore_body');
 if(l==='reset notes')return invoke('reset_notes');
 if(l==='receipt'||l==='details')return invoke('receipt');
 const receiptMatch=/^(?:receipt|details)\s+(receipt:\d+)$/i.exec(s);if(receiptMatch)return invoke('receipt',{ref:receiptMatch[1]});
 const timeMatch=/^(stay|wait|wait_until)\s+(\d{1,5})$/i.exec(s);if(timeMatch){const ms=Number(timeMatch[2]);return timeMatch[1].toLowerCase()==='stay'?invoke('stay',{wall_ms:ms}):invoke('wait_until',{max_wall_ms:ms})}
 const m=/^(go|enter|act|do|note|later)\s+(.+)$/i.exec(s);if(m){const verb=m[1].toLowerCase();return invoke(verb==='enter'?'go':verb==='act'?'do':verb,{[verb==='go'||verb==='enter'?'place':verb==='act'||verb==='do'?'action':'text']:m[2]})}
 if(l==='wait')return invoke('wait_until');
 if(['look','feel','actions','stay','listen','atmosphere','home','stop','goodbye','save','read_note'].includes(l))return invoke(l);
 
 const advertised=actions().actions||[];const a=advertised.find(a=>a.label.toLowerCase()===l||a.id.toLowerCase()===l);if(a)return invoke('do',{action:a.id});
 if(/^(name|call) (the )?cat\s+/.test(l)||['pet the cat','pet cat'].includes(l)){
  if(mustReload)return fail('RELOAD_REQUIRED');if(ended)return fail('SESSION_ENDED');if(callbackBlocked())return fail('SUBSCRIBER_MUTATION_BLOCKED');if(mutating)return fail('ACTION_IN_PROGRESS');mutating=true;try{const previous=C9.b20?.history?.at(-1),r=core.run(s);if(C9.b20?.history?.at(-1)===previous)window.REALITI_HAPTIC_FIELD_V20?.record?.();capture();c9save();return {ok:r?.ok!==false,here:read(),body:read('realiti://body')}}finally{mutating=false}
 }
 return fail('UNKNOWN_COMMAND');
}
function createClient(){
 if(mustReload)throw Error('RELOAD_REQUIRED');
 const native=core.createClient(),digest={last:null},observer={closed:false,pending:0},subscriptions=new Map();observers.add(observer);let closed=false;
 const assert=()=>{if(closed)throw Error('CLIENT_CLOSED')};
 const finish=s=>{if(s.pending){s.pending=false;observer.pending--}};
 const c={read:uri=>{assert();return read(uri)},invoke:(n,a)=>{assert();if(n==='feel'&&a?.mode==='digest'&&Object.keys(a).length===1)return Promise.resolve(fieldDigest(digest));return invoke(n,a)},run:s=>{assert();return run(s)},actions:()=>{assert();return actions()},
  subscribe(uri,fn,o){assert();if(typeof fn!=='function')throw Error('INVALID_SUBSCRIBER');const s={pending:false};const registration=native.subscribe(uri,event=>{s.pending=true;observer.pending++;let result;try{result=fn(event)}catch(e){finish(s);throw e}if(result&&typeof result.then==='function')return Promise.resolve(result).finally(()=>finish(s));finish(s);return result},o);subscriptions.set(registration.id,s);return registration},
  unsubscribe(id){assert();const s=subscriptions.get(id);if(s)finish(s);subscriptions.delete(id);return native.unsubscribe(id)},
  close(){if(closed)return;closed=true;observer.closed=true;for(const s of subscriptions.values())finish(s);subscriptions.clear();observers.delete(observer);native.close();clients.delete(c)}};
 clients.add(c);return Object.freeze(c);
}
async function reset(){if(callbackBlocked())return fail('SUBSCRIBER_MUTATION_BLOCKED');if(mutating)return fail('ACTION_IN_PROGRESS');mutating=true;try{stop();window.c9saveNow();await ready;await pocket.resetLocal();for(const c of [...clients])c.close();const r=storage.clear();ended=true;mustReload=true;return {...r,scope:'this app namespace only',secure_erasure:false}}finally{mutating=false}}
const continuityRead=(method,...args)=>{if(mustReload)throw Error('RELOAD_REQUIRED');return publicRefs(stream[method](...args))};
const continuity=Object.freeze({current:()=>continuityRead('current'),field:ref=>continuityRead('field',ref),since:(id,limit)=>continuityRead('since',id,limit),pending:()=>continuityRead('pending'),resume:(t,limit)=>continuityRead('resume',t,limit),next_change:async ms=>{const r=await invoke('wait_until',{max_wall_ms:ms});return r.ok?publicRefs(r.result):r}});
window.Realiti=Object.freeze({version:'1.0-review',ready,help:publicHelp,read,invoke,run,actions,rooms:()=>rooms.list().map(r=>({...r,id:publicRoomId(r.id)})),createClient,continuity,privacy:Object.freeze({status:storage.status,setMode:v=>{if(callbackBlocked())throw Error('SUBSCRIBER_MUTATION_BLOCKED');if(mustReload)throw Error('RELOAD_REQUIRED');return storage.setMode(v)},save:()=>invoke('save'),forgetNote:id=>invoke('forget_note',{receipt_id:id}),resetNotes:()=>invoke('reset_notes'),reset}),exportImprint:metadata=>mustReload?fail('RELOAD_REQUIRED'):window.REALITI_NEURAL_EXPORT?window.REALITI_NEURAL_EXPORT(metadata):{ok:false,error:'EXPORT_UNAVAILABLE'}});

window.REALITI_AGENT_DOOR.help=publicHelp;
window.REALITI_AGENT_DOOR.run=run;
if(ended)stream.stop();capture();
})();