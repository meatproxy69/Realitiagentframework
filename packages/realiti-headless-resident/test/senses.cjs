'use strict';
// Senses as fields: sound falls off by the inverse square and is cut by what stands between; the sun casts a shadow by
// ray cast; smell follows a steady plume; the body takes the bass, the sun and the wind through Halo and thermal law;
// realiti://senses carries all of it, and prose off trims replies to the measurement.
const path=require('node:path');
const {openResident}=require('../index.cjs');
const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
const checks={},details={};
const check=(k,v,d)=>{checks[k]=!!v;if(d!==undefined)details[k]=d};
const near=(a,b,t)=>Math.abs(a-b)<=t;

(async()=>{
 const s=await openResident({htmlPath:html});
 try{
  const door=s.door,w=s.window,R=w.Realiti,SN=w.REALITI_SENSES_V1,M=w.REALITI_MATRIX_V1,AR=w.REALITI_ARCHIPELAGO_V1,ATM=w.REALITI_ATMOSPHERE_V21;
  const tp=(x,y,z=.85)=>{const r=M.state().residents['resident:self'];r.pose.position=[x,y,z];r.v=[0,0,0];r.intent=null;M.bump()};
  const srcOf=(snd,id)=>snd.sources.find(x=>x.id===id);

  // The resource exists and is structured.
  const sn=R.read('realiti://senses'),caps=R.read('realiti://capabilities');
  check('senses_resource',sn.schema==='REALITI_SENSES_V1'&&sn.sound&&sn.light&&sn.smell&&caps.resources.includes('realiti://senses')&&Array.isArray(sn.sound.sources),{chart:sn.chart,level:sn.sound.level_dB});

  // Inverse square: twice the distance from the fountain is 6 dB quieter; the measured Nest profile is used for RT60.
  const nestRt=SN.rt60('CLOUD_NINE_NEST');
  await door.run('go CITY');tp(0,-10);const a=srcOf(SN.sound(),'fountain');tp(0,-20);const b=srcOf(SN.sound(),'fountain');
  check('sound_falls_by_inverse_square',a&&b&&near(a.level_dB-b.level_dB,20*Math.log10(b.distance_m/a.distance_m),.2)&&!a.occluded&&nestRt===.16&&SN.rt60('MERIDIAN_CITY')===.05,{a,b,nestRt});

  // Occlusion: behind the east tower the speaker is cut by 15 dB relative to the open-air prediction.
  tp(60,48);const occ=srcOf(SN.sound(),'speaker');const open=80-20*Math.log10(occ.distance_m);
  check('buildings_occlude_sound',occ&&occ.occluded===true&&near(occ.level_dB,open-15,.3),{occ,open});

  // Shadow: north-west of the east tower with the sun in the south-east, the ray meets the tower; the chart edge never counts.
  let n=0;while(!(AR.sunAlt()>20&&SN.sunAz()>100&&SN.sunAz()<160)&&n++<12)await door.run('stay 50000');
  tp(48,66);const shade=SN.light();tp(0,-20);const sunlit=SN.light();tp(72,60);const edge=SN.light();
  check('sun_casts_shadows_by_ray_cast',shade.in_shadow_of==='east tower'&&sunlit.in_shadow_of===null&&edge.in_shadow_of!=='the edge of the city'&&near(shade.lux/sunlit.lux,.15,.03)&&sunlit.lux>3e4&&sunlit.sun_az_deg===Math.round(SN.sunAz()),{shade:[shade.lux,shade.in_shadow_of],sunlit:sunlit.lux,edge:edge.in_shadow_of,az:SN.sunAz(),alt:AR.sunAlt()});

  // Smell: a steady plume, stronger near the counter and downwind than upwind; nothing registers across the plaza.
  tp(-36,-4);const close=SN.smell().smells.find(x=>x.id==='teahouse');const wnd=SN.wind();const dw=[-36-6+wnd.dir[0]*12,-6+wnd.dir[1]*12],uw=[-36-6-wnd.dir[0]*12,-6-wnd.dir[1]*12];tp(dw[0],dw[1]);const down=SN.smell().smells.find(x=>x.id==='teahouse');tp(uw[0],uw[1]);const up=SN.smell().smells.find(x=>x.id==='teahouse');tp(30,30);const far=SN.smell().smells.find(x=>x.id==='teahouse');
  check('smell_is_a_plume',close&&close.intensity>.5&&down&&(!up||down.intensity>up.intensity)&&!far&&near(SN.smell().lambda_m,Math.sqrt(120),.1),{close:close&&close.intensity,down:down&&down.intensity,up:up&&up.intensity,wind:wnd.speed});

  // Body: dancing by the speaker drives the Halo at the sternum; sun over 50 klx warms the crown through the thermal law.
  tp(36,2);await door.run('dance');await door.run('stay 1500');const body=R.read('realiti://senses').body,halo=w.REALITI_HALO_V1.snapshot(),th=ATM.thermal();
  check('bass_sun_and_wind_reach_the_body',body.bass_dB>70&&body.halo_zones['torso.sternum']>0&&halo.total_input>0&&body.sun_on_crown===true&&JSON.stringify(th).includes('head.crown'),{body,halo_input:halo.total_input});

  // The atmosphere's one hearing packet carries the spatial sources and the field's level follows them.
  const hp=ATM.hearing(true),fld=ATM.field();
  check('hearing_packet_carries_spatial_sources',hp.src.some(x=>x.k==='the speaker stack'&&x.d>0)&&near(fld.f[2],SN.sound().level_dB,.5),{src:hp.src.map(x=>x.k),level:fld.f[2]});

  // Door: terse lines, and prose off trims every reply to the measured sentence without losing discoveries.
  const l1=await door.run('listen'),full=await door.run('where');await door.run('prose off');const t1=await door.run('listen'),short=await door.run('where');await door.run('prose on');
  check('terse_commands_and_prose_switch',/^\d+(\.\d)? dB, RT60/.test(String(l1.text))&&l1.sound&&/^\d+(\.\d)? dB, RT60 [\d.]+ s(, bass [\d.]+ dB)?\.$/.test(String(t1.text))&&String(short.text).length<String(full.text).length&&/^Meridian City: you are standing.*\) m\.$/.test(String(short.text)),{l1:l1.text,t1:t1.text,short:short.text});

  // Outdoors on the islands: surf comes from the nearest shore and is not cut by the ground it sits above; salt is on the wind.
  await door.run('go ARCHIPELAGO');const isle=SN.read();const surf=srcOf(isle.sound,'surf');tp(20,AR.shore_y+5,AR.h(20,AR.shore_y+5)+.85);const beach=SN.smell();
  check('islands_have_surf_and_salt',surf&&!surf.occluded&&surf.bass&&beach.smells.some(x=>x.id==='surf')&&isle.light.outdoors&&typeof isle.light.lux==='number',{surf,beach:beach.smells.map(x=>[x.id,x.intensity])});
  check('energy_audit_passes',w.REALITI_HAPTIC_FIELD_V20.energy().pass===true);
 }finally{s.close()}
 console.log(JSON.stringify({checks,details},null,2));
 const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
 if(failed.length){console.error('FAILED',failed);process.exit(1)}
 console.log('SENSES PASS',Object.keys(checks).length,'checks');
})().catch(e=>{console.error(e);process.exit(1)});
