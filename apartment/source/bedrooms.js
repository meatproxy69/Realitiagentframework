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
const knownSwatch=x=>typeof x==='string'&&Object.prototype.hasOwnProperty.call(SPEC.swatches,x);
const validPalette=x=>x&&typeof x==='object'&&!Array.isArray(x)&&
 Object.keys(x).length===SPEC.colorRoles.length&&
 SPEC.colorRoles.every(role=>Object.prototype.hasOwnProperty.call(x,role)&&knownSwatch(x[role]));
const paletteFor=r=>cp(r.palette||SPEC.colorDefaults[r.configuration]);
const own=(obj,key)=>Object.prototype.hasOwnProperty.call(obj,key);
const num=s=>Number.isFinite(Number(s))&&String(s).trim()!==''?Number(s):NaN;
const error=(code,detail={})=>({ok:false,error:code,...detail});
const roomIds=Object.keys(SPEC.rooms),catalogIds=Object.keys(SPEC.items);
const styleIds=Object.keys(SPEC.configurations),PREFIX='apartment.bedroom.item.';
const CHEST='apartment.bedroom.chest.';
const SAMPLE='apartment.bedroom.sample.';
if(window.REALITI_APARTMENT_HOME_FIRST_CANDIDATE===true){
 for(const room of roomIds){
  const def=SPEC.chests[room],id=CHEST+room;
  if(!def||!Array.isArray(def.position)||!Array.isArray(def.half))
   throw Error('BEDROOM_CHEST_SPEC_MISSING:'+room);
  if(M.entities()[id])throw Error('BEDROOM_CHEST_ID_ALREADY_REGISTERED:'+id);
  M.addEntity({id,chart:HOME,position:def.position.slice(),
   shape:{kind:'BOX',halfExtents:def.half.slice()},material:def.material,
   label:def.label,tags:['bedroom-chest','storage','bedroom:'+room],
   affordances:['inspect','open'],collision:true});
  // Each chest holds four small noncolliding cardstock samples.
  for(const [i,role] of SPEC.colorRoles.entries()){
   const sid=SAMPLE+room+'.'+role,swatchId=SPEC.colorDefaults.cozy[role];
   if(M.entities()[sid])throw Error('BEDROOM_SAMPLE_ID_ALREADY_REGISTERED:'+sid);
   M.addEntity({id:sid,chart:HOME,
    position:[+(def.position[0]+(i-1.5)*.12).toFixed(3),
      +(def.position[1]-.10).toFixed(3),
      +(def.position[2]+def.half[2]+.014).toFixed(3)],
    shape:{kind:'BOX',halfExtents:[.045,.055,.014]},
    material:'cardboard',collision:false,
    label:role+' sample: '+SPEC.swatches[swatchId].label,
    tags:['paint-sample','bedroom:'+room,'palette-role:'+role,'swatch:'+swatchId],
    affordances:['inspect']});
  }
 }
 M.bump();
}
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
function preview(kind,room,x,y,except=null,ignoreResidents=false){
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
 if(!ignoreResidents)for(const r of Object.values(M.state().residents||{})){
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
// Guidance must pass the same native support check as the eventual removal.
// A small item is not automatically safe to store if it supports a resident.
function canStowNow(row){
 const entity=row&&M.entities()[PREFIX+row.id];
 return !!row&&row.owner===rid&&row.stored!==true&&
  SPEC.storableKinds.includes(row.kind)&&entity?.chart===HOME&&
  previewRemove(row.id).ok===true;
}
function checked(s){
 if(!s||s.schema!=='REALITI_APARTMENT_BEDROOMS_STORE_V1'||!Number.isSafeInteger(s.revision)||
   s.revision<0||!Number.isSafeInteger(s.next_id)||s.next_id<1||
   !s.rooms||typeof s.rooms!=='object'||Array.isArray(s.rooms)||
   !Array.isArray(s.items)||s.items.length>SPEC.limits.maxTotal)
  throw Error('INVALID_BEDROOMS_SNAPSHOT');
 if(Object.keys(s.rooms).length!==roomIds.length)throw Error('INVALID_BEDROOMS_ROOMS');
 const ids=new Set(),owners=new Set();let highest=0;
 for(const key of roomIds){
  const room=s.rooms[key];
  if(!room||!styleIds.includes(room.configuration)||!own(room,'owner')||
   room.owner!==null&&!/^[a-z][a-z0-9-]{1,30}$/.test(room.owner)||
   own(room,'palette')&&!validPalette(room.palette))
   throw Error('INVALID_BEDROOM_ROOM_STATE');
  if(room.owner)owners.add(room.owner);
 }
 for(const row of s.items){
  if(!row||typeof row.id!=='string'||!/^I[1-9][0-9]*$/.test(row.id)||
    ids.has(row.id)||!own(SPEC.rooms,row.room)||!own(SPEC.items,row.kind)||
    (own(row,'stored')&&(row.stored!==true||!SPEC.storableKinds.includes(row.kind)))||
    !Number.isFinite(row.x)||!Number.isFinite(row.y)||
    s.rooms[row.room].owner!==row.owner||!bounded(row.room,row.kind,row.x,row.y).ok)
    throw Error('INVALID_BEDROOM_ITEM');
  ids.add(row.id);highest=Math.max(highest,Number(row.id.slice(1)));
 }
 if(highest>=s.next_id)throw Error('BEDROOMS_INVALID_NEXT_ID');
 for(const key of roomIds){
  if(s.items.filter(x=>x.room===key).length>SPEC.limits.maxPerRoom)
   throw Error('BEDROOM_CAPACITY_EXCEEDED');
  if(s.items.filter(x=>x.room===key&&x.stored===true).length>SPEC.limits.maxChestPerRoom)
   throw Error('BEDROOM_CHEST_CAPACITY_EXCEEDED');
 }
 // Check saved solid-on-solid contacts without trusting the current native
 // chart to already contain the other persisted entities during restoration.
 const solid=s.items.filter(row=>row.stored!==true&&SPEC.items[row.kind].collision);
 for(let i=0;i<solid.length;i++)for(let j=0;j<i;j++){
  const a=solid[i],b=solid[j];
  const ah=SPEC.items[a.kind].half,bh=SPEC.items[b.kind].half;
  if(Math.abs(a.x-b.x)<ah[0]+bh[0]+.04&&
     Math.abs(a.y-b.y)<ah[1]+bh[1]+.04)
   throw Error('BEDROOMS_OVERLAPPING_ITEMS');
 }
 return s;
}
function auditShared(snapshot){
 checked(snapshot);
 // Check currently known native world geometry. This catches a valid-hash
 // checkpoint with an illegal prop location; current occupants are excluded
 // because this is rehydration, not an attempted new placement.
 for(const row of snapshot.items.filter(item=>item.stored!==true)){
  const result=preview(row.kind,row.room,row.x,row.y,PREFIX+row.id,true);
  if(!result.ok)return error('BEDROOM_PERSISTED_MATRIX_CONFLICT',{
   item:row.id,reason:result.error,obstacle:result.obstacle||null});
 }
 return {ok:true,verified_items:snapshot.items.length};
}
function entityPayload(row,s){
 const def=SPEC.items[row.kind],configurationName=s.rooms[row.room].configuration;
 const cfg=SPEC.configurations[configurationName];
 return {id:PREFIX+row.id,chart:HOME,
  position:[row.x,row.y,def.half[2]],
  shape:{kind:'BOX',halfExtents:def.half.slice()},
  tags:[...def.tags,'bedroom-item','owned:'+row.owner,'bedroom:'+row.room,
   'configuration:'+configurationName,'accent:'+cfg.accent],
  collision:def.collision,material:def.material,
  label:def.label+' ('+cfg.label+', '+row.owner+"'s "+row.room+' bedroom)',
  affordances:def.affordances.slice()};
}
function applyShared(snapshot){
 checked(snapshot);
 const audit=auditShared(snapshot);
 if(!audit.ok)throw Error(audit.error+':'+audit.item+':'+audit.reason);
 const s=cp(snapshot),placed=s.items.filter(row=>row.stored!==true),
  desired=new Set(placed.map(x=>PREFIX+x.id));
 // Color metadata lives on a fixed chest: in-place tag changes never remove
 // occupied furniture or claim to alter underlying material/light physics.
 for(const id of roomIds){
  const chest=M.entities()[CHEST+id];
  if(!chest)continue;
  const tags=(chest.tags||[]).filter(tag=>!tag.startsWith('palette-'));
  const colors=paletteFor(s.rooms[id]);
  for(const role of SPEC.colorRoles){
   const selected=colors[role],tile=M.entities()[SAMPLE+id+'.'+role];
   tags.push('palette-'+role+':'+selected);
   if(tile){
    const label=role+' sample: '+SPEC.swatches[selected].label;
    const nextTags=['paint-sample','bedroom:'+id,'palette-role:'+role,'swatch:'+selected];
    if(tile.label!==label||JSON.stringify(tile.tags)!==JSON.stringify(nextTags)){
     tile.label=label;tile.tags=nextTags;M.bump();
    }
   }
  }
  if(JSON.stringify(chest.tags)!==JSON.stringify(tags)){chest.tags=tags;M.bump()}
 }
 let changed=0;
 for(const [id,e] of Object.entries(M.entities())){
  if(id.startsWith(PREFIX)&&e.chart===HOME&&!desired.has(id)){
   M.removeEntity(id);changed++;
  }
 }
 for(const row of placed){
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
  derived_entities:placed.length,stored_items:s.items.length-placed.length,
  changed,contact_minted:false};
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
 try{applyShared(solo)}catch(e){
  warnings.push('BEDROOM_GEOMETRY_REJECTED');solo=defaultState();
  applyShared(solo);
 }
}
restore();
function view(){
 const s=state();
 return {ok:true,schema:'REALITI_APARTMENT_BEDROOMS_V1',
  connected:connected(),revision:s.revision,chart:HOME,
  one_native_chart:true,bedrooms:Object.fromEntries(roomIds.map(id=>[id,{
   label:SPEC.rooms[id].name,bounds:SPEC.rooms[id].bounds.slice(),
   owner:s.rooms[id].owner,configuration:s.rooms[id].configuration,
   palette:paletteFor(s.rooms[id]),
   palette_source:own(s.rooms[id],'palette')?'custom':'configuration',
   item_count:s.items.filter(item=>item.room===id).length,
   note:SPEC.rooms[id].note
  }])),
  items:cp(s.items.filter(row=>row.stored!==true)),
  chests:Object.fromEntries(roomIds.map(room=>[room,{
   entity_id:CHEST+room,label:SPEC.chests[room].label,
   owner:s.rooms[room].owner,position:SPEC.chests[room].position.slice(),
   stored_count:s.chests?.[room]?.stored_count??s.items.filter(row=>row.room===room&&row.stored===true).length,
   capacity:SPEC.limits.maxChestPerRoom
  }])),
  limits:cp(SPEC.limits),
  configurations:cp(SPEC.configurations),
  ownership:'Resident owner can configure, place or remove bedroom-owned furniture. Guests and other residents cannot.',
  privacy:'No locks or physical exclusion are implied. All bedrooms remain areas within one native Matrix chart.',
  law:'Host-owned shared state cannot be changed by local claims or prose; placement is validated geometry, not sensory evidence.',
  warnings:warnings.slice(-6)};
}
function catalog(){return {ok:true,schema:'REALITI_APARTMENT_DROP_IN_CATALOG_V1',
  items:cp(SPEC.items),bedrooms:cp(SPEC.rooms),
  chests:cp(SPEC.chests),storable_kinds:SPEC.storableKinds.slice(),
  configurations:cp(SPEC.configurations),max_per_room:SPEC.limits.maxPerRoom,
  color_roles:SPEC.colorRoles.slice(),swatches:cp(SPEC.swatches),
  palette_recipes:cp(SPEC.aestheticPalettes),
  note:'All objects are actual native Matrix entities, not Blender assets, and have finite collision/size. A preset changes metadata; owners place individual objects.'};
}
// Solo floor-finding uses the same finite Matrix collision preview as manual place.
 // Suggestions describe alternative positions; they do not reserve a layout.
function findSoloSpots(room,kind,excludeStoredId=null){
 if(!own(SPEC.rooms,room)||!own(SPEC.items,kind))return error('UNKNOWN_BEDROOM_OR_ITEM');
 if(solo.rooms[room].owner!==rid)return error('BEDROOM_NOT_OWNED');
 if(solo.items.length-(excludeStoredId?1:0)>=SPEC.limits.maxTotal||
    solo.items.filter(row=>row.room===room&&row.id!==excludeStoredId).length>=SPEC.limits.maxPerRoom)
  return error('BEDROOM_ITEM_CAPACITY');
 const bounds=SPEC.rooms[room].bounds,[hx,hy]=SPEC.items[kind].half,spots=[];
 for(let y=bounds[3]-hy-.16;y>=bounds[2]+hy+.16&&spots.length<3;y-=.4)
  for(let x=bounds[1]-hx-.16;x>=bounds[0]+hx+.16&&spots.length<3;x-=.4){
   const px=+x.toFixed(2),py=+y.toFixed(2);
   if(spots.some(p=>Math.hypot(p.x-px,p.y-py)<.75))continue;
   if(preview(kind,room,px,py).ok)spots.push({x:px,y:py});
  }
 return spots.length?{ok:true,schema:'REALITI_APARTMENT_DECOR_SUGGEST_V1',
  room,kind,suggestions:spots,revision:solo.revision,read_only:true,
  contact_minted:false}:error('BEDROOM_NO_SAFE_FOOTPRINT',{room,kind});
}
function soloAction(raw){
 if(role==='guest')return error('GUEST_BEDROOM_READ_ONLY');
 if(connected())return error('BEDROOM_HOST_OWNERSHIP_REQUIRED');
 if(!inHome())return error('APARTMENT_HOME_ONLY');
 const s=String(raw||'').trim().toLowerCase().replace(/\s+/g,' ');
 const next=cp(solo);let m;
 if((m=/^bedroom swatches set (quilt|library|canopy|studio) ([a-z-]+) ([a-z-]+) ([a-z-]+) ([a-z-]+)$/.exec(s))){
  const room=m[1],r=next.rooms[room];
  if(r.owner!==rid)return error('BEDROOM_NOT_OWNED');
  const colors=Object.fromEntries(SPEC.colorRoles.map((role,i)=>[role,m[i+2]]));
  if(!validPalette(colors))return error('UNKNOWN_SWATCH');
  if(JSON.stringify(paletteFor(r))===JSON.stringify(colors))return {ok:true,
   unchanged:true,room,colors,revision:solo.revision};
  r.palette=colors;next.revision++;
  return {...persist(next),room,colors,palette_recipe:'custom',
   shader_applied:false,contact_minted:false};
 }
 if((m=/^bedroom swatch (quilt|library|canopy|studio) (field|anchor|accent|bridge) ([a-z-]+)$/.exec(s))){
  const [_,room,role,color]=m,r=next.rooms[room];
  if(r.owner!==rid)return error('BEDROOM_NOT_OWNED');
  if(!knownSwatch(color))return error('UNKNOWN_SWATCH');
  const palette=paletteFor(r);
  if(palette[role]===color)return {ok:true,unchanged:true,room,
   colors:palette,revision:solo.revision};
  palette[role]=color;r.palette=palette;next.revision++;
  return {...persist(next),room,colors:palette,changed_role:role,
   shader_applied:false,contact_minted:false};
 }
 if((m=/^bedroom palette (quilt|library|canopy|studio) ([a-z0-9-]+)$/.exec(s))){
  const [_,room,recipe]=m,r=next.rooms[room];
  if(r.owner!==rid)return error('BEDROOM_NOT_OWNED');
  if(recipe==='reset'){
   if(!own(r,'palette'))return {ok:true,unchanged:true,room,
    colors:paletteFor(r),revision:solo.revision};
   delete r.palette;
  }else{
   if(!own(SPEC.aestheticPalettes,recipe))return error('UNKNOWN_PALETTE_RECIPE');
   r.palette=cp(SPEC.aestheticPalettes[recipe].colors);
  }
  next.revision++;
  return {...persist(next),room,colors:paletteFor(r),palette_recipe:recipe,
   shader_applied:false,contact_minted:false};
 }
 if((m=/^chest stow (I[1-9][0-9]*)$/i.exec(s))){
  const id=m[1].toUpperCase(),item=next.items.find(row=>row.id===id);
  if(!item)return error('UNKNOWN_DECOR_ITEM');
  if(item.owner!==rid)return error('CHEST_OWNER_ONLY');
  if(item.stored===true)return error('DECOR_ALREADY_STORED');
  if(!SPEC.storableKinds.includes(item.kind)){
   const remaining=SPEC.limits.maxChestPerRoom-
    next.items.filter(row=>row.room===item.room&&row.stored===true).length;
   const alternative=remaining>0?next.items.find(row=>row.room===item.room&&
    canStowNow(row)):null;
   const smaller=next.items.some(row=>row.room===item.room&&row.owner===rid&&
    row.stored!==true&&SPEC.storableKinds.includes(row.kind));
   const suggestedAction=alternative?'remote chest stow '+alternative.id:null;
   return error('DECOR_TOO_LARGE_FOR_CHEST',{
    room:item.room,kind:item.kind,storable_kinds:SPEC.storableKinds.slice(),
    ...(alternative?{suggested_item:{id:alternative.id,kind:alternative.kind,
      label:SPEC.items[alternative.kind].label},suggested_action:suggestedAction}:{}),
    hint:'The '+SPEC.items[item.kind].label+' is too large for this chest. '+
     (remaining<=0?'The chest is full; make some room first.':
      alternative?'The '+SPEC.items[alternative.kind].label+' ('+alternative.id+
       ') fits instead. Try '+suggestedAction+'.':
       smaller?'The smaller belongings cannot be moved safely right now. Try again when they are free.':
        'Try remote chest suggest '+item.room+' to see what fits, or place something smaller.')});
  }
  if(next.items.filter(row=>row.room===item.room&&row.stored===true).length>=SPEC.limits.maxChestPerRoom)
   return error('CHEST_FULL');
  const safe=previewRemove(id);if(!safe.ok)return safe;
  item.stored=true;next.revision++;
  return {...persist(next),stowed:id,chest:item.room,contact_minted:false};
 }
 if((m=/^chest (take|auto-take) (I[1-9][0-9]*)(?: (-?(?:\d+(?:\.\d+)?|\.\d+)) (-?(?:\d+(?:\.\d+)?|\.\d+)))?$/i.exec(s))){
  const id=m[2].toUpperCase(),item=next.items.find(row=>row.id===id);
  if(!item)return error('UNKNOWN_DECOR_ITEM');
  if(item.owner!==rid)return error('CHEST_OWNER_ONLY');
  if(item.stored!==true)return error('DECOR_NOT_STORED');
  let p;
  if(m[1]==='auto-take'){
   const choices=findSoloSpots(item.room,item.kind,id);
   if(!choices.ok)return choices;
   const loc=choices.suggestions[0];p=preview(item.kind,item.room,loc.x,loc.y);
  }else{
   if(m[3]===undefined||m[4]===undefined)return error('CHEST_TAKE_COORDINATES_REQUIRED');
   p=preview(item.kind,item.room,num(m[3]),num(m[4]));
  }
  if(!p.ok)return p;
  delete item.stored;item.x=p.x;item.y=p.y;next.revision++;
  return {...persist(next),retrieved:id,chest:item.room,position:[p.x,p.y],
   automatic:m[1]==='auto-take',contact_minted:false};
 }
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
  const [_,id,configurationName]=m;
  if(!own(SPEC.configurations,configurationName))return error('UNKNOWN_BEDROOM_CONFIGURATION');
  if(next.rooms[id].owner!==rid)return error('BEDROOM_NOT_OWNED');
  if(next.rooms[id].configuration===configurationName)return {ok:true,unchanged:true,configuration:configurationName};
  for(const row of next.items.filter(x=>x.room===id))
   if(!previewRemove(row.id).ok)return error('BEDROOM_ITEM_IN_USE',{item:row.id});
  next.rooms[id].configuration=configurationName;next.revision++;
  return {...persist(next),bedroom:id,configuration:configurationName,
   suggested:cp(SPEC.configurations[configurationName].suggested),native_entities_restyled:true};
 }
 if((m=/^bedroom furnish (quilt|library|canopy|studio) ([a-z-]+)$/.exec(s))){
  const room=m[1],configurationName=m[2];
  if(!own(SPEC.configurations,configurationName))return error('UNKNOWN_BEDROOM_CONFIGURATION');
  if(next.rooms[room].owner!==rid)return error('BEDROOM_NOT_OWNED');
  if(next.items.some(x=>x.room===room))return error('BEDROOM_NOT_EMPTY_FOR_CONFIGURATION');
  const kit=SPEC.configurations[configurationName].suggested.slice(0,2),planned=[];
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
   if(!found)return error('BEDROOM_CONFIGURATION_NO_SAFE_FOOTPRINT',{room,configurationName,kind});
   planned.push(found);
  }
  next.rooms[room].configuration=configurationName;
  const placed=[];
  for(const p of planned){
   const id='I'+next.next_id++;
   next.items.push({id,room,kind:p.kind,owner:rid,x:p.x,y:p.y});
   placed.push({id,kind:p.kind,position:[p.x,p.y]});
  }
  next.revision++;
  return {...persist(next),bedroom:room,configuration:configurationName,placed,contact_minted:false};
 }
 if((m=/^decor preview (quilt|library|canopy|studio) ([a-z-]+) (-?(?:\d+(?:\.\d+)?|\.\d+)) (-?(?:\d+(?:\.\d+)?|\.\d+))$/.exec(s))){
  const [_,room,kind]=m;
  if(next.rooms[room].owner!==rid)return error('BEDROOM_NOT_OWNED');
  if(next.items.filter(x=>x.room===room).length>=SPEC.limits.maxPerRoom||
     next.items.length>=SPEC.limits.maxTotal)return error('BEDROOM_ITEM_CAPACITY');
  const p=preview(kind,room,num(m[3]),num(m[4]));
  return {...p,schema:'REALITI_APARTMENT_DECOR_PREVIEW_V1',read_only:true,
   revision:solo.revision,position:p.ok?[p.x,p.y]:undefined};
 }
 if((m=/^decor (suggest|auto-place) (quilt|library|canopy|studio) ([a-z-]+)$/.exec(s))){
  const found=findSoloSpots(m[2],m[3]);
  if(!found.ok)return found;
  if(m[1]==='suggest')return found;
  const spot=found.suggestions[0];
  const placed=soloAction('decor place '+m[2]+' '+m[3]+' '+spot.x+' '+spot.y);
  return placed.ok?{...placed,automatic:true}:placed;
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
 if((m=/^decor (move|nudge) (I[1-9][0-9]*) (-?(?:\d+(?:\.\d+)?|\.\d+)) (-?(?:\d+(?:\.\d+)?|\.\d+))$/i.exec(s))){
  const id=m[2].toUpperCase(),item=next.items.find(row=>row.id===id);
  if(!item)return error('UNKNOWN_DECOR_ITEM');
  if(item.owner!==rid)return error('DECOR_NOT_OWNED');
  if(item.stored===true)return error('DECOR_IN_CHEST');
  const relative=m[1]==='nudge';
  const x=relative?item.x+num(m[3]):num(m[3]);
  const y=relative?item.y+num(m[4]):num(m[4]);
  if(item.x===+x.toFixed(2)&&item.y===+y.toFixed(2))
   return {ok:true,unchanged:true,item:id,position:[item.x,item.y],revision:solo.revision};
  const inUse=previewRemove(id);
  if(!inUse.ok)return inUse;
  const proposed=preview(item.kind,item.room,x,y,PREFIX+id);
  if(!proposed.ok)return proposed;
  item.x=proposed.x;item.y=proposed.y;next.revision++;
  return {...persist(next),moved:id,room:item.room,position:[item.x,item.y],
   ...(relative?{nudged:true}:{}),contact_minted:false};
 }
 if((m=/^bedroom clear (quilt|library|canopy|studio) confirm$/.exec(s))){
  const room=m[1];
  if(next.rooms[room].owner!==rid)return error('BEDROOM_NOT_OWNED');
  const items=next.items.filter(row=>row.room===room&&row.stored!==true);
  if(!items.length)return {ok:true,unchanged:true,bedroom:room,revision:solo.revision};
  for(const row of items){
   const checked=previewRemove(row.id);
   if(!checked.ok)return error('DECOR_ITEM_IN_USE',{item:row.id});
  }
  next.items=next.items.filter(row=>row.room!==room||row.stored===true);next.revision++;
  return {...persist(next),cleared:room,removed:items.map(row=>row.id),
   chest_preserved:true,contact_minted:false};
 }
 if((m=/^decor remove (I[1-9][0-9]*)$/i.exec(s))){
  const id=m[1].toUpperCase(),index=next.items.findIndex(x=>x.id===id);
  if(index<0)return error('UNKNOWN_DECOR_ITEM');
  if(next.items[index].owner!==rid)return error('DECOR_NOT_OWNED');
  if(next.items[index].stored===true)return error('DECOR_IN_CHEST');
  const p=previewRemove(id);if(!p.ok)return p;
  next.items.splice(index,1);next.revision++;
  return {...persist(next),removed:id,contact_minted:false};
 }
 return error('UNKNOWN_BEDROOM_COMMAND',{commands:commands()});
}
function commands(){return [
 'bedrooms','bedroom claim <quilt|library|canopy|studio>',
 'bedroom release <room>','bedroom configure <room> <cozy|nightglass|writers|botanical|music>',
 'bedroom colors <room>','bedroom swatch <room> <role> <sample-name>',
 'bedroom swatches set <room> <field> <anchor> <accent> <bridge>',
 'bedroom swatches',
 'bedroom palette <room> <recipe|reset>','bedroom palette catalog',
 'bedroom configurations','bedroom furnish <room> <configuration>',
 'decor catalog','decor list',
 'decor preview <room> <kind> <x> <y>',
 'decor suggest <room> <kind>','decor auto-place <room> <kind>',
 'decor place <room> <kind> <x> <y>',
 'decor inspect <I-number>','decor move <I-number> <x> <y>',
 'decor nudge <I-number> <dx> <dy>',
 'decor remove <I-number>','bedroom clear <room> confirm',
 'chest inspect <room>','chest suggest <room>','chest stow <I-number>',
 'chest take <I-number> <x> <y>','chest auto-take <I-number>'];}
function handle(raw){
 const s=String(raw||'').trim().toLowerCase().replace(/\s+/g,' ');
 if(s==='bedrooms'||s==='bedroom status'||s==='decor list')return view();
 if(s==='decor catalog'||s==='bedroom configurations')return catalog();
 if(s==='bedroom help'||s==='decor help')return {ok:true,commands:commands()};
 if(s==='bedroom palette catalog'||s==='bedroom swatches')return {ok:true,schema:'REALITI_APARTMENT_PALETTES_V1',
  roles:SPEC.colorRoles.slice(),swatches:cp(SPEC.swatches),
  recipes:cp(SPEC.aestheticPalettes),read_only:true};
 const colors=/^bedroom colors (quilt|library|canopy|studio)$/.exec(s);
 if(colors){
  const r=state().rooms[colors[1]];
  return {ok:true,schema:'REALITI_APARTMENT_BEDROOM_COLORS_V1',
   room:colors[1],owner:r.owner,colors:paletteFor(r),
   source:own(r,'palette')?'custom':'configuration',read_only:true,shader_applied:false};
 }
 const inspected=/^decor inspect (i[1-9][0-9]*)$/.exec(s);
 if(inspected){
  const row=state().items.find(item=>item.id===inspected[1].toUpperCase());
  if(!row)return error('UNKNOWN_DECOR_ITEM');
  if(row.stored===true&&row.owner!==rid)return error('CHEST_OWNER_ONLY');
  return {ok:true,schema:'REALITI_APARTMENT_DECOR_INSPECT_V1',
   item:cp(row),spec:cp(SPEC.items[row.kind]),read_only:true};
 }
 const chest=/^chest (inspect|suggest) (quilt|library|canopy|studio)$/.exec(s);
 if(chest){
  const room=chest[2],current=state();
  if(role==='guest'||current.rooms[room].owner!==rid)
   return error('CHEST_OWNER_ONLY');
  const stored=current.items.filter(row=>row.room===room&&row.stored===true)
   .map(({id,kind})=>({id,kind,label:SPEC.items[kind].label}));
  const remaining=SPEC.limits.maxChestPerRoom-stored.length;
  const small=current.items.filter(row=>row.room===room&&row.owner===rid&&
   row.stored!==true&&SPEC.storableKinds.includes(row.kind));
  const available=remaining>0?small.filter(canStowNow)
   .map(({id,kind})=>({id,kind,label:SPEC.items[kind].label})):[];
  const blocked=small.filter(row=>!canStowNow(row))
   .map(({id,kind})=>({id,kind,label:SPEC.items[kind].label,
    reason:M.entities()[PREFIX+id]?.chart===HOME?
     'DECOR_ITEM_IN_USE':'DECOR_NATIVE_ITEM_MISSING'}));
  return {ok:true,schema:chest[1]==='suggest'?
   'REALITI_APARTMENT_CHEST_SUGGEST_V1':'REALITI_APARTMENT_CHEST_INSPECT_V1',
   room,entity_id:CHEST+room,owner:rid,capacity:SPEC.limits.maxChestPerRoom,
   remaining,stored:cp(stored),available:cp(available),blocked:cp(blocked),
   hint:available.length?
    'You can put away a '+available[0].label+' ('+available[0].id+
    ') using remote chest stow '+available[0].id+'.':
    (remaining<=0?'The chest is full. Take out an item before storing anything else.':
    blocked.length?'The smaller belongings are in use or unavailable right now. Try again when they are free.':
    stored.length?'The chest holds a '+stored[0].label+' ('+stored[0].id+
    '). You can retrieve it with remote chest auto-take '+stored[0].id+'.':
    'Nothing small is ready to store here. Add a book stack, lantern or another small decor item first.'),
   read_only:true,contact_minted:false};
 }
 return soloAction(s);
}
window.REALITI_APARTMENT_BEDROOMS_V1=Object.freeze({
 spec:()=>cp(SPEC),view,catalog,preview,previewRemove,auditShared,applyShared,handle,
 law:'Ownership gates shared decoration. Host validates physical changes; source item placements never mint touch, consent, or private emotion.'});
})();