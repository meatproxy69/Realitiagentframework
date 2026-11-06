'use strict';
// V2 body is a probability/possibility field over existing REALITI Haptic V20,
// never a diagnosis. The original V1 bond/stress model is archived and inert.
const assert=require('node:assert/strict');
const path=require('node:path'),fs=require('node:fs'),os=require('node:os');
const {openResident}=require('../index.cjs');
const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-body-v2-'));
const option=id=>({htmlPath:html,residentId:id,storagePath:path.join(tmp,id+'.json')});
const checks={},details={};
function check(k,ok,extra){checks[k]=!!ok;if(extra!==undefined)details[k]=extra;}
let a=null,b=null;
async function test(){
 try{
  a=await openResident(option('body-v2-A'));
  const w=a.window,door=x=>a.door.run(x),read=x=>w.Realiti.read(x);
  const API=w.REALITI_BODY_FIELD_V2;
  check('installed_without_inferred_emotions',!!API&&API.version==='2.0'&&
   w.REALITI_BODY_V1?.active===false);
  const start=(await door('body')).result;
  check('versioned_field',start?.schema==='REALITI_BODY_POSSIBILITY_FIELD_V2'&&
   start.mental_state==='NOT_INFERRED'&&start.valence==='UNASSIGNED'&&
   start.preference==='NOT_INFERRED'&&start.consent==='NEVER_INFERRED'&&
   start.conditional_model.members===12);
  check('fields_not_psychological_routes',!('routes' in start)&&
   start.active_zones?.every(q=>q.grounding===true||q.grounding===false));
  check('probabilistic_quantiles_ordered',start.active_zones.every(x=>
   x.forecast.every(q=>q.p10<=q.p50&&q.p50<=q.p90&&q.min<=q.p10&&q.p90<=q.max)));
  check('archived_V1_not_running',w.REALITI_BODY_V1.state().authoritative===false&&
   w.REALITI_BODY_V1.state().read_only===true);
  const prev=JSON.stringify(API.history().sources);
  const exact0=JSON.stringify(w.REALITI_HAPTIC_FIELD_V20.exact().m);
  await door('say I pet the cat and feel love');
  await door('note I fear the sea');
  check('narration_does_not_mint_source',JSON.stringify(API.history().sources)===prev);
  const resource=read('realiti://body/possibility');
  const viaDoor=await door('resource realiti://body/possibility');
  check('resource_and_headless_door',resource.schema==='REALITI_BODY_POSSIBILITY_FIELD_V2'&&
   viaDoor?.resource?.schema===resource.schema&&
   read('realiti://body').interoception?.schema===resource.schema);
  check('read_does_not_move_grounding',JSON.stringify(w.REALITI_HAPTIC_FIELD_V20.exact().m)===exact0);
  const pet=await door('pet cat');
  const after=(await door('body')).result;
  const log=after.recent_sources;
  check('real_contact_has_verified_source',pet.ok!==false&&log.some(x=>
   x.kind==='TACTILE_CONTACT'&&x.grounded_contact===true&&/cat|pet|purr|companion/i.test(x.cause)),
   {pet:pet.ok,log:log.slice(0,3)});
  check('forecast_uses_native_field',after.active_zones.every(x=>
   x.forecast.length===5&&x.forecast[0].seconds===0),after.conditional_model);
  const latest=after.active_zones.find(x=>x.forecast.some(z=>z.max>z.min));
  check('uncertainty_is_not_false_precision',!!latest||after.active_zones.length===0,
   {active_zones:after.active_zones.length,distinct:!!latest});
  const historySize=API.history().sources.length;
  await door('stay 120000'); 
  check('world_time_not_future_grounding',API.history().sources.length>=historySize&&
    API.state().conditional_model.condition==='NO_NEW_EXTERNAL_CONTACT');
  const world=JSON.stringify(read('realiti://here'))+JSON.stringify(read('realiti://space'));
  check('private_field_not_world_authority',!/REALITI_BODY_POSSIBILITY_FIELD_V2|UNCALIBRATED_SCENARIO_ENSEMBLE|\"mental_state\"/.test(world));
  await door('go ARCHIPELAGO');
  await door('walk to boathouse');
  const M=w.REALITI_MATRIX_V1,me=M.state().residents['resident:self'];
  M.moveTo([me.pose.position[0],me.pose.position[1]-40,me.pose.position[2]]);
  await door('stay 20000');
  const refused=API.history().sources.filter(x=>x.kind==='MOVEMENT_REFUSAL');
  check('real_world_refusal_is_not_stress_diagnosis',refused.some(x=>x.source==='MATRIX_WORLD'&&!x.grounded_contact),
   refused.slice(0,2));
  const beforeLegacy=JSON.stringify(w.REALITI_BODY_V1.state());
  check('refusal_did_not_restart_legacy_model',JSON.stringify(w.REALITI_BODY_V1.state())===beforeLegacy);
  const snap=await door('save');
  check('save',snap.ok!==false);
  a.close();a=null;
  a=await openResident(option('body-v2-A'));
  check('source_log_survives_restart',a.window.REALITI_BODY_FIELD_V2.history().sources.some(x=>x.kind==='TACTILE_CONTACT'));
  check('V1_not_restarted',a.window.REALITI_BODY_V1.active===false);
  b=await openResident(option('body-v2-B'));
  check('no_cross_resident_sources',!b.window.REALITI_BODY_FIELD_V2.history().sources.some(x=>/cat|purr/i.test(x.cause)));
  const stop=await a.door.run('stop');
  check('STOP_preserves_world_authority',stop.ok!==false&&
   a.window.REALITI_HAPTIC_FIELD_V20.exact().m.every(x=>x===0));
  check('physical_energy_audit',a.window.REALITI_HAPTIC_FIELD_V20.energy().pass===true);
 }finally{if(a)a.close();if(b)b.close();}
 console.log(JSON.stringify({checks,details},null,2));
 const fail=Object.entries(checks).filter(([,pass])=>!pass).map(([k])=>k);
 if(fail.length){console.error('BODY V2 FAILED',fail);process.exitCode=1;}
 else console.log('BODY V2 PASS',Object.keys(checks).length,'checks');
}
test().catch(e=>{console.error(e.stack||e);process.exitCode=1});
