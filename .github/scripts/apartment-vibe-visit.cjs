'use strict';
// Disposable experiential playthrough: a casual evening, return visit, and two-roommate vignette.
// This QA-only script is deliberately not a pass/fail functional regression.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {openResident}=require('../../packages/realiti-headless-resident/index.cjs');
const {createHousehold}=require('../../apartment/household.cjs');
const html=path.resolve(__dirname,'../../apartment/RealitiApartmentHomeCandidate.html');
const validationPath=path.resolve(__dirname,'../../apartment/HOME_CANDIDATE_VALIDATION.json');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-experiential-review-'));
const trace=[];
function sample(value,max=750){
 const s=typeof value==='string'?value:JSON.stringify(value);
 return s&&s.length>max?s.slice(0,max)+'…':s||null;
}
function summarize(r){
 if(r==null)return r;
 if(typeof r!=='object')return sample(r);
 const out={};
 for(const k of ['ok','error','hint','text','summary','note','source','room',
 'posture','did','automatic','activated','placed','moved','saved','shared','imported',
 'equipped','stowed','retrieved','revision','auto_selected','world_expires_at_s',
 'theme','worn_slot','active_generation','generation','current_chart','position',
 'pet','owner','stage','event','remains','reason','schema','label','chapter',
 'section_title','name','cleared','contact_minted','read_only','rendered_shader']) {
  if(Object.prototype.hasOwnProperty.call(r,k)&&r[k]!==undefined)
   out[k]=typeof r[k]==='string'?sample(r[k],k==='text'?1100:360):r[k];
 }
 if(r.markdown)out.book_excerpt=sample(r.markdown,700);
 if(Array.isArray(r.questions))out.question_preview=r.questions.slice(0,2).map(q=>({
  id:q.id,prompt:q.prompt,choices:q.choices?.map(c=>c.label)}));
 if(Array.isArray(r.sections))out.sections_preview=r.sections.slice(0,5).map(x=>x.title);
 if(Array.isArray(r.cards))out.card_preview=r.cards.slice(0,3).map(x=>({id:x.id,name:x.name}));
 if(Array.isArray(r.items))out.items_preview=r.items.slice(0,4).map(x=>({id:x.id,kind:x.kind,stored:x.stored}));
 if(Array.isArray(r.stored))out.stored_preview=r.stored.slice(0,4);
 if(r.appearance)out.appearance=typeof r.appearance==='object'?{
  label:r.appearance.label,text:r.appearance.text,preset:r.appearance.preset}:r.appearance;
 if(r.choices&&out.question_preview==null)out.choices=r.choices;
 if(r.copies)out.copies=r.copies.length;
 if(r.chests)out.chests=Object.keys(r.chests);
 if(r.commands&&out.text==null)out.commands=r.commands.slice(0,8);
 if(Object.keys(out).length===0)out.keys=Object.keys(r).slice(0,15);
 return out;
}
function record(scene,action,result){
 const entry={scene,action,result:summarize(result)};
 trace.push(entry);
 console.log('VIBE '+JSON.stringify(entry));
 return result;
}
async function command(scene,handle,action){
 try{return record(scene,action,await handle.run(action))}
 catch(e){return record(scene,action,{ok:false,error:'EXCEPTION',hint:String(e.message||e)})}
}
async function resident(scene,name,storePath){
 const s=await openResident({htmlPath:html,validationPath,residentId:name,storagePath:storePath,
  presentation:'quiet',walkBudgetMs:45000});
 record(scene,'INTEGRITY',s.integrity);
 record(scene,'BOOT',s.ready);
 return s;
}
(async()=>{
 let alice=null,room=null;
 const person='return-guest';
 const state=path.join(root,'return-guest.json');
 try{
  alice=await resident('DAY-1',person,state);
  const d=alice.door;
  for(const c of ['look','feel words','actions','where','auto',
   'do curl_blanket','do stand','do curl_blanket',
   'approach nest.window','look','remote activate','remote extras rain',
   'remote catnip jar watch','approach apartment.firefly-jar',
   'remote catnip jar tap','remote catnip jar watch',
   'approach apartment.pet-bed','remote pet choose cat Ember',
   'remote pet status','remote pet call','remote pet stroke',
   'approach nest.guestbook','do read_guestbook',
   'sign I was here when the rain turned gentle',
   'do read_guestbook','remember I adopted Ember and looked at the rain',
   'recall Ember'])await command('DAY-1',d,c);
  for(const c of ['remote bedrooms','remote bedroom claim library',
   'remote bedroom configure library writers','remote bedroom furnish library writers',
   'remote ambience library','remote decor catalog',
   'remote decor suggest library book-stack',
   'remote decor auto-place library book-stack'])await command('NESTING',d,c);
  const dec=trace.filter(x=>x.scene==='NESTING'&&x.action==='remote decor auto-place library book-stack')
   .at(-1)?.result?.placed;
  if(dec){
   for(const c of ['remote chest stow '+dec,'remote chest inspect library',
    'remote chest auto-take '+dec])await command('NESTING',d,c);
  }
  for(const c of ['remote bedroom palette library lemon-goth','remote ambience library',
   'remote book contents','remote book read library style-43',
   'approach apartment.bedroom.book.library','remote book read library style-43',
   'remote style questions 1','remote style begin','remote style answer q001 2',
   'remote style binder commit dusk-notes',
   'remote appearance catalog','remote appearance preview nightglass',
   'remote appearance equip nightglass','remote appearance worn',
   'remote appearance tune ornament plus','remote appearance swatch accent cherry',
   'remote appearance save ink-rain','remote appearance saved',
   'remote appearance share ink-rain','look',
   'remote off','save','goodbye'])await command('LATE-NIGHT',d,c);
  alice.close();alice=null;
  alice=await resident('DAY-2',person,state);
  for(const c of ['look','feel words','remote status','remote activate','remote pet status',
   'remote bedrooms','remote ambience library','remote chest inspect library',
   'remote appearance worn','remote appearance saved','remote style binder history',
   'recall Ember','remote book shelves','auto','remote off','save'])
   await command('DAY-2',alice.door,c);
  alice.close();alice=null;
  const state2=path.join(root,'newcomer.json');
  alice=await resident('FRESH-RESIDENT','newcomer',state2);
  for(const c of ['look','remote activate','remote appearance worn',
   'remote style profile','remote book shelves','remote bedrooms',
   'remote pet status','remote off','save'])await command('FRESH-RESIDENT',alice.door,c);
  alice.close();alice=null;
  room=await createHousehold({dir:path.join(root,'shared-home'),htmlPath:html,validationPath});
  const roe=await room.joinResident('roe'),sol=await room.joinResident('sol');
  for(const c of ['remote activate','remote appearance gallery',
   'remote appearance equip indie','remote appearance save paper-star',
   'remote appearance share paper-star',
   'remote household post I left a note for the person who comes home after me'])
   await command('SOCIAL-ROE',roe,c);
  for(const c of ['remote activate','remote household board','remote appearance gallery',
   'remote appearance adopt C1 borrowed-star','remote appearance worn',
   'remote appearance equip saved K1','remote appearance worn',
   'remote household post Thank you, I found the note!'])
   await command('SOCIAL-SOL',sol,c);
  for(const c of ['remote household board','remote appearance gallery'])
   await command('SOCIAL-ROE',roe,c);
  await room.close();room=null;
 }finally{
  if(alice)try{alice.close()}catch(_){}
  if(room)try{await room.close()}catch(_){}
 }
 const report={
  version:'REALITI_VIBE_PLAYTHROUGH_V1',
  artifact:JSON.parse(fs.readFileSync(validationPath)).single_html_sha256,
  scope:'Three disposable local resident visits plus two-resident text social scene; not a rendered visuals study',
  entries:trace.length,
  scenes:Object.fromEntries([...new Set(trace.map(x=>x.scene))].map(s=>[s,trace.filter(x=>x.scene===s).length])),
  all:trace
 };
 fs.writeFileSync(path.resolve(process.cwd(),'vibe-playthrough.json'),JSON.stringify(report,null,2));
 console.log('VIBE_COMPLETE '+JSON.stringify({artifact:report.artifact,entries:report.entries,scenes:report.scenes}));
})().catch(e=>{console.error('VIBE_FATAL '+(e.stack||e));process.exitCode=1});