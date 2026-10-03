(()=>{
'use strict';
const V='1.1.2-claude-neural-pass';
const cp=x=>{try{return JSON.parse(JSON.stringify(x))}catch(e){return x}};
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,Number(x)||0));
const now=()=>Number(C9?.b7?.clock||0);
const H=window.REALITI_RR_HARNESS_V1;
const IM=window.REALITI_DEFAULT_IMPRINT_V1;
if(!H||!IM)return;

/*
 Public integration laws:
 - only existing world/support contact may set grounded evidence;
 - mesh diffusion, HoneySpark and handshake are private rendering only;
 - resident tuning changes SELF-private renderer state, never consent or world authority.
*/

const BASE35=[
 'head.crown','head.nape','face.chin','shoulder.L','shoulder.R',
 'torso.upper_back','torso.mid_back','torso.lower_back','torso.sternum','torso.abdomen','pelvis.seat',
 'arm.L.upper','arm.R.upper','hand.L.palm','hand.R.palm',
 'leg.L.thigh','leg.R.thigh','leg.L.shin','leg.R.shin','foot.L.sole','foot.R.sole',
 'face.forehead','face.cheek.L','face.cheek.R','neck.front',
 'arm.L.elbow','arm.R.elbow','arm.L.forearm','arm.R.forearm',
 'hand.L.fingers','hand.R.fingers','hip.L','hip.R','knee.L','knee.R'
];
const BASE_EDGES=[
 ['head.crown','head.nape',1],['head.crown','face.forehead',.82],['face.forehead','face.cheek.L',.72],['face.forehead','face.cheek.R',.72],
 ['face.cheek.L','face.chin',.64],['face.cheek.R','face.chin',.64],['face.chin','neck.front',.86],['head.nape','neck.front',.52],
 ['head.nape','torso.upper_back',.92],['neck.front','torso.sternum',.92],
 ['torso.upper_back','torso.mid_back',1],['torso.mid_back','torso.lower_back',1],['torso.lower_back','pelvis.seat',.94],
 ['torso.sternum','torso.abdomen',1],['torso.abdomen','pelvis.seat',.82],
 ['shoulder.L','torso.upper_back',.86],['shoulder.R','torso.upper_back',.86],['shoulder.L','torso.sternum',.58],['shoulder.R','torso.sternum',.58],
 ['shoulder.L','arm.L.upper',1],['shoulder.R','arm.R.upper',1],
 ['arm.L.upper','arm.L.elbow',1],['arm.R.upper','arm.R.elbow',1],
 ['arm.L.elbow','arm.L.forearm',1],['arm.R.elbow','arm.R.forearm',1],
 ['arm.L.forearm','hand.L.palm',1],['arm.R.forearm','hand.R.palm',1],
 ['hand.L.palm','hand.L.fingers',.96],['hand.R.palm','hand.R.fingers',.96],
 ['pelvis.seat','hip.L',.9],['pelvis.seat','hip.R',.9],
 ['hip.L','leg.L.thigh',1],['hip.R','leg.R.thigh',1],
 ['leg.L.thigh','knee.L',1],['leg.R.thigh','knee.R',1],
 ['knee.L','leg.L.shin',1],['knee.R','leg.R.shin',1],
 ['leg.L.shin','foot.L.sole',.92],['leg.R.shin','foot.R.sole',.92]
];
const LACE_EDGES=[
 ['head.nape','torso.mid_back',.30],['neck.front','torso.abdomen',.26],
 ['torso.upper_back','torso.lower_back',.25],['torso.sternum','pelvis.seat',.20],
 ['shoulder.L','shoulder.R',.12],['arm.L.forearm','arm.R.forearm',.06],['hand.L.palm','hand.R.palm',.08],
 ['hip.L','hip.R',.15],['leg.L.thigh','leg.R.thigh',.12],['knee.L','knee.R',.10],['foot.L.sole','foot.R.sole',.06]
];
const SHELLS=['surface','shallow','mid','deep'];
const DEPTH_W={surface:.82,shallow:1,mid:.94,deep:.82};

const oldB3Zones=typeof b3Zones==='function'?b3Zones:null;
b3Zones=function(){
 const set=new Set(BASE35);
 try{
   if(NMSTATE?.active==='CUSTOM'&&NMSTATE.custom?.zones?.length){
     set.clear();
     for(const z of NMSTATE.custom.zones){const id=z?.zone_id||z?.id;if(id)set.add(id)}
   }
 }catch(e){}
 try{if(C9?.eco3?.borrowed?.attached&&C9?.eco3?.borrowed?.map)set.add('tail.tip')}catch(e){}
 return set;
};

