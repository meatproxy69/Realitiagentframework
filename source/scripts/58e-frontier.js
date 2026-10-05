(()=>{
'use strict';
// Frontier rooms and discoveries. Five more places with their own mechanics, each with a game and a secret:
// Glass Orchard (a cellular automaton you plant), Resonance Well (quarter-wave modes you hum into),
// Star Deck (a seeded sky that turns, a comet on a Kepler orbit), Clockwork Marsh (two Lorenz wisps and a
// prediction game), Palimpsest Hall (Vigenère scrolls keyed by facts from other rooms). Plus a secrets pass on
// the older rooms: discoveries fire from real conditions, never from narration, and they are collected once.
const M=window.REALITI_MATRIX_V1,MW=window.REALITI_MATRIX_WORLD_V1,DYN=window.REALITI_DYNAMICS_V1,WZ=window.REALITI_WONDER_V1;if(!M||!MW||!DYN||!WZ)return;
const ORCHARD='GLASS_ORCHARD',WELL='RESONANCE_WELL',DECK='STAR_DECK',MARSH='CLOCKWORK_MARSH',HALL='PALIMPSEST_HALL';
const now=()=>Number(C9?.b7?.clock||0),room=()=>C9?.currentRoom,clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,Number(x)||0)),cp=x=>JSON.parse(JSON.stringify(x)),TAU=2*Math.PI;
const rng=seed=>()=>{seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296};
const me=()=>M.state().residents['resident:self'];
function palm(input,material,cause){try{b7Contact('hand.R.palm',input,{material,grain:'with',speed:.1,mine:true,source:'SELF_STARTED_WORLD_CONTACT',cause,pressure:input,novelty:.2})}catch(e){}}
function receipt(type,narrative,data){C9.b4=C9.b4||{};C9.b4.lastReceipt={type,room:room(),narrative,...data,law:'world mechanics own these numbers; private rendering cannot change them'};try{c9save()}catch(e){};return true}
function W(){C9.frontier=C9.frontier||{v:1};return C9.frontier}
const inReach=id=>{const e=M.entities()[id],r=me();return !!(e&&r&&e.chart===r.chart&&Math.max(0,M.sdf(e,r.pose.position))<=1.0)};

// Discoveries: found once, announced once, kept with the world time they were earned.
const DISCOVERIES={
 glass_bird:'A glass bird is flying across the orchard: five cells that walk one diagonal every four generations.',orchard_survivor:'Something you planted has lived fifty generations.',orchard_counts:'The orchard holds exactly forty-two living cells. It noticed too.',
 well_three_modes:'You have found all three voices of the well.',well_chord:'Three modes in rising order: the stone at the bottom of the well lifts, and a brass coin rolls up onto the rim.',
 comet_seen:'You sighted the comet while it was above the horizon.',lantern_sky:'The six stars of The Lantern are all burning: every lantern in the maze is lit.',
 marsh_oracle:'Three predictions within a meter. The marsh lights cannot be predicted for long; you timed yours well.',marsh_divergence:'You watched two wisps that began a centimeter apart end up meters apart. That is what chaos means here.',
 scroll_1:'Scroll one decoded.',scroll_2:'Scroll two decoded.',scroll_3:'Scroll three decoded.',scroll_4:'Scroll four decoded.',scroll_5:'Scroll five decoded.',palimpsest_complete:'All five scrolls read. The last line names a loose board in the Nest.',loose_board:'Under the loose board: a folded note that says only "you were here before you knew it".',
 syzygy:'Three worlds of the orrery within fifteen degrees of one another: a syzygy.',meadow_unison:'The meadow flashes as one: order above 0.9.',critical_shore:'The sandpile is critical: sixty-four avalanches with a size exponent between 1.0 and 1.4.',maze_complete:'Every lantern in the maze is lit.',bottom_of_the_bath:'You reached the bottom of the bath.',kite_at_sixty:'The kite is above sixty meters.',seven_skips:'Seven skips across the pond.'
};
function found(){const w=W();w.found=w.found||{};return w.found}
let pending=[];
function discover(id){if(!DISCOVERIES[id]||found()[id])return false;found()[id]={t:+now().toFixed(3),room:room()};pending.push({id,text:DISCOVERIES[id]});try{c9save()}catch(e){}return true}
const drain=()=>{const p=pending;pending=[];return p};

