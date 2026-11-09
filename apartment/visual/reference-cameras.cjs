/* Four stable Matrix Z-up camera poses. No physics, no movement. */
(function(factory){
 'use strict';const api=Object.freeze(factory());
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(typeof window==='object')Object.defineProperty(window,'REALITI_APARTMENT_REFERENCE_CAMERAS_V0',
  {value:api,configurable:false,writable:false});
})(function(){
 'use strict';
 const names=Object.freeze([
  Object.freeze({id:'NE',label:'Northeast',sx:1,sy:1}),
  Object.freeze({id:'NW',label:'Northwest',sx:-1,sy:1}),
  Object.freeze({id:'SW',label:'Southwest',sx:-1,sy:-1}),
  Object.freeze({id:'SE',label:'Southeast',sx:1,sy:-1})]);
 const FRAME=Object.freeze({width:640,height:400,halfHeight:9.7,radius:15,elevation:12});
 function referenceViews(scene){
  if(scene?.schema!=='REALITI_APARTMENT_VISUAL_SCENE_V0'||
     scene.chart!=='CLOUD_NINE_NEST')throw Error('REFERENCE_HOME_SNAPSHOT_REQUIRED');
  const center=scene.bounds?.center;
  if(!Array.isArray(center)||center.length!==3||!center.every(Number.isFinite))
   throw Error('REFERENCE_HOME_BOUNDS_REQUIRED');
  const target=[center[0],center[1],1.05];
  return names.map(n=>Object.freeze({id:n.id,label:n.label,
   position:Object.freeze([target[0]+n.sx*FRAME.radius,
     target[1]+n.sy*FRAME.radius,target[2]+FRAME.elevation]),
   target:Object.freeze(target.slice()),up:Object.freeze([0,0,1]),
   camera:'orthographic',frame:FRAME,visual_only:true,contact_minted:false}));
 }
 return {FRAME,referenceViews};
});
