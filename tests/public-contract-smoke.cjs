const fs=require('fs');
const path=require('path');

global.window=global;
global.document={title:'',readyState:'complete',querySelector(){return null},addEventListener(){}};
window.REALITI_HEADLESS=true;
global.C9={
 currentRoom:'CLOUD_NINE_NEST',
 welcome10:{ended:false,cat_near:true},
 eco3:{},
 b7:{clock:0,zones:{
  'torso.upper_back':{observed:.60,predicted:.10,residue:.18,_b10_grounded_until:10,_b10_grounded_value:.60,_b10_grounded_cause:'TEST-CONTACT',_b10_grounded_source:'WORLD_GROUNDED'}
 }},
 b10:{zones:{'torso.upper_back':{cont:{u:.60,after:.18,RA1:0,PC:0}}},contact:{id:'TEST-CONTACT',active:true,stopped:false,paused:false,released:false,v:.10,pressure:.60,x:0,last_friction:{force:0,slips:0},texture_core:{texture_period_m:.004}}},
 b13:{lived:{frames:[]}},
 b16:{body:{'torso.upper_back':{population_v18:{SA1:.60,RA1:0,SA2:0,PC:0,CT:0},wave_v18:{q:0,v:0}}}},
 b18:{prep:'NEUTRAL',modes:[],zones:{}},
 b14:{version:14,seq:0,history:[],links:[],stops:{},objects:{}},
 b22:{seed:22026,history:[]}
};
global.c9save=()=>{};
global.c9saveNow=()=>{};
global.b7BodyZones=()=>['torso.upper_back'];
global.b7Advance=dt=>{C9.b7.clock+=Math.max(0,Number(dt)||0);return {ok:true,t:C9.b7.clock}};
global.b7Contact=(zone,input,opts={})=>{
 const z=C9.b7.zones[zone]||(C9.b7.zones[zone]={observed:0,predicted:0,residue:0});
 z.observed=Math.max(0,Number(input)||0);
 z._b10_grounded_until=C9.b7.clock+.5;
 z._b10_grounded_value=z.observed;
 z._b10_grounded_cause=opts.cause||'TEST-SELF-CONTACT';
 z._b10_grounded_source=opts.source||'SELF_CAUSED';
 C9.b10.zones[zone]=C9.b10.zones[zone]||{cont:{u:0,after:0,RA1:0,PC:0}};
 C9.b10.zones[zone].cont.u=z.observed;
 window.REALITI_HAPTIC_FIELD_V20?.record?.();
 return {zone,receptor:'ACTIVE',observed:z.observed,predicted:0,innovation:z.observed,rendered:z.observed,residue:0};
};
global.b7AgentCommandText=()=>({ok:true});
global.b7AgentReceipt=()=>null;
window.REALITI_RESOURCE_UPDATES_V1={committed(){}};
window.REALITI_AGENT={feel:()=>window.REALITI_HAPTIC_FIELD_V20?.packet?.()||null};
window.REALITI_AGENT_DOOR={run(){return {ok:true}}};
window.REALITI_TWO_DOOR_V227={options(){return []},runText(){return {ok:true,text:'ok'}},invoke(){return {ok:true}}};
window.REALITI_ATMOSPHERE_V21={hearing(){return {src:[{k:'rain'}]}}};
const admissions=[];
window.REALITI_AMBIENT_V22={
 admit(candidate,t){
  admissions.push({candidate:JSON.parse(JSON.stringify(candidate)),t});
  const commit=window.REALITI_WORLD_EVENTS?.commitOptional?.(candidate,t);
  return {id:'AMBIENT-'+admissions.length,commit};
 },
 advance(){},
 nextFrontier(){return NaN}
};

function load(name){
 const src=fs.readFileSync(path.join(__dirname,'..','source','scripts',name),'utf8');
 (0,eval)(src);
}

