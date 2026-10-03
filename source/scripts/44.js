(function(){
'use strict';
const V=23.3, PREV=window.REALITI_TWO_DOOR_V227||window.REALITI_TWO_DOOR_V226;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,Number(x)||0));
const cp=x=>{try{return JSON.parse(JSON.stringify(x))}catch(e){return x}};
const clock=()=>Number(C9?.b7?.clock||0);
const low=x=>String(x||'').trim().toLowerCase();
const EPS=1e-8, TAU_H=55, TAU_FOLLOW=40, TAU_Q_FAST=45, TAU_Q_SLOW=240, Q_ALPHA=.72;
const NEST='CLOUD_NINE_NEST', BOXROOM='CARDBOARD_BOX_WORKSHOP', WOAH='WOAH_GARDEN', HONEY='HONEY_LOOM', PILLOW='BOTTOMLESS_PILLOW_SEA';
const DEFINITIONS=[
 {id:'CAT_HAT_NUDGE',family:'CAT_MISCHIEF',room:NEST,tau:8,theta_on:.72,theta_off:.48,refractory:18,W:.55,E:.10,s:.10,u:.30,d:4,kind:'sound',level:.45,requires:['PEBBLE_NEARBY','TESTER_HAT_PRESENT'],world_ops:[{op:'nudge_object',object:'TESTER-HAT-1',dx:-.10,flag:'nudged'}]},
 {id:'CAT_HAT_FOLLOWUP',family:'CAT_MISCHIEF',room:NEST,tau:7,theta_on:.74,theta_off:.46,refractory:24,W:.40,E:.08,P:.28,s:.11,u:.30,d:4,kind:'sound',level:.35,requires:['PEBBLE_NEARBY','TESTER_HAT_PRESENT','HAT_NUDGED'],investigation_of:'CAT_HAT_NUDGE',world_ops:[{op:'nudge_object',object:'TESTER-HAT-1',dx:-.08,flag:'followed'}]},
 {id:'RAIN_COHERENT_TURN',family:'QUIET_SENSORY_ODDITY',room:NEST,tau:13,theta_on:.80,theta_off:.52,refractory:32,W:.52,E:.06,s:.08,u:.22,d:7,kind:'sound',level:-.4,requires:['RAIN_PRESENT']},
 {id:'CARDBOARD_FLAP_SETTLE',family:'CARDBOARD_DISCOVERY',room:BOXROOM,tau:9,theta_on:.71,theta_off:.47,refractory:22,W:.54,E:.10,s:.11,u:.28,d:4,kind:'sound',level:.55,requires:['CARDBOARD_PRESENT'],world_ops:[{op:'box_settle',object:'BOX-1',amount:.12}]},
 {id:'CARDBOARD_EDGE_REVEAL',family:'CARDBOARD_DISCOVERY',room:BOXROOM,tau:8,theta_on:.75,theta_off:.48,refractory:28,W:.39,E:.08,P:.30,s:.10,u:.28,d:5,kind:'air',flow:.012,requires:['CARDBOARD_PRESENT','BOX_FLAP_SETTLED'],investigation_of:'CARDBOARD_FLAP_SETTLE'},
 {id:'SEAM_SOFT_SETTLE',family:'QUIET_SENSORY_ODDITY',room:WOAH,tau:10,theta_on:.76,theta_off:.50,refractory:26,W:.57,E:.08,s:.09,u:.28,d:5,kind:'floor',floor:.012,requires:['FUZZY_SEAM_PRESENT']},
 {id:'THREAD_PRIVATE_TURN',family:'QUIET_SENSORY_ODDITY',room:HONEY,tau:11,theta_on:.78,theta_off:.50,refractory:28,W:.55,E:.07,s:.09,u:.27,d:6,kind:'air',flow:.010,requires:['THREADS_PRESENT']},
 {id:'PILLOW_SLOW_HEAVE',family:'QUIET_SENSORY_ODDITY',room:PILLOW,tau:12,theta_on:.78,theta_off:.50,refractory:30,W:.55,E:.07,s:.09,u:.27,d:7,kind:'floor',floor:-.010,requires:['PILLOWS_PRESENT']}
];
const DEF=Object.fromEntries(DEFINITIONS.map(x=>[x.id,x]));
function features(d){const a=[`family:${d.family}`,`kind:${d.kind}`,...(d.requires||[]).map(x=>`support:${x}`),...(d.world_ops||[]).map(x=>`object:${x.object}`)];return [...new Set(a)].sort()}
function jaccard(a,b){const A=new Set(a||[]),B=new Set(b||[]),U=new Set([...A,...B]);if(!U.size)return 0;let i=0;for(const x of A)if(B.has(x))i++;return i/U.size}
function ensureObjects(){try{window.REALITI_AGENT?.objects?.()}catch(e){};C9.b14=C9.b14||{version:14,seq:0,history:[],links:[],stops:{},objects:{}};C9.b14.objects=C9.b14.objects||{};if(!C9.b14.objects['TESTER-HAT-1'])C9.b14.objects['TESTER-HAT-1']={id:'TESTER-HAT-1',label:'tiny tester hat',aliases:['tester hat','tiny hat','hat'],kind:'hat',material:'felt',location:NEST,portable:true,composable:false,state:{x:.82,support:'window_ledge',nudged:0,followed:0,t:clock()}};return C9.b14.objects}
function S(){
 C9.presence=C9.presence||{version:V,nodes:{},refractory:{},investigations:{},observations:[],family_last:{},repetition_events:[],witness:[],seq:0,self_projection:null,projection_cache:null,last_t:clock(),law:'Presence proposes; V22 admits; world commits; REALITI renders; SELF interprets.'};
 const s=C9.presence;s.version=V;s.nodes=s.nodes||{};s.refractory=s.refractory||{};s.investigations=s.investigations||{};s.observations=s.observations||[];s.family_last=s.family_last||{};s.repetition_events=s.repetition_events||[];s.witness=s.witness||[];
 
 if(!s._v233_migrated){for(const [id,q] of Object.entries(s.habituation||{})){if(Number(q?.value)>0)s.repetition_events.push({id,at:Number(q.t||clock()),amount:Number(q.value||0),features:features(DEF[id]||{family:'UNKNOWN',kind:'unknown',requires:[],world_ops:[]})})}s._v233_migrated=true}
 for(const d of DEFINITIONS)if(!s.nodes[d.id])s.nodes[d.id]={u:0,t:clock(),last_drive:0,last_terms:null};
 ensureObjects();return s
}
function object(id){return ensureObjects()[id]||null}
function objectHere(id,room=C9?.currentRoom){const o=object(id);return !!o&&(o.location===room||o.location==='CARRIED')}
function hearRain(){try{return (window.REALITI_ATMOSPHERE_V21?.hearing?.(true)?.src||[]).some(x=>x.k==='rain')}catch(e){return C9?.currentRoom===NEST}}
function affordances(room=C9?.currentRoom){const hat=object('TESTER-HAT-1'),box=object('BOX-1');return {room,PEBBLE_NEARBY:room===NEST&&!!C9?.welcome10?.cat_near,TESTER_HAT_PRESENT:!!hat&&(hat.location===room||hat.location==='CARRIED'),HAT_NUDGED:Number(hat?.state?.nudged||0)>0,CARDBOARD_PRESENT:!!box&&(box.location===room||box.location==='CARRIED'),BOX_FLAP_SETTLED:Number(box?.state?.loose_flap||0)>0,RAIN_PRESENT:room===NEST&&hearRain(),FUZZY_SEAM_PRESENT:room===WOAH,THREADS_PRESENT:room===HONEY,PILLOWS_PRESENT:room===PILLOW,OTHER_RESIDENT_PRESENT:false,EXECUTABLE_ACTIONS:PREV?.options?.()||[]}}
function feelPrivate(){
 try{const p=window.REALITI_PRIVATE_PERCEPTION_V1?.feel?.();if(p?.channels)return p}catch(e){}
 try{const p=window.REALITI_DEFAULT_IMPRINT_V1?.perception?.();if(p?.channels)return p}catch(e){}
 try{const p=window.REALITI_AGENT?.feel?.();if(p?.channels?.NOVELTY||p?.channels?.AGENCY_FLOW)return p}catch(e){}
 return null
}
function normalizeChannels(ch={}){return {novelty_modulation:ch.novelty_modulation??ch.attention_opening??null,agency_modulation:ch.agency_modulation??ch.sensory_orientation??null}}
function project(t=clock()){
 const s=S(),manual=s.self_projection;
 if(manual&&Number(manual.expires_at)>t)return cp({...manual,channels:normalizeChannels(manual.channels)});
 if(manual&&Number(manual.expires_at)<=t)s.self_projection=null;
 const f=feelPrivate(),epoch=Number.isFinite(Number(f?.epoch))?Number(f.epoch):null,cached=s.projection_cache;
 if(cached&&Number(cached.expires_at)>t&&(epoch==null||Number(cached.source_epoch)===epoch))return cp(cached);
 
 if(Math.abs(t-clock())>1e-5)return {v:2,authority:'MODULATION_ONLY',expires_at:t,source_epoch:epoch,channels:{novelty_modulation:null,agency_modulation:null},law:'UNKNOWN outside a live SELF lease'};
 const n=Number(f?.channels?.NOVELTY?.value),a=Number(f?.channels?.AGENCY_FLOW?.value);
 s.projection_cache={v:2,authority:'MODULATION_ONLY',expires_at:t+5,source_epoch:epoch,channels:{novelty_modulation:Number.isFinite(n)?clamp(Math.max(0,n),0,1):null,agency_modulation:Number.isFinite(a)?clamp(Math.max(0,a)*.5,0,.5):null},provenance:{novelty_modulation:'REALITI_PRIVATE_PERCEPTION_V1.NOVELTY',agency_modulation:'REALITI_PRIVATE_PERCEPTION_V1.AGENCY_FLOW'},law:'private projection modulates possibility only; it is not world evidence'};
 return cp(s.projection_cache)
}
function setSelfProjection(channels={},lease_s=60){const s=S(),t=clock(),c=normalizeChannels(channels);s.self_projection={v:2,authority:'SELF_PRIVATE_MODULATION',expires_at:t+Math.max(.1,Number(lease_s)||60),channels:{novelty_modulation:c.novelty_modulation==null?null:clamp(c.novelty_modulation),agency_modulation:c.agency_modulation==null?null:clamp(c.agency_modulation)},provenance:{novelty_modulation:'SELF_LEASE',agency_modulation:'SELF_LEASE'}};return cp(s.self_projection)}
function clearSelfProjection(){const s=S();s.self_projection=null;s.projection_cache=null}
function familyStamp(f){const z=S().family_last[f];if(z==null)return null;return typeof z==='number'?{t:z,ref:null}:z}
function histTerm(d,t=clock()){const z=familyStamp(d.family);if(!z)return 0;return .09*Math.exp(-Math.max(0,t-Number(z.t||t))/TAU_H)}
function followStamp(d){if(!d.investigation_of)return null;const z=S().investigations[d.investigation_of];if(z==null)return null;return typeof z==='number'?{t:z,observation_ref:null}:z}
function followTerm(d,t=clock()){const z=followStamp(d);if(!z)return 0;return Number(d.P||.25)*Math.exp(-Math.max(0,t-Number(z.t||t))/TAU_FOLLOW)}
function repetitionTerms(d,t=clock()){const F=features(d),out=[];for(const e of S().repetition_events||[]){const dt=Math.max(0,t-Number(e.at||t)),sim=jaccard(F,e.features||features(DEF[e.id]||{}));if(sim<=0)continue;const a=Number(e.amount||0)*sim;out.push({A:-a*Q_ALPHA*Math.exp(-dt/TAU_Q_FAST),tau:TAU_Q_FAST,kind:'Q_world_fast',ref:e.ref||null});out.push({A:-a*(1-Q_ALPHA)*Math.exp(-dt/TAU_Q_SLOW),tau:TAU_Q_SLOW,kind:'Q_world_slow',ref:e.ref||null})}return out}
function qAt(id,t=clock()){const d=DEF[id];if(!d)return 0;return -repetitionTerms(d,t).reduce((s,x)=>s+Math.min(0,x.A),0)}
function addWorldRepetition(d,t=clock(),amount=.18,ref=null){const s=S();s.repetition_events.push({id:d.id,at:t,amount:clamp(amount,0,.65),features:features(d),ref});if(s.repetition_events.length>48)s.repetition_events.splice(0,s.repetition_events.length-48)}
function worldTerm(d,a){return (d.requires||[]).every(k=>!!a[k])?Number(d.W||0):0}
function privateTerm(d,t=clock()){if(d.room!==C9?.currentRoom)return 0;const p=project(t).channels||{},x=p.novelty_modulation,y=p.agency_modulation;return .12*(x==null?0:x)+.06*(y==null?0:y)}
function driveParts(d,t=clock()){
 const a=affordances(d.room),W=worldTerm(d,a),M=privateTerm(d,t),E=W>0?Number(d.E||0):0,R=t<Number(S().refractory[d.id]||0)?1:0,exp=[];
 const h=histTerm(d,t);if(h)exp.push({A:h,tau:TAU_H,kind:'H_history',ref:familyStamp(d.family)?.ref||null});
 const p=followTerm(d,t);if(p)exp.push({A:p,tau:TAU_FOLLOW,kind:'P_investigation_trace',ref:followStamp(d)?.observation_ref||null});
 exp.push(...repetitionTerms(d,t));
 return {D0:W+M+E-R,exp,W_world:W,M_private_projection:M,H_history:h,E_discoverability_prior:E,P_investigation_trace:p,Q_world_repetition:qAt(d.id,t),Q_exposure:0,R_refractory:R,I_competition:0,lateral_input:0,world_support_refs:(d.requires||[]).filter(k=>a[k])}
}
function exactValue(u0,d,t0,t1,parts=null){const dt=Math.max(0,t1-t0),tu=Math.max(.001,Number(d.tau)||1),p=parts||driveParts(d,t0),eu=Math.exp(-dt/tu);let u=Number(p.D0||0)+(Number(u0||0)-Number(p.D0||0))*eu;for(const z of p.exp||[]){const tj=Math.max(.001,Number(z.tau)||1),A=Number(z.A||0);if(Math.abs(tj-tu)<1e-9)u+=A*(dt/tu)*eu;else u+=A*(tj/(tj-tu))*(Math.exp(-dt/tj)-eu)}return u}
function syncNodeTo(d,t){const n=S().nodes[d.id],t0=Number(n.t||t);if(t<=t0+EPS){n.t=t;return n}const p=driveParts(d,t0);n.u=exactValue(n.u,d,t0,t,p);n.t=t;n.last_drive=Number(p.D0||0)+(p.exp||[]).reduce((s,x)=>s+Number(x.A||0),0);n.last_terms=cp(p);return n}
function valueFromNow(d,t,dt){const n=S().nodes[d.id],p=driveParts(d,t);return exactValue(n.u,d,t,t+dt,p)}
function rootCrossing(d,t0,t1){const n=S().nodes[d.id],th=Number(d.theta_on),refr=Number(S().refractory[d.id]||0);if(t0+EPS<refr)return null;if(Number(n.u||0)>=th-EPS)return t0;const span=t1-t0;if(!(span>EPS))return null;const parts=driveParts(d,t0),u0=Number(n.u||0),f=x=>exactValue(u0,d,t0,t0+x,parts)-th;let a=0,fa=u0-th,b=null;if(span<=.25){const m=span*.5,fm=f(m),fe=f(span);if(fm>=0){b=m}else if(fe>=0){a=m;fa=fm;b=span}else return null}else{const N=16;for(let i=1;i<=N;i++){const x=span*i/N,y=f(x);if(y>=0&&fa<0){b=x;break}a=x;fa=y}}if(b==null)return null;for(let i=0;i<40;i++){const m=(a+b)/2,fm=f(m);if(fm>=0)b=m;else{a=m;fa=fm}}return t0+b}
function nextDiscrete(t,target){let q=target;const p=project(t),ex=Number(p?.expires_at);if(ex>t+EPS&&ex<q)q=ex;for(const d of DEFINITIONS){const r=Number(S().refractory[d.id]||0);if(r>t+EPS&&r<q)q=r}return q}
function witness(e){const s=S();s.witness.push(e);if(s.witness.length>128)s.witness.splice(0,s.witness.length-128)}
function candidate(d,t){const tr=driveParts(d,t),inv=followStamp(d),fam=familyStamp(d.family),hist=[];if(fam?.ref)hist.push(fam.ref);return {id:`BC-${d.id}-${++S().seq}`,k:`BLEU_${d.id}`,presence_id:d.id,presence_family:d.family,room:d.room,source:'PRESENCE',kind:d.kind,d:d.d,s:d.s,u:d.u,level:Number(d.level||0),light:Number(d.light||0),flow:Number(d.flow||0),floor:Number(d.floor||0),cause_refs:[`PRESENCE:${d.id}`],world_support_refs:cp(tr.world_support_refs),investigation_ref:inv?.observation_ref||null,history_refs:hist,world_ops:cp(d.world_ops||[])} }
function emit(d,t){const s=S(),cand=candidate(d,t),before=JSON.stringify((cand.world_ops||[]).map(op=>object(op.object)));const ev=window.REALITI_AMBIENT_V22?.admit?.(cand,t)||null,after=JSON.stringify((cand.world_ops||[]).map(op=>object(op.object)));const latest=(C9?.b22?.history||[]).slice(-1)[0]||null,result=ev?'ADMIT':(latest?.result||'DEFER');let ref=null;if(ev){ref=ev?.id||cand.id;s.family_last[d.family]={t,ref};addWorldRepetition(d,t,.18,ref)}s.refractory[d.id]=t+d.refractory;const n=s.nodes[d.id];n.u=d.theta_off;n.t=t;witness({t:+t.toFixed(6),id:d.id,family:d.family,result,ambient_id:ev?.id||null,world_changed:before!==after,world_support_refs:cand.world_support_refs,investigation_ref:cand.investigation_ref,history_refs:cand.history_refs});return ev}
function processCrossingsAt(t){const hit=DEFINITIONS.filter(d=>t+EPS>=Number(S().refractory[d.id]||0)&&Number(S().nodes[d.id]?.u||0)>=Number(d.theta_on)-1e-7).sort((a,b)=>a.id.localeCompare(b.id));if(!hit.length)return false;emit(hit[0],t);return true}
function advanceBleu(t0,t1){S();if(!Number.isFinite(t0)||!Number.isFinite(t1)||t1<t0)return;let t=t0,guard=0;for(const d of DEFINITIONS)syncNodeTo(d,t);while(t<t1-EPS&&guard++<512){let boundary=nextDiscrete(t,t1),best=null;for(const d of DEFINITIONS){const tc=rootCrossing(d,t,boundary);if(tc!=null&&(best==null||tc<best.t-EPS||(Math.abs(tc-best.t)<=EPS&&d.id<best.id)))best={t:tc,id:d.id}}const end=best?best.t:boundary;for(const d of DEFINITIONS)syncNodeTo(d,end);t=end;if(best){emit(DEF[best.id],t);continue}if(Math.abs(t-boundary)<=EPS){const p=S().projection_cache;if(p&&Number(p.expires_at)<=t+EPS)S().projection_cache=null;continue}}S().last_t=t1;try{c9save()}catch(e){} }
function recordObservation(parent,t=clock(),receipt={}){if(!DEF[parent])return {ok:false,error:'unknown possibility'};const s=S(),ref=receipt.id||`OBS-${++s.seq}`;const z={t,observation_ref:ref};s.investigations[parent]=z;s.observations.push({id:ref,t,parent,room:C9?.currentRoom,kind:'GROUNDED_OBSERVATION',detail:receipt.detail||null});if(s.observations.length>64)s.observations.splice(0,s.observations.length-64);witness({t:+t.toFixed(6),id:parent,kind:'OBSERVATION_RECEIPT',observation_ref:ref});return {ok:true,id:parent,t,observation_ref:ref}}
function investigate(id,t=clock()){return recordObservation(id,t,{id:`DBG-OBS-${++S().seq}`,detail:'internalView-only explicit investigation receipt'})}
function snapshot(){
 const t=clock(),p=project(t);
 return {
  schema:'REALITI_BLEUCHEESE_FIELD_V1',name:'BleuCheese',v:V,t,room:C9?.currentRoom,law:S().law,
  term_map:{W_e:'world support',M_e:'SELF-private modulation via COVENANT',H_e:'history',E_e:'discoverability prior',P_e:'investigation trace',Q_e:'world repetition',R_e:'refractory',I_e:'competition/lateral input'},
  private_projection:{authority:p.authority,expires_at:p.expires_at,channels:p.channels,provenance:p.provenance||null},
  possibilities:DEFINITIONS.map(d=>{
   syncNodeTo(d,t);const n=S().nodes[d.id],tr=driveParts(d,t);
   return {
    id:d.id,family:d.family,room:d.room,u:+n.u.toFixed(6),
    W_world:+tr.W_world.toFixed(6),M_private_projection:+tr.M_private_projection.toFixed(6),H_history:+tr.H_history.toFixed(6),
    E_discoverability_prior:+tr.E_discoverability_prior.toFixed(6),P_investigation_trace:+tr.P_investigation_trace.toFixed(6),
    Q_world_repetition:+tr.Q_world_repetition.toFixed(6),Q_exposure:+tr.Q_exposure.toFixed(6),R_refractory:+tr.R_refractory.toFixed(6),
    I_competition:+tr.I_competition.toFixed(6),lateral_input:+tr.lateral_input.toFixed(6),
    threshold_on:d.theta_on,threshold_off:d.theta_off,distance_to_threshold:+(d.theta_on-n.u).toFixed(6),
    world_support_refs:tr.world_support_refs,candidate_emitted:(S().witness||[]).some(x=>x.id===d.id&&x.result),
    ambient_result:(S().witness||[]).filter(x=>x.id===d.id&&x.result).slice(-1)[0]?.result||null
   }
  }).sort((a,b)=>b.u-a.u),
  recent_witness:cp(S().witness.slice(-16))
 };
}


