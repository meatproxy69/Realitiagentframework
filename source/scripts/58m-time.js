(()=>{
'use strict';
// Chapter 4, pass 3: adaptive world time. The continuity stepper asks this slice how long a tick may be. While the body
// is being touched, moved, danced, sailed or flown, the tick stays at 20 ms; when nothing is in motion it widens to
// 100 ms, and after two still seconds to 200 ms. Zone decay, the passive medium's memory and the thermal law are exponential and exact for any step; terrain,
// sun, tide and tree growth are analytic in time; the stiff integrators (Lorenz, orrery, silhouettes, plume) keep their
// own substeps. Integer milliseconds are kept by the continuity stepper, so additivity of the schedule is preserved.
const DYN=window.REALITI_DYNAMICS_V1,M=window.REALITI_MATRIX_V1;if(!DYN||!M)return;
const now=()=>Number(C9?.b7?.clock||0),room=()=>C9?.currentRoom;
const FINE=20,COARSE=100,DEEP=200,stats={fine:0,coarse:0,deep:0,last_reason:null};let idleSince=null;
const contact0=b7Contact;b7Contact=function(zone,input,opts){const r=contact0(zone,input,opts);C9.b7.lastContactAt=now();return r};
function reason(){const r=M.state().residents['resident:self'];if(r?.intent)return 'moving';const b7=C9?.b7||{};if(b7.travel?.active)return 'travel';if(Number.isFinite(b7.lastContactAt)&&now()-b7.lastContactAt<1)return 'contact';
 const d=DYN.state?.();if(d?.hold?.active||(d?.bath?.target>0)||(d?.bath?.depth>.01)||d?.wave)return 'dynamics';const c2=C9?.chapter2||{};if(c2.city?.dance?.on)return 'dancing';if(c2.isle?.boat?.target)return 'rowing';
 const k=C9?.wonder?.kite;if(k?.up)return 'kite';if(C9?.wonder?.meadow?.me?.tapping)return 'tapping';if(room()==='CLOCKWORK_MARSH'||room()==='FIREFLY_MEADOW')return 'room_dynamics';return null}
function quantum_ms(){const why=reason(),t=now();stats.last_reason=why;if(why){stats.fine++;idleSince=null;return FINE}if(idleSince===null)idleSince=t;if(t-idleSince>=2){stats.deep++;return DEEP}stats.coarse++;return COARSE}
window.REALITI_TIME_V1=Object.freeze({version:'1.0',fine_ms:FINE,coarse_ms:COARSE,deep_ms:DEEP,quantum_ms,reason,stats:()=>({...stats,idle_s:idleSince===null?0:+(now()-idleSince).toFixed(1),ratio_wide:+((stats.coarse+stats.deep)/Math.max(1,stats.fine+stats.coarse+stats.deep)).toFixed(3)}),law:'a wider tick only when nothing is in motion; every process stepped here is exact or self-substepped for it'});
})();
