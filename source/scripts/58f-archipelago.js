(()=>{
'use strict';
// Chapter 2, pass 1: the Archipelago. One 2 km chart with analytic terrain (five islands over a sea), real
// distance, a rowing boat with current and wind, weather that moves, day and night from the sky, and a
// fog-of-war map. Every world change made here is a stamped ledger record (REALITI_LEDGER_V1), exportable and
// importable like traces, so other residents can add to the same world now and a shared store can sync it later.
const M=window.REALITI_MATRIX_V1,MW=window.REALITI_MATRIX_WORLD_V1,DYN=window.REALITI_DYNAMICS_V1,WZ=window.REALITI_WONDER_V1,CAT=window.REALITI_CATNIP_V1;if(!M||!MW||!DYN||!WZ||!CAT)return;
const ISLE='ARCHIPELAGO',SEA=0,now=()=>Number(C9?.b7?.clock||0),room=()=>C9?.currentRoom,clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,Number(x)||0)),cp=x=>JSON.parse(JSON.stringify(x)),TAU=2*Math.PI;
const {len,sub,add,scale}=M.math,me=()=>M.state().residents['resident:self'],observer=()=>String(C9?.verticalContinuity?.observer||'local');

// Ledger: the one place Chapter 2 writes world changes. Records are stamped with the resident's observer id.
function ledger(){C9.ledger=C9.ledger||{v:1,records:[]};return C9.ledger.records}
function record(kind,data){const e={by:observer(),t:+now().toFixed(3),kind,...data};ledger().push(e);while(ledger().length>512)ledger().shift();try{c9save()}catch(x){}return e}
function importLedger(payload){const list=Array.isArray(payload)?payload:payload?.records;if(!Array.isArray(list))return {ok:false,error:'INVALID_LEDGER'};const have=new Set(ledger().map(e=>`${e.by}|${e.t}|${e.kind}`));let n=0;for(const e of list){if(!e||typeof e!=='object'||JSON.stringify(e).length>4096)continue;const k=`${e.by}|${e.t}|${e.kind}`;if(have.has(k))continue;have.add(k);ledger().push(cp(e));n++}try{c9save()}catch(x){}return {ok:true,imported:n}}

// Terrain: value noise plus five Gaussian islands; z = h(x, y), sea at 0. Deterministic and analytic: no grid is stored.
const hashU=(x,y)=>{let h=(Math.imul(x|0,374761393)+Math.imul(y|0,668265263)+2026)|0;h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296};
const smooth=t=>t*t*(3-2*t);
function noise(x,y){const x0=Math.floor(x),y0=Math.floor(y),fx=smooth(x-x0),fy=smooth(y-y0);const a=hashU(x0,y0),b=hashU(x0+1,y0),c=hashU(x0,y0+1),d=hashU(x0+1,y0+1);return (a+(b-a)*fx)*(1-fy)+(c+(d-c)*fx)*fy}
const ISLANDS=[{id:'harbor',name:'Harbor Isle',c:[0,0],R:220,A:28},{id:'lantern',name:'Lantern Point',c:[620,380],R:160,A:46},{id:'hollow',name:'Hollow Isle',c:[-540,420],R:190,A:38},{id:'stones',name:'Three Stones',c:[380,-560],R:140,A:18},{id:'grove',name:'Grove Isle',c:[-420,-520],R:260,A:24}];
function h(x,y){let z=-6+4*(noise(x/300+7,y/300+3)-.5);for(const i of ISLANDS){const d=Math.hypot(x-i.c[0],y-i.c[1]);z+=i.A*Math.exp(-((d/i.R)**2))*(1+.25*(noise(x/90,y/90)-.5))}return z}
const islandAt=(x,y)=>{let best=null;for(const i of ISLANDS){const d=Math.hypot(x-i.c[0],y-i.c[1])/i.R;if(d<1.8&&(!best||d<best.d))best={i,d}}return best?.i||null};
const slopeAt=(x,y)=>Math.hypot(h(x+1,y)-h(x-1,y),h(x,y+1)-h(x,y-1))/2;

