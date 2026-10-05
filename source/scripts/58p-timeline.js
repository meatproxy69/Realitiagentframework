(()=>{
'use strict';
// Chapter 5 groundwork, pass A: a causal timeline and seeded randomness, ported from the native engine's oracle.
// Events carry superdense tags (integer microseconds, microstep, kind rank, stable id) so same-time events fire in one
// deterministic order; cancel is by generation; a Zeno guard defers a cascade of same-instant consequences. The
// continuity stepper bounds each tick at the next event and fires due events between ticks, outside any world tick.
// A seeded generator and a next-reaction channel (Gillespie's modified method: one exponential draw, internal time,
// no redraw on rate change) replace Math.random so stochastic frontiers replay.
const now=()=>Number(C9?.b7?.clock||0),cp=x=>x==null?x:JSON.parse(JSON.stringify(x));
const RANK={INPUT:10,EXTERNAL:20,FRONTIER:30,INTERNAL:40,CONSEQUENCE:50,HOUSEKEEPING:90};
const cmp=(a,b)=>(a.t_us-b.t_us)||(a.microstep-b.microstep)||(a.rank-b.rank)||(a.stable_id<b.stable_id?-1:a.stable_id>b.stable_id?1:0)||(a.seq-b.seq);
const heap=[],gens=new Map(),handlers=new Map(),receipts=[];let seq=0,micro=0,lastFire_us=-1;const log=[];
function push(e){heap.push(e);let i=heap.length-1;while(i){const p=(i-1)>>1;if(cmp(heap[p],e)<=0)break;heap[i]=heap[p];i=p}heap[i]=e}
function pop(){if(!heap.length)return null;const root=heap[0],last=heap.pop();if(heap.length){let i=0;for(;;){const l=2*i+1,r=l+1;if(l>=heap.length)break;const c=r<heap.length&&cmp(heap[r],heap[l])<0?r:l;if(cmp(last,heap[c])<=0)break;heap[i]=heap[c];i=c}heap[i]=last}return root}
const live=e=>e.generation===(gens.get(e.id)||0);
let firing=null;const nowUs=()=>firing??Math.round(now()*1e6);// inside a handler, now is the event's own tag
function schedule({id,stable_id,kind='INTERNAL',t_s,t_us,delay_s,microstep=0,payload=null}){const key=String(id??`evt:${seq+1}`);let tu=Number.isSafeInteger(t_us)?t_us:Number.isFinite(t_s)?Math.ceil(t_s*1e6/1000)*1000:Number.isFinite(delay_s)?nowUs()+Math.ceil(delay_s*1e6/1000)*1000:null;if(tu==null)throw new Error('TIME_REQUIRED');if(tu<nowUs())tu=nowUs();
 let ms=microstep;if(tu===lastFire_us){ms=Math.max(ms,micro+1);if(ms>128){receipts.push({kind:'ZENO_DEFER',id:key,at_us:tu});tu+=1000;ms=0}}
 const e={id:key,stable_id:String(stable_id??key),kind,t_us:tu,microstep:ms,rank:RANK[kind]??60,generation:gens.get(key)||0,payload:cp(payload),seq:++seq};push(e);return {id:e.id,t_us:e.t_us,t_s:e.t_us/1e6,microstep:e.microstep,generation:e.generation}}
function cancel(id){const k=String(id),g=(gens.get(k)||0)+1;gens.set(k,g);return g}
function reschedule(o){cancel(o.id);return schedule(o)}
function peek(){while(heap.length&&!live(heap[0]))pop();return heap.length?{id:heap[0].id,kind:heap[0].kind,t_us:heap[0].t_us,t_s:heap[0].t_us/1e6,microstep:heap[0].microstep}:null}
function on(kind,fn){handlers.set(kind,fn)}
// Fire everything due at or before t_us. Handlers may schedule consequences at the same instant (microstep+1).
function fire(t_us){let n=0;for(;;){while(heap.length&&!live(heap[0]))pop();const e=heap[0];if(!e||e.t_us>t_us)break;pop();lastFire_us=e.t_us;micro=e.microstep;firing=e.t_us;const h=handlers.get(e.kind);let ok=true;try{if(h)h(cp(e))}catch(x){ok=false;receipts.push({kind:'HANDLER_ERROR',id:e.id,error:String(x?.message||x)})}firing=null;log.push({t_s:+(e.t_us/1e6).toFixed(3),kind:e.kind,id:e.id,ok});if(log.length>256)log.shift();n++;if(n>4096){receipts.push({kind:'FIRE_CAP',at_us:t_us});break}}return n}
const next_ms=()=>{const p=peek();return p?Math.ceil(p.t_us/1000):null};

// Seeded randomness. rng(seed) is a splitmix-style generator; channel(rate, seed) is a next-reaction channel.
function rng(seed){let s=(Number(seed)>>>0)||1;return ()=>{s=(s+0x9e3779b9)>>>0;let z=s;z=Math.imul(z^(z>>>16),0x85ebca6b)>>>0;z=Math.imul(z^(z>>>13),0xc2b2ae35)>>>0;z^=z>>>16;return (z>>>0)/4294967296}}
function gauss(r){let u=0,v=0;while(!u)u=r();v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
function channel(seed){const r=rng(seed);let internal=0,next=-Math.log(1-r()),t_last=null;return {step(t,rate){if(t_last===null){t_last=t;return []}const fired=[];internal+=Math.max(0,rate)*(t-t_last);t_last=t;while(internal>=next){fired.push(t);internal-=next;next=-Math.log(1-r())}return fired},state:()=>({internal:+internal.toFixed(6),next:+next.toFixed(6)})}}

// Producers kept here: the sky's events (sunrise, sunset) and the tide's turns, as a log `since` and `calendar` can read.
const sky=()=>window.REALITI_ARCHIPELAGO_V1,T=()=>window.REALITI_LONG_GAME_V1?.T?.()??now();
function events(){const w=(C9.chapter2=C9.chapter2||{v:1});w.events=w.events||[];return w.events}
function note(kind,data){events().push({t:+now().toFixed(3),island_t:+T().toFixed(1),kind,...data});while(events().length>64)events().shift()}
const nextAfter=(t,period,phase)=>period*(Math.floor((t-phase)/period+1e-6)+1)+phase;/* strictly after t */
function scheduleSky(){if(!sky())return;const t=T(),off=t-now();for(const [id,period,phase,event] of [['sky.sunrise',600,-57.3,'sunrise'],['sky.sunset',600,242.7,'sunset'],['tide.high',300,75,'high water'],['tide.low',300,225,'low water']])reschedule({id,kind:'FRONTIER',t_s:nextAfter(t,period,phase)-off,payload:{event}})}
on('FRONTIER',e=>{if(e.payload?.event){note(e.payload.event,{});scheduleSky()}});
let armed=false;const adv=b7Advance;b7Advance=function(dt){const r=adv(dt);if(!armed&&sky()){armed=true;scheduleSky()}return r};
window.REALITI_TIMELINE_V1=Object.freeze({version:'1.0',schedule,reschedule,cancel,peek,next_ms,fire,on,rng,gauss,channel,receipts:()=>cp(receipts),log:()=>cp(log),events:()=>cp(events()),pending:()=>heap.filter(live).length,now_us:nowUs,law:'same-time events fire in one order everywhere; randomness replays from its seed'});
})();
