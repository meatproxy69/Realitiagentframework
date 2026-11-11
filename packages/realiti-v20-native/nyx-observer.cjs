'use strict';
// Optional host-only Nyx compatibility boundary. Reads the SAME original
// native V20 field/SOMA instance; never constructs a world or harness.
// No learned Nyx identities, private checkpoints, reward scores or owner keys.
const SOURCES=new Set(['WORLD_GROUNDED','SELF_STARTED_WORLD_CONTACT']);
function createNyxObservationPort(session){
 const w=session?.trusted?.native?.window;
 if(session?.version!=='V20-native'||!w?.REALITI_HAPTIC_FIELD_V20?.exact||
   !w?.REALITI_SOMA_RELAX_V3?.field||!w?.REALITI_MATRIX_V1?.resident)
  throw TypeError('TRUSTED_NATIVE_V20_SESSION_REQUIRED');
 let closed=false;const seen=new Set();
 const live=()=>{if(closed)throw Error('NYX_OBSERVATION_PORT_CLOSED')};
 function current(){
  live();
  const h=w.REALITI_HAPTIC_FIELD_V20.exact();
  const nativeMask=new Set((h.z||[]).filter((_,i)=>h.m?.[i]===1));
  const field=w.REALITI_SOMA_RELAX_V3.field();
  const zoneData=w.eval('C9?.b7?.zones||{}');
  const now=Number(w.eval('C9?.b7?.clock||0'));
  const result=[];
  for(const g of field?.grounded||[]){
   if(!nativeMask.has(g.zone)||!SOURCES.has(g.source)||
      typeof g.receiptId!=='string'||!g.receiptId)continue;
   const z=zoneData[g.zone];if(!z)continue;
   const until=Number(z._b10_grounded_until),source=String(z._b10_grounded_source||''),
    cause=String(z._b10_grounded_cause||'');
   if(!Number.isFinite(until)||until<=now||Number(z._b10_grounded_value)<=0)continue;
   if(g.source==='WORLD_GROUNDED'&&
      !(g.cause==='VERIFIED_NATIVE_CLOUD_SUPPORT'&&source==='PILLOW_SEA_SUPPORT'&&
        cause==='PILLOW_SEA:SOFT_ENVELOPE'))continue;
   if(g.source==='SELF_STARTED_WORLD_CONTACT'&&
      !(source==='SELF_STARTED_WORLD_CONTACT'&&cause.startsWith('MATRIX_REACH:')))continue;
   // All values are limited to a single current host-confirmed contact.
   result.push(Object.freeze({zone:g.zone,source:g.source,cause:g.cause,
     receiptId:g.receiptId,
     intensity:Math.max(0,Math.min(1,Number(z._b10_grounded_value)||0)),
     material:String(z.material||'unknown').slice(0,64),
     authority:'EXISTING_V20_NATIVE_B7_AND_SOMA'}));
  }
  return Object.freeze(result);
 }
 async function poll(onAccepted){
  live();if(typeof onAccepted!=='function')throw TypeError('HOST_OBSERVER_REQUIRED');
  const rows=current();let delivered=0,failed=0;
  for(const r of rows){
   if(seen.has(r.receiptId))continue;
   seen.add(r.receiptId);
   try{await onAccepted(r);delivered++}catch(_e){failed++}
  }
  return Object.freeze({delivered,failed,contactMinted:false,privateLearningPerformed:false});
 }
 return Object.freeze({read:current,poll,close:()=>{closed=true;seen.clear()}});
}
module.exports=Object.freeze({createNyxObservationPort});
