'use strict';
// SOMA 3.3 encrypted private Pocket adapter for Node hosts.
// The original Relax Pocket V32 uses WebCrypto/IndexedDB, wrapped keys,
// resident identity and a much wider provenance system. This is a genuinely
// encrypted, authenticated, resident-scoped standalone equivalent for small
// private notes and observed events, NOT V32 wire-format compatibility.
// Node >=20. No external dependencies. AGPL-3.0-only.
const crypto=require('node:crypto');
const SCHEMA='REALITI_SOMA_SEALED_POCKET_V1',MAX_RECORDS=64;
const clone=x=>JSON.parse(JSON.stringify(x));
const id=x=>{
 if(typeof x!=='string'||!x.trim()||x.length>160)throw TypeError('INVALID_POCKET_ID');
 return x;
};
function masterKey(value){
 if(!(Buffer.isBuffer(value)||value instanceof Uint8Array)||value.length!==32)
  throw TypeError('POCKET_REQUIRES_HOST_OWNED_32_BYTE_MASTER_KEY');
 return Buffer.from(value);
}
function createSealedPocket({residentId,key,worldId='unscoped'}={}){
 const resident=id(residentId),world=id(worldId);
 const secret=masterKey(key);
 const salt=crypto.createHash('sha256').update('SOMA_POCKET_V1:scope').digest();
 const encKey=Buffer.from(crypto.hkdfSync('sha256',secret,salt,
   Buffer.from('sealed-resident:'+resident),32));
 secret.fill(0);
 let records=[],seq=0,tombstones=[];
 function aad(row){
  return Buffer.from([SCHEMA,resident,row.id,row.kind,row.worldId,row.seq].join('|'));
 }
 function seal(payload,{kind='SELF_NOTE',worldId=world}={}){
  if(!['SELF_NOTE','ARCHIVED_HOST_EVENT'].includes(kind))throw TypeError('INVALID_POCKET_KIND');
  id(worldId);
  if(payload==null||typeof payload!=='object'||Array.isArray(payload))
   throw TypeError('POCKET_PAYLOAD_OBJECT_REQUIRED');
  if(kind==='ARCHIVED_HOST_EVENT'&&(!payload.receiptId||!payload.cause))
   throw TypeError('POCKET_ARCHIVE_REQUIRES_RECEIPT');
  const plaintext=Buffer.from(JSON.stringify(payload));
  if(plaintext.length>4096)throw RangeError('POCKET_RECORD_TOO_LARGE');
  const row={id:'K'+(++seq),seq,kind,worldId,algorithm:'AES-256-GCM'};
  const nonce=crypto.randomBytes(12);
  const cipher=crypto.createCipheriv('aes-256-gcm',encKey,nonce);
  cipher.setAAD(aad(row));
  const ct=Buffer.concat([cipher.update(plaintext),cipher.final()]);
  row.nonce=nonce.toString('base64');row.ciphertext=ct.toString('base64');
  row.tag=cipher.getAuthTag().toString('base64');
  plaintext.fill(0);
  records.push(row);
  if(records.length>MAX_RECORDS){
   const old=records.shift();tombstones.push(old.id);
   if(tombstones.length>MAX_RECORDS)tombstones.shift();
  }
  return{ok:true,id:row.id,kind,worldId,encrypted:true};
 }
 function open(recordId){
  id(recordId);
  if(tombstones.includes(recordId))return null;
  const row=records.find(x=>x.id===recordId);
  if(!row)return null;
  const iv=Buffer.from(row.nonce,'base64'),ct=Buffer.from(row.ciphertext,'base64'),
    tag=Buffer.from(row.tag,'base64');
  if(iv.length!==12||tag.length!==16)throw Error('POCKET_CIPHERTEXT_INVALID');
  const decipher=crypto.createDecipheriv('aes-256-gcm',encKey,iv);
  decipher.setAAD(aad(row));decipher.setAuthTag(tag);
  let clear;
  try{clear=Buffer.concat([decipher.update(ct),decipher.final()]);}
  catch(e){throw Error('POCKET_AUTHENTICATION_FAILED')}
  try{return clone({recordId:row.id,kind:row.kind,originWorld:row.worldId,
    authority:row.kind==='ARCHIVED_HOST_EVENT'?'ARCHIVED_HOST_RECORD':'SELF_REPORTED',
    value:JSON.parse(clear.toString('utf8'))})}
  finally{clear.fill(0)}
 }
 function forget(recordId){
  id(recordId);const n=records.length;
  records=records.filter(x=>x.id!==recordId);
  if(n!==records.length&&!tombstones.includes(recordId))tombstones.push(recordId);
  if(tombstones.length>MAX_RECORDS)tombstones.shift();
  return{ok:true,removed:n-records.length,
   caution:'Forgetting this ciphertext does not securely erase backups'};
 }
 function snapshot(){
  return clone({schema:SCHEMA,version:1,residentId:resident,
   maxRecords:MAX_RECORDS,seq,records,tombstones,
   secretExported:false,keyDerivation:'HKDF-SHA256',
   encryption:'AES-256-GCM',
   law:'Encrypted private data; no archive mints current contact'});
 }
 function restore(data){
  if(!data||data.schema!==SCHEMA||data.residentId!==resident||
    !Array.isArray(data.records)||data.records.length>MAX_RECORDS||
    !Array.isArray(data.tombstones)||data.tombstones.length>MAX_RECORDS||
    !Number.isSafeInteger(data.seq)||data.seq<0||
    JSON.stringify(data).length>600000)
   throw TypeError('POCKET_CHECKPOINT_OR_IDENTITY_MISMATCH');
  const ids=new Set();
  for(const row of data.records){
   if(!row||typeof row!=='object'||!/^K[1-9][0-9]*$/.test(row.id)||
      !['SELF_NOTE','ARCHIVED_HOST_EVENT'].includes(row.kind)||
      !Number.isSafeInteger(row.seq)||row.seq<1||row.seq>data.seq||
      !row.worldId||typeof row.worldId!=='string'||row.worldId.length>160||
      row.algorithm!=='AES-256-GCM'||ids.has(row.id))
    throw TypeError('POCKET_CHECKPOINT_MALFORMED');
   ids.add(row.id);
   for(const prop of ['nonce','ciphertext','tag'])
    if(typeof row[prop]!=='string'||row[prop].length>12000)
     throw TypeError('POCKET_CHECKPOINT_MALFORMED');
  }
  // Validate every authenticated record BEFORE replacing local data.
  const previous={records,seq,tombstones};
  records=clone(data.records);seq=data.seq;tombstones=clone(data.tombstones);
  try{for(const row of records)open(row.id)}
  catch(e){records=previous.records;seq=previous.seq;tombstones=previous.tombstones;throw e}
  return{ok:true,records:records.length,authorityRestored:false};
 }
 function clear(){records=[];tombstones=[];return{ok:true,scope:'POCKET_ONLY',
   secureErase:false,externalBackupsRemainPossible:true}}
 const residentPort=Object.freeze({
  sealNote:text=>{
   if(typeof text!=='string'||!text.trim()||text.length>4096)
    throw TypeError('INVALID_PRIVATE_NOTE');
   return seal({text},{kind:'SELF_NOTE'});
  },
  open,forget,clear,
  list:()=>clone(records.map(x=>({id:x.id,kind:x.kind,worldId:x.worldId}))),
  checkpoint:snapshot
 });
 const host=Object.freeze({
  archive:({receiptId,cause,source,zone,worldId=world}={})=>
   seal({receiptId,cause,source,zone},{kind:'ARCHIVED_HOST_EVENT',worldId}),
  checkpoint:snapshot,restore
 });
 return Object.freeze({version:1,resident:residentPort,host,
   law:'AES-GCM authenticated resident-private storage; not Relax Pocket V32 wire compatibility'});
}
module.exports=Object.freeze({SCHEMA,MAX_RECORDS,createSealedPocket});
