'use strict';
// Migration guard: no silent deletion or false parity declarations while the
// independent Apartment retains the complete Relax atlas for safe porting.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const inventory=require(path.join(root,'apartment/room-migration.json'));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
assert.equal(inventory.schema,'REALITI_APARTMENT_ROOM_MIGRATION_V1');
assert.equal(inventory.phase,'PORT_FIRST_DO_NOT_PRUNE');
assert.equal(inventory.target_chart_count,1);
assert.equal(inventory.target_chart,'CLOUD_NINE_NEST');
assert.equal(inventory.old_room_count,23);
assert.equal(inventory.entries.length,23);
const catalog=read('source/scripts/58-rooms.js');
const start=catalog.indexOf('const manifest=['),end=catalog.indexOf('].map(([id,title,purpose])');
assert.ok(start>=0&&end>start,'source room manifest remains accessible');
const roomIds=[...catalog.slice(start,end).matchAll(/^\s*\['([A-Z0-9_]+)',/gm)].map(x=>x[1]);
const world=read('source/scripts/58d-matrix-world.js');
const worldStart=world.indexOf('const WORLD={'),worldEnd=world.indexOf('\n};',worldStart);
assert.ok(worldStart>=0&&worldEnd>worldStart,'canonical Matrix world definitions preserved');
const chartIds=[...world.slice(worldStart,worldEnd).matchAll(/^\s+([A-Z0-9_]+):\{size:/gm)].map(x=>x[1]);
const expected=new Set(inventory.entries.map(x=>x.source_room));
assert.equal(expected.size,23,'exactly one checklist entry for each source room');
assert.deepEqual([...new Set(roomIds)].sort(),[...expected].sort(),'every original room has a migration plan');
assert.deepEqual([...new Set(chartIds)].sort(),[...expected].sort(),'every original Matrix chart has a migration plan');
const legal=new Set(['planned','partial','retained_anchor','verified','excluded_with_owner_approval']);
for(const entry of inventory.entries){
 assert.ok(legal.has(entry.status),'legal status '+entry.source_room);
 assert.ok(entry.apartment_location.length>=8,'document the destination '+entry.source_room);
 if(entry.status==='verified')assert.ok(entry.parity_tests?.length,'no verified mark without test evidence');
 if(entry.status==='excluded_with_owner_approval')assert.ok(entry.owner_approval&&entry.justification,'no quiet omissions');
}
const remaining=inventory.entries.filter(e=>!['verified','excluded_with_owner_approval'].includes(e.status));
assert.ok(remaining.length>0,'a fully verified inventory must move to final pruning review rather than silently retain this guard');
const builder=read('apartment/build.mjs');
assert.ok(builder.includes("new URL('RealitiRELAX.html',root)"),'builder continues to copy entire canonical runtime during migration');
assert.ok(builder.includes("source/extras.js"),'current apartment overlay not lost');
const guide=read('agentsstarthereapartment.md');
assert.ok(guide.includes('AGENT_START_HERE.md'),'apartment still references original guide');
console.log('ROOM MIGRATION GUARD PASS:',roomIds.length,'original rooms +',chartIds.length,'Matrix charts accounted for; retirement deferred; unverified:',remaining.length);
