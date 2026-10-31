// The REALITI Apartment 4.0 beta uses one source-time home chart with a
// sleeping alcove in the southwest. Adapt *only* the derived HTML; never
// rewrite source/scripts/58d-matrix-world.js, the original Relax product,
// or the unchanged 23-chart developer migration artifact.
export function adaptHomeBedAlcove(original){
 if(typeof original!=='string'||!original.includes('window.REALITI_MATRIX_WORLD_V1'))
  throw Error('HOME_BED_WORLD_SOURCE_MISSING');
 const eol=original.includes('\r\n')?'\r\n':'\n';
 const replace=(before,after,label)=>{
  before=before.replaceAll('\n',eol);
  after=after.replaceAll('\n',eol);
  if(original.split(before).length!==2)
   throw Error('HOME_BED_SOURCE_ANCHOR_DRIFT:'+label);
  original=original.replace(before,after);
 };
 // Move both the chart's official native initial spawn and the real mattress
 // together. An agent starts lying on a real support, not a stale bed label.
 replace("CLOUD_NINE_NEST:{size:[6,6,3],spawn:[0,-1],lying:'nest.mattress'",
  "CLOUD_NINE_NEST:{size:[6,6,3],spawn:[-1,-3.2],lying:'nest.mattress'",
  'native_spawn');
 replace("['nest.mattress','BOX',[0,-1,.35],[1.5,2,.35]",
  "['nest.mattress','BOX',[-1,-3.2,.35],[1.5,2,.35]",
  'native_mattress');
 replace("['nest.backrest','BOX',[0,1.3,.6],[1.2,.3,.6]",
  "['nest.backrest','BOX',[-1,-5.5,.6],[1.2,.3,.6]",
  'native_headboard');
 return original;
}
