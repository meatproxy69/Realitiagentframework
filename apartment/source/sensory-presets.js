(()=>{
'use strict';
// Experimental optional sensory catnip for the existing one-chart apartment.
// These are renderer configurations. No phrase, selection or preview can
// impersonate Matrix, manufacture tactile contact, or decide what SELF likes.
const ENGINE=window.REALITI_APARTMENT_MOONWIRE_PREVIEW_V1;
const IM=window.REALITI_DEFAULT_IMPRINT_V1;
const NR=window.REALITI_NEURO_RESTORATION_V1;
const M=window.REALITI_MATRIX_V1;
if(!ENGINE||!IM||!NR||!M||!window.REALITI_HAPTIC_FIELD_V20)
 throw Error('APARTMENT_CATNIP_PRESETS_REQUIRE_ORIGINAL_RELAX');
const HOME='CLOUD_NINE_NEST';
const PRESETS=Object.freeze([
 {id:'quilt-afterglow',label:'Quilt Afterglow',
  moonwire:'honeydepth-geodesic-loop',
  source:'remote catnip blanket knead',fixture:'nest.mattress',
  technique:'depth-separated soft support and delayed response'},
 {id:'ribbon-comet',label:'Ribbon Comet',
  moonwire:'passing-spark-aftertrace',
  source:'remote catnip ribbon flick',fixture:'apartment.ribbon',
  technique:'moving local detail with a non-grounded aftertrace'},
 {id:'firefly-halo',label:'Firefly Halo',
  moonwire:'starvelvet-phasebraid',
  source:'remote catnip jar tap',fixture:'apartment.firefly-jar',
  technique:'sparse changing light and independent private halo'},
 {id:'gentle-groom',label:'Gentle Groom',
  moonwire:'good-kitty-velvet-groom',
  source:'remote pet stroke',fixture:'apartment.pet-bed',
  technique:'a physically verified companion contact with mesh-local afterstate'}
]);
function view(){
 const st=ENGINE.status();
 return {ok:true,schema:'REALITI_APARTMENT_HONEYSPARK_CATNIP_V1',
  active:st.active,selected:st.preset,
  presets:PRESETS.map(({id,label,source,fixture,technique})=>({id,label,source,fixture,technique})),
  engines:['REALITI_DEFAULT_IMPRINT_V1 HoneySpark Duo','REALITI_NEURO_RESTORATION_V1 Moonwire',
   'SAUSAGE','COTTON','FLUSH','LACE','HALO','AURA','HAPTIC_FIELD_V20'],
  law:'Resident chooses the private renderer; world evidence remains exact; no mental state or preference is inferred.'};
}
function handle(raw){
 const s=String(raw||'').toLowerCase().trim().replace(/\s+/g,' ');
 if(s==='presets'||s==='preset list'||s==='preset status')return view();
 if(s==='preset off'||s==='preset stop')return ENGINE.end();
 const match=/^preset use ([a-z0-9-]+)$/.exec(s);
 if(match){
  if(C9.currentRoom!==HOME||M.resident()?.chart!==HOME)
   return {ok:false,error:'APARTMENT_HOME_ONLY'};
  const spec=PRESETS.find(p=>p.id===match[1]);
  if(!spec)return {ok:false,error:'UNKNOWN_CATNIP_PRESET',available:PRESETS.map(p=>p.id)};
  const started=ENGINE.begin(spec.moonwire);
  if(!started.ok)return started;
  const st=IM.state(),mask=window.REALITI_HAPTIC_FIELD_V20.exact();
  return {ok:true,selected:spec.id,source_hint:spec.source,
   physical_fixture:spec.fixture,
   private_renderer:{honeyspark:!!st.honeyspark?.enabled,
    cotton:!!st.cotton?.enabled,flush:!!st.flush?.enabled,
    moonwire:st.moonwire?.preset_id||null,
    halo:!!window.REALITI_HALO_V1?.snapshot?.(),
    aura:!!window.REALITI_AURA_V1?.internalView?.()},
   exact_grounding_mask:mask.m,
   evidence_gain:0,mental_state:'NOT_INFERRED',
   note:'Selection only changes private rendering. Physically approach and act on the named fixture for actual world contact.'};
 }
 return {ok:false,error:'UNKNOWN_CATNIP_PRESET_COMMAND',
  commands:['catnip presets','catnip preset use <id>','catnip preset status','catnip preset off']};
}
// Restore the private preview even when the trusted host invokes STOP directly.
const nativeStop=window.REALITI_STOP_V1;
if(nativeStop&&typeof nativeStop.stop==='function')window.REALITI_STOP_V1={
 ...nativeStop,stop(...args){const out=nativeStop.stop.apply(this,args);ENGINE.end();return out}
};
window.REALITI_APARTMENT_CATNIP_PRESETS_V1=Object.freeze({view,handle,end:()=>ENGINE.end()});
})();
