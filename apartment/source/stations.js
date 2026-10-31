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
 PET_ROOM_2:['view_skeletons','fault_receipt','go_tiny','restore_scale','scratch_post','knead_blanket','pounce_string','circle_loaf','purr_blanket','rest_paws','hide_sofa','near_collision','neuromesh_handshake'],
 BOTTOMLESS_PILLOW_SEA:['weather_wave','dive','burrow','bounce','listen'],
 CARDBOARD_BOX_WORKSHOP:['fold_flap','box_in','scratch_cardboard','scratch_against','tape','build_tunnel','hide_small_thing','tap_box'],
 DEPTH_BATHHOUSE:['weather_wave','sink','float','surface','stir','warm_shelf'],
 SIDE_BY_SIDE_FIRESIDE:['who'],
 SHAPESHIFT_CLOAKROOM:['body_bench','attach_tail','map_paw','wiggle_pair','detach_tail','restore_body',...((C9SCENES.SHAPESHIFT_CLOAKROOM?.verbs||[]).map(x=>x[0]))],
 NINE_LIVES_ROOM:['fork_now','branch_a','branch_b','compare','commit_a','commit_b','rewind'],
 LATENCY_LAGOON:['send_boat','pending','check_pending','watch_water','leave_pending'],
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
 position:({NO_ASK_SANCTUARY:[-3.4,4.2,.55],BOTTOMLESS_PILLOW_SEA:[-3.4,3.6,.55],DEPTH_BATHHOUSE:[.7,4,.9],PET_ROOM_2:[3.65,-3.25,.8],CARDBOARD_BOX_WORKSHOP:[-1.6,-4.6,.9]})[x.id]||[-4.5+(i%11)*.9,i<11?5:-5,1.25],
 verbs:allowed[x.id].slice(),
 source:'unchanged REALITI Relax engine',migration:'PARTIAL_ENGINE_ACCESS_ONLY'}));
for(const st of stations){
 if(M.entities()[st.entity])throw Error('APARTMENT_STATION_ENTITY_COLLISION:'+st.entity);
 M.addEntity({id:st.entity,chart:HOME,position:st.position.slice(),
  shape:{kind:'SPHERE',radius:.12},tags:['station','original-relax','apparatus','mechanical_port'],
  material:'wood',collision:false,dynamic:false,
  label:st.label+' apparatus',affordances:['inspect','touch']});
}
// Actual native Matrix support, water and cardboard colliders are present
// before any original Relax body operation can lease a grounded cause.
if(!M.entities()['apartment.bath.basin']){
 M.addEntity({id:'apartment.bath.basin',chart:HOME,
  position:[.7,4,.25],shape:{kind:'BOX',halfExtents:[.63,.58,.25]},
  tags:['bath','water','support','seat','station_fixture'],collision:true,
  material:'ceramic',label:'a warm shallow immersion basin',affordances:['sit','touch']});
 M.addEntity({id:'apartment.bath.water',chart:HOME,position:[.7,4,.67],
  shape:{kind:'VOLUME',halfExtents:[.6,.54,.45]},
  tags:['bath','warm','water','fluid'],collision:false,material:'water',
  label:'shallow warm water inside the physical basin',affordances:['touch','watch']});
}
for(const [id,p,h] of [
 ['apartment.cardboard.wall-west',[-2.21,-4.65,.36],[.06,.55,.36]],
 ['apartment.cardboard.wall-east',[-.99,-4.65,.36],[.06,.55,.36]],
 ['apartment.cardboard.wall-south',[-1.6,-5.2,.36],[.65,.06,.36]]
]){
 if(!M.entities()[id])M.addEntity({id,chart:HOME,position:p,shape:{kind:'BOX',halfExtents:h},
  tags:['cardboard','den','wall','fixture'],collision:true,material:'cardboard',
  label:'physical corrugated cardboard wall',dynamic:false});
}
M.bump();
function find(id){const name=norm(id);return stations.find(x=>x.id===name)||
 stations.find(x=>norm(x.label)===name)||null}
