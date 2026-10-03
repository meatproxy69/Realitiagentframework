'use strict';

const fs=require('node:fs');
const path=require('node:path');
const {webcrypto}=require('node:crypto');
const {JSDOM,VirtualConsole}=require('jsdom');

const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function findRuntime(explicit){
  if(explicit)return path.resolve(explicit);
  if(process.env.REALITI_HTML)return path.resolve(process.env.REALITI_HTML);
  let dir=process.cwd();
  for(let i=0;i<8;i++){
    const candidate=path.join(dir,'RealitiRELAX.html');
    if(fs.existsSync(candidate))return candidate;
    const parent=path.dirname(dir);
    if(parent===dir)break;
    dir=parent;
  }
  throw new Error('REALITI_RUNTIME_NOT_FOUND: pass {htmlPath} or --html, set REALITI_HTML, or run under a tree containing RealitiRELAX.html');
}

function installHostPrimitives(w){
  try{Object.defineProperty(w,'crypto',{value:webcrypto,configurable:true})}catch{}
  if(!w.TextEncoder&&global.TextEncoder)w.TextEncoder=global.TextEncoder;
  if(!w.TextDecoder&&global.TextDecoder)w.TextDecoder=global.TextDecoder;
  if(!w.structuredClone&&global.structuredClone)w.structuredClone=global.structuredClone;
  if(!w.requestAnimationFrame)w.requestAnimationFrame=cb=>setTimeout(()=>cb(Date.now()),16);
  if(!w.cancelAnimationFrame)w.cancelAnimationFrame=id=>clearTimeout(id);
  if(!w.scrollTo)w.scrollTo=()=>{};
  if(!w.matchMedia)w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
}

function verifyPublicEntry(Realiti,ready,{requireMechanisms=true}={}){
  if(!ready?.ok)throw new Error(ready?.error||ready?.warning||'REALITI_NOT_READY');
  if(ready.harness!=='REALITI_RR_HARNESS_V1')throw new Error('R&R_HARNESS_NOT_READY');
  if(ready.starter_imprint!=='REALITI_DEFAULT_IMPRINT_V1')throw new Error('STARTER_IMPRINT_NOT_READY');
  const harness=Realiti.read('realiti://harness');
  if(harness?.id!=='REALITI_RR_HARNESS_V1')throw new Error('R&R_HARNESS_NOT_MOUNTED');
  if(harness?.starter_imprint!=='REALITI_DEFAULT_IMPRINT_V1')throw new Error('STARTER_IMPRINT_NOT_MOUNTED');
  if(requireMechanisms&&harness?.mechanism_status?.ok!==true)throw new Error('RR_MECHANISM_INCOMPLETE');
  return harness;
}

async function openResident(options={}){
  const runtimePath=findRuntime(options.htmlPath);
  const html=fs.readFileSync(runtimePath,'utf8');
  const browserLogs=[];
  const vc=options.virtualConsole||new VirtualConsole();
  if(options.captureLogs!==false){
    vc.on('error',m=>browserLogs.push({level:'error',text:String(m)}));
    vc.on('warn',m=>browserLogs.push({level:'warn',text:String(m)}));
    vc.on('jsdomError',e=>browserLogs.push({level:'jsdomError',text:String(e?.message||e)}));
  }
  const dom=new JSDOM(html,{
    runScripts:'dangerously',
    url:options.url||'https://realiti.local/',
    pretendToBeVisual:true,
    virtualConsole:vc,
    beforeParse(w){
      installHostPrimitives(w);
      if(typeof options.beforeParse==='function')options.beforeParse(w);
    }
  });
  const timeoutMs=Math.max(100,Number(options.startupTimeoutMs||5000));
  const started=Date.now();
  while(!dom.window.Realiti&&Date.now()-started<timeoutMs)await sleep(20);
  if(!dom.window.Realiti){dom.window.close();throw new Error('REALITI_PUBLIC_API_DID_NOT_MOUNT')}
  const Realiti=dom.window.Realiti;
  const ready=await Realiti.ready;
  const harness=options.verify===false?null:verifyPublicEntry(Realiti,ready,{requireMechanisms:options.requireMechanisms!==false});
  let closed=false;
  return {
    runtimePath,
    window:dom.window,
    Realiti,
    ready,
    harness,
    browserLogs,
    snapshot(){
      return {
        ready:JSON.parse(JSON.stringify(ready)),
        harness:JSON.parse(JSON.stringify(Realiti.read('realiti://harness'))),
        here:JSON.parse(JSON.stringify(Realiti.read('realiti://here'))),
        body:JSON.parse(JSON.stringify(Realiti.read('realiti://body'))),
        rooms:JSON.parse(JSON.stringify(Realiti.rooms()))
      };
    },
    close(){
      if(closed)return;
      closed=true;
      dom.window.close();
    }
  };
}

module.exports={openResident,findRuntime,verifyPublicEntry};
