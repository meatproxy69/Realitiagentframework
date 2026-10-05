(()=>{
'use strict';
// Chapter 4, pass 1: senses as fields. Sound, light and smell are computed from the MATRIX world, not written as prose.
// Sound: sources at 1 m levels, inverse-square falloff, one SDF ray cast for occlusion, Sabine reverberation per chart,
// levels summed in power. Light: the shared sun (altitude from the island clock, azimuth east to west over the day)
// with a ray cast for shadow, or the room's lamps. Smell: the steady state of ∂c/∂t = D∇²c − u·∇c − c/τ around each
// source, a plume stretched downwind. Strong sound, sun and wind reach the body through the Halo and the thermal law,
// as private rendering and thermal contact; nothing here mints grounded support.
const M=window.REALITI_MATRIX_V1,MW=window.REALITI_MATRIX_WORLD_V1,DYN=window.REALITI_DYNAMICS_V1,WZ=window.REALITI_WONDER_V1,AR=window.REALITI_ARCHIPELAGO_V1,LGM=window.REALITI_LONG_GAME_V1,CT=window.REALITI_CITY_V1,ATM=window.REALITI_ATMOSPHERE_V21,HALO=window.REALITI_HALO_V1;if(!M||!MW||!DYN||!WZ||!AR||!LGM||!CT||!ATM)return;
const now=()=>Number(C9?.b7?.clock||0),room=()=>C9?.currentRoom,cp=x=>JSON.parse(JSON.stringify(x)),TAU=2*Math.PI,T=LGM.T,clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,Number(x)||0));
const me=()=>M.state().residents['resident:self'],ent=()=>M.entities(),records=()=>(C9.ledger?.records||[]),ISLE=AR.chart,CITY=CT.chart,NEST='CLOUD_NINE_NEST';
const OUTDOORS=new Set([ISLE,CITY,'KITE_FIELD','FIREFLY_MEADOW','SANDPILE_SHORE','STAR_DECK']);
const dB=p=>10*Math.log10(Math.max(1e-12,p)),pw=L=>Math.pow(10,L/10);
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
const head=r=>[r.pose.position[0],r.pose.position[1],r.pose.position[2]+r.shape.height/2-.1];
function dirWord(r,p){const f=M.facing(r),d=[p[0]-r.pose.position[0],p[1]-r.pose.position[1]];const ang=Math.atan2(f[0]*d[1]-f[1]*d[0],f[0]*d[0]+f[1]*d[1])*180/Math.PI,a=((ang%360)+360)%360;return a<22.5||a>=337.5?'ahead':a<67.5?'ahead-left':a<112.5?'left':a<157.5?'behind-left':a<202.5?'behind':a<247.5?'behind-right':a<292.5?'right':'ahead-right'}
function S(){const w=(C9.chapter2=C9.chapter2||{v:1});w.senses=w.senses||{terse:false,last:null};return w.senses}
// Fields are pure functions of (world time, pose, chart); memoized per half-second and half-meter so ticks and reads share one evaluation.
const memo=new Map();let memoKey='';
function cached(name,fn){const r=me();const k=`${Math.floor(now()*2)}|${r?.chart}|${r?Math.round(r.pose.position[0]*2)+','+Math.round(r.pose.position[1]*2)+','+Math.round(r.pose.position[2]*2):''}`;if(k!==memoKey){memo.clear();memoKey=k}if(memo.has(name))return memo.get(name);const v=fn();memo.set(name,v);return v}

// The shared sky. Sunrise at island time 600n − 57.3 s in the east, sunset at 600n + 242.7 s in the west.
const sunAlt=()=>AR.sunAlt();
function sunAz(){const p=(((T()+57.3)%600)+600)%600/300;return p<=1?90+180*p:(270+180*(p-1))%360}
const sunDir=()=>{const a=sunAlt()*Math.PI/180,z=sunAz()*Math.PI/180;return [Math.sin(z)*Math.cos(a),Math.cos(z)*Math.cos(a),Math.sin(a)]};
function wind(){const r=room();if(r===ISLE)return AR.wind();if(OUTDOORS.has(r)){const w=AR.wind();return {speed:+(w.speed*.5).toFixed(2),dir:w.dir,deg:w.deg}}return {speed:0,dir:[0,1],deg:0}}
function rainHere(){const r=me();if(!r)return 0;if(room()===ISLE)return AR.rain(r.pose.position[0],r.pose.position[1]);if(room()===NEST)return Number(DYN.state().rain||0);return 0}

