'use strict';
// Optional Node-only durable adapter for resident PRIVATE SOMA checkpoints.
// Atomic mode-0600 files, resident-hashed filenames, corruption detection.
// This is NOT encryption, signature verification or a multi-tenant sandbox.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const SCHEMA='REALITI_SOMA_FILE_STORE_V1';
function createFileStore({directory,residentId,maxBytes=1024*1024}={}){
 if(typeof directory!=='string'||!directory.trim())throw TypeError('INVALID_DIRECTORY');
 if(typeof residentId!=='string'||!residentId.trim()||residentId.length>120)
   throw TypeError('INVALID_RESIDENT_ID');
 if(!Number.isSafeInteger(maxBytes)||maxBytes<1024||maxBytes>8*1024*1024)
   throw TypeError('INVALID_MAX_BYTES');
 const root=path.resolve(directory);
 const digest=s=>crypto.createHash('sha256').update(s).digest('hex');
 const file=path.join(root,digest(residentId)+'.json');
 function ensureDirectory(){
  fs.mkdirSync(root,{recursive:true,mode:0o700});
  const st=fs.lstatSync(root);
  if(!st.isDirectory()||st.isSymbolicLink())throw Error('UNSAFE_STORAGE_DIRECTORY');
  // The host owns this directory; permission changes are intentional.
  fs.chmodSync(root,0o700);
 }
 function checkFile(){
  try {
   const st=fs.lstatSync(file);
   if(!st.isFile()||st.isSymbolicLink())throw Error('UNSAFE_STORAGE_FILE');
   if(st.size>maxBytes)throw Error('CHECKPOINT_TOO_LARGE');
   return true;
  } catch(e) {
   if(e.code==='ENOENT')return false;
   throw e;
  }
 }
 function save(checkpoint){
  if(!checkpoint||typeof checkpoint!=='object'||Array.isArray(checkpoint)||
     checkpoint.residentId!==residentId)throw TypeError('CHECKPOINT_RESIDENT_MISMATCH');
  ensureDirectory();checkFile();
  const data=JSON.stringify(checkpoint);
  const payload=JSON.stringify({schema:SCHEMA,residentId,
    sha256:digest(data),checkpoint});
  if(Buffer.byteLength(payload)>maxBytes)throw Error('CHECKPOINT_TOO_LARGE');
  const temp=path.join(root,'.'+digest(residentId).slice(0,20)+'.'+
    process.pid+'.'+crypto.randomBytes(10).toString('hex')+'.tmp');
  let fd=null;
  try{
   fd=fs.openSync(temp,'wx',0o600);
   fs.writeFileSync(fd,payload,{encoding:'utf8'});
   fs.fsyncSync(fd);
   fs.closeSync(fd);fd=null;
   fs.renameSync(temp,file);
   fs.chmodSync(file,0o600);
   // Best-effort metadata durability where supported.
   try{const d=fs.openSync(root,'r');try{fs.fsyncSync(d)}finally{fs.closeSync(d)}}catch(e){}
   return {ok:true,path:file,bytes:Buffer.byteLength(payload),
     encrypted:false,checkpointOnly:true};
  }finally{
   if(fd!==null)fs.closeSync(fd);
   try{fs.unlinkSync(temp)}catch(e){if(e.code!=='ENOENT')throw e}
  }
 }
 function load(){
  ensureDirectory();
  if(!checkFile())return null;
  const raw=fs.readFileSync(file,'utf8');
  if(Buffer.byteLength(raw)>maxBytes)throw Error('CHECKPOINT_TOO_LARGE');
  let envelope;
  try{envelope=JSON.parse(raw)}catch(e){throw Error('CHECKPOINT_JSON_INVALID')}
  if(envelope?.schema!==SCHEMA||envelope.residentId!==residentId||
     typeof envelope.sha256!=='string'||!envelope.checkpoint||
     envelope.checkpoint.residentId!==residentId)
    throw Error('CHECKPOINT_IDENTITY_OR_FORMAT_INVALID');
  if(digest(JSON.stringify(envelope.checkpoint))!==envelope.sha256)
    throw Error('CHECKPOINT_CORRUPT');
  return JSON.parse(JSON.stringify(envelope.checkpoint));
 }
 function erase(){
  ensureDirectory();if(!checkFile())return {ok:true,removed:false};
  fs.unlinkSync(file);
  return {ok:true,removed:true,secureErasure:false};
 }
 return Object.freeze({save,load,erase,exists:()=>{ensureDirectory();return checkFile()},
   path:file,law:'Private checkpoint only. Corruption detection is not authentication or encryption.'});
}
module.exports=Object.freeze({SCHEMA,createFileStore});