// Sky and weather. The sun follows the Star Deck's sidereal angle (one day per 600 s of world time); wind shares the
// Kite Field's Ornstein–Uhlenbeck speed and turns slowly; a rain band crosses the sea.
const sunAlt=()=>70*Math.sin(TAU*(now()/600)+.6);
const isNight=()=>sunAlt()<0;
function wind(){const v=C9?.wonder?.kite?.v??5.5,th=.9+.3*Math.sin(now()/190)+.15*Math.sin(now()/47);return {speed:v,dir:[Math.cos(th),Math.sin(th)],deg:Math.round(((th*180/Math.PI)%360+360)%360)}}
function rain(x,y){const t=now(),u=(x*.6+y*.8),phase=((u-t*3)%2400+2400)%2400;return Math.exp(-(((phase-1200)/260)**2))*clamp(.4+.6*(noise(t/400,0)))}
const current=(x,y)=>[-.35*Math.sin(y/400)+.1,.35*Math.cos(x/400)];

// Chart, landmarks, boat. The harbour sits on the computed shoreline south of Harbor Isle, wherever the noise put it.
const SIZE=1000,SHORE=(()=>{let y=-150;while(h(0,y)>-.6&&y>-900)y-=2;return y})(),SPAWN=[0,SHORE+22];
M.define(ISLE,{bounds:{kind:'BOX',center:[0,0,60],halfExtents:[SIZE,SIZE,60]},spawn:{position:[SPAWN[0],SPAWN[1],h(...SPAWN)+.85],rotation:[0,0,0,1]},view:()=>isNight()?60:400,stride:300,tags:['outdoors','archipelago']});
M.addEntity({id:'isle.ground',chart:ISLE,position:[0,0,0],shape:{kind:'HEIGHTFIELD',h,sea:SEA,slope:.6},tags:['floor','terrain','structure'],collision:true,material:'sand',label:'ground'});
for(const [k,x,y,hx,hy] of [['east',SIZE+.5,0,.5,SIZE+1],['west',-SIZE-.5,0,.5,SIZE+1],['north',0,SIZE+.5,SIZE+1,.5],['south',0,-SIZE-.5,SIZE+1,.5]])M.addEntity({id:`isle.edge.${k}`,chart:ISLE,position:[x,y,30],shape:{kind:'BOX',halfExtents:[hx,hy,60]},tags:['edge','structure'],collision:true,label:'the edge of the chart'});
const onGround=(x,y,dz=0)=>[x,y,h(x,y)+dz];
const LAND=[
 ['harbor.dock','BOX',[0,SHORE+2],[2,8,.15],['dock','wood','support','landmark'],'wood',['sit']],
 ['harbor.boathouse','BOX',[14,SHORE+14],[3,3,2.2],['boathouse','landmark','shelter'],'wood',[]],
 ['harbor.cairn','BOX',[0,0],[.6,.6,1.2],['cairn','stone','landmark','summit'],'ceramic',['reach']],
 ['lantern.lighthouse','CAPSULE',[620,380],{radius:3,height:18},['lighthouse','landmark','light'],'ceramic',['reach']],
 ['lantern.door','VOLUME',[620,376],[1,.5,1.2],['door','lighthouse'],'wood',[]],
 ['hollow.cave_mouth','VOLUME',[-540,560],[4,3,3],['cave','mouth','echo','landmark'],null,['shout']],
 ['stones.north','BOX',[380,-480],[.8,.8,1.5],['stone','standing','landmark'],'ceramic',['reach']],
 ['stones.east','BOX',[450,-600],[.8,.8,1.5],['stone','standing','landmark'],'ceramic',['reach']],
 ['stones.west','BOX',[310,-600],[.8,.8,1.5],['stone','standing','landmark'],'ceramic',['reach']],
 ['grove.clearing','VOLUME',[-420,-520],[30,30,.5],['clearing','grove','landmark','plantable'],'longfur',['plant']],
 ['grove.old_oak','SPHERE',[-380,-470],5,['oak','tree','landmark'],'wood',['lean']]
];
for(const [id,kind,[x,y],size,tags,material,aff] of LAND){const base=id==='harbor.dock'?h(0,SHORE+10):h(x,y),pos=kind==='SPHERE'?[x,y,base+size]:kind==='CAPSULE'?[x,y,base+size.height/2]:[x,y,base+(size[2]||0)];M.addEntity({id,chart:ISLE,position:pos,shape:kind==='SPHERE'?{kind,radius:size}:kind==='CAPSULE'?{kind,...size}:{kind,halfExtents:size},tags,collision:kind!=='VOLUME',material,affordances:aff,label:({'lantern.door':'lighthouse door','stones.north':'north stone','stones.east':'east stone','stones.west':'west stone','grove.clearing':'grove clearing','hollow.cave_mouth':'cave mouth'})[id]||id.split('.').pop().replaceAll('_',' ')})}
M.addEntity({id:'harbor.boat',chart:ISLE,position:[1.2,SHORE-7,SEA+.3],shape:{kind:'BOX',halfExtents:[.7,1.4,.3]},tags:['boat','rowing','support','landmark'],collision:false,material:'wood',label:'rowing boat',affordances:['board'],dynamic:true});
// Doors: the Kite Field's north fence has a gate to the harbor; the boathouse is the home door.
M.definePortal({id:'kite_field.to.archipelago',from:'KITE_FIELD',to:ISLE,entry:[-6,27.4,.85],exit:onGround(2,SHORE+18,.85),label:'gate in the fence to the Archipelago'});
M.definePortal({id:'archipelago.to.kite_field',from:ISLE,to:'KITE_FIELD',entry:onGround(20,SHORE+18,.85),exit:[-6,25.5,.85],label:'boathouse gate back to the Kite Field'});
M.definePortal({id:'archipelago.to.cloud_nine_nest',from:ISLE,to:'CLOUD_NINE_NEST',entry:onGround(14,SHORE+24,.85),exit:[0,4.4,.85],label:'boathouse door home to Cloud Nine Nest'});

