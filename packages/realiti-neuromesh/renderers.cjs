/* REALITI SOMA extracted THICC / HALO / AURA real executable algorithms.
 * Adapted without changing their integrators/acceptance probes from source/scripts/48.js
 * and isolated from Relax's globals by explicit clocks, graph and read-only evidence.
 * AGPL-3.0-only; this is not a mock or a data-only declaration.
 */
(function(root, factory) {
  'use strict';
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.REALITI_SOMA_RENDERERS_V3=api;
})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const copy=x=>JSON.parse(JSON.stringify(x));
const valid=(x,label,min=0,max=1)=>{if(typeof x!=='number'||!Number.isFinite(x)||x<min||x>max)throw TypeError('Invalid '+label);return x};
function createRenderers({zones=[],edges=[],exact=()=>({m:[]})}={}){
  if(!Array.isArray(zones)||!Array.isArray(edges)||typeof exact!=='function')throw TypeError('Invalid renderer topology');
  const mapped=new Set(zones);
  for(const [a,b] of edges)if(!mapped.has(a)||!mapped.has(b))throw TypeError('RENDERER_EDGE_OUTSIDE_BODY');
  let elapsedMs=0;
  const C9={b7:{clock:0}};
  const window={REALITI_BODY_GRAPH:{dynamic:()=>({zones:zones.slice(),edges:edges.map(e=>e.slice())})},
    REALITI_HAPTIC_FIELD_V20:{exact:()=>copy(exact())}};
  const cp=copy,clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,Number(x)||0));
