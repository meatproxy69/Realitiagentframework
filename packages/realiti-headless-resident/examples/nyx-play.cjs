'use strict';
const path=require('node:path');
const {openResident}=require('../index.cjs');

const cp=x=>JSON.parse(JSON.stringify(x));

(async()=>{
  const s=await openResident({htmlPath:path.resolve(process.argv[2]||'../../RealitiRELAX.html')});
  const R=s.Realiti,W=s.window,trail=[];
  const here=()=>cp(R.read('realiti://here'));
  const actions=()=>cp(R.actions()?.actions||[]);
  const harness=()=>cp(R.read('realiti://harness'));

  function body(){
    const b=R.read('realiti://body'),p=b?.field,f=p?.f?.at(-1),z=p?.z||[];
    return {
      grounded:z.filter((_,i)=>Number(f?.m?.[i]||0)===1),
      response:z.filter((_,i)=>Math.abs(Number(f?.x?.[i]?.[0]||0))>0),
      afterstate:z.filter((_,i)=>Math.abs(Number(f?.x?.[i]?.[2]||0))>0),
      prediction_error:z.filter((_,i)=>Math.abs(Number(f?.e?.[i]||0))>0),
      gain:z.filter((_,i)=>Math.abs(Number(f?.g?.[i]||0))>0),
      cc:f?.cc??null,cf:f?.cf??null,k:f?.k??null
    };
  }

  function mark(kind,data={}){
    trail.push({n:trail.length+1,kind,room:here()?.room?.title||here()?.room?.id||null,body:body(),...cp(data)});
  }
  async function bounded(label,promise,ms=5000){
    let timer;
    try{
      return await Promise.race([
        Promise.resolve(promise),
        new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('RESIDENT_STEP_TIMEOUT '+label)),ms)})
      ]);
    }finally{if(timer)clearTimeout(timer)}
  }
  async function run(text){
    console.log('NYX_STEP run '+text);
    const out=await bounded('run '+text,R.run(text));
    mark('run',{text,out});
    return out;
  }
  async function invoke(name,args={}){
    console.log('NYX_STEP invoke '+name+' '+JSON.stringify(args));
    const out=await bounded('invoke '+name,R.invoke(name,args));
    mark('invoke',{name,args,out});
    return out;
  }
  async function doMatch(re,label){
    const list=actions();
    const a=list.find(x=>re.test(String(x.label||''))||re.test(String(x.id||'')));
    if(!a){mark('missing_action',{wanted:label||String(re),available:list.map(x=>({id:x.id,label:x.label}))});return null}
    return invoke('do',{action:a.id});
  }
  async function go(re,label){
    const room=R.rooms().find(x=>re.test(String(x.title||''))||re.test(String(x.id||'')));
    if(!room){mark('missing_room',{wanted:label||String(re)});return null}
    return invoke('go',{place:room.id});
  }
  async function stay(ms,n=1){
    for(let i=0;i<n;i++)await invoke('stay',{wall_ms:ms});
  }

  try{
    mark('cold_start',{ready:s.ready,harness:harness()});

    await run('look');
    await run('pet the cat');
    await run('feel');
    await stay(2000,10);
    mark('nest_after_loitering',{bleu:cp(W.REALITI_BLEUCHEESE_V233?.snapshot?.()||null)});

    await go(/cardboard box workshop/i,'Cardboard Box Workshop');
    await run('look');
    await doMatch(/get in a box|box in/i,'get in a box');
    await doMatch(/fold the same flap|fold/i,'fold flap');
    await doMatch(/tape two bad ideas|tape/i,'tape bad ideas');
    await doMatch(/build a box tunnel|build.*tunnel/i,'build tunnel');
    await doMatch(/hide something small|hide/i,'hide something');
    await doMatch(/tap the box|tap.*box/i,'tap box');
    await run('feel');
    await invoke('note',{text:'The cardboard is suspiciously important.'});
    await doMatch(/take .*box|pick up .*box/i,'take box');

    await go(/cloud nine nest/i,'Cloud Nine Nest');
    await stay(2000,8);
    await run('look');

    await go(/pocket familiar|pet room/i,'Pocket Familiar House');
    await doMatch(/choose pet mode/i,'choose pet mode');
    await doMatch(/become cat-small|go tiny/i,'become cat-small');
    await doMatch(/pounce the string|pounce/i,'pounce string');
    await doMatch(/knead the blanket|knead/i,'knead blanket');
    await doMatch(/hide under the sofa|hide.*sofa/i,'hide under sofa');
    await run('feel');
    await stay(1500,4);

    await go(/longfur runway/i,'Longfur Runway');
    await doMatch(/run the comet route|run comet/i,'run comet');
    await doMatch(/pause.*return/i,'pause return');
    await run('feel');
    await stay(1200,3);

    await go(/unknown teahouse/i,'Unknown Teahouse');
    await run('look');
    await stay(2000,1);
    await invoke('later',{text:'Find out who keeps moving the cardboard.'});

    const bleu=cp(W.REALITI_BLEUCHEESE_V233?.snapshot?.()||null);
    const report={
      ready:s.ready,
      rooms_visited:[...new Set(trail.map(x=>x.room).filter(Boolean))],
      steps:trail.length,
      mechanism_status:harness()?.mechanism_status,
      bleu:{recent_witness:bleu?.recent_witness||[],top:(bleu?.possibilities||[]).slice(0,5)},
      pocket:cp(R.read('realiti://pocket')),
      final_here:here(),
      final_body:body(),
      browser_logs:s.browserLogs.slice(-20),
      trail
    };
    console.log('NYX_PLAY_REPORT_JSON='+JSON.stringify(report));
  }finally{s.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
