'use strict';
// Final prelaunch rehearsal for the *derived* native V20 world.
// All identities and stores are disposable; do not mount real resident data.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {createNativeInhabited}=require('./native-inhabited.cjs');
const temp=()=>fs.mkdtempSync(path.join(os.tmpdir(),'realiti-v20-final-'));
const allCharts=w=>Object.keys(w.REALITI_MATRIX_V1.charts());
const savedLooks=w=>w.REALITI_APARTMENT_STYLE_BINDER_V1.binder();
const cloud=w=>w.REALITI_APARTMENT_BED_CLOUD_V1.status();
async function closeSafely(session){if(session)await session.trusted.close()}

test('native V20 private style survives owner restart while an unrelated resident stays isolated',async()=>{
 const directory=temp(),alpha=path.join(directory,'owner.json'),beta=path.join(directory,'visitor.json');
 let first=null,reopened=null,other=null;
 try{
  first=await createNativeInhabited({residentId:'preflight:owner',storagePath:alpha});
  const w=first.trusted.native.window;
  assert.equal(first.trusted.native.integrity.status,'VERIFIED');
  assert.equal(allCharts(w).length,23);
  assert.deepEqual(Object.keys(first.guest).sort(),['act','look','speak']);
  const publicBefore=w.eval('C9.ledger?.records?.length||0');
  assert.equal((await first.guest.act('remote activate')).ok,true);
  assert.equal((await first.guest.act('remote style begin')).ok,true);
  assert.equal((await first.guest.act('remote style swatch accent cherry')).ok,true);
  assert.equal((await first.guest.act('remote style binder commit preflight-home')).ok,true);
  assert.equal(savedLooks(w).generations.length,1);
  assert.equal(savedLooks(w).generations[0].id,'G1');
  assert.match(savedLooks(w).generations[0].sha256,/^[a-f0-9]{64}$/);
  assert.equal(w.eval('C9.ledger?.records?.length||0'),publicBefore,
   'private style choices must not appear on the City ledger');
  const started=await first.guest.act('cloud on');
  assert.equal(started.ok,true,started.message);
  assert.equal(cloud(w).active,true);
  assert.equal((await first.guest.act('cloud wave')).ok,true);
  assert.equal((await first.guest.act('stop')).ok,true);
  assert.equal(cloud(w).active,false,'STOP releases Cloud Ocean');
  await closeSafely(first);first=null;
  assert.equal(fs.existsSync(alpha),true,'actual checkpoint must have been written');
  reopened=await createNativeInhabited({residentId:'preflight:owner',storagePath:alpha});
  const restored=reopened.trusted.native.window;
  assert.equal(reopened.trusted.native.integrity.status,'VERIFIED');
  assert.equal(allCharts(restored).length,23);
  assert.equal(savedLooks(restored).generations.length,1,'owner private binder survives cold restart');
  assert.equal(savedLooks(restored).generations[0].label,'preflight-home');
  assert.equal(cloud(restored).active,false,'a closed session cannot resurrect an old Cloud lease');
  await closeSafely(reopened);reopened=null;
  other=await createNativeInhabited({residentId:'preflight:other',storagePath:beta});
  const isolated=other.trusted.native.window;
  assert.equal(allCharts(isolated).length,23);
  assert.equal(savedLooks(isolated).generations.length,0,
   'different resident must not receive previous owner private binder');
  assert.equal(cloud(isolated).active,false);
  assert.equal(isolated.eval('C9.ledger?.records?.some(x=>x.kind==="CHAT")||false'),false);
  console.log('V20_PRELAUNCH_PERSISTENCE_OK '+JSON.stringify({
   cold_restart:true,owner_binder_restored:true,foreign_binder_empty:true,
   cloud_lease_not_restored:true,private_files_uploaded:false}));
 }finally{
  await closeSafely(first);
  await closeSafely(reopened);
  await closeSafely(other);
  fs.rmSync(directory,{recursive:true,force:true});
 }
});

test('original full chart navigation and STOP do not grant new guest authority',async()=>{
 const s=await createNativeInhabited({residentId:'preflight:scope'});
 try{
  assert.ok(!Object.hasOwn(s.guest,'trusted'));
  assert.ok(!Object.hasOwn(s.guest,'native'));
  const w=s.trusted.native.window;
  const ledger=w.REALITI_LEDGER_V2;
  assert.equal(await ledger.ready(),true);
  const initial=w.eval('C9.ledger?.records?.length||0');
  const utterance=await s.guest.speak('A private statement, never a public City record.');
  assert.equal(utterance.ok,true);
  assert.equal(w.eval('C9.ledger?.records?.length||0'),initial);
  assert.equal((await s.guest.act('go to city')).ok,true);
  assert.equal(allCharts(w).length,23);
  const before=await ledger.export();
  const publish=await s.guest.act('say Public by explicit resident choice.');
  assert.equal(publish.ok,true);
  const after=await ledger.export();
  assert.ok(after.records.some(r=>r.kind==='CHAT'&&r.text==='Public by explicit resident choice.'));
  assert.ok(!JSON.stringify(after.records).includes('A private statement'));
  assert.ok(after.records.length>before.records.length);
  assert.equal((await s.guest.act('go home')).ok,true);
  assert.equal((await s.guest.act('leave')).ok,true);
  await assert.rejects(()=>s.guest.act('go to city'),/V20_VISIT_CLOSED/,
    'closed session cannot act again');
  console.log('V20_PRELAUNCH_SCOPE_OK '+JSON.stringify({
   charts:23,private_speech_isolated:true,public_opt_in:true,closed_session_denied:true}));
 }finally{await s.trusted.close()}
});
