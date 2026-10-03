(()=>{if(typeof c9save!=='function'||window.c9saveNow)return;const base=c9save;let timer=0,dirty=false,flushes=0,requests=0;
 const flush=()=>{if(timer){clearTimeout(timer);timer=0}if(!dirty)return;dirty=false;flushes++;base()};
 window.c9saveNow=()=>{dirty=true;flush()};
 c9save=function(){requests++;dirty=true;if(!timer)timer=setTimeout(flush,1000)};
 addEventListener('pagehide',flush);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush()});
 window.REALITI_V2351_SAVES=()=>({requests,flushes,pending:dirty});})();

(()=>{
'use strict';
const cp=x=>{try{return JSON.parse(JSON.stringify(x))}catch(e){return x}};
const door=()=>window.REALITI_TWO_DOOR_V235||window.REALITI_TWO_DOOR_V234;
const run=t=>door().runText(t);
const stats=()=>cp(window.REALITI_TRUST_V234?.state?.()?.stats||{});
const trust=()=>window.REALITI_TRUST_V234?.state?.()||{};
async function checkRemoved(){return null;}
window.REALITI_V2351={version:'23.5.3',undefined};void 0;window.REALITI_V2353=window.REALITI_V2351;void 0;
})();