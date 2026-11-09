/* REALITI HOME: pure read-only projection of the actual native Matrix. No rendering/physics. */
(function(factory){
  'use strict';
  const api=Object.freeze(factory());
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(typeof window==='object')Object.defineProperty(window,
   'REALITI_APARTMENT_VISUAL_PROJECTION_V0',{value:api,configurable:false,writable:false});
})(function(){
'use strict';
const HOME='CLOUD_NINE_NEST', SCHEMA='REALITI_APARTMENT_VISUAL_SCENE_V0';
const ID=/^[A-Za-z0-9._:-]{1,120}$/, MAX_ENTITIES=512;
const TAGS=new Set(['floor','ceiling','wall','structure','window','rain','light','lamp',
'furniture','seat','support','bed','mattress','soft','rug','textile','storage',
'books','book','desk','chair','shelf','closet','toy','cat','dog','ferret','companion',
'pet','bedroom-chest','paint-sample','decor','instrument','music','reading','quiet',
'cardboard','tea','pet-bed','play','scratcher','cushion','writing','doorway']);
const fail=s=>{throw Error('VISUAL_SCENE_'+s)};
function vector(v,n,label,limit=100){
 if(!Array.isArray(v)||v.length!==n||!v.every(x=>
   typeof x==='number'&&Number.isFinite(x)&&Math.abs(x)<=limit))fail('INVALID_'+label);
 return v.slice();
}
function positive(v,label){if(typeof v!=='number'||!Number.isFinite(v)||v<=0||v>100)
 fail('INVALID_'+label);return v}
function shape(s){
 if(!s||typeof s!=='object')return null;
 if(s.kind==='BOX'||s.kind==='VOLUME')return {kind:s.kind,
  halfExtents:vector(s.halfExtents,3,'HALF_EXTENTS').map(x=>positive(x,'HALF_EXTENT'))};
 if(s.kind==='SPHERE'||s.kind==='POINT')return {kind:s.kind,
  radius:positive(s.radius,'RADIUS')};
 if(s.kind==='CAPSULE'){
  const radius=positive(s.radius,'RADIUS'),height=positive(s.height,'HEIGHT');
  if(height<2*radius)fail('INVALID_CAPSULE');return {kind:'CAPSULE',radius,height};
 }
 if(s.kind==='PLANE')return {kind:'PLANE'};
 return null;
}
function frozen(x){
 if(x&&typeof x==='object'&&!Object.isFrozen(x)){
  for(const v of Object.values(x))frozen(v);
  Object.freeze(x);
 }
 return x;
}
function projectNative(M){
 if(!M||typeof M.state!=='function'||typeof M.charts!=='function'||
    typeof M.entities!=='function')fail('NATIVE_MATRIX_REQUIRED');
 const charts=M.charts();
 if(!charts||Object.keys(charts).length!==1||!Object.prototype.hasOwnProperty.call(charts,HOME))
  fail('ONE_HOME_CHART_REQUIRED');
 const state=M.state(),viewer=state?.residents?.['resident:self'],room=charts[HOME];
 if(!viewer||viewer.chart!==HOME)fail('RESIDENT_NOT_HOME');
 if(!Number.isSafeInteger(state.revision)||state.revision<0)fail('INVALID_MATRIX_REVISION');
 if(room.bounds?.kind!=='BOX')fail('INVALID_CHART_BOUNDS');
 const entities=[],unsupported=[],raw=Object.values(M.entities());
 if(raw.length>512)fail('ENTITY_LIMIT');
 for(const e of raw){
  if(!e||e.chart!==HOME||e.resident===true)continue;
  if(!ID.test(e.id))fail('INVALID_ENTITY_ID');
  if(e.tags?.some(t=>['private','journal','pocket-key'].includes(t)))continue;
  const s=shape(e.shape);
  if(!s){unsupported.push({id:e.id,kind:String(e.shape?.kind||'none').slice(0,20)});continue}
  if(!e.pose)fail('ENTITY_POSE_MISSING');
  const tags=Array.isArray(e.tags)?e.tags.filter(t=>TAGS.has(t)||
    (typeof t==='string'&&/^(?:accent|theme|bedroom|swatch|palette-role):[a-z0-9-]{1,32}$/.test(t))).slice(0,24):[];
  const material=typeof e.material==='string'&&/^[a-z][a-z0-9_-]{0,30}$/.test(e.material)
    ?e.material:null;
  const label=typeof e.label==='string'?e.label.replace(/[\x00-\x1f\x7f]/g,' ').slice(0,100):e.id;
  entities.push({id:e.id,position:vector(e.pose.position,3,'ENTITY_POSITION'),
   rotation:vector(e.pose.rotation,4,'ENTITY_ROTATION',1.01),shape:s,
   collision:e.collision===true,material,tags,label});
 }
 entities.sort((a,b)=>a.id.localeCompare(b.id,'en'));
 unsupported.sort((a,b)=>a.id.localeCompare(b.id,'en'));
 return frozen({ok:true,schema:SCHEMA,chart:HOME,source:'NATIVE_MATRIX_READ_ONLY',
  matrix_revision:state.revision,coordinate_system:'REALITI_COORDINATE_V1_Z_UP_METERS',
  bounds:{center:vector(room.bounds.center,3,'CHART_CENTER'),
   halfExtents:vector(room.bounds.halfExtents,3,'CHART_SIZE').map(x=>positive(x,'HALF_EXTENT'))},
  viewer:{position:vector(viewer.pose?.position,3,'RESIDENT_POSITION'),
   rotation:vector(viewer.pose?.rotation,4,'RESIDENT_ROTATION',1.01),
   posture:String(viewer.posture||'unknown').slice(0,24)},
  entities,unsupported,visual_only:true,contact_minted:false});
}
return {HOME,SCHEMA,projectNative};
});
