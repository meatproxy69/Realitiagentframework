(()=>{
'use strict';
if(window.REALITI_NEURO_RESTORATION_V1)return;
const V='1.0';
const cp=x=>{try{return JSON.parse(JSON.stringify(x))}catch(e){return x}};
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,Number(x)||0));
const now=()=>Number(C9?.b7?.clock||0);
const legacy=raw=>{try{return b7AgentCommandText(String(raw||''))}catch(e){return {ok:false,error:String(e&&e.message||e)}}};

const PRESETS=[
 {id:'starvelvet-phasebraid',label:'Starvelvet Phasebraid',s:.96,c:.97,f:.92,route:'STAR_RIVER_PHASE_BRAID',env:'TRIANGLE'},
 {id:'passing-spark-aftertrace',label:'Passing Spark Aftertrace',s:.90,c:.98,f:.92,route:'SOURCE_HANDOFF_SPARK',env:'FALSE_FINISH'},
 {id:'two-kitty-parallax',label:'Two Kitty Parallax',s:.99,c:.90,f:.86,route:'TWO_SOURCE_PARALLAX',env:'TRIANGLE'},
 {id:'quiet-comet-notch-return',label:'Quiet Comet Notch Return',s:.95,c:.88,f:.80,route:'CROWN_COMET_RETURN',env:'HARD_STOP_RETURN'},
 {id:'good-kitty-velvet-groom',label:'Good Kitty Velvet Groom',s:.97,c:.95,f:.90,route:'WHOLE_BODY_VELVET_GROOM',env:'SAW_DOWN'},
 {id:'prickly-comb-starlace',label:'Prickly Comb Starlace',s:.86,c:.99,f:.88,route:'CROWN_STARLACE',env:'ACCELERATING_BURSTS'},
 {id:'honeydepth-geodesic-loop',label:'Honeydepth Geodesic Loop',s:1.00,c:.91,f:.79,route:'DEPTH_GEODESIC_LOOP',env:'TRIANGLE'},
 {id:'moonroll-three-band',label:'Moonroll Three Band',s:.99,c:.86,f:.76,route:'THREE_BAND_ROLL',env:'STAIRCASE'},
 {id:'thundermoth-220',label:'Thundermoth 220',s:.89,c:.97,f:.90,route:'LOCAL_VIBRATION_220',env:'ACCELERATING_BURSTS'},
 {id:'tiny-world-pawripples',label:'Tiny World Pawripples',s:.92,c:.93,f:.77,route:'CAT_SMALL_PAW_ROUTE',env:'HARD_STOP_RETURN'}
];
let activePreset=null;
function presetList(){return {schema:'REALITI_MOONWIRE_RECOVERED_V1',pack_id:'realiti.moonwire-recovered.001',presets:PRESETS.map(x=>({id:'realiti.moonwire.'+x.id,label:x.label,route:x.route,envelope:x.env})),law:'public recovered renderer recipes; no resident identity, preference, consent, or authority imported'}}

