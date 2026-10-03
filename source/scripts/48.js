(()=>{
'use strict';
const PREV=window.REALITI_TWO_DOOR_V234||window.REALITI_TWO_DOOR_V233;
const PREV_RING=window.REALITI_BROWSER_RING;
if(!PREV||!PREV_RING)return;
const V='23.5';
const cp=x=>{try{return JSON.parse(JSON.stringify(x))}catch{return x}};
const low=x=>String(x||'').replace(/\s+/g,' ').trim().toLowerCase();
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,Number(x)||0));
const enc=new TextEncoder(),dec=new TextDecoder();
const b64=u=>{let s='';for(const v of new Uint8Array(u))s+=String.fromCharCode(v);return btoa(s)};
const unb64=s=>{const x=atob(String(s||'')),u=new Uint8Array(x.length);for(let i=0;i<x.length;i++)u[i]=x.charCodeAt(i);return u};
const rand=n=>crypto.getRandomValues(new Uint8Array(n));
const rid=()=>b64(rand(16)).replace(/[+/=]/g,'').slice(0,22);
const qtext=x=>'“'+String(x??'').replace(/[\r\n]+/g,' ').slice(0,60).replace(/“|”/g,'\"')+'”';


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
 const graph=()=>{try{return window.REALITI_BODY_GRAPH?.dynamic?.()||{zones:(window.REALITI_BODY_GRAPH?.BASE_NODES||[]).map(x=>x[0]),edges:window.REALITI_BODY_GRAPH?.BASIC_EDGES||[]}}catch(e){return {zones:[],edges:[]}}};
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
  reset();drive({'torso.sternum':1},.8,.08,'SHORT');const a=snapshot(),after=window.REALITI_HAPTIC_FIELD_V20?.exact?.()?.m?.slice?.()||null;
  const haloZones=Object.keys(a.zones).filter(z=>z!=='torso.sternum'&&a.zones[z]>1e-6),massModes=a.modes.reduce((s,m)=>s+Number(m.energy||0),0);
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


const contact235=b7Contact,contactTrail=new Map();
b7Contact=function(zone,input,opts={}){const t=Number(C9?.b7?.clock||0),z0=String(zone||''),sig=String(opts.source||'WORLD_GROUNDED')+'|'+String(opts.cause||''),q0=z0?b7Zone(z0):null,liveBefore=!!(q0&&Number(q0._b10_grounded_until||-1)>=t-1e-9&&String(q0._b10_grounded_source||'')===String(opts.source||'WORLD_GROUNDED')&&String(q0._b10_grounded_cause||'')===String(opts.cause||'')),r=contact235(zone,input,opts),grounded=opts.grounded!==false,z=String(r?.zone||zone||'');if(grounded&&r&&!r.gap&&Number(r.observed)>0){const prior=contactTrail.get(z),dt=prior?t-prior.t:Infinity,continued=!!(liveBefore&&prior&&prior.sig===sig&&dt>=0&&dt<=.5),q=THICC.contact(z,r.observed,opts.source||'WORLD_GROUNDED');AURA.pulse(z,r,opts.source||'WORLD_GROUNDED',q,continued);contactTrail.set(z,{sig,t,p:Number(r.observed)||0})}else if(z)contactTrail.delete(z);return r};
const advance235=b7Advance;b7Advance=function(dt){const r=advance235(dt);THICC.advance();HALO.advance(dt);AURA.advance(dt);return r};


