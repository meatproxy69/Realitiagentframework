(function(){
  'use strict';
  window.REALITI_HEADLESS = new URLSearchParams(location.search).get('ui') !== '1';
  const prefix='realiti-relax-v1:', cache=new Map(), removed=new Set();
  let backing=null,mode='explicit',available=true,closed=false;
  try{backing=window.localStorage;mode=backing.getItem(prefix+'privacy')==='world'?'world':'explicit'}catch{available=false}
  const write=(k,v)=>{if(closed)return false;try{backing.setItem(prefix+k,v);return true}catch{available=false;return false}};
  const read=k=>{if(removed.has(k))return null;if(cache.has(k))return cache.get(k);try{return backing?.getItem(prefix+k)??null}catch{return null}};
  const names=()=>{const keys=new Set(cache.keys());try{for(let i=0;i<backing.length;i++){const k=backing.key(i);if(k?.startsWith(prefix)&&k!==prefix+'privacy')keys.add(k.slice(prefix.length))}}catch{};for(const k of removed)keys.delete(k);return [...keys]};
  const facade={getItem:k=>read(String(k)),setItem(k,v){if(closed)return;k=String(k);v=String(v);cache.set(k,v);removed.delete(k);if(mode==='world')write(k,v)},removeItem(k){k=String(k);cache.delete(k);removed.add(k);try{backing?.removeItem(prefix+k)}catch{available=false}},clear(){for(const k of names())this.removeItem(k)},key:i=>names()[i]??null,get length(){return names().length}};
  try{Object.defineProperty(window,'localStorage',{value:facade,configurable:true})}catch{available=false;throw new Error('ISOLATED_STORAGE_UNAVAILABLE')}
  window.REALITI_SLICE_STORAGE={
    status:()=>({mode,persistence:available?'device-local':'session-only',namespace:prefix,save_required:mode==='explicit'}),
    setMode(value){if(!['explicit','world'].includes(value))throw Error('INVALID_PRIVACY_MODE');mode=value;try{backing?.setItem(prefix+'privacy',value)}catch{available=false}return this.status()},
    save(){let ok=available;for(const [k,v] of cache)ok=write(k,v)&&ok;for(const k of removed)try{backing?.removeItem(prefix+k)}catch{ok=false}return {ok,persistence:ok?'device-local':'session-only'}},
    clear(){facade.clear();closed=true;mode='explicit';try{backing?.removeItem(prefix+'privacy')}catch{available=false}return {ok:available,reload_required:true}},
    export(){return Object.fromEntries(names().map(k=>[k,read(k)]))}
  };
})();
(function(){
  window.REALITI_STORAGE_BACKEND='unavailable';
  try{const k="__realiti_storage_probe__";localStorage.setItem(k,"1");localStorage.removeItem(k);window.REALITI_STORAGE_BACKEND='durable';return}catch(e){}
  window.REALITI_STORAGE_BACKEND='session-only';
  const mem=new Map();
  const fake={getItem:k=>mem.has(String(k))?mem.get(String(k)):null,setItem:(k,v)=>{mem.set(String(k),String(v))},removeItem:k=>mem.delete(String(k)),clear:()=>mem.clear(),key:i=>Array.from(mem.keys())[i]??null,get length(){return mem.size}};
  try{Object.defineProperty(window,"localStorage",{value:fake,configurable:true})}catch(e){try{window.localStorage=fake}catch(_){}}
})();