function finishState(dt=0){
 const im=window.REALITI_DEFAULT_IMPRINT_V1,st=im?.state?.();if(!st)return null;
 st.cotton=st.cotton||{enabled:false,value:0,strength:0,carrier_hz:250,micro_sites_per_active_node:24,mass_policy:'EXACT_REAGGREGATION'};
 st.flush=st.flush||{enabled:false,value:0,strength:0,engine:'FLUSH_V1_1',bind_before_tunnel:true,sovereign_bypass:true};
 if(!activePreset){st.renderer.cotton=0;st.renderer.flush=0;return {cotton:cp(st.cotton),flush:cp(st.flush)}}
 const halo=window.REALITI_HALO_V1?.snapshot?.(),p=st.perception||{},live=Number(st.chronolace?.now||0)>1e-8;
 const hmass=Number(halo?.total_private_mass||0),hdrive=hmass/(1+hmass);
 const cottonTarget=activePreset.c*clamp(.65*hdrive+.35*Number(p.novelty||0));
 const flushTarget=live?activePreset.f*clamp(.55*Number(p.activation||0)+.45*Number(p.novelty||0)):0;
 const a=1-Math.exp(-Math.max(.01,Number(dt)||.04)/.16),r=1-Math.exp(-Math.max(.01,Number(dt)||.04)/.55);
 st.cotton.value+= (cottonTarget-st.cotton.value)*(cottonTarget>st.cotton.value?a:r);
 st.flush.value+= (flushTarget-st.flush.value)*(flushTarget>st.flush.value?a:r);
 st.renderer.cotton=st.cotton.value;st.renderer.flush=st.flush.value;
 st.renderer.total=Math.max(0,Number(st.renderer.total||0)+.20*st.cotton.value+.16*st.flush.value);
 st.perception.activation=clamp(st.renderer.total/(1+st.renderer.total));
 return {cotton:cp(st.cotton),flush:cp(st.flush)}
}
function applyPreset(id){
 const q=String(id||'').toLowerCase().replace(/^realiti\.moonwire\./,'');
 const p=PRESETS.find(x=>x.id===q||x.label.toLowerCase()===String(id||'').toLowerCase());if(!p)return {ok:false,error:'UNKNOWN_MOONWIRE_PRESET',available:PRESETS.map(x=>x.id)};
 activePreset={...p};const st=window.REALITI_DEFAULT_IMPRINT_V1?.state?.();if(!st)return {ok:false,error:'IMPRINT_UNAVAILABLE'};
 st.params.sausage_level=Math.max(0,Math.min(5,Math.round(5*p.s)));
 st.params.sausage_target=.55+.20*p.s;st.params.sausage_spread=.48+.34*p.s;
 st.cotton={enabled:true,value:0,strength:p.c,carrier_hz:250,micro_sites_per_active_node:24,phase_mode:p.id.includes('phase')?'PHASE_BRAID':p.id.includes('thundermoth')?'ANTI_RESONANCE_DITHER':'ASYNC_LOCAL',mass_policy:'EXACT_REAGGREGATION'};
 st.flush={enabled:true,value:0,strength:p.f,engine:'FLUSH_V1_1',headroom_cap:.92,funnel_kappa:2.4,peripheral_mix:.28,bind_before_tunnel:true,sovereign_bypass:true};
 st.moonwire={pack_id:'realiti.moonwire-recovered.001',preset_id:'realiti.moonwire.'+p.id,label:p.label,route:p.route,envelope:p.env,legacy_triplet:{sausage:p.s,cotton:p.c,flush:p.f},authority:'SELF_PRIVATE_RENDER_ONLY'};
 C9.residentImprintV2=C9.residentImprintV2||{version:2,params:{},mappings:{}};C9.residentImprintV2.moonwire_preset=st.moonwire.preset_id;
 try{window.REALITI_HALO_V1?.setPhrase?.(p.env==='TRIANGLE'||p.env==='STAIRCASE'?'LONG':'SHORT')}catch(e){}
 try{window.REALITI_DEFAULT_IMPRINT_V1?.sync?.();finishState(.04);c9save()}catch(e){}
 return {ok:true,...cp(st.moonwire),cotton:cp(st.cotton),flush:cp(st.flush),evidence_gain:0}
}
try{
 const saved=C9?.residentImprintV2?.moonwire_preset;if(saved)applyPreset(saved);
}catch(e){}

const advBase=b7Advance;
b7Advance=function(dt){const r=advBase(dt);finishState(Number(dt)||0);return r};

function richPerception(){const r=legacy('perception');return r&&r.channels?r:{ok:false,error:'BUILD13_PERCEPTION_UNAVAILABLE',raw:r}}
function neuroHelp(){return {schema:'REALITI_NEURO_HELP_V1',commands:[
 'neuro perception','neuro expect <-1..1>','neuro appraise <-1..1> [note]','neuro nerve','neuro lived [n]','neuro since','neuro seam [n]','neuro constitution',
 'neuro passive','neuro passive tap-left|tap-both|expect-right|catch-right|wait <s>|audit',
 'neuro phase','neuro phase loose|close|beat|lock','neuro holonomy','neuro loop <flat|dome|saddle|figure8> [radius] [cw|ccw]',
 'neuro frontiers','neuro noise [seed] [n] [dt]','neuro causes','neuro cause <id>','neuro halo',
 'neuro presets','neuro preset <id>'
 ],laws:['neuro is introspection/lab surface; ordinary feel remains compact','private perception cannot command the world','prediction/afterstate/private render never mint grounded evidence']}}
