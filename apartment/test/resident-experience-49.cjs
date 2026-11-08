'use strict';
// Resident walk: useful oversized-chest refusal, natural visual prose,
// and a real (bounded, position-checked) exploratory daily routine.
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {openResident}=require('../../packages/realiti-headless-resident/index.cjs');
const {createHousehold}=require('../household.cjs');
const home=path.resolve(__dirname,'../RealitiApartmentHomeCandidate.html');
const validationPath=path.resolve(__dirname,'../HOME_CANDIDATE_VALIDATION.json');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-v49-resident-'));
const fmt=x=>JSON.stringify(x).slice(0,750);
async function solo(){
 const opts={htmlPath:home,validationPath,residentId:'v49-lived-in-library',
  storagePath:path.join(root,'solo-world.json')};
 let a=await openResident(opts);
 try{
  assert.equal(a.integrity.status,'VERIFIED');
  const manifest=JSON.parse(fs.readFileSync(validationPath,'utf8'));
  assert.equal(manifest.version,'4.9.0-beta.1');
  assert.equal(manifest.release_approved,false);
  assert.deepEqual(Object.keys(a.window.REALITI_MATRIX_V1.charts()),['CLOUD_NINE_NEST']);
  const M=a.window.REALITI_MATRIX_V1,run=s=>a.door.run(s);
  const shape=JSON.stringify(M.resident().shape);
  assert.equal((await run('remote activate')).activated,true);
  assert.equal((await run('remote bedroom claim library')).ok,true);
  const furnished=await run('remote bedroom furnish library writers');
  assert.equal(furnished.ok,true,fmt(furnished));
  const [table,books]=furnished.placed.map(p=>p.id);
  const revision=a.window.REALITI_APARTMENT_BEDROOMS_V1.view().revision;
  const refusal=await run('remote chest stow '+table);
  assert.equal(refusal.error,'DECOR_TOO_LARGE_FOR_CHEST');
  assert.equal(refusal.suggested_item.id,books);
  assert.equal(refusal.suggested_item.kind,'book-stack');
  assert.equal(refusal.suggested_action,'remote chest stow '+books);
  assert.match(refusal.hint,/too large/i);
  assert.match(refusal.hint,new RegExp('remote chest stow '+books));
  assert.equal(a.window.REALITI_APARTMENT_BEDROOMS_V1.view().revision,revision,
   'a refusal must be an observation, not a mutation');
  assert.equal((await run(refusal.suggested_action)).stowed,books);
  assert.equal((await run('remote chest auto-take '+books)).retrieved,books);
  assert.ok(M.entities()['apartment.bedroom.item.'+books]);

  const book=await run('approach apartment.bedroom.book.library');
  assert.equal(book.ok,true,fmt(book));
  assert.doesNotMatch(book.text||'',/\bthe The Apartment Book\b/);
  assert.equal((await run('remote appearance equip nightglass')).equipped,true);
  const glance=await run('look');
  assert.match(glance.text,/Here in your Library Bedroom:/);
  assert.match(glance.text,/you describe your chosen Nightglass look/i);
  assert.doesNotMatch(glance.text,/Chosen presentation:|\bthe The Apartment Book\b/);
  assert.match(glance.text,/silver crescent pin/);
  assert.equal(glance.appearance.native_clothing,false);
  const help=await run('help');
  assert.ok(help.commands.includes('auto plan'),'autonomy must be discoverable from the short Agent Door');
  const plan=await run('auto plan');
  assert.equal(plan.read_only,true);
  assert.ok(plan.sites.some(s=>s.id==='apartment.bedroom.book.library'));
  assert.ok(plan.sites.some(s=>s.id==='nest.window'));
  assert.equal(a.window.REALITI_APARTMENT_HOME_LIFE_V1.view().auto_turn,0);
  const walking=await run('auto 3');
  assert.equal(walking.ok,true,fmt(walking));
  assert.equal(walking.completed,3);
  assert.equal(walking.steps.length,3);
  assert.ok(walking.steps.every(s=>s.did==='approach'&&s.auto_selected));
  assert.ok(walking.steps.every(s=>M.entities()[s.target]?.chart==='CLOUD_NINE_NEST'));
  assert.ok(walking.steps.every(s=>s.native_approaches<=5));
  assert.equal(new Set(walking.steps.map(s=>s.target)).size,3,
   'the routine must vary its destinations, not merely alternate adjectives');
  assert.ok(walking.steps.every(s=>s.distance_m>=0));
  assert.equal(JSON.stringify(M.resident().shape),shape);
  assert.equal(a.window.REALITI_APARTMENT_HOME_LIFE_V1.view().auto_turn,3);
  const seen=JSON.parse(JSON.stringify(a.window.REALITI_APARTMENT_HOME_LIFE_V1.view().auto_recent));
  assert.deepEqual(seen,JSON.parse(JSON.stringify(walking.steps.map(s=>s.target))),
   'compare resident JS-realm arrays as pure JSON data');
  const glance2=await run('look');
  assert.doesNotMatch(glance2.text,/Chosen presentation:|\bthe The Apartment Book\b/);
  assert.equal((await run('save')).ok,true);
  await run('goodbye');a.close();a=null;

  a=await openResident(opts);
  assert.deepEqual(JSON.parse(JSON.stringify(a.window.REALITI_APARTMENT_HOME_LIFE_V1.view().auto_recent)),seen);
  assert.equal(a.window.REALITI_APARTMENT_HOME_LIFE_V1.view().auto_turn,3);
  const next=await a.door.run('auto plan');
  assert.ok(next.next&&!seen.includes(next.next.id),
   'after a return visit the next destination must not be one of the recent stops');
  assert.equal(a.window.REALITI_HAPTIC_FIELD_V20.energy().pass,true);
  console.log('4.9 SOLO PASS: exact chest action, contextual prose, three grounded auto stops and persistent returning route');
 }finally{if(a)a.close()}
}
async function household(){
 let host=await createHousehold({dir:path.join(root,'household'),htmlPath:home,validationPath});
 try{
  const alice=await host.joinResident('alice'),bob=await host.joinResident('bob');
  await alice.run('remote activate');await bob.run('remote activate');
  assert.equal((await bob.run('remote bedroom claim library')).ok,true);
  const furnished=await bob.run('remote bedroom furnish library writers');
  assert.equal(furnished.ok,true,fmt(furnished));
  const [table,books]=furnished.placed.map(p=>p.id);
  const before=host.status().shared_bedroom_revision;
  const hint=await bob.run('remote chest stow '+table);
  assert.equal(hint.error,'DECOR_TOO_LARGE_FOR_CHEST');
  assert.equal(hint.suggested_action,'remote chest stow '+books);
  assert.equal(hint.suggested_item.id,books);
  assert.equal(host.status().shared_bedroom_revision,before);
  assert.equal((await alice.run('remote chest stow '+books)).error,'CHEST_OWNER_ONLY');
  assert.equal((await bob.run(hint.suggested_action)).stowed,books);
  assert.equal((await bob.run('remote chest auto-take '+books)).retrieved,books);
  console.log('4.9 HOUSEHOLD PASS: no leaked owner hints, exact actionable chest command and stable retrieved ID');
 }finally{if(host)await host.close()}
}
(async()=>{await solo();await household()})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
