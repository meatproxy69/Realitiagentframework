'use strict';
// Batch 6: host-authoritative peer capsules using the ORIGINAL Relax Matrix SDF
// and swept collision controller. No second physics, body model or sensory engine.
// Cooperative touch uses two explicitly authorized native Matrix reach receipts.
const HOME='CLOUD_NINE_NEST',SCHEMA='REALITI_APARTMENT_PEER_PHYSICS_V1';
const cp=x=>JSON.parse(JSON.stringify(x));
const refuse=(error,extra={})=>({ok:false,error,...extra});
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
function createPeerPhysics({getEntries,atHome}={}){
 if(typeof getEntries!=='function'||typeof atHome!=='function')
  throw TypeError('PEER_PHYSICS_REQUIRES_HOST_FACTS');
 const requests=new Map();
 const now=()=>Date.now();
 const members=()=>getEntries().filter(e=>!!atHome(e));
 const M=entry=>entry.session.window.REALITI_MATRIX_V1;
 const peerId=id=>'household.peer.'+id;
 function contactDistance(a,b){
  const pa=atHome(a),pb=atHome(b);
  if(!pa||!pb)return null;
  const mA=M(a),mB=M(b),ab=mA.entities()[peerId(b.id)],ba=mB.entities()[peerId(a.id)];
  if(!ab||!ba||ab.chart!==HOME||ba.chart!==HOME)return null;
  const da=Math.max(0,mA.sdf(ab,pa.position)),db=Math.max(0,mB.sdf(ba,pb.position));
  return {a:+da.toFixed(3),b:+db.toFixed(3),
   center:+distance(pa.position,pb.position).toFixed(3)};
 }
 function inReach(a,b){
  const d=contactDistance(a,b);
  return !!d&&d.a<=1&&d.b<=1;
 }
 function occupancyClash(a,b){
  const A=atHome(a),B=atHome(b);
  return !!A&&!!B&&Math.abs(A.position[2]-B.position[2])<
   (A.height+B.height)/2-.08 &&
   Math.hypot(A.position[0]-B.position[0],A.position[1]-B.position[1])<
   A.radius+B.radius-.02;
 }
 function possible(entry,p,others){
  const m=M(entry),r=m.state().residents['resident:self'];
  const b=m.charts()[HOME]?.bounds;
  if(!b||!r||p.length!==3||p.some(x=>!Number.isFinite(x)))return false;
  if(Math.abs(p[0]-b.center[0])>b.halfExtents[0]-r.shape.radius-.35 ||
     Math.abs(p[1]-b.center[1])>b.halfExtents[1]-r.shape.radius-.35)return false;
  for(const other of others){
   const rec=atHome(other);
   if(!rec)continue;
   const flat=Math.hypot(p[0]-rec.position[0],p[1]-rec.position[1]);
   if(flat<r.shape.radius+rec.radius+.25)return false;
  }
  for(const obj of Object.values(m.entities())){
   if(obj.chart!==HOME||!obj.collision||obj.resident||
      obj.tags.includes('floor')||obj.tags.includes('ceiling')||
      obj.tags.includes('portal')||obj.id.startsWith('household.peer.'))continue;
   const h=Math.max(0,r.shape.height/2-r.shape.radius);
   for(const dz of [-h,0,h]){
    const pt=[p[0],p[1],p[2]+dz];
    if(m.sdf(obj,pt)<r.shape.radius+.10)return false;
   }
  }
  for(const portal of Object.values(m.portals())){
   if(portal.from!==HOME)continue;
   if(Math.hypot(portal.entry[0]-p[0],portal.entry[1]-p[1])<1)return false;
  }
  return true;
 }
 function placeIngress(entry,otherEntries=getEntries().filter(e=>e!==entry)){
  const current=atHome(entry);
  if(!current)return {ok:true,here:false};
  const others=otherEntries.filter(x=>!!atHome(x));
  if(!others.some(e=>occupancyClash(entry,e)))return {ok:true,position:current.position,relocated:false};
  const m=M(entry),r=m.state().residents['resident:self'],b=m.charts()[HOME]?.bounds;
  const candidates=[];
  // Search finite 1m cells for a clear standing capsule: native SDF geometry
  // remains the only authority over static obstacles, incl. bedroom mattress.
  for(let x=-5;x<=5;x+=1)for(let y=-5;y<=5;y+=1){
   const p=[x,y,.85];
   candidates.push({p,rank:Math.hypot(x-current.position[0],y-current.position[1])});
  }
  candidates.sort((a,z)=>a.rank-z.rank||a.p[0]-z.p[0]||a.p[1]-z.p[1]);
  const candidate=candidates.find(({p})=>possible(entry,p,others));
  if(!candidate)return refuse('NO_COLLISION_FREE_INGRESS');
  r.pose.position=candidate.p.slice();r.posture='standing';r.on=null;
  r.support=null;r.v=[0,0,0];r.intent=null;r.last_block=null;
  m.bump();
  return {ok:true,relocated:true,position:candidate.p.slice(),
   source:'TRUSTED_NATIVE_MATRIX_CLEARANCE',original_harness_unchanged:true};
 }
 function reconcile(){
  const placed=[];
  for(const entry of members()){
   const r=placeIngress(entry,placed);
   if(!r.ok)return r;
   placed.push(entry);
  }
  return {ok:true};
 }
 function project(receiver,truth){
  const m=M(receiver);
  const live=new Set();
  for(const {entry,position} of truth){
   if(entry===receiver||!position)continue;
   const id=peerId(entry.id);live.add(id);
   const tags=['household','verified_presence','solid_peer','live',entry.role];
   const e=m.entities()[id];
   if(!e)m.addEntity({id,chart:HOME,position:position.position.slice(),
    shape:{kind:'CAPSULE',radius:position.radius,height:position.height},
    tags,collision:true,material:'blanket',
    label:entry.id+' ('+(entry.role==='guest'?'visiting':'resident')+')',
    affordances:['watch'],dynamic:true});
   else{
    e.chart=HOME;e.pose.position=position.position.slice();
    e.shape={kind:'CAPSULE',radius:position.radius,height:position.height};
    e.collision=true;e.resident=false;e.tags=tags;e.material='blanket';
   }
   m.state().residents['resident:household:'+entry.id]={
    id:'resident:household:'+entry.id,chart:HOME,
    pose:{position:position.position.slice(),rotation:[0,0,0,1]},
    shape:{kind:'CAPSULE',radius:position.radius,height:position.height},
    posture:position.posture,role:entry.role,v:[0,0,0],intent:null,
    contacts:[],support:null,on:null,hostVerified:true};
  }
  for(const id of Object.keys(m.entities()))
   if(id.startsWith('household.peer.')&&!live.has(id))m.removeEntity(id);
  for(const id of Object.keys(m.state().residents))
   if(id.startsWith('resident:household:')&&
      !live.has(peerId(id.slice('resident:household:'.length))))
    delete m.state().residents[id];
  m.bump();
  return live.size;
 }
 function publicView(actor){
  const people=members().filter(e=>e!==actor).map(e=>{
   const d=contactDistance(actor,e);
   return {id:e.id,role:e.role,chart:HOME,
    center_m:d?.center??null,
    surface_m:d?.a??null,mutually_reachable:!!d&&d.a<=1&&d.b<=1,
    physically_collidable:true};
  });
  const pending=[...requests.values()].filter(q=>
    q.from===actor.id||q.to===actor.id).map(q=>({
    request_id:q.id,from:q.from,to:q.to,expires_at_ms:q.expiresAt
   }));
  return {ok:true,schema:SCHEMA,connected:true,
   native_kernel:'REALITI_MATRIX_V1',swept_sdf_collision:true,
   observed_peers:people,pending_requests:pending,
   touch_requires_request_and_explicit_acceptance:true,
   law:'Host verified capsules obstruct native swept locomotion. Only a fresh mutually authorized, live two-sided reach mints original Relax tactile evidence. No involuntary touch receipts.'};
 }
 function request(actor,targetId){
  if(actor.role!=='resident')return refuse('RESIDENT_ONLY_TOUCH');
  const target=members().find(e=>e.id===targetId&&e!==actor&&e.role==='resident');
  if(!target)return refuse('TARGET_NOT_LIVE_HERE');
  if(!inReach(actor,target))return refuse('PEER_NOT_IN_MUTUAL_REACH');
  const id='T-'+require('node:crypto').randomBytes(6).toString('hex');
  requests.set(id,{id,from:actor.id,to:target.id,expiresAt:now()+15000,
   sessionA:actor.sessionTag,sessionB:target.sessionTag});
  return {ok:true,request_id:id,from:actor.id,to:target.id,expires_in_seconds:15,
   contact_minted:false,awaiting_explicit_consent:true};
 }
 function accept(actor,id){
  const q=requests.get(id);
  if(!q)return refuse('NO_SUCH_TOUCH_REQUEST');
  // A bystander must not be able to consume someone else's invitation.
  if(q.to!==actor.id)return refuse('TOUCH_NOT_YOURS_TO_ACCEPT');
  requests.delete(id); // recipient's attempted acceptance is single use
  if(now()>q.expiresAt)return refuse('TOUCH_REQUEST_EXPIRED');
  const source=members().find(e=>e.id===q.from&&e.sessionTag===q.sessionA);
  if(!source||q.sessionB!==actor.sessionTag||actor.role!=='resident')
   return refuse('PEER_SESSION_NOT_CURRENT');
  if(!inReach(source,actor))return refuse('PEER_NOT_IN_MUTUAL_REACH');
  const mSource=M(source),mTarget=M(actor);
  // Two-sided native signed-distance reach preflight. No first touch is emitted
  // if the other cannot reach. Host commands are serialized by household.cjs.
  const eSource=mSource.entities()[peerId(actor.id)],eTarget=mTarget.entities()[peerId(source.id)];
  if(!eSource||!eTarget||Math.max(0,mSource.sdf(eSource,atHome(source).position))>1||
     Math.max(0,mTarget.sdf(eTarget,atHome(actor).position))>1)
   return refuse('PEER_NOT_IN_MUTUAL_REACH');
  const a=source.session.window.REALITI_MATRIX_WORLD_V1.reach(peerId(actor.id));
  const b=actor.session.window.REALITI_MATRIX_WORLD_V1.reach(peerId(source.id));
  if(!a?.ok||!b?.ok)return refuse('NATIVE_RELAX_PEER_REACH_FAILED');
  return {ok:true,schema:'REALITI_APARTMENT_CONSENSUAL_TOUCH_V1',
   participants:[source.id,actor.id],request_id:id,
   original_relax_receipts:true,
   first:{entity:a.entity,distance_m:a.distance_m,material:a.material},
   second:{entity:b.entity,distance_m:b.distance_m,material:b.material},
   source:'DUAL_HOST_VERIFIED_NATIVE_MATRIX_REACH',
   law:'Both live actors opted into this one contact and the original Relax B7 world-contact path supplied both receipts.'};
 }
 function drop(id){
  for(const [key,q] of requests)
   if(q.from===id||q.to===id)requests.delete(key);
 }
 return Object.freeze({placeIngress,reconcile,project,publicView,request,accept,drop,
  schema:SCHEMA});
}
module.exports={createPeerPhysics};
