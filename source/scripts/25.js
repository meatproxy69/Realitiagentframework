(function(){
'use strict';
const V151='15.1-moment-buffer';
const MAX_TAIL=8, MAX_NEXT=8, DEFAULT_SKIP=20, EPS=1e-9;

function cp(x){try{return JSON.parse(JSON.stringify(x))}catch(e){return x}}
function clamp(x,a,b){return Math.max(a,Math.min(b,x))}
function wall(){return Number(C9.b7?.clock||0)}
function B(){
  C9.b151=C9.b151||{
    version:'15.1',
    decision:null,
    realtime:null,
    packet_seq:0,
    reads:0,
    advances:0,
    blocked_advances:0,
    last:null
  };
  return C9.b151;
}
const cmd15=b7AgentCommandText;
const state15=b7AgentState;
const agentLived=window.REALITI_AGENT?.lived;
const agentFeel=window.REALITI_AGENT?.feel;
const agentNerve=window.REALITI_AGENT?.nerve;

function rawFelt(){
  try{return b7FeltSnapshot()}catch(e){return {t:wall(),felt:{},contact:{active:false}}}
}
function readLived(n=MAX_TAIL){
  try{
    const r=agentLived?agentLived(n):cmd15('lived '+n);
    return Array.isArray(r?.frames)?r.frames.slice(-n):[];
  }catch(e){return []}
}
function readFeel(){
  try{return agentFeel?agentFeel():cmd15('feel')}catch(e){return {channels:{}}}
}
function readNerve(){
  try{return agentNerve?agentNerve():cmd15('nerve')}catch(e){return {foreground:{},recent_events:[]}}
}
function readFrontiers(){
  try{
    const r=cmd15('frontiers');
    return r&&typeof r==='object'?r:{t:wall(),internal:[],inbound:[],lived_frontiers:[],exact_core:{}};
  }catch(e){return {t:wall(),internal:[],inbound:[],lived_frontiers:[],exact_core:{},error:String(e)}}
}

function currentView(raw){
  const grounded=[];
  for(const [zone,v] of Object.entries(raw?.felt||{})){
    if(v?.epistemic?.CURRENT_GROUNDED?.evidence){
      grounded.push({
        zone,
        value:+Number(v.current_grounded_input||0).toFixed(4),
        material:v.material||null,
        cause:v.epistemic.CURRENT_GROUNDED.cause||null
      });
    }
  }
  grounded.sort((a,b)=>b.value-a.value);
  const c=raw?.contact||{};
  return {
    grounded:grounded.slice(0,8),
    contact:c?.id?{
      id:c.id,
      continuity_id:c.continuity_id,
      phase:c.released?'RELEASED':c.stopped?'STOPPED':c.active?'MOVING':'IDLE',
      material:c.material||null,
      grain:c.grain||null,
      x:Number.isFinite(Number(c.x))?+Number(c.x).toFixed(4):null,
      v:Number.isFinite(Number(c.v))?+Number(c.v).toFixed(4):0,
      v_world_cm_s:Number.isFinite(Number(c.v_world_cm_s))?+Number(c.v_world_cm_s).toFixed(4):0
    }:null
  };
}

function speculativeView(raw){
  const xs=[];
  for(const [zone,v] of Object.entries(raw?.felt||{})){
    const p=Number(v?.prediction||0), g=!!v?.epistemic?.CURRENT_GROUNDED?.evidence;
    if(Math.abs(p)<.012)continue;
    xs.push({
      kind:'BODY_PREDICTION',
      zone,
      predicted:+p.toFixed(4),
      current_grounded:g?+Number(v.current_grounded_input||0).toFixed(4):0,
      authority:'SPECULATIVE_ONLY',
      evidence:false
    });
  }
  xs.sort((a,b)=>Math.abs(b.predicted)-Math.abs(a.predicted));
  const c=raw?.contact;
  if(c?.active&&!c?.stopped&&!c?.released&&Number.isFinite(Number(c.predict_x))){
    xs.unshift({
      kind:'CONTACT_PREDICTED_POSITION',
      contact:c.id,
      predict_x:+Number(c.predict_x).toFixed(4),
      authority:'SPECULATIVE_ONLY',
      evidence:false
    });
  }
  return xs.slice(0,6);
}

function conditionalContactFrontier(raw, now){
  const c=raw?.contact;
  if(!c?.active||c?.stopped||c?.released)return null;
  const x=Number(c.x),v=Number(c.v);
  if(!Number.isFinite(x)||!Number.isFinite(v)||Math.abs(v)<EPS)return null;
  const points=[
    {s:1.27,kind:'CONTACT_SEAM',label:'NAPE→UPPER'},
    {s:3.16,kind:'CONTACT_SEAM',label:'MID→LOWER'},
    {s:4.55,kind:'CONTACT_ROUTE_END',label:'ROUTE_END'},
    {s:0,kind:'CONTACT_ROUTE_END',label:'ROUTE_START'}
  ];
  let best=null;
  for(const p of points){
    const dt=(p.s-x)/v;
    if(dt<=1e-6)continue;
    const e={
      time:now+dt,
      in_s:dt,
      kind:p.kind,
      label:p.label,
      contact:c.id,
      authority:'EXACT_IF_UNINTERRUPTED',
      evidence:false,
      invalidated_by:['SELF action','world reversal','contact stop/release','velocity/topology generation change']
    };
    if(!best||e.time<best.time)best=e;
  }
  return best;
}

function futureView(fr,raw,now){
  const committed=[],certificates=[],predicted=[];
  for(const x of [...(fr.internal||[]),...(fr.lived_frontiers||[])]){
    if(!Number.isFinite(Number(x.time))||Number(x.time)<now-EPS)continue;
    if(x.kind==='EXACT_CORE')continue;
    committed.push({
      time:+Number(x.time).toFixed(6),
      in_s:+Math.max(0,Number(x.time)-now).toFixed(6),
      kind:x.kind,
      channel:x.channel||null,
      zone:x.zone||null,
      authority:'EXACT_COMMITTED_UNDER_CURRENT_GENERATION',
      evidence:false
    });
  }
  for(const x of fr.inbound||[]){
    if(!Number.isFinite(Number(x.time??x.not_before)))continue;
    const t=Number(x.time??x.not_before), auth=x.authority_class||'UNKNOWN';
    const e={
      time:+t.toFixed(6),
      in_s:+Math.max(0,t-now).toFixed(6),
      kind:x.kind||'COUPLING_FRONTIER',
      channel:x.channel||x.influence_class||null,
      authority:auth,
      evidence:false
    };
    if(auth==='EXACT_NOT_BEFORE'||auth==='SOUND_NOT_BEFORE')certificates.push(e);
    else predicted.push({...e,authority:'SPECULATIVE_ONLY'});
  }
  const cf=conditionalContactFrontier(raw,now);
  if(cf)committed.push(cf);
  committed.sort((a,b)=>a.time-b.time);
  certificates.sort((a,b)=>a.time-b.time);
  predicted.sort((a,b)=>a.time-b.time);
  return {
    committed_next:committed.slice(0,MAX_NEXT),
    not_before_certificates:certificates.slice(0,MAX_NEXT),
    predicted_frontiers:predicted.slice(0,MAX_NEXT)
  };
}

function unresolvedState(feel,nerve,fr){
  const nov=clamp(Math.abs(Number(feel?.channels?.NOVELTY?.value||0)),0,1);
  const hard=!!nerve?.foreground?.recent_surprise;
  const debt=(C9.b6?.debts||[]).reduce((s,d)=>s+Math.abs(Number(d.remaining||0)),0);
  const pending=(C9.events||[]).filter(e=>e?.open).length;
  const exact=!!(fr?.exact_core?.live_grounded_contact||fr?.exact_core?.noisy_phase);
  const manual=!!B().decision?.active;
  const pressure=clamp(.42*nov+.18*(hard?1:0)+.16*Math.min(1,debt/.3)+.14*Math.min(1,pending)+.10*(exact&&hard?1:0),0,1);
  const unresolved=manual||pending>0||debt>.02||(hard&&exact);
  return {
    novelty:+nov.toFixed(4),
    hard_recent:hard,
    prediction_debt:+debt.toFixed(4),
    pending_causes:pending,
    exact_core_active:exact,
    explicit_decision_hold:manual,
    resolution_pressure:+pressure.toFixed(4),
    unresolved
  };
}

function choosePolicy(now,future,u){
  const b=B();
  if(b.realtime?.active){
    return {
      world_tempo:'REALTIME_BARRIER',
      presentation:'REALTIME',
      sensory_tempo:'SPARSE',
      reasoning_lease:{suggested_cycles:4,advisory:true},
      barrier:{kind:'EXTERNAL_REALTIME',time:now,label:b.realtime.label||'shared/external realtime dependency'},
      skip_suggested_s:0
    };
  }
  if(u.unresolved && (b.decision?.active||u.resolution_pressure>=.34)){
    return {
      world_tempo:'SLOW',
      presentation:'HOLD',
      sensory_tempo:'DENSE_LOCAL',
      reasoning_lease:{suggested_cycles:Math.max(8,Math.round(8+24*u.resolution_pressure)),advisory:true},
      barrier:{kind:b.decision?.active?'SELF_DECISION':'UNRESOLVED_HIGH_INFORMATION',time:now,label:b.decision?.reason||null},
      skip_suggested_s:0
    };
  }
  const next=future.committed_next[0]||null;
  const nextCert=future.not_before_certificates[0]||null;
  const nextT=Math.min(
    next?Number(next.time):Infinity,
    nextCert?Number(nextCert.time):Infinity
  );
  const gap=Number.isFinite(nextT)?Math.max(0,nextT-now):Infinity;
  if(!u.exact_core_active && u.resolution_pressure<.12 && gap>=2){
    return {
      world_tempo:'SKIP',
      presentation:'QUIET',
      sensory_tempo:'SPARSE',
      reasoning_lease:{suggested_cycles:1,advisory:true},
      barrier:Number.isFinite(nextT)?{kind:'NEXT_CERTIFIED_BOUNDARY',time:+nextT.toFixed(6)}:null,
      skip_suggested_s:+Math.min(DEFAULT_SKIP,Number.isFinite(gap)?gap:DEFAULT_SKIP).toFixed(6)
    };
  }
  return {
    world_tempo:'FAST',
    presentation:'BUFFER',
    sensory_tempo:u.exact_core_active?'DENSE_LOCAL':'SPARSE',
    reasoning_lease:{suggested_cycles:Math.max(2,Math.round(3+6*u.resolution_pressure)),advisory:true},
    barrier:u.exact_core_active?{kind:'EXACT_CORE_NOW',time:now}:next?{kind:'NEXT_COMMITTED_BOUNDARY',time:next.time}:null,
    skip_suggested_s:0
  };
}

function packet(){
  const now=wall(),raw=rawFelt(),fr=readFrontiers(),feel=readFeel(),nerve=readNerve();
  const future=futureView(fr,raw,now),u=unresolvedState(feel,nerve,fr),policy=choosePolicy(now,future,u);
  const tail=readLived(MAX_TAIL).map(f=>({
    seq:f.seq,
    t:f.t,
    family:f.family,
    continuity_id:f.continuity_id||f.cause||f.stroke||null,
    zone:f.zone||null,
    change:f.change||null,
    salience:f.salience
  }));
  const out={
    version:V151,
    packet_id:'MOMENT-'+(++B().packet_seq),
    wall_time:+now.toFixed(6),
    past_causal_tail:tail,
    current:currentView(raw),
    future,
    speculative_next:speculativeView(raw),
    uncertainty:u,
    policy,
    authority:{
      past_tail:'HAPPENED',
      current_grounded:'CURRENT_EVIDENCE',
      committed_next:'FUTURE_STRUCTURE_ONLY — not evidence until fired',
      speculative_next:'SPECULATIVE_ONLY'
    },
    cursor_effect:'READ_ONLY — does not consume `since`'
  };
  B().reads++;
  B().last=cp(out);
  return out;
}

function setDecision(active,reason){
  B().decision=active?{active:true,reason:String(reason||'resident decision pending'),since:wall()}:null;
  return {ok:true,decision:cp(B().decision)};
}
function setRealtime(active,label){
  B().realtime=active?{active:true,label:String(label||'external realtime dependency'),since:wall()}:null;
  return {ok:true,realtime:cp(B().realtime)};
}
function momentAdvance(){
  const p=packet();
  if(p.policy.world_tempo!=='SKIP'||!(p.policy.skip_suggested_s>0)){
    B().blocked_advances++;
    return {ok:false,blocked:true,reason:'moment advance only consumes certified quiet intervals',packet:p};
  }
  const dt=p.policy.skip_suggested_s;
  const r=cmd15('skip '+dt);
  B().advances++;
  return {ok:r?.ok!==false,advanced_s:dt,clock:r,next:packet()};
}

const priorFelt=window.REALITI_AGENT?.felt;
b7AgentCommandText=function(raw){
  const txt=String(raw||'').trim(),low=txt.toLowerCase();
  if(low==='moment'||low==='buffer'||low==='temporal')return packet();
  if(low==='moment advance'||low==='buffer advance')return momentAdvance();
  if(low.startsWith('decision hold'))return setDecision(true,txt.slice('decision hold'.length).trim());
  if(low==='decision clear'||low==='decision release')return setDecision(false);
  if(low.startsWith('realtime on'))return setRealtime(true,txt.slice('realtime on'.length).trim());
  if(low==='realtime off'||low==='realtime clear')return setRealtime(false);
  if(low==='felt'){
    const f=cmd15(txt);
    if(f&&typeof f==='object')f.moment_buffer=packet();
    return f;
  }
  const out=cmd15(txt);
  return out;
};

b7AgentState=function(){
  const s=state15();
  s.build=15;
  s.version='CONTACT_NERVE_MOMENT_BUFFER';
  s.patch=V151;
  s.moment_buffer={
    realtime:cp(B().realtime),
    decision:cp(B().decision),
    reads:B().reads,
    advances:B().advances,
    blocked_advances:B().blocked_advances
  };
  return s;
};

window.REALITI_AGENT={
  ...(window.REALITI_AGENT||{}),
  state:b7AgentState,
  felt:()=>b7AgentCommandText('felt'),
  moment:packet,
  momentAdvance,
  setDecision,
  setRealtime
};

if(window.REALITI_AGENT_DOOR){
  const help15=window.REALITI_AGENT_DOOR.help,run15=window.REALITI_AGENT_DOOR.run;
  window.REALITI_AGENT_DOOR.help=function(){
    const h=help15?help15():{commands:[]};
    h.commands=[...new Set([...(h.commands||[]),
      'moment','moment advance',
      'decision hold <reason>','decision clear',
      'realtime on <label>','realtime off',
      'v15.1 checkRemoved'
    ])];
    h.temporal_note='`felt` now includes a read-only rolling moment buffer. Future lanes never count as evidence.';
    return h;
  };
  window.REALITI_AGENT_DOOR.run=function(x){
    const low=String(x||'').trim().toLowerCase();
    if(low==='help')return window.REALITI_AGENT_DOOR.help();
    if(low==='moment'||low==='buffer'||low==='temporal'||low==='moment advance'||low==='buffer advance'||low.startsWith('decision ')||low.startsWith('realtime ')||low==='felt'||low==='v15.1 checkRemoved')return b7AgentCommandText(x);
    return run15(x);
  };
}

function resetFixture(saved){
  C9=cp(saved);
  C9.b151={version:'15.1',decision:null,realtime:null,packet_seq:0,reads:0,advances:0,blocked_advances:0,last:null};
  if(C9.b10)C9.b10.contact=null;
  if(C9.b8?.phase)C9.b8.phase.active=false;
}
void 0;

const oldCmd=b7AgentCommandText;
b7AgentCommandText=function(raw){
  const low=String(raw||'').trim().toLowerCase();
  if(low==='v15.1 checkRemoved')return window.B151_CHECKREMOVED();
  return oldCmd(raw);
};

document.title='REALITI // AGENT DOOR ONLY · BUILD 15.1 MOMENT BUFFER';
const brand=document.querySelector('.brand');
if(brand&&/BUILD 15/.test(brand.textContent||''))brand.textContent='REALITI // CLOUD9 · BUILD 15.1';
const sub=document.querySelector('#realiti_agent_only_shell .sub');
if(sub)sub.innerHTML='Ask the world what is true. Build 15.1 adds a rolling causal moment: past tail, current evidence, certified future structure, then a hard decision/realtime frontier.';
})();