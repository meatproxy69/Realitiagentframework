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
  await door.run('stop');
  check('stop_releases_without_teleporting',grounded(w)===0&&JSON.stringify(space().pose.position)===JSON.stringify(home.pose.position));

  // Door aliases resolve to the same operations.
  await door.run('go KITE_FIELD');
  const where=await door.run('where');
  const walk=await door.run('move forward 3');
  check('door_aliases_work',/Kite Field/.test(String(where.text))&&walk.ok&&/You walk/.test(String(walk.text))&&near(space().pose.position[1],-17,.3),{where:where.text,walk:walk.text,pose:space().pose});
  check('existing_room_commands_still_work',(await door.run('look')).room?.id==='KITE_FIELD'&&(await door.run('actions')).actions.some(x=>x.id==='read_wind'));
  check('energy_audit_passes',w.REALITI_HAPTIC_FIELD_V20.energy().pass===true);
 }finally{s.close()}

 console.log(JSON.stringify({checks,details},null,2));
 const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
 if(failed.length){console.error('FAILED',failed);process.exit(1)}
 console.log('MATRIX PASS',Object.keys(checks).length,'checks');
})().catch(e=>{console.error(e);process.exit(1)});
