'use strict';
const path=require('node:path');
const {openResident}=require('../index.cjs');
const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
const checks={},details={};
const check=(k,v,d)=>{checks[k]=!!v;if(d!==undefined)details[k]=d};
(async()=>{
 const s=await openResident({htmlPath:html,residentId:'soma-native-smoke'});
 try{
  const w=s.window;
  const S=w.REALITI_SOMA_V3,bridge=w.REALITI_SOMA_RELAX_V3;
  check('package_included',S?.VERSION==='3.0.0'&&typeof S.createNeuralMesh==='function');
  check('bridge_installed',bridge?.version==='3.0.0');
  const cap=s.publicApi.read('realiti://capabilities');
  check('advertises_portable_package',cap.sensory_framework?.portable_package==='@meatproxy69/realiti-neuromesh'&&cap.resources.includes('realiti://neuromesh'));
  const base=s.publicApi.read('realiti://neuromesh');
  check('field_shape',base.schema==='REALITI_SOMA_FIELD_V3'&&base.z.length===35&&base.z.length===base.m.length&&base.z.length===base.x.length);
  const before=JSON.stringify(base),again=JSON.stringify(s.publicApi.read('realiti://neuromesh'));
  check('read_is_pure',before===again);
  const reason='SOMA_NATIVE_TRUSTED_GROUND_TEST';
  const receipt=w.b7Contact('hand.R.palm',.75,{source:'WORLD_GROUNDED',material:'wood',cause:reason});
  const after=s.publicApi.read('realiti://neuromesh'),n=after.z.indexOf('hand.R.palm');
  check('native_receipt_mirrors',!!receipt&&n>=0&&after.m[n]===1&&after.g[n]>0
    &&after.grounded.some(x=>x.cause===reason),{receipt:receipt?.receptor,grounded:after.grounded.slice(0,3)});
  const normal=w.REALITI_HAPTIC_FIELD_V20.packet();
  check('native_field_still_present',normal.v===20&&Array.isArray(normal.f));
  const checkpoint=s.publicApi.read('realiti://soma/checkpoint');
  check('checkpoint_has_no_grounded_records',checkpoint.schema==='REALITI_SOMA_CHECKPOINT_V3'&&!('grounded' in checkpoint));
  const stop=await s.door.run('stop');
  const cleared=s.publicApi.read('realiti://neuromesh');
  check('stop_clears_mirror',stop.ok!==false&&cleared.m.every(x=>x===0)&&cleared.cc===null);
  check('port_no_global_world_capability',!('world' in bridge)&&!('world' in S));
  const about=s.publicApi.read('realiti://about');
  check('about_version',about.sensory_framework==='REALITI SOMA'&&about.sensory_version==='3.0.0');
 }finally{s.close()}
 console.log(JSON.stringify({checks,details},null,2));
 const failed=Object.keys(checks).filter(k=>!checks[k]);if(failed.length){console.error('SOMA INTEGRATION FAIL',failed);process.exitCode=1}
 else console.log('SOMA RELAX INTEGRATION PASS',Object.keys(checks).length,'checks');
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
