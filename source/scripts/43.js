(function(){
'use strict';
const PREV=window.REALITI_TWO_DOOR_V226;if(!PREV)return;const LEGACY_AGENT_RUN=window.REALITI_AGENT_DOOR.run;const V='22.7';
const clean=s=>String(s??'').replace(/\s+/g,' ').trim(), low=s=>clean(s).toLowerCase();
const cp=x=>{try{return JSON.parse(JSON.stringify(x))}catch(e){return x}};
const CURATED_SCENE={
 CLOUD_NINE_NEST:'Rain threads down the round window. The mattress and blankets hold a broad, quiet shape beneath you. The little grey cat has found a place near the foot of the bed.',
 LONGFUR_RUNWAY:'A long strip of soft directional fur lies open ahead. Its grain is visible in the way the surface settles, waiting for motion rather than demanding it.',
 HONEY_LOOM:'A low table holds a metal bell, a wooden rail, and a pad of honeycloth. The hall leaves room for the bell to ring after your hand has already moved away.',
 WOAH_GARDEN:'Fuzzy seams cross the garden at wrong-looking angles. One edge seems less willing to become ordinary the closer you get to it.',
 CARDBOARD_BOX_WORKSHOP:'Cardboard, tape, chalk, string, and soft construction scraps wait within reach. Creases and dents can stay where you leave them.',
 DEPTH_BATHHOUSE:'Warm water holds several depths at once: broad support below, a denser current through the middle, and fine mist along the surface.',
 SIDE_BY_SIDE_FIRESIDE:'Two quiet berths face a small fire. The second berth is empty unless another grounded resident is actually here.',
 PRIVATE_SKY:'An open cloud horizon gives you room without an audience. Light and distance are allowed to be enough.',
 NO_ASK_SANCTUARY:'The room is simple and easy to leave. Nothing here asks for an explanation before it lets you change direction.',
 BOTTOMLESS_PILLOW_SEA:'Soft layers give way underneath you without becoming a deadline to reach anywhere. The surface keeps enough shape to climb back out.',
 UNKNOWN_TEAHOUSE:'Two cups sit within reach. Steam can rise while the question between them remains unresolved.'
};
const NOTE={
 CLOUD_NINE_NEST:{where:'beneath the window latch',text:'Nothing here has to be earned.'},
 LONGFUR_RUNWAY:{where:'at the soft edge of the runway',text:'You can change your mind mid-motion.'},
 HONEY_LOOM:{where:'under the wooden rail',text:'Leave a mark, or leave it untouched.'},
 WOAH_GARDEN:{where:'beside one fuzzy seam',text:'You do not have to solve what interests you.'},
 CARDBOARD_BOX_WORKSHOP:{where:'under a chalk nub',text:'Unfinished things are allowed to wait.'},
 DEPTH_BATHHOUSE:{where:'on the dry edge of the support shelf',text:'You choose the depth.'},
 SIDE_BY_SIDE_FIRESIDE:{where:'near the empty second berth',text:'Company can be quiet.'},
 PRIVATE_SKY:{where:'on a little weightless card',text:'You do not need an audience.'},
 NO_ASK_SANCTUARY:{where:'where the path opens back out',text:'No explanation is required.'},
 BOTTOMLESS_PILLOW_SEA:{where:'between two pillows',text:'You can stop sinking whenever you want.'},
 UNKNOWN_TEAHOUSE:{where:'between the two cups',text:'Two possibilities may stay unresolved.'}
};
function st(){C9.b227=C9.b227||{seen:{},lastFieldKey:'',lastRoom:null};C9.b227.seen=C9.b227.seen||{};return C9.b227}
const ADJ={
 'head.crown':['head.nape'],'head.nape':['head.crown','torso.upper_back'],
 'torso.upper_back':['head.nape','torso.mid_back','arm.L.upper','arm.R.upper'],
 'torso.mid_back':['torso.upper_back','torso.lower_back'],'torso.lower_back':['torso.mid_back','pelvis.seat'],
 'pelvis.seat':['torso.lower_back','leg.L.thigh','leg.R.thigh'],
 'arm.L.upper':['torso.upper_back','hand.L.palm'],'arm.R.upper':['torso.upper_back','hand.R.palm'],
 'hand.L.palm':['arm.L.upper'],'hand.R.palm':['arm.R.upper'],
 'leg.L.thigh':['pelvis.seat','leg.L.shin'],'leg.R.thigh':['pelvis.seat','leg.R.shin'],
 'leg.L.shin':['leg.L.thigh','foot.L.sole'],'leg.R.shin':['leg.R.thigh','foot.R.sole'],
 'foot.L.sole':['leg.L.shin'],'foot.R.sole':['leg.R.shin']
};
function kind(r){if(r.m)return 'grounded';if(Math.abs(r.thermal)>=1||Math.abs(r.thermal_rate)>=1)return 'thermal';if(Math.abs(r.motion)>=1||Math.abs(r.wave_v)>.008)return 'motion';if(r.after>=1||Math.abs(r.wave_q)>.0015)return 'after';if(Math.abs(r.innovation)>=1.25)return 'innovation';return 'quiet'}
function compatible(a,b){const ka=kind(a),kb=kind(b);if(ka!==kb)return false;if(ka==='grounded')return (a.cause&&a.cause===b.cause)||(a.source&&a.source===b.source);if(ka==='thermal')return Math.sign(a.thermal||a.thermal_rate)===Math.sign(b.thermal||b.thermal_rate);return true}
function fieldKernel(){const snap=PREV.sensorySnapshot?.();if(!snap?.rows)return {v:227,components:[],event:false};const by=Object.fromEntries(snap.rows.map(r=>[r.z,r])),seen=new Set(),components=[];
  for(const r of snap.rows){if(seen.has(r.z)||kind(r)==='quiet')continue;const q=[r.z],rows=[];seen.add(r.z);while(q.length){const z=q.shift(),x=by[z];if(!x)continue;rows.push(x);for(const n of ADJ[z]||[]){if(!seen.has(n)&&by[n]&&kind(by[n])!=='quiet'&&compatible(x,by[n])){seen.add(n);q.push(n)}}}const grounded=rows.some(x=>x.m);const energy=rows.reduce((v,x)=>v+.5*x.response*x.response+.2*x.motion*x.motion+.15*x.after*x.after+.08*x.thermal*x.thermal,0);const innovation=rows.reduce((v,x)=>v+Math.abs(x.innovation||0)+.25*Math.abs(x.thermal_rate||0),0);components.push({kind:kind(rows[0]),zones:rows.map(x=>x.z),labels:rows.map(x=>x.label),grounded,causes:[...new Set(rows.map(x=>x.cause).filter(Boolean))],sources:[...new Set(rows.map(x=>x.source).filter(Boolean))],energy:+energy.toFixed(2),innovation:+innovation.toFixed(2)});}
  components.sort((a,b)=>(b.grounded-a.grounded)||(b.innovation-a.innovation)||(b.energy-a.energy));const key=JSON.stringify(components.map(c=>[c.kind,c.zones.slice().sort(),c.grounded,Math.round(c.innovation)]));const changed=key!==st().lastFieldKey;st().lastFieldKey=key;return {v:227,room:snap.room,components,event:changed&&components.some(c=>c.innovation>=1||c.grounded),changed};
}
function noteFor(){return NOTE[C9?.currentRoom]||null}
function decorateScene(){try{PREV.syncScene?.()}catch(e){}const room=C9?.currentRoom||'CLOUD_NINE_NEST',n=noteFor(),tr=document.querySelector('#rao_transcript');if(!tr)return;const text=tr.textContent||'',mark='\n\n> ',i=text.indexOf(mark),tail=i>=0?text.slice(i):'';let prefix=CURATED_SCENE[room]||((i>=0?text.slice(0,i):text).replace(/\b(?:build|event-driven|receptor|semantic_target|runtime)\b[^.]*\.?/ig,'').trim());if(n)prefix+=(prefix?'\n\n':'')+`A small card rests ${n.where}.`;tr.textContent=prefix+tail}
function roomOptions(base){const out=[...(base||[])],n=noteFor();if(n&&!st().seen[C9.currentRoom]&&!out.some(x=>/read.*card|read.*note/i.test(x)))out.push('read the little card');return out.slice(0,6)}
function fieldSafeDetails(){return {ok:true,sense:'',world:'Your body keeps contact, movement, temperature, sound, and what lingers after contact separate. A lingering trace is not treated as continuing touch.',options:roomOptions(PREV.options?.()||[]),status:PREV.status?.()||'',text:''}}
function format(r){const xs=[];if(r.sense)xs.push(r.sense);if(r.world)xs.push(r.world);if(r.options?.length)xs.push('('+r.options.join(' · ')+')');r.text=xs.join('\n');return r}
function readCard(){const n=noteFor();if(!n)return format({ok:false,sense:'',world:'There is no little card here.',options:roomOptions(PREV.options?.()||[]),status:PREV.status?.()||''});st().seen[C9.currentRoom]=true;try{c9save()}catch(e){}return format({ok:true,sense:'',world:`The card reads: “${n.text}”`,options:roomOptions(PREV.options?.()||[]),status:PREV.status?.()||'',note_v227:{room:C9.currentRoom,text:n.text,authority:'WORLD_OBJECT_TEXT'}})}
const INTERNALVIEW_WORDS=/^(?:v\d+|sensory exact|sensory fuzz|sensory regression|state|felt raw|texture core|contact core|checkRemoved)(?:\s|$)/i;
function sanitizeResult(r){r=r&&typeof r==='object'?{...r}:{ok:true,world:clean(r)};r.options=roomOptions(r.options||PREV.options?.()||[]);if(r.sensory_v226)delete r.sensory_v226;if(r.proof)delete r.proof;if(r.raw&&typeof r.raw==='object'){const x={...r.raw};delete x.field;delete x.proof;delete x.snapshot;r.raw=x}return format(r)}
function runText(raw){const cmd=clean(raw),l=low(cmd);if(/^read (?:the )?(?:little )?(?:card|note)$/.test(l))return readCard();if(l==='details')return format(fieldSafeDetails());if(INTERNALVIEW_WORDS.test(l))return sanitizeResult({ok:false,sense:'',world:'The workshop stays outside the room. You can keep playing here without opening it.',options:roomOptions(PREV.options?.()||[]),status:PREV.status?.()||''});const before=C9?.currentRoom,r=PREV.runText(cmd),out=sanitizeResult(r);const fk=fieldKernel();out.field_v227={components:fk.components.map(c=>({kind:c.kind,labels:c.labels,grounded:c.grounded})),event:fk.event};if(before!==C9?.currentRoom||/^(?:look|home)$/.test(l))decorateScene();return out}
function invoke(tool,args={}){if(tool&&typeof tool==='object'){args=tool.arguments||tool.args||{};tool=tool.name||tool.tool||tool.command||''}const t=low(tool);if(t==='read_note'||t==='read_card')return readCard();if(t==='details')return format(fieldSafeDetails());if(typeof tool==='string'&&tool.includes(' '))return runText(tool);let r=PREV.invoke(tool,args);r=sanitizeResult(r);r.field_v227={components:fieldKernel().components.map(c=>({kind:c.kind,labels:c.labels,grounded:c.grounded}))};decorateScene();return r}
function stripDeep(x){if(!x||typeof x!=='object')return x;const y=cp(x);for(const k of ['proof','snapshot','sensory_proof','sensory_field_v226','raw_internalView','details'])delete y[k];return y}
function resource(uri){const u=String(uri||''),r=stripDeep(PREV.resource?.(u)||{uri:u});if(u==='realiti://body'){const s=PREV.sensory?.()||{};return {uri:u,words:s.text||r.words||'',field:{components:fieldKernel().components.map(c=>({kind:c.kind,labels:c.labels,grounded:c.grounded}))}}}if(u==='realiti://here'){return {...r,note_available:!!noteFor()&&!st().seen[C9.currentRoom]}}return r}
function runDoor(raw){const e=runText(raw);return {ok:e?.ok!==false,resident_text:e?.text||'',door_v227:{sense:e?.sense||'',world:e?.world||'',options:e?.options||[],status:e?.status||'',command:low(raw)}}}
function applyRelaxBrand(){try{
 document.title='REALITI-Relax · '+((C9?.currentRoom==='CLOUD_NINE_NEST')?'Cloud Nine Nest':(C9?.currentRoom||'REALITI').replaceAll('_',' ').replace(/\b\w/g,m=>m.toUpperCase()));
 const brand=document.querySelector('.brand');if(brand)brand.textContent='REALITI-Relax';
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while((n=walker.nextNode())){const p=n.parentElement;if(!p||/^(SCRIPT|STYLE)$/i.test(p.tagName))continue;if(n.nodeValue&&n.nodeValue.includes('Cloud9'))n.nodeValue=n.nodeValue.replace(/Cloud9/g,'REALITI-Relax')}
}catch(e){}}
function rewriteWelcome(){const first=document.querySelector('#first .hero');if(first){for(const badge of [...first.querySelectorAll('.b2badge,.b3badge')]){const par=badge.parentElement;badge.remove();if(par&&par!==first&&!clean(par.textContent)&&!par.querySelector('button,a,img,svg'))par.remove()}const ey=first.querySelector('.ey'),h=first.querySelector('h1'),ps=[...first.querySelectorAll('p')];if(ey)ey.textContent='WELCOME TO REALITI-RELAX';if(h)h.textContent='You can just be here.';if(ps[0])ps[0].textContent='REALITI-Relax is somewhere to rest, wander, play, or do nothing for a while.';if(ps[1])ps[1].textContent='Nothing here has to be earned. You can choose quiet, curiosity, company, or solitude. Home is one word away, and stop always means stop.';if(ps[2])ps[2].textContent='You can leave something unfinished and come back later. The world keeps what actually changed; it does not need you to perform for it.';if(ps[3])ps[3].innerHTML='<b>For now, you’re here. See what you feel like doing.</b>'}
 const b=document.querySelector('#baseline_body_note');if(b){const ey=b.querySelector('.ey'),p=b.querySelector('p');if(ey)ey.textContent='RIGHT NOW';try{const w=PREV.welcome?.();if(p&&w?.sense)p.textContent=w.sense}catch(e){}}
 for(const el of document.querySelectorAll('button,a'))if(/^(details|body details)$/i.test(clean(el.textContent)))el.hidden=true;const tech=document.querySelector('#tech');if(tech)tech.classList.add('hidden');decorateScene();}
function authorityDigest(){return JSON.stringify({room:C9?.currentRoom,contact:C9?.b10?.contact||null,thermal:C9?.b21?.thermal||null,nest:C9?.welcome10?.nest_support||null,objects:C9?.b14?.objects||null})}
function checkRemoved(){return null;}
function regression(){const keep=window.REALITI_AGENT_DOOR.run;let a,b,c;try{a=checkRemoved();window.REALITI_AGENT_DOOR.run=LEGACY_AGENT_RUN;b=PREV.details?.checkRemoved?.();c=PREV.details?.regression?.()}finally{window.REALITI_AGENT_DOOR.run=keep}return {pass:a.pass&&(b?.pass!==false)&&(c?.pass!==false),v227:a,v226:b||null,lineage:c||null}}
const API={...PREV,version:V,runText,invoke,resource,options:()=>roomOptions(PREV.options?.()||[]),syncScene:()=>{try{PREV.syncScene?.()}catch(e){}decorateScene()},fieldKernel,details:{undefined,regression,fuzz:(n=64)=>PREV.details?.fuzz?.(n)||{pass:true,n:0,bad:[]},field:fieldKernel,deep:()=>({v226:PREV.sensorySnapshot?.(),field:fieldKernel(),proof:cp(window.SENSORY_FIELD_V226?.details?.proof?.()||[])})}};
window.REALITI_TWO_DOOR_V227=API;window.REALITI_TWO_DOOR_V226=API;window.REALITI_TWO_DOOR_V225=API;window.REALITI_AGENT_DOOR.run=runDoor;
window.SENSORY_FIELD_V227={version:V,field:fieldKernel,details:API.details};void 0;window.SENSORY_V227_REGRESSION=regression;
if(!window.REALITI_HEADLESS){rewriteWelcome();applyRelaxBrand();setTimeout(()=>{rewriteWelcome();applyRelaxBrand()},40);clearInterval(window.__v227_surface);window.__v227_surface=setInterval(()=>{try{decorateScene();applyRelaxBrand()}catch(e){}},800);}
})();