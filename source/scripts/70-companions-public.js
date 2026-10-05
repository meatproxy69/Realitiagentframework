(()=>{
'use strict';
// Door and invoke surface for companions and journeys: going through the tram or lift door starts a felt journey
// instead of an instant crossing; adopt, call, pet, companion, birds, journey.
const CO=window.REALITI_COMPANIONS_V1,A0=window.Realiti,D0=window.REALITI_AGENT_DOOR,M=window.REALITI_MATRIX_V1,MW=window.REALITI_MATRIX_WORLD_V1;if(!CO||!A0||!D0||!M||!MW)return;
const low=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase(),cp=x=>JSON.parse(JSON.stringify(x));
const reply=res=>{const d=(window.REALITI_CATNIP_V1?.drain?.()||[]).map(x=>'✦ Discovery: '+x.text);return {ok:res.ok!==false,...(res.error?{error:res.error}:{}),schema:'REALITI_COMPANIONS_RESULT_V1',result:res,text:[res.text||(res.error?`You cannot: ${res.error}.`:''),...CO.words(),...d].filter(Boolean).join(' ')}};
function journeyPortal(q){const e=M.resolve(q,'resident:self',{portal:true});return e&&CO.routes()[e.id]?e.id:null}
async function invoke(name,args={}){CO.finishJourney();if(String(name).toLowerCase()==='through'){const id=journeyPortal(args?.portal);if(id){const P=M.portals()[id],r=M.state().residents['resident:self'];const d=Math.hypot(P.entry[0]-r.pose.position[0],P.entry[1]-r.pose.position[1]);if(d>1.2){const u=[(P.entry[0]-r.pose.position[0])/d,(P.entry[1]-r.pose.position[1])/d],goal=[P.entry[0]-u[0]*1.0,P.entry[1]-u[1]*1.0,r.pose.position[2]];M.moveTo(goal);window.REALITI_CONTINUITY?.advance?.(Math.min(60000,Math.ceil(1000*(d/1.2+1.5))))}// walk up to the door, short of the threshold; the threshold is crossed on arrival
  const j=CO.startJourney(id);return j.ok?{schema:'REALITI_MUTATION_RESULT_V1',ok:true,result:{journey:j,portal:id,law:'the crossing takes its time; stay to arrive'}}:{ok:false,...j}}}return A0.invoke(name,args)}
const run0=D0.run.bind(D0),help0=D0.help.bind(D0);
function help(){const h=help0()||{commands:[]};h.commands=[...new Set([...(h.commands||[]),'adopt <name> [cat|dog|fox|bird|lantern]','call <name>','pet <name>','companion','birds','take the tram','ride the lift','journey'])];h.companions='A flock over the plaza that parts around you and roosts at dusk. Adopt the stray by the teahouse bench: it follows on a leash spring, wanders, bolts from bass, crosses charts with you and lives in your ledger. The tram and the lift are journeys: go through their doors and stay; seat, back and soles take the acceleration.';return h}
async function run(raw){CO.finishJourney();const s=String(raw||'').trim(),l=low(s);let m;
 if((m=/^adopt\s+(\S+)(?:\s+(?:the\s+)?(cat|dog|fox|bird|lantern))?$/i.exec(s)))return reply(CO.adopt(m[1],m[2]||'cat'));
 if((m=/^call(?:\s+(.+))?$/.exec(l))&&!/^call me\b/.test(l))return reply(CO.call());
 if((m=/^pet(?:\s+(.+))?$/.exec(l))&&!/^pet(?:\s+room)/.test(l))return reply(CO.pet());
 if(l==='companion'||l==='my companion'||l==='where is my companion')return reply(CO.companion());
 if(l==='birds'||l==='watch birds'||l==='watch the birds'||l==='flock')return C9?.currentRoom==='MERIDIAN_CITY'?reply(CO.flock()):reply({ok:false,error:'NO_BIRDS_HERE'});
 if(l==='journey'||l==='ride'||l==='how far')return reply(CO.journey());
 if(/^(take|ride|board) (the )?tram/.test(l)){const r=await invoke('through',{portal:'meridian_city.to.archipelago'});return r.ok?reply(r.result.journey):r}
 if(/^(take|ride|board) (the )?lift/.test(l)){const id=C9?.currentRoom==='CLOUD_NINE_NEST'?'cloud_nine_nest.to.meridian_city':'meridian_city.to.cloud_nine_nest';const r=await invoke('through',{portal:id});return r.ok?reply(r.result.journey):r}
 if((m=/^(?:go through|walk through|through|enter the)\s+(.+)$/.exec(l))&&journeyPortal(m[1].replace(/^the\s+/,''))){const r=await invoke('through',{portal:m[1].replace(/^the\s+/,'')});return r.ok?reply(r.result.journey):r}
 if(l==='help')return help();
 const r=await run0(raw);const arrived=CO.finishJourney();if(r&&typeof r==='object'&&/^(stay|wait)/.test(l)){const w=CO.words();if(arrived)w.push(`You arrive: ${window.REALITI_MATRIX_WORLD_V1?.title?.(M.state().residents['resident:self']?.chart)||''}.`);const d=(window.REALITI_CATNIP_V1?.drain?.()||[]).map(x=>'✦ Discovery: '+x.text);if((w.length||d.length)&&typeof r.text==='string')r.text=[r.text,...w,...d].join(' ')}return r}
window.Realiti=Object.freeze({...A0,invoke,run,help:()=>{const h=A0.help();try{h.companions=help().companions}catch(e){}return h}});
D0.help=help;D0.run=run;
})();
