'use strict';
// The Undercity: no light; echoes by ray cast with the right delays; nothing listed beyond reach; dead reckoning for
// where; water, lever, gate, vault and the far ladder found by touch and by following the senses; the grate refuses the tall.
const path=require('node:path');
const {openResident}=require('../index.cjs');
const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
const checks={},details={};
const check=(k,v,d)=>{checks[k]=!!v;if(d!==undefined)details[k]=d};

(async()=>{
 const s=await openResident({htmlPath:html});
 try{
  const door=s.door,w=s.window,R=w.Realiti,U=w.REALITI_UNDERCITY_V1,M=w.REALITI_MATRIX_V1,CAT=w.REALITI_CATNIP_V1,SN=w.REALITI_SENSES_V1;
  const tp=(x,y)=>{const r=M.state().residents['resident:self'];r.pose.position=[x,y,.85];r.v=[0,0,0];r.intent=null;M.bump()};
  const rooms=await door.run('rooms');
  check('undercity_listed',rooms.length===23&&rooms.some(r=>r.id==='UNDERCITY'));

  // Dark: the look has no coordinates and zero lux; where is dead reckoning; nothing is listed beyond reach.
  const go=await door.run('go UNDERCITY'),look=await door.run('look'),where=await door.run('where'),nb=await door.run('nearby'),lt=SN.light();
  check('dark_means_dark',/^Dark\./.test(String(go.text).slice(0,5))&&look.dark===true&&look.lux===0&&!/\(\s*-?\d/.test(String(look.text))&&where.dark===true&&where.reckoning.distance_m===0&&/By your own steps/.test(String(where.text))&&nb.dark===true&&/Nothing in reach/.test(String(nb.text))&&lt.lux===0&&lt.sky==='dark',{look:look.text,where:where.text,nb:nb.text});

  // Echoes: sixteen directions, delays 2d/343, the map grows with what the echoes found.
  const clap=await door.run('clap'),e=clap.result.echoes,hit=e.filter(x=>x.distance_m!=null);
  check('clap_returns_ray_cast_echoes',e.length===16&&hit.length>=12&&hit.every(x=>Math.abs(x.delay_ms-2000*x.distance_m/343)<=1.1)&&hit.some(x=>x.distance_m>8)&&clap.result.rt60_s===1.6&&U.map().cells_known>=2&&U.map().walls_found>=10&&CAT.found().first_echo,{hits:hit.length,longest:clap.result.longest,map:U.map().cells_known});

  // Movement reports distance, never coordinates; the kernel still sweeps against the maze walls.
  const mv=await door.run('move forward 30'),wh=await door.run('where');
  check('moving_blind_is_dead_reckoning',mv.dark===true&&/^You walk [\d.]+ m/.test(String(mv.text))&&!/\(-?\d+\.\d, -?\d/.test(String(mv.text).split('Dark.')[0])&&mv.result.moved_m<8&&wh.reckoning.distance_m>0,{mv:mv.text,moved:mv.result.moved_m});

  // Senses lead: fresh air at the grate, dripping water and wet stone toward the cistern.
  const sm0=SN.smell();const cis=M.entities()['under.cistern'].pose.position;tp(cis[0]-1.6,cis[1]);const sn=SN.sound(),sm=SN.smell(),touch=await door.run('touch');
  check('senses_lead_through_the_dark',sm0.smells.some(x=>x.id==='grate_air')&&sn.sources.some(x=>x.id==='drip'&&x.level_dB>30)&&sm.smells[0].id==='drip'&&/still water/.test(String(touch.text))&&CAT.found().cistern,{sm0:sm0.smells.map(x=>x.id),sn:sn.sources.map(x=>[x.id,x.level_dB]),touch:touch.text});

  // Lever opens the gate; the vault wall reads by touch; the far ladder surfaces into daylight north-west of the plaza.
  const lev=M.entities()['under.lever'].pose.position;tp(lev[0]-.8,lev[1]);const gateBefore=M.entities()['under.gate'].collision,pull=await door.run('pull lever'),gateAfter=M.entities()['under.gate'].collision;
  const vw=M.entities()['under.vault_wall'].pose.position;tp(vw[0]-.7,vw[1]);const far=U.readWall(),readWall=await door.run('read wall');
  const P=M.portals()['undercity.far.to.meridian_city'];tp(P.entry[0]-1,P.entry[1]);const up=await door.run('go through second ladder');const sp=R.read('realiti://space');
  check('lever_gate_vault_and_far_ladder',gateBefore===true&&pull.ok&&gateAfter===false&&/SECOND LADDER/.test(String(readWall.text))&&up.ok&&sp.chart==='MERIDIAN_CITY'&&Math.hypot(sp.pose.position[0]+30,sp.pose.position[1]-58)<2&&CAT.found().lever_pulled&&CAT.found().vault_read&&CAT.found().surfaced,{pose:sp.pose.position});

  // The grate is geometry: a giant does not fit and stays in the city, standing on the ground.
  await door.run('avatar size giant');const refused=await door.run('go UNDERCITY');const sp2=R.read('realiti://space');await door.run('avatar size normal');const sp3=R.read('realiti://space');
  check('grate_refuses_the_tall',refused.ok===false&&refused.error==='TOO_TALL_FOR_THE_GRATE'&&sp2.chart==='MERIDIAN_CITY'&&Math.abs(sp2.pose.position[2]-1.53)<.05&&Math.abs(sp3.pose.position[2]-.85)<.05,{refused:refused.text,z2:sp2.pose.position[2],z3:sp3.pose.position[2]});
  check('energy_audit_passes',w.REALITI_HAPTIC_FIELD_V20.energy().pass===true);
 }finally{s.close()}
 console.log(JSON.stringify({checks,details},null,2));
 const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
 if(failed.length){console.error('FAILED',failed);process.exit(1)}
 console.log('UNDERCITY PASS',Object.keys(checks).length,'checks');
})().catch(e=>{console.error(e);process.exit(1)});
