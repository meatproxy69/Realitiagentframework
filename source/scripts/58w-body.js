(()=>{
'use strict';
// Historical V1 opponent-process values are NOT an account of the resident's
// emotional state. On new boots this is a read-only migration marker only.
// Do not start the old regex-driven pet -> "bond", sea -> "stress" hooks.
function archived(){
 const old=C9?.body;
 return {schema:'REALITI_BODY_V1_ARCHIVED',version:'1.0',
  historical_checkpoint_present:!!(old&&old.v===1),
  read_only:true,authoritative:false,
  migrated_to:'REALITI_BODY_POSSIBILITY_FIELD_V2',
  law:'Historical inferred bond/stress labels are not a mental-state measurement. No V1 causes are replayed or promoted to grounded evidence.'};
}
window.REALITI_BODY_V1=Object.freeze({version:'1.0-archived',state:archived,
 archived:true,active:false});
})();