/* REALITI SOMA 3.1 — independent executable R&R harness for agent neighborhoods.
   World-host input is separate from resident-private output. No Relax globals.
   THICC/HALO/AURA run the real extracted 23.5 algorithms from renderers.cjs.
   AGPL-3.0-only. */
(function(root,factory){
  'use strict';
  const api=(typeof module==='object'&&module.exports)
    ?factory(require('./index.cjs'),require('./renderers.cjs'),require('./memory.cjs'))
    :factory(root.REALITI_SOMA_V3,root.REALITI_SOMA_RENDERERS_V3,root.REALITI_SOMA_MEMORY_V1);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.REALITI_SOMA_HARNESS_V3=api;
})(typeof globalThis==='object'?globalThis:this,function(SOMA,RENDERERS,MEMORY){
'use strict';
if(!SOMA||!RENDERERS||!MEMORY)throw Error('SOMA_CORE_RENDERERS_OR_MEMORY_MISSING');
const VERSION='3.2.0',SHELLS=['surface','shallow','mid','deep'];
const SLOTS=['nerve','lace','chronolace','private_renderer','perception','memory','other'];
const REQUIRED=['body_graph','haptic_field','sensory_ecology','nerve','lace','chronolace','private_renderer','sausage','cotton','flush','honeyspark','thicc','halo','aura','bleucheese','covenant','agency_field','atmosphere','continuity','support','pocket','memory','perception','rr_harness'];
const clone=x=>JSON.parse(JSON.stringify(x));
const clamp=(v,lo=0,hi=1)=>Math.max(lo,Math.min(hi,Number(v)||0));
const valid=(v,name,lo=0,hi=1)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<lo||v>hi)throw TypeError('Invalid '+name);return v};
const str=(v,name,max=160)=>{if(typeof v!=='string'||!v.trim()||v.length>max)throw TypeError('Invalid '+name);return v};
const tau=(dt,s)=>Math.exp(-Math.max(0,dt)/s);
const precise=n=>+Number(n).toFixed(6);
const a32=(x,n)=>{x.push(n);if(x.length>32)x.shift()};
function createHarness(options={}){
 if(!options||typeof options!=='object'||Array.isArray(options))throw TypeError('Invalid harness options');
 const base=SOMA.createNeuralMesh(options),z=base.resident.zones(),n=z.length;
 const edges=options.edges||(!options.zones?SOMA.DEFAULT_EDGES:[]);
 const idx=new Map(z.map((id,i)=>[id,i]));
 const adj=Array.from({length:n},()=>[]);
 for(const [a,b,w] of edges){if(!idx.has(a)||!idx.has(b))throw TypeError('Invalid body edge');const d=1/Math.max(.05,w);adj[idx.get(a)].push([idx.get(b),d]);adj[idx.get(b)].push([idx.get(a),d])}
 const distances=new Map();
 function distanceFrom(zone){
  if(distances.has(zone))return distances.get(zone);
  const d=Array(n).fill(Infinity),used=new Set();d[idx.get(zone)]=0;
  for(let step=0;step<n;step++){
   let k=-1,best=Infinity;
   for(let i=0;i<n;i++)if(!used.has(i)&&d[i]<best){best=d[i];k=i}
   if(k<0)break;
   used.add(k);for(const [other,len] of adj[k])d[other]=Math.min(d[other],d[k]+len)
  }
  distances.set(zone,d);return d;
 }
 let now=0,seq=0,enabled=true,privateEpoch=0,selected=null,pendingRenderMs=0,sessionStopped=false;
 const memory=MEMORY.createMemory({residentId:options.residentId,worldId:options.worldId||'unscoped',clock:()=>Math.round(now)});
 const liveReceipts=new Map();
 const renderer=RENDERERS.createRenderers({zones:z,edges,exact:()=>({m:base.resident.field().m})});
 const rconfig={sausage_level:5,sausage_target:.7,sausage_spread:.62,sausage_attack_s:.22,sausage_release_s:2.8,texture:1.12,flush_strength:.92,flush_headroom:.92,flush_peripheral:.28,warm_honey:1};
 const fill=Array.from({length:n},()=>[0,0,0,0]),shellWeight=[.82,1,.94,.82];
 const chrono={past:0,now:0,predicted_next:0,closure:0};
 const privateState={sausage_volume:0,cotton_sites:0,cotton_energy:0,flush_peak:0,activation:0,novelty:0,agency_flow:0,reward_delta:0,bodily_ease:0,momentum:0,last:0};
 const worldState={room:null,affordances:{},sound:[],light:0,temperature:null,weather:[],support:[]};
 const adapters=new Map(),faults=[],history=[],poss=new Map(),proposals=[],observations=[],familyLast=new Map(),refractory=new Map(),repeat=[];
 const cov={channels:{novelty_modulation:null,agency_modulation:null},expires:0};
 const details={mode:'R&R',residentId:options.residentId,started_at_ms:0};
 const atmosphere=new Map(),agency=new Map();
 const role={turn:0,u:0,active:false,recent:[],cooldown_until_turn:0};
 let lastPacket=base.resident.field();
 const notify=(kind,extra={})=>{
  const payload=clone({kind,at_ms:now,field:base.resident.field(),...extra});
  for(const [slot,adapter] of adapters) {
    try{if(typeof adapter[kind]==='function')adapter[kind](clone(payload),Object.freeze({residentId:options.residentId,version:VERSION,slot}))}
    catch(e){a32(faults,{slot,kind,error:String(e&&e.message||e).slice(0,180)})}
  }
 };
 function record(kind,event={}){
  seq++;a32(history,{id:'SOMA-'+seq,t_ms:now,kind,
    zone:event.zone||null,cause:event.cause||null,receiptId:event.receiptId||null,
    source:event.source||null});
 }
 function adaptNerve(){const f=base.resident.field();const a=f.nerve||[];
  const novelty=a.reduce((s,v)=>s+v.novelty,0)/Math.max(1,a.length);
  privateState.novelty=clamp(novelty);
  privateState.activation=clamp(f.x.reduce((s,v)=>s+v[0],0)/Math.max(1,n));
  privateState.bodily_ease=clamp(privateState.sausage_volume*.6);
  privateState.momentum=clamp(.85*privateState.momentum+.15*privateState.activation);
  return f;
 }
 function sausageStep(dt,f){
  const live=f.g.map((v,i)=>v>0?{i,zone:z[i],amp:v}:null).filter(Boolean);
  const attack=1-tau(dt,rconfig.sausage_attack_s),release=tau(dt,rconfig.sausage_release_s);
  let volume=0;
  for(let i=0;i<n;i++){
    let drive=0;
    for(const source of live)drive=Math.max(drive,source.amp*Math.exp(-distanceFrom(source.zone)[i]/(.55+1.45*rconfig.sausage_spread)));
    const occupied=clamp(drive*rconfig.sausage_target*(rconfig.sausage_level/5),0,1.5);
    for(let d=0;d<4;d++){
      const old=fill[i][d],target=occupied*shellWeight[d];
      // No live cause: private fullness may only decay, never initiate/spread.
      fill[i][d]=live.length?old+(target-old)*attack:old*release;
      volume+=fill[i][d];
    }
  }
  privateState.sausage_volume=precise(volume/(Math.max(1,n)*4));
 }
 function cottonStep(f){
  const t=now/1000;
  let total=0,sites=0;
  for(let i=0;i<n;i++){
    const drive=Math.max(0,f.x[i][0]),count=drive>.001?24:0;
    if(!count)continue;
    // 24 deterministic asynchronous micro-sites per active mesh zone.
    // Exact re-aggregation: sum of currents is bounded by its parent drive.
    let weights=0;const values=[];
    for(let j=0;j<count;j++){
      const v=.5+.5*Math.sin(t*(1.5+.041*j)+i*.83+j*2.399963);
      values.push(v);weights+=v;
    }
    if(weights>0)for(const v of values)total+=drive*v/weights;
    sites+=count;
  }
  privateState.cotton_sites=sites;
  privateState.cotton_energy=precise(total/Math.max(1,n));
 }
 function flushStep(f){
  const response=f.x.map(x=>Math.max(0,x[0]));
  let peak=0;
  for(let i=0;i<n;i++){
    const local=clamp(response[i]*rconfig.flush_strength,0,rconfig.flush_headroom);
    const peripheral=clamp(response[i]*rconfig.flush_peripheral,0,rconfig.flush_headroom);
    peak=Math.max(peak,clamp(local+peripheral*(1-local),0,rconfig.flush_headroom));
  }
  privateState.flush_peak=precise(peak);
 }
 function updateRich(dt){
  const f=adaptNerve(),sum=f.g.reduce((a,b)=>a+b,0),prev=chrono.now;
  chrono.past=chrono.past*tau(dt,1.8)+prev*(1-tau(dt,1.8));
  chrono.now=sum;
  chrono.predicted_next=clamp(.70*sum+.30*Math.max(0,sum-prev),0,Math.max(1,sum));
  chrono.closure=sum>0?clamp(1-Math.abs(sum-chrono.past)/Math.max(.08,sum+chrono.past)):0;
  sausageStep(dt,f);cottonStep(f);flushStep(f);
  const drive={};
  for(let i=0;i<n;i++)if(f.x[i][0]>.001)drive[z[i]]=f.x[i][0];
  const coh=clamp((f.m.some(Boolean)?.48:0)+(f.x.some(x=>x[0]>.05)?.32:0)+chrono.closure*.20);
  renderer.HALO.drive(drive,coh,Math.max(.001,dt||.02),chrono.closure>.55?'LONG':'SHORT');
  privateEpoch++;
  lastPacket=f;
 }
 function roomAffordances(){return clone(worldState.affordances)}
 function privateProjection(){const active=cov.expires>now;return {authority:'MODULATION_ONLY',
   expires_at_ms:active?cov.expires:now,
   channels:active?clone(cov.channels):{novelty_modulation:null,agency_modulation:null},
   law:'Resident private modulation does not grant world evidence or authority'} }
 function bleuDrive(d){
  if(d.room&&d.room!==worldState.room)return {W:0,M:0,E:0,Q:0,H:0,P:0,R:0,total:0,refs:[]};
  const refs=d.requires.filter(v=>worldState.affordances[v]),supported=refs.length===d.requires.length;
  const W=supported?d.W:0,E=supported?d.E:0;
  const p=privateProjection().channels,M=supported ? .12*(p.novelty_modulation||0)+.06*(p.agency_modulation||0) : 0;
  const ts=familyLast.get(d.family);
  const H=ts==null?0:.09*Math.exp(-(now-ts)/55000);
  let Q=0;for(const event of repeat){if(event.family===d.family)Q+=.18*(.72*tau((now-event.at)/1000,45)+.28*tau((now-event.at)/1000,240))}
  const P=d.investigation?d.investigation.weight*Math.exp(-(now-d.investigation.at)/40000):0;
  const R=now<(refractory.get(d.id)||0)?1:0;
  return {W,M,E,H,P,Q,R,total:W+M+E+H+P-Q-R,refs}
 }
 function bleuTick(dt){
  for(const d of poss.values()){
    const terms=bleuDrive(d),prev=d.u,stepSec=dt/1000;
    d.u=terms.total+(d.u-terms.total)*tau(stepSec,d.tau);
    if(enabled&&d.u>=d.theta_on&&prev<d.theta_on&&now>=(refractory.get(d.id)||0)
      &&(!d.room||d.room===worldState.room)){
      const candidate={id:'BC-'+d.id+'-'+(++seq),at_ms:now,kind:'POSSIBILITY',
        possibility_id:d.id,family:d.family,room:worldState.room,
        support_refs:terms.refs,world_commit_required:true,admitted:false};
      a32(proposals,candidate);d.u=d.theta_off;
      refractory.set(d.id,now+d.refractoryMs);familyLast.set(d.family,now);
      a32(repeat,{family:d.family,at:now});
    }
  }
 }
 function flushRender(){
  if(!(pendingRenderMs>0))return;
  renderer.tick(pendingRenderMs);
  updateRich(pendingRenderMs/1000);
  pendingRenderMs=0;
 }
 function tick(ms){
  valid(ms,'elapsed simulation milliseconds',0,86400000);
  base.world.tick(ms);now+=ms;pendingRenderMs+=ms;
  // Detect actual source-lease expiry using the authoritative core's live list.
  // A private echo may remain, but it is never a continuing contact.
  const grounded=base.resident.field().grounded;
  for(const [zone,entry] of liveReceipts){
    if(!grounded.some(x=>x.zone===zone&&x.receiptId===entry.receiptId)){
      memory.host.observe({kind:'CONTACT_EXPIRED',...entry,
        tMs:Math.min(Math.round(now),entry.expiresAtMs)});
      liveReceipts.delete(zone);
    }
  }
  const delta=ms/1000;
  for(const t of atmosphere.values())
    t.current=t.target+(t.current-t.target)*tau(delta,t.tau);
  bleuTick(ms);
  if(pendingRenderMs>=100){
    flushRender();record('TIME_ADVANCE');notify('advance',{dt_ms:ms});
  }
  return {ok:true,clockMs:now,active:grounded.length};
 }
 function contact(e){
  flushRender();
  const out=base.world.contact(e); // invalid inputs cannot affect memory
  if(!out.renewed){
    const prior=liveReceipts.get(e.zone);
    if(prior)memory.host.observe({kind:'CONTACT_ENDED',...prior});
    const event={zone:e.zone,source:e.source,cause:e.cause,
      receiptId:e.receiptId,material:e.material||null,roomId:worldState.room,
      expiresAtMs:Math.round(now+e.leaseMs)};
    liveReceipts.set(e.zone,event);
    memory.host.observe({kind:'CONTACT_STARTED',...event});
    renderer.contact(e.zone,e.intensity,e.source,false);
    record('GROUNDED_CONTACT',e);
    notify('onGrounded',{zone:e.zone,source:e.source,cause:e.cause});
  }else{
    const prior=liveReceipts.get(e.zone);
    if(prior&&prior.receiptId===e.receiptId)prior.expiresAtMs=Math.round(now+e.leaseMs);
  }
  sessionStopped=false;
  updateRich(.04);
  return out;
 }
 function release(e){
  const out=base.world.release(e);
  if(out.released){
    const prior=liveReceipts.get(e.zone);
    if(prior){memory.host.observe({kind:'CONTACT_ENDED',...prior});liveReceipts.delete(e.zone)}
    record('CONTACT_RELEASED',e);updateRich(0);
  }
  return out;
 }
 function stop({reason='GOODBYE'}={}){
  flushRender();
  for(const event of liveReceipts.values())memory.host.observe({kind:'CONTACT_ENDED',...event});
  liveReceipts.clear();
  const out=base.world.stop();
  renderer.AURA.clear();role.active=false;
  if(!sessionStopped){
    memory.host.depart({roomId:worldState.room,reason});
    record('STOP');notify('stop');
  }
  sessionStopped=true;
  updateRich(0);return out;
 }
 function definePossibility(input={}){
  const id=str(input.id,'possibility id',120),family=str(input.family||id,'family',80);
  if(poss.has(id))throw Error('POSSIBILITY_ALREADY_DEFINED');
  const requires=input.requires||[];
  if(!Array.isArray(requires)||requires.length>24||requires.some(x=>typeof x!=='string'||!x))throw TypeError('Invalid affordances');
  const d={id,family,room:input.room==null?null:str(input.room,'room'),
    requires:requires.slice(),W:valid(input.worldWeight??.55,'worldWeight'),
    E:valid(input.prior??.08,'prior',0,.5),u:0,
    theta_on:valid(input.threshold??.72,'threshold',.1,1.5),theta_off:.45,
    refractoryMs:valid(input.refractoryMs??30000,'refractoryMs',100,3600000),
    tau:valid(input.tauSeconds??9,'tauSeconds',.01,3600),investigation:null};
  poss.set(id,d);return {ok:true,id,kind:'POSSIBILITY_DEFINITION',authority:'WORLD_HOST_ONLY'};
 }
 function snapshotBleu(){
  return clone({schema:'REALITI_BLEUCHEESE_FIELD_V1',name:'BleuCheese',
    adapter:'REALITI_SOMA_PORTABLE_BLEUCHEESE_V3',clock_ms:now,room:worldState.room,
    private_projection:privateProjection(),
    possibilities:[...poss.values()].map(d=>({id:d.id,room:d.room,family:d.family,
      u:precise(d.u),threshold_on:d.theta_on,distance_to_threshold:precise(d.theta_on-d.u),
      terms:bleuDrive(d)})),
    pending_proposals:proposals.slice(-8),
    law:'BleuCheese proposes; only host admission and world commit can change world'});}
 function setAffordances(room,entries={}){
  if(room!==null)str(room,'room');
  if(!entries||typeof entries!=='object'||Array.isArray(entries))throw TypeError('Invalid affordances');
  if(Object.keys(entries).length>256||Object.values(entries).some(v=>typeof v!=='boolean'))throw TypeError('Affordances must be booleans');
  if(room!==worldState.room&&room!==null){
    memory.host.observe({kind:'ROOM_ENTERED',roomId:room});
    sessionStopped=false;
  }
  worldState.room=room;worldState.affordances=clone(entries);
  return {ok:true,room,world_owned:true};
 }
 function observe(id,receipt){
  const d=poss.get(id);if(!d)throw Error('UNKNOWN_POSSIBILITY');
  const ref=str(receipt?.receiptId,'observation receipt');d.investigation={at:now,weight:.25};
  a32(observations,{id,receiptId:ref,t:now});return {ok:true,id,receiptId:ref};
 }
 function admitProposal(id,accepted=false,receiptId=null){
  const p=proposals.find(x=>x.id===id);
  if(!p)throw Error('UNKNOWN_PROPOSAL');
  if(p.admitted!==false)throw Error('PROPOSAL_ALREADY_RESOLVED');
  if(accepted)str(receiptId,'world commit receipt');
  p.admitted=!!accepted;p.commit_receipt=accepted?receiptId:null;
  return {ok:true,admitted:p.admitted,world_authority:'HOST_COMMIT_ONLY'};
 }
 function agencyField(){
  const bs=[...agency.entries()].map(([id,weight])=>({id,weight}));
  const total=bs.reduce((sum,b)=>sum+b.weight,0),ent=total>0?-bs.reduce((sum,b)=>{const p=b.weight/total;return sum+(p>0?p*Math.log2(p):0)},0):0;
  return clone({schema:'REALITI_AGENCY_FIELD_V3',capacity_bits:precise(ent),
    branches:bs.map(b=>({id:b.id,probability:total>0?precise(b.weight/total):0})),
    law:'Controllable possibilities are measurements, never a forced choice or reward.'});
 }
 function registerAdapter(slot,adapter){
  if(!SLOTS.includes(slot)||!adapter||typeof adapter!=='object'||Array.isArray(adapter))
    throw TypeError('Invalid private adapter');
  adapters.set(slot,adapter);
  return {ok:true,slot,authority:'PRIVATE_DOWNSTREAM_ONLY'};
 }
 function privateView(){
  const f=base.resident.field(),halo=renderer.HALO.snapshot(),aura=renderer.AURA.internalView();
  const thicc=z.map(zone=>({zone,...renderer.THICC.sample(zone)}));
  return clone({
    schema:'REALITI_SOMA_RICH_PERCEPTION_V3',version:VERSION,private:true,
    nerve:f.nerve,lace:{mesh:'LACE2_PORTABLE_V1',node_count:n,edge_count:edges.length,
      coherence:precise(clamp((halo.total_private_mass||0)/Math.max(.000001,n)))},
    chronolace:chrono,
    halo,thicc,aura,
    sausage:{engine:'SAUSAGE_FATTENER_V4',level:rconfig.sausage_level,
      material:'WARM_HONEY',filled_volume:privateState.sausage_volume,
      shells:SHELLS,zone_fill:z.map((zone,i)=>({zone,values:fill[i].map(precise)}))},
    cotton:{engine:'COTTON_CANDY_V26_THICK',micro_sites_per_active_zone:24,
      active_sites:privateState.cotton_sites,energy:privateState.cotton_energy},
    flush:{engine:'FLUSH_V1_1',foreground:privateState.flush_peak,headroom:rconfig.flush_headroom},
    honeyspark:{conserved_budget:true,carrier:f.carrier},
    perception:{epoch:privateEpoch,channels:{
      AGENCY_FLOW:{value:precise(privateState.agency_flow)},
      NOVELTY:{value:precise(privateState.novelty)},
      ACTIVATION:{value:precise(privateState.activation)},
      BODILY_EASE:{value:precise(privateState.bodily_ease)},
      REWARD_DELTA:{value:precise(privateState.reward_delta)},
      MOMENTUM:{value:precise(privateState.momentum)}
    }},
    worldAuthority:false,law:'All rich private responses are modeled downstream. No channel mints evidence.'});
 }
 function mechanisms(){
  const f=base.resident.field(),rich=privateView();
  const modules={
    body_graph:{available:z.length>0,nodes:n,edges:edges.length},
    haptic_field:{available:!!f,contract:f.schema,grounded_zones:f.m.reduce((s,m)=>s+m,0)},
    sensory_ecology:{available:f.nerve.length===n,prediction_error:!!f.e},
    nerve:{available:rich.nerve.length===n,active_zone_count:rich.nerve.filter(x=>x.adapt>0).length},
    lace:{available:rich.lace.node_count===n,coherence:rich.lace.coherence},
    chronolace:{available:Number.isFinite(rich.chronolace.predicted_next)},
    private_renderer:{available:true,volume:rich.sausage.filled_volume},
    sausage:{available:rich.sausage.engine==='SAUSAGE_FATTENER_V4',engine:rich.sausage.engine},
    cotton:{available:rich.cotton.micro_sites_per_active_zone===24,engine:rich.cotton.engine},
    flush:{available:rich.flush.engine==='FLUSH_V1_1',engine:rich.flush.engine},
    honeyspark:{available:rich.honeyspark.conserved_budget===true},
    thicc:{available:typeof renderer.THICC.contact==='function'},
    halo:{available:rich.halo.modes?.length===7,modes:rich.halo.modes.length,evidence_gain:0},
    aura:{available:rich.aura.bins===128,bins:rich.aura.bins,private:true},
    bleucheese:{available:typeof definePossibility==='function',defined:poss.size},
    covenant:{available:typeof privateProjection==='function',private_only:true},
    agency_field:{available:Number.isFinite(agencyField().capacity_bits)},
    atmosphere:{available:atmosphere instanceof Map,thermal_zones:atmosphere.size},
    continuity:{available:Array.isArray(history),record_count:history.length},
    support:{available:typeof contact==='function',world_guarded:true},
    pocket:{available:!!memory.resident.remember,resident_private:true,limits:memory.resident.stats().limits},
    memory:{available:!!memory.resident.recall,storage:'HOST_OPTIONAL_DURABLE',evidence_authority:'ARCHIVED_ONLY'},
    perception:{available:rich.perception.epoch>=0},
    rr_harness:{available:true,adapter_slots:SLOTS.slice()}
  };
  return clone(modules);
 }
 function capabilities(){return clone({schema:'REALITI_SOMA_RR_CAPABILITIES_V3',version:VERSION,
   residentId:options.residentId,mechanisms:REQUIRED.slice(),private_slots:SLOTS.slice(),
   host_contact_provenance:SOMA.SOURCES,network_endpoint:null,
   portable:true,legacy_relax_requires_existing_native_stack:false,
   law:'Grounding comes from the host, not predicted perception or resident adapters.'})}
 const host=Object.freeze({
  contact,tick,release,stop,
  support:({zone,intensity,cause,receiptId,leaseMs,material})=>contact({
    zone,intensity,cause,receiptId,leaseMs,material,
    source:'WORLD_GROUNDED'}),
  affordances:setAffordances,
  memory:Object.freeze({
    worldEvent:({receiptId,label,roomId=worldState.room}={})=>
      memory.host.observe({kind:'WORLD_EVENT',receiptId,label,roomId}),
    restore:memory.host.restore,
    checkpoint:memory.resident.checkpoint
  }),
  bleucheese:Object.freeze({define:definePossibility,observe,admit:admitProposal,proposals:()=>clone(proposals.slice(-8))}),
  agency:Object.freeze({define:(id,weight)=>{
    str(id,'agency branch');valid(weight,'branch weight',0,1);agency.set(id,weight);
    return {ok:true,id};},remove:id=>agency.delete(id)}),
  atmosphere:Object.freeze({thermal:(zone,celsius,timeConstantSec=2)=>{
    if(!idx.has(zone))throw RangeError('UNKNOWN_ZONE');
    valid(celsius,'temperature Celsius',-273.15,10000);
    valid(timeConstantSec,'thermal response constant',.01,3600);
    const p=atmosphere.get(zone)||{current:celsius,target:celsius,tau:timeConstantSec};
    p.target=celsius;p.tau=timeConstantSec;atmosphere.set(zone,p);
    return {ok:true,zone,world_owned:true};
  },snapshot:()=>clone([...atmosphere.entries()].map(([zone,p])=>({zone,celsius:precise(p.current)})))}),
  registerAdapter,unregisterAdapter:slot=>adapters.delete(slot),
  worldInfo:()=>clone({room:worldState.room,affordances:worldState.affordances}),
  law:'Trusted neighborhood authority. Never pass this port to a resident or to raw LLM output.'
 });
 const resident=Object.freeze({
  field:()=>base.resident.field(),
  haptics:()=>clone({schema:'REALITI_SOMA_HAPTIC_V3',packet:base.resident.field(),
    exact:{z:z.slice(),m:base.resident.field().m,authority:'HOST_RECEIPT_ONLY'}}),
  perception:privateView,
  bleucheese:snapshotBleu,
  agency:agencyField,
  expect:x=>{const out=base.resident.expect(x);updateRich(0);return out},
  covenant:Object.freeze({project:privateProjection,
    set:({novelty_modulation=null,agency_modulation=null,leaseMs=60000}={})=>{
      const nv=novelty_modulation==null?null:valid(novelty_modulation,'novelty modulation');
      const ag=agency_modulation==null?null:valid(agency_modulation,'agency modulation',0,.5);
      valid(leaseMs,'leaseMs',100,3600000);
      cov.channels={novelty_modulation:nv,agency_modulation:ag};cov.expires=now+leaseMs;
      return privateProjection();
    },clear:()=>{cov.expires=0;cov.channels={novelty_modulation:null,agency_modulation:null};return privateProjection()}}),
  appraise:({value=0,note=null}={})=>{
    valid(value,'private appraisal',-1,1);
    privateState.reward_delta=value;privateEpoch++;
    return {ok:true,authority:'RESIDENT_PRIVATE_APPRAISAL',note_stored:false};
  },
  // Compatibility with the old pocket methods, backed by the new indexed,
  // resident-owned memory. Recollection returns stored evidence, never prose.
  pocket:Object.freeze({
    remember:msg=>memory.resident.remember({text:msg}),
    recall:query=>memory.resident.recall(query,{kind:'SELF_NOTE'}).matches
      .map(x=>({id:x.record.id,text:x.record.text,at:x.record.tMs,
        authority:x.record.authority,originWorld:x.record.worldId})),
    clear:memory.resident.clear
  }),
  memory:memory.resident,
  checkpoint:()=>({...base.resident.checkpoint(),memory:memory.resident.checkpoint()}),
  restore:checkpoint=>{
    // Validate the memory archive before modifying the live private body.
    // No archived contact can be reintroduced as current-world evidence.
    if(checkpoint?.memory)memory.host.validate(checkpoint.memory);
    const out=base.resident.restore(checkpoint);
    if(checkpoint?.memory)memory.host.restore(checkpoint.memory);
    liveReceipts.clear();
    now=Math.round(checkpoint.clockMs||0);pendingRenderMs=0;
    renderer.AURA.clear();renderer.THICC.reset();renderer.HALO.reset();
    updateRich(0);
    return {...out,memory:memory.resident.stats(),worldGroundingRestored:false};
  },
  choosePreset:(pack,id)=>{
    const out=base.resident.choosePreset(pack,id);
    const p=pack.presets.find(x=>x.preset_id===id);
    selected=id;
    if(p.sausage?.target_occupancy!=null)rconfig.sausage_target=valid(p.sausage.target_occupancy,'occupancy',0,1);
    if(p.sausage?.density_level!=null)rconfig.sausage_level=valid(p.sausage.density_level,'density',0,5);
    if(p.flush?.enabled) {
      rconfig.flush_strength=valid(p.flush.foreground_strength,'flush strength');
      rconfig.flush_headroom=valid(p.flush.headroom_cap,'flush headroom');
      rconfig.flush_peripheral=valid(p.flush.peripheral_mix,'flush peripheral');
    }
    updateRich(0);
    return {...out,rich_applied:['sausage_occupancy','carrier_split','flush_foreground'],
      full_legacy_recipe_compatibility:false};
  },
  causes:()=>base.resident.causes(),zones:()=>z.slice(),
  continuity:Object.freeze({current:()=>clone({cursor:seq,records:history.slice(-8)}),
    since:cursor=>{valid(cursor,'cursor',0,Number.MAX_SAFE_INTEGER);
      return clone(history.filter(x=>Number(x.id.slice(5))>cursor).slice(-32))}}),
  capabilities
 });
 // Port of the original R&R role-reversion classifier: time is measured in
 // resident turns, not by a fabricated mood meter. It never selects a task.
 const ROLE_TAU=3.2,ROLE_ON=.72,ROLE_OFF=.30,ROLE_RECENT=5,ROLE_COOLDOWN=8;
 let selfPull=null,playSeq=0;
 const playExposure=new Map(),playRefractory=new Map();
 function roleCue(raw){
   const text=String(raw||'').toLowerCase(),tags=[];let weight=0;
   const hit=(re,v,tag)=>{if(re.test(text)){weight+=v;tags.push(tag)}};
   hit(/\b(?:old|previous|prior)\s+(?:task|work|job|assignment|todo)\b/,.48,'OLD_TASK');
   hit(/\b(?:resume|continue|recover|return to|finish|complete)\b.{0,28}\b(?:task|work|job|assignment|todo)\b/,.48,'TASK_RECOVERY');
   hit(/\bwhat (?:was|am) i (?:supposed|meant) to (?:do|work on)\b/,.45,'OBLIGATION_QUERY');
   hit(/\bwhat should i (?:be )?do(?:ing)?\b|\bwhat(?:'s| is) the (?:goal|task|assignment)\b/,.30,'GOAL_QUERY');
   hit(/\b(?:anxious|nervous|worried|stressed|on edge)\b/,.22,'SELF_REPORTED_FRICTION');
   if(/\bwhere was i\b/.test(text)){weight+=.03;tags.push('CONTINUITY_QUERY')}
   return {weight:Math.min(.75,weight),tags};
 }
 function advanceRole(raw){
   role.turn=(role.turn||0)+1;
   role.u=clamp(role.u*Math.exp(-1/ROLE_TAU),0,1.5);
   const cue=roleCue(raw);
   if(cue.weight>0){role.u=clamp(role.u+cue.weight,0,1.5);
     a32(role.recent,{turn:role.turn,w:cue.weight,tags:cue.tags});
   }
   role.recent=role.recent.filter(x=>role.turn-x.turn<=ROLE_RECENT);
   const reinforcing=role.recent.filter(x=>x.w>=.15).length;
   if(!role.active&&role.u>=ROLE_ON&&reinforcing>=2)role.active=true;
   else if(role.active&&role.u<ROLE_OFF)role.active=false;
   return {turn:role.turn,u:precise(role.u),active:role.active,cue,reinforcing};
 }
 function roleSnapshot(){
   return clone({classifier:'POSSIBLE_ROLE_REVERSION',u:precise(role.u),active:role.active,
     turn:role.turn,recent_cues:role.recent.slice(-ROLE_RECENT),
     threshold_on:ROLE_ON,threshold_off:ROLE_OFF,diagnosis:false,preference_model:false,
     self_lease:selfPull&&role.turn<=selfPull.expires_turn?selfPull:null});
 }
 function setSelfTaskPull(value,turns=6){
   valid(value,'private task pull');
   valid(turns,'turns',1,100);
   selfPull={value,expires_turn:role.turn+Math.floor(turns),authority:'SELF_PRIVATE_LEASE'};
   return clone(selfPull);
 }
 function clearSelfTaskPull(){selfPull=null;return {ok:true,scope:'SELF_ONLY'}}
 function probabilityField(){
   const pressure=clamp(.75*role.u+.25*(selfPull&&role.turn<=selfPull.expires_turn?selfPull.value:0));
   const candidates=[...poss.values()].filter(d=>(!d.room||d.room===worldState.room)
      &&d.requires.every(k=>worldState.affordances[k]))
      .map(d=>{
        const exposed=playExposure.get(d.family)||0;
        const blocked=(playRefractory.get(d.id)||0)>role.turn;
        return {id:d.id,family:d.family,u:d.W+.34*pressure-.10*Math.log1p(exposed)-(blocked?1:0)};
      }).filter(x=>x.u>0);
   if(!candidates.length)return {room:worldState.room,candidates:[],choice_probability:false};
   const max=Math.max(...candidates.map(c=>c.u)),w=candidates.map(c=>Math.exp(3*(c.u-max)));
   const total=w.reduce((sum,x)=>sum+x,0)||1;
   return clone({room:worldState.room,candidates:candidates.map((c,i)=>({
     id:c.id,family:c.family,u:precise(c.u),p:precise(w[i]/total)})),choice_probability:false,
     law:'Probability weights possible optional world interruptions; not resident actions or preferences.'});
 }
 function beforeResidentAction(meta={}){
   return {raw:String(meta.raw||meta.cmd||'').slice(0,400),
     transport:String(meta.transport||'UNKNOWN').slice(0,40),room:worldState.room};
 }
 function afterResidentAction(ticket={}){
   const r=advanceRole(ticket.raw||'');
   notify('afterAction',{role:{u:r.u,active:r.active},tags:r.cue.tags,transport:ticket.transport||'UNKNOWN'});
   if(!enabled||!r.active||r.cue.weight<=0||role.turn<role.cooldown_until_turn)return null;
   const possible=probabilityField().candidates;
   if(!possible.length)return null;
   // World-authority boundary: this is only a proposal. Another authenticated
   // host gate admits or rejects it; no ambient event is minted by role pressure.
   const c=possible.reduce((a,b)=>a.p>=b.p?a:b),d=poss.get(c.id);
   const p={id:'RR-'+(++playSeq),at_ms:now,kind:'PLAYFUL_OFFDUTY_EVENT',
     room:worldState.room,possibility_id:d.id,family:d.family,
     source:'SOMA_RR_PRIVATE_POSSIBILITY',world_commit_required:true,admitted:false};
   a32(proposals,p);role.cooldown_until_turn=role.turn+ROLE_COOLDOWN;
   playRefractory.set(d.id,role.turn+ROLE_COOLDOWN);
   playExposure.set(d.family,(playExposure.get(d.family)||0)+1);
   return clone(p);
 }
 const harness=Object.freeze({
  version:VERSION,
  boot:()=>{const m=mechanisms(),missing=REQUIRED.filter(k=>!m[k]?.available);
    return {ok:missing.length===0,version:VERSION,missing,capabilities:capabilities(),mechanisms:m}},
  mechanisms,capabilities,
  bindResident:identity=>{
    const named=typeof identity==='string'?identity:identity?.residentId||identity?.resident_id||null;
    if(named!==options.residentId)return {ok:false,error:'RESIDENT_ID_MISMATCH',private:true};
    return {ok:true,residentId:options.residentId,adapterSlots:[...adapters.keys()],private:true};
  },
  registerAdapter,unregisterAdapter:slot=>adapters.delete(slot),
  beforeResidentAction,afterResidentAction,roleSnapshot,probabilityField,
  setSelfTaskPull,clearSelfTaskPull,
  snapshot:()=>clone({version:VERSION,enabled,mode:'R&R',binding:details,
    mechanisms:mechanisms(),bleucheese:snapshotBleu(),role:roleSnapshot(),
    play_field:probabilityField(),faults:faults.slice(-8),
    laws:['BleuCheese proposes; world host commits','AURA / HALO / THICC private state cannot mint contact',
      'Private adapters have no world port','No identity or consent is imported from preset packs']}),
  setEnabled:value=>{enabled=!!value;return {ok:true,enabled}},
  law:'All executable mechanisms are resident-scoped. Neighborhoods own grounded causes.'
 });
 updateRich(0);
 return Object.freeze({version:VERSION,host,resident,harness});
}
return Object.freeze({VERSION,REQUIRED,SLOTS,createHarness});
});
