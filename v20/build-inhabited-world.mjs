// Assemble a separate native V20 candidate from an EXACT pinned original source.
// Preserve all 23 original Matrix charts and existing City, Haptic Field V20,
// Neural Pass/Sausage, harness, original Apartment entities, and public ledger.
// No upstream writes, no pruning, no replacement body engine.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {adaptCloudSomaMirror} from './adapt-cloud-soma.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const sourceRoot=path.join(root,'upstream-v20');
const read=p=>fs.readFile(path.join(sourceRoot,p),'utf8');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const lock=JSON.parse(await fs.readFile(path.join(root,'v20-base.lock.json'),'utf8'));
const head=execFileSync('git',['rev-parse','HEAD'],{cwd:sourceRoot,encoding:'utf8'}).trim();
if(head!==lock.source_commit)throw Error('V20_UPSTREAM_COMMIT_MISMATCH');
const canonical=await read('RealitiRELAX.html');
if(sha(canonical)!==lock.source_artifact_sha256)throw Error('V20_CANONICAL_HASH_MISMATCH');
const original=await read('apartment/RealitiApartment.html');
const apartmentValidation=JSON.parse(await read('apartment/VALIDATION.json'));
if(sha(original)!==apartmentValidation.single_html_sha256 ||
 apartmentValidation.complete_relax_source_retained!==true||
 apartmentValidation.legacy_rooms_retained_during_migration!==true)
 throw Error('V20_COMPLETE_APARTMENT_INTEGRITY_FAILURE');
const originalSomaBridge=await read('source/scripts/98-soma-bridge.js');
if(original.split(originalSomaBridge).length!==2)
 throw Error('V20_ORIGINAL_SOMA_BRIDGE_NOT_UNIQUE');
const derivedSomaBridge=adaptCloudSomaMirror(originalSomaBridge);
const coupled=original.replace(originalSomaBridge,()=>derivedSomaBridge);
if(!coupled.includes('REALITI_HAPTIC_FIELD_V20')||
   !original.includes('REALITI_NEURAL_PASS_V112')||
   !original.includes('REALITI_CITY_V1')||
   !original.includes('REALITI_LEDGER_V2'))
 throw Error('V20_NATIVE_RUNTIME_REQUIRED');

const names=[
 ['home-life','source/home-life.js'],
 ['home-book','source/home-book.js'],
 ['style-binder','source/style-binder.js'],
 ['style-appearance','source/style-appearance.js'],
 ['home-field-notes','source/home-field-notes.js'],
 ['home-inspect','source/home-inspect.js'],
 ['bed-cloud-ocean','source/bed-cloud-ocean.js'],
 ['home-catnip-paws','source/home-catnip-paws.js']
];
const book=await read('apartment/books/The_Apartment_Book_of_Beautiful_Things.md');
const questionsText=await read('apartment/style/creative-questions.json');
const questions=JSON.parse(questionsText);
const appearanceText=await read('apartment/style/appearance-presets.json');
const appearance=JSON.parse(appearanceText);
if(book.length<50000||questions.schema!=='REALITI_APARTMENT_STYLE_QUESTION_BANK_V1'||
  questions.questions?.length!==200||
  appearance.schema!=='REALITI_APARTMENT_APPEARANCE_PRESETS_V1')
 throw Error('V20_PRIVATE_HOME_FEATURE_DATA_INVALID');
