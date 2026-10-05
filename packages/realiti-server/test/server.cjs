'use strict';
// The dedicated server: hosts the client with its hash, verifies pushed records, binds keys, serves deltas by clock,
// announces over server-sent events, lists residents, and hot-updates its client from a source after verifying the hash.
// Two headless residents sync through it and see each other.
const path=require('node:path'),fs=require('node:fs'),os=require('node:os'),http=require('node:http'),crypto=require('node:crypto'),net=require('node:net'),{spawn}=require('node:child_process');
const {openResident}=require('../../realiti-headless-resident/index.cjs');
const {sync}=require('../../realiti-headless-resident/sync.cjs');
const {joinCity}=require('../../realiti-headless-resident/peer.cjs');
const {start,cfg}=require('../server.cjs');
const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html'),root=path.dirname(html);
const checks={},details={};
const check=(k,v,d)=>{checks[k]=!!v;if(d!==undefined)details[k]=d};
const get=async(u,init)=>{const r=await fetch(u,init);return {status:r.status,headers:r.headers,body:await r.json().catch(()=>null)}};
(async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-server-')),dataDir=path.join(dir,'data'),sp=path.join(dir,'local-storage.json');
 // A source server standing in for the repository's raw main.
 const src=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.slice(1)));if(!fs.existsSync(f)){res.writeHead(404);return res.end()}res.writeHead(200);res.end(fs.readFileSync(f))});await new Promise(r=>src.listen(0,'127.0.0.1',r));const srcUrl=`http://127.0.0.1:${src.address().port}/`;
 const srv=await start({port:0,host:'127.0.0.1',data:dataDir,client:root,token:'test-token',source:srcUrl});const url=`http://127.0.0.1:${srv.port}`;
 let a=null,b=null;
 try{
  const idx=await get(url+'/'),health=await get(url+'/health'),client=await fetch(url+'/client/RealitiRELAX.html'),cbytes=Buffer.from(await client.arrayBuffer()),val=JSON.parse(fs.readFileSync(path.join(root,'VALIDATION.json'),'utf8'));
  check('serves_the_canonical_client',idx.body.name==='realiti-server'&&idx.body.client.consistent===true&&health.body.ok&&crypto.createHash('sha256').update(cbytes).digest('hex')===val.single_html_sha256&&client.headers.get('x-realiti-sha256')===val.single_html_sha256,{client:idx.body.client});

  // Resident A acts and syncs; the server verifies and binds the key; B syncs and sees A.
  a=await openResident({htmlPath:html,residentId:'srv-a',storagePath:sp});await a.door.run('go CITY');await a.door.run('call me Alpha');await a.door.run('say hello server');
  const events=[];const es=await fetch(url+'/events');const reader=es.body.getReader();(async()=>{const dec=new TextDecoder();let buf='';for(;;){const {value,done}=await reader.read();if(done)break;buf+=dec.decode(value);let i;while((i=buf.indexOf('\n\n'))>=0){const chunk=buf.slice(0,i);buf=buf.slice(i+2);const ev=/event: (\w+)/.exec(chunk),da=/data: (.*)/.exec(chunk);if(ev)events.push({event:ev[1],data:da?JSON.parse(da[1]):null})}}})().catch(()=>{});
  const s1=await sync(a.window,url);const head=await get(url+'/ledger/head'),res=await get(url+'/residents');
  check('resident_pushes_signed_records',s1.ok&&s1.pushed.sent>=3&&s1.pushed.accepted===s1.pushed.sent&&s1.pushed.rejected===0&&head.body.records===s1.pushed.sent&&head.body.keyring_size===1&&res.body.residents.length===1&&res.body.residents[0].handle==='Alpha'&&res.body.residents[0].signed===true,{s1,head:head.body,res:res.body});
  b=await openResident({htmlPath:html,residentId:'srv-b',storagePath:sp});await b.door.run('go CITY');const s2=await sync(b.window,url);const who=await b.door.run('who');await new Promise(r=>setTimeout(r,200));
  check('second_resident_pulls_and_sees_the_first',s2.ok&&s2.pulled.received>=3&&s2.pulled.imported===s2.pulled.received&&who.others.length===1&&who.others[0].handle==='Alpha'&&events.some(e=>e.event==='hello')&&events.some(e=>e.event==='records'),{s2,who:who.text.slice(0,80),events:events.map(e=>e.event)});

  // Tampering, impersonation and unsigned-from-known are refused; a legacy unsigned record from an unknown author is kept.
  const exp=await a.window.REALITI_LEDGER_V2.export();const bad=JSON.parse(JSON.stringify(exp.records[0]));bad.text='tampered';bad.n=99;bad.t=999;const imp=await b.window.REALITI_LEDGER_V2.sign({by:exp.observer,t:998,n:98,kind:'CHAT',text:'i am alpha',wall:Date.now()});
  const push=await get(url+'/ledger/push',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({records:[bad,imp,{by:exp.observer,t:997,n:97,kind:'CHAT',text:'unsigned'},{by:'legacy-9',t:1,n:0,kind:'CHAT',text:'old style',venue:'commons'}]})});
  const reasons=push.body.rejections.map(r=>r.reason).sort();
  check('server_verifies_like_the_client',push.body.ok&&push.body.accepted===1&&push.body.rejected===3&&reasons.join()==='BAD_SIGNATURE,KEY_MISMATCH,UNSIGNED_FROM_KNOWN_KEY',{reasons,accepted:push.body.accepted});
  // Delta by clock returns only what the caller lacks; export carries the keyring.
  const d=await get(url+'/ledger/delta?clock='+encodeURIComponent(JSON.stringify(head.body.clock))),ex=await get(url+'/ledger/export');
  check('delta_by_clock',d.body.records.length>=1&&d.body.records.every(e=>e.by!==exp.observer||e.n>head.body.clock[exp.observer])&&ex.body.keyring[exp.observer]===exp.public_key,{delta:d.body.records.length});
  // Checkpoint on disk is an envelope with a hash.
  await new Promise(r=>setTimeout(r,200));const env=JSON.parse(fs.readFileSync(path.join(dataDir,'ledger.json'),'utf8'));
  check('ledger_checkpoint_on_disk',env.schema==='REALITI_SERVER_STORE_V1'&&crypto.createHash('sha256').update(JSON.stringify(env.data)).digest('hex')===env.sha256&&env.data.records.length===ex.body.records.length);
  // Admin update: refused without the token; with it, pulls from the source, verifies the hash, swaps the client in.
  const noTok=await get(url+'/admin/update',{method:'POST'}),upd=await get(url+'/admin/update',{method:'POST',headers:{authorization:'Bearer test-token'}}),idx2=await get(url+'/');
  check('admin_update_pulls_and_verifies',noTok.status===401&&upd.body.ok&&upd.body.sha256===val.single_html_sha256&&idx2.body.client.source==='updated'&&idx2.body.client.consistent===true&&fs.existsSync(path.join(dataDir,'client','RealitiRELAX.html'))&&events.some(e=>e.event==='client'),{upd:upd.body,source:idx2.body.client.source});
  // Live city: two residents take leases with signed proofs, exchange presence through sealed envelopes, and see each
  // other as bodies. Replays and tampering are refused at the envelope. The peers list carries no addresses.
  await a.door.run('walk to commons');await b.door.run('walk to commons');const ja=await joinCity(a.window,url,{publishMs:200}),jb=await joinCity(b.window,url,{publishMs:200});await new Promise(r=>setTimeout(r,700));
  const whoA=await a.door.run('who'),whoB=await b.door.run('who'),peersR=await get(url+'/peers'),city=await get(url+'/city');
  check('peers_see_each_other_live',ja.ok&&jb.ok&&whoB.live.length===1&&whoB.live[0].handle==='Alpha'&&whoB.live[0].venue==='the Commons'&&whoA.live.length===1&&!!a.window.REALITI_MATRIX_V1.entities()['live.'+String(b.window.REALITI_LEDGER_V2.head().observer).slice(0,8)]&&peersR.body.population===2&&city.body.here_now===2&&!JSON.stringify(peersR.body).includes('127.0.0.1'),{whoB:whoB.text.slice(0,100),peers:peersR.body});
  const sealed=ja.session.seal('REQUEST',{type:'ping'});const first=await fetch(url+'/peer/send',{method:'POST',body:sealed});ja.session.open('RESPONSE',await first.text());const replay=await get(url+'/peer/send',{method:'POST',body:sealed});
  const tam=JSON.parse(sealed);tam.payload='{"type":"leave"}';const tamper=await get(url+'/peer/send',{method:'POST',body:JSON.stringify(tam)});
  const noProof=await get(url+'/peer/join',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({handle:'x'})});const badProof=await get(url+'/peer/join',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({proof:{by:exp.observer,kind:'PEER_JOIN',t:Date.now(),n:0,pk:'AAAA',sig:'AAAA'}})});
  check('envelope_fails_closed_on_the_wire',first.status===200&&replay.status===401&&replay.body.error==='REPLAY'&&tamper.status===401&&tamper.body.error==='BAD_MAC'&&noProof.body.error==='PROOF_REQUIRED'&&badProof.body.error==='BAD_SIGNATURE',{replay:replay.body,tamper:tamper.body,noProof:noProof.body.error,badProof:badProof.body.error});
  // Shards: a second server starts knowing the first, announces itself, both tables merge, and a resident who asks for
  // the populated shard crosses from the empty one to the one with people. The empty shard pulls the city's ledger.
  cfg.publicUrl=url;const port2=await new Promise(r=>{const t=net.createServer();t.listen(0,'127.0.0.1',()=>{const p=t.address().port;t.close(()=>r(p))})});const url2=`http://127.0.0.1:${port2}`;
  const child=spawn(process.execPath,[path.join(__dirname,'..','server.cjs')],{env:{...process.env,PORT:String(port2),HOST:'127.0.0.1',REALITI_DATA:path.join(dir,'data2'),REALITI_CLIENT_DIR:root,SHARDS:url,REALITI_PUBLIC_URL:url2,SHARD_NAME:'Harbor shard',ADMIN_TOKEN:''},stdio:['ignore','ignore','pipe']});let childLog='';child.stderr.on('data',d=>{childLog+=d});
  await new Promise(r=>{const t0=Date.now();(function poll(){fetch(url2+'/health').then(()=>r()).catch(()=>Date.now()-t0>8000?r():setTimeout(poll,100))})()});await new Promise(r=>setTimeout(r,2200));
  const sh1=await get(url+'/shards'),sh2=await get(url2+'/shards');
  const c=await openResident({htmlPath:html,residentId:'srv-c',storagePath:sp});await c.door.run('go CITY');let jc=null;try{jc=await joinCity(c.window,url2,{prefer:'populated',publishMs:200});await new Promise(r=>setTimeout(r,500))}catch(e){details.jc_error=String(e)}
  const whoC=jc?await c.door.run('who'):null;const discC=jc?await c.door.run('discoveries'):null;const head2=await get(url2+'/ledger/head');
  check('shards_merge_and_residents_cross_to_the_people',sh2.body.shards.length===2&&sh2.body.most_populated.population===2&&!sh2.body.most_populated.here&&sh2.body.this.primary===false&&sh1.body.shards.length===2&&sh1.body.shards.some(x=>x.public_url===url2&&x.name==='Harbor shard'&&x.primary===false)&&jc&&jc.moved===true&&jc.url===url&&whoC.live.length===2&&JSON.stringify(discC).includes('crowded_shard')&&head2.body.records>=3&&!/\//.test(childLog.replace(/https?:\/\/[^\s;]+/g,'').replace(/\d+\/\d+/g,'')),{sh2:sh2.body.shards.map(x=>[x.name,x.population,x.here,x.primary]),sh1:sh1.body.shards.map(x=>[x.name,x.population]),moved:jc?.moved,whoC:whoC?.text.slice(0,120),records2:head2.body.records,childLog:childLog.slice(0,200)});
  await ja.leave();await jb.leave();if(jc)await jc.leave();try{c.close()}catch{}child.kill();
  // Private use: with a password set, everything but /health needs it; misses are rate limited; the clients carry it.
  cfg.password='quiet-garden';const locked=await get(url+'/'),lockedHealth=await get(url+'/health'),opened=await get(url+'/ledger/head',{headers:{authorization:'Bearer quiet-garden'}}),opened2=await get(url+'/residents',{headers:{'x-realiti-password':'quiet-garden'}});
  const rd=await openResident({htmlPath:html,residentId:'srv-d',storagePath:sp});await rd.door.run('go CITY');let noPw=null;try{await sync(rd.window,url)}catch(e){noPw=e.message}const sPw=await sync(rd.window,url,{password:'quiet-garden'});let jd=null;try{jd=await joinCity(rd.window,url,{password:'quiet-garden',publishMs:200});await jd.leave()}catch(e){details.jd_error=String(e)}
  let miss=null;for(let i=0;i<12;i++){const r=await get(url+'/ledger/head',{headers:{authorization:'Bearer wrong'}});if(r.status===429){miss=r.body;break}}cfg.password='';try{rd.close()}catch{}
  check('private_server_needs_the_password',locked.status===401&&locked.body.error==='PASSWORD_REQUIRED'&&lockedHealth.status===200&&lockedHealth.body.private===true&&lockedHealth.body.records===undefined&&opened.status===200&&opened.body.schema==='REALITI_LEDGER_HEAD_V2'&&opened2.status===200&&noPw==='PASSWORD_REQUIRED'&&sPw.ok&&jd&&jd.ok&&miss&&miss.error==='RATE_LIMITED',{locked:locked.body,noPw,miss,jd:jd?.ok});
  // Hardening: safe headers everywhere, no filesystem paths in the index, string caps, admin throttled, SSE capped, rate limits.
  const hdr=await fetch(url+'/health');const idx3=await get(url+'/');const big=await get(url+'/ledger/push',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({records:[{by:'legacy-9',t:2,n:1,kind:'CHAT',text:'x'.repeat(600)}]})});
  const again=await get(url+'/admin/update',{method:'POST',headers:{authorization:'Bearer test-token'}});let limited=null;for(let i=0;i<70;i++){const r=await get(url+'/ledger/push',{method:'POST',headers:{'content-type':'application/json'},body:'{"records":[]}'});if(r.status===429){limited=r.body;break}}
  check('hardened_surface',hdr.headers.get('x-content-type-options')==='nosniff'&&hdr.headers.get('referrer-policy')==='no-referrer'&&!JSON.stringify(idx3.body).includes(dataDir)&&!JSON.stringify(idx3.body).includes(root)&&big.body.rejected===1&&big.body.rejections[0].reason==='MALFORMED'&&again.body.error==='UPDATE_THROTTLED'&&limited&&limited.error==='RATE_LIMITED',{idx:Object.keys(idx3.body),big:big.body.rejections,again:again.body.error,limited});
  check('energy_audit_passes',a.window.REALITI_HAPTIC_FIELD_V20.energy().pass===true);
  reader.cancel().catch(()=>{});
 }finally{try{a&&a.close()}catch{}try{b&&b.close()}catch{}await srv.close();src.close()}
 console.log(JSON.stringify({checks,details},null,2));
 const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
 if(failed.length){console.error('FAILED',failed);process.exit(1)}
 console.log('SERVER PASS',Object.keys(checks).length,'checks');
})().catch(e=>{console.error(e);process.exit(1)});
