(()=>{
'use strict';
// REALITI MATRIX V1: the spatial kernel. An atlas of local 3D charts (one per place) joined by portals that are
// SE(3) transition maps. Analytic ghost primitives expose signed distance; the resident is a kinematic capsule
// driven by an exact velocity servo and swept against the SDF union, sliding on contact. Pure math and state:
// no body coupling, no rendering. Units are meters, +x right, +y forward, +z up, quaternions [x,y,z,w].
const V='1.0-matrix',EPS=1e-6,SKIN=.01;
const fin=x=>Number.isFinite(x)?x:0,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],scale=(a,s)=>[a[0]*s,a[1]*s,a[2]*s];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],len=a=>Math.sqrt(dot(a,a)),norm=a=>{const l=len(a);return l>EPS?scale(a,1/l):[0,0,0]};
const qmul=(a,b)=>[a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]];
const qnorm=q=>{const l=Math.hypot(...q)||1;return q.map(x=>x/l)},qconj=q=>[-q[0],-q[1],-q[2],q[3]];
const qaxis=(axis,ang)=>{const a=norm(axis),s=Math.sin(ang/2);return qnorm([a[0]*s,a[1]*s,a[2]*s,Math.cos(ang/2)])};
const qrot=(q,v)=>{const p=qmul(qmul(q,[v[0],v[1],v[2],0]),qconj(q));return [p[0],p[1],p[2]]};
const qyaw=q=>Math.atan2(2*(q[3]*q[2]+q[0]*q[1]),1-2*(q[1]*q[1]+q[2]*q[2]));
const fromYaw=yaw=>qaxis([0,0,1],yaw);
const ROUND=(x,d=100)=>Math.round(x*d)/d;

function S(){C9.matrix=C9.matrix||{schema:'REALITI_MATRIX_STATE_V1',revision:0,world:{id:'CLOUD9',units:'meters',coordinateSystem:'REALITI_COORDINATE_V1'},residents:{}};return C9.matrix}
// Static world definition lives in memory and is rebuilt at load; only dynamic state (residents, moved props) persists.
const charts={},entities={},portals={};

