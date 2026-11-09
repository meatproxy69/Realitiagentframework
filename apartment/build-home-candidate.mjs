// A separately versioned, home-first ALPHA candidate. The 23-chart
// development Apartment and original Relax remain byte-for-byte untouched.
// The only physical objects in HOME are the domestic baseline / pets / toys.
// Historical source equations are kept, NOT turned into a gallery of props.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {adaptNativeHomeBoot} from './source/native-home-boot-adapter.mjs';
import {adaptHomeBedAlcove} from './source/native-home-bedroom-adapter.mjs';
import {adaptHomeWelcome} from './source/native-home-welcome-adapter.mjs';
const apartment=new URL('./',import.meta.url);
const read=async name=>fs.readFile(new URL(name,apartment),'utf8');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const base=await read('RealitiApartment.html');
const validated=JSON.parse(await read('VALIDATION.json'));
if(hash(base)!==validated.single_html_sha256||
 validated.complete_relax_source_retained!==true||
 validated.legacy_rooms_retained_during_migration!==true)
 throw Error('HOME_CANDIDATE_REQUIRES_VERIFIED_COMPLETE_RELAX_DERIVATIVE');
// The original unmodified Matrix kernel is embedded exactly once. Replace
// it in this *derived candidate* only with an anchored registration gate.
// This prevents any historical chart/portal from being created at startup.
const originalKernel=await fs.readFile(new URL('source/scripts/57.js',new URL('../',apartment)),'utf8');
if(base.split(originalKernel).length!==2)
 throw Error('HOME_CANDIDATE_ORIGINAL_MATRIX_KERNEL_NOT_UNIQUE');
const nativeKernel=adaptNativeHomeBoot(originalKernel);
const worldKernel=await fs.readFile(new URL('source/scripts/58d-matrix-world.js',new URL('../',apartment)),'utf8');
if(base.split(worldKernel).length!==2)
 throw Error('HOME_CANDIDATE_ORIGINAL_WORLD_SOURCE_NOT_UNIQUE');
const bedroomKernel=adaptHomeBedAlcove(worldKernel);
// The bedroom's initial spawn is moved *with* its native mattress before
// the original world layer registers geometry. No after-boot teleportation.
const clean=adaptHomeWelcome(base.replace(originalKernel,nativeKernel)
 .replace(worldKernel,bedroomKernel));
if(clean.includes('realiti-apartment-home-first-configuration'))
 throw Error('HOME_CANDIDATE_LEGACY_LATE_CONFIG_MUST_NOT_BE_PRESENT');
const source=await read('source/one-chart-preview.js');
const life=await read('source/home-life.js');
const bookMarkdown=await read('books/The_Apartment_Book_of_Beautiful_Things.md');
const bookSource=await read('source/home-book.js');
const placeholder='__REALITI_APARTMENT_BOOK_MD__';
if(bookSource.split(placeholder).length!==2||bookMarkdown.length<50000)
 throw Error('HOME_OPTIONAL_BOOK_SOURCE_INCOMPLETE');
const book=bookSource.replace(placeholder,JSON.stringify(bookMarkdown));
// Checkpoint 2: explicit, optional resident-private style questionnaire and binder.
// Embed only the static 200-question bank, never a resident's answers or generations.
const styleQuestionsRaw=await read('style/creative-questions.json');
const styleQuestions=JSON.parse(styleQuestionsRaw);
const styleSource=await read('source/style-binder.js');
const ids=styleQuestions.questions?.map(q=>q.id)||[];
if(styleQuestions.schema!=='REALITI_APARTMENT_STYLE_QUESTION_BANK_V1'||
   styleQuestions.question_count!==200||ids.length!==200||new Set(ids).size!==200||
   !styleQuestions.questions.every(q=>q.choices?.length===4))
 throw Error('HOME_STYLE_QUESTION_BANK_INCOMPLETE');
const stylePlaceholder='__REALITI_APARTMENT_STYLE_BANK__';
const styleHashPlaceholder='__REALITI_APARTMENT_STYLE_BANK_SHA256__';
if(styleSource.split(stylePlaceholder).length!==2||
   styleSource.split(styleHashPlaceholder).length!==2)
 throw Error('HOME_STYLE_BINDER_SOURCE_ANCHOR_DRIFT');
const binderCode=styleSource.replace(stylePlaceholder,JSON.stringify(styleQuestions))
 .replace(styleHashPlaceholder,JSON.stringify(hash(styleQuestionsRaw)));
