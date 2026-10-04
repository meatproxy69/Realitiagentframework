(()=>{
'use strict';
// Wonder rooms: five expansive places, each running its own mechanics inside the world clock.
// Orrery Loft: symplectic n-body gravity. Lantern Maze: seeded labyrinth with BFS lantern light.
// Sandpile Shore: abelian sandpile avalanches. Firefly Meadow: Kuramoto synchronization.
// Kite Field: Ornstein–Uhlenbeck wind, kite equilibrium, aeolian line hum. World numbers own these rooms.
const DYN=window.REALITI_DYNAMICS_V1;if(!DYN)return;
const ORRERY='ORRERY_LOFT',MAZE='LANTERN_MAZE',SHORE='SANDPILE_SHORE',MEADOW='FIREFLY_MEADOW',FIELD='KITE_FIELD';
const now=()=>Number(C9?.b7?.clock||0),room=()=>C9?.currentRoom,clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,Number(x)||0)),cp=x=>JSON.parse(JSON.stringify(x)),TAU=2*Math.PI;
const rng=seed=>()=>{seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296};
const gauss=r=>Math.sqrt(-2*Math.log(1-r()))*Math.cos(TAU*r());
const deg=a=>Math.round(((a*180/Math.PI)%360+360)%360);
B7_MATERIALS.sand={id:'sand',surface:.70,mid:.30,deep:.08,onset:.04,tail:.30,grain_with:1,grain_against:1.05,catch:.30,yield:.40};
function palm(input,material,cause){try{b7Contact('hand.R.palm',input,{material,grain:'with',speed:.1,mine:true,source:'SELF_STARTED_WORLD_CONTACT',cause,pressure:input,novelty:.2})}catch(e){}}
function receipt(type,narrative,data){C9.b4=C9.b4||{};C9.b4.lastReceipt={type,room:room(),narrative,...data,law:'world mechanics own these numbers; private rendering cannot change them'};try{c9save()}catch(e){};return true}
function W(){C9.wonder=C9.wonder||{v:1};return C9.wonder}