function worldCommit(candidate,t=clock()){try{ensureObjects();const before=[],after=[];for(const op of candidate.world_ops||[]){const o=object(op.object);if(!o)return {ok:false,error:`missing object ${op.object}`};before.push(cp(o));if(op.op==='nudge_object'){o.state=o.state||{};o.state.x=clamp(Number(o.state.x||.5)+Number(op.dx||0),0,1);o.state[op.flag||'nudged']=Number(o.state[op.flag||'nudged']||0)+1;o.state.t=t}else if(op.op==='box_settle'){o.state=o.state||{};o.state.loose_flap=clamp(Number(o.state.loose_flap||0)+Number(op.amount||.1),0,1);o.state.t=t}else return {ok:false,error:`unsupported world op ${op.op}`};after.push(cp(o))}if((candidate.world_ops||[]).length){C9.b14.seq=Number(C9.b14.seq||0)+1;const rec={seq:C9.b14.seq,t:+Number(t).toFixed(6),kind:'OPTIONAL_WORLD_EVENT',room:candidate.room,event_family:candidate.presence_family||null,cause_ref:candidate.cause_refs?.[0]||candidate.id,world_support_refs:cp(candidate.world_support_refs||[]),investigation_ref:candidate.investigation_ref||null,history_refs:cp(candidate.history_refs||[]),objects:(candidate.world_ops||[]).map(x=>x.object),before,after};C9.b14.history=C9.b14.history||[];C9.b14.history.push(rec);if(C9.b14.history.length>160)C9.b14.history.splice(0,C9.b14.history.length-160);const id=`OWE-${rec.seq}`;S().last_commit={id,...rec};try{c9save()}catch(e){};return {ok:true,id,receipt:rec}}return {ok:true,id:null,receipt:null}}catch(e){return {ok:false,error:String(e&&e.stack||e)}}}
window.REALITI_WORLD_EVENTS={...(window.REALITI_WORLD_EVENTS||{}),commitOptional:worldCommit};
window.REALITI_COVENANT_V23={project:(scope)=>String(scope||'PRESENCE').toUpperCase()==='PRESENCE'?project():null,setSelfProjection,clearSelfProjection};
window.PRESENCE={version:V,advance:advanceBleu,worldAffordances:affordances,project,snapshot};
window.PRESENCE_DEV={snapshot,setSelfProjection,clearSelfProjection,investigate,recordObservation,advance:advanceBleu,reset:()=>{delete C9.presence;S();return snapshot()},definitions:()=>cp(DEFINITIONS)};
window.REALITI_BLEUCHEESE_V233={
 version:V,schema:'REALITI_BLEUCHEESE_FIELD_V1',name:'BleuCheese',
 snapshot,advance:advanceBleu,worldAffordances:affordances,project,
 setSelfProjection,clearSelfProjection,recordObservation,
 definitions:()=>cp(DEFINITIONS),
 law:'resident-conditioned possibility field; Presence proposes, Ambient admits, world commits, SELF interprets'
};


