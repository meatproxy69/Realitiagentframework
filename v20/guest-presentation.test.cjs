'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {summary,prose,choices,matchesNamedObject}=require('./guest-presentation.cjs');

test('structured rooms, actions, help, and remote pages produce useful guest text',()=>{
 const rooms=summary([{id:'CLOUD_NINE_NEST',title:'Cloud Nine Nest',purpose:'home'},{id:'NO_ASK_SANCTUARY',title:'No-Ask Sanctuary',purpose:'quiet'}]);
 assert.match(rooms,/Cloud Nine Nest/);
 assert.match(rooms,/No-Ask Sanctuary/);
 const actions=summary([{id:'sit',label:'SIT DOWN'},{id:'listen',label:'LISTEN'}]);
 assert.match(actions,/SIT DOWN/);
 assert.match(summary({schema:'HELP',commands:['look','stay <ms>'],note:'Use actions to explore.'}),/stay <ms>/);
 const remote=summary({pages:{home:['remote home','remote bed','remote pet help','remote off'],memory:['remote memory status']},note:'Your pocket remote is awake.'});
 assert.match(remote,/remote home/);
 assert.match(remote,/memory/);
 assert.match(remote,/and 1 more/);
 assert.equal(summary({ok:true}),null,'silent world operations must stay silent');
});
test('native prose remains complete while developer wording and decimals are cleaned up',()=>{
 const input='Your original NeuralMesh receives verified support. native Relax body-preset wardrobe drawer at 0.17 m; a tall wardrobe (harness closet planned) (amber) at 2.55 m. Doorways: south and east.';
 const output=prose(input);
 assert.match(output,/Your sensory field receives/);
 assert.doesNotMatch(output,/NeuralMesh|harness closet|native Relax|original the sensory field/);
 assert.match(output,/wardrobe drawer/);
 assert.match(output,/0.2 m/);
 assert.match(output,/2.5 m/);
 assert.match(output,/Doorways: south and east/);
 assert.ok(output.length>120,'no hard 750-character truncation');
});
test('home choices follow native cloud support; no false cloud-on offer after standing',()=>{
 const off=choices('CLOUD_NINE_NEST',{active:false,eligible:false});
 const ready=choices('CLOUD_NINE_NEST',{active:false,eligible:true});
 const on=choices('CLOUD_NINE_NEST',{active:true,eligible:true});
 assert.ok(off.includes('lie down')&&!off.includes('cloud on'));
 assert.ok(ready.includes('cloud on')&&!ready.includes('lie down'));
 assert.ok(on.includes('cloud off')&&!on.includes('cloud on'));
 for(const list of [off,ready,on,choices('MERIDIAN_CITY'),choices('NO_ASK_SANCTUARY')])
  assert.ok(list.includes('rest')&&list.length<=8);
});
test('focused look refuses unrelated fuzzy tag matches',()=>{
 assert.equal(matchesNamedObject('remote',{id:'d9344b5a',label:'your pocket remote (awake)'}),true);
 assert.equal(matchesNamedObject('puzzle box',{id:'puzzle-box',label:'a three-click puzzle box'}),true);
 assert.equal(matchesNamedObject('water',{id:'commons.fountain',label:'the fountain',tags:['water']}),false);
});
