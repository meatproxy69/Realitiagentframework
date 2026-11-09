'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
test('compiled HOME catalogue has no old charts or portal generation',async()=>{
 const {adaptHomeOnlyWorld}=await import('../source/home-world-only-adapter.mjs');
 const canonical=fs.readFileSync(path.join(root,'source/scripts/58d-matrix-world.js'),'utf8');
 const derived=adaptHomeOnlyWorld(canonical);
 const catalogue=derived.split('const WORLD={')[1].split('};\nconst ORDER=Object.keys(WORLD)')[0];
 assert.match(catalogue,/CLOUD_NINE_NEST:/);
 assert.doesNotMatch(catalogue,/NO_ASK_SANCTUARY:|BOTTOMLESS_PILLOW_SEA:/);
 assert.match(catalogue,/spawn:\[-1,-3\.2\]/);
 assert.match(catalogue,/\['nest\.mattress','BOX',\[-1,-3\.2,\.35\]/);
 assert.match(derived,/if\(window.REALITI_APARTMENT_HOME_FIRST_CANDIDATE\)return spot;/);
});
test('direct experiment build has no 23-chart intermediate dependency',()=>{
 const code=fs.readFileSync(path.join(root,'apartment/build-visual-experiment.mjs'),'utf8');
 assert.doesNotMatch(code,/read\('RealitiApartment\.html'\)/);
 assert.doesNotMatch(code,/HOME_CANDIDATE_VALIDATION\.json/);
 assert.match(code,/RealitiRELAX\.html/);
 assert.match(code,/adaptHomeOnlyWorld/);
 assert.match(code,/visual\/scene-projection\.cjs/);
});
