(()=>{
'use strict';
// Chapter 5 groundwork, pass B: typed operation schemas. Every public operation is declared once with its argument
// schema and a classification: QUERY never changes the world, ACTION does. A transport (the stdio MCP host, a server)
// generates its tool list from this and can refuse a mutating call on a read-only path without trusting the caller.
const A0=window.Realiti,D0=window.REALITI_AGENT_DOOR;if(!A0||!D0)return;
const num=(d)=>({type:'number',description:d}),str=(d,e)=>({type:'string',description:d,...(e?{enum:e}:{})}),vec3=d=>({type:'array',items:{type:'number'},minItems:3,maxItems:3,description:d});
const OPS=[
 {name:'look',kind:'QUERY',description:'Read the room: objects, actions, doorways; carries a witness.',args:{}},
 {name:'feel',kind:'QUERY',description:'Read the body field; mode words|digest|numbers|field.',args:{mode:str('words, digest, numbers or field',['words','digest','numbers','field'])}},
 {name:'actions',kind:'QUERY',description:'Actions available where you stand.',args:{}},
 {name:'listen',kind:'QUERY',description:'Ambience and the sound field.',args:{}},
 {name:'receipt',kind:'QUERY',description:'A stored receipt by reference.',args:{ref:str('receipt reference')}},
 {name:'where_was_i',kind:'QUERY',description:'Where you were when you left.',args:{}},
 {name:'recall',kind:'QUERY',description:'Recall explicit memories.',args:{query:str('words to match'),limit:num('max results')}},
 {name:'stay',kind:'ACTION',description:'Let world time pass (ms, at most 60000).',args:{wall_ms:num('milliseconds of world time')},required:['wall_ms']},
 {name:'go',kind:'ACTION',description:'Enter a room by id or alias.',args:{place:str('room id or alias')},required:['place']},
 {name:'act',kind:'ACTION',description:'Perform a listed action by id.',args:{id:str('action id from actions')},required:['id']},
 {name:'move',kind:'ACTION',description:'Walk a local vector (x right, y forward) in meters; swept against geometry.',args:{local:vec3('[right, forward, up] meters')},required:['local']},
 {name:'turn',kind:'ACTION',description:'Turn by degrees, positive left.',args:{yaw_deg:num('degrees, positive left')},required:['yaw_deg']},
 {name:'face',kind:'ACTION',description:'Face a thing by name.',args:{target:str('entity name or id')},required:['target']},
 {name:'approach',kind:'ACTION',description:'Walk to a thing and stop at its surface.',args:{target:str('entity name or id')},required:['target']},
 {name:'through',kind:'ACTION',description:'Cross a doorway or ride a journey portal.',args:{portal:str('doorway name or id')},required:['portal']},
 {name:'posture',kind:'ACTION',description:'lie, sit or stand, optionally on a support.',args:{kind:str('lie, sit or stand',['lie','sit','stand']),target:str('support name')},required:['kind']},
 {name:'express',kind:'ACTION',description:'hum, stretch, yawn, sigh or say.',args:{kind:str('expression',['hum','stretch','yawn','sigh','say']),text:str('words, for say')},required:['kind']},
 {name:'note',kind:'ACTION',description:'Leave a note in the pocket.',args:{text:str('note text')},required:['text']},
 {name:'remember',kind:'ACTION',description:'Keep an explicit memory.',args:{text:str('memory text')},required:['text']},
 {name:'forget_memory',kind:'ACTION',description:'Forget one explicit memory by id.',args:{id:str('memory id')},required:['id']},
 {name:'stop',kind:'ACTION',description:'Everything touching you lets go.',args:{}},
 {name:'home',kind:'ACTION',description:'Return to the Nest.',args:{}},
 {name:'save',kind:'ACTION',description:'Persist now.',args:{}},
 {name:'goodbye',kind:'ACTION',description:'Leave with a departure snapshot.',args:{}}
];
const RESOURCES=['realiti://here','realiti://body','realiti://space','realiti://senses','realiti://ledger','realiti://memory','realiti://imprint','realiti://pocket','realiti://capabilities','realiti://about','realiti://harness','realiti://schemas'];
const schema=o=>({name:o.name,kind:o.kind,description:o.description,input_schema:{type:'object',properties:{...o.args,witness:str('optional witness from a read of realiti://here; the action is refused if the world moved')},required:o.required||[],additionalProperties:true}});
const schemas=()=>({schema:'REALITI_SCHEMAS_V1',operations:OPS.map(schema),resources:RESOURCES.slice(),door:{description:'Free text through the Agent Door; see help for the command list.',input_schema:{type:'object',properties:{command:str('a door command')},required:['command']}},law:'QUERY operations never change the world; a transport may serve them on a read-only path and refuse ACTION there'});
const kindOf=name=>OPS.find(o=>o.name===String(name||'').toLowerCase())?.kind||null;
function read(uri='realiti://here'){if(uri==='realiti://schemas')return schemas();const r=A0.read(uri);if(uri==='realiti://capabilities'&&r&&typeof r==='object'){const x=JSON.parse(JSON.stringify(r));x.resources=[...new Set([...(x.resources||[]),'realiti://schemas'])];x.tool_schemas=schemas().operations;x.read_only_operations=OPS.filter(o=>o.kind==='QUERY').map(o=>o.name);return x}return r}
const run0=D0.run.bind(D0),help0=D0.help.bind(D0);
function help(){const h=help0()||{commands:[]};h.commands=[...new Set([...(h.commands||[]),'schemas'])];h.schemas='realiti://schemas lists every operation with its argument schema and QUERY/ACTION kind; a transport builds its tools from it.';return h}
async function run(raw){const l=String(raw||'').trim().toLowerCase();if(l==='schemas'||l==='tools')return schemas();if(l==='help')return help();return run0(raw)}
window.Realiti=Object.freeze({...A0,read,run,schemas,operationKind:kindOf,help:()=>{const h=A0.help();try{h.schemas=help().schemas}catch(e){}return h}});
D0.help=help;D0.run=run;
window.REALITI_SCHEMAS_V1=Object.freeze({version:'1.0',schemas,operationKind:kindOf,operations:()=>OPS.map(schema)});
})();