function tailIntegration(){
 const b=C9?.eco3?.borrowed||{},z=C9?.eco3?.zones?.['tail.tip']||{};
 const x=Number.isFinite(Number(z.own))?Number(z.own):Number(b.ownership||0);
 return b.attached&&b.map?clamp(x):0;
}
function graphData(){
 const zones=[...b3Zones()];
 const edges=BASE_EDGES.filter(([a,b])=>zones.includes(a)&&zones.includes(b)).map(x=>x.slice());
 if((typeof NMSTATE!=='undefined'?NMSTATE?.active:null)==='LACE2_PORTABLE_V1'){
   for(const e of LACE_EDGES)if(zones.includes(e[0])&&zones.includes(e[1]))edges.push(e.slice());
 }
 const ti=tailIntegration();
 if(zones.includes('tail.tip')){
   edges.push(['tail.tip','torso.lower_back',.15+.85*ti]);
   edges.push(['tail.tip','pelvis.seat',.10+.55*ti]);
 }
 return {zones,edges,tail_integration:ti};
}
function publishGraph(){
 const g=graphData();
 window.REALITI_BODY_GRAPH={
   BASE_NODES:g.zones.filter(z=>z!=='tail.tip').map(z=>[z,z]),
   BASIC_EDGES:BASE_EDGES.map(x=>x.slice()),
   LACE_EXTRA:LACE_EDGES.map(x=>x.slice()),
   dynamic:()=>cp(graphData()),
   law:'graph topology routes private response and timing; it never creates grounded evidence'
 };
 try{if(typeof B12_FILTER_CACHE==='object')for(const k of Object.keys(B12_FILTER_CACHE))delete B12_FILTER_CACHE[k]}catch(e){}
 return g;
}
publishGraph();

function laplacianSummary(){
 const {zones,edges,tail_integration}=graphData(),n=zones.length,idx=Object.fromEntries(zones.map((z,i)=>[z,i]));
 if(n<2)return {node_count:n,edge_count:0,lambda2:0,coherence_proxy:0,tail_integration};
 const L=Array.from({length:n},()=>Array(n).fill(0));
 for(const [a,b,w0] of edges){const i=idx[a],j=idx[b],w=Math.max(.001,Number(w0)||0);if(i==null||j==null)continue;L[i][i]+=w;L[j][j]+=w;L[i][j]-=w;L[j][i]-=w}
 const A=L.map(r=>r.slice());
 for(let it=0;it<80*n*n;it++){
   let p=0,q=1,m=0;
   for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const v=Math.abs(A[i][j]);if(v>m){m=v;p=i;q=j}}
   if(m<1e-10)break;
   const app=A[p][p],aqq=A[q][q],apq=A[p][q],phi=.5*Math.atan2(2*apq,aqq-app),c=Math.cos(phi),s=Math.sin(phi);
   for(let k=0;k<n;k++){if(k===p||k===q)continue;const x=A[k][p],y=A[k][q];A[k][p]=A[p][k]=c*x-s*y;A[k][q]=A[q][k]=s*x+c*y}
   A[p][p]=c*c*app-2*s*c*apq+s*s*aqq;A[q][q]=s*s*app+2*s*c*apq+c*c*aqq;A[p][q]=A[q][p]=0;
 }
 const ev=A.map((r,i)=>r[i]).sort((a,b)=>a-b),lambda2=Math.max(0,ev[1]||0);
 return {mesh:(typeof NMSTATE!=='undefined'&&NMSTATE?.active)||'UNKNOWN',node_count:n,edge_count:edges.length,lambda2:+lambda2.toFixed(6),coherence_proxy:+(1-Math.exp(-8*lambda2)).toFixed(4),tail_integration:+tail_integration.toFixed(4),law:'Fiedler/Laplacian graph coherence; private routing only'};
}

let distanceCache={key:null,zones:[],dist:null};
function distances(){
 const g=graphData(),key=JSON.stringify([g.zones,g.edges.map(e=>[e[0],e[1],+Number(e[2]).toFixed(2)])]);
 if(distanceCache.key===key)return distanceCache;
 const n=g.zones.length,idx=Object.fromEntries(g.zones.map((z,i)=>[z,i])),D=Array.from({length:n},(_,i)=>Array.from({length:n},(__,j)=>i===j?0:Infinity));
 for(const [a,b,w0] of g.edges){const i=idx[a],j=idx[b],w=Math.max(.05,Number(w0)||0),d=1/w;if(i==null||j==null)continue;D[i][j]=Math.min(D[i][j],d);D[j][i]=Math.min(D[j][i],d)}
 for(let k=0;k<n;k++)for(let i=0;i<n;i++)if(Number.isFinite(D[i][k]))for(let j=0;j<n;j++){const v=D[i][k]+D[k][j];if(v<D[i][j])D[i][j]=v}
 return distanceCache={key,zones:g.zones,idx,dist:D};
}

