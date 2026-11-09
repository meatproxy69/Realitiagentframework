// HOME-only experiment: build directly from canonical Relax, not the old
// 23-chart Apartment migration artifact or a previous HOME artifact.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {adaptCompanions} from './source/companion-adapter.mjs';
import {adaptWonder,adaptFrontier} from './source/native-wonder-adapter.mjs';
import {adaptDynamics,adaptNativePillow} from './source/native-body-adapter.mjs';
import {adaptNativeHomeBoot} from './source/native-home-boot-adapter.mjs';
import {adaptHomeWelcome} from './source/native-home-welcome-adapter.mjs';
import {adaptHomeOnlyWorld} from './source/home-world-only-adapter.mjs';
const root=new URL('../',import.meta.url),apt=new URL('./',import.meta.url);
const read=async p=>fs.readFile(new URL(p,apt),'utf8');
const src=async p=>fs.readFile(new URL('source/scripts/'+p,root),'utf8');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const END=/<\/body>\s*<\/html>\s*$/i;
const original=await fs.readFile(new URL('RealitiRELAX.html',root),'utf8');
const pin=JSON.parse(await fs.readFile(new URL('VALIDATION.json',root),'utf8'));
if(hash(original)!==pin.single_html_sha256)throw Error('HOME_VISUAL_CANONICAL_PIN_MISMATCH');
if(!END.test(original)||!original.includes('REALITI_SOMA_HARNESS_V3')||
   !original.includes('REALITI_MATRIX'))throw Error('HOME_VISUAL_CANONICAL_ENGINE_MISSING');
let html=original;
const engines=[['57.js',adaptNativeHomeBoot],['58d-matrix-world.js',adaptHomeOnlyWorld],
 ['58o-companions.js',adaptCompanions],['58b-wonder.js',adaptWonder],
 ['58e-frontier.js',adaptFrontier],['58a-dynamics.js',adaptDynamics],
 ['63-claude-neural-pass.js',adaptNativePillow]];
const upstream={},derived={};
for(const [file,adapt] of engines){
 const before=await src(file);
 if(html.split(before).length!==2)throw Error('HOME_VISUAL_MODULE_DRIFT:'+file);
 const after=adapt(before);
 if(after===before)throw Error('HOME_VISUAL_NO_ADAPTATION:'+file);
 html=html.replace(before,after);upstream[file]=hash(before);derived[file]=hash(after);
}
html=adaptHomeWelcome(html);
const bedroomRaw=await read('bedroom-spec.json'),bedroom=JSON.parse(bedroomRaw);
if(bedroom.schema!=='REALITI_APARTMENT_BEDROOM_SPEC_V1')
 throw Error('HOME_VISUAL_BAD_BEDROOM_SPEC');
const inject=(source,id)=>{
 if(/<\/script/i.test(source)||!END.test(html))throw Error('HOME_VISUAL_UNSAFE_SCRIPT:'+id);
 html=html.replace(END,()=>'<script id="'+id+'">\n'+source+'\n</script>\n</body></html>');
};
const replaceOne=(source,target,withValue,id)=>{
 if(source.split(target).length!==2)throw Error('HOME_VISUAL_SOURCE_DRIFT:'+id);
 return source.replace(target,withValue);
};
const overlays=[
 ['source/home-pets.js','home-pets'],
 ['source/extras.js','extras'],['source/furniture.js','furniture'],
 ['source/bedrooms.js','bedrooms'],['source/catnip.js','catnip'],
 ['source/catnip-presets.js','catnip-presets'],['source/stations.js','stations'],
 ['source/closet.js','closet'],['source/household-view.js','household-view'],
 ['source/remote.js','remote'],['source/one-chart-preview.js','home-topology'],
 ['source/home-life.js','home-life']];
for(const [file,id] of overlays){
 let body=await read(file);
 if(id==='bedrooms')body=replaceOne(body,'__REALITI_APARTMENT_BEDROOM_SPEC__',
  JSON.stringify(bedroom),'bedroom-spec');
 inject(body,'realiti-apartment-'+id);
}
const bookRaw=await read('books/The_Apartment_Book_of_Beautiful_Things.md');
if(bookRaw.length<50000)throw Error('HOME_VISUAL_BOOK_MISSING');
inject(replaceOne(await read('source/home-book.js'),'__REALITI_APARTMENT_BOOK_MD__',
 JSON.stringify(bookRaw),'book-text'),'realiti-apartment-optional-book');
