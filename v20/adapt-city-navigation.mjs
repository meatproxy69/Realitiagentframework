// Targeted navigation correction for the DERIVED V20 candidate.
// The pinned upstream City, geometry, original ledger, and other world code stay untouched.
// Function.toString() places these reviewed functions inside the original City closure.

function cityNavObstacles(){
 return Object.values(ent()).filter(e=>e.chart===CITY&&e.collision&&!e.resident&&e.shape&&
   !e.tags.includes('floor')&&!e.id.startsWith('city.edge.'));
}
function cityNavFree(p,obstacles){
 const r=me(),radius=(r?.shape?.radius||.35)+.65;
 if(Math.abs(p[0])>75||Math.abs(p[1])>75)return false;
 for(const e of obstacles)if(M.sdf(e,[p[0],p[1],.85])<radius)return false;
 return true;
}
function cityNavClearLine(a,b,obstacles){
 const d=dist2(a,b),n=Math.max(1,Math.ceil(d/1.25));
 for(let i=1;i<=n;i++){
  const p=[a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n];
  if(!cityNavFree(p,obstacles))return false;
 }
 return true;
}
// Deterministic ground-level A* over the real City collision shapes.
function cityNavPlan(from,to){
 const obs=cityNavObstacles();
 if(cityNavClearLine(from,to,obs))return [to];
 const N=39,S=4,origin=-76,point=k=>[origin+(k%N)*S,origin+Math.floor(k/N)*S];
 const available=new Map(),free=k=>{
  if(!available.has(k))available.set(k,cityNavFree(point(k),obs));
  return available.get(k);
 };
 const nearest=p=>{
  const ix=Math.round((p[0]-origin)/S),iy=Math.round((p[1]-origin)/S);
  let pick=-1,best=Infinity;
  for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){
   const x=ix+dx,y=iy+dy;if(x<0||x>=N||y<0||y>=N)continue;
   const k=y*N+x,q=point(k),d=dist2(p,q);
   if(d<best&&free(k)&&cityNavClearLine(p,q,obs)){pick=k;best=d}
  }
  return pick;
 };
 const start=nearest(from),goal=nearest(to);
 if(start<0||goal<0)return null;
 const g=new Float64Array(N*N).fill(Infinity),came=new Int32Array(N*N).fill(-1);
 const closed=new Uint8Array(N*N),queue=[start],queued=new Set([start]);
 g[start]=0;
 while(queue.length){
  let n=0,score=Infinity;
  for(let i=0;i<queue.length;i++){
   const k=queue[i],f=g[k]+dist2(point(k),point(goal));
   if(f<score){score=f;n=i}
  }
  const k=queue.splice(n,1)[0];queued.delete(k);
  if(k===goal)break;
  if(closed[k])continue;
  closed[k]=1;
  const x=k%N,y=Math.floor(k/N);
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
   if(!dx&&!dy)continue;
   const xx=x+dx,yy=y+dy;if(xx<0||xx>=N||yy<0||yy>=N)continue;
   const next=yy*N+xx;if(closed[next]||!free(next))continue;
   if(dx&&dy&&(!free(y*N+xx)||!free(yy*N+x)))continue;
   const ng=g[k]+Math.hypot(dx,dy)*S;
   if(ng>=g[next])continue;
   g[next]=ng;came[next]=k;
   if(!queued.has(next)){queue.push(next);queued.add(next)}
  }
 }
 if(start!==goal&&came[goal]<0)return null;
 const cells=[];let k=goal;
 while(k!==start){cells.push(point(k));k=came[k];if(k<0)return null}
 cells.reverse();
 const waypoints=[from,point(start),...cells,to],smooth=[];
 let i=0;
 while(i<waypoints.length-1){
  let j=waypoints.length-1;
  while(j>i+1&&!cityNavClearLine(waypoints[i],waypoints[j],obs))j--;
  if(!cityNavClearLine(waypoints[i],waypoints[j],obs))return null;
  smooth.push(waypoints[j]);i=j;
 }
 return smooth;
}
function cityNavMoveLeg(p,tol=1.2){
 const r=me(),d=dist2(p,r.pose.position);
 if(d<=tol)return true;
 if(walkSpent>=CITY_BUDGET_MS)return false;
 const before=r.pose.position.slice();
 M.moveTo([p[0],p[1]]);
 advB(Math.min(60000,Math.ceil(1000*(Math.min(d,55)/(r.speed||1.2)+1.2))));
 return dist2(p,r.pose.position)<=tol&&dist2(before,r.pose.position)>.01;
}
function cityNavGroundMove(goal,tol=1.2,done=null){
 const r=me(),reached=()=>dist2(goal,r.pose.position)<=tol||(done&&done());
 for(let attempts=0;attempts<5&&!reached()&&walkSpent<CITY_BUDGET_MS;attempts++){
  const path=cityNavPlan(r.pose.position,goal);
  if(!path)return false;
  let moved=false,blocked=false;
  for(const waypoint of path){
   if(reached()||walkSpent>=CITY_BUDGET_MS)break;
   const start=r.pose.position.slice(),d=dist2(start,waypoint),parts=Math.max(1,Math.ceil(d/30));
   for(let part=1;part<=parts&&!reached()&&walkSpent<CITY_BUDGET_MS;part++){
    const p=[start[0]+(waypoint[0]-start[0])*part/parts,
             start[1]+(waypoint[1]-start[1])*part/parts];
    // Waypoints already within tolerance require no new Matrix move.
    if(dist2(p,r.pose.position)<=.7)continue;
    const before=r.pose.position.slice();
    cityNavMoveLeg(p,.65);
    const travelled=dist2(before,r.pose.position);
    if(travelled>.3)moved=true;
    if(r.last_block||(travelled<.3&&dist2(p,r.pose.position)>1.2)){blocked=true;break}
   }
   if(blocked)break;
  }
  if(!moved)break;
 }
 if(!reached()){r.intent=null;r.v=[0,0,0]}
 return !!reached();
}
function cityNavDescend(){
 const r=me();
 if(r.pose.position[2]<2.5)return true;
 // Stay on the east tower, then descend over its thirty physical steps.
 const onStair=Math.abs(r.pose.position[0]-60)<2.5&&
   r.pose.position[1]>=34&&r.pose.position[1]<51;
 if(!onStair&&!cityNavMoveLeg([60,50.25],1.5))return false;
 if(!cityNavMoveLeg([60,33],1.4))return false;
 return r.pose.position[2]<2.5;
}
function cityNavStop(vk,e){
 const r=me(),obstacles=cityNavObstacles(),list=[];
 if(vk){
  const v=VENUES[vk],rad=Math.min(v.r*.65,9);
  list.push(v.at);
  for(const scale of [.4,.7,1])for(let i=0;i<16;i++){
   const a=i*Math.PI/8;
   list.push([v.at[0]+rad*scale*Math.cos(a),v.at[1]+rad*scale*Math.sin(a)]);
  }
 }else{
  const p=e.pose.position,h=e.shape?.halfExtents||[e.shape?.radius||0,e.shape?.radius||0];
  list.push([p[0],p[1]]);
  for(let i=0;i<16;i++){
   const a=i*Math.PI/8,c=Math.cos(a),s=Math.sin(a);
   list.push([p[0]+c*(Math.abs(c)*h[0]+1.6),p[1]+s*(Math.abs(s)*h[1]+1.6)]);
  }
 }
 let best=null,score=Infinity;
 for(const p of list){
  if(!cityNavFree(p,obstacles))continue;
  if(vk&&dist2(p,VENUES[vk].at)>VENUES[vk].r*.8)continue;
  if(!vk&&Math.max(0,M.sdf(e,[p[0],p[1],.85]))>2.5)continue;
  const cost=dist2(p,r.pose.position)+dist2(p,vk?VENUES[vk].at:e.pose.position)*.1;
  if(cost<score){score=cost;best=p}
 }
 return best;
}
function cityNavArrived(vk,e){
 const r=me(),p=r.pose.position;
 if(vk==='roof')return p[2]>11.5&&venueAt(p[0],p[1])==='roof';
 if(vk)return p[2]<2.5&&venueAt(p[0],p[1])===vk;
 return !!e&&Math.max(0,M.sdf(e,p))<=1.2;
}
function cityNavResult(vk,e){
 const r=me(),arrived=cityNavArrived(vk,e),target=vk?VENUES[vk].label:e.label;
 const entity=vk?ent()['venue.'+vk]:e;
 const distance_m=entity?+Math.max(0,M.sdf(entity,r.pose.position)).toFixed(2):null;
 const blocked_by=r.last_block||null;
 if(!arrived){r.intent=null;r.v=[0,0,0]}
 return {ok:arrived,arrived,partial:!arrived,target,distance_m,blocked_by,
  text:arrived?'You arrive at '+target+'.':
   'You are '+distance_m+' m from '+target+
    (walkSpent>=CITY_BUDGET_MS?'; the walk budget is exhausted. ':'; the route is unfinished. ')+
    'Walk there again to continue.'};
}
function climb(){
 const r=me();if(!r||r.chart!==CITY)return {ok:false,error:'NOT_IN_THE_CITY'};
 MW.stand?.('climb');walkSpent=0;
 if(!cityNavArrived('roof',null)){
  if(r.pose.position[2]<2.5&&!cityNavGroundMove([60,33],1.4)){
   arrive();return cityNavResult('roof',null);
  }
  for(const p of [[60,52],[60,60]]){
   for(let tries=0;tries<4&&dist2(p,r.pose.position)>1.2&&walkSpent<CITY_BUDGET_MS;tries++){
    const before=r.pose.position.slice();
    cityNavMoveLeg(p,1.2);
    if(dist2(before,r.pose.position)<.25)break;
   }
  }
 }
 const arrived=cityNavArrived('roof',null);
 if(arrived)CAT.discover('rooftop_view');
 arrive();
 const out=cityNavResult('roof',null);
 return {...out,on_roof:arrived,height_m:+(r.pose.position[2]-r.shape.height/2).toFixed(2),
  text:arrived?'Thirty steps, and the city opens under you: the plaza, the fountain, four towers, the sea beyond the south hall.':out.text};
}
function walkTo(target){
 const r=me();if(!r||r.chart!==CITY)return {ok:false,error:'NOT_IN_THE_CITY'};
 const vk=venueOf(target),e=vk?null:M.resolve(target);
 if(!vk&&!e)return {ok:false,error:'WHERE',venues:Object.values(VENUES).map(x=>x.label)};
 if(vk==='roof')return climb();
 MW.stand?.('walk');walkSpent=0;
 if(e&&e.pose.position[2]>8){
  const up=climb();
  if(!up.arrived)return up;
  walkSpent=0;
  const p=e.pose.position,stop=[p[0]-.9,p[1]-.9];
  cityNavMoveLeg(stop,1.2);
  arrive();return cityNavResult(vk,e);
 }
 if(!cityNavArrived(vk,e)){
  if(r.pose.position[2]>=2.5&&!cityNavDescend()){
   arrive();return cityNavResult(vk,e);
  }
  const stop=cityNavStop(vk,e);
  if(stop)cityNavGroundMove(stop,1.2,()=>cityNavArrived(vk,e));
 }
 arrive();return cityNavResult(vk,e);
}
function replaceRegion(source,from,to,replacement){
 const a=source.indexOf(from),b=a<0?-1:source.indexOf(to,a+from.length);
 if(a<0||b<0||source.indexOf(from,a+from.length)>=0||
    source.indexOf(to,b+to.length)>=0)throw Error('V20_CITY_NAVIGATION_ANCHOR_CHANGED');
 return source.slice(0,a)+replacement+'\n'+source.slice(b);
}
export function adaptCityNavigation(source){
 if(typeof source!=='string')throw TypeError('INVALID_CITY_SOURCE');
 let out=replaceRegion(source,'function climb(){','function firework(',climb.toString());
 const helpers=[cityNavObstacles,cityNavFree,cityNavClearLine,cityNavPlan,
  cityNavMoveLeg,cityNavGroundMove,cityNavDescend,cityNavStop,
  cityNavArrived,cityNavResult,walkTo].map(f=>f.toString()).join('\n\n');
 out=replaceRegion(out,'// Walking the city: bounded moveTo steps toward a venue or landmark.',
  '// Ticks and hooks.','// City route correction for the derived headless candidate.\n'+helpers+'\n');
 return out;
}
