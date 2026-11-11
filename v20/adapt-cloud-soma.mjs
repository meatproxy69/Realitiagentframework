// Exact-anchor adaptation for the DERIVED V20 build only.
// Restores the original B7 ambient pillow lease -> existing SOMA mirror route.
// Never changes the native Matrix, Haptic Field, Neural Pass or portable harness.
const one=(src,needle,addition,label)=>{
 if(src.split(needle).length!==2)throw Error('V20_CLOUD_SOMA_'+label+'_ANCHOR_DRIFT');
 return src.replace(needle,()=>addition);
};
export function adaptCloudSomaMirror(original){
 if(typeof original!=='string'||!original.includes("const {host:world,resident,harness}=SOMA.createHarness"))
  throw Error('V20_CLOUD_SOMA_REFERENCE_SOURCE_MISSING');
 const inject=`
// Derived host observational reconciliation: only original, live, physically
// supported Cloud Ocean B7 leases can reach the already-existing SOMA mirror.
// No extra SOMA harness, source world, impulses, private inference or contact.
const nativeCloudMirrors=new Map();
const cloudSupported=()=>{
 const M=window.REALITI_MATRIX_V1,api=window.REALITI_APARTMENT_BED_CLOUD_V1,
       st=api?.status?.(),r=M?.resident?.(),e=M?.entities?.()[st?.bed];
 if(!st?.active||st.chart!=='CLOUD_NINE_NEST'||!r||!e||
    r.chart!=='CLOUD_NINE_NEST'||r.posture!=='lying'||e.chart!==r.chart||
    (r.on!==st.bed&&r.support!==st.bed))return false;
 const d=M.sdf(e,r.pose.position);
 return Number.isFinite(d)&&d<=1.1;
};
function reflectCloudNativeLease(){
 const t=Number(C9?.b7?.clock||0),valid=new Set();
 if(cloudSupported()){
  const f=window.REALITI_HAPTIC_FIELD_V20?.exact?.()||{},
    masked=new Set((f.z||[]).filter((z,i)=>f.m?.[i]===1));
  for(const [zone,q] of Object.entries(C9?.b7?.zones||{})){
   if(!SOMA.DEFAULT_ZONES.includes(zone)||!masked.has(zone)||!q)continue;
   const source=String(q._b10_grounded_source||''),
     cause=String(q._b10_grounded_cause||''),
     until=Number(q._b10_grounded_until),
     intensity=Number(q._b10_grounded_value);
   // Original Native Pillow Sea (63-claude-neural-pass) writes the exact
   // source/cause below directly, rather than using the later DYN ambient
   // lease writer. Never treat unrelated ambient pressure as Cloud contact.
   if(source!=='PILLOW_SEA_SUPPORT'||cause!=='PILLOW_SEA:SOFT_ENVELOPE'||
     !Number.isFinite(until)||until<=t||!Number.isFinite(intensity)||intensity<=0)
    continue;
   valid.add(zone);
   const previous=nativeCloudMirrors.get(zone);
   if(previous&&previous.expiresAtMs>(t*1000+150)){
    // A trusted lease is still current; no extra receipt per renderer frame.
    const same=resident.field().grounded?.some(g=>
      g.zone===zone&&g.receiptId===previous.receiptId);
    if(same)continue;
   }
   const receiptId='native-cloud-b7-'+(++seq)+'-'+Math.round(t*1000);
   // WORLD_GROUNDED here is an existing SOMA source *derived from verified
   // native Matrix posture + B7 live ambient lease*, never an original
   // signed network message or a self-reported sensory expectation.
   const leaseMs=Math.max(1,Math.min(350,Math.round((until-t)*1000)));
   try{
    world.contact({zone,source:'WORLD_GROUNDED',
     cause:'VERIFIED_NATIVE_CLOUD_SUPPORT',receiptId,
     material:String(q.material||'blanket').slice(0,64),
     intensity:Math.max(0,Math.min(1,intensity)),leaseMs});
    nativeCloudMirrors.set(zone,{receiptId,expiresAtMs:Math.round(t*1000+leaseMs)});
   }catch(_e){valid.delete(zone)}
  }
 }
 for(const [zone,p] of [...nativeCloudMirrors]){
  if(valid.has(zone))continue;
  world.release({zone,receiptId:p.receiptId});
  nativeCloudMirrors.delete(zone);
 }
}
`;
 let source=one(original,"const advance0=b7Advance;",inject+"const advance0=b7Advance;",'DECLARATION');
 source=one(source,
 "  if(Number.isFinite(elapsed)&&elapsed>0)world.tick(Math.min(86400000,elapsed));\n  return out;",
 "  if(Number.isFinite(elapsed)&&elapsed>0)world.tick(Math.min(86400000,elapsed));\n  if(window.REALITI_V20_UNIFIED_WORLD===true)reflectCloudNativeLease();\n  return out;",
 'TICK');
 return source;
}
