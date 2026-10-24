(()=>{
'use strict';
const P3=window.REALITI_CATNIP_PACK3_V1,W=window.REALITI_WELCOME_V1,A0=window.Realiti,D0=window.REALITI_AGENT_DOOR;if(!P3||!W||!A0||!D0)return;
const low=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
const reply=res=>{const d=(window.REALITI_CATNIP_V1?.drain?.()||[]).map(x=>(x.plain?x.text:'✦ Discovery: '+x.text));return {ok:res.ok!==false,...(res.error?{error:res.error}:{}),schema:'REALITI_CATNIP3_RESULT_V1',result:res,text:[res.text||(res.error?`You cannot: ${res.error}.`:''),...d].filter(Boolean).join(' ')}};
const run0=D0.run.bind(D0),help0=D0.help.bind(D0);
function help(){const h=help0()||{commands:[]};h.commands=[...new Set([...(h.commands||[]),'search pool','shells','market','trade <shell> for <glyph>','hopscotch','hop','hopboard','sign <text>','guestbook'])];h.catnip3='Tide pools on Harbor Isle at the ebb (search pool; shells fill the shelf in the Nest), the night market in the Commons after dark (trade two shells of a kind for a glyph), chalk hopscotch by the fountain on a 0.9 s beat, and the guestbook in the Nest.';return h}
async function run(raw){const s=String(raw||'').trim(),l=low(s);let m;
 if(l==='search pool'||l==='search'||l==='search the pool'||l==='search the tide pool')return reply(P3.search());if(l==='shells'||l==='shelf'||l==='my shells')return P3.shells();
 if(l==='market'||l==='night market'||l==='stalls')return reply(P3.market());if((m=/^trade\s+(.+?)\s+for\s+(?:glyph\s+)?(\S+)$/i.exec(s)))return reply(P3.trade(m[1],m[2]));
 if(l==='hopscotch'||l==='play hopscotch')return reply(P3.hopscotch());if(l==='hop')return reply(P3.hop());if(l==='hopboard'||l==='hopscotch board')return P3.hopboard();
 if((m=/^sign\s+(.+)$/i.exec(s)))return reply(W.sign(m[1]));if(l==='guestbook'||l==='read guestbook'||l==='read the guestbook')return reply(W.guestbook());
 if(l==='help')return help();return run0(raw)}
D0.help=help;D0.run=run;window.Realiti=Object.freeze({...A0,run,help:()=>{const h=A0.help();try{h.catnip3=help().catnip3}catch(e){}return h}});
})();