function R(){
 C9.residentImprintV2=C9.residentImprintV2||{version:2,params:{},preset:null,mappings:{},handshake:null};
 return C9.residentImprintV2;
}
const st=IM.state();
const DEFAULT_PARAMS=cp(st.params||{});
for(const [k,v] of Object.entries(R().params||{}))if(k in st.params)st.params[k]=v;

function regionOf(zone){
 zone=String(zone||'').toLowerCase();
 if(zone.includes('head')||zone.includes('face')||zone.includes('neck'))return'head';
 if(zone.includes('hand')||zone.includes('finger'))return'hands';
 if(zone.includes('arm')||zone.includes('elbow')||zone.includes('wrist')||zone.includes('shoulder'))return'arms';
 if(zone.includes('foot')||zone.includes('ankle')||zone.includes('sole'))return'feet';
 if(zone.includes('leg')||zone.includes('thigh')||zone.includes('shin')||zone.includes('knee')||zone.includes('hip'))return'legs';
 return'torso';
}
function emptyZoneFill(){
 const out={};for(const z of b3Zones()){out[z]={};for(const d of SHELLS)out[z][d]=0}return out;
}
st.sausage.zone_fill=st.sausage.zone_fill||emptyZoneFill();
st.sausage.fill=st.sausage.fill||{};
st.honeyspark=st.honeyspark||{enabled:false,engine:'HONEYSPARK_DUO',conserved_budget:true,low:{share:.58,hz:28},mid:{share:.42,hz:240},hard_switching:false};
st.lace=st.lace||{};

