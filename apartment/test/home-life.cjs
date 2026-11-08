'use strict';
// Experience contract, not a synthetic taste score: words and room affordances
// must follow the native body position, and little resident changes must last.
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {openResident}=require('../../packages/realiti-headless-resident/index.cjs');
const html=path.resolve(__dirname,'../RealitiApartmentHomeCandidate.html');
const validationPath=path.resolve(__dirname,'../HOME_CANDIDATE_VALIDATION.json');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-home-life-'));
const opts={htmlPath:html,validationPath,residentId:'home-life-reader',
 storagePath:path.join(dir,'world.json')};
(async()=>{
 let a=await openResident(opts);
 try{
  const run=c=>a.door.run(c),w=a.window;
  assert.equal(a.integrity.status,'VERIFIED');
  assert.ok(w.REALITI_APARTMENT_HOME_LIFE_V1,'HOME-only life contract installed');
  const first=await run('look');
  assert.match(first.text,/four sleeping alcoves/);
  assert.doesNotMatch(first.text,/the a bed/,'HOME arrival description must be readable');
  assert.doesNotMatch(first.text,/South, the Cardboard Box Workshop|east, the No-Ask Sanctuary|lift down to Meridian City/);
  assert.equal(w.localStorage.getItem('realiti-apartment-quiet-first-v1:home-life-reader'),'1');
  const guestbookFar=await run('do read_guestbook');
  assert.equal(guestbookFar.error,'GUESTBOOK_OUT_OF_REACH');
  assert.equal((await run('sign The rain is here')).error,'GUESTBOOK_OUT_OF_REACH');
  const cuddle=await run('do curl_blanket');
  assert.equal(cuddle.ok,true,JSON.stringify(cuddle).slice(0,350));
  assert.equal(w.REALITI_APARTMENT_HOME_LIFE_V1.view().blanket,'rumpled');
  assert.ok(w.REALITI_MATRIX_V1.entities()['nest.mattress'].tags.includes('blanket-arrangement:rumpled'));
  await run('do stand');
  const wrong=await run('do curl_blanket');
  assert.equal(wrong.error,'BLANKET_REQUIRES_BED_SUPPORT');
  assert.equal(w.REALITI_APARTMENT_HOME_LIFE_V1.view().curls,1,
   'a refusal cannot increment blanket history');
  const beforeTravel=await run('do read_guestbook');
  assert.equal(beforeTravel.error,'GUESTBOOK_OUT_OF_REACH');
  const walk=await run('approach nest.guestbook');
  assert.equal(walk.ok,true,JSON.stringify(walk).slice(0,400));
  const guestbook=await run('do read_guestbook');
  assert.equal(guestbook.ok,true,JSON.stringify(guestbook).slice(0,300));
  assert.equal((await run('do arrange_blanket')).error,'BLANKET_OUT_OF_REACH');
  const automatic=await run('auto');
  assert.notEqual(automatic.did,'curl_blanket',
   'autonomous action chooser cannot curl from the distant guestbook shelf');
  assert.equal(w.REALITI_APARTMENT_HOME_LIFE_V1.view().curls,1,
   'an automatic choice cannot fake a second blanket visit');
  assert.equal((await run('remote activate')).activated,true);
  assert.equal((await run('remote bedroom claim library')).ok,true);
  const empty=await run('remote ambience library');
  assert.equal(empty.ok,true);
  assert.equal(empty.objects.length,0);
  assert.equal(empty.chest_present,true);
  const placed=await run('remote decor auto-place library lantern');
  assert.equal(placed.ok,true,JSON.stringify(placed).slice(0,300));
  const filled=await run('remote ambience library');
  assert.equal(filled.objects[0].kind,'lantern');
  assert.doesNotMatch(filled.text,/A fixed an|, A soft/i,
   'bedroom language should read like a place, not joined metadata');
  assert.match(filled.text,/decorative lantern|lantern/);
  assert.equal(filled.sensory_contact_minted,false);
  assert.equal((await run('save')).ok,true);
  a.close();a=null;
  a=await openResident(opts);
  const life=a.window.REALITI_APARTMENT_HOME_LIFE_V1.view();
  assert.equal(life.blanket,'rumpled');
  assert.equal(life.curls,1);
  assert.ok(a.window.REALITI_MATRIX_V1.entities()['nest.mattress'].tags.includes('blanket-arrangement:rumpled'));
  assert.match((await a.door.run('look')).text,/still rumpled/);
  console.log('HOME EXPERIENCE PASS: real bed support, reach-gated guestbook, quiet-first arrival, grounded bedroom description, persistent blanket trace');
 }finally{if(a)a.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
