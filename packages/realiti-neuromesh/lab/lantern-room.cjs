'use strict';
// REALITI SOMA physical test neighborhood (no Relax / DOM / network).
// Deterministic 6x4 m room, collision-checked movement and reach-limited causes.
// The environment, not the resident's prose, owns the host/world capability.
const {createHarness}=require('../index.cjs');
const LIMITS=Object.freeze({x0:.2,x1:5.8,y0:.2,y1:3.8,reach:1.15,speed:1.2});
const OBSTACLES=Object.freeze([{id:'pine-bench',x0:2.2,x1:3.4,y0:1.15,y1:1.85}]);
const FIXTURES=Object.freeze({
 bench:{x:2.8,y:1.5,material:'pine',zone:'hand.R.palm',input:.73,leaseMs:680},
 window:{x:5.65,y:2.0,material:'glass',zone:'hand.L.palm',input:.35,leaseMs:450},
 lamp:{x:1.1,y:3.5,material:'brass',zone:'hand.R.palm',input:.48,leaseMs:440}
});
const copy=x=>JSON.parse(JSON.stringify(x));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const finite=v=>typeof v==='number'&&Number.isFinite(v);
class LanternRoom {
 constructor({residentId='lab-agent',worldId='LANTERN_ROOM_LAB'}={}){
  const a=createHarness({residentId,worldId});
  const ready=a.harness.boot();
  if(!ready.ok)throw Error('HARNESS_INCOMPLETE '+ready.missing.join(','));
  this.harness=a.harness;this.resident=a.resident;this.__world=a.host;
  this.worldId=worldId;this.roomId='LANTERN_ROOM';
  this.position={x:.9,y:.9};this.tickMs=0;this.sequence=0;
  this.windowOpen=false;this.seated=null;this.lampOn=true;
  this.closed=false;
  a.host.affordances(this.roomId,{BENCH_PRESENT:true,WINDOW_OPEN:false,LAMP_LIT:true});
  a.host.bleucheese.define({id:'WINDOW_DRAFT',family:'SOFT_WEATHER',
    room:this.roomId,requires:['WINDOW_OPEN'],worldWeight:.92,prior:.08,
    tauSeconds:.22,threshold:.72,refractoryMs:4000});
  a.host.bleucheese.define({id:'LAMP_FLICKER',family:'QUIET_LIGHT',
    room:this.roomId,requires:['LAMP_LIT'],worldWeight:.36,prior:.04,
    tauSeconds:.3,threshold:.87,refractoryMs:12000});
  a.host.agency.define('OBSERVE',.5);
  a.host.agency.define('MOVE',.3);
  a.host.agency.define('REST',.2);
 }
 get host(){return this.__world}
 #assertOpen(){if(this.closed)throw Error('ROOM_VISIT_ENDED')}
 #tick(ms){this.__world.tick(ms);this.tickMs+=ms}
 #checkMove(p){
  if(!finite(p.x)||!finite(p.y))return 'INVALID_POSITION';
  if(p.x<LIMITS.x0||p.x>LIMITS.x1||p.y<LIMITS.y0||p.y>LIMITS.y1)return 'OUTSIDE_ROOM';
  if(OBSTACLES.some(o=>p.x>=o.x0&&p.x<=o.x1&&p.y>=o.y0&&p.y<=o.y1))return 'FURNITURE_COLLISION';
  return null;
 }
 walkTo(x,y){
  this.#assertOpen();
  const target={x,y},d=dist(this.position,target);
  if(!finite(d))return {ok:false,error:'INVALID_POSITION'};
  // Swept collision sampling to prevent teleporting through the pine bench.
  const n=Math.max(1,Math.ceil(d/.06));
  for(let i=1;i<=n;i++){
   const p={x:this.position.x+(x-this.position.x)*i/n,
     y:this.position.y+(y-this.position.y)*i/n};
   const error=this.#checkMove(p);
   if(error)return {ok:false,error,position:copy(this.position)};
  }
  if(this.seated)this.stand();
  const ms=Math.ceil(d/LIMITS.speed*1000);
  this.position=target;this.#tick(ms);
  return {ok:true,distance_m:+d.toFixed(3),time_ms:ms,position:copy(this.position)};
 }
 #near(id){
  const obj=FIXTURES[id];if(!obj)throw RangeError('UNKNOWN_FIXTURE');
  return dist(this.position,obj)<=LIMITS.reach;
 }
 touch(id){
  this.#assertOpen();
  const obj=FIXTURES[id];if(!obj)return {ok:false,error:'UNKNOWN_FIXTURE'};
  if(!this.#near(id))return {ok:false,error:'OUT_OF_REACH',position:copy(this.position)};
  const receiptId='LAB:'+this.worldId+':touch:'+id+':'+(++this.sequence);
  const event={zone:obj.zone,source:'WORLD_GROUNDED',
    cause:'FIXTURE_'+id.toUpperCase()+'_CONTACT',
    receiptId,material:obj.material,intensity:obj.input,leaseMs:obj.leaseMs};
  const accepted=this.__world.contact(event);
  return {ok:accepted.ok,receiptId,zone:obj.zone,material:obj.material,contact:accepted};
 }
 sit(){
  this.#assertOpen();
  if(!this.#near('bench'))return {ok:false,error:'OUT_OF_REACH'};
  if(this.seated)return {ok:true,already_seated:true,receiptId:this.seated};
  const receiptId='LAB:'+this.worldId+':bench:sit:'+(++this.sequence);
  const r=this.__world.support({zone:'pelvis.seat',intensity:.84,
    cause:'PINE_BENCH_BEARING_WEIGHT',receiptId,leaseMs:30000,material:'pine'});
  this.seated=receiptId;this.#tick(350);
  return {ok:r.ok,receiptId,zone:'pelvis.seat'};
 }
 stand(){
  this.#assertOpen();
  if(!this.seated)return {ok:true,released:false};
  const receiptId=this.seated;this.seated=null;
  return this.__world.release({zone:'pelvis.seat',receiptId});
 }
 openWindow(){
  this.#assertOpen();
  if(!this.#near('window'))return {ok:false,error:'OUT_OF_REACH'};
  if(this.windowOpen)return {ok:true,already_open:true};
  const touched=this.touch('window');
  if(!touched.ok)return touched;
  this.windowOpen=true;
  this.__world.affordances(this.roomId,{BENCH_PRESENT:true,WINDOW_OPEN:true,LAMP_LIT:this.lampOn});
  const receiptId='LAB:'+this.worldId+':WINDOW_LATCH:'+(++this.sequence);
  this.__world.memory.worldEvent({receiptId,label:'WINDOW_OPENED',roomId:this.roomId});
  this.__world.atmosphere.thermal('face.chin',14,3);
  return {ok:true,windowOpen:true,receiptId};
 }
 wait(ms){
  this.#assertOpen();
  if(!Number.isSafeInteger(ms)||ms<0||ms>600000)throw RangeError('INVALID_WAIT_MS');
  this.#tick(ms);return {ok:true,elapsed_ms:ms,t_ms:this.tickMs};
 }
 admitDraft(){
  this.#assertOpen();
  const proposal=this.__world.bleucheese.proposals().find(p=>p.possibility_id==='WINDOW_DRAFT'&&!p.admitted);
  if(!proposal)return {ok:false,error:'NO_GROUNDED_DRAFT_PROPOSAL'};
  if(!this.windowOpen)return {ok:false,error:'WINDOW_NOT_OPEN'};
  const receiptId='LAB:'+this.worldId+':WIND_WORLD_EVENT:'+(++this.sequence);
  const accepted=this.__world.bleucheese.admit(proposal.id,true,receiptId);
  this.__world.memory.worldEvent({receiptId,label:'WINDOW_DRAFT_ADMITTED',roomId:this.roomId});
  return {ok:accepted.ok,receiptId,admitted:true};
 }
 say(text){
  // Narrative/LLM text is not a physics input, memory receipt or authority.
  this.#assertOpen();
  if(typeof text!=='string'||text.length>300)throw TypeError('INVALID_SPEECH');
  const ticket=this.harness.beforeResidentAction({raw:text,transport:'LAB_TEXT'});
  this.harness.afterResidentAction(ticket);
  return {ok:true,spoken:text,worldContactCreated:false};
 }
 snapshot(){
  const f=this.resident.field();
  return {schema:'REALITI_SOMA_LANTERN_ROOM_V1',worldId:this.worldId,
    room:this.roomId,t_ms:this.tickMs,position:copy(this.position),
    windowOpen:this.windowOpen,seated:!!this.seated,closed:this.closed,
    fixtures:copy(FIXTURES),grounded:f.m.reduce((s,x)=>s+x,0),
    field:f,rich:this.resident.perception(),
    bleu:this.resident.bleucheese(),memory:this.resident.memory.stats()};
 }
 close(){
  if(this.closed)return {ok:true,already_closed:true};
  const result=this.__world.stop({reason:'LAB_VISIT_COMPLETE'});
  this.seated=null;this.closed=true;
  return {...result,departure:this.resident.memory.lastDeparture()};
 }
}
module.exports=Object.freeze({LanternRoom,LIMITS,FIXTURES,OBSTACLES});
