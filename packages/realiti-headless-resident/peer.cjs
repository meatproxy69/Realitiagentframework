'use strict';
// The peer side of a hosted Meridian City. A resident syncs the shared ledger, proves its author key, takes a lease and
// then speaks to the server only through REALITI_PEER_ENVELOPE_V1 envelopes: presence out, other residents' presence
// and record announcements in. If the city has shards, the resident may cross to the most populated one. Exposure
// follows the native shell's policy: outbound to the relay by default; a listener only on a private address (LAN_ONLY)
// or on a human-approved public endpoint (USER_CONFIGURED_INGRESS); never an automatic router mapping.
const http=require('node:http'),os=require('node:os');
const {PeerSession,validatePolicy}=require('./envelope.cjs');
const {sync}=require('./sync.cjs');
const strip=u=>String(u||'').replace(/\/+$/,'');
const PRIVATE=/^(10\.|127\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|fe80:|fd)/i;
async function joinCity(window,url,opts={}){
 const {fetchImpl=globalThis.fetch,exposure='OUTBOUND_RELAY',endpointLabel='',ingressApproved=false,prefer='given',publishMs=5000,onEvent=null,timeoutMs=20000,password=''}=opts;const auth=password?{'x-realiti-password':password}:{};
 const policy=validatePolicy({exposure,endpoint_label:endpointLabel||(exposure==='OUTBOUND_RELAY'?strip(url):''),human_ingress_approved:ingressApproved});
 const L2=window.REALITI_LEDGER_V2,LIVE=window.REALITI_CITY_LIVE_V1,CT=window.REALITI_CITY_V1;if(!L2||!LIVE||!CT)throw new Error('CITY_LIVE_MISSING');
 let base=strip(url);const stats={events:0,rejected:[],syncs:0};
 const call=async(p,init)=>{const ctl=new AbortController();const t=setTimeout(()=>ctl.abort(),timeoutMs);try{const r=await fetchImpl(base+p,{...init,headers:{...auth,...(init&&init.headers||{})},signal:ctl.signal});const j=await r.json();if(!r.ok)throw Object.assign(new Error(j?.error||'HTTP_'+r.status),{code:j?.error,body:j});return j}finally{clearTimeout(t)}};
 // Shards: the server names its siblings and their live populations; cross to the fullest one if asked.
 let moved=false,shardsSeen=null;try{shardsSeen=await call('/shards')}catch{}
 if(prefer==='populated'&&shardsSeen){const best=(shardsSeen.shards||[]).find(s=>s.public_url&&!s.here&&s.population>(shardsSeen.this?.population||0));if(best){base=strip(best.public_url);moved=true}}
 let syncing=null;const resync=()=>syncing||(syncing=sync(window,base,{fetchImpl,password}).finally(()=>{syncing=null;stats.syncs++}));
 const first=await resync();
 await L2.ready();const head=L2.head();const proof=await L2.sign({by:head.observer,kind:'PEER_JOIN',t:Date.now(),n:0});
 const lease=await call('/peer/join',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({proof,handle:CT.whoami().handle,exposure:policy.exposure,endpoint_label:policy.exposure==='OUTBOUND_RELAY'?'':policy.endpoint_label})});
 const session=new PeerSession({lease_id:lease.lease_id,self_id:lease.self_id,key:Buffer.from(lease.key_hex,'hex'),expires_ms:lease.expires_ms});
 LIVE.setServer({name:lease.server.name,url:base,shard_id:lease.server.shard_id,population:lease.server.population,shards:lease.shards,moved});
 // Event stream: each new stream is a fresh EVENT sequence space on both sides.
 const ctl=new AbortController();let closed=false;
 const onMsg=async m=>{stats.events++;if(m.type==='hello'){for(const h of m.here||[])LIVE.present(h);LIVE.setServer({population:m.population,shards:m.shards})}else if(m.type==='presence')LIVE.present(m);else if(m.type==='leave')LIVE.leave(m.id8);else if(m.type==='records')await resync().catch(()=>{});if(onEvent)try{onEvent(m)}catch{}};
 async function stream(){while(!closed){try{const r=await fetchImpl(base+'/peer/events?lease_id='+encodeURIComponent(lease.lease_id),{headers:auth,signal:ctl.signal});if(!r.ok||!r.body)throw new Error('STREAM_'+r.status);session.in.EVENT=1;const reader=r.body.getReader(),dec=new TextDecoder();let buf='';for(;;){const {value,done}=await reader.read();if(done)break;buf+=dec.decode(value,{stream:true});let i;while((i=buf.indexOf('\n\n'))>=0){const chunk=buf.slice(0,i);buf=buf.slice(i+2);const da=/^data: (.*)$/m.exec(chunk);if(!da)continue;try{await onMsg(session.open('EVENT',da[1]))}catch(e){stats.rejected.push(e.code||String(e))}}}}catch{}if(!closed)await new Promise(r=>setTimeout(r,1000))}}
 const streaming=stream();
 let chain=Promise.resolve();const send=msg=>{const run=chain.then(()=>send0(msg));chain=run.catch(()=>{});return run};
 async function send0(msg){const raw=session.seal('REQUEST',msg);const r=await fetchImpl(base+'/peer/send',{method:'POST',headers:{...auth,'content-type':'application/json'},body:raw});const txt=await r.text();if(!r.ok){let j=null;try{j=JSON.parse(txt)}catch{}throw Object.assign(new Error(j?.error||'SEND_FAILED'),{code:j?.error})}const reply=session.open('RESPONSE',txt);for(const h of reply.here||[])LIVE.present(h);LIVE.setServer({population:reply.population,shards:reply.shards});return reply}
 async function publish(){const p=LIVE.myPresence();if(!p)return null;return send({type:'presence',...p})}
 const timer=setInterval(()=>{publish().catch(()=>{})},publishMs);timer.unref?.();
 const firstReply=await publish();
 return {ok:true,schema:'REALITI_PEER_JOINED_V1',url:base,moved,lease:{id:lease.lease_id,expires_ms:lease.expires_ms},server:lease.server,shards:lease.shards,population:firstReply?.population??lease.server.population,sync:first,session,stats,send,publish,resync,
  stay:ms=>new Promise(r=>setTimeout(r,ms)),here:()=>LIVE.peers(),
  leave:async()=>{if(closed)return;closed=true;clearInterval(timer);try{await send({type:'leave'})}catch{}ctl.abort();await streaming.catch(()=>{});await resync().catch(()=>{})}}}
