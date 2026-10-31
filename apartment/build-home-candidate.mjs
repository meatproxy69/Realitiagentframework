// A separately versioned, home-first ALPHA candidate. The 23-chart
// development Apartment and original Relax remain byte-for-byte untouched.
// The only physical objects in HOME are the domestic baseline / pets / toys.
// Historical source equations are kept, NOT turned into a gallery of props.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {adaptNativeHomeBoot} from './source/native-home-boot-adapter.mjs';
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
const clean=base.replace(originalKernel,nativeKernel);
if(clean.includes('realiti-apartment-home-first-configuration'))
 throw Error('HOME_CANDIDATE_LEGACY_LATE_CONFIG_MUST_NOT_BE_PRESENT');
const source=await read('source/one-chart-preview.js');
if(/<\/script/i.test(source))throw Error('HOME_CANDIDATE_GATE_SCRIPT_ESCAPE');
const end=/<\/body>\s*<\/html>\s*$/i;
if(!end.test(clean))throw Error('HOME_CANDIDATE_HTML_END_MISSING');
const html=clean.replace(end,()=>'<script id="realiti-apartment-home-topology">\n'+
 source+'\n</script>\n</body></html>');
const manifest={
 schema:'REALITI_APARTMENT_HOME_CANDIDATE_VALIDATION_V1',
 version:'0.1.0-alpha',candidate_only:true,preview_only:true,
 release_approved:false,product_parity_reviewed:false,
 single_html_sha256:hash(html),
 parent_apartment_sha256:validated.single_html_sha256,
 canonical_relax_source_sha256:validated.source_html_sha256,
 source_gate_sha256:hash(source),
 original_matrix_kernel_sha256:hash(originalKernel),
 native_matrix_boot_gate_sha256:hash(nativeKernel),
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