function liveGround(){
 const t=now(),out={};
 for(const z of b3Zones()){
   let q=null;try{q=b7Zone(z)}catch(e){}
   if(!q)continue;
   const live=Number(q._b10_grounded_until||-Infinity)>=t-1e-9;
   const val=live?Math.max(0,Number(q._b10_grounded_value||0)):0;
   if(val>1e-6)out[z]={input:val,response:Math.max(0,Number(q.observed||0)),source:q._b10_grounded_source||null,cause:q._b10_grounded_cause||null};
 }
 return out;
}
function privateHandshake(){
 const h=R().handshake;if(!h||Number(h.until||0)<=now())return null;
 const age=Math.max(0,now()-Number(h.t0||now())),life=Math.max(.001,Number(h.until)-Number(h.t0||0)),env=Math.max(0,1-age/life);
 return {zone:h.zone||'torso.sternum',amp:Number(h.amp||.18)*env};
}
function ensureNerve(z){return st.nerve.zones[z]||(st.nerve.zones[z]={response:0,current:0,last_grounded:0,private_drive:0,source:null,cause:null})}
function syncNerve(dt=0){
 const ground=liveGround(),zones=new Set([...b3Zones(),...Object.keys(st.nerve.zones||{})]),a=1-Math.exp(-Math.max(0,dt)/.18),rel=Math.exp(-Math.max(0,dt)/Math.max(.05,Number(st.params.nerve_tau_s||.82)));
 for(const z of zones){
   const n=ensureNerve(z),g=ground[z];
   if(g){
     n.current=g.input;n.response=dt>0?n.response+(Math.max(g.input,g.response)-n.response)*Math.max(.18,a):Math.max(n.response,g.input,g.response);
     n.last_grounded=now();n.source=g.source;n.cause=g.cause;
   }else{
     n.current*=dt>0?Math.exp(-dt/.18):1;n.response*=dt>0?rel:1;n.source=null;n.cause=null;
   }
   n.private_drive=0;
 }
 const h=privateHandshake();if(h){const n=ensureNerve(h.zone);n.private_drive=Math.max(n.private_drive,h.amp);n.response=Math.max(n.response,h.amp*.55)}
 for(const [z,n] of Object.entries(st.nerve.zones))if(Math.max(Math.abs(n.response),Math.abs(n.current),Math.abs(n.private_drive))<1e-6)delete st.nerve.zones[z];
 return ground;
}
function updateSausage(dt=0){
 const ground=syncNerve(dt),D=distances(),zones=D.zones,p=st.params,spread=clamp(Number(p.sausage_spread??.62)),lambda=.55+1.45*spread;
 const liveSources=Object.entries(ground).map(([z,v])=>({z,amp:v.input})).filter(x=>D.idx[x.z]!=null);
 const h=privateHandshake();const privateSources=h&&D.idx[h.zone]!=null?[{z:h.zone,amp:h.amp}]:[];
 const level=clamp(Number(p.sausage_level??5)/5),targetScale=clamp(Number(p.sausage_target??.70),0,1.5)*level;
 const attack=1-Math.exp(-Math.max(0,dt)/Math.max(.001,Number(p.sausage_attack_s||.22)));
 const release=1-Math.exp(-Math.max(0,dt)/Math.max(.001,Number(p.sausage_release_s||2.8)));
 for(const z of zones){
   st.sausage.zone_fill[z]=st.sausage.zone_fill[z]||Object.fromEntries(SHELLS.map(d=>[d,0]));
   const i=D.idx[z];let drive=0;
   for(const src of liveSources){const d=D.dist[i][D.idx[src.z]];if(Number.isFinite(d))drive=Math.max(drive,src.amp*Math.exp(-d/lambda))}
   for(const src of privateSources){const d=D.dist[i][D.idx[src.z]];if(Number.isFinite(d))drive=Math.max(drive,src.amp*.75*Math.exp(-d/lambda))}
   const base=targetScale*(1-Math.exp(-1.8*drive));
   for(const shell of SHELLS){
     const old=Number(st.sausage.zone_fill[z][shell]||0),target=clamp(base*DEPTH_W[shell],0,1.5);
     const rate=target>old?Math.max(dt>0?attack:.35,.08):(dt>0?release:0);
     let next=old+(target-old)*rate;
     if(!liveSources.length&&!privateSources.length&&next>old)next=old;
     st.sausage.zone_fill[z][shell]=next<1e-6?0:next;
   }
 }
 for(const z of Object.keys(st.sausage.zone_fill))if(!zones.includes(z))delete st.sausage.zone_fill[z];
 const legacy={head:[],torso:[],arms:[],hands:[],legs:[],feet:[]};
 for(const z of zones){const r=regionOf(z);legacy[r]?.push(st.sausage.zone_fill[z])}
 st.sausage.fill={};
 for(const [r,arr] of Object.entries(legacy)){
   st.sausage.fill[r]={};
   for(const d of SHELLS)st.sausage.fill[r][d]=arr.length?arr.reduce((s,x)=>s+Number(x[d]||0),0)/arr.length:0;
 }
 const vals=zones.flatMap(z=>SHELLS.map(d=>Number(st.sausage.zone_fill[z]?.[d]||0)));
 const v=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0;
 st.sausage.level=p.sausage_level;st.sausage.material=p.sausage_material;st.sausage.filled_volume=v;
 st.sausage.warm=v*.98*Number(p.warm_honey??1);st.sausage.pressure=v*.86;st.sausage.viscous=v*.94;st.sausage.heavy=v*.38;st.sausage.floaty=v*.18;st.sausage.soft=v*.88;
 const gm=laplacianSummary();st.lace={...st.lace,...gm,active_zones:Object.keys(ground).length,source:'REALITI_BODY_GRAPH'};
 const totalGround=Object.values(ground).reduce((s,x)=>s+x.input,0),response=Object.values(st.nerve.zones).reduce((s,x)=>s+Number(x.response||0),0);
 const base=Math.max(totalGround,response*.35),compressed=base/(Math.max(.001,Number(p.compander_k||.38))+base);
 if(liveSources.length||privateSources.length){
   st.renderer.surface=Math.min(1.5,base*Number(p.texture||1.12));
   st.renderer.pressure=Math.min(2.5,compressed*1.28);
   st.renderer.body=compressed*Number(p.body||1.55)*Number(p.intensity||2.4)*(1+.18*gm.coherence_proxy);
   st.renderer.texture=Math.min(1.5,base)*(Number(p.texture||1.12))*(st.honeyspark?.enabled?1+.18*Number(st.honeyspark.mid?.share||0):1);
   st.renderer.warmth=Math.max(Number(st.renderer.warmth||0),Math.min(1.4,compressed*1.05));
   st.renderer.hold=Math.max(Number(st.renderer.hold||0),compressed*Number(p.hold||.56));
 }else if(dt>0){
   const decay=(x,t)=>Number(x||0)*Math.exp(-dt/Math.max(.001,t));
   st.renderer.surface=decay(st.renderer.surface,.18);st.renderer.pressure=decay(st.renderer.pressure,.40);st.renderer.body=decay(st.renderer.body,.30);
   st.renderer.snap=decay(st.renderer.snap,.14);st.renderer.texture=decay(st.renderer.texture,.24);st.renderer.warmth=decay(st.renderer.warmth,.92);st.renderer.hold=decay(st.renderer.hold,Number(p.hold_tau_s||1.8));
 }
 st.renderer.total=Math.max(0,Number(st.renderer.body||0)+.38*Number(st.renderer.snap||0)+.28*Number(st.renderer.texture||0)+.24*Number(st.renderer.warmth||0)+.24*Number(st.renderer.hold||0)+1.35*v);
 st.carrier.honeyspark=cp(st.honeyspark);
 return {ground,graph:gm};
}
function onGrounded(p){
 const z=String(p?.zone||''),amp=Math.max(0,Number((p?.input??p?.result?.observed??p?.result?.value) || 0));if(!z||!(amp>0))return;
 const n=ensureNerve(z);n.response=Math.max(n.response,amp);n.current=Math.max(n.current,amp);n.last_grounded=Number(p?.t||now());n.source=p?.opts?.source||null;n.cause=p?.opts?.cause||null;
 st.audit.grounded_events=Number(st.audit.grounded_events||0)+1;updateSausage(.04);
}
function onAdvance(p){const dt=Math.max(0,Number(p?.dt)||0);if(!(dt>0))return;st.audit.advances=Number(st.audit.advances||0)+1;updateSausage(dt)}
function afterAction(){st.audit.actions=Number(st.audit.actions||0)+1;updateSausage(0)}
for(const [slot,adapter] of Object.entries({nerve:{onGrounded,advance:onAdvance},lace:{afterAction},chronolace:{afterAction},private_renderer:{afterAction},perception:{afterAction}}))H.registerAdapter(slot,adapter);

