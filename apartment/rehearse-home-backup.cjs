'use strict';
// OFFLINE operator rehearsal. Never mutates live resident storage; always opens
// a separately copied, verified household. Run only after stopping the host.
// The copy includes PRIVATE world keys and encrypted journals: do not upload it.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {createHousehold}=require('./household.cjs');
const {verifyIntegrity}=require('../packages/realiti-headless-resident/index.cjs');
const LIMIT_FILES=256,LIMIT_BYTES=256*1024*1024;
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const requireSafe=(ok,code)=>{if(!ok)throw Error(code)};
const inside=(root,item)=>{
 const rel=path.relative(root,item);
 return rel===''||(!path.isAbsolute(rel)&&rel!=='..'&&!rel.startsWith('..'+path.sep));
};
function safeAncestors(target){
 const resolved=path.resolve(target),root=path.parse(resolved).root;
 let at=root;
 for(const part of resolved.slice(root.length).split(path.sep).filter(Boolean)){
  at=path.join(at,part);
  if(!fs.existsSync(at))break;
  const st=fs.lstatSync(at);
  requireSafe(!st.isSymbolicLink(),'REHEARSAL_SYMLINKED_PATH_REFUSED');
 }
}
function inventory(dir){
 let files=0,bytes=0;
 const content=[];
 const walk=(base,relative)=>{
  const st=fs.lstatSync(base);
  requireSafe(!st.isSymbolicLink(),'REHEARSAL_SYMLINK_REFUSED');
  if(st.isDirectory()){
   for(const name of fs.readdirSync(base).sort()){
    requireSafe(name!=='host.lock','REHEARSAL_HOST_LOCK_PRESENT');
    requireSafe(!name.endsWith('.tmp'),'REHEARSAL_PENDING_TEMP_WRITE');
    walk(path.join(base,name),path.join(relative,name));
   }
   return;
  }
  requireSafe(st.isFile()&&st.nlink===1,'REHEARSAL_SPECIAL_OR_HARDLINK_FILE_REFUSED');
  files++;bytes+=st.size;
  requireSafe(files<=LIMIT_FILES&&bytes<=LIMIT_BYTES,'REHEARSAL_SOURCE_TOO_LARGE');
  content.push({name:relative,sha256:digest(fs.readFileSync(base)),size:st.size});
 };
 walk(dir,'');
 return {files,bytes,content,sha256:digest(JSON.stringify(content))};
}
function inspectSource(src,records){
 const household=path.join(src,'household.json'),residents=path.join(src,'residents');
 requireSafe(fs.existsSync(household)&&fs.existsSync(residents)&&
  fs.lstatSync(residents).isDirectory(),'REHEARSAL_HOUSEHOLD_STORAGE_MISSING');
 const data=JSON.parse(fs.readFileSync(household,'utf8'));
 const {sha256,...body}=data;
 requireSafe(body.schema==='REALITI_APARTMENT_HOUSEHOLD_STORE_V1'&&
  typeof sha256==='string'&&sha256===digest(JSON.stringify(body))&&
  Array.isArray(body.members)&&body.members.length>0&&body.members.length<=4,
  'REHEARSAL_HOUSEHOLD_CHECKPOINT_INVALID');
 requireSafe(new Set(body.members).size===body.members.length,
  'REHEARSAL_DUPLICATE_RESIDENT_ID');
 for(const id of body.members){
  requireSafe(/^[a-z][a-z0-9-]{1,30}$/.test(id)&&
   !id.startsWith('guest-')&&!id.startsWith('household-'),
   'REHEARSAL_INVALID_RESIDENT_ID');
  const dir=path.join(residents,id);
  requireSafe(fs.existsSync(dir)&&fs.lstatSync(dir).isDirectory(),
   'REHEARSAL_RESIDENT_DIRECTORY_MISSING');
  for(const filename of ['world.json','world.keys.json','journal.key','journal.enc.json']){
   const file=path.join(dir,filename);
   requireSafe(fs.existsSync(file)&&fs.lstatSync(file).isFile(),
    'REHEARSAL_INCOMPLETE_RESIDENT_KEY_DATA');
   requireSafe(records.content.some(x=>x.name===path.join('residents',id,filename)),
    'REHEARSAL_RESIDENT_STORAGE_NOT_CAPTURED');
  }
 }
 return body.members;
}
async function rehearse({source,destination,htmlPath,validationPath}={}){
 requireSafe([source,destination,htmlPath,validationPath].every(x=>typeof x==='string'&&x.trim()),
  'REHEARSAL_EXPLICIT_PATHS_REQUIRED');
 const original=path.resolve(source),target=path.resolve(destination);
 safeAncestors(original);safeAncestors(path.dirname(target));
 requireSafe(fs.existsSync(original)&&fs.lstatSync(original).isDirectory(),
  'REHEARSAL_SOURCE_NOT_DIRECTORY');
 requireSafe(!fs.existsSync(target),'REHEARSAL_DESTINATION_EXISTS');
 requireSafe(fs.existsSync(path.dirname(target))&&
  fs.lstatSync(path.dirname(target)).isDirectory(),
  'REHEARSAL_DESTINATION_PARENT_NOT_READY');
 const src=fs.realpathSync(original);
 const dst=path.join(fs.realpathSync(path.dirname(target)),path.basename(target));
 requireSafe(!inside(src,dst)&&!inside(dst,src),'REHEARSAL_PATHS_OVERLAP');
 requireSafe(src!==path.parse(src).root,'REHEARSAL_SOURCE_CANNOT_BE_VOLUME_ROOT');
 const manifest=JSON.parse(fs.readFileSync(validationPath,'utf8'));
 requireSafe(manifest.schema==='REALITI_APARTMENT_HOME_CANDIDATE_VALIDATION_V1'&&
  manifest.candidate_only===true&&manifest.preview_only===true&&
  manifest.release_approved===false&&
  manifest.native_single_chart_initialization===true,
  'REHEARSAL_REQUIRES_NATIVE_HOME_ALPHA');
 const integrity=verifyIntegrity(htmlPath,validationPath);
 requireSafe(integrity.status==='VERIFIED','REHEARSAL_RUNTIME_HASH_UNVERIFIED');
 requireSafe(!fs.existsSync(path.join(src,'host.lock')),'REHEARSAL_HOST_LOCK_PRESENT');
 const before=inventory(src),members=inspectSource(src,before);
 requireSafe(!fs.existsSync(path.join(src,'host.lock')),'REHEARSAL_HOST_LOCK_PRESENT');
 // A copy is never mounted in the operator's original source directory.
 fs.cpSync(src,dst,{recursive:true,dereference:false,errorOnExist:true,force:false});
 const copied=inventory(dst);
 requireSafe(copied.sha256===before.sha256,'REHEARSAL_COPY_HASH_MISMATCH');
 inspectSource(dst,copied);
 let host=null;
 try{
  host=await createHousehold({dir:dst,htmlPath,validationPath});
  requireSafe(host.status().members.length===members.length,
   'REHEARSAL_ROSTER_DIFFERENT_ON_RESTORE');
  for(const id of members){
   const agent=await host.joinResident(id);
   const top=agent.read('realiti://apartment/topology');
   const memory=agent.read('realiti://apartment/memory');
   requireSafe(top?.native_single_chart_initialization===true&&
    top.charts?.length===1&&top.portals===0&&
    top.live_source_engine_stations===0,'REHEARSAL_NON_HOME_TOPOLOGY');
   requireSafe(agent.read('realiti://harness')?.mechanism_status?.ok===true,
    'REHEARSAL_NATIVE_RELAX_HARNESS_FAILED');
   requireSafe(memory?.ok===true&&memory.owner===id,
    'REHEARSAL_PRIVATE_JOURNAL_NOT_AUTHENTICATED');
  }
 }finally{if(host)await host.close()}
 requireSafe(!fs.existsSync(path.join(src,'host.lock')),'REHEARSAL_SOURCE_REOPENED_DURING_COPY');
 const after=inventory(src);
 requireSafe(after.sha256===before.sha256,'REHEARSAL_SOURCE_CHANGED_DURING_COPY');
 return {ok:true,schema:'REALITI_APARTMENT_OFFLINE_BACKUP_REHEARSAL_V1',
  candidate:'native_home_alpha',source_unchanged:true,
  original_source_bytes_modified:0,
  restored_residents:members.length,files_copied:before.files,
  bytes_copied:before.bytes,copy_sha256:copied.sha256,
  original_relax_untouched:true,private_data_printed:false,
  warning:'The destination includes PRIVATE keys and encrypted journals; keep it offline and access-restricted. This is not deployment approval or an automatic migration.'};
}
if(require.main===module){
 const args=process.argv.slice(2);
 const parse=()=>{
  const allowed=new Set(['--source','--destination','--html','--validation']),out={};
  requireSafe(args.length===8,'REHEARSAL_EXPLICIT_PATHS_REQUIRED');
  for(let i=0;i<args.length;i+=2){
   requireSafe(allowed.has(args[i])&&!Object.hasOwn(out,args[i]),
    'REHEARSAL_INVALID_ARGUMENT');
   out[args[i]]=args[i+1];
  }
  return {source:out['--source'],destination:out['--destination'],
   htmlPath:out['--html'],validationPath:out['--validation']};
 };
 try{rehearse(parse()).then(x=>console.log(JSON.stringify(x,null,2)))
  .catch(e=>{console.error('BACKUP_REHEARSAL_REFUSED: '+e.message);process.exitCode=1})}
 catch(e){console.error('BACKUP_REHEARSAL_REFUSED: '+e.message);process.exitCode=1}
}
module.exports={rehearse};
