// REALITI Apartment standalone artifact. Build from the COMPLETE Relax HTML;
// insert only this product's additive overlay. All upstream slices remain present.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const root=new URL('../',import.meta.url);
const apartment=new URL('./',import.meta.url);
const base=await fs.readFile(new URL('RealitiRELAX.html',root),'utf8');
const overlay=await fs.readFile(new URL('source/extras.js',apartment),'utf8');
const end=/<\/body>\s*<\/html>\s*$/i;
if(!end.test(base))throw Error('RELAX_BODY_END_NOT_FOUND');
if(base.includes('realiti-apartment-extras'))throw Error('ALREADY_AN_APARTMENT_ARTIFACT');
if(!base.includes('REALITI_SOMA_HARNESS_V3')||!base.includes('REALITI_MATRIX'))throw Error('RELAX_FULL_HARNESS_OR_MATRIX_NOT_FOUND');
if(/<\/script/i.test(overlay))throw Error('APARTMENT_SCRIPT_ESCAPE_NOT_ALLOWED');
const html=base.replace(end,()=>'<script id="realiti-apartment-extras">\n'+overlay+'\n</script>\n</body></html>');
const file=new URL('RealitiApartment.html',apartment);
await fs.writeFile(file,html);
const digest=crypto.createHash('sha256').update(html).digest('hex');
const validation={
  schema:'REALITI_APARTMENT_VALIDATION_V1',version:'0.1.0',
  source_artifact:'../RealitiRELAX.html',
  source_html_sha256:crypto.createHash('sha256').update(base).digest('hex'),
  single_html_sha256:digest,
  includes:'entire REALITI Relax HTML plus apartment/source/extras.js',
  complete_relax_source_retained:true
};
await fs.writeFile(new URL('VALIDATION.json',apartment),JSON.stringify(validation,null,2)+'\n');
console.log('Built apartment/RealitiApartment.html, SHA-256 '+digest);
