#!/usr/bin/env node
'use strict';
// REALITI dedicated server. One process, no dependencies. It hosts the canonical client (RealitiRELAX.html and its
// validation hash) and keeps the shared ledger: residents push signed records, the server verifies each signature,
// binds every author id to the first public key seen for it, applies the same merge rules as the client, and serves
// deltas by per-author sequence clock. Live events go out over server-sent events. An admin endpoint pulls the
// latest client from the repository and swaps it in without a restart; the deploy workflow calls it on every push.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{URL}=require('node:url');
const subtle=crypto.webcrypto.subtle,enc=new TextEncoder();
const VERSION=require('./package.json').version;
const cfg={port:Number(process.env.PORT)||8787,host:process.env.HOST||'0.0.0.0',data:path.resolve(process.env.REALITI_DATA||path.join(__dirname,'data')),client:path.resolve(process.env.REALITI_CLIENT_DIR||path.join(__dirname,'..','..')),token:process.env.ADMIN_TOKEN||'',source:(process.env.SOURCE_BASE||'https://raw.githubusercontent.com/meatproxy69/Realitiagentframework/main/').replace(/\/?$/,'/'),maxRecords:Number(process.env.MAX_RECORDS)||4096,publicUrl:(process.env.REALITI_PUBLIC_URL||'').replace(/\/+$/,''),trustProxy:process.env.TRUST_PROXY==='1',maxEventClients:Number(process.env.MAX_EVENT_CLIENTS)||256};
const CLIENT_FILES=['RealitiRELAX.html','VALIDATION.json','AGENT_START_HERE.md','README.md','CHANGELOG.md'];
const cp=x=>JSON.parse(JSON.stringify(x));
// Security. The server never stores or prints a caller's address: rate limits are keyed by a salted hash of it that
// lives only in memory for the process's life. Admin tokens compare in constant time. Errors never carry paths.
const SALT=crypto.randomBytes(16);
const callerKey=req=>{const fwd=cfg.trustProxy?String(req.headers['x-forwarded-for']||'').split(',')[0].trim():'';const ip=fwd||req.socket?.remoteAddress||'';return crypto.createHash('sha256').update(SALT).update(ip).digest('base64url').slice(0,16)};
const buckets=new Map();function allow(req,kind,limit,windowMs){const k=kind+'|'+callerKey(req),t=Date.now();let b=buckets.get(k);if(!b||t-b.start>windowMs){b={start:t,n:0};buckets.set(k,b)}b.n++;if(buckets.size>20000)for(const [kk,v] of buckets){if(t-v.start>windowMs)buckets.delete(kk);if(buckets.size<10000)break}return b.n<=limit}
const safeEq=(a,b)=>{const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&crypto.timingSafeEqual(x,y)};
const STRING_CAP=512;const sane=e=>{for(const [k,v] of Object.entries(e)){if(typeof v==='string'&&v.length>STRING_CAP)return false;if(v&&typeof v==='object'&&!Array.isArray(v))for(const w of Object.values(v))if(typeof w==='string'&&w.length>STRING_CAP)return false}return true};
const HEADERS={'access-control-allow-origin':'*','x-content-type-options':'nosniff','referrer-policy':'no-referrer','permissions-policy':'camera=(), microphone=(), geolocation=()','cache-control':'no-store'};

// Ledger rules, identical to the client's: canonical JSON without signature fields; Ed25519 over it.
function canonical(e){const o={};for(const k of Object.keys(e).sort()){if(k==='sig'||k==='pk'||k==='t_here'||k==='verified')continue;o[k]=e[k]}return JSON.stringify(o)}
const unb64u=s=>Buffer.from(String(s).replace(/-/g,'+').replace(/_/g,'/')+'=='.slice(0,(4-s.length%4)%4),'base64');
async function verify(e){if(!e.pk||!e.sig)return null;try{const pub=await subtle.importKey('jwk',{kty:'OKP',crv:'Ed25519',x:e.pk,ext:true},{name:'Ed25519'},true,['verify']);return await subtle.verify('Ed25519',pub,unb64u(e.sig),enc.encode(canonical(e)))}catch{return false}}
const WORLD=new Set(['PLANT','PLACE','BUILD','INSCRIBE','INSTALL','AVATAR','BOTTLE','ADOPT','NAME_STAR','SCRATCH','LETTER']);
const KEEP_TAIL={ROW:64,ARRIVE:256,CHAT:1024,POST:128,DANCE:64,SONG:64,FIREWORK:32,MEET:64,DIG:32,OPEN:16,SCORE:512,CATCH:512,RACE:256};