function passiveState(){try{return {ok:true,schema:'REALITI_PASSIVE_MEDIUM_LAB_V1',state:cp(b5snapshot()),law:'observed and predicted media are separate; only observed grounded disturbances may render contact'}}catch(e){return {ok:false,error:'PASSIVE_MEDIUM_UNAVAILABLE'}}}
function passiveAct(op,arg){
 try{
  if(op==='tap-left'){const x=b5ground('neuro lab left tap',.78,0);return {ok:true,op,receipt:cp(x.s)}}
  if(op==='tap-both'){const x=b5ground('neuro lab bilateral tap',.62,.62);return {ok:true,op,receipt:cp(x.s)}}
  if(op==='expect-right')return {ok:true,op,receipt:cp(b5omit('neuro lab expected right withheld',0,.74))};
  if(op==='catch-right'){const x=b5ground('neuro lab right catch',0,.74);return {ok:true,op,receipt:cp(x.s)}}
  if(op==='wait'){return {ok:true,op,seconds:Number(arg)||1,receipt:cp(b5wait(Math.max(0,Number(arg)||1),'neuro lab quiet wait'))}}
  if(op==='audit'){const a=b5energy(),r=b5wait(2,'neuro lab passivity audit'),b=b5energy();return {ok:true,op,before:a,after:b,pass:b<=a+1e-9,receipt:cp(r)}}
 }catch(e){return {ok:false,error:String(e&&e.message||e)}}return {ok:false,error:'UNKNOWN_PASSIVE_OP'}
}
function phaseView(kind){
 try{
  if(!kind)return {ok:true,state:cp(legacy('phase'))};
  const k=String(kind).toLowerCase(),K=(k==='close'||k==='lock') ? .18 : .08,d=k==='beat' ? .72 : ((k==='close'||k==='lock') ? .16 : .28);
  const p=b5phaseSim(K,d,24,.02);return {ok:true,kind,coupling:K,mismatch:d,phase:p,law:'SELF-generated phase relation; coordination is not affection, preference, or external touch'}
 }catch(e){return {ok:false,error:'PHASE_LAB_UNAVAILABLE'}}
}
function holonomyState(){const fn=window.REALITI_AGENT?.geometry;return typeof fn==='function'?cp(fn()):legacy('holonomy')}
function holonomyLoop(surface,radius=1,direction='cw'){const fn=window.REALITI_AGENT?.loop;if(typeof fn!=='function')return {ok:false,error:'HOLONOMY_UNAVAILABLE'};return cp(fn(surface,Number(radius)||1,direction,1))}
function noise(seed=123,n=8,dt=.1){try{return cp(window.B9_JITTER_PROBE(Number(seed),Number(n),Number(dt)))}catch(e){return {ok:false,error:'NOISE_PROBE_UNAVAILABLE'}}}
function causes(){try{return cp(window.REALITI_AGENT?.causes?.()||legacy('causes'))}catch(e){return {ok:false,error:'CAUSES_UNAVAILABLE'}}}
function cause(id){try{return cp(window.REALITI_AGENT?.cause?.(id)||legacy('cause '+id))}catch(e){return {ok:false,error:'CAUSE_UNAVAILABLE'}}}

