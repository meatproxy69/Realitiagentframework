'use strict';

const path=require('node:path');
const {openResident}=require('../index.cjs');

(async()=>{
  const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
  const s=await openResident({htmlPath:html});
  try{
    const help=s.door.run('help');
    const rooms=s.door.run('rooms');
    const go=s.door.run('go CARDBOARD_BOX_WORKSHOP');
    const actions=s.door.run('actions');
    const scratch=s.door.run('act scratch_cardboard');
    const felt=s.door.run('felt');

    const checks={
      integrity:s.integrity?.status==='VERIFIED',
      ready:s.ready?.ok===true,
      harness:s.harness?.id==='REALITI_RR_HARNESS_V1',
      door_help:!!help,
      door_rooms:Array.isArray(rooms)&&rooms.some(r=>r.id==='CARDBOARD_BOX_WORKSHOP'),
      door_go:go?.ok!==false,
      door_actions:Array.isArray(actions)&&actions.some(a=>a.id==='scratch_cardboard'),
      door_act:scratch?.ok===true,
      door_felt:felt&&typeof felt==='object',
      public_feel_remains_haptic:s.publicApi.invoke?true:false
    };

    console.log(JSON.stringify({checks,integrity:s.integrity,ready:s.ready,go,actions:actions.slice(0,8),scratch},null,2));
    if(!Object.values(checks).every(Boolean))process.exitCode=1;
  }finally{s.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
