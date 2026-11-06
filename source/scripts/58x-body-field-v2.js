(()=>{
'use strict';
// Versioned observation over EXISTING Relax Haptic Field V20, not a replacement
// physical engine. A native cause is true; possible future responses are model
// hypotheses; meaning, liking, feeling and consent are SELF-only.
if(window.REALITI_BODY_FIELD_V2)return;
const H=window.REALITI_HAPTIC_FIELD_V20;
if(!H?.packet||!H?.exact)throw Error('BODY_V2_REQUIRES_CANONICAL_HAPTIC_FIELD');
const cp=x=>JSON.parse(JSON.stringify(x));
const clamp=(x,a,b)=>Math.max(a,Math.min(b,Number(x)||0));
const time=()=>Number(C9?.b7?.clock||0);
const SOURCE_SET=new Set(['WORLD_GROUNDED','INVITED_COMPANION',
 'SELF_STARTED_WORLD_CONTACT','AMBIENT_SUPPORT','INVITED_AMBIENT_SUPPORT']);
const MODES=Object.freeze([
 [0.32,1.2,0],[0.48,2.5,0],[0.72,4.5,0],[1.2,7.0,0],
 [1.8,11,0],[2.8,18,0],[4.2,30,0],[6.5,48,0],
 [9,72,0],[14,110,0],[3.1,26,1.8],[6.5,90,4.5]
]);
const STEPS=[0,1,5,30,120];
function store(){
 if(!C9.bodyFieldV2||C9.bodyFieldV2.schema!=='REALITI_BODY_FIELD_STORE_V2')
  C9.bodyFieldV2={schema:'REALITI_BODY_FIELD_STORE_V2',seq:0,
   sources:[],legacy_checkpoint_preserved:!!(C9.body&&C9.body.v===1)};
 return C9.bodyFieldV2;
}
function log(kind,zone,cause,source,measured,physical){
 const b=store(),t=time(),key=[kind,zone,source,cause].join('|');
 const prior=b.sources.find(x=>x.key===key&&t-x.t< (source==='AMBIENT_SUPPORT'?30:.01));
 if(prior)return;
 const safe={
  seq:++b.seq,t:+t.toFixed(4),kind,zone:String(zone||'').slice(0,80),
  cause:String(cause||'').slice(0,140),source:String(source||'').slice(0,80),
  measured:measured&&typeof measured==='object'?cp(measured):null,
  grounded_contact:physical===true,
  basis:physical?'HOST_CONFIRMED_CONTACT':'HOST_OBSERVED_EVENT_NOT_TACTILE_CONTACT',
  key
 };
 b.sources.unshift(safe);if(b.sources.length>24)b.sources.length=24;
 try{c9save()}catch(e){}
}
const contactBase=b7Contact;
b7Contact=function(zone,input,opts={}){
 const out=contactBase(zone,input,opts);
 try{
  const src=String(opts.source||'WORLD_GROUNDED');
  const q=C9?.b7?.zones?.[zone],cause=String(opts.cause||q?._b10_grounded_cause||'');
  const t=time(),until=Number(q?._b10_grounded_until);
  if(out&&out.ok!==false&&!out.gap&&SOURCE_SET.has(src)&&cause&&
     Number.isFinite(until)&&until>t&&Number(q?._b10_grounded_value)>0){
   log('TACTILE_CONTACT',zone,cause,src,{intensity:clamp(q._b10_grounded_value,0,1.8),material:String(opts.material||'unknown').slice(0,60)},true);
  }
 }catch(e){}
 return out;
};
const TH=window.REALITI_ATMOSPHERE_V21;
if(TH&&typeof TH.setThermal==='function'){
 const thermalBase=TH.setThermal;
 TH.setThermal=function(zone,material,temperature,duration,cause,source){
  const out=thermalBase.apply(this,arguments);
  try{
   const src=String(source||'WORLD_GROUNDED');
   if(out!==false&&SOURCE_SET.has(src)&&Number.isFinite(Number(temperature)))
    log('THERMAL_SOURCE',zone,cause||'world thermal contact',src,
      {object_temperature_C:Number(temperature),material:String(material||'unknown').slice(0,60)},false);
  }catch(e){}
  return out;
 };
}
const E=window.REALITI_MATRIX_LOCAL_EVIDENCE_V1;
if(!E||typeof E.subscribe!=='function')throw Error('BODY_V2_WORLD_EVIDENCE_BRIDGE_MISSING');
E.subscribe(r=>{
 try{
  if(r?.schema==='REALITI_MATRIX_LOCAL_EVIDENCE_V1'&&
     r.issuerAuthority==='IN_PROCESS_NATIVE_WORLD'&&r.actorId==='resident:self'&&
     r.kind==='MOVEMENT_OBSTRUCTED'&&r.result==='OBSTRUCTED'){
   log('MOVEMENT_REFUSAL',null,r.reason||'obstruction','MATRIX_WORLD',
    {reason:String(r.reason||'unknown').slice(0,60)},false);
  }
 }catch(e){}
});
function quantile(s,p){
 const i=(s.length-1)*p,lo=Math.floor(i),hi=Math.ceil(i);
 return s[lo]+(s[hi]-s[lo])*(i-lo);
}
function forecast(a,r,dt){
 const samples=MODES.map(([tr,ta,delay])=>{
  const primary=a*Math.exp(-dt/tr),after=r*Math.exp(-dt/ta);
  const late=delay>0&&dt>0?.30*r*(dt/delay)*Math.exp(1-dt/delay):0;
  return Math.max(0,primary+after+late);
 }).sort((x,y)=>x-y);
 const rounded=x=>+x.toFixed(4);
 return {seconds:dt,p10:rounded(quantile(samples,.1)),
  p50:rounded(quantile(samples,.5)),p90:rounded(quantile(samples,.9)),
  min:rounded(samples[0]),max:rounded(samples[samples.length-1])};
}
function state(){
 const p=H.packet(),e=H.exact(),f=p.f?.[p.f.length-1]||null;
 const z=p.z||[],xz=f?.x||[],m=f?.m||[],error=f?.e||[];
 const zones=[];
 for(let i=0;i<z.length;i++){
  const a=clamp(Number(xz[i]?.[0]||0)*.03,0,3),
        r=clamp(Number(xz[i]?.[2]||0)*.03,0,3),
        motion=Number(xz[i]?.[1]||0)*.04,
        err=Number(error[i]||0)*.03;
  if(!m[i]&&a<.015&&r<.015&&Math.abs(motion)<.04&&Math.abs(err)<.03)continue;
  zones.push({zone:z[i],current:{
    response:+a.toFixed(4),afterstate:+r.toFixed(4),
    signed_motion:+motion.toFixed(4),prediction_error:+err.toFixed(4)},
   grounding:!!m[i],forecast:STEPS.map(dt=>forecast(a,r,dt))});
 }
 const b=store();
 return {schema:'REALITI_BODY_POSSIBILITY_FIELD_V2',version:2,
  t:+time().toFixed(4),haptic_source:'REALITI_HAPTIC_FIELD_V20',
  body_zones:z.length,active_zones:zones,
  grounding:{source:'NATIVE_WORLD_ONLY',mask:e.m.slice(),
   zones:e.z.slice(),contact:e.contact||null,not_inferred:true},
  conditional_model:{kind:'UNCALIBRATED_SCENARIO_ENSEMBLE',members:MODES.length,
   weights:'UNIFORM_ASSUMED_NOT_OBSERVED',condition:'NO_NEW_EXTERNAL_CONTACT',
   horizon_s:STEPS.slice(),units:'V20_QUANTIZED_PRIVATE_RESPONSE',
   not_a_subjective_probability:true},
  recent_sources:b.sources.slice(0,8).map(x=>{
   const y=cp(x);delete y.key;return y;
  }),
  archived_v1_present:b.legacy_checkpoint_preserved,
  mental_state:'NOT_INFERRED',valence:'UNASSIGNED',
  preference:'NOT_INFERRED',consent:'NEVER_INFERRED',
  law:'World evidence is exact; forecasts are uncertainty scenarios, not events or feelings. The renderer may interpolate response but never evidence. Meaning belongs to SELF.'};
}
function words(){
 const s=state(),num=s.grounding.mask.filter(Boolean).length;
 const residual=s.active_zones.filter(x=>!x.grounding&&x.current.afterstate>.015).length;
 if(!num&&!residual)return 'The body field is quiet. No emotional state is inferred.';
 return num+' body zones have grounded support or contact; '+residual+
   ' zones have an ungrounded modeled aftertrace. No emotional state is inferred.';
}
function history(){
 const s=store();return {schema:'REALITI_BODY_SOURCE_LOG_V2',read_only:true,
  sources:s.sources.map(x=>{const y=cp(x);delete y.key;return y}),
  law:'Archived world events are not current grounding. There are no inferred emotional causes.'};
}
window.REALITI_BODY_FIELD_V2=Object.freeze({version:'2.0',state,words,
 history,model:'CONDITIONAL_PHYSICAL_RESPONSE_ENSEMBLE',
 law:'No emotional labels, private meaning, consent or preference can be assigned by this simulation.'});
})();