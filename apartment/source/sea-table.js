(()=>{
'use strict';
// The original Relax Archipelago remains a full source physics model, not an
// extra walkable HOME chart. This station controls one small real Matrix token.
// The source's ORIGINAL stepBoat differential integrator is invoked via the
// checked derived-only 58f adapter, with native h/current/wind unchanged.
const M=window.REALITI_MATRIX_V1,AR=window.REALITI_ARCHIPELAGO_V1;
const ST=window.REALITI_APARTMENT_STATIONS_V1;
const HOME='CLOUD_NINE_NEST',BOAT='apartment.sea.boat';
if(!M||!AR||!ST||!M.entities()[BOAT]||!M.entities()['apartment.sea.tray'])
 throw Error('SEA_TABLE_REQUIRES_ORIGINAL_RELAX_AND_PHYSICAL_HOME_TRAY');
const cp=x=>JSON.parse(JSON.stringify(x));
const reject=error=>({ok:false,error});
let active=false;
const state=()=>{if(!C9.chapter2?.isle?.boat)AR.state();return C9.chapter2.isle.boat};
function log(){return C9.apartmentSeaControlV1=C9.apartmentSeaControlV1||
 {schema:'REALITI_APARTMENT_SEA_CONTROL_V1',boardings:0,rows:0,landings:0,destination:null}}
function reachable(){return C9.currentRoom===HOME&&M.resident()?.chart===HOME&&ST.nearActive('ARCHIPELAGO')}
function connected(){return active&&reachable()&&!!state()?.aboard}
function sync(){
 const b=state(),e=M.entities()[BOAT],st=M.entities()[ST.stationEntity('ARCHIPELAGO')];
 if(!b||!e||!st||![b.x,b.y].every(Number.isFinite)||
  Math.abs(b.x)>1300||Math.abs(b.y)>1300)return reject('INVALID_NATIVE_BOAT_COORDINATES');
 const p=[st.pose.position[0]+b.x*.00048,st.pose.position[1]+b.y*.00048,1.2];
 if(Math.hypot(...p.map((v,i)=>v-e.pose.position[i]))>1e-6){
  e.pose.position=p;M.bump();
 }
 return {ok:true,entity:BOAT,table_position_m:p,
  original_world_position_m:[b.x,b.y],scale_m_per_original_m:.00048};
}
function read(){
 const b=state(),islands=AR.state().islands;
 return {ok:true,schema:'REALITI_APARTMENT_NATIVE_SEA_TABLE_V1',
  chart:HOME,station:'ARCHIPELAGO',model:sync(),
  original_boat:cp(b),original_islands:cp(islands),
  controller_active:connected(),previous_actions:cp(log()),
  numerical_engine:'ORIGINAL_REALITI_ARCHIPELAGO_STEPBOAT',
  agent_physically_aboard:false,
  shared_household_authority:false,
  law:'A reachable HOME model boat is controlled with original island wind/current/terrain; it does not place the resident in a 2 km island chart.'};
}
function board(){
 if(!reachable())return reject('SEA_TABLE_NOT_IN_MATRIX_REACH');
 const b=state();if(!b)return reject('NATIVE_BOAT_STATE_MISSING');
 b.aboard=true;b.ashore=false;b.target=null;active=true;log().boardings++;
 return {ok:true,original_native_boat_engaged:true,
  model:sync(),agent_physically_aboard:false,
  scope:'PERSONAL_REACHED_PHYSICAL_TABLE_MODEL',
  original_source_engine:'REALITI_ARCHIPELAGO_V1'};
}
function row(islandId){
 if(!connected())return reject('SEA_TABLE_BOARD_MODEL_FIRST');
 const island=AR.state().islands.find(i=>i.id===islandId);
 if(!island)return reject('UNKNOWN_ORIGINAL_ISLAND');
 const b=state();
 if(b.ashore)return reject('SEA_TABLE_MODEL_AT_SHORE');
 const from=[b.x,b.y];b.target=[island.center[0],island.center[1],0];
 // The checked original 58f wrapper calls the UNCHANGED stepBoat kernel on
 // each native b7Advance tick. Work remains bounded: one command advances
 // at most one original world second and cannot time out on an ocean crossing.
 for(let k=0;k<4&&b.target&&!b.ashore;k++)b7Advance(.25);
 log().rows++;log().destination=islandId;
 return {ok:true,source:'ORIGINAL_RELAX_ARCHIPELAGO_STEPBOAT',
  destination:islandId,original_center_m:island.center.slice(),
  source_wind:AR.wind(),source_current_mps:AR.current(from[0],from[1]),
  moved_in_original_m:+Math.hypot(b.x-from[0],b.y-from[1]).toFixed(4),
  at_original_shore:!!b.ashore,model:sync(),
  bounded_world_advance_s:1,agent_physically_aboard:false};
}
function land(){
 if(!connected())return reject('SEA_TABLE_BOARD_MODEL_FIRST');
 const b=state(),nearDock=Math.hypot(b.x,b.y-(AR.shore_y+12))<=23;
 let coast=null;
 if(nearDock)coast={x:b.x,y:b.y,label:'original harbor dock'};
 else{
  for(let k=0;k<36;k++){
   const a=k*2*Math.PI/36;
   for(let d=2;d<=20;d+=2){
    const x=b.x+Math.cos(a)*d,y=b.y+Math.sin(a)*d;
    if(AR.h(x,y)>=-.3&&(!coast||d<coast.d))
     coast={x,y,d,label:AR.islandAt(x,y)?.name||'original shoal'};
   }
  }
 }
 if(!coast)return reject('ORIGINAL_TERRAIN_HAS_NO_SHORE_WITHIN_20M');
 b.x=coast.x;b.y=coast.y;b.ashore=true;b.aboard=false;b.target=null;
 active=false;log().landings++;
 return {ok:true,original_terrain_checked:true,model:sync(),
  landed_model_on:coast.label,agent_physically_aboard:false};
}
function stop(reason='STOP'){
 const b=state();
 if(b){b.target=null;b.aboard=false}active=false;
 return {ok:true,model_lease_revoked:true,reason,original_chart_not_entered:true};
}
function map(){
 const cells=[];
 for(let y=800;y>=-800;y-=200){
  const row=[];
  for(let x=-800;x<=800;x+=200){
   const z=AR.h(x,y);
   row.push({x,y,height_m:+z.toFixed(2),
    original_island:AR.islandAt(x,y)?.id||null,
    surface:z<0?'open water':'land'});
  }
  cells.push(row);
 }
 return {ok:true,schema:'REALITI_APARTMENT_ORIGINAL_TERRAIN_TABLE_V1',
  source:'ORIGINAL_ARCHIPELAGO_ANALYTIC_HEIGHTFIELD',
  sample_spacing_original_m:200,cells,
  is_explored_old_chart:false,
  law:'This is a sampled model of original terrain, not an observed/fog-cleared original island map.'};
}
function weather(){
 const b=state();
 return {ok:true,source:'ORIGINAL_RELAX_ARCHIPELAGO_WEATHER',
  source_world_coordinates_m:[b.x,b.y],
  wind:AR.wind(),rain_fraction:AR.rain(b.x,b.y),
  sun_altitude_deg:AR.sunAlt(),current_mps:AR.current(b.x,b.y),
  current_apartment_outside_weather_unchanged:true};
}
function handle(verb){
 if(verb==='board_boat')return board();
 if(verb==='land_boat')return land();
 if(verb==='island_map')return map();
 if(verb==='read_weather')return weather();
 if(/^row_to__(harbor|lantern|hollow|stones|grove)$/.test(verb))
  return row(verb.slice('row_to__'.length));
 return reject('ORIGINAL_SEA_TABLE_VERB_NOT_MAPPED');
}
const STOP=window.REALITI_STOP_V1;
if(STOP&&typeof STOP.stop==='function')window.REALITI_STOP_V1=Object.freeze({
 ...STOP,stop:(...args)=>{stop('NATIVE_STOP');return STOP.stop(...args)}
});
const oldDoor=window.REALITI_AGENT_DOOR.run.bind(window.REALITI_AGENT_DOOR);
window.REALITI_AGENT_DOOR.run=async raw=>{
 if(/^(?:stop|goodbye|bye|leave|exit)$/i.test(String(raw||'').trim()))
  stop('AGENT_DEPARTURE');
 return oldDoor(raw);
};
sync();
window.REALITI_APARTMENT_SEA_TABLE_V1=Object.freeze({
 connected,sync,read,board,row,land,map,weather,stop,handle});
})();