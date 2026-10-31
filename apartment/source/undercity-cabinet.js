(()=>{
'use strict';
// Native HOME cabinet holding physically reachable lever, moving iron gate,
// and carved vault wall. This reuses the ORIGINAL Undercity U.pull/readWall
// source transitions, not a renamed invented puzzle or a second chart.
const M=window.REALITI_MATRIX_V1,U=window.REALITI_UNDERCITY_V1;
const ST=window.REALITI_APARTMENT_STATIONS_V1,HOME='CLOUD_NINE_NEST';
const ids=Object.freeze({
 'under.lever':'apartment.undercity.lever',
 'under.vault_wall':'apartment.undercity.vault-wall'
});
const GATE='apartment.undercity.gate';
if(!M||!U||!ST||!M.entities()[GATE]||Object.values(ids).some(id=>!M.entities()[id]))
 throw Error('NATIVE_UNDERCITY_CABINET_NEEDS_ORIGINAL_SOURCE_AND_HOME_FIXTURES');
const cp=x=>JSON.parse(JSON.stringify(x));
const reject=error=>({ok:false,error});
function nearOriginal(originalId,tol=1.2){
 const id=ids[originalId],r=M.resident(),e=M.entities()[id];
 return !!(id&&e&&r?.chart===HOME&&C9.currentRoom===HOME&&
  ST.nearActive('UNDERCITY')&&Math.max(0,M.sdf(e,r.pose.position))<=tol);
}
function sync(){
 const gate=M.entities()[GATE],open=!!U.state().gate_open;
 const p=[4.7,open?-5.78:-5.35,1.03],label=open?
  'the real model iron gate, swung open':'the real model iron gate, closed';
 let changed=false;
 if(gate.collision===open){gate.collision=!open;changed=true}
 if(gate.label!==label){gate.label=label;changed=true}
 if(p.some((v,i)=>Math.abs(v-gate.pose.position[i])>1e-6)){
  gate.pose.position=p;changed=true;
 }
 if(changed)M.bump();
 return {ok:true,entity:GATE,open,collision:gate.collision,
  physical_position_m:gate.pose.position.slice()};
}
function read(){
 return {ok:true,schema:'REALITI_APARTMENT_NATIVE_UNDERCITY_CABINET_V1',
  chart:HOME,original_state:cp(U.state()),gate:sync(),
  lever_entity:ids['under.lever'],vault_entity:ids['under.vault_wall'],
  original_maze_chart_entered:false,full_undercity_parity:false,
  law:'Original dynamic lever and inscription events require true native HOME reach; nine-by-nine tunnel walking remains unported.'};
}
function handle(verb){
 const originalId=verb==='pull_lever'?'under.lever':
   verb==='read_wall'?'under.vault_wall':null;
 if(!originalId)return reject('ORIGINAL_UNDERCITY_ACTION_UNMAPPED');
 if(!nearOriginal(originalId))return reject('NATIVE_UNDERCITY_OBJECT_NOT_IN_REACH');
 const result=verb==='pull_lever'?U.pull():U.readWall();
 if(!result?.ok)return result||reject('ORIGINAL_UNDERCITY_SOURCE_REFUSED');
 return {ok:true,source:'ORIGINAL_RELAX_UNDERCITY_DYNAMIC_ACTION',
  source_action:verb,original_result:result,
  original_state:cp(U.state()),gate:sync(),
  agent_physically_in_tunnels:false,original_room_visit_claimed:false};
}
sync();
window.REALITI_APARTMENT_UNDERCITY_CABINET_V1=Object.freeze({
 nearOriginal,read,handle,sync});
})();