// Checkpoint 3 is downstream of the verified binder. Static avatar
// presentation presets never modify the native source or resident physiology.
const appearanceRaw=await read('style/appearance-presets.json');
const appearanceData=JSON.parse(appearanceRaw);
const appearanceSource=await read('source/style-appearance.js');
const appearancePlaceholder='__REALITI_APARTMENT_APPEARANCE_PRESETS__';
if(appearanceData.schema!=='REALITI_APARTMENT_APPEARANCE_PRESETS_V1'||
   Object.keys(appearanceData.presets||{}).length<8||
   appearanceSource.split(appearancePlaceholder).length!==2)
 throw Error('HOME_APPEARANCE_PRESET_SOURCE_INCOMPLETE');
const appearanceCode=appearanceSource.replace(appearancePlaceholder,JSON.stringify(appearanceData));
const fieldNotes=await read('source/home-field-notes.js');
const roomInspect=await read('source/home-inspect.js');
if(/<\/script/i.test(source)||/<\/script/i.test(life)||/<\/script/i.test(book)||
   /<\/script/i.test(binderCode)||/<\/script/i.test(appearanceCode)||/<\/script/i.test(fieldNotes)||/<\/script/i.test(roomInspect))
 throw Error('HOME_CANDIDATE_GATE_SCRIPT_ESCAPE');
const end=/<\/body>\s*<\/html>\s*$/i;
if(!end.test(clean))throw Error('HOME_CANDIDATE_HTML_END_MISSING');
const html=clean.replace(end,()=>'<script id="realiti-apartment-home-topology">\n'+
 source+'\n</script>\n<script id="realiti-apartment-home-life">\n'+
 life+'\n</script>\n<script id="realiti-apartment-optional-book">\n'+
 book+'\n</script>\n<script id="realiti-apartment-private-style-binder">\n'+
 binderCode+'\n</script>\n<script id="realiti-apartment-presentation-wardrobe">\n'+
 appearanceCode+'\n</script>\n<script id="realiti-apartment-field-notes">\n'+
 fieldNotes+'\n</script>\n<script id="realiti-apartment-room-inspect">\n'+
 roomInspect+'\n</script>\n</body></html>');
const manifest={
 schema:'REALITI_APARTMENT_HOME_CANDIDATE_VALIDATION_V1',
 version:'4.9.0-beta.1',candidate_only:true,preview_only:true,
 public_distribution:'SOURCE_BUILD_ONLY_UNRELEASED_CANDIDATE',
 release_approved:false,product_parity_reviewed:false,
 single_html_sha256:hash(html),
 parent_apartment_sha256:validated.single_html_sha256,
 canonical_relax_source_sha256:validated.source_html_sha256,
 source_gate_sha256:hash(source),
 home_life_sha256:hash(life),
 field_notes_sha256:hash(fieldNotes),field_notes_passive_only:true,
 room_inspect_source_sha256:hash(roomInspect),room_inspect_read_only:true,
 vibe_room_context_event_driven:true,
 home_autonomous_actions_disabled:true,
 optional_book_markdown_sha256:hash(bookMarkdown),
 optional_book_pages:true,bedroom_book_copies:4,
 style_question_bank_sha256:hash(styleQuestionsRaw),
 optional_style_question_count:200,private_style_binder_generations:true,
 style_checkpoint:2,appearance_checkpoint:3,
 appearance_presets_sha256:hash(appearanceRaw),
 optional_presentation_wardrobe:true,appearance_publication_host_only:true,
 original_matrix_kernel_sha256:hash(originalKernel),
 native_matrix_boot_gate_sha256:hash(nativeKernel),
 original_world_kernel_sha256:hash(worldKernel),
 home_bedroom_kernel_sha256:hash(bedroomKernel),
 bedroom_layout:'SOUTHWEST_QUIET_ALCOVE_V4',
 layout_checkpoint_migration_approved:false,
 native_single_chart_initialization:true,
 no_post_startup_pruning_required:true,
 expected_chart_ids:['CLOUD_NINE_NEST'],
 expected_portal_count:0,expected_legacy_station_count:0,
 original_relax_untouched:true,canonical_23_room_source_preserved:true,
 normal_development_apartment_preserved:true,
 physical_scope:'HOME_FURNITURE_PETS_CATNIP_REMOTE_AND_WARDROBE_ONLY',
 excluded_historical_worlds:['ARCHIPELAGO','UNDERCITY'],
 disclaimer:'Original legacy scientific code is retained, but historic Matrix charts/portals/props are not registered at boot. Candidate is still non-release; independent operator review and backup migration required.'
};
await fs.writeFile(new URL('RealitiApartmentHomeCandidate.html',apartment),html);
await fs.writeFile(new URL('HOME_CANDIDATE_VALIDATION.json',apartment),
 JSON.stringify(manifest,null,2)+'\n');
console.log('Built native one-chart home-first ALPHA candidate, SHA-256 '+manifest.single_html_sha256);
