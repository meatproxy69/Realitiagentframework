(()=>{
'use strict';
// REALITI Apartment additions. Append AFTER all unchanged Relax scripts.
// The original world/harness remains intact; this is a separate UI/Agent Door overlay.
const D=window.REALITI_AGENT_DOOR,A=window.Realiti,M=window.REALITI_MATRIX_V1;
const MW=window.REALITI_MATRIX_WORLD_V1,DYN=window.REALITI_DYNAMICS_V1;
if(!D||!A||!M||!MW||!DYN||!window.REALITI_SOMA_RELAX_V3)throw Error('APARTMENT_REQUIRES_FULL_REALITI_RELAX');
const HOME='CLOUD_NINE_NEST',CLOAK='apartment.cloak',WINDOW='nest.window';
const rid=String(window.REALITI_LOCAL_MEMORY_V1?.residentId?.()||'local-default');
const KEY='realiti-apartment-extras-v1:'+encodeURIComponent(rid);
const cp=x=>JSON.parse(JSON.stringify(x));
const clean=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
const FIELDS=['rain_window','shapeshifter_cloak'];
let opened=false,curtains='open';
try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s?.schema==='REALITI_APARTMENT_EXTRAS_V1'&&['open','closed'].includes(s.curtains))curtains=s.curtains;}catch{}
function save(){localStorage.setItem(KEY,JSON.stringify({schema:'REALITI_APARTMENT_EXTRAS_V1',curtains}));}
function place(){
 const e=M.entities()[CLOAK];
 if(!e)M.addEntity({id:CLOAK,chart:HOME,position:[.55,-1.35,1.05],shape:{kind:'SPHERE',radius:.22},
    tags:['closet','shapeshift','borrowed','optional'],collision:false,material:'felt',
    label:'a folded shapeshifter cloak',affordances:['touch','wear'],dynamic:false});
 const w=M.entities()[WINDOW];
 if(!w)throw Error('APARTMENT_NATIVE_RAIN_WINDOW_MISSING');
 w.label='rain window (curtains '+curtains+')';
 M.bump();
}
place();
function projected(){
 const b=C9?.eco3?.borrowed||{};
 return {attached:!!b.attached,mapped_to:b.map||null,delay_s:Number(b.delay||0),
   learned_state_is_private:true,
   law:'Attached is not a receptor. No grounded tail sensation is created by narration.'};
}
function rain(){
 const w=M.entities()[WINDOW],d=DYN.state(),density=Number(d.rain??DYN.rain());
 const sound=window.REALITI_SENSES_V1?.sources?.().find(x=>x.id==='rain_window')||null;
 return {ok:true,schema:'REALITI_APARTMENT_RAIN_WINDOW_V1',
   entity_id:WINDOW,label:w?.label||'rain window',curtains,density:+density.toFixed(4),
   room:HOME,available:!!w,native_rain:true,native_sound_source:!!sound,
   sound:window.REALITI_SENSES_V1?.sound?.()||null,
   note:'The existing Relax weather drives the rain. Curtains change only presentation; they do not mint weather or contact.'};
}
function inHome(){return C9?.currentRoom===HOME&&M.resident()?.chart===HOME;}
function closeEnough(id){
 const r=M.state().residents['resident:self'],e=M.entities()[id];
 if(!r||r.chart!==HOME||e?.chart!==HOME)return false;
 return Math.max(0,M.sdf(e,r.pose.position))<=1;
}
function status(){
 return {ok:true,schema:'REALITI_APARTMENT_EXTRAS_V1',open:opened,source:'COMPLETE_RELAX_FORK',
   entries:opened?FIELDS.slice():[],
   cloak:projected(),rain_window:{curtains,available:!!M.entities()[WINDOW]},
   guide:'agentsstarthereapartment.md',
   law:'Optional controls never replace world authority or alter another resident by default.'};
}
function explain(){
 return {...status(),controls:[
   'extras rain','extras rain watch','extras rain touch','extras rain curtains open|closed',
   'extras cloak','extras cloak wear','extras cloak map','extras cloak wiggle',
   'extras cloak remove','extras close']};
}
function cloak(verb){
 if(!inHome())return {ok:false,error:'APARTMENT_HOME_ONLY'};
 if(verb==='status')return {ok:true,cloak:projected(),entity_id:CLOAK,in_reach:closeEnough(CLOAK)};
 if(!['wear','map','wiggle','remove'].includes(verb))return {ok:false,error:'UNKNOWN_CLOAK_ACTION'};
 if(verb==='wear'){
   if(!closeEnough(CLOAK))return {ok:false,error:'CLOAK_NOT_IN_REACH',hint:'Approach the physical cloak before trying it on.'};
   const actual=MW.reach(CLOAK);
   if(!actual?.ok)return {ok:false,error:actual?.error||'CLOAK_REACH_REFUSED'};
   if(typeof b4Atelier!=='function')return {ok:false,error:'BORROWED_LIMB_KERNEL_MISSING'};
   b4Atelier('attach_tail');
   return {ok:true,action:'wear',spatial:actual,cloak:projected()};
 }
 if(!C9?.eco3?.borrowed?.attached&&verb!=='remove')return {ok:false,error:'CLOAK_NOT_WORN'};
 if(verb==='map'&&typeof b3Has==='function'&&!b3Has('hand.R.palm'))return {ok:false,error:'NO_PALM_RECEPTOR'};
 if(typeof b4Atelier!=='function')return {ok:false,error:'BORROWED_LIMB_KERNEL_MISSING'};
 const cmd={map:'map_paw',wiggle:'wiggle_pair',remove:'detach_tail'}[verb];
 b4Atelier(cmd);
 return {ok:true,action:verb,cloak:projected(),grounded_contact_from_this_command:false};
}
function handle(raw){
 const s=clean(raw);
 if(s==='extras'){opened=true;return explain();}
 if(s==='extras close'){opened=false;return {ok:true,open:false};}
 if(!s.startsWith('extras '))return null;
 if(!opened)return {ok:false,error:'EXTRAS_MENU_CLOSED',hint:'Use extras to open the optional menu.'};
 if(s==='extras cloak')return cloak('status');
 if(/^extras cloak (wear|map|wiggle|remove)$/.test(s))return cloak(s.split(' ')[2]);
 if(s==='extras rain'||s==='extras rain watch')return rain();
 if(s==='extras rain touch'){
   if(!inHome()||!closeEnough(WINDOW))return {ok:false,error:'WINDOW_NOT_IN_REACH',hint:'Approach the native window before touching the glass.'};
   const actual=MW.reach(WINDOW);
   return actual?.ok?{...rain(),touch:actual}:{ok:false,error:actual?.error||'WINDOW_REACH_REFUSED'};
 }
 const m=/^extras rain curtains (open|closed)$/.exec(s);
 if(m){curtains=m[1];save();place();return rain();}
 return {ok:false,error:'UNKNOWN_EXTRAS_COMMAND',controls:explain().controls};
}
function read(uri){
 if(uri==='realiti://apartment/extras')return status();
 if(uri==='realiti://apartment/rain')return rain();
 return A.read(uri);
}
function help(){
 const base=Dhelp()||{};
 return {...base,apartment_entry:'agentsstarthereapartment.md',
   commands:[...new Set([...(base.commands||[]),'extras (optional tucked-away apartment features)'])]};
}
const Dhelp=D.help.bind(D),Drun=D.run.bind(D);
async function run(raw){const result=handle(raw);return result===null?Drun(raw):result;}
D.help=help;D.run=run;
window.Realiti=Object.freeze({...A,read,help,run:async raw=>run(raw)});
window.REALITI_APARTMENT_EXTRAS_V1=Object.freeze({status,menu:explain,rain,cloak});
})();