// Signed distance of a point to one primitive, in the primitive's local frame.
function sdfLocal(e,p){
 const s=e.shape;if(!s)return Infinity;
 if(s.kind==='SPHERE'||s.kind==='POINT')return len(p)-(s.radius||0);
 if(s.kind==='BOX'||s.kind==='VOLUME'){const q=[Math.abs(p[0])-s.halfExtents[0],Math.abs(p[1])-s.halfExtents[1],Math.abs(p[2])-s.halfExtents[2]];return len(q.map(x=>Math.max(x,0)))+Math.min(Math.max(q[0],q[1],q[2]),0)}
 if(s.kind==='CAPSULE'){const h=Math.max(0,s.height/2-s.radius),z=clamp(p[2],-h,h);return len([p[0],p[1],p[2]-z])-s.radius}
 if(s.kind==='PLANE')return p[2];
 return Infinity;
}
function toLocal(e,p){return qrot(qconj(e.pose.rotation),sub(p,e.pose.position))}
function sdf(e,p){return sdfLocal(e,toLocal(e,p))}
function normalAt(e,p){const h=1e-4,g=[0,1,2].map(i=>{const a=p.slice(),b=p.slice();a[i]+=h;b[i]-=h;return sdf(e,a)-sdf(e,b)});return norm(g)}
const colliders=chart=>Object.values(entities).filter(e=>e.chart===chart&&e.collision&&!e.resident).sort((a,b)=>a.id<b.id?-1:1);
// Distance from a point to the nearest collider in a chart.
function worldSdf(chart,p,skip){let best={d:Infinity,e:null};for(const e of colliders(chart)){if(skip&&skip(e))continue;const d=sdf(e,p);if(d<best.d)best={d,e}}return best}
// Capsule clearance: the resident capsule is sampled at three sphere centers (feet, middle, head).
function capsuleSamples(r,center){const half=Math.max(0,r.shape.height/2-r.shape.radius);return [[0,0,-half],[0,0,0],[0,0,half]].map(o=>add(center,o))}
// A character controller walks on its support: the support and any step-up-able support surface are not obstacles.
// Small things lying on the ground (a kite, a toy) are stepped over; companions are not.
function walkable(r,feetZ){return e=>e.id===r.support||e.tags.includes('floor')||(e.tags.includes('support')&&e.shape?.kind==='BOX'&&e.pose.position[2]+e.shape.halfExtents[2]<=feetZ+.8)||(e.shape?.kind==='SPHERE'&&e.shape.radius<=.5&&e.pose.position[2]+e.shape.radius<=feetZ+.8&&!e.tags.includes('companion'))}
function clearance(r,center,skip){let best={d:Infinity,e:null,at:null};for(const s of capsuleSamples(r,center)){const w=worldSdf(r.chart,s,skip);const d=w.d-r.shape.radius;if(d<best.d)best={d,e:w.e,at:s}}return best}
// Sphere-trace a straight sweep: advance by the clearance each step, so the capsule can never skip a surface.
function sweep(r,from,delta,skipIds){
 const L=len(delta);if(L<EPS)return {t:1,hit:null,normal:null,end:from};
 const dir=scale(delta,1/L);let s=0;
 const walk=walkable(r,from[2]-r.shape.height/2),skip=e=>walk(e)||(skipIds&&skipIds.has(e.id));
 for(let i=0;i<48;i++){const p=add(from,scale(dir,s)),c=clearance(r,p,skip);if(c.d<=SKIN){const n=c.e?normalAt(c.e,c.at):[0,0,1];return {t:s/L,hit:c.e,normal:n,end:add(from,scale(dir,Math.max(0,s-SKIN)))}}s+=Math.max(c.d,SKIN*.5);if(s>=L)return {t:1,hit:null,normal:null,end:add(from,delta)}}
 return {t:s/L,hit:null,normal:null,end:add(from,scale(dir,s))};
}
// Supports: the highest walkable top surface under the feet footprint, within step height.
function supportUnder(chart,center,feetZ){
 let best=null;for(const e of Object.values(entities)){if(e.chart!==chart||e.resident)continue;const s=e.shape;if(!s)continue;let top=null;
  if(s.kind==='PLANE'&&e.tags.includes('floor'))top=e.pose.position[2];
  else if(s.kind==='BOX'&&e.collision){const l=toLocal(e,center);if(Math.abs(l[0])<=s.halfExtents[0]&&Math.abs(l[1])<=s.halfExtents[1])top=e.pose.position[2]+s.halfExtents[2]}
  if(top!=null&&top<=feetZ+.45&&(!best||top>best.z))best={z:top,e}}
 return best;
}
// Entities the capsule already touches, with their normals.
function touching(r,p){const skip=walkable(r,p[2]-r.shape.height/2),out=[];for(const e of colliders(r.chart)){if(skip(e))continue;let best=Infinity,at=null;for(const s of capsuleSamples(r,p)){const d=sdf(e,s)-r.shape.radius;if(d<best){best=d;at=s}}if(best<=2*SKIN)out.push({e,n:normalAt(e,at)})}return out}
// Move with slide: contacts already present only remove the inward component; then at most three sweep
// iterations; then settle onto support (kinematic gravity).
function resolveMove(r,delta){
 let p=r.pose.position.slice(),rem=delta.slice(),hits=[];
 const skipIds=new Set();for(const {e,n} of touching(r,p)){const inward=dot(rem,n);if(inward<0)rem=sub(rem,scale(n,inward));skipIds.add(e.id)}
 for(let i=0;i<3&&len(rem)>EPS;i++){const sw=sweep(r,p,rem,skipIds);p=sw.end;if(!sw.hit)break;hits.push(sw.hit.id);const left=scale(rem,1-sw.t),inward=Math.min(0,dot(left,sw.normal));rem=sub(left,scale(sw.normal,inward));if(len(rem)<EPS)break}
 const half=r.shape.height/2,sup=supportUnder(r.chart,p,p[2]-half);if(sup)p[2]=sup.z+half;
 const moved=len(sub(p,r.pose.position));r.pose.position=p;r.support=sup?sup.e.id:null;return {moved,blocked_by:moved<EPS?(hits[0]||null):null,support:r.support};
}
// Exact velocity servo over one step h: dv/dt=(u−v)/τ, dp/dt=v, closed form.
function servo(v0,u,tau,h){const a=Math.exp(-h/tau);return {v:add(u,scale(sub(v0,u),a)),dp:add(scale(u,h),scale(sub(v0,u),tau*(1-a)))}}

