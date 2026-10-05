(()=>{
'use strict';
// In a dark chart the door tells you what the dark allows: no room description, no coordinates, nothing listed beyond
// reach. `where` is dead reckoning from the grate; `look` is the hearing and smell lines; `clap`, `touch`, `pull`,
// `read wall`, `map` work the place.
const U=window.REALITI_UNDERCITY_V1,A0=window.Realiti,D0=window.REALITI_AGENT_DOOR,M=window.REALITI_MATRIX_V1,SN=window.REALITI_SENSES_V1;if(!U||!A0||!D0||!M||!SN)return;
const low=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase(),inDark=()=>C9?.currentRoom===U.chart;
const run0=D0.run.bind(D0),help0=D0.help.bind(D0);
function reply(res){const d=(window.REALITI_CATNIP_V1?.drain?.()||[]).map(x=>'✦ Discovery: '+x.text);return {ok:res.ok!==false,...(res.error?{error:res.error}:{}),schema:'REALITI_UNDERCITY_RESULT_V1',result:res,text:[res.text||(res.error?`You cannot: ${res.error}.`:''),...d].filter(Boolean).join(' ')}}
function reckon(){const r=M.state().residents['resident:self'],c=M.charts()[U.chart].spawn.position,dx=r.pose.position[0]-c[0],dy=r.pose.position[1]-c[1],f=M.facing(r);const yaw=Math.round(((Math.atan2(f[0],f[1])*180/Math.PI)%360+360)%360);return {from_grate_m:[+dx.toFixed(1),+dy.toFixed(1)],distance_m:+Math.hypot(dx,dy).toFixed(1),heading_deg:yaw}}
function help(){const h=help0()||{commands:[]};h.commands=[...new Set([...(h.commands||[]),'clap','touch','pull lever','read wall','map'])];h.undercity='go UNDERCITY (the grate at the south-west of the Commons): no light. clap for sixteen echo delays, touch for what is in reach, listen and smell for water and air, map for what you have learned. The grate refuses anyone taller than 2.1 m.';return h}
async function run(raw){const l=low(raw);
 if(inDark()){
  if(l==='clap'||l==='clap hands')return reply(U.clap());
  if(l==='touch'||l==='feel around'||l==='reach out')return reply(U.touch());
  if(/^pull( the)?( lever)?$/.test(l))return reply(U.pull());
  if(/^read( the)? wall$/.test(l)||l==='read by touch')return reply(U.readWall());
  if(l==='map'||l==='what do i know'){const m=U.map();return {ok:true,schema:'REALITI_UNDERCITY_MAP_V1',...m,text:m.rows.join('\n')+`\n${m.legend} · ${m.cells_known} of ${m.of} cells known, ${m.walls_found} wall points`}}
  if(l==='where'||l==='where am i'||l==='where am i?'){const k=reckon();return {ok:true,schema:'REALITI_SPACE_TEXT_V1',dark:true,reckoning:k,text:`Dark. By your own steps: ${k.distance_m} m from the grate (${k.from_grate_m.join(', ')}), heading ${k.heading_deg}°.`}}
  if(l==='look'){const s=SN.read();const snd=s.sound.sources.slice(0,3).map(x=>`${x.label} ${x.level_dB} dB ${x.direction}`).join('; '),sm=s.smell.smells.slice(0,3).map(x=>`${x.label} ${x.intensity} ${x.direction}`).join('; ');return {ok:true,schema:'REALITI_HERE_READ_V1',dark:true,lux:0,sound:s.sound,smell:s.smell,text:`Dark. ${snd?snd+'.':''} ${sm?sm+'.':''}`.replace(/\s+/g,' ').trim()}}
  if(/^(?:move|walk|step|turn|approach|face|look at|turn to|go to|go towards?|walk to)\b/.test(l)){const r=await run0(raw);if(r&&typeof r==='object'&&typeof r.text==='string'){const first=(r.text.match(/^.*?[.!?](?=\s|$)/)||[r.text])[0];const k=reckon();r.dark=true;r.reckoning=k;r.text=`${first} Dark. By your own steps: ${k.distance_m} m from the grate (${k.from_grate_m.join(', ')}), heading ${k.heading_deg}°.`}return r}
  if(/^(nearby|what is near|what is nearby)/.test(l)){const r=await run0(raw);if(r&&typeof r==='object'){r.dark=true;r.text=(r.nearby?.length?'In reach: '+r.nearby.map(n=>`${n.label} ${n.distance_m} m ${n.direction}`).join('; ')+'.':'Nothing in reach. Clap.')}return r}}
 if(/^(?:go|enter)\s+(undercity|under|tunnels|below|dark|the undercity)$/.test(l)){const r=await run0(raw);const rec=C9?.b4?.lastReceipt;if(C9?.currentRoom!==U.chart&&rec?.type==='UNDER_GRATE'){return {ok:false,error:'TOO_TALL_FOR_THE_GRATE',schema:'REALITI_UNDERCITY_RESULT_V1',text:rec.narrative}}return r}
 if(l==='help')return help();
 return run0(raw)}
D0.help=help;D0.run=run;
window.Realiti=Object.freeze({...A0,run,help:()=>{const h=A0.help();try{h.undercity=help().undercity}catch(e){}return h}});
})();
