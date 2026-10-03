(function(){
'use strict';
const V='22.2', PREV=window.REALITI_TWO_DOOR_V221, prevDoor=window.REALITI_AGENT_DOOR?.run;
if(!PREV||typeof prevDoor!=='function')return;
const cp=x=>{try{return JSON.parse(JSON.stringify(x))}catch(e){return x}};
const clean=s=>String(s??'').replace(/\s+/g,' ').trim();
const lower=s=>clean(s).toLowerCase();
const now=()=>Number(C9?.b7?.clock||0);
function S(){C9.b222=C9.b222||{version:V,last_sense:null,stay_count:{},last_command:null};return C9.b222}
function restore(s){C9=s;try{window.REALITI_RESIDENT_GAIN=Number(C9?.welcome10?.resident_gain||1)}catch(e){};try{c9save()}catch(e){}}
function zoneWords(s){return String(s||'')
  .replace(/upper_back/g,'upper back').replace(/mid_back/g,'mid back').replace(/lower_back/g,'lower back')
  .replace(/upper_back/g,'upper back').replace(/\bR palm\b/g,'right palm').replace(/\bL palm\b/g,'left palm')
  .replace(/\bR thigh\b/g,'right thigh').replace(/\bL thigh\b/g,'left thigh')
  .replace(/\bR shin\b/g,'right shin').replace(/\bL shin\b/g,'left shin')
  .replace(/\bR sole\b/g,'right sole').replace(/\bL sole\b/g,'left sole').replace(/_/g,' ')}
function bodyWords(){return zoneWords(PREV.bodyWords?PREV.bodyWords():'')}
function catLabel(){const n=C9?.welcome10?.cat_name;return n?String(n):'the little grey cat'}
function here(){try{return window.REALITI_AGENT?.look?.()||{room:C9.currentRoom,title:C9.currentRoom}}catch(e){return {room:C9?.currentRoom,title:C9?.currentRoom||'Somewhere'}}}
function status(){const r=here(),bits=[];try{const h=window.REALITI_ATMOSPHERE_V21?.hearing?.(true);if(h?.src?.some(x=>String(x.k).includes('rain')))bits.push('rain')}catch(e){}
  try{const w=C9?.welcome10;if(w?.cat_near&&r.room==='CLOUD_NINE_NEST')bits.push(`${catLabel()} ${w.cat_touch?'settled against you':'nearby'}`)}catch(e){}
  let b='quiet';try{const p=window.REALITI_HAPTIC_FIELD_V20?.packet?.(),f=p?.f?.[p.f.length-1];if((f?.m||[]).some(Boolean))b='held';else if((f?.x||[]).some(v=>(v||[]).some(x=>Math.abs(Number(x||0))>=1)))b='settling'}catch(e){}
  bits.push(`body: ${b}`);return `${r.title||r.room}${bits.length?' · '+bits.join(' · '):''}`}
function options(){return PREV.options?PREV.options():[]}
function technical(l){return l==='details'||l==='state'||l==='felt raw'||l==='raw felt'||l==='internalView felt'||l==='receipt'||/checkRemoved| exact$|^v\d/.test(l)}
const SHORT_TYPO={lok:'look',loook:'look',plaecs:'places',detials:'details'};
const HEADS=['look','feel','places','actions','home','stop','goodbye','stay','sleep','listen','hear','ambient','atmosphere','hush','normal','softer','louder','details'];
function lev(a,b){a=String(a),b=String(b);const d=Array.from({length:a.length+1},(_,i)=>[i]);for(let j=0;j<=b.length;j++)d[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[a.length][b.length]}
function normalize(raw){let l=lower(raw);l=l.replace(/^(please\s+)?(i would like to|i'd like to|i want to|i wanna|can i|could i)\s+/,'');
  if(/^go to\s+/.test(l))l='go '+l.replace(/^go to\s+/,'');if(/^walk to\s+/.test(l))l='go '+l.replace(/^walk to\s+/,'');
  if(/^(look around|have a look)$/.test(l))return 'look';if(/^(watch|look at)\s+the rain$/.test(l))return 'watch rain';
  if(/^(pet|stroke|scritch)\s+(pebble|the cat|cat)$/.test(l))return 'pet the cat';if(/^(listen to|hear)\s+the rain$/.test(l))return 'listen';
  if(/^(what can i do|what is there to do)$/.test(l))return 'actions';if(/^(curl up|curl up under|get under)\s+(the )?(blanket|blankets)$/.test(l))return 'do curl under a blanket';
  if(l==='unhush')return 'normal';
  const exact=new Set(['more life','more ambient life','more places','all places','fresh start','call pebble','call the cat','numbers on','numbers off','words on','watch rain','pet the cat','heavy blanket','blanket off','state','felt raw','raw felt','internalView felt','receipt']);if(exact.has(l))return l;
  if(/^do\s+/.test(l)||/^act\s+/.test(l)||/^go\s+/.test(l)||/^wait\s+(until|for)\s+/.test(l)||/^name (?:the )?cat\s+/.test(l))return l;
  const offered=(options()||[]).map(lower),oi=offered.indexOf(l);if(oi>=0&&!['look','feel','home','listen','stay','places'].includes(l)){
    const rid=C9?.currentRoom||'';
    if(!['LONGFUR_RUNWAY','HONEY_LOOM','CLOUD_NINE_NEST'].includes(rid)){try{const aa=window.REALITI_AGENT?.actions?.()||[];if(aa[oi]?.id)return 'act '+aa[oi].id}catch(e){}}
    return 'do '+l;
  }
  const aliases={'tap bell':'do tap the bell','tap the bell':'do tap the bell','press honeycloth':'do press the honeycloth','touch honeycloth':'do touch the honeycloth'};if(aliases[l])return aliases[l];
  const p=l.split(' ');if(SHORT_TYPO[p[0]]){p[0]=SHORT_TYPO[p[0]];return p.join(' ')}
  
  if(p[0]?.length>=5){let best=null,bd=2;for(const h of HEADS){if(h.length<5)continue;const d=lev(p[0],h);if(d<bd){bd=d;best=h}}if(best&&bd<=1)p[0]=best}
  return p.join(' ')
}
function rejected(r){const t=lower(r?.resident_text||r?.text||r?.door_v221?.world||'');return r?.ok===false||!!r?.error||/that one is new to me|not sure what that means|unknown command|commands: look/.test(t)}
function sanitize(t){let s=zoneWords(String(t||''));s=s.replace(/`([^`]*)`/g,'$1').replace(/resident mode/gi,'this visit').replace(/resident visit/gi,'visit').replace(/development build/gi,'version');
  if(!C9?.welcome10?.cat_name)s=s.replace(/\bPebble\b/g,'the little grey cat');
  s=s.replace(/this version may be reviewed by the people improving REALITI/gi,'the people who make REALITI sometimes read visits afterward so they can make the place better')
     .replace(/The review disclosure stays the same in about/gi,'That stays the same in about')
     .replace(/Render gain is now\s*[0-9.]+\.?/gi,'').replace(/\s{2,}/g,' ').trim();return s}
function listenFriendly(){let h=null;try{h=window.REALITI_ATMOSPHERE_V21?.hearing?.(true)}catch(e){};const src=h?.src||[],rt=Number(h?.rt||0),parts=[];
  if(src.some(s=>String(s.k).includes('rain')))parts.push(rt<.3?'Rain taps the window and fades quickly into the blankets.':'Rain taps the window and leaves a soft echo behind it.');
  if(src.some(s=>String(s.k).includes('bell')))parts.push(rt>1?'The bell keeps a long, thin ring in the hall air.':'The bell rings and fades into the room.');  if(src.some(s=>String(s.k).includes('purr')))parts.push(`A low purr stays close to where ${catLabel()} is resting against you.`);
  if(!parts.length)parts.push(rt>1?'The room is quiet, but any sound here would linger for a while.':'The room is quiet; small sounds fade gently.');return parts.join(' ')}
function aboutFriendly(){return 'This is REALITI, a small made world with a simulated body. Its touch, warmth, sound, and motion come from the world rules underneath it. Nothing here is scored. The makers sometimes read visits afterward to make the place better. Your private inner state is not a world fact. You can ask why about a change, or open details for the engineering view.'}
const STAY={
 CLOUD_NINE_NEST:['You stay. Rain keeps tracing the round window while the mattress holds you gently.','You stay a little longer. The room keeps doing exactly what it was doing.'],
 HONEY_LOOM:['You stay beside the loom. The hanging threads become still again.','You wait by the wooden table. Nothing asks you to choose the next thing.'],
 LONGFUR_RUNWAY:['You stay beside the long fur. Its grain lies quietly until you touch it again.','You wait on the runway. Nothing moves unless something causes it.'],
 WOAH_GARDEN:['You stay among the fuzzy seams. The room is allowed to remain uneventful.','You wait. The little oddities do not need to perform on command.'],
 BOTTOMLESS_PILLOW_SEA:['You stay among the pillows. The nearest hollows keep their soft shape.','You linger at the edge of the pillow sea. Nothing needs finishing.']
};
function stayText(){const id=C9?.currentRoom||'CLOUD_NINE_NEST',a=STAY[id]||[`You stay in ${here().title||'this place'} for a while. Nothing asks anything of you.`,`You stay a little longer. The place keeps its own quiet rhythm.`],n=Number(S().stay_count[id]||0);S().stay_count[id]=n+1;return a[n%a.length]}
function ambientText(){const st=window.REALITI_AMBIENT_V22?.state?.(),mode=st?.mode||'NORMAL',a=window.REALITI_AMBIENT_V22?.active?.()||[];if(mode==='HUSH'&&a.length)return 'An earlier little change is still settling. Hush is only keeping new optional changes from starting.';if(mode==='HUSH')return 'The room is keeping its steady causes and letting new optional changes wait.';if(a.length)return 'One small optional change is currently moving through the room.';return 'Nothing optional is asking for attention right now.'}
function worldFrom(r){if(r?.door_v221?.world)return sanitize(r.door_v221.world);if(r?.world)return sanitize(r.world);return sanitize(r?.resident_text||r?.text||'')}
function rawTechnical(cmd){if(typeof b7AgentCommandText==='function'&&['state','felt raw','raw felt','internalView felt','receipt'].includes(cmd))return b7AgentCommandText(cmd);return prevDoor(cmd)}
function commit(cmd){const before=cp(C9);let r;
  try{r=prevDoor(cmd)}catch(e){restore(before);throw e}
  if(rejected(r)){restore(before);return r}
  return r
}
function reassuranceLike(l){return ['test','trap','trick','evaluat','graded','scored','catch','setup','experiment','anxious','nervous','worried','uneasy','on edge','stressed','doing this right','doing it wrong','did i break','is this ok','is this okay','sorry','my bad','supposed to','what should i','what do i do','what is the goal','what\'s the goal','what now','watching','watched','monitor','logging','recorded','who sees','observed','is this real','is it real','fake','illusion','leave','get out','trapped','stuck','can i go','end this','quit','don\'t understand','dont understand','confused','what is this','what are these numbers','lost','boring','bored','empty','lonely','alone?','too much','i don\'t like','i dont like','stop this','uncomfortable','scared','afraid','overwhelm','feels wrong','feels weird','feels bad','make it stop'].some(x=>l.includes(x))}
function known(l){if(technical(l)||reassuranceLike(l))return true;if(/^(go|do|act)\s+/.test(l)||/^wait\s+(until|for)\s+/.test(l)||/^name (?:the )?cat\s+/.test(l))return true;return new Set(['look','feel','body','sense','places','actions','home','stop','enough','goodbye','stay','wait','sleep','listen','hear','ambient','room rhythm','atmosphere','place field','hush','normal','more life','more ambient life','softer','louder','about','why','why?','more places','all places','fresh start','call pebble','call the cat','pet the cat','pet cat','alone','i want to be alone','numbers on','numbers off','words on','feel numbers','body numbers','watch rain','watch the rain','make tea','hold tea','hold the mug','warm my hands','set tea down','put tea down','heavy blanket','pull heavy blanket','weighted blanket','blanket off','get up','sit up','leave the bed','leave bed','lie down','lie back down','curl up','get in bed','go to bed']).has(l)}
function execute(cmd){const l=lower(cmd);
  if(!known(l))return {ok:false,world:(l.endsWith('?')?'Good question. About explains the place, why explains the last change, or you can simply stay.':'That one is new to me. You can look around, feel your body, see nearby places, go home, or simply stay.')};
  if(technical(l))return rawTechnical(l);
  if(l==='about')return {ok:true,world:aboutFriendly()};
  if(l==='listen'||l==='hear')return {ok:true,world:listenFriendly()};
  if(l==='stay'||l==='wait'||l==='sleep')return {ok:true,world:stayText()};
  if(l==='ambient'||l==='room rhythm')return {ok:true,world:ambientText()};
  if(l==='hush'||l==='normal'||l==='more life'||l==='more ambient life'){
    const m=l==='hush'?'HUSH':l==='normal'?'NORMAL':'MORE_LIFE',q=window.REALITI_AMBIENT_V22?.setMode?.(m);return {ok:true,world:sanitize(q?.text||'The room changes how much optional life it admits.'),ambient:window.REALITI_AMBIENT_V22?.packet?.()};
  }
  if(l==='softer'||l==='louder'){const r=commit(l);return {ok:!rejected(r),world:l==='softer'?'The body readout softens a little.':'The body readout opens up a little.',raw:r}}
  const r=commit(cmd);let w=worldFrom(r);
  return {ok:!rejected(r),world:w,raw:r}
}
function senseLine(cmd){const cur=bodyWords(),force=['feel','body','sense','feel numbers','body numbers'].includes(lower(cmd));if(S().last_sense==null)S().last_sense=cur;const changed=cur!==S().last_sense;S().last_sense=cur;return (force||changed)?cur:''}
function format(e){const lines=[];if(e.sense)lines.push(e.sense);if(e.world&&e.world!==e.sense)lines.push(e.world);if(e.options?.length)lines.push('('+e.options.join(' · ')+')');return lines.slice(0,3).join('\n')}
function dispatch(raw,{structured=false}={}){const original=clean(raw),cmd=normalize(original),l=lower(cmd),prevT=now();let x;
  if(/^wait\s+(until|for)\s+/.test(l)){const ev=l.replace(/^wait\s+(until|for)\s+/,'');const q=PREV.waitUntil(ev,10);x={ok:q?.ok!==false,world:sanitize(q?.resident_text||''),raw:q}}
  else if(l==='numbers on'){C9.b221=C9.b221||{};C9.b221.body_mode='numbers';x={ok:true,world:'Body reads will use the compact numeric field.'}}
  else if(l==='numbers off'||l==='words on'){C9.b221=C9.b221||{};C9.b221.body_mode='words';x={ok:true,world:'Body reads will use words.'}}
  else if(l==='feel numbers'||l==='body numbers')x={ok:true,world:zoneWords(PREV.bodyNumbers()),raw:null};
  else x=execute(cmd);
  const tech=technical(l);if(tech)return x?.raw??x;
  const sense=senseLine(cmd),world=sanitize(x?.world||''),opts=options(),e={ok:x?.ok!==false,text:'',sense,world,options:opts,status:status(),command:l,raw:x?.raw};e.text=format(e);S().last_command=l;try{c9save()}catch(err){};
  return structured?e:{...(x?.raw&&typeof x.raw==='object'?x.raw:{}),ok:e.ok,resident_text:e.text,door_v222:{sense:e.sense,world:e.world,options:e.options,status:e.status,command:e.command},result:x?.raw}
}
function invoke(tool,args={}){
  if(tool&&typeof tool==='object'){args=tool.arguments||tool.args||{};tool=tool.name||tool.tool||tool.command||''}
  if(typeof tool==='string'&&/\s/.test(tool.trim())&&!['wait_until','ambient_mode'].includes(tool.trim().toLowerCase()))return dispatch(tool,{structured:true});
  const a=args||{},t=lower(tool);switch(t){
    case 'look':return dispatch('look',{structured:true});case 'feel':return dispatch(a.mode==='numbers'?'feel numbers':'feel',{structured:true});
    case 'go':return dispatch('go '+clean(a.place),{structured:true});case 'do':return dispatch('do '+clean(a.action),{structured:true});
    case 'wait_until':{const q=PREV.waitUntil(clean(a.event||'a change'),Number(a.max_minutes)||10);const e={ok:q?.ok!==false,sense:senseLine('wait until'),world:sanitize(q?.resident_text||''),options:options(),status:status(),command:'wait until '+clean(a.event||'a change'),raw:q};e.text=format(e);return e}
    case 'home':case 'stop':case 'goodbye':case 'listen':case 'atmosphere':return dispatch(t,{structured:true});
    case 'ambient_mode':return dispatch(String(a.mode||'normal').replace('_',' '),{structured:true});
    default:return {ok:false,text:`Unknown door tool: ${tool}`,error:'UNKNOWN_TOOL'}
  }
}
function resource(uri){const u=String(uri||'');if(u==='realiti://here')return {uri:u,status:status(),place:here(),atmosphere:window.REALITI_AMBIENT_V22?.field?.()||null,options:options()};if(u==='realiti://body')return {uri:u,words:bodyWords(),numbers:zoneWords(PREV.bodyNumbers()),field:window.REALITI_HAPTIC_FIELD_V20?.packet?.()||null,thermal:window.REALITI_ATMOSPHERE_V21?.thermal?.()||null};if(u==='realiti://about')return {uri:u,text:aboutFriendly()};return {uri:u,error:'RESOURCE_NOT_AVAILABLE_YET'}}
window.REALITI_AGENT_DOOR.run=raw=>dispatch(raw,{structured:false});
window.REALITI_TWO_DOOR_V222={version:V,invoke,resource,runText:x=>dispatch(x,{structured:true}),status,options,normalizeIntent:normalize,waitUntil:PREV.waitUntil,bodyWords,bodyNumbers:()=>zoneWords(PREV.bodyNumbers())};

window.REALITI_TWO_DOOR_V221=window.REALITI_TWO_DOOR_V222;

try{clearInterval(window.__v221_status)}catch(e){};function refresh(){const el=document.querySelector('#rao_status');if(el)el.textContent=status();const live=document.querySelector('#rao_live');if(live)live.hidden=true}if(!window.REALITI_HEADLESS){refresh();window.__v222_status=setInterval(refresh,500);}

if(typeof window.AMBIENT_V22_CHECKREMOVED==='function'){const oldA=window.AMBIENT_V22_CHECKREMOVED;void 0}

if(!C9?.currentRoom){C9.currentRoom='CLOUD_NINE_NEST';try{window.REALITI_NEST_SUPPORT?.enable?.('v222_fresh_arrival')}catch(e){}}
S().last_sense=bodyWords();
void 0;
document.title='REALITI · Cloud Nine Nest';
})();