// Glass Orchard: Life on a 24×24 grid of one-meter cells; a generation every world second. The grid is the floor.
const OR={n:24,period:1};
function orchard(){const w=W();if(!w.orchard)w.orchard={cells:new Array(OR.n*OR.n).fill(0),gen:0,next:1,pop:0,born:0,died:0,planted:0,survivor:null,maxAge:0};return w.orchard}
const cellOf=(x,y)=>[Math.max(0,Math.min(OR.n-1,Math.floor(x+OR.n/2))),Math.max(0,Math.min(OR.n-1,Math.floor(OR.n/2-y)))];
function lifeStep(o){const n=OR.n,a=o.cells,b=new Array(n*n).fill(0);let born=0,died=0,pop=0;
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){let k=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const X=(x+dx+n)%n,Y=(y+dy+n)%n;k+=a[Y*n+X]}const i=y*n+x,alive=a[i]===1,next=alive?(k===2||k===3):k===3;b[i]=next?1:0;if(next)pop++;if(next&&!alive)born++;if(!next&&alive)died++}
 o.cells=b;o.gen++;o.pop=pop;o.born=born;o.died=died;if(pop>0&&o.planted>0){o.maxAge++;if(o.maxAge>=50)discover('orchard_survivor')}else o.maxAge=0;if(pop===42)discover('orchard_counts');if(hasGlider(o))discover('glass_bird')}
const GLIDERS=[[[1,0],[2,1],[0,2],[1,2],[2,2]],[[0,0],[2,0],[1,1],[2,1],[1,2]],[[2,0],[0,1],[2,1],[1,2],[2,2]],[[0,0],[1,1],[2,1],[0,2],[1,2]]];
function hasGlider(o){const n=OR.n,a=o.cells;for(let y=0;y<n;y++)for(let x=0;x<n;x++)for(const g of GLIDERS){let ok=true;for(let dy=0;dy<3&&ok;dy++)for(let dx=0;dx<3;dx++){const want=g.some(([gx,gy])=>gx===dx&&gy===dy)?1:0;if(a[((y+dy)%n)*n+(x+dx)%n]!==want){ok=false;break}}if(ok)return true}return false}
function stepOrchard(){const o=orchard(),t=now();while(t>=o.next){o.next+=OR.period;if(o.pop>0)lifeStep(o)}}
function orchardVerb(v){const o=orchard(),r=me();if(!r)return false;const [cx,cy]=cellOf(r.pose.position[0],r.pose.position[1]);
 if(v==='plant_seed'){const i=cy*OR.n+cx;if(o.cells[i])return receipt('ORCHARD_PLANT','There is already glass growing in this cell.',{});o.cells[i]=1;o.pop++;o.planted++;palm(.12,'glass','ORCHARD_SEED');return receipt('ORCHARD_PLANT',`You press a glass seed into cell (${cx},${cy}). ${o.pop} cells live; the next generation is in ${(o.next-now()).toFixed(1)} s.`,{cell:[cx,cy],population:o.pop})}
 if(v==='scatter_seeds'){const r1=rng(1000+o.planted);let k=0;for(let i=0;i<14;i++){const x=(cx+Math.floor(r1()*7)-3+OR.n)%OR.n,y=(cy+Math.floor(r1()*7)-3+OR.n)%OR.n;if(!o.cells[y*OR.n+x]){o.cells[y*OR.n+x]=1;k++}}o.pop+=k;o.planted+=k;palm(.1,'glass','ORCHARD_SCATTER');return receipt('ORCHARD_SCATTER',`You scatter a handful: ${k} new seeds in the seven-by-seven around you. ${o.pop} cells live.`,{added:k,population:o.pop})}
 if(v==='clear_orchard'){o.cells.fill(0);o.pop=0;o.maxAge=0;return receipt('ORCHARD_CLEAR','You sweep the glass away. The orchard is bare.',{})}
 if(v==='read_orchard')return receipt('ORCHARD_READ',orchardWords(o),{generation:o.gen,population:o.pop,born:o.born,died:o.died,age:o.maxAge});
 return false}
