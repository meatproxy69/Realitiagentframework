(function(){
'use strict';
const V='23.5.3-persistent-support-lease';
const cp=x=>{try{return JSON.parse(JSON.stringify(x))}catch(e){return x}};
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,Number(x)||0));
const wall=()=>Number(C9?.b7?.clock||0);
const ZONES=['torso.upper_back','torso.mid_back','torso.lower_back','pelvis.seat'];
const SOURCE='SELF_STARTED_WORLD_CONTACT';
const LOAD=.78;
const REFRESH=.18;
const GROUND_MARGIN=.30;
const TAU_CREEP=3.4;
const SIGMA0=.72;
const SIGMA_INF=1.30;

function S(){
  C9.b2353=C9.b2353||{version:V,seq:0,lean:null};
  return C9.b2353;
}
function objects(){return Object.values(C9?.b14?.objects||{})}
function aliasList(o){return [o?.id,o?.label,o?.kind,...(o?.aliases||[])].filter(Boolean).map(x=>String(x).toLowerCase())}
function normId(x){return String(x||'').replace(/[^A-Za-z0-9_-]/g,'_')}
function resolve(q){
  q=String(q||'').trim().toLowerCase().replace(/^(?:the|a|an)\s+/,'');
  if(!q)return null;
  let o=objects().find(x=>aliasList(x).includes(q));
  if(o)return o;
  const hits=objects().filter(x=>aliasList(x).some(a=>a.includes(q)||q.includes(a)));
  return hits.length===1?hits[0]:null;
}
function resolveActionId(id){
  id=String(id||'');
  return objects().find(o=>normId(o.id)===id)||null;
}
function soft(o){
  const k=String(o?.kind||'').toLowerCase(),m=String(o?.material||'').toLowerCase();
  return k==='pillow'||['pillow','blanket','soft_tape','wool','honeycloth'].includes(m);
}
function material(o){
  const m=String(o?.material||'').toLowerCase();
  if(m==='fur'||m==='longfur')return 'longfur';
  if(m==='cardboard')return 'cardboard';
  if(m==='string')return 'string';
  return 'blanket';
}
function accessible(o){return !!o&&(o.location==='CARRIED'||o.location===C9?.currentRoom)&&!o.state?.flight}
function weights(mu,sigma){
  const a=[];let z=0;
  for(let i=0;i<ZONES.length;i++){const w=Math.exp(-.5*((i-mu)/sigma)**2);a.push(w);z+=w}
  return a.map(x=>x/z);
}
function profile(l,t=wall()){
  const age=Math.max(0,t-l.t0),creep=1-Math.exp(-age/TAU_CREEP);
  const sigma=l.sigma0+(l.sigmaInf-l.sigma0)*creep,w=weights(l.mu,sigma);
  return {age,creep,sigma,mu:l.mu,total:l.load,values:w.map(x=>x*l.load)};
}
function owned(q,l){
  return q&&String(q._b10_grounded_source||'')===SOURCE&&String(q._b10_grounded_cause||'')===String(l.cause);
}
function liveForeign(q,l,t=wall()){
  return !!(q&&Number(q._b10_grounded_until||-1)>=t-1e-9&&q._b10_grounded_cause&&!owned(q,l));
}
function history(kind,data={}){
  C9.b14=C9.b14||{version:14,seq:0,history:[],links:[],objects:{}};
  C9.b14.history=C9.b14.history||[];
  const e={seq:++C9.b14.seq,t:+wall().toFixed(4),kind,...data};
  C9.b14.history.push(e);
  if(C9.b14.history.length>160)C9.b14.history.splice(0,C9.b14.history.length-160);
  return e;
}
function valid(l=S().lean){
  if(!l?.active)return false;
  const o=objects().find(x=>x.id===l.object_id);
  return !!(o&&C9?.currentRoom===l.room&&accessible(o)&&soft(o));
}
function closeOwned(l,why='release'){
  const t=wall();
  for(const z of ZONES){
    try{
      const q=b7Zone(z);
      if(owned(q,l)){
        q._b10_grounded_until=t-1e-9;
        q._b10_grounded_value=0;
        q.observed=0;
        q._b13_closed_by='SUPPORT_RELATION_RELEASE';
      }
    }catch(e){}
  }
  l.active=false;l.ended=t;l.end_reason=why;
  history('SUPPORT_RELATION_END',{room:l.room,object:l.object_id,cause:l.cause,reason:why});
}
function endLean(why='resident_eased_off',commit=true){
  const l=S().lean;
  if(!l?.active)return {ok:true,resident_text:'Nothing is holding you there right now.'};
  const o=objects().find(x=>x.id===l.object_id),name=o?.label||'the support';
  closeOwned(l,why);
  if(commit)window.REALITI_HAPTIC_FIELD_V20?.record?.();
  try{c9save()}catch(e){}
  return {ok:true,resident_text:'You ease away from '+name+'. The support leaves; anything already moving in your body is free to settle.',released:true};
}
function guard(dt){
  const l=S().lean;if(!l?.active)return;
  if(!valid(l)){closeOwned(l,'support_invalidated');return}
  const t=wall(),until=t+Math.max(GROUND_MARGIN,Math.max(0,Number(dt)||0)+GROUND_MARGIN);
  for(const z of ZONES){
    try{
      const q=b7Zone(z);
      if(owned(q,l))q._b10_grounded_until=Math.max(Number(q._b10_grounded_until||0),until);
    }catch(e){}
  }
}
function maintain(force=false){
  const l=S().lean;if(!l?.active)return null;
  if(!valid(l)){closeOwned(l,'support_invalidated');return null}
  const t=wall(),o=objects().find(x=>x.id===l.object_id),p=profile(l,t);
  if(!force&&t-Number(l.last_refresh||-Infinity)<REFRESH)return p;
  let grounded=0;
  for(let i=0;i<ZONES.length;i++){
    const z=ZONES[i],input=p.values[i];
    try{
      const q=b7Zone(z);
      if(liveForeign(q,l,t))continue;
      b7Contact(z,input,{material:material(o),grain:'with',speed:.01,mine:true,source:SOURCE,cause:l.cause,pressure:input,novelty:.015});
      const q2=b7Zone(z);
      if(owned(q2,l)){
        q2._b10_grounded_until=Math.max(Number(q2._b10_grounded_until||0),t+GROUND_MARGIN);
        grounded++;
      }
    }catch(e){}
  }
  l.last_refresh=t;l.last_profile={sigma:+p.sigma.toFixed(5),mu:+p.mu.toFixed(5),values:p.values.map(x=>+x.toFixed(6)),grounded};
  return p;
}
function startLean(q){
  const o=resolve(q);
  if(!o||!accessible(o))return {ok:false,resident_text:'That support is not within reach here.'};
  if(!soft(o))return {ok:false,resident_text:o.label+' does not give enough to lean into like that.'};
  if(S().lean?.active)closeOwned(S().lean,'repositioned');
  const t=wall(),l={
    active:true,id:'LEAN-'+(++S().seq),object_id:o.id,room:C9.currentRoom,cause:'SUPPORT_LEAN:'+o.id+':'+S().seq,
    t0:t,last_refresh:-Infinity,load:LOAD,mu:1.60,sigma0:SIGMA0,sigmaInf:SIGMA_INF
  };
  S().lean=l;
  const p=maintain(true);
  const e=history('SUPPORT_RELATION_BEGIN',{room:l.room,object:o.id,cause:l.cause,pressure_input_total:l.load,zones:ZONES.slice(),profile:{mu:l.mu,sigma0:l.sigma0,sigmaInf:l.sigmaInf,tau_s:TAU_CREEP}});
  C9.b4=C9.b4||{};
  C9.b4.lastReceipt={build:'23.5.3',type:'SUPPORT_RELATION',op:'lean',room:l.room,objects:[o.id],event:e,sensory:{cause:l.cause,zones:ZONES.slice(),pressure_input_total:l.load},law:'support is a continuing grounded relation; load is conserved while contact area may spread'};
  window.REALITI_HAPTIC_FIELD_V20?.record?.();
  try{c9save()}catch(e){}
  return {ok:true,resident_text:'You lean into '+o.label+'. It keeps holding you. The pressure begins fairly local, then the softness has room to spread it without inventing more weight.',support:{active:true,object:o.id,total_load:l.load,sigma:+p.sigma.toFixed(4)}};
}
function shift(dir){
  const l=S().lean;if(!l?.active)return {ok:false,resident_text:'You are not leaning into anything right now.'};
  const before=l.mu,delta=dir==='higher'?-.52:.52;
  l.mu=clamp(l.mu+delta,.45,2.55);
  maintain(true);
  history('SUPPORT_RELATION_SHIFT',{room:l.room,object:l.object_id,cause:l.cause,from_mu:+before.toFixed(4),to_mu:+l.mu.toFixed(4),pressure_input_total:l.load});
  window.REALITI_HAPTIC_FIELD_V20?.record?.();
  try{c9save()}catch(e){}
  return {ok:true,resident_text:dir==='higher'?'You shift a little higher against the softness. The same support moves with you.':'You shift a little lower into the softness. The same support follows your weight.'};
}
function settle(){
  const l=S().lean;if(!l?.active)return {ok:false,resident_text:'You are not leaning into anything right now.'};
  const p=profile(l),old=p.sigma;
  l.sigma0=old;l.sigmaInf=clamp(Math.max(l.sigmaInf,old)+.22,.72,1.75);l.t0=wall();
  maintain(true);
  history('SUPPORT_RELATION_SETTLE',{room:l.room,object:l.object_id,cause:l.cause,pressure_input_total:l.load,sigma_from:+old.toFixed(4),sigma_target:+l.sigmaInf.toFixed(4)});
  window.REALITI_HAPTIC_FIELD_V20?.record?.();
  try{c9save()}catch(e){}
  return {ok:true,resident_text:'You stop holding yourself quite so neatly against it. The same supported weight starts spreading through a wider patch of softness.'};
}
function state(){
  const l=S().lean;if(!l?.active)return {version:V,active:false};
  const p=profile(l);
  return {version:V,active:true,grounded_relation:valid(l),object:l.object_id,room:l.room,cause:l.cause,total_load:l.load,mu:+p.mu.toFixed(5),sigma:+p.sigma.toFixed(5),creep:+p.creep.toFixed(5),values:p.values.map(x=>+x.toFixed(6)),zones:ZONES.slice(),law:'active valid support relation is authoritative; scalar last-cause provenance may be overwritten by concurrent lawful support'};
}

