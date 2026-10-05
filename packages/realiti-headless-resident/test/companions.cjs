'use strict';
// Companions and journeys: a boid flock that parts around you and roosts at dusk; an adopted companion as a ledger
// record on a leash spring that heels when called, is felt when petted, bolts from bass and crosses charts with you;
// another resident's companion beside their silhouette; the tram and the lift as acceleration profiles in the body.
const path=require('node:path');
const {openResident}=require('../index.cjs');
const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
const checks={},details={};
const check=(k,v,d)=>{checks[k]=!!v;if(d!==undefined)details[k]=d};

(async()=>{
 const s=await openResident({htmlPath:html});
 try{
  const door=s.door,w=s.window,R=w.Realiti,CO=w.REALITI_COMPANIONS_V1,M=w.REALITI_MATRIX_V1,CAT=w.REALITI_CATNIP_V1,AR=w.REALITI_ARCHIPELAGO_V1,LG=()=>w.REALITI_LEDGER_V1;
  const tp=(x,y,z=.85)=>{const r=M.state().residents['resident:self'];r.pose.position=[x,y,z];r.v=[0,0,0];r.intent=null;M.bump()};
  const grounded=()=>{const b=R.read('realiti://body');return b.field.z.filter((_,i)=>Number(b.field.f.at(-1).m[i])===1)};

  // Flock: 24 birds, a Reynolds flock with spread and polarization; walking into them parts them.
  await door.run('go CITY');await door.run('stay 3000');const f0=CO.flock(),birds=Object.keys(M.entities()).filter(id=>id.startsWith('city.bird_'));
  tp(f0.centroid[0],f0.centroid[1]);await door.run('stay 2000');const f1=CO.flock();
  check('flock_is_boids',birds.length===24&&f0.spread_m>1&&f0.polarization>=0&&f0.polarization<=1.01&&CAT.found().flock_parted&&f1.spread_m>0,{f0,f1});

  // Adopt the stray: a record, an entity that follows, heels when called, is felt when petted.
  const none=CO.adopt('Pip','cat');tp(-40,-1);const ad=await door.run('adopt Pip cat');const id=Object.keys(M.entities()).find(k=>k.startsWith('pet.'));
  tp(-20,-1);await door.run('stay 9000');const e1=M.entities()[id],d1=Math.hypot(e1.pose.position[0]+20,e1.pose.position[1]+1);
  const cl=await door.run('call Pip');await door.run('stay 3000');const e2=M.entities()[id],d2=Math.hypot(e2.pose.position[0]+20,e2.pose.position[1]+1);const pt=await door.run('pet Pip');
  check('companion_follows_heels_and_is_felt',none.error==='NOTHING_HERE_TO_ADOPT'&&ad.ok&&LG().records().some(e=>e.kind==='ADOPT'&&e.name==='Pip'&&e.species==='cat')&&!M.entities()['city.stray']&&id&&d1<4&&cl.ok&&d2<1.5&&pt.ok&&pt.result.material==='longfur'&&CAT.found().adopted&&CAT.found().called&&CAT.found().petted,{d1,d2,pt:pt.text});

  // Bass makes it bolt behind your legs; a chart change brings it along.
  tp(36,2);await door.run('dance');await door.run('stay 2000');const bolt=M.entities()[id].label;await door.run('stay 30000');
  await door.run('go ARCHIPELAGO');await door.run('stay 2000');const e3=M.entities()[id],r=M.state().residents['resident:self'];
  check('companion_bolts_and_crosses_charts',/legs/.test(bolt)&&CAT.found().bolted&&e3.chart==='ARCHIPELAGO'&&Math.hypot(e3.pose.position[0]-r.pose.position[0],e3.pose.position[1]-r.pose.position[1])<4,{bolt,chart:e3.chart});

  // Another resident's companion stands by their silhouette once their ledger is in.
  await door.run('go CITY');const T=Date.now();LG().import({records:[{by:'other-resident-2',t:1,n:0,kind:'AVATAR',set:{name:'Nyx'}},{by:'other-resident-2',t:2,n:1,kind:'ARRIVE',venue:'teahouse',wall:T-60e3},{by:'other-resident-2',t:3,n:2,kind:'ADOPT',name:'Moth',species:'fox',wall:T-50e3}]});await door.run('stay 2000');
  const theirs=M.entities()['pet.other-re'],ghost=M.entities()['ghost.other-re'];
  check('their_companion_stands_by_their_silhouette',theirs&&ghost&&/Moth the fox/.test(theirs.label)&&Math.hypot(theirs.pose.position[0]-ghost.pose.position[0],theirs.pose.position[1]-ghost.pose.position[1])<2,{label:theirs&&theirs.label});

  // Tram: a journey, not a teleport; the seat and back carry the acceleration; arrival crosses the portal.
  tp(6,-32);const far=CO.startJourney('meridian_city.to.archipelago');const ride=await door.run('take the tram');await door.run('stay 2000');const j=CO.journey(),gz=grounded(),a2=CO.accel('meridian_city.to.archipelago',2);
  await door.run('stay 24000');const sp=R.read('realiti://space'),last=CO.state().lastArrival;
  check('tram_is_a_felt_journey',far.error==='NOT_AT_THE_DOOR'&&ride.ok&&j.travelling&&j.kind==='tram'&&a2>0&&Math.abs(j.acceleration_mps2)>0&&gz.includes('pelvis.seat')&&gz.includes('torso.lower_back')&&sp.chart==='ARCHIPELAGO'&&last&&last.ok&&last.log.length>10&&CAT.found().tram_ride,{far,j,gz,chart:sp.chart});

  // Lift: soles lighter going down, the profile is antisymmetric, arrival in the city.
  await door.run('go NEST');tp(4.5,-4.6);const lift=await door.run('ride the lift');await door.run('stay 1500');const al=CO.accel('cloud_nine_nest.to.meridian_city',1.5),gz2=grounded();await door.run('stay 12000');const sp2=R.read('realiti://space');
  check('lift_changes_your_weight',lift.ok&&al<0&&Math.abs(CO.accel('cloud_nine_nest.to.meridian_city',10.5)+al)<1e-6&&gz2.includes('knee.L')&&gz2.includes('leg.L.shin')&&sp2.chart==='MERIDIAN_CITY'&&CAT.found().lift_ride,{al,gz2,chart:sp2.chart});
  check('energy_audit_passes',w.REALITI_HAPTIC_FIELD_V20.energy().pass===true);
 }finally{s.close()}
 console.log(JSON.stringify({checks,details},null,2));
 const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
 if(failed.length){console.error('FAILED',failed);process.exit(1)}
 console.log('COMPANIONS PASS',Object.keys(checks).length,'checks');
})().catch(e=>{console.error(e);process.exit(1)});
