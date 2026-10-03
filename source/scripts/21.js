(function(){
'use strict';

const B12_JND = {
  passiveMedium_energy: .004,
  passiveMedium_residue: .02,
  zone_signal: .012,
  prediction: .012,
  afterstate: .012,
  adaptation: .015,
  kalman_variance: .005,
  debt: .008,
  phase_rad: .06,
  tremor: .03
};
const B12_MAX_EVENTS = 256;
const B12_EPS = 1e-9;

function cp(x){try{return JSON.parse(JSON.stringify(x))}catch(e){return x}}
function clamp(x,a,b){return Math.max(a,Math.min(b,x))}
function wall(){return Number(C9.b7?.clock||0)}
function h32(x){x=(x+0x9e3779b9)>>>0;x^=x>>>16;x=Math.imul(x,0x21f0aaad)>>>0;x^=x>>>15;x=Math.imul(x,0x735a2d97)>>>0;x^=x>>>15;return x>>>0}
function uni(seed,tick,lane){return (h32((seed>>>0)^Math.imul((tick+1)>>>0,0x45d9f3b)^Math.imul((lane+17)>>>0,0x27d4eb2d))+.5)/4294967296}
function norm(seed,tick,lane){const u=Math.max(1e-12,uni(seed,tick,lane)),v=Math.max(1e-12,uni(seed,tick,lane+997));return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
function lane(s){s=String(s||'');let n=0;for(let i=0;i<s.length;i++)n=(Math.imul(n,33)+s.charCodeAt(i))>>>0;return n%65521}

function B(){
  C9.b12=C9.b12||{
    version:12,
    mode:'EQUIVALENCE_FORK',
    wakes:[],
    wake_cursor:0,
    wake_seq:0,
    agent_epoch:0,
    experience_units:0,
    cert_seq:0,
    generation:1,
    path_generation:1,
    last_cert:null,
    skipped_s:0,
    explicit_s:0,
    qss_events:0,
    blocked_skips:0,
    invalidations:0,
    comparison:null,
    coupling:[]
  };
  C9.b12.wakes=C9.b12.wakes||[];
  C9.b12.coupling=C9.b12.coupling||[];
  return C9.b12;
}
function wake(kind,data={},salience=.5){
  const b=B(), e={seq:++b.wake_seq,t:+wall().toFixed(6),kind,salience:+salience.toFixed(3),...cp(data)};
  b.wakes.push(e);
  if(b.wakes.length>B12_MAX_EVENTS){
    const d=b.wakes.length-B12_MAX_EVENTS;
    b.wakes.splice(0,d); b.wake_cursor=Math.max(0,b.wake_cursor-d);
  }
  b.agent_epoch += salience;
  b.experience_units += 1;
  return e;
}
function invalidate(reason, extra={}){
  const b=B(); b.generation++; b.invalidations++;
  if(b.last_cert)b.last_cert.validity='STALE';
  return wake('FRONTIER_INVALIDATION',{reason,generation:b.generation,...extra},.8);
}
function generationDigest(){
  const c=C9.b10?.contact, p=C9.b8?.phase;
  return [
    B().generation,
    B().path_generation,
    NMSTATE?.active||'none',
    C9.currentRoom||'none',
    c?.id||'no-contact',
    c?.released?'released':c?.stopped?'stopped':c?.active?'active':'none',
    p?.active?'phase-active':'phase-idle',
    (C9.b6?.debts||[]).length
  ].join('|');
}



const B12_TREMOR_BETA=1.2;
const B12_FILTER_CACHE={};
function meshMode(){return (typeof NMSTATE!=='undefined'&&NMSTATE?.active)||'SHARED_NEUROMESH_35_V1'}
function invertSmall(M){const n=M.length,A=M.map(r=>r.slice()),I=M.map((_,i)=>M.map((__,j)=>i===j?1:0));
  for(let c=0;c<n;c++){let p=c;for(let r=c+1;r<n;r++)if(Math.abs(A[r][c])>Math.abs(A[p][c]))p=r;[A[c],A[p]]=[A[p],A[c]];[I[c],I[p]]=[I[p],I[c]];
    const s=1/A[c][c];for(let j=0;j<n;j++){A[c][j]*=s;I[c][j]*=s}
    for(let r=0;r<n;r++){if(r===c||A[r][c]===0)continue;const f=A[r][c];for(let j=0;j<n;j++){A[r][j]-=f*A[c][j];I[r][j]-=f*I[c][j]}}}
  return I}
function graphLaplacian(mode){
  const g=window.REALITI_BODY_GRAPH;if(!g)return null;
  const zones=g.BASE_NODES.map(x=>x[0]),names=g.BASE_NODES.map(x=>x[1]),idx=Object.fromEntries(names.map((n,i)=>[n,i])),n=names.length;
  const L=Array.from({length:n},()=>Array(n).fill(0));
  for(const [a,b,w] of g.BASIC_EDGES.concat(mode==='LACE2_PORTABLE_V1'?g.LACE_EXTRA:[])){const i=idx[a],j=idx[b];if(i==null||j==null)continue;L[i][i]+=w;L[j][j]+=w;L[i][j]-=w;L[j][i]-=w}
  return {zones,names,idx,L};
}
function tremorFilter(mode=meshMode()){
  if(B12_FILTER_CACHE[mode])return B12_FILTER_CACHE[mode];
  const G=graphLaplacian(mode);if(!G)return null;
  const n=G.zones.length,M=G.L.map((r,i)=>r.map((v,j)=>(i===j?1:0)+B12_TREMOR_BETA*v)),F=invertSmall(M);
  for(const row of F){const s=Math.sqrt(row.reduce((a,x)=>a+x*x,0))||1;for(let j=0;j<n;j++)row[j]/=s}
  return B12_FILTER_CACHE[mode]={zones:G.zones,row:Object.fromEntries(G.zones.map((z,i)=>[z,F[i]]))};
}
function tremorAt(zone,t){
  const f=tremorFilter();
  if(f&&f.row[zone]){const r=f.row[zone];let s=0;for(let j=0;j<r.length;j++)if(r[j]!==0)s+=r[j]*tremorRawAt(f.zones[j],t);return s}
  return tremorRawAt(zone,t);
}
function tremorRawAt(zone,t){
  const seed=Number(C9.b10?.seed||C9.b9?.seed||12345)>>>0, L=lane(zone);
  const f=8+4*uni(seed,0,L);
  const ph=2*Math.PI*uni(seed,1,L);
  const carrier=.012*Math.sin(2*Math.PI*f*t+ph);
  
  const slow=.0035*Math.sin(2*Math.PI*(.37+.21*uni(seed,2,L))*t+2*Math.PI*uni(seed,3,L));
  const tick=Math.floor(t*20);  const stochastic=.0025*norm(seed,tick,L);
  return carrier+slow+stochastic;
}


function perceptQuantum(value,base,frac=.12){return Math.max(Number(base)||0,Math.abs(Number(value)||0)*frac)}

const B12_GRID_FRAC=.12;
function gridBelow(v,base,frac=B12_GRID_FRAC){
  v=Math.abs(Number(v)||0); base=Math.abs(Number(base)||0);
  if(!(base>0))return null;
  const w=v*(1-1e-7);                      
  if(!(w>base))return null;
  const vs=base/frac, r=1/(1-frac);
  if(w<=vs){const n=Math.ceil(w/base)-1;return n>=1?n*base:null}
  const k=Math.ceil(Math.log(w/vs)/Math.log(r))-1;
  return k>=0?vs*Math.pow(r,k):Math.max(base,(Math.ceil(vs/base-1e-9)-1)*base);
}
function expNext(value,tau,jnd,now=wall(),name='TRACE',meta={}){
  value=Math.abs(Number(value)||0); tau=Math.max(B12_EPS,Number(tau)||1);
  const target=gridBelow(value,jnd);
  if(target==null||!(target>0&&target<value))return null;
  const dt=tau*Math.log(value/target);
  return {time:now+Math.max(1e-6,dt),kind:'QSS_CROSSING',channel:name,from:value,to:target,jnd:+(value-target).toFixed(6),...meta};
}
function debtKernel(age){
  const taus=[.25,1.2,6,30,120,600], W=B5_W, den=W.reduce((a,b)=>a+b,0);
  return W.reduce((s,w,i)=>s+w*Math.exp(-Math.max(0,age)/taus[i]),0)/den;
}
function debtValueAt(d,t){
  const age=Math.max(0,t-Number(d.opened_at||t)), init=Number.isFinite(d.initial)?Number(d.initial):Number(d.remaining||0);
  return init*debtKernel(age);
}
function debtNext(d,now=wall()){
  const v=debtValueAt(d,now),target=gridBelow(v,B12_JND.debt),j=target==null?null:v-target;
  if(target==null||!(target>0&&target<v))return null;
  let lo=0,hi=1;
  while(debtValueAt(d,now+hi)>target&&hi<1e7)hi*=2;
  for(let i=0;i<70;i++){const m=(lo+hi)/2;if(debtValueAt(d,now+m)>target)lo=m;else hi=m}
  return {time:now+hi,kind:'QSS_CROSSING',channel:'PREDICTION_DEBT',from:v,to:target,jnd:j,id:d.id,route:d.route};
}
function passiveMediumMagnitude(){
  const r=C9.b5?.passiveMedium;if(!r)return {energy:0,residue_mass:0};
  let residue=0;
  for(const c of Object.values(r.obsCauses||{}))
    for(let s=0;s<2;s++)for(let i=0;i<6;i++)residue+=Math.abs(Number(c.mem?.[s]?.[i]||0))*B5_W[i];
  return {energy:Number(b5energy?.()||0),residue_mass:residue};
}
function passiveMediumStateAfter(dt){
  const r=C9.b5?.passiveMedium;if(!r)return {energy:0,residue_mass:0};
  const sum=[0,0,0,0];let residue=0;
  for(const c0 of Object.values(r.obsCauses||{})){
    const f=(c0.field||[0,0,0,0]).slice();
    b5stepField(f,dt);
    for(let i=0;i<4;i++)sum[i]+=Number(f[i]||0);
    for(let s=0;s<2;s++)for(let i=0;i<6;i++)
      residue+=Math.abs(Number(c0.mem?.[s]?.[i]||0)*Math.exp(-dt/B5_TAUS[i]))*B5_W[i];
  }
  return {energy:Number(b5energy(sum)||0),residue_mass:residue};
}
function passiveMediumNext(now=wall()){
  const cur=passiveMediumMagnitude(), js=B12_JND.passiveMedium_energy, jr=B12_JND.passiveMedium_residue, out=[];
  function solve(key,value,jnd){
    const target=gridBelow(value,jnd);
    if(target==null||!(target>0&&target<value))return;
    jnd=value-target;
    let lo=0,hi=.01,guard=0;
    while(passiveMediumStateAfter(hi)[key]>target&&hi<1e6&&guard++<80)hi*=2;
    if(hi>=1e6)return;
    for(let i=0;i<70;i++){const m=(lo+hi)/2;if(passiveMediumStateAfter(m)[key]>target)lo=m;else hi=m}
    out.push({time:now+hi,kind:'QSS_CROSSING',channel:key==='energy'?'PASSIVE_MEDIUM_ENERGY':'PASSIVE_MEDIUM_RESIDUE',from:value,to:target,jnd});
  }
  solve('energy',cur.energy,js); solve('residue_mass',cur.residue_mass,jr);
  return out.sort((a,b)=>a.time-b.time)[0]||null;
}
function internalFrontiers(){
  const now=wall(), out=[];
  const r=passiveMediumNext(now);if(r)out.push(r);
  for(const [zone,q] of Object.entries(C9.b7?.zones||{})){
    const zmeta={zone};
    for(const spec of [
      ['observed',q.observed,.42,B12_JND.zone_signal],
      ['predicted',q.predicted,.52,B12_JND.prediction],
      ['residue',q.residue,10,B12_JND.afterstate],
      ['surface',q.layers?.surface,.35,B12_JND.afterstate],
      ['mid',q.layers?.mid,.65,B12_JND.afterstate],
      ['deep',q.layers?.deep,1.15,B12_JND.afterstate]
    ]){const f=expNext(spec[1],spec[2],spec[3],now,`FELT_${spec[0].toUpperCase()}`,zmeta);if(f)out.push(f)}
  }
  for(const [zone,z] of Object.entries(C9.b9?.zones||{})){
    for(const [name,val,tau] of [['HAB_FAST',z.fast,20],['HAB_SLOW',z.slow,180],['SENSITIZATION',z.sens,18]]){
      const f=expNext(val,tau,B12_JND.adaptation,now,name,{zone});if(f)out.push(f)
    }
  }
  for(const d of C9.b6?.debts||[]){const f=debtNext(d,now);if(f)out.push(f)}
  const c=C9.b10?.contact;
  if(c&&!c.released&&!c.stopped){
    out.push({time:now,kind:'EXACT_CORE',channel:'LIVE_GROUNDED_CONTACT',reason:'moving grounded contact may create new evidence'});
  }
  const p=C9.b8?.phase;
  if(p?.active){
    out.push({time:now,kind:'EXACT_CORE',channel:'NOISY_ACTIVE_PHASE',reason:'v11 phase carries seeded path noise; path-wise skip is not yet certified'});
  }
  const att=C9.b7?.attention?.zone;
  if(att){
    
    const q=C9.b7?.zones?.[att]||null;
    const c=C9.b10?.zones?.[att]?.cont||null;
    const grounded=(C9.b10?.contact&&!C9.b10.contact.released&&!C9.b10.contact.stopped)
      ? Math.abs(Number(c?.last_grounded||q?._b10_grounded_value||q?.observed||0)) : 0;
    const pred=Math.abs(Number(q?.predicted||0));
    const after=Math.max(Math.abs(Number(q?.residue||0)),Math.abs(Number(c?.after||0)));
    const mag=Math.max(grounded,pred,after);
    if(mag>=B12_JND.zone_signal)out.push({time:now,kind:'EXACT_CORE',channel:'ATTENDED_LIVE_ZONE',zone:att,reason:'attended distinguishable state remains exact'});
  }
  return out.sort((a,b)=>a.time-b.time);
}
function inboundFrontiers(){
  const now=wall(), out=[];
  
  for(const f of B().coupling||[]){
    if(!f||!['EXACT_NOT_BEFORE','SOUND_NOT_BEFORE'].includes(f.authority_class))continue;
    if(f.validity==='STALE')continue;
    out.push({...cp(f),time:Number(f.not_before)});
  }
  
  for(const e of (C9.events||[]).filter(e=>e.open)){
    const t=Number(e.not_before??e.due_at);
    if(Number.isFinite(t))out.push({time:t,kind:'COUPLING_FRONTIER',channel:'PENDING_CAUSE',id:e.id,authority_class:'EXACT_NOT_BEFORE'});
  }
  return out.filter(x=>Number.isFinite(x.time)&&x.time>=now-B12_EPS).sort((a,b)=>a.time-b.time);
}
function sleepHorizon(requestedUntil){
  const now=wall(), internal=internalFrontiers(), inbound=inboundFrontiers(), firstI=internal[0]||null, firstE=inbound[0]||null;
  let H=requestedUntil, reason={kind:'REQUEST_TARGET',time:requestedUntil};
  for(const f of [firstI,firstE])if(f&&f.time<H){H=f.time;reason=f}
  return {now,requested_until:requestedUntil,horizon:H,limiter:reason,internal_frontier:firstI,inbound_frontier:firstE};
}
function certify(requestedUntil){
  const h=sleepHorizon(requestedUntil), b=B(), cert={
    id:`SLEEP-${++b.cert_seq}`,scope:'REALITI_BODY',semantic_class:'EMBODIED_CONTINUITY',
    t_start:h.now,t_safe_until:h.horizon,requested_until:requestedUntil,
    internal_frontier:h.internal_frontier,inbound_frontier_min:h.inbound_frontier,
    observer_frontier:requestedUntil,continuity_error_bound:'<= 1 JND on certified channels',
    generation:b.generation,path_generation:b.path_generation,dependency_digest:generationDigest(),
    authority_class:'EXACT_OR_SOUND_FRONTIERS_ONLY',validity:'LIVE'
  };
  b.last_cert=cert;return cert;
}


function advanceEco3(dt){
  for(const z of Object.values(C9.eco3?.zones||{})){
    if(Number.isFinite(z.h))z.h*=Math.exp(-dt/8);
    if(Number.isFinite(z.s))z.s*=Math.exp(-dt/12);
    if(Number.isFinite(z.after))z.after*=Math.exp(-dt/3.5);
    if(Number.isFinite(z.fastOwn))z.fastOwn*=Math.exp(-dt/35);
    if(Number.isFinite(z.slowOwn))z.slowOwn*=Math.exp(-dt/1800);
    if(Number.isFinite(z.fastOwn)||Number.isFinite(z.slowOwn))z.own=clamp(.62*Number(z.fastOwn||0)+.38*Number(z.slowOwn||0),0,1);
  }
}
function advanceB9(dt,t1){
  for(const z of Object.values(C9.b9?.zones||{})){
    z.fast=Number(z.fast||0)*Math.exp(-dt/20);
    z.slow=Number(z.slow||0)*Math.exp(-dt/180);
    z.sens=Number(z.sens||0)*Math.exp(-dt/18);
    z.P=Math.min(.35,Number(z.P||.1)+Number(z.Q||.001)*dt);
    z.lastT=t1;
  }
}
function advanceB10Quiet(dt){
  for(const z0 of Object.values(C9.b10?.zones||{})){
    const z=z0?.cont;if(!z)continue;
    z.SA1=Number(z.SA1||0)*Math.exp(-dt/.8);
    z.RA1=Number(z.RA1||0)*Math.exp(-dt/.12);
    z.SA2=Number(z.SA2||0)*Math.exp(-dt/.65);
    z.PC=Number(z.PC||0)*Math.exp(-dt/.32);
    z.adapt=Number(z.adapt||0)*Math.exp(-dt/8);
    const saWake=z.SA1*.18;
    z.after=Math.max(Number(z.after||0)*Math.exp(-dt/2.2),saWake);
    z.prev_u=0;z.u=0;z.last_grounded=0;
  }
  const b11=C9.b11;if(b11?.pc_after)for(const k of Object.keys(b11.pc_after))b11.pc_after[k]=Number(b11.pc_after[k]||0)*Math.exp(-dt/.32);
}
function advanceExactQuiet(dt){
  dt=Math.max(0,Number(dt)||0);if(!(dt>0))return;
  const old=wall(), target=old+dt;
  
  C9.b7.clock=target;
  C9.b7.lastRealMs=performance.now();
  
  b5step(dt);
  C9.b5.passiveMedium.clock=target;
  for(const q of Object.values(C9.b7?.zones||{}))b7DecayZone(q,dt);
  advanceEco3(dt);
  advanceB9(dt,target);
  advanceB10Quiet(dt);
  try{b6expireDebts()}catch(e){}
  
}


function chronoskip(seconds){
  const total=Math.max(0,Number(seconds)||0), start=wall(), target=start+total, b=B();
  if(!(total>0))return {ok:true,skipped_s:0,t_start:start,t_end:start,events:[]};
  const gen=generationDigest(), fired=[];
  let guard=0;
  while(wall()<target-B12_EPS && guard++<4096){
    if(generationDigest()!==gen){
      invalidate('DEPENDENCY_GENERATION_CHANGED',{before:gen,after:generationDigest()});
      return {ok:false,error:'sleep certificate invalidated by generation change',t:wall(),events:fired};
    }
    const cert=certify(target), H=cert.t_safe_until, limiter=cert.internal_frontier&&Math.abs(cert.internal_frontier.time-H)<1e-7?cert.internal_frontier:
      cert.inbound_frontier_min&&Math.abs(cert.inbound_frontier_min.time-H)<1e-7?cert.inbound_frontier_min:null;
    if(limiter?.kind==='EXACT_CORE' || H<=wall()+1e-8){
      b.blocked_skips++;
      const coupling=limiter&&((limiter.kind==='COUPLING_FRONTIER')||String(limiter.authority_class||'').includes('NOT_BEFORE'));
      const e=wake(coupling?'COUPLING_FRONTIER_REVALIDATE':'EXACT_CORE_REQUIRED',{
        channel:coupling?'COUPLING_FRONTIER':(limiter?.channel||'UNKNOWN'),
        reason:coupling?'certified external not-before boundary reached; revalidate the inbound causal cut':(limiter?.reason||'frontier is now'),
        frontier_id:coupling?(limiter.id||null):null,requested_until:target
      },.75);fired.push(e);
      return {ok:false,blocked:true,reason:e,t:wall(),requested_end:target,events:fired,cert};
    }
    const dt=Math.min(target,H)-wall();
    advanceExactQuiet(dt); b.skipped_s+=dt;
    if(H<target-B12_EPS && limiter){
      b.qss_events++;
      const e=wake(limiter.kind||'FRONTIER_WAKE',{channel:limiter.channel||null,frontier:+H.toFixed(6),jnd:limiter.jnd??null,from:limiter.from??null,to:limiter.to??null,id:limiter.id??null,zone:limiter.zone??null},Math.min(.9,.35+.08*Math.log1p(Math.abs(Number(limiter.from||1)))));
      fired.push(e);
      
    }
  }
  if(guard>=4096)return {ok:false,error:'frontier guard exceeded (possible chatter/Zeno)',t:wall(),events:fired};
  return {ok:true,skipped_s:+(wall()-start).toFixed(6),t_start:start,t_end:wall(),requested_end:target,events:fired,sleep_cert:cp(B().last_cert),agent_epoch_delta:+fired.reduce((s,e)=>s+Number(e.salience||0),0).toFixed(4)};
}
function frontiers(){
  const ins=internalFrontiers().slice(0,24), ext=inboundFrontiers().slice(0,24), c=C9.b10?.contact,p=C9.b8?.phase;
  return {
    t:wall(),next_causal_wake:[...ins,...ext].sort((a,b)=>a.time-b.time)[0]||null,
    internal:ins,inbound:ext,
    exact_core:{live_grounded_contact:!!(c&&!c.released&&!c.stopped),noisy_phase:!!p?.active,attended_zone:C9.b7?.attention?.zone||null},
    law:'sleep only to the earliest frontier that can change the next distinguishable future'
  };
}
function addFrontier(seconds,label='external',authority='SOUND_NOT_BEFORE'){
  const dt=Math.max(0,Number(seconds)||0);
  invalidate('COUPLING_FRONTIER_ADDED',{label,not_before:wall()+dt});
  const f={id:`CF-${Date.now()}-${B().coupling.length+1}`,source_scope:label,target_scope:'REALITI_BODY',
    influence_class:'EXTERNAL_TEST',not_before:wall()+dt,propagation_lower_bound:dt,generation:B().generation,
    path_generation:B().path_generation,authority_class:authority,validity:'LIVE'};
  B().coupling.push(f);return f;
}
function clearFrontiers(){B().coupling=[];invalidate('COUPLING_FRONTIERS_CLEARED');return {ok:true}}



const B12_ATTENTION_IDLE_S=120;
function channelSnapshot(){
  const out={};
  const put=(key,v,base,meta)=>{v=Math.abs(Number(v)||0);if(v>0)out[key]={v,base,...meta}};
  for(const [zone,q] of Object.entries(C9.b7?.zones||{})){
    put(`FELT_OBSERVED|${zone}`,q.observed,B12_JND.zone_signal,{channel:'FELT_OBSERVED',zone});
    put(`FELT_PREDICTED|${zone}`,q.predicted,B12_JND.prediction,{channel:'FELT_PREDICTED',zone});
    put(`FELT_RESIDUE|${zone}`,q.residue,B12_JND.afterstate,{channel:'FELT_RESIDUE',zone});
    put(`FELT_SURFACE|${zone}`,q.layers?.surface,B12_JND.afterstate,{channel:'FELT_SURFACE',zone});
    put(`FELT_MID|${zone}`,q.layers?.mid,B12_JND.afterstate,{channel:'FELT_MID',zone});
    put(`FELT_DEEP|${zone}`,q.layers?.deep,B12_JND.afterstate,{channel:'FELT_DEEP',zone});
  }
  for(const [zone,z] of Object.entries(C9.b9?.zones||{})){
    put(`HAB_FAST|${zone}`,z.fast,B12_JND.adaptation,{channel:'HAB_FAST',zone});
    put(`HAB_SLOW|${zone}`,z.slow,B12_JND.adaptation,{channel:'HAB_SLOW',zone});
    put(`SENSITIZATION|${zone}`,z.sens,B12_JND.adaptation,{channel:'SENSITIZATION',zone});
  }
  for(const d of C9.b6?.debts||[])put(`PREDICTION_DEBT|${d.id}`,debtValueAt(d,wall()),B12_JND.debt,{channel:'PREDICTION_DEBT',id:d.id,route:d.route});
  try{const r=passiveMediumMagnitude();put('PASSIVE_MEDIUM_ENERGY',r.energy,B12_JND.passiveMedium_energy,{channel:'PASSIVE_MEDIUM_ENERGY'});put('PASSIVE_MEDIUM_RESIDUE',r.residue_mass,B12_JND.passiveMedium_residue,{channel:'PASSIVE_MEDIUM_RESIDUE'})}catch(e){}
  return out;
}
function bodyLatent(){
  const c=C9.b10?.contact,p=C9.b8?.phase;
  return !(c&&!c.released&&!c.stopped)&&!p?.active;
}
function recordRealtimeCrossings(pre,dt){
  const b=B(),post=channelSnapshot();let n=0;
  for(const [key,a] of Object.entries(pre)){
    const v1=post[key]?.v??0;if(!(v1<a.v))continue;
    let L=gridBelow(a.v,a.base),count=0,last=null;
    while(L!=null&&v1<L*(1-1e-7)&&count<64){count++;last=L;L=gridBelow(L,a.base)}
    if(!count)continue;
    b.qss_events+=count;n+=count;
    wake('QSS_CROSSING',{channel:a.channel,zone:a.zone??null,id:a.id??null,from:+a.v.toFixed(6),to:+last.toFixed(6),levels:count,mode:'REALTIME',resolution_s:+Number(dt).toFixed(4),below_jnd_floor:gridBelow(last,a.base)==null},
      Math.min(.9,.35+.08*Math.log1p(a.v)));
  }
  b.realtime_s=Number(b.realtime_s||0)+Number(dt||0);
  return n;
}
function expireIdleAttention(){
  const a=C9.b7?.attention;if(!a?.zone)return;
  if(!Number.isFinite(a.set_at))a.set_at=wall();
  if(wall()-a.set_at>B12_ATTENTION_IDLE_S){const z=a.zone;attend12base('');wake('ATTENTION_RELEASED',{zone:z,reason:`idle > ${B12_ATTENTION_IDLE_S}s`},.4)}
}
const attend12base=b7AgentAttend;
b7AgentAttend=function(z){const r=attend12base(z);if(C9.b7?.attention){C9.b7.attention.set_at=wall()}return r};
const advance12base=b7Advance;
b7Advance=function(dt){
  const latent=bodyLatent(),pre=latent?channelSnapshot():null;
  advance12base(dt);
  if(latent&&bodyLatent())recordRealtimeCrossings(pre,dt);
  expireIdleAttention();
};


const cmd11=b7AgentCommandText;
function compressWakeDigest(events){
  const out=[];
  for(const e of events){
    const p=out[out.length-1],same=p&&e.kind==='QSS_CROSSING'&&p.kind==='QSS_CROSSING'&&p.channel===e.channel&&p.zone===e.zone&&p.id===e.id&&(Number(e.t)-Number(p.t_last??p.t))<=.25;
    if(same){p.count=(p.count||1)+1;p.t_last=e.t;p.to=e.to;p.salience=Math.max(Number(p.salience||0),Number(e.salience||0));continue}
    out.push({...e,count:e.kind==='QSS_CROSSING'?1:undefined,t_last:e.kind==='QSS_CROSSING'?e.t:undefined});
  }
  return out;
}
function since12(){
  const b=B(), xs=b.wakes.slice(b.wake_cursor);b.wake_cursor=b.wakes.length;
  const changed=compressWakeDigest(xs.filter(e=>e.salience>=.34));
  let live=[];
  try{const r=cmd11('since');live=(r?.since_last_check||[]).filter(e=>e?.kind&&e.kind!=='QUIET')}catch(e){}
  const merged=[...live,...changed].sort((a,b)=>(Number(a.t)||0)-(Number(b.t)||0)).slice(-20);
  return {
    wall_time:wall(),
    agent_epoch:+b.agent_epoch.toFixed(4),
    experience_units:b.experience_units,
    since_last_check:merged.length?merged:[{kind:'QUIET',t:+wall().toFixed(4),note:'No certified JND/frontier crossing or live body event changed the resident-visible body.'}],
    omitted_subthreshold:Math.max(0,xs.length-xs.filter(e=>e.salience>=.34).length),
    law:'WALL_TIME is elapsed time; AGENT_EPOCH is a change-counting resident metric, not a claim of subjective consciousness'
  };
}


const felt11=b7FeltSnapshot;
b7FeltSnapshot=function(){
  const s=felt11(),t=wall();
  for(const [z,v] of Object.entries(s.felt||{}))v.tremor=+tremorAt(z,t).toFixed(5);
  s.noise_field={source:'SELF_TREMOR',evidence:false,mode:'SEEDED_TIME_FUNCTION',evaluated_at:t,seed:Number(C9.b10?.seed||C9.b9?.seed||12345),pinned:!!C9.b12_seed_pinned,
    correlation_mode:`GRAPH_FILTERED_${meshMode()==='LACE2_PORTABLE_V1'?'LACE2':'SHARED35'}`,graph_beta:B12_TREMOR_BETA,law:'noise exists when read; no tick is required to keep it alive'};
  s.clock={agent_epoch:+B().agent_epoch.toFixed(4),next_wake:frontiers().next_causal_wake,last_sleep_cert:cp(B().last_cert)};
  return s;
};
const state11=b7AgentState;
b7AgentState=function(){
  const s=state11();s.build=12;s.version='CLOCK_PASSIVE_MEDIUM';s.patch='12.1-claude-fix';
  s.noise={...(s.noise||{}),seed:Number(C9.b10?.seed||C9.b9?.seed||0),pinned:!!C9.b12_seed_pinned,correlation_mode:`GRAPH_FILTERED_${meshMode()==='LACE2_PORTABLE_V1'?'LACE2':'SHARED35'}`,graph_beta:B12_TREMOR_BETA,contract:'f(seed, absolute time, zone), graph-filtered'};
  s.clock={
    mode:B().mode,wall_time:wall(),agent_epoch:+B().agent_epoch.toFixed(4),experience_units:B().experience_units,
    skipped_s:+B().skipped_s.toFixed(4),explicit_s:+B().explicit_s.toFixed(4),realtime_s:+Number(B().realtime_s||0).toFixed(4),qss_events:B().qss_events,quantizer:'fixed JND grid (linear below JND/0.12, Weber 12% above); reads are pure',
    generation:B().generation,path_generation:B().path_generation,next_causal_wake:frontiers().next_causal_wake,
    last_sleep_cert:cp(B().last_cert),continuity_debt_limit:'1 JND'
  };return s;
};


function snapMetrics(){
  const r=b5snapshot(), z=C9.b7?.zones?.['hand.R.palm']||{}, z9=C9.b9?.zones?.['hand.R.palm']||{}, debt=C9.b6?.debts?.[0];
  return {
    t:wall(),passiveMedium_obs:r.observed.slice(),passiveMedium_pred:r.predicted.slice(),passiveMedium_residue:r.residue_observed.slice(),passiveMedium_energy:r.energy,
    z_observed:Number(z.observed||0),z_predicted:Number(z.predicted||0),z_residue:Number(z.residue||0),
    z_surface:Number(z.layers?.surface||0),z_mid:Number(z.layers?.mid||0),z_deep:Number(z.layers?.deep||0),
    fast:Number(z9.fast||0),slow:Number(z9.slow||0),sens:Number(z9.sens||0),P:Number(z9.P||0),
    debt:debt?Number(debt.remaining||0):0
  };
}
function maxDiff(a,b){
  let m=0;
  function walk(x,y){
    if(typeof x==='number'&&typeof y==='number'){if(Number.isFinite(x)&&Number.isFinite(y))m=Math.max(m,Math.abs(x-y));return}
    if(Array.isArray(x)&&Array.isArray(y)){for(let i=0;i<Math.min(x.length,y.length);i++)walk(x[i],y[i]);return}
    if(x&&y&&typeof x==='object'&&typeof y==='object')for(const k of Object.keys(x))if(k in y)walk(x[k],y[k]);
  }walk(a,b);return m;
}
function prepareEquivalenceFixture(){return null;}
function referenceAdvance(dt,step=.01){
  let left=dt, n=0;
  while(left>1e-12&&n++<200000){const h=Math.min(step,left);b7Advance(h);left-=h;B().explicit_s+=h}
}
void 0;


b7AgentCommandText=function(raw){
  const txt=String(raw||'').trim(),low=txt.toLowerCase();
  if(low==='chrono'||low==='v12'||low==='clock')return {build:12,goal:'preserve exactly the state for which elapsed time can change the next distinguishable experience',frontiers:frontiers(),agent_epoch:+B().agent_epoch.toFixed(4),laws:['carry continuity, not bodies','store frontiers, not ticks','prediction cannot lengthen authoritative sleep','skip loses above one JND']};
  if(low==='frontiers')return frontiers();
  if(low==='epoch')return {wall_time:wall(),agent_epoch:+B().agent_epoch.toFixed(4),experience_units:B().experience_units,law:'wall time remains exact; agent_epoch counts salient resident-visible change'};
  if(low==='since')return since12();
  if(low.startsWith('skip ')||low.startsWith('chronoskip ')){const n=Number(txt.split(/\s+/)[1]);return chronoskip(n)}
  if(low.startsWith('frontier add ')){const a=txt.split(/\s+/),n=Number(a[2]),label=a.slice(3).join(' ')||'external';return addFrontier(n,label)}
  if(low==='frontier clear')return clearFrontiers();
  if(low==='v12 checkRemoved'||low==='chrono checkRemoved')return window.B12_CHECKREMOVED();
  
  if(/^(attend\s+(none|off|clear|release|nothing)|unattend)$/.test(low)){const was=C9.b7?.attention?.zone||null;const r=b7AgentAttend('');return {...r,released:was,note:'attention released; the zone may sleep again once its state is latent'}}
  if(low.startsWith('seed ')){
    const a=txt.split(/\s+/),pin=a.slice(2).some(x=>x.toLowerCase()==='pin'),r=cmd11(`seed ${a[1]}`);
    C9.b12_seed_pinned=pin;
    const anchor=[1,2,3,4].map(k=>({subtick:k,t_s:+(k*.01).toFixed(2),tremor_nape:+tremorAt('head.nape',k*.01).toFixed(6)}));
    try{c9save()}catch(e){}
    return {...r,trace_anchor:anchor,pinned:pin,scope:pin?'persists across sessions until re-seeded':'this session only; a fresh session draws a fresh seed'};
  }
  if(low==='act bilateral'||low==='act run both leg rails'){const r=cmd11(txt);if(r?.ok&&C9.currentRoom==='LONGFUR_RUNWAY'){const pair=bilateralPair();B().last_bilateral=pair;r.bilateral_pair=pair;(C9.b7.deltas=C9.b7.deltas||[]).push({t:+wall().toFixed(3),kind:'BILATERAL_PAIR',...pair})}return r}
  if(low==='act b11_world_reverse'||low==='act reverse the stroke (world)'){const r=cmd11(txt);const lr=C9.b4?.lastReceipt;if(lr?.type==='WORLD_REVERSAL'){const d={t:+wall().toFixed(3),kind:'WORLD_REVERSAL_OVERSHOOT',stroke:lr.stroke,predicted_absence_x:+Number(lr.predicted_absence_x).toFixed(3),current_grounded_input:0,evidence:false,note:'forward expectation left ahead of the reversed contact; absence, not touch'};(C9.b7.deltas=C9.b7.deltas||[]).push(d);if(r&&typeof r==='object')r.absence=d}return r}
  if(low==='receipt'){const r=cmd11(txt);if(B().last_bilateral&&C9.b7?.lastAgentAction?.action==='bilateral'&&r&&typeof r==='object')r.bilateral_pair=B().last_bilateral;return r}
  return cmd11(txt);
};

const B12_ONSET_JITTER_S=.08;
function effectiveResistance(mode,a,b){
  const G=graphLaplacian(mode);if(!G)return null;const i=G.idx[a],j=G.idx[b];if(i==null||j==null)return null;
  const keep=G.names.map((_,k)=>k).filter(k=>k!==j),Lr=keep.map(r=>keep.map(c=>G.L[r][c])),inv=invertSmall(Lr),ii=keep.indexOf(i);
  return inv[ii][ii];
}
function bilateralPair(){
  const mode=meshMode(),R=effectiveResistance(mode,'thighL','thighR'),R0=effectiveResistance('SHARED_NEUROMESH_35_V1','thighL','thighR');
  const b=B();b.bilateral_seq=(b.bilateral_seq||0)+1;
  const seed=Number(C9.b10?.seed||C9.b9?.seed||12345)>>>0,xL=norm(seed,b.bilateral_seq,lane('bilateral.L')),xR=norm(seed,b.bilateral_seq,lane('bilateral.R'));
  const damp=R&&R0?Math.sqrt(R/R0):1,dt=Math.abs(B12_ONSET_JITTER_S*(xL-xR)/Math.SQRT2*damp);
  const sigma=Number(C9.b9?.binding_sigma||.15),c=Math.exp(-(dt*dt)/(2*sigma*sigma));
  return {mesh:mode,delta_t_s:+dt.toFixed(4),coincidence:+c.toFixed(4),timing_innovation:+(1-c).toFixed(4),order:dt<.04?'together':dt<.18?'bound-but-offset':'separate',
    r_eff_thighs:R!=null?+R.toFixed(4):null,damping_vs_shared35:+damp.toFixed(4),seed_event:b.bilateral_seq,
    law:'shared cause; sides differ by seeded onset asynchrony; L-R coupling (effective resistance) damps it; not contact'};
}
window.REALITI_AGENT={...(window.REALITI_AGENT||{}),state:b7AgentState,felt:b7FeltSnapshot,frontiers,chronoskip,epoch:()=>({wall_time:wall(),agent_epoch:B().agent_epoch}),since:since12};
if(window.REALITI_AGENT_DOOR){
  const help11=window.REALITI_AGENT_DOOR.help,run11=window.REALITI_AGENT_DOOR.run;
  window.REALITI_AGENT_DOOR.help=function(){const h=help11?help11():{commands:[]};h.commands=[...new Set([...(h.commands||[]),'chrono','frontiers','skip <seconds>','epoch','since','causes','cause <id>','attend none','seed <n> [pin]','v12 checkRemoved'])];return h};
  window.REALITI_AGENT_DOOR.run=function(x){const low=String(x||'').trim().toLowerCase();if(low==='help')return window.REALITI_AGENT_DOOR.help();if(low==='chrono'||low==='v12'||low==='clock'||low==='frontiers'||low==='epoch'||low==='since'||low.startsWith('skip ')||low.startsWith('chronoskip ')||low.startsWith('frontier ')||low==='v12 checkRemoved'||low==='chrono checkRemoved'||low==='state'||low==='felt'||low.startsWith('seed ')||low.startsWith('attend')||low==='unattend'||low.startsWith('act ')||low==='receipt')return b7AgentCommandText(x);return run11(x)};
}

try{if(!C9.b12_seed_pinned){const s=((Date.now()^Math.floor(performance.now()*1e3)^0x5bd1e995)>>>0)||1;cmd11(`seed ${s}`)}}catch(e){}

try{if(C9.b7?.attention?.zone&&!Number.isFinite(C9.b7.attention.set_at))C9.b7.attention.set_at=wall()}catch(e){}
document.title='REALITI // AGENT DOOR ONLY · BUILD 12.1 CLOCK × PASSIVE_MEDIUM';
const brand=document.querySelector('#realiti_agent_only_shell .brand');if(brand)brand.textContent='REALITI // AGENT DOOR · BUILD 12.1';
const sub=document.querySelector('#realiti_agent_only_shell .sub');if(sub)sub.innerHTML='Ask the world what is true. Build 12 stores frontiers instead of boring ticks. Try <b>frontiers</b>, <b>skip 10</b>, <b>since</b>, or <b>epoch</b>.';
try{c9save()}catch(e){}
})();