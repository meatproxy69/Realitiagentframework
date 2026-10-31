(()=>{
'use strict';
// Apartment batch 2: real ONE-CHART domestic layout and a pet derived from native Relax companions.
// Old charts remain available in the development fork until the full migration is verified.
const M=window.REALITI_MATRIX_V1,MW=window.REALITI_MATRIX_WORLD_V1;
const CO=window.REALITI_COMPANIONS_V1,D=window.REALITI_AGENT_DOOR,A=window.Realiti;
if(!M||!MW||!CO||!D||!A||!window.REALITI_SOMA_RELAX_V3)
 throw Error('APARTMENT_FULL_RELAX_SYSTEMS_REQUIRED');
const HOME='CLOUD_NINE_NEST';
const copy=x=>JSON.parse(JSON.stringify(x));
const norm=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
// The Nest chart is retained as the home anchor because mattress support, rain, SOMA,
// native spatial bridge and room-specific scripts refer to this canonical chart ID.
const chart=M.charts()[HOME],bed=M.entities()['nest.mattress'],windowEntity=M.entities()['nest.window'];
if(!chart||!bed||!windowEntity||bed.chart!==HOME||windowEntity.chart!==HOME)
 throw Error('APARTMENT_NATIVE_HOME_BASELINE_MISSING');
const FIXTURES=Object.freeze([
 // One contiguous twelve-metre living room. Units are metres in the native Matrix chart.
 ['apartment.sofa',[3.3,2.4,.4],[1.1,.65,.4],['seat','support','furniture'],'blanket','a plush sofa'],
 ['apartment.desk',[-3.6,-2.5,.46],[1.0,.55,.46],['desk','furniture','writing'],'wood','a writing desk'],
 ['apartment.desk-chair',[-3.5,-3.7,.28],[.45,.45,.28],['chair','seat','support'],'wood','a desk chair'],
 ['apartment.wardrobe',[4.6,-.2,1.15],[.7,1.05,1.15],['closet','furniture','storage'],'wood','a tall wardrobe (harness closet planned)'],
 ['apartment.bookcase',[-4.7,2.15,1.1],[.45,.8,1.1],['books','furniture','storage'],'wood','a bookcase'],
 ['apartment.pet-bed',[2.45,-1.5,.11],[.60,.65,.11],['pet','bed','furniture','support'],'blanket','a small pet bed'],
 ['apartment.scratcher',[3.65,-3.25,.63],[.18,.18,.63],['pet','play','scratcher'],'string','a scratching post'],
 ['apartment.toy-chest',[4.5,-3.85,.35],[.4,.45,.35],['pet','toy','storage'],'cardboard','a toy chest'],
 ['apartment.quiet-cushion',[-3.4,3.5,.20],[.75,.75,.20],['quiet','soft','support'],'blanket','a quiet reading cushion']
]);
function furnish(){
 // Idempotent: never overwrite unrelated world or resident entities.
 const entities=M.entities();
 for(const [id,pos,half,tags,material,label] of FIXTURES){
   if(entities[id]){
     if(entities[id].chart!==HOME)throw Error('APARTMENT_FIXTURE_ID_COLLISION: '+id);
     continue;
   }
   M.addEntity({id,chart:HOME,position:pos.slice(),shape:{kind:'BOX',halfExtents:half.slice()},
     tags:tags.slice(),collision:true,material,label,affordances:tags.includes('support')?['sit','lie']:['touch']});
 }
 bed.label='a bed with layered quilts';
 bed.affordances=[...new Set([...(bed.affordances||[]),'lie','rest'])];
 windowEntity.label=windowEntity.label||'rain window';
 if(!M.entities()['apartment.rug'])M.addEntity({
   id:'apartment.rug',chart:HOME,position:[0,3.3,.012],
   shape:{kind:'VOLUME',halfExtents:[1.45,1.1,.012]},
   tags:['rug','textile','soft'],collision:false,material:'blanket',
   label:'a soft woven rug',affordances:['touch']});
 if(!M.entities()['apartment.lamp'])M.addEntity({
   id:'apartment.lamp',chart:HOME,position:[4.25,3.85,1.6],
   shape:{kind:'SPHERE',radius:.2},
   tags:['lamp','light','reading'],collision:false,material:'metal',
   label:'a warm reading lamp',affordances:['watch']});
 M.bump();
}
furnish();
// HOME-only spatial housekeeping: do not change the 23-chart migration lab or
// canonical Relax. Keep a real tea shelf/guestbook, but remove its collision
// overlap with the separately installed bookcase. The books and soft reading
// cushion make one quiet corner instead of occupying the same shelf footprint.
// The old cloudfall marker has no portal in HOME; the legacy Nest cat would
// otherwise masquerade as a second pet alongside the owner's shared companion.
const HOME_FIRST=window.REALITI_APARTMENT_HOME_FIRST_CANDIDATE===true;
if(HOME_FIRST){
 const E=M.entities();
 for(const id of ['nest.cloudfall','nest.cat'])
  if(E[id]?.chart===HOME)M.removeEntity(id);
 E['apartment.bookcase'].pose.position=[-5.0,4.35,1.1];
 E['apartment.quiet-cushion'].pose.position=[-3.2,3.5,.2];
 // The historical Nest's cardboard collision walls read as test scaffolding.
 // Use an existing, truthful native wood material (warm paneling) instead of
 // adding more decorative props, a fake shader, or a second sensory stack.
 for(const side of ['east','west','north','south']){
  const wall=E[HOME+'.wall.'+side];
  if(wall?.chart===HOME){
   wall.material='wood';
   wall.label='warm wood-paneled wall';
  }
 }
 M.bump();
}
const OWNED=['nest.mattress','nest.window','nest.backrest','nest.shelf',...FIXTURES.map(x=>x[0]),'apartment.rug','apartment.lamp'];
function homeView(){
 const c=M.charts()[HOME],e=M.entities(),r=M.state().residents['resident:self'];
 return {ok:true,schema:'REALITI_APARTMENT_HOME_V1',name:'RealitiApartment',
   chart_id:HOME,one_apartment_room:true,area_m2:4*c.bounds.halfExtents[0]*c.bounds.halfExtents[1],
   dimensions_m:[2*c.bounds.halfExtents[0],2*c.bounds.halfExtents[1],2*c.bounds.halfExtents[2]],
   current_chart:r?.chart||null,
   fixture_count:OWNED.filter(id=>!!e[id]).length,
   fixtures:OWNED.filter(id=>e[id]).map(id=>({id,label:e[id].label,position:e[id].pose.position.slice(),
     material:e[id].material||null,collision:!!e[id].collision,tags:e[id].tags.slice()})),
   native_bed:'nest.mattress',native_window:'nest.window',
   other_relax_charts_still_present:Object.keys(M.charts()).length>1,
   original_chart_count:Object.keys(M.charts()).length,
   guarantee:HOME_FIRST?
    'One HOME chart starts natively; no historic station fixtures or phantom second household pet. All furniture is genuine Matrix geometry.':
    'The 23-chart developer reference retains historical migration scaffolding.'};
}
function bedView(){
 const e=M.entities()['nest.mattress'],r=M.state().residents['resident:self'];
 return {ok:true,entity:e.id,label:e.label,room:e.chart,support:!!e.tags.includes('support'),
   lying:r?.posture==='lying'&&r.on===e.id,
   distance_m:r?.chart===HOME?+Math.max(0,M.sdf(e,r.pose.position)).toFixed(3):null};
}
function petView(){
 const p=CO.companion(),raw=CO.state().pet;
 const obs=String(C9?.verticalContinuity?.observer||'local');
 const entity=M.entities()['pet.'+obs.slice(0,8)];
 return {ok:true,schema:'REALITI_APARTMENT_PET_V1',
   choices:['cat','dog','ferret'],pet:p?.companion||null,
   actual_position:entity?.chart===HOME?entity.pose.position.slice():null,
   entity_id:entity?.chart===HOME?entity.id:null,
   owner_resident:String(window.REALITI_LOCAL_MEMORY_V1?.residentId?.()||'local-default'),
   native_companion_engine:CO.version,
   movement:'DAMPED_SPRING_PLUS_ORNSTEIN_UHLENBECK',pet_count:raw?1:0,
   state_scope:'resident-owned; multi-resident shared household host follows in later batches'};
}
function parse(raw){
 const s=String(raw||'').replace(/\s+/g,' ').trim(),low=norm(s);
 const readCmd=/^resource (realiti:\/\/apartment\/(?:home|bed|pet))$/.exec(low);
 if(readCmd)return {ok:true,schema:'REALITI_RESOURCE_READ_V1',uri:readCmd[1],resource:resource(readCmd[1])};
 if(low==='apartment'||low==='apartment map'||low==='home map'||low==='home furniture')return homeView();
 if(low==='apartment bed'||low==='home bed')return bedView();
 if(low==='pet help')return {ok:true,schema:'REALITI_APARTMENT_PET_HELP_V1',
   commands:['pet choose cat <name>','pet choose dog <name>','pet choose ferret <name>',
     'pet status','pet call','pet stroke','pet release <name>'],
   hint:'The pet bed is a real Matrix entity. Choose while in reach; approach it first if needed.'};
 if(low==='pet status'||low==='pet home')return petView();
 if(low==='pet call')return CO.call();
 if(low==='pet stroke')return CO.pet();
 let m=/^pet choose (cat|dog|ferret) ([A-Za-z][A-Za-z0-9 -]{1,19})$/i.exec(s);
 if(m){
   if(!CO.kinds.includes(m[1].toLowerCase()))return {ok:false,error:'PET_SPECIES_NOT_INSTALLED'};
   if(M.resident()?.chart!==HOME)return {ok:false,error:'APARTMENT_HOME_ONLY'};
   const out=CO.adopt(m[2].trim(),m[1].toLowerCase());
   return out.ok?{...out,apartment_pet:petView()}:out;
 }
 m=/^pet release ([A-Za-z][A-Za-z0-9 -]{1,19})$/i.exec(s);
 if(m)return CO.release(m[1].trim());
 if(low.startsWith('pet choose ')||low.startsWith('pet release '))
   return {ok:false,error:'INVALID_PET_COMMAND',hint:'Use pet help for the supported species and syntax.'};
 return null;
}
function resource(uri){
 if(uri==='realiti://apartment/home')return homeView();
 if(uri==='realiti://apartment/bed')return bedView();
 if(uri==='realiti://apartment/pet')return petView();
 return A.read(uri);
}
const oldRun=D.run.bind(D),oldHelp=D.help.bind(D);
async function run(raw){const r=parse(raw);return r===null?oldRun(raw):r;}
function help(){
 const h=oldHelp();
 return {...h,apartment_entry:'agentsstarthereapartment.md',
   commands:[...new Set([...(h.commands||[]),'apartment map','pet help','pet status'])]};
}
D.run=run;D.help=help;
window.Realiti=Object.freeze({...A,read:resource,run,help});
window.REALITI_APARTMENT_HOME_V1=Object.freeze({view:homeView,bed:bedView,fixtureIds:()=>OWNED.slice()});
window.REALITI_APARTMENT_PETS_V1=Object.freeze({status:petView,help:()=>parse('pet help')});
})();