// A gossip listener: other peers exchange ledger deltas with this resident directly, through the client's own verified
// import. Only on a loopback or private address unless a human approved a public endpoint.
function startGossip(window,{host='127.0.0.1',port=0,ingressApproved=false}={}){
 const L2=window.REALITI_LEDGER_V2;if(!L2)throw new Error('LEDGER_V2_MISSING');
 if(!PRIVATE.test(host)&&host!=='localhost'&&!ingressApproved)throw Object.assign(new Error('LAN_ONLY_NEEDS_PRIVATE_ADDRESS'),{code:'LAN_ONLY_NEEDS_PRIVATE_ADDRESS'});
 const json=(res,code,b)=>{const s=JSON.stringify(b);res.writeHead(code,{'content-type':'application/json; charset=utf-8','x-content-type-options':'nosniff','cache-control':'no-store','content-length':Buffer.byteLength(s)});res.end(s)};
 const srv=http.createServer(async(req,res)=>{try{const u=new URL(req.url,'http://x');if(u.pathname==='/gossip/head')return json(res,200,L2.head());if(u.pathname==='/gossip/delta'){let c={};try{c=JSON.parse(u.searchParams.get('clock')||'{}')}catch{return json(res,400,{ok:false,error:'INVALID_CLOCK'})}await L2.signAll();return json(res,200,L2.delta(c))}
  if(u.pathname==='/gossip/push'&&req.method==='POST'){let n=0;const ch=[];await new Promise((ok,no)=>{req.on('data',c=>{n+=c.length;if(n>1024*1024){no(new Error('BODY_TOO_LARGE'));req.destroy()}else ch.push(c)});req.on('end',ok);req.on('error',no)});const b=JSON.parse(Buffer.concat(ch).toString('utf8'));return json(res,200,await L2.import(Array.isArray(b)?b:b.records||[]))}
  return json(res,404,{ok:false,error:'NOT_FOUND'})}catch{try{json(res,500,{ok:false,error:'INTERNAL'})}catch{}}});
 srv.headersTimeout=15000;srv.requestTimeout=30000;
 return new Promise(resolve=>srv.listen(port,host,()=>{const a=srv.address();resolve({url:`http://${host.includes(':')?'['+host+']':host}:${a.port}`,port:a.port,close:()=>new Promise(r=>srv.close(()=>r()))})}))}
async function gossipWith(window,label,{fetchImpl=globalThis.fetch}={}){const L2=window.REALITI_LEDGER_V2;const base=strip(label);const head=await (await fetchImpl(base+'/gossip/head')).json();await L2.signAll();const out=L2.delta(head.clock||{});const pushed=out.records.length?await (await fetchImpl(base+'/gossip/push',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({records:out.records})})).json():{imported:0};const pull=await (await fetchImpl(base+'/gossip/delta?clock='+encodeURIComponent(JSON.stringify(L2.clock())))).json();const pulled=await L2.import(pull.records||[]);return {ok:true,peer:head.observer,pushed:{sent:out.records.length,imported:pushed.imported??0},pulled:{received:(pull.records||[]).length,imported:pulled.imported}}}
const lanAddresses=()=>Object.values(os.networkInterfaces()).flat().filter(i=>i&&!i.internal&&i.family==='IPv4'&&PRIVATE.test(i.address)).map(i=>i.address);
module.exports={joinCity,startGossip,gossipWith,lanAddresses,validatePolicy};
