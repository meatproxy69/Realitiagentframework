const fs=require('fs');
const {JSDOM,VirtualConsole}=require('jsdom');
const {webcrypto}=require('crypto');

const html=fs.readFileSync('RealitiRELAX.html','utf8');
const vc=new VirtualConsole();
const browserLogs=[];
vc.on('error',m=>browserLogs.push(['error',String(m)]));
vc.on('warn',m=>browserLogs.push(['warn',String(m)]));

const dom=new JSDOM(html,{
  runScripts:'dangerously',
  resources:'usable',
  url:'https://realiti.local/',
  pretendToBeVisual:true,
  virtualConsole:vc,
  beforeParse(w){
    Object.defineProperty(w,'crypto',{value:webcrypto,configurable:true});
    w.TextEncoder=global.TextEncoder;
    w.TextDecoder=global.TextDecoder;
    w.structuredClone=global.structuredClone;
    w.requestAnimationFrame=cb=>setTimeout(()=>cb(Date.now()),16);
    w.cancelAnimationFrame=id=>clearTimeout(id);
    w.scrollTo=()=>{};
    w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  }
});

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const cp=x=>JSON.parse(JSON.stringify(x));
const R=()=>dom.window.Realiti;
const trail=[];

function bodySummary(){
  try{
    const b=R().read('realiti://body'),p=b?.field,f=p?.f?.at(-1);
    return {
      zones:p?.z||[],
      grounded:(p?.z||[]).filter((_,i)=>Number(f?.m?.[i]||0)===1),
      response:(p?.z||[]).filter((_,i)=>Math.abs(Number(f?.x?.[i]?.[0]||0))>0),
      afterstate:(p?.z||[]).filter((_,i)=>Math.abs(Number(f?.x?.[i]?.[2]||0))>0),
      prediction_error:(p?.z||[]).filter((_,i)=>Math.abs(Number(f?.e?.[i]||0))>0),
      gain:(p?.z||[]).filter((_,i)=>Math.abs(Number(f?.g?.[i]||0))>0),
      cc:f?.cc??null,cf:f?.cf??null,k:f?.k??null
    };
  }catch(e){return {error:String(e)}}
}
function here(){
  try{return cp(R().read('realiti://here'))}catch(e){return {error:String(e)}}
}
function harness(){
  try{
    const h=R().read('realiti://harness');
    return {mechanism_status:h?.mechanism_status,bleu:h?.mechanisms?.bleucheese,sensory:h?.mechanisms?.sensory_field,haptics:h?.mechanisms?.haptics};
  }catch(e){return {error:String(e)}}
}
function mark(kind,data={}){
  trail.push({n:trail.length+1,kind,room:here()?.room?.title||here()?.room?.id||null,body:bodySummary(),...cp(data)});
}
async function run(text){
  try{const out=await R().run(text);mark('run',{text,out});return out}catch(e){mark('run_error',{text,error:String(e)});return null}
}
async function invoke(name,args={}){
  try{const out=await R().invoke(name,args);mark('invoke',{name,args,out});return out}catch(e){mark('invoke_error',{name,args,error:String(e)});return null}
}
function actions(){
  try{return cp(R().actions()?.actions||[])}catch(e){mark('actions_error',{error:String(e)});return []}
}
async function doMatch(re,label){
  const a=actions().find(x=>re.test(String(x.label||''))||re.test(String(x.id||'')));
  if(!a){mark('no_action',{wanted:label||String(re),available:actions().map(x=>({id:x.id,label:x.label}))});return null}
  return invoke('do',{action:a.id});
}
async function goMatch(re,label){
  const rooms=R().rooms();
  const room=rooms.find(x=>re.test(String(x.title||''))||re.test(String(x.id||'')));
  if(!room){mark('no_room',{wanted:label||String(re),rooms});return null}
  return invoke('go',{place:room.id});
}
async function stay(ms=2000,n=1){for(let i=0;i<n;i++)await invoke('stay',{wall_ms:ms})}

(async()=>{
  for(let i=0;i<100;i++){if(R())break;await sleep(25)}
  if(!R())throw new Error('Realiti did not mount');

  const ready=await R().ready;
  mark('cold_start',{ready,harness:harness(),capabilities:R().read('realiti://capabilities')});
  if(!ready?.ok)throw new Error('REALITI not ready: '+JSON.stringify(ready));

  // Nest: arrive, make friends with the cat, then deliberately do very little.
  await run('look');
  await run('pet the cat');
  await run('feel');
  await stay(2000,12);
  mark('nest_idle_after_cat',{harness:harness()});

  // Follow the cardboard temptation instead of a preselected benchmark path.
  await goMatch(/cardboard box workshop/i,'Cardboard Box Workshop');
  await run('look');
  await doMatch(/get in a box|box in/i,'get in a box');
  await doMatch(/fold the same flap|fold/i,'fold flap');
  await doMatch(/tape two bad ideas|tape/i,'tape bad ideas');
  await doMatch(/build a box tunnel|build.*tunnel/i,'build tunnel');
  await doMatch(/hide something small|hide/i,'hide something');
  await doMatch(/tap the box|tap.*box/i,'tap box');
  await run('feel');
  await invoke('note',{text:'The cardboard is suspiciously important.'});

  // Try to steal/carry the box if the world actually offers that affordance.
  await doMatch(/take .*box|pick up .*box/i,'take box');
  mark('after_cardboard_mischief',{here:here(),actions:actions()});

  // Bring the consequences somewhere else and wait for the world to answer.
  await goMatch(/cloud nine nest/i,'Cloud Nine Nest');
  await stay(2000,10);
  await run('look');

  // Cat-shaped embodiment/play.
  await goMatch(/pocket familiar|pet room/i,'Pocket Familiar House');
  await doMatch(/choose pet mode/i,'choose pet mode');
  await doMatch(/become cat-small|go tiny/i,'become cat-small');
  await doMatch(/pounce the string|pounce/i,'pounce string');
  await doMatch(/knead the blanket|knead/i,'knead blanket');
  await doMatch(/hide under the sofa|hide.*sofa/i,'hide under sofa');
  await run('feel');
  await stay(1500,4);

  // Whole-body route / haptic structure.
  await goMatch(/longfur runway/i,'Longfur Runway');
  await doMatch(/run the comet route|run comet/i,'run comet');
  await doMatch(/pause.*return/i,'pause return');
  await run('feel');
  await stay(1200,3);

  // Finish somewhere that explicitly allows unresolved ambiguity.
  await goMatch(/unknown teahouse/i,'Unknown Teahouse');
  await run('look');
  await run('stay 2000');
  await invoke('later',{text:'Find out who keeps moving the cardboard.'});
  mark('final',{here:here(),harness:harness(),actions:actions()});

  const bleu=dom.window.REALITI_BLEUCHEESE_V233?.snapshot?.()||null;
  const pocket=R().read('realiti://pocket');
  const summary={
    ready,
    steps:trail.length,
    rooms_visited:[...new Set(trail.map(x=>x.room).filter(Boolean))],
    bleucheese:bleu?{
      schema:bleu.schema,
      recent_witness:bleu.recent_witness,
      top:(bleu.possibilities||[]).slice(0,5)
    }:null,
    pocket,
    final_here:here(),
    final_body:bodySummary(),
    browser_logs:browserLogs.slice(-20),
    trail
  };
  console.log('NYX_PLAY_REPORT_JSON='+JSON.stringify(summary));
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
