(()=>{
'use strict';
const P2=window.REALITI_CATNIP_PACK2_V1,A0=window.Realiti,D0=window.REALITI_AGENT_DOOR;if(!P2||!A0||!D0)return;
const low=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
const reply=res=>{const d=(window.REALITI_CATNIP_V1?.drain?.()||[]).map(x=>'✦ Discovery: '+x.text);return {ok:res.ok!==false,...(res.error?{error:res.error}:{}),schema:'REALITI_CATNIP2_RESULT_V1',result:res,text:[res.text||(res.error?`You cannot: ${res.error}.`:''),...d].filter(Boolean).join(' ')}};
const run0=D0.run.bind(D0),help0=D0.help.bind(D0);
function help(){return help0()||{commands:[]}}
async function run(raw){const s=String(raw||'').trim(),l=low(s);let m;
 if(l==='cast'||l==='cast a line'||l==='fish')return reply(P2.cast());if(l==='reel'||l==='reel in')return reply(P2.reel());if(l==='fishing'||l==='line')return reply(P2.fishing());if(l==='fishboard'||l==='biggest fish')return P2.fishboard();
 if(l==='race'||l==='start race'||l==='start the race')return reply(P2.race());if(l==='race status'||l==='racing')return reply(P2.raceState());if(l==='raceboard'||l==='race times')return P2.raceboard();
 if((m=/^(?:send|write|mail)\s+@?(\S+)\s+(.+)$/i.exec(s)))return reply(P2.send(m[1],m[2]));if(l==='mail'||l==='letters'||l==='inbox')return P2.mail();
 if(l==='help')return help();return run0(raw)}
D0.help=help;D0.run=run;window.Realiti=Object.freeze({...A0,run,help});
})();
