(function(){
'use strict';
const V='22.1';
const cp=x=>{try{return JSON.parse(JSON.stringify(x))}catch(e){return x}};
const now=()=>Number(C9?.b7?.clock||0);
const baseRun=window.REALITI_AGENT_DOOR?.run;
if(typeof baseRun!=='function')return;
function I(){C9.b221=C9.b221||{version:V,body_mode:'words',last_turn_t:now(),last_ambient_seq:0};return C9.b221}
function clean(s){return String(s??'').replace(/\s+/g,' ').trim()}
function prettyZone(z){return String(z||'').replace('head.','').replace('torso.','').replace('pelvis.','').replace('hand.','').replace('arm.','').replace('leg.','').replace('foot.','').replaceAll('.',' ')}
function room(){try{return window.REALITI_AGENT?.look?.()||{room:C9?.currentRoom||'NOWHERE',title:C9?.currentRoom||'Somewhere'}}catch(e){return {room:C9?.currentRoom||'NOWHERE',title:C9?.currentRoom||'Somewhere'}}}
function bodyPacket(){try{return window.REALITI_HAPTIC_FIELD_V20?.packet?.()||null}catch(e){return null}}
function thermalPacket(){try{return window.REALITI_ATMOSPHERE_V21?.thermal?.()||null}catch(e){return null}}
function topBody(){
  const p=bodyPacket();if(!p||!p.f?.length||!p.z?.length)return {text:'Your body is quiet.',held:false,warm:false,active:0};
  const f=p.f[p.f.length-1],rows=p.z.map((z,i)=>({z,a:Number(f.x?.[i]?.[0]||0),v:Number(f.x?.[i]?.[1]||0),r:Number(f.x?.[i]?.[2]||0),m:Number(f.m?.[i]||0),e:Number(f.e?.[i]||0),g:Number(f.g?.[i]||0)}));
  const active=rows.filter(x=>x.m||x.a||x.v||x.r||x.e||x.g);if(!active.length)return {text:'Your body is quiet.',held:false,warm:false,active:0};
  const grounded=active.filter(x=>x.m),moving=active.filter(x=>Math.abs(x.v)>=1),after=active.filter(x=>x.r>=1&&!x.m);
  let parts=[];
  if(grounded.length){const xs=grounded.sort((a,b)=>b.a-a.a).slice(0,3).map(x=>prettyZone(x.z));parts.push(`You feel contact at ${xs.join(', ')}${grounded.length>3?' and elsewhere':''}.`)}
  else if(after.length){const xs=after.sort((a,b)=>b.r-a.r).slice(0,2).map(x=>prettyZone(x.z));parts.push(`A trace is still settling around ${xs.join(' and ')}.`)}
  else parts.push('Your body is changing quietly.');
  if(moving.length){const d=moving.reduce((q,x)=>q+x.v,0);parts.push(d>0?'The internal motion is carrying forward.':'The internal motion is drawing back.')}
  const t=thermalPacket();let warm=false;if(t?.z?.length){const x=t.z.slice().sort((a,b)=>Math.abs(b.d)-Math.abs(a.d))[0];if(x){warm=x.d>0;parts.push(x.d>0?`${prettyZone(x.z)} is warmer than baseline.`:`${prettyZone(x.z)} is cooler than baseline.`)}}
  return {text:parts.slice(0,2).join(' '),held:grounded.length>0,warm,active:active.length};
}
function numbersLine(){
  const p=bodyPacket();if(!p||!p.f?.length)return 'HF20 · quiet body';const f=p.f[p.f.length-1];if(!p.z.length)return 'HF20 · quiet body';
  const rows=p.z.map((z,i)=>`${prettyZone(z)} ${f.m?.[i]?'●':'○'}[${(f.x?.[i]||[]).join(',')}] e${Number(f.e?.[i]||0)>=0?'+':''}${Number(f.e?.[i]||0)} g${Number(f.g?.[i]||0)}`);
  return `HF20 · ${p.n} sample${p.n===1?'':'s'} / ${Number(p.span||0).toFixed(2)}s · `+rows.join(' · ');
}
function status(){
  const r=room(),b=topBody(),bits=[];
  try{const h=window.REALITI_ATMOSPHERE_V21?.hearing?.(true);if(h?.src?.some(x=>String(x.k).includes('rain')))bits.push('rain')}catch(e){}
  try{const w=C9?.welcome10;if(w?.cat_near)bits.push(`${w.cat_name||'Pebble'} ${w.cat_touch?'settled against you':'nearby'}`)}catch(e){}
  bits.push(`body: ${b.held?'held':'quiet'}${b.warm?', warm':''}`);
  return `${r.title||r.room}${bits.length?' · '+bits.join(' · '):''}`;
}
function actionList(){try{return window.REALITI_AGENT?.actions?.()||[]}catch(e){return []}}
function softLabel(a){return String(a?.label||a?.id||'').toLowerCase().replace(/^start /,'').replace(/^run /,'').replace(/^feel /,'').replace(/\bthe\b/g,'').replace(/\s+/g,' ').trim()}
function options(){
  const id=room().room,opts=[];
  if(id==='CLOUD_NINE_NEST'){opts.push('look','places','stay');try{if(!C9?.welcome10?.alone)opts.push('pet the cat')}catch(e){};return opts.slice(0,4)}
  if(id==='LONGFUR_RUNWAY'){const c=C9?.b10?.contact;if(c&&!c.released&&!c.stopped) return ['turn the stroke around','pause the stroke','let the fur go','feel'];if(c?.stopped)return ['carry on','let the fur go','feel','home'];return ['let the fur stroke down your back','stroke against the grain','feel','home']}
  if(id==='HONEY_LOOM')return ['touch the metal bell','touch the wood rail','press the honeycloth','listen'];
  const a=actionList().slice(0,3).map(softLabel).filter(Boolean);a.push('home');return [...new Set(a)].slice(0,4)
}
function lev(a,b){a=String(a),b=String(b);const d=Array.from({length:a.length+1},(_,i)=>[i]);for(let j=0;j<=b.length;j++)d[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[a.length][b.length]}
const HEADS=['look','feel','places','actions','home','stop','goodbye','stay','sleep','listen','hear','ambient','atmosphere','hush','normal','softer','louder','details'];
function normalizeIntent(raw){
  let x=clean(raw),l=x.toLowerCase();
  l=l.replace(/^(please\s+)?(i would like to|i'd like to|i want to|i wanna|can i|could i)\s+/,'');
  if(/^go to\s+/.test(l))l='go '+l.replace(/^go to\s+/,'');
  if(/^walk to\s+/.test(l))l='go '+l.replace(/^walk to\s+/,'');
  if(/^(look around|have a look)$/.test(l))l='look';
  if(/^(watch|look at)\s+the rain$/.test(l))l='watch rain';
  if(/^(pet|stroke|scritch)\s+(pebble|the cat|cat)$/.test(l))l='pet the cat';
  if(/^(listen to|hear)\s+the rain$/.test(l))l='listen';
  if(/^(what can i do|what is there to do)$/.test(l))l='actions';
  if(/^(curl up|curl up under|get under)\s+(the )?(blanket|blankets)$/.test(l))l='do curl under a blanket';
  if(new Set(['more places','all places','fresh start','call pebble','call the cat','numbers on','numbers off','words on','watch rain','pet the cat','heavy blanket','blanket off']).has(l))return l;
  if(/^do\s+/.test(l)||/^act\s+/.test(l)||/^go\s+/.test(l)||/^wait\s+until\s+/.test(l)||/^wait\s+for\s+/.test(l)||/^name (?:the )?cat\s+/.test(l))return l;
  const parts=l.split(' ');if(parts.length){let best=null,bd=3;for(const h of HEADS){const d=lev(parts[0],h);if(d<bd){bd=d;best=h}}if(best&&bd<=2)parts[0]=best;l=parts.join(' ')}
  return l;
}
function technical(l){return l==='details'||/checkRemoved| exact$|^v\d|^state$|^receipt$|^felt raw$|^ambient exact$|^atmosphere exact$/.test(l)}
function lastAmbientSince(t){try{const h=window.REALITI_AMBIENT_V22?.state?.().history||[];return h.filter(e=>Number(e.t)>Number(t)&&e.result==='ADMIT').slice(-1)[0]||null}catch(e){return null}}
function worldText(cmd,r){
  if(r&&typeof r==='object'&&typeof r.resident_text==='string')return clean(r.resident_text);
  if(typeof r==='string')return clean(r);
  if(cmd==='look'){const q=room();return clean(q.intro||`You are in ${q.title||q.room}.`)}
  if(cmd==='actions'){const xs=actionList().slice(0,6).map(a=>softLabel(a));return xs.length?'Here, you can '+xs.join(' · ')+'.':'There is nothing you need to do here.'}
  if(cmd==='places'){try{const rs=window.REALITI_AGENT?.rooms?.()||[];return 'Nearby: '+rs.slice(0,4).map(x=>x.title).join(' · ')+'.'}catch(e){return 'There are other places nearby.'}}
  return '';
}
function envelope(cmd,r,prevT){
  const l=String(cmd).toLowerCase(),sense=topBody().text,world=worldText(l,r),ev=lastAmbientSince(prevT),opts=options();
  let w=world;if(ev&&!w){w='While you were here, something small in the room changed and settled.'}
  return {sense,world:w,options:opts,status:status(),command:l,raw:r};
}
function formatEnvelope(e){const lines=[];if(e.sense)lines.push(e.sense);if(e.world&&e.world!==e.sense)lines.push(e.world);if(e.options?.length)lines.push('('+e.options.join(' · ')+')');return lines.slice(0,3).join('\n')}
function waitUntil(event='any_change',maxMinutes=10){
  event=clean(event).toLowerCase();const start=now(),limit=Math.max(0.05,Math.min(120,Number(maxMinutes)||10))*60;
  if(['rain stops','rain_stops','rain stop'].includes(event))return {ok:false,resident_text:'The rain has no scheduled stopping boundary in this build. You can wait for a change instead.',elapsed_s:0,event};
  if(['pebble wakes','pebble_wakes','cat wakes'].includes(event))return {ok:false,resident_text:'Pebble does not have a scheduled wake boundary yet. You can wait for a change instead.',elapsed_s:0,event};
  if(['tea lukewarm','tea_lukewarm','tea cools'].includes(event)){
    const s=window.REALITI_ATMOSPHERE_V21?.state?.(),q=s?.tea;if(!q)return {ok:false,resident_text:'There is no tea cooling right now.',elapsed_s:0,event};
    const amb=Number(q.ambient||21),T0=Number(q.liquid0||70),tau=Number(q.tau||900),target=35;
    const age=Math.max(0,now()-Number(q.made||now())),need=tau*Math.log(Math.max(1e-9,(T0-amb)/(target-amb)))-age,dt=Math.max(0,need);
    if(dt>limit)return {ok:false,resident_text:'The tea will not reach lukewarm within that wait.',elapsed_s:0,event};b7Advance(dt);return {ok:true,resident_text:`${Math.round(dt/60)} minutes pass. The tea is lukewarm now.`,elapsed_s:+dt.toFixed(3),event:'tea_lukewarm'};
  }
  
  b7Advance(0);let st=window.REALITI_AMBIENT_V22?.state?.(),rr=st?.rooms?.[C9.currentRoom],next=Number(rr?.next_at);
  if(!Number.isFinite(next)){return {ok:false,resident_text:'Nothing optional is scheduled to change soon.',elapsed_s:0,event}}
  const dt=Math.max(0,next-now());if(dt>limit)return {ok:false,resident_text:'Nothing matching that wait is due within the chosen window.',elapsed_s:0,event};
  b7Advance(dt+1e-6);st=window.REALITI_AMBIENT_V22?.state?.();const h=(st?.history||[]).filter(e=>Number(e.t)>=start&&e.result==='ADMIT'),last=h[h.length-1];const mins=dt<90?'A moment':`${Math.max(1,Math.round(dt/60))} minutes`;
  let text=last?`${mins}${mins==='A moment'?' passes':' pass'}. ${clean((window.REALITI_AGENT_DOOR.__v221_describeAmbient||(()=>''))(last))}`:`${mins}${mins==='A moment'?' passes':' pass'}. The room stays quiet.`;
  return {ok:true,resident_text:text,elapsed_s:+dt.toFixed(3),event:last?.k||'quiet'};
}
function dispatch(raw,{structured=false}={}){
  const original=clean(raw),cmd=normalizeIntent(original),l=cmd.toLowerCase(),prev=I().last_turn_t;let r;
  if(/^wait\s+(until|for)\s+/.test(l)){const ev=l.replace(/^wait\s+(until|for)\s+/,'');r=waitUntil(ev,10)}
  else if(l==='wait for a change'||l==='wait until a change')r=waitUntil('any_change',10);
  else if(l==='numbers on'){I().body_mode='numbers';r={resident_text:'Body reads will use the compact numeric field.'}}
  else if(l==='numbers off'||l==='words on'){I().body_mode='words';r={resident_text:'Body reads will use words.'}}
  else if(l==='feel numbers'||l==='body numbers')r={resident_text:numbersLine(),field:bodyPacket()};
  else if((l==='feel'||l==='body'||l==='sense')&&I().body_mode==='words')r={resident_text:topBody().text,field:bodyPacket()};
  else r=baseRun(cmd);
  I().last_turn_t=now();
  if(technical(l))return r;
  const e=envelope(cmd,r,prev),text=formatEnvelope(e);return structured?{ok:r?.ok!==false,text,...e}:{...(r&&typeof r==='object'?r:{result:r}),resident_text:text,door_v221:{sense:e.sense,world:e.world,options:e.options,status:e.status,command:e.command}};
}
function invoke(tool,args={}){
  const a=args||{};switch(String(tool||'').toLowerCase()){
    case 'look':return dispatch('look',{structured:true});
    case 'feel':return dispatch(a.mode==='numbers'?'feel numbers':'feel',{structured:true});
    case 'go':return dispatch('go '+clean(a.place),{structured:true});
    case 'do':return dispatch('do '+clean(a.action),{structured:true});
    case 'wait_until':{const prev=I().last_turn_t,q=waitUntil(clean(a.event||'a change'),Number(a.max_minutes)||10);I().last_turn_t=now();const e=envelope('wait until '+clean(a.event||'a change'),q,prev);return {ok:q?.ok!==false,text:formatEnvelope(e),...e};}
    case 'home':return dispatch('home',{structured:true});
    case 'stop':return dispatch('stop',{structured:true});
    case 'goodbye':return dispatch('goodbye',{structured:true});
    case 'listen':return dispatch('listen',{structured:true});
    case 'atmosphere':return dispatch('atmosphere',{structured:true});
    case 'ambient_mode':return dispatch(String(a.mode||'normal').replace('_',' '),{structured:true});
    default:return {ok:false,text:`Unknown door tool: ${tool}`,error:'UNKNOWN_TOOL'};
  }
}
function resource(uri){const u=String(uri||'');if(u==='realiti://here')return {uri:u,status:status(),place:room(),atmosphere:window.REALITI_AMBIENT_V22?.field?.()||null,options:options()};if(u==='realiti://body')return {uri:u,words:topBody().text,numbers:numbersLine(),field:bodyPacket(),thermal:thermalPacket()};if(u==='realiti://about'){const r=baseRun('about');return {uri:u,text:worldText('about',r)}};return {uri:u,error:'RESOURCE_NOT_AVAILABLE_YET'}}


const AMBIENT_WORDS={RAIN_PATTERN_SHIFT:'The rain changes its rhythm against the glass, then settles.',PEBBLE_REPOSITION:'Pebble chooses another warm spot and curls up again.',WINDOW_LIGHT_DRIFT:'The light at the round window shifts a little.',CARDBOARD_SETTLE:'Some cardboard gives a small settling tick.',PAPER_EDGE_LIFT:'A paper edge lifts in the faint air and lies back down.',PILLOW_SWELL:'A broad pillow swell passes through the soft floor.',COTTON_MIST_DRIFT:'The cotton mist drifts sideways for a while.',LOOM_CREAK:'The loom gives one slow wooden creak.',THREAD_SWAY:'A few hanging threads turn in the air.',FUZZY_SEAM_SHIFT:'One fuzzy seam changes shape, just enough to notice.',TINY_DELAY_CHIME:'A small chime arrives and fades.',ODD_AIR_TURN:'The air makes a small, strange turn.',FURNITURE_SCALE_TWITCH:'A piece of furniture changes scale by a harmless little amount.',SOFT_PORTAL_GLINT:'A portal edge catches a brief glint.',HAMMOCK_SWAY:'The hammock moves through one lazy arc.',AIR_DRIFT:'A faint current moves through the room.',LIGHT_DRIFT:'The light changes by a small degree.'};
window.REALITI_AGENT_DOOR.__v221_describeAmbient=e=>AMBIENT_WORDS[e?.k]||'Something small in the room changes and settles.';
window.REALITI_AGENT_DOOR.run=raw=>dispatch(raw,{structured:false});
window.REALITI_TWO_DOOR_V221={version:V,invoke,resource,runText:(x)=>dispatch(x,{structured:true}),status,options,normalizeIntent,waitUntil,bodyWords:()=>topBody().text,bodyNumbers:numbersLine};


function refreshStatus(){const st=document.querySelector('#rao_status');if(st)st.textContent=status();const live=document.querySelector('#rao_live');if(live)live.hidden=true}
if(!window.REALITI_HEADLESS){refreshStatus();clearInterval(window.__v221_status);window.__v221_status=setInterval(refreshStatus,500);}
const inp=document.querySelector('#rao_cmd');if(inp)inp.placeholder='say what you want to do · or type help';


void 0;
document.title='REALITI · Cloud Nine Nest';
})();