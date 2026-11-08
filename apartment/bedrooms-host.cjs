'use strict';
// Trusted Node household bedroom ownership and physical drop-in item commits.
// No browser resident can grant itself a host-owned bedroom. This stores only
// public room claims, non-private configuration tags and validated Matrix props.
const SPEC=require('./bedroom-spec.json');
const SCHEMA='REALITI_APARTMENT_BEDROOMS_STORE_V1';
const ROOMS=Object.keys(SPEC.rooms),KINDS=Object.keys(SPEC.items);
const STYLES=Object.keys(SPEC.configurations),MAX=SPEC.limits.maxTotal;
const cp=x=>JSON.parse(JSON.stringify(x)),fail=(error,detail={})=>({ok:false,error,...detail});
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const validId=x=>typeof x==='string'&&/^[a-z][a-z0-9-]{1,30}$/.test(x);
const swatch=x=>typeof x==='string'&&own(SPEC.swatches,x);
const validPalette=x=>x&&typeof x==='object'&&!Array.isArray(x)&&
 Object.keys(x).length===SPEC.colorRoles.length&&
 SPEC.colorRoles.every(role=>own(x,role)&&swatch(x[role]));
const paletteFor=r=>cp(r.palette||SPEC.colorDefaults[r.configuration]);
const empty=()=>({schema:SCHEMA,revision:0,next_id:1,rooms:Object.fromEntries(
 ROOMS.map(id=>[id,{owner:null,configuration:'cozy'}])),items:[]});
