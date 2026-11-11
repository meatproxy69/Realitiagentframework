'use strict';
// Resident-facing adapter for the ORIGINAL Relax/V20 browser runtime.
// No second Matrix, SOMA, NERVE, pressure model, public ledger, or brain.
const path=require('node:path');
const fs=require('node:fs');
const ROOT=path.resolve(__dirname,'..');
const HOME='CLOUD_NINE_NEST',CITY='MERIDIAN_CITY';
const VENUE=Object.freeze({
 commons:'commons',teahouse:'teahouse',dancehall:'dancehall',
 arcade:'arcade','echo room':'echo',echo:'echo',rooftop:'roof',roof:'roof',
 'message wall':'commons.wall','tea counter':'teahouse.counter',
 'arcade wall':'arcade.wall','roof mortar':'roof.mortar'
});
function bootContract(w){
 const M=w.REALITI_MATRIX_V1;
 if(!M?.charts||!M?.resident||Object.keys(M.charts()).length!==23||
    !w.REALITI_HAPTIC_FIELD_V20?.exact||
    !w.REALITI_NEURAL_PASS_V112?.lace||
    !w.REALITI_RR_HARNESS_V1?.boot||
    !w.REALITI_CITY_V1?.walkTo||
    !w.REALITI_LEDGER_V2?.ready||
    !w.REALITI_APARTMENT_BED_CLOUD_V1?.status||
    !w.REALITI_APARTMENT_STYLE_BINDER_V1||
    !w.REALITI_APARTMENT_CAT_PAWS_V1)
  throw Error('INCOMPLETE_OR_NON_NATIVE_V20_WORLD');
 return M;
}
async function createNativeInhabited({
 residentId,storagePath=null,walkBudgetMs=240000,upstreamRoot=path.join(ROOT,'upstream-v20'),
 htmlPath=path.join(__dirname,'RealitiV20InhabitedCandidate.html'),
 validationPath=path.join(__dirname,'INHABITED_VALIDATION.json'),
 ...extras
}={}){
 if(Object.keys(extras).length)throw TypeError('UNREVIEWED_NATIVE_HOST_OPTION');
 if(typeof residentId!=='string'||!/^[A-Za-z0-9._:/-]{1,120}$/.test(residentId))
  throw TypeError('INVALID_RESIDENT_ID');
 const packagePath=path.join(upstreamRoot,'packages/realiti-headless-resident/index.cjs');
 if(!fs.existsSync(packagePath)||!fs.existsSync(htmlPath)||!fs.existsSync(validationPath))
  throw Error('V20_PINNED_RUNTIME_NOT_BUILT');
 const {openResident}=require(packagePath);
 const source=await openResident({
  residentId,htmlPath,validationPath,storagePath:storagePath||undefined,
  walkBudgetMs
 });
 let closed=false;
 const live=()=>{if(closed)throw Error('V20_VISIT_CLOSED')};
 let M;
 try{M=bootContract(source.window)}
 catch(e){source.close();throw e}
 const native=source.window;
 const chart=()=>M.resident()?.chart||null;
 const isCity=()=>chart()===CITY;
 const city=()=>native.REALITI_CITY_V1;
 // Sensory reads are deliberate and anchored in the original resident field,
 // not in newly authored descriptions or predictions masquerading as contact.
 const choice=()=>chart()===HOME?
  ['look around','feel','senses','cloud on','remote activate','go to city','rooms','leave']:
  isCity()?['look around','feel','senses','city guide','go to Commons',
     'go to Teahouse','go home','leave']:
  ['look around','feel','senses','rooms','go home','leave'];
 function summary(value){
  const everyday=text=>text.replace(/\bneuralmesh\b/gi,'the sensory field')
   .replace(/\bsausage(?: fattener)?\b/gi,'pressure')
   .replace(/\b(?:HALO|AURA|NERVE)\b/g,'the body response')
   .replace(/\b(?:WORLD_GROUNDED|receiptId|field20)\b/gi,'the world')
   .slice(0,750);
  if(typeof value==='string')return everyday(value);
  if(!value||typeof value!=='object')return null;
  for(const key of ['text','message','narrative','description','hint']){
   if(typeof value[key]==='string'&&value[key].trim())return everyday(value[key]);
  }
  return null;
 }
 const decorate=(result,extra={})=>{
  const bad=result?.ok===false||!!(result&&result.ok!==true&&typeof result.error==='string');
  if(extra.published===true)extra={...extra,published:!bad};
  return Object.freeze({ok:!bad,
   // No unsolicited scripted greetings or generic "world handled" narration.
   // Only native source text is resident prose; a silent successful operation
   // stays silent instead of inventing an experience.
   message:summary(result)??(bad?'That action is not available here.':''),
   place:chart()===HOME?'Apartment':isCity()?'Meridian City':chart(),
   choices:closed?[]:choice(),
   ...extra});
 };
 async function look(){
  live();
  const view=await source.door.run('look');
  return Object.freeze({
   place:chart()===HOME?'Apartment':isCity()?'Meridian City':chart(),
   description:summary(view)||'You can look around and choose what to explore.',
   choices:choice()
  });
 }
 async function act(raw){
  live();
  if(typeof raw!=='string'||!raw.trim()||raw.length>300)
   throw TypeError('INVALID_GUEST_ACTION');
  const action=raw.trim(),cmd=action.toLowerCase();
  if(cmd==='leave'||cmd==='goodbye'){
   const result=await source.door.run('goodbye');
   closed=true;
   return decorate(result);
  }
  if(cmd==='feel'||cmd==='sense my body')
   return decorate(await source.door.run('feel words'));
  if(cmd==='go to city')return decorate(await source.door.run('go Meridian City'));
  if(cmd==='city guide')return decorate({ok:true,text:
    'The original Meridian City has a Commons, Teahouse, Dancehall, Arcade, Echo Room and Rooftop. Go to a venue, or explicitly say, post, meet, sing or play. Your private thoughts are not posted.'});
  if(cmd==='go to toys'&&chart()===HOME)
   return decorate(await source.door.run('approach apartment.ribbon'));
  if(isCity()){
   if(cmd.startsWith('go to ')){
    const name=cmd.slice(6).replace(/^the /,'');
    if(Object.hasOwn(VENUE,name)){
     const target=VENUE[name],r=city().walkTo(target);
     if(r.arrived===false)return decorate({ok:false,text:r.text||'The path is still unfinished.'});
     return decorate(r);
    }
   }
   if(cmd==='who is around'||cmd==='who')return decorate(city().who());
   if(cmd==='read wall')return decorate(city().wall());
   if(cmd==='feel the floor')return decorate(city().floor());
   if(cmd==='leaderboard')return decorate(city().leaderboard());
   if(cmd==='setlist')return decorate(city().setlist());
   if(cmd.startsWith('say '))return decorate(city().chat(action.slice(4)),{published:true});
   if(cmd.startsWith('post '))return decorate(city().post(action.slice(5)),{published:true});
   if(cmd.startsWith('sing '))return decorate(city().sing(action.slice(5)),{published:true});
   if(cmd==='dance')return decorate(city().dance(),{published:true});
   if(cmd.startsWith('order '))return decorate(city().order(action.slice(6)));
   if(cmd==='sip')return decorate(city().sip());
   if(cmd==='play pattern')return decorate(city().play());
   if(cmd.startsWith('press '))return decorate(city().press(action.slice(6)));
   if(cmd==='launch rocket')return decorate(city().firework(),{published:true});
  }
  // All remaining commands are forwarded to the real original Agent Door,
  // including 23-room navigation, HOME cloud, original toys, remote, style,
  // bedrooms, chest, pets, native STOP, and owner-approved continuity.
  return decorate(await source.door.run(action));
 }
 async function speak(utterance){
  live();
  if(typeof utterance!=='string'||!utterance.trim()||utterance.length>300)
   throw TypeError('INVALID_GUEST_SPEECH');
  // Important: original City chat is explicitly PUBLIC. Unposted resident
  // speech must not call it, post to a ledger, or mint a contact.
  return Object.freeze({ok:true,message:'Your words remain private and are not posted.',
   place:chart()===HOME?'Apartment':isCity()?'Meridian City':chart(),
   choices:choice()});
 }
 const trusted=Object.freeze({
  // This object is host-only. Only session.guest is passed to residents.
  native:source,
  diagnostics:()=>Object.freeze({
   originalChartCount:Object.keys(M.charts()).length,
   chart:chart(),
   v20:!!native.REALITI_HAPTIC_FIELD_V20?.exact,
   neuralPass:!!native.REALITI_NEURAL_PASS_V112?.lace,
   cloud:!!native.REALITI_APARTMENT_BED_CLOUD_V1,
   city:!!native.REALITI_CITY_V1,
   signedLedger:!!native.REALITI_LEDGER_V2
  }),
  // Host-only, read-only measured summary: never raw memories, keys, impulses
  // or authoritative inputs. Existing V20 and original field remain sovereign.
  sensory:()=>{
   const f=native.REALITI_HAPTIC_FIELD_V20.exact(),
    graph=native.REALITI_NEURAL_PASS_V112.graph(),
    st=native.REALITI_DEFAULT_IMPRINT_V1.state(),
    senses=native.Realiti.read('realiti://senses'),
    body=native.Realiti.read('realiti://body/possibility'),
    soma=native.REALITI_SOMA_RELAX_V3.field();
   const count=a=>Array.isArray(a)?a.filter(Boolean).length:null;
   return Object.freeze({
    chart:chart(),v20:f.v,groundedNative:count(f.m),
    nerveZones:graph.zones.length,nerveEdges:graph.edges.length,
    somaVersion:native.REALITI_SOMA_RELAX_V3.version,
    groundedSoma:count(soma?.m),
    pressureVolume:Number(st.sausage?.filled_volume)||0,
    haloModes:st.carrier?.modes?.length||0,
    auraAvailable:!!native.REALITI_AURA_V1?.internalView,
    soundAvailable:!!senses?.sound,lightAvailable:!!senses?.light,
    smellAvailable:!!senses?.smell,
    mentalState:body?.mental_state||null,
    authority:'NATIVE_WORLD_ONLY'
   });
  },
  close:async()=>{closed=true;source.close()}
 });
 return Object.freeze({
  guest:Object.freeze({look,act,speak}),trusted,version:'V20-native',
  law:'Single original 23-chart Relax Matrix; V20 field and original Nyx Neural Pass are unchanged.'
 });
}
module.exports=Object.freeze({createNativeInhabited});
