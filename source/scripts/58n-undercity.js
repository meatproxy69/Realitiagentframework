(()=>{
'use strict';
// Chapter 4, pass 4: the Undercity. A tunnel maze under Meridian with no light. Nothing is listed unless it is within
// reach; `clap` sends sixteen rays from your head and returns the echo delay in each direction (2d/c, c = 343 m/s),
// which is how you learn the shape of the place. Air from the exits and water in the cistern are smell and sound
// sources in the senses fields, so following your nose and your ears is a real strategy. Walls are swept against like
// anywhere else, the ceiling is 2.2 m, and the grate refuses anyone taller than it. The map is yours: cells you have
// stood in and walls your echoes have found.
const M=window.REALITI_MATRIX_V1,MW=window.REALITI_MATRIX_WORLD_V1,CAT=window.REALITI_CATNIP_V1,SN=window.REALITI_SENSES_V1,CT=window.REALITI_CITY_V1;if(!M||!MW||!CAT||!SN||!CT)return;
const UNDER='UNDERCITY',CITY=CT.chart,now=()=>Number(C9?.b7?.clock||0),room=()=>C9?.currentRoom,cp=x=>JSON.parse(JSON.stringify(x)),TAU=2*Math.PI;
const me=()=>M.state().residents['resident:self'],ent=()=>M.entities();
function S(){const w=(C9.chapter2=C9.chapter2||{v:1});w.under=w.under||{visited:[],walls:[],claps:0,gate_open:false,lever:false,touched:{}};return w.under}
for(const [id,text] of Object.entries({first_echo:'You clapped in the dark and the tunnels answered with their shape.',cistern:'Your hand found water in the dark: the cistern.',lever_pulled:'An iron lever, and somewhere a gate swung.',vault_read:'You read the vault wall by touch.',undercity_mapped:'You have stood in more than half of the Undercity.',surfaced:'You found the far way up, by ear and nose.'}))CAT.register(id,text);

// Maze: 9×9 cells of 5 m, recursive backtracker from a fixed seed, plus four extra openings for loops.
const N=9,CELL=5,HALF=N*CELL/2,W=.3,CEIL=2.2;
let seed=20261004;const rnd=()=>{seed=(Math.imul(seed,1103515245)+12345)>>>0;return seed/4294967296};
const cells=[];for(let y=0;y<N;y++)for(let x=0;x<N;x++)cells.push({x,y,open:{n:false,s:false,e:false,w:false},seen:false});
const at=(x,y)=>cells[y*N+x];
(function carve(){const stack=[at(0,0)];at(0,0).seen=true;while(stack.length){const c=stack[stack.length-1];const nb=[['n',0,-1,'s'],['s',0,1,'n'],['e',1,0,'w'],['w',-1,0,'e']].map(([d,dx,dy,o])=>({d,o,c:(c.x+dx>=0&&c.x+dx<N&&c.y+dy>=0&&c.y+dy<N)?at(c.x+dx,c.y+dy):null})).filter(q=>q.c&&!q.c.seen);if(!nb.length){stack.pop();continue}const q=nb[Math.floor(rnd()*nb.length)];c.open[q.d]=true;q.c.open[q.o]=true;q.c.seen=true;stack.push(q.c)}
 for(let k=0;k<4;k++){const c=at(1+Math.floor(rnd()*(N-2)),1+Math.floor(rnd()*(N-2)));if(!c.open.e){c.open.e=true;at(c.x+1,c.y).open.w=true}}})();
const center=(x,y)=>[-HALF+(x+.5)*CELL,HALF-(y+.5)*CELL];
M.define(UNDER,{bounds:{kind:'BOX',center:[0,0,1.5],halfExtents:[HALF+2,HALF+2,1.5]},spawn:{position:[center(0,0)[0]+1.6,center(0,0)[1],.85],rotation:[0,0,0,1]},view:.3,stride:12,tags:['dark','underground','indoors']});
M.addEntity({id:'under.floor',chart:UNDER,position:[0,0,-.5],shape:{kind:'BOX',halfExtents:[HALF+2,HALF+2,.5]},tags:['floor','structure','stone'],collision:true,material:'ceramic',label:'wet flagstones'});
M.addEntity({id:'under.ceiling',chart:UNDER,position:[0,0,CEIL+.5],shape:{kind:'BOX',halfExtents:[HALF+2,HALF+2,.5]},tags:['ceiling','structure'],collision:true,material:'ceramic',label:'the vault of the ceiling'});
let wid=0;const wall=(cx,cy,hx,hy,material='ceramic',label='brick wall',tags=[])=>M.addEntity({id:`under.wall_${wid++}`,chart:UNDER,position:[cx,cy,CEIL/2],shape:{kind:'BOX',halfExtents:[hx,hy,CEIL/2]},tags:['wall','structure',...tags],collision:true,material,label});
for(const c of cells){const [cx,cy]=center(c.x,c.y);if(!c.open.n)wall(cx,cy+CELL/2,CELL/2+W,W);if(!c.open.w)wall(cx-CELL/2,cy,W,CELL/2+W);if(c.x===N-1&&!c.open.e)wall(cx+CELL/2,cy,W,CELL/2+W);if(c.y===N-1&&!c.open.s)wall(cx,cy-CELL/2,CELL/2+W,W)}
// Places in the dark: a cistern, a lever, an iron gate that it opens, a vault beyond with a wall to read by touch, two ways up.
const CIS=center(4,4),LEV=center(N-1,0),GATE=center(N-2,N-1),VAULT=center(N-1,N-1),EXIT2=center(0,N-1);
M.addEntity({id:'under.cistern',chart:UNDER,position:[CIS[0],CIS[1],.15],shape:{kind:'BOX',halfExtents:[1.4,1.4,.15]},tags:['water','cistern','landmark'],collision:false,material:'water',label:'still water',affordances:['touch']});
M.addEntity({id:'under.lever',chart:UNDER,position:[LEV[0]+1.9,LEV[1],1.1],shape:{kind:'BOX',halfExtents:[.08,.08,.5]},tags:['lever','iron','landmark'],collision:true,material:'metal',label:'an iron lever',affordances:['pull']});
M.addEntity({id:'under.gate',chart:UNDER,position:[GATE[0]+CELL/2,GATE[1],CEIL/2],shape:{kind:'BOX',halfExtents:[.08,CELL/2-W,CEIL/2]},tags:['gate','iron','door','landmark'],collision:true,material:'metal',label:'an iron gate',affordances:['touch']});
at(N-2,N-1).open.e=true;at(N-1,N-1).open.w=true;// the gate stands in that opening
M.addEntity({id:'under.vault_wall',chart:UNDER,position:[VAULT[0]+CELL/2-W-.05,VAULT[1],1.2],shape:{kind:'BOX',halfExtents:[.04,1.2,.6]},tags:['inscription','stone','landmark'],collision:true,material:'ceramic',label:'a carved wall',affordances:['read']});
M.definePortal({id:'meridian_city.to.undercity',from:CITY,to:UNDER,entry:[-20,-20,.85],exit:[...center(0,0),.85],label:'an iron grate in the paving, open'});
M.definePortal({id:'undercity.to.meridian_city',from:UNDER,to:CITY,entry:[...center(0,0),.85],exit:[-18,-20,.85],label:'the ladder up to the grate'});
M.definePortal({id:'undercity.far.to.meridian_city',from:UNDER,to:CITY,entry:[...EXIT2,.85],exit:[-30,58,.85],label:'a second ladder, up into daylight'});
SN.addSource({id:'drip',chart:UNDER,pos:'under.cistern',label:'dripping water',sound:()=>42,smell:{label:'wet stone and cold water',S:()=>.9}});
SN.addSource({id:'grate_air',chart:UNDER,pos:r=>[...center(0,0),1.6],label:'air from the grate',sound:()=>26,smell:{label:'fresh air from above',S:()=>.8}});
SN.addSource({id:'far_air',chart:UNDER,pos:r=>[...EXIT2,1.6],label:'air from the far ladder',sound:()=>22,smell:{label:'fresh air, and the sea on it',S:()=>.8}});
SN.addSource({id:'rust',chart:UNDER,pos:'under.gate',label:'',sound:()=>0,smell:{label:'rust',S:()=>.4}});

// Echolocation: sixteen horizontal rays from the head; each returns the first surface and its round-trip delay.
const DIRS=16,C=343;
function clap(){const r=me();if(!r||r.chart!==UNDER)return {ok:false,error:'NOT_IN_THE_DARK'};const head=[r.pose.position[0],r.pose.position[1],r.pose.position[2]+r.shape.height/2-.1],f=M.facing(r),yaw0=Math.atan2(f[0],f[1]),out=[],s=S();s.claps++;
 for(let i=0;i<DIRS;i++){const a=yaw0+i*TAU/DIRS,dir=[Math.sin(a),Math.cos(a),0],h=M.raycast({origin:head,direction:dir,maxDistance:45,chart:UNDER});const d=h.hit?h.distance:null;const rel=((i*360/DIRS)+360)%360;const word=rel<22.5||rel>=337.5?'ahead':rel<67.5?'ahead-right':rel<112.5?'right':rel<157.5?'behind-right':rel<202.5?'behind':rel<247.5?'behind-left':rel<292.5?'left':'ahead-left';
  out.push({deg:Math.round(rel),direction:word,distance_m:d==null?null:+d.toFixed(1),delay_ms:d==null?null:Math.round(2000*d/C),surface:h.hit?(ent()[h.hit]?.material||'stone'):null});if(h.hit){const hx=h.point[0],hy=h.point[1];const k=`${Math.round(hx)},${Math.round(hy)}`;if(!s.walls.includes(k))s.walls.push(k);for(let t=1;t<d;t+=1){const px=head[0]+dir[0]*t,py=head[1]+dir[1]*t;markOpen(px,py)}}}
 CAT.discover('first_echo');const longest=out.filter(x=>x.distance_m!=null).sort((a,b)=>b.distance_m-a.distance_m)[0];return {ok:true,echoes:out,rt60_s:SN.rt60(UNDER),longest,text:`Clap. ${out.filter(x=>x.distance_m!=null&&x.distance_m<1.5).length} of ${DIRS} directions come straight back; the longest echo is ${longest?`${longest.delay_ms} ms ${longest.direction} (${longest.distance_m} m)`:'none'}.`}}
const cellOf=(x,y)=>[Math.floor((x+HALF)/CELL),Math.floor((HALF-y)/CELL)];
const open=new Set();function markOpen(x,y){const [cx,cy]=cellOf(x,y);if(cx<0||cy<0||cx>=N||cy>=N)return;const k=cx+','+cy;if(!open.has(k)){open.add(k);const s=S();if(!s.visited.includes(k))s.visited.push(k)}}
function visit(){const r=me();if(!r||r.chart!==UNDER)return;const [cx,cy]=cellOf(r.pose.position[0],r.pose.position[1]);if(cx<0||cy<0||cx>=N||cy>=N)return;const k=cx+','+cy,s=S();if(!s.stood)s.stood=[];if(!s.stood.includes(k))s.stood.push(k);if(!s.visited.includes(k))s.visited.push(k);if(s.stood.length>=Math.ceil(N*N/2))CAT.discover('undercity_mapped')}
function mapText(){const s=S(),r=me(),my=r&&r.chart===UNDER?cellOf(r.pose.position[0],r.pose.position[1]):null,rows=[];const wallSet=new Set(s.walls);
 for(let cy=0;cy<N;cy++){let row='';for(let cx=0;cx<N;cx++){const k=cx+','+cy;if(my&&my[0]===cx&&my[1]===cy){row+='@';continue}row+=s.stood?.includes(k)?'.':s.visited.includes(k)?',':' '}rows.push(row)}
 return {rows,legend:'@ you · . stood here · , heard open · blank unknown',cells_known:s.visited.length,of:N*N,walls_found:s.walls.length}}

// Touch in the dark: things within reach answer by material; the lever opens the gate; the vault wall reads by hand.
const near=(id,tol=1.2)=>{const e=ent()[id],r=me();return !!(e&&r&&r.chart===UNDER&&Math.max(0,M.sdf(e,r.pose.position))<=tol)};
function touch(){const r=me();if(!r||r.chart!==UNDER)return {ok:false,error:'NOT_IN_THE_DARK'};const s=S(),out=[];for(const e of Object.values(ent())){if(e.chart!==UNDER||e.resident||e.id==='under.floor'||e.id==='under.ceiling')continue;const d=Math.max(0,M.sdf(e,r.pose.position));if(d<=1.0){out.push({id:e.id,material:e.material,label:e.tags.includes('wall')?null:e.label,distance_m:+d.toFixed(2),affordances:e.affordances});s.touched[e.id]=true}}
 if(s.touched['under.cistern'])CAT.discover('cistern');return {ok:true,touched:out,text:out.length?out.map(x=>`${x.label||x.material||'stone'} ${x.distance_m} m`).join('; ')+'.':'Nothing within reach.'}}
function pull(){if(!near('under.lever',1.2))return {ok:false,error:'NOTHING_TO_PULL_HERE'};const s=S();if(s.lever)return {ok:true,already:true,text:'The lever is down already.'};s.lever=true;s.gate_open=true;const g=ent()['under.gate'];if(g){g.collision=false;g.label='an iron gate, open';g.pose.position[1]+=CELL/2-W}CAT.discover('lever_pulled');M.bump();return {ok:true,text:'The lever goes down with a shriek of iron. Far off, something heavy swings and stops.'}}
function readWall(){if(!near('under.vault_wall',1.2))return {ok:false,error:'NOTHING_TO_READ_HERE'};CAT.discover('vault_read');return {ok:true,text:'Your fingers follow the cuts: "WHO READS THIS HAS NO NEED OF LIGHT. THE SEA IS UNDER THE SECOND LADDER."'}}

// Hooks: the grate refuses the tall; surfacing by the far ladder is a discovery; cells are marked as you stand in them.
let at2=-1e9,lastChart=null;const adv=b7Advance;b7Advance=function(dt){const r=adv(dt);const c=me()?.chart;if(lastChart===UNDER&&c===CITY){const p=me().pose.position;if(Math.hypot(p[0]+30,p[1]-58)<3)CAT.discover('surfaced')}lastChart=c;if(room()===UNDER){const t=now();if(t-at2>=.5){at2=t;visit()}}return r};
const go0=b7AgentGo;b7AgentGo=function(v){const r=go0(v);const me0=me();if(room()===UNDER&&me0&&me0.shape.height>CEIL-.1){M.enter(CITY);me0.pose.position[2]=me0.shape.height/2;M.bump();C9.currentRoom=CITY;try{c9save()}catch(e){}C9.b4=C9.b4||{};C9.b4.lastReceipt={type:'UNDER_GRATE',room:CITY,narrative:`The grate is ${(CEIL-.4).toFixed(1)} m across and you are ${me0.shape.height.toFixed(2)} m tall; you do not fit. A smaller avatar would.`,law:'the grate and the ceiling are geometry'};return r}if(room()===UNDER){visit();const g=ent()['under.gate'];if(g&&S().gate_open){g.collision=false;g.label='an iron gate, open'}}return r};
C9SCENES[UNDER]={intro:'Dark. Not dim: dark. Flagstones under your feet, a draught on your face from the grate above, water somewhere ahead. Nothing here is seen; clap, listen, smell, touch.',verbs:[['clap','CLAP'],['touch','TOUCH WHAT IS IN REACH'],['under_map','WHAT YOU KNOW OF THE DARK']]};
const actions0=b4AgentActions;b4AgentActions=function(){const a=actions0();if(room()!==UNDER)return a;a.push({id:'clap',label:'CLAP'},{id:'touch',label:'TOUCH WHAT IS IN REACH'},{id:'under_map',label:'WHAT YOU KNOW OF THE DARK'});if(near('under.lever',1.2))a.push({id:'pull_lever',label:'PULL THE LEVER'});if(near('under.vault_wall',1.2))a.push({id:'read_wall',label:'READ THE WALL BY TOUCH'});return a};
function receipt(type,res){C9.b4=C9.b4||{};C9.b4.lastReceipt={type,room:room(),narrative:res.text||(res.error?`You cannot: ${res.error}.`:''),...res,law:'echoes, walls, water and air are geometry and fields; nothing is narrated that was not measured'};try{c9save()}catch(e){}return true}
const verb0=c9verb;c9verb=function(r,verb){const v=String(verb||'');if(r!==UNDER)return verb0(r,verb);const F={clap,touch,pull_lever:pull,read_wall:readWall,under_map:()=>{const m=mapText();return {...m,text:m.rows.join('\n')+`\n${m.legend} · ${m.cells_known} of ${m.of} cells known, ${m.walls_found} wall points`}}};if(F[v]){c9count(r,v);return receipt('UNDER_'+v.toUpperCase(),F[v]())}return verb0(r,verb)};
window.REALITI_UNDERCITY_V1=Object.freeze({version:'4.0-pass4',chart:UNDER,cells:N,cell_m:CELL,ceiling_m:CEIL,clap,touch,pull,readWall,map:mapText,layout:()=>cells.map(c=>({x:c.x,y:c.y,open:{...c.open}})),state:()=>cp(S())});
})();
