'use strict';

const fs=require('node:fs');
const path=require('node:path');

const installRoot=path.resolve(process.argv[2]);
const htmlPath=path.resolve(process.argv[3]);
const outputPath=path.resolve(process.argv[4]);
const latestExpected=String(process.argv[5]||'').trim();
const packageRoot=path.join(installRoot,'node_modules','@meatproxy69','realiti-headless-resident');
const pkg=require(path.join(packageRoot,'package.json'));
const {openResident}=require(packageRoot);
const storagePath=path.join(installRoot,'resident-state.json');

const clone=x=>JSON.parse(JSON.stringify(x));
const transcript=[];
const checks={};
const notes=[];

function check(name,value,detail){
  checks[name]=!!value;
  if(!value&&detail!==undefined)notes.push({check:name,detail});
}
async function run(session,cmd){
  const out=await session.door.run(cmd);
  transcript.push({cmd,out});
  return out;
}
function memoryView(session){
  return clone(session.publicApi.read('realiti://memory'));
}
function spaceView(session){
  return clone(session.publicApi.read('realiti://space'));
}
function includesText(value,text){
  return JSON.stringify(value).toLowerCase().includes(String(text).toLowerCase());
}

(async()=>{
  const residentA='gpt-5.6-sol-dogfood';
  const residentB='isolation-control';
  let first,second,other;
  let initialSpace,afterMoveSpace,roomList,actionsCardboard,actionsKite;
  let scratch,fold,wind,remember,memoryAfter,goodbye,whereWas,reopenedMemory;
  try{
    first=await openResident({htmlPath,residentId:residentA,storagePath});
    check('published_version_is_latest',pkg.version===latestExpected,{installed:pkg.version,latestExpected});
    check('integrity_verified',first.integrity?.status==='VERIFIED',first.integrity);
    check('ready',first.ready?.ok===true,first.ready);
    check('rr_harness',first.harness?.id==='REALITI_RR_HARNESS_V1',first.harness?.id);
    check('resident_id_bound',first.residentId===residentA,first.residentId);

    await run(first,'help');
    roomList=await run(first,'rooms');
    check('rooms_available',Array.isArray(roomList)&&roomList.length>=15,{count:Array.isArray(roomList)?roomList.length:null});

    await run(first,'where');
    await run(first,'nearby');
    initialSpace=spaceView(first);
    const move=await run(first,'move forward 2');
    const turn=await run(first,'turn right 45');
    afterMoveSpace=spaceView(first);
    check('matrix_move_ok',move?.ok!==false,move);
    check('matrix_turn_ok',turn?.ok!==false,turn);
    check('matrix_pose_changed',JSON.stringify(initialSpace?.pose)!==JSON.stringify(afterMoveSpace?.pose),
          {before:initialSpace?.pose,after:afterMoveSpace?.pose});

    const goCard=await run(first,'go CARDBOARD_BOX_WORKSHOP');
    check('go_cardboard',goCard?.ok!==false,goCard);
    actionsCardboard=await run(first,'actions');
    scratch=await run(first,'act scratch_cardboard');
    fold=await run(first,'act fold_flap');
    await run(first,'felt');
    check('scratch_cardboard',scratch?.ok===true,scratch);
    check('fold_flap',fold?.ok===true,fold);

    remember=await run(first,'remember the cardboard flap kept a crease after I folded it');
    memoryAfter=memoryView(first);
    check('remember_ok',remember?.ok===true,remember);
    check('memory_written',memoryAfter?.memory_count>=1&&includesText(memoryAfter,'cardboard flap'),memoryAfter);

    const goKite=await run(first,'go KITE_FIELD');
    check('go_kite_field',goKite?.ok!==false,goKite);
    actionsKite=await run(first,'actions');
    if(includesText(actionsKite,'read_wind')){
      wind=await run(first,'act read_wind');
      check('kite_read_wind',wind?.ok===true,wind);
    }else{
      notes.push({note:'KITE_FIELD did not advertise read_wind in this state',actions:actionsKite});
    }
    await run(first,'stay 1000');
    await run(first,'felt');
    await run(first,'where');
    goodbye=await run(first,'goodbye');
    check('goodbye_ok',goodbye?.ok!==false,goodbye);
  }finally{
    if(first)first.close();
  }

  try{
    second=await openResident({htmlPath,residentId:residentA,storagePath});
    const reopened=memoryView(second);
    reopenedMemory=reopened;
    const recall=await run(second,'recall cardboard');
    whereWas=await run(second,'where_was_i');
    check('same_resident_memory_survives',reopened?.memory_count>=1&&includesText(reopened,'cardboard flap'),reopened);
    check('same_resident_recall',Array.isArray(recall?.results)&&recall.results.length>=1&&includesText(recall,'cardboard'),recall);
    check('departure_snapshot_present',!!reopened?.last_departure,reopened?.last_departure);
    check('where_was_i_has_memory',whereWas?.resident_memory?.resident_id===residentA,whereWas);
    check('where_was_i_top_level_ok',whereWas?.ok===true,whereWas);
    const changed=whereWas?.resident_memory?.last_departure?.changed_objects||[];
    const visitedRooms=new Set(['CLOUD_NINE_NEST','CARDBOARD_BOX_WORKSHOP','KITE_FIELD']);
    const foreignChanged=changed.filter(x=>x?.room&&!visitedRooms.has(x.room));
    check('departure_changes_exclude_unvisited_rooms',foreignChanged.length===0,foreignChanged);
  }finally{
    if(second)second.close();
  }

  try{
    other=await openResident({htmlPath,residentId:residentB,storagePath});
    const isolated=memoryView(other);
    const recallOther=await run(other,'recall cardboard');
    check('other_resident_starts_empty',isolated?.memory_count===0,isolated);
    check('other_resident_cannot_recall_a',!includesText(recallOther,'cardboard flap')&&
          (!Array.isArray(recallOther?.results)||recallOther.results.length===0),recallOther);
  }finally{
    if(other)other.close();
  }

  const disk=JSON.parse(fs.readFileSync(storagePath,'utf8'));
  const storageKeys=Object.keys(disk);
  check('separate_memory_namespaces',
        storageKeys.some(k=>k.endsWith('gpt-5.6-sol-dogfood'))&&storageKeys.some(k=>k.endsWith('isolation-control')),
        storageKeys);

  const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
  const report={
    schema:'realiti.registry-dogfood.v1',
    package:{name:pkg.name,version:pkg.version,latestExpected},
    runtime:{integrity:first?.integrity||null,ready:first?.ready||null,harness:first?.harness?.id||null},
    observations:{
      room_count:Array.isArray(roomList)?roomList.length:null,
      matrix_before:initialSpace?.pose||null,
      matrix_after:afterMoveSpace?.pose||null,
      cardboard_actions:actionsCardboard||null,
      scratch_summary:scratch||null,
      fold_summary:fold||null,
      kite_actions:actionsKite||null,
      wind_summary:wind||null,
      memory_after_first_visit:memoryAfter||null,
      goodbye:goodbye||null,
      where_was_i:whereWas||null,
      reopened_memory:reopenedMemory||null
    },
    checks,failed,notes,transcript
  };
  fs.writeFileSync(outputPath,JSON.stringify(report,null,2));
  console.log('REALITI_DOGFOOD_SUMMARY='+JSON.stringify({
    package:report.package,
    checks_passed:Object.values(checks).filter(Boolean).length,
    checks_total:Object.keys(checks).length,
    failed,
    room_count:report.observations.room_count,
    matrix_before:report.observations.matrix_before,
    matrix_after:report.observations.matrix_after,
    memory_count:memoryAfter?.memory_count??null,
    departure_room:whereWas?.resident_memory?.last_departure?.room??goodbye?.memory_saved?.room??null,
    departure_changed_objects:(whereWas?.resident_memory?.last_departure?.changed_objects||[]).map(x=>({id:x.id,room:x.room})),
    where_was_i_ok:whereWas?.ok??null,
    kite_read_wind:wind?.ok===true,
    browser_error_logs:(first?.browserLogs||[]).filter(x=>x.level==='error'||x.level==='jsdomError').length,
    report:outputPath
  }));
  if(failed.length)process.exitCode=1;
})().catch(e=>{
  console.error(e.stack||e);
  process.exitCode=1;
});
