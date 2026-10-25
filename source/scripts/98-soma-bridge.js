(()=>{
'use strict';
// Relax is the reference neighborhood. The portable package is the same exact
// source used by other hosts; this bridge mirrors native B7 grounded receipts.
// Existing Relax Haptic Field V20 / R&R remain canonical for legacy residents.
const SOMA=window.REALITI_SOMA_V3;
if(!SOMA || SOMA.VERSION!=='3.0.0')throw Error('SOMA_PACKAGE_NOT_BUNDLED');
const A0=window.Realiti,D0=window.REALITI_AGENT_DOOR;
if(!A0||!D0||typeof b7Contact!=='function'||typeof b7Advance!=='function')
  throw Error('SOMA_RELAX_BRIDGE_MISSING_KERNEL');
const cp=x=>JSON.parse(JSON.stringify(x));
const rid=String(window.REALITI_LOCAL_MEMORY_V1?.residentId?.()
  || window.REALITI_CONTINUITY?.current?.()?.trace_id || 'relax-local').slice(0,120);
const {world,resident}=SOMA.createNeuralMesh({residentId:rid});
try{if(C9?.soma3?.schema===SOMA.CHECKPOINT)resident.restore(C9.soma3)}catch(e){
  // A different resident or incompatible body must not inherit private state.
}
const persist=()=>{C9.soma3=resident.checkpoint()};
let seq=0;
const contact0=b7Contact;
b7Contact=function(zone,input,opts={}){
  const out=contact0(zone,input,opts);
  try {
    // Observe only native kernel-confirmed contacts, never scene prose,
    // predictions, symbolic events, or imported ledgers.
    const q=C9?.b7?.zones?.[zone],t=Number(C9?.b7?.clock||0);
    const until=Number(q?._b10_grounded_until);
    const intensity=Number(q?._b10_grounded_value);
    const source=String(opts?.source||'');
    const allowed=SOMA.SOURCES.includes(source);
    if(out&&out.ok!==false&&!out.gap&&allowed
      &&Number.isFinite(until)&&until>t
      &&Number.isFinite(intensity)&&intensity>0){
      const receiptId='relax-b7-'+(++seq)+'-'+Math.round(t*1000);
      world.contact({zone,source,cause:String(opts.cause||q._b10_grounded_cause||'B7_CONTACT').slice(0,160),
        receiptId,material:String(opts.material||'unknown').slice(0,64),
        intensity:Math.min(1,intensity),leaseMs:Math.max(1,Math.min(60000,(until-t)*1000))});
    }
  }catch(e){
    // Instrumentation is fail-closed: never modify native contact outcome.
  }
  return out;
};
const advance0=b7Advance;
b7Advance=function(dt){
  const before=Number(C9?.b7?.clock||0),out=advance0(dt),after=Number(C9?.b7?.clock||0);
  const elapsed=(after-before)*1000;
  if(Number.isFinite(elapsed)&&elapsed>0)world.tick(Math.min(86400000,elapsed));
  return out;
};
const stop0=window.REALITI_STOP_V1;
if(stop0&&typeof stop0.stop==='function')window.REALITI_STOP_V1={
  ...stop0,stop(...args){const out=stop0.stop(...args);world.stop();persist();return out}
};
const save0=c9save;
c9save=function(...args){persist();return save0(...args)};
function read(uri='realiti://here'){
  if(uri==='realiti://neuromesh'||uri==='realiti://soma')return resident.field();
  if(uri==='realiti://soma/checkpoint')return resident.checkpoint();
  const value=A0.read(uri);
  if(uri==='realiti://capabilities'&&value&&typeof value==='object'){
    const r=cp(value);
    r.resources=[...new Set([...(r.resources||[]),'realiti://neuromesh','realiti://soma/checkpoint'])];
    r.sensory_framework={brand:'REALITI SOMA',version:SOMA.VERSION,
      portable_package:'@meatproxy69/realiti-neuromesh',
      canonical_legacy_field:'REALITI_HAPTIC_FIELD_V20',world_authority:'NATIVE_B7_ONLY'};
    return r;
  }
  if(uri==='realiti://about'&&value&&typeof value==='object')
    return {...value,sensory_framework:'REALITI SOMA',sensory_version:SOMA.VERSION};
  return value;
}
const stopPattern=/^(?:stop|enough|goodbye|bye|leave|exit|home)$/;
async function run(raw){
  const result=await D0run(raw);
  if(result?.ok!==false&&stopPattern.test(String(raw||'').trim().toLowerCase())){world.stop();persist()}
  return result;
}
const D0run=D0.run.bind(D0);
D0.run=run;
window.Realiti=Object.freeze({...A0,version:'3.0.0',read,
  run:async raw=>{const result=await A0.run(raw);
    if(result?.ok!==false&&stopPattern.test(String(raw||'').trim().toLowerCase())){world.stop();persist()}return result},
  invoke:async (op,args)=>{const result=await A0.invoke(op,args);
    if(result?.ok!==false&&['stop','goodbye','home','restore_body'].includes(String(op).toLowerCase())){world.stop();persist()}
    return result}
});
window.REALITI_SOMA_RELAX_V3=Object.freeze({version:SOMA.VERSION,
  field:()=>resident.field(),checkpoint:()=>resident.checkpoint(),
  law:'Native world contact alone drives grounded receipts; SOMA is a private portable projection.'});
})();