function objectNear(id,tol=1.1){
 const r=M.state().residents['resident:self'],e=M.entities()[id];
 return !!r&&r.chart===HOME&&HOME_ONLY()&&e?.chart===HOME&&
  Math.max(0,M.sdf(e,r.pose.position))<=tol;
}
function isPillowSupported(){
 const r=M.state().residents['resident:self'];
 return objectNear('apartment.quiet-cushion',.75)&&
  !!r&&['lying','sitting'].includes(r.posture)&&
  (r.on==='apartment.quiet-cushion'||r.support==='apartment.quiet-cushion');
}
function isBathImmersed(){
 const r=M.state().residents['resident:self'];
 return objectNear('apartment.bath.water',.8)&&
  !!r&&['sitting','lying'].includes(r.posture)&&
  (r.on==='apartment.bath.basin'||r.support==='apartment.bath.basin');
}
function nearStation(id){
 const st=find(id),r=M.state().residents['resident:self'];
 if(!st||!r||r.chart!==HOME||!HOME_ONLY())return false;
 const e=M.entities()[st.entity];return !!e&&e.chart===HOME&&
  Math.max(0,M.sdf(e,r.pose.position))<=1.1;
}
function canHoldSanctuary(){
 return isPillowSupported()&&nearStation('NO_ASK_SANCTUARY');
}
function nearActive(id){
 if(id==='BOTTOMLESS_PILLOW_SEA'&&isPillowSupported())return true;
 if(id==='DEPTH_BATHHOUSE'&&isBathImmersed())return true;
 if(id==='PET_ROOM_2'&&['apartment.scratcher','apartment.pet-bed',
  'apartment.ribbon','apartment.sofa'].some(x=>objectNear(x)))return true;
 return nearStation(id);
}
function canRunPressure(id){return id==='BOTTOMLESS_PILLOW_SEA'?isPillowSupported():
 id==='DEPTH_BATHHOUSE'?isBathImmersed():false}
function waveSource(){return isPillowSupported()?'BOTTOMLESS_PILLOW_SEA':
 isBathImmersed()?'DEPTH_BATHHOUSE':null}
const originalCapsule=Object.freeze({radius:M.resident().shape.radius,
 height:M.resident().shape.height});
