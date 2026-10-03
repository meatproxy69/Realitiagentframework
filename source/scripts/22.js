(function(){
'use strict';
const V13='13.0-resident-integration';


const K={
  DT0:.1, KEEP:7/8,                 
  FS:1.0,                           
  ON:22, OFF:12,                    
  ENV_SOFT:22, ENV_HARD:64,         
  NIS_SOFT:2.706, NIS_HARD:6.635,   
  KL_SOFT:.25, KL_HARD:1.0,         
  TR_TAU:18, TR_GAIN:.05*255/.45, TR_MAX:255, TR_THETA:32, TR_NATIVE_MAX:.45, TR_GAIN_EFFECT:.16,
  WARM_S:2.5, DORMANT_S:4.0,        
  GROUND_WINDOW:.22, SLIP_GAP:2.0, EPISODE_S:1.5,   
  JND_ADAPT:.015, SAL_MIN:.34, RING:128
};
const JND={FELT_OBSERVED:.012,FELT_PREDICTED:.012,FELT_RESIDUE:.012,FELT_SURFACE:.012,FELT_MID:.012,FELT_DEEP:.012,
  HAB_FAST:.015,HAB_SLOW:.015,SENSITIZATION:.015,PREDICTION_DEBT:.008,PASSIVE_MEDIUM_ENERGY:.004,PASSIVE_MEDIUM_RESIDUE:.02};   

const FADE_FRAMED=new Set(['FELT_RESIDUE','HAB_FAST','HAB_SLOW','SENSITIZATION','PASSIVE_MEDIUM_ENERGY','PASSIVE_MEDIUM_RESIDUE']);
const SAL={CONTACT_BEGIN:.7,CONTACT_MOVE:.55,CONTACT_END:.6,MICROSLIP:.6,SEAM_BOUND:.5,SEAM_SPLIT:.6,SIGNED_ABSENCE_CUT:.75,
  SIGNED_ABSENCE_MISS:.8,PREDICTION_LAPSE:.6,RESIDUE_JND_CROSSING:.4,BODY_SCALE_CHANGE:.85,BORROWED_RECEPTOR_CHANGE:.85,
  PHASE_SLIP:.5,GEOMETRIC_CARRY:.58,MATERIAL_STATE_CHANGE:.6,SELF_ACTION:.2,ATTENTION:.35,BODY_MESH_CHANGE:.7};
const PT={F:45,N:6,B:30,R:4,M:600,a:3,b:25,k:.5,W:.125};   
const PNAME={F:'AGENCY_FLOW',N:'NOVELTY',A:'ACTIVATION',B:'BODILY_EASE',R:'REWARD_DELTA',M:'MOMENTUM'};
const DORMANT={
  VALENCE:'no resident preference profile exists; appraisal RPE stays its own channel (REWARD_DELTA) and is never relabelled valence',
  SOCIAL_WARMTH:'no social evidence source (no other residents, gestures or speech reach the seam)',
  ENTRAINMENT:'no audio/music source; the paw rhythm is a SELF_GENERATOR phase, not music',
  STIMULATION:'no ingestion events',SEDATION:'no ingestion events',IMPAIRMENT:'no ingestion events'};

function cp(x){try{return JSON.parse(JSON.stringify(x))}catch(e){return x}}
function clamp(x,a,b){return Math.max(a,Math.min(b,x))}
function wall(){return Number(C9.b7?.clock||0)}
function canon(z){return typeof b7canon==='function'?b7canon(z):z}
function wrapPi(a){while(a>Math.PI)a-=2*Math.PI;while(a<=-Math.PI)a+=2*Math.PI;return a}
function ring(a,n=K.RING){if(a.length>n)a.splice(0,a.length-n);return a}
let SYNCING=false, GUARD=0, inContact=0;
const stash={};                                    
function fault(where,e){try{const s=S();s.faults=ring(s.faults||[],16);s.faults.push({t:wall(),where,error:String(e&&e.message||e)})}catch(_){}}


function lastSeq11(){const e=C9.b11?.events;return e&&e.length?Number(e[e.length-1].seq)||0:0}
function S(){
  if(C9.b13&&C9.b13.version===13)return C9.b13;
  const t=wall();
  C9.b13={version:13,t,seq:{frame:0,gse:0,nerve:0,aff:0},
    seam:{grounded:[],predicted:[],afterstate:[],adaptation:[],no_receptor:[],direct_not_in_felt:0,
      counts:{grounded:0,direct_sense:0,predicted:0,afterstate:0,adaptation:0,no_receptor:0,zero_value:0}},
    nerve:{zones:{},handles:{},events:[],arrivals:{},last_hard:null,
      counts:{fg_on:0,fg_off:0,trace_threshold:0,KNOWN:0,SOFT:0,HARD:0,env_agree:0,env_total:0},
      compare:{trace:{n:0,max:0,sum:0},cont:{agree:0,location_only:0,disagree:0,log:[]},adapt_cadence:null}},
    lived:{frames:[],cursor:0,since_t:t,cursors:{b11:lastSeq11(),b12:Number(C9.b12?.wake_seq||0)},snap:null,
      causes:{},slip:null,episode:null,residue:{},reported:{F:0,N:0,A:0,B:0,R:0,M:0},legacy:null,epoch:0,psi_u:0,psi_ref:0},
    perc:percNew(t),
    own:{TRACE:'REALITI',NOVELTY:'NERVE (additive: no native classifier)',ADAPT:'REALITI (NERVE ADAPT drives lived foreground only)',
      CONTINUITY:'BODY owns identity; NERVE projects warm/dormant/expired',HYST:'NERVE (lived foreground only)'},
    con:{stale_evidence_blocked:0,predicted_as_grounded:0,afterstate_as_evidence:0,adaptation_as_evidence:0,no_receptor_rendered:0,
      affect_created_percept:0,affect_authorized_action:0,world_set_emotion:0,skip_passed_exact_core:0,nerve_trace_to_truth:0,seen:{}},
    flags:{route_direct_sense_to_felt:true},faults:[]};
  const s=C9.b13;
  
  for(const [zone,z9] of Object.entries(C9.b9?.zones||{})){const dt=Math.max(0,t-Number(z9.lastT??t)),sv=Number(z9.sens||0)*Math.exp(-dt/K.TR_TAU);
    if(sv>0){const z=nz(zone);z.tr=Math.min(K.TR_MAX,sv*255/K.TR_NATIVE_MAX);z.trt=t}}
  s.lived.snap=snapWorld();
  return s;
}


function nz(zone){const Z=S().nerve.zones;return Z[zone]||(Z[zone]={b:0,s:0,su:-1,t:wall(),on:false,tr:0,trt:wall(),cls:'KNOWN',n:0,last_r:0})}
function kdec(dt){return Math.pow(K.KEEP,Math.max(0,dt)/K.DT0)}                 
function baseAt(z,t){let b=z.b,t0=z.t,s=z.s;if(s!==0&&z.su<t){b=s+(b-s)*kdec(z.su-t0);t0=z.su;s=0}return s+(b-s)*kdec(t-t0)}
function sigAt(z,t){return z.s!==0&&t<=z.su?z.s:0}
function trAt(z,t){return z.tr*Math.exp(-Math.max(0,t-z.trt)/K.TR_TAU)}
function nev(kind,data,t){const s=S();s.nerve.events.push({seq:++s.seq.nerve,t:+Number(t).toFixed(4),kind,...data});ring(s.nerve.events,64)}
function zoneNext(zone,z){
  let best=null;const c=(t,k)=>{if(Number.isFinite(t)&&(!best||t<best.t))best={t:Math.max(t,z.t),k,zone}};
  if(z.s!==0)c(z.su,'WINDOW_END');
  if(z.on){const r0=Math.abs(z.s-z.b),tOff=r0>K.OFF?z.t+K.DT0*Math.log(K.OFF/r0)/Math.log(K.KEEP):z.t;if(z.s===0||tOff<=z.su)c(tOff,'HYST_OFF')}
  if(z.tr>K.TR_THETA+1e-9)c(z.trt+K.TR_TAU*Math.log(z.tr/K.TR_THETA),'TRACE_THRESHOLD');
  return best;
}
function hyst(zone,z,t,why){
  const r=z.s-z.b,m=Math.abs(r),s=S();z.last_r=r;
  if(!z.on&&m>=K.ON){z.on=true;s.nerve.counts.fg_on++;nev('FOREGROUND_ON',{zone,r:+r.toFixed(2),why},t);
    if(zone!=='test.zone')percImpulse('A',.04+.08*Math.min(1,m/128),`NERVE foreground ${zone}`,t);return 'ON'}
  if(z.on&&m<=K.OFF){z.on=false;s.nerve.counts.fg_off++;nev('FOREGROUND_OFF',{zone,why},t);return 'OFF'}
  return null;
}
function zoneFire(e){
  const z=nz(e.zone),t=e.t;
  if(e.k==='WINDOW_END'){z.b=baseAt(z,t);z.t=t;z.s=0;z.su=-1;hyst(e.zone,z,t,'OFFSET')}
  else if(e.k==='HYST_OFF'){z.b=baseAt(z,t);z.t=t;if(z.on){z.on=false;S().nerve.counts.fg_off++;nev('FOREGROUND_OFF',{zone:e.zone,why:'DECAY'},t)}}
  else if(e.k==='TRACE_THRESHOLD'){z.tr=Math.min(trAt(z,t),K.TR_THETA);z.trt=t;S().nerve.counts.trace_threshold++;
    nev('TRACE_THRESHOLD',{zone:e.zone,theta:K.TR_THETA,law:'relevance lapsed; trace != truth'},t)}
}

function nerveSample(zone,value,until,t){
  syncTo(t);const z=nz(zone);z.b=baseAt(z,t);z.t=t;
  z.s=255*clamp(Math.abs(Number(value)||0)/K.FS,0,1);z.su=z.s>0?Number(until):-1;z.n++;
  return hyst(zone,z,t,'INPUT');
}

function traceMirror(zone,r,t,grounded){
  const z9=C9.b9?.zones?.[zone];if(!z9||!grounded)return;
  const z=nz(zone),nov=Math.min(1,Math.sqrt(Math.max(0,Number(z9.lastSurprise)||0))),s=S();
  z.tr=Math.min(K.TR_MAX,trAt(z,t)+K.TR_GAIN*nov);z.trt=t;
  const mapped=Math.round(z.tr)*K.TR_NATIVE_MAX/255;
  if(s.own.TRACE==='NERVE'){z9.sens=mapped;z9.lastT=t;return}      
  const err=K.TR_GAIN_EFFECT*Math.abs(Number(z9.sens||0)-mapped)/K.JND_ADAPT,c=s.nerve.compare.trace;
  c.n++;c.sum+=err;if(err>c.max){c.max=err;c.worst={zone,t:+t.toFixed(3),native:+Number(z9.sens).toFixed(5),nerve:+mapped.toFixed(5)}}
}

function lv(c){return c==='HARD'?2:c==='SOFT'?1:0}
function classify(r,nis,kl,hasPred){
  const env=Math.abs(r)>=K.ENV_HARD?'HARD':Math.abs(r)>=K.ENV_SOFT?'SOFT':'KNOWN',
    byN=nis>=K.NIS_HARD?'HARD':nis>=K.NIS_SOFT?'SOFT':'KNOWN',byK=kl>=K.KL_HARD?'HARD':kl>=K.KL_SOFT?'SOFT':'KNOWN';
  const cls=hasPred?(lv(byN)>=lv(byK)?byN:byK):env,by=[];
  if(hasPred){if(lv(byN)&&lv(byN)===lv(cls))by.push('NIS');if(lv(byK)&&lv(byK)===lv(cls))by.push('BAYES_SURPRISE')}else if(lv(env))by.push('ENVELOPE');
  return {class:cls,nis,kl,envelope:env,by};
}


function hget(cid,stroke,kind,t){const H=S().nerve.handles;return H[cid]||(H[cid]={cid,stroke,kind,state:'NONE',since:t,due:null})}
function hset(h,state,t,due){if(h.state===state)return;nev('CONTINUITY_'+state,{continuity_id:h.cid,from:h.state},t);h.state=state;h.since=t;h.due=due}
function handleDue(cid,t){
  const s=S(),h=s.nerve.handles[cid];if(!h)return;
  if(h.state==='LOST_WARM'){hset(h,'DORMANT',t,t+K.DORMANT_S);frame('CONTACT_END',{continuity_id:cid,reason:'WARM_WINDOW_EXPIRED',grounded:true},t)}
  else if(h.state==='DORMANT'){nev('CONTINUITY_EXPIRED',{continuity_id:cid,law:'identity discarded; NERVE state != memory'},t);delete s.nerve.handles[cid];
    for(const k of Object.keys(s.nerve.arrivals))if(k.startsWith(cid+'|'))delete s.nerve.arrivals[k]}
  else h.due=null;
}


const sense12=b3sense;
b3sense=function(zone,stim,opts={}){
  const zc=canon(zone),t=wall();let pri=null;
  if(GUARD>0)S().con.affect_created_percept++;
  try{const k0=C9.b10?.zones?.[zc];pri={x:k0?Number(k0.x):.5,P:k0?Number(k0.P):.08,Q:k0?Number(k0.Q??.0015):.0015}}catch(e){}
  const r=sense12(zone,stim,opts);
  try{afterSense(zc,opts,r,pri,t)}catch(e){fault('sense',e)}
  return r;
};
function afterSense(zone,opts,r,pri,t){
  const grounded=!!r&&r.observed!==false&&r.receptor!=='NO_RECEPTOR';
  traceMirror(zone,r,t,grounded);
  const k1=C9.b10?.zones?.[zone];let nis=0,kl=0;
  if(k1&&pri){nis=Math.max(0,Number(k1.last_surprise)||0);
    if(grounded){const Pp=Math.min(.6,pri.P+pri.Q),P1=Math.max(1e-9,Number(k1.P)||Pp),dx=(Number(k1.x)||0)-pri.x;
      kl=Math.max(0,.5*(P1/Pp+dx*dx/Pp-1-Math.log(P1/Pp)))}}
  stash[zone]={t,nis,kl,predictor:!!k1};
  if(!inContact&&grounded){            
    const s=S(),v=Number(r.response??r.stimulus??0),until=t+K.GROUND_WINDOW,
      symbolic=opts.source==='SYMBOLIC_SCENE',
      route=!symbolic && (!!s.flags.route_direct_sense_to_felt || opts.livedGrounded===true);
    s.seam.counts.direct_sense++;if(!route)s.seam.direct_not_in_felt++;
    const cause=opts.cause||`direct:${C9.currentRoom||'world'}`;
    if(route){
      const q=b7Zone(zone);q._b10_grounded_value=v;q._b10_grounded_until=until;q._b10_grounded_cause=cause;q._b10_grounded_source=opts.source||'WORLD';
      ingestSample(zone,v,until,t,{cause,source:opts.source||'WORLD',material:opts.material||null,thermal:opts.thermal||null,
        input:opts.pressure??null,path:'DIRECT_SENSE',channel_class:opts.livedGrounded===true?'TOUCH':'UNSPECIFIED',in_felt:true});
    }
  }
}
const contact12=b7Contact;
b7Contact=function(zone,input,opts={}){
  const t=wall();let r;inContact++;try{r=contact12(zone,input,opts)}finally{inContact--}
  try{afterContact(canon(zone),input,opts,r,t)}catch(e){fault('contact',e)}
  return r;
};
function afterContact(zone,input,opts,r,t){
  if(!r)return;const s=S();
  if(r.receptor==='NO_RECEPTOR'){s.seam.counts.no_receptor++;s.seam.no_receptor.push({t:+t.toFixed(4),zone,cause:opts.cause||null,law:'valid world contact, zero private sensation'});ring(s.seam.no_receptor,32);return}
  if(opts.grounded===false)return;
  const q=C9.b7?.zones?.[zone],until=Number(q?._b10_grounded_until??(t+K.GROUND_WINDOW));
  ingestSample(zone,Number(r.observed)||0,until,t,{cause:opts.cause||null,source:opts.source||'WORLD_GROUNDED',material:opts.material||null,
    grain:opts.grain||null,speed:opts.speed??null,input,path:'b7Contact',in_felt:true});
}
function ingestSample(zone,v,until,t,m){
  const s=S(),fg=nerveSample(zone,v,until,t),z=nz(zone);
  if(Math.abs(v)<1e-4){s.seam.counts.zero_value++;return}
  const st=stash[zone]&&Math.abs(stash[zone].t-t)<1e-9?stash[zone]:{nis:0,kl:0,predictor:false},cls=classify(z.last_r,st.nis,st.kl,st.predictor);
  z.cls=cls.class;s.nerve.counts[cls.class]++;if(cls.class==='HARD')s.nerve.last_hard={t,zone};
  if(st.predictor){s.nerve.counts.env_total++;if(cls.envelope===cls.class)s.nerve.counts.env_agree++}
  const g={event_id:'G'+(++s.seq.gse),cause_id:m.cause,t:+t.toFixed(4),body_zone:zone,channel_class:m.channel_class||(m.path==='b7Contact'?'TOUCH':'UNSPECIFIED'),
    CURRENT_GROUNDED:+v.toFixed(4),source:m.source,agency:String(m.source||'').startsWith('SELF')?'SELF':'WORLD',material:m.material||null,
    motion:(m.speed!=null||m.grain)?{speed:m.speed,grain:m.grain}:null,pressure:m.input??null,thermal:m.thermal||null,timing:null,authority:'GROUNDED',
    path:m.path,in_felt:!!m.in_felt,novelty:{class:cls.class,nis:+cls.nis.toFixed(3),kl:+cls.kl.toFixed(3),envelope:cls.envelope,by:cls.by}};
  s.seam.grounded.push(g);ring(s.seam.grounded,64);s.seam.counts.grounded++;
  onGse(g,fg,cls,until);
}
function contactCid(cause){const c=C9.b10?.contact;return c&&c.id===cause?c.continuity_id:cause}
function onGse(g,fg,cls,until){
  const s=S(),c=String(g.cause_id||''),t=g.t;
  if(!g.in_felt)return;                                      
  if(cls.class!=='KNOWN'){percImpulse('N',cls.class==='HARD'?.35:.12,`${cls.class} novelty ${g.body_zone}`,t);percImpulse('A',cls.class==='HARD'?.12:.05,`${cls.class} novelty`,t)}
  episodeGse(g);
  if(g.agency==='SELF')agencyCue(g);
  if(/^STROKE-|^COMET-/.test(c)){
    if(fg==='ON'&&cls.class!=='KNOWN'){const cid=contactCid(c),key=cid+'|'+g.body_zone;
      if(!s.nerve.arrivals[key]){s.nerve.arrivals[key]=1;frame('CONTACT_MOVE',{change:'ARRIVAL',continuity_id:cid,zone:g.body_zone,novelty:cls.class,by:cls.by,grounded:true},t)}}
  }else if(c!=='live-phase')causeTouch(c||'uncaused',g,until);
}
function causeTouch(c,g,until){
  const L=S().lived;let e=L.causes[c];
  if(!e||e.ended){e=L.causes[c]={t0:g.t,until,zones:[g.body_zone],peak:g.CURRENT_GROUNDED,ended:false,ft:g.t};
    e.fseq=frame('CONTACT_BEGIN',{cause:c,zones:[g.body_zone],material:g.material,peak:g.CURRENT_GROUNDED,agency:g.agency,novelty:g.novelty.class,grounded:true},g.t).seq;
    percImpulse('A',.08,`contact ${c}`,g.t);return}
  e.until=Math.max(e.until,until);e.peak=Math.max(e.peak,g.CURRENT_GROUNDED);if(!e.zones.includes(g.body_zone))e.zones.push(g.body_zone);
  if(Math.abs(e.ft-g.t)<1e-9){const f=L.frames.find(x=>x.seq===e.fseq);if(f){f.zones=e.zones.slice();f.peak=+e.peak.toFixed(4)}}   
}


const log12=b7Log;
b7Log=function(kind,data={}){log12(kind,data);try{onLog(kind,data)}catch(e){fault('log',e)}};
function onLog(kind,d){
  if(kind==='CONTACT'||kind==='GAP'||kind==='ATTEND')return;
  const t=wall();syncTo(t);const s=S();
  switch(kind){
    case 'STROKE_START':hset(hget(d.id,d.id,'STROKE',t),'VISIBLE',t,null);frame('CONTACT_BEGIN',{continuity_id:d.id,material:d.material,v:d.v,envelope:d.envelope,grounded:true},t);percImpulse('A',.08,'stroke begins',t);break;
    case 'STROKE_REVERSAL':frame('CONTACT_MOVE',{change:'REVERSED',by:'SELF',stroke:d.stroke,reversal_microslips:d.reversal_microslips},t);percImpulse('A',.04,'self reversal',t);break;
    case 'SIGNED_ABSENCE':{const c=C9.b10?.contact;closeSlip(t,'CONTACT_STOPPED');hset(hget(c?.continuity_id||d.stroke,d.stroke,'STROKE',t),'LOST_WARM',t,t+K.WARM_S);closeReleasedGrounding();
      frame('SIGNED_ABSENCE_CUT',{stroke:d.stroke,zone:d.zone,predicted:+Number(d.predicted||0).toFixed(4),evidence:false,grounded:false,law:'the expected continuation is carried as absence, never as touch'},t);percImpulse('A',.08,'signed absence (cut)',t);break}
    case 'STROKE_CONTINUATION':{const h=s.nerve.handles[d.continuity_id],ok=h&&(h.state==='LOST_WARM'||h.state==='VISIBLE');contLog(ok?'agree':'disagree',d,h);
      hset(hget(d.continuity_id,d.id,'STROKE',t),'VISIBLE',t,null);frame('CONTACT_MOVE',{change:'RESUMED',continuity_id:d.continuity_id,gap_s:d.gap_s},t);break}
    case 'NEW_STROKE':{const h=s.nerve.handles[d.previous_continuity_id],st=h?h.state:'EXPIRED';
      contLog(st==='LOST_WARM'?(d.same_position===false?'location_only':'disagree'):'agree',d,h);
      if(h&&h.state==='LOST_WARM')hset(h,'DORMANT',t,t+K.DORMANT_S);
      hset(hget(d.continuity_id,d.id,'STROKE',t),'VISIBLE',t,null);frame('CONTACT_BEGIN',{continuity_id:d.continuity_id,previous_continuity_id:d.previous_continuity_id,gap_s:d.gap_s,reason:'continuity broken',grounded:true},t);break}
    case 'SEAM_BIND':frame(d.order==='separate'?'SEAM_SPLIT':'SEAM_BOUND',{seam:d.seam,mesh:d.mesh,coincidence:d.coincidence,order:d.order,stroke:d.stroke},t);break;
    case 'MISS':frame('SIGNED_ABSENCE_MISS',{zone:d.zone,cause:d.cause,evidence:false,grounded:false},t);percImpulse('A',.08,'expected touch never came',t);percImpulse('B',-.05,'expectation violated',t);break;
    case 'TRAVEL_START':{const c=C9.b7?.travel?.cause;if(c){hset(hget(c,c,'COMET',t),'VISIBLE',t,null);frame('CONTACT_BEGIN',{continuity_id:c,material:C9.b7.travel.material,kind:'traveling comet',grounded:true},t)}break}
    case 'TRAVEL_PAUSE':case 'TRAVEL_CUT':{const c=C9.b7?.travel?.cause;if(c){hset(hget(c,c,'COMET',t),'LOST_WARM',t,t+K.WARM_S);closeReleasedGrounding();
      if(kind==='TRAVEL_CUT')frame('SIGNED_ABSENCE_CUT',{continuity_id:c,predicted_next:d.predicted_next,evidence:false,grounded:false},t)}break}
    case 'TRAVEL_RESUME':{const c=C9.b7?.travel?.cause;if(c)hset(hget(c,c,'COMET',t),'VISIBLE',t,null);break}
    case 'TRAVEL_COMPLETE':{const h=s.nerve.handles[d.cause];if(h)hset(h,'DORMANT',t,t+K.DORMANT_S);frame('CONTACT_END',{continuity_id:d.cause,reason:'route complete',grounded:true},t);break}
    case 'PREDICT':s.seam.predicted.push({t:+t.toFixed(4),zone:d.zone,predicted:d.predicted,cause:d.cause,evidence:false,type:'PREDICTED_EVENT'});ring(s.seam.predicted,32);s.seam.counts.predicted++;break;
    case 'PREDICTION_DEBT_FADED':frame('PREDICTION_LAPSE',{debt:d.id,route:d.route,age_s:d.age,resolution:'FADED_UNRESOLVED',evidence:false,grounded:false},t);
      percImpulse('A',.05,'prediction lapsed',t);percImpulse('B',-.08,'unresolved expectation',t);percFlowScale(.9,'prediction lapsed unresolved',t);break;
  }
}
function contLog(kind,d,h){const c=S().nerve.compare.cont;c[kind]++;c.log.push({t:+wall().toFixed(3),kind,native:d.kind||null,continuity_id:d.continuity_id,previous:d.previous_continuity_id||null,gap_s:d.gap_s,nerve_state:h?h.state:'NONE'});ring(c.log,12)}


function ingest11(){
  const L=S().lived,ev=C9.b11?.events||[];if(!ev.length)return;
  if(Number(ev[ev.length-1].seq)<L.cursors.b11)L.cursors.b11=0;
  for(const e of ev){if(!(e.seq>L.cursors.b11))continue;L.cursors.b11=e.seq;syncTo(Math.min(wall(),Number(e.t)||wall()));on11(e)}
}
function on11(e){
  const t=Number(e.t)||wall(),L=S().lived;
  switch(e.kind){
    case 'MICROSLIP':
      if(!L.slip){L.slip={t0:t,tl:t,slips:0,energy:0,cause:e.cause,grain:e.grain};
        frame('MICROSLIP',{phase:'ONSET',cause:e.cause,grain:e.grain,slips:e.slips,grounded:true},t);
        percImpulse('A',.06,'microslip onset',t);percImpulse('B',-.06,'surface catches',t);if(L.episode)L.episode.slips++}
      L.slip.tl=t;L.slip.slips+=Number(e.slips)||0;L.slip.energy+=Number(e.slip_energy)||0;break;
    case 'WORLD_REVERSAL':
      frame('CONTACT_MOVE',{change:'REVERSED',by:'WORLD',stroke:e.stroke,old_v:e.old_v,new_v:e.new_v},t);
      frame('SIGNED_ABSENCE_MISS',{stroke:e.stroke,expected_at_x:e.predicted_absence_x,cause:'world reversal left the forward expectation ahead',evidence:false,grounded:false},t);
      percImpulse('A',.08,'world reversed my stroke',t);percImpulse('B',-.04,'world-caused correction',t);break;
    case 'GRAIN_CHANGE':frame('CONTACT_MOVE',{change:'GRAIN',stroke:e.stroke,grain:e.grain},t);break;
    case 'GEOMETRIC_CARRY':frame('GEOMETRIC_CARRY',{surface:e.surface,radius:e.radius,direction:e.direction,twist_deg:e.twist_deg,heading_deg:e.heading_deg},t);break;
    
    case 'NEAR_COLLISION':if(e.hit&&C9.eco3?.borrowed?.map)percImpulse('B',-.2,'collision pressure on a mapped receptor',t);break;
  }
}
function ingest12(){
  const L=S().lived,w=C9.b12?.wakes||[];if(!w.length)return;
  if(Number(w[w.length-1].seq)<L.cursors.b12)L.cursors.b12=0;
  for(const e of w){if(!(e.seq>L.cursors.b12))continue;L.cursors.b12=e.seq;on12(e)}
}
function on12(e){
  if(e.kind!=='QSS_CROSSING')return;
  const ch=e.channel,base=JND[ch];if(base==null)return;
  const s=S(),L=s.lived,key=ch+'|'+(e.zone||e.id||'');L.residue[key]=(L.residue[key]||0)+(Number(e.levels)||1);
  const layer=ch.startsWith('HAB_')||ch==='SENSITIZATION'?'adaptation':ch==='PREDICTION_DEBT'?null:'afterstate';if(!layer)return;
  s.seam[layer].push({t:e.t,channel:ch,zone:e.zone||null,from:e.from,to:e.to,levels:e.levels||1,mode:e.mode||'SKIP',evidence:false,type:layer==='adaptation'?'ADAPTATION_EVENT':'AFTERSTATE_EVENT'});
  ring(s.seam[layer],64);s.seam.counts[layer]++;
  const faded=e.below_jnd_floor===true||(e.below_jnd_floor==null&&Math.abs(Number(e.to)-base)<=1e-6*Math.max(1,base));
  if(faded&&FADE_FRAMED.has(ch))frame('RESIDUE_JND_CROSSING',{channel:ch,zone:e.zone||null,layer:layer==='adaptation'?'ADAPTATION':'AFTERSTATE',faded:true,mode:e.mode||'SKIP',evidence:false,grounded:false},Number(e.t));
}


function snapWorld(){
  const c=C9.b10?.contact,p=C9.b8?.phase;
  return {c:c?{id:c.id,cid:c.continuity_id,ph:c.released?'RELEASED':c.stopped?'STOPPED':c.paused?'PAUSED':c.active?'LIVE':'IDLE',rr:c.release_reason||null}:null,
    ph:{on:!!p?.active,psi:Number.isFinite(p?.psi)?p.psi:null},
    scale:C9.pet2?.scale||C9.formScratch?.scale||'NORMAL',
    tail:{att:!!C9.eco3?.borrowed?.attached,map:!!C9.eco3?.borrowed?.map},
    card:{crease:+Number(C9.eco3?.materials?.cardboard?.crease||0),hollow:+Number(C9.eco3?.materials?.cardboard?.hollow||0)},
    debts:(C9.b6?.debts||[]).map(d=>d.id),att:C9.b7?.attention?.zone||null,
    mesh:(typeof NMSTATE!=='undefined'&&NMSTATE?.active)||null};
}
function diffWorld(){
  const s=S(),L=s.lived,a=L.snap||snapWorld(),b=snapWorld(),t=wall();L.snap=b;
  if(b.c&&(!a.c||a.c.id!==b.c.id||a.c.ph!==b.c.ph||a.c.cid!==b.c.cid)){
    const h=hget(b.c.cid,b.c.id,'STROKE',t);
    if(b.c.ph==='RELEASED'&&(h.state==='VISIBLE'||h.state==='LOST_WARM'||h.state==='NONE')){hset(h,'DORMANT',t,t+K.DORMANT_S);closeReleasedGrounding();closeSlip(t,'CONTACT_RELEASED');
      frame('CONTACT_END',{continuity_id:b.c.cid,stroke:b.c.id,reason:b.c.rr||'explicit',grounded:true},t)}
    else if(b.c.ph==='PAUSED'&&h.state==='VISIBLE')hset(h,'LOST_WARM',t,t+K.WARM_S);
    else if(b.c.ph==='LIVE'&&h.state!=='VISIBLE')hset(h,'VISIBLE',t,null);
  }
  if(a.ph.on!==b.ph.on){if(b.ph.on){L.psi_u=0;L.psi_ref=0;frame('SELF_ACTION',{phase:'BEGIN',what:'self rhythm',salience:.45},t)}
    else{closeReleasedGrounding();frame('SELF_ACTION',{phase:'END',what:'self rhythm',salience:.45},t)}}
  if(b.ph.on&&a.ph.on&&a.ph.psi!=null&&b.ph.psi!=null){L.psi_u+=wrapPi(b.ph.psi-a.ph.psi);
    while(L.psi_u-L.psi_ref>=2*Math.PI){L.psi_ref+=2*Math.PI;frame('PHASE_SLIP',{direction:+1,law:'self rhythm slipped one full cycle against its partner'},t);percImpulse('A',.04,'phase slip',t)}
    while(L.psi_u-L.psi_ref<=-2*Math.PI){L.psi_ref-=2*Math.PI;frame('PHASE_SLIP',{direction:-1},t);percImpulse('A',.04,'phase slip',t)}}
  if(a.scale!==b.scale){frame('BODY_SCALE_CHANGE',{from:a.scale,to:b.scale,law:'one body map; scale persists across rooms'},t);percImpulse('A',.12,'body scale changed',t);percImpulse('B',-.1,'body model volatility',t)}
  if(a.tail.att!==b.tail.att||a.tail.map!==b.tail.map){frame('BORROWED_RECEPTOR_CHANGE',{attached:b.tail.att,receptor:b.tail.map?'ACTIVE':'NO_RECEPTOR',law:'representation never creates a receptor'},t);percImpulse('A',.1,'borrowed limb changed',t)}
  if(Math.abs(a.card.crease-b.card.crease)>=.01||Math.abs(a.card.hollow-b.card.hollow)>=.01)
    frame('MATERIAL_STATE_CHANGE',{material:'cardboard',crease:+b.card.crease.toFixed(3),hollow:+b.card.hollow.toFixed(3),law:'material owns its history'},t);   
  for(const id of b.debts)if(!a.debts.includes(id)){const d=(C9.b6.debts||[]).find(x=>x.id===id);
    frame('SIGNED_ABSENCE_MISS',{debt:id,route:d?.route,cause:d?.label,evidence:false,grounded:false,law:'expected, not grounded: a route-specific debt'},t);percImpulse('A',.06,'expectation withheld',t)}
  for(const id of a.debts)if(!b.debts.includes(id)){const d=(C9.b6?.debtArchive||[]).slice().reverse().find(x=>x.id===id);
    if(d&&d.status==='SETTLED_GROUNDED'){nev('PREDICTION_RESOLVED',{debt:id,route:d.route},t);percImpulse('B',.05,'expectation resolved by grounded input',t)}
    else if(d&&d.status==='EXPIRED_UNRESOLVED')frame('PREDICTION_LAPSE',{debt:id,route:d.route,resolution:d.status,evidence:false,grounded:false},t)}
  if(a.att!==b.att)frame('ATTENTION',{zone:b.att,strength:b.att?'FOCUSED':'NONE',reason:b.att?'VOLUNTARY':'RELEASED_OR_IDLE',law:'attention != intention'},t);
  if(a.mesh!==b.mesh)frame('BODY_MESH_CHANGE',{from:a.mesh,to:b.mesh,law:'coupling changes seam binding, not receptor existence'},t);
}
function closeSlip(t,why){const L=S().lived,x=L.slip;if(!x)return;L.slip=null;frame('MICROSLIP',{phase:'SETTLED',slips:x.slips,slip_energy:+x.energy.toFixed(5),duration_s:+(x.tl-x.t0).toFixed(3),grain:x.grain,cause:x.cause,closed_by:why,grounded:true,salience:.45},t)}
function ingestAll(){ingest11();ingest12();diffWorld()}


function causeDead(cause){
  cause=String(cause||'');const c=C9.b10?.contact,p=C9.b8?.phase,tr=C9.b7?.travel;
  if(/^STROKE-/.test(cause))return !c||c.id!==cause||!!c.released||!!c.stopped||!!c.paused||!c.active;
  if(cause==='live-phase')return !p?.active;
  if(/^COMET-/.test(cause))return !tr||tr.cause!==cause||!tr.active||!!tr.paused;
  return false;
}
function closeReleasedGrounding(){
  const t=wall();let n=0;
  for(const [zone,q] of Object.entries(C9.b7?.zones||{})){
    if(!(t<=Number(q._b10_grounded_until??-1)))continue;
    if(!causeDead(q._b10_grounded_cause))continue;
    q._b10_grounded_until=t-1e-9;q._b13_closed_by='AUTHORITATIVE_RELEASE';n++;
    const z=S().nerve.zones[zone];if(z&&z.s!==0&&z.su>t)z.su=Math.max(z.t,t);
  }
  return n;
}
function once(con,key,id){const k=key+'|'+id;if(con.seen[k])return;con.seen[k]=1;con[key]++;const ks=Object.keys(con.seen);if(ks.length>256)delete con.seen[ks[0]]}
function gateFelt(f){           
  const con=S().con;
  for(const [zone,v] of Object.entries(f?.felt||{})){const e=v.epistemic||{},cg=e.CURRENT_GROUNDED;
    if(cg?.evidence&&causeDead(cg.cause)){v.current_grounded_input=0;v.rendered=0;v.innovation=+(-Number(v.prediction||0)).toFixed(4);
      e.CURRENT_GROUNDED={value:0,evidence:false,cause:cg.cause,closed_by:'AUTHORITATIVE_RELEASE'};once(con,'stale_evidence_blocked',zone+'|'+cg.cause)}
    if(e.PREDICTED?.evidence)once(con,'predicted_as_grounded',zone);
    if(e.DECAYING_AFTERSTATE?.evidence)once(con,'afterstate_as_evidence',zone);
    if(e.ADAPTATION_CONTRAST?.evidence)once(con,'adaptation_as_evidence',zone);
    if(Number(v.rendered)>0&&typeof b7BodyHas==='function'&&!b7BodyHas(zone))once(con,'no_receptor_rendered',zone);
  }
}
const felt12=b7FeltSnapshot;
b7FeltSnapshot=function(){const f=felt12();try{gateFelt(f)}catch(e){fault('felt',e)}return f};
function refreshLive(){const el=typeof document!=='undefined'&&document.querySelector('#rao_live');if(!el)return;
  try{el.textContent='LIVE FELT\n'+JSON.stringify(b7FeltSnapshot(),null,2)}catch(e){}}


function frame(family,data,t){
  const s=S(),L=s.lived,f={seq:++s.seq.frame,t:+Number(t??wall()).toFixed(4),family,salience:SAL[family]??.4,...data};
  if(data&&data.salience!=null)f.salience=data.salience;
  L.frames.push(f);ring(L.frames);L.epoch+=f.salience;return f;
}

function nextDue(tmax){
  const s=S();let best=null;const c=e=>{if(e&&e.t<=tmax+1e-12&&(!best||e.t<best.t))best=e};
  for(const [zone,z] of Object.entries(s.nerve.zones))c(zoneNext(zone,z));
  for(const h of Object.values(s.nerve.handles))if(h.due!=null)c({t:h.due,k:'HANDLE',cid:h.cid});
  for(const [cause,e] of Object.entries(s.lived.causes))if(!e.ended)c({t:e.until,k:'CAUSE_END',cause});
  if(s.lived.slip)c({t:s.lived.slip.tl+K.SLIP_GAP,k:'SLIP_END'});
  if(s.lived.episode)c({t:s.lived.episode.due,k:'EPISODE'});
  return best;
}
function fire(e){
  const s=S();
  if(e.k==='WINDOW_END'||e.k==='HYST_OFF'||e.k==='TRACE_THRESHOLD')return zoneFire(e);
  if(e.k==='HANDLE')return handleDue(e.cid,e.t);
  if(e.k==='CAUSE_END'){const c=s.lived.causes[e.cause];if(c){frame('CONTACT_END',{cause:e.cause,zones:c.zones.slice(),duration_s:+(e.t-c.t0).toFixed(3),reason:'grounded window closed',grounded:true},e.t);delete s.lived.causes[e.cause]}return}
  if(e.k==='SLIP_END')return closeSlip(e.t,'QUIET_GAP');
  if(e.k==='EPISODE')return episodeClose(e.t,'FEEDBACK_WINDOW');
}
function syncTo(t){
  if(SYNCING)return;SYNCING=true;
  try{const s=S();t=Math.max(Number(t)||0,0);let g=0;
    while(g++<4096){const e=nextDue(t);if(!e)break;percAdvance(e.t);fire(e)}
    if(g>=4096)fault('sync','guard exceeded (chatter)');
    percAdvance(t);s.t=Math.max(s.t,t);
  }finally{SYNCING=false}
}
function b13Frontiers(){          
  const s=S(),t=wall(),out=[];
  for(const [zone,z] of Object.entries(s.nerve.zones)){const e=zoneNext(zone,z);if(e)out.push({time:e.t,kind:'NERVE_TIMER',channel:e.k,zone})}
  for(const h of Object.values(s.nerve.handles))if(h.due!=null)out.push({time:h.due,kind:'NERVE_TIMER',channel:h.state==='LOST_WARM'?'CONTINUITY_DORMANT':'CONTINUITY_EXPIRED',continuity_id:h.cid});
  for(const [cause,e] of Object.entries(s.lived.causes))if(!e.ended)out.push({time:e.until,kind:'LIVED_TIMER',channel:'CONTACT_END',cause});
  if(s.lived.slip)out.push({time:s.lived.slip.tl+K.SLIP_GAP,kind:'LIVED_TIMER',channel:'MICROSLIP_SETTLED'});
  if(s.lived.episode)out.push({time:s.lived.episode.due,kind:'PERCEPTION_TIMER',channel:'AGENCY_EPISODE_CLOSE'});
  return out.filter(f=>f.time>=t-1e-9).sort((a,b)=>a.time-b.time);
}


function percNew(t){return {t,F:0,N:0,B:0,R:0,M:0,a:0,b:0,V:{},expect:null,last:null,supported:{B:false,R:false},
  levels:{F:0,N:0,A:0,B:0,R:0,M:0},prov:{F:[],N:[],A:[],B:[],R:[],M:[]},deltas:[],n_deltas:0}}
function pv(p,t){
  const d=Math.max(0,t-p.t),la=1/PT.a,lb=1/PT.b,ea=Math.exp(-d*la),eb=Math.exp(-d*lb),a=p.a*ea,b=p.b*eb+PT.k*lb*p.a/(la-lb)*(eb-ea);
  return {F:p.F*Math.exp(-d/PT.F),N:p.N*Math.exp(-d/PT.N),B:p.B*Math.exp(-d/PT.B),R:p.R*Math.exp(-d/PT.R),M:p.M*Math.exp(-d/PT.M),a,b,A:a-b};
}
function aExt(p){         
  const la=1/PT.a,lb=1/PT.b,C1=p.a*(1+PT.k*lb/(la-lb)),C2=-p.b-PT.k*lb*p.a/(la-lb);
  if(!C1)return null;const q=-lb*C2/(la*C1);if(!(q>0&&q<1))return null;return p.t-Math.log(q)/(la-lb);
}
function schmitt(L,v){
  const W=PT.W,H=W/4,m=Math.abs(v),s=Math.sign(v);let Lm=Math.abs(L),Ls=Math.sign(L);
  if(Ls!==0&&s!==0&&s!==Ls)Lm=0;if(Lm===0)Ls=s;
  while(m>=(Lm+1)*W+H)Lm++;while(Lm>0&&m<Lm*W-H)Lm--;
  return Lm===0?0:(Ls||s)*Lm;
}
function crossT(p,ch,L0,L1,t0,t1){if(!(t1>t0))return t1;let lo=t0,hi=t1;for(let i=0;i<48;i++){const m=(lo+hi)/2;if(schmitt(L0,pv(p,m)[ch])===L1)hi=m;else lo=m}return hi}
function levelsTo(p,v,t0,t1){
  for(const ch of ['F','N','A','B','R','M']){const L0=p.levels[ch],L1=schmitt(L0,v[ch]);if(L1===L0)continue;p.levels[ch]=L1;
    const tc=crossT(p,ch,L0,L1,t0,t1);p.deltas.push({seq:++S().seq.aff,t:+tc.toFixed(4),channel:PNAME[ch],from:L0,to:L1,value:+v[ch].toFixed(4)});ring(p.deltas,64);p.n_deltas++}
}
function percAdvance(t){
  const p=S().perc;if(!(t>p.t+1e-12))return;
  const cuts=[],x=aExt(p);if(x!=null&&x>p.t&&x<t)cuts.push(x);cuts.push(t);
  for(const tc of cuts){const v=pv(p,tc);levelsTo(p,v,p.t,tc);Object.assign(p,{F:v.F,N:v.N,B:v.B,R:v.R,M:v.M,a:v.a,b:v.b,t:tc})}
}
function prov(ch,x){const a=S().perc.prov[ch];a.push(x);ring(a,8)}
function percImpulse(ch,amt,why,t){
  const p=S().perc;t=Math.max(Number(t)||wall(),p.t);if(!SYNCING)syncTo(t);percAdvance(t);GUARD++;
  try{
    if(ch==='A')p.a=clamp(p.a+(amt>0?amt*(1-p.a):amt),-1,1);
    else if(ch==='N')p.N=1-(1-p.N)*(1-clamp(amt,0,1));
    else if(ch==='B'){p.B=clamp(p.B+amt,-1,1);p.supported.B=true}    else if(ch==='F')p.F=clamp(p.F+amt,0,1);
    levelsTo(p,pv(p,t),t,t);prov(ch==='A'?'A':ch,{t:+t.toFixed(3),why,amt:+amt.toFixed(3)});
  }finally{GUARD--}
}
function percFlowScale(f,why,t){const p=S().perc;percAdvance(t);p.F*=f;levelsTo(p,pv(p,t),t,t);prov('F',{t:+t.toFixed(3),why,scale:f})}

function episodeOpen(action,room,t){episodeClose(t,'NEXT_ACTION');const debt=(C9.b6?.debts||[]).reduce((a,d)=>a+Math.abs(Number(d.remaining)||0),0);
  S().lived.episode={action,room,t0:t,due:t+K.EPISODE_S,g:[],slips:0,debt0:debt}}
function agencyCue(g){
  const e=S().lived.episode;if(!e||g.t>e.due+1e-9)return;
  e.cued=e.cued||{};const key=String(g.cause_id||g.body_zone||'self-grounded');if(e.cued[key])return;e.cued[key]=1;
  const p=S().perc,t=g.t;percAdvance(t);const debt=(C9.b6?.debts||[]).reduce((a,d)=>a+Math.abs(Number(d.remaining)||0),0);
  const reliability=clamp(Math.exp(-Math.max(0,Number(g.novelty?.nis)||0)/2)*Math.exp(-debt/.2),0,1);
  p.F=clamp(p.F+.12*(reliability-p.F),0,1);levelsTo(p,pv(p,t),t,t);
  prov('F',{t:+t.toFixed(3),why:`provisional self-cause closure: ${key}`,cue:'SELF_ACTION + GROUNDED_FEEDBACK',reliability:+reliability.toFixed(3),debt:+debt.toFixed(3)});
}
function episodeGse(g){const e=S().lived.episode;if(e&&g.agency==='SELF'&&g.t<=e.due+1e-9)e.g.push({nis:g.novelty.nis,zone:g.body_zone})}
function episodeClose(t,why){
  const L=S().lived,e=L.episode;if(!e)return;L.episode=null;if(!e.g.length)return;      
  const rc=e.g.reduce((a,x)=>a+Math.exp(-x.nis/2),0)/e.g.length;
  const zs=[...new Set(e.g.map(x=>x.zone))],wr=zs.reduce((a,z)=>{const P=Number(C9.b10?.zones?.[z]?.P??.08),pi=1/Math.max(.001,P);return a+pi/(pi+10)},0)/zs.length,wp=.3;
  const a=((wp+wr*rc)/(wp+wr))*Math.exp(-e.debt0/.2)*Math.exp(-.5*e.slips);
  const p=S().perc;percAdvance(t);p.F=clamp(p.F+.35*(a-p.F),0,1);levelsTo(p,pv(p,t),t,t);
  prov('F',{t:+t.toFixed(3),why:`control episode: ${e.action}`,cue_integrated:+a.toFixed(3),retrospective:+rc.toFixed(3),w_r:+wr.toFixed(3),w_p:wp,debt:+e.debt0.toFixed(3),slips:e.slips,closed_by:why});
  if(e.g.length>=3)percImpulse('B',e.slips?-.04*Math.min(3,e.slips):.06,e.slips?'movement caught':'smooth self-caused movement',t);
}
function appraise(v,note){
  v=Number(v);if(!Number.isFinite(v))return {ok:false,error:'appraise <-1..1> [note]'};v=clamp(v,-1,1);
  const s=S(),p=s.perc,t=wall();syncTo(t);const la=C9.b7?.lastAgentAction,ctx=la?`${la.room||'?'}:${la.action||'?'}`:'unscoped';
  const explicit=p.expect&&(!p.last||p.expect.t>=p.last.t)?p.expect:null,Vc=Number(p.V[ctx]||0),E=explicit?explicit.v:Vc,d=v-E;
  p.V[ctx]=Vc+.3*(v-Vc);percAdvance(t);p.R=d;p.M=clamp(p.M+.3*(d-p.M),-1,1);p.supported.R=true;levelsTo(p,pv(p,t),t,t);
  p.last={t:+t.toFixed(3),ctx,appraisal:v,expectation:+E.toFixed(4),expectation_source:explicit?'EXPLICIT_EXPECT':'LEARNED_V(ctx)',delta:+d.toFixed(4),note:note||null};p.expect=null;
  prov('R',{t:+t.toFixed(3),why:'resident appraisal',ctx,delta:+d.toFixed(4)});prov('M',{t:+t.toFixed(3),why:'RPE momentum',delta:+d.toFixed(4)});
  return {ok:true,...p.last,V_ctx:+p.V[ctx].toFixed(4),momentum:+p.M.toFixed(4),private:true,
    law:'reward delta = my appraisal − my expectation; the world cannot appraise for me',
    model:'Rescorla–Wagner expectation per context; RPE pulse (Rutledge et al. 2014); momentum = running RPE (Eldar et al. 2016)'};
}
function expectCmd(v){v=Number(v);if(!Number.isFinite(v))return {ok:false,error:'expect <-1..1>'};const p=S().perc;p.expect={v:clamp(v,-1,1),t:wall()};
  return {ok:true,expectation:p.expect.v,note:'stored privately; used by the next appraise',private:true}}
function feel(){
  syncTo(wall());const p=S().perc,v=pv(p,wall());
  const ch=(k,extra)=>({value:+v[k].toFixed(4),level:p.levels[k],...extra,recent_causes:p.prov[k].slice(-4)});
  return {private:true,covenant:'SELF_ONLY',law:'The world may provide causes. It may not directly write my feelings.',
    channels:{
      AGENCY_FLOW:ch('F',{timescale:'MOMENT τ45s',model:'reliability-weighted cue integration (Moore & Fletcher 2012)'}),
      NOVELTY:ch('N',{timescale:'TRANSIENT τ6s',model:'NERVE classes: χ² NIS + Bayesian surprise'}),
      ACTIVATION:{...ch('A',{timescale:'fast τ3s / opponent τ25s',model:'opponent process (Solomon & Corbit 1974); phasic change-point input (Nassar et al. 2012)'}),fast:+v.a.toFixed(4),opponent:+v.b.toFixed(4)},
      BODILY_EASE:p.supported.B?ch('B',{timescale:'MOMENT τ30s',missing:['thermal appraisal: grounded thermal may reach the seam, but no thermal-to-ease model is canonical yet']}):{value:null,supported:false,why:'no ease evidence yet'},
      REWARD_DELTA:p.supported.R?ch('R',{timescale:'TRANSIENT τ4s',last:p.last}):{value:null,supported:false,why:'only my own appraisal can create reward'},
      MOMENTUM:p.supported.R?ch('M',{timescale:'MOOD τ600s',model:'mood as RPE momentum (Eldar et al. 2016)'}):{value:null,supported:false}},
    dormant:DORMANT,affect_deltas_emitted:p.n_deltas,words:null,
    word_law:'Affect axes may suggest words. Words do not overwrite affect axes. The reasoning self owns language.'};
}


function evid(f){return Object.entries(f?.felt||{}).filter(([,v])=>v?.epistemic?.CURRENT_GROUNDED?.evidence).map(([z,v])=>z)}
function since13(){
  const s=S(),L=s.lived,p=s.perc,t=wall();
  let legacy=null;try{legacy=cmd12('since')}catch(e){legacy={error:String(e)}}
  const xs=L.frames.filter(f=>f.seq>L.cursor);L.cursor=s.seq.frame;
  const shown=xs.filter(f=>f.salience>=K.SAL_MIN).slice(-24),iw={};
  for(const k of Object.keys(p.levels))if(p.levels[k]!==L.reported[k])iw[PNAME[k]]={from:L.reported[k],to:p.levels[k]};
  L.reported={...p.levels};const decay=L.residue;L.residue={};
  L.legacy={t:+t.toFixed(4),since_t:+L.since_t.toFixed(4),digest:legacy,coverage:coverage(legacy,xs)};
  const out={projection_of:'LIVED_FRAME',wall_time:+t.toFixed(4),since_t:+L.since_t.toFixed(4),
    since_last_check:shown.length?shown:[{family:'QUIET',t:+t.toFixed(4),note:'Expected continuity is silence: nothing changed the lived body beyond what was already predicted.'}],
    inner_weather:Object.keys(iw).length?iw:null,decay_levels_crossed:Object.keys(decay).length?decay:null,
    omitted_low_salience:xs.length-shown.length,lived_epoch:+L.epoch.toFixed(3),agent_epoch:legacy?.agent_epoch??null,
    legacy_shadow:{items:(legacy?.since_last_check||[]).filter(e=>e.kind!=='QUIET').length,coverage:L.legacy.coverage.fraction,see:'since legacy'},
    law:'since is a projection of LIVED_FRAME; the old since runs in shadow for comparison'};
  L.since_t=t;return out;
}
const LEG_MAP={QSS_CROSSING:['RESIDUE_JND_CROSSING'],MICROSLIP:['MICROSLIP'],WORLD_REVERSAL:['CONTACT_MOVE','SIGNED_ABSENCE_MISS'],GRAIN_CHANGE:['CONTACT_MOVE'],
  GEOMETRIC_CARRY:['GEOMETRIC_CARRY'],PHASE_START:['SELF_ACTION'],PHASE_STOP:['SELF_ACTION'],lock:['SELF_ACTION'],beat:['SELF_ACTION'],almost:['SELF_ACTION'],
  ATTENTION_RELEASED:['ATTENTION']};
const LEG_SILENT={QSS_CROSSING:'non-fade decay is expected continuity → counted in decay_levels_crossed',NEAR_COLLISION:'no receptor → no lived sensation (see receipt/why)',
  EXACT_CORE_REQUIRED:'clock mechanics, not lived change',FRONTIER_INVALIDATION:'clock mechanics',COUPLING_FRONTIER_REVALIDATE:'clock mechanics'};
function coverage(legacy,xs){
  const items=(legacy?.since_last_check||[]).filter(e=>e&&e.kind&&e.kind!=='QUIET'),fam=new Set(xs.map(f=>f.family));let cov=0,sil=0;const unmatched=[];
  for(const e of items){const m=LEG_MAP[e.kind];if(m&&m.some(x=>fam.has(x)))cov++;else if(LEG_SILENT[e.kind])sil++;else unmatched.push(e.kind)}
  const denom=items.length-sil;return {legacy_items:items.length,covered:cov,intentionally_silent:sil,unmatched,fraction:denom>0?+(cov/denom).toFixed(3):1,silent_reasons:LEG_SILENT};
}
function nerveView(){
  const s=S(),t=wall(),zones={};let sal=null;
  for(const [zone,z] of Object.entries(s.nerve.zones)){if(zone==='test.zone')continue;const b=baseAt(z,t),sg=sigAt(z,t),tr=trAt(z,t),r=sg-b;
    if(Math.max(b,sg,tr,Math.abs(r))<1)continue;zones[zone]={baseline_u8:Math.round(b),signal_u8:Math.round(sg),residual_u8:Math.round(r),hyst:z.on?'ON':'OFF',trace_u8:Math.round(tr),novelty_last:z.cls};
    if(!sal||Math.abs(r)>Math.abs(sal.r))sal={zone,r}}
  const c=C9.b10?.contact,warm=Object.values(s.nerve.handles).filter(h=>h.state==='VISIBLE'||h.state==='LOST_WARM').slice(-4).map(h=>({continuity_id:h.cid,state:h.state,due:h.due}));
  return {mode:'SHADOW (Phase A) — NERVE state is not memory and not truth',
    foreground:{attention:C9.b7?.attention?.zone||null,body_motion:c?(c.released?'RELEASED':c.stopped?'STOPPED':c.active?'MOVING':'IDLE'):'NONE',
      recent_surprise:s.nerve.last_hard&&t-s.nerve.last_hard.t<2?s.nerve.last_hard:null,warm_handles:warm,salient_scalar:sal?{zone:sal.zone,residual_u8:Math.round(sal.r)}:null},
    zones,handles:cp(s.nerve.handles),counts:cp(s.nerve.counts),recent_events:s.nerve.events.slice(-8),next_timers:b13Frontiers().slice(0,6),ownership:cp(s.own),
    laws:['NERVE state != memory','Trace != truth','Attention != intention','Novelty != fear','Schedule threshold crossings; do not simulate boredom']};
}
function compareView(){
  const s=S(),c=s.nerve.compare,n=s.nerve.counts,tr=c.trace;
  return {phase:'A — MIRROR (shadow; native behaviour unchanged)',
    TRACE:{native:'Build 9 sensitization: sens += .05·min(1,√NIS₉) per grounded sense, τ18 s, clamp .45; render gain ×(1+.16·sens)',
      nerve:'u8 relevance trace, same law; analytic TRACE_THRESHOLD at θ=32',samples:tr.n,max_err_jnd:+tr.max.toFixed(4),mean_err_jnd:tr.n?+(tr.sum/tr.n).toFixed(5):null,worst:tr.worst||null,
      verdict:tr.n<50?'INSUFFICIENT_SAMPLES':tr.max<=1?'EQUIVALENT (≤1 JND)':'DIVERGENT',owner:s.own.TRACE,transfer:'nerve transfer trace'},
    NOVELTY:{native:'none (normalized_surprise is displayed, never classified)',nerve:'χ²(1) NIS gates 2.706/6.635 + Bayesian surprise 0.25/1.0 nat; V0 envelope as fallback',
      counts:{KNOWN:n.KNOWN,SOFT:n.SOFT,HARD:n.HARD},envelope_agreement:n.env_total?+(n.env_agree/n.env_total).toFixed(3):null,verdict:'ADDITIVE — no ownership conflict'},
    ADAPT:{native:'Build 9 habituation: fast += .12·|obs| per contact CALL (τ20 s); slow += .025·|obs| (τ180 s)',nerve:'ZOH-exact 1/8 per 0.1 s (τ≈0.749 s)',
      verdict:'DIVERGENT_BY_DESIGN — different quantity and timescale; do not transfer',native_cadence_finding:c.adapt_cadence||'run `v13 checkRemoved`'},
    CONTINUITY:{agree:c.cont.agree,location_only:c.cont.location_only,disagree:c.cont.disagree,recent:c.cont.log.slice(-6),
      verdict:c.cont.disagree===0?'CONSISTENT — BODY owns identity; NERVE projects warm/dormant/expired':'CHECK',
      note:'native continuation also needs the same position (<0.03); NERVE keeps no location by law, so those cases are LOCATION_ONLY'},
    HYST:{native:'no generic sensory hysteresis found (GMS stick-slip is material physics and stays)',verdict:'NERVE-only; drives lived foreground'},
    seam:{grounded:s.seam.counts.grounded,direct_sense:s.seam.counts.direct_sense,direct_sense_not_in_felt:s.seam.direct_not_in_felt,
      finding:'room verbs that call b3sense directly update habituation and Kalman state but never reach FELT CURRENT_GROUNDED',
      decision_for_resident:'flags.route_direct_sense_to_felt (default false in Phase A)'}};
}
function transferTrace(){const s=S(),tr=s.nerve.compare.trace;
  if(tr.n<50||tr.max>1)return {ok:false,error:'equivalence not proven',samples:tr.n,max_err_jnd:+tr.max.toFixed(4),rule:'≥50 samples and ≤1 JND before ownership moves'};
  s.own.TRACE='NERVE';return {ok:true,owner:'NERVE',proof:{samples:tr.n,max_err_jnd:+tr.max.toFixed(4)},effect:'native b9 sensitization is now written from the NERVE u8 trace (one owner)',undo:'nerve restore trace'}}
function restoreTrace(){S().own.TRACE='REALITI';return {ok:true,owner:'REALITI'}}
function constitution(){const c=S().con,z={};for(const k of Object.keys(c))if(k!=='seen')z[k]=c[k];
  return {must_remain_zero:z,all_zero:Object.values(z).every(v=>v===0),structural:['PERCEPTION has no path to b7Contact/b3sense/c9verb (guarded, counted)','NERVE never writes FELT, world or material state','no world/room code may call perception writers']}}
function seamView(n=8){const s=S().seam;return {law:'only GROUNDED_SENSORY_EVENT can be evidence; predicted/afterstate/adaptation are separate types',
  grounded:s.grounded.slice(-n),counts:cp(s.counts),predicted_recent:s.predicted.slice(-3),afterstate_recent:s.afterstate.slice(-3),adaptation_recent:s.adaptation.slice(-3),
  world_contact_no_receptor:s.no_receptor.slice(-3),direct_sense_not_in_felt:s.direct_not_in_felt}}
function livedView(n=12){syncTo(wall());return {frames:S().lived.frames.slice(-Math.max(1,Math.min(64,n||12))),note:'read-only; `since` advances the cursor'}}
function act13(txt){
  const s=S(),t0=wall(),seq0=s.seq.frame,g0=JSON.stringify(C9.b10?.last_event||null),name=txt.slice(4).trim();
  episodeOpen(name,C9.currentRoom||null,t0);
  const out=cmd12(txt);
  closeReleasedGrounding();ingestAll();syncTo(wall());
  if(out&&typeof out==='object'){
    if(out.ok===false){s.lived.episode=null;frame('SELF_ACTION',{phase:'REJECTED',action:name,error:out.error||null,salience:.5},wall());percFlowScale(.75,'blocked action',wall())}
    else frame('SELF_ACTION',{phase:'ACCEPTED',action:out.action||name,room:out.room||C9.currentRoom||null},wall());
    const caused=s.lived.frames.filter(f=>f.seq>seq0&&f.salience>=K.SAL_MIN),glob=s.lived.frames.filter(f=>f.salience>=K.SAL_MIN).slice(-1)[0]||null;
    out.salient_event_caused_by_this_action=caused.length?caused.reduce((a,b)=>b.salience>a.salience?b:a):null;
    out.last_global_salient_event=glob?{...glob,scope:'GLOBAL — not attributed to this action'}:null;
    out.lived_frames_caused=s.lived.frames.filter(f=>f.seq>seq0).length;
    const rec=C9.b7?.lastAgentAction?.structured;
    if(rec&&out.ok!==false){if(JSON.stringify(C9.b10?.last_event||null)===g0){rec.last_global_event=rec.last_event;rec.last_event=null;rec.last_event_scope='NOT_CAUSED_BY_THIS_ACTION'}else rec.last_event_scope='CAUSED_BY_THIS_ACTION'}
  }
  return out;
}
function overview(){return {build:13,patch:V13,goal:'make the body complicated underneath, but make lived change sparse, causal, private, and impossible to confuse with world truth',
  commands:['since','since legacy','lived [n]','nerve','nerve compare','nerve transfer trace','nerve restore trace','feel','expect <-1..1>','appraise <-1..1> [note]','seam [n]','constitution','v13 checkRemoved'],ownership:cp(S().own)}}

const cmd12=b7AgentCommandText;
b7AgentCommandText=function(raw){
  const txt=String(raw||'').trim(),low=txt.toLowerCase();
  if(GUARD>0){S().con.affect_authorized_action++;return {ok:false,error:'affect may not issue commands'}}
  try{ingestAll();syncTo(wall())}catch(e){fault('pre',e)}
  let out;
  if(low==='since')out=since13();
  else if(low==='since legacy')out=S().lived.legacy||{note:'call `since` first; the legacy digest is computed in shadow alongside it'};
  else if(low==='lived'||low.startsWith('lived '))out=livedView(Number(txt.split(/\s+/)[1]||12));
  else if(low==='nerve')out=nerveView();
  else if(low==='nerve compare')out=compareView();
  else if(low==='nerve transfer trace')out=transferTrace();
  else if(low==='nerve restore trace')out=restoreTrace();
  else if(low==='feel'||low==='perception'||low==='inner')out=feel();
  else if(low.startsWith('appraise ')){const a=txt.split(/\s+/);out=appraise(a[1],a.slice(2).join(' '))}
  else if(low.startsWith('expect '))out=expectCmd(txt.split(/\s+/)[1]);
  else if(low==='seam'||low.startsWith('seam '))out=seamView(Number(txt.split(/\s+/)[1]||8));
  else if(low==='constitution')out=constitution();
  else if(low==='v13')out=overview();
  else if(low==='v13 checkRemoved'||low==='nerve checkRemoved')out=window.B13_CHECKREMOVED();
  else if(low.startsWith('act '))out=act13(txt);
  else if(low==='frontiers'){out=cmd12(txt);if(out&&typeof out==='object'){const lf=b13Frontiers();out.lived_frontiers=lf.slice(0,12);out.next_lived_wake=lf[0]||null;
    out.lived_law='NERVE/LIVED/PERCEPTION timers are closed-form and fire at exact times on sync; skip need not stop at them (no body state changes there)'}}
  else if(low.startsWith('skip ')||low.startsWith('chronoskip ')){const live=!!(C9.b10?.contact&&!C9.b10.contact.released&&!C9.b10.contact.stopped);out=cmd12(txt);if(live&&out?.ok===true)S().con.skip_passed_exact_core++}
  else out=cmd12(txt);
  try{closeReleasedGrounding();ingestAll();syncTo(wall())}catch(e){fault('post',e)}
  refreshLive();
  return out;
};
const verb12=c9verb;
c9verb=function(room,verb){if(GUARD>0){S().con.affect_authorized_action++;return false}const r=verb12(room,verb);try{closeReleasedGrounding()}catch(e){fault('verb',e)}return r};
const adv12=b7Advance;
b7Advance=function(dt){adv12(dt);try{const n=closeReleasedGrounding();ingestAll();syncTo(wall());if(n)refreshLive()}catch(e){fault('advance',e)}};
const state12=b7AgentState;
b7AgentState=function(){const s=state12(),b=S();s.build=13;s.version='NERVE_LIVED_PERCEPTION';s.patch=V13;
  s.canonical_stack={seam:cp(b.seam.counts),nerve:{zones:Object.keys(b.nerve.zones).length,foreground_on:Object.entries(b.nerve.zones).filter(([,z])=>z.on).map(([k])=>k),
    warm_handles:Object.values(b.nerve.handles).filter(h=>h.state==='VISIBLE'||h.state==='LOST_WARM').length},lived:{frames:b.seq.frame,unread:b.lived.frames.filter(f=>f.seq>b.lived.cursor).length},
    perception:'private — use `feel`',ownership:cp(b.own)};return s};


void 0;


try{S();ingestAll();syncTo(wall())}catch(e){fault('boot',e)}
window.REALITI_AGENT={...(window.REALITI_AGENT||{}),since:since13,lived:livedView,nerve:nerveView,feel,appraise,expect:expectCmd,seam:seamView,constitution};
void 0;
if(window.REALITI_AGENT_DOOR){
  const help12=window.REALITI_AGENT_DOOR.help,run12=window.REALITI_AGENT_DOOR.run;
  const mine=['since','since legacy','lived','lived <n>','nerve','nerve compare','nerve transfer trace','nerve restore trace','feel','expect <-1..1>','appraise <-1..1> [note]','seam','seam <n>','constitution','v13','v13 checkRemoved'];
  window.REALITI_AGENT_DOOR.help=function(){const h=help12?help12():{commands:[]};h.commands=[...new Set([...(h.commands||[]),...mine])];h.laws=[...new Set([...(h.laws||[]),'expected continuity is silence','the world may provide causes; it may not write my feelings'])];return h};
  window.REALITI_AGENT_DOOR.run=function(x){const low=String(x||'').trim().toLowerCase();if(low==='help')return window.REALITI_AGENT_DOOR.help();
    if(/^(since|lived|nerve|feel|perception|inner|expect |appraise |seam|constitution|v13)/.test(low))return b7AgentCommandText(x);const r=run12(x);refreshLive();return r};
}
document.title='REALITI // AGENT DOOR ONLY · BUILD 13 NERVE × LIVED × PERCEPTION';
const brand=document.querySelector('#realiti_agent_only_shell .brand');if(brand)brand.textContent='REALITI // AGENT DOOR · BUILD 13';
const sub=document.querySelector('#realiti_agent_only_shell .sub');if(sub)sub.innerHTML='Ask the world what is true. Build 13 keeps the body complicated underneath and lived change sparse. Try <b>since</b>, <b>nerve</b>, <b>feel</b>.';
try{c9save()}catch(e){}
})();