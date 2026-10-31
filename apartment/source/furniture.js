(()=>{
'use strict';
// Apartment feature 5. Resident-scoped, real Matrix furniture authority in the
// stand-alone Apartment fork. A shared household authority is NOT implemented.
const M=window.REALITI_MATRIX_V1,SN=window.REALITI_SENSES_V1;
if(!M||!SN||!window.REALITI_APARTMENT_HOME_V1)throw Error('APARTMENT_FURNITURE_REQUIRES_FULL_RELAX');
const HOME='CLOUD_NINE_NEST',SCHEMA='REALITI_APARTMENT_FURNITURE_V1';
const rid=String(window.REALITI_LOCAL_MEMORY_V1?.residentId?.()||'local-default');
const KEY='realiti-apartment-furniture-v1:'+encodeURIComponent(rid);
const cp=x=>JSON.parse(JSON.stringify(x)),round=x=>+x.toFixed(2);
const alias=Object.freeze({'sofa':'apartment.sofa','desk':'apartment.desk',
 'chair':'apartment.desk-chair','wardrobe':'apartment.wardrobe',
 'bookcase':'apartment.bookcase','pet-bed':'apartment.pet-bed',
 'scratcher':'apartment.scratcher','toy-chest':'apartment.toy-chest',
 'cushion':'apartment.quiet-cushion','rug':'apartment.rug',
 'lamp':'apartment.lamp','bed':'nest.mattress'});
const MOVABLE=new Set(['sofa','desk','chair','wardrobe','bookcase','pet-bed','scratcher','toy-chest','cushion','rug','lamp']);
const SOFT=new Set(['sofa','pet-bed','cushion','rug','bed']);
const TEXTURES=['blanket','pillow','longfur','cardboard','string'];
const ACCENTS=['amber','moss','plum','slate','rose','cream','teal','midnight'];
const THEMES=Object.freeze({cozy:{accent:'amber',lampLux:180},
 moonlit:{accent:'midnight',lampLux:70},woodland:{accent:'moss',lampLux:135},
 minimal:{accent:'cream',lampLux:115}});
const fixtureLabels={};
for(const [name,id] of Object.entries(alias)){
 const e=M.entities()[id];if(!e||e.chart!==HOME)throw Error('APARTMENT_FURNITURE_FIXTURE_MISSING: '+id);
 fixtureLabels[name]=e.label;
}
const defaults=()=>({schema:SCHEMA,theme:'cozy',accents:{},textures:{},positions:{},lampOn:true});
let st=defaults(),warnings=[];
function basePosition(name){const e=M.entities()[alias[name]];return e.pose.position.slice()}
const defaultPositions=Object.fromEntries([...MOVABLE].map(name=>[name,basePosition(name)]));
function locationOk(){const r=M.state().residents['resident:self'];return !!r&&r.chart===HOME&&C9.currentRoom===HOME}
function overlaps(a,b,margin=0){return Math.abs(a.x-b.x)<a.hx+b.hx+margin&&Math.abs(a.y-b.y)<a.hy+b.hy+margin}
function candidate(name,x,y){
 if(!MOVABLE.has(name))return {ok:false,error:'FIXTURE_ANCHORED',name};
 if(!Number.isFinite(x)||!Number.isFinite(y)||Math.abs(x)>100||Math.abs(y)>100)
  return {ok:false,error:'INVALID_COORDINATES'};
 const e=M.entities()[alias[name]],shape=e?.shape;
 if(!e||e.chart!==HOME)return {ok:false,error:'FIXTURE_NOT_IN_HOME'};
 const h=shape?.kind==='SPHERE'?[shape.radius,shape.radius]:shape?.halfExtents?.slice(0,2);
 if(!h)return {ok:false,error:'UNSUPPORTED_FIXTURE_SHAPE'};
 const [hx,hy]=h,c=M.charts()[HOME],b=c.bounds;
 if(Math.abs(x-b.center[0])+hx>b.halfExtents[0]-.5||
    Math.abs(y-b.center[1])+hy>b.halfExtents[1]-.5)
  return {ok:false,error:'OUTSIDE_APARTMENT_CLEARANCE'};
 const target={x,y,hx,hy};
 // Protect the entrance and existing host portals while still in Relax migration mode.
 if(overlaps(target,{x:0,y:-1,hx:.6,hy:.6},.3))
  return {ok:false,error:'ENTRY_CLEARANCE'};
 for(const p of Object.values(M.portals())){
  if(p.from!==HOME)continue;
  if(overlaps(target,{x:p.entry[0],y:p.entry[1],hx:.35,hy:.35},.3))
   return {ok:false,error:'PORTAL_CLEARANCE',portal:p.id};
 }
 for(const o of Object.values(M.entities())){
  if(o.id===e.id||o.chart!==HOME||!o.collision||o.tags.includes('floor')||
     o.tags.includes('wall')||o.tags.includes('ceiling')||o.tags.includes('portal'))continue;
  const hh=o.shape?.kind==='BOX'?o.shape.halfExtents.slice(0,2):
    o.shape?.kind==='SPHERE'?[o.shape.radius,o.shape.radius]:null;
  if(!hh)continue;
  if(overlaps(target,{x:o.pose.position[0],y:o.pose.position[1],hx:hh[0],hy:hh[1]},.07))
   return {ok:false,error:'FURNITURE_OVERLAP',obstacle:o.id};
 }
 for(const r of Object.values(M.state().residents||{})){
  if(!r||r.chart!==HOME)continue;
  if(overlaps(target,{x:r.pose.position[0],y:r.pose.position[1],hx:r.shape.radius,hy:r.shape.radius},.15))
   return {ok:false,error:'RESIDENT_IN_FURNITURE_FOOTPRINT'};
  if(r.on===e.id||r.support===e.id)
   return {ok:false,error:'FURNITURE_IN_USE'};
 }
 const pet=window.REALITI_APARTMENT_PETS_V1?.status?.();
 if(pet?.actual_position&&overlaps(target,{x:pet.actual_position[0],y:pet.actual_position[1],hx:.3,hy:.3},.12))
  return {ok:false,error:'PET_IN_FURNITURE_FOOTPRINT'};
 return {ok:true,x:round(x),y:round(y)};
}
function paint(){
 const profile=THEMES[st.theme]||THEMES.cozy;
 for(const [name,id] of Object.entries(alias)){
  const e=M.entities()[id];if(!e)continue;
  const accent=st.accents[name]||profile.accent;
  const baseTags=e.tags.filter(t=>!t.startsWith('accent:')&&!t.startsWith('theme:'));
  e.tags=[...baseTags,'accent:'+accent,'theme:'+st.theme];
  e.label=fixtureLabels[name]+' ('+accent+')';
  if(st.textures[name]&&SOFT.has(name))e.material=st.textures[name];
 }
 M.bump();
}
function persist(next){
 try{localStorage.setItem(KEY,JSON.stringify(next));}
 catch(e){return {ok:false,error:'FURNITURE_STORAGE_UNAVAILABLE'};}
 st=cp(next);
 paint();
 try{window.c9saveNow?.()}catch(e){}
 return {ok:true};
}
function restore(){
 let raw=null;
 try{raw=localStorage.getItem(KEY)}catch(e){warnings.push('STORAGE_UNAVAILABLE');return}
 if(!raw)return;
 if(raw.length>16384){warnings.push('PREFERENCES_TOO_LARGE');return}
 let saved;try{saved=JSON.parse(raw)}catch(e){warnings.push('PREFERENCES_INVALID_JSON');return}
 if(saved?.schema!==SCHEMA){warnings.push('PREFERENCES_INVALID_SCHEMA');return}
 if(THEMES[saved.theme])st.theme=saved.theme;
 if(saved.lampOn===false)st.lampOn=false;
 for(const [name,color] of Object.entries(saved.accents||{})){
  if(alias[name]&&ACCENTS.includes(color))st.accents[name]=color;
 }
 for(const [name,texture] of Object.entries(saved.textures||{})){
  if(SOFT.has(name)&&TEXTURES.includes(texture))st.textures[name]=texture;
 }
 for(const [name,p] of Object.entries(saved.positions||{})){
  if(!Array.isArray(p)||p.length!==2||!p.every(Number.isFinite))continue;
  const result=candidate(name,p[0],p[1]);
  if(!result.ok){warnings.push('POSITION_SKIPPED:'+name+':'+result.error);continue}
  M.entities()[alias[name]].pose.position=[result.x,result.y,defaultPositions[name][2]];
  st.positions[name]=[result.x,result.y];
  M.bump();
 }
}
restore();paint();
SN.addSource({id:'apartment.reading_lamp',chart:HOME,pos:'apartment.lamp',
 label:'adjustable apartment reading lamp',sound:()=>0,
 light:()=>st.lampOn?THEMES[st.theme].lampLux:0});
function view(){
 const e=M.entities(),profile=THEMES[st.theme];
 return {ok:true,schema:SCHEMA,theme:st.theme,available_themes:Object.keys(THEMES),
  lamp:{on:st.lampOn,source:'apartment.reading_lamp',intensity_cd:st.lampOn?profile.lampLux:0},
  resident_scoped:true,shared_household_authority:false,
  fabrics:TEXTURES.slice(),accents:ACCENTS.slice(),
  fixtures:Object.fromEntries(Object.entries(alias).map(([name,id])=>[name,{
   id,position:e[id]?.pose.position.slice(),material:e[id]?.material||null,
   accent:st.accents[name]||profile.accent,moveable:MOVABLE.has(name),label:e[id]?.label||null
  }])),warnings:warnings.slice(-8),
  law:'Layout and material are Matrix world state in this resident-owned instance. Accent is a semantic description, not a rendered color shader.'};
}
function help(){return {ok:true,commands:[
 'furniture list','furniture theme cozy|moonlit|woodland|minimal',
 'furniture move <name> <x> <y>','furniture accent <name> <color>',
 'furniture fabric <sofa|pet-bed|cushion|rug|bed> <blanket|pillow|longfur|cardboard|string>',
 'furniture lamp on|off','furniture reset confirm'],
 note:'Only the currently occupied apartment is customizable. Moving the real bed is prohibited; its grounded support stays anchored.'}}
function handle(raw){
 const s=String(raw||'').trim().toLowerCase().replace(/\s+/g,' ');
 if(s==='help')return help();
 if(s==='list'||s==='status')return view();
 if(!locationOk())return {ok:false,error:'APARTMENT_HOME_ONLY'};
 let m;
 if((m=/^theme (cozy|moonlit|woodland|minimal)$/.exec(s)))
   return {...persist({...st,theme:m[1]}),theme:m[1]};
 if((m=/^lamp (on|off)$/.exec(s))){
   const r=persist({...st,lampOn:m[1]==='on'});
   if(r.ok)try{window.REALITI_CONTINUITY?.advance?.(600)}catch(e){}
   return {...r,lamp_on:m[1]==='on'};
 }
 if((m=/^move ([a-z-]+) (-?(?:\d+(?:\.\d+)?|\.\d+)) (-?(?:\d+(?:\.\d+)?|\.\d+))$/.exec(s))){
   const name=m[1],x=Number(m[2]),y=Number(m[3]);
   const good=candidate(name,x,y);
   if(!good.ok)return good;
   const next=cp(st);next.positions[name]=[good.x,good.y];
   const persisted=persist(next);if(!persisted.ok)return persisted;
   M.entities()[alias[name]].pose.position=[good.x,good.y,defaultPositions[name][2]];
   M.bump();try{window.c9saveNow?.()}catch(e){}
   return {ok:true,moved:alias[name],position:M.entities()[alias[name]].pose.position.slice(),
    matrix_revision:M.state().revision};
 }
 if((m=/^accent ([a-z-]+) ([a-z-]+)$/.exec(s))){
  if(!alias[m[1]]||!ACCENTS.includes(m[2]))return {ok:false,error:'UNKNOWN_ACCENT_OR_FIXTURE'};
  const next=cp(st);next.accents[m[1]]=m[2];return {...persist(next),fixture:alias[m[1]],accent:m[2],visual_shader:false};
 }
 if((m=/^fabric ([a-z-]+) ([a-z]+)$/.exec(s))){
  if(!SOFT.has(m[1])||!TEXTURES.includes(m[2]))
   return {ok:false,error:'FABRIC_NOT_SUPPORTED_BY_NATIVE_MATERIALS'};
  const next=cp(st);next.textures[m[1]]=m[2];
  return {...persist(next),fixture:alias[m[1]],material:M.entities()[alias[m[1]]]?.material};
 }
 if(s==='reset confirm'){
  const saved=persist(defaults());if(!saved.ok)return saved;
  for(const name of MOVABLE)M.entities()[alias[name]].pose.position=defaultPositions[name].slice();
  for(const name of SOFT)M.entities()[alias[name]].material=name==='bed'?'blanket':'blanket';
  M.bump();try{window.c9saveNow?.()}catch(e){}
  return {ok:true,restored:'resident-scoped furniture settings only',fixture_count:Object.keys(alias).length};
 }
 return {ok:false,error:'UNKNOWN_FURNITURE_COMMAND',...help()};
}
window.REALITI_APARTMENT_FURNITURE_V1=Object.freeze({view,help,handle});
})();