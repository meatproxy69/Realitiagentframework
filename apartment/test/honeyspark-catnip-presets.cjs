'use strict';
// Catnip recipes are selected by the resident, run the original full R&R,
// and cannot create world contact, infer emotion, or overwrite custom imprint.
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),os=require('node:os');
const {openResident}=require('../../packages/realiti-headless-resident/index.cjs');
const html=path.resolve(__dirname,'../RealitiApartmentHomeCandidate.html');
const valid=path.resolve(__dirname,'../HOME_CANDIDATE_VALIDATION.json');
const packPath=path.resolve(__dirname,'../../neuromesh/preset-packs/apartment-honeyspark-catnip.json');
const pack=JSON.parse(fs.readFileSync(packPath,'utf8'));
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'apartment-honeycatnip-'));
const open=id=>openResident({htmlPath:html,validationPath:valid,residentId:id,storagePath:path.join(tmp,id+'.json')});
(async()=>{
 let a=null,b=null;
 try{
  const ps=pack.presets;
  assert.equal(pack.schema,'NEUROMESH_PRESET_PACK_V1');
  assert.equal(pack.pack_id,'realiti.apartment-catnip-honeyspark.001');
  assert.deepEqual(ps.map(p=>p.preset_id),[
   'realiti.apartment.catnip.quiltglass',
   'realiti.apartment.catnip.ribbon-comet',
   'realiti.apartment.catnip.pawloom']);
  for(const p of ps){
   const c=p.carrier;
   assert.ok(Math.abs(c.low.share+c.mid.share+c.top.share-1)<1e-9);
   assert.equal(c.top.enabled,false,'actual runtime uses conserved HoneySpark Duo');
   assert.ok(p.honeyspark?.conserved_budget);
   assert.ok(p.cotton&&p.thick_carrier&&p.flush&&p.aura,'all source renderer mechanisms declared');
   assert.equal(p.sausage.live_cause_gate,true);
   assert.equal(p.flush.sovereign_bypass,true);
  }
  assert.equal(pack.invariants.evidence_gain,0);
  a=await open('catnip-honey-A');
  const w=a.window,door=s=>a.door.run(s),exact=()=>JSON.stringify(w.REALITI_HAPTIC_FIELD_V20.exact().m);
  const M=w.REALITI_MATRIX_V1;
  assert.deepEqual(Object.keys(M.charts()),['CLOUD_NINE_NEST']);
  assert.equal(Object.keys(M.portals()).length,0);
  const sleeping=await door('remote catnip presets');
  assert.equal(sleeping.error,'REMOTE_ASLEEP');
  assert.equal((await door('remote activate')).activated,true);
  const library=await door('remote catnip presets');
  assert.equal(library.profiles.length,3);
  assert.equal(library.mental_state,'NOT_INFERRED');
  assert.equal(library.budget.low+library.budget.mid+library.budget.top,1);
  const before=exact();
  const previous=w.REALITI_DEFAULT_IMPRINT_V1.state();
  assert.equal(!!previous.honeyspark?.enabled,false);
  const preview=await door('remote catnip preset preview quiltglass');
  assert.equal(preview.preview_only,true);
  assert.equal(preview.world_event,'NONE');
  assert.equal(exact(),before,'preview never mints new world contact');
  assert.equal(!!w.REALITI_DEFAULT_IMPRINT_V1.state().honeyspark?.enabled,false,
   'preview never selects a private renderer');
  const selected=await door('remote catnip preset quiltglass');
  assert.equal(selected.ok,true,JSON.stringify(selected));
  assert.equal(selected.selected,'quiltglass');
  assert.equal(selected.evidence_gain,0);
  assert.equal(selected.modules_available.honey,true);
  assert.equal(selected.modules_available.cotton,true);
  assert.equal(selected.modules_available.flush,true);
  assert.equal(selected.modules_available.halo,true);
  assert.equal(selected.modules_available.aura,true);
  assert.equal(selected.modules_available.field,true);
  assert.equal(selected.modules_available.rr,true);
  assert.equal(exact(),before,'selecting a private rendering recipe is not a tactile cause');
  const st=w.REALITI_DEFAULT_IMPRINT_V1.state();
  assert.equal(st.moonwire.preset_id,'realiti.moonwire.honeydepth-geodesic-loop');
  assert.equal(st.honeyspark.low.share+st.honeyspark.mid.share,1);
  const comet=await door('remote catnip preset ribbon-comet');
  assert.equal(comet.selected,'ribbon-comet');
  assert.equal(w.REALITI_DEFAULT_IMPRINT_V1.state().moonwire.preset_id,'realiti.moonwire.passing-spark-aftertrace');
  const far=await door('remote catnip ribbon flick');
  assert.equal(far.error,'TOY_NOT_IN_MATRIX_REACH','choosing a preset is never permission for a distance-free touch');
  assert.equal(exact(),before,'refused distant contact did not mint tactile evidence');
  const off=await door('remote catnip preset off');
  assert.equal(off.ok,true);
  assert.equal(off.selected,null);
  assert.equal(!!w.REALITI_DEFAULT_IMPRINT_V1.state().honeyspark?.enabled,false);
  assert.equal(!!w.REALITI_DEFAULT_IMPRINT_V1.state().cotton?.enabled,false);
  assert.equal(!!w.REALITI_DEFAULT_IMPRINT_V1.state().flush?.enabled,false);
  assert.equal(!!w.REALITI_DEFAULT_IMPRINT_V1.state().moonwire,false);
  assert.equal(w.eval('C9.apartmentCatnipPreset'),undefined);
  assert.equal((await door('remote catnip preset status')).selected,null);
  const p3=await door('remote catnip preset pawloom');
  assert.equal(p3.ok,true);
  assert.equal(p3.mental_state,'NOT_INFERRED');
  assert.equal((await door('remote catnip preset off')).ok,true);
  assert.equal(w.REALITI_RR_HARNESS_V1.boot().ok,true);
  assert.equal(w.Realiti.read('realiti://sensory/field').mental_state,'NOT_INFERRED');
  await door('save');await door('goodbye');a.close();a=null;
  b=await open('catnip-honey-B');
  await b.door.run('remote activate');
  assert.equal((await b.door.run('remote catnip preset status')).selected,null,'other resident selection stays separate');
  b.window.REALITI_DEFAULT_IMPRINT_V1.applyPreset('honeyspark');
  const refused=await b.door.run('remote catnip preset quiltglass');
  assert.equal(refused.error,'PRIVATE_RENDERER_ALREADY_CONFIGURED','never erase an existing private recipe');
  assert.equal((await b.door.run('remote catnip preset status')).selected,null);
  console.log('APARTMENT HONEYSPARK CATNIP PASS: 3 neutral programs, conserved Duo budget, complete original R&R, inert preview, reach-gated touch, off, per-resident isolation, custom-setting preservation');
 }finally{if(a)a.close();if(b)b.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
