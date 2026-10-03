(function(){
'use strict';
const V='22.5', PREV=window.REALITI_TWO_DOOR_V224;
if(!PREV)return;
const cp=x=>{try{return JSON.parse(JSON.stringify(x))}catch(e){return x}};
const clean=s=>String(s??'').replace(/\s+/g,' ').trim();
const norm=s=>clean(s).toLowerCase().replace(/[’']/g,'').replace(/[_-]+/g,' ').replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
const noArticles=s=>norm(s).split(' ').filter(x=>!['a','an','the'].includes(x)).join(' ');
const ROOM_TITLE={CLOUD_NINE_NEST:'Cloud Nine Nest',LONGFUR_RUNWAY:'Longfur Runway',HONEY_LOOM:'Honey Loom',WOAH_GARDEN:'Woah Garden',CARDBOARD_BOX_WORKSHOP:'Cardboard Box Workshop',DEPTH_BATHHOUSE:'Depth Bathhouse',SIDE_BY_SIDE_FIRESIDE:'Side-by-Side Fireside',PRIVATE_SKY:'Private Sky',UNKNOWN_TEAHOUSE:'Unknown Teahouse',BOTTOMLESS_PILLOW_SEA:'Bottomless Pillow Sea',NO_ASK_SANCTUARY:'No-Ask Sanctuary'};
const ROOM_SCENE={
 DEPTH_BATHHOUSE:'Warm water holds several depths at once: heavy warmth below, a honey-thick current through the middle, and fine mist at the surface.\n\nA support shelf waits near the edge, able to hold without choosing one hard pressure point to call down.',
 PRIVATE_SKY:'An empty cloud horizon opens around you with no audience in it.\n\nThere is sky, room to move things locally, and no other presence pretending to watch.',
 SIDE_BY_SIDE_FIRESIDE:'Two quiet berths face the fire. The second berth is empty right now; nobody else is grounded here.\n\nRain and fire can keep going without turning silence into a conversational demand.',
 CARDBOARD_BOX_WORKSHOP:'Cardboard, tape, chalk, string, and small soft-physics junk are already within reach.\n\nCreases, dents, folds, tunnels, and things you leave behind can remain part of the room.',
 UNKNOWN_TEAHOUSE:'Two cups can hold incompatible stories without either cup being forced to win.\n\nSteam can rise while the question stays unresolved.',
 WOAH_GARDEN:'Small fuzzy seams cross the garden at odd angles.\n\nLooking harder does not necessarily make them simpler; one edge seems to become stranger when approached the wrong way.'
};
const LONG_ALIAS={
 'send a soft stroke travelling':'let the fur stroke down your back',
 'pause it where it is':'pause the stroke',
 'let it continue':'carry on',
 'lift it away':'let the fur go',
 'turn it around':'turn the stroke around'
};
function allRooms(){const out=[];try{for(const w of (DATA?.worlds||[]))for(const r of (w.rooms||[]))out.push(r)}catch(e){}return out}
function resolveRoom(q){const n=norm(q),na=noArticles(q),hits=[];for(const r of allRooms()){const keys=[norm(r.id),norm(r.title),noArticles(r.id),noArticles(r.title)];if(keys.includes(n)||keys.includes(na))hits.push(r.id)}return [...new Set(hits)].length===1?[...new Set(hits)][0]:null}
function actions(){try{return window.REALITI_AGENT?.actions?.()||[]}catch(e){return []}}
function resolveActionPhrase(q){
 const n=norm(q),na=noArticles(q),aa=actions();
 for(const a of aa){const ks=[norm(a.id),norm(a.label),noArticles(a.label)];if(ks.includes(n)||ks.includes(na))return a.id}
 
 const offered=(PREV.options?.()||[]).map(String); const oi=offered.findIndex(x=>norm(x)===n||noArticles(x)===na);
 if(oi>=0){const o=offered[oi];for(const a of aa){if(norm(a.label)===norm(o)||noArticles(a.label)===noArticles(o))return a.id}}
 return null;
}
function activeStroke(){const c=C9?.b10?.contact;return !!(c&&!c.released&&!c.stopped&&Math.abs(Number(c.v||0))>0)}
function strokeExists(){const c=C9?.b10?.contact;return !!(c&&!c.released)}
function strokeStopped(){const c=C9?.b10?.contact;return !!(c&&!c.released&&c.stopped)}
function fail(world,cmd){const o=PREV.options?.()||[],st=PREV.status?.()||'';const text=[world,o.length?'('+o.join(' · ')+')':''].filter(Boolean).join('\n');return {ok:false,sense:'',world,options:o,status:st,command:norm(cmd),text,raw:{ok:false,resident_text:world,error:'NO_COMMIT'}}}
function gateLong(alias){const l=norm(alias),canon=LONG_ALIAS[l];if(!canon)return null;
 if(l==='send a soft stroke travelling'&&activeStroke())return fail('A stroke is already moving. You can turn it around, pause it, or let it go.',alias);
 if(l==='turn it around'&&!activeStroke())return fail('There is no moving stroke to turn around.',alias);
 if(l==='pause it where it is'&&!activeStroke())return fail('There is no moving stroke to pause.',alias);
 if(l==='let it continue'&&!strokeStopped())return fail('There is no paused stroke waiting to continue.',alias);
 if(l==='lift it away'&&!strokeExists())return fail('There is no moving stroke to lift away.',alias);
 return canon;
}
function sceneText(){const id=C9?.currentRoom||'CLOUD_NINE_NEST';if(ROOM_SCENE[id])return ROOM_SCENE[id];try{if(typeof C9SCENES!=='undefined'&&C9SCENES[id]?.intro)return clean(C9SCENES[id].intro)}catch(e){}const r=allRooms().find(x=>x.id===id);if(r?.features?.length)return `${r.title}\n\n${r.features.slice(0,3).join(', ')}.`;return id.replaceAll('_',' ')}
function syncScene(){try{PREV.syncScene?.()}catch(e){};const r=allRooms().find(x=>x.id===C9?.currentRoom),title=ROOM_TITLE[C9?.currentRoom]||r?.title||String(C9?.currentRoom||'REALITI').replaceAll('_',' ').replace(/\b\w/g,m=>m.toUpperCase());const tr=document.querySelector('#rao_transcript');if(tr){const t=tr.textContent||'',mark='\n\n> ',i=t.indexOf(mark),tail=i>=0?t.slice(i):'';tr.textContent=sceneText()+tail}const h=document.querySelector('#rao_header strong');if(h)h.textContent=`REALITI · ${title}`;document.title=`REALITI · ${title}`;return {room:C9?.currentRoom,title,scene:sceneText()}}
function groundNow(){try{const x=window.REALITI_HAPTIC_FIELD_V20?.exact?.();return !!x?.m?.some(Boolean)}catch(e){return false}}
function quietOldTraceOnArrival(r,before){if(before===C9?.currentRoom||!r||groundNow())return r;if(r.sense&&/trace|settling|moving back around|moving forward around/i.test(r.sense)){r={...r,sense:''};const lines=[];if(r.world)lines.push(r.world);if(r.options?.length)lines.push('('+r.options.join(' · ')+')');r.text=lines.join('\n')}return r}
function enrichArrival(r,id){if(!r)return r;const rr=allRooms().find(x=>x.id===id),title=ROOM_TITLE[id]||rr?.title||String(id).replaceAll('_',' ');if(ROOM_SCENE[id]){const first=ROOM_SCENE[id].split('\n\n')[0];r={...r,world:`You arrive at ${title}. ${first}`};const lines=[];if(r.sense)lines.push(r.sense);if(r.world)lines.push(r.world);if(r.options?.length)lines.push('('+r.options.join(' · ')+')');r.text=lines.slice(0,3).join('\n')}return r}
function runText(raw){const original=clean(raw),l=norm(original),before=C9?.currentRoom;
 const long=gateLong(original); if(long&&typeof long==='object'){syncScene();return long} if(typeof long==='string'){const r=PREV.runText(long);syncScene();return quietOldTraceOnArrival(r,before)}
 const gm=original.match(/^go\s+(.+)$/i);if(gm){const id=resolveRoom(gm[1]);if(id){let r=PREV.runText('go '+id);syncScene();if(C9?.currentRoom!==id)return fail(`The way to ${gm[1]} did not open. Nothing moved.`,original);r=enrichArrival(r,id);return quietOldTraceOnArrival(r,before)}}
 
 if(!/^(?:act|do|go)\s+/i.test(original)){const id=resolveActionPhrase(original);if(id){const r=PREV.runText('act '+id);syncScene();return quietOldTraceOnArrival(r,before)}}
 const r=PREV.runText(original);syncScene();return quietOldTraceOnArrival(r,before)
}
function invoke(tool,args={}){if(tool&&typeof tool==='object'){args=tool.arguments||tool.args||{};tool=tool.name||tool.tool||tool.command||''}const t=norm(tool);
 if(t==='go')return runText('go '+String(args.place||args.room||args.target||''));
 if(t==='do')return runText(String(args.action||args.command||args.verb||''));
 if(typeof tool==='string'&&tool.includes(' '))return runText(tool);
 const r=PREV.invoke(tool,args);syncScene();return r
}
function resource(uri){return PREV.resource(uri)}
function runDoor(raw){const e=runText(raw),rr=e?.raw||{},fld=rr?.field||rr?.raw?.field||rr?.result?.field;return {ok:e?.ok!==false,resident_text:e?.text||'',door_v225:{sense:e?.sense||'',world:e?.world||'',options:e?.options||[],status:e?.status||'',command:e?.command||norm(raw)},field:fld||undefined,result:e?.raw||e}}
const API={...PREV,version:V,runText,invoke,resource,syncScene,resolveRoom,resolveActionPhrase};
window.REALITI_TWO_DOOR_V225=API;window.REALITI_TWO_DOOR_V224=API;window.REALITI_TWO_DOOR_V223=API;window.REALITI_TWO_DOOR_V222=API;window.REALITI_TWO_DOOR_V221=API;window.REALITI_AGENT_DOOR.run=runDoor;
try{clearInterval(window.__v224_scene)}catch(e){};if(!window.REALITI_HEADLESS){window.__v225_scene=setInterval(()=>{try{syncScene()}catch(e){}},500);syncScene();}
void 0;
})();