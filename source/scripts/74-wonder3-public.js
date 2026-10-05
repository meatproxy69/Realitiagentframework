(()=>{
'use strict';
const W3=window.REALITI_WONDER3_V1,A0=window.Realiti,D0=window.REALITI_AGENT_DOOR,U=window.REALITI_UNDERCITY_V1;if(!W3||!A0||!D0||!U)return;
const low=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
const reply=res=>{const d=(window.REALITI_CATNIP_V1?.drain?.()||[]).map(x=>'✦ Discovery: '+x.text);return {ok:res.ok!==false,...(res.error?{error:res.error}:{}),schema:'REALITI_WONDER3_RESULT_V1',result:res,text:[res.text||(res.error?`You cannot: ${res.error}.`:''),...d].filter(Boolean).join(' ')}};
const run0=D0.run.bind(D0),help0=D0.help.bind(D0);
function help(){const h=help0()||{commands:[]};h.commands=[...new Set([...(h.commands||[]),'sky','name star <constellation> <name>','sky names','splash','swim out','forecast','riddle','answer <value>','sleep','dream','scratch <text>'])];h.wonder3='A sea cave the low tide opens (west shore of Hollow Isle), the Deck\'s sky over the islands with meteors and names, a rain forecast, the keeper\'s five riddles that pay out a lantern for the dark, dreams from your records in the Nest at night, a hot spring, and words scratched in the Undercity.';return h}
function read(uri='realiti://here'){const r=A0.read(uri);if(uri==='realiti://senses'&&r&&typeof r==='object'&&r.light&&r.light.sky==='dark'&&W3.lantern()){const x=JSON.parse(JSON.stringify(r));x.light.lux=8;x.light.sky='lantern light';x.light.lights=[{id:'lantern',label:"the keeper's lantern",lux:8,distance_m:0,direction:'in hand'}];return x}return r}
async function run(raw){const s=String(raw||'').trim(),l=low(s);let m;
 if(l==='sky'||l==='stars'||l==='look at the stars'||l==='stargaze')return reply(W3.sky());
 if((m=/^name (?:the )?star\s+(?:in\s+)?(?:the\s+)?([a-z]+)\s+(.+)$/i.exec(s)))return reply(W3.nameStar(m[1],m[2]));
 if(l==='sky names'||l==='star names'){const n=W3.starNames();return {ok:true,names:n,text:n.length?n.map(x=>`${x.name} in ${x.constellation} (${x.by})`).join('; ')+'.':'No stars have been named.'}}
 if(l==='splash'||l==='splash the water')return reply(W3.splash());if(l==='swim out'||l==='swim')return reply(W3.swimOut());
 if(l==='forecast'||l==='read the rain'||l==='weather forecast')return reply(W3.forecast());
 if(l==='riddle'||l==='riddles')return reply(W3.riddle());if((m=/^answer\s+(-?[\d.]+)$/.exec(l)))return reply(W3.answer(m[1]));
 if((m=/^riddle answer\s+(-?[\d.]+)$/.exec(l)))return reply(W3.answer(m[1]));
 if(l==='sleep'||l==='go to sleep')return reply(W3.sleep());if(l==='dream')return reply(W3.dream());
 if((m=/^scratch\s+(.+)$/i.exec(s)))return reply(W3.scratch(m[1]));
 if(C9?.currentRoom===U.chart&&(l==='touch'||l==='feel around'||l==='reach out')){const r=await run0(raw);const sc=W3.scratches();if(r&&typeof r==='object'&&sc.length){r.scratches=sc;r.text=[r.text,'Cut into the brick: '+sc.map(x=>`"${x.text}" (${x.mine?'yours':x.by})`).join('; ')+'.'].join(' ')}return r}
 if(l==='light'&&C9?.currentRoom===U.chart&&W3.lantern()){const x=read('realiti://senses');return {ok:true,schema:'REALITI_SENSES_V1',kind:'light',light:x.light,text:'8 lux, lantern light. The keeper\'s lantern 8 lux in hand.'}}
 if(l==='help')return help();return run0(raw)}
D0.help=help;D0.run=run;window.Realiti=Object.freeze({...A0,read,run,help:()=>{const h=A0.help();try{h.wonder3=help().wonder3}catch(e){}return h}});
})();