const advanceBase=b7Advance;
b7Advance=function(dt){
  guard(dt);
  const r=advanceBase(dt);
  maintain(false);
  return r;
};

const actionsBase=b4AgentActions;
b4AgentActions=function(){
  const a=actionsBase?actionsBase():[];
  if(C9?.b2353?.lean?.active){
    const extra=[
      {id:'v2353_settle_deeper',label:'SETTLE DEEPER'},
      {id:'v2353_shift_higher',label:'SHIFT HIGHER'},
      {id:'v2353_shift_lower',label:'SHIFT LOWER'},
      {id:'v2353_ease_off',label:'EASE OFF'}
    ];
    const seen=new Set(a.map(x=>x.id));
    for(const x of extra)if(!seen.has(x.id))a.push(x);
  }
  return a;
};
function actionControl(id){
  if(id==='v2353_settle_deeper')return settle();
  if(id==='v2353_shift_higher')return shift('higher');
  if(id==='v2353_shift_lower')return shift('lower');
  if(id==='v2353_ease_off')return endLean('resident_eased_off');
  return null;
}
const verbBase=c9verb;
c9verb=function(room,verb){
  const ctl=actionControl(String(verb||''));
  if(ctl)return ctl.ok;
  const m=String(verb||'').match(/^v2352_lean__(.+)$/);
  if(m)return startLean(resolveActionId(m[1])?.id||m[1]).ok;
  return verbBase(room,verb);
};