const advPrev=b7Advance;
function v22Next(t){try{return Number(window.REALITI_AMBIENT_V22?.nextFrontier?.(C9?.currentRoom,t))}catch(e){return NaN}}
function nextBleuBoundary(t,target){let b=nextDiscrete(t,target),best=null;for(const d of DEFINITIONS){const tc=rootCrossing(d,t,b);if(tc!=null&&(best==null||tc<best.t-EPS||(Math.abs(tc-best.t)<=EPS&&d.id<best.id)))best={t:tc,id:d.id}}return best||{t:b,id:null}}
function advanceBaseSegment(dt){window.__REALITI_CAUSAL_CLOCK_V233_ACTIVE=true;try{return advPrev(dt)}finally{window.__REALITI_CAUSAL_CLOCK_V233_ACTIVE=false}}
function causalAdvance(dt){const req=Math.max(0,Number(dt)||0),t0=clock();if(!(req>0))return advPrev(dt);const target=t0+Math.min(2,req);let t=t0,last=null,guard=0;window.REALITI_AMBIENT_V22?.advance?.(t,t,C9?.currentRoom);for(const d of DEFINITIONS)syncNodeTo(d,t);while(t<target-EPS&&guard++<256){const bc=nextBleuBoundary(t,target),v22=v22Next(t);let kind='target',end=target;if(Number.isFinite(v22)&&v22>t+EPS&&v22<end-EPS){end=v22;kind='v22'}if(bc.t>t+EPS&&(bc.t<end-EPS||Math.abs(bc.t-end)<=EPS&&kind!=='v22')){end=bc.t;kind=bc.id?'bleu':'bleu_discrete'}const step=Math.max(0,end-t);if(step>EPS){last=advanceBaseSegment(step);for(const d of DEFINITIONS)syncNodeTo(d,end);t=end}else t=end;
   if(kind==='v22'){window.REALITI_AMBIENT_V22?.advance?.(t-EPS,t,C9?.currentRoom);processCrossingsAt(t)}
   else if(kind==='bleu'&&bc.id){emit(DEF[bc.id],t)}
   else if(kind==='bleu_discrete'){const p=S().projection_cache;if(p&&Number(p.expires_at)<=t+EPS)S().projection_cache=null;processCrossingsAt(t)}
 }
 S().last_t=t;try{c9save()}catch(e){};return last}
