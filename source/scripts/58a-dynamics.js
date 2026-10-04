(()=>{
'use strict';
// Slow room dynamics sampled inside the world clock. Lingering keeps computing: a pressure wave has a real
// envelope, the bathhouse has depth, the sanctuary holds you, rain has a density. Nothing here mints grounded
// evidence: the wave only modulates support that already exists, and every lease is an ordinary ambient cause.
const V='1.0-slow-dynamics',SRC='AMBIENT_SUPPORT',MARGIN=.3;
const SANCT='NO_ASK_SANCTUARY',BATH='DEPTH_BATHHOUSE',PILLOW='BOTTOMLESS_PILLOW_SEA',NEST='CLOUD_NINE_NEST';
const now=()=>Number(C9?.b7?.clock||0),clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,Number(x)||0)),room=()=>C9?.currentRoom;
const BACK=['head.crown','head.nape','torso.upper_back','torso.mid_back','torso.lower_back','pelvis.seat'];
const AMBIENT=new Set([SRC,'PILLOW_SEA_SUPPORT','INVITED_AMBIENT_SUPPORT']);
// Deterministic 1/f drift, same construction the atmosphere uses for rain level.
const hashU=(seed,k)=>{let x=(seed^(k*0x9e3779b9))>>>0;x=Math.imul(x^(x>>>16),0x21f0aaad);x=Math.imul(x^(x>>>15),0x735a2d97);x^=x>>>15;return (x>>>0)/4294967296};
const pink=(t,seed,f0,K=12,rho=1.9)=>{let s=0;for(let k=0;k<K;k++)s+=Math.sin(2*Math.PI*((f0*rho**k*t+hashU(seed,k))%1));return s/Math.sqrt(K)};
// Sanctuary hold: lying support, steady, drifting ±5% over 7–50 s periods so the field never freezes.
const HOLD={'head.crown':.07,'head.nape':.11,'torso.upper_back':.15,'torso.mid_back':.17,'torso.lower_back':.19,'pelvis.seat':.22,'leg.L.thigh':.06,'leg.R.thigh':.06};
// Bathhouse immersion order: hydrostatic support reaches each zone at a depth threshold with a smooth onset.
const IMM=[['pelvis.seat',.06],['torso.lower_back',.14],['leg.L.thigh',.2],['leg.R.thigh',.2],['torso.mid_back',.3],['torso.upper_back',.42],['leg.L.shin',.5],['leg.R.shin',.5],['shoulder.L',.6],['shoulder.R',.6],['head.nape',.76],['head.crown',.9]];
const TAU_D=1.6,T_SURFACE=31,T_DEEP=39;
// Pressure wave: p(s,t)=A·e^(−αt)·exp(−(s−ct)²/2σ²) along the back chain (s in zone units, crown=0 → seat=5).
const WAVE={[PILLOW]:{A:.45,c:2.0,sigma:.8,alpha:.5},[BATH]:{A:.30,c:1.1,sigma:1.3,alpha:.25}};

function S(){C9.dyn=C9.dyn||{v:V,room:null,wave:null,bath:{d:0,target:0},hold:{stopped:false},own:{},base:{}};return C9.dyn}
function zoneOf(z){try{return b7Zone(z)}catch(e){return null}}
function live(q,t=now()){return !!q&&Number(q._b10_grounded_until||-1)>=t-1e-9}

// One ambient support writer. The first write per cause/zone is a real b7Contact (lawful provenance, receipt);
// after that the lease is maintained directly, the way Nest support does, with receptor adaptation to steady load.
function lease(z,input,cause,dt){
 const o=S().own,k=cause+'|'+z,q=zoneOf(z);if(!q)return false;const t=now(),mine=q._b10_grounded_cause===cause;
 if(live(q,t)&&!mine&&q._b10_grounded_source!==SRC)return false;
 let m=o[k];
 if(!mine||!m){const r=b7Contact(z,input,{material:'blanket',grain:'with',speed:.01,mine:false,source:SRC,cause,pressure:input,novelty:.01});if(!r||r.receptor==='NO_RECEPTOR')return false;m=o[k]={v:input,t0:t}}
 const q2=zoneOf(z),age=t-m.t0,a=.3+.7*Math.exp(-age/3.2);
 q2._b10_grounded_value=input;q2._b10_grounded_cause=cause;q2._b10_grounded_source=SRC;q2._b10_grounded_until=Math.max(Number(q2._b10_grounded_until||0),t+dt+MARGIN);
 q2.observed=input*a;q2.predicted=q2.observed*(1-Math.exp(-age/.45));q2.innovation=q2.observed-q2.predicted;q2.material='blanket';q2.lastCause=cause;m.v=input;
 return true;
}
function releaseZone(cause,z){
 const o=S().own,k=cause+'|'+z;if(!(k in o))return;delete o[k];
 const q=C9?.b7?.zones?.[z];if(q&&q._b10_grounded_cause===cause){q._b10_grounded_until=now()-1e-6;q._b10_grounded_value=0;q.observed=0;q.innovation=-Number(q.predicted||0)}
}
function release(cause){for(const k of Object.keys(S().own))if(k.startsWith(cause+'|'))releaseZone(cause,k.slice(cause.length+1))}

