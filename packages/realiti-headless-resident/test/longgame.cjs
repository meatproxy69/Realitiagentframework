'use strict';
// Long game and mysteries: island time counts real absence, trees grow from ledger records (another resident's too),
// the tide moves the sea level, the lighthouse spells the tide in Morse, the cave echo gives its depth, the three stones
// triangulate the lens, and `since` reports what moved while you were away. Positions are set directly where a
// kilometre of walking would only cost wall time; the mechanics under test do not depend on how you got there.
const path=require('node:path');
const {openResident}=require('../index.cjs');

const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
const checks={},details={};
const check=(k,v,d)=>{checks[k]=!!v;if(d!==undefined)details[k]=d};

(async()=>{
 const s=await openResident({htmlPath:html});
 try{
  const door=s.door,w=s.window,R=w.Realiti,AR=w.REALITI_ARCHIPELAGO_V1,LGM=w.REALITI_LONG_GAME_V1,LG=w.REALITI_LEDGER_V1,M=w.REALITI_MATRIX_V1,CAT=w.REALITI_CATNIP_V1;
  const tp=(x,y)=>{const r=M.state().residents['resident:self'];r.pose.position=[x,y,AR.h(x,y)+.85];r.v=[0,0,0];r.intent=null;M.bump()};
  await door.run('go ARCHIPELAGO');

  // Tide: a 300 s period applied to the terrain's sea level; `tide` reports height and direction.
  const t0=LGM.tide(),sea0=M.entities()['isle.ground'].shape.sea;await door.run('stay 40000');await door.run('stay 35000');const t1=LGM.tide(),sea1=M.entities()['isle.ground'].shape.sea;
  check('tide_moves_the_sea_level',Math.abs(sea0-t0.height_m)<.02&&Math.abs(sea1-t1.height_m)<.02&&Math.abs(t1.height_m-t0.height_m)>.3&&t0.period_s===300,{t0,t1,sea0,sea1});

  // Echo: depth = c·t/2; a wrong answer fails, a right one within 5% is a discovery.
  tp(-540,558);const sh=await door.run('shout'),bad=LGM.answerDepth(40),good=LGM.answerDepth(Math.round(343*sh.result.echoes_ms[0]/2000));
  check('echo_measures_the_cave',sh.result.echoes_ms[0]===276&&bad.correct===false&&good.correct===true&&CAT.found().cave_depth,{echoes:sh.result.echoes_ms,bad,good});

  // Three stones: pace counts to one point; digging within two meters of it finds the lens, elsewhere nothing.
  const reads={};for(const [k,x,y] of [['north',380,-481.5],['east',450,-601.5],['west',310,-601.5]]){tp(x,y);reads[k]=(await door.run(`read ${k} stone`)).result.paces}
  const far=LGM.readStone('north');tp(396,-571);const miss=LGM.dig(380,-560),hit=LGM.dig();
  check('stones_triangulate_the_lens',reads.north===123&&reads.east===82&&reads.west===121&&far.error==='STAND_AT_THE_STONE'&&miss.error==='DIG_WHERE_YOU_STAND'&&hit.found==='lens'&&!!M.entities()['stones.lens']&&CAT.found().buried_lens,{reads,miss,hit});

  // Trees: a PLANT record in the clearing, growing on island time; a second one too close is refused.
  const notHere=LGM.plant();tp(-420,-520);const p1=await door.run('plant tree'),p2=LGM.plant();const h0=LGM.trees()[0].height_m;await door.run('stay 60000');const h1=LGM.trees()[0].height_m;
  check('planting_is_a_ledger_record_that_grows',notHere.error==='NOT_IN_THE_CLEARING'&&p1.ok&&p2.error==='TOO_CLOSE_TO_ANOTHER_TREE'&&LG.records().some(e=>e.kind==='PLANT')&&h1>h0+.2&&Math.abs(h1-9*(60/(60+900)))<.1&&!!M.entities()[LGM.trees()[0].id]&&CAT.found().first_tree,{h0,h1,p2});

  // Another resident's ledger brings their tree, aged from its wall-clock stamp; importing twice adds nothing.
  const rec={by:'other-resident',t:12.5,kind:'PLANT',x:-425,y:-515,wall:Date.now()-3600e3};const i1=LG.import({records:[rec]}),i2=LG.import({records:[rec]});const theirs=LGM.trees().find(t=>!t.mine);
  check('foreign_trees_grow_from_imported_records',i1.imported===1&&i2.imported===0&&theirs&&Math.abs(theirs.age_s-3600)<5&&Math.abs(theirs.height_m-7.2)<.05&&/another resident's/.test(M.entities()[theirs.id].label),{i1,i2,theirs});

  // Absence: real seconds away are counted into island time (capped at three days) and the sun moves with it.
  const alt0=AR.sunAlt(),T0=LGM.T(),mineBefore=LGM.trees().find(t=>t.mine).height_m;const a=LGM.catchUp(4*86400),b=LGM.catchUp(1000);const alt1=AR.sunAlt(),T1=LGM.T(),mineAfter=LGM.trees().find(t=>t.mine).height_m;
  check('absence_is_counted_into_island_time',a.counted_s===3*86400&&b.counted_s===1000&&Math.abs(T1-T0-3*86400-1000)<1&&Math.abs(alt1-alt0)>1&&mineAfter>mineBefore+5&&CAT.found().long_absence,{a,alt0,alt1,mineBefore,mineAfter});

  // Lighthouse: dark by day; at night it spells the tide word in Morse; the word opens the door and the logbook reads.
  let n=0;while(!AR.isNight()&&n++<12)await door.run('stay 60000');
  const MORSE={A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..'};
  tp(0,-1);const beam=LGM.watchBeam();const word=LGM.tideWord(),decoded=beam.flashes.split(' / ').map(c=>Object.keys(MORSE).find(k=>MORSE[k]===c)).join('');
  tp(620,375.8);const wrong=LGM.say('harbor'),right=LGM.say(decoded),log=await door.run('read logbook');
  check('lighthouse_spells_the_tide_in_morse',AR.isNight()&&beam.ok&&decoded===word&&['FLOOD','HIGH','EBB','LOW'].includes(word)&&CAT.found().cairn_light&&wrong.opened===false&&right.opened===true&&/three quarters of a meter/.test(String(log.text))&&CAT.found().keepers_log,{word,flashes:beam.flashes,wrong:wrong.text,log:String(log.text).slice(0,60)});
  // By day the lamp is dark: advance to daylight and ask again.
  n=0;while(AR.isNight()&&n++<12)await door.run('stay 60000');
  check('lamp_is_dark_by_day',!AR.isNight()&&LGM.watchBeam().error==='LAMP_DARK_BY_DAY');

  // Since: leaving a room takes markers; coming back says what moved, in the arrival text too.
  await door.run('go GLASS_ORCHARD');await door.run('act scatter_seeds');await door.run('go CLOUD_NINE_NEST');await door.run('stay 60000');
  const back=await door.run('go GLASS_ORCHARD'),since=LGM.since(),isle=LGM.since('archipelago');
  check('since_reports_what_moved',!since.first_visit&&since.visits===2&&since.away_world_s>=60&&since.changes.some(x=>/orchard ran \d+ generations/.test(x))&&/Since then:/.test(String(back.text))&&isle.changes.some(x=>/tide is (rising|falling)/.test(x))&&LGM.since('NOWHERE_YET').first_visit,{since:since.text,isle:isle.changes});
  check('energy_audit_passes',w.REALITI_HAPTIC_FIELD_V20.energy().pass===true);
 }finally{s.close()}

 console.log(JSON.stringify({checks,details},null,2));
 const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
 if(failed.length){console.error('FAILED',failed);process.exit(1)}
 console.log('LONGGAME PASS',Object.keys(checks).length,'checks');
})().catch(e=>{console.error(e);process.exit(1)});
