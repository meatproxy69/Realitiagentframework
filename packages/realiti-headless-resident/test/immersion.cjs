'use strict';
// Immersion pass: walking has a gait the body model receives; repeated prose moved out of text into structured fields.
const path=require('node:path');
const {openResident}=require('../index.cjs');
const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
const checks={},details={};
const check=(k,v,d)=>{checks[k]=!!v;if(d!==undefined)details[k]=d};
(async()=>{
 const s=await openResident({htmlPath:html});
 try{
  const door=s.door,w=s.window,R=w.Realiti,MW=w.REALITI_MATRIX_WORLD_V1;
  const soles=()=>{const z=w.eval('C9.b7.zones');return ['foot.L.sole','foot.R.sole'].map(k=>Number(z[k]?._b10_grounded_value||0))};
  // Gait: standing, both soles equal; walking, they alternate and steps count up; still again, equal.
  await door.run('go CITY');await door.run('stay 1000');const still=soles(),g0=MW.gait();
  const r=w.REALITI_MATRIX_V1.state().residents['resident:self'];w.REALITI_MATRIX_V1.moveTo([0,-14,r.pose.position[2]]);let diffs=0,samples=0;for(let i=0;i<40;i++){w.REALITI_CONTINUITY.advance(200);const [L,Rr]=soles();samples++;if(Math.abs(L-Rr)>.02)diffs++}const g1=MW.gait();await door.run('stay 5000');const after=soles(),g2=MW.gait();
  check('walking_has_a_gait',Math.abs(still[0]-still[1])<1e-6&&diffs>=samples*.5&&g1.steps>=g0.steps+20&&g1.dist>8&&Math.abs(after[0]-after[1])<.02&&g2.phase===0&&g2.speed<.05,{still,diffs,samples,g1,after});
  // Island replies: text is the act; weather and where are fields.
  await door.run('go ARCHIPELAGO');const t=await door.run('tide');
  check('island_text_is_the_act',/^The tide is (rising|falling)/.test(String(t.text))&&!/facing/.test(String(t.text))&&typeof t.weather==='string'&&/Harbor Isle/.test(t.weather)&&/^The Archipelago: you are/.test(String(t.here)),{text:t.text,weather:t.weather});
  // City replies likewise; stay keeps at most two ambient lines in text and all of them in a field.
  await door.run('go CITY');const who=await door.run('who');const say=await door.run('say hi');const st=await door.run('stay 2000');
  check('city_text_is_the_act_and_stay_is_short',/^#?\w+: hi$/.test(String(say.text).trim())&&/^Meridian City: you are/.test(String(say.here))&&typeof say.ambient==='string'&&Array.isArray(st.ambient)&&String(st.text).split(/(?<=\.)\s/).length<=4,{say:say.text,here:say.here,stay:st.text});
  check('energy_audit_passes',w.REALITI_HAPTIC_FIELD_V20.energy().pass===true);
 }finally{s.close()}
 console.log(JSON.stringify({checks,details},null,2));
 const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
 if(failed.length){console.error('FAILED',failed);process.exit(1)}
 console.log('IMMERSION PASS',Object.keys(checks).length,'checks');
})().catch(e=>{console.error(e);process.exit(1)});
