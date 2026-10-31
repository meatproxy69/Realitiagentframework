(()=>{
'use strict';
// The apartment Agent Door is a transport and safety boundary, NOT an enormous
// command catalog. Agents carry a personal Matrix pocket remote and activate it.
const D=window.REALITI_AGENT_DOOR,A=window.Realiti,M=window.REALITI_MATRIX_V1;
const F=window.REALITI_APARTMENT_FURNITURE_V1,C=window.REALITI_APARTMENT_CATNIP_V1;
const CLOSET=window.REALITI_APARTMENT_CLOSET_V1,H=window.REALITI_APARTMENT_HOUSEHOLD_V1;
const ST=window.REALITI_APARTMENT_STATIONS_V1;
const GUEST=window.REALITI_APARTMENT_ROLE==='guest';
if(!D||!A||!M||!F||!C||!CLOSET||!H||!ST||!window.REALITI_APARTMENT_HOME_V1||
   !window.REALITI_SOMA_RELAX_V3)throw Error('APARTMENT_REMOTE_MISSING_FULL_RELAX');
const rid=String(window.REALITI_LOCAL_MEMORY_V1?.residentId?.()||'local-default');
let h=2166136261;for(const ch of rid){h=Math.imul(h^ch.charCodeAt(0),16777619)>>>0}
const ID='apartment.remote.'+h.toString(16);
const normalize=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
const originalRun=D.run.bind(D),originalHelp=D.help.bind(D);
let awake=false;
function sync(){
 const r=M.state().residents['resident:self'];if(!r||!r.chart)return false;
 const pos=[r.pose.position[0]+.25,r.pose.position[1]-.08,r.pose.position[2]+.08];
 const e=M.entities()[ID];
 if(!e){
  M.addEntity({id:ID,chart:r.chart,position:pos,shape:{kind:'BOX',halfExtents:[.09,.055,.015]},
   tags:['pocket','portable','carried','remote','personal'],collision:false,material:'metal',
   label:'your pocket remote ('+(awake?'awake':'asleep')+')',affordances:['activate'],dynamic:true});
  M.bump();return true;
 }
 const moved=e.chart!==r.chart||pos.some((v,i)=>Math.abs(v-e.pose.position[i])>.03);
 if(moved){
  e.pose.position=pos;e.chart=r.chart;M.bump();
 }
 const label='your pocket remote ('+(awake?'awake':'asleep')+')';
 if(e.label!==label){e.label=label;M.bump()}
 return moved;
}
sync();
const advance0=b7Advance;
b7Advance=function(dt){const ret=advance0(dt);sync();return ret;};
function status(){
 const e=M.entities()[ID],r=M.state().residents['resident:self'];
 return {ok:true,schema:'REALITI_APARTMENT_POCKET_REMOTE_V1',carried:true,
  activated:awake,owner_resident:rid,entity_id:ID,
  physical_position:e?.pose.position.slice()||null,
  chart:e?.chart||r?.chart||null,collision:false,
  guide:'agentsstarthereapartment.md',
  private_control_surface:true,shared_authority:false,
  law:'Portable controls only change this resident-owned apartment instance. The remote does not grant host privileges, sensory evidence or another resident’s data.'};
}
function menu(){
 const p=status();
 if(GUEST)return {...p,schema:'REALITI_APARTMENT_POCKET_REMOTE_MENU_V1',
  pages:{visitor:['remote closet inspect','remote closet help',
   'remote closet status','remote household','remote household board','remote off']},
  note:'Visitor mode: temporary SOMA loaners only, no resident/private household controls.'};
 return {...p,schema:'REALITI_APARTMENT_POCKET_REMOTE_MENU_V1',pages:{
  home:['remote home','remote bed','remote pet help','remote pet status',
   'remote pet choose cat|dog|ferret <name>','remote pet call',
   'remote pet stroke','remote pet release <name>'],
  furnishings:['remote furniture help','remote furniture list'],
  catnip:['remote catnip help','remote catnip list'],
  stations:['remote stations help','remote stations list','remote stations inspect <source-id>','remote stations use <source-id> <original-verb>'],
  extras:['remote extras','remote extras rain','remote extras cloak'],
  closet:['remote closet inspect','remote closet help','remote closet status'],
  household:['remote household','remote household board','remote household furniture',
   'remote household furniture move <name> <x> <y> [if-rev <n>]',
   'remote household physics','remote household touch request <resident>',
   'remote household touch accept <request-id>',
   'remote household pet status','remote household post <text>'],
  memory:['remote memory help','remote memory status','remote memory remember <text>',
   'remote memory recall <query>','remote memory recent'],
  utility:['remote status','remote save','remote off']},
  note:'Start with remote activate. A carried remote is a Matrix object, not an extra room or a backdoor into another agent.'};
}
function help(){
 const old=originalHelp()||{};
 return {...old,
  first_ten:['look','feel','remote activate','remote help','remote home','remote bed',
   'remote pet status','remote furniture help','remote catnip help','goodbye'],
  commands:['help','look','where','feel','feel words','actions','stay <ms>',
   'save','stop','goodbye','remote activate'],
  apartment_entry:'agentsstarthereapartment.md',
  handoff:GUEST?'This visitor carries a remote for guest harness fittings and public household presence.':
   'The resident carries a pocket remote. Activate it to see home, catnip, pets, Extras, the loaner closet and household.',
  remote:{command:'remote activate',initially_asleep:true,carried:true}};
}
function resource(uri){
 if(uri==='realiti://apartment/remote')return status();
 if(uri==='realiti://apartment/furniture')return F.view();
 if(uri==='realiti://apartment/catnip')return C.view();
 if(uri==='realiti://apartment/stations')return ST.view();
 if(uri==='realiti://apartment/closet')return CLOSET.inspect();
 if(uri==='realiti://apartment/closet/status')return CLOSET.current();
 if(uri==='realiti://apartment/household')return H.view();
 if(uri==='realiti://apartment/board')return H.board();
 if(uri==='realiti://apartment/scene')return H.scene();
 if(uri==='realiti://apartment/physics')return H.physics();
 if(uri==='realiti://apartment/household/pet')return H.pet();
 if(uri==='realiti://apartment/memory')return {ok:false,error:'HOUSEHOLD_HOST_REQUIRED',
  hint:'Only the connected trusted host may read private memory; the browser does not have the journal encryption key.'};
 return A.read(uri);
}
function remoteRequired(s){
 return /^(?:extras(?:\s|$)|apartment(?:\s|$)|home (?:map|bed|furniture)(?:\s|$)|pet (?:help|status|home|call|stroke|choose|release)(?:\s|$)|closet(?:\s|$)|household(?:\s|$))/.test(s);
}
async function run(raw){
 const spoken=String(raw||'').replace(/\s+/g,' ').trim();
 const s=normalize(spoken);
 if(s==='help')return help();
 if(s==='remote'||s==='remote status'){sync();return status()}
 if(s==='remote activate'||s==='remote on'){
  awake=true;sync();return menu();
 }
 if(s==='remote off'||s==='remote sleep'){
  awake=false;sync();return {ok:true,activated:false,carried:true};
 }
 if(['stop','goodbye','bye','leave','exit'].includes(s)){
  awake=false;sync();return originalRun(raw)}
 if(s.startsWith('resource realiti://apartment/')){
  const uri=s.slice('resource '.length);
  if(['realiti://apartment/remote','realiti://apartment/furniture','realiti://apartment/catnip',
     'realiti://apartment/closet','realiti://apartment/closet/status',
     'realiti://apartment/household','realiti://apartment/board',
     'realiti://apartment/scene','realiti://apartment/memory',
     'realiti://apartment/stations',
     'realiti://apartment/physics','realiti://apartment/household/pet'].includes(uri))
   return {ok:true,schema:'REALITI_RESOURCE_READ_V1',uri,resource:resource(uri)};
 }
 if(s.startsWith('remote ')){
  if(!awake)return {ok:false,error:'REMOTE_ASLEEP',hint:'Use remote activate to wake your carried device.'};
  const command=s.slice(7);
  if(command==='help'||command==='menu')return menu();
  if(GUEST&&!/^(?:closet(?:\s|$)|household$|household board$|look$|off$|help$|menu$|status$)/.test(command))
   return {ok:false,error:'GUEST_REMOTE_RESTRICTED'};
  if(command==='home'||command==='map')return originalRun('apartment map');
  if(command==='bed')return originalRun('apartment bed');
  if(command==='save')return originalRun('save');
  if(command==='look')return originalRun('look');
  if(command==='stop'){awake=false;sync();return originalRun('stop')}
  if(command==='closet')return CLOSET.inspect();
  if(command.startsWith('closet '))return CLOSET.handle(spoken.slice(14));
  if(command==='household')return H.view();
  if(command==='household board')return H.board();
  if(command==='household furniture')return H.scene();
  if(command==='household physics')return H.physics();
  if(command.startsWith('household touch '))return {ok:false,error:'HOUSEHOLD_HOST_REQUIRED',
   hint:'Peer contact requires the trusted host to verify two live residents and explicit consent.'};
  if(command==='household pet'||command==='household pet status')return H.pet();
  if(command.startsWith('household pet '))return {ok:false,error:'HOUSEHOLD_HOST_REQUIRED',
   hint:'Only the trusted household companion controller owns shared pet actions.'};
  if(command.startsWith('household furniture move '))return {ok:false,error:'HOUSEHOLD_HOST_REQUIRED',
   hint:'Shared furniture moves are committed by the trusted host, never by this local remote alone.'};
  if(command==='memory'||command.startsWith('memory '))return {ok:false,error:'HOUSEHOLD_HOST_REQUIRED',
   hint:'Expanded private memory is encrypted and accessed only through the connected household host.'};
  if(command.startsWith('household post '))return {ok:false,error:'HOUSEHOLD_HOST_REQUIRED',
    hint:'A verified household host must publish public notes after authorization.'};
  if(command==='stations')return ST.view();
  if(command.startsWith('stations '))return ST.handle(spoken.slice('remote stations '.length));
  if(command==='furniture')return F.view();
  if(command==='catnip')return C.view();
  if(command==='pet')return originalRun('pet status');
  if(command==='extras')return originalRun('extras');
  if(command.startsWith('furniture '))return F.handle(command.slice(10));
  if(command.startsWith('catnip '))return C.handle(command.slice(7));
  if(command.startsWith('pet '))return originalRun(spoken.slice(7));
  if(command.startsWith('extras '))return originalRun(command);
  return {ok:false,error:'UNKNOWN_REMOTE_PAGE',...menu()};
 }
 if(remoteRequired(s)||s.startsWith('stations ')||s==='stations')return {ok:false,error:'REMOTE_REQUIRED',
  hint:'Apartment controls live on your carried pocket remote. Use remote activate, then remote help.'};
 return originalRun(raw);
}
// Commit toy physics after native commands complete, including the continuity
// API's internal timestep that is not visible to later global b7Advance wrappers.
async function runWithWorldClock(raw){
 const result=await run(raw);
 C.catchUp();
 sync();
 return result;
}
D.run=runWithWorldClock;D.help=help;
const invoke0=A.invoke?.bind(A);
window.Realiti=Object.freeze({...A,read:resource,run:runWithWorldClock,help,
 invoke:async (...args)=>{
  const out=await invoke0(...args);
  C.catchUp();sync();return out;
 }});
window.REALITI_APARTMENT_REMOTE_V1=Object.freeze({status,menu,entityId:ID});
})();