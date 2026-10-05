'use strict';
// REALITI_PEER_ENVELOPE_V1: exact round-trip, and every way it fails closed. Also pins the client's copy to the server's.
const fs=require('node:fs'),path=require('node:path');
const E=require('../envelope.cjs');
const checks={};const check=(k,v)=>{checks[k]=!!v};const fails=(fn,code)=>{try{fn();return false}catch(e){return e.code===code}};
const key=E.newKey(),lease=E.newLeaseId(),exp=Date.now()+60000;
const mk=(self='resident-a')=>new E.PeerSession({lease_id:lease,self_id:self,key,expires_ms:exp});
const a=mk(),b=mk();
check('round_trip',JSON.stringify(b.open('REQUEST',a.seal('REQUEST',{type:'ping',n:1})))==='{"type":"ping","n":1}'&&JSON.stringify(a.open('RESPONSE',b.seal('RESPONSE',{ok:true})))==='{"ok":true}');
const r2=a.seal('REQUEST',{type:'presence',x:1});const t=JSON.parse(r2);t.payload=t.payload.replace('"x":1','"x":2');
check('tamper_rejected',fails(()=>b.open('REQUEST',JSON.stringify(t)),'BAD_MAC'));
check('exact_sequence_required',(()=>{b.open('REQUEST',r2);return fails(()=>b.open('REQUEST',r2),'REPLAY')})());
const r3=a.seal('REQUEST',{n:3}),r4=a.seal('REQUEST',{n:4});
check('gap_rejected',fails(()=>b.open('REQUEST',r4),'SEQUENCE_GAP')&&!!b.open('REQUEST',r3)&&!!b.open('REQUEST',r4));
check('direction_is_bound',fails(()=>b.open('RESPONSE',a.seal('REQUEST',{n:5})),'DIRECTION'));
check('principal_is_bound',fails(()=>mk('resident-z').open('REQUEST',a.seal('REQUEST',{n:6})),'PRINCIPAL'));
check('lease_is_bound',fails(()=>new E.PeerSession({lease_id:E.newLeaseId(),self_id:'resident-a',key,expires_ms:exp}).open('REQUEST',a.seal('REQUEST',{n:7})),'LEASE'));
const past=new E.PeerSession({lease_id:lease,self_id:'resident-a',key,expires_ms:Date.now()+50});const sealedNow=past.seal('REQUEST',{n:1});
check('expiry_fails_closed',fails(()=>mk().open('REQUEST',sealedNow,Date.now()+100),'EXPIRED')&&fails(()=>past.seal('REQUEST',{n:2},Date.now()+100),'EXPIRED'));
check('payload_bounded',fails(()=>a.seal('REQUEST',{s:'x'.repeat(70000)}),'PAYLOAD_TOO_LARGE'));
const dup=JSON.parse(a.seal('REQUEST',{n:8}));const raw=JSON.stringify(dup).replace(/}$/,`,"sequence":${dup.sequence}}`);
check('duplicate_keys_rejected',fails(()=>b.open('REQUEST',raw),'DUPLICATE_KEY'));
check('bad_keys_refused',fails(()=>new E.PeerSession({lease_id:lease,self_id:'a',key:Buffer.alloc(32),expires_ms:exp}),'BAD_KEY')&&fails(()=>new E.PeerSession({lease_id:'short',self_id:'a',key,expires_ms:exp}),'BAD_LEASE_ID'));
// Exposure policy.
check('policy_defaults_to_outbound_relay',E.validatePolicy({endpoint_label:'https://city.example'}).exposure==='OUTBOUND_RELAY');
check('policy_fails_closed',fails(()=>E.validatePolicy({exposure:'USER_CONFIGURED_INGRESS',endpoint_label:'https://me.example'}),'INGRESS_NEEDS_APPROVAL_AND_ENDPOINT')&&fails(()=>E.validatePolicy({exposure:'LAN_ONLY',automatic_port_mapping:true}),'NO_AUTOMATIC_PORT_MAPPING')&&fails(()=>E.validatePolicy({exposure:'LAN_ONLY',require_pairing:false}),'PAIRING_REQUIRED')&&fails(()=>E.validatePolicy({exposure:'OUTBOUND_RELAY'}),'RELAY_NEEDS_ENDPOINT')&&fails(()=>E.validatePolicy({exposure:'DISABLED',human_ingress_approved:true}),'DISABLED_CANNOT_APPROVE_INGRESS'));
check('client_copy_is_identical',fs.readFileSync(path.join(__dirname,'..','envelope.cjs'),'utf8')===fs.readFileSync(path.join(__dirname,'..','..','realiti-headless-resident','envelope.cjs'),'utf8'));
console.log(JSON.stringify(checks,null,2));const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);if(failed.length){console.error('FAILED',failed);process.exit(1)}console.log('ENVELOPE PASS',Object.keys(checks).length,'checks');
