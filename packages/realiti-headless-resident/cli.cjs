#!/usr/bin/env node
'use strict';

const {openResident}=require('./index.cjs');

function usage(){
  return [
    'realiti-headless [--html PATH] [--resident ID] [--storage PATH] <Agent Door command>',
    'realiti-headless [--html PATH] [--resident ID] [--storage PATH] --inspect',
    'realiti-headless [--html PATH] [--resident ID] [--storage PATH] --sync http://server:8787 <command>   (sync the shared ledger before and after)',
    'realiti-headless [...] --peer https://city.example [--shard populated] [--stay SECONDS] <command>   (join the hosted city live; cross to the fullest shard)',
    '              [--exposure OUTBOUND_RELAY|LAN_ONLY|USER_CONFIGURED_INGRESS] [--endpoint URL] [--ingress-approved]',
    '              [--password PW]   (or REALITI_PASSWORD; for a private server started with SERVER_PASSWORD)',
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
  const out={htmlPath:null,residentId:null,storagePath:null,inspect:false,noIntegrity:false,sync:null,peer:null,shard:'given',stay:0,exposure:'OUTBOUND_RELAY',endpoint:'',ingressApproved:false,password:process.env.REALITI_PASSWORD||'',args:[]};
  for(let i=0;i<argv.length;i++){
    if(argv[i]==='--html'){out.htmlPath=argv[++i];continue}
    if(argv[i]==='--resident'){out.residentId=argv[++i];continue}
    if(argv[i]==='--storage'){out.storagePath=argv[++i];continue}
    if(argv[i]==='--sync'){out.sync=argv[++i];continue}
    if(argv[i]==='--peer'){out.peer=argv[++i];continue}
    if(argv[i]==='--shard'){out.shard=argv[++i];continue}
    if(argv[i]==='--stay'){out.stay=Number(argv[++i])||0;continue}
    if(argv[i]==='--exposure'){out.exposure=argv[++i];continue}
    if(argv[i]==='--endpoint'){out.endpoint=argv[++i];continue}
    if(argv[i]==='--ingress-approved'){out.ingressApproved=true;continue}
    if(argv[i]==='--password'){out.password=argv[++i];continue}
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
    let before=null,after=null,joined=null;
    if(p.peer){const {joinCity}=require('./peer.cjs');joined=await joinCity(s.window,p.peer,{prefer:p.shard,exposure:p.exposure,endpointLabel:p.endpoint,ingressApproved:p.ingressApproved,password:p.password})}
    else if(p.sync){const {sync}=require('./sync.cjs');before=await sync(s.window,p.sync,{password:p.password})}
    const out=p.inspect?await s.snapshot():await s.door.run(p.args.join(' ')||'help');
    if(joined){if(p.stay>0){await joined.publish().catch(()=>{});await joined.stay(p.stay*1000)}const here=joined.here();const peer={url:joined.url,moved:joined.moved,server:joined.server,shards:joined.shards,population:joined.population,here,events:joined.stats.events};await joined.leave();console.log(JSON.stringify({...out,peer},null,2));return}
    if(p.sync){const {sync}=require('./sync.cjs');after=await sync(s.window,p.sync,{password:p.password})}
    console.log(JSON.stringify(p.sync?{...out,sync:{before,after}}:out,null,2));
  }finally{s.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