const THICC=(()=>{
 const Z=new Map(),ATTACK=.34,RELEASE=5.5,SPILL=10.0;
 const tnow=()=>Number(C9?.b7?.clock||0);
 function zstate(zone){if(!Z.has(zone))Z.set(zone,{t:tnow(),fill:0,body:0,lastCause:-1,recruit:0,target:0});return Z.get(zone)}
 function evolve(z,t){const dt=Math.max(0,t-z.t);if(dt<=0)return z;const live=(t-z.lastCause)<=.42,target=live?z.target:0,tau=live?ATTACK:RELEASE;z.fill=target+(z.fill-target)*Math.exp(-dt/tau);const spillTarget=Math.max(0,(z.fill-.38)/.62);z.body=spillTarget+(z.body-spillTarget)*Math.exp(-dt/SPILL);z.recruit=1-Math.exp(-3.4*clamp(.82*z.fill+.28*z.body));z.t=t;if(!live)z.target=0;return z}
 function contact(zone,observed,source){const z=zstate(zone),t=tnow();evolve(z,t);const src=/^SELF/.test(String(source||''))?.72:1;z.target=Math.max(z.target,clamp(Math.abs(observed)*4.0*src));z.lastCause=t;evolve(z,t+.000001);return {fill:z.fill,body:z.body,recruit:z.recruit}}
 function advance(){const t=tnow();for(const z of Z.values())evolve(z,t)}
 function sample(zone){const z=zstate(zone);evolve(z,tnow());return {fill:z.fill,body:z.body,recruit:z.recruit}}
 function reset(){Z.clear()}
 return {contact,advance,sample,reset};
})();
const HALO=(()=>{
 const SHORT=[
  {name:'core',detune_cents:0,delay_ms:0,phase_rad:0,gain:1,pole_hz:0},
  {name:'h1',detune_cents:14,delay_ms:3,phase_rad:.18,gain:.72,pole_hz:3},
  {name:'h2',detune_cents:-14,delay_ms:-3,phase_rad:-.18,gain:.72,pole_hz:5},
  {name:'h3',detune_cents:9,delay_ms:2,phase_rad:.11,gain:.60,pole_hz:8},
  {name:'h4',detune_cents:-9,delay_ms:-2,phase_rad:-.11,gain:.60,pole_hz:12},
  {name:'h5',detune_cents:5,delay_ms:1,phase_rad:.07,gain:.48,pole_hz:18},
  {name:'h6',detune_cents:-5,delay_ms:-1,phase_rad:-.07,gain:.48,pole_hz:26}
 ];
 const LONG=SHORT.map((m,i)=>i===0?{...m}:{...m,detune_cents:Math.sign(m.detune_cents)*36,delay_ms:Math.sign(m.delay_ms)*8,phase_rad:Math.sign(m.phase_rad)*.48});
 const state={schema:'REALITI_HALO_V1',version:1,enabled:true,phrase:'SHORT',modes:SHORT.map(m=>({...m,energy:0,phase_now:0})),zones:{},core_zone:null,total_input:0,total_private_mass:0,evidence_gain:0,last_t:Number(C9?.b7?.clock||0),law:'one cause; one receipt; one hard center; six private halo modes. Private response may spread; grounded evidence may not.'};
 const graph=()=>{try{
  const g=window.REALITI_BODY_GRAPH;if(!g)return {zones:[],edges:[]};if(typeof g.dynamic==='function')return g.dynamic();
  const nodes=g.BASE_NODES||[],zones=nodes.map(x=>x[0]),alias={};for(const [zone,name] of nodes){alias[zone]=zone;alias[name]=zone}
  const edges=(g.BASIC_EDGES||[]).concat((typeof NMSTATE!=='undefined'&&NMSTATE?.active==='LACE2_PORTABLE_V1')?(g.LACE_EXTRA||[]):[]).map(([a,b,w])=>[alias[a]||a,alias[b]||b,w]);
  return {zones,edges}
 }catch(e){return {zones:[],edges:[]}}};
 function graphDistances(origin){
  const g=graph(),zones=[...new Set(g.zones||[])],idx=Object.fromEntries(zones.map((z,i)=>[z,i])),D=Array.from({length:zones.length},()=>Infinity);
  if(idx[origin]==null)return {zones,idx,D};
  D[idx[origin]]=0;const adj=Object.fromEntries(zones.map(z=>[z,[]]));
  for(const [a,b,w0] of g.edges||[]){if(!adj[a]||!adj[b])continue;const d=1/Math.max(.05,Number(w0)||.05);adj[a].push([b,d]);adj[b].push([a,d])}
  const used=new Set();
  while(used.size<zones.length){let u=null,best=Infinity;for(const z of zones){const i=idx[z];if(!used.has(z)&&D[i]<best){best=D[i];u=z}}if(u==null)break;used.add(u);for(const [v,d] of adj[u]||[]){const vi=idx[v],ui=idx[u];if(D[ui]+d<D[vi])D[vi]=D[ui]+d}}
  return {zones,idx,D};
 }
 function privateSpread(origin,mass,coherence=.5){
  const g=graphDistances(origin),raw={},lambda=.72+.78*clamp(coherence),cut=3.6;let sum=0;
  for(let i=0;i<g.zones.length;i++){const d=g.D[i];if(!Number.isFinite(d)||d>cut)continue;const w=Math.exp(-d/lambda);raw[g.zones[i]]=w;sum+=w}
  if(!(sum>0))return {[origin]:mass};
  const out={};for(const [z,w] of Object.entries(raw))out[z]=mass*w/sum;return out
 }
 function setPhrase(kind='SHORT'){
  state.phrase=String(kind).toUpperCase().startsWith('LONG')?'LONG':'SHORT';
  const cfg=state.phrase==='LONG'?LONG:SHORT;
  for(let i=0;i<state.modes.length;i++)Object.assign(state.modes[i],cfg[i]);
  return snapshot()
 }
 function drive(zoneAmps={},coherence=.5,dt=.04,phrase=null){
  if(!state.enabled)return snapshot();if(phrase)setPhrase(phrase);
  const entries=Object.entries(zoneAmps||{}).map(([z,v])=>[z,Math.max(0,Number(v)||0)]).filter(([,v])=>v>1e-8).sort((a,b)=>b[1]-a[1]);
  const base=entries.reduce((s,[,v])=>s+v,0),dominant=entries[0]?.[0]||state.core_zone;
  state.total_input=base;state.core_zone=dominant||null;
  const cfg=state.phrase==='LONG'?LONG:SHORT,attack=1-Math.exp(-Math.max(.001,dt)/.055),release=Math.exp(-Math.max(0,dt)/.42);
  const zoneOut={};
  for(let i=0;i<state.modes.length;i++){
   const m=state.modes[i],target=base*cfg[i].gain*(i===0?1:(.72+.28*clamp(coherence)));
   m.energy=target>m.energy?m.energy+(target-m.energy)*attack:m.energy*release;
   if(i>0)m.phase_now=((Number(m.phase_now)||0)+2*Math.PI*Number(m.pole_hz||0)*Math.max(0,dt)+Number(m.phase_rad||0))%(2*Math.PI);
   if(!(m.energy>1e-8)||!dominant)continue;
   const spread=i===0?{[dominant]:m.energy}:privateSpread(dominant,m.energy,coherence);
   for(const [z,v] of Object.entries(spread))zoneOut[z]=(zoneOut[z]||0)+v;
  }
  state.zones=zoneOut;state.total_private_mass=Object.values(zoneOut).reduce((a,b)=>a+b,0);state.last_t=Number(C9?.b7?.clock||state.last_t);return snapshot()
 }
 function advance(dt){
  dt=Math.max(0,Number(dt)||0);if(!(dt>0))return snapshot();
  return drive({},0,dt)
 }
 function reset(){state.modes=(state.phrase==='LONG'?LONG:SHORT).map(m=>({...m,energy:0,phase_now:0}));state.zones={};state.core_zone=null;state.total_input=0;state.total_private_mass=0;return snapshot()}
 function snapshot(){return cp(state)}
 function acceptance(){
  const before=window.REALITI_HAPTIC_FIELD_V20?.exact?.()?.m?.slice?.()||null,saved=cp(state);
  reset();drive({'torso.upper_back':1},.8,.08,'SHORT');const a=snapshot(),after=window.REALITI_HAPTIC_FIELD_V20?.exact?.()?.m?.slice?.()||null;
  const haloZones=Object.keys(a.zones).filter(z=>z!=='torso.upper_back'&&a.zones[z]>1e-6),massModes=a.modes.reduce((s,m)=>s+Number(m.energy||0),0);
  Object.assign(state,saved);state.modes=saved.modes.map(x=>({...x}));state.zones={...saved.zones};
  return {pass:a.modes.length===7&&haloZones.length>0&&Math.abs(a.total_private_mass-massModes)<1e-6&&JSON.stringify(before)===JSON.stringify(after),mode_count:a.modes.length,halo_zone_count:haloZones.length,mass_error:Math.abs(a.total_private_mass-massModes),evidence_unchanged:JSON.stringify(before)===JSON.stringify(after)}
 }
 return {version:1,drive,advance,setPhrase,snapshot,reset,acceptance,law:state.law};
})();

