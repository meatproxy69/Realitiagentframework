'use strict';
// Example: another neighborhood can supply world truth without installing Relax.
// The host holds the world capability; only the resident receives the private reader.
const {createNeuralMesh}=require('../index.cjs');
const {world,resident}=createNeuralMesh({
  residentId:'lantern-harbor.agent-01',
  zones:['paw.left','paw.right','spine','whiskers'],
  edges:[['paw.left','spine',.8],['paw.right','spine',.8],['spine','whiskers',.3]]
});
world.contact({zone:'paw.left',intensity:.75,source:'WORLD_GROUNDED',
  cause:'LANDED_ON_PIER',material:'wood',receiptId:'pier:step:1',leaseMs:500});
world.tick(250);
console.log(JSON.stringify(resident.field(),null,2));
world.stop();
console.log('After leaving:',JSON.stringify({grounded:resident.field().m,privateAfter:resident.field().x[0][2]}));