function substituteOnce(source,needle,replacement,reason){
 if(source.split(needle).length!==2)throw Error(reason+'_ANCHOR_CHANGED');
 return source.replace(needle,()=>replacement);
}
const sources={};
for(const [id,file] of names){
 let code=await read('apartment/'+file);
 // Change only the feature-on gate in the DERIVED browser artifact. Original
 // source and original HOME-only release candidate remain byte-for-byte intact.
 code=substituteOnce(code,
   'if(window.REALITI_APARTMENT_HOME_FIRST_CANDIDATE!==true)return;',
   'if(window.REALITI_V20_UNIFIED_WORLD!==true)return;',
   'V20_'+id);
 if(id==='home-book')
  code=substituteOnce(code,'__REALITI_APARTMENT_BOOK_MD__',JSON.stringify(book),'V20_BOOK');
 if(id==='style-binder'){
  code=substituteOnce(code,'__REALITI_APARTMENT_STYLE_BANK__',JSON.stringify(questions),'V20_STYLE_BANK');
  code=substituteOnce(code,'__REALITI_APARTMENT_STYLE_BANK_SHA256__',JSON.stringify(sha(questionsText)),'V20_STYLE_HASH');
 }
 if(id==='style-appearance')
  code=substituteOnce(code,'__REALITI_APARTMENT_APPEARANCE_PRESETS__',JSON.stringify(appearance),'V20_APPEARANCE');
 // The source HOME alpha reported "one_native_chart:true" correctly.
 // In the reunited V20 world there are 23 charts; keep metadata truthful.
 const expectedMeta=new Set(['home-life','home-inspect','bed-cloud-ocean']);
 const oldFlag='one_native_chart:true';
 const hits=code.split(oldFlag).length-1;
 if(hits!==(expectedMeta.has(id)?1:0))throw Error('V20_HOME_TOPOLOGY_METADATA_DRIFT:'+id);
 if(hits)code=code.replace(oldFlag,
  'one_native_chart:Object.keys(window.REALITI_MATRIX_V1.charts()).length===1');
 if(/<\/script/i.test(code))throw Error('V20_ADAPTER_SCRIPT_ESCAPE:'+id);
 sources[id]=code;
}
const end=/<\/body>\s*<\/html>\s*$/i;
if(!end.test(coupled)||coupled.includes('realiti-v20-unified-world'))throw Error('V20_INHABITED_END_OR_DUPLICATE');
let appended='<script id="realiti-v20-unified-world">\n'+
 'if(window.REALITI_APARTMENT_HOME_FIRST_CANDIDATE===true)throw Error("WRONG_HOME_ONLY_SOURCE");\n'+
 'window.REALITI_V20_UNIFIED_WORLD=true;\n'+
 '</script>\n';
for(const [id] of names)appended+='<script id="v20-native-'+id+'">\n'+sources[id]+'\n</script>\n';
const syncSource=await fs.readFile(path.join(here,'sync-native-senses.js'),'utf8');
if(!syncSource.startsWith('(()=>{')||/<\/script/i.test(syncSource))
 throw Error('V20_SENSORY_SYNCHRONIZER_INVALID');
appended+='<script id="v20-native-sensory-synchronization">\n'+syncSource+'\n</script>\n';
const html=coupled.replace(end,()=>appended+'</body></html>');
const result={
 schema:'REALITI_NATIVE_V20_INHABITED_CANDIDATE_V1',
 version:'V20-original-plus-reviewed-HOME-overlays',
 candidate_only:true,
 release_approved:false,
 source_commit:lock.source_commit,
 original_canonical_sha256:lock.source_artifact_sha256,
 original_apartment_sha256:apartmentValidation.single_html_sha256,
 single_html_sha256:sha(html),
 original_room_count:23,
 original_city_runtime:true,
 original_v20_field_unchanged:true,
 original_neural_pass_unchanged:true,
 original_neuromesh_and_harness_unchanged:true,
 original_soma_bridge_sha256:sha(originalSomaBridge),
 derived_soma_cloud_adapter_sha256:sha(derivedSomaBridge),
 derived_sensory_sync_sha256:sha(syncSource),
 native_cloud_support_mirrored_to_existing_soma:true,
 original_city_ledger_v2_unchanged:true,
 source_home_adapter_hashes:Object.fromEntries(names.map(([id])=>[id,sha(sources[id])])),
 no_new_matrix:true,
 no_automatic_resident_save_migration:true,
 trusted_multiplayer_server:false,
 independently_qualified:false,
 note:'Full original world plus HOME-only optional behaviors; not a 23-station replacement or the separately approved HOME-only candidate.'
};
await fs.mkdir(here,{recursive:true});
await fs.writeFile(path.join(here,'RealitiV20InhabitedCandidate.html'),html);
await fs.writeFile(path.join(here,'INHABITED_VALIDATION.json'),JSON.stringify(result,null,2)+'\n');
console.log('BUILT_V20_INHABITED '+JSON.stringify({
 original_charts:23,overlay_count:names.length,sha256:result.single_html_sha256,
 original_neural_source_modified:false}));
