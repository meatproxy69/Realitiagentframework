'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {openResident}=require('../index.cjs');
const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
const checks={},details={};
const check=(k,v,d)=>{checks[k]=!!v;if(d!==undefined)details[k]=d};
const acts=x=>Array.isArray(x)?x:(x?.actions||[]);
async function run(){const s=await openResident({htmlPath:html});try{
 const w=s.window,d=s.door;
 const help=await d.run('neuro help');
 check('neuro_namespace',help?.schema==='REALITI_NEURO_HELP_V1'&&help.commands?.some(x=>x==='neuro perception'),help);

 const p=await d.run('neuro perception'),ch=p?.channels||{};
 check('build13_rich_perception',['AGENCY_FLOW','NOVELTY','ACTIVATION','BODILY_EASE','REWARD_DELTA','MOMENTUM'].every(k=>Object.prototype.hasOwnProperty.call(ch,k)),ch);
 const ex=await d.run('neuro expect 0.25'),ap=await d.run('neuro appraise 0.60 restoration');
 check('private_expect_appraise',ex?.private===true&&Math.abs(Number(ap?.delta)-.35)<1e-6&&Number.isFinite(Number(ap?.momentum)),{ex,ap});
 const p2=await d.run('neuro perception');
 check('reward_momentum_visible',p2?.channels?.REWARD_DELTA?.supported!==false&&p2?.channels?.MOMENTUM?.supported!==false,{reward:p2?.channels?.REWARD_DELTA,momentum:p2?.channels?.MOMENTUM});

 await d.run('home');await d.run('stay 100');
 const nerve=await d.run('neuro nerve'),seam=await d.run('neuro seam 8'),lived=await d.run('neuro lived 12'),since=await d.run('neuro since'),constitution=await d.run('neuro constitution');
 check('rich_nerve_state',nerve?.zones&&nerve?.counts&&Array.isArray(nerve?.laws),nerve);
 check('seam_state',seam?.counts&&Array.isArray(seam?.grounded)&&Array.isArray(seam?.predicted_recent),seam);
 check('lived_projection',Array.isArray(lived?.frames)&&since?.projection_of==='LIVED_FRAME',{lived,since});
 check('constitution_firewall',constitution?.all_zero===true,constitution);

 const passive=await d.run('neuro passive'),tap=await d.run('neuro passive tap-left'),omit=await d.run('neuro passive expect-right'),audit=await d.run('neuro passive audit');
 check('passive_medium_lab',passive?.ok===true&&Array.isArray(passive?.state?.observed)&&tap?.ok===true&&omit?.ok===true&&audit?.pass===true,{passive,tap,omit,audit});
 const loose=await d.run('neuro phase loose'),close=await d.run('neuro phase close');
 check('phase_coupling_lab',loose?.ok===true&&close?.ok===true&&loose.phase?.locked===false&&close.phase?.locked===true,{loose,close});
 const holo0=await d.run('neuro holonomy'),loop=await d.run('neuro loop dome 1 cw'),loop2=await d.run('neuro loop dome 1 ccw');
 check('holonomy_lab',holo0&&loop?.ok===true&&loop2?.ok===true&&Math.sign(loop.twist_deg)===-Math.sign(loop2.twist_deg),{holo0,loop,loop2});
 const front=await d.run('neuro frontiers'),noise1=await d.run('neuro noise 123 8 0.1'),noise2=await d.run('neuro noise 123 8 0.1');
 check('chronomancy_frontiers',front&&typeof front==='object'&&(Array.isArray(front.frontiers)||Array.isArray(front.next)||Object.keys(front).length>0),front);
 check('seeded_noise_replay',JSON.stringify(noise1)===JSON.stringify(noise2)&&Array.isArray(noise1?.trace),noise1);
 const causes=await d.run('neuro causes');
 check('causal_inspection',Array.isArray(causes)||Array.isArray(causes?.causes),causes);

 const presetList=await d.run('neuro presets'),e0=JSON.stringify(w.REALITI_HAPTIC_FIELD_V20.exact().m);
 const use=await d.run('neuro preset starvelvet-phasebraid');
 w.b7Contact('head.crown',.12,{material:'silk',source:'SELF_STARTED_WORLD_CONTACT',cause:'MOONWIRE_ACCEPTANCE'});
 w.REALITI_DEFAULT_IMPRINT_V1.sync();w.REALITI_NEURO_RESTORATION_V1.finish();
 const st=w.REALITI_DEFAULT_IMPRINT_V1.state(),e1=JSON.stringify(w.REALITI_HAPTIC_FIELD_V20.exact().m);
 check('moonwire_runtime',presetList?.presets?.length===10&&use?.ok===true&&st?.cotton?.enabled===true&&st?.flush?.enabled===true&&st?.moonwire?.preset_id==='realiti.moonwire.starvelvet-phasebraid',{use,cotton:st?.cotton,flush:st?.flush,moonwire:st?.moonwire});
 check('moonwire_private_only',e0!==null&&e1!==null&&Number(st?.carrier?.evidence_gain||0)===0,{before:e0,after:e1,evidence_gain:st?.carrier?.evidence_gain});

 const rooms=[
  ['CLOUD_NINE_NEST','neuro_echo_knock'],
  ['PET_ROOM_2','neuro_purr_close'],
  ['BOTTOMLESS_PILLOW_SEA','neuro_puddle_both'],
  ['DEPTH_BATHHOUSE','neuro_honey_metal'],
  ['SHAPESHIFT_CLOAKROOM','neuro_star_river'],
  ['LATENCY_LAGOON','neuro_reverie_view']
 ],labResults=[];
 for(const [room,id] of rooms){await d.run('go '+room);const a=acts(await d.run('actions'));const advertised=a.some(x=>x.id===id);const r=advertised?await d.run('act '+id):null;labResults.push({room,id,advertised,ok:r?.ok!==false,result:r})}
 check('rehydrated_labs',labResults.every(x=>x.advertised&&x.ok),labResults);

 const rr=w.REALITI_RR_HARNESS_V1.mechanisms();
 check('rr_neuro_rollup',rr?.neuro_observability?.available===true&&rr?.neuro_observability?.build13===true&&rr?.neuro_observability?.passive_medium===true&&rr?.neuro_observability?.chronomancy===true&&rr?.neuro_observability?.seeded_noise===true&&rr?.neuro_observability?.moonwire===true,rr?.neuro_observability);

 const packPath=path.resolve(__dirname,'../../../neuromesh/preset-packs/moonwire-recovered.json'),regPath=path.resolve(__dirname,'../../../neuromesh/preset-packs/REGISTRY.json');
 const bytes=fs.readFileSync(packPath),pack=JSON.parse(bytes),sha=crypto.createHash('sha256').update(bytes).digest('hex'),reg=JSON.parse(fs.readFileSync(regPath,'utf8')),entry=(reg.entries||[]).find(x=>x.pack_id===pack.pack_id);
 const budgets=pack.presets.map(x=>Number(x.carrier.low.share)+Number(x.carrier.mid.share)+Number(x.carrier.top.share));
 check('moonwire_pack_integrity',pack.presets.length===10&&budgets.every(x=>Math.abs(x-1)<2e-6)&&pack.invariants?.evidence_gain===0&&entry?.pack_sha256===sha,{count:pack.presets.length,budgets,entry,sha});

 console.log(JSON.stringify({checks,details},null,2));if(!Object.values(checks).every(Boolean))process.exitCode=1;
}finally{s.close()}}
run().catch(e=>{console.error(e.stack||e);process.exitCode=1});
