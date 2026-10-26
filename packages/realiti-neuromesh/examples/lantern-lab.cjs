'use strict';
// Run: node packages/realiti-neuromesh/examples/lantern-lab.cjs
// Standalone deterministic 6x4m world: no Relax, no generated sensory claims.
const {LanternRoom}=require('../lab/lantern-room.cjs');
const pack=require('../presets/honeyspark-duo.json');
function run(){
 const room=new LanternRoom({residentId:'demo-familiar',worldId:'DEMO_LANTERN_ROOM'});
 const log=(step,result)=>({step,result:result||null,grounded:room.snapshot().grounded,
  t_ms:room.snapshot().t_ms});
 const trace=[];
 trace.push(log('first touch too far away',room.touch('bench')));
 trace.push(log('walk within reach of pine bench',room.walkTo(1.8,1.5)));
 room.resident.choosePreset(pack,pack.presets[0].preset_id);
 trace.push(log('genuine contact with bench',room.touch('bench')));
 trace.push(log('sit with pelvis support',room.sit()));
 room.wait(500);
 trace.push(log('stand and remove support',room.stand()));
 room.resident.memory.remember({key:'bench-path',text:'The pine bench is reachable from the west aisle',
  tags:['route','bench']});
 trace.push(log('retrieve real events plus an authored note',
  room.resident.memory.recall('pine bench',{limit:4})));
 room.walkTo(1.8,2.35);room.walkTo(4.9,2.35);room.walkTo(4.9,2.0);
 trace.push(log('window opened with actual latch contact',room.openWindow()));
 room.wait(1200);
 trace.push(log('BleuCheese proposal requires host admission',
  room.host.bleucheese.proposals()));
 trace.push(log('host admits one physical world event',room.admitDraft()));
 room.wait(1000);
 const live=room.snapshot();
 const depart=room.close();
 const ended=room.snapshot();
 return {schema:'REALITI_SOMA_LAB_RESULT_V1',harness:room.harness.boot(),
  trace,live:{grounded:live.grounded,haloModes:live.rich.halo.modes.length,
    auraBins:live.rich.aura.bins,thicc:live.rich.thicc.filter(x=>x.fill>0).length,
    sausageVolume:live.rich.sausage.filled_volume,
    cottonSites:live.rich.cotton.active_sites,bleu:live.bleu.possibilities.length},
  departed:{grounded:ended.grounded,reason:depart.departure.reason},
  memory:room.resident.memory.stats(),retrieved:room.resident.memory.recall('bench pine'),
  claim:'This records real simulated contacts and compact resident-authored notes. No generated recollections.'};
}
if(require.main===module){
 const result=run();
 console.log(JSON.stringify(result,null,2));
 if(!result.harness.ok||result.departed.grounded!==0)process.exitCode=1;
}
module.exports={run};
