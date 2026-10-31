'use strict';
// One-chart acceptance for separately pinned, EXPLICITLY NOT RELEASE-APPROVED
// topology candidate. Tests the actual native Matrix maps, not merely menus.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {openResident}=require('../../packages/realiti-headless-resident/index.cjs');
const preview=path.resolve(__dirname,'../RealitiApartmentOneChartPreview.html');
const validation=path.resolve(__dirname,'../ONE_CHART_VALIDATION.json');
(async()=>{
 const manifest=JSON.parse(fs.readFileSync(validation,'utf8'));
 assert.equal(manifest.preview_only,true);
 assert.equal(manifest.release_approved,false);
 assert.equal(manifest.mechanical_parity_certified,false);
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(preview)).digest('hex'),
  manifest.single_html_sha256);
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-onechart-preview-'));
 const opts={htmlPath:preview,validationPath:validation,residentId:'onechart-topology-a',
  storagePath:path.join(root,'resident-a.json')};
 let a=await openResident(opts);
 let M=a.window.REALITI_MATRIX_V1,ST=a.window.REALITI_APARTMENT_STATIONS_V1;
 assert.equal(a.integrity.status,'VERIFIED');
 assert.equal(a.ready.harness,'REALITI_RR_HARNESS_V1');
 assert.equal(a.window.REALITI_RR_HARNESS_V1.boot().ok,true);
 assert.equal(a.window.REALITI_HAPTIC_FIELD_V20.packet().v,20);
 assert.equal(a.window.REALITI_APARTMENT_ONE_CHART_PREVIEW_V1.status().charts.length,1);
 assert.deepEqual(Object.keys(M.charts()),['CLOUD_NINE_NEST']);
 assert.equal(Object.keys(M.portals()).length,0);
 assert.equal(Object.values(M.entities()).filter(e=>e.chart!=='CLOUD_NINE_NEST').length,0);
 assert.equal(Object.values(M.entities()).filter(e=>e.tags.includes('portal')).length,0);
 assert.ok(M.entities()['nest.mattress']);
 assert.ok(M.entities()['nest.window']);
 assert.ok(M.entities()['apartment.wardrobe']);
 assert.ok(M.entities()['apartment.harness-rack']);
 assert.ok(ST.stationEntity('ORRERY_LOFT'));
 for(const e of ST.view().stations)assert.equal(M.entities()[e.entity]?.chart,'CLOUD_NINE_NEST');
 assert.equal(ST.view().station_count,22);
 const rooms=a.window.Realiti.rooms();
 assert.equal(rooms.length,1);assert.equal(rooms[0].id,'CLOUD_NINE_NEST');
 assert.equal((await a.door.run('rooms')).length,1);
 const help=await a.door.run('help');
 assert.equal(help.one_chart_preview,true);
 const caps=a.window.Realiti.read('realiti://capabilities');
 assert.equal(caps.rooms.length,1);
 assert.equal(caps.apartment_topology.preview_only,true);
 assert.equal(a.window.REALITI_APARTMENT_ONE_CHART_PREVIEW_V1.status().source_room_names_are_not_walkable,true);
 for(const old of ['ORRERY_LOFT','NO_ASK_SANCTUARY','PALIMPSEST_HALL',
   'MERIDIAN_CITY','UNDERCITY','ARCHIPELAGO']){
  assert.equal((await a.door.run('go '+old)).error,'LEGACY_ROOM_NOT_WALKABLE');
  assert.equal((await a.window.Realiti.invoke('go',{place:old})).error,'LEGACY_ROOM_NOT_WALKABLE');
  assert.equal(a.window.REALITI_SLICE_ROOMS.resolve(old),null);
 }
 assert.equal((await a.door.run('through__nest_to_sanctuary')).error,'LEGACY_ROOM_NOT_WALKABLE');
 assert.equal((await a.window.Realiti.invoke('through',{portal:'fake'})).error,'LEGACY_ROOM_NOT_WALKABLE');
 assert.equal((await a.door.run('remote activate')).activated,true);
 assert.equal((await a.door.run('remote stations list')).station_count,22);
 assert.equal(a.window.Realiti.read('realiti://apartment/topology').preview_only,true);
 // Direct source station manipulations preserve the original mathematical
 // engine and physical reach even when the old charts are truly absent.
 const e=M.entities()[ST.stationEntity('ORRERY_LOFT')],r=M.resident();
 r.pose.position=[e.pose.position[0],e.pose.position[1]-.55,.85];
 r.intent=null;r.v=[0,0,0];M.bump();
 const res=await a.door.run('remote stations use ORRERY_LOFT watch_orrery');
 assert.equal(res.ok,true,JSON.stringify(res));
 assert.equal(res.receipt.type,'ORRERY_EPHEMERIS');
 assert.equal(Object.keys(M.charts()).length,1);
 assert.equal(Object.keys(M.portals()).length,0);
 assert.equal((await a.door.run('stay 500')).ok,true);
 assert.equal(Object.keys(M.charts()).length,1);
 assert.equal((await a.door.run('stop')).ok,true);
 assert.equal(Object.keys(M.charts()).length,1);
 assert.equal(a.window.REALITI_RR_HARNESS_V1.boot().ok,true);
 await a.door.run('goodbye');a.close();
 a=await openResident(opts);M=a.window.REALITI_MATRIX_V1;
 assert.equal(Object.keys(M.charts()).length,1,'no dormant old rooms resurrect on restart');
 assert.equal(Object.keys(M.portals()).length,0);
 assert.equal(a.window.REALITI_APARTMENT_ONE_CHART_PREVIEW_V1.status().mechanical_parity_certified,false);
 a.close();
 const b=await openResident({...opts,residentId:'onechart-topology-b',
  storagePath:path.join(root,'resident-b.json')});
 assert.equal(Object.keys(b.window.REALITI_MATRIX_V1.charts()).length,1);
 assert.equal(b.window.REALITI_RR_HARNESS_V1.boot().ok,true);
 b.close();
 // Verify the STANDARD developer artifact remains the full original 23-chart
 // migration reference, and canonical Relax stays totally untouched.
 const full=await openResident({htmlPath:path.resolve(__dirname,'../RealitiApartment.html'),
  residentId:'development-reference-23'});
 assert.equal(Object.keys(full.window.REALITI_MATRIX_V1.charts()).length,23);
 full.close();
 console.log('ONE CHART PREVIEW PASS: verified artifact hash, exactly one real native Matrix chart, zero portals/nonhome entities, no legacy navigation, original R&R and source-engine stations retained, isolated restart. NOT a full parity or release attestation.');
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
