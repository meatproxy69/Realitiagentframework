(()=>{
'use strict';
// Public surface for ledger v2: signed export and verified import at the door, head and delta for sync, identity keys,
// and the stale-observation witness: every read of here or space carries a witness hash; an invoke that presents a
// witness is refused when the world it observed has moved on.
const L2=window.REALITI_LEDGER_V2,A0=window.Realiti,D0=window.REALITI_AGENT_DOOR,M=window.REALITI_MATRIX_V1;if(!L2||!A0||!D0||!M)return;
const low=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase(),cp=x=>JSON.parse(JSON.stringify(x));
function witness(){const r=M.state().residents['resident:self'],here=A0.read('realiti://here');return L2.fnv(JSON.stringify([C9?.currentRoom,r?.chart,r?.pose?.position?.map(x=>Math.round(x*100)),r?.posture,r?.on,here?.objects?.map(o=>[o.id,o.location,o.state]),(C9.ledger?.records||[]).length,Math.floor(Number(C9?.b7?.clock||0))]))}
function read(uri='realiti://here'){if(uri==='realiti://ledger')return {...L2.head(),keyring:L2.keyring(),rejected_recent:L2.rejected().slice(-8)};const r=A0.read(uri);if((uri==='realiti://here'||uri==='realiti://space')&&r&&typeof r==='object'){const x=cp(r);x.witness=witness();return x}if(uri==='realiti://capabilities'&&r&&typeof r==='object'){const x=cp(r);x.resources=[...new Set([...(x.resources||[]),'realiti://ledger'])];x.ledger={schema:'REALITI_LEDGER_V2',signed:true,witness:'pass args.witness from a read of realiti://here to refuse acting on a stale observation'};return x}return r}
async function invoke(name,args={}){if(args&&typeof args==='object'&&typeof args.witness==='string'){const w=witness();if(args.witness!==w)return {ok:false,error:'STALE_OBSERVATION',witness:w,law:'the world moved since you looked; read again and act on what is there now'};const {witness:_,...rest}=args;return A0.invoke(name,rest)}return A0.invoke(name,args)}
const run0=D0.run.bind(D0),help0=D0.help.bind(D0);
function help(){const h=help0()||{commands:[]};h.commands=[...new Set([...(h.commands||[]),'ledger export','ledger import <json>','ledger head','ledger delta <head json>','ledger keyring','identity','witness'])];h.ledger='realiti://ledger: signed records (Ed25519), a keyring binding each author to the first key seen, verified import with per-kind merge rules, world-preserving compaction, and head/delta as the sync protocol. Reads of here and space carry a witness; pass it to invoke to be refused when the world has moved.';return h}
async function run(raw){const s=String(raw||'').trim(),l=low(s);
 if(l==='ledger export')return L2.export();
 if(l.startsWith('ledger import ')){let p;try{p=JSON.parse(s.slice(14))}catch(e){return {ok:false,error:'INVALID_LEDGER_JSON'}}return L2.import(p)}
 if(l==='ledger head')return L2.head();
 if(l.startsWith('ledger delta ')){let p;try{p=JSON.parse(s.slice(13))}catch(e){return {ok:false,error:'INVALID_HEAD_JSON'}}return L2.delta(p)}
 if(l==='ledger keyring')return {ok:true,keyring:L2.keyring(),rejected_recent:L2.rejected().slice(-8)};
 if(l==='identity'||l==='keys'||l==='my key'){await L2.ready();return {ok:true,schema:'REALITI_IDENTITY_KEYS_V1',observer:String(C9?.verticalContinuity?.observer||'local'),public_key:L2.publicKey(),algorithm:'Ed25519',text:`Your public key: ${L2.publicKey()}. Records you make are signed with it; a server or another resident verifies them without trusting the transport.`}}
 if(l==='witness')return {ok:true,witness:witness(),text:'Pass this witness with an action to have it refused if the world has moved since.'};
 if(l==='help')return help();
 return run0(raw)}
window.Realiti=Object.freeze({...A0,read,invoke,run,help:()=>{const h=A0.help();try{h.ledger=help().ledger}catch(e){}return h}});
D0.help=help;D0.run=run;D0.startup=Object.freeze([...(D0.startup||[]),'Realiti.read("realiti://ledger")']);
window.REALITI_WITNESS_V1=Object.freeze({witness});
})();
