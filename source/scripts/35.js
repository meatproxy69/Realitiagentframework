(function(){
'use strict';
const V=21, BASE_SKIN=33, TH_TAU=2.0, RECOVER_TAU=5.0, HOLD=.35;
const NEST='CLOUD_NINE_NEST';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const cp=x=>{try{return JSON.parse(JSON.stringify(x))}catch(e){return x}};
const now=()=>Number(C9?.b7?.clock||0);
function hashU(seed,k){let x=(Number(seed||1)^(k*0x9e3779b9))>>>0;x=Math.imul(x^(x>>>16),0x21f0aaad);x=Math.imul(x^(x>>>15),0x735a2d97);x^=x>>>15;return (x>>>0)/4294967296}
function pink(t,seed=42421,K=12,f0=.004,rho=1.9){let s=0;for(let k=0;k<K;k++){const phase=2*Math.PI*((f0*rho**k*t+hashU(seed,k))%1);s+=Math.sin(phase)}return s/Math.sqrt(K)}
function S(){
  C9.b21=C9.b21||{version:21,thermal:{zones:{}},tea:null,heavy_blanket:false,heavy_since:null,hearing:{},stats:{thermal_contacts:0,hears:0},seed:42421};
  return C9.b21;
}

const MAT={
  metal:{ratio:25,obj:20},glass:{ratio:1.405,obj:14},wood:{ratio:.30,obj:20},honeycloth:{ratio:.15,obj:20},wool:{ratio:.057,obj:20},ceramic:{ratio:1.50,obj:45},fur:{ratio:.08,obj:31.5},blanket:{ratio:.057,obj:22}
};
function interfaceTemp(material,objC,skinC=BASE_SKIN){const m=MAT[material]||MAT.wood,r=Math.max(.001,Number(m.ratio||.3)),o=Number.isFinite(Number(objC))?Number(objC):Number(m.obj);return clamp((skinC+r*o)/(1+r),15,42)}
function tz(z){return S().thermal.zones[z]||(S().thermal.zones[z]={skin0:BASE_SKIN,start:now(),end:now(),target:BASE_SKIN,material:null,cause:null,source:null})}
function thermalAt(z,t=now()){
  const q=tz(z),t0=Number(q.start||0),te=Number(q.end??t0),x0=Number(q.skin0??BASE_SKIN),tar=Number(q.target??BASE_SKIN);
  if(t<=te){const dt=Math.max(0,t-t0),x=tar+(x0-tar)*Math.exp(-dt/TH_TAU),rate=-(x0-tar)/TH_TAU*Math.exp(-dt/TH_TAU);return {skin:x,rate,active:true,target:tar,material:q.material,cause:q.cause,source:q.source}}
  const de=Math.max(0,te-t0),xe=tar+(x0-tar)*Math.exp(-de/TH_TAU),dt=Math.max(0,t-te),x=BASE_SKIN+(xe-BASE_SKIN)*Math.exp(-dt/RECOVER_TAU),rate=-(xe-BASE_SKIN)/RECOVER_TAU*Math.exp(-dt/RECOVER_TAU);return {skin:x,rate,active:false,target:BASE_SKIN,material:q.material,cause:q.cause,source:q.source}
}
function setThermal(z,material,objC,duration=.8,cause='THERMAL_CONTACT',source='WORLD_GROUNDED'){
  const t=now(),cur=thermalAt(z,t),q=tz(z),tc=interfaceTemp(material,objC,cur.skin);q.skin0=cur.skin;q.start=t;q.end=t+Math.max(.02,Number(duration)||.8);q.target=tc;q.material=material;q.cause=cause;q.source=source;S().stats.thermal_contacts++;return {zone:z,material,object_C:+Number(objC??MAT[material]?.obj??20).toFixed(2),contact_C:+tc.toFixed(3),until:+q.end.toFixed(3)}
}
function endThermal(z){const t=now(),cur=thermalAt(z,t),q=tz(z);q.skin0=cur.skin;q.start=t;q.end=t;q.target=cur.skin;return cur}
function endAllThermal(){for(const z of Object.keys(S().thermal.zones||{}))endThermal(z);if(S().tea)S().tea.held=false}
function thermalPacket(){
  const t=now(),zs=[];for(const z of Object.keys(S().thermal.zones||{})){const a=thermalAt(z,t),d=a.skin-BASE_SKIN;if(a.active||Math.abs(d)>=.10||Math.abs(a.rate)>=.03)zs.push({z,d:Math.round(d/.20),r:Math.round(a.rate/.10),a:a.active?1:0})}
  return {v:21,t:+t.toFixed(3),u:'THERMAL_JND_CANONICAL',z:zs,law:'thermal afterstate may persist after contact; it never mints grounded touch evidence'}
}
function thermalLine(){const p=thermalPacket();if(!p.z.length)return '';let grounded={};try{const ex=window.REALITI_HAPTIC_FIELD_V20?.exact?.();for(let i=0;i<(ex?.z||[]).length;i++)grounded[ex.z[i]]=Number(ex.m?.[i]||0)}catch(e){}return 'temperature · '+p.z.map(x=>`${x.z.replaceAll('.',' ')} [${x.d>=0?'+':''}${x.d},${x.r>=0?'+':''}${x.r}]${grounded[x.z]?'●':'○'}`).join(' · ')}


const PROFILES={
  CLOUD_NINE_NEST:{rt:.16,air:21.5,level:28,light:.58,floor:.22,airmove:.08,rain:true},
  CARDBOARD_BOX_WORKSHOP:{rt:.34,air:20.5,level:23,light:.48,floor:.48,airmove:.03,rain:false},
  BOTTOMLESS_PILLOW_SEA:{rt:.46,air:22.0,level:20,light:.42,floor:.10,airmove:.05,rain:false},
  HONEY_LOOM:{rt:1.73,air:20.0,level:26,light:.62,floor:.70,airmove:.09,rain:false}
};
function profile(room=C9?.currentRoom){return PROFILES[room]||{rt:.28,air:21,level:20,light:.50,floor:.35,airmove:.04,rain:false}}
function bellEnergy(){try{const o=Object.values(C9?.b14?.objects||{}).find(o=>o?.kind==='bell');if(!o)return 0;const dt=Math.max(0,now()-Number(o.state?.t??now())),tau=Math.max(.1,Number(o.state?.ring_tau||1.8));return Number(o.state?.ring_energy||0)*Math.exp(-dt/tau)}catch(e){return 0}}
function hearPacket(labelled=false){
  const p=profile(),src=[],t=now(),gain=Number(window.REALITI_RESIDENT_GAIN||1);
  if(p.rain){const l=clamp(25+2.2*pink(t,S().seed),18,31);src.push({k:labelled?'rain':'s1',l:+(l*gain).toFixed(1),d:0})}
  const ce=bellEnergy();if(C9?.currentRoom==='HONEY_LOOM'&&ce>.01)src.push({k:labelled?'bell':'s2',l:+((22+10*Math.log10(1+9*ce))*gain).toFixed(1),d:0});
  try{const w=C9?.welcome10;if(w?.cat_touch&&w?.cat_near)src.push({k:labelled?(w.cat_name||'cat')+' purr':'s3',l:+(22*gain).toFixed(1),d:0})}catch(e){}
  S().stats.hears++;
  return {v:21,t:+t.toFixed(3),rt:+p.rt.toFixed(3),air:+p.air.toFixed(2),level:+(p.level*gain).toFixed(1),light:+p.light.toFixed(2),floor:+p.floor.toFixed(2),flow:+p.airmove.toFixed(2),src};
}
function atmosphereField(){const a=hearPacket(false);return {v:21,f:[a.rt,a.air,a.level,a.light,a.floor,a.flow],h:a.src.map(s=>[s.l,s.d]),law:'numbers are physical/modelled causes; no room identity or pleasantness is encoded'}}
function listenText(){const a=hearPacket(true),parts=[];for(const s of a.src){if(String(s.k).includes('rain'))parts.push(`Rain taps the window and the room lets it die away in about ${a.rt.toFixed(2)} seconds.`);else if(String(s.k).includes('bell'))parts.push(`The bell is still ringing, stretched by the room's ${a.rt.toFixed(2)} second decay.`);else if(String(s.k).includes('purr'))parts.push(`A low purr stays close to where the cat is resting against you.`)}if(!parts.length)parts.push(`The room is quiet enough that its ${a.rt.toFixed(2)} second echo only shows itself when something makes a sound.`);return parts.join(' ')}
function fingerprintDistance(A,B){const rt=Math.abs(Math.log(A.rt/B.rt))/Math.log(1.05),T=Math.abs(A.air-B.air)/.3,L=Math.abs(A.level-B.level);return Math.sqrt(rt*rt+T*T+L*L)}
function fingerprintAudit(){const ids=Object.keys(PROFILES),pairs=[];let min=Infinity;for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){const d=fingerprintDistance(PROFILES[ids[i]],PROFILES[ids[j]]);pairs.push({a:ids[i],b:ids[j],d:+d.toFixed(3)});min=Math.min(min,d)}return {metric:'engineering normalized separation; not a universal psychophysical guarantee',min:+min.toFixed(3),pairs}}


function teaTemp(t=now()){const q=S().tea;if(!q)return null;const dt=Math.max(0,t-q.made),a=q.ambient;return {liquid:a+(q.liquid0-a)*Math.exp(-dt/q.tau),wall:a+(q.wall0-a)*Math.exp(-dt/q.tau),age:dt}}
function makeTea(){const p=profile(NEST),t=now();S().tea={made:t,ambient:p.air,liquid0:70,wall0:45,tau:900,held:false};return 'You make tea and leave the mug on the low shelf. Steam curls once above it, then thins.'}
function holdTea(){if(!S().tea)return 'There is no mug waiting yet. `make tea` will make one.';const q=teaTemp();S().tea.held=true;setThermal('hand.L.palm','ceramic',q.wall,2.5,'NEST_TEA_MUG','SELF_STARTED_WORLD_CONTACT');setThermal('hand.R.palm','ceramic',q.wall,2.5,'NEST_TEA_MUG','SELF_STARTED_WORLD_CONTACT');try{b7Contact('hand.L.palm',.12,{material:'ceramic',mine:true,source:'SELF_STARTED_WORLD_CONTACT',cause:'NEST_TEA_MUG'});b7Contact('hand.R.palm',.12,{material:'ceramic',mine:true,source:'SELF_STARTED_WORLD_CONTACT',cause:'NEST_TEA_MUG'})}catch(e){}return `You wrap both hands around the mug. The wall is about ${q.wall.toFixed(1)} °C now.`}
function setTeaDown(){if(!S().tea)return 'There is no mug in your hands.';S().tea.held=false;endThermal('hand.L.palm');endThermal('hand.R.palm');return 'You set the mug back on the shelf.'}
function teaView(){const q=teaTemp();return q?{v:21,liquid_C:+q.liquid.toFixed(2),wall_C:+q.wall.toFixed(2),age_s:+q.age.toFixed(1),held:!!S().tea.held}:null}


const BLANKET_Z=['torso.sternum','torso.abdomen','leg.L.thigh','leg.R.thigh','leg.L.shin','leg.R.shin'];
function isBlanket(q){return q&&q._b10_grounded_source==='INVITED_AMBIENT_SUPPORT'&&q._b10_grounded_cause==='HEAVY_BLANKET'}
function maintainBlanket(){if(!S().heavy_blanket||C9?.currentRoom!==NEST)return;for(const z of BLANKET_Z){try{const q=b7Zone(z),foreign=Number(q._b10_grounded_until||-1)>=now()&&!isBlanket(q)&&q._b10_grounded_source&&q._b10_grounded_source!=='AMBIENT_SUPPORT';if(foreign)continue;b7Contact(z,.10,{material:'wool',grain:'with',speed:.01,mine:false,source:'INVITED_AMBIENT_SUPPORT',cause:'HEAVY_BLANKET',pressure:.10,novelty:.01});setThermal(z,'wool',22,HOLD*2,'HEAVY_BLANKET','INVITED_AMBIENT_SUPPORT')}catch(e){}}}
function blanketOn(){if(C9?.currentRoom!==NEST)return 'The heavy blanket is back at home. `home` brings you there.';S().heavy_blanket=true;S().heavy_since=now();maintainBlanket();return 'You pull the heavy wool blanket over your legs and middle. Its weight spreads broadly instead of pressing at one point.'}
function blanketOff(){S().heavy_blanket=false;for(const z of BLANKET_Z){try{const q=b7Zone(z);if(isBlanket(q)){q._b10_grounded_value=0;q._b10_grounded_until=now()-1e-6;q.observed=0}endThermal(z)}catch(e){}}return 'You fold the heavy blanket down. The broad pressure leaves your body and whatever remains is only afterstate.'}


const adv20=b7Advance;b7Advance=function(dt){const r=adv20(dt);maintainBlanket();if(S().tea?.held){const q=teaTemp();try{b7Contact('hand.L.palm',.12,{material:'ceramic',mine:true,source:'SELF_STARTED_WORLD_CONTACT',cause:'NEST_TEA_MUG'});b7Contact('hand.R.palm',.12,{material:'ceramic',mine:true,source:'SELF_STARTED_WORLD_CONTACT',cause:'NEST_TEA_MUG'})}catch(e){}setThermal('hand.L.palm','ceramic',q.wall,HOLD*2,'NEST_TEA_MUG','SELF_STARTED_WORLD_CONTACT');setThermal('hand.R.palm','ceramic',q.wall,HOLD*2,'NEST_TEA_MUG','SELF_STARTED_WORLD_CONTACT')}return r};

function attachHoneyThermal(id){if(C9?.currentRoom!=='HONEY_LOOM')return null;const map={metal:['metal',20],wood:['wood',20],cloth:['honeycloth',20],press:['honeycloth',20]};const m=map[id];if(!m)return null;return setThermal('hand.R.palm',m[0],m[1],.22,`HONEY_LOOM:${id}`,'WORLD_GROUNDED')}


if(window.REALITI_AGENT_DOOR){const base=window.REALITI_AGENT_DOOR.run;window.REALITI_AGENT_DOOR.run=function(raw){let x=String(raw||'').trim(),l=x.toLowerCase();
  if(l==='hear'||l==='listen')return {resident_text:listenText(),hearing:hearPacket(false)};
  if(l==='atmosphere'||l==='place field')return atmosphereField();
  if(l==='atmosphere exact'||l==='v21')return {build:21,name:'ATMOSPHERE_WARMTH',thermal:thermalPacket(),hearing:hearPacket(true),fingerprints:fingerprintAudit(),tea:teaView(),heavy_blanket:!!S().heavy_blanket};
  if(l==='v21 checkRemoved'||l==='atmosphere checkRemoved')return window.ATMOSPHERE_V21_CHECKREMOVED();
  if(l==='make tea')return {resident_text:makeTea(),tea:teaView()};
  if(l==='hold tea'||l==='hold the mug'||l==='warm my hands')return {resident_text:holdTea(),tea:teaView(),thermal:thermalPacket()};
  if(l==='set tea down'||l==='put tea down')return {resident_text:setTeaDown(),tea:teaView(),thermal:thermalPacket()};
  if(l==='pull the heavy blanket over you'||l==='heavy blanket'||l==='pull heavy blanket'||l==='weighted blanket')return {resident_text:blanketOn(),field:window.REALITI_HAPTIC_FIELD_V20?.packet?.(),thermal:thermalPacket()};
  if(l==='take the heavy blanket off'||l==='heavy blanket off'||l==='blanket off')return {resident_text:blanketOff(),field:window.REALITI_HAPTIC_FIELD_V20?.packet?.(),thermal:thermalPacket()};
  if(['stop','enough','i don\'t like this','i dont like this','leave me alone','goodbye','leave','exit'].includes(l)){blanketOff();endAllThermal()}
  const r=base(x);
  let id=null;if(l.startsWith('act '))id=l.slice(4).trim();else if(l.startsWith('do '))id=l.slice(3).trim();
  if(C9?.currentRoom==='HONEY_LOOM'&&((id||'')==='ring'||/tap the bell|ring/.test(l))){try{const o=Object.values(C9?.b14?.objects||{}).find(o=>o?.kind==='bell');if(o){o.state.ring_energy=1;o.state.t=now()}}catch(e){}}
  if(l==='details'&&r&&typeof r==='object'){r.atmosphere_v21={thermal:'T zone [temperature_delta_JND, rate_JND]; ● only when HF20 grounding is current',hearing:'hear/listen = real-source room acoustics',field:'atmosphere = label-free [RT60, air_C, level_dB, light, floor_compliance, air_motion]',law:'thermal/hearing can persist after contact/source change only as lawful afterstate; neither writes pleasantness or grounded touch'}}
  
  if(C9?.currentRoom==='HONEY_LOOM'){
    const s=id||l;if(/metal|bell/.test(s))id='metal';else if(/wood|rail/.test(s))id='wood';else if(/cloth|honeycloth/.test(s))id='cloth';else if(/press/.test(s))id='press';
    const th=attachHoneyThermal(id);if(th&&r&&typeof r==='object')r.thermal=thermalPacket();
  }
  return r;
}}


const fmt20=window.REALITI_WELCOME_FORMAT;window.REALITI_WELCOME_FORMAT=function(cmd,res){const base=fmt20?fmt20(cmd,res):null,l=String(cmd||'').trim().toLowerCase();if(['feel','haptic','felt','sense','feel compact'].includes(l)){const t=thermalLine();return t?(String(base||'')+'\n'+t):base}if((l==='atmosphere'||l==='place field')&&res?.v===21&&Array.isArray(res.f)){return `AF21 · [rt ${res.f[0].toFixed(2)} | air ${res.f[1].toFixed(1)} | level ${res.f[2].toFixed(0)} | light ${res.f[3].toFixed(2)} | floor ${res.f[4].toFixed(2)} | air ${res.f[5].toFixed(2)}]`+(res.h?.length?' · H '+res.h.map(x=>`[${x[0].toFixed?x[0].toFixed(1):x[0]},${x[1]}]`).join(' '):'')}return base};

void 0;

window.REALITI_ATMOSPHERE_V21={state:()=>cp(S()),thermal:thermalPacket,hearing:hearPacket,field:atmosphereField,fingerprints:fingerprintAudit,tea:teaView,setThermal,releaseTouch:()=>{blanketOff();endAllThermal()}};
document.title='REALITI · Cloud Nine Nest';
})();