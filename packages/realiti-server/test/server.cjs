'use strict';
// The dedicated server: hosts the client with its hash, verifies pushed records, binds keys, serves deltas by clock,
// announces over server-sent events, lists residents, and hot-updates its client from a source after verifying the hash.
// Two headless residents sync through it and see each other.
const path=require('node:path'),fs=require('node:fs'),os=require('node:os'),http=require('node:http'),crypto=require('node:crypto');
const {openResident}=require('../../realiti-headless-resident/index.cjs');
const {sync}=require('../../realiti-headless-resident/sync.cjs');
const {start}=require('../server.cjs');
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
  check('energy_audit_passes',a.window.REALITI_HAPTIC_FIELD_V20.energy().pass===true);
  reader.cancel().catch(()=>{});
 }finally{try{a&&a.close()}catch{}try{b&&b.close()}catch{}await srv.close();src.close()}
 console.log(JSON.stringify({checks,details},null,2));
 const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
 if(failed.length){console.error('FAILED',failed);process.exit(1)}
 console.log('SERVER PASS',Object.keys(checks).length,'checks');
})().catch(e=>{console.error(e);process.exit(1)});
