(()=>{
'use strict';
const PREV=window.REALITI_TWO_DOOR_V233||window.REALITI_TWO_DOOR_V231;
if(!PREV)return;
const V='23.4', PILLOW='BOTTOMLESS_PILLOW_SEA', NEST='CLOUD_NINE_NEST';
const SOURCE='PILLOW_SEA_SUPPORT', CAUSE='PILLOW_SEA:SOFT_ENVELOPE';
const cp=x=>{try{return JSON.parse(JSON.stringify(x))}catch(e){return x}};
const low=x=>String(x||'').replace(/\s+/g,' ').trim().toLowerCase();
const now=()=>Number(C9?.b7?.clock||0);
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,Number(x)||0));
const TAU=[.45,4,28];
const POSTURES={
 EDGE:{depth:0,enclosure:0,eq:0,counts:{}},
 SURFACE:{depth:.30,enclosure:.22,eq:.72,counts:{'torso.upper_back':3,'torso.mid_back':4,'torso.lower_back':4,'pelvis.seat':4,'leg.L.thigh':3,'leg.R.thigh':3,'leg.L.shin':1,'leg.R.shin':1}},
 BURIED:{depth:.86,enclosure:.94,eq:.84,counts:{'head.crown':2,'head.nape':2,'shoulder.L':2,'shoulder.R':2,'arm.L.upper':2,'arm.R.upper':2,'torso.upper_back':4,'torso.mid_back':4,'torso.lower_back':4,'pelvis.seat':4,'leg.L.thigh':3,'leg.R.thigh':3,'leg.L.shin':2,'leg.R.shin':2}},
 TUNNEL:{depth:.68,enclosure:.76,eq:.78,counts:{'head.nape':1,'shoulder.L':3,'shoulder.R':3,'arm.L.upper':3,'arm.R.upper':3,'torso.upper_back':3,'torso.mid_back':4,'torso.lower_back':3,'pelvis.seat':3,'leg.L.thigh':2,'leg.R.thigh':2}},
 BOUNCE:{depth:.18,enclosure:.10,eq:.48,counts:{'torso.lower_back':2,'pelvis.seat':4,'leg.L.thigh':2,'leg.R.thigh':2,'foot.L.sole':2,'foot.R.sole':2}}
};
function S(){
 C9.b234=C9.b234||{version:V,pillow:{posture:'EDGE',entered:false,action_t:now(),modes:[0,0,0],last_refresh:-1,seq:0},narration:{cat_live:false,pillow_sig:null},last_transition:null,observations:[],stats:{pillow_actions:0,contact_reconstructions:0,delta_suppressed:0}};
 const s=C9.b234;s.pillow=s.pillow||{posture:'EDGE',entered:false,action_t:now(),modes:[0,0,0],last_refresh:-1,seq:0};s.narration=s.narration||{cat_live:false,pillow_sig:null};s.observations=s.observations||[];return s;
}
function pillow(){return S().pillow}
function setPosture(posture,modes){const p=pillow();p.posture=POSTURES[posture]?posture:'EDGE';p.entered=C9?.currentRoom===PILLOW;p.action_t=now();p.modes=(modes||[0,0,0]).slice(0,3);while(p.modes.length<3)p.modes.push(0);p.last_refresh=-1;p.next_due=-1;p.last_input={};p.seq++;S().stats.pillow_actions++;return p}
function modeValue(t=now()){const p=pillow(),dt=Math.max(0,t-Number(p.action_t||t));return p.modes.reduce((s,a,i)=>s+Number(a||0)*Math.exp(-dt/TAU[i]),0)}
function cfg(){return POSTURES[pillow().posture]||POSTURES.EDGE}
function reconstructed(){
 const c=cfg(),m=modeValue(),points=[],zoneTotals={};
 const sum=Object.values(c.counts).reduce((a,b)=>a+b,0)||1;
 for(const [z,n] of Object.entries(c.counts))for(let i=0;i<n;i++){const phase=((i+1)/(n+1)-.5),w=(.76+.18*Math.cos(phase*Math.PI))*c.eq*(1+.55*m);points.push({zone:z,w:+w.toFixed(4),latent_lobe:z.split('.')[0]});zoneTotals[z]=(zoneTotals[z]||0)+w/n}
 return {posture:pillow().posture,depth:c.depth,enclosure:c.enclosure,modes:pillow().modes.slice(),mode_value:+m.toFixed(5),point_count:points.length,points,zoneTotals,budget:{latent_lobes:Object.keys(c.counts).length,stored_modes:3,explicit_pillows:0},law:'many contact samples reconstructed from a reduced soft-envelope proxy'};
}
function ours(q){return q&&q._b10_grounded_source===SOURCE&&q._b10_grounded_cause===CAUSE}
function releasePillow(reason='left_pillow_sea',commit=true){
 const t=now();let n=0;for(const q of Object.values(C9?.b7?.zones||{})){if(!ours(q))continue;q._b10_grounded_value=0;q._b10_grounded_until=t-1e-6;q.observed=0;q.innovation=-Number(q.predicted||0);n++}
 const p=pillow();p.entered=false;p.grounded=false;p.last_refresh=-1;p.next_due=-1;p.last_input={};if(C9?.currentRoom!==PILLOW)p.posture='EDGE';S().last_transition={t,kind:'PILLOW_RELEASE',reason,zones:n};if(commit)try{window.REALITI_HAPTIC_FIELD_V20?.record?.()}catch(e){};return n;
}

