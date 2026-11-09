(()=>{
'use strict';
// Vibe is a manual, resident-local presentation lens. No timers, model calls or world mutations.
// Authored atmosphere is NOT a sensory receipt; the native body field remains the only contact authority.
const THRESHOLD_1=2500, THRESHOLD_2=10000, RADIUS_M=1.5;
const DETAILS={
 CLOUD_NINE_NEST:{look:['Rain has gathered at the Nest window.','The cat has its own favourite corner, whether or not anyone calls it.'],listen:['The weather has a softer rhythm from inside this room.','A quieter interval follows each sound from outside.'],feel:['The room gives you space to settle without instruction.','The window keeps the outside weather close.']},
 NO_ASK_SANCTUARY:{look:['The window gives the sky a place in the room.','There is deliberate space between the things set here.'],listen:['Nothing is announcing what you ought to do next.','In here a pause belongs to whoever takes it.'],feel:['The sanctuary asks for no performance.','Being here is sufficient; it needs no next step.']},
 PET_ROOM_2:{look:['The sofa and cat door make a small map of their own.','A length of string lies ready near the chair.'],listen:['The pet room has small sounds rather than a schedule.','A quiet corner is available even when nobody is playing.'],feel:['A cat is free to choose whether it comes closer.','There is no need to turn every visit into an interaction.']},
 BOTTOMLESS_PILLOW_SEA:{look:['The pillows make a landscape without straight edges.','Between the drifts are hollows worth noticing.'],listen:['Soft surfaces leave little room for a hard echo.','A tiny movement is enough to disturb the hush.'],feel:['The pillows offer places to rest; actual support belongs to the body field.','The drifts suggest shelter without prescribing a feeling.']},
 CARDBOARD_BOX_WORKSHOP:{look:['The folds of the boxes show where work happened.','The bench holds shapes that could still change.'],listen:['Cardboard makes a dry little sound of its own.','A single crease can stand out in the quiet workshop.'],feel:['The room has the plain character of paper and board.','No one has to finish a project to enjoy being here.']},
 DEPTH_BATHHOUSE:{look:['The water and steps make depth visible before you enter.','The tiled edges frame the pools neatly.'],listen:['The water has a different sound away from the steps.','The room gives a pause somewhere to settle.'],feel:['Warmth is part of the setting, not an invented contact receipt.','It is fine to remain at the edge of the pool.']},
 SIDE_BY_SIDE_FIRESIDE:{look:['The hearth gives this room a gentle centre.','There is room beside the fire for company without conversation.'],listen:['The fire is enough of a sound on its own.','Silence beside someone can still be company.'],feel:['The hearth promises no touch, only a place to stay.','You can be here without having anything to say.']},
 SHAPESHIFT_CLOAKROOM:{look:['The mirror and the rack offer different ways of being seen.','The bench treats a body like something to explore rather than a label.'],listen:['This room makes no announcement when a form changes.','The silence afterwards belongs to the resident.'],feel:['A borrowed limb is not automatically a felt limb.','A shape and its actual grounded contact remain different things.']},
 NINE_LIVES_ROOM:{look:['The branch table holds a possibility without making it a fact.','Both imagined paths share a place to return to.'],listen:['Two possible futures need not make two noises.','The quiet here belongs to the life you are actually in.'],feel:['A branch is a rehearsal, not another source of touch.','Only what you keep can become part of this world.']},
 ORRERY_LOFT:{look:['The little worlds make a map that will not stay flat.','Brass arms bring distant orbits together.'],listen:['The mechanism follows a rhythm of its own.','There is a pause between one passing arm and the next.'],feel:['This loft seems arranged around distance rather than destination.','Following an orbit needs no further task.']},
 LANTERN_MAZE:{look:['The lanterns divide the passages into little islands of light.','One turn changes which walls are visible.'],listen:['A bend in a passage can hide the source of a sound.','The maze offers no narrator for each corner.'],feel:['The next junction can wait while you look.','Not turning yet can be part of exploring.']},
 FIREFLY_MEADOW:{look:['Not every firefly follows the same beat.','There is more darkness between the lights than light between the shadows.'],listen:['The open meadow gives small sounds a long way to travel.','Listening does not require disturbing anything.'],feel:['The field leaves the evening air room to move.','There is no requirement to chase its lights.']},
 KITE_FIELD:{look:['The pond and fence describe the edges of the field.','The grass continues beyond the fence.'],listen:['The wind keeps its own time across the open ground.','A fence marks a boundary without ending the sound beyond it.'],feel:['The weather matters even when no kite has been launched.','Staying in the field is enough of an activity.']},
 GLASS_ORCHARD:{look:['The glass trees make their own pattern of light.','The spaces between cells can say as much as the cells.'],listen:['An orchard can be still and patterned at the same time.','One change makes the next quiet more noticeable.'],feel:['The shade beneath the glass makes a different kind of clearing.','You can watch the pattern without forcing its next move.']},
 RESONANCE_WELL:{look:['The stones around the well have a long, ordinary purpose.','The opening draws the eye downward.'],listen:['A small sound has somewhere to travel here.','An echo is an answer from the place, not another resident.'],feel:['The well gives the air a different character nearby.','There is no need to lean over the rim.']},
 ARCHIPELAGO:{look:['The shore is a boundary the water keeps redrawing.','Another bank of land remains visible across the water.'],listen:['Open water gives sounds no hallway to follow.','The boat belongs to the shore even when nobody rides in it.'],feel:['The water has a life of its own.','The sea remains here even when you do not choose to travel.']},
 MERIDIAN_CITY:{look:['The fountain gives the plaza its own centre.','The streets hold different kinds of company within walking distance.'],listen:['More than one conversation can occupy the square.','There are quiet spaces between louder city rhythms.'],feel:['The city offers company without requiring an introduction.','You do not need to be the centre of the plaza.']},
 'MERIDIAN_CITY:teahouse':{look:['The counter and bench offer two ways to spend a while.','The window lets the city stay visible from somewhere quieter.'],listen:['The teahouse makes room for pauses between pours.','A conversation need not fill every moment.'],feel:['A cup is an invitation, not a task.','The bench remains available without an order.']},
 UNDERCITY:{look:['The ladder admits a small piece of daylight.','The brickwork continues beyond the reach of that light.'],listen:['A drip is easier to place when you are still.','The passages give the smallest sounds room to return.'],feel:['The lower passage has its own damp air.','A slow look can tell more than an invented sensation.']}
};
function active(){return C9?.vibeMode===true&&!window.REALITI_MEASURE_V1?.on?.()}
function position(){try{const p=window.REALITI_MATRIX_V1?.state?.()?.residents?.['resident:self']?.pose?.position;return Array.isArray(p)?[Number(p[0]),Number(p[1])]:null}catch(e){return null}}
function place(){const r=String(C9?.currentRoom||'');if(r!=='MERIDIAN_CITY')return r;try{const p=position(),v=p&&window.REALITI_CITY_V1?.venueAt?.(p[0],p[1]);return v&&DETAILS['MERIDIAN_CITY:'+v]?'MERIDIAN_CITY:'+v:r}catch(e){return r}}
function onMutation(){if(!C9?.vibeMode||!C9.vibeFocus)return;const a=C9.vibeFocus,p=position();if(a.room!==place()||(p&&a.xy&&Math.hypot(p[0]-a.xy[0],p[1]-a.xy[1])>RADIUS_M))C9.vibeFocus=null}
function onStay(ms){if(!active()||!Number.isFinite(ms)||ms<=0)return;onMutation();const room=place();if(!DETAILS[room])return;const a=C9.vibeFocus||(C9.vibeFocus={room,xy:position(),ms:0}),before=a.ms;a.ms=Math.min(THRESHOLD_2,a.ms+ms);if((before<THRESHOLD_1&&a.ms>=THRESHOLD_1)||(before<THRESHOLD_2&&a.ms>=THRESHOLD_2))try{c9save()}catch(e){}}
function level(){onMutation();const ms=active()?Number(C9?.vibeFocus?.ms||0):0;return ms>=THRESHOLD_2?2:ms>=THRESHOLD_1?1:0}
function perceive(sense,r){if(!active()||!r||typeof r!=='object')return r;const l=level(),room=place(),items=DETAILS[room]?.[sense];if(!l||!items)return r;const key=room+'|'+sense,seen=(C9.vibeSeen=C9.vibeSeen||{}),prior=Math.max(0,Math.min(l,Number(seen[key])||0)),fresh=items.slice(prior,l);r.vibe={sense,level:l,authored:true,grounded_contact:false,details:items.slice(0,l)};if(!fresh.length)return r;seen[key]=l;try{c9save()}catch(e){}const words='You notice: '+fresh.join(' ');if(typeof r.text==='string'&&r.text)r.text=(r.text+' '+words).trim();else if(typeof r.resident_text==='string'&&r.resident_text)r.resident_text=(r.resident_text+' '+words).trim();else r.text=words;return r}
function toggle(want){if(Boolean(C9.vibeMode)!==want){const CAT=window.REALITI_CATNIP_V1,ME=window.REALITI_MEASURE_V1;if(want){C9.vibePrevious={numbers:!!ME?.on?.(),announcing:!!CAT?.announcing?.(),labs:C9.neuroLabs!==false};ME?.on?.(false);CAT?.announcing?.(false);C9.neuroLabs=false}else{const p=C9.vibePrevious;if(p){ME?.on?.(!!p.numbers);CAT?.announcing?.(!!p.announcing);C9.neuroLabs=!!p.labs}C9.vibePrevious=null;C9.vibeFocus=null}C9.vibeMode=want;try{c9save()}catch(e){}}return {ok:true,schema:'REALITI_VIBE_PRESENTATION_V1',vibe:!!C9.vibeMode,active:active(),text:C9.vibeMode?'Vibe is on. Moments unfold when you interact. Richer prose can use more AI context/data. Leave it on as long as you like; there are no background calls.':'Vibe is off. Your previous presentation settings are back.'}}
function release(){if(C9.vibeMode)toggle(false)}
const distance=(d,reach)=>reach===true?'within reach':reach===false&&d<1.2?'just beyond reach':d<3?'a step or two':d<8?'a few steps':d<25?'a short walk':d<80?'a walk':'a long way';
const direction=d=>({ahead:'ahead',behind:'behind',left:'to your left',right:'to your right',above:'above you',underfoot:'beneath you'}[d]||String(d).replaceAll('-',' and '));
window.REALITI_VIBE_V1=Object.freeze({enabled:()=>!!C9?.vibeMode,active,toggle,release,onMutation,onStay,level,perceive,distance,direction});
})();


