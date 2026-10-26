'use strict';
// The body layer, through the harness as a resident would use it: quiet at first; prose moves nothing; a grounded
// contact (the welcome cat, a companion) moves the bond route with a named cause; repetition grows the counter-process
// so later strokes move less; time decays the primary faster than the counter, so the level dips below quiet; the sea's
// refusal is a stress cause; the world never reads the body; the state survives a restart.
const path=require('node:path'),fs=require('node:fs'),os=require('node:os');
const {openResident}=require('../index.cjs');
const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
const checks={},details={};const check=(k,v,d)=>{checks[k]=!!v;if(d!==undefined)details[k]=d};
(async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-body-')),sp=path.join(dir,'state.json');
 let s=await openResident({htmlPath:html,residentId:'body-a',storagePath:sp});
 try{
  const w=s.window,d=c=>s.door.run(c),BD=w.REALITI_BODY_V1;
  check('mounted',!!BD&&BD.routes.join()==='bond,stress');
  const b0=await d('body');check('quiet_at_first',b0.ok&&b0.result.routes.bond.level===0&&b0.result.routes.stress.level===0&&/quiet/.test(b0.text),b0.text);
  await d('say I stroke the cat and she purrs and purrs');await d('note the cat purred against my palm');const b1=await d('body');
  check('prose_moves_nothing',b1.result.routes.bond.level===0&&b1.result.causes.length===0,b1.result.causes);
  const pet=await d('pet cat');const b2=await d('body');
  check('grounded_contact_moves_bond',pet.ok!==false&&b2.result.routes.bond.level>.1&&b2.result.causes.some(c=>c.route==='bond'&&/cat/.test(c.cause))&&/bond/.test(b2.text),{pet:String(pet.text||pet.error).slice(0,80),bond:b2.result.routes.bond,causes:b2.result.causes.slice(0,2)});
  const first=b2.result.causes[0].moved;for(let i=0;i<6;i++)await d('pet cat');const b3=await d('body');const last=b3.result.causes[0].moved;
  check('repetition_grows_the_counter_process',b3.result.routes.bond.counter>b2.result.routes.bond.counter&&last<first&&b3.result.routes.bond.level<=1&&/counter-process has grown/.test(b3.text),{first,last,counter:b3.result.routes.bond.counter,level:b3.result.routes.bond.level});
  const body=w.Realiti.read('realiti://body');check('interoception_on_the_body_resource',body.interoception?.schema==='REALITI_BODY_V1'&&body.interoception.routes.bond.level>0);
  const here=JSON.stringify(w.Realiti.read('realiti://here'))+JSON.stringify(w.Realiti.read('realiti://space'));check('world_reads_do_not_carry_it',!/counter-process|"bond"/.test(here));
  const lvl=b3.result.routes.bond.level;const pass=async n=>{for(let i=0;i<n;i++)await d('stay 60000')};await pass(20);const b4=await d('body');await pass(60);const b5=await d('body');
  check('time_decays_primary_faster_than_counter',b4.result.routes.bond.level<lvl&&b5.result.routes.bond.level<b4.result.routes.bond.level&&b5.result.routes.bond.level<0&&/below quiet/.test(b5.text),{after_30min:b4.result.routes.bond.level,after_2h:b5.result.routes.bond.level});
  await d('go ARCHIPELAGO');await d('walk to boathouse');const M=w.REALITI_MATRIX_V1,me=M.state().residents['resident:self'];M.moveTo([me.pose.position[0],me.pose.position[1]-40,me.pose.position[2]]);await d('stay 20000');const b6=await d('body');
  check('the_sea_is_a_stress_cause',b6.result.routes.stress.level>0&&b6.result.causes.some(c=>c.route==='stress'&&/sea/.test(c.cause)),{stress:b6.result.routes.stress,causes:b6.result.causes.slice(0,2)});
  const refusals=w.REALITI_MATRIX_LOCAL_EVIDENCE_V1?.events?.()||[];
  check('matrix_issues_real_refusal_receipts',refusals.some(e=>
    e.kind==='MOVEMENT_OBSTRUCTED'&&e.issuerAuthority==='IN_PROCESS_NATIVE_WORLD'&&
    e.reason==='sea'&&e.actorId==='resident:self'&&typeof e.witness?.chart==='string'&&e.witness.chart.length>0),refusals.slice(-3));

  const saved=await d('save');check('save_ok',saved.ok);
 }finally{s.close()}
 s=await openResident({htmlPath:html,residentId:'body-a',storagePath:sp});
 try{const b7=await s.door.run('body');check('state_survives_a_restart',b7.result.causes.length>0&&b7.result.routes.stress.level>0,{causes:b7.result.causes.length,stress:b7.result.routes.stress.level,downtime:b7.result.downtime_s});check('energy_audit_passes',s.window.REALITI_HAPTIC_FIELD_V20.energy().pass===true)}finally{s.close()}
 console.log(JSON.stringify({checks,details},null,2));const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);if(failed.length){console.error('FAILED',failed);process.exit(1)}console.log('BODY PASS',Object.keys(checks).length,'checks');
})().catch(e=>{console.error(e);process.exit(1)});
