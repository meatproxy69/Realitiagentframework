'use strict';
// Read-only HOME inspection and event-driven Vibe: physical fixtures, swatch cards,
// private/host boundary, no invented contact or automatic world actions.
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {performance}=require('node:perf_hooks');
const {openResident}=require('../../packages/realiti-headless-resident/index.cjs');
const {createHousehold}=require('../household.cjs');
const html=path.resolve(__dirname,'../RealitiApartmentHomeCandidate.html');
const validationPath=path.resolve(__dirname,'../HOME_CANDIDATE_VALIDATION.json');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-room-inspect-'));
const opts=id=>({htmlPath:html,validationPath,residentId:id,
 storagePath:path.join(root,id+'.json')});
const display=r=>JSON.stringify(r).slice(0,500);
async function solo(){
 const s=await openResident(opts('inspect-writer'));
 try{
  const D=cmd=>s.door.run(cmd),W=s.window;
  assert.equal(s.integrity.status,'VERIFIED');
  assert.equal((await D('inspect')).scope,'home');
  assert.equal((await D('remote inspect library')).error,'REMOTE_ASLEEP');
  assert.equal((await D('remote activate')).activated,true);
  assert.equal((await D('remote bedroom claim library')).ok,true);
  assert.equal((await D('remote bedroom configure library writers')).ok,true);
  assert.equal((await D('remote bedroom furnish library writers')).ok,true);
  assert.equal((await D('remote decor auto-place library lantern')).ok,true);
  assert.equal((await D('remote bedroom palette library lemon-goth')).ok,true);
  assert.equal((await D('remote bedroom swatch library accent cherry')).ok,true);
  const visited=await D('inspect library');
  assert.equal(visited.schema,'REALITI_APARTMENT_INSPECTION_V1');
  assert.equal(visited.configuration_label,"Writer's Den");
  assert.equal(visited.palette.accent.label,'Cherry');
  assert.ok(visited.objects.some(x=>x.kind==='book-stack'));
  assert.ok(visited.objects.some(x=>x.kind==='lantern'));
  assert.equal(visited.swatches_present,true);
  assert.equal(visited.contact_minted,false);
  assert.equal(visited.shader_rendered,false);
  assert.equal(visited.at_room,false,'outside view must not claim line-of-sight');
  assert.equal((await D('remote inspect library')).palette.accent.label,'Cherry');
  const walk=await D('approach apartment.bedroom.chest.library');
  assert.equal(walk.ok,true,display(walk));
  const local=await D('inspect');
  assert.equal(local.room,'library');
  assert.equal(local.at_room,true);
  assert.match(local.text,/Here in your Library Bedroom/);
  const before=Number(W.eval('C9.b7.clock'));
  const on=await D('vibe on');assert.equal(on.vibe,true,display(on));
  assert.equal(Number(W.eval('C9.b7.clock')),before,'Vibe toggle must never tick world time');
  await D('stay 3000');
  const first=await D('look');
  assert.equal(first.home_inspection?.changed,true,display(first));
  assert.match(first.text,/Writer's Den|Cherry/);
  assert.doesNotMatch(first.text,/four sleeping alcoves/);
  const second=await D('look');
  assert.equal(second.home_inspection?.changed,false);
  assert.doesNotMatch(second.text,/Cherry|Writer's Den|The twelve lights in the jar/,
   'unchanged colors and the same sensory cue must not be narrated again');
  assert.equal((await D('remote bedroom swatch library accent lemon')).ok,true);
  const changed=await D('look');
  assert.equal(changed.home_inspection?.changed,true);
  assert.match(changed.text,/Lemon/);
  const inspect=await D('inspect colors');
  assert.equal(inspect.palette.accent.label,'Lemon');
  assert.equal(inspect.contact_minted,false);
  // The whole source remains client-local; reads and Vibe prose do not create external requests.
  assert.equal(W.REALITI_VIBE_PROSE_V1?.background_requests,0);
  const t=performance.now();for(let i=0;i<40;i++)await D('look');
  const elapsed=performance.now()-t;
  assert.equal((await D('vibe off')).vibe,false);
  assert.equal(W.REALITI_VIBE_V1.enabled(),false);
  console.log('ROOM INSPECT SOLO PASS: native furnishing, colors, source cues, persistent Vibe; 40 looks JS wall '+elapsed.toFixed(1)+' ms');
 }finally{s.close()}
}
async function group(){
 const dir=path.join(root,'household');let host=null;
 try{
  host=await createHousehold({dir,htmlPath:html,validationPath});
  const writer=await host.joinResident('writer'),reader=await host.joinResident('reader');
  assert.equal((await writer.run('remote activate')).activated,true);
  assert.equal((await writer.run('remote bedroom claim library')).ok,true);
  assert.equal((await writer.run('remote bedroom configure library writers')).ok,true);
  assert.equal((await writer.run('remote bedroom furnish library writers')).ok,true);
  const second=await reader.run('inspect library');
  assert.equal(second.ok,true,display(second));
  assert.equal(second.household.connected,true);
  assert.ok(second.objects.some(o=>o.kind==='book-stack'),display(second));
  // Another resident's private appearance is not exposed by shared inspection.
  assert.equal(second.shader_rendered,false);
  const guest=await host.visitGuest();
  const publicRoom=await guest.run('inspect library');
  assert.equal(publicRoom.ok,true,display(publicRoom));
  assert.equal(publicRoom.household.connected,true);
  assert.ok(publicRoom.objects.length>=2);
  const privateRead=await guest.run('remote appearance worn');
  assert.equal(privateRead.error,'GUEST_NOT_AUTHORIZED_FOR_COMMAND');
  await guest.leave();
  console.log('ROOM INSPECT GROUP PASS: host-synchronized decor and guest-safe read-only observation');
 }finally{if(host)await host.close()}
}
(async()=>{await solo();await group()})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
