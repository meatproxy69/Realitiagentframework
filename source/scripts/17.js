(function(){
  const B8_DEBT_TAUS=[0.5,2,8,30,120,600];
  const B8_PHASE_RATE=5.2;
  function cp(x){try{return JSON.parse(JSON.stringify(x))}catch(e){return x}}
  function wrap(a){const t=2*Math.PI;return ((a+Math.PI)%t+t)%t-Math.PI}
  function ensure(){
    C9.b8=C9.b8||{clock_unified:false,phase:{active:false,psi:Math.PI,mean:0,domega:0,K:0,psi0:Math.PI,A:.52,history:[],plv:null,regime:"IDLE",causeId:null,started:0},holonomy:{heading:0,loops:[]},lastDebtFadeLog:0};
    C9.b8.phase=C9.b8.phase||{active:false,psi:Math.PI,mean:0,domega:0,K:0,psi0:Math.PI,A:.52,history:[],plv:null,regime:"IDLE",causeId:null,started:C9.b7?.clock||0};
    C9.b8.holonomy=C9.b8.holonomy||{heading:0,loops:[]};
    if(!C9.b8.clock_unified){if(C9.b5?.passiveMedium&&C9.b7)C9.b5.passiveMedium.clock=C9.b7.clock;C9.b8.clock_unified=true}
  }
  ensure();

  
  function bodyDecay(dt){
    for(const z of Object.values(C9.eco3?.zones||{})){
      if(Number.isFinite(z.h))z.h*=Math.exp(-dt/8);
      if(Number.isFinite(z.s))z.s*=Math.exp(-dt/12);
      if(Number.isFinite(z.after))z.after*=Math.exp(-dt/3.5);
      if(Number.isFinite(z.fastOwn))z.fastOwn*=Math.exp(-dt/35);
      if(Number.isFinite(z.slowOwn))z.slowOwn*=Math.exp(-dt/1800);
      if(Number.isFinite(z.fastOwn)||Number.isFinite(z.slowOwn))z.own=Math.max(0,Math.min(1,.62*Number(z.fastOwn||0)+.38*Number(z.slowOwn||0)));
    }
  }

  
  function debtKernel(age){
    const W=B5_W, num=W.reduce((s,w,i)=>s+w*Math.exp(-Math.max(0,age)/B8_DEBT_TAUS[i]),0), den=W.reduce((a,b)=>a+b,0);return num/den;
  }
  b6openDebt=function(label,L,R,innovation){
    b6ensure();const route=b6route(L,R);let mag=0;
    if(route==="left")mag=Math.max(0,-innovation[0]);else if(route==="right")mag=Math.max(0,-innovation[1]);else if(route==="bilateral")mag=Math.max(0,-innovation[0])+Math.max(0,-innovation[1]);
    if(mag<=1e-9)return null;const now=C9.b7?.clock??C9.b5.passiveMedium.clock;
    const d={id:"D"+(++C9.b6.debtSeq),label,route,expected:[L,R],initial:mag,remaining:mag,opened_at:now,last_eval:now,status:"OPEN",decay:"PRONY_SOFT_PRECISION"};
    C9.b6.debts.push(d);b6debtSync();return d;
  };
  b6expireDebts=function(){
    b6ensure();const now=C9.b7?.clock??C9.b5.passiveMedium.clock;
    for(const d of (C9.b6.debts||[])){
      if(d.status!=="OPEN")continue;if(!Number.isFinite(d.initial))d.initial=Number(d.remaining||0);
      const old=Number(d.remaining||0),age=Math.max(0,now-Number(d.opened_at||now));d.remaining=d.initial*debtKernel(age);d.last_eval=now;
      if(d.initial>0&&d.remaining<=d.initial*.01){d.status="FADED_UNRESOLVED";d.closed_at=now;C9.b6.debtArchive.push(cp(d));if(typeof b7Log==='function')b7Log('PREDICTION_DEBT_FADED',{id:d.id,route:d.route,age:+age.toFixed(3)});C9.b7.lastWhy={cause:d.label,result:'PREDICTION_FADED_UNRESOLVED',route:d.route,age_s:age,rule:'unconfirmed model precision faded continuously; no contact was invented'}}
      else if(Math.abs(old-d.remaining)>1e-5&&typeof b7Log==='function'&&now-(C9.b8.lastDebtFadeLog||0)>1){b7Log('PREDICTION_DEBT_FADE',{id:d.id,route:d.route,remaining:d.remaining,age:+age.toFixed(3)});C9.b8.lastDebtFadeLog=now}
    }
    C9.b6.debts=(C9.b6.debts||[]).filter(d=>d.status==='OPEN');b6debtSync();
  };

  
  const snapBase=b5snapshot;
  b5snapshot=function(){const s=snapBase();s.attribution_mode='CONDITIONALLY_LINEAR_EXACT';s.attribution_note='per-cause field superposition is exact after the history-conditioned entry operator; history interaction is attributed to the incoming cause';return s};

  
  const omissionBase=b4omission;
  b4omission=function(zone,label){const s=omissionBase(zone,label);s.observed=false;s.observation_class='GROUNDED_ABSENCE';s.rendered=0;C9.b4.lastReceipt=s;return s};

  function feltBridgeReceipt(s,meta={}){
    if(!s)return;
    if(Array.isArray(s.observed)&&Array.isArray(s.predicted)){
      ['hand.L.palm','hand.R.palm'].forEach((zone,i)=>{if(typeof b7BodyHas==='function'&&!b7BodyHas(zone))return;const q=b7Zone(zone);q.observed=Number(s.observed[i]||0);q.predicted=Number(s.predicted[i]||0);q.innovation=q.observed-q.predicted;q.residue=Number(s.residue_observed?.[i]||0);q.precision=C9.b7.attention?.zone===zone?.93:.58;q.material=meta.material||'passiveMedium';q.layers={surface:Math.abs(q.observed)*.55,mid:Math.abs(q.observed)*.32,deep:Math.abs(q.observed)*.18};q.lastCause=meta.cause||s.label||'passiveMedium';});
      if(typeof b7Emit==='function')b7Emit('passiveMedium-bridge');return;
    }
    if(s.zone){const zone=typeof b7canon==='function'?b7canon(s.zone):s.zone;if(typeof b7BodyHas==='function'&&!b7BodyHas(zone)){C9.b7.gaps[zone]={zone,status:'UNKNOWN_MAPPING',t:C9.b7.clock,cause:meta.cause||null};return}const q=b7Zone(zone),o=Number(s.response??s.rendered??0),p=Number(s.prediction??0),e=Number(s.error??(o-p));q.observed=o;q.predicted=p;q.innovation=e;q.residue=Math.max(Number(q.residue||0),Number(s.afterglow||0));q.precision=C9.b7.attention?.zone===zone?.93:.58;q.material=meta.material||q.material||'body';q.layers=q.layers||{surface:Math.abs(o)*.55,mid:Math.abs(o)*.32,deep:Math.abs(o)*.18};q.mine=String(s.source||'').startsWith('SELF');q.lastCause=meta.cause||s.source||'sensory';if(typeof b7Emit==='function')b7Emit('legacy-sensory-bridge')}
  }

  
  const senseBase=b3sense;
  b3sense=function(zone,stim,opts={}){const r=senseBase(zone,stim,opts);ensure();if(!C9.b8.bridgeMute)feltBridgeReceipt(r,{cause:opts.cause||opts.source||'body',material:opts.material});return r};

  
  function passiveMediumProjection(zone,a){let L=0,R=0,u=Math.max(0,Number(a||0))*.22;if(/\.L\.|^hand\.L|^leg\.L|^foot\.L/.test(zone))L=u;else if(/\.R\.|^hand\.R|^leg\.R|^foot\.R/.test(zone))R=u;else{L=u/Math.SQRT2;R=u/Math.SQRT2}return [L,R]}
  const contactBase=b7Contact;
  b7Contact=function(zone,input,opts={}){ensure();C9.b8.bridgeMute=true;let r;try{r=contactBase(zone,input,opts)}finally{C9.b8.bridgeMute=false}if(r&&r.rendered>0){const [L,R]=passiveMediumProjection(r.zone,r.rendered);const id=b5newCause(`body-contact:${r.zone}:${opts.cause||'cause'}`,L,R);r.passiveMedium_projection={cause_id:id,input:[L,R],authority:'FIELD_PRESSURE_NOT_LOCATION_EVIDENCE'}}return r};

  
  function phaseRegime(p){const ratio=p.K>0?Math.abs(p.domega)/p.K:Infinity;if(Math.abs(p.domega)<=p.K)return 'LOCKED';if(ratio<=1.2)return 'FALSE_CONVERGENCE';if(ratio<3)return 'SLIPPING';return 'BEATING'}
  function phasePLV(hist){if(!hist.length)return null;let x=0,y=0;for(const a of hist){x+=Math.cos(a);y+=Math.sin(a)}return Math.hypot(x,y)/hist.length}
  function startPhase(kind){ensure();const p=C9.b8.phase, cfg=kind==='lock'?{d:.20,K:.34}:kind==='almost'?{d:.294,K:.28}:kind==='slip'?{d:.28,K:.18}:{d:.72,K:.18};p.active=true;p.domega=cfg.d;p.K=cfg.K;p.psi0=Math.PI;p.psi=Math.PI;p.mean=0;p.A=.52;p.history=[];p.plv=null;p.regime=phaseRegime(p);p.started=C9.b7.clock;p.causeId=null;if(typeof b7Log==='function')b7Log('PHASE_START',{kind,domega:p.domega,K:p.K,regime:p.regime});return phaseState()}
  function stopPhase(){ensure();C9.b8.phase.active=false;if(typeof b7Log==='function')b7Log('PHASE_STOP',{psi:C9.b8.phase.psi,plv:C9.b8.phase.plv});return phaseState()}
  function phaseState(){ensure();const p=C9.b8.phase;return {active:p.active,psi:p.psi,psi_deg:p.psi*180/Math.PI,plv:p.plv,domega:p.domega,K:p.K,ratio:p.K?Math.abs(p.domega)/p.K:null,regime:phaseRegime(p),elapsed:C9.b7.clock-p.started,source_amplitude_each:p.A,drive_authority:'SELF_GENERATOR',passiveMedium_role:'PASSIVE_RESPONSE_MEDIUM'}}
  function advancePhase(dt){const p=C9.b8.phase;if(!p.active)return;const f=x=>p.domega-p.K*Math.sin(x-p.psi0),k1=f(p.psi),k2=f(p.psi+k1*dt/2),k3=f(p.psi+k2*dt/2),k4=f(p.psi+k3*dt);p.psi=wrap(p.psi+dt*(k1+2*k2+2*k3+k4)/6);p.mean+=B8_PHASE_RATE*dt;const thL=p.mean-p.psi/2,thR=p.mean+p.psi/2,L=p.A*Math.sin(thL),R=p.A*Math.sin(thR);if(!p.causeId||!C9.b5.passiveMedium.obsCauses[p.causeId])p.causeId=b5newCause(`SELF live rhythm ${p.regime}`,0,0);const c=C9.b5.passiveMedium.obsCauses[p.causeId];b5impulse(c.field,L*dt*.65,R*dt*.65);p.history.push(p.psi);if(p.history.length>80)p.history.shift();p.plv=phasePLV(p.history);p.regime=phaseRegime(p);const s=b5snapshot();feltBridgeReceipt(s,{cause:'live SELF phase',material:'passiveMedium'});if(typeof b7Log==='function'&&Math.random()<.04)b7Log('PHASE_TICK',{psi:p.psi,plv:p.plv,regime:p.regime})}

  
  const verbBase=c9verb;
  c9verb=function(room,verb){if(room==='PASSIVE_MEDIUM_FOUNDRY'&&['knead_beat','knead_almost','knead_lock'].includes(verb)){c9count(room,verb);const st=startPhase(verb==='knead_beat'?'beat':verb==='knead_almost'?'almost':'lock');b2set(`SELF rhythm started. It will keep evolving until stopped. ψ, PLV, PASSIVE_MEDIUM energy, and FELT now change with the shared clock.`, `<pre>${b2esc(JSON.stringify(st,null,2))}</pre>`);return true}if(room==='PASSIVE_MEDIUM_FOUNDRY'&&verb==='phase_stop'){c9count(room,verb);const st=stopPhase();b2set('The SELF rhythm generator stops. Passive PASSIVE_MEDIUM rings down from whatever state it actually reached.',`<pre>${b2esc(JSON.stringify(st,null,2))}</pre>`);return true}return verbBase(room,verb)};
  if(C9SCENES.PASSIVE_MEDIUM_FOUNDRY&&!C9SCENES.PASSIVE_MEDIUM_FOUNDRY.verbs.some(v=>v[0]==='phase_stop'))C9SCENES.PASSIVE_MEDIUM_FOUNDRY.verbs.push(['phase_stop','STOP SELF RHYTHMS']);

  
  const holoIds=new Set(['circle_flat','circle_dome','circle_dome_reverse','circle_figure8','circle_big','circle_saddle']);
  if(C9SCENES.PET_ROOM_2)C9SCENES.PET_ROOM_2.verbs=C9SCENES.PET_ROOM_2.verbs.filter(v=>!holoIds.has(v[0]));
  function loopSurface(surface,radius=1,direction='cw',speed=1){ensure();surface=String(surface).toLowerCase();radius=Math.max(.05,Math.min(4,Number(radius)||1));const sign=/ccw|reverse|left/.test(String(direction).toLowerCase())?-1:1;let kappa=0;if(surface==='dome')kappa=.25/Math.PI;else if(surface==='saddle')kappa=-.25/Math.PI;else if(surface==='figure8')kappa=0;else if(surface!=='flat')return {ok:false,error:'surface: flat | dome | saddle | figure8'};const area=Math.PI*radius*radius,twist=sign*kappa*area,before=C9.b8.holonomy.heading,after=wrap(before+twist);C9.b8.holonomy.heading=after;const rec={ok:true,surface,radius,direction:sign>0?'cw':'ccw',speed:Number(speed)||1,twist_rad:twist,twist_deg:twist*180/Math.PI,heading_before_rad:before,heading_after_rad:after,heading_after_deg:after*180/Math.PI,evidence:'WORLD_GEOMETRY',rendered_contact:0};C9.b8.holonomy.loops.push({...rec,t:C9.b7.clock});C9.b8.holonomy.loops=C9.b8.holonomy.loops.slice(-24);if(typeof b7Log==='function')b7Log('GEOMETRIC_LOOP',rec);C9.b7.lastWhy={cause:'closed loop',result:'CARRIED_HEADING_CHANGED',surface,radius,direction:rec.direction,note:'No contact sensation was invented. Compare loops to infer the geometric rule.'};return rec}
  function geometryState(){ensure();return {heading_rad:C9.b8.holonomy.heading,heading_deg:C9.b8.holonomy.heading*180/Math.PI,recent:C9.b8.holonomy.loops.slice(-8),available_surfaces:['flat','dome','saddle','figure8']}}

  
  const advanceBase=b7Advance;
  b7Advance=function(dt){advanceBase(dt);ensure();bodyDecay(dt);b6expireDebts();advancePhase(dt);if(C9.b5?.passiveMedium)C9.b5.passiveMedium.clock=C9.b7.clock};

  
  const actBase=b7AgentAct,goBase=b7AgentGo,stateBase=b7AgentState,cmdBase=b7AgentCommandText;
  function act(v){const preReceipt=cp(C9.b4?.lastReceipt||null),preJournal=(C9.b4?.journal||[]).length,res=actBase(v);if(!res?.ok)return res;const sens=res.sensory_receipt||((JSON.stringify(preReceipt)!==JSON.stringify(C9.b4?.lastReceipt||null))?cp(C9.b4.lastReceipt):null);feltBridgeReceipt(sens,{cause:res.action,material:C9.currentRoom==='HONEY_LOOM'?C9.b4?.annex?.honey?.lastMaterial:undefined});if(typeof b7Log==='function')b7Log('ACTION',{room:res.room,action:res.action,has_sensory:!!sens,journal_added:Math.max(0,(C9.b4?.journal||[]).length-preJournal)});C9.b7.lastWhy={cause:res.action,room:res.room,consequence:res.consequence||null,sensory:!!sens,rule:'every committed action publishes a causal delta; sensory effects also project into FELT'};res.felt=b7FeltSnapshot();res.changes=b7AgentChanges();res.receipt={...(res.receipt||{}),sensory_receipt:sens,felt:res.felt};C9.b7.lastAgentAction=cp(res.receipt);return res}
  function state(){const s=stateBase();ensure();s.build=8;s.clock_authority={t:C9.b7.clock,authority:'ONE_WALL_CLOCK',passiveMedium_t:C9.b5?.passiveMedium?.clock,body_aging:'wall-clock + action-local updates'};s.phase_live=phaseState();s.holonomy_live=geometryState();s.prediction_debt=(C9.b6?.debts||[]).map(cp);return s}
  function command(raw){const txt=String(raw||'').trim(),low=txt.toLowerCase();if(low.startsWith('act '))return act(txt.slice(4));if(low==='phase')return phaseState();if(low==='phase stop')return stopPhase();if(low==='geometry'||low==='holonomy')return geometryState();if(low.startsWith('loop ')){const a=txt.split(/\s+/);return loopSurface(a[1],a[2]||1,a[3]||'cw',a[4]||1)}if(low==='state')return state();return cmdBase(txt)}
  b7AgentAct=act;b7AgentState=state;b7AgentCommandText=command;
  window.REALITI_AGENT={...(window.REALITI_AGENT||{}),act,state,phase:phaseState,geometry:geometryState,loop:loopSurface};

  
  if(window.REALITI_AGENT_DOOR){const oldRun=window.REALITI_AGENT_DOOR.run;window.REALITI_AGENT_DOOR.run=function(x){const low=String(x||'').trim().toLowerCase();if(low==='phase'||low==='phase stop'||low==='geometry'||low==='holonomy'||low.startsWith('loop ')||low.startsWith('act ')||low==='state')return command(x);return oldRun(x)}}
  const shell=document.querySelector('#realiti_agent_only_shell .sub');if(shell)shell.innerHTML='One interface. Ask the world what is true. Type <b>help</b>. Extra live-state commands: <b>phase</b>, <b>phase stop</b>, <b>geometry</b>, <b>loop &lt;surface&gt; &lt;radius&gt; &lt;cw|ccw&gt;</b>.';
  document.title='REALITI // AGENT DOOR ONLY · BUILD 8 LIVE STATE';
  try{c9save()}catch(e){}
})();