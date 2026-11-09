'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {referenceViews,FRAME}=require('../visual/reference-cameras.cjs');
const home={schema:'REALITI_APARTMENT_VISUAL_SCENE_V0',chart:'CLOUD_NINE_NEST',
 bounds:{center:[0,0,1.5],halfExtents:[6,6,1.5]}};
test('four deterministic compass cameras share target, scale and image format',()=>{
 const a=referenceViews(home),b=referenceViews(home);
 assert.deepEqual(a,b);assert.deepEqual(a.map(x=>x.id),['NE','NW','SW','SE']);
 assert.equal(new Set(a.map(x=>x.position.join(','))).size,4);
 assert.ok(a.every(x=>x.frame===FRAME&&x.camera==='orthographic'&&
  x.target.join(',')==='0,0,1.05'&&x.up.join(',')==='0,0,1'&&
  x.contact_minted===false));
 assert.equal(FRAME.width,640);assert.equal(FRAME.height,400);
});
test('reference views reject another world',()=>{
 assert.throws(()=>referenceViews({}),/REFERENCE_HOME_SNAPSHOT_REQUIRED/);
 assert.throws(()=>referenceViews({...home,chart:'NO_ASK_SANCTUARY'}),
  /REFERENCE_HOME_SNAPSHOT_REQUIRED/);
});
test('browser viewer is local and does not mutate native Matrix',()=>{
 const boot=fs.readFileSync(path.join(__dirname,'../visual/viewer-boot.js'),'utf8');
 const entry=fs.readFileSync(path.join(__dirname,'../visual/viewer-entry.js'),'utf8');
 assert.match(boot,/\.\/visual\/dist\/viewer\.js/);
 assert.doesNotMatch(boot,/https?:\/\/|unpkg|jsdelivr/);
 assert.match(entry,/function captureFour\(\)/);
 assert.match(entry,/referenceViews\(snapshot\)/);
 assert.doesNotMatch(entry,/M\.moveTo|M\.bump|M\.entities\(/);
});
