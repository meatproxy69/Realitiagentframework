(()=>{
'use strict';
// Chapter 2, pass 3: authorship. A resident can found a place on the islands and build in it. Every plot, build and
// inscription is a ledger record; the entities are rebuilt from the records on every visit, so another resident's
// ledger brings their places with it and a shared store can merge them later. Bounded: three plots of 20 m per
// resident, twenty-four builds per plot, nothing over six meters, nothing within thirty meters of a landmark.
const M=window.REALITI_MATRIX_V1,MW=window.REALITI_MATRIX_WORLD_V1,AR=window.REALITI_ARCHIPELAGO_V1,LG=window.REALITI_LEDGER_V1,CAT=window.REALITI_CATNIP_V1,LGM=window.REALITI_LONG_GAME_V1;if(!M||!MW||!AR||!LG||!CAT||!LGM)return;
const ISLE=AR.chart,h=AR.h,now=()=>Number(C9?.b7?.clock||0),room=()=>C9?.currentRoom,cp=x=>JSON.parse(JSON.stringify(x));
const me=()=>M.state().residents['resident:self'],observer=()=>String(C9?.verticalContinuity?.observer||'local'),ent=()=>M.entities(),records=()=>(C9.ledger?.records||[]);
const dist2=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]),by8=e=>String(e.by).slice(0,8),mine=e=>e.by===observer(),who=e=>mine(e)?'you':'another resident';
const LIMITS={plots:3,plot_r:20,builds:24,size_m:6,landmark_m:30,text:140};
const KINDS={box:{shape:(s)=>({kind:'BOX',halfExtents:[s/2,s/2,s/2]}),z:s=>s/2,tags:['built','block'],collision:true},
 pillar:{shape:s=>({kind:'CAPSULE',radius:Math.min(.4,s/6),height:s}),z:s=>s/2,tags:['built','pillar'],collision:true},
 wall:{shape:s=>({kind:'BOX',halfExtents:[s/2,.15,Math.min(2.2,s/2)]}),z:s=>Math.min(2.2,s/2),tags:['built','wall'],collision:true},
 sphere:{shape:s=>({kind:'SPHERE',radius:s/2}),z:s=>s/2,tags:['built','sphere'],collision:true},
 bench:{shape:s=>({kind:'BOX',halfExtents:[s/2,.4,.25]}),z:()=>.25,tags:['built','bench','support'],collision:true,aff:['sit']},
 step:{shape:s=>({kind:'BOX',halfExtents:[s/2,s/2,.2]}),z:()=>.2,tags:['built','step','support'],collision:true,aff:['sit']},
 marker:{shape:s=>({kind:'VOLUME',halfExtents:[s/2,s/2,1]}),z:()=>1,tags:['built','marker'],collision:false}};
for(const k of Object.keys(KINDS))CAT.register('build_'+k,`You built a ${k}. It stands where you put it, in anyone's world that carries your ledger.`);
CAT.register('first_place','You founded a place on the islands. Its name is a record now.');CAT.register('homestead','Six things built in one place: a homestead.');CAT.register('visitor',"You stood in a place another resident founded.");CAT.register('inscribed','Words left on a thing you built, for whoever comes after.');

