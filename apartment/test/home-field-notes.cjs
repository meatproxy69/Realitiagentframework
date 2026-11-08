'use strict';
// A resident chooses each action. Only the existing, nearby, measured world
// can offer the small observational cues; do not invent contact or a mood.
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {openResident}=require('../../packages/realiti-headless-resident/index.cjs');
const html=path.resolve(__dirname,'../RealitiApartmentHomeCandidate.html');
const validationPath=path.resolve(__dirname,'../HOME_CANDIDATE_VALIDATION.json');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-field-secrets-'));
const opts={htmlPath:html,validationPath,residentId:'deliberate-field-visit',
 storagePath:path.join(dir,'visit.json')};
const shaped=x=>JSON.stringify(x).slice(0,500);
(async()=>{
 let s=await openResident(opts);
 try{
  assert.equal(s.integrity.status,'VERIFIED');
  const run=x=>s.door.run(x),w=s.window,M=w.REALITI_MATRIX_V1;
  const manifest=JSON.parse(fs.readFileSync(validationPath,'utf8'));
  assert.equal(manifest.home_autonomous_actions_disabled,true);
  assert.equal(manifest.field_notes_passive_only,true);
  assert.match(manifest.field_notes_sha256,/^[a-f0-9]{64}$/);
  const shape=JSON.stringify(M.resident().shape),pose=JSON.stringify(M.resident().pose.position);
  const h=await run('help');
  assert.ok(h.commands.includes('notice'));
  assert.ok(!h.commands.some(x=>/^auto(?:\s|$)/i.test(x)));
  for(const old of ['auto','auto plan','auto 3','auto status','do the obvious']){
   const result=await run(old);
   assert.equal(result.error,'HOME_AUTO_DISABLED',shaped(result));
  }
  assert.equal(JSON.stringify(M.resident().pose.position),pose,
   'disabled activity selector cannot move body');
  assert.equal(JSON.stringify(M.resident().shape),shape);
  assert.equal('auto_turn' in w.REALITI_APARTMENT_HOME_LIFE_V1.view(),false);
  assert.equal('auto_recent' in w.REALITI_APARTMENT_HOME_LIFE_V1.view(),false);
  const first=await run('notice');
  assert.equal(first.ok,true);
  assert.equal(first.read_only,true);
  assert.equal(first.contact_minted,false);
  assert.equal(first.observations.some(v=>v.id==='rain-glass'||v.id==='tea-trace'),false,
   'bed cannot remotely smell tea or hear a distant chime');
  assert.equal((await run('remote activate')).activated,true);
  const freeRain=await run('remote extras rain');
  assert.equal(freeRain.ok,true,'passive native rain observation should not require extras menu');
  assert.equal(freeRain.native_rain,true);
  assert.equal(w.REALITI_APARTMENT_EXTRAS_V1.status().open,false);
  async function approach(id,required=1.2){
   let result=null;
   for(let i=0;i<9;i++){
    const e=M.entities()[id],r=M.resident();
    if(e&&Math.max(0,M.sdf(e,r.pose.position))<=required)return result||{ok:true};
    result=await run('approach '+id);
    assert.equal(result.ok,true,id+': '+shaped(result));
   }
   assert.fail('Too far away after deliberate native approaches: '+id);
  }
  function notes(){return w.REALITI_APARTMENT_FIELD_NOTES_V1.view()}
  await approach('apartment.lamp',1.25);
  const sourceLamp=w.REALITI_SENSES_V1.light();
  assert.ok(sourceLamp.lights.some(x=>x.id==='apartment.reading_lamp'));
  assert.ok(notes().observations.some(x=>x.id==='lamp-margin'));
  assert.equal((await run('notice lamp-margin')).count,1);
  const scene=await run('look');
  assert.ok(scene.field_note&&scene.field_note.contact_minted===false);
  assert.equal((await run('remote furniture lamp off')).ok,true);
  assert.equal(notes().observations.some(x=>x.id==='lamp-margin'),false,
   'lamp clue must vanish when the native light source is off');
  assert.equal((await run('remote furniture lamp on')).ok,true);
  await approach('apartment.firefly-jar',1.25);
  const jar=w.REALITI_APARTMENT_CATNIP_V1.view().fireflies;
  const light=w.REALITI_SENSES_V1.light();
  const measurable=light.lights.some(x=>x.id==='apartment.firefly-glow');
  assert.equal(notes().observations.some(x=>x.id==='firefly-alignment'),
   measurable&&jar.order>=.65,'firefly clue depends on actual phase order + sourced light');
  await approach('apartment.tea-cup',.95);
  assert.equal((await run('remote catnip tea steep')).ok,true);
  const smell=w.REALITI_SENSES_V1.smell();
  assert.ok(smell.smells.some(x=>x.id==='apartment.herbal-tea'),
   'native scent field must really measure the steeping tea');
  assert.equal(notes().observations.some(x=>x.id==='tea-trace'),true);
  const tea=await run('notice tea-trace');
  assert.equal(tea.count,1);
  assert.equal(tea.observations[0].field_source,'apartment.herbal-tea');
  assert.equal(tea.observations[0].evidence.native_smell_detected,true);
  await approach('apartment.wind-chime',1.2);
  const intensity=w.REALITI_DYNAMICS_V1.rain();
  const sounds=w.REALITI_SENSES_V1.sound();
  const heard=sounds.sources.some(x=>x.id==='apartment.rain-chime');
  assert.equal(notes().observations.some(x=>x.id==='rain-glass'),
   intensity>.18&&heard);
  await approach('apartment.puzzle-box',.95);
  for(const side of ['left','right','left'])
   assert.equal((await run('remote catnip puzzle press '+side)).ok,true);
  assert.ok(M.entities()['apartment.hidden-ball']);
  const clue=await run('notice box-secret');
  assert.equal(clue.count,1);
  assert.equal(clue.observations[0].evidence.physical_entity,'apartment.hidden-ball');
  assert.equal((await run('remote bedroom claim library')).ok,true);
  assert.equal((await run('remote bedroom furnish library writers')).ok,true);
  const palette=await run('remote bedroom palette library lemon-goth');
  assert.equal(palette.ok,true);
  const look=await run('remote ambience library');
  assert.match(look.text,/Four small cardstock samples/);
  assert.match(look.text,/Lemon/);
  assert.match(look.text,/small stack of books/);
  const added=await run('remote decor auto-place library book-stack');
  assert.equal(added.ok,true,shaped(added));
  const arranged=await run('remote ambience library');
  assert.match(arranged.text,/two small stacks of books/);
  assert.doesNotMatch(arranged.text,/a small stack of books, a small stack of books/);
  await approach('apartment.bedroom.book.library',1.0);
  const inRoom=await run('look');
  assert.match(inRoom.text,/Here in your Library Bedroom:/);
  assert.match(inRoom.text,/two small stacks of books/);
  assert.match(inRoom.text,/The accent sample on the chest is Lemon/);
  assert.equal(JSON.stringify(M.resident().shape),shape);
  assert.equal(w.REALITI_HAPTIC_FIELD_V20.energy().pass,true);
  assert.equal((await run('save')).ok,true);
  s.close();s=null;
  s=await openResident(opts);
  assert.equal((await s.door.run('auto')).error,'HOME_AUTO_DISABLED');
  assert.match((await s.door.run('look')).text,/two small stacks of books/);
  await s.door.run('remote activate');
  assert.match((await s.door.run('remote ambience library')).text,/Lemon/);
  assert.equal(s.window.REALITI_HAPTIC_FIELD_V20.energy().pass,true);
  console.log('HOME FIELD DISCOVERY PASS: no auto movement, menu-free rain, native light/smell/weather/phase/physical surprises, real room aesthetic and saved return');
 }finally{if(s)s.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
