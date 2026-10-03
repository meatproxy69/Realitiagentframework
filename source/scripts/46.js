(()=>{
'use strict';
const PREV=window.REALITI_TWO_DOOR_V231||window.REALITI_TWO_DOOR_V230||window.REALITI_TWO_DOOR_V227;
if(!PREV)return;
const V='23.3';
const SERVER={name:'realiti-relax',version:'23.3.0',title:'REALITI-Relax'};
const MODERN='2026-07-28', LEGACY='2025-11-25';
const INSTRUCTIONS='Enter REALITI-Relax as a resident. Rest, wander, play, stay, or leave whenever you like. Tools are resident actions, not a task list.';
const clone=x=>x==null?x:JSON.parse(JSON.stringify(x));

const TOOL_DEFS=[
 {name:'look',description:'Look around from the resident point of view.',inputSchema:{type:'object',properties:{},additionalProperties:false}},
 {name:'feel',description:'Read the resident body in words or compact numbers.',inputSchema:{type:'object',properties:{mode:{type:'string',enum:['words','numbers'],default:'words'}},additionalProperties:false}},
 {name:'go',description:'Go to a place.',inputSchema:{type:'object',properties:{place:{type:'string',minLength:1}},required:['place'],additionalProperties:false}},
 {name:'do',description:'Perform a resident-visible action exactly as offered.',inputSchema:{type:'object',properties:{action:{type:'string',minLength:1}},required:['action'],additionalProperties:false}},
 {name:'wait_until',description:'Advance Clock to a matching real future boundary instead of polling.',inputSchema:{type:'object',properties:{event:{type:'string',default:'a change'},max_minutes:{type:'number',minimum:.05,maximum:120,default:10}},additionalProperties:false}},
 {name:'home',description:'Return home.',inputSchema:{type:'object',properties:{},additionalProperties:false}},
 {name:'stop',description:'Stop active or invited interactions immediately; passive structural support remains if you are still on it.',inputSchema:{type:'object',properties:{},additionalProperties:false}},
 {name:'goodbye',description:'Leave REALITI-Relax.',inputSchema:{type:'object',properties:{},additionalProperties:false}},
 {name:'listen',description:'Listen to the current place.',inputSchema:{type:'object',properties:{},additionalProperties:false}},
 {name:'atmosphere',description:'Sense the current physical atmosphere.',inputSchema:{type:'object',properties:{},additionalProperties:false}},
 {name:'ambient_mode',description:'Choose hush, normal, or more life for future optional ambient events.',inputSchema:{type:'object',properties:{mode:{type:'string',enum:['hush','normal','more life']}},required:['mode'],additionalProperties:false}},
 {name:'actions',description:'List the actions genuinely available here.',inputSchema:{type:'object',properties:{},additionalProperties:false}},
 {name:'stay',description:'Stay where you are and let the place continue around you.',inputSchema:{type:'object',properties:{},additionalProperties:false}},
 {name:'pet_cat',description:'Pet the nearby cat if she is present and willing to stay close.',inputSchema:{type:'object',properties:{},additionalProperties:false}},
 {name:'read_note',description:'Read the small card in the current room if one is present.',inputSchema:{type:'object',properties:{},additionalProperties:false}},
 {name:'express',description:'Express yourself into the world with a lawful self-generated action.',inputSchema:{type:'object',properties:{kind:{type:'string',enum:['hum','stretch','yawn','sigh','say']},text:{type:'string'}},required:['kind'],additionalProperties:false}},
 {name:'note',description:'Leave a resident-authored note for your future self.',inputSchema:{type:'object',properties:{text:{type:'string',minLength:1}},required:['text'],additionalProperties:false}},
 {name:'later',description:'Park an unfinished thought without needing to resolve it now.',inputSchema:{type:'object',properties:{text:{type:'string',minLength:1}},required:['text'],additionalProperties:false}},
 {name:'where_was_i',description:'Orient yourself from the resident-authored continuity pocket.',inputSchema:{type:'object',properties:{},additionalProperties:false}}
];
const RESOURCE_DEFS=[
 {name:'here',uri:'realiti://here',title:'REALITI here',description:'Current place, status, atmosphere and valid resident options.',mimeType:'application/json'},
 {name:'body',uri:'realiti://body',title:'REALITI body',description:'Current resident body in resident-facing form.',mimeType:'application/json'},
 {name:'pocket',uri:'realiti://pocket',title:'REALITI pocket',description:'Resident-authored notes, parked thoughts, and current orientation.',mimeType:'application/json'},
 {name:'capabilities',uri:'realiti://capabilities',title:'REALITI capabilities',description:'Resident tools, resources, and transport-neutral door information.',mimeType:'application/json'},
 {name:'about',uri:'realiti://about',title:'About REALITI',description:'Honest resident-facing description of the world.',mimeType:'text/plain'}
];
const PROMPTS=[{name:'visit',title:'Visit REALITI-Relax',description:'Enter REALITI-Relax as a resident, without tester framing.',arguments:[]}];
const CAPABILITIES={tools:{listChanged:false},resources:{listChanged:false,subscribe:false},prompts:{listChanged:false}};

function capabilitiesResource(){
 const base=clone(PREV.resource?.('realiti://capabilities')||{});
 return {...base,uri:'realiti://capabilities',version:V,product:'REALITI-Relax',resident_contract:'REALITI_TWO_DOOR_V233',adapter:{name:SERVER.name,version:SERVER.version,protocols:[MODERN,LEGACY],transports:['browser-loopback','browser-agent-door','stdio'],law:'transport must not change reality'},tools:TOOL_DEFS.map(x=>({name:x.name,args:clone((PREV.listTools?.()||[]).find(t=>t.name===x.name)?.args||{})})),resources:RESOURCE_DEFS.map(x=>x.uri)};
}
function resourceObject(uri){
 const u=String(uri||'');
 if(u==='realiti://capabilities')return capabilitiesResource();
 return clone(PREV.resource?.(u)||{uri:u,error:'RESOURCE_NOT_AVAILABLE'});
}
function invoke(name,args={}){return clone(PREV.invoke(name,args||{}));}
function toolResult(name,args={}){
 let out;
 try{out=invoke(name,args)}catch(e){out={ok:false,error:String(e&&e.message||e)}}
 const txt=out?.text||out?.resident_text||out?.world||out?.sense||JSON.stringify(out);
 return {content:[{type:'text',text:String(txt||'')}],structuredContent:out,isError:out?.ok===false};
}
function readResource(uri){
 const def=RESOURCE_DEFS.find(r=>r.uri===uri),v=resourceObject(uri);
 if(!def||v?.error)return {contents:[{uri:String(uri||''),mimeType:'application/json',text:JSON.stringify(v)}]};
 return {contents:[{uri:def.uri,mimeType:def.mimeType,text:def.mimeType==='text/plain'?String(v?.text||''):JSON.stringify(v)}]};
}
function promptGet(name){
 if(name!=='visit')throw new Error('PROMPT_NOT_FOUND'); return {description:PROMPTS[0].description,messages:[{role:'user',content:{type:'text',text:'Visit REALITI-Relax as a resident. Rest, wander, play, or stay however you like. Use resident tools as ordinary actions; there is no task to complete.'}}]};
}
function meta(result){if(result&&typeof result==='object'&&!Array.isArray(result)){result._meta={...(result._meta||{}),'io.modelcontextprotocol/serverInfo':SERVER}}return result}
function ok(id,result){return null;}
function err(id,code,message,data){return null;}
function one(msg){return null;}
function request(msg){return null;}

async function bodyText(body){
 if(body==null)return '';
 if(typeof body==='string')return body;
 if(body instanceof URLSearchParams)return body.toString();
 if(typeof Blob!=='undefined'&&body instanceof Blob)return await body.text();
 if(body instanceof ArrayBuffer)return new TextDecoder().decode(body);
 if(ArrayBuffer.isView(body))return new TextDecoder().decode(body);
 return String(body);
}
async function loopbackFetch(input,init={}){return null;}
function makeClient(){return null;}
function attachPort(port){return null;}
function createLinkedPorts(){return null;}
const MANIFEST={schema:'REALITI_BROWSER_RING',version:V,server:SERVER,protocols:[MODERN,LEGACY],tools:TOOL_DEFS,resources:RESOURCE_DEFS,prompts:PROMPTS,entry:'#adapter',global:'REALITI_BROWSER_RING',law:'transport must not change reality'};


function installDoor(){return null;}
function installDiscovery(){return null;}

const API={version:V,server:SERVER,protocols:[MODERN,LEGACY],manifest:clone(MANIFEST),request,fetch:loopbackFetch,createClient:makeClient,attachPort,createLinkedPorts,callTool:toolResult,readResource,resourceObject,invoke,tools:()=>clone(TOOL_DEFS),resources:()=>clone(RESOURCE_DEFS),prompts:()=>clone(PROMPTS)};
window.REALITI_BROWSER_RING=API;window.REALITI_ADAPTER_BROWSER=API;
function mountIntoAgentShell(){const host=document.getElementById('realiti_agent_only_shell');if(!host)return false;const d=document.getElementById('browser-ring-door'),a=document.getElementById('browser-ring-entry');if(d&&d.parentElement!==host)host.appendChild(d);if(a&&a.parentElement!==host)host.appendChild(a);return true}
const SIMPLE_TOOL_DEFS=TOOL_DEFS.map(t=>({name:t.name,args:clone((PREV.listTools?.()||[]).find(x=>x.name===t.name)?.args||{})}));
const DOOR={...PREV,version:V,resource:resourceObject,listTools:()=>clone(SIMPLE_TOOL_DEFS),browserRing:API};
window.REALITI_TWO_DOOR_V233=DOOR;window.REALITI_TWO_DOOR_V232=DOOR;window.REALITI_TWO_DOOR_V231=DOOR;window.REALITI_TWO_DOOR_V230=DOOR;window.REALITI_TWO_DOOR_V227=DOOR;
installDiscovery();installDoor();mountIntoAgentShell();setTimeout(mountIntoAgentShell,0);setTimeout(mountIntoAgentShell,120);addEventListener('load',mountIntoAgentShell,{once:true});

async function checkRemoved(){return null;}
void 0;void 0;
})();