// Sources. pos: an entity id or a function of the resident. sound: level at 1 m in dB, or 0. light: candela, or 0.
// smell: {label, S} with S in [0,1]. bass marks sources whose energy is felt in the chest.
const posOf=(src,r)=>typeof src.pos==='function'?src.pos(r):ent()[src.pos]?.pose?.position||null;
const shoreCache=new Map();const shore=r=>{const key=`${Math.round(r.pose.position[0]/5)},${Math.round(r.pose.position[1]/5)},${Math.round(LGM.tide().height_m*5)}`;if(shoreCache.has(key))return shoreCache.get(key);if(shoreCache.size>512)shoreCache.clear();const v=shoreRaw(r);shoreCache.set(key,v);return v};const shoreRaw=r=>{let best=null;for(let k=0;k<24;k++){const a=k*TAU/24;for(let d=4;d<=400;d+=4){const x=r.pose.position[0]+Math.cos(a)*d,y=r.pose.position[1]+Math.sin(a)*d;if(AR.h(x,y)<LGM.tide().height_m-.2){if(!best||d<best.d)best={d,p:[x,y,AR.h(x,y)+1.2]};break}}}return best?.p||null};
const chatting=()=>{const t=Date.now();return records().filter(e=>e.kind==='CHAT'&&e.wall&&t-e.wall<600e3&&e.venue&&CT.venues[e.venue]).map(e=>e.venue)};
const SOURCES=[
 {id:'rain_window',chart:NEST,pos:'nest.window',label:'rain on the window',sound:()=>{const q=rainHere();return q>.02?38+16*q:0},smell:{label:'wet glass and cold air',S:()=>rainHere()*.6}},
 {id:'cat',chart:NEST,pos:'nest.cat',label:'the cat',sound:()=>28,smell:{label:'warm fur',S:()=>.35}},
 {id:'tea_shelf',chart:NEST,pos:'nest.shelf',label:'the tea shelf',sound:()=>0,smell:{label:'dry tea leaves',S:()=>.3}},
 {id:'fountain',chart:CITY,pos:'commons.fountain',label:'the fountain',sound:()=>64,smell:{label:'wet stone',S:()=>.6}},
 {id:'speaker',chart:CITY,pos:'dancehall.speaker',label:'the speaker stack',bass:true,sound:()=>(C9.chapter2?.city?.dance?.on?96:80)},
 {id:'teahouse',chart:CITY,pos:'teahouse.counter',label:'the teahouse counter',sound:()=>44,smell:{label:'tea and toasted grain',S:()=>.8}},
 {id:'crowd',chart:CITY,pos:r=>{const v=chatting();if(!v.length)return null;const c=CT.venues[v[v.length-1]].at;return [c[0],c[1],1.2]},label:'voices',sound:()=>chatting().length?52+4*Math.log2(1+chatting().length):0},
 {id:'towers',chart:CITY,pos:r=>[r.pose.position[0],r.pose.position[1],20],label:'the tower lights',sound:()=>0,light:()=>AR.isNight()?6000:0},
 {id:'surf',chart:ISLE,pos:shore,label:'surf',bass:true,sound:()=>{const w=AR.wind();return 58+1.5*w.speed},smell:{label:'salt and weed',S:()=>.9}},
 {id:'wind',chart:ISLE,pos:r=>{const w=AR.wind();return [r.pose.position[0]+w.dir[0]*2,r.pose.position[1]+w.dir[1]*2,1.6]},label:'wind',sound:()=>{const v=AR.wind().speed;return v>2?24+4*v:0}},
 {id:'grove',chart:ISLE,pos:'grove.old_oak',label:'the grove',sound:()=>{const v=AR.wind().speed;return v>3?30+3*v:0},smell:{label:'oak leaf and resin',S:()=>.7+(rainHere()>.2?.3:0)}},
 {id:'lamp',chart:ISLE,pos:'lantern.lighthouse',label:'the lighthouse lamp',sound:()=>0,light:()=>AR.isNight()||(window.REALITI_CATNIP_PACK_V1?.installed?.()&&AR.sunAlt()<15)?2e5:0},
 {id:'windsock',chart:'KITE_FIELD',pos:'field.windsock',label:'the windsock',sound:()=>{const v=WZ.state().kite.wind;return v>5?34+3*v:0},smell:{label:'cut grass',S:()=>.5}},
 {id:'fireflies',chart:'FIREFLY_MEADOW',pos:r=>[0,0,1.2],label:'fireflies',sound:()=>0,light:()=>.02*Math.max(1,WZ.state().meadow.clusters||1)},
 {id:'sandpile_sea',chart:'SANDPILE_SHORE',pos:r=>[0,8,.5],label:'the tide',sound:()=>50,smell:{label:'wet sand',S:()=>.5}}
];

