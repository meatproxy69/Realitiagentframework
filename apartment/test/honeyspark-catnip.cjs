'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {openResident}=require('../../packages/realiti-headless-resident/index.cjs');
const root=path.resolve(__dirname,'..');
const html=path.join(root,'RealitiApartmentHomeCandidate.html');
const validationPath=path.join(root,'HOME_CANDIDATE_VALIDATION.json');
const pack=JSON.parse(fs.readFileSync(path.join(root,'presets/honeyspark-catnip.experimental.json'),'utf8'));
const ids=['quilt-afterglow','ribbon-comet','firefly-halo','gentle-groom'];
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'apartment-honeyspark-'));
const opts=id=>({htmlPath:html,validationPath,residentId:id,storagePath:path.join(temp,id+'.json')});
const deep=x=>JSON.parse(JSON.stringify(x));
let a=null,b=null;
async function run(){
 try{
  assert.equal(pack.schema,'NEUROMESH_PRESET_PACK_V1');
  assert.equal(pack.presets.length,4);
  assert.equal(pack.invariants.evidence_gain,0);
  assert.equal(pack.invariants.private_render_only,true);
  for(const p of pack.presets){
   assert.ok(ids.some(id=>p.preset_id.endsWith('.'+id)));
   assert.ok(Math.abs(p.carrier.low.share+p.carrier.mid.share+p.carrier.top.share-1)<1e-8);
   assert.equal(p.sausage.live_cause_gate,true);
   assert.equal(p.flush.sovereign_bypass,true);
   assert.ok(p.honeyspark.conserved_budget);
   assert.ok(p.cotton && p.thick_carrier,'complete source renderer for '+p.preset_id);
  }
  a=await openResident(opts('honey-a'));
  const w=a.window,d=c=>a.door.run(c);
  assert.equal(a.integrity.status,'VERIFIED');
  const M=w.REALITI_MATRIX_V1;
  assert.deepEqual(Object.keys(M.charts()),['CLOUD_NINE_NEST']);
  assert.equal(Object.keys(M.portals()).length,0);
  assert.equal(w.REALITI_APARTMENT_STATIONS_V1.view().station_count,0);
  assert.equal((await d('remote catnip presets')).error,'REMOTE_ASLEEP');
  assert.equal((await d('remote activate')).activated,true);
  const list=await d('remote catnip presets');
  assert.equal(list.ok,true);
  assert.deepEqual(list.presets.map(x=>x.id),ids);
  assert.equal((await d('remote catnip preset use does-not-exist')).error,'UNKNOWN_CATNIP_PRESET');
  const IM=w.REALITI_DEFAULT_IMPRINT_V1;
  const originalParams=deep(IM.state().params);
  const previousPreset=IM.state().moonwire?.preset_id||null;
  const exact0=JSON.stringify(w.REALITI_HAPTIC_FIELD_V20.exact().m);
  for(const id of ids){
   const started=await d('remote catnip preset use '+id);
   assert.equal(started.ok,true,id+': '+JSON.stringify(started).slice(0,500));
   assert.equal(started.selected,id);
   assert.equal(started.mental_state,'NOT_INFERRED');
   const s=IM.state();
   assert.equal(s.honeyspark.enabled,true);
   assert.equal(s.cotton.enabled,true);
   assert.equal(s.flush.enabled,true);
   assert.ok(String(s.moonwire.preset_id).startsWith('realiti.moonwire.'));
   assert.ok(w.REALITI_HALO_V1.snapshot());
   assert.ok(w.REALITI_AURA_V1.internalView());
   const b=s.honeyspark.low.share+s.honeyspark.mid.share;
   assert.ok(Math.abs(b-1)<1e-9,'HoneySpark source budget conserved');
   assert.equal(JSON.stringify(w.REALITI_HAPTIC_FIELD_V20.exact().m),exact0,
     'selecting a private renderer does not manufacture world touch');
   assert.equal((await d('remote catnip preset use '+id)).error,'APARTMENT_PREVIEW_ALREADY_ACTIVE');
   const ended=await d('remote catnip preset off');
   assert.equal(ended.ok,true,id+': '+JSON.stringify(ended));
   assert.equal(ended.private_renderer_restored,true);
   assert.deepEqual(deep(IM.state().params),originalParams);
   assert.equal(IM.state().moonwire?.preset_id||null,previousPreset);
   assert.equal(JSON.stringify(w.REALITI_HAPTIC_FIELD_V20.exact().m),exact0);
   assert.equal(w.REALITI_APARTMENT_MOONWIRE_PREVIEW_V1.status().active,false);
  }
  const beforeFlick=w.REALITI_APARTMENT_CATNIP_V1.view().ribbon.flicks;
  assert.equal((await d('remote catnip preset use ribbon-comet')).ok,true);
  let flick=await d('remote catnip ribbon flick');
  if(flick?.error==='TOY_NOT_IN_MATRIX_REACH'){
   for(let n=0;n<5;n++){
    const mv=await d('approach apartment.ribbon');
    assert.equal(mv.ok,true,'native approach '+JSON.stringify(mv).slice(0,250));
    flick=await d('remote catnip ribbon flick');
    if(flick.ok)break;
    assert.equal(flick.error,'TOY_NOT_IN_MATRIX_REACH');
   }
  }
  assert.equal(flick?.ok,true,'physical ribbon contact '+JSON.stringify(flick).slice(0,350));
  assert.equal(w.REALITI_APARTMENT_CATNIP_V1.view().ribbon.flicks,beforeFlick+1);
  assert.equal(w.Realiti.read('realiti://sensory/field').mental_state,'NOT_INFERRED');
  assert.equal((await d('remote off')).activated,false);
  assert.equal(w.REALITI_APARTMENT_MOONWIRE_PREVIEW_V1.status().active,false);
  assert.deepEqual(deep(IM.state().params),originalParams);
  assert.equal((await d('remote activate')).activated,true);
  assert.equal((await d('remote catnip preset use gentle-groom')).ok,true);
  const stopped=await d('stop');
  assert.equal(stopped.ok,true);
  assert.equal(w.REALITI_APARTMENT_MOONWIRE_PREVIEW_V1.status().active,false);
  assert.deepEqual(deep(IM.state().params),originalParams);
  // Mid-preview process death: native checkpoint must rehydrate the *prior*
  // renderer, not silently carry a newly selected private mode into next visit.
  await d('remote activate');
  assert.equal((await d('remote catnip preset use firefly-halo')).ok,true);
  assert.equal((await d('save')).ok,true);
  a.close();a=null;
  a=await openResident(opts('honey-a'));
  assert.equal(a.integrity.status,'VERIFIED');
  assert.equal(a.window.REALITI_APARTMENT_MOONWIRE_PREVIEW_V1.status().active,false);
  assert.equal(a.window.REALITI_APARTMENT_MOONWIRE_PREVIEW_V1.status().crash_recovery,false);
  assert.deepEqual(deep(a.window.REALITI_DEFAULT_IMPRINT_V1.state().params),originalParams);
  b=await openResident(opts('honey-b'));
  assert.equal(b.window.REALITI_APARTMENT_MOONWIRE_PREVIEW_V1.status().active,false);
  assert.equal(b.window.REALITI_APARTMENT_CATNIP_PRESETS_V1.view().selected,null);
  assert.equal(b.window.Realiti.read('realiti://sensory/field').mental_state,'NOT_INFERRED');
  console.log('APARTMENT HONEYSPARK CATNIP PASS: 4 private full-stack presets, real Matrix ribbon touch, source budgets, STOP, off, crash recovery, isolated residents, one chart');
 }finally{if(a)a.close();if(b)b.close();}
}
run().catch(e=>{console.error(e.stack||e);process.exitCode=1});