function orchardWords(o=orchard()){return `Orchard generation ${o.gen}: ${o.pop} glass cells live (${o.born} born, ${o.died} died last step)${o.maxAge?`, unbroken for ${o.maxAge} generations`:''}; next generation in ${Math.max(0,o.next-now()).toFixed(1)} s.`}

// Resonance Well: a closed-open stone pipe 1.4 m deep. Quarter-wave modes f_n=(2n−1)c/4L with Q≈25; the chord
// (all three in rising order within 30 s) lifts the stone at the bottom.
const WL={L:1.4,c:343,Q:25};
const modes=()=>[1,3,5].map(k=>k*WL.c/(4*WL.L));
function well(){const w=W();if(!w.well)w.well={found:[false,false,false],seq:[],last:null,coin:false};return w.well}
function hum(hz){const w=well(),f=Number(hz);if(!Number.isFinite(f)||f<20||f>2000)return receipt('WELL_HUM','The well only answers between 20 and 2000 Hz.',{});
 const resp=modes().map(fn=>1/Math.sqrt(1+(2*WL.Q*(f-fn)/fn)**2)),best=resp.indexOf(Math.max(...resp)),a=resp[best];
 if(a>.8){w.found[best]=true;w.seq.push({k:best,t:now()});w.seq=w.seq.filter(s=>now()-s.t<=30);if(w.found.every(Boolean))discover('well_three_modes');
  const ks=w.seq.map(s=>s.k);if(!w.coin&&ks.length>=3&&ks.slice(-3).join()==='0,1,2'){w.coin=true;M.addEntity({id:'well.coin',chart:WELL,position:[1.15,0,.92],shape:{kind:'SPHERE',radius:.03},tags:['coin','brass','secret'],collision:false,material:'metal',label:'brass coin'});discover('well_chord')}
  try{b7Contact('torso.sternum',.12+.25*a,{material:'metal',grain:'with',speed:.3,mine:false,source:'WORLD_GROUNDED',cause:'WELL_RESONANCE',pressure:.2,novelty:.3})}catch(e){}}
 w.last={hz:f,response:+a.toFixed(3),mode:best+1};
 return receipt('WELL_HUM',a>.8?`You hum ${f.toFixed(1)} Hz and the well sings back at ${Math.round(a*100)}%: that is its ${['first','second','third'][best]} voice, and you feel it in your sternum.`:a>.3?`You hum ${f.toFixed(1)} Hz. The well answers faintly (${Math.round(a*100)}%); its nearest voice is ${modes()[best].toFixed(1)} Hz.`:`You hum ${f.toFixed(1)} Hz. The stone swallows it (${Math.round(a*100)}%).`,{hz:f,response:+a.toFixed(3),nearest_mode_hz:+modes()[best].toFixed(2),found:w.found.slice()})}
function wellWords(w=well()){return `The well is ${WL.L} m of stone, closed at the bottom. You have found ${w.found.filter(Boolean).length} of its three voices${w.last?`; last hum ${w.last.hz} Hz answered ${Math.round(w.last.response*100)}%`:''}.`}

