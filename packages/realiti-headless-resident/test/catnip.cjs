'use strict';
// Catnip pack: the whale keeps a ground over deep water and is heard through the hull with the right delay; bottles are
// drifting ledger records; mature trees drop seeds that plant anywhere on land; the lens restores the lamp; the
// calendar is a function of island time.
const path=require('node:path');
const {openResident}=require('../index.cjs');
const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
const checks={},details={};
const check=(k,v,d)=>{checks[k]=!!v;if(d!==undefined)details[k]=d};

(async()=>{
 const s=await openResident({htmlPath:html});
 try{
  const door=s.door,w=s.window,R=w.Realiti,AR=w.REALITI_ARCHIPELAGO_V1,PK=w.REALITI_CATNIP_PACK_V1,LGM=()=>w.REALITI_LONG_GAME_V1,M=w.REALITI_MATRIX_V1,CAT=w.REALITI_CATNIP_V1,LG=()=>w.REALITI_LEDGER_V1;
  const tp=(x,y)=>{const r=M.state().residents['resident:self'];r.pose.position=[x,y,AR.h(x,y)+.85];r.v=[0,0,0];r.intent=null;M.bump()};
  await door.run('go ARCHIPELAGO');

  // Whale ground over deep water; surfaces a third of the time; entity follows.
  let deep=true,up=0;for(let t=0;t<3600;t+=3){const p=PK.whale.position.call(null);}
  const T0=LGM().T();for(let t=0;t<2700;t+=1){const g=PK.whale.ground,p=[g.c[0]+g.a[0]*Math.sin(2*Math.PI*(T0+t)/g.p[0]),g.c[1]+g.a[1]*Math.sin(2*Math.PI*(T0+t)/g.p[1]+1)];if(AR.h(p[0],p[1])>-2)deep=false;if(Math.sin(2*Math.PI*(T0+t)/g.cycle)>.5)up++}
  const wp=PK.whale.position(),we=M.entities()['sea.whale'];
  check('whale_ground_is_deep_water',deep&&Math.abs(up/2700-1/3)<.02&&we&&Math.hypot(we.pose.position[0]-wp[0],we.pose.position[1]-wp[1])<2,{deep,fraction_up:up/2700,wp,we:we&&we.pose.position});

  // Listening needs a hull; the delay is distance over 1482 m/s.
  const ashore=PK.listen();tp(0,-301);await door.run('board boat');let n=0;while(PK.whale.surfaced()&&n++<60)await door.run('stay 1000');
  const heard=await door.run('listen'),d=Math.hypot(PK.whale.position()[0]-0,PK.whale.position()[1]+301);
  check('whale_song_delay_is_distance_over_speed',ashore.heard===false&&heard.result.heard===true&&Math.abs(heard.result.delay_ms-d/1482*1000)<40&&CAT.found().whale_song,{ashore:ashore.text,heard:heard.result,d});

  // Bottles: dropped from the boat as records; another resident's bottle has drifted on the current and can be opened.
  const bt=await door.run('bottle hello from the harbor'),notAboard=(await (async()=>{await door.run('land');return PK.bottle('x')})());
  const imp=LG().import({records:[{by:'other-resident',t:6,kind:'BOTTLE',x:300,y:-100,text:'drift to me',wall:Date.now()-1800e3}]});const b=PK.bottles().find(x=>!x.mine);
  tp(b.now_at[0],b.now_at[1]);const opened=await door.run('open bottle');
  check('bottles_drift_as_records',bt.ok&&LG().records().some(e=>e.kind==='BOTTLE'&&/hello/.test(e.text))&&notAboard.error==='DROP_IT_FROM_THE_BOAT'&&imp.imported===1&&b.drifted_m>50&&b.drifted_m<600&&/drift to me/.test(String(opened.text))&&CAT.found().bottle_found,{b,opened:String(opened.text).slice(0,80)});

  // Seeds: a mature imported tree drops one; gathered, it plants outside the clearing; the clearing needs none.
  const noSeed=(()=>{tp(-300,-500);return LGM().plant()})();
  LG().import({records:[{by:'other-resident',t:7,kind:'PLANT',x:-425,y:-515,wall:Date.now()-7200e3}]});tp(-424,-516);const g1=await door.run('gather seed'),g2=PK.gather();tp(-300,-500);const wild=await door.run('plant tree');
  check('seeds_plant_beyond_the_clearing',noSeed.error==='NOT_IN_THE_CLEARING'&&g1.ok&&g2.error==='NO_SEED_IN_REACH'&&wild.ok&&PK.state().seeds===0&&LG().records().some(e=>e.kind==='PLANT'&&e.seed===true)&&CAT.found().wild_tree&&LGM().trees().some(t=>t.mine),{g1:String(g1.text).slice(0,60),g2,wild:String(wild.text).slice(0,60)});

  // Lens: carried from the dig to the lighthouse door; the beam then speaks at dusk and adds the whale's bearing.
  const early=PK.carryLens();tp(396,-571);await door.run('dig');const carried=await door.run('carry lens');const farInstall=PK.installLens();tp(620,375.8);const inst=await door.run('install lens');
  n=0;while(!(AR.sunAlt()<15&&AR.sunAlt()>0)&&n++<12)await door.run('stay 60000');const dusk=LGM().watchBeam();
  const L=M.entities()['lantern.lighthouse'].pose.position,wq=PK.whale.position(),brg=Math.round(((Math.atan2(wq[0]-L[0],wq[1]-L[1])*180/Math.PI)%360+360)%360),DIG=['-----','.----','..---','...--','....-','.....','-....','--...','---..','----.'],want=[...String(brg).padStart(3,'0')].map(c=>DIG[Number(c)]).join(' / ');
  check('lens_restores_the_lamp',early.error==='NO_LENS_DUG_UP'&&carried.ok&&farInstall.error==='BRING_IT_TO_THE_LIGHTHOUSE_DOOR'&&inst.ok&&PK.installed()&&dusk.ok&&dusk.dusk===true&&dusk.second_word===want&&CAT.found().lens_restored,{alt:AR.sunAlt(),dusk:dusk.flashes,second:dusk.second_word,want});

  // Calendar: day, clock from the sun, tide turns 150 s apart alternating, sunset/sunrise consistent with the sun.
  const cal=PK.calendar();
  check('calendar_is_a_function_of_island_time',cal.ok&&Number.isInteger(cal.island_day)&&/^\d\d:\d\d$/.test(cal.clock)&&cal.tide_turns.length===4&&cal.tide_turns.every((t,i)=>i===0||t.in_s-cal.tide_turns[i-1].in_s===150)&&cal.tide_turns[0].state!==cal.tide_turns[1].state&&cal.sunset_in_s>0&&cal.sunset_in_s<=600&&cal.whale.next_surface_in_s>=0,cal);
  check('energy_audit_passes',w.REALITI_HAPTIC_FIELD_V20.energy().pass===true);
 }finally{s.close()}
 console.log(JSON.stringify({checks,details},null,2));
 const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
 if(failed.length){console.error('FAILED',failed);process.exit(1)}
 console.log('CATNIP PASS',Object.keys(checks).length,'checks');
})().catch(e=>{console.error(e);process.exit(1)});