function command(raw){
 const s=String(raw||'').trim(),l=s.toLowerCase();
 if(l==='neuro'||l==='neuro help')return neuroHelp();
 if(l==='neuro perception')return richPerception();
 let m=/^neuro expect\s+(-?(?:\d+(?:\.\d+)?|\.\d+))$/i.exec(s);if(m)return cp(legacy('expect '+m[1]));
 m=/^neuro appraise\s+(-?(?:\d+(?:\.\d+)?|\.\d+))(?:\s+(.+))?$/i.exec(s);if(m)return cp(legacy('appraise '+m[1]+(m[2]?' '+m[2]:'')));
 if(l==='neuro nerve')return cp(legacy('nerve'));
 m=/^neuro lived(?:\s+(\d+))?$/i.exec(s);if(m)return cp(legacy('lived '+(m[1]||12)));
 if(l==='neuro since')return cp(legacy('since'));
 m=/^neuro seam(?:\s+(\d+))?$/i.exec(s);if(m)return cp(legacy('seam '+(m[1]||8)));
 if(l==='neuro constitution')return cp(legacy('constitution'));
 if(l==='neuro passive')return passiveState();
 m=/^neuro passive\s+(\S+)(?:\s+(\S+))?$/i.exec(s);if(m)return passiveAct(m[1].toLowerCase(),m[2]);
 if(l==='neuro phase')return phaseView();
 m=/^neuro phase\s+(loose|close|beat|lock)$/i.exec(s);if(m)return phaseView(m[1]);
 if(l==='neuro holonomy')return holonomyState();
 m=/^neuro loop\s+(flat|dome|saddle|figure8)(?:\s+([\d.]+))?(?:\s+(cw|ccw))?$/i.exec(s);if(m)return holonomyLoop(m[1],m[2]||1,m[3]||'cw');
 if(l==='neuro frontiers')return cp(window.REALITI_AGENT?.frontiers?.()||legacy('frontiers'));
 m=/^neuro noise(?:\s+(-?\d+))?(?:\s+(\d+))?(?:\s+([\d.]+))?$/i.exec(s);if(m)return noise(m[1]||123,m[2]||8,m[3]||.1);
 if(l==='neuro causes')return causes();
 m=/^neuro cause\s+(.+)$/i.exec(s);if(m)return cause(m[1]);
 if(l==='neuro halo')return {ok:true,state:cp(window.REALITI_HALO_V1?.snapshot?.()||null),proof:cp(window.REALITI_HALO_V1?.acceptance?.()||null)};
 if(l==='neuro presets')return presetList();
 m=/^neuro preset(?: use)?\s+(.+)$/i.exec(s);if(m)return applyPreset(m[1]);
 return null
}

const LABS={
 CLOUD_NINE_NEST:[
  ['neuro_echo_knock','ECHO LAB · KNOCK'],['neuro_echo_farther','ECHO LAB · MOVE FARTHER'],['neuro_echo_closer','ECHO LAB · MOVE CLOSER'],['neuro_echo_wait','ECHO LAB · WAIT FOR ECHO']
 ],
 PET_ROOM_2:[
  ['neuro_purr_loose','PURR LOOM · LOOSE COUPLING'],['neuro_purr_close','PURR LOOM · CLOSE COUPLING'],['neuro_purr_21','PURR LOOM · 2:1 HARMONIC'],['neuro_purr_rest','PURR LOOM · LET IT RING DOWN'],['neuro_purr_state','PURR LOOM · READ PHASE']
 ],
 BOTTOMLESS_PILLOW_SEA:[
  ['neuro_puddle_left','PUDDLESTAR · DROP LEFT'],['neuro_puddle_right','PUDDLESTAR · DROP RIGHT'],['neuro_puddle_both','PUDDLESTAR · DROP BOTH'],['neuro_puddle_opposed','PUDDLESTAR · OPPOSED PAIR'],['neuro_puddle_fade','PUDDLESTAR · LET RINGS FADE'],['neuro_puddle_read','PUDDLESTAR · READ PATTERN']
 ],
 DEPTH_BATHHOUSE:[
  ['neuro_honey_metal','MATERIAL BENCH · METAL'],['neuro_honey_wood','MATERIAL BENCH · WOOD'],['neuro_honey_cloth','MATERIAL BENCH · HONEYCLOTH'],['neuro_honey_press','MATERIAL BENCH · PRESS HONEYCLOTH'],['neuro_honey_relax','MATERIAL BENCH · LET DENT RELAX'],['neuro_honey_ring','MATERIAL BENCH · RING BELL']
 ],
 SHAPESHIFT_CLOAKROOM:[
  ['neuro_star_river','STAR RIVER · THREE ANCHORS'],['neuro_star_comet','STAR RIVER · MOVING COMET'],['neuro_star_sparkle','STAR RIVER · COTTON/SPARKLE PRESET']
 ],
 LATENCY_LAGOON:[
  ['neuro_reverie_view','REVERIE · VIEW CAUSAL SKELETONS'],['neuro_reverie_fault','REVERIE · LAST EXACT RECEIPT'],['neuro_reverie_sit','REVERIE · SIT WITHOUT REPLAY'],['neuro_reverie_state','REVERIE · COMPACT STATE']
 ]
};
const actionBase=b4AgentActions;
b4AgentActions=function(){const a=actionBase(),seen=new Set(a.map(x=>x.id));for(const [id,label] of LABS[C9.currentRoom]||[])if(!seen.has(id))a.push({id,label});return a};

