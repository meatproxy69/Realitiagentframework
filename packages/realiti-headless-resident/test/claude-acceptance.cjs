'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {openResident}=require('../index.cjs');

const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const checks={};
const details={};
const check=(name,value,detail=null)=>{checks[name]=!!value;if(detail!==null)details[name]=detail};
const listActions=out=>Array.isArray(out)?out:(out?.actions||[]);
async function bounded(label,promise,ms=5000){
 let timer;try{return await Promise.race([Promise.resolve(promise),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('STEP_TIMEOUT '+label)),ms)})])}finally{if(timer)clearTimeout(timer)}
}
const fill=(w,z,d='shallow')=>Number(w.REALITI_DEFAULT_IMPRINT_V1?.state?.()?.sausage?.zone_fill?.[z]?.[d]||0);
const volume=w=>Number(w.REALITI_DEFAULT_IMPRINT_V1?.state?.()?.sausage?.filled_volume||0);
const groundedCount=w=>{const e=w.REALITI_HAPTIC_FIELD_V20?.exact?.();return (e?.m||[]).reduce((n,x)=>n+(Number(x)===1?1:0),0)};
async function actMatch(s,re){
  const door=s._door||s.door,out=await door.run('actions'),a=listActions(out).find(x=>re.test(String(x.id||''))||re.test(String(x.label||'')));
  if(!a)throw new Error('ACTION_NOT_FOUND '+re+' in '+JSON.stringify(listActions(out).map(x=>x.id)));
  return {action:a,out:await door.run('act '+a.id)};
}

