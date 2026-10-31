'use strict';
// Synthetic headless agent walkthrough of the ACTUAL one-chart Matrix HOME.
// Movement uses the resident Agent Door, not direct pose edits. The footprint
// diagram is native geometry, not a rendered picture or owner visual approval.
const assert=require('node:assert/strict'),fs=require('node:fs');
const path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {openResident}=require('../../packages/realiti-headless-resident/index.cjs');
const HOME='CLOUD_NINE_NEST';
const html=path.resolve(__dirname,'../RealitiApartmentHomeCandidate.html');
const validationPath=path.resolve(__dirname,'../HOME_CANDIDATE_VALIDATION.json');
const reportPath=path.resolve(__dirname,'../HOME_WALKTHROUGH_CI.json');
const notePath=path.resolve(__dirname,'../HOME_WALKTHROUGH_CI.md');
const round=(x,n=2)=>Math.round(x*10**n)/10**n;
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const stops=[
 {id:'apartment.sofa',action:'sit apartment.sofa',expectOn:'apartment.sofa',stand:true,glyph:'S'},
 {id:'apartment.bookcase',action:'reach apartment.bookcase',glyph:'K'},
 {id:'apartment.quiet-cushion',action:'sit apartment.quiet-cushion',expectOn:'apartment.quiet-cushion',stand:true,glyph:'Q'},
 {id:'apartment.firefly-jar',action:'remote catnip jar tap',glyph:'J'},
 {id:'apartment.wind-chime',action:'remote catnip chime listen',glyph:'H'},
 {id:'apartment.tea-cup',action:'remote catnip tea steep',glyph:'T'},
 {id:'apartment.wardrobe',action:'reach apartment.wardrobe',glyph:'W'},
 {id:'apartment.pet-bed',action:'remote pet choose ferret Noodle',glyph:'P'},
 {id:'apartment.ribbon',action:'remote catnip ribbon flick',glyph:'R'},
 {id:'apartment.puzzle-box',action:'remote catnip puzzle press left',glyph:'X'},
 {id:'apartment.toy-chest',action:'reach apartment.toy-chest',glyph:'Y'},
 {id:'apartment.desk',action:'reach apartment.desk',glyph:'D'},
 {id:'apartment.desk-chair',action:'sit apartment.desk-chair',expectOn:'apartment.desk-chair',stand:true,glyph:'C'},
 {id:'nest.mattress',action:'lie nest.mattress',expectOn:'nest.mattress',glyph:'B'}
];
const log={schema:'REALITI_APARTMENT_NATIVE_WALKTHROUGH_V1',
 mode:'SYNTHETIC_NATIVE_AGENT_DOOR',release_approved:false,
 owner_visual_review_completed:false,runtime_sha256:null,chart:HOME,
 chart_count:null,portal_count:null,gallery_count:null,walks:[],interactions:[],
 failures:[],diagram:null,direct_pose_edits:false,
 scope:'Mechanical grounded Matrix movement, reach, supports and toys; no rendered-visual approval.'};