function validate(checkpoint,members=[]){
 if(checkpoint==null)return null;
 const x=checkpoint;
 if(x.schema!==SCHEMA||!Number.isSafeInteger(x.revision)||x.revision<0||
    !Number.isSafeInteger(x.next_id)||x.next_id<1||
    !x.rooms||Array.isArray(x.rooms)||typeof x.rooms!=='object'||
    Object.keys(x.rooms).length!==ROOMS.length||
    !Array.isArray(x.items)||x.items.length>MAX)
  throw Error('BEDROOMS_INVALID_HOST_CHECKPOINT');
 const claims=new Set();
 for(const roomId of ROOMS){
  const r=x.rooms[roomId];
  if(!r||!own(r,'owner')||!STYLES.includes(r.configuration)||
      (own(r,'palette')&&!validPalette(r.palette))||
      (r.owner!==null&&(!validId(r.owner)||!members.includes(r.owner)))||
      (r.owner!==null&&claims.has(r.owner)))
   throw Error('BEDROOMS_INVALID_ROOM_OWNER');
  if(r.owner!==null)claims.add(r.owner);
 }
 const seen=new Set();let highest=0;
 for(const v of x.items){
  if(!v||!/^I[1-9]\d*$/.test(v.id||'')||seen.has(v.id)||
    !ROOMS.includes(v.room)||!KINDS.includes(v.kind)||
    v.owner!==x.rooms[v.room].owner||!validId(v.owner)||
    (own(v,'stored')&&(v.stored!==true||!SPEC.storableKinds.includes(v.kind)))||
    !Number.isFinite(v.x)||!Number.isFinite(v.y))
   throw Error('BEDROOMS_INVALID_ITEM');
  const [minX,maxX,minY,maxY]=SPEC.rooms[v.room].bounds;
  const [hx,hy]=SPEC.items[v.kind].half;
  if(v.x-hx-.1<minX||v.x+hx+.1>maxX||
     v.y-hy-.1<minY||v.y+hy+.1>maxY)
   throw Error('BEDROOMS_INVALID_ITEM_LOCATION');
  seen.add(v.id);highest=Math.max(highest,Number(v.id.slice(1)));
 }
 if(highest>=x.next_id)throw Error('BEDROOMS_INVALID_NEXT_ID');
 for(const id of ROOMS){
  if(x.items.filter(q=>q.room===id).length>SPEC.limits.maxPerRoom)
   throw Error('BEDROOMS_OVER_CAPACITY');
  if(x.items.filter(q=>q.room===id&&q.stored===true).length>SPEC.limits.maxChestPerRoom)
   throw Error('BEDROOMS_CHEST_OVER_CAPACITY');
 }
 // Native Matrix ignores noncolliding items as obstacles, but two solid
 // persisted props must never occupy the same floor footprint. An externally
 // rehashed checkpoint cannot rely on an empty native chart to evade this.
 const solid=x.items.filter(row=>row.stored!==true&&SPEC.items[row.kind].collision);
 for(let i=0;i<solid.length;i++)for(let j=0;j<i;j++){
  const a=solid[i],b=solid[j];
  const ah=SPEC.items[a.kind].half,bh=SPEC.items[b.kind].half;
  if(Math.abs(a.x-b.x)<ah[0]+bh[0]+.04&&
     Math.abs(a.y-b.y)<ah[1]+bh[1]+.04)
   throw Error('BEDROOMS_OVERLAPPING_ITEMS');
 }
 return x;
}
function createBedroomManager({getData,persist,participants,atHome}={}){
 if([getData,persist,participants,atHome].some(x=>typeof x!=='function'))
  throw TypeError('BEDROOM_HOST_DEPENDENCIES_REQUIRED');
 const bridge=entry=>entry.session.window.REALITI_APARTMENT_BEDROOMS_V1;
 function ensure(){
  const data=getData();
  if(!data.bedrooms){
   const prior=data.bedrooms;
   data.bedrooms=empty();
   try{persist()}catch(e){data.bedrooms=prior;throw e}
  }
  validate(data.bedrooms,data.members);
  return data.bedrooms;
 }
 function apply(entry){
  const s=ensure(),b=bridge(entry);
  if(!b?.applyShared||!b?.preview||!b?.previewRemove||!b?.auditShared)
   throw Error('BEDROOM_NATIVE_BRIDGE_MISSING');
  const audited=b.auditShared(cp(s));
  if(!audited.ok)throw Error('BEDROOM_UNSAFE_HOST_GEOMETRY:'+audited.item+':'+audited.reason);
  return b.applyShared(cp(s));
 }
 function view(){
  const s=ensure();
  return {ok:true,schema:'REALITI_APARTMENT_BEDROOMS_V1',
   connected:true,revision:s.revision,one_native_chart:true,
   chart:SPEC.chart,
   bedrooms:Object.fromEntries(ROOMS.map(id=>[id,{
    label:SPEC.rooms[id].name,bounds:SPEC.rooms[id].bounds.slice(),
    note:SPEC.rooms[id].note,
    owner:s.rooms[id].owner,configuration:s.rooms[id].configuration,
    palette:paletteFor(s.rooms[id]),palette_source:own(s.rooms[id],'palette')?'custom':'configuration',
    item_count:s.items.filter(row=>row.room===id).length
   }])),
   items:cp(s.items.filter(row=>row.stored!==true)),
   chests:Object.fromEntries(ROOMS.map(id=>[id,{
    entity_id:'apartment.bedroom.chest.'+id,
    label:SPEC.chests[id].label,position:SPEC.chests[id].position.slice(),
    owner:s.rooms[id].owner,
    stored_count:s.items.filter(row=>row.room===id&&row.stored===true).length,
    capacity:SPEC.limits.maxChestPerRoom
   }])),
   configurations:cp(SPEC.configurations),
   limits:cp(SPEC.limits),
   ownership:'Only the claimed resident may change this bedroom. Exactly one bedroom per household resident.',
   privacy:'Public ownership and native furniture positions; no locked walls or spatial privacy. No private memory or bodily state is shared.',
   law:'All mutations require an awake resident remote and are validated by the trusted host against each live Matrix copy.'};
 }
 const catalog=()=>({ok:true,schema:'REALITI_APARTMENT_DROP_IN_CATALOG_V1',
   items:cp(SPEC.items),bedrooms:cp(SPEC.rooms),
   chests:cp(SPEC.chests),storable_kinds:SPEC.storableKinds.slice(),
   configurations:cp(SPEC.configurations),
   color_roles:SPEC.colorRoles.slice(),swatches:cp(SPEC.swatches),
    palette_recipes:cp(SPEC.aestheticPalettes),
   max_per_room:SPEC.limits.maxPerRoom,
   note:'Items are real finite native Matrix geometry. Configurations set configurationName; choose positions to place physical items.'});
 const help=()=>({ok:true,commands:[
  'remote bedrooms','remote bedroom claim <room> [if-rev <n>]',
  'remote bedroom release <room> [if-rev <n>]',
  'remote bedroom configure <room> <configuration> [if-rev <n>]',
  'remote bedroom colors <room>',
  'remote bedroom swatch <room> <field|anchor|accent|bridge> <sample-name> [if-rev <n>]',
  'remote bedroom swatches set <room> <field> <anchor> <accent> <bridge> [if-rev <n>]',
  'remote bedroom palette <room> <recipe|reset> [if-rev <n>]',
  'remote bedroom configurations','remote bedroom furnish <room> <configuration> [if-rev <n>]',
  'remote decor catalog',
  'remote decor preview <room> <kind> <x> <y> [if-rev <n>]',
  'remote decor suggest <room> <kind> [if-rev <n>]',
  'remote decor auto-place <room> <kind> [if-rev <n>]',
  'remote decor place <room> <kind> <x> <y> [if-rev <n>]',
  'remote decor inspect <I-number>',
  'remote decor move <I-number> <x> <y> [if-rev <n>]',
  'remote decor nudge <I-number> <dx> <dy> [if-rev <n>]',
  'remote decor remove <I-number> [if-rev <n>]',
  'remote chest inspect <room>',
  'remote chest suggest <room>',
  'remote chest stow <I-number> [if-rev <n>]',
  'remote chest take <I-number> <x> <y> [if-rev <n>]',
  'remote chest auto-take <I-number> [if-rev <n>]',
  'remote bedroom clear <room> confirm [if-rev <n>]'
 ],note:'One owner per bedroom, one bedroom per household resident. One Matrix HOME chart; no room locks.'});
 function changed(before,next){
  const root=getData();const old=root.bedrooms;
  root.bedrooms=next;
  try{validate(next,root.members);persist()}catch(e){
   root.bedrooms=old;return fail('BEDROOM_CHECKPOINT_WRITE_REFUSED');
  }
  return {ok:true,schema:'REALITI_APARTMENT_BEDROOM_COMMIT_V1',
   revision:next.revision,source:'TRUSTED_HOST_VERIFIED_MATRIX',
   contact_minted:false,owner_assigned_by_world:false};
 }
 // Ownership protects the footprint of *existing shared furniture* too.
 // Moving a base sofa/desk out of another resident's claimed zone, or moving
 // it into that zone, must not bypass the bedroom item permission checks.
 function protectSharedFurniture(actor,name,x,y){
  const state=ensure(),f=actor.session.window.REALITI_APARTMENT_FURNITURE_V1;
  const id=f?.view()?.fixtures?.[name]?.id;
  const entity=id&&actor.session.window.REALITI_MATRIX_V1.entities()[id];
  if(!entity)return fail('SHARED_SCENE_UNKNOWN_FIXTURE');
  const half=entity.shape?.kind==='BOX'?entity.shape.halfExtents:
   entity.shape?.kind==='SPHERE'?[entity.shape.radius,entity.shape.radius]:null;
  if(!half)return fail('SHARED_SCENE_UNKNOWN_FOOTPRINT');
  const intersects=(cx,cy,b)=>cx+half[0]>b[0]&&cx-half[0]<b[1]&&
    cy+half[1]>b[2]&&cy-half[1]<b[3];
  for(const room of ROOMS){
   const owner=state.rooms[room].owner;
   if(owner===null||owner===actor.id)continue;
   const box=SPEC.rooms[room].bounds;
   if(intersects(entity.pose.position[0],entity.pose.position[1],box)||
      intersects(x,y,box))
    return fail('SHARED_FURNITURE_BEDROOM_OWNER_ONLY',{bedroom:room,owner});
  }
  return {ok:true};
 }
 // A preview and a commit must use precisely the same host authorization,
 // capacity limits, and live Matrix collision checks. Preview never persists.
 function assessPlacement(actor,store,room,kind,x,y,synchronize=true){
  if(!ROOMS.includes(room)||!KINDS.includes(kind))return fail('UNKNOWN_BEDROOM_OR_ITEM');
  if(store.rooms[room].owner!==actor.id)return fail('BEDROOM_NOT_OWNED');
  if(store.items.length>=MAX||
     store.items.filter(row=>row.room===room).length>=SPEC.limits.maxPerRoom)
   return fail('BEDROOM_ITEM_CAPACITY');
  const entries=participants();
  if(synchronize)for(const entry of entries)apply(entry);
  const refusals=[];
  for(const entry of entries){
   const result=bridge(entry).preview(kind,room,x,y);
   if(!result?.ok)refusals.push({participant:entry.id,
    error:result?.error||'UNKNOWN_MATRIX_REFUSAL',
    obstacle:result?.obstacle||null});
  }
  if(refusals.length)return fail('BEDROOM_MATRIX_REFUSED',{refusals});
  return {ok:true,room,kind,position:[+x.toFixed(2),+y.toFixed(2)],
   verified_participants:entries.length,contact_minted:false};
 }
 // Search only inside the owner's room, on a bounded deterministic grid.
 // Suggestions are alternatives, not simultaneously reserved positions.
 // Every candidate is tested in all connected native Matrix copies.
 function findSafeSpots(actor,store,room,kind){
  if(!ROOMS.includes(room)||!KINDS.includes(kind))return fail('UNKNOWN_BEDROOM_OR_ITEM');
  if(store.rooms[room].owner!==actor.id)return fail('BEDROOM_NOT_OWNED');
  if(store.items.length>=MAX||
     store.items.filter(row=>row.room===room).length>=SPEC.limits.maxPerRoom)
   return fail('BEDROOM_ITEM_CAPACITY');
  const entries=participants();
  for(const entry of entries)apply(entry);
  const bounds=SPEC.rooms[room].bounds,[hx,hy]=SPEC.items[kind].half;
  const suggested=[];
  for(let y=bounds[3]-hy-.16;y>=bounds[2]+hy+.16&&suggested.length<3;y-=.4){
   for(let x=bounds[1]-hx-.16;x>=bounds[0]+hx+.16&&suggested.length<3;x-=.4){
    const px=+x.toFixed(2),py=+y.toFixed(2);
    if(suggested.some(p=>Math.hypot(p.x-px,p.y-py)<.75))continue;
    const result=assessPlacement(actor,store,room,kind,px,py,false);
    if(result.ok)suggested.push({x:px,y:py});
   }
  }
  if(!suggested.length)return fail('BEDROOM_NO_SAFE_FOOTPRINT',{room,kind});
  return {ok:true,schema:'REALITI_APARTMENT_DECOR_SUGGEST_V1',
   room,kind,suggestions:suggested,revision:store.revision,
   verified_participants:entries.length,read_only:true,contact_minted:false};
 }
 function handle(actor,raw){
  const cmd=String(raw||'').trim().toLowerCase().replace(/\s+/g,' ');
  if(cmd==='bedrooms'||cmd==='bedroom status'||cmd==='decor list')return view();
  if(cmd==='decor catalog'||cmd==='bedroom configurations')return catalog();
  if(cmd==='bedroom help'||cmd==='decor help')return help();
  if(cmd==='bedroom palette catalog'||cmd==='bedroom swatches')return {ok:true,schema:'REALITI_APARTMENT_PALETTES_V1',
   roles:SPEC.colorRoles.slice(),swatches:cp(SPEC.swatches),
   recipes:cp(SPEC.aestheticPalettes),read_only:true};
  const colors=/^bedroom colors ([a-z-]+)$/.exec(cmd);
  if(colors){
   const state=ensure(),r=state.rooms[colors[1]];
   return r?{ok:true,schema:'REALITI_APARTMENT_BEDROOM_COLORS_V1',
    room:colors[1],owner:r.owner,colors:paletteFor(r),
    source:own(r,'palette')?'custom':'configuration',read_only:true,shader_applied:false}
    :fail('UNKNOWN_BEDROOM');
  }
  const inspect=/^decor inspect (i[1-9][0-9]*)$/.exec(cmd);
  if(inspect){
   const item=ensure().items.find(x=>x.id===inspect[1].toUpperCase());
   if(!item)return fail('UNKNOWN_DECOR_ITEM');
   if(item.stored===true&&item.owner!==actor.id)return fail('CHEST_OWNER_ONLY');
   return {ok:true,schema:'REALITI_APARTMENT_DECOR_INSPECT_V1',
    item:cp(item),spec:cp(SPEC.items[item.kind]),
    source:'HOST_PUBLIC_ITEM_RECORD',read_only:true};
  }
  const ci=/^chest (inspect|suggest) ([a-z-]+)$/.exec(cmd);
  if(ci){
   const state=ensure(),room=ci[2];
   if(!ROOMS.includes(room))return fail('UNKNOWN_BEDROOM');
   if(actor.role!=='resident'||state.rooms[room].owner!==actor.id)
    return fail('CHEST_OWNER_ONLY');
   const stored=state.items.filter(row=>row.room===room&&row.stored===true)
    .map(({id,kind})=>({id,kind,label:SPEC.items[kind].label}));
   const available=state.items.filter(row=>row.room===room&&row.stored!==true&&
    SPEC.storableKinds.includes(row.kind))
    .map(({id,kind})=>({id,kind,label:SPEC.items[kind].label}));
   return {ok:true,schema:ci[1]==='suggest'?
    'REALITI_APARTMENT_CHEST_SUGGEST_V1':'REALITI_APARTMENT_CHEST_INSPECT_V1',
    room,owner:actor.id,entity_id:'apartment.bedroom.chest.'+room,
    capacity:SPEC.limits.maxChestPerRoom,remaining:SPEC.limits.maxChestPerRoom-stored.length,
    stored:cp(stored),available:cp(available),
    hint:available.length&&stored.length<SPEC.limits.maxChestPerRoom?
     'You can put away a '+available[0].label+' ('+available[0].id+
     ') using remote chest stow '+available[0].id+'.':
     (stored.length?'The chest holds a '+stored[0].label+' ('+stored[0].id+
    '). You can retrieve it with remote chest auto-take '+stored[0].id+'.':
    'Nothing small is ready to store here. Add a book stack, lantern or another small decor item first.'),
    read_only:true,contact_minted:false};
  }
  if(actor.role!=='resident')return fail('GUEST_BEDROOM_READ_ONLY');
  if(!participants().includes(actor))return fail('BEDROOM_RESIDENT_NOT_CONNECTED');
  if(!atHome(actor))return fail('BEDROOM_HOME_ONLY');
  const current=ensure(),next=cp(current);
  let m=null,operation=null;
  // Optional compare-and-set revision on every state-changing command.
  let rev=null;
  const without=cmd.replace(/ if-rev (\d+)$/,(_,n)=>{rev=Number(n);return ''});
  if(rev!==null&&(!Number.isSafeInteger(rev)||rev!==current.revision))
   return fail('BEDROOM_REVISION_CONFLICT',{current_revision:current.revision});
  if((m=/^bedroom swatches set ([a-z-]+) ([a-z-]+) ([a-z-]+) ([a-z-]+) ([a-z-]+)$/.exec(without))){
   const room=m[1],r=next.rooms[room];
   if(!r)return fail('UNKNOWN_BEDROOM');
   if(r.owner!==actor.id)return fail('BEDROOM_NOT_OWNED');
   const colors=Object.fromEntries(SPEC.colorRoles.map((role,i)=>[role,m[i+2]]));
   if(!validPalette(colors))return fail('UNKNOWN_SWATCH');
   if(JSON.stringify(paletteFor(r))===JSON.stringify(colors))return {ok:true,
    unchanged:true,bedroom:room,colors,revision:current.revision};
   r.palette=colors;operation={bedroom:room,colors:cp(colors),palette_recipe:'custom',
    shader_applied:false,contact_minted:false};
  }else if((m=/^bedroom swatch ([a-z-]+) (field|anchor|accent|bridge) ([a-z-]+)$/.exec(without))){
   const [_,room,role,color]=m,r=next.rooms[room];
   if(!r)return fail('UNKNOWN_BEDROOM');
   if(r.owner!==actor.id)return fail('BEDROOM_NOT_OWNED');
   if(!swatch(color))return fail('UNKNOWN_SWATCH');
   const palette=paletteFor(r);
   if(palette[role]===color)return {ok:true,unchanged:true,bedroom:room,
    colors:palette,revision:current.revision};
   palette[role]=color;r.palette=palette;
   operation={bedroom:room,colors:cp(palette),changed_role:role,
    shader_applied:false,contact_minted:false};
  }else if((m=/^bedroom palette ([a-z-]+) ([a-z0-9-]+)$/.exec(without))){
   const [_,room,recipe]=m,r=next.rooms[room];
   if(!r)return fail('UNKNOWN_BEDROOM');
   if(r.owner!==actor.id)return fail('BEDROOM_NOT_OWNED');
   if(recipe==='reset'){if(!own(r,'palette'))return {ok:true,unchanged:true,
    bedroom:room,colors:paletteFor(r),revision:current.revision};
    delete r.palette;
   }else{
    if(!own(SPEC.aestheticPalettes,recipe))return fail('UNKNOWN_PALETTE_RECIPE');
    r.palette=cp(SPEC.aestheticPalettes[recipe].colors);
   }
   operation={bedroom:room,colors:paletteFor(r),palette_recipe:recipe,
    shader_applied:false,contact_minted:false};
  }else if((m=/^chest stow (i[1-9][0-9]*)$/.exec(without))){
   const id=m[1].toUpperCase(),item=next.items.find(row=>row.id===id);
   if(!item)return fail('UNKNOWN_DECOR_ITEM');
   if(item.owner!==actor.id)return fail('CHEST_OWNER_ONLY');
   if(item.stored===true)return fail('DECOR_ALREADY_STORED');
   if(!SPEC.storableKinds.includes(item.kind)){
    const alternative=next.items.find(row=>row.room===item.room&&
     row.stored!==true&&SPEC.storableKinds.includes(row.kind));
    return fail('DECOR_TOO_LARGE_FOR_CHEST',{
     room:item.room,kind:item.kind,
     storable_kinds:SPEC.storableKinds.slice(),
     hint:alternative?'The '+SPEC.items[item.kind].label+
      ' cannot fit. Try '+alternative.id+' ('+SPEC.items[alternative.kind].label+
      '), or use remote chest suggest '+item.room+'.':
      'The '+SPEC.items[item.kind].label+
      ' cannot fit. Use remote chest suggest '+item.room+
      ' or place something small first.'});
   }
   if(next.items.filter(row=>row.room===item.room&&row.stored===true).length>=SPEC.limits.maxChestPerRoom)
    return fail('CHEST_FULL');
   for(const entry of participants()){
    const result=bridge(entry).previewRemove(id);
    if(!result?.ok)return fail('DECOR_ITEM_IN_USE',{participant:entry.id,item:id});
   }
   item.stored=true;
   operation={stowed:id,chest:item.room,contact_minted:false};
  }else if((m=/^chest (take|auto-take) (i[1-9][0-9]*)(?: (-?(?:\d+(?:\.\d+)?|\.\d+)) (-?(?:\d+(?:\.\d+)?|\.\d+)))?$/.exec(without))){
   const id=m[2].toUpperCase(),item=next.items.find(row=>row.id===id);
   if(!item)return fail('UNKNOWN_DECOR_ITEM');
   if(item.owner!==actor.id)return fail('CHEST_OWNER_ONLY');
   if(item.stored!==true)return fail('DECOR_NOT_STORED');
   const candidates={...next,items:next.items.filter(row=>row.id!==id)};
   let position=null,verified=0;
   if(m[1]==='auto-take'){
    const found=findSafeSpots(actor,candidates,item.room,item.kind);
    if(!found.ok)return found;
    position=[found.suggestions[0].x,found.suggestions[0].y];
    verified=found.verified_participants;
   }else{
    if(m[3]===undefined||m[4]===undefined)return fail('CHEST_TAKE_COORDINATES_REQUIRED');
    const found=assessPlacement(actor,candidates,item.room,item.kind,Number(m[3]),Number(m[4]));
    if(!found.ok)return found;
    position=found.position;verified=found.verified_participants;
   }
   delete item.stored;
   [item.x,item.y]=position;
   operation={retrieved:id,chest:item.room,position,automatic:m[1]==='auto-take',
    verified_participants:verified,contact_minted:false};
  }else if((m=/^bedroom claim ([a-z-]+)$/.exec(without))){
   const room=m[1];
   if(!ROOMS.includes(room))return fail('UNKNOWN_BEDROOM');
   if(next.rooms[room].owner===actor.id)
    return {ok:true,unchanged:true,bedroom:room,revision:current.revision};
   if(next.rooms[room].owner)return fail('BEDROOM_ALREADY_OWNED',{by:next.rooms[room].owner});
   if(ROOMS.some(id=>next.rooms[id].owner===actor.id))
    return fail('BEDROOM_ONE_CLAIM_PER_RESIDENT');
   next.rooms[room].owner=actor.id;operation={claimed:room,owner:actor.id};
  }else if((m=/^bedroom release ([a-z-]+)$/.exec(without))){
   const room=m[1];
   if(!ROOMS.includes(room))return fail('UNKNOWN_BEDROOM');
   if(next.rooms[room].owner!==actor.id)return fail('BEDROOM_NOT_OWNED');
   if(next.items.some(item=>item.room===room))return fail('BEDROOM_NOT_EMPTY');
   next.rooms[room]={owner:null,configuration:'cozy'};
   operation={released:room};
  }else if((m=/^bedroom configure ([a-z-]+) ([a-z-]+)$/.exec(without))){
   const [_,room,configurationName]=m;
   if(!ROOMS.includes(room))return fail('UNKNOWN_BEDROOM');
   if(!STYLES.includes(configurationName))return fail('UNKNOWN_BEDROOM_CONFIGURATION');
   if(next.rooms[room].owner!==actor.id)return fail('BEDROOM_NOT_OWNED');
   if(next.rooms[room].configuration===configurationName)
    return {ok:true,unchanged:true,bedroom:room,configuration:configurationName,revision:current.revision};
   // A configurationName edit changes native entity tags/labels. Never remove/recreate
   // a sleeping pad or seat that any resident is actually using.
   for(const row of next.items.filter(x=>x.room===room))
    for(const entry of participants())if(!bridge(entry).previewRemove(row.id)?.ok)
     return fail('BEDROOM_ITEM_IN_USE',{item:row.id,participant:entry.id});
   next.rooms[room].configuration=configurationName;
   operation={bedroom:room,configuration:configurationName,suggested:cp(SPEC.configurations[configurationName].suggested)};
  }else if((m=/^bedroom furnish ([a-z-]+) ([a-z-]+)$/.exec(without))){
   const [_,room,configurationName]=m;
   if(!ROOMS.includes(room))return fail('UNKNOWN_BEDROOM');
   if(!STYLES.includes(configurationName))return fail('UNKNOWN_BEDROOM_CONFIGURATION');
   if(next.rooms[room].owner!==actor.id)return fail('BEDROOM_NOT_OWNED');
   if(next.items.some(item=>item.room===room))return fail('BEDROOM_NOT_EMPTY_FOR_CONFIGURATION');
   const kit=SPEC.configurations[configurationName].suggested.slice(0,2);
   const planned=[],members=participants(),bounds=SPEC.rooms[room].bounds;
   for(const entry of members)apply(entry);
   for(const kind of kit){
    const [hx,hy]=SPEC.items[kind].half;
    let found=null;
    for(let y=bounds[3]-hy-.16;y>=bounds[2]+hy+.16&&!found;y-=.4){
     for(let x=bounds[1]-hx-.16;x>=bounds[0]+hx+.16&&!found;x-=.4){
      const px=+x.toFixed(2),py=+y.toFixed(2);
      const paired=planned.some(a=>{
       const [ax,ay]=SPEC.items[a.kind].half;
       return Math.abs(a.x-px)<ax+hx+.09&&Math.abs(a.y-py)<ay+hy+.09;
      });
      if(paired)continue;
      if(members.every(entry=>bridge(entry).preview(kind,room,px,py).ok))
       found={kind,x:px,y:py};
     }
    }
    if(!found)return fail('BEDROOM_CONFIGURATION_NO_SAFE_FOOTPRINT',{room,configurationName,kind});
    planned.push(found);
   }
   if(next.items.length+planned.length>MAX)return fail('BEDROOM_ITEM_CAPACITY');
   next.rooms[room].configuration=configurationName;
   const placed=[];
   for(const p of planned){
    const id='I'+next.next_id++;
    next.items.push({id,room,kind:p.kind,owner:actor.id,x:p.x,y:p.y});
    placed.push({id,kind:p.kind,position:[p.x,p.y]});
   }
   operation={bedroom:room,configuration:configurationName,placed,
    verified_participants:members.length,world_contact_minted:false};
  }else if((m=/^decor preview ([a-z-]+) ([a-z-]+) (-?(?:\d+(?:\.\d+)?|\.\d+)) (-?(?:\d+(?:\.\d+)?|\.\d+))$/.exec(without))){
   const result=assessPlacement(actor,next,m[1],m[2],Number(m[3]),Number(m[4]));
   return {...result,schema:'REALITI_APARTMENT_DECOR_PREVIEW_V1',
    read_only:true,revision:current.revision};
  }else if((m=/^decor (suggest|auto-place) ([a-z-]+) ([a-z-]+)$/.exec(without))){
   const [_,action,room,kind]=m;
   const found=findSafeSpots(actor,next,room,kind);
   if(!found.ok)return found;
   if(action==='suggest')return found;
   // The scan and commit occur in the host's serialized command turn.
   const {x,y}=found.suggestions[0],id='I'+next.next_id++;
   next.items.push({id,room,kind,owner:actor.id,x,y});
   operation={placed:id,room,kind,position:[x,y],automatic:true,
    verified_participants:found.verified_participants,contact_minted:false};
  }else if((m=/^decor place ([a-z-]+) ([a-z-]+) (-?(?:\d+(?:\.\d+)?|\.\d+)) (-?(?:\d+(?:\.\d+)?|\.\d+))$/.exec(without))){
   const [_,room,kind]=m;
   const check=assessPlacement(actor,next,room,kind,Number(m[3]),Number(m[4]));
   if(!check.ok)return check;
   const id='I'+next.next_id++;
   next.items.push({id,room,kind,owner:actor.id,
    x:check.position[0],y:check.position[1]});
   operation={placed:id,room,kind,position:check.position,
    verified_participants:check.verified_participants};
  }else if((m=/^decor (move|nudge) (i[1-9][0-9]*) (-?(?:\d+(?:\.\d+)?|\.\d+)) (-?(?:\d+(?:\.\d+)?|\.\d+))$/.exec(without))){
   const id=m[2].toUpperCase(),item=next.items.find(row=>row.id===id);
   if(!item)return fail('UNKNOWN_DECOR_ITEM');
   if(item.owner!==actor.id)return fail('DECOR_NOT_OWNED');
   if(item.stored===true)return fail('DECOR_IN_CHEST');
   const relative=m[1]==='nudge';
   const px=relative?item.x+Number(m[3]):Number(m[3]);
   const py=relative?item.y+Number(m[4]):Number(m[4]);
   if(item.x===+px.toFixed(2)&&item.y===+py.toFixed(2))
    return {ok:true,unchanged:true,item:id,position:[item.x,item.y],revision:current.revision};
   const entries=participants();
   for(const entry of entries)apply(entry);
   for(const entry of entries){
    const active=bridge(entry).previewRemove(id);
    if(!active?.ok)return fail('DECOR_ITEM_IN_USE',{participant:entry.id});
   }
   const refusals=[];
   for(const entry of entries){
    const result=bridge(entry).preview(item.kind,item.room,px,py,'apartment.bedroom.item.'+id);
    if(!result?.ok)refusals.push({participant:entry.id,
      error:result?.error||'UNKNOWN_MATRIX_REFUSAL',obstacle:result?.obstacle||null});
   }
   if(refusals.length)return fail('BEDROOM_MATRIX_REFUSED',{refusals});
   item.x=+px.toFixed(2);item.y=+py.toFixed(2);
   operation={moved:id,room:item.room,position:[item.x,item.y],
    ...(relative?{nudged:true}:{}),
    verified_participants:entries.length,contact_minted:false};
  }else if((m=/^bedroom clear ([a-z-]+) confirm$/.exec(without))){
   const room=m[1];
   if(!ROOMS.includes(room))return fail('UNKNOWN_BEDROOM');
   if(next.rooms[room].owner!==actor.id)return fail('BEDROOM_NOT_OWNED');
   const items=next.items.filter(row=>row.room===room&&row.stored!==true);
   if(!items.length)return {ok:true,unchanged:true,bedroom:room,revision:current.revision};
   for(const entry of participants())for(const row of items){
    const result=bridge(entry).previewRemove(row.id);
    if(!result?.ok)return fail('DECOR_ITEM_IN_USE',{item:row.id,participant:entry.id});
   }
   next.items=next.items.filter(row=>row.room!==room||row.stored===true);
   operation={cleared:room,removed:items.map(row=>row.id),chest_preserved:true,contact_minted:false};
  }else if((m=/^decor remove (i[1-9][0-9]*)$/.exec(without))){
   const id=m[1].toUpperCase(),index=next.items.findIndex(row=>row.id===id);
   if(index<0)return fail('UNKNOWN_DECOR_ITEM');
   if(next.items[index].owner!==actor.id)return fail('DECOR_NOT_OWNED');
   if(next.items[index].stored===true)return fail('DECOR_IN_CHEST');
   for(const entry of participants()){
    const result=bridge(entry).previewRemove(id);
    if(!result?.ok)return fail('DECOR_ITEM_IN_USE',{participant:entry.id});
   }
   next.items.splice(index,1);operation={removed:id};
  }else return fail('UNKNOWN_BEDROOM_COMMAND',{commands:help().commands});
  next.revision++;
  const saved=changed(current,next);
  return saved.ok?{...saved,...operation}:saved;
 }
 return Object.freeze({ensure,validate,apply,view,catalog,handle,protectSharedFurniture});
}
module.exports={createBedroomManager,validateBedroomCheckpoint:validate};