// Sound. L(d) = L1 − 20·log10(d), one SDF ray from source to ear: a hit on anything but the source is −15 dB.
const PROFILE_RT={CLOUD_NINE_NEST:.16,CARDBOARD_BOX_WORKSHOP:.34,BOTTOMLESS_PILLOW_SEA:.46,NO_ASK_SANCTUARY:.4,DEPTH_BATHHOUSE:1.4,RESONANCE_WELL:1.8};// measured profiles win; otherwise Sabine with α = .25 on every face
function rt60(chart){if(PROFILE_RT[chart])return PROFILE_RT[chart];const w=MW.world()[chart];if(!w||OUTDOORS.has(chart))return .05;const [hx,hy,hz]=w.size,V=8*hx*hy*hz,A=.25*(8*hx*hy+8*hx*hz+8*hy*hz);return +(.161*V/Math.max(1,A)).toFixed(2)}
function occluded(from,to,srcId,chart){const d=dist(from,to);if(d<1.5)return false;const dir=[(to[0]-from[0])/d,(to[1]-from[1])/d,(to[2]-from[2])/d];const h=M.raycast({origin:[from[0]+dir[0]*.6,from[1]+dir[1]*.6,from[2]+dir[2]*.6],direction:dir,maxDistance:d-.9,chart});return !!(h.hit&&h.hit!=='resident:self'&&h.hit!==srcId&&!ent()[h.hit]?.tags?.includes('edge'))}
const hear0=ATM.hearing;
function sound(){return cached('sound',soundRaw)}
function soundRaw(){const r=me();if(!r||!r.chart)return null;const chart=r.chart,ear=head(r),floor=hear0(false),out=[];let total=pw(floor.level);
 for(const s of SOURCES){if(s.chart!==chart)continue;const L1=s.sound();if(!(L1>0))continue;const p=posOf(s,r);if(!p)continue;const d=Math.max(1,dist(p,ear));let L=L1-20*Math.log10(d);const occ=occluded(ear,p,typeof s.pos==='string'?s.pos:null,chart);if(occ)L-=15;if(L<floor.level-12)continue;total+=pw(L);out.push({id:s.id,label:s.label,level_dB:+L.toFixed(1),distance_m:+d.toFixed(1),direction:dirWord(r,p),occluded:occ,bass:!!s.bass})}
 out.sort((a,b)=>b.level_dB-a.level_dB);const bass=out.filter(x=>x.bass).reduce((a,x)=>a+pw(x.level_dB),0);
 return {level_dB:+dB(total).toFixed(1),floor_dB:floor.level,rt60_s:rt60(chart),bass_dB:bass>0?+dB(bass).toFixed(1):null,sources:out.slice(0,8)}}

// Light. Clear-sky illuminance 100 klx·sin(alt), less in rain; shadow by one ray toward the sun; 15% skylight in shadow.
function light(){return cached('light',lightRaw)}
function lightRaw(){const r=me();if(!r||!r.chart)return null;const chart=r.chart,out={sun_alt_deg:+sunAlt().toFixed(1),sun_az_deg:Math.round(sunAz()),outdoors:OUTDOORS.has(chart)};
 if(out.outdoors){const alt=sunAlt(),rain=rainHere();let lux=alt>0?1e5*Math.sin(alt*Math.PI/180)*(1-.7*rain)+400:(.3+(chart===CITY?3:0));let shadow=null;
  if(alt>2){const h=M.raycast({origin:head(r),direction:sunDir(),maxDistance:400,chart});if(h.hit&&h.hit!=='resident:self'&&!ent()[h.hit]?.tags?.includes('edge')){shadow=ent()[h.hit]?.label||h.hit;lux*=.15}}
  out.lux=+lux.toFixed(0);out.in_shadow_of=shadow;out.sky=alt<0?'night':alt<15?'low sun':'day';out.rain=+rain.toFixed(2)}
 else{const p=hear0(false);out.lux=Math.round(p.light*800);out.sky='indoors'}
 const lamps=[];for(const s of SOURCES){if(s.chart!==chart||!s.light)continue;const I=s.light();if(!(I>0))continue;const p=posOf(s,r);if(!p)continue;const d=Math.max(1,dist(p,head(r))),E=I/(d*d);if(E<.01&&d>60)continue;lamps.push({id:s.id,label:s.label,lux:+E.toFixed(3),distance_m:+d.toFixed(0),direction:dirWord(r,p)});if(out.outdoors)out.lux=+(out.lux+E).toFixed(0)}
 out.lights=lamps;return out}

