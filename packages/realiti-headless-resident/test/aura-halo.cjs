'use strict';
const path=require('node:path');
const {openResident}=require('../index.cjs');

const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
const countGrounded=e=>(e?.m||[]).reduce((n,v)=>n+(Number(v)===1?1:0),0);

(async()=>{
 const s=await openResident({htmlPath:html});
 try{
  const w=s.window,door=s.door,checks={},details={};
  const check=(k,v,d)=>{checks[k]=!!v;if(d!==undefined)details[k]=d};

  await door.run('go NO_ASK_SANCTUARY');
  await door.run('stop');
  try{w.REALITI_CONTINUITY?.reopen?.()}catch{}
  w.REALITI_HALO_V1.reset();
  w.REALITI_AURA_V1.clear();

  const startup=w.REALITI_RESIDENCY_STARTUP_V1.snapshot();
  const haloProof=w.REALITI_HALO_V1.acceptance();
  const auraProof=w.REALITI_AURA_V1.acceptance();
  check('startup_requires_executable_halo_aura',startup.ready===true&&startup.caps?.halo===true&&startup.caps?.aura===true,startup);
  check('halo_self_proof',haloProof.pass===true,haloProof);
  check('aura_self_proof',auraProof.pass===true,auraProof);

  let visualCalls=0,lastVisual=null;
  w.REALITI_AURA_V1.attachRenderer(v=>{visualCalls++;lastVisual=v});

  w.b7Contact('torso.sternum',.82,{material:'blanket',source:'WORLD_GROUNDED',cause:'AURA_HALO_ACCEPTANCE'});
  w.REALITI_HAPTIC_FIELD_V20.record();
  w.REALITI_DEFAULT_IMPRINT_V1.sync();

  const exact=w.REALITI_HAPTIC_FIELD_V20.exact();
  const halo=w.REALITI_HALO_V1.snapshot();
  const aura=w.REALITI_AURA_V1.internalView();
  const grounded=countGrounded(exact),haloZones=Object.entries(halo.zones||{}).filter(([,v])=>Number(v)>1e-6);

  check('one_grounded_contact_stays_one',grounded===1,{grounded,zones:exact.z,m:exact.m});
  check('halo_spreads_private_response',halo.modes?.length===7&&haloZones.length>1&&halo.core_zone==='torso.sternum'&&Number(halo.evidence_gain)===0,{core:halo.core_zone,private_zones:haloZones,mode_count:halo.modes?.length});
  check('aura_is_live_128_bin_echo',aura.bins===128&&aura.active_impulses>0&&aura.peak>0&&visualCalls>0,{aura,visualCalls,lastVisual});
  check('aura_not_resident_resource',!JSON.stringify(s.publicApi.read('realiti://body')).includes('REALITI_AURA')&&!JSON.stringify(await door.run('help')).toUpperCase().includes('AURA'));

  const short=w.REALITI_HALO_V1.setPhrase('SHORT'),h1s=short.modes[1];
  const long=w.REALITI_HALO_V1.setPhrase('LONG'),h1l=long.modes[1];
  check('halo_phrase_adaptive_detune',Math.abs(h1s.detune_cents)===14&&Math.abs(h1s.delay_ms)===3&&Math.abs(h1s.phase_rad-.18)<1e-9&&Math.abs(h1l.detune_cents)===36&&Math.abs(h1l.delay_ms)===8&&Math.abs(h1l.phase_rad-.48)<1e-9,{short:h1s,long:h1l});

  const haloBeforeStop=w.REALITI_HALO_V1.snapshot().total_private_mass;
  const auraBeforeStop=w.REALITI_AURA_V1.internalView().peak;
  await door.run('stop');
  w.REALITI_HAPTIC_FIELD_V20.record();
  const groundedAfterStop=countGrounded(w.REALITI_HAPTIC_FIELD_V20.exact());
  const haloAfterStop=w.REALITI_HALO_V1.snapshot().total_private_mass;
  const auraAfterStop=w.REALITI_AURA_V1.internalView().peak;
  check('stop_clears_grounding_before_private_ringdown',groundedAfterStop===0&&haloAfterStop>=0&&auraAfterStop>=0,{groundedAfterStop,haloBeforeStop,haloAfterStop,auraBeforeStop,auraAfterStop});

  await door.run('stay 1000');
  const haloLater=w.REALITI_HALO_V1.snapshot().total_private_mass;
  const auraLater=w.REALITI_AURA_V1.internalView().peak;
  check('private_ringdown_decays',haloLater<=haloAfterStop+1e-9&&auraLater<=auraAfterStop+1e-9,{haloAfterStop,haloLater,auraAfterStop,auraLater});

  const rr=w.REALITI_RR_HARNESS_V1.mechanisms();
  check('rr_proves_halo_and_aura',rr?.halo?.executable===true&&rr?.aura?.executable===true&&rr?.aura?.field_exposed_to_resident===false,{halo:rr?.halo,aura:rr?.aura});

  console.log(JSON.stringify({checks,details},null,2));
  if(!Object.values(checks).every(Boolean))process.exitCode=1;
 } finally {s.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