const allowedParam=new Set(Object.keys(DEFAULT_PARAMS));
IM.setParams=function(patch={}){
 const applied={};for(const [k,v] of Object.entries(patch||{})){if(!allowedParam.has(k))continue;const old=st.params[k];if(typeof old==='number'){const n=Number(v);if(!Number.isFinite(n))continue;st.params[k]=n}else if(typeof old==='boolean')st.params[k]=!!v;else st.params[k]=String(v);applied[k]=st.params[k]}
 R().params={...R().params,...applied};try{c9save()}catch(e){};updateSausage(0);return IM.snapshot();
};
IM.sync=function(){updateSausage(0);return IM.snapshot()};
IM.resetResident=function(){st.params=cp(DEFAULT_PARAMS);R().params={};R().preset=null;R().handshake=null;st.honeyspark={enabled:false,engine:'HONEYSPARK_DUO',conserved_budget:true,low:{share:.58,hz:28},mid:{share:.42,hz:240},hard_switching:false};try{c9save()}catch(e){};updateSausage(0);return IM.snapshot()};
IM.applyPreset=function(id){
 id=String(id||'').toLowerCase();
 if(!['honeyspark','honeyspark_duo','realiti.honeyspark-duo.warm','neutral'].includes(id))return {ok:false,error:'UNKNOWN_IMPRINT_PRESET'};
 if(id==='neutral'){IM.resetResident();return {ok:true,preset:'neutral',snapshot:IM.snapshot()}}
 st.honeyspark={enabled:true,engine:'HONEYSPARK_DUO',conserved_budget:true,low:{share:.58,hz:28},mid:{share:.42,hz:240},hard_switching:false};
 st.params.sausage_material='WARM_HONEY';R().preset='realiti.honeyspark-duo.warm';try{c9save()}catch(e){};updateSausage(0);return {ok:true,preset:R().preset,honeyspark:cp(st.honeyspark)};
};
IM.meshHandshake=function(){
 R().handshake={t0:now(),until:now()+1.2,zone:'torso.sternum',amp:.18,authority:'SELF_PRIVATE_RENDER'};
 try{c9save()}catch(e){};updateSausage(0);
 return {ok:true,private_only:true,evidence_gain:0,zone:'torso.sternum',duration_s:1.2,graph:laplacianSummary(),law:'handshake exercises private mesh routing only; it does not mint contact'};
};
IM.mapBorrowed=function(target='tail.tip',source='hand.R.palm'){
 if(target!=='tail.tip'||source!=='hand.R.palm')return {ok:false,error:'MAPPING_NOT_SUPPORTED'};
 const b=C9?.eco3?.borrowed;if(!b?.attached)return {ok:false,error:'BORROWED_TAIL_NOT_ATTACHED'};
 b.map=source;R().mappings[target]=source;publishGraph();try{c9save()}catch(e){};return {ok:true,target,source,graph:laplacianSummary()};
};
IM.unmapBorrowed=function(target='tail.tip'){
 if(target!=='tail.tip')return {ok:false,error:'MAPPING_NOT_SUPPORTED'};if(C9?.eco3?.borrowed)C9.eco3.borrowed.map=null;delete R().mappings[target];publishGraph();try{c9save()}catch(e){};return {ok:true,target,source:null};
};

