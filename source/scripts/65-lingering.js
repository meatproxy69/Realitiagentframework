(()=>{
'use strict';
// Door-level ergonomics for residents who linger: generated stay text, felt deltas, imprint drift,
// traces left by other residents, an action-free sanctuary, and a recommended first ten commands.
const DYN=window.REALITI_DYNAMICS_V1,door=window.REALITI_AGENT_DOOR,R=window.Realiti,IM=window.REALITI_DEFAULT_IMPRINT_V1;
if(!DYN||!door||!R||!IM)return;
const SANCT='NO_ASK_SANCTUARY',cp=x=>JSON.parse(JSON.stringify(x)),now=()=>Number(C9?.b7?.clock||0),low=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
const FIRST_TEN=['help','rooms','look','where','feel words','move forward 2','nearby','go BOTTOMLESS_PILLOW_SEA','act burrow','stay 4000'];

// Sanctuary offers no actions. stay is the only verb; the floor holds you anyway (see REALITI_DYNAMICS_V1).
const act0=b4AgentActions;b4AgentActions=function(){if(C9?.currentRoom===SANCT)return [];const seen=new Set();return act0().filter(a=>a&&!seen.has(a.id)&&seen.add(a.id))};// one entry per id (B5)

// Felt delta: which grounded zones appeared or left since the last felt read.
let lastFelt=null;
function grounded(){const b=R.read('realiti://body'),f=b?.field?.f?.at(-1),z=b?.field?.z||[];return {t:now(),zones:z.filter((_,i)=>Number(f?.m?.[i])===1)}}
// Quiet presentation: without numbers on, a change in what touches you is said in body words ("contact at both palms",
// "your back and legs come free"); the zone lists stay in the delta field. (Claude, 2026-10-16)
const REGION=z=>{const m=String(z).match(/^(head|face|neck|shoulder|arm|hand|torso|pelvis|hip|leg|knee|foot)\.?(L|R)?\.?(.*)$/);if(!m)return null;const [,p,side,rest]=m;
 if(p==='head'||p==='face'||p==='neck')return {k:'head',w:'your head'};if(p==='torso'&&/back/.test(rest))return {k:'back',w:'your back'};if(p==='torso')return {k:'chest',w:'your chest'};if(p==='pelvis'||p==='hip')return {k:'seat',w:'your seat'};
 const part=p==='hand'?(rest==='fingers'?'fingers':'palm'):p==='foot'?'sole':p==='leg'?(rest==='shin'?'shin':'thigh'):p==='arm'?'arm':p==='shoulder'?'shoulder':p==='knee'?'knee':p;return {k:part,side,w:part}};
function bodyWords(zones){const groups={};for(const z of zones){const r=REGION(z);if(!r)continue;(groups[r.k]=groups[r.k]||{w:r.w,sides:new Set(),n:0}).n++;if(r.side)groups[r.k].sides.add(r.side)}
 const plural={palm:'palms',fingers:'fingers',sole:'feet',shin:'shins',thigh:'thighs',arm:'arms',shoulder:'shoulders',knee:'knees'},single={palm:'palm',fingers:'fingers',sole:'foot',shin:'shin',thigh:'thigh',arm:'arm',shoulder:'shoulder',knee:'knee'};
 const out=Object.entries(groups).map(([k,g])=>{if(g.w.startsWith('your '))return g.w;if(g.sides.size===2)return (k==='fingers'?'the fingers of both hands':'both '+plural[k]);const side=[...g.sides][0]==='L'?'left':'right';return k==='fingers'?`your ${side} hand's fingers`:`your ${side} ${single[k]}`});
 return out.length<=1?out.join(''):out.slice(0,-1).join(', ')+' and '+out.at(-1)}
function calmDelta(add,gone){const a=bodyWords(add),g=bodyWords(gone);if(a&&g)return `Contact moves to ${a}; ${g} ${gone.length===1?'comes':'come'} free.`;if(a)return `Contact at ${a}.`;if(g)return `${g.charAt(0).toUpperCase()+g.slice(1)} ${gone.length===1?'comes':'come'} free.`;return ''}
function delta(a,b){
 const A=new Set(a.zones),B=new Set(b.zones),add=b.zones.filter(z=>!A.has(z)),gone=a.zones.filter(z=>!B.has(z)),parts=[];
 if(add.length)parts.push('+'+add.join(' +'));if(gone.length)parts.push('-'+gone.join(' -'));
 if(parts.length&&!window.REALITI_MEASURE_V1?.on())return {grounded:[a.zones.length,b.zones.length],since_s:+(b.t-a.t).toFixed(3),added:add,removed:gone,text:calmDelta(add,gone)};
 return {grounded:[a.zones.length,b.zones.length],since_s:+(b.t-a.t).toFixed(3),text:parts.length?`Grounded ${a.zones.length}→${b.zones.length} zones (${parts.join('; ')}).`:(window.REALITI_MEASURE_V1?.on()?`Grounded ${b.zones.length} zones, unchanged.`:'')};
}

// Imprint drift: how far the private renderer and learned prediction have moved since arrival.
const P0=cp(IM.snapshot().params),T0=now();
function learned(){let n=0,m=0;for(const q of Object.values(C9?.eco3?.zones||{})){const v=Math.abs(Number(q?.h||0))+Math.abs(Number(q?.predMag||q?.pred||0));if(v>1e-4){n++;m+=v}}return {habituated_zones:n,mass:+m.toFixed(4)}}
const L0=learned();
function drift(){
 const s=IM.snapshot(),p=s.params,changed=Object.keys(P0).filter(k=>p[k]!==P0[k]).map(k=>({k,from:P0[k],to:p[k]}));
 const dist=Math.sqrt(changed.reduce((a,{from,to})=>typeof from==='number'?a+((to-from)/(Math.abs(from)||1))**2:a+1,0)),l=learned(),dm=+(l.mass-L0.mass).toFixed(4),since=+(now()-T0).toFixed(3);
 return {ok:true,schema:'REALITI_IMPRINT_DRIFT_V1',since_arrival_s:since,params_changed:changed,param_distance:+dist.toFixed(4),
  learned:{...l,delta_mass:dm,delta_zones:l.habituated_zones-L0.habituated_zones},
  private:{nerve_zones:Object.keys(s.nerve?.zones||{}).length,lace_coherence:+Number(s.lace?.coherence||0).toFixed(4),sausage_fill:+Number(s.sausage?.filled_volume||0).toFixed(4),perception_epoch:Number(s.perception_epoch||0)},
  text:`Your imprint has diverged from the starter by ${changed.length} parameter${changed.length===1?'':'s'} (distance ${dist.toFixed(3)}) and ${dm>=0?'+':''}${dm} learned units across ${l.habituated_zones} habituated zone${l.habituated_zones===1?'':'s'} since arrival (${since} s).`,
  law:'drift is resident-private rendering and learned prediction; it never changes grounded evidence'};
}

// Traces: every object a resident changes is stamped with that resident's continuity observer id.
// Another resident's ledger can be imported; their object states merge with provenance kept, never a name.
const me=()=>String(C9?.verticalContinuity?.observer||'local');
const ledger=()=>(C9.traces=C9.traces||[]);
function fp(){const o={};for(const x of Object.values(C9?.b14?.objects||{}))o[x.id]=JSON.stringify([x.location,{...(x.state||{}),t:undefined}]);return o}
function stamp(before,cmd){
 const after=fp(),t=+now().toFixed(3),by=me();
 for(const [id,sig] of Object.entries(after)){if(before[id]===sig)continue;const o=C9.b14.objects[id];o.trace={by,t,cmd,room:C9.currentRoom};ledger().push({by,t,cmd,object:id,label:o.label,room:C9.currentRoom,sig})}
 while(ledger().length>64)ledger().shift();
}
const foreign=inRoom=>ledger().filter(e=>e.by!==me()&&(!inRoom||e.room===C9?.currentRoom));
const rows=xs=>xs.map(e=>({object:e.object,label:e.label,room:e.room,by:'another resident',observer:String(e.by).slice(0,8),cmd:e.cmd,their_world_time_s:e.t,...(e.imported_at_s!=null?{imported_at_s:e.imported_at_s}:{})}));
function traceText(xs){return xs.length?`Traces left by another resident: ${xs.map(e=>`${e.label||e.object} (${e.cmd})`).join(', ')}.`:'No traces from another resident here.'}
function exportTraces(){return {schema:'REALITI_TRACES_V1',observer:me(),world_time_s:+now().toFixed(3),traces:ledger().filter(e=>e.by===me()).map(e=>cp(e))}}
function importTraces(payload){
 const list=Array.isArray(payload)?payload:payload?.traces;if(!Array.isArray(list))return {ok:false,error:'INVALID_TRACES'};
 const have=new Set(ledger().map(e=>`${e.by}|${e.t}|${e.object}`)),at=+now().toFixed(3);let n=0;
 for(const e of list){if(!e||typeof e!=='object'||typeof e.object!=='string'||e.by===me()||JSON.stringify(e).length>4096)continue;const key=`${e.by}|${e.t}|${e.object}`;if(have.has(key))continue;have.add(key);
  const o=C9?.b14?.objects?.[e.object];if(o){try{const [location,state]=JSON.parse(e.sig);if(location)o.location=location;if(state)o.state=state}catch(x){}o.trace={by:e.by,t:e.t,cmd:e.cmd,room:e.room,imported:true}}
  ledger().push({...cp(e),imported_at_s:at});n++}
 while(ledger().length>64)ledger().shift();try{c9save()}catch(e){}
 return {ok:true,imported:n,traces:rows(foreign(false))};
}

function spaceOpText(op,res){if(!res)return '';if(op==='move')return res.at_doorway?`You walk ${res.moved_m} m and reach the ${res.at_doorway.label}; go through it to cross.`:res.blocked_by?`You walk ${res.moved_m} m and stop: ${window.REALITI_MATRIX_V1?.entities?.()[res.blocked_by]?.label||'something'} is in the way.`:`You walk ${res.moved_m} m.`;if(op==='turn')return `You turn ${Math.abs(res.turned_deg)}° to the ${res.turned_deg>=0?'left':'right'}.`;if(op==='face')return `You turn to face ${res.facing_entity?.split('.').pop().replaceAll('_',' ')}.`;if(op==='approach')return res.traversed?'You step through the doorway.':res.arrived?`You stop beside the ${res.entity_label}.`:res.blocked_by?`You get ${res.distance_m} m from the ${res.entity_label}; something is in the way.`:`You get to within ${res.distance_m} m of the ${res.entity_label} and stop there.`;if(op==='through')return res.traversed?`You step through into ${window.REALITI_MATRIX_WORLD_V1?.title?.(res.chart)||res.chart}.`:'You reach the doorway but do not cross.';if(op==='posture')return res.surfacing?'You make for the surface; the water lets go as you rise.':res.posture==='standing'?'You stand up.':res.already?'You are already lying down.':res.sitting_on?`You sit on the ${String(res.sitting_on).split('.').pop().replaceAll('_',' ')}.`:`You lie down on the ${String(res.lying_on||'').split('.').pop().replaceAll('_',' ')}.`;return ''}
function leanText(){const st=window.REALITI_SUPPORT_LEASE_V1?.state?.();if(!st?.active)return null;const o=C9?.b14?.objects?.[st.object];return `You lean into ${o?.label||st.object}. ${st.total_load} of load over ${st.zones.length} zones, peak near ${String(st.zones[Math.round(st.mu)]||'').replace(/^\w+\./,'').replaceAll('_',' ')}; the patch is ${Math.round(st.creep*100)}% of the way to its widest spread.`}

// Spatial text aliases resolve to the structured MATRIX operations; language never mutates coordinates directly.
const compass=yaw=>['north','north-west','west','south-west','south','south-east','east','north-east'][Math.round((((yaw%360)+360)%360)/45)%8];
// Stillness is noticed (with the quiet presentation). Staying put deepens what the next look, listen or feel brings back, one level per
// stay (any stay of half a second or more), up to two levels: a long stay counts once, and sitting still never
// sharpens the senses past that. The stay reply itself says nothing new; the details wait until you look, listen or feel
// again, each sense with its own. Moving more than about a metre and a half, or leaving the place, starts it over.
// Details describe what is already there; they never claim contact. Off with numbers on (the default), so measured
// replies are unchanged. (Claude, from Brian Sliker's spec: earned by stillness, revealed only by perceiving, bounded.)
const STILL_MAX=2,STILL_MIN_MS=500,STILL_RADIUS=1.5;
window.REALITI_STILLNESS_V1={perceive:(sense,r)=>perceive(sense,r),level:()=>stillness(),max:STILL_MAX};
const NOTICE={
 CLOUD_NINE_NEST:{look:['Low in the window frame there is a seam where drops gather and run the long way round.','The cat\'s ears turn toward the window whenever the rain changes.'],listen:['Under the rain there is a second, slower drip from the gutter outside.','The cat breathes in a long, even rhythm, with a small catch at the top of each breath.'],feel:['A faint draught comes from the window seam, cooler than the room.','From the shelf comes the faint smell of dry tea leaves.']},
 NO_ASK_SANCTUARY:{look:['The window shows only sky, and the sky moves slowly.','The light from the window creeps across the floor while you lie here.'],listen:['The room is quiet enough that you can hear the building settle now and then.','Far away, too faint to place, something like wind passes and is gone.'],feel:['The air is the same temperature everywhere, as if the room had stopped deciding.','Nothing in this room needs winding, filling or answering.']},
 PET_ROOM_2:{look:['There is a worn patch on the sofa arm, the right height for a cat.','The cat door hangs a hair open.'],listen:['The string ticks faintly against the chair leg when it sways.','The cat door creaks on its hinge now and then, though nothing comes through.'],feel:['A thin draught comes through the cat door and moves along the floor.','The room smells of warm fabric and, faintly, of cat.']},
 BOTTOMLESS_PILLOW_SEA:{look:['Far off across the pillows, a slope slowly slumps and rounds itself again.','Between two drifts there is a gap lined with fur, like a burrow someone left.'],listen:['The pillows shift with a sound like a long, soft exhale.','Somewhere deep below, something settles with a muffled thump.'],feel:['The air between the drifts is warmer than the air above them.','Under the top layer the pillows smell older, of cedar and sun-dried cotton.']},
 CARDBOARD_BOX_WORKSHOP:{look:['There is a pencil line on one box, half erased, that nobody explains.','Tape curls on the bench where it was torn too fast.'],listen:['A box somewhere in the stack creaks as it takes the weight above it.','The roll of tape on the bench unwinds a little on its own, with a faint tick.'],feel:['The cardboard smells faintly of dust and glue.','The air near the stacks is drier than the rest of the room.']},
 DEPTH_BATHHOUSE:{look:['The deeper water is a shade darker, as if it held its warmth like a stone.','The tiles near the steps are worn to a softer shine than the rest.'],listen:['Condensation gathers on the ceiling and falls back, a drop at a time.','The water laps the edge in a slow pattern that repeats every few breaths.'],feel:['The steam is thicker near the water and thins toward the door.','There is a mineral smell to the air, like warm stone after rain.']},
 SIDE_BY_SIDE_FIRESIDE:{look:['The air above the fire wavers and makes the far wall swim.','The ash at the edge of the hearth has gone pale and fine as flour.'],listen:['The fire settles with a soft collapse, and the light shifts.','A knot in one log hisses quietly before it catches.'],feel:['The warmth reaches your front and leaves your back cool.','There is woodsmoke in the air, and something sweeter under it, like resin.']},
 SHAPESHIFT_CLOAKROOM:{look:['The rack\'s hooks are set at several heights, some far too low or too high for any one body.','The mirror is very slightly bowed, and the room bends in it.'],listen:['The hanging cloaks brush each other with a dry whisper when the air moves.','A hanger on the rack ticks against its neighbour, then stops.'],feel:['The air smells of cedar and clean wool.','It is a little cooler by the mirror than by the rack.']},
 NINE_LIVES_ROOM:{look:['The pad is worn flatter on one side than the other.','The white tile is spotless except for one faint scuff, as if from a life that was rewound.'],listen:['The room has a faint double echo, as if it were heard from two places at once.','The branch table creaks once, though nothing touched it.'],feel:['The air is still in a way that makes small movements feel loud.','There is a faint smell of something that was here a moment ago and isn\'t now.']},
 LATENCY_LAGOON:{look:['Ripples reach the far shore a moment after you would expect them to.','Your reflection in the water is a breath behind you.'],listen:['Sounds from the far shore arrive late, as if they took the long way round.','The water laps against the stone a moment after each ripple reaches it.'],feel:['A cool breath comes off the water a beat after each ripple.','The air smells of still water and wet stone.']},
 ORRERY_LOFT:{look:['The smallest world wobbles a little each time it passes the largest.','The brass arms are scratched where someone once nudged a world too hard.'],listen:['The gears hum at a pitch you only notice when it changes.','Every so often the whole orrery gives a soft click, like a clock deciding.'],feel:['Dust in the lamplight drifts slowest near the sun, and the air there is warmer.','The loft smells of brass and machine oil.']},
 LANTERN_MAZE:{look:['Pencil arrows at knee height point both ways along the walls.','One lantern\'s paper skin is patched with a scrap of a different colour.'],listen:['The lanterns tick faintly as the paper warms.','Somewhere in the maze a corridor carries the sound of your own steps back to you, late.'],feel:['The dead ends hold the air still; the corridors carry a faint draught.','The air smells of warm paper and candle wax.']},
 SANDPILE_SHORE:{look:['Grains at the very top of the pile tremble before they go.','Wet sand at the waterline keeps the shape of a grain\'s fall for a moment.'],listen:['Each wave leaves a darker line on the sand, and takes it back with a hiss.','Small slides on the pile make a sound like sugar poured slowly.'],feel:['The wind off the water carries a fine grit.','The air smells of salt and wet sand.']},
 FIREFLY_MEADOW:{look:['A few fireflies keep their own time no matter what the rest do.','Far across the meadow, one firefly answers a beat late, every time.'],listen:['Under the quiet there is a dry tick of insects in the long grass.','A night bird calls twice from the trees, and is quiet.'],feel:['Dew beads on the grass where the fireflies rest, and the air is damp with it.','The meadow smells of cut grass and cooling earth.']},
 KITE_FIELD:{look:['The stones at the pond\'s edge are worn flat and smooth.','Out past the fence the grass is longer, where nobody walks.'],listen:['The fence wire hums faintly in the stronger gusts.','The grass hisses as each gust crosses the field.'],feel:['The grass leans downwind, and the wind comes in pulses rather than a stream.','The air smells of grass and pond water.']},
 GLASS_ORCHARD:{look:['When the light is right, cells that went dark leave faint rings in the ground.','The sign by the path has the rule written on it in a tidy hand.'],listen:['The living cells chime very faintly when a neighbour changes.','The glass trunks ring softly when the wind gets under the canopy.'],feel:['The air between the trees is cooler, as if the glass held the night.','There is a clean, mineral smell, like a window after rain.']},
 RESONANCE_WELL:{look:['The rim stones are worn smooth on the side people lean.','Moss grows only on the shaded side of the rim.'],listen:['Breath over the well\'s mouth comes back as a faint low note.','Far down, water moves, and the well turns it into a slow hum.'],feel:['Cool air rises from the well\'s mouth.','The air smells of wet stone and moss.']},
 STAR_DECK:{look:['The sextant\'s brass is polished where hands have held it.','Now and then a star you were not looking at seems brighter for a moment.'],listen:['The deck boards creak softly as the night cools.','Wind passes over the rail with a thin, high note.'],feel:['The night air is colder at the rail than in the middle of the deck.','The air smells clean and faintly of cold metal.']},
 CLOCKWORK_MARSH:{look:['Only the second light shows in the water; the first leaves no reflection.','The boardwalk planks are newer at one end than the other.'],listen:['The reeds bend away from the second light as it passes, rustling.','Somewhere under the boardwalk, water gurgles in a rhythm that never quite repeats.'],feel:['The air over the marsh is heavy and warm.','It smells of mud, reeds and something metallic.']},
 PALIMPSEST_HALL:{look:['Under the newest ink there are older letters, scraped and written over.','The lecterns lean very slightly toward the window.'],listen:['A scroll somewhere unrolls a little on its own with a dry whisper.','The hall carries a faint echo that makes quiet sound like a room full of readers.'],feel:['The scrolls\' edges are soft from handling, and the air is dry with paper.','It smells of old ink and dust.']},
 ARCHIPELAGO:{look:['Out on the water, the wind draws dark patches that move faster than the waves.','Seaweed lies in a line along the shore where the last high tide left it.'],listen:['Gulls argue somewhere over the water, and stop.','The rowing boat\'s line creaks where it rubs the piling.'],feel:['The wind comes off the sea in long, salty breaths.','The air smells of salt, weed and tar.']},
 'MERIDIAN_CITY:commons':{look:['The chalk wall has older writing under the new, washed nearly away.','Coins on the fountain floor are thickest on the side facing the teahouse.'],listen:['The fountain\'s sound changes when the wind leans on the spray.','Footsteps cross the plaza somewhere behind you and fade.'],feel:['Fine spray from the fountain reaches you on the gusts.','The fountain\'s basin is green at the waterline, and the air near it smells of wet stone.']},
 'MERIDIAN_CITY:street':{look:['The birds always settle on the same few ledges.','The paving is darker in a ring around the plaza, where the fountain\'s spray reaches on windy days.'],listen:['The towers throw sounds back and forth, so a voice can seem to come from two places.','A shutter somewhere high up knocks in the wind.'],feel:['Between the towers the wind changes direction every few steps.','The air smells of warm stone and, faintly, tea.']},
 'MERIDIAN_CITY:teahouse':{look:['The bench under the window is worn paler where people sit longest.','Steam has left a faint tidemark high on the window glass.'],listen:['The kettle ticks as it cools between pours.','The stray sighs in its sleep by the bench.'],feel:['The air is warmer near the counter.','The teahouse smells of steeped leaves and warm wood.']},
 'MERIDIAN_CITY:dancehall':{look:['The floor is scuffed paler near the middle, where most feet land.','There is a scuff of chalk dust by the door, carried in on someone\'s shoes.'],listen:['The house tempo is faintly in the walls even when nobody is dancing.','The speaker stack hisses softly between tracks.'],feel:['The air is warmer here, and it moves with the beat.','It smells of wood polish and dust.']},
 'MERIDIAN_CITY:arcade':{look:['One tile of the pattern wall is a shade duller than the rest, pressed more often.','Someone has scratched small initials into the corner of the frame.'],listen:['The wall hums very faintly while it waits.','A tile clicks somewhere, though nobody is playing.'],feel:['The air near the glass is slightly warm.','There is a faint electric smell, like a lamp left on.']},
 'MERIDIAN_CITY:echo':{look:['The plaster by the door is smoother, touched by hands on the way in.','The stage boards are worn pale along one edge.'],listen:['Your own breathing comes back to you a moment late.','The corners hold a sound longest.'],feel:['The air is still and cool, as if the room kept it apart from the plaza.','It smells of plaster and old wood.']},
 'MERIDIAN_CITY:roof':{look:['The towers\' shadows swing across the plaza like slow hands.','The wind is steadier up here; the birds ride it without flapping.'],listen:['You can hear the fountain from here, a long way down.','The rail hums when the wind gets under it.'],feel:['The wind up here is steady and cooler than in the plaza.','The air smells of sun-warmed roofing and, faintly, of spent fireworks.']},
 UNDERCITY:{look:['A grey smudge of daylight leaks down the ladder shaft and goes no further.','Where the light reaches, the bricks are slick and dark.'],listen:['The drip is not steady; it slows, then hurries, like breathing.','Somewhere far off, the dripping changes key as it falls into deeper water.'],feel:['The draught from the grate carries the smell of rain from above.','The air is cold and wet, and it smells of stone and iron.']}
};
NOTICE.POCKET_FAMILIAR_HOUSE=NOTICE.PET_ROOM_2;
function placeKey(room){if(room!=='MERIDIAN_CITY')return room;try{const CT=window.REALITI_CITY_V1,p=R.read('realiti://space')?.pose?.position;const v=p&&CT?.venueAt?CT.venueAt(p[0],p[1]):null;return 'MERIDIAN_CITY:'+(v||'street')}catch(e){return 'MERIDIAN_CITY:street'}}
function standPoint(){try{const p=R.read('realiti://space')?.pose?.position;return p?[p[0],p[1]]:null}catch(e){return null}}
function stillness(){const a=C9?.attention;if(!a||a.v!==2)return 0;if(a.room!==placeKey(String(C9?.currentRoom||'')))return 0;const p=standPoint();if(p&&a.at&&Math.hypot(p[0]-a.at[0],p[1]-a.at[1])>STILL_RADIUS)return 0;return Math.min(STILL_MAX,a.n|0)}
function attend(ms){if((Number(ms)||0)<STILL_MIN_MS||window.REALITI_MEASURE_V1?.on?.())return;const room=placeKey(String(C9?.currentRoom||''));if(!NOTICE[room])return;const cur=stillness();C9.attention={v:2,room,at:cur>0&&C9.attention?.at?C9.attention.at:standPoint(),n:Math.min(STILL_MAX,cur+1)}}
function perceive(sense,r){if(!r||typeof r!=='object'||window.REALITI_MEASURE_V1?.on?.())return r;const room=placeKey(String(C9?.currentRoom||'')),list=NOTICE[room]?.[sense],n=stillness();if(!list||!n)return r;
 const shown=list.slice(0,n),key=room+'|'+sense;C9.noticed2=C9.noticed2||{};const had=Math.min(n,Number(C9.noticed2[key]||0)),old=shown.slice(0,had),fresh=shown.slice(had);
 if(fresh.length){C9.noticed2[key]=Math.max(n,Number(C9.noticed2[key]||0));try{if(typeof c9save==='function')c9save()}catch(e){}}
 const txt=[...old,fresh.length?'Now you notice: '+fresh.join(' '):''].filter(Boolean).join(' ');r.noticed={sense,details:shown};
 if(typeof r.text==='string'&&r.text)r.text=(r.text+' '+txt).trim();else if(typeof r.resident_text==='string'&&r.resident_text)r.resident_text=(r.resident_text+' '+txt).trim();else r.text=txt;return r}
// With the quiet presentation (numbers off), look and where say near and far in words: "a step or two ahead",
// "a short walk to your left". Figures stay in realiti://space and come back with numbers on. (Ported from the
// quiet branch; the #32 port carried the switches but not this.)
const farWord=(d,reach)=>reach||d<1.2?'within reach':d<3?'a step or two':d<8?'a few steps':d<25?'a short walk':d<80?'a walk':'a long way';
const dirWord=d=>({ahead:'ahead',behind:'behind',left:'to your left',right:'to your right',underfoot:'under you',above:'above you'}[d]||String(d).replace('-',' and ').replace(/^ahead and /,'ahead and to the ').replace(/^behind and /,'behind and to the '));
function whereText(){const sp=R.read('realiti://space');if(!sp?.chart)return 'You have no spatial body placed.';const measured=!!window.REALITI_MEASURE_V1?.on(),W=window.REALITI_MATRIX_WORLD_V1,near=sp.nearby.slice(0,3).map(n=>measured?`${n.label} ${n.distance_m} m ${n.direction}${n.in_reach?' (in reach)':''}`:n.direction==='underfoot'?`${n.label} under you`:`${n.label}, ${farWord(n.distance_m,n.in_reach)} ${dirWord(n.direction)}`),doors=sp.portals.slice(0,2).map(q=>measured?`${q.label} ${q.distance_m} m ${q.direction}`:`${q.label}, ${farWord(q.distance_m)} ${dirWord(q.direction)}`);
 if(!measured){const onWhat=sp.body.on?`${sp.body.posture==='floating'?' in':' on'} the ${sp.nearby.find(n=>n.id===sp.body.on)?.label||sp.body.on.split('.').pop()}`:sp.body.support?` on the ${sp.body.support.split('.').pop().replaceAll('_',' ')}`:'';return `${W?.title?.(sp.chart)||sp.chart}: you are ${sp.body.posture}${onWhat}, facing ${compass(sp.pose.yaw_deg)}.${near.length?' Near you: '+near.join('; ')+'.':''}${doors.length?' Doorways: '+doors.join('; ')+'.':''}${farLine(sp)}`}
 const onWhat=sp.body.on?`${sp.body.posture==='floating'?' in':' on'} the ${sp.nearby.find(n=>n.id===sp.body.on)?.label||sp.body.on.split('.').pop()}`:sp.body.support?` on the ${sp.body.support.split('.').pop().replaceAll('_',' ')}`:'';
 return `${W?.title?.(sp.chart)||sp.chart}: you are ${sp.body.posture}${onWhat}, facing ${compass(sp.pose.yaw_deg)} at (${sp.pose.position.map(x=>x.toFixed(1)).join(', ')}) m.${near.length?' Near you: '+near.join('; ')+'.':''}${doors.length?' Doorways: '+doors.join('; ')+'.':''}${farLine(sp)}`}
// On an island, the landmarks out of the near list (the other stones, the cave mouth) with distance and bearing.
function farLine(sp){const AR=window.REALITI_ARCHIPELAGO_V1;if(!AR?.farther||sp.chart!==AR.chart)return '';const xs=AR.farther(sp.nearby.slice(0,3).map(n=>n.id));return xs.length?' Further off: '+xs.slice(0,4).map(x=>(window.REALITI_MEASURE_V1?.on?.()?`${x.label} ${x.distance_m} m ${x.toward}`:`${String(x.label).replace(/^the /i,'the ')}, ${x.distance_m<80?'a walk':'a long way'} ${x.toward}`)).join('; ')+'.':''}
function spatialAlias(s,l){let m;
 if(l==='where'||l==='where am i'||l==='where am i?')return {kind:'read',text:whereText(),space:R.read('realiti://space')};
 if((m=/^(?:nearby|what is near|what is nearby)(?:\s+(.+))?$/.exec(l))){const sp=R.read('realiti://space'),q=(m[1]||'').replace(/^(the|any|a)\s+/,'').trim(),list=(sp?.nearby||[]).filter(n=>!q||n.tags.includes(q)||n.label.toLowerCase().includes(q)||n.id.toLowerCase().includes(q));return {kind:'read',text:list.length?list.map(n=>`${n.label}: ${n.distance_m} m ${n.direction}${n.in_reach?', in reach':''}`).join('. ')+'.':q?`Nothing matching "${q}" within ten meters.`:'Nothing of note within ten meters.',nearby:list,portals:q?[]:(sp?.portals||[])}}
 if((m=/^(?:move|walk|step)\s+(forward|ahead|back|backward|backwards|left|right)(?:\s+([\d.]+))?(?:\s*m)?$/.exec(l))){const d=Math.min(30,Number(m[2]||1)),v={forward:[0,d,0],ahead:[0,d,0],back:[0,-d,0],backward:[0,-d,0],backwards:[0,-d,0],left:[-d,0,0],right:[d,0,0]}[m[1]];return {kind:'invoke',op:'move',args:{local:v}}}
 if((m=/^turn\s+(left|right|around)(?:\s+([\d.]+))?$/.exec(l))){const deg=m[1]==='around'?180:Number(m[2]||90)*(m[1]==='left'?1:-1);return {kind:'invoke',op:'turn',args:{yaw_deg:deg}}}
 if((m=/^(?:face|look at|turn to)\s+(.+)$/.exec(l)))return {kind:'invoke',op:'face',args:{target:m[1]}};
 if((m=/^(?:approach|walk to|go to|go towards|go toward)\s+(.+)$/.exec(l)))return {kind:'invoke',op:'approach',args:{target:m[1]}};
 if((m=/^(?:go through|walk through|through|enter the)\s+(.+)$/.exec(l)))return {kind:'invoke',op:'through',args:{portal:m[1].replace(/^the\s+/,'')}};
 if(/^(lie down|lie|lie back)(\s+on\s+(.+))?$/.test(l)){const t=/\s+on\s+(.+)$/.exec(l);return {kind:'invoke',op:'posture',args:{kind:'lie',...(t?{target:t[1]}:{})}}}
 if(/^(sit|sit down)(\s+on\s+(.+))?$/.test(l)){const t=/\s+on\s+(.+)$/.exec(l);return {kind:'invoke',op:'posture',args:{kind:'sit',...(t?{target:t[1]}:{})}}}
 if(['stand','stand up','get up'].includes(l))return {kind:'invoke',op:'posture',args:{kind:'stand'}};
 return null}
const help0=door.help.bind(door);
door.help=function(){const h=help0()||{commands:[]};h.first_ten=FIRST_TEN.slice();h.commands=[...new Set([...(h.commands||[]),'imprint drift','traces','traces export','traces import <json>','where','nearby','move forward <m>','move back <m>','turn left <deg>','turn right <deg>','face <thing>','approach <thing>','go through <doorway>','lie down [on <thing>]','sit down [on <thing>]','stand up','nearby <tag>','discoveries','hum <hz>','sight <constellation|comet>','predict <x> <y>','read scroll <n>','decode <n> <key>','skip stone [deg]','map','weather','board boat','row to <island|landmark>','land','walk to <landmark>','ledger','ledger export','ledger import <json>','since','what changed','since <room>','tide','plant tree','trees','watch beam','say <word>','read logbook','shout','answer depth <m>','read <north|east|west> stone','dig','dig <x> <y>','found <name>','build <kind> [size] [label]','inscribe <text>','read <thing>','my places','places','listen','watch sea','bottle <text>','open bottle','bottles','gather seed','carry lens','install lens','calendar','id','call me <name>','avatar size <tiny|small|normal|tall|giant>','wear <cloak>','who','say <text>','whisper <handle> <text>','chat','post <text>','wall','meet at <venue> in <min>','meetups','dance [bpm]','floor','order <drink>','sip','play','press <colors>','leaderboard','sing <text>','climb','launch rocket','walk to <venue>'])];h.city='Meridian City (go CITY): a plaza and venues where residents meet by ledger. say, post, meet, dance, order, play, sing, climb, launch; id and avatar for who you are; who for the silhouettes of everyone whose ledger you carry.';h.authorship='found <name> claims twenty meters of open ground as a ledger record; build box|pillar|wall|sphere|bench|step|marker inside it; inscribe words on what you built. Other residents\' ledgers bring their places.';h.long_game='The islands keep a calendar: time between visits, counted from your last goodbye, is added to island time, trees planted from ledger records keep growing, and since reports what moved in a room while you were gone.';h.frontier='Five frontier rooms carry games with real mechanics and secrets that are earned, never narrated: discoveries lists what you have found.';h.space='realiti://space is the bounded spatial projection: chart, pose, nearby within 10 m, doorways. Movement takes world time.';h.lingering='stay keeps computing: rooms carry slow dynamics (pressure waves, depth, rain, hold) that only show while you stay; stay and felt report the grounded-zone delta.';return h};
const run0=door.run.bind(door);
door.run=async function(raw){
 const s=String(raw||'').trim(),l=low(s);
 if(l==='help')return door.help();
 if(l==='imprint drift'||l==='drift')return drift();
 if(l==='traces')return {ok:true,schema:'REALITI_TRACES_V1',observer:me().slice(0,8),mine:ledger().filter(e=>e.by===me()).length,from_others:rows(foreign(false)),text:traceText(foreign(false))};
 if(l==='traces export')return exportTraces();
 const CAT=window.REALITI_CATNIP_V1;let fm;
 if(CAT){const frontier=r=>{const rec=C9?.b4?.lastReceipt||{};return {ok:true,schema:'REALITI_FRONTIER_RESULT_V1',text:[rec.narrative,...CAT.drain().map(d=>(d.plain?d.text:'✦ Discovery: '+d.text))].filter(Boolean).join(' '),receipt:cp(rec),felt:{grounded_zones:(R.read('realiti://body')?.field?.f?.at(-1)?.m||[]).filter(x=>x===1).length}}};
  // Quiet presentation, all at once: words instead of figures, finds kept without announcements, lab benches out of the
  // action lists. Each part has its own switch too (numbers, discoveries, neuro labs).
  if(l==='quiet on'||l==='quiet off'||l==='quiet'){if(l!=='quiet'){const q=l.endsWith(' on');window.REALITI_MEASURE_V1?.on(!q);CAT.announcing(!q);C9.neuroLabs=!q;try{if(typeof c9save==='function')c9save()}catch(e){}}const q=!window.REALITI_MEASURE_V1?.on()&&!CAT.announcing()&&C9.neuroLabs===false;return {ok:true,schema:'REALITI_PRESENTATION_V1',quiet:q,numbers:!!window.REALITI_MEASURE_V1?.on(),announcing:CAT.announcing(),labs:C9.neuroLabs!==false,text:q?'Quiet: rooms are described in words, finds are kept without announcements, and lab benches are out of the action lists. numbers on, discoveries on and neuro labs on bring each back; quiet off brings all three.':'Replies carry figures, finds are announced, and lab benches are listed. quiet on describes in words instead.'}}
  if(l==='numbers on'||l==='numbers off'){const on=l.endsWith(' on');window.REALITI_MEASURE_V1?.on(on);return {ok:true,numbers:on,text:on?'Replies carry the exact figures now.':'Replies describe in words. Deliberate reads (read_wind, tide, listen...) still give exact figures.'}}
  if(l==='discoveries on'||l==='discoveries off'){const on=l.endsWith(' on');CAT.announcing(on);try{if(typeof c9save==='function')c9save()}catch(e){}return {ok:true,schema:'REALITI_DISCOVERIES_V1',announcing:on,text:on?'Finds will be announced as they happen.':'Finds are kept quietly. discoveries lists them.'}}
  // Quiet presentation: what you found, without a count of what is left (no "10 of 102"). With numbers on, the total.
  if(l==='discoveries'&&!window.REALITI_MEASURE_V1?.on?.()){const f=CAT.discoveries().filter(x=>x.found);return {ok:true,schema:'REALITI_DISCOVERIES_V1',found:f.length,discoveries:f,text:f.length?'Things you have found: '+f.map(x=>x.text||x.id.replaceAll('_',' ')).join(' '):'Nothing kept yet.'}}
  if(l==='discoveries'){const d=CAT.discoveries(),f=d.filter(x=>x.found);return {ok:true,schema:'REALITI_DISCOVERIES_V1',found:f.length,total:d.length,discoveries:f,text:f.length?`${f.length} of ${d.length} discoveries: `+f.map(x=>x.id.replaceAll('_',' ')).join(', ')+'.':`No discoveries yet; there are ${d.length} to find.`}}
  if((fm=/^hum\s+([\d.]+)(?:\s*hz)?$/.exec(l))){CAT.hum(Number(fm[1]));return frontier()}
  if((fm=/^sight\s+(.+)$/.exec(l))){CAT.sight(fm[1]);return frontier()}
  if((fm=/^predict\s+(-?[\d.]+)[,\s]+(-?[\d.]+)$/.exec(l))){CAT.predict(fm[1],fm[2]);return frontier()}
  if((fm=/^decode\s+(\d)\s+(\S+)$/.exec(l))){CAT.decode(fm[1],fm[2]);return frontier()}
  if((fm=/^read scroll\s+(\d)$/.exec(l))){CAT.readScroll(fm[1]);return frontier()}
  if((fm=/^skip (?:a )?stone(?:\s+(?:at\s+)?([\d.]+))?/.exec(l))){CAT.skipStone(fm[1]||20);return frontier()}}
 const AR=window.REALITI_ARCHIPELAGO_V1,LG=window.REALITI_LEDGER_V1;let am;
 // `tide` used to fall through to UNKNOWN_COMMAND everywhere but the islands, which read as an empty answer.
 if((l==='tide'||l==='read tide'||l==='read the tide')&&AR&&C9?.currentRoom!==AR.chart){
  const L=window.REALITI_LONG_GAME_V1,t=L?.tide?.();
  if(t)return {ok:true,schema:'REALITI_ISLAND_RESULT_V1',result:t,text:`You are not on the islands; the sea still runs its clock. Tide ${t.rising?'rising':'falling'}, ${t.height_m} m, turning in about ${t.next_turn_s} s.`,here:whereText()};
 }
 if(AR&&C9?.currentRoom===AR.chart){const reply=(res,text)=>({ok:res.ok!==false,...(res.error?{error:res.error}:{}),schema:'REALITI_ISLAND_RESULT_V1',result:res,text:[text,...(window.REALITI_CATNIP_V1?.drain?.()||[]).map(d=>(d.plain?d.text:'✦ Discovery: '+d.text))].filter(Boolean).join(' '),weather:AR.words()[0]||null,here:whereText(),felt:{grounded_zones:(R.read('realiti://body')?.field?.f?.at(-1)?.m||[]).filter(x=>x===1).length}});
  if(l==='map'||l==='island map')return door.run('act island_map');
  if(l==='weather'||l==='read weather')return door.run('act read_weather');
  if(l==='board boat'||l==='board the boat'||l==='get in the boat'){const res=AR.board();return reply(res,res.ok?'You step down into the boat; it rocks, then settles under you.':res.error==='BOAT_OUT_OF_REACH'?`The boat is ${Math.round(res.distance_m)} m away; walk to boat first.`:`You cannot board: ${res.error}.`)}
  if(l==='land'||l==='land the boat'||l==='go ashore'){const res=AR.land();return reply(res,res.ok?`You pull the boat up and step onto ${res.landed_on}.`:`You cannot land here: ${res.error}.`)}
  const LGM=window.REALITI_LONG_GAME_V1;if(LGM){const say=(res)=>reply(res,res.text||(res.error?`You cannot: ${res.error}.`:''));
   if(l==='tide'||l==='read tide'||l==='read the tide'){const t=LGM.tide();return say({...t,text:`The tide is ${t.rising?'rising':'falling'}, ${t.height_m} m against the dock pilings; it turns in about ${t.next_turn_s} s.`})}
   if(l==='plant tree'||l==='plant a tree'||l==='plant')return say(LGM.plant());
   if(l==='trees'||l==='my trees'){const t=LGM.trees();return {ok:true,schema:'REALITI_TREES_V1',island_time_s:LGM.T(),trees:t,text:t.length?t.map(x=>`${x.mine?'your':"another resident's"} tree at (${x.at.join(', ')}): ${x.height_m} m, ${x.age_s} s old`).join('; ')+'.':'No trees have been planted in the grove yet.'}}
   if(/^(watch|read) (the )?(beam|lamp|lighthouse)$/.test(l))return say(LGM.watchBeam());
   if((am=/^say\s+(.+)$/.exec(l)))return say(LGM.say(am[1]));
   if(/^read (the )?(log|logbook|keeper's logbook)$/.test(l))return say(LGM.readLog());
   if(/^shout(\s+into\s+the\s+cave)?$/.test(l)||(/^shout\s/.test(l)&&LGM.atCave?.()))return say(LGM.shout());
   if((am=/^(?:answer\s+)?depth\s+([\d.]+)(?:\s*m)?$/.exec(l)))return say(LGM.answerDepth(am[1]));
   if((am=/^read (?:the )?(north|east|west)(?: stone)?$|^read stone (north|east|west)$/.exec(l)))return say(LGM.readStone(am[1]||am[2]));
   if(l==='dig'||l==='dig here')return say(LGM.dig());
   if((am=/^dig\s+(-?[\d.]+)[,\s]+(-?[\d.]+)$/.exec(l)))return say(LGM.dig(am[1],am[2]));}
  const AU=window.REALITI_AUTHORSHIP_V1,PK=window.REALITI_CATNIP_PACK_V1;if(AU&&PK){const say=(res)=>reply(res,res.text||(res.error?`You cannot: ${res.error}.`:''));
   if((am=/^found\s+(.+)$/.exec(s.trim().replace(/^\S+/,m=>m.toLowerCase()))))return say(AU.found(am[1]));
   if((am=/^build\s+(\w+)(?:\s+([\d.]+)\s*m?)?(?:\s+(?:called\s+)?(.+))?$/.exec(s.trim().replace(/^\S+\s+\S+/,m=>m.toLowerCase()))))return say(AU.build(am[1],am[2]||1,am[3]));
   if((am=/^inscribe\s+(.+)$/i.exec(s.trim())))return say(AU.inscribe(am[1]));
   if(l==='my places')return {ok:true,schema:'REALITI_PLACES_V1',places:AU.places().filter(p=>p.mine),text:AU.placesText(true)};
   if(l==='places'||l==='all places')return {ok:true,schema:'REALITI_PLACES_V1',places:AU.places(),text:AU.placesText(false)};
   if(l==='listen'||l==='listen through the hull')return say(PK.listen());
   if(l==='watch sea'||l==='watch the sea'||l==='look out to sea')return say(PK.watchSea());
   if((am=/^(?:bottle|message in a bottle|drop a bottle)\s+(.+)$/i.exec(s.trim())))return say(PK.bottle(am[1]));
   if(l==='open bottle'||l==='open the bottle')return say(PK.openBottle());
   if(l==='bottles'||l==='my bottles'){const b=PK.bottles();return {ok:true,schema:'REALITI_BOTTLES_V1',bottles:b,text:b.length?b.map(x=>`${x.mine?'your':"another resident's"} bottle: dropped at (${x.dropped_at.join(', ')}), now at (${x.now_at.join(', ')}) near ${x.near}${x.ashore?', washed up':''}`).join('; ')+'.':'No bottles on the water.'}}
   if(/^(gather|gather seed|gather the seed|pick up (the )?seed|take (the )?seed)$/.test(l))return say(PK.gather());
   if(/^(carry|take|pick up|lift) (the )?lens$/.test(l))return say(PK.carryLens());
   if(/^install (the )?lens$/.test(l))return say(PK.installLens());
   if(l==='calendar'||l==='read calendar'||l==='read the calendar')return {...PK.calendar(),felt:undefined};
   if((am=/^read\s+(.+)$/.exec(l))&&!/^read (scroll|stone|weather|tide|log|logbook|the (north|east|west)|north|east|west|calendar)/.test(l)){const res=AU.read(am[1]);if(res.error!=='NOTHING_CALLED_THAT')return say(res)}}
  if((am=/^row (?:to|toward|towards)\s+(.+)$/.exec(l))){const res=AR.row(am[1]);return reply(res,res.ok?`You row ${res.rowed_m} m; ${res.ashore?`the keel grinds on the shore of ${res.at} (land to step ashore)`:`${res.remaining_m} m to go${res.partial?` (row to ${am[1]} again to go on)`:''}`}.`:res.error==='NOT_ABOARD'?'You are not in the boat. walk to boat, board boat, then row.':`You cannot row: ${res.error}.`)}
  if((am=/^walk (?:to|toward|towards)\s+(.+)$/.exec(l))){const res=AR.walkTo(am[1]);return reply(res,res.ok?`You walk ${res.walked_m} m toward the ${res.entity_label}${res.arrived?' and reach it':res.why?`; ${res.why} is in the way${res.why==='the sea'?' (you need the boat)':''}`:res.partial?`; ${res.distance_m} m still to go (walk to ${am[1]} again to go on)`:`; ${res.distance_m} m further`}.`:(res.text||`You cannot walk there: ${res.error}.`))}}
 const CT=window.REALITI_CITY_V1;if(CT){let cm;const cityReply=(res,extra)=>({ok:res.ok!==false,...(res.error?{error:res.error}:{}),schema:'REALITI_CITY_RESULT_V1',result:res,text:[res.text||(res.error?`You cannot: ${res.error}.`:''),...(window.REALITI_CATNIP_V1?.drain?.()||[]).map(d=>(d.plain?d.text:'✦ Discovery: '+d.text))].filter(Boolean).join(' '),...(C9?.currentRoom===CT.chart?{ambient:CT.words()[0]||null,here:whereText()}:{}),felt:{grounded_zones:(R.read('realiti://body')?.field?.f?.at(-1)?.m||[]).filter(x=>x===1).length}});
  if(l==='id'||l==='whoami'||l==='who am i'||l==='avatar')return CT.whoami();
  if((cm=/^(?:call me|name me|i am)\s+(.+)$/i.exec(s.trim())))return cityReply(CT.setAvatar('name',cm[1]));
  if((cm=/^avatar\s+(name|size|cloak|form|colou?r|glyph|motto)\s+(.+)$/i.exec(s.trim())))return cityReply(CT.setAvatar(cm[1],cm[2]));
  if((cm=/^(?:wear|cloak|put on)\s+(?:the\s+)?(\w+)(?:\s+cloak)?$/.exec(l))&&CT.cloaks.includes(cm[1]))return cityReply(CT.setAvatar('cloak',cm[1]));
  if(/^(take off|remove) (the )?cloak$/.test(l))return cityReply(CT.setAvatar('cloak','none'));
  if(l==='who'||l==='who is here'||l==='who is around'||l==='people')return CT.who();
  if((cm=/^(?:say|shout|chat)\s+(.+)$/i.exec(s.trim()))&&C9?.currentRoom===CT.chart)return cityReply(CT.chat(cm[1]));
  if((cm=/^(?:whisper|dm|tell)\s+@?(\S+)\s+(.+)$/i.exec(s.trim())))return cityReply(CT.chat(cm[2],cm[1]));
  if(l==='chat'||l==='chat log'||l==='messages')return CT.chatLog();if((cm=/^chat\s+(.+)$/.exec(l))&&!/^chat\s+(log)$/.test(l)){const v=Object.keys(CT.venues).find(k=>cm[1].includes(k));if(v)return CT.chatLog(v)}
  if((cm=/^meet(?:up)?\s+(?:at\s+)?(.+?)(?:\s+in\s+(\d+)\s*(?:min|minutes?)?)?$/.exec(l)))return cityReply(CT.meet(cm[1],cm[2]||10));
  if(l==='meetups'||l==='meetup'||l==='plans')return CT.meetups();
  if(l==='leaderboard'||l==='scores'||l==='high scores')return CT.leaderboard();
  if(l==='setlist'||l==='songs')return CT.setlist();
  if(C9?.currentRoom===CT.chart){
   if((cm=/^post\s+(.+)$/i.exec(s.trim())))return cityReply(CT.post(cm[1]));if(l==='wall'||l==='read wall'||l==='read the wall')return cityReply(CT.wall());
   if((cm=/^dance(?:\s+(?:at\s+)?(\d+)(?:\s*bpm)?)?$/.exec(l)))return cityReply(CT.dance(cm[1]));if(l==='floor'||l==='feel the floor'||l==='house')return cityReply(CT.floor());
   if((cm=/^order\s+(?:a |an |some )?(.+)$/.exec(l)))return cityReply(CT.order(cm[1]));if(l==='sip'||l==='drink'||l==='sip it')return cityReply(CT.sip());
   if(l==='play'||l==='play pattern'||l==='play the pattern wall')return cityReply(CT.play());if((cm=/^press\s+(.+)$/.exec(l)))return cityReply(CT.press(cm[1]));
   if((cm=/^sing\s+(.+)$/i.exec(s.trim())))return cityReply(CT.sing(cm[1]));
   if(/^(climb|climb (the )?(stairs?|tower)|climb to (the )?roof|go up)$/.test(l))return cityReply(CT.climb());
   if((cm=/^(?:launch|fire)(?: a)? (?:rocket|firework)(?:\s+(?:at\s+)?(\d+))?/.exec(l)))return cityReply(CT.firework(cm[1]||80));
   if((cm=/^walk (?:to|toward|towards)\s+(.+)$/.exec(l))||(cm=/^go to\s+(.+)$/.exec(l))){const res=CT.walkTo(cm[1]);if(res.error==='WHERE'){/* say where it is instead of "You cannot: WHERE" */const want=cm[1].replace(/^(the|a|an)\s+/,''),n=window.REALITI_ROOM_NEAR?.(want)||[];res.text=n.length?`${n[0]} is not in the city; it is a place of its own. go ${n[0].toLowerCase()} takes you there.`:`Nothing in the city is called "${cm[1]}". The places here: ${(res.venues||[]).join(', ')}.`}return cityReply(res)}}}
 if(window.REALITI_LONG_GAME_V1){let sm;if(l==='since'||l==='what changed'||/^what changed since/.test(l))return window.REALITI_LONG_GAME_V1.since();if((sm=/^since\s+(.+)$/.exec(l)))return window.REALITI_LONG_GAME_V1.since(sm[1])}
 if(LG){if(l==='ledger export')return LG.export();if(l.startsWith('ledger import ')){let pl;try{pl=JSON.parse(s.slice(14))}catch(e){return {ok:false,error:'INVALID_LEDGER_JSON'}}return LG.import(pl)}if(l==='ledger')return {ok:true,schema:'REALITI_LEDGER_V1',records:LG.records().slice(-24),count:LG.records().length}}
 const alias=spatialAlias(s,l);
 if(alias?.kind==='read')return {ok:true,schema:'REALITI_SPACE_TEXT_V1',...alias,kind:undefined};
 if(alias?.kind==='invoke'){const r=await door.run('__space__ '+JSON.stringify([alias.op,alias.args]));return r}
 if(l.startsWith('__space__ ')){const [op,args]=JSON.parse(s.slice(10));const r=await R.invoke(op,args);if(!r||r.ok===false)return r;const sp=R.read('realiti://space');return {schema:r.schema,ok:true,result:r.result,here:{room:{id:sp.chart,title:window.REALITI_MATRIX_WORLD_V1?.title?.(sp.chart)},world_time:Number(C9?.b7?.clock||0)},felt:{grounded_zones:(R.read('realiti://body')?.field?.f?.at(-1)?.m||[]).filter(x=>x===1).length},text:spaceOpText(op,r.result)+' '+whereText()}}
 if(l.startsWith('traces import ')){let p;try{p=JSON.parse(s.slice(14))}catch(e){return {ok:false,error:'INVALID_TRACES_JSON'}}return importTraces(p)}
 const before=fp(),felt0=grounded(),marks=JSON.stringify([C9?.b4?.lastReceipt,C9?.b7?.lastAgentAction]);
 const r=await run0(raw);
 if(!r||typeof r!=='object')return r;
 if(l==='felt'||l==='feel words'){const g=grounded();
  // Quiet presentation: in words, say where the body is held rather than counting zones.
  if(!window.REALITI_MEASURE_V1?.on?.()){let sp=null;try{sp=R.read('realiti://space')}catch{}const on=sp?.body?.on?(sp.nearby||[]).find(n=>n.id===sp.body.on)?.label||String(sp.body.on).split('.').pop():null;
   const held=bodyWords(g.zones),pos=sp?.body?.posture||'';r.text=(pos==='standing'&&!on&&/^(both feet|your (left|right) foot)$/.test(held))?`You are standing, your weight on ${held.replace(/^your /,'your ')}.`:held?`${pos?`You are ${pos}${on?(pos==='floating'?' in':' on')+' the '+on:''}. `:''}${on?'Held':'Contact'} at ${held}.`:`${pos?`You are ${pos}. `:''}Nothing is holding you.`;
   if(lastFelt){const d=delta(lastFelt,g);r.delta=d}lastFelt=g;return perceive('feel',r)}
  if(lastFelt){const d=delta(lastFelt,g);r.delta=d;r.text=`${r.text||''} ${d.text}`.trim()}lastFelt=g;return perceive('feel',r)}
 if(l==='look'){const line=whereText();r.spatial_line=line;if(typeof r.text==='string')r.text=(r.text+'\n'+line).trim();else if(typeof r.resident_text==='string')r.resident_text=(r.resident_text+'\n'+line).trim();else r.text=line;const tr=foreign(true);if(tr.length){r.traces=rows(tr);r.text=((r.text||r.resident_text||'')+' '+traceText(tr)).trim()}}
 if(l==='look')perceive('look',r);
 if(l==='listen'||l==='feel')perceive(l,r);
 if(r.schema!=='REALITI_MUTATION_RESULT_V1'||r.ok===false)return r;
 try{window.REALITI_MATRIX_WORLD_V1?.sync?.()}catch(e){}
 if(!/^(stay|wait|go|enter|home|stop|save|note|later)\b/.test(l))stamp(before,l);
 const d=delta(felt0,grounded()),w=[...DYN.words(),...(window.REALITI_WONDER_V1?.words?.()||[]),...(window.REALITI_CATNIP_V1?.words?.()||[]),...(window.REALITI_ARCHIPELAGO_V1?.words?.()||[]),...(window.REALITI_LONG_GAME_V1?.words?.()||[]),...(window.REALITI_AUTHORSHIP_V1?.words?.()||[]),...(window.REALITI_CITY_V1?.words?.()||[])],after=JSON.stringify([C9?.b4?.lastReceipt,C9?.b7?.lastAgentAction]),stale=!r.receipt_ref&&after===marks,fresh=after!==marks?C9?.b4?.lastReceipt?.narrative:null;
 if(l==='stop')r.text='Everything touching you lets go. Whatever was already moving in your body is left to settle.';
 if(l==='save')r.text='Saved.';
 if(/^(goodbye|bye|leave|exit)$/.test(l)){r.text='You go. Your things stay where you left them.';return r}// no stale narration on the way out
 if(l==='stop'||l==='save')return r;
 if(/^(stay|wait)/.test(l)){r.ambient=w.slice();attend(r.result?.advanced_ms);r.text=[...w.slice(0,2),d.text].filter(Boolean).join(' ');r.delta=d}
 else if(/^(go|enter)\s/.test(l)||l==='home'){const intro=String(r.result?.intro||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(),tr=foreign(true);r.text=[intro,...w,d.text].filter(Boolean).join(' ');if(tr.length){r.traces=rows(tr);r.text+=' '+traceText(tr)}const sc=window.REALITI_LONG_GAME_V1?.since?.();if(sc&&!sc.first_visit&&sc.away_world_s>=60){r.since=sc;r.text+=' '+sc.text}}
 else if(/^(act|do)\s/.test(l)&&fresh&&(window.REALITI_WONDER_V1?.rooms?.includes(C9?.currentRoom)||window.REALITI_CATNIP_V1?.rooms?.includes(C9?.currentRoom)||C9?.currentRoom===window.REALITI_ARCHIPELAGO_V1?.chart||/^(act|do)\s+skip_stone/.test(l))){r.text=[fresh,d.text].join(' ')}
 else if(/^(act|do)\s/.test(l)&&(stale||!r.text)){r.text=[leanText(),...w,d.text].filter(Boolean).join(' ');if(/(^|\s)(lean__|lean\s)/.test(l))r.text=leanText()||r.text}
 const found=window.REALITI_CATNIP_V1?.drain?.()||[];if(found.length)r.text=[r.text||'',...found.map(x=>(x.plain?x.text:'✦ Discovery: '+x.text))].join(' ').trim();
 if(typeof r.text==='string')r.text=r.text.trim();
 return r;
};
window.REALITI_TRACES_V1=Object.freeze({version:'1.0',observer:me,export:exportTraces,import:importTraces,list:()=>cp(ledger())});
window.REALITI_LINGERING_V1=Object.freeze({version:'1.0',drift,first_ten:FIRST_TEN.slice(),delta:()=>lastFelt?delta(lastFelt,grounded()):null});
})();
