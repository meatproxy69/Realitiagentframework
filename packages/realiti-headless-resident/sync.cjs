'use strict';
// Client side of the shared ledger. One sync: exchange heads, push the records the server lacks (signed first), pull
// the records this resident lacks and import them through the client's own verified import, so the same rules hold
// on both sides. Transport is plain HTTP; the server is the dedicated REALITI server package.
async function sync(window,url,{fetchImpl=globalThis.fetch,timeoutMs=20000}={}){
  const L2=window.REALITI_LEDGER_V2;if(!L2)throw new Error('LEDGER_V2_MISSING');
  const base=String(url||'').replace(/\/+$/,'');
  const call=async(p,init)=>{const ctl=new AbortController();const t=setTimeout(()=>ctl.abort(),timeoutMs);try{const r=await fetchImpl(base+p,{...init,signal:ctl.signal});const j=await r.json();if(!r.ok&&j&&j.error)throw new Error(j.error);return j}finally{clearTimeout(t)}};
  await L2.ready();
  const head=await call('/ledger/head');
  await L2.signAll();
  const out=L2.delta(head);
  const pushed=out.records.length?await call('/ledger/push',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({records:out.records})}):{imported:0,accepted:0,rejected:0,rejections:[]};
  const mine=L2.head();
  const pull=await call('/ledger/delta?clock='+encodeURIComponent(JSON.stringify(mine.clock)));
  const pulled=await L2.import(pull.records||[]);
  return {ok:true,server:{records:head.records,authors:Object.keys(head.clock||{}).length},pushed:{sent:out.records.length,accepted:pushed.accepted??pushed.imported??0,rejected:pushed.rejected||0,rejections:pushed.rejections||[]},pulled:{received:(pull.records||[]).length,imported:pulled.imported,rejected:pulled.rejected,rejections:pulled.rejections||[]},clock:L2.clock()};
}
module.exports={sync};