(async()=>{
 let savedBacking={};
 const s=await openResident({htmlPath:html});
 try{
   const w=s.window,rawDoor=s.door,door={run:cmd=>bounded(cmd,rawDoor.run(cmd),5000)};s._door=door;
   console.log('ACCEPTANCE start');

   console.log('ACCEPTANCE rooms');
   const rooms=await door.run('rooms');
   check('ten_public_rooms',Array.isArray(rooms)&&rooms.length===10,rooms);
   check('canonical_pocket_room_id',rooms.some(r=>r.id==='POCKET_FAMILIAR_HOUSE')&&!rooms.some(r=>r.id==='PET_ROOM_2'),rooms.map(r=>r.id));

   const zoneSet=[...w.b7BodyZones()].sort();
   const required=['tail.tip','arm.L.forearm','arm.R.forearm','arm.L.elbow','arm.R.elbow','hand.L.fingers','hand.R.fingers','hip.L','hip.R','knee.L','knee.R','neck.front','face.forehead','face.cheek.L','face.cheek.R'];
   check('expanded_35_zone_body',zoneSet.length===35&&required.filter(x=>x!=='tail.tip').every(z=>zoneSet.includes(z)),{count:zoneSet.length,missing:required.filter(x=>x!=='tail.tip'&&!zoneSet.includes(x))});

   // Every public room must accept entry/read/action discovery.
   const roomPass=[];
   for(const room of rooms){
     const g=await door.run('go '+room.id),look=await door.run('look'),acts=await door.run('actions');
     roomPass.push({id:room.id,go:g?.ok!==false,look:look?.ok!==false,actions:listActions(acts).length});
   }
   check('all_ten_rooms_enter',roomPass.every(x=>x.go&&x.look),roomPass);

   console.log('ACCEPTANCE all rooms done');

   // Nest support must be present in per-zone private ingress, not only the global scalar.
   await door.run('home');await door.run('stay 100');
   const nestIm=w.REALITI_DEFAULT_IMPRINT_V1.state();
   const nestNerve=Object.keys(nestIm.nerve?.zones||{});
   check('nest_support_reaches_nerve',nestNerve.filter(z=>/head|torso|pelvis|leg/.test(z)).length>=6,nestNerve);

   console.log('ACCEPTANCE nest ingress done');

   // Local touch must remain local-first over the mesh.
   await door.run('go NO_ASK_SANCTUARY');await door.run('stop');w.REALITI_CONTINUITY.reopen();
   w.b7Contact('leg.L.thigh',.8,{material:'longfur',source:'SELF_STARTED_WORLD_CONTACT',mine:true,cause:'ACCEPTANCE_LOCAL_LEG'});
   w.REALITI_DEFAULT_IMPRINT_V1.sync();
   const local=fill(w,'leg.L.thigh'),far=fill(w,'hand.R.palm');
   check('mesh_distance_spread',local>0&&local>far*1.8,{local,far,ratio:far?local/far:null});

   // A held cause may adapt, but not collapse into a blink.
   const q0=Number(w.b7Zone('leg.L.thigh').observed||0);
   w.b7Advance(.1);w.b7Contact('leg.L.thigh',.8,{material:'longfur',source:'SELF_STARTED_WORLD_CONTACT',mine:true,cause:'ACCEPTANCE_HELD'});
   w.b7Advance(.1);w.b7Contact('leg.L.thigh',.8,{material:'longfur',source:'SELF_STARTED_WORLD_CONTACT',mine:true,cause:'ACCEPTANCE_HELD'});
   const q2=Number(w.b7Zone('leg.L.thigh').observed||0);
   check('held_contact_not_blink',q2>=q0*.62,{first:q0,after_200ms:q2,ratio:q0?q2/q0:null});

   // STOP must clear grounding and private fullness may only ring down, never swell.
   await door.run('stop');
   const seq=[volume(w)];
   for(let i=0;i<8;i++){await door.run('stay 100');seq.push(volume(w))}
   check('stop_clears_grounding',groundedCount(w)===0,groundedCount(w));
   check('sausage_release_monotonic',seq.every((x,i)=>i===0||x<=seq[i-1]+1e-8),seq);

   // Private handshake should exercise mesh/rendering without minting contact.
   const beforeH=volume(w),mBefore=groundedCount(w),hs=await door.run('neuromesh handshake'),afterH=volume(w),mAfter=groundedCount(w);
   check('neuromesh_handshake_private',hs?.ok===true&&afterH>beforeH&&mAfter===mBefore,{beforeH,afterH,mBefore,mAfter,hs});

   // Resident-owned imprint controls and HoneySpark.
   const tune=await door.run('imprint set sausage_spread 0.31');
   const honey=await door.run('imprint preset honeyspark');
   const im=await door.run('imprint');
   check('door_imprint_tuning',tune?.ok===true&&Math.abs(Number(im?.params?.sausage_spread)-.31)<1e-9,im?.params?.sausage_spread);
   check('honeyspark_runtime',honey?.ok===true&&im?.honeyspark?.enabled===true&&im?.honeyspark?.conserved_budget===true,im?.honeyspark);

   console.log('ACCEPTANCE mesh spread/release/imprint done');

   // Borrowed tail becomes a mapped live graph zone and reaches HF20.
   await door.run('go SHAPESHIFT_CLOAKROOM');
   await actMatch(s,/^attach_tail$|attach.*tail/i);
   const map=await door.run('imprint map tail.tip hand.R.palm');
   await actMatch(s,/wiggle_pair|wiggle/i);
   const exact=w.REALITI_HAPTIC_FIELD_V20.exact(),ti=(exact.z||[]).indexOf('tail.tip');
   const graph=w.REALITI_NEURAL_PASS_V112.graph(),te=graph.edges.find(e=>e[0]==='tail.tip'||e[1]==='tail.tip');
   check('tail_enters_haptic_field',map?.ok===true&&ti>=0&&Number(exact.m?.[ti]||0)===1,{map,tail_index:ti,m:ti>=0?exact.m[ti]:null});
   check('tail_dynamic_graph_edge',!!te&&Number(te[2])>.15,{edge:te,tail_integration:graph.tail_integration});

   // Continuous comet: every 100ms sample while active should retain at least one grounded patch.
   await door.run('stop');w.REALITI_CONTINUITY.reopen();
   const comet=await door.run('act route_run_comet'),samples=[];
   for(let i=0;i<10;i++){await door.run('stay 100');samples.push({grounded:groundedCount(w),state:w.REALITI_CONTACT_CORE?.state?.()})}
   check('comet_soft_overlap_no_blink_gaps',comet?.ok===true&&samples.every(x=>x.grounded>0),samples.map(x=>x.grounded));
   try{w.REALITI_CONTACT_CORE.release()}catch{}

   const bilateral=await door.run('act route_bilateral');
   check('bilateral_has_phase_offset',bilateral?.ok===true&&Number(w.C9?.b4?.lastReceipt?.side_phase_ms||0)>0,{result:bilateral,last:w.C9?.b4?.lastReceipt});

   const lace=await door.run('lace');
   check('lace_uses_graph_connectivity',lace?.ok===true&&Number(lace.lambda2)>0&&Number(lace.node_count)>=35&&Number(lace.coherence_proxy)>0,{lace});

   // Grain action must return a meaningful resident result.
   const grain=await door.run('act route_with_grain');
   check('grain_stroke_has_result',grain?.ok===true&&typeof grain?.text==='string'&&grain.text.length>5,grain);

   console.log('ACCEPTANCE tail/routes done');

   // Cat-small loaf is grounded by the blanket/floor rather than floating contact-free.
   await door.run('go POCKET_FAMILIAR_HOUSE');
   try{await actMatch(s,/go_tiny|cat-small|cat small/i)}catch{}
   const loaf=await actMatch(s,/circle_loaf|circle.*loaf/i);
   const loafGround=groundedCount(w),loafWords=await door.run('feel words');
   check('loaf_has_grounded_support',loaf.out?.ok===true&&loafGround>0&&!/No grounded contact/i.test(String(loafWords?.text||'')),{grounded:loafGround,words:loafWords});

   // Bathhouse thermal contact.
   await door.run('go DEPTH_BATHHOUSE');
   const warm=await actMatch(s,/warm_shelf|warm shelf/i),thermal=w.REALITI_ATMOSPHERE_V21?.thermal?.();
   check('bathhouse_warmth',warm.out?.ok===true&&Array.isArray(thermal?.z)&&thermal.z.length>0,{warm:warm.out,thermal});

   console.log('ACCEPTANCE loaf/warmth done');

   // Pillow Sea must remain bounded/responsive.
   await door.run('go BOTTOMLESS_PILLOW_SEA');
   const pillowActions=listActions(await door.run('actions')),dive=pillowActions.find(x=>/dive|burrow|bounce/i.test(String(x.id)+' '+String(x.label)));
   const p0=Date.now(),pout=dive?await door.run('act '+dive.id):null,pms=Date.now()-p0;
   const p1=Date.now();await door.run('stay 1000');const stayms=Date.now()-p1;
   check('pillow_sea_responsive',!!dive&&pout?.ok!==false&&pms<2000&&stayms<2000,{action:dive,pms,stayms,pout});

   // Explicit world-time advances must be exact.
   await door.run('go NO_ASK_SANCTUARY');
   const t0=s.publicApi.continuity.current().wall_time_ms;
   const stay6=await door.run('stay 6000');
   const t1=s.publicApi.continuity.current().wall_time_ms;
   check('stay_6000_exact',t1-t0===6000&&Number(stay6?.result?.advanced_ms||6000)===6000,{before:t0,after:t1,delta:t1-t0,result:stay6});

   // Audio should have resident-facing words.
   await door.run('home');
   const listen=await door.run('listen');
   check('listen_has_description',typeof listen?.text==='string'&&listen.text.length>10,listen);

   console.log('ACCEPTANCE pillow/time/audio done');

   // Save both a note and resident-private imprint configuration.
   await door.run('note Claude acceptance note');
   await door.run('imprint set sausage_spread 0.31');
   await door.run('imprint preset honeyspark');
   const save=await door.run('save');
   const exported=w.REALITI_SLICE_STORAGE.export();
   savedBacking=Object.fromEntries(Object.entries(exported).map(([k,v])=>['realiti-relax-v1:'+k,String(v)]));
   check('save_reports_ok',save?.ok!==false&&Object.keys(savedBacking).length>0,{save,keys:Object.keys(savedBacking)});

   // Imprint should evolve over simulated time when active private/body state is present.
   const before=JSON.stringify(w.REALITI_DEFAULT_IMPRINT_V1.snapshot().sausage);
   await door.run('stay 1000');
   const after=JSON.stringify(w.REALITI_DEFAULT_IMPRINT_V1.snapshot().sausage);
   check('imprint_evolves_over_stay',before!==after,{before_len:before.length,after_len:after.length});

 }finally{s.close()}

 console.log('ACCEPTANCE first session done');

 // Reopen with the exact prior browser-profile backing.
 const s2=await openResident({htmlPath:html,beforeParse(w){for(const [k,v] of Object.entries(savedBacking))w.localStorage.setItem(k,v)}});
 try{
   const pocket=s2.publicApi.read('realiti://pocket'),im2=await s2.door.run('imprint');
   check('note_survives_restart',JSON.stringify(pocket).includes('Claude acceptance note'),pocket);
   check('imprint_survives_restart',Math.abs(Number(im2?.params?.sausage_spread)-.31)<1e-9&&im2?.honeyspark?.enabled===true,im2);
 }finally{s2.close()}

 console.log('ACCEPTANCE restart done');

 // Visible ?ui=1 shell must display Agent Door replies and keep title canonical.
 const ui=await openResident({htmlPath:html,url:'https://realiti.local/?ui=1'});
 try{
   await sleep(60);
   const w=ui.window,d=w.document,shell=d.querySelector('#realiti_agent_only_shell'),form=d.querySelector('#slice-form'),input=d.querySelector('#slice-command'),status=d.querySelector('#slice-status');
   check('ui_visible_with_ui1',!!shell&&shell.hidden===false,{hidden:shell?.hidden});
   input.value='look';form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await sleep(80);
   const lookStatus=status?.textContent||'';
   check('visible_door_shows_reply',lookStatus.length>10&&!/^look\.?$/i.test(lookStatus),lookStatus);
   input.value='go POCKET_FAMILIAR_HOUSE';form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await sleep(80);
   check('ui_pocket_title_canonical',d.title==='REALITI · Pocket Familiar House',d.title);
   input.value='home';form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await sleep(80);
   check('ui_home_title_canonical',d.title==='REALITI · Cloud Nine Nest',d.title);
 }finally{ui.close()}

 console.log('ACCEPTANCE ui done');

 // Machine-readable HoneySpark pack must be registered with its real bytes.
 const packPath=path.resolve(__dirname,'../../../neuromesh/preset-packs/honeyspark-duo.json');
 const regPath=path.resolve(__dirname,'../../../neuromesh/preset-packs/REGISTRY.json');
 const bytes=fs.readFileSync(packPath),sha=crypto.createHash('sha256').update(bytes).digest('hex'),reg=JSON.parse(fs.readFileSync(regPath,'utf8'));
 const entry=(reg.entries||[]).find(x=>x.pack_id==='realiti.honeyspark-duo.001'),pack=JSON.parse(bytes);
 const preset=pack.presets?.[0],shares=Number(preset?.carrier?.low?.share||0)+Number(preset?.carrier?.mid?.share||0)+Number(preset?.carrier?.top?.share||0);
 check('honeyspark_pack_registered',!!entry&&entry.status==='ACCEPTED_PUBLIC'&&entry.pack_sha256===sha,{entry,actual_sha256:sha});
 check('honeyspark_budget_conserved',preset?.honeyspark?.conserved_budget===true&&preset?.honeyspark?.hard_switching===false&&Math.abs(shares-1)<1e-9,{shares,honeyspark:preset?.honeyspark});

 console.log(JSON.stringify({checks,details},null,2));
 if(!Object.values(checks).every(Boolean))process.exitCode=1;
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