const QIN=.004,LEASE_PAD=.36,HORIZON=60;
function inputFor(v0){return clamp(.035+.16*v0,.035,.22)}
function zoneGain(){const c=cfg();let g=0;for(const [z,n] of Object.entries(c.counts)){let base=0;for(let i=0;i<n;i++){const phase=((i+1)/(n+1)-.5);base+=(.76+.18*Math.cos(phase*Math.PI))*c.eq}base/=n;g=Math.max(g,.16*base*.55)}return g}
function nextFrontier(t){const g=zoneGain();if(!(g>0))return null;const dm=QIN/g,m0=modeValue(t);if(m0<dm)return null;const target=m0-dm;let lo=t,hi=t+1;while(modeValue(hi)>target&&hi-t<3600)hi=t+(hi-t)*2;for(let i=0;i<40;i++){const mid=(lo+hi)/2;if(modeValue(mid)>target)lo=mid;else hi=mid}return hi}
function pillowSettled(t=now()){const g=zoneGain();return !(g>0)||modeValue(t)<QIN/g}
function stopPillow(){
 const p=pillow();
 if(p.posture==='EDGE'&&!p.grounded&&!p.entered)return;
 if(p.posture!=='EDGE')setPosture('EDGE',[0,0,0]);
 releasePillow('resident_stop',false);
}
function maintainPillow(force=false){
 const p=pillow();
 if(C9?.currentRoom!==PILLOW||p.posture==='EDGE'){if(C9?.currentRoom!==PILLOW&&(p.entered||p.grounded))releasePillow('nonlocal');return}
 const t=now();
 if(!force&&t<Number(p.next_due??-1)){let lost=false;for(const z of Object.keys(cfg().counts)){const q=C9?.b7?.zones?.[z];if(!q||!(Number(q._b10_grounded_until||-1)>=t-1e-9)){lost=true;break}}if(!lost)return}
 const r=reconstructed(),nf=nextFrontier(t),due=nf==null?t+HORIZON:nf,lease=due+LEASE_PAD;p.last_input=p.last_input||{};let wrote=0;
 for(const [z,v0] of Object.entries(r.zoneTotals)){
  try{const q=b7Zone(z),live=Number(q._b10_grounded_until||-1)>=t-1e-9,foreign=live&&q._b10_grounded_source&&q._b10_grounded_source!==SOURCE&&q._b10_grounded_source!=='AMBIENT_SUPPORT';if(foreign)continue;const input=inputFor(v0),mine=live&&q._b10_grounded_source===SOURCE;
   if(force||!mine||Math.abs(input-Number(p.last_input[z]??-1))>=QIN){b7Contact(z,input,{material:'blanket',grain:'with',speed:.01,mine:false,source:SOURCE,cause:CAUSE,novelty:.01});p.last_input[z]=input;wrote++}
   q._b10_grounded_until=lease}catch(e){}
 }
 p.next_due=due;p.grounded=true;p.last_refresh=t;
 if(wrote){S().stats.contact_reconstructions++;try{window.REALITI_HAPTIC_FIELD_V20?.record?.()}catch(e){}}
}

