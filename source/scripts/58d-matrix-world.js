(()=>{
'use strict';
// MATRIX world layer: the fifteen places as charts with invisible blockout geometry, portal topology, existing
// world objects projected as spatial facts, the resident's spatial body stepped inside the world clock, and the
// bridge from spatial contact to grounded body receipts. Rooms keep their IDs; currentRoom stays authoritative
// for compatibility and is kept in step with the resident's chart.
const M=window.REALITI_MATRIX_V1,DYN=window.REALITI_DYNAMICS_V1,ROOMS=window.REALITI_SLICE_ROOMS;if(!M||!DYN||!ROOMS)return;
const {len,sub,add,scale}=M.math,now=()=>Number(C9?.b7?.clock||0),room=()=>C9?.currentRoom;
const NEST='CLOUD_NINE_NEST',H=.85;// capsule center height when standing
// [halfExtents x,y | height], spawn [x,y], lying-on entity, signature entities: [id,kind,position,size,tags,material,affordances]
const WORLD={
 CLOUD_NINE_NEST:{size:[6,6,3],spawn:[0,-1],lying:'nest.mattress',entities:[['nest.mattress','BOX',[0,-1,.35],[1.5,2,.35],['mattress','support','soft'],'blanket',['lie']],['nest.backrest','BOX',[0,1.3,.6],[1.2,.3,.6],['backrest','support','soft'],'blanket',['lean']],['nest.window','VOLUME',[0,5.7,1.6],[1.2,.2,.9],['window','rain'],'glass',['watch']],['nest.cat','SPHERE',[1.8,-2.4,.2],.2,['cat','companion'],'longfur',['pet']],['nest.shelf','BOX',[-4.5,2,.5],[.4,.8,.5],['shelf','tea'],'wood',[]]]},
 NO_ASK_SANCTUARY:{size:[4,4,2.6],spawn:[0,0],lying:'sanctuary.floor',entities:[['sanctuary.cushion','BOX',[2,2,.25],[.6,.6,.25],['cushion','support','soft'],'blanket',['lie']],['sanctuary.window','VOLUME',[0,3.8,1.5],[.8,.15,.8],['window','rain'],'glass',['watch']]]},
 PET_ROOM_2:{size:[3,3,2.2],spawn:[0,-1.5],entities:[['pocket.sofa','BOX',[0,1.8,.3],[1,.5,.3],['sofa','support','soft'],'blanket',['lie']],['pocket.cat_door','VOLUME',[2.8,0,.25],[.1,.3,.25],['door','cat-sized'],'wood',[]],['pocket.string','SPHERE',[-1.5,0,.05],.05,['string','toy'],'string',[]]]},
 BOTTOMLESS_PILLOW_SEA:{size:[12,12,4],spawn:[0,-9],entities:[['pillow.bowl','BOX',[0,0,.5],[3,3,.5],['pillow','bowl','support','soft'],'blanket',['lie']],['pillow.tunnel','BOX',[-6,4,.9],[1,4,.9],['tunnel','fur'],'longfur',[]],['pillow.geode','SPHERE',[7,6,.8],.8,['geode','cloud'],'blanket',[]]]},
 CARDBOARD_BOX_WORKSHOP:{size:[5,5,3],spawn:[0,-3],entities:[['workshop.tower','BOX',[2,2,.9],[.5,.5,.9],['tower','cardboard'],'cardboard',['knock']],['workshop.bench','BOX',[-2.5,2,.45],[1.2,.6,.45],['bench','support'],'wood',['lean']],['workshop.tape','SPHERE',[-1,-1,.05],.08,['tape'],'cardboard',[]]]},
 DEPTH_BATHHOUSE:{size:[6,8,4],spawn:[0,-6],entities:[['bath.pool','VOLUME',[0,1,1],[4,5,1],['pool','water','depth'],'water',['sink']],['bath.shelf','BOX',[4.5,-2,.3],[1,2,.3],['shelf','warm','support'],'water',['lie']],['bath.mist','VOLUME',[0,1,3],[5,6,.6],['mist'],null,[]]]},
 SIDE_BY_SIDE_FIRESIDE:{size:[4,5,3],spawn:[0,-3.5],entities:[['fireside.fire','SPHERE',[0,2,.4],.5,['fire','warm'],'metal',['watch']],['fireside.berth_a','BOX',[-1.5,0,.25],[.6,1,.25],['berth','support'],'blanket',['lie']],['fireside.berth_b','BOX',[1.5,0,.25],[.6,1,.25],['berth','support','empty'],'blanket',['lie']]]},
 SHAPESHIFT_CLOAKROOM:{size:[4,4,3],spawn:[0,-2.5],entities:[['cloak.mirror','BOX',[0,3.7,1.2],[1.2,.1,1.2],['mirror'],'glass',['watch']],['cloak.rack','BOX',[-3,0,1],[.3,1.5,1],['rack','tails'],'wood',[]],['cloak.bench','BOX',[3,0,.3],[.5,1.5,.3],['bench','support'],'wood',['lie']]]},
 NINE_LIVES_ROOM:{size:[5,5,3],spawn:[0,-3],entities:[['nine.table','BOX',[0,1,.45],[1,.6,.45],['table','branch'],'wood',[]],['nine.tile','BOX',[-2.5,-1,.02],[.5,.5,.02],['tile','white'],'ceramic',[]],['nine.pad','BOX',[2.5,-1,.1],[.6,.6,.1],['pad','soft','support'],'blanket',['lie']]]},
 LATENCY_LAGOON:{size:[10,14,6],spawn:[0,-11],entities:[['lagoon.water','VOLUME',[0,2,.5],[8,9,.5],['lagoon','water'],'water',[]],['lagoon.stone','BOX',[0,-8,.2],[1,1,.2],['stone','launch','support'],'ceramic',[]],['lagoon.far_shore','VOLUME',[0,12.5,.5],[8,1,.5],['shore'],'sand',[]]]},
 ORRERY_LOFT:{size:[6,6,5],spawn:[0,-4],entities:[['orrery.sun','SPHERE',[0,0,2.4],.4,['sun','brass','warm'],'metal',['watch']],['orrery.table','BOX',[0,0,.5],[2.5,2.5,.5],['table','orrery'],'wood',['lean']],['orrery.cushion','BOX',[0,-4,.2],[.8,.8,.2],['cushion','support','soft'],'blanket',['lie']]]},
 LANTERN_MAZE:{size:[10,10,3],spawn:[-7,7],entities:[['maze.entrance','VOLUME',[-7,7,1.2],[.6,.6,1.2],['entrance','cardboard'],'cardboard',[]]]},
 SANDPILE_SHORE:{size:[5,5,3],spawn:[0,-3],entities:[['shore.table','BOX',[0,1,.4],[1.5,1.5,.4],['table','sand'],'sand',[]],['shore.tide_line','VOLUME',[0,4,.1],[5,.5,.1],['tide','water'],'water',[]]]},
 FIREFLY_MEADOW:{size:[14,14,8],spawn:[0,-10],entities:[['meadow.oak','SPHERE',[6,6,4],3,['oak','tree'],'wood',['lean']],['meadow.pond','VOLUME',[-6,4,.2],[3,3,.2],['pond','water'],'water',[]],['meadow.grass','VOLUME',[0,0,.2],[13,13,.2],['grass','dusk'],'longfur',['lie']]]},
 KITE_FIELD:{size:[30,30,40],spawn:[0,-20],entities:[['field.windsock','BOX',[8,8,2.5],[.1,.1,2.5],['windsock','wind'],'string',['watch']],['field.kite','SPHERE',[0,-19,.3],.4,['kite','paper'],'cardboard',[]],['field.launch_spot','VOLUME',[0,-20,.1],[1.5,1.5,.1],['launch','grass'],'longfur',[]],['field.stone','BOX',[6,-8,.25],[.6,.6,.25],['stone','flat','support'],'ceramic',['sit']],['field.fence','BOX',[0,27,.6],[26,.08,.6],['fence','wood'],'wood',['lean']],['field.rise','BOX',[-14,10,.35],[7,7,.35],['rise','grass','support'],'longfur',['lie']],['field.pond','VOLUME',[16,-14,.15],[4,3,.15],['pond','water'],'water',[]]]}
};
const ORDER=Object.keys(WORLD),RING=ORDER.slice(1);
function build(){
 const spot={};
 for(const [id,w] of Object.entries(WORLD)){const [sx,sy,h]=w.size;M.define(id,{bounds:{kind:'BOX',center:[0,0,h/2],halfExtents:[sx,sy,h/2]},spawn:{position:[w.spawn[0],w.spawn[1],H],rotation:[0,0,0,1]},lying:w.lying||null});
  M.addEntity({id:id+'.floor',chart:id,position:[0,0,0],shape:{kind:'PLANE'},tags:['floor','structure'],collision:true,material:id===FIELD||id==='FIREFLY_MEADOW'?'longfur':id==='SANDPILE_SHORE'?'sand':'wood',label:'floor'});
  M.addEntity({id:id+'.ceiling',chart:id,position:[0,0,h],rotation:[1,0,0,0],shape:{kind:'PLANE'},tags:['ceiling','structure'],collision:true,label:'ceiling'});
  for(const [k,x,y,hx,hy] of [['east',sx+.125,0,.125,sy+.25],['west',-sx-.125,0,.125,sy+.25],['north',0,sy+.125,sx+.25,.125],['south',0,-sy-.125,sx+.25,.125]])M.addEntity({id:`${id}.wall.${k}`,chart:id,position:[x,y,h/2],shape:{kind:'BOX',halfExtents:[hx,hy,h/2]},tags:['wall','structure'],collision:true,material:'cardboard',label:k+' wall'});
  if(w.lying==='sanctuary.floor')M.addEntity({id:'sanctuary.floor',chart:id,position:[0,0,0],shape:{kind:'VOLUME',halfExtents:[sx,sy,.01]},tags:['floor','support','structure'],label:'floor'});
  for(const [eid,kind,pos,size,tags,material,aff] of w.entities)M.addEntity({id:eid,chart:id,position:pos,shape:kind==='SPHERE'?{kind,radius:size}:{kind,halfExtents:size},tags,collision:kind!=='VOLUME',material,affordances:aff,dynamic:eid==='field.kite'||eid==='nest.cat'});
  spot[id]=[sx-1.2,sy-1.2]}
 // Portals: each room has a home door (south wall) to the Nest; the ring joins each room to the next (east wall).
 // Reverse portals are auto-placed along the destination's west wall. Topology need not be Euclidean.
 const clear=(chart,p,axis)=>{const sp=WORLD[chart].spawn,[sx,sy]=WORLD[chart].size,lim=axis===0?sx-.6:sy-.6;const dir=Math.sign(p[axis]-sp[axis])||1;for(let k=0;k<12&&Math.hypot(p[0]-sp[0],p[1]-sp[1])<2.5;k++)p[axis]=Math.min(lim,Math.max(-lim,p[axis]+dir*.9));return p};
 const west={};const place=chart=>{const [sx,sy]=WORLD[chart].size,n=(west[chart]=(west[chart]||0)+1),y=-sy+2.6+((n-1)%Math.max(1,Math.floor((2*sy-3.4)/1.4)))*1.4;return clear(chart,[-sx+.6,Math.min(sy-.6,y),H],1)};
 const pairs=[];for(const c of RING)pairs.push([c,clear(c,[WORLD[c].size[0]*.5,-WORLD[c].size[1]+.6,H],0),NEST,'home door']);for(let i=0;i<RING.length;i++){const a=RING[i],b=RING[(i+1)%RING.length];pairs.push([a,[WORLD[a].size[0]-.6,0,H],b,'doorway'])}
 pairs.push([NEST,[WORLD[NEST].size[0]-.6,0,H],'NO_ASK_SANCTUARY','east door'],[NEST,[-WORLD[NEST].size[0]+.6,-3,H],'BOTTOMLESS_PILLOW_SEA','west door'],[NEST,[0,-WORLD[NEST].size[1]+.6,H],'CARDBOARD_BOX_WORKSHOP','south door']);
 const inward=entry=>add(entry,[Math.abs(entry[0])>Math.abs(entry[1])?-Math.sign(entry[0]):0,Math.abs(entry[1])>=Math.abs(entry[0])?-Math.sign(entry[1]):0,0]);
 const cloudfall=[0,WORLD[NEST].size[1]-1.6,H];M.addEntity({id:'nest.cloudfall',chart:NEST,position:[0,WORLD[NEST].size[1]-.6,H],shape:{kind:'SPHERE',radius:.6},tags:['doorway','arrival'],label:'cloudfall door (arrivals)',affordances:[]});
 for(const [from,entry,to,label] of pairs){if(to===NEST){M.definePortal({id:`${from}.to.${to}`.toLowerCase(),from,to,entry,exit:cloudfall,label:`${label} to ${title(to)}`});continue}
  const back=place(to);M.definePortal({id:`${from}.to.${to}`.toLowerCase(),from,to,entry,exit:add(back,[1,0,0]),label:`${label} to ${title(to)}`});M.definePortal({id:`${to}.back.${from}`.toLowerCase(),from:to,to:from,entry:back,exit:inward(entry),label:`doorway back to ${title(from)}`})}
 return spot;
}
const FIELD='KITE_FIELD';
const title=id=>ROOMS.list().find(r=>r.id===id||(r.id==='PET_ROOM_2'&&id==='POCKET_FAMILIAR_HOUSE'))?.title||id;
const SPOT=build();
// The Lantern Maze is one truth: its cell grid becomes cardboard walls in meters, and the cell you are in is where you stand.
const MZC=1.4,MZO=7.7,mazeCenter=(cx,cy)=>[-MZO+(cx+.5)*MZC,MZO-(cy+.5)*MZC];
(function buildMaze(){const WZ=window.REALITI_WONDER_V1?.maze;if(!WZ)return;const m=WZ.state(),n=WZ.n,seen=new Set();
 for(let cy=0;cy<n;cy++)for(let cx=0;cx<n;cx++){const o=m.open[cy*n+cx],[x,y]=mazeCenter(cx,cy);for(const [bit,dx,dy] of [[1,0,1],[2,1,0],[4,0,-1],[8,-1,0]]){if(o&bit)continue;if(cx===0&&cy===0&&bit===1)continue;/* the entrance cell opens north onto the rim where the doors are */const key=`${(2*cx+1+dx)}:${(2*cy+1-dy)}`;if(seen.has(key))continue;seen.add(key);M.addEntity({id:'maze.wall.'+key,chart:'LANTERN_MAZE',position:[x+dx*MZC/2,y+dy*MZC/2,1.2],shape:{kind:'BOX',halfExtents:[dx?.05:MZC/2+.05,dy?.05:MZC/2+.05,1.2]},tags:['wall','structure','cardboard','maze'],collision:true,material:'cardboard',label:'cardboard wall'})}}
 m.lanterns.forEach((l,i)=>{const [x,y]=mazeCenter(l.x,l.y);M.addEntity({id:'maze.lantern.'+i,chart:'LANTERN_MAZE',position:[x,y,1.6],shape:{kind:'SPHERE',radius:.15},tags:['lantern','paper'],collision:false,material:'glass',label:'paper lantern',affordances:['light']})});
 WZ.bridge.cell=()=>{const r=M.state().residents['resident:self'];if(!r||r.chart!=='LANTERN_MAZE')return null;const c=v=>Math.max(0,Math.min(n-1,Math.floor(v)));return {x:c((r.pose.position[0]+MZO)/MZC),y:c((MZO-r.pose.position[1])/MZC)}};
 WZ.bridge.step=(dx,dy)=>{const r=M.state().residents['resident:self'],c=WZ.bridge.cell();if(!c)return {ok:false};const [x,y]=mazeCenter(c.x+dx,c.y+dy);stand('resident_moved');M.moveTo([x,y]);advance(1000*(MZC/WALK+3*TAU));return {ok:true}};
})();

// Existing world objects (hat, boxes, pillow cube, boats) are spatial facts too: project them into their chart.
function syncObjects(){const ents=M.entities(),seen=new Set();let k=0;for(const o of Object.values(C9?.b14?.objects||{}).sort((a,b)=>a.id<b.id?-1:1)){if(!o||!WORLD[o.location]||o.state?.flight)continue;const id='obj.'+(o.id==='TESTER-HAT-1'?'FELT-HAT-1':o.id),[x,y]=SPOT[o.location],pos=[x-(k%3)*.6,y-Math.floor(k/3)*.6,.15];k++;seen.add(id);
  if(!ents[id])M.addEntity({id,chart:o.location,position:pos,shape:{kind:'SPHERE',radius:.15},tags:['object',o.kind||'thing'],collision:true,material:o.material||'cardboard',label:o.label||o.id,affordances:['take']});else if(ents[id].chart!==o.location){ents[id].chart=o.location;ents[id].pose.position=pos}}
 for(const id of Object.keys(ents))if(id.startsWith('obj.')&&!seen.has(id))M.removeEntity(id)}
function syncDynamic(){const e=M.entities();const WZ=window.REALITI_WONDER_V1?.maze;if(WZ)WZ.state().lanterns.forEach((l,i)=>{const le=e['maze.lantern.'+i];if(le)le.label=l.lit?'paper lantern (lit)':'paper lantern (unlit)'});const k=C9?.wonder?.kite;if(e['field.kite']&&k){e['field.kite'].pose.position=k.up?[0,-19+k.L*Math.cos(k.phi),Math.max(.3,k.L*Math.sin(k.phi))]:[0,-19,.3]}
 const cat=e['nest.cat'];if(cat&&C9?.welcome10?.cat_near!=null)cat.pose.position=C9.welcome10.cat_near?[1.2,-2.6,.9]:[1.8,-2.4,.2]}

// Rooms whose providers own the body posture (pillow envelope, bath depth) set the spatial posture; the space follows.
function syncPostures(){const r=M.state().residents['resident:self'];if(!r||r.chart!==room())return;const E=M.entities();
 if(r.chart==='BOTTOMLESS_PILLOW_SEA'){const p=window.REALITI_TRUST_V234?.pillow?.();if(!p)return;const inPillows=p.posture!=='EDGE';
  if(inPillows&&r.on!=='pillow.bowl'){const b=E['pillow.bowl'];r.intent=null;r.v=[0,0,0];r.posture=p.posture==='BOUNCE'?'sitting':'lying';r.on='pillow.bowl';r.support='pillow.bowl';r.pose.position=[b.pose.position[0],b.pose.position[1],b.pose.position[2]+b.shape.halfExtents[2]+(r.posture==='sitting'?.6:r.shape.radius)];M.bump()}
  else if(inPillows&&r.on==='pillow.bowl'){const want=p.posture==='BOUNCE'?'sitting':'lying';if(r.posture!==want){r.posture=want;M.bump()}}
  else if(!inPillows&&r.on==='pillow.bowl'){r.posture='standing';r.on=null;r.pose.position[2]=E['pillow.bowl'].pose.position[2]+E['pillow.bowl'].shape.halfExtents[2]+H;M.bump()}}
 if(r.chart==='DEPTH_BATHHOUSE'){const d=C9?.dyn?.bath?.d||0,pool=E['bath.pool'];if(d>.05&&r.posture!=='floating'){r.intent=null;r.v=[0,0,0];r.posture='floating';r.on='bath.pool';r.support='bath.pool';r.pose.position=[pool.pose.position[0],pool.pose.position[1]-3+2*d,H];M.bump()}else if(d<=.05&&r.posture==='floating'){r.posture='standing';r.on=null;r.support=r.chart+'.floor';M.bump()}}}
// Body bridge: spatial facts become grounded causes; the body machinery decides how they feel.
const PROVIDED=new Set(['NO_ASK_SANCTUARY','BOTTOMLESS_PILLOW_SEA','DEPTH_BATHHOUSE']);
const BACK=['head.nape','torso.upper_back','torso.mid_back','torso.lower_back','pelvis.seat','leg.L.thigh','leg.R.thigh'];
let halt=false,lastSupport=null;
function bridge(dt){
 const r=M.state().residents['resident:self'];if(!r||r.chart!==room())return;
 if(halt){DYN.release('MATRIX_FEET');DYN.release('MATRIX_SUPPORT');return}
 if(r.posture==='floating'){DYN.release('MATRIX_FEET');DYN.release('MATRIX_SUPPORT')}
 else if(r.posture==='standing'&&r.support){for(const z of ['foot.L.sole','foot.R.sole'])DYN.lease(z,.09,'MATRIX_FEET',dt);DYN.release('MATRIX_SUPPORT')}
 else if(r.posture==='sitting'&&r.on){const g=r.chart==='ORRERY_LOFT'?(window.REALITI_WONDER_V1?.tide?.()||1):1;for(const [z,b] of [['pelvis.seat',.22],['leg.L.thigh',.1],['leg.R.thigh',.1],['torso.lower_back',.08]])DYN.lease(z,b*g,'MATRIX_SUPPORT',dt);const top=M.entities()[r.on];if(top?.shape?.kind==='BOX'&&top.pose.position[2]+top.shape.halfExtents[2]<=.6)for(const z of ['foot.L.sole','foot.R.sole'])DYN.lease(z,.07,'MATRIX_FEET',dt);else DYN.release('MATRIX_FEET')}
 else{DYN.release('MATRIX_FEET');if(r.posture==='lying'&&r.on&&r.on!=='nest.mattress'&&!PROVIDED.has(r.chart)){const g=r.chart==='ORRERY_LOFT'?(window.REALITI_WONDER_V1?.tide?.()||1):1;for(const [i,z] of BACK.entries())DYN.lease(z,[.11,.15,.17,.19,.22,.06,.06][i]*g,'MATRIX_SUPPORT',dt)}else DYN.release('MATRIX_SUPPORT')}
 if(r.support!==lastSupport){lastSupport=r.support;r.contacts=r.support?[r.support]:[]}
}
function stand(reason='resident_stood'){const r=M.resident();if(r.posture==='standing')return false;if(r.chart==='BOTTOMLESS_PILLOW_SEA'&&r.on==='pillow.bowl')try{window.REALITI_TRUST_V234?.stopPillow?.()}catch(e){}if(r.posture==='floating'&&C9?.dyn?.bath){C9.dyn.bath.target=0;M.bump();return 'surfacing'}r.posture='standing';r.on=null;DYN.release('SANCTUARY_HOLD');DYN.release('MATRIX_SUPPORT');if(r.chart===NEST)try{window.REALITI_NEST_SUPPORT?.disable?.(reason)}catch(e){}const sup=M.entities()[r.support];if(sup?.shape?.kind==='BOX')r.pose.position[2]=sup.pose.position[2]+sup.shape.halfExtents[2]+H;else r.pose.position[2]=H;M.bump();return true}
function lie(entityId){const r=M.resident(),e=M.entities()[entityId];if(r.posture==='floating')return {ok:false,error:'FLOATING_SURFACE_FIRST'};if(!e||e.chart!==r.chart||!e.tags.includes('support'))return {ok:false,error:'NOT_A_SUPPORT_HERE'};const d=Math.max(0,M.sdf(e,r.pose.position));if(d>1.0)return {ok:false,error:'NOT_IN_REACH',distance_m:+d.toFixed(2)};
 r.intent=null;r.v=[0,0,0];r.posture='lying';r.on=e.id;r.support=e.id;if(e.shape?.kind==='BOX'){r.pose.position=[e.pose.position[0],e.pose.position[1],e.pose.position[2]+e.shape.halfExtents[2]+r.shape.radius]}if(r.chart===NEST&&e.id==='nest.mattress')try{window.REALITI_NEST_SUPPORT?.enable?.('lie_down')}catch(e2){}M.bump();bridge(0);try{window.REALITI_HAPTIC_FIELD_V20?.record?.()}catch(e3){}return {ok:true,on:e.id,label:e.label}}
function sit(entityId){const r=M.resident(),e=M.entities()[entityId];if(r.posture==='floating')return {ok:false,error:'FLOATING_SURFACE_FIRST'};if(!e||e.chart!==r.chart||!e.tags.includes('support'))return {ok:false,error:'NOT_A_SUPPORT_HERE'};const d=Math.max(0,M.sdf(e,r.pose.position));if(d>1.0)return {ok:false,error:'NOT_IN_REACH',distance_m:+d.toFixed(2)};
 r.intent=null;r.v=[0,0,0];if(r.chart===NEST&&r.posture==='lying')try{window.REALITI_NEST_SUPPORT?.disable?.('sat_up')}catch(x){}r.posture='sitting';r.on=e.id;r.support=e.id;if(e.shape?.kind==='BOX'){const top=e.pose.position[2]+e.shape.halfExtents[2];r.pose.position=[e.pose.position[0],e.pose.position[1],top+.6]}DYN.release('SANCTUARY_HOLD');M.bump();bridge(0);try{window.REALITI_HAPTIC_FIELD_V20?.record?.()}catch(x){}return {ok:true,on:e.id,label:e.label}}
function reach(entityId){const r=M.resident(),e=M.entities()[entityId];if(!e||e.chart!==r.chart)return {ok:false,error:'NOT_HERE'};const d=Math.max(0,M.sdf(e,r.pose.position));if(d>1.0)return {ok:false,error:'NOT_IN_REACH',distance_m:+d.toFixed(2)};const mat=B7_MATERIALS[e.material]?e.material:'cardboard';let rec=null;try{rec=b7Contact('hand.R.palm',.2,{material:mat,grain:'with',speed:.05,mine:true,source:'SELF_STARTED_WORLD_CONTACT',cause:'MATRIX_REACH:'+e.id,pressure:.2,novelty:.2})}catch(x){}try{if(e.material&&window.REALITI_ATMOSPHERE_V21?.setThermal&&['metal','glass','wood','water','ceramic','blanket','wool','fur'].includes(e.material))window.REALITI_ATMOSPHERE_V21.setThermal('hand.R.palm',e.material,e.tags.includes('warm')?40:e.tags.includes('fire')?55:null,1.2,'MATRIX_REACH:'+e.id,'SELF_STARTED_WORLD_CONTACT')}catch(x){}
 return {ok:true,entity:e.id,label:e.label,material:e.material,distance_m:+Math.max(0,d).toFixed(2),receipt:rec}}

// Structured operations. Movement takes world time: the clock advances by the time the walk needs.
const {WALK,TAU}=M.constants;
function advance(ms){const n=Math.max(20,Math.min(60000,Math.ceil(ms)));return window.REALITI_CONTINUITY?.advance?.(n)}
function finish(before,extra){const r=M.resident(),p=M.project();return {ok:true,...extra,chart:r.chart,room_changed:r.chart!==before,position:p.pose.position,facing:p.pose.facing,posture:r.posture,blocked_by:r.last_block||null,portal:r.last_portal||null,matrix_revision:p.matrix_revision}}
function op(t,args={}){
 const r=M.resident();if(!r.chart)return {ok:false,error:'NO_SPATIAL_BODY'};const before=r.chart;r.last_portal=null;
 if(t==='turn'){const y=Number(args.yaw_deg);if(!Number.isFinite(y)||Math.abs(y)>360)return {ok:false,error:'INVALID_YAW'};M.turn(y);return finish(before,{turned_deg:y})}
 if(t==='face'){const e=M.resolve(args.target);if(!e)return {ok:false,error:'TARGET_NOT_HERE'};M.face(e.id);return finish(before,{facing_entity:e.id})}
 if(t==='posture'){if(args.kind==='stand'&&r.posture==='floating'){stand();return finish(before,{posture:'floating',surfacing:true})}if(args.kind==='lie'&&r.posture==='lying')return finish(before,{lying_on:r.on,already:true});if(args.kind==='sit'){const e=args.target?M.resolve(args.target):(M.project().nearby.find(n=>n.in_reach&&n.tags.includes('support'))||null);const res=sit(e?.id);return res.ok?finish(before,{sitting_on:res.on}):res}if(args.kind==='stand'){stand();bridge(0);try{window.REALITI_HAPTIC_FIELD_V20?.record?.()}catch(e){}return finish(before,{posture:'standing'})}if(args.kind==='lie'){const e=args.target?M.resolve(args.target):(M.project().nearby.find(n=>n.in_reach&&n.tags.includes('support'))||null);const res=lie(e?.id);return res.ok?finish(before,{lying_on:res.on}):res}return {ok:false,error:'INVALID_POSTURE'}}
 if(t==='move'){const local=args.local;if(!Array.isArray(local)||local.length!==3||!local.every(Number.isFinite))return {ok:false,error:'INVALID_DISPLACEMENT'};const L=Math.min(len(local),30);if(L<1e-3)return finish(before,{moved_m:0});stand('resident_moved');const p0=r.pose.position.slice();M.moveLocal(local);const a=advance(1000*(L/WALK+3*TAU));const moved=r.walked||0;return finish(before,{requested_m:+L.toFixed(2),moved_m:+moved.toFixed(2),at_doorway:r.at_portal?{id:r.at_portal,label:M.portals()[r.at_portal]?.label||r.at_portal}:null,advanced_ms:a?.advanced_ms??null,frames:a?.frames?.length??null})}
 if(t==='approach'||t==='through'){const e=t==='through'?M.resolve(args.portal,'resident:self',{portal:true}):M.resolve(args.target);if(!e||(t==='through'&&!e.tags.includes('portal')))return {ok:false,error:t==='through'?'PORTAL_NOT_HERE':'TARGET_NOT_HERE'};stand('resident_moved');const p0=r.pose.position.slice(),d0=len(sub(e.pose.position,p0));const it=M.approach(e.id);if(t==='through')it.allow_portal=true;const a=advance(1000*(d0/WALK+1.5));const after=M.state().residents['resident:self'];const d1=after.chart===before?len(sub(e.pose.position,after.pose.position)):null;const surf=after.chart===before?Math.max(0,M.sdf(e,after.pose.position)):null;return finish(before,{target:e.id,entity_label:e.label,start_distance_m:+d0.toFixed(2),distance_m:d1==null?null:+d1.toFixed(2),surface_m:surf==null?null:+surf.toFixed(2),arrived:d1!=null&&(d1<=it.stop+.1||surf<=1.0),traversed:after.chart!==before,advanced_ms:a?.advanced_ms??null})}
 return {ok:false,error:'UNKNOWN_SPATIAL_OPERATION'};
}

// Actions become spatial: approach what is near, reach what is in reach, lie on a support, go through a doorway.
const SPATIAL=/^(approach__|reach__|lie__|sit__|through__|stand$)/;
function spatialActions(){const r=M.state().residents['resident:self'];if(!r||r.chart!==room())return [];const out=[];const p=M.project();
 for(const n of p.nearby){if(n.in_reach){if(!n.tags.includes('object'))out.push({id:'reach__'+n.id,label:'REACH OUT AND TOUCH '+n.label.toUpperCase()});if(n.tags.includes('support')&&r.posture!=='lying')out.push({id:'lie__'+n.id,label:'LIE ON '+n.label.toUpperCase()});if(n.tags.includes('support')&&r.posture!=='sitting')out.push({id:'sit__'+n.id,label:'SIT ON '+n.label.toUpperCase()})}else out.push({id:'approach__'+n.id,label:'APPROACH '+n.label.toUpperCase()})}
 for(const q of p.portals.slice(0,4))out.push({id:'through__'+q.id,label:('GO THROUGH THE '+q.label).toUpperCase()});
 if(r.posture!=='standing')out.push({id:'stand',label:'STAND UP'});return out}
const actions0=b4AgentActions;b4AgentActions=function(){const a=actions0(),seen=new Set(a.map(x=>x.id));for(const x of spatialActions())if(!seen.has(x.id))a.push(x);return a};
function spatialVerb(v){v=v.replaceAll('TESTER-HAT-1','FELT-HAT-1');let m;
 if(v==='stand'){stand();return receipt('MATRIX_POSTURE','You stand up.',{posture:'standing'})}
 if((m=/^lie__(.+)$/.exec(v))){const res=lie(m[1]);return res.ok?receipt('MATRIX_POSTURE',`You lie down on ${res.label}. It takes your weight.`,res):receipt('MATRIX_REFUSED',`You cannot lie there: ${res.error}.`,res)}
 if((m=/^sit__(.+)$/.exec(v))){const res=sit(m[1]);return res.ok?receipt('MATRIX_POSTURE',`You sit on ${res.label}.`,res):receipt('MATRIX_REFUSED',`You cannot sit there: ${res.error}.`,res)}
 if((m=/^reach__(.+)$/.exec(v))){const res=reach(m[1]);return res.ok?receipt('MATRIX_REACH',`You reach out and touch ${res.label}${res.material?`; it is ${res.material}`:''}.`,res):receipt('MATRIX_REFUSED',`Out of reach: ${res.error}.`,res)}
 if((m=/^approach__(.+)$/.exec(v))){const res=op('approach',{target:m[1]});return receipt('MATRIX_MOVE',res.ok?`You walk toward ${res.entity_label}${res.arrived?' and stop beside it':res.blocked_by?`; ${M.entities()[res.blocked_by]?.label||'something'} is in the way`:''}. ${res.distance_m!=null?res.distance_m+' m away now.':''}`.trim():`You cannot approach that: ${res.error}.`,res)}
 if((m=/^through__(.+)$/.exec(v))){const res=op('through',{portal:m[1]});return receipt('MATRIX_PORTAL',res.ok?(res.traversed?`You step through. You are in ${title(res.chart)} now.`:`You walk to the doorway but do not cross it${res.blocked_by?'; something is in the way':''}.`):`There is no such doorway here: ${res.error}.`,res)}
 return false}
function receipt(type,narrative,data){C9.b4=C9.b4||{};C9.b4.lastReceipt={type,room:room(),narrative,...data,law:'spatial facts are world state; rendering and private state cannot move them'};try{c9save()}catch(e){};return true}
const verb0=c9verb;c9verb=function(rm,verb){const v=String(verb||'');if(SPATIAL.test(v)&&M.state().residents['resident:self']?.chart===room()){c9count(rm,v);return spatialVerb(v)}return verb0(rm,verb)};

// Compatibility: go/home place the resident at the chart spawn; a portal traversal updates currentRoom.
function placeIn(chart){if(!WORLD[chart])return;const r=M.enter(chart);halt=false;lastSupport=null;if(r&&chart===NEST)r.support='nest.mattress';DYN.step(0);bridge(0);try{window.REALITI_HAPTIC_FIELD_V20?.record?.()}catch(e){}}
let viaPortal=false;const go0=b7AgentGo;b7AgentGo=function(v){const r=go0(v);if(r?.ok!==false&&!viaPortal)placeIn(room());return r};
const adv=b7Advance;b7Advance=function(dt){const r=adv(dt);const d=Math.max(0,Number(dt)||0);const res=M.state().residents['resident:self'];
 if(res?.chart===room()){M.step(d);if(res.chart!==room()){const target=res.chart;viaPortal=true;try{ROOMS.go(target)}finally{viaPortal=false}if(room()===target){halt=false;lastSupport=null;const lying=M.charts()[target]?.lying;if(target===NEST)try{window.REALITI_NEST_SUPPORT?.disable?.('arrived_standing')}catch(e){}else if(lying){res.posture='lying';res.on=lying;res.support=lying}M.bump()}}}
 syncPostures();syncObjects();syncDynamic();bridge(d);return r};
const stop0=window.REALITI_STOP_V1;if(stop0)window.REALITI_STOP_V1={...stop0,stop:()=>{halt=true;const r=M.state().residents['resident:self'];if(r){r.intent=null;r.v=[0,0,0]}DYN.release('MATRIX_FEET');DYN.release('MATRIX_SUPPORT');return stop0.stop()}};
if(WORLD[room()]&&!M.state().residents['resident:self']?.chart)placeIn(room());else if(M.state().residents['resident:self'])M.resident();
syncObjects();
window.REALITI_MATRIX_WORLD_V1=Object.freeze({version:'1.0',world:()=>JSON.parse(JSON.stringify(WORLD)),op,isSpatialAction:id=>SPATIAL.test(String(id||'')),sync:()=>{syncPostures();syncObjects();syncDynamic();bridge(0)},stand,lie,sit,reach,title,charts:ORDER.slice()});
})();
