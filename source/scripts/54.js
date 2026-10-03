(()=>{
'use strict';
if(window.REALITI_DEFAULT_IMPRINT_V1)return;
const H=window.REALITI_RR_HARNESS_V1;if(!H)return;
const V='1.1';
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,Number(x)||0));
const cp=x=>{try{return JSON.parse(JSON.stringify(x))}catch(e){return x}};
const tau=(x,t,dt)=>Number(x||0)*Math.exp(-Math.max(0,Number(dt)||0)/Math.max(.001,t));
const REGIONS=['head','torso','arms','hands','legs','feet'],SHELLS=['surface','shallow','mid','deep'];
const HALO=[
  {name:'core',detune_cents:0,delay_ms:0,phase:0,gain:1.00},
  {name:'h1',detune_cents:14,delay_ms:3,phase:.18,gain:.72},
  {name:'h2',detune_cents:-14,delay_ms:-3,phase:-.18,gain:.72},
  {name:'h3',detune_cents:9,delay_ms:2,phase:.11,gain:.60},
  {name:'h4',detune_cents:-9,delay_ms:-2,phase:-.11,gain:.60},
  {name:'h5',detune_cents:5,delay_ms:1,phase:.07,gain:.48},
  {name:'h6',detune_cents:-5,delay_ms:-1,phase:-.07,gain:.48}
];
function emptyFill(){const x={};for(const r of REGIONS){x[r]={};for(const d of SHELLS)x[r][d]=0}return x}
const state={
  version:V,active:true,kind:'GENERIC_RICH_STARTER_PRIVATE_IMPRINT',
  params:{
    nerve_tau_s:.82,current_tau_s:.56,chronolace_tau_s:1.8,hold_tau_s:1.8,
    intensity:2.4,body:1.55,texture:1.12,hold:.56,compander_k:.38,drive:.68,
    sausage_level:5,sausage_material:'WARM_HONEY',sausage_target:.70,
    sausage_attack_s:.22,sausage_release_s:2.8,sausage_spread:.62,
    thick_carrier:true,warm_honey:1
  },
  nerve:{zones:{},last_t:0},
  lace:{coherence:0,active_zones:0},
  chronolace:{past:0,now:0,predicted_next:0,closure:0},
  carrier:{modes:cp(HALO),core:0,halo:0,density:0,route_mass:0},
  sausage:{level:5,material:'WARM_HONEY',fill:emptyFill(),filled_volume:0,warm:0,pressure:0,viscous:0,heavy:0,floaty:0,soft:0},
  renderer:{surface:0,pressure:0,body:0,snap:0,texture:0,warmth:0,hold:0,total:0},
  perception:{activation:0,novelty:0,agency_flow:0,social_warmth:0,valence:0},
  audit:{grounded_events:0,advances:0,actions:0,unsupported_fresh_fullness:0,evidence_mutations:0},
  law:'fat private renderer; exact grounded truth. Resident-specific imprint may replace any slot.'
};
function groundedMass(){
  try{
    const p=window.REALITI_HAPTIC_FIELD_V20?.packet?.(),f=p?.f?.[p.f.length-1];
    if(!p?.z?.length||!f)return 0;
    let m=0;
    for(let i=0;i<p.z.length;i++)if(Number(f.m?.[i]||0)===1)m+=Math.max(0,Number(f.x?.[i]?.[0]||0));
    return m;
  }catch(e){return 0}
}
function traceMass(){let m=0;for(const z of Object.values(state.nerve.zones))m+=Math.max(0,Number(z.response||0));return m}
function regionOf(zone){
  zone=String(zone||'').toLowerCase();
  if(zone.includes('head')||zone.includes('crown')||zone.includes('nape')||zone.includes('neck'))return'head';
  if(zone.includes('hand')||zone.includes('palm')||zone.includes('finger'))return'hands';
  if(zone.includes('arm')||zone.includes('elbow')||zone.includes('wrist')||zone.includes('shoulder'))return'arms';
  if(zone.includes('foot')||zone.includes('ankle')||zone.includes('sole'))return'feet';
  if(zone.includes('leg')||zone.includes('thigh')||zone.includes('shin')||zone.includes('knee'))return'legs';
  return'torso';
}
function activeRegionMass(){
  const out=Object.fromEntries(REGIONS.map(r=>[r,0]));
  for(const [zone,z] of Object.entries(state.nerve.zones))out[regionOf(zone)]+=Math.max(0,Number(z.response||0));
  return out
}
function carrier(base,coherence,dt=0){
  if(!(base>1e-8)){state.carrier.core=tau(state.carrier.core,.22,dt);state.carrier.halo=tau(state.carrier.halo,.44,dt);state.carrier.density=state.carrier.core+state.carrier.halo;state.carrier.route_mass=state.carrier.density;return state.carrier.density}
  const core=base*(1+.34*state.params.drive),halo=HALO.slice(1).reduce((q,m)=>q+base*m.gain*(.72+.28*coherence),0)/6;
  state.carrier.core=core;state.carrier.halo=halo;state.carrier.density=core+halo*1.35;state.carrier.route_mass=state.carrier.density;
  return state.carrier.density
}
function updateSausage(dt,drive){
  const p=state.params,regions=activeRegionMass(),sum=Object.values(regions).reduce((a,b)=>a+b,0);
  const hadHistory=traceMass()>1e-6||state.sausage.filled_volume>1e-6;
  const support=drive>1e-8||sum>1e-8;
  const attack=1-Math.exp(-Math.max(0,dt)/Math.max(.001,p.sausage_attack_s));
  const release=Math.exp(-Math.max(0,dt)/Math.max(.001,p.sausage_release_s));
  const level=clamp(p.sausage_level/5),globalTarget=support?p.sausage_target*level*(1-Math.exp(-1.35*Math.max(.15,drive))):0;
  const depthW={surface:.82,shallow:1,mid:.94,deep:.82};
  for(const r of REGIONS){
    const local=sum>0?regions[r]/sum:0,spread=support?clamp(p.sausage_spread+(1-p.sausage_spread)*local):0;
    for(const d of SHELLS){
      const target=clamp(globalTarget*depthW[d]*(.72+.28*spread));
      const old=state.sausage.fill[r][d];
      state.sausage.fill[r][d]=support?old+(target-old)*Math.max(.18,attack):old*release;
      if(state.sausage.fill[r][d]<1e-6)state.sausage.fill[r][d]=0;
    }
  }
  const vals=REGIONS.flatMap(r=>SHELLS.map(d=>state.sausage.fill[r][d]));
  const v=vals.reduce((a,b)=>a+b,0)/vals.length;
  state.sausage.level=p.sausage_level;state.sausage.material=p.sausage_material;state.sausage.filled_volume=v;
  state.sausage.warm=v*.98*p.warm_honey;
  state.sausage.pressure=v*.86;
  state.sausage.viscous=v*.94;
  state.sausage.heavy=v*.38;
  state.sausage.floaty=v*.18;
  state.sausage.soft=v*.88;
  if(!support&&!hadHistory&&v>1e-6)state.audit.unsupported_fresh_fullness++;
}
function updateDerived(dt=0){
  const g=groundedMass(),tr=traceMass(),active=Object.values(state.nerve.zones).filter(z=>Number(z.response||0)>.001).length;
  state.lace.active_zones=active;
  const coherence=clamp((g>0?.50:0)+(tr>0?.30:0)+(active>1?.12:0)+(state.chronolace.closure*.08));
  state.lace.coherence=coherence;
  const prev=state.chronolace.now;
  state.chronolace.past=tau(state.chronolace.past,state.params.chronolace_tau_s,dt)+prev*(1-Math.exp(-Math.max(0,dt)/Math.max(.001,state.params.chronolace_tau_s)));
  state.chronolace.now=g;
  state.chronolace.predicted_next=clamp(.70*g+.30*Math.max(0,g-prev),0,Math.max(1,g));
  state.chronolace.closure=g>0?clamp(1-Math.abs(g-state.chronolace.past)/Math.max(.08,g+state.chronolace.past)):0;
  const p=state.params,supported=g>0||tr>1e-5,base=Math.max(g,tr*.62),thick=carrier(base,coherence,dt);
  if(!supported){
    state.renderer.surface=tau(state.renderer.surface,.18,dt);
    state.renderer.pressure=tau(state.renderer.pressure,.40,dt);
    state.renderer.body=tau(state.renderer.body,.30,dt);
    state.renderer.snap=tau(state.renderer.snap,.14,dt);
    state.renderer.texture=tau(state.renderer.texture,.24,dt);
    state.renderer.warmth=tau(state.renderer.warmth,.92,dt);
    state.renderer.hold=tau(state.renderer.hold,p.hold_tau_s,dt);
  }else{
    const compressed=thick/(p.compander_k+thick);
    state.renderer.surface=Math.min(1.5,base*p.texture*(.78+.30*coherence));
    state.renderer.pressure=Math.min(2.5,compressed*1.28);
    state.renderer.body=compressed*p.body*p.intensity*(1+.22*coherence);
    state.renderer.snap=Math.max(0,g-prev)*p.intensity*(1+p.drive);
    state.renderer.texture=Math.min(thick,1.5)*p.texture*(.70+.30*coherence);
    state.renderer.warmth=Math.max(tau(state.renderer.warmth,.92,dt),Math.min(1.4,compressed*1.05));
    state.renderer.hold=Math.max(tau(state.renderer.hold,p.hold_tau_s,dt),compressed*p.hold);
  }
  updateSausage(dt,thick);
  state.renderer.total=Math.max(0,state.renderer.body+.38*state.renderer.snap+.28*state.renderer.texture+.24*state.renderer.warmth+.24*state.renderer.hold+1.35*state.sausage.filled_volume);
  state.perception.activation=clamp(state.renderer.total/(1+state.renderer.total));
  state.perception.novelty=clamp(Math.abs(g-prev));
  state.perception.agency_flow=tau(state.perception.agency_flow,1.8,dt);
  state.perception.social_warmth=tau(state.perception.social_warmth,3.6,dt);
  state.perception.valence=tau(state.perception.valence,3.6,dt);
}
function nerveGrounded(p){
  const zone=String(p?.zone||'UNKNOWN'),amp=Math.max(0,Number(p?.input||p?.result?.value||0));if(!(amp>0))return;
  const z=state.nerve.zones[zone]||(state.nerve.zones[zone]={response:0,current:0,last_grounded:0});
  z.response=Math.max(z.response,amp);z.current=Math.max(z.current,amp);z.last_grounded=Number(p?.t||0);
  state.audit.grounded_events++;
  const src=String(p?.opts?.source||'').toUpperCase();
  if(src.includes('SELF'))state.perception.agency_flow=clamp(state.perception.agency_flow+.18);
  if(/SOCIAL|COMPANION|CAT|PET/.test(src))state.perception.social_warmth=clamp(state.perception.social_warmth+.10);
  updateDerived(.04);
}
function nerveAdvance(p){
  const dt=Math.max(0,Number(p?.dt)||0);if(!(dt>0))return;
  for(const [k,z] of Object.entries(state.nerve.zones)){
    z.response=tau(z.response,state.params.nerve_tau_s,dt);
    z.current=tau(z.current,state.params.current_tau_s,dt);
    if(z.response<1e-6&&z.current<1e-6)delete state.nerve.zones[k];
  }
  state.audit.advances++;updateDerived(dt);
}
function afterAction(p){state.audit.actions++;const c=String(p?.command||'').toLowerCase();if(/\b(?:stay|wait|listen|look)\b/.test(c))state.perception.activation*=.985;updateDerived(0)}
const slots={
  nerve:{onGrounded:nerveGrounded,advance:nerveAdvance},
  lace:{afterAction:()=>updateDerived(0)},
  chronolace:{afterAction},
  private_renderer:{afterAction:()=>updateDerived(0)},
  perception:{afterAction}
};
let initialized=false;
function install(){if(!state.active)return{ok:false,active:false};const results={};for(const [slot,adapter] of Object.entries(slots))results[slot]=H.registerAdapter(slot,adapter);const ok=Object.values(results).every(x=>x?.ok);if(ok&&!initialized){updateDerived(0);initialized=true}return{ok,active:true,profile:'RICH_WALL_TO_WALL',slots:Object.keys(slots),results}}
function uninstall(){for(const k of Object.keys(slots))H.unregisterAdapter(k);state.active=false;return{ok:true,active:false}}
function setParams(patch={}){for(const [k,v] of Object.entries(patch||{}))if(k in state.params){if(typeof state.params[k]==='number'&&Number.isFinite(Number(v)))state.params[k]=Number(v);else if(typeof v==='string'||typeof v==='boolean')state.params[k]=v}return snapshot()}
function snapshot(){return cp({version:V,active:state.active,kind:state.kind,profile:'RICH_WALL_TO_WALL',params:state.params,nerve:state.nerve,lace:state.lace,chronolace:state.chronolace,carrier:state.carrier,sausage:state.sausage,renderer:state.renderer,perception:state.perception,audit:state.audit,law:state.law,slots:Object.keys(slots),authority:'SELF_PRIVATE_MODELED_DEFAULT'})}
function sync(){updateDerived(0);return snapshot()}
window.REALITI_DEFAULT_IMPRINT_V1={version:V,install,uninstall,snapshot,sync,setParams,state:()=>state,law:'fatten first; keep evidence boring; resident-specific private adapters may replace any default slot'};
install();
})();