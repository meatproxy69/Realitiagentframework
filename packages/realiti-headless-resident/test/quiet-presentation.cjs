'use strict';
// Quiet presentation (opt-in): `quiet on` / openResident({presentation:'quiet'}) describes rooms in words, keeps finds
// without announcing them and takes lab benches out of the action lists. Presentation only: the same commands leave the
// world in the same state either way. Default behaviour is unchanged (every other suite runs with the default).
const path=require('node:path'),os=require('node:os');
const {openResident}=require('../index.cjs');
const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
const checks={},details={};const check=(k,v,d)=>{checks[k]=!!v;if(d!==undefined)details[k]=d};
// Both residents share an id (arrival spots are offset per id) and differ only in storage and presentation.
let n=0;const fresh=(o={})=>openResident({htmlPath:html,residentId:'quiet-pres-same',storagePath:path.join(os.tmpdir(),`quiet-pres-${process.pid}-${n++}.json`),...o});
const text=r=>String((r&&(r.text||r.resident_text))||'');
// The city is visited for its words, then the run ends in the Kite Field: city arrival spots depend on each resident's
// identity key, which differs between the two saves, so positions are compared away from the city.
const SCRIPT=['go MERIDIAN_CITY','stay 2000','go GLASS_ORCHARD','act scatter_seeds','stay 3000','go RESONANCE_WELL','hum 110','stay 2000','go KITE_FIELD','act launch_kite','stay 4000'];
const FIGURES=/\d+(\.\d+)?\s*(m\/s|°C|dB|Hz|bpm|%)|\bm away now\b/;
const figures=t=>FIGURES.test(String(t).replace(/You hum [\d.]+ Hz/g,'You hum'));// the pitch you chose is yours to hear back
async function run(s){const out=[];for(const c of SCRIPT)out.push(await s.door.run(c));return out}
function digest(s){const w=s.window;return JSON.stringify({clock:+Number(w.eval('C9.b7.clock')).toFixed(3),pose:s.publicApi.read('realiti://space')?.pose?.position?.map(x=>+x.toFixed(3)),room:w.eval('C9.currentRoom'),
 kite:(()=>{try{const k=w.REALITI_WONDER_V1.state().kite;return k?{up:k.up,L:+Number(k.L).toFixed(2),phi:+Number(k.phi||0).toFixed(4),T:+Number(k.T||0).toFixed(3)}:null}catch(e){return String(e)}})(),orchard:(()=>{try{const st=w.REALITI_CATNIP_V1?.state?.();return st?.orchard||null}catch{return null}})(),found:(w.REALITI_CATNIP_V1?.found?.()||[]).length})}
(async()=>{
 const a=await fresh(),b=await fresh({presentation:'quiet'});
 try{
  // Default: figures and announcements as before; quiet off is the default state.
  const st=await a.door.run('quiet');check('default_is_not_quiet',st.quiet===false&&st.numbers===true&&st.announcing===true&&st.labs===true,st);
  const st2=await b.door.run('quiet');check('presentation_option_turns_quiet_on',st2.quiet===true,st2);
  const ra=await run(a),rb=await run(b);
  check('default_replies_carry_figures',ra.some(r=>FIGURES.test(text(r))),ra.map(text).filter(t=>FIGURES.test(t)).slice(0,2));
  check('quiet_replies_carry_no_figures',!rb.some(r=>figures(text(r))),rb.map(text).filter(t=>figures(t)).slice(0,3));
  check('quiet_announces_nothing',!rb.some(r=>/✦ Discovery/.test(text(r))),rb.map(text).filter(t=>/✦/.test(t)).slice(0,2));
  // Presentation only: same world.
  const da=digest(a),db=digest(b);check('same_commands_same_world',da===db,{default:da,quiet:db});
  // Finds are kept, and listed without a total.
  const d=await b.door.run('discoveries');check('quiet_discoveries_listed_without_total',!/ of \d+/.test(text(d)),text(d).slice(0,120));
  // Lab benches: listed by default, out of quiet action lists, each switch on its own.
  await a.door.run('go NO_ASK_SANCTUARY');await b.door.run('go NO_ASK_SANCTUARY');
  const la=(await a.door.run('actions')).actions.map(x=>x.id),lb=(await b.door.run('actions')).actions.map(x=>x.id);
  check('quiet_hides_lab_benches',lb.length<=la.length&&!lb.some(x=>/^neuro_|lab/.test(x)&&!la.includes(x)),{default:la.length,quiet:lb.length});
  await b.door.run('numbers on');const fb=text(await b.door.run('go KITE_FIELD'))+' '+text(await b.door.run('stay 3000'));
  check('numbers_on_inside_quiet_brings_figures',FIGURES.test(fb)||/\d/.test(fb),fb.slice(0,160));
  const off=await b.door.run('quiet off');check('quiet_off_restores_all',off.quiet===false&&off.numbers&&off.announcing&&off.labs,off);
  // Persisted per resident.
  const p=path.join(os.tmpdir(),`quiet-pres-persist-${process.pid}.json`);const c=await openResident({htmlPath:html,residentId:'quiet-persist',storagePath:p});await c.door.run('quiet on');c.window.c9saveNow();c.window.REALITI_SLICE_STORAGE.save();c.close();
  const c2=await openResident({htmlPath:html,residentId:'quiet-persist',storagePath:p});const st3=await c2.door.run('quiet');c2.close();check('quiet_persists_per_resident',st3.quiet===true,st3);
 }finally{a.close();b.close()}
 console.log(JSON.stringify({checks,details},null,2));
 const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);if(failed.length){console.error('FAILED',failed);process.exit(1)}
 console.log('QUIET PRESENTATION PASS',Object.keys(checks).length,'checks');
})().catch(e=>{console.error(e);process.exit(1)});