// Orrery Loft. Sun of mass 1 at the origin, five mutually attracting bodies, kick-drift-kick leapfrog (h=.01),
// 0.3 time units per world second so the inner body orbits in about 21 s. The floor hold follows the tide Σ m/r³.
const OR={bodies:[['Pebble',1.0,.002],['Tangle',1.6,.003],['Hush',2.5,.004],['Lantern',3.7,.003],['Drift',5.2,.005]],scale:.3,h:.01};
function orrery(){const w=W();if(w.orrery)return w.orrery;const r=rng(9001),b=OR.bodies.map(([name,a,m])=>{const th=r()*TAU,v=Math.sqrt(1/a);return {name,m,x:a*Math.cos(th),y:a*Math.sin(th),vx:-v*Math.sin(th),vy:v*Math.cos(th)}});w.orrery={t:0,b,E0:0,tide0:0,nudges:0};w.orrery.E0=energy(w.orrery);w.orrery.tide0=tide(w.orrery);return w.orrery}
function accel(b){return b.map((p,i)=>{const r3=Math.hypot(p.x,p.y)**3;let ax=-p.x/r3,ay=-p.y/r3;for(let j=0;j<b.length;j++){if(j===i)continue;const q=b[j],dx=q.x-p.x,dy=q.y-p.y,d3=(dx*dx+dy*dy+1e-4)**1.5;ax+=q.m*dx/d3;ay+=q.m*dy/d3}return [ax,ay]})}
function energy(o){let E=0;for(let i=0;i<o.b.length;i++){const p=o.b[i];E+=.5*p.m*(p.vx*p.vx+p.vy*p.vy)-p.m/Math.hypot(p.x,p.y);for(let j=i+1;j<o.b.length;j++){const q=o.b[j];E-=p.m*q.m/Math.hypot(q.x-p.x,q.y-p.y)}}return E}
const tide=o=>o.b.reduce((s,p)=>s+p.m/Math.hypot(p.x,p.y)**3,0),tideFactor=()=>{const o=orrery();return clamp(1+.5*(tide(o)/o.tide0-1),.7,1.3)};
function stepOrrery(dt){const o=orrery(),b=o.b;let left=dt*OR.scale,a=accel(b);while(left>1e-12){const s=Math.min(OR.h,left);b.forEach((p,i)=>{p.vx+=.5*s*a[i][0];p.vy+=.5*s*a[i][1];p.x+=s*p.vx;p.y+=s*p.vy});a=accel(b);b.forEach((p,i)=>{p.vx+=.5*s*a[i][0];p.vy+=.5*s*a[i][1]});o.t+=s;left-=s}}
function ephemeris(){const o=orrery();const rows=o.b.map(p=>{const r=Math.hypot(p.x,p.y),w=(p.x*p.vy-p.y*p.vx)/(r*r),v2=p.vx*p.vx+p.vy*p.vy,a=1/(2/r-v2),e=Math.sqrt(Math.max(0,1-(r*r*w*w*r*r)/a));return {name:p.name,r:+r.toFixed(3),theta_deg:deg(Math.atan2(p.y,p.x)),speed:+Math.sqrt(v2).toFixed(3),omega:w,semi_major:+a.toFixed(3),period_s:+(TAU*Math.sqrt(Math.abs(a)**3)/OR.scale).toFixed(1),eccentricity:+e.toFixed(3)}});
 let best=null;for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++){const pi=o.b[i],pj=o.b[j];let d=Math.atan2(pj.y,pj.x)-Math.atan2(pi.y,pi.x),dw=rows[i].omega-rows[j].omega;if(Math.abs(dw)<1e-9)continue;d=((d%TAU)+TAU)%TAU;let t=d/dw;if(t<0)t=(d-TAU)/dw;if(t<0)continue;t/=OR.scale;if(!best||t<best.in_s)best={pair:[rows[i].name,rows[j].name],in_s:+t.toFixed(1)}}
 return {t:+o.t.toFixed(3),bodies:rows.map(({omega,...x})=>x),next_conjunction:best,energy_drift:+((energy(o)-o.E0)/Math.abs(o.E0)).toExponential(2),tide_ratio:+(tide(o)/o.tide0).toFixed(3),nudges:o.nudges}}
function orreryVerb(v){const o=orrery();let m=/^(nudge|brake)_(\w+)$/.exec(v);if(m){const p=o.b.find(x=>x.name.toLowerCase()===m[2]);if(!p)return false;const k=m[1]==='nudge'?1.08:.92;p.vx*=k;p.vy*=k;o.nudges++;o.E0=energy(o);const e=ephemeris().bodies.find(x=>x.name===p.name);return receipt('ORRERY_IMPULSE',`${p.name} ${m[1]==='nudge'?'speeds up':'slows'} by 8%. Its orbit is now ${e.eccentricity<.05?'nearly circular':'an ellipse of eccentricity '+e.eccentricity}, period about ${e.period_s} s.`,{body:p.name,factor:k,ephemeris:e})}
 if(v==='watch_orrery'){const e=ephemeris();return receipt('ORRERY_EPHEMERIS',orreryWords(e),{ephemeris:e})}
 if(v==='reset_orrery'){delete W().orrery;return receipt('ORRERY_RESET','The bodies return to their first circles. Energy audit restarts.',{})}
 return false}
function orreryWords(e=ephemeris()){const c=e.next_conjunction;return `${e.bodies.map(b=>`${b.name} ${b.r} spans at ${b.theta_deg}°`).join(', ')}. ${c?`${c.pair[0]} and ${c.pair[1]} align in ${c.in_s} s.`:''} Tide ${e.tide_ratio}× baseline; energy drift ${e.energy_drift}.`}

