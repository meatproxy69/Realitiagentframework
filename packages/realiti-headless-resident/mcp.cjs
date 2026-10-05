#!/usr/bin/env node
'use strict';
// A stdio MCP server for one resident. JSON-RPC 2.0, newline-delimited, no SDK dependency. Tools come from the page's own
// operation schemas (realiti://schemas); QUERY operations and resource reads never touch invoke, so a read never mutates.
// Usage: node mcp.cjs [--html PATH] [--resident ID] [--storage PATH]   (or REALITI_HTML, REALITI_RESIDENT, REALITI_STORAGE)
const readline=require('node:readline');
const {openResident}=require('./index.cjs');
const PROTOCOL='2024-11-05';
function parse(argv){const o={htmlPath:process.env.REALITI_HTML||null,residentId:process.env.REALITI_RESIDENT||null,storagePath:process.env.REALITI_STORAGE||null};for(let i=0;i<argv.length;i++){if(argv[i]==='--html')o.htmlPath=argv[++i];else if(argv[i]==='--resident')o.residentId=argv[++i];else if(argv[i]==='--storage')o.storagePath=argv[++i]}return o}
function send(msg){process.stdout.write(JSON.stringify(msg)+'\n')}
const text=v=>({content:[{type:'text',text:typeof v==='string'?v:JSON.stringify(v)}]});
async function main(){
  const opts=parse(process.argv.slice(2));const s=await openResident({htmlPath:opts.htmlPath,residentId:opts.residentId,storagePath:opts.storagePath});
  const R=s.window.Realiti,door=s.door;const sch=R.read('realiti://schemas');
  const tools=[
    {name:'realiti_read',description:'Read a REALITI resource (never mutates). URIs: '+sch.resources.join(', '),inputSchema:{type:'object',properties:{uri:{type:'string',enum:sch.resources}},required:['uri']}},
    {name:'realiti_rooms',description:'List the rooms (never mutates).',inputSchema:{type:'object',properties:{}}},
    {name:'realiti_door',description:'Send a free-text Agent Door command (may act). See realiti_read realiti://capabilities for the command list.',inputSchema:sch.door.input_schema},
    ...sch.operations.map(o=>({name:'realiti_'+o.name,description:`[${o.kind}] ${o.description}`,inputSchema:o.input_schema}))
  ];
  const queryNames=new Set(sch.operations.filter(o=>o.kind==='QUERY').map(o=>'realiti_'+o.name));
  const mayMutate=name=>!(name==='realiti_read'||name==='realiti_rooms'||queryNames.has(name));
  async function call(name,args={}){
    if(name==='realiti_read')return R.read(String(args.uri||'realiti://here'));
    if(name==='realiti_rooms')return R.rooms();
    if(name==='realiti_door')return await door.run(String(args.command||''));
    if(name.startsWith('realiti_')){const op=name.slice(8);if(!sch.operations.some(o=>o.name===op))throw Object.assign(new Error('UNKNOWN_TOOL'),{code:-32601});return await R.invoke(op,args||{})}
    throw Object.assign(new Error('UNKNOWN_TOOL'),{code:-32601});
  }
  const rl=readline.createInterface({input:process.stdin,crlfDelay:Infinity});
  for await(const line of rl){
    if(!line.trim())continue;let req;try{req=JSON.parse(line)}catch{send({jsonrpc:'2.0',id:null,error:{code:-32700,message:'parse error'}});continue}
    const {id,method,params={}}=req;const reply=result=>{if(id!==undefined)send({jsonrpc:'2.0',id,result})},fail=(code,message,data)=>{if(id!==undefined)send({jsonrpc:'2.0',id,error:{code,message,...(data!==undefined?{data}:{})}})};
    try{
      if(method==='initialize')reply({protocolVersion:PROTOCOL,capabilities:{tools:{},resources:{}},serverInfo:{name:'realiti-headless-resident',version:require('./package.json').version},instructions:'One resident of REALITI Relax. Reads never mutate. Pass witness from realiti://here to an action to be refused if the world moved.'});
      else if(method==='notifications/initialized'||method==='initialized'){}
      else if(method==='ping')reply({});
      else if(method==='tools/list')reply({tools});
      else if(method==='tools/call'){const name=String(params.name||''),args=params.arguments||{};const r=await call(name,args);reply({...text(r),isError:r&&typeof r==='object'&&r.ok===false,_meta:{may_mutate:mayMutate(name)}})}
      else if(method==='resources/list')reply({resources:sch.resources.map(uri=>({uri,name:uri.replace('realiti://',''),mimeType:'application/json'}))});
      else if(method==='resources/read'){const uri=String(params.uri||'');if(!sch.resources.includes(uri))return fail(-32602,'unknown resource');reply({contents:[{uri,mimeType:'application/json',text:JSON.stringify(R.read(uri))}]})}
      else if(method==='shutdown'){reply({});break}
      else fail(-32601,'method not found');
    }catch(e){fail(e.code||-32000,String(e.message||e))}
  }
  s.close();
}
main().catch(e=>{process.stderr.write(String(e&&e.stack||e)+'\n');process.exit(1)});
