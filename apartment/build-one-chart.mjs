// Explicit opt-in one-chart topology preview built from the completed Apartment
// DEVELOPMENT artifact. NEVER overwrites original Relax or normal Apartment.
// This is NOT the shipping release while source-room parity is incomplete.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const apartment=new URL('./',import.meta.url);
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const html=await fs.readFile(new URL('RealitiApartment.html',apartment),'utf8');
const metadata=JSON.parse(await fs.readFile(new URL('VALIDATION.json',apartment),'utf8'));
if(metadata.single_html_sha256!==hash(html)||metadata.complete_relax_source_retained!==true)
 throw Error('ONE_CHART_PREVIEW_REQUIRES_HASH_VERIFIED_COMPLETE_APARTMENT');
if(!html.includes('realiti-apartment-native-stations'))
 throw Error('ORIGINAL_ENGINE_STATIONS_NOT_COMPILED');
const gate=await fs.readFile(new URL('source/one-chart-preview.js',apartment),'utf8');
if(/<\/script/i.test(gate))throw Error('ONE_CHART_ESCAPE_NOT_ALLOWED');
const end=/<\/body>\s*<\/html>\s*$/i;
if(!end.test(html))throw Error('APARTMENT_HTML_END_MISSING');
const preview=html.replace(end,()=>'<script id="realiti-apartment-one-chart-preview">\n'+gate+'\n</script>\n</body></html>');
const file=new URL('RealitiApartmentOneChartPreview.html',apartment);
await fs.writeFile(file,preview);
const manifest={schema:'REALITI_APARTMENT_ONE_CHART_PREVIEW_VALIDATION_V1',
 version:'0.1-preview',preview_only:true,
 mechanical_parity_certified:false,release_approved:false,
 source_apartment_sha256:metadata.single_html_sha256,
 single_html_sha256:hash(preview),
 original_relax_source_sha256:metadata.source_html_sha256,
 original_23_room_artifact_retained:'RealitiApartment.html',
 original_canonical_relax_retained:true,
 expected_chart_ids:['CLOUD_NINE_NEST'],expected_portal_count:0,
 migration_gate:'Every source room still requires verified full behavioral/causal parity or explicit owner approved exclusion before a one-chart release can replace the development artifact.'};
await fs.writeFile(new URL('ONE_CHART_VALIDATION.json',apartment),
 JSON.stringify(manifest,null,2)+'\n');
console.log('Built experimental one-chart topology preview, SHA-256 '+manifest.single_html_sha256);
