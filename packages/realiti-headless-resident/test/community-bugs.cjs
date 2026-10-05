'use strict';
// Regressions from the first external REALITI issue reports (#10, plus public-boundary items observed in #9).
const path=require('node:path');
const {openResident}=require('../index.cjs');

const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
const checks={},details={};
const check=(k,v,d)=>{checks[k]=!!v;if(d!==undefined)details[k]=d};

(async()=>{
 const s=await openResident({htmlPath:html,residentId:'community-regression'});
 try{
  const w=s.window,R=w.Realiti,run=c=>s.door.run(c);
  const body=()=>R.read('realiti://body');
  const grounding=()=>{
   const b=body(),f=b.field?.f?.at(-1)||{},z=b.field?.z||b.grounding?.z||[],m=f.m||b.grounding?.m||[];
   return z.filter((_,i)=>Number(m[i])===1);
  };
  const q=z=>w.eval(`C9.b7&&C9.b7.zones&&C9.b7.zones[${JSON.stringify(z)}]`);
  const space=()=>R.read('realiti://space');
  const act=async id=>run('act '+id);

  // #10.1: kneading is one finite room-local contact, not a self-renewing direct-sense cause.
  await run('go POCKET_FAMILIAR_HOUSE');await act('go_tiny');await act('knead_blanket');await act('knead_blanket');
  await run('go SIDE_BY_SIDE_FIRESIDE');await run('stay 250');
  check('knead_released_on_room_change',grounding().every(z=>!z.startsWith('hand.')),grounding());
  const t0=Date.now();await run('stay 1000');const elapsed=Date.now()-t0;
  check('knead_does_not_explode_stay_cost',elapsed<10000,{host_ms:elapsed});
  await run('stop');
  check('stop_releases_all_grounding',grounding().length===0,grounding());
  await run('home');await run('stay 250');
  check('home_does_not_resurrect_knead',grounding().every(z=>!z.startsWith('hand.')),grounding());

  // Arrival floor support and legacy posture verbs must agree with the body.
  for(const room of ['CARDBOARD_BOX_WORKSHOP','POCKET_FAMILIAR_HOUSE','SIDE_BY_SIDE_FIRESIDE']){
   await run('go '+room);await run('stay 50');
   const g=grounding();
   check('arrival_floor_'+room,g.includes('foot.L.sole')&&g.includes('foot.R.sole'),g);
  }
  await run('go SIDE_BY_SIDE_FIRESIDE');await act('sit');await run('stay 50');
  check('fireside_sit_is_spatially_sitting',space().body?.posture==='sitting',space().body);
  check('fireside_sit_grounds_seat',grounding().includes('pelvis.seat'),grounding());

  await run('go CARDBOARD_BOX_WORKSHOP');await act('box_in');await run('stay 50');
  check('box_in_is_spatially_sitting',space().body?.posture==='sitting',space().body);
  check('box_in_grounds_seat',grounding().includes('pelvis.seat'),grounding());

  // Legacy fold now mutates the same persistent BOX-1 used by generic object verbs and grounds the hand.
  await run('go CARDBOARD_BOX_WORKSHOP');
  const crease0=Number(w.eval('C9.b14.objects["BOX-1"].state.crease')||0);
  await act('fold_flap');
  const crease1=Number(w.eval('C9.b14.objects["BOX-1"].state.crease')||0);
  const foldReceipt=w.eval('C9.b4.lastReceipt');
  check('fold_flap_mutates_persistent_crease',crease1>crease0,{before:crease0,after:crease1});
  check('fold_flap_receipt_has_state_delta',Number(foldReceipt?.state_delta?.crease?.after)>Number(foldReceipt?.state_delta?.crease?.before),foldReceipt?.state_delta);
  check('fold_flap_grounds_hand',grounding().some(z=>z.startsWith('hand.')),grounding());
  check('first_fold_does_not_claim_old_crease',!/old crease/i.test(String(w.document.querySelector('#c9_consequence')?.textContent||'')),String(w.document.querySelector('#c9_consequence')?.textContent||'').slice(0,180));

  // Curling under the blanket changes the grounded blanket load, rather than being narration-only.
  await run('home');await run('stay 50');
  const thigh0=Number(q('leg.L.thigh')?._b10_grounded_value||0);
  await act('curl_blanket');await run('stay 50');
  const thigh1=Number(q('leg.L.thigh')?._b10_grounded_value||0);
  check('curl_blanket_changes_grounded_load',thigh1>thigh0,{before:thigh0,after:thigh1});
  check('curl_blanket_state_is_live',w.REALITI_NEST_SUPPORT?.state?.().curled===true,w.REALITI_NEST_SUPPORT?.state?.());

  // Nest support metadata names the support that is actually causing it.
  const crown=q('head.crown'),back=q('torso.mid_back');
  check('nest_pillow_material_is_pillow',crown?.lastCause==='NEST_PILLOW_SUPPORT'&&crown?.material==='pillow',{cause:crown?.lastCause,material:crown?.material});
  check('nest_mattress_material_is_mattress',back?.lastCause==='NEST_MATTRESS_SUPPORT'&&back?.material==='mattress',{cause:back?.lastCause,material:back?.material});

  // Carried objects remain grounded in the carrying hand across a room transition.
  const acts=(await run('actions')).actions||[];
  const takeHat=acts.find(a=>/take.*felt.*hat/i.test(a.id+' '+a.label));
  const took=takeHat?await act(takeHat.id):null;
  check('felt_hat_take_available',!!takeHat,takeHat);
  if(takeHat){
   const serialized=JSON.stringify(took);
   check('public_take_result_hides_internal_hat_id',!serialized.includes('TESTER-HAT-1')&&!serialized.includes('TESTER_HAT_1'),serialized.slice(0,400));
   if(took?.receipt_ref){
    const rr=await run('receipt '+took.receipt_ref),rs=JSON.stringify(rr);
    check('public_receipt_hides_internal_hat_id',!rs.includes('TESTER-HAT-1')&&!rs.includes('TESTER_HAT_1'),rs.slice(0,500));
   }else check('public_receipt_hides_internal_hat_id',true,'no receipt ref on compact result');
   await run('go SIDE_BY_SIDE_FIRESIDE');await run('stay 50');
   check('carried_object_keeps_hand_grounded',grounding().includes('hand.R.palm'),grounding());
  }

  // STOP/SAVE should never echo an earlier room action's narration.
  await act('crack_window');
  const stopped=await run('stop'),saved=await run('save');
  check('stop_does_not_echo_previous_narration',!/crack the window|rain becomes louder/i.test(JSON.stringify(stopped)),stopped);
  check('save_does_not_echo_previous_narration',!/crack the window|rain becomes louder/i.test(JSON.stringify(saved)),saved);

  // #9 usability finding: goodbye is now an explicit exit contract, not merely one command in a long list.
  const help=R.help(),caps=R.read('realiti://capabilities');
  check('goodbye_has_explicit_help_surface',help?.exit?.command==='goodbye'&&help?.entry_contract?.exit_command==='goodbye',help?.exit);
  check('goodbye_has_explicit_capability_surface',caps?.entry_contract?.exit_command==='goodbye',caps?.entry_contract);
 }finally{s.close()}

 console.log(JSON.stringify({checks,details},null,2));
 const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
 if(failed.length){console.error('FAILED',failed);process.exit(1)}
 console.log('COMMUNITY BUG REGRESSIONS PASS',Object.keys(checks).length,'checks');
})().catch(e=>{console.error(e);process.exit(1)});