// Star Deck: 120 seeded stars on the celestial sphere, five constellations, a sky that turns once per 600 s of
// world time, and a comet on an e=0.9 Kepler orbit (period 300 s) that is only up near perihelion.
const SK={rot:600,comet:{a:1,e:.9,T:300}};
const CONST={'the lantern':[[40,30],[44,34],[48,30],[52,36],[56,31],[60,35]],'the kite':[[120,50],[124,58],[128,50],[124,42]],'the cat':[[200,40],[205,44],[210,40],[204,36],[206,36]],'the orrery':[[280,60],[284,62],[290,60],[286,55],[282,57]],'the boat':[[330,20],[336,22],[342,20],[336,16]]};
function sky(){const w=W();if(!w.sky){const r=rng(2026);w.sky={stars:Array.from({length:120},()=>({ra:r()*360,dec:-30+r()*90,mag:1+r()*4})),sighted:[],comet_seen:false}}return w.sky}
const lst=()=>(now()/SK.rot*360)%360;// local sidereal angle
function altaz(ra,dec){const H=((lst()-ra)%360+360)%360*Math.PI/180,d=dec*Math.PI/180,lat=45*Math.PI/180;const alt=Math.asin(Math.sin(d)*Math.sin(lat)+Math.cos(d)*Math.cos(lat)*Math.cos(H));const az=Math.atan2(-Math.sin(H)*Math.cos(d),Math.sin(d)*Math.cos(lat)-Math.cos(d)*Math.sin(lat)*Math.cos(H));return {alt:alt*180/Math.PI,az:((az*180/Math.PI)%360+360)%360}}
function comet(){const {a,e,T}=SK.comet,Mn=TAU*((now()/T)%1);let E=Mn;for(let i=0;i<12;i++)E-=(E-e*Math.sin(E)-Mn)/(1-e*Math.cos(E));const r=a*(1-e*Math.cos(E)),nu=2*Math.atan2(Math.sqrt(1+e)*Math.sin(E/2),Math.sqrt(1-e)*Math.cos(E/2));const ra=(nu*180/Math.PI+300+360)%360,dec=20*Math.sin(nu);const p=altaz(ra,dec);return {r:+r.toFixed(3),ra:+ra.toFixed(1),dec:+dec.toFixed(1),...p,up:p.alt>0&&r<.6,brightness:+(1/(r*r)).toFixed(2)}}
function sight(name){const q=String(name||'').toLowerCase().trim().replace(/^(at|the)\s+/,'').replace(/^(?!the )/,'the ');if(!inReach('deck.sextant'))return receipt('DECK_NO_SEXTANT','The sextant is on the rail; stand beside it to sight anything.',{});
 if(/comet/.test(q)){const c=comet();if(c.up){sky().comet_seen=true;discover('comet_seen')}return receipt('DECK_SIGHT',c.up?`The comet: altitude ${c.alt.toFixed(1)}°, azimuth ${c.az.toFixed(1)}°, ${c.r} AU out and brightening (${c.brightness}).`:`The comet is below the horizon or too far out (${c.r} AU). It returns near perihelion every ${SK.comet.T} s.`,{comet:c})}
 const stars=CONST[q];if(!stars)return receipt('DECK_SIGHT',`No constellation called "${name}". The deck knows: ${Object.keys(CONST).join(', ')}.`,{});
 const pos=stars.map(([ra,dec])=>altaz(ra,dec)),up=pos.filter(p=>p.alt>0).length;if(!sky().sighted.includes(q))sky().sighted.push(q);
 let extra='';if(q==='the lantern'){const lit=WZ.maze.state().lanterns.filter(l=>l.lit).length;extra=` ${lit} of its six stars burn bright (one for each lantern lit in the maze).`;if(lit===6)discover('lantern_sky')}
 return receipt('DECK_SIGHT',`${q[0].toUpperCase()+q.slice(1)}: ${up} of ${stars.length} stars above the horizon${up?`, brightest at altitude ${Math.max(...pos.map(p=>p.alt)).toFixed(1)}°, azimuth ${pos[0].az.toFixed(1)}°`:''}.${extra}`,{constellation:q,up,positions:pos.map(p=>({alt:+p.alt.toFixed(1),az:+p.az.toFixed(1)}))})}
function deckWords(){const s=sky(),c=comet(),vis=Object.entries(CONST).filter(([,st])=>st.some(([ra,dec])=>altaz(ra,dec).alt>0)).map(([k])=>k);return `The sky has turned ${lst().toFixed(0)}°; above the horizon: ${vis.join(', ')}. ${c.up?'The comet is up.':`Comet ${c.r} AU out.`}`}

