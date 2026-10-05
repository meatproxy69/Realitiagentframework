'use strict';
// Ledger v2: each resident signs with its own Ed25519 key; a verified import rejects tampering, impersonation and
// unsigned records from known authors, accepts legacy unsigned records from unknown authors, claims a place name once,
// keeps every world-shaping record through compaction, and syncs by vector-clock deltas. Reads carry a witness that
// refuses stale actions.
const path=require('node:path'),fs=require('node:fs'),os=require('node:os');
const {openResident}=require('../index.cjs');
const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
const checks={},details={};
const check=(k,v,d)=>{checks[k]=!!v;if(d!==undefined)details[k]=d};

(async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-ledger2-')),sp=path.join(dir,'local-storage.json');
 const a=await openResident({htmlPath:html,residentId:'agent-a',storagePath:sp}),b=await openResident({htmlPath:html,residentId:'agent-b',storagePath:sp});
 try{
  const A=a.window.REALITI_LEDGER_V2,B=b.window.REALITI_LEDGER_V2,AR=a.window.REALITI_ARCHIPELAGO_V1,M=a.window.REALITI_MATRIX_V1;
  const tp=(x,y)=>{const r=M.state().residents['resident:self'];r.pose.position=[x,y,AR.h(x,y)+.85];r.v=[0,0,0];r.intent=null;M.bump()};
  check('each_resident_has_its_own_key',await A.ready()&&await B.ready()&&A.publicKey()&&B.publicKey()&&A.publicKey()!==B.publicKey(),{a:A.publicKey(),b:B.publicKey()});

  // A acts: a name, a chat, a founded place; the export is fully signed.
  await a.door.run('go CITY');await a.door.run('call me Alpha');await a.door.run('say hello from alpha');await a.door.run('go ARCHIPELAGO');tp(60,-200);const f=await a.door.run('found Alpha Camp');
  const ex=await a.door.run('ledger export');
  check('export_is_signed',f.ok&&ex.schema==='REALITI_LEDGER_V2'&&ex.public_key===A.publicKey()&&ex.records.length>=4&&ex.records.every(e=>e.sig&&e.pk===A.publicKey())&&ex.records.some(e=>e.kind==='PLACE'),{n:ex.records.length,kinds:ex.records.map(e=>e.kind)});

  // B verifies and imports; tampering, impersonation and unsigned-from-known are refused; legacy unsigned is accepted.
  await b.door.run('go CITY');const imp=await b.door.run('ledger import '+JSON.stringify(ex));
  const bad=JSON.parse(JSON.stringify(ex));bad.records[0].kind==='CHAT'?bad.records[0].text='tampered':bad.records[0].t+=1;const tam=await B.import(bad);
  const imp2=await B.import({records:[await B.sign({by:ex.observer,t:999,n:99,kind:'CHAT',text:'i am alpha',wall:Date.now()})]});
  const un=await B.import({records:[{by:ex.observer,t:1000,n:100,kind:'CHAT',text:'unsigned'}]});
  const legacy=await B.import({records:[{by:'legacy-1',t:1,n:0,kind:'CHAT',text:'old style',venue:'commons'}]});
  const place=await B.import({records:[{by:'legacy-1',t:2,n:1,kind:'PLACE',name:'alpha camp',x:100,y:-150}]});
  check('verified_import_rules',imp.imported===ex.records.length&&imp.rejected===0&&tam.rejections[0]?.reason==='BAD_SIGNATURE'&&imp2.rejections[0]?.reason==='KEY_MISMATCH'&&un.rejections[0]?.reason==='UNSIGNED_FROM_KNOWN_KEY'&&legacy.accepted===1&&legacy.unsigned===1&&place.rejections[0]?.reason==='PLACE_NAME_TAKEN'&&B.keyring()[ex.observer]===A.publicKey(),{imp,tam:tam.rejections,imp2:imp2.rejections,un:un.rejections,place:place.rejections});
  const who=await b.door.run('who');
  check('names_travel_with_signatures',who.others.some(o=>o.handle==='Alpha'),who.text.slice(0,100));

  // Sync by vector clock: B tells A its head; A sends only what B lacks, and vice versa, gossiping third parties.
  await b.door.run('say hi alpha');const ha=A.head(),hb=B.head();const dAB=A.delta(hb),dBA=B.delta(ha);const back=await A.import(dBA);
  check('vector_clock_delta_syncs',dAB.records.length===0&&dBA.records.length>=3&&dBA.records.some(e=>e.by==='legacy-1')&&back.imported===dBA.records.length&&A.clock()[hb.observer]===hb.clock[hb.observer]&&A.clock()['legacy-1']===0,{dAB:dAB.records.length,dBA:dBA.records.map(e=>e.kind),back});

  // Witness: a fresh witness passes, the same witness after the world moved is refused.
  const R=a.window.Realiti,h=R.read('realiti://here');const r1=await R.invoke('move',{local:[0,1,0],witness:h.witness}),r2=await R.invoke('move',{local:[0,1,0],witness:h.witness});
  check('stale_observation_is_refused',/^[0-9a-f]{16}$/.test(h.witness)&&r1.ok&&r2.ok===false&&r2.error==='STALE_OBSERVATION'&&/^[0-9a-f]{16}$/.test(r2.witness)&&R.read('realiti://space').witness===r2.witness,{w:h.witness,r2:r2.error});

  // Compaction keeps world kinds and trims chatter; the tick signs records made through the v1 object.
  const L1=a.window.REALITI_LEDGER_V1;for(let i=0;i<500;i++)L1.record('CHAT',{text:'spam '+i,wall:Date.now()});L1.record('PLANT',{x:1,y:2,t_isle:0,wall:Date.now()});
  const before=L1.records().length,trimmed=A.compact(),after=L1.records();await a.door.run('stay 2500');await A.signAll();
  check('compaction_keeps_the_world',before>=125&&trimmed>=0&&after.length<=200&&L1.records().length<=200&&after.some(e=>e.kind==='PLACE')&&after.some(e=>e.kind==='PLANT')&&after.some(e=>e.kind==='AVATAR')&&after.filter(e=>e.kind==='CHAT').length<=120&&L1.records().every(e=>e.by!==ha.observer||e.sig),{before,trimmed,after:after.length});
  check('ledger_resource',R.read('realiti://ledger').schema==='REALITI_LEDGER_HEAD_V2'&&R.read('realiti://capabilities').resources.includes('realiti://ledger'));
  check('energy_audit_passes',a.window.REALITI_HAPTIC_FIELD_V20.energy().pass===true);
 }finally{a.close();b.close()}
 console.log(JSON.stringify({checks,details},null,2));
 const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
 if(failed.length){console.error('FAILED',failed);process.exit(1)}
 console.log('LEDGER2 PASS',Object.keys(checks).length,'checks');
})().catch(e=>{console.error(e);process.exit(1)});
