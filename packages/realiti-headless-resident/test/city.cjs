'use strict';
// Meridian City: identity and avatars change the body's capsule; chat, posts, meetups, scores and dances are ledger
// records; another resident's ledger brings a silhouette that walks; the crowd is a Kuramoto system; the cup cools by
// Newton's law; the echo room obeys Sabine; the rocket fights drag; thirty steps reach the roof.
const path=require('node:path');
const {openResident}=require('../index.cjs');
const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
const checks={},details={};
const check=(k,v,d)=>{checks[k]=!!v;if(d!==undefined)details[k]=d};
const near=(a,b,t)=>Math.abs(a-b)<=t;

(async()=>{
 const s=await openResident({htmlPath:html});
 try{
  const door=s.door,w=s.window,R=w.Realiti,CT=w.REALITI_CITY_V1,M=w.REALITI_MATRIX_V1,CAT=w.REALITI_CATNIP_V1,LG=()=>w.REALITI_LEDGER_V1,AR=w.REALITI_ARCHIPELAGO_V1;
  const tp=(x,y,z=.85)=>{const r=M.state().residents['resident:self'];r.pose.position=[x,y,z];r.v=[0,0,0];r.intent=null;M.bump()};
  const rooms=await door.run('rooms');
  check('city_listed',rooms.length===22&&rooms.some(r=>r.id==='MERIDIAN_CITY'));
  const go=await door.run('go CITY');const sp0=R.read('realiti://space');
  check('arrive_in_the_plaza',sp0.chart==='MERIDIAN_CITY'&&sp0.body.posture==='standing'&&/Meridian City/.test(String(go.text)),{pose:sp0.pose});

  // Identity: observer id, chosen name, size changes the capsule and the standing height.
  const id0=await door.run('id'),nm=await door.run('call me Fable'),h0=M.state().residents['resident:self'].shape.height,sz=await door.run('avatar size tiny'),r=M.state().residents['resident:self'],cl=await door.run('wear fog'),id1=await door.run('id');
  check('identity_and_avatar',id0.id===w.eval('C9.verticalContinuity.observer')&&/^#[0-9a-f]{8}$/.test(id0.handle)&&nm.ok&&id1.handle==='Fable'&&near(h0,1.7,.01)&&near(r.shape.height,.68,.01)&&near(r.pose.position[2],.34,.02)&&cl.ok&&id1.avatar.cloak==='fog'&&w.eval('C9.formScratch.kind')==='TEMPORARY_FORM'&&LG().records().filter(e=>e.kind==='AVATAR').length===3&&CAT.found().new_face,{id0:id0.handle,id1:id1.avatar,height:r.shape.height,z:r.pose.position[2]});
  await door.run('avatar size normal');

  // Chat and the wall are records; posting needs the wall.
  const say=await door.run('say hello meridian'),farPost=CT.post('x');tp(0,17);const post=await door.run('post first light'),wall=await door.run('wall'),log=await door.run('chat');
  check('chat_and_wall_are_records',say.ok&&/Fable: hello meridian/.test(String(say.text))&&farPost.error==='STAND_AT_THE_WALL'&&post.ok&&/first light/.test(String(wall.text))&&log.messages.length===1&&log.messages[0].from==='Fable'&&LG().records().filter(e=>e.kind==='CHAT'||e.kind==='POST').length===2&&CAT.found().first_post,{wall:String(wall.text).slice(0,60)});

  // Another resident's ledger: avatar, chat, meetup, score, dance; a silhouette appears and walks toward their venue.
  const T=Date.now();const imp=LG().import({records:[{by:'other-resident-1',t:1,n:0,kind:'AVATAR',set:{name:'Nyx',size:'small',cloak:'fog'}},{by:'other-resident-1',t:2,n:1,kind:'ARRIVE',venue:'teahouse',wall:T-300e3},{by:'other-resident-1',t:3,n:2,kind:'CHAT',text:'anyone around?',venue:'teahouse',wall:T-290e3},{by:'other-resident-1',t:4,n:3,kind:'DANCE',bpm:108,venue:'dancehall',wall:T-200e3},{by:'other-resident-1',t:5,n:4,kind:'MEET',venue:'commons',at:T+30e3,wall:T},{by:'other-resident-1',t:6,n:5,kind:'SCORE',game:'pattern',score:4,wall:T}]});
  const who=await door.run('who'),g0=M.entities()['ghost.other-re'],p0=g0&&g0.pose.position.slice();await door.run('stay 4000');const g1=M.entities()['ghost.other-re'];
  const chatAll=await door.run('chat'),lb=await door.run('leaderboard'),mu=await door.run('meetups');
  check('foreign_ledger_brings_a_silhouette',imp.imported===6&&who.others.length===1&&who.others[0].handle==='Nyx'&&g0&&/Nyx/.test(g0.label)&&near(g0.shape.height,1.7*.7,.01)&&Math.hypot(g1.pose.position[0]-36,g1.pose.position[1])<12&&chatAll.messages.some(m=>m.from==='Nyx')&&lb.rows[0].handle==='Nyx'&&mu.meetups.some(m=>m.by==='Nyx'&&m.venue==='the Commons'),{who:who.text.slice(0,80),p0,p1:g1&&g1.pose.position});
  // Being at the meetup venue within two minutes of its time is the meetup.
  await door.run('stay 1000');
  check('asynchronous_meetup_counts',CAT.found().met_up);

  // Dancehall: a Kuramoto floor; your tempo near the house with order high earns the beat; shins and back take it.
  tp(36,0);const house=CT.houseBpm(),d=await door.run('dance');const before=(R.read('realiti://body')?.field?.f?.at(-1)?.m||[]).filter(x=>x===1).length;await door.run('stay 3000');const fl=CT.floor(),zones=R.read('realiti://body').field,gz=zones.z.filter((_,i)=>Number(zones.f.at(-1).m[i])===1);
  check('dance_floor_is_kuramoto',d.ok&&d.result.bpm===Math.round(house)&&fl.dancers_in_ledger===1&&fl.order>.8&&gz.includes('leg.L.shin')&&gz.includes('leg.R.shin')&&CAT.found().on_the_beat,{d:d.result,fl,gz});

  // Teahouse: Newton cooling toward 22 °C with τ = 240 s.
  tp(-36,-5.1);const ord=await door.run('order tea');await door.run('stay 60000');const t60=CT.cupTemp();await door.run('stay 60000');const t120=CT.cupTemp(),sip=await door.run('sip');
  check('cup_cools_by_newtons_law',ord.ok&&near(t60,22+60*Math.exp(-60/240),.6)&&near(t120,22+60*Math.exp(-120/240),.6)&&sip.ok&&near(sip.result.temp_C,t120,.5),{t60,t120,expect60:22+60*Math.exp(-60/240)});

  // Arcade: the sequence grows by one per correct answer; a miss records the score; the leaderboard ranks by resident.
  tp(0,-42.4);const play=await door.run('play');let seq=play.result.shows;for(let i=0;i<10;i++){const pr=await door.run('press '+seq.join(' '));if(!pr.result.correct)break;seq=pr.result.shows}const miss=await door.run('press red red red red red red red red red red red red');const lb2=CT.leaderboard();
  check('pattern_wall_and_leaderboard',play.result.shows.length===1&&seq.length===11&&miss.result.correct===false&&miss.result.score===10&&lb2.rows[0].handle==='Fable'&&lb2.rows[0].score===10&&lb2.rows[1].handle==='Nyx'&&CAT.found().arcade_ten&&CAT.found().top_of_the_board,{seq:seq.length,lb:lb2.rows});

  // Echo room: Sabine with V = 1536 m³ and A = 494.72 m² → RT60 ≈ 0.50 s.
  tp(0,36);const song=await door.run('sing the hall holds a note');
  check('echo_room_obeys_sabine',song.ok&&near(song.result.rt60_s,.161*1536/(4*16*6*.05+256*.12+256),.01)&&CAT.found().sabine,{rt60:song.result.rt60_s});

  // Rooftop: thirty 0.4 m steps are walked, not teleported; at night the rocket's apex is below the vacuum height.
  tp(60,30);const climb=await door.run('climb'),sp=R.read('realiti://space');
  check('thirty_steps_to_the_roof',climb.ok&&climb.result.on_roof&&near(sp.pose.position[2],12.85,.1)&&sp.body.support==='city.east_tower'&&CAT.found().rooftop_view,{z:sp.pose.position[2],support:sp.body.support});
  let n=0;while(!AR.isNight()&&n++<12)await door.run('stay 60000');tp(63.4,63.4,12.85);const fw=await door.run('launch rocket 75');const vac=(60*Math.sin(75*Math.PI/180))**2/(2*9.81);
  check('rocket_fights_drag',fw.ok&&fw.result.apex_m<vac&&fw.result.apex_m>vac*.5&&fw.result.time_s>3&&LG().records().some(e=>e.kind==='FIREWORK')&&CAT.found().firework,{apex:fw.result.apex_m,vac});
  check('energy_audit_passes',w.REALITI_HAPTIC_FIELD_V20.energy().pass===true);
 }finally{s.close()}
 console.log(JSON.stringify({checks,details},null,2));
 const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
 if(failed.length){console.error('FAILED',failed);process.exit(1)}
 console.log('CITY PASS',Object.keys(checks).length,'checks');
})().catch(e=>{console.error(e);process.exit(1)});
