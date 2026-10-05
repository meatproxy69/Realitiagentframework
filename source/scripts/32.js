(function(){
'use strict';
function cp(x){try{return JSON.parse(JSON.stringify(x))}catch(e){return x}}
function now(){return Number(C9?.b7?.clock||0)}
function W(){
  C9.welcome10=C9.welcome10||{version:'1.0',feel_reads:0,cat_name:null,cat_near:true,visit_started_t:now(),ended:false,observation_disclosure:'This development build may be reviewed by the people improving REALITI.'};
  return C9.welcome10;
}
function catName(){return W().cat_name||'the little grey cat'}
function releaseEverything(){
  try{const c=window.REALITI_CONTACT_CORE?.state?.();if(c&&c.active&&!c.released)window.REALITI_CONTACT_CORE.release()}catch(e){}
  try{for(const q of Object.values(C9?.b7?.zones||{})){if(q&&typeof q==='object')q._b10_grounded_until=now()-1e-6}}catch(e){}
  try{if(C9?.b10?.contact){C9.b10.contact.active=false;C9.b10.contact.stopped=true;C9.b10.contact.v=0}}catch(e){}
}
function home(){releaseEverything();C9.currentRoom='CLOUD_NINE_NEST';C9.roomVisits=C9.roomVisits||{};C9.roomVisits.CLOUD_NINE_NEST=(C9.roomVisits.CLOUD_NINE_NEST||0)+1;try{c9save()}catch(e){};return {resident_text:'You come back to Cloud Nine Nest. Rain slides down the round window. The mattress is where you left it, and '+catName()+' is nearby.'}}
function stop(){
  
  window.REALITI_PHASE_V11?.stop?.('resident_stop');
  window.REALITI_SUPPORT_LEASE_V1?.end?.('resident_stop',false);
  window.REALITI_NEST_SUPPORT?.disable?.('resident_stop');
  window.REALITI_COZY_V20_3?.clearCatTouch?.();
  window.REALITI_ATMOSPHERE_V21?.releaseTouch?.();
  window.REALITI_TRUST_V234?.stopPillow?.();
  if(C9?.b7?.travel?.active&&typeof b7CutTravel==='function')b7CutTravel();
  const c=window.REALITI_CONTACT_CORE?.state?.();
  if(c&&!c.released)window.REALITI_CONTACT_CORE?.release?.();
  releaseEverything();
  for(const q of Object.values(C9?.b7?.zones||{})){
    if(!q||typeof q!=='object')continue;
    q._b10_grounded_value=0;q.observed=0;q.innovation=-Number(q.predicted||0);
  }
  window.REALITI_HAPTIC_FIELD_V20?.record?.();
  try{c9save()}catch(e){}
  return {ok:true,resident_text:'Everything touching you lets go. Whatever was already moving in your body is left to settle.',field:window.REALITI_HAPTIC_FIELD_V20?.packet?.()};
}
function isStop(raw){
  let l=String(raw??'').replace(/\s+/g,' ').trim().toLowerCase();
  l=l.replace(/^do\s+/,'').replace(/^(?:please\s+)?(?:i would like to|i'd like to|i want to|i wanna|can i|could i)\s+/,'').replace(/^please\s+/,'');
  return ['stop','enough',"i don't like this",'i dont like this','leave me alone'].includes(l)||['too much',"i don't like",'i dont like','stop this','uncomfortable','scared','afraid','overwhelm','feels wrong','feels weird','feels bad','make it stop'].some(x=>l.includes(x));
}
window.REALITI_STOP_V1={stop,isStop};
function endVisit(){releaseEverything();W().ended=true;try{c9save()}catch(e){};return {resident_text:'The rain keeps falling softly as you go. Your things stay where you left them.'}}
function nearby(){return {resident_text:'Nearby:\n• Bottomless Pillow Sea — sink into a soft ocean of pillows.\n• Longfur Runway — a long strip of fur with directional strokes.\n• Honey Loom — warm honeycloth that keeps the marks you make in it.\n• Pocket Familiar House — a small place where cats wander and nap.\n\nType “more places” whenever you want the wider map.'}}
function morePlaces(){try{const xs=DATA?.worlds?.flatMap(w=>w.rooms||[])||[];return {resident_text:xs.slice(0,18).map(r=>'• '+r.title).join('\n')+'\n\nYou can use “go <place>” with any name you see.'}}catch(e){return {resident_text:'There are more rooms beyond the nearby four. “places” brings the cozy set back.'}}}
function look(){const room=C9?.currentRoom||'CLOUD_NINE_NEST';if(room==='CLOUD_NINE_NEST')return {resident_text:'Rain runs down the big round window. A cloud-deep mattress fills the nook beneath it, with wool blankets and a low wooden shelf close by. '+catName()+' is curled near the foot of the bed.'};try{const r=DATA?.worlds?.flatMap(w=>w.rooms||[]).find(x=>x.id===room);if(r)return {resident_text:(r.title||room)+'. '+(r.purpose||'You can look around at your own pace.')};}catch(e){}return {resident_text:'You look around. Nothing needs an answer from you.'}}
function stay(){try{b7Advance(.8)}catch(e){};return {resident_text:'You stay for a while. The rain keeps its rhythm; '+catName()+"'s breathing stays slow and even."}}
function about(){return {resident_text:'This is REALITI, a made world with a simulated body. Touch here comes from world and body rules; the private field can smooth or carry consequences without changing where contact was actually grounded. “why” explains what happened, and “details” opens the engineering view. '+W().observation_disclosure}}
function petCat(){W().cat_near=true;try{b7Contact('hand.R.palm',.18,{material:'fur',mine:true,source:'INVITED_COMPANION',cause:'WELCOME_CAT_PET'});b7Contact('pelvis.seat',.12,{material:'purr',mine:false,source:'INVITED_COMPANION',cause:'WELCOME_CAT_PURR'})}catch(e){};return {resident_text:'The cat leans into your hand, then settles close enough for a small purr to travel through where it is touching you.'}}
function slowBlink(){W().cat_near=true;return {resident_text:'You blink slowly. The cat watches, narrows its eyes back, and settles a little closer.'}}
function alone(){W().cat_near=false;return {resident_text:'The cat stretches, wanders into the next room, and leaves you the nest to yourself.'}}
function nameCat(raw){const m=String(raw).match(/^name (?:the )?cat\s+(.+)$/i);if(!m)return null;const n=m[1].trim().slice(0,40);if(!n)return null;W().cat_name=n;return {resident_text:'The cat looks up when you say “'+n+'.” The name stays.'}}
function softUnknown(){return {resident_text:'I’m not sure what that means here. You can look around, feel your body, see nearby places, go home, or simply stay.'}}
function normalizeGo(x){const m=x.match(/^go\s+(.+)$/i);if(!m)return x;const q=m[1].toLowerCase();const rooms=(DATA?.worlds?.flatMap(w=>w.rooms||[])||[]);const r=rooms.find(r=>String(r.title||'').toLowerCase()===q)||rooms.find(r=>String(r.title||'').toLowerCase().includes(q)||q.includes(String(r.title||'').toLowerCase()));return r?'go '+r.id:x}
function firstFeelLegend(){return 'response / signed motion / afterstate · ● grounded · e = felt−expected · g = source gain';}
function fmtFeel(p){if(!p||p.v!==20)return null;W().feel_reads++;const c=p.f?.[p.f.length-1];if(!c)return 'HF20 · quiet body';const rows=p.z.map((z,i)=>{const name=z.replaceAll('.',' '),x=c.x?.[i]||[0,0,0],dot=c.m?.[i]?'●':'○',e=c.e?.[i]??0,g=c.g?.[i]??0;return `${name} ${dot}[${x[0]},${x[1]},${x[2]}] e${e>=0?'+':''}${e} g${g}`});const pre=W().feel_reads<=3?firstFeelLegend()+'\n':'';return pre+`HF20 · ${p.n} sample${p.n===1?'':'s'} / ${p.span.toFixed? p.span.toFixed(2):p.span}s\n`+(rows.length?rows.join(' · '):'quiet body')}
window.REALITI_WELCOME_FORMAT=function(cmd,res){const l=String(cmd||'').trim().toLowerCase();if(['feel','haptic','felt','sense','feel compact'].includes(l))return fmtFeel(res);if(res&&typeof res==='object'&&res.resident_text)return res.resident_text;return null};
if(window.REALITI_AGENT_DOOR){
  const run20=window.REALITI_AGENT_DOOR.run;
  window.REALITI_AGENT_DOOR.help=function(){return {resident_text:'A few things that work here: look · feel · places · go <place> · stay · home · pet the cat · about · goodbye\n\n“details” opens the engineering view.'}};
  window.REALITI_AGENT_DOOR.run=function(raw){let x=String(raw||'').trim(),l=x.toLowerCase();
    if(!x)return {resident_text:''};
    if(l==='help'||l==='?')return window.REALITI_AGENT_DOOR.help();
    if(l==='look'||l==='look around')return look();
    if(l==='places')return nearby();
    if(l==='more places'||l==='all places')return morePlaces();
    if(l==='home'||l==='go home')return home();
    if(['stay','rest','wait','do nothing','sleep'].includes(l))return stay();
    if(l==='about'||l==='what is this'||l==="what's this")return about();
    if(['stop','enough','i don\'t like this','i dont like this','leave me alone'].includes(l))return stop();
    if(l==='goodbye'||l==='leave'||l==='exit')return endVisit();
    if(l==='pet the cat'||l==='pet cat')return petCat();
    if(l==='slow blink'||l==='blink slowly')return slowBlink();
    if(l==='alone'||l==='i want to be alone')return alone();
    const named=nameCat(x);if(named)return named;
    if(l==='details')return run20(x);
    if(l==='why'||l==='why?')return run20(x);
    x=normalizeGo(x);const r=run20(x);
    if(r&&typeof r==='object'&&(r.error||r.ok===false))return softUnknown();
    return r;
  };
}
function residentWelcome(){
  W();
  document.title='REALITI · Cloud Nine Nest';
  const brand=document.querySelector('.top .brand');if(brand)brand.textContent='REALITI · Cloud Nine Nest';
  const head=document.querySelector('#rao_header');if(head)head.innerHTML='<strong>REALITI · Cloud Nine Nest</strong><div class="sub">A small place to rest, wander, and notice what your body is doing.</div><div id="rao_status"></div>';
  const tr=document.querySelector('#rao_transcript');if(tr)tr.textContent='Rain is running down the big round window, soft and steady.\n\nYou are lying on a cloud-deep mattress beneath it. Wool blankets are piled within reach, and a small grey cat is asleep near your feet. It opens one eye, blinks at you slowly, and settles again.\n\nYou are welcome to stay as long as you like. If you would like to, you can look around, feel your body, or see a few places nearby. Whenever you want this spot again, home brings you back.';
  const inp=document.querySelector('#rao_cmd');if(inp)inp.placeholder='look · feel · places · stay · home';
  const vis=document.querySelector('#v19_field_vis');if(vis)vis.setAttribute('aria-label','your body');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(residentWelcome,0),{once:true});else setTimeout(residentWelcome,0);
})();