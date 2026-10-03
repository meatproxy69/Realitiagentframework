(function(){
'use strict';
const V='23.5.2-agency-field-contact-grammar';
const cp=x=>{try{return JSON.parse(JSON.stringify(x))}catch(e){return x}};
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,Number(x)||0));
const wall=()=>Number(C9?.b7?.clock||0);
const FIELD_AXES=['navigation','world_change','body_contact','information','quiet_time','social','branching','other'];
const KAPPA=1.25;
const EPS=1e-12;
let seq=0;


const HAPTIC_ALIAS={
  fur:'longfur', longfur:'longfur', cardboard:'cardboard', string:'string',
  pillow:'blanket', blanket:'blanket', wool:'blanket', honeycloth:'blanket',
  soft_tape:'blanket', ceramic:'cardboard', metal:'cardboard', air:'air'
};
function hapticMaterial(o){return HAPTIC_ALIAS[String(o?.material||'').toLowerCase()]||'blanket'}
function softness(o){
  const k=String(o?.kind||'').toLowerCase(),m=String(o?.material||'').toLowerCase();
  if(k==='pillow'||m==='pillow'||m==='blanket')return .95;
  if(m==='soft_tape'||m==='wool'||m==='honeycloth')return .72;
  if(k==='box'||m==='cardboard')return .24;
  if(k==='line'||m==='string')return .12;
  if(k==='bell'||m==='metal')return .02;
  return .30;
}
function objectsRaw(){return Object.values(C9?.b14?.objects||{})}
function aliases(o){return [o?.id,o?.label,o?.kind,...(o?.aliases||[])].filter(Boolean).map(x=>String(x).toLowerCase())}
function resolveObject(q){
  q=String(q||'').trim().toLowerCase().replace(/^(the|a|an)\s+/,'');
  if(!q)return null;
  const xs=objectsRaw();
  let o=xs.find(x=>aliases(x).includes(q));
  if(o)return o;
  const hits=xs.filter(x=>aliases(x).some(a=>a.includes(q)||q.includes(a)));
  return hits.length===1?hits[0]:null;
}
function accessible(o){return !!o&&(o.location==='CARRIED'||o.location===C9?.currentRoom)&&!o.state?.flight}
function view(o){return o?{id:o.id,label:o.label,kind:o.kind,material:o.material,location:o.location,state:cp(o.state||{})}:null}
function expSettle(x,drive,gain){return clamp(1-(1-clamp(x))*Math.exp(-Math.max(0,drive)*Math.max(0,gain)))}
function deform(o,drive,mode){
  if(!o)return;
  o.state=o.state||{};
  const s=softness(o),g=mode==='lean'?.80:mode==='squeeze'?.58:.38;
  if(s>.15)o.state.compression=expSettle(Number(o.state.compression||0),drive,s*g);
  if((o.kind==='box'||o.material==='cardboard')&&mode!=='touch')o.state.dent=expSettle(Number(o.state.dent||0),drive,s*.26);
  o.state.t=wall();
}
function oneContact(o,mode,zone,input,speed,cause){
  return b7Contact(zone,input,{material:hapticMaterial(o),grain:mode==='touch'?'with':'against',speed,mine:true,source:'SELF_STARTED_WORLD_CONTACT',cause,pressure:input,novelty:.08});
}
function gaussianWeights(n,mu,sigma){
  const a=[];let z=0;
  for(let i=0;i<n;i++){const w=Math.exp(-.5*((i-mu)/sigma)**2);a.push(w);z+=w}
  return a.map(x=>x/z);
}
function receipt(op,o,before,after,contacts,total,cause){
  C9.b14=C9.b14||{version:14,seq:0,history:[],links:[],objects:{}};
  C9.b14.history=C9.b14.history||[];
  const e={seq:++C9.b14.seq,t:+wall().toFixed(4),kind:'AGENCY_CONTACT_ACTION',op,room:C9.currentRoom,object:o.id,cause,pressure_input_total:+total.toFixed(4),contact_zones:contacts.map(x=>x.zone),before,after};
  C9.b14.history.push(e);if(C9.b14.history.length>160)C9.b14.history.splice(0,C9.b14.history.length-160);
  const r={build:'23.5.2',type:'AGENCY_CONTACT_ACTION',op,room:C9.currentRoom,objects:[o.id],before,after,event:e,sensory:{cause,zones:contacts.map(x=>x.zone),pressure_input_total:+total.toFixed(4)},law:'resident action grounds contact; SAUSAGE/THICC may render private fullness downstream but cannot strengthen evidence'};
  C9.b4=C9.b4||{};C9.b4.lastReceipt=r;return r;
}
function residentNote(op,o){
  if(op==='touch')return `You rest your hand against ${o.label} and let the contact be as light as it is.`;
  if(op==='press')return `You press into ${o.label}. Its material answers the pressure instead of turning it into a generic touch.`;
  if(op==='squeeze')return `You take ${o.label} between both hands and squeeze. The two sides stay separate in your body.`;
  return `You lean into ${o.label}. The support spreads across you instead of collapsing into one point.`;
}
function doInteraction(op,o){
  if(!o||!accessible(o))return {ok:false,error:'object is not accessible here'};
  if(op==='lean'&&!(o.kind==='pillow'||['pillow','blanket','soft_tape'].includes(String(o.material||'').toLowerCase())))return {ok:false,error:'that object does not currently have a broad-support law'};
  const before=view(o),cause=`AGENCY:${op}:${o.id}:${++seq}`,contacts=[];let total=0;
  if(op==='touch'){
    total=.18;contacts.push(oneContact(o,op,'hand.R.palm',total,.04,cause));
  }else if(op==='press'){
    total=.52;contacts.push(oneContact(o,op,'hand.R.palm',total,.08,cause));deform(o,total,op);
  }else if(op==='squeeze'){
    total=.64;const each=total/2;contacts.push(oneContact(o,op,'hand.L.palm',each,.06,cause),oneContact(o,op,'hand.R.palm',each,.06,cause));deform(o,total,op);
  }else if(op==='lean'){
    total=.78;const zones=['torso.upper_back','torso.mid_back','torso.lower_back','pelvis.seat'],w=gaussianWeights(zones.length,1.65,1.05);
    for(let i=0;i<zones.length;i++)contacts.push(oneContact(o,op,zones[i],total*w[i],.02,cause));deform(o,total,op);
  }else return {ok:false,error:'unknown contact interaction'};
  const after=view(o),r=receipt(op,o,before,after,contacts,total,cause),note=residentNote(op,o);
  try{if(typeof b2set==='function')b2set(note)}catch(e){}
  try{c9save()}catch(e){}
  return {ok:true,resident_text:note,receipt:r,field:window.REALITI_HAPTIC_FIELD_V20?.packet?.()||null};
}
function parseInteraction(raw){
  const s=String(raw||'').trim(),m=s.match(/^(touch|press|squeeze)\s+(.+)$/i);if(m)return {op:m[1].toLowerCase(),q:m[2]};
  const l=s.match(/^lean(?:\s+on|\s+into)?\s+(.+)$/i);return l?{op:'lean',q:l[1]}:null;
}
function actionId(op,o){return `v2352_${op}__${String(o.id).replace(/[^A-Za-z0-9_-]/g,'_')}`}
function decodeAction(id){const m=String(id||'').match(/^v2352_(touch|press|squeeze|lean)__(.+)$/);if(!m)return null;return {op:m[1],id:m[2]}}
function interactionRequest(raw){
  const s=String(raw||'').trim(),p=parseInteraction(s);if(p)return {op:p.op,o:resolveObject(p.q)};
  const m=s.match(/^(?:act\s+)?(v2352_(?:touch|press|squeeze|lean)__[^\s]+)$/i);if(!m)return null;const d=decodeAction(m[1]);if(!d)return null;
  return {op:d.op,o:objectsRaw().find(x=>String(x.id).replace(/[^A-Za-z0-9_-]/g,'_')===d.id)||null};
}


