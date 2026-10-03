(function(){
'use strict';
const V14='14.0-play-objects';
const ROUTE_UNIT_CM=10;
const OPS1=new Set(['take','place','push','pull','turn','fold','throw','tap','rub','listen']);
const OPS2=new Set(['attach','stack','separate']);
const MAT={
  cardboard:{tap:.42,rub:.54,friction:.72,mass:.55,label:'corrugated cardboard'},
  soft_tape:{tap:.22,rub:.38,friction:.83,mass:.08,label:'soft tape'},
  string:{tap:.18,rub:.43,friction:.58,mass:.04,label:'woven string'},
  metal:{tap:.86,rub:.31,friction:.28,mass:.42,label:'small metal bell'},
  pillow:{tap:.18,rub:.16,friction:.66,mass:.35,label:'soft pillow'}
};
function cp(x){try{return JSON.parse(JSON.stringify(x))}catch(e){return x}}
function clamp(x,a,b){return Math.max(a,Math.min(b,x))}
function wall(){return Number(C9.b7?.clock||0)}
function B(){
  C9.b14=C9.b14||{version:14,seq:0,history:[],links:[],stops:{},objects:null,pendingAction:null,lastWhy:null,lastPlayReceipt:null};
  const b=C9.b14;b.history=b.history||[];b.links=b.links||[];b.stops=b.stops||{};
  if(!b.objects)b.objects={
    'BOX-1':{id:'BOX-1',label:'dented cardboard box',aliases:['box','cardboard box','dented box'],kind:'box',material:'cardboard',location:'CARDBOARD_BOX_WORKSHOP',portable:true,composable:true,state:{crease:0,dent:0,wear:0,orientation_deg:0,x:0.5,support:'floor',t:wall()}},
    'TAPE-1':{id:'TAPE-1',label:'soft tape roll',aliases:['tape','soft tape','tape roll'],kind:'fastener',material:'soft_tape',location:'CARDBOARD_BOX_WORKSHOP',portable:true,composable:true,state:{used:0,wear:0,orientation_deg:0,x:0.3,t:wall()}},
    'STRING-1':{id:'STRING-1',label:'red route string',aliases:['string','red string','route string'],kind:'line',material:'string',location:'PET_ROOM_2',portable:true,composable:true,state:{tension:0,wear:0,orientation_deg:0,x:0.5,t:wall()}},
    'BELL-1':{id:'BELL-1',label:'small metal bell',aliases:['bell','metal bell'],kind:'bell',material:'metal',location:'HONEY_LOOM',portable:true,composable:true,state:{ring_energy:0,ring_tau:1.8,wear:0,orientation_deg:0,x:0.5,temperature_C:21,t:wall()}},
    'PILLOW-1':{id:'PILLOW-1',label:'pillow cube',aliases:['pillow','pillow cube','cube'],kind:'pillow',material:'pillow',location:'BOTTOMLESS_PILLOW_SEA',portable:true,composable:true,state:{compression:0,dent:0,wear:0,orientation_deg:0,x:0.5,t:wall()}}
  };
  return b;
}
function hist(kind,data={}){const b=B(),e={seq:++b.seq,t:+wall().toFixed(4),kind,...cp(data)};b.history.push(e);if(b.history.length>160)b.history.splice(0,b.history.length-160);return e}
function materialize(o,t=wall()){
  if(!o)return null;const s=o.state||(o.state={}),t0=Number(s.t??t),dt=Math.max(0,t-t0);
  if(dt>0){
    if(o.kind==='bell')s.ring_energy=Number(s.ring_energy||0)*Math.exp(-dt/Math.max(.1,Number(s.ring_tau||1.8)));
    if(o.kind==='pillow'){s.compression=Number(s.compression||0)*Math.exp(-dt/4);s.dent=Number(s.dent||0)*Math.exp(-dt/18)}
    if(o.kind==='box')s.dent=Number(s.dent||0)*Math.exp(-dt/28);
    if(s.flight&&t>=Number(s.flight.land_at)){s.flight=null;hist('OBJECT_LANDED',{object:o.id,room:o.location})}
    s.t=t;
  }
  return o;
}
function allObjects(){const b=B();for(const o of Object.values(b.objects))materialize(o);return b.objects}
function aliases(o){return [o.id,o.label,o.kind,...(o.aliases||[])].map(x=>String(x).toLowerCase())}
function resolve(q){q=String(q||'').trim().toLowerCase();if(!q)return null;const vals=Object.values(allObjects());let x=vals.find(o=>aliases(o).includes(q));if(x)return x;const hits=vals.filter(o=>aliases(o).some(a=>a.includes(q)||q.includes(a)));return hits.length===1?hits[0]:null}
function here(o,room=C9.currentRoom){return !!o&&(o.location==='CARRIED'||o.location===room)}
function accessible(o){return here(o)&&!o.state?.flight}
function linkKey(type,a,b){return `${type}:${[a,b].sort().join('|')}`}
function linkFind(type,a,b){const k=linkKey(type,a,b);return B().links.find(x=>x.key===k)}
function addLink(type,a,b,extra={}){if(a===b)return null;const ex=linkFind(type,a,b);if(ex)return ex;const L={id:`LINK-${B().seq+1}`,key:linkKey(type,a,b),type,a,b,t:wall(),...extra};B().links.push(L);hist('OBJECT_LINKED',{type,a,b,fastener:L.fastener||null});return L}
function delLink(type,a,b){const k=linkKey(type,a,b),i=B().links.findIndex(x=>x.key===k);if(i<0)return null;const [L]=B().links.splice(i,1);hist('OBJECT_SEPARATED',{type,a,b});return L}
function component(id){const seen=new Set([id]),q=[id];while(q.length){const a=q.shift();for(const L of B().links){if(!['ATTACHED','STACKED'].includes(L.type))continue;let b=null;if(L.a===a)b=L.b;else if(L.b===a)b=L.a;if(b&&!seen.has(b)){seen.add(b);q.push(b)}}}return [...seen]}
function moveComponent(id,location){for(const k of component(id)){const o=B().objects[k];if(o)o.location=location}}
function objectView(o){if(!o)return null;materialize(o);const rel=B().links.filter(L=>L.a===o.id||L.b===o.id).map(cp);return {id:o.id,label:o.label,kind:o.kind,material:o.material,location:o.location,portable:o.portable,composable:o.composable,state:cp(o.state),relations:rel,history:B().history.filter(e=>e.objects?.includes?.(o.id)||e.object===o.id||e.a===o.id||e.b===o.id).slice(-12),future_distinguishable:future(o)}}
function future(o){const out=[];if(o.kind==='box'&&(Number(o.state.crease||0)>.001||Number(o.state.dent||0)>.001))out.push('later taps, folds and drags inherit its deformation');if(o.kind==='bell'&&Number(o.state.ring_energy||0)>.01)out.push('ringdown remains audible as world state until it decays');if(o.kind==='pillow'&&Number(o.state.compression||0)>.01)out.push('compression relaxes and changes the next press');if(B().links.some(L=>L.a===o.id||L.b===o.id))out.push('its relations constrain how connected objects move');if(o.location==='CARRIED')out.push('it follows SELF across rooms until placed');return out.length?out:['no retained distinction currently changes a future interaction']}
function listObjects(){const room=C9.currentRoom,vals=Object.values(allObjects());return {room,carried:vals.filter(o=>o.location==='CARRIED').map(objectView),here:vals.filter(o=>o.location===room).map(objectView),elsewhere_count:vals.filter(o=>o.location!=='CARRIED'&&o.location!==room).length,grammar:['TAKE','PLACE','PUSH','PULL','TURN','FOLD','STACK','ATTACH','SEPARATE','THROW','TAP','RUB','WAIT','LISTEN'],law:'objects advertise affordances; the same persistent object survives rooms, time and later contact'}}
function inventory(){return {carried:Object.values(allObjects()).filter(o=>o.location==='CARRIED').map(objectView)}}
function thermalFor(o){if(o.material!=='metal')return null;const obj=Number(o.state.temperature_C??21),skin=32,eff=16,tc=(skin+eff*obj)/(1+eff);return {object_C:obj,skin_C:skin,contact_C:+tc.toFixed(4)}}
function touch(o,mode,amp,speed=.3){const cause=`PLAY:${mode}:${o.id}`,thermal=thermalFor(o);let r;
  if(thermal){r=b3sense('hand.R.palm',amp,{source:'SELF_STARTED_WORLD_CONTACT',novelty:.22,livedGrounded:true,cause,material:o.material,thermal,pressure:amp})}
  else r=b7Contact('hand.R.palm',amp,{material:o.material,grain:mode==='rub'?'against':'with',mine:true,source:'SELF_STARTED_WORLD_CONTACT',cause,speed});
  return {cause,sensory:r,thermal};
}
function connectedMotion(o,dx){for(const id of component(o.id)){const x=B().objects[id];materialize(x);x.state.x=clamp(Number(x.state.x||.5)+dx,0,1);x.state.t=wall()}}
function tapeAvailable(a,b){const t=B().objects['TAPE-1'];return a==='TAPE-1'||b==='TAPE-1'||t.location==='CARRIED'||t.location===C9.currentRoom}
function recordReceipt(op,objects,before,after,extra={}){const e=hist('PLAY_OBJECT_ACTION',{op,objects:objects.map(o=>o.id),room:C9.currentRoom,...extra});const r={build:14,type:'PLAY_OBJECT_ACTION',op,room:C9.currentRoom,objects:objects.map(o=>o.id),before,after,event:e,relations:cp(B().links),law:'object state is world state; private liking is not stored here'};B().lastPlayReceipt=r;C9.b4.lastReceipt=r;return r}
function prose(s){try{b2set(s)}catch(e){}}
function doPlay(op,args){
  const objs=args.map(x=>typeof x==='string'?resolve(x):x);if(objs.some(x=>!x))return {ok:false,error:'object not found'};
  const a=objs[0],b=objs[1],before=objs.map(objectView),m=MAT[a.material]||MAT.cardboard;let sensory=null,note='',extra={};
  if(op==='take'){
    if(!accessible(a)||a.location==='CARRIED')return {ok:false,error:'object is not takeable from here'};if(!a.portable)return {ok:false,error:'object is not portable'};moveComponent(a.id,'CARRIED');sensory=touch(a,'take',clamp(.20+.14*m.mass,0,1));note=`You take ${a.label}. Connected pieces come with it.`;
  }else if(op==='place'){
    if(a.location!=='CARRIED')return {ok:false,error:'object is not being carried'};if(!C9.currentRoom)return {ok:false,error:'enter a room first'};moveComponent(a.id,C9.currentRoom);a.state.support='floor';sensory=touch(a,'place',.24);note=`You place ${a.label} here.`;
  }else if(op==='push'||op==='pull'){
    if(!accessible(a)||a.location==='CARRIED')return {ok:false,error:'put the object in the room before moving it'};const dx=(op==='push'?1:-1)*(.10+.08*(1-m.mass));connectedMotion(a,dx);const amp=clamp(.22+.34*m.friction+.08*m.mass,0,1);sensory=touch(a,op,amp,.45);note=`${op==='push'?'You push':'You pull'} ${a.label}; its connected component moves with it.`;extra.dx=dx;
  }else if(op==='turn'){
    if(!accessible(a))return {ok:false,error:'object is not accessible'};a.state.orientation_deg=(Number(a.state.orientation_deg||0)+90)%360;sensory=touch(a,'turn',.22);note=`You turn ${a.label} a quarter turn.`;
  }else if(op==='fold'){
    if(!accessible(a)||a.kind!=='box')return {ok:false,error:'only the cardboard box currently has a fold law'};a.state.crease=clamp(Number(a.state.crease||0)+.26*(1-Number(a.state.crease||0)),0,1);a.state.dent=clamp(Number(a.state.dent||0)+.18,0,1);sensory=touch(a,'fold',clamp(.34+.28*a.state.crease,0,1));note=`The cardboard takes a crease instead of resetting.`;
  }else if(op==='throw'){
    if(a.location!=='CARRIED')return {ok:false,error:'take the object before throwing it'};if(!C9.currentRoom)return {ok:false,error:'enter a room first'};moveComponent(a.id,C9.currentRoom);a.state.flight={land_at:wall()+.45,from:'SELF',room:C9.currentRoom};sensory=touch(a,'throw_release',.18);note=`You throw ${a.label}. The landing belongs to the object/world, not to your hand.`;
  }else if(op==='tap'){
    if(!accessible(a))return {ok:false,error:'object is not accessible'};let amp=m.tap;if(a.kind==='box')amp=clamp(amp+.32*Number(a.state.crease||0)+.12*Number(a.state.dent||0),0,1.3);if(a.kind==='pillow')a.state.compression=clamp(Number(a.state.compression||0)+.08,0,1);if(a.kind==='bell'){a.state.ring_energy=1;a.state.t=wall();extra.ring_energy=1}sensory=touch(a,'tap',amp,.2);note=a.kind==='bell'?`The bell is struck. Its ringdown now belongs to the bell.`:`You tap ${a.label}; the response comes from its current material state.`;
  }else if(op==='rub'){
    if(!accessible(a))return {ok:false,error:'object is not accessible'};a.state.wear=clamp(Number(a.state.wear||0)+.015,0,1);if(a.kind==='box')a.state.dent=clamp(Number(a.state.dent||0)+.02,0,1);sensory=touch(a,'rub',clamp(m.rub+.08*Number(a.state.wear||0),0,1),.7);note=`You rub ${a.label}; friction and wear stay on the object.`;
  }else if(op==='listen'){
    if(!accessible(a))return {ok:false,error:'object is not accessible'};materialize(a);if(a.kind!=='bell')return {ok:false,error:'no grounded hearing model exists for this object'};const e=Number(a.state.ring_energy||0);note=e>.01?`The bell is still ringing in world state.`:`The bell has decayed below the current listening floor.`;extra={auditory_world_state:+e.toFixed(5),grounded_hearing:false,law:'hearing is still dormant; inspecting ringdown does not mint a heard sensation'};
  }else if(op==='attach'){
    if(!a||!b||!accessible(a)||!accessible(b))return {ok:false,error:'both objects must be accessible'};if(!a.composable||!b.composable)return {ok:false,error:'object is not composable'};if(!tapeAvailable(a.id,b.id))return {ok:false,error:'soft tape must be here or carried to fasten two ordinary objects'};const fast=a.id==='TAPE-1'||b.id==='TAPE-1'?(a.id==='TAPE-1'?a.id:b.id):'TAPE-1';const L=addLink('ATTACHED',a.id,b.id,{fastener:fast});if(!L)return {ok:false,error:'cannot attach object to itself'};const t=B().objects[fast];if(t)t.state.used=clamp(Number(t.state.used||0)+.08,0,1);sensory=touch(t||a,'attach',.32);note=`${a.label} and ${b.label} are now one connected causal component.`;
  }else if(op==='stack'){
    if(!a||!b||!accessible(a)||!accessible(b))return {ok:false,error:'both objects must be accessible'};if(a.id===b.id)return {ok:false,error:'cannot stack an object on itself'};addLink('STACKED',a.id,b.id,{top:a.id,bottom:b.id});a.state.support=b.id;sensory=touch(a,'stack',.29);note=`${a.label} now rests on ${b.label}.`;
  }else if(op==='separate'){
    if(!a||!b)return {ok:false,error:'two objects required'};const L=delLink('ATTACHED',a.id,b.id)||delLink('STACKED',a.id,b.id);if(!L)return {ok:false,error:'those objects are not connected'};a.state.support='floor';sensory=touch(a,'separate',.21);note=`You separate ${a.label} from ${b.label}.`;
  }else return {ok:false,error:'unknown play operation'};
  for(const o of objs){if(o){o.state.t=wall();materialize(o)}}
  const after=objs.map(objectView),rec=recordReceipt(op,objs,before,after,{sensory:sensory?{cause:sensory.cause,zone:sensory.sensory?.zone||null}:null,...extra});
  B().pendingWhyMeta={cause:sensory?.cause||`PLAY:${op}`,objects:objs.map(o=>o.id),receipt:rec};prose(note);c9save();return {ok:true,receipt:rec,note};
}
function decode(id){const p=String(id||'').split('__');if(p[0]!=='p14')return null;return {op:p[1],args:p.slice(2).map(x=>x.replace(/_/g,'-'))}}
function encode(op,args){return ['p14',op,...args.map(o=>o.id.replace(/-/g,'_'))].join('__')}
function labelOp(op,args){const L=args.map(o=>o.label);if(op==='stack')return `STACK ${L[0]} ON ${L[1]}`;if(op==='attach')return `ATTACH ${L[0]} TO ${L[1]}`;if(op==='separate')return `SEPARATE ${L[0]} FROM ${L[1]}`;return `${op.toUpperCase()} ${L[0]||''}`.trim()}
function actionFor(op,args){return {id:encode(op,args),label:labelOp(op,args)}}
function parsePair(rest,word){const re=new RegExp(`^(.+?)\\s+${word}\\s+(.+)$`,'i'),m=String(rest).match(re);return m?[m[1].trim(),m[2].trim()]:null}
function prepareDirect(txt){const raw=String(txt||'').trim(),low=raw.toLowerCase();let op=null,names=[];
  if(low==='objects'||low==='toys')return {query:'objects'};if(low==='inventory')return {query:'inventory'};if(low.startsWith('inspect '))return {query:'inspect',name:raw.slice(8)};if(low.startsWith('history '))return {query:'history',name:raw.slice(8)};if(low==='play'||low==='play help')return {query:'help'};
  if(low.startsWith('wait ')){const n=Number(raw.split(/\s+/)[1]);return {query:'wait',seconds:n}}
  for(const x of OPS1)if(low.startsWith(x+' ')){op=x;names=[raw.slice(x.length+1).trim()];break}
  if(!op&&low.startsWith('attach ')){op='attach';names=parsePair(raw.slice(7),'to')||raw.slice(7).trim().split(/\s+/).slice(0,2)}
  if(!op&&low.startsWith('stack ')){op='stack';names=parsePair(raw.slice(6),'on')||raw.slice(6).trim().split(/\s+/).slice(0,2)}
  if(!op&&low.startsWith('separate ')){op='separate';names=parsePair(raw.slice(9),'from')||raw.slice(9).trim().split(/\s+/).slice(0,2)}
  if(!op)return null;const objs=names.map(resolve);if(objs.some(x=>!x))return {error:'object not found or ambiguous',names};
  if(OPS2.has(op)&&objs.length<2)return {error:'two objects required'};return {op,objs};
}
function historyView(o){if(!o)return {ok:false,error:'object not found'};return {object:o.id,label:o.label,history:B().history.filter(e=>e.objects?.includes?.(o.id)||e.object===o.id||e.a===o.id||e.b===o.id).slice(-32),current:objectView(o)}}
function playHelp(){return {build:14,goal:'generic manipulation over persistent causal objects',grammar:['objects','inventory','inspect <object>','history <object>','take <object>','place <object>','push <object>','pull <object>','turn <object>','fold <object>','stack <a> on <b>','attach <a> to <b>','separate <a> from <b>','throw <object>','tap <object>','rub <object>','wait <seconds>','listen <object>'],laws:['object state is world state, not preference','generic actions reuse the same body/NERVE/LIVED/PERCEPTION path','carried objects persist across rooms','relations survive until explicitly separated','time may age materials without inventing touch','hearing remains unsupported until a grounded hearing seam exists']}}
function syncSpeed(){const c=C9.b10?.contact;if(!c)return;const moving=!!(c.active&&!c.stopped&&!c.released&&!c.paused),v=moving?Math.abs(Number(c.v)||0):0;const sc=C9.pet2?.scale==='CAT_SMALL'?.42:1;c.v_world_cm_s=+(v*ROUTE_UNIT_CM).toFixed(3);c.v_body_lengths_s=+(moving?v/Math.max(.01,sc):0).toFixed(3)}


const log13=b7Log;
b7Log=function(kind,data={}){const b=B();if(kind==='SIGNED_ABSENCE'&&data.stroke)b.stops[data.stroke]={t:wall(),x:Number(C9.b10?.contact?.x||0)};if((kind==='STROKE_CONTINUATION'||kind==='NEW_STROKE')&&data.id){const s=b.stops[data.id];if(s){data.gap_s=+Math.max(0,wall()-s.t).toFixed(3);delete b.stops[data.id]}}return log13(kind,data)};


const actions13=b4AgentActions;
b4AgentActions=function(){const a=actions13(),seen=new Set(a.map(x=>x.id)),vals=Object.values(C9?.b14?.objects||{}).filter(accessible);function add(x){if(x&&!seen.has(x.id)){a.push(x);seen.add(x.id)}}
  for(const o of vals){if(o.location==='CARRIED'){for(const op of ['place','turn','fold','throw','tap','rub','listen']){if(op==='fold'&&o.kind!=='box')continue;if(op==='listen'&&o.kind!=='bell')continue;add(actionFor(op,[o]))}}
    else{for(const op of ['take','push','pull','turn','fold','tap','rub','listen']){if(op==='fold'&&o.kind!=='box')continue;if(op==='listen'&&o.kind!=='bell')continue;add(actionFor(op,[o]))}}
  }
  if(C9?.b14?.pendingAction)add(C9.b14.pendingAction);return a};

const verb13=c9verb;
c9verb=function(room,verb){const d=decode(verb);if(d){const objs=d.args.map(x=>B().objects[x]);const r=doPlay(d.op,objs);B().lastDispatch=r;return true}const r=verb13(room,verb);syncSpeed();return r};

const felt13=b7FeltSnapshot;
b7FeltSnapshot=function(){syncSpeed();const f=felt13();syncSpeed();if(f?.contact&&C9.b10?.contact){f.contact.v_world_cm_s=Number(C9.b10.contact.v_world_cm_s||0);f.contact.v_body_lengths_s=Number(C9.b10.contact.v_body_lengths_s||0)}return f};
const state13=b7AgentState;
b7AgentState=function(){syncSpeed();const s=state13();s.build=14;s.version='PLAY_OBJECTS_BIOGRAPHY';s.patch=V14;s.play={carried:Object.values(allObjects()).filter(o=>o.location==='CARRIED').map(o=>o.id),here:Object.values(allObjects()).filter(o=>o.location===C9.currentRoom).map(o=>o.id),links:cp(B().links),object_count:Object.keys(B().objects).length};return s};
const look13=b4AgentLook;
b4AgentLook=function(){const x=look13(),vals=Object.values(allObjects());x.objects_here=vals.filter(o=>o.location===C9.currentRoom).map(o=>({id:o.id,label:o.label,material:o.material}));x.carried=vals.filter(o=>o.location==='CARRIED').map(o=>({id:o.id,label:o.label}));return x};

function scopedWhyFrom(actionResult,action,room){const rec=C9.b7?.lastAgentAction?.structured||null,meta=B().pendingWhyMeta||null,ev=actionResult?.salient_event_caused_by_this_action||null,glob=actionResult?.last_global_salient_event||null;const cause=meta?.cause||rec?.last_event?.cause||rec?.last_event?.kind||action||null;const w={room,action,cause,event:ev||null,receipt:meta?.receipt||C9.b7?.lastAgentAction?.receipt||null,nearest_prior_global_event:glob||null,law:'event is action-scoped; unrelated global salience is never presented as this action consequence'};B().pendingWhyMeta=null;B().lastWhy=w;return w}
const cmd13=b7AgentCommandText;
b7AgentCommandText=function(raw){const txt=String(raw||'').trim(),low=txt.toLowerCase();syncSpeed();
  if(low==='why'||low==='why?')return B().lastWhy||{cause:null,event:null,note:'No action-scoped causal consequence has been recorded yet.'};
  if(low==='causes'){const r=cmd13(txt),a=Array.isArray(r?.causes)?r.causes.slice():[];return {...(r||{}),causes:[...a,...liveObjectCauses()]}}
  if(low.startsWith('cause object:')){const id=txt.slice(13).trim(),o=resolve(id);if(!o)return {ok:false,error:'object cause not found',id};const f=future(o);return {id:`object:${o.id}`,kind:'PLAY_OBJECT',scope:o.location,state:o.location==='CARRIED'?'CARRIED':'PERSISTENT',what_future_can_still_change:f.join('; '),object:objectView(o)}}
  const p=prepareDirect(txt);if(p){
    if(p.error)return {ok:false,error:p.error,names:p.names||null};
    if(p.query==='objects')return listObjects();if(p.query==='inventory')return inventory();if(p.query==='inspect'){const o=resolve(p.name);return o?objectView(o):{ok:false,error:'object not found'}};if(p.query==='history'){const o=resolve(p.name);return historyView(o)};if(p.query==='help')return playHelp();
    if(p.query==='wait'){if(!Number.isFinite(p.seconds)||p.seconds<0)return {ok:false,error:'wait seconds must be nonnegative'};const before=wall(),r=window.REALITI_AGENT?.chronoskip?window.REALITI_AGENT.chronoskip(p.seconds):cmd13('skip '+p.seconds);for(const o of Object.values(allObjects()))materialize(o);const out={ok:r?.ok!==false,action:'WAIT',requested_s:p.seconds,elapsed_s:+(wall()-before).toFixed(4),clock:r,objects_aged:true};B().lastWhy={room:C9.currentRoom,action:'WAIT',cause:'elapsed time',event:null,receipt:out,nearest_prior_global_event:null,law:'time may change object state without inventing contact'};return out}
    const act=actionFor(p.op,p.objs);B().pendingAction=act;B().lastDispatch=null;const room=C9.currentRoom;const out=cmd13('act '+act.id);B().pendingAction=null;syncSpeed();const why=scopedWhyFrom(out,act.id,room);if(out&&typeof out==='object'){out.play_receipt=B().lastPlayReceipt;out.why=why}return out;
  }
  if(low.startsWith('act ')){const room=C9.currentRoom,action=txt.slice(4).trim(),out=cmd13(txt);syncSpeed();if(out&&out.ok!==false)scopedWhyFrom(out,action,room);return out}
  const out=cmd13(txt);syncSpeed();return out};


function liveObjectCauses(){const out=[];for(const o of Object.values(allObjects())){const f=future(o);if(!(f.length===1&&f[0].startsWith('no retained distinction')))out.push({id:`object:${o.id}`,kind:'PLAY_OBJECT',scope:o.location,state:o.location==='CARRIED'?'CARRIED':'PERSISTENT',what_future_can_still_change:f.join('; ')})}return out}

void 0;


const baseAgentCauses=window.REALITI_AGENT?.causes,baseAgentCause=window.REALITI_AGENT?.cause;
window.REALITI_AGENT={...(window.REALITI_AGENT||{}),look:b4AgentLook,actions:b4AgentActions,state:b7AgentState,felt:b7FeltSnapshot,why:()=>B().lastWhy||{cause:null,event:null},objects:listObjects,inventory,inspect:(x)=>objectView(resolve(x)),history:(x)=>historyView(resolve(x)),play:playHelp,causes:()=>[...(baseAgentCauses?baseAgentCauses():[]),...liveObjectCauses()],cause:(id)=>String(id||'').toLowerCase().startsWith('object:')?(()=>{const o=resolve(String(id).slice(7));return o?{id:`object:${o.id}`,kind:'PLAY_OBJECT',scope:o.location,state:o.location==='CARRIED'?'CARRIED':'PERSISTENT',what_future_can_still_change:future(o).join('; '),object:objectView(o)}:{ok:false,error:'object cause not found',id}})():(baseAgentCause?baseAgentCause(id):{ok:false,error:'cause not live',id})};
if(window.REALITI_AGENT_DOOR){const h13=window.REALITI_AGENT_DOOR.help,r13=window.REALITI_AGENT_DOOR.run;window.REALITI_AGENT_DOOR.help=function(){const h=h13?h13():{commands:[]};h.commands=[...new Set([...(h.commands||[]),'play','objects','inventory','inspect <object>','history <object>','take/place/push/pull/turn/fold/throw/tap/rub/listen <object>','stack <a> on <b>','attach <a> to <b>','separate <a> from <b>','wait <seconds>','v14 checkRemoved'])];h.laws=[...new Set([...(h.laws||[]),'objects can acquire history without acquiring preference'])];return h};window.REALITI_AGENT_DOOR.run=function(x){const low=String(x||'').trim().toLowerCase();if(low==='help')return window.REALITI_AGENT_DOOR.help();if(low==='v14 checkRemoved')return window.B14_CHECKREMOVED();if(prepareDirect(x)||low==='why'||low==='why?'||low.startsWith('act '))return b7AgentCommandText(x);const r=r13(x);syncSpeed();return r}}

document.title='REALITI // AGENT DOOR ONLY · BUILD 14 PLAY OBJECTS';
const brand=document.querySelector('#realiti_agent_only_shell .brand');if(brand)brand.textContent='REALITI // AGENT DOOR · BUILD 14';
const sub=document.querySelector('#realiti_agent_only_shell .sub');if(sub)sub.innerHTML='Ask the world what is true. Build 14 gives persistent objects a tiny generic grammar. Try <b>objects</b>, <b>take box</b>, <b>fold box</b>, <b>history box</b>.';
try{B();syncSpeed();c9save()}catch(e){}
})();