'use strict';
// Bed Cloud Ocean is actual Matrix support + the original Relax B17 envelope,
// native pressure-wave equation and resident-private NeuralMesh, not a fake room.
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {openResident}=require('../../packages/realiti-headless-resident/index.cjs');
const html=path.resolve(__dirname,'../RealitiApartmentHomeCandidate.html');
const validationPath=path.resolve(__dirname,'../HOME_CANDIDATE_VALIDATION.json');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-cloud-ocean-bed-'));
const opts={htmlPath:html,validationPath,residentId:'bed-ocean-resident',
 storagePath:path.join(dir,'world.json')};
(async()=>{
 let a=await openResident(opts);
 try{
  let W=a.window,D=cmd=>a.door.run(cmd),M=W.REALITI_MATRIX_V1,
   O=W.REALITI_APARTMENT_BED_CLOUD_V1;
  assert.equal(a.integrity.status,'VERIFIED');
  assert.deepEqual(Object.keys(M.charts()),['CLOUD_NINE_NEST']);
  assert.equal(Object.keys(M.portals()).length,0);
  const start=await D('cloud status');
  assert.equal(start.active,false);
  assert.equal(start.beds.length,1);
  assert.equal(start.beds[0].id,'nest.mattress');
  assert.ok(M.entities()[start.beds[0].switch_id]);
  assert.equal(start.neuromesh.active,true);
  const clock=Number(W.eval('C9.b7.clock'));
  const pose=Array.from(M.resident().pose.position),beforeW=M.resident().chart;
  const supportedBefore=W.REALITI_NEST_SUPPORT.state().zones.filter(z=>z.grounded).map(z=>z.z);
  const on=await D('cloud on');
  assert.equal(on.engaged,true,JSON.stringify(on).slice(0,500));
  assert.equal(on.native_receipt.type,'PILLOW_SUPPORT_ENVELOPE');
  assert.equal(on.native_receipt.source,'PILLOW_SEA_SUPPORT');
  assert.ok(on.native_receipt.zones.length>=4);
  assert.ok(on.native_receipt.zones.every(z=>supportedBefore.includes(z)),
   'Pillow Sea in HOME can only lease genuinely grounded bed support');
  assert.equal(on.native_receipt.zones.includes('shoulder.L'),false,
   'unsupported arm or shoulder may not acquire phantom contact');
  assert.equal(Number(W.eval('C9.b7.clock')),clock,'on switch cannot advance world time');
  assert.deepEqual(Array.from(M.resident().pose.position),pose,'no teleport or pose mutation');
  assert.equal(M.resident().chart,beforeW,'still in the original HOME');
  assert.equal((await D('cloud burrow')).mode,'burrow');
  assert.equal((await D('cloud bounce')).mode,'bounce');
  const swell=await D('cloud wave');
  assert.equal(swell.ok,true);
  assert.equal(swell.native_wave.room,'BOTTOMLESS_PILLOW_SEA');
  await D('stay 500');
  const wave=W.REALITI_DYNAMICS_V1.state().wave;
  assert.equal(wave.room,'BOTTOMLESS_PILLOW_SEA');
  assert.ok(wave.profile.some(x=>x>0));
  const privatePulse=await D('cloud mesh');
  assert.equal(privatePulse.ok,true);
  assert.equal(privatePulse.private_pulse.private_only,true);
  assert.equal(privatePulse.private_pulse.evidence_gain,0);
  const off=await D('cloud off');
  assert.equal(off.active,false);
  assert.equal(W.REALITI_DYNAMICS_V1.state().wave,null);
  assert.equal(O.status().active,false);
  assert.ok(!Object.values(W.eval('C9.b7.zones')).some(z=>
   z?._b10_grounded_source==='PILLOW_SEA_SUPPORT'&&
   z?._b10_grounded_until>=W.eval('C9.b7.clock')),
   'Native Pillow Sea support lease must not outlive the switch');
  assert.equal((await W.REALITI_APARTMENT_NATIVE_PILLOW_V1.engage('dive')).error,
   'CLOUD_OCEAN_REQUIRES_REAL_BED_SUPPORT','cannot bypass the switch via native bridge');
  assert.equal((await D('cloud on')).ok,true);
  assert.equal((await D('do stand')).ok,true);
  assert.equal(O.status().active,false,'standing cuts Cloud Ocean immediately');
  assert.equal((await D('cloud on')).error,'CLOUD_OCEAN_REQUIRES_REAL_BED_SUPPORT');
  assert.equal((await D('remote cloud status')).error,'REMOTE_ASLEEP');
  assert.equal((await D('remote activate')).activated,true);
  assert.equal((await D('remote bedroom claim canopy')).ok,true);
  const pad=await D('remote decor auto-place canopy sleeping-pad');
  assert.equal(pad.ok,true,JSON.stringify(pad).slice(0,400));
  const id='apartment.bedroom.item.'+pad.placed;
  assert.ok(M.entities()[id]?.tags.includes('support'));
  const listed=await D('cloud list');
  assert.ok(listed.beds.some(b=>b.id===id));
  assert.ok(M.entities()[listed.beds.find(b=>b.id===id).switch_id]);
  assert.equal((await D('approach '+id)).ok,true);
  const lie=await D('act lie__'+id);
  assert.equal(lie.ok,true,JSON.stringify(lie).slice(0,350));
  const padOn=await D('remote cloud on');
  assert.equal(padOn.ok,true,JSON.stringify(padOn).slice(0,350));
  assert.equal(padOn.bed,id);
  assert.ok(padOn.native_receipt.zones.length>=4);
  assert.equal(padOn.native_receipt.zones.some(z=>z.startsWith('shoulder.')||z.startsWith('arm.')),false);
  assert.equal((await D('cloud wave')).ok,true);
  await D('stay 300');
  assert.equal(O.status().active,true);
  const busy=await D('remote decor remove '+pad.placed);
  assert.equal(busy.error,'DECOR_ITEM_IN_USE','physical supporting pad cannot be removed during use');
  assert.equal((await D('remote off')).activated,false);
  assert.equal(O.status().active,false,'remote-off releases transient bed effect');
  assert.equal(W.REALITI_DYNAMICS_V1.state().wave,null);
  await D('remote activate');
  assert.equal((await D('remote cloud on')).ok,true);
  await D('stop');
  assert.equal(O.status().active,false);
  assert.equal(W.REALITI_DYNAMICS_V1.state().wave,null,'STOP cancels the real native wave');
  assert.equal((await D('save')).ok,true);
  a.close();a=null;
  a=await openResident(opts);
  W=a.window;D=cmd=>a.door.run(cmd);M=W.REALITI_MATRIX_V1;O=W.REALITI_APARTMENT_BED_CLOUD_V1;
  assert.equal(O.status().active,false,'Cloud Ocean must never silently resume from disk');
  assert.ok(O.status().beds.some(b=>b.id===id),'actual saved physical pads regain a switch');
  assert.equal(W.REALITI_DYNAMICS_V1.state().wave,null);
  console.log('CLOUD OCEAN PASS: real mattress + placed pad; native B17 envelope, damped pressure wave, real R&R/NeuralMesh, verified zones, no new room, move/STOP/off/restart rollback');
 }finally{if(a)a.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
