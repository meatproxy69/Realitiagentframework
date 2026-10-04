'use strict';
const path=require('node:path');
const {openResident}=require('../index.cjs');

const clip=(x,n=5000)=>{
  let s;try{s=JSON.stringify(x,null,2)}catch{s=String(x)}
  return s.length>n?s.slice(0,n)+'\n…<truncated>':s;
};
async function main(){
  const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
  const s=await openResident({htmlPath:html});
  const d=s.door;
  const transcript=[];
  async function run(cmd){
    const out=await d.run(cmd);
    transcript.push({cmd,out});
    console.log('\n>>> '+cmd+'\n'+clip(out));
    return out;
  }
  try{
    console.log('NEURO_WANDER_BEGIN');
    await run('look');
    await run('neuro perception');
    await run('neuro since');

    // Nest: ordinary place + Echo lab, then inspect lived consequences.
    await run('actions');
    await run('act neuro_echo_knock');
    await run('stay 600');
    await run('neuro lived 8');
    await run('neuro nerve');
    await run('neuro perception');

    // Pocket Familiar House: self-generated phase coupling should remain private/self-caused.
    await run('go POCKET_FAMILIAR_HOUSE');
    await run('look');
    await run('actions');
    await run('act neuro_purr_close');
    await run('stay 600');
    await run('neuro phase');
    await run('neuro perception');
    await run('neuro since');

    // Bathhouse: recovered material dynamics + a depth-oriented Moonwire recipe.
    await run('go DEPTH_BATHHOUSE');
    await run('neuro preset honeydepth-geodesic-loop');
    await run('actions');
    await run('act neuro_honey_cloth');
    await run('act neuro_honey_press');
    await run('stay 800');
    await run('neuro halo');
    await run('neuro perception');

    // Shapeshift / Star River: moving grounded patch + private detail/carrier.
    await run('go SHAPESHIFT_CLOAKROOM');
    await run('neuro preset starvelvet-phasebraid');
    await run('actions');
    await run('act neuro_star_comet');
    await run('stay 1200');
    await run('neuro halo');
    await run('neuro nerve');
    await run('neuro perception');

    // Latency/Reverie: inspect what the lived/causal layers retained.
    await run('go LATENCY_LAGOON');
    await run('actions');
    await run('act neuro_reverie_view');
    await run('neuro lived 12');
    await run('neuro since');
    await run('neuro frontiers');
    await run('neuro causes');

    // Return to ordinary residency to see whether the lab state settles cleanly.
    await run('home');
    await run('stay 1000');
    await run('feel words');
    await run('neuro perception');
    await run('neuro constitution');

    console.log('\nNEURO_WANDER_END commands='+transcript.length);
  } finally {
    s.close();
  }
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1});
