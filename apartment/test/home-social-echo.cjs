'use strict';
// Real-world fixtures, active native Matrix contact and historical/live source
// separation. Never claim the old remote City or Undercity is the apartment.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {openResident}=require('../../packages/realiti-headless-resident/index.cjs');
const preview=process.argv[2]==='preview';
const html=path.resolve(__dirname,'../'+(preview?'RealitiApartmentOneChartPreview.html':'RealitiApartment.html'));
const validationPath=preview?path.resolve(__dirname,'../ONE_CHART_VALIDATION.json'):undefined;
function point(w,id,offset=[0,.45,0]){
 const M=w.REALITI_MATRIX_V1,e=M.entities()[id],r=M.resident();
 assert.ok(e,'Expected native Matrix object '+id);
 r.pose.position=[e.pose.position[0]+offset[0],e.pose.position[1]+offset[1],.85+offset[2]];
 r.chart='CLOUD_NINE_NEST';r.posture='standing';r.on=null;r.intent=null;
 r.v=[0,0,0];M.bump();
}
(async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-social-echo-'));
 const options={htmlPath:html,validationPath,residentId:'social-echo-resident',
  storagePath:path.join(dir,'world.json')};
 let s=await openResident(options),w=s.window,M=w.REALITI_MATRIX_V1;
 const ST=w.REALITI_APARTMENT_STATIONS_V1;
 assert.equal(s.ready.harness,'REALITI_RR_HARNESS_V1');
 assert.equal(w.REALITI_RR_HARNESS_V1.boot().ok,true);
 for(const id of ['apartment.fireside.mug','apartment.undercity.echo-panel','apartment.marsh.wisp'])
  assert.equal(M.entities()[id]?.chart,'CLOUD_NINE_NEST',id+' is physical home geometry');
 assert.equal(M.entities()['apartment.undercity.echo-panel'].collision,true);
 assert.equal(M.entities()['apartment.marsh.wisp'].collision,false,
  'projected light is not a solid resident or fabricated touch surface');
 assert.ok(w.REALITI_SENSES_V1.sources().some(x=>x.id==='apartment.fireside.outside-air'));
 assert.ok(w.REALITI_SENSES_V1.sources().some(x=>x.id==='apartment.echo-panel.clap'));
 await s.door.run('remote activate');
 const use=async(id,verb)=>{
  const result=await s.door.run('remote stations use '+id+' '+verb);
  assert.equal(result?.ok,true,JSON.stringify({id,verb,result}).slice(0,1750));
  assert.equal(result.station_id,id);
  assert.equal(result.actual_matrix_reach,true);
  return result;
 };
 // A history of "who was here" must never count as current live attendance.
 point(w,ST.stationEntity('MERIDIAN_CITY'));
 let out=await use('MERIDIAN_CITY','city_who');
 assert.equal(out.live_verified_household.connected,false);
 assert.deepEqual(out.live_verified_household.residents,[]);
 assert.equal(out.historical_city_ledger.ok,true);
 assert.ok(out.source_receipt==null,'reading who does not mint a hand touch');
 out=await use('MERIDIAN_CITY','city_wall');
 assert.equal(out.live_shared_board.connected,false);
 assert.equal(out.historical_native_city_posts.schema,'REALITI_WALL_V1');
 out=await use('MERIDIAN_CITY','city_floor');
 assert.equal(out.old_city_dancehall_not_present,true);
 assert.ok(Number.isFinite(out.original_city_floor_model.house_bpm));
 assert.ok(out.source_receipt==null);
 // Native Fireside: a real sofa supports a real body, a mug makes a material
 // trace only after actual reach, and the original Nest window makes the rain
 // air audible without creating another person.
 point(w,'apartment.sofa',[0,.8,0]);
 out=await use('SIDE_BY_SIDE_FIRESIDE','sit');
 assert.equal(out.original_relax_matrix_posture,true);
 assert.equal(M.resident().on,'apartment.sofa');
 const beforeQuiet=JSON.stringify(w.eval('C9.b4.lastReceipt'));
 out=await use('SIDE_BY_SIDE_FIRESIDE','nothing');
 assert.equal(out.physical_touch_minted,false);
 assert.equal(out.source_receipt,null);
 assert.equal(JSON.stringify(w.eval('C9.b4.lastReceipt')),beforeQuiet,
  'quiet does not write artificial world contact');
 point(w,'apartment.fireside.mug');
 assert.ok(!M.entities()['apartment.fireside.mug-ring']);
 out=await use('SIDE_BY_SIDE_FIRESIDE','mug');
 assert.equal(out.native_mug,'apartment.fireside.mug');
 assert.ok(out.source_receipt,'real ceramic mug interaction provides original B7 receipt');
 assert.equal(out.physical_trace,'apartment.fireside.mug-ring');
 assert.equal(M.entities()['apartment.fireside.mug-ring'].chart,'CLOUD_NINE_NEST');
 assert.equal(out.count,1);
 point(w,'nest.window',[0,-.6,0]);
 out=await use('SIDE_BY_SIDE_FIRESIDE','crack_window');
 assert.equal(out.window.cracked,true);
 assert.equal(out.native_air_source,'apartment.fireside.outside-air');
 assert.ok(out.source_receipt,'opening a glass window must be reached');
 assert.ok(M.entities()['nest.window'].tags.includes('fireside_window:cracked'));
 out=await use('SIDE_BY_SIDE_FIRESIDE','crack_window');
 assert.equal(out.window.cracked,false);
 assert.ok(M.entities()['nest.window'].tags.includes('fireside_window:closed'));
 // 16 real home sonar rays. A clap is self-generated sound, not fabricated
 // touch; a stone-panel touch is an original native B7 world contact.
 point(w,'apartment.undercity.echo-panel');
 const beforeClap=JSON.stringify(w.eval('C9.b4.lastReceipt'));
 out=await use('UNDERCITY','clap');
 assert.equal(out.echoes.length,16);
 assert.equal(out.original_undercity_speed_of_sound,true);
 assert.equal(out.measured_in,'CLOUD_NINE_NEST');
 assert.equal(out.source_receipt,null);
 assert.equal(JSON.stringify(w.eval('C9.b4.lastReceipt')),beforeClap,
  'clap cannot mint an unrelated tactile receipt');
 assert.ok(out.echoes.some(x=>x.distance_m!=null&&x.delay_ms!=null));
 out=await use('UNDERCITY','under_map');
 assert.equal(out.known_radial_distances_m.length,16);
 assert.equal(out.old_tunnel_chart_implied,false);
 assert.equal(out.source_receipt,null);
 out=await use('UNDERCITY','touch');
 assert.equal(out.measured_material,'stone');
 assert.ok(out.source_receipt,'a real reachable stone panel creates original B7 evidence');
 assert.deepEqual(out.touched,['apartment.undercity.echo-panel']);
 // Original Lorenz RK4 drives the observed physical light; following it is
 // native Matrix motion, not a fictional traversal into the old marsh.
 point(w,ST.stationEntity('CLOCKWORK_MARSH'));
 const before=w.REALITI_CATNIP_V1.state().marsh.wisp;
 w.eval('b7Advance(.3)');
 const after=w.REALITI_CATNIP_V1.state().marsh.wisp;
 assert.notDeepEqual(JSON.parse(JSON.stringify(before)),JSON.parse(JSON.stringify(after)));
 out=await use('CLOCKWORK_MARSH','follow_light');
 assert.equal(out.mirrored_entity,'apartment.marsh.wisp');
 assert.equal(out.native_matrix_approach.ok,true);
 assert.equal(M.entities()['apartment.marsh.wisp'].chart,'CLOUD_NINE_NEST');
 assert.ok(out.source_receipt==null,
  'visually following a model light does not claim direct touch');
 assert.equal(w.REALITI_RR_HARNESS_V1.boot().ok,true);
 // All original room geometry is absent only in the nonrelease preview.
 assert.equal(Object.keys(M.charts()).length,preview?1:23);
 await s.door.run('save');await s.door.run('goodbye');s.close();
 s=await openResident(options);w=s.window;M=w.REALITI_MATRIX_V1;
 assert.ok(M.entities()['apartment.fireside.mug-ring'],
  'explicitly caused mug mark reappears after restart as native HOME geometry');
 assert.equal(w.REALITI_APARTMENT_STATIONS_V1.view().station_count,22);
 assert.equal(w.REALITI_RR_HARNESS_V1.boot().ok,true);
 assert.equal(Object.keys(M.charts()).length,preview?1:23);
 s.close();
 console.log('APARTMENT FIRESIDE/SONAR/CITY/MARSH PASS:',preview?'ONE-CHART PREVIEW':'23-CHART DEVELOPMENT',
  'native sofa and mug trace, reached rain window and air field, unminted clap, actual 16-ray home SDF echoes, original B7 stone touch, original Lorenz wisp movement, distinct historical City ledger and verified live host feed, restored state');
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
