'use strict';
// Optional first-checkpoint aesthetic test: an entire book and tangible named
// paint samples, without touching canonical Relax or the private sensory body.
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {openResident}=require('../../packages/realiti-headless-resident/index.cjs');
const {createHousehold}=require('../household.cjs');
const SPEC=require('../bedroom-spec.json');
const html=path.resolve(__dirname,'../RealitiApartmentHomeCandidate.html');
const validationPath=path.resolve(__dirname,'../HOME_CANDIDATE_VALIDATION.json');
const work=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-book-swatches-'));
function verifyPhysical(w){
 const M=w.REALITI_MATRIX_V1;
 assert.deepEqual(Object.keys(M.charts()),['CLOUD_NINE_NEST']);
 assert.equal(Object.keys(M.portals()).length,0);
 for(const room of Object.keys(SPEC.rooms)){
  const chest=M.entities()['apartment.bedroom.chest.'+room];
  const book=M.entities()['apartment.bedroom.book.'+room];
  assert.ok(chest&&book,'each bedroom has a chest and a real book copy');
  assert.equal(book.collision,false,'reading cannot block the route');
  assert.equal(book.chart,'CLOUD_NINE_NEST');
  assert.ok(book.label.includes('Book of Beautiful Things'));
  for(const role of SPEC.colorRoles){
   const tile=M.entities()['apartment.bedroom.sample.'+room+'.'+role];
   assert.ok(tile,'missing physical '+room+' '+role+' paint card');
   assert.equal(tile.collision,false,'sample does not invent collisions');
   assert.equal(tile.material,'cardboard');
   assert.ok(tile.label.includes('sample:'),tile.label);
  }
 }
}
async function solo(){
 const opts={htmlPath:html,validationPath,residentId:'book-reader',
  storagePath:path.join(work,'solo.json')};
 let a=await openResident(opts);
 try{
  verifyPhysical(a.window);
  const run=c=>a.door.run(c),B=a.window.REALITI_APARTMENT_BEDROOMS_V1;
  const shelf=await run('book shelves');
  assert.equal(shelf.ok,true);
  assert.equal(shelf.copies.length,4);
  assert.ok(shelf.optional);
  const contents=await run('book contents');
  assert.equal(contents.ok,true);
  assert.ok(contents.sections.length>=60,'no book abridgement');
  assert.ok(contents.sections.some(x=>x.id==='style-43'));
  assert.equal((await run('remote book contents')).error,'REMOTE_ASLEEP');
  assert.equal((await run('remote activate')).activated,true);
  const palette=await run('remote bedroom swatches');
  assert.equal(palette.ok,true);
  assert.ok(palette.swatches.ink&&palette.swatches.lemon&&palette.swatches.moss);
  assert.equal((await run('remote book read library style-43')).error,'BOOK_OUT_OF_REACH');
  const approach=await run('approach apartment.bedroom.book.library');
  assert.equal(approach.ok,true,JSON.stringify(approach).slice(0,320));
  const read=await run('remote book read library style-43');
  assert.equal(read.ok,true,JSON.stringify(read).slice(0,320));
  assert.match(read.markdown,/Apricot circuitry/i);
  assert.equal(read.contact_minted,false);
  assert.equal((await run('remote bedroom claim library')).ok,true);
  const picked=await run('remote bedroom swatch library accent cherry');
  assert.equal(picked.ok,true,JSON.stringify(picked).slice(0,350));
  assert.equal(B.view().bedrooms.library.palette.accent,'cherry');
  assert.match(a.window.REALITI_MATRIX_V1.entities()['apartment.bedroom.sample.library.accent'].label,/Cherry/);
  assert.equal((await run('remote bedroom swatch canopy accent plum')).error,'BEDROOM_NOT_OWNED');
  const recipe=await run('remote bedroom palette library lemon-goth');
  assert.equal(recipe.ok,true,JSON.stringify(recipe).slice(0,300));
  assert.equal(B.view().bedrooms.library.palette.accent,'lemon');
  assert.equal((await run('remote bedroom colors library')).colors.accent,'lemon');
  assert.equal((await run('save')).ok,true);
  a.close();a=null;a=await openResident(opts);
  verifyPhysical(a.window);
  assert.equal(a.window.REALITI_APARTMENT_BEDROOMS_V1.view().bedrooms.library.palette.accent,'lemon');
  assert.ok(a.window.REALITI_MATRIX_V1.entities()['apartment.bedroom.sample.library.accent'].label.includes('Lemon'));
  console.log('HOME OPTIONAL BOOK / SWATCH SOLO PASS: full book, four copies, owner-named swatches, source geometry, read reach, persistence');
 }finally{if(a)a.close()}
}
async function household(){
 const dir=path.join(work,'host');
 let host=await createHousehold({dir,htmlPath:html,validationPath});
 try{
  let bob=await host.joinResident('bob'),alice=await host.joinResident('alice');
  assert.equal((await bob.run('remote activate')).activated,true);
  assert.equal((await alice.run('remote activate')).activated,true);
  assert.equal((await bob.run('remote bedroom claim library')).ok,true);
  const changed=await bob.run('remote bedroom swatch library accent moss');
  assert.equal(changed.ok,true,JSON.stringify(changed).slice(0,300));
  assert.equal(bob.read('realiti://apartment/bedrooms').bedrooms.library.palette.accent,'moss');
  assert.equal(alice.read('realiti://apartment/bedrooms').bedrooms.library.palette.accent,'moss');
  assert.equal((await alice.run('remote bedroom swatch library accent cherry')).error,'BEDROOM_NOT_OWNED');
  const guest=await host.visitGuest();
  assert.equal((await guest.run('remote bedroom swatch library accent lemon')).error,'GUEST_NOT_AUTHORIZED_FOR_COMMAND');
  await guest.leave();
  await host.close();host=null;
  host=await createHousehold({dir,htmlPath:html,validationPath});
  bob=await host.joinResident('bob');
  assert.equal(bob.read('realiti://apartment/bedrooms').bedrooms.library.palette.accent,'moss');
  await bob.run('remote activate');
  const reset=await bob.run('remote bedroom palette library reset');
  assert.equal(reset.ok,true);
  assert.equal(bob.read('realiti://apartment/bedrooms').bedrooms.library.palette_source,'configuration');
  console.log('HOME OPTIONAL BOOK / SWATCH HOUSEHOLD PASS: trusted owner palette, no guest override, shared state and cold restart');
 }finally{if(host)await host.close()}
}
(async()=>{await solo();await household()})().catch(e=>{console.error(e.stack||e);process.exitCode=1});