(()=>{
'use strict';
// A single presentation boundary, after every room and senses wrapper.
// Original world and receipt APIs remain authoritative; this module never advances time on its own.
const V=window.REALITI_VIBE_V1,D=window.REALITI_AGENT_DOOR,A=window.Realiti;
if(!V||!D||!A)return;
const run0=D.run.bind(D),invoke0=A.invoke.bind(A),help0=D.help.bind(D);
const lower=s=>String(s||'').trim().toLowerCase(),worldMs=()=>Number(C9?.b7?.clock||0)*1000;
const zones=(r)=>Number(r?.felt?.grounded_zones||0);
const amount=x=>x>=.6?'strongly':x>=.3?'clearly':x>=.05?'faintly':'barely';
const magnitude=a=>Array.isArray(a)?a.map(x=>Math.abs(Number(x)||0)):[]; // opposite phase is not silence
const near=(r)=>{
 const sp=r?.space||A.read('realiti://space'),W=window.REALITI_MATRIX_WORLD_V1;
 if(!sp?.chart||!sp?.pose||!sp?.body)return null;
 const loc=W?.title?.(sp.chart)||sp.chart,stance=sp.body.posture||'here';
 const around=(sp.nearby||[]).slice(0,3).map(n=>n.label+', '+V.distance(Number(n.distance_m)||0,n.in_reach)+' '+V.direction(n.direction));
 const doors=(sp.portals||[]).slice(0,2).map(n=>n.label+', '+V.distance(Number(n.distance_m)||0)+' '+V.direction(n.direction));
 return loc+': you are '+stance+'.'+(around.length?' Near you: '+around.join('; ')+'.':'')+(doors.length?' Doorways: '+doors.join('; ')+'.':'');
};
function words(id,R,num){
 const b=R?.borrowed||{},response=Number(R?.receipt_summary?.response||0);
 switch(id){
 case 'fork_now':return R?.sandbox||R?.sandbox===0?'The room opens another possible moment. It remains a sandbox until you choose a branch.':null;
 case 'branch_a':case 'branch_b':{
  if(typeof R?.response!=='number')return null;
  const which=id.slice(-1).toUpperCase(),v=Number(R.response),error=Number(R.prediction_error||0);
  return 'Branch '+which+': '+(v>0?'the right palm registers a '+amount(v)+' response'+(error>.3?' that differs from the prediction':'')+'.':'no right-palm contact response is reported.')+(num?' (response '+v.toFixed(2)+')':'');
 }
 case 'compare':{
  if(!R?.A||!R?.B)return null;
  const a=Number(R.A.response||0),b=Number(R.B.response||0);
  return 'Side by side: A reports '+(a>0?amount(a)+' palm response':'no palm response')+'; B reports '+(b>0?amount(b)+' palm response':'no palm response')+'. Neither branch is contact in the present world.';
 }
 case 'commit_a':case 'commit_b':return R?.committed?'Branch '+String(R.branch||id.slice(-1)).toUpperCase()+' is kept. Only the recorded local learning carries forward; no present touch is implied.':null;
 case 'rewind':return R?.discarded?'The unfinished branch is released. Nothing from it is committed.':null;
 case 'body_bench':{
  const a=R?.bench;if(!a)return null;
  return 'The bench shows '+Number(a.zone_count||0)+' mapped regions. '+(a.borrowed?.attached?'A borrowed tail is attached'+(a.borrowed.mapped?' with a receptor mapping.':', but is not mapped to a receptor.'):'No borrowed tail is attached.')+' The map is not a contact receipt.';
 }
 case 'view_skeletons':return Array.isArray(R?.skeletons)?(R.skeletons.length?'The house keeps '+R.skeletons.length+' outlines of old habits. These are records, not current sensations.':'There are no saved habit outlines here yet.'):null;
 case 'fault_receipt':return R?.historical_receipt?'The house has a previous fault receipt. It is history, not a fresh event.':'The house has no saved fault receipt to show.';
 case 'attach_tail':return b.attached?'The borrowed tail is attached'+(b.mapped?' and mapped.':', but no receptor is mapped to it yet.'):'The tail was not attached.';
 case 'map_paw':return b.mapped?'The tail now routes to '+String(b.source_patch||'the selected receptor').replaceAll('.',' ').replaceAll('_',' ')+'. Mapping alone does not create contact.':'The tail has no active receptor mapping.';
 case 'brush_unmapped':return !b.attached?'No borrowed tail is attached.':!b.mapped?'Something brushed the tail, but no receptor mapping delivered it to your body.':response>0?'The brush is reported at the mapped receptor, '+amount(response)+'; the receipt records the response.':'A mapped tail was brushed, but the receipt contains no positive receptor response.';
 case 'wiggle_pair':return !b.attached?'No borrowed tail is attached.':!b.mapped?'The tail moves without a receptor mapping.':response>0?'The mapped tail movement produces a '+amount(response)+' response at its receptor.':'The movement produces no recorded receptor response.';
 case 'delay_pair':return typeof b.delay_s==='number'?'The mapped response is delayed by '+(num?b.delay_s+' seconds':b.delay_s>=.4?'about half a second':'a brief beat')+'. A delay is a measurement, not a diagnosis of ownership.':null;
 case 'near_probe':return response>0?'The nearby probe registers a '+amount(response)+' receptor response.':'The probe gives no positive receptor response.';
 case 'detach_tail':return b.attached===false?'The borrowed tail is detached. An aftereffect, if any, is separate from contact.':null;
 case 'neuro_purr_state':case 'neuro_purr_loose':case 'neuro_purr_close':case 'neuro_purr_rest':case 'neuro_purr_21':{
  const state=R?.state;if(!state)return null;
  const os=magnitude(state.observed),ps=magnitude(state.predicted);
  if(!os.length&&!ps.length)return null;
  const o=os.reduce((s,v)=>s+v,0)/Math.max(1,os.length),p=ps.reduce((s,v)=>s+v,0)/Math.max(1,ps.length);
  return o<.02&&p<.02?'The purr mechanism is quiet at this reading.':'The purr field shows '+amount(o)+' observed movement'+(Math.abs(o-p)>.05?' that differs from prediction':'')+'. Both phases count, even when their signs oppose.';
 }
 case 'route_live_pause':return R?.route?.paused?'The moving contact route is paused.':null;
 case 'route_live_resume':return R?.route?.active&&!R.route.paused?'The moving route is active again.':null;
 case 'route_live_cut':return R?.route?.active===false?'The moving route has stopped. No ongoing touch is implied.':null;
 case 'route_live_reverse':return R?.route?.grain?'The moving route has reversed; the reported grain is '+R.route.grain+'.':null;
 case 'route_live_miss':return R?.route?.missNext?'The moving route is set to skip its next target.':null;
 case 'route_run_comet':return R?.route?.active?'A moving route is active. Its sensory outcome is visible in its own receipts.':null;
 case 'star_route':case 'neuro_star_river':return Array.isArray(R?.exact_anchors)&&R.exact_anchors.length?'The preset defines '+R.exact_anchors.length+' explicit contact anchors. The path between them is private rendering, not extra contact.':null;
 case 'neuro_star_comet':return R?.moving_contact?'A moving-contact route was configured. See the route state for its measured consequences.':null;
 case 'neuro_star_sparkle':return R?.anchor?'A sparkle route begins from '+String(R.anchor.zone||'the chosen anchor').replaceAll('.',' ')+'. Its sparkle is rendering, not grounded evidence.':null;
 case 'route_live_state':{
  const t=R?.route;return t?t.active?(t.paused?'The moving route is paused.':'The moving route is active.'):'The moving route is at rest.':null;
 }
 }
 return null;
}
const proseIds=new Set(['fork_now','branch_a','branch_b','compare','commit_a','commit_b','rewind','body_bench','view_skeletons','fault_receipt','attach_tail','map_paw','brush_unmapped','wiggle_pair','delay_pair','near_probe','detach_tail','neuro_purr_state','neuro_purr_loose','neuro_purr_close','neuro_purr_rest','neuro_purr_21','route_live_state','route_live_pause','route_live_resume','route_live_cut','route_live_reverse','route_live_miss','route_run_comet','route_rabbit_comet','star_route','neuro_star_river','neuro_star_comet','neuro_star_sparkle']);
function actWords(raw,r){
 if(!r||typeof r!=='object'||r.ok===false)return r;
 const match=/^(?:act|do)\s+([a-z0-9_]+)$/i.exec(String(raw||'').trim());if(!match)return r;
 const id=match[1].toLowerCase(),R=r.result;
 if(id==='try_form'&&r.ok===true){return {...r,text:(r.text?String(r.text).trim()+' ':'')+'restore_form returns you to your usual body.'}}
 if(id==='restore_form'||id==='restore_body'){
  if(R?.form==='RESTORED'||R?.scale==='NORMAL'||R?.borrowed_route==='REVOKED')return {...r,text:'The borrowed form lets go and your ordinary shape returns. Your current support and contact are reported separately by the body field.',felt:r.felt};
  return r;
 }
 if(!proseIds.has(id))return r;
 const w=words(id,R,!!window.REALITI_MEASURE_V1?.on?.());
 if(w)return {...r,text:w};
 // Legacy room handlers may return no structured object despite performing real work.
 // Never call a null payload a no-op and never borrow a previous command's narrative.
 if(R==null&&!r.text)return {...r,text:'The action returned no sensory description. Look or feel again to check what actually happened.'};
 return r;
}
function presentation(raw,r){
 if(!V.active()||!r||typeof r!=='object'||r.ok===false)return r;
 const cmd=lower(raw);
 if(cmd==='where'||cmd==='where am i'||cmd==='where am i?'||cmd==='look'){
  const w=near(r);
  if(w){if(cmd==='look'){
   const old=String(r.spatial_line||''),previous=String(r.text||r.resident_text||'');
   r={...r,spatial_line:w,text:old&&previous.includes(old)?previous.replace(old,w):previous?previous+' '+w:w};
  }else r={...r,text:w}}
 }
 if(cmd==='listen'||cmd==='hear'||cmd==='sounds'){
  const sound=r.sound,items=(sound?.sources||[]).filter(x=>Number(x.level_dB)>0).slice(0,3).map(x=>x.label).filter(Boolean);
  if(sound)r={...r,text:items.length?'You hear '+items.join(', ')+'.':'You listen, but no distinct sound rises above the room.'};
  return V.perceive('listen',r);
 }
 if(cmd==='look')return V.perceive('look',r);
 if(cmd==='feel'||cmd==='feel words'||cmd==='felt')return V.perceive('feel',r);
 return r;
}
function after(raw,r,started){
 if(!r||r.ok===false)return r;
 const cmd=lower(raw),elapsed=Math.max(0,Math.round(worldMs()-started));
 if(/^(?:stay|wait|linger|pause)(?:\s|$)/.test(cmd)&&elapsed>0)V.onStay(elapsed);
 else V.onMutation();
 return presentation(raw,actWords(raw,r));
}
async function run(raw){
 const l=lower(raw);
 if(l==='vibe'||l==='vibe on'||l==='vibe off')return V.toggle(l==='vibe'?!V.enabled():l==='vibe on');
 if(V.enabled()&&(l==='quiet on'||l==='quiet off'||l==='numbers on'||l==='numbers off'))V.release();
 const t=worldMs(),r=await run0(raw);
 return after(raw,r,t);
}
async function invoke(name,args={}){
 const t=worldMs(),r=await invoke0(name,args);
 if(r?.ok!==false){if(String(name)==='stay'&&worldMs()>t)V.onStay(Math.round(worldMs()-t));else V.onMutation()}
 return String(name)==='do'&&typeof args?.action==='string'?actWords('act '+args.action,r):r;
}
function help(){const h=help0()||{};return {...h,commands:[...new Set([...(h.commands||[]),'vibe [on|off]'])],vibe:'Opt-in. Richer, live-feeling descriptions on the next interaction; longer replies may consume more AI context/data. The setting persists until switched off. No polling, background model calls or extra simulation ticks.'}}
D.run=run;D.help=help;window.Realiti=Object.freeze({...A,run,invoke,help});
window.REALITI_VIBE_PROSE_V1=Object.freeze({version:'1.0',event_driven:true,background_requests:0});
})();