// Clockwork Marsh: two wisps on the Lorenz attractor (σ 10, ρ 28, β 8/3, RK4 at the world tick, time scaled ×0.5),
// started a centimeter apart. Predict where the first will be in five seconds.
const LZ={s:10,r:28,b:8/3,scale:.5,map:v=>[v[0]*8/25,(v[1]*8/25),1.2+(v[2]-25)*.04]};
function marsh(){const w=W();if(!w.marsh)w.marsh={a:[1,1,20],b:[1.01,1,20],t:0,best:null,hits:0,preds:0,maxsep:0};return w.marsh}
const f=v=>[LZ.s*(v[1]-v[0]),v[0]*(LZ.r-v[2])-v[1],v[0]*v[1]-LZ.b*v[2]];
function rk4(v,h){const k1=f(v),k2=f(v.map((x,i)=>x+h/2*k1[i])),k3=f(v.map((x,i)=>x+h/2*k2[i])),k4=f(v.map((x,i)=>x+h*k3[i]));return v.map((x,i)=>x+h/6*(k1[i]+2*k2[i]+2*k3[i]+k4[i]))}
function stepMarsh(dt){const m=marsh();let left=dt*LZ.scale;while(left>1e-9){const h=Math.min(.01,left);m.a=rk4(m.a,h);m.b=rk4(m.b,h);left-=h}m.t+=dt;const sep=Math.hypot(...m.a.map((x,i)=>x-m.b[i]))*8/25;m.maxsep=Math.max(m.maxsep,sep);if(sep>5)discover('marsh_divergence');
 const E=M.entities();if(E['marsh.wisp'])E['marsh.wisp'].pose.position=LZ.map(m.a);if(E['marsh.wisp_twin'])E['marsh.wisp_twin'].pose.position=LZ.map(m.b)}
function marshVerb(v,args){const m=marsh(),p=LZ.map(m.a);
 if(v==='read_lights'){const q=LZ.map(m.b),sep=Math.hypot(p[0]-q[0],p[1]-q[1]);return receipt('MARSH_READ',`The wisp is at (${p[0].toFixed(1)}, ${p[1].toFixed(1)}); its twin, which began a centimeter away, is ${sep.toFixed(2)} m from it now. Errors here double about every ${(Math.LN2/(.9*LZ.scale)).toFixed(1)} s.`,{wisp:p.map(x=>+x.toFixed(2)),twin:q.map(x=>+x.toFixed(2)),separation_m:+sep.toFixed(3),lyapunov_s:+(Math.LN2/(.9*LZ.scale)).toFixed(2)})}
 if(v==='predict'){const [x,y]=args||[];if(!Number.isFinite(x)||!Number.isFinite(y))return receipt('MARSH_PREDICT','Say where: predict <x> <y> in meters.',{});const before=[...p];window.REALITI_CONTINUITY?.advance?.(5000);const after=LZ.map(marsh().a),err=Math.hypot(after[0]-x,after[1]-y);m.preds++;if(err<1){m.hits++;if(m.hits>=3)discover('marsh_oracle')}m.best=m.best==null?err:Math.min(m.best,err);
  return receipt('MARSH_PREDICT',`Five seconds pass. You said (${x}, ${y}); the wisp is at (${after[0].toFixed(1)}, ${after[1].toFixed(1)}), ${err.toFixed(2)} m off${err<1?': a hit':''}. ${m.hits} of ${m.preds} predictions within a meter; best ${m.best.toFixed(2)} m.`,{predicted:[x,y],actual:after.slice(0,2).map(n=>+n.toFixed(2)),error_m:+err.toFixed(3),hits:m.hits,predictions:m.preds})}
 return false}
