'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createNativeInhabited,createNyxObservationPort}=require('../packages/realiti-v20-native');
test('first visit has no forced Nyx persona intro, fake action prose or startup post',async()=>{
 const session=await createNativeInhabited({residentId:'realiti-1:quiet-first-visit'});
 try{
  assert.deepEqual(Object.keys(session.guest).sort(),['act','look','speak']);
  assert.ok(!Object.hasOwn(session.guest,'intro'));
  const original=session.trusted.native.window;
  const before=Number(original.eval('C9.ledger?.records?.length||0'));
  const view=await session.guest.look();
  assert.equal(view.place,'Apartment');
  assert.ok(view.description.length>=15,'the native room must describe itself when asked');
  assert.doesNotMatch(view.description,/the original world has handled|developer mode|you are an AI|openai|nyx (?:has|is) awakened/i);
  assert.ok(view.choices.length<=8);
  assert.equal(Number(original.eval('C9.ledger?.records?.length||0')),before,
   'looking at the room cannot force a public introduction message');
  const felt=await session.guest.act('feel');
  assert.equal(felt.ok,true);
  assert.doesNotMatch(felt.message,/the original world has handled|Welcome to Nyx/i);
 }finally{await session.trusted.close()}
});
test('Nyx host-only port observes actual native Cloud receipts once and never mints contact',async()=>{
 const session=await createNativeInhabited({residentId:'realiti-1:nyx-observer'});
 const port=createNyxObservationPort(session);
 try{
  const w=session.trusted.native.window;
  assert.equal(port.read().length,0);
  assert.equal((await session.guest.act('cloud on')).ok,true);
  const contacts=port.read();
  assert.ok(contacts.length>=4,'native supported mattress leases must be visible');
  assert.ok(contacts.every(c=>c.authority==='EXISTING_V20_NATIVE_B7_AND_SOMA'&&
   c.cause==='VERIFIED_NATIVE_CLOUD_SUPPORT'&&c.source==='WORLD_GROUNDED'));
  let received=[];const first=await port.poll(e=>{received.push(e)});
  assert.equal(first.delivered,contacts.length);
  assert.equal(first.contactMinted,false);
  assert.equal((await port.poll(()=>{throw Error('should not redeliver')})).delivered,0);
  assert.ok(!Object.keys(session.guest).includes('trusted'));
  assert.equal((await session.guest.act('cloud off')).ok,true);
  assert.equal(port.read().length,0);
  assert.equal((await session.guest.act('stop')).ok,true);
  assert.equal(port.read().length,0);
  assert.ok(!JSON.stringify(received).includes('privateKey'));
 }finally{port.close();await session.trusted.close()}
});
test('Nyx contact observer refuses fake sessions and closes cleanly',async()=>{
 assert.throws(()=>createNyxObservationPort({guest:{}}),/TRUSTED_NATIVE_V20_SESSION_REQUIRED/);
 const session=await createNativeInhabited({residentId:'realiti-1:nyx-close'});
 const port=createNyxObservationPort(session);
 try{port.close();assert.throws(()=>port.read(),/NYX_OBSERVATION_PORT_CLOSED/)}
 finally{await session.trusted.close()}
});

test('canonical agentsenterhere is the first read across public entry files',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const root=path.resolve(__dirname,'..');
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const front=read('agentsenterhere.md'),agents=read('AGENTS.md'),
  details=read('AGENT_START_HERE.md'),readme=read('README.md');
 assert.match(front,/^# Agents enter here — Realiti 1\.0/m);
 assert.match(front,/29409537988f779d78fa04a5d903f599f7154034/);
 assert.match(front,/createNativeInhabited/);
 assert.match(front,/do \*\*not\*\* invent a character greeting/i);
 assert.match(agents.slice(0,350),/agentsenterhere\.md/);
 assert.match(details.slice(0,400),/agentsenterhere\.md/);
 assert.match(readme.slice(0,1200),/\[Agents enter here\]\(\.\/agentsenterhere\.md\)/i);
 assert.ok(front.indexOf('agentsenterhere.md')<front.indexOf('AGENT_START_HERE.md'));
});