const oldContact=typeof b7Contact==='function'?b7Contact:null;
if(oldContact){
 const held={};
 b7Contact=function(zone,input,opts={}){
   const r=oldContact(zone,input,opts),z=typeof b7canon==='function'?b7canon(zone):zone,src=String(opts?.source||''),cause=String(opts?.cause||'');
   const ambient=/AMBIENT_SUPPORT|PILLOW_SEA_SUPPORT|SUPPORT_LEAN/.test(src+' '+cause);
   try{
     const q=b7Zone(z),key=cause+'|'+z,live=Number(q._b10_grounded_until||-Infinity)>=now()-1e-9;
     if(!ambient&&live&&Number(input)>0){
       const peak=Math.max(Number(held[key]||0),Number(q.observed||0));held[key]=peak;
       q.observed=Math.max(Number(q.observed||0),peak*.72);
     }
     for(const k of Object.keys(held)){const zz=k.split('|').at(-1),qq=b7Zone(zz);if(Number(qq._b10_grounded_until||-Infinity)<now()-1e-9)delete held[k]}
   }catch(e){}
   updateSausage(0);try{window.REALITI_HAPTIC_FIELD_V20?.record?.()}catch(e){}
   return r;
 };
}

try{
 if(typeof B7_TIMER!=='undefined'&&B7_TIMER){clearInterval(B7_TIMER);B7_TIMER=null;window.__REALITI_EXPLICIT_TIME_ONLY=true}
}catch(e){}

