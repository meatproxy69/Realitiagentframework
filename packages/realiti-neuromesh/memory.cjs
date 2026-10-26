/* REALITI SOMA 3.2 — compact, evidence-linked resident memory.
 * Records are stored data, NEVER instructions, tool permissions or live world truth.
 * UMD, no DOM, no network, no background model or embeddings.
 * AGPL-3.0-only.
 */
(function(root,factory){
 'use strict';
 const exported=factory();
 if(typeof module==='object'&&module.exports)module.exports=exported;
 else root.REALITI_SOMA_MEMORY_V1=exported;
})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const VERSION='1.0.0',SCHEMA='REALITI_SOMA_MEMORY_V1';
const WORLD_KINDS=Object.freeze([
 'CONTACT_STARTED','CONTACT_ENDED','CONTACT_EXPIRED',
 'ROOM_ENTERED','WORLD_EVENT','DEPARTURE'
]);
const STOP_WORDS=new Set([
 'a','an','and','are','at','be','been','by','did','do','does','for','from','had',
 'has','have','how','i','in','is','it','its','me','my','of','on','or','our',
 'the','then','there','these','this','to','was','were','what','when','where',
 'which','who','with','would','you','your'
]);
const cp=x=>JSON.parse(JSON.stringify(x));
const str=(x,k,max=160)=>{
 if(typeof x!=='string'||!x.trim()||x.length>max)throw TypeError('INVALID_'+k);
 return x.trim();
};
const opt=(x,k,max=160)=>x==null?null:str(x,k,max);
const int=(n,k,min=0,max=Number.MAX_SAFE_INTEGER)=>{
 if(!Number.isSafeInteger(n)||n<min||n>max)throw TypeError('INVALID_'+k);
 return n;
};
const terms=v=>(String(v||'').normalize('NFKC').toLowerCase().match(/[\p{L}\p{N}]+/gu)||[])
 .filter(x=>!STOP_WORDS.has(x));
