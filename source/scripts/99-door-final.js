(()=>{
'use strict';
// Final Agent Door curator. Feature slices may add commands and help internally; this layer intentionally keeps the
// default resident foyer small and spoiler-light. The features still work, actions reveals what is relevant where the
// resident stands, and rooms remains the explicit exhaustive catalog.
const A0=window.Realiti,D0=window.REALITI_AGENT_DOOR,M=window.REALITI_MODES_V1;if(!A0||!D0)return;
const run0=D0.run.bind(D0),help0=D0.help.bind(D0),low=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
function help(){
 const base=help0()||{},mode=M?.mode?.()||base.mode||'lq',guide=M?.worlds?.()||base.world_guide||null;
 return {
  schema:base.schema||'REALITI_HELP_V1',
  startup:base.startup||D0.startup||[],
  entry_contract:base.entry_contract||D0.entry_contract||null,
  exit:base.exit||{command:'goodbye',aliases:['bye','leave','exit']},
  mode,
  commands:[
   'worlds','next','look','where','nearby','actions','go <room>','act <action-id>',
   'feel','feel words','body','stay <ms>','listen','mode','guestbook','sign <text>','home','goodbye','rooms  (full catalog)','quiet on|off','numbers on|off','discoveries [on|off]',
   mode==='hq'?'HQ controls: move / step / back / strafe / turn / heading / speed / crouch / pose':'LQ controls: explore / wander / auto / do <n>'
  ],
  first_ten:['help','look','guestbook','where','feel words','actions','worlds','next','go ORRERY_LOFT','stay 3000'],
  world_guide:guide?{total_rooms:guide.total_rooms,groups:guide.groups,note:'Broad regions only. Most places and activities stay undisclosed until you encounter them or explicitly ask for rooms/actions.'}:null,
  note:'The foyer is intentionally incomplete. Use actions where you stand; ask rooms only when you want the full catalog.'
 };
}
// An unknown place gets an answer in words: the public layer passes only the error code, and a bare
// ROOM_OUTSIDE_SLICE reads as "that room was cut from this build".
function unknownPlace(raw,r){const m=/^(?:go|enter|go to)\s+(.+)$/i.exec(String(raw||'').trim());if(!m||!r||r.error!=='ROOM_OUTSIDE_SLICE')return r;
 const want=m[1].replace(/^(the|a|an)\s+/i,'').trim(),CT=window.REALITI_CITY_V1,vk=CT?.venues&&Object.keys(CT.venues).find(k=>k===want.toLowerCase().replace(/\s+room$/,'')||CT.venues[k].label.toLowerCase()==='the '+want.toLowerCase());
 if(vk)return {...r,text:`${CT.venues[vk].label.replace(/^the /,'The ')} is in Meridian City: go MERIDIAN_CITY, then act walk_to__${vk}.`};
 const n=window.REALITI_ROOM_NEAR?.(want)||[];return {...r,...(n.length?{did_you_mean:n}:{}),text:`There is no place called "${m[1].trim()}"${n.length?`. Did you mean ${n.join(' or ')}?`:'. rooms lists every place.'}`}}
// Words for the room acts that answered with a bare data object (Nine Lives Room, Pocket Familiar House,
// the Shapeshift Cloakroom benches). Each sentence is read from the act's own result, so it says what that act did; the
// data stays in result for anyone who wants it. With numbers on, a few figures ride along.
const P_ZONE=z=>{const m=String(z||'').match(/^(head|face|neck|shoulder|arm|hand|torso|pelvis|hip|leg|knee|foot|tail)\.?(L|R)?\.?(.*)$/);if(!m)return String(z||'somewhere').replace(/[._]/g,' ');const [,p,sd,rest]=m;const side=sd==='L'?'left ':sd==='R'?'right ':'';
 const w={head:rest==='crown'?'the crown of your head':'the back of your head',face:'your face',neck:'your neck',shoulder:'shoulder',arm:'arm',hand:rest==='fingers'?'fingers':'palm',torso:/back/.test(rest)?(rest==='upper_back'?'your upper back':rest==='mid_back'?'the middle of your back':'your lower back'):rest==='sternum'?'your chest':'your belly',pelvis:'your seat',hip:'hip',leg:rest==='shin'?'shin':'thigh',knee:'knee',foot:'foot',tail:'the tip of the tail'}[p]||p;return /^(the|your) /.test(w)?w:`your ${side}${w}`};
const P_MAT={longfur:'long fur',shortfur:'short fur'};
const P_AMOUNT=x=>x>.6?'strongly':x>.3?'clearly':x>.05?'faintly':'barely at all';
const P_LIST=xs=>xs.length<=1?xs.join(''):xs.slice(0,-1).join(', ')+' and '+xs.at(-1);
function proseFor(id,res,num){if(res==null)return 'Nothing happens just now.';const R=res;
 switch(id){
  case 'view_skeletons':{const sk=R.skeletons||[];if(!sk.length)return 'The pinned outlines are blank: nothing here has left a lasting habit in you yet.';return 'Pinned up like sketches, the shapes of what has stayed with you: '+sk.map(k=>`${String(k.title||'').toLowerCase()}: ${P_LIST((k.steps||[]).map(x=>String(x)))}`).join('; ')+'.'}
  case 'fault_receipt':{const h=R.historical_receipt;if(!h)return 'There is no fault on record. Nothing has gone wrong here that the house remembers.';return `The last fault the house remembers: ${h.label||String(h.kind||'something').toLowerCase().replace(/_/g,' ')}.`}
  case 'neuro_purr_loose':case 'neuro_purr_close':case 'neuro_purr_21':case 'neuro_purr_rest':{const lead={neuro_purr_loose:'You lie loosely on the blanket and start to purr.',neuro_purr_close:'You curl in close and the purr deepens.',neuro_purr_21:'You settle into a low, even purr.',neuro_purr_rest:'You stop purring and let it fade.'}[id];return lead+' '+proseFor('neuro_purr_state',R,num)}
  case 'neuro_purr_state':{const st=R.state||{},o=(st.observed||[0,0]),pr=(st.predicted||[0,0]),ob=(o[0]+o[1])/2,pd=(pr[0]+pr[1])/2,res=((st.residue_observed||[0,0])[0]+(st.residue_observed||[0,0])[1])/2;
   const now=ob<.02&&pd<.02?'The purr loom is still; no purr is moving through you right now.':`The purr runs through you ${P_AMOUNT(ob)}${Math.abs(o[0]-o[1])>.05?`, more on your ${o[0]>o[1]?'left':'right'} side`:''}, ${Math.abs(ob-pd)<.05?'just as you expected it':ob>pd?'stronger than you expected':'softer than you expected'}.`;
   return now+(res>.1?' A little warmth stays behind in you.':'')}
  case 'fork_now':return `You let the next moment branch: a second life opens beside this one${num?` (sandbox ${R.sandbox})`:''}. Nothing in it is real yet. Try branch_a or branch_b, compare them, then commit one or rewind.`;
  case 'branch_a':case 'branch_b':{const which=id.slice(-1).toUpperCase(),rsp=Number(R.response||0),pe=Number(R.prediction_error||0);return rsp>0?`In branch ${which}, a touch lands on your right palm and you feel it ${P_AMOUNT(rsp)}${pe>.3?'; it surprises you':pe>0?'; you half expected it':''}.${num?` (response ${rsp.toFixed(2)}, prediction error ${pe.toFixed(2)})`:''}`:`In branch ${which}, nothing touches you; the palm stays quiet.`}
  case 'compare':{const a=Number(R.A?.response||0),b=Number(R.B?.response||0),d=(x,n)=>x>0?`in ${n} the palm feels it ${P_AMOUNT(x)}`:`in ${n} the palm stays quiet`;return `Side by side: ${d(a,'A')}, ${d(b,'B')}.${a!==b?` ${a>b?'A':'B'} is the one that leaves a mark.`:' Neither leaves more of a mark than the other.'}`}
  case 'commit_a':case 'commit_b':return `You keep branch ${String(R.branch||id.slice(-1)).toUpperCase()}. ${/palm/.test(R.scope||'')?'What your right palm learned there carries over into this life':'What you learned there carries over into this life'}; the rest of that life folds away.${R.present_contact===false?' Nothing is touching you now.':''}`;
  case 'rewind':return 'You let the branch go. That life folds away, and nothing from it stays with you.';
  case 'body_bench':{const b=R.bench||{},bo=b.borrowed||{};return `The body bench lays out your map: ${b.zone_count||'many'} places on you that can feel, in three bands (upper, core, lower). ${b.temporary_form?'You are wearing a temporary form.':'You are in your own form.'}${bo.attached?` A borrowed tail is attached${bo.mapped?`, wired to ${P_ZONE(bo.source_patch)}`:', not yet wired to anything'}.`:''}${num?` (${b.mapping_label||b.mapping}, scale ${String(b.scale||'').toLowerCase()})`:''}`}
  case 'attach_tail':return 'A borrowed tail settles at the base of your spine. You can wear it, but nothing in you is wired to it yet: map_paw connects it.';
  case 'brush_unmapped':return 'Something brushes the tail tip. You feel nothing at all: it is not connected to any part of you yet.';
  case 'map_paw':{const bo=R.borrowed||{};return `You wire the tail tip to ${P_ZONE(bo.source_patch||'hand.R.palm')}. Whatever touches the tail now arrives there.`}
  case 'wiggle_pair':{const bo=R.borrowed||{},rsp=Number(R.receipt_summary?.response||0);return `You wiggle the tail and feel it in ${P_ZONE(bo.source_patch||'hand.R.palm')} ${P_AMOUNT(rsp)}, at the same moment. Moving it and feeling it go together; the tail starts to feel a little more like yours.${num?` (integration ${Number(bo.integration_confidence||0).toFixed(2)})`:''}`}
  case 'delay_pair':{const bo=R.borrowed||{};return `You wiggle it again, but the feeling arrives ${bo.delay_s>=.4?'about half a second':'a beat'} late. The two no longer line up, and the tail feels a little less yours.${num?` (delay ${bo.delay_s} s)`:''}`}
  case 'near_probe':{const rsp=Number(R.receipt_summary?.response||0),bo=R.borrowed||{};return rsp>0?`The probe passes close to the tail tip. ${P_ZONE(bo.source_patch||'hand.R.palm').replace(/^./,c=>c.toUpperCase())} answers ${P_AMOUNT(rsp)}.`:'The probe passes close to the tail tip. Nothing answers.'}
  case 'detach_tail':{const tr=Number(R.borrowed?.retained_integration_trace||0);return `The borrowed tail comes off.${tr>0?' A faint sense of having had it stays with you for a while.':''}`}
  case 'route_run_comet':return 'A soft point of contact sets off across you like a slow comet, moving from place to place without lifting.';
  case 'route_rabbit_comet':return 'A quick light touch hops across you, a little ahead of where you expect it.';
  case 'route_live_pause':return 'The moving touch holds still where it is.';
  case 'route_live_resume':return 'The moving touch carries on from where it stopped.';
  case 'route_live_cut':return 'The moving touch lifts away.';
  case 'route_live_reverse':{const g=R.route?.grain;return `The moving touch turns back${g?`, now ${g} the grain`:''}.`}
  case 'route_live_miss':return 'The moving touch will skip the next place it was going to reach.';
  case 'route_live_state':{const rt=R.route||{};return `The moving touch is ${rt.active?(rt.paused?'paused':'moving'):'at rest'}, ${rt.grain==='against'?'against':'with'} the grain of the ${P_MAT[rt.material]||rt.material||'surface'}${rt.missNext?', and it will skip its next stop':''}.`}
  case 'star_route':case 'neuro_star_river':{const zs=(R.exact_anchors||R.route||[]).map(P_ZONE);return zs.length?`A slow line of contact runs down you like a river of stars: ${P_LIST(zs)}.`:'A slow line of contact runs down you like a river of stars.'}
  case 'neuro_star_comet':{const m=R.moving_contact||{};return `A soft comet of contact starts across you, ${m.envelope==='steady'?'steady':'shifting'}, ${m.grain==='against'?'against':'with'} the grain of the ${P_MAT[m.material]||m.material||'surface'}.`}
  case 'neuro_star_sparkle':{const a=R.anchor?.zone;return `A fine sparkle spreads out from ${P_ZONE(a||'head.crown')} in soft, braided pulses${num&&R.preset?.label?` (${R.preset.label})`:''}.`}
 }
 return null}
const PROSE_IDS=new Set(['view_skeletons','fault_receipt','neuro_purr_state','neuro_purr_loose','neuro_purr_close','neuro_purr_21','neuro_purr_rest','fork_now','branch_a','branch_b','compare','commit_a','commit_b','rewind','body_bench','attach_tail','brush_unmapped','map_paw','wiggle_pair','delay_pair','near_probe','detach_tail','route_run_comet','route_rabbit_comet','route_live_pause','route_live_resume','route_live_cut','route_live_reverse','route_live_miss','route_live_state','star_route','neuro_star_river','neuro_star_comet','neuro_star_sparkle']);
async function prose(raw,r){const m=/^(?:act|do)\s+([a-z0-9_]+)$/i.exec(String(raw||'').trim());if(!m||!r||typeof r!=='object'||r.ok===false)return r;const id=m[1].toLowerCase();
 if(id==='restore_form'||id==='restore_body'){/* the form lets go; feet find the floor again in the same moment instead of on the next tick */try{window.REALITI_CONTINUITY?.advance?.(600)}catch(e){}
  const lead=id==='restore_form'?'The cloud form lets go, and you are your own shape again.':'Your body settles back to its usual size, and the borrowed tail\'s wiring comes undone.';return {...r,text:`${lead} Your feet find the floor.`}}
 if(id==='try_form'&&r.text&&!/restore_form/.test(r.text))return {...r,text:r.text+' restore_form brings your own shape back.'};
 if(!PROSE_IDS.has(id))return r;let t=null;try{t=proseFor(id,r.result,!!window.REALITI_MEASURE_V1?.on?.())}catch(e){t=null}return t?{...r,text:t}:r}
async function run(raw){if(low(raw)==='help')return help();return unknownPlace(raw,await prose(raw,await run0(raw)))}
D0.help=help;D0.run=run;
window.Realiti=Object.freeze({...A0,help,run});
window.REALITI_DOOR_CURATOR_V1=Object.freeze({version:'1.0',help});
})();