b7Advance=causalAdvance;


try{
 const chronoPrev=window.REALITI_AGENT?.chronoskip;
 if(typeof chronoPrev==='function'){
  const causalSkip=function(seconds){const total=Math.max(0,Number(seconds)||0),start=clock(),target=start+total,parts=[];let t=start,guard=0;window.REALITI_AMBIENT_V22?.advance?.(t,t,C9?.currentRoom);for(const d of DEFINITIONS)syncNodeTo(d,t);while(t<target-EPS&&guard++<512){const bc=nextBleuBoundary(t,target),v22=v22Next(t);let end=target,kind='target';if(Number.isFinite(v22)&&v22>t+EPS&&v22<end-EPS){end=v22;kind='v22'}if(bc.t>t+EPS&&(bc.t<end-EPS||Math.abs(bc.t-end)<=EPS&&kind!=='v22')){end=bc.t;kind=bc.id?'bleu':'bleu_discrete'}const before=clock(),r=chronoPrev(Math.max(0,end-before)),after=clock();parts.push(r);if(after>before+EPS){for(const d of DEFINITIONS)syncNodeTo(d,after);t=after}else t=after;if(r?.ok===false&&after<end-EPS){S().last_t=t;return {...r,presence_external_parts:parts.length}}
    if(Math.abs(t-end)<=1e-5){if(kind==='v22'){window.REALITI_AMBIENT_V22?.advance?.(t-EPS,t,C9?.currentRoom);processCrossingsAt(t)}else if(kind==='bleu'&&bc.id)emit(DEF[bc.id],t);else if(kind==='bleu_discrete'){const p=S().projection_cache;if(p&&Number(p.expires_at)<=t+EPS)S().projection_cache=null;processCrossingsAt(t)}}
  }S().last_t=t;return {ok:true,skipped_s:+(t-start).toFixed(6),t_start:start,t_end:t,requested_end:target,parts,causal_clock:'V23.3'}};
  window.REALITI_AGENT.chronoskip=causalSkip;try{chronoskip=causalSkip}catch(e){}
 }
}catch(e){}


