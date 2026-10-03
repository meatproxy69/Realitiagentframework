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
for(const name of (await fs.readdir(new URL('source/scripts/',root))).filter(x=>x.endsWith('.js')).sort()){const marker=/^\d\d\.js$/.test(name)?'/*__REALITI_CORE_SCRIPT_'+Number(name.slice(0,2))+'__*/':'/*__SLICE_'+name+'__*/';if(html.split(marker).length!==2)throw Error('Invalid marker: '+name);const raw=await fs.readFile(new URL('source/scripts/'+name,root),'utf8');const body=raw&& !raw.endsWith('\n')?raw+'\n':raw;assertCssFree('source/scripts/'+name,body);html=html.replace(marker,()=>body)}
assertCssFree('RealitiRELAX.html',html);
await fs.writeFile(new URL('RealitiRELAX.html',root),html);
console.log('Built RealitiRELAX.html');