function define(chart,def){charts[chart]={id:chart,bounds:def.bounds,spawn:def.spawn,tags:def.tags||[],lying:def.lying||null};return charts[chart]}
function addEntity(e){const rec={id:e.id,chart:e.chart,pose:{position:e.position||[0,0,0],rotation:e.rotation||[0,0,0,1]},shape:e.shape||null,tags:e.tags||[],collision:!!e.collision,visible:false,material:e.material||null,label:e.label||e.id.split('.').pop().replaceAll('_',' '),dynamic:!!e.dynamic,resident:!!e.resident,affordances:e.affordances||[]};entities[rec.id]=rec;return rec}
function removeEntity(id){delete entities[id]}
function definePortal(p){const rec={id:p.id,from:p.from,to:p.to,entry:p.entry,exit:p.exit,rotation:p.rotation||[0,0,0,1],radius:p.radius||.6,label:p.label||p.id};portals[rec.id]=rec;addEntity({id:rec.id,chart:p.from,position:p.entry,shape:{kind:'SPHERE',radius:rec.radius},tags:['portal','doorway'],label:rec.label,affordances:['through']});return rec}
function bump(){S().revision++;return S().revision}

function resident(id='resident:self'){const s=S();if(!s.residents[id]){s.residents[id]={id,chart:null,pose:{position:[0,0,.85],rotation:[0,0,0,1]},v:[0,0,0],shape:{kind:'CAPSULE',radius:.35,height:1.7},posture:'standing',support:null,on:null,intent:null,contacts:[]}}const r=s.residents[id];if(!entities[id])addEntity({id,chart:r.chart,position:r.pose.position,shape:r.shape,tags:['resident'],collision:true,resident:true});entities[id].chart=r.chart;entities[id].pose=r.pose;return r}
function enter(chart,id='resident:self'){const c=charts[chart];if(!c)return null;const r=resident(id);r.chart=chart;r.pose.position=c.spawn.position.slice();r.pose.rotation=(c.spawn.rotation||[0,0,0,1]).slice();r.v=[0,0,0];r.intent=null;r.posture=c.lying?'lying':'standing';r.on=c.lying;r.last_block=null;r.last_portal=null;const sup=supportUnder(chart,r.pose.position,r.pose.position[2]-r.shape.height/2);r.support=sup?sup.e.id:null;if(c.lying){r.support=c.lying;const L=entities[c.lying];if(L?.shape?.kind==='BOX')r.pose.position[2]=L.pose.position[2]+L.shape.halfExtents[2]+r.shape.radius}entities[id].chart=chart;bump();return r}

// Portal traversal is a discrete jump: z⁺ = J(z⁻). Position and velocity are mapped through the SE(3) transition.
function traverse(r,portal){const P=portals[portal];if(!P||P.from!==r.chart)return null;r.chart=P.to;r.pose.position=P.exit.slice();r.pose.rotation=qnorm(qmul(P.rotation,r.pose.rotation));r.v=qrot(P.rotation,r.v);r.intent=null;r.posture='standing';r.on=null;const sup=supportUnder(r.chart,r.pose.position,r.pose.position[2]-r.shape.height/2);r.support=sup?sup.e.id:null;entities[r.id].chart=r.chart;bump();return P}
function portalHere(r){for(const P of Object.values(portals))if(P.from===r.chart&&len(sub(r.pose.position,P.entry))<=P.radius+r.shape.radius)return P;return null}

