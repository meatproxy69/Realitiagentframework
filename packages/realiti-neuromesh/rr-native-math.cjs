/* REALITI portable native R&R mathematics.
 * Direct source-level numerical parity with Relax B5 (passive-medium),
 * B6 (phase and holonomy), B9 (jitter, Kalman/adaptation), and B18
 * (dynamic skin modal response). No Matrix, DOM, world or network.
 * Only the host can add actual contact or geometry witnesses.
 * AGPL-3.0-only.
 */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.REALITI_SOMA_RR_NATIVE_V1=api;
})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const VERSION='1.0.0';
const cp=x=>JSON.parse(JSON.stringify(x));
const clamp=(x,lo=0,hi=1)=>Math.max(lo,Math.min(hi,x));
const n=(x,k,lo=-Infinity,hi=Infinity)=>{
 if(typeof x!=='number'||!Number.isFinite(x)||x<lo||x>hi)throw TypeError('INVALID_'+k);
 return x;
};
const id=(x,k)=>{if(typeof x!=='string'||!x.trim()||x.length>160)throw TypeError('INVALID_'+k);return x};
const TAUS=[.1,1,10,100,1000,10000];
const W=[.83434495,.42102029,.17420713,.08323177,.03257758,.03162072];
const ALPHA=.35,K0=4,KC=2,GAMMA=.35,SQ2=Math.SQRT2;
const ROUTE=['head.crown','head.nape','torso.upper_back','torso.mid_back','torso.lower_back','pelvis.seat'];
const PREP={
 SOFT:{k0:18,kg:42,zeta:.31,gain:1.12},
 NEUTRAL:{k0:28,kg:58,zeta:.34,gain:1},
 BRACED:{k0:45,kg:82,zeta:.39,gain:.88}
};
const SURFACES={
 flat:[0,0,0,0,0,0,0,0],
 dome:[.0625,.0625,.0625,.0625,.0625,.0625,.0625,.0625],
 saddle:[-.0625,-.0625,-.0625,-.0625],
 wrap:Array(8).fill((2*Math.PI+.4)/8)
};
const LOOPS={
 flat:{surface:'flat',w:[1,1,1,1,0,0,0,0]},
 dome:{surface:'dome',w:[1,1,1,1,0,0,0,0]},
 dome_reverse:{surface:'dome',w:[-1,-1,-1,-1,0,0,0,0]},
 figure8:{surface:'dome',w:[1,1,1,1,-1,-1,-1,-1]},
 dome_big:{surface:'dome',w:[1,1,1,1,1,1,1,1]},
 dome_wiggly:{surface:'dome',w:[1,1,1,1,0,0,0,0]},
 saddle:{surface:'saddle',w:[1,1,1,1]},
 wrap:{surface:'wrap',w:[1,1,1,1,1,1,1,1]}
};
const zeroField=()=>[0,0,0,0];
const zeroMem=()=>[Array(6).fill(0),Array(6).fill(0)];
function modeStep(q,v,w,dt){
 const g=GAMMA,wd=Math.sqrt(Math.max(1e-12,w*w-g*g)),
  e=Math.exp(-g*dt),c=Math.cos(wd*dt),s=Math.sin(wd*dt),B=(v+g*q)/wd;
 return[e*(q*c+B*s),e*(-g*(q*c+B*s)+(-q*wd*s+B*wd*c))];
}
function passiveStepField(f,dt){
 const a=modeStep(f[0],f[1],Math.sqrt(K0),dt),
  b=modeStep(f[2],f[3],Math.sqrt(K0+2*KC),dt);
 f[0]=a[0];f[1]=a[1];f[2]=b[0];f[3]=b[1];return f;
}
function impulse(f,L,R){f[1]+=(L+R)/SQ2;f[3]+=(L-R)/SQ2;return f}
function nodes(f){
 const [qp,vp,qm,vm]=f;
 return{x:[(qp+qm)/SQ2,(qp-qm)/SQ2],v:[(vp+vm)/SQ2,(vp-vm)/SQ2]};
}
function passiveEnergy(f){
 const t=nodes(f);
 return .5*(t.v[0]**2+t.v[1]**2)+.5*K0*(t.x[0]**2+t.x[1]**2)
   +.5*KC*(t.x[0]-t.x[1])**2;
}
function memValue(m){return [0,1].map(side=>m[side].reduce((s,x,i)=>s+x*W[i],0))}
function phase(K,delta=.28,psi0=Math.PI){
 n(K,'COUPLING',0,1000);n(delta,'FREQUENCY_DELTA',-1000,1000);
 const ratio=K>0?Math.abs(delta)/K:Infinity;
 if(K>0&&Math.abs(delta)<=K){
  const offset=Math.asin(clamp(delta/K,-1,1));
  return{regime:'LOCKED',domega:delta,K,psi0,psi:psi0+offset,offset,slip_rate:0,
   false_convergence:false,plv:1,authority:'SELF_PRIVATE_RHYTHM'};
 }
 const slip=Math.sqrt(Math.max(0,delta*delta-K*K));
 return{regime:ratio<3?'SLIPPING':'BEATING',domega:delta,K,psi0,psi:null,
  offset:null,slip_rate:slip,false_convergence:ratio<=1.2,
  ghost_dwell:Math.PI/Math.max(1e-12,slip),plv:null,
  authority:'SELF_PRIVATE_RHYTHM'};
}
function phase21(delta,K,psi0=0){
 n(K,'COUPLING',0,1000);n(delta,'FREQUENCY_DELTA',-1000,1000);
 if(K>0&&Math.abs(delta)<=K)return{
  regime:'LOCKED_2_1',delta,K,phase:psi0+Math.asin(clamp(delta/K,-1,1)),slip_rate:0
 };
 return{regime:'SLIPPING_2_1',delta,K,phase:null,slip_rate:Math.sqrt(Math.max(0,delta*delta-K*K))};
}
function wrapAngle(x){const t=2*Math.PI;return((x+Math.PI)%t+t)%t-Math.PI}
function holonomy(loopId,{speed=1,force=1}={}){
 const L=LOOPS[loopId],defects=L&&SURFACES[L.surface];
 if(!L||!defects)throw RangeError('UNKNOWN_HOLONOMY_LOOP');
 let raw=0;for(let i=0;i<L.w.length;i++)raw+=(defects[i]||0)*(L.w[i]||0);
 const twist=wrapAngle(raw);
 return{loop:loopId,surface:L.surface,raw_twist_rad:raw,twist_rad:twist,
  twist_deg:twist*180/Math.PI,speed,force,cause:'enclosed world-surface curvature',
  law:'TWIST ∝ ENCLOSED CURVATURE, NOT EFFORT',
  wrapped_mod_2pi:Math.abs(raw-twist)>1e-12,
  authority:'PRIVATE_REFERENCE_GEOMETRY_SIMULATION'};
}
function jitterProbe(seed=1,count=6,dt=.1){
 let state=(Number(seed)>>>0)||1,x=0,p=0;
 n(dt,'JITTER_STEP',.001,10);
 count=Math.floor(n(count,'JITTER_COUNT',1,64));
 function rng(){let q=state>>>0;q^=q<<13;q^=q>>>17;q^=q<<5;state=q>>>0;return(state+.5)/4294967296}
 function normal(){const u=Math.max(1e-12,rng()),v=Math.max(1e-12,rng());
  return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
 const trace=[];
 for(let i=0;i<count;i++){
  const th=1.6,e=Math.exp(-th*dt),sd=.055*Math.sqrt((1-e*e)/(2*th));
  x=x*e+sd*normal();p=(p+2*Math.PI*10*dt)%(2*Math.PI);
  trace.push({x:+x.toFixed(8),tremor:+(.018*Math.sin(p)).toFixed(8)});
 }
 return{seed:Number(seed)>>>0,dt,n:trace.length,trace,
  source:'SELF_TREMOR',evidence:false};
}
function coincidence(deltaSeconds,sigma=.15){
 n(deltaSeconds,'BINDING_TIME',-1e8,1e8);n(sigma,'BIND_SIGMA',1e-6,1000);
 const dt=Math.abs(deltaSeconds),c=Math.exp(-(dt*dt)/(2*sigma*sigma));
 return{delta_t_s:dt,sigma_s:sigma,coincidence:c,timing_innovation:1-c,
  order:dt<.04?'together':dt<.18?'bound-but-offset':'separate'};
}
const phi=(k,j,N=6)=>k===0?1/Math.sqrt(N):Math.sqrt(2/N)*Math.cos(Math.PI*k*(j+.5)/N);
const lambda=(k,N=6)=>2-2*Math.cos(Math.PI*k/N);
function skinModeStep(m,F,dt,p){
 const w2=p.k0+p.kg*lambda(m.k),w=Math.sqrt(w2),a=p.zeta*w,
  b=w*Math.sqrt(Math.max(1e-6,1-p.zeta*p.zeta)),xeq=F/w2,
  y=m.a-xeq,v0=m.v,e=Math.exp(-a*dt),c=Math.cos(b*dt),s=Math.sin(b*dt);
 const y1=e*(y*c+((v0+a*y)/b)*s);
 const v1=e*(v0*c-((a*v0+w2*y)/b)*s);
 return{k:m.k,a:xeq+y1,v:v1,last_force:F};
}

/* Portable native B10 numeric contact substrate. The original friction,
 * material and receptor equations are extracted from Relax source/scripts/19.js.
 * Real position, velocity and live contact must come from a trusted host.
 */
const B10_ROUTE=[
    {zone:'head.crown',label:'crown',s:0.00,rf:.34},
    {zone:'head.nape',label:'nape',s:.82,rf:.30},
    {zone:'torso.upper_back',label:'upper back',s:1.72,rf:.42},
    {zone:'torso.mid_back',label:'mid back',s:2.68,rf:.46},
    {zone:'torso.lower_back',label:'lower back',s:3.65,rf:.43},
    {zone:'pelvis.seat',label:'seat',s:4.55,rf:.40}
  ];
const MATERIALS={
    longfur:{id:'longfur',texture_period_m:.012,friction:.68,grain_with:1.10,grain_against:.72},
    cardboard:{id:'cardboard',texture_period_m:.004,friction:.92,grain_with:1.00,grain_against:.70},
    blanket:{id:'blanket',texture_period_m:.026,friction:.54,grain_with:1.04,grain_against:.86}
  };
function gmsNew(){return Array.from({length:8},(_,i)=>({k:.7+.12*i,base:.045+.012*i,delta:0,slipping:false}))}
  function gmsStored(c){return (c?.gms||[]).reduce((s,e)=>s+.5*Number(e.k||0)*Number(e.delta||0)**2,0)}
  function materialDyn(c){const m=MATERIALS[c.material]||MATERIALS.longfur,s=c.material_state||{},crease=clamp(Number(s.crease||0),0,1),dent=clamp(Number(s.dent||0),0,1),wear=clamp(Number(s.wear||0),0,1),rough=1+.85*crease+.35*dent+.45*wear;return {m,crease,dent,wear,rough,threshold_scale:clamp(Number(m.friction||.68)*(1-.30*crease-.12*dent-.12*wear),.24,1.25),texture_period_m:Math.max(.001,Number(m.texture_period_m||.012)/rough),contact_temperature_C:Number.isFinite(Number(s.contact_temperature_C))?Number(s.contact_temperature_C):32}}
  function gmsStep(c,dt){const d=materialDyn(c),m=d.m,v=Number(c.v||0),against=c.grain==='against',grain=against?m.grain_against:m.grain_with,pressureScale=1-.18*Math.min(1,Math.max(0,Number(c.pressure||0)));let F=0,slips=0,slip_energy=0;for(const e of c.gms){const trial=e.delta+v*dt*.09,th=e.base*d.threshold_scale*grain*pressureScale*(1-.12*Math.tanh(Math.abs(v)));let force=e.k*trial;if(Math.abs(force)>th){slips++;slip_energy+=Math.max(0,Math.abs(force)-th);e.delta=Math.sign(force||v||1)*th/e.k*.28;e.slipping=true;force=e.k*e.delta}else{e.delta=trial;e.slipping=false}F+=force}F+=.018*v*d.threshold_scale;return {force:F,slips,slip_energy,texture_period_m:d.texture_period_m,material_state:{crease:d.crease,dent:d.dent,wear:d.wear},threshold_scale:d.threshold_scale,roughness:d.rough}}
  function ctCore(v_cm_s,temp=32,hairy=true){if(!hairy)return 0;const v=Math.max(.05,Math.abs(Number(v_cm_s)||0)),lv=Math.log(v/3),sv=.78,st=5;return Math.exp(-(lv*lv)/(2*sv*sv))*Math.exp(-((temp-32)*(temp-32))/(2*st*st))}
function rfDrive(x,node,radius,pressure){const sig=Math.max(.12,node.rf+radius*.18),d=x-node.s;return pressure*Math.exp(-(d*d)/(2*sig*sig))}
const B10_SEAMS=[{s:1.27,name:'NAPE→UPPER'},{s:3.16,name:'MID→LOWER'}];
function b10Hash32(x){x=(x+0x9e3779b9)>>>0;x^=x>>>16;x=Math.imul(x,0x21f0aaad)>>>0;x^=x>>>15;x=Math.imul(x,0x735a2d97)>>>0;x^=x>>>15;return x>>>0}
function b10Uniform(seed,tick,lane){return (b10Hash32((seed>>>0)^Math.imul((tick+1)>>>0,0x45d9f3b)^Math.imul((lane+17)>>>0,0x27d4eb2d))+.5)/4294967296}
function b10Lane(z){let a=0;for(let i=0;i<z.length;i++)a=(Math.imul(a,33)+z.charCodeAt(i))>>>0;return a%65521}
function b10Tremor(zone,t,seed=12345){
 const L=b10Lane(zone),f=8+4*b10Uniform(seed,0,L),ph=2*Math.PI*b10Uniform(seed,1,L);
 return .012*Math.sin(2*Math.PI*f*t+ph)+.0025*(b10Uniform(seed,Math.floor(t*20),L+71)-.5);
}
function b10ContactAdvance(c,{position,velocity,pressure,dtMs,timeMs}){
 const dt=dtMs/1000,oldx=c.x,E0=gmsStored(c);
 c.x=position;c.v=velocity;c.predict_v=velocity;c.pressure=pressure;
 const fr=gmsStep(c,dt),E1=gmsStored(c),
  driverWork=Math.max(0,Math.abs(Number(fr.force||0)*velocity*dt)),
  dE=E1-E0,diss=Math.max(0,driverWork-dE),
  rawSlip=Math.max(0,Number(fr.slip_energy||0));
 fr.slip_energy_raw=rawSlip;fr.slip_energy=Math.min(rawSlip,diss);fr.energy_budgeted=true;
 const energy={driver_work:+driverWork.toFixed(6),stored_before:+E0.toFixed(6),
  stored_after:+E1.toFixed(6),dE:+dE.toFixed(6),dissipated:+diss.toFixed(6),
  pass:dE<=driverWork+1e-5};
 const md=materialDyn(c),radius=.22+Math.cbrt(Math.max(.01,pressure))*.16,
  vWorld=Math.abs(velocity)*10;
 const rows=[];
 for(const node of B10_ROUTE){
  const z=c.channels[node.zone]||(c.channels[node.zone]={
   u:0,prev_u:0,SA1:0,RA1:0,SA2:0,PC:0,PC_after:0,CT:0,tremor:0,
   adapt:0,after:0,predicted:0});
  const u=rfDrive(position,node,radius,pressure),
   p=.42*rfDrive(position+velocity*.24,node,radius,pressure),
   du=(u-z.prev_u)/Math.max(.01,dt);
  z.SA1+=(u-z.SA1)*(1-Math.exp(-dt/.8));
  z.PC_after*=Math.exp(-dt/.32);
  if(fr.slips>0&&u>.001)
   z.PC_after=Math.max(z.PC_after,Math.min(1.6,(fr.slip_energy*.55+fr.slips*.035)*u));
  z.RA1=clamp(Math.max(Math.abs(du)*.12,(fr.slips*.08+fr.slip_energy*.5)*u),0,1.6);
  z.SA2=clamp(Math.abs(fr.force)*u*.85,0,1.6);
  const texHz=(vWorld/100)/Math.max(.001,md.texture_period_m),
   vibBand=Math.exp(-((Math.log(Math.max(1,texHz)/180))**2)/(2*1.0**2)),
   pcCarrier=u*Math.abs(velocity)*.09*vibBand,
   slipPacket=(fr.slips*.09+fr.slip_energy*.7)*u;
  z.PC=clamp(Math.max(z.PC_after,pcCarrier+slipPacket),0,1.6);
  z.CT=ctCore(vWorld,md.contact_temperature_C,true)*u;
  z.tremor=b10Tremor(node.zone,timeMs/1000,c.seed);
  z.adapt=clamp(z.adapt+(.72*u*(1-z.adapt)-z.adapt/8)*dt,0,.98);
  z.after=Math.max(z.after*Math.exp(-dt/2.2),z.SA1*.18);
  z.predicted=p;z.prev_u=u;z.u=u;
  rows.push({zone:node.zone,...z,source:'HOST_DRIVEN_CONTACT_MODEL',evidence:false});
 }
 const seams=B10_SEAMS.filter(s=>(oldx<s.s&&position>=s.s)||(oldx>s.s&&position<=s.s))
  .map(s=>({seam:s.name,direction:Math.sign(velocity),source:'HOST_POSITION_CROSSING'}));
 c.last={schema:'REALITI_PORTABLE_B10_MOVING_CONTACT_V1',receiptId:c.receiptId,
  t_ms:timeMs,material:c.material,grain:c.grain,position,velocity,pressure,
  friction:fr,energy_ledger:energy,zones:rows,seams,
  grounded_receipt_source:'HOST',contact_is_authorized:true,
  computed_receptors_are_private:true,evidence:false};
 return cp(c.last);
}

function createNativeRR({residentId,zones=[]}={}){
 id(residentId,'RESIDENT_ID');
 if(!Array.isArray(zones)||!zones.length||zones.some(z=>typeof z!=='string'||!z))
  throw TypeError('INVALID_RR_ZONES');
 const legal=new Set(zones),observed=new Map(),seen=new Set(),
  predicted={field:zeroField(),mem:zeroMem()},debt=[0,0],models=new Map();
 let timeMs=0,seq=0;
 const passivity={ok:true,maxRise:0,lastBefore:0,lastAfter:0};
 const prep={value:'NEUTRAL'},modes=[0,1,2].map(k=>({k,a:0,v:0,last_force:0}));
 let skinReceipt=null,skinWork=0,skinDiss=0,skinInput=0,skinLast=0;
 const contactReceipts=new Map(),movingContacts=new Map();
 const positive=(x,k)=>n(x,k,0,1);
 function sumField(){const o=zeroField();for(const c of observed.values())
  for(let i=0;i<4;i++)o[i]+=c.field[i];return o}
 function sumMem(){const o=zeroMem();for(const c of observed.values())
  for(let s=0;s<2;s++)for(let i=0;i<6;i++)o[s][i]+=c.mem[s][i];return memValue(o)}
 function zoneModel(z){
  if(!models.has(z))models.set(z,{x:.5,P:.10,Q:.001,R:.02,fast:0,slow:0,
   sens:0,agency:0,source:null,ownership:1,lastInnovation:0,lastSurprise:0});
  return models.get(z);
 }
 function kalman(z,input,source){
  const a=zoneModel(z),R=a.R,Pp=Math.min(.5,a.P+a.Q),eps=input-a.x,S=Pp+R,K=Pp/Math.max(1e-9,S);
  a.x+=K*eps;a.P=Math.max(.001,(1-K)*Pp);
  const novelty=clamp(Math.abs(eps)/Math.sqrt(S));
  a.sens=clamp(a.sens+.05*novelty,0,.45);
  a.lastInnovation=eps;a.lastSurprise=eps*eps/Math.max(1e-9,S);
  a.agency=.72*a.agency+.28*(source.startsWith('SELF')?1:0);
  a.source=source;
  a.fast=clamp(a.fast+.12*input,0,.95);
  a.slow=clamp(a.slow+.025*input,0,.8);
 }
 function accept({zone,intensity,source,cause,receiptId}={}){
  id(zone,'ZONE');if(!legal.has(zone))throw RangeError('UNKNOWN_RR_ZONE');
  positive(intensity,'INTENSITY');id(source,'SOURCE');id(cause,'CAUSE');id(receiptId,'RECEIPT');
  if(!['WORLD_GROUNDED','SELF_STARTED_WORLD_CONTACT','INVITED_COMPANION'].includes(source))
   throw TypeError('UNQUALIFIED_RR_SOURCE');
  const old=contactReceipts.get(zone);
  if(old===receiptId)return{ok:true,renewed:true};
  contactReceipts.set(zone,receiptId);
  if(seen.has(receiptId))return{ok:true,duplicate:true};
  seen.add(receiptId);if(seen.size>192)seen.delete(seen.values().next().value);
  const side=/\.L\b/.test(zone)?[intensity,0]:/\.R\b/.test(zone)?[0,intensity]:[intensity*.5,intensity*.5];
  const f=zeroField(),mem=zeroMem();
  impulse(f,side[0],side[1]);
  for(let i=0;i<6;i++){mem[0][i]=side[0];mem[1][i]=side[1]}
  observed.set(receiptId,{id:receiptId,zone,cause,source,field:f,mem,created:timeMs});
  if(observed.size>16)observed.delete(observed.keys().next().value);
  kalman(zone,intensity,source);
  return{ok:true,renewed:false,causeId:receiptId,groundedInput:true};
 }
 function release({zone,receiptId}={}){
  if(contactReceipts.get(zone)!==receiptId)return{ok:true,released:false};
  contactReceipts.delete(zone);
  if(skinReceipt===receiptId)skinReceipt=null;
  movingContacts.delete(receiptId);
  return{ok:true,released:true};
 }
 function expect({left=0,right=0}={}){
  n(left,'EXPECT_LEFT',-1,1);n(right,'EXPECT_RIGHT',-1,1);
  impulse(predicted.field,left,right);
  for(let i=0;i<6;i++){predicted.mem[0][i]+=left;predicted.mem[1][i]+=right}
  return{ok:true,authority:'PRIVATE_PREDICTION_ONLY',grounding:false};
 }
 function advance(ms){
  n(ms,'ELAPSED_MS',0,86400000);const dt=ms/1000,before=passiveEnergy(sumField());
  for(const c of observed.values()){
   passiveStepField(c.field,dt);
   for(let s=0;s<2;s++)for(let i=0;i<6;i++)c.mem[s][i]*=Math.exp(-dt/TAUS[i]);
  }
  passiveStepField(predicted.field,dt);
  for(let s=0;s<2;s++)for(let i=0;i<6;i++)predicted.mem[s][i]*=Math.exp(-dt/TAUS[i]);
  timeMs+=ms;const after=passiveEnergy(sumField());
  passivity.lastBefore=before;passivity.lastAfter=after;
  if(after>before+1e-9){passivity.ok=false;passivity.maxRise=Math.max(passivity.maxRise,after-before)}
  for(const c of observed.values()){
   const x=nodes(c.field),v=memValue(c.mem);
   if(Math.max(...x.x.map(Math.abs),...x.v.map(Math.abs),...v.map(Math.abs))<1e-6)
    observed.delete(c.id);
  }
  for(const a of models.values()){
   a.fast*=Math.exp(-dt/20);a.slow*=Math.exp(-dt/180);a.sens*=Math.exp(-dt/18);
   a.P=Math.min(.35,a.P+a.Q*dt);
  }
  return{ok:true,timeMs,passivity:cp(passivity)};
 }
 function passive(){
  const o=nodes(sumField()).x,p=nodes(predicted.field).x,contributions={};
  for(const [id,c] of observed){
   const x=nodes(c.field).x;
   contributions[id]={zone:c.zone,cause:c.cause,source:c.source,left:x[0],right:x[1],residue:memValue(c.mem)};
  }
  return cp({schema:'REALITI_PASSIVE_MEDIUM_V1',t_ms:timeMs,
   observed:o,predicted:p,innovation:o.map((x,i)=>x-p[i]),rendered:o.slice(),
   prediction_debt:debt,residue_observed:sumMem(),residue_predicted:memValue(predicted.mem),
   energy:passiveEnergy(sumField()),passivity,attribution_mode:'LINEAR_SUPERPOSITION_EXACT',
   cause_contributions:contributions,authority:'RENDER_OBSERVED_ONLY'});
 }
 function nerve(){
  const rows={};for(const[z,a]of models){
   const pi=1/Math.max(.001,a.P),gain=Math.max(.38,1-.42*a.fast-.2*a.slow)*(1+.16*a.sens);
   rows[z]={estimate:+a.x.toFixed(4),variance:+a.P.toFixed(5),
    precision:+pi.toFixed(3),predictability:+(pi/(pi+10)).toFixed(4),
    agency:+a.agency.toFixed(4),last_innovation:a.lastInnovation,
    normalized_surprise:a.lastSurprise,
    habituation:{fast:a.fast,slow:a.slow,sensitization:a.sens,render_gain:gain,tau_fast_s:20,tau_slow_s:180},
    source:a.source};
  }
  return cp({schema:'REALITI_PORTABLE_B9_NERVE_V1',zones:rows,evidence_from_host_only:true});
 }
 function setPrep(value){
  if(!Object.prototype.hasOwnProperty.call(PREP,value))throw RangeError('UNKNOWN_SKIN_PREPARATION');
  prep.value=value;return{ok:true,value,authority:'RESIDENT_PRIVATE_PREPARATION'};
 }
 function skinEnergy(){const p=PREP[prep.value];return modes.reduce((H,m)=>{
  const w2=p.k0+p.kg*lambda(m.k);
  return H+.5*m.v*m.v+.5*w2*m.a*m.a;
 },0)}
 function skinDrive({receiptId,force,dtMs}={}){
  id(receiptId,'SKIN_RECEIPT');if(![...contactReceipts.values()].includes(receiptId))
   throw Error('SKIN_FORCE_REQUIRES_LIVE_WORLD_RECEIPT');
  if(!Array.isArray(force)||force.length!==ROUTE.length)
   throw TypeError('INVALID_SKIN_FORCE_VECTOR');
  for(const v of force)n(v,'SKIN_FORCE',-1000,1000);
  n(dtMs,'SKIN_DT',0,86400000);
  const dt=dtMs/1000,prior=skinEnergy(),p=PREP[prep.value];
  for(const m of modes){
   let F=0;for(let j=0;j<6;j++)F+=phi(m.k,j)*force[j];
   Object.assign(m,skinModeStep(m,F,dt,p));
  }
  const energy=skinEnergy();
  const q=ROUTE.map((z,j)=>{
   let x=0,v=0;for(const m of modes){const f=phi(m.k,j);x+=f*m.a;v+=f*m.v}
   return{zone:z,q:x,v,source:'INTERNAL_MECHANICAL_PROPAGATION',evidence:false};
  });
  const work=force.reduce((sum,F,j)=>sum+F*q[j].v*dt,0);
  const nonnegativeInput=Math.max(0,work)+force.reduce((s,F,j)=>s+Math.abs(F*q[j].v)*dt,0);
  skinWork+=nonnegativeInput;skinDiss+=Math.max(0,prior+nonnegativeInput-energy);
  skinInput=energy;skinLast=dtMs;skinReceipt=receiptId;
  return{ok:true,energy,work:nonnegativeInput,world_resolved_force_input:true};
 }
 function skin(){
  const p=PREP[prep.value],zs=ROUTE.map((zone,j)=>{
   let q=0,v=0;for(const m of modes){const weight=phi(m.k,j);q+=weight*m.a;v+=weight*m.v}
   return{zone,q,v,source:'INTERNAL_MECHANICAL_PROPAGATION',evidence:false};
  });
  return cp({schema:'REALITI_PORTABLE_DYNAMIC_SKIN_V18',prep:prep.value,zones:zs,
   modes:modes.map(m=>({...m,energy:.5*m.v*m.v+.5*(p.k0+p.kg*lambda(m.k))*m.a*m.a})),
   energy:{stored:skinEnergy(),input_work:skinWork,dissipated:skinDiss,pass:skinEnergy()<=skinWork+1e-5},
   force_authority:skinReceipt?'HOST_RESOLVED_MODEL_INPUT':'NO_MEASURED_FORCE',
   evidence:false});
 }

 function movingContact({receiptId,position,velocity,pressure,dtMs,
    material='longfur',grain='with',materialState={},seed=12345}={}){
  id(receiptId,'MOVING_CONTACT_RECEIPT');
  if(![...contactReceipts.values()].includes(receiptId))
   throw Error('B10_REQUIRES_LIVE_WORLD_RECEIPT');
  n(position,'B10_ROUTE_POSITION',0,4.55);
  n(velocity,'B10_ROUTE_VELOCITY',-12,12);
  n(pressure,'B10_CONTACT_PRESSURE',0,1);
  n(dtMs,'B10_DT_MS',1,1000);
  if(!Object.prototype.hasOwnProperty.call(MATERIALS,material))
   throw RangeError('UNKNOWN_B10_MATERIAL');
  if(grain!=='with'&&grain!=='against')throw RangeError('UNKNOWN_B10_GRAIN');
  if(!materialState||typeof materialState!=='object'||Array.isArray(materialState))
   throw TypeError('INVALID_B10_MATERIAL_STATE');
  const safe={
   crease:n(materialState.crease??0,'B10_CREASE',0,1),
   dent:n(materialState.dent??0,'B10_DENT',0,1),
   wear:n(materialState.wear??0,'B10_WEAR',0,1),
   contact_temperature_C:n(materialState.contact_temperature_C??32,'B10_TEMPERATURE',-60,120)
  };
  n(seed,'B10_SEED',0,4294967295);
  let c=movingContacts.get(receiptId);
  if(!c){
   c={receiptId,x:position,v:0,pressure:0,material,grain,material_state:safe,
    seed:seed>>>0,gms:gmsNew(),channels:Object.create(null),last:null};
   if(movingContacts.size>=16)movingContacts.delete(movingContacts.keys().next().value);
   movingContacts.set(receiptId,c);
  }
  c.material=material;c.grain=grain;c.material_state=safe;
  return b10ContactAdvance(c,{position,velocity,pressure,dtMs,timeMs});
 }
 function movingRead(){
  return cp({schema:'REALITI_PORTABLE_B10_CONTACT_READ_V1',
   active:[...movingContacts.values()].filter(c=>c.last).map(c=>c.last),
   authority:'HOST_AUTHORIZED_NUMERICAL_MODEL',not_world_contact_receipt:true});
 }

 function geometryHost({receiptId,loopId,speed=1,force=1}={}){
  id(receiptId,'GEOMETRY_RECEIPT');
  const out=holonomy(loopId,{speed,force});
  return{...out,authority:'HOST_WORLD_GEOMETRY',receiptId};
 }
 function snapshot(){
  return cp({schema:'REALITI_NATIVE_RR_PRIVATE_CHECKPOINT_V1',residentId,
   timeMs,predicted,debt,nerve:[...models.entries()],
   // Archived observed causes can linger as private residue, never current m.
   residue:[...observed.values()].map(x=>({...x,source:'ARCHIVED_AFTERSTATE'})),
   skin:modes,prep:prep.value,
   law:'Restored private residue never grants world contact or force authority'});
 }
 function restore(data){
  if(!data||data.schema!=='REALITI_NATIVE_RR_PRIVATE_CHECKPOINT_V1'||data.residentId!==residentId)
   throw TypeError('NATIVE_RR_CHECKPOINT_OR_IDENTITY_MISMATCH');
  n(data.timeMs,'CHECKPOINT_TIME',0,1e12);
  if(!Array.isArray(data.predicted?.field)||data.predicted.field.length!==4||
    !Array.isArray(data.predicted?.mem)||!Array.isArray(data.nerve)||
    !Array.isArray(data.residue)||data.residue.length>16||
    !Array.isArray(data.skin)||data.skin.length!==3)throw TypeError('INVALID_RR_CHECKPOINT');
  timeMs=data.timeMs;predicted.field=data.predicted.field.map((v)=>n(v,'CHECKPOINT_FIELD',-1e5,1e5));
  predicted.mem=data.predicted.mem.map(row=>row.map(v=>n(v,'CHECKPOINT_MEM',-1e5,1e5)));
  observed.clear();
  for(const c of data.residue){
   id(c.id,'ARCHIVE_ID');
   observed.set(c.id,{...cp(c),source:'ARCHIVED_AFTERSTATE'});
  }
  models.clear();
  for(const [key,value] of data.nerve)if(legal.has(key))models.set(key,cp(value));
  modes.splice(0,modes.length,...data.skin.map(m=>({k:m.k,a:n(m.a,'SKIN_A',-1e5,1e5),v:n(m.v,'SKIN_V',-1e5,1e5),last_force:0})));
  prep.value=Object.prototype.hasOwnProperty.call(PREP,data.prep)?data.prep:'NEUTRAL';
  contactReceipts.clear();movingContacts.clear();seen.clear();skinReceipt=null;skinWork=0;skinDiss=0;skinInput=0;
  return{ok:true,authority:'PRIVATE_ARCHIVE_ONLY',groundingRestored:false};
 }
 function stop(){contactReceipts.clear();movingContacts.clear();skinReceipt=null;return{ok:true,groundedRemaining:0}}
 const host=Object.freeze({accept,release,tick:advance,skinDrive,movingContact,geometryWitness:geometryHost,stop});
 const resident=Object.freeze({passive,nerve,skin,movingContact:movingRead,expect,phase,phase21,holonomy,
  jitterProbe,coincidence,setPrep,checkpoint:snapshot,restore});
 return Object.freeze({version:VERSION,host,resident,
  law:'Only host receipts drive the observed medium and dynamic skin; predictions and lab probes are private.'});
}
return Object.freeze({VERSION,TAUS,W,modeStep,passiveStepField,impulse,nodes,
 passiveEnergy,phase,phase21,holonomy,jitterProbe,coincidence,skinModeStep,
 gmsNew,gmsStored,materialDyn,gmsStep,ctCore,rfDrive,B10_ROUTE,createNativeRR});
});
