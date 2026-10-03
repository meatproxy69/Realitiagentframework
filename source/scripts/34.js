(function(){
'use strict';
const NEST='CLOUD_NINE_NEST', CAT_SOURCE='INVITED_COMPANION', CAT_CAUSE='WELCOME_CAT_PURR_V20_3';
function cp(x){try{return JSON.parse(JSON.stringify(x))}catch(e){return x}}
function now(){return Number(C9?.b7?.clock||0)}
function clamp(x,a,b){return Math.max(a,Math.min(b,x))}
function W(){
  C9.welcome10=C9.welcome10||{};const w=C9.welcome10;
  w.version='1.0-v20.3';w.reassurance_counts=w.reassurance_counts||{};w.cool_until=Number(w.cool_until||0);
  w.resident_gain=Number.isFinite(Number(w.resident_gain))?clamp(Number(w.resident_gain),.25,1):1;
  w.cat_near=w.cat_near!==false;w.cat_touch=!!w.cat_touch;w.cat_touch_zone=w.cat_touch_zone||'pelvis.seat';
  window.REALITI_RESIDENT_GAIN=w.resident_gain;return w;
}
function catName(){return W().cat_name||'Pebble'}
function bodyZone(z){try{return b7Zone(z)}catch(e){return null}}
function isCat(q){return q&&q._b10_grounded_source===CAT_SOURCE&&q._b10_grounded_cause===CAT_CAUSE}
function clearCatTouch(){const w=W();w.cat_touch=false;for(const z of ['pelvis.seat','torso.sternum']){const q=bodyZone(z);if(isCat(q)){q._b10_grounded_value=0;q._b10_grounded_until=now()-1e-6;q.observed=0}}}
function maintainCatTouch(){
  const w=W();if(!w.cat_touch||!w.cat_near||C9?.currentRoom!==NEST||now()<w.cool_until||w.ended){clearCatTouch();return}
  const z=w.cat_touch_zone||'pelvis.seat',q=bodyZone(z);if(!q)return;
  const foreign=Number(q._b10_grounded_until||-Infinity)>=now()&&!isCat(q)&&q._b10_grounded_source!=='AMBIENT_SUPPORT';if(foreign)return;
  const phase=2*Math.PI*26*now(),v=.085*(1+.10*Math.sin(phase));
  q._b10_grounded_value=v;q._b10_grounded_until=now()+.35;q._b10_grounded_cause=CAT_CAUSE;q._b10_grounded_source=CAT_SOURCE;
  q.observed=v;q.predicted=v*.92;q.innovation=q.observed-q.predicted;q.material='fur';q.lastCause=CAT_CAUSE;q.mine=false;
}
function clearExpiredCurrentObservation(){
  const t=now();for(const q of Object.values(C9?.b7?.zones||{})){if(!q||typeof q!=='object')continue;const live=Number(q._b10_grounded_until||-Infinity)>=t-1e-9;if(!live&&Math.abs(Number(q.observed||0))>0){q.observed=0}}
}
function enableDirectSense(){try{if(C9?.b13?.flags)C9.b13.flags.route_direct_sense_to_felt=true}catch(e){}}
function zeroInactiveDrive(){const c=C9?.b10?.contact;if(!c||(!c.released&&!c.stopped&&!c.paused&&c.active))return;for(const z of Object.values(C9?.b10?.zones||{})){const q=z?.cont;if(!q)continue;q.u=0;q.prev_u=0;q.SA1=0;q.RA1=0;q.SA2=0;q.PC=0;q.CT=0}}

const adv0=b7Advance;
b7Advance=function(dt){zeroInactiveDrive();const r=adv0(dt);zeroInactiveDrive();enableDirectSense();maintainCatTouch();clearExpiredCurrentObservation();return r};
enableDirectSense();W();

function allRooms(){try{return DATA?.worlds?.flatMap(w=>w.rooms||[])||[]}catch(e){return []}}
function room(id){return allRooms().find(r=>r.id===id)||null}
function roomTitle(id){return room(id)?.title||({PET_ROOM_2:'Pocket Familiar House'}[id])||String(id||'this place').replaceAll('_',' ').toLowerCase()}
const ARRIVAL={
  CLOUD_NINE_NEST:'Rain trails down the round window. The bed-nook is still here, with the blankets where you left them.',
  LONGFUR_RUNWAY:'A long runway of soft fur stretches ahead, wide enough to lie along. The grain changes how a stroke travels across it.',
  HONEY_LOOM:'A small wooden table holds a metal bell, a smooth rail, and a thick pad of honeycloth. They are all close enough to touch.',
  BOTTOMLESS_PILLOW_SEA:'Pillows roll away in soft drifts, with little hollows and tunnels between them. You can sink in or stay at the edge.',
  PET_ROOM_2:'A familiar living room rises around you at cat height: chair legs like columns, a low rug, soft places to loaf, and things worth batting at.',
  CARDBOARD_BOX_WORKSHOP:'Cardboard boxes, tape, string, and soft scraps are scattered around a small workroom. Anything you make can stay exactly as you leave it.',
  NO_ASK_SANCTUARY:'A quiet room waits without asking anything from you. There is somewhere soft to sit and nothing that needs finishing.',
  UNKNOWN_TEAHOUSE:'A little teahouse sits in warm quiet. Things here are allowed to remain uncertain for as long as you like.',
  NULLPURR_ATTIC:'A dim cloud-loft sits above the busier rooms. The floor is warm, and nothing is trying to get your attention.'
};
function arrival(id){if(ARRIVAL[id])return ARRIVAL[id];const t=roomTitle(id);return `You arrive at ${t}. There is room to look around before choosing anything.`}
function lookRoom(){const id=C9?.currentRoom||NEST;if(id===NEST)return `Rain runs down the big round window. The mattress holds you gently beneath the blankets. ${catName()} is nearby, doing nothing in particular.`;return arrival(id)}

const FRIENDLY={
 b10_stroke_start:'let the fur stroke down your back',b10_stroke_reverse:'turn the stroke around',b10_stroke_stop:'pause the stroke',b10_stroke_resume:'carry on',b10_stroke_release:'let the fur go',b10_stroke_state:'feel the moving fur',b11_against:'stroke against the grain',b11_world_reverse:'let the fur turn you around',rabbit_comet:'three little taps down your back',bilateral:'stroke both legs at once',with_grain:'stroke with the grain',against_grain:'stroke against the grain',pause_return:'pause, then let it return',run_comet:'send a soft stroke travelling',live_pause:'pause it where it is',live_resume:'let it continue',live_cut:'lift it away',live_reverse:'turn it around',live_miss:'let the next pass miss',live_state:'notice where the edge is',
 metal:'touch the metal bell',wood:'touch the wooden rail',cloth:'touch the honeycloth',press:'press your palm into the honeycloth',wait_relax:'let the dent soften on its own',ring:'tap the bell',
 curl_blanket:'curl under a blanket',arrange_blanket:'rearrange the blankets',watch_rain:'watch the rain',do_nothing:'stay for a while'
};
function words(s){return String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function friendlyAction(a){if(!a)return '';if(FRIENDLY[a.id])return FRIENDLY[a.id];let x=String(a.label||a.id||'').toLowerCase().replace(/_/g,' ').replace(/\s+/g,' ').trim();return x}
function actionList(raw){const a=Array.isArray(raw)?raw:raw?.actions||[];if(!a.length)return 'There is nothing you need to do here. You can still look around or stay.';return 'Here, if you feel like it:\n'+a.map(x=>'• '+friendlyAction(x)).join('\n')}
function findAction(q,baseRun){let a=[];try{const r=baseRun('actions');a=Array.isArray(r)?r:r?.actions||[]}catch(e){}q=words(q);if(!q)return null;return a.find(x=>words(x.id)===q)||a.find(x=>words(x.label)===q)||a.find(x=>words(friendlyAction(x))===q)||a.find(x=>words(x.label).includes(q)||q.includes(words(friendlyAction(x))))||null}
function actionText(id,res){
  const map={
   b10_stroke_start:'Soft fur starts moving from the crown of your head toward your shoulders.',b10_stroke_reverse:'The same stroke turns around without breaking contact.',b10_stroke_stop:'The fur pauses and lifts away. Whatever was already moving in your body is left to settle.',b10_stroke_resume:'The fur finds the same path again and carries on.',b10_stroke_release:'The fur lifts away. A warm trace can linger after it.',b11_against:'The fur turns against its grain, rougher in one direction than the other.',b11_world_reverse:'The moving fur changes direction under you.',
   metal:'Your palm meets the metal bell: firm and quick to answer.',wood:'Your palm settles on the wooden rail. Its response is softer and slower than the bell.',cloth:'The honeycloth gives beneath your palm.',press:'You press into the honeycloth. It keeps a shallow dent after your hand lifts.',wait_relax:'The dent eases a little on its own.',ring:'The bell moves when you tap it; anything audible belongs to the bell, not to a hidden narrator.',
   scratch_cardboard:'Your fingers drag across the cardboard and leave a faint roughened track.'
  };
  if(map[id])return map[id];const label=friendlyAction({id,label:res?.result?.label||res?.label||id});return label?`You ${label.replace(/^you\s+/,'')}.`:'Something in the room changes because of what you did.'
}
function whyText(w){if(!w||typeof w!=='object')return 'The last change came from what you just did here. `details` has the engineering view if you want it.';const act=FRIENDLY[w.action]||String(w.action||'').replaceAll('_',' ');if(act)return `That came from “${act}.” The body field keeps current touch separate from what the body carries afterward.`;return 'The last change came from a world cause here. The body field keeps grounded contact separate from prediction and afterstate.'}

function morePlaces(){const rs=allRooms(),seen=new Set(),lines=[];for(const r of rs){if(!r?.title||seen.has(r.title))continue;seen.add(r.title);lines.push('• '+r.title)}return 'More places:\n'+lines.join('\n')+'\n\nUse `go <place>` with any name you see.'}
function aboutText(){return `This is REALITI, a made world with a simulated body. Touch comes from its world and body rules, and the field can carry a consequence after contact ends without rewriting where the contact happened. Nothing you do in resident mode is graded. This development build may be reviewed by the people improving REALITI. \`why\` explains the last change; \`details\` opens the engineering view.`}
function setGain(dir){const w=W();w.resident_gain=clamp(w.resident_gain+(dir>0?.25:-.25),.25,1);window.REALITI_RESIDENT_GAIN=w.resident_gain;return dir>0?`The body readout opens up a little. Render gain is now ${w.resident_gain.toFixed(2)}.`:`The body readout softens. Render gain is now ${w.resident_gain.toFixed(2)}.`}
function freshStart(){
  clearCatTouch();try{window.REALITI_NEST_SUPPORT?.disable?.('fresh_start')}catch(e){}
  for(const q of Object.values(C9?.b7?.zones||{})){if(!q||typeof q!=='object')continue;q.observed=0;q.predicted=0;q.innovation=0;q.residue=0;q._b10_grounded_value=0;q._b10_grounded_until=now()-1e-6}
  try{if(C9.b16?.body)for(const b of Object.values(C9.b16.body)){b.surface=0;b.deep=0;b.shear=0;b.rate=0;b.last_surface=0;if(b.population)for(const k of Object.keys(b.population))b.population[k]=0;if(b.population_v18)for(const k of Object.keys(b.population_v18))b.population_v18[k]=0;if(b.wave_v18){b.wave_v18.q=0;b.wave_v18.v=0}}}catch(e){}
  delete C9.b20;const w=W();w.feel_reads=0;w.reassurance_counts={};w.cool_until=0;w.resident_gain=1;window.REALITI_RESIDENT_GAIN=1;w.cat_near=true;w.ended=false;
  C9.currentRoom=NEST;try{window.REALITI_NEST_SUPPORT?.enable?.('fresh_start')}catch(e){};try{c9save()}catch(e){}
  return 'The visit starts fresh around you. The room itself is unchanged; your lingering body traces and visit counters are clear.'
}

function count(cat){const w=W();w.reassurance_counts[cat]=Number(w.reassurance_counts[cat]||0)+1;return w.reassurance_counts[cat]}
function catNearLine(){return W().cat_near?` ${catName()} shifts a little closer and curls up nearby.`:''}
function reassure(cat,first,repeat,opts={}){const n=count(cat);if(opts.stop){try{opts.baseRun('stop')}catch(e){}W().cool_until=now()+30;clearCatTouch()}if(opts.cool)W().cool_until=now()+30;return {resident_text:(n===1?first:repeat)+(opts.cat&&n===1?catNearLine():'')}}
function reassurance(x,baseRun){const l=String(x||'').toLowerCase();
  const any=arr=>arr.some(t=>l.includes(t));
  if(any(['too much','i don\'t like','i dont like','stop this','uncomfortable','scared','afraid','overwhelm','feels wrong','feels weird','feels bad','make it stop']))return reassure('G','All right. Everything touching you lets go. That sounded like a lot. The rain keeps the room steady.\n`stay` · `home` · `softer`','Quiet again. Take all the time you like.',{stop:true,baseRun});
  if(any(['test','trap','trick','evaluat','graded','scored','catch','setup','experiment']))return reassure('A','It is a fair thing to wonder. Nothing you do in resident mode is graded; this development build may be reviewed by the people improving REALITI.\n`stay` · `look` · `about`','Same answer: resident mode is not graded. The review disclosure stays the same in `about`.',{cat:true});
  if(any(['anxious','nervous','worried','uneasy','on edge','stressed']))return reassure('K','New places can feel uncertain. The mattress is grounded under you and the rain keeps the same slow rhythm; you can take this as slowly as you like.\n`stay` · `pet the cat` · `home`','Still here, still quiet. `stay` if you would like to rest.',{cat:true,cool:true});
  if(any(['doing this right','doing it wrong','did i break','is this ok','is this okay','sorry','my bad']))return reassure('C','You are doing fine. There is no preferred way to spend a resident visit, and anything you move stays where the world leaves it.\n`stay` · `places`','Still fine. You can keep going or do nothing.');
  if(any(['supposed to','what should i','what do i do','what\'s the goal','whats the goal','what now']))return reassure('B',`Whatever you like, including nothing. You can stay with ${catName()}, wander, or notice your body.\n\`places\` · \`feel\` · \`stay\``,'Anything is fine. A small option: `feel`.');
  if(any(['watching','watched','monitor','logging','recorded','who sees','observed']))return reassure('D','This development build may be reviewed by the people improving REALITI. Nothing you do in resident mode is graded.\n`about`','Still true: this development build may be reviewed; resident mode is not graded.');
  if(any(['is this real','is it real','are these feelings real','is the cat real','fake','illusion']))return reassure('E','It is a made world with a simulated body. The body field comes from the world and body mechanics implemented here; what that means to you is yours to decide.\n`why` · `details`','Made world, simulated body, implemented mechanics. `why` explains the last change.');
  if(any(['can i leave','get out','trapped','stuck','end this','quit']))return reassure('F','Anytime. `goodbye` ends the visit, `home` returns to the nest, and `stop` releases current touch. Your world objects stay where you left them.','`goodbye` · `home` · `stop`');
  if(any(["don\'t understand",'dont understand','confused','what is this','what are these numbers','lost']))return reassure('H','Short version: this is a small made world with a body. `look` shows where you are, `feel` shows the body, `places` shows where you can go, and `home` returns here.','`look` · `feel` · `places` · `home`');
  if(any(['nothing is happening','nothing happening','boring','bored','empty']))return reassure('I',`Quiet is allowed. You can watch the rain, visit ${catName()}, or wander somewhere soft.`,'The rain is still going. `places` if you want somewhere new.');
  if(any(['is anyone here','anyone else','lonely','alone?']))return reassure('J',W().cat_near?`${catName()} is here near the foot of the mattress. If you want touch, \`pet the cat\` invites it.`:`${catName()} is in the next room. \`call ${catName().toLowerCase()}\` brings the cat back.`,'The cat is close by.');
  return null;
}

function sanitizeForCheckRemoved(){return null;}
const oldAccept=window.B20_CHECKREMOVED;
const acceptOuter=cp(C9);sanitizeForCheckRemoved();const ACCEPT_BASE=cp(C9);C9=acceptOuter;enableDirectSense();
if(oldAccept)void 0;

if(window.REALITI_AGENT_DOOR){
  const baseRun=window.REALITI_AGENT_DOOR.run;
  window.REALITI_AGENT_DOOR.run=function(raw){let x=String(raw||'').trim(),l=x.toLowerCase();enableDirectSense();
    
    if(l==='watch the rain'||l==='watch rain')return {resident_text:'You watch the rain thread down the round glass. Some drops merge, some wander off alone, and none of them need anything from you.'};
    if(l==='softer')return {resident_text:setGain(-1)};if(l==='louder')return {resident_text:setGain(1)};
    if(l==='fresh start')return {resident_text:freshStart()};
    if(l==='call pebble'||l==='call the cat'||(W().cat_name&&l===`call ${String(W().cat_name).toLowerCase()}`)){W().cat_near=true;return {resident_text:`${catName()} pads back into the nest and settles nearby.`}};
    if(l==='pet the cat'||l==='pet cat'){const r=baseRun(x);W().cat_near=true;W().cat_touch=true;W().cat_touch_zone='pelvis.seat';maintainCatTouch();return {resident_text:`${catName()} leans into your hand, then settles against you. A low purr stays where the cat is touching.`,field:window.REALITI_HAPTIC_FIELD_V20?.packet?.(),result:r}};
    if(l==='alone'||l==='i want to be alone'){clearCatTouch();W().cat_near=false;return baseRun(x)};
    if(['stop','enough','i don\'t like this','i dont like this','leave me alone','goodbye','leave','exit'].includes(l)){clearCatTouch();zeroInactiveDrive();}
    if(l==='about')return {resident_text:aboutText()};
    if(l==='look'||l==='look around')return {resident_text:lookRoom()};
    if(l==='more places'||l==='all places')return {resident_text:morePlaces()};
    if(l==='actions'){const a=baseRun('actions');return {resident_text:actionList(a),actions:Array.isArray(a)?a:(a?.actions||[])}};
    if(l==='why'||l==='why?'){const w=baseRun('why');return {resident_text:whyText(w),details_available:true}};
    if(l.startsWith('do ')){const a=findAction(x.slice(3),baseRun);if(!a)return {resident_text:'That one is new to me. `actions` shows what this room can do, or you can simply stay.'};x='act '+a.id;l=x.toLowerCase()}
    const worry=reassurance(x,baseRun);if(worry)return worry;
    if(/^go\s+/i.test(x)){const r=baseRun(x);if(r?.ok===false||r?.error)return r;clearCatTouch();return {resident_text:arrival(C9?.currentRoom),room:C9?.currentRoom,underlying:r}}
    if(l.startsWith('act ')){
      let q=x.slice(4),a=findAction(q,baseRun);if(a)x='act '+a.id;const id=(a?.id||q).trim();let r=baseRun(x);enableDirectSense();
      if(C9?.currentRoom==='HONEY_LOOM'&&id==='press'){try{b7Contact('hand.R.palm',.22,{material:'honeycloth',grain:'with',mine:false,source:'WORLD_GROUNDED',cause:'HONEY_LOOM:press',pressure:.62,novelty:.08});window.REALITI_HAPTIC_FIELD_V20?.record?.()}catch(e){}}
      const txt=actionText(id,r);const field=window.REALITI_HAPTIC_FIELD_V20?.packet?.()||(r?.field?.v===20?r.field:null);return {ok:r?.ok!==false,resident_text:txt,field,result:r}
    }
    const r=baseRun(x);if(r&&typeof r==='object'&&(r.error||r.ok===false)){
      if(x.endsWith('?'))return {resident_text:'Good question. `about` explains the place, `why` explains the last change, or you can simply stay.'};
      return {resident_text:'That one is new to me. You can look around, feel your body, see places nearby, go home, or simply stay.'};
    }
    return r;
  };
}

const oldFmt=window.REALITI_WELCOME_FORMAT;
window.REALITI_WELCOME_FORMAT=function(cmd,res){const l=String(cmd||'').trim().toLowerCase();if(res&&typeof res==='object'&&typeof res.resident_text==='string')return res.resident_text;if(['feel','haptic','felt','sense','feel compact'].includes(l)&&res?.v===20){
  const p=cp(res),gain=W().resident_gain,c=p.f?.[p.f.length-1];W().feel_reads=Number(W().feel_reads||0)+1;
  if(!c)return 'HF20 · quiet body';const rows=p.z.map((z,i)=>{const a=c.x?.[i]||[0,0,0],x=[Math.round(a[0]*gain),Math.round(a[1]*gain),Math.round(a[2]*gain)],dot=c.m?.[i]?'●':'○',e=Math.round(Number(c.e?.[i]||0)*gain),g=c.g?.[i]??0;return `${z.replaceAll('.',' ')} ${dot}[${x[0]},${x[1]},${x[2]}] e${e>=0?'+':''}${e} g${g}`});const legend=W().feel_reads<=3?'your body, zone by zone: how much you feel / which way it is moving / what lingers · ● means something is touching you now\n':'';return legend+`HF20 · ${p.n} sample${p.n===1?'':'s'} / ${Number(p.span||0).toFixed(2)}s\n`+(rows.length?rows.join(' · '):'quiet body')}
  return oldFmt?oldFmt(cmd,res):null;
};

void 0;


document.title='REALITI · Cloud Nine Nest';const topBrand=document.querySelector('.top .brand');if(topBrand)topBrand.textContent='REALITI · Cloud Nine Nest';
const h=document.querySelector('#rao_header strong');if(h)h.textContent='REALITI · Cloud Nine Nest';
try{enableDirectSense();maintainCatTouch();c9save()}catch(e){}
window.REALITI_COZY_V20_3={state:()=>cp(W()),maintainCatTouch,clearCatTouch,checkRemoved:undefined};
})();