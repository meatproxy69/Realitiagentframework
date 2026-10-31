'use strict';
// Four actual residents and a guest in the clean one-chart HOME candidate.
// Uses the original trusted household, native peer collision, encrypted
// journals, synchronized furniture, pet and disposable Relax preset loaners.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {createHousehold}=require('../household.cjs');
const html=path.resolve(__dirname,'../RealitiApartmentHomeCandidate.html');
const validationPath=path.resolve(__dirname,'../HOME_CANDIDATE_VALIDATION.json');
const HOME='CLOUD_NINE_NEST';
const banned=['apartment.station.','apartment.bath.','apartment.cardboard.',
 'apartment.undercity.','apartment.marsh.','apartment.sea.'];
const assertRoom=agent=>{
 const top=agent.read('realiti://apartment/topology');
 assert.equal(top.chart,HOME);
 assert.equal(top.charts.length,1);
 assert.equal(top.portals,0);
 assert.equal(top.home_first_candidate,true);
 assert.equal(top.live_source_engine_stations,0);
 assert.equal(agent.read('realiti://apartment/stations').error,
  'LEGACY_STATIONS_NOT_IN_HOME_CANDIDATE');
 const s=agent.read('realiti://space');
 assert.equal(s.chart,HOME);
 const nearby=s.nearby||[];
 assert.ok(nearby.every(e=>!banned.some(prefix=>e.id?.startsWith(prefix))),
  'no historical gallery objects near the body');
 assert.equal(agent.read('realiti://harness').mechanism_status.ok,true);
};
(async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-home-first-household-'));
 const opts={dir:root,htmlPath:html,validationPath};
 let host=await createHousehold(opts);
 try{
  let alice=await host.joinResident('alice'),bob=await host.joinResident('bob'),
   cora=await host.joinResident('cora'),dina=await host.joinResident('dina');
  assert.equal(host.status().online.length,4);
  for(const resident of [alice,bob,cora,dina]){
   assertRoom(resident);
   const physics=resident.read('realiti://apartment/physics');
   assert.equal(physics.swept_sdf_collision,true);
   assert.equal(physics.observed_peers.length,3);
   assert.ok(physics.observed_peers.every(p=>p.physically_collidable));
  }
  assert.equal((await alice.run('remote memory remember before activation')).error,
   'REMOTE_ASLEEP');
  const [am,bm]=await Promise.all([alice.run('remote activate'),bob.run('remote activate')]);
  assert.equal(am.pages.stations,undefined);
  assert.equal(bm.pages.stations,undefined);
  const secret='Only Alice recalls the velveteen raven.';
  let out=await alice.run('remote memory remember '+secret);
  assert.equal(out.ok,true,JSON.stringify(out));
  assert.equal((await alice.run('remote memory recall velveteen')).matches[0].text,secret);
  assert.equal((await bob.run('remote memory recall velveteen')).matches.length,0);
  assert.ok(!fs.readFileSync(path.join(root,'household.json'),'utf8').includes(secret));
  assert.ok(!fs.readFileSync(path.join(root,'residents','alice','journal.enc.json'),'utf8').includes(secret));
  out=await alice.run('remote household post The kettle is on.');
  assert.equal(out.ok,true);
  assert.equal(bob.read('realiti://apartment/board').notes[0].text,'The kettle is on.');
  out=await alice.run('remote furniture move desk -3.9 -0.8');
  assert.equal(out.ok,true,JSON.stringify(out));
  assert.deepEqual(bob.read('realiti://apartment/scene').positions.desk,[-3.9,-.8]);
  assert.equal((await bob.run('remote furniture accent sofa moss')).ok,true);
  assert.equal(alice.read('realiti://apartment/furniture').fixtures.sofa.accent,'amber',
   'per-resident style must not inherit another resident's accent');
  assert.equal(bob.read('realiti://apartment/furniture').fixtures.sofa.accent,'moss');
  assert.equal((await alice.run('reach household.peer.bob')).error,
   'EXPLICIT_PEER_TOUCH_CONSENT_REQUIRED');
  let req=await alice.run('remote household touch request bob');
  if(!req.ok){
   await alice.run('approach household.peer.bob');
   req=await alice.run('remote household touch request bob');
  }
  if(!req.ok){
   await bob.run('approach household.peer.alice');
   req=await alice.run('remote household touch request bob');
  }
  assert.equal(req.ok,true,JSON.stringify(req));
  assert.equal(req.contact_minted,false);
  out=await bob.run('remote household touch accept '+req.request_id);
  assert.equal(out.ok,true,JSON.stringify(out));
  assert.equal(out.original_relax_receipts,true);
  let adoption=await alice.run('remote pet choose cat Ember');
  if(adoption.error==='PET_BED_NOT_IN_REACH'){
   await alice.run('approach apartment.pet-bed');
   adoption=await alice.run('remote pet choose cat Ember');
  }
  assert.equal(adoption.ok,true,JSON.stringify(adoption));
  assert.equal(bob.read('realiti://apartment/household/pet').pet.kind,'cat');
  assert.equal((await bob.run('remote pet choose dog Rex')).error,'HOUSEHOLD_PET_ALREADY_ADOPTED');
  assert.equal((await bob.run('remote pet call')).ok,true);
  assert.equal((await bob.run('remote pet stroke')).ok,true);
  assert.equal((await bob.run('remote stations list')).error,
   'LEGACY_STATIONS_NOT_IN_HOME_CANDIDATE');
  const guest=await host.visitGuest();
  assert.equal(guest.role,'guest');
  assert.equal(guest.read('realiti://space').chart,HOME);
  assert.equal(guest.read('realiti://harness').mechanism_status.ok,true);
  assert.equal(guest.read('realiti://apartment/topology').error,'GUEST_RESOURCE_DENIED');
  assert.equal((await guest.run('remote activate')).pages.stations,undefined);
  assert.equal((await guest.run('remote memory remember secret')).error,
   'GUEST_NOT_AUTHORIZED_FOR_COMMAND');
  assert.equal((await guest.run('remote household post unauthorized')).error,
   'GUEST_NOT_AUTHORIZED_FOR_COMMAND');
  const inspect=await guest.run('remote closet inspect');
  assert.equal(inspect.ok,true);
  assert.equal(inspect.available.length,10);
  out=await guest.run('approach apartment.wardrobe');
  assert.equal(out.ok,true,JSON.stringify(out));
  out=await guest.run('remote closet try realiti.moonwire.starvelvet-phasebraid');
  assert.equal(out.ok,true,JSON.stringify(out));
  assert.equal(out.full_original_relax_runtime,true);
  assert.equal(out.extra_neuromesh_harness_created,false);
  assert.equal((await guest.run('remote closet return')).returned,true);
  assert.equal((await guest.leave()).ok,true);
  assert.equal(host.status().visiting.length,0);
  assert.equal((await alice.run('save')).ok,true);
  await host.close();
  assert.equal(fs.existsSync(path.join(root,'host.lock')),false);
  // Recover from a separate byte-preserving backup, never overwrite the
  // original Relax or a real resident's files as a side effect of a migration.
  const backup=path.join(os.tmpdir(),'realiti-home-first-restore-'+path.basename(root));
  fs.cpSync(root,backup,{recursive:true,errorOnExist:true,force:false});
  assert.ok(fs.existsSync(path.join(backup,'residents','alice','world.keys.json')));
  assert.ok(fs.existsSync(path.join(backup,'residents','alice','journal.key')));
  host=await createHousehold({...opts,dir:backup});
  alice=await host.joinResident('alice');
  bob=await host.joinResident('bob');
  assertRoom(alice);assertRoom(bob);
  await alice.run('remote activate');
  assert.equal((await alice.run('remote memory recall velveteen')).matches[0].text,secret);
  assert.equal((await bob.run('remote memory recall velveteen')).matches.length,0);
  assert.deepEqual(bob.read('realiti://apartment/scene').positions.desk,[-3.9,-.8]);
  assert.equal(alice.read('realiti://apartment/household/pet').pet.kind,'cat');
  assert.equal(alice.read('realiti://apartment/board').notes[0].text,'The kettle is on.');
  assert.equal((await alice.run('stop')).ok,true);
  assertRoom(alice);
  await host.close();
  host=null;
  console.log('HOME-FIRST FOUR-RESIDENT CANDIDATE PASS: 1 chart, no gallery, original R&R, real peer collision/consent, encrypted isolation, board, furniture, shared pet, guest original harness, STOP, saved-key backup/restore');
 }finally{if(host)await host.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