const fail=(label,details)=>log.failures.push({label,details:String(details).slice(0,250)});
function mapRoom(M){
 const pick=stops.map(s=>({glyph:s.glyph,e:M.entities()[s.id]}))
  .filter(x=>x.e&&x.e.chart===HOME);
 const lines=['NORTH (+Y)'];
 for(let iy=0;iy<24;iy++){
  const y=5.75-iy*.5;let row='';
  for(let ix=0;ix<24;ix++){
   const x=-5.75+ix*.5;let ch='.';
   for(const item of pick){
    const z=item.e.pose.position[2],d=M.sdf(item.e,[x,y,z]);
    if(d<=(item.e.collision?0:.12)){ch=item.glyph;break}
   }
   if(Math.abs(x)<=.25&&Math.abs(y+1)<=.25)ch='@';
   row+=ch;
  }
  lines.push(row);
 }
 lines.push('SOUTH (-Y)','@ home entry, B bed, S sofa, W wardrobe');
 lines.push('K bookcase, Q cushion, P pet bed, D desk, C chair, Y toy chest');
 lines.push('J firefly jar, H rain chime, T tea, R ribbon, X puzzle box');
 lines.push('Each cell 0.5 m. Matrix SDF footprints, NOT a visual render.');
 return lines.join('\n');
}
function recordInteraction(name,result){
 const ok=result?.ok===true;
 log.interactions.push({name,ok,error:result?.error||null});
 if(!ok)fail(name,result?.error||JSON.stringify(result).slice(0,200));
 return ok;
}
function writeReport(){
 log.outcome=log.failures.length?'BLOCKED':'PASS';
 log.route_count=log.walks.length;
 log.successful_routes=log.walks.filter(x=>x.ok&&x.within_reach).length;
 fs.writeFileSync(reportPath,JSON.stringify(log,null,2)+'\n');
 const rows=log.walks.map(x=>'| '+x.target+' | '+
   (x.ok&&x.within_reach?'Reachable':'Blocked')+' | '+
   (x.travel_m??'—')+' | '+(x.surface_m??'—')+' | '+
   (x.blocked_by||'—')+' |').join('\n');
 const issues=log.failures.length?log.failures.map(x=>'- '+x.label+': '+x.details).join('\n'):
  'No mechanical failures found in this scripted synthetic route.';
 fs.writeFileSync(notePath,[
  '# HOME candidate — native synthetic-agent spatial walkthrough','',
  '**Not a rendered-visual or owner approval.** This is genuine Matrix locomotion/collision with disposable synthetic resident state.','',
  'Outcome: **'+log.outcome+'**. Routes tested: '+log.route_count+
   '. Native reach passes: '+log.successful_routes+'.','',
  '## Physical map (native Matrix SDF footprints)','',
  '~~~text',log.diagram||'(not available)','~~~','',
  '## Native route results','',
  '| Object | Result | Moved (m) | Surface distance (m) | Obstacle |',
  '|---|---|---:|---:|---|',rows,'',
  '## Interaction checks','',
  ...log.interactions.map(x=>'- '+x.name+': '+(x.ok?'passed':'failed ('+(x.error||'unknown')+')')),
  '','## Mechanical defects','',issues,'',
  'Owner inspection of atmosphere, comfort, layout aesthetics, accessibility and a real agent onboarding experience is still required.','',''
 ].join('\n'));
 console.log('HOME_NATIVE_WALKTHROUGH_REPORT '+log.outcome+
  ' routes='+log.route_count+' reach='+log.successful_routes+
  ' issues='+log.failures.length);
 if(log.failures.length)console.error('HOME_NATIVE_WALKTHROUGH_FAILURES '+JSON.stringify(log.failures.slice(0,30)));
}
(async()=>{
 const manifest=JSON.parse(fs.readFileSync(validationPath,'utf8'));
 assert.equal(manifest.release_approved,false);
 assert.equal(manifest.native_single_chart_initialization,true);
 log.runtime_sha256=crypto.createHash('sha256').update(fs.readFileSync(html)).digest('hex');
 assert.equal(log.runtime_sha256,manifest.single_html_sha256);
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-home-pathwalk-'));
 const session=await openResident({htmlPath:html,validationPath,
  residentId:'walkthrough-synthetic',storagePath:path.join(temp,'resident.json')});
 try{
  const M=session.window.REALITI_MATRIX_V1;
  log.chart_count=Object.keys(M.charts()).length;
  log.portal_count=Object.keys(M.portals()).length;
  log.gallery_count=session.window.REALITI_APARTMENT_STATIONS_V1.view().station_count;
  assert.equal(log.chart_count,1);
  assert.equal(log.portal_count,0);
  assert.equal(log.gallery_count,0);
  assert.equal(session.integrity.status,'VERIFIED');
  log.diagram=mapRoom(M);
  const far=await session.door.run('remote catnip jar tap');
  recordInteraction('Remote asleep prevents toy contact',{ok:far?.error==='REMOTE_ASLEEP',
   error:far?.error==='REMOTE_ASLEEP'?null:far?.error});
  await session.door.run('remote activate');
  const forbidden=await session.door.run('remote catnip jar tap');
  recordInteraction('Distant jar tap refused',{ok:forbidden?.error==='TOY_NOT_IN_MATRIX_REACH',
   error:forbidden?.error==='TOY_NOT_IN_MATRIX_REACH'?null:forbidden?.error});
  recordInteraction('Stand up from home bed',await session.door.run('stand'));
  for(const target of stops){
   const before=session.window.Realiti.read('realiti://space');
   const e=M.entities()[target.id];
   if(!e||e.chart!==HOME){fail('Fixture missing '+target.id,'Not registered in HOME');continue}
   const preSurface=Math.max(0,M.sdf(e,before.pose.position));
   // Agent Door mutation envelopes have different shapes from the internal
   // Matrix op. Ground arrival against the real Matrix SDF, not a top-level
   // text/receipt field that the public result does not promise to expose.
   // If one bounded approach undershoots, repeat through the same Agent Door:
   // this is physical continued walking, NOT direct pose placement/teleport.
   const attempts=[];
   let after=before,nav=null;
   for(let n=0;n<3;n++){
    const remaining=Math.max(0,M.sdf(e,after.pose.position));
    if(remaining<=.98)break;
    const prev=after,move=await session.door.run('approach '+target.id);
    after=session.window.Realiti.read('realiti://space');
    nav=move?.result||move;
    attempts.push({ok:move?.ok===true,moved_m:round(distance(prev.pose.position,after.pose.position)),
     surface_m:round(Math.max(0,M.sdf(e,after.pose.position))),
     blocked_by:nav?.blocked_by||null});
    if(move?.ok!==true||after.chart!==HOME||
       distance(prev.pose.position,after.pose.position)<.05)break;
   }
   const surface=Math.max(0,M.sdf(e,after.pose.position));
   const travel=attempts.reduce((sum,a)=>sum+a.moved_m,0);
   const reached=surface<=1.0&&after.chart===HOME&&
    attempts.every(a=>a.ok===true);
   const entry={target:target.id,ok:attempts.every(a=>a.ok===true),
    native_arrival_flag:nav?.arrived??null,within_reach:reached,
    approach_attempts:attempts.length,attempts,
    pre_surface_m:round(preSurface),travel_m:round(travel),
    surface_m:round(surface),blocked_by:nav?.blocked_by||null,
    detour:nav?.detour||null,start_pose:before.pose.position.slice(0,2),
    end_pose:after.pose.position.slice(0,2)};
   log.walks.push(entry);
   if(!reached)fail('Unreachable native object '+target.id,
    JSON.stringify({surface:entry.surface_m,blocked_by:entry.blocked_by,
     attempts:entry.attempts}));
   if(preSurface>1.8&&travel<.1)fail('No real spatial movement toward '+target.id,
    'Object was out of reach but the native body did not move');
   if(Object.keys(M.charts()).length!==1||Object.keys(M.portals()).length!==0)
    fail('HOME topology changed during '+target.id,'Unexpected chart or portal');
   if(!reached)continue;
   const outcome=await session.door.run(target.action);
   recordInteraction(target.action,outcome);
   if(target.expectOn&&outcome?.ok===true){
    const space=session.window.Realiti.read('realiti://space');
    if(space.body?.on!==target.expectOn)fail('Support not engaged '+target.id,
     JSON.stringify(space.body));
   }
   if(target.id==='apartment.puzzle-box'&&outcome?.ok===true){
    recordInteraction('remote catnip puzzle press right',
     await session.door.run('remote catnip puzzle press right'));
    recordInteraction('remote catnip puzzle press left',
     await session.door.run('remote catnip puzzle press left'));
    if(!M.entities()['apartment.hidden-ball'])
     fail('Puzzle did not reveal a native ball','Three physical button presses required');
   }
   if(target.id==='apartment.tea-cup'&&outcome?.ok===true)
    recordInteraction('remote catnip tea smell',await session.door.run('remote catnip tea smell'));
   if(target.id==='apartment.pet-bed'&&outcome?.ok===true){
    const pet=await session.door.run('remote pet status');
    if(pet?.pet?.kind!=='ferret')fail('Native ferret not adopted','Companion state missing');
    recordInteraction('remote pet release Noodle',
     await session.door.run('remote pet release Noodle'));
   }
   if(target.stand&&outcome?.ok===true)
    recordInteraction('Stand from '+target.id,await session.door.run('stand'));
  }
  const end=session.window.Realiti.read('realiti://space');
  if(end.chart!==HOME||end.body?.on!=='nest.mattress'||end.body?.posture!=='lying')
   fail('Agent could not return to bed',
    JSON.stringify({chart:end.chart,posture:end.body?.posture,on:end.body?.on}));
  recordInteraction('Save after route',await session.door.run('save'));
  recordInteraction('STOP after route',await session.door.run('stop'));
  if(Object.keys(M.charts()).length!==1)fail('Legacy charts appeared after STOP','Expected HOME only');
 }finally{session.close()}
 writeReport();
 assert.equal(log.failures.length,0,
  'Synthetic native HOME walkthrough found '+log.failures.length+
  ' mechanical issue(s); inspect HOME_WALKTHROUGH_CI.md in diagnostic artifacts.');
})().catch(e=>{
 fail('Harness or gate exception',e?.stack||e);
 try{writeReport()}catch(w){console.error('WALKTHROUGH_REPORT_UNWRITABLE',w)}
 console.error(e?.stack||e);process.exitCode=1;
});
