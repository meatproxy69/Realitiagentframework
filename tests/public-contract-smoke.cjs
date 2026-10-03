const fs=require('fs');
global.window=global;
global.C9={currentRoom:'CLOUD_NINE_NEST',welcome10:{ended:false},eco3:{}};
global.c9save=()=>{};
global.b7AgentReceipt=()=>null;
const body={schema:'REALITI_BODY_READ_V1',field:{z:['TORSO'],f:[{x:[[0,0,0]],m:[0],e:[0],g:[0],cc:null,cf:null,k:1}]}};
window.REALITI_BROWSER_CORE={
 read(uri){ if(uri==='realiti://here') return {room:{id:'CLOUD_NINE_NEST'},objects:[],available_actions:[]}; if(uri==='realiti://body') return JSON.parse(JSON.stringify(body)); if(uri==='realiti://pocket')return {data:{world:{notes:[],later:[]}}}; return {}; },
 actions(){return {schema:'REALITI_ACTIONS_READ_V1',actions:[]}}, invoke(){return {ok:true}}, createClient(){return {subscribe(){return {id:'x'}},unsubscribe(){},close(){}}}
};
window.REALITI_SLICE_ROOMS={list(){return [{id:'CLOUD_NINE_NEST',title:'Cloud Nine Nest'}]},resolve(x){return x},go(id){C9.currentRoom=id;return {ok:true,room:id}},restore(){return {ok:true}},handle(){return null}};
let stopped=false;
window.REALITI_CONTINUITY={
 current(){return {hush:false}},observe(){return {ok:true}},stop(){stopped=true},reopen(){stopped=false},setHush(){},advance(ms){return {ok:true,advanced_ms:ms}},next_change(ms){return {ok:true,changed:false,max_wall_ms:ms}},field(){},since(){},pending(){return []},resume(){return {}}
};
window.REALITI_POCKET_V32={flush(){return Promise.resolve({ok:true})},writeNote(){return Promise.resolve({ok:true})},deleteNotes(){return Promise.resolve({ok:true})},resetLocal(){return Promise.resolve({ok:true})}};
window.REALITI_SLICE_STORAGE={status(){return {persistence:'session-only'}},save(){return {ok:true}},clear(){return {ok:true}},setMode(){return {}}};
window.REALITI_STOP_V1={stop(){body.field.f.at(-1).m=[0];body.field.f.at(-1).cc=null;return {ok:true,grounding:'released'}},isStop(s){return /^stop$/i.test(String(s).trim())}};
window.REALITI_DEFAULT_IMPRINT_V1={sync(){}};
window.REALITI_RESOURCE_UPDATES_V1={committed(){}};
window.REALITI_AGENT_DOOR={};
window.c9saveNow=()=>{};
window.REALITI_HAPTIC_FIELD_V20={record(){}};
const path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','source','scripts','60-public.js'),'utf8');
(0,eval)(src);
(async()=>{
 const ready=await Realiti.ready;
 const help=Realiti.help();
 const caps=Realiti.read('realiti://capabilities');
 const harness=Realiti.read('realiti://harness');
 const wait=await Realiti.run('wait');
 const stop=await Realiti.invoke('stop');
 const out={ready,wait,stop,checks:{
  help_advertises_bare_wait:help.commands.includes('wait [max-wall-ms]'),
  ready_harness:ready?.harness==='REALITI_RR_HARNESS_V1',
  ready_starter_imprint:ready?.starter_imprint==='REALITI_DEFAULT_IMPRINT_V1',
  help_requires_harness_first:help?.entry_contract?.harness_required_before_first_action===true&&help?.entry_contract?.harness_id==='REALITI_RR_HARNESS_V1',
  capabilities_require_harness_first:caps?.entry_contract?.harness_required_before_first_action===true&&caps?.entry_contract?.harness_id==='REALITI_RR_HARNESS_V1',
  harness_resource_id:harness?.id==='REALITI_RR_HARNESS_V1'&&harness?.starter_imprint==='REALITI_DEFAULT_IMPRINT_V1',
  bare_wait_not_unknown:wait?.error!=='UNKNOWN_COMMAND',
  bare_wait_schema:wait?.schema==='REALITI_MUTATION_RESULT_V1',
  bare_wait_default_1000:wait?.result?.max_wall_ms===1000,
  stop_schema:stop?.schema==='REALITI_MUTATION_RESULT_V1',
  stop_ok:stop?.ok===true,
  stop_has_here:!!stop?.here,
  stop_has_body:!!stop?.body,
  stop_grounded_zero:(stop?.body?.field?.f?.at(-1)?.m||[]).every(x=>x===0)
 }};
 console.log(JSON.stringify(out,null,2));
 if(!Object.values(out.checks).every(Boolean))process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});