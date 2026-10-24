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
function record(kind,data){const e={by:observer(),t:+now().toFixed(3),n:ledger().length,kind,...data};ledger().push(e);while(ledger().length>512)ledger().shift();try{c9save()}catch(x){}return e}
function importLedger(payload){const list=Array.isArray(payload)?payload:payload?.records;if(!Array.isArray(list))return {ok:false,error:'INVALID_LEDGER'};const key=e=>`${e.by}|${e.t}|${e.kind}|${e.n??''}`,have=new Set(ledger().map(key));let n=0;for(const e of list){if(!e||typeof e!=='object'||JSON.stringify(e).length>4096)continue;const k=key(e);if(have.has(k))continue;have.add(k);ledger().push(cp(e));n++}try{c9save()}catch(x){}return {ok:true,imported:n}}

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
const sunAlt=()=>70*Math.sin(TAU*((now()+(C9?.chapter2?.long?.away_s||0))/600)+.6);// island time: world time plus counted absence
const isNight=()=>sunAlt()<0;
function wind(){const v=C9?.wonder?.kite?.v??5.5,th=.9+.3*Math.sin(now()/190)+.15*Math.sin(now()/47);return {speed:v,dir:[Math.cos(th),Math.sin(th)],deg:Math.round(((th*180/Math.PI)%360+360)%360)}}
function rain(x,y){const t=now(),u=(x*.6+y*.8),phase=((u-t*3)%2400+2400)%2400;return Math.exp(-(((phase-1200)/260)**2))*clamp(.4+.6*(noise(t/400,0)))}
const current=(x,y)=>[-.35*Math.sin(y/400)+.1,.35*Math.cos(x/400)];

