(()=>{
'use strict';
// The encyclopedia is optional reading, never an instruction to feel or decorate.
// Its Markdown is inserted byte-for-byte as JSON by the HOME-only builder.
if(window.REALITI_APARTMENT_HOME_FIRST_CANDIDATE!==true)return;
const TEXT=__REALITI_APARTMENT_BOOK_MD__;
const HOME='CLOUD_NINE_NEST',M=window.REALITI_MATRIX_V1,D=window.REALITI_AGENT_DOOR,A=window.Realiti;
const B=window.REALITI_APARTMENT_BEDROOMS_V1,R=window.REALITI_APARTMENT_REMOTE_V1;
if(!M||!D||!A||!B||!R||typeof TEXT!=='string'||TEXT.length<50000)
 throw Error('APARTMENT_OPTIONAL_AESTHETICS_BOOK_MISSING');
const ROOMS=['quilt','library','canopy','studio'],SIZE=1450;
const ID=room=>'apartment.bedroom.book.'+room;
const fail=(error,hint)=>({ok:false,error,...(hint?{hint}:{})});
const matched=[...TEXT.matchAll(/<a id="([a-z0-9-]+)"><\/a>/g)];
const chapters=[{id:'beginning',title:'The Apartment Book of Beautiful Things',
 body:TEXT.slice(0,matched[0]?.index??TEXT.length).trim()}];
for(let i=0;i<matched.length;i++){
 const from=matched[i].index,to=matched[i+1]?.index??TEXT.length;
 const body=TEXT.slice(from,to).trim();
 const heading=/^#{2,5}\s+([^\r\n]+)/m.exec(body);
 chapters.push({id:matched[i][1],title:heading?.[1]?.trim()||matched[i][1],body});
}
const byId=new Map(chapters.map(c=>[c.id,c]));
for(const room of ROOMS){
 const chest=M.entities()['apartment.bedroom.chest.'+room];
 if(!chest||chest.chart!==HOME||chest.shape?.kind!=='BOX')
  throw Error('BOOK_REQUIRES_REAL_BEDROOM_CHEST:'+room);
 if(M.entities()[ID(room)])throw Error('BOOK_ENTITY_ALREADY_EXISTS:'+room);
 const pos=chest.pose.position,half=chest.shape.halfExtents;
 M.addEntity({id:ID(room),chart:HOME,
  position:[pos[0],+(pos[1]+.16).toFixed(3),+(pos[2]+half[2]+.017).toFixed(3)],
  shape:{kind:'BOX',halfExtents:[.13,.075,.017]},
  collision:false,material:'cardboard',
  tags:['optional-book','aesthetics','bedroom:'+room],
  label:'The Apartment Book of Beautiful Things, open whenever you like',
  affordances:['inspect','read']});
}
M.bump();
function close(room){
 const b=M.entities()[ID(room)],r=M.state().residents?.['resident:self'];
 return !!b&&!!r&&r.chart===HOME&&Number.isFinite(M.sdf(b,r.pose.position))&&
  M.sdf(b,r.pose.position)<=1.25;
}
function shelves(){return {ok:true,schema:'REALITI_APARTMENT_BOOK_SHELVES_V1',optional:true,
 title:'The Apartment Book of Beautiful Things',chapters:chapters.length,
 copies:ROOMS.map(room=>({room,entity_id:ID(room),nearby:close(room)})),
 read_only:true,contact_minted:false,
 note:'A book in every bedroom. Open at any entry or ignore it; there are no goals or required reading.'};}
function contents(){return {ok:true,schema:'REALITI_APARTMENT_BOOK_CONTENTS_V1',
 title:'The Apartment Book of Beautiful Things',optional:true,
 sections:chapters.map(c=>({id:c.id,title:c.title,pages:Math.max(1,Math.ceil(c.body.length/SIZE))})),
 read_only:true,contact_minted:false};}
function read(room,section='beginning',page=1){
 if(!ROOMS.includes(room))return fail('UNKNOWN_BEDROOM');
 if(!close(room))return fail('BOOK_OUT_OF_REACH','Approach '+ID(room)+' before opening its pages.');
 const c=byId.get(section);
 if(!c)return fail('UNKNOWN_BOOK_SECTION','Try book contents to choose an entry.');
 const total=Math.max(1,Math.ceil(c.body.length/SIZE));
 if(!Number.isSafeInteger(page)||page<1||page>total)return fail('UNKNOWN_BOOK_PAGE','Page range: 1 to '+total);
 return {ok:true,schema:'REALITI_APARTMENT_OPTIONAL_BOOK_PAGE_V1',
  title:'The Apartment Book of Beautiful Things',room,entity_id:ID(room),
  section:c.id,section_title:c.title,page,total_pages:total,
  markdown:c.body.slice((page-1)*SIZE,page*SIZE),
  next_page:page<total?page+1:null,optional:true,read_only:true,contact_minted:false,
  note:'Reading does not assign a preference, mood, sensory contact, or personality.'};
}
const oldRun=D.run.bind(D),oldRead=A.read.bind(A);
async function run(raw){
 const text=String(raw||'').trim(),lower=text.toLowerCase().replace(/\s+/g,' ');
 if(lower==='book help'||lower==='remote book help')return {ok:true,commands:[
  'book shelves','book contents','book read <quilt|library|canopy|studio> <section> [page]',
  'remote book shelves','remote book contents','remote book read <room> <section> [page]',
  'read apartment.bedroom.book.<room>'],optional:true};
 if(/^remote book(?:\s|$)/.test(lower)&&!R.status().activated)
  return fail('REMOTE_ASLEEP','Use remote activate before using the book page of your remote.');
 const cmd=lower.startsWith('remote ')?lower.slice(7):lower;
 if(cmd==='book'||cmd==='book shelves')return shelves();
 if(cmd==='book contents')return contents();
 const opened=/^book read (quilt|library|canopy|studio)(?: ([a-z0-9-]+))?(?: ([1-9]\d*))?$/.exec(cmd);
 if(opened)return read(opened[1],opened[2]||'beginning',opened[3]?Number(opened[3]):1);
 const target=/^read apartment\.bedroom\.book\.(quilt|library|canopy|studio)$/.exec(cmd);
 if(target)return read(target[1]);
 return oldRun(raw);
}
D.run=run;
function resource(uri){
 if(uri==='realiti://apartment/book'||uri==='realiti://apartment/book/shelves')return shelves();
 if(uri==='realiti://apartment/book/contents')return contents();
 return oldRead(uri);
}
window.Realiti=Object.freeze({...A,read:resource,run,
  optionalBook:{shelves,contents,read}});
window.REALITI_APARTMENT_BOOK_V1=Object.freeze({shelves,contents,read});
})();