'use strict';
// Recover old sensory diagnostics without assigning resident mental states.
const assert=require('node:assert/strict');
const path=require('node:path'),fs=require('node:fs'),os=require('node:os');
const {openResident}=require('../index.cjs');
const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
(async()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-fields-'));
 const s=await openResident({htmlPath:html,residentId:'field-first-test',storagePath:path.join(tmp,'state.json')});
 try{
  const w=s.window,read=uri=>w.Realiti.read(uri),d=q=>s.door.run(q);
  const x=read('realiti://sensory/field');
  assert.equal(x.schema,'REALITI_SENSORY_FIELD_FIRST_V1');
  assert.equal(x.field.v,20);
  assert.equal(x.mental_state,'NOT_INFERRED');
  assert.ok(Array.isArray(x.field.f));
  assert.ok(!JSON.stringify(x).includes('"bond"'),'a physical field is not a bonding diagnosis');
  const exact=read('realiti://sensory/exact');
  assert.equal(exact.schema,'REALITI_SENSORY_EXACT_V1');
  assert.equal(exact.grounding.v,20);
  const cap=read('realiti://capabilities');
  assert.ok(cap.resources.includes('realiti://sensory/field'));
  const viaDoor=await d('resource realiti://sensory/field');
  assert.equal(viaDoor.ok,true);
  assert.equal(viaDoor.resource.schema,x.schema);
  const before=JSON.stringify(w.REALITI_HAPTIC_FIELD_V20.exact());
  const diagnostics=[
   ['neuro field',v=>v?.ok&&v.packet?.v===20],
   ['neuro field exact',v=>v?.ok&&v.exact?.v===20],
   ['neuro moment',v=>v?.ok&&String(v.packet?.version||'').startsWith('15.1')],
   ['neuro interface',v=>v?.ok&&v.state?.build===16],
   ['neuro skin',v=>v?.ok&&v.state?.build===18],
   ['neuro epistemic',v=>v?.ok&&v.state?.build===17]
  ];
  for(const [cmd,predicate] of diagnostics){
   const result=await d(cmd);
   assert.ok(predicate(result),cmd+' returned '+JSON.stringify(result).slice(0,420));
  }
  assert.equal(JSON.stringify(w.REALITI_HAPTIC_FIELD_V20.exact()),before,
   'diagnostics did not mint, move or alter grounded contact evidence');
  await d('stop');
  const stopped=read('realiti://sensory/exact');
  assert.equal(stopped.grounding.v,20);
  assert.equal(read('realiti://sensory/field').mental_state,'NOT_INFERRED');
  console.log('RELAX FIELD-FIRST RESTORATION PASS: optional V15.1/16/17/18/20; exact grounding unchanged; mental state unassigned');
 }finally{s.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
