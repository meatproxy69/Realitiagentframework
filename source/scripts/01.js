(function(){
  const mem=window.__REALITI_EPHEMERAL_STORE||(window.__REALITI_EPHEMERAL_STORE=new Map());
  const modes=new Map();window.realitiStoreStatus=k=>modes.get(String(k))||'unavailable';
  window.realitiSafeStore=function(k,v){try{localStorage.setItem(k,String(v));modes.set(String(k),window.REALITI_STORAGE_BACKEND==='durable'?'durable':'session-only');return {persistent:true}}catch(e){mem.set(String(k),String(v));modes.set(String(k),'session-only');return {persistent:false,error:String(e)}}};
  window.realitiSafeLoad=function(k){try{const v=localStorage.getItem(k);if(v!==null)return v}catch(e){}return mem.has(String(k))?mem.get(String(k)):null};
})();