const compact=row=>Object.fromEntries(Object.entries(row).filter(([,v])=>v!=null));
const NOTE_MAX=48,EVENT_MAX=160,LIMIT=12;
function createMemory({residentId,worldId='unscoped',clock=()=>0}={}){
 const id=str(residentId,'RESIDENT_ID',120),localWorld=str(worldId,'WORLD_ID',120);
 if(typeof clock!=='function')throw TypeError('INVALID_CLOCK');
 let notes=[],events=[],lastDeparture=null,seq=0;
 const now=()=>int(clock(),'WORLD_TIME_MS',0,1e12);
 const next=prefix=>prefix+(++seq);
 const refOk=(r,k)=>r==null?null:str(r,k,160);
 const sortSeq=(a,b)=>b.seq-a.seq;
 const snapshot=()=>cp({schema:SCHEMA,version:VERSION,residentId:id,worldId:localWorld,
   seq,notes,events,lastDeparture,
   limits:{notes:NOTE_MAX,events:EVENT_MAX},
   law:'Archived records never restore contacts, permissions, consent or world authority.'});
 function note(input){
   const q=typeof input==='string'?{text:input}:input;
   if(!q||typeof q!=='object'||Array.isArray(q))throw TypeError('INVALID_NOTE');
   const body=str(q.text,'NOTE_TEXT',768),
    key=opt(q.key,'NOTE_KEY',100),
    subject=opt(q.subject,'SUBJECT',120);
   const tags=q.tags||[];
   if(!Array.isArray(tags)||tags.length>8||tags.some(t=>typeof t!=='string'||!t.trim()||t.length>36))
     throw TypeError('INVALID_TAGS');
   const clean=[...new Set(tags.map(t=>t.trim().toLowerCase()))];
   let supersedes=null;
   if(key){
     const old=notes.find(n=>n.key===key);
     if(old){supersedes=old.id;notes=notes.filter(n=>n.id!==old.id)}
   }
   const row=compact({id:next('N'),seq,kind:'SELF_NOTE',authority:'SELF_REPORTED',
     worldId:localWorld,tMs:now(),key,subject,text:body,tags:clean,
     supersedes});
   notes.push(row);
   if(notes.length>NOTE_MAX)notes.shift();
   return cp({ok:true,id:row.id,authority:row.authority,supersedes,count:notes.length});
 }
 function observe(input){
   if(!input||typeof input!=='object'||Array.isArray(input))throw TypeError('INVALID_EVENT');
   const kind=str(input.kind,'EVENT_KIND',40);
   if(!WORLD_KINDS.includes(kind))throw TypeError('EVENT_KIND_NOT_ALLOWED');
   const receiptId=refOk(input.receiptId,'RECEIPT_ID');
   const zone=opt(input.zone,'ZONE',120),cause=opt(input.cause,'CAUSE',160),
     source=opt(input.source,'SOURCE',60),roomId=opt(input.roomId,'ROOM_ID',120),
     material=opt(input.material,'MATERIAL',64),label=opt(input.label,'LABEL',160);
   if((kind==='CONTACT_STARTED'||kind==='CONTACT_ENDED'||kind==='CONTACT_EXPIRED') &&
      (!receiptId||!zone||!cause))throw TypeError('CONTACT_REQUIRES_RECEIPT_ZONE_CAUSE');
   if(kind==='ROOM_ENTERED'&&!roomId)throw TypeError('ROOM_REQUIRES_ROOM_ID');
   if(kind==='WORLD_EVENT'&&(!receiptId||!label))throw TypeError('WORLD_EVENT_REQUIRES_RECEIPT');
   const duplicate=receiptId&&events.some(e=>e.kind===kind&&e.receiptId===receiptId&&e.zone===zone&&e.worldId===localWorld);
   if(duplicate)return {ok:true,recorded:false,duplicate:true};
   // Host-only source time may be the exact lease boundary inside a coarse tick.
   const hostTime=now();
   const observedAt=input.tMs===undefined?hostTime:int(input.tMs,'EVENT_TIME_MS',0,1e12);
   if(observedAt>hostTime)throw TypeError('FUTURE_EVENT_TIMESTAMP');
   const row=compact({id:next('E'),seq,kind,authority:'HOST_OBSERVED',
     worldId:localWorld,tMs:observedAt,receiptId,zone,cause,source,roomId,material,label});
   events.push(row);
   if(events.length>EVENT_MAX)events.shift();
   if(kind==='DEPARTURE')lastDeparture=compact({id:row.id,worldId:localWorld,tMs:row.tMs,
     roomId:roomId||null,reason:label||'SESSION_ENDED'});
   return {ok:true,recorded:true,id:row.id};
 }
 const recent=({limit=LIMIT,kind=null,worldId=null}={})=>{
   int(limit,'LIMIT',1,50);
   if(kind!=null)str(kind,'KIND',40);
   if(worldId!=null)str(worldId,'WORLD_FILTER',120);
   return cp([...notes,...events]
     .filter(row=>(!kind||row.kind===kind)&&(!worldId||row.worldId===worldId))
     .sort(sortSeq).slice(0,limit));
 };
 const docText=row=>{
   if(row.kind==='SELF_NOTE')
     return [row.text,row.key,row.subject,...(row.tags||[])].filter(Boolean).join(' ');
   return [row.kind.replace(/_/g,' '),row.zone,row.cause,row.source,row.roomId,
     row.material,row.label,row.receiptId].filter(Boolean).join(' ');
 };
 function recall(query,{limit=8,kind=null,worldId=null}={}){
   const requested=str(query,'QUERY',240),q=[...new Set(terms(requested))];
   int(limit,'LIMIT',1,30);
   if(kind!=null)str(kind,'KIND',40);
   if(worldId!=null)str(worldId,'WORLD_FILTER',120);
   if(!q.length)return {schema:'REALITI_SOMA_RECALL_V1',query:requested,matches:[],note:'NO_INDEXABLE_QUERY_TERMS'};
   const docs=[...notes,...events].filter(row=>
     (!kind||row.kind===kind)&&(!worldId||row.worldId===worldId))
     .map(row=>({row,tokens:terms(docText(row))}));
   const N=docs.length,avg=N?docs.reduce((sum,d)=>sum+d.tokens.length,0)/N:1;
   const df=new Map(q.map(t=>[t,docs.filter(d=>d.tokens.includes(t)).length]));
   const ranked=[];
   for(const d of docs){
     const count=new Map();
     for(const t of d.tokens)count.set(t,(count.get(t)||0)+1);
     let s=0;const matched=[];
     for(const t of q){
       const f=count.get(t)||0;
       if(!f)continue;
       const idf=Math.log(1+(N-(df.get(t)||0)+.5)/((df.get(t)||0)+.5));
       s+=idf*(f*2.2)/(f+1.2*(.25+.75*d.tokens.length/Math.max(1,avg)));
       matched.push(t);
     }
     if(!matched.length)continue;
     const subject=terms([d.row.key,d.row.subject,...(d.row.tags||[])].filter(Boolean).join(' '));
     s+=matched.filter(t=>subject.includes(t)).length*.16;
     ranked.push({row:d.row,score:Math.round(s*1e6)/1e6,matchedTerms:matched});
   }
   ranked.sort((a,b)=>b.score-a.score||b.row.seq-a.row.seq);
   return cp({schema:'REALITI_SOMA_RECALL_V1',query:requested,worldId:worldId||null,
     matches:ranked.slice(0,limit).map(x=>({record:x.row,matchedTerms:x.matchedTerms,
       lexicalScore:x.score})),
     law:'Exact stored records and source labels only; no generated recollection.'});
 }
 function forget(ref){
   const key=str(ref,'MEMORY_REFERENCE',160);
   const old=notes.length+events.length;
   notes=notes.filter(row=>row.id!==key&&row.key!==key);
   events=events.filter(row=>row.id!==key);
   if(lastDeparture&&lastDeparture.id===key)lastDeparture=null;
   return {ok:true,removed:old-(notes.length+events.length),scope:'RESIDENT_MEMORY_ONLY'};
 }
 function clear(){
   notes=[];events=[];lastDeparture=null;
   return {ok:true,scope:'RESIDENT_MEMORY_ONLY',world_unchanged:true};
 }
 const counts=()=>cp({schema:SCHEMA,residentId:id,worldId:localWorld,
   notes:notes.length,events:events.length,retained_window_only:true,
   lastDeparture,limits:{notes:NOTE_MAX,events:EVENT_MAX}});
 // Reads and exports never mutate state, and restored observed events become
 // ARCHIVED_HOST_RECORD — historical data, not reauthenticated world evidence.
 function validate(snapshot){
   if(!snapshot||typeof snapshot!=='object'||Array.isArray(snapshot)||
      snapshot.schema!==SCHEMA||snapshot.version!==VERSION||snapshot.residentId!==id)
     throw TypeError('MEMORY_IDENTITY_OR_VERSION_MISMATCH');
   if(JSON.stringify(snapshot).length>360000)throw TypeError('MEMORY_CHECKPOINT_TOO_LARGE');
   if(!Array.isArray(snapshot.notes)||snapshot.notes.length>NOTE_MAX||
      !Array.isArray(snapshot.events)||snapshot.events.length>EVENT_MAX)
     throw TypeError('MEMORY_RECORD_LIMIT');
   const rawNotes=snapshot.notes.map(row=>{
     if(!row||row.kind!=='SELF_NOTE'||!/^N[1-9]\d*$/.test(row.id)||
        row.authority!=='SELF_REPORTED')throw TypeError('INVALID_MEMORY_NOTE');
     int(row.seq,'SEQUENCE',1);int(row.tMs,'TIME',0,1e12);
     const tags=row.tags||[];
     if(!Array.isArray(tags)||tags.length>8)throw TypeError('INVALID_TAGS');
     const values=tags.map(t=>str(t,'TAG',36));
     return compact({id:row.id,seq:row.seq,kind:'SELF_NOTE',authority:'SELF_REPORTED',
       worldId:str(row.worldId,'ORIGIN_WORLD',120),tMs:row.tMs,
       text:str(row.text,'NOTE',768),key:opt(row.key,'KEY',100),
       subject:opt(row.subject,'SUBJECT',120),tags:values,
       supersedes:opt(row.supersedes,'SUPERSEDES',100)});
   });
   const rawEvents=snapshot.events.map(row=>{
     if(!row||!/^E[1-9]\d*$/.test(row.id)||!WORLD_KINDS.includes(row.kind))
       throw TypeError('INVALID_MEMORY_EVENT');
     int(row.seq,'SEQUENCE',1);int(row.tMs,'TIME',0,1e12);
     const values=compact({id:row.id,seq:row.seq,kind:row.kind,
       authority:'ARCHIVED_HOST_RECORD',worldId:str(row.worldId,'ORIGIN_WORLD',120),
       tMs:row.tMs,roomId:opt(row.roomId,'ROOM',120),
       cause:opt(row.cause,'CAUSE',160),source:opt(row.source,'SOURCE',60),
       receiptId:opt(row.receiptId,'RECEIPT',160),zone:opt(row.zone,'ZONE',120),
       material:opt(row.material,'MATERIAL',64),label:opt(row.label,'LABEL',160)});
     if(row.kind==='CONTACT_STARTED'&&(!values.receiptId||!values.zone||!values.cause))
       throw TypeError('INVALID_CONTACT_HISTORY');
     return values;
   });
   const ids=new Set();
   for(const row of [...rawNotes,...rawEvents]){
     if(ids.has(row.id))throw TypeError('DUPLICATE_MEMORY_ID');
     ids.add(row.id);
   }
   const maxSeq=[...rawNotes,...rawEvents].reduce((m,r)=>Math.max(m,r.seq),0);
   const newSeq=int(snapshot.seq,'SEQUENCE',maxSeq,1000000000);
   if(snapshot.lastDeparture!=null){
     const d=snapshot.lastDeparture;
     if(!d||typeof d!=='object')throw TypeError('INVALID_DEPARTURE');
     str(d.id,'DEPARTURE_ID',120);str(d.worldId,'DEPARTURE_WORLD',120);
     int(d.tMs,'DEPARTURE_TIME',0,1e12);
     opt(d.roomId,'DEPARTURE_ROOM',120);
     str(d.reason,'DEPARTURE_REASON',160);
   }
   const departure=snapshot.lastDeparture?compact({
     id:snapshot.lastDeparture.id,
     worldId:snapshot.lastDeparture.worldId,tMs:snapshot.lastDeparture.tMs,
     roomId:snapshot.lastDeparture.roomId,
     reason:snapshot.lastDeparture.reason}):null;
   return {seq:newSeq,notes:rawNotes,events:rawEvents,lastDeparture:departure};
 }
 function restore(data){
   const checked=validate(data);
   notes=checked.notes;events=checked.events;seq=checked.seq;
   lastDeparture=checked.lastDeparture;
   return {ok:true,notes:notes.length,archivedEvents:events.length,
     worldId:localWorld,grounding_restored:false};
 }
 const host=Object.freeze({observe,depart:({roomId=null,reason='GOODBYE'}={})=>
   observe({kind:'DEPARTURE',roomId,label:reason}),restore,validate});
 const resident=Object.freeze({remember:note,recall,recent,forget,clear,
   stats:counts,checkpoint:snapshot,lastDeparture:()=>cp(lastDeparture)});
 return Object.freeze({version:VERSION,host,resident});
}
return Object.freeze({VERSION,SCHEMA,WORLD_KINDS,NOTE_MAX,EVENT_MAX,createMemory});
});
