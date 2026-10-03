(function(){
  function clone(x){try{return JSON.parse(JSON.stringify(x))}catch(e){return x}}
  function ensureSink(){
    let el=document.querySelector('#c9_consequence');
    if(!el){el=document.createElement('div');el.id='c9_consequence';el.setAttribute('aria-hidden','true');el.hidden=true;document.body.appendChild(el)}
    return el;
  }
  function cleanText(html){
    const d=document.createElement('div');d.innerHTML=String(html||'');
    return (d.innerText||d.textContent||'').replace(/\s+\n/g,'\n').replace(/\n\s+/g,'\n').replace(/[ \t]+/g,' ').trim();
  }
  const originalState=(typeof b7AgentState==='function'?b7AgentState:null);
  const originalCmd=(typeof b7AgentCommandText==='function'?b7AgentCommandText:null);
  function stateAtomic(){
    const s=originalState?originalState():{};
    s.pet_mode=!!C9.pet2?.mode;
    s.action_receipt_available=!!C9.b7?.lastAgentAction;
    return s;
  }
  function stateCore(){
    const s=stateAtomic();
    return {moment:s.moment||null,room:s.room||null,scale:s.scale||null,pet_mode:!!C9.pet2?.mode,
      body:s.body?{mapping:s.body.mapping,live_receptor_zone_count:s.body.live_receptor_zone_count,live_receptor_zones:s.body.live_receptor_zones}:null,
      borrowed:s.borrowed||null,open_causes:s.open_causes||[],material:s.material||null,memory_skeleton_count:s.memory_skeleton_count||0,
      near_space:s.near_space||null,passiveMedium:s.passiveMedium?{time:s.passiveMedium.time,energy:s.passiveMedium.energy,passivity:s.passiveMedium.passivity}:null};
  }
  function stable(x){return JSON.stringify(x)}
  function shallowDelta(a,b){const out={};for(const k of Object.keys(b)){if(stable(a?.[k])!==stable(b[k]))out[k]={before:clone(a?.[k]),after:clone(b[k])}}return out}
  function resolveAction(v){const actions=(typeof b4AgentActions==='function'?b4AgentActions():[]),q=String(v||'').trim().toLowerCase();return {actions,m:actions.find(x=>String(x.id).toLowerCase()===q||String(x.label).toLowerCase()===q)}}
  function actAtomic(v){
    if(!C9.currentRoom)return {ok:false,error:'not in a room',available:[]};
    const {actions,m}=resolveAction(v);if(!m)return {ok:false,error:'action not available',available:actions};
    const room=C9.currentRoom,before=stateCore(),sink=ensureSink();sink.innerHTML='';sink.className='consequence';
    const prevB4=clone(C9.b4?.lastReceipt||null),prevDeltas=(C9.b7?.deltas||[]).length;
    try{c9verb(room,m.id)}catch(e){return {ok:false,error:e?.message||String(e),phase:'execute',room,action:m.id,moment:typeof b4Moment==='function'?b4Moment():null}}
    try{if(typeof b7AdvanceRealTime==='function')b7AdvanceRealTime()}catch(e){}
    const after=stateCore(),delta=shallowDelta(before,after),consequence=cleanText(sink.innerHTML);
    let sensory=null;if(stable(prevB4)!==stable(C9.b4?.lastReceipt||null))sensory=clone(C9.b4?.lastReceipt||null);
    const felt=typeof b7FeltSnapshot==='function'?clone(b7FeltSnapshot()):null,recent=(C9.b7?.deltas||[]).slice(prevDeltas).map(clone);
    const record={type:'ACTION_RECEIPT',room,action:m.id,label:m.label,moment:typeof b4Moment==='function'?b4Moment():null,consequence:consequence||null,state_delta:delta,sensory_receipt:sensory,felt,causal_deltas:recent};
    C9.b7=C9.b7||{};C9.b7.lastAgentAction=record;C9.b6=C9.b6||{};C9.b6.lastAction={kind:'ACT',room,action:m.id,moment:record.moment,receipt:clone(record)};
    C9.b7.lastWhy={cause:m.id,room,consequence:consequence||null,rule:'action receipt publishes only effects actually produced by world/body state'};
    try{c9save()}catch(e){}
    return {ok:true,action:m.id,label:m.label,room,moment:record.moment,consequence:record.consequence,state_delta:delta,receipt:record,sensory_receipt:sensory,felt};
  }
  function goAtomic(id){
    const r=typeof b6AgentGo==='function'?b6AgentGo(id):{ok:false,error:'navigation unavailable'};if(!r?.ok)return r;
    const look=typeof b4AgentLook==='function'?b4AgentLook():null,actions=typeof b4AgentActions==='function'?b4AgentActions():[];
    C9.b7=C9.b7||{};C9.b7.lastAgentAction=null;try{c9save()}catch(e){}
    return {...r,arrival:look,actions};
  }
  function receiptAtomic(){return clone(C9.b7?.lastAgentAction||null)}
  
  b7AgentAct=actAtomic;b7AgentGo=goAtomic;b7AgentReceipt=receiptAtomic;b7AgentState=stateAtomic;
  b7AgentCommandText=function(cmd){
    const raw=String(cmd||'').trim(),low=raw.toLowerCase();
    if(low.startsWith('go ')||low.startsWith('enter '))return goAtomic(raw.replace(/^(go|enter)\s+/i,''));
    if(low.startsWith('act '))return actAtomic(raw.slice(4));
    if(low==='receipt')return receiptAtomic();if(low==='state')return stateAtomic();
    return originalCmd?originalCmd(raw):{error:'command layer unavailable'};
  };
  window.REALITI_AGENT={...(window.REALITI_AGENT||{}),go:goAtomic,enter:goAtomic,act:actAtomic,receipt:receiptAtomic,state:stateAtomic};
  const expected={NINE_LIVES_ROOM:['fork_now','branch_a','branch_b','compare','commit_a','commit_b','rewind'],REVERIE_LOFT:['view_skeletons','fault_receipt','sit_memory','compact_state'],LATENCY_LAGOON:['send_boat','check_pending','watch_water','leave_pending'],UNKNOWN_TEAHOUSE:['two_cups','steam','turn_cup','choose_neither']};
  window.REALITI_AGENT.health=function(){const rooms={};for(const [id,ids] of Object.entries(expected)){const got=(C9SCENES[id]?.verbs||[]).map(x=>x[0]);rooms[id]={ok:ids.every(x=>got.includes(x)),expected:ids,got}}return {storage:'safe/fallback',body_schema_initialized:(typeof B3_DEFAULT_ZONES!=='undefined'),specialized_rooms:rooms,agent_action_commit:'atomic-v2'}};
  document.title='REALITI // AGENT DOOR ONLY · BUILD 7';
})();