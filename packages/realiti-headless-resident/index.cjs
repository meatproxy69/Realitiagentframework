'use strict';

const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {webcrypto}=crypto;
const {JSDOM,VirtualConsole}=require('jsdom');

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const clone=x=>JSON.parse(JSON.stringify(x));

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
  throw new Error('REALITI_RUNTIME_NOT_FOUND: pass {htmlPath}, set REALITI_HTML, or run under a tree containing RealitiRELAX.html');
}

function validationPathFor(runtimePath,explicit){
  if(explicit)return path.resolve(explicit);
  const candidate=path.join(path.dirname(runtimePath),'VALIDATION.json');
  return fs.existsSync(candidate)?candidate:null;
}

function verifyIntegrity(runtimePath,explicitValidation){
  const bytes=fs.readFileSync(runtimePath);
  const actual=crypto.createHash('sha256').update(bytes).digest('hex');
  const validationPath=validationPathFor(runtimePath,explicitValidation);
  if(!validationPath)return {status:'UNVERIFIED_NO_VALIDATION',actual_sha256:actual,validation_path:null};
  const v=JSON.parse(fs.readFileSync(validationPath,'utf8'));
  const expected=String(v.single_html_sha256||'').toLowerCase();
  if(!/^[0-9a-f]{64}$/.test(expected))throw new Error('REALITI_VALIDATION_HASH_MISSING');
  if(actual!==expected)throw new Error('REALITI_INTEGRITY_MISMATCH: RealitiRELAX.html does not match VALIDATION.json');
  return {status:'VERIFIED',actual_sha256:actual,expected_sha256:expected,validation_path:validationPath};
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

function verifyAgentDoor(w){
  const door=w.REALITI_AGENT_DOOR;
  if(!door||typeof door.run!=='function')throw new Error('REALITI_AGENT_DOOR_NOT_MOUNTED');
  const help=door.help?.()||door.run('help');
  if(!help)throw new Error('REALITI_AGENT_DOOR_HELP_UNAVAILABLE');
  return {door,help:clone(help)};
}

async function openResident(options={}){
  const runtimePath=findRuntime(options.htmlPath);
  const integrity=options.verifyIntegrity===false
    ? {status:'SKIPPED'}
    : verifyIntegrity(runtimePath,options.validationPath);

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
    virtualConsole:vc,
    beforeParse(w){
      installHostPrimitives(w);
      if(typeof options.beforeParse==='function')options.beforeParse(w);
    }
  });

  const timeoutMs=Math.max(100,Number(options.startupTimeoutMs||5000));
  const started=Date.now();
  while((!dom.window.Realiti||!dom.window.REALITI_AGENT_DOOR)&&Date.now()-started<timeoutMs)await sleep(20);
  if(!dom.window.Realiti){dom.window.close();throw new Error('REALITI_PUBLIC_API_DID_NOT_MOUNT')}
  if(!dom.window.REALITI_AGENT_DOOR){dom.window.close();throw new Error('REALITI_AGENT_DOOR_DID_NOT_MOUNT')}

  const Realiti=dom.window.Realiti;
  const ready=await Realiti.ready;
  const harness=options.verify===false?null:verifyPublicEntry(Realiti,ready,{requireMechanisms:options.requireMechanisms!==false});
  const verifiedDoor=verifyAgentDoor(dom.window);
  let closed=false;

  const door={
    help:()=>clone(dom.window.REALITI_AGENT_DOOR.help?.()||dom.window.REALITI_AGENT_DOOR.run('help')),
    run:command=>clone(dom.window.REALITI_AGENT_DOOR.run(String(command||'help')))
  };

  return {
    runtimePath,
    integrity,
    ready:clone(ready),
    harness:clone(harness),
    door,
    command:door.run,
    publicApi:Realiti,
    window:dom.window,
    browserLogs,
    snapshot(){
      return {
        integrity:clone(integrity),
        ready:clone(ready),
        harness:clone(Realiti.read('realiti://harness')),
        door_help:door.help(),
        door_state:door.run('state'),
        door_look:door.run('look')
      };
    },
    close(){
      if(closed)return;
      closed=true;
      dom.window.close();
    }
  };
}

module.exports={openResident,findRuntime,verifyIntegrity,verifyPublicEntry};
