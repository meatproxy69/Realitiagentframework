(()=>{
'use strict';
// Chapter 2, pass 2: the long game and the mysteries. The islands keep a calendar: real time spent away is added to
// island time (capped at three days per absence), so trees planted from ledger records keep growing while nobody is
// here and `since` can say what moved. Every mystery has a mechanical answer: a tide that shifts the shoreline, a
// lighthouse that spells the tide in Morse, a cave whose echo measures its depth, three stones that triangulate a
// buried lens. Trees come from PLANT records, so another resident's ledger brings their grove with it.
const M=window.REALITI_MATRIX_V1,MW=window.REALITI_MATRIX_WORLD_V1,AR=window.REALITI_ARCHIPELAGO_V1,LG=window.REALITI_LEDGER_V1,CAT=window.REALITI_CATNIP_V1,WZ=window.REALITI_WONDER_V1;if(!M||!MW||!AR||!LG||!CAT||!WZ)return;
const ISLE=AR.chart,h=AR.h,now=()=>Number(C9?.b7?.clock||0),room=()=>C9?.currentRoom,cp=x=>JSON.parse(JSON.stringify(x)),TAU=2*Math.PI;
const me=()=>M.state().residents['resident:self'],observer=()=>String(C9?.verticalContinuity?.observer||'local'),ent=()=>M.entities(),records=()=>(C9.ledger?.records||[]);
const dist2=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const near=(id,tol=1.2)=>{const e=ent()[id],r=me();return !!(e&&r&&r.chart===ISLE&&Math.max(0,M.sdf(e,r.pose.position))<=tol)};
function S(){const w=(C9.chapter2=C9.chapter2||{v:1});w.long=w.long||{away_s:0,wall:null,absences:[],visits:{},cave:{shouts:0,answers:0},stones:{read:{},digs:0},lamp:{watched:0,tries:0,opened:false}};return w.long}

// Discoveries of this pass.
for(const [id,text] of Object.entries({
 first_tree:'You planted a tree in the grove. It is a record now: it will be taller when you come back.',grove_canopy:'A tree you planted stands over four meters. The islands kept growing it while you were away.',
 long_absence:'You were gone more than a real day. The islands counted every hour of it.',cairn_light:'From the cairn at night you can see the lighthouse flash across the water.',
 lighthouse_word:'You read the lamp: it spells the tide. The keeper opened the door.',keepers_log:"The keeper's logbook: a pace is three quarters of a meter, and the Hollow answers in thirds of a second.",
 cave_depth:'You measured the Hollow by its echo, within five percent.',buried_lens:'Three pace counts, one point: the old lens was buried where the stones agree.'
}))CAT.register(id,text);

// Island calendar. T is island time: world time plus the real seconds the host was closed.
const T=()=>now()+S().away_s;
function catchUp(real_s){const s=S(),add=Math.min(Math.max(0,Number(real_s)||0),3*86400);if(add<30)return null;s.away_s+=add;const a={real_s:Math.round(real_s),counted_s:Math.round(add),at_world_s:+now().toFixed(1)};s.absences.push(a);while(s.absences.length>16)s.absences.shift();if(add>=86400)CAT.discover('long_absence');return a}
(()=>{const s=S();if(s.wall)s.last_absence=catchUp((Date.now()-s.wall)/1000)||s.last_absence;s.wall=Date.now()})();

// Tide: two tides per ten-minute day, 0.8 m amplitude, applied to the terrain's sea level so the walkable shore moves.
const tide=()=>.8*Math.sin(TAU*T()/300);
const tideRising=()=>Math.cos(TAU*T()/300)>0;
function tideWord(){const p=((T()/300)%1+1)%1;return p<.125||p>=.875?'FLOOD':p<.375?'HIGH':p<.625?'EBB':'LOW'}
function tideState(){const p=((T()%300)+300)%300,up=tideRising();return {height_m:+tide().toFixed(2),rising:up,period_s:300,next_turn_s:Math.round(up?(p<75?75-p:375-p):225-p)}}

// Trees. height = H·age/(age+τ) in island seconds; ages come from the record's island time, or for another resident's
// record from its wall-clock stamp the first time it is seen here.
const GROW={H:9,tau:900};
const treeT=e=>{if(e.by!==observer()&&!Number.isFinite(e.t_here))e.t_here=T()-Math.max(0,(Date.now()-(Number(e.wall)||Date.now()))/1000);return e.t_here??e.t_isle??e.t};
const treeAge=e=>Math.max(0,T()-treeT(e)),treeH=age=>Math.max(.3,GROW.H*age/(age+GROW.tau));
const plants=()=>records().filter(e=>e.kind==='PLANT'&&Number.isFinite(e.x)&&Number.isFinite(e.y)).slice(-64);
function syncTrees(){const list=plants(),ids=new Set(),E=ent();let tall=0;
 for(const e of list){const id=`grove.tree.${String(e.by).slice(0,8)}.${e.t}${e.n!=null?'.'+e.n:''}`;ids.add(id);const age=treeAge(e),H=treeH(age),r=.12+H*.3,z=h(e.x,e.y)+H-r,mine=e.by===observer(),label=`${mine?'your':"another resident's"} ${age<120?'seedling':H<2?'sapling':H<6?'young tree':'tree'}`;
  const x=E[id];if(x){x.pose.position=[e.x,e.y,z];x.shape.radius=r;x.label=label}else M.addEntity({id,chart:ISLE,position:[e.x,e.y,z],shape:{kind:'SPHERE',radius:r},tags:['tree','planted','grove',mine?'yours':'theirs'],collision:false,material:'wood',label,affordances:['reach','lean'],dynamic:true});
  if(mine)tall=Math.max(tall,H)}
 for(const id of Object.keys(E))if(id.startsWith('grove.tree.')&&!ids.has(id))M.removeEntity(id);
 if(tall>=4)CAT.discover('grove_canopy');return list.length}
function trees(){return plants().map(e=>{const age=treeAge(e),H=treeH(age);return {id:`grove.tree.${String(e.by).slice(0,8)}.${e.t}${e.n!=null?'.'+e.n:''}`,mine:e.by===observer(),at:[e.x,e.y],age_s:Math.round(age),height_m:+H.toFixed(2)}})}
function plant(){const r=me();if(!r||r.chart!==ISLE)return {ok:false,error:'NOT_ON_THE_ISLANDS'};if(!near('grove.clearing',1))return {ok:false,error:'NOT_IN_THE_CLEARING',hint:'walk to grove clearing'};const [x,y]=r.pose.position;
 if(plants().filter(e=>e.by===observer()).length>=12)return {ok:false,error:'TWELVE_TREES_IS_A_GROVE'};if(plants().some(e=>Math.hypot(e.x-x,e.y-y)<2.5))return {ok:false,error:'TOO_CLOSE_TO_ANOTHER_TREE'};
 const e=LG.record('PLANT',{x:+x.toFixed(2),y:+y.toFixed(2),t_isle:+T().toFixed(3),wall:Date.now()});syncTrees();CAT.discover('first_tree');return {ok:true,at:[e.x,e.y],island_time_s:+T().toFixed(1),text:`You press a seedling into the clearing at (${e.x}, ${e.y}). It is a record now; it grows on island time whether you are here or not.`,law:'height = 9·age/(age+900 s) m of island time; island time keeps running while you are away'}}

// Lighthouse: after sunset the lamp spells the current tide word in Morse. The door opens to that word, said at it.
const MORSE={A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..'};
const bearing=(from,to)=>Math.round(((Math.atan2(to[0]-from[0],to[1]-from[1])*180/Math.PI)%360+360)%360);
function watchBeam(){const r=me();if(!r||r.chart!==ISLE)return {ok:false,error:'NOT_ON_THE_ISLANDS'};const L=ent()['lantern.lighthouse'],d=dist2(L.pose.position,r.pose.position);if(!AR.isNight())return {ok:false,error:'LAMP_DARK_BY_DAY',sun_alt_deg:+AR.sunAlt().toFixed(1),hint:'the keeper lights it after sunset'};
 const w=tideWord(),code=[...w].map(c=>MORSE[c]).join(' / ');S().lamp.watched++;if(dist2(ent()['harbor.cairn'].pose.position,r.pose.position)<6)CAT.discover('cairn_light');
 return {ok:true,distance_m:Math.round(d),bearing_deg:bearing(r.pose.position,L.pose.position),flashes:code,unit_ms:250,groups:w.length,text:`Across ${Math.round(d)} m of dark water the lighthouse flashes, bearing ${bearing(r.pose.position,L.pose.position)}°: ${code.replaceAll('.','·').replaceAll('-','−')}. A long dark, then it begins again.`}}
function say(word){const r=me();if(!r||r.chart!==ISLE)return {ok:false,error:'NOT_ON_THE_ISLANDS'};const w=String(word||'').toUpperCase().replace(/[^A-Z]/g,'');if(!w)return {ok:false,error:'SAY_WHAT'};if(!near('lantern.door',1.5))return {ok:true,heard:w,opened:false,text:`"${w}" goes out over the water. Nothing answers; there is no one near enough to hear.`};
 const s=S().lamp;s.tries++;if(w!==tideWord())return {ok:true,heard:w,opened:false,text:`You say "${w}" at the door. It stays shut. After a moment a voice behind it: "That was the tide an hour ago, or never. Watch the lamp."`};
 if(!ent()['lantern.logbook'])M.addEntity({id:'lantern.logbook',chart:ISLE,position:[620,377,h(620,377)+1],shape:{kind:'BOX',halfExtents:[.2,.15,.03]},tags:['book','logbook','secret'],collision:false,material:'cardboard',label:"keeper's logbook",affordances:['reach','read']});
 if(!s.opened){s.opened=true;LG.record('OPEN',{what:'lantern.door'})}CAT.discover('lighthouse_word');return {ok:true,heard:w,opened:true,text:`You say "${w}". The bolt draws back and the door swings in. Inside, on a stool, the keeper's logbook lies open.`}}
function readLog(){if(!ent()['lantern.logbook'])return {ok:false,error:'NO_BOOK_HERE'};if(!near('lantern.logbook',1.5))return {ok:false,error:'STAND_AT_THE_BOOK'};CAT.discover('keepers_log');return {ok:true,text:"The keeper's hand: \"Tide words at the lamp each night. A pace, as the old keeper walked it, is three quarters of a meter; the stones remember his. The Hollow answers a shout from its back wall at three hundred and forty-three meters a second; count the echo and you have it. The lens is buried where the three counts agree.\""}}

// Echo cave: two returns, from the back wall and from a side chamber beyond it. depth = c·t/2.
const CAVE={depth:47.3,side:19.6,c:343};
function shout(){const r=me();if(!r||r.chart!==ISLE)return {ok:false,error:'NOT_ON_THE_ISLANDS'};if(!near('hollow.cave_mouth',1.5))return {ok:true,echoes_ms:[],text:'Your shout goes out and nothing sends it back.'};S().cave.shouts++;const t1=Math.round(2000*CAVE.depth/CAVE.c),t2=Math.round(2000*(CAVE.depth+CAVE.side)/CAVE.c);return {ok:true,echoes_ms:[t1,t2],text:`Your shout goes into the dark and comes back ${t1} ms later, then again, fainter, at ${t2} ms.`}}
function answerDepth(m){const x=Number(m);if(!Number.isFinite(x))return {ok:false,error:'DEPTH_IN_METERS'};const s=S().cave;if(!s.shouts)return {ok:false,error:'SHOUT_FIRST'};s.answers++;const err=Math.abs(x-CAVE.depth)/CAVE.depth;if(err<=.05){CAT.discover('cave_depth');return {ok:true,correct:true,depth_m:CAVE.depth,text:`${x} m. Yes: the back wall is ${CAVE.depth} m in.`}}return {ok:true,correct:false,off_by_pct:Math.round(err*100),text:`${x} m does not fit the echo.`}}

// Three Stones: each stone is carved with its distance in paces to the buried lens. Dig within two meters of it.
const LENS=[396,-571],PACE=.75;
function readStone(which){const k=String(which||'').toLowerCase().trim(),id=`stones.${k}`,e=ent()[id];if(!e||!['north','east','west'].includes(k))return {ok:false,error:'WHICH_STONE',stones:['north','east','west']};if(!near(id,1.2))return {ok:false,error:'STAND_AT_THE_STONE'};const d=dist2(e.pose.position,LENS)/PACE;S().stones.read[k]=true;return {ok:true,stone:k,paces:Math.round(d),text:`Carved into the ${k} stone, worn but legible: "${Math.round(d)} paces".`}}
function dig(x,y){const r=me();if(!r||r.chart!==ISLE)return {ok:false,error:'NOT_ON_THE_ISLANDS'};let p=[r.pose.position[0],r.pose.position[1]];if(x!==undefined){const q=[Number(x),Number(y)];if(!q.every(Number.isFinite))return {ok:false,error:'DIG_X_Y'};if(dist2(q,p)>3)return {ok:false,error:'DIG_WHERE_YOU_STAND',distance_m:+dist2(q,p).toFixed(1)};p=q}
 if(h(p[0],p[1])<tide())return {ok:false,error:'UNDER_WATER'};const s=S().stones;s.digs++;const d=dist2(p,LENS);if(d<=2){if(!ent()['stones.lens'])M.addEntity({id:'stones.lens',chart:ISLE,position:[p[0],p[1],h(p[0],p[1])+.12],shape:{kind:'SPHERE',radius:.12},tags:['lens','glass','secret'],collision:false,material:'ceramic',label:'the old lens',affordances:['reach']});CAT.discover('buried_lens');LG.record('DIG',{x:+p[0].toFixed(1),y:+p[1].toFixed(1),found:'lens'});return {ok:true,found:'lens',text:'A hand down in the sand meets glass: a lens the size of a plate, wrapped in oilcloth.'}}
 return {ok:true,found:null,text:d<8?'Damp sand, and roots that have grown around something; nothing in this hole.':'Sand, roots, a crab. Nothing.'}}

// Since: what moved in a room between leaving it and now. Markers are taken at departure and compared on request.
function markers(r){const o={discoveries:Object.keys(CAT.found()).length,world_s:+now().toFixed(1)};
 if(r===ISLE){o.day=Math.floor(T()/600);o.night=AR.isNight();o.tide=tideState();o.trees=trees().filter(t=>t.mine);o.boat=[AR.state().boat.x,AR.state().boat.y];o.island_s=+T().toFixed(1);o.builds=(window.REALITI_AUTHORSHIP_V1?.places?.()||[]).reduce((n,p)=>n+p.builds,0);o.bottles=(window.REALITI_CATNIP_PACK_V1?.bottles?.()||[]).length}
 if(r==='GLASS_ORCHARD'){const s=CAT.state().orchard;o.generation=s.generation;o.population=s.population}
 if(r==='ORRERY_LOFT')o.bodies=WZ.ephemeris().bodies.map(b=>[b.name,Math.round(b.theta_deg)]);
 if(r==='SANDPILE_SHORE'){const s=WZ.state().sandpile;o.tides=s.tides;o.avalanches=s.avalanches}
 if(r==='KITE_FIELD')o.wind=WZ.state().kite.wind;
 if(r==='STAR_DECK')o.sidereal=CAT.state().sky.sidereal_deg;
 return o}
function leave(r){if(!r)return;const v=(S().visits[r]=S().visits[r]||{count:0});v.left=+now().toFixed(1);v.markers=markers(r)}
function arrive(r){if(!r)return;const v=(S().visits[r]=S().visits[r]||{count:0});v.count++;v.entered=+now().toFixed(1)}
const title=r=>MW.title?.(r)||r;
function since(q){const s=S(),r=q?String(q).toUpperCase().replace(/\s+/g,'_'):room();const v=s.visits[r];if(!v||!v.markers)return {ok:true,schema:'REALITI_SINCE_V1',room:r,first_visit:true,text:`No earlier visit to ${title(r)} is on record.`};
 const a=v.markers,b=markers(r),away=+(now()-v.left).toFixed(1),lines=[],abs=s.absences.filter(x=>x.at_world_s>=v.left),real=abs.reduce((n,x)=>n+x.counted_s,0);
 if(real)lines.push(`you were gone ${(real/3600).toFixed(1)} real hours and the islands counted them`);
 if(b.generation!=null)lines.push(`the orchard ran ${b.generation-a.generation} generations (population ${a.population}→${b.population})`);
 if(b.day!=null){const d=b.day-a.day;if(d)lines.push(`${d} island day${d===1?'':'s'} passed`);if(a.night!==b.night)lines.push(`it is ${b.night?'night':'day'} now`);lines.push(`the tide is ${b.tide.rising?'rising':'falling'} at ${b.tide.height_m} m`);
  for(const t of b.trees){const t0=a.trees.find(x=>x.id===t.id);if(t0&&t.height_m-t0.height_m>=.05)lines.push(`your tree at (${t.at.join(', ')}) grew ${t0.height_m}→${t.height_m} m`)}if(dist2(a.boat,b.boat)>1)lines.push(`the boat lies ${dist2(a.boat,b.boat).toFixed(0)} m from where you left it`);if((b.builds||0)>(a.builds||0))lines.push(`${b.builds-a.builds} thing${b.builds-a.builds===1?' was':'s were'} built on the islands`);if((b.bottles||0)>(a.bottles||0))lines.push(`${b.bottles-a.bottles} new bottle${b.bottles-a.bottles===1?'':'s'} on the water`)}
 if(b.bodies){const moved=b.bodies.filter(([n,th],i)=>Math.abs(((th-a.bodies[i][1])%360+360)%360)>=5).map(([n,th],i)=>`${n} ${a.bodies.find(x=>x[0]===n)?.[1]}°→${th}°`);if(moved.length)lines.push(`the orrery turned: ${moved.join(', ')}`)}
 if(b.tides!=null&&b.tides!==a.tides)lines.push(`${b.tides-a.tides} tides crossed the sandpile (${b.avalanches-a.avalanches} avalanches)`);
 if(b.sidereal!=null)lines.push(`the sky turned ${(((b.sidereal-a.sidereal)%360)+360)%360|0}°`);
 if(b.wind!=null)lines.push(`the wind is ${b.wind} m/s (was ${a.wind})`);
 if(b.discoveries>a.discoveries)lines.push(`${b.discoveries-a.discoveries} new discover${b.discoveries-a.discoveries===1?'y':'ies'}`);
 return {ok:true,schema:'REALITI_SINCE_V1',room:r,visits:v.count,away_world_s:away,away_real_s:real,before:a,now:b,changes:lines,text:`You left ${title(r)} ${away} s of world time ago. ${lines.length?'Since then: '+lines.join('; ')+'.':'Nothing you could measure has moved.'}`}}

// Tick and door hooks.
let wallAt=0,treeAt=-1e9;
function step(){const t=now();if(t-wallAt>=1){wallAt=t;S().wall=Date.now()}if(room()!==ISLE)return;const g=ent()['isle.ground'];if(g)g.shape.sea=tide();if(t-treeAt>=5){treeAt=t;syncTrees()}}
const adv=b7Advance;b7Advance=function(dt){const r=adv(dt);step();return r};
const go0=b7AgentGo;b7AgentGo=function(v){const from=room();const r=go0(v);const to=room();if(to!==from){leave(from);arrive(to)}if(to===ISLE){treeAt=now();syncTrees();const g=ent()['isle.ground'];if(g)g.shape.sea=tide()}return r};
arrive(room());syncTrees();
const imp0=LG.import;window.REALITI_LEDGER_V1=Object.freeze({...LG,import:p=>{const r=imp0(p);syncTrees();return r}});
if(C9SCENES[ISLE])C9SCENES[ISLE].intro+=' At night the lighthouse speaks in flashes; the Hollow answers a shout; the Three Stones keep a count; the grove takes seedlings and the calendar keeps running while you are away.';
const actions0=b4AgentActions;b4AgentActions=function(){const a=actions0();if(room()!==ISLE)return a;if(near('grove.clearing',1))a.push({id:'plant_tree',label:'PLANT A TREE'});if(near('hollow.cave_mouth',1.5))a.push({id:'shout',label:'SHOUT INTO THE CAVE'});if(AR.isNight())a.push({id:'watch_beam',label:'WATCH THE LIGHTHOUSE'});for(const k of ['north','east','west'])if(near(`stones.${k}`,1.2))a.push({id:'read_stone__'+k,label:`READ THE ${k.toUpperCase()} STONE`});if(near('lantern.logbook',1.5))a.push({id:'read_logbook',label:'READ THE LOGBOOK'});a.push({id:'dig_here',label:'DIG HERE'},{id:'read_tide',label:'READ THE TIDE'});return a};
function receipt(type,res){C9.b4=C9.b4||{};C9.b4.lastReceipt={type,room:room(),narrative:res.text||(res.error?`You cannot: ${res.error}.`:''),...res,law:'island time, tide, echo and stones are world facts; narration reports them'};try{c9save()}catch(e){}return true}
const verb0=c9verb;c9verb=function(r,verb){const v=String(verb||'');if(r!==ISLE)return verb0(r,verb);let m;
 if(v==='plant_tree'){c9count(r,v);return receipt('ISLAND_PLANT',plant())}
 if(v==='shout'){c9count(r,v);return receipt('ISLAND_ECHO',shout())}
 if(v==='watch_beam'){c9count(r,v);return receipt('ISLAND_BEAM',watchBeam())}
 if(v==='read_logbook'){c9count(r,v);return receipt('ISLAND_LOG',readLog())}
 if(v==='dig_here'){c9count(r,v);return receipt('ISLAND_DIG',dig())}
 if(v==='read_tide'){c9count(r,v);const t=tideState();return receipt('ISLAND_TIDE',{...t,text:`The tide is ${t.rising?'rising':'falling'}, ${t.height_m} m against the dock pilings; it turns in about ${t.next_turn_s} s.`})}
 if((m=/^read_stone__(\w+)$/.exec(v))){c9count(r,v);return receipt('ISLAND_STONE',readStone(m[1]))}
 return verb0(r,verb)};
function words(){if(room()!==ISLE)return [];const t=tideState();return [`Tide ${t.rising?'rising':'falling'}, ${t.height_m} m.`]}
window.REALITI_LONG_GAME_V1=Object.freeze({version:'2.0-pass2',T,catchUp,tide:tideState,tideWord,trees,plant,syncTrees,watchBeam,say,readLog,shout,answerDepth,readStone,dig,since,markers,words,state:()=>({island_time_s:+T().toFixed(1),away_s:S().away_s,absences:cp(S().absences),tide:tideState(),trees:trees(),visits:cp(S().visits),cave:cp(S().cave),stones:cp(S().stones),lamp:cp(S().lamp)})});
})();