// State: boat, fog map, weather exposure.
function S(){const w=(C9.chapter2=C9.chapter2||{v:1});w.isle=w.isle||{boat:{x:1.2,y:SHORE-7,aboard:false,target:null,log:0},seen:[],wet:0,nights:0,lastNight:false};return w.isle}
const CELL=50,GRID=2*SIZE/CELL;
function markSeen(){const r=me();if(!r||r.chart!==ISLE)return;const s=S(),R=isNight()?1:3,cx=Math.floor((r.pose.position[0]+SIZE)/CELL),cy=Math.floor((SIZE-r.pose.position[1])/CELL);for(let dy=-R;dy<=R;dy++)for(let dx=-R;dx<=R;dx++){const X=cx+dx,Y=cy+dy;if(X<0||Y<0||X>=GRID||Y>=GRID)continue;const i=Y*GRID+X;if(!s.seen.includes(i))s.seen.push(i)}}
function mapText(){const s=S(),r=me(),seen=new Set(s.seen),rows=[];const my=r&&r.chart===ISLE?[Math.floor((r.pose.position[0]+SIZE)/CELL),Math.floor((SIZE-r.pose.position[1])/CELL)]:null;
 for(let Y=0;Y<GRID;Y++){let row='';for(let X=0;X<GRID;X++){if(my&&my[0]===X&&my[1]===Y){row+='@';continue}if(!seen.has(Y*GRID+X)){row+=' ';continue}const x=-SIZE+(X+.5)*CELL,y=SIZE-(Y+.5)*CELL,z=h(x,y);const lm=LAND.find(([,,[lx,ly]])=>Math.abs(lx-x)<CELL/2&&Math.abs(ly-y)<CELL/2);row+=lm?(lm[0].startsWith('lantern.light')?'L':lm[0].startsWith('hollow')?'C':lm[0].startsWith('stones')?'s':lm[0].startsWith('grove')?'g':'d'):z<SEA?'~':z<4?'.':z<18?':':'^'}rows.push(row.replace(/\s+$/,''))}
 while(rows.length&&!rows[rows.length-1])rows.pop();return rows}