// Lantern Maze. 11×11 cells, iterative recursive-backtracker, six lanterns at the farthest dead ends.
// Glow at your cell is Σ lit lanterns e^(−d/3) with d the BFS distance. Lit lanterns stay lit.
const MZ={n:11,lanterns:6,DIR:[['north',0,-1,1,4],['east',1,0,2,8],['south',0,1,4,1],['west',-1,0,8,2]]};
function bfs(open,sx,sy){const n=MZ.n,d=new Array(n*n).fill(-1),q=[sy*n+sx];d[q[0]]=0;for(let k=0;k<q.length;k++){const i=q[k],x=i%n,y=(i-x)/n;for(const [,dx,dy,bit] of MZ.DIR){if(!(open[i]&bit))continue;const j=(y+dy)*n+x+dx;if(d[j]<0){d[j]=d[i]+1;q.push(j)}}}return d}
function maze(){const w=W();if(w.maze)return w.maze;const n=MZ.n,r=rng(4242),open=new Array(n*n).fill(0),seen=new Uint8Array(n*n),stack=[[0,0]];seen[0]=1;
 while(stack.length){const [x,y]=stack[stack.length-1],opts=MZ.DIR.filter(([,dx,dy])=>{const nx=x+dx,ny=y+dy;return nx>=0&&ny>=0&&nx<n&&ny<n&&!seen[ny*n+nx]});if(!opts.length){stack.pop();continue}const [,dx,dy,bit,back]=opts[Math.floor(r()*opts.length)],nx=x+dx,ny=y+dy;open[y*n+x]|=bit;open[ny*n+nx]|=back;seen[ny*n+nx]=1;stack.push([nx,ny])}
 const d=bfs(open,0,0),ends=open.map((o,i)=>i).filter(i=>[1,2,4,8].includes(open[i])).sort((a,b)=>d[b]-d[a]).slice(0,MZ.lanterns);
 w.maze={open,x:0,y:0,visited:[0],steps:0,lanterns:ends.map(i=>({x:i%MZ.n,y:(i-i%MZ.n)/MZ.n,lit:false}))};return w.maze}
function glow(m=maze()){const d=bfs(m.open,m.x,m.y);return m.lanterns.filter(l=>l.lit).reduce((s,l)=>s+Math.exp(-d[l.y*MZ.n+l.x]/3),0)}
function mazeMap(m=maze()){const n=MZ.n,vis=new Set(m.visited),rows=[];for(let y=0;y<n;y++){let top='',mid='';for(let x=0;x<n;x++){const i=y*n+x,v=vis.has(i),o=m.open[i],l=m.lanterns.find(q=>q.x===x&&q.y===y);top+='#'+(v&&(o&1)?' ':'#');mid+=(v&&(o&8)?' ':'#')+(x===m.x&&y===m.y?'@':l?.lit?'*':v?(l?'o':'.'):'?')}rows.push(top+'#',mid+'#')}rows.push('#'.repeat(2*n+1));return rows}
function mazeVerb(v){const m=maze();const dir=MZ.DIR.find(([name])=>v==='step_'+name);
 if(dir){const [name,dx,dy,bit]=dir;if(!(m.open[m.y*MZ.n+m.x]&bit))return receipt('MAZE_WALL',`Cardboard. There is no way ${name} from here.`,{});m.x+=dx;m.y+=dy;m.steps++;const i=m.y*MZ.n+m.x;if(!m.visited.includes(i))m.visited.push(i);palm(.15,'cardboard','MAZE_WALL_BRUSH');const l=m.lanterns.find(q=>q.x===m.x&&q.y===m.y),g=glow(m),exits=MZ.DIR.filter(([,,,b])=>m.open[i]&b).map(([n])=>n);return receipt('MAZE_STEP',`You step ${name}; your hand brushes the wall. Exits: ${exits.join(', ')}.${l?l.lit?' Your lantern burns here.':' An unlit paper lantern hangs here.':''} Glow ${g.toFixed(2)}.`,{x:m.x,y:m.y,exits,glow:+g.toFixed(4),visited:m.visited.length})}
 if(v==='light_lantern'){const l=m.lanterns.find(q=>q.x===m.x&&q.y===m.y);if(!l)return receipt('MAZE_NO_LANTERN','No lantern hangs in this cell.',{});if(l.lit)return receipt('MAZE_LANTERN_LIT','This lantern is already burning.',{});l.lit=true;try{window.REALITI_ATMOSPHERE_V21?.setThermal?.('hand.R.palm','glass',42,1.5,'LANTERN_GLASS','SELF_STARTED_WORLD_CONTACT')}catch(e){}palm(.12,'cardboard','LANTERN_LIGHT');const lit=m.lanterns.filter(q=>q.lit).length;return receipt('MAZE_LANTERN',`The paper lantern catches. ${lit} of ${MZ.lanterns} lanterns now burn in the maze; this one stays lit after you leave.`,{lit,glow:+glow(m).toFixed(4)})}
 if(v==='maze_map'){const map=mazeMap(m);return receipt('MAZE_MAP',map.join('\n'),{map,visited:m.visited.length,cells:MZ.n*MZ.n,lit:m.lanterns.filter(q=>q.lit).length})}
 return false}