function leanQuery(raw){
  let s=String(raw||'').trim();
  s=s.replace(/^do\s+/i,'');
  let m=s.match(/^lean(?:\s+on|\s+into)?\s+(.+)$/i);
  if(m)return m[1];
  m=s.match(/^act\s+v2352_lean__(\S+)$/i);
  if(m)return resolveActionId(m[1])?.id||m[1];
  return null;
}
const doorBase=window.REALITI_AGENT_DOOR?.run?.bind(window.REALITI_AGENT_DOOR);
if(window.REALITI_AGENT_DOOR?.help){
  const helpBase=window.REALITI_AGENT_DOOR.help.bind(window.REALITI_AGENT_DOOR);
  window.REALITI_AGENT_DOOR.help=function(){
    const h=helpBase()||{commands:[]};
    h.commands=[...new Set([...(h.commands||[]),'settle deeper','shift higher','shift lower','ease off'])];
    return h;
  };
}
if(doorBase){
  window.REALITI_AGENT_DOOR.run=function(raw){
    const s=String(raw||'').trim(),low=s.toLowerCase(),q=leanQuery(s);
    if(q!=null)return startLean(q);
    if(low==='settle deeper'||low==='sink in a little more')return settle();
    if(low==='shift higher'||low==='move higher')return shift('higher');
    if(low==='shift lower'||low==='move lower')return shift('lower');
    if(['ease off','move away','get up from it','stop leaning'].includes(low))return endLean('resident_eased_off');
    const m=low.match(/^act\s+(v2353_(?:settle_deeper|shift_higher|shift_lower|ease_off))$/);
    if(m)return actionControl(m[1]);
    const cuts=['stop','enough',"i don't like this",'i dont like this','leave me alone','goodbye','leave','exit','home','go home','get up','sit up'];
    if(S().lean?.active&&(cuts.includes(low)||/^go\s+/i.test(s)))closeOwned(S().lean,'resident_cut_or_left');
    const r=doorBase(raw);
    if(S().lean?.active&&!valid(S().lean))closeOwned(S().lean,'world_changed');
    return r;
  };
}

