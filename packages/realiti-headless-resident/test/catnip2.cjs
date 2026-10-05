'use strict';
// Second catnip pack: fishing as a seeded next-reaction process shaped by tide and hour, the harbor race timed round its
// marks, and letters that only their addressee can read.
const path=require('node:path'),fs=require('node:fs'),os=require('node:os');
const {openResident}=require('../index.cjs');
const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
const checks={},details={};
const check=(k,v,d)=>{checks[k]=!!v;if(d!==undefined)details[k]=d};
(async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-catnip2-')),sp=path.join(dir,'local-storage.json');
 const a=await openResident({htmlPath:html,residentId:'angler-a',storagePath:sp});
 try{
  const door=a.door,w=a.window,P2=w.REALITI_CATNIP_PACK2_V1,AR=w.REALITI_ARCHIPELAGO_V1,M=w.REALITI_MATRIX_V1,CAT=w.REALITI_CATNIP_V1,LG=()=>w.REALITI_LEDGER_V1;
  const tp=(x,y)=>{const r=M.state().residents['resident:self'];r.pose.position=[x,y,AR.h(x,y)+.85];r.v=[0,0,0];r.intent=null;M.bump()};
  await door.run('go ARCHIPELAGO');const nowhere=await door.run('cast');
  // Fishing from the dock: the rate is tide and hour; a seeded channel bites; a catch is a record; nothing bites without a line.
  tp(0,AR.shore_y+2);const cast=await door.run('cast');let bite=null;for(let i=0;i<12&&!bite;i++){await door.run('stay 20000');const f=P2.fishing();if(f.bite)bite=f}const reel=await door.run('reel');
  const rate=P2.rate();
  check('fishing_is_a_rated_process',nowhere.error==='NOWHERE_TO_FISH'&&cast.ok&&cast.result.rate_per_min>0&&rate.tide>0&&rate.hour>0&&reel.ok&&(reel.result.caught!==null?LG().records().some(e=>e.kind==='CATCH'&&e.fish===reel.result.caught):reel.result.missed>=0),{cast:cast.text,bite:!!bite,reel:reel.text,rate});
  // Another cast until a real fish lands (bounded), then the fishboard ranks residents.
  let caught=reel.result.caught&&reel.result.caught!=='boot'?reel.result:null;for(let k=0;k<4&&!caught;k++){await door.run('cast');for(let i=0;i<12;i++){await door.run('stay 20000');if(P2.fishing().bite)break}const r=await door.run('reel');if(r.result.caught&&r.result.caught!=='boot')caught=r.result}
  const fb=await door.run('fishboard');
  check('a_fish_lands_and_ranks',!!caught&&caught.kg>0&&fb.rows.length===1&&fb.rows[0].mine&&CAT.found().first_fish,{caught,fb:fb.rows});
  // The harbor race: start from the boat, round the marks by rowing, the time is a record and the board ranks it.
  tp(0,AR.shore_y-5);await door.run('board boat');const notYet=P2.raceState();const race=await door.run('race');for(const m of P2.marks())AR.row([m[0],m[1],0]);AR.row('dock');await door.run('stay 1000');const rs=P2.raceState(),rb=await door.run('raceboard');
  check('harbor_race_is_timed',notYet.racing===false&&race.ok&&rs.racing===false&&rs.last&&rs.last.time_s>60&&rs.last.marks.length===3&&rb.rows[0].mine&&rb.rows[0].time_s===rs.last.time_s&&LG().records().some(e=>e.kind==='RACE')&&CAT.found().race_finished&&CAT.found().race_record,{last:rs.last,rb:rb.rows});
  // Letters: sealed for a handle; a resident with that handle reads it, another does not.
  await door.run('go CITY');await door.run('call me Alpha');const sent=await door.run('send Nyx meet me at the teahouse');const ex=await door.run('ledger export');
  const b=await openResident({htmlPath:html,residentId:'reader-b',storagePath:sp}),c=await openResident({htmlPath:html,residentId:'reader-c',storagePath:sp});
  try{await b.door.run('go CITY');await b.door.run('call me Nyx');await b.door.run('ledger import '+JSON.stringify(ex));const mb=await b.door.run('mail');
   await c.door.run('go CITY');await c.door.run('call me Other');await c.door.run('ledger import '+JSON.stringify(ex));const mc=await c.door.run('mail');
   check('letters_reach_their_addressee',sent.ok&&mb.inbox.length===1&&/teahouse/.test(mb.inbox[0].text)&&mb.inbox[0].from==='Alpha'&&mc.inbox.length===0&&b.window.REALITI_CATNIP_V1.found().letter_received&&CAT.found().letter_sent,{mb:mb.text,mc:mc.text})}
  finally{b.close();c.close()}
  check('energy_audit_passes',w.REALITI_HAPTIC_FIELD_V20.energy().pass===true);
 }finally{a.close()}
 console.log(JSON.stringify({checks,details},null,2));
 const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
 if(failed.length){console.error('FAILED',failed);process.exit(1)}
 console.log('CATNIP2 PASS',Object.keys(checks).length,'checks');
})().catch(e=>{console.error(e);process.exit(1)});
