'use strict';
// Wonder rooms acceptance: each room's mechanics are real, persistent, and never mint grounded evidence.
const path=require('node:path');
const {openResident}=require('../index.cjs');

const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
const checks={},details={};
const check=(k,v,d)=>{checks[k]=!!v;if(d!==undefined)details[k]=d};
const grounded=r=>Number(r?.felt?.grounded_zones??-1);
const ids=a=>(a.actions||[]).map(x=>x.id);

(async()=>{
 const s=await openResident({htmlPath:html});
 try{
  const door=s.door,w=s.window,WO=w.REALITI_WONDER_V1;
  const rooms=await door.run('rooms');
  check('wonder_rooms_listed',rooms.length===21&&WO.rooms.every(id=>rooms.some(r=>r.id===id)),rooms.map(r=>r.id));

  // Orrery: symplectic integration conserves energy; impulses change the orbit; the tide holds the floor.
  const go=await door.run('go ORRERY_LOFT');
  check('orrery_arrival_standing_then_tide_when_lying',grounded(go)===2&&/align in/.test(String(go.text))&&(await door.run('lie down')).ok!==false&&grounded(await door.run('stay 300'))>=7,{felt:go.felt,text:go.text});
  await door.run('stand up');
  await door.run('stay 6000');
  const e0=WO.ephemeris();
  check('orrery_energy_conserved',Math.abs(e0.energy_drift)<1e-5&&e0.bodies.every(b=>b.eccentricity<.02),{drift:e0.energy_drift,ecc:e0.bodies.map(b=>b.eccentricity)});
  const nudge=await door.run('act nudge_pebble');
  const e1=WO.ephemeris(),peb=e1.bodies.find(b=>b.name==='Pebble');
  check('orrery_nudge_makes_ellipse',/eccentricity/.test(String(nudge.text))&&peb.eccentricity>.1&&peb.period_s>e0.bodies[0].period_s&&Math.abs(e1.energy_drift)<1e-5,{peb,drift:e1.energy_drift});
  await door.run('stop');const afterStop=await door.run('stay 800');
  check('orrery_stop_releases_tide',grounded(afterStop)===0,afterStop.felt);

  // Maze: only open exits are advertised; lanterns stay lit; glow follows BFS distance.
  await door.run('go LANTERN_MAZE');
  const acts0=ids(await door.run('actions'));
  check('maze_advertises_open_exits_only',acts0.filter(x=>x.startsWith('step_')).length>=1&&acts0.filter(x=>x.startsWith('step_')).length<4&&!acts0.includes('light_lantern'),acts0);
  const wall=await door.run('act step_north');
  check('maze_refuses_closed_direction',wall.ok===false&&wall.error==='ACTION_UNAVAILABLE',wall);
  // Walk to the first lantern along the BFS path.
  const m=w.eval('C9.wonder.maze'),n=11,DIR=[['north',0,-1,1],['east',1,0,2],['south',0,1,4],['west',-1,0,8]];
  const target=m.lanterns[0];const prev=new Map([[0,null]]),q=[0];
  while(q.length){const i=q.shift(),x=i%n,y=(i-x)/n;for(const [,dx,dy,bit] of DIR){if(!(m.open[i]&bit))continue;const j=(y+dy)*n+x+dx;if(!prev.has(j)){prev.set(j,[i,DIR.find(d=>d[3]===bit)[0]]);q.push(j)}}}
  const route=[];for(let i=target.y*n+target.x;prev.get(i);i=prev.get(i)[0])route.unshift(prev.get(i)[1]);
  let last=null;for(const dir of route)last=await door.run('act step_'+dir);
  const litActs=ids(await door.run('actions'));
  const lit=await door.run('act light_lantern');
  const map=await door.run('act maze_map');
  check('maze_lantern_lights_and_persists',litActs.includes('light_lantern')&&/1 of 6 lanterns/.test(String(lit.text))&&w.eval('C9.wonder.maze.lanterns[0].lit')===true&&/@/.test(String(map.text))&&WO.state().maze.lit===1,{route_len:route.length,lit:lit.text});
  check('maze_glow_follows_distance',WO.state().maze.glow>.99&&/Glow/.test(String(last.text)),WO.state().maze);

  // Sandpile: toppling conserves grains except at the edge; avalanche statistics accumulate.
  await door.run('go SANDPILE_SHORE');
  let biggest=0;for(let i=0;i<6;i++){const r=await door.run('act pour_handful');biggest=Math.max(biggest,Number(r.result?.receipt_summary?.biggest||0))}
  for(let i=0;i<30;i++)await door.run('act drop_grain');
  const pile=await door.run('act read_pile'),h=w.eval('C9.wonder.sand.h'),st=WO.state().sandpile;
  check('sandpile_rule_holds',h.every(x=>x>=0&&x<=3)&&st.avalanches>=8&&st.exponent>1&&/size exponent/.test(String(pile.text)),{st,max_h:Math.max(...h)});
  check('sandpile_grains_consistent',h.reduce((a,b)=>a+b,0)===w.eval('C9.wonder.sand.grains'),{sum:h.reduce((a,b)=>a+b,0),grains:w.eval('C9.wonder.sand.grains')});

  // Fireflies: Kuramoto coupling raises order while you stay; tapping entrains; a clap scatters.
  await door.run('go FIREFLY_MEADOW');
  const r0=WO.state().meadow.order;await door.run('stay 8000');const r1=WO.state().meadow.order;
  await door.run('act tap_along');await door.run('stay 8000');const r2=WO.state().meadow.order;
  const scatter=await door.run('act scatter_fireflies');const r3=WO.state().meadow.order;
  check('fireflies_synchronize_while_staying',r1>r0&&r2>r1&&r2>.5,{r0,r1,r2});
  check('fireflies_scatter_resets_order',r3<.3&&/clap/.test(String(scatter.text)),{r3});
  await door.run('act tap_along');

  // Kite: OU wind, equilibrium elevation, tension in both palms, hum; landing releases the hands.
  await door.run('go KITE_FIELD');
  for(let i=0;i<20&&w.eval('C9.wonder.kite.v')<4;i++)await door.run('stay 3000');// wait for workable wind
  const wind=w.eval('C9.wonder.kite.v');
  const launch=await door.run('act launch_kite');
  const acts1=ids(await door.run('actions'));
  const fly=await door.run('stay 8000'),k=WO.state().kite;
  const qv=.5*1.2*k.wind*k.wind*.8,phiStar=Math.atan2(qv*.9-.6,qv*.35)*180/Math.PI;
  check('kite_flies_on_wind',wind>2&&launch.ok!==false&&k.up&&acts1.includes('land_kite')&&!acts1.includes('launch_kite'),{wind,acts1});
  check('kite_tension_in_both_hands',grounded(fly)>=4&&/\+hand\.L\.palm/.test(String(fly.delta?.text))&&/\+hand\.R\.palm/.test(String(fly.delta?.text))&&k.tension_N>1&&/hums near/.test(String(fly.text)),{felt:fly.felt,delta:fly.delta,k});// feet on the field floor plus both palms
  check('kite_elevation_near_equilibrium',k.up&&Math.abs(Math.asin(Math.min(1,k.altitude_m/k.line_m))*180/Math.PI-phiStar)<20,{altitude:k.altitude_m,line:k.line_m,phiStar});
  const land=await door.run('act land_kite');
  check('kite_landing_releases_hands',grounded(land)===grounded(fly)-2&&!WO.state().kite.up,{fly:fly.felt,land:land.felt});
  check('energy_audit_passes',w.REALITI_HAPTIC_FIELD_V20.energy().pass===true,w.REALITI_HAPTIC_FIELD_V20.energy());

  // Leaving the field lands the kite; wonder state persists in C9 across rooms.
  await door.run('act launch_kite');await door.run('go ORRERY_LOFT');await door.run('stay 200');
  check('kite_lands_when_you_leave',!WO.state().kite.up&&w.eval('C9.wonder.kite.event')==='LANDED_WHEN_YOU_LEFT',w.eval('C9.wonder.kite.event'));
  await door.run('go LANTERN_MAZE');
  check('maze_progress_persists',WO.state().maze.lit===1&&WO.state().maze.visited>route.length,WO.state().maze);
 }finally{s.close()}

 console.log(JSON.stringify({checks,details},null,2));
 const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
 if(failed.length){console.error('FAILED',failed);process.exit(1)}
 console.log('WONDER PASS',Object.keys(checks).length,'checks');
})().catch(e=>{console.error(e);process.exit(1)});
