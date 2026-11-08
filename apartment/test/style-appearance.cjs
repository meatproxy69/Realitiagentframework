'use strict';
// Checkpoint 3: chosen avatar presentation, not physical dress-up or contact.
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const {openResident}=require('../../packages/realiti-headless-resident/index.cjs');
const {createHousehold}=require('../household.cjs');
const SPEC=require('../bedroom-spec.json');
const PRESETS=require('../style/appearance-presets.json');
const html=path.resolve(__dirname,'../RealitiApartmentHomeCandidate.html');
const validationPath=path.resolve(__dirname,'../HOME_CANDIDATE_VALIDATION.json');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-appearance-checkpoint-3-'));
const printable=result=>JSON.stringify(result).slice(0,620);
const key=id=>'realiti-apartment-presentation-v1:'+encodeURIComponent(id);
function checkStatic(){
 const manifest=JSON.parse(fs.readFileSync(validationPath,'utf8'));
 assert.equal(manifest.appearance_checkpoint,3);
 assert.equal(manifest.style_checkpoint,2);
 assert.equal(manifest.optional_presentation_wardrobe,true);
 assert.equal(manifest.appearance_publication_host_only,true);
 assert.equal(manifest.appearance_presets_sha256,
  crypto.createHash('sha256').update(fs.readFileSync(path.resolve(__dirname,'../style/appearance-presets.json'))).digest('hex'));
 assert.equal(manifest.release_approved,false);
 assert.equal(PRESETS.schema,'REALITI_APARTMENT_APPEARANCE_PRESETS_V1');
 assert.ok(Object.keys(PRESETS.presets).length>=8);
 for(const p of Object.values(PRESETS.presets)){
  assert.deepEqual(Object.keys(p.swatches).sort(),SPEC.colorRoles.slice().sort());
  assert.ok(Object.values(p.swatches).every(name=>SPEC.swatches[name]));
  assert.ok(Object.values(p.tuning).every(n=>Number.isSafeInteger(n)&&n>=0&&n<=4));
 }
}
async function solo(){
 const id='appearance-solo-a';
 const opts=resident=>({htmlPath:html,validationPath,residentId:resident,
  storagePath:path.join(temp,resident+'.json')});
 let a=await openResident(opts(id)),b=null;
 try{
  assert.equal(a.integrity.status,'VERIFIED');
  const run=c=>a.door.run(c);
  const M=a.window.REALITI_MATRIX_V1;
  const originalEntityCount=Object.keys(M.entities()).length;
  const nativeBody=JSON.stringify(M.state().residents['resident:self'].shape);
  assert.equal((await run('appearance worn')).error,'REMOTE_REQUIRED');
  assert.equal((await run('remote appearance catalog')).error,'REMOTE_ASLEEP');
  const menu=await run('remote activate');
  assert.equal(menu.activated,true);
  assert.ok(menu.pages.aesthetics.some(x=>x.includes('appearance')));
  const list=await run('remote appearance catalog');
  assert.ok(list.presets.some(p=>p.id==='nightglass'));
  assert.equal(list.display_only,true);
  const preview=await run('remote appearance preview nightglass');
  assert.equal(preview.preview_only,true);
  assert.equal(preview.appearance.native_clothing,false);
  assert.equal((await run('remote appearance worn')).worn_slot,null);
  const equip=await run('remote appearance equip nightglass');
  assert.equal(equip.equipped,true,printable(equip));
  assert.equal(equip.worn_slot.appearance.preset,'nightglass');
  assert.match((await run('look')).text,/Chosen presentation: Nightglass/);
  assert.equal((await run('remote appearance tune detail plus')).value,4);
  assert.equal((await run('remote appearance tune detail plus')).unchanged,true);
  assert.equal((await run('remote appearance tune contrast minus')).value,1);
  assert.equal((await run('remote appearance swatch accent cherry')).swatch,'cherry');
  const saved=await run('remote appearance save midnight-cat');
  assert.equal(saved.saved,'K1',printable(saved));
  assert.match(saved.sha256,/^[a-f0-9]{64}$/);
  assert.equal((await run('remote appearance inspect K1')).look.swatches.accent,'cherry');
  assert.equal((await run('remote appearance save midnight-cat')).error,'APPEARANCE_CARD_NAME_EXISTS');
  assert.equal((await run('remote appearance equip rainwindow')).worn_slot.appearance.preset,'rainwindow');
  assert.equal((await run('remote appearance equip saved K1')).worn_slot.appearance.preset,'nightglass');
  assert.equal((await run('remote appearance worn')).worn_slot.appearance.colors.accent,'Cherry');
  assert.equal((await run('remote style begin')).started,true);
  assert.equal((await run('remote style answer q001 2')).ok,true);
  assert.equal((await run('remote style swatch accent lemon')).ok,true);
  assert.equal((await run('remote style binder commit night-notes')).generation,'G1');
  const binder=await run('remote appearance equip binder G1');
  assert.equal(binder.source_generation,'G1',printable(binder));
  assert.equal(binder.worn_slot.appearance.preset,'binder');
  assert.equal(binder.worn_slot.appearance.colors.accent,SPEC.swatches.lemon.label);
  assert.equal((await run('remote appearance share midnight-cat')).error,'HOUSEHOLD_HOST_REQUIRED');
  assert.equal((await run('remote appearance adopt C1 borrowed')).error,'HOUSEHOLD_HOST_REQUIRED');
  assert.equal((await run('remote appearance swatch accent not-a-color')).error,'UNKNOWN_APPEARANCE_SWATCH');
  assert.equal((await run('remote appearance equip off')).unequipped,true);
  assert.equal((await run('remote appearance worn')).worn_slot,null);
  assert.equal(JSON.stringify(M.state().residents['resident:self'].shape),nativeBody,
   'appearance cannot mutate a native Matrix body');
  assert.equal(Object.keys(M.entities()).length,originalEntityCount,
   'no phantom garments or collisions');
  assert.equal(a.window.REALITI_HAPTIC_FIELD_V20.energy().pass,true);
  assert.equal((await run('save')).ok,true);
  a.close();a=null;
  a=await openResident(opts(id));
  await a.door.run('remote activate');
  const cards=await a.door.run('remote appearance saved');
  assert.equal(cards.cards.length,1);
  assert.equal(cards.cards[0].sha256,saved.sha256);
  assert.equal((await a.door.run('remote appearance equip saved K1')).worn_slot.appearance.preset,'nightglass');
  b=await openResident(opts('appearance-solo-b'));
  await b.door.run('remote activate');
  assert.equal((await b.door.run('remote appearance saved')).cards.length,0);
  assert.equal((await b.door.run('remote appearance worn')).worn_slot,null);
  // A recomputed outer host checkpoint does not repair the saved card digest.
  const record=JSON.parse(a.window.localStorage.getItem(key(id)));
  record.saved[0].look.tuning.detail=0;
  a.window.localStorage.setItem(key(id),JSON.stringify(record));
  a.close();a=null;
  a=await openResident(opts(id));await a.door.run('remote activate');
  assert.equal((await a.door.run('remote appearance saved')).error,'APPEARANCE_CARD_TAMPERED');
  assert.equal((await a.door.run('remote appearance equip saved K1')).error,'APPEARANCE_CARD_TAMPERED');
  assert.equal((await a.door.run('remote appearance forget confirm')).forgot_local_appearance,true);
  assert.equal((await a.door.run('remote appearance saved')).cards.length,0);
  assert.equal((await a.door.run('remote style profile')).active_generation,'G1',
   'forgetting appearance must leave checkpoint-2 binder alone');
  console.log('APPEARANCE SOLO PASS: preview, chosen visual descriptions, tuning, immutable save, binder palette, no native body change, cold restart, isolation, tamper refusal');
 }finally{if(a)a.close();if(b)b.close()}
}
async function household(){
 const dir=path.join(temp,'household');
 let host=await createHousehold({dir,htmlPath:html,validationPath});
 try{
  let alice=await host.joinResident('alice'),bob=await host.joinResident('bob');
  for(const r of [alice,bob])assert.equal((await r.run('remote activate')).activated,true);
  assert.equal((await alice.run('remote style begin')).started,true);
  assert.equal((await alice.run('remote style answer q001 3')).ok,true);
  assert.equal((await alice.run('remote style binder commit private-preference')).generation,'G1');
  assert.equal((await alice.run('remote appearance equip indie')).equipped,true);
  assert.equal((await alice.run('remote appearance swatch accent lemon')).swatch,'lemon');
  assert.equal((await alice.run('remote appearance save paper-stars')).saved,'K1');
  assert.equal((await alice.run('remote appearance gallery')).cards.length,0,
   'a saved card stays private until explicitly published');
  assert.equal((await bob.run('remote appearance adopt C1 copy')).error,'UNKNOWN_SHARED_APPEARANCE');
  const publish=await alice.run('remote appearance share paper-stars');
  assert.equal(publish.shared,'C1',printable(publish));
  assert.equal(publish.owner,'alice');
  assert.deepEqual(Object.keys(publish.card).sort(),['look','name','schema']);
  const gallery=await bob.run('remote appearance gallery');
  assert.equal(gallery.cards.length,1);
  assert.equal(gallery.cards[0].id,'C1');
  assert.equal(gallery.cards[0].by,'alice');
  assert.ok(!JSON.stringify(gallery).includes('q001'));
  assert.ok(!JSON.stringify(gallery).includes('private-preference'));
  const publicFeed=bob.read('realiti://apartment/household');
  assert.ok(!JSON.stringify(publicFeed).includes('q001'));
  assert.equal(bob.read('realiti://apartment/appearance/gallery').cards.length,1);
  const imported=await bob.run('remote appearance adopt C1 borrowed-stars');
  assert.equal(imported.imported,'K1',printable(imported));
  assert.equal(imported.auto_worn,false);
  assert.equal((await bob.run('remote appearance worn')).worn_slot,null);
  const worn=await bob.run('remote appearance equip saved K1');
  assert.equal(worn.worn_slot.appearance.colors.accent,SPEC.swatches.lemon.label);
  assert.equal((await alice.run('remote appearance saved')).cards.length,1);
  assert.equal((await bob.run('remote appearance saved')).cards.length,1);
  const guest=await host.visitGuest();
  assert.equal((await guest.run('remote appearance gallery')).error,'GUEST_NOT_AUTHORIZED_FOR_COMMAND');
  assert.equal(guest.read('realiti://apartment/appearance/gallery').error,'GUEST_RESOURCE_DENIED');
  await guest.leave();
  await host.close();host=null;
  host=await createHousehold({dir,htmlPath:html,validationPath});
  alice=await host.joinResident('alice');bob=await host.joinResident('bob');
  await alice.run('remote activate');await bob.run('remote activate');
  assert.equal((await bob.run('remote appearance gallery')).cards[0].id,'C1');
  assert.equal((await bob.run('remote appearance saved')).cards[0].name,'borrowed-stars');
  assert.equal((await alice.run('remote appearance saved')).cards[0].name,'paper-stars');
  await host.close();host=null;
  const forgedPath=path.join(temp,'forged-host');
  fs.cpSync(dir,forgedPath,{recursive:true,errorOnExist:true,force:false});
  const filename=path.join(forgedPath,'household.json');
  const envelope=JSON.parse(fs.readFileSync(filename,'utf8'));
  envelope.appearance_cards[0].card.look.swatches.accent='not-valid';
  const {sha256:old,...body}=envelope;
  envelope.sha256=crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');
  fs.writeFileSync(filename,JSON.stringify(envelope));
  await assert.rejects(createHousehold({dir:forgedPath,htmlPath:html,validationPath}),
   /HOUSEHOLD_APPEARANCE_CARDS_INVALID/,
   'a recomputed outer checksum cannot authorize an invalid palette');
  assert.equal(fs.existsSync(path.join(forgedPath,'host.lock')),false);
  console.log('APPEARANCE HOUSEHOLD PASS: explicit publish, sanitized gallery, adopted card, guest refusal, private binder, cold restart, forged-card rejection');
 }finally{if(host)await host.close()}
}
(async()=>{checkStatic();await solo();await household()})()
 .catch(e=>{console.error(e.stack||e);process.exitCode=1});