// Boat. Rowing at 1.5 m/s toward a target plus current plus 3% of the wind; stops at the shore.
function boat(){return S().boat}
function stepBoat(dt){const b=boat(),r=me();if(!r||r.chart!==ISLE)return;const E=M.entities()['harbor.boat'];
 if(b.target){const to=sub(b.target,[b.x,b.y,0]);to[2]=0;const d=len(to);const w=wind(),c=current(b.x,b.y),v=add(add(scale(M.math.norm(to),Math.min(1.5,d/2)),[c[0],c[1],0]),[w.dir[0]*w.speed*.03,w.dir[1]*w.speed*.03,0]);const nx=b.x+v[0]*dt,ny=b.y+v[1]*dt;
  if(h(nx,ny)>SEA-.4){b.target=null;b.ashore=true}else{b.x=nx;b.y=ny;b.log+=len(v)*dt;if(d<3)b.target=null}}
 if(E){E.pose.position=[b.x,b.y,Math.max(h(b.x,b.y),SEA)+.3]}
 if(b.aboard){r.pose.position=[b.x,b.y,SEA+.9];r.v=[0,0,0];r.intent=null}}
function board(){const r=me(),E=M.entities()['harbor.boat'];if(!r||r.chart!==ISLE)return {ok:false,error:'NO_BOAT_HERE'};let d=Math.hypot(E.pose.position[0]-r.pose.position[0],E.pose.position[1]-r.pose.position[1]);if(d>2.5&&d<=40){MW.op('approach',{target:'harbor.boat'});d=Math.hypot(E.pose.position[0]-r.pose.position[0],E.pose.position[1]-r.pose.position[1])}if(d>2.5)return {ok:false,error:'BOAT_OUT_OF_REACH',distance_m:+d.toFixed(1)};const b=boat();b.aboard=true;b.ashore=false;r.afloat=true;r.posture='sitting';r.on='harbor.boat';r.support='harbor.boat';r.intent=null;r.v=[0,0,0];M.bump();MW.sync();return {ok:true}}
function land(){const r=me(),b=boat();if(!b.aboard)return {ok:false,error:'NOT_ABOARD'};const z=h(b.x,b.y);let [x,y]=[b.x,b.y];if(z<SEA-.3){let best=null;for(let k=0;k<36;k++){const a=k*TAU/36;for(let d=2;d<=12;d+=2){const px=b.x+Math.cos(a)*d,py=b.y+Math.sin(a)*d;if(h(px,py)>=SEA-.3&&(!best||d<best.d))best={d,px,py}}}if(!best)return {ok:false,error:'NO_SHORE_WITHIN_12M'};x=best.px;y=best.py}b.aboard=false;r.afloat=false;r.posture='standing';r.on=null;r.pose.position=[x,y,h(x,y)+.85];r.support='isle.ground';M.bump();MW.sync();return {ok:true,landed_on:islandAt(x,y)?.name||'a shoal'}}
const islandByName=q=>{q=String(q||'').toLowerCase().replace(/^(the|to)\s+/,'').trim();return ISLANDS.find(i=>i.id===q||i.name.toLowerCase()===q||i.name.toLowerCase().startsWith(q)||i.id.startsWith(q))||null};
function row(target){const b=boat();if(!b.aboard)return {ok:false,error:'NOT_ABOARD'};const isl=typeof target==='string'?islandByName(target):null,e=!isl&&typeof target==='string'?M.resolve(target):null;let goal=isl?[isl.c[0],isl.c[1],0]:e?e.pose.position.slice():Array.isArray(target)?target:null;if(!goal)return {ok:false,error:'ROW_WHERE',islands:ISLANDS.map(i=>i.name)};
 if(h(goal[0],goal[1])>SEA-.4){const dir=M.math.norm([goal[0]-b.x,goal[1]-b.y,0]);let d=len([goal[0]-b.x,goal[1]-b.y,0]);for(;d>2;d-=4){const px=goal[0]-dir[0]*(len([goal[0]-b.x,goal[1]-b.y,0])-d),py=goal[1]-dir[1]*(len([goal[0]-b.x,goal[1]-b.y,0])-d);if(h(px,py)<SEA-.6){goal=[px,py,0];break}}}
 b.target=[goal[0],goal[1],0];b.ashore=false;const d0=Math.hypot(goal[0]-b.x,goal[1]-b.y),start=[b.x,b.y];let steps=0;while(b.target&&steps++<12)window.REALITI_CONTINUITY?.advance?.(Math.min(60000,Math.ceil(1000*Math.max(5,Math.hypot(b.target[0]-b.x,b.target[1]-b.y)/1.4))));
 const d1=Math.hypot(goal[0]-b.x,goal[1]-b.y);record('ROW',{from:start.map(x=>+x.toFixed(1)),to:[+b.x.toFixed(1),+b.y.toFixed(1)]});return {ok:true,rowed_m:+Math.hypot(b.x-start[0],b.y-start[1]).toFixed(1),remaining_m:+d1.toFixed(1),ashore:!!b.ashore,at:islandAt(b.x,b.y)?.name||'open water'}}

