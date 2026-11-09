/* REALITI visual input: only existing public Agent Door commands mutate the world.
 * Camera and screenshots are spectator presentation; no direct Matrix mutators. */
(function(factory){
 'use strict';const api=Object.freeze(factory());
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(typeof window==='object')Object.defineProperty(window,
  'REALITI_APARTMENT_VISUAL_INPUT_V0',{value:api,configurable:false,writable:false});
})(function(){
 'use strict';
 const MAP=Object.freeze({
  w:'move forward 0.75',ArrowUp:'move forward 0.75',
  s:'move back 0.75',ArrowDown:'move back 0.75',
  a:'turn left 30',ArrowLeft:'turn left 30',
  d:'turn right 30',ArrowRight:'turn right 30'
 });
 const ID=/^[a-zA-Z0-9._:-]{1,120}$/;
 const SCHEMA='REALITI_APARTMENT_VISUAL_SCENE_V0';
 function keyCommand(key){
  const k=typeof key==='string'&&key.length===1?key.toLowerCase():key;
  return Object.hasOwn(MAP,k)?MAP[k]:null;
 }
 function approachCommand(scene,id){
  if(scene?.schema!==SCHEMA||scene.chart!=='CLOUD_NINE_NEST')return null;
  if(typeof id!=='string'||!ID.test(id))return null;
  const e=scene.entities?.find(x=>x.id===id);
  if(!e||!e.shape||!Array.isArray(e.tags))return null;
  if(e.tags.some(x=>['wall','ceiling','floor','portal','doorway'].includes(x)))return null;
  return 'approach '+id;
 }
 function createController({door,snapshot}={}){
  if(typeof door?.run!=='function'||typeof snapshot!=='function')
   throw Error('VISUAL_AGENT_DOOR_REQUIRED');
  let busy=false;
  async function dispatch(command){
   if(!command)return {ok:false,error:'VISUAL_INPUT_UNSUPPORTED'};
   if(busy)return {ok:false,error:'VISUAL_INPUT_BUSY'};
   busy=true;
   try{
    const before=snapshot();
    if(before?.schema!==SCHEMA||before.chart!=='CLOUD_NINE_NEST')
     return {ok:false,error:'VISUAL_NOT_HOME'};
    // The existing Door owns authorization, collision, time and sensory evidence.
    const response=await door.run(command);
    const after=snapshot();
    const ok=response?.ok!==false&&response?.result?.ok!==false;
    return {ok,command,changed:after.matrix_revision!==before.matrix_revision,
      matrix_revision:after.matrix_revision,
      ...(!ok?{reason:String(response?.error||response?.result?.error||'MATRIX_REFUSED').slice(0,100)}:{})};
   }catch(e){
    return {ok:false,command,error:'VISUAL_AGENT_DOOR_FAILED',
      reason:String(e?.message||e).slice(0,120)};
   }finally{busy=false}
  }
  return Object.freeze({
   key(key){return dispatch(keyCommand(key))},
   approach(id){return dispatch(approachCommand(snapshot(),id))},
   busy(){return busy}
  });
 }
 return Object.freeze({keyCommand,approachCommand,createController});
});