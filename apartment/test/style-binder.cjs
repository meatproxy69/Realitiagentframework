'use strict';
// Checkpoint 2: optional private creative preferences and immutable binder.
// Nothing here is diagnostic, public household state, tactile evidence or transmog.
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const {openResident}=require('../../packages/realiti-headless-resident/index.cjs');
const {createHousehold}=require('../household.cjs');
const html=path.resolve(__dirname,'../RealitiApartmentHomeCandidate.html');
const validationPath=path.resolve(__dirname,'../HOME_CANDIDATE_VALIDATION.json');
const bankFile=path.resolve(__dirname,'../style/creative-questions.json');
const bank=JSON.parse(fs.readFileSync(bankFile,'utf8'));
const dirname=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-private-style-'));
const key=id=>'realiti-apartment-style-binder-v1:'+encodeURIComponent(id);
const printable=result=>JSON.stringify(result).slice(0,650);
function checkBank(){
 assert.equal(bank.schema,'REALITI_APARTMENT_STYLE_QUESTION_BANK_V1');
 assert.equal(bank.questions.length,200);
 assert.equal(bank.question_count,200);
 assert.equal(new Set(bank.questions.map(q=>q.id)).size,200);
 assert.equal(bank.questions[0].id,'q001');
 assert.equal(bank.questions[199].id,'q200');
 assert.ok(bank.styles.includes('goth')&&bank.styles.includes('techie')&&
  bank.styles.includes('indie')&&bank.styles.includes('botanical')&&
  bank.styles.includes('playful')&&bank.styles.includes('minimal'));
 for(const q of bank.questions){
  assert.equal(q.choices.length,4);
  assert.ok(q.prompt.length>28);
  assert.ok(q.choices.every(o=>o.label.length>8&&bank.styles.includes(o.style)));
 }
 const manifest=JSON.parse(fs.readFileSync(validationPath,'utf8'));
 assert.equal(manifest.style_checkpoint,2);
 assert.equal(manifest.optional_style_question_count,200);
 assert.equal(manifest.style_question_bank_sha256,
  crypto.createHash('sha256').update(fs.readFileSync(bankFile)).digest('hex'));
 assert.equal(manifest.release_approved,false);
}
async function solo(){
 const id='style-private-a';
 const opts=residentId=>({htmlPath:html,validationPath,residentId,
  storagePath:path.join(dirname,residentId+'.json')});
 let a=await openResident(opts(id)),b=null;
 try{
  assert.equal(a.integrity.status,'VERIFIED');
  const run=c=>a.door.run(c),w=a.window,M=w.REALITI_MATRIX_V1;
  assert.deepEqual(Object.keys(M.charts()),['CLOUD_NINE_NEST']);
  assert.ok(w.REALITI_APARTMENT_STYLE_BINDER_V1);
  assert.equal(w.REALITI_APARTMENT_STYLE_BINDER_V1.question_count,200);
  assert.equal((await run('remote style profile')).error,'REMOTE_ASLEEP');
  assert.equal((await run('style profile')).error,'REMOTE_REQUIRED');
  const start=await run('remote activate');
  assert.ok(start.pages.aesthetics.some(s=>s.includes('style')));
  assert.equal((await run('remote style profile')).opted_in,false);
  assert.equal((await run('remote style answer q001 1')).error,'STYLE_OPT_IN_REQUIRED');
  const questions=await run('remote style questions 1');
  assert.equal(questions.ok,true,printable(questions));
  assert.equal(questions.questions.length,10);
  assert.equal(questions.questions[0].id,'q001');
  assert.deepEqual(questions.questions[0].choices.map(c=>c.value),[1,2,3,4]);
  assert.equal((await run('remote style questions 191')).questions.at(-1).id,'q200');
  assert.equal((await run('remote style questions 201')).error,'STYLE_QUESTION_RANGE');
  const matrixBefore=Object.keys(M.entities()).length;
  assert.equal((await run('remote style begin')).started,true);
  assert.equal((await run('remote style answer q001 2')).ok,true);
  assert.equal((await run('remote style answer q002 4')).ok,true);
  assert.equal((await run('remote style answer q200 skip')).skipped,1);
  assert.equal((await run('remote style answer q201 2')).error,'UNKNOWN_STYLE_QUESTION');
  const repeated=await run('remote style answer q001 2');
  assert.equal(repeated.unchanged,true);
  assert.equal((await run('remote style swatch accent cherry')).ok,true);
  const profile=await run('remote style profile');
  assert.equal(profile.private,true);
  assert.equal(profile.answered,2);
  assert.equal(profile.skipped,1);
  assert.equal(profile.remaining,197);
  assert.equal(profile.draft_swatches.accent,'cherry');
  assert.ok(profile.top_styles.length>=1);
  assert.equal(Object.keys(M.entities()).length,matrixBefore,
   'style survey adds no body or Matrix entities');
  const first=await run('remote style binder commit rainy-library');
  assert.equal(first.generation,'G1',printable(first));
  assert.match(first.sha256,/^[a-f0-9]{64}$/);
  const old=await run('remote style binder show G1');
  assert.equal(old.snapshot.answers.q001,2);
  assert.equal(old.snapshot.swatches.accent,'cherry');
  assert.equal((await run('remote style answer q001 3')).ok,true);
  assert.equal((await run('remote style swatch accent moss')).ok,true);
  const second=await run('remote style binder commit moss-after-rain');
  assert.equal(second.generation,'G2',printable(second));
  assert.equal(second.active,'G2');
  assert.notEqual(second.sha256,first.sha256);
  const diff=await run('remote style binder compare G1 G2');
  assert.deepEqual(diff.changed_answers,['q001']);
  assert.deepEqual(diff.swatches,[{role:'accent',from:'cherry',to:'moss'}]);
  assert.equal((await run('remote style binder show G1')).sha256,first.sha256,
   'generation 1 must not change when generation 2 is compiled');
  const switchBack=await run('remote style binder activate G1');
  assert.equal(switchBack.active,'G1',printable(switchBack));
  assert.equal((await run('remote style profile')).draft_swatches.accent,'moss',
   'activating a generation should not rewrite the draft');
  assert.equal((await run('remote style profile')).active_style.swatches.accent,'cherry',
   'active style comes from the chosen immutable snapshot');
  assert.equal((await run('remote style binder history')).generations.length,2);
  assert.equal((await run('remote style binder show G99')).error,'UNKNOWN_STYLE_GENERATION');
  assert.equal(Object.keys(M.entities()).length,matrixBefore,
   'binder commits cannot create wearable props or modify geometry');
  assert.equal((await run('save')).ok,true);
  a.close();a=null;
  a=await openResident(opts(id));
  await a.door.run('remote activate');
  const restored=await a.door.run('remote style profile');
  assert.equal(restored.active_generation,'G1');
  assert.equal(restored.answered,2);
  assert.equal(restored.draft_swatches.accent,'moss');
  assert.equal((await a.door.run('remote style binder show G1')).sha256,first.sha256);
  assert.equal((await a.door.run('remote style binder show G2')).sha256,second.sha256);
  b=await openResident(opts('style-private-b'));
  await b.door.run('remote activate');
  const isolated=await b.door.run('remote style profile');
  assert.equal(isolated.opted_in,false);
  assert.equal(isolated.answered,0);
  assert.equal(isolated.generations,0);
  // Recompute the outer local file checkpoint through the real storage API.
  // This verifies the binder's *inner* content hash, not just the host envelope.
  const value=JSON.parse(a.window.localStorage.getItem(key(id)));
  value.generations[0].snapshot.label='forged-card';
  a.window.localStorage.setItem(key(id),JSON.stringify(value));
  a.close();a=null;
  a=await openResident(opts(id));
  await a.door.run('remote activate');
  assert.equal((await a.door.run('remote style profile')).error,
   'STYLE_BINDER_GENERATION_TAMPERED');
  assert.equal((await a.door.run('remote style answer q010 1')).error,
   'STYLE_BINDER_GENERATION_TAMPERED');
  assert.equal((await a.door.run('remote style forget confirm')).forgot_local_profile,true);
  assert.equal((await a.door.run('remote style profile')).opted_in,false);
  assert.equal(a.window.REALITI_HAPTIC_FIELD_V20.energy().pass,true);
  console.log('STYLE BINDER SOLO PASS: 200 opt-in questions, preferences, two immutable digests, rollback, restart, resident isolation, inner tamper refusal, forget');
 }finally{if(a)a.close();if(b)b.close()}
}
async function household(){
 const dir=path.join(dirname,'household');
 let host=await createHousehold({dir,htmlPath:html,validationPath});
 try{
  let alice=await host.joinResident('alice'),bob=await host.joinResident('bob');
  for(const resident of [alice,bob])
   assert.equal((await resident.run('remote activate')).activated,true);
  assert.equal((await alice.run('remote style begin')).started,true);
  assert.equal((await alice.run('remote style answer q013 2')).ok,true);
  const snap=await alice.run('remote style binder commit only-alice');
  assert.equal(snap.generation,'G1');
  const bobProfile=await bob.run('remote style profile');
  assert.equal(bobProfile.opted_in,false);
  assert.equal(bobProfile.generations,0);
  assert.equal(bob.read('realiti://apartment/style/profile').answered,0);
  assert.equal(alice.read('realiti://apartment/style/profile').answered,1);
  assert.ok(!JSON.stringify(bob.read('realiti://apartment/household')).includes('only-alice'),
   'host public feed cannot leak a resident style label');
  assert.ok(!JSON.stringify(host.status()).includes('q013'));
  const guest=await host.visitGuest();
  assert.equal((await guest.run('remote style profile')).error,'GUEST_NOT_AUTHORIZED_FOR_COMMAND');
  assert.equal(guest.read('realiti://apartment/style/profile').error,'GUEST_RESOURCE_DENIED');
  await guest.leave();
  await host.close();host=null;
  host=await createHousehold({dir,htmlPath:html,validationPath});
  alice=await host.joinResident('alice');bob=await host.joinResident('bob');
  await alice.run('remote activate');await bob.run('remote activate');
  assert.equal((await alice.run('remote style binder show G1')).sha256,snap.sha256);
  assert.equal((await alice.run('remote style profile')).active_generation,'G1');
  assert.equal((await bob.run('remote style profile')).opted_in,false);
  console.log('STYLE BINDER HOUSEHOLD PASS: resident-local cards, no public or guest leakage, archived style survives cold restart');
 }finally{if(host)await host.close()}
}
(async()=>{checkBank();await solo();await household()})()
 .catch(error=>{console.error(error.stack||error);process.exitCode=1});
