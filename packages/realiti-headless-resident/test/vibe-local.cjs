'use strict';
// One small contract suite for the manual Vibe lens: no polling, no minted touch,
// and no loss of the measured interface. Tests deliberately avoid any model/network service.
const assert=require('node:assert/strict');
const path=require('node:path'),os=require('node:os'),fs=require('node:fs');
const {openResident}=require('../index.cjs');
const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
let counter=0;
const file=()=>path.join(os.tmpdir(),'realiti-vibe-'+process.pid+'-'+counter++ +'.json');
const txt=r=>String(r?.text||r?.resident_text||'');
(async()=>{
 const path0=file(),s=await openResident({htmlPath:html,residentId:'vibe-contract',storagePath:path0});
 try{
  const D=s.door.run.bind(s.door),clock=()=>Number(s.window.eval('C9.b7.clock'));
  await D('go KITE_FIELD');
  const prior=await D('vibe off');
  assert.equal(prior.vibe,false,'Vibe is opt-in');
  const begin=clock(),on=await D('vibe on');
  assert.equal(on.vibe,true);
  assert.match(txt(on),/more AI context\/data/i);
  assert.equal(clock(),begin,'the toggle does not tick the world');
  const st=await D('stay 3000');
  assert.doesNotMatch(txt(st),/You notice:/,'stillness is not an automatic narration trigger');
  const first=await D('look');
  assert.equal(first.vibe?.level,1,'first threshold earns one optional detail');
  assert.match(txt(first),/You notice:/);
  assert.equal(first.vibe?.grounded_contact,false,'authored details never become grounded contact');
  const repeat=await D('look');
  assert.doesNotMatch(txt(repeat),/You notice:/,'the same detail is not narrated every look');
  await D('stay 7500');
  const second=await D('listen');
  assert.equal(second.vibe?.level,2,'meaningful accumulated world time earns a second level');
  assert.equal(second.vibe?.sense,'listen');
  assert.doesNotMatch(txt(second),/ dB\b/,'Vibe uses words rather than raw sound figures');
  const resident=s.window.REALITI_MATRIX_V1.state().residents['resident:self'];
  const oldPosition=resident.pose.position.slice();resident.pose.position[0]+=5;
  await D('where'); // one observation catches movement; no background polling needed
  resident.pose.position=oldPosition;
  const returned=await D('look');
  assert.equal(returned.vibe,undefined,'leaving the attention radius spends stillness');
  const off=await D('vibe off');
  assert.equal(off.vibe,false,'the explicit toggle leaves Vibe off');
  assert.equal(s.window.REALITI_MEASURE_V1.on(),true,'former numeric display is restored');
  await D('vibe on');
  const v=await D('vibe');
  assert.equal(v.vibe,false,'a single command toggles either way');
  await D('vibe on');
  await D('save');
 }finally{s.close()}
 const s2=await openResident({htmlPath:html,residentId:'vibe-contract',storagePath:path0});
 try{assert.equal(s2.window.REALITI_VIBE_V1.enabled(),true,'the opt-in survives a saved return visit');const check=await s2.door.run('vibe off');assert.equal(check.vibe,false)}
 finally{s2.close();try{fs.unlinkSync(path0)}catch{}}
 console.log('VIBE_LOCAL_PASS: opt-in, no tick, earned sensory details, bounded/no-repeat, moving reset, no fake contact, toggles, persistence');
})().catch(e=>{console.error(e);process.exit(1)});