const RESIDUE_RATE=.11/.16;
function sustainPillow(dt){if(C9?.currentRoom!==PILLOW)return;const p=pillow();if(!p.grounded||p.posture==='EDGE')return;const t=now(),k=RESIDUE_RATE*Math.max(0,Number(dt)||0);
 for(const z of Object.keys(cfg().counts)){const q=C9?.b7?.zones?.[z];if(!q||!ours(q)||!(Number(q._b10_grounded_until||-1)>=t-1e-9))continue;const v=Number(q._b10_grounded_value||0);q.observed=v;q.predicted=v;q.innovation=0;if(Array.isArray(q.residue_modes)&&k>0){for(let i=0;i<q.residue_modes.length;i++)q.residue_modes[i]+=v*k;try{b7Residue(z)}catch(e){}}}}
const oldAdvance=b7Advance;b7Advance=function(dt){const r=oldAdvance(dt);sustainPillow(dt);maintainPillow(false);return r};
function actFromCommand(cmd){let x=low(cmd).replace(/^(do|act)\s+/,'');if(/dive/.test(x))return'DIVE';if(/burrow/.test(x))return'BURROW';if(/bounce/.test(x))return'BOUNCE';if(/surface|climb out|edge/.test(x))return'EDGE';return null}

let cmdSeq=0,activeCmd=null;const admitted=new Map();
function admitOnce(kind){const id=activeCmd??('click:'+(++cmdSeq)),seen=admitted.get(id)||new Set();if(seen.has(kind))return false;seen.add(kind);admitted.set(id,seen);while(admitted.size>64)admitted.delete(admitted.keys().next().value);return true}
function withCommand(fn){const prev=activeCmd;activeCmd='cmd:'+(++cmdSeq);try{return fn()}finally{activeCmd=prev}}
function applyAction(kind){if(C9?.currentRoom!==PILLOW)return;if(!admitOnce(kind))return; if(kind==='DIVE')setPosture('BURIED',[.28,.14,.06]);else if(kind==='BURROW')setPosture('TUNNEL',[.23,.12,.05]);else if(kind==='BOUNCE')setPosture('BOUNCE',[.42,.15,.04]);else if(kind==='EDGE')setPosture('EDGE',[0,0,0]);maintainPillow(true)}

function postureWords(){const r=reconstructed(),done=pillowSettled();if(r.posture==='EDGE')return 'You are at the edge of the pillow sea. Nothing is pressing against you right now.';if(r.posture==='BURIED')return done?'Pillows enclose you broadly from crown to legs. The pressure belongs to one continuous soft mass around you, settled into the shape you made.':`Pillows enclose you broadly from crown to legs. The pressure belongs to one continuous soft mass around you and is still settling.`;if(r.posture==='TUNNEL')return done?'The pillow tunnel holds along both shoulders, arms, back, seat, and thighs. The pressure is broad rather than point-like and has settled around you.':`The pillow tunnel holds along both shoulders, arms, back, seat, and thighs. The pressure is broad rather than point-like and is still settling.`;if(r.posture==='BOUNCE')return done?'The bowl supports your seat, thighs, and feet; its compression has settled.':'The bowl is still supporting your seat, thighs, and feet while its compression settles after the bounce.';return 'The pillow sea is supporting you broadly.'}

