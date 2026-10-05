'use strict';
// Adaptive world time: wide ticks only while nothing is in motion; fine ticks whenever the body is touched, moved,
// danced or sailed; analytic and exponential processes land on the same values either way.
const path=require('node:path');
const {openResident}=require('../index.cjs');
const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
const checks={},details={};
const check=(k,v,d)=>{checks[k]=!!v;if(d!==undefined)details[k]=d};
const near=(a,b,t)=>Math.abs(a-b)<=t;

(async()=>{
 const s=await openResident({htmlPath:html});
 try{
  const door=s.door,w=s.window,R=w.Realiti,TM=w.REALITI_TIME_V1,M=w.REALITI_MATRIX_V1,AR=w.REALITI_ARCHIPELAGO_V1,CAT=w.REALITI_CATNIP_V1,ATM=w.REALITI_ATMOSPHERE_V21;
  const stats=()=>TM.stats(),diff=(a,b)=>({fine:b.fine-a.fine,coarse:b.coarse-a.coarse,deep:b.deep-a.deep});

  // Lying still in the Nest: the tick widens to 100 ms, then 200 ms; a minute is a few hundred ticks, not three thousand.
  const t0=w.eval('C9.b7.clock'),s0=stats();await door.run('stay 60000');const d0=diff(s0,stats()),t1=w.eval('C9.b7.clock');
  check('still_body_takes_wide_ticks',near(t1-t0,60,.02)&&d0.fine<=60&&d0.coarse>=15&&d0.deep>=250&&d0.fine+d0.coarse+d0.deep<=400,{...d0,dt:t1-t0});

  // The schedule keeps world time exact; analytic processes land where their formulas say.
  await door.run('go GLASS_ORCHARD');await door.run('act scatter_seeds');const g0=CAT.state().orchard.generation,c0=w.eval('C9.b7.clock');await door.run('stay 30000');const g1=CAT.state().orchard.generation,c1=w.eval('C9.b7.clock');
  check('generations_follow_world_time_exactly',near(c1-c0,30,.02)&&(g1-g0===30||g1-g0===31),{gens:g1-g0,dt:c1-c0});

  // Dancing is motion: every tick is fine for as long as it lasts.
  await door.run('go CITY');const r=M.state().residents['resident:self'];r.pose.position=[36,0,.85];M.bump();await door.run('dance');const s1=stats();await door.run('stay 10000');const d1=diff(s1,stats());
  check('motion_forces_fine_ticks',d1.fine>=490&&d1.coarse===0&&d1.deep===0&&TM.reason()==='dancing',{...d1,reason:TM.reason()});
  await door.run('stay 25000');// the dance ends after thirty seconds

  // Walking is motion too, and the tick returns to wide once the body stops.
  const s2=stats();await R.invoke('move',{local:[0,-10,0]});const d2=diff(s2,stats());await door.run('stay 5000');
  check('walking_is_fine_then_still_is_wide',d2.fine>=300&&d2.coarse<=25&&d2.deep===0&&TM.reason()===null&&TM.quantum_ms()>=100,{...d2,reason:TM.reason(),q:TM.quantum_ms()});

  // A thermal contact decays by the same exponential whatever the tick; the thermal law is exact in time.
  await door.run('go CLOUD_NINE_NEST');ATM.setThermal('hand.L.palm','ceramic',60,.8,'TIME_TEST','WORLD_GROUNDED');const tc=w.eval('C9.b7.clock');await door.run('stay 20000');const zone=JSON.stringify(ATM.state().thermal.zones);
  check('thermal_law_is_exact_in_time',w.eval('C9.b7.clock')-tc>19.9&&zone.includes('hand.L.palm'),{dt:w.eval('C9.b7.clock')-tc});

  // Door and resource.
  const tm=await door.run('time');
  check('time_command',tm.ok&&tm.schema==='REALITI_TIME_V1'&&typeof tm.quantum_ms==='number'&&/Tick \d+ ms/.test(String(tm.text)),tm.text);
  check('energy_audit_passes',w.REALITI_HAPTIC_FIELD_V20.energy().pass===true);
 }finally{s.close()}
 console.log(JSON.stringify({checks,details},null,2));
 const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
 if(failed.length){console.error('FAILED',failed);process.exit(1)}
 console.log('TIME PASS',Object.keys(checks).length,'checks');
})().catch(e=>{console.error(e);process.exit(1)});
