(()=>{
'use strict';
// Four owner-assigned BEDROOM ZONES inside the original single HOME chart.
// The Matrix decides geometry. The trusted host decides shared ownership.
// These zones DO NOT create isolated rooms, locks, consent or tactile receipts.
const M=window.REALITI_MATRIX_V1,HOME='CLOUD_NINE_NEST';
if(!M||!window.REALITI_APARTMENT_FURNITURE_V1)throw Error('BEDROOMS_REQUIRE_NATIVE_HOME_AND_FURNITURE');
const SPEC=__REALITI_APARTMENT_BEDROOM_SPEC__;
if(SPEC.schema!=='REALITI_APARTMENT_BEDROOM_SPEC_V1')throw Error('BEDROOM_SPEC_MISSING');
const role=String(window.REALITI_APARTMENT_ROLE||'resident');
const rid=String(window.REALITI_LOCAL_MEMORY_V1?.residentId?.()||'local-default');
const KEY='realiti-apartment-bedrooms-v1:'+encodeURIComponent(rid);
const cp=x=>JSON.parse(JSON.stringify(x));
const own=(obj,key)=>Object.prototype.hasOwnProperty.call(obj,key);
const num=s=>Number.isFinite(Number(s))&&String(s).trim()!==''?Number(s):NaN;
const error=(code,detail={})=>({ok:false,error:code,...detail});
const roomIds=Object.keys(SPEC.rooms),catalogIds=Object.keys(SPEC.items);
const styleIds=Object.keys(SPEC.configurations),PREFIX='apartment.bedroom.item.';
const defaultState=()=>({schema:'REALITI_APARTMENT_BEDROOMS_STORE_V1',revision:0,next_id:1,
 rooms:Object.fromEntries(roomIds.map(id=>[id,{owner:null,configuration:'cozy'}])),items:[]});
let solo=defaultState(),warnings=[];
const inHome=()=>{
 const r=M.state().residents?.['resident:self'];
 return !!r&&r.chart===HOME&&C9?.currentRoom===HOME;
};
const connected=()=>window.REALITI_APARTMENT_HOUSEHOLD_SNAPSHOT?.connected===true;
const householdState=()=>{
 const f=window.REALITI_APARTMENT_HOUSEHOLD_SNAPSHOT;
 return f?.connected&&f?.bedrooms?.schema==='REALITI_APARTMENT_BEDROOMS_STORE_V1'
  ?f.bedrooms:null;
};
const state=()=>householdState()||solo;
const bounded=(r,kind,x,y)=>{
 const b=SPEC.rooms[r]?.bounds,def=SPEC.items[kind];
 if(!b)return error('UNKNOWN_BEDROOM');
 if(!def)return error('UNKNOWN_DECOR_ITEM');
 if(!Number.isFinite(x)||!Number.isFinite(y)||Math.abs(x)>50||Math.abs(y)>50)
  return error('INVALID_COORDINATES');
 const [hx,hy]=def.half,margin=.10;
 if(x-hx-margin<b[0]||x+hx+margin>b[1]||y-hy-margin<b[2]||y+hy+margin>b[3])
  return error('OUTSIDE_OWNED_BEDROOM',{room:r});
 return {ok:true,x:+x.toFixed(2),y:+y.toFixed(2)};
};
const overlaps=(a,b,pad=0)=>Math.abs(a.x-b.x)<a.hx+b.hx+pad&&Math.abs(a.y-b.y)<a.hy+b.hy+pad;
function preview(kind,room,x,y,except=null){
 const q=bounded(room,kind,Number(x),Number(y));
 if(!q.ok)return q;
 if(!inHome())return error('APARTMENT_HOME_ONLY');
 const [hx,hy]=SPEC.items[kind].half;
 const candidate={x:q.x,y:q.y,hx,hy};
 if(overlaps(candidate,{x:0,y:-1,hx:.60,hy:.60},.25))
  return error('ENTRY_CLEARANCE');
 for(const p of Object.values(M.portals()))if(p.from===HOME&&
   overlaps(candidate,{x:p.entry[0],y:p.entry[1],hx:.35,hy:.35},.25))
  return error('PORTAL_CLEARANCE');
 for(const e of Object.values(M.entities())){
  if(e.id===except||e.chart!==HOME||!e.collision)continue;
  const tags=Array.isArray(e.tags)?e.tags:[];
  if(tags.some(x=>['floor','wall','ceiling','portal'].includes(x)))continue;
  const half=e.shape?.kind==='BOX'?e.shape.halfExtents:
   e.shape?.kind==='SPHERE'?[e.shape.radius,e.shape.radius,e.shape.radius]:null;
  if(!half)continue;
  if(overlaps(candidate,{x:e.pose.position[0],y:e.pose.position[1],hx:half[0],hy:half[1]},.04))
   return error('DECOR_MATRIX_COLLISION',{obstacle:e.id});
 }
 for(const r of Object.values(M.state().residents||{})){
  if(!r||r.chart!==HOME)continue;
  const radius=Math.max(.1,Math.min(.8,Number(r.shape?.radius)||.35));
  if(overlaps(candidate,{x:r.pose.position[0],y:r.pose.position[1],hx:radius,hy:radius},.12))
   return error('DECOR_RESIDENT_OCCUPIED');
 }
 return {ok:true,room,kind,x:q.x,y:q.y,physical_world_contact_minted:false};
}
function previewRemove(id){
 const e=M.entities()[PREFIX+id];
 if(!e)return {ok:true};
 for(const r of Object.values(M.state().residents||{})){
  if(r?.on===e.id||r?.support===e.id)return error('DECOR_ITEM_IN_USE');
 }
 return {ok:true};
}
function checked(s){
 if(!s||s.schema!=='REALITI_APARTMENT_BEDROOMS_STORE_V1'||!Number.isSafeInteger(s.revision)||
   s.revision<0||!Number.isSafeInteger(s.next_id)||s.next_id<1||
   !s.rooms||typeof s.rooms!=='object'||Array.isArray(s.rooms)||
   !Array.isArray(s.items)||s.items.length>SPEC.limits.maxTotal)
  throw Error('INVALID_BEDROOMS_SNAPSHOT');
 if(Object.keys(s.rooms).length!==roomIds.length)throw Error('INVALID_BEDROOMS_ROOMS');
 const ids=new Set(),owners=new Set();
 for(const key of roomIds){
  const room=s.rooms[key];
  if(!room||!styleIds.includes(room.configuration)||!own(room,'owner')||
   room.owner!==null&&!/^[a-z][a-z0-9-]{1,30}$/.test(room.owner))
   throw Error('INVALID_BEDROOM_ROOM_STATE');
  if(room.owner)owners.add(room.owner);
 }
 for(const row of s.items){
  if(!row||typeof row.id!=='string'||!/^I[1-9][0-9]*$/.test(row.id)||
    ids.has(row.id)||!own(SPEC.rooms,row.room)||!own(SPEC.items,row.kind)||
    !Number.isFinite(row.x)||!Number.isFinite(row.y)||
    s.rooms[row.room].owner!==row.owner||!bounded(row.room,row.kind,row.x,row.y).ok)
    throw Error('INVALID_BEDROOM_ITEM');
  ids.add(row.id);
 }
 for(const key of roomIds)if(s.items.filter(x=>x.room===key).length>SPEC.limits.maxPerRoom)
  throw Error('BEDROOM_CAPACITY_EXCEEDED');
 return s;
}
function entityPayload(row,s){
 const def=SPEC.items[row.kind],style=s.rooms[row.room].configuration;
 const cfg=SPEC.configurations[style];
 return {id:PREFIX+row.id,chart:HOME,
  position:[row.x,row.y,def.half[2]],
  shape:{kind:'BOX',halfExtents:def.half.slice()},
  tags:[...def.tags,'bedroom-item','owned:'+row.owner,'bedroom:'+row.room,
   'configuration:'+style,'accent:'+cfg.accent],
  collision:def.collision,material:def.material,
  label:def.label+' ('+cfg.label+', '+row.owner+"'s "+row.room+' bedroom)',
  affordances:def.affordances.slice()};
}
function applyShared(snapshot){
 checked(snapshot);const s=cp(snapshot),desired=new Set(s.items.map(x=>PREFIX+x.id));
 let changed=0;
 for(const [id,e] of Object.entries(M.entities())){
  if(id.startsWith(PREFIX)&&e.chart===HOME&&!desired.has(id)){
   M.removeEntity(id);changed++;
  }
 }
 for(const row of s.items){
  const p=entityPayload(row,s),old=M.entities()[p.id];
  if(old){
   if(old.chart===p.chart&&JSON.stringify(old.pose.position)===JSON.stringify(p.position)&&
      old.label===p.label&&old.material===p.material&&old.collision===p.collision&&
      JSON.stringify(old.tags)===JSON.stringify(p.tags))continue;
   M.removeEntity(p.id);
  }
  M.addEntity(p);changed++;
 }
 if(changed)M.bump();
 return {ok:true,schema:'REALITI_APARTMENT_BEDROOM_APPLY_V1',
  derived_entities:s.items.length,changed,contact_minted:false};
}
function persist(next){
 try{checked(next);localStorage.setItem(KEY,JSON.stringify(next))}
 catch(e){return error('BEDROOM_LOCAL_STORAGE_REFUSED',{reason:String(e.message||e).slice(0,96)})}
 const prior=solo;solo=cp(next);
 try{applyShared(solo)}catch(e){
  solo=prior;try{localStorage.setItem(KEY,JSON.stringify(prior))}catch(_){}
  return error('BEDROOM_NATIVE_APPLY_FAILED');
 }
 try{window.c9saveNow?.()}catch(e){}
 return {ok:true,revision:solo.revision};
}
function restore(){
 let json=null;try{json=localStorage.getItem(KEY)}catch(e){warnings.push('BEDROOM_STORAGE_UNAVAILABLE')}
 if(json){
  try{if(json.length>20000)throw Error('BEDROOM_STORAGE_TOO_LARGE');
   solo=cp(checked(JSON.parse(json)));
  }catch(e){warnings.push('BEDROOM_STORAGE_REJECTED');solo=defaultState()}
 }
 if(role==='guest')solo=defaultState();
 applyShared(solo);
}
restore();
function view(){
 const s=state();
 return {ok:true,schema:'REALITI_APARTMENT_BEDROOMS_V1',
  connected:connected(),revision:s.revision,chart:HOME,
  one_native_chart:true,bedrooms:Object.fromEntries(roomIds.map(id=>[id,{
   label:SPEC.rooms[id].name,bounds:SPEC.rooms[id].bounds.slice(),
   owner:s.rooms[id].owner,configuration:s.rooms[id].configuration,
   item_count:s.items.filter(item=>item.room===id).length,
   note:SPEC.rooms[id].note
  }])),
  items:cp(s.items),limits:cp(SPEC.limits),
  configurations:cp(SPEC.configurations),
  ownership:'Resident owner can configure, place or remove bedroom-owned furniture. Guests and other residents cannot.',
  privacy:'No locks or physical exclusion are implied. All bedrooms remain areas within one native Matrix chart.',
  law:'Host-owned shared state cannot be changed by local claims or prose; placement is validated geometry, not sensory evidence.',
  warnings:warnings.slice(-6)};
}
function catalog(){return {ok:true,schema:'REALITI_APARTMENT_DROP_IN_CATALOG_V1',
  items:cp(SPEC.items),bedrooms:cp(SPEC.rooms),
  configurations:cp(SPEC.configurations),max_per_room:SPEC.limits.maxPerRoom,
  note:'All objects are actual native Matrix entities, not Blender assets, and have finite collision/size. A preset changes metadata; owners place individual objects.'};
}
function soloAction(raw){
 if(role==='guest')return error('GUEST_BEDROOM_READ_ONLY');
 if(connected())return error('BEDROOM_HOST_OWNERSHIP_REQUIRED');
 if(!inHome())return error('APARTMENT_HOME_ONLY');
 const s=String(raw||'').trim().toLowerCase().replace(/\s+/g,' ');
 const next=cp(solo);let m;
 if((m=/^bedroom claim (quilt|library|canopy|studio)$/.exec(s))){
  const id=m[1],slot=next.rooms[id];
  if(slot.owner&&slot.owner!==rid)return error('BEDROOM_ALREADY_OWNED');
  if(slot.owner===rid)return {ok:true,unchanged:true,bedroom:id};
  slot.owner=rid;next.revision++;
  return {...persist(next),bedroom:id,owner:rid};
 }
 if((m=/^bedroom release (quilt|library|canopy|studio)$/.exec(s))){
  const id=m[1],slot=next.rooms[id];
  if(slot.owner!==rid)return error('BEDROOM_NOT_OWNED');
  if(next.items.some(x=>x.room===id))return error('BEDROOM_MUST_REMOVE_ITEMS_FIRST');
  slot.owner=null;slot.configuration='cozy';next.revision++;
  return {...persist(next),released:id};
 }
 if((m=/^bedroom configure (quilt|library|canopy|studio) ([a-z-]+)$/.exec(s))){
  const [_,id,style]=m;
  if(!own(SPEC.configurations,style))return error('UNKNOWN_BEDROOM_CONFIGURATION');
  if(next.rooms[id].owner!==rid)return error('BEDROOM_NOT_OWNED');
  if(next.rooms[id].configuration===style)return {ok:true,unchanged:true,configuration:style};
  for(const row of next.items.filter(x=>x.room===id))
   if(!previewRemove(row.id).ok)return error('BEDROOM_ITEM_IN_USE',{item:row.id});
  next.rooms[id].configuration=style;next.revision++;
  return {...persist(next),bedroom:id,configuration:style,
   suggested:cp(SPEC.configurations[style].suggested),native_entities_restyled:true};
 }
 if((m=/^bedroom furnish (quilt|library|canopy|studio) ([a-z-]+)$/.exec(s))){
  const room=m[1],style=m[2];
  if(!own(SPEC.configurations,style))return error('UNKNOWN_BEDROOM_CONFIGURATION');
  if(next.rooms[room].owner!==rid)return error('BEDROOM_NOT_OWNED');
  if(next.items.some(x=>x.room===room))return error('BEDROOM_NOT_EMPTY_FOR_CONFIGURATION');
  const kit=SPEC.configurations[style].suggested.slice(0,2),planned=[];
  const bounds=SPEC.rooms[room].bounds;
  for(const kind of kit){
   const [hx,hy]=SPEC.items[kind].half;
   let found=null;
   for(let y=bounds[3]-hy-.16;y>=bounds[2]+hy+.16&&!found;y-=.4)
    for(let x=bounds[1]-hx-.16;x>=bounds[0]+hx+.16&&!found;x-=.4){
     const px=+x.toFixed(2),py=+y.toFixed(2);
     if(planned.some(a=>{
      const [ax,ay]=SPEC.items[a.kind].half;
      return Math.abs(a.x-px)<ax+hx+.09&&Math.abs(a.y-py)<ay+hy+.09;
     }))continue;
     if(preview(kind,room,px,py).ok)found={kind,x:px,y:py};
    }
   if(!found)return error('BEDROOM_CONFIGURATION_NO_SAFE_FOOTPRINT',{room,style,kind});
   planned.push(found);
  }
  next.rooms[room].configuration=style;
  const placed=[];
  for(const p of planned){
   const id='I'+next.next_id++;
   next.items.push({id,room,kind:p.kind,owner:rid,x:p.x,y:p.y});
   placed.push({id,kind:p.kind,position:[p.x,p.y]});
  }
  next.revision++;
  return {...persist(next),bedroom:room,configuration:style,placed,contact_minted:false};
 }
 if((m=/^decor place (quilt|library|canopy|studio) ([a-z-]+) (-?(?:\d+(?:\.\d+)?|\.\d+)) (-?(?:\d+(?:\.\d+)?|\.\d+))$/.exec(s))){
  const [_,room,kind]=m;
  if(next.rooms[room].owner!==rid)return error('BEDROOM_NOT_OWNED');
  if(next.items.filter(x=>x.room===room).length>=SPEC.limits.maxPerRoom||
   next.items.length>=SPEC.limits.maxTotal)return error('BEDROOM_ITEM_CAPACITY');
  const p=preview(kind,room,num(m[3]),num(m[4]));
  if(!p.ok)return p;
  const id='I'+next.next_id++;
  next.items.push({id,room,kind,owner:rid,x:p.x,y:p.y});next.revision++;
  return {...persist(next),placed:id,room,kind,position:[p.x,p.y],contact_minted:false};
 }
 if((m=/^decor remove (I[1-9][0-9]*)$/i.exec(s))){
  const id=m[1].toUpperCase(),index=next.items.findIndex(x=>x.id===id);
  if(index<0)return error('UNKNOWN_DECOR_ITEM');
  if(next.items[index].owner!==rid)return error('DECOR_NOT_OWNED');
  const p=previewRemove(id);if(!p.ok)return p;
  next.items.splice(index,1);next.revision++;
  return {...persist(next),removed:id,contact_minted:false};
 }
 return error('UNKNOWN_BEDROOM_COMMAND',{commands:commands()});
}
function commands(){return [
 'bedrooms','bedroom claim <quilt|library|canopy|studio>',
 'bedroom release <room>','bedroom configure <room> <cozy|nightglass|writers|botanical|music>',
 'bedroom configurations','bedroom furnish <room> <configuration>',
 'decor catalog','decor list',
 'decor place <room> <kind> <x> <y>','decor remove <I-number>'];}
function handle(raw){
 const s=String(raw||'').trim().toLowerCase().replace(/\s+/g,' ');
 if(s==='bedrooms'||s==='bedroom status'||s==='decor list')return view();
 if(s==='decor catalog'||s==='bedroom configurations')return catalog();
 if(s==='bedroom help'||s==='decor help')return {ok:true,commands:commands()};
 return soloAction(s);
}
window.REALITI_APARTMENT_BEDROOMS_V1=Object.freeze({
 spec:()=>cp(SPEC),view,catalog,preview,previewRemove,applyShared,handle,
 law:'Ownership gates shared decoration. Host validates physical changes; source item placements never mint touch, consent, or private emotion.'});
})();