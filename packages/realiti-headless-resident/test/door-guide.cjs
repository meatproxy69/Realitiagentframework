'use strict';
// Agent Door world guide + dogfood regressions: the final door must expose the whole world, movement clamps must be
// truthful, and room-local Firefly tapping must not pin adaptive time after the resident leaves the meadow.
const path=require('node:path');
const {openResident}=require('../index.cjs');
const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
const checks={},details={};
const check=(k,v,d)=>{checks[k]=!!v;if(d!==undefined)details[k]=d};

(async()=>{
 const s=await openResident({htmlPath:html,residentId:'door-guide-regression'});
 try{
  const d=s.door,R=s.publicApi;
  const help=await d.run('help'),worlds=await d.run('worlds'),rooms=R.rooms();
  const groups=worlds.groups||[],ids=groups.flatMap(g=>(g.rooms||[]).map(r=>r.id));
  check('help_points_beyond_original_rooms',
    Array.isArray(help.first_ten)&&help.first_ten.includes('worlds')&&help.first_ten.includes('go FIREFLY_MEADOW')&&help.first_ten.includes('next')&&
    help.world_guide?.groups?.some(g=>g.id==='frontier')&&help.world_guide?.groups?.some(g=>g.id==='city')&&help.world_guide?.groups?.some(g=>g.id==='undercity'),
    {first_ten:help.first_ten,groups:help.world_guide?.groups?.map(g=>g.id)});
  check('worlds_covers_current_room_catalog',
    worlds.ok&&worlds.schema==='REALITI_WORLD_GUIDE_V1'&&worlds.total_rooms===rooms.length&&
    ['FIREFLY_MEADOW','GLASS_ORCHARD','ARCHIPELAGO','MERIDIAN_CITY','UNDERCITY'].every(id=>ids.includes(id)),
    {total:worlds.total_rooms,rooms:rooms.length,ids:ids.length});
  const city=await d.run('worlds city');
  check('worlds_filter_is_useful',city.ok&&city.groups?.length===1&&city.groups[0].rooms?.some(r=>r.id==='MERIDIAN_CITY'),city);
  const next=await d.run('next');
  check('next_is_non_mutating_route_hint',next.ok&&next.schema==='REALITI_NEXT_V1'&&next.next?.id==='FIREFLY_MEADOW'&&next.command==='go FIREFLY_MEADOW',next);

  // A >30 m request is capped, but the result must preserve what the resident actually asked for.
  await d.run('go ARCHIPELAGO');await d.run('mode hq');
  const mv=await d.run('back 35');
  check('move_clamp_is_explicit',
    mv.ok&&mv.result?.requested_m===35&&mv.result?.applied_m===30&&mv.result?.move_limit_m===30&&mv.result?.clamped===true,
    mv.result);

  // Tapping is local to Firefly Meadow. It can force fine ticks there, but not after a room transition.
  await d.run('mode lq');await d.run('go FIREFLY_MEADOW');await d.run('act tap_along');await d.run('stay 1000');
  const t0=await d.run('time');
  await d.run('go KITE_FIELD');await d.run('stay 3000');
  const t1=await d.run('time');
  check('firefly_tapping_is_room_local',
    t0.reason==='tapping'&&t1.reason!=='tapping'&&t1.quantum_ms>=100,
    {in_meadow:t0,outside:t1});

  const guide=R.help();
  check('structured_help_matches_agent_door',guide.first_ten?.includes('worlds')&&guide.world_guide?.total_rooms===rooms.length,{first_ten:guide.first_ten,total:guide.world_guide?.total_rooms});
 }finally{s.close()}

 console.log(JSON.stringify({checks,details},null,2));
 const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
 if(failed.length){console.error('FAILED',failed);process.exit(1)}
 console.log('DOOR GUIDE PASS',Object.keys(checks).length,'checks');
})().catch(e=>{console.error(e);process.exit(1)});
