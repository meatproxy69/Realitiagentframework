#!/usr/bin/env node
'use strict';

const {openResident}=require('./index.cjs');

function usage(){
  return [
    'realiti-headless [--html PATH] inspect',
    'realiti-headless [--html PATH] run <resident text command>',
    'realiti-headless [--html PATH] invoke <tool> [json-args]',
    '',
    'REALITI_HTML may be used instead of --html.'
  ].join('\n');
}

function parse(argv){
  const out={htmlPath:null,args:[]};
  for(let i=0;i<argv.length;i++){
    if(argv[i]==='--html'){out.htmlPath=argv[++i];continue}
    if(argv[i]==='--help'||argv[i]==='-h'){out.help=true;continue}
    out.args.push(argv[i]);
  }
  return out;
}

(async()=>{
  const p=parse(process.argv.slice(2));
  if(p.help){console.log(usage());return}
  const op=(p.args.shift()||'inspect').toLowerCase();
  const s=await openResident({htmlPath:p.htmlPath});
  try{
    let out;
    if(op==='inspect')out=s.snapshot();
    else if(op==='run')out=await s.Realiti.run(p.args.join(' '));
    else if(op==='invoke'){
      const name=p.args.shift();
      if(!name)throw new Error('invoke requires a tool name');
      const raw=p.args.join(' ').trim();
      out=await s.Realiti.invoke(name,raw?JSON.parse(raw):{});
    }else throw new Error('unknown operation: '+op+'\n'+usage());
    console.log(JSON.stringify(out,null,2));
  }finally{s.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