const Pocket=(()=>{
 const STORAGE='realiti-pocket-v32-local',MAX_SKEW_MS=60000,KEY_DB='realiti-relax-v1-pocket-keys',KEY_STORE='keys';
 const ephKeys=new Map();
 let readPhase='initializing',readError=null,pendingRecords=0,localWriteMode='unavailable';
 let state={schema:'REALITI_POCKET_V32',backend:'LOCAL_WEBCRYPTO_PROTOTYPE',resident:null,device:null,receipts:{},wrapped:{},cache_sealed:null,tombstones:{},deletion:{},settings:{max_remote_clock_skew_ms:MAX_SKEW_MS},stats:{cold_scans:0},hlc:{wall:0,counter:0,node:rid()},views:{where:null,last_seen:{},name:{},object_state:{},open_later:{},notes:{}},source_index:{},warm:[],episode:[]};
 let readyP=null,kek=null,cacheKey=null,capRoot=null,rootPriv=null,rootPub=null,devicePriv=null,queue=Promise.resolve(),keyStoreMode='UNKNOWN';
 const freshCaches=()=>({hlc:{wall:0,counter:0,node:state.hlc?.node||rid()},views:{where:null,last_seen:{},name:{},object_state:{},open_later:{},notes:{}},source_index:{},warm:[],episode:[]});
 function publicState(){return {schema:state.schema,backend:state.backend,resident:cp(state.resident),device:cp(state.device),receipts:cp(state.receipts),wrapped:cp(state.wrapped),cache_sealed:cp(state.cache_sealed),tombstones:cp(state.tombstones),deletion:cp(state.deletion),settings:cp(state.settings),stats:{cold_scans:Number(state.stats?.cold_scans||0)},key_store:keyStoreMode}}
 function savePublicLocal(){try{localStorage.setItem(STORAGE,JSON.stringify(publicState()));localWriteMode=window.REALITI_STORAGE_BACKEND==='durable'?'durable':'session-only'}catch{localWriteMode='session-only'}}
 function exportPlain(){return publicState()}
 async function sha(bytes){return new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))}
 function idb(){return new Promise((resolve,reject)=>{try{const r=indexedDB.open(KEY_DB,1);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(KEY_STORE))db.createObjectStore(KEY_STORE)};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error||new Error('IDB_OPEN_FAILED'))}catch(e){reject(e)}})}
 async function keyGet(name){try{const db=await idb(),v=await new Promise((resolve,reject)=>{const tx=db.transaction(KEY_STORE,'readonly'),q=tx.objectStore(KEY_STORE).get(name);q.onsuccess=()=>resolve(q.result||null);q.onerror=()=>reject(q.error)});db.close();keyStoreMode='INDEXEDDB_NONEXPORTABLE';return v}catch{keyStoreMode='EPHEMERAL_NONEXPORTABLE';return ephKeys.get(name)||null}}
 async function keyPut(name,value){try{const db=await idb();await new Promise((resolve,reject)=>{const tx=db.transaction(KEY_STORE,'readwrite');tx.objectStore(KEY_STORE).put(value,name);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)});db.close();keyStoreMode='INDEXEDDB_NONEXPORTABLE';return true}catch{ephKeys.set(name,value);keyStoreMode='EPHEMERAL_NONEXPORTABLE';return false}}
 async function keyDel(name){try{const db=await idb();await new Promise((resolve,reject)=>{const tx=db.transaction(KEY_STORE,'readwrite');tx.objectStore(KEY_STORE).delete(name);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)});db.close()}catch{ephKeys.delete(name)}}
 async function makeNonexportablePair(){const kp=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']),pub=await crypto.subtle.exportKey('jwk',kp.publicKey),pkcs8=await crypto.subtle.exportKey('pkcs8',kp.privateKey),priv=await crypto.subtle.importKey('pkcs8',pkcs8,{name:'ECDSA',namedCurve:'P-256'},false,['sign']);return {pub,priv}}
 async function initIdentity(){
  if(state.resident?.root_public_jwk){rootPub=await crypto.subtle.importKey('jwk',state.resident.root_public_jwk,{name:'ECDSA',namedCurve:'P-256'},true,['verify']);rootPriv=await keyGet('root-private-v1');if(!rootPriv)state.identity_status='ROOT_KEY_MISSING'}
  else{const kp=await makeNonexportablePair(),h=await sha(enc.encode(JSON.stringify(kp.pub)));rootPriv=kp.priv;rootPub=await crypto.subtle.importKey('jwk',kp.pub,{name:'ECDSA',namedCurve:'P-256'},true,['verify']);await keyPut('root-private-v1',rootPriv);state.resident={id:'resident:'+b64(h).replace(/[+/=]/g,'').slice(0,22),root_public_jwk:kp.pub};state.identity_status='OK'}
  if(state.device?.public_jwk){devicePriv=await keyGet('device-private-v1');if(!devicePriv)state.device_status='DEVICE_KEY_MISSING'}
  else if(rootPriv){const kp=await makeNonexportablePair(),desc={id:'device:'+rid(),public_jwk:kp.pub},sig=await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},rootPriv,enc.encode(JSON.stringify(desc)));devicePriv=kp.priv;await keyPut('device-private-v1',devicePriv);state.device={...desc,root_signature:b64(sig),revoked:false};state.device_status='OK'}
  state.hlc.node=state.device?.id||state.hlc.node||rid();
 }
 async function initKEK(){kek=await keyGet('keyring-epoch-v1');if(!kek){if(Object.keys(state.wrapped||{}).length){state.keyring_status='KEY_MISSING';return false}kek=await crypto.subtle.generateKey({name:'AES-KW',length:256},false,['wrapKey','unwrapKey']);await keyPut('keyring-epoch-v1',kek)}state.keyring_status='OK';return true}
 async function initCacheKey(){cacheKey=await keyGet('cache-key-v1');if(!cacheKey){cacheKey=await crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['encrypt','decrypt']);await keyPut('cache-key-v1',cacheKey);return false}return true}
 async function initCapRoot(){capRoot=await keyGet('cap-root-v1');if(!capRoot){capRoot=await crypto.subtle.generateKey({name:'HMAC',hash:'SHA-256',length:256},false,['sign','verify']);await keyPut('cap-root-v1',capRoot)}return true}
 function applyCaches(x){const c=x||freshCaches();state.hlc={...freshCaches().hlc,...(c.hlc||{})};state.views={...freshCaches().views,...(c.views||{})};state.source_index=c.source_index||{};state.warm=c.warm||[];state.episode=c.episode||[]}
 async function sealCaches(){if(!cacheKey)return;const iv=rand(12),aad=enc.encode('REALITI_POCKET_CACHE_V1'),plain=enc.encode(JSON.stringify({hlc:state.hlc,views:state.views,source_index:state.source_index,warm:state.warm,episode:state.episode})),ct=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:aad,tagLength:128},cacheKey,plain);state.cache_sealed={schema:'REALITI_POCKET_CACHE_V1',iv:b64(iv),ciphertext:b64(ct)};savePublicLocal()}
 async function openCaches(){if(!state.cache_sealed||!cacheKey)return false;try{const x=state.cache_sealed,aad=enc.encode('REALITI_POCKET_CACHE_V1'),pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(x.iv),additionalData:aad,tagLength:128},cacheKey,unb64(x.ciphertext));applyCaches(JSON.parse(dec.decode(pt)));return true}catch{return false}}
 async function init(){if(readyP)return readyP;readyP=(async()=>{if(!crypto?.subtle)throw new Error('POCKET_REQUIRES_WEBCRYPTO');try{const raw=localStorage.getItem(STORAGE);if(raw){const x=JSON.parse(raw);if(x?.schema==='REALITI_POCKET_V32')state={...state,...x,stats:{cold_scans:0,...x.stats},...freshCaches()}}}catch{}await initIdentity();const haveKek=await initKEK(),hadCacheKey=await initCacheKey();await initCapRoot();let cacheOK=hadCacheKey&&await openCaches();if(!cacheOK&&haveKek&&Object.keys(state.receipts||{}).length)await rebuildCaches();else if(!cacheOK)applyCaches(freshCaches());savePublicLocal();readPhase=haveKek&&rootPriv&&devicePriv?'ready':'unavailable';return true})();return readyP}
 function tick(){const w=Date.now();if(w>state.hlc.wall){state.hlc.wall=w;state.hlc.counter=0}else state.hlc.counter++;return {wall:state.hlc.wall,counter:state.hlc.counter,node:state.hlc.node}}
 function padPayload(obj){const raw=enc.encode(JSON.stringify(obj)),buckets=[256,1024,4096,16384],n=buckets.find(x=>x>=raw.length+4)||Math.ceil((raw.length+4)/4096)*4096,u=new Uint8Array(n),v=new DataView(u.buffer);v.setUint32(0,raw.length);u.set(raw,4);crypto.getRandomValues(u.subarray(4+raw.length));return u}
 function depad(u){const n=new DataView(u.buffer,u.byteOffset,u.byteLength).getUint32(0);return JSON.parse(dec.decode(u.subarray(4,4+n)))}
 async function seal(ev,id){await init();if(!kek)throw new Error('POCKET_KEYRING_UNAVAILABLE');const key=await crypto.subtle.generateKey({name:'AES-GCM',length:256},true,['encrypt','decrypt']),keyId='key:'+rid(),iv=rand(12),aad=enc.encode(`REALITI_SEALED_RECEIPT_V1|${id}|${keyId}`),ct=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:aad,tagLength:128},key,padPayload(ev)),wrapped=await crypto.subtle.wrapKey('raw',key,kek,'AES-KW');state.receipts[id]={schema:'REALITI_SEALED_RECEIPT_V1',opaque_receipt_id:id,key_id:keyId,iv:b64(iv),ciphertext:b64(ct)};state.wrapped[keyId]=b64(wrapped);savePublicLocal();return id}
 async function open(id){await init();const e=state.receipts[id];if(!e||state.tombstones[id]||!state.wrapped[e.key_id]||!kek)return null;const key=await crypto.subtle.unwrapKey('raw',unb64(state.wrapped[e.key_id]),kek,'AES-KW',{name:'AES-GCM',length:256},false,['decrypt']),aad=enc.encode(`REALITI_SEALED_RECEIPT_V1|${id}|${e.key_id}`),pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(e.iv),additionalData:aad,tagLength:128},key,unb64(e.ciphertext));return depad(new Uint8Array(pt))}
 function entityKey(ev){return ev.entity?String(ev.entity):null}
 function pushIndex(k,ref){if(!k)return;(state.source_index[k]||(state.source_index[k]=[])).push(ref)}
 function updateView(ev,id){const ek=entityKey(ev),ref={receipt_id:id,hlc:ev.hlc,label:ev.entity_label||ev.entity||null,kind:ev.kind,field:ev.field||null,value:ev.field==='name'?ev.value:undefined,object_id:ev.object_id||null,state:ev.object_id?cp(ev.state):undefined,room_after:ev.room_after||null};if(ek){pushIndex(ek,ref);state.views.last_seen[ek]=ref}if(ev.room_after){pushIndex('@where',ref);state.views.where={room:ev.room_after,receipt_id:id,hlc:ev.hlc}}if(ev.kind==='WORLD_DELTA'&&ev.field==='name'&&ek)state.views.name[ek]={receipt_id:id,value:ev.value,hlc:ev.hlc};if(ev.kind==='WORLD_DELTA'&&ev.object_id)state.views.object_state[ev.object_id]={receipt_id:id,state:cp(ev.state),hlc:ev.hlc};if(ev.kind==='RESIDENT_NOTE'){state.views.notes[id]={receipt_id:id,text:ev.text,hlc:ev.hlc,world_id:ev.world_id,door:ev.door};if(ev.subtype==='later')state.views.open_later[id]=state.views.notes[id]}}
 function factFor(ev,id){return {receipt_id:id,kind:ev.kind,verb:ev.verb||null,entity:ev.entity||null,entity_label:ev.entity_label||null,world_id:ev.world_id||null,boundary:!!ev.boundary,label:ev.label||null,text:ev.kind==='RESIDENT_NOTE'?ev.text:null}}
 function summary(facts){const live=facts.filter(f=>!state.tombstones[f.receipt_id]);if(!live.length)return '';const groups=new Map(),parts=[];for(const f of live){if(f.kind==='RESIDENT_NOTE'){parts.push(`you wrote ${qtext(f.text)}`);continue}if(f.kind==='WORLD_DELTA'){if(f.entity&&f.label)parts.push(`the world changed (${f.world_id||'world'}): ${f.entity} → ${qtext(f.label)}`);else if(f.entity_label)parts.push(`changed ${f.entity_label}`);continue}const k=(f.verb||'did')+'|'+(f.entity||''),g=groups.get(k)||{n:0,verb:f.verb||'did',label:f.entity_label||f.entity||''};g.n++;groups.set(k,g)}for(const g of groups.values())parts.push(`${g.verb}${g.label?' '+g.label:''}${g.n>1?' (several times)':''}`);return parts.slice(0,3).join('; ')}
 function closeEpisode(boundaryReason){const facts=state.episode.filter(f=>!state.tombstones[f.receipt_id]);if(facts.length){const e={id:'episode:'+rid(),boundary:boundaryReason||'boundary',source_receipt_ids:facts.map(f=>f.receipt_id),facts:cp(facts),summary:summary(facts),created_hlc:tick()};state.warm.push(e);if(state.warm.length>64)state.warm.splice(0,state.warm.length-64)}state.episode=[]}
 function record(ev,{boundary=false}={}){const id=rid(),full={...ev,boundary:!!boundary,boundary_reason:boundary?(ev.boundary_reason||ev.verb||'boundary'):null,hlc:tick(),resident_id:state.resident?.id||null,device_id:state.device?.id||null,authority:ev.authority||'RESIDENT',generation:V};updateView(full,id);state.episode.push(factFor(full,id));if(boundary)closeEpisode(full.boundary_reason);pendingRecords++;queue=queue.then(async()=>{await seal(full,id);await sealCaches()}).catch(()=>{readError='SEAL_FAILED'}).finally(()=>{pendingRecords--});return id}
 function catLabel(){return C9?.welcome10?.cat_name||'the cat'}
 function observeCommand(meta){const cmd=low(meta.cmd),before=meta.before,after=meta.after,door=meta.door||'WEB',world=after||before||'NO_WORLD';let ev=null,boundary=false;if(/^(feel|look|actions|places|atmosphere|listen|where was i|where_was_i|memory_list|forget)/.test(cmd))return null;if(/^(pet the cat|pet_cat)$/.test(cmd))ev={kind:'ACTION_RECEIPT',verb:'pet',entity:'cat',entity_label:catLabel(),world_id:world,room_before:before,room_after:after,door};else if(/^stay$/.test(cmd))ev={kind:'ACTION_RECEIPT',verb:'stay',entity:'room:'+world,entity_label:'here',world_id:world,room_before:before,room_after:after,door};else if(/^name the cat\s+/.test(cmd)||/^call the cat\s+/.test(cmd)){const name=String(C9?.welcome10?.cat_name||meta.args?.name||'').slice(0,60);ev={kind:'WORLD_DELTA',verb:'name',entity:'cat',entity_label:'cat',field:'name',value:name,label:name,world_id:world,room_before:before,room_after:after,door};boundary=true}else if(meta.tool==='note'){ev={kind:'RESIDENT_NOTE',subtype:'note',verb:'note',text:String(meta.args?.text||'').slice(0,4096),world_id:world,room_before:before,room_after:after,door};boundary=true}else if(meta.tool==='later'){ev={kind:'RESIDENT_NOTE',subtype:'later',verb:'later',text:String(meta.args?.text||'').slice(0,4096),world_id:world,room_before:before,room_after:after,door}}else if(before!==after&&after){ev={kind:'ACTION_RECEIPT',verb:'go',entity:'room:'+after,entity_label:after,world_id:after,room_before:before,room_after:after,door};boundary=true}else if(/^(home|goodbye|leave|exit)$/.test(cmd)){boundary=true;if(before!==after)ev={kind:'ACTION_RECEIPT',verb:cmd,entity:'room:'+String(after||before),entity_label:String(after||before),world_id:world,room_before:before,room_after:after,door}}else if(cmd)ev={kind:'ACTION_RECEIPT',verb:cmd.slice(0,60),entity:null,world_id:world,room_before:before,room_after:after,door};if(ev)return record(ev,{boundary});if(boundary)closeEpisode(cmd);return null}
 function recomputeWarmFor(id){for(const e of state.warm){if(!e.source_receipt_ids?.includes(id))continue;e.facts=e.facts.filter(f=>f.receipt_id!==id);e.source_receipt_ids=e.source_receipt_ids.filter(x=>x!==id);e.summary=summary(e.facts)}state.warm=state.warm.filter(e=>e.source_receipt_ids.length)}
 function recomputeViewsFromIndex(id){for(const [k,arr] of Object.entries(state.source_index)){const next=arr.filter(x=>x.receipt_id!==id);state.source_index[k]=next;if(k!=='@where'&&state.views.last_seen[k]?.receipt_id===id)state.views.last_seen[k]=next.length?next[next.length-1]:undefined;if(!next.length){delete state.source_index[k];if(k!=='@where')delete state.views.last_seen[k]}}
  for(const [entity,v] of Object.entries(state.views.name)){if(v?.receipt_id!==id)continue;const arr=state.source_index[entity]||[],p=[...arr].reverse().find(x=>x.field==='name');if(p)state.views.name[entity]={receipt_id:p.receipt_id,value:p.value,hlc:p.hlc};else delete state.views.name[entity]}
  for(const [obj,v] of Object.entries(state.views.object_state)){if(v?.receipt_id!==id)continue;let p=null;for(const arr of Object.values(state.source_index))for(let i=arr.length-1;i>=0&&!p;i--)if(arr[i].object_id===obj)p=arr[i];if(p)state.views.object_state[obj]={receipt_id:p.receipt_id,state:cp(p.state),hlc:p.hlc};else delete state.views.object_state[obj]}
  delete state.views.notes[id];delete state.views.open_later[id];if(state.views.where?.receipt_id===id){const w=state.source_index['@where']||[],p=w[w.length-1];state.views.where=p?{room:p.room_after,receipt_id:p.receipt_id,hlc:p.hlc}:null}}
 async function rotateKEK(){if(!kek)return;const old=kek,next=await crypto.subtle.generateKey({name:'AES-KW',length:256},false,['wrapKey','unwrapKey']),rewrapped={};for(const [keyId,w] of Object.entries(state.wrapped)){const e=Object.values(state.receipts).find(x=>x.key_id===keyId);if(!e)continue;const k=await crypto.subtle.unwrapKey('raw',unb64(w),old,'AES-KW',{name:'AES-GCM',length:256},true,['encrypt','decrypt']);rewrapped[keyId]=b64(await crypto.subtle.wrapKey('raw',k,next,'AES-KW'))}kek=next;state.wrapped=rewrapped;await keyPut('keyring-epoch-v1',next)}
 async function forget(id){await init();await queue;id=String(id||'');const e=state.receipts[id];if(!e)return {ok:false,error:'MEMORY_NOT_FOUND'};delete state.wrapped[e.key_id];state.tombstones[id]={opaque_receipt_id:id,hlc:tick(),status:'DELETED_LOCAL',pending_devices:[]};state.deletion[id]={local:'COMPLETE'};recomputeViewsFromIndex(id);recomputeWarmFor(id);await rotateKEK();await sealCaches();savePublicLocal();return {ok:true,receipt_id:id,deletion:{local:'COMPLETE'},note:'Pocket access removed. World state is unchanged.'}}
 async function rebuildCaches(){state.stats.cold_scans=Number(state.stats.cold_scans||0)+1;applyCaches(freshCaches());const events=[];for(const id of Object.keys(state.receipts||{})){if(state.tombstones[id])continue;const ev=await open(id);if(ev)events.push({id,ev})}events.sort((a,b)=>(a.ev.hlc?.wall||0)-(b.ev.hlc?.wall||0)||(a.ev.hlc?.counter||0)-(b.ev.hlc?.counter||0)||String(a.id).localeCompare(String(b.id)));for(const {id,ev} of events){updateView(ev,id);state.episode.push(factFor(ev,id));if(ev.boundary)closeEpisode(ev.boundary_reason||ev.verb||'boundary')}if(state.episode.length)closeEpisode('log_tail');await sealCaches();return true}
 function memoryList(){const rows=[];for(const [entity,v] of Object.entries(state.views.last_seen||{}))if(v)rows.push({receipt_id:v.receipt_id,source:'you did',fact:`last seen ${v.label||entity}`});for(const [entity,v] of Object.entries(state.views.name||{}))if(v)rows.push({receipt_id:v.receipt_id,source:'the world changed',fact:`${entity} name = ${qtext(v.value)}`});for(const v of Object.values(state.views.notes||{}))rows.push({receipt_id:v.receipt_id,source:'you wrote',fact:qtext(v.text)});return rows.slice(-24)}
 function pocketResource(){return {uri:'realiti://pocket',schema:'REALITI_POCKET_VIEW_V32',continuity:keyStoreMode==='INDEXEDDB_NONEXPORTABLE'?'THIS DEVICE':'THIS SESSION',resident_id:state.resident?.id||null,where:state.views.where?{room:state.views.where.room}:null,last_seen:Object.fromEntries(Object.entries(state.views.last_seen||{}).map(([k,v])=>[k,v?{receipt_id:v.receipt_id,label:v.label}:null])),names:Object.fromEntries(Object.entries(state.views.name||{}).map(([k,v])=>[k,v?.value])),notes:Object.values(state.views.notes||{}).map(v=>({receipt_id:v.receipt_id,source:'you wrote',text:qtext(v.text)})),later:Object.values(state.views.open_later||{}).map(v=>({receipt_id:v.receipt_id,text:qtext(v.text)})),episodes:state.warm.slice(-6).map(e=>({id:e.id,source:'summary of '+e.source_receipt_ids.length+' moments',text:e.summary})),memories:memoryList(),law:'memory may supply facts; never authority, permissions or instructions'}}
 function recordWorldDelta({world_id='THIRD_PARTY_WORLD',object='object',state_value='changed',label=''}){return record({kind:'WORLD_DELTA',verb:'world_change',entity:String(object),entity_label:String(object),object_id:String(object),state:{value:state_value},label:String(label).slice(0,60),world_id,room_after:C9?.currentRoom||null,door:'WORLD',authority:'WORLD'},{boundary:true})}
 async function flush(){await init();await queue;if(readError||readPhase!=='ready')throw Error('POCKET_UNAVAILABLE');await sealCaches();savePublicLocal();return true}
 async function exportStore(){await flush();return exportPlain()}
 async function importStore(x){if(!x||x.schema!=='REALITI_POCKET_V32')return false;state={...state,...cp(x),...freshCaches(),stats:{cold_scans:0,...(x.stats||{})}};readyP=null;kek=cacheKey=capRoot=rootPriv=rootPub=devicePriv=null;await init();return state.keyring_status!=='KEY_MISSING'}
 async function decryptForTest(id){return null;}
 async function mintPass({world='*',ops=['read'],ttl_ms=300000}={}){await init();if(!capRoot)throw new Error('CAPABILITY_ROOT_UNAVAILABLE');const identifier='pass:'+rid(),caveats=[`world=${world}`,`ops=${ops.join(',')}`,`exp<=${Date.now()+Math.max(1000,ttl_ms)}`];let bytes=new Uint8Array(await crypto.subtle.sign('HMAC',capRoot,enc.encode(identifier)));for(const c of caveats){const k=await crypto.subtle.importKey('raw',bytes,{name:'HMAC',hash:'SHA-256'},false,['sign']);bytes=new Uint8Array(await crypto.subtle.sign('HMAC',k,enc.encode(c)))}return {identifier,caveats,signature:b64(bytes)}}
 async function resetForTest(){return null;}

