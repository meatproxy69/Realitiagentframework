'use strict';
// Host-only single-resident transaction journal. The native world writes only
// to an isolated work store; a completed action is published as one recoverable
// pair (checkpoint plus sealed-pocket keystore). A kill mid-action cannot publish.
// The caller MUST hold the kernel lock on the canonical storage path.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {keystorePathFor}=require('../realiti-headless-resident/index.cjs');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const fail=code=>{const e=new Error(code);e.code=code;throw e};
const exists=p=>fs.existsSync(p);
function regular(p){
 if(!exists(p))return false;
 const s=fs.lstatSync(p);
 if(!s.isFile()||s.isSymbolicLink())fail('REALITI_UNSAFE_RESIDENT_PATH');
 return true;
}
function read(p){regular(p);return fs.readFileSync(p)}
function verifyStore(bytes){
 let obj;try{obj=JSON.parse(bytes.toString('utf8'))}catch{fail('REALITI_CHECKPOINT_INVALID_JSON')}
 if(!obj||typeof obj!=='object'||Array.isArray(obj))fail('REALITI_CHECKPOINT_INVALID_SCHEMA');
 if(obj.schema==='REALITI_STORE_CHECKPOINT_V1'){
  if(!obj.data||typeof obj.data!=='object'||Array.isArray(obj.data)||
     hash(JSON.stringify(obj.data))!==obj.sha256)fail('REALITI_CHECKPOINT_INTEGRITY_MISMATCH');
 }else if('schema' in obj)fail('REALITI_CHECKPOINT_UNKNOWN_SCHEMA');
}
function verifyKeys(bytes){
 let obj;try{obj=JSON.parse(bytes.toString('utf8'))}catch{fail('REALITI_KEYSTORE_INVALID_JSON')}
 if(!obj||obj.schema!=='REALITI_HOST_KEYSTORE_V1'||!obj.keys||
    typeof obj.keys!=='object'||Array.isArray(obj.keys))fail('REALITI_KEYSTORE_INVALID_SCHEMA');
}
function writeNew(p,bytes){
 const fd=fs.openSync(p,'wx',0o600);
 try{fs.writeFileSync(fd,bytes);fs.fsyncSync(fd)}
 finally{fs.closeSync(fd)}
}
function fsyncDirectory(dir){
 const fd=fs.openSync(dir,'r');
 try{fs.fsyncSync(fd)}finally{fs.closeSync(fd)}
}
function safeUnlink(p){if(regular(p))fs.unlinkSync(p)}
function replaceFromBytes(p,bytes){
 const temp=p+'.visit-restore';
 safeUnlink(temp);
 writeNew(temp,bytes);fs.renameSync(temp,p);
}
function createResidentTransaction(storagePath,lock){
 const store=path.resolve(storagePath),keys=keystorePathFor(store);
 const work=store+'.visit-work.json',workKeys=keystorePathFor(work);
 const pending=store+'.visit-pending.json',prepare=pending+'.prepare';
 const rollback=store+'.visit-rollback.json',rollbackKeys=keys+'.visit-rollback';
 const fresh=store+'.visit-new.json',freshKeys=keys+'.visit-new';
 const dir=path.dirname(store);
 const paths=[work,workKeys,prepare,rollback,rollbackKeys,fresh,freshKeys];
 let ready=false,commits=0;
 function held(){lock.assertHeld()}
 function tidy(){for(const p of paths)safeUnlink(p)}
 function recover(){
  held();
  if(!regular(pending))return false;
  let txn;try{txn=JSON.parse(read(pending).toString('utf8'))}
  catch{fail('REALITI_PENDING_TRANSACTION_CORRUPT')}
  if(txn?.schema!=='REALITI_MANAGED_TRANSACTION_V1'||
     typeof txn.hadStore!=='boolean'||typeof txn.hadKeys!=='boolean')
   fail('REALITI_PENDING_TRANSACTION_INVALID');
  if(txn.hadStore){
   const bytes=read(rollback);
   if(hash(bytes)!==txn.storeHash)fail('REALITI_ROLLBACK_STORE_CORRUPT');
   verifyStore(bytes);
   replaceFromBytes(store,bytes);
  }else safeUnlink(store);
  if(txn.hadKeys){
   const bytes=read(rollbackKeys);
   if(hash(bytes)!==txn.keysHash)fail('REALITI_ROLLBACK_KEYS_CORRUPT');
   verifyKeys(bytes);
   replaceFromBytes(keys,bytes);
  }else safeUnlink(keys);
  fsyncDirectory(dir);
  safeUnlink(pending);
  fsyncDirectory(dir);
  return true;
 }
 function start(){
  held();
  fs.mkdirSync(dir,{recursive:true});
  const restored=recover();
  tidy();
  const hasStore=regular(store),hasKeys=regular(keys);
  if(hasStore!==hasKeys)fail('REALITI_RESIDENT_STORE_KEYSTORE_PAIR_MISSING');
  if(hasStore){
   const sb=read(store),kb=read(keys);
   verifyStore(sb);verifyKeys(kb);
   writeNew(work,sb);writeNew(workKeys,kb);
  }
  ready=true;
  return Object.freeze({workPath:work,recovered:restored});
 }
 function commit(){
  held();
  if(!ready)fail('REALITI_TRANSACTION_NOT_STARTED');
  const s=read(work),k=read(workKeys);
  verifyStore(s);verifyKeys(k);
  if(exists(pending))fail('REALITI_PENDING_TRANSACTION_REQUIRES_RECOVERY');
  const hadStore=regular(store),hadKeys=regular(keys);
  if(hadStore!==hadKeys)fail('REALITI_RESIDENT_STORE_KEYSTORE_PAIR_MISSING');
  const originalStore=hadStore?read(store):null,originalKeys=hadKeys?read(keys):null;
  // Stage durable new pair and durable rollback copies BEFORE publishing intent.
  tidy();
  writeNew(freshKeys,k);writeNew(fresh,s);
  if(originalStore)writeNew(rollback,originalStore);
  if(originalKeys)writeNew(rollbackKeys,originalKeys);
  const txn=Buffer.from(JSON.stringify({
   schema:'REALITI_MANAGED_TRANSACTION_V1',hadStore,hadKeys,
   storeHash:originalStore?hash(originalStore):null,
   keysHash:originalKeys?hash(originalKeys):null
  }));
  writeNew(prepare,txn);
  fs.renameSync(prepare,pending);
  fsyncDirectory(dir);
  // First publish the keystore (additional keys are harmless to prior state),
  // then the state. The rollback journal handles interruption between renames.
  fs.renameSync(freshKeys,keys);
  fs.renameSync(fresh,store);
  fsyncDirectory(dir);
  safeUnlink(pending);
  fsyncDirectory(dir);
  safeUnlink(rollback);safeUnlink(rollbackKeys);
  commits++;
  return true;
 }
 function finish(){
  held();
  if(exists(pending))recover();
  tidy();ready=false;
  return commits;
 }
 return Object.freeze({start,commit,finish,get commits(){return commits}});
}
module.exports=Object.freeze({createResidentTransaction});