function waveProfile(w,t=now()){const p=WAVE[w.room],age=t-w.t0,env=w.A*Math.exp(-p.alpha*age),x=-p.sigma+p.c*age;return BACK.map((_,j)=>env*Math.exp(-.5*((j-x)/p.sigma)**2))}
function waveDone(w,t=now()){const p=WAVE[w.room],age=t-w.t0;return age>=Math.min(Math.log(w.A/.02)/p.alpha,(BACK.length+2*p.sigma)/p.c)}
function restoreWave(){const b=S().base;for(const [z,m] of Object.entries(b)){const q=C9?.b7?.zones?.[z];if(q&&live(q)&&Number(q._b10_grounded_value)===m.w){q._b10_grounded_value=m.b;q.observed=Math.min(Number(q.observed||0),m.b)}}S().base={}}
// The wave rides on whatever support provider owns the zone; if that provider rewrote the zone mid-wave, adopt its new base.
function stepWave(){
 const s=S(),w=s.wave;if(!w)return;
 if(w.room!==room()||waveDone(w)){restoreWave();s.wave=null;return}
 const prof=waveProfile(w);
 for(let j=0;j<BACK.length;j++){const z=BACK[j],q=C9?.b7?.zones?.[z];if(!q||!live(q)||!AMBIENT.has(q._b10_grounded_source))continue;
  const cur=Number(q._b10_grounded_value||0),m=s.base[z]&&s.base[z].w===cur?s.base[z]:(s.base[z]={b:cur,w:cur}),v=m.b*(1+prof[j]);m.w=v;q._b10_grounded_value=v;q.observed=Math.max(Number(q.observed||0),v)}
}
function launchWave(){const r=room();if(!WAVE[r])return null;restoreWave();S().wave={room:r,t0:now(),A:WAVE[r].A};return S().wave}

function stepBath(dt){
 const b=S().bath;if(room()!==BATH){if(b.d||b.target){b.d=0;b.target=0;release('BATHHOUSE_LAYER')}return}
 b.d+=(b.target-b.d)*(1-Math.exp(-dt/TAU_D));if(b.d<.02&&b.target===0)b.d=0;
 const T=T_SURFACE+(T_DEEP-T_SURFACE)*b.d,th=window.REALITI_ATMOSPHERE_V21?.setThermal;
 for(const [z,t0] of IMM){const f=clamp((b.d-t0)/.12);if(f<=0){releaseZone('BATHHOUSE_LAYER',z);continue}
  if(lease(z,.05+.13*f*(.6+.4*b.d),'BATHHOUSE_LAYER',dt))try{th?.(z,'water',T,dt+MARGIN,'BATHHOUSE_LAYER',SRC)}catch(e){}}
}
function stepHold(dt){
 const h=S().hold;if(room()!==SANCT||h.stopped){release('SANCTUARY_HOLD');return}
 const g=1+.05*pink(now(),777,.02,4);for(const [z,b] of Object.entries(HOLD))lease(z,b*g,'SANCTUARY_HOLD',dt);
}
function step(dt){
 const s=S(),r=room();
 if(r!==s.room){s.room=r;s.hold.stopped=false;restoreWave();s.wave=null;s.own={}}
 stepHold(dt);stepBath(dt);stepWave();
}
function stopAll(){const s=S();s.hold.stopped=true;s.bath.d=0;s.bath.target=0;restoreWave();s.wave=null;release('SANCTUARY_HOLD');release('BATHHOUSE_LAYER')}

