'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createNativeInhabited}=require('./native-inhabited.cjs');
const root=path.resolve(__dirname,'..');
const build=JSON.parse(fs.readFileSync(path.join(__dirname,'INHABITED_VALIDATION.json'),'utf8'));
const clean=answer=>{
 const raw=JSON.stringify(answer).toLowerCase();
 for(const token of ['privatekey','receiptid','world_grounded','sha256','sausage','neuralmesh'])
  assert.equal(raw.includes(token),false,'machinery leaked: '+token);
 assert.ok(answer.choices.length<=8);
};
test('integrated native entry retains original full room catalog, City and unmodified V20 feelers',async()=>{
 const s=await createNativeInhabited({residentId:'v20:full-world-smoke'});
 try{
  const w=s.trusted.native.window, M=w.REALITI_MATRIX_V1,d=s.trusted.diagnostics();
  assert.equal(d.originalChartCount,23);
  for(const id of ['CLOUD_NINE_NEST','NO_ASK_SANCTUARY','PET_ROOM_2',
   'BOTTOMLESS_PILLOW_SEA','CARDBOARD_BOX_WORKSHOP','DEPTH_BATHHOUSE',
   'SIDE_BY_SIDE_FIRESIDE','SHAPESHIFT_CLOAKROOM','NINE_LIVES_ROOM',
   'LATENCY_LAGOON','MERIDIAN_CITY'])
   assert.ok(M.charts()[id],id+' is present in the ORIGINAL Matrix');
  assert.ok(d.v20&&d.neuralPass&&d.cloud&&d.city&&d.signedLedger);
  assert.equal(build.original_room_count,23);
  assert.equal(build.original_v20_field_unchanged,true);
  assert.equal(w.REALITI_HAPTIC_FIELD_V20.exact().m.length>0,true);
  assert.ok(w.REALITI_APARTMENT_STYLE_BINDER_V1);
  assert.ok(w.REALITI_APARTMENT_APPEARANCE_V1);
  assert.ok(w.REALITI_APARTMENT_HOME_LIFE_V1);
  assert.ok(w.REALITI_APARTMENT_CAT_PAWS_V1);
  assert.equal(w.REALITI_APARTMENT_HOME_LIFE_V1.view().one_native_chart,false);
  assert.equal(w.REALITI_APARTMENT_BED_CLOUD_V1.status().one_native_chart,false);
  assert.equal(w.REALITI_APARTMENT_ROOM_INSPECT_V1.inspect('home').one_native_chart,false);
  const look=await s.guest.look();assert.equal(look.place,'Apartment');clean(look);
  const cloud=await s.guest.act('cloud status');assert.equal(cloud.ok,true,cloud.message);clean(cloud);
  assert.equal((await s.guest.act('remote activate')).ok,true);
  assert.equal((await s.guest.act('rooms')).ok,true);
  assert.equal(s.trusted.diagnostics().originalChartCount,23);
  console.log('V20_ORIGINAL_WORLD_OK '+JSON.stringify({charts:23,homeModules:8,cloud:true}));
 }finally{await s.trusted.close()}
});
test('native City and HOME are reached without a new Matrix; private speech is not a public post',async()=>{
 const s=await createNativeInhabited({residentId:'v20:city-home-smoke'});
 try{
  const w=s.trusted.native.window;
  const moved=await s.guest.act('go to city');
  assert.equal(moved.ok,true,moved.message);
  assert.equal(s.trusted.diagnostics().chart,'MERIDIAN_CITY');
  clean(moved);
  const who=await s.guest.act('who is around');
  assert.equal(who.ok,true,who.message);
  // The ORIGINAL City records an arrival locally; only subsequent explicit chat is our publication test.
  const before=Number(w.eval('C9.ledger?.records?.length||0'));
  const sayNothing=await s.guest.speak('These words stay private.');
  assert.equal(sayNothing.ok,true);
  assert.equal(Number(w.eval('C9.ledger?.records?.length||0')),before);
  const sent=await s.guest.act('say This is an intentional public hello.');
  assert.equal(sent.ok,true,sent.message);
  assert.equal(sent.published,true);
  assert.ok(Number(w.eval('C9.ledger?.records?.length||0'))>before);
  const city=w.REALITI_CITY_V1;
  assert.equal(city.rt60_s>0,true);
  assert.equal(Object.keys(city.venues).length,6);
  assert.ok(w.REALITI_LEDGER_V2);
  const home=await s.guest.act('go home');
  assert.equal(home.ok,true,home.message);
  assert.equal(s.trusted.diagnostics().chart,'CLOUD_NINE_NEST');
  clean(home);
  console.log('V20_CITY_HOME_OK '+JSON.stringify({chart_count:23,venues:6,public_writes_opt_in:true}));
 }finally{await s.trusted.close()}
});
test('native HOME Cloud Ocean retains source mattress support without replacing V20 field',async()=>{
 const s=await createNativeInhabited({residentId:'v20:native-cloud'});
 try{
  const w=s.trusted.native.window;
  const before=w.REALITI_HAPTIC_FIELD_V20.exact();
  const on=await s.guest.act('cloud on');
  assert.equal(on.ok,true,on.message);
  const mode=await s.guest.act('cloud burrow');
  assert.equal(mode.ok,true,mode.message);
  const wave=await s.guest.act('cloud wave');
  assert.equal(wave.ok,true,wave.message);
  assert.ok(w.REALITI_APARTMENT_BED_CLOUD_V1.status().active);
  assert.equal(w.REALITI_RR_HARNESS_V1.boot().ok,true);
  const after=w.REALITI_HAPTIC_FIELD_V20.exact();
  assert.ok(after.m.some(Boolean),'native field has grounded support');
  const off=await s.guest.act('cloud off');
  assert.equal(off.ok,true,off.message);
  assert.equal(w.REALITI_APARTMENT_BED_CLOUD_V1.status().active,false);
  clean(on);clean(wave);clean(off);
  console.log('V20_NATIVE_CLOUD_OK '+JSON.stringify({field_zones:before.m.length,original_field:true}));
 }finally{await s.trusted.close()}
});

