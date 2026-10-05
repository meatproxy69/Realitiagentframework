'use strict';
// Frontier rooms acceptance: each game has real mechanics; discoveries are earned from conditions and announced once.
const path=require('node:path');
const {openResident}=require('../index.cjs');

const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
const checks={},details={};
const check=(k,v,d)=>{checks[k]=!!v;if(d!==undefined)details[k]=d};
const near=(a,b,tol)=>Math.abs(a-b)<=tol;

(async()=>{
 const s=await openResident({htmlPath:html});
 try{
  const door=s.door,w=s.window,CAT=w.REALITI_CATNIP_V1,R=w.Realiti;
  const rooms=await door.run('rooms');
  check('twenty_rooms_with_frontier',rooms.length===23&&CAT.rooms.every(id=>rooms.some(r=>r.id===id)),rooms.map(r=>r.id).slice(15));

  // Glass Orchard: Life rules hold; a still life survives; generations follow world time.
  await door.run('go GLASS_ORCHARD');
  const o=w.eval('C9.frontier')||{};
  await door.run('act scatter_seeds');const g0=CAT.state().orchard.generation;await door.run('stay 5000');
  const st=CAT.state().orchard,cells=w.eval('C9.frontier.orchard.cells'),pop=cells.filter(x=>x===1).length;
  check('orchard_generations_follow_time',st.generation-g0>=4&&st.generation-g0<=5&&pop===st.population,{g0,gen:st.generation,pop,reported:st.population});
  // plant a block (still life) far from everything and watch it hold
  await door.run('act clear_orchard');const grid=w.eval('C9.frontier.orchard');const n=24;for(const [x,y] of [[2,2],[3,2],[2,3],[3,3]])grid.cells[y*n+x]=1;grid.pop=4;grid.planted=4;
  await door.run('stay 10000');const after=w.eval('C9.frontier.orchard.cells');
  check('orchard_block_is_still_life',[[2,2],[3,2],[2,3],[3,3]].every(([x,y])=>after[y*n+x]===1)&&after.filter(x=>x===1).length===4,after.filter(x=>x===1).length);

  // Resonance Well: modes at (2n−1)c/4L; off-mode hums are swallowed; the chord earns the coin.
  await door.run('go RESONANCE_WELL');
  const far=await door.run('hum 120'),m1=await door.run('hum 61.25'),m2=await door.run('hum 183.75'),m3=await door.run('hum 306.25');
  check('well_modes_are_quarter_wave',/swallows|faintly/.test(String(far.text))&&[m1,m2,m3].every(r=>/sings back at (9\d|100)%/.test(String(r.text))),{far:far.text,m1:m1.text});
  check('well_chord_reveals_coin',/Discovery/.test(String(m3.text))&&!!w.REALITI_MATRIX_V1.entities()['well.coin']&&CAT.found().well_chord,{text:m3.text});

  // Star Deck: sighting needs the sextant; the sky turns; the comet obeys Kepler (r between a(1−e) and a(1+e)).
  await door.run('go STAR_DECK');
  const noSext=await door.run('sight the kite');
  await R.invoke('approach',{target:'sextant'});
  const kite=await door.run('sight the kite'),lst0=CAT.state().sky.sidereal_deg;await door.run('stay 60000');const lst1=CAT.state().sky.sidereal_deg,c=CAT.state().sky.comet;
  check('deck_sextant_required_then_sky_turns',/stand beside/.test(String(noSext.text))&&/stars above the horizon/.test(String(kite.text))&&near(((lst1-lst0)%360+360)%360,36,1),{noSext:noSext.text,lst0,lst1});
  check('comet_obeys_kepler',c.r>=.1-1e-6&&c.r<=1.9+1e-6&&typeof c.alt==='number',c);

  // Clockwork Marsh: twins diverge; a prediction scores against the real trajectory.
  await door.run('go CLOCKWORK_MARSH');
  const sep0=w.eval('(function(){const m=C9.frontier.marsh;return Math.hypot(m.a[0]-m.b[0],m.a[1]-m.b[1],m.a[2]-m.b[2])})()');
  await door.run('stay 20000');
  const sep1=w.eval('(function(){const m=C9.frontier.marsh;return Math.hypot(m.a[0]-m.b[0],m.a[1]-m.b[1],m.a[2]-m.b[2])})()');
  const t0=w.eval('C9.b7.clock'),pred=await door.run('predict 0 0'),t1=w.eval('C9.b7.clock');
  check('marsh_twins_diverge',sep1>sep0*10,{sep0,sep1});
  check('marsh_prediction_scores_after_five_seconds',near(t1-t0,5,.05)&&/m off/.test(String(pred.text))&&CAT.state().marsh.predictions===1,{dt:t1-t0,text:pred.text});

  // Palimpsest Hall: scrolls read only at their lecterns; a wrong key fails; the right key decodes and is remembered.
  await door.run('go PALIMPSEST_HALL');
  const farRead=await door.run('read scroll 1');
  await R.invoke('approach',{target:'scroll 1'});
  const cipher=await door.run('read scroll 1'),wrong=await door.run('decode 1 kite'),right=await door.run('decode 1 pebble');
  check('scrolls_need_their_lectern',/approach it/.test(String(farRead.text))&&/reads:/.test(String(cipher.text))&&!/TWENTY ONE/.test(String(cipher.text)),{farRead:farRead.text,cipher:cipher.text.slice(0,80)});
  check('vigenere_decodes_with_the_right_key',/not a sentence/.test(String(wrong.text))&&/TWENTY ONE SECONDS/.test(String(right.text))&&CAT.found().scroll_1,{wrong:wrong.text.slice(0,60),right:right.text.slice(0,80)});

  // Discoveries are announced once and listed.
  const list=await door.run('discoveries');
  const again=await door.run('hum 61.25');
  check('discoveries_listed_and_announced_once',list.found>=3&&list.total===99&&!/Discovery/.test(String(again.text)),{found:list.found,again:again.text});

  // Pond stones: angle matters; the optimum earns the secret.
  await door.run('go KITE_FIELD');await R.invoke('approach',{target:'pond'});
  const steep=await door.run('skip stone 50'),flat=await door.run('skip stone 20');
  const skips=t=>Number((/skips (\d+)/.exec(String(t))||[])[1]);
  check('stone_skips_depend_on_angle',skips(steep.text)<=2&&skips(flat.text)>=6&&CAT.found().seven_skips,{steep:steep.text,flat:flat.text});
  check('energy_audit_passes',w.REALITI_HAPTIC_FIELD_V20.energy().pass===true);
 }finally{s.close()}

 console.log(JSON.stringify({checks,details},null,2));
 const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
 if(failed.length){console.error('FAILED',failed);process.exit(1)}
 console.log('FRONTIER PASS',Object.keys(checks).length,'checks');
})().catch(e=>{console.error(e);process.exit(1)});