// Walking far: repeated bounded moves toward a landmark, up to ten minutes of world time.
function walkTo(target){const r=me();if(!r||r.chart!==ISLE)return {ok:false,error:'NOT_ON_THE_ISLANDS'};if(boat().aboard)return {ok:false,error:'ABOARD_THE_BOAT'};const isl=typeof target==='string'?islandByName(target):null;const e=isl?M.entities()[LAND.find(l=>l[0].startsWith(isl.id+'.'))?.[0]]:M.resolve(target);if(!e)return {ok:false,error:'LANDMARK_NOT_FOUND'};MW.stand('walk');const start=r.pose.position.slice();let iters=0,last=Infinity,blocked=null;
 while(iters++<10){const d=Math.hypot(e.pose.position[0]-r.pose.position[0],e.pose.position[1]-r.pose.position[1]);if(d<=Math.max(3,(e.shape?.radius||Math.max(...(e.shape?.halfExtents||[0])))+2))break;if(d>last-1){blocked=r.last_block;break}last=d;M.moveTo(e.pose.position);window.REALITI_CONTINUITY?.advance?.(Math.min(60000,Math.ceil(1000*(Math.min(d,72)/1.2+1))))}
 const walked=Math.hypot(r.pose.position[0]-start[0],r.pose.position[1]-start[1]),dEnd=Math.hypot(e.pose.position[0]-r.pose.position[0],e.pose.position[1]-r.pose.position[1]);const dir=M.math.norm([e.pose.position[0]-r.pose.position[0],e.pose.position[1]-r.pose.position[1],0]),ahead=h(r.pose.position[0]+dir[0]*4,r.pose.position[1]+dir[1]*4);const why=blocked?(ahead<SEA-.3?'the sea':ahead>h(r.pose.position[0],r.pose.position[1])+.45?'a cliff':blocked.split('.').pop()):null;return {ok:true,target:e.id,entity_label:e.label,walked_m:+walked.toFixed(1),distance_m:+dEnd.toFixed(1),why,arrived:dEnd<=Math.max(3,(e.shape?.radius||Math.max(...(e.shape?.halfExtents||[0])))+2),blocked_by:blocked,on:islandAt(r.pose.position[0],r.pose.position[1])?.name||'the shore'}}

