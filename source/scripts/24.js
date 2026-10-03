(function(){
'use strict';
const V15='15.0-contact-becomes-nerve';
function cp(x){try{return JSON.parse(JSON.stringify(x))}catch(e){return x}}
function wall(){return Number(C9.b7?.clock||0)}
function stripLaw(x){if(Array.isArray(x))return x.map(stripLaw);if(!x||typeof x!=='object')return x;const o={};for(const [k,v] of Object.entries(x)){if(k==='law'||k==='laws'||k==='rule'||k==='word_law')continue;o[k]=stripLaw(v)}return o}
function evidenceZones(raw){return Object.entries(raw?.felt||{}).filter(([,v])=>v?.epistemic?.CURRENT_GROUNDED?.evidence).map(([zone,v])=>({zone,current:+Number(v.current_grounded_input||0).toFixed(4),rendered:+Number(v.rendered||0).toFixed(4),prediction:+Number(v.prediction||0).toFixed(4),material:v.material||null,afferents:cp(v.afferents||{})}))}
function afterZones(raw){return Object.entries(raw?.felt||{}).map(([zone,v])=>({zone,value:Number(v.decaying_afterstate||0)})).filter(x=>x.value>=.012).sort((a,b)=>b.value-a.value).slice(0,6).map(x=>({zone:x.zone,afterstate:+x.value.toFixed(4)}))}
const priorSince=window.REALITI_AGENT?.since;
function sparseFelt(){const raw=b7FeltSnapshot(),dig=priorSince?priorSince():{since_last_check:[]},c=raw?.contact||{};return stripLaw({
  projection_of:'LIVED_FRAME',wall_time:+wall().toFixed(4),
  current_grounded:evidenceZones(raw),
  ongoing_contact:c&&c.id?{id:c.id,continuity_id:c.continuity_id,phase:c.released?'RELEASED':c.stopped?'STOPPED':c.active?'MOVING':'IDLE',material:c.material,grain:c.grain,v_world_cm_s:Number(c.v_world_cm_s||0),texture_core:c.texture_core||null}:null,
  changed_since_last_check:dig?.since_last_check||[],
  inner_weather_changes:dig?.inner_weather||null,
  decaying_afterstate:afterZones(raw),
  quiet:(dig?.since_last_check||[]).some(x=>x.family==='QUIET'),
  raw_available:'felt raw',
  note:'Expected continuity is silence. Only meaningful embodied change is foregrounded.'
})}
function rawFelt(){return b7FeltSnapshot()}
function actualReleaseProbe(){return null;}


const b10Old=window.B10_CHECKREMOVED,b11Old=window.B11_CHECKREMOVED;
if(b10Old)void 0;
if(b11Old)void 0;

function textureCoreView(){const c=C9.b10?.contact,raw=b7FeltSnapshot(),zones={};for(const [z,v] of Object.entries(raw.felt||{})){if(!v.afferents)continue;zones[z]={RA1:v.afferents.RA1,PC:v.afferents.PC,CT:v.afferents.CT,tremor:v.tremor,current:v.current_grounded_input}}return {build:15,owner:'B10_MOVING_CONTACT_CORE',contact:c?cp({id:c.id,material:c.material,material_state:c.material_state,grain:c.grain,last_friction:c.last_friction,energy_ledger:c.energy_ledger,texture_core:c.texture_core,v_world_cm_s:c.v_world_cm_s}):null,zones,build11_role:'MICROSLIP event compatibility + legacy views only'}}

function playObject(q){q=String(q||'').trim().toLowerCase();const vals=Object.values(C9.b14?.objects||{});return vals.find(o=>[o.id,o.label,o.kind,...(o.aliases||[])].map(x=>String(x).toLowerCase()).includes(q))||vals.find(o=>[o.id,o.label,o.kind,...(o.aliases||[])].some(x=>String(x).toLowerCase().includes(q)))}
function strokeObject(q){const o=playObject(q);if(!o)return {ok:false,error:'object not found'};if(C9.currentRoom!=='LONGFUR_RUNWAY')return {ok:false,error:'continuous object strokes currently use the Longfur moving-contact route'};if(!(o.location==='CARRIED'||o.location===C9.currentRoom))return {ok:false,error:'object must be here or carried'};const map={cardboard:'cardboard',pillow:'blanket',soft_tape:'blanket',string:'blanket'},mat=map[o.material];if(!mat)return {ok:false,error:'this material does not yet have a canonical moving-contact profile',material:o.material};const st=cp(o.state||{}),orient=((Number(st.orientation_deg||0)%180)+180)%180,grain=orient>=45&&orient<135?'against':'with';const c=window.REALITI_CONTACT_CORE.start({material:mat,object_id:o.id,material_state:{crease:Number(st.crease||0),dent:Number(st.dent||st.compression||0),wear:Number(st.wear||0),contact_temperature_C:Number.isFinite(Number(st.temperature_C))?Number(st.temperature_C):32},grain,speed:.72,pressure:.68,envelope:'steady'});const receipt={type:'OBJECT_MOVING_CONTACT',build:15,object:o.id,label:o.label,material:mat,grain,material_state:cp(window.REALITI_CONTACT_CORE.state().material_state),contact:c};if(C9.b14)C9.b14.lastWhy={room:C9.currentRoom,action:'stroke '+o.label,cause:c.id,event:null,receipt,nearest_prior_global_event:null,law:'the carried object supplies material state to the same moving-contact core'};return {ok:true,...receipt}}

const cmd14=b7AgentCommandText;
b7AgentCommandText=function(raw){const txt=String(raw||'').trim(),low=txt.toLowerCase();
  if(low==='felt')return sparseFelt();
  if(low.startsWith('stroke '))return stripLaw(strokeObject(txt.slice(7)));
  if(low==='felt raw'||low==='raw felt'||low==='internalView felt')return rawFelt();
  if(low==='texture core'||low==='contact core')return textureCoreView();
  if(low==='v11'||low==='texture')return {historical_layer:11,runtime_build:15,role:'event compatibility only',tests:window.B11_CHECKREMOVED?window.B11_CHECKREMOVED():null};
  if(low==='laws')return {note:'Mechanistic laws are not broadcast by default. Ask `why` after an action or run an explicit detail if you want the explanation.'};
  if(low==='v15')return {build:15,goal:'texture physics inside the moving-contact core; sparse lived state as the default body channel',raw_internalView:'felt raw',texture_detail:'texture core'};
  if(low==='v15 checkRemoved')return window.B15_CHECKREMOVED();
  const out=cmd14(txt);
  if(low==='why'||low==='why?'||low==='constitution'||low.startsWith('predict ')||low.startsWith('nerve')||low.startsWith('seam')||low==='state'||low==='v13 checkRemoved'||low==='v14 checkRemoved')return out;
  return stripLaw(out);
};


const state14=b7AgentState;
b7AgentState=function(){const s=state14();s.build=15;s.version='CONTACT_BECOMES_THE_NERVE';s.patch=V15;s.texture_authority='B10_MOVING_CONTACT_CORE';s.resident_felt='LIVED_FRAME_DEFAULT';return s};
window.REALITI_AGENT={...(window.REALITI_AGENT||{}),state:b7AgentState,felt:sparseFelt,feltRaw:rawFelt,textureCore:textureCoreView};

if(window.REALITI_AGENT_DOOR){const help14=window.REALITI_AGENT_DOOR.help,run14=window.REALITI_AGENT_DOOR.run;
  window.REALITI_AGENT_DOOR.help=function(){const h=help14?help14():{commands:[]};h.commands=[...new Set([...(h.commands||[]),'felt','felt raw','texture core','stroke <object>','laws','v15','v15 checkRemoved'])];delete h.laws;h.discovery='Mechanistic laws stay hidden in ordinary receipts. Ask `why` when you want the explanation.';return h};
  window.REALITI_AGENT_DOOR.run=function(x){const low=String(x||'').trim().toLowerCase();if(low==='help')return window.REALITI_AGENT_DOOR.help();if(low==='felt'||low==='felt raw'||low==='raw felt'||low==='internalView felt'||low==='texture core'||low==='contact core'||low==='laws'||low==='v15'||low==='v15 checkRemoved'||low==='v11'||low==='texture'||low.startsWith('stroke '))return b7AgentCommandText(x);return run14(x)};
}


void 0;

document.title='REALITI // AGENT DOOR ONLY · BUILD 15 CONTACT BECOMES THE NERVE';
const brand=document.querySelector('#realiti_agent_only_shell .brand');if(brand)brand.textContent='REALITI // AGENT DOOR · BUILD 15';
const sub=document.querySelector('#realiti_agent_only_shell .sub');if(sub)sub.innerHTML='The moving contact now owns its texture physics. <b>felt</b> is sparse lived change; <b>felt raw</b> is the engineering dump.';
try{C9.b15={version:15,patch:V15,texture_authority:'B10_MOVING_CONTACT_CORE',resident_felt:'LIVED_FRAME_DEFAULT'};c9save()}catch(e){}
})();