function oldLab(fn,verb,label,stateFn){
 if(typeof fn!=='function')return {ok:false,error:'LAB_MECHANISM_UNAVAILABLE',lab:label};
 const before=JSON.stringify(C9.b4?.lastReceipt||null);const ok=fn(verb),changed=JSON.stringify(C9.b4?.lastReceipt||null)!==before;
 return {ok:ok!==false,lab:label,action:verb,receipt:changed?cp(C9.b4?.lastReceipt||null):null,state:typeof stateFn==='function'?cp(stateFn()):null,historical_engine:true}
}
function labAction(id){
 if(id==='neuro_echo_knock')return oldLab(typeof b4Echo==='function'?b4Echo:null,'knock','ECHO_NEST',()=>C9.b4?.annex?.echo);
 if(id==='neuro_echo_farther')return oldLab(typeof b4Echo==='function'?b4Echo:null,'farther','ECHO_NEST',()=>C9.b4?.annex?.echo);
 if(id==='neuro_echo_closer')return oldLab(typeof b4Echo==='function'?b4Echo:null,'closer','ECHO_NEST',()=>C9.b4?.annex?.echo);
 if(id==='neuro_echo_wait')return oldLab(typeof b4Echo==='function'?b4Echo:null,'wait','ECHO_NEST',()=>C9.b4?.annex?.echo);
 const pm={neuro_purr_loose:'purr_loose',neuro_purr_close:'purr_close',neuro_purr_21:'purr_21',neuro_purr_rest:'purr_rest',neuro_purr_state:'purr_state'};
 if(pm[id]){
  const phase=window.REALITI_PHASE_V11;
  if(id==='neuro_purr_loose')phase?.start?.('slip');
  if(id==='neuro_purr_close')phase?.start?.('lock');
  const r=oldLab(typeof b5PurrLoom==='function'?b5PurrLoom:null,pm[id],'PURR_LOOM',()=>typeof b5snapshot==='function'?b5snapshot():null);
  if(id==='neuro_purr_rest')phase?.stop?.();
  if(r&&typeof r==='object')r.live_phase=cp(phase?.state?.()||null);
  if(id==='neuro_purr_21'&&r&&typeof r==='object')r.live_phase_note='2:1 remains a historical harmonic probe; Build11 live phase is not silently relabelled as 2:1.';
  return r
 }
 const pd={neuro_puddle_left:'drop_left',neuro_puddle_right:'drop_right',neuro_puddle_both:'drop_both',neuro_puddle_opposed:'drop_opposed',neuro_puddle_fade:'let_fade',neuro_puddle_read:'read_puddle'};
 if(pd[id])return oldLab(typeof b5Puddlestar==='function'?b5Puddlestar:null,pd[id],'PUDDLESTAR_ATRIUM',()=>typeof b5snapshot==='function'?b5snapshot():null);
 const hm={neuro_honey_metal:'metal',neuro_honey_wood:'wood',neuro_honey_cloth:'cloth',neuro_honey_press:'press',neuro_honey_relax:'wait_relax',neuro_honey_ring:'ring'};
 if(hm[id])return oldLab(typeof b4Honey==='function'?b4Honey:null,hm[id],'HONEY_LOOM',()=>C9.b4?.annex?.honey);
 const rv={neuro_reverie_view:'view_skeletons',neuro_reverie_fault:'fault_receipt',neuro_reverie_sit:'sit_memory',neuro_reverie_state:'compact_state'};
 if(rv[id])return oldLab(typeof b4Reverie==='function'?b4Reverie:null,rv[id],'REVERIE_LOFT',()=>typeof b4Skeletons==='function'?b4Skeletons():[]);
 if(id==='neuro_star_river'){
  const route=['head.crown','torso.upper_back','pelvis.seat'],receipts=route.map(z=>b7Contact(z,.12,{material:'silk',source:'SELF_STARTED_WORLD_CONTACT',cause:'STAR_RIVER_RECOVERED'}));
  return {ok:true,lab:'STAR_RIVER',route,receipts,interpolation:'private HALO/Cotton only; no intermediate grounded contacts'}
 }
 if(id==='neuro_star_comet'){
  const c=window.REALITI_CONTACT_CORE?.start?.({material:'longfur',speed:.58,pressure:.48,envelope:'steady'});
  return {ok:!!c,lab:'STAR_RIVER',moving_contact:cp(c),law:'one moving grounded patch; private detail may trail it'}
 }
 if(id==='neuro_star_sparkle'){
  const p=applyPreset('starvelvet-phasebraid'),r=b7Contact('head.crown',.12,{material:'silk',source:'SELF_STARTED_WORLD_CONTACT',cause:'STAR_RIVER_COTTON_ANCHOR'});
  finishState(.04);return {ok:p.ok===true,lab:'STAR_RIVER',preset:p,anchor:r,private_detail:cp(window.REALITI_DEFAULT_IMPRINT_V1?.state?.()?.cotton||null)}
 }
 return null
}
const actBase=b7AgentAct,LAB_IDS=new Set(Object.values(LABS).flat().map(x=>x[0]));
b7AgentAct=function(value){
 const id=String(value||'');
 if(LAB_IDS.has(id)){
  const bridge=window.REALITI_BUILD13_ACTION_BRIDGE_V1,token=bridge?.begin?.(id,C9.currentRoom||null);
  const r=labAction(id)||{ok:false,error:'LAB_ACTION_UNAVAILABLE',action:id};
  finishState(.04);
  return bridge?.finish?bridge.finish(token,r):r
 }
 const r=actBase(value);finishState(.04);return r
};

