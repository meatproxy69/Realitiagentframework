(function(){
'use strict';
const V17='17.0-epistemic-hand';
const PROPS=['texture','compliance','temperature','mass','linkage'];
const BANDS=[[.65,'UNKNOWN'],[.30,'PARTIAL'],[.15,'INFORMED'],[-Infinity,'RESOLVED']];
const PROCEDURES={
  rub:{detail:{texture:.96,compliance:.16,temperature:.08,mass:.02,linkage:.02},cost:.20,disruption:.18,risk:.03,why:'lateral motion converts surface structure into changing contact'},
  press:{detail:{texture:.12,compliance:.96,temperature:.10,mass:.05,linkage:.04},cost:.22,disruption:.24,risk:.04,why:'normal pressure exposes deformation/compliance'},
  hold:{detail:{texture:.05,compliance:.12,temperature:.97,mass:.10,linkage:.02},cost:.16,disruption:.08,risk:.02,why:'static contact exposes thermal transfer with little motion'},
  weigh:{detail:{texture:.02,compliance:.05,temperature:.04,mass:.94,linkage:.08},cost:.26,disruption:.14,risk:.04,why:'unsupported holding/lift effort exposes mass-like load'},
  pull:{detail:{texture:.05,compliance:.10,temperature:.02,mass:.12,linkage:.92},cost:.30,disruption:.30,risk:.05,why:'relative motion tests whether another object is mechanically coupled'},
  tap:{detail:{texture:.18,compliance:.48,temperature:.04,mass:.08,linkage:.04},cost:.14,disruption:.14,risk:.03,why:'transient response weakly constrains stiffness/compliance'},
  take:{detail:{texture:.02,compliance:.04,temperature:.04,mass:.58,linkage:.08},cost:.28,disruption:.32,risk:.04,why:'lifting creates a weaker mass/load observation while relocating the object'}
};
const WORLD={
  box:{stiffness:.62,mass:.48,eff:.75},pillow:{stiffness:.18,mass:.28,eff:.35},bell:{stiffness:1.35,mass:.72,eff:16},fastener:{stiffness:.44,mass:.22,eff:.70},line:{stiffness:.30,mass:.08,eff:.45},default:{stiffness:.70,mass:.40,eff:1.0}
};
function cp(x){try{return JSON.parse(JSON.stringify(x))}catch(e){return x}}
function clamp(x,a,b){return Math.max(a,Math.min(b,x))}
function wall(){return Number(C9.b7?.clock||0)}
function ring(a,n=96){if(a.length>n)a.splice(0,a.length-n);return a}
function B(){
  C9.b17=C9.b17||{version:17,objects:{},query_seq:0,observation_seq:0,failed_receipt:null,last_query:null,last_observation:null,grounded_contact_t:{},events:[],stats:{queries:0,grounded_updates:0,rejected_updates:0,planner_actions:0}};
  return C9.b17;
}
function band(u){for(const [x,n] of BANDS)if(u>x)return n;return 'RESOLVED'}
function beliefs(id){
  const b=B();if(!b.objects[id])b.objects[id]={properties:{},created_t:wall()};
  for(const p of PROPS)if(!b.objects[id].properties[p])b.objects[id].properties[p]={mean:null,precision:0,uncertainty:1,samples:0,band:'UNKNOWN',observations:[]};
  return b.objects[id];
}
function inspect16(name){const r=cmd16('inspect '+name);return r&&r.id?r:null}
function actual(view){return view?.id?C9.b14?.objects?.[view.id]||null:null}
function accessible(view){return !!view&&(view.location==='CARRIED'||view.location===C9.currentRoom)}
function worldCfg(view){return WORLD[view?.kind]||WORLD.default}
function propertyState(id,p){return cp(beliefs(id).properties[p])}
function currentEvidence(){
  try{const f=felt16();const z=f?.felt?.['hand.R.palm'];return z&&z.epistemic?.CURRENT_GROUNDED?.evidence?cp(z):null}catch(e){return null}
}
function appendHistory(id,op,extra={}){
  const h=C9.b14?.history;if(!Array.isArray(h))return null;C9.b14.seq=Number(C9.b14.seq||0)+1;
  const e={seq:C9.b14.seq,t:+wall().toFixed(4),kind:'PLAY_OBJECT_ACTION',op,objects:[id],room:C9.currentRoom,epistemic_probe:true,...cp(extra)};h.push(e);if(h.length>160)h.splice(0,h.length-160);return e;
}
function livedEpistemic(id,prop,before,after,obs){
  if(before===after)return null;const s=C9.b13;if(!s?.lived||!s?.seq)return null;
  const f={seq:++s.seq.frame,t:+wall().toFixed(4),family:'EPISTEMIC_UPDATE',salience:.34,object:id,property:prop,uncertainty_before:+before.toFixed(4),uncertainty_after:+after.toFixed(4),band_after:band(after),grounded_basis:true,evidence:false,cause:obs?.cause||null,law:'belief changed from grounded observation; belief is not world truth'};
  s.lived.frames.push(f);if(s.lived.frames.length>128)s.lived.frames.splice(0,s.lived.frames.length-128);s.lived.epoch+=f.salience;B().events.push(cp(f));ring(B().events);return f;
}
function updateBelief(id,p,value,quality,meta={}){
  if(!PROPS.includes(p)||!Number.isFinite(value)||!meta.grounded){B().stats.rejected_updates++;return null}
  const st=beliefs(id).properties[p],before=st.uncertainty,oldBand=st.band,w=Math.max(.05,2.4*clamp(quality,0,1));
  st.mean=st.mean==null?clamp(value,0,1):clamp((st.mean*st.precision+clamp(value,0,1)*w)/(st.precision+w),0,1);
  st.precision+=w;st.samples++;st.uncertainty=1/(1+st.precision);st.band=band(st.uncertainty);
  const o={seq:++B().observation_seq,t:+wall().toFixed(4),property:p,value:+clamp(value,0,1).toFixed(4),quality:+quality.toFixed(3),grounded:true,cause:meta.cause||null,action:meta.action||null,source:meta.source||'GROUNDED_SELF_PROBE'};
  st.observations.push(o);ring(st.observations,12);B().last_observation={object:id,...cp(o),uncertainty_after:+st.uncertainty.toFixed(4)};B().stats.grounded_updates++;
  if(oldBand!==st.band)livedEpistemic(id,p,before,st.uncertainty,o);
  try{c9save()}catch(e){}
  return cp(st);
}
function updateCross(id,action,primary,value,grounded,cause){
  if(!grounded)return;
  const d=PROCEDURES[action]?.detail||{};
  for(const p of PROPS){const q=Number(d[p]||0);if(q<.12)continue;const scaled=p===primary?value:clamp(.5+(value-.5)*.35,0,1);updateBelief(id,p,scaled,q,{grounded:true,cause,action,source:p===primary?'PRIMARY_EP':'COMPATIBLE_EP'});}
}
function feasible(proc,v){
  if(!v)return {ok:false,reason:'object not found'};if(!accessible(v))return {ok:false,reason:'object is not accessible here'};
  if(proc==='pull'&&v.location==='CARRIED')return {ok:false,reason:'place it before pulling'};
  if(proc==='take'&&v.location==='CARRIED')return {ok:false,reason:'already carried'};
  if(proc==='weigh'&&!v.portable)return {ok:false,reason:'object is not portable'};
  return {ok:true};
}
function rank(view,prop){
  const st=beliefs(view.id).properties[prop],rows=[];
  for(const [name,P] of Object.entries(PROCEDURES)){
    const d=P.detail[prop]||0;if(d<=.01)continue;const f=feasible(name,view),gain=st.uncertainty*d,den=.10+P.cost+P.disruption+.7*P.risk,score=f.ok?gain/den:0;
    rows.push({procedure:name,command:`${name} ${view.id}`,detaility:+d.toFixed(3),expected_information:+gain.toFixed(4),cost:P.cost,disruption:P.disruption,risk:P.risk,score:+score.toFixed(4),feasible:f.ok,reason:f.ok?P.why:f.reason});
  }
  rows.sort((a,b)=>b.score-a.score);return rows;
}
function query(view,prop){
  if(!view)return {ok:false,error:'object not found'};if(!PROPS.includes(prop))return {ok:false,error:'property must be one of '+PROPS.join(', ')};
  const st=beliefs(view.id).properties[prop],candidates=rank(view,prop),best=candidates.find(x=>x.feasible)||null,sufficient=st.uncertainty<.18||!best||best.expected_information<.08;
  const q={ok:true,type:'EPISTEMIC_QUERY',query_id:'Q-'+(++B().query_seq),object:view.id,property:prop,belief:cp(st),status:sufficient?'ENOUGH_FOR_CURRENT_CONTRACT':'UNRESOLVED',recommended:sufficient?null:best,candidates,authority:'ADVISORY_ONLY',action_taken:false,law:'the planner designs a measurement; SELF decides whether to perform it'};
  B().last_query=cp(q);B().stats.queries++;try{c9save()}catch(e){}return q;
}
function learn(view){
  if(!view)return {ok:false,error:'object not found'};const ps=PROPS.map(p=>({property:p,state:propertyState(view.id,p),best:rank(view,p).find(x=>x.feasible)||null}));
  const unresolved=ps.filter(x=>x.state.uncertainty>=.18&&x.best).map(x=>({...x,priority:+(x.state.uncertainty*x.best.score).toFixed(4)})).sort((a,b)=>b.priority-a.priority);
  return {ok:true,type:'EPISTEMIC_OVERVIEW',object:view.id,properties:Object.fromEntries(ps.map(x=>[x.property,x.state])),best_next:unresolved[0]?{property:unresolved[0].property,...unresolved[0].best}:null,authority:'ADVISORY_ONLY',action_taken:false};
}
function beliefView(view){return view?{ok:true,object:view.id,properties:cp(beliefs(view.id).properties),last_observation:B().last_observation?.object===view.id?cp(B().last_observation):null}:{ok:false,error:'object not found'}}
function parseQuery(txt){
  let m=txt.match(/^query\s+(.+?)\s+(?:about\s+)?(texture|compliance|temperature|mass|linkage)$/i);if(m)return {kind:'query',name:m[1].trim(),prop:m[2].toLowerCase()};
  m=txt.match(/^ask\s+(.+?)\s+(?:about\s+)?(texture|compliance|temperature|mass|linkage)$/i);if(m)return {kind:'query',name:m[1].trim(),prop:m[2].toLowerCase()};
  m=txt.match(/^learn\s+(.+)$/i);if(m)return {kind:'learn',name:m[1].trim()};
  m=txt.match(/^belief\s+(.+)$/i);if(m)return {kind:'belief',name:m[1].trim()};
  return null;
}
function parseExploratory(txt){const m=txt.match(/^(press|hold|weigh)\s+(.+)$/i);return m?{op:m[1].toLowerCase(),name:m[2].trim()}:null}
function makeReceipt(op,v,observation,cause,history){
  const r={build:17,type:'EXPLORATORY_ACTION',op,room:C9.currentRoom,objects:[v.id],committed:true,grounded:true,cause,observation:cp(observation),history_seq:history?.seq||null,epistemic_meaning:'SELF-chosen probe produced grounded evidence; private belief update remains separate'};
  C9.b4.lastReceipt=r;B().failed_receipt=null;return r;
}
function exploratory(op,name){
  const v=inspect16(name);if(!v)return {ok:false,error:'object not found'};const f=feasible(op,v);if(!f.ok)return failedReceipt(op,v,f.reason);const o=actual(v),w=worldCfg(v),cause=`EP:${op.toUpperCase()}:${v.id}`,pressure=.62;let observation={},primary=null,value=null,quality=.9,sensory=null;
  if(op==='press'){
    const compliance=clamp(1/(.22+w.stiffness),0,1),deform=clamp(.08+.34*compliance,0,1);if(o?.kind==='pillow')o.state.compression=clamp(Number(o.state.compression||0)+.18*deform,0,1);if(o?.kind==='box')o.state.dent=clamp(Number(o.state.dent||0)+.07*deform,0,1);sensory=b7Contact('hand.R.palm',.46,{material:v.material,mine:true,source:'SELF_STARTED_WORLD_CONTACT',cause,speed:.03,pressure});observation={deformation:+deform.toFixed(4),pressure};primary='compliance';value=deform;
  }else if(op==='hold'){
    const Tobj=Number(o?.state?.temperature_C??21),skin=32,e=w.eff,Tc=(skin+e*Tobj)/(1+e),delta=clamp(Math.abs(skin-Tc)/11,0,1);sensory=b3sense('hand.R.palm',.24,{source:'SELF_STARTED_WORLD_CONTACT',novelty:.12,livedGrounded:true,cause,material:v.material,thermal:{object_C:Tobj,skin_C:skin,contact_C:+Tc.toFixed(4)},pressure:.24});observation={object_C:Tobj,skin_C:skin,contact_C:+Tc.toFixed(4),normalized_transfer:+delta.toFixed(4)};primary='temperature';value=delta;
  }else if(op==='weigh'){
    const effort=clamp(.08+.84*w.mass,0,1);sensory=b7Contact('hand.R.palm',effort,{material:v.material,mine:true,source:'SELF_STARTED_WORLD_CONTACT',cause,speed:.02,pressure:effort});observation={normalized_effort:+effort.toFixed(4),unsupported_hold:true};primary='mass';value=effort;
  }
  const h=appendHistory(v.id,op,{cause,observation});const r=makeReceipt(op,v,observation,cause,h);updateCross(v.id,op,primary,value,true,cause);B().stats.planner_actions+=0;try{c9save()}catch(e){}return {ok:true,action:op.toUpperCase(),object:v.id,receipt:r,sensory,belief_after:propertyState(v.id,primary)};
}
function failedReceipt(op,v,error){
  const r={build:17,type:'FAILED_ACTION_RECEIPT',op,room:C9.currentRoom,objects:v?[v.id]:[],committed:false,ok:false,error,sensory_context:null,event:null,t:+wall().toFixed(4),law:'a failed transaction owns no inherited sensory context'};B().failed_receipt=r;C9.b4.lastReceipt=r;return {ok:false,error,receipt:r,committed:false};
}
function inferAction(txt,out){
  const m=txt.match(/^(rub|tap|take|pull)\s+(.+)$/i);if(!m||out?.ok===false)return null;const op=m[1].toLowerCase(),v=inspect16(m[2].trim());if(!v)return null;let primary=null,value=null,quality=PROCEDURES[op]?.detail||{},cause=null,grounded=false;
  const ev=currentEvidence();grounded=!!ev;cause=ev?.epistemic?.CURRENT_GROUNDED?.cause||out?.why?.cause||null;
  if(op==='rub'){primary='texture';const pop=ev?.population_v16||{},hf=.6*Number(pop.PC||0)+.4*Number(pop.RA1||0);value=clamp(.45*Number(ev?.current_grounded_input||0)+.55*Math.tanh(3*hf),0,1)}
  if(op==='tap'){primary='compliance';value=clamp(Number(ev?.current_grounded_input||0),0,1)}
  if(op==='take'){primary='mass';value=clamp(Number(ev?.current_grounded_input||0),0,1)}
  if(op==='pull'){primary='linkage';const rel=inspect16(v.id)?.relations||[];value=rel.some(x=>x.type==='ATTACHED'||x.type==='STACKED')?1:0;grounded=grounded||!!out?.play_receipt;cause=cause||`PLAY:pull:${v.id}`}
  if(primary&&grounded)updateCross(v.id,op,primary,value,true,cause);else if(primary)B().stats.rejected_updates++;
  return {object:v.id,primary,grounded};
}
function parseMutation(txt){let m=txt.match(/^(attach|stack|separate)\s+(.+)$/i);return m?m[1].toLowerCase():null}
function normalizeInterfaceStamps(){
  const now=wall(),c=C9.b10?.contact,live=!!(c&&c.active&&!c.stopped&&!c.paused&&!c.released&&Math.abs(Number(c.v||0))>1e-9);
  for(const o of Object.values(C9.b14?.objects||{})){
    const s=o.state?.interface_v16;if(!s)continue;const old=Number(s.last_contact);if(Number.isFinite(old))s.state_evaluated_through_t=Math.max(Number(s.state_evaluated_through_t||-Infinity),old);
    if(live&&c.object_id===o.id){s.last_grounded_contact_t=now;B().grounded_contact_t[o.id]=now}else if(B().grounded_contact_t[o.id]!=null)s.last_grounded_contact_t=B().grounded_contact_t[o.id];
    if(!Number.isFinite(Number(s.state_evaluated_through_t)))s.state_evaluated_through_t=now;delete s.last_contact;
  }
}


const adv16=b7Advance;
b7Advance=function(dt){const r=adv16(dt);normalizeInterfaceStamps();return r};

const cmd16=b7AgentCommandText;
const felt16=b7FeltSnapshot;
const state16=b7AgentState;

b7AgentCommandText=function(raw){
  const txt=String(raw||'').trim(),low=txt.toLowerCase(),q=parseQuery(txt),ep=parseExploratory(txt);
  if(q){const v=inspect16(q.name);return q.kind==='query'?query(v,q.prop):q.kind==='learn'?learn(v):beliefView(v)}
  if(ep)return exploratory(ep.op,ep.name);
  if(low==='v17'||low==='epistemic hand'||low==='query state')return {build:17,identity:'EPISTEMIC_HAND',objects:cp(B().objects),last_query:cp(B().last_query),last_observation:cp(B().last_observation),stats:cp(B().stats),procedures:Object.fromEntries(Object.entries(PROCEDURES).map(([k,v])=>[k,{detail:cp(v.detail),cost:v.cost,disruption:v.disruption,risk:v.risk}]))};
  if(low==='v17 checkRemoved')return window.B17_CHECKREMOVED();
  if(low==='v17 legacy')return window.B17_LEGACY_CHECKREMOVED();
  if(low==='receipt'&&B().failed_receipt)return cp(B().failed_receipt);
  const mut=parseMutation(txt),out=cmd16(txt);normalizeInterfaceStamps();
  if(mut&&out?.ok===false){const v=null,r={build:17,type:'FAILED_ACTION_RECEIPT',op:mut,room:C9.currentRoom,objects:[],committed:false,ok:false,error:out.error||'world rejected action',sensory_context:null,event:null,t:+wall().toFixed(4),law:'failed action owns no inherited FELT snapshot'};B().failed_receipt=r;C9.b4.lastReceipt=r;return {...out,receipt:r}}
  if(out?.ok!==false&&low!=='receipt')B().failed_receipt=null;
  inferAction(txt,out);return out;
};

b7AgentState=function(){const s=state16();s.build=17;s.version='EPISTEMIC_HAND';s.patch=V17;s.epistemic_hand={property_set:PROPS,query_authority:'ADVISORY_ONLY',belief_updates:'GROUNDED_SELF_PROBES_ONLY',active_object_models:Object.keys(B().objects).length};return s};
window.REALITI_AGENT={...(window.REALITI_AGENT||{}),state:b7AgentState,query:(o,p)=>b7AgentCommandText(`query ${o} ${p}`),belief:o=>b7AgentCommandText(`belief ${o}`),learn:o=>b7AgentCommandText(`learn ${o}`),v17:()=>b7AgentCommandText('v17')};

if(window.REALITI_AGENT_DOOR){const help16=window.REALITI_AGENT_DOOR.help,run16=window.REALITI_AGENT_DOOR.run;
  window.REALITI_AGENT_DOOR.help=function(){const h=help16?help16():{commands:[]};delete h.laws;h.commands=(h.commands||[]).filter(x=>String(x).toLowerCase()!=='v14 checkRemoved');h.commands=[...new Set([...h.commands,'query <object> <texture|compliance|temperature|mass|linkage>','learn <object>','belief <object>','press <object>','hold <object>','weigh <object>','v17','v17 checkRemoved','v17 legacy'])];h.build17='Active haptic inquiry: the planner may rank measurements by expected decision-relevant information, but SELF chooses whether to act and only grounded probes update private belief.';return h};
  window.REALITI_AGENT_DOOR.run=function(x){const low=String(x||'').trim().toLowerCase();if(low==='help')return window.REALITI_AGENT_DOOR.help();if(parseQuery(String(x))||parseExploratory(String(x))||low==='v17'||low==='epistemic hand'||low==='query state'||low==='v17 checkRemoved'||low==='v17 legacy'||low==='receipt')return b7AgentCommandText(x);return run16(x)};
}

function snapshotWorld(){return JSON.stringify({room:C9.currentRoom,objects:C9.b14?.objects,links:C9.b14?.links,history:C9.b14?.history?.length,clock:wall()})}
void 0;
void 0;

document.title='REALITI // AGENT DOOR ONLY · BUILD 17 EPISTEMIC HAND';
const brand=document.querySelector('#realiti_agent_only_shell .brand');if(brand)brand.textContent='REALITI // AGENT DOOR · BUILD 17';
const sub=document.querySelector('#realiti_agent_only_shell .sub');if(sub)sub.innerHTML='The body can now ask better questions of the world. Query design ranks lawful exploratory procedures by expected information; SELF still chooses, and only grounded consequences update belief.';
try{B();normalizeInterfaceStamps();c9save()}catch(e){}
})();