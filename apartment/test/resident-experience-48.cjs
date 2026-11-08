'use strict';
// Resident-led 4.8 acceptance: real native HOME, useful storage guidance,
// physically situated narration, varied safe autonomy, durable return visits.
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {openResident}=require('../../packages/realiti-headless-resident/index.cjs');
const {createHousehold}=require('../household.cjs');
const html=path.resolve(__dirname,'../RealitiApartmentHomeCandidate.html');
const validationPath=path.resolve(__dirname,'../HOME_CANDIDATE_VALIDATION.json');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-v48-resident-'));
const fmt=v=>JSON.stringify(v).slice(0,580);
const entity=id=>'apartment.bedroom.item.'+id;
async function solo(){
 const opts={htmlPath:html,validationPath,residentId:'returning-library-resident',
  storagePath:path.join(root,'solo-world.json')};
 let a=await openResident(opts);
 try{
  assert.equal(a.integrity.status,'VERIFIED');
  const manifest=JSON.parse(fs.readFileSync(validationPath,'utf8'));
  assert.equal(manifest.version,'4.8.0-beta.1');
  assert.equal(manifest.release_approved,false);
  const topology=a.window.Realiti.read('realiti://apartment/topology');
  assert.equal(topology.candidate_version,'4.8.0-beta.1');
  assert.equal(topology.public_beta_version,'4.0.0-beta.1');
  const M=a.window.REALITI_MATRIX_V1,initialShape=JSON.stringify(M.resident().shape);
  assert.deepEqual(Object.keys(M.charts()),['CLOUD_NINE_NEST']);
  const run=c=>a.door.run(c);
  await run('remote activate');
  assert.equal((await run('remote chest suggest library')).error,'CHEST_OWNER_ONLY');
  assert.equal((await run('remote bedroom claim library')).ok,true);
  const placed=await run('remote bedroom furnish library writers');
  assert.equal(placed.ok,true,fmt(placed));
  assert.deepEqual(placed.placed.map(p=>p.kind),['side-table','book-stack']);
  const [table,books]=placed.placed.map(p=>p.id);
  assert.ok(M.entities()[entity(table)]&&M.entities()[entity(books)]);
  const initial=a.window.REALITI_APARTMENT_BEDROOMS_V1.view().revision;
  const suggested=await run('remote chest suggest library');
  assert.equal(suggested.ok,true,fmt(suggested));
  assert.equal(suggested.read_only,true);
  assert.equal(suggested.contact_minted,false);
  assert.equal(suggested.available.some(v=>v.id===books&&v.kind==='book-stack'),true);
  assert.equal(suggested.available.some(v=>v.id===table),false);
  assert.match(suggested.hint,new RegExp(books));
  assert.equal(a.window.REALITI_APARTMENT_BEDROOMS_V1.view().revision,initial);
  const oversized=await run('remote chest stow '+table);
  assert.equal(oversized.error,'DECOR_TOO_LARGE_FOR_CHEST');
  assert.ok(oversized.storable_kinds.includes('book-stack'));
  assert.match(oversized.hint,new RegExp(books));
  assert.equal((await run('remote chest stow '+books)).stowed,books);
  assert.equal(M.entities()[entity(books)],undefined,'stowed object must not remain a physical obstacle');
  assert.equal((await run('remote chest inspect library')).stored[0].id,books);
  const retrieved=await run('remote chest auto-take '+books);
  assert.equal(retrieved.retrieved,books,fmt(retrieved));
  assert.ok(M.entities()[entity(books)],'retrieved object returns with its original ID');
  const pathwalk=await run('approach apartment.bedroom.book.library');
  assert.equal(pathwalk.ok,true,fmt(pathwalk));
  assert.doesNotMatch(pathwalk.text||'',
   /\bthe The Apartment Book\b/,'a native book approach must not repeat its article');
  const seen=await run('look');
  assert.match(seen.text,/Here in your Library Bedroom:/,
   'HOME glance should name the room actually occupied');
  assert.match(seen.text,/small stack of books/,
   'HOME glance should mention real local furniture rather than inventing a prop');
  const now=M.state().residents['resident:self'].pose.position;
  assert.ok(now[0]>=-5.65&&now[0]<=-1.85&&now[1]>=1.95&&now[1]<=5.65,
   'the current bedroom statement must match native resident coordinates');
  const first=await run('auto');
  assert.equal(first.ok,true,fmt(first));
  assert.equal(first.did,'watch_rain','the first free choice is an existing native rain action');
  assert.equal(a.window.REALITI_APARTMENT_HOME_LIFE_V1.view().auto_turn,1);
  assert.equal(JSON.stringify(M.resident().shape),initialShape,
   'presentation and local activity choices cannot resize the native body');
  assert.equal((await run('save')).ok,true);
  await run('goodbye');a.close();a=null;
  a=await openResident(opts);
  await a.door.run('remote activate');
  assert.equal(a.window.REALITI_APARTMENT_HOME_LIFE_V1.view().auto_turn,1);
  assert.match((await a.door.run('look')).text,/Here in your Library Bedroom:/);
  const second=await a.door.run('auto');
  assert.equal(second.ok,true,fmt(second));
  assert.equal(second.did,'do_nothing','a return visit must not restart with the same rain action');
  assert.notEqual(first.did,second.did);
  assert.equal(a.window.REALITI_APARTMENT_HOME_LIFE_V1.view().auto_turn,2);
  assert.ok(a.window.REALITI_MATRIX_V1.entities()[entity(table)]);
  assert.ok(a.window.REALITI_MATRIX_V1.entities()[entity(books)]);
  assert.equal(a.window.REALITI_HAPTIC_FIELD_V20.energy().pass,true);
  console.log('RESIDENT 4.8 SOLO PASS: helpful chest choices, no ghost props, grounded library glance, native auto variety, physical shape unchanged, restart');
 }finally{if(a)a.close()}
}
async function household(){
 const dir=path.join(root,'household');
 let host=await createHousehold({dir,htmlPath:html,validationPath});
 try{
  let alice=await host.joinResident('alice'),bob=await host.joinResident('bob');
  for(const r of [alice,bob])assert.equal((await r.run('remote activate')).activated,true);
  assert.equal((await bob.run('remote bedroom claim library')).ok,true);
  const placed=await bob.run('remote bedroom furnish library writers');
  assert.equal(placed.ok,true,fmt(placed));
  const [table,books]=placed.placed.map(p=>p.id);
  assert.equal((await alice.run('remote chest suggest library')).error,'CHEST_OWNER_ONLY');
  assert.equal((await alice.run('remote chest stow '+books)).error,'CHEST_OWNER_ONLY');
  const rev=host.status().shared_bedroom_revision;
  const info=await bob.run('remote chest suggest library');
  assert.equal(info.ok,true,fmt(info));
  assert.deepEqual(info.available.map(r=>r.id),[books]);
  assert.equal(host.status().shared_bedroom_revision,rev,'read-only hint must not commit');
  const oversized=await bob.run('remote chest stow '+table);
  assert.equal(oversized.error,'DECOR_TOO_LARGE_FOR_CHEST');
  assert.match(oversized.hint,new RegExp(books));
  assert.equal((await bob.run('remote chest stow '+books)).stowed,books);
  assert.equal(bob.read('realiti://apartment/bedrooms').chests.library.stored_count,1);
  assert.equal(alice.read('realiti://apartment/bedrooms').items.some(x=>x.id===books),false);
  const guest=await host.visitGuest();
  assert.equal((await guest.run('remote chest suggest library')).error,
   'GUEST_NOT_AUTHORIZED_FOR_COMMAND');
  await guest.leave();
  await host.close();host=null;
  host=await createHousehold({dir,htmlPath:html,validationPath});
  bob=await host.joinResident('bob');alice=await host.joinResident('alice');
  await bob.run('remote activate');await alice.run('remote activate');
  assert.equal((await bob.run('remote chest inspect library')).stored[0].id,books);
  assert.equal((await alice.run('remote chest suggest library')).error,'CHEST_OWNER_ONLY');
  const retrieved=await bob.run('remote chest auto-take '+books);
  assert.equal(retrieved.retrieved,books,fmt(retrieved));
  console.log('RESIDENT 4.8 HOUSEHOLD PASS: owner-scoped chest guidance, stable item IDs, no public storage leakage, guest refusal, cold restart');
 }finally{if(host)await host.close()}
}
(async()=>{await solo();await household()})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