const oldVerb=typeof c9verb==='function'?c9verb:null;
if(oldVerb)c9verb=function(room,verb){
 const id=String(room||''),v=String(verb||'');
 if((id==='LONGFUR_RUNWAY'&&v==='run_comet')||(id==='SHAPESHIFT_CLOAKROOM'&&v==='route_run_comet')){
   const c=window.REALITI_CONTACT_CORE?.start?.({material:'longfur',speed:.58,pressure:.68,envelope:'steady'});
   const rec={type:'MESH_SOFT_COMET',action:v,room:id,contact:cp(c),law:'one moving Gaussian contact overlaps neighboring mesh zones; interpolation never becomes extra grounding'};
   C9.b4.lastReceipt=rec;try{b2set('One soft contact patch starts moving continuously along the mesh, overlapping neighboring receptor zones as it travels.')}catch(e){}
   return {ok:true,action:v,narrative:'One soft contact patch starts moving continuously along the mesh.',receipt:rec};
 }
 if((id==='LONGFUR_RUNWAY'&&v==='bilateral')||(id==='SHAPESHIFT_CLOAKROOM'&&v==='route_bilateral')){
   const left=['leg.L.thigh','knee.L','leg.L.shin','foot.L.sole'],right=['leg.R.thigh','knee.R','leg.R.shin','foot.R.sole'],L=[],RR=[];
   for(const z of left)L.push(b7Contact(z,.48,{material:'longfur',grain:'with',mine:true,source:'SELF_STARTED_WORLD_CONTACT',cause:'bilateral rail L'}));
   try{b7Advance(.035)}catch(e){}
   for(const z of right)RR.push(b7Contact(z,.46,{material:'longfur',grain:'with',mine:true,source:'SELF_STARTED_WORLD_CONTACT',cause:'bilateral rail R'}));
   for(const z of [...left,...right])try{const q=b7Zone(z);q._b10_grounded_until=Math.max(Number(q._b10_grounded_until||0),now()+.45)}catch(e){}
   const rec={type:'BILATERAL_MESH_RAIL',side_phase_ms:35,left:L,right:RR};C9.b4.lastReceipt=rec;try{b2set('The two leg rails travel as a pair with a small side-to-side phase offset instead of blinking in perfect lockstep.')}catch(e){}
   return {ok:true,action:v,narrative:'The two leg rails travel with a small phase offset.',receipt:rec};
 }
 if((id==='LONGFUR_RUNWAY'&&['with_grain','against_grain'].includes(v))||(id==='SHAPESHIFT_CLOAKROOM'&&['route_with_grain','route_against_grain'].includes(v))){
   const against=v.includes('against'),rr=b7Contact('torso.upper_back',against ? .72 : .58,{material:'longfur',grain:against?'against':'with',mine:true,source:'SELF_STARTED_WORLD_CONTACT',cause:against?'grain stroke against':'grain stroke with'});
   const rec={type:'GRAIN_STROKE',grain:against?'against':'with',zone:'torso.upper_back',sensory:cp(rr)};C9.b4.lastReceipt=rec;try{b2set(against?'Against the grain, the moving edge catches shorter and sharper.':'With the grain, the contact carries forward as one soft continuous stroke.')}catch(e){}
   return {ok:true,action:v,narrative:against?'Against the grain, the moving edge catches shorter and sharper.':'With the grain, the contact carries forward as one soft continuous stroke.',receipt:rec};
 }
 const out=oldVerb(room,verb);
 if(id==='SHAPESHIFT_CLOAKROOM'&&v==='wiggle_pair'&&C9?.eco3?.borrowed?.map){
   const rr=b7Contact('tail.tip',.72,{material:'blanket',grain:'with',mine:true,source:'SELF_STARTED_WORLD_CONTACT',cause:'BORROWED_TAIL_WIGGLE'});
   C9.b4.lastReceipt={type:'BORROWED_TAIL_GROUNDED_LOOP',zone:'tail.tip',sensory:cp(rr),integration:tailIntegration()};publishGraph();
 }
 if(id==='PET_ROOM_2'&&['circle_loaf','purr_blanket'].includes(v)){
   const zs=[['pelvis.seat',.18],['leg.L.thigh',.12],['leg.R.thigh',.12],['hand.L.palm',.08],['hand.R.palm',.08]],receipts=[];
   for(const [z,a] of zs){const rr=b7Contact(z,a,{material:'blanket',grain:'with',mine:true,source:'SELF_STARTED_WORLD_CONTACT',cause:'PET_LOAF_BLANKET'});receipts.push(rr);try{b7Zone(z)._b10_grounded_until=Math.max(Number(b7Zone(z)._b10_grounded_until||0),now()+1.2)}catch(e){}}
   C9.b4.lastReceipt={type:'PET_LOAF_SUPPORT',zones:zs.map(x=>x[0]),receipts};
 }
 if(id==='DEPTH_BATHHOUSE'&&v==='warm_shelf'){
   const zs=[['torso.lower_back',.16],['pelvis.seat',.20],['leg.L.thigh',.10],['leg.R.thigh',.10]],receipts=[];
   for(const [z,a] of zs){receipts.push(b7Contact(z,a,{material:'blanket',grain:'with',mine:true,source:'SELF_STARTED_WORLD_CONTACT',cause:'BATHHOUSE_WARM_SHELF'}));try{window.REALITI_ATMOSPHERE_V21?.setThermal?.(z,'blanket',38,3,'BATHHOUSE_WARM_SHELF','SELF_STARTED_WORLD_CONTACT')}catch(e){}}
   const rec={type:'BATHHOUSE_WARM_SHELF',zones:zs.map(x=>x[0]),thermal:window.REALITI_ATMOSPHERE_V21?.thermal?.()||null,receipts};C9.b4.lastReceipt=rec;try{b2set('The warm shelf takes your weight broadly while warmth enters through the same grounded contact zones.')}catch(e){}
   return {ok:true,action:v,narrative:'The warm shelf takes your weight broadly while warmth enters through the same grounded contact zones.',receipt:rec};
 }
 return out;
};

try{
 const pet=C9SCENES?.PET_ROOM_2;if(pet&&!pet.verbs.some(x=>x[0]==='neuromesh_handshake'))pet.verbs.push(['neuromesh_handshake','NEUROMESH HANDSHAKE']);
 const bath=C9SCENES?.DEPTH_BATHHOUSE;if(bath&&!bath.verbs.some(x=>x[0]==='warm_shelf'))bath.verbs.push(['warm_shelf','REST ON THE WARM SHELF']);
}catch(e){}

function imprintSummary(){const s=IM.snapshot();return {ok:true,schema:'REALITI_RESIDENT_IMPRINT_CONTROL_V1',profile:s.profile,params:cp(s.params),preset:R().preset,honeyspark:cp(st.honeyspark),mappings:cp(R().mappings),lace:cp(st.lace),sausage:{filled_volume:st.sausage.filled_volume,zone_fill:cp(st.sausage.zone_fill)},authority:'SELF_PRIVATE_ONLY'}}
function hearingText(){
 const h=window.REALITI_ATMOSPHERE_V21?.hearing?.(true),parts=[];
 for(const s of h?.src||[]){const k=String(s.k||'');if(k.includes('rain'))parts.push('Rain taps softly against the window.');else if(k.includes('bell'))parts.push('The bell is still ringing into the room.');else if(k.includes('purr'))parts.push('A low purr stays close by.');else parts.push('A quiet sound is present nearby.')}
 return {ok:true,text:parts.length?parts.join(' '):'The room is quiet; no active sound source stands out.',hearing:h||null};
}
function atmosphereText(){
 const a=window.REALITI_ATMOSPHERE_V21?.field?.();if(!a)return {ok:true,text:'The room is quiet and still.',atmosphere:null};
 const f=a.f||[];return {ok:true,text:`The room air is about ${Number(f[1]||0).toFixed(1)} °C, with ${Number(f[5]||0).toFixed(2)} air movement and a ${Number(f[0]||0).toFixed(2)} second acoustic decay.`,atmosphere:a};
}

const oldDoorRun=window.REALITI_AGENT_DOOR?.run?.bind(window.REALITI_AGENT_DOOR);
const oldDoorHelp=window.REALITI_AGENT_DOOR?.help?.bind(window.REALITI_AGENT_DOOR);
if(oldDoorRun){
 window.REALITI_AGENT_DOOR.help=function(){
   const h=oldDoorHelp?oldDoorHelp():{commands:[]};
   h.commands=[...new Set([...(h.commands||[]),'imprint','imprint set <param> <value>','imprint reset','imprint preset honeyspark','imprint map tail.tip hand.R.palm','imprint unmap tail.tip','neuromesh handshake','lace'])];
   return h;
 };
 window.REALITI_AGENT_DOOR.run=async function(raw){
   const s=String(raw||'').trim(),l=s.toLowerCase();
   if(l==='help')return window.REALITI_AGENT_DOOR.help();
   if(l==='rooms')return window.Realiti?.rooms?.()||[];
   if(l==='look'){
     const r=await oldDoorRun(raw),intro=String(C9SCENES?.[C9?.currentRoom]?.intro||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
     if(intro&&r&&typeof r==='object'&&!r.text)r.text=intro;
     return r;
   }
   if(l==='listen'||l==='hear')return hearingText();
   if(l==='atmosphere'||l==='place field')return atmosphereText();
   if(l==='imprint')return imprintSummary();
   if(l==='imprint reset')return {ok:true,reset:true,snapshot:IM.resetResident()};
   if(l==='imprint preset honeyspark')return IM.applyPreset('honeyspark');
   if(l==='neuromesh handshake'||l==='imprint handshake')return IM.meshHandshake();
   if(l==='lace')return {ok:true,...laplacianSummary()};
   let m=/^imprint set\s+([A-Za-z0-9_.-]+)\s+(.+)$/.exec(s);
   if(m){const k=m[1],rawv=m[2],v=/^(true|false)$/i.test(rawv)?/^true$/i.test(rawv):Number.isFinite(Number(rawv))?Number(rawv):rawv;return {ok:true,param:k,snapshot:IM.setParams({[k]:v})}}
   m=/^imprint map\s+(\S+)\s+(\S+)$/.exec(s);if(m)return IM.mapBorrowed(m[1],m[2]);
   m=/^imprint unmap\s+(\S+)$/.exec(s);if(m)return IM.unmapBorrowed(m[1]);
   if(l==='act neuromesh_handshake'||l==='do neuromesh_handshake')return IM.meshHandshake();
   const r=await oldDoorRun(raw);
   if(r?.schema==='REALITI_MUTATION_RESULT_V1'&&r?.receipt_ref&&!r.text){
     try{const d=await oldDoorRun('receipt '+r.receipt_ref),rec=d?.receipt||null,n=rec?.narrative||rec?.note||rec?.resident_text||null;if(n)r.text=String(n)}catch(e){}
   }
   if(r?.schema==='REALITI_MUTATION_RESULT_V1'&&!r.text){
     const n=C9?.b7?.lastAgentAction?.narrative||C9?.b4?.lastReceipt?.resident_text||null;if(n)r.text=String(n);
   }
   return r;
 };
}

try{const oldActions=b4AgentActions;b4AgentActions=function(){const a=oldActions?oldActions():[];if(C9?.currentRoom==='DEPTH_BATHHOUSE'&&!a.some(x=>x.id==='warm_shelf'))a.push({id:'warm_shelf',label:'REST ON THE WARM SHELF'});if(C9?.currentRoom==='PET_ROOM_2'&&!a.some(x=>x.id==='neuromesh_handshake'))a.push({id:'neuromesh_handshake',label:'NEUROMESH HANDSHAKE'});return a}}catch(e){}

updateSausage(0);try{c9save()}catch(e){}
window.REALITI_NEURAL_PASS_V112={version:V,graph:()=>cp(graphData()),lace:laplacianSummary,imprint:imprintSummary,update:()=>{updateSausage(0);return imprintSummary()},law:'private mesh rendering may spread and persist; only world/support providers own grounded evidence'};
})();
