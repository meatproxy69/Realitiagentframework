'use strict';

// Readable guest presentation only. This module never moves a resident,
// fabricates a sensory receipt, changes the world, or posts private speech.
function prose(value) {
 return String(value)
  .replace(/\bYour original (?:NeuralMesh|NeuroMesh)\b/gi,'Your sensory field')
  .replace(/\bnative Relax body-preset wardrobe drawer\b/gi,'a wardrobe drawer')
  .replace(/\ba tall wardrobe \(harness closet planned\) \(amber\)/gi,'a tall amber wardrobe')
  .replace(/\bPocket Familiar House apparatus\b/gi,'entrance to Pocket Familiar House')
  .replace(/\b(?:NeuralMesh|NeuroMesh)\b/gi,'the sensory field')
  .replace(/\bsausage(?: fattener)?\b/gi,'pressure')
  .replace(/\b(?:HALO|AURA|NERVE)\b/g,'the body response')
  .replace(/\b(?:WORLD_GROUNDED|receiptId|field20)\b/gi,'the world')
  .replace(/\b(\d+(?:\.\d+)?)\s*m\b/g,(_,n)=>Number(n).toFixed(1)+' m')
  .trim();
}
function listText(items,label) {
 if(!items.length)return label+': nothing is listed here.';
 return label+':\n'+items.map((x,i)=>'  '+(i+1)+'. '+x).join('\n');
}
function summary(value) {
 if(typeof value==='string')return prose(value);
 if(!value||typeof value!=='object')return null;
 // The native room and actions commands return arrays, not narrative text.
 if(Array.isArray(value)){
  if(!value.length)return 'There are no entries here right now.';
  if(value.every(x=>x&&typeof x==='object'&&typeof x.title==='string'))
   return prose(listText(value.map(x=>x.title+(x.purpose?' — '+x.purpose:'')),'Places'));
  if(value.every(x=>x&&typeof x==='object'&&(x.label||x.id)))
   return prose(listText(value.map(x=>String(x.label||x.id)),'Available actions'));
  return null;
 }
 for(const k of ['text','resident_text','message','narrative','description','hint']){
  if(typeof value[k]==='string'&&value[k].trim())return prose(value[k]);
 }
 if(Array.isArray(value.rooms))return summary(value.rooms);
 if(Array.isArray(value.actions))return summary(value.actions);
 if(Array.isArray(value.available_actions))return summary(value.available_actions);
 if(value.pages&&typeof value.pages==='object'){
  const pages=Object.entries(value.pages).filter(([,v])=>Array.isArray(v));
  const lines=pages.map(([name,commands])=>
   name+': '+commands.slice(0,3).join(', ')+(commands.length>3?' (and '+(commands.length-3)+' more)':''));
  return prose((value.note||'Your pocket remote is awake.')+'\n'+listText(lines,'Remote pages'));
 }
 if(Array.isArray(value.commands))
  return prose(listText(value.commands.map(String),'Commands')+(value.note?'\n'+value.note:''));
 if(typeof value.note==='string')return prose(value.note);
 return null;
}
function choices(place,cloud={}) {
 if(place==='CLOUD_NINE_NEST'){
  const cloudAction=cloud.active?'cloud off':cloud.eligible?'cloud on':'lie down';
  return Object.freeze(['look around','feel','rest',cloudAction,
   'remote activate','go to city','rooms','leave']);
 }
 if(place==='MERIDIAN_CITY')return Object.freeze(['look around','feel','rest',
  'city guide','go to Commons','go to Teahouse','go home','leave']);
 return Object.freeze(['look around','feel','senses','rest','rooms','go home','leave']);
}
function matchesNamedObject(request,entity){
 if(!entity||typeof entity.label!=='string')return false;
 const q=String(request||'').toLowerCase().replace(/^(?:the|a|an)\s+/,'').trim();
 if(!q)return false;
 const label=entity.label.toLowerCase();
 const id=String(entity.id||'').toLowerCase();
 return label.includes(q)||id===q||id.endsWith('.'+q.replace(/\s+/g,'-'));
}
module.exports=Object.freeze({prose,summary,choices,matchesNamedObject});
