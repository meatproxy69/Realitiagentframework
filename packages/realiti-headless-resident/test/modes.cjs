'use strict';
// HQ and LQ: control versus intention. HQ moves by vector, degree and speed and crouches through the grate; LQ explores,
// tours, wanders, follows and chains; each mode refuses the other's verbs with a hint; actions and help follow the mode.
const path=require('node:path');
const {openResident}=require('../index.cjs');
const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
const checks={},details={};
const check=(k,v,d)=>{checks[k]=!!v;if(d!==undefined)details[k]=d};
const near=(a,b,t)=>Math.abs(a-b)<=t;
(async()=>{
 const s=await openResident({htmlPath:html});
 try{
  const door=s.door,w=s.window,R=w.Realiti,M=w.REALITI_MATRIX_V1,LG=()=>w.REALITI_LEDGER_V1;
  const m0=await door.run('mode');await door.run('go CITY');
  const hqOnly=await door.run('speed 2');
  check('default_is_lq_and_hq_verbs_are_gated',m0.mode==='lq'&&hqOnly.ok===false&&hqOnly.error==='HQ_ONLY',{m0:m0.mode,hqOnly});
  // HQ controls.
  const hq=await door.run('mode hq');const p0=w.REALITI_MODES_V1.pose();const mv=await door.run('move 2 3');const p1=w.REALITI_MODES_V1.pose();const tn=await door.run('turn 45');const hd=await door.run('heading 90');const sp=await door.run('speed 2');const r=M.state().residents['resident:self'];
  check('hq_vectors_degrees_speed',hq.ok&&mv.ok&&near(p1.position[0]-p0.position[0],2,.1)&&near(p1.position[1]-p0.position[1],3,.1)&&tn.ok&&tn.pose.yaw_deg===315&&hd.pose.yaw_deg===90&&sp.ok&&r.speed===2,{mv:mv.text,tn:tn.pose.yaw_deg,hd:hd.pose.yaw_deg,speed:r.speed});
  const t0=w.eval('C9.b7.clock');await door.run('step 10');const dt=w.eval('C9.b7.clock')-t0;const path=await door.run('path');
  check('speed_changes_the_walk',dt<7&&dt>3&&Array.isArray(path.path)&&path.path.length>=2,{dt,path:path.path.length});
  // Crouch: a giant fits the grate when crouched; stand tall restores the height.
  await door.run('avatar size giant');const refused=await door.run('go UNDERCITY');const cr=await door.run('crouch');const inside=await door.run('go UNDERCITY');const sp1=R.read('realiti://space');await door.run('go CITY');const tall=await door.run('stand tall');
  check('crouch_fits_the_grate',refused.ok===false&&cr.ok&&near(cr.pose.height_m,3.06*.56,.02)&&inside.ok!==false&&sp1.chart==='UNDERCITY'&&tall.ok&&near(tall.pose.height_m,3.06,.02),{cr:cr.pose.height_m,chart:sp1.chart,tall:tall.pose.height_m});
  await door.run('avatar size normal');
  const lqOnly=await door.run('explore');
  check('lq_verbs_are_gated_in_hq',lqOnly.ok===false&&lqOnly.error==='LQ_ONLY');
  // LQ intentions.
  await door.run('mode lq');await door.run('go ARCHIPELAGO');const ex=await door.run('explore');const ex2=await door.run('explore');
  check('explore_reaches_landmarks',ex.ok&&ex.target&&typeof ex.left==='number'&&(ex.arrived||ex.distance_m<400)&&ex2.ok&&ex2.target!==ex.target,{ex:ex.text,ex2:ex2.text});
  await door.run('go CITY');const tour=await door.run('tour');
  check('tour_visits_venues',tour.ok&&tour.stops.length>=4&&tour.stops.filter(x=>x.arrived).length>=3,{stops:tour.stops});
  const wd=await door.run('wander 10');const T=Date.now();LG().import({records:[{by:'other-resident-3',t:1,n:0,kind:'AVATAR',set:{name:'Nyx'}},{by:'other-resident-3',t:2,n:1,kind:'ARRIVE',venue:'teahouse',wall:T-60e3}]});await door.run('stay 1000');const fl=await door.run('follow Nyx');const chain=await door.run('turn left then step 1 then pose');const auto=await door.run('auto');const d1=await door.run('do 1');
  check('wander_follow_chain_auto',wd.ok&&wd.wandered_m>5&&fl.ok&&/Nyx/.test(String(fl.text))&&chain.ok===false&&chain.steps===2&&chain.results[1].error==='HQ_ONLY'&&auto.ok&&typeof auto.did==='string'&&d1&&d1.ok!==false,{wd:wd.text,fl:fl.text,chain:chain.text,auto:auto.did});
  const acts=await door.run('actions'),help=await door.run('help');
  check('mode_shapes_actions_and_help',acts.mode==='lq'&&Array.isArray(acts.extra)&&acts.extra.some(x=>/^explore/.test(x))&&help.mode==='lq'&&help.commands.some(x=>/^LQ controls:/.test(String(x)))&&!help.commands.includes('wander <seconds>')&&!help.commands.includes('crouch / stand tall'),{extra:acts.extra.slice(0,2),help:help.commands});
  check('energy_audit_passes',w.REALITI_HAPTIC_FIELD_V20.energy().pass===true);
 }finally{s.close()}
 console.log(JSON.stringify({checks,details},null,2));
 const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
 if(failed.length){console.error('FAILED',failed);process.exit(1)}
 console.log('MODES PASS',Object.keys(checks).length,'checks');
})().catch(e=>{console.error(e);process.exit(1)});
