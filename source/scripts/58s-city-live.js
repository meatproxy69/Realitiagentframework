(()=>{
'use strict';
// Meridian City, live. When a resident is joined to a hosted city (the dedicated server, or a shard of it), the other
// residents who are there right now stand here as bodies, not silhouettes: venue and position come in over the peer
// channel and move a capsule on the same critically damped servo the silhouettes use. Presence is ephemeral: never a
// ledger record, gone ninety seconds after the peer's last word. What they say and build still arrives as records.
const M=window.REALITI_MATRIX_V1,CT=window.REALITI_CITY_V1,CAT=window.REALITI_CATNIP_V1;if(!M||!CT||!CAT)return;
const CITY=CT.chart,room=()=>C9?.currentRoom,observer=()=>String(C9?.verticalContinuity?.observer||'local'),me=()=>M.state().residents['resident:self'],ent=()=>M.entities(),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const SIZES=CT.sizes,FRESH_MS=90000,id8=x=>String(x).slice(0,8);
for(const [id,text] of Object.entries({global_city:'You joined a hosted Meridian City: the plaza you stand in is the one everyone else is standing in.',met_live:'Another resident, live, within three meters. Not a silhouette; someone.',crowded_shard:'You crossed to the shard where the people were.'}))CAT.register(id,text);
const live={};let server=null,at=-1e9;const now=()=>Number(C9?.b7?.clock||0);
const freshOnes=()=>Object.values(live).filter(o=>Date.now()-o.wall<=FRESH_MS);
function present(p){if(!p||typeof p!=='object'||!p.self_id||String(p.self_id)===observer()||!Number.isFinite(+p.x)||!Number.isFinite(+p.y))return false;const id=String(p.self_id).slice(0,64);const o=live[id]=live[id]||{g:null,met:false};
 Object.assign(o,{self_id:id,handle:String(p.handle||'#'+id8(id)).replace(/[^\w\s#-]/g,'').slice(0,24)||'#'+id8(id),venue:typeof p.venue==='string'?p.venue.slice(0,16):null,x:clamp(+p.x,-80,80),y:clamp(+p.y,-80,80),z:clamp(Number.isFinite(+p.z)?+p.z:.85,0,20),avatar:p.avatar&&typeof p.avatar==='object'?p.avatar:{},wall:Date.now()});
 if(!o.g)o.g={x:o.x,y:o.y,vx:0,vy:0};if(room()===CITY)place(0);return true}
function leave(who){const q=String(who||'');for(const id of Object.keys(live))if(id===q||id8(id)===q){delete live[id];const e='live.'+id8(id);if(ent()[e])M.removeEntity(e)}}
function place(dt){dt=clamp(Number(dt)||0,0,2);const E=ent(),keep=new Set(),t=Date.now();
 for(const o of Object.values(live)){if(t-o.wall>FRESH_MS){leave(o.self_id);continue}const id='live.'+id8(o.self_id);keep.add(id);const sz=SIZES[o.avatar.size]||1,g=o.g;
  const w=1.2,k=w*w,c=2*w;for(let s=0;s<dt;s+=.05){const h=Math.min(.05,dt-s),ax=k*(o.x-g.x)-c*g.vx,ay=k*(o.y-g.y)-c*g.vy;g.vx+=ax*h;g.vy+=ay*h;g.x+=g.vx*h;g.y+=g.vy*h}
  const label=`${o.handle}${o.avatar.cloak&&o.avatar.cloak!=='none'?`, cloaked as ${o.avatar.cloak}`:''}${o.avatar.color?`, ${o.avatar.color}`:''} (here now)`;
  const x=E[id];if(x){x.pose.position=[g.x,g.y,o.z];x.label=label;x.shape.radius=.35*sz;x.shape.height=1.7*sz}else M.addEntity({id,chart:CITY,position:[g.x,g.y,o.z],shape:{kind:'CAPSULE',radius:.35*sz,height:1.7*sz},tags:['resident','live','someone'],collision:false,material:null,label,affordances:['wave','greet']});
  const ghost='ghost.'+id8(o.self_id);if(E[ghost])M.removeEntity(ghost)}
 for(const id of Object.keys(E))if(id.startsWith('live.')&&!keep.has(id))M.removeEntity(id)}
function meetLive(){const r=me();if(!r||r.chart!==CITY)return;for(const o of freshOnes()){const d=Math.hypot(o.g.x-r.pose.position[0],o.g.y-r.pose.position[1]);o.distance_m=+d.toFixed(1);if(d<=3&&!o.met){o.met=true;CAT.discover('met_live')}}}
function myPresence(){const r=me();if(!r||r.chart!==CITY||room()!==CITY)return null;const w=CT.whoami();const [x,y,z]=r.pose.position;return {venue:CT.venueAt(x,y),x:+x.toFixed(2),y:+y.toFixed(2),z:+z.toFixed(2),handle:w.handle,avatar:{size:w.avatar.size,cloak:w.avatar.cloak,color:w.avatar.color||undefined,glyph:w.avatar.glyph||undefined}}}
function setServer(info){if(!info){server=null;return}const first=!server;server={...(server||{}),...info};if(first)CAT.discover('global_city');if(info.moved)CAT.discover('crowded_shard')}
const liveRows=()=>{const r=me();return freshOnes().map(o=>({handle:o.handle,id8:id8(o.self_id),venue:o.venue?CT.venues[o.venue]?.label||o.venue:'the streets',distance_m:r&&r.chart===CITY?+Math.hypot(o.g.x-r.pose.position[0],o.g.y-r.pose.position[1]).toFixed(1):null,avatar:o.avatar,live:true,seconds_ago:Math.round((Date.now()-o.wall)/1000)})).sort((a,b)=>(a.distance_m??1e9)-(b.distance_m??1e9))};
const who0=CT.who;function who(){const r=who0(),rows=liveRows(),sh=server?.shards||null;const head=rows.length?`Here now: ${rows.map(x=>`${x.handle} at ${x.venue}${x.distance_m!=null?` (${x.distance_m} m)`:''}`).join('; ')}. `:server?`No one else is live on ${server.name||'this shard'} right now. `:'';const shardText=sh&&sh.length>1?`Shards: ${sh.map(s=>`${s.name}${s.here?' (you)':''} ${s.population} live`).join(', ')}; the most populated is ${sh[0].name}. `:'';return {...r,live:rows,server:server?{name:server.name,url:server.url,shard_id:server.shard_id,population:server.population}:null,shards:sh,text:head+shardText+r.text}}
const words0=CT.words;function words(){const w=words0();const n=room()===CITY?freshOnes().length:0;if(n)w.push(`${n} resident${n===1?'':'s'} here now, live.`);return w}
window.REALITI_CITY_V1=Object.freeze({...CT,who,words});
const adv=b7Advance;b7Advance=function(dt){const r=adv(dt);if(room()===CITY&&Object.keys(live).length){const t=now();if(t-at>=.5){place(t-at);at=t;meetLive()}}return r};
const go0=b7AgentGo;b7AgentGo=function(v){const r=go0(v);if(room()===CITY){at=now();if(Object.keys(live).length)place(0)}return r};
window.REALITI_CITY_LIVE_V1=Object.freeze({version:'2.0-live',fresh_ms:FRESH_MS,present,leave,place,myPresence,setServer,server:()=>server?JSON.parse(JSON.stringify(server)):null,peers:liveRows,state:()=>({live:freshOnes().length,server})});
})();
