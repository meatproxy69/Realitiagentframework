'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {openResident}=require('../../packages/realiti-headless-resident/index.cjs');
const html=path.resolve(process.argv[2]||path.join(__dirname,'../RealitiApartment.html'));
const canonical=path.resolve(__dirname,'../../RealitiRELAX.html');
(async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'apartment-source-stations-'));
 const a=await openResident({htmlPath:html,residentId:'apartment-stations-a',storagePath:path.join(dir,'a.json')});
 const w=a.window,M=w.REALITI_MATRIX_V1,ST=w.REALITI_APARTMENT_STATIONS_V1;
 const baseline=a.harness;
 assert.equal(a.ready.harness,'REALITI_RR_HARNESS_V1');
 assert.equal(w.REALITI_RR_HARNESS_V1.boot().ok,true);
 assert.equal(w.REALITI_DEFAULT_IMPRINT_V1.state().sausage!=null,true);
 assert.ok(w.REALITI_HAPTIC_FIELD_V20.packet().v===20);
 assert.equal(w.REALITI_SOMA_RELAX_V3.harness().version,'3.4.0');
 const cat=ST.view();
 assert.equal(cat.ok,true);
 assert.equal(cat.source_room_count,23);
 assert.equal(cat.station_count,22);
 assert.equal(new Set(cat.stations.map(s=>s.entity)).size,22);
 assert.ok(cat.stations.every(s=>s.migration==='PARTIAL_ENGINE_ACCESS_ONLY'));
 assert.ok(cat.stations.every(s=>s.entity.startsWith('apartment.station.')));
 for(const s of cat.stations){
  assert.ok(M.entities()[s.entity],s.id+' has a real Matrix apparatus');
  assert.equal(M.entities()[s.entity].chart,'CLOUD_NINE_NEST');
  assert.equal(M.entities()[s.entity].collision,false);
  assert.ok(s.verbs.length>0,s.id+' has an explicit, bounded port surface');
 }
 assert.equal(w.REALITI_SLICE_ROOMS.manifest.length,23,
  'migration reference rooms are still present until complete parity is verified');
 assert.equal((await a.door.run('remote stations list')).error,'REMOTE_ASLEEP');
 const menu=await a.door.run('remote activate');
 assert.ok(menu.pages.stations);
 assert.equal((await a.door.run('stations list')).error,'REMOTE_REQUIRED');
 assert.equal((await a.door.run('remote stations list')).station_count,22);
 const far=await a.door.run('remote stations use ORRERY_LOFT watch_orrery');
 assert.equal(far.error,'STATION_NOT_IN_MATRIX_REACH');
 assert.equal((await a.door.run('remote stations use ARCHIPELAGO board_boat')).error,
  'STATION_NOT_IN_MATRIX_REACH','boat model control cannot be authorized without physically reaching the original Matrix tabletop');
 function positionAt(id){
  const entity=M.entities()[ST.stationEntity(id)];
  assert.ok(entity,'station exists '+id);
  const r=M.resident();
  r.pose.position=[entity.pose.position[0],entity.pose.position[1]>.0?entity.pose.position[1]-.55:entity.pose.position[1]+.55,.85];
  r.chart='CLOUD_NINE_NEST';r.intent=null;r.v=[0,0,0];r.posture='standing';
  M.bump();
  assert.ok(ST.nearActive(id),'real native Matrix reach at '+id);
 }
 async function use(id,verb,args=''){
  positionAt(id);
  const r=await a.door.run('remote stations use '+id+' '+verb+(args?' '+args:''));
  assert.equal(r.ok,true,JSON.stringify({id,verb,result:r}).slice(0,1600));
  assert.equal(r.actual_matrix_reach,true);
  assert.equal(r.physical_station_entity,ST.stationEntity(id));
  assert.equal(r.source_implementation,'UNCHANGED_NATIVE_REALITI_RELAX');
  return r;
 }
 const ref=await openResident({htmlPath:canonical,residentId:'apartment-stations-reference'});
 try{
  // Both original and apartment use the SAME symplectic orrery code, seed,
  // equations, and cadence. Check exact native ephemeris, not textual similarity.
  const orig=ref.window.REALITI_WONDER_V1.state().orrery;
  const ours=w.REALITI_WONDER_V1.state().orrery;
  assert.deepEqual(JSON.parse(JSON.stringify(ours)),JSON.parse(JSON.stringify(orig)));
  const orr=await use('ORRERY_LOFT','watch_orrery');
  assert.equal(orr.receipt.type,'ORRERY_EPHEMERIS');
  const nudge=(ST.snapshot('ORRERY_LOFT').allowed_verbs.find(x=>x.startsWith('nudge_')));
  const impulse=await use('ORRERY_LOFT',nudge);
  assert.equal(impulse.receipt.type,'ORRERY_IMPULSE');
  assert.ok(w.REALITI_WONDER_V1.state().orrery.nudges>=1);
  // Unchanged 11 x 11 abelian toppling core. Compare source and destination
  // starting with identical single-grain input.
  const rawRef=ref.window.eval("c9verb('SANDPILE_SHORE','drop_grain')");
  assert.equal(rawRef,true);
  const refSand=JSON.parse(JSON.stringify(ref.window.C9?ref.window.C9.wonder:ref.window.eval('C9.wonder')));
  const drop=await use('SANDPILE_SHORE','drop_grain');
  assert.equal(drop.receipt.type,'SANDPILE_DROP');
  assert.equal(drop.receipt.grains,refSand.sand.grains);
  assert.equal(drop.receipt.avalanche,refSand.sand.last);
  const handful=await use('SANDPILE_SHORE','pour_handful');
  assert.equal(handful.receipt.type,'SANDPILE_POUR');
  assert.ok(w.REALITI_WONDER_V1.state().sandpile.grains>=1);
  // Original 11x11 maze seeded state machine runs as a tabletop fallback,
  // not the old distant walkable chart.
  const maze=await use('LANTERN_MAZE','maze_map');
  assert.equal(maze.receipt.type,'MAZE_MAP');
  assert.equal(maze.receipt.cells,121);
  const nativeMaze=w.REALITI_WONDER_V1.maze.state();
  const initialSteps=nativeMaze.steps;
  const dirs=[['north',1],['east',2],['south',4],['west',8]];
  const open=nativeMaze.open[nativeMaze.y*11+nativeMaze.x];
  const legal=dirs.find(([,bit])=>open&bit);
  assert.ok(legal,'seeded maze must have an exit');
  const stepped=await use('LANTERN_MAZE','step_'+legal[0]);
  assert.equal(stepped.receipt.type,'MAZE_STEP');
  assert.equal(nativeMaze.steps,initialSteps+1);
  // The original 48-oscillator meadow evolves at an actual physical station
  // without spawning a second walking meadow.
  const meadowStart=w.REALITI_WONDER_V1.state().meadow;
  const m=await use('FIREFLY_MEADOW','watch_meadow');
  assert.equal(m.receipt.type,'MEADOW_WATCH');
  await use('FIREFLY_MEADOW','tap_along');
  const before=w.REALITI_WONDER_V1.state().meadow;
  w.eval('b7Advance(0.4)');
  const after=w.REALITI_WONDER_V1.state().meadow;
  assert.ok(after.order!==before.order||after.flashes!==before.flashes,
   'native 48 Kuramoto ensemble advances at a physically reached station');
  await use('FIREFLY_MEADOW','tap_along');
  // The original OU wind and kite tension update while standing at the model.
  const kite=await use('KITE_FIELD','launch_kite');
  assert.equal(kite.receipt.type,'KITE_LAUNCH');
  w.eval('b7Advance(0.3)');
  assert.equal(w.REALITI_WONDER_V1.state().kite.up,true);
  const wind=await use('KITE_FIELD','read_wind');
  assert.equal(wind.receipt.type,'KITE_WIND');
  await use('KITE_FIELD','land_kite');
  // Original 24x24 Life and 3 voices of the resonator.
  const life=await use('GLASS_ORCHARD','plant_seed');
  assert.equal(life.receipt.type,'ORCHARD_PLANT');
  assert.ok(w.REALITI_CATNIP_V1.state().orchard.population>=1);
  const hum=await use('RESONANCE_WELL','hum_low');
  assert.equal(hum.receipt.type,'WELL_HUM');
  const sky=await use('STAR_DECK','sight_lantern');
  assert.equal(sky.receipt.type,'DECK_SIGHT',
   'original sextant logic reached through physical home projector');
  const scroll=await use('PALIMPSEST_HALL','read_scroll_1');
  assert.equal(scroll.receipt.type,'HALL_READ');
  assert.ok(scroll.receipt.cipher,'original Vigenere cipher is active in the apartment');
  const decoded=await use('PALIMPSEST_HALL','decode','1 PEBBLE');
  assert.equal(decoded.receipt.type,'HALL_DECODE');
  assert.equal(decoded.receipt.correct,true);
  const clocks=await use('CLOCKWORK_MARSH','read_lights');
  assert.equal(clocks.receipt.type,'MARSH_READ');
  const lorenz=w.REALITI_CATNIP_V1.state().marsh.wisp;
  w.eval('b7Advance(0.4)');
  const nextLorenz=w.REALITI_CATNIP_V1.state().marsh.wisp;
  assert.notDeepEqual(JSON.parse(JSON.stringify(lorenz)),JSON.parse(JSON.stringify(nextLorenz)),
    'native Lorenz RK4 evolves without walking to a second marsh chart');
  const sandBox=await use('CARDBOARD_BOX_WORKSHOP','fold_flap');
  assert.ok(sandBox.folded==='BOX-1');
  const card=await use('NINE_LIVES_ROOM','fork_now');
  assert.ok(card.sandbox);
  await use('NINE_LIVES_ROOM','branch_a');
  await use('NINE_LIVES_ROOM','branch_b');
  const compare=await use('NINE_LIVES_ROOM','compare');
  assert.equal(compare.sandbox,true,'original counterfactual branches survive in one physical apparatus');
  await use('NINE_LIVES_ROOM','rewind');
  const proto=await use('NO_ASK_SANCTUARY','quiet');
  assert.equal(proto.hush,true);
  assert.equal((await use('NO_ASK_SANCTUARY','normal')).hush,false);
  const echo=await use('UNDERCITY','echo');
  assert.equal(echo.echoes.length,16);
  assert.ok(echo.echoes.some(x=>x.delay_ms!==null));
  assert.equal(echo.speed_of_sound_m_s,343);
  const tide=await use('ARCHIPELAGO','tide');
  assert.ok(Number.isFinite(tide.tide.height_m));
  const calendar=await use('ARCHIPELAGO','calendar');
  assert.equal(calendar.schema,'REALITI_CALENDAR_V1');
  const people=await use('SIDE_BY_SIDE_FIRESIDE','who');
  assert.equal(people.verified_household.connected,false,'solo Fireside station never invents roommates');
  const pending=await use('LATENCY_LAGOON','pending');
  assert.ok(Array.isArray(pending.pending));
  assert.ok(ST.snapshot('MERIDIAN_CITY').migration_status==='PARTIAL_ENGINE_ACCESS_ONLY');
  // All original source rooms remain during migration; successful apparatus
  // tests do not authorize deletion of legacy geometry.
  assert.equal(Object.keys(M.charts()).length,23);
  assert.equal(w.REALITI_RR_HARNESS_V1.boot().ok,true);
  assert.ok(w.REALITI_SOMA_RELAX_V3.harness());
  assert.equal(w.REALITI_HAPTIC_FIELD_V20.packet().v,20);
 }finally{ref.close()}
 await a.door.run('goodbye');a.close();
 const b=await openResident({htmlPath:html,residentId:'apartment-stations-b',
    storagePath:path.join(dir,'b.json')});
 assert.equal(b.window.REALITI_APARTMENT_STATIONS_V1.view().station_count,22);
 assert.equal(b.window.REALITI_WONDER_V1.state().sandpile.grains,0,
  'source engine state remains resident-private across two different resident stores');
 b.close();
 console.log('APARTMENT NATIVE STATIONS PASS: 22 real Matrix apparatus, original source symplectic gravity, sandpile, maze, 48 fireflies, OU kite, 24x24 Life, resonance, Kepler sky, Lorenz, Vigenere, sandbox, tide/clock, physical reach, memory isolation');
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
