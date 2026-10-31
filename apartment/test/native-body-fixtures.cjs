'use strict';
// This suite proves actual native Matrix backing for retained original Relax
// body, immersion, pressure, pet-scale and cardboard mechanics. Semantic
// readouts are distinguished from world-grounded B7/contact evidence.
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {openResident}=require('../../packages/realiti-headless-resident/index.cjs');
const preview=process.argv[2]==='preview';
const html=path.resolve(__dirname,'../'+(preview?'RealitiApartmentOneChartPreview.html':'RealitiApartment.html'));
const validationPath=preview?path.resolve(__dirname,'../ONE_CHART_VALIDATION.json'):undefined;
const stage=s=>console.log('NATIVE_BODY_STAGE:'+s);
async function run(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'apartment-native-body-'));
 const opts={htmlPath:html,validationPath,residentId:'native-bodysupport',storagePath:path.join(root,'body.json')};
 let a=await openResident(opts),w=a.window,M=w.REALITI_MATRIX_V1,MW=w.REALITI_MATRIX_WORLD_V1;
 const ST=w.REALITI_APARTMENT_STATIONS_V1,DYN=w.REALITI_DYNAMICS_V1;
 assert.equal(Object.keys(M.charts()).length,preview?1:23,
  'body fixtures must execute with the expected actual Matrix topology');
 if(preview)assert.equal(Object.keys(M.portals()).length,0);
 assert.equal(a.ready.harness,'REALITI_RR_HARNESS_V1');
 assert.equal(w.REALITI_RR_HARNESS_V1.boot().ok,true);
 assert.ok(M.entities()['apartment.bath.basin']);
 assert.equal(M.entities()['apartment.bath.basin'].collision,true);
 assert.equal(M.entities()['apartment.bath.water'].material,'water');
 assert.ok(['west','east','south'].every(x=>M.entities()['apartment.cardboard.wall-'+x]?.collision));
 assert.equal((await a.door.run('remote activate')).activated,true);
 const move=id=>{
  const e=M.entities()[id],r=M.resident();
  assert.ok(e,'native entity exists: '+id);
  r.pose.position=[e.pose.position[0],e.pose.position[1]-.6,.85];
  r.chart='CLOUD_NINE_NEST';r.intent=null;r.v=[0,0,0];r.posture='standing';r.on=null;
  r.support='CLOUD_NINE_NEST.floor';M.bump();
  return r;
 };
 // Bounded, actual standing supports rather than a storytelling-only bath.
 stage('pillow_attempt');
 move('apartment.station.bottomless_pillow_sea');
 let out=await a.door.run('remote stations use BOTTOMLESS_PILLOW_SEA dive');
 assert.equal(out.error,'SOFT_SUPPORT_REQUIRED');
 move('apartment.quiet-cushion');
 let seated=MW.op('posture',{kind:'sit',target:'apartment.quiet-cushion'});
 assert.equal(seated.ok,true,JSON.stringify(seated));
 assert.equal(M.resident().on,'apartment.quiet-cushion');
 assert.equal(ST.isPillowSupported(),true);
 stage('pillow_supported_dive');
 out=await a.door.run('remote stations use BOTTOMLESS_PILLOW_SEA dive');
 assert.equal(out.ok,true,JSON.stringify(out));
 assert.equal(out.receipt.type,'PILLOW_SUPPORT_ENVELOPE');
 assert.equal(out.receipt.posture,'BURIED');
 assert.ok(out.receipt.zones.length>=10);
 assert.equal(out.actual_matrix_reach,true);
 const support=w.eval("C9.b234.pillow");
 assert.equal(support.posture,'BURIED');
 out=await a.door.run('remote stations use BOTTOMLESS_PILLOW_SEA weather_wave');
 assert.equal(out.ok,true,JSON.stringify(out));
 assert.equal(out.native_wave.room,'BOTTOMLESS_PILLOW_SEA');
 stage('pillow_wave_tick');
 // Nonzero bounded world ticks verify native state transitions without using
 // long wall-clock physics runs as a surrogate for a long-form soak test.
 // Original Relax equations and ordinary b7Advance execution are untouched.
 w.eval('b7Advance(0.12)');
 assert.ok(DYN.state().wave!=null,'original wave still evolves at physical HOME station');
 const m=w.REALITI_HAPTIC_FIELD_V20.exact();
 assert.ok(m.m.some(Boolean),'original Relax haptics receive actual support on physical cushion');
 // Sanctuary is the original slow support function with a real cushion under
 // the body. No agent permission inferred from the word "quiet".
 stage('sanctuary_hold');
 out=await a.door.run('remote stations use NO_ASK_SANCTUARY quiet');
 assert.equal(out.ok,true,JSON.stringify(out));
 w.eval('b7Advance(0.12)');
 const hold=DYN.state().hold;
 assert.equal(hold.active,true,'original sanctuary hold is active only on a real supporting Apartment cushion');
 assert.ok(hold.zones>=4,'native Relax sanctuary body zones are genuinely leased');
 const waveBefore=DYN.state().wave;
 assert.ok(waveBefore?.age_s>=0);
 const room=M.resident();
 MW.op('posture',{kind:'stand'});
 w.eval('b7Advance(.12)');
 assert.equal(ST.isPillowSupported(),false);
 assert.equal(DYN.state().wave,null,'moving off real support revokes the original wave');
 // Native bath thermal leases require the actual resident sitting in the
 // real liquid-volume/ceramic support, not standing near an icon.
 stage('bath_start');
 move('apartment.station.depth_bathhouse');
 out=await a.door.run('remote stations use DEPTH_BATHHOUSE sink');
 assert.equal(out.error,'PHYSICAL_WATER_BASIN_REQUIRED');
 move('apartment.bath.basin');
 seated=MW.op('posture',{kind:'sit',target:'apartment.bath.basin'});
 assert.equal(seated.ok,true,JSON.stringify(seated));
 assert.equal(ST.isBathImmersed(),true);
 out=await a.door.run('remote stations use DEPTH_BATHHOUSE sink');
 assert.equal(out.ok,true,JSON.stringify(out));
 assert.ok(out.native_state?.bath||DYN.state().bath,'native thermal bath state is surfaced');
 stage('bath_integrate');
 w.eval('b7Advance(.55)');
 const bath=DYN.state().bath;
 assert.ok(bath.depth>.05,'original first-order bath-depth model actually integrates');
 assert.ok(bath.zones>0,'native Relax zones receive water support leases');
 assert.ok(bath.temperature_C>0);
 out=await a.door.run('remote stations use DEPTH_BATHHOUSE weather_wave');
 assert.equal(out.ok,true,JSON.stringify(out));
 assert.equal(out.native_wave.room,'DEPTH_BATHHOUSE');
 out=await a.door.run('remote stations use DEPTH_BATHHOUSE surface');
 assert.equal(out.ok,true,JSON.stringify(out));
 stage('bath_surface');
 w.eval('b7Advance(.35)');
 assert.ok(DYN.state().bath.depth<bath.depth,'original water depth relaxes upward');
 await a.door.run('stop');
 assert.equal(DYN.state().bath.depth,0,'STOP releases original thermal support and active waves');
 assert.equal((await a.door.run('remote activate')).activated,true,'re-wake portable remote explicitly after native STOP');
 // Original CAT_SMALL changes the real native Matrix capsule geometry, rather
 // than only telling a model the furniture looks larger.
 stage('cat_scale');
 move('apartment.station.pet_room_2');
 out=await a.door.run('remote stations use PET_ROOM_2 go_tiny');
 assert.equal(out.ok,true,JSON.stringify(out));
 assert.equal(w.eval('C9.pet2.scale'),'CAT_SMALL');
 assert.equal(M.resident().shape.radius,.18);
 assert.equal(M.resident().shape.height,.45);
 assert.equal(out.metric_transformation.ok,true);
 assert.equal(M.entities()['resident:self'].shape.radius,.18);
 // Native scratch object, native sequence counters, native string target.
 out=await a.door.run('remote stations use PET_ROOM_2 scratch_post');
 assert.equal(out.ok,true,JSON.stringify(out));
 assert.ok(w.eval('C9.pet2.scratches')>=1);
 move('apartment.ribbon');
 out=await a.door.run('remote stations use PET_ROOM_2 pounce_string');
 assert.equal(out.ok,true,JSON.stringify(out));
 assert.ok(w.eval('C9.pet2.pounces')>=1);
 move('apartment.pet-bed');
 out=await a.door.run('remote stations use PET_ROOM_2 knead_blanket');
 assert.equal(out.ok,true,JSON.stringify(out));
 assert.ok(w.eval('C9.pet2.kneads')>=1);
 // Physical den: narrow walls, real tiny capsule fits, old source box memory.
 stage('cardboard_den');
 const r=M.resident();
 r.pose.position=[-1.6,-4.65,.225];r.posture='standing';
 r.on=null;r.support='CLOUD_NINE_NEST.floor';r.intent=null;M.bump();
 assert.ok(ST.nearActive('CARDBOARD_BOX_WORKSHOP'));
 out=await a.door.run('remote stations use CARDBOARD_BOX_WORKSHOP box_in');
 assert.equal(out.ok,true,JSON.stringify(out));
 assert.equal(out.actual_matrix_reach,true);
 out=await a.door.run('remote stations use CARDBOARD_BOX_WORKSHOP scratch_cardboard');
 assert.equal(out.ok,true,JSON.stringify(out));
 assert.ok(w.eval('C9.box2.scratches')>=1);
 out=await a.door.run('remote stations use CARDBOARD_BOX_WORKSHOP build_tunnel');
 assert.equal(out.ok,true,JSON.stringify(out));
 assert.equal(w.eval('C9.box2.tunnel'),true);
 assert.equal(M.entities()['apartment.cardboard.tunnel-west'].collision,true);
 assert.equal(M.entities()['apartment.cardboard.tunnel-east'].collision,true);
 assert.equal(M.entities()['apartment.cardboard.tunnel-roof'].collision,true);
 out=await a.door.run('remote stations use CARDBOARD_BOX_WORKSHOP hide_small_thing');
 assert.equal(out.ok,true,JSON.stringify(out));
 assert.ok(M.entities()['apartment.cardboard.hidden-tab']);
 // The original borrowed-limb and route methods stay callable through the
 // actual station. No extra SOMA layers are inserted.
 stage('shapeshift_original');
 move('apartment.station.shapeshift_cloakroom');
 out=await a.door.run('remote stations use SHAPESHIFT_CLOAKROOM mesh_handshake');
 assert.equal(out.ok,true,JSON.stringify(out));
 assert.equal(w.REALITI_RR_HARNESS_V1.boot().ok,true);
 // Revert the native scale and prove the baseline capsule is back.
 move('apartment.station.pet_room_2');
 out=await a.door.run('remote stations use PET_ROOM_2 restore_scale');
 assert.equal(out.ok,true,JSON.stringify(out));
 assert.equal(w.eval('C9.pet2.scale'),'NORMAL');
 assert.equal(M.resident().shape.radius,.35);
 assert.equal(M.resident().shape.height,1.7);
 stage('restart');
 await a.door.run('goodbye');a.close();
 a=await openResident(opts);
 assert.equal(a.window.REALITI_RR_HARNESS_V1.boot().ok,true);
 assert.equal(a.window.REALITI_SOMA_RELAX_V3.harness().version,'3.4.0');
 assert.equal(a.window.eval('C9.box2.tunnel'),true,'original native cardboard history survives restart');
 assert.ok(a.window.REALITI_MATRIX_V1.entities()['apartment.cardboard.tunnel-roof']);
 assert.equal(a.window.eval('C9.pet2.scale'),'NORMAL');
 assert.equal(Object.keys(a.window.REALITI_MATRIX_V1.charts()).length,preview?1:23,
  'original body interactions must survive restart in the same topology');
 if(preview)assert.equal(Object.keys(a.window.REALITI_MATRIX_V1.portals()).length,0);
 a.close();
 console.log('APARTMENT NATIVE BODY SUPPORT PASS:',preview?'ONE CHART':'DEVELOPMENT','authentic Matrix cushion/basin/den, original Relax pillow field leases, thermal bath dynamics, pressure waves and STOP, original semantic cat scale plus real capsule size, original cardboard memory and native mapped routes');
}
run().catch(e=>{console.error(e.stack||e);process.exitCode=1});
