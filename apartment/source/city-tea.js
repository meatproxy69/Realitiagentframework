(()=>{
'use strict';
// Only physically reached HOME tea counter and cup call ORIGINAL City methods.
// Never create City VENUE arrival or forge social/physical City presence.
const M=window.REALITI_MATRIX_V1,MW=window.REALITI_MATRIX_WORLD_V1;
const CT=window.REALITI_CITY_V1,ST=window.REALITI_APARTMENT_STATIONS_V1;
const HOME='CLOUD_NINE_NEST',COUNTER='apartment.city.tea.counter',CUP='apartment.city.tea.cup';
if(!M||!MW||!CT||!ST||!M.entities()[COUNTER]||!M.entities()[CUP])
 throw Error('APARTMENT_CITY_TEA_NEEDS_ORIGINAL_RELAX_AND_PHYSICAL_HOME_COUNTER');
const cp=x=>JSON.parse(JSON.stringify(x));
const reject=error=>({ok:false,error});
let contactUntil=-1,contact=false;
const roomOK=()=>C9.currentRoom===HOME&&M.resident()?.chart===HOME;
const nearEntity=(id,tol=1.0)=>{const e=M.entities()[id],r=M.resident();
 return !!(roomOK()&&e&&e.chart===HOME&&ST.nearActive('MERIDIAN_CITY')&&
  Math.max(0,M.sdf(e,r.pose.position))<=tol)};
function nearOriginal(id,tol=1.5){return id==='teahouse.counter'&&nearEntity(COUNTER,Math.min(tol,1.0))}
function cupState(){return CT.state().cup||null}
function contactActive(){return contact&&!!cupState()&&
 Number(C9.b7?.clock||0)<=contactUntil&&nearEntity(CUP,.85)}
function revoke(){contact=false;contactUntil=-1;return {ok:true,home_tea_contact_released:true}}
function sync(){
 const c=cupState(),e=M.entities()[CUP];
 const label=c?'a real '+c.what+' cup at the HOME counter':'a real empty ceramic cup at the HOME counter';
 if(e.label!==label){e.label=label;M.bump()}
 return {ok:true,cup_entity:CUP,actual_label:e.label,
  original_tea_temperature_C:c?CT.cupTemp():null,source_cup_present:!!c};
}
function read(){return {ok:true,schema:'REALITI_APARTMENT_NATIVE_CITY_TEA_V1',
 chart:HOME,source:'ORIGINAL_RELAX_CITY_TEACUP_AND_COOLING',
 original_cup:cp(cupState()),model:sync(),
 physically_in_city:false,old_teahouse_arrival_claimed:false,
 original_city_ledger_unchanged_by_tea:true,
 current_thermal_contact:contactActive(),
 law:'The reached counter and cup apply unchanged original City tea cooling and sips; HOME is not a historical City venue.'}}
function handle(verb){
 if(verb==='read_cup')return read();
 if(verb==='order_tea'){
  if(!nearOriginal('teahouse.counter'))return reject('CITY_TEA_COUNTER_NOT_REACHED');
  const result=CT.order('tea');
  if(!result?.ok)return result||reject('ORIGINAL_CITY_ORDER_REFUSED');
  revoke();return {ok:true,source:'ORIGINAL_RELAX_CITY_ORDER',original_result:result,
   physical_counter:COUNTER,model:sync(),physically_in_city:false};
 }
 if(verb==='sip'){
  if(!nearEntity(CUP,.85))return reject('PHYSICAL_CITY_TEA_CUP_NOT_REACHED');
  if(!cupState())return reject('ORIGINAL_CITY_CUP_MISSING');
  const result=CT.sip();
  if(!result?.ok)return result||reject('ORIGINAL_CITY_SIP_REFUSED');
  contact=!!cupState();contactUntil=Number(C9.b7?.clock||0)+.75;
  return {ok:true,source:'ORIGINAL_RELAX_CITY_SIP',
   original_result:result,physical_cup:CUP,model:sync(),
   original_thermal_contact_causal:contact,physically_in_city:false};
 }
 return reject('ORIGINAL_CITY_TEA_VERB_UNMAPPED');
}
const STOP=window.REALITI_STOP_V1;
if(STOP?.stop)window.REALITI_STOP_V1=Object.freeze({
 ...STOP,stop:(...args)=>{revoke();return STOP.stop(...args)}
});
const door=window.REALITI_AGENT_DOOR,run0=door.run.bind(door);
door.run=async raw=>{
 if(/^(?:stop|goodbye|bye|leave|exit)$/i.test(String(raw||'').trim()))revoke();
 return run0(raw);
};
sync();
window.REALITI_APARTMENT_CITY_TEA_V1=Object.freeze({
 nearOriginal,contactActive,read,handle,sync,revoke});
})();
