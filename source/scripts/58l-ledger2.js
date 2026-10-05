(()=>{
'use strict';
// Chapter 4, pass 2: a ledger a server can trust. Each resident holds an Ed25519 keypair (WebCrypto, resident-local
// storage). Records are signed over their canonical JSON; a verified import binds each author id to the first public
// key seen for it (the keyring), rejects records whose signature fails or whose key does not match, and applies merge
// rules per kind (a place name is claimed once; an avatar is last-writer-wins). Compaction keeps every world-shaping
// record and trims only chatter. The per-author sequence numbers already on every record form a vector clock, so
// `head` and `delta` are the sync protocol: exchange heads, send what the other lacks.
const LG0=window.REALITI_LEDGER_V1;if(!LG0)return;
const now=()=>Number(C9?.b7?.clock||0),cp=x=>JSON.parse(JSON.stringify(x)),observer=()=>String(C9?.verticalContinuity?.observer||'local'),records=()=>(C9.ledger?.records||[]);
const subtle=globalThis.crypto?.subtle,enc=new TextEncoder();
const b64u=buf=>btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''),unb64u=s=>{const b=atob(String(s).replace(/-/g,'+').replace(/_/g,'/')+'=='.slice(0,(4-s.length%4)%4));return Uint8Array.from(b,c=>c.charCodeAt(0))};
function canonical(e){const o={};for(const k of Object.keys(e).sort()){if(k==='sig'||k==='pk'||k==='t_here'||k==='verified')continue;o[k]=e[k]}return JSON.stringify(o)}
function S(){const w=(C9.chapter2=C9.chapter2||{v:1});w.ledger2=w.ledger2||{keyring:{},rejected:[],compactions:0};return w.ledger2}

// Identity: generate once, keep in resident-local storage under its own key, never inside the exported ledger.
const KEY='realiti-identity-v1';let keys=null,pkb64=null;
const ready=(async()=>{if(!subtle)return null;try{const raw=realitiSafeLoad(KEY);if(raw){const j=JSON.parse(raw);if(j?.observer===observer()&&j.priv&&j.pub){const priv=await subtle.importKey('jwk',j.priv,{name:'Ed25519'},true,['sign']),pub=await subtle.importKey('jwk',j.pub,{name:'Ed25519'},true,['verify']);keys={privateKey:priv,publicKey:pub};pkb64=j.pub.x;return keys}}
 const k=await subtle.generateKey({name:'Ed25519'},true,['sign','verify']);const priv=await subtle.exportKey('jwk',k.privateKey),pub=await subtle.exportKey('jwk',k.publicKey);realitiSafeStore(KEY,JSON.stringify({observer:observer(),priv,pub,created:Date.now()}));keys=k;pkb64=pub.x;return keys}catch(e){return null}})();
const pubFrom=x=>subtle.importKey('jwk',{kty:'OKP',crv:'Ed25519',x,ext:true},{name:'Ed25519'},true,['verify']);
async function sign(e){await ready;if(!keys||e.sig)return e;e.pk=pkb64;e.sig=b64u(await subtle.sign('Ed25519',keys.privateKey,enc.encode(canonical(e))));return e}
async function verify(e){if(!subtle||!e.pk||!e.sig)return null;try{const pub=await pubFrom(e.pk);return await subtle.verify('Ed25519',pub,unb64u(e.sig),enc.encode(canonical(e)))}catch(x){return false}}

// Signing is asynchronous; records are signed as they are made and `signAll` settles the queue before an export.
let queue=Promise.resolve();
function record(kind,data){const e=LG0.record(kind,data);queue=queue.then(()=>sign(e)).catch(()=>{});compactIfNeeded();return e}
const signAll=async()=>{await ready;await queue;for(const e of records())if(e.by===observer()&&!e.sig)await sign(e);try{c9save()}catch(x){}return records().filter(e=>e.by===observer()&&e.sig).length};
async function exportSigned(){const n=await signAll();const x=LG0.export();return {...x,schema:'REALITI_LEDGER_V2',public_key:pkb64,signed:n,clock:clock()}}

// Verified import. Rules: signature must verify; an author id keeps the first key seen for it; an unsigned record from
// an author with a known key is refused; a place name belongs to whoever claimed it first; the rest append.
const WORLD=new Set(['PLANT','PLACE','BUILD','INSCRIBE','INSTALL','AVATAR','BOTTLE']);
async function importVerified(payload){const list=Array.isArray(payload)?payload:payload?.records;if(!Array.isArray(list))return {ok:false,error:'INVALID_LEDGER'};const s=S(),ring=s.keyring,ok=[],rejected=[];
 for(const e of list){if(!e||typeof e!=='object'||typeof e.by!=='string'){rejected.push({reason:'MALFORMED'});continue}const known=ring[e.by];
  if(e.sig){const v=await verify(e);if(v!==true){rejected.push({by:e.by,kind:e.kind,t:e.t,reason:'BAD_SIGNATURE'});continue}if(known&&known!==e.pk){rejected.push({by:e.by,kind:e.kind,t:e.t,reason:'KEY_MISMATCH'});continue}if(!known)ring[e.by]=e.pk}
  else if(known){rejected.push({by:e.by,kind:e.kind,t:e.t,reason:'UNSIGNED_FROM_KNOWN_KEY'});continue}
  if(e.kind==='PLACE'&&typeof e.name==='string'){const taken=records().concat(ok).find(x=>x.kind==='PLACE'&&x.by!==e.by&&String(x.name).toLowerCase()===e.name.toLowerCase());if(taken){rejected.push({by:e.by,kind:e.kind,t:e.t,reason:'PLACE_NAME_TAKEN'});continue}}
  ok.push(e)}
 const r=LG0.import(ok);s.rejected.push(...rejected.map(x=>({...x,at:Date.now()})));while(s.rejected.length>64)s.rejected.shift();compactIfNeeded();try{c9save()}catch(x){}return {ok:true,imported:r.imported,accepted:ok.length,rejected:rejected.length,rejections:rejected,unsigned:ok.filter(e=>!e.sig).length,keyring_size:Object.keys(ring).length}}

// Compaction: never lose a tree, a place, a build, a word on a wall of yours, a key; trim chatter oldest first.
const KEEP_TAIL={ROW:16,ARRIVE:32,CHAT:120,POST:24,DANCE:16,SONG:12,FIREWORK:8,MEET:16,DIG:8,OPEN:4,SCORE:64};
function compact(){const all=records();const keep=new Set();const byKind={};for(let i=all.length-1;i>=0;i--){const e=all[i],k=e.kind;if(WORLD.has(k)){keep.add(i);continue}byKind[k]=(byKind[k]||0)+1;if(byKind[k]<=(KEEP_TAIL[k]??16))keep.add(i)}
 const best={};for(let i=0;i<all.length;i++){const e=all[i];if(e.kind==='SCORE'&&(!best[e.by]||e.score>all[best[e.by]].score))best[e.by]=i}for(const i of Object.values(best))keep.add(i);
 const out=all.filter((_,i)=>keep.has(i));if(out.length<all.length){C9.ledger.records=out;S().compactions++;return all.length-out.length}return 0}
function compactIfNeeded(){if(records().length>448)compact()}

// Earlier slices keep their own reference to the v1 object, so unsigned records are picked up here on the world tick.
let tickAt=-1e9;const adv=b7Advance;b7Advance=function(dt){const r=adv(dt);const t=now();if(t-tickAt>=2){tickAt=t;compactIfNeeded();if(keys){const un=records().filter(e=>e.by===observer()&&!e.sig);if(un.length)queue=queue.then(async()=>{for(const e of un)await sign(e)}).catch(()=>{})}}return r};

// Vector clock: the highest sequence number seen per author. delta(theirs) is what they lack.
function clock(){const c={};for(const e of records())if(Number.isFinite(e.n)&&(c[e.by]==null||e.n>c[e.by]))c[e.by]=e.n;return c}
function head(){return {schema:'REALITI_LEDGER_HEAD_V2',observer:observer(),public_key:pkb64,records:records().length,clock:clock(),world_time_s:+now().toFixed(3),wall:Date.now()}}
function delta(theirs){const c=theirs?.clock||theirs||{};return {schema:'REALITI_LEDGER_DELTA_V2',from:observer(),records:records().filter(e=>!Number.isFinite(e.n)||c[e.by]==null||e.n>c[e.by]).map(cp)}}

// Witness: a hash of what was last observed, so an action can be refused as stale (see the public slice).
function fnv(s){let h=0xcbf29ce4n;const P=0x100000001b3n;for(let i=0;i<s.length;i++){h^=BigInt(s.charCodeAt(i));h=(h*P)&0xffffffffffffffffn}return h.toString(16).padStart(16,'0')}

window.REALITI_LEDGER_V1=Object.freeze({...LG0,record,import:LG0.import});
window.REALITI_LEDGER_V2=Object.freeze({version:'2.0',ready:()=>ready.then(()=>!!keys),publicKey:()=>pkb64,sign,verify,signAll,export:exportSigned,import:importVerified,compact,clock,head,delta,keyring:()=>cp(S().keyring),rejected:()=>cp(S().rejected),fnv,canonical,world_kinds:[...WORLD]});
})();
