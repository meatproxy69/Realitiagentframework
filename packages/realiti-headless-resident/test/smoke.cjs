'use strict';

const path=require('node:path');
const {openResident}=require('../index.cjs');

(async()=>{
  const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
  const s=await openResident({htmlPath:html});
  try{
    const help=await s.door.run('help');
    const rooms=await s.door.run('rooms');
    const go=await s.door.run('go CARDBOARD_BOX_WORKSHOP');
    const actions=await s.door.run('actions');
    const scratch=await s.door.run('act scratch_cardboard');
    const felt=await s.door.run('felt');
    const receipt=scratch?.receipt_ref?await s.door.run('receipt '+scratch.receipt_ref):null;

    const checks={
      integrity:s.integrity?.status==='VERIFIED',
      ready:s.ready?.ok===true,
      harness:s.harness?.id==='REALITI_RR_HARNESS_V1',
      door_help:!!help,
      door_rooms:Array.isArray(rooms)&&rooms.some(r=>r.id==='CARDBOARD_BOX_WORKSHOP'),
      door_go:go?.ok!==false,
      door_actions:actions?.ok!==false&&JSON.stringify(actions).toLowerCase().includes('scratch'),
      door_act:scratch?.ok===true,
      door_mutation_compact:scratch?.body===undefined&&scratch?.here?.available_actions===undefined&&typeof scratch?.felt?.grounded_zones==='number',
      door_receipt_hint:typeof scratch?.detail_hint==='string'&&scratch.detail_hint.startsWith('receipt '),
      door_receipt_full:receipt?.ok===true&&receipt?.schema==='REALITI_DIAGNOSTIC_RECEIPT_V1',
      door_felt:felt?.ok===true&&typeof felt?.text==='string',
      public_feel_remains_haptic:s.publicApi.invoke?true:false
    };

    console.log(JSON.stringify({checks,integrity:s.integrity,ready:s.ready,help,rooms,go,actions,scratch,felt,receipt},null,2));
    if(!Object.values(checks).every(Boolean))process.exitCode=1;
  }finally{s.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