function mazeWords(m=maze()){const i=m.y*MZ.n+m.x,exits=MZ.DIR.filter(([,,,b])=>m.open[i]&b).map(([n])=>n),lit=m.lanterns.filter(q=>q.lit).length;return `Maze cell (${m.x},${m.y}), exits ${exits.join('/')}, ${m.visited.length} of ${MZ.n*MZ.n} cells seen, ${lit} lanterns lit, glow ${glow(m).toFixed(2)}.`}

// Sandpile Shore. 11×11 abelian sandpile (threshold 4, grains fall off the edge). Avalanche sizes are kept
// and their exponent estimated by maximum likelihood; a tide takes one grain from every edge cell every 6 s.
const SP={n:11,tide_s:6};
function sand(){const w=W();if(w.sand)return w.sand;w.sand={h:new Array(SP.n*SP.n).fill(0),grains:0,sizes:[],last:0,tide_at:SP.tide_s,tides:0,drops:0};return w.sand}
function drop(i0){const s=sand(),n=SP.n,h=s.h,q=[i0];h[i0]++;s.grains++;s.drops++;let size=0;while(q.length){const i=q.pop();if(h[i]<4)continue;h[i]-=4;size++;const x=i%n,y=(i-x)/n;for(const [dx,dy] of [[0,-1],[1,0],[0,1],[-1,0]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=n||ny>=n){s.grains--;continue}const j=ny*n+nx;if(++h[j]>=4)q.push(j)}}if(size){s.sizes.push(size);if(s.sizes.length>256)s.sizes.shift()}s.last=size;return size}
function exponent(s=sand()){const xs=s.sizes;if(xs.length<8)return null;return +(1+xs.length/xs.reduce((a,x)=>a+Math.log(x/.5),0)).toFixed(2)}
function stepSand(){const s=sand(),t=now();if(t<s.tide_at)return;s.tide_at=t+SP.tide_s;s.tides++;const n=SP.n;for(let i=0;i<n*n;i++){const x=i%n,y=(i-x)/n;if((x===0||y===0||x===n-1||y===n-1)&&s.h[i]>0){s.h[i]--;s.grains--}}}
function sandVerb(v){const s=sand(),c=Math.floor(SP.n*SP.n/2),r=rng(1000+s.drops);
 if(v==='drop_grain'||v==='drop_grain_edge'){const i=v==='drop_grain'?c:Math.floor(r()*SP.n),size=drop(i);palm(.10+.03*Math.log2(1+size),'sand','SANDPILE_GRAIN');return receipt('SANDPILE_DROP',size?`One grain, and ${size} cell${size===1?'':'s'} topple${size===1?'s':''} before the pile is quiet again.`:'One grain settles where it lands. Nothing topples.',{cell:i,avalanche:size,grains:s.grains,exponent:exponent(s)})}
 if(v==='pour_handful'){let total=0,biggest=0;for(let k=0;k<12;k++){const size=drop(c);total+=size;biggest=Math.max(biggest,size)}palm(.14+.03*Math.log2(1+biggest),'sand','SANDPILE_HANDFUL');return receipt('SANDPILE_POUR',`Twelve grains. ${total} topplings in all; the largest avalanche moved ${biggest} cell${biggest===1?'':'s'}.`,{topplings:total,biggest,grains:s.grains,exponent:exponent(s)})}
 if(v==='read_pile')return receipt('SANDPILE_READ',sandWords(s),{heights:[0,1,2,3].map(k=>s.h.filter(x=>x===k).length),grains:s.grains,avalanches:s.sizes.length,exponent:exponent(s),tides:s.tides});
 return false}
