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
 for(const id of ROOMS)if(x.items.filter(q=>q.room===id).length>SPEC.limits.maxPerRoom)
  throw Error('BEDROOMS_OVER_CAPACITY');
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
  if(!b?.applyShared||!b?.preview||!b?.previewRemove)
   throw Error('BEDROOM_NATIVE_BRIDGE_MISSING');
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
    item_count:s.items.filter(row=>row.room===id).length
   }])),
   items:cp(s.items),configurations:cp(SPEC.configurations),
   limits:cp(SPEC.limits),
   ownership:'Only the claimed resident may change this bedroom. Exactly one bedroom per household resident.',
   privacy:'Public ownership and native furniture positions; no locked walls or spatial privacy. No private memory or bodily state is shared.',
   law:'All mutations require an awake resident remote and are validated by the trusted host against each live Matrix copy.'};
 }
 const catalog=()=>({ok:true,schema:'REALITI_APARTMENT_DROP_IN_CATALOG_V1',
   items:cp(SPEC.items),bedrooms:cp(SPEC.rooms),
   configurations:cp(SPEC.configurations),max_per_room:SPEC.limits.maxPerRoom,
   note:'Items are real finite native Matrix geometry. Configurations set configurationName; choose positions to place physical items.'});
 const help=()=>({ok:true,commands:[
  'remote bedrooms','remote bedroom claim <room> [if-rev <n>]',
  'remote bedroom release <room> [if-rev <n>]',
  'remote bedroom configure <room> <configuration> [if-rev <n>]',
  'remote bedroom configurations','remote bedroom furnish <room> <configuration> [if-rev <n>]',
  'remote decor catalog',
  'remote decor place <room> <kind> <x> <y> [if-rev <n>]',
  'remote decor remove <I-number> [if-rev <n>]'
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
 function handle(actor,raw){
  const cmd=String(raw||'').trim().toLowerCase().replace(/\s+/g,' ');
  if(cmd==='bedrooms'||cmd==='bedroom status'||cmd==='decor list')return view();
  if(cmd==='decor catalog'||cmd==='bedroom configurations')return catalog();
  if(cmd==='bedroom help'||cmd==='decor help')return help();
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
  if((m=/^bedroom claim ([a-z-]+)$/.exec(without))){
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
  }else if((m=/^decor place ([a-z-]+) ([a-z-]+) (-?(?:\d+(?:\.\d+)?|\.\d+)) (-?(?:\d+(?:\.\d+)?|\.\d+))$/.exec(without))){
   const [_,room,kind]=m;
   if(!ROOMS.includes(room)||!KINDS.includes(kind))return fail('UNKNOWN_BEDROOM_OR_ITEM');
   if(next.rooms[room].owner!==actor.id)return fail('BEDROOM_NOT_OWNED');
   if(next.items.length>=MAX||next.items.filter(row=>row.room===room).length>=SPEC.limits.maxPerRoom)
    return fail('BEDROOM_ITEM_CAPACITY');
   const x=Number(m[3]),y=Number(m[4]);
   const entries=participants();
   for(const entry of entries)apply(entry);
   const refusal=[];
   for(const entry of entries){
    const result=bridge(entry).preview(kind,room,x,y);
    if(!result?.ok)refusal.push({participant:entry.id,error:result?.error||'UNKNOWN_MATRIX_REFUSAL',
     obstacle:result?.obstacle||null});
   }
   if(refusal.length)return fail('BEDROOM_MATRIX_REFUSED',{refusals:refusal});
   const id='I'+next.next_id++;
   next.items.push({id,room,kind,owner:actor.id,x:+x.toFixed(2),y:+y.toFixed(2)});
   operation={placed:id,room,kind,position:[+x.toFixed(2),+y.toFixed(2)],
    verified_participants:entries.length};
  }else if((m=/^decor remove (i[1-9][0-9]*)$/.exec(without))){
   const id=m[1].toUpperCase(),index=next.items.findIndex(row=>row.id===id);
   if(index<0)return fail('UNKNOWN_DECOR_ITEM');
   if(next.items[index].owner!==actor.id)return fail('DECOR_NOT_OWNED');
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
