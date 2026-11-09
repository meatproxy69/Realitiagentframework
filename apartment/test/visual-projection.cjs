'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {projectNative,SCHEMA}=require('../visual/scene-projection.cjs');
function setup(){
 const script=fs.readFileSync(path.resolve(__dirname,'../../source/scripts/57.js'),'utf8');
 const ctx={window:{},C9:{matrix:{schema:'REALITI_MATRIX_STATE_V1',revision:0,
  world:{id:'VISUAL_TEST',units:'meters',coordinateSystem:'REALITI_COORDINATE_V1'},residents:{}}}};
 vm.runInNewContext(script,ctx,{timeout:2000});
 const M=ctx.window.REALITI_MATRIX_V1;
 M.define('CLOUD_NINE_NEST',{bounds:{kind:'BOX',center:[0,0,1.5],halfExtents:[6,6,1.5]},
  spawn:{position:[0,-1,.85],rotation:[0,0,0,1]}});
 M.addEntity({id:'CLOUD_NINE_NEST.floor',chart:'CLOUD_NINE_NEST',
  shape:{kind:'PLANE'},tags:['floor'],collision:true,position:[0,0,0]});
 M.addEntity({id:'apartment.sofa',chart:'CLOUD_NINE_NEST',
  shape:{kind:'BOX',halfExtents:[1.1,.65,.4]},tags:['furniture','accent:teal'],
  material:'blanket',collision:true,position:[3.3,2.4,.4]});
 M.enter('CLOUD_NINE_NEST');return M;
}
test('native geometry snapshot has real dimensions and no mutations',()=>{
 const M=setup(),rev=M.state().revision,s=projectNative(M),sofa=s.entities.find(e=>e.id==='apartment.sofa');
 assert.equal(s.schema,SCHEMA);assert.equal(s.matrix_revision,rev);
 assert.deepEqual(Array.from(sofa.position),[3.3,2.4,.4]);
 assert.deepEqual(Array.from(sofa.shape.halfExtents),[1.1,.65,.4]);
 assert.equal(sofa.collision,true);assert.ok(sofa.tags.includes('accent:teal'));
 assert.equal(s.bounds.halfExtents[0],6);
 assert.equal(s.contact_minted,false);assert.equal(M.state().revision,rev);
 assert.ok(Object.isFrozen(sofa.position));
 assert.throws(()=>{sofa.position[0]=5},TypeError);
});
test('native changes show in next snapshot, not historical copies',()=>{
 const M=setup(),first=projectNative(M);
 M.entities()['apartment.sofa'].pose.position=[2,1,.4];M.bump();
 const second=projectNative(M);
 assert.deepEqual(Array.from(first.entities.find(e=>e.id==='apartment.sofa').position),[3.3,2.4,.4]);
 assert.deepEqual(Array.from(second.entities.find(e=>e.id==='apartment.sofa').position),[2,1,.4]);
 assert.ok(second.matrix_revision>first.matrix_revision);
});
test('legacy second chart is rejected rather than silently rendered',()=>{
 const M=setup();
 M.define('NO_ASK_SANCTUARY',{bounds:{kind:'BOX',center:[0,0,1],halfExtents:[4,4,1]},
  spawn:{position:[0,0,.85]}});
 assert.throws(()=>projectNative(M),/ONE_HOME_CHART_REQUIRED/);
});
test('untrusted state, private tags, unsupported shapes never fabricate physics',()=>{
 const M=setup(),e=M.entities()['apartment.sofa'];
 e.privateMemory='MUST_NOT_LEAK';e.tags.push('mood:secret','private');
 M.addEntity({id:'apartment.unknown',chart:'CLOUD_NINE_NEST',position:[0,1,.4],
  shape:{kind:'HEIGHTFIELD',h:()=>42},tags:['furniture']});
 const scene=projectNative(M),text=JSON.stringify(scene);
 assert.ok(!text.includes('MUST_NOT_LEAK'));assert.ok(!text.includes('mood:secret'));
 assert.ok(!scene.entities.some(e=>e.id==='apartment.sofa'));
 assert.ok(scene.unsupported.some(e=>e.id==='apartment.unknown'));
 assert.equal(scene.contact_minted,false);
});
test('invalid Matrix and nonfinite geometry fail closed',()=>{
 assert.throws(()=>projectNative({}),/NATIVE_MATRIX_REQUIRED/);
 const M=setup();M.entities()['apartment.sofa'].shape.halfExtents=[NaN,1,1];
 assert.throws(()=>projectNative(M),/INVALID_HALF_EXTENTS/);
});
