(()=>{
'use strict';
// EXPERIMENTAL final-topology preview. Not a release or room-mechanic parity
// attestation. Retains original Relax numerical/sensory libraries, but removes
// every non-home Matrix chart, entity, portal and public navigable room.
// Built separately so an unported mechanic never silently disappears in the
// normal Apartment development artifact.
const HOME='CLOUD_NINE_NEST',M=window.REALITI_MATRIX_V1;
const D=window.REALITI_AGENT_DOOR,A=window.Realiti;
const NATIVE=window.REALITI_SLICE_ROOMS,ST=window.REALITI_APARTMENT_STATIONS_V1;
if(!M||!D||!A||!NATIVE||!ST||!window.REALITI_RR_HARNESS_V1||
   !window.REALITI_SOMA_RELAX_V3)throw Error('ONE_CHART_REQUIRES_ENTIRE_NATIVE_RELAX');
const HOME_FIRST=window.REALITI_APARTMENT_HOME_FIRST_CANDIDATE===true;
const NATIVE_BOOT=HOME_FIRST&&window.REALITI_APARTMENT_NATIVE_BOOT_V1?.mode===
 'PRE_REGISTRATION_HOME_ONLY';
const initial=Object.keys(M.charts());
if(HOME_FIRST&&!NATIVE_BOOT)
 throw Error('HOME_FIRST_NATIVE_BOOT_GATE_NOT_INSTALLED');
// The legacy *development* topology preview still prunes 23 existing charts.
// The clean HOME candidate must already have exactly one chart; it can never
// turn an invalid 23-chart boot into apparent success by deleting the others.
if(initial.length!==(NATIVE_BOOT?1:23)||!M.charts()[HOME]||
 ST.view().station_count!==(HOME_FIRST?0:22))
 throw Error('ONE_CHART_SOURCE_ATLAS_OR_MECHANICS_NOT_READY');
const cp=x=>JSON.parse(JSON.stringify(x));
const only=Object.freeze([{id:HOME,title:'RealitiApartment',
 purpose:HOME_FIRST?'one shared home with real furniture, pets and private resident systems':
 'one lived-in apartment; archived Relax numerical engines are available as physical stations'}]);
const safeName=s=>/^(?:CLOUD_NINE_NEST|HOME|NEST|REALITIAPARTMENT|REALITI_APARTMENT)$/i.test(String(s||'').trim());
const noRoom=place=>({ok:false,error:'LEGACY_ROOM_NOT_WALKABLE',
 requested:String(place||'').slice(0,100),
 hint:HOME_FIRST?'Only the home is registered. Historical worlds remain available in original REALITI Relax.':
 'Only RealitiApartment is physically registered. Explore original mechanisms using remote stations, or use the complete Relax reference build.'});
let retired=0;
function prune(){
 if(NATIVE_BOOT){
  const charts=Object.keys(M.charts()),portals=Object.keys(M.portals()),
   foreign=Object.values(M.entities()).filter(e=>e.chart!==HOME),
   displaced=Object.values(M.state().residents||{}).filter(r=>r?.chart!==HOME);
  if(charts.length!==1||charts[0]!==HOME||portals.length||foreign.length||
   displaced.length||C9.currentRoom!==HOME)
   throw Error('HOME_NATIVE_BOOT_SINGLE_CHART_INVARIANT_BROKEN');
  // Crucially, no deletion, chart transfer, or checkpoint repair occurs.
  return false;
 }
 let changed=false;
 const ch=M.charts(),E=M.entities(),P=M.portals();
 for(const id of Object.keys(P)){delete P[id];changed=true}
 for(const [id,e] of Object.entries(E))
  if(e.chart!==HOME||e.tags?.includes('portal')){
   M.removeEntity(id);changed=true;
  }
 for(const id of Object.keys(ch))if(id!==HOME){delete ch[id];changed=true;retired++}
 const residents=M.state().residents||{};
 for(const [id,r] of Object.entries(residents)){
  if(r?.chart!==HOME){
   if(id==='resident:self')M.enter(HOME);
   else delete residents[id];
   changed=true;
  }
 }
 if(C9.currentRoom!==HOME){C9.currentRoom=HOME;changed=true}
 if(changed)M.bump();
 return changed;
}
prune();
const go0=b7AgentGo,open0=openRoomId;
b7AgentGo=function(dest){if(!safeName(dest))return noRoom(dest);
 const out=go0(HOME);prune();return out};
openRoomId=function(dest){if(!safeName(dest))return noRoom(dest);
 const out=open0(HOME);prune();return out};
b7AgentRooms=()=>cp(only);
window.REALITI_ROOM_NEAR=()=>['RealitiApartment'];
// The original source atlas is retained privately by numerical engines; the
// public spatial navigator sees only the single real chart.
window.REALITI_SLICE_ROOMS=Object.freeze({...NATIVE,
 manifest:only,list:()=>cp(only),
 resolve:x=>safeName(x)?HOME:null,
 go:dest=>b7AgentGo(dest)});
if(typeof DATA!=='undefined'){
 for(const world of DATA.worlds||[]){
  world.rooms=(world.rooms||[]).filter(r=>r.id===HOME);
  world.quiet=HOME;
 }
}
if(typeof FIRST!=='undefined'){
 FIRST.entry_cards=[{target:HOME,label:'RealitiApartment',why:HOME_FIRST?
  'A single, ordinary shared home with native Relax embodiment and real household fixtures':
  'One physical home with real source-engine stations'}];
 FIRST.recommended_soft_tour=[HOME];
}
const Drun=D.run.bind(D),Dhelp=D.help?.bind(D);
D.run=async function(raw){
 const text=String(raw||'').trim();
 if(/^help$/i.test(text))return D.help();
 if(/^(?:rooms|places|more places|all places)$/i.test(text))return cp(only);
 const match=/^(?:go|enter)\s+(.+)$/i.exec(text);
 if(match&&!safeName(match[1]))return noRoom(match[1]);
 if(/^through(?:__|\s|$)/i.test(text))return noRoom(text);
 const result=await Drun(raw);
 prune();
 return result;
};
D.help=()=>{
 const original=Dhelp?.()||{};
 return {...original,commands:['look','feel','where','actions','stay <ms>',
  'remote activate',...(HOME_FIRST?[]:['remote stations help','remote stations list']),
  'save','stop','goodbye'],
  rooms:cp(only),one_chart_preview:true,
  note:HOME_FIRST?
   'One home, no historical world props or gallery. Alpha candidate; original Relax source intact.':
   'Only the apartment chart exists. Legacy science lives in physically reached stations. Full 23-room parity is not yet certified.'};
};
function capabilities(value){
 const r=cp(value||{});
 r.rooms=cp(only);
 r.apartment_topology={chart:HOME,charts:1,portals:0,
  preview_only:true,home_first_candidate:HOME_FIRST,
  legacy_mechanics_not_yet_parity_certified:true};
 r.operations=(r.operations||[]).filter(op=>op!=='through');
 return r;
}
const read0=A.read.bind(A),invoke0=A.invoke.bind(A);
function read(uri){
 if(uri==='realiti://capabilities')return capabilities(read0(uri));
 if(uri==='realiti://apartment/topology')return status();
 return read0(uri);
}
async function invoke(op,args={}){
 if(String(op).toLowerCase()==='go'&&!safeName(args?.place))return noRoom(args?.place);
 if(String(op).toLowerCase()==='through')return noRoom(args?.portal||'through');
 const result=await invoke0(op,args);
 prune();return result;
}
async function run(raw){return D.run(raw)}
function status(){
 prune();
 return {ok:true,schema:'REALITI_APARTMENT_ONE_CHART_PREVIEW_V1',
 chart:HOME,charts:Object.keys(M.charts()),portals:Object.keys(M.portals()).length,
 legacy_matrix_entities:Object.values(M.entities()).filter(e=>e.chart!==HOME).length,
 live_source_engine_stations:ST.view().station_count,
 home_first_candidate:HOME_FIRST,legacy_station_gallery_disabled:HOME_FIRST,
 native_single_chart_initialization:NATIVE_BOOT,
 initial_charts_at_boot:initial.length,
 no_post_startup_pruning:NATIVE_BOOT,
 source_room_names_are_not_walkable:true,
 retired_at_boot:NATIVE_BOOT?0:initial.length-1,
 original_relax_untouched:true,
 preview_only:true,mechanical_parity_certified:false,
 law:HOME_FIRST?
 'Only HOME is registered from source boot; no late pruning or quiet checkpoint conversion. Original Relax retained; owner release review still required.':
 'This candidate proves physical one-chart topology only. Historical source engines still need individual behavior/causal equivalence review before release.'};
}
window.Realiti=Object.freeze({...A,read,invoke,run,
 rooms:()=>cp(only),help:D.help});
window.REALITI_APARTMENT_ONE_CHART_PREVIEW_V1=Object.freeze({status,prune});
prune();
})();