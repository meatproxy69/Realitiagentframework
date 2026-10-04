'use strict';
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {openResident}=require('../index.cjs');

const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-memory-'));
const storagePath=path.join(dir,'local-storage.json');
const checks={},details={};
const check=(k,v,d)=>{checks[k]=!!v;if(d!==undefined)details[k]=d};

async function open(id){return openResident({htmlPath:html,residentId:id,storagePath})}

(async()=>{
 let a=await open('agent-a');
 try{
  check('resident_id_bound',a.residentId==='agent-a',a.residentId);
  const m0=a.publicApi.read('realiti://memory');
  check('fresh_store_is_empty',m0.resident_id==='agent-a'&&m0.memory_count===0&&m0.last_departure===null,m0);
  const wr=await a.door.run('remember the blue lantern beside the east turn');
  check('remember_writes_current_resident',wr.ok&&wr.resident_id==='agent-a'&&wr.memory.text.includes('blue lantern'),wr);
  await a.door.run('go LANTERN_MAZE');
  const bye=await a.door.run('goodbye');
  check('goodbye_records_departure',bye.memory_saved?.resident_id==='agent-a'&&bye.memory_saved?.departure===true,bye.memory_saved);
 }finally{a.close()}

 let b=await open('agent-b');
 try{
  const mb=b.publicApi.read('realiti://memory');
  check('resident_b_isolated',mb.resident_id==='agent-b'&&mb.memory_count===0&&mb.last_departure===null,mb);
  await b.door.run('remember the kite line hummed in the wind');
  b.close();b=null;
 }finally{if(b)b.close()}

 a=await open('agent-a');
 try{
  const ma=a.publicApi.read('realiti://memory');
  check('resident_a_survives_reopen',ma.memory_count===1&&ma.memories[0].text.includes('blue lantern'),ma);
  check('departure_belongs_to_a',ma.last_departure?.resident_id==='agent-a'&&ma.last_departure?.room==='LANTERN_MAZE',ma.last_departure);
  const rec=await a.door.run('recall lantern');
  check('recall_finds_relevant_detail',rec.results?.length===1&&rec.results[0].text.includes('blue lantern'),rec);
  check('recall_does_not_cross_residents',!JSON.stringify(rec).includes('kite line'),rec);
  const where=await a.door.run('where_was_i');
  check('where_was_i_carries_resident_memory',where.resident_memory?.resident_id==='agent-a'&&where.resident_memory?.last_departure?.room==='LANTERN_MAZE',where.resident_memory);
  await a.door.run('home');
  await a.door.run('go KITE_FIELD');
 }finally{a.close()}

 a=await open('agent-a');
 try{
  const ma2=a.publicApi.read('realiti://memory');
  check('departure_snapshot_replaces_previous',ma2.last_departure?.room==='KITE_FIELD'&&!('departures' in ma2),ma2.last_departure);
  for(let i=0;i<36;i++)await a.door.run('remember bounded memory item '+i);
  const bounded=a.publicApi.read('realiti://memory');
  check('memory_shelf_is_bounded',bounded.memory_count===32&&bounded.limits.memories===32,bounded.memory_count);
 }finally{a.close()}

 b=await open('agent-b');
 try{
  const mb2=b.publicApi.read('realiti://memory');
  check('resident_b_memory_survives_a_compaction',mb2.memories.some(x=>x.text.includes('kite line'))&&!mb2.memories.some(x=>x.text.includes('blue lantern')),mb2.memories);
  const reset=await b.door.run('memory reset');
  check('resident_reset_is_scoped',reset.ok&&reset.other_residents_unchanged===true,reset);
 }finally{b.close()}

 a=await open('agent-a');
 try{
  const ma3=a.publicApi.read('realiti://memory');
  check('reset_b_did_not_delete_a',ma3.memory_count===32,ma3.memory_count);
  const caps=a.publicApi.read('realiti://capabilities');
  check('capabilities_advertise_memory',caps.resources.includes('realiti://memory')&&caps.operations.includes('remember')&&caps.memory?.resident_scoped===true,caps.memory);
 }finally{a.close()}

 // Regression: travel and elapsed world time alone must not fabricate changed objects.
 let travel=await open('agent-travel-only');
 try{
  await travel.door.run('home');
  await travel.door.run('stay 1200');
  await travel.door.run('go CARDBOARD_BOX_WORKSHOP');
  await travel.door.run('stay 1200');
  await travel.door.run('go KITE_FIELD');
  await travel.door.run('stay 1200');
  await travel.door.run('goodbye');
 }finally{travel.close()}
 travel=await open('agent-travel-only');
 try{
  const where=await travel.door.run('where_was_i');
  check('where_was_i_local_memory_is_success',where.ok===true&&!where.error&&where.schema==='REALITI_WHERE_WAS_I_V1'&&where.room==='KITE_FIELD',where);
  check('travel_only_has_no_changed_objects',Array.isArray(where.departure?.changed_objects)&&where.departure.changed_objects.length===0,where.departure?.changed_objects);
  const structured=await travel.publicApi.invoke('where_was_i');
  check('structured_where_was_i_is_success',structured.ok===true&&!structured.error&&structured.schema==='REALITI_WHERE_WAS_I_V1'&&structured.room==='KITE_FIELD',structured);
 }finally{travel.close()}

 // Regression: explicit object mutation is retained, but unrelated time-aged objects are not.
 let actor=await open('agent-object-change');
 try{
  await actor.door.run('home');
  const take=await actor.door.run('take hat');
  check('explicit_hat_take_works',take?.ok!==false,take);
  await actor.door.run('move right 1');
  const place=await actor.door.run('place hat');
  check('explicit_hat_place_works',place?.ok!==false,place);
  await actor.door.run('goodbye');
 }finally{actor.close()}
 actor=await open('agent-object-change');
 try{
  const dep=actor.publicApi.read('realiti://memory').last_departure;
  const ids=(dep?.changed_objects||[]).map(x=>x.id).sort();
  check('explicit_change_keeps_only_causal_object',ids.length===1&&ids[0]==='TESTER-HAT-1',ids);
  check('departure_object_state_omits_clock_bookkeeping',!Object.prototype.hasOwnProperty.call(dep.changed_objects[0]?.state||{},'t'),dep.changed_objects[0]);
 }finally{actor.close()}

 const disk=JSON.parse(fs.readFileSync(storagePath,'utf8'));
 const memoryKeys=Object.keys(disk).filter(k=>k.includes('resident-memory-v1:'));
 check('separate_physical_namespaces',memoryKeys.some(k=>k.endsWith('agent-a'))&&memoryKeys.some(k=>k.endsWith('agent-b')),memoryKeys);
 const aRaw=Object.entries(disk).find(([k])=>k.endsWith('agent-a'))?.[1]||'';
 check('memory_store_has_no_transcript_field',!/"transcript"\s*:|"messages"\s*:|"chain_of_thought"\s*:/i.test(aRaw));

 console.log(JSON.stringify({checks,details},null,2));
 const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
 if(failed.length){console.error('FAILED',failed);process.exit(1)}
 console.log('MEMORY PASS',Object.keys(checks).length,'checks');
})().catch(e=>{console.error(e);process.exit(1)});