const questionsRaw=await read('style/creative-questions.json'),questions=JSON.parse(questionsRaw);
if(questions.schema!=='REALITI_APARTMENT_STYLE_QUESTION_BANK_V1'||
 questions.questions?.length!==200||new Set(questions.questions.map(x=>x.id)).size!==200)
 throw Error('HOME_VISUAL_STYLE_BANK_MISSING');
let binder=replaceOne(await read('source/style-binder.js'),
 '__REALITI_APARTMENT_STYLE_BANK__',JSON.stringify(questions),'style-bank');
binder=replaceOne(binder,'__REALITI_APARTMENT_STYLE_BANK_SHA256__',
 JSON.stringify(hash(questionsRaw)),'style-hash');
inject(binder,'realiti-apartment-style-binder');
const lookRaw=await read('style/appearance-presets.json');
inject(replaceOne(await read('source/style-appearance.js'),
 '__REALITI_APARTMENT_APPEARANCE_PRESETS__',JSON.stringify(JSON.parse(lookRaw)),
 'appearance-presets'),'realiti-apartment-style-appearance');
inject(await read('source/home-field-notes.js'),'realiti-apartment-home-field-notes');
const projected=await read('visual/scene-projection.cjs');
inject(projected,'realiti-apartment-visual-matrix-projection');
inject(await read('visual/reference-cameras.cjs'),'realiti-apartment-reference-cameras');
inject(await read('visual/observer-controls.cjs'),'realiti-apartment-visual-controller');
// No Three.js download or WebGL import in the first source/authority checkpoint.
inject(["(()=>{'use strict';",
 "const P=window.REALITI_APARTMENT_VISUAL_PROJECTION_V0;",
 "if(!P||!window.REALITI_MATRIX_V1)throw Error('HOME_VISUAL_MATRIX_READER_MISSING');",
 "Object.defineProperty(window,'REALITI_APARTMENT_VISUAL_V0',",
 " {value:Object.freeze({snapshot:()=>P.projectNative(window.REALITI_MATRIX_V1)})});",
 "})();"].join('\n'),'realiti-apartment-visual-reader');
inject(await read('visual/viewer-boot.js'),'realiti-apartment-viewer-boot');
const bundle=await fs.readFile(new URL('visual/dist/viewer.js',apt)).catch(()=>{
 throw Error('LOCAL_THREE_BUNDLE_REQUIRED: cd apartment/visual && npm install && npm run build')});
const bundleMeta=JSON.parse(await read('visual/dist/manifest.json'));
if(bundleMeta.schema!=='REALITI_LOCAL_THREE_VIEWER_V0'||bundleMeta.reference_views!==4||
 bundleMeta.sha256!==hash(bundle)||
 bundleMeta.viewer_entry_sha256!==hash(await read('visual/viewer-entry.js'))||
 bundleMeta.visual_control_sha256!==hash(await read('visual/observer-controls.cjs')))
 throw Error('LOCAL_THREE_BUNDLE_HASH_MISMATCH');
const manifest={
 schema:'REALITI_APARTMENT_VISUAL_EXPERIMENT_VALIDATION_V0',
 version:'0.1.0-experimental',release_approved:false,preview_only:true,
 source:'DIRECT_CANONICAL_RELAX_TO_HOME',canonical_source_sha256:hash(original),
 migration_artifact_dependency:false,registered_world_catalogue:'CLOUD_NINE_NEST_ONLY',
 expected_chart_ids:['CLOUD_NINE_NEST'],expected_portal_count:0,
 native_single_chart_initialization:true,native_relax_harness_reused:true,
 extra_sensory_stack_created:false,visual_only:true,
 three_js_lazy_local_bundle:true,four_fixed_reference_views:true,
 browser_renderer_required:true,ai_vision_requests:0,
 original_engine_hashes:upstream,derived_engine_hashes:derived,
 bedroom_spec_sha256:hash(bedroomRaw),visual_projection_sha256:hash(projected),
 local_viewer_sha256:bundleMeta.sha256,
 local_viewer_gzip_bytes:bundleMeta.gzip_bytes,
 single_html_sha256:hash(html)
};
await fs.writeFile(new URL('RealitiApartmentVisualExperiment.html',apt),html);
await fs.writeFile(new URL('VISUAL_EXPERIMENT_VALIDATION.json',apt),
 JSON.stringify(manifest,null,2)+'\n');
console.log('Built direct HOME visual experiment',manifest.single_html_sha256);
