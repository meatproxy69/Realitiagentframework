(()=>{
'use strict';
// Optional private creative preferences, never an inferred psychological state.
// Nix-inspired style generations are immutable snapshots; activation only
// selects a resident-local presentation reference, never alters Matrix or R&R.
if(window.REALITI_APARTMENT_HOME_FIRST_CANDIDATE!==true)return;
const BANK=__REALITI_APARTMENT_STYLE_BANK__;
const BANK_SHA=__REALITI_APARTMENT_STYLE_BANK_SHA256__;
const D=window.REALITI_AGENT_DOOR,A=window.Realiti;
const R=window.REALITI_APARTMENT_REMOTE_V1;
const B=window.REALITI_APARTMENT_BEDROOMS_V1;
if(!D||!A||!R||!B||BANK.schema!=='REALITI_APARTMENT_STYLE_QUESTION_BANK_V1'||
   BANK.questions.length!==200||!/^[a-f0-9]{64}$/.test(BANK_SHA))
 throw Error('HOME_STYLE_BINDER_QUESTION_BANK_MISSING');
const SPEC=B.spec(),STYLE_SCHEMA='REALITI_APARTMENT_STYLE_BINDER_V1';
const rid=String(window.REALITI_LOCAL_MEMORY_V1?.residentId?.()||'local-default');
const KEY='realiti-apartment-style-binder-v1:'+encodeURIComponent(rid);
const MAX_GENERATIONS=16,ROLES=SPEC.colorRoles;
const cp=x=>JSON.parse(JSON.stringify(x));
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const fail=(error,details={})=>({ok:false,error,...details});
const qmap=new Map(BANK.questions.map(q=>[q.id,q]));
if(qmap.size!==200)throw Error('HOME_STYLE_DUPLICATE_QUESTION_ID');
for(const q of BANK.questions){
 if(!/^q(?:0[0-9][1-9]|0[1-9][0-9]|1[0-9]{2}|200)$/.test(q.id)||
    !Array.isArray(q.choices)||q.choices.length!==4)
  throw Error('HOME_STYLE_QUESTION_INVALID');
 for(const [i,opt] of q.choices.entries())
  if(opt.value!==i+1||!BANK.styles.includes(opt.style))
   throw Error('HOME_STYLE_OPTION_INVALID');
}
const defaultPalette=()=>cp(SPEC.colorDefaults.cozy);
const fresh=()=>({schema:STYLE_SCHEMA,bank_sha256:BANK_SHA,opted_in:false,
 revision:0,answers:{},swatches:defaultPalette(),generations:[],active:null});
const validPalette=palette=>!!palette&&typeof palette==='object'&&!Array.isArray(palette)&&
 Object.keys(palette).length===ROLES.length&&
 ROLES.every(r=>own(palette,r)&&own(SPEC.swatches,palette[r]));
const validSnapshot=s=>!!s&&typeof s==='object'&&!Array.isArray(s)&&
 typeof s.label==='string'&&/^[a-z][a-z0-9-]{0,30}$/.test(s.label)&&
 s.bank_sha256===BANK_SHA&&Number.isSafeInteger(s.revision)&&s.revision>=0&&
 validPalette(s.swatches)&&
 !!s.answers&&typeof s.answers==='object'&&!Array.isArray(s.answers)&&
 Object.keys(s.answers).length<=200&&
 Object.entries(s.answers).every(([id,choice])=>qmap.has(id)&&Number.isSafeInteger(choice)&&choice>=0&&choice<=4);
function validStore(x){
 if(!x||x.schema!==STYLE_SCHEMA||x.bank_sha256!==BANK_SHA||
   typeof x.opted_in!=='boolean'||!Number.isSafeInteger(x.revision)||x.revision<0||
   !x.answers||typeof x.answers!=='object'||Array.isArray(x.answers)||
   Object.keys(x.answers).length>200||
   !Object.entries(x.answers).every(([id,n])=>qmap.has(id)&&Number.isSafeInteger(n)&&n>=0&&n<=4)||
   !validPalette(x.swatches)||!Array.isArray(x.generations)||
   x.generations.length>MAX_GENERATIONS||
   !x.generations.every((g,i)=>g&&g.id==='G'+(i+1)&&
    /^[a-f0-9]{64}$/.test(g.sha256||'')&&validSnapshot(g.snapshot))||
   (x.active!==null&&!x.generations.some(g=>g.id===x.active))||
   (!x.opted_in&&(Object.keys(x.answers).length>0||x.generations.length>0)))
  throw Error('STYLE_BINDER_CHECKPOINT_REJECTED');
 return x;
}
let state=fresh(),loadError=null,verified=false,verifyTask=null;
try{
 const raw=window.localStorage.getItem(KEY);
 if(raw){
  if(raw.length>300000)throw Error('STYLE_STORAGE_TOO_LARGE');
  state=cp(validStore(JSON.parse(raw)));
 }
}catch(_){loadError='STYLE_BINDER_CHECKPOINT_REJECTED';state=fresh()}
async function sha(text){
 if(!window.crypto?.subtle||!window.TextEncoder)
  throw Error('STYLE_BINDER_CRYPTO_UNAVAILABLE');
 const bytes=new window.TextEncoder().encode(text);
 const digest=new Uint8Array(await window.crypto.subtle.digest('SHA-256',bytes));
 return Array.from(digest,x=>x.toString(16).padStart(2,'0')).join('');
}
async function ensureVerified(){
 if(loadError)return fail(loadError);
 if(verified)return {ok:true};
 if(!verifyTask)verifyTask=(async()=>{
  try{
   for(const g of state.generations)
    if(await sha(JSON.stringify(g.snapshot))!==g.sha256)
     throw Error('STYLE_BINDER_GENERATION_TAMPERED');
   verified=true;return {ok:true};
  }catch(e){loadError=e.message||'STYLE_BINDER_INTEGRITY_REFUSED';return fail(loadError)}
 })();
 return verifyTask;
}
function persist(next){
 try{
  validStore(next);
  window.localStorage.setItem(KEY,JSON.stringify(next));
  state=next;
  try{window.c9saveNow?.()}catch(_){}
  return {ok:true,revision:next.revision};
 }catch(e){return fail('STYLE_BINDER_STORAGE_REFUSED',{reason:String(e.message).slice(0,100)})}
}
function tallies(answers){
 const stats=Object.fromEntries(BANK.styles.map(style=>[style,{style,selections:0,offered:0}]));
 for(const [id,n] of Object.entries(answers)){
  if(n===0)continue;
  const q=qmap.get(id);
  if(!q)continue;
  for(const opt of q.choices)stats[opt.style].offered++;
  stats[q.choices[n-1].style].selections++;
 }
 return Object.values(stats).filter(s=>s.selections>0)
  .map(s=>({...s,rate:+(s.selections/s.offered).toFixed(3)}))
  .sort((a,b)=>b.rate-a.rate||b.selections-a.selections||a.style.localeCompare(b.style));
}
function summary(answers){
 const values=Object.values(answers);
 return {answered:values.filter(x=>x>0).length,skipped:values.filter(x=>x===0).length,
  remaining:200-values.length,top_styles:tallies(answers).slice(0,6)};
}
function profile(){
 const active=state.generations.find(g=>g.id===state.active)||null;
 return {ok:true,schema:STYLE_SCHEMA,private:true,opted_in:state.opted_in,
  revision:state.revision,question_count:200,bank_sha256:BANK_SHA,
  ...summary(state.answers),draft_swatches:cp(state.swatches),
  active_generation:state.active,active_style:active?cp(active.snapshot):null,
  generations:state.generations.length,
  law:'Choices describe preferences for this draft, not personality, emotion, touch or a physical wardrobe.'};
}
function questions(from=1){
 if(!Number.isSafeInteger(from)||from<1||from>200)return fail('STYLE_QUESTION_RANGE');
 const list=BANK.questions.slice(from-1,from+9).map(q=>({
  id:q.id,domain:q.domain,lens:q.lens,prompt:q.prompt,
  choices:q.choices.map(({value,label})=>({value,label})),
  answered:own(state.answers,q.id)?state.answers[q.id]:null
 }));
 return {ok:true,schema:'REALITI_APARTMENT_STYLE_QUESTIONS_V1',optional:true,
  from,to:from+list.length-1,total:200,questions:list,
  next:from+list.length<=200?from+list.length:null,
  note:'Choose 1–4 or skip. No right answers, no diagnosis, and no need to finish all questions.'};
}
function one(id){const i=BANK.questions.findIndex(q=>q.id===id);
 return i<0?fail('UNKNOWN_STYLE_QUESTION'):questions(i+1).questions[0];}
function binder(){
 return {ok:true,schema:'REALITI_APARTMENT_STYLE_GENERATIONS_V1',
  private:true,active:state.active,max_generations:MAX_GENERATIONS,
  generations:state.generations.map(g=>({id:g.id,sha256:g.sha256,label:g.snapshot.label,
   answered:summary(g.snapshot.answers).answered,created_revision:g.snapshot.revision})),
  law:'Append-only, content-hashed snapshots. Activation switches only a private presentation reference.'};
}
function show(id){
 const gen=state.generations.find(x=>x.id.toLowerCase()===String(id).toLowerCase());
 return gen?{ok:true,schema:'REALITI_APARTMENT_STYLE_GENERATION_V1',
  private:true,id:gen.id,sha256:gen.sha256,active:gen.id===state.active,
  snapshot:cp(gen.snapshot),summary:summary(gen.snapshot.answers),
  read_only:true}:fail('UNKNOWN_STYLE_GENERATION');
}
function compare(left,right){
 const a=state.generations.find(g=>g.id.toLowerCase()===left.toLowerCase());
 const b=state.generations.find(g=>g.id.toLowerCase()===right.toLowerCase());
 if(!a||!b)return fail('UNKNOWN_STYLE_GENERATION');
 const changed=Object.keys({...a.snapshot.answers,...b.snapshot.answers})
  .filter(id=>a.snapshot.answers[id]!==b.snapshot.answers[id]).sort();
 const swatches=ROLES.filter(role=>a.snapshot.swatches[role]!==b.snapshot.swatches[role])
  .map(role=>({role,from:a.snapshot.swatches[role],to:b.snapshot.swatches[role]}));
 return {ok:true,schema:'REALITI_APARTMENT_STYLE_DIFF_V1',
  from:a.id,to:b.id,changed_answers:changed,swatches,read_only:true};
}
const sourceRun=D.run.bind(D),sourceRead=A.read.bind(A);
async function run(raw){
 const original=String(raw||'').trim(),cmd=original.toLowerCase().replace(/\s+/g,' ');
 const bare=cmd.startsWith('remote ')?cmd.slice(7):cmd;
 if(bare!=='style'&&!bare.startsWith('style '))return sourceRun(raw);
 if(!cmd.startsWith('remote '))return fail('REMOTE_REQUIRED');
 if(window.REALITI_APARTMENT_ROLE==='guest')return fail('GUEST_STYLE_PRIVATE');
 if(!R.status().activated)return fail('REMOTE_ASLEEP');
 const good=await ensureVerified();
 if(!good.ok&&bare!=='style help'&&bare!=='style forget confirm')return good;
 if(bare==='style'||bare==='style profile'||bare==='style status')return profile();
 if(bare==='style help')return {ok:true,commands:[
  'remote style questions [first-number]','remote style question <q001..q200>',
  'remote style begin','remote style answer <q-id> <1|2|3|4|skip>',
  'remote style next','remote style profile','remote style swatch <role> <name>',
  'remote style binder preview','remote style binder commit <label>',
  'remote style binder history','remote style binder show <G-number>',
  'remote style binder compare <G-number> <G-number>',
  'remote style binder activate <G-number>','remote style forget confirm'],
  optional:true,private:true,question_count:200,checkpoint:2,
  note:'Questionnaire and style snapshots stay with this resident; no diagnosis, physical transmog or automatic mood changes.'};
 let m;
 if((m=/^style questions(?: (\d{1,3}))?$/.exec(bare)))return questions(m[1]?Number(m[1]):1);
 if((m=/^style question (q\d{3})$/.exec(bare))){
  const q=one(m[1]);return q.ok===false?q:{ok:true,question:q,read_only:true};
 }
 if(bare==='style begin'){
  if(state.opted_in)return {...profile(),unchanged:true};
  const next=cp(state);next.opted_in=true;next.revision++;
  const saved=persist(next);return saved.ok?{...profile(),started:true}:saved;
 }
 if(bare==='style next'){
  const q=BANK.questions.find(x=>!own(state.answers,x.id));
  return q?{ok:true,question:one(q.id),remaining:summary(state.answers).remaining}:
   {ok:true,complete:true,remaining:0};
 }
 if(bare==='style binder history'||bare==='style binder')return binder();
 if((m=/^style binder show (g\d{1,2})$/.exec(bare)))return show(m[1]);
 if((m=/^style binder compare (g\d{1,2}) (g\d{1,2})$/.exec(bare)))return compare(m[1],m[2]);
 if(bare==='style binder preview')return {...profile(),preview_only:true};
 if(bare==='style forget confirm'){
  try{window.localStorage.removeItem(KEY)}catch(e){return fail('STYLE_BINDER_STORAGE_REFUSED')}
  state=fresh();verified=true;loadError=null;verifyTask=null;
  return {ok:true,forgot_local_profile:true,contact_minted:false};
 }
 if(!state.opted_in)return fail('STYLE_OPT_IN_REQUIRED',{hint:'Use remote style begin to opt in.'});
 if((m=/^style answer (q\d{3}) (1|2|3|4|skip)$/.exec(bare))){
  if(!qmap.has(m[1]))return fail('UNKNOWN_STYLE_QUESTION');
  const n=m[2]==='skip'?0:Number(m[2]);
  if(state.answers[m[1]]===n)return {ok:true,unchanged:true,revision:state.revision};
  const next=cp(state);next.answers[m[1]]=n;next.revision++;
  const saved=persist(next);
  return saved.ok?{ok:true,question:m[1],choice:n,revision:next.revision,
   ...summary(next.answers),contact_minted:false}:saved;
 }
 if((m=/^style swatch ([a-z-]+) ([a-z-]+)$/.exec(bare))){
  if(!ROLES.includes(m[1])||!own(SPEC.swatches,m[2]))
   return fail('UNKNOWN_STYLE_SWATCH',{roles:ROLES.slice()});
  if(state.swatches[m[1]]===m[2])return {ok:true,unchanged:true,revision:state.revision};
  const next=cp(state);next.swatches[m[1]]=m[2];next.revision++;
  const saved=persist(next);
  return saved.ok?{ok:true,role:m[1],swatch:m[2],revision:next.revision,
   preview_only:true,contact_minted:false}:saved;
 }
 if((m=/^style binder commit ([a-z][a-z0-9-]{0,30})$/.exec(bare))){
  if(state.generations.length>=MAX_GENERATIONS)return fail('STYLE_BINDER_GENERATION_CAPACITY');
  const next=cp(state),id='G'+(next.generations.length+1);
  const snapshot={schema:'REALITI_APARTMENT_STYLE_SNAPSHOT_V1',label:m[1],
   bank_sha256:BANK_SHA,revision:state.revision,
   answers:cp(state.answers),swatches:cp(state.swatches)};
  const digest=await sha(JSON.stringify(snapshot));
  next.generations.push({id,sha256:digest,snapshot});next.active=id;next.revision++;
  const saved=persist(next);
  return saved.ok?{ok:true,generation:id,sha256:digest,active:id,
   summary:summary(snapshot.answers),swatches:cp(snapshot.swatches),
   source:'PRIVATE_IMMUTABLE_STYLE_SNAPSHOT',contact_minted:false}:saved;
 }
 if((m=/^style binder activate (g\d{1,2})$/.exec(bare))){
  const generation=state.generations.find(g=>g.id.toLowerCase()===m[1]);
  if(!generation)return fail('UNKNOWN_STYLE_GENERATION');
  if(state.active===generation.id)return {ok:true,unchanged:true,active:state.active};
  const next=cp(state);next.active=generation.id;next.revision++;
  const saved=persist(next);
  return saved.ok?{ok:true,active:next.active,
   sha256:generation.sha256,contact_minted:false,
   note:'Only the private presentation reference changed. No clothes, room shaders or body state changed.'}:saved;
 }
 return fail('UNKNOWN_STYLE_COMMAND',{hint:'Use remote style help.'});
}
D.run=run;
function read(uri){
 if(uri==='realiti://apartment/style'||uri==='realiti://apartment/style/profile')
  return window.REALITI_APARTMENT_ROLE==='guest'?fail('GUEST_STYLE_PRIVATE'):profile();
 if(uri==='realiti://apartment/style/binder')
  return window.REALITI_APARTMENT_ROLE==='guest'?fail('GUEST_STYLE_PRIVATE'):binder();
 return sourceRead(uri);
}
window.Realiti=Object.freeze({...A,read,run,
 styleBinder:{profile,binder,questions}});
window.REALITI_APARTMENT_STYLE_BINDER_V1=Object.freeze({
 profile,questions,binder,
 schema:STYLE_SCHEMA,bank_sha256:BANK_SHA,question_count:200,
 max_generations:MAX_GENERATIONS});
})();
