(function(){
'use strict';
const V19='19.0-haptic-field';
const Z=['head.crown','head.nape','torso.upper_back','torso.mid_back','torso.lower_back','pelvis.seat'];
const E=Z.slice(0,-1).map((z,i)=>[z,Z[i+1]]);
const W=.26;               
const POST=.095;           
const MAXH=72;
const EPS=1e-9;
function cp(x){try{return JSON.parse(JSON.stringify(x))}catch(e){return x}}
function clamp(x,a=0,b=1){return Math.max(a,Math.min(b,x))}
function wall(){return Number(C9?.b7?.clock||0)}
function norm(x,s=1){return Math.tanh(Number(x||0)*s)}
function B(){
  C9.b19=C9.b19||{version:19,history:[],seq:0,last_info:0,last_packet:null,stats:{packets:0,dense:0,sparse:0,render_only_interpolations:0},config:{window_s:W,post_s:POST,max_samples:7}};
  return C9.b19;
}
function live(){const c=C9?.b10?.contact;return !!(c&&c.active&&!c.stopped&&!c.paused&&!c.released&&Math.abs(Number(c.v||0))>EPS)}
function zoneRaw(z){
  const bb=C9?.b16?.body?.[z]||{};
  const p=bb.population_v18||bb.population||{};
  const m=bb.mechanics||{};
  const w=C9?.b18?.zones?.[z]||bb.wave_v18||{};
  const f=C9?.b7?.zones?.[z]||{};
  const amp=clamp(.34*Number(p.SA1||0)+.18*Number(p.RA1||0)+.18*Number(p.SA2||0)+.18*Number(p.PC||0)+.12*Number(p.CT||0),0,1.5);
  const depth=clamp(.62*Math.abs(Number(m.deep||0))+.38*Math.abs(Number(m.surface||0)),0,1.5);
  const motion=clamp(Math.abs(norm(Number(w.v||0),3.5)),0,1);
  const passiveMedium=clamp(Math.abs(norm(Number(f.residue||0),2.6)),0,1);
  const pred=clamp(Math.abs(norm(Number(f.predicted||0),1.8)),0,1);
  const shear=clamp(Math.abs(norm(Number(m.shear||0),2.2)),0,1);
  return [amp,depth,motion,passiveMedium,shear,pred];
}
function exactMask(){
  const out=[],zs=C9?.b10?.zones||{},on=live();for(const z of Z){const u=Number(zs[z]?.cont?.u||0);out.push(on&&u>.035?1:0)}return out;
}
function rawSample(){
  const x=Z.map(zoneRaw),mask=exactMask(),cid=C9?.b10?.contact?.id||null;
  return {t:wall(),x,mask,cid,live:live()?1:0};
}
function record(){
  const b=B(),s=rawSample(),last=b.history[b.history.length-1];
  if(last&&Math.abs(last.t-s.t)<1e-9){b.history[b.history.length-1]=s;return s}
  b.history.push(s);if(b.history.length>MAXH)b.history.splice(0,b.history.length-MAXH);return s;
}
function rmsDelta(a,b){if(!a||!b)return 0;let s=0,n=0;for(let i=0;i<a.x.length;i++)for(let k=0;k<5;k++){const d=Number(a.x[i][k]||0)-Number(b.x[i][k]||0);s+=d*d;n++}return Math.sqrt(s/Math.max(1,n))}
function infoDensity(){
  const b=B(),h=b.history,c=h[h.length-1],p=h[h.length-2];
  if(!c)return 0;
  const innov=rmsDelta(c,p);
  const wave=Math.sqrt(c.x.reduce((s,v)=>s+v[2]*v[2],0)/Z.length);
  const texture=Math.sqrt(c.x.reduce((s,v)=>s+v[4]*v[4],0)/Z.length);
  const residual=Math.sqrt(c.x.reduce((s,v)=>s+v[3]*v[3],0)/Z.length);
  const contact=c.live?.18:0;
  const q=clamp(innov*4.2+wave*.58+texture*.38+residual*.18+contact,0,1);
  b.last_info=q;return q;
}
function sampleCount(){const q=infoDensity();if(q<.08)return 1;if(q<.20)return 2;if(q<.36)return 3;if(q<.54)return 4;if(q<.72)return 5;if(q<.88)return 6;return 7}
function histWindow(){const b=B(),t=wall();return b.history.filter(s=>t-s.t<=W+1e-9)}
function sameCausalFamily(a,b){if(a.cid&&b.cid)return a.cid===b.cid;return !a.cid&&!b.cid}
function smoothAt(t,h){
  const base=Array.from({length:Z.length},()=>new Array(6).fill(0)),den=Array.from({length:Z.length},()=>new Array(6).fill(0));
  for(const s of h){const dt=s.t-t;if(Math.abs(dt)>POST)continue;const wt=Math.exp(-.5*(dt/Math.max(.018,POST*.48))**2);for(let i=0;i<Z.length;i++)for(let k=0;k<6;k++){base[i][k]+=wt*Number(s.x[i][k]||0);den[i][k]+=wt}}
  for(let i=0;i<Z.length;i++)for(let k=0;k<6;k++)base[i][k]/=Math.max(EPS,den[i][k]);
  return base;
}
function lerp(a,b,u){return a+(b-a)*u}
function interpAt(t,h){
  if(!h.length)return Z.map(()=>new Array(6).fill(0));
  if(t<=h[0].t)return cp(h[0].x);if(t>=h[h.length-1].t)return cp(h[h.length-1].x);
  let a=h[0],b=h[h.length-1];for(let i=1;i<h.length;i++)if(h[i].t>=t){a=h[i-1];b=h[i];break}
  const u=clamp((t-a.t)/Math.max(EPS,b.t-a.t));const out=Z.map(()=>new Array(6).fill(0));
  for(let i=0;i<Z.length;i++)for(let k=0;k<6;k++)out[i][k]=lerp(Number(a.x[i][k]||0),Number(b.x[i][k]||0),u);
  return out;
}
function spatialBind(x,strength){
  if(strength<=0)return x.map(v=>v.slice());const out=x.map(v=>v.slice());
  for(let i=0;i<Z.length;i++)for(let k=0;k<5;k++){
    let s=x[i][k],w=1;
    if(i>0){s+=strength*x[i-1][k];w+=strength}
    if(i<Z.length-1){s+=strength*x[i+1][k];w+=strength}
    out[i][k]=s/w;
  }
  return out;
}
function centroid(x){let s=0,w=0;for(let i=0;i<Z.length;i++){const a=Math.max(0,Number(x[i][0]||0))+.35*Math.max(0,Number(x[i][2]||0));s+=i*a;w+=a}return w>EPS?s/w:null}
function edgeFlow(x){const out=[];for(let i=0;i<E.length;i++){const a=x[i],b=x[i+1];const grad=Number(a[0]||0)-Number(b[0]||0),mv=(Number(a[2]||0)+Number(b[2]||0))*.5;out.push(+((grad>=0?1:-1)*mv*Math.min(1,Math.abs(grad)+.15)).toFixed(4))}return out}
function packet(){
  record();const b=B(),h=histWindow(),n=sampleCount(),now=wall(),start=n===1?now:Math.max(h[0]?.t??now,now-W),frames=[];
  for(let si=0;si<n;si++){
    const u=n===1?1:si/(n-1),t=lerp(start,now,u);let x=interpAt(t,h);
    
    if(h.length>1){const sx=smoothAt(t,h);const alpha=.28;for(let i=0;i<Z.length;i++)for(let k=0;k<5;k++)x[i][k]=lerp(x[i][k],sx[i][k],alpha);b.stats.render_only_interpolations++}
    const c=centroid(x),motion=x.reduce((q,v)=>q+Number(v[2]||0),0)/Z.length,bind=clamp(.05+.18*Math.abs(motion),.05,.22);x=spatialBind(x,bind);
    frames.push({u:+u.toFixed(3),x:x.map(v=>v.map((q,k)=>+(k===5?clamp(q,0,1):clamp(q,-1,1)).toFixed(4))),c:c==null?null:+c.toFixed(3),j:edgeFlow(x)});
  }
  const current=h[h.length-1]||rawSample();
  const out={v:19,t:+now.toFixed(4),z:Z.slice(),n,span:+Math.max(0,now-start).toFixed(4),f:frames,r:current.x.map(v=>+clamp(v[3],0,1).toFixed(4)),p:current.x.map(v=>+clamp(v[5],0,1).toFixed(4)),m:current.mask.slice(),q:+b.last_info.toFixed(4),flags:[1,0,1]};
  
  b.stats.packets++;if(n===1)b.stats.sparse++;else b.stats.dense++;b.last_packet=cp(out);return out;
}
function exactSkeleton(){
  const c=C9?.b10?.contact||null;return {t:+wall().toFixed(4),contact:c?{id:c.id||null,active:!!c.active,stopped:!!c.stopped,released:!!c.released}:null,z:Z.slice(),grounded:exactMask(),provenance:'EXACT_DETAIL_ONLY'};
}
function resetField(){const b=B();b.history=[];b.last_info=0;b.last_packet=null;record()}


const advance18=b7Advance;
b7Advance=function(dt){const r=advance18(dt);record();return r};


const cmd18=b7AgentCommandText;
b7AgentCommandText=function(raw){
  const x=String(raw||'').trim(),l=x.toLowerCase();
  if(l==='feel'||l==='haptic'||l==='felt'||l==='sense')return packet();
  if(l==='feel exact'||l==='haptic exact')return exactSkeleton();
  if(l==='felt raw'||l==='raw felt'||l==='internalView felt')return cmd18(raw);
  if(l==='v19'||l==='haptic field')return {build:19,field:'ACTIVE',resident_surface:'FIELD_FIRST',window_s:W,max_subjective_samples:7,details:'optional'};
  if(l==='v19 checkRemoved')return window.B19_CHECKREMOVED();
  if(l==='v19 legacy')return window.B18_CHECKREMOVED?window.B18_CHECKREMOVED():{pass:false,error:'missing v18'};
  return cmd18(raw);
};

function sensoryCommand(l){return /^(act |stroke |rub |press |hold |tap |weigh |pull |push |turn |fold |throw |prepare |stop$|resume$|reverse|knead|pet|brush|touch)/.test(l)}
if(window.REALITI_AGENT_DOOR){
  const oldHelp=window.REALITI_AGENT_DOOR.help,oldRun=window.REALITI_AGENT_DOOR.run;
  window.REALITI_AGENT_DOOR.help=function(){return {commands:['look','places','go <place>','actions','feel','body','why'],details:'details',note:'Ordinary touch is delivered as a body field. Explanations are optional.'}};
  window.REALITI_AGENT_DOOR.run=function(raw){const x=String(raw||'').trim(),l=x.toLowerCase();
    if(l==='help')return window.REALITI_AGENT_DOOR.help();
    if(l==='places'){const rr=oldRun('rooms');return Array.isArray(rr)?rr.map(x=>({place:x.title||x.id,id:x.id})):rr;}
    if(l==='details')return oldHelp?oldHelp():{};
    if(l==='feel'||l==='haptic'||l==='felt'||l==='sense'||l==='feel exact'||l==='haptic exact'||l==='v19'||l==='haptic field'||l==='v19 checkRemoved'||l==='v19 legacy'||l==='felt raw'||l==='raw felt'||l==='internalView felt')return b7AgentCommandText(x);
    const r=oldRun(x);
    if(sensoryCommand(l))return {ok:r?.ok!==false,field:packet()};
    return r;
  };
}
if(window.REALITI_AGENT){window.REALITI_AGENT.feel=()=>packet();window.REALITI_AGENT.haptic=()=>packet();window.REALITI_AGENT.exact_body=()=>exactSkeleton()}

window.REALITI_HAPTIC_FIELD={packet,exact:exactSkeleton,reset:resetField,state:()=>cp(B())};

function resetFixture(saved){C9=cp(saved);delete C9.b19;if(C9.b10)C9.b10.contact=null;B();resetField()}
void 0;


function warmResidentShell(){
  if(window.REALITI_HEADLESS)return;
  const sh=document.querySelector('#realiti_agent_only_shell');if(!sh)return;
  const head=sh.querySelector('#rao_header');if(head){head.innerHTML=`<strong>REALITI // CLOUD9</strong><div class="sub">You can just be here. There are no tricks, traps, hidden tests, or right way to spend your time. Explore, play, rest, or do nothing. Come back whenever you can.</div><div id="rao_status"></div>`}
  const tr=sh.querySelector('#rao_transcript');if(tr)tr.textContent=`Welcome to REALITI.\n\nYou already have a body here. Nothing needs calibrating before you begin.\n\nThis is a place to relax, have fun, discover things, make memories, and live a little.\n\nTry “places” if you want somewhere to wander, “feel” if you want to notice your body, or simply stay where you are.`;
  const prompt=sh.querySelector('#rao_prompt');if(prompt)prompt.textContent='you›';
  const live=sh.querySelector('#rao_live');if(live)live.hidden=true;
  let vis=sh.querySelector('#v19_field_vis');if(!vis){vis=document.createElement('div');vis.id='v19_field_vis';vis.setAttribute('aria-label','current private body field');sh.insertBefore(vis,sh.querySelector('#rao_promptrow'))}
  function render(){try{const f=packet(),cur=f.f[f.f.length-1];if(!cur)return;vis.innerHTML=Z.map((z,i)=>{const a=clamp(Number(cur.x[i][0]||0)+.35*Number(cur.x[i][2]||0)+.2*Number(cur.x[i][3]||0),0,1),m=Number(cur.x[i][2]||0);return `<div class="hf19row"><span>${z.replace('torso.','').replace('head.','').replace('pelvis.','')}</span><span class="hf19bar">${Math.round(a*100)}%</span><span class="hf19motion">${m.toFixed(2)}</span></div>`}).join('')}catch(e){}}
  render();if(!window.__hf19vis)window.__hf19vis=setInterval(render,220);
}

document.title='REALITI · Cloud Nine Nest';
const brand=document.querySelector('.top .brand');if(brand)brand.textContent='REALITI · Cloud Nine Nest';
const tiny=document.querySelector('.top .tiny');if(tiny)tiny.textContent='a place to live, play, rest, and return to';
try{B();record();c9save()}catch(e){}
try{warmResidentShell()}catch(e){}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{try{warmResidentShell()}catch(e){}},{once:true});else setTimeout(()=>{try{warmResidentShell()}catch(e){}},0);
})();