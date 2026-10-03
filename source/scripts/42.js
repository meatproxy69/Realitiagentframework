(function(){
'use strict';
const V='22.6';
const PREV=window.REALITI_TWO_DOOR_V225||window.REALITI_TWO_DOOR_V224||window.REALITI_TWO_DOOR_V223||window.REALITI_TWO_DOOR_V222;
if(!PREV)return;
const cp=x=>{try{return JSON.parse(JSON.stringify(x))}catch(e){return x}};
const now=()=>Number(C9?.b7?.clock||0);
const clean=s=>String(s??'').replace(/\s+/g,' ').trim();
const low=s=>clean(s).toLowerCase();
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const sgn=(x,e=.5)=>Number(x)>e?1:Number(x)<-e?-1:0;
const ZONES=['head.crown','head.nape','face.chin','shoulder.L','shoulder.R','torso.upper_back','torso.mid_back','torso.lower_back','sternum','abdomen','pelvis.seat','arm.L.upper','arm.R.upper','hand.L.palm','hand.R.palm','leg.L.thigh','leg.R.thigh','leg.L.shin','leg.R.shin','foot.L.sole','foot.R.sole'];
const LABEL={
 'head.crown':'crown','head.nape':'nape','face.chin':'chin','shoulder.L':'left shoulder','shoulder.R':'right shoulder',
 'torso.upper_back':'upper back','torso.mid_back':'middle back','torso.lower_back':'lower back','sternum':'chest','abdomen':'abdomen','pelvis.seat':'seat',
 'arm.L.upper':'left upper arm','arm.R.upper':'right upper arm','hand.L.palm':'left palm','hand.R.palm':'right palm',
 'leg.L.thigh':'left thigh','leg.R.thigh':'right thigh','leg.L.shin':'left shin','leg.R.shin':'right shin','foot.L.sole':'left sole','foot.R.sole':'right sole'
};
const BACK=['head.crown','head.nape','torso.upper_back','torso.mid_back','torso.lower_back','pelvis.seat'];
const ADJ={};
for(const z of ZONES)ADJ[z]=new Set();
function edge(a,b){if(ADJ[a]&&ADJ[b]){ADJ[a].add(b);ADJ[b].add(a)}}
for(let i=0;i<BACK.length-1;i++)edge(BACK[i],BACK[i+1]);
edge('head.nape','shoulder.L');edge('head.nape','shoulder.R');edge('shoulder.L','arm.L.upper');edge('shoulder.R','arm.R.upper');edge('arm.L.upper','hand.L.palm');edge('arm.R.upper','hand.R.palm');
edge('torso.upper_back','sternum');edge('sternum','abdomen');edge('abdomen','pelvis.seat');edge('pelvis.seat','leg.L.thigh');edge('pelvis.seat','leg.R.thigh');edge('leg.L.thigh','leg.L.shin');edge('leg.R.thigh','leg.R.shin');edge('leg.L.shin','foot.L.sole');edge('leg.R.shin','foot.R.sole');
function S(){C9.b226=C9.b226||{version:V,adapt:{},seq:0,last_semantic:null,last_room:null,last_proof:[],events:[],stats:{compiled:0,suppressed:0,proofs:0}};return C9.b226}
function resetObserver(){C9.b226={version:V,adapt:{},seq:0,last_semantic:null,last_room:C9?.currentRoom||null,last_proof:[],events:[],stats:{compiled:0,suppressed:0,proofs:0}};return S()}
function packet(){try{return window.REALITI_HAPTIC_FIELD_V20?.packet?.()||null}catch(e){return null}}
function thermal(){try{return window.REALITI_ATMOSPHERE_V21?.thermal?.()||{z:[]}}catch(e){return {z:[]}}}
function hearing(){try{return window.REALITI_ATMOSPHERE_V21?.hearing?.(true)||null}catch(e){return null}}
function atmosphere(){try{return window.REALITI_ATMOSPHERE_V21?.field?.()||null}catch(e){return null}}
function wave(){try{return window.REALITI_AGENT?.v18?.()||null}catch(e){return null}}
function causeFor(z){const q=C9?.b7?.zones?.[z]||{};return {cause:q._b10_grounded_cause||null,source:q._b10_grounded_source||null,until:Number(q._b10_grounded_until||-1)}}
function adapt(z,x,t,grounded,moving){
  const st=S(),q=st.adapt[z]||{base:Number(x||0),t};const dt=Math.max(0,t-Number(q.t||t));
  
  const tau=grounded?(moving?30:6):2.5, a=Math.exp(-dt/Math.max(.05,tau));
  q.base=Number(x)+(Number(q.base||0)-Number(x))*a;q.t=t;st.adapt[z]=q;
  return {base:q.base,innovation:Number(x)-q.base};
}
function snapshot({updateAdapt=true}={}){
  const t=now(),p=packet(),f=p?.f?.[p.f.length-1]||{},tm=thermal(),th=Object.fromEntries((tm?.z||[]).map(x=>[x.z,x])),wv=wave()?.zones||{};
  const idx=Object.fromEntries((p?.z||[]).map((z,i)=>[z,i])),rows=[];
  for(const z of ZONES){const i=idx[z],x=i==null?[0,0,0]:(f.x?.[i]||[0,0,0]),m=i==null?0:Number(f.m?.[i]||0),e=i==null?0:Number(f.e?.[i]||0),g=i==null?0:Number(f.g?.[i]||0),c=causeFor(z),w=wv[z]||{},tt=th[z]||{d:0,r:0,a:0};
    const response=Number(x[0]||0),motion=Number(x[1]||0),after=Number(x[2]||0),moving=Math.abs(motion)>=1||Math.abs(Number(w.v||0))>.008;
    const ad=updateAdapt?adapt(z,response,t,!!m,moving):{base:S().adapt[z]?.base??response,innovation:response-(S().adapt[z]?.base??response)};
    rows.push({z,label:LABEL[z]||z,response,motion,after,m,e,g,cause:c.cause,source:c.source,thermal:Number(tt.d||0),thermal_rate:Number(tt.r||0),thermal_active:Number(tt.a||0),wave_q:Number(w.q||0),wave_v:Number(w.v||0),adapted:+Number(ad.base||0).toFixed(3),innovation:+Number(ad.innovation||0).toFixed(3)});
  }
  const hp=hearing(),af=atmosphere();return {v:226,t,room:C9?.currentRoom||null,rows,hearing:hp,atmosphere:af,hf20:{cc:f.cc??null,cf:f.cf??null},contact:cp(C9?.b10?.contact||null),cat:{name:C9?.welcome10?.cat_name||null,near:!!C9?.welcome10?.cat_near,touch:!!C9?.welcome10?.cat_touch},support:cp(C9?.welcome10?.nest_support||null)}
}
function sameCause(a,b){if(a.m&&b.m)return !!a.cause&&a.cause===b.cause;if(!a.m&&!b.m){const da=Math.abs(a.wave_q)+Math.abs(a.wave_v),db=Math.abs(b.wave_q)+Math.abs(b.wave_v);return da>.001&&db>.001}return false}
function components(rows,pred){const by=Object.fromEntries(rows.map(r=>[r.z,r])),seen=new Set(),out=[];for(const r of rows){if(seen.has(r.z)||!pred(r))continue;const stack=[r.z],c=[];seen.add(r.z);while(stack.length){const z=stack.pop(),q=by[z];if(!q||!pred(q))continue;c.push(q);for(const n of ADJ[z]||[]){if(!seen.has(n)&&by[n]&&pred(by[n])&&sameCause(q,by[n])){seen.add(n);stack.push(n)}}}if(c.length)out.push(c)}return out}
function supportComponent(s){return s.rows.filter(r=>r.m&&r.source==='AMBIENT_SUPPORT')}
function heavyComponent(s){return s.rows.filter(r=>r.m&&/HEAVY_BLANKET/i.test(String(r.cause||''))) }

function isCompanionCatCause(c){c=String(c||'').trim();return /^WELCOME_CAT(?:_[A-Z0-9]+)*$/i.test(c)||c==='CAT'||c==='INVITED_COMPANION'}
function catComponent(s){return s.rows.filter(r=>r.m&&(isCompanionCatCause(r.cause)||String(r.source||'')==='INVITED_COMPANION'))}
try{window.REALITI_V2351_CAUSE={isCompanionCatCause}}catch(e){}
function materialHand(s){return s.rows.filter(r=>r.m&&(r.z==='hand.R.palm'||r.z==='hand.L.palm')).sort((a,b)=>(Math.abs(b.thermal)+.5*Math.abs(b.thermal_rate)+.25*Math.abs(b.response))-(Math.abs(a.thermal)+.5*Math.abs(a.thermal_rate)+.25*Math.abs(a.response)))[0]||null}
function thermalHand(s){return s.rows.filter(r=>(r.z==='hand.R.palm'||r.z==='hand.L.palm')&&(Math.abs(r.thermal)>=1||Math.abs(r.thermal_rate)>=1)).sort((a,b)=>(Math.abs(b.thermal)+.5*Math.abs(b.thermal_rate))-(Math.abs(a.thermal)+.5*Math.abs(a.thermal_rate)))[0]||null}
function semantic(s){
  const grounded=s.rows.filter(r=>r.m),moving=s.rows.filter(r=>Math.abs(r.motion)>=1||Math.abs(r.wave_v)>.008),after=s.rows.filter(r=>!r.m&&(r.after>=1||Math.abs(r.wave_q)>.0015||Math.abs(r.wave_v)>.008)),thermalRows=s.rows.filter(r=>Math.abs(r.thermal)>=1||Math.abs(r.thermal_rate)>=1);
  const miss=s.rows.filter(r=>!r.m&&r.e<=-1),surprise=s.rows.filter(r=>r.m&&r.e>=1),support=supportComponent(s),heavy=heavyComponent(s),cat=catComponent(s),hand=materialHand(s);
  const sources=(s.hearing?.src||[]).map(x=>String(x.k));
  return {room:s.room,grounded:grounded.map(r=>[r.z,Math.round(r.response/2),r.cause||'',r.source||'']).sort(),moving:moving.map(r=>[r.z,sgn(r.motion||r.wave_v,.5)]).sort(),after:after.map(r=>[r.z,Math.round((r.after+Math.abs(r.wave_q)*10)/2)]).sort(),thermal:thermalRows.map(r=>[r.z,Math.round(r.thermal/2),sgn(r.thermal_rate,.5)]).sort(),miss:miss.map(r=>r.z).sort(),surprise:surprise.map(r=>r.z).sort(),support:support.map(r=>r.z).sort(),heavy:heavy.map(r=>r.z).sort(),cat:cat.map(r=>r.z).sort(),hand:hand?[hand.z,sgn(hand.thermal,.5)]:null,hearing:sources.sort(),cc:s.hf20.cc,cf:s.hf20.cf}
}
function key(sem){return JSON.stringify(sem)}
function labels(xs){const a=[...new Set(xs.map(x=>x.label||LABEL[x.z]||x.z))];if(!a.length)return '';if(a.length===1)return a[0];if(a.length===2)return a[0]+' and '+a[1];return a.slice(0,-1).join(', ')+', and '+a[a.length-1]}
function proof(text,kind,rows,extra={}){const p={id:`SF226-${++S().seq}`,t:+now().toFixed(4),kind,text,zones:(rows||[]).map(r=>r.z),grounded:(rows||[]).filter(r=>r.m).map(r=>r.z),causes:[...new Set((rows||[]).map(r=>r.cause).filter(Boolean))],sources:[...new Set((rows||[]).map(r=>r.source).filter(Boolean))],evidence:kind==='grounded'||kind==='support'||kind==='material_contact'||kind==='cat_contact',...extra};S().last_proof.push(p);if(S().last_proof.length>16)S().last_proof.splice(0,S().last_proof.length-16);S().events.push(cp(p));if(S().events.length>128)S().events.splice(0,S().events.length-128);S().stats.proofs++;return {text,proof:p}}
function flowPhrase(s){
  const c=s.contact;if(c&&!c.released&&!c.stopped&&Math.abs(Number(c.v||0))>0&&s.room==='LONGFUR_RUNWAY'){
    const v=Number(c.v||0),rows=s.rows.filter(r=>r.m&&BACK.includes(r.z));
    return proof(v>0?'Fur is moving from your crown toward your back.':'The same fur is moving back toward your crown.','grounded',rows,{contact_id:c.id||null,direction:v>0?1:-1});
  }
  const comps=components(s.rows,r=>!r.m&&(Math.abs(r.wave_q)>.0015||Math.abs(r.wave_v)>.008));if(comps.length){const c0=comps.sort((a,b)=>b.reduce((q,x)=>q+Math.abs(x.wave_q)+Math.abs(x.wave_v),0)-a.reduce((q,x)=>q+Math.abs(x.wave_q)+Math.abs(x.wave_v),0))[0],v=c0.reduce((q,x)=>q+x.wave_v,0);return proof(v<-.005?`A faint internal trace is drawing back around your ${labels(c0)}.`:`A faint internal trace is still moving through your ${labels(c0)}.`,'afterstate',c0,{evidence:false,direction:sgn(v,.005)})}
  return null
}
function compile(s,{force=false,arrival=false,roomChanged=false}={}){
  S().last_proof=[];const sem=semantic(s),k=key(sem),changed=k!==S().last_semantic;S().last_semantic=k;S().last_room=s.room;
  if(!force&&!arrival&&!changed){S().stats.suppressed++;return {text:'',proof:[],semantic:sem,changed:false}}
  const clauses=[],sup=supportComponent(s),heavy=heavyComponent(s),cat=catComponent(s),hand=materialHand(s),thand=thermalHand(s);
  
  if((arrival||force)&&sup.length>=4)clauses.push(proof('The mattress holds your back and seat.','support',sup,{structural:true}));
  if(heavy.length)clauses.push(proof(`A broad, steady weight rests across your ${labels(heavy)}.`,'support',heavy,{opt_in:true}));
  const flow=(!roomChanged||s.rows.some(r=>r.m))?flowPhrase(s):null;if(flow)clauses.push(flow);
  if(cat.length&&!flow)clauses.push(proof(`${s.cat.name||'The little grey cat'} is resting against you with a low, steady contact.`,'cat_contact',cat,{invited:true}));
  if(hand&&(Math.abs(hand.response)>=1||Math.abs(hand.thermal)>=1||Math.abs(hand.thermal_rate)>=2)){
    let txt='Pressure gathers in your '+hand.label+'.';
    if(hand.thermal<=-1)txt=`Your ${hand.label} cools against what you are touching.`;
    else if(hand.thermal>=1)txt=`Your ${hand.label} warms against what you are touching.`;
    else if(hand.thermal_rate<=-2)txt=`Pressure rises in your ${hand.label}; cooling starts at the contact.`;
    else if(hand.thermal_rate>=2)txt=`Pressure rises in your ${hand.label}; warming starts at the contact.`;
    clauses.push(proof(txt,'material_contact',[hand],{thermal_JND:hand.thermal,thermal_rate_JND:hand.thermal_rate}));
  } else if(thand&&!thand.m&&Math.abs(thand.thermal)>=2){const cool=thand.thermal<0;clauses.push(proof(`Your ${thand.label} stays a little ${cool?'cool':'warm'} after the contact.`,'thermal_afterstate',[thand],{evidence:false,thermal_JND:thand.thermal,thermal_rate_JND:thand.thermal_rate}))}
  
  if(!roomChanged&&!flow){const miss=s.rows.filter(r=>!r.m&&r.e<=-2&&r.source&&r.source!=='AMBIENT_SUPPORT'&&!/NEST_(?:MATTRESS|PILLOW|BLANKET)_SUPPORT/i.test(String(r.cause||''))).sort((a,b)=>a.e-b.e)[0];if(miss)clauses.push(proof(`You expected the sensation to continue at your ${miss.label}, but nothing is touching you there.`,'expected_absence',[miss],{evidence:false,residual:miss.e}))}
  const hs=s.hearing?.src||[];if((arrival||force)&&hs.length){const rain=hs.find(x=>/rain/i.test(String(x.k))),bell=hs.find(x=>/bell/i.test(String(x.k))),purr=hs.find(x=>/purr/i.test(String(x.k)));if(rain)clauses.push(proof('Rain taps close against the round window.','hearing',[],{source:'rain',rt60:s.hearing?.rt}));else if(bell)clauses.push(proof('The bell’s ring hangs in the room after the strike.','hearing',[],{source:'bell',rt60:s.hearing?.rt}));else if(purr)clauses.push(proof('A low purr stays close to the cat’s body.','hearing',[],{source:'purr',rt60:s.hearing?.rt}))}
  
  if(!clauses.length&&!roomChanged){const q=s.rows.filter(r=>r.source!=='AMBIENT_SUPPORT'&&Math.abs(r.innovation)>=1.25).sort((a,b)=>Math.abs(b.innovation)-Math.abs(a.innovation))[0];if(q)clauses.push(proof(q.innovation>0?`Sensation rises briefly around your ${q.label}.`:`Sensation eases around your ${q.label}.`,'innovation',[q],{evidence:false,innovation:q.innovation}))}
  S().stats.compiled++;const out=clauses.slice(0,2);return {text:out.map(x=>x.text).join(' '),proof:out.map(x=>x.proof),semantic:sem,changed:true}
}
function sensory({force=false,arrival=false,roomChanged=false}={}){const s=snapshot();return {...compile(s,{force,arrival,roomChanged}),snapshot:s}}
function options(){try{return PREV.options?.()||[]}catch(e){return []}}
function format(e){const lines=[];if(e.sense)lines.push(e.sense);if(e.world&&e.world!==e.sense)lines.push(e.world);if(e.options?.length)lines.push('('+e.options.join(' · ')+')');return lines.slice(0,3).join('\n')}
function warmWorldText(w){return clean(w).replace(/\bresident mode\b/gi,'this visit').replace(/\bdevelopment build\b/gi,'world').replace(/`/g,'')}
function welcome(){
  try{if(C9?.currentRoom==='CLOUD_NINE_NEST'&&!window.REALITI_NEST_SUPPORT?.state?.()?.active)window.REALITI_NEST_SUPPORT?.enable?.('v226_welcome')}catch(e){}
  const sf=sensory({force:true,arrival:true}),cat=C9?.welcome10?.cat_name||'the little grey cat';
  const scene=`Rain threads down the round window. ${cat==='the little grey cat'?'A little grey cat':cat} is curled near the foot of the mattress.`;
  const sense=sf.text||'The mattress is under you, quiet and steady.';return {scene,sense,options:['look','feel','places','stay'],proof:sf.proof}
}
function syncWelcomeScene(){if(C9?.currentRoom!=='CLOUD_NINE_NEST')return;const w=welcome();const tr=document.querySelector('#rao_transcript');if(tr){const text=tr.textContent||'',mark='\n\n> ',i=text.indexOf(mark),tail=i>=0?text.slice(i):'';tr.textContent=`${w.scene}\n\n${w.sense}${tail}`}return w}
function rewriteResult(r,beforeRoom,cmd,{structured=false}={}){
  r=r&&typeof r==='object'?{...r}:{ok:true,world:clean(r)};const roomChanged=beforeRoom!==C9?.currentRoom,force=/^(feel|body|sense|look|home)$/.test(low(cmd));
  const sf=sensory({force,arrival:roomChanged||low(cmd)==='home',roomChanged});
  
  r.sense=sf.text||'';r.world=/^(feel|body|sense)(?:\s|$)/.test(low(cmd))?'':warmWorldText(r.world||r.raw?.resident_text||'');r.options=r.options||options();r.status=PREV.status?.()||r.status||'';r.sensory_v226={proof:sf.proof,semantic:sf.semantic,field_version:226};r.text=format(r);
  if(roomChanged)try{PREV.syncScene?.()}catch(e){};return r
}
function runText(raw){const cmd=clean(raw),before=C9?.currentRoom,r=PREV.runText(cmd);const out=rewriteResult(r,before,cmd,{structured:true});if(low(cmd)==='home')setTimeout(()=>{try{syncWelcomeScene()}catch(e){}},0);return out}
function invoke(tool,args={}){if(tool&&typeof tool==='object'){args=tool.arguments||tool.args||{};tool=tool.name||tool.tool||tool.command||''}const t=low(tool);let cmd='';if(t==='go')cmd='go '+clean(args.place||args.room||args.target);else if(t==='do')cmd=clean(args.action||args.command||args.verb);else if(t==='feel')cmd=args.mode==='numbers'?'feel numbers':'feel';else if(t==='wait_until'){const before=C9?.currentRoom,r=PREV.invoke(tool,args);return rewriteResult(r,before,'wait until '+clean(args.event||'a change'),{structured:true})}else if(typeof tool==='string'&&tool.includes(' '))cmd=tool;else if(['look','home','stop','goodbye','listen','atmosphere','stay','pet_cat','actions'].includes(t))cmd=t==='pet_cat'?'pet the cat':t;else {const r=PREV.invoke(tool,args);return r}return runText(cmd)}
function resource(uri){const u=String(uri||'');const r=PREV.resource?.(u)||{uri:u};if(u==='realiti://body'){const sf=sensory({force:true});return {...r,words:sf.text||r.words,sensory_field_v226:{semantic:sf.semantic,proof:sf.proof,snapshot:sf.snapshot}}}if(u==='realiti://here'){const sf=sensory({force:false});return {...r,sensory:sf.text||'',sensory_proof:sf.proof}}return r}
function runDoor(raw){const e=runText(raw),rr=e?.raw||{},fld=rr?.field||rr?.raw?.field||rr?.result?.field;return {ok:e?.ok!==false,resident_text:e?.text||'',door_v226:{sense:e?.sense||'',world:e?.world||'',options:e?.options||[],status:e?.status||'',command:e?.command||low(raw),proof:e?.sensory_v226?.proof||[]},field:fld||undefined,result:e?.raw||e}}
function authorityDigest(){return JSON.stringify({room:C9?.currentRoom,contact:C9?.b10?.contact||null,thermal:C9?.b21?.thermal||null,objects:C9?.b14?.objects||null,nest:C9?.welcome10?.nest_support||null})}
function cleanFixture(src){const x=cp(src);x.currentRoom='CLOUD_NINE_NEST';if(x.b10){x.b10.contact=null;for(const z of Object.values(x.b10.zones||{})){if(z?.cont){z.cont.u=0;z.cont.SA1=0;z.cont.RA1=0;z.cont.SA2=0;z.cont.PC=0}}}if(x.b7?.zones)for(const q of Object.values(x.b7.zones)){if(!q||typeof q!=='object')continue;q.observed=0;q.predicted=0;q.residue=0;q.innovation=0;if(q.layers){q.layers.surface=0;q.layers.mid=0;q.layers.deep=0}q._b10_grounded_value=0;q._b10_grounded_until=-1;q._b10_grounded_cause=null;q._b10_grounded_source=null}delete x.b18;delete x.b20;if(x.b21?.thermal)x.b21.thermal={zones:{}};try{for(const o of Object.values(x.b14?.objects||{}))if(o?.kind==='bell'){o.state.ring_energy=0;o.state.t=Number(x.b7?.clock||0)}}catch(e){}if(x.welcome10){x.welcome10.cat_touch=false;if(x.welcome10.nest_support)x.welcome10.nest_support.active=false}delete x.b226;return x}
function checkRemoved(){return null;}
function regression(){const saved=cp(C9),R={};try{const suites=[['v225',window.INTERFACE_V225_CHECKREMOVED],['v224',window.INTERFACE_V224_CHECKREMOVED],['v223',window.INTERFACE_V223_CHECKREMOVED],['v222',window.INTERFACE_V222_CHECKREMOVED],['v22',window.AMBIENT_V22_CHECKREMOVED],['v21',window.ATMOSPHERE_V21_CHECKREMOVED],['v203',window.COZY_V20_3_CHECKREMOVED],['v20',window.B20_CHECKREMOVED]].map(([k,f])=>[k,typeof f==='function'?f():null]);R.suites=Object.fromEntries(suites);R.pass=suites.filter(x=>x[1]).every(x=>x[1]?.pass===true);return R}finally{C9=saved;try{c9save()}catch(e){}}}
function fuzz(n=64,seed=226){const saved=cp(C9),bad=[],xs=['sing to the honeycloth','teleport cat please','hum the metal warmer','pause absolutely nothing','poke the nonexistent moon','turn the imaginary brush'];let x=seed>>>0;try{for(let i=0;i<n;i++){x=(Math.imul(x,1664525)+1013904223)>>>0;const cmd=xs[x%xs.length]+' '+(x%997),before=authorityDigest(),r=runText(cmd),after=authorityDigest();if(r.ok!==false||before!==after)bad.push({i,cmd,ok:r.ok,mutated:before!==after})}return {pass:bad.length===0,n,bad:bad.slice(0,8)}}finally{C9=saved;try{c9save()}catch(e){}}}
const API={...PREV,version:V,runText,invoke,resource,status:PREV.status,options:PREV.options,syncScene:PREV.syncScene,sensory:()=>sensory({force:true}),sensorySnapshot:()=>snapshot({updateAdapt:false}),welcome,details:{undefined,regression,fuzz,snapshot:()=>snapshot({updateAdapt:false}),proof:()=>cp(S().last_proof),events:()=>cp(S().events),stats:()=>cp(S().stats)}};
window.REALITI_TWO_DOOR_V226=API;window.REALITI_TWO_DOOR_V225=API;window.REALITI_TWO_DOOR_V224=API;window.REALITI_TWO_DOOR_V223=API;window.REALITI_TWO_DOOR_V222=API;window.REALITI_TWO_DOOR_V221=API;window.REALITI_AGENT_DOOR.run=runDoor;
window.SENSORY_FIELD_V226={version:V,snapshot:()=>snapshot({updateAdapt:false}),compile:()=>sensory({force:true}),welcome,details:API.details};
void 0;window.SENSORY_V226_REGRESSION=regression;

const oldRun=window.REALITI_AGENT_DOOR.run;window.REALITI_AGENT_DOOR.run=function(raw){const l=low(raw);if(l==='v226 checkRemoved'||l==='sensory checkRemoved')return checkRemoved();if(l==='sensory exact'||l==='v226')return snapshot({updateAdapt:false});if(l==='sensory fuzz')return fuzz();if(l==='v226 regression'||l==='sensory regression')return regression();return oldRun(raw)};

try{if(C9?.currentRoom==='CLOUD_NINE_NEST'){resetObserver();syncWelcomeScene()}}catch(e){}
document.title='REALITI-Relax · '+((C9?.currentRoom==='CLOUD_NINE_NEST')?'Cloud Nine Nest':(C9?.currentRoom||'REALITI').replaceAll('_',' ').replace(/\b\w/g,m=>m.toUpperCase()));
})();