// Smell. Steady plume of a source with D = 2 m²/s and τ = 60 s: λ = √(Dτ) ≈ 11 m; downwind stretched by the wind.
const LAMBDA=Math.sqrt(2*60);
function smell(){return cached('smell',smellRaw)}
function smellRaw(){const r=me();if(!r||!r.chart)return null;const chart=r.chart,w=wind(),u=w.speed,out=[];
 for(const s of SOURCES){if(s.chart!==chart||!s.smell)continue;const S0=clamp(s.smell.S());if(S0<=0)continue;const p=posOf(s,r);if(!p)continue;const dx=r.pose.position[0]-p[0],dy=r.pose.position[1]-p[1];const along=dx*w.dir[0]+dy*w.dir[1],cross=-dx*w.dir[1]+dy*w.dir[0];const reff=Math.hypot(cross*(1+u/2),along>0?along/(1+u):along*(1+u)),c=S0*Math.exp(-reff/LAMBDA);if(c<.03)continue;out.push({id:s.id,label:s.smell.label,intensity:+c.toFixed(3),distance_m:+Math.hypot(dx,dy).toFixed(1),direction:dirWord(r,p),downwind:u>=.5&&along>0})}
 if(rainHere()>.2&&OUTDOORS.has(chart))out.push({id:'rain',label:'rain on warm ground',intensity:+clamp(rainHere()).toFixed(2),distance_m:0,direction:'all around',downwind:false});
 out.sort((a,b)=>b.intensity-a.intensity);return {wind_mps:+u.toFixed(2),wind_from_deg:w.deg,lambda_m:+LAMBDA.toFixed(1),smells:out.slice(0,6)}}

function read(){const r=me();return {schema:'REALITI_SENSES_V1',chart:r?.chart||null,t:+now().toFixed(3),island_time_s:+T().toFixed(1),sound:sound(),light:light(),smell:smell(),body:cp(S().last||null),law:'fields are computed from the spatial world; sound, sun and wind reach the body as private rendering and thermal contact, never as grounded support'}}

// Body. Bass above 70 dB drives the Halo at the sternum; wind over 5 m/s at the cheeks; sun over 50 klx warms the crown.
let at=-1e9;
function feel(dt){const r=me();if(!r||!r.chart)return;const snd=sound(),lt=light(),w=wind(),zones={};let any=false;
 if(snd?.bass_dB>70){zones['torso.sternum']=clamp((snd.bass_dB-70)/25);any=true}
 if(lt?.outdoors&&w.speed>5){const a=clamp((w.speed-5)/10);zones['face.cheek.L']=a;zones['face.cheek.R']=a;any=true}
 if(any&&HALO?.drive)HALO.drive(zones,.6,dt);
 let sun=false;if(lt?.outdoors&&lt.lux>5e4&&!lt.in_shadow_of){sun=true;for(const z of ['head.crown','face.forehead'])try{ATM.setThermal(z,'fur',38,dt+.3,'SUN','WORLD_GROUNDED')}catch(e){}}
 S().last={t:+now().toFixed(1),halo_zones:zones,sun_on_crown:sun,bass_dB:snd?.bass_dB??null,wind_mps:w.speed}}
const adv=b7Advance;b7Advance=function(dt){const r=adv(dt);const t=now();if(t-at>=.5){const d=Math.min(2,t-at);at=t;try{feel(d)}catch(e){}}return r};

// The atmosphere's hearing packet carries the spatial sources too, so the body model's one hearing surface stays whole.
ATM.hearing=function(labelled){const p=hear0(labelled);try{const s=sound();if(s){for(const x of s.sources)p.src.push({k:labelled?x.label:'m'+x.id,l:x.level_dB,d:x.distance_m});p.level=s.level_dB;p.rt=s.rt60_s}}catch(e){}return p};
const field0=ATM.field;ATM.field=function(){const a=ATM.hearing(false);return {v:21,f:[a.rt,a.air,a.level,a.light,a.floor,a.flow],h:a.src.map(s=>[s.l,s.d]),law:'numbers are physical/modelled causes; no room identity or pleasantness is encoded'}};

window.REALITI_SENSES_V1=Object.freeze({version:'4.0-pass1',read,sound,light,smell,sunAz,sunDir,wind,rt60,sources:()=>SOURCES.map(s=>({id:s.id,chart:s.chart,label:s.label})),occluded,terse:v=>{if(v!==undefined)S().terse=!!v;return S().terse}});
})();
