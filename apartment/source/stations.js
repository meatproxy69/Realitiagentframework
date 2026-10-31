(()=>{
'use strict';
// Port-first Apartment station gallery. Every fixture is physically present in
// CLOUD_NINE_NEST and actions start with native Matrix reach. Numerical engines
// and causal state are the ORIGINAL Relax engines, not pasted substitutes.
// Room names here are SOURCE PROVENANCE, never additional Matrix charts.
// This is intentionally PARTIAL migration; no historical room is certified for
// deletion merely because its engine is exposed on an apartment fixture.
const M=window.REALITI_MATRIX_V1,MW=window.REALITI_MATRIX_WORLD_V1;
const W=window.REALITI_WONDER_V1,FR=window.REALITI_CATNIP_V1;
const ROOM=window.REALITI_SLICE_ROOMS,HOME='CLOUD_NINE_NEST';
if(!M||!MW||!W||!FR||!ROOM||!window.REALITI_SOMA_RELAX_V3)
 throw Error('APARTMENT_STATIONS_REQUIRE_ENTIRE_ORIGINAL_RELAX_STACK');
const copy=x=>JSON.parse(JSON.stringify(x));
const HOME_ONLY=()=>C9.currentRoom===HOME&&M.resident().chart===HOME;
const allowed=Object.freeze({
 NO_ASK_SANCTUARY:['quiet','normal'],
 PET_ROOM_2:['view_skeletons','fault_receipt'],
 BOTTOMLESS_PILLOW_SEA:['weather_wave'],
 CARDBOARD_BOX_WORKSHOP:['fold_flap'],
 DEPTH_BATHHOUSE:['weather_wave'],
 SIDE_BY_SIDE_FIRESIDE:['who'],
 SHAPESHIFT_CLOAKROOM:['body_bench','attach_tail','map_paw','wiggle_pair','detach_tail','restore_body'],
 NINE_LIVES_ROOM:['fork_now','branch_a','branch_b','compare','commit_a','commit_b','rewind'],
 LATENCY_LAGOON:['send_boat','pending'],
 ORRERY_LOFT:['watch_orrery','reset_orrery',...((C9SCENES.ORRERY_LOFT?.verbs||[])
   .map(x=>x[0]).filter(x=>/^(?:nudge|brake)_/.test(x)))],
 LANTERN_MAZE:['maze_map','step_north','step_east','step_south','step_west','light_lantern'],
 SANDPILE_SHORE:['drop_grain','drop_grain_edge','pour_handful','read_pile'],
 FIREFLY_MEADOW:['watch_meadow','tap_along','tap_faster','tap_slower','scatter_fireflies'],
 KITE_FIELD:['read_wind','launch_kite','let_out_line','reel_in','tug_line','land_kite'],
 GLASS_ORCHARD:['plant_seed','scatter_seeds','read_orchard','clear_orchard'],
 RESONANCE_WELL:['hum_low','hum_mid','hum_high','read_well'],
 STAR_DECK:['read_sky','sight_lantern','sight_kite','sight_cat','sight_orrery','sight_boat','sight_comet'],
 CLOCKWORK_MARSH:['read_lights','predict'],
 PALIMPSEST_HALL:['read_scroll_1','read_scroll_2','read_scroll_3','read_scroll_4','read_scroll_5','decode'],
 ARCHIPELAGO:['tide','calendar','weather','sea_map'],
 MERIDIAN_CITY:['household','board'],
 UNDERCITY:['echo','touch_wall','map']
});
const original=ROOM.manifest.filter(x=>x.id!==HOME);
if(original.length!==22||Object.keys(allowed).length!==22||
 original.some(x=>!allowed[x.id]))throw Error('APARTMENT_23_ROOM_SOURCE_INVENTORY_DRIFT');
const slot=id=>'apartment.station.'+id.toLowerCase();
const norm=x=>String(x||'').trim().toUpperCase().replace(/[\s-]+/g,'_');
const names=Object.fromEntries(original.map((x,i)=>[x.id,x]));
const stations=original.map((x,i)=>({
 id:x.id,label:x.title,purpose:x.purpose,entity:slot(x.id),
 position:[-4.5+(i%11)*.9,i<11?5:-5,1.25],
 verbs:allowed[x.id].slice(),
 source:'unchanged REALITI Relax engine',migration:'PARTIAL_ENGINE_ACCESS_ONLY'}));
for(const st of stations){
 if(M.entities()[st.entity])throw Error('APARTMENT_STATION_ENTITY_COLLISION:'+st.entity);
 M.addEntity({id:st.entity,chart:HOME,position:st.position.slice(),
  shape:{kind:'SPHERE',radius:.12},tags:['station','original-relax','apparatus','mechanical_port'],
  material:'wood',collision:false,dynamic:false,
  label:st.label+' apparatus',affordances:['inspect','touch']});
}
M.bump();
function find(id){const name=norm(id);return stations.find(x=>x.id===name)||
 stations.find(x=>norm(x.label)===name)||null}
function nearActive(id){
 const st=find(id),r=M.state().residents['resident:self'];
 if(!st||!r||r.chart!==HOME||!HOME_ONLY())return false;
 const e=M.entities()[st.entity];return !!e&&e.chart===HOME&&
  Math.max(0,M.sdf(e,r.pose.position))<=1.1;
}
function view(){
 return {ok:true,schema:'REALITI_APARTMENT_NATIVE_STATIONS_V1',
  chart:HOME,source_room_count:ROOM.manifest.length,station_count:stations.length,
  single_apartment_location:true,
  stations:stations.map(st=>({...st,position:M.entities()[st.entity]?.pose.position.slice(),
   within_native_reach:nearActive(st.id)})),
  law:'Source names identify the original Relax algorithms, not extra spaces. All 22 apparatus have native Matrix geometry, but full legacy action parity is NOT yet certified and legacy charts remain until tested.'};
}
function snapshot(id){
 const st=find(id);if(!st)return {ok:false,error:'UNKNOWN_NATIVE_APARTMENT_STATION'};
 const state={ok:true,schema:'REALITI_APARTMENT_STATION_SNAPSHOT_V1',source_room:st.id,
  chart:HOME,entity:st.entity,reachable:nearActive(st.id),
  original_source:'REALITI Relax',migration_status:st.migration,
  allowed_verbs:st.verbs.slice(),porting_law:'Original mathematical engines retained; location-gated legacy effects still require individual parity tests.'};
 if(['ORRERY_LOFT','LANTERN_MAZE','SANDPILE_SHORE','FIREFLY_MEADOW','KITE_FIELD'].includes(st.id)){
  const keys={ORRERY_LOFT:'orrery',LANTERN_MAZE:'maze',SANDPILE_SHORE:'sandpile',FIREFLY_MEADOW:'meadow',KITE_FIELD:'kite'};
  state.engine_state=copy(W.state()[keys[st.id]]||null);
  if(st.id==='LANTERN_MAZE')state.map=W.map();
 }else if(['GLASS_ORCHARD','RESONANCE_WELL','STAR_DECK','CLOCKWORK_MARSH','PALIMPSEST_HALL'].includes(st.id)){
  const keys={GLASS_ORCHARD:'orchard',RESONANCE_WELL:'well',STAR_DECK:'sky',CLOCKWORK_MARSH:'marsh',PALIMPSEST_HALL:'hall'};
  state.engine_state=copy(FR.state()[keys[st.id]]||null);
 }else if(st.id==='ARCHIPELAGO'){
  state.engine_state={tide:window.REALITI_LONG_GAME_V1?.tide?.()||null,
   calendar:window.REALITI_CATNIP_PACK_V1?.calendar?.()||null};
 }else if(st.id==='MERIDIAN_CITY'||st.id==='SIDE_BY_SIDE_FIRESIDE'){
  state.engine_state=window.REALITI_APARTMENT_HOUSEHOLD_V1?.view?.()||null;
 }else if(st.id==='UNDERCITY'){
  state.engine_state={original_tunnel_layout:window.REALITI_UNDERCITY_V1?.layout?.()?.length||0,
   home_echo_source:'REALITI_MATRIX_V1.raycast',scope:'apartment fixture; not a new tunnel chart'};
 }else if(st.id==='NINE_LIVES_ROOM'){
  state.engine_state=ROOM.sandbox();
 }else if(st.id==='LATENCY_LAGOON'){
  state.engine_state=window.REALITI_CONTINUITY?.pending?.()||[];
 }
 return state;
}
function echo(){
 const r=M.resident(),C=343,count=16,head=[r.pose.position[0],r.pose.position[1],
  r.pose.position[2]+r.shape.height/2-.1],f=M.facing(r);
 const yaw=Math.atan2(f[0],f[1]),out=[];
 for(let i=0;i<count;i++){
  const a=yaw+2*Math.PI*i/count;
  const h=M.raycast({origin:head,direction:[Math.sin(a),Math.cos(a),0],
   maxDistance:14,chart:HOME});
  out.push({relative_deg:i*360/count,distance_m:h?.distance??null,
   delay_ms:h?.distance==null?null:Math.round(2000*h.distance/C),
   surface:h?.hit?(M.entities()[h.hit]?.material||null):null});
 }
 return {ok:true,schema:'REALITI_APARTMENT_NATIVE_ECHO_V1',
  echoes:out,source:'original Matrix SDF raycast and physical home walls',
  speed_of_sound_m_s:C,
  law:'This measures the apartment, not a fictional remote Undercity tunnel.'};
}
function invokeNative(st,verb,args){
 if(st.id==='NO_ASK_SANCTUARY')
  return verb==='quiet'?ROOM.hush(true):ROOM.hush(false);
 if(st.id==='SIDE_BY_SIDE_FIRESIDE'||st.id==='MERIDIAN_CITY')
  return verb==='board'?window.REALITI_APARTMENT_HOUSEHOLD_V1.board():
   window.REALITI_APARTMENT_HOUSEHOLD_V1.view();
 if(st.id==='NINE_LIVES_ROOM')return ROOM.nine(verb);
 if(st.id==='LATENCY_LAGOON')
  return verb==='pending'?{ok:true,pending:window.REALITI_CONTINUITY?.pending?.()||[]}:
   window.REALITI_CONTINUITY?.launch?.({destination:HOME})||{ok:false,error:'NATIVE_CONTINUITY_MISSING'};
 if(st.id==='ARCHIPELAGO'){
  const A=window.REALITI_ARCHIPELAGO_V1,LG=window.REALITI_LONG_GAME_V1,P=window.REALITI_CATNIP_PACK_V1;
  if(verb==='tide')return {ok:true,tide:LG.tide(),origin:'original island world-time tide'};
  if(verb==='calendar')return P.calendar();
  if(verb==='weather')return {ok:true,at_origin:A.rain(0,0),wind_mps:A.wind(0,0),
   sun_alt_deg:A.sunAlt(),native_island_time_s:LG.T()};
  if(verb==='sea_map')return {ok:true,original_island_map:A.map(),model:'native 2km archipelago, sampled on tabletop; no second Matrix chart in apartment'};
 }
 if(st.id==='UNDERCITY'){
  if(verb==='echo')return echo();
  if(verb==='touch_wall')return {ok:true,
   touched:MW.reach(st.entity).ok,
   source:'REALITI_MATRIX_WORLD_V1 original native reached station fixture'};
  if(verb==='map')return {ok:true,native_model:window.REALITI_UNDERCITY_V1.layout(),
   apartment_evidence:echo(),historical_model_only:true};
 }
 if(st.id==='CLOCKWORK_MARSH'&&verb==='predict'){
  if(!Array.isArray(args)||args.length!==2||!args.every(Number.isFinite))
   return {ok:false,error:'PREDICTION_COORDINATES_REQUIRED'};
  return FR.predict(args[0],args[1]);
 }
 if(st.id==='PALIMPSEST_HALL'&&verb==='decode'){
  if(!Array.isArray(args)||args.length!==2||!(/^[1-5]$/.test(String(args[0]))))
   return {ok:false,error:'SCROLL_AND_KEY_REQUIRED'};
  return FR.decode(Number(args[0]),String(args[1]));
 }
 const before=JSON.stringify(C9?.b4?.lastReceipt||null);
 const returned=c9verb(st.id,verb);
 if(returned===false||returned==null)return {ok:false,error:'NATIVE_RELAX_VERB_DID_NOT_RUN',source_room:st.id,verb};
 if(typeof returned==='object')return returned;
 const receipt=C9?.b4?.lastReceipt||null;
 if(!receipt||JSON.stringify(receipt)===before)
  return {ok:false,error:'NATIVE_RELAX_VERB_LACKED_NEW_EVIDENCE',source_room:st.id,verb};
 return {ok:true,native_result:returned,receipt:copy(receipt),
  native_source_room:st.id,live_matrix_chart:HOME};
}
function run(id,verb,args=[]){
 const st=find(id);if(!st)return {ok:false,error:'UNKNOWN_NATIVE_APARTMENT_STATION'};
 verb=String(verb||'').toLowerCase().trim();
 if(!st.verbs.includes(verb))return {ok:false,error:'STATION_VERB_UNPORTED',
  available:st.verbs.slice(),source_room:st.id};
 if(!HOME_ONLY())return {ok:false,error:'NOT_IN_APARTMENT'};
 if(!nearActive(st.id))return {ok:false,error:'STATION_NOT_IN_MATRIX_REACH',
  hint:'Approach '+st.entity+' with the real native Matrix body before using this apparatus.',
  entity:st.entity};
 const reached=MW.reach(st.entity);
 if(!reached?.ok)return {ok:false,error:reached?.error||'NATIVE_MATRIX_REACH_REFUSED'};
 let result;try{result=invokeNative(st,verb,args)}catch(e){
  return {ok:false,error:'NATIVE_RELAX_STATION_HANDLER_FAILED',
   message:String(e?.message||e).slice(0,180)};}
 try{window.c9saveNow?.()}catch(e){}
 return {...(result||{ok:false,error:'NATIVE_HANDLER_MISSING'}),station_id:st.id,
  physical_station_entity:st.entity,
  actual_matrix_reach:true,source_receipt:reached.receipt||null,
  source_implementation:'UNCHANGED_NATIVE_REALITI_RELAX',
  numerical_model_retained:true};
}
function handle(text){
 const s=String(text||'').trim();
 if(s==='help')return {ok:true,commands:['stations list','stations inspect <source-id>',
  'stations use <source-id> <native-verb> [argument ...]'],
  note:'Move to the physical station. Station names are original source provenance, NOT extra walkable rooms.'};
 if(s==='list'||s==='status')return view();
 const m=/^(?:inspect|use)\s+([a-z0-9_-]+)(?:\s+([a-z0-9_-]+))?(?:\s+(.*))?$/i.exec(s);
 if(!m)return {ok:false,error:'UNKNOWN_STATION_COMMAND'};
 const st=find(m[1]);
 if(!st)return {ok:false,error:'UNKNOWN_NATIVE_APARTMENT_STATION'};
 if(m[0].toLowerCase().startsWith('inspect'))return snapshot(st.id);
 const args=m[3]?(m[2]==='predict'?m[3].split(/\s+/).map(Number):
  m[2]==='decode'?m[3].split(/\s+/):[m[3]]):[];
 return run(st.id,m[2]||'',args);
}
window.REALITI_APARTMENT_STATIONS_V1=Object.freeze({view,snapshot,run,handle,
 nearActive,stationEntity:id=>find(id)?.entity||null});
})();