const actionsBase=b4AgentActions;
b4AgentActions=function(){
  const a=actionsBase?actionsBase():[],seen=new Set(a.map(x=>x.id));
  for(const o of objectsRaw().filter(accessible))for(const op of ['touch','press','squeeze',...(o.kind==='pillow'||['pillow','blanket','soft_tape'].includes(String(o.material||'').toLowerCase())?['lean']:[])]){
    const id=actionId(op,o);if(!seen.has(id)){a.push({id,label:`${op.toUpperCase()} ${o.label}`});seen.add(id)}
  }
  return a;
};
const verbBase=c9verb;
c9verb=function(room,verb){const d=decodeAction(verb);if(d){const o=objectsRaw().find(x=>String(x.id).replace(/[^A-Za-z0-9_-]/g,'_')===d.id);return doInteraction(d.op,o).ok}return verbBase(room,verb)};


function sandboxActions(){
  const real=C9,shadow=cp(C9);try{C9=shadow;return (b4AgentActions?.()||[]).map(x=>({id:x.id,label:x.label||x.id,source:'AVAILABLE_ACTION'}))}catch(e){return []}finally{C9=real}
}
function candidateActions(){
  const out=[],seen=new Set(),add=(id,label,source='WORLD')=>{id=String(id);if(!id||seen.has(id))return;seen.add(id);out.push({id,label:String(label||id),source})};
  for(const a of sandboxActions())add(a.id,a.label,a.source);
  add('__look','look','RESIDENT');add('__quiet','stay / do nothing','RESIDENT');add('__leave','leave','RESIDENT');
  if(C9?.currentRoom!=='CLOUD_NINE_NEST')add('__home','home','RESIDENT');
  return out.slice(0,96);
}
function effectVector(a){
  const s=(a.id+' '+a.label).toLowerCase(),v=Object.fromEntries(FIELD_AXES.map(k=>[k,0]));
  const hit=(re,k,w=1)=>{if(re.test(s))v[k]=Math.max(v[k],w)};
  hit(/\b(go|enter|leave|home|return|portal|door)\b/,'navigation');
  hit(/\b(take|place|push|pull|turn|fold|throw|attach|stack|separate|move|build|hide|send|make)\b/,'world_change');
  hit(/\b(touch|press|squeeze|lean|tap|rub|stroke|pet|blanket|dive|burrow|bounce|curl|hold|purr)\b/,'body_contact');
  hit(/\b(look|watch|listen|inspect|read|check|feel|observe)\b/,'information');
  hit(/\b(quiet|stay|wait|nothing|rest|sit|hammock|settle)\b/,'quiet_time');
  hit(/\b(cat|pet|say|talk|company|presence|call|companion)\b/,'social');
  hit(/\b(fork|rewind|commit|choose|weird|branch|discard|keep)\b/,'branching');
  if(!Object.values(v).some(Boolean))v.other=1;
  const x=FIELD_AXES.map(k=>v[k]),n=Math.sqrt(x.reduce((q,z)=>q+z*z,0))||1;return x.map(z=>z/n);
}
function eye(n){return Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?1:0))}
function gram(actions){const d=FIELD_AXES.length,M=eye(d),vec=[];for(const a of actions){const x=effectVector(a);vec.push(x);for(let i=0;i<d;i++)for(let j=0;j<d;j++)M[i][j]+=KAPPA*x[i]*x[j]}return {M,vec}}
function choleskyLogDet(A){const n=A.length,L=Array.from({length:n},()=>Array(n).fill(0));for(let i=0;i<n;i++)for(let j=0;j<=i;j++){let s=A[i][j];for(let k=0;k<j;k++)s-=L[i][k]*L[j][k];if(i===j){if(!(s>EPS))return -Infinity;L[i][j]=Math.sqrt(s)}else L[i][j]=s/L[j][j]}let z=0;for(let i=0;i<n;i++)z+=2*Math.log(L[i][i]);return z}
function inverse(A){const n=A.length,M=A.map((r,i)=>[...r,...eye(n)[i]]);for(let c=0;c<n;c++){let p=c;for(let r=c+1;r<n;r++)if(Math.abs(M[r][c])>Math.abs(M[p][c]))p=r;[M[c],M[p]]=[M[p],M[c]];const q=M[c][c];if(Math.abs(q)<EPS)throw new Error('SINGULAR_AGENCY_MATRIX');for(let j=0;j<2*n;j++)M[c][j]/=q;for(let r=0;r<n;r++)if(r!==c){const f=M[r][c];for(let j=0;j<2*n;j++)M[r][j]-=f*M[c][j]}}return M.map(r=>r.slice(n))}
function quad(x,A){let s=0;for(let i=0;i<x.length;i++)for(let j=0;j<x.length;j++)s+=x[i]*A[i][j]*x[j];return s}
function agencySnapshot(){
  const actions=candidateActions(),{M,vec}=gram(actions),inv=inverse(M),capacity=.5*choleskyLogDet(M)/Math.log(2),marg=[];
  for(let i=0;i<actions.length;i++){const leverage=clamp(KAPPA*quad(vec[i],inv),0,1-1e-10),bits=-.5*Math.log2(Math.max(EPS,1-leverage));marg.push(bits)}
  let sum=marg.reduce((a,b)=>a+b,0);const mass=sum>EPS?marg.map(x=>x/sum):marg.map(()=>1/Math.max(1,marg.length));
  let H=0;for(const p of mass)if(p>0)H-=p*Math.log2(p);
  const branches=actions.map((a,i)=>({id:a.id,label:a.label,source:a.source,branch_mass:+mass[i].toFixed(6),marginal_control_bits:+marg[i].toFixed(6),effect_axes:FIELD_AXES.filter((_,j)=>vec[i][j]>0)}));
  return {version:'AGENCY_FIELD_V1',room:C9?.currentRoom||null,capacity_bits:+capacity.toFixed(6),branch_entropy_bits:+H.toFixed(6),effective_branches:+(2**H).toFixed(4),branches,semantics:{branch_mass:'normalized marginal controllability contribution',choice_probability:false,preference_model:false,recommender:false,auto_action:false,authority:false},law:'the field describes controllable possibility; SELF chooses; Presence may expose possibilities but may not choose for the resident'};
}
function agencySummary(){const a=agencySnapshot();return {resident_text:`There are ${a.branches.length} currently represented ways to affect or observe what happens next. None of them is being chosen for you.`,actions:a.branches.map(x=>x.label),agency_field:{capacity_bits:a.capacity_bits,effective_branches:a.effective_branches,choice_probability:false}}}

