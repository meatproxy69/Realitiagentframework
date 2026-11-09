(()=>{
'use strict';
// Only observational micro-discoveries. A cue is available *only* when
// the resident is physically near its original Matrix source and the
// corresponding native light, sound, smell, motion or body state is measured.
// No synthetic emotion, contact receipt, remote touch, or autonomously chosen action.
if(window.REALITI_APARTMENT_HOME_FIRST_CANDIDATE!==true)return;
const HOME='CLOUD_NINE_NEST',M=window.REALITI_MATRIX_V1,SN=window.REALITI_SENSES_V1;
const D=window.REALITI_AGENT_DOOR,A=window.Realiti;
const CAT=window.REALITI_APARTMENT_CATNIP_V1,
 F=window.REALITI_APARTMENT_FURNITURE_V1,DYN=window.REALITI_DYNAMICS_V1;
if(!M||!SN||!D||!A||!CAT||!F||!DYN)
 throw Error('HOME_FIELD_NOTES_NATIVE_SOURCES_REQUIRED');
const fail=(error,hint)=>({ok:false,error,...(hint?{hint}:{})});
const occupant=()=>M.state().residents?.['resident:self'];
const round=x=>+x.toFixed(2);
function distance(id){
 const e=M.entities()[id],r=occupant();
 if(!r||r.chart!==HOME||e?.chart!==HOME)return Infinity;
 const d=M.sdf(e,r.pose.position);
 return Number.isFinite(d)?Math.max(0,d):Infinity;
}
const seen=(report,group,id)=>Array.isArray(report?.[group])&&report[group].some(s=>s?.id===id);
function cues(){
 const r=occupant();
 if(!r||r.chart!==HOME)return [];
 const nativeSound=SN.sound(),nativeLight=SN.light(),nativeSmell=SN.smell();
 const dynamic=CAT.view(),furniture=F.view(),rain=DYN.rain();
 const list=[];
 const add=(id,entity,threshold,test,text,source,evidence)=>{
  const d=distance(entity);
  if(d<=threshold&&test)
   list.push({id,entity_id:entity,distance_m:round(d),text,
    field_source:source,evidence,read_only:true,contact_minted:false});
 };
 const measurableRain=Number.isFinite(rain)&&rain>.18;
 add('rain-thread','nest.window',1.35,measurableRain,
  rain>.65?'The rain is pressing a little harder against the window.':
   'A fine thread of rain runs past the window seat.',
  'REALITI_DYNAMICS_V1.rain',{rain_intensity:round(rain)});
 const chime=seen(nativeSound,'sources','apartment.rain-chime');
 add('rain-glass','apartment.wind-chime',1.5,measurableRain&&chime,
  'The little glass chime sounds nearby while rain moves past the window.',
  'apartment.rain-chime',{rain_intensity:round(rain),native_sound_detected:true});
 const light=seen(nativeLight,'lights','apartment.firefly-glow');
 const order=dynamic.fireflies?.order;
 add('firefly-alignment','apartment.firefly-jar',1.5,
  light&&Number.isFinite(order)&&order>=.65,
  order>=.85?'The twelve lights in the jar have nearly fallen into step.':
   'The lights in the jar are edging toward the same rhythm.',
  'apartment.firefly-glow',{order_parameter:round(order),native_light_detected:true});
 const glow=seen(nativeLight,'lights','apartment.reading_lamp');
 const lamp=furniture.lamp;
 add('lamp-margin','apartment.lamp',1.45,
  glow&&lamp?.on===true&&lamp.intensity_cd>0,
  'A small pool of reading light is measurable around the lamp.',
  'apartment.reading_lamp',{intensity_cd:lamp.intensity_cd,native_light_detected:true});
 const scent=seen(nativeSmell,'smells','apartment.herbal-tea');
 const tea=dynamic.tea;
 add('tea-trace','apartment.tea-cup',1.25,tea?.steeping===true&&scent,
  'The tea has a local herbal scent while it is steeping; it will not last forever.',
  'apartment.herbal-tea',{steeping:true,native_smell_detected:true});
 const ribbon=dynamic.ribbon;
 add('ribbon-afterglow','apartment.ribbon',1.25,
  Number.isFinite(ribbon?.velocity)&&Math.abs(ribbon.velocity)>.1&&ribbon.flicks>0,
  'The ribbon is still moving after an earlier flick, slowed by its spring.',
  'REALITI_APARTMENT_CATNIP_V1.ribbon',{velocity:round(ribbon.velocity),
   amplitude:round(ribbon.amplitude),flicks:ribbon.flicks});
 if(M.entities()['apartment.hidden-ball'])
  add('box-secret','apartment.puzzle-box',1.25,dynamic.puzzle?.unlocked===true,
   'The opened puzzle box has left a little ball on the actual floor nearby.',
   'REALITI_MATRIX_V1.entities',{physical_entity:'apartment.hidden-ball'});
 // Two fields can meet in the room, but their rhythms do not become magically coupled.
 if(chime&&light&&Number.isFinite(order)&&order>.78&&measurableRain&&
  distance('apartment.wind-chime')<=1.6&&distance('apartment.firefly-jar')<=1.6)
  add('two-unrelated-rhythms','apartment.firefly-jar',1.6,true,
   'From between the jar and the chime, two unrelated rhythms can be measured at once.',
   'apartment.firefly-glow+apartment.rain-chime',
   {order_parameter:round(order),rain_intensity:round(rain),
    native_light_detected:true,native_sound_detected:true});
 return list.sort((a,b)=>a.distance_m-b.distance_m||a.id.localeCompare(b.id));
}
function report(focus=null){
 const all=cues(),matches=focus?all.filter(c=>c.id===focus):all;
 return {ok:true,schema:'REALITI_APARTMENT_FIELD_NOTES_V1',chart:HOME,
  current_position:occupant()?.chart===HOME?occupant().pose.position.slice():null,
  read_only:true,contact_minted:false,focus,observations:matches,
  count:matches.length,
  text:matches.length?matches.map(c=>c.text).join(' '):
   focus?'Nothing of that sort is measurable within reach right now.':
   'The nearby fields offer no unusual detail right now.',
  law:'All cues require a native field measurement or source-state plus physical Matrix proximity. No claimed thought, mood, contact or summoned pet.'};
}
const priorRun=D.run.bind(D),priorRead=A.read.bind(A),priorHelp=D.help.bind(D);
async function run(raw){
 const low=String(raw||'').trim().toLowerCase().replace(/\s+/g,' ');
 if(low==='notice'||low==='look closer'||low==='notice fields')return report();
 const focus=/^notice (rain-thread|rain-glass|firefly-alignment|lamp-margin|tea-trace|ribbon-afterglow|box-secret|two-unrelated-rhythms)$/.exec(low);
 if(focus)return report(focus[1]);
 const result=await priorRun(raw);
 if(low==='look'&&result?.ok!==false&&typeof result?.text==='string'){
  const local=cues();
  // One modest aside, only if an actually measured, nearby detail is present.
  if(local.length)return {...result,text:result.text.trimEnd()+' '+local[0].text,
   field_note:{id:local[0].id,text:local[0].text,field_source:local[0].field_source,
    distance_m:local[0].distance_m,contact_minted:false}};
 }
 return result;
}
D.run=run;
D.help=()=>{
 const help=priorHelp()||{};
 return {...help,commands:[...new Set([...(help.commands||[]),'notice'])],
  observation:'Use notice or look closer to examine native light, sound, scent and movement only where you are standing.'};
};
function read(uri){
 if(uri==='realiti://apartment/field-notes')return report();
 return priorRead(uri);
}
window.Realiti=Object.freeze({...A,read,run,help:D.help});
window.REALITI_APARTMENT_FIELD_NOTES_V1=Object.freeze({view:report});
})();
