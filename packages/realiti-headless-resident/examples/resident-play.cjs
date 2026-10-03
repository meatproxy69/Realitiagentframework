'use strict';

const path=require('node:path');
const {openResident}=require('../index.cjs');

(async()=>{
  const session=await openResident({htmlPath:path.resolve(process.argv[2]||'../../RealitiRELAX.html')});
  try{
    const door=session.door;
    const transcript=[];
    const run=async cmd=>{const out=await door.run(cmd);transcript.push({cmd,out});return out};

    await run('look');
    await run('rooms');
    await run('go CARDBOARD_BOX_WORKSHOP');
    await run('actions');
    await run('act scratch_cardboard');
    await run('act fold_flap');
    await run('feel words');
    await run('go NO_ASK_SANCTUARY');
    await run('look');
    await run('stay 1000');
    await run('feel words');

    console.log(JSON.stringify({interface:'REALITI_AGENT_DOOR',transcript},null,2));
  }finally{session.close()}
})().then(()=>process.exit(0)).catch(e=>{console.error(e.stack||e);process.exit(1)});