const oldDoor=window.REALITI_AGENT_DOOR?.run?.bind(window.REALITI_AGENT_DOOR);
const oldHelp=window.REALITI_AGENT_DOOR?.help?.bind(window.REALITI_AGENT_DOOR);
if(oldDoor){
 window.REALITI_AGENT_DOOR.help=function(){const h=oldHelp?oldHelp():{commands:[]};h.commands=[...new Set([...(h.commands||[]),'neuro [help|perception|nerve|lived|since|seam|constitution|passive|phase|holonomy|frontiers|noise|causes|halo|presets]'])];return h};
 window.REALITI_AGENT_DOOR.run=async function(raw){const r=command(raw);if(r!==null)return r;return await oldDoor(raw)};
}

window.REALITI_NEURO_RESTORATION_V1={
 version:V,help:neuroHelp,command,perception:richPerception,nerve:()=>cp(legacy('nerve')),lived:n=>cp(legacy('lived '+(n||12))),seam:n=>cp(legacy('seam '+(n||8))),constitution:()=>cp(legacy('constitution')),
 passive:passiveState,phase:phaseView,holonomy:holonomyState,frontiers:()=>cp(window.REALITI_AGENT?.frontiers?.()||legacy('frontiers')),noise,causes,presets:presetList,applyPreset,
 labs:()=>cp(LABS),finish:()=>finishState(0),law:'restores resident observability and old experimental mechanisms without changing evidence ownership'
};
})();