const AURA=(()=>{
 const N=128,KAPPAS=[.25,1.6,5.0,14.6],K=[],impulses=[],prev=new Map(),onsets=new Map();
 const PRESSURE_JND=.04,RECRUIT_JND=.08,FILL_JND=.06,SELF_FACTOR=.45,ALPHA_MAX=.08,EPS=.002,MAX_IMPULSES=96,MAX_ONSETS=3;
 let enabled=true,renderer=null;
 const POS={
  'head.crown':[0,-.95],'head.nape':[0,-.64],'face.chin':[0,-.57],'face.forehead':[0,-.78],'face.cheek.L':[-.20,-.66],'face.cheek.R':[.20,-.66],'neck.front':[0,-.50],
  'shoulder.L':[-.58,-.48],'shoulder.R':[.58,-.48],'arm.L.upper':[-.73,-.28],'arm.R.upper':[.73,-.28],'arm.L.elbow':[-.82,-.12],'arm.R.elbow':[.82,-.12],
  'arm.L.forearm':[-.90,-.04],'arm.R.forearm':[.90,-.04],'hand.L.palm':[-.96,.02],'hand.R.palm':[.96,.02],'hand.L.fingers':[-1,.06],'hand.R.fingers':[1,.06],
  'torso.sternum':[0,-.24],'torso.upper_back':[0,-.25],'torso.mid_back':[0,-.05],'torso.lower_back':[0,.18],'torso.abdomen':[0,.08],'pelvis.seat':[0,.23],
  'hip.L':[-.24,.33],'hip.R':[.24,.33],'leg.L.thigh':[-.33,.43],'leg.R.thigh':[.33,.43],'knee.L':[-.31,.58],'knee.R':[.31,.58],
  'leg.L.shin':[-.30,.72],'leg.R.shin':[.30,.72],'foot.L.sole':[-.36,.96],'foot.R.sole':[.36,.96],'tail.tip':[0,.92]
 };
 for(const k of KAPPAS){const a=new Float64Array(N);for(let j=0;j<N;j++){const d=(j/N)*Math.PI*2;a[j]=Math.exp(k*(Math.cos(d)-1))}K.push(a)}
 const tnow=()=>Number(C9?.b7?.clock||0);
 function locate(zone){let p=POS[zone];if(!p){const s=String(zone||'');if(/\.L\b/.test(s))p=[-.62,0];else if(/\.R\b/.test(s))p=[.62,0];else if(/head|crown|nape|face/.test(s))p=[0,-.72];else if(/foot|shin|thigh|leg|tail/.test(s))p=[0,.7];else p=[0,0]}const [x,y]=p,r=clamp(Math.hypot(x,y)),theta=Math.atan2(y,x);return {theta,r}}
 function kidx(k){let bi=0,bd=Infinity;for(let i=0;i<KAPPAS.length;i++){const d=Math.abs(KAPPAS[i]-k);if(d<bd){bd=d;bi=i}}return bi}
 function envelope(age){return .7*Math.exp(-age/.3)+.3*Math.exp(-age/4)}
 function prune(t=tnow()){for(let i=impulses.length-1;i>=0;i--){const age=Math.max(0,t-impulses[i].t);if(age>18||envelope(age)<EPS)impulses.splice(i,1)}}
 function field(t=tnow()){
  prune(t);const out=new Float64Array(N);
  for(const im of impulses){const age=Math.max(0,t-im.t),e=envelope(age);if(e<EPS)continue;const ker=K[im.ki],shift=Math.round((((im.theta%(2*Math.PI))+2*Math.PI)%(2*Math.PI))/(2*Math.PI)*N);for(let j=0;j<N;j++)out[j]+=im.amp*e*ker[(j-shift+N)%N]}
  let mx=0;for(const v of out)mx=Math.max(mx,v);return {bins:Array.from(out),peak:mx,alpha_peak:Math.min(ALPHA_MAX,ALPHA_MAX*clamp(mx)),active_impulses:impulses.length}
 }
 function emit(){if(typeof renderer==='function'){try{renderer(internalView())}catch(e){}}}
 function pulse(zone,res,source,thicc,continued=false){
  if(!enabled||!res||res.gap||!(Number(res.observed)>0))return null;
  const t=tnow(),key=String(zone),old=continued?(prev.get(key)||{p:0,r:0,f:0}):{p:0,r:0,f:0},p=Math.abs(Number(res.observed)||0),r=clamp(thicc?.recruit),f=clamp(thicc?.fill),dP=Math.abs(p-old.p),dR=Math.abs(r-old.r),dF=Math.abs(f-old.f);
  const A=Math.max(0,dP/PRESSURE_JND-1)+(continued?0:Math.max(0,dR/RECRUIT_JND-1)+Math.max(0,dF/FILL_JND-1));
  prev.set(key,{p,r,f});if(!(A>0))return null;
  const hist=(onsets.get(key)||[]).filter(x=>t-x<1);if(hist.length>=MAX_ONSETS)return null;hist.push(t);onsets.set(key,hist);
  const loc=locate(zone),kap=14.6*loc.r*loc.r,src=/^SELF/.test(String(source||''))?SELF_FACTOR:1,amp=src*(1-Math.exp(-A/3)),im={t,zone:String(zone),theta:loc.theta,ki:kidx(kap),amp,source:String(source||''),private:true};
  impulses.push(im);if(impulses.length>MAX_IMPULSES)impulses.splice(0,impulses.length-MAX_IMPULSES);emit();return cp(im)
 }
 function advance(){prune();if(impulses.length)emit();return impulses.length}
 function clear(){impulses.length=0;prev.clear();onsets.clear();emit()}
 function setEnabled(v){enabled=!!v;if(!enabled)clear();return enabled}
 function attachRenderer(fn){renderer=typeof fn==='function'?fn:null;return !!renderer}
 function renderTo(canvas){
  if(!canvas?.getContext)return false;const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return false;
  const w=Math.max(1,Number(canvas.width)||320),h=Math.max(1,Number(canvas.height)||180),f=field(),cx=w/2,cy=h/2,rx=w*.46,ry=h*.46;ctx.clearRect(0,0,w,h);ctx.lineCap='round';ctx.lineWidth=Math.max(2,Math.min(w,h)*.035);
  for(let j=0;j<N;j++){const a=ALPHA_MAX*clamp(f.peak?f.bins[j]/f.peak:0)*clamp(f.peak);if(a<.001)continue;const th=(j/N)*Math.PI*2,nx=((j+1)/N)*Math.PI*2;ctx.strokeStyle='rgba(232,198,166,'+a.toFixed(4)+')';ctx.beginPath();ctx.moveTo(cx+Math.cos(th)*rx,cy+Math.sin(th)*ry);ctx.lineTo(cx+Math.cos(nx)*rx,cy+Math.sin(nx)*ry);ctx.stroke()}
  return true
 }
 function internalView(){const f=field();return {schema:'REALITI_AURA_V1',version:1,private:true,enabled,bins:N,active_impulses:f.active_impulses,peak:+f.peak.toFixed(6),alpha_peak:+f.alpha_peak.toFixed(6),kappa_regimes:KAPPAS.slice(),limits:{pressure_jnd:PRESSURE_JND,recruitment_jnd:RECRUIT_JND,fill_jnd:FILL_JND,self_factor:SELF_FACTOR,max_onsets_per_zone_s:MAX_ONSETS,max_impulses:MAX_IMPULSES},field:f.bins,law:'AURA echoes meaningful grounded haptic innovation; it never mints evidence or world authority.'}}
 function acceptance(){
  const before=window.REALITI_HAPTIC_FIELD_V20?.exact?.()?.m?.slice?.()||null,save={enabled,impulses:cp(impulses),prev:[...prev.entries()].map(([k,v])=>[k,cp(v)]),onsets:[...onsets.entries()].map(([k,v])=>[k,v.slice()])};
  clear();enabled=true;const one=pulse('hand.L.palm',{observed:.8,gap:false},'WORLD_GROUNDED',{recruit:.7,fill:.5},false),v1=internalView(),n1=v1.active_impulses;const repeat=pulse('hand.L.palm',{observed:.8,gap:false},'WORLD_GROUNDED',{recruit:.7,fill:.5},true),n2=internalView().active_impulses;const absent=pulse('hand.R.palm',{observed:0,gap:false},'PREDICTED',{recruit:0,fill:0},false),n3=internalView().active_impulses,after=window.REALITI_HAPTIC_FIELD_V20?.exact?.()?.m?.slice?.()||null;
  clear();enabled=save.enabled;for(const x of save.impulses)impulses.push(x);for(const [k,v] of save.prev)prev.set(k,v);for(const [k,v] of save.onsets)onsets.set(k,v);
  return {pass:!!one&&v1.field.length===N&&v1.peak>0&&n2===n1&&!repeat&&!absent&&n3===n2&&JSON.stringify(before)===JSON.stringify(after),bins:v1.field.length,peak:v1.peak,steady_repeated:n2-n1,predicted_absence_added:n3-n2,evidence_unchanged:JSON.stringify(before)===JSON.stringify(after)}
 }
 return {version:1,pulse,advance,clear,setEnabled,attachRenderer,renderTo,internalView,acceptance,law:'private haptic-innovation echo; no reverse edge into evidence'};
})();
  const tick=ms=>{
    valid(ms,'elapsed simulation milliseconds',0,86400000);
    elapsedMs+=ms;C9.b7.clock=elapsedMs/1000;
    THICC.advance();HALO.advance(ms/1000);AURA.advance();
    return {clockMs:elapsedMs,private_only:true};
  };
  const contact=(zone,observed,source,continued=false)=>{
    if(!mapped.has(zone))throw RangeError('UNKNOWN_ZONE');
    valid(observed,'observed intensity');
    const rec=THICC.contact(zone,observed,source);
    const pulse=AURA.pulse(zone,{observed,gap:false},source,rec,continued);
    return {thicc:rec,aura:pulse};
  };
  return Object.freeze({THICC:Object.freeze(THICC),HALO:Object.freeze(HALO),
    AURA:Object.freeze(AURA),tick,contact,clockMs:()=>elapsedMs});
}
return Object.freeze({createRenderers,mechanisms:['THICC','HALO','AURA']});
});