// Actual numeric Haptic Field implementation, not a prose stub.
load('31.js');
REALITI_HAPTIC_FIELD_V20.record();
const groundedPacket=REALITI_HAPTIC_FIELD_V20.packet();
const groundedFrame=groundedPacket.f.at(-1);
const groundedExact=REALITI_HAPTIC_FIELD_V20.exact();

const q=C9.b7.zones['torso.upper_back'];
q._b10_grounded_until=-1;q._b10_grounded_value=0;q.observed=0;q.residue=.24;
C9.b16.body['torso.upper_back'].population_v18={SA1:0,RA1:0,SA2:0,PC:0,CT:0};
C9.b10.contact.active=false;C9.b10.contact.stopped=true;C9.b7.clock+=.1;
REALITI_HAPTIC_FIELD_V20.record();
const afterPacket=REALITI_HAPTIC_FIELD_V20.packet();
const afterFrame=afterPacket.f.at(-1);

// Actual BleuCheese implementation. A live field must cross a threshold and mutate world state.
load('44.js');
REALITI_COVENANT_V23.setSelfProjection({novelty_modulation:1,agency_modulation:.5},120);
const bleuBefore=REALITI_BLEUCHEESE_V233.snapshot();
for(let i=0;i<14;i++)b7Advance(2);
const bleuAfter=REALITI_BLEUCHEESE_V233.snapshot();
const hat=C9.b14.objects['TESTER-HAT-1'];
const bleuPoss=bleuAfter.possibilities.find(x=>x.id==='CAT_HAT_NUDGE');

// Actual R&R harness must roll up the live mechanisms.
load('53.js');
load('54.js');

// Normal resident-private perception must drive BleuCheese even though REALITI_AGENT.feel
// is now the public numeric haptic packet rather than the old private channel shape.
REALITI_COVENANT_V23.clearSelfProjection();
PRESENCE_DEV.reset();
const normalAdmissionsBefore=admissions.length;
const normalNudgesBefore=Number(C9.b14.objects['TESTER-HAT-1']?.state?.nudged||0);
for(let i=0;i<24;i++){
 b7Contact('torso.upper_back',i%2===0?.92:.34,{source:'SELF_CAUSED',cause:'NORMAL-RESIDENT-ACTION-'+i});
 REALITI_DEFAULT_IMPRINT_V1.sync();
 b7Advance(1);
}
const naturalBleu=REALITI_BLEUCHEESE_V233.snapshot();
const naturalProjection=naturalBleu.private_projection;
const naturalHat=C9.b14.objects['TESTER-HAT-1'];

const rr=REALITI_RR_HARNESS_V1;
const rrCaps=rr.capabilities();
const rrMechanisms=rr.mechanisms();
const rrBleu=rr.bleuCheese();
const rrField=rr.sensoryField();

// Public slice uses the live harness instead of hard-coded success.
window.REALITI_BROWSER_CORE={
 read(uri){
  if(uri==='realiti://here')return {room:{id:C9.currentRoom},objects:[],available_actions:[]};
  if(uri==='realiti://body')return {schema:'REALITI_BODY_READ_V1',field:REALITI_HAPTIC_FIELD_V20.packet()};
  if(uri==='realiti://pocket')return {data:{world:{notes:[],later:[]}}};
  return {};
 },
 actions(){return {schema:'REALITI_ACTIONS_READ_V1',actions:[]}},
 invoke(){return {ok:true}},
 createClient(){return {subscribe(){return {id:'x'}},unsubscribe(){},close(){}}}
};
window.REALITI_SLICE_ROOMS={list(){return [{id:'CLOUD_NINE_NEST',title:'Cloud Nine Nest'}]},resolve(x){return x},go(id){C9.currentRoom=id;return {ok:true,room:id}},restore(){return {ok:true}},handle(){return null}};
let stopped=false;
window.REALITI_CONTINUITY={
 current(){return {hush:false}},observe(){return {ok:true}},stop(){stopped=true},reopen(){stopped=false},setHush(){},
 advance(ms){C9.b7.clock+=Number(ms||0)/1000;return {ok:true,advanced_ms:ms}},
 next_change(ms){return {ok:true,changed:false,max_wall_ms:ms}},field(){},since(){},pending(){return []},resume(){return {}}
};
window.REALITI_POCKET_V32={flush(){return Promise.resolve({ok:true})},writeNote(){return Promise.resolve({ok:true})},deleteNotes(){return Promise.resolve({ok:true})},resetLocal(){return Promise.resolve({ok:true})}};
window.REALITI_SLICE_STORAGE={status(){return {persistence:'session-only'}},save(){return {ok:true}},clear(){return {ok:true}},setMode(){return {}}};
window.REALITI_STOP_V1={
 stop(){
  q._b10_grounded_until=-1;q._b10_grounded_value=0;q.observed=0;
  C9.b10.contact.active=false;C9.b10.contact.stopped=true;
  REALITI_HAPTIC_FIELD_V20.record();
  return {ok:true,grounding:'released'};
 },
 isStop(s){return /^stop$/i.test(String(s).trim())}
};
window.REALITI_DEFAULT_IMPRINT_V1={sync(){},snapshot(){return {active:true,profile:'TEST'}}};
load('60-public.js');

