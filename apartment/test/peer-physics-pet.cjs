'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {createHousehold}=require('../household.cjs');
const {openResident}=require('../../packages/realiti-headless-resident/index.cjs');
const html=path.resolve(process.argv[2]||path.join(__dirname,'../RealitiApartment.html'));
const pos=x=>x.read('realiti://space')?.pose?.position;
const hypot=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
(async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-house-physics-pet-'));
 let house=await createHousehold({dir:root,htmlPath:html});
 let a=await house.joinResident('alice');
 let b=await house.joinResident('bob');
 let c=await house.joinResident('cora');
 let d=await house.joinResident('dina');
 assert.equal(house.status().online.length,4);
 for(const [i,x] of [a,b,c,d].entries())for(const y of [a,b,c,d].slice(i+1))
  assert.ok(hypot(pos(x),pos(y))>=.68,
   'four Matrix bodies must not be spawned inside each other: '+x.id+'/'+y.id);
 for(const actor of [a,b,c,d]){
  const physics=actor.read('realiti://apartment/physics');
  assert.equal(physics.ok,true);
  assert.equal(physics.swept_sdf_collision,true);
  assert.equal(physics.observed_peers.length,3);
  assert.ok(physics.observed_peers.every(p=>p.physically_collidable===true));
  assert.equal(actor.read('realiti://harness').mechanism_status.ok,true,
   'native REALITI Relax R&R stays installed under colliding Matrix peers');
 }
 const p0=a.read('realiti://space');
 assert.ok(p0.nearby.some(x=>x.id==='household.peer.bob'));
 assert.equal((await a.run('reach household.peer.bob')).error,
  'EXPLICIT_PEER_TOUCH_CONSENT_REQUIRED');
 assert.equal((await a.run('remote household touch request bob')).error,'REMOTE_ASLEEP');
 await a.run('remote activate');await b.run('remote activate');
 // Touch is never minted merely because someone approaches, even if a collision
 // blocks them. Native Matrix swept motion must leave a finite capsule gap.
 const approach=await a.run('approach household.peer.bob');
 assert.equal(approach.ok,true,JSON.stringify(approach));
 assert.ok(hypot(pos(a),pos(b))>=.65,'native peer collision prevents interpenetration');
 let req=await a.run('remote household touch request bob');
 if(!req.ok){
  await b.run('approach household.peer.alice');
  req=await a.run('remote household touch request bob');
 }
 assert.equal(req.ok,true,JSON.stringify(req));
 assert.equal(req.contact_minted,false);
 assert.equal((await a.run('remote household touch accept '+req.request_id)).error,
  'TOUCH_NOT_YOURS_TO_ACCEPT');
 // The request is single-use on refusal. Issue a new one.
 req=await a.run('remote household touch request bob');
 assert.equal(req.ok,true,JSON.stringify(req));
 const accepted=await b.run('remote household touch accept '+req.request_id);
 assert.equal(accepted.ok,true,JSON.stringify(accepted));
 assert.equal(accepted.original_relax_receipts,true);
 assert.deepEqual(accepted.participants,['alice','bob']);
 assert.equal((await b.run('remote household touch accept '+req.request_id)).error,'NO_SUCH_TOUCH_REQUEST');
 const rr=b.read('realiti://neuromesh');
 assert.ok(rr.schema==='REALITI_SOMA_FIELD_V3','native Relax sidecar remains observable');
 // The old main B7 route stays alive for both participants.
 const originalB7=b.read('realiti://harness');
 assert.equal(originalB7.mechanism_status.ok,true);
 const revision=house.status().shared_scene_revision;
 const concurrent=await Promise.all([
  a.run('remote household post Physics first.'),
  b.run('remote household post Physics second.')
 ]);
 assert.ok(concurrent.every(x=>x.ok),'serialized host accepts both independent resident posts');
 assert.notEqual(concurrent[0].note.seq,concurrent[1].note.seq,'host serializes simultaneous writes');
 assert.equal(house.status().shared_scene_revision,revision);
 // A shared animal must have just ONE native spring/OU authority, accessible to
 // everyone but not duplicated as independent resident companion state.
 const before=a.read('realiti://apartment/household/pet');
 assert.equal(before.pet_count,0);
 let choose=await a.run('remote pet choose cat Ember');
 if(choose.error==='PET_BED_NOT_IN_REACH'){
  await a.run('approach apartment.pet-bed');
  choose=await a.run('remote pet choose cat Ember');
 }
 assert.equal(choose.ok,true,JSON.stringify(choose));
 assert.equal(choose.adopted.name,'Ember');
 assert.equal(choose.adopted.kind,'cat');
 assert.equal(choose.source,'ORIGINAL_RELAX_COMPANION_ADOPTION');
 const cat=b.read('realiti://apartment/household/pet');
 assert.equal(cat.pet_count,1);
 assert.equal(cat.pet.name,'Ember');
 assert.equal(cat.pet.entity_id,'household.pet');
 assert.deepEqual(cat.pet.position,a.read('realiti://apartment/household/pet').pet.position);
 assert.ok(b.read('realiti://space').nearby.some(x=>x.id==='household.pet'),
  'the actual shared cat is a native Matrix entity in another resident instance');
 assert.equal((await b.run('remote pet choose dog Rex')).error,
  'HOUSEHOLD_PET_ALREADY_ADOPTED','one household pet; no accidental duplicated companion');
 let stroke=await b.run('remote pet stroke');
 assert.equal(stroke.error,'PET_NOT_IN_MATRIX_REACH',
  'the remote cannot create distant petting or fabricated evidence');
 const called=await b.run('remote pet call');
 assert.equal(called.ok,true,JSON.stringify(called));
 assert.equal(called.native_spring_call,true);
 stroke=await b.run('remote pet stroke');
 assert.equal(stroke.ok,true,JSON.stringify(stroke));
 assert.equal(stroke.native_relax_b7,true);
 assert.equal(stroke.contact.material,'longfur');
 assert.equal(a.read('realiti://apartment/household/pet').pet.strokes,1);
 const field=b.read('realiti://neuromesh');
 assert.ok(field.grounded.some(x=>String(x.cause).startsWith('HOUSEHOLD_COMPANION_PET:')),
  'petting uses Bob’s actual native Relax B7 grounded path');
 const currentCat=b.read('realiti://apartment/household/pet').pet;
 const time=await b.run('stay 1000');
 assert.equal(time.ok,true);
 const movedCat=b.read('realiti://apartment/household/pet').pet;
 assert.ok(movedCat.revision>currentCat.revision,
  'native spring/OU controller advances the shared pet with world time');
 assert.deepEqual(movedCat.position,a.read('realiti://apartment/household/pet').pet.position);
 assert.equal((await b.run('remote pet release Ember')).error,'PET_RELEASE_OWNER_ONLY');
 let release=await a.run('remote pet release Ember');
 assert.equal(release.ok,true);
 assert.equal(release.native_release,true);
 assert.equal(a.read('realiti://apartment/household/pet').pet_count,0);
 assert.equal(b.read('realiti://space').nearby.some(x=>x.id==='household.pet'),false,
  'native entity is removed everywhere when released');
 // Dog and ferret use the existing species profiles from the checked Apartment
 // companion adapter. Owner identity and pet state survive household restart.
 let dog=await a.run('remote pet choose dog Rex');
 if(dog.error==='PET_BED_NOT_IN_REACH'){
  await a.run('approach apartment.pet-bed');dog=await a.run('remote pet choose dog Rex');
 }
 assert.equal(dog.ok,true,JSON.stringify(dog));
 assert.equal(b.read('realiti://apartment/household/pet').pet.kind,'dog');
 assert.equal((await a.run('remote pet release Rex')).ok,true);
 let ferret=await a.run('remote pet choose ferret Noodle');
 assert.equal(ferret.ok,true,JSON.stringify(ferret));
 assert.equal(b.read('realiti://apartment/household/pet').pet.kind,'ferret');
 assert.equal(b.read('realiti://apartment/household/pet').pet.position.length,3);
 assert.equal(b.read('realiti://harness').mechanism_status.ok,true);
 const persisted=b.read('realiti://apartment/household/pet').pet;
 await house.close();
 house=await createHousehold({dir:root,htmlPath:html});
 a=await house.joinResident('alice');b=await house.joinResident('bob');
 const restored=b.read('realiti://apartment/household/pet').pet;
 assert.equal(restored.name,'Noodle');
 assert.equal(restored.kind,'ferret');
 assert.equal(restored.owner,'alice');
 assert.ok(hypot(restored.position,persisted.position)<.01,
  'native checkpointed physical position survives full host restart');
 assert.equal(house.status().online.length,2);
 assert.ok(b.read('realiti://space').nearby.some(x=>x.id==='household.pet'));
 await b.run('remote activate');
 assert.equal((await b.run('remote pet call')).ok,true,
  'new native companion engine resumes a pet after restart');
 const guest=await house.visitGuest();
 assert.equal(guest.read('realiti://apartment/household/pet').pet.name,'Noodle');
 assert.equal((await guest.run('remote pet call')).error,'GUEST_NOT_AUTHORIZED_FOR_COMMAND');
 const phys=a.read('realiti://apartment/physics');
 assert.ok(phys.observed_peers.some(x=>x.role==='guest'&&x.physically_collidable));
 await guest.leave();
 assert.ok(!a.read('realiti://apartment/physics').observed_peers.some(x=>x.role==='guest'),
   'departed guest body removes native collider and contact eligibility');
 assert.equal(a.read('realiti://harness').mechanism_status.ok,true);
 await house.close();
 // Tampered but rehashed pet payload must be rejected as invalid rather than
 // read as executable instructions or misleading native animal physics.
 const file=path.join(root,'household.json'),raw=JSON.parse(fs.readFileSync(file,'utf8'));
 const original=JSON.stringify(raw);
 raw.pet.kind='dragon';
 const crypto=require('node:crypto');
 const {sha256,...body}=raw;
 raw.sha256=crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');
 fs.writeFileSync(file,JSON.stringify(raw));
 await assert.rejects(createHousehold({dir:root,htmlPath:html}),/SHARED_PET_INVALID_CHECKPOINT/);
 assert.ok(!fs.existsSync(path.join(root,'host.lock')),'failed load releases exclusive host lock');
 fs.writeFileSync(file,original);
 console.log('APARTMENT BATCH 6 PASS: native Matrix peer swept collision, consented dual original-B7 contact, serialized operations, one shared cat/dog/ferret via native Relax spring/OU, private isolation and persisted native pet recovery');
})().catch(e=>{console.error(e);process.exitCode=1});
