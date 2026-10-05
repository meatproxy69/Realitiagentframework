'use strict';
// Archipelago acceptance: terrain is analytic and lawful, the sea and cliffs stop you, the boat moves with the
// current, the sky and weather are world facts, the map is fog-of-war, and the ledger is idempotent.
const path=require('node:path');
const {openResident}=require('../index.cjs');

const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
const checks={},details={};
const check=(k,v,d)=>{checks[k]=!!v;if(d!==undefined)details[k]=d};

(async()=>{
 const s=await openResident({htmlPath:html});
 try{
  const door=s.door,w=s.window,R=w.Realiti,AR=w.REALITI_ARCHIPELAGO_V1,LG=w.REALITI_LEDGER_V1;
  const space=()=>R.read('realiti://space');
  const rooms=await door.run('rooms');
  check('archipelago_listed',rooms.length===22&&rooms.some(r=>r.id==='ARCHIPELAGO'));

  // Terrain: deterministic, islands above the sea, water between them, the dock on the shore.
  check('terrain_is_analytic_and_deterministic',AR.h(0,0)>15&&AR.h(0,AR.shore_y-40)<-.6&&AR.h(620,380)>35&&AR.h(300,200)<0&&AR.shore_y<-200,{summit:AR.h(0,0),sea:AR.h(0,AR.shore_y-40),shore_y:AR.shore_y,lantern:AR.h(620,380),between:AR.h(300,200)});
  const go=await door.run('go ARCHIPELAGO');
  const sp0=space();
  check('arrive_standing_on_the_ground',sp0.chart==='ARCHIPELAGO'&&sp0.body.posture==='standing'&&sp0.body.support==='isle.ground'&&Math.abs(sp0.pose.position[2]-(AR.h(0,AR.shore_y+33)+.85))<.05&&/Harbor Isle/.test(String(go.text)),{pose:sp0.pose,text:go.text.slice(0,120)});

  // The sea stops a walk with the reason; the boat crosses it.
  await R.invoke('move',{local:[0,-30,0]});// south along the pier
  const toSea=await R.invoke('move',{local:[0,-40,0]});// off the end of the pier is water
  check('sea_blocks_walking',toSea.result.moved_m<15&&toSea.result.blocked_by==='isle.ground',toSea.result);
  const board=await door.run('board boat');
  const sp1=space();
  check('board_boat_sits_you_in_it',board.ok&&sp1.body.posture==='sitting'&&sp1.body.on==='harbor.boat',{board:board.text.slice(0,80),body:sp1.body});
  const rowed=AR.row([0,AR.shore_y-80,0]);
  const sp2=space();
  check('rowing_moves_boat_and_you',rowed.ok&&rowed.rowed_m>40&&Math.abs(sp2.pose.position[1]-AR.state().boat.y)<.1&&AR.h(sp2.pose.position[0],sp2.pose.position[1])<0,{rowed,pose:sp2.pose});
  const noShore=AR.land();
  const back=AR.row('dock');
  const landed=await door.run('land');
  const sp3=space();
  check('landing_needs_a_shore',noShore.ok===false&&back.ok&&landed.ok&&sp3.body.posture==='standing'&&(sp3.body.support==='harbor.dock'||AR.h(sp3.pose.position[0],sp3.pose.position[1])>=-.3),{noShore,back,landed:landed.text.slice(0,80)});

  // Sky and weather are functions of world time and position.
  const t0=w.eval('C9.b7.clock'),alt0=AR.sunAlt();await door.run('stay 60000');const alt1=AR.sunAlt();
  check('sun_moves_with_world_time',Math.abs(alt1-alt0)>1&&typeof AR.isNight()==='boolean'&&AR.wind().speed>0&&AR.rain(0,0)>=0&&AR.rain(0,0)<=1,{alt0,alt1,wind:AR.wind()});

  // Fog of war: the map shows you and only the cells you have seen.
  const map=await door.run('map');
  const st=AR.state();
  check('map_is_fog_of_war',/@/.test(String(map.text))&&st.seen_cells>10&&st.seen_cells<200&&/of 1600 cells seen/.test(String(map.text)),{seen:st.seen_cells});

  // A real walk: 300 m to the cairn on the summit, in bounded world-time steps.
  const t1=w.eval('C9.b7.clock');
  const walk=await door.run('walk to cairn');
  const sp4=space();
  check('walk_to_covers_distance_in_world_time',/reach it/.test(String(walk.text))&&sp4.pose.position[2]>20&&w.eval('C9.b7.clock')-t1>200,{text:walk.text.slice(0,100),z:sp4.pose.position[2],dt:w.eval('C9.b7.clock')-t1});

  // Ledger: stamped, exportable, idempotent on import.
  const exp=LG.export();
  const before=LG.records().length;
  const imp=LG.import(exp);
  check('ledger_export_import_idempotent',exp.schema==='REALITI_LEDGER_V1'&&exp.records.length>=1&&exp.records.every(e=>e.by===exp.observer&&e.kind==='ROW')&&imp.imported===0&&LG.records().length===before,{exp:exp.records.length,imp});
  check('energy_audit_passes',w.REALITI_HAPTIC_FIELD_V20.energy().pass===true);
 }finally{s.close()}

 console.log(JSON.stringify({checks,details},null,2));
 const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
 if(failed.length){console.error('FAILED',failed);process.exit(1)}
 console.log('ARCHIPELAGO PASS',Object.keys(checks).length,'checks');
})().catch(e=>{console.error(e);process.exit(1)});