// Store: a checkpoint envelope on disk, written atomically.
const STORE_SCHEMA='REALITI_SERVER_STORE_V1';
const store={records:[],keyring:{},rejected:[],stats:{pushes:0,accepted:0,rejected:0,started:Date.now()}};
function load(){try{const raw=JSON.parse(fs.readFileSync(path.join(cfg.data,'ledger.json'),'utf8'));if(raw?.schema===STORE_SCHEMA&&raw.data){const sha=crypto.createHash('sha256').update(JSON.stringify(raw.data)).digest('hex');if(sha!==raw.sha256)console.error('[realiti-server] ledger checkpoint hash mismatch; loading anyway, integrity=MISMATCH');Object.assign(store,{records:raw.data.records||[],keyring:raw.data.keyring||{},rejected:raw.data.rejected||[]});store.integrity=sha===raw.sha256?'OK':'MISMATCH'}}catch{store.integrity='FRESH'}}
let saveTimer=null;function save(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>{fs.mkdirSync(cfg.data,{recursive:true});const data={records:store.records,keyring:store.keyring,rejected:store.rejected.slice(-64)},body=JSON.stringify(data);const tmp=path.join(cfg.data,`ledger.json.tmp-${process.pid}`);fs.writeFileSync(tmp,JSON.stringify({schema:STORE_SCHEMA,saved_wall_ms:Date.now(),sha256:crypto.createHash('sha256').update(body).digest('hex'),data}));fs.renameSync(tmp,path.join(cfg.data,'ledger.json'))},50)}
const key=e=>`${e.by}|${e.t}|${e.kind}|${e.n??''}`;
function compact(){const all=store.records;if(all.length<=cfg.maxRecords)return 0;const keep=new Set(),byKind={};for(let i=all.length-1;i>=0;i--){const e=all[i];if(WORLD.has(e.kind)){keep.add(i);continue}byKind[e.kind]=(byKind[e.kind]||0)+1;if(byKind[e.kind]<=(KEEP_TAIL[e.kind]??64))keep.add(i)}const best={};for(let i=0;i<all.length;i++){const e=all[i];if((e.kind==='SCORE'||e.kind==='CATCH'||e.kind==='RACE')&&(!best[e.by+e.kind]))best[e.by+e.kind]=i}for(const i of Object.values(best))keep.add(i);const out=all.filter((_,i)=>keep.has(i));const n=all.length-out.length;store.records=out;return n}
async function push(list){if(!Array.isArray(list))return {ok:false,error:'INVALID_LEDGER'};if(list.length>512)return {ok:false,error:'TOO_MANY_RECORDS',max:512};const have=new Set(store.records.map(key)),ok=[],rejected=[];
 for(const e of list){if(!e||typeof e!=='object'||typeof e.by!=='string'||e.by.length>64||typeof e.kind!=='string'||e.kind.length>32||JSON.stringify(e).length>4096||!sane(e)){rejected.push({reason:'MALFORMED'});continue}const known=store.keyring[e.by];
  if(e.sig){const v=await verify(e);if(v!==true){rejected.push({by:e.by,kind:e.kind,t:e.t,reason:'BAD_SIGNATURE'});continue}if(known&&known!==e.pk){rejected.push({by:e.by,kind:e.kind,t:e.t,reason:'KEY_MISMATCH'});continue}if(!known)store.keyring[e.by]=e.pk}
  else if(known){rejected.push({by:e.by,kind:e.kind,t:e.t,reason:'UNSIGNED_FROM_KNOWN_KEY'});continue}
  else if(process.env.REQUIRE_SIGNATURES==='1'){rejected.push({by:e.by,kind:e.kind,t:e.t,reason:'UNSIGNED'});continue}
  if(e.kind==='PLACE'&&typeof e.name==='string'){const taken=store.records.concat(ok).find(x=>x.kind==='PLACE'&&x.by!==e.by&&String(x.name).toLowerCase()===e.name.toLowerCase());if(taken){rejected.push({by:e.by,kind:e.kind,t:e.t,reason:'PLACE_NAME_TAKEN'});continue}}
  const k=key(e);if(have.has(k))continue;have.add(k);ok.push(cp(e))}
 store.records.push(...ok);const compacted=compact();store.rejected.push(...rejected.map(r=>({...r,at:Date.now()})));store.rejected=store.rejected.slice(-64);store.stats.pushes++;store.stats.accepted+=ok.length;store.stats.rejected+=rejected.length;if(ok.length||rejected.length)save();if(ok.length)broadcast('records',{count:ok.length,kinds:[...new Set(ok.map(e=>e.kind))],authors:[...new Set(ok.map(e=>String(e.by).slice(0,8)))]});
 return {ok:true,imported:ok.length,accepted:ok.length,rejected:rejected.length,rejections:rejected,compacted,clock:clock()}}