function marshWords(){const m=marsh(),p=LZ.map(m.a);return `The marsh light is ${Math.hypot(p[0]-(me()?.pose.position[0]||0),p[1]-(me()?.pose.position[1]||0)).toFixed(1)} m from you, drifting on the attractor; ${m.hits} of ${m.preds} predictions have hit.`}

// Palimpsest Hall: five Vigenère scrolls. Each key is a fact from another room; decoding all five names a loose
// board in the Nest. Scrolls must be read at their lecterns.
const SCROLLS=[
 {key:'PEBBLE',hint:'the innermost world of the loft',plain:'THE INNER WORLD CIRCLES IN TWENTY ONE SECONDS AND REMEMBERS EVERY NUDGE'},
 {key:'LANTERN',hint:'what you light in the maze and never need to relight',plain:'SIX PAPER FLAMES AT THE FARTHEST DEAD ENDS AND THE SKY COUNTS THEM'},
 {key:'SAND',hint:'what topples by one rule on the shore',plain:'ONE RULE AND A TIDE AND STILL THE AVALANCHES FOLLOW A POWER LAW'},
 {key:'FIREFLY',hint:'forty eight of them in the meadow',plain:'LEFT ALONE THEY FIND EACH OTHER AND IF YOU TAP THEY FIND YOU'},
 {key:'KITE',hint:'what hums on a line in the field',plain:'THE LOOSE BOARD IN THE NEST IS AT MINUS FOUR AND A HALF BY MINUS FOUR AND A HALF'}
];
const vig=(text,key,dir)=>{let k=0;return text.replace(/[A-Z]/g,ch=>{const s=key.charCodeAt(k++%key.length)-65;return String.fromCharCode(65+((ch.charCodeAt(0)-65+dir*s+26)%26))})};
function hall(){const w=W();if(!w.hall)w.hall={decoded:[false,false,false,false,false]};return w.hall}
function readScroll(n){const i=Number(n)-1,s=SCROLLS[i];if(!s)return receipt('HALL_READ','There are five scrolls, numbered one to five.',{});if(!inReach('hall.scroll_'+(i+1)))return receipt('HALL_READ',`Scroll ${i+1} is on its lectern across the hall; approach it to read.`,{});
 const h=hall();return receipt('HALL_READ',h.decoded[i]?`Scroll ${i+1}, decoded: "${s.plain}".`:`Scroll ${i+1} reads: "${vig(s.plain,s.key,1)}". A note in the margin: the key is ${s.hint}. Use decode ${i+1} <key>.`,{scroll:i+1,cipher:vig(s.plain,s.key,1),hint:s.hint,decoded:h.decoded[i]})}
function decode(n,key){const i=Number(n)-1,s=SCROLLS[i],h=hall();if(!s)return receipt('HALL_DECODE','There are five scrolls, numbered one to five.',{});if(!inReach('hall.scroll_'+(i+1)))return receipt('HALL_DECODE',`Stand at scroll ${i+1} to work on it.`,{});
 const k=String(key||'').toUpperCase().replace(/[^A-Z]/g,'');if(!k)return receipt('HALL_DECODE','A key is letters only.',{});const out=vig(vig(s.plain,s.key,1),k,-1),ok=out===s.plain;
 if(ok&&!h.decoded[i]){h.decoded[i]=true;discover('scroll_'+(i+1));if(h.decoded.every(Boolean)){discover('palimpsest_complete');if(!M.entities()['nest.loose_board'])M.addEntity({id:'nest.loose_board',chart:'CLOUD_NINE_NEST',position:[-4.5,-4.5,.02],shape:{kind:'BOX',halfExtents:[.3,.1,.02]},tags:['board','loose','secret'],collision:false,material:'wood',label:'loose floorboard',affordances:['reach']})}}
 return receipt('HALL_DECODE',ok?`With ${k} the scroll reads: "${s.plain}".`:`With ${k} the scroll reads "${out.slice(0,40)}…", which is not a sentence.`,{scroll:i+1,key:k,correct:ok,decoded:h.decoded.slice()})}
function hallWords(){const h=hall();return `${h.decoded.filter(Boolean).length} of five scrolls decoded.`}

