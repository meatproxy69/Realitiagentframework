'use strict';
// Migration accounting: compare every original room's registered scene verbs
// against the physically reached apartment's explicitly allowed original
// actions. A station, historical receipt, or namesake is not parity evidence.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {openResident}=require('../../packages/realiti-headless-resident/index.cjs');
const inventory=require('../room-migration.json');
const html=path.resolve(process.argv[2]||path.join(__dirname,'../RealitiApartment.html'));
(async()=>{
 const s=await openResident({htmlPath:html,residentId:'native-room-parity-auditor'});
 try{
  const w=s.window,scenes=w.eval('C9SCENES'),st=w.REALITI_APARTMENT_STATIONS_V1.view();
  assert.equal(st.station_count,22);
  const detail=[];
  for(const item of inventory.entries){
   const scene=scenes[item.source_room]||null;
   const source=(scene?.verbs||[]).map(v=>v[0]);
   const catalog=st.stations.find(x=>x.id===item.source_room);
   const offered=item.source_room==='CLOUD_NINE_NEST'?[]:catalog?.verbs||[];
   if(item.source_room!=='CLOUD_NINE_NEST')assert.ok(catalog);
   const covered=source.filter(v=>offered.includes(v));
   const missing=source.filter(v=>!offered.includes(v));
   // It is impossible to call a port verified when the static original verbs
   // are missing or its narrative/physics parity test isn't independently signed.
   if(item.status==='verified'){
    assert.equal(missing.length,0,'FALSIFIED_VERIFIED_ROOM_MISSING_NATIVE_ACTIONS:'+item.source_room);
    assert.ok(item.certificate?.reviewed_by&&item.certificate?.source_hash&&
      item.certificate?.parity_matrix_hash,
      'VERIFIED_ROOM_REQUIRES_EXPLICIT_SOURCE_PARITY_CERTIFICATE:'+item.source_room);
   }
   if(item.status==='excluded_with_owner_approval'){
    assert.ok(item.owner_approval&&item.justification);
   }
   detail.push({id:item.source_room,status:item.status,
    source_registered_static_verbs:source.length,station_allowed:offered.length,
    static_verbs_matched:covered.length,
    original_verbs_unported:missing,
    note:'Static C9SCENES verb gap is only one parity dimension: physical geometry, dynamic actions, grounded receipts, STOP, persistence and original environment also require review.'});
  }
  assert.equal(detail.length,23);
  assert.ok(detail.every(x=>x.status!=='verified'),
   'Current source room migration has no owner-approved full parity attestations.');
  const total=detail.reduce((n,x)=>n+x.source_registered_static_verbs,0),
    matching=detail.reduce((n,x)=>n+x.static_verbs_matched,0);
  const report={
   schema:'REALITI_APARTMENT_PARITY_GAP_AUDIT_V1',
   original_source_rooms:23,
   live_matrix_charts:Object.keys(w.REALITI_MATRIX_V1.charts()).length,
   physically_reached_apparatus:st.station_count,
   source_registered_static_verbs:total,
   station_whitelisted_static_verbs:matching,
   still_missing_static_verbs:total-matching,
   parity_approved_rooms:0,
   release_ready:false,
   warning:'More dynamic actions and environmental/physical requirements may be missing. These counts measure registered static verbs only, never overall percentage of completed mechanics.',
   rooms:detail
  };
  console.log(JSON.stringify(report,null,2));
  // Emit a machine-readable current CI artifact but never overwrite the
  // repository's versioned contract/source or claim that this is a release.
  fs.writeFileSync(path.resolve(__dirname,'../PARITY_GAPS_CI.json'),JSON.stringify(report,null,2)+'\n');
  console.log('APARTMENT SOURCE PARITY AUDIT PASS: measured live static native verb gaps, no false full-parity claims');
 }finally{s.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
