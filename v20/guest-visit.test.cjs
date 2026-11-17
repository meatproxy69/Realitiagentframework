'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createNativeInhabited}=require('./native-inhabited.cjs');

// These tests use the actual pinned 23-chart V20 world and disposable identities.
test('guest harness starts with an immediate native scene and executable choices',async()=>{
 const s=await createNativeInhabited({residentId:'guest:arrival-regression'});
 try{
  assert.ok(s.guest.arrival,'arrival cannot be silent');
  assert.equal(s.arrival,s.guest.arrival);
  assert.equal(s.arrival.place,'Apartment');
  assert.match(s.arrival.description,/Cloud Nine Nest/i);
  assert.match(s.arrival.description,/Doorways:/,'native exits may not be cut off at 750 characters');
  assert.ok(s.arrival.description.length>750);
  assert.ok(s.arrival.choices.length<=8);
  const before=Number(s.trusted.native.window.eval('C9.ledger?.records?.length||0'));
  const around=await s.guest.act('look around');
  assert.equal(around.ok,true,around.message);
  assert.match(around.message,/Doorways:/);
  for(const command of ['rooms','places','help','actions','remote activate']){
   const result=await s.guest.act(command);
   assert.equal(result.ok,true,command+': '+result.message);
   assert.ok(result.message.trim().length>8,command+' must be readable');
  }
  const wait=await s.guest.act('rest');
  assert.equal(wait.ok,true,wait.message);
  assert.equal(Number(s.trusted.native.window.eval('C9.ledger?.records?.length||0')),before,
   'arrival, actions, and rest must not post a City record');
 }finally{await s.trusted.close()}
});
test('guest room travel enters the actual destination, and focused look names objects',async()=>{
 const s=await createNativeInhabited({residentId:'guest:focus-and-travel'});
 try{
  const remote=await s.guest.act('look at remote');
  assert.equal(remote.ok,true,remote.message);
  assert.match(remote.message,/pocket remote/i);
  assert.doesNotMatch(remote.message,/d9344b5a|turn to face [a-f0-9]{8}\b/i);
  const puzzle=await s.guest.act('look at puzzle box');
  assert.equal(puzzle.ok,true,puzzle.message);
  assert.match(puzzle.message,/puzzle box/i);
  const wrong=await s.guest.act('look at water');
  assert.equal(wrong.ok,false,'a fuzzy tag cannot silently select a different object');
  const sanctuary=await s.guest.act('go to No-Ask Sanctuary');
  assert.equal(sanctuary.ok,true,sanctuary.message);
  assert.equal(s.trusted.diagnostics().chart,'NO_ASK_SANCTUARY');
  const home=await s.guest.act('go to Cloud Nine Nest');
  assert.equal(home.ok,true,home.message);
  assert.equal(s.trusted.diagnostics().chart,'CLOUD_NINE_NEST');
 }finally{await s.trusted.close()}
});
test('guest cloud controls follow actual posture and never invent contact',async()=>{
 const s=await createNativeInhabited({residentId:'guest:cloud-choices'});
 try{
  assert.ok(s.guest.arrival.choices.includes('cloud on'));
  const on=await s.guest.act('cloud on');
  assert.equal(on.ok,true,on.message);
  assert.ok(on.choices.includes('cloud off'));
  assert.ok(!on.choices.includes('cloud on'));
  const stand=await s.guest.act('stand up');
  assert.equal(stand.ok,true,stand.message);
  assert.ok(stand.choices.includes('lie down'));
  assert.ok(!stand.choices.includes('cloud on'));
  const refused=await s.guest.act('cloud on');
  assert.equal(refused.ok,false);
  assert.match(refused.message,/lie down/i);
  const lying=await s.guest.act('lie down');
  assert.equal(lying.ok,true,lying.message);
  assert.ok(lying.choices.includes('cloud on'));
  const resumed=await s.guest.act('cloud on');
  assert.equal(resumed.ok,true,resumed.message);
  assert.ok(resumed.choices.includes('cloud off'));
  const off=await s.guest.act('cloud off');
  assert.equal(off.ok,true,off.message);
  assert.equal(s.trusted.native.window.REALITI_APARTMENT_BED_CLOUD_V1.status().active,false);
 }finally{await s.trusted.close()}
});