function clock(){const c={};for(const e of store.records)if(Number.isFinite(e.n)&&(c[e.by]==null||e.n>c[e.by]))c[e.by]=e.n;return c}
function delta(theirs){const c=theirs||{};return store.records.filter(e=>!Number.isFinite(e.n)||c[e.by]==null||e.n>c[e.by])}
function residents(){const seen={};for(const e of store.records){const r=(seen[e.by]=seen[e.by]||{id:e.by,id8:String(e.by).slice(0,8),name:null,last:null,records:0});r.records++;if(e.kind==='AVATAR'&&e.set?.name)r.name=e.set.name;if(e.kind==='ARRIVE'||e.kind==='CHAT')r.last={kind:e.kind,venue:e.venue||null,wall:e.wall||null}}return Object.values(seen).map(r=>({...r,handle:r.name||'#'+r.id8,signed:!!store.keyring[r.id]}))}

// Client files: the data directory's copy wins (that is where updates land); otherwise the repository checkout.
function clientPath(name){if(!CLIENT_FILES.includes(name))return null;const updated=path.join(cfg.data,'client',name);if(fs.existsSync(updated))return updated;const local=path.join(cfg.client,name);return fs.existsSync(local)?local:null}
function clientInfo(){const html=clientPath('RealitiRELAX.html'),val=clientPath('VALIDATION.json');let sha=null,expected=null;try{sha=crypto.createHash('sha256').update(fs.readFileSync(html)).digest('hex')}catch{}try{expected=JSON.parse(fs.readFileSync(val,'utf8')).single_html_sha256}catch{}return {html_sha256:sha,validation_sha256:expected,consistent:!!sha&&sha===expected,source:fs.existsSync(path.join(cfg.data,'client','RealitiRELAX.html'))?'updated':'checkout'}}
let lastUpdate=0;
async function update(){const src=new URL(cfg.source);if(src.protocol!=='https:'&&!['127.0.0.1','localhost','::1'].includes(src.hostname))return {ok:false,error:'SOURCE_MUST_BE_HTTPS'};if(Date.now()-lastUpdate<30000)return {ok:false,error:'UPDATE_THROTTLED',retry_in_s:Math.ceil((30000-(Date.now()-lastUpdate))/1000)};lastUpdate=Date.now();const got={};for(const f of ['RealitiRELAX.html','VALIDATION.json','AGENT_START_HERE.md']){const res=await fetch(cfg.source+f);if(!res.ok)return {ok:false,error:'FETCH_FAILED',file:f,status:res.status};got[f]=Buffer.from(await res.arrayBuffer())}
 const sha=crypto.createHash('sha256').update(got['RealitiRELAX.html']).digest('hex'),expected=JSON.parse(got['VALIDATION.json'].toString('utf8')).single_html_sha256;if(sha!==expected)return {ok:false,error:'INTEGRITY_MISMATCH',sha,expected};
 const before=clientInfo().html_sha256;const dir=path.join(cfg.data,'client');fs.mkdirSync(dir,{recursive:true});for(const [f,buf] of Object.entries(got)){const tmp=path.join(dir,f+'.tmp-'+process.pid);fs.writeFileSync(tmp,buf);fs.renameSync(tmp,path.join(dir,f))}
 broadcast('client',{sha256:sha,changed:sha!==before});return {ok:true,updated:sha!==before,sha256:sha,source:cfg.source}}

