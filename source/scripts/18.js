(function(){
  const TAU_FAST=20, TAU_SLOW=180, TAU_SENS=18, BIND_SIGMA=.15;
  const BASE_NODES=[
    ['head.crown','crown'],['head.nape','nape'],['torso.upper_back','upper'],['torso.mid_back','mid'],['torso.lower_back','lower'],['pelvis.seat','seat'],
    ['hand.L.palm','handL'],['hand.R.palm','handR'],['leg.L.thigh','thighL'],['leg.R.thigh','thighR'],['foot.L.sole','soleL'],['foot.R.sole','soleR']
  ];
  const BASIC_EDGES=[
    ['crown','nape',1],['nape','upper',.55],['upper','mid',1],['mid','lower',.35],['lower','seat',1],
    ['upper','handL',.7],['upper','handR',.7],['seat','thighL',.6],['seat','thighR',.6],['thighL','soleL',.8],['thighR','soleR',.8]
  ];
  const LACE_EXTRA=[
    ['nape','mid',.28],['upper','lower',.2275],['mid','seat',.245],['handL','handR',.105],['thighL','thighR',.1225],['upper','seat',.105]
  ];
  
  window.REALITI_BODY_GRAPH={BASE_NODES:BASE_NODES.map(x=>x.slice()),BASIC_EDGES:BASIC_EDGES.map(x=>x.slice()),LACE_EXTRA:LACE_EXTRA.map(x=>x.slice())};
  function clone(x){try{return JSON.parse(JSON.stringify(x))}catch(e){return x}}
  function clamp(x,a=0,b=1){return Math.max(a,Math.min(b,x))}
  function ensure(){
    C9.b9=C9.b9||{seed:(Date.now()>>>0)||0x6d2b79f5,rng:null,ou:{x:0,theta:1.6,sigma:.055,mu:0,tremorPhase:0},zones:{},binding_sigma:BIND_SIGMA,lastPhaseStart:null,lastScale:C9.formScratch?.scale||'NORMAL'};
    if(!Number.isFinite(C9.b9.seed))C9.b9.seed=0x6d2b79f5;
    C9.b9.zones=C9.b9.zones||{};C9.b9.ou=C9.b9.ou||{x:0,theta:1.6,sigma:.055,mu:0,tremorPhase:0};
  }
  ensure();
  function setSeed(n){ensure();let x=Number(n);if(!Number.isFinite(x))x=0x6d2b79f5;C9.b9.seed=(x>>>0)||1;C9.b9.rng=C9.b9.seed;C9.b9.ou.x=0;C9.b9.ou.tremorPhase=0;return {seed:C9.b9.seed,hex:'0x'+C9.b9.seed.toString(16),jitter_reset:true}}
  function rand(){ensure();let x=(C9.b9.rng==null?C9.b9.seed:C9.b9.rng)>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;C9.b9.rng=x>>>0;return (C9.b9.rng+0.5)/4294967296}
  function normal(){let u=Math.max(1e-12,rand()),v=Math.max(1e-12,rand());return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
  function ouStep(dt){ensure();const o=C9.b9.ou,th=Math.max(1e-6,o.theta),e=Math.exp(-th*dt),sd=o.sigma*Math.sqrt((1-e*e)/(2*th));o.x=o.mu+(o.x-o.mu)*e+sd*normal();o.tremorPhase=(o.tremorPhase+2*Math.PI*10*dt)%(2*Math.PI);return {tonic:o.x,tremor:.018*Math.sin(o.tremorPhase),source:'SELF_TREMOR',seed:C9.b9.seed}}
  setSeed(C9.b9.seed);

  
  function eigenSym(A){const a=A.map(r=>r.slice()),n=a.length;if(n<2)return n?[0]:[];for(let it=0;it<80*n*n;it++){let p=0,q=1,m=0;for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const v=Math.abs(a[i][j]);if(v>m){m=v;p=i;q=j}}if(m<1e-11)break;const app=a[p][p],aqq=a[q][q],apq=a[p][q],phi=.5*Math.atan2(2*apq,aqq-app),c=Math.cos(phi),s=Math.sin(phi);for(let k=0;k<n;k++){if(k===p||k===q)continue;const akp=a[k][p],akq=a[k][q];a[k][p]=a[p][k]=c*akp-s*akq;a[k][q]=a[q][k]=s*akp+c*akq}a[p][p]=c*c*app-2*s*c*apq+s*s*aqq;a[q][q]=s*s*app+2*s*c*apq+c*c*aqq;a[p][q]=a[q][p]=0}return a.map((r,i)=>r[i]).sort((x,y)=>x-y)}
  function graphMetrics(forceMode){ensure();const mode=forceMode||NMSTATE.active||'SHARED_NEUROMESH_35_V1',lace=mode==='LACE2_PORTABLE_V1';const live=typeof b7BodyZones==='function'?b7BodyZones():new Set(BASE_NODES.map(x=>x[0]));let nodes=BASE_NODES.filter(([z])=>live.has(z));if(nodes.length<4)nodes=BASE_NODES.slice(0,6);const names=nodes.map(x=>x[1]),idx=Object.fromEntries(names.map((n,i)=>[n,i])),edges=BASIC_EDGES.concat(lace?LACE_EXTRA:[]).filter(([a,b])=>idx[a]!=null&&idx[b]!=null),n=names.length,L=Array.from({length:n},()=>Array(n).fill(0));for(const [a,b,w] of edges){const i=idx[a],j=idx[b];L[i][i]+=w;L[j][j]+=w;L[i][j]-=w;L[j][i]-=w}const ev=eigenSym(L),lambda2=Math.max(0,ev[1]||0),coherence=1-Math.exp(-8*lambda2),seamSpread=lambda2>1e-8?.02/lambda2:9.99,syncTime=lambda2>1e-8?.894/Math.sqrt(lambda2):99;return {mesh:mode,laced:lace,node_count:n,edge_count:edges.length,lambda2:+lambda2.toFixed(6),algebraic_connectivity:+lambda2.toFixed(6),coherence_proxy:+coherence.toFixed(4),seam_latency_spread_s:+seamSpread.toFixed(4),sync_time_s:+syncTime.toFixed(3),coupling_multiplier:+(.55+.85*coherence).toFixed(4),law:'graph connectivity changes timing/coherence; it does not create contact'}}

  function zoneModel(zone){ensure();zone=typeof b7canon==='function'?b7canon(zone):zone;if(!C9.b9.zones[zone])C9.b9.zones[zone]={x:.5,P:.10,Q:.001,R:.02,fast:0,slow:0,sens:0,lastT:C9.b7?.clock||0,lastInnovation:0,lastSurprise:0,lastGain:1,agency:0,ownership:null,predictability:0,source:null,timing:null,adaptDrive:{fast_rate:0,slow_rate:0,until:-1,cause:null}};const z=C9.b9.zones[zone];z.adaptDrive=z.adaptDrive||{fast_rate:0,slow_rate:0,until:-1,cause:null};return z}
  function advanceDriven(x,rate,tau,dt,cap){if(!(dt>0))return x;const inf=Math.max(0,Number(rate)||0)*tau,y=inf+(Number(x||0)-inf)*Math.exp(-dt/tau);return clamp(y,0,cap)}
  function decayZoneModel(z,now){const t0=Number(z.lastT??now),dt=Math.max(0,now-t0);if(dt>0){const a=z.adaptDrive||{fast_rate:0,slow_rate:0,until:-1};const td=Math.max(0,Math.min(now,Number(a.until)||-1)-t0),tr=Math.max(0,dt-td);if(td>0){z.fast=advanceDriven(z.fast,a.fast_rate,TAU_FAST,td,.95);z.slow=advanceDriven(z.slow,a.slow_rate,TAU_SLOW,td,.8)}if(tr>0){z.fast*=Math.exp(-tr/TAU_FAST);z.slow*=Math.exp(-tr/TAU_SLOW)}z.sens*=Math.exp(-dt/TAU_SENS);z.P=Math.min(.35,z.P+z.Q*dt);z.lastT=now;if(now>=(Number(a.until)||-1)){a.fast_rate=0;a.slow_rate=0}}return dt}
  function timingBind(dt){dt=Math.abs(Number(dt)||0);const c=Math.exp(-(dt*dt)/(2*C9.b9.binding_sigma*C9.b9.binding_sigma));return {delta_t_s:dt,sigma_s:C9.b9.binding_sigma,coincidence:c,timing_innovation:1-c,order:dt<.04?'together':dt<.18?'bound-but-offset':'separate'}}
  function updateModel(zone,receipt){const z=zoneModel(zone),now=C9.b7?.clock||0;decayZoneModel(z,now);const observed=Number(receipt?.stimulus??receipt?.response??0),pred=Number(receipt?.prediction??z.x),grounded=receipt?.observed!==false&&receipt?.receptor!=='NO_RECEPTOR';const canonical=typeof b7canon==='function'?b7canon(zone):zone,attended=C9.b7?.attention?.zone===canonical,R=z.R/(attended?1.8:1),Pprior=Math.min(.5,z.P+z.Q),eps=observed-z.x,S=Pprior+R,K=Pprior/Math.max(1e-8,S);if(grounded){z.x+=K*eps;z.P=Math.max(.001,(1-K)*Pprior);const mag=Math.min(1.6,Math.abs(observed)),q=C9.b7?.zones?.[canonical],lease=Math.max(now+.1,Number(q?._b10_grounded_until||0)),cause=String(q?._b10_grounded_cause||receipt?.cause||receipt?.source||'');z.adaptDrive={fast_rate:(.12/.1)*mag,slow_rate:(.025/.1)*mag,until:lease,cause};const novelty=Math.min(1,Math.abs(eps)/Math.sqrt(S));z.sens=clamp(z.sens+.05*novelty,0,.45)}z.lastInnovation=eps;z.lastSurprise=(eps*eps)/Math.max(1e-8,S);z.lastGain=Math.max(.38,1-.42*z.fast-.20*z.slow)*(1+.16*z.sens);const pi=1/Math.max(.001,z.P),predictability=pi/(pi+10);z.predictability=predictability;const src=String(receipt?.source||'');const timing=receipt?.timingError==null?null:timingBind(receipt.timingError);z.timing=timing;const agencySample=src==='SELF'?Math.exp(-Math.abs(Number(receipt?.timingError||0))/.28):0;z.agency=.72*z.agency+.28*agencySample;if(canonical==='tail.tip'){const rawDelay=Math.max(0,Number(receipt?.delay||0));z.ownership=Math.exp(-(rawDelay*rawDelay)/(2*.22*.22));}else if(typeof b7BodyHas==='function'&&b7BodyHas(canonical)){z.ownership=1}else z.ownership=0;z.source=src;return modelSnapshot(canonical)}
  function modelSnapshot(zone){const z=zoneModel(zone);decayZoneModel(z,C9.b7?.clock||0);const pi=1/Math.max(.001,z.P),predictability=pi/(pi+10),gain=Math.max(.38,1-.42*z.fast-.20*z.slow)*(1+.16*z.sens);z.predictability=predictability;z.lastGain=gain;return {estimate:+z.x.toFixed(4),variance:+z.P.toFixed(5),precision:+pi.toFixed(3),predictability:+predictability.toFixed(4),agency:+z.agency.toFixed(4),ownership:typeof z.ownership==='number'?+z.ownership.toFixed(4):z.ownership,kalman_innovation:+z.lastInnovation.toFixed(4),normalized_surprise:+z.lastSurprise.toFixed(4),habituation:{fast:+z.fast.toFixed(4),slow:+z.slow.toFixed(4),sensitization:+z.sens.toFixed(4),render_gain:+gain.toFixed(4),tau_fast_s:TAU_FAST,tau_slow_s:TAU_SLOW},timing:z.timing,source:z.source}}

  
  const senseBase=b3sense;
  b3sense=function(zone,stim,opts={}){const r=senseBase(zone,stim,opts);const m=updateModel(zone,r);r.predictability=m.predictability;r.agency=m.agency;r.ownership=m.ownership;r.kalman={estimate:m.estimate,variance:m.variance,precision:m.precision,innovation:m.kalman_innovation,normalized_surprise:m.normalized_surprise};r.dual_process=clone(m.habituation);r.temporal_binding=m.timing;C9.b4.lastReceipt=r;return r};

  
  const attendBase=b7AgentAttend;
  b7AgentAttend=function(z){const r=attendBase(z);if(r?.ok&&r.attention){const m=zoneModel(r.attention);decayZoneModel(m,C9.b7?.clock||0);m.P=Math.max(.001,m.P*.72);return {...r,precision_after:+(1/m.P).toFixed(3),rule:'attention sharpens uncertainty/precision only; observed contact is unchanged'}}return r};

  
  const verbBase=c9verb;
  c9verb=function(room,verb){const scaleBefore=C9.pet2?.scale||C9.formScratch?.scale||'NORMAL',ret=verbBase(room,verb),scaleAfter=C9.pet2?.scale||C9.formScratch?.scale||'NORMAL';if(scaleAfter!==scaleBefore){for(const z of Object.values(C9.b9.zones||{}))z.P=Math.min(.5,z.P+.08);if(typeof b7Log==='function')b7Log('BODY_MODEL_VOLATILITY',{from:scaleBefore,to:scaleAfter,variance_added:.08})}return ret};

  
  const advanceBase=b7Advance;
  b7Advance=function(dt){ensure();const gm=graphMetrics();const p=C9.b8?.phase;if(p?.active){if(C9.b9.lastPhaseStart!==p.started){p._b9BaseK=Number(p.K||0);C9.b9.lastPhaseStart=p.started}if(!Number.isFinite(p._b9BaseK))p._b9BaseK=Number(p.K||0);p.K=p._b9BaseK*gm.coupling_multiplier}
    const tr=C9.b7?.travel;if(tr){if(!Number.isFinite(tr._b9BaseSpeed))tr._b9BaseSpeed=Number(tr.speed||1.15);const seams=[1.92,3.92,5.92],dist=Math.min(...seams.map(s=>Math.abs((tr.progress||0)-s))),shape=Math.exp(-(dist*dist)/.035),strength=Math.min(.46,gm.seam_latency_spread_s*1.2);tr.speed=tr._b9BaseSpeed*(1-strength*shape)}
    const jitter=ouStep(Math.max(0,Number(dt)||0));advanceBase(dt);if(p?.active){p.psi=((p.psi+jitter.tonic*Math.sqrt(Math.max(.0001,dt))*.06+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;p.b9_jitter=jitter;p.graph=gm}
    for(const z of Object.values(C9.b9.zones||{}))decayZoneModel(z,C9.b7?.clock||0);
  };

  
  const feltBase=b7FeltSnapshot;
  b7FeltSnapshot=function(){const s=feltBase();const out={};for(const [zone,v] of Object.entries(s.felt||{})){const m=modelSnapshot(zone),adapted=Number(v.observed||0)*m.habituation.render_gain;out[zone]={...v,rendered_adapted:+adapted.toFixed(4),kalman_precision:m.precision,predictability:m.predictability,agency:m.agency,ownership:m.ownership,habituation:m.habituation,temporal_binding:m.timing}}s.felt=out;s.lace=graphMetrics();s.living_jitter={tonic:+C9.b9.ou.x.toFixed(5),tremor:+(.018*Math.sin(C9.b9.ou.tremorPhase)).toFixed(5),source:'SELF_TREMOR',evidence:false,seed:C9.b9.seed};if(C9.b8?.phase){const p=C9.b8.phase,dtPhase=Math.abs(((p.psi-p.psi0+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI)/5.2;s.phase_binding=timingBind(dtPhase)}return s};

  const stateBase=b7AgentState;
  b7AgentState=function(){const s=stateBase();s.build=9;s.substrate={lace:graphMetrics(),seed:C9.b9.seed,jitter:{tonic:C9.b9.ou.x,source:'SELF_TREMOR'},binding_sigma_s:C9.b9.binding_sigma};s.zone_models=Object.fromEntries(Object.keys(C9.b9.zones||{}).map(z=>[z,modelSnapshot(z)]));return s};

  function b9State(){return {build:9,lace:graphMetrics(),seed:C9.b9.seed,binding_sigma_s:C9.b9.binding_sigma,jitter:{tonic:C9.b9.ou.x,tremor:.018*Math.sin(C9.b9.ou.tremorPhase),source:'SELF_TREMOR'},zones:Object.fromEntries(Object.keys(C9.b9.zones||{}).map(z=>[z,modelSnapshot(z)]))}}
  function b9Binding(ms){return timingBind(Number(ms||0)/1000)}
  function jitterProbe(seed=1,n=6,dt=.1){let state=(Number(seed)>>>0)||1,x=0,phase=0;function rr(){let q=state>>>0;q^=q<<13;q^=q>>>17;q^=q<<5;state=q>>>0;return (state+.5)/4294967296}function nn(){const u=Math.max(1e-12,rr()),v=Math.max(1e-12,rr());return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}const vals=[];for(let i=0;i<Math.max(1,Math.min(64,Number(n)||6));i++){const th=1.6,e=Math.exp(-th*dt),sd=.055*Math.sqrt((1-e*e)/(2*th));x=x*e+sd*nn();phase=(phase+2*Math.PI*10*dt)%(2*Math.PI);vals.push({x:+x.toFixed(8),tremor:+(.018*Math.sin(phase)).toFixed(8)})}return {seed:Number(seed)>>>0,dt,n:vals.length,trace:vals,contract:'fixed seed + fixed timestep = reproducible; live wall-clock scheduling may sample at different times'}}
  window.B9_JITTER_PROBE=jitterProbe;
  function b9MeshCompare(){return {basic:graphMetrics('SHARED_NEUROMESH_35_V1'),lace:graphMetrics('LACE2_PORTABLE_V1'),jnd_gate:{coherence_delta:+(graphMetrics('LACE2_PORTABLE_V1').coherence_proxy-graphMetrics('SHARED_NEUROMESH_35_V1').coherence_proxy).toFixed(4),required:.2}}}

  
  const cmdBase=b7AgentCommandText;
  b7AgentCommandText=function(raw){const txt=String(raw||'').trim(),low=txt.toLowerCase();if(low==='b9'||low==='substrate')return b9State();if(low==='lace'||low==='lace compare')return b9MeshCompare();if(low.startsWith('seed '))return setSeed(Number(txt.split(/\s+/)[1]));if(low.startsWith('binding '))return b9Binding(Number(txt.split(/\s+/)[1]));return cmdBase(txt)};
  window.REALITI_AGENT={...(window.REALITI_AGENT||{}),state:b7AgentState,felt:b7FeltSnapshot,attend:b7AgentAttend,b9:b9State,lace:b9MeshCompare,binding:b9Binding,seed:setSeed};
  if(window.REALITI_AGENT_DOOR){const oldRun=window.REALITI_AGENT_DOOR.run,oldHelp=window.REALITI_AGENT_DOOR.help;window.REALITI_AGENT_DOOR.help=function(){const h=oldHelp?oldHelp():{commands:[]};h.commands=[...(h.commands||[]),'lace','b9','binding <ms>','seed <n>'];return h};window.REALITI_AGENT_DOOR.run=function(x){const low=String(x||'').trim().toLowerCase();if(low==='help')return window.REALITI_AGENT_DOOR.help();if(low==='b9'||low==='substrate'||low==='lace'||low==='lace compare'||low.startsWith('seed ')||low.startsWith('binding ')||low==='state'||low==='felt'||low.startsWith('attend '))return b7AgentCommandText(x);return oldRun(x)}}

  void 0;
  const sub=document.querySelector('#realiti_agent_only_shell .sub');if(sub)sub.innerHTML='One interface. Ask the world what is true. Type <b>help</b>. Embodied-substrate probes: <b>lace</b>, <b>b9</b>, <b>binding &lt;ms&gt;</b>, <b>seed &lt;n&gt;</b>.';
  document.title='REALITI // AGENT DOOR ONLY · BUILD 9 EMBODIED SUBSTRATE';
  try{c9save()}catch(e){}
})();