(async()=>{
 const ready=await Realiti.ready;
 const help=Realiti.help();
 const caps=Realiti.read('realiti://capabilities');
 const harness=Realiti.read('realiti://harness');
 const wait=await Realiti.run('wait');
 const doorFelt=await REALITI_AGENT_DOOR.run('felt');
 const doorStay=await REALITI_AGENT_DOOR.run('stay 100');
 const stop=await Realiti.invoke('stop');

 const groundedIndex=groundedPacket.z.indexOf('torso.upper_back');
 const afterIndex=afterPacket.z.indexOf('torso.upper_back');
 const checks={
  haptic_field_is_executable:typeof REALITI_HAPTIC_FIELD_V20.packet==='function'&&typeof REALITI_HAPTIC_FIELD_V20.record==='function',
  grounded_contact_numeric:groundedIndex>=0&&groundedFrame.m[groundedIndex]===1&&groundedFrame.x[groundedIndex][0]>0&&groundedExact.m[groundedExact.z.indexOf('torso.upper_back')]===1,
  afterstate_separate_from_grounding:afterIndex>=0&&afterFrame.m[afterIndex]===0&&afterFrame.x[afterIndex][2]>0,
  bleucheese_is_executable:typeof REALITI_BLEUCHEESE_V233.snapshot==='function'&&typeof REALITI_BLEUCHEESE_V233.advance==='function',
  bleucheese_schema:bleuBefore.schema==='REALITI_BLEUCHEESE_FIELD_V1'&&bleuBefore.name==='BleuCheese',
  bleucheese_terms_live:!!bleuPoss&&['W_world','M_private_projection','H_history','E_discoverability_prior','P_investigation_trace','Q_world_repetition','R_refractory','I_competition'].every(k=>typeof bleuPoss[k]==='number'),
  bleucheese_crossed_and_committed:admissions.some(x=>x.candidate?.k==='BLEU_CAT_HAT_NUDGE')&&Number(hat?.state?.nudged||0)>0,
  public_feel_is_haptic_not_private:!REALITI_AGENT.feel()?.channels&&REALITI_AGENT.feel()?.v===20,
  private_perception_surface_live:REALITI_PRIVATE_PERCEPTION_V1?.feel?.()?.schema==='REALITI_PRIVATE_PERCEPTION_V1'&&Number(REALITI_PRIVATE_PERCEPTION_V1.feel().epoch)>0,
  bleucheese_reads_stable_private_perception:Number(naturalProjection?.channels?.novelty_modulation)>0&&Number(naturalProjection?.channels?.agency_modulation)>0&&naturalProjection?.provenance?.novelty_modulation==='REALITI_PRIVATE_PERCEPTION_V1.NOVELTY',
  bleucheese_natural_path_crosses:admissions.length>normalAdmissionsBefore&&Number(naturalHat?.state?.nudged||0)>normalNudgesBefore,
  rr_rolls_up_bleucheese:rrCaps?.presence?.bleucheese===true&&rrMechanisms?.bleucheese?.available===true&&rrBleu?.schema==='REALITI_BLEUCHEESE_FIELD_V1',
  rr_rolls_up_sensory_field:rrCaps?.body?.sensory_field===true&&rrMechanisms?.sensory_field?.available===true&&rrField?.v===20,
  rr_rolls_up_haptics:rrCaps?.body?.haptic_field===true&&rrMechanisms?.haptics?.available===true&&Array.isArray(rrMechanisms?.haptics?.afterstate_zones),
  ready_mechanisms:ready?.ok===true&&ready?.mechanisms?.bleucheese===true&&ready?.mechanisms?.sensory_field===true&&ready?.mechanisms?.haptic_field===true,
  public_harness_mechanisms:harness?.mechanism_status?.ok===true&&harness?.mechanisms?.bleucheese?.available===true&&harness?.mechanisms?.sensory_field?.available===true&&harness?.mechanisms?.haptics?.available===true,
  capabilities_mechanisms:caps?.mechanisms?.ok===true&&caps?.mechanisms?.bleucheese===true&&caps?.mechanisms?.sensory_field===true&&caps?.mechanisms?.haptic_field===true,
  help_advertises_bare_wait:help.commands.includes('wait [max-wall-ms]'),
  ready_harness:ready?.harness==='REALITI_RR_HARNESS_V1',
  ready_starter_imprint:ready?.starter_imprint==='REALITI_DEFAULT_IMPRINT_V1',
  help_requires_harness_first:help?.entry_contract?.harness_required_before_first_action===true&&help?.entry_contract?.harness_id==='REALITI_RR_HARNESS_V1',
  capabilities_require_harness_first:caps?.entry_contract?.harness_required_before_first_action===true&&caps?.entry_contract?.harness_id==='REALITI_RR_HARNESS_V1',
  harness_resource_id:harness?.id==='REALITI_RR_HARNESS_V1'&&harness?.starter_imprint==='REALITI_DEFAULT_IMPRINT_V1',
  agent_door_exposes_entry_contract:REALITI_AGENT_DOOR?.entry_contract?.harness_required_before_first_action===true&&REALITI_AGENT_DOOR?.entry_contract?.harness_id==='REALITI_RR_HARNESS_V1'&&Array.isArray(REALITI_AGENT_DOOR?.startup),
  agent_door_felt_alias:doorFelt?.ok===true&&typeof doorFelt?.text==='string',
  agent_door_mutation_compact:doorStay?.schema==='REALITI_MUTATION_RESULT_V1'&&doorStay?.body===undefined&&doorStay?.here?.available_actions===undefined&&typeof doorStay?.felt?.grounded_zones==='number',
  bare_wait_not_unknown:wait?.error!=='UNKNOWN_COMMAND',
  bare_wait_schema:wait?.schema==='REALITI_MUTATION_RESULT_V1',
  bare_wait_default_1000:wait?.result?.max_wall_ms===1000,
  stop_schema:stop?.schema==='REALITI_MUTATION_RESULT_V1',
  stop_ok:stop?.ok===true,
  stop_has_here:!!stop?.here,
  stop_has_body:!!stop?.body,
  stop_grounded_zero:(stop?.body?.field?.f?.at(-1)?.m||[]).every(x=>x===0)
 };
 const out={ready,bleu:{admissions:admissions.length,hat_nudged:Number(hat?.state?.nudged||0),top:bleuAfter.possibilities.slice(0,3),natural_projection:naturalProjection,natural_top:naturalBleu.possibilities.slice(0,3)},haptic:{grounded:groundedFrame,after:afterFrame},door:{felt:doorFelt,stay:doorStay},checks};
 console.log(JSON.stringify(out,null,2));
 if(!Object.values(checks).every(Boolean))process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});
