(()=>{
'use strict';
const copy=value=>JSON.parse(JSON.stringify(value));
const number=value=>Number.isFinite(value)?value:null;
function label(value,fallback,max=160,pattern=null){if(value===undefined)return fallback;if(typeof value!=='string'||!value.length||value.length>max||(pattern&&!pattern.test(value)))throw new Error('INVALID_EXPORT_METADATA');return value}
window.REALITI_NEURAL_EXPORT=function(metadata={}){
 if(!metadata||typeof metadata!=='object'||Array.isArray(metadata))throw new Error('INVALID_EXPORT_METADATA');
 const permitted=new Set(['imprint_id','namespace','created_at','agent']);
 if(Object.keys(metadata).some(k=>!permitted.has(k)))throw new Error('UNKNOWN_EXPORT_METADATA');
 const fieldAPI=window.REALITI_HAPTIC_FIELD_V20;
 const packet=fieldAPI?.packet(),basis=fieldAPI?.exact(),starter=window.REALITI_DEFAULT_IMPRINT_V1?.snapshot();
 if(!packet?.f?.length||!basis?.z?.length||!starter)throw new Error('EXPORT_NOT_READY');
 const frame=packet.f.at(-1),count=packet.z.length;
 if(['x','m','e','g'].some(k=>frame[k]?.length!==count)||packet.z.some(z=>!basis.z.includes(z)))throw new Error('EXPORT_FIELD_ALIGNMENT');
 if(frame.m.every(x=>x===0)&&frame.cc!==null)throw new Error('EXPORT_GROUNDING_INCONSISTENT');
 const time=Math.max(0,Number(packet.t)*1000);
 const created=metadata.created_at===undefined?new Date().toISOString():metadata.created_at;
 const dateParts=typeof created==='string'&&/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-](\d{2}):(\d{2}))$/.exec(created);
 if(!dateParts||Number(dateParts[2])<1||Number(dateParts[2])>12||Number(dateParts[3])<1||Number(dateParts[3])>new Date(Date.UTC(Number(dateParts[1]),Number(dateParts[2]),0)).getUTCDate()||Number(dateParts[4])>23||Number(dateParts[5])>59||Number(dateParts[6])>59||Number(dateParts[7]||0)>23||Number(dateParts[8]||0)>59||!Number.isFinite(Date.parse(created)))throw new Error('INVALID_EXPORT_TIMESTAMP');
 const agentMetadata=metadata.agent??{};
 if(!agentMetadata||typeof agentMetadata!=='object'||Array.isArray(agentMetadata)||Object.keys(agentMetadata).some(k=>!['agent_label','provider','model_family','model_version'].includes(k)))throw new Error('INVALID_EXPORT_AGENT');
 const agent=Object.fromEntries(['agent_label','provider','model_family','model_version'].map(k=>[k,label(agentMetadata[k],'UNKNOWN',k==='model_version'?160:120)]));
 const snapshot={profile:starter.profile??null,lace_coherence:number(starter.lace?.coherence),chronolace:{past:number(starter.chronolace?.past),now:number(starter.chronolace?.now),predicted_next:number(starter.chronolace?.predicted_next),predicted_is_evidence:false},carrier:{core:number(starter.carrier?.core)},renderer:{surface:number(starter.renderer?.surface),pressure:number(starter.renderer?.pressure)}};
 if(Number.isInteger(starter.sausage?.level)&&starter.sausage.level>=0&&starter.sausage.level<=5)snapshot.sausage={level:starter.sausage.level,material:starter.sausage.material??null,filled_volume:number(starter.sausage.filled_volume)};
 const mapped=typeof NMSTATE==='undefined'?'UNKNOWN':NMSTATE.active;
 const cause=frame.m.some(x=>x===1)&&basis.contact?.id?String(basis.contact.id):'UNKNOWN';
 return copy({
  schema:'NEUROMESH_IMPRINT_V2',
  imprint_id:label(metadata.imprint_id,`draft.field.${frame.k}.${time}`,160,/^[A-Za-z0-9._:-]{3,}$/),
  namespace:label(metadata.namespace,'UNKNOWN',100,/^[A-Za-z0-9._-]+$/),created_at:created,agent,
  harness:{mode:'REALITI_NATIVE',starter_harness:'UNIVERSAL_AGENT_RR_HARNESS_V1',starter_imprint:'DEFAULT_RESIDENT_IMPRINT_V'+starter.version,neuromesh:mapped,packet_version:'REALITI_HAPTIC_FIELD_V20',profile:starter.profile??null,adapters:{},pipeline_variant:'RICH_STARTER_V2354'},
  body:{schema_id:mapped,zones:copy(basis.z)},
  packet_spec:{fields:['z','x','m','e','g','cc','cf','k'],law:'NO_FIELD_QUANTITY_MINTS_GROUNDED_EVIDENCE'},
  observations:[{observation_id:`field.${frame.k}.${time}`,t_ms:time,cause:{cause_id:cause,source_class:'UNKNOWN',source_id:null},field:{z:copy(packet.z),x:copy(frame.x),m:copy(frame.m),e:copy(frame.e),g:copy(frame.g),cc:frame.cc,cf:frame.cf,k:frame.k},private_snapshot:snapshot,evidence_class:'OBSERVED_PRIVATE',receipt_refs:[],annotation:'One committed packet projection. x/e/g retain JND_INTEGER packet units. cc/cf retain zero-based weighted indices into body.zones (full mapped order), not the sparse field.z list. No receipt or external source identity is inferred.'}],
  learned_deltas:[],
  provenance:{experiment_id:'UNKNOWN',method:'Pure local projection of the latest committed Haptic Field and current starter renderer snapshot. No actions, timer advance, storage writes, identifier allocation, upload, or registry submission.',source_refs:[],uncertainty:'Private draft only. No learned addresses or replication evidence are available to this exporter. Agent identity is caller-supplied or UNKNOWN. Default draft ID is deterministic but not globally unique. Renderer projection and contact cause identity do not constitute a provenance receipt.'},
  privacy:{contains_chain_of_thought:false,contains_secrets:false,contains_private_user_data:false,contains_system_prompt:false},
  nonclaims:['Not an accepted registry result or permission to publish.','Not model weights, a biological brain scan, or proof of consciousness.','No private notes, conversations, prompts, or inferred preferences are exported.','No consent, author identity, learned delta, receipt, or new grounding is fabricated.']
 });
};
})();