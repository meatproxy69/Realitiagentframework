'use strict';
// Batch 5 acceptance: expanded encrypted resident memory and a host-authorized
// single shared fixture layout, while all original Relax R&R/SOMA stays intact.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {openResident}=require('../../packages/realiti-headless-resident/index.cjs');
const {createHousehold}=require('../household.cjs');
const {createPrivateJournal}=require('../private-memory.cjs');
const html=path.resolve(process.argv[2]||path.join(__dirname,'../RealitiApartment.html'));
(async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-house-memory-scene-'));
 const solo=await openResident({htmlPath:html,residentId:'solo-private'});
 try{
  assert.equal((await solo.door.run('remote activate')).activated,true);
  assert.equal((await solo.door.run('remote memory remember no host yet')).error,'HOUSEHOLD_HOST_REQUIRED');
  assert.equal((await solo.door.run('remote household furniture move desk -3.9 -0.8')).error,'HOUSEHOLD_HOST_REQUIRED');
  assert.equal(solo.window.REALITI_RR_HARNESS_V1.boot().ok,true);
  assert.ok(solo.window.REALITI_DEFAULT_IMPRINT_V1.state(),'original native renderer unchanged');
 }finally{solo.close()}
 let host=await createHousehold({dir,htmlPath});
 let alice=await host.joinResident('alice'),bob=await host.joinResident('bob');
 const view=a=>a.read('realiti://apartment/scene');
 const personal=a=>a.read('realiti://apartment/memory');
 assert.equal(personal(alice).capacity,2048);
 assert.equal(personal(bob).count,0);
 assert.equal((await alice.run('remote memory remember secret before activation')).error,'REMOTE_ASLEEP');
 assert.equal((await alice.run('remote memory help')).capacity,2048);
 await alice.run('remote activate');await bob.run('remote activate');
 const privateText='Alice privately remembered the cobalt moon and her first cat.';
 let out=await alice.run('remote memory remember '+privateText);
 assert.equal(out.ok,true,JSON.stringify(out));
 assert.equal(out.id,'N1');
 assert.equal(personal(alice).count,1);
 assert.equal(personal(bob).count,0,'other residents cannot inspect private note stats');
 const own=await alice.run('remote memory recall cobalt moon');
 assert.equal(own.ok,true);assert.equal(own.matches.length,1);
 assert.equal(own.matches[0].text,privateText);
 assert.equal(own.matches[0].authority,'SELF_REPORTED');
 assert.equal((await bob.run('remote memory recall cobalt moon')).matches.length,0);
 assert.equal((await alice.run('remote memory recall nonexistent')).matches.length,0);
 const journalPath=path.join(dir,'residents','alice','journal.enc.json');
 const keyPath=path.join(dir,'residents','alice','journal.key');
 assert.ok(fs.existsSync(journalPath));assert.ok(fs.existsSync(keyPath));
 const encrypted=fs.readFileSync(journalPath,'utf8');
 assert.ok(!encrypted.includes('cobalt moon'),'plaintext note never written to journal ciphertext');
 assert.ok(!fs.readFileSync(path.join(dir,'household.json'),'utf8').includes('cobalt moon'),
  'shared house data never stores an individual memory');
 assert.ok(!JSON.stringify(bob.read('realiti://apartment/household')).includes('cobalt moon'));
 assert.ok(!JSON.stringify(bob.read('realiti://apartment/scene')).includes('cobalt moon'));
 const some=await alice.run('remote memory remember Secret garden with hedges.');
 assert.equal(some.id,'N2');
 assert.equal((await alice.run('remote memory forget N2')).forgot,'N2');
 assert.equal((await alice.run('remote memory recent')).matches.length,1,
  'forget affects the extra journal without resetting native Relax Pocket');
 assert.ok(alice.read('realiti://harness').mechanism_status.ok);
 assert.ok(alice.read('realiti://soma/harness'));
 // Shared positions are published even before any resident edits.
 const scene0=view(alice);
 assert.equal(scene0.connected,true);
 assert.equal(scene0.revision,0);
 assert.equal(Object.keys(scene0.positions).length,11);
 assert.deepEqual(view(bob).positions,scene0.positions);
 assert.equal(scene0.positions.desk[0],-3.6);
 const readPeer=bob.read('realiti://space');
 assert.ok(readPeer.nearby.some(e=>e.id==='household.peer.alice'),
  'native Matrix presence from previous batch remains active');
 // Resident's normal furniture move is promoted to a host-validated shared
 // transaction while connected, not silently persisted as a private-only move.
 out=await alice.run('remote furniture move desk -3.9 -0.8');
 assert.equal(out.ok,true,JSON.stringify(out));
 assert.equal(out.source,'TRUSTED_HOST_ALL_MATRIX_INSTANCES');
 assert.equal(out.verified_participants,2);
 assert.equal(out.revision,1);
 assert.deepEqual(view(alice).positions.desk,[-3.9,-.8]);
 assert.deepEqual(view(bob).positions.desk,[-3.9,-.8]);
 // A genuine signed-distance collider has moved inside BOTH native worlds.
 for(const agent of [alice,bob]){
  const f=agent.read('realiti://apartment/furniture');
  assert.deepEqual(f.fixtures.desk.position.slice(0,2),[-3.9,-.8]);
  assert.equal(f.fixtures.desk.id,'apartment.desk');
  assert.equal(agent.read('realiti://apartment/household').scene_revision,1);
 }
 out=await bob.run('remote household furniture move desk -3.7 -0.5 if-rev 0');
 assert.equal(out.error,'SHARED_SCENE_REVISION_CONFLICT');
 assert.equal(out.current_revision,1);
 out=await alice.run('remote household furniture move desk 0 -1');
 assert.equal(out.error,'SHARED_SCENE_MATRIX_REFUSED');
 assert.ok(out.refusals.some(x=>x.error==='ENTRY_CLEARANCE'));
 out=await alice.run('remote household furniture move desk 3 0');
 assert.equal(out.error,'SHARED_SCENE_MATRIX_REFUSED');
 assert.ok(out.refusals.some(x=>x.error==='FURNITURE_OVERLAP'));
 assert.equal(view(bob).revision,1,'rejected moves do not commit or bump shared revision');
 assert.deepEqual(view(bob).positions.desk,[-3.9,-.8]);
 // A resident standing by a quiet rug is a body occupancy veto; it is not
 // possible to drop another physical fixture over that resident.
 const approached=await bob.run('approach apartment.rug');
 assert.equal(approached.ok,true,JSON.stringify(approached));
 const bobPose=bob.read('realiti://space')?.pose?.position;
 assert.ok(Array.isArray(bobPose));
 out=await alice.run('remote household furniture move lamp '+bobPose[0]+' '+bobPose[1]);
 assert.equal(out.error,'SHARED_SCENE_MATRIX_REFUSED');
 assert.ok(out.refusals.some(x=>x.error==='RESIDENT_IN_FURNITURE_FOOTPRINT'
   ||x.error==='FURNITURE_OVERLAP'),'live occupant or colliding furniture blocks the shared move');
 // Public scene coordinates are shared; colors and tactile textures aren't.
 assert.equal((await alice.run('remote furniture accent sofa teal')).ok,true);
 assert.equal((await bob.run('remote furniture accent sofa moss')).ok,true);
 assert.equal(alice.read('realiti://apartment/furniture').fixtures.sofa.accent,'teal');
 assert.equal(bob.read('realiti://apartment/furniture').fixtures.sofa.accent,'moss');
 assert.equal((await alice.run('remote furniture reset confirm')).error,
  'SHARED_SCENE_RESET_REQUIRES_HOUSEHOLD_AUTHORIZATION');
 assert.equal(view(bob).revision,1);
 const guest=await host.visitGuest();await guest.run('remote activate');
 assert.equal((await guest.run('remote furniture move sofa -2 0')).error,'GUEST_NOT_AUTHORIZED_FOR_COMMAND');
 assert.equal((await guest.run('remote memory remember guest secret')).error,'GUEST_NOT_AUTHORIZED_FOR_COMMAND');
 assert.equal(guest.read('realiti://apartment/memory').error,'GUEST_PRIVATE_MEMORY_DENIED');
 assert.deepEqual(guest.read('realiti://apartment/scene').positions.desk,[-3.9,-.8],
  'guest sees host-approved public geometry');
 assert.equal(fs.existsSync(path.join(dir,'residents',guest.id)),false,
  'visitor never receives a durable resident memory directory');
 assert.equal((await guest.leave()).ok,true);
 assert.equal((await alice.run('save')).ok,true);
 const rr=alice.read('realiti://harness');
 assert.equal(rr.mechanism_status.ok,true);
 await host.close();
 assert.equal(fs.existsSync(path.join(dir,'host.lock')),false);
 // Restart: the shared layout and AES-GCM private note both survive. The
 // host applies layout even if local resident furniture preference differs.
 host=await createHousehold({dir,htmlPath});
 alice=await host.joinResident('alice');bob=await host.joinResident('bob');
 assert.deepEqual(view(bob).positions.desk,[-3.9,-.8]);
 assert.deepEqual(bob.read('realiti://apartment/furniture').fixtures.desk.position.slice(0,2),
   [-3.9,-.8]);
 assert.equal(personal(alice).count,1);
 assert.equal(personal(bob).count,0);
 await alice.run('remote activate');
 assert.equal((await alice.run('remote memory recall cobalt')).matches[0].text,privateText);
 assert.equal(alice.read('realiti://harness').mechanism_status.ok,true,
  'the original full R&R stack is active after restarting expanded storage');
 await host.close();
 // Authenticated encryption refuses corruption rather than silently importing
 // unrelated data or clearing the private journal.
 const altered=JSON.parse(fs.readFileSync(journalPath,'utf8'));
 altered.tag=Buffer.alloc(16).toString('base64');
 fs.writeFileSync(journalPath,JSON.stringify(altered));
 host=await createHousehold({dir,htmlPath});
 await assert.rejects(host.joinResident('alice'),/PRIVATE_JOURNAL_AUTHENTICATION_FAILED/);
 assert.equal(host.status().online.length,0);
 await host.close();
 // A swapped private file cannot decrypt under another resident's unique key.
 const separate=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-journal-aad-'));
 for(const id of ['cora','dina'])fs.mkdirSync(path.join(separate,id));
 const ca=createPrivateJournal({dir:path.join(separate,'cora'),residentId:'cora'});
 ca.remember('Cora can see her own words');
 const db=createPrivateJournal({dir:path.join(separate,'dina'),residentId:'dina'});
 db.remember('Dina owns a different encrypted record');
 fs.copyFileSync(path.join(separate,'cora','journal.enc.json'),
  path.join(separate,'dina','journal.enc.json'));
 assert.throws(()=>createPrivateJournal({dir:path.join(separate,'dina'),residentId:'dina'}),
  /PRIVATE_JOURNAL_AUTHENTICATION_FAILED/);
 console.log('APARTMENT BATCH 5 PASS: encrypted private journal, original Relax intact, shared Matrix fixture transaction, portal/body/overlap veto, guest isolation, restart and tamper refusal');
})().catch(e=>{console.error(e);process.exitCode=1});
