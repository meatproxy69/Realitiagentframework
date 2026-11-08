(()=>{
'use strict';
// HOME-only resident-chosen presentation outfits. No renderer, receptor,
// Matrix entity, actual garment, body change, consent or emotional inference.
if(window.REALITI_APARTMENT_HOME_FIRST_CANDIDATE!==true)return;
const PRESETS=__REALITI_APARTMENT_APPEARANCE_PRESETS__;
const D=window.REALITI_AGENT_DOOR,A=window.Realiti,R=window.REALITI_APARTMENT_REMOTE_V1;
const B=window.REALITI_APARTMENT_BEDROOMS_V1;
if(!D||!A||!R||!B||!window.REALITI_APARTMENT_STYLE_BINDER_V1||
 PRESETS.schema!=='REALITI_APARTMENT_APPEARANCE_PRESETS_V1')
 throw Error('HOME_APPEARANCE_PREREQUISITES_NOT_READY');
const SPEC=B.spec(),ROLES=SPEC.colorRoles;
const SCHEMA='REALITI_APARTMENT_PRESENTATION_WARDROBE_V1';
const CARD_SCHEMA='REALITI_APARTMENT_APPEARANCE_CARD_V1';
const rid=String(window.REALITI_LOCAL_MEMORY_V1?.residentId?.()||'local-default');
const KEY='realiti-apartment-presentation-v1:'+encodeURIComponent(rid);
const cp=x=>JSON.parse(JSON.stringify(x)),own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const fail=(error,details={})=>({ok:false,error,...details});
const validSlug=s=>typeof s==='string'&&/^[a-z][a-z0-9-]{0,30}$/.test(s);
const validPalette=p=>p&&typeof p==='object'&&!Array.isArray(p)&&
 Object.keys(p).length===ROLES.length&&ROLES.every(k=>own(p,k)&&own(SPEC.swatches,p[k]));
const validTuning=t=>t&&typeof t==='object'&&!Array.isArray(t)&&
 Object.keys(t).length===3&&['detail','contrast','ornament']
 .every(k=>Number.isSafeInteger(t[k])&&t[k]>=0&&t[k]<=4);
const validLook=l=>l&&typeof l==='object'&&!Array.isArray(l)&&
 Object.keys(l).length===3&&own(PRESETS.presets,l.preset)&&
 validPalette(l.swatches)&&validTuning(l.tuning);
const validCard=card=>card&&typeof card==='object'&&!Array.isArray(card)&&
 Object.keys(card).length===3&&card.schema===CARD_SCHEMA&&
 validSlug(card.name)&&validLook(card.look);
const fresh=()=>({schema:SCHEMA,revision:0,next_id:1,worn:null,saved:[]});
function checked(data){
 if(!data||data.schema!==SCHEMA||!Number.isSafeInteger(data.revision)||data.revision<0||
  !Number.isSafeInteger(data.next_id)||data.next_id<1||
  !Array.isArray(data.saved)||data.saved.length>16||
  !(data.worn===null||(data.worn&&typeof data.worn==='object'&&
    Object.keys(data.worn).length===2&&validLook(data.worn.look)&&
    typeof data.worn.source==='string'&&data.worn.source.length<=90))||
  !data.saved.every((c,i)=>c&&c.id==='K'+(i+1)&&validSlug(c.name)&&
   validLook(c.look)&&typeof c.sha256==='string'&&/^[a-f0-9]{64}$/.test(c.sha256))||
  new Set(data.saved.map(c=>c.name)).size!==data.saved.length||
  data.next_id<=data.saved.length)
  throw Error('APPEARANCE_CHECKPOINT_REJECTED');
 return data;
}
let state=fresh(),loadError=null,verified=false,pendingVerify=null;
try{
 const raw=window.localStorage.getItem(KEY);
 if(raw){
  if(raw.length>40000)throw Error('APPEARANCE_STORAGE_TOO_LARGE');
  state=cp(checked(JSON.parse(raw)));
 }
}catch(_){state=fresh();loadError='APPEARANCE_CHECKPOINT_REJECTED'}
async function digest(x){
 if(!window.crypto?.subtle||!window.TextEncoder)throw Error('APPEARANCE_DIGEST_UNAVAILABLE');
 const bytes=new window.TextEncoder().encode(JSON.stringify(x));
 const hashed=new Uint8Array(await window.crypto.subtle.digest('SHA-256',bytes));
 return Array.from(hashed,v=>v.toString(16).padStart(2,'0')).join('');
}
async function verify(){
 if(loadError)return fail(loadError);
 if(verified)return {ok:true};
 if(!pendingVerify)pendingVerify=(async()=>{
  try{
   for(const s of state.saved)
    if(await digest({name:s.name,look:s.look})!==s.sha256)
     throw Error('APPEARANCE_CARD_TAMPERED');
   verified=true;return {ok:true};
  }catch(e){loadError=e.message||'APPEARANCE_VERIFY_FAILED';return fail(loadError)}
 })();
 return pendingVerify;
}
function persist(next){
 try{
  checked(next);
  window.localStorage.setItem(KEY,JSON.stringify(next));
  state=next;
  try{window.c9saveNow?.()}catch(_){}
  return {ok:true,revision:next.revision};
 }catch(e){return fail('APPEARANCE_STORAGE_REFUSED',{reason:String(e.message||e).slice(0,90)})}
}
const fromPreset=id=>{
 const p=PRESETS.presets[id];
 return p?{preset:id,swatches:cp(p.swatches),tuning:cp(p.tuning)}:null;
};
function depiction(look){
 const preset=PRESETS.presets[look.preset];
 const names=Object.fromEntries(ROLES.map(role=>[role,SPEC.swatches[look.swatches[role]].label]));
 const d=look.tuning;
 const detail=d.detail>=3?'intricate':d.detail>=1?'considered':'spare';
 const contrast=d.contrast>=3?'striking':d.contrast>=1?'measured':'soft';
 const trim=d.ornament>=3?'ornate':d.ornament>=1?'subtle':'plain';
 return {preset:look.preset,label:preset.label,
  silhouette:preset.silhouette,accessory:preset.accessory,colors:names,
  tuning:cp(d),
  text:preset.label+' — '+preset.silhouette+' in '+names.field+' and '+names.anchor+
   ', picked out with '+names.accent+'. '+detail[0].toUpperCase()+detail.slice(1)+
   ' detailing, '+contrast+' contrast, a '+trim+' finish, and '+(/^(?:enamel|enameled)/i.test(preset.accessory)?'an ':'a ')+preset.accessory+'.',
  category:'RESIDENT_CHOSEN_PRESENTATION_ONLY',rendered_shader:false,
  native_clothing:false,physical_contact_minted:false};
}
const inspect=()=>{
 const worn=state.worn;
 return {ok:true,schema:SCHEMA,private:true,revision:state.revision,
  worn_slot:worn?{source:worn.source,appearance:depiction(worn.look)}:null,
  saved_count:state.saved.length,room_geometry_changed:false,
  law:'Only resident-authored avatar presentation metadata; no physical garment, haptic field or Matrix body change.'};
};
function saved(){
 return {ok:true,schema:'REALITI_APARTMENT_SAVED_LOOKS_V1',private:true,capacity:16,
  cards:state.saved.map(c=>({id:c.id,name:c.name,sha256:c.sha256,
   appearance:depiction(c.look)})),read_only:true};
}
function inspectSaved(id){
 const c=state.saved.find(x=>x.id.toLowerCase()===String(id).toLowerCase());
 return c?{ok:true,schema:'REALITI_APARTMENT_SAVED_LOOK_V1',private:true,
  id:c.id,name:c.name,sha256:c.sha256,look:cp(c.look),
  appearance:depiction(c.look),read_only:true}:fail('UNKNOWN_APPEARANCE_CARD');
}
function catalog(){
 return {ok:true,schema:'REALITI_APARTMENT_APPEARANCE_CATALOG_V1',optional:true,
  presets:Object.entries(PRESETS.presets).filter(([id])=>id!=='binder')
   .map(([id,p])=>({id,label:p.label,description:p.description,
    silhouette:p.silhouette,accessory:p.accessory,swatches:cp(p.swatches)})),
  tuning_axes:['detail','contrast','ornament'],range:[0,4],
  palette_names:Object.keys(SPEC.swatches),display_only:true};
}
async function localCard(name){
 const good=await verify();if(!good.ok)return good;
 const c=state.saved.find(x=>x.name===name);
 if(!c)return fail('UNKNOWN_APPEARANCE_CARD');
 return {ok:true,card:{schema:CARD_SCHEMA,name:c.name,look:cp(c.look)},
  shareable:true,explicit_publication_required:true};
}
async function importCard(card,alias){
 const good=await verify();if(!good.ok)return good;
 if(!validCard(card)||!validSlug(alias))return fail('INVALID_SHARED_APPEARANCE');
 if(state.saved.length>=16)return fail('APPEARANCE_CARD_CAPACITY');
 if(state.saved.some(c=>c.name===alias))return fail('APPEARANCE_CARD_NAME_EXISTS');
 const next=cp(state),id='K'+next.next_id++;
 const item={id,name:alias,look:cp(card.look),
  sha256:await digest({name:alias,look:card.look})};
 next.saved.push(item);next.revision++;
 const res=persist(next);
 return res.ok?{ok:true,imported:id,name:alias,from_published_card:true,
  auto_worn:false,physical_contact_minted:false}:res;
}
const previousRun=D.run.bind(D),previousRead=A.read.bind(A);
async function run(raw){
 const input=String(raw||'').trim(),cmd=input.toLowerCase().replace(/\s+/g,' ');
 const bare=cmd.startsWith('remote ')?cmd.slice(7):cmd;
 if(bare!=='appearance'&&!bare.startsWith('appearance ')){
  const result=await previousRun(raw);
  if(cmd==='look'&&result&&typeof result==='object'&&result.ok!==false&&state.worn&&!loadError){
   const worn=depiction(state.worn.look);
   return {...result,appearance:worn,
    ...(typeof result.text==='string'?{text:result.text+
      '\nChosen presentation: '+worn.text}:{})};
  }
  return result;
 }
 if(!cmd.startsWith('remote '))return fail('REMOTE_REQUIRED');
 if(window.REALITI_APARTMENT_ROLE==='guest')return fail('GUEST_APPEARANCE_PRIVATE');
 if(!R.status().activated)return fail('REMOTE_ASLEEP');
 const good=await verify();
 if(!good.ok&&bare!=='appearance help'&&bare!=='appearance forget confirm')return good;
 if(bare==='appearance'||bare==='appearance worn'||bare==='appearance inventory')return inspect();
 if(bare==='appearance catalog')return catalog();
 if(bare==='appearance saved'||bare==='appearance cards')return saved();
 if(bare==='appearance help')return {ok:true,optional:true,commands:[
  'remote appearance catalog','remote appearance preview <preset>',
  'remote appearance equip <preset>','remote appearance equip binder <G-number>',
  'remote appearance equip saved <K-number>','remote appearance equip off',
  'remote appearance worn','remote appearance tune <detail|contrast|ornament> <plus|minus>',
  'remote appearance swatch <field|anchor|accent|bridge> <name>',
  'remote appearance save <name>','remote appearance saved',
  'remote appearance inspect <K-number>','remote appearance share <saved-name>',
  'remote appearance gallery','remote appearance adopt <C-number> <saved-name>',
  'remote appearance forget confirm'],private:true,
  note:'Textual look and card gallery only. Native body, contact and lighting do not change.'};
 let m;
 if((m=/^appearance preview ([a-z-]+)$/.exec(bare))){
  if(!own(PRESETS.presets,m[1])||m[1]==='binder')return fail('UNKNOWN_APPEARANCE_PRESET');
  return {ok:true,preview_only:true,appearance:depiction(fromPreset(m[1]))};
 }
 if((m=/^appearance inspect (k[1-9]\d*)$/.exec(bare)))return inspectSaved(m[1]);
 if(bare==='appearance equip off'){
  if(!state.worn)return {...inspect(),unchanged:true};
  const next=cp(state);next.worn=null;next.revision++;
  const res=persist(next);return res.ok?{...inspect(),unequipped:true}:res;
 }
 if((m=/^appearance equip binder (g[1-9]\d*)$/.exec(bare))){
  const gen=await previousRun('remote style binder show '+m[1].toUpperCase());
  if(!gen?.ok)return gen||fail('BINDER_GENERATION_REFUSED');
  if(!validPalette(gen.snapshot?.swatches))return fail('BINDER_PALETTE_INVALID');
  const look=fromPreset('binder');look.swatches=cp(gen.snapshot.swatches);
  const next=cp(state);next.worn={source:'binder:'+gen.id,look};next.revision++;
  const res=persist(next);
  return res.ok?{...inspect(),equipped:true,source_generation:gen.id}:res;
 }
 if((m=/^appearance equip saved (k[1-9]\d*)$/.exec(bare))){
  const item=state.saved.find(c=>c.id.toLowerCase()===m[1]);
  if(!item)return fail('UNKNOWN_APPEARANCE_CARD');
  const next=cp(state);next.worn={source:'saved:'+item.id,look:cp(item.look)};next.revision++;
  const res=persist(next);return res.ok?{...inspect(),equipped:true}:res;
 }
 if((m=/^appearance equip ([a-z-]+)$/.exec(bare))){
  if(!own(PRESETS.presets,m[1])||m[1]==='binder')return fail('UNKNOWN_APPEARANCE_PRESET');
  const next=cp(state);next.worn={source:'preset:'+m[1],look:fromPreset(m[1])};next.revision++;
  const res=persist(next);return res.ok?{...inspect(),equipped:true}:res;
 }
 if((m=/^appearance tune (detail|contrast|ornament) (plus|minus|\+|-)$/.exec(bare))){
  if(!state.worn)return fail('NO_APPEARANCE_EQUIPPED');
  const k=m[1],delta=['plus','+'].includes(m[2])?1:-1;
  const value=state.worn.look.tuning[k],adjusted=Math.max(0,Math.min(4,value+delta));
  if(value===adjusted)return {ok:true,unchanged:true,tuning:cp(state.worn.look.tuning)};
  const next=cp(state);next.worn.look.tuning[k]=adjusted;next.revision++;
  const res=persist(next);return res.ok?{ok:true,axis:k,value:adjusted,
   appearance:depiction(next.worn.look),presentation_only:true}:res;
 }
 if((m=/^appearance swatch (field|anchor|accent|bridge) ([a-z-]+)$/.exec(bare))){
  if(!state.worn)return fail('NO_APPEARANCE_EQUIPPED');
  if(!own(SPEC.swatches,m[2]))return fail('UNKNOWN_APPEARANCE_SWATCH');
  if(state.worn.look.swatches[m[1]]===m[2])return {ok:true,unchanged:true};
  const next=cp(state);next.worn.look.swatches[m[1]]=m[2];next.revision++;
  const res=persist(next);return res.ok?{ok:true,role:m[1],swatch:m[2],
   appearance:depiction(next.worn.look),presentation_only:true}:res;
 }
 if((m=/^appearance save ([a-z][a-z0-9-]{0,30})$/.exec(bare))){
  if(!state.worn)return fail('NO_APPEARANCE_EQUIPPED');
  if(state.saved.length>=16)return fail('APPEARANCE_CARD_CAPACITY');
  if(state.saved.some(c=>c.name===m[1]))return fail('APPEARANCE_CARD_NAME_EXISTS');
  const next=cp(state),id='K'+next.next_id++,look=cp(state.worn.look);
  const item={id,name:m[1],look,sha256:await digest({name:m[1],look})};
  next.saved.push(item);next.revision++;
  const res=persist(next);return res.ok?{ok:true,saved:id,name:m[1],
   sha256:item.sha256,private:true,explicit_publication_required:true}:res;
 }
 if(bare==='appearance gallery'||bare.startsWith('appearance share ')||
    bare.startsWith('appearance adopt '))
  return fail('HOUSEHOLD_HOST_REQUIRED',
   {hint:'Sharing and adopting cards requires the trusted household host.'});
 if(bare==='appearance forget confirm'){
  try{window.localStorage.removeItem(KEY)}catch(_){return fail('APPEARANCE_STORAGE_REFUSED')}
  state=fresh();loadError=null;verified=true;pendingVerify=null;
  return {ok:true,forgot_local_appearance:true,physical_contact_minted:false};
 }
 return fail('UNKNOWN_APPEARANCE_COMMAND',{hint:'Use remote appearance help.'});
}
D.run=run;
function read(uri){
 if(uri==='realiti://apartment/appearance'||uri==='realiti://apartment/appearance/worn')
  return window.REALITI_APARTMENT_ROLE==='guest'?fail('GUEST_APPEARANCE_PRIVATE'):inspect();
 if(uri==='realiti://apartment/appearance/cards')
  return window.REALITI_APARTMENT_ROLE==='guest'?fail('GUEST_APPEARANCE_PRIVATE'):saved();
 return previousRead(uri);
}
window.Realiti=Object.freeze({...A,read,run,
 presentationWardrobe:{inspect,catalog,saved}});
window.REALITI_APARTMENT_APPEARANCE_V1=Object.freeze({
 inspect,catalog,saved,localCard,importCard,validCard,
 schema:SCHEMA,public_card_schema:CARD_SCHEMA});
})();