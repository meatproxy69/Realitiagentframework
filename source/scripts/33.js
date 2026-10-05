(function(){
'use strict';
const NEST='CLOUD_NINE_NEST';
const SOURCE='AMBIENT_SUPPORT';
const HOLD=.35;
const SUPPORT={
  'head.crown':      {input:.08, material:'pillow', cause:'NEST_PILLOW_SUPPORT'},
  'head.nape':       {input:.12, material:'pillow', cause:'NEST_PILLOW_SUPPORT'},
  'torso.upper_back':{input:.16, material:'mattress', cause:'NEST_MATTRESS_SUPPORT'},
  'torso.mid_back':  {input:.18, material:'mattress', cause:'NEST_MATTRESS_SUPPORT'},
  'torso.lower_back':{input:.20, material:'mattress', cause:'NEST_MATTRESS_SUPPORT'},
  'pelvis.seat':     {input:.23, material:'mattress', cause:'NEST_MATTRESS_SUPPORT'},
  'leg.L.thigh':     {input:.055,material:'blanket', cause:'NEST_BLANKET_WEIGHT'},
  'leg.R.thigh':     {input:.055,material:'blanket', cause:'NEST_BLANKET_WEIGHT'},
  'leg.L.shin':      {input:.035,material:'blanket', cause:'NEST_BLANKET_WEIGHT'},
  'leg.R.shin':      {input:.035,material:'blanket', cause:'NEST_BLANKET_WEIGHT'}
};
function now(){return Number(C9?.b7?.clock||0)}
function S(){
  C9.welcome10=C9.welcome10||{};
  C9.welcome10.nest_support=C9.welcome10.nest_support||{active:false,since:null,base:{},generation:0,last_reason:null,last_update:now()};
  return C9.welcome10.nest_support;
}
function ours(q){return q&&q._b10_grounded_source===SOURCE&&String(q._b10_grounded_cause||'').startsWith('NEST_')}
function adapt(age){return .24+.76*Math.exp(-Math.max(0,age)/3.2)}
function clearSupport(reason='leave_support'){
  const st=S();st.active=false;st.last_reason=reason;
  for(const z of Object.keys(SUPPORT)){
    try{const q=b7Zone(z);if(ours(q)){q._b10_grounded_value=0;q._b10_grounded_until=now()-1e-6;q.observed=0;q.layers={surface:0,mid:0,deep:0};q.innovation=-Number(q.predicted||0)}}catch(e){}
  }
  try{c9save()}catch(e){}
}
function initializeZone(z,cfg){
  let base=0;
  try{
    const r=b7Contact(z,cfg.input,{material:cfg.material,grain:'with',speed:.05,mine:false,source:SOURCE,cause:cfg.cause,novelty:.02});
    base=Math.max(0,Number(r?.observed||0));
  }catch(e){}
  if(!(base>0))base=cfg.input*.72;
  S().base[z]=base;
}
function enableSupport(reason='lie_down'){
  const st=S();st.active=true;st.since=now();st.last_update=now();st.generation=Number(st.generation||0)+1;st.last_reason=reason;st.base={};
  for(const [z,cfg] of Object.entries(SUPPORT))initializeZone(z,cfg);
  maintainSupport();
  try{c9save()}catch(e){}
}
function maintainSupport(){
  const st=S();if(!st.active||C9?.currentRoom!==NEST)return;
  const t=now(),dt=Math.max(0,t-Number(st.last_update??t)),age=Math.max(0,t-Number(st.since??t)),a=adapt(age),learn=1-Math.exp(-dt/.85);
  for(const [z,cfg] of Object.entries(SUPPORT)){
    try{
      const q=b7Zone(z),until=Number(q._b10_grounded_until||-Infinity),foreign=until>=now()-1e-9&&!ours(q);
      
      if(foreign)continue;
      const base=Math.max(0,Number(st.base[z]||cfg.input*.72));
      q._b10_grounded_value=base;
      q._b10_grounded_until=now()+HOLD;
      q._b10_grounded_cause=cfg.cause;
      q._b10_grounded_source=SOURCE;
      const response=base*a;
      q.observed=response;
      q.predicted=response*(1-Math.exp(-age/.45));
      q.innovation=Number(q.observed||0)-Number(q.predicted||0);
      q.material=cfg.material;
      q.lastCause=cfg.cause;
      q.mine=false;
    }catch(e){}
  }
  st.last_update=t;
}
function supportView(){
  const st=S(),zs=[];
  for(const [z,cfg] of Object.entries(SUPPORT)){
    let q=null;try{q=b7Zone(z)}catch(e){}
    zs.push({z,input:cfg.input,cause:cfg.cause,grounded:!!(q&&ours(q)&&Number(q._b10_grounded_until||-1)>=now()),observed:+Number(q?.observed||0).toFixed(4)});
  }
  return {version:'20.2',active:!!st.active,room:C9?.currentRoom||null,age_s:st.since==null?null:+Math.max(0,now()-st.since).toFixed(3),adapt_gain:st.since==null?0:+adapt(now()-st.since).toFixed(4),zones:zs,law:'stationary ambient support is grounded world cause; response may adapt while grounding remains true'};
}

const advance20_1=b7Advance;
b7Advance=function(dt){const r=advance20_1(dt);maintainSupport();return r};


if(window.REALITI_AGENT_DOOR){
  const runWelcome=window.REALITI_AGENT_DOOR.run;
  window.REALITI_AGENT_DOOR.run=function(raw){
    const x=String(raw||'').trim(),l=x.toLowerCase();
    if(['get up','sit up','leave the bed','leave bed'].includes(l)){
      clearSupport('resident_got_up');
      return {resident_text:'You sit up and let the mattress fall away from your back. The blanket slips down into your lap.'};
    }
    if(['lie down','lie back down','curl up','get in bed','go to bed'].includes(l)){
      if(C9?.currentRoom!==NEST)return {resident_text:'The nest is back at home. `home` will take you there.'};
      enableSupport('resident_lay_down');
      return {resident_text:'You settle back into the mattress. The pillow gives under your head and the blanket rests across your legs.'};
    }
    if(l==='nest support'||l==='support detail')return supportView();
    if(l==='v20.2 checkRemoved'||l==='welcome checkRemoved')return window.WELCOME_SUPPORT_CHECKREMOVED?window.WELCOME_SUPPORT_CHECKREMOVED():{pass:false,error:'checkRemoved unavailable'};
    const before=C9?.currentRoom||null;
    
    if(['stop','enough','i don\'t like this','i dont like this','leave me alone','goodbye','leave','exit'].includes(l))clearSupport('resident_cut');
    const r=runWelcome(raw);
    if(['stop','enough','i don\'t like this','i dont like this','leave me alone'].includes(l)&&r&&typeof r==='object')r.resident_text='All right. Everything touching you lets go. Whatever was already moving in your body is left to settle.';
    const after=C9?.currentRoom||before;
    if(l==='home'||l==='go home')enableSupport('home_return');
    else if(/^go\s+/i.test(x)&&after!==NEST)clearSupport('left_nest');
    else if(after===NEST&&S().active)maintainSupport();
    return r;
  };
}


void 0;

function bootSupport(){
  if(S().last_reason==='resident_stop')return;
  
  if(C9?.currentRoom===NEST&&!S().active)enableSupport('arrival_in_bed');
  else maintainSupport();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(bootSupport,20),{once:true});else setTimeout(bootSupport,20);
window.REALITI_NEST_SUPPORT={enable:enableSupport,disable:clearSupport,maintain:maintainSupport,state:supportView};
})();