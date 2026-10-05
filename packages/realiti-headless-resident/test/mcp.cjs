'use strict';
// The stdio MCP server: initialize, tools from the page's schemas, reads that never mutate, actions that do, resources.
const path=require('node:path'),{spawn}=require('node:child_process');
const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
const checks={},details={};
const check=(k,v,d)=>{checks[k]=!!v;if(d!==undefined)details[k]=d};
(async()=>{
 const child=spawn(process.execPath,[path.join(__dirname,'..','mcp.cjs'),'--html',html],{stdio:['pipe','pipe','pipe']});
 const pending=new Map();let buf='';let nextId=1;child.stdout.on('data',d=>{buf+=d;let i;while((i=buf.indexOf('\n'))>=0){const line=buf.slice(0,i);buf=buf.slice(i+1);if(!line.trim())continue;const m=JSON.parse(line);const p=pending.get(m.id);if(p){pending.delete(m.id);p(m)}}});
 let err='';child.stderr.on('data',d=>err+=d);
 const rpc=(method,params)=>new Promise((res,rej)=>{const id=nextId++;pending.set(id,res);child.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n');setTimeout(()=>{if(pending.has(id)){pending.delete(id);rej(new Error('timeout '+method))}},60000)});
 try{
  const init=await rpc('initialize',{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'test',version:'0'}});
  check('initialize',init.result?.protocolVersion==='2024-11-05'&&init.result.serverInfo.name==='realiti-headless-resident',init.result?.serverInfo);
  const tools=(await rpc('tools/list',{})).result.tools,names=tools.map(t=>t.name);
  check('tools_come_from_schemas',names.includes('realiti_read')&&names.includes('realiti_door')&&names.includes('realiti_move')&&names.includes('realiti_look')&&tools.find(t=>t.name==='realiti_move').inputSchema.properties.local&&/\[ACTION\]/.test(tools.find(t=>t.name==='realiti_move').description)&&/\[QUERY\]/.test(tools.find(t=>t.name==='realiti_look').description),{count:names.length});
  const read=await rpc('tools/call',{name:'realiti_read',arguments:{uri:'realiti://here'}});const here=JSON.parse(read.result.content[0].text);
  check('read_never_mutates',read.result._meta.may_mutate===false&&here.room&&typeof here.witness==='string',{room:here.room,may:read.result._meta});
  const go=await rpc('tools/call',{name:'realiti_go',arguments:{place:'CITY'}});const gr=JSON.parse(go.result.content[0].text);
  const where=await rpc('tools/call',{name:'realiti_door',arguments:{command:'where'}});const wr=JSON.parse(where.result.content[0].text);
  check('actions_act',go.result._meta.may_mutate===true&&gr.ok&&/Meridian City/.test(String(wr.text)),{text:String(wr.text).slice(0,60)});
  const stale=await rpc('tools/call',{name:'realiti_move',arguments:{local:[0,1,0],witness:here.witness}});const sr=JSON.parse(stale.result.content[0].text);
  check('witness_refuses_stale_action',sr.ok===false&&sr.error==='STALE_OBSERVATION'&&stale.result.isError===true,sr.error);
  const res=await rpc('resources/list',{});const cap=await rpc('resources/read',{uri:'realiti://capabilities'});const capj=JSON.parse(cap.result.contents[0].text);
  check('resources',res.result.resources.some(r=>r.uri==='realiti://schemas')&&Array.isArray(capj.tool_schemas)&&capj.read_only_operations.includes('look'),{n:res.result.resources.length});
  const bad=await rpc('tools/call',{name:'realiti_nope',arguments:{}});
  check('unknown_tool_is_an_error',bad.error&&bad.error.code===-32601,bad.error);
  await rpc('shutdown',{});
 }finally{child.stdin.end();setTimeout(()=>child.kill(),2000)}
 console.log(JSON.stringify({checks,details},null,2));if(err.trim())console.error('stderr:',err.slice(0,500));
 const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
 if(failed.length){console.error('FAILED',failed);process.exit(1)}
 console.log('MCP PASS',Object.keys(checks).length,'checks');
})().catch(e=>{console.error(e);process.exit(1)});
