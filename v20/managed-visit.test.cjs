'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {runManagedVisit,createNativeInhabited}=require('../packages/realiti-v20-native');

test('managed visit skips unsafe remainder, leaves, saves and permits a new visit',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-managed-'));
 const store=path.join(dir,'disposable.json');
 try{
  const first=await runManagedVisit({
   residentId:'managed:deadline',storagePath:store,
   actions:['go to city','go to Rooftop','go to Arcade','leave'],
   maxWallMs:15000,closeReserveMs:7000,actionGuardMs:10000
  });
  assert.equal(first.ok,true,JSON.stringify(first));
  assert.equal(first.ended,true);
  assert.equal(first.checkpoint_saved,true);
  assert.equal(first.deadline_reached,true);
  assert.equal(first.results.length,4);
  assert.ok(first.results.slice(0,3).every(x=>x.skipped&&x.ok===false));
  assert.equal(first.results[3].action,'leave');
  assert.equal(first.results[3].ok,true);
  const resumed=await createNativeInhabited({residentId:'managed:deadline',storagePath:store});
  try{
   assert.equal(resumed.guest.arrival.place,'Apartment');
   assert.ok(resumed.guest.arrival.description.length>0);
  }finally{await resumed.trusted.close()}
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
test('managed guest batches execute chosen actions, never expose trusted host, and checkpoint',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-managed-'));
 const store=path.join(dir,'disposable.json');
 try{
  const result=await runManagedVisit({
   residentId:'managed:ordinary',storagePath:store,
   actions:['look around','rest','rooms','leave'],
   maxWallMs:45000,closeReserveMs:7000,actionGuardMs:5000
  });
  assert.equal(result.ok,true,JSON.stringify(result));
  assert.equal(result.deadline_reached,false);
  assert.deepEqual(result.results.map(x=>x.action),['look around','rest','rooms','leave']);
  assert.ok(result.results.every(x=>x.ok===true));
  assert.ok(result.results[0].message.length>8);
  assert.ok(result.results[2].message.includes('Cloud Nine Nest'));
  assert.equal(result.checkpoint_saved,true);
  assert.ok(!JSON.stringify(result).includes('privateKey'));
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
