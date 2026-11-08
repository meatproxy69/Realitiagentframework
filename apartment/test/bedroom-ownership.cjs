'use strict';
// End-to-end claimable bedrooms and native Matrix placeable items.
// HOME stays ONE chart; no private memory, permission, contact, or doorway is minted.
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const {openResident}=require('../../packages/realiti-headless-resident/index.cjs');
const {createHousehold}=require('../household.cjs');
const SPEC=require('../bedroom-spec.json');
const html=path.resolve(__dirname,'../RealitiApartmentHomeCandidate.html');
const validationPath=path.resolve(__dirname,'../HOME_CANDIDATE_VALIDATION.json');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-bedroom-ownership-'));
const fmt=v=>JSON.stringify(v).slice(0,550);
const mode=process.argv[2]||'solo';
const PLACE='library';
const geom=w=>w.REALITI_MATRIX_V1;
const oneChart=w=>{
 assert.deepEqual(Object.keys(geom(w).charts()),['CLOUD_NINE_NEST']);
 assert.equal(Object.keys(geom(w).portals()).length,0);
};
async function solo(){
 let a=null,b=null;const opts=id=>({htmlPath:html,validationPath,
  residentId:id,storagePath:path.join(dir,id+'.json')});
 try{
  a=await openResident(opts('bedroom-solo-a'));
  const w=a.window,D=c=>a.door.run(c),B=w.REALITI_APARTMENT_BEDROOMS_V1;
  assert.equal(a.integrity.status,'VERIFIED');oneChart(w);
  assert.equal((await D('remote bedrooms')).error,'REMOTE_ASLEEP');
  assert.equal((await D('decor catalog')).error,'REMOTE_REQUIRED');
  assert.equal((await D('remote activate')).activated,true);
  const catalog=await D('remote decor catalog');
  assert.equal(Object.keys(catalog.items).length,15);
  assert.equal(Object.keys(catalog.configurations).length,5);
  assert.equal((await D('remote bedrooms')).bedrooms.library.owner,null);
  assert.equal((await D('remote bedroom claim library')).ok,true);
  assert.equal((await D('remote bedroom claim quilt')).ok,true,
   'in solo mode a resident may customize additional bays');
  assert.equal((await D('remote bedroom configure library nightglass')).configuration,'nightglass');
  assert.equal((await D('remote decor place library book-stack 0 0')).error,'OUTSIDE_OWNED_BEDROOM');
  assert.equal((await D('remote decor place studio book-stack 2 -4')).error,'BEDROOM_NOT_OWNED');
  assert.equal((await D('remote bedroom claim studio')).ok,true);
  const kit=await D('remote bedroom furnish studio music');
  assert.equal(kit.ok,true,fmt(kit));
  assert.equal(kit.placed.length,2,'a room configuration creates two physically verified native props');
  for(const row of kit.placed)
   assert.ok(geom(w).entities()['apartment.bedroom.item.'+row.id]);
  assert.equal((await D('remote bedroom furnish studio writers')).error,
   'BEDROOM_NOT_EMPTY_FOR_CONFIGURATION');
  let spot=null;
  const bounds=SPEC.rooms.library.bounds;
  for(let y=bounds[3]-.25;y>bounds[2]+.25&&!spot;y-=.4)
   for(let x=bounds[1]-.25;x>bounds[0]+.25&&!spot;x-=.4){
    const px=+x.toFixed(2),py=+y.toFixed(2);
    if(B.preview('book-stack',PLACE,px,py).ok)spot=[px,py];
   }
  assert.ok(spot,'there must be an unoccupied native Matrix space to drop a small book stack');
  let out=await D('remote decor place library book-stack '+spot.join(' '));
  assert.equal(out.ok,true,fmt(out));
  assert.equal(out.contact_minted,false);
  const id=out.placed,entityId='apartment.bedroom.item.'+id;
  const entity=geom(w).entities()[entityId];
  assert.ok(entity,'the dropped prop is a real native Matrix entity');
  assert.equal(entity.chart,'CLOUD_NINE_NEST');
  assert.equal(entity.shape.kind,'BOX');
  assert.equal(entity.collision,true);
  assert.ok(entity.tags.includes('owned:bedroom-solo-a'));
  assert.ok(entity.tags.includes('configuration:nightglass'));
  assert.equal((await D('remote bedroom configure library writers')).ok,true);
  assert.ok(geom(w).entities()[entityId].tags.includes('configuration:writers'),
   'changing bedroom configuration updates actual native prop tags');
  assert.equal((await D('remote bedroom release library')).error,'BEDROOM_MUST_REMOVE_ITEMS_FIRST');
  assert.equal((await D('remote decor remove '+id)).removed,id);
  assert.equal(geom(w).entities()[entityId],undefined,'removed object is absent from Matrix');
  out=await D('remote decor place library floor-mat '+spot.join(' '));
  assert.equal(out.ok,true,fmt(out));
  assert.equal(geom(w).entities()['apartment.bedroom.item.'+out.placed].collision,false,
   'decorative items state their noncolliding behavior honestly');
  assert.equal((await D('save')).ok,true);
  a.close();a=null;
  a=await openResident(opts('bedroom-solo-a'));
  assert.equal(a.integrity.status,'VERIFIED');oneChart(a.window);
  const restored=a.window.REALITI_APARTMENT_BEDROOMS_V1.view();
  assert.equal(restored.bedrooms.library.owner,'bedroom-solo-a');
  assert.equal(restored.bedrooms.library.configuration,'writers');
  assert.equal(restored.items.length,3,'one manual mat plus a two-object music layout survives restart');
  assert.ok(geom(a.window).entities()['apartment.bedroom.item.'+out.placed]);
  b=await openResident(opts('bedroom-solo-b'));
  assert.equal(b.window.REALITI_APARTMENT_BEDROOMS_V1.view().items.length,0);
  assert.equal(b.window.REALITI_APARTMENT_BEDROOMS_V1.view().bedrooms.library.owner,null);
  assert.equal(a.window.REALITI_HAPTIC_FIELD_V20.energy().pass,true);
  console.log('BEDROOM SOLO PASS: 5 configurations, 15 native placeables, one chart, typed collision, solo claims, persistence, owner isolation, no invented touch');
 }finally{if(a)a.close();if(b)b.close();}
}
async function household(){
 const root=path.join(dir,'host');
 let host=await createHousehold({dir:root,htmlPath:html,validationPath});
 try{
  let alice=await host.joinResident('alice'),bob=await host.joinResident('bob'),
   cora=await host.joinResident('cora'),dina=await host.joinResident('dina');
  for(const a of [alice,bob,cora,dina]){
   assert.equal(a.read('realiti://apartment/bedrooms').one_native_chart,true);
   assert.equal((await a.run('remote activate')).activated,true);
  }
  const original=alice.read('realiti://apartment/bedrooms');
  assert.equal(original.items.length,0);
  assert.equal(Object.keys(original.bedrooms).length,4);
  assert.equal((await alice.run('remote bedroom claim quilt')).owner,'alice');
  assert.equal((await bob.run('remote bedroom claim library')).owner,'bob');
  assert.equal((await cora.run('remote bedroom claim canopy')).owner,'cora');
  assert.equal((await dina.run('remote bedroom claim studio')).owner,'dina');
  assert.equal((await bob.run('remote bedroom claim quilt')).error,'BEDROOM_ALREADY_OWNED');
  assert.equal((await alice.run('remote bedroom claim studio')).error,'BEDROOM_ALREADY_OWNED');
  assert.equal((await alice.run('remote bedroom configure library nightglass')).error,'BEDROOM_NOT_OWNED');
  assert.equal((await alice.run('remote bedroom configure quilt botanical')).ok,true);
  assert.equal((await alice.run('remote furniture move sofa 0 3')).error,
   'SHARED_FURNITURE_BEDROOM_OWNER_ONLY',
   'a base sofa in Cora-owned Canopy cannot be removed by Alice');
  assert.equal((await alice.run('remote furniture move desk -2.5 4.9')).error,
   'SHARED_FURNITURE_BEDROOM_OWNER_ONLY',
   'a nonowner may not park a shared desk in Bob-owned Library');
  assert.equal((await bob.run('remote bedroom configure library writers')).ok,true);
  assert.equal((await cora.run('remote bedroom configure canopy nightglass')).ok,true);
  assert.equal((await dina.run('remote bedroom configure studio music')).ok,true);
  const furnished=await dina.run('remote bedroom furnish studio music');
  assert.equal(furnished.ok,true,fmt(furnished));
  assert.equal(furnished.placed.length,2,'trusted host validates and places a two-item native kit');
  assert.equal(bob.read('realiti://apartment/bedrooms').items.length,2);
  assert.equal((await bob.run('remote bedroom furnish studio writers')).error,'BEDROOM_NOT_OWNED');
  const wrong=await bob.run('remote bedroom configure library botanical if-rev 0');
  assert.equal(wrong.error,'BEDROOM_REVISION_CONFLICT');
  assert.equal((await bob.run('remote decor place studio book-stack 2.6 -4.7')).error,'BEDROOM_NOT_OWNED');
  const positions=[[-2.5,5],[-2.6,5.1],[-2.3,5],[-2.7,5.25],[-2.15,5.25]];
  let placed=null;
  for(const [x,y] of positions){
   const candidate=await bob.run('remote decor place library book-stack '+x+' '+y);
   if(candidate.ok){placed=candidate;break}
   assert.equal(candidate.error,'BEDROOM_MATRIX_REFUSED',fmt(candidate));
  }
  assert.ok(placed,'one library position must be Matrix-validated in every resident copy');
  assert.equal(placed.verified_participants,4);
  assert.equal(placed.contact_minted,false);
  assert.equal(alice.read('realiti://apartment/bedrooms').items.length,3);
  assert.equal(cora.read('realiti://apartment/bedrooms').items[0].owner,'bob');
  assert.equal(alice.read('realiti://apartment/bedrooms').bedrooms.library.configuration,'writers');
  assert.equal((await cora.run('remote decor remove '+placed.placed)).error,'DECOR_NOT_OWNED');
  assert.equal((await bob.run('remote bedroom release library')).error,'BEDROOM_NOT_EMPTY');
  const guest=await host.visitGuest();
  assert.equal(guest.read('realiti://apartment/bedrooms').bedrooms.library.owner,'bob');
  assert.equal((await guest.run('remote bedroom claim library')).error,'GUEST_NOT_AUTHORIZED_FOR_COMMAND');
  assert.equal((await guest.leave()).ok,true);
  assert.equal((await bob.run('save')).ok,true);
  const revision=host.status().shared_bedroom_revision;
  await host.close();host=null;
  host=await createHousehold({dir:root,htmlPath:html,validationPath});
  alice=await host.joinResident('alice');bob=await host.joinResident('bob');
  assert.equal(bob.read('realiti://apartment/bedrooms').items[0].id,placed.placed);
  assert.equal(host.status().shared_bedroom_revision,revision);
  assert.equal(bob.read('realiti://apartment/bedrooms').bedrooms.library.owner,'bob');
  await bob.run('remote activate');
  assert.equal((await alice.run('remote decor remove '+placed.placed)).error,'REMOTE_ASLEEP');
  assert.equal((await bob.run('remote decor remove '+placed.placed)).removed,placed.placed);
  assert.equal((await bob.run('remote bedroom release library')).released,'library');
  assert.equal(bob.read('realiti://apartment/bedrooms').items.length,2,
   'Dina-owned music kit remains when Bob removes his private books');
  assert.equal(host.status().owned_bedrooms,3);
  await host.close();host=null;
  // A correctly hashed but unauthorized bedroom owner remains rejected:
  // loading must validate semantic permissions, not only outer checksums.
  const tampered=path.join(dir,'tampered-host');
  fs.cpSync(root,tampered,{recursive:true,errorOnExist:true,force:false});
  const file=path.join(tampered,'household.json'),x=JSON.parse(fs.readFileSync(file,'utf8'));
  x.bedrooms.rooms.quilt.owner='guest-injected';
  const {sha256,...body}=x;
  x.sha256=crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');
  fs.writeFileSync(file,JSON.stringify(x));
  await assert.rejects(createHousehold({dir:tampered,htmlPath:html,validationPath}),
   /BEDROOMS_INVALID_ROOM_OWNER/);
  assert.equal(fs.existsSync(path.join(tampered,'host.lock')),false,
   'a rejected ownership checkpoint must not strand the writer lock');
  console.log('BEDROOM HOUSEHOLD PASS: four exclusive owners, five configurations, host-authored native items, no nonowner edits, guests, saved restart, rev checks, checksum-valid permission tamper refusal');
 }finally{if(host)await host.close();}
}
(async()=>{
 if(!['solo','household'].includes(mode))throw Error('INVALID_BEDROOM_TEST_MODE');
 if(mode==='solo')await solo();else await household();
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