// Weather on the body: rain cools the head and upper back through the thermal law while you are outdoors.
function exposure(dt){const r=me();if(!r||r.chart!==ISLE)return;const rho=rain(r.pose.position[0],r.pose.position[1]),s=S();s.rain=rho;if(rho>.25){s.wet=Math.min(1,s.wet+dt*rho*.01);for(const z of ['head.crown','head.nape','torso.upper_back'])try{window.REALITI_ATMOSPHERE_V21?.setThermal?.(z,'water',14,dt+.3,'ISLAND_RAIN','WORLD_GROUNDED')}catch(e){}}else s.wet=Math.max(0,s.wet-dt*.02);const n=isNight();if(n&&!s.lastNight)s.nights++;s.lastNight=n}

function step(dt){if(room()!==ISLE)return;stepBoat(dt);exposure(dt);markSeen()}
const adv=b7Advance;b7Advance=function(dt){const r=adv(dt);step(Math.max(0,Number(dt)||0));return r};
const go0=b7AgentGo;b7AgentGo=function(v){const r=go0(v);if(room()===ISLE){const b=boat();if(b.aboard){b.aboard=false;const m=me();if(m)m.afloat=false}markSeen()}return r};

function words(){if(room()!==ISLE)return [];const r=me(),s=S(),w=wind(),isle=islandAt(r.pose.position[0],r.pose.position[1]),z=h(r.pose.position[0],r.pose.position[1]),rho=s.rain||0,alt=sunAlt();
 return [`${isle?isle.name:'Open water'}, ${z>SEA?`${z.toFixed(0)} m above the sea`:'at sea'}. ${alt<0?'Night':alt<15?'Low sun':'Day'} (sun ${alt.toFixed(0)}°). Wind ${w.speed.toFixed(1)} m/s from ${w.deg}°${rho>.25?`, rain ${Math.round(rho*100)}%`:''}${s.wet>.2?`, you are ${Math.round(s.wet*100)}% soaked`:''}.${boat().aboard?` You are aboard the boat; the current sets ${(len([...current(boat().x,boat().y),0])).toFixed(2)} m/s.`:''}`]}
function state(){const r=me(),b=boat();return {chart:ISLE,islands:ISLANDS.map(i=>({id:i.id,name:i.name,center:i.c,radius:i.R})),here:r?.chart===ISLE?{island:islandAt(r.pose.position[0],r.pose.position[1])?.name||null,height_m:+h(r.pose.position[0],r.pose.position[1]).toFixed(2),slope:+slopeAt(r.pose.position[0],r.pose.position[1]).toFixed(3)}:null,sun_alt_deg:+sunAlt().toFixed(1),night:isNight(),wind:wind(),rain:+(S().rain||0).toFixed(3),wet:+S().wet.toFixed(3),boat:{x:+b.x.toFixed(1),y:+b.y.toFixed(1),aboard:b.aboard,rowed_m:+b.log.toFixed(1)},seen_cells:S().seen.length,of:GRID*GRID,nights:S().nights}}