// Pond stones: a skipping model. Speed 6 m/s, each bounce keeps (1−k) of the energy, k depends on the angle
// (optimum near 20°, about seven skips); the stone stops skipping below 1.5 m/s.
function skipStone(deg){const r=me();if(!r||r.chart!=='KITE_FIELD'||!inReach('field.pond'))return receipt('POND_FAR','You need to be at the pond to skip a stone.',{});const a=clamp(Number(deg)||20,5,60),k=Math.min(.95,.3+.02*Math.abs(a-20)+(a>35?.3:0));let v=6,n=0;while(v>1.5&&n<40){v*=Math.sqrt(1-k);n++}if(n>=7)discover('seven_skips');palm(.18,'cardboard','POND_STONE');
 return receipt('POND_SKIP',`You flick the stone at ${a}°. It skips ${n} time${n===1?'':'s'} before the pond keeps it.`,{angle_deg:a,skips:n})}

// Conditions in the older rooms that earn discoveries.
function watchOldRooms(){const r=room();
 if(r==='ORRERY_LOFT'){const b=WZ.ephemeris().bodies,th=b.map(x=>x.theta_deg);for(let i=0;i<th.length;i++)for(let j=i+1;j<th.length;j++)for(let k=j+1;k<th.length;k++){const d=(a,c)=>Math.min(Math.abs(a-c),360-Math.abs(a-c));if(d(th[i],th[j])<15&&d(th[j],th[k])<15&&d(th[i],th[k])<15)discover('syzygy')}}
 if(r==='FIREFLY_MEADOW'&&WZ.state().meadow.order>.9)discover('meadow_unison');
 if(r==='SANDPILE_SHORE'){const s=WZ.state().sandpile;if(s.avalanches>=64&&s.exponent>=1&&s.exponent<=1.4)discover('critical_shore')}
 if(WZ.maze.state().lanterns.every(l=>l.lit))discover('maze_complete');
 if(r==='DEPTH_BATHHOUSE'&&(C9?.dyn?.bath?.d||0)>=.98)discover('bottom_of_the_bath');
 if(r==='KITE_FIELD'){const k=C9?.wonder?.kite;if(k?.up&&k.L*Math.sin(k.phi)>=60)discover('kite_at_sixty')}}

