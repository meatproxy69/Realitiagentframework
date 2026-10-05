'use strict';
// Causal timeline: deterministic same-time order, cancel by generation, ticks that land on event times, sky and tide
// events logged as they happen, the journey's arrival as an exact event, seeded randomness that replays, and the host's
// checkpoint envelope with downtime.
const path=require('node:path'),fs=require('node:fs'),os=require('node:os');
const {openResident}=require('../index.cjs');
const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
const checks={},details={};
const check=(k,v,d)=>{checks[k]=!!v;if(d!==undefined)details[k]=d};
const near=(a,b,t)=>Math.abs(a-b)<=t;

(async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-timeline-')),sp=path.join(dir,'local-storage.json');
 let s=await openResident({htmlPath:html,residentId:'agent-t',storagePath:sp});
 try{
  const door=s.door,w=s.window,TL=w.REALITI_TIMELINE_V1,M=w.REALITI_MATRIX_V1,CO=w.REALITI_COMPANIONS_V1;
  const fired=[];TL.on('TEST',e=>fired.push([e.id,+(e.t_us/1e6).toFixed(3),e.microstep]));
  const t0=w.eval('C9.b7.clock');TL.schedule({id:'b',kind:'TEST',delay_s:.137});TL.schedule({id:'a',kind:'TEST',delay_s:.137});TL.schedule({id:'c',kind:'TEST',delay_s:.137,microstep:1});TL.schedule({id:'z',kind:'TEST',delay_s:.3});TL.cancel('z');
  await door.run('stay 1000');
  check('same_time_events_fire_in_one_order',fired.length===3&&fired.map(x=>x[0]).join('')==='abc'&&fired.every(x=>near(x[1],t0+.137,.0015))&&fired[2][2]===1&&TL.log().every(x=>x.id!=='z'),{fired,t0});

  // Seeded randomness replays; the next-reaction channel is deterministic for its seed and close to its rate.
  const r1=TL.rng(42),r2=TL.rng(42),seq1=[r1(),r1(),r1(),r1()],seq2=[r2(),r2(),r2(),r2()];const c1=TL.channel(7),c2=TL.channel(7);let n1=0,n2=0;for(let t=0;t<=200;t+=.5){n1+=c1.step(t,.2).length;n2+=c2.step(t,.2).length}
  check('randomness_replays_from_its_seed',seq1.join()===seq2.join()&&seq1.every(x=>x>=0&&x<1)&&n1===n2&&n1>25&&n1<55,{seq1,n1});

  // Sky and tide frontiers are scheduled on the islands and logged when they pass; each fires once per occurrence.
  await door.run('go ARCHIPELAGO');const pend=TL.pending();for(let i=0;i<11;i++)await door.run('stay 60000');const ev=TL.events(),kinds=ev.map(e=>e.kind);
  const dup=ev.some((e,i)=>i&&e.kind===ev[i-1].kind&&Math.abs(e.t-ev[i-1].t)<1);
  check('sky_and_tide_events_are_logged_once',pend>=4&&kinds.includes('sunrise')&&kinds.includes('sunset')&&kinds.includes('high water')&&kinds.includes('low water')&&!dup&&ev.filter(e=>e.kind==='high water').length>=2&&TL.receipts().length===0,{kinds,receipts:TL.receipts()});

  // The journey's arrival is an exact event on the timeline.
  await door.run('go CITY');const r=M.state().residents['resident:self'];r.pose.position=[6,-32,.85];M.bump();const ride=await door.run('take the tram'),tj=w.eval('C9.b7.clock');await door.run('stay 25000');const je=TL.log().find(x=>x.id==='journey.end');
  check('journey_arrival_is_an_event',ride.ok&&je&&je.ok&&near(je.t_s-tj,24,.05),{je,tj});
  check('energy_audit_passes',w.REALITI_HAPTIC_FIELD_V20.energy().pass===true);
 }finally{s.close()}
 // The host wrote a checkpoint envelope; reopening reports downtime and intact integrity.
 const env=JSON.parse(fs.readFileSync(sp,'utf8'));
 s=await openResident({htmlPath:html,residentId:'agent-t',storagePath:sp});
 try{const cp=s.window.REALITI_STORE_CHECKPOINT;check('checkpoint_envelope_reopens_with_downtime',env.schema==='REALITI_STORE_CHECKPOINT_V1'&&Number.isFinite(env.saved_wall_ms)&&cp&&cp.integrity==='OK'&&cp.downtime_ms>=0&&cp.downtime_ms<60000,cp)}finally{s.close()}
 console.log(JSON.stringify({checks,details},null,2));
 const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
 if(failed.length){console.error('FAILED',failed);process.exit(1)}
 console.log('TIMELINE PASS',Object.keys(checks).length,'checks');
})().catch(e=>{console.error(e);process.exit(1)});