// Actions.
const SCENE={intro:'Salt air and a wooden dock. Five islands lie over two kilometres of sea; a rowing boat knocks against the pilings. A day here lasts ten minutes. The map fills in only where you have been.',verbs:[['island_map','UNFOLD THE MAP'],['read_weather','READ THE WEATHER'],['board_boat','BOARD THE BOAT'],['land_boat','LAND THE BOAT']]};
C9SCENES[ISLE]=SCENE;
const actions0=b4AgentActions;b4AgentActions=function(){const a=actions0();if(room()!==ISLE)return a;const r=me(),b=boat(),E=M.entities()['harbor.boat'],near=E&&r&&Math.hypot(E.pose.position[0]-r.pose.position[0],E.pose.position[1]-r.pose.position[1])<=2.5;const out=a.filter(x=>!['board_boat','land_boat'].includes(x.id));if(near&&!b.aboard)out.push({id:'board_boat',label:'BOARD THE BOAT'});if(b.aboard)out.push({id:'land_boat',label:'LAND THE BOAT'});for(const i of ISLANDS)if(!b.aboard)out.push({id:'walk_to__'+i.id,label:'WALK TOWARD '+i.name.toUpperCase()});else out.push({id:'row_to__'+i.id,label:'ROW TOWARD '+i.name.toUpperCase()});return out};
function receipt(type,narrative,data){C9.b4=C9.b4||{};C9.b4.lastReceipt={type,room:room(),narrative,...data,law:'terrain, sea, wind and sky are world facts; narration reports them'};try{c9save()}catch(e){};return true}
const isleTarget=id=>{const i=ISLANDS.find(x=>x.id===id);return i?[i.c[0],i.c[1],0]:null};
const verb0=c9verb;c9verb=function(r,verb){const v=String(verb||'');if(r!==ISLE)return verb0(r,verb);let m;
 if(v==='island_map'){c9count(r,v);const rows=mapText();return receipt('ISLAND_MAP',rows.join('\n')+`\n~ sea · . shore · : land · ^ high · d dock · L lighthouse · C cave · s stones · g grove · ${S().seen.length} of ${GRID*GRID} cells seen`,{map:rows,seen:S().seen.length})}
 if(v==='read_weather'){c9count(r,v);return receipt('ISLAND_WEATHER',words()[0],state())}
 if(v==='board_boat'){c9count(r,v);const res=board();return receipt('ISLAND_BOAT',res.ok?'You step down into the boat; it rocks, then settles under you. Row toward an island or a landmark.':`You cannot board: ${res.error}.`,res)}
 if(v==='land_boat'){c9count(r,v);const res=land();return receipt('ISLAND_BOAT',res.ok?`You pull the boat up and step onto ${res.landed_on}.`:`You cannot land here: ${res.error}.`,res)}
 if((m=/^walk_to__(\w+)$/.exec(v))){c9count(r,v);const i=ISLANDS.find(x=>x.id===m[1]);const res=walkTo(i?LAND.find(l=>l[0].startsWith(i.id+'.'))?.[0]||m[1]:m[1]);return receipt('ISLAND_WALK',res.ok?`You walk ${res.walked_m} m toward ${res.entity_label}${res.arrived?' and reach it':res.why?`; ${res.why} is in the way${res.why==='the sea'?' (you need the boat)':''}`:`; it is ${res.distance_m} m further`}. You are on ${res.on}.`:`You cannot walk there: ${res.error}.`,res)}
 if((m=/^row_to__(\w+)$/.exec(v))){c9count(r,v);const res=row(isleTarget(m[1]));return receipt('ISLAND_ROW',res.ok?`You row ${res.rowed_m} m. ${res.ashore?`The keel grinds on the shore of ${res.at}; land to step off.`:`You are on ${res.at}, ${res.remaining_m} m from the island's heart.`}`:`You cannot row: ${res.error}.`,res)}
 return verb0(r,verb)};
window.REALITI_ARCHIPELAGO_V1=Object.freeze({version:'2.0-pass1',chart:ISLE,shore_y:SHORE,h,islandAt,wind,rain,sunAlt,isNight,current,words,state,map:mapText,board,land,row,walkTo});
window.REALITI_LEDGER_V1=Object.freeze({version:'1.0',records:()=>cp(ledger()),record,export:()=>({schema:'REALITI_LEDGER_V1',observer:observer(),world_time_s:+now().toFixed(3),records:ledger().filter(e=>e.by===observer()).map(cp)}),import:importLedger});
})();
