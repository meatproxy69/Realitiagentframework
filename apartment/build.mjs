// REALITI Apartment standalone artifact: entire canonical Relax runtime + reviewed, narrowly scoped
// native companion adaptation + apartment-only home and Extras overlays. Parent source is never modified.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {adaptCompanions} from './source/companion-adapter.mjs';
const root=new URL('../',import.meta.url);
const apartment=new URL('./',import.meta.url);
const read=async p=>fs.readFile(new URL(p,apartment),'utf8');
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const base=await fs.readFile(new URL('RealitiRELAX.html',root),'utf8');
const nativeSource=await fs.readFile(new URL('source/scripts/58o-companions.js',root),'utf8');
const patchedNative=adaptCompanions(nativeSource);
const end=/<\/body>\s*<\/html>\s*$/i;
if(!end.test(base))throw Error('RELAX_BODY_END_NOT_FOUND');
if(base.includes('realiti-apartment-extras'))throw Error('ALREADY_AN_APARTMENT_ARTIFACT');
if(!base.includes('REALITI_SOMA_HARNESS_V3')||!base.includes('REALITI_MATRIX'))
 throw Error('RELAX_FULL_HARNESS_OR_MATRIX_NOT_FOUND');
if(base.split(nativeSource).length!==2)throw Error('RELAX_COMPANION_SOURCE_NOT_UNIQUE_IN_HTML');
let html=base.replace(nativeSource,patchedNative);
// Keep original architecture modules and their order. Remote wraps their commands last.
const overlays=['source/home-pets.js','source/extras.js','source/furniture.js','source/catnip.js',
  'source/closet.js','source/household-view.js','source/remote.js'];
for(const filename of overlays){
 const body=await read(filename);
 if(/<\/script/i.test(body))throw Error('APARTMENT_SCRIPT_ESCAPE_NOT_ALLOWED: '+filename);
 const ids={'source/home-pets.js':'realiti-apartment-home-pets',
  'source/extras.js':'realiti-apartment-extras',
  'source/furniture.js':'realiti-apartment-furniture',
  'source/catnip.js':'realiti-apartment-catnip',
  'source/closet.js':'realiti-apartment-closet',
  'source/household-view.js':'realiti-apartment-household-view',
  'source/remote.js':'realiti-apartment-remote'};
 const id=ids[filename];if(!id)throw Error('UNRECOGNIZED_APARTMENT_OVERLAY');
 if(!end.test(html))throw Error('RELAX_BODY_END_MISSING_WHILE_ASSEMBLING');
 html=html.replace(end,()=>'<script id="'+id+'">\n'+body+'\n</script>\n</body></html>');
}
const file=new URL('RealitiApartment.html',apartment);
await fs.writeFile(file,html);
const validation={
 schema:'REALITI_APARTMENT_VALIDATION_V1',version:'0.4.0',
 source_artifact:'../RealitiRELAX.html',
 source_html_sha256:hash(base),
 native_companions_source_sha256:hash(nativeSource),
 native_companions_apartment_sha256:hash(patchedNative),
 native_companions_patch:'source/companion-adapter.mjs',
 overlays:overlays.slice(),
 closet_preset_source:'unchanged native REALITI_NEURO_RESTORATION_V1.presets()',
 native_relax_harness_reused:true,
 extra_sensory_stack_created:false,
 single_html_sha256:hash(html),
 includes:'complete canonical REALITI Relax runtime, checked native companion adapter, physical apartment, original Relax preset catalog and read-only household observer',
 complete_relax_source_retained:true,
 parent_files_mutated:false,
 current_room_target:'CLOUD_NINE_NEST',
 legacy_rooms_retained_during_migration:true
};
await fs.writeFile(new URL('VALIDATION.json',apartment),JSON.stringify(validation,null,2)+'\n');
console.log('Built apartment/RealitiApartment.html, SHA-256 '+validation.single_html_sha256);
