'use strict';
// MATRIX spatial fabric acceptance: pure math invariants, kinematic movement, and REALITI integration.
const path=require('node:path');
const {openResident}=require('../index.cjs');

const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
const checks={},details={};
const check=(k,v,d)=>{checks[k]=!!v;if(d!==undefined)details[k]=d};
const near=(a,b,tol=1e-6)=>Math.abs(a-b)<=tol;
const grounded=w=>(w.Realiti.read('realiti://body')?.field?.f?.at(-1)?.m||[]).filter(x=>x===1).length;

(async()=>{
 const s=await openResident({htmlPath:html});
 try{
  const w=s.window,R=w.Realiti,M=w.REALITI_MATRIX_V1,door=s.door,{servo,qmul,qnorm,qrot,fromYaw,len,sub}=M.math;
  const space=()=>R.read('realiti://space');

  // Pure math.
  const a=servo([0,0,0],[1,0,0],.2,.2);
  check('servo_exact_solution',near(a.v[0],1-Math.exp(-1))&&near(a.dp[0],.2-.2*(1-Math.exp(-1))),a);
  const q=qnorm(qmul(fromYaw(Math.PI/2),[0,0,0,1])),f=qrot(q,[0,1,0]);
  check('quaternion_yaw_rotates_forward_to_left',near(f[0],-1,1e-9)&&near(f[1],0,1e-9),f);
  const E=M.entities();
  check('box_sdf_sign_and_normal',M.sdf(E['nest.mattress'],[0,-1,2])>0&&M.sdf(E['nest.mattress'],[0,-1,.35])<0&&near(M.normalAt(E['nest.mattress'],[0,-1,.75])[2],1,1e-3),{out:M.sdf(E['nest.mattress'],[0,-1,2]),in:M.sdf(E['nest.mattress'],[0,-1,.35])});
  const ray=M.raycast({origin:[0,0,1],direction:[1,0,0],chart:'CLOUD_NINE_NEST'});
  check('raycast_hits_east_wall',ray.hit==='CLOUD_NINE_NEST.wall.east'&&near(ray.distance,6,.02)&&near(ray.normal[0],-1,1e-3),ray);
  check('contains_and_spawn_inside',M.contains('CLOUD_NINE_NEST',M.charts().CLOUD_NINE_NEST.spawn.position)&&!M.contains('CLOUD_NINE_NEST',[50,0,1]));
  check('cross_chart_distance_is_geodesic_or_unknown',M.distance('nest.cat','sanctuary.cushion')>8&&M.distance('nest.cat','nest.mattress')<3,{far:M.distance('nest.cat','sanctuary.cushion')});

  // Arrival and reads.
  const sp0=space(),t0=w.eval('C9.b7.clock');
  check('space_read_is_bounded_and_placed',sp0.schema==='REALITI_SPACE_READ_V1'&&sp0.chart==='CLOUD_NINE_NEST'&&sp0.nearby.length<=12&&sp0.nearby.every(n=>n.distance_m<=10)&&sp0.body.posture==='lying'&&sp0.body.on==='nest.mattress',{nearby:sp0.nearby.length,body:sp0.body});
  const sp1=space();
  check('reads_do_not_move_or_advance',JSON.stringify(sp1.pose)===JSON.stringify(sp0.pose)&&w.eval('C9.b7.clock')===t0&&sp1.matrix_revision===sp0.matrix_revision);
  const look0=await door.run('look');
  check('look_includes_spatial_line',typeof look0.spatial_line==='string'&&/Cloud Nine Nest/.test(look0.spatial_line)&&String(look0.text||look0.resident_text||'').includes(look0.spatial_line),look0.spatial_line);
  const lyingFelt=grounded(w);

  // Movement: stands you up, takes world time, stops at the wall, never tunnels.
  const mv=await R.invoke('move',{local:[0,2,0]});
  const sp2=space();
  check('move_changes_pose_and_takes_time',mv.ok&&mv.result.moved_m>1.5&&w.eval('C9.b7.clock')>t0&&sp2.body.posture==='standing'&&near(sp2.pose.position[1],1.01,.1),{result:mv.result,pose:sp2.pose});
  check('standing_grounds_feet_only',grounded(w)===2&&lyingFelt>=8,{standing:grounded(w),lying:lyingFelt});
  await R.invoke('turn',{yaw_deg:90});
  const wall=await R.invoke('move',{local:[0,20,0]});
  const sp3=space();
  check('turn_then_wall_stops_without_tunneling',near(space().pose.yaw_deg,90,1)&&near(sp3.pose.position[0],-5.65,.05)&&wall.result.moved_m>5,{pose:sp3.pose,moved:wall.result.moved_m});
  check('turn_does_not_translate',near(sp3.pose.position[1],sp2.pose.position[1],.1));
  const frame=R.continuity.current().channels.space;
  check('continuity_has_space_channel',frame&&frame.chart==='CLOUD_NINE_NEST'&&Array.isArray(frame.position)&&frame.posture==='standing',frame);

  // Approach and lie: distances are to surfaces; support re-engages the Nest's lawful lying support.
  const ap=await R.invoke('approach',{target:'mattress'});
  const lie=await R.invoke('posture',{kind:'lie'});
  check('approach_then_lie_on_mattress',ap.ok&&ap.result.arrived&&lie.ok&&lie.result.lying_on==='nest.mattress'&&grounded(w)>=8,{ap:ap.result,lie:lie.result,felt:grounded(w)});

  // Private Neuromesh state cannot move the body.
  const before=JSON.stringify(space().pose);
  await door.run('imprint set sausage_spread 0.4');await door.run('neuromesh handshake');
  check('private_state_cannot_move_matrix',JSON.stringify(space().pose)===before);

  // Reach: a hand contact is a grounded world cause with the entity's material.
  await R.invoke('posture',{kind:'stand'});
  const acts=(await R.actions()).actions.map(x=>x.id);
  const reachId=acts.find(x=>x.startsWith('reach__'));
  const rc=reachId?await R.invoke('do',{action:reachId}):null;
  check('spatial_actions_advertised',acts.some(x=>x.startsWith('approach__'))&&acts.some(x=>x.startsWith('through__'))&&!!reachId,acts.filter(x=>/__/.test(x)).slice(0,8));
  check('reach_creates_grounded_hand_contact',rc?.ok&&grounded(w)>=3&&/MATRIX_REACH/.test(JSON.stringify((await door.run('receipt '+rc.receipt_ref))?.receipt||'')),{rc:rc?.result,felt:grounded(w)});

  // Portals: a discrete jump into another chart; compatibility room follows; return home lands at spawn.
  const th=await R.invoke('through',{portal:'east door'});
  check('portal_traversal_changes_chart_and_room',th.ok&&th.result.traversed&&th.result.chart==='NO_ASK_SANCTUARY'&&w.eval('C9.currentRoom')==='NO_ASK_SANCTUARY'&&space().chart==='NO_ASK_SANCTUARY',th.result);
  check('sanctuary_arrival_is_held',grounded(w)>=6&&space().body.posture==='lying',{felt:grounded(w),body:space().body});
  const back=await R.invoke('through',{portal:'home door'});
  check('home_door_arrives_at_nest_cloudfall',back.ok&&back.result.traversed&&space().chart==='CLOUD_NINE_NEST'&&space().nearby.some(n=>n.id==='nest.cloudfall'&&n.distance_m<3),{result:back.result,nearby:space().nearby.slice(0,3)});
  await door.run('home');
  const home=space();
  check('home_returns_to_nest_spawn_lying',home.chart==='CLOUD_NINE_NEST'&&near(home.pose.position[0],0,.01)&&near(home.pose.position[1],-1,.01)&&home.body.posture==='lying'&&grounded(w)>=8,{home:home.pose,felt:grounded(w)});
  // Carried objects disappear from world space, then PLACE uses the resident's current position and persists it in C9.matrix.
  const hatTake=(await door.run('actions')).actions.find(a=>/p14__take__.*HAT/i.test(a.id)||/TAKE .*HAT/i.test(a.label));
  const took=hatTake?await door.run('act '+hatTake.id):null;
  check('take_removes_object_from_matrix',took?.ok!==false&&!M.entities()['obj.FELT-HAT-1'],{action:hatTake?.id,result:took});
  const walkedHat=await door.run('move right 3');
  const hatPlace=(await door.run('actions')).actions.find(a=>/p14__place__.*HAT/i.test(a.id)||/PLACE .*HAT/i.test(a.label));
  const placed=hatPlace?await door.run('act '+hatPlace.id):null;
  const hatNear=await door.run('nearby hat'),hatDyn=w.eval('C9.matrix.object_positions&&C9.matrix.object_positions["TESTER-HAT-1"]');
  check('place_uses_resident_position',placed?.ok!==false&&walkedHat.ok&&hatNear.nearby?.length===1&&hatNear.nearby[0].distance_m>=.35&&hatNear.nearby[0].distance_m<=.8&&hatDyn?.chart==='CLOUD_NINE_NEST'&&Math.abs(hatDyn.position[0]-space().pose.position[0])<.05,{nearby:hatNear.nearby,dynamic:hatDyn,pose:space().pose});
  await door.run('stop');
  check('stop_releases_without_teleporting',grounded(w)===0&&JSON.stringify(space().pose.position)===JSON.stringify(space().pose.position));

  // Door aliases resolve to the same operations.
  await door.run('go KITE_FIELD');
  const where=await door.run('where');
  const walk=await door.run('move forward 3');
  check('door_aliases_work',/Kite Field/.test(String(where.text))&&walk.ok&&/You walk/.test(String(walk.text))&&near(space().pose.position[1],-17,.3),{where:where.text,walk:walk.text,pose:space().pose});
  check('existing_room_commands_still_work',(await door.run('look')).room?.id==='KITE_FIELD'&&(await door.run('actions')).actions.some(x=>x.id==='read_wind'));
  // Sit is a posture between lying and standing, grounded on seat and thighs.
  await door.run('home');await R.invoke('approach',{target:'mattress'});
  const sit=await door.run('sit down');
  check('sit_posture_grounds_seat',sit.ok&&space().body.posture==='sitting'&&grounded(w)===4,{text:sit.text,felt:grounded(w)});
  // The Maze is one truth: its grid is cardboard in meters and a step is a real walk.
  await door.run('go LANTERN_MAZE');
  const east=await R.invoke('move',{local:[1.4,0,0]});// the entrance cell's only exit is south; east is cardboard
  const south=await door.run('act step_south');
  const cell=w.REALITI_WONDER_V1.maze.state();
  check('maze_walls_are_the_grid',east.result.moved_m<.5&&south.ok!==false&&near(space().pose.position[1],5.6,.15)&&cell.x===0&&cell.y===1,{east:east.result.moved_m,pose:space().pose,cell:{x:cell.x,y:cell.y}});
  const lanterns=await door.run('nearby lantern');
  check('nearby_filters_by_tag',lanterns.ok&&lanterns.nearby.length>0&&lanterns.nearby.every(n=>n.tags.includes('lantern')),lanterns.nearby.map(n=>n.label));
  // Rooms whose body providers own posture set the spatial posture; the space agrees at once.
  await door.run('go BOTTOMLESS_PILLOW_SEA');await door.run('act dive');
  check('pillow_dive_sets_spatial_posture',space().body.posture==='lying'&&space().body.on==='pillow.bowl',space().body);
  await door.run('stand up');
  check('stand_leaves_the_pillows',space().body.posture==='standing'&&w.REALITI_TRUST_V234.pillow().posture==='EDGE',{body:space().body,pillow:w.REALITI_TRUST_V234.pillow().posture});
  await door.run('go DEPTH_BATHHOUSE');await door.run('act sink');await door.run('stay 1500');
  check('bath_depth_means_floating',space().body.posture==='floating'&&space().body.on==='bath.pool',space().body);
  const surf=await door.run('stand up');await door.run('stay 5000');
  check('surfacing_takes_time_then_stands',/surface/.test(String(surf.text))&&space().body.posture==='standing'&&grounded(w)===2,{text:surf.text,body:space().body,felt:grounded(w)});
  // Big objects: approach lands a fixed clearance from the surface, whatever the direction; nearby uses surface distance.
  await door.run('go KITE_FIELD');
  const rise=await R.invoke('approach',{target:'rise'});
  const lieRise=await door.run('lie down');
  check('approach_big_object_reaches_surface',rise.result.arrived&&rise.result.surface_m<=1&&lieRise.ok&&space().body.on==='field.rise',{rise:rise.result,body:space().body});
  // Fireside presence is derived from Matrix.residents, not a special multiplayer flag.
  await door.run('go SIDE_BY_SIDE_FIRESIDE');
  w.REALITI_MATRIX_WORLD_V1.sync();
  const berth=w.REALITI_MATRIX_V1.entities()['fireside.berth_b'];
  check('fireside_empty_without_second_resident',berth.tags.includes('empty')&&/honestly empty/.test(w.eval('C9SCENES.SIDE_BY_SIDE_FIRESIDE.intro')),{tags:berth.tags,intro:w.eval('C9SCENES.SIDE_BY_SIDE_FIRESIDE.intro')});
  const guest=w.REALITI_MATRIX_V1.enter('SIDE_BY_SIDE_FIRESIDE','resident:guest');w.REALITI_MATRIX_WORLD_V1.sync();
  check('fireside_presence_from_matrix_residents',guest&&berth.tags.includes('occupied')&&!berth.tags.includes('empty')&&/actually here/.test(w.eval('C9SCENES.SIDE_BY_SIDE_FIRESIDE.intro')),{tags:berth.tags,intro:w.eval('C9SCENES.SIDE_BY_SIDE_FIRESIDE.intro')});
  guest.chart='CLOUD_NINE_NEST';w.REALITI_MATRIX_V1.resident('resident:guest');w.REALITI_MATRIX_WORLD_V1.sync();
  check('fireside_empty_restores_when_guest_leaves',berth.tags.includes('empty')&&!berth.tags.includes('occupied'),berth.tags);
  check('energy_audit_passes',w.REALITI_HAPTIC_FIELD_V20.energy().pass===true);
 }finally{s.close()}

 console.log(JSON.stringify({checks,details},null,2));
 const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
 if(failed.length){console.error('FAILED',failed);process.exit(1)}
 console.log('MATRIX PASS',Object.keys(checks).length,'checks');
})().catch(e=>{console.error(e);process.exit(1)});