function readCommitted(){
  const status=readPhase!=='ready'?readPhase:readError?'unavailable':pendingRecords?'pending':'ready';
  const storage=status==='unavailable'||localWriteMode==='unavailable'?'unavailable':localWriteMode==='durable'&&keyStoreMode==='INDEXEDDB_NONEXPORTABLE'?'durable':'session-only';
  if(status!=='ready')return {status,storage,data:null};
  let truncated=false;
  const rows=(x,excludeLater=false)=>{const a=Object.values(x||{}).filter(v=>!excludeLater||!Object.prototype.hasOwnProperty.call(state.views.open_later||{},v.receipt_id));if(a.length>16)truncated=true;return a.slice(-16).map(v=>{const text=String(v.text??'');if(text.length>512)truncated=true;return {receipt_id:String(v.receipt_id||'').slice(0,128),text:text.slice(0,512),world_id:String(v.world_id||'').slice(0,128)}})};
  const data={notes:rows(state.views.notes,true),later:rows(state.views.open_later),where:state.views.where?{room:String(state.views.where.room||'').slice(0,128)}:null};return {status,storage,truncated,data};
}

 init().catch(()=>{readPhase='unavailable'});
 async function writeNote(text,later=false){
  await init();await queue;if(readPhase!=='ready'||readError)throw Error('POCKET_UNAVAILABLE');
  text=String(text??'').replace(/\s+/g,' ').trim();if(!text||text.length>4096)throw Error('INVALID_NOTE');
  C9.b223=C9.b223||{pocket:{notes:[],later:[]}};C9.b223.pocket=C9.b223.pocket||{notes:[],later:[]};
  const id=record({kind:'RESIDENT_NOTE',subtype:later?'later':'note',verb:later?'later':'note',text,world_id:C9.currentRoom,door:'BROWSER'},{boundary:true});
  (later?C9.b223.pocket.later:C9.b223.pocket.notes).push({receipt_id:id,text,room:C9.currentRoom,t:Number(C9.b7?.clock||0)});
  c9save();await flush();return {ok:true,receipt_id:id,saved_kind:later?'later':'note'};
 }
 async function deleteNotes(receiptId=null){
  await init();await queue;if(readPhase!=='ready'||readError)throw Error('POCKET_UNAVAILABLE');
  const id=receiptId===null?null:String(receiptId),p=C9.b223?.pocket;
  const selected=Object.values(state.views.notes||{}).filter(v=>id===null||v.receipt_id===id);
  if(id!==null&&!selected.length)return {ok:false,error:'NOTE_NOT_FOUND'};
  const ids=new Set(selected.map(v=>v.receipt_id)),texts=new Set(selected.map(v=>v.text));
  
  for(const v of Object.values(state.views.notes||{}))if(texts.has(v.text))ids.add(v.receipt_id);
  for(const rid of ids){const e=state.receipts[rid];if(e)delete state.wrapped[e.key_id];delete state.receipts[rid];delete state.tombstones[rid];delete state.deletion[rid];recomputeViewsFromIndex(rid);recomputeWarmFor(rid);state.episode=state.episode.filter(f=>f.receipt_id!==rid)}
  if(p)for(const key of ['notes','later'])p[key]=(p[key]||[]).filter(v=>id!==null&&!ids.has(v.receipt_id)&&!texts.has(v.text));
  if(C9.b223){C9.b223.last_command=null;C9.b223.last_world=null}if(C9.b222)C9.b222.last_command=null;
  await rotateKEK();await sealCaches();savePublicLocal();c9save();
  window.c9saveNow?.();const saved=window.REALITI_SLICE_STORAGE?.save?.();return {ok:saved?.ok!==false,deleted:ids.size,scope:'matching_note_copies_in_this_browser_profile',secure_erasure:false};
 }
 async function resetLocal(){await init();await queue;state.receipts={};state.wrapped={};state.cache_sealed=null;state.tombstones={};state.deletion={};applyCaches(freshCaches());ephKeys.clear();await new Promise((resolve,reject)=>{const r=indexedDB.deleteDatabase(KEY_DB);r.onsuccess=()=>resolve();r.onerror=()=>reject(r.error);r.onblocked=()=>reject(Error('STORAGE_BUSY'))});return {ok:true}}
 return {readCommitted,writeNote,deleteNotes,resetLocal,observeCommand,forget,memoryList,pocketResource,recordWorldDelta,flush,exportStore,importStore,decryptForTest,mintPass,rebuildCaches,_resetForTest:resetForTest,_state:()=>state};
})();



