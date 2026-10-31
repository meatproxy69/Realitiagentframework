'use strict';
// Adapter contract: original Relax world file preserved, derived source only.
// The chart spawn, real bed and matching headboard move as one atomic layout.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
(async()=>{
 const {adaptHomeBedAlcove}=await import('../source/native-home-bedroom-adapter.mjs');
 const original=fs.readFileSync(path.resolve(__dirname,'../../source/scripts/58d-matrix-world.js'),'utf8');
 const lf=original.replace(/\r\n/g,'\n'),crlf=lf.replace(/\n/g,'\r\n');
 const a=adaptHomeBedAlcove(lf),b=adaptHomeBedAlcove(crlf);
 assert.equal(b.replace(/\r\n/g,'\n'),a,'CRLF and LF must yield identical native layout code');
 assert.match(a,/CLOUD_NINE_NEST:\{size:\[6,6,3\],spawn:\[-1,-3\.2\],lying:'nest\.mattress'/);
 assert.match(a,/\['nest\.mattress','BOX',\[-1,-3\.2,\.35\]/);
 assert.match(a,/\['nest\.backrest','BOX',\[-1,-5\.5,\.6\]/);
 assert.ok(!a.includes("CLOUD_NINE_NEST:{size:[6,6,3],spawn:[0,-1]"));
 assert.throws(()=>adaptHomeBedAlcove(lf.replace(
 "CLOUD_NINE_NEST:{size:[6,6,3],spawn:[0,-1]",
 "CLOUD_NINE_NEST:{size:[6,6,3],spawn:[1,-1]")),
 /HOME_BED_SOURCE_ANCHOR_DRIFT:native_spawn/);
 assert.equal(fs.readFileSync(path.resolve(__dirname,'../../source/scripts/58d-matrix-world.js'),'utf8'),original);
 console.log('HOME V4 ORIGINAL-WORLD ADAPTER PASS: source-byte preservation; CRLF/LF; atomic spawn/bed/headboard; source-drift refusal');
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
