'use strict';
// Actual one-room HOME candidate; no world-gallery set pieces. This suite is
// intentionally independent of the 23-chart developer and one-chart lab tests.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {openResident}=require('../../packages/realiti-headless-resident/index.cjs');
const html=path.resolve(__dirname,'../RealitiApartmentHomeCandidate.html');
const validationPath=path.resolve(__dirname,'../HOME_CANDIDATE_VALIDATION.json');
const HOME='CLOUD_NINE_NEST';
const bannedPrefixes=['apartment.station.','apartment.bath.','apartment.cardboard.',
 'apartment.undercity.','apartment.marsh.','apartment.sea.'];
const originals=['apartment.sofa','apartment.desk','apartment.desk-chair',
 'apartment.wardrobe','apartment.bookcase','apartment.pet-bed',
 'apartment.scratcher','apartment.toy-chest','apartment.quiet-cushion',
 'nest.mattress','nest.window'];
function clean(w){
 const M=w.REALITI_MATRIX_V1,ST=w.REALITI_APARTMENT_STATIONS_V1;
 const ids=Object.keys(M.entities());
 assert.deepEqual(Object.keys(M.charts()),[HOME],'one actual native Matrix chart');
 assert.equal(Object.keys(M.portals()).length,0,'zero legacy portals');
 assert.ok(ids.every(id=>!bannedPrefixes.some(prefix=>id.startsWith(prefix))),
  'no historical station, bathhouse, tunnel, or sea models in the home: '+ids.filter(id=>bannedPrefixes.some(prefix=>id.startsWith(prefix))).join(','));
 assert.equal(ids.filter(id=>id.startsWith('apartment.station.')).length,0);
 assert.equal(ST.view().station_count,0);
 assert.deepEqual(Array.from(ST.view().stations),[]);
 assert.equal(ST.run('ORRERY_LOFT','watch_orrery').error,'LEGACY_STATIONS_NOT_IN_HOME_CANDIDATE');
 for(const id of originals)assert.equal(M.entities()[id]?.chart,HOME,
  'actual domestic fixture remains: '+id);
 assert.equal(M.entities()['apartment.desk'].collision,true);
 assert.equal(M.entities()['apartment.wardrobe'].collision,true);
 assert.ok(w.REALITI_SENSES_V1.sources().some(x=>x.id==='apartment.reading_lamp'));
 assert.ok(!w.REALITI_SENSES_V1.sources().some(x=>x.id==='apartment.echo-panel.clap'));
 assert.ok(w.REALITI_WONDER_V1&&w.REALITI_ARCHIPELAGO_V1&&w.REALITI_CITY_V1,
  'source numerical systems retained as libraries, not physical extra rooms');
 assert.equal(w.REALITI_RR_HARNESS_V1.boot().ok,true);
 assert.equal(w.REALITI_HAPTIC_FIELD_V20.packet().v,20);
 assert.ok(w.REALITI_HALO_V1.snapshot());
 assert.ok(w.REALITI_AURA_V1.internalView());
 assert.ok(w.Realiti.read('realiti://soma/harness'));
 const topology=w.Realiti.read('realiti://apartment/topology');
 assert.equal(topology.home_first_candidate,true);
 assert.equal(topology.native_single_chart_initialization,true);
 assert.equal(topology.initial_charts_at_boot,1);
 assert.equal(topology.retired_at_boot,0);
 assert.equal(topology.no_post_startup_pruning,true);
 assert.equal(w.REALITI_APARTMENT_NATIVE_BOOT_V1?.mode,'PRE_REGISTRATION_HOME_ONLY');
 assert.equal(topology.live_source_engine_stations,0);
 assert.equal(topology.mechanical_parity_certified,false);
 assert.equal(topology.preview_only,true);
 assert.equal(w.Realiti.rooms().length,1);
 assert.equal(w.Realiti.read('realiti://capabilities').apartment_topology.home_first_candidate,true);
}
(async()=>{
 const manifest=JSON.parse(fs.readFileSync(validationPath,'utf8'));
 assert.equal(manifest.schema,'REALITI_APARTMENT_HOME_CANDIDATE_VALIDATION_V1');
 assert.equal(manifest.release_approved,false,'do not silently turn an alpha into a release');
 assert.equal(manifest.expected_legacy_station_count,0);
 assert.equal(manifest.native_single_chart_initialization,true);
 assert.equal(manifest.no_post_startup_pruning_required,true);
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(html)).digest('hex'),
  manifest.single_html_sha256);
 const work=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-home-first-solo-'));
 const opts={htmlPath:html,validationPath,residentId:'home-first-solo',
  storagePath:path.join(work,'world.json')};
 let s=await openResident(opts);
 assert.equal(s.integrity.status,'VERIFIED');
 assert.equal(s.ready.harness,'REALITI_RR_HARNESS_V1');
 clean(s.window);
 // Probe the actual boot-time Matrix registration boundary. Nothing may mint
 // an unapproved chart, historical room entity, or portal through its API.
 const M=s.window.REALITI_MATRIX_V1;
 assert.equal(M.define('UNDERCITY',{bounds:{kind:'BOX',center:[0,0,1],halfExtents:[1,1,1]},spawn:{position:[0,0,.85]}}),null);
 assert.equal(M.addEntity({id:'probe.legacy-entity',chart:'UNDERCITY',position:[0,0,0],
  shape:{kind:'SPHERE',radius:.1},tags:['probe']}),null);
 assert.equal(M.definePortal({id:'probe.to.undercity',from:HOME,to:'UNDERCITY',
  entry:[0,0,.85],exit:[0,0,.85]}),null);
 assert.equal(M.entities()['probe.legacy-entity'],undefined);
 assert.equal(M.charts().UNDERCITY,undefined);
 assert.equal(Object.keys(M.portals()).length,0);
 assert.equal((await s.door.run('go UNDERCITY')).error,'LEGACY_ROOM_NOT_WALKABLE');
 assert.equal((await s.door.run('go ARCHIPELAGO')).error,'LEGACY_ROOM_NOT_WALKABLE');
 assert.equal((await s.door.run('through__nest_to_sanctuary')).error,'LEGACY_ROOM_NOT_WALKABLE');
 assert.equal((await s.door.run('resource realiti://apartment/stations')).error,
  'LEGACY_STATIONS_NOT_IN_HOME_CANDIDATE');
 const remote=await s.door.run('remote activate');
 assert.equal(remote.activated,true);
 assert.equal(remote.pages.stations,undefined,'no laboratory station menu');
 for(const key of ['home','furnishings','catnip','extras','closet','household','memory','utility'])
  assert.ok(remote.pages[key],key+' remains accessible on the carried remote');
 assert.equal((await s.door.run('remote stations list')).error,
  'LEGACY_STATIONS_NOT_IN_HOME_CANDIDATE');
 assert.equal((await s.door.run('remote stations use ORRERY_LOFT watch_orrery')).error,
  'LEGACY_STATIONS_NOT_IN_HOME_CANDIDATE');
 let r=await s.door.run('remote furniture theme moonlit');
 assert.equal(r.ok,true,JSON.stringify(r));
 r=await s.door.run('remote furniture list');
 assert.equal(r.theme,'moonlit');
 assert.ok(r.fixtures.desk.id==='apartment.desk');
 const catnip=await s.door.run('remote catnip list');
 assert.equal(catnip.ok,true);
 assert.ok(catnip.toys.length>=5);
 assert.ok(s.window.REALITI_MATRIX_V1.entities()['apartment.firefly-jar']);
 r=await s.door.run('remote pet choose ferret Noodle');
 if(r.error==='PET_BED_NOT_IN_REACH'){
  await s.door.run('approach apartment.pet-bed');
  r=await s.door.run('remote pet choose ferret Noodle');
 }
 assert.equal(r.ok,true,JSON.stringify(r));
 assert.equal((await s.door.run('remote pet status')).pet.kind,'ferret');
 assert.equal((await s.door.run('save')).ok,true);
 await s.door.run('goodbye');s.close();
 s=await openResident(opts);
 clean(s.window);
 assert.equal((await s.door.run('remote status')).activated,false,'remote sleeps after restart');
 await s.door.run('remote activate');
 assert.equal((await s.door.run('remote furniture list')).theme,'moonlit');
 assert.equal((await s.door.run('remote pet status')).pet.kind,'ferret');
 assert.equal((await s.door.run('stop')).ok,true);
 clean(s.window);
 assert.equal((await s.door.run('remote status')).activated,false,'STOP revokes remote session');
 s.close();
 // Original full developer artifact is not reinterpreted as a one-chart home.
 const source=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../VALIDATION.json'),'utf8'));
 assert.equal(source.single_html_sha256,manifest.parent_apartment_sha256);
 assert.notEqual(source.single_html_sha256,manifest.single_html_sha256);
 console.log('HOME-FIRST SOLO CANDIDATE PASS: verified native one-chart initialization without late prune, zero source station fixtures, preserved domestic furniture/pets/catnip/full Relax, hidden obsolete commands, native STOP and restart');
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