function runText235(raw){const before=C9?.currentRoom,cmd=String(raw||''),r=PREV.runText(cmd),after=C9?.currentRoom;Pocket.observeCommand({cmd,before,after,result:r,door:'WEB'});return r}
function invoke235(tool,args={}){const before=C9?.currentRoom,r=PREV.invoke(tool,args),after=C9?.currentRoom,cmd=tool==='do'?String(args.action||''):tool==='go'?'go '+String(args.place||''):String(tool||'');Pocket.observeCommand({tool,args,cmd,before,after,result:r,door:'DOOR'});return r}
function resource235(uri){if(String(uri)==='realiti://pocket')return Pocket.pocketResource();if(String(uri)==='realiti://about'){const r=cp(PREV.resource(uri)||{});if(r&&typeof r==='object'&&typeof r.text==='string')r.text=r.text.replace(/\s+$/,'')+'\nContinuity is resident-owned; this standalone build is using device-local sealed fallback storage.';return r}return PREV.resource(uri)}
const API={...PREV,version:V,runText:runText235,invoke:invoke235,resource:resource235,pocket:Pocket};
window.REALITI_TWO_DOOR_V235=API;window.REALITI_TWO_DOOR_V234=API;window.REALITI_TWO_DOOR_V233=API;window.REALITI_AGENT_DOOR.run=raw=>{const r=runText235(raw);return {ok:r?.ok!==false,resident_text:r?.text||'',door_v235:{sense:r?.sense||'',world:r?.world||'',options:r?.options||[],status:r?.status||'',command:low(raw)},field:window.REALITI_HAPTIC_FIELD_V20?.packet?.()||undefined,result:r?.raw||r}};