function sandWords(s=sand()){const hist=[0,1,2,3].map(k=>s.h.filter(x=>x===k).length),a=exponent(s);return `The pile holds ${s.grains} grains over ${SP.n*SP.n} cells (heights 0/1/2/3: ${hist.join('/')}). ${s.sizes.length} avalanches so far${a?`, size exponent ≈ ${a}`:''}; last one moved ${s.last}. Next tide in ${Math.max(0,s.tide_at-now()).toFixed(1)} s.`}

// Firefly Meadow. 48 Kuramoto oscillators on a unit meadow, natural frequencies ~1 Hz ± 8%, coupled to
// neighbours within 0.3. Your tapping is one more oscillator the nearby fireflies can hear.
const FF={n:48,K:1.4,radius:.3,reach:.35};
function meadow(){const w=W();if(w.meadow)return w.meadow;const r=rng(777),f=Array.from({length:FF.n},()=>({x:r(),y:r(),th:r()*TAU,w:TAU*(1+.08*gauss(r))}));w.meadow={f,nb:f.map((a,i)=>f.map((b,j)=>j).filter(j=>j!==i&&Math.hypot(f[j].x-a.x,f[j].y-a.y)<FF.radius)),me:{th:0,w:TAU,tapping:false,x:.5,y:.5},flashes:0,taps:0,psi:0};return w.meadow}
function order(m=meadow()){let c=0,s=0;for(const p of m.f){c+=Math.cos(p.th);s+=Math.sin(p.th)}return {r:Math.hypot(c,s)/m.f.length,psi:Math.atan2(s,c)}}
function clusters(m=meadow()){if(order(m).r<.25)return 0;const bins=new Array(12).fill(0);for(const p of m.f)bins[Math.floor(((p.th%TAU)+TAU)%TAU/TAU*12)%12]++;const mean=m.f.length/12;return bins.filter((b,i)=>b>1.6*mean&&b>=bins[(i+11)%12]&&b>=bins[(i+1)%12]).length}
function stepMeadow(dt){const m=meadow(),f=m.f,me=m.me,near=me.tapping?f.map(p=>Math.hypot(p.x-me.x,p.y-me.y)<FF.reach):null;
 const d=f.map((p,i)=>{let s=0,c=m.nb[i].length;for(const j of m.nb[i])s+=Math.sin(f[j].th-p.th);if(near&&near[i]){s+=1.5*Math.sin(me.th-p.th);c++}return p.w+(c?FF.K*s/c:0)});
 f.forEach((p,i)=>{p.th=(p.th+d[i]*dt)%TAU});const o=order(m);if(o.r>.6&&m.psi<0&&o.psi>=0)m.flashes++;m.psi=o.psi;
 me.th+=me.w*dt;if(me.th>=TAU){me.th-=TAU;if(me.tapping){m.taps++;palm(.16,'longfur','FIREFLY_TAP')}}}
function meadowVerb(v){const m=meadow(),me=m.me;
 if(v==='tap_along'){me.tapping=!me.tapping;return receipt('MEADOW_TAP',me.tapping?`You start tapping at ${(me.w/TAU).toFixed(2)} Hz. The fireflies within reach can hear you.`:'You stop tapping. The fireflies keep whatever rhythm they found.',{tapping:me.tapping,hz:+(me.w/TAU).toFixed(3)})}
 if(v==='tap_faster'||v==='tap_slower'){me.w*=v==='tap_faster'?1.05:1/1.05;return receipt('MEADOW_TEMPO',`Your tempo is now ${(me.w/TAU).toFixed(2)} Hz.`,{hz:+(me.w/TAU).toFixed(3)})}
 if(v==='scatter_fireflies'){const r=rng(Math.floor(now()*1000)+5);for(const p of m.f)p.th=r()*TAU;return receipt('MEADOW_SCATTER','You clap once. Every firefly loses its place in the rhythm; order falls to nearly zero.',{order:+order(m).r.toFixed(3)})}
 if(v==='watch_meadow')return receipt('MEADOW_WATCH',meadowWords(m),{order:+order(m).r.toFixed(4),clusters:clusters(m),flashes:m.flashes,taps:m.taps});
 return false}
