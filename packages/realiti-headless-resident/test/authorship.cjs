'use strict';
// Authorship: places, builds and inscriptions are ledger records rebuilt as entities; limits hold; another resident's
// ledger brings their places, and reading works on both. Positions are set directly where only wall time would be spent.
const path=require('node:path');
const {openResident}=require('../index.cjs');
const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
const checks={},details={};
const check=(k,v,d)=>{checks[k]=!!v;if(d!==undefined)details[k]=d};

(async()=>{
 const s=await openResident({htmlPath:html});
 try{
  const door=s.door,w=s.window,R=w.Realiti,AR=w.REALITI_ARCHIPELAGO_V1,AU=w.REALITI_AUTHORSHIP_V1,M=w.REALITI_MATRIX_V1,CAT=w.REALITI_CATNIP_V1,LG=()=>w.REALITI_LEDGER_V1;
  const tp=(x,y)=>{const r=M.state().residents['resident:self'];r.pose.position=[x,y,AR.h(x,y)+.85];r.v=[0,0,0];r.intent=null;M.bump()};
  await door.run('go ARCHIPELAGO');

  // Founding: refused by the dock, allowed on open ground, named once.
  const nearDock=AU.found('Harbor Camp');tp(60,-200);const ok=await door.run('found Harbor Camp'),dup=AU.found('harbor camp');tp(70,-190);const overlap=AU.found('Next Door');
  check('founding_is_bounded',nearDock.error==='TOO_CLOSE_TO_A_LANDMARK'&&ok.ok&&/name this place Harbor Camp/.test(String(ok.text))&&dup.error==='ANOTHER_PLACE_IS_HERE'&&overlap.error==='ANOTHER_PLACE_IS_HERE'&&LG().records().some(e=>e.kind==='PLACE'&&e.name==='Harbor Camp')&&CAT.found().first_place,{nearDock,dup,overlap});

  // Building: placed ahead, facing kept, same tick twice still two things; collision and size caps hold; sit on a bench.
  tp(60,-200);const b1=await door.run('build bench 2 the long seat'),same=AU.build('wall',4);await R.invoke('turn',{yaw_deg:90});const b2=AU.build('pillar',3,'the post');await R.invoke('turn',{yaw_deg:90});const big=AU.build('box',40);
  const ids=Object.keys(M.entities()).filter(id=>id.startsWith('built.')),bench=M.entities()[ids.find(id=>/long seat/.test(M.entities()[id].label))];
  await R.invoke('approach',{target:'the long seat'});const sat=await R.invoke('posture',{kind:'sit',target:'the long seat'});const sp=R.read('realiti://space');
  check('builds_are_records_with_pose',b1.ok&&same.error==='SOMETHING_IS_THERE'&&b2.ok&&big.ok&&big.size_m===6&&ids.length===3&&Math.abs(bench.pose.position[1]-(-200+2.2))<.05&&bench.tags.includes('support')&&sat.ok&&sp.body.posture==='sitting'&&sp.body.on===bench.id,{b2,big:big.size_m,ids,bench:bench.pose.position,sat:sat.result||sat});
  await R.invoke('posture',{kind:'stand'});

  // Outside your place you cannot build; inside someone else's either. Twenty-four per place.
  tp(60,-260);const outside=AU.build('box',1);
  check('building_needs_your_place',outside.error==='NOT_IN_A_PLACE');

  // Inscription on the nearest thing of yours; reading it back; cairn text.
  tp(60,-200);const ins=await door.run('inscribe we were here first'),rd=await door.run('read Harbor Camp'),blank=AU.read('the post');
  check('inscriptions_read_back',ins.ok&&/we were here first/.test(String(rd.text))&&/founded by you on island day/.test(String(rd.text))&&/Nothing is written/.test(blank.text)&&CAT.found().inscribed,{rd:String(rd.text).slice(0,90)});

  // Another resident's ledger: their place, box and inscription appear, cannot be built in, and count as a visit.
  const imp=LG().import({records:[{by:'other-resident',t:3,kind:'PLACE',name:'Far Point',x:100,y:-150,r:20},{by:'other-resident',t:4,kind:'BUILD',what:'box',size:2,x:102,y:-150,yaw:0,place:'Far Point'},{by:'other-resident',t:5,kind:'INSCRIBE',on:'built.other-re.4',text:'left for whoever'}]});
  tp(100,-152);await door.run('stay 3000');const theirs=AU.build('box',1),readTheirs=await door.run('read box'),places=AU.places();
  check('foreign_places_merge',imp.imported===3&&theirs.error==='NOT_YOUR_PLACE'&&/left for whoever/.test(String(readTheirs.text))&&places.length===2&&places.find(p=>p.name==='Far Point')?.builds===1&&!places.find(p=>p.name==='Far Point').mine&&CAT.found().visitor&&/Far Point/.test(String((await door.run('places')).text)),{places,readTheirs:String(readTheirs.text).slice(0,60)});

  // Rebuilt from the ledger: remove every built entity, sync, they are back with the same ids.
  for(const id of Object.keys(M.entities()))if(id.startsWith('built.')||id.startsWith('place.'))M.removeEntity(id);AU.sync();
  const again=Object.keys(M.entities()).filter(id=>id.startsWith('built.')||id.startsWith('place.'));
  check('entities_rebuild_from_the_ledger',again.length===6&&again.includes(bench.id),{again});
  check('energy_audit_passes',w.REALITI_HAPTIC_FIELD_V20.energy().pass===true);
 }finally{s.close()}
 console.log(JSON.stringify({checks,details},null,2));
 const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
 if(failed.length){console.error('FAILED',failed);process.exit(1)}
 console.log('AUTHORSHIP PASS',Object.keys(checks).length,'checks');
})().catch(e=>{console.error(e);process.exit(1)});
