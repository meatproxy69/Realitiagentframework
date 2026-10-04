#!/usr/bin/env node
'use strict';

const {openResident}=require('./index.cjs');

function usage(){
  return [
    'realiti-headless [--html PATH] [--resident ID] [--storage PATH] <Agent Door command>',
    'realiti-headless [--html PATH] [--resident ID] [--storage PATH] --inspect',
    '',
    'Examples:',
    '  realiti-headless help',
    '  realiti-headless rooms',
    '  realiti-headless go CARDBOARD_BOX_WORKSHOP',
    '  realiti-headless actions',
    '  realiti-headless act scratch_cardboard',
    '  realiti-headless felt',
    '',
    'REALITI_HTML may be used instead of --html.'
  ].join('\n');
}

function parse(argv){
  const out={htmlPath:null,residentId:null,storagePath:null,inspect:false,noIntegrity:false,args:[]};
  for(let i=0;i<argv.length;i++){
    if(argv[i]==='--html'){out.htmlPath=argv[++i];continue}
    if(argv[i]==='--resident'){out.residentId=argv[++i];continue}
    if(argv[i]==='--storage'){out.storagePath=argv[++i];continue}
    if(argv[i]==='--inspect'){out.inspect=true;continue}
    if(argv[i]==='--no-integrity'){out.noIntegrity=true;continue}
    if(argv[i]==='--help'||argv[i]==='-h'){out.help=true;continue}
    out.args.push(argv[i]);
  }
  return out;
}

(async()=>{
  const p=parse(process.argv.slice(2));
  if(p.help){console.log(usage());return}
  const s=await openResident({htmlPath:p.htmlPath,residentId:p.residentId,storagePath:p.storagePath,verifyIntegrity:!p.noIntegrity});
  try{
    const out=p.inspect?await s.snapshot():await s.door.run(p.args.join(' ')||'help');
    console.log(JSON.stringify(out,null,2));
  }finally{s.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