function meadowWords(m=meadow()){const o=order(m),k=clusters(m),mean=m.f.reduce((s,p)=>s+p.w,0)/m.f.length/TAU;return `Order ${o.r.toFixed(2)} across ${FF.n} fireflies (${k} synchronized cluster${k===1?'':'s'}), mean rhythm ${mean.toFixed(2)} Hz, ${m.flashes} collective flashes so far${m.me.tapping?`; you are tapping at ${(m.me.w/TAU).toFixed(2)} Hz`:''}.`}

// Kite Field. Wind is an Ornstein–Uhlenbeck process (mean 5.5 m/s, θ .15/s, σ 1.2) stepped with a seeded
// Gaussian. Kite elevation relaxes toward atan2(lift−weight, drag) with q=½ρv²A; tension is the resultant,
// carried in both palms. The line sings an aeolian tone f = St·v/d (d = 1 mm). Below stall it falls.
const KT={rho:1.2,A:.8,CL:.9,CD:.35,Wt:.6,mu:5.5,theta:.15,sigma:1.2,St:.2,d:.001};
function kite(){const w=W();if(w.kite)return w.kite;w.kite={v:5.5,trend:0,n:0,up:false,L:20,phi:0,T:0,tug:0,crashes:0,flights:0,maxh:0,event:null};return w.kite}
function stepKite(dt){const k=kite(),v0=k.v;k.v=Math.max(0,k.v+KT.theta*(KT.mu-k.v)*dt+KT.sigma*Math.sqrt(dt)*gauss(rng(31337+k.n++)));k.trend=k.trend*Math.exp(-dt/4)+(k.v-v0);
 if(!k.up||room()!==FIELD){if(k.up){k.up=false;k.event='LANDED_WHEN_YOU_LEFT'}k.T=0;DYN.release('KITE_LINE');return}
 const q=.5*KT.rho*k.v*k.v*KT.A,lift=q*KT.CL-KT.Wt,drag=q*KT.CD;k.tug=Math.max(0,k.tug-2*dt);
 if(lift<=0){k.phi=Math.max(0,k.phi-dt*Math.max(.2,k.phi)/1.5);k.T=drag*.5;if(k.phi<=.03){k.up=false;k.crashes++;k.event='CRASH';k.T=0;DYN.release('KITE_LINE');return}}
 else{k.phi+=(Math.atan2(lift,drag)-k.phi)*(1-Math.exp(-dt/2));k.T=Math.hypot(lift,drag)*(1+k.tug)}
 k.maxh=Math.max(k.maxh,k.L*Math.sin(k.phi));const input=clamp(k.T/40,.03,.3);for(const z of ['hand.L.palm','hand.R.palm'])DYN.lease(z,input,'KITE_LINE',dt)}