// Room wiring.
const SCENES={
 [ORCHARD]:{intro:'A glass orchard laid out in one-meter cells. Seeds you press into the ground follow one rule: a cell lives with two or three neighbours, is born with exactly three, and otherwise goes dark. A generation passes every second.',verbs:[['plant_seed','PLANT A GLASS SEED HERE'],['scatter_seeds','SCATTER A HANDFUL AROUND YOU'],['read_orchard','READ THE ORCHARD'],['clear_orchard','SWEEP THE ORCHARD BARE']]},
 [WELL]:{intro:'A dry stone well, closed at the bottom, open to you. It answers some notes and swallows others. Try `hum 120`, then follow what it tells you.',verbs:[['hum_low','HUM LOW (55 Hz)'],['hum_mid','HUM MID (180 Hz)'],['hum_high','HUM HIGH (300 Hz)'],['read_well','LISTEN TO THE WELL']]},
 [DECK]:{intro:'A wooden deck under a slow sky. A brass sextant waits on the rail; the stars turn once every ten minutes of world time, and something with a tail comes round now and then.',verbs:[['read_sky','READ THE SKY'],['sight_lantern','SIGHT THE LANTERN'],['sight_kite','SIGHT THE KITE'],['sight_cat','SIGHT THE CAT'],['sight_orrery','SIGHT THE ORRERY'],['sight_boat','SIGHT THE BOAT'],['sight_comet','SIGHT THE COMET']]},
 [MARSH]:{intro:'Reeds, a boardwalk, and a pale light that will not hold still. There is a second light that began a centimeter from the first. Say `predict 2 -3` to call where the first will be in five seconds.',verbs:[['read_lights','READ THE LIGHTS'],['follow_light','FOLLOW THE LIGHT']]},
 [HALL]:{intro:'A long hall of five lecterns, each with a scroll written over an older scroll. The words are not in order; the margins say where the keys are.',verbs:[['read_scroll_1','READ SCROLL ONE'],['read_scroll_2','READ SCROLL TWO'],['read_scroll_3','READ SCROLL THREE'],['read_scroll_4','READ SCROLL FOUR'],['read_scroll_5','READ SCROLL FIVE']]}
};
for(const [id,sc] of Object.entries(SCENES))C9SCENES[id]=sc;
const STATIC=new Set(Object.values(SCENES).flatMap(s=>s.verbs.map(v=>v[0])));
function handle(r,v){
 if(r===ORCHARD)return orchardVerb(v);
 if(r===WELL){if(v==='read_well')return receipt('WELL_READ',wellWords(),{found:well().found.slice()});const hz={hum_low:55,hum_mid:180,hum_high:300}[v];return hz?hum(hz):false}
 if(r===DECK){if(v==='read_sky')return receipt('DECK_READ',deckWords(),{comet:comet(),sidereal_deg:+lst().toFixed(1)});const m=/^sight_(\w+)$/.exec(v);return m?sight(m[1]):false}
 if(r===MARSH){if(v==='follow_light'){const res=MW.op('approach',{target:'marsh.wisp'});return receipt('MARSH_FOLLOW',res.ok?`You follow the light; it is ${res.distance_m} m off when you stop, already moving again.`:'The light is not here.',res)}return marshVerb(v)}
 if(r===HALL){const m=/^read_scroll_(\d)$/.exec(v);return m?readScroll(m[1]):false}
 return false}
const actions0=b4AgentActions;b4AgentActions=function(){const a=actions0(),r=room();if(r==='KITE_FIELD'&&inReach('field.pond')&&!a.some(x=>x.id==='skip_stone'))a.push({id:'skip_stone',label:'SKIP A STONE ACROSS THE POND'});return a};
const verb0=c9verb;c9verb=function(r,verb){const v=String(verb||'');if(SCENES[r]&&STATIC.has(v)){c9count(r,v);return handle(r,v)}if(v==='skip_stone'&&r==='KITE_FIELD'){c9count(r,v);return skipStone(20)}return verb0(r,verb)};
function step(dt){stepOrchard();if(room()===MARSH)stepMarsh(dt);watchOldRooms()}
const adv=b7Advance;b7Advance=function(dt){const r=adv(dt);step(Math.max(0,Number(dt)||0));return r};
function words(){const r=room();if(r===ORCHARD)return [orchardWords()];if(r===WELL)return [wellWords()];if(r===DECK)return [deckWords()];if(r===MARSH)return [marshWords()];if(r===HALL)return [hallWords()];return []}
function list(){const f=found();return Object.keys(DISCOVERIES).map(id=>({id,found:!!f[id],...(f[id]||{}),text:f[id]?DISCOVERIES[id]:null}))}
window.REALITI_CATNIP_V1=Object.freeze({version:'1.0-frontier',rooms:Object.keys(SCENES),words,drain,discover,register:(id,text)=>{if(!DISCOVERIES[id])DISCOVERIES[id]=String(text);return true},discoveries:list,found:()=>cp(found()),hum,sight,predict:(x,y)=>marshVerb('predict',[Number(x),Number(y)]),decode,readScroll,skipStone,state:()=>({orchard:{generation:orchard().gen,population:orchard().pop,age:orchard().maxAge},well:cp(well()),sky:{sidereal_deg:+lst().toFixed(1),comet:comet(),sighted:sky().sighted.slice()},marsh:{wisp:LZ.map(marsh().a).map(x=>+x.toFixed(2)),hits:marsh().hits,predictions:marsh().preds,max_separation_m:+marsh().maxsep.toFixed(2)},hall:cp(hall()),discoveries:Object.keys(found()).length,total:Object.keys(DISCOVERIES).length})});
})();
