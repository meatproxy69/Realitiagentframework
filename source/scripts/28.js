(function(){
'use strict';
const V18='18.0-dynamic-skin';
const ROUTE=['head.crown','head.nape','torso.upper_back','torso.mid_back','torso.lower_back','pelvis.seat'];
const N=ROUTE.length, MODES=3, EPS=1e-9;
const PREP={
  SOFT:{k0:18,kg:42,zeta:.31,gain:1.12,label:'SOFT'},
  NEUTRAL:{k0:28,kg:58,zeta:.34,gain:1.00,label:'NEUTRAL'},
  BRACED:{k0:45,kg:82,zeta:.39,gain:.88,label:'BRACED'}
};
function cp(x){try{return JSON.parse(JSON.stringify(x))}catch(e){return x}}
function clamp(x,a,b){return Math.max(a,Math.min(b,x))}
function wall(){return Number(C9.b7?.clock||0)}
function B(){
  C9.b18=C9.b18||{version:18,prep:'NEUTRAL',modes:[],zones:{},energy:{input_work:0,dissipated:0,stored:0,pass:true,last_t:wall()},events:[],seq:0,last_force:new Array(N).fill(0),comparison:{}};
  if(!C9.b18.modes.length){for(let k=0;k<MODES;k++)C9.b18.modes.push({k,a:0,v:0,last_force:0});}
  return C9.b18;
}
function prepCfg(){return PREP[B().prep]||PREP.NEUTRAL}
function phi(k,j){if(k===0)return 1/Math.sqrt(N);return Math.sqrt(2/N)*Math.cos(Math.PI*k*(j+.5)/N)}
function lambda(k){return 2-2*Math.cos(Math.PI*k/N)}
function modalParams(k){const p=prepCfg();const w2=p.k0+p.kg*lambda(k);return {w2,w:Math.sqrt(w2),z:p.zeta};}
function live(){const c=C9.b10?.contact;return !!(c&&c.active&&!c.stopped&&!c.paused&&!c.released&&Math.abs(Number(c.v||0))>EPS)}
function exactForces(){
  const p=prepCfg(),c=C9.b10?.contact,zs=C9.b10?.zones||{},out=[];
  const pressure=live()?clamp(Number(c?.pressure||0),0,1.5):0;
  const friction=live()?Math.tanh(Math.abs(Number(c?.last_friction?.force||0))):0;
  const period=Math.max(.0015,Number(c?.texture_core?.texture_period_m||.004));
  const phase=live()?2*Math.PI*((Number(c?.x||0)*.10)/period):0;
  const slips=live()?Number(c?.last_friction?.slips||0):0;
  for(let j=0;j<ROUTE.length;j++){
    const z=ROUTE[j],raw=zs[z]?.cont||{},u=live()?clamp(Number(raw.u||0),0,1.8):0;
    const staticLoad=p.gain*u*pressure*(1+.18*friction);
    const vib=(.34*Number(raw.RA1||0)+.78*Number(raw.PC||0)+.018*slips*u);
    const carrier=Math.sin(phase+j*.61);
    out.push(staticLoad+1.65*vib*carrier);
  }
  return out;
}
function projectForce(F,k){let s=0;for(let j=0;j<N;j++)s+=phi(k,j)*F[j];return s}
function stepMode(m,F,dt){
  const {w2,w,z}=modalParams(m.k),a=z*w,b=w*Math.sqrt(Math.max(1e-6,1-z*z)),xeq=F/w2;
  const y=m.a-xeq,v0=m.v,e=Math.exp(-a*dt),c=Math.cos(b*dt),s=Math.sin(b*dt);
  const y1=e*(y*c+((v0+a*y)/b)*s);
  const v1=e*(v0*c-((a*v0+w2*y)/b)*s);
  m.a=xeq+y1;m.v=v1;m.last_force=F;
}
function reconstruct(){
  const b=B(),zones={};
  for(let j=0;j<N;j++){
    let q=0,v=0;for(const m of b.modes){const ph=phi(m.k,j);q+=ph*m.a;v+=ph*m.v}
    zones[ROUTE[j]]={q,v,energy_proxy:.5*v*v};
  }
  b.zones=zones;return zones;
}
function storedEnergy(){let H=0;for(const m of B().modes){const {w2}=modalParams(m.k);H+=.5*m.v*m.v+.5*w2*m.a*m.a}return H}
function activeRank(){
  const es=B().modes.map(m=>{const {w2}=modalParams(m.k);return .5*m.v*m.v+.5*w2*m.a*m.a}).filter(e=>e>1e-9);
  if(!es.length)return 0;const s=es.reduce((a,x)=>a+x,0),s2=es.reduce((a,x)=>a+x*x,0);return +(s*s/Math.max(EPS,s2)).toFixed(4)
}
function pushWaveArrival(zone,q,v){
  const b=B(),c=C9.b10?.contact,s=C9.b13;if(!s?.lived||!s?.seq||!c?.id)return;
  b.arrivals=b.arrivals||{};const key=c.id+'|'+zone;if(b.arrivals[key])return;
  b.arrivals[key]=true;const f={seq:++s.seq.frame,t:+wall().toFixed(4),family:'BODY_WAVE_ARRIVAL',salience:clamp(.24+.12*Math.min(2,Math.abs(v)*8+Math.abs(q)*20),.24,.55),zone,source_contact:c.id,continuity_id:c.continuity_id||c.id,q:+Number(q).toFixed(5),v:+Number(v).toFixed(5),source:'INTERNAL_MECHANICAL_PROPAGATION',grounded_basis:true,evidence:false};s.lived.frames.push(f);if(s.lived.frames.length>128)s.lived.frames.splice(0,s.lived.frames.length-128);s.lived.epoch+=f.salience;b.events.push(cp(f));if(b.events.length>64)b.events.splice(0,b.events.length-64);
}
function detectWaveArrivals(){
  const b=B(),zs=C9.b10?.zones||{};for(const z of ROUTE){const w=b.zones[z]||{},grounded=live()&&Number(zs[z]?.cont?.u||0)>.035;if(grounded)continue;if(Math.abs(Number(w.q||0))>.0015||Math.abs(Number(w.v||0))>.008)pushWaveArrival(z,w.q,w.v)}
}
function integrateWave(dt){
  dt=Number(dt)||0;if(dt<=0)return;
  const b=B(),F=exactForces(),H0=storedEnergy();
  for(const m of b.modes)stepMode(m,projectForce(F,m.k),dt);
  reconstruct();detectWaveArrivals();const H1=storedEnergy();
  let work=0;for(let j=0;j<N;j++){const vv=Number(b.zones[ROUTE[j]]?.v||0);work+=F[j]*vv*dt}
  const input=Math.max(0,work)+F.reduce((q,x,j)=>q+Math.abs(x*Number(b.zones[ROUTE[j]]?.v||0))*dt,0),diss=Math.max(0,H0+input-H1);
  b.energy.input_work+=input;b.energy.dissipated+=diss;b.energy.stored=H1;b.energy.pass=H1<=H0+input+1e-6;b.energy.last_t=wall();b.last_force=F;
}
function enrichPopulation(){
  const body=C9.b16?.body||{},wave=B().zones||{};
  for(const z of ROUTE){const bb=body[z],w=wave[z];if(!bb||!w)continue;
    const q=Math.abs(Number(w.q||0)),v=Math.abs(Number(w.v||0));
    bb.population_v18={
      SA1:clamp(Number(bb.population?.SA1||0)+.15*q,0,1.8),
      RA1:clamp(Number(bb.population?.RA1||0)+.055*v,0,1.8),
      SA2:clamp(Number(bb.population?.SA2||0)+.22*q,0,1.8),
      PC:clamp(Number(bb.population?.PC||0)+.035*v,0,1.8),
      CT:clamp(Number(bb.population?.CT||0)+.035*q,0,1.8)
    };
    bb.wave_v18={q:Number(w.q||0),v:Number(w.v||0)};
  }
}
function waveView(){const b=B();return {build:18,identity:'DYNAMIC_SKIN',prep:b.prep,zones:cp(b.zones),modes:b.modes.map(m=>({k:m.k,a:+m.a.toFixed(6),v:+m.v.toFixed(6),energy:(()=>{const {w2}=modalParams(m.k);return +(.5*m.v*m.v+.5*w2*m.a*m.a).toFixed(8)})()})),active_rank:activeRank(),energy:{...b.energy,stored:+Number(b.energy.stored||0).toFixed(8)},recent_events:cp((b.events||[]).slice(-8)),law:'internal mechanical response may propagate; grounded contact evidence stays source-local'}}
function setPrep(name){name=String(name||'').toUpperCase();if(!PREP[name])return {ok:false,error:'prep must be SOFT, NEUTRAL, or BRACED'};const before=B().prep;B().prep=name;if(before!==name){const s=C9.b13;if(s?.lived&&s?.seq){const f={seq:++s.seq.frame,t:+wall().toFixed(4),family:'BODY_PREPARATION',salience:.28,before,after:name,agency:'SELF',evidence:false,world_contact:false};s.lived.frames.push(f);if(s.lived.frames.length>128)s.lived.frames.splice(0,s.lived.frames.length-128);s.lived.epoch+=f.salience;}}return {ok:true,before,after:name,authority:'SELF_ACTION',world_contact:false,evidence:false}}
function planPrep(prop){prop=String(prop||'').toLowerCase();const map={texture:'SOFT',compliance:'NEUTRAL',temperature:'NEUTRAL',mass:'BRACED',linkage:'BRACED'};return map[prop]||'NEUTRAL'}


const advance17=b7Advance;
b7Advance=function(dt){const r=advance17(dt);integrateWave(Math.max(0,Number(dt)||0));enrichPopulation();return r};


const felt17=b7FeltSnapshot;
b7FeltSnapshot=function(){const f=felt17(),b=B();for(const [z,v] of Object.entries(f?.felt||{})){const bz=C9.b16?.body?.[z];if(bz?.wave_v18){v.mechanics_wave_v18={q:+Number(bz.wave_v18.q||0).toFixed(6),v:+Number(bz.wave_v18.v||0).toFixed(6),source:'INTERNAL_PROPAGATION',evidence:false};v.population_v18=Object.fromEntries(Object.entries(bz.population_v18||{}).map(([k,x])=>[k,+Number(x).toFixed(5)]));}}
  f.dynamic_skin_v18={prep:b.prep,active_rank:activeRank(),stored_energy:+storedEnergy().toFixed(8),passive:b.energy.pass};return f};


const cmd17=b7AgentCommandText;
b7AgentCommandText=function(raw){const txt=String(raw||'').trim(),low=txt.toLowerCase();
  if(low==='v18'||low==='dynamic skin'||low==='body wave')return waveView();
  if(low.startsWith('prepare '))return setPrep(txt.slice(8).trim());
  if(low==='prepare'||low==='body prep')return {prep:B().prep,choices:Object.keys(PREP),authority:'SELF_ONLY'};
  if(low==='v18 checkRemoved')return window.B18_CHECKREMOVED();
  if(low==='v18 legacy')return window.B17_CHECKREMOVED?window.B17_CHECKREMOVED():{pass:false,error:'missing v17 suite'};
  const out=cmd17(txt);
  if(low.startsWith('query ')&&out&&typeof out==='object'){
    const parts=txt.split(/\s+/),prop=parts[parts.length-1].toLowerCase();out.mechanical_preparation={recommended:planPrep(prop),authority:'ADVISORY_ONLY',action_taken:false,note:'preparation changes body transfer dynamics, not world truth'};
  }
  if(low==='felt raw'||low==='raw felt'||low==='internalView felt')return b7FeltSnapshot();
  if(low==='felt'&&out&&typeof out==='object')out.dynamic_skin_v18={prep:B().prep,active_rank:activeRank(),stored_energy:+storedEnergy().toFixed(8),passive:B().energy.pass};
  return out;
};

const state17=b7AgentState;
b7AgentState=function(){const s=state17();s.build=18;s.version='DYNAMIC_SKIN';s.patch=V18;s.dynamic_skin={model:'LOW_RANK_DAMPED_GRAPH_WAVE',modes:N,active_rank:activeRank(),prep:B().prep,passivity_ledger:true,contact_evidence_transport:false};return s};
window.REALITI_AGENT={...(window.REALITI_AGENT||{}),state:b7AgentState,felt:()=>b7AgentCommandText('felt'),feltRaw:()=>b7FeltSnapshot(),v18:waveView,prepare:setPrep};

if(window.REALITI_AGENT_DOOR){const help17=window.REALITI_AGENT_DOOR.help,run17=window.REALITI_AGENT_DOOR.run;
  window.REALITI_AGENT_DOOR.help=function(){const h=help17?help17():{commands:[]};h.commands=[...new Set([...(h.commands||[]),'prepare <soft|neutral|braced>','body wave','v18','v18 checkRemoved','v18 legacy'])];h.build18='Dynamic Skin: grounded contact injects a small passive graph-wave body. Internal mechanics may travel; evidence does not.';return h};
  window.REALITI_AGENT_DOOR.run=function(x){const l=String(x||'').trim().toLowerCase();if(l==='help')return window.REALITI_AGENT_DOOR.help();if(l==='v18'||l==='dynamic skin'||l==='body wave'||l==='v18 checkRemoved'||l==='v18 legacy'||l==='prepare'||l==='body prep'||l.startsWith('prepare ')||l==='felt'||l==='felt raw'||l==='raw felt'||l==='internalView felt'||l.startsWith('query '))return b7AgentCommandText(x);return run17(x)};
}

function vecSnapshot(kind='v18'){
  const body=C9.b16?.body||{},v=[];for(const z of ROUTE){const b=body[z]||{};const p=kind==='v18'?(b.population_v18||b.population||{}):(b.population||{});for(const k of ['SA1','RA1','SA2','PC','CT'])v.push(Number(p[k]||0));if(kind==='v18'){const w=b.wave_v18||{};v.push(Number(w.q||0),Number(w.v||0));}}
  return v;
}
function featureStats(rows,key){if(!rows.length)return [];const n=rows[0][key].length,mean=new Array(n).fill(0),sq=new Array(n).fill(0);for(const r of rows)for(let i=0;i<n;i++){const x=Number(r[key][i]||0);mean[i]+=x;sq[i]+=x*x}const out=[];for(let i=0;i<n;i++)out.push(mean[i]/rows.length,Math.sqrt(sq[i]/rows.length));return out}
function dist(a,b,base=.05,mult=.25){let s=0;for(let i=0;i<Math.min(a.length,b.length);i++){const scale=base+mult*Math.max(Math.abs(a[i]),Math.abs(b[i])),d=(a[i]-b[i])/scale;s+=d*d}return Math.sqrt(s)}
function resetFixture(saved){C9=cp(saved);delete C9.b18;if(C9.b10)C9.b10.contact=null;if(C9.b8?.phase)C9.b8.phase.active=false;B()}
function trial(cond,saved){resetFixture(saved);C9.currentRoom='LONGFUR_RUNWAY';const core=window.REALITI_CONTACT_CORE;core.start({material:cond.material,grain:cond.grain,speed:cond.speed,pressure:.68,material_state:cond.state||{}});const rows=[];for(let i=0;i<60;i++){b7Advance(.02);if(i>=10){const base=[],wave=[];for(const z of ROUTE){const bb=C9.b16?.body?.[z]||{},w=B().zones[z]||{};for(const k of ['SA1','RA1','SA2','PC','CT'])base.push(Number(bb.population?.[k]||0));wave.push(Number(w.q||0),Number(w.v||0))}rows.push({base,wave})}}core.release();return {base:featureStats(rows,'base'),wave:featureStats(rows,'wave')}}
function discrimination(saved){const cs={fur:{material:'longfur',grain:'with',speed:.72},against:{material:'longfur',grain:'against',speed:.72},fast:{material:'longfur',grain:'with',speed:1.8},card:{material:'cardboard',grain:'against',speed:.72,state:{crease:.8,dent:.3,wear:.1}}},keys=Object.keys(cs),feat={};for(const k of keys)feat[k]=trial(cs[k],saved);const pairs=[];for(let i=0;i<keys.length;i++)for(let j=i+1;j<keys.length;j++){const a=keys[i],b=keys[j],db=dist(feat[a].base,feat[b].base),dw=dist(feat[a].wave,feat[b].wave,.02,.20),aug=Math.sqrt(db*db+dw*dw);pairs.push({a,b,baseline:+db.toFixed(4),wave:+dw.toFixed(4),augmented:+aug.toFixed(4)})}const hard=pairs.filter(x=>x.baseline<1.5),sb=hard.reduce((q,x)=>q+x.baseline,0),sa=hard.reduce((q,x)=>q+x.augmented,0),allb=pairs.reduce((q,x)=>q+x.baseline,0),alla=pairs.reduce((q,x)=>q+x.augmented,0);return {hard_pairs:hard,ambiguous_gain:+((sa-sb)/Math.max(EPS,sb)).toFixed(4),all_pair_gain:+((alla-allb)/Math.max(EPS,allb)).toFixed(4),pairs}}
void 0;

document.title='REALITI · Cloud Nine Nest';const brand=document.querySelector('#realiti_agent_only_shell .brand');if(brand)brand.textContent='REALITI · Cloud Nine Nest';const sub=document.querySelector('#realiti_agent_only_shell .sub');if(sub)sub.innerHTML='Grounded touch enters a small passive mechanical body. Internal response can travel, ring and decay without moving the evidence that caused it.';try{B();reconstruct();c9save()}catch(e){}
})();