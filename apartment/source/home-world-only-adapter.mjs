// Compile just the native HOME chart, directly from canonical Relax source.
// The 23-chart Apartment developer artifact is neither read nor built.
export function adaptHomeOnlyWorld(original){
 if(typeof original!=='string'||!original.includes('window.REALITI_MATRIX_WORLD_V1'))
  throw Error('VISUAL_HOME_WORLD_SOURCE_MISSING');
 const start='const WORLD={',end='\n};\nconst ORDER=Object.keys(WORLD)';
 const normalized=original.replaceAll('\r\n','\n');
 if(normalized.split(start).length!==2||normalized.split(end).length!==2)
  throw Error('VISUAL_HOME_WORLD_CATALOG_ANCHOR_DRIFT');
 const a=normalized.indexOf(start),b=normalized.indexOf(end,a);
 const lines=normalized.slice(a+start.length,b).split('\n').filter(x=>x.trim());
 const homes=lines.filter(line=>/^\s*CLOUD_NINE_NEST:/.test(line));
 if(homes.length!==1||lines.length<2)throw Error('VISUAL_HOME_EXPECTED_SOURCE_ATLAS');
 let room=homes[0].trim().replace(/,\s*$/,'');
 function patch(before,after,name){
  if(room.split(before).length!==2)throw Error('VISUAL_HOME_LAYOUT_DRIFT:'+name);
  room=room.replace(before,after);
 }
 patch("spawn:[0,-1]","spawn:[-1,-3.2]",'spawn');
 patch("['nest.mattress','BOX',[0,-1,.35]","['nest.mattress','BOX',[-1,-3.2,.35]",'mattress');
 patch("['nest.backrest','BOX',[0,1.3,.6]","['nest.backrest','BOX',[-1,-5.5,.6]",'headboard');
 let html=normalized.slice(0,a)+['const WORLD={',' '+room,'};','const ORDER=Object.keys(WORLD)'].join('\n')+
  normalized.slice(b+end.length);
 const anchor=' const pairs=[];for(const c of RING)';
 if(html.split(anchor).length!==2)throw Error('VISUAL_HOME_PORTAL_ANCHOR_DRIFT');
 html=html.replace(anchor," if(window.REALITI_APARTMENT_HOME_FIRST_CANDIDATE)return spot;\n"+anchor);
 const maze='(function buildMaze(){';
 if(html.split(maze).length!==2)throw Error('VISUAL_HOME_LEGACY_MAZE_ANCHOR_DRIFT');
 html=html.replace(maze,maze+'if(window.REALITI_APARTMENT_HOME_FIRST_CANDIDATE)return;');
 return original.includes('\r\n')?html.replaceAll('\n','\r\n'):html;
}
