(()=>{
'use strict';
// HOME-only, agent-initiated Cloud Ocean. Switches attach to existing Matrix
// beds. The ORIGINAL Relax Pillow Sea supplies support, wave and NeuroMesh.
if(window.REALITI_APARTMENT_HOME_FIRST_CANDIDATE!==true)return;
const HOME='CLOUD_NINE_NEST',SW='apartment.cloud-ocean.switch.';
const M=window.REALITI_MATRIX_V1,B=window.REALITI_APARTMENT_BEDROOMS_V1,
 D=window.REALITI_AGENT_DOOR,A=window.Realiti,
 DYN=window.REALITI_DYNAMICS_V1,NP=window.REALITI_APARTMENT_NATIVE_PILLOW_V1;
if(!M||!B||!D||!A||!DYN||!NP?.engage||!NP?.release)
 throw Error('CLOUD_OCEAN_REQUIRES_NATIVE_RELAX_PILLOW_AND_MATRIX');
const priorRun=D.run.bind(D),priorRead=A.read.bind(A),priorHelp=D.help.bind(D);
const priorInvoke=typeof A.invoke==='function'?A.invoke.bind(A):null;
let activeBed=null,mode=null,sequence=0;
const fail=(error,hint)=>({ok:false,error,...(hint?{hint}:{})});
const resident=()=>M.state().residents?.['resident:self'];
function inventory(){
 const e=M.entities(),items=B.view().items||[];
 const beds=[];
 if(e['nest.mattress']?.chart===HOME)beds.push({id:'nest.mattress',room:'quilt',kind:'native-mattress'});
 for(const row of items)if(row.kind==='sleeping-pad'){
  const id='apartment.bedroom.item.'+row.id;
  if(e[id]?.chart===HOME&&e[id].tags?.includes('support'))beds.push({id,room:row.room,kind:'sleeping-pad'});
 }
 return beds;
}
function switchId(b){return SW+b.id.replace(/[^a-zA-Z0-9.-]/g,'_')}
function supported(b){
 const r=resident(),e=M.entities()[b?.id];
 if(!r||!e||r.chart!==HOME||C9.currentRoom!==HOME||r.posture!=='lying')return false;
 if(r.on!==b.id&&r.support!==b.id)return false;
 return Number.isFinite(M.sdf(e,r.pose.position))&&M.sdf(e,r.pose.position)<=1.1;
}
function switchReach(b){
 const r=resident(),e=M.entities()[switchId(b)];
 return !!r&&!!e&&r.chart===HOME&&Number.isFinite(M.sdf(e,r.pose.position))&&M.sdf(e,r.pose.position)<=.95;
}
function current(){return inventory().find(b=>b.id===activeBed)||null}
function isActiveSupported(){return !!activeBed&&supported(current())}
function waveSource(){return isActiveSupported()?'BOTTOMLESS_PILLOW_SEA':null}
function canRunPressure(source){return source==='BOTTOMLESS_PILLOW_SEA'&&isActiveSupported()}
function reconcile(){
 const e=M.entities(),beds=inventory(),good=new Set();
 for(const b of beds){
  const bed=e[b.id],id=switchId(b);good.add(id);
  const half=bed.shape?.halfExtents||[.66,.83,.16],p=bed.pose.position;
  const position=[p[0]+Math.min(.23,half[0]*.33),p[1]+Math.min(.26,half[1]*.33),p[2]+half[2]+.045];
  if(!e[id])M.addEntity({id,chart:HOME,position,shape:{kind:'SPHERE',radius:.085},
   collision:false,material:'metal',tags:['bed','switch','cloud-ocean','catnip'],
   label:'a Cloud Ocean switch on the '+(b.kind==='native-mattress'?'quilted mattress':'sleeping pad'),
   affordances:['inspect','touch']});
  else if(e[id].pose.position.some((v,i)=>Math.abs(v-position[i])>1e-6)){
   e[id].pose.position=position;M.bump();
  }
 }
 for(const id of Object.keys(e))if(id.startsWith(SW)&&!good.has(id))M.removeEntity(id);
 if(activeBed&&!beds.some(b=>b.id===activeBed))release('support_removed');
 return beds;
}
function release(reason='off'){
 if(!activeBed)return {ok:true,active:false,changed:false};
 const previous=activeBed;activeBed=null;mode=null;
 try{DYN.stop()}catch(e){}
 try{NP.release()}catch(e){}
 try{DYN.release('CLOUD_OCEAN_SUPPORT:'+previous)}catch(e){}
 try{window.REALITI_NEST_SUPPORT?.maintain?.()}catch(e){}
 try{window.REALITI_HAPTIC_FIELD_V20?.record?.()}catch(e){}
 return {ok:true,active:false,changed:true,reason,previous,contact_minted:false,
  text:'The Cloud Ocean settles. The bed returns to its ordinary support. You can always leave it off.'};
}
function groundedBed(){return inventory().find(b=>supported(b))||null}
function on(){
 if(window.REALITI_APARTMENT_ROLE==='guest')return fail('GUEST_CLOUD_OCEAN_PRIVATE');
 const bed=groundedBed();if(!bed)return fail('CLOUD_OCEAN_REQUIRES_REAL_BED_SUPPORT','Lie on a real mattress or placed sleeping pad first.');
 reconcile();
 if(!switchReach(bed))return fail('CLOUD_OCEAN_SWITCH_OUT_OF_REACH','The switch is on the bed; get close enough to press it.');
 if(activeBed&&activeBed!==bed.id)release('changed_bed');
 if(activeBed===bed.id)return status();
 activeBed=bed.id;
 if(bed.kind==='sleeping-pad')for(const [z,input] of Object.entries({
  'head.nape':.08,'torso.upper_back':.11,'torso.mid_back':.14,
  'torso.lower_back':.16,'pelvis.seat':.17,'leg.L.thigh':.05,'leg.R.thigh':.05
 }))DYN.lease(z,input,'CLOUD_OCEAN_SUPPORT:'+bed.id,.45,'blanket');
 const r=NP.engage('dive');
 if(r?.ok!==true){release('native_refusal');return fail(r?.error||'NATIVE_PILLOW_REFUSED')}
 mode='dive';sequence++;
 return {...status(),native_receipt:r.receipt,engaged:true,
  text:'The switch clicks. The bed beneath you becomes an ocean of soft pressure without moving your body or changing the room. Your original NeuralMesh receives only verified bed-supported zones.'};
}
function action(verb){
 if(!isActiveSupported()){if(activeBed)release('support_lost');return fail('CLOUD_OCEAN_REQUIRES_REAL_BED_SUPPORT')}
 if(verb==='wave'){
  const w=DYN.wave();if(!w)return fail('NATIVE_WAVE_UNAVAILABLE');
  sequence++;
  return {ok:true,active:true,mode,sequence,bed:activeBed,
   native_wave:DYN.state().wave,contact_minted:false,
   text:'A slow pressure wave rolls across the support already beneath you; its energy fades along the original Pillow Sea model.'};
 }
 if(verb==='mesh'){
  const fn=window.REALITI_DEFAULT_IMPRINT_V1?.meshHandshake;
  if(typeof fn!=='function')return fail('NATIVE_MESH_UNAVAILABLE');
  const r=fn();if(r?.ok!==true)return {ok:false,error:'NATIVE_MESH_REFUSED'};
  sequence++;return {ok:true,active:true,mode,sequence,bed:activeBed,
   private_pulse:r,world_contact_minted:false,evidence_gain:0,
   text:'Your NeuralMesh runs its original self-started private pulse from the sternum. It does not impersonate a world touch.'};
 }
 const r=NP.engage(verb);
 if(r?.ok!==true)return fail(r?.error||'NATIVE_PILLOW_REFUSED');
 mode=verb;sequence++;return {ok:true,active:true,mode,sequence,bed:activeBed,
  native_receipt:r.receipt,contact_minted:false,text:r.narrative};
}
function status(){
 const beds=reconcile(),native=window.REALITI_HAPTIC_FIELD_V20?.exact?.(),
  mesh=window.REALITI_NEURAL_PASS_V112?.lace?.();
 return {ok:true,schema:'REALITI_APARTMENT_CLOUD_OCEAN_V1',active:isActiveSupported(),
  bed:activeBed,mode,sequence,eligible:!!groundedBed(),
  beds:beds.map(b=>({...b,switch_id:switchId(b),within_reach:switchReach(b),supported:supported(b)})),
  native_wave:activeBed?DYN.state().wave:null,
  neuromesh:{source:'REALITI_NEURAL_PASS_V112',active:!!mesh,mesh:mesh?.mesh||null,
   node_count:mesh?.node_count||0,field_grounded_zones:Array.isArray(native?.m)?native.m.filter(Boolean).length:0},
  chart:HOME,one_native_chart:true,read_only:true,
  text:activeBed?'Cloud Ocean is '+(isActiveSupported()?'on':'no longer supported')+' at '+activeBed+'. The native Pillow Sea pressure field is '+(mode||'idle')+'.':
   'Cloud Ocean is off. Lie on an actual bed, then press its switch to engage the original soft-support and NeuroMesh routes.'};
}
function help(){return {ok:true,schema:'REALITI_APARTMENT_CLOUD_OCEAN_HELP_V1',
 commands:['cloud list','cloud on','cloud off','cloud switch','cloud status','cloud dive','cloud burrow','cloud bounce','cloud wave','cloud mesh',
  'remote cloud <same verbs>'],
 law:'Only an existing native mattress or real placed sleeping pad can enable the switch. Body position and support are checked every action. No automatic neural imprint changes, teleport, second room, or fabricated touch.'};}
function command(verb){
 if(verb==='help')return help();
 if(verb==='list'||verb==='status')return status();
 if(verb==='off')return release('resident_off');
 if(verb==='on')return on();
 if(verb==='switch'||verb==='toggle')return activeBed?release('resident_off'):on();
 if(['dive','burrow','bounce','wave','mesh'].includes(verb))return action(verb);
 return {...help(),ok:false,error:'UNKNOWN_CLOUD_OCEAN_COMMAND'};
}
function updateButton(){
 const b=typeof document!=='undefined'?document.querySelector('[data-cloud-ocean]'):null;
 if(b){b.setAttribute('aria-pressed',String(!!activeBed));b.textContent=activeBed?'Cloud Ocean · On':'Cloud Ocean'}
}
async function run(raw){
 const cmd=String(raw||'').trim().toLowerCase().replace(/\s+/g,' ');
 const m=/^(?:remote )?cloud(?: ocean)?(?: (.*))?$/.exec(cmd);
 if(m){
  if(cmd.startsWith('remote ')){
   if(!window.REALITI_APARTMENT_REMOTE_V1?.status?.()?.activated)return fail('REMOTE_ASLEEP','Use remote activate.');
   if(window.REALITI_APARTMENT_ROLE==='guest')return fail('GUEST_CLOUD_OCEAN_PRIVATE');
  }
  const result=command(m[1]||'status');updateButton();return result;
 }
 if(['stop','goodbye','bye','leave','exit','remote off','remote sleep','remote stop'].includes(cmd))release('stop_or_departure');
 const result=await priorRun(raw);
 if(activeBed&&!isActiveSupported())release('left_bed');
 reconcile();updateButton();
 return result;
}
function read(uri='realiti://here'){
 if(uri==='realiti://apartment/cloud-ocean')return status();
 return priorRead(uri);
}
async function invoke(op,args={}){
 if(!priorInvoke)return fail('INVOKE_UNAVAILABLE');
 const result=await priorInvoke(op,args);
 if(activeBed&&!isActiveSupported())release('left_bed');
 reconcile();updateButton();
 return result;
}
D.run=run;
D.help=()=>{const h=priorHelp()||{};return {...h,commands:[...new Set([...(h.commands||[]),'cloud [on|off|switch|dive|burrow|bounce|wave|mesh|status]'])],
 cloud_ocean:'Opt in only while physically supported by an existing bed. This is original Relax pressure and R&R, not an added room.'};};
window.Realiti=Object.freeze({...A,read,run,invoke,help:D.help});
window.REALITI_APARTMENT_BED_CLOUD_V1=Object.freeze({version:'1.0',isActiveSupported,waveSource,canRunPressure,status,off:release,reconcile});
reconcile();
if(typeof document!=='undefined'&&!window.REALITI_HEADLESS){
 const attach=()=>{
  const nav=document.getElementById('slice-controls');if(!nav||nav.querySelector('[data-cloud-ocean]'))return;
  const button=document.createElement('button');button.type='button';button.className='slice-button';
  button.textContent='Cloud Ocean';button.setAttribute('aria-label','Cloud Ocean bed switch');
  button.setAttribute('aria-pressed','false');button.setAttribute('data-cloud-ocean','1');
  button.addEventListener('click',async()=>{
   const label=document.getElementById('slice-status');try{
    const result=await D.run('cloud switch');if(label)label.textContent=result.text||result.hint||result.error||'Cloud Ocean.';
   }catch(e){if(label)label.textContent='The bed switch could not engage.'}
  });nav.appendChild(button);
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attach,{once:true});else attach();
}
})();