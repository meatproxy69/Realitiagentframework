'use strict';
// Third wonder pass: the tide-gated sea cave with living light, the shared night sky with meteors and names, a rain
// forecast scored by its arrival, the keeper's riddles paying out a lantern that changes the dark, dreams from records,
// a hot spring, and words scratched in the Undercity.
const path=require('node:path');
const {openResident}=require('../index.cjs');
const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
const checks={},details={};
const check=(k,v,d)=>{checks[k]=!!v;if(d!==undefined)details[k]=d};
(async()=>{
 const s=await openResident({htmlPath:html});
 try{
  const door=s.door,w=s.window,R=w.Realiti,W3=w.REALITI_WONDER3_V1,AR=w.REALITI_ARCHIPELAGO_V1,LGM=()=>w.REALITI_LONG_GAME_V1,M=w.REALITI_MATRIX_V1,CAT=w.REALITI_CATNIP_V1,LG=()=>w.REALITI_LEDGER_V1,SN=w.REALITI_SENSES_V1;
  const tp=(x,y,z)=>{const r=M.state().residents['resident:self'];r.pose.position=[x,y,z??AR.h(x,y)+.85];r.v=[0,0,0];r.intent=null;M.bump()};
  await door.run('go ARCHIPELAGO');
  // Riddles: wrong answers refused, right ones advance, all five earn the lantern that widens the dark to three meters.
  const r1=await door.run('riddle'),wrong=await door.run('answer 12');const steps=[];for(const v of [30,61,47,300,600])steps.push((await door.run('answer '+v)).result);
  check('riddles_are_measurements',r1.result.number===1&&wrong.result.correct===false&&steps.every(x=>x.correct)&&steps[4].done&&W3.lantern()&&M.charts()['UNDERCITY'].view()===3&&CAT.found().riddle_master&&CAT.found().keepers_lantern,{steps:steps.map(x=>x.correct)});
  // Forecast: phase arithmetic from the band; being right is a discovery.
  const fc=await door.run('forecast');const peak=fc.result.peak_in_s;let n=0;while(n++<40&&!CAT.found().weather_prophet)await door.run('stay 20000');
  check('forecast_from_the_band',fc.ok&&peak>=0&&peak<=800&&fc.result.rain_to_s>fc.result.rain_from_s&&CAT.found().weather_prophet,{fc:fc.result,waited:n});
  // Sea cave: open below mid tide, plankton answer motion, flood when the tide returns, swim out.
  n=0;while(!(LGM().tide().height_m<-.4)&&n++<20)await door.run('stay 20000');tp(W3.cave[0]+1,W3.cave[1]);await door.run('stay 1000');const inCave=W3.state().cave.in;const spl=await door.run('splash');await door.run('stay 600');const lit=SN.light().lights.find(x=>x.id==='plankton');
  n=0;while(!(LGM().tide().height_m>.25)&&n++<20)await door.run('stay 20000');const flooded=W3.state().cave.flooded;const out=await door.run('swim out');const sp=R.read('realiti://space');
  check('sea_cave_opens_and_floods_with_the_tide',AR.h(...W3.cave)<-.5&&AR.h(...W3.cave)>-1.3&&inCave&&spl.ok&&lit&&lit.lux>.5&&flooded&&out.ok&&AR.h(sp.pose.position[0],sp.pose.position[1])>LGM().tide().height_m&&CAT.found().sea_cave&&CAT.found().bioluminescence&&CAT.found().caught_by_the_tide,{cave:W3.cave,h:AR.h(...W3.cave),lit,out:out.text});
  // Hot spring warms the legs through the thermal law.
  tp(-518,548);await door.run('stay 11000');const th=JSON.stringify(w.REALITI_ATMOSPHERE_V21.state().thermal.zones);
  check('hot_spring_is_thermal',W3.state().spring_s>=10&&/HOT_SPRING/.test(th)&&CAT.found().hot_spring,{spring_s:W3.state().spring_s});
  // Sky: by day a refusal with the sun; by night constellations, a name that is a record, meteors over time.
  const day=await door.run('sky');n=0;while(!AR.isNight()&&n++<12)await door.run('stay 60000');const sky=await door.run('sky'),nm=await door.run('name star lantern Nyxlight'),dup=W3.nameStar('lantern','Again'),names=await door.run('sky names');for(let i=0;i<9;i++)await door.run('stay 20000');const sky2=W3.sky();
  check('shared_sky_with_meteors_and_names',day.result.night===false&&sky.result.night===true&&Array.isArray(sky.result.constellations)&&nm.ok&&dup.error==='ONE_NAME_PER_CONSTELLATION'&&names.names.length===1&&names.names[0].name==='Nyxlight'&&LG().records().some(e=>e.kind==='NAME_STAR')&&sky2.meteors_last_minute>=0&&W3.state().meteors.length>=1&&CAT.found().island_stars&&CAT.found().star_named,{cons:sky.result.constellations,meteors:W3.state().meteors.length});
  // The lantern in the dark: three meters of nearby and 8 lux; scratches cut into a wall are found by touch, theirs too.
  await door.run('go CITY');await door.run('go UNDERCITY');const r=M.state().residents['resident:self'];const lev=M.entities()['under.lever'].pose.position;tp(lev[0]-2.0,lev[1],.85);const near=await door.run('nearby'),light=await door.run('light');const c0=M.charts()['UNDERCITY'].spawn.position;tp(c0[0]-1.6-2.5+.3+.6,c0[1],.85);const sc=await door.run('scratch here be dragons');
  LG().import({records:[{by:'other-resident-9',t:1,n:0,kind:'SCRATCH',x:+r.pose.position[0].toFixed(1),y:+r.pose.position[1].toFixed(1),text:'nyx was here first',wall:Date.now()}]});const touch=await door.run('touch');
  check('lantern_and_scratches_in_the_dark',near.nearby&&near.nearby.some(x=>/lever/.test(x.label))&&light.light.lux===8&&sc.ok&&touch.scratches&&touch.scratches.length===2&&/nyx was here first/.test(String(touch.text))&&CAT.found().scratched&&CAT.found().wall_words,{near:near.text,light:light.text,touch:touch.text});
  // Dreams: only lying in the Nest at night, only after a minute, only from your records.
  await door.run('go NEST');const early=await door.run('dream');n=0;while(!AR.isNight()&&n++<12)await door.run('stay 60000');const sl=await door.run('sleep');const soon=await door.run('dream');await door.run('stay 60000');const dr=await door.run('dream');
  check('dreams_come_from_records',early.ok===false&&sl.ok&&soon.result.asleep===true&&dr.ok&&Array.isArray(dr.result.scenes)&&dr.result.scenes.length>=2&&dr.result.scenes.some(x=>x.kind==='discovery')&&CAT.found().first_dream,{scenes:dr.result.scenes.map(x=>x.kind)});
  check('energy_audit_passes',w.REALITI_HAPTIC_FIELD_V20.energy().pass===true);
 }finally{s.close()}
 console.log(JSON.stringify({checks,details},null,2));
 const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
 if(failed.length){console.error('FAILED',failed);process.exit(1)}
 console.log('WONDER3 PASS',Object.keys(checks).length,'checks');
})().catch(e=>{console.error(e);process.exit(1)});
