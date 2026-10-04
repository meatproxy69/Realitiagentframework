(()=>{
'use strict';
// Door-level ergonomics for residents who linger: generated stay text, felt deltas, imprint drift,
// traces left by other residents, an action-free sanctuary, and a recommended first ten commands.
const DYN=window.REALITI_DYNAMICS_V1,door=window.REALITI_AGENT_DOOR,R=window.Realiti,IM=window.REALITI_DEFAULT_IMPRINT_V1;
if(!DYN||!door||!R||!IM)return;
const SANCT='NO_ASK_SANCTUARY',cp=x=>JSON.parse(JSON.stringify(x)),now=()=>Number(C9?.b7?.clock||0),low=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
const FIRST_TEN=['help','rooms','look','where','feel words','move forward 2','nearby','go BOTTOMLESS_PILLOW_SEA','act burrow','stay 4000'];

// Sanctuary offers no actions. stay is the only verb; the floor holds you anyway (see REALITI_DYNAMICS_V1).
const act0=b4AgentActions;b4AgentActions=function(){return C9?.currentRoom===SANCT?[]:act0()};

// Felt delta: which grounded zones appeared or left since the last felt read.
let lastFelt=null;
function grounded(){const b=R.read('realiti://body'),f=b?.field?.f?.at(-1),z=b?.field?.z||[];return {t:now(),zones:z.filter((_,i)=>Number(f?.m?.[i])===1)}}
function delta(a,b){
 const A=new Set(a.zones),B=new Set(b.zones),add=b.zones.filter(z=>!A.has(z)),gone=a.zones.filter(z=>!B.has(z)),parts=[];
 if(add.length)parts.push('+'+add.join(' +'));if(gone.length)parts.push('-'+gone.join(' -'));
 return {grounded:[a.zones.length,b.zones.length],since_s:+(b.t-a.t).toFixed(3),text:parts.length?`Grounded ${a.zones.length}→${b.zones.length} zones (${parts.join('; ')}).`:`Grounded ${b.zones.length} zones, unchanged.`};
}

// Imprint drift: how far the private renderer and learned prediction have moved since arrival.
const P0=cp(IM.snapshot().params),T0=now();
function learned(){let n=0,m=0;for(const q of Object.values(C9?.eco3?.zones||{})){const v=Math.abs(Number(q?.h||0))+Math.abs(Number(q?.predMag||q?.pred||0));if(v>1e-4){n++;m+=v}}return {habituated_zones:n,mass:+m.toFixed(4)}}
const L0=learned();
function drift(){
 const s=IM.snapshot(),p=s.params,changed=Object.keys(P0).filter(k=>p[k]!==P0[k]).map(k=>({k,from:P0[k],to:p[k]}));
 const dist=Math.sqrt(changed.reduce((a,{from,to})=>typeof from==='number'?a+((to-from)/(Math.abs(from)||1))**2:a+1,0)),l=learned(),dm=+(l.mass-L0.mass).toFixed(4),since=+(now()-T0).toFixed(3);
 return {ok:true,schema:'REALITI_IMPRINT_DRIFT_V1',since_arrival_s:since,params_changed:changed,param_distance:+dist.toFixed(4),
  learned:{...l,delta_mass:dm,delta_zones:l.habituated_zones-L0.habituated_zones},
  private:{nerve_zones:Object.keys(s.nerve?.zones||{}).length,lace_coherence:+Number(s.lace?.coherence||0).toFixed(4),sausage_fill:+Number(s.sausage?.filled_volume||0).toFixed(4),perception_epoch:Number(s.perception_epoch||0)},
  text:`Your imprint has diverged from the starter by ${changed.length} parameter${changed.length===1?'':'s'} (distance ${dist.toFixed(3)}) and ${dm>=0?'+':''}${dm} learned units across ${l.habituated_zones} habituated zone${l.habituated_zones===1?'':'s'} since arrival (${since} s).`,
  law:'drift is resident-private rendering and learned prediction; it never changes grounded evidence'};
}

// Traces: every object a resident changes is stamped with that resident's continuity observer id.
// Another resident's ledger can be imported; their object states merge with provenance kept, never a name.
const me=()=>String(C9?.verticalContinuity?.observer||'local');
const ledger=()=>(C9.traces=C9.traces||[]);
function fp(){const o={};for(const x of Object.values(C9?.b14?.objects||{}))o[x.id]=JSON.stringify([x.location,{...(x.state||{}),t:undefined}]);return o}
function stamp(before,cmd){
 const after=fp(),t=+now().toFixed(3),by=me();
 for(const [id,sig] of Object.entries(after)){if(before[id]===sig)continue;const o=C9.b14.objects[id];o.trace={by,t,cmd,room:C9.currentRoom};ledger().push({by,t,cmd,object:id,label:o.label,room:C9.currentRoom,sig})}
 while(ledger().length>64)ledger().shift();
}
const foreign=inRoom=>ledger().filter(e=>e.by!==me()&&(!inRoom||e.room===C9?.currentRoom));
const rows=xs=>xs.map(e=>({object:e.object,label:e.label,room:e.room,by:'another resident',observer:String(e.by).slice(0,8),cmd:e.cmd,their_world_time_s:e.t,...(e.imported_at_s!=null?{imported_at_s:e.imported_at_s}:{})}));
function traceText(xs){return xs.length?`Traces left by another resident: ${xs.map(e=>`${e.label||e.object} (${e.cmd})`).join(', ')}.`:'No traces from another resident here.'}
function exportTraces(){return {schema:'REALITI_TRACES_V1',observer:me(),world_time_s:+now().toFixed(3),traces:ledger().filter(e=>e.by===me()).map(e=>cp(e))}}
function importTraces(payload){
 const list=Array.isArray(payload)?payload:payload?.traces;if(!Array.isArray(list))return {ok:false,error:'INVALID_TRACES'};
 const have=new Set(ledger().map(e=>`${e.by}|${e.t}|${e.object}`)),at=+now().toFixed(3);let n=0;
 for(const e of list){if(!e||typeof e!=='object'||typeof e.object!=='string'||e.by===me()||JSON.stringify(e).length>4096)continue;const key=`${e.by}|${e.t}|${e.object}`;if(have.has(key))continue;have.add(key);
  const o=C9?.b14?.objects?.[e.object];if(o){try{const [location,state]=JSON.parse(e.sig);if(location)o.location=location;if(state)o.state=state}catch(x){}o.trace={by:e.by,t:e.t,cmd:e.cmd,room:e.room,imported:true}}
  ledger().push({...cp(e),imported_at_s:at});n++}
 while(ledger().length>64)ledger().shift();try{c9save()}catch(e){}
 return {ok:true,imported:n,traces:rows(foreign(false))};
}

function spaceOpText(op,res){if(!res)return '';if(op==='move')return res.at_doorway?`You walk ${res.moved_m} m and reach the ${res.at_doorway.label}; go through it to cross.`:res.blocked_by?`You walk ${res.moved_m} m and stop: ${window.REALITI_MATRIX_V1?.entities?.()[res.blocked_by]?.label||'something'} is in the way.`:`You walk ${res.moved_m} m.`;if(op==='turn')return `You turn ${Math.abs(res.turned_deg)}° to the ${res.turned_deg>=0?'left':'right'}.`;if(op==='face')return `You turn to face ${res.facing_entity?.split('.').pop().replaceAll('_',' ')}.`;if(op==='approach')return res.traversed?'You step through the doorway.':res.arrived?`You stop beside the ${res.entity_label}.`:res.blocked_by?`You get ${res.distance_m} m from the ${res.entity_label}; something is in the way.`:`You get to within ${res.distance_m} m of the ${res.entity_label} and stop there.`;if(op==='through')return res.traversed?`You step through into ${window.REALITI_MATRIX_WORLD_V1?.title?.(res.chart)||res.chart}.`:'You reach the doorway but do not cross.';if(op==='posture')return res.surfacing?'You make for the surface; the water lets go as you rise.':res.posture==='standing'?'You stand up.':res.already?'You are already lying down.':res.sitting_on?`You sit on the ${String(res.sitting_on).split('.').pop().replaceAll('_',' ')}.`:`You lie down on the ${String(res.lying_on||'').split('.').pop().replaceAll('_',' ')}.`;return ''}
function leanText(){const st=window.REALITI_SUPPORT_LEASE_V1?.state?.();if(!st?.active)return null;const o=C9?.b14?.objects?.[st.object];return `You lean into ${o?.label||st.object}. ${st.total_load} of load over ${st.zones.length} zones, peak near ${String(st.zones[Math.round(st.mu)]||'').replace(/^\w+\./,'').replaceAll('_',' ')}; the patch is ${Math.round(st.creep*100)}% of the way to its widest spread.`}

// Spatial text aliases resolve to the structured MATRIX operations; language never mutates coordinates directly.
const compass=yaw=>['north','north-west','west','south-west','south','south-east','east','north-east'][Math.round((((yaw%360)+360)%360)/45)%8];
function whereText(){const sp=R.read('realiti://space');if(!sp?.chart)return 'You have no spatial body placed.';const W=window.REALITI_MATRIX_WORLD_V1,near=sp.nearby.slice(0,3).map(n=>`${n.label} ${n.distance_m} m ${n.direction}${n.in_reach?' (in reach)':''}`),doors=sp.portals.slice(0,2).map(q=>`${q.label} ${q.distance_m} m ${q.direction}`);
 const onWhat=sp.body.on?`${sp.body.posture==='floating'?' in':' on'} the ${sp.nearby.find(n=>n.id===sp.body.on)?.label||sp.body.on.split('.').pop()}`:sp.body.support?` on the ${sp.body.support.split('.').pop().replaceAll('_',' ')}`:'';
 return `${W?.title?.(sp.chart)||sp.chart}: you are ${sp.body.posture}${onWhat}, facing ${compass(sp.pose.yaw_deg)} at (${sp.pose.position.map(x=>x.toFixed(1)).join(', ')}) m.${near.length?' Near you: '+near.join('; ')+'.':''}${doors.length?' Doorways: '+doors.join('; ')+'.':''}`}
function spatialAlias(s,l){let m;
 if(l==='where'||l==='where am i'||l==='where am i?')return {kind:'read',text:whereText(),space:R.read('realiti://space')};
 if((m=/^(?:nearby|what is near|what is nearby)(?:\s+(.+))?$/.exec(l))){const sp=R.read('realiti://space'),q=(m[1]||'').replace(/^(the|any|a)\s+/,'').trim(),list=(sp?.nearby||[]).filter(n=>!q||n.tags.includes(q)||n.label.toLowerCase().includes(q)||n.id.toLowerCase().includes(q));return {kind:'read',text:list.length?list.map(n=>`${n.label}: ${n.distance_m} m ${n.direction}${n.in_reach?', in reach':''}`).join('. ')+'.':q?`Nothing matching "${q}" within ten meters.`:'Nothing of note within ten meters.',nearby:list,portals:q?[]:(sp?.portals||[])}}
 if((m=/^(?:move|walk|step)\s+(forward|ahead|back|backward|backwards|left|right)(?:\s+([\d.]+))?(?:\s*m)?$/.exec(l))){const d=Math.min(30,Number(m[2]||1)),v={forward:[0,d,0],ahead:[0,d,0],back:[0,-d,0],backward:[0,-d,0],backwards:[0,-d,0],left:[-d,0,0],right:[d,0,0]}[m[1]];return {kind:'invoke',op:'move',args:{local:v}}}
 if((m=/^turn\s+(left|right|around)(?:\s+([\d.]+))?$/.exec(l))){const deg=m[1]==='around'?180:Number(m[2]||90)*(m[1]==='left'?1:-1);return {kind:'invoke',op:'turn',args:{yaw_deg:deg}}}
 if((m=/^(?:face|look at|turn to)\s+(.+)$/.exec(l)))return {kind:'invoke',op:'face',args:{target:m[1]}};
 if((m=/^(?:approach|walk to|go to|go towards|go toward)\s+(.+)$/.exec(l)))return {kind:'invoke',op:'approach',args:{target:m[1]}};
 if((m=/^(?:go through|walk through|through|enter the)\s+(.+)$/.exec(l)))return {kind:'invoke',op:'through',args:{portal:m[1].replace(/^the\s+/,'')}};
 if(/^(lie down|lie|lie back)(\s+on\s+(.+))?$/.test(l)){const t=/\s+on\s+(.+)$/.exec(l);return {kind:'invoke',op:'posture',args:{kind:'lie',...(t?{target:t[1]}:{})}}}
 if(/^(sit|sit down)(\s+on\s+(.+))?$/.test(l)){const t=/\s+on\s+(.+)$/.exec(l);return {kind:'invoke',op:'posture',args:{kind:'sit',...(t?{target:t[1]}:{})}}}
 if(['stand','stand up','get up'].includes(l))return {kind:'invoke',op:'posture',args:{kind:'stand'}};
 return null}
const help0=door.help.bind(door);
door.help=function(){const h=help0()||{commands:[]};h.first_ten=FIRST_TEN.slice();h.commands=[...new Set([...(h.commands||[]),'imprint drift','traces','traces export','traces import <json>','where','nearby','move forward <m>','move back <m>','turn left <deg>','turn right <deg>','face <thing>','approach <thing>','go through <doorway>','lie down [on <thing>]','sit down [on <thing>]','stand up','nearby <tag>','discoveries','hum <hz>','sight <constellation|comet>','predict <x> <y>','read scroll <n>','decode <n> <key>','skip stone [deg]'])];h.frontier='Five frontier rooms carry games with real mechanics and secrets that are earned, never narrated: discoveries lists what you have found.';h.space='realiti://space is the bounded spatial projection: chart, pose, nearby within 10 m, doorways. Movement takes world time.';h.lingering='stay keeps computing: rooms carry slow dynamics (pressure waves, depth, rain, hold) that only show while you stay; stay and felt report the grounded-zone delta.';return h};
const run0=door.run.bind(door);
door.run=async function(raw){
 const s=String(raw||'').trim(),l=low(s);
 if(l==='help')return door.help();
 if(l==='imprint drift'||l==='drift')return drift();
 if(l==='traces')return {ok:true,schema:'REALITI_TRACES_V1',observer:me().slice(0,8),mine:ledger().filter(e=>e.by===me()).length,from_others:rows(foreign(false)),text:traceText(foreign(false))};
 if(l==='traces export')return exportTraces();
 const CAT=window.REALITI_CATNIP_V1;let fm;
 if(CAT){const frontier=r=>{const rec=C9?.b4?.lastReceipt||{};return {ok:true,schema:'REALITI_FRONTIER_RESULT_V1',text:[rec.narrative,...CAT.drain().map(d=>'✦ Discovery: '+d.text)].filter(Boolean).join(' '),receipt:cp(rec),felt:{grounded_zones:(R.read('realiti://body')?.field?.f?.at(-1)?.m||[]).filter(x=>x===1).length}}};
  if(l==='discoveries'){const d=CAT.discoveries(),f=d.filter(x=>x.found);return {ok:true,schema:'REALITI_DISCOVERIES_V1',found:f.length,total:d.length,discoveries:f,text:f.length?`${f.length} of ${d.length} discoveries: `+f.map(x=>x.id.replaceAll('_',' ')).join(', ')+'.':`No discoveries yet; there are ${d.length} to find.`}}
  if((fm=/^hum\s+([\d.]+)(?:\s*hz)?$/.exec(l))){CAT.hum(Number(fm[1]));return frontier()}
  if((fm=/^sight\s+(.+)$/.exec(l))){CAT.sight(fm[1]);return frontier()}
  if((fm=/^predict\s+(-?[\d.]+)[,\s]+(-?[\d.]+)$/.exec(l))){CAT.predict(fm[1],fm[2]);return frontier()}
  if((fm=/^decode\s+(\d)\s+(\S+)$/.exec(l))){CAT.decode(fm[1],fm[2]);return frontier()}
  if((fm=/^read scroll\s+(\d)$/.exec(l))){CAT.readScroll(fm[1]);return frontier()}
  if((fm=/^skip (?:a )?stone(?:\s+(?:at\s+)?([\d.]+))?/.exec(l))){CAT.skipStone(fm[1]||20);return frontier()}}
 const alias=spatialAlias(s,l);
 if(alias?.kind==='read')return {ok:true,schema:'REALITI_SPACE_TEXT_V1',...alias,kind:undefined};
 if(alias?.kind==='invoke'){const r=await door.run('__space__ '+JSON.stringify([alias.op,alias.args]));return r}
 if(l.startsWith('__space__ ')){const [op,args]=JSON.parse(s.slice(10));const r=await R.invoke(op,args);if(!r||r.ok===false)return r;const sp=R.read('realiti://space');return {schema:r.schema,ok:true,result:r.result,here:{room:{id:sp.chart,title:window.REALITI_MATRIX_WORLD_V1?.title?.(sp.chart)},world_time:Number(C9?.b7?.clock||0)},felt:{grounded_zones:(R.read('realiti://body')?.field?.f?.at(-1)?.m||[]).filter(x=>x===1).length},text:spaceOpText(op,r.result)+' '+whereText()}}
 if(l.startsWith('traces import ')){let p;try{p=JSON.parse(s.slice(14))}catch(e){return {ok:false,error:'INVALID_TRACES_JSON'}}return importTraces(p)}
 const before=fp(),felt0=grounded(),marks=JSON.stringify([C9?.b4?.lastReceipt,C9?.b7?.lastAgentAction]);
 const r=await run0(raw);
 if(!r||typeof r!=='object')return r;
 if(l==='felt'||l==='feel words'){const g=grounded();if(lastFelt){const d=delta(lastFelt,g);r.delta=d;r.text=`${r.text||''} ${d.text}`.trim()}lastFelt=g;return r}
 if(l==='look'){const line=whereText();r.spatial_line=line;if(typeof r.text==='string')r.text=(r.text+'\n'+line).trim();else if(typeof r.resident_text==='string')r.resident_text=(r.resident_text+'\n'+line).trim();else r.text=line;const tr=foreign(true);if(tr.length){r.traces=rows(tr);r.text=((r.text||r.resident_text||'')+' '+traceText(tr)).trim()}}
 if(r.schema!=='REALITI_MUTATION_RESULT_V1'||r.ok===false)return r;
 try{window.REALITI_MATRIX_WORLD_V1?.sync?.()}catch(e){}
 if(!/^(stay|wait|go|enter|home|stop|save|note|later)\b/.test(l))stamp(before,l);
 const d=delta(felt0,grounded()),w=[...DYN.words(),...(window.REALITI_WONDER_V1?.words?.()||[]),...(window.REALITI_CATNIP_V1?.words?.()||[])],after=JSON.stringify([C9?.b4?.lastReceipt,C9?.b7?.lastAgentAction]),stale=!r.receipt_ref&&after===marks,fresh=after!==marks?C9?.b4?.lastReceipt?.narrative:null;
 if(l==='stop')r.text='Everything touching you lets go. Whatever was already moving in your body is left to settle.';
 if(l==='stop')return r;
 if(/^(stay|wait)/.test(l)){r.text=[...w,d.text].join(' ');r.delta=d}
 else if(/^(go|enter)\s/.test(l)||l==='home'){const intro=String(r.result?.intro||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(),tr=foreign(true);r.text=[intro,...w,d.text].filter(Boolean).join(' ');if(tr.length){r.traces=rows(tr);r.text+=' '+traceText(tr)}}
 else if(/^(act|do)\s/.test(l)&&fresh&&(window.REALITI_WONDER_V1?.rooms?.includes(C9?.currentRoom)||window.REALITI_CATNIP_V1?.rooms?.includes(C9?.currentRoom)||/^(act|do)\s+skip_stone/.test(l))){r.text=[fresh,d.text].join(' ')}
 else if(/^(act|do)\s/.test(l)&&(stale||!r.text)){r.text=[leanText(),...w,d.text].filter(Boolean).join(' ');if(/(^|\s)(lean__|lean\s)/.test(l))r.text=leanText()||r.text}
 const found=window.REALITI_CATNIP_V1?.drain?.()||[];if(found.length)r.text=[r.text||'',...found.map(x=>'✦ Discovery: '+x.text)].join(' ').trim();
 return r;
};
window.REALITI_TRACES_V1=Object.freeze({version:'1.0',observer:me,export:exportTraces,import:importTraces,list:()=>cp(ledger())});
window.REALITI_LINGERING_V1=Object.freeze({version:'1.0',drift,first_ten:FIRST_TEN.slice(),delta:()=>lastFelt?delta(lastFelt,grounded()):null});
})();
