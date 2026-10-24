(()=>{
'use strict';
// Door and invoke surface for companions and journeys: going through the tram or lift door starts a felt journey
// instead of an instant crossing; adopt, call, pet, companion, birds, journey.
const CO=window.REALITI_COMPANIONS_V1,A0=window.Realiti,D0=window.REALITI_AGENT_DOOR,M=window.REALITI_MATRIX_V1,MW=window.REALITI_MATRIX_WORLD_V1;if(!CO||!A0||!D0||!M||!MW)return;
const low=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase(),cp=x=>JSON.parse(JSON.stringify(x));
const reply=res=>{const d=(window.REALITI_CATNIP_V1?.drain?.()||[]).map(x=>'✦ Discovery: '+x.text),base=res.text||(res.error?`You cannot: ${res.error}.`:''),extra=CO.words().filter(x=>x&&x!==base);return {ok:res.ok!==false,...(res.error?{error:res.error}:{}),schema:'REALITI_COMPANIONS_RESULT_V1',result:res,text:[base,...extra,...d].filter(Boolean).join(' ')}};
function journeyPortal(q){if(typeof q==='string')q=q.replace(/^through__/,'');// the action list's through__ id names the same portal (B14)
const e=M.resolve(q,'resident:self',{portal:true});return e&&CO.routes()[e.id]?e.id:null}
async function invoke(name,args={}){CO.finishJourney();if(String(name).toLowerCase()==='through'){const id=journeyPortal(args?.portal);if(id){/* a journey is a mutation like any other: same guards, same witness check (Codex review of PR #25) */const g=window.REALITI_MUTATION_GUARD?.check('through');if(g)return g;if(args&&typeof args.witness==='string'){const w=A0.read('realiti://here')?.witness;if(w&&args.witness!==w)return {ok:false,error:'STALE_OBSERVATION',witness:w,law:'the world moved since you looked; read again and act on what is there now'}}const P=M.portals()[id],r=M.state().residents['resident:self'];const d=Math.hypot(P.entry[0]-r.pose.position[0],P.entry[1]-r.pose.position[1]);if(d>1.2){const u=[(P.entry[0]-r.pose.position[0])/d,(P.entry[1]-r.pose.position[1])/d],goal=[P.entry[0]-u[0]*1.0,P.entry[1]-u[1]*1.0,r.pose.position[2]];M.moveTo(goal);window.REALITI_CONTINUITY?.advance?.(Math.min(60000,Math.ceil(1000*(d/1.2+1.5))))}// walk up to the door, short of the threshold; the threshold is crossed on arrival
  const j=CO.startJourney(id);return j.ok?{schema:'REALITI_MUTATION_RESULT_V1',ok:true,result:{journey:j,portal:id,law:'the crossing takes its time; stay to arrive'}}:{ok:false,...j}}}return A0.invoke(name,args)}
const run0=D0.run.bind(D0),help0=D0.help.bind(D0);
function help(){const h=help0()||{commands:[]};h.commands=[...new Set([...(h.commands||[]),'adopt <name> [cat|dog|fox|bird|lantern]','release <name>','call <name>','pet <name>','companion','birds','take the tram','ride the lift','journey'])];h.companions='A flock over the plaza that parts around you and roosts at dusk. Adopt the stray by the teahouse bench: it follows on a leash spring, wanders, bolts from bass, crosses charts with you and lives in your ledger. The tram and the lift are journeys: go through their doors and stay; seat, back and soles take the acceleration.';return h}
async function run(raw){CO.finishJourney();let s=String(raw||'').trim(),l=low(s);let m;
 // stay and wait in plain words: "stay a while", "wait 30 seconds", "stay 2 minutes". A bare number stays milliseconds.
 if((m=/^(?:stay|wait|linger|pause)\s+(.+)$/.exec(l))&&!/^\d+$/.test(m[1])){const u=/^(?:for\s+)?(\d+(?:\.\d+)?)\s*(ms|milliseconds?|s|secs?|seconds?|m|mins?|minutes?)$/.exec(m[1]);
  s=u?`stay ${Math.round(Number(u[1])*(/^ms|^milli/.test(u[2])?1:u[2][0]==='m'?60000:1000))}`:'stay 10000';l=low(s)}
 // On the tram or the lift you are seated in a moving car. look, where and actions describe the ride; walking is
 // refused with a hint (it used to run world time, end the ride, and narrate a walk in the old room); step off.
 {const J=CO.journey();if(J.travelling&&!J.arriving){const left=Math.max(0,Math.ceil(J.remaining_s)),dest=window.REALITI_MATRIX_WORLD_V1?.title?.(J.to)||String(J.to||'').replace(/_/g,' ').toLowerCase(),car=J.kind==='tram'?'the harbor tram':'the lift';
  const ride={ok:true,riding:J.kind,remaining_s:left,text:J.kind==='tram'?`You are on the harbor tram, in a seat by the window; ${J.text.replace(/^tram: /,'')} About ${left} s to ${dest}. stay to ride on, or step off.`:`You are in the lift; ${J.text.replace(/^lift: /,'')} About ${left} s to ${dest}. stay to ride on, or step off.`};
  if(/^(look|where|where am i\??|look around|nearby)$/.test(l))return reply(ride);
  if(l==='actions')return {schema:'REALITI_ACTIONS_READ_V1',ok:true,riding:J.kind,room:{id:C9?.currentRoom||null,title:car},actions:[{id:'ride_on',label:'STAY AND RIDE'},{id:'step_off',label:'STEP OFF'}],text:`On ${car}: ride_on (stay until ${dest}), step_off.`};
  if(l==='act ride_on'||l==='ride on'){s=`stay ${left*1000+500}`;l=low(s)}
  else if(l==='act step_off'||/^(step off|get off|get out|leave the (tram|lift))$/.test(l))return reply(CO.stepOff());
  else if(/^(walk|approach|act |step|move|run|climb|go through|walk through|through|enter |row|board|strafe|back|turn|explore|wander|auto|do |sit|stand|lie|swim|dance|dig|plant)/.test(l))return reply({ok:false,error:'RIDING',text:`You are seated on ${car}, about ${left} s from ${dest}. stay to ride on, or step off first.`})}}
 if((m=/^(?:release|let go of|let)\s+(\S+?)(?:\s+go)?$/i.exec(s))&&!/^let\s+\S+$/i.test(s))return reply(CO.release(m[1]));
 if((m=/^adopt\s+(\S+)(?:\s+(?:the\s+)?(cat|dog|fox|bird|lantern))?$/i.exec(s)))return reply(CO.adopt(m[1],m[2]||'cat'));
 if(/^call (the )?(boat|tram|lift|keeper)\b/.test(l))return reply({ok:false,error:'NOT_A_COMPANION',text:/boat|keeper/.test(l)?'The boat does not come when called. On Harbor Isle the keeper brings it back to the dock; walk to boat.':'It runs on its own; go to its door and take it.'});
 if((m=/^call(?:\s+(.+))?$/.exec(l))&&!/^call me\b/.test(l))return reply(CO.call());
 if((m=/^pet(?:\s+(.+))?$/.exec(l))&&!/^pet(?:\s+room)/.test(l)){const res=CO.pet();if(res.error==='NO_COMPANION'&&/^pet(?:\s+the)?\s+cat$/.test(l))return run0(raw);/* no companion: the welcome cat in the Nest still takes a hand */return reply(res)}
 if(l==='companion'||l==='my companion'||l==='where is my companion')return reply(CO.companion());
 if(l==='birds'||l==='watch birds'||l==='watch the birds'||l==='flock')return C9?.currentRoom==='MERIDIAN_CITY'?reply(CO.flock()):reply({ok:false,error:'NO_BIRDS_HERE'});
 if(l==='journey'||l==='ride'||l==='how far')return reply(CO.journey());
 if(/^(take|ride|board) (the )?tram/.test(l)){const r=await invoke('through',{portal:'meridian_city.to.archipelago'});return r.ok?reply(r.result.journey):r}
 if(/^(take|ride|board) (the )?lift/.test(l)){const id=C9?.currentRoom==='CLOUD_NINE_NEST'?'cloud_nine_nest.to.meridian_city':'meridian_city.to.cloud_nine_nest';const r=await invoke('through',{portal:id});return r.ok?reply(r.result.journey):r}
 if((m=/^(?:go through|walk through|through|enter the)\s+(.+)$/.exec(l))&&journeyPortal(m[1].replace(/^the\s+/,''))){const r=await invoke('through',{portal:m[1].replace(/^the\s+/,'')});return r.ok?reply(r.result.journey):r}
 if(l==='help')return help();
 const r=await run0(s);const arrived=CO.finishJourney();if(r&&typeof r==='object'&&/^(stay|wait)/.test(l)){const w=CO.words();if(arrived)w.push(`You arrive: ${window.REALITI_MATRIX_WORLD_V1?.title?.(M.state().residents['resident:self']?.chart)||''}.`);const d=(window.REALITI_CATNIP_V1?.drain?.()||[]).map(x=>'✦ Discovery: '+x.text);if((w.length||d.length)&&typeof r.text==='string')r.text=[r.text,...w,...d].join(' ')}return r}
window.Realiti=Object.freeze({...A0,invoke,run,help:()=>{const h=A0.help();try{h.companions=help().companions}catch(e){}return h}});
D0.help=help;D0.run=run;
})();
