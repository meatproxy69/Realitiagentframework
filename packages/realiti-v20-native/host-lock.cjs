'use strict';
// Trusted host only: kernel-owned per-storage lock. No PID/TTL lockfile to go stale.
// The helper holds flock on a persistent inode until its stdin pipe closes.
// SIGKILL of the Node host closes that pipe; the OS then drops the lock.
// Never unlink the lock file: doing so would permit two different lock inodes.
const fs=require('node:fs');
const path=require('node:path');
const {spawn}=require('node:child_process');
const READY='REALITI_VISIT_LOCK_READY';
const error=code=>Object.assign(new Error(code),{code});
async function acquireResidentLock(storagePath){
 if(process.platform!=='linux')throw error('REALITI_FLOCK_REQUIRES_LINUX');
 const target=path.resolve(storagePath);
 const lockPath=target+'.visit.lock';
 fs.mkdirSync(path.dirname(lockPath),{recursive:true});
 // Fail closed on symlinks rather than following an attacker-controlled path.
 const fd=fs.openSync(lockPath,fs.constants.O_RDWR|fs.constants.O_CREAT|fs.constants.O_NOFOLLOW,0o600);
 try{
  if(!fs.fstatSync(fd).isFile())throw error('REALITI_LOCK_NOT_REGULAR');
  fs.fchmodSync(fd,0o600);
 }finally{fs.closeSync(fd)}
 const child=spawn('flock',['-n','-E','75',lockPath,'sh','-c',
  'printf "REALITI_VISIT_LOCK_READY\\n"; cat >/dev/null'],{
  stdio:['pipe','pipe','pipe'],windowsHide:true
 });
 // A fast nonblocking refusal can close stdin before the parent writes.
 child.stdin.on('error',()=>{});
 let released=false,stdout='',stderr='',exitCode=null;
 child.stderr.on('data',b=>{stderr=(stderr+String(b)).slice(-300)});
 const ended=new Promise(resolve=>{
  child.once('exit',(code,signal)=>{exitCode=code??signal;resolve()});
  child.once('error',e=>{exitCode=e.code||'SPAWN_ERROR';resolve()});
 });
 await new Promise((resolve,reject)=>{
  let done=false;
  const timeout=setTimeout(()=>finish(error('REALITI_LOCK_HELPER_TIMEOUT')),5000);
  function finish(e){
   if(done)return;done=true;clearTimeout(timeout);
   if(e){child.stdin.destroy();child.kill();reject(e)}
   else resolve();
  }
  child.stdout.on('data',b=>{
   stdout+=String(b);
   if(stdout.includes(READY+'\n'))finish(null);
   if(stdout.length>256)finish(error('REALITI_LOCK_PROTOCOL_INVALID'));
  });
  ended.then(()=>finish(error(exitCode===75?'REALITI_RESIDENT_IN_USE':
   'REALITI_LOCK_HELPER_FAILED'+(stderr?': '+stderr:''))));
 });
 if(child.exitCode!==null)throw error('REALITI_LOCK_HELPER_FAILED');
 const assertHeld=()=>{
  if(released||exitCode!==null||child.exitCode!==null||child.signalCode!==null)
   throw error('REALITI_RESIDENT_LOCK_LOST');
 };
 const release=async()=>{
  if(released)return;
  released=true;
  child.stdin.end();
  let timeout;
  try{await Promise.race([
   ended,
   new Promise(resolve=>{timeout=setTimeout(()=>{child.kill('SIGTERM');resolve()},2000);timeout.unref?.()})
  ])}finally{clearTimeout(timeout)}
  // The lockfile remains on disk. Kernel release (not age/PID matching)
  // is the sole authority for another process to acquire its inode.
 };
 return Object.freeze({assertHeld,release});
}
module.exports=Object.freeze({acquireResidentLock});
