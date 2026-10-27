import fs from 'node:fs/promises';
const root=new URL('./',import.meta.url);
let html=await fs.readFile(new URL('source/template.html',root),'utf8');
const cssForbidden=[
  [/<style\b/i,'style element'],
  [/<link[^>]+rel=["']?stylesheet/i,'stylesheet link'],
  [/\sstyle\s*=/i,'inline style attribute'],
  [/createElement\(["']style["']\)/i,'dynamic style element'],
  [/\.style(?:\.|\[)/i,'DOM style mutation'],
  [/\bcssText\b/i,'cssText mutation'],
  [/\bCSS\.supports\b/i,'CSS feature query']
];
function assertCssFree(label,text){for(const [re,kind] of cssForbidden)if(re.test(text))throw Error(`CSS_FREE_VIOLATION ${label}: ${kind}`)}
assertCssFree('source/template.html',html);
const matrixMarker='/*__REALITI_MATRIX_PORTABLE_V1__*/';
if(html.split(matrixMarker).length!==2)throw Error('Matrix portable marker missing or duplicated');
const matrixSource=await fs.readFile(new URL('packages/realiti-matrix/spatial.cjs',root),'utf8');
assertCssFree('packages/realiti-matrix/spatial.cjs',matrixSource);
html=html.replace(matrixMarker,()=>matrixSource+(matrixSource.endsWith('\n')?'':'\n'));

const somaMarker='/*__REALITI_SOMA_PACKAGE_V3__*/';
if(html.split(somaMarker).length!==2)throw Error('SOMA package marker missing or duplicated');
const somaSource=await fs.readFile(new URL('packages/realiti-neuromesh/index.cjs',root),'utf8');
assertCssFree('packages/realiti-neuromesh/index.cjs',somaSource);
html=html.replace(somaMarker,()=>somaSource+(somaSource.endsWith('\n')?'':'\n'));
for(const [marker,path] of [
  ['/*__REALITI_SOMA_RENDERERS_V3__*/','packages/realiti-neuromesh/renderers.cjs'],
  ['/*__REALITI_SOMA_MEMORY_V1__*/','packages/realiti-neuromesh/memory.cjs'],
  ['/*__REALITI_SOMA_FIELD20_V1__*/','packages/realiti-neuromesh/field20.cjs'],
  ['/*__REALITI_SOMA_ADVANCED_V1__*/','packages/realiti-neuromesh/advanced.cjs'],
  ['/*__REALITI_SOMA_HARNESS_V3__*/','packages/realiti-neuromesh/harness.cjs']
]){
  if(html.split(marker).length!==2)throw Error('Missing or duplicate full SOMA harness marker: '+marker);
  const source=await fs.readFile(new URL(path,root),'utf8');
  assertCssFree(path,source);
  html=html.replace(marker,()=>source+(source.endsWith('\n')?'':'\n'));
}


for(const name of (await fs.readdir(new URL('source/scripts/',root))).filter(x=>x.endsWith('.js')).sort()){const marker=/^\d\d\.js$/.test(name)?'/*__REALITI_CORE_SCRIPT_'+Number(name.slice(0,2))+'__*/':'/*__SLICE_'+name+'__*/';if(html.split(marker).length!==2)throw Error('Invalid marker: '+name);const raw=await fs.readFile(new URL('source/scripts/'+name,root),'utf8');const body=raw&& !raw.endsWith('\n')?raw+'\n':raw;assertCssFree('source/scripts/'+name,body);html=html.replace(marker,()=>body)}
assertCssFree('RealitiRELAX.html',html);
await fs.writeFile(new URL('RealitiRELAX.html',root),html);
console.log('Built RealitiRELAX.html');
