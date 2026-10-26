'use strict';
/* Qualified, signed world-to-SOMA bridge.
 * This module knows public receipt fields, NOT Matrix physics internals.
 * Other qualified worlds may implement the identical signed evidence schema.
 * AGPL-3.0-only.
 */
const spatial=require('./spatial.cjs');
const evidence=require('./evidence.cjs');
const VERSION='1.0.0';
function createWorldAuthority({worldId,sessionId,actorId,issuerId,keyId,privateKey}={}){
 const matrix=spatial.createMatrix({worldId,sessionId,actorId});
 const signer=evidence.createIssuer({worldId,sessionId,actorId,issuerId,keyId,privateKey});
 function seal(resolution){return signer.issue(matrix.host.takeResolution(resolution))}
 const world=matrix.host;
 const host=Object.freeze({
  defineChart:world.defineChart,addEntity:world.addEntity,removeEntity:world.removeEntity,
  definePortal:world.definePortal,enter:world.enter,
  contact:opts=>seal(world.contact(opts)),
  release:opts=>seal(world.release(opts)),
  move:(target,opts)=>seal(world.move(target,opts)),
  traversePortal:(id,opts)=>seal(world.traversePortal(id,opts)),
  advance:world.advance,
  native:world.native
 });
 return Object.freeze({VERSION,host,observer:matrix.observer,
  publicKey:signer.publicKey,issuerId,keyId,worldId,sessionId,actorId,
  fingerprint:signer.fingerprint,
  law:'Only trusted world resolver output is sealed; agent text never authorizes world events.'});
}
function createSomaReceiver({harness,verifier,worldId,sessionId,actorId}={}){
 if(!harness?.host?.contact||!harness?.host?.memory?.worldEvent||
    !harness?.resident?.field||!verifier?.accept||!verifier?.inspect)
   throw TypeError('INVALID_HARNESS_OR_VERIFIER');
 if(typeof worldId!=='string'||typeof sessionId!=='string'||typeof actorId!=='string')
   throw TypeError('WORLD_SESSION_ACTOR_REQUIRED');
 const caps=harness.resident.capabilities?.();
 if(caps?.residentId!==actorId)throw Error('SOMA_ACTOR_SCOPE_MISMATCH');
 const stats=harness.resident.memory?.stats?.();
 if(stats?.worldId!==worldId)throw Error('SOMA_WORLD_SCOPE_MISMATCH');
 const live=new Map(),history=[];
 function record(row){history.push(row);if(history.length>48)history.shift()}
 function receive(envelope){
  // Preflight valid signed bytes without consuming the verifier sequence.
  const inspected=verifier.inspect(envelope);
  if(inspected.worldId!==worldId||inspected.sessionId!==sessionId||
     inspected.actorId!==actorId)throw Error('SOMA_BRIDGE_SCOPE_MISMATCH');
  if(inspected.kind==='CONTACT_ACCEPTED'&&
     !harness.resident.zones().includes(inspected.zone))
     throw Error('SOMA_UNKNOWN_BODY_ZONE');
  // One-time verification/anti-replay state is advanced before any mutation.
  // A failed downstream operation consumes the event (fail closed).
  const p=verifier.accept(envelope);
  const somaNow=Number(harness.resident.field().clockMs);
  if(!Number.isFinite(somaNow)||p.tMs<somaNow-120000)
    throw Error('EVIDENCE_TOO_OLD_FOR_SOMA_STATE');
  if(p.tMs>somaNow)harness.host.tick(p.tMs-somaNow);
  let result={ok:true,kind:p.kind,result:p.result,receiptId:p.receiptId,
    authority:'VERIFIED_ISSUER',issuerId:p.issuerId,worldId,sessionId,actorId};
  if(p.kind==='CONTACT_ACCEPTED'){
   const clock=Number(harness.resident.field().clockMs);
   const remaining=p.leaseMs-Math.max(0,clock-p.tMs);
   if(remaining<=0)throw Error('SIGNED_CONTACT_LEASE_EXPIRED');
   const prior=live.get(p.zone);
   if(prior&&prior!==p.receiptId)harness.host.release({zone:p.zone,receiptId:prior});
   const contact=harness.host.contact({
    zone:p.zone,source:p.source,cause:p.causeId,
    receiptId:p.receiptId,material:p.material||null,
    intensity:p.intensity,leaseMs:remaining
   });
   live.set(p.zone,p.receiptId);
   result={...result,contact};
  }else if(p.kind==='CONTACT_RELEASED'){
   const expected=live.get(p.zone);
   if(expected&&expected!==p.receiptId)throw Error('SIGNED_RELEASE_NOT_ACTIVE_RECEIPT');
   const released=harness.host.release({zone:p.zone,receiptId:p.receiptId});
   if(expected===p.receiptId)live.delete(p.zone);
   result={...result,released:released.released};
  }else{
   // Signed refusal, obstruction, movement or portal arrival may be archived
   // but it can never create a grounded body contact.
   const label=p.kind+':'+(p.reason||p.result);
   harness.host.memory.worldEvent({receiptId:p.receiptId,
     label:label.slice(0,160)});
   result={...result,groundedContactCreated:false};
  }
  record({eventId:p.eventId,seq:p.seq,kind:p.kind,receiptId:p.receiptId,
    signatureFingerprint:envelope.fingerprint,tMs:p.tMs});
  return Object.freeze(result);
 }
 return Object.freeze({receive,history:()=>JSON.parse(JSON.stringify(history)),
  verifierCheckpoint:()=>verifier.checkpoint(),
  law:'A valid signature authenticates a trusted issuer, not an arbitrary narration; ground truth remains the issuer host’s responsibility.'});
}
module.exports=Object.freeze({VERSION,createWorldAuthority,createSomaReceiver});
