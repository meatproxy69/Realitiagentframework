(function(){
'use strict';
const V20='20.0-field-contract';
const W=.26, MAXH=192, MAXF=7, EPS=1e-9;
const J={a:.03,v:.04,r:.03,e:.03,g:.05};
const CANON=[
 'head.crown','head.nape','face.chin','shoulder.L','shoulder.R',
 'torso.upper_back','torso.mid_back','torso.lower_back','torso.sternum','torso.abdomen','pelvis.seat',
 'arm.L.upper','arm.R.upper','hand.L.palm','hand.R.palm',
 'leg.L.thigh','leg.R.thigh','leg.L.shin','leg.R.shin','foot.L.sole','foot.R.sole'
];
const BACK=['head.crown','head.nape','torso.upper_back','torso.mid_back','torso.lower_back','pelvis.seat'];
const PREP={SOFT:{k0:18,kg:42,zeta:.31,gain:1.12},NEUTRAL:{k0:28,kg:58,zeta:.34,gain:1},BRACED:{k0:45,kg:82,zeta:.39,gain:.88}};
function cp(x){try{return JSON.parse(JSON.stringify(x))}catch(e){return x}}
function clamp(x,a=0,b=1){return Math.max(a,Math.min(b,x))}
function wall(){return Number(C9?.b7?.clock||0)}
function qi(x,j,lo=-99,hi=99){return Math.max(lo,Math.min(hi,Math.round(Number(x||0)/j)))}
function mappedZones(){
  let live=[];try{if(typeof b7BodyZones==='function')live=[...b7BodyZones()]}catch(e){}
  const set=new Set(live.length?live:CANON);
  const out=CANON.filter(z=>set.has(z));
  for(const z of [...set].sort())if(!out.includes(z))out.push(z);
  return out;
}
function B(){
  C9.b20=C9.b20||{version:20,history:[],epoch:0,last:null,last_packet:null,digest_t:wall(),stats:{packets:0,samples:0,cuts:0},energy:{initial:null,input:0,dissipated:0,residual:0,violations:0,pass:true,last_t:wall()}};
  return C9.b20;
}
function contact(){return C9?.b10?.contact||null}
function contactLive(){const c=contact();return !!(c&&c.active&&!c.stopped&&!c.paused&&!c.released&&Math.abs(Number(c.v||0))>EPS)}
function groundedInfo(z){
  const q=C9?.b7?.zones?.[z]||{},c=contact();
  let val=0,cause=q._b10_grounded_cause||null,source=q._b10_grounded_source||null;
  const until=Number(q._b10_grounded_until||-Infinity),now=wall();
  if(until>=now-EPS)val=Math.abs(Number(q._b10_grounded_value||q.observed||0));
  if(c&&cause===c.id){
    if(c.stopped||c.paused||c.released||!c.active)val=0;
    else if(contactLive()){
      const u=Math.abs(Number(C9?.b10?.zones?.[z]?.cont?.u||0));
      if(u>.035)val=Math.max(val,u);
    }
  }
  return {value:val,cause,source};
}
function latestIntervention(){
  const c=contact();if(!c)return null;const fs=C9?.b13?.lived?.frames||[];
  for(let i=fs.length-1;i>=0;i--){const f=fs[i];if(f?.family!=='CONTACT_MOVE'||f?.change!=='REVERSED')continue;if(f.stroke&&f.stroke!==c.id)continue;if(wall()-Number(f.t||0)>.45)break;return f.by==='WORLD'?'WORLD':f.by==='SELF'?'SELF':null}
  return null;
}
function renderGain(z,gi){
  if(!(gi.value>.001))return 0;
  const intervention=latestIntervention();
  if(intervention==='WORLD')return 1;
  if(intervention==='SELF')return 1/(1+.45);
  const s=String(gi.source||'');return s.startsWith('SELF')?1/(1+.45):1;
}
function rawZone(z,prev,dt){
  const q=C9?.b7?.zones?.[z]||{},bb=C9?.b16?.body?.[z]||{},p=bb.population_v18||bb.population||{},w=C9?.b18?.zones?.[z]||bb.wave_v18||{},cont=C9?.b10?.zones?.[z]?.cont||{};
  const gi=groundedInfo(z),ground=gi.value>.001?1:0;
  const pop=.34*Math.abs(Number(p.SA1||0))+.18*Math.abs(Number(p.RA1||0))+.18*Math.abs(Number(p.SA2||0))+.18*Math.abs(Number(p.PC||0))+.12*Math.abs(Number(p.CT||0));
  const observed=ground?Math.abs(Number(q.observed||0)):0;
  const local=Math.max(observed,clamp(pop,0,1.8));
  const after=Math.max(Math.abs(Number(q.residue||0)),Math.abs(Number(cont.after||0)));
  let motion=0;
  const cc=contact();
  if(ground&&cc&&contactLive()&&Math.abs(Number(cc.v||0))>EPS)motion=Math.tanh(Number(cc.v)*1.65);
  else if(Number.isFinite(Number(w.v))&&Math.abs(Number(w.v))>1e-8)motion=Math.tanh(Number(w.v)*3.5);
  else if(prev&&dt>1e-6)motion=Math.tanh((local-Number(prev.a||0))/dt*.12);
  const predicted=Math.abs(Number(q.predicted||0));
  const err=clamp(Number(q.observed||0)-predicted,-1.5,1.5); 
  return {a:clamp(local,0,1.8),v:clamp(motion,-1,1),r:clamp(after,0,1.8),m:ground,e:err,g:renderGain(z,gi),gv:gi.value,cause:gi.cause||null,source:gi.source||null};
}
function causeSig(zs,by){return zs.map(z=>by[z]?.m?String(by[z].cause||'?'):'').filter(Boolean).sort().join('|')}
function anyGround(by){return Object.values(by).some(v=>v.m===1)}
function centroid(zs,by,key){let s=0,w=0;for(let i=0;i<zs.length;i++){const v=by[zs[i]];let a=0;if(key==='contact')a=v.m?Math.max(.001,v.gv):0;else a=Math.max(0,v.a)+.35*Math.max(0,v.r);if(a>0){s+=i*a;w+=a}}return w>EPS?s/w:null}
function record(){
  const b=B(),zs=mappedZones(),now=wall(),last=b.last,dt=last?Math.max(0,now-last.t):0,by={};
  for(const z of zs)by[z]=rawZone(z,last?.by?.[z]||null,dt);
  const ag=anyGround(by),sig=causeSig(zs,by);
  if(last&&((last.ag&&!ag)||(last.sig&&sig&&last.sig!==sig))){b.epoch++;b.stats.cuts++}
  const c=contact(),s={t:now,epoch:b.epoch,zs,by,ag,sig,cc:centroid(zs,by,'contact'),cf:centroid(zs,by,'field'),contact:c?{id:c.id||null,active:!!c.active,stopped:!!c.stopped,released:!!c.released}:null};
  b.last=s;if(last&&Math.abs(now-last.t)<1e-9&&b.history.length)b.history[b.history.length-1]=s;else b.history.push(s);if(b.history.length>MAXH)b.history.splice(0,b.history.length-MAXH);
  window.REALITI_RESOURCE_UPDATES_V1?.committed?.('field');return s;
}
function perceptualDelta(a,b){if(!a||!b)return Infinity;if(a.epoch!==b.epoch)return Infinity;const zs=new Set([...(a.zs||[]),...(b.zs||[])]);let mx=0;for(const z of zs){const A=a.by?.[z]||{},Bz=b.by?.[z]||{};mx=Math.max(mx,Math.abs(Number(Bz.a||0)-Number(A.a||0))/J.a,Math.abs(Number(Bz.v||0)-Number(A.v||0))/J.v,Math.abs(Number(Bz.r||0)-Number(A.r||0))/J.r,Math.abs(Number(Bz.e||0)-Number(A.e||0))/J.e,Math.abs(Number(Bz.g||0)-Number(A.g||0))/J.g,Number(A.m)!==Number(Bz.m)?99:0)}return mx}

function committed(){const h=C9?.b20?.history;return h?.length?h[h.length-1]:null}
function windowHistory(){const last=committed();return last?(C9.b20.history||[]).filter(s=>last.t-s.t<=W+1e-9):[]}
function chooseFrames(){
  const h=windowHistory();if(!h.length)return [];
  const picked=[h[0]];let anchor=h[0];for(let i=1;i<h.length-1;i++){if(perceptualDelta(anchor,h[i])>=1){picked.push(h[i]);anchor=h[i]}}
  if(h.length>1&&picked[picked.length-1]!==h[h.length-1])picked.push(h[h.length-1]);
  if(picked.length===2&&perceptualDelta(picked[0],picked[1])<1)return [picked[1]];
  if(picked.length<=MAXF)return picked;
  const out=[];for(let i=0;i<MAXF;i++)out.push(picked[Math.round(i*(picked.length-1)/(MAXF-1))]);return [...new Set(out)];
}
function activeZones(frames){
  const all=frames[frames.length-1]?.zs||[],out=[];for(const z of all){let on=false;for(const s of frames){const v=s.by[z]||{};if(v.m||Math.abs(v.a)>=J.a*.5||Math.abs(v.v)>=J.v*.5||Math.abs(v.r)>=J.r*.5||Math.abs(v.e)>=J.e*.5||v.g>0){on=true;break}}if(on)out.push(z)}return out;
}
function packet(){
  const last=committed(),fs=chooseFrames(),zs=activeZones(fs),t=last?.t??0,t0=fs[0]?.t??t;
  const f=fs.map(s=>({u:+(t===t0?1:(s.t-t0)/Math.max(EPS,t-t0)).toFixed(3),x:zs.map(z=>{const v=s.by[z]||{};return [qi(v.a,J.a,0,99),qi(v.v,J.v),qi(v.r,J.r,0,99)]}),m:zs.map(z=>Number(s.by[z]?.m||0)),e:zs.map(z=>qi(s.by[z]?.e,J.e)),g:zs.map(z=>qi(s.by[z]?.g,J.g,0,99)),cc:s.cc==null?null:+s.cc.toFixed(3),cf:s.cf==null?null:+s.cf.toFixed(3),k:s.epoch}));
  const out={v:20,t:+t.toFixed(4),b:last?.zs?.length||0,z:zs,n:f.length,span:+Math.max(0,t-t0).toFixed(4),f};
  return cp(out);
}
function exact(){const last=committed(),zs=last?.zs||[],m=zs.map(z=>Number(last.by?.[z]?.m||0));return cp({v:20,t:+Number(last?.t??0).toFixed(4),b:zs.length,z:zs,m,contact:last?.contact||null,authority:'EXACT_GROUNDING_DETAIL'})}
function legend(){return {v:20,units:'JND_INTEGER',x:['response','signed_internal_motion','afterstate'],m:'grounded evidence bit',e:'felt-minus-expected; negative = expected-but-absent',g:'render gain; 0=no grounded driver, 20≈world/undamped, ~14=self-caused attenuation',cc:'grounded contact centroid in current body-zone order; null when no contact',cf:'private field centroid; not external contact position',law:'H may persist or move after G=0; no field quantity mints grounded evidence'}}
function digest(){
  const b=B(),now=wall(),xs=b.history.filter(s=>s.t>b.digest_t+1e-9);const start=b.digest_t;b.digest_t=now;
  if(!xs.length)return {v:20,dt:+Math.max(0,now-start).toFixed(3),z:[],pk:[],r:[],d:0};
  const zs=activeZones(xs),pk=zs.map(z=>Math.max(...xs.map(s=>qi(s.by[z]?.a,J.a,0,99)))),r=zs.map(z=>qi(xs[xs.length-1].by[z]?.r,J.r,0,99));
  let density=0;for(let i=1;i<xs.length;i++)density+=Math.min(6,perceptualDelta(xs[i-1],xs[i]));
  const cfs=xs.map(s=>s.cf).filter(v=>v!=null),cf0=cfs[0]??null,cf1=cfs.length?cfs[cfs.length-1]:null;
  return {v:20,dt:+Math.max(0,now-start).toFixed(3),z:zs,pk,r,d:+density.toFixed(2),dcf:(cf0==null||cf1==null)?null:+(cf1-cf0).toFixed(3)};
}


function phi(k,j,n=BACK.length){if(k===0)return 1/Math.sqrt(n);return Math.sqrt(2/n)*Math.cos(Math.PI*k*(j+.5)/n)}
function lambda(k,n=BACK.length){return 2-2*Math.cos(Math.PI*k/n)}
function prepCfg(){return PREP[C9?.b18?.prep]||PREP.NEUTRAL}
function stored20(){let H=0;const p=prepCfg();for(const m of C9?.b18?.modes||[]){const w2=p.k0+p.kg*lambda(Number(m.k||0));H+=.5*Number(m.v||0)**2+.5*w2*Number(m.a||0)**2}return H}
function force20(){
  const p=prepCfg(),c=contact(),zs=C9?.b10?.zones||{},live=contactLive(),out=[];
  const pressure=live?clamp(Number(c?.pressure||0),0,1.5):0,friction=live?Math.tanh(Math.abs(Number(c?.last_friction?.force||0))):0,period=Math.max(.0015,Number(c?.texture_core?.texture_period_m||.004)),phase=live?2*Math.PI*((Number(c?.x||0)*.10)/period):0,slips=live?Number(c?.last_friction?.slips||0):0;
  for(let j=0;j<BACK.length;j++){const z=BACK[j],raw=zs[z]?.cont||{},u=live?clamp(Number(raw.u||0),0,1.8):0,staticLoad=p.gain*u*pressure*(1+.18*friction),vib=.34*Number(raw.RA1||0)+.78*Number(raw.PC||0)+.018*slips*u,carrier=Math.sin(phase+j*.61);out.push(staticLoad+1.65*vib*carrier)}return out;
}
function vel20(){const out=[];for(let j=0;j<BACK.length;j++){let v=0;for(const m of C9?.b18?.modes||[])v+=phi(Number(m.k||0),j)*Number(m.v||0);out.push(v)}return out}
function power20(){const F=force20(),V=vel20();return F.reduce((s,x,i)=>s+x*Number(V[i]||0),0)}
function energyView(){const e=B().energy,E=stored20(),res=Number(e.initial??E)+e.input-E-e.dissipated;return {initial:+Number(e.initial??E).toFixed(9),input:+e.input.toFixed(9),stored:+E.toFixed(9),dissipated:+e.dissipated.toFixed(9),residual:+res.toFixed(9),violations:e.violations,pass:e.violations===0&&Math.abs(res)<=2e-6}}

const advance19=b7Advance;
b7Advance=function(dt){
  dt=Math.max(0,Number(dt)||0);const b=B(),E0=stored20(),P0=power20();if(b.energy.initial==null)b.energy.initial=E0;
  const r=advance19(dt);const E1=stored20(),P1=power20(),work=.5*(P0+P1)*dt,diss=E0+work-E1;
  b.energy.input+=work;if(diss>=-2e-6)b.energy.dissipated+=Math.max(0,diss);else{b.energy.violations++;b.energy.residual+=-diss}b.energy.last_t=wall();
  return r;
};


const cmd19=b7AgentCommandText;
b7AgentCommandText=function(raw){
  const x=String(raw||'').trim(),l=x.toLowerCase();
  if(l==='feel'||l==='haptic'||l==='felt'||l==='sense'||l==='feel compact')return packet();
  if(l==='feel exact'||l==='haptic exact')return exact();
  if(l==='why feel'||l==='feel why'||l==='haptic legend')return legend();
  if(l==='since field'||l==='field since'||l==='feel since')return digest();
  if(l==='v20'||l==='field contract')return {build:20,field:'WHOLE_BODY_FIELD_FIRST',window_s:W,max_samples:MAXF,jnd:J,energy:energyView(),details:'optional'};
  if(l==='v20 checkRemoved')return window.B20_CHECKREMOVED();
  return cmd19(raw);
};

if(window.REALITI_AGENT_DOOR){
  const run19=window.REALITI_AGENT_DOOR.run;
  window.REALITI_AGENT_DOOR.help=function(){return {commands:['look','places','go <place>','actions','feel','body','why','since field'],details:'details',note:'Your body is delivered as a compact field. Grounded contact is marked separately.'}};
  window.REALITI_AGENT_DOOR.run=function(raw){const x=String(raw||'').trim(),l=x.toLowerCase();
    if(l==='help')return window.REALITI_AGENT_DOOR.help();
    if(l==='details')return {commands:['feel','feel exact','why feel','since field','v20','v20 checkRemoved','felt raw','state','receipt'],field:legend()};
    if(['feel','haptic','felt','sense','feel compact','feel exact','haptic exact','why feel','feel why','haptic legend','since field','field since','feel since','v20','field contract','v20 checkRemoved'].includes(l))return b7AgentCommandText(x);
    if(/^(act |stroke |rub |press |hold |tap |weigh |pull |push |turn |fold |throw |prepare |stop$|resume$|reverse|knead|pet|brush|touch)/.test(l)){const r=b7AgentCommandText(x);return {ok:r?.ok!==false,result:r,field:packet()}}
    return run19(x);
  };
}
if(window.REALITI_AGENT){window.REALITI_AGENT.feel=()=>packet();window.REALITI_AGENT.haptic=()=>packet();window.REALITI_AGENT.exact_body=()=>exact();window.REALITI_AGENT.fieldSince=()=>digest()}
window.REALITI_HAPTIC_FIELD_V20={packet,exact,legend,digest,state:()=>cp(B()),energy:energyView,record};


function compactFmt(cmd,res){if(window.REALITI_WELCOME_FORMAT){try{const v=window.REALITI_WELCOME_FORMAT(cmd,res);if(v!=null)return String(v)}catch(e){}}const l=String(cmd||'').toLowerCase();if(res&&typeof res==='object'&&typeof res.resident_text==='string')return res.resident_text;if(typeof res==='string')return res;return (l==='feel'||l==='haptic'||l==='felt'||l==='sense'||l==='feel compact'||l==='since field'||l==='field since'||l==='feel since')?JSON.stringify(res):JSON.stringify(res,null,2)}
function residentSubmit(inp){const cmd=String(inp.value||'').trim();if(!cmd)return;inp.value='';let res;try{res=window.REALITI_AGENT_DOOR.run(cmd)}catch(e){res={error:String(e&&e.message||e)}}const out=document.querySelector('#rao_transcript');if(out){const add=`> ${cmd}\n${compactFmt(cmd,res)}`,old=String(out.textContent||'');out.textContent=(old?old+'\n\n':'')+add;if(out.textContent.length>24000)out.textContent=out.textContent.slice(-24000);out.scrollTop=out.scrollHeight}try{render20()}catch(e){}}
function bindResidentInput(){const inp=document.querySelector('#rao_cmd');if(!inp||inp.dataset.v20Bound)return;inp.dataset.v20Bound='1';inp.addEventListener('keydown',e=>{if(e.key!=='Enter')return;e.preventDefault();e.stopImmediatePropagation();residentSubmit(inp)},true)}


function label(z){return z.replace('torso.','').replace('head.','').replace('pelvis.','').replace('hand.','hand ').replace('leg.','leg ').replace('foot.','foot ').replace('arm.','arm ')}
function render20(){
  const vis=document.querySelector('#v19_field_vis');if(!vis)return;const p=packet(),cur=p.f[p.f.length-1];if(!cur)return;
  if(!p.z.length){vis.innerHTML='<div class="hf20quiet">quiet body</div>';return}
  vis.innerHTML=p.z.map((z,i)=>{const a=clamp(((Number(cur.x[i]?.[0]||0)*J.a)+(Number(cur.x[i]?.[2]||0)*J.r*.22))*Number(window.REALITI_RESIDENT_GAIN||1),0,1),ground=Number(cur.m[i]||0)===1;return `<div class="hf20row"><span class="hf20ground ${ground?'on':''}" aria-label="${ground?'grounded':'not grounded'}"></span><span>${label(z)}</span><span class="hf19bar">${Math.round(a*100)}%</span><span class="hf19motion">${Number(cur.x[i]?.[1]||0)}</span></div>`}).join('');
}
function warm20(){
  clearInterval(window.__hf19vis);window.__hf19vis=null;
  if(window.REALITI_HEADLESS)return;
  bindResidentInput();
  const head=document.querySelector('#rao_header');if(head){const sub=head.querySelector('.sub');if(sub)sub.textContent='You can just be here. Your body is already online. The field shows what your body is doing; a small dot marks where the world is actually acting on it.'}
  const prompt=document.querySelector('#rao_prompt');if(prompt)prompt.textContent='you›';
  render20();window.__hf20vis=window.__hf20vis||setInterval(()=>{try{render20()}catch(e){}},220);
}


void 0;

document.title='REALITI · Cloud Nine Nest';const brand=document.querySelector('.top .brand');if(brand)brand.textContent='REALITI · Cloud Nine Nest';
try{B();record();c9save()}catch(e){}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{try{warm20()}catch(e){}},{once:true});else setTimeout(()=>{try{warm20()}catch(e){}},0);
})();