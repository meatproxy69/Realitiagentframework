'use strict';
// Dynamic original Undercity lever/vault port on real reached HOME fixtures.
// Neither the original 9x9 source maze nor its historical traversal is
// presented as a real location in the one-chart Apartment preview.
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {openResident}=require('../../packages/realiti-headless-resident/index.cjs');
const preview=process.argv[2]==='preview';
const html=path.resolve(__dirname,'../'+(preview?'RealitiApartmentOneChartPreview.html':'RealitiApartment.html'));
const validationPath=preview?path.resolve(__dirname,'../ONE_CHART_VALIDATION.json'):undefined;
const HOME='CLOUD_NINE_NEST';
(async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-undercity-cabinet-'));
 const opts={htmlPath:html,validationPath,residentId:'native-undercity-cabinet',
  storagePath:path.join(dir,'resident.json')};
 let s=await openResident(opts),w=s.window,M=w.REALITI_MATRIX_V1;
 const ST=w.REALITI_APARTMENT_STATIONS_V1;
 let CAB=w.REALITI_APARTMENT_UNDERCITY_CABINET_V1,U=w.REALITI_UNDERCITY_V1;
 assert.equal(s.ready.harness,'REALITI_RR_HARNESS_V1');
 assert.equal(w.REALITI_RR_HARNESS_V1.boot().ok,true);
 assert.ok(CAB?.read&&CAB?.nearOriginal&&CAB?.sync);
 assert.equal(Object.keys(M.charts()).length,preview?1:23);
 assert.equal(M.entities()['apartment.undercity.lever']?.chart,HOME);
 assert.equal(M.entities()['apartment.undercity.gate']?.chart,HOME);
 assert.equal(M.entities()['apartment.undercity.vault-wall']?.chart,HOME);
 assert.equal(M.entities()['apartment.undercity.gate'].collision,true);
 const st=ST.view().stations.find(x=>x.id==='UNDERCITY');
 assert.ok(st.verbs.includes('pull_lever')&&st.verbs.includes('read_wall'));
 assert.equal(U.state().gate_open,false);
 await s.door.run('remote activate');
 const use=verb=>s.door.run('remote stations use UNDERCITY '+verb);
 const first=await use('pull_lever');
 assert.equal(first.ok,false);
 assert.equal(first.error,'STATION_NOT_IN_MATRIX_REACH');
 const move=(x,y)=>{
  const r=M.resident();
  r.pose.position=[x,y,.85];r.chart=HOME;r.v=[0,0,0];
  r.intent=null;r.posture='standing';r.on=null;r.support='CLOUD_NINE_NEST.floor';M.bump();
 };
 move(4.2,-4.5);
 assert.equal(ST.nearActive('UNDERCITY'),true);
 assert.equal(CAB.nearOriginal('under.lever'),true);
 // Same canonical original-source lever and vault effects in the actual
 // original 9x9 room. Its comparison resident is NOT the Apartment resident.
 const reference=await openResident({htmlPath:path.resolve(__dirname,'../../RealitiRELAX.html'),
  residentId:'canonical-undercity-cabinet'});
 let sourceLever,sourceWall;
 try{
  const rw=reference.window,RM=rw.REALITI_MATRIX_V1,RU=rw.REALITI_UNDERCITY_V1;
  const go=rw.REALITI_SLICE_ROOMS.go('UNDERCITY');
  assert.equal(go.ok,true,'reference lives in the canonical old maze');
  const lever=RM.entities()['under.lever'];
  const rr=RM.resident();
  rr.pose.position=[lever.pose.position[0],lever.pose.position[1],.85];
  rr.chart='UNDERCITY';rr.v=[0,0,0];rr.intent=null;RM.bump();
  sourceLever=RU.pull();
  assert.equal(sourceLever.ok,true,JSON.stringify(sourceLever));
  assert.equal(RU.state().gate_open,true);
  const wall=RM.entities()['under.vault_wall'];
  rr.pose.position=[wall.pose.position[0],wall.pose.position[1],.85];RM.bump();
  sourceWall=RU.readWall();
  assert.equal(sourceWall.ok,true,JSON.stringify(sourceWall));
 }finally{reference.close()}
 let out=await use('pull_lever');
 assert.equal(out.ok,true,JSON.stringify(out));
 assert.ok(out.source_receipt,'real HOME lever needs actual original B7 reach');
 assert.equal(out.source,'ORIGINAL_RELAX_UNDERCITY_DYNAMIC_ACTION');
 assert.equal(out.original_result.text,sourceLever.text);
 assert.equal(U.state().lever,true);
 assert.equal(U.state().gate_open,true);
 assert.equal(M.entities()['apartment.undercity.gate'].collision,false);
 assert.equal(out.agent_physically_in_tunnels,false);
 assert.equal(M.resident().chart,HOME);
 out=await use('pull_lever');
 assert.equal(out.ok,true,JSON.stringify(out));
 assert.equal(out.original_result.already,true,'original idempotent source lever state');
 move(5.2,-4.6);
 assert.equal(CAB.nearOriginal('under.vault_wall'),true);
 out=await use('read_wall');
 assert.equal(out.ok,true,JSON.stringify(out));
 assert.ok(out.source_receipt,'the real native vault object was touched');
 assert.equal(out.original_result.text,sourceWall.text);
 assert.equal(M.resident().chart,HOME);
 assert.equal(Object.keys(M.charts()).length,preview?1:23);
 if(preview){
  assert.equal(Object.keys(M.portals()).length,0);
  assert.equal(Object.values(M.entities()).filter(e=>e.chart!==HOME).length,0);
 }
 await s.door.run('save');await s.door.run('goodbye');s.close();
 s=await openResident(opts);w=s.window;M=w.REALITI_MATRIX_V1;
 CAB=w.REALITI_APARTMENT_UNDERCITY_CABINET_V1;U=w.REALITI_UNDERCITY_V1;
 assert.equal(w.REALITI_RR_HARNESS_V1.boot().ok,true);
 assert.equal(U.state().lever,true,'actual canonical source lever history persisted');
 assert.equal(U.state().gate_open,true);
 assert.equal(CAB.read().gate.open,true);
 assert.equal(M.entities()['apartment.undercity.gate'].collision,false);
 assert.equal(Object.keys(M.charts()).length,preview?1:23);
 if(preview)assert.equal(Object.keys(M.portals()).length,0);
 s.close();
 console.log('APARTMENT ORIGINAL UNDERCITY CABINET PASS:',preview?'ONE CHART':'DEVELOPMENT',
  'original dynamic source lever and inscription, real reached Matrix objects, genuine gate collision, canonical comparison, restart, no fake tunnel visitation');
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
