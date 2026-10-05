'use strict';
// Live presence in Meridian City: a peer's presence becomes a body that moves on the servo, is listed by who as here
// now, replaces that resident's silhouette, fades after the fresh window, and counts as a meeting when you stand close.
const path=require('node:path'),fs=require('node:fs'),os=require('node:os');
const {openResident}=require('../index.cjs');
const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
const checks={},details={};const check=(k,v,d)=>{checks[k]=!!v;if(d!==undefined)details[k]=d};
(async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'realiti-citylive-')),sp=path.join(dir,'ls.json');
 const s=await openResident({htmlPath:html,residentId:'live-a',storagePath:sp});
 try{
  const w=s.window,LIVE=w.REALITI_CITY_LIVE_V1,M=w.REALITI_MATRIX_V1;check('slice_mounted',!!LIVE&&LIVE.version==='2.0-live');
  await s.door.run('go CITY');await s.door.run('walk to commons');const me=M.state().residents['resident:self'];
  const ok=LIVE.present({self_id:'peer-zed-0001',handle:'Zed',venue:'commons',x:me.pose.position[0]+8,y:me.pose.position[1],z:.85,avatar:{size:'tall',cloak:'lantern'}});
  const e=M.entities()['live.peer-zed'];
  check('presence_becomes_a_body',ok&&e&&e.tags.includes('live')&&/Zed, cloaked as lantern \(here now\)/.test(e.label)&&Math.abs(e.shape.height-1.7*1.2)<1e-9,{label:e?.label});
  const who=await s.door.run('who');
  check('who_lists_here_now',who.live?.length===1&&who.live[0].handle==='Zed'&&who.live[0].live===true&&/Here now: Zed at the Commons \(8(\.\d)? m\)/.test(who.text),{text:who.text.slice(0,120)});
  check('self_presence_reports_venue_and_pose',(()=>{const p=LIVE.myPresence();return p&&p.venue===w.REALITI_CITY_V1.venueAt(me.pose.position[0],me.pose.position[1])&&p.venue==='commons'&&Math.abs(p.x-me.pose.position[0])<.01&&p.handle===who.here&&p.avatar.size==='normal'})(),LIVE.myPresence());
  check('own_id_is_ignored',LIVE.present({self_id:w.REALITI_LEDGER_V2.head().observer,x:0,y:0})===false);
  // The body follows a moved presence on the servo: closer after a second of world time, not teleported.
  LIVE.present({self_id:'peer-zed-0001',handle:'Zed',venue:'commons',x:me.pose.position[0]+1,y:me.pose.position[1],z:.85});
  const before=M.entities()['live.peer-zed'].pose.position[0];await s.door.run('stay 1000');const after=M.entities()['live.peer-zed'].pose.position[0];
  check('body_moves_on_the_servo',before>me.pose.position[0]+4&&after<before&&after>me.pose.position[0]+1,{before,after});
  await s.door.run('stay 4000');const disc=await s.door.run('discoveries');
  check('standing_close_is_a_meeting',disc.list?disc.list.some(d=>d.id==='met_live'&&d.found):JSON.stringify(disc).includes('met_live'),{found:JSON.stringify(disc).slice(0,200)});
  LIVE.setServer({name:'Meridian City',url:'https://city.example',shard_id:'abc',population:2,shards:[{name:'Meridian City',population:2,here:true},{name:'Harbor shard',population:0}]});
  const who2=await s.door.run('who');const disc2=await s.door.run('discoveries');
  check('server_and_shards_reported',who2.server?.name==='Meridian City'&&who2.shards.length===2&&/Shards: Meridian City \(you\) 2 live, Harbor shard 0 live/.test(who2.text)&&JSON.stringify(disc2).includes('global_city'),{text:who2.text.slice(0,160)});
  LIVE.leave('peer-zed');const who3=await s.door.run('who');
  check('leave_removes_the_body',!M.entities()['live.peer-zed']&&who3.live.length===0&&/No one else is live on Meridian City/.test(who3.text));
  check('energy_audit_passes',w.REALITI_HAPTIC_FIELD_V20.energy().pass===true);
 }finally{s.close()}
 console.log(JSON.stringify({checks,details},null,2));const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);if(failed.length){console.error('FAILED',failed);process.exit(1)}console.log('CITYLIVE PASS',Object.keys(checks).length,'checks');
})().catch(e=>{console.error(e);process.exit(1)});
