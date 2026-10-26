'use strict';
/* REALITI world-to-resident evidence seam.
 * Node Ed25519 authenticated, issuer-scoped, causal and replay guarded.
 * Authenticated receipt != physically true; only a trusted, qualified world
 * resolver may own the issuing key. Never treat WORLD_GROUNDED alone as proof.
 * AGPL-3.0-only.
 */
const crypto=require('node:crypto');
const VERSION='1.0.0',SCHEMA='REALITI_WORLD_EVIDENCE_V1';
const DOMAIN='REALITI_WORLD_EVIDENCE_V1\n';
const KINDS=new Set(['CONTACT_ACCEPTED','CONTACT_REFUSED','CONTACT_RELEASED',
 'MOVEMENT_RESOLVED','MOVEMENT_OBSTRUCTED','PORTAL_TRAVERSED']);
const SOURCES=new Set(['WORLD_GROUNDED','SELF_STARTED_WORLD_CONTACT','INVITED_COMPANION']);
const clone=x=>JSON.parse(JSON.stringify(x));
const id=(x,name,max=180)=>{
 if(typeof x!=='string'||!x||x.length>max||!/^[A-Za-z0-9._:/-]+$/.test(x))
   throw TypeError('INVALID_'+name);
 return x
};
const natural=(v,name,max=1e12)=>{
 if(!Number.isSafeInteger(v)||v<0||v>max)throw TypeError('INVALID_'+name);return v
};
const numeric=(v,name,min=0,max=1e9)=>{
 if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)throw TypeError('INVALID_'+name);
 return v
};
function canonical(value){
 if(value===null||typeof value!=='object')return JSON.stringify(value);
 if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
 return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';
}
function asPublicKey(key){return key?.type==='public'&&key.asymmetricKeyType?key:crypto.createPublicKey(key)}
function asPrivateKey(key){return key?.type==='private'&&key.asymmetricKeyType?key:crypto.createPrivateKey(key)}
function fingerprint(key){
 const pub=asPublicKey(key),bytes=pub.export({type:'spki',format:'der'});
 return crypto.createHash('sha256').update(bytes).digest('hex');
}
function publicKeyOf(privateKey){return asPublicKey(privateKey)}
function validate(payload){
 if(!payload||typeof payload!=='object'||Array.isArray(payload)||payload.schema!==SCHEMA)
   throw Error('BAD_EVIDENCE_SCHEMA');
 const p=payload;
 for(const k of ['worldId','sessionId','actorId','issuerId','keyId','eventId','receiptId','causeId'])
   id(p[k],k);
 natural(p.seq,'SEQ',Number.MAX_SAFE_INTEGER);
 if(p.seq<1)throw TypeError('INVALID_SEQ');
 natural(p.tMs,'TIME_MS');
 if(!KINDS.has(p.kind))throw Error('UNKNOWN_EVIDENCE_KIND');
 if(!SOURCES.has(p.source))throw Error('INVALID_EVIDENCE_SOURCE');
 if(!['ACCEPTED','REFUSED','RELEASED','RESOLVED','OBSTRUCTED','INCOMPLETE'].includes(p.result))
   throw Error('INVALID_RESOLVED_RESULT');
 if((p.kind==='CONTACT_ACCEPTED'&&p.result!=='ACCEPTED')||
    (p.kind==='CONTACT_REFUSED'&&p.result!=='REFUSED')||
    (p.kind==='CONTACT_RELEASED'&&p.result!=='RELEASED')||
    (p.kind==='MOVEMENT_RESOLVED'&&p.result!=='RESOLVED')||
    (p.kind==='PORTAL_TRAVERSED'&&p.result!=='RESOLVED')||
    (p.kind==='MOVEMENT_OBSTRUCTED'&&!['OBSTRUCTED','REFUSED','INCOMPLETE'].includes(p.result)))
   throw Error('KIND_RESULT_CONTRADICTION');
 if(p.zone!=null)id(p.zone,'ZONE');
 if(p.objectId!=null)id(p.objectId,'OBJECT_ID');
 if(p.material!=null){
  if(typeof p.material!=='string'||p.material.length>64)throw TypeError('INVALID_MATERIAL');
 }
 if(p.reason!=null){
  if(typeof p.reason!=='string'||p.reason.length>160)throw TypeError('INVALID_REASON');
 }
 numeric(p.leaseMs,'LEASE_MS',0,60000);
 if(p.kind==='CONTACT_ACCEPTED'){
  id(p.zone,'ZONE');id(p.objectId,'OBJECT_ID');
  numeric(p.intensity,'INTENSITY',0,1);
  if(!(p.leaseMs>0))throw Error('CONTACT_WITHOUT_LEASE');
 }else{
  if(p.leaseMs!==0)throw Error('NONCONTACT_LEASE_FORBIDDEN');
  if(p.kind==='CONTACT_RELEASED')id(p.zone,'ZONE');
 }
 if(!p.witness||typeof p.witness!=='object'||Array.isArray(p.witness))
   throw Error('SPATIAL_WITNESS_REQUIRED');
 const witnessJSON=canonical(p.witness);
 if(witnessJSON.length>4000)throw Error('SPATIAL_WITNESS_TOO_LARGE');
 if(['CONTACT_ACCEPTED','CONTACT_REFUSED'].includes(p.kind)){
  id(p.witness.chart,'WITNESS_CHART');
  if(!Array.isArray(p.witness.actorPosition)||p.witness.actorPosition.length!==3)
   throw Error('MISSING_ACTOR_POSITION_WITNESS');
  for(const value of p.witness.actorPosition)numeric(value,'WITNESS_POSITION',-1e8,1e8);
  if(p.kind==='CONTACT_ACCEPTED'){
   numeric(p.witness.surfaceDistanceM,'WITNESS_DISTANCE',0,10000);
   numeric(p.witness.reachM,'WITNESS_REACH',.05,3);
   if(p.witness.surfaceDistanceM>p.witness.reachM+.001||p.witness.occludedBy)
     throw Error('CONTACT_SPATIAL_CONTRADICTION');
  }
 }
 // Reject extra fields so a signature always has one unambiguous public schema.
 const allowed=new Set(['schema','worldId','sessionId','actorId','issuerId','keyId',
  'eventId','receiptId','causeId','seq','tMs','kind','result','source','zone',
  'objectId','material','intensity','leaseMs','reason','witness']);
 if(Object.keys(p).some(k=>!allowed.has(k)))throw Error('EVIDENCE_UNEXPECTED_FIELD');
 return p;
}
function createIssuer({issuerId,keyId,worldId,sessionId,actorId,privateKey}={}){
 for(const [key,value] of Object.entries({issuerId,keyId,worldId,sessionId,actorId}))id(value,key);
 const k=asPrivateKey(privateKey);
 if(k.asymmetricKeyType!=='ed25519')throw TypeError('ED25519_REQUIRED');
 let seq=0;
 const pub=crypto.createPublicKey(k),keyFingerprint=fingerprint(pub);
 function issue(resolution){
  if(!resolution||resolution.schema!=='REALITI_MATRIX_RESOLUTION_V1'||
     resolution.worldId!==worldId||resolution.sessionId!==sessionId||
     resolution.actorId!==actorId)throw Error('RESOLUTION_SCOPE_MISMATCH');
  const number=seq+1;
  const payload=clone({
   schema:SCHEMA,worldId,sessionId,actorId,issuerId,keyId,
   seq:number,eventId:worldId+':'+sessionId+':'+number,
   receiptId:resolution.receiptId,causeId:resolution.causeId,
   tMs:resolution.tMs,kind:resolution.kind,result:resolution.result,
   source:resolution.source,zone:resolution.zone||null,objectId:resolution.objectId||null,
   material:resolution.material||null,intensity:resolution.intensity??null,
   leaseMs:resolution.leaseMs,reason:resolution.reason||null,witness:resolution.witness
  });
  validate(payload);
  const message=Buffer.from(DOMAIN+canonical(payload),'utf8');
  const signature=crypto.sign(null,message,k).toString('base64url');
  seq=number;
  return Object.freeze({algorithm:'Ed25519',fingerprint:keyFingerprint,
    payload:Object.freeze(payload),signature});
 }
 return Object.freeze({issue,publicKey:pub,issuerId,keyId,worldId,sessionId,actorId,
  fingerprint:keyFingerprint,sequence:()=>seq});
}
function createVerifier({trustedIssuers=[],worldId,sessionId,actorId,maxAgeMs=120000,
 maxFutureSkewMs=5000,clock=()=>0}={}){
 for(const [key,value] of Object.entries({worldId,sessionId,actorId}))id(value,key);
 numeric(maxAgeMs,'MAX_AGE_MS',0,86400000);
 numeric(maxFutureSkewMs,'FUTURE_SKEW_MS',0,60000);
 if(typeof clock!=='function'||!Array.isArray(trustedIssuers)||!trustedIssuers.length)
   throw TypeError('TRUSTED_ISSUERS_REQUIRED');
 const keys=new Map(),seen=new Map();
 const scope=issuerId=>issuerId+'|'+worldId+'|'+sessionId+'|'+actorId;
 for(const entry of trustedIssuers){
  const issuerId=id(entry.issuerId,'ISSUER_ID'),keyId=id(entry.keyId,'KEY_ID');
  id(entry.worldId,'TRUSTED_WORLD_ID');
  if(entry.worldId!==worldId)throw Error('TRUSTED_WORLD_SCOPE_MISMATCH');
  const pub=asPublicKey(entry.publicKey);
  if(pub.asymmetricKeyType!=='ed25519')throw Error('TRUSTED_KEY_NOT_ED25519');
  const k=issuerId+'|'+keyId;
  if(keys.has(k))throw Error('DUPLICATE_TRUST_KEY');
  keys.set(k,{pub,fingerprint:fingerprint(pub),issuerId});
 }
 function inspect(envelope){
  if(!envelope||envelope.algorithm!=='Ed25519'||typeof envelope.signature!=='string')
   throw Error('UNSIGNED_OR_UNSUPPORTED_EVIDENCE');
  const p=validate(envelope.payload);
  if(p.worldId!==worldId||p.sessionId!==sessionId||p.actorId!==actorId)
   throw Error('EVIDENCE_SCOPE_MISMATCH');
  const trusted=keys.get(p.issuerId+'|'+p.keyId);
  if(!trusted)throw Error('UNKNOWN_EVIDENCE_ISSUER');
  if(envelope.fingerprint!==trusted.fingerprint)throw Error('EVIDENCE_KEY_FINGERPRINT_MISMATCH');
  if(!/^[A-Za-z0-9_-]{80,100}$/.test(envelope.signature))
   throw Error('INVALID_ED25519_SIGNATURE_ENCODING');
  const valid=crypto.verify(null,Buffer.from(DOMAIN+canonical(p),'utf8'),
    trusted.pub,Buffer.from(envelope.signature,'base64url'));
  if(!valid)throw Error('EVIDENCE_SIGNATURE_INVALID');
  const t=numeric(clock(),'CURRENT_WORLD_TIME_MS',0,1e12);
  if(p.tMs>t+maxFutureSkewMs)throw Error('EVIDENCE_FROM_FUTURE');
  if(t-p.tMs>maxAgeMs)throw Error('EVIDENCE_TOO_OLD');
  const previous=seen.get(scope(p.issuerId))||{seq:0,tMs:0};
  if(p.seq!==previous.seq+1)throw Error(p.seq<=previous.seq?'REPLAYED_EVIDENCE':'EVIDENCE_SEQUENCE_GAP');
  if(p.tMs<previous.tMs)throw Error('EVIDENCE_TIME_REVERSAL');
  return clone(p);
 }
 function accept(envelope){
  const p=inspect(envelope);
  seen.set(scope(p.issuerId),{seq:p.seq,tMs:p.tMs});
  return p;
 }
 function checkpoint(){return clone({schema:'REALITI_EVIDENCE_VERIFIER_CHECKPOINT_V1',
   worldId,sessionId,actorId,seen:[...seen.entries()]})}
 function restore(snapshot){
  if(!snapshot||snapshot.schema!=='REALITI_EVIDENCE_VERIFIER_CHECKPOINT_V1'||
   snapshot.worldId!==worldId||snapshot.sessionId!==sessionId||snapshot.actorId!==actorId||
   !Array.isArray(snapshot.seen)||snapshot.seen.length>keys.size)
    throw Error('VERIFIER_CHECKPOINT_SCOPE_MISMATCH');
  const entries=snapshot.seen.map(([k,v])=>{
   const issuerId=k.split('|')[0];
   if(k!==scope(issuerId)||![...keys.keys()].some(x=>x.startsWith(issuerId+'|')))
     throw Error('VERIFIER_CHECKPOINT_UNKNOWN_ISSUER');
   natural(v.seq,'RESTORED_SEQ');natural(v.tMs,'RESTORED_TIME_MS');
   return [k,{seq:v.seq,tMs:v.tMs}];
  });
  const xs=new Set(entries.map(([k])=>k));
  if(xs.size!==entries.length)throw Error('VERIFIER_CHECKPOINT_DUPLICATE_SCOPE');
  seen.clear();for(const [k,v] of entries)seen.set(k,v);
  return {ok:true,restored:entries.length};
 }
 return Object.freeze({accept,inspect,checkpoint,restore,scope:()=>({worldId,sessionId,actorId,
  trustedIssuers:trustedIssuers.map(x=>x.issuerId)})});
}
module.exports=Object.freeze({VERSION,SCHEMA,canonical,fingerprint,publicKeyOf,
 createIssuer,createVerifier,validate});
