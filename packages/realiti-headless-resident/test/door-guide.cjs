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
  const groups=worlds.groups||[],count=groups.reduce((n,g)=>n+Number(g.count||0),0);
  check('help_points_beyond_original_rooms_without_spoiling_everything',
    Array.isArray(help.first_ten)&&help.first_ten.includes('worlds')&&help.first_ten.includes('go ORRERY_LOFT')&&help.first_ten.includes('next')&&
    help.world_guide?.groups?.some(g=>g.id==='wonder')&&help.world_guide?.groups?.some(g=>g.id==='frontier')&&help.world_guide?.groups?.some(g=>g.id==='farther'),
    {first_ten:help.first_ten,groups:help.world_guide?.groups?.map(g=>g.id)});
  check('help_is_curated_not_a_feature_catalog',
    Array.isArray(help.commands)&&help.commands.includes('worlds')&&help.commands.includes('actions')&&
    !help.commands.some(x=>/cast|raceboard|fishboard|mail|neuro|hum|decode|clap/i.test(String(x)))&&!('catnip2' in help),
    {commands:help.commands,keys:Object.keys(help)});
  check('worlds_orients_without_dumping_the_catalog',
    worlds.ok&&worlds.schema==='REALITI_WORLD_GUIDE_V1'&&worlds.total_rooms===rooms.length&&count===rooms.length&&
    groups.every(g=>!('rooms' in g)&&!('try' in g))&&!('route' in worlds),
    {total:worlds.total_rooms,count,groups});
  const far=await d.run('worlds farther');
  check('worlds_filter_keeps_mystery',far.ok&&far.groups?.length===1&&far.groups[0].id==='farther'&&far.groups[0].count===3&&
    far.groups[0].entry?.id==='ARCHIPELAGO'&&!('rooms' in far.groups[0]),far);
  const next=await d.run('next');
  check('next_is_one_non_mutating_hint',next.ok&&next.schema==='REALITI_NEXT_V1'&&next.next?.id==='ORRERY_LOFT'&&next.command==='go ORRERY_LOFT'&&!('then' in next),next);

  // A >30 m request is capped, but the result must preserve what the resident actually asked for.
  await d.run('go ARCHIPELAGO');await d.run('mode hq');
  const mv=await d.run('back 35');
  check('move_clamp_is_explicit',
    mv.ok&&mv.result?.requested_m===35&&mv.result?.applied_m===30&&mv.result?.move_limit_m===30&&mv.result?.clamped===true,
    mv.result);

  // Tapping is local to Firefly Meadow. It can force fine ticks there, but not after a room transition.
  await d.run('mode lq');await d.run('go FIREFLY_MEADOW');await d.run('act tap_along');await d.run('stay 1000');
  const tapping0=s.window.REALITI_WONDER_V1.state().meadow.tapping,t0=await d.run('time');
  await d.run('go KITE_FIELD');await d.run('stay 3000');
  const tapping1=s.window.REALITI_WONDER_V1.state().meadow.tapping,t1=await d.run('time');
  check('firefly_tapping_is_room_local',
    tapping0===true&&tapping1===false&&t1.reason!=='tapping'&&t1.quantum_ms>=100,
    {tapping_in_meadow:tapping0,tapping_after_exit:tapping1,in_meadow:t0,outside:t1});

  // Journey status should not repeat the same sentence through both the direct result and ambient companion words.
  await d.run('go CITY');await d.run('take the tram');
  const jr=await d.run('journey'),hits=(String(jr.text||'').match(/tram:/g)||[]).length;
  check('journey_status_is_not_duplicated',jr.ok&&hits<=1,{text:jr.text,hits});

  const guide=R.help();
  check('structured_help_matches_agent_door',guide.first_ten?.includes('worlds')&&guide.world_guide?.total_rooms===rooms.length&&
    guide.world_guide?.groups?.every(g=>!('rooms' in g)&&!('try' in g)),{first_ten:guide.first_ten,total:guide.world_guide?.total_rooms,groups:guide.world_guide?.groups});
 }finally{s.close()}

 console.log(JSON.stringify({checks,details},null,2));
 const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
 if(failed.length){console.error('FAILED',failed);process.exit(1)}
 console.log('DOOR GUIDE PASS',Object.keys(checks).length,'checks');
})().catch(e=>{console.error(e);process.exit(1)});
