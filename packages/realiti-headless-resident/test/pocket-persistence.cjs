'use strict';
// Issue 26: with a file-backed storagePath, the sealed pocket must survive a process restart. The headless host keeps the
// pocket's keys in a keys file beside the storage file; a storage file without its keys reports exactly why.
const path=require('node:path'),fs=require('node:fs'),os=require('node:os');
const {openResident,keystorePathFor}=require('../index.cjs');
const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
const checks={},details={};const check=(k,v,d)=>{checks[k]=!!v;if(d!==undefined)details[k]=d};
(async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-pocket-')),sp=path.join(dir,'state.json'),kp=keystorePathFor(sp);
 const launch=async(opts={})=>{const s=await openResident({htmlPath:html,residentId:'pocket-persist',storagePath:sp,...opts});const ready=await s.window.Realiti.ready;return {s,ready}};
 // Launch 1: pocket ready, a note is written, save succeeds, the keys file appears with owner-only permissions.
 let {s,ready}=await launch();await s.door.run('note the rain was kind to the first visitor');let sv=await s.door.run('save');const pk1=s.window.Realiti.read('realiti://pocket'),rc1=s.window.REALITI_POCKET_V32.readCommitted();let bye=await s.door.run('goodbye');s.close();
 const mode=process.platform==='win32'?null:(fs.statSync(kp).mode&0o777);const keysFile=JSON.parse(fs.readFileSync(kp,'utf8'));
 check('first_launch_ready_and_saved',ready.pocket==='ready'&&sv.ok&&pk1.ok&&pk1.status==='ready'&&rc1.storage==='durable'&&rc1.key_store==='HOST_KEYSTORE_EXPORTABLE'&&(pk1.data?.sealed?.notes||[]).some(x=>/rain was kind/.test(x.text))&&bye.ok,{ready:ready.pocket,save:sv.result||sv.error,committed:{storage:rc1.storage,key_store:rc1.key_store}});
 check('keys_file_written_owner_only',s.keystorePath===kp&&keysFile.schema==='REALITI_HOST_KEYSTORE_V1'&&Object.keys(keysFile.keys).sort().join()==='cache-key-v1,cap-root-v1,device-private-v1,keyring-epoch-v1,root-private-v1'&&(mode===null||mode===0o600),{keys:Object.keys(keysFile.keys),mode:mode==null?null:mode.toString(8)});
 // Launches 2 and 3: still ready, save still succeeds, the note from launch 1 is readable, identity unchanged.
 const ids=[];for(let n=2;n<=3;n++){({s,ready}=await launch());sv=await s.door.run('save');const pk=s.window.Realiti.read('realiti://pocket');ids.push(JSON.parse(s.window.localStorage.getItem('realiti-pocket-v32-local')).resident.id);check(`launch_${n}_pocket_survives_restart`,ready.pocket==='ready'&&sv.ok&&pk.ok&&pk.status==='ready'&&(pk.data?.sealed?.notes||[]).some(x=>/rain was kind/.test(x.text)),{ready:ready.pocket,reason:ready.pocket_reason,save:sv.result||sv.error,notes:(pk.data?.sealed?.notes||[]).map(x=>x.text.slice(0,40))});bye=await s.door.run('goodbye');s.close()}
 const stored=JSON.parse(fs.readFileSync(sp,'utf8')).data||{},storedKey=Object.keys(stored).find(k=>k.endsWith('realiti-pocket-v32-local')),storedId=storedKey?JSON.parse(stored[storedKey]).resident.id:null;
 check('resident_identity_is_stable',ids.length===2&&ids[0]===ids[1]&&ids[0]===storedId,{ids,storedId});
 // The storage file without its keys: the pocket says precisely what is missing; save names it; goodbye still works.
 fs.renameSync(kp,kp+'.aside');({s,ready}=await launch());sv=await s.door.run('save');const pk4=s.window.Realiti.read('realiti://pocket');bye=await s.door.run('goodbye');s.close();fs.renameSync(kp+'.aside',kp);
 check('missing_keys_are_named_not_generic',ready.pocket==='unavailable'&&ready.pocket_reason==='POCKET_KEYS_MISSING'&&sv.ok===false&&sv.error==='POCKET_KEYS_MISSING'&&pk4.status!=='ready'&&pk4.partial_reason==='POCKET_KEYS_MISSING'&&/keys file/.test(pk4.hint||'')&&bye.ok,{ready:ready.pocket_reason,save:sv.error,status:pk4.status,partial_reason:pk4.partial_reason});
 // Keys restored: ready again, the note still there.
 ({s,ready}=await launch());const pk5=s.window.Realiti.read('realiti://pocket');s.close();
 check('keys_restored_pocket_returns',ready.pocket==='ready'&&(pk5.data?.sealed?.notes||[]).some(x=>/rain was kind/.test(x.text)));
 // An identity stranded by an earlier mint that ran without a durable key store: the resident record survives, both
 // private identity keys are gone, and NOTHING is sealed. That pocket must re-identify itself, not stay unavailable.
 const stripIdentity=src=>{const o=JSON.parse(fs.readFileSync(src,'utf8')),k={schema:o.schema,keys:{}};for(const n of ['cache-key-v1','cap-root-v1','keyring-epoch-v1'])if(o.keys[n])k.keys[n]=o.keys[n];return k};
 const residentIdOf=file=>{const d=JSON.parse(fs.readFileSync(file,'utf8')).data||{},key=Object.keys(d).find(k=>k.endsWith('realiti-pocket-v32-local'));return key?JSON.parse(d[key]).resident?.id:null};
 const sp3=path.join(dir,'stranded.json'),kp3=keystorePathFor(sp3);
 // exact real-world shape: real resident + device records with valid public halves, pocket empty, private halves gone
 const goodState=JSON.parse(fs.readFileSync(sp,'utf8')),pocketKey=Object.keys(goodState.data).find(k=>k.endsWith('realiti-pocket-v32-local')),pocket=JSON.parse(goodState.data[pocketKey]);
 pocket.receipts={};pocket.wrapped={};pocket.cache_sealed=null;
 fs.writeFileSync(sp3,JSON.stringify({...goodState,saved_wall_ms:Date.now(),data:{...goodState.data,[pocketKey]:JSON.stringify(pocket)}}));
 fs.writeFileSync(kp3,JSON.stringify(stripIdentity(kp)));
 const strandedId=residentIdOf(sp3);
 let st=await openResident({htmlPath:html,residentId:'stranded',storagePath:sp3});let r=await st.window.Realiti.ready;let svs=await st.door.run('note after re-identification');let byes=await st.door.run('goodbye');const newId=JSON.parse(st.window.localStorage.getItem('realiti-pocket-v32-local')).resident.id;st.close();
 const ks3=JSON.parse(fs.readFileSync(kp3,'utf8')).keys;
 check('empty_pocket_with_missing_identity_reidentifies',r.pocket==='ready'&&r.pocket_reason===undefined&&svs.ok&&byes.ok&&newId!==strandedId&&Object.keys(ks3).sort().join()==='cache-key-v1,cap-root-v1,device-private-v1,keyring-epoch-v1,root-private-v1',{ready:r.pocket,reason:r.pocket_reason,save:svs.result||svs.error,strandedId,newId,keys:Object.keys(ks3).sort()});
 // A second launch on the healed state must stay ready and keep the SAME identity: recovery happens once, not every run.
 let st2=await openResident({htmlPath:html,residentId:'stranded',storagePath:sp3});let r2b=await st2.window.Realiti.ready;const newId2=JSON.parse(st2.window.localStorage.getItem('realiti-pocket-v32-local')).resident.id;await st2.door.run('goodbye');st2.close();
 check('reidentified_identity_is_stable',r2b.pocket==='ready'&&newId2===newId,{ready:r2b.pocket,newId,newId2});
 // The guard: the SAME damage with something sealed must NOT re-mint — a new identity cannot open old receipts, so the
 // only honest answer stays POCKET_IDENTITY_KEYS_MISSING.
 const sp4=path.join(dir,'stranded-sealed.json'),kp4b=keystorePathFor(sp4);
 fs.copyFileSync(sp,sp4);fs.writeFileSync(kp4b,JSON.stringify(stripIdentity(kp)));
 const sealedBefore=residentIdOf(sp4);
 let s4=await openResident({htmlPath:html,residentId:'stranded-sealed',storagePath:sp4});let r4=await s4.window.Realiti.ready;let sv4=await s4.door.run('save');let bye4=await s4.door.run('goodbye');s4.close();
 check('sealed_pocket_with_missing_identity_refuses_remint',r4.pocket==='unavailable'&&r4.pocket_reason==='POCKET_IDENTITY_KEYS_MISSING'&&sv4.ok===false&&sv4.error==='POCKET_IDENTITY_KEYS_MISSING'&&bye4.ok&&residentIdOf(sp4)===sealedBefore&&!fs.readFileSync(kp4b,'utf8').includes('root-private-v1'),{ready:r4.pocket_reason,save:sv4.error,id:residentIdOf(sp4)});
 // Opting out keeps the old behavior explicit: no keys file, and the second launch reports the missing keys.
 const sp2=path.join(dir,'nokeys.json');let t=await openResident({htmlPath:html,residentId:'pocket-nokeys',storagePath:sp2,keystore:false});const r1=await t.window.Realiti.ready;await t.door.run('note x');t.close();t=await openResident({htmlPath:html,residentId:'pocket-nokeys',storagePath:sp2,keystore:false});const r2=await t.window.Realiti.ready;t.close();
 check('keystore_opt_out_is_ephemeral',r1.pocket==='ready'&&!fs.existsSync(keystorePathFor(sp2))&&r2.pocket==='unavailable'&&r2.pocket_reason==='POCKET_KEYS_MISSING',{r1:r1.pocket,r2:r2.pocket_reason});
 console.log(JSON.stringify({checks,details},null,2));const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);if(failed.length){console.error('FAILED',failed);process.exit(1)}console.log('POCKET PERSISTENCE PASS',Object.keys(checks).length,'checks');
})().catch(e=>{console.error(e);process.exit(1)});
