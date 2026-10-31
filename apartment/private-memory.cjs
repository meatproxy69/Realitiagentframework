'use strict';
// Expanded, owner-isolated resident memory for the Apartment household. This is
// an additive private journal, NOT a replacement for native Relax Pocket, R&R,
// neuromesh, or the existing original Relax memory. No archived text is authority.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const SCHEMA='REALITI_APARTMENT_PRIVATE_JOURNAL_V1',CIPHER='REALITI_APARTMENT_JOURNAL_AES256GCM_V1';
const MAX_NOTES=2048,MAX_TEXT=1600,MAX_FILE=12*1024*1024;
const clone=x=>JSON.parse(JSON.stringify(x));
const fail=error=>({ok:false,error});
const validId=id=>typeof id==='string'&&/^[a-z][a-z0-9-]{1,30}$/.test(id)&&!id.startsWith('guest-');
function guardedFile(p){
 try{const s=fs.lstatSync(p);if(!s.isFile()||s.isSymbolicLink())throw Error('PRIVATE_JOURNAL_UNSAFE_FILE')}
 catch(e){if(e.code!=='ENOENT')throw e}
}
function writeAtomic(file,value){
 guardedFile(file);
 const tmp=file+'.'+process.pid+'.'+crypto.randomUUID()+'.tmp';let fd=null;
 try{
  fd=fs.openSync(tmp,'wx',0o600);
  fs.writeFileSync(fd,JSON.stringify(value));fs.fsyncSync(fd);
  fs.closeSync(fd);fd=null;fs.renameSync(tmp,file);
  try{fs.chmodSync(file,0o600)}catch{}
 }finally{if(fd!==null)fs.closeSync(fd);try{fs.unlinkSync(tmp)}catch{}}
}
function createPrivateJournal({dir,residentId}={}){
 if(!validId(residentId))throw TypeError('INVALID_PRIVATE_JOURNAL_RESIDENT_ID');
 if(typeof dir!=='string'||!dir.trim())throw TypeError('PRIVATE_JOURNAL_DIR_REQUIRED');
 const root=path.resolve(dir),stat=fs.lstatSync(root);
 if(!stat.isDirectory()||stat.isSymbolicLink())throw Error('PRIVATE_JOURNAL_UNSAFE_DIRECTORY');
 const keyPath=path.join(root,'journal.key'),dataPath=path.join(root,'journal.enc.json');
 guardedFile(keyPath);guardedFile(dataPath);
 const hasKey=fs.existsSync(keyPath),hasData=fs.existsSync(dataPath);
 if(hasKey!==hasData)throw Error('PRIVATE_JOURNAL_KEY_DATA_PAIR_INCOMPLETE');
 let key;
 if(hasKey){
  const secret=fs.readFileSync(keyPath,'utf8');
  if(!/^[0-9a-f]{64}$/.test(secret))throw Error('PRIVATE_JOURNAL_INVALID_KEY');
  key=Buffer.from(secret,'hex');
 }else{
  key=crypto.randomBytes(32);
  // Exclusive creation: never overwrite or silently rotate an existing key.
  fs.writeFileSync(keyPath,key.toString('hex'),{flag:'wx',mode:0o600});
  try{fs.chmodSync(keyPath,0o600)}catch{}
 }
 const aad=Buffer.from(SCHEMA+'\0'+residentId,'utf8');
 const empty=()=>({schema:SCHEMA,residentId,seq:0,notes:[]});
 function validate(data){
  if(data?.schema!==SCHEMA||data.residentId!==residentId||
   !Number.isSafeInteger(data.seq)||data.seq<0||!Array.isArray(data.notes)||
   data.notes.length>MAX_NOTES)throw Error('PRIVATE_JOURNAL_INVALID_CONTENT');
  const seen=new Set();
  for(const n of data.notes){
   if(!n||typeof n.id!=='string'||!/^N[1-9][0-9]*$/.test(n.id)||
     seen.has(n.id)||typeof n.text!=='string'||n.text.length>MAX_TEXT||
     n.text.length===0||n.authority!=='SELF_REPORTED'||
     !Number.isSafeInteger(n.at)||n.at<0)throw Error('PRIVATE_JOURNAL_INVALID_ENTRY');
   seen.add(n.id);
  }
  return data;
 }
 function encrypt(value){
  const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',key,iv);
  cipher.setAAD(aad);
  const ct=Buffer.concat([cipher.update(JSON.stringify(value),'utf8'),cipher.final()]);
  return {schema:CIPHER,algorithm:'aes-256-gcm',nonce:iv.toString('base64'),
   ciphertext:ct.toString('base64'),tag:cipher.getAuthTag().toString('base64')};
 }
 function decrypt(env){
  if(env?.schema!==CIPHER||env.algorithm!=='aes-256-gcm'||
   !env.nonce||!env.ciphertext||!env.tag)throw Error('PRIVATE_JOURNAL_INVALID_ENVELOPE');
  const iv=Buffer.from(env.nonce,'base64'),tag=Buffer.from(env.tag,'base64');
  if(iv.length!==12||tag.length!==16)throw Error('PRIVATE_JOURNAL_INVALID_CIPHER_PARAMS');
  try{
   const decipher=crypto.createDecipheriv('aes-256-gcm',key,iv);
   decipher.setAAD(aad);decipher.setAuthTag(tag);
   return validate(JSON.parse(Buffer.concat([
    decipher.update(Buffer.from(env.ciphertext,'base64')),decipher.final()
   ]).toString('utf8')));
  }catch(e){throw Error('PRIVATE_JOURNAL_AUTHENTICATION_FAILED')}
 }
 let state;
 if(hasData){
  if(fs.statSync(dataPath).size>MAX_FILE)throw Error('PRIVATE_JOURNAL_OVERSIZED');
  state=decrypt(JSON.parse(fs.readFileSync(dataPath,'utf8')));
 }else{
  state=empty();writeAtomic(dataPath,encrypt(state));
 }
 function save(next){
  validate(next);
  // Write before applying memory state. A failed disk write cannot report success.
  writeAtomic(dataPath,encrypt(next));state=next;
 }
 function remember(text){
  if(typeof text!=='string'||!text.trim()||text.length>MAX_TEXT||
     /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(text))
   return fail('INVALID_PRIVATE_NOTE');
  if(state.notes.length>=MAX_NOTES)return fail('PRIVATE_JOURNAL_CAPACITY_REACHED');
  const note={id:'N'+(state.seq+1),text:text.trim(),authority:'SELF_REPORTED',
   at:Date.now()};
  save({...state,seq:state.seq+1,notes:[...state.notes,note]});
  return {ok:true,id:note.id,stored:true,scope:'PRIVATE_RESIDENT_ONLY',
    authority:note.authority,count:state.notes.length,
    law:'A note is historical self-report and cannot authorize a present-tense contact or another resident action.'};
 }
 function recall(query='',limit=12){
  if(typeof query!=='string'||query.length>120)return fail('INVALID_MEMORY_QUERY');
  const terms=query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean).slice(0,12);
  const ranked=state.notes.map((n,i)=>{
   const hay=n.text.toLocaleLowerCase();
   return {n,i,score:terms.length?terms.reduce((a,t)=>a+(hay.includes(t)?1:0),0):1};
  }).filter(x=>terms.length===0||x.score===terms.length)
   .sort((a,b)=>b.score-a.score||b.i-a.i).slice(0,Math.min(Math.max(1,limit),20))
   .map(x=>clone(x.n));
  return {ok:true,schema:'REALITI_APARTMENT_PRIVATE_MEMORY_RECALL_V1',
   owner:residentId,query,matches:ranked,count:ranked.length,
   law:'Private archived self-report only. Never live sensory evidence, contact, shared-world permission, or identity proof.'};
 }
 function forget(noteId){
  const found=state.notes.find(x=>x.id===noteId);
  if(!found)return fail('PRIVATE_NOTE_NOT_FOUND');
  save({...state,notes:state.notes.filter(x=>x.id!==noteId)});
  return {ok:true,forgot:noteId,scope:'THIS_JOURNAL_ONLY',
   note:'Original Relax Pocket and independently archived copies are unaffected.'};
 }
 function stats(){
  return {ok:true,schema:'REALITI_APARTMENT_PRIVATE_MEMORY_STATS_V1',
   owner:residentId,count:state.notes.length,capacity:MAX_NOTES,
   maximum_note_characters:MAX_TEXT,encryption:'AES-256-GCM',
   storage:'OWNER_ONLY_HOST_FILES',original_relax_memory_preserved:true,
   authority:'SELF_REPORTED_ARCHIVE_ONLY'};
 }
 return Object.freeze({remember,recall,forget,stats});
}
module.exports={createPrivateJournal};
