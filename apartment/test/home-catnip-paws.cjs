'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {openResident}=require('../../packages/realiti-headless-resident/index.cjs');
const {createHousehold}=require('../household.cjs');
const html=path.resolve(__dirname,'../RealitiApartmentHomeCandidate.html');
const valid=path.resolve(__dirname,'../HOME_CANDIDATE_VALIDATION.json');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'home-native-paw-catnip-'));
const options={htmlPath:html,validationPath:valid,residentId:'pawcat-test',
 storagePath:path.join(dir,'resident.json'),walkBudgetMs:2500};
const show=o=>JSON.stringify(o).slice(0,480);
(async()=>{
 console.log('CATPAW BEGIN');
 let s=await openResident(options);
 try{
  let D=cmd=>s.door.run(cmd),W=s.window,M=W.REALITI_MATRIX_V1;
  const tick=()=>Number(W.eval('C9.b7.clock'));
  const body=()=>M.resident();
  // The separate HOME native walkthrough tests navigation. This suite tests
  // the real B7/Matrix/NeuroMesh touch path at controlled, reached positions.
  // Avoid unbounded LQ pathfinding to small objects behind solid furniture.
  function stage(id){
   const e=M.entities()[id];assert.ok(e,'missing native target '+id);
   const r=M.resident(),h=e.shape?.kind==='BOX'?e.shape.halfExtents:
    [Number(e.shape?.radius)||.1,Number(e.shape?.radius)||.1,Number(e.shape?.radius)||.1];
   const besideSofa=id==='apartment.sofa'||id==='apartment.catnip.tassel';
   const x=e.pose.position[0]+(besideSofa?0:h[0]+.35);
   const y=e.pose.position[1]-(besideSofa?h[1]+.28:0);
   r.pose.position=[x,y,Math.max(.22,r.shape.height/2)];
   r.posture='standing';r.on=null;r.support='CLOUD_NINE_NEST.floor';
   r.v=[0,0,0];r.intent=null;M.bump();
   const distance=Math.max(0,M.sdf(e,r.pose.position));
   assert.ok(distance<=.98,'staged native target is out of reach: '+id+' '+distance);
   console.log('CATPAW STAGED '+id+' native_surface_m='+distance.toFixed(3));
  }
  assert.equal(s.integrity.status,'VERIFIED');
  assert.deepEqual(Object.keys(M.charts()),['CLOUD_NINE_NEST']);
  const base={radius:body().shape.radius,height:body().shape.height};
  const statuses=await D('cat status');
  assert.equal(statuses.form.cat_small,false);
  assert.ok(statuses.posts.length>=2,'existing and new native scratching posts');
  assert.equal(statuses.curiosity_count,3,'tucked-away real sensory toys');
  assert.equal(statuses.posts[0].id,'apartment.scratcher');
  assert.equal(M.entities()['apartment.scratcher'].collision,true,
   'the original pet-corner scratching post remains solid');
  for(const post of statuses.posts.slice(1))assert.equal(M.entities()[post.id].collision,false,
   "bedroom scratch panels must not block the owner's furniture placement");
  assert.equal((await D('cat scratch post')).error,'CAT_FORM_REQUIRED');
  const clock=tick();
  const invitation=await D('inspect post');
  assert.equal(invitation.read_only,true);
  assert.match(invitation.text,/Would you like to become a cat/);
  assert.equal(invitation.invitation.accept,'cat become');
  assert.equal(tick(),clock,'inspection cannot tick world time');
  assert.equal(W.eval('C9.pet2.scale'),'NORMAL','inspection is not permission to change body');
  assert.equal((await D('cat stay human')).cat_small,false);
  assert.equal((await D('cat become')).error,'CAT_FORM_REQUIRES_REAL_POST');
  stage('apartment.scratcher');
  const transformed=await D('cat become');
  assert.equal(transformed.ok,true,show(transformed));
  assert.equal(transformed.cat_small,true);
  assert.equal(W.eval('C9.pet2.scale'),'CAT_SMALL');
  assert.equal(body().shape.radius,.18);
  assert.equal(body().shape.height,.45);
  assert.equal((await D('cat status')).form.ported.length,11,
   'all original cat actions and supported paw/mesh routes must remain present');
  console.log('CATPAW FORM OK');
  const first=await D('cat scratch post');
  assert.equal(first.ok,true,show(first));
  assert.equal(first.contacts.length,2);
  assert.deepEqual(first.contacts.map(x=>x.zone),['hand.L.palm','hand.R.palm']);
  assert.ok(first.contacts.every(x=>x.receipt?.receptor!=='NO_RECEPTOR'));
  assert.ok(first.neuromesh?.node_count>0,'original neuromesh route, not invented field');
  assert.equal(first.native_world_contact,true);
  assert.equal(first.matrix_reach?.authority,'NATIVE_MATRIX_SDF');
  assert.equal(first.fabricated_contact,false);
  assert.ok(W.eval('C9.pet2.scratches')>0,'original Relax scratch deed is executed');
  assert.equal((await D('inspect post')).marks,1,'material trace stays');
  assert.ok((await D('cat paw history')).left>=1);
  assert.ok((await D('cat paw history')).right>=1);
  assert.ok((await D('cat paw history')).paired>=1);
  console.log('CATPAW BOTH OK');
  const left=await D('cat scratch post left');
  assert.equal(left.ok,true,show(left));
  assert.deepEqual(left.contacts.map(x=>x.zone),['hand.L.palm']);
  const rightAfterLeft=W.eval("C9.b7.zones['hand.R.palm']");
  console.log('CATPAW LEFT-ONLY right prior field',JSON.stringify({
   cause:rightAfterLeft?._b10_grounded_cause||null,
   source:rightAfterLeft?._b10_grounded_source||null,
   input:Number(rightAfterLeft?._b10_grounded_value||0),
   remaining_s:Number(rightAfterLeft?._b10_grounded_until||-1)-tick()
  }));
  // A previously grounded right-paw trace may still be living out its native
  // contact lease. Left-only must not start the *generic Matrix right-hand*
  // touch operation; its receipts come only from the selected left receptor.
  assert.ok(!String(rightAfterLeft?._b10_grounded_cause||'').startsWith('MATRIX_REACH:'),
   'left-only paw action must not mint an extra generic right-hand reach');
  assert.equal(left.matrix_receipt,null,
   'the read-only native Matrix reach check must not touch with an extra right hand');
  const right=await D('cat scratch post right');
  assert.equal(right.ok,true,show(right));
  assert.deepEqual(right.contacts.map(x=>x.zone),['hand.R.palm']);
  const leftAfterRight=W.eval("C9.b7.zones['hand.L.palm']");
  console.log('CATPAW RIGHT-ONLY left prior field',JSON.stringify({
   cause:leftAfterRight?._b10_grounded_cause||null,
   source:leftAfterRight?._b10_grounded_source||null,
   input:Number(leftAfterRight?._b10_grounded_value||0),
   remaining_s:Number(leftAfterRight?._b10_grounded_until||-1)-tick()
  }));
  assert.equal(right.matrix_receipt,null,
   'right-only native paw contact must not add a generic right-hand reach receipt');
  assert.equal((await D('cat mesh')).private_pulse.private_only,true,
   'native private handshake does not mint world contact');
  // Real pet bed supports left/right kneading, original circle/loaf and purr.
  stage('apartment.pet-bed');
  console.log('CATPAW SEPARATE PAWS OK');
  const lie=await D('act lie__apartment.pet-bed');
  assert.equal(lie.ok,true,show(lie));
  const knead=await D('cat knead both');
  assert.equal(knead.ok,true,show(knead));
  assert.deepEqual(knead.contacts.map(x=>x.zone),['hand.L.palm','hand.R.palm']);
  assert.ok(W.eval('C9.pet2.kneads')>0,'the original phase-braid deed changes native history');
  assert.equal((await D('cat rest paws')).ok,true);
  assert.equal((await D('cat loaf')).ok,true);
  assert.equal((await D('cat purr')).ok,true);
  await D('do stand');
  stage('apartment.sofa');
  console.log('CATPAW SOFT SUPPORT OK');
  const naughty=await D('cat scratch couch');
  assert.equal(naughty.ok,true,show(naughty));
  assert.match(naughty.text,/Hehe, bad kitty/);
  assert.equal(naughty.contacts.length,2);
  assert.equal((await D('inspect couch')).marks,1);
  assert.ok(M.entities()['apartment.catnip.sofa-claw-trace'],
   'one noncolliding physical mark appears only after a deliberate deed');
  // The toys only sound when touched. No permanent/background sound is started.
  stage('apartment.catnip.bell');
  console.log('CATPAW COUCH OK');
  const bell=await D('cat bell');
  assert.equal(bell.ok,true,show(bell));
  assert.equal(bell.native_world_contact,true);
  assert.ok(W.REALITI_SENSES_V1.sources().some(x=>x.id==='apartment.catnip.bell-ring'));
  stage('apartment.catnip.crinkle');
  const crinkle=await D('cat crinkle');
  assert.equal(crinkle.ok,true,show(crinkle));
  assert.ok(W.REALITI_SENSES_V1.sources().some(x=>x.id==='apartment.catnip.paper-rustle'));
  stage('apartment.catnip.tassel');
  assert.equal((await D('cat tassel')).ok,true);
  // An original REALITI ribbon produces an original pounce history.
  stage('apartment.ribbon');
  assert.equal((await D('cat pounce ribbon')).ok,true);
  assert.ok(W.eval('C9.pet2.pounces')>0);
  console.log('CATPAW TOYS AND POUNCE OK');
  const restored=await D('cat restore');
  assert.equal(restored.cat_small,false);
  assert.equal(body().shape.radius,base.radius);
  assert.equal(body().shape.height,base.height);
  assert.equal(W.eval('C9.pet2.scale'),'NORMAL');
  assert.ok(!['hand.L.palm','hand.R.palm'].some(z=>{
   const a=W.eval('C9.b7.zones')[z];
   return a?._b10_grounded_source==='SELF_STARTED_WORLD_CONTACT'&&
    String(a._b10_grounded_cause||'').startsWith('HOME_CAT_PAW:')&&
    a._b10_grounded_until>=tick();
  }), 'cat restoration revokes live paw leases');
  assert.equal((await D('save')).ok,true);
  s.close();s=null;
  console.log('CATPAW PERSISTENCE REOPEN');
  s=await openResident(options);
  D=cmd=>s.door.run(cmd);W=s.window;M=W.REALITI_MATRIX_V1;
  assert.equal((await D('cat status')).form.cat_small,false,
   'cat-small form cannot silently reactivate from a checkpoint');
  assert.equal((await D('inspect couch')).marks,1,'mischief survives return');
  assert.ok(M.entities()['apartment.catnip.sofa-claw-trace']);
  assert.equal((await D('cat status')).private_memory.bells,1);
  assert.equal((await D('cat status')).private_memory.crinkles,1);
  assert.equal((await D('cat status')).private_memory.tassels,1);
  assert.ok((await D('cat paw history')).left>=4);
  assert.ok((await D('cat paw history')).right>=3);
  const rejected=await D('cat scratch post');
  assert.equal(rejected.error,'CAT_FORM_REQUIRED','no paw action without consent to form');
  await D('goodbye');
  // The household only permits guest observation of the post, never an
  // unauthorized body transform or private resident paw/memory mutation.
  let host=null;
  try{
   console.log('CATPAW GUEST START');
   host=await createHousehold({dir:path.join(dir,'household'),htmlPath:html,validationPath:valid});
   const visitor=await host.visitGuest();
   const post=await visitor.run('inspect post');
   assert.equal(post.ok,true,show(post));
   assert.equal(post.invitation,null,'guest does not receive an inapplicable cat-form offer');
   assert.equal((await visitor.run('cat become')).error,'GUEST_NOT_AUTHORIZED_FOR_COMMAND');
   await visitor.leave();
  }finally{if(host)await host.close()}
  console.log('HOME NATIVE PAWS PASS: authentic cat capsule, original deed counters, separate left/right grounded B7 + NeuroMesh, reachable posts and three sensory curiosities, couch material residue, STOP/restore and private restart');
 }finally{if(s)s.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