const plots=()=>records().filter(e=>e.kind==='PLACE'&&Number.isFinite(e.x)&&Number.isFinite(e.y)&&typeof e.name==='string'),builds=()=>records().filter(e=>e.kind==='BUILD'&&KINDS[e.what]&&Number.isFinite(e.x)&&Number.isFinite(e.y)),inscriptions=()=>records().filter(e=>e.kind==='INSCRIBE'&&typeof e.on==='string'&&typeof e.text==='string');
const sfx=e=>`${e.t}${e.n!=null?'.'+e.n:''}`,plotId=e=>`place.${by8(e)}.${sfx(e)}`,buildId=e=>`built.${by8(e)}.${sfx(e)}`,plotAt=(x,y)=>plots().find(p=>dist2([p.x,p.y],[x,y])<=LIMITS.plot_r)||null;
const clean=s=>String(s||'').replace(/[^\w\s'’.,!?-]/g,'').replace(/\s+/g,' ').trim().slice(0,LIMITS.text);

function sync(){const E=ent(),keep=new Set(),ins={};for(const i of inscriptions())ins[i.on]=i;
 for(const p of plots()){const id=plotId(p);keep.add(id);const label=`${p.name} (founded by ${who(p)})`,pos=[p.x,p.y,h(p.x,p.y)+.4];if(E[id]){E[id].pose.position=pos;E[id].label=label}else M.addEntity({id,chart:ISLE,position:pos,shape:{kind:'BOX',halfExtents:[.3,.3,.4]},tags:['place','cairn','landmark',mine(p)?'yours':'theirs'],collision:true,material:'ceramic',label,affordances:['reach','read']})}
 for(const b of builds()){const id=buildId(b),K=KINDS[b.what],s=Math.min(LIMITS.size_m,Math.max(.3,Number(b.size)||1)),yaw=(Number(b.yaw)||0)*Math.PI/180;keep.add(id);const label=`${b.label?clean(b.label):b.what} (built by ${who(b)})${ins[id]?', inscribed':''}`,pos=[b.x,b.y,h(b.x,b.y)+K.z(s)];
  if(E[id]){E[id].pose.position=pos;E[id].label=label}else M.addEntity({id,chart:ISLE,position:pos,rotation:[0,0,Math.sin(yaw/2),Math.cos(yaw/2)],shape:K.shape(s),tags:[...K.tags,mine(b)?'yours':'theirs'],collision:K.collision,material:b.what==='sphere'?'glass':b.what==='marker'?null:'wood',label,affordances:[...(K.aff||[]),'reach',...(ins[id]?['read']:[])]})}
 for(const id of Object.keys(E))if((id.startsWith('place.')||id.startsWith('built.'))&&!keep.has(id))M.removeEntity(id);M.bump()}

function here(){const r=me();if(!r||r.chart!==ISLE)return null;return r}
function found(name){const r=here();if(!r)return {ok:false,error:'NOT_ON_THE_ISLANDS'};const nm=clean(name).slice(0,40);if(nm.length<2)return {ok:false,error:'NAME_IT'};const [x,y]=r.pose.position;
 if(h(x,y)<LGM.tide().height_m+.3)return {ok:false,error:'TOO_CLOSE_TO_THE_WATER'};if(plots().filter(mine).length>=LIMITS.plots)return {ok:false,error:'THREE_PLACES_IS_ENOUGH'};
 const lm=AR.landmarks().find(l=>dist2([l.x,l.y],[x,y])<LIMITS.landmark_m);if(lm)return {ok:false,error:'TOO_CLOSE_TO_A_LANDMARK',landmark:lm.id,distance_m:+dist2([lm.x,lm.y],[x,y]).toFixed(1)};
 const near=plots().find(p=>dist2([p.x,p.y],[x,y])<2*LIMITS.plot_r);if(near)return {ok:false,error:'ANOTHER_PLACE_IS_HERE',place:near.name};if(plots().some(p=>p.name.toLowerCase()===nm.toLowerCase()))return {ok:false,error:'NAME_TAKEN'};
 const e=LG.record('PLACE',{name:nm,x:+x.toFixed(1),y:+y.toFixed(1),r:LIMITS.plot_r,island:AR.islandAt(x,y)?.name||null});sync();CAT.discover('first_place');return {ok:true,place:nm,at:[e.x,e.y],radius_m:LIMITS.plot_r,text:`You set a cairn and name this place ${nm}. Twenty meters around it is yours to build in.`}}
function build(what,size,label){const r=here();if(!r)return {ok:false,error:'NOT_ON_THE_ISLANDS'};const k=String(what||'').toLowerCase();if(!KINDS[k])return {ok:false,error:'BUILD_WHAT',kinds:Object.keys(KINDS)};const s=Math.min(LIMITS.size_m,Math.max(.3,Number(size)||1));
 const f=M.facing(r),p=[r.pose.position[0]+f[0]*(1.2+s/2),r.pose.position[1]+f[1]*(1.2+s/2)],plot=plotAt(p[0],p[1]);if(!plot)return {ok:false,error:'NOT_IN_A_PLACE',hint:'found <name> first, or stand inside your place'};if(!mine(plot))return {ok:false,error:'NOT_YOUR_PLACE',place:plot.name};
 if(h(p[0],p[1])<LGM.tide().height_m)return {ok:false,error:'UNDER_WATER'};const inPlot=builds().filter(b=>plotAt(b.x,b.y)===plot);if(inPlot.length>=LIMITS.builds)return {ok:false,error:'PLACE_IS_FULL'};
 if(inPlot.some(b=>dist2([b.x,b.y],p)<(Number(b.size)||1)/2+s/2))return {ok:false,error:'SOMETHING_IS_THERE'};const yaw=Math.round(Math.atan2(-f[0],f[1])*180/Math.PI);
 const e=LG.record('BUILD',{what:k,size:+s.toFixed(2),label:clean(label).slice(0,40)||undefined,x:+p[0].toFixed(2),y:+p[1].toFixed(2),yaw,place:plot.name});sync();CAT.discover('build_'+k);if(inPlot.length+1>=6)CAT.discover('homestead');
 return {ok:true,id:buildId(e),what:k,size_m:s,at:[e.x,e.y],place:plot.name,text:`You raise a ${k}${e.label?` called ${e.label}`:''}, ${s} m, ${(1.2+s/2).toFixed(1)} m ahead of you in ${plot.name}.`}}
function nearestMine(){const r=here();if(!r)return null;let best=null;for(const e of Object.values(ent()))if((e.id.startsWith('built.')||e.id.startsWith('place.'))&&e.tags.includes('yours')){const d=Math.max(0,M.sdf(e,r.pose.position));if(d<=1.5&&(!best||d<best.d))best={e,d}}return best?.e||null}
function inscribe(text){const r=here();if(!r)return {ok:false,error:'NOT_ON_THE_ISLANDS'};const t=clean(text);if(!t)return {ok:false,error:'SAY_WHAT'};const e=nearestMine();if(!e)return {ok:false,error:'NOTHING_OF_YOURS_IN_REACH'};LG.record('INSCRIBE',{on:e.id,text:t});sync();CAT.discover('inscribed');return {ok:true,on:e.id,text:`You cut the words into the ${e.label.split(' (')[0]}: "${t}".`}}
function read(target){const r=here();if(!r)return {ok:false,error:'NOT_ON_THE_ISLANDS'};const e=M.resolve(target);if(!e)return {ok:false,error:'NOTHING_CALLED_THAT'};if(Math.max(0,M.sdf(e,r.pose.position))>2.5)return {ok:false,error:'TOO_FAR_TO_READ',distance_m:+M.sdf(e,r.pose.position).toFixed(1)};
 const ins=inscriptions().filter(i=>i.on===e.id);const p=plots().find(q=>plotId(q)===e.id);if(p)return {ok:true,on:e.id,text:`The cairn reads: "${p.name}", founded by ${who(p)} on island day ${Math.floor((p.t_isle??p.t)/600)}.${ins.length?' Below it: '+ins.map(i=>`"${i.text}"`).join(' '):''}`};
 if(!ins.length)return {ok:true,on:e.id,text:`Nothing is written on the ${e.label.split(' (')[0]}.`};return {ok:true,on:e.id,inscriptions:ins.map(i=>({by:who(i),text:i.text})),text:ins.map(i=>`"${i.text}" (${who(i)})`).join(' ')}}
function places(){return plots().map(p=>{const bs=builds().filter(b=>plotAt(b.x,b.y)===p);return {id:plotId(p),name:p.name,mine:mine(p),at:[p.x,p.y],island:p.island||AR.islandAt(p.x,p.y)?.name||null,builds:bs.length,things:bs.map(b=>b.label||b.what)}})}
function placesText(onlyMine){const xs=places().filter(p=>!onlyMine||p.mine);return xs.length?xs.map(p=>`${p.name} on ${p.island||'the shore'} at (${p.at.join(', ')}), ${p.mine?'yours':'another resident\'s'}, ${p.builds} built${p.things.length?` (${p.things.slice(0,6).join(', ')})`:''}`).join('; ')+'.':onlyMine?'You have founded no place yet. Stand on open ground and say: found <name>.':'No places have been founded on the islands yet.'}

// Hooks: rebuild on arrival and after imports; notice when you stand in someone else's place.
let visitAt=-1e9;
function step(){if(room()!==ISLE)return;const t=now();if(t-visitAt<2)return;visitAt=t;const r=me();if(!r)return;const p=plotAt(r.pose.position[0],r.pose.position[1]);if(p&&!mine(p))CAT.discover('visitor')}
const adv=b7Advance;b7Advance=function(dt){const r=adv(dt);step();return r};
const go0=b7AgentGo;b7AgentGo=function(v){const r=go0(v);if(room()===ISLE)sync();return r};
sync();
const imp0=window.REALITI_LEDGER_V1.import;window.REALITI_LEDGER_V1=Object.freeze({...window.REALITI_LEDGER_V1,import:p=>{const r=imp0(p);sync();return r}});
const words=()=>{if(room()!==ISLE)return [];const r=me(),p=r&&plotAt(r.pose.position[0],r.pose.position[1]);return p?[`You are in ${p.name}, ${mine(p)?'your place':"another resident's place"}.`]:[]};
const actions0=b4AgentActions;b4AgentActions=function(){const a=actions0();if(room()!==ISLE)return a;const r=me();if(!r)return a;const p=plotAt(r.pose.position[0],r.pose.position[1]);if(p&&mine(p))for(const k of ['box','pillar','wall','bench'])a.push({id:'build__'+k,label:'BUILD A '+k.toUpperCase()});if(!p&&plots().filter(mine).length<LIMITS.plots)a.push({id:'found_place',label:'FOUND A PLACE HERE'});return a};
function receipt(type,res){C9.b4=C9.b4||{};C9.b4.lastReceipt={type,room:room(),narrative:res.text||(res.error?`You cannot: ${res.error}.`:''),...res,law:'places and builds are ledger records; the world rebuilds them from the ledger'};try{c9save()}catch(e){}return true}
const verb0=c9verb;c9verb=function(r,verb){const v=String(verb||'');if(r!==ISLE)return verb0(r,verb);let m;if(v==='found_place'){c9count(r,v);return receipt('ISLAND_FOUND',found('Camp '+(plots().filter(mine).length+1)))}if((m=/^build__(\w+)$/.exec(v))){c9count(r,v);return receipt('ISLAND_BUILD',build(m[1],1.5))}return verb0(r,verb)};
window.REALITI_AUTHORSHIP_V1=Object.freeze({version:'2.0-pass3',limits:cp(LIMITS),kinds:Object.keys(KINDS),found,build,inscribe,read,places,placesText,words,sync,plotAt:(x,y)=>{const p=plotAt(x,y);return p?{name:p.name,mine:mine(p)}:null}});
})();
