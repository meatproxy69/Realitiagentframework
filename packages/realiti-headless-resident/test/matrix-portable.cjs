'use strict';
const path=require('node:path');
const {openResident}=require('../index.cjs');
const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
const checks={},detail={};
const check=(k,v,d)=>{checks[k]=!!v;if(d!=null)detail[k]=d};
(async()=>{
const s=await openResident({htmlPath:html,residentId:'matrix-portable-relax-check'});
try{
 const w=s.window,native=w.REALITI_MATRIX_V1,portable=w.REALITI_MATRIX_PORTABLE_V1;
 check('native_matrix_untouched',!!native&&typeof native.step==='function'&&typeof native.raycast==='function');
 check('portable_world_present',portable?.VERSION==='1.0.0'&&typeof portable.createMatrix==='function');
 const world=portable.createMatrix({worldId:'MATRIX_COMPAT_TEST',sessionId:'unit-visit',actorId:'test-avatar'});
 world.host.defineChart('TEST',{bounds:{center:[0,0,1],halfExtents:[8,8,3]},
  spawn:{position:[0,0,.85]}});
 world.host.addEntity({id:'near-solid',chart:'TEST',position:[1.2,0,.5],
  shape:{kind:'BOX',halfExtents:[.4,.4,.35]},collision:true,material:'pine'});
 world.host.enter('TEST');
 const res=world.host.contact({objectId:'near-solid',zone:'hand.R.palm',
  causeId:'REAL_TEST_TOUCH',leaseMs:500,intensity:.7});
 check('resolver_returns_host_authored_result',res.kind==='CONTACT_ACCEPTED'&&res.result==='ACCEPTED');
 const consumed=world.host.takeResolution(res);
 check('one_time_resolution',consumed.kind==='CONTACT_ACCEPTED');
 let refused=false;try{world.host.takeResolution(res)}catch(e){refused=/UNAUTHORED/.test(String(e.message))}
 check('resolution_consume_only_once',refused);
 const here=world.observer.view();
 check('separate_world_scope',here.worldId==='MATRIX_COMPAT_TEST'&&here.frame.chart==='TEST');
 check('somatic_harness_preserved',w.REALITI_SOMA_V3?.VERSION==='3.2.0'&&
  w.REALITI_SOMA_RELAX_V3?.harness?.()?.mechanisms?.halo?.available===true);
 check('native_spatial_state_separate',w.REALITI_MATRIX_V1.state().world.id!=='MATRIX_COMPAT_TEST');
}finally{s.close()}
console.log(JSON.stringify({checks,detail},null,2));
if(Object.entries(checks).some(([,v])=>!v))process.exitCode=1;
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
