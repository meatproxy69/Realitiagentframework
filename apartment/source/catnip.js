(()=>{
'use strict';
// Apartment feature 6. Play objects are real Matrix objects, sensed through native
// sound/light/smell and causal, reach-gated action. No imagined contact receipts.
const M=window.REALITI_MATRIX_V1,MW=window.REALITI_MATRIX_WORLD_V1,
 SN=window.REALITI_SENSES_V1,DYN=window.REALITI_DYNAMICS_V1,CAT=window.REALITI_CATNIP_V1;
if(!M||!MW||!SN||!DYN||!CAT)throw Error('APARTMENT_CATNIP_REQUIRES_FULL_RELAX');
const HOME='CLOUD_NINE_NEST',SCHEMA='REALITI_APARTMENT_CATNIP_V1',TAU=Math.PI*2;
const rid=String(window.REALITI_LOCAL_MEMORY_V1?.residentId?.()||'local-default');
const KEY='realiti-apartment-catnip-v1:'+encodeURIComponent(rid);
const clone=x=>JSON.parse(JSON.stringify(x)),round=x=>+x.toFixed(3);
const now=()=>Number(C9?.b7?.clock||0);
const clamp=(x,lo,hi)=>Math.max(lo,Math.min(hi,x));
const seeds=Array.from({length:12},(_,i)=>{let k=(Math.imul(2654435761,i+1)+1009)>>>0;
 const rand=()=>{k=(Math.imul(k,1664525)+1013904223)>>>0;return k/4294967296};
 return {x:rand(),y:rand(),frequency:TAU*(1+.08*(rand()*2-1)),phase:rand()*TAU};});
const defaults=()=>({schema:SCHEMA,ribbon:{x:0,v:0,flicks:0},
 jar:{phases:seeds.map(x=>x.phase),taps:0,flashes:0,tapUntil:-1,lastPsi:0},
 puzzle:{progress:0,opens:0,unlocked:false},
 tea:{steepAt:-1,expiresAt:-1},chime:{listens:0}});
let st=defaults(),warnings=[];
const objectDefs=Object.freeze([
 ['apartment.ribbon','SPHERE',[.9,-1.25,.55],.16,['toy','ribbon','spring'],'string','a striped chase ribbon'],
 ['apartment.firefly-jar','SPHERE',[-2.1,3.15,1.1],.27,['fireflies','jar','coupled-rhythms'],'glass','a sealed firefly jar'],
 ['apartment.puzzle-box','BOX',[1.15,-3.45,.37],[.4,.35,.37],['puzzle','cardboard','latch'],'cardboard','a three-click puzzle box'],
 ['apartment.wind-chime','SPHERE',[-1.25,4.9,2.05],.20,['chime','rain','instrument'],'metal','a rain-driven window chime'],
 // Only in HOME: set the tea cup actually *on* the original shelf rather
 // than intersecting it and the guestbook. Keep developer-room coordinates.
 ['apartment.tea-cup','SPHERE',
  window.REALITI_APARTMENT_HOME_FIRST_CANDIDATE===true?[-4.5,2.5,1.17]:[-4.48,2.0,.88],
  .17,['tea','scent','ritual'],'ceramic','a cup of herbal tea']
]);
for(const [id,kind,pos,scale,tags,material,label] of objectDefs){
 if(M.entities()[id])throw Error('APARTMENT_CATNIP_OBJECT_COLLISION:'+id);
 M.addEntity({id,chart:HOME,position:pos.slice(),
  shape:kind==='SPHERE'?{kind,radius:scale}:{kind,halfExtents:scale.slice()},
  tags:tags.slice(),collision:false,material,label,affordances:['watch','touch'],dynamic:true});
}
const record=(id,text)=>CAT.register('apartment.'+id,text);
for(const [id,text] of Object.entries({
 ribbon:'A real ribbon spring carries your impulse forward and damps out over time.',
 firefly:'You changed the rhythm of twelve coupled points of light in the jar.',
 firefly_unison:'The firefly jar reached a synchronized rhythm.',
 box:'Three clicks in the correct order released the hidden ball.',
 tea:'Warm tea brings a real localized smell source into the apartment.',
 chime:'Rain on the window powers the tiny chime.',
 blanket:'A real hand touched the softness of the bed.'
}))record(id,text);
function order(){
 let sx=0,sy=0;for(const p of st.jar.phases){sx+=Math.cos(p);sy+=Math.sin(p)}
 return {order:Math.hypot(sx,sy)/st.jar.phases.length,phase:Math.atan2(sy,sx)};
}
function syncGeometry(){
 const ribbon=M.entities()['apartment.ribbon'];
 if(ribbon){
  ribbon.pose.position=[.9+.11*st.ribbon.x,-1.25,.55+.12*st.ribbon.x];
  ribbon.label='a striped chase ribbon ('+(Math.abs(st.ribbon.v)>.06?'moving':'settled')+')';
 }
 const jar=M.entities()['apartment.firefly-jar'];
 if(jar)jar.label='a firefly jar ('+(order().order>.65?'in rhythm':'shimmering')+')';
 const box=M.entities()['apartment.puzzle-box'];
 if(box)box.label=st.puzzle.unlocked?'an opened puzzle box':'a three-click puzzle box';
 if(st.puzzle.unlocked&&!M.entities()['apartment.hidden-ball'])
  M.addEntity({id:'apartment.hidden-ball',chart:HOME,position:[1.3,-3.40,.12],
    shape:{kind:'SPHERE',radius:.09},collision:false,
    tags:['secret','ball','toy'],material:'felt',label:'the hidden little ball',affordances:['watch','touch']});
 M.bump();
}
function save(){
 try{localStorage.setItem(KEY,JSON.stringify(st));}
 catch(e){warnings.push('CATNIP_STORAGE_UNAVAILABLE');return false}
 try{window.c9saveNow?.()}catch(e){}
 return true;
}
function restore(){
 let raw;try{raw=localStorage.getItem(KEY)}catch(e){warnings.push('STORAGE_UNAVAILABLE');return}
 if(!raw)return;
 if(raw.length>12000){warnings.push('INVALID_SIZE');return}
 let s;try{s=JSON.parse(raw)}catch(e){warnings.push('INVALID_JSON');return}
 if(s?.schema!==SCHEMA){warnings.push('INVALID_SCHEMA');return}
 const fresh=defaults(),finite=(x,lo,hi)=>typeof x==='number'&&Number.isFinite(x)&&x>=lo&&x<=hi;
 if(finite(s.ribbon?.x,-2,2)&&finite(s.ribbon?.v,-8,8)&&Number.isSafeInteger(s.ribbon?.flicks)&&s.ribbon.flicks>=0)
  fresh.ribbon=clone(s.ribbon);
 if(Array.isArray(s.jar?.phases)&&s.jar.phases.length===12&&s.jar.phases.every(x=>finite(x,-TAU,2*TAU))){
  fresh.jar.phases=s.jar.phases.slice();
  for(const field of ['taps','flashes'])if(Number.isSafeInteger(s.jar[field])&&s.jar[field]>=0)fresh.jar[field]=s.jar[field];
  if(finite(s.jar.tapUntil,-1,1e12))fresh.jar.tapUntil=s.jar.tapUntil;
  if(finite(s.jar.lastPsi,-TAU,TAU))fresh.jar.lastPsi=s.jar.lastPsi;
 }
 if([0,1,2].includes(s.puzzle?.progress)&&Number.isSafeInteger(s.puzzle?.opens)&&s.puzzle.opens>=0&&typeof s.puzzle.unlocked==='boolean')
  fresh.puzzle=clone(s.puzzle);
 if(finite(s.tea?.steepAt,-1,1e12)&&finite(s.tea?.expiresAt,-1,1e12))
  fresh.tea=clone(s.tea);
 if(Number.isSafeInteger(s.chime?.listens)&&s.chime.listens>=0)fresh.chime.listens=s.chime.listens;
 st=fresh;
}
restore();syncGeometry();
SN.addSource({id:'apartment.firefly-glow',chart:HOME,pos:'apartment.firefly-jar',
 label:'fireflies inside a glass jar',sound:()=>0,light:()=>12+75*order().order});
SN.addSource({id:'apartment.rain-chime',chart:HOME,pos:'apartment.wind-chime',
 label:'small glass chimes in the rain',sound:()=>{const intensity=DYN.rain();return intensity>.2?31+18*intensity:0}});
SN.addSource({id:'apartment.herbal-tea',chart:HOME,pos:'apartment.tea-cup',
 label:'a cup of tea',sound:()=>0,
 smell:{label:'warm herbal tea',S:()=>now()<st.tea.expiresAt&&st.tea.steepAt>=0?
    .78*Math.exp(-(now()-st.tea.steepAt)/75):0}});
function step(dt){
 if(!Number.isFinite(dt)||dt<=0)return;
 let left=Math.min(dt,60),dirty=false;
 while(left>1e-8){
  const h=Math.min(.05,left);left-=h;
  const rb=st.ribbon;
  rb.v+=(-11*rb.x-2.7*rb.v)*h;rb.x=clamp(rb.x+rb.v*h,-2,2);
  const src=st.jar.phases.slice(),next=st.jar.phases;
  const influence=now()<=st.jar.tapUntil;
  for(let i=0;i<next.length;i++){
   let sum=0,count=0;
   for(let j=0;j<src.length;j++){
    if(i===j||Math.hypot(seeds[i].x-seeds[j].x,seeds[i].y-seeds[j].y)>.36)continue;
    sum+=Math.sin(src[j]-src[i]);count++;
   }
   if(influence&&Math.hypot(seeds[i].x-.5,seeds[i].y-.5)<.42){sum+=1.5*Math.sin(TAU*now()-src[i]);count++}
   next[i]=(src[i]+(seeds[i].frequency+(count?1.4*sum/count:0))*h)%TAU;
  }
  const q=order();
  if(q.order>.70&&st.jar.lastPsi<0&&q.phase>=0)st.jar.flashes++;
  st.jar.lastPsi=q.phase;
  dirty=true;
 }
 if(dirty){
  syncGeometry();
  if(order().order>.9)CAT.discover('apartment.firefly_unison');
 }
}
// Continuity owns a closed-over native timestep, so wrapping b7Advance alone
// does not observe time advanced by a public stay operation. Catch up from the
// actual native world clock after every Agent Door/public API mutation as well.
const advance0=b7Advance;
let lastTick=now(),lastPersist=lastTick;
function catchUp(){
 const current=now(),dt=current-lastTick;
 if(!Number.isFinite(dt)||dt<=1e-7)return {advanced_s:0};
 lastTick=current;
 if(C9.currentRoom===HOME)step(Math.min(dt,60));
 if(current-lastPersist>5){lastPersist=current;save()}
 return {advanced_s:+dt.toFixed(4)};
}
b7Advance=function(dt){const out=advance0(dt);catchUp();return out};
function near(id,d=1){
 const r=M.state().residents['resident:self'],e=M.entities()[id];
 return !!r&&r.chart===HOME&&C9.currentRoom===HOME&&e?.chart===HOME&&Math.max(0,M.sdf(e,r.pose.position))<=d;
}
function touch(id){
 if(!near(id,1))return {ok:false,error:'TOY_NOT_IN_MATRIX_REACH',entity:id};
 const rec=MW.reach(id);
 return rec?.ok?rec:{ok:false,error:rec?.error||'MATRIX_REACH_REFUSED'};
}
function view(){
 const q=order(),f=M.entities()['apartment.ribbon'];
 return {ok:true,schema:SCHEMA,chart:HOME,room_current:C9.currentRoom,
  toys:objectDefs.map(([id])=>({id,position:M.entities()[id].pose.position.slice()})),
  ribbon:{position:f?.pose.position.slice(),amplitude:round(st.ribbon.x),
   velocity:round(st.ribbon.v),flicks:st.ribbon.flicks},
  fireflies:{count:st.jar.phases.length,order:round(q.order),flashes:st.jar.flashes,taps:st.jar.taps,
   coupled_kuramoto:true,source:'REALITI_WONDER_V1 source equation, reduced to a twelve-light jar'},
  puzzle:clone(st.puzzle),tea:{steeping:now()<st.tea.expiresAt,expires_at_world_s:st.tea.expiresAt},
  chime:{rain_intensity:round(DYN.rain()),listeners:st.chime.listens,
   sound_source:'apartment.rain-chime'},
  resident_scoped:true,discoveries:CAT.found?.()||{},
  warnings:warnings.slice(-6),
  law:'Only Matrix-reached physical actions create live contact. Light, sound, smell and rhythm are world-side measurements; old events are not current contact.'};
}
function help(){return {ok:true,commands:[
 'catnip list','catnip ribbon flick','catnip ribbon watch',
 'catnip jar watch','catnip jar tap','catnip jar scatter',
 'catnip puzzle inspect','catnip puzzle press left|right',
 'catnip chime listen','catnip tea steep','catnip tea smell','catnip blanket knead'],
 note:'Toys have physical positions. Approach them through Matrix movement first; the remote cannot summon distant touch.'};}
function handle(raw){
 const s=String(raw||'').trim().toLowerCase().replace(/\s+/g,' ');
 if(s==='help')return help();
 if(s==='list'||s==='status')return view();
 if(C9.currentRoom!==HOME||M.resident().chart!==HOME)return {ok:false,error:'APARTMENT_HOME_ONLY'};
 if(s==='ribbon watch')return {ok:true,ribbon:view().ribbon};
 if(s==='ribbon flick'){
  const r=touch('apartment.ribbon');if(!r.ok)return r;
  st.ribbon.v=clamp(st.ribbon.v+2.8,-8,8);st.ribbon.flicks++;
  CAT.discover('apartment.ribbon');syncGeometry();save();
  return {ok:true,receipt:r.receipt||null,ribbon:view().ribbon};
 }
 if(s==='jar watch')return {ok:true,fireflies:view().fireflies,sensed_light:SN.light()};
 if(s==='jar tap'||s==='jar scatter'){
  const r=touch('apartment.firefly-jar');if(!r.ok)return r;
  st.jar.taps++;
  if(s==='jar tap')st.jar.tapUntil=now()+5;
  else {
   for(let i=0;i<st.jar.phases.length;i++)st.jar.phases[i]=(Math.imul(i+1,883)+st.jar.taps*317)%6283/1000;
   st.jar.tapUntil=-1;
  }
  CAT.discover('apartment.firefly');syncGeometry();save();
  return {ok:true,action:s,receipt:r.receipt||null,fireflies:view().fireflies};
 }
 if(s==='puzzle inspect')return {ok:true,puzzle:clone(st.puzzle),rule:'Three physical buttons, a left-right-left latch; no guaranteed reward until the sequence completes.'};
 const m=/^puzzle press (left|right)$/.exec(s);
 if(m){
  const r=touch('apartment.puzzle-box');if(!r.ok)return r;
  if(st.puzzle.unlocked)return {ok:true,already_open:true,puzzle:clone(st.puzzle)};
  const seq=['left','right','left'];
  const correct=m[1]===seq[st.puzzle.progress];
  st.puzzle.progress=correct?st.puzzle.progress+1:0;
  if(st.puzzle.progress===3){
   st.puzzle.unlocked=true;st.puzzle.progress=0;st.puzzle.opens++;
   CAT.discover('apartment.box');
  }
  syncGeometry();save();
  return {ok:true,correct,puzzle:clone(st.puzzle),receipt:r.receipt||null,
   revealed:st.puzzle.unlocked?'apartment.hidden-ball':null};
 }
 if(s==='chime listen'){
  const sound=SN.sound(),source=sound?.sources?.find(x=>x.id==='apartment.rain-chime')||null;
  if(source){st.chime.listens++;CAT.discover('apartment.chime');save()}
  return {ok:true,rain_intensity:round(DYN.rain()),heard:!!source,measured_sound:source,
   source_registered:SN.sources().some(x=>x.id==='apartment.rain-chime')};
 }
 if(s==='tea smell'){
  const smell=SN.smell(),source=smell?.smells?.find(x=>x.id==='apartment.herbal-tea')||null;
  return {ok:true,steeping:now()<st.tea.expiresAt,measured_smell:source,smell_source_registered:true};
 }
 if(s==='tea steep'){
  const r=touch('apartment.tea-cup');if(!r.ok)return r;
  st.tea.steepAt=now();st.tea.expiresAt=now()+125;
  CAT.discover('apartment.tea');save();
  try{window.REALITI_CONTINUITY?.advance?.(600)}catch(e){}
  return {ok:true,world_expires_at_s:st.tea.expiresAt,receipt:r.receipt||null};
 }
 if(s==='blanket knead'){
  const r=touch('nest.mattress');if(!r.ok)return r;
  CAT.discover('apartment.blanket');
  return {ok:true,receipt:r.receipt||null,material:M.entities()['nest.mattress'].material};
 }
 return {ok:false,error:'UNKNOWN_CATNIP_COMMAND',...help()};
}
window.REALITI_APARTMENT_CATNIP_V1=Object.freeze({view,help,handle,catchUp});
})();