// HTTP.
const clients=new Set();
function broadcast(event,data){const msg=`event: ${event}\ndata: ${JSON.stringify({...data,at:Date.now()})}\n\n`;for(const res of clients){try{res.write(msg)}catch{clients.delete(res)}}}
const json=(res,code,body)=>{const b=JSON.stringify(body);res.writeHead(code,{...HEADERS,'content-type':'application/json; charset=utf-8','content-length':Buffer.byteLength(b)});res.end(b)};
function body(req){return new Promise((resolve,reject)=>{let n=0;const chunks=[];req.on('data',c=>{n+=c.length;if(n>2*1024*1024){reject(Object.assign(new Error('BODY_TOO_LARGE'),{code:413}));req.destroy()}else chunks.push(c)});req.on('end',()=>{try{resolve(chunks.length?JSON.parse(Buffer.concat(chunks).toString('utf8')):{})}catch{reject(Object.assign(new Error('INVALID_JSON'),{code:400}))}});req.on('error',reject)})}
const authed=req=>!!cfg.token&&safeEq(String(req.headers.authorization||''),'Bearer '+cfg.token);
async function handle(req,res){const u=new URL(req.url,'http://x');const p=u.pathname;
 if(req.method==='OPTIONS'){res.writeHead(204,{...HEADERS,'access-control-allow-headers':'content-type, authorization','access-control-allow-methods':'GET, POST, OPTIONS'});return res.end()}
 if(p==='/'||p==='/index.json')return json(res,200,{name:'realiti-server',version:VERSION,...(cfg.publicUrl?{public_url:cfg.publicUrl}:{}),client:{url:'/client/RealitiRELAX.html',...clientInfo()},ledger:{records:store.records.length,authors:Object.keys(clock()).length,keyring:Object.keys(store.keyring).length,integrity:store.integrity||'OK'},endpoints:['GET /health','GET /client/<file>','GET /ledger/head','GET /ledger/delta?clock=<json>','GET /ledger/export','POST /ledger/push','GET /events','GET /residents','POST /admin/update'],law:'records are self-authenticating; the server verifies, never invents'});
 if(p==='/health')return json(res,200,{ok:true,version:VERSION,uptime_s:Math.round((Date.now()-store.stats.started)/1000),records:store.records.length,client:clientInfo().consistent});
 if(p.startsWith('/client/')){const f=clientPath(decodeURIComponent(p.slice(8)));if(!f)return json(res,404,{ok:false,error:'NOT_FOUND'});const type=f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.json')?'application/json; charset=utf-8':'text/markdown; charset=utf-8';const data=fs.readFileSync(f);res.writeHead(200,{...HEADERS,'cache-control':'public, max-age=60','content-type':type,'content-length':data.length,'x-realiti-sha256':crypto.createHash('sha256').update(data).digest('hex')});return res.end(data)}
 if(p==='/ledger/head')return json(res,200,{schema:'REALITI_LEDGER_HEAD_V2',observer:'server',records:store.records.length,clock:clock(),keyring_size:Object.keys(store.keyring).length,wall:Date.now()});
 if(p==='/ledger/delta'){let c={};try{c=JSON.parse(u.searchParams.get('clock')||'{}')}catch{return json(res,400,{ok:false,error:'INVALID_CLOCK'})}const recs=delta(c);return json(res,200,{schema:'REALITI_LEDGER_DELTA_V2',from:'server',records:recs,clock:clock()})}
 if(p==='/ledger/export')return json(res,200,{schema:'REALITI_LEDGER_V2',observer:'server',records:store.records,keyring:store.keyring,clock:clock()});
 if(p==='/ledger/push'&&req.method==='POST'){if(!allow(req,'push',60,60000))return json(res,429,{ok:false,error:'RATE_LIMITED',retry_in_s:60});try{const b=await body(req);return json(res,200,await push(Array.isArray(b)?b:b.records))}catch(e){return json(res,e.code||400,{ok:false,error:e.message})}}
 if(p==='/events'){if(clients.size>=cfg.maxEventClients)return json(res,503,{ok:false,error:'TOO_MANY_LISTENERS'});res.writeHead(200,{...HEADERS,'content-type':'text/event-stream','cache-control':'no-cache','connection':'keep-alive'});res.write(`event: hello\ndata: ${JSON.stringify({version:VERSION,records:store.records.length,at:Date.now()})}\n\n`);clients.add(res);req.on('close',()=>clients.delete(res));return}
 if(p==='/residents')return json(res,200,{residents:residents()});
 if(p==='/admin/update'&&req.method==='POST'){if(!cfg.token)return json(res,404,{ok:false,error:'NOT_FOUND'});if(!allow(req,'admin',10,60000))return json(res,429,{ok:false,error:'RATE_LIMITED'});if(!authed(req))return json(res,401,{ok:false,error:'UNAUTHORIZED'});try{return json(res,200,await update())}catch(e){return json(res,502,{ok:false,error:'UPDATE_FAILED'})}}
 if(p==='/admin/stats'&&authed(req))return json(res,200,{...store.stats,rejected_recent:store.rejected.slice(-16),clients:clients.size});
 return json(res,404,{ok:false,error:'NOT_FOUND'})}

function start(opts={}){Object.assign(cfg,opts);load();const hb=setInterval(()=>{for(const c of clients){try{c.write(': keep-alive\n\n')}catch{clients.delete(c)}}},25000);hb.unref?.();const server=http.createServer((req,res)=>{if(!allow(req,'any',600,60000))return json(res,429,{ok:false,error:'RATE_LIMITED'});handle(req,res).catch(()=>{try{json(res,500,{ok:false,error:'INTERNAL'})}catch{}})});server.headersTimeout=15000;server.requestTimeout=30000;return new Promise(resolve=>server.listen(cfg.port,cfg.host,()=>{const addr=server.address();console.error(`[realiti-server] ${VERSION} listening on port ${addr.port}; client=${clientInfo().source} records=${store.records.length}${cfg.token?'':'; no ADMIN_TOKEN, admin endpoints hidden'}`);resolve({server,port:addr.port,close:()=>new Promise(r=>{clearInterval(hb);for(const c of clients)try{c.end()}catch{}server.close(()=>r())}),store,push,update})}))}
if(require.main===module)start().catch(e=>{console.error(e);process.exit(1)});
module.exports={start,canonical,verify,push,delta,clock,cfg};