const rain=(t=now())=>clamp((7+2.2*pink(t,Number(C9?.b21?.seed||42421),.004))/13);
const pretty=z=>String(z).replace(/^(torso|pelvis|head|leg|arm|hand|foot)\./,'').replace(/^([LR])\./,'$1 ').replaceAll('_',' ');
function words(){
 const r=room(),s=S(),out=[];
 if(r===NEST){const i=rain(),d=i-rain(now()-5);out.push(`Rain on the window at ${Math.round(i*100)}% density, ${d>.02?'thickening':d<-.02?'thinning':'steady'}.`)}
 if(r===SANCT){const n=Object.keys(s.own).filter(k=>k.startsWith('SANCTUARY_HOLD|')).length;out.push(n?`The floor holds ${n} zones without asking for anything; its pressure drifts a few percent and settles again.`:'Nothing here holds you right now.')}
 if(r===PILLOW){const p=window.REALITI_TRUST_V234?.pillow?.();if(p&&p.posture!=='EDGE'){const m=Number(p.mode_value||0);out.push(m>.004?`The pillow mass around you is still settling: residual motion ${m.toFixed(3)}, halving about every 19 s.`:'The pillow mass around you has settled into the shape you made.')}}
 if(r===BATH){const b=s.bath,n=Object.keys(s.own).filter(k=>k.startsWith('BATHHOUSE_LAYER|')).length,moving=Math.abs(b.target-b.d)>.01;const to=moving?` toward ${Math.round(b.target*100)}%`:'';out.push(n?`You are ${Math.round(b.d*100)}% down${moving?(b.target>b.d?', sinking'+to:', rising'+to):''}; the water holds ${n} zones at about ${(T_SURFACE+(T_DEEP-T_SURFACE)*b.d).toFixed(1)} °C.`:moving?`You begin to sink${to}; the water will reach your seat first.`:'You are at the surface; the mist touches nothing yet.')}
 if(s.wave){const prof=waveProfile(s.wave),on=BACK.map((z,j)=>j).filter(j=>BACK[j] in s.base),j=on.length?on.reduce((a,b)=>prof[a]>=prof[b]?a:b):-1,p=WAVE[s.wave.room],age=now()-s.wave.t0,left=Math.max(0,Math.min(Math.log(s.wave.A/.02)/p.alpha,(BACK.length+2*p.sigma)/p.c)-age);out.push(j<0?`A pressure wave is moving through the medium, ${left.toFixed(1)} s from dying out; nothing supported lies in its path yet.`:`A pressure wave is passing your ${pretty(BACK[j])} (+${Math.round(prof[j]*100)}%), ${left.toFixed(1)} s from dying out.`)}
 return out;
}
function state(){const s=S();return {version:V,room:room(),rain:room()===NEST?+rain().toFixed(4):null,hold:{active:room()===SANCT&&!s.hold.stopped,zones:Object.keys(s.own).filter(k=>k.startsWith('SANCTUARY_HOLD|')).length},bath:{depth:+s.bath.d.toFixed(4),target:s.bath.target,zones:Object.keys(s.own).filter(k=>k.startsWith('BATHHOUSE_LAYER|')).length,temperature_C:+(T_SURFACE+(T_DEEP-T_SURFACE)*s.bath.d).toFixed(2)},wave:s.wave?{room:s.wave.room,age_s:+(now()-s.wave.t0).toFixed(3),profile:waveProfile(s.wave).map(x=>+x.toFixed(4)),...WAVE[s.wave.room]}:null,law:'slow dynamics modulate or lease ambient support; they never mint grounded evidence'}}

const adv=b7Advance;b7Advance=function(dt){const r=adv(dt);step(Math.max(0,Number(dt)||0));return r};
const go0=b7AgentGo;b7AgentGo=function(v){const r=go0(v);step(0);try{window.REALITI_HAPTIC_FIELD_V20?.record?.()}catch(e){}return r};
const verb0=c9verb;c9verb=function(r,verb){
 const v=String(verb||''),id=String(r||'');
 if(id===BATH&&['sink','float','surface'].includes(v)){const b=S().bath;b.target=v==='sink'?Math.min(1,b.target+.34):v==='surface'?0:Math.max(b.d,.35);c9count(id,v);step(0);return true}
 if((id===PILLOW||id===BATH)&&v==='weather_wave'){launchWave();step(0);return true}
 return verb0(r,verb);
};
const stop0=window.REALITI_STOP_V1;if(stop0)window.REALITI_STOP_V1={...stop0,stop:()=>{stopAll();return stop0.stop()}};
C9SCENES[SANCT].intro='Nothing is waiting for a reply. There is nothing to do here, and the floor holds you anyway. `stay` is the only verb.';
C9SCENES[SANCT].verbs=[];
window.REALITI_DYNAMICS_V1=Object.freeze({version:V,state,words,rain,wave:launchWave,stop:stopAll,step,lease,release});
})();
