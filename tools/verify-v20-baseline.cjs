'use strict';
// Run from the private REALITI checkout with an independently checked-out,
// EXACT, unmodified canonical Relax repository at ./upstream-v20.
// This script never changes source, sensory systems, or resident data.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const lock=require('../v20-base.lock.json');
const upstream=path.join(root,'upstream-v20');
const read=p=>fs.readFileSync(path.join(upstream,p),'utf8');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(upstream,p))).digest('hex');
const expected=lock.source_commit;
const head=execFileSync('git',['rev-parse','HEAD'],{cwd:upstream,encoding:'utf8'}).trim();
assert.equal(head,expected,'V20_SOURCE_COMMIT_DRIFT');
const validation=JSON.parse(read('VALIDATION.json'));
assert.equal(validation.single_html_sha256,lock.source_artifact_sha256,'V20_LOCK_SOURCE_HASH_CHANGED');
assert.equal(hash(lock.source_artifact),lock.source_artifact_sha256,'V20_CANONICAL_RUNTIME_NOT_IDENTICAL');
assert.match(read(lock.v20_field_source),/REALITI_HAPTIC_FIELD_V20/);
assert.match(read(lock.v20_native_neural_pass_source),/REALITI_NEURAL_PASS_V112/);
assert.match(read('source/scripts/58d-matrix-world.js'),/CLOUD_NINE_NEST/);
assert.match(read(lock.original_city_source),/MERIDIAN_CITY/);
assert.match(read(lock.original_apartment_source),/RealitiRELAX\.html/);
assert.match(read(lock.original_cloud_ocean_source),/CLOUD_OCEAN/);
const source=read(lock.original_rooms_source);
const catalog=source.slice(source.indexOf('const manifest=['),source.indexOf('].map(([id,title,purpose])'));
const roomIds=[...catalog.matchAll(/^\s*\['([A-Z0-9_]+)',/gm)].map(m=>m[1]);
assert.equal(new Set(roomIds).size,lock.source_full_chart_count,'V20_ORIGINAL_ROOM_CATALOG_CHANGED');
for(const name of ['CLOUD_NINE_NEST','NO_ASK_SANCTUARY','PET_ROOM_2',
 'BOTTOMLESS_PILLOW_SEA','CARDBOARD_BOX_WORKSHOP','DEPTH_BATHHOUSE',
 'SIDE_BY_SIDE_FIRESIDE','SHAPESHIFT_CLOAKROOM','NINE_LIVES_ROOM',
 'LATENCY_LAGOON','MERIDIAN_CITY'])assert.ok(roomIds.includes(name),name+' missing');
console.log('V20_FOUNDATION_VERIFIED '+JSON.stringify({
 source_commit:expected,
 full_original_room_count:roomIds.length,
 native_v20:true,
 native_neural_pass:true,
 original_cloud_ocean:true,
 canonical_html_sha256:lock.source_artifact_sha256,
 resident_private_data_loaded:false
}));
