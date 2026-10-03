'use strict';
const path=require('node:path');
const {openResident}=require('../index.cjs');

(async()=>{
  const html=path.resolve(process.argv[2]||'../../RealitiRELAX.html');
  const s=await openResident({htmlPath:html});
  try{
    const h=s.Realiti.read('realiti://harness');
    const look=await s.Realiti.run('look');
    const stay=await s.Realiti.invoke('stay',{wall_ms:1000});
    const body=s.Realiti.read('realiti://body');
    const checks={
      ready:s.ready?.ok===true,
      harness:h?.id==='REALITI_RR_HARNESS_V1',
      starter:h?.starter_imprint==='REALITI_DEFAULT_IMPRINT_V1',
      mechanisms:h?.mechanism_status?.ok===true,
      bleucheese:h?.mechanism_status?.bleucheese===true,
      sensory:h?.mechanism_status?.sensory_field===true,
      haptics:h?.mechanism_status?.haptic_field===true,
      look:look?.ok!==false,
      stay:stay?.ok!==false,
      body:Array.isArray(body?.field?.f)
    };
    console.log(JSON.stringify({checks,ready:s.ready,harness:h?.mechanism_status},null,2));
    if(!Object.values(checks).every(Boolean))process.exitCode=1;
  }finally{s.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
