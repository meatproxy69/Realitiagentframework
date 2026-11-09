'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {keyCommand,approachCommand,createController}=require('../visual/observer-controls.cjs');
function snapshot(){return {schema:'REALITI_APARTMENT_VISUAL_SCENE_V0',
 chart:'CLOUD_NINE_NEST',matrix_revision:1,
 entities:[{id:'apartment.sofa',label:'sofa',tags:['furniture'],shape:{kind:'BOX'}},
 {id:'CLOUD_NINE_NEST.wall.east',tags:['wall'],shape:{kind:'BOX'}}]}}
test('controls use only declared bounded public Agent Door commands',()=>{
 assert.equal(keyCommand('W'),'move forward 0.75');
 assert.equal(keyCommand('ArrowDown'),'move back 0.75');
 assert.equal(keyCommand('a'),'turn left 30');
 assert.equal(keyCommand('d'),'turn right 30');
 assert.equal(keyCommand(' '),null);
 assert.equal(approachCommand(snapshot(),'apartment.sofa'),'approach apartment.sofa');
 assert.equal(approachCommand(snapshot(),'CLOUD_NINE_NEST.wall.east'),null);
 assert.equal(approachCommand(snapshot(),'apartment.unknown'),null);
 assert.equal(approachCommand(snapshot(),'x; rm -rf ~'),null);
});
test('Door dispatch and Matrix revision are observed; camera cannot move actor',async()=>{
 let revision=1;
 const seen=[];
 const read=()=>({...snapshot(),matrix_revision:revision});
 const door={run:async txt=>{seen.push(txt);revision++;return {ok:true}}};
 const c=createController({door,snapshot:read});
 const a=await c.key('w'),b=await c.approach('apartment.sofa');
 assert.equal(a.ok,true);assert.equal(a.changed,true);
 assert.equal(b.ok,true);
 assert.deepEqual(seen,['move forward 0.75','approach apartment.sofa']);
});
test('busy gate and real Door refusal must be represented, never fabricated',async()=>{
 let release;
 const door={run:()=>new Promise(resolve=>{release=resolve})};
 const c=createController({door,snapshot});
 const first=c.key('d');
 assert.equal(c.busy(),true);
 assert.equal((await c.key('w')).error,'VISUAL_INPUT_BUSY');
 release({ok:false,error:'MATRIX_BLOCKED'});
 const result=await first;
 assert.equal(result.ok,false);assert.equal(result.reason,'MATRIX_BLOCKED');
 assert.equal(c.busy(),false);
 assert.equal((await c.approach('wall')).error,'VISUAL_INPUT_UNSUPPORTED');
});

test('native Matrix walks finite increments and stops before colliding wall',()=>{
 const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
 const js=fs.readFileSync(path.resolve(__dirname,'../../source/scripts/57.js'),'utf8');
 const c={window:{},C9:{matrix:{schema:'REALITI_MATRIX_STATE_V1',revision:0,
  world:{id:'VISUAL_NATIVE_TEST',units:'meters',coordinateSystem:'REALITI_COORDINATE_V1'},residents:{}}}};
 vm.runInNewContext(js,c,{timeout:3000});
 const M=c.window.REALITI_MATRIX_V1,H='CLOUD_NINE_NEST';
 M.define(H,{bounds:{kind:'BOX',center:[0,0,1.5],halfExtents:[6,6,1.5]},
  spawn:{position:[0,0,.85],rotation:[0,0,0,1]}});
 M.addEntity({id:'floor',chart:H,position:[0,0,0],shape:{kind:'PLANE'},
  tags:['floor'],collision:true});
 M.addEntity({id:'wall',chart:H,position:[0,6.125,1.5],
  shape:{kind:'BOX',halfExtents:[6,.125,1.5]},tags:['wall'],collision:true});
 M.enter(H);
 M.moveLocal([0,.75,0]);for(let i=0;i<100;i++)if(!M.step(.05))break;
 assert.ok(Math.abs(M.resident().pose.position[1]-.75)<.1);
 M.moveLocal([0,20,0]);for(let i=0;i<200;i++)if(!M.step(.05))break;
 assert.ok(M.resident().pose.position.every(Number.isFinite));
 assert.ok(M.resident().pose.position[1]<6);
 assert.equal(M.resident().chart,H);
});