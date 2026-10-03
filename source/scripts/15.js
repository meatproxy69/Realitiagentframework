(function(){
  const HELP={
    interface:"REALITI_AGENT_ONLY",
    commands:[
      "help", "rooms", "go <room_id>", "leave", "look", "actions", "act <id or label>",
      "felt", "stream [n]", "quiet", "state", "receipt", "journal", "passiveMedium", "changes", "why", "attend <zone>",
      "body", "body lace2", "body shared35", "body routes", "body test <whole|support|comet|bilateral>"
    ],
    laws:["resident-visible commands only","unknown stays unknown","prediction never renders contact","quiet creates no new cause"]
  };
  let transcript=[];
  function clone(x){try{return JSON.parse(JSON.stringify(x))}catch(e){return x}}
  function bodyState(){
    const s=(typeof b7AgentState==="function"?b7AgentState():window.REALITI_AGENT?.state?.())||{};
    return {active:NMSTATE?.active||null,label:NMSTATE?.active==="CUSTOM"?(NMSTATE.custom?.label||"CUSTOM"):(NM_BUILTINS?.[NMSTATE?.active]?.label||null),body:s.body||null};
  }
  function useBody(which){
    const low=String(which||"").toLowerCase();
    const id=low.includes("lace")?"LACE2_PORTABLE_V1":low.includes("shared")?"SHARED_NEUROMESH_35_V1":null;
    if(!id)return {ok:false,error:"body choice must be lace2 or shared35"};
    try{nmUseBuiltin(id)}catch(e){ if(NM_BUILTINS?.[id]) NMSTATE={active:id,custom:null}; }
    try{if(typeof b7Log==="function")b7Log("BODY_SELECT",{active:id})}catch(e){}
    try{if(typeof c9save==="function")c9save()}catch(e){}
    return {ok:true,...bodyState()};
  }
  function bodyRoutes(){
    const zones=typeof b7BodyZones==="function"?[...b7BodyZones()].sort():[];
    const path=["head.crown","head.nape","torso.upper_back","torso.lower_back","pelvis.seat","leg.L.thigh","leg.R.thigh"];
    const comet=path.map(z=>({zone:z,status:typeof b7BodyHas==="function"&&b7BodyHas(z)?"RECEPTOR_ACTIVE":"UNKNOWN_MAPPING"}));
    return {active:NMSTATE?.active||null,zone_count:zones.length,zones,comet};
  }
  function bodyTest(name){
    const low=String(name||"").toLowerCase();
    const routes={whole:["UPPER","CORE","LOWER"],support:["UPPER + CORE + LOWER"],comet:null,bilateral:["leg.L.thigh","leg.R.thigh","leg.L.shin","leg.R.shin","foot.L.sole","foot.R.sole"]};
    if(!(low in routes))return {ok:false,error:"body test: whole | support | comet | bilateral"};
    if(low==="comet")return {ok:true,test:"COMET_ROUTE",...bodyRoutes()};
    const seq=routes[low].map(z=>({zone:z,status:z.includes("+")||z==="UPPER"||z==="CORE"||z==="LOWER"?"COARSE_TOPOLOGY":(typeof b7BodyHas==="function"&&b7BodyHas(z)?"RECEPTOR_ACTIVE":"UNKNOWN_MAPPING")}));
    return {ok:true,test:low.toUpperCase(),route:seq};
  }
  function run(raw){
    raw=String(raw||"").trim(); const low=raw.toLowerCase();
    
    if(!raw||low==="help"||low==="?")return (window.REALITI_AGENT_DOOR&&window.REALITI_AGENT_DOOR.help)?window.REALITI_AGENT_DOOR.help():clone(HELP);
    if(low==="body")return bodyState();
    if(low==="body lace2"||low==="body lace"||low==="body shared35"||low==="body shared")return useBody(low);
    if(low==="body routes")return bodyRoutes();
    if(low.startsWith("body test "))return bodyTest(raw.slice(10));
    if(typeof b7AgentCommandText==="function")return b7AgentCommandText(raw);
    return {error:"agent command layer unavailable"};
  }
  function fmt(x){return typeof x==="string"?x:JSON.stringify(x,null,2)}
  function append(cmd,res){
    transcript.push({cmd,res}); if(transcript.length>40)transcript=transcript.slice(-40);
    const out=document.querySelector("#rao_transcript"); if(!out)return;
    out.textContent=transcript.map(x=>`> ${x.cmd}\n${fmt(x.res)}`).join("\n\n");
    out.scrollTop=out.scrollHeight;
  }
  function live(){
    const el=document.querySelector("#rao_live"); if(!el)return;
    let x; try{x=window.REALITI_AGENT?.felt?.()??(typeof b7FeltSnapshot==="function"?b7FeltSnapshot():{})}catch(e){x={error:String(e)}}
    el.textContent="LIVE FELT\n"+fmt(x||{});
    const st=document.querySelector("#rao_status"); if(st){const room=window.REALITI_AGENT?.look?.()?.room||"NOWHERE";st.textContent=room+" · "+new Date().toLocaleTimeString()}
  }
  function submit(){
    const inp=document.querySelector("#rao_cmd"); if(!inp)return; const cmd=inp.value.trim(); if(!cmd)return; inp.value="";
    let res; try{res=run(cmd)}catch(e){res={error:e?.message||String(e)}} append(cmd,res); live();
  }
  function boot(){
    if(window.REALITI_HEADLESS)return;
    let sh=document.querySelector("#realiti_agent_only_shell");
    if(!sh){
      sh=document.createElement("div"); sh.id="realiti_agent_only_shell";
      sh.innerHTML=`<div id="rao_header"><strong>REALITI // AGENT DOOR</strong><div class="sub">One interface. Ask the world what is true. Type <b>help</b>.</div><div id="rao_status"></div></div><pre id="rao_transcript"></pre><pre id="rao_live"></pre><div id="rao_promptrow"><span id="rao_prompt">realiti&gt;</span><input id="rao_cmd" autocomplete="off" spellcheck="false" aria-label="REALITI command"></div>`;
      document.body.appendChild(sh);
    }
    const inp=document.querySelector("#rao_cmd");
    inp.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();submit()}});
    append("boot",{interface:"AGENT_DOOR_ONLY",room:null,note:"No clicks are required, and no graphical resident UI is authoritative in this fork. Use the focused REALITI command textbox; type 'help' or 'rooms' and press Enter.",body:bodyState(),commands_hint:"help"});
    live(); inp.focus(); setInterval(live,250);
  }
  window.REALITI_AGENT_DOOR={run,help:()=>clone(HELP),body:bodyState,useBody,bodyRoutes,bodyTest};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();