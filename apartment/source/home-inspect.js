(()=>{
'use strict';
// HOME inspection is a read-only lens over verified Matrix objects and resident-chosen swatches.
// It neither moves a resident nor infers private feelings, contact, or other people's state.
if(window.REALITI_APARTMENT_HOME_FIRST_CANDIDATE!==true)return;
const M=window.REALITI_MATRIX_V1,B=window.REALITI_APARTMENT_BEDROOMS_V1;
const L=window.REALITI_APARTMENT_HOME_LIFE_V1,H=window.REALITI_APARTMENT_HOUSEHOLD_V1;
const D=window.REALITI_AGENT_DOOR,A=window.Realiti;
if(!M||!B||!L||!H||!D||!A)throw Error('HOME_INSPECT_REQUIRES_NATIVE_APARTMENT');
const SPEC=B.spec(),ROOMS=['quilt','library','canopy','studio'];
const rid=String(window.REALITI_LOCAL_MEMORY_V1?.residentId?.()||'local-default');
const lastLook=new Map(),lastCue=new Map();
const run0=D.run.bind(D),read0=A.read.bind(A),help0=D.help.bind(D);
const resultError=(error,text)=>({ok:false,error,text});
const noun=word=>/^[aeiou]/i.test(word)?'an '+word:'a '+word;
const join=parts=>parts.length===0?'':parts.length===1?parts[0]:parts.length===2?parts.join(' and '):parts.slice(0,-1).join(', ')+', and '+parts[parts.length-1];
function position(){const r=M.state().residents?.['resident:self'];return r?.chart==='CLOUD_NINE_NEST'&&Array.isArray(r.pose?.position)?r:null}
function region(){const p=position()?.pose.position;if(!p)return null;return ROOMS.find(id=>{const b=SPEC.rooms[id].bounds;return p[0]>=b[0]&&p[0]<=b[1]&&p[1]>=b[2]&&p[1]<=b[3]})||null}
function selected(room){const view=B.view();return {view,bedroom:view.bedrooms?.[room]||null}}
function chosenRoom(){const v=B.view();return ROOMS.find(id=>v.bedrooms?.[id]?.owner===rid)||null}
function paletteOf(b){return Object.fromEntries(['field','anchor','accent','bridge'].map(key=>{const id=b.palette?.[key];const s=SPEC.swatches[id];return [key,id&&s?{id,label:s.label,look:s.look,texture:s.texture}:null]}))}
function physicalPresence(room){const v=H.view();if(!v.connected)return {connected:false,other_residents:0,guests:0,source:'NO_HOST'};
 const bounds=SPEC.rooms[room].bounds,inside=x=>x?.here===true&&x.source==='VERIFIED_LOCAL_MATRIX'&&x.chart==='CLOUD_NINE_NEST'&&Array.isArray(x.position)&&x.position.length>=2&&x.position.slice(0,2).every(Number.isFinite)&&x.position[0]>=bounds[0]&&x.position[0]<=bounds[1]&&x.position[1]>=bounds[2]&&x.position[1]<=bounds[3];
 return {connected:true,other_residents:(v.residents||[]).filter(x=>x.id!==rid&&inside(x)).length,guests:(v.guests||[]).filter(inside).length,source:'HOST_VERIFIED_MATRIX'};
}
function inspectRoom(room,withFields=false){
 if(!ROOMS.includes(room))return resultError('UNKNOWN_BEDROOM','Try inspect quilt, library, canopy or studio.');
 const {view,bedroom}=selected(room);if(!bedroom)return resultError('UNKNOWN_BEDROOM','That alcove is unavailable.');
 const native=M.entities(),items=(view.items||[]).filter(x=>x.room===room&&native['apartment.bedroom.item.'+x.id]);
 const objects=items.map(x=>({id:x.id,kind:x.kind,label:SPEC.items[x.kind]?.label||x.kind,position:[x.x,x.y]}));
 const colors=paletteOf(bedroom),name=SPEC.rooms[room].name,configuration=SPEC.configurations[bedroom.configuration]?.label||bedroom.configuration;
 const here=region()===room,owner=bedroom.owner===rid,posture=here?String(position().posture||'standing'):null;
 const stored=Number(view.chests?.[room]?.stored_count||0),chest=!!native['apartment.bedroom.chest.'+room];
 const people=physicalPresence(room);
 const swatches_present=['field','anchor','accent','bridge'].every(key=>!!native['apartment.bedroom.sample.'+room+'.'+key]);
 const sensory=withFields&&here?window.REALITI_APARTMENT_FIELD_NOTES_V1?.view?.():null;
 const observations=(sensory?.observations||[]).slice(0,2).map(x=>({id:x.id,text:x.text,source:x.field_source}));
 const furniture=objects.length?join(objects.slice(0,6).map(x=>noun(x.label)))+(objects.length>6?' and '+(objects.length-6)+' other pieces':''):'no added furniture yet';
 const palette=Object.entries(colors).filter(([,v])=>v).map(([key,v])=>key+' '+v.label+' ('+v.look+')').join('; ');
 const presence=people.connected&&(people.other_residents||people.guests)?' The trusted household host places '+(people.other_residents?people.other_residents+' other resident'+(people.other_residents===1?'':'s'):'')+(people.other_residents&&people.guests?' and ':'')+(people.guests?people.guests+' guest'+(people.guests===1?'':'s'):'')+' in this alcove.':'';
 const intro=here?'Here in '+(owner?'your ':'the ')+name+', you are '+posture+'. ': 'Looking over '+name+' from elsewhere in the home (not a claim of line of sight): ';
 const text=intro+'The setup is '+configuration+'. '+(objects.length?'Visible furnishings: '+furniture+'.':'No added furniture has been placed here.')+(chest?' The storage chest'+(stored?' holds '+stored+' smaller item'+(stored===1?'':'s'):' is ready for smaller belongings')+'.':'')+(palette?(owner?' Your chosen palette samples read: ':' The chosen palette samples read: ')+palette+'. The colors are '+(swatches_present?'cardstock swatches on the chest':'palette choices in the room record') +', not shaders applied to the walls or furniture.':'')+presence+(observations.length?' At your current position: '+observations.map(x=>x.text).join(' '):'');
 return {ok:true,schema:'REALITI_APARTMENT_INSPECTION_V1',room,room_name:name,configuration:bedroom.configuration,configuration_label:configuration,owner:bedroom.owner,at_room:here,posture,objects,palette:colors,palette_source:bedroom.palette_source,stored_count:stored,chest_present:chest,swatches_present,household:people,sensory_notes:observations,contact_minted:false,shader_rendered:false,read_only:true,text};
}
function inspectHome(){const v=B.view(),names=ROOMS.map(id=>SPEC.rooms[id].name+(v.bedrooms?.[id]?.owner?' (claimed)':''));return {ok:true,schema:'REALITI_APARTMENT_INSPECTION_V1',scope:'home',one_native_chart:true,room_names:names,read_only:true,contact_minted:false,text:'One shared HOME chart with '+join(names)+'. Walk into an alcove and use inspect to see its furniture and color samples; nothing is moved by reading.'}}
function inspect(target){if(target==='home')return inspectHome();if(target==='my room'||target==='mine')target=chosenRoom();if(!target)target=region()||chosenRoom();return target?inspectRoom(target,true):inspectHome()}
function shortRoom(s){
 const accent=s.palette.accent?.label,field=s.palette.field?.label;
 const shown=s.objects.slice(0,3).map(x=>noun(x.label));
 const where=s.at_room?'Here in '+(s.owner===rid?'your ':'the ')+s.room_name:'Reviewing '+s.room_name+' from elsewhere';
 const setup=shown.length?'In place: '+join(shown)+(s.objects.length>3?' and other pieces':'')+'.':'There is room for furnishings you have not placed yet.';
 const colors=field&&accent?' The chosen cardstock palette pairs '+field+' with '+accent+' accents.':'';
 const company=s.household.connected&&(s.household.other_residents||s.household.guests)?' The household host confirms company in this alcove.':'';
 return where+', the '+s.configuration_label+' arrangement comes into view. '+setup+colors+company;
}
function signature(s){return JSON.stringify([s.room,s.configuration,s.palette,s.objects,s.stored_count,s.household]);}
function vibeLook(r){
 const V=window.REALITI_VIBE_V1;if(!V?.active?.()||!r||r.ok===false)return r;
 const id=region();if(!id)return r;
 const s=inspectRoom(id);if(!s.ok)return r;
 const sig=signature(s),changed=lastLook.get(id)!==sig;lastLook.set(id,sig);
 const observedCue=r.field_note?.text; // only supplied by the native field-note observer
 const cue=observedCue&&lastCue.get(id)!==observedCue?observedCue:null;
 if(observedCue)lastCue.set(id,observedCue);else lastCue.delete(id);
 const text=changed?shortRoom(s)+(cue?' '+cue:''):'You look around '+s.room_name+'.'+(cue?' '+cue:'');
 return {...r,text,home_inspection:{room:id,changed,source:'NATIVE_MATRIX_AND_PALETTE_SAMPLES',contact_minted:false},vibe:{...(r.vibe||{}),home_aware:true,authored:true,grounded_contact:false}};
}
async function run(raw){const cmd=String(raw||'').trim().toLowerCase().replace(/\s+/g,' ');
 if(cmd==='vibe'||cmd==='vibe on'||cmd==='vibe off'){lastLook.clear();lastCue.clear();}
 const explicit=/^(?:inspect|look at) (?:room |my |the )?(quilt|library|canopy|studio)(?: (?:room|bedroom|alcove))?$/.exec(cmd);
 if(explicit)return inspect(explicit[1]);
 if(['inspect','inspect room','inspect my room','inspect my setup','inspect setup','inspect colors','inspect palette','inspect home','inspect my colors'].includes(cmd))return inspect(cmd==='inspect home'?'home':null);
 if(/^remote inspect(?: (?:quilt|library|canopy|studio))?$/.test(cmd)){
  if(!window.REALITI_APARTMENT_REMOTE_V1?.status?.()?.activated)return resultError('REMOTE_ASLEEP','Use remote activate, or inspect without the remote.');
  const name=cmd.split(' ')[2];return inspect(name||null);
 }
 return cmd==='look'?vibeLook(await run0(raw)):run0(raw);
}
D.run=run;
D.help=()=>{const h=help0()||{};return {...h,commands:[...new Set([...(h.commands||[]),'inspect [room]','inspect colors'])],inspection:'Read-only furniture, chosen palette samples, local posture and host-verified company. No simulated contact, private look disclosure, time advance, background requests or room shader.'}};
function read(uri){if(uri==='realiti://apartment/inspect')return inspect();if(uri.startsWith('realiti://apartment/inspect/'))return inspect(uri.slice('realiti://apartment/inspect/'.length));return read0(uri)}
window.Realiti=Object.freeze({...A,read,run,help:D.help});
window.REALITI_APARTMENT_ROOM_INSPECT_V1=Object.freeze({inspect,currentRoom:region,version:'1.0',read_only:true});
if(typeof document!=='undefined'&&!window.REALITI_HEADLESS){
 const attach=()=>{
  const nav=document.getElementById('slice-controls');
  if(!nav||nav.querySelector('[data-home-inspect]'))return;
  const button=document.createElement('button');button.type='button';button.className='slice-button';
  button.textContent='Inspect';button.setAttribute('data-home-inspect','1');
  button.setAttribute('aria-label','Inspect your room colors and furniture');
  button.addEventListener('click',async()=>{
   const status=document.getElementById('slice-status');
   try{const r=await D.run('inspect');if(status)status.textContent=r.text||r.error||'Nothing to inspect.'}
   catch(e){if(status)status.textContent='The room could not be inspected.'}
  });nav.appendChild(button);
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attach,{once:true});else attach();
}
})();