function usePhysicalScale(tiny){
 const r=M.resident();
 if(!r||r.chart!==HOME)return {ok:false,error:'NATIVE_APARTMENT_BODY_MISSING'};
 if(!['standing','sitting','lying'].includes(r.posture))
  return {ok:false,error:'BODY_POSTURE_NOT_SAFE_FOR_SIZE_CHANGE'};
 const before={radius:r.shape.radius,height:r.shape.height};
 r.shape.radius=tiny?.18:originalCapsule.radius;
 r.shape.height=tiny?.45:originalCapsule.height;
 if(r.posture==='standing'){
  const sup=M.entities()[r.support],top=sup?.shape?.kind==='BOX'?
   sup.pose.position[2]+sup.shape.halfExtents[2]:0;
  r.pose.position[2]=top+r.shape.height/2;
 }
 r.v=[0,0,0];r.intent=null;M.bump();
 return {ok:true,from:before,to:{radius:r.shape.radius,height:r.shape.height},
  source:'REALITI_PET2_ORIGINAL_SCALE_PLUS_NATIVE_MATRIX_CAPSULE_GEOMETRY'};
}
if(C9?.pet2?.scale==='CAT_SMALL')usePhysicalScale(true);
function causeObject(st,verb){
 if(st.id==='PET_ROOM_2'){
  return ({
   scratch_post:'apartment.scratcher',
   knead_blanket:'apartment.pet-bed',
   pounce_string:'apartment.ribbon',
   circle_loaf:'apartment.pet-bed',
   purr_blanket:'apartment.pet-bed',
   rest_paws:'apartment.pet-bed',
   hide_sofa:'apartment.sofa'
  })[verb]||st.entity;
 }
 return st.entity;
}
function nativeState(id){
 if(id==='PET_ROOM_2')return copy(C9?.pet2||{});
 if(id==='CARDBOARD_BOX_WORKSHOP')return copy(C9?.box2||{});
 if(id==='SHAPESHIFT_CLOAKROOM')return copy({form:C9?.formScratch||null,
  borrowed:C9?.eco3?.borrowed||null});
 if(id==='DEPTH_BATHHOUSE'||id==='BOTTOMLESS_PILLOW_SEA')
  return window.REALITI_DYNAMICS_V1?.state?.()||null;
 if(id==='LATENCY_LAGOON')return window.REALITI_CONTINUITY?.pending?.()||[];
 return null;
}
function syncNativePhysicalObjects(id,verb){
 if(id!=='CARDBOARD_BOX_WORKSHOP')return;
 const s=C9.box2||{},defs=[];
 if(s.tunnel)defs.push(
  ['apartment.cardboard.tunnel-west',[-1.95,-3.65,.38],[.06,.65,.38]],
  ['apartment.cardboard.tunnel-east',[-1.25,-3.65,.38],[.06,.65,.38]],
  ['apartment.cardboard.tunnel-roof',[-1.6,-3.65,.80],[.41,.65,.06]]);
 for(const [name,pos,h] of defs)if(!M.entities()[name])
  M.addEntity({id:name,chart:HOME,position:pos,
   shape:{kind:'BOX',halfExtents:h},
   tags:['cardboard','tunnel','physical','support'],collision:true,
   material:'cardboard',label:'a real cardboard tunnel segment'});
 if(s.hidden&&!M.entities()['apartment.cardboard.hidden-tab'])
  M.addEntity({id:'apartment.cardboard.hidden-tab',chart:HOME,
   position:[-1.6,-3.65,.08],shape:{kind:'SPHERE',radius:.05},
   collision:false,tags:['secret','cardboard','hidden'],material:'cardboard',
   label:'an inconspicuous real cardboard tab beneath a tunnel wall'});
 if(defs.length||s.hidden)M.bump();
}
syncNativePhysicalObjects('CARDBOARD_BOX_WORKSHOP','boot');
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
 if(st.id==='LATENCY_LAGOON'){
  const C=window.REALITI_CONTINUITY;
  if(verb==='pending'||verb==='check_pending')
   return {ok:true,pending:C?.pending?.()||[],source:'ORIGINAL_RELAX_CONTINUITY'};
  if(verb==='send_boat')
   return C?.launch?.({destination:HOME})||{ok:false,error:'NATIVE_CONTINUITY_MISSING'};
  if(verb==='leave_pending')
   return {ok:true,pending:C?.pending?.()||[],already_in_home:true,
    law:'The paper boat is a real pending native cause; no phantom old chart transition is required.'};
  if(verb==='watch_water'){
   const old=c9verb(st.id,verb);
   return {ok:true,original_verb_processed:true,pending:C?.pending?.()||[],
    self_report_only:true,receipt:copy(C9.b4?.lastReceipt||null),
    native_result:old===undefined?null:old};
  }
 }
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
 if((st.id==='BOTTOMLESS_PILLOW_SEA'||st.id==='DEPTH_BATHHOUSE')&&verb==='weather_wave'){
  const original=c9verb(st.id,verb),wave=window.REALITI_DYNAMICS_V1?.state?.()?.wave||null;
  return wave?{ok:true,native_wave:wave,
   original_dynamics:'REALITI_DYNAMICS_V1',
   source:'ORIGINAL_SOURCE_WAVE_PROFILE',
   law:'Original wave runs only while authentic home body support remains in native Matrix reach.'}:
   {ok:false,error:'NATIVE_PRESSURE_WAVE_WAS_NOT_LAUNCHED',original_action:original===true};
 }
 if(st.id==='CLOCKWORK_MARSH'&&verb==='predict'){
  if(!Array.isArray(args)||args.length!==2||!args.every(Number.isFinite))
   return {ok:false,error:'PREDICTION_COORDINATES_REQUIRED'};
  const done=FR.predict(args[0],args[1]);
  return done?{ok:true,receipt:copy(C9.b4?.lastReceipt||null)}:
   {ok:false,error:'NATIVE_MARSH_PREDICTION_REFUSED'};
 }
 if(st.id==='PALIMPSEST_HALL'&&verb==='decode'){
  if(!Array.isArray(args)||args.length!==2||!(/^[1-5]$/.test(String(args[0]))))
   return {ok:false,error:'SCROLL_AND_KEY_REQUIRED'};
  const done=FR.decode(Number(args[0]),String(args[1]));
  return done?{ok:true,receipt:copy(C9.b4?.lastReceipt||null)}:
   {ok:false,error:'NATIVE_SCROLL_DECODE_REFUSED'};
 }
 const before=JSON.stringify(C9?.b4?.lastReceipt||null);
 const oldState=nativeState(st.id),returned=c9verb(st.id,verb);
 if(returned===false)return {ok:false,error:'NATIVE_RELAX_VERB_DID_NOT_RUN',source_room:st.id,verb};
 if(returned==null){
  const found=C9SCENES[st.id]?.verbs?.some(v=>v[0]===verb);
  if(!found)return {ok:false,error:'ORIGINAL_RELAX_ACTION_NOT_REGISTERED'};
  const next=nativeState(st.id),changed=JSON.stringify(oldState)!==JSON.stringify(next);
  return {ok:true,native_action_accepted:true,
   state_changed:changed,native_state:next,
   original_cause:copy(C9?.b2?.lastReceipt||null),
   original_receipt:JSON.stringify(C9?.b4?.lastReceipt||null)!==before?
    copy(C9.b4.lastReceipt):null,
   law:'Executed the original registered Relax behavior after physically reaching its apparatus. Historical or private narrative outcomes are not additional grounded touch.'};
 }
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
 if(st.id==='BOTTOMLESS_PILLOW_SEA'&&
  ['dive','burrow','bounce','weather_wave'].includes(verb)&&!isPillowSupported())
  return {ok:false,error:'SOFT_SUPPORT_REQUIRED',
   hint:'Use the original Matrix sit/lie posture on apartment.quiet-cushion first.'};
 if(st.id==='DEPTH_BATHHOUSE'&&
  ['sink','float','surface','weather_wave','stir','warm_shelf'].includes(verb)&&!isBathImmersed())
  return {ok:false,error:'PHYSICAL_WATER_BASIN_REQUIRED',
   hint:'Use the original Matrix sit/lie posture on apartment.bath.basin first.'};
 if(st.id==='CARDBOARD_BOX_WORKSHOP'&&verb==='box_in'){
  const r=M.resident(),p=r.pose.position;
  if(C9.pet2?.scale!=='CAT_SMALL'||r.shape.height>.6)
   return {ok:false,error:'ACTUAL_TINY_BODY_REQUIRED'};
  if(Math.abs(p[0]+1.6)>.52||Math.abs(p[1]+4.65)>.5)
   return {ok:false,error:'NOT_PHYSICALLY_INSIDE_CARDBOARD_DEN'};
 }
 // The original Nine Lives counterfactual fingerprint rejects any external
 // mutation after fork. Reaching the same real station again would itself
 // alter the native body evidence; one starting touch is enough for the
 // continued stationary sandbox choices. Other apparatus still require
 // native reach evidence for every act.
 const renew=st.id!=='NINE_LIVES_ROOM'||verb==='fork_now';
 const object=causeObject(st,verb);
 const reached=renew?MW.reach(object):{ok:true,receipt:null};
 if(!reached?.ok)return {ok:false,error:reached?.error||'NATIVE_MATRIX_REACH_REFUSED'};
 let result;try{result=invokeNative(st,verb,args)}catch(e){
  return {ok:false,error:'NATIVE_RELAX_STATION_HANDLER_FAILED',
   message:String(e?.message||e).slice(0,180)};}
 if(result?.ok&&st.id==='PET_ROOM_2'&&['go_tiny','restore_scale'].includes(verb)){
  const tiny=verb==='go_tiny';
  if((C9.pet2?.scale==='CAT_SMALL')!==tiny)
   return {ok:false,error:'ORIGINAL_RELAX_METRIC_STATE_DID_NOT_APPLY'};
  result={...result,metric_transformation:usePhysicalScale(tiny)};
 }
 if(result?.ok)syncNativePhysicalObjects(st.id,verb);
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
 nearActive,isPillowSupported,isBathImmersed,canHoldSanctuary,canRunPressure,waveSource,
 stationEntity:id=>find(id)?.entity||null});
})();