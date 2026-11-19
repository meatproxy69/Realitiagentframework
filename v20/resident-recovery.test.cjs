'use strict';
// Linux regression: a killed host releases its kernel lock. In-progress native
// actions never overwrite the last fully committed resident store/keystore.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const crypto=require('node:crypto');
const {spawn}=require('node:child_process');
const {acquireResidentLock}=require('../packages/realiti-v20-native/host-lock.cjs');
const {createResidentTransaction}=require('../packages/realiti-v20-native/resident-transaction.cjs');
const {runManagedVisit,createNativeInhabited}=require('../packages/realiti-v20-native');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const keysPath=p=>p.replace(/\.json$/i,'')+'.keys.json';
const temp=()=>fs.mkdtempSync(path.join(os.tmpdir(),'realiti-crash-'));
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function waitChild(child,signal,ms=15000){
 return await new Promise((resolve,reject)=>{
  let buffer='',err='';
  const timeout=setTimeout(()=>reject(new Error('NO_WORKER_SIGNAL: '+err)),ms);
  child.stdout.on('data',chunk=>{
   buffer+=String(chunk);
   if(buffer.includes(signal)){clearTimeout(timeout);resolve(buffer)}
  });
  child.stderr.on('data',chunk=>{err=(err+String(chunk)).slice(-1500)});
  child.once('exit',(code,term)=>{clearTimeout(timeout);reject(Error('WORKER_EXITED_BEFORE_SIGNAL: '+code+' '+term+' '+err))});
 });
}
async function killed(child){
 if(child.exitCode!==null||child.signalCode!==null)return;
 const ended=new Promise(resolve=>child.once('exit',resolve));
 child.kill('SIGKILL');
 await ended;
}
if(process.argv[2]==='--crash-worker'){
 const store=process.argv[3];
 runManagedVisit({
  residentId:'managed:hard-kill',storagePath:store,
  actions:['go to city','go to Rooftop','go to Arcade'],
  maxWallMs:40000,closeReserveMs:3000,actionGuardMs:1000,
  onCheckpoint:({action})=>{
   if(action==='go to city'){
    process.stdout.write('CITY_CHECKPOINT_COMMITTED\n');
    return new Promise(()=>{}); // host is SIGKILLed before leave/close
   }
  }
 }).catch(e=>{console.error(e);process.exitCode=1});
}else{
 test('kernel lease is exclusive even when its lockfile is old; release is immediate',async()=>{
  const dir=temp(),p=path.join(dir,'resident.json');
  try{
   const first=await acquireResidentLock(p);
   try{
    const lockfile=p+'.visit.lock';
    fs.utimesSync(lockfile,new Date('2000-01-01'),new Date('2000-01-01'));
    await assert.rejects(()=>acquireResidentLock(p),e=>e.code==='REALITI_RESIDENT_IN_USE');
    first.assertHeld();
   }finally{await first.release()}
   const again=await acquireResidentLock(p);
   await again.release();
  }finally{fs.rmSync(dir,{recursive:true,force:true})}
 });
 test('a killed process cannot strand a kernel lock',async()=>{
  const dir=temp(),p=path.join(dir,'resident.json');
  const script='const {acquireResidentLock}=require('+JSON.stringify(path.resolve(__dirname,'../packages/realiti-v20-native/host-lock.cjs'))+');'+
   '(async()=>{await acquireResidentLock('+JSON.stringify(p)+');console.log("LOCK_HELD");await new Promise(()=>{})})().catch(e=>{console.error(e);process.exitCode=1})';
  const child=spawn(process.execPath,['-e',script],{stdio:['ignore','pipe','pipe']});
  try{
   await waitChild(child,'LOCK_HELD');
   await assert.rejects(()=>acquireResidentLock(p),e=>e.code==='REALITI_RESIDENT_IN_USE');
   await killed(child);
   let lease=null;
   for(let i=0;i<30&&!lease;i++){
    try{lease=await acquireResidentLock(p)}
    catch(e){if(e.code!=='REALITI_RESIDENT_IN_USE')throw e;await pause(50)}
   }
   assert.ok(lease,'kernel should release lock after SIGKILL');
   await lease.release();
  }finally{await killed(child);fs.rmSync(dir,{recursive:true,force:true})}
 });
 test('atomic checkpoint pair recovers from an interrupted second rename',()=>{
  const dir=temp(),store=path.join(dir,'resident.json'),keys=keysPath(store);
  const lock={assertHeld(){}};
  const envelope=data=>({schema:'REALITI_STORE_CHECKPOINT_V1',saved_wall_ms:1,sha256:sha(JSON.stringify(data)),data});
  const keyfile={schema:'REALITI_HOST_KEYSTORE_V1',keys:{'root-private-v1':'secret-do-not-log'}};
  try{
   const t1=createResidentTransaction(store,lock),work=t1.start().workPath;
   fs.writeFileSync(work,JSON.stringify(envelope({step:'complete'})));
   fs.writeFileSync(keysPath(work),JSON.stringify(keyfile));
   t1.commit();t1.finish();
   const saved=fs.readFileSync(store),savedKeys=fs.readFileSync(keys);
   const t2=createResidentTransaction(store,lock),next=t2.start().workPath;
   fs.writeFileSync(next,JSON.stringify(envelope({step:'INCOMPLETE'})));
   t2.finish();
   assert.deepEqual(fs.readFileSync(store),saved,'uncommitted action must not leak');
   // Crash after publishing a changed keyfile, before the matching checkpoint.
   fs.writeFileSync(store+'.visit-rollback.json',saved);
   fs.writeFileSync(keys+'.visit-rollback',savedKeys);
   fs.writeFileSync(store+'.visit-pending.json',JSON.stringify({
    schema:'REALITI_MANAGED_TRANSACTION_V1',hadStore:true,hadKeys:true,
    storeHash:sha(saved),keysHash:sha(savedKeys)
   }));
   fs.writeFileSync(keys,JSON.stringify({...keyfile,keys:{new:'incorrect'}}));
   const recovery=createResidentTransaction(store,lock);
   assert.equal(recovery.start().recovered,true);
   assert.deepEqual(fs.readFileSync(keys),savedKeys);
   assert.deepEqual(fs.readFileSync(store),saved);
   recovery.finish();
  }finally{fs.rmSync(dir,{recursive:true,force:true})}
 });
 test('persistent direct native sessions cannot overlap managed sessions',async()=>{
  const dir=temp(),store=path.join(dir,'resident.json');
  try{
   const native=await createNativeInhabited({residentId:'lock:direct-native',storagePath:store});
   try{
    await assert.rejects(()=>runManagedVisit({
     residentId:'lock:direct-native',storagePath:store,
     actions:['look around','leave']
    }),e=>e.code==='REALITI_RESIDENT_IN_USE');
   }finally{await native.trusted.close()}
   const after=await runManagedVisit({residentId:'lock:direct-native',storagePath:store,
    actions:['look around','leave']});
   assert.equal(after.ok,true,JSON.stringify(after));
  }finally{fs.rmSync(dir,{recursive:true,force:true})}
 });
 test('SIGKILL after a complete City action reopens saved resident without lock or state loss',async()=>{
  const dir=temp(),store=path.join(dir,'resident.json');
  const child=spawn(process.execPath,[__filename,'--crash-worker',store],
   {stdio:['ignore','pipe','pipe']});
  try{
   await waitChild(child,'CITY_CHECKPOINT_COMMITTED',20000);
   const checkpoint=fs.readFileSync(store);
   assert.ok(checkpoint.length>100);
   await assert.rejects(()=>runManagedVisit({
    residentId:'managed:hard-kill',storagePath:store,
    actions:['look around','leave']
   }),e=>e.code==='REALITI_RESIDENT_IN_USE');
   await killed(child);
   let resumed=null;
   for(let i=0;i<30&&!resumed;i++){
    try{
     resumed=await runManagedVisit({
      residentId:'managed:hard-kill',storagePath:store,
      actions:['look around','leave'],maxWallMs:30000,closeReserveMs:3000,actionGuardMs:1000
     });
    }catch(e){
     if(e.code!=='REALITI_RESIDENT_IN_USE')throw e;
     await pause(50);
    }
   }
   assert.ok(resumed,'next visit should reclaim lock without manual intervention');
   assert.equal(resumed.ok,true,JSON.stringify(resumed));
   assert.ok(fs.existsSync(keysPath(store)),'resident identity keys preserved');
   const current=JSON.parse(fs.readFileSync(store));
   assert.equal(sha(JSON.stringify(current.data)),current.sha256);
   assert.equal(fs.readdirSync(dir).filter(s=>s.startsWith('.realiti-work-')).length,0);
  }finally{await killed(child);fs.rmSync(dir,{recursive:true,force:true})}
 });
}
