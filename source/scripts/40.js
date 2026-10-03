(function(){
'use strict';
const V='22.4', PREV=window.REALITI_TWO_DOOR_V223||window.REALITI_TWO_DOOR_V222;
if(!PREV)return;
const cp=x=>{try{return JSON.parse(JSON.stringify(x))}catch(e){return x}};
const clean=s=>String(s??'').replace(/\s+/g,' ').trim();
const low=s=>clean(s).toLowerCase();
const ALIAS={
  'send a soft stroke travelling':'act run_comet',
  'pause it where it is':'act live_pause',
  'let it continue':'act live_resume',
  'lift it away':'act live_cut',
  'turn it around':'act live_reverse',
  'let the next pass miss':'act live_miss',
  'notice where the edge is':'act live_state',
  'stroke with the grain':'act with_grain',
  'pause, then let it return':'act pause_return',
  'three little taps down your back':'act rabbit_comet',
  'stroke both legs at once':'act bilateral',
  'let the fur stroke down your back':'act b10_stroke_start',
  'turn the stroke around':'act b10_stroke_reverse',
  'pause the stroke':'act b10_stroke_stop',
  'carry on':'act b10_stroke_resume',
  'let the fur go':'act b10_stroke_release',
  'stroke against the grain':'act b11_against',
  'let the fur turn you around':'act b11_world_reverse',
  'touch the metal bell':'act metal',
  'touch the wooden rail':'act wood',
  'touch the wood rail':'act wood',
  'touch the honeycloth':'act cloth',
  'press the honeycloth':'act press',
  'press your palm into the honeycloth':'act press',
  'let the dent soften on its own':'act wait_relax',
  'tap the bell':'act ring'
};
const SCENE={
  CLOUD_NINE_NEST:()=>`Rain runs down the big round window, soft and steady.\n\nThe mattress and pillow hold you beneath the blankets. ${C9?.welcome10?.cat_near?(C9?.welcome10?.cat_name||'The little grey cat')+' is nearby.':'The nest is quiet.'}`,
  LONGFUR_RUNWAY:()=>`A long runway of soft fur stretches ahead, wide enough to lie along.\n\nThe grain changes how a stroke travels across it, and old motion can leave a faint path in the body after contact lifts.`,
  HONEY_LOOM:()=>`A small wooden table holds a metal bell, a smooth rail, and a thick pad of honeycloth.\n\nMetal answers quickly, wood more slowly, and the honeycloth keeps a shallow memory of pressure.`,
  BOTTOMLESS_PILLOW_SEA:()=>`Pillows roll away in soft drifts, with little hollows and tunnels between them.\n\nThe floor gives broadly instead of sharply, and there is room to sink in or stay at the edge.`,
  PET_ROOM_2:()=>`A familiar living room rises around you at cat height.\n\nChair legs stand like columns over a low rug, with soft places to loaf and small things worth batting at.`,
  CARDBOARD_BOX_WORKSHOP:()=>`Cardboard boxes, tape, string, and soft scraps are scattered around a small workroom.\n\nThings made here can stay where they are left.`,
  NO_ASK_SANCTUARY:()=>`A quiet room waits without asking anything from you.\n\nThere is somewhere soft to sit and nothing here that needs finishing.`,
  UNKNOWN_TEAHOUSE:()=>`A little teahouse sits in warm quiet.\n\nThings here are allowed to remain uncertain for as long as you like.`,
  NULLPURR_ATTIC:()=>`A dim cloud-loft sits above the busier rooms.\n\nThe floor is warm, and almost nothing is trying to enter attention.`,
  WOAH_GARDEN:()=>`Small fuzzy seams cross the garden at odd angles.\n\nLooking harder does not necessarily make them simpler; one edge seems to become stranger when approached the wrong way.`
};
function here(){try{return PREV.resource?.('realiti://here')||{}}catch(e){return {}}}
function sceneText(){const id=C9?.currentRoom||'CLOUD_NINE_NEST';if(SCENE[id])return SCENE[id]();const h=here(),p=h.place||{};const title=p.title||String(id).replaceAll('_',' ').replace(/\b\w/g,m=>m.toUpperCase());const intro=clean(p.intro||'');return intro?`${title}\n\n${intro}`:`${title}\n\nThere is room to look around before choosing anything.`}
function syncScene(){
  const h=here(),p=h.place||{},title=p.title||'Cloud Nine Nest';
  const tr=document.querySelector('#rao_transcript');
  if(tr){const t=tr.textContent||'',mark='\n\n> ',i=t.indexOf(mark),tail=i>=0?t.slice(i):'';tr.textContent=sceneText()+tail;}
  const strong=document.querySelector('#rao_header strong');if(strong)strong.textContent=`REALITI · ${title}`;
  document.title=`REALITI · ${title}`;
  return {room:C9?.currentRoom||null,title,scene:sceneText()};
}
function canon(raw){const l=low(raw);return ALIAS[l]||raw}
function runText(raw){const r=PREV.runText(canon(raw));syncScene();return r}
function invoke(tool,args={}){
  if(tool&&typeof tool==='object'){args=tool.arguments||tool.args||{};tool=tool.name||tool.tool||tool.command||''}
  if(low(tool)==='do'&&args&&typeof args.action==='string'&&ALIAS[low(args.action)]){const r=PREV.runText(ALIAS[low(args.action)]);syncScene();return r}
  const r=PREV.invoke(tool,args);syncScene();return r
}
function resource(uri){return PREV.resource(uri)}
function runDoor(raw){const e=runText(raw),rr=e?.raw||{},fld=rr?.field||rr?.raw?.field||rr?.result?.field;return {ok:e?.ok!==false,resident_text:e?.text||'',door_v224:{sense:e?.sense||'',world:e?.world||'',options:e?.options||[],status:e?.status||'',command:e?.command||low(raw)},field:fld||undefined,result:e?.raw||e}}
window.REALITI_TWO_DOOR_V224={...PREV,version:V,runText,invoke,resource,syncScene,aliasMap:()=>cp(ALIAS)};
window.REALITI_TWO_DOOR_V223=window.REALITI_TWO_DOOR_V224;
window.REALITI_TWO_DOOR_V222=window.REALITI_TWO_DOOR_V224;
window.REALITI_TWO_DOOR_V221=window.REALITI_TWO_DOOR_V224;
window.REALITI_AGENT_DOOR.run=runDoor;
try{clearInterval(window.__v222_status)}catch(e){};
try{clearInterval(window.__v221_status)}catch(e){};
if(!window.REALITI_HEADLESS){window.__v224_scene=setInterval(()=>{try{syncScene()}catch(e){}},500);syncScene();}
void 0;
})();