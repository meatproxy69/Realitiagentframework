// A separately versioned, home-first ALPHA candidate. The 23-chart
// development Apartment and original Relax remain byte-for-byte untouched.
// The only physical objects in HOME are the domestic baseline / pets / toys.
// Historical source equations are kept, NOT turned into a gallery of props.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const apartment=new URL('./',import.meta.url);
const read=async name=>fs.readFile(new URL(name,apartment),'utf8');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const base=await read('RealitiApartment.html');
const validated=JSON.parse(await read('VALIDATION.json'));
if(hash(base)!==validated.single_html_sha256||
 validated.complete_relax_source_retained!==true||
 validated.legacy_rooms_retained_during_migration!==true)
 throw Error('HOME_CANDIDATE_REQUIRES_VERIFIED_COMPLETE_RELAX_DERIVATIVE');
const sourceAnchor='<script id="realiti-apartment-native-stations">\n';
if(base.split(sourceAnchor).length!==2)
 throw Error('HOME_CANDIDATE_STATION_INIT_ANCHOR_DRIFT');
const flag='<script id="realiti-apartment-home-first-configuration">\n'+
 'window.REALITI_APARTMENT_HOME_FIRST_CANDIDATE=true;\n</script>\n';
const clean=base.replace(sourceAnchor,flag+sourceAnchor);
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
 expected_chart_ids:['CLOUD_NINE_NEST'],
 expected_portal_count:0,expected_legacy_station_count:0,
 original_relax_untouched:true,canonical_23_room_source_preserved:true,
 normal_development_apartment_preserved:true,
 physical_scope:'HOME_FURNITURE_PETS_CATNIP_REMOTE_AND_WARDROBE_ONLY',
 excluded_historical_worlds:['ARCHIPELAGO','UNDERCITY'],
 disclaimer:'Preview gate prunes historic charts after full source initialization; no production cutover or automatic resident data migration. Owner release review required.'
};
await fs.writeFile(new URL('RealitiApartmentHomeCandidate.html',apartment),html);
await fs.writeFile(new URL('HOME_CANDIDATE_VALIDATION.json',apartment),
 JSON.stringify(manifest,null,2)+'\n');
console.log('Built home-first ALPHA candidate, SHA-256 '+manifest.single_html_sha256);
