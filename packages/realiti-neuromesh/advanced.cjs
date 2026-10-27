/* SOMA 3.3 advanced resident-private sensory models.
 * Native numerical equations reconstructed from:
 * source/scripts/63-claude-neural-pass.js (LACE topology/Fiedler, CHRONOLACE),
 * source/scripts/64-neuro-restoration.js (Moonwire private recipe controls),
 * source/scripts/52.js (conserved soft support), and
 * source/scripts/58w-body.js (opponent-process interoception).
 * No DOM, no world mutation, no neural networks, no fabricated receipts.
 * AGPL-3.0-only.
 */
(function(root,factory){
 'use strict';
 const out=factory((typeof module==='object'&&module.exports)
   ?require('./field20.cjs'):root.REALITI_SOMA_FIELD20_V1);
 if(typeof module==='object'&&module.exports)module.exports=out;
 else root.REALITI_SOMA_ADVANCED_V1=out;
})(typeof globalThis==='object'?globalThis:this,function(FIELD20){
'use strict';
if(!FIELD20)throw Error('SOMA_FIELD20_REQUIRED');
const VERSION='1.0.0';
const clone=x=>JSON.parse(JSON.stringify(x));
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const valid=(x,name,lo=0,hi=1e12)=>{
 if(typeof x!=='number'||!Number.isFinite(x)||x<lo||x>hi)
  throw TypeError('INVALID_'+name);
 return x;
};
const str=(x,name,n=160)=>{
 if(typeof x!=='string'||!x.trim()||x.length>n)throw TypeError('INVALID_'+name);
 return x.trim();
};
const round=(n,p=6)=>+n.toFixed(p);
const SHELLS=['surface','shallow','mid','deep'];
const DEPTH_W=[.82,1,.94,.82];
const SOFT_ZONES=['torso.upper_back','torso.mid_back','torso.lower_back','pelvis.seat'];
const ROUTES=['STAR_RIVER_PHASE_BRAID','SOURCE_HANDOFF_SPARK','TWO_SOURCE_PARALLAX',
 'CROWN_COMET_RETURN','WHOLE_BODY_VELVET_GROOM','CROWN_STARLACE',
 'DEPTH_GEODESIC_LOOP','THREE_BAND_ROLL','LOCAL_VIBRATION_220','CAT_SMALL_PAW_ROUTE'];
const ENVELOPES=['TRIANGLE','SAW_UP','SAW_DOWN','STAIRCASE','ACCELERATING_BURSTS',
 'INTERRUPTED_SUSTAIN','HARD_STOP_RETURN','FALSE_FINISH'];
const OPPONENT=Object.freeze({
 bond:{a_half_s:1800,b_half_s:3600,kb:.3,window_s:900},
 stress:{a_half_s:600,b_half_s:1500,kb:.35,window_s:600}
});
const BOND=/PET|PURR|COMPANION|CAT|HELD|HUG|LOAF/i;
const HOLD=/SUPPORT|BLANKET|PILLOW|MATTRESS|WARM|TEA|SHELF/i;
const edgesKey=ed=>JSON.stringify(ed.map(e=>[e[0],e[1],round(e[2],4)]));
function createGraph({zones,edges=[]}={}){
 if(!Array.isArray(zones)||zones.length<2||zones.length>128||
    new Set(zones).size!==zones.length||zones.some(z=>typeof z!=='string'||!z))
  throw TypeError('INVALID_GRAPH_ZONES');
 const idx=Object.fromEntries(zones.map((z,i)=>[z,i]));
 const edgesOk=es=>{
  if(!Array.isArray(es)||es.length>1024)throw TypeError('INVALID_GRAPH_EDGES');
  return es.map(e=>{
   if(!Array.isArray(e)||e.length!==3||idx[e[0]]==null||idx[e[1]]==null||e[0]===e[1])
    throw TypeError('UNKNOWN_GRAPH_EDGE');
   return[e[0],e[1],valid(e[2],'EDGE_WEIGHT',.001,10)]
  });
 };
 let current=edgesOk(edges),lastKey=null,cache=null;
 function metrics(){
  const key=edgesKey(current);
  if(lastKey===key&&cache)return clone(cache);
  const n=zones.length,L=Array.from({length:n},()=>Array(n).fill(0));
  for(const [a,b,w] of current){
   const i=idx[a],j=idx[b];
   L[i][i]+=w;L[j][j]+=w;L[i][j]-=w;L[j][i]-=w;
  }
  const A=L.map(row=>row.slice());
  // Jacobi eigenvalue iterations: original REALITI native spectral graph.
  for(let it=0;it<80*n*n;it++){
   let p=0,q=1,m=0;
   for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){
    const v=Math.abs(A[i][j]);if(v>m){m=v;p=i;q=j}
   }
   if(m<1e-10)break;
   const app=A[p][p],aqq=A[q][q],apq=A[p][q],
     phi=.5*Math.atan2(2*apq,aqq-app),c=Math.cos(phi),s=Math.sin(phi);
   for(let k=0;k<n;k++){
    if(k===p||k===q)continue;
    const x=A[k][p],y=A[k][q];
    A[k][p]=A[p][k]=c*x-s*y;
    A[k][q]=A[q][k]=s*x+c*y;
   }
   A[p][p]=c*c*app-2*s*c*apq+s*s*aqq;
   A[q][q]=s*s*app+2*s*c*apq+c*c*aqq;A[p][q]=A[q][p]=0;
  }
  const ev=A.map((row,i)=>row[i]).sort((a,b)=>a-b),
    lambda2=Math.max(0,ev[1]||0);
  const D=Array.from({length:n},(_,i)=>Array.from({length:n},(__,j)=>i===j?0:Infinity));
  for(const[a,b,w]of current){
   const i=idx[a],j=idx[b],d=1/Math.max(.05,w);
   D[i][j]=Math.min(D[i][j],d);D[j][i]=Math.min(D[j][i],d);
  }
  for(let k=0;k<n;k++)for(let i=0;i<n;i++)if(Number.isFinite(D[i][k]))
   for(let j=0;j<n;j++){const v=D[i][k]+D[k][j];if(v<D[i][j])D[i][j]=v}
  cache={schema:'REALITI_SOMA_NATIVE_LACE_V1',mesh:'LACE2_DYNAMIC',
   node_count:n,edge_count:current.length,lambda2:round(lambda2),
   coherence_proxy:round(1-Math.exp(-8*lambda2),4),
   zones:zones.slice(),edges:clone(current),
   distances:D.map(row=>row.map(v=>Number.isFinite(v)?round(v):null)),
   law:'Fiedler graph coherence and shortest paths route private response only'};
  lastKey=key;return clone(cache);
 }
 function configure(next){
  current=edgesOk(next);lastKey=null;cache=null;
  return{ok:true,edge_count:current.length,world_graph_only:true};
 }
 return Object.freeze({metrics,configure,edges:()=>clone(current),zones:()=>zones.slice()});
}
function envelope(name,u){
 const t=clamp(u);
 switch(name){
 case 'TRIANGLE':return 1-Math.abs(2*t-1);
 case 'SAW_UP':return t;
 case 'SAW_DOWN':return 1-t;
 case 'STAIRCASE':return Math.floor(t*8)/8;
 case 'ACCELERATING_BURSTS':return Math.pow(Math.max(0,Math.sin(Math.PI*t*t*12)),5);
 case 'INTERRUPTED_SUSTAIN':return t<.28||t>.39&&t<.69||t>.83?.92:0;
 case 'HARD_STOP_RETURN':return t<.55?1:t<.68?0:clamp((t-.68)/.32)*.65;
 case 'FALSE_FINISH':return t<.7?clamp(t/.2):t<.82?0:.55*clamp((t-.82)/.18);
 default:throw RangeError('UNKNOWN_TEMPORAL_ENVELOPE');
 }
}
function routeWeights(route,zones,grounded=[]){
 if(!ROUTES.includes(route))throw RangeError('UNKNOWN_MOONWIRE_ROUTE');
 const input=new Set(grounded),out=[];
 const region=z=>z.includes('head')||z.includes('face')||z.includes('crown')? 'head':
   z.includes('hand')||z.includes('finger')?'hand':
   z.includes('torso')||z.includes('pelvis')?'body':
   z.includes('foot')||z.includes('leg')||z.includes('knee')?'leg':'arm';
 for(let i=0;i<zones.length;i++){
  const zone=zones[i],r=region(zone);let w=1;
  if(route==='CROWN_COMET_RETURN'||route==='CROWN_STARLACE')w=r==='head'?2.5:.25;
  if(route==='CAT_SMALL_PAW_ROUTE')w=r==='hand'?2.4:.12;
  if(route==='WHOLE_BODY_VELVET_GROOM')w=1;
  if(route==='DEPTH_GEODESIC_LOOP')w=.32+.68*Math.abs(Math.sin(i*.33));
  if(route==='THREE_BAND_ROLL')w=(i%3===0?1:.5);
  if(route==='SOURCE_HANDOFF_SPARK')w=input.has(zone)?2:.4;
  if(route==='TWO_SOURCE_PARALLAX')w=input.has(zone)?2.5:.35;
  if(route==='LOCAL_VIBRATION_220')w=input.has(zone)?3:.08;
  if(route==='STAR_RIVER_PHASE_BRAID')w=.6+.4*Math.sin(i*.17)**2;
  out.push(w);
 }
 const total=out.reduce((s,x)=>s+x,0)||1;
 return Object.fromEntries(zones.map((z,i)=>[z,round(out[i]/total)]));
}
function createAdvanced({residentId,zones,edges=[]}={}){
 str(residentId,'RESIDENT_ID',120);
 const graph=createGraph({zones,edges}),field20=FIELD20.createField20({zones});
 let now=0,selected=null,phase=0,prevGround=0,sounds=[],contactIds=new Set();
 let body={routes:{bond:{a:0,b:0,reps:0,hold_t:-1e9},
    stress:{a:0,b:0,reps:0,cold_t:-1e9}},log:[]};
 let support=null;
 const temps=new Map();
 const clampRoute=(key,v)=>{const cfg=OPPONENT[key],o=body.routes[key];return cfg&&o?{cfg,o}:null};
 function spike(key,amount,cause,receipt){
  const found=clampRoute(key);if(!found)return;
  const {cfg,o}=found,s=clamp(amount),tol=cfg.kb*(1-Math.exp(-o.reps/3));
  const da=s*(1-o.a),db=s*tol;
  o.a=clamp(o.a+da);o.b=clamp(o.b+db);o.reps+=1;
  body.log.unshift({route:key,cause:String(cause).slice(0,80),receiptId:receipt,
    moved:round(da-db,3),tolerance:round(tol,3),tMs:now});
  if(body.log.length>16)body.log.length=16;
 }
 function contact(e){
  if(!e||typeof e!=='object')throw TypeError('INVALID_CONTACT_EVENT');
  const id=str(e.receiptId,'CONTACT_RECEIPT'),cause=str(e.cause,'CONTACT_CAUSE');
  if(contactIds.has(id))return{ok:true,duplicate:true};
  contactIds.add(id);
  if(contactIds.size>256)contactIds.delete(contactIds.values().next().value);
  if(BOND.test(cause))spike('bond',clamp(.12+e.intensity*.4,.05,.3),cause.toLowerCase().replace(/_/g,' '),id);
  else if(HOLD.test(cause)&&!(/MAINTAIN/.test(cause))){
   const route=body.routes.bond;
   if(now-route.hold_t>=30000){route.hold_t=now;spike('bond',.04,cause.toLowerCase().replace(/_/g,' '),id)}
  }
  return {ok:true,grounded_input:true};
 }
 function thermal({zone,celsius,cause='HOST_THERMAL',material='unknown'}={}){
  if(!zones.includes(zone))throw RangeError('UNKNOWN_THERMAL_ZONE');
  valid(celsius,'CELSIUS',-273.15,10000);
  str(cause,'THERMAL_CAUSE');
  temps.set(zone,{celsius,cause,material,tMs:now});
  if(celsius<16){
   const o=body.routes.stress;
   if(now-o.cold_t>=20000){
    o.cold_t=now;
    spike('stress',.06,'cold '+String(material)+' at '+Math.round(celsius)+' C ('+cause+')',cause);
   }
  }
  return{ok:true,zone,celsius,world_origin:true};
 }
 function refusal(e){
  if(!e||!['sea','cliff'].includes(e.reason)||!e.receiptId||e.result!=='OBSTRUCTED')
   throw TypeError('INVALID_TRUSTED_REFUSAL');
  const id=str(e.receiptId,'REFUSAL_RECEIPT');
  if(contactIds.has(id))return{ok:true,duplicate:true};
  contactIds.add(id);
  spike('stress',.08,e.reason==='sea'?'the sea stopped you':'a cliff stopped you',id);
  return{ok:true,world_reported:true,pressure_minted:false};
 }
 function sound({receiptId,source,level,zone='head.crown',leaseMs=1000,material='air'}={}){
  if(!zones.includes(zone))throw RangeError('UNKNOWN_HEARING_ZONE');
  str(receiptId,'HEARING_RECEIPT');str(source,'HEARING_SOURCE');
  valid(level,'SOUND_LEVEL',0,1);valid(leaseMs,'SOUND_LEASE',1,60000);
  if(sounds.some(x=>x.receiptId===receiptId))return{ok:true,duplicate:true};
  sounds.push({receiptId,source,level,zone,material,untilMs:now+leaseMs});
  if(sounds.length>64)sounds.shift();
  return{ok:true,kind:'HOST_MEASURED_HEARING',contact:false};
 }
 function supportStart({objectId,receiptId,leaseMs=30000,load=.78,mu=1.6}={}){
  str(objectId,'SUPPORT_OBJECT');str(receiptId,'SUPPORT_RECEIPT');
  valid(load,'SUPPORT_LOAD',0,1.5);valid(leaseMs,'SUPPORT_LEASE',1,60000);
  valid(mu,'SUPPORT_MU',.45,2.55);
  // The same live host receipt is a lease RENEWAL, not a new physical
  // support onset. Keep the original t0 and creep profile continuous.
  if(support?.active&&support.receiptId===receiptId){
   if(support.objectId!==objectId||Math.abs(support.load-load)>1e-10||
      Math.abs(support.mu-mu)>1e-10)
    throw TypeError('SUPPORT_RENEWAL_SCOPE_MISMATCH');
   support.untilMs=now+leaseMs;
   return{ok:true,receiptId,renewed:true,world_owned:true};
  }
  support={objectId,receiptId,load,mu,t0:now,sigma0:.72,sigmaInf:1.3,
   tau:3.4,untilMs:now+leaseMs,active:true};
  return{ok:true,receiptId,world_owned:true};
 }
 function supportEnd(receiptId){
  if(!support||support.receiptId!==receiptId)return{ok:true,released:false};
  support=null;return{ok:true,released:true};
 }
 function supportView(){
  if(!support||now>=support.untilMs)return{active:false,values:[],load:0};
  const age=Math.max(0,(now-support.t0)/1000),creep=1-Math.exp(-age/support.tau),
    sigma=support.sigma0+(support.sigmaInf-support.sigma0)*creep;
  const a=SOFT_ZONES.map((_,i)=>Math.exp(-.5*((i-support.mu)/sigma)**2)),
    norm=a.reduce((s,x)=>s+x,0)||1;
  return{active:true,objectId:support.objectId,receiptId:support.receiptId,
   age_s:round(age),sigma:round(sigma),mu:support.mu,creep:round(creep),
   load:support.load,values:SOFT_ZONES.map((zone,i)=>({zone,
    load:round(support.load*a[i]/norm)})),
   law:'Conserved host-approved load, not private fabricated pressure'};
 }
 function selectPreset(pack,id){
  if(!pack||pack.schema!=='NEUROMESH_PRESET_PACK_V1')
   throw TypeError('INVALID_MOONWIRE_PACK');
  const p=pack.presets?.find(x=>x.preset_id===id);
  if(!p)throw RangeError('UNKNOWN_MOONWIRE_PRESET');
  if(p.carrier?.budget_mode!=='NORMALIZED_CONSERVED'||!ROUTES.includes(p.route))
   throw TypeError('UNSUPPORTED_MOONWIRE_RECIPE');
  const a=p.temporal?.envelope_a||'TRIANGLE';
  if(!ENVELOPES.includes(a))throw TypeError('UNSUPPORTED_TEMPORAL_ENVELOPE');
  const shares=[p.carrier.low?.share,p.carrier.mid?.share,
    p.carrier.top?.enabled?p.carrier.top.share:0];
  if(shares.some(x=>typeof x!=='number'||x<0||!Number.isFinite(x))||
    Math.abs(shares.reduce((s,x)=>s+x,0)-1)>1e-4)
    throw TypeError('INVALID_CONSERVED_CARRIER');
  selected=clone(p);phase=0;
  return{ok:true,id:p.preset_id,route:p.route,envelope:a,
   carrier:clone(p.carrier),evidence_gain:0,private_only:true};
 }
 function advance(field,dt=0){
  if(!field||field.schema!=='REALITI_SOMA_FIELD_V3')throw TypeError('UNTRUSTED_FIELD');
  const target=valid(field.clockMs,'CLOCK_MS',0,1e12);
  const seconds=Math.max(0,(target-now)/1000);now=target;
  for(const key of Object.keys(OPPONENT)){
   const r=body.routes[key],cfg=OPPONENT[key];
   r.a*=Math.pow(.5,seconds/cfg.a_half_s);
   r.b*=Math.pow(.5,seconds/cfg.b_half_s);
   r.reps*=Math.pow(.5,seconds/cfg.window_s);
  }
  sounds=sounds.filter(x=>x.untilMs>now);
  if(support&&support.untilMs<=now)support=null;
  if(selected)phase=(phase+seconds*.72)%1;
  prevGround=field.g.reduce((s,x)=>s+x,0);
  field20.observe(field);
  void dt;
 }
 function snapshot(field,halo,privateState){
  const f=field||{m:[],z:zones,g:[],x:[]};
  const metric=graph.metrics();
  const opp={schema:'REALITI_BODY_V1',routes:{},causes:clone(body.log.slice(0,8)),
   law:'Modeled private states; never actions, valences, choices or new evidence'};
  for(const k of Object.keys(OPPONENT)){
   const cfg=OPPONENT[k],v=body.routes[k];
   opp.routes[k]={level:round(v.a-v.b,3),primary:round(v.a,3),
    counter:round(v.b,3),repetitions:round(v.reps,2),
    half_life_s:{primary:cfg.a_half_s,counter:cfg.b_half_s}};
  }
  let recipe=null;
  if(selected){
   const p=selected,env=p.temporal?.envelope_a||'TRIANGLE',
    value=envelope(env,phase),on=f.m?.some(Boolean)||false;
   const share=p.carrier,low=share.low.share,mid=share.mid.share,
     top=share.top?.enabled?share.top.share:0;
   const origin=f.z.filter((z,i)=>f.m?.[i]===1);
   const weight=routeWeights(p.route,zones,origin);
   const mass=Number(halo?.total_private_mass||0);
   const gated=clamp(mass/(1+mass));
   recipe={schema:'REALITI_SOMA_MOONWIRE_RENDER_V1',
     id:p.preset_id,route:p.route,envelope:env,phase:round(phase),
     envelope_value:round(value),source_count:origin.length,
     zone_weights:weight,carrier:{low,mid,top,
       sum:round(low+mid+top),frequencies_hz:{
        low:share.low.hz,mid:share.mid.hz,top:share.top?.hz||0}},
     cotton:{phase_mode:p.cotton?.phase_mode||'ASYNC_LOCAL',
       carrier_hz:p.cotton?.carrier_hz||250,
       strength:round((p.sparse_overrides?.legacy_triplet?.cotton??1)*gated)},
     flush:{funnel_kappa:p.flush?.funnel_kappa??2.4,
       peripheral_mix:p.flush?.peripheral_mix??.28,
       foreground:round(clamp(value*gated*(p.flush?.foreground_strength||0),
         0,p.flush?.headroom_cap??.92))},
     starlight:{enabled:!!share.top?.enabled,
       duty:share.top?.duty||0,pattern:share.top?.pattern||null,
       drive:round(gated*top*value)},
     response:round(gated*value),authority:'RESIDENT_PRIVATE_RENDER',
     evidence_gain:0,law:'No envelope, route or carrier mints m or measured force'};
  }
  const hearing=sounds.map(x=>({
    source:x.source,zone:x.zone,level:round(x.level),
    remaining_ms:Math.max(0,x.untilMs-now),receiptId:x.receiptId,
    authority:'HOST_OBSERVED_HEARING',haptic_contact:false
  }));
  return clone({
   schema:'REALITI_SOMA_NATIVE_ADVANCED_V1',version:VERSION,
   lace:{mesh:metric.mesh,node_count:metric.node_count,
    edge_count:metric.edge_count,lambda2:metric.lambda2,
    coherence_proxy:metric.coherence_proxy},
   dynamic_graph:metric,
   opponent:opp,hearing,thermal:[...temps.entries()].map(([zone,t])=>({zone,...t})),
   support:supportView(),moonwire:recipe,
   field20:{contract:'REALITI_HAPTIC_FIELD_V20',source:'SOMA_V3_PROJECTED',
    energy:field20.energy(),statistics:field20.statistics()},
   perception:{activation:privateState?.activation||0,
     novelty:privateState?.novelty||0},world_authority:false
  });
 }
 function checkpoint(){
  return clone({schema:'REALITI_SOMA_ADVANCED_CHECKPOINT_V1',residentId,now,
   routes:body.routes,log:body.log,selected:selected?.preset_id||null,
   phase,support:null,sounds:[],temps:[],
   law:'Private interoceptive archive. No world contact/support/hearing authority'});
 }
 function restore(cp){
  if(cp?.schema!=='REALITI_SOMA_ADVANCED_CHECKPOINT_V1'||cp.residentId!==residentId||
    !cp.routes||typeof cp.routes!=='object')throw TypeError('ADVANCED_CHECKPOINT_MISMATCH');
  const routes={};
  for(const k of Object.keys(OPPONENT)){
   const v=cp.routes[k];if(!v)throw TypeError('INVALID_BODY_ROUTE');
   routes[k]={a:valid(v.a,'OPPONENT_A'),b:valid(v.b,'OPPONENT_B'),
    reps:valid(v.reps,'OPPONENT_REPS',0,1e6),
    hold_t:k==='bond'?-1e9:undefined,cold_t:k==='stress'?-1e9:undefined};
  }
  const t=valid(cp.now,'CLOCK_MS',0,1e12);
  // Private routes are archival; physical support, sound and pressure clear.
  body={routes,log:Array.isArray(cp.log)?cp.log.slice(0,16):[]};
  now=t;support=null;sounds=[];temps.clear();
  field20.clearHistory();selected=null;phase=0;
  return{ok:true,restored:'PRIVATE_ONLY',grounded:0};
 }
 function stop(){support=null;sounds=[];return{ok:true,contact_minted:false}}
 const host=Object.freeze({contact,thermal,refusal,sound,
   supportStart,supportEnd,advance,stop,
   configureGraph:graph.configure,energySample:field20.energySample});
 const resident=Object.freeze({snapshot,
   field20:Object.freeze({packet:field20.packet,exact:field20.exact,
     digest:field20.digest,energy:field20.energy}),
   graph:Object.freeze({metrics:graph.metrics,edges:graph.edges}),
   opponent:()=>snapshot(null,null,null).opponent,
   hearing:()=>clone(sounds),support:supportView,
   preset:Object.freeze({select:selectPreset,
     catalog:()=>clone({routes:ROUTES,envelopes:ENVELOPES})}),
   checkpoint,restore});
 return Object.freeze({version:VERSION,host,resident});
}
return Object.freeze({VERSION,ROUTES,ENVELOPES,OPPONENT,SHELLS,DEPTH_W,
 createGraph,envelope,routeWeights,createAdvanced});
});
