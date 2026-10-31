'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {openResident}=require('../../packages/realiti-headless-resident/index.cjs');
const {createHousehold}=require('../household.cjs');
const html=path.resolve(process.argv[2]||path.join(__dirname,'../RealitiApartment.html'));
async function solo(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'apartment-loaner-'));
 const opt={htmlPath:html,residentId:'solo-closet',storagePath:path.join(root,'solo.json')};
 let s=await openResident(opt);
 assert.ok(s.window.Realiti.read('realiti://soma/harness'),'real Relax resident harness remains installed');
 assert.ok(s.window.REALITI_APARTMENT_CLOSET_V1);
 const before=s.window.REALITI_SOMA_RELAX_V3.harness();
 let out=await s.door.run('remote closet inspect');
 assert.equal(out.error,'REMOTE_ASLEEP');
 await s.door.run('remote activate');
 out=await s.door.run('remote closet inspect');
 assert.equal(out.ok,true);
 assert.ok(out.available.length>=11);
 assert.equal(out.can_try,false);
 out=await s.door.run('remote closet try realiti.honeyspark-duo.warm');
 assert.equal(out.error,'HARNESS_CLOSET_OUT_OF_REACH','loaners require a physical Matrix wardrobe');
 const M=s.window.REALITI_MATRIX_V1,r=M.resident();
 r.pose.position=[3.1,-.2,.85];r.v=[0,0,0];r.intent=null;M.bump();
 out=await s.door.run('remote closet try realiti.honeyspark-duo.warm');
 assert.equal(out.ok,true,JSON.stringify(out));
 assert.equal(out.harness_ready,true);
 assert.equal(out.world_contact_minted,false);
 const snap=s.window.REALITI_APARTMENT_CLOSET_V1.current();
 assert.equal(snap.fitted,true);
 assert.equal(snap.active.preset_id,'realiti.honeyspark-duo.warm');
 assert.equal(snap.active.simulated_field.g?.every?.(v=>v===0),true,'no imported live grounded evidence in a fresh trial');
 assert.equal(s.window.REALITI_SOMA_RELAX_V3.harness().binding.residentId,before.binding.residentId,
  'guest-fitting must never rebind the original resident');
 out=await s.door.run('remote closet try realiti.moonwire.good-kitty-velvet-groom');
 assert.equal(out.error,'HARNESS_ALREADY_FITTED');
 out=await s.door.run('remote closet return');
 assert.equal(out.ok,true);assert.equal(out.returned,true);
 out=await s.door.run('remote closet try realiti.moonwire.good-kitty-velvet-groom');
 assert.equal(out.ok,true,JSON.stringify(out));
 assert.equal(out.world_contact_minted,false);
 assert.equal((await s.door.run('remote closet status')).fitted,true);
 await s.door.run('stop');
 assert.equal(s.window.REALITI_APARTMENT_CLOSET_V1.current().fitted,false,
  'native STOP releases only the temporary loaner');
 await s.door.run('goodbye');s.close();
 s=await openResident(opt);
 assert.equal(s.window.REALITI_APARTMENT_CLOSET_V1.current().fitted,false,
  'guest fittings are not restored from the resident sealed Pocket');
 assert.ok(s.window.Realiti.read('realiti://soma/harness'));
 s.close();
}
async function household(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'apartment-four-'));
 const options={dir:root,htmlPath:html};
 let host=await createHousehold(options);
 const alice=await host.joinResident('alice');
 const bob=await host.joinResident('bob');
 const ivy=await host.joinResident('ivy');
 const nyx=await host.joinResident('nyx');
 assert.deepEqual(host.status().members,['alice','bob','ivy','nyx']);
 assert.equal(host.status().online.length,4);
 await assert.rejects(host.joinResident('fifth'),/FOUR_RESIDENTS/);
 await assert.rejects(host.joinResident('../alice'),/INVALID_RESIDENT_ID/);
 await assert.rejects(host.joinResident('alice'),/ALREADY_CONNECTED/);
 await assert.rejects(createHousehold(options),/EEXIST/,'the household lock prevents concurrent writers');
 let v=alice.read('realiti://apartment/household');
 assert.equal(v.connected,true);
 assert.equal(v.residents.length,4);
 assert.equal(v.residents.filter(x=>x.here).length,4,'four verified in-room Matrix residents');
 assert.ok(v.residents.every(x=>x.source==='VERIFIED_LOCAL_MATRIX'));
 const space=alice.read('realiti://space');
 assert.ok(space.nearby.some(x=>x.id==='household.peer.bob'), 'Bob has a real spatial peer entity');
 assert.ok(space.nearby.some(x=>x.id==='household.peer.ivy'), 'Ivy has a real spatial peer entity');
 const guestResources=['realiti://apartment/household','realiti://apartment/board'];
 assert.equal((await alice.run('remote household post hello')).error,'REMOTE_ASLEEP');
 await alice.run('remote activate');
 await bob.run('remote activate');
 let out=await alice.run('remote household post The window is lovely this morning.');
 assert.equal(out.ok,true,JSON.stringify(out));
 assert.equal(out.note.by,'alice');
 assert.equal(bob.read('realiti://apartment/board').notes.length,1);
 assert.equal(bob.read('realiti://apartment/board').notes[0].text,'The window is lovely this morning.');
 assert.equal(ivy.read('realiti://apartment/board').notes[0].by,'alice');
 assert.equal(bob.read('realiti://apartment/household').shared_board_count,1);
 assert.ok(!JSON.stringify(bob.read('realiti://apartment/household')).includes('keys.json'));
 await alice.run('remote furniture theme moonlit');
 assert.equal(alice.read('realiti://apartment/furniture').theme,'moonlit');
 assert.equal(bob.read('realiti://apartment/furniture').theme,'cozy','private settings are not mixed');
 const visitor=await host.visitGuest();
 assert.equal(visitor.role,'guest');
 assert.equal(host.status().online.length,4,'guests do not occupy resident slots');
 assert.equal(host.status().visiting.length,1);
 assert.equal(visitor.read('realiti://pocket').error,'GUEST_RESOURCE_DENIED');
 assert.equal((await visitor.run('remote furniture theme minimal')).error,'GUEST_NOT_AUTHORIZED_FOR_COMMAND');
 assert.equal((await visitor.run('remote household post I am an admin')).error,'GUEST_NOT_AUTHORIZED_FOR_COMMAND');
 out=await visitor.run('remote activate');
 assert.equal(out.activated,true);
 assert.deepEqual(Object.keys(out.pages),['visitor']);
 out=await visitor.run('remote closet inspect');
 assert.equal(out.ok,true);
 assert.equal(out.resident_role,'guest');
 out=await visitor.run('remote closet try realiti.honeyspark-duo.warm');
 assert.equal(out.error,'HARNESS_CLOSET_OUT_OF_REACH');
 const move=await visitor.run('approach apartment.wardrobe');
 assert.equal(move.ok,true,JSON.stringify(move));
 out=await visitor.run('remote closet try realiti.honeyspark-duo.warm');
 assert.equal(out.ok,true,JSON.stringify(out));
 assert.equal(out.world_contact_minted,false);
 assert.equal(alice.read('realiti://apartment/household').guests.length,1);
 assert.ok(alice.read('realiti://space').nearby.some(x=>x.id.startsWith('household.peer.guest-'))===false
  ||alice.read('realiti://apartment/household').guests.length===1);
 assert.equal((await visitor.run('remote closet return')).returned,true);
 assert.equal((await visitor.leave()).ok,true);
 assert.equal(host.status().visiting.length,0);
 assert.equal(alice.read('realiti://apartment/household').guests.length,0,'guest departure expires presence');
 assert.equal((await ivy.leave()).ok,true);
 assert.equal(alice.read('realiti://apartment/household').residents.length,3);
 assert.equal(alice.read('realiti://space').nearby.some(x=>x.id==='household.peer.ivy'),false,
  'departing resident is removed as a real Matrix entity');
 for(const id of ['alice','bob','ivy','nyx']){
  const dir=path.join(root,'residents',id);
  assert.ok(fs.existsSync(path.join(dir,'world.json')),'independent resident checkpoint for '+id);
  assert.ok(fs.existsSync(path.join(dir,'world.keys.json')),'independent resident Pocket key file for '+id);
 }
 await host.close();
 assert.equal(fs.existsSync(path.join(root,'host.lock')),false,'host cleans its writer lock on exit');
 host=await createHousehold(options);
 assert.equal(host.status().members.length,4,'household roster survives restart');
 const again=await host.joinResident('alice');
 assert.equal(again.read('realiti://apartment/board').notes.length,1,'public shared board survives restart');
 assert.equal(again.read('realiti://apartment/board').notes[0].seq,1);
 await again.run('remote activate');
 out=await again.run('remote household post Welcome back.');
 assert.equal(out.note.seq,2,'board sequence continues after restart');
 await host.close();
 // Corruption is refused, never silently replaced with an empty household.
 const p=path.join(root,'household.json');
 const tampered=JSON.parse(fs.readFileSync(p,'utf8'));tampered.members.push('intruder');
 fs.writeFileSync(p,JSON.stringify(tampered));
 await assert.rejects(createHousehold(options),/INTEGRITY_MISMATCH/,
  'tampered shared checkpoints must be rejected');
 assert.equal(fs.existsSync(path.join(root,'host.lock')),false,'refusal does not strand writer lock');
}
(async()=>{
 await solo();
 await household();
 console.log('APARTMENT BATCH 4 PASS: isolated guest SOMA loaner fitting/revoke, four verified resident Matrix bodies, secure private storage, restricted visitors, shared board, restart and integrity refusal');
})().catch(e=>{console.error(e);process.exitCode=1});