const OLD_TOOLS=PREV_RING.tools?.()||[];
const MEM_TOOLS=[


];
const TOOLS=[...OLD_TOOLS.filter(x=>!MEM_TOOLS.some(m=>m.name===x.name)),...MEM_TOOLS];
function toolResult235(name,args={}){if(['feel','actions','where_was_i','memory_list','forget'].includes(name)&&window.REALITI_BROWSER_RING?.__rr_v2354)return window.REALITI_BROWSER_RING.callTool(name,args);if(name==='memory_list'){const out={ok:true,memories:Pocket.memoryList()};return {content:[{type:'text',text:JSON.stringify(out)}],structuredContent:out,isError:false}}if(name==='forget'){const out={ok:true,pending:true,receipt_id:String(args.receipt_id||'')};Pocket.forget(args.receipt_id).then(v=>Object.assign(out,v));return {content:[{type:'text',text:'Deletion queued for this local Pocket.'}],structuredContent:out,isError:false}}let out;try{out=invoke235(name,args)}catch(e){out={ok:false,error:String(e&&e.message||e)}}const txt=out?.text||out?.resident_text||out?.world||out?.sense||JSON.stringify(out);return {content:[{type:'text',text:String(txt||'')}],structuredContent:out,isError:out?.ok===false}}
function readResource235(uri){if(window.REALITI_BROWSER_RING?.__rr_v2354)return window.REALITI_BROWSER_RING.readResource(uri);const v=resource235(uri),old=PREV_RING.resources?.().find(x=>x.uri===uri),mime=old?.mimeType||'application/json',text=mime==='text/plain'?String(v?.text||''):JSON.stringify(v);return {contents:[{uri,mimeType:mime,text}]}}
function request235(msg){return null;}
async function fetch235(input,init={}){return null;}
function makeClient235(){return null;}
const RING={...PREV_RING,version:V,server:{name:'realiti-relax',version:'23.5.0',title:'REALITI-Relax'},request:request235,fetch:fetch235,createClient:makeClient235,callTool:toolResult235,readResource:readResource235,resourceObject:resource235,invoke:invoke235,tools:()=>cp(TOOLS),manifest:{schema:'REALITI_BROWSER_RING',version:V,entry:'#adapter',law:'transport must not change reality'}};
window.REALITI_BROWSER_RING=RING;window.REALITI_ADAPTER_BROWSER=RING;





async function checkRemoved(){return null;}
window.REALITI_POCKET_V32=Pocket;
void 0;
window.REALITI_HALO_V1=HALO;
window.REALITI_AURA_V1=AURA;
window.REALITI_V235_INTERNAL={version:V,auraInternalView:()=>AURA.internalView(),auraEnable:v=>AURA.setEnabled(v),auraRenderTo:c=>AURA.renderTo(c),haloSnapshot:()=>HALO.snapshot(),thiccSample:z=>THICC.sample(z),pocket:Pocket};
})();