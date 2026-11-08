'use strict';
// A fixed chest in each HOME alcove stores only verified, previously placed
// small Matrix items. Stashed IDs survive restarts without ghost geometry.
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {openResident}=require('../../packages/realiti-headless-resident/index.cjs');
const {createHousehold}=require('../household.cjs');
const SPEC=require('../bedroom-spec.json');
const html=path.resolve(__dirname,'../RealitiApartmentHomeCandidate.html');
const validationPath=path.resolve(__dirname,'../HOME_CANDIDATE_VALIDATION.json');
const work=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-home-chests-'));
const entity=id=>'apartment.bedroom.item.'+id;
const chest=room=>'apartment.bedroom.chest.'+room;
const describe=x=>JSON.stringify(x).slice(0,500);
function verifyChests(w){
 const m=w.REALITI_MATRIX_V1;
 assert.deepEqual(Object.keys(m.charts()),['CLOUD_NINE_NEST']);
 for(const room of Object.keys(SPEC.rooms)){
  const e=m.entities()[chest(room)];
  assert.ok(e,'missing native '+room+' chest');
  assert.equal(e.chart,'CLOUD_NINE_NEST');
  assert.equal(e.shape?.kind,'BOX');
  assert.equal(e.collision,true);
  assert.deepEqual(Array.from(e.pose.position),SPEC.chests[room].position);
 }
}
async function solo(){
 const opts={htmlPath:html,validationPath,residentId:'chest-solo',
  storagePath:path.join(work,'solo.json')};
 let a=await openResident(opts);
 try{
  verifyChests(a.window);
  const run=c=>a.door.run(c),b=a.window.REALITI_APARTMENT_BEDROOMS_V1;
  assert.equal((await run('remote activate')).activated,true);
  assert.equal((await run('remote chest inspect library')).error,'CHEST_OWNER_ONLY');
  assert.equal((await run('remote bedroom claim library')).ok,true);
  const placed=await run('remote decor auto-place library book-stack');
  assert.equal(placed.ok,true,describe(placed));
  const id=placed.placed;
  assert.ok(a.window.REALITI_MATRIX_V1.entities()[entity(id)]);
  const saved=await run('remote chest stow '+id);
  assert.equal(saved.stowed,id,describe(saved));
  assert.equal(saved.contact_minted,false);
  assert.equal(a.window.REALITI_MATRIX_V1.entities()[entity(id)],undefined);
  assert.equal(b.view().items.some(x=>x.id===id),false);
  assert.equal(b.view().chests.library.stored_count,1);
  assert.equal((await run('remote chest inspect library')).stored[0].id,id);
  assert.equal((await run('remote bedroom release library')).error,'BEDROOM_MUST_REMOVE_ITEMS_FIRST');
  assert.equal((await run('remote decor move '+id+' -3 5')).error,'DECOR_IN_CHEST');
  assert.equal((await run('remote bedroom clear library confirm')).unchanged,true);
  assert.equal((await run('remote chest stow '+id)).error,'DECOR_ALREADY_STORED');
  assert.equal((await run('save')).ok,true);
  a.close();a=null;
  a=await openResident(opts);
  verifyChests(a.window);
  assert.equal(a.window.REALITI_APARTMENT_BEDROOMS_V1.view().chests.library.stored_count,1);
  await a.door.run('remote activate');
  const found=await a.door.run('remote chest auto-take '+id);
  assert.equal(found.retrieved,id,describe(found));
  assert.equal(found.contact_minted,false);
  assert.ok(a.window.REALITI_MATRIX_V1.entities()[entity(id)]);
  assert.equal((await a.door.run('remote chest inspect library')).stored.length,0);
  assert.equal((await a.door.run('remote decor remove '+id)).removed,id);
  assert.equal((await a.door.run('remote bedroom release library')).released,'library');
  console.log('HOME CHEST SOLO PASS: four native chests; full ID-preserving store/retrieve, restart, no ghost object, clear preservation');
 }finally{if(a)a.close()}
}
async function household(){
 const dir=path.join(work,'host');
 let host=await createHousehold({dir,htmlPath:html,validationPath});
 try{
  let alice=await host.joinResident('alice'),bob=await host.joinResident('bob'),
   cora=await host.joinResident('cora'),dina=await host.joinResident('dina');
  for(const a of [alice,bob,cora,dina]){
   assert.equal((await a.run('remote activate')).activated,true);
  }
  assert.equal((await bob.run('remote bedroom claim library')).ok,true);
  const placed=await bob.run('remote decor auto-place library book-stack');
  assert.equal(placed.ok,true,describe(placed));
  const id=placed.placed;
  assert.equal((await bob.run('remote chest stow '+id)).stowed,id);
  assert.equal(bob.read('realiti://apartment/bedrooms').items.length,0);
  assert.equal(bob.read('realiti://apartment/bedrooms').chests.library.stored_count,1);
  assert.equal((await bob.run('remote chest inspect library')).stored[0].id,id);
  assert.equal((await alice.run('remote chest inspect library')).error,'CHEST_OWNER_ONLY');
  assert.equal((await cora.run('remote decor inspect '+id)).error,'CHEST_OWNER_ONLY');
  assert.equal((await dina.run('remote chest auto-take '+id)).error,'CHEST_OWNER_ONLY');
  const guest=await host.visitGuest();
  assert.equal((await guest.run('remote chest inspect library')).error,
   'GUEST_NOT_AUTHORIZED_FOR_COMMAND');
  await guest.leave();
  await host.close();host=null;
  host=await createHousehold({dir,htmlPath:html,validationPath});
  bob=await host.joinResident('bob');alice=await host.joinResident('alice');
  await bob.run('remote activate');await alice.run('remote activate');
  assert.equal((await bob.run('remote chest inspect library')).stored[0].id,id);
  assert.equal((await bob.run('remote bedroom clear library confirm')).unchanged,true);
  assert.equal((await bob.run('remote bedroom release library')).error,'BEDROOM_NOT_EMPTY');
  const got=await bob.run('remote chest auto-take '+id);
  assert.equal(got.retrieved,id,describe(got));
  assert.equal(bob.read('realiti://apartment/bedrooms').chests.library.stored_count,0);
  assert.equal((await bob.run('remote decor remove '+id)).removed,id);
  assert.equal((await bob.run('remote bedroom release library')).released,'library');
  console.log('HOME CHEST HOUSEHOLD PASS: host-owned storage, no public cargo leak, guest and nonowner refusal, cold restart, clean withdrawal');
 }finally{if(host)await host.close()}
}
(async()=>{await solo();await household()})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