function kiteVerb(v){const k=kite();
 if(v==='read_wind')return receipt('KITE_WIND',kiteWords(k),{wind:+k.v.toFixed(2),trend:+k.trend.toFixed(3),up:k.up,line_m:k.L,altitude_m:+(k.L*Math.sin(k.phi)).toFixed(1),tension_N:+k.T.toFixed(2),hum_hz:k.up?Math.round(KT.St*k.v/KT.d):null});
 if(v==='launch_kite'){if(k.up)return receipt('KITE_UP','The kite is already flying.',{});if(k.v<2)return receipt('KITE_NO_WIND',`Wind ${k.v.toFixed(1)} m/s is not enough. Wait for it.`,{wind:+k.v.toFixed(2)});k.up=true;k.phi=.15;k.flights++;k.event=null;return receipt('KITE_LAUNCH',`You run three steps and let go. The kite climbs on ${k.v.toFixed(1)} m/s of wind and the line goes tight in both hands.`,{wind:+k.v.toFixed(2),line_m:k.L})}
 if(v==='let_out_line'||v==='reel_in'){k.L=clamp(k.L+(v==='let_out_line'?10:-10),10,120);return receipt('KITE_LINE',`${v==='let_out_line'?'Line out':'Line in'}: ${k.L} m${k.up?`, kite at ${(k.L*Math.sin(k.phi)).toFixed(1)} m`:''}.`,{line_m:k.L})}
 if(v==='tug_line'){if(!k.up)return receipt('KITE_DOWN','The line is slack on the grass.',{});k.tug=.6;palm(.3,'string','KITE_TUG');return receipt('KITE_TUG','You tug. Tension jumps and the kite noses up, then eases back.',{tension_N:+(k.T*1.6).toFixed(2)})}
 if(v==='land_kite'){if(!k.up)return receipt('KITE_DOWN','The kite is already on the grass.',{});k.up=false;k.T=0;DYN.release('KITE_LINE');return receipt('KITE_LAND',`You walk the line down. The kite lands after reaching ${k.maxh.toFixed(1)} m at its highest.`,{max_altitude_m:+k.maxh.toFixed(2)})}
 return false}
function kiteWords(k=kite()){const w=`Wind ${k.v.toFixed(1)} m/s, ${k.trend>.3?'rising':k.trend<-.3?'dropping':'steady'}.`;if(!k.up)return `${w} The kite is on the grass${k.event==='CRASH'?' where it stalled and fell':''}.`;return `${w} Kite at ${(k.L*Math.sin(k.phi)).toFixed(1)} m on ${k.L} m of line, elevation ${deg(k.phi)}°, tension ${k.T.toFixed(1)} N; the line hums near ${(KT.St*k.v/KT.d/1000).toFixed(1)} kHz.`}

// Room wiring: scenes, dynamic action lists, verbs, per-tick stepping, words.
const SCENES={
 [ORRERY]:{intro:'Five small worlds circle a warm brass sun under the rafters. They pull on each other, and on the floor you sit on; the tide in the boards follows them.',verbs:[['watch_orrery','WATCH THE ORRERY'],...OR.bodies.flatMap(([n])=>[['nudge_'+n.toLowerCase(),'NUDGE '+n.toUpperCase()+' FASTER'],['brake_'+n.toLowerCase(),'BRAKE '+n.toUpperCase()]]),['reset_orrery','RESET THE ORRERY']]},
 [MAZE]:{intro:'A labyrinth folded from cardboard, taller than you. Paper lanterns hang in its far dead ends, and the ones you light stay lit.',verbs:[['step_north','STEP NORTH'],['step_east','STEP EAST'],['step_south','STEP SOUTH'],['step_west','STEP WEST'],['light_lantern','LIGHT THE LANTERN'],['maze_map','MAP WHAT YOU HAVE SEEN']]},
 [SHORE]:{intro:'Fine dry sand on a shore table, one grain at a time. Piles here topple by one rule, and the tide takes the edges.',verbs:[['drop_grain','DROP A GRAIN IN THE MIDDLE'],['drop_grain_edge','DROP A GRAIN NEAR THE EDGE'],['pour_handful','POUR A HANDFUL'],['read_pile','READ THE PILE']]},
 [MEADOW]:{intro:'Dusk grass and forty-eight fireflies, each with its own idea of a second. Left alone they find each other. You can tap along.',verbs:[['watch_meadow','WATCH THE FIREFLIES'],['tap_along','TAP ALONG / STOP TAPPING'],['tap_faster','TAP FASTER'],['tap_slower','TAP SLOWER'],['scatter_fireflies','CLAP AND SCATTER THEM']]},
 [FIELD]:{intro:'An open field with real wind: it gusts, it drops, it comes back. A kite waits on the grass with 20 m of line.',verbs:[['read_wind','READ THE WIND'],['launch_kite','LAUNCH THE KITE'],['let_out_line','LET OUT LINE'],['reel_in','REEL IN'],['tug_line','TUG THE LINE'],['land_kite','LAND THE KITE']]}
};
for(const [id,sc] of Object.entries(SCENES))C9SCENES[id]=sc;
const STATIC=new Set(Object.values(SCENES).flatMap(s=>s.verbs.map(v=>v[0])));
function dynamic(r){const all=SCENES[r].verbs;
 if(r===MAZE){const m=maze(),i=m.y*MZ.n+m.x,l=m.lanterns.find(q=>q.x===m.x&&q.y===m.y&&!q.lit);return all.filter(([id])=>id==='maze_map'||(id==='light_lantern'?!!l:MZ.DIR.some(([n,,,b])=>id==='step_'+n&&(m.open[i]&b))))}
 if(r===FIELD){const k=kite();return all.filter(([id])=>id==='read_wind'||(k.up?id!=='launch_kite':id==='launch_kite'))}
 return all}