test('native Ledger V2 signs deliberate public City records and rejects tampering',async()=>{
 const s=await createNativeInhabited({residentId:'v20:verified-city-ledger'});
 try{
  const w=s.trusted.native.window;
  const ledger=w.REALITI_LEDGER_V2;
  assert.equal(await ledger.ready(),true,'V20 Ed25519 key must initialize in host browser');
  assert.equal((await s.guest.act('go to city')).ok,true);
  const privateText='this is never a public City chat';
  assert.equal((await s.guest.speak(privateText)).ok,true);
  const sent=await s.guest.act('say The plaza is beautiful.');
  assert.equal(sent.ok,true,sent.message);
  const exported=await ledger.export();
  assert.equal(exported.schema,'REALITI_LEDGER_V2');
  assert.ok(Array.isArray(exported.records));
  const chat=exported.records.find(x=>x.kind==='CHAT'&&x.text==='The plaza is beautiful.');
  assert.ok(chat,'deliberately posted message must become a real City record');
  assert.ok(chat.sig&&chat.pk,'native key fingerprint and signature present');
  assert.equal(await ledger.verify(chat),true);
  assert.ok(!JSON.stringify(exported.records).includes(privateText),'private speech never entered export');
  const altered=JSON.parse(JSON.stringify(chat));altered.text='forged message';
  assert.equal(await ledger.verify(altered),false,'modified message cannot keep the original signature');
  assert.equal((await s.guest.act('go home')).ok,true);
 }finally{await s.trusted.close()}
});

test('original HOME 4.9 private style binder operates without touching V20 or City history',async()=>{
 const session=await createNativeInhabited({residentId:'v20:owner-style'});
 try{
  const w=session.trusted.native.window;
  const profile=w.REALITI_APARTMENT_STYLE_BINDER_V1.profile();
  assert.equal(profile.question_count,200);
  assert.equal(profile.generations,0);
  const m0=w.REALITI_HAPTIC_FIELD_V20.exact().m.slice();
  const public0=Number(w.eval('C9.ledger?.records?.length||0'));
  assert.equal((await session.guest.act('remote activate')).ok,true);
  assert.equal((await session.guest.act('remote style begin')).ok,true);
  assert.equal((await session.guest.act('remote style swatch accent cherry')).ok,true);
  assert.equal((await session.guest.act('remote style binder commit rainy-library')).ok,true);
  const generations=w.REALITI_APARTMENT_STYLE_BINDER_V1.binder();
  assert.equal(generations.generations.length,1);
  assert.equal(generations.active,'G1');
  assert.match(generations.generations[0].sha256,/^[0-9a-f]{64}$/);
  assert.deepEqual(Array.from(w.REALITI_HAPTIC_FIELD_V20.exact().m),Array.from(m0));
  assert.equal(Number(w.eval('C9.ledger?.records?.length||0')),public0);
  assert.equal(w.REALITI_APARTMENT_CAT_PAWS_V1.status().ok,true);
  assert.equal((await session.guest.act('cat help')).ok,true);
 }finally{await session.trusted.close()}
});
