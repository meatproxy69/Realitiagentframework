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
  // Deliberately simulated native-support safety fixture, NOT a contact
  // event: the suggestion path must respect the removal gate's refusal.
  assert.equal((await run('do stand')).ok,true);
  const pillow=await run('remote decor auto-place library floor-pillow');
  assert.equal(pillow.ok,true,fmt(pillow));
  assert.equal((await run('remote chest stow '+books)).stowed,books);
  const bridge=a.window.REALITI_APARTMENT_BEDROOMS_V1;
  const occupant=M.state().residents['resident:self'],priorSupport=occupant.support;
  occupant.support='apartment.bedroom.item.'+pillow.placed;
  try{
   assert.equal(bridge.previewRemove(pillow.placed).error,'DECOR_ITEM_IN_USE');
   const beforeGuidance=bridge.view().revision;
   const guidance=bridge.handle('chest suggest library');
   assert.equal(guidance.read_only,true);
   assert.equal(guidance.available.length,0);
   assert.ok(guidance.blocked.some(item=>item.id===pillow.placed));
   assert.match(guidance.hint,/in use or unavailable/i);
   assert.equal(bridge.view().revision,beforeGuidance);
   const oversized=bridge.handle('chest stow '+table);
   assert.equal(oversized.error,'DECOR_TOO_LARGE_FOR_CHEST');
   assert.equal('suggested_action' in oversized,false,
    'never recommend an occupied item as a safe alternative');
   assert.equal(bridge.handle('chest stow '+pillow.placed).error,'DECOR_ITEM_IN_USE');
  }finally{occupant.support=priorSupport}
  const nowFree=await run('remote chest suggest library');
  assert.equal(nowFree.available.some(item=>item.id===pillow.placed),true);
  assert.equal((await run('remote chest auto-take '+books)).retrieved,books);

  const book=await run('approach apartment.bedroom.book.library');
  assert.equal(book.ok,true,fmt(book));
  assert.doesNotMatch(book.text||'',/\bthe The Apartment Book\b/);
  assert.equal((await run('remote appearance equip nightglass')).equipped,true);
  const glance=await run('look');
  assert.match(glance.text,/Here in your Library Bedroom:/);
  assert.match(glance.text,/Your Nightglass design uses long tailored lines/i);
  assert.doesNotMatch(glance.text,/Chosen presentation:|\bthe The Apartment Book\b/);
  assert.match(glance.text,/silver crescent pin/);
  assert.equal(glance.appearance.native_clothing,false);
  const here=a.window.Realiti.read('realiti://here');
  if(typeof here?.text==='string')
   assert.doesNotMatch(here.text,/\bthe The Apartment Book\b/);
  const help=await run('help');
  assert.ok(!help.commands.some(x=>/^auto(?:\s|$)/i.test(x)),
   'HOME must not advertise an action chooser');
  for(const command of ['auto','auto plan','auto 3','do the obvious'])
   assert.equal((await run(command)).error,'HOME_AUTO_DISABLED');
  assert.equal((await run('approach nest.window')).ok,true,
   'resident deliberately chooses a destination');
  assert.equal(JSON.stringify(M.resident().shape),shape);
  const glance2=await run('look');
  assert.doesNotMatch(glance2.text,/Chosen presentation:|\bthe The Apartment Book\b/);
  assert.equal((await run('save')).ok,true);
  await run('goodbye');a.close();a=null;

  a=await openResident(opts);
  assert.equal((await a.door.run('auto')).error,'HOME_AUTO_DISABLED');
  assert.equal((await a.door.run('approach apartment.bedroom.book.library')).ok,true,
   'the resident chooses its own return visit');
  assert.equal(a.window.REALITI_HAPTIC_FIELD_V20.energy().pass,true);
  console.log('4.9 SOLO PASS: exact chest action, contextual prose, resident-directed movement and manual return');
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