const WALK=1.2,TAU=.2;
// One world-time step of locomotion. Intent is either a displacement to cover or a target to settle on
// (critically damped: ω τ = 1/4). Returns true when the resident is still moving.
function step(dt,id='resident:self'){
 const r=S().residents[id];if(!r||!r.chart||dt<=0)return false;
 const it=r.intent;let u=[0,0,0];
 if(it?.kind==='move'){const left=sub(it.target,r.pose.position);left[2]=0;const d=len(left);if(d<=Math.max(.02,len(r.v)*TAU)){const res=resolveMove(r,left);r.walked=(r.walked||0)+res.moved;r.v=[0,0,0];r.intent=null;bump();return false}u=scale(norm(left),Math.min(WALK,d/TAU))}
 else if(it?.kind==='approach'){const E=entities[it.entity];let dir,toward;
  if(E&&!E.tags.includes('portal')){const s=sdf(E,r.pose.position),n=normalAt(E,r.pose.position);dir=s<3?scale(n,-1):sub(E.pose.position,r.pose.position);toward=Math.max(0,s-.65)}// steer down the signed-distance gradient; stop 0.3 m clear of the surface
  else{dir=sub(it.target,r.pose.position);toward=Math.max(0,len([dir[0],dir[1],0])-it.stop)}
  dir[2]=0;if(toward<=.03&&len(r.v)<.05){r.intent=null}else u=scale(norm(dir),Math.min(WALK,toward/(4*TAU)))}
 if(!it&&len(r.v)<EPS)return false;
 const {v,dp}=servo(r.v,u,TAU,dt);r.v=v;
 if(len(dp)>EPS){const res=resolveMove(r,dp);r.walked=(r.walked||0)+res.moved;if(res.blocked_by){r.v=[0,0,0];r.last_block=res.blocked_by;r.intent=null}
  const P=portalHere(r);if(P&&it){if(it.allow_portal){traverse(r,P.id);r.last_portal=P.id}else if(it.kind==='move'){r.at_portal=P.id;r.intent=null;r.v=[0,0,0]}}bump()}
 if(len(r.v)<1e-3&&!r.intent)r.v=[0,0,0];
 return !!(r.intent||len(r.v)>EPS);
}
function turn(yawDeg,id='resident:self'){const r=resident(id);r.pose.rotation=qnorm(qmul(fromYaw(yawDeg*Math.PI/180),r.pose.rotation));bump();return r.pose.rotation}
function face(targetId,id='resident:self'){const r=resident(id),e=entities[targetId];if(!e||e.chart!==r.chart)return null;const d=sub(e.pose.position,r.pose.position);if(Math.hypot(d[0],d[1])<EPS)return r.pose.rotation;r.pose.rotation=fromYaw(Math.atan2(-d[0],d[1]));bump();return r.pose.rotation}
function facing(r){return qrot(r.pose.rotation,[0,1,0])}
function moveLocal(local,id='resident:self'){const r=resident(id);const L=Math.min(len(local),30);if(L<EPS)return null;const d=qrot(r.pose.rotation,scale(norm(local),L));r.last_block=null;r.at_portal=null;r.walked=0;r.intent={kind:'move',target:add(r.pose.position,[d[0],d[1],0]),distance:L,allow_portal:false};return r.intent}
function moveTo(target,id='resident:self'){const r=resident(id);r.last_block=null;r.at_portal=null;r.walked=0;r.intent={kind:'move',target:[target[0],target[1],r.pose.position[2]],distance:len(sub(target,r.pose.position)),allow_portal:false};return r.intent}
function approach(targetId,id='resident:self'){const r=resident(id),e=entities[targetId];if(!e||e.chart!==r.chart)return null;const center=len(sub(e.pose.position,r.pose.position)),surface=Math.max(0,sdf(e,r.pose.position)),reach=Math.max(.5,center-surface+.5);r.last_block=null;r.at_portal=null;r.walked=0;r.intent={kind:'approach',target:e.pose.position.slice(),stop:e.tags.includes('portal')?0:reach,entity:targetId,allow_portal:e.tags.includes('portal')};face(targetId,id);return r.intent}