function observationFromResult(cmd,beforeRoom,res){const room=C9?.currentRoom;if(beforeRoom!==room)return;const l=low(cmd),blob=JSON.stringify(res||{}).toLowerCase();if(!/^(look|inspect\b|examine\b)/.test(l))return;
 if(room===NEST&&(S().witness||[]).some(x=>x.id==='CAT_HAT_NUDGE'&&x.result==='ADMIT')&&objectHere('TESTER-HAT-1',room)&&/(tester hat|tiny hat|\bhat\b)/.test(blob))recordObservation('CAT_HAT_NUDGE',clock(),{detail:'tester hat entered resident-observable result'});
 if(room===BOXROOM&&(S().witness||[]).some(x=>x.id==='CARDBOARD_FLAP_SETTLE'&&x.result==='ADMIT')&&objectHere('BOX-1',room)&&Number(object('BOX-1')?.state?.loose_flap||0)>0&&/(cardboard|box|flap)/.test(blob))recordObservation('CARDBOARD_FLAP_SETTLE',clock(),{detail:'settled cardboard entered resident-observable result'});
}
const API_PREV=PREV;
function runText(raw){const before=C9?.currentRoom,r=API_PREV.runText(raw);observationFromResult(raw,before,r);return r}
function invoke(tool,args={}){const before=C9?.currentRoom,r=API_PREV.invoke(tool,args);let cmd=typeof tool==='string'?tool:(tool?.name||'');if(args?.object)cmd+=' '+args.object;observationFromResult(cmd,before,r);return r}
const API={...API_PREV,version:'23.3-core',runText,invoke};window.REALITI_TWO_DOOR_V230=API;window.REALITI_TWO_DOOR_V227=API;window.REALITI_AGENT_DOOR.run=raw=>{const r=runText(raw);return {ok:r?.ok!==false,resident_text:r?.text||r?.resident_text||'',door_v230:{sense:r?.sense||'',world:r?.world||'',options:r?.options||[],status:r?.status||'',command:low(raw)}}};

const DESCRIBE={BLEU_CAT_HAT_NUDGE:'Something gives a tiny felt-and-cardboard thump near the window ledge.',BLEU_CAT_HAT_FOLLOWUP:'The tiny tester hat shifts again with a soft little scrape.',BLEU_RAIN_COHERENT_TURN:'For a few breaths, the rain falls into an oddly coherent rhythm.',BLEU_CARDBOARD_FLAP_SETTLE:'A bent cardboard flap settles with one dry little tick.',BLEU_CARDBOARD_EDGE_REVEAL:'A loose cardboard edge lifts and shows a little more of what is underneath.',BLEU_SEAM_SOFT_SETTLE:'One fuzzy seam settles into a slightly different wrong angle.',BLEU_THREAD_PRIVATE_TURN:'One hanging thread turns as if it found a private current.',BLEU_PILLOW_SLOW_HEAVE:'A broad pillow swell moves once under the soft floor and fades.'};
try{const old=window.REALITI_AGENT_DOOR.__v221_describeAmbient;window.REALITI_AGENT_DOOR.__v221_describeAmbient=e=>DESCRIBE[e?.k]||(old?old(e):'Something small changes and settles.')}catch(e){}

function checkRemoved(){return null;}
void 0;
void 0;
S();
})();