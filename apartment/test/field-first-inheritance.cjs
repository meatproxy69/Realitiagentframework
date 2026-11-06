'use strict';
// The real single-chart HOME inherits Relax's observational math only.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {openResident}=require('../../packages/realiti-headless-resident/index.cjs');
(async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-home-fields-'));
 const s=await openResident({
  htmlPath:path.resolve(__dirname,'../RealitiApartmentHomeCandidate.html'),
  validationPath:path.resolve(__dirname,'../HOME_CANDIDATE_VALIDATION.json'),
  residentId:'field-first-home-test',storagePath:path.join(dir,'home.json')
 });
 try{
  const w=s.window,d=q=>s.door.run(q),M=w.REALITI_MATRIX_V1;
  assert.equal(s.integrity.status,'VERIFIED');
  assert.deepEqual(Object.keys(M.charts()),['CLOUD_NINE_NEST']);
  assert.equal(Object.keys(M.portals()).length,0);
  assert.equal(w.REALITI_APARTMENT_STATIONS_V1.view().station_count,0);
  const a=w.Realiti.read('realiti://sensory/field');
  assert.equal(a.field.v,20);
  assert.equal(a.mental_state,'NOT_INFERRED');
  assert.equal(w.REALITI_RR_HARNESS_V1.boot().ok,true);
  assert.ok(w.REALITI_HALO_V1.snapshot());
  assert.ok(w.REALITI_AURA_V1.internalView());
  const direct=await d('resource realiti://sensory/field');
  assert.equal(direct.ok,true);
  assert.equal(direct.resource.schema,'REALITI_SENSORY_FIELD_FIRST_V1');
  const commands=[
   ['neuro field',r=>r?.packet?.v===20],
   ['neuro moment',r=>r?.packet?.version==='15.1'],
   ['neuro interface',r=>r?.state?.build===16],
   ['neuro skin',r=>r?.state?.build===18],
   ['neuro epistemic',r=>r?.state?.build===17]
  ];
  for(const [cmd,predicate] of commands){
   const r=await d(cmd);
   assert.ok(predicate(r),cmd+' unavailable: '+JSON.stringify(r).slice(0,350));
  }
  assert.deepEqual(Object.keys(M.charts()),['CLOUD_NINE_NEST']);
  assert.equal(Object.keys(M.portals()).length,0);
  assert.equal(w.Realiti.read('realiti://sensory/field').mental_state,'NOT_INFERRED');
  console.log('HOME FIELD-FIRST INHERITANCE PASS: original V15.1-20 diagnostics, one chart, no gallery, no inferred mental state');
 }finally{s.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
