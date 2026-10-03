(function(){
'use strict';
const V='23.1';
const PREV=window.REALITI_TWO_DOOR_V230||window.REALITI_TWO_DOOR_V227;
if(!PREV)return;
const NEST='CLOUD_NINE_NEST', BOX='CARDBOARD_BOX_WORKSHOP', HONEY='HONEY_LOOM';
const CAT_SOURCE='INVITED_COMPANION';
const cp=x=>{try{return JSON.parse(JSON.stringify(x))}catch(e){return x}};
const low=x=>String(x||'').trim().toLowerCase();
const now=()=>Number(C9?.b7?.clock||0);
function save(){try{c9save()}catch(e){}}
function roomData(id){try{return DATA?.worlds?.flatMap(w=>w.rooms||[]).find(r=>r.id===id)||null}catch(e){return null}}
function canonicalTitles(){const r=roomData(BOX);if(r)r.title='Cardboard Box Workshop';try{if(C9SCENES?.[BOX])C9SCENES[BOX].title='Cardboard Box Workshop'}catch(e){}}
canonicalTitles();


function clearCompanionGrounding(reason='left_locality'){
  const t=now(),w=C9?.welcome10||{};let cleared=0;
  if(w.cat_touch)w.cat_touch=false;
  try{
    for(const q of Object.values(C9?.b7?.zones||{})){
      if(!q||typeof q!=='object'||q._b10_grounded_source!==CAT_SOURCE)continue;
      q._b10_grounded_value=0;q._b10_grounded_until=t-1e-6;q.observed=0;
      q.innovation=Number(q.observed||0)-Number(q.predicted||0);cleared++;
    }
  }catch(e){}
  try{
    const c=C9?.b10?.contact;
    if(c&&(c.source===CAT_SOURCE||/^WELCOME_CAT/.test(String(c.cause||'')))){
      c.active=false;c.stopped=true;c.released=true;c.v=0;c.release_reason=reason;
    }
  }catch(e){}
  if(cleared||reason){C9.v231=C9.v231||{};C9.v231.last_release={t,reason,cleared};}
  save();return cleared;
}
function enforceLocality(beforeRoom,afterRoom){
  if(afterRoom!==NEST){
    const hasLive=Object.values(C9?.b7?.zones||{}).some(q=>q&&q._b10_grounded_source===CAT_SOURCE&&Number(q._b10_grounded_until||-Infinity)>=now()-1e-9);
    if(beforeRoom===NEST||hasLive||C9?.welcome10?.cat_touch)clearCompanionGrounding(beforeRoom===NEST?'left_nest':'nonlocal_companion_cleanup');
  }
}


function ensureB14(){C9.b14=C9.b14||{version:14,seq:0,history:[],links:[],stops:{},objects:{}};C9.b14.objects=C9.b14.objects||{};C9.b14.history=C9.b14.history||[];return C9.b14}
function syncTunnelObject(){
  if(!C9?.box2?.tunnel)return null;
  const b=ensureB14();let o=b.objects['BOX-TUNNEL-1'];
  if(!o){
    o=b.objects['BOX-TUNNEL-1']={id:'BOX-TUNNEL-1',label:'bent three-box tunnel',aliases:['box tunnel','cardboard tunnel','tunnel'],kind:'structure',material:'cardboard',location:BOX,portable:false,composable:true,state:{built:true,bends:1,entrance:'open',exit:'sideways',t:now()}};
    b.seq=Number(b.seq||0)+1;
    b.history.push({seq:b.seq,t:+now().toFixed(4),kind:'WORLD_CONTINUITY_PROMOTION',room:BOX,op:'promote_committed_structure',objects:['BOX-TUNNEL-1'],cause_ref:'LEGACY:box2.tunnel',law:'already-committed tunnel promoted into canonical persistent object store'});
    if(b.history.length>160)b.history.splice(0,b.history.length-160);save();
  }else if(o.location!==BOX){o.location=BOX;save()}
  return o;
}
function tunnelObject(){return syncTunnelObject()||C9?.b14?.objects?.['BOX-TUNNEL-1']||null}
function boxDelta(){
  if(C9?.currentRoom!==BOX)return '';
  const bits=[],tun=tunnelObject(),box=C9?.b14?.objects?.['BOX-1'];
  if(tun?.location===BOX)bits.push('The bent three-box tunnel is still where you left it, one stupid corner pointing sideways.');
  if(Number(box?.state?.loose_flap||0)>0)bits.push('A bent flap on the dented box has settled a little lower than before.');
  const hat=C9?.b14?.objects?.['TESTER-HAT-1'];if(hat?.location===BOX)bits.push('The tiny tester hat is here too, wherever the last real shove left it.');
  return bits.join(' ');
}
function addReturnDelta(world,cmd){
  if(C9?.currentRoom!==BOX)return String(world||'');
  const l=low(cmd),delta=boxDelta();if(!delta)return String(world||'');
  let w=String(world||'');
  if(/build.*tunnel|build_tunnel/.test(l))return 'You join three boxes into a bent tunnel. It keeps its entrance, one stupid corner, and a sideways exit when you let go.';
  if(l==='look'||l==='look around'||l.startsWith('go ')||/cardboard_box_workshop/.test(l))if(!w.includes(delta))w=(w? w+' ':'')+delta;
  return w;
}


function thermalZone(z){return C9?.b21?.thermal?.zones?.[z]||null}
function sensorySnapshot(){try{return window.SENSORY_FIELD_V226?.snapshot?.()||null}catch(e){return null}}
function provenanceAwareSense(text){
  let s=String(text||''),snap=sensorySnapshot();if(!s||!snap?.rows)return s;
  const palm=snap.rows.find(r=>r.z==='hand.R.palm'),th=thermalZone('hand.R.palm');
  if(palm&&th&&Number(palm.thermal_active||0)>0&&palm.m&&th.cause&&palm.cause&&String(th.cause)!==String(palm.cause)){
    const mat=String(th.material||'previous material').replaceAll('_',' ');
    s=s.replace(/Pressure rises in your right palm; cooling starts at the contact\./g,`Pressure gathers in your right palm. A little coolness from the ${mat} still lingers there.`);
    s=s.replace(/cooling starts at the contact\./g,`a little coolness from the ${mat} still lingers there.`);
  }
  return s;
}
function compileSense(){try{return provenanceAwareSense(window.SENSORY_FIELD_V226?.compile?.()?.text||'')}catch(e){return ''}}
function cleanStatus(s){let x=String(s||'').replace(/Boxroom 2\.0/g,'Cardboard Box Workshop');if(C9?.currentRoom!==NEST)x=x.replace(/\s*·\s*(?:Pebble|the little grey cat)\s+(?:nearby|settled against you)/ig,'');try{const snap=sensorySnapshot(),rows=snap?.rows||[],held=rows.some(r=>r.m),settling=rows.some(r=>!r.m&&(Math.abs(Number(r.after||0))>0||Math.abs(Number(r.motion||0))>0||Math.abs(Number(r.thermal||0))>0));if(!held)x=x.replace(/body: held/ig,settling?'body: settling':'body: quiet')}catch(e){}return x.replace(/\s{2,}/g,' ').trim()}
function cleanWorld(s){return String(s||'').replace(/Boxroom 2\.0/g,'Cardboard Box Workshop')}
function rebuildText(r){const p=[];if(r.sense)p.push(r.sense);if(r.world)p.push(r.world);if(Array.isArray(r.options)&&r.options.length)p.push('('+r.options.join(' · ')+')');r.text=p.join('\n')}
function postProcess(r,cmd,beforeRoom,ctx={}){
  if(!r||typeof r!=='object')return r;
  const afterRoom=C9?.currentRoom,roomChanged=beforeRoom!==afterRoom,hadCatTouch=!!ctx.hadCatTouch;
  enforceLocality(beforeRoom,afterRoom);syncTunnelObject();canonicalTitles();
  
  if(roomChanged&&beforeRoom===NEST&&afterRoom!==NEST&&hadCatTouch)r.sense='';
  else r.sense=provenanceAwareSense(r.sense);
  r.world=addReturnDelta(cleanWorld(r.world),cmd);
  r.status=cleanStatus(r.status);
  try{if(r.raw?.door_v221){r.raw.door_v221.status=cleanStatus(r.raw.door_v221.status);r.raw.door_v221.world=cleanWorld(r.raw.door_v221.world);r.raw.door_v221.sense=provenanceAwareSense(r.raw.door_v221.sense)}}catch(e){}
  try{r.field_v227=window.SENSORY_FIELD_V227?.field?.()||r.field_v227}catch(e){}
  rebuildText(r);save();return r;
}

function runText(raw){const before=C9?.currentRoom,ctx={hadCatTouch:!!C9?.welcome10?.cat_touch},cmd=String(raw||'');const r=PREV.runText(raw);return postProcess(r,cmd,before,ctx)}
function invoke(tool,args={}){const before=C9?.currentRoom,ctx={hadCatTouch:!!C9?.welcome10?.cat_touch};const r=PREV.invoke(tool,args);let cmd=String(tool||'');if(tool==='go')cmd='go '+String(args.place||'');else if(tool==='do')cmd=String(args.action||'');else if(tool==='pet_cat')cmd='pet the cat';return postProcess(r,cmd,before,ctx)}
function resource(uri){const r=PREV.resource?.(uri);if(!r||typeof r!=='object')return r;const u=String(uri||'');if(u==='realiti://here'){r.status=cleanStatus(r.status);if(r.place?.room===BOX){r.place.title='Cardboard Box Workshop';const d=boxDelta();if(d)r.place.continuity=d}}if(u==='realiti://body'&&typeof r.words==='string')r.words=provenanceAwareSense(r.words);return r}


try{const oldLook=window.REALITI_AGENT?.look;if(typeof oldLook==='function')window.REALITI_AGENT.look=function(...a){const r=oldLook.apply(this,a);if(r?.room===BOX){r.title='Cardboard Box Workshop';if(r.arrival)r.arrival.title='Cardboard Box Workshop'}return r}}catch(e){}

const API={...PREV,version:V,runText,invoke,resource,continuity:{releaseLocalCompanion:clearCompanionGrounding,syncPersistentStructures:syncTunnelObject,boxDelta}};
window.REALITI_TWO_DOOR_V231=API;window.REALITI_TWO_DOOR_V230=API;window.REALITI_TWO_DOOR_V227=API;
window.REALITI_AGENT_DOOR.run=raw=>{const r=runText(raw);return {ok:r?.ok!==false,resident_text:r?.text||'',door_v231:{sense:r?.sense||'',world:r?.world||'',options:r?.options||[],status:r?.status||'',command:low(raw)}}};

function checkRemoved(){return null;}
window.REALITI_CONTINUITY_V231={version:V,releaseLocalCompanion:clearCompanionGrounding,syncTunnelObject,boxDelta,undefined};
void 0;
syncTunnelObject();canonicalTitles();
})();