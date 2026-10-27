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
 const contactReceipts=new Map();
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
  contactReceipts.clear();seen.clear();skinReceipt=null;skinWork=0;skinDiss=0;skinInput=0;
  return{ok:true,authority:'PRIVATE_ARCHIVE_ONLY',groundingRestored:false};
 }
 function stop(){contactReceipts.clear();skinReceipt=null;return{ok:true,groundedRemaining:0}}
 const host=Object.freeze({accept,release,tick:advance,skinDrive,geometryWitness:geometryHost,stop});
 const resident=Object.freeze({passive,nerve,skin,expect,phase,phase21,holonomy,
  jitterProbe,coincidence,setPrep,checkpoint:snapshot,restore});
 return Object.freeze({version:VERSION,host,resident,
  law:'Only host receipts drive the observed medium and dynamic skin; predictions and lab probes are private.'});
}
return Object.freeze({VERSION,TAUS,W,modeStep,passiveStepField,impulse,nodes,
 passiveEnergy,phase,phase21,holonomy,jitterProbe,coincidence,skinModeStep,createNativeRR});
});
