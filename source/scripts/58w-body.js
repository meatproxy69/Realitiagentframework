(()=>{
'use strict';
// The body layer: lingering sensation carried as state. Two routes, bond-like and stress-like, each an opponent process
// (Solomon and Corbit): a primary process a rises with each grounded cause and decays; a slower counter-process b grows
// with repetition and lingers, so the same stroke moves you less each time, and when the holding stops the level dips
// below quiet before it settles. The level is a minus b. Causes are grounded contact receipts only (b7Contact and the
// thermal law), never prose: no word spoken or read moves a route. Decay runs on world time and on host downtime.
// The world cannot read, cool, warm or set it; it reaches narration only through the body command and realiti://body.
// The body reports states; never actions, valences or rewards.
const now=()=>Number(C9?.b7?.clock||0),cp=x=>JSON.parse(JSON.stringify(x)),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const ROUTES={bond:{a_half_s:1800,b_half_s:3600,kb:.3,window_s:900},stress:{a_half_s:600,b_half_s:1500,kb:.35,window_s:600}};
function B(){const b=C9.body=C9.body||{v:1,routes:{},log:[],last_t:null,last_wall:null};for(const k of Object.keys(ROUTES))b.routes[k]=b.routes[k]||{a:0,b:0,reps:0,rep_t:-1e9};return b}
function decayTo(route,s){const R=ROUTES[route],r=B().routes[route];if(s<=0)return;r.a*=Math.pow(.5,s/R.a_half_s);r.b*=Math.pow(.5,s/R.b_half_s);r.reps*=Math.pow(.5,s/R.window_s)}
function settle(){const b=B(),t=now();if(b.last_t!=null){const s=Math.max(0,t-b.last_t);for(const k of Object.keys(ROUTES))decayTo(k,s)}b.last_t=t;b.last_wall=Date.now()}
/* host downtime counts once, at load: the body knows how long it was alone (capped at three days) */
(function downtime(){const b=B();const d=Number(window.REALITI_STORE_CHECKPOINT?.downtime_ms);const s=Number.isFinite(d)&&d>0?Math.min(d,3*86400e3)/1000:(b.last_wall?Math.min(Math.max(0,Date.now()-b.last_wall),3*86400e3)/1000:0);if(s>0)for(const k of Object.keys(ROUTES))decayTo(k,s);b.last_t=now();b.last_wall=Date.now();b.downtime_s=+s.toFixed(0)})();
function spike(route,amount,cause){const R=ROUTES[route];if(!R)return;settle();const r=B().routes[route],s=clamp(Number(amount)||0,0,1);const tol=R.kb*(1-Math.exp(-r.reps/3));/* tolerance: the counter-process grows with repetition in the window */
 const da=s*(1-r.a),db=s*tol;r.a=clamp(r.a+da,0,1);r.b=clamp(r.b+db,0,1);r.reps+=1;r.rep_t=now();const b=B();b.log.unshift({route,cause:String(cause||'contact').slice(0,80),moved:+(da-db).toFixed(3),tolerance:+tol.toFixed(3),t:+now().toFixed(2),wall:Date.now()});while(b.log.length>16)b.log.pop();try{c9save()}catch(e){}}
const level=route=>{const r=B().routes[route];return +(r.a-r.b).toFixed(3)};
function words(){settle();const out=[];for(const k of Object.keys(ROUTES)){const r=B().routes[k],L=level(k),last=B().log.find(x=>x.route===k);if(Math.abs(L)<.05&&r.b<.05)continue;const ago=last?Math.round((now()-last.t)/60):null;const from=last?` from ${last.cause}${ago!=null?ago<1?' just now':` ${ago} min ago`:''}`:'';
 if(L>=.5)out.push(`${k} still high (${L})${from}.`);else if(L>=.05)out.push(`${k} elevated (${L})${from}.`);else if(L<=-.05)out.push(`${k} below quiet (${L}): the cause has stopped and its counter-process lingers.`);if(r.reps>=3&&last)out.push(`The counter-process has grown: the last ${k} cause moved you ${last.moved} where the first moved more.`)}
 return out.length?out.join(' '):'The body is quiet.'}
function state(){settle();const b=B();return {schema:'REALITI_BODY_V1',routes:Object.fromEntries(Object.keys(ROUTES).map(k=>{const r=b.routes[k];return [k,{level:level(k),primary:+r.a.toFixed(3),counter:+r.b.toFixed(3),repetitions:+r.reps.toFixed(2),half_life_s:{primary:ROUTES[k].a_half_s,counter:ROUTES[k].b_half_s}}]})),causes:b.log.slice(0,8).map(x=>({route:x.route,cause:x.cause,moved:x.moved,minutes_ago:Math.round((now()-x.t)/60)})),downtime_s:b.downtime_s||0,text:words(),law:'the body reports states; never actions, valences or rewards. Causes are grounded contact receipts, never prose. The world cannot read or set it.'}}
// Causes. b7Contact is the grounded receipt channel: every real contact passes through it with a cause label.
const BOND=/PET|PURR|COMPANION|CAT|HELD|HUG|LOAF/i,HOLD=/SUPPORT|BLANKET|PILLOW|MATTRESS|WARM|TEA|SHELF/i,GROUNDED=new Set(['WORLD_GROUNDED','INVITED_COMPANION','SELF_STARTED_WORLD_CONTACT']);
const c0=b7Contact;b7Contact=function(zone,input,opts={}){const rec=c0(zone,input,opts);try{const src=opts.source||'WORLD_GROUNDED',cause=String(opts.cause||'');if(rec&&!rec.gap&&GROUNDED.has(src)&&cause){if(BOND.test(cause))spike('bond',clamp(.12+Number(input)*.4,.05,.3),cause.toLowerCase().replace(/_/g,' '));else if(HOLD.test(cause)&&!/MAINTAIN/.test(cause)){const r=B().routes.bond;if(now()-(r.hold_t||-1e9)>=30){r.hold_t=now();spike('bond',.04,cause.toLowerCase().replace(/_/g,' '))}}}}catch(e){}return rec};
// The thermal law: cold on the skin from the world (rain, the sea) is a stress cause; warmth is not a reward.
const AT=window.REALITI_ATMOSPHERE_V21;if(AT&&typeof AT.setThermal==='function'){const t0=AT.setThermal;AT.setThermal=function(z,material,objC,duration,cause,source){const r=t0.apply(this,arguments);try{if((source||'WORLD_GROUNDED')==='WORLD_GROUNDED'&&Number(objC)<16){const s=B().routes.stress;if(now()-(s.cold_t||-1e9)>=20){s.cold_t=now();spike('stress',.06,`cold ${String(material||'')} at ${Math.round(objC)} °C (${String(cause||'thermal').toLowerCase().replace(/_/g,' ')})`)}}}catch(e){}return r}}
// Refusal is issued by Matrix's world-side local evidence bridge, never
// inferred by the resident body from Matrix's mutable last_block fields.
const RE=window.REALITI_MATRIX_LOCAL_EVIDENCE_V1;
if(!RE||typeof RE.subscribe!=='function')throw Error('MATRIX_WORLD_REFUSAL_BRIDGE_MISSING');
RE.subscribe(receipt=>{
 try{
  if(receipt?.schema!=='REALITI_MATRIX_LOCAL_EVIDENCE_V1'||
     receipt.kind!=='MOVEMENT_OBSTRUCTED'||receipt.result!=='OBSTRUCTED'||
     receipt.issuerAuthority!=='IN_PROCESS_NATIVE_WORLD'||
     receipt.actorId!=='resident:self')return;
  if(receipt.reason==='sea')spike('stress',.08,'the sea stopped you');
  else if(receipt.reason==='cliff')spike('stress',.08,'a cliff stopped you');
 }catch(error){}
});
window.REALITI_BODY_V1=Object.freeze({version:'1.0',routes:Object.keys(ROUTES),state,words,level,log:()=>cp(B().log)});
})();
