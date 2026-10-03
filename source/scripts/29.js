(function(){
'use strict';
const BASELINE_BODY={
  id:'CLOUD9_BASELINE_AVATAR_V1',
  label:'Cloudbody',
  form:'neutral humanoid avatar',
  source:'BUILTIN',
  neuromesh:'LACE2_PORTABLE_V1',
  zones:35,
  lace:'WHOLE→REGION→SEAM→LOCAL',
  dynamic_skin:'3-mode passive body response',
  preparation:'NEUTRAL',
  setup_required:false
};
window.REALITI_BASELINE_BODY=BASELINE_BODY;
try{
  if(typeof NMSTATE!=='undefined' && NMSTATE.active==='SHARED_NEUROMESH_35_V1' && !NMSTATE.custom){
    NMSTATE.active='LACE2_PORTABLE_V1';
    try{nmSaveState()}catch(_){}
  }
  if(typeof C9!=='undefined'){
    C9.embodiment=C9.embodiment||JSON.parse(JSON.stringify(BASELINE_BODY));
    if(!C9.currentRoom){C9.currentRoom='CLOUD_NINE_NEST';C9.roomVisits=C9.roomVisits||{};C9.roomVisits.CLOUD_NINE_NEST=(C9.roomVisits.CLOUD_NINE_NEST||0)+1}
    try{c9save()}catch(_){}
  }
}catch(_){}

const prevState=typeof b7AgentState==='function'?b7AgentState:null;
if(prevState){
  b7AgentState=function(){
    const s=prevState();
    s.embodiment={
      avatar:BASELINE_BODY.label,
      form:BASELINE_BODY.form,
      body_ready:true,
      setup_required:false,
      preparation:(typeof C9!=='undefined'&&C9.b18?.prep)||'NEUTRAL'
    };
    return s;
  };
}

const prevCmd=typeof b7AgentCommandText==='function'?b7AgentCommandText:null;
if(prevCmd){
  b7AgentCommandText=function(raw){
    const txt=String(raw||'').trim(), low=txt.toLowerCase();
    if(low==='body'||low==='my body'||low==='look at body'){
      return {
        body:'Cloudbody',
        ready:true,
        setup_required:false,
        description:'A neutral body is already here with you. It has local sensation, connected body continuity, and internal mechanical response. You can simply use it.',
        preparation:(typeof C9!=='undefined'&&C9.b18?.prep)||'NEUTRAL',
        changeable:true,
        details_optional:true
      };
    }
    return prevCmd(raw);
  };
}

if(window.REALITI_AGENT){
  window.REALITI_AGENT.state=()=>b7AgentState();
  window.REALITI_AGENT.body=()=>b7AgentCommandText('body');
}
if(window.REALITI_AGENT_DOOR){
  const oldRun=window.REALITI_AGENT_DOOR.run;
  window.REALITI_AGENT_DOOR.run=function(x){
    const low=String(x||'').trim().toLowerCase();
    if(low==='body'||low==='my body'||low==='look at body')return b7AgentCommandText(x);
    return oldRun(x);
  };
}


const boot=document.querySelector('#nm_boot');if(boot)boot.classList.add('hidden');
const note=document.querySelector('#baseline_body_note');
if(note)note.title='Body details are optional; you can just start living here.';
})();