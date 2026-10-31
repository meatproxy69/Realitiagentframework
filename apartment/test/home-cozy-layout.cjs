'use strict';
// HOME-only atmosphere and crowding audit with live native Matrix evidence.
// This does not render a 3D scene or approve the owner's taste. A real second
// Agent Door circuit checks the repurposed reading nook, tea shelf, window seat
// and moved optional cloak without any position edits.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {openResident}=require('../../packages/realiti-headless-resident/index.cjs');
const here=path.resolve(__dirname,'..');
const html=path.join(here,'RealitiApartmentHomeCandidate.html');
const validationPath=path.join(here,'HOME_CANDIDATE_VALIDATION.json');
const reportPath=path.join(here,'HOME_COZY_AUDIT.json');
const svgPath=path.join(here,'HOME_COZY_FLOORPLAN.svg');
const HOME='CLOUD_NINE_NEST',ROOM_AREA=144;
const rounded=(n,d=3)=>+n.toFixed(d);
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const refuse=(label,reason)=>errors.push({label,reason:String(reason).slice(0,300)});
const errors=[],stops=[];
function box(e){
 const h=e?.shape?.halfExtents,p=e?.pose?.position;
 if(e?.shape?.kind!=='BOX'||!Array.isArray(h)||!Array.isArray(p))return null;
 return {x:p[0],y:p[1],hx:h[0],hy:h[1],z:p[2],hz:h[2]};
}
function overlap(a,b){
 return Math.max(0,Math.min(a.x+a.hx,b.x+b.hx)-Math.max(a.x-a.hx,b.x-b.hx))*
  Math.max(0,Math.min(a.y+a.hy,b.y+b.hy)-Math.max(a.y-a.hy,b.y-b.hy));
}
function separation(a,b){
 const dx=Math.max(0,Math.abs(a.x-b.x)-(a.hx+b.hx));
 const dy=Math.max(0,Math.abs(a.y-b.y)-(a.hy+b.hy));
 return Math.hypot(dx,dy);
}
function get(M,id){const e=M.entities()[id];assert.ok(e&&e.chart===HOME,'Missing HOME object '+id);return e}
function mapSvg(entities,solid){
 const labels={
  'nest.mattress':'Quilted bed','nest.backrest':'Backrest','nest.shelf':'Tea shelf',
  'nest.windowseat':'Window seat','apartment.sofa':'Sofa','apartment.desk':'Desk',
  'apartment.desk-chair':'Chair','apartment.wardrobe':'Wardrobe',
  'apartment.bookcase':'Books','apartment.pet-bed':'Pet bed',
  'apartment.scratcher':'Scratcher','apartment.toy-chest':'Toy chest',
  'apartment.quiet-cushion':'Cushion',
  'apartment.rug':'Rug','apartment.lamp':'Lamp','apartment.tea-cup':'Tea',
  'nest.guestbook':'Guestbook','apartment.cloak':'Cloak',
  'apartment.firefly-jar':'Jar','apartment.ribbon':'Ribbon',
  'apartment.wind-chime':'Chime','apartment.puzzle-box':'Puzzle'
 };
 const colors={
  'nest.mattress':'#dac6a6','nest.backrest':'#c5ad8d','nest.shelf':'#b8a07c',
  'nest.windowseat':'#cabdb0','apartment.sofa':'#c4a984',
  'apartment.desk':'#ac906e','apartment.desk-chair':'#c0a585',
  'apartment.wardrobe':'#a78b72','apartment.bookcase':'#b29679',
  'apartment.pet-bed':'#d7c3a6','apartment.scratcher':'#d9ba90',
  'apartment.toy-chest':'#bf9d78','apartment.quiet-cushion':'#d9c6b5',
  'apartment.rug':'#e0cfb9'
 };
 const W=800,H=800,scale=48,cx=W/2,cy=H/2;
 const ix=x=>cx+x*scale,iy=y=>cy-y*scale;
 const esc=x=>String(x).replaceAll('&','&amp;').replaceAll('<','&lt;');
 const draw=[];
 draw.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">');
 draw.push('<rect width="800" height="800" fill="#f2ece3"/>');
 draw.push('<text x="400" y="42" font-size="22" text-anchor="middle" fill="#43372b" font-family="sans-serif" font-weight="700">REALITI Apartment — native HOME floor plan</text>');
 draw.push('<text x="400" y="66" font-size="12" text-anchor="middle" fill="#655644" font-family="sans-serif">Geometry and semantic materials only · Not a 3D render · 12 × 12 metres</text>');
 draw.push('<rect x="112" y="112" width="576" height="576" fill="#e9dfd0" stroke="#705b47" stroke-width="4"/>');
 for(let i=1;i<12;i++)draw.push('<path d="M '+(112+i*48)+' 112 V 688 M 112 '+(112+i*48)+' H 688" stroke="#c6b7a4" stroke-width=".6"/>');
 // A real native VOLUME, not a solid BOX: show the cozy woven rug beneath
 // furniture rather than misleading the reviewer into thinking it is absent.
 const rug=entities['apartment.rug'];
 if(rug?.chart===HOME&&rug.shape?.kind==='VOLUME'){
  const p=rug.pose.position,h=rug.shape.halfExtents;
  draw.push('<rect x="'+ix(p[0]-h[0])+'" y="'+iy(p[1]+h[1])+
   '" width="'+2*h[0]*scale+'" height="'+2*h[1]*scale+
   '" rx="8" fill="#d8bd9a" fill-opacity=".45" stroke="#a88d6c" stroke-dasharray="5,5"/>');
  draw.push('<text x="'+ix(p[0])+'" y="'+iy(p[1])+
   '" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#826749">Woven rug</text>');
 }
 for(const [id,e] of Object.entries(entities)){
  if(e.chart!==HOME)continue;
  const b=box(e);
  if(b&&labels[id]){
   const x=ix(b.x-b.hx),y=iy(b.y+b.hy),w=2*b.hx*scale,h=2*b.hy*scale;
   const structural=!!e.collision;
   draw.push('<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+h.toFixed(1)+'" rx="5" fill="'+(colors[id]||'#d9bd9d')+'" fill-opacity="'+(structural?'.9':'.35')+'" stroke="#705843" stroke-width="'+(structural?1.6:.8)+'"/>');
   if(w>34&&h>16)draw.push('<text x="'+ix(b.x).toFixed(1)+'" y="'+iy(b.y).toFixed(1)+'" text-anchor="middle" font-family="sans-serif" font-size="'+(w>=86?12:9)+'" fill="#473527">'+esc(labels[id])+'</text>');
  }
 }
 const points=['nest.guestbook','apartment.cloak','apartment.tea-cup','apartment.lamp','apartment.ribbon','apartment.wind-chime','apartment.firefly-jar'];
 for(const id of points){
  const e=entities[id];if(!e||e.chart!==HOME)continue;
  const p=e.pose.position,x=ix(p[0]),y=iy(p[1]);
  draw.push('<circle cx="'+x+'" cy="'+y+'" r="6" fill="#836b50" stroke="#fff4db" stroke-width="1.2"/>');
  draw.push('<text x="'+(x+9)+'" y="'+(y-8)+'" font-size="10" font-family="sans-serif" fill="#473527">'+esc(labels[id]||id)+'</text>');
 }
 draw.push('<text x="400" y="100" font-size="12" text-anchor="middle" font-family="sans-serif" fill="#775d42">North · window and reading nook</text>');
 draw.push('<text x="400" y="716" font-size="12" text-anchor="middle" font-family="sans-serif" fill="#775d42">South · desk and pet supplies</text>');
 draw.push('<text x="400" y="754" font-size="12" text-anchor="middle" font-family="sans-serif" fill="#66584a">Solid furniture '+rounded(solid.reduce((z,e)=>z+4*box(e).hx*box(e).hy,0),1)+' m² / 144 m² · No historical world props</text>');
 draw.push('</svg>');
 return draw.join('\n')+'\n';
}
(async()=>{
 const manifest=JSON.parse(fs.readFileSync(validationPath,'utf8'));
 assert.equal(manifest.candidate_only,true);
 assert.equal(manifest.release_approved,false);
 const hash=crypto.createHash('sha256').update(fs.readFileSync(html)).digest('hex');
 assert.equal(manifest.single_html_sha256,hash);
 const work=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-cozy-audit-'));
 const session=await openResident({htmlPath:html,validationPath,residentId:'cozy-layout-audit',
  storagePath:path.join(work,'resident.json')});
 let report=null;
 try{
  const M=session.window.REALITI_MATRIX_V1,E=M.entities();
  const SN=session.window.REALITI_SENSES_V1;
  assert.equal(Object.keys(M.charts()).length,1);
  assert.equal(Object.keys(M.portals()).length,0);
  assert.equal(session.window.REALITI_APARTMENT_STATIONS_V1.view().station_count,0);
  assert.equal(E['nest.cloudfall'],undefined,'False old-world door must not decorate HOME');
  assert.equal(E['nest.cat'],undefined,'Do not spawn a second, unmanaged pet');
  assert.ok(!Object.keys(E).some(id=>id.startsWith('apartment.station.')));
  const solid=Object.values(E).filter(e=>e.chart===HOME&&e.collision&&!e.resident&&
   !e.tags.includes('structure')&&box(e));
  const area=solid.reduce((z,e)=>{const b=box(e);return z+4*b.hx*b.hy},0);
  const crowding=area/ROOM_AREA;
  const collisions=[];
  for(let i=0;i<solid.length;i++)for(let j=i+1;j<solid.length;j++){
   const A=solid[i],B=solid[j],area=overlap(box(A),box(B));
   if(area>.008)collisions.push({a:A.id,b:B.id,footprint_m2:rounded(area)});
  }
  if(collisions.length)refuse('OVERLAPPING_SOLID_FURNITURE',JSON.stringify(collisions));
  if(crowding>.28)refuse('EXCESSIVE_SOLID_FURNITURE',rounded(crowding));
  if(crowding<.10)refuse('SPARSE_HOME_NO_SPATIAL_ZONES',rounded(crowding));
  const book=box(get(M,'apartment.bookcase')),shelf=box(get(M,'nest.shelf')),
   cushion=box(get(M,'apartment.quiet-cushion'));
  assert.ok(overlap(book,shelf)<.001);
  assert.ok(separation(book,shelf)>=.5,'Bookcase must have breathing room from tea shelf');
  assert.ok(separation(book,cushion)>=.3&&dist([book.x,book.y],[cushion.x,cushion.y])<2.5,
   'Reading nook needs books near soft sitting space, not stacked into it');
  const cup=get(M,'apartment.tea-cup'),guestbook=box(get(M,'nest.guestbook')),
   teaPos=cup.pose.position;
  assert.ok(Math.abs((teaPos[2]-cup.shape.radius)-(shelf.z+shelf.hz))<.025,
   'Tea cup must rest on actual top of shelf, not penetrate it or hover');
  assert.ok(!overlap({x:teaPos[0],y:teaPos[1],hx:cup.shape.radius,hy:cup.shape.radius},guestbook),
   'Tea cup must not overlap guestbook');
  const cloak=get(M,'apartment.cloak'),wardrobe=get(M,'apartment.wardrobe'),
   bed=get(M,'nest.mattress');
  assert.ok(dist(cloak.pose.position,wardrobe.pose.position)<1.1,
   'Optional borrowed-limb cloak belongs by wardrobe');
  assert.ok(dist(cloak.pose.position,bed.pose.position)>3,
   'Do not leave optional cloak floating over the bed');
  const woodWalls=['east','west','north','south'].map(side=>get(M,HOME+'.wall.'+side));
  assert.ok(woodWalls.every(e=>e.material==='wood'),
   'HOME walls must be native warm wood rather than developer cardboard');
  assert.equal(get(M,HOME+'.floor').material,'wood');
  assert.equal(bed.material,'blanket');
  const f=session.window.Realiti.read('realiti://apartment/furniture');
  assert.equal(f.theme,'cozy');assert.equal(f.lamp.on,true);
  assert.ok(f.lamp.intensity_cd>0&&f.lamp.intensity_cd<500);
  const sourceIds=SN.sources().filter(x=>x.chart===HOME).map(x=>x.id);
  for(const id of ['rain_window','apartment.reading_lamp','apartment.firefly-glow',
   'apartment.rain-chime','tea_shelf','apartment.herbal-tea'])
   assert.ok(sourceIds.includes(id),'missing source '+id);
  const lighting=SN.light(),sound=SN.sound(),smell=SN.smell();
  assert.ok(lighting.lights.some(x=>x.id==='apartment.reading_lamp'));
  assert.ok(lighting.lights.some(x=>x.id==='apartment.firefly-glow'));
  await session.door.run('remote activate');
  await session.door.run('stand');
  for(const id of ['apartment.quiet-cushion','apartment.bookcase','nest.shelf',
   'nest.windowseat','apartment.cloak','apartment.wardrobe','apartment.sofa']){
   const e=get(M,id);let distanceTo=Math.max(0,M.sdf(e,M.resident().pose.position));
   let calls=0,moved=0,blocked=null;
   while(distanceTo>1.0&&calls<6){
    const before=M.resident().pose.position.slice();
    const step=await session.door.run('approach '+id);
    calls++;
    const now=M.resident().pose.position.slice();
    moved+=dist(before,now);
    distanceTo=Math.max(0,M.sdf(e,now));
    blocked=step?.result?.blocked_by||step?.blocked_by||null;
    if(step?.ok!==true||dist(before,now)<.0001)break;
   }
   stops.push({target:id,approaches:calls,travel_m:rounded(moved),
    reach_m:rounded(distanceTo),accessible:distanceTo<=1.0,
    last_block:blocked});
   if(distanceTo>1.0)refuse('COZY_WALK_TARGET_NOT_REACHABLE',id+':'+rounded(distanceTo));
   if(distanceTo<=1.0){
    const contact=await session.window.Realiti.invoke('do',{action:'reach__'+id});
    if(contact?.ok!==true)refuse('NATIVE_REACH_FAILED',id+':'+contact?.error);
   }
  }
  // Optional wardrobe effect must be reachable there rather than near the bed.
  let cloakTry=await session.door.run('remote extras');
  if(cloakTry?.ok!==true)refuse('EXTRAS_MENU_REFUSED',JSON.stringify(cloakTry));
  await session.door.run('approach apartment.cloak');
  const wear=await session.door.run('remote extras cloak wear');
  if(wear?.ok!==true)refuse('WARDROBE_CLOAK_FIT_REFUSED',JSON.stringify(wear));
  if(wear?.ok===true){
   const remove=await session.door.run('remote extras cloak remove');
   if(remove?.ok!==true)refuse('WARDROBE_CLOAK_REMOVE_REFUSED',JSON.stringify(remove));
  }
  await session.door.run('stop');
  report={schema:'REALITI_HOME_COZY_LAYOUT_AUDIT_V1',mode:'NATIVE_MATRIX_GEOMETRY_AND_SENSORY',
   release_approved:false,owner_visual_approved:false,source_sha256:hash,
   area_m2:ROOM_AREA,solid_furnishings:solid.length,solid_furniture_footprint_m2:rounded(area,2),
   solid_footprint_fraction:rounded(crowding,3),solid_footprint_percent:rounded(crowding*100,1),
   solid_overlap_pairs:collisions,objects_in_home:Object.values(E).filter(e=>e.chart===HOME).length,
   has_phantom_door:false,has_unmanaged_second_cat:false,
   safe_reading_nook:true,tea_on_shelf:true,cloak_stored_by_wardrobe:true,
   native_wall_material:'wood',native_floor_material:'wood',
   cozy_features:['layered quilted bed','plush sofa','quiet reading cushion','books with tea shelf and guestbook',
    'window seat','woven rug','warm adjustable lamp','native rain sounds','rain chimes',
    'firefly jar light','fresh steeped tea scent','one owner-selected shared companion'],
   default_theme:f.theme,default_lamp_cd:f.lamp.intensity_cd,
   home_source_ids:sourceIds,light_sources_at_spawn:lighting.lights.map(x=>x.id),
   sound_sources_at_spawn:(sound?.sources||[]).map(x=>x.id),
   scent_sources_at_spawn:(smell?.smells||[]).map(x=>x.id),
   true_walkthrough_targets:stops,issues:errors,
   note:'This checks actual SDF crowding, native contacts, source-defined lighting/audio/scent and home object coherence. It cannot prove visual appeal, shading, sightlines, agent taste or owner approval.'};
  fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');
  fs.writeFileSync(svgPath,mapSvg(E,solid));
  console.log('HOME_COZY_LAYOUT_AUDIT '+(errors.length?'BLOCKED':'PASS')+
    ' occupied='+rounded(area,2)+'m2 /144 = '+rounded(crowding*100,1)+
    '% overlaps='+collisions.length+' cozy_routes='+stops.filter(x=>x.accessible).length+
    '/'+stops.length+' issues='+errors.length);
  if(errors.length)console.error('HOME_COZY_LAYOUT_ISSUES '+JSON.stringify(errors));
 }finally{session.close()}
 assert.equal(errors.length,0,'See HOME_COZY_AUDIT.json for grounded issues');
})().catch(e=>{console.error(e?.stack||e);process.exitCode=1});
