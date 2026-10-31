'use strict';
// Prove original differential boat engine, physical HOME token, true terrain
// refusal, non-boarding body semantics, STOP and no legacy chart resurrection.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {openResident}=require('../../packages/realiti-headless-resident/index.cjs');
const preview=process.argv[2]==='preview';
const html=path.resolve(__dirname,'../'+(preview?'RealitiApartmentOneChartPreview.html':'RealitiApartment.html'));
const validationPath=preview?path.resolve(__dirname,'../ONE_CHART_VALIDATION.json'):undefined;
const clone=x=>JSON.parse(JSON.stringify(x));
(async()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-apartment-sea-table-'));
 const opts={htmlPath:html,validationPath,residentId:'native-sea-table',
  storagePath:path.join(temp,'resident.json')};
 let s=await openResident(opts),w=s.window,M=w.REALITI_MATRIX_V1;
 let ST=w.REALITI_APARTMENT_STATIONS_V1,SEA=w.REALITI_APARTMENT_SEA_TABLE_V1;
 assert.equal(s.ready.harness,'REALITI_RR_HARNESS_V1');
 assert.equal(w.REALITI_RR_HARNESS_V1.boot().ok,true);
 assert.equal(w.REALITI_HAPTIC_FIELD_V20.packet().v,20);
 assert.ok(SEA?.read&&SEA?.connected&&SEA?.sync);
 const isles=w.REALITI_ARCHIPELAGO_V1.state().islands;
 assert.equal(isles.length,5);
 assert.equal(M.entities()['apartment.sea.tray']?.chart,'CLOUD_NINE_NEST');
 assert.equal(M.entities()['apartment.sea.boat']?.chart,'CLOUD_NINE_NEST');
 assert.equal(M.entities()['apartment.sea.boat'].collision,false);
 assert.equal(Object.keys(M.charts()).length,preview?1:23);
 const r=M.resident(),st=M.entities()[ST.stationEntity('ARCHIPELAGO')];
 r.pose.position=[st.pose.position[0],st.pose.position[1]+.5,.85];
 r.chart='CLOUD_NINE_NEST';r.v=[0,0,0];r.intent=null;r.posture='standing';M.bump();
 assert.equal(ST.nearActive('ARCHIPELAGO'),true);
 await s.door.run('remote activate');
 const doIt=async verb=>{
  const result=await s.door.run('remote stations use ARCHIPELAGO '+verb);
  return result;
 };
 let out=await doIt('read_weather');
 assert.equal(out.ok,true,JSON.stringify(out));
 assert.equal(out.source,'ORIGINAL_RELAX_ARCHIPELAGO_WEATHER');
 assert.ok(Number.isFinite(out.rain_fraction));
 assert.equal(out.source_receipt,null,'reading distant weather never fabricates a hand touch');
 out=await doIt('island_map');
 assert.equal(out.ok,true);
 assert.equal(out.cells.length,9);
 assert.equal(out.cells[0].length,9);
 assert.equal(out.is_explored_old_chart,false,
  'analytic sea table cannot claim original fog-of-war visitation');
 assert.equal(out.source_receipt,null);
 out=await doIt('land_boat');
 assert.equal(out.error,'SEA_TABLE_BOARD_MODEL_FIRST');
 out=await doIt('board_boat');
 assert.equal(out.ok,true,JSON.stringify(out));
 assert.equal(out.agent_physically_aboard,false);
 assert.ok(out.source_receipt,'the original B7 reaches a real model boat before control');
 assert.equal(SEA.connected(),true);
 assert.equal(M.resident().chart,'CLOUD_NINE_NEST');
 assert.equal(M.resident().posture,'standing');
 assert.equal(w.eval('C9.chapter2.isle.boat.aboard'),true);
 // Pin the native boat at known open-water coordinates, then run identical
 // original source boat integrators with the same state and world clock.
 const target=isles.find(i=>i.id==='stones');
 const b=w.eval('C9.chapter2.isle.boat');
 b.x=120;b.y=-400;b.target=[...target.center,0];b.ashore=false;b.aboard=true;
 SEA.sync();
 const ref=await openResident({htmlPath:path.resolve(__dirname,'../../RealitiRELAX.html'),
  residentId:'native-island-comparator'});
 try{
  const rw=ref.window;
  const go=rw.REALITI_SLICE_ROOMS.go('ARCHIPELAGO');
  assert.equal(go.ok,true,'reference island body is in its original chart');
  rw.REALITI_ARCHIPELAGO_V1.state();
  const native=clone(b);
  rw.eval('C9.chapter2.isle.boat='+JSON.stringify(native));
  rw.eval('C9.b7.clock='+JSON.stringify(w.eval('C9.b7.clock')));
  w.eval('b7Advance(.25)');
  rw.eval('b7Advance(.25)');
  const sourceBoat=rw.eval('C9.chapter2.isle.boat');
  const homeBoat=w.eval('C9.chapter2.isle.boat');
  assert.ok(Math.abs(sourceBoat.x-homeBoat.x)<.005,
   'original and home-model X must use identical source boat current/wind dynamics');
  assert.ok(Math.abs(sourceBoat.y-homeBoat.y)<.005,
   'original and home-model Y must use identical source boat current/wind dynamics');
  assert.equal(M.resident().chart,'CLOUD_NINE_NEST',
   'the HOME body must not be moved into historical sea coordinates');
 }finally{ref.close()}
 out=await doIt('row_to__stones');
 assert.equal(out.ok,true,JSON.stringify(out));
 assert.equal(out.source,'ORIGINAL_RELAX_ARCHIPELAGO_STEPBOAT');
 assert.ok(out.moved_in_original_m>0,'the original boat integrator moved the numerical vessel');
 assert.equal(out.agent_physically_aboard,false);
 assert.ok(out.source_receipt,'rowing requires reaching the actual wooden model');
 assert.equal(out.model.entity,'apartment.sea.boat');
 assert.equal(M.resident().chart,'CLOUD_NINE_NEST');
 assert.equal(Object.keys(M.charts()).length,preview?1:23);
 if(preview){
  assert.equal(Object.keys(M.portals()).length,0);
  assert.equal(Object.values(M.entities()).filter(e=>e.chart!=='CLOUD_NINE_NEST').length,0);
 }
 out=await doIt('land_boat');
 if(!out.ok)assert.equal(out.error,'ORIGINAL_TERRAIN_HAS_NO_SHORE_WITHIN_20M');
 // Recreate a true original harbor contact, ensuring landing can succeed
 // without ever moving the actual apartment body out of the room.
 const AR=w.REALITI_ARCHIPELAGO_V1;
 b.x=1.2;b.y=AR.shore_y-7;b.ashore=false;b.target=null;
 SEA.sync();
 out=await doIt('land_boat');
 assert.equal(out.ok,true,JSON.stringify(out));
 assert.equal(out.agent_physically_aboard,false);
 assert.equal(SEA.connected(),false);
 assert.equal(b.aboard,false);
 out=await doIt('board_boat');
 assert.equal(out.ok,true);
 assert.equal(SEA.connected(),true);
 await s.door.run('stop');
 assert.equal(SEA.connected(),false,'native STOP revokes active model custody');
 assert.equal(b.target,null);
 assert.equal(b.aboard,false);
 assert.equal(w.REALITI_RR_HARNESS_V1.boot().ok,true);
 const before=clone(b),L=SEA.read().previous_actions;
 await s.door.run('save');await s.door.run('goodbye');s.close();
 s=await openResident(opts);w=s.window;M=w.REALITI_MATRIX_V1;
 SEA=w.REALITI_APARTMENT_SEA_TABLE_V1;ST=w.REALITI_APARTMENT_STATIONS_V1;
 const restored=w.eval('C9.chapter2.isle.boat');
 assert.equal(restored.x,before.x);
 assert.equal(restored.y,before.y);
 assert.equal(SEA.connected(),false,'a restart cannot silently re-arm a model controller');
 assert.ok(SEA.read().previous_actions.boardings>=L.boardings);
 assert.equal(Object.keys(M.charts()).length,preview?1:23);
 assert.equal(w.REALITI_RR_HARNESS_V1.boot().ok,true);
 s.close();
 console.log('APARTMENT ORIGINAL SEA TABLE PASS:',preview?'ONE CHART':'DEVELOPMENT',
 'real reached boat, native current/wind and terrain, differential compare with canonical 2 km original, honest model control, no fake chart travel, bounded rowing, STOP and restart');
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