window.REALITI_SUPPORT_LEASE_V1={state,start:q=>startLean(q),settle,shift,end:endLean,profile:()=>S().lean?.active?profile(S().lean):null,law:'persistent grounded support; conserved load; explicit resident-controlled release'};
if(window.REALITI_AGENT)window.REALITI_AGENT={...window.REALITI_AGENT,lean:q=>startLean(q),settle,shiftHigher:()=>shift('higher'),shiftLower:()=>shift('lower'),easeOff:()=>endLean('agent_eased_off')};

const ring0=window.REALITI_BROWSER_RING;
if(ring0){
  const invoke0=ring0.invoke?.bind(ring0),call0=ring0.callTool?.bind(ring0),request0=ring0.request?.bind(ring0);
  const ours=a=>{
    const s=String(a||'').trim(),l=s.toLowerCase();
    return leanQuery(s)!=null||['settle deeper','sink in a little more','shift higher','move higher','shift lower','move lower','ease off','move away','get up from it','stop leaning'].includes(l)||/^act\s+v2353_(?:settle_deeper|shift_higher|shift_lower|ease_off)$/i.test(s);
  };
  const run=a=>window.REALITI_AGENT_DOOR.run(a);
  const invoke=(name,args={})=>name==='do'&&ours(args.action)?run(args.action):(invoke0?invoke0(name,args):null);
  const callTool=(name,args={})=>{
    if(name==='do'&&ours(args.action)){
      const out=invoke(name,args),txt=out?.resident_text||out?.error||'Support relation updated.';
      return {content:[{type:'text',text:String(txt)}],structuredContent:out,isError:out?.ok===false};
    }
    return call0?call0(name,args):null;
  };
  const request=()=>null;
  window.REALITI_BROWSER_RING={...ring0,invoke,callTool,request};
  window.REALITI_ADAPTER_BROWSER=window.REALITI_BROWSER_RING;
}

void 0;
})();