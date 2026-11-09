'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {openResident}=require('../../packages/realiti-headless-resident/index.cjs');
const {createHousehold}=require('../household.cjs');
const html=path.resolve(__dirname,'../RealitiApartmentHomeCandidate.html');
const valid=path.resolve(__dirname,'../HOME_CANDIDATE_VALIDATION.json');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'home-native-paw-catnip-'));
const options={htmlPath:html,validationPath:valid,residentId:'pawcat-test',
 storagePath:path.join(dir,'resident.json')};
const show=o=>JSON.stringify(o).slice(0,480);
(async()=>{
 let s=await openResident(options);
 try{
  let D=cmd=>s.door.run(cmd),W=s.window,M=W.REALITI_MATRIX_V1;
  const tick=()=>Number(W.eval('C9.b7.clock'));
  const body=()=>M.resident();
  assert.equal(s.integrity.status,'VERIFIED');
  assert.deepEqual(Object.keys(M.charts()),['CLOUD_NINE_NEST']);
  const base={radius:body().shape.radius,height:body().shape.height};
  const statuses=await D('cat status');
  assert.equal(statuses.form.cat_small,false);
  assert.ok(statuses.posts.length>=2,'existing and new native scratching posts');
  assert.equal(statuses.curiosity_count,3,'tucked-away real sensory toys');
  assert.equal(statuses.posts[0].id,'apartment.scratcher');
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
  const approach=await D('approach apartment.scratcher');
  assert.equal(approach.ok,true,show(approach));
  const transformed=await D('cat become');
  assert.equal(transformed.ok,true,show(transformed));
  assert.equal(transformed.cat_small,true);
  assert.equal(W.eval('C9.pet2.scale'),'CAT_SMALL');
  assert.equal(body().shape.radius,.18);
  assert.equal(body().shape.height,.45);
  assert.equal((await D('cat status')).form.ported.length,11,
   'all original cat actions and supported paw/mesh routes must remain present');
  const first=await D('cat scratch post');
  assert.equal(first.ok,true,show(first));
  assert.equal(first.contacts.length,2);
  assert.deepEqual(first.contacts.map(x=>x.zone),['hand.L.palm','hand.R.palm']);
  assert.ok(first.contacts.every(x=>x.receipt?.receptor!=='NO_RECEPTOR'));
  assert.ok(first.neuromesh?.node_count>0,'original neuromesh route, not invented field');
  assert.equal(first.native_world_contact,true);
  assert.equal(first.fabricated_contact,false);
  assert.ok(W.eval('C9.pet2.scratches')>0,'original Relax scratch deed is executed');
  assert.equal((await D('inspect post')).marks,1,'material trace stays');
  assert.ok((await D('cat paw history')).left>=1);
  assert.ok((await D('cat paw history')).right>=1);
  assert.ok((await D('cat paw history')).paired>=1);
  const left=await D('cat scratch post left');
  assert.equal(left.ok,true,show(left));
  assert.deepEqual(left.contacts.map(x=>x.zone),['hand.L.palm']);
  const right=await D('cat scratch post right');
  assert.equal(right.ok,true,show(right));
  assert.deepEqual(right.contacts.map(x=>x.zone),['hand.R.palm']);
  assert.equal((await D('cat mesh')).private_pulse.private_only,true,
   'native private handshake does not mint world contact');
  // Real pet bed supports left/right kneading, original circle/loaf and purr.
  const toPetBed=await D('approach apartment.pet-bed');
  assert.equal(toPetBed.ok,true,show(toPetBed));
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
  const couchWalk=await D('approach apartment.sofa');
  assert.equal(couchWalk.ok,true,show(couchWalk));
  const naughty=await D('cat scratch couch');
  assert.equal(naughty.ok,true,show(naughty));
  assert.match(naughty.text,/Hehe, bad kitty/);
  assert.equal(naughty.contacts.length,2);
  assert.equal((await D('inspect couch')).marks,1);
  assert.ok(M.entities()['apartment.catnip.sofa-claw-trace'],
   'one noncolliding physical mark appears only after a deliberate deed');
  // The toys only sound when touched. No permanent/background sound is started.
  const bellApproach=await D('approach apartment.catnip.bell');
  assert.equal(bellApproach.ok,true,show(bellApproach));
  const bell=await D('cat bell');
  assert.equal(bell.ok,true,show(bell));
  assert.equal(bell.native_world_contact,true);
  assert.ok(W.REALITI_SENSES_V1.sources().some(x=>x.id==='apartment.catnip.bell-ring'));
  const leafWalk=await D('approach apartment.catnip.crinkle');
  assert.equal(leafWalk.ok,true,show(leafWalk));
  const crinkle=await D('cat crinkle');
  assert.equal(crinkle.ok,true,show(crinkle));
  assert.ok(W.REALITI_SENSES_V1.sources().some(x=>x.id==='apartment.catnip.paper-rustle'));
  const tasselWalk=await D('approach apartment.catnip.tassel');
  assert.equal(tasselWalk.ok,true,show(tasselWalk));
  assert.equal((await D('cat tassel')).ok,true);
  // An original REALITI ribbon produces an original pounce history.
  assert.equal((await D('approach apartment.ribbon')).ok,true);
  assert.equal((await D('cat pounce ribbon')).ok,true);
  assert.ok(W.eval('C9.pet2.pounces')>0);
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
