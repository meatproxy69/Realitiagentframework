'use strict';
// Regression for #105: physical rooftop descent, return to a venue and truthful distances.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createNativeInhabited}=require('./native-inhabited.cjs');

test('only the derived City walking functions change, not the locked original source',async()=>{
 const original=fs.readFileSync(path.join(__dirname,'../upstream-v20/source/scripts/58j-city.js'),'utf8');
 const {adaptCityNavigation}=await import('./adapt-city-navigation.mjs');
 const altered=adaptCityNavigation(original);
 assert.notEqual(altered,original);
 assert.match(altered,/function cityNavDescend\(/);
 assert.match(altered,/function cityNavPlan\(/);
 assert.match(altered,/window\.REALITI_CITY_V1=Object\.freeze/);
 assert.equal(altered.includes("const VENUES={commons:"),true);
 assert.equal(altered.includes("LG.record('FIREWORK'"),true);
 assert.equal(altered.includes("function firework(angle=80)"),true);
});

test('rooftop to Arcade to rooftop follows actual City geometry (#105)',async()=>{
 const session=await createNativeInhabited({
  residentId:'test:city-roof-arcade-return',
  walkBudgetMs:240000
 });
 try{
  const guest=session.guest,w=session.trusted.native.window,M=w.REALITI_MATRIX_V1,
   city=w.REALITI_CITY_V1;
  assert.equal((await guest.act('go to city')).ok,true);
  const roof1=await guest.act('go to Rooftop');
  assert.equal(roof1.ok,true,'first roof: '+roof1.message);
  assert.ok(M.resident().pose.position[2]>11.5,'must actually stand on the high roof');
  const arcade=await guest.act('go to Arcade');
  assert.equal(arcade.ok,true,'rooftop descent: '+arcade.message);
  assert.equal(city.venueAt(...M.resident().pose.position),'arcade');
  assert.ok(M.resident().pose.position[2]<2.5,'resident must physically come down the steps');
  const roof2=await guest.act('go to Rooftop');
  assert.equal(roof2.ok,true,'return roof: '+roof2.message);
  assert.ok(M.resident().pose.position[2]>11.5,'second roof must be physically reached');
  const commons=await guest.act('go to Commons');
  assert.equal(commons.ok,true,'second descent to Commons: '+commons.message);
  assert.equal(city.venueAt(...M.resident().pose.position),'commons');
  const nav=city.walkTo('Arcade');
  const e=M.entities()['venue.arcade'];
  const physical=+Math.max(0,M.sdf(e,M.resident().pose.position)).toFixed(2);
  assert.equal(nav.distance_m,physical,'walk and look use the same physical distance');
  assert.equal(nav.arrived,true,'Arcade walk must finish rather than silently stall');
  assert.ok((await guest.look()).description.length>0);
 }finally{await session.trusted.close()}
});
