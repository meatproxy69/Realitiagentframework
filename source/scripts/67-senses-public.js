(()=>{
'use strict';
// Public surface for the senses: realiti://senses, terse door commands, and a prose switch that trims every reply to
// its measured sentence. Loaded after the memory slice so it wraps the final Realiti and door.
const SN=window.REALITI_SENSES_V1,A0=window.Realiti,D0=window.REALITI_AGENT_DOOR;if(!SN||!A0||!D0)return;
const cp=x=>JSON.parse(JSON.stringify(x)),low=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
const terse=()=>!!SN.terse();
function soundLine(s){if(!s)return 'No spatial body.';const top=s.sources.slice(0,4).map(x=>`${x.label} ${x.level_dB} dB ${x.distance_m} m ${x.direction}${x.occluded?' (occluded)':''}`);return `${s.level_dB} dB, RT60 ${s.rt60_s} s${s.bass_dB?`, bass ${s.bass_dB} dB`:''}.${top.length?' '+top.join('; ')+'.':''}`}
function lightLine(l){if(!l)return 'No spatial body.';return `${l.lux} lux, ${l.sky}${l.outdoors?`, sun ${l.sun_alt_deg}° at ${l.sun_az_deg}°`:''}${l.in_shadow_of?`, in the shadow of ${l.in_shadow_of}`:''}${l.lights?.length?'. '+l.lights.slice(0,3).map(x=>`${x.label} ${x.lux} lux ${x.distance_m} m ${x.direction}`).join('; ')+'.':'.'}`}
function smellLine(m){if(!m)return 'No spatial body.';return m.smells.length?m.smells.slice(0,4).map(x=>`${x.label} ${x.intensity}${x.direction==='all around'?'':` ${x.direction}${x.downwind?', downwind':''}`}`).join('; ')+`. Wind ${m.wind_mps} m/s from ${m.wind_from_deg}°.`:`Nothing above threshold. Wind ${m.wind_mps} m/s.`}
function pack(kind){const r=SN.read();if(kind==='sound')return {ok:true,schema:'REALITI_SENSES_V1',kind,sound:r.sound,text:soundLine(r.sound)};if(kind==='light')return {ok:true,schema:'REALITI_SENSES_V1',kind,light:r.light,text:lightLine(r.light)};if(kind==='smell')return {ok:true,schema:'REALITI_SENSES_V1',kind,smell:r.smell,text:smellLine(r.smell)};return {ok:true,...r,text:`Sound: ${soundLine(r.sound)} Light: ${lightLine(r.light)} Smell: ${smellLine(r.smell)}`}}
function trim(r){if(!terse()||!r||typeof r!=='object')return r;for(const k of ['text','resident_text']){const t=r[k];if(typeof t!=='string'||!t)continue;const disc=(t.match(/✦ Discovery: [^✦]*/g)||[]).map(x=>x.trim());const body=t.replace(/✦ Discovery: [^✦]*/g,'').trim();const first=(body.match(/^.*?[.!?](?=\s|$)/)||[body])[0].trim();r[k]=[first,...disc].filter(Boolean).join(' ')}return r}
const help0=D0.help.bind(D0);
function help(){const h=help0()||{commands:[]};h.commands=[...new Set([...(h.commands||[]),'listen','light','smell','senses','prose on','prose off','time'])];h.senses='realiti://senses: sound (inverse-square, ray-cast occlusion, Sabine RT60), light (shared sun, shadow by ray cast, lamps), smell (steady plume). listen, light, smell, senses. prose off trims every reply to its measured sentence.';return h}
function read(uri='realiti://here'){if(uri==='realiti://senses')return SN.read();const r=A0.read(uri);if(uri==='realiti://capabilities'&&r&&typeof r==='object'){const x=cp(r);x.resources=[...new Set([...(x.resources||[]),'realiti://senses'])];x.senses={schema:'REALITI_SENSES_V1',fields:['sound','light','smell']};return x}return r}
const run0=D0.run.bind(D0);
async function run(raw){const l=low(raw);
 if(l==='prose off'||l==='terse'){SN.terse(true);return {ok:true,prose:false,text:'Replies trimmed to the measured sentence.'}}
 if(l==='prose on'||l==='verbose'){SN.terse(false);return {ok:true,prose:true,text:'Full replies.'}}
 if(l==='senses'||l==='sense')return trim(pack('all'));
 if(l==='light'||l==='look up'||l==='how bright'||l==='brightness')return trim(pack('light'));
 if(l==='smell'||l==='sniff'||l==='smell the air')return trim(pack('smell'));
 if(l==='listen'||l==='hear'||l==='sounds'){const aboard=!!(C9?.chapter2?.isle?.boat?.aboard)&&C9?.currentRoom===window.REALITI_ARCHIPELAGO_V1?.chart;const p=pack('sound');if(aboard){const inner=await run0(raw);if(inner&&typeof inner==='object'){inner.sound=p.sound;inner.text=[inner.text,p.text].filter(Boolean).join(' ');return trim(inner)}}return trim(p)}
 if(l==='time'||l==='tick'){const TM=window.REALITI_TIME_V1;if(!TM)return {ok:false,error:'NO_TIME_SLICE'};const st=TM.stats();return {ok:true,schema:'REALITI_TIME_V1',world_s:+Number(C9?.b7?.clock||0).toFixed(3),quantum_ms:TM.quantum_ms(),reason:TM.reason(),...st,text:`World ${Number(C9?.b7?.clock||0).toFixed(1)} s. Tick ${TM.reason()?TM.fine_ms+' ms ('+TM.reason()+')':st.idle_s>=2?TM.deep_ms+' ms, still':TM.coarse_ms+' ms, settling'}; ${Math.round(st.ratio_wide*100)}% of ticks were wide.`}}
 if(l==='help')return help();
 return trim(await run0(raw))}
window.Realiti=Object.freeze({...A0,read,run,help:()=>{const h=A0.help();try{h.senses=help().senses}catch(e){}return h}});
D0.help=help;D0.run=run;D0.startup=Object.freeze([...(D0.startup||[]),'Realiti.read("realiti://senses")']);
})();