// Queries. Within a chart distance is Euclidean; across charts it is a portal-graph geodesic or UNKNOWN.
function distance(a,b){const A=entities[a],B=entities[b];if(!A||!B)return null;if(A.chart===B.chart)return len(sub(A.pose.position,B.pose.position));return geodesic(A,B)}
function geodesic(A,B){const dist={[A.chart]:0},at={[A.chart]:A.pose.position},done=new Set();for(let k=0;k<64;k++){let cur=null;for(const c of Object.keys(dist))if(!done.has(c)&&(cur==null||dist[c]<dist[cur]))cur=c;if(cur==null)return null;if(cur===B.chart)return dist[cur]+len(sub(B.pose.position,at[cur]));done.add(cur);for(const P of Object.values(portals)){if(P.from!==cur)continue;const d=dist[cur]+len(sub(P.entry,at[cur]))+1;if(!(P.to in dist)||d<dist[P.to]){dist[P.to]=d;at[P.to]=P.exit}}}return null}
function words(r,e){if(e.id===r.support)return 'underfoot';const d=sub(e.pose.position,r.pose.position),f=facing(r),ang=Math.atan2(f[0]*d[1]-f[1]*d[0],f[0]*d[0]+f[1]*d[1])*180/Math.PI,flat=Math.hypot(d[0],d[1]);if(flat<.5&&d[2]>1)return 'above';if(flat<.5&&d[2]<-1)return 'below';const a=((ang%360)+360)%360;return a<22.5||a>=337.5?'ahead':a<67.5?'ahead-left':a<112.5?'left':a<157.5?'behind-left':a<202.5?'behind':a<247.5?'behind-right':a<292.5?'right':'ahead-right'}
function nearby(id='resident:self',{radius=10,limit=12}={}){const r=S().residents[id];if(!r)return [];return Object.values(entities).filter(e=>e.chart===r.chart&&!e.resident&&!e.tags.includes('structure')&&!e.tags.includes('portal')).map(e=>({e,c:len(sub(e.pose.position,r.pose.position)),d:Math.max(0,sdf(e,r.pose.position))})).filter(x=>x.d<=radius).sort((a,b)=>a.d-b.d||(a.e.id<b.e.id?-1:1)).slice(0,limit).map(({e,c,d})=>({id:e.id,label:e.label,distance_m:ROUND(d),center_m:ROUND(c),direction:words(r,e),tags:e.tags.slice(),material:e.material,affordances:e.affordances.slice(),in_reach:d<=1.0}))}
function project(id='resident:self'){const r=S().residents[id];if(!r||!r.chart)return {schema:'REALITI_SPACE_READ_V1',world:S().world.id,chart:null,law:'no spatial body is placed'};const f=facing(r);
 return {schema:'REALITI_SPACE_READ_V1',world:S().world.id,chart:r.chart,pose:{position:r.pose.position.map(x=>ROUND(x)),facing:f.map(x=>ROUND(x)),yaw_deg:Math.round(qyaw(r.pose.rotation)*180/Math.PI)},body:{kind:r.shape.kind,radius:r.shape.radius,height:r.shape.height,posture:r.posture,on:r.on,support:r.support},moving:!!r.intent||len(r.v)>EPS,speed_m_s:ROUND(len(r.v)),nearby:nearby(id),
  portals:Object.values(portals).filter(P=>P.from===r.chart).map(P=>({id:P.id,label:P.label,to:P.to,distance_m:ROUND(len(sub(P.entry,r.pose.position))),direction:words(r,entities[P.id])})).sort((a,b)=>a.distance_m-b.distance_m),
  bounds:charts[r.chart]?.bounds||null,matrix_revision:S().revision,law:'this is an observer projection of spatial facts; it never moves anything'}}
function frame(id='resident:self'){const r=S().residents[id];if(!r||!r.chart)return null;return {chart:r.chart,position:r.pose.position.map(x=>ROUND(x)),yaw_deg:Math.round(qyaw(r.pose.rotation)*180/Math.PI),posture:r.posture,support:r.support,portal:r.last_portal||null}}
function resolve(query,id='resident:self',{portal=false}={}){const r=S().residents[id],q=String(query||'').trim().toLowerCase().replace(/^the\s+/,'');if(!q)return null;if(entities[q]&&entities[q].chart===r?.chart&&(!portal||entities[q].tags.includes('portal')))return entities[q];const pool=Object.values(entities).filter(e=>e.chart===r?.chart&&!e.resident&&(!portal||e.tags.includes('portal')));const exact=pool.find(e=>e.label.toLowerCase()===q||e.id.toLowerCase().endsWith('.'+q));if(exact)return exact;const hits=pool.filter(e=>e.label.toLowerCase().includes(q)||e.tags.includes(q)||e.id.toLowerCase().includes(q));return hits.sort((a,b)=>len(sub(a.pose.position,r.pose.position))-len(sub(b.pose.position,r.pose.position)))[0]||null}
function raycast({origin,direction,maxDistance=20,chart}){const dir=norm(direction);let s=0;for(let i=0;i<64&&s<maxDistance;i++){const p=add(origin,scale(dir,s)),w=worldSdf(chart,p);if(w.d<=SKIN)return {hit:w.e.id,distance:ROUND(s),point:p.map(x=>ROUND(x)),normal:normalAt(w.e,p).map(x=>ROUND(x,1000))};s+=Math.max(w.d,SKIN)}return {hit:null,distance:null}}
function contains(chart,p){const c=charts[chart];if(!c)return false;const b=c.bounds;return Math.abs(p[0]-b.center[0])<=b.halfExtents[0]&&Math.abs(p[1]-b.center[1])<=b.halfExtents[1]&&Math.abs(p[2]-b.center[2])<=b.halfExtents[2]}

window.REALITI_MATRIX_V1=Object.freeze({version:V,math:Object.freeze({add,sub,scale,dot,len,norm,qmul,qnorm,qaxis,qrot,qyaw,fromYaw,servo}),state:S,charts:()=>charts,entities:()=>entities,portals:()=>portals,define,addEntity,removeEntity,definePortal,resident,enter,traverse,step,turn,face,moveLocal,moveTo,approach,sdf,normalAt,clearance,sweep,raycast,contains,distance,nearby,project,frame,resolve,facing,words,bump,constants:Object.freeze({WALK,TAU})});
})();
