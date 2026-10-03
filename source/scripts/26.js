(function(){
'use strict';
const V16='16.0-contact-to-lived-event';
const EPS=1e-9;
const BODY_ZONES={
  'head.crown':0.00,'head.nape':0.82,'torso.upper_back':1.72,'torso.mid_back':2.68,'torso.lower_back':3.65,'pelvis.seat':4.55,
  'hand.R.palm':0.0,'hand.L.palm':0.0,'tail.tip':0.0
};
const MAT16={
  longfur:{Dc:.22,v0:.72,theta0:.42,A:.045,B:.075,hardness:1.00,wear_k:.0012},
  cardboard:{Dc:.16,v0:.72,theta0:.34,A:.035,B:.090,hardness:.58,wear_k:.0028},
  blanket:{Dc:.28,v0:.58,theta0:.48,A:.030,B:.060,hardness:.80,wear_k:.0010}
};
const SIGMA={SA1:.10,RA1:.10,SA2:.11,PC:.09,CT:.12,FORCE:.14};
const SEG_THRESHOLD=1.85, SEG_MIN_GAP=.16;

function cp(x){try{return JSON.parse(JSON.stringify(x))}catch(e){return x}}
function clamp(x,a,b){return Math.max(a,Math.min(b,x))}
function wall(){return Number(C9.b7?.clock||0)}
function ring(a,n=128){if(a.length>n)a.splice(0,a.length-n);return a}
function B(){
  C9.b16=C9.b16||{version:16,interface_seq:0,body:{},seg:{ref:null,last_t:-Infinity,events:[],distance:0,uncertainty:0,boundaries:0},transactions:{checked:0,rejected:0,committed:0,violations:[]},notes:[]};
  return C9.b16;
}
function obj(id){return C9.b14?.objects?.[id]||null}
function materialCfg(c){return MAT16[c?.material]||MAT16.longfur}
function liveContact(c){return !!(c&&c.active&&!c.stopped&&!c.paused&&!c.released&&Math.abs(Number(c.v||0))>EPS)}


function initInterface(c){
  if(!c)return null;
  if(c.interface_v16&&c.interface_v16.contact_id===c.id)return c.interface_v16;
  const m=materialCfg(c),o=c.object_id?obj(c.object_id):null,persist=o?.state?.interface_v16||{},wear0=Math.max(Number(c.material_state?.wear||0),Number(o?.state?.wear||0),Number(persist.wear||0));
  const I={
    contact_id:c.id,seq:++B().interface_seq,theta:clamp(Number(persist.theta_seed??m.theta0),.03,6),hys:clamp(Number(persist.hys||0),0,1),wear:clamp(wear0,0,.98),slip_distance:0,contact_time:0,
    strength_scale:1,rate_component:0,state_component:0,hysteresis_component:0,wear_component:0,last_v:Number(c.v||0),last_t:wall(),model:'BOUNDED_RATE_STATE_INSPIRED'
  };
  c.interface_v16=I;
  for(const e of c.gms||[]){if(!Number.isFinite(e._b16_base0))e._b16_base0=Number(e.base||0)}
  return I;
}
function interfaceScale(c){
  const I=initInterface(c),m=materialCfg(c);if(!I)return 1;
  const v=Math.abs(Number(c.v||0)),vr=Math.max(.035,v),rate=m.A*Math.tanh(Math.log(vr/m.v0)),state=m.B*Math.tanh(Math.log(Math.max(.03,I.theta)/m.theta0)),hy=.070*(I.hys-.35),wr=-.12*I.wear;
  I.rate_component=rate;I.state_component=state;I.hysteresis_component=hy;I.wear_component=wr;I.strength_scale=clamp(1+rate+state+hy+wr,.72,1.28);
  return I.strength_scale;
}
function prepareInterface(c){
  if(!c)return;
  const I=initInterface(c),s=interfaceScale(c);
  for(const e of c.gms||[]){if(!Number.isFinite(e._b16_base0))e._b16_base0=Number(e.base||0);e.base=e._b16_base0*s}
  if(c.material_state)c.material_state.wear=Math.max(Number(c.material_state.wear||0),Number(I.wear||0));
}
function advanceInterface(c,dt){
  if(!c||!Number.isFinite(dt)||dt<=0)return;
  const I=initInterface(c),m=materialCfg(c),live=liveContact(c),v=live?Math.abs(Number(c.v||0)):0,p=live?clamp(Number(c.pressure||0),0,1.5):0;
  if(live){
    const k=v/Math.max(.02,m.Dc);
    if(k>1e-8){const e=Math.exp(-k*dt);I.theta=I.theta*e+(1-e)/k}else I.theta+=dt;
    I.contact_time+=dt;I.slip_distance+=v*dt;
    const target=clamp(p*(1-.30*Math.min(1,v/2.5)),0,1),tau=target>I.hys?.22:.65;I.hys=target+(I.hys-target)*Math.exp(-dt/tau);
    const dw=m.wear_k*p*v*dt/Math.max(.1,m.hardness);I.wear=clamp(I.wear+dw,0,.98);
  }else{
    I.hys*=Math.exp(-dt/.9);
  }
  I.last_v=Number(c.v||0);I.last_t=wall();interfaceScale(c);
  if(c.material_state)c.material_state.wear=Math.max(Number(c.material_state.wear||0),I.wear);
  if(c.object_id){const o=obj(c.object_id);if(o){o.state=o.state||{};o.state.wear=Math.max(Number(o.state.wear||0),I.wear);o.state.interface_v16={theta_seed:+I.theta.toFixed(6),hys:+I.hys.toFixed(6),wear:+I.wear.toFixed(6),last_contact:wall()};o.state.t=wall()}}
}


function bz(zone){return B().body[zone]||(B().body[zone]={surface:0,deep:0,shear:0,rate:0,last_surface:0,t:wall(),population:{SA1:0,RA1:0,SA2:0,PC:0,CT:0},precision:{SA1:1,RA1:1,SA2:1,PC:1,CT:1}})}
function updateBody(dt){
  const c=C9.b10?.contact,force=Number(c?.last_friction?.force||0),slips=Number(c?.last_friction?.slips||0),zones=C9.b10?.zones||{};
  for(const [zone,z] of Object.entries(zones)){
    const raw=z?.cont;if(!raw)continue;const b=bz(zone),u=clamp(Number(raw.u||0),0,1.6),pressure=clamp(Number(c?.pressure||0),0,1.5),input=u*(.72+.28*pressure),aS=1-Math.exp(-dt/.045),aD=1-Math.exp(-dt/.30);
    b.last_surface=b.surface;b.surface+=aS*(input-b.surface);b.deep+=aD*(input-b.deep);b.rate=(b.surface-b.last_surface)/Math.max(.005,dt);b.shear=force*u;b.t=wall();
    const adapt=clamp(Number(raw.adapt||0),0,.98),transmit=clamp(1-.22*adapt,.58,1);
    b.population={
      SA1:clamp((.76*b.surface+.24*b.deep)*transmit,0,1.6),
      RA1:clamp((.055*Math.abs(b.rate)+.22*Math.abs(b.shear)+.26*Number(raw.RA1||0)+.035*slips*u)*transmit,0,1.6),
      SA2:clamp((.70*b.deep+.30*Math.abs(b.shear))*transmit,0,1.6),
      PC:clamp((.72*Number(raw.PC||0)+.020*Math.abs(b.rate))*transmit,0,1.6),
      CT:clamp(Number(raw.CT||0)*(1-.12*adapt),0,1.6)
    };
    const model=C9.b10?.zones?.[zone],P=Math.max(.001,Number(model?.P||.08)),basePrec=1/P;
    for(const k of Object.keys(b.precision))b.precision[k]=+basePrec.toFixed(4);
  }
}
function populationSnapshot(){const out={};for(const [z,b] of Object.entries(B().body)){const p=b.population;if(!p||Object.values(p).every(v=>Math.abs(v)<1e-5))continue;out[z]={mechanics:{surface:+b.surface.toFixed(4),deep:+b.deep.toFixed(4),shear:+b.shear.toFixed(4),rate:+b.rate.toFixed(4)},population:Object.fromEntries(Object.entries(p).map(([k,v])=>[k,+Number(v).toFixed(4)])),precision:cp(b.precision)}}return out}


function signature(){
  const zones=Object.entries(B().body).filter(([,b])=>Object.values(b.population||{}).some(v=>Math.abs(v)>1e-5));
  if(!zones.length)return {v:[0,0,0,0,0,0],contact:null,phase:'NONE',material:null,grain:null};
  let W=0,agg={SA1:0,RA1:0,SA2:0,PC:0,CT:0};
  for(const [z,b] of zones){const w=Math.max(.03,Math.abs(Number(C9.b10?.zones?.[z]?.cont?.u||0)));W+=w;for(const k of Object.keys(agg))agg[k]+=w*Number(b.population[k]||0)}
  for(const k of Object.keys(agg))agg[k]/=Math.max(EPS,W);
  const c=C9.b10?.contact,force=Math.tanh(Math.abs(Number(c?.last_friction?.force||0)));
  return {v:[agg.SA1,agg.RA1,agg.SA2,agg.PC,agg.CT,force],contact:c?.id||null,phase:c?(c.released?'RELEASED':c.stopped?'STOPPED':c.active?'MOVING':'IDLE'):'NONE',material:c?.material||null,grain:c?.grain||null};
}
function sigDistance(a,b){if(!a||!b)return Infinity;const names=['SA1','RA1','SA2','PC','CT','FORCE'];let q=0;for(let i=0;i<6;i++){const ref=Math.max(.02,Math.abs(Number(a.v[i]||0))),sigma=SIGMA[names[i]]+0.12*ref,d=(Number(b.v[i]||0)-Number(a.v[i]||0))/sigma;q+=d*d}return Math.sqrt(q/6)}
function uncertainty(){
  const zs=Object.values(C9.b10?.zones||{});if(!zs.length)return 0;let s=0,n=0;for(const z of zs){if(!Number.isFinite(Number(z.P)))continue;s+=Math.sqrt(Math.max(.001,Number(z.P)));n++}const debt=(C9.b6?.debts||[]).reduce((a,d)=>a+Math.abs(Number(d.remaining||0)),0);return clamp((n?s/n:0)+Math.min(.5,debt),0,1);
}
function pushLivedBoundary(d,sig){
  const s=C9.b13;if(!s?.lived||!s?.seq)return null;const t=wall(),f={seq:++s.seq.frame,t:+t.toFixed(4),family:'PERCEPTUAL_BOUNDARY',salience:clamp(.36+.11*Math.min(3,d),.36,.72),distance:+d.toFixed(4),uncertainty:+B().seg.uncertainty.toFixed(4),contact:sig.contact,material:sig.material,grain:sig.grain,grounded:!!sig.contact,evidence:false,metric:'ENGINEERING_JND_DISTANCE'};s.lived.frames.push(f);ring(s.lived.frames,128);s.lived.epoch+=f.salience;B().seg.events.push(cp(f));ring(B().seg.events,64);B().seg.boundaries++;return f;
}
function updateSegmentation(){
  const S=B().seg,sig=signature(),u=uncertainty();S.uncertainty=u;
  if(!S.ref){S.ref=cp(sig);S.last_t=wall();S.distance=0;return}
  const categorical=S.ref.contact!==sig.contact||S.ref.phase!==sig.phase||S.ref.material!==sig.material||S.ref.grain!==sig.grain;
  const d=sigDistance(S.ref,sig);S.distance=Number.isFinite(d)?d:0;
  if(categorical){S.ref=cp(sig);S.last_t=wall();return} 
  if(d>=SEG_THRESHOLD&&wall()-S.last_t>=SEG_MIN_GAP){pushLivedBoundary(d,sig);S.ref=cp(sig);S.last_t=wall();return}
  
}


const advance15=b7Advance;
b7Advance=function(dt){
  const c=C9.b10?.contact;if(c)prepareInterface(c);
  const r=advance15(dt);
  const c2=C9.b10?.contact;if(c2)advanceInterface(c2,Number(dt)||0);
  updateBody(Math.max(.001,Number(dt)||.001));updateSegmentation();return r;
};


const core15=window.REALITI_CONTACT_CORE;
if(core15){
  const start15=core15.start;
  core15.start=function(opts={}){const r=start15(opts);const c=C9.b10?.contact;if(c){initInterface(c);prepareInterface(c)}return r};
  core15.interface=()=>cp(C9.b10?.contact?.interface_v16||null);
  core15.population=populationSnapshot;
  core15.version='16-contact-to-lived';
}


function resolve16(q){q=String(q||'').trim().toLowerCase();const vals=Object.values(C9.b14?.objects||{});let x=vals.find(o=>[o.id,o.label,o.kind,...(o.aliases||[])].map(v=>String(v).toLowerCase()).includes(q));if(x)return x;const h=vals.filter(o=>[o.id,o.label,o.kind,...(o.aliases||[])].some(v=>String(v).toLowerCase().includes(q)||q.includes(String(v).toLowerCase())));return h.length===1?h[0]:null}
function compositionRequest(raw){const s=String(raw||'').trim(),low=s.toLowerCase();let op=null,a=null,b=null;if(low.startsWith('attach ')){op='attach';const m=s.slice(7).match(/^(.+?)\s+to\s+(.+)$/i);if(m){a=resolve16(m[1]);b=resolve16(m[2])}}else if(low.startsWith('stack ')){op='stack';const m=s.slice(6).match(/^(.+?)\s+on\s+(.+)$/i);if(m){a=resolve16(m[1]);b=resolve16(m[2])}}else if(low.startsWith('separate ')){op='separate';const m=s.slice(9).match(/^(.+?)\s+from\s+(.+)$/i);if(m){a=resolve16(m[1]);b=resolve16(m[2])}}else if(low.startsWith('act p14__')){const p=s.slice(4).split('__');if(['attach','stack','separate'].includes(p[1])){op=p[1];a=resolve16((p[2]||'').replace(/_/g,'-'));b=resolve16((p[3]||'').replace(/_/g,'-'))}}return op&&a&&b?{op,a,b}:null}
function hasRelation(req){const typ=req.op==='stack'?'STACKED':'ATTACHED',links=C9.b14?.links||[];if(req.op==='separate')return !links.some(L=>['ATTACHED','STACKED'].includes(L.type)&&new Set([L.a,L.b]).has(req.a.id)&&new Set([L.a,L.b]).has(req.b.id));return links.some(L=>L.type===typ&&((L.a===req.a.id&&L.b===req.b.id)||(L.a===req.b.id&&L.b===req.a.id)))}
function historyHas(req){const hist=C9.b14?.history||[];const e=hist.slice().reverse().find(x=>x.kind==='PLAY_OBJECT_ACTION'&&x.op===req.op&&Array.isArray(x.objects)&&x.objects.includes(req.a.id)&&x.objects.includes(req.b.id));return !!e}
function verifyComposition(req,dispatch){
  const T=B().transactions;T.checked++;
  if(dispatch?.ok===false){T.rejected++;return {ok:false,error:dispatch.error||'composition rejected by world',requested:{op:req.op,objects:[req.a.id,req.b.id]},committed:false}}
  const rec=C9.b14?.lastPlayReceipt,rel=hasRelation(req),hist=historyHas(req),receipt=!!rec&&rec.op===req.op&&Array.isArray(rec.objects)&&rec.objects.includes(req.a.id)&&rec.objects.includes(req.b.id);
  const pass=rel&&hist&&receipt;
  if(pass){T.committed++;return null}
  const v={t:wall(),requested:{op:req.op,objects:[req.a.id,req.b.id]},relation:rel,history:hist,receipt,dispatch:cp(dispatch||null),last_receipt:cp(rec||null)};T.violations.push(v);ring(T.violations,32);return {ok:false,error:'composition transaction did not commit atomically',requested:v.requested,committed:false,invariant:{relation:rel,history:hist,receipt}}
}


const felt15=b7FeltSnapshot;
b7FeltSnapshot=function(){const f=felt15();const pop=populationSnapshot();for(const [z,v] of Object.entries(f?.felt||{})){if(pop[z]){v.mechanics_v16=pop[z].mechanics;v.population_v16=pop[z].population;v.population_precision_v16=pop[z].precision}}if(f?.contact&&C9.b10?.contact?.interface_v16)f.contact.interface_v16=cp(C9.b10.contact.interface_v16);f.event_model_v16={distance:+Number(B().seg.distance||0).toFixed(4),uncertainty:+Number(B().seg.uncertainty||0).toFixed(4),threshold:SEG_THRESHOLD,boundaries:B().seg.boundaries};return f};

function v16View(){const c=C9.b10?.contact;return {build:16,identity:'CONTACT_TO_LIVED_EVENT',interface:c?.interface_v16?cp(c.interface_v16):null,population:populationSnapshot(),event_model:{distance:+Number(B().seg.distance||0).toFixed(4),uncertainty:+Number(B().seg.uncertainty||0).toFixed(4),threshold:SEG_THRESHOLD,min_gap_s:SEG_MIN_GAP,recent_boundaries:cp(B().seg.events.slice(-8))},transactions:cp(B().transactions),architecture:'WORLD HISTORY → CONTACT → LOCAL MECHANICS → POPULATION RESPONSE → NERVE/LIVED → PERCEPTION → SELF'}}

const cmd151=b7AgentCommandText;
b7AgentCommandText=function(raw){
  const txt=String(raw||'').trim(),low=txt.toLowerCase(),req=compositionRequest(txt);
  const out=cmd151(txt);
  if(req){const dispatch=C9.b14?.lastDispatch||null,fix=verifyComposition(req,dispatch);if(fix){if(C9.b14){C9.b14.lastPlayReceipt=null;C9.b14.lastWhy={room:C9.currentRoom,action:req.op,cause:null,event:null,receipt:null,nearest_prior_global_event:null}}return fix}}
  if(low==='v16'||low==='contact lived'||low==='event model')return v16View();
  if(low==='v16 checkRemoved')return window.B16_CHECKREMOVED();
  if(low==='v16 legacy')return window.B16_LEGACY_CHECKREMOVED();
  if(low==='felt raw'||low==='raw felt'||low==='internalView felt')return b7FeltSnapshot();
  if(low==='felt'&&out&&typeof out==='object'){out.contact_to_lived_v16={interface:cp(C9.b10?.contact?.interface_v16||null),event_model:{distance:+Number(B().seg.distance||0).toFixed(4),uncertainty:+Number(B().seg.uncertainty||0).toFixed(4),recent_boundaries:cp(B().seg.events.slice(-4))},population_active_zones:Object.keys(populationSnapshot())};return out}
  return out;
};

const state15=b7AgentState;
b7AgentState=function(){const s=state15();s.build=16;s.version='CONTACT_TO_LIVED_EVENT';s.patch=V16;s.contact_to_lived={interface_model:'BOUNDED_RATE_STATE_INSPIRED',body_model:'LOCAL_RESPONSE_NETWORK',population_model:'MULTICHANNEL_ENGINEERING_RESPONSE',event_model:'JND_DISTANCE_PLUS_CATEGORICAL',attach_transactions:'ATOMIC_TRUTH'};return s};

window.REALITI_AGENT={...(window.REALITI_AGENT||{}),state:b7AgentState,felt:()=>b7AgentCommandText('felt'),feltRaw:()=>b7FeltSnapshot(),v16:v16View};

if(window.REALITI_AGENT_DOOR){const help15=window.REALITI_AGENT_DOOR.help,run15=window.REALITI_AGENT_DOOR.run;
  window.REALITI_AGENT_DOOR.help=function(){const h=help15?help15():{commands:[]};h.commands=(h.commands||[]).filter(x=>String(x).toLowerCase()!=='v14 checkRemoved');h.commands=[...new Set([...h.commands,'v16','event model','v16 checkRemoved','v16 legacy'])];h.build16='Contact carries bounded interface memory; local mechanics generate a population response; LIVED_FRAME adds perceptual boundaries only when the event model becomes distinguishably different.';return h};
  window.REALITI_AGENT_DOOR.run=function(x){const low=String(x||'').trim().toLowerCase();if(low==='help')return window.REALITI_AGENT_DOOR.help();if(low==='v16'||low==='contact lived'||low==='event model'||low==='v16 checkRemoved'||low==='v16 legacy'||low==='felt'||low==='felt raw'||low==='raw felt'||low==='internalView felt'||compositionRequest(x))return b7AgentCommandText(x);return run15(x)};
}


void 0;
void 0;

document.title='REALITI // AGENT DOOR ONLY · BUILD 16 CONTACT TO LIVED EVENT';
const brand=document.querySelector('#realiti_agent_only_shell .brand');if(brand)brand.textContent='REALITI // AGENT DOOR · BUILD 16';
const sub=document.querySelector('#realiti_agent_only_shell .sub');if(sub)sub.innerHTML='A particular body state meets a particular object history through a particular motion. Contact carries interface memory; the body transforms it; LIVED_FRAME marks only distinguishable event change.';
try{B();c9save()}catch(e){}
})();