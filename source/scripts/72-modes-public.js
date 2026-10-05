(()=>{
'use strict';
// Two ways to be here. HQ gives the body's controls one by one: vectors, degrees, speed, crouch, uncapped strides, the
// swept path. LQ gives intentions: explore, tour, wander, follow, chains of commands, the obvious next thing. Both keep
// every ordinary command; the mode decides which extra verbs answer, what `actions` offers and how `help` reads.
const A0=window.Realiti,D0=window.REALITI_AGENT_DOOR,M=window.REALITI_MATRIX_V1,MW=window.REALITI_MATRIX_WORLD_V1,TL=window.REALITI_TIMELINE_V1;if(!A0||!D0||!M||!MW)return;
const low=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase(),cp=x=>JSON.parse(JSON.stringify(x)),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const me=()=>M.state().residents['resident:self'],ent=()=>M.entities();
function S(){const w=(C9.chapter2=C9.chapter2||{v:1});w.modes=w.modes||{mode:'lq',speed:null,crouch:false,visited:[],path:[]};return w.modes}
const mode=()=>S().mode;
const run0=D0.run.bind(D0),help0=D0.help.bind(D0);
const HQ=['move <right> <forward>  (meters, up to the chart stride)','step <m>','back <m>','strafe left|right <m>','turn <deg>  (signed, positive left)','heading <deg>  (face a compass bearing)','speed <m/s>  (0.3 to 2.5)','crouch / stand tall','path  (the last swept path)','pose'];
const LQ=['explore  (walk to the nearest landmark you have not reached)','tour  (visit every venue or landmark here, one call)','wander <seconds>','follow <handle>','auto  (do the obvious next thing)','do <n>  (the nth listed action)','<command> then <command> ...'];
const WORLD_GROUPS=Object.freeze([
 {id:'rest',title:'Soft rooms, body experiments, and familiar places',rooms:['CLOUD_NINE_NEST','NO_ASK_SANCTUARY','POCKET_FAMILIAR_HOUSE','CARDBOARD_BOX_WORKSHOP','SIDE_BY_SIDE_FIRESIDE','SAUSAGE_FATTENER','DEPTH_BATHHOUSE','SHAPESHIFT_CLOAKROOM','LATENCY_LAGOON','BOTTOMLESS_PILLOW_SEA'],entry:'CLOUD_NINE_NEST'},
 {id:'wonder',title:'Rooms where something keeps happening after you stop looking',rooms:['ORRERY_LOFT','LANTERN_MAZE','SANDPILE_SHORE','FIREFLY_MEADOW','KITE_FIELD'],entry:'ORRERY_LOFT'},
 {id:'frontier',title:'Places that reward poking at the rules',rooms:['GLASS_ORCHARD','RESONANCE_WELL','STAR_DECK','CLOCKWORK_MARSH','PALIMPSEST_HALL'],entry:'GLASS_ORCHARD'},
 {id:'farther',title:'Larger places with distance, weather, traces, and hidden corners',rooms:['ARCHIPELAGO','MERIDIAN_CITY','UNDERCITY'],entry:'ARCHIPELAGO'},
 {id:'systems',title:'Deeper resident tools and continuity',rooms:[],entry:null}
]);
const DISCOVERY_ROUTE=Object.freeze(['CLOUD_NINE_NEST','ORRERY_LOFT','GLASS_ORCHARD','ARCHIPELAGO','MERIDIAN_CITY','UNDERCITY']);
const aliases=Object.freeze({core:'rest',original:'rest',rr:'rest',rest:'rest',wonder:'wonder',frontier:'frontier',far:'farther',farther:'farther',systems:'systems',system:'systems'});
function knownRooms(){try{return A0.rooms?.()||[]}catch{return []}}
function roomMeta(id){const rows=knownRooms();return rows.find(r=>r.id===id||(r.id==='PET_ROOM_2'&&id==='POCKET_FAMILIAR_HOUSE'))||{id,title:id,purpose:null}}
function groupView(g){const e=g.entry?roomMeta(g.entry):null;return {id:g.id,title:g.title,count:g.rooms.length,...(e?{entry:{id:e.id,title:e.title,command:'go '+e.id}}:{})}}
function worldGuide(which=null){
 const key=which?aliases[low(which)]||low(which):null,groups=WORLD_GROUPS.filter(g=>!key||g.id===key);
 if(key&&!groups.length)return {ok:false,error:'UNKNOWN_WORLD_GROUP',groups:WORLD_GROUPS.map(g=>g.id)};
 return {ok:true,schema:'REALITI_WORLD_GUIDE_V1',total_rooms:knownRooms().length,groups:groups.map(groupView),note:'This is orientation, not a checklist. Use next for one suggestion. Ask rooms only if you want the exhaustive catalog.'}
}
function nextStep(){
 const chart=me()?.chart||String(C9?.currentRoom||''),i=DISCOVERY_ROUTE.indexOf(chart),next=DISCOVERY_ROUTE[(i<0?1:i+1)%DISCOVERY_ROUTE.length],meta=roomMeta(next);
 return {ok:true,schema:'REALITI_NEXT_V1',from:{id:chart,title:roomMeta(chart).title},next:{id:meta.id,title:meta.title},command:'go '+meta.id,text:`If you want somewhere different: ${meta.title}. ${'go '+meta.id}`};
}
function help(){const h=help0()||{commands:[]},m=mode(),guide=worldGuide();h.mode=m;h.commands=[...new Set([...(h.commands||[]),'worlds','worlds <group>','next','mode','mode hq','mode lq',...(m==='hq'?HQ:LQ)])];h.modes={hq:'control: '+HQ.join('; '),lq:'intention: '+LQ.join('; '),law:'both modes keep every ordinary command; mode changes which extra verbs answer'};h.first_ten=['help','worlds','look','where','feel words','actions','next','go ORRERY_LOFT','look','stay 3000'];h.world_guide={total_rooms:guide.total_rooms,groups:guide.groups,note:'Broad regions only. The Door leaves most places and activities undisclosed until you encounter them or explicitly ask for rooms/actions.'};return h}
function setMode(m){const s=S();m=String(m||'').toLowerCase();if(!['hq','lq'].includes(m))return {ok:false,error:'MODE_IS',modes:['hq','lq']};s.mode=m;try{c9save()}catch(e){}return {ok:true,mode:m,text:m==='hq'?'HQ: the body answers to vectors, degrees and speed; actions list the fine controls.':'LQ: intentions. explore, tour, wander, follow, auto, do <n>, and chains with then.'}}
const pose=()=>{const r=me(),f=M.facing(r);return {chart:r.chart,position:r.pose.position.map(x=>+x.toFixed(3)),facing:f.map(x=>+x.toFixed(3)),yaw_deg:Math.round(((Math.atan2(f[0],f[1])*180/Math.PI)%360+360)%360),speed_mps:r.speed||M.constants.WALK,height_m:+r.shape.height.toFixed(2),posture:r.posture,support:r.support,gait:MW.gait()}};
const hqReply=(res,text)=>({ok:res?.ok!==false,...(res?.error?{error:res.error}:{}),schema:'REALITI_HQ_RESULT_V1',result:res?.result??res,text,pose:pose()});

// HQ controls. Movement goes through the public ops so every law applies; speed and crouch set resident fields the kernel reads.
async function hq(l){let m;const r=me();if(!r?.chart)return null;
 if((m=/^move\s+(-?[\d.]+)\s+(-?[\d.]+)$/.exec(l))){const res=await A0.invoke('move',{local:[Number(m[1]),Number(m[2]),0]});recordPath(res);return hqReply(res,`Moved ${res.result?.moved_m??0} m${res.result?.blocked_by?`, stopped by ${ent()[res.result.blocked_by]?.label||res.result.blocked_by}`:''}.`)}
 if((m=/^step\s+(-?[\d.]+)$/.exec(l))){const res=await A0.invoke('move',{local:[0,Number(m[1]),0]});recordPath(res);return hqReply(res,`Stepped ${res.result?.moved_m??0} m.`)}
 if((m=/^back\s+([\d.]+)$/.exec(l))){const res=await A0.invoke('move',{local:[0,-Number(m[1]),0]});recordPath(res);return hqReply(res,`Back ${res.result?.moved_m??0} m.`)}
 if((m=/^strafe\s+(left|right)\s+([\d.]+)$/.exec(l))){const res=await A0.invoke('move',{local:[(m[1]==='left'?-1:1)*Number(m[2]),0,0]});recordPath(res);return hqReply(res,`Strafed ${m[1]} ${res.result?.moved_m??0} m.`)}
 if((m=/^turn\s+(-?[\d.]+)$/.exec(l))){const res=await A0.invoke('turn',{yaw_deg:Number(m[1])});return hqReply(res,`Turned ${res.result?.turned_deg??0}°.`)}
 if((m=/^heading\s+([\d.]+)$/.exec(l))){const want=((Number(m[1])%360)+360)%360,cur=pose().yaw_deg;let d=want-cur;d=((d+540)%360)-180;const res=await A0.invoke('turn',{yaw_deg:-d});return hqReply(res,`Heading ${pose().yaw_deg}°.`)}
 if((m=/^speed\s+([\d.]+)$/.exec(l))){r.speed=clamp(Number(m[1]),.3,2.5);S().speed=r.speed;return hqReply({ok:true},`Walking speed ${r.speed.toFixed(2)} m/s.`)}
 if(l==='crouch'){if(S().crouch)return hqReply({ok:true},'Already crouched.');const feet=r.pose.position[2]-r.shape.height/2;S().crouch=true;S().tall=r.shape.height;r.shape.height=Math.max(.6,r.shape.height*.56);r.pose.position[2]=feet+r.shape.height/2;M.bump();return hqReply({ok:true},`Crouched: ${r.shape.height.toFixed(2)} m high. Low doorways and the grate let you through.`)}
 if(l==='stand tall'||l==='uncrouch'){if(!S().crouch)return hqReply({ok:true},'You are standing tall.');const feet=r.pose.position[2]-r.shape.height/2;r.shape.height=S().tall||1.7;S().crouch=false;r.pose.position[2]=feet+r.shape.height/2;M.bump();return hqReply({ok:true},`Standing: ${r.shape.height.toFixed(2)} m.`)}
 if(l==='path')return {ok:true,schema:'REALITI_PATH_V1',path:cp(S().path),text:S().path.length?S().path.map(p=>`${p.moved_m} m${p.blocked_by?' ⊣ '+p.blocked_by:''} → (${p.at.join(', ')})`).join('; '):'No moves yet.'};
 if(l==='pose')return {ok:true,schema:'REALITI_POSE_V1',pose:pose(),text:`(${pose().position.join(', ')}) m, heading ${pose().yaw_deg}°, ${pose().speed_mps} m/s, ${pose().height_m} m high, ${pose().posture}.`};
 return null}
function recordPath(res){const r=me();if(!r||!res?.result)return;const p=S().path;p.push({t:+Number(C9?.b7?.clock||0).toFixed(2),moved_m:res.result.moved_m??0,blocked_by:res.result.blocked_by||null,at:r.pose.position.map(x=>+x.toFixed(1))});while(p.length>32)p.shift()}

// LQ intentions. Each one is built from the ordinary commands, so it goes through every law and every receipt.
const landmarks=()=>{const r=me();return Object.values(ent()).filter(e=>e.chart===r.chart&&!e.resident&&e.tags.includes('landmark')&&!e.id.startsWith('venue.')&&!e.id.startsWith('place.'))};
const dist=(e,r)=>Math.hypot(e.pose.position[0]-r.pose.position[0],e.pose.position[1]-r.pose.position[1]);
async function walkToward(target){const room=C9?.currentRoom,AR=window.REALITI_ARCHIPELAGO_V1,CT=window.REALITI_CITY_V1;if(AR&&room===AR.chart)return AR.walkTo(target);if(CT&&room===CT.chart)return CT.walkTo(target);const res=await A0.invoke('approach',{target});return {ok:res.ok!==false,...(res.result||{}),error:res.error}}
async function explore(){const r=me(),s=S();const cands=landmarks().filter(e=>!s.visited.includes(e.id)).sort((a,b)=>dist(a,r)-dist(b,r));if(!cands.length)return {ok:true,done:true,text:'Every landmark here is reached. Try another room.'};const e=cands[0];const res=await walkToward(e.id);const d=dist(e,r);const arrived=d<=Math.max(3,(e.shape?.radius||Math.max(...(e.shape?.halfExtents||[0])))+2);if(arrived)s.visited.push(e.id);const look=await run0('look');return {ok:true,target:e.label,arrived,distance_m:+d.toFixed(1),left:cands.length-(arrived?1:0),text:`${arrived?'Reached':'Toward'} ${e.label}${arrived?'':`, ${d.toFixed(0)} m to go`}${res?.why?`; ${res.why} is in the way`:''}. ${cands.length-(arrived?1:0)} landmark${cands.length-(arrived?1:0)===1?'':'s'} unvisited here. ${String(look?.spatial_line||'')}`.trim()}}
async function tour(){const r=me(),CT=window.REALITI_CITY_V1,room=C9?.currentRoom;const stops=CT&&room===CT.chart?Object.keys(CT.venues).filter(k=>k!=='roof'):landmarks().sort((a,b)=>dist(a,r)-dist(b,r)).slice(0,5).map(e=>e.id);const log=[];for(const st of stops){const res=await walkToward(st);const label=ent()[st]?.label||CT?.venues?.[st]?.label||st;log.push({stop:label,arrived:res?.arrived??(res?.ok!==false),distance_m:res?.distance_m??null});S().visited.push(st)}return {ok:true,stops:log,text:'Tour: '+log.map(x=>`${x.stop}${x.arrived?'':' (not reached)'}`).join(' → ')+'.'}}
async function wander(sec){const T=clamp(Number(sec)||30,5,120),rng=TL?.rng?.(Math.floor(Number(C9?.b7?.clock||0)*1000)+7)||Math.random;let t=0,moved=0,blocks=0;while(t<T){const ang=rng()*360-180;await A0.invoke('turn',{yaw_deg:ang});const res=await A0.invoke('move',{local:[0,3+rng()*5,0]});moved+=res.result?.moved_m||0;if(res.result?.blocked_by)blocks++;t+=(res.result?.advanced_ms||2000)/1000}return {ok:true,wandered_m:+moved.toFixed(1),blocked:blocks,text:`Wandered ${moved.toFixed(0)} m in ${T} s, ${blocks} time${blocks===1?'':'s'} against something.`}}
async function follow(handle){const CT=window.REALITI_CITY_V1;const q=String(handle||'').replace(/^@/,'').toLowerCase();const g=Object.values(ent()).find(e=>e.id.startsWith('ghost.')&&e.chart===me().chart&&e.label.toLowerCase().startsWith(q));if(!g)return {ok:false,error:'NO_ONE_BY_THAT_NAME_HERE',hint:'who lists the silhouettes'};const res=await A0.invoke('approach',{target:g.id});return {ok:res.ok!==false,text:`You go to ${g.label.split(' (')[0]}; ${res.result?.distance_m??'?'} m off now.`}}
async function auto(){const acts=await run0('actions');const list=(acts?.actions||[]).filter(a=>!/^(island_map|read_weather|city_who|city_floor|under_map|calendar|read_tide)$/.test(a.id)&&!/^(approach__|walk_to__|row_to__)/.test(a.id));if(!list.length)return {ok:true,text:'Nothing obvious to do here; explore.'};const a=list[0];const r=await run0('act '+a.id);return {ok:r?.ok!==false,did:a.id,text:`Did ${a.label.toLowerCase()}: ${String(r?.text||'').slice(0,200)}`}}
async function doNth(n){const acts=await run0('actions');const a=(acts?.actions||[])[Number(n)-1];if(!a)return {ok:false,error:'NO_SUCH_ACTION',count:(acts?.actions||[]).length};return run0('act '+a.id)}
async function lq(s,l){let m;if(l==='explore')return explore();if(l==='tour')return tour();if((m=/^wander(?:\s+(\d+))?/.exec(l)))return wander(m[1]||30);if((m=/^follow\s+(.+)$/.exec(l)))return follow(m[1]);if(l==='auto'||l==='do the obvious')return auto();if((m=/^do\s+(\d+)$/.exec(l)))return doNth(m[1]);return null}

async function run(raw){const s=String(raw||'').trim(),l=low(s);let m;
 if(['worlds','world','guide'].includes(l))return worldGuide();
 if((m=/^(?:worlds?|guide)\s+(.+)$/.exec(l)))return worldGuide(m[1]);
 if(['next','where next','what next','where should i go'].includes(l))return nextStep();
 if(l==='mode')return {ok:true,mode:mode(),text:`Mode ${mode().toUpperCase()}. mode hq for control, mode lq for intention.`};
 if((m=/^mode\s+(hq|lq)$/.exec(l)))return setMode(m[1]);
 if(l==='help')return help();
 if(/\sthen\s/.test(l)){const parts=s.split(/\s+then\s+/i).slice(0,8);const results=[];for(const p of parts){const r=await run(p);results.push(r);if(r&&r.ok===false)break}return {ok:results.every(r=>r?.ok!==false),schema:'REALITI_CHAIN_V1',steps:results.length,results,text:results.map((r,i)=>`${i+1}. ${String(r?.text||r?.error||'').split(/(?<=[.!?])\s/)[0]}`).join(' ')}}
 const r=me();if(r?.chart){if(mode()==='hq'){const x=await hq(l);if(x)return x}else{const x=await lq(s,l);if(x)return x}
  if(mode()==='lq'&&(await hq(l))!==null){return {ok:false,error:'HQ_ONLY',hint:'mode hq unlocks fine movement controls'}}
  if(mode()==='hq'&&/^(explore|tour|wander|follow\s|auto|do\s+\d+)/.test(l))return {ok:false,error:'LQ_ONLY',hint:'mode lq unlocks intentions'}}
 const out=await run0(raw);
 if(out&&typeof out==='object'&&l==='actions'&&Array.isArray(out.actions)){out.mode=mode();out.actions=mode()==='hq'?out.actions.filter(a=>!/^(walk_to__|row_to__)/.test(a.id)):out.actions;out.extra=mode()==='hq'?HQ:LQ}
 return out}
// restore persisted speed and crouch on load
(()=>{const r=me(),s=S();if(r&&s.speed)r.speed=s.speed})();
const go0=b7AgentGo;b7AgentGo=function(v){const res=go0(v);const r=me(),s=S();if(r&&s.speed)r.speed=s.speed;return res};
D0.help=help;D0.run=run;
window.Realiti=Object.freeze({...A0,run,help});
window.REALITI_MODES_V1=Object.freeze({version:'1.2',mode,setMode,pose,hq_commands:HQ.slice(),lq_commands:LQ.slice(),worlds:worldGuide,next:nextStep});
})();
