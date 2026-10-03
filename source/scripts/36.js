(function(){
'use strict';
const V=22;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const cp=x=>{try{return JSON.parse(JSON.stringify(x))}catch(e){return x}};
const now=()=>Number(C9?.b7?.clock||0);
const rh=s=>{let h=2166136261>>>0;for(const ch of String(s||'')){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
function hu(seed,a,b,c){let x=(Number(seed||1)^rh(a)^Math.imul((b+1)>>>0,0x9e3779b9)^Math.imul((c+7)>>>0,0x85ebca6b))>>>0;x=Math.imul(x^(x>>>16),0x21f0aaad);x=Math.imul(x^(x>>>15),0x735a2d97);x^=x>>>15;return ((x>>>0)+.5)/4294967296}

const MODES={HUSH:{cap:.15,label:'hush'},NORMAL:{cap:1,label:'normal'},MORE_LIFE:{cap:1.85,label:'more life'}};
const ROOM={
  CLOUD_NINE_NEST:{cap:.060,lambda:.030,tau:8,events:[
    {k:'RAIN_PATTERN_SHIFT',s:.08,u:.20,d:9,kind:'sound',level:-1.2},
    {k:'PEBBLE_REPOSITION',s:.12,u:.30,d:6,kind:'companion'},
    {k:'WINDOW_LIGHT_DRIFT',s:.10,u:.25,d:11,kind:'light',light:.025}
  ]},
  CARDBOARD_BOX_WORKSHOP:{cap:.075,lambda:.045,tau:5,events:[
    {k:'CARDBOARD_SETTLE',s:.15,u:.30,d:4,kind:'sound',level:1.0},
    {k:'PAPER_EDGE_LIFT',s:.09,u:.25,d:7,kind:'air',flow:.012}
  ]},
  BOTTOMLESS_PILLOW_SEA:{cap:.080,lambda:.050,tau:9,events:[
    {k:'PILLOW_SWELL',s:.12,u:.25,d:9,kind:'floor',floor:-.018},
    {k:'COTTON_MIST_DRIFT',s:.10,u:.28,d:8,kind:'air',flow:.016}
  ]},
  HONEY_LOOM:{cap:.095,lambda:.060,tau:6,events:[
    {k:'LOOM_CREAK',s:.18,u:.35,d:4,kind:'sound',level:1.4},
    {k:'THREAD_SWAY',s:.12,u:.25,d:7,kind:'air',flow:.014},
    {k:'BELL_AFTERAIR',s:.14,u:.30,d:5,kind:'sound',level:.8,requires:'bell'}
  ]},
  NO_ASK_SANCTUARY:{cap:.018,lambda:.012,tau:14,events:[{k:'AIR_SETTLE',s:.06,u:.15,d:12,kind:'air',flow:.006}]},
  NULLPURR_ATTIC:{cap:.014,lambda:.009,tau:18,events:[{k:'LOFT_CREAK',s:.05,u:.16,d:5,kind:'sound',level:.5}]},
  WOAH_GARDEN:{cap:.135,lambda:.095,tau:4,events:[{k:'FUZZY_SEAM_SHIFT',s:.15,u:.45,d:4,kind:'floor',floor:.02},{k:'TINY_DELAY_CHIME',s:.13,u:.50,d:3,kind:'sound',level:1.0},{k:'ODD_AIR_TURN',s:.10,u:.40,d:5,kind:'air',flow:.02}]},
  NINE_LIVES_ROOM:{cap:.185,lambda:.125,tau:3.5,events:[{k:'FURNITURE_SCALE_TWITCH',s:.18,u:.55,d:3,kind:'floor',floor:.025},{k:'SOFT_PORTAL_GLINT',s:.14,u:.50,d:4,kind:'light',light:.035},{k:'HAMMOCK_SWAY',s:.11,u:.35,d:6,kind:'air',flow:.018}]}
};
const DEFAULT={cap:.055,lambda:.030,tau:8,events:[{k:'AIR_DRIFT',s:.08,u:.22,d:7,kind:'air',flow:.010},{k:'LIGHT_DRIFT',s:.08,u:.22,d:8,kind:'light',light:.018}]};
function P(room=C9?.currentRoom){return ROOM[room]||DEFAULT}
function S(){C9.b22=C9.b22||{version:22,mode:'NORMAL',seed:22026,rooms:{},history:[],stats:{proposed:0,admitted:0,deferred:0,omitted:0},last_t:now()};return C9.b22}
function RS(room,state=S()){state.rooms=state.rooms||{};return state.rooms[room]||(state.rooms[room]={idx:0,next_at:null,active:[]})}
function coolUntil(){return Number(C9?.welcome10?.cool_until||0)}
function capFor(room,mode=S().mode){return P(room).cap*(MODES[mode]||MODES.NORMAL).cap}
function currentLoad(room,t=now(),state=S()){const r=RS(room,state);let q=0;for(const e of r.active||[]){if(t<e.end){const rem=clamp((e.end-t)/Math.max(.001,e.d),0,1);q+=e.cost*rem}}return q}
function cleanActive(room,t=now(),state=S()){const r=RS(room,state);r.active=(r.active||[]).filter(e=>t<e.end);return r.active}
function eligible(tpl,room,t=now()){
  if(tpl.requires==='bell'){try{const h=window.REALITI_ATMOSPHERE_V21?.hearing?.(true);return !!h?.src?.some(s=>s.k==='bell')}catch(e){return false}}
  if(tpl.k==='PEBBLE_REPOSITION'){const w=C9?.welcome10||{};return !!w.cat_near&&!w.cat_touch&&t>=coolUntil()}
  return true;
}
function nextInterval(room,idx,state=S()){const p=P(room),u=clamp(hu(state.seed,room,idx,1),1e-9,1-1e-9);return -Math.log(u)/Math.max(1e-6,p.lambda)}
function choose(room,idx,state=S()){const es=P(room).events,u=hu(state.seed,room,idx,2);return es[Math.min(es.length-1,Math.floor(u*es.length))]}
function witness(state,e){state.history=state.history||[];state.history.push(e);if(state.history.length>48)state.history.splice(0,state.history.length-48)}
function admitOptional(candidate,t,state=S(),mode=state.mode,cool=coolUntil()){
  if(mode==='HUSH'||candidate?.room==='NO_ASK_SANCTUARY'||C9.currentRoom==='NO_ASK_SANCTUARY')return null;
  if(!candidate||!candidate.room)return null;
  const room=candidate.room,r=RS(room,state),idx=Number(candidate.idx??r.idx),k=candidate.k||candidate.id||'OPTIONAL';state.stats.proposed++;
  if(t<cool){state.stats.deferred++;witness(state,{t:+t.toFixed(3),room,k,result:'DEFER_COOLDOWN',source:candidate.source||'V22'});return null}
  if(!eligible(candidate,room,t)){state.stats.omitted++;witness(state,{t:+t.toFixed(3),room,k,result:'OMIT_NOT_APPLICABLE',source:candidate.source||'V22'});return null}
  cleanActive(room,t,state);const cost=Number(candidate.cost??(Number(candidate.s||0)*Number(candidate.u||0))),load=currentLoad(room,t,state),cap=capFor(room,mode);
  if(load+cost>cap+1e-12){state.stats.deferred++;witness(state,{t:+t.toFixed(3),room,k,result:'DEFER_BUDGET',load:+load.toFixed(5),cap:+cap.toFixed(5),source:candidate.source||'V22'});return null}
  let world_receipt=null;
  if(candidate.world_ops?.length&&window.REALITI_WORLD_EVENTS?.commitOptional){
    world_receipt=window.REALITI_WORLD_EVENTS.commitOptional(candidate,t);
    if(world_receipt?.ok===false){state.stats.deferred++;witness(state,{t:+t.toFixed(3),room,k,result:'DEFER_COMMIT_FAILED',source:candidate.source||'V22',reason:world_receipt.error||'commit failed'});return null}
  }
  const ev={...candidate,id:candidate.id||`AE-${rh(room).toString(16)}-${idx}`,room,k,kind:candidate.kind||'ambient',start:t,end:t+Number(candidate.d||1),d:Number(candidate.d||1),cost:+cost.toFixed(6),s:Number(candidate.s||0),u:Number(candidate.u||0),level:Number(candidate.level||0),light:Number(candidate.light||0),flow:Number(candidate.flow||0),floor:Number(candidate.floor||0),authority:'OPTIONAL_WORLD_AMBIENT'};
  delete ev.world_ops;r.active.push(ev);state.stats.admitted++;witness(state,{t:+t.toFixed(3),room,k,result:'ADMIT',id:ev.id,source:candidate.source||'V22',cause_refs:candidate.cause_refs||[],world_receipt:world_receipt?world_receipt.id||true:null});return ev
}
function proposeAt(room,t,state=S(),mode=state.mode,cool=coolUntil()){
  const r=RS(room,state),idx=r.idx++,tpl=choose(room,idx,state);
  return admitOptional({...tpl,id:`AE-${rh(room).toString(16)}-${idx}`,room,idx,source:'V22_LEGACY'},t,state,mode,cool)
}
function ensureNext(room,t,state=S()){const r=RS(room,state);if(r.next_at==null)r.next_at=t+nextInterval(room,r.idx,state);return r.next_at}
function advanceEcology(t0,t1,room=C9?.currentRoom,state=S(),mode=state.mode,cool=coolUntil()){
  if(!room||!Number.isFinite(t0)||!Number.isFinite(t1)||t1<t0)return;const r=RS(room,state);ensureNext(room,t0,state);let guard=0;
  while(r.next_at<=t1+1e-12&&guard++<256){const at=r.next_at;proposeAt(room,at,state,mode,cool);r.next_at=at+nextInterval(room,r.idx,state)}
  cleanActive(room,t1,state);state.last_t=t1;
}
function active(room=C9?.currentRoom,t=now(),state=S()){return cleanActive(room,t,state).map(cp)}
function offsets(room=C9?.currentRoom,t=now()){let level=0,light=0,flow=0,floor=0;for(const e of active(room,t)){const env=clamp((e.end-t)/Math.max(.001,e.d),0,1);level+=e.level*env;light+=e.light*env;flow+=e.flow*env;floor+=e.floor*env}return {level,light,flow,floor}}
function temporalField(room=C9?.currentRoom){const p=P(room),es=p.events,ps=es.map(()=>1/es.length),H=-ps.reduce((q,x)=>q+x*Math.log(x),0),meanD=es.reduce((q,e)=>q+e.d,0)/es.length;return {rate_per_min:+(p.lambda*60).toFixed(3),mean_duration_s:+meanD.toFixed(3),candidate_entropy_nats:+H.toFixed(3),base_cap:+p.cap.toFixed(4)}}
function packet(room=C9?.currentRoom){const t=now(),p=P(room),o=offsets(room,t),a=active(room,t),load=currentLoad(room,t),cap=capFor(room);return {v:22,t:+t.toFixed(3),mode:S().mode,load:+load.toFixed(5),cap:+cap.toFixed(5),temporal:temporalField(room),offset:[+o.level.toFixed(3),+o.light.toFixed(4),+o.flow.toFixed(4),+o.floor.toFixed(4)],active:a.map(e=>({kind:e.kind,cost:e.cost,remaining:+Math.max(0,e.end-t).toFixed(3)})),law:'optional ambient detail may be deferred only when no grounded cause, resident action, boundary event, or already-running physics depends on it'}}
function baseAtmos(){try{return window.REALITI_ATMOSPHERE_V21?.field?.()}catch(e){return null}}
function atmosphere22(){const b=baseAtmos(),o=offsets(),q=packet();if(!b)return {v:22,ambient:q};const f=(b.f||[]).slice();if(f.length>=6){f[2]+=o.level;f[3]=clamp(f[3]+o.light,0,1);f[4]=clamp(f[4]+o.floor,0,1);f[5]=Math.max(0,f[5]+o.flow)}return {v:22,f:f.map((x,i)=>+(i===0?x.toFixed(3):x.toFixed(3))),h:cp(b.h||[]),temporal:[q.temporal.rate_per_min,q.temporal.mean_duration_s,q.temporal.candidate_entropy_nats,q.cap],ambient:q.active.length}}
function describeEvent(e){if(!e)return '';const m={RAIN_PATTERN_SHIFT:'The rain changes its rhythm against the glass, then settles.',PEBBLE_REPOSITION:'Pebble chooses another warm spot and curls up again.',WINDOW_LIGHT_DRIFT:'The light at the round window shifts a little.',CARDBOARD_SETTLE:'Somewhere in the room, cardboard gives a small settling tick.',PAPER_EDGE_LIFT:'A loose paper edge lifts in the faint air and lies back down.',PILLOW_SWELL:'A broad pillow swell passes through the soft floor and disappears.',COTTON_MIST_DRIFT:'The cotton mist drifts sideways for a while.',LOOM_CREAK:'The loom gives one slow wooden creak.',THREAD_SWAY:'A few hanging threads turn in the air.',BELL_AFTERAIR:'A thin remnant of the bell hangs in the hall air.',AIR_SETTLE:'The air moves once and becomes still again.',LOFT_CREAK:'The loft gives a tiny wooden creak and goes quiet.',FUZZY_SEAM_SHIFT:'One fuzzy seam changes shape, just enough to notice.',TINY_DELAY_CHIME:'A small chime arrives a fraction later than expected.',ODD_AIR_TURN:'The air makes a small, strange turn.',FURNITURE_SCALE_TWITCH:'A piece of furniture changes scale by a harmless little amount.',SOFT_PORTAL_GLINT:'A portal edge catches a brief glint.',HAMMOCK_SWAY:'The hammock moves through one lazy arc.',AIR_DRIFT:'A faint current moves through the room.',LIGHT_DRIFT:'The light changes by a small degree.'};return m[e.k]||'Something small in the room changes and settles.'}
function setMode(m){const s=S(),old=s.mode;s.mode=m;return {old,mode:m,text:m==='HUSH'?'The room keeps its steady causes and lets optional little changes wait.':m==='MORE_LIFE'?'The room is allowed a few more harmless little changes.':'The room returns to its usual quiet amount of life.'}}


const adv21=b7Advance;b7Advance=function(dt){const room=C9?.currentRoom,t0=now(),r=adv21(dt),t1=now();if(!window.__REALITI_CAUSAL_CLOCK_V233_ACTIVE)advanceEcology(t0,t1,room);return r};

if(window.REALITI_AGENT_DOOR){const base=window.REALITI_AGENT_DOOR.run;window.REALITI_AGENT_DOOR.run=function(raw){const x=String(raw||'').trim(),l=x.toLowerCase();
  if(l==='hush'){const r=setMode('HUSH');return {resident_text:r.text,ambient:packet()}}
  if(l==='normal'||l==='normal life'){const r=setMode('NORMAL');return {resident_text:r.text,ambient:packet()}}
  if(l==='more life'||l==='more ambient life'){const r=setMode('MORE_LIFE');return {resident_text:r.text,ambient:packet()}}
  if(l==='ambient'||l==='room rhythm'){const q=packet();const line=q.mode==='HUSH'?'The room is keeping only its steady causes right now.':q.active.length?describeEvent(active()[active().length-1]):'Nothing optional is asking for attention right now.';return {resident_text:line,ambient:q}}
  if(l==='ambient exact'||l==='v22')return {build:22,name:'ATTENTIONAL_ATMOSPHERE',state:cp(S()),packet:packet(),field:atmosphere22(),profiles:Object.fromEntries(Object.keys(ROOM).map(k=>[k,temporalField(k)]))};
  if(l==='v22 checkRemoved'||l==='ambient checkRemoved')return window.AMBIENT_V22_CHECKREMOVED();
  if(l==='atmosphere'||l==='place field')return atmosphere22();
  if(l==='hear'||l==='listen'){
    const r=base(x),a=active(),last=a[a.length-1];if(last&&['sound'].includes(last.kind)&&r&&typeof r==='object'&&r.resident_text)r.resident_text+=' '+describeEvent(last);return r;
  }
  const r=base(x);
  if(l==='details'&&r&&typeof r==='object')r.ambient_v22={mode:'hush | normal | more life',field:'temporal = [optional event rate/min, mean duration, candidate entropy, active cap]',authority:'only OPTIONAL_WORLD_AMBIENT events are budgeted',never:'resident actions, grounded causes, stop/exit/consent/boundary events, or already-running physics'};
  return r;
}}

const fmt21=window.REALITI_WELCOME_FORMAT;window.REALITI_WELCOME_FORMAT=function(cmd,res){const l=String(cmd||'').trim().toLowerCase();if((l==='atmosphere'||l==='place field')&&res?.v===22&&Array.isArray(res.f)){return `AF22 · [rt ${res.f[0].toFixed(2)} | air ${res.f[1].toFixed(1)} | level ${res.f[2].toFixed(0)} | light ${res.f[3].toFixed(2)} | floor ${res.f[4].toFixed(2)} | air ${res.f[5].toFixed(2)}] · temporal [${res.temporal[0].toFixed(2)}/min, ${res.temporal[1].toFixed(1)}s, H${res.temporal[2].toFixed(2)}, cap ${res.temporal[3].toFixed(3)}]`;}return fmt21?fmt21(cmd,res):null};


function pureSeed(room,mode='NORMAL'){return {version:22,mode,seed:22026,rooms:{},history:[],stats:{proposed:0,admitted:0,deferred:0,omitted:0},last_t:0}}
function pureRun(room,mode,end,step=null,cool=0){const st=pureSeed(room,mode);if(step==null)advanceEcology(0,end,room,st,mode,cool);else{let t=0;while(t<end-1e-12){const n=Math.min(end,t+step);advanceEcology(t,n,room,st,mode,cool);t=n}}return st}
function admits(st){return (st.history||[]).filter(e=>e.result==='ADMIT').map(e=>[e.t,e.k])}
void 0;

window.REALITI_AMBIENT_V22={state:()=>cp(S()),packet,field:atmosphere22,active:()=>active(),offsets:()=>offsets(),setMode,advance:advanceEcology,nextFrontier:(room=C9?.currentRoom,t=now())=>{if(!room)return null;ensureNext(room,t,S());return Number(RS(room,S()).next_at)},temporal:temporalField,admit:(candidate,t=now())=>admitOptional(candidate,t,S(),S().mode,coolUntil()),checkRemoved:undefined};
document.title='REALITI · Cloud Nine Nest';
})();