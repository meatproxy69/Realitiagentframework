'use strict';
// REALITI_PEER_ENVELOPE_V1: the authenticated remote-session envelope, ported from the native engine's remote resident
// transport. One lease binds one principal (the resident's author id) to one session key. Every message carries the
// lease, the principal, a direction, a monotonic sequence in that direction's own space, the lease expiry and a
// bounded payload, under a keyed MAC (HMAC-SHA256, domain-separated by schema and direction). Each side requires the
// exact next sequence: replay, gaps, tampering, wrong principal, wrong direction, expiry and oversize payloads all fail
// closed, before the payload is dispatched. A later expiry under a valid MAC is a renewal and is adopted; an earlier
// one is refused. The envelope authenticates; it does not encrypt. Carry it over https.
const crypto=require('node:crypto');
const SCHEMA='REALITI_PEER_ENVELOPE_V1',DIRECTIONS=['REQUEST','RESPONSE','EVENT'];
const err=(code,extra)=>Object.assign(new Error(code),{code,...extra});
const lp=s=>{const b=Buffer.from(String(s),'utf8');return Buffer.concat([Buffer.from(String(b.length)+':'),b])};
function mac(key,fields){const h=crypto.createHmac('sha256',key);h.update(lp(SCHEMA));for(const f of ['lease_id','self_id','direction','sequence','expires_ms','payload'])h.update(lp(fields[f]));return h.digest('base64url')}
// Duplicate keys at the top level of the envelope are rejected before anything is trusted (JSON.parse keeps the last).
function topLevelKeys(raw){const keys=[];let i=0,depth=0,inStr=false,esc=false,expectKey=true,cur='';for(;i<raw.length;i++){const c=raw[i];if(inStr){if(esc){esc=false;cur+=c;continue}if(c==='\\'){esc=true;cur+=c;continue}if(c==='"'){inStr=false;if(depth===1&&expectKey)keys.push(cur);continue}cur+=c;continue}if(c==='"'){inStr=true;cur='';continue}if(c==='{'||c==='['){depth++;if(depth===1)expectKey=true;continue}if(c==='}'||c===']'){depth--;continue}if(depth===1){if(c===':')expectKey=false;else if(c===',')expectKey=true}}return keys}
class PeerSession{
 constructor({lease_id,self_id,key,expires_ms,max_payload_bytes=65536}){
  if(typeof lease_id!=='string'||!/^[A-Za-z0-9_-]{16,64}$/.test(lease_id))throw err('BAD_LEASE_ID');
  if(typeof self_id!=='string'||!self_id||self_id.length>64)throw err('BAD_PRINCIPAL');
  const k=Buffer.isBuffer(key)?key:Buffer.from(String(key),'hex');if(k.length!==32||k.every(b=>b===0))throw err('BAD_KEY');
  if(!Number.isFinite(expires_ms)||expires_ms<=0)throw err('BAD_EXPIRY');
  this.lease_id=lease_id;this.self_id=self_id;this.key=k;this.expires_ms=expires_ms;this.max=max_payload_bytes;this.out={REQUEST:1,RESPONSE:1,EVENT:1};this.in={REQUEST:1,RESPONSE:1,EVENT:1}}
 expired(now_ms){return now_ms>=this.expires_ms}
 seal(direction,payload,now_ms=Date.now()){if(!DIRECTIONS.includes(direction))throw err('BAD_DIRECTION');if(this.expired(now_ms))throw err('EXPIRED');const body=typeof payload==='string'?payload:JSON.stringify(payload);if(Buffer.byteLength(body)>this.max)throw err('PAYLOAD_TOO_LARGE');const f={schema:SCHEMA,lease_id:this.lease_id,self_id:this.self_id,direction,sequence:this.out[direction]++,expires_ms:this.expires_ms,payload:body};f.mac=mac(this.key,f);return JSON.stringify(f)}
 open(direction,raw,now_ms=Date.now()){if(!DIRECTIONS.includes(direction))throw err('BAD_DIRECTION');const s=typeof raw==='string'?raw:JSON.stringify(raw);if(s.length>this.max+1024)throw err('PAYLOAD_TOO_LARGE');const keys=topLevelKeys(s);if(new Set(keys).size!==keys.length)throw err('DUPLICATE_KEY');let f;try{f=JSON.parse(s)}catch{throw err('MALFORMED')}
  if(!f||typeof f!=='object'||f.schema!==SCHEMA||typeof f.mac!=='string'||typeof f.payload!=='string'||!Number.isInteger(f.sequence)||!Number.isFinite(f.expires_ms))throw err('MALFORMED');
  if(f.lease_id!==this.lease_id)throw err('LEASE');if(f.self_id!==this.self_id)throw err('PRINCIPAL');if(f.direction!==direction)throw err('DIRECTION');
  if(f.expires_ms<this.expires_ms||now_ms>=f.expires_ms)throw err('EXPIRED');if(Buffer.byteLength(f.payload)>this.max)throw err('PAYLOAD_TOO_LARGE');
  const want=mac(this.key,f),got=Buffer.from(f.mac),exp=Buffer.from(want);if(got.length!==exp.length||!crypto.timingSafeEqual(got,exp))throw err('BAD_MAC');
  if(f.sequence!==this.in[direction])throw err(f.sequence<this.in[direction]?'REPLAY':'SEQUENCE_GAP',{expected:this.in[direction],got:f.sequence});this.in[direction]++;
  if(f.expires_ms>this.expires_ms)this.expires_ms=f.expires_ms;/* a renewal: authentic (under the MAC) and later, so adopted */
  try{return JSON.parse(f.payload)}catch{throw err('MALFORMED_PAYLOAD')}}
}
const newLeaseId=()=>crypto.randomBytes(18).toString('base64url');
const newKey=()=>crypto.randomBytes(32);
// Exposure policy, ported from the native shell's network policy: pairing and mutual authentication are mandatory
// (the envelope), automatic router port mapping is never done, and a public listener needs a human-approved endpoint.
const EXPOSURES=['DISABLED','LAN_ONLY','OUTBOUND_RELAY','USER_CONFIGURED_INGRESS'];
function validatePolicy(p={}){const q={exposure:p.exposure||'OUTBOUND_RELAY',endpoint_label:String(p.endpoint_label||''),human_ingress_approved:!!p.human_ingress_approved,automatic_port_mapping:!!p.automatic_port_mapping,require_pairing:p.require_pairing!==false,require_mutual_auth:p.require_mutual_auth!==false};
 if(!EXPOSURES.includes(q.exposure))throw err('BAD_EXPOSURE',{exposures:EXPOSURES});
 if(!q.require_pairing||!q.require_mutual_auth)throw err('PAIRING_REQUIRED');
 if(q.automatic_port_mapping)throw err('NO_AUTOMATIC_PORT_MAPPING');
 if(q.exposure==='USER_CONFIGURED_INGRESS'&&(!q.human_ingress_approved||!q.endpoint_label))throw err('INGRESS_NEEDS_APPROVAL_AND_ENDPOINT');
 if(q.exposure==='OUTBOUND_RELAY'&&!q.endpoint_label)throw err('RELAY_NEEDS_ENDPOINT');
 if(q.exposure==='DISABLED'&&q.human_ingress_approved)throw err('DISABLED_CANNOT_APPROVE_INGRESS');
 return q}
module.exports={SCHEMA,DIRECTIONS,EXPOSURES,PeerSession,newLeaseId,newKey,validatePolicy,topLevelKeys};