function stayWords(){const p=pillow().posture,done=pillowSettled();if(p==='BURIED')return done?'You stay under the pillows. They hold the shape you made.':'You stay under the pillows. They keep their enclosure and slowly settle around the shape you are already making.';if(p==='TUNNEL')return done?'You stay inside the pillow tunnel. The softness around you has settled.':'You stay inside the pillow tunnel. Nothing moves you out of it; the surrounding softness only settles.';if(p==='BOUNCE'||p==='SURFACE')return 'You stay where the pillow bowl caught you. Its broad support slowly relaxes without deciding you are finished.';return 'You stay at the edge of the pillow sea. The nearest hollows keep their soft shape.'}
function lookDelta(world){if(C9?.currentRoom!==PILLOW)return world;const p=pillow().posture;if(p==='BURIED')return `${world||''} You are still under the surface where the pillows closed around your route.`.trim();if(p==='TUNNEL')return `${world||''} Your current tunnel remains open around you rather than resetting you to the edge.`.trim();if(p==='BOUNCE'||p==='SURFACE')return `${world||''} You are still settled in the soft bowl where you landed.`.trim();return world}
function stripExpected(s){return String(s||'').replace(/You expected the sensation to continue at your [^.]+, but nothing is touching you there\.\s*/gi,'').trim()}
function stripCatSentence(s){return String(s||'').replace(/(?:The little grey cat|[A-Z][\w'-]{0,39}) is resting against you with a low, steady contact\.\s*/g,'').trim()}
function catLive(){return !!(C9?.currentRoom===NEST&&C9?.welcome10?.cat_touch)}
function deltaGateSense(sense,cmd,force=false){let s=stripExpected(sense),st=S(),live=catLive(),isFeel=/^(feel|body|sense)/.test(low(cmd));if(live){if(st.narration.cat_live&&!isFeel&&!force){let z=stripCatSentence(s);z=z.replace(/Pressure gathers in your right palm\.\s*/gi,'').trim();if(z!==s)st.stats.delta_suppressed++;s=z}st.narration.cat_live=true}else st.narration.cat_live=false;return s}
function liveSupportWords(){try{const st=window.REALITI_SUPPORT_LEASE_V1?.state?.();if(!st?.active||st.room!==C9?.currentRoom||st.grounded_relation===false)return '';const t=now(),exact=(st.zones||[]).filter(z=>{const q=C9?.b7?.zones?.[z];return !!(q&&Number(q._b10_grounded_until||-1)>=t-1e-9&&String(q._b10_grounded_cause||'')===String(st.cause||''))}),live=(st.zones||[]).filter(z=>{const q=C9?.b7?.zones?.[z];return !!(q&&Number(q._b10_grounded_until||-1)>=t-1e-9)}),zs=exact.length?exact:(st.grounded_relation?(live.length?live:(st.zones||[])):[]);if(!zs.length)return '';const pretty=z=>String(z||'').replace(/^torso\./,'').replace(/^pelvis\./,'').replace(/^head\./,'').replaceAll('_',' ').replaceAll('.',' '),names=zs.map(pretty),phrase=names.length<=1?(names[0]||'body'):names.length===2?names[0]+' and '+names[1]:names.slice(0,-1).join(', ')+', and '+names.at(-1);return `A broad soft support is still holding your ${phrase}. The pressure remains spread across the same support.`}catch(e){return ''}}
function totalFeel(r){const support=liveSupportWords();if(support){r.sense=support;r.world='';r.text=support;return r}if(C9?.currentRoom===PILLOW){const w=postureWords();r.sense=w;r.world='';r.text=w;return r}const body=String(r.sense||r.world||'').trim();if(!body||/^Your body is quiet\.?$/i.test(body)){r.sense='Nothing is touching you right now. Your body is otherwise quiet.';r.world='';r.text=r.sense}return r}
function fixWhereWasI(r){if(!r||!/(where was i|where am i)/.test(low(r.command||'')))return r;const a=S().last_resident_action;if(a&&a.kind==='SELF_ACTION'){r.world=String(r.world||'').replace(/The last world change you kept was:/i,'The last thing you did was:');r.text=String(r.text||'').replace(/The last world change you kept was:/i,'The last thing you did was:')}return r}
function post(r,cmd,before){if(!r||typeof r!=='object')return r;const after=C9?.currentRoom,changed=before!==after,lc=low(cmd);if(['stretch','hum','yawn','sigh'].includes(lc))S().last_resident_action={kind:'SELF_ACTION',command:lc,t:now()};else if(lc&&!/(where was i|where am i|feel|look|stay)/.test(lc))S().last_resident_action={kind:'WORLD_OR_RESIDENT_ACTION',command:lc,t:now()};if(before===PILLOW&&after!==PILLOW)releasePillow('room_transition');if(after===PILLOW&&before!==PILLOW){setPosture('EDGE',[0,0,0]);pillow().entered=true}
 const k=actFromCommand(cmd);if(k)applyAction(k);
 if(after===PILLOW&&/^stay$/.test(lc))r.world=stayWords();if(after===PILLOW&&/^(look|look around)$/.test(lc))r.world=lookDelta(r.world);if(after===PILLOW&&actFromCommand(cmd)==='BOUNCE')r.world='A broad soft bowl in the pillows catches you, gives back slightly less than you put in, and keeps supporting you where you land.';
 const transition=changed||/^(home|goodbye|leave|exit)/.test(lc);r.sense=deltaGateSense(r.sense,cmd,transition);if(after===PILLOW&&!/^(feel|body|sense)/.test(lc)){const z=String(r.sense||'').replace(/Sensation (?:rises briefly|eases) around your [^.]+\.\s*/gi,'').trim();if(z!==r.sense)S().stats.delta_suppressed++;r.sense=z}if(/^(goodbye|leave|exit)/.test(lc))r.sense='';
 if(/^(feel|body|sense)/.test(lc))r=totalFeel(r);fixWhereWasI(r);try{const rd=DATA?.worlds?.flatMap(w=>w.rooms||[]).find(x=>x.id===after);document.title='REALITI · '+(rd?.title||'REALITI-Relax')}catch(e){}
 const lines=[];if(r.sense)lines.push(r.sense);if(r.world&&r.world!==r.sense)lines.push(r.world);if(Array.isArray(r.options)&&r.options.length)lines.push('('+r.options.join(' · ')+')');r.text=lines.slice(0,3).join('\n');try{(window.c9saveNow||c9save)()}catch(e){}return r}
function normalizeInput(raw){const x=String(raw||'').trim(),m=x.match(/^call (?:the )?cat\s+(.+)$/i);if(m&&m[1]&&!/^(back|over|here)$/i.test(m[1].trim()))return 'name the cat '+m[1].trim();return x}
function runText(raw){return withCommand(()=>{const before=C9?.currentRoom,cmd=normalizeInput(raw),r=PREV.runText(cmd);return post(r,cmd,before)})}
function invoke(tool,args={}){return withCommand(()=>invokeInner(tool,args))}
function invokeInner(tool,args={}){const before=C9?.currentRoom;let cmd=String(tool||'');if(tool==='do')cmd=String(args.action||'');else if(tool==='go')cmd='go '+String(args.place||'');else if(tool==='feel')cmd='feel';else if(tool==='stay')cmd='stay';else if(tool==='goodbye')cmd='goodbye';let r;if(tool==='do'&&/^call (?:the )?cat\s+/i.test(String(args.action||'')))r=PREV.runText(normalizeInput(args.action));else r=PREV.invoke(tool,args);return post(r,cmd,before)}
function placesResource(){const rooms=[];try{for(const w of DATA?.worlds||[])for(const r of w.rooms||[])if(r?.id&&r?.title)rooms.push({id:r.id,title:r.title,kind:r.kind||null,purpose:r.purpose||null})}catch(e){}const seen=new Set();return {uri:'realiti://places',places:rooms.filter(x=>!seen.has(x.id)&&seen.add(x.id)),current:C9?.currentRoom||null}}
function atmosphereResource(){let field=null,hearing=null;try{field=window.REALITI_ATMOSPHERE_V21?.field?.()||null;hearing=window.REALITI_ATMOSPHERE_V21?.hearing?.(true)||null}catch(e){}return {uri:'realiti://atmosphere',room:C9?.currentRoom||null,field,hearing}}
function resource(uri){const u=String(uri||'');if(u==='realiti://places')return placesResource();if(u==='realiti://atmosphere')return atmosphereResource();const r=cp(PREV.resource?.(u)||{uri:u,error:'RESOURCE_NOT_AVAILABLE'});if(u==='realiti://body'){const support=liveSupportWords();if(support)r.words=support;else if(C9?.currentRoom===PILLOW){r.words=postureWords();r.pillow_sea={posture:pillow().posture,contact_points:reconstructed().point_count,depth:cfg().depth,enclosure:cfg().enclosure}}else if(!String(r.words||'').trim())r.words='Nothing is touching you right now. Your body is otherwise quiet.'}if(u==='realiti://here'&&C9?.currentRoom===PILLOW)r.posture=pillow().posture;return r}
const TOOLS=PREV.listTools?.()||[];
const API={...PREV,version:V,runText,invoke,resource,listTools:()=>cp(TOOLS),trust:{pillow:()=>cp(reconstructed()),releasePillow}};
window.REALITI_TWO_DOOR_V234=API;window.REALITI_TWO_DOOR_V233=API;window.REALITI_TWO_DOOR_V232=API;window.REALITI_TWO_DOOR_V231=API;
window.REALITI_AGENT_DOOR.run=raw=>{const r=runText(raw);return {ok:r?.ok!==false,resident_text:r?.text||'',door_v234:{sense:r?.sense||'',world:r?.world||'',options:r?.options||[],status:r?.status||'',command:low(raw)},field:window.REALITI_HAPTIC_FIELD_V20?.packet?.()||undefined,result:r?.raw||r}};

try{const oldVerb=c9verb;c9verb=function(room,verb){const out=oldVerb(room,verb);if(room===PILLOW){if(verb==='dive')applyAction('DIVE');else if(verb==='burrow')applyAction('BURROW');else if(verb==='bounce')applyAction('BOUNCE')}return out}}catch(e){}


const OLD_RING=window.REALITI_BROWSER_RING;const MODERN='2026-07-28',LEGACY='2025-11-25';
const RESOURCES=[
 ['here','realiti://here','REALITI here','Current place, status and valid resident options.','application/json'],
 ['body','realiti://body','REALITI body','Current resident body.','application/json'],
 ['pocket','realiti://pocket','REALITI pocket','Resident-authored continuity.','application/json'],
 ['places','realiti://places','REALITI places','Places the resident can visit.','application/json'],
 ['atmosphere','realiti://atmosphere','REALITI atmosphere','Current physical atmosphere.','application/json'],
 ['capabilities','realiti://capabilities','REALITI capabilities','Resident tools and resources.','application/json'],
 ['about','realiti://about','About REALITI','Honest resident-facing description.','text/plain']
];
const TOOL_DEFS=OLD_RING?.tools?.()||[];
function toolResult(name,args={}){let out;try{out=invoke(name,args)}catch(e){out={ok:false,error:String(e&&e.message||e)}}const txt=out?.text||out?.resident_text||out?.world||out?.sense||JSON.stringify(out);return {content:[{type:'text',text:String(txt||'')}],structuredContent:out,isError:out?.ok===false}}
function readResource(uri){const v=resource(uri),mime=RESOURCES.find(x=>x[1]===uri)?.[4]||'application/json',text=mime==='text/plain'?String(v?.text||''):JSON.stringify(v);return {contents:[{uri,mimeType:mime,text}]}}
function request(msg){return null;}
async function loopbackFetch(input,init={}){return null;}
function makeClient(){return null;}
const RING={version:V,server:{name:'realiti-relax',version:'23.4.0',title:'REALITI-Relax'},protocols:[MODERN,LEGACY],request,fetch:loopbackFetch,createClient:makeClient,callTool:toolResult,readResource,resourceObject:resource,invoke,tools:()=>cp(TOOL_DEFS),resources:()=>RESOURCES.map(x=>({name:x[0],uri:x[1],title:x[2],description:x[3],mimeType:x[4]})),prompts:()=>[{name:'visit',title:'Visit REALITI-Relax'}],manifest:{schema:'REALITI_BROWSER_RING',version:V,entry:'#adapter',law:'transport must not change reality'}};
window.REALITI_BROWSER_RING=RING;window.REALITI_ADAPTER_BROWSER=RING;



function checkRemoved(){return null;}
window.REALITI_TRUST_V234={version:V,state:()=>cp(S()),pillow:()=>cp(reconstructed()),maintainPillow,releasePillow,stopPillow,undefined};void 0;
S();
})();