(()=>{
'use strict';
// The resident body read is now V2. Historical opponent-process labels are
// retained as inert archive metadata only, never live emotion assignments.
const B=window.REALITI_BODY_FIELD_V2,A0=window.Realiti,D0=window.REALITI_AGENT_DOOR;
if(!B||!A0||!D0)throw Error('BODY_V2_PUBLIC_BRIDGE_MISSING');
const low=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
function read(uri='realiti://here'){
 if(uri==='realiti://body/possibility'||uri==='realiti://body.interoception')return B.state();
 if(uri==='realiti://body/history')return B.history();
 const r=A0.read(uri);
 if(uri==='realiti://capabilities'&&r&&typeof r==='object'){
  const x=JSON.parse(JSON.stringify(r));
  x.resources=[...new Set([...(x.resources||[]),'realiti://body/possibility','realiti://body/history','realiti://body.interoception'])];
  x.body_read='REALITI_BODY_POSSIBILITY_FIELD_V2';
  return x;
 }
 if(uri==='realiti://body'&&r&&typeof r==='object'){
  const x=JSON.parse(JSON.stringify(r));
  x.interoception=B.state();
  return x;
 }
 return r;
}
const run0=D0.run.bind(D0),help0=D0.help.bind(D0);
function help(){
 const h=help0()||{commands:[]};
 h.commands=[...new Set([...(h.commands||[]),'body','body log'])];
 h.body='body: a private, V20-derived possibility field. It reports exact grounding, uncertain response trajectories, and source history, never inferred emotion, preference or consent.';
 return h;
}
async function run(raw){
 const l=low(raw);
 if(l==='body'||l==='interoception'||l==='body state'){
  const st=B.state();
  return {ok:true,schema:'REALITI_BODY_RESULT_V2',result:st,text:B.words()};
 }
 if(l==='body log'){
  const st=B.history();
  return {ok:true,schema:'REALITI_BODY_SOURCE_LOG_RESULT_V2',result:st,
   text:st.sources.length?st.sources.length+' verified source events are recorded.':'No source events have been recorded.'};
 }
 if(l==='help')return help();
 const r=await run0(raw);
 if(r&&typeof r==='object'&&!r.text&&typeof r.result?.resident_text==='string')r.text=r.result.resident_text;
 return r;
}
D0.help=help;D0.run=run;
window.Realiti=Object.freeze({...A0,read,run,help:()=>{
 const h=A0.help();try{h.body=help().body}catch(e){}return h;
}});
})();