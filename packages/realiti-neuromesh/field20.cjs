/* SOMA 3.3: standalone REALITI Haptic Field V20 perceptual contract.
 * Frame selection, JND quantization, history cuts and digest preserve
 * source/scripts/31.js numerical law. Values originate from the host-approved
 * portable field, not automatically from native B10/B18 physics.
 * AGPL-3.0-only.
 */
(function(root,factory){
 'use strict';
 const out=factory();
 if(typeof module==='object'&&module.exports)module.exports=out;
 else root.REALITI_SOMA_FIELD20_V1=out;
})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const VERSION='1.0.0',W=.26,MAXH=192,MAXF=7,EPS=1e-9;
const J=Object.freeze({a:.03,v:.04,r:.03,e:.03,g:.05});
const cp=x=>JSON.parse(JSON.stringify(x));
const clip=(x,lo=0,hi=1)=>Math.max(lo,Math.min(hi,x));
const qi=(x,j,lo=-99,hi=99)=>Math.max(lo,Math.min(hi,Math.round(Number(x||0)/j)));
const finite=(x,name)=>{if(typeof x!=='number'||!Number.isFinite(x))throw TypeError('INVALID_'+name);return x};
function perceptualDelta(a,b){
 if(!a||!b)return Infinity;
 if(a.epoch!==b.epoch)return Infinity;
 const zs=new Set([...(a.zs||[]),...(b.zs||[])]);
 let mx=0;
 for(const z of zs){
  const A=a.by?.[z]||{},Bz=b.by?.[z]||{};
  mx=Math.max(mx,Math.abs(Number(Bz.a||0)-Number(A.a||0))/J.a,
    Math.abs(Number(Bz.v||0)-Number(A.v||0))/J.v,
    Math.abs(Number(Bz.r||0)-Number(A.r||0))/J.r,
    Math.abs(Number(Bz.e||0)-Number(A.e||0))/J.e,
    Math.abs(Number(Bz.g||0)-Number(A.g||0))/J.g,
    Number(A.m)!==Number(Bz.m)?99:0);
 }
 return mx;
}
function centroid(zs,by,key){
 let s=0,w=0;
 for(let i=0;i<zs.length;i++){
  const v=by[zs[i]]||{},a=key==='contact'?(v.m?Math.max(.001,v.gv):0)
    :Math.max(0,v.a)+.35*Math.max(0,v.r);
  if(a>0){s+=i*a;w+=a}
 }
 return w>EPS?s/w:null;
}
function createField20({zones=[]}={}){
 if(!Array.isArray(zones)||!zones.length||zones.length>128||
    zones.some(x=>typeof x!=='string'||!x))throw TypeError('INVALID_FIELD20_ZONES');
 const zs=zones.slice();let history=[],epoch=0,last=null,digestTime=0,stats={packets:0,samples:0,cuts:0};
 let meter={supported:false,initial:null,input:0,stored:null,dissipated:0,residual:0,violations:0,lastPower:null,lastTime:null};
 function observe(field){
  if(field?.schema!=='REALITI_SOMA_FIELD_V3'||
      !Array.isArray(field.z)||!Array.isArray(field.m)||field.z.length!==field.m.length)
    throw TypeError('EXPECTED_TRUSTED_SOMA_FIELD');
  const fz=new Map(field.z.map((z,i)=>[z,i]));
  if(zs.some(z=>!fz.has(z)))throw TypeError('FIELD20_TOPOLOGY_MISMATCH');
  const t=finite(field.clockMs,'CLOCK')/1000;
  if(t<(last?.t||0)-EPS)throw TypeError('FIELD20_TIME_REVERSED');
  const by={};
  for(const z of zs){
   const i=fz.get(z),x=field.x[i],n=field.nerve?.[i]||{};
   if(!Array.isArray(x)||x.length!==3)throw TypeError('FIELD20_RESPONSE_SHAPE');
   const m=field.m[i]===1?1:0;
   by[z]={
     a:clip(Number(x[0]||0),0,1.8),v:clip(Number(x[1]||0),-1,1),
     r:clip(Number(x[2]||0),0,1.8),m,
     e:clip(Number(field.e[i]||0),-1.5,1.5),
     g:m?(String(field.grounded?.find(q=>q.zone===z)?.source||'').startsWith('SELF')?1/1.45:1):0,
     gv:m?Math.max(0,Number(field.g[i]||0)):0,
     source:m?field.grounded?.find(q=>q.zone===z)?.source||null:null,
     cause:m?field.grounded?.find(q=>q.zone===z)?.cause||null:null
   };
   void n;
  }
  const ag=Object.values(by).some(x=>x.m===1);
  const sig=zs.map(z=>by[z].m?String(by[z].cause||'?'):'').filter(Boolean).sort().join('|');
  if(last&&((last.ag&&!ag)||(last.sig&&sig&&last.sig!==sig))){epoch++;stats.cuts++}
  const frame={t,epoch,zs:zs.slice(),by,ag,sig,
    cc:centroid(zs,by,'contact'),cf:centroid(zs,by,'field')};
  if(last&&Math.abs(t-last.t)<EPS&&history.length)history[history.length-1]=frame;
  else history.push(frame);
  if(history.length>MAXH)history.splice(0,history.length-MAXH);
  last=frame;stats.samples++;
  return {ok:true,t,epoch,samples:history.length};
 }
 function latest(){return last}
 function windowHistory(){return last?history.filter(s=>last.t-s.t<=W+EPS):[]}
 function chooseFrames(){
  const h=windowHistory();
  if(!h.length)return [];
  const picked=[h[0]];let anchor=h[0];
  for(let i=1;i<h.length-1;i++){
    if(perceptualDelta(anchor,h[i])>=1){picked.push(h[i]);anchor=h[i]}
  }
  if(h.length>1&&picked[picked.length-1]!==h[h.length-1])picked.push(h[h.length-1]);
  if(picked.length===2&&perceptualDelta(picked[0],picked[1])<1)return[picked[1]];
  if(picked.length<=MAXF)return picked;
  const out=[];for(let i=0;i<MAXF;i++)out.push(picked[Math.round(i*(picked.length-1)/(MAXF-1))]);
  return [...new Set(out)];
 }
 function activeZones(frames){
  const all=frames[frames.length-1]?.zs||[],out=[];
  for(const z of all){
   let on=false;
   for(const s of frames){
    const v=s.by[z]||{};
    if(v.m||Math.abs(v.a)>=J.a*.5||Math.abs(v.v)>=J.v*.5||
        Math.abs(v.r)>=J.r*.5||Math.abs(v.e)>=J.e*.5||v.g>0){on=true;break}
   }
   if(on)out.push(z);
  }
  return out;
 }
 function packet(){
  const fs=chooseFrames(),active=activeZones(fs),t=last?.t??0,t0=fs[0]?.t??t;
  const f=fs.map(s=>({
   u:+(t===t0?1:(s.t-t0)/Math.max(EPS,t-t0)).toFixed(3),
   x:active.map(z=>{const v=s.by[z]||{};return[
    qi(v.a,J.a,0,99),qi(v.v,J.v),qi(v.r,J.r,0,99)]}),
   m:active.map(z=>Number(s.by[z]?.m||0)),
   e:active.map(z=>qi(s.by[z]?.e,J.e)),
   g:active.map(z=>qi(s.by[z]?.g,J.g,0,99)),
   cc:s.cc==null?null:+s.cc.toFixed(3),
   cf:s.cf==null?null:+s.cf.toFixed(3),k:s.epoch
  }));
  // Public reads are strictly observational; sampling occurs in observe().
  return cp({v:20,t:+t.toFixed(4),b:zs.length,z:active,
   n:f.length,span:+Math.max(0,t-t0).toFixed(4),f,
   source:'SOMA_V3_PROJECTED',nativeB10Dynamics:false});
 }
 function exact(){
  return cp({v:20,t:+Number(last?.t??0).toFixed(4),b:zs.length,z:zs,
   m:zs.map(z=>Number(last?.by?.[z]?.m||0)),
   authority:'HOST_ORIGIN_GROUNDING_PROJECTION'});
 }
 function digest(){
  const t=last?.t||0,xs=history.filter(s=>s.t>digestTime+EPS);
  const start=digestTime;digestTime=t;
  if(!xs.length)return {v:20,dt:+Math.max(0,t-start).toFixed(3),z:[],pk:[],r:[],d:0};
  const active=activeZones(xs),pk=active.map(z=>Math.max(...xs.map(s=>qi(s.by[z]?.a,J.a,0,99)))),
    rr=active.map(z=>qi(xs[xs.length-1].by[z]?.r,J.r,0,99));
  let density=0;
  for(let i=1;i<xs.length;i++)density+=Math.min(6,perceptualDelta(xs[i-1],xs[i]));
  const cfs=xs.map(s=>s.cf).filter(v=>v!=null),cf0=cfs[0]??null,cf1=cfs.length?cfs[cfs.length-1]:null;
  return{v:20,dt:+Math.max(0,t-start).toFixed(3),z:active,pk,r:rr,
   d:+density.toFixed(2),dcf:cf0==null||cf1==null?null:+(cf1-cf0).toFixed(3)};
 }
 function energySample({tMs,stored,power}={}){
  // Real measurements, if supplied, must come from the trusted world host.
  const time=finite(tMs,'ENERGY_TIME'),E=finite(stored,'ENERGY_STORED'),P=finite(power,'ENERGY_POWER');
  if(time<0||E<0||time<(meter.lastTime??0))throw TypeError('INVALID_ENERGY_SAMPLE');
  if(!meter.supported){meter={...meter,supported:true,initial:E,stored:E,lastTime:time,lastPower:P};return{ok:true}}
  const dt=(time-meter.lastTime)/1000,work=.5*(meter.lastPower+P)*dt,
    diss=meter.stored+work-E;
  meter.input+=work;
  if(diss>=-2e-6)meter.dissipated+=Math.max(0,diss);
  else{meter.violations++;meter.residual+=-diss}
  meter.stored=E;meter.lastTime=time;meter.lastPower=P;
  return{ok:true,work,dissipated:diss};
 }
 function energy(){
  if(!meter.supported)return{supported:false,pass:null,
   reason:'HOST_HAS_NOT_PROVIDED_REAL_FORCE_VELOCITY_STORED_ENERGY'};
  const residual=meter.initial+meter.input-meter.stored-meter.dissipated;
  return{supported:true,initial:meter.initial,input:meter.input,
   stored:meter.stored,dissipated:meter.dissipated,residual,
   violations:meter.violations,pass:meter.violations===0&&Math.abs(residual)<=2e-6};
 }
 function clearHistory(){
  history=[];last=null;digestTime=0;epoch=0;stats={packets:0,samples:0,cuts:0};
  meter={supported:false,initial:null,input:0,stored:null,dissipated:0,
   residual:0,violations:0,lastPower:null,lastTime:null};
 }
 return Object.freeze({observe,packet,exact,digest,energySample,energy,clearHistory,
  statistics:()=>cp({...stats,history:history.length,epoch}),
  law:'Native V20 compression/JND. Source V3 projection; unmeasured physical energy remains UNKNOWN.'});
}
return Object.freeze({VERSION,W,MAXH,MAXF,J,perceptualDelta,centroid,createField20});
});