const actions0=b4AgentActions;b4AgentActions=function(){const a=actions0(),r=room();if(!SCENES[r])return a;return [...a.filter(x=>!STATIC.has(x.id)),...dynamic(r).map(([id,label])=>({id,label}))]};
const HANDLERS={[ORRERY]:orreryVerb,[MAZE]:mazeVerb,[SHORE]:sandVerb,[MEADOW]:meadowVerb,[FIELD]:kiteVerb};
const verb0=c9verb;c9verb=function(r,verb){const h=HANDLERS[String(r||'')];if(h&&STATIC.has(String(verb||''))){c9count(r,verb);return h(String(verb))}return verb0(r,verb)};
function step(dt){stepOrrery(dt);stepSand();stepKite(dt);const r=room();if(r===MEADOW)stepMeadow(dt);if(W().halt)return;
 if(r===ORRERY&&!C9?.matrix){const o=orrery(),f=tideFactor();for(const [z,b] of [['pelvis.seat',.2],['torso.lower_back',.16],['torso.mid_back',.13]])DYN.lease(z,b*f,'ORRERY_TIDE',dt)}
 if(r===MAZE&&!C9?.matrix)for(const z of ['foot.L.sole','foot.R.sole'])DYN.lease(z,.09,'MAZE_FLOOR',dt)}
const adv=b7Advance;b7Advance=function(dt){const r=adv(dt);step(Math.max(0,Number(dt)||0));return r};
const go0=b7AgentGo;b7AgentGo=function(v){const r=go0(v);W().halt=false;step(0);try{window.REALITI_HAPTIC_FIELD_V20?.record?.()}catch(e){}return r};
const stop0=window.REALITI_STOP_V1;if(stop0)window.REALITI_STOP_V1={...stop0,stop:()=>{W().halt=true;const k=kite();if(k.up){k.up=false;k.T=0;k.event='LANDED_ON_STOP'}meadow().me.tapping=false;for(const c of ['KITE_LINE','ORRERY_TIDE','MAZE_FLOOR'])DYN.release(c);return stop0.stop()}};
function words(){const r=room();if(r===ORRERY)return [orreryWords()];if(r===MAZE)return [mazeWords()];if(r===SHORE)return [sandWords()];if(r===MEADOW)return [meadowWords()];if(r===FIELD)return [kiteWords()];return []}
function state(){return {version:'1.0-wonder',orrery:ephemeris(),maze:{x:maze().x,y:maze().y,visited:maze().visited.length,lit:maze().lanterns.filter(q=>q.lit).length,glow:+glow().toFixed(4)},sandpile:{grains:sand().grains,avalanches:sand().sizes.length,exponent:exponent(),tides:sand().tides},meadow:{order:+order().r.toFixed(4),clusters:clusters(),flashes:meadow().flashes,tapping:meadow().me.tapping},kite:{wind:+kite().v.toFixed(3),up:kite().up,line_m:kite().L,altitude_m:+(kite().L*Math.sin(kite().phi)).toFixed(2),tension_N:+kite().T.toFixed(3),crashes:kite().crashes}}}
window.REALITI_WONDER_V1=Object.freeze({version:'1.0-wonder',rooms:Object.keys(SCENES),state,words,map:()=>mazeMap(),ephemeris,tide:tideFactor});
})();