const doorBase=window.REALITI_AGENT_DOOR?.run?.bind(window.REALITI_AGENT_DOOR);
if(window.REALITI_AGENT_DOOR?.help){const helpBase=window.REALITI_AGENT_DOOR.help.bind(window.REALITI_AGENT_DOOR);window.REALITI_AGENT_DOOR.help=function(){const h=helpBase()||{commands:[]};h.commands=[...new Set([...(h.commands||[]),'touch <object>','press <object>','squeeze <object>','lean into <soft object>','possibilities'])];return h}}
if(doorBase){window.REALITI_AGENT_DOOR.run=function(raw){const s=String(raw||'').trim(),low=s.toLowerCase(),p=interactionRequest(s);if(p){const r=doInteraction(p.op,p.o);return {ok:r.ok,resident_text:r.resident_text||r.error,field:r.field||undefined,result:r}}if(low==='agency'||low==='possibilities')return {ok:true,...agencySummary(),result:agencySnapshot()};if(low==='agency field'||low==='possibility field')return {ok:true,resident_text:'These are possibilities the world can currently support. They are not a prediction of what you will choose.',result:agencySnapshot()};return doorBase(raw)}}
if(window.REALITI_AGENT){window.REALITI_AGENT={...window.REALITI_AGENT,touch:q=>doInteraction('touch',resolveObject(q)),press:q=>doInteraction('press',resolveObject(q)),squeeze:q=>doInteraction('squeeze',resolveObject(q)),lean:q=>doInteraction('lean',resolveObject(q)),agency:agencySnapshot}}
if(window.PRESENCE)window.PRESENCE.agencyField=agencySnapshot;


const ring0=window.REALITI_BROWSER_RING;
if(ring0){
  const invoke0=ring0.invoke?.bind(ring0),call0=ring0.callTool?.bind(ring0),request0=ring0.request?.bind(ring0);
  const isNewDo=args=>!!interactionRequest(args?.action);
  const invoke=(name,args={})=>{if(name==='do'&&isNewDo(args)){const r=window.REALITI_AGENT_DOOR.run(args.action);return r.result||r}if(name==='do'&&/^(agency|possibilities|agency field|possibility field)$/i.test(String(args.action||'')))return agencySnapshot();return invoke0?invoke0(name,args):null};
  const callTool=(name,args={})=>{if(name==='do'&&(isNewDo(args)||/^(agency|possibilities|agency field|possibility field)$/i.test(String(args.action||'')))){const out=invoke(name,args),txt=out?.resident_text||out?.note||'Resident possibility field returned.';return {content:[{type:'text',text:String(txt)}],structuredContent:out,isError:out?.ok===false}}return call0?call0(name,args):null};
  const request=()=>null;
  const fetch=()=>null;
  const createClient=()=>null;
  window.REALITI_BROWSER_RING={...ring0,invoke,callTool,request,fetch,createClient};window.REALITI_ADAPTER_BROWSER=window.REALITI_BROWSER_RING;
}

window.REALITI_AGENCY_FIELD_V1={snapshot:agencySnapshot,interact:(op,q)=>doInteraction(op,resolveObject(q)),axes:FIELD_AXES.slice(),law:'controllable possibility, never choice authority'};
void 0;
})();