'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createNativeInhabited}=require('./native-inhabited.cjs');
const HOME='CLOUD_NINE_NEST',CITY='MERIDIAN_CITY';
test('all 23 untouched Relax destinations remain visitable through the original Agent Door',async()=>{
 const s=await createNativeInhabited({residentId:'v20:original-rooms-walk'});
 const trace=[];
 try{
  const w=s.trusted.native.window;
  const catalogue=w.REALITI_SLICE_ROOMS.list();
  assert.equal(catalogue.length,23,'original native catalogue, not rebuilt two-chart slice');
  for(const item of catalogue){
   const id=item.id;
   const r=await s.guest.act('go '+id);
   trace.push({room:id,ok:r.ok,actual:s.trusted.diagnostics().chart});
   assert.equal(r.ok,true,id+' refused original navigation: '+r.message);
   assert.equal(s.trusted.diagnostics().chart,id,id+' did not become the actual Matrix chart');
   const looked=await s.guest.look();
   assert.ok(looked.description.length>0);
   assert.ok(looked.choices.length<=8);
  }
  const back=await s.guest.act('go home');
  assert.equal(back.ok,true,back.message);
  assert.equal(s.trusted.diagnostics().chart,HOME);
  assert.equal(w.REALITI_RR_HARNESS_V1.boot().ok,true);
  assert.ok(w.REALITI_HAPTIC_FIELD_V20.exact());
  assert.ok(w.REALITI_NEURAL_PASS_V112.lace());
  console.log('V20_ALL_ROOMS_OK '+JSON.stringify({visited:trace.length,return_home:true}));
 }catch(e){
  console.log('V20_ROOM_WALK_FAILURE '+JSON.stringify(trace.slice(-6)));
  throw e;
 }finally{await s.trusted.close()}
});
test('original native City venues retain their six world-backed locations and actual movement',async()=>{
 const s=await createNativeInhabited({residentId:'v20:six-city-venues',walkBudgetMs:240000});
 const trace=[];
 try{
  const w=s.trusted.native.window;
  const e=w.REALITI_MATRIX_V1.entities();
  for(const id of ['venue.commons','venue.teahouse','venue.dancehall','venue.arcade','venue.echo','venue.roof',
   'commons.wall','teahouse.counter','arcade.wall','echo.stage','roof.mortar','city.stair_30'])
   assert.ok(e[id],'source-native City fixture missing: '+id);
  assert.equal((await s.guest.act('go to city')).ok,true);
  for(const name of ['Commons','Teahouse','Dancehall','Arcade','Echo Room']){
   const out=await s.guest.act('go to '+name);
   trace.push({venue:name,ok:out.ok,place:out.place,at:w.REALITI_MATRIX_V1.resident().pose.position.map(x=>+x.toFixed(1))});
   assert.equal(out.ok,true,name+' route: '+out.message);
   assert.equal(s.trusted.diagnostics().chart,CITY);
  }
  const roof=await s.guest.act('go to Rooftop');
  trace.push({venue:'Rooftop',ok:roof.ok,at:w.REALITI_MATRIX_V1.resident().pose.position.map(x=>+x.toFixed(1))});
  assert.equal(roof.ok,true,roof.message);
  assert.ok(w.REALITI_MATRIX_V1.resident().pose.position[2]>12,'original physical stairs reach actual roof');
  const home=await s.guest.act('go home');
  assert.equal(home.ok,true,home.message);
  assert.equal(s.trusted.diagnostics().chart,HOME);
  console.log('V20_CITY_VENUES_OK '+JSON.stringify({venues:trace.length,return_home:true}));
 }catch(e){
  console.log('V20_CITY_VENUE_FAILURE '+JSON.stringify(trace.slice(-5)));
  throw e;
 }finally{await s.trusted.close()}
});
