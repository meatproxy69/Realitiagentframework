'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {run}=require('../examples/agent-spatial-contact.cjs');

test('setup guide: spatial rejection, signed touch, replay rejection and release',()=>{
 const r=run();
 assert.equal(r.schema,'REALITI_AGENT_SPATIAL_CONTACT_GUIDE_V1');
 assert.equal(r.refused.outOfReach,'OUT_OF_REACH');
 assert.equal(r.refused.occluded,'OCCLUDED');
 assert.equal(r.accepted.kind,'CONTACT_ACCEPTED');
 assert.equal(r.accepted.chart,'KITCHEN');
 assert.equal(r.accepted.groundedDuringTouch,1);
 assert.equal(r.soma.haloModes,7);
 assert.equal(r.soma.auraBins,128);
 assert.equal(r.soma.groundedAfterRelease,0);
 assert.equal(r.soma.lingering,true);
 assert.equal(r.verifier.acceptedEvents,4);
 assert.equal(r.verifier.checkpointSchema,'REALITI_EVIDENCE_VERIFIER_CHECKPOINT_V1');
});
