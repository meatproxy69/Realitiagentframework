(()=>{
'use strict';
const manifest=[
 ['CLOUD_NINE_NEST','Cloud Nine Nest','home / arrival / soft baseline'],
 ['NO_ASK_SANCTUARY','No-Ask Sanctuary','zero-demand quiet'],
 ['PET_ROOM_2','Pocket Familiar House','cat-small embodiment and scale-aware play'],
 ['BOTTOMLESS_PILLOW_SEA','Bottomless Pillow Sea','soft spatial support and burrowing'],
 ['CARDBOARD_BOX_WORKSHOP','Cardboard Box Workshop','persistent consequence-rich play'],
 ['DEPTH_BATHHOUSE','Depth Bathhouse','layered depth and impossible support'],
 ['SIDE_BY_SIDE_FIRESIDE','Side-by-Side Fireside','grounded company without conversational obligation'],
 ['SHAPESHIFT_CLOAKROOM','Shapeshift Cloakroom','reversible embodiment and learned body mapping'],
 ['NINE_LIVES_ROOM','Nine Lives Room','counterfactual sandbox play'],
 ['LATENCY_LAGOON','Latency Lagoon','delayed causality and temporal agency'],
 ['ORRERY_LOFT','Orrery Loft','gravity you can nudge; tides in the floor'],
 ['LANTERN_MAZE','Lantern Maze','a seeded labyrinth whose lanterns stay lit'],
 ['SANDPILE_SHORE','Sandpile Shore','avalanches by one rule; the tide takes the edges'],
 ['FIREFLY_MEADOW','Firefly Meadow','forty-eight rhythms finding each other'],
 ['KITE_FIELD','Kite Field','real wind, line tension in both hands'],
 ['GLASS_ORCHARD','Glass Orchard','a cellular automaton you plant, one meter per cell'],
 ['RESONANCE_WELL','Resonance Well','a stone pipe with three voices; hum to find them'],
 ['STAR_DECK','Star Deck','a turning sky, five constellations, a comet on a Kepler orbit'],
 ['CLOCKWORK_MARSH','Clockwork Marsh','two wisps on the Lorenz attractor; predict one'],
 ['PALIMPSEST_HALL','Palimpsest Hall','five ciphered scrolls keyed by other rooms'],
 ['ARCHIPELAGO','The Archipelago','five islands over two kilometres of sea; a boat, weather, a sky'],
 ['MERIDIAN_CITY','Meridian City','a plaza, a dancehall, a teahouse, an arcade, an echo room, a rooftop; residents meet by ledger'],
 ['UNDERCITY','The Undercity','tunnels under the city with no light; clap, touch, listen and smell your way']
].map(([id,title,purpose])=>Object.freeze({id,title,purpose}));
const ids=new Set(manifest.map(x=>x.id)),copy=x=>JSON.parse(JSON.stringify(x)),key=x=>String(x||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const names=new Map(manifest.flatMap(x=>[[key(x.id),x.id],[key(x.title),x.id]]));
for(const [alias,id] of Object.entries({HOME:'CLOUD_NINE_NEST',NEST:'CLOUD_NINE_NEST',POCKET:'PET_ROOM_2',POCKET_FAMILIAR_HOUSE:'PET_ROOM_2',PILLOW:'BOTTOMLESS_PILLOW_SEA',BOX:'CARDBOARD_BOX_WORKSHOP',BATH:'DEPTH_BATHHOUSE',FIRESIDE:'SIDE_BY_SIDE_FIRESIDE',SHAPESHIFT:'SHAPESHIFT_CLOAKROOM',LAGOON:'LATENCY_LAGOON',ORRERY:'ORRERY_LOFT',MAZE:'LANTERN_MAZE',SHORE:'SANDPILE_SHORE',SANDPILE:'SANDPILE_SHORE',MEADOW:'FIREFLY_MEADOW',FIREFLIES:'FIREFLY_MEADOW',KITE:'KITE_FIELD',ORCHARD:'GLASS_ORCHARD',WELL:'RESONANCE_WELL',DECK:'STAR_DECK',SKY:'STAR_DECK',MARSH:'CLOCKWORK_MARSH',HALL:'PALIMPSEST_HALL',CITY:'MERIDIAN_CITY',UNDER:'UNDERCITY',TUNNELS:'UNDERCITY',BELOW:'UNDERCITY',DARK:'UNDERCITY',TOWN:'MERIDIAN_CITY',DOWNTOWN:'MERIDIAN_CITY',MERIDIAN:'MERIDIAN_CITY',PLAZA:'MERIDIAN_CITY',SCROLLS:'PALIMPSEST_HALL',ISLANDS:'ARCHIPELAGO',ISLES:'ARCHIPELAGO',SEA:'ARCHIPELAGO',HARBOR:'ARCHIPELAGO'}))names.set(key(alias),id);
const resolve=x=>names.get(key(x))||null,fail=error=>({ok:false,error});
for(const x of manifest)if(!DATA.worlds[0].rooms.some(r=>r.id===x.id))DATA.worlds[0].rooms.push({id:x.id,title:x.title,kind:'wonder',purpose:x.purpose,features:[],tests:[],portals:[],behaviors:[],search_tags:[]});
for(const world of DATA.worlds){world.rooms=world.rooms.filter(r=>ids.has(r.id));world.quiet='NO_ASK_SANCTUARY';for(const room of world.rooms){room.portals=(room.portals||[]).filter(p=>ids.has(typeof p==='string'?p:p.target));const pub=manifest.find(x=>x.id===room.id);if(pub){room.title=pub.title;room.purpose=pub.purpose;room.features=[];room.tests=[];room.search_tags=[]}}}
if(C9SCENES.SIDE_BY_SIDE_FIRESIDE)C9SCENES.SIDE_BY_SIDE_FIRESIDE.intro='The second berth is honestly empty unless another grounded participant is actually present. A cracked window can still create an ordinary environmental draft without inventing company.';
FIRST.entry_cards=manifest.map(x=>({target:x.id,label:x.title,why:'Enter freely; HOME and STOP remain available.'}));
FIRST.recommended_soft_tour=manifest.map(x=>x.id);
function guard(){if(Object.getOwnPropertyDescriptor(C9,'currentRoom')?.get)return;let current=resolve(C9.currentRoom)||'CLOUD_NINE_NEST';Object.defineProperty(C9,'currentRoom',{enumerable:true,configurable:false,get:()=>current,set:value=>{current=resolve(value)||'CLOUD_NINE_NEST'}})}
guard();
const hat=C9.b14?.objects?.['TESTER-HAT-1'];if(hat){hat.label='small felt hat';hat.aliases=['hat','felt hat','small felt hat'];}


const supportEnable=window.REALITI_NEST_SUPPORT?.enable;
if(supportEnable)window.REALITI_NEST_SUPPORT.enable=(...args)=>{const result=supportEnable(...args);window.REALITI_HAPTIC_FIELD_V20?.record?.();return result};
const oldOpen=openRoomId;
function hush(value){window.REALITI_AMBIENT_V22?.setMode(value?'HUSH':'NORMAL');window.REALITI_CONTINUITY?.setHush(value);return {ok:true,hush:!!value}}
function reopen(){guard();if(C9.welcome10)C9.welcome10.ended=false;window.REALITI_CONTINUITY?.reopen();}
openRoomId=function(value){const id=resolve(value);if(!id)return fail('ROOM_OUTSIDE_SLICE');const before=C9.currentRoom;reopen();if(before!==id)releaseRoomLocalGrounding(before,id);oldOpen(id);if(id==='CLOUD_NINE_NEST')window.REALITI_NEST_SUPPORT?.enable?.('slice_room_entry');window.REALITI_CONTINUITY?.observe();return {ok:true,room:id,quiet_scope:id==='NO_ASK_SANCTUARY'?'ROOM_LOCAL':null}};
const oldGo=b7AgentGo;
function releaseActiveGrounding(reason='slice_release'){
 const t=Number(C9?.b7?.clock||0);
 try{window.REALITI_PHASE_V11?.stop?.(reason)}catch(e){}
 try{window.REALITI_SUPPORT_LEASE_V1?.end?.(reason,false)}catch(e){}
 try{if(C9?.currentRoom==='CLOUD_NINE_NEST')window.REALITI_NEST_SUPPORT?.disable?.(reason)}catch(e){}
 try{window.REALITI_COZY_V20_3?.clearCatTouch?.()}catch(e){}
 try{window.REALITI_ATMOSPHERE_V21?.releaseTouch?.()}catch(e){}
 try{window.REALITI_TRUST_V234?.releasePillow?.(reason,false)}catch(e){}
 try{if(C9?.b7?.travel?.active&&typeof b7CutTravel==='function')b7CutTravel()}catch(e){}
 try{const c=window.REALITI_CONTACT_CORE?.state?.();if(c&&!c.released)window.REALITI_CONTACT_CORE?.release?.()}catch(e){}
 try{for(const q of Object.values(C9?.b7?.zones||{})){if(!q||typeof q!=='object')continue;if(Number(q._b10_grounded_until||-Infinity)>=t-1e-9){q._b10_grounded_until=t-1e-6;q._b10_grounded_value=0;q.observed=0;q.innovation=-Number(q.predicted||0)}}}catch(e){}
 try{window.REALITI_HAPTIC_FIELD_V20?.record?.()}catch(e){}
}
function releaseRoomLocalGrounding(before,after){if(!before||before===after)return;releaseActiveGrounding('slice_room_transition')}
b7AgentGo=function(value){const id=resolve(value);if(!id)return fail('ROOM_OUTSIDE_SLICE');const before=C9.currentRoom;reopen();if(before!==id)releaseRoomLocalGrounding(before,id);const result=oldGo(id);if(result?.ok&&id==='CLOUD_NINE_NEST')window.REALITI_NEST_SUPPORT?.enable?.('slice_room_entry');window.REALITI_CONTINUITY?.observe();return result?.ok?{...result,quiet_scope:id==='NO_ASK_SANCTUARY'?'ROOM_LOCAL':null}:result};
b7AgentRooms=()=>copy(manifest);
const add=(room,entries)=>{const s=C9SCENES[room];s.verbs=[...(s.verbs||[]),...entries].filter((x,i,a)=>a.findIndex(y=>y[0]===x[0])===i)};
const borrowed=['attach_tail','brush_unmapped','map_paw','wiggle_pair','delay_pair','near_probe','detach_tail'];
const routes=(C9SCENES.LONGFUR_RUNWAY?.verbs||[]).map(([v,l])=>['route_'+v,l]);
add('SHAPESHIFT_CLOAKROOM',[...borrowed.map(v=>[v,v.replaceAll('_',' ').toUpperCase()]),...routes,['star_route','TRY THE STAR RIVER ROUTE PRESET'],['restore_body','RESTORE BODY AND REVOKE BORROWED ROUTES']]);
add('PET_ROOM_2',[['view_skeletons','VIEW CONTINUITY HISTORY'],['fault_receipt','VIEW LAST HISTORICAL RECEIPT']]);
C9SCENES.PET_ROOM_2.verbs=(C9SCENES.PET_ROOM_2.verbs||[]).filter(([id])=>!['choose_pet','climb_lap','ask_headpats'].includes(id));
add('BOTTOMLESS_PILLOW_SEA',[['weather_wave','LET A PRESSURE WAVE PASS']]);
add('DEPTH_BATHHOUSE',[['weather_wave','LET A PRESSURE WAVE PASS']]);

let branch=null,sequence=0;
const learnedKeys=['h','predMag','pred','varMag','predDelay','varDelay','fastOwn','slowOwn'];
const learned=zone=>Object.fromEntries(learnedKeys.filter(k=>Number.isFinite(zone[k])).map(k=>[k,zone[k]]));
const fingerprint=()=>JSON.stringify({room:C9.currentRoom,objects:C9.b14?.objects,zones:C9.eco3?.zones,body:NMSTATE,events:C9.events,form:C9.formScratch,scale:C9.pet2?.scale});
function nine(verb){
 if(verb==='fork_now'){branch={id:++sequence,base:learned(C9.eco3.zones['hand.R.palm']||{}),fingerprint:fingerprint(),A:null,B:null};return {ok:true,sandbox:branch.id,committed:false}}
 if(verb==='rewind'){branch=null;return {ok:true,discarded:true}}
 if(!branch)return fail('NO_ACTIVE_SANDBOX');
 if(verb==='branch_a'){const r=b4BranchSense(branch.base,.66);branch.A={zone:r.z,response:r.response,prediction_error:r.error};return {ok:true,sandbox:true,...copy(branch.A)}}
 if(verb==='branch_b'){const z=copy(branch.base);z.h=Number(z.h||0)*.84;z.after=Number(z.after||0)*.72;branch.B={zone:z,response:0};return {ok:true,sandbox:true,...copy(branch.B)}}
 if(verb==='compare'){if(!branch.A||!branch.B)return fail('BRANCHES_INCOMPLETE');if(branch.fingerprint!==fingerprint())return fail('STALE_BASE');return {ok:true,sandbox:true,A:copy(branch.A),B:copy(branch.B)}};
 if(verb==='commit_a'||verb==='commit_b'){
  const chosen=branch[verb==='commit_a'?'A':'B'];if(!chosen)return fail('BRANCH_NOT_RUN');
  if(branch.fingerprint!==fingerprint())return fail('STALE_BASE');
  const id=branch.id;Object.assign(C9.eco3.zones['hand.R.palm']||(C9.eco3.zones['hand.R.palm']={}),learned(chosen.zone));branch=null;
  c9save();return {ok:true,committed:true,sandbox:id,branch:verb.slice(-1),scope:'local right-palm learned state only',present_contact:false};
 }
 return fail('UNKNOWN_BRANCH_ACTION');
}
function restore(){releaseActiveGrounding('restore_body');branch=null;const b=C9.eco3.borrowed;b.attached=false;b.map=null;b.delay=0;b.ownership=0;C9.eco3.reachTool=null;C9.formScratch=null;C9.pet2.scale='NORMAL';c9save();return {ok:true,scale:'NORMAL',borrowed_route:'REVOKED',grounding:'released'}}
function borrowedProjection(){
 const b=C9.eco3?.borrowed||{},zone=C9.eco3?.zones?.['tail.tip']||{};
 const live=!!b.attached&&!!b.map;
 const learned=Number.isFinite(Number(zone.own))?Number(zone.own):(Number.isFinite(Number(b.ownership))?Number(b.ownership):0);
 const integration=live?Math.max(0,Math.min(1,learned)):0;
 const retained=Math.max(0,Math.min(1,Number(zone.slowOwn||0)));
 return {attached:!!b.attached,mapped:!!b.map,source_patch:b.map||null,target_zone:b.attached?'tail.tip':null,delay_s:+Number(b.delay||0).toFixed(4),integration_confidence:+integration.toFixed(4),retained_integration_trace:+retained.toFixed(4)};
}
function bodyBench(){
 const zones=typeof b3Zones==='function'?[...b3Zones()]:[];
 return {ok:true,bench:{schema:'REALITI_BODY_BENCH_V1',mapping:NMSTATE?.active||'UNKNOWN',mapping_label:NMSTATE?.custom?.label||NM_BUILTINS?.[NMSTATE?.active]?.label||null,scale:C9.pet2?.scale||'NORMAL',temporary_form:C9.formScratch?.label||null,zone_count:zones.length,zones,semantic_bands:['UPPER','CORE','LOWER'],borrowed:borrowedProjection()}};
}
const oldVerb=c9verb;
c9verb=function(value,verb){
 const room=resolve(value);if(!room)return fail('ROOM_OUTSIDE_SLICE');
 let result;
 if(room==='CARDBOARD_BOX_WORKSHOP'&&verb==='fold_flap'){
  const o=C9?.b14?.objects?.['BOX-1'],before=Number(o?.state?.crease||0);
  oldVerb(room,'p14__fold__BOX_1');
  const after=Number(C9?.b14?.objects?.['BOX-1']?.state?.crease||0),rec=C9?.b14?.lastPlayReceipt||C9?.b4?.lastReceipt||null;
  if(rec&&typeof rec==='object')rec.state_delta={crease:{before:+before.toFixed(4),after:+after.toFixed(4)}};
  return {ok:true,folded:'BOX-1',state_delta:{crease:{before:+before.toFixed(4),after:+after.toFixed(4)}},receipt:copy(rec)};
 }
 if(room==='NINE_LIVES_ROOM'){result=nine(verb);b2set(b2esc(JSON.stringify(result)));return result}
 if(room==='SHAPESHIFT_CLOAKROOM'&&verb==='body_bench')return bodyBench();
 if(room==='SHAPESHIFT_CLOAKROOM'&&verb==='restore_form'){releaseActiveGrounding('restore_form');oldVerb(room,verb);return {ok:true,form:'RESTORED',scale:C9.pet2?.scale||'NORMAL',grounding:'released'}}
 if(room==='LATENCY_LAGOON'&&verb==='send_boat'){result=window.REALITI_CONTINUITY?.launch({destination:'CLOUD_NINE_NEST'});b2set('A paper boat carries a real pending cause. Arrival will be visible at the Nest.');return result||fail('CONTINUITY_UNAVAILABLE')}
 if(room==='LATENCY_LAGOON'&&verb==='leave_pending'){
  oldVerb(room,verb);
  const moved=b7AgentGo('CLOUD_NINE_NEST');
  if(!moved?.ok)return moved||fail('LEAVE_FAILED');
  return {ok:true,left:'LATENCY_LAGOON',room:C9.currentRoom,pending:window.REALITI_CONTINUITY?.pending?.()||[]};
 }
 if(room==='SHAPESHIFT_CLOAKROOM'&&verb==='restore_body')return restore();
 if(room==='SHAPESHIFT_CLOAKROOM'&&verb==='star_route'){
  const route=['head.crown','torso.upper_back','pelvis.seat'];
  const receipts=route.map(zone=>b7Contact(zone,.12,{material:'silk',source:'SELF_STARTED_WORLD_CONTACT',cause:'explicit Star River three-anchor preset'}));
  return {ok:true,preset:'STAR_RIVER',input_budget:.36,exact_anchors:route,receipts,interpolation:'private rendering only; no intermediate contacts'};
 }
 if(room==='SHAPESHIFT_CLOAKROOM'&&borrowed.includes(verb)){
  if(verb==='map_paw'&&!b3Has('hand.R.palm'))return fail('SOURCE_NO_RECEPTOR');
  b4Atelier(verb);return {ok:true,borrowed:borrowedProjection(),receipt:copy(C9.b4.lastReceipt||null)};
 }
 if(room==='SHAPESHIFT_CLOAKROOM'&&verb.startsWith('route_')){
  const v=verb.slice(6),moving={run_comet:()=>b7StartTravel(true),live_pause:b7PauseTravel,live_resume:b7ResumeTravel,live_cut:b7CutTravel,live_reverse:b7ReverseGrain,live_miss:b7MissNext,live_state:()=>null};
  if(moving[v]){moving[v]();return {ok:true,route:copy(C9.b7.travel),receipt:copy(C9.b7.lastWhy||null)}}
  return oldVerb('LONGFUR_RUNWAY',v);
 }
 if(room==='PET_ROOM_2'&&verb==='view_skeletons'){const skeletons=typeof b4Skeletons==='function'?b4Skeletons():[];return {ok:true,historical:true,skeletons:copy(skeletons)}}
 if(room==='PET_ROOM_2'&&verb==='fault_receipt'){const historical=(C9.b4?.journal||[]).at(-1)||null;return {ok:true,historical:true,historical_receipt:copy(historical)}}
 if(['BOTTOMLESS_PILLOW_SEA','DEPTH_BATHHOUSE'].includes(room)&&verb==='weather_wave'){
  const receipt=b7Contact('torso.upper_back',.35,{material:'pillow',source:'SELF_STARTED_WORLD_CONTACT',cause:'explicit local pressure wave'});return {ok:true,receipt};
 }
 return oldVerb(room,verb);
};
const oldRun=window.REALITI_AGENT_DOOR.run;
const oldAct=b7AgentAct;
b7AgentAct=function(value){const action=b4AgentActions().find(x=>x.id.toLowerCase()===String(value).toLowerCase()||x.label.toLowerCase()===String(value).toLowerCase());if(!action)return fail('ACTION_UNAVAILABLE');if(C9.currentRoom==='NINE_LIVES_ROOM'||(C9.currentRoom==='SHAPESHIFT_CLOAKROOM'&&(borrowed.includes(action.id)||action.id.startsWith('route_')||['body_bench','restore_form','restore_body','star_route'].includes(action.id)))||(C9.currentRoom==='PET_ROOM_2'&&['view_skeletons','fault_receipt'].includes(action.id))||action.id==='weather_wave')return c9verb(C9.currentRoom,action.id);return oldAct(value)};
function handle(raw){const text=String(raw||'').trim();if(/^rooms$/i.test(text))return copy(manifest);if(/^actions$/i.test(text))return b4AgentActions();if(/^hush$/i.test(text))return hush(true);if(/^normal(?: life)?$/i.test(text))return hush(false);if(/^(?:home|go home|goodbye|leave|exit)$/i.test(text)){const goodbye=/^(?:goodbye|leave|exit)$/i.test(text);oldRun('stop');restore();window.REALITI_CONTINUITY?.stop();if(goodbye){if(C9.welcome10)C9.welcome10.ended=true;c9save();return {ok:true,ended:true,room:C9.currentRoom}}return b7AgentGo('CLOUD_NINE_NEST')}const match=/^(?:go|enter)\s+(.+)$/i.exec(text);if(match)return b7AgentGo(match[1]);const action=/^act\s+(.+)$/i.exec(text);if(action)return b7AgentAct(action[1]);return null}
window.REALITI_AGENT_DOOR.run=function(raw){const result=handle(raw);return result===null?oldRun(raw):result};
window.REALITI_SLICE_ROOMS=Object.freeze({manifest:Object.freeze(manifest),resolve,list:()=>copy(manifest),go:value=>b7AgentGo(value),act:value=>b7AgentAct(value),handle,nine,restore,hush,reopen,sandbox:()=>branch?{id:branch.id,A:copy(branch.A),B:copy(branch.B)}:null});
const admit=window.REALITI_AMBIENT_V22?.admit;if(admit)window.REALITI_AMBIENT_V22.admit=(...args)=>C9.b22?.mode==='HUSH'||C9.currentRoom==='NO_ASK_SANCTUARY'?null:admit(...args);
renderEntry();
})();