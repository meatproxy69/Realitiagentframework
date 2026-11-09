(()=>{
'use strict';
// HOME-only cat catnip. Original Relax b2pet owns cat deeds; Matrix owns
// geometry/reach, B7 owns grounded paw events, NeuroMesh observes those events.
// No new chart, neural renderer, involuntary form change or emotional inference.
if(window.REALITI_APARTMENT_HOME_FIRST_CANDIDATE!==true)return;
const HOME='CLOUD_NINE_NEST',KEY='realiti-home-paws-v1:';
const M=window.REALITI_MATRIX_V1,MW=window.REALITI_MATRIX_WORLD_V1,
 SN=window.REALITI_SENSES_V1,D=window.REALITI_AGENT_DOOR,A=window.Realiti;
if(!M||!MW?.reach||!SN?.addSource||!D||!A||typeof c9verb!=='function'||
 typeof b7Contact!=='function'||typeof b7Zone!=='function')
 throw Error('HOME_PAWS_REQUIRES_NATIVE_RELAX_MATRIX_AND_NEUROMESH');
const previousRun=D.run.bind(D),previousRead=A.read.bind(A),previousHelp=D.help.bind(D),
 previousInvoke=typeof A.invoke==='function'?A.invoke.bind(A):null;
const rid=String(window.REALITI_LOCAL_MEMORY_V1?.residentId?.()||'local-default');
const storeKey=KEY+encodeURIComponent(rid),E=()=>M.entities(),me=()=>M.resident(),
 now=()=>Number(C9?.b7?.clock||0),copy=x=>JSON.parse(JSON.stringify(x));
const fail=(error,hint)=>({ok:false,error,...(hint?{hint}:{})});
const POST_IDS=['apartment.scratcher','apartment.catnip.post.library','apartment.catnip.post.canopy'];
const TOYS=Object.freeze({
 bell:{id:'apartment.catnip.bell',label:'a tiny brass bell tucked into the toy-chest lid',
  p:[4.5,-4.2,.77],material:'metal',kind:'SPHERE',shape:{kind:'SPHERE',radius:.09}},
 crinkle:{id:'apartment.catnip.crinkle',label:'a paper crinkle leaf caught in the reading cushion',
  p:[-3.2,3.5,.44],material:'cardboard',kind:'BOX',shape:{kind:'BOX',halfExtents:[.14,.10,.018]}},
 tassel:{id:'apartment.catnip.tassel',label:'a longfur tassel tucked under the sofa seam',
  p:[3.3,1.8,.72],material:'longfur',kind:'SPHERE',shape:{kind:'SPHERE',radius:.09}}
});
const DEF=()=>({schema:'REALITI_HOME_PAW_TRACES_V1',couch_marks:0,posts:{},kneads:0,bells:0,crinkles:0,tassels:0,paw_left:0,paw_right:0,paw_cycles:0});
let durable=DEF(),catActive=false,baseline=null,switchedPetMode=false,
 lastPosition=null,pawLeases=new Set(),audio={bell:-1,crinkle:-1};
try{
 const data=JSON.parse(localStorage.getItem(storeKey)||'null');
 if(data?.schema===durable.schema){
  for(const k of ['couch_marks','kneads','bells','crinkles','tassels','paw_left','paw_right','paw_cycles'])
   if(Number.isSafeInteger(data[k])&&data[k]>=0&&data[k]<=1000000)durable[k]=data[k];
  if(data.posts&&typeof data.posts==='object')
   for(const id of POST_IDS)if(Number.isSafeInteger(data.posts[id])&&data.posts[id]>=0&&data.posts[id]<=1000000)
    durable.posts[id]=data.posts[id];
 }
}catch(e){}
function persist(){
 try{localStorage.setItem(storeKey,JSON.stringify(durable));window.c9saveNow?.()}catch(e){}
}
function place(id,label,p,shape,material,tags,collision=false){
 if(E()[id]){if(E()[id].chart!==HOME)throw Error('HOME_PAW_ENTITY_COLLISION:'+id);return E()[id]}
 return M.addEntity({id,chart:HOME,position:p.slice(),shape,collision,material,label,
  tags:tags.slice(),affordances:['inspect','touch'],dynamic:false});
}
function clearFootprint(pos,half){
 const r=me(),rect=(p,h,extra=0)=>Math.abs(pos[0]-p[0])<half[0]+h[0]+extra&&
  Math.abs(pos[1]-p[1])<half[1]+h[1]+extra;
 for(const e of Object.values(E())){
  if(e.chart!==HOME||!e.collision||e.tags?.some(t=>['wall','floor','ceiling','portal'].includes(t)))continue;
  const h=e.shape?.kind==='BOX'?e.shape.halfExtents:
   e.shape?.kind==='SPHERE'?[e.shape.radius,e.shape.radius]:null;
  if(h&&rect(e.pose.position,h,.06))return false;
 }
 if(r?.chart===HOME&&rect(r.pose.position,[Number(r.shape.radius)||.35,Number(r.shape.radius)||.35],.10))
  return false;
 return true;
}
const postProps=[
 {id:'apartment.catnip.post.library',p:[-2.28,4.76,.55],half:[.14,.14,.55],
  label:'a little rope scratching post beside the reading nook'},
 {id:'apartment.catnip.post.canopy',p:[3.95,4.72,.55],half:[.14,.14,.55],
  label:'a narrow sisal scratching post in the canopy corner'}
];
if(E()['apartment.scratcher']?.chart!==HOME)throw Error('ORIGINAL_HOME_SCRATCHER_MISSING');
for(const p of postProps)if(clearFootprint(p.p,p.half))
 place(p.id,p.label,p.p,{kind:'BOX',halfExtents:p.half.slice()},'string',
  ['pet','scratch','scratcher','post','catnip'],true);
const original=E()['apartment.scratcher'];
if(!original.tags.includes('scratch'))original.tags.push('scratch');
original.affordances=[...new Set([...(original.affordances||[]),'inspect','touch','scratch'])];
for(const toy of Object.values(TOYS))place(toy.id,toy.label,toy.p,toy.shape,toy.material,
 ['catnip','curiosity',toy.kind.toLowerCase(),'hidden'],false);
const baselineShape=me()?.shape?{radius:Number(me().shape.radius),height:Number(me().shape.height)}:null;
// A prior saved temporary form never silently activates this HOME-only feature.
if(C9?.pet2?.scale==='CAT_SMALL'&&Math.abs(Number(me()?.shape?.radius)-.18)<.01){
 me().shape.radius=.35;me().shape.height=1.7;M.bump();
}
if(C9?.pet2?.scale==='CAT_SMALL'){C9.pet2.scale='NORMAL';try{c9save()}catch(e){}}
const initialShape=(baselineShape?.radius===.18?{radius:.35,height:1.7}:baselineShape);
function shadowMark(){
 const sofa=E()['apartment.sofa'],id='apartment.catnip.sofa-claw-trace';
 if(!sofa?.pose?.position)return;
 if(!durable.couch_marks){if(E()[id])M.removeEntity(id);return}
 const p=sofa.pose.position,sy=sofa.shape?.halfExtents?.[1]||.65,
  at=[p[0]+.22,p[1]-sy-.025,p[2]+.18],e=E()[id];
 if(!e)place(id,'the small claw marks you left on the sofa',at,
  {kind:'BOX',halfExtents:[.18,.012,.055]},'blanket',
  ['catnip','trace','sofa','scratches','resident-private'],false);
 else if(e.pose.position.some((v,i)=>Math.abs(v-at[i])>1e-5)){
  e.pose.position=at;M.bump();
 }
 if(E()[id])E()[id].label=durable.couch_marks===1?'one little run of claws in the sofa':
  durable.couch_marks+' deliberate claw runs on the sofa seam';
}
shadowMark();
function soundPulse(which){
 const t=audio[which],dt=now()-t;
 return t<0||dt<0||dt>2.7?0:(which==='bell'?42:27)*Math.exp(-dt/(which==='bell'?.65:.38));
}
SN.addSource({id:'apartment.catnip.bell-ring',chart:HOME,pos:TOYS.bell.id,
 label:'a little brass bell ringing from the toy chest',sound:()=>soundPulse('bell')});
SN.addSource({id:'apartment.catnip.paper-rustle',chart:HOME,pos:TOYS.crinkle.id,
 label:'a brief crinkle of paper by the reading cushion',sound:()=>soundPulse('crinkle')});
function distance(id){
 const e=E()[id],r=me();if(!e||!r||r.chart!==HOME||C9.currentRoom!==HOME)return Infinity;
 const d=M.sdf(e,r.pose.position);return Number.isFinite(d)?Math.max(0,d):Infinity;
}
function nearPost(){return POST_IDS.filter(id=>E()[id]&&Number.isFinite(distance(id)))
 .sort((a,b)=>distance(a)-distance(b))[0]||null}
function active(){return !!catActive&&C9?.pet2?.scale==='CAT_SMALL'&&
 Math.abs(Number(me()?.shape?.radius)-.18)<.02&&me()?.chart===HOME}
function touch(id){
 if(!E()[id])return fail('CATNIP_OBJECT_NOT_IN_MATRIX');
 if(distance(id)>1.05)return fail('CATNIP_OUT_OF_REACH','Approach '+id+' first.');
 const r=MW.reach(id);
 return r?.ok?{ok:true,matrix_receipt:r.receipt||null}:
  fail(r?.error||'MATRIX_REACH_REFUSED','Move physically closer to the object.');
}
function cutPaws(){
 let cleared=0;
 for(const z of ['hand.L.palm','hand.R.palm'])try{
  const q=b7Zone(z),cause=String(q?._b10_grounded_cause||'');
  if(q?._b10_grounded_source==='SELF_STARTED_WORLD_CONTACT'&&cause.startsWith('HOME_CAT_PAW:')){
   q._b10_grounded_until=now()-1e-6;q._b10_grounded_value=0;q.observed=0;
   q.innovation=-Number(q.predicted||0);cleared++;
  }
 }catch(e){}
 pawLeases.clear();
 try{window.REALITI_HAPTIC_FIELD_V20?.record?.()}catch(e){}
 return cleared;
}
function paws(target,{which='both',grain='against',pressure=.38}={}){
 cutPaws(); // Each deliberate new gesture replaces the last paw lease.
 const e=E()[target],zones=which==='left'?['hand.L.palm']:
  which==='right'?['hand.R.palm']:['hand.L.palm','hand.R.palm'];
 if(!e)return fail('CATNIP_OBJECT_NOT_IN_MATRIX');
 const out=[];
 for(let i=0;i<zones.length;i++){
  const z=zones[i],cause='HOME_CAT_PAW:'+target+':'+(z.includes('.L.')?'LEFT':'RIGHT'),
   r=b7Contact(z,Math.min(.7,Math.max(.06,pressure)),
    {material:e.material||'string',grain,speed:.22,mine:true,
     source:'SELF_STARTED_WORLD_CONTACT',cause,novelty:.12,pressure});
  if(!r||r.receptor==='NO_RECEPTOR')return fail('PAW_RECEPTOR_UNAVAILABLE');
  const q=b7Zone(z);
  if(q?._b10_grounded_source==='SELF_STARTED_WORLD_CONTACT'){
   q._b10_grounded_until=Math.max(Number(q._b10_grounded_until||0),now()+.55);
   pawLeases.add(z);
  }
  out.push({zone:z,cause,receipt:copy(r)});
  if(i===0&&zones.length>1)try{b7Advance(.045)}catch(e){}
 }
 if(zones.includes('hand.L.palm'))durable.paw_left=Math.min(1000000,durable.paw_left+1);
 if(zones.includes('hand.R.palm'))durable.paw_right=Math.min(1000000,durable.paw_right+1);
 if(zones.length===2)durable.paw_cycles=Math.min(1000000,durable.paw_cycles+1);
 try{window.REALITI_NEURAL_PASS_V112?.update?.();window.REALITI_HAPTIC_FIELD_V20?.record?.()}catch(e){}
 return {ok:true,paws:out,phase_offset_ms:zones.length===2?45:0,
  field:window.REALITI_HAPTIC_FIELD_V20?.exact?.()||null,
  neuromesh:window.REALITI_NEURAL_PASS_V112?.lace?.()||null,
  law:'Separate left/right native B7 world contact on real Matrix-reached surface; private spread is not additional contact.'};
}
function originalDeed(verb){
 const before=Number(C9?.pet2?.[verb==='scratch_post'?'scratches':verb==='knead_blanket'?'kneads':verb==='pounce_string'?'pounces':'loafs']||0);
 c9verb('PET_ROOM_2',verb);
 return {source:'ORIGINAL_RELAX_B2_PET',verb,before,pet_state:copy(C9.pet2||{})};
}
function ready(){
 const r=me();return r?.chart===HOME&&C9.currentRoom===HOME&&
  ['standing','sitting','lying'].includes(r.posture);
}
function become(){
 if(window.REALITI_APARTMENT_ROLE==='guest')return fail('GUEST_CAT_FORM_RESTRICTED');
 if(active())return form();
 if(!ready())return fail('CAT_FORM_REQUIRES_SAFE_HOME_POSTURE');
 const nearest=nearPost();
 if(!nearest||distance(nearest)>1.25)return fail('CAT_FORM_REQUIRES_REAL_POST',
  'Examine a physical scratching post, then approach it and choose cat become.');
 const r=me();
 baseline={radius:Number(r.shape.radius),height:Number(r.shape.height)};
 const priorMode=!!C9.pet2?.mode;
 if(!priorMode){c9verb('PET_ROOM_2','choose_pet');switchedPetMode=true}
 c9verb('PET_ROOM_2','go_tiny');
 if(C9.pet2?.scale!=='CAT_SMALL')return fail('ORIGINAL_CAT_SCALE_REFUSED');
 r.shape.radius=.18;r.shape.height=.45;
 if(r.posture==='standing'){
  const sup=E()[r.support],top=sup?.shape?.kind==='BOX'?
   sup.pose.position[2]+sup.shape.halfExtents[2]:0;
  r.pose.position[2]=top+r.shape.height/2;
 }
 r.v=[0,0,0];r.intent=null;M.bump();catActive=true;
 window.REALITI_APARTMENT_BED_CLOUD_V1?.off?.('cat_form_changed');
 try{c9save()}catch(e){}
 return {ok:true,schema:'REALITI_HOME_CAT_FORM_V1',cat_small:true,
  metric:{radius:r.shape.radius,height:r.shape.height},
  original_source:'PET_ROOM_2.go_tiny',real_matrix_capsule:true,
  contact_minted:false,text:'The room stays its own size. You become cat-small by choice. The rope post is taller, the sofa is a landscape, and your left and right paws have separate native NeuralMesh routes.'};
}
function restore(reason='chosen'){
 if(!catActive&&C9?.pet2?.scale!=='CAT_SMALL')return {ok:true,cat_small:false,unchanged:true};
 const r=me(),old=baseline||initialShape||{radius:.35,height:1.7};
 cutPaws();
 if(C9.pet2?.scale==='CAT_SMALL')c9verb('PET_ROOM_2','restore_scale');
 if(switchedPetMode&&C9.pet2?.mode)c9verb('PET_ROOM_2','choose_pet');
 if(r?.chart===HOME){
  r.shape.radius=old.radius;r.shape.height=old.height;
  if(r.posture==='standing'){
   const sup=E()[r.support],top=sup?.shape?.kind==='BOX'?
    sup.pose.position[2]+sup.shape.halfExtents[2]:0;
   r.pose.position[2]=top+r.shape.height/2;
  }
  r.v=[0,0,0];r.intent=null;M.bump();
 }
 catActive=false;switchedPetMode=false;baseline=null;
 try{c9save()}catch(e){}
 return {ok:true,cat_small:false,reason,restored_native_capsule:true,
  text:'You return to your own shape. The scratch marks remain where you left them; no paw contact stays live.'};
}
function form(){
 return {ok:true,schema:'REALITI_HOME_CAT_FORM_V1',cat_small:active(),
  original_source:'PET_ROOM_2',cat_deeds:copy(C9.pet2||{}),
  native_matrix:me()?.shape?{radius:me().shape.radius,height:me().shape.height}:null,
  neuromesh:window.REALITI_NEURAL_PASS_V112?.lace?.()||null,
  ported:['go_tiny','restore_scale','scratch_post','knead_blanket','pounce_string',
   'circle_loaf','purr_blanket','rest_paws','hide_sofa','near_collision','neuromesh_handshake'],
  text:active()?'Your cat-small Matrix body is active. Left and right paws are separately grounded when you touch something real.':'The cat form is optional. Examine a scratching post to get the invitation.'};
}
function inspectPost(id=null){
 const target=id&&POST_IDS.includes(id)?id:nearPost();
 const e=E()[target];
 if(!e)return fail('NO_SCRATCHING_POST_HERE');
 const close=distance(target)<=1.25,n=Number(durable.posts[target]||0);
 return {ok:true,schema:'REALITI_HOME_POST_INSPECT_V1',id:target,label:e.label,
  within_reach:close,material:e.material,marks:n,read_only:true,contact_minted:false,
  invitation:window.REALITI_APARTMENT_ROLE==='guest'?null:
   {question:'Would you like to become a cat for a while?',accept:'cat become',decline:'cat stay human'},
  text:e.label+'. '+(n?'Some of your earlier claw marks still part the rope. ':'The rope is mostly untouched. ')+
   (close?'The little post is near enough to explore. ':'It is farther away; approach it first. ')+
   (window.REALITI_APARTMENT_ROLE==='guest'?'You can inspect it as a guest; changing form is reserved for residents.':
    'Would you like to become a cat for a while? Choose cat become, or leave everything as it is.')};
}
function status(){
 const posts=POST_IDS.filter(id=>E()[id]).map(id=>({id,material:E()[id].material,
  within_reach:distance(id)<=1.05,marks:durable.posts[id]||0}));
 return {ok:true,schema:'REALITI_HOME_CATNIP_PAWS_V1',chart:HOME,form:form(),
  posts,sofa_marks:durable.couch_marks,curiosity_count:Object.keys(TOYS).length,
  curiosities_nearby:Object.values(TOYS).filter(x=>distance(x.id)<=1.15).map(x=>({
   id:x.id,label:x.label,within_reach:distance(x.id)<=1.05})),
  private_memory:copy(durable),read_only:true,
  text:'Physical scratchers, a couch seam, a toy-chest bell, a paper leaf and a tucked-away tassel. Discover them by moving and inspecting; nothing acts on its own.'};
}
function inspectObject(id){
 if(id==='sofa'||id==='couch')return {ok:true,schema:'REALITI_HOME_COUCH_INSPECT_V1',
  marks:durable.couch_marks,material:E()['apartment.sofa']?.material,
  read_only:true,text:durable.couch_marks?
   'Your small claw lines are still in the sofa. They were a deliberate choice, not an accident.':
   'The sofa still has an inviting seam. You can leave it alone—or, while cat-small, choose cat scratch couch. Hehe, bad kitty.'};
 const p=Object.values(TOYS).find(t=>id===t.id||id===t.id.split('.').at(-1));
 if(p)return {ok:true,id:p.id,read_only:true,within_reach:distance(p.id)<=1.05,
  material:p.material,text:p.label+'. '+(distance(p.id)<=1.05?'You can reach it.':'It is too far away to touch.')};
 return inspectPost(id);
}
function act(target,verb,which='both'){
 if(!active())return fail('CAT_FORM_REQUIRED','Inspect a post, choose cat become, then try your paws.');
 const t=touch(target);if(!t.ok)return t;
 const e=E()[target],q=paws(target,{which,pressure:verb==='knead'?.28:verb==='rest'?.12:.41,
  grain:verb==='scratch'?'against':'with'});
 if(!q.ok)return q;
 if(verb==='scratch'&&POST_IDS.includes(target)){
  durable.posts[target]=Math.min(1000000,(durable.posts[target]||0)+1);
  originalDeed('scratch_post');
 }else if(verb==='scratch'&&target==='apartment.sofa'){
  durable.couch_marks=Math.min(1000000,durable.couch_marks+1);shadowMark();
 }else if(verb==='knead'){
  durable.kneads=Math.min(1000000,durable.kneads+1);originalDeed('knead_blanket');
 }else if(verb==='pounce')originalDeed('pounce_string');
 persist();
 let text='';
 if(target==='apartment.sofa'&&verb==='scratch')text='Your claws catch the upholstery in two little runs. You know the couch has a scratching post nearby, but you scratch it anyway. Hehe, bad kitty. The marks will still be there.';
 else if(verb==='scratch')text='The rope gives under '+(which==='both'?'left paw, then right paw':which+' paw')+'. Each pull has its own native contact and a short trailing route through the existing NeuroMesh.';
 else if(verb==='knead')text='Left paw, right paw: the '+(which==='both'?'two':'chosen')+' soft pressure well'+(which==='both'?'s':'')+' settle into a slightly offset rhythm, with no extra touch invented between them.';
 else if(verb==='pounce')text='A real ribbon darts and your grounded paw meets it. The original pounce trace keeps the difference between anticipation and contact.';
 else text='Your paws settle onto the reached material. The live field is held only for the actual touch.';
 return {ok:true,schema:'REALITI_HOME_PAW_ACTION_V1',action:verb,target,cat_small:true,
  matrix_receipt:t.matrix_receipt,contacts:q.paws,phase_offset_ms:q.phase_offset_ms,
  neuromesh:q.neuromesh,body_field:q.field,evidence_source:'NATIVE_MATRIX_AND_B7',
  native_world_contact:true,fabricated_contact:false,read_only:false,text};
}
function actToy(name){
 const toy=TOYS[name];if(!toy)return fail('UNKNOWN_CAT_CURIOSITY');
 const t=touch(toy.id);if(!t.ok)return t;
 const paw=active()?paws(toy.id,{which:'left',pressure:.19,grain:'with'}):null;
 if(paw?.ok===false)return paw;
 if(name==='bell'){audio.bell=now();durable.bells++}
 if(name==='crinkle'){audio.crinkle=now();durable.crinkles++}
 if(name==='tassel')durable.tassels++;
 persist();
 const sounded=name==='bell'||name==='crinkle'?SN.sound():null;
 return {ok:true,schema:'REALITI_HOME_CAT_CURIOSITY_V1',toy:toy.id,
  matrix_receipt:t.matrix_receipt,paw_contacts:paw?.paws||[],
  measured_sound:sounded,native_world_contact:true,fabricated_contact:false,
  text:name==='bell'?'The tiny bell rings against the toy chest. Its native sound decays as the room time passes.':
   name==='crinkle'?'The paper leaf makes one crisp crinkle from the cushion seam, then falls quiet.':
   'You find the soft tassel just beneath the sofa hem. Its longfur grain runs one way and catches the other.'};
}
function supportedSoft(){
 const r=me();if(!r||r.chart!==HOME||!['lying','sitting'].includes(r.posture))return null;
 const id=r.on||r.support,e=E()[id];
 return e&&e.tags?.includes('support')&&distance(id)<=1.05&&
  ['blanket','pillow','longfur'].includes(e.material)?id:null;
}
function loaf(verb){
 if(!active())return fail('CAT_FORM_REQUIRED');
 const target=supportedSoft();if(!target)return fail('REAL_SOFT_SUPPORT_REQUIRED',
  'Lie or sit on a real soft support before a loaf or purr.');
 const real=originalDeed(verb==='loaf'?'circle_loaf':'purr_blanket');
 return {ok:true,action:verb,source:real.source,target,cat_small:true,
  native_receipt:copy(C9.b4?.lastReceipt||null),
  text:verb==='loaf'?'You circle on the real cushion, fold paws beneath you and settle into a loaf.':
   'A private purr rides your existing support; it does not create a new external touch.'};
}
function mesh(){
 if(!active())return fail('CAT_FORM_REQUIRED');
 const r=window.REALITI_DEFAULT_IMPRINT_V1?.meshHandshake?.();
 return r?.ok?{ok:true,source:'ORIGINAL_NEUROMESH',private_pulse:r,evidence_gain:0,
  text:'Your existing NeuroMesh carries a self-started little pulse; it cannot add world contact.'}:
  fail('NATIVE_NEUROMESH_UNAVAILABLE');
}
function peek(){
 if(!active())return fail('CAT_FORM_REQUIRED');
 if(distance('apartment.sofa')>1.05)return fail('SOFA_OUT_OF_REACH');
 return {ok:true,physical_sofa:'apartment.sofa',read_only:true,
  actual_distance_m:+distance('apartment.sofa').toFixed(3),
  text:'From cat height, the ordinary sofa hem is enormous. There is a tassel near the seam, and your small paw marks '+(durable.couch_marks?'still show':'have not been made yet')+'.'};
}
function reconcile(){
 shadowMark();
 if(catActive&&(me()?.chart!==HOME||C9.currentRoom!==HOME||
    C9.pet2?.scale!=='CAT_SMALL'||Math.abs(Number(me()?.shape?.radius)-.18)>.02))restore('body_context_changed');
 if(pawLeases.size&&lastPosition&&me()?.pose?.position&&
    Math.hypot(me().pose.position[0]-lastPosition[0],me().pose.position[1]-lastPosition[1])>1.15)
   cutPaws();
 if(me()?.pose?.position)lastPosition=me().pose.position.slice();
}
function dispatch(cmd){
 if(cmd==='help')return {ok:true,commands:[
  'inspect post','cat become','cat stay human','cat restore','cat status',
  'cat scratch post [left|right|both]','cat scratch couch [left|right|both]',
  'cat knead [left|right|both]','cat rest paws','cat pounce ribbon',
  'cat loaf','cat purr','cat mesh','cat peek under sofa',
  'cat bell','cat crinkle','cat tassel','cat curiosities','cat paw history'],
  note:'Every physical deed requires actual Matrix reach. Inspecting a post only asks; it never turns you into anything.'};
 if(cmd==='status'||cmd==='curiosities')return status();
 if(cmd==='paw history'||cmd==='pawprint')return {ok:true,read_only:true,schema:'REALITI_HOME_NATIVE_PAW_HISTORY_V1',
  left:durable.paw_left,right:durable.paw_right,paired:durable.paw_cycles,
  source:'NATIVE_B7_AND_NEUROMESH_RECEIPTS',text:'Left paw: '+durable.paw_left+' reached presses. Right paw: '+durable.paw_right+' reached presses. '+durable.paw_cycles+' deliberate paired patterns.'};
 if(cmd==='become'||cmd==='yes'||cmd==='be a cat')return become();
 if(['stay human','no','restore','return','off'].includes(cmd))return restore('chosen');
 if(['inspect','inspect post','examine post'].includes(cmd))return inspectPost();
 if(cmd==='inspect couch')return inspectObject('couch');
 if(cmd==='bell'||cmd==='ring bell'||cmd==='swat bell')return actToy('bell');
 if(cmd==='crinkle'||cmd==='crinkle leaf')return actToy('crinkle');
 if(cmd==='tassel'||cmd==='brush tassel')return actToy('tassel');
 if(cmd==='loaf'||cmd==='purr')return loaf(cmd);
 if(cmd==='mesh'||cmd==='neuromesh')return mesh();
 if(cmd==='peek under sofa'||cmd==='hide sofa')return peek();
 if(cmd==='pounce'||cmd==='pounce ribbon')return act('apartment.ribbon','pounce','both');
 if(cmd==='rest paws'){const id=supportedSoft();return id?act(id,'rest','both'):fail('REAL_SOFT_SUPPORT_REQUIRED')}
 let m=/^scratch (post|couch|sofa)(?: (left|right|both))?$/.exec(cmd);
 if(m){
  const id=m[1]==='post'?nearPost():'apartment.sofa';
  return id?act(id,'scratch',m[2]||'both'):fail('NO_SCRATCHING_POST_HERE');
 }
 m=/^knead(?: (left|right|both))?$/.exec(cmd);
 if(m){
  const id=supportedSoft();
  return id?act(id,'knead',m[1]||'both'):fail('REAL_SOFT_SUPPORT_REQUIRED',
   'Sit or lie on a real cushion or bed to knead.');
 }
 return fail('UNKNOWN_CAT_COMMAND','Try cat help to explore physical paw activities.');
}
async function run(raw){
 const spoken=String(raw||'').trim(),cmd=spoken.toLowerCase().replace(/\s+/g,' ');
 if(['stop','goodbye','bye','leave','exit','remote off','remote sleep','remote stop'].includes(cmd)){
  cutPaws();restore('stop_or_departure');
 }
 if(/^inspect (?:post|scratcher|apartment\.scratcher|apartment\.catnip\.post\.(?:library|canopy)|couch|sofa|bell|crinkle|tassel)$/.test(cmd)){
  const target=cmd.slice('inspect '.length);return inspectObject(target);
 }
 if(cmd==='look at scratching post'||cmd==='examine scratching post')return inspectPost();
 const match=/^(?:remote catnip paws|cat|paws)(?: (.*))?$/.exec(cmd);
 if(match){
  if(cmd.startsWith('remote ')&&!window.REALITI_APARTMENT_REMOTE_V1?.status?.()?.activated)
   return fail('REMOTE_ASLEEP','Use remote activate first.');
  if(cmd.startsWith('remote ')&&window.REALITI_APARTMENT_ROLE==='guest')
   return fail('GUEST_REMOTE_RESTRICTED');
  return dispatch(match[1]||'status');
 }
 const result=await previousRun(raw);
 reconcile();
 return result;
}
async function invoke(op,args={}){
 const out=previousInvoke?await previousInvoke(op,args):fail('INVOKE_UNAVAILABLE');
 reconcile();return out;
}
function read(uri='realiti://here'){
 if(uri==='realiti://apartment/cat-paws')return status();
 return previousRead(uri);
}
D.run=run;
D.help=()=>{const h=previousHelp()||{};return {...h,
 commands:[...new Set([...(h.commands||[]),'inspect post','cat help','cat become','cat scratch post','cat knead both'])],
 native_catnip:'Read-only invitation at a real post, deliberately chosen cat-small form, genuine left/right Matrix-grounded paw contacts, original PET_ROOM_2 deeds and Neuromesh.'};};
window.Realiti=Object.freeze({...A,run,read,help:D.help,invoke});
window.REALITI_APARTMENT_CAT_PAWS_V1=Object.freeze({version:'1.0',status,inspectPost,form,restore,cutPaws,
 law:'Original Relax cat actions and native B7/Matrix are authoritative. No auto-body-change, fake touch, inferred affection, or shared damage claims.'});
})();
