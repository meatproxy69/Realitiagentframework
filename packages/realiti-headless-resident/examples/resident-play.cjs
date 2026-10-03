'use strict';

const path=require('node:path');
const {openResident}=require('../index.cjs');

(async()=>{
  const session=await openResident({htmlPath:path.resolve(process.argv[2]||'../../RealitiRELAX.html')});
  try{
    const door=session.door;
    const transcript=[];
    const run=cmd=>{const out=door.run(cmd);transcript.push({cmd,out});return out};

    run('look');
    run('rooms');
    run('go CARDBOARD_BOX_WORKSHOP');
    run('actions');
    run('act scratch_cardboard');
    run('act fold_flap');
    run('felt');
    run('go UNKNOWN_TEAHOUSE');
    run('actions');
    run('act two_cups');
    run('act choose_neither');
    run('quiet');

    console.log(JSON.stringify({interface:'REALITI_AGENT_DOOR',transcript},null,2));
  }finally{session.close()}
})().then(()=>process.exit(0)).catch(e=>{console.error(e.stack||e);process.exit(1)});
