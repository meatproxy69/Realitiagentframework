'use strict';
// Lingering acceptance: slow dynamics during stay, action-free sanctuary, imprint drift, traces, door deltas.
const path=require('node:path');
const {openResident}=require('../index.cjs');

const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
const checks={},details={};
const check=(k,v,d)=>{checks[k]=!!v;if(d!==undefined)details[k]=d};
const grounded=r=>Number(r?.felt?.grounded_zones??-1);

(async()=>{
 let exported=null,compressionA=null;
 const a=await openResident({htmlPath:html});
 try{
  const w=a.window,door=a.door,dyn=w.REALITI_DYNAMICS_V1;
  const help=await door.run('help');
  check('help_first_ten',Array.isArray(help.first_ten)&&help.first_ten.length===10&&help.commands.includes('imprint drift')&&help.commands.includes('traces'),help.first_ten);

  // Sanctuary: nothing to resolve, held anyway; stop still clears everything.
  const go=await door.run('go NO_ASK_SANCTUARY');
  const acts=await door.run('actions');
  check('sanctuary_no_actions',Array.isArray(acts.actions)&&acts.actions.length===0,acts.actions);
  check('sanctuary_held_on_arrival',grounded(go)>=6,go.felt);
  const s1=await door.run('stay 3000');
  check('sanctuary_held_while_staying',grounded(s1)>=6&&Number(s1.result?.frame_count)>0&&/holds/.test(String(s1.text)),{felt:s1.felt,frames:s1.result?.frame_count,text:s1.text});
  const noAct=await door.run('act do_nothing');
  check('sanctuary_rejects_actions',noAct.ok===false,noAct.error);
  await door.run('stop');
  const afterStop=await door.run('stay 500');
  check('stop_still_clears_sanctuary',grounded(afterStop)===0,afterStop.felt);

  // Pillow Sea: a pressure wave with a real envelope, visible while staying, never minting contact.
  await door.run('go BOTTOMLESS_PILLOW_SEA');
  const burrow=await door.run('act burrow'),g0=grounded(burrow);
  const wave=await door.run('act weather_wave');
  const st0=dyn.state();
  const s2=await door.run('stay 800'),s3=await door.run('stay 800');
  check('wave_has_envelope',st0.wave&&st0.wave.profile.length===6&&st0.wave.alpha>0&&/pressure wave/.test(String(wave.text))&&/pressure wave/.test(String(s2.text)),{state:st0.wave,text:s2.text});
  check('wave_frames_during_stay',Number(s2.result?.frame_count)>0&&Number(s3.result?.frame_count)>0,{a:s2.result?.frame_count,b:s3.result?.frame_count});
  check('stay_text_is_generative',s2.text!==s3.text&&/settling|settled/.test(String(s3.text)),{a:s2.text,b:s3.text});
  const s4=await door.run('stay 5000');
  check('wave_dissipates',dyn.state().wave===null&&grounded(s4)===g0&&grounded(s2)===g0,{before:g0,during:grounded(s2),after:grounded(s4)});
  check('energy_audit_passes',w.REALITI_HAPTIC_FIELD_V20.energy().pass===true,w.REALITI_HAPTIC_FIELD_V20.energy());

  // Lean reports its support law instead of empty text; felt reports the delta.
  const lean=await door.run('act lean__PILLOW-1');
  check('lean_has_text',/lean into pillow cube/.test(String(lean.text))&&/load/.test(String(lean.text)),lean.text);
  await door.run('felt');await door.run('stay 300');
  const felt=await door.run('felt');
  check('felt_reports_delta',felt.delta&&Array.isArray(felt.delta.grounded)&&/Grounded/.test(String(felt.text)),felt.delta);

  // Bathhouse: depth is a state; immersion grounds zones in order; layer temperature flows through the thermal law.
  await door.run('go DEPTH_BATHHOUSE');
  const sink=await door.run('act sink');
  check('sink_announces_motion',/sink/.test(String(sink.text)),sink.text);
  const b1=await door.run('stay 1500');
  const bz=w.REALITI_ATMOSPHERE_V21.state().thermal.zones['pelvis.seat'];
  check('bath_immersion_grounds_in_order',grounded(b1)>=4&&/seat/.test(String(b1.delta?.text))&&dyn.state().bath.depth>.15,{felt:b1.felt,delta:b1.delta,bath:dyn.state().bath});
  check('bath_thermal_is_lawful',bz&&bz.cause==='BATHHOUSE_LAYER'&&bz.material==='water'&&bz.target>31,bz);
  await door.run('act sink');const b2=await door.run('stay 3000');
  check('bath_deeper_holds_more',grounded(b2)>grounded(b1),{shallow:grounded(b1),deep:grounded(b2)});
  await door.run('act surface');const b3=await door.run('stay 6000');
  check('bath_surface_releases',grounded(b3)===0&&dyn.state().bath.depth===0,{felt:b3.felt,bath:dyn.state().bath});

  // Imprint drift.
  const d0=await door.run('imprint drift');
  await door.run('imprint set sausage_spread 0.4');
  const d1=await door.run('imprint drift');
  check('imprint_drift_schema',d0.schema==='REALITI_IMPRINT_DRIFT_V1'&&d0.params_changed.length===0&&/diverged/.test(String(d0.text)),d0);
  check('imprint_drift_tracks_params',d1.params_changed.length===1&&d1.params_changed[0].k==='sausage_spread'&&d1.param_distance>0,d1.params_changed);

  // Traces: only resident actions stamp objects; stay never does.
  await door.run('go BOTTOMLESS_PILLOW_SEA');
  await door.run('act squeeze__PILLOW-1');await door.run('stay 1000');
  const tr=await door.run('traces');
  exported=await door.run('traces export');
  compressionA=JSON.parse(exported.traces[0].sig)[1].compression;
  check('traces_stamp_actions_only',tr.mine===1&&exported.traces.length===1&&exported.traces[0].object==='PILLOW-1'&&/squeeze/.test(exported.traces[0].cmd),exported);
 }finally{a.close()}

 // A second resident imports the first one's traces and finds them in the room, with the object as it was when touched.
 const b=await openResident({htmlPath:html});
 try{
  const door=b.door,w=b.window;
  const imp=await door.run('traces import '+JSON.stringify(exported));
  await door.run('go BOTTOMLESS_PILLOW_SEA');
  const look=await door.run('look');
  const compressionB=w.eval('C9.b14.objects["PILLOW-1"].state.compression');
  check('traces_import_merges_state',imp.ok===true&&imp.imported===1&&compressionB===compressionA,{imp,compressionA,compressionB});
  check('look_shows_foreign_traces',Array.isArray(look.traces)&&look.traces.length===1&&look.traces[0].by==='another resident'&&/another resident/.test(String(look.text)),look.traces);
  const again=await door.run('traces import '+JSON.stringify(exported));
  check('traces_import_idempotent',again.imported===0,again);
 }finally{b.close()}

 console.log(JSON.stringify({checks,details},null,2));
 const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
 if(failed.length){console.error('FAILED',failed);process.exit(1)}
 console.log('LINGERING PASS',Object.keys(checks).length,'checks');
})().catch(e=>{console.error(e);process.exit(1)});