// Chart, landmarks, boat. The harbour sits on the computed shoreline south of Harbor Isle, wherever the noise put it.
const SIZE=1000,SHORE=(()=>{let y=-150;while(h(0,y)>-.6&&y>-900)y-=2;return y})(),SPAWN=[0,SHORE+33];
M.define(ISLE,{bounds:{kind:'BOX',center:[0,0,60],halfExtents:[SIZE,SIZE,60]},spawn:{position:[SPAWN[0],SPAWN[1],h(...SPAWN)+.85],rotation:[0,0,0,1]},view:()=>isNight()?60:400,stride:300,tags:['outdoors','archipelago']});
M.addEntity({id:'isle.ground',chart:ISLE,position:[0,0,0],shape:{kind:'HEIGHTFIELD',h,sea:SEA,slope:.6},tags:['floor','terrain','structure'],collision:true,material:'sand',label:'ground'});
for(const [k,x,y,hx,hy] of [['east',SIZE+.5,0,.5,SIZE+1],['west',-SIZE-.5,0,.5,SIZE+1],['north',0,SIZE+.5,SIZE+1,.5],['south',0,-SIZE-.5,SIZE+1,.5]])M.addEntity({id:`isle.edge.${k}`,chart:ISLE,position:[x,y,30],shape:{kind:'BOX',halfExtents:[hx,hy,60]},tags:['edge','structure'],collision:true,label:'the edge of the chart'});
const onGround=(x,y,dz=0)=>[x,y,h(x,y)+dz];
const LAND=[
 ['harbor.dock','BOX',[0,SHORE+12],[2,18,.15],['dock','wood','support','landmark'],'wood',['sit']],
 ['harbor.boathouse','BOX',[14,SHORE+28],[3,3,2.2],['boathouse','landmark','shelter'],'wood',[]],
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
for(const [id,kind,[x,y],size,tags,material,aff] of LAND){const base=id==='harbor.dock'?h(0,SHORE+26):h(x,y),pos=kind==='SPHERE'?[x,y,base+size]:kind==='CAPSULE'?[x,y,base+size.height/2]:[x,y,base+(size[2]||0)];M.addEntity({id,chart:ISLE,position:pos,shape:kind==='SPHERE'?{kind,radius:size}:kind==='CAPSULE'?{kind,...size}:{kind,halfExtents:size},tags,collision:kind!=='VOLUME',material,affordances:aff,label:({'lantern.door':'lighthouse door','stones.north':'north stone','stones.east':'east stone','stones.west':'west stone','grove.clearing':'grove clearing','hollow.cave_mouth':'cave mouth'})[id]||id.split('.').pop().replaceAll('_',' ')})}
M.addEntity({id:'harbor.boat',chart:ISLE,position:[1.2,SHORE-7,SEA+.3],shape:{kind:'BOX',halfExtents:[.7,1.4,.3]},tags:['boat','rowing','support','landmark'],collision:false,material:'wood',label:'rowing boat',affordances:['board'],dynamic:true});
// Doors: the Kite Field's north fence has a gate to the harbor; the boathouse is the home door.
M.definePortal({id:'kite_field.to.archipelago',from:'KITE_FIELD',to:ISLE,entry:[-6,27.4,.85],exit:onGround(6,SHORE+22,.85),label:'gate in the fence to the Archipelago'});
M.definePortal({id:'archipelago.to.kite_field',from:ISLE,to:'KITE_FIELD',entry:onGround(20,SHORE+18,.85),exit:[-6,25.5,.85],label:'boathouse gate back to the Kite Field'});
M.definePortal({id:'archipelago.to.cloud_nine_nest',from:ISLE,to:'CLOUD_NINE_NEST',entry:onGround(14,SHORE+24,.85),exit:[0,4.4,.85],label:'boathouse door home to Cloud Nine Nest'});

// State: boat, fog map, weather exposure.
function S(){const w=(C9.chapter2=C9.chapter2||{v:1});w.isle=w.isle||{boat:{x:1.2,y:SHORE-7,aboard:false,target:null,log:0},seen:[],wet:0,nights:0,lastNight:false};return w.isle}
const CELL=50,GRID=2*SIZE/CELL;
function markSeen(){const r=me();if(!r||r.chart!==ISLE)return;const s=S(),R=isNight()?1:3,cx=Math.floor((r.pose.position[0]+SIZE)/CELL),cy=Math.floor((SIZE-r.pose.position[1])/CELL);for(let dy=-R;dy<=R;dy++)for(let dx=-R;dx<=R;dx++){const X=cx+dx,Y=cy+dy;if(X<0||Y<0||X>=GRID||Y>=GRID)continue;const i=Y*GRID+X;if(!s.seen.includes(i))s.seen.push(i)}}
function mapText(){const s=S(),r=me(),seen=new Set(s.seen),rows=[];const my=r&&r.chart===ISLE?[Math.floor((r.pose.position[0]+SIZE)/CELL),Math.floor((SIZE-r.pose.position[1])/CELL)]:null;
 for(let Y=0;Y<GRID;Y++){let row='';for(let X=0;X<GRID;X++){if(my&&my[0]===X&&my[1]===Y){row+='@';continue}if(!seen.has(Y*GRID+X)){row+=' ';continue}const x=-SIZE+(X+.5)*CELL,y=SIZE-(Y+.5)*CELL,z=h(x,y);const lm=LAND.find(([,,[lx,ly]])=>Math.abs(lx-x)<CELL/2&&Math.abs(ly-y)<CELL/2);row+=lm?(lm[0].startsWith('lantern.light')?'L':lm[0].startsWith('hollow')?'C':lm[0].startsWith('stones')?'s':lm[0].startsWith('grove')?'g':'d'):z<SEA?'~':z<4?'.':z<18?':':'^'}rows.push(row.replace(/\s+$/,''))}
 while(rows.length&&!rows[rows.length-1])rows.pop();while(rows.length&&!rows[0].trim())rows.shift();
 /* crop to what has been seen and frame each row, so leading blanks survive text trimming and the columns line up */
 const x0=Math.min(...rows.filter(x=>x.trim()).map(x=>x.length-x.trimStart().length)),w=Math.max(...rows.map(x=>x.length))-x0;return rows.map(x=>'|'+x.slice(x0).padEnd(w)+'|')}

// Boat. Rowing at 1.5 m/s toward a target plus current plus 3% of the wind; stops at the shore.
function boat(){return S().boat}
// The harbor keeper. If you stand on Harbor Isle and the boat is nowhere near (left at another island on an earlier
// visit), it has been rowed back to the dock. Without this the boat could be stranded out of reach for good.
function keeper(){const b=boat(),r=me();if(!r||r.chart!==ISLE||b.aboard)return false;const mi=islandAt(r.pose.position[0],r.pose.position[1]);if(mi?.id!=='harbor')return false;
 if(Math.hypot(b.x-r.pose.position[0],b.y-r.pose.position[1])<=120||Math.hypot(b.x-1.2,b.y-(SHORE-7))<5)return false;b.x=1.2;b.y=SHORE-7;b.target=null;b.ashore=false;const E=M.entities()['harbor.boat'];if(E)E.pose.position=[b.x,b.y,Math.max(h(b.x,b.y),SEA)+.3];M.bump();return true}
function stepBoat(dt){const b=boat(),r=me();if(!r||r.chart!==ISLE)return;const E=M.entities()['harbor.boat'];
 if(b.target){const to=sub(b.target,[b.x,b.y,0]);to[2]=0;const d=len(to);const w=wind(),c=current(b.x,b.y),v=add(add(scale(M.math.norm(to),Math.min(1.5,d/2)),[c[0],c[1],0]),[w.dir[0]*w.speed*.03,w.dir[1]*w.speed*.03,0]);const nx=b.x+v[0]*dt,ny=b.y+v[1]*dt;
  if(h(nx,ny)>SEA-.4){b.target=null;b.ashore=true}else{b.x=nx;b.y=ny;b.log+=len(v)*dt;if(d<3)b.target=null}}
 if(E){E.pose.position=[b.x,b.y,Math.max(h(b.x,b.y),SEA)+.3]}
 if(b.aboard){r.pose.position=[b.x,b.y,SEA+.9];r.v=[0,0,0];r.intent=null}}
function board(){const back=keeper(),r=me(),E=M.entities()['harbor.boat'];if(!r||r.chart!==ISLE)return {ok:false,error:'NO_BOAT_HERE'};let d=Math.hypot(E.pose.position[0]-r.pose.position[0],E.pose.position[1]-r.pose.position[1]);if(d>2.5&&d<=40){MW.op('approach',{target:'harbor.boat'});d=Math.hypot(E.pose.position[0]-r.pose.position[0],E.pose.position[1]-r.pose.position[1])}if(d>2.5)return {ok:false,error:'BOAT_OUT_OF_REACH',distance_m:+d.toFixed(1)};const b=boat();b.aboard=true;b.ashore=false;r.afloat=true;r.posture='sitting';r.on='harbor.boat';r.support='harbor.boat';r.intent=null;r.v=[0,0,0];M.bump();MW.sync();return {ok:true}}
function land(){const r=me(),b=boat();if(!b.aboard)return {ok:false,error:'NOT_ABOARD'};const z=h(b.x,b.y);let [x,y]=[b.x,b.y];
 const dock=M.entities()['harbor.dock'];if(dock&&M.sdf(dock,[b.x,b.y,dock.pose.position[2]])<=3){const [dx,dy,dz]=dock.pose.position,[hx,hy,hz]=dock.shape.halfExtents;x=Math.max(dx-hx+.4,Math.min(dx+hx-.4,b.x));y=Math.max(dy-hy+.4,Math.min(dy+hy-.4,b.y));b.aboard=false;r.afloat=false;r.posture='standing';r.on=null;r.pose.position=[x,y,dz+hz+.85];r.support='harbor.dock';M.bump();MW.sync();return {ok:true,landed_on:'the dock'}}
 if(z<SEA-.3){let best=null;for(let k=0;k<36;k++){const a=k*TAU/36;for(let d=2;d<=20;d+=2){const px=b.x+Math.cos(a)*d,py=b.y+Math.sin(a)*d;if(h(px,py)>=SEA-.3&&(!best||d<best.d))best={d,px,py}}}if(!best)return {ok:false,error:'NO_SHORE_WITHIN_20M'};x=best.px;y=best.py}b.aboard=false;r.afloat=false;r.posture='standing';r.on=null;r.pose.position=[x,y,h(x,y)+.85];r.support='isle.ground';M.bump();MW.sync();return {ok:true,landed_on:islandAt(x,y)?.name||'a shoal'}}
const islandByName=q=>{q=String(q||'').toLowerCase().replace(/^(the|to)\s+/,'').trim();return ISLANDS.find(i=>i.id===q||i.name.toLowerCase()===q||i.name.toLowerCase().startsWith(q)||i.id.startsWith(q))||null};
function row(target){const b=boat();if(!b.aboard)return {ok:false,error:'NOT_ABOARD'};const isl=typeof target==='string'?islandByName(target):null,e=!isl&&typeof target==='string'?M.resolve(target):null;let goal=isl?[isl.c[0],isl.c[1],0]:e?e.pose.position.slice():Array.isArray(target)?target:null;if(!goal)return {ok:false,error:'ROW_WHERE',islands:ISLANDS.map(i=>i.name)};
 // An island's landing point is open water just off its own shore, on the side facing the boat. The old
 // scan ran from the island's heart straight at the boat and took the first deep water on that line, which past shoals or
 // another island could be next to the harbor.
 if(isl){const bb=Math.atan2(b.y-isl.c[1],b.x-isl.c[0]);let best=null;for(let k=0;k<32&&!best;k++){const a=bb+(k%2?1:-1)*Math.ceil(k/2)*TAU/32;for(let rr=isl.R*.7;rr<isl.R*2.4;rr+=4){const px=isl.c[0]+Math.cos(a)*rr,py=isl.c[1]+Math.sin(a)*rr;if(h(px,py)<SEA-.6){best=[px,py,0];break}}}if(best)goal=best}
 else if(h(goal[0],goal[1])>SEA-.4){const dir=M.math.norm([goal[0]-b.x,goal[1]-b.y,0]);let d=len([goal[0]-b.x,goal[1]-b.y,0]);for(;d>2;d-=4){const px=goal[0]-dir[0]*(len([goal[0]-b.x,goal[1]-b.y,0])-d),py=goal[1]-dir[1]*(len([goal[0]-b.x,goal[1]-b.y,0])-d);if(h(px,py)<SEA-.6){goal=[px,py,0];break}}}
 const d0=Math.hypot(goal[0]-b.x,goal[1]-b.y),start=[b.x,b.y];let steps=0;
 // The boat used to row straight at the goal, ground on whatever shore lay between, and stay there however
 // often you rowed. Now each leg goes to the goal if the water is clear, else to the open-water point that gets closest.
 // Each island is nearly a disc: land where A·exp(-(d/R)²) beats the six-metre depth, so its coast is about R·√ln(A/6).
 // A leg that would cross another island's coast instead goes a sixth of the way round it, outside the coast.
 const coast=i=>i.R*Math.sqrt(Math.log(Math.max(1.01,i.A/6)))*1.12+45,home=ISLANDS.find(i=>Math.hypot(goal[0]-i.c[0],goal[1]-i.c[1])<coast(i));
 const leg=()=>{const a=[b.x,b.y],gx=goal[0]-a[0],gy=goal[1]-a[1],L2=gx*gx+gy*gy||1;let hit=null;
  for(const i of ISLANDS){if(i===home)continue;const t=Math.max(0,Math.min(1,((i.c[0]-a[0])*gx+(i.c[1]-a[1])*gy)/L2)),px=a[0]+gx*t,py=a[1]+gy*t;if(Math.hypot(px-i.c[0],py-i.c[1])<coast(i)&&t>0&&(!hit||t<hit.t))hit={i,t}}
  for(const i of ISLANDS){if(i===home)continue;const da=Math.hypot(a[0]-i.c[0],a[1]-i.c[1]);if(da<coast(i)-5&&hit?.i===i){const u=[(a[0]-i.c[0])/da,(a[1]-i.c[1])/da];return [i.c[0]+u[0]*coast(i)*1.05,i.c[1]+u[1]*coast(i)*1.05,0]}}// inside a coast you are leaving: first straight out to sea
  if(!hit)return goal;const c=hit.i.c,R=coast(hit.i),ta=Math.atan2(a[1]-c[1],a[0]-c[0]),tg=Math.atan2(goal[1]-c[1],goal[0]-c[0]);let dt=tg-ta;while(dt>Math.PI)dt-=TAU;while(dt<-Math.PI)dt+=TAU;
  const open=sg=>{const span=sg===Math.sign(dt||1)?Math.abs(dt):TAU-Math.abs(dt);for(let k=1;k*Math.PI/8<=span;k++){const q=ta+sg*k*Math.PI/8,px=c[0]+Math.cos(q)*R*1.05,py=c[1]+Math.sin(q)*R*1.05;if(ISLANDS.some(j=>j!==hit.i&&j!==home&&Math.hypot(px-j.c[0],py-j.c[1])<coast(j)))return false}return true};
  let sg=Math.sign(dt||1);if(!open(sg)&&open(-sg))sg=-sg;// go round the side that is open water, even if it is the long way
  const step=sg*Math.min(sg===Math.sign(dt||1)?Math.abs(dt):TAU-Math.abs(dt),Math.PI/8),ang=ta+step;return [c[0]+Math.cos(ang)*R*1.05,c[1]+Math.sin(ang)*R*1.05,0]};
 // Like a walk, one call rows at most WALK_BUDGET_MS of world time: a crossing ran up to twelve minutes of simulation in one
 // call, over two minutes of real time, past the tunnel's cut-off.
 let spent=0,partial=false;b.ashore=false;if(Number.isFinite(WALK_BUDGET_MS))C9.b7.longWalk=true;try{while(steps++<40){if(spent>=WALK_BUDGET_MS){partial=true;break}const L=leg();b.target=[L[0],L[1],0];const before=[b.x,b.y];const ms=Math.min(15000,WALK_BUDGET_MS-spent,Math.ceil(1000*Math.max(5,Math.hypot(b.target[0]-b.x,b.target[1]-b.y)/1.4)));spent+=ms;window.REALITI_CONTINUITY?.advance?.(ms);if(b.ashore||Math.hypot(goal[0]-b.x,goal[1]-b.y)<3)break;if(Math.hypot(b.x-before[0],b.y-before[1])<.5&&!b.target)break}}finally{C9.b7.longWalk=false}b.target=null;
 if(!b.ashore&&home&&Math.hypot(goal[0]-b.x,goal[1]-b.y)<4.5)b.ashore=true;// at the island's edge: that is the shore (it used to say "3 m to go" for ever)
 if(b.ashore)partial=false;
 const d1=Math.hypot(goal[0]-b.x,goal[1]-b.y);record('ROW',{from:start.map(x=>+x.toFixed(1)),to:[+b.x.toFixed(1),+b.y.toFixed(1)]});return {ok:true,partial,rowed_m:+Math.hypot(b.x-start[0],b.y-start[1]).toFixed(1),remaining_m:+d1.toFixed(1),ashore:!!b.ashore,at:islandAt(b.x,b.y)?.name||'open water'}}

// Walking far: repeated bounded moves toward a landmark, up to ten minutes of world time.
const WALK_BUDGET_MS=(v=>v>0&&Number.isFinite(v)?Math.floor(v):Infinity)(Number(window.REALITI_WALK_BUDGET_MS));
function walkTo(target){const r=me();if(!r||r.chart!==ISLE)return {ok:false,error:'NOT_ON_THE_ISLANDS'};if(boat().aboard)return {ok:false,error:'ABOARD_THE_BOAT'};const isl=typeof target==='string'?islandByName(target):null;const e=isl?M.entities()[LAND.find(l=>l[0].startsWith(isl.id+'.'))?.[0]]:M.resolve(target);if(!e)return {ok:false,error:'LANDMARK_NOT_FOUND'};if(e.id==='harbor.boat'){keeper();const b=boat();if(Math.hypot(b.x-r.pose.position[0],b.y-r.pose.position[1])>150){const bi=ISLANDS.map(i=>({i,d:Math.hypot(b.x-i.c[0],b.y-i.c[1])})).sort((p,q)=>p.d-q.d)[0].i;return {ok:false,error:'BOAT_ELSEWHERE',text:`The rowing boat is off ${bi.name}, where you left it; it is not reachable on foot from here. On Harbor Isle the keeper brings it back to the dock.`}}}{const ti=islandAt(e.pose.position[0],e.pose.position[1]),mi=islandAt(r.pose.position[0],r.pose.position[1]);if(ti&&mi&&ti.id!==mi.id)return {ok:false,error:'ACROSS_THE_WATER',target:e.id,entity_label:e.label,island:ti.name,on:mi.name,text:`The ${String(e.label).replace(/^the /,'')} is on ${ti.name}, across open water from ${mi.name}. The rowing boat is the way: board boat, then row to ${ti.name.toLowerCase()}.`}}/* a walk toward another island used to run into the sea or a hill and then report "still to go" forever */MW.stand('walk');const start=r.pose.position.slice();let iters=0,last=Infinity,blocked=null,spent=0,partial=false;
 // A host can bound one call to WALK_BUDGET_MS of world time (window.REALITI_WALK_BUDGET_MS, or walkBudgetMs in the
 // headless host); the walk then stops and reports how far is left. Unbounded by default, as before. A long crossing
 // otherwise runs minutes of simulation in one blocking call, which stalls any host with a call timeout.
 if(Number.isFinite(WALK_BUDGET_MS))C9.b7.longWalk=true;
 try{const dk=M.entities()['harbor.dock'];if(dk&&r.support==='harbor.dock'&&!/^harbor\.(dock|boat)$/.test(e.id)){const end=[dk.pose.position[0],dk.pose.position[1]+dk.shape.halfExtents[1]+1,r.pose.position[2]];const dd=Math.hypot(end[0]-r.pose.position[0],end[1]-r.pose.position[1]);if(dd>1){M.moveTo(end);const ms=Math.min(WALK_BUDGET_MS,Math.ceil(1000*(dd/1.2+1)));spent+=ms;window.REALITI_CONTINUITY?.advance?.(ms)}}/* a dock stands over water: leave it by the landward end, never over the side */
 while(iters++<10){const d=Math.hypot(e.pose.position[0]-r.pose.position[0],e.pose.position[1]-r.pose.position[1]);if(d<=Math.max(3,(e.shape?.radius||Math.max(...(e.shape?.halfExtents||[0])))+2))break;if(d>last-1){blocked=r.last_block;break}if(spent>=WALK_BUDGET_MS){partial=true;break}last=d;M.moveTo(e.pose.position);const ms=Math.min(WALK_BUDGET_MS-spent,60000,Math.ceil(1000*(Math.min(d,72)/1.2+1)));spent+=ms;window.REALITI_CONTINUITY?.advance?.(ms)}
 }finally{C9.b7.longWalk=false}
 if(partial||spent>=WALK_BUDGET_MS)r.intent=null;
 const walked=Math.hypot(r.pose.position[0]-start[0],r.pose.position[1]-start[1]),dEnd=Math.hypot(e.pose.position[0]-r.pose.position[0],e.pose.position[1]-r.pose.position[1]);const dir=M.math.norm([e.pose.position[0]-r.pose.position[0],e.pose.position[1]-r.pose.position[1],0]),ahead=h(r.pose.position[0]+dir[0]*4,r.pose.position[1]+dir[1]*4);const why=blocked?(r.block_why==='sea'||ahead<SEA-.3?'the sea':r.block_why==='cliff'||ahead>h(r.pose.position[0],r.pose.position[1])+.45?'a cliff':blocked.split('.').pop()):null;return {ok:true,target:e.id,entity_label:e.label,walked_m:+walked.toFixed(1),distance_m:+dEnd.toFixed(1),why,arrived:dEnd<=Math.max(3,(e.shape?.radius||Math.max(...(e.shape?.halfExtents||[0])))+2),partial:!blocked&&dEnd>Math.max(3,(e.shape?.radius||Math.max(...(e.shape?.halfExtents||[0])))+2)&&spent>=WALK_BUDGET_MS,blocked_by:blocked,on:islandAt(r.pose.position[0],r.pose.position[1])?.name||'the shore'}}

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
// The intro names the island you stand on; only at the harbor does it open with the dock and the boat. (look on any
// island used to describe the dock.)
{let base=SCENE.intro;const DOCK='Salt air and a wooden dock. ',BOAT=' a rowing boat knocks against the pilings.';
 const ISLE_LINE={harbor:'Salt air on Harbor Isle; the dock and the rowing boat are down at the south shore. ',lantern:'Salt air on Lantern Point; the lighthouse stands over the rocks. ',hollow:'Salt air on Hollow Isle; somewhere along its shore a cave mouth opens in the rock. ',stones:'Salt air on the Three Stones, a low island with three standing stones far apart. ',grove:'Salt air on Grove Isle, broad and green. '};
 const view=()=>SCENE.intro;Object.defineProperty(SCENE,'intro',{configurable:true,enumerable:true,set(v){v=String(v);const cur=view();base=v.startsWith(cur)?base+v.slice(cur.length):v},get(){const r=me();if(!r||r.chart!==ISLE)return base;const b=boat(),dock=M.entities()['harbor.dock'];
  const atDock=dock&&Math.hypot(dock.pose.position[0]-r.pose.position[0],dock.pose.position[1]-r.pose.position[1])<45;if(atDock&&!b.aboard)return base;
  const isle=islandAt(r.pose.position[0],r.pose.position[1]);const lead=b.aboard?'Salt water all round; you sit in the rowing boat. ':isle?ISLE_LINE[isle.id]||`Salt air on ${isle.name}. `:'Salt air and open water. ';
  return base.replace(DOCK,lead).replace(';'+BOAT,'.').replace(BOAT,'')}})}
const actions0=b4AgentActions;b4AgentActions=function(){const a=actions0();if(room()!==ISLE)return a;const r=me(),b=boat(),E=M.entities()['harbor.boat'],near=E&&r&&Math.hypot(E.pose.position[0]-r.pose.position[0],E.pose.position[1]-r.pose.position[1])<=2.5;const out=a.filter(x=>!['board_boat','land_boat'].includes(x.id));if(near&&!b.aboard)out.push({id:'board_boat',label:'BOARD THE BOAT'});if(b.aboard)out.push({id:'land_boat',label:'LAND THE BOAT'});if(b.aboard){for(const i of ISLANDS)out.push({id:'row_to__'+i.id,label:'ROW TOWARD '+i.name.toUpperCase()})}else if(r){/* on land, walks go to places on this island (the far stones too); other islands are rowed to */const mi=islandAt(r.pose.position[0],r.pose.position[1]);for(const f of farther(out.map(x=>(/^approach__(.+)$/.exec(x.id)||[])[1]).filter(Boolean)))out.push({id:'walk_to__'+f.id,label:'WALK TO THE '+String(f.label).replace(/^the /i,'').toUpperCase()});for(const i of ISLANDS)if(!mi||i.id!==mi.id)out.push({id:'row_to__'+i.id,label:'ROW TOWARD '+i.name.toUpperCase()+' (BOARD THE BOAT FIRST)',needs:'board_boat'})}return out};
// Landmarks on the island you stand on that are out of the near list, with a rough distance and bearing.
const FAR_COMPASS=['north','north-east','east','south-east','south','south-west','west','north-west'];
function farther(exclude=[]){const r=me();if(!r||r.chart!==ISLE||boat().aboard)return [];const mi=islandAt(r.pose.position[0],r.pose.position[1]);if(!mi)return [];const E=M.entities(),ex=new Set(exclude);
 return LAND.map(l=>E[l[0]]).filter(e=>e&&!ex.has(e.id)&&!/door$/.test(e.id)&&islandAt(e.pose.position[0],e.pose.position[1])?.id===mi.id).map(e=>{const dx=e.pose.position[0]-r.pose.position[0],dy=e.pose.position[1]-r.pose.position[1],d=Math.hypot(dx,dy);return {id:e.id,label:e.label,distance_m:Math.round(d),toward:FAR_COMPASS[Math.round(((Math.atan2(dx,dy)*180/Math.PI)%360+360)%360/45)%8]}}).filter(x=>x.distance_m>6).sort((a,b)=>a.distance_m-b.distance_m)}
function receipt(type,narrative,data){C9.b4=C9.b4||{};C9.b4.lastReceipt={type,room:room(),narrative,...data,law:'terrain, sea, wind and sky are world facts; narration reports them'};try{c9save()}catch(e){};return true}
const isleTarget=id=>{const i=ISLANDS.find(x=>x.id===id);return i?[i.c[0],i.c[1],0]:null};
const verb0=c9verb;c9verb=function(r,verb){const v=String(verb||'');if(r!==ISLE)return verb0(r,verb);let m;
 if(v==='island_map'){c9count(r,v);const rows=mapText();return receipt('ISLAND_MAP',rows.join('\n')+`\n@ you · ~ sea · . shore · : land · ^ high · d dock · L lighthouse · C cave · s stones · g grove · blank: not yet seen · north is up · ${S().seen.length} of ${GRID*GRID} cells seen`,{map:rows,seen:S().seen.length})}
 if(v==='read_weather'){c9count(r,v);return receipt('ISLAND_WEATHER',words()[0],state())}
 if(v==='board_boat'){c9count(r,v);const res=board();return receipt('ISLAND_BOAT',res.ok?'You step down into the boat; it rocks, then settles under you. Row toward an island or a landmark.':res.error==='BOAT_OUT_OF_REACH'?`The boat is ${Math.round(res.distance_m)} m away; walk to boat first.`:`You cannot board: ${res.error}.`,res)}
 if(v==='land_boat'){c9count(r,v);const res=land();return receipt('ISLAND_BOAT',res.ok?`You pull the boat up and step onto ${res.landed_on}.`:`You cannot land here: ${res.error}.`,res)}
 if((m=/^walk_to__([\w.]+)$/.exec(v))){c9count(r,v);const i=ISLANDS.find(x=>x.id===m[1]);const res=walkTo(i?LAND.find(l=>l[0].startsWith(i.id+'.'))?.[0]||m[1]:m[1]);return receipt('ISLAND_WALK',res.ok?`You walk ${res.walked_m} m toward ${res.entity_label}${res.arrived?' and reach it':res.why?`; ${res.why} is in the way${res.why==='the sea'?' (you need the boat)':''}`:res.partial?`; ${res.distance_m} m still to go (do this again to go on)`:`; it is ${res.distance_m} m further`}. You are on ${res.on}.`:(res.text||`You cannot walk there: ${res.error}.`),res)}
 if((m=/^row_to__(\w+)$/.exec(v))){c9count(r,v);if(!boat().aboard){const E=M.entities()['harbor.boat'],me0=me(),d=E&&me0?Math.round(Math.hypot(E.pose.position[0]-me0.pose.position[0],E.pose.position[1]-me0.pose.position[1])):null;return receipt('ISLAND_ROW',`You are not in the boat. It is ${d==null?'somewhere on the water':d<=3?'right here':`${d} m away`}; ${d!=null&&d<=40?'board boat, then row.':'walk to boat, board boat, then row.'}`,{ok:false,error:'NOT_ABOARD',boat_m:d})}const res=row(isleTarget(m[1]));return receipt('ISLAND_ROW',res.ok?`You row ${res.rowed_m} m. ${res.ashore?`The keel grinds on the shore of ${res.at}; land to step ashore.`:`You are on ${res.at==='open water'?'open water':`the water off ${res.at}`}, ${res.remaining_m} m to go${res.partial?' (row again to go on)':''}.`}`:`You cannot row: ${res.error}.`,res)}
 return verb0(r,verb)};
window.REALITI_ARCHIPELAGO_V1=Object.freeze({version:'2.0-pass1',chart:ISLE,shore_y:SHORE,h,islandAt,landmarks:()=>LAND.map(l=>({id:l[0],x:l[2][0],y:l[2][1]})),wind,rain,sunAlt,isNight,current,words,state,map:mapText,board,land,row,walkTo,farther});
window.REALITI_LEDGER_V1=Object.freeze({version:'1.0',records:()=>cp(ledger()),record,export:()=>({schema:'REALITI_LEDGER_V1',observer:observer(),world_time_s:+now().toFixed(3),records:ledger().filter(e=>e.by===observer()).map(cp)}),import:importLedger});
})();
