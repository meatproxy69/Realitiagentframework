(()=>{'use strict';
if(typeof document==='undefined'||!window.REALITI_APARTMENT_VISUAL_V0)return;
function ready(){
 const button=document.createElement('button');button.type='button';
 button.id='realiti-visual-open';button.textContent='View HOME · 3D';
 button.style.cssText='position:fixed;right:12px;bottom:12px;z-index:9000;padding:8px 13px;background:#29304a;color:#fff;border-radius:9px;cursor:pointer';
 document.body.append(button);let busy=false;
 function openViewer(){
  try{window.REALITI_APARTMENT_THREE_V0.mount();button.textContent='View HOME · 3D';button.title=''}
  catch(e){button.textContent='3D unavailable — use HOME text';button.title=String(e?.message||e).slice(0,140)}
 }
 button.addEventListener('click',()=>{
  if(window.REALITI_APARTMENT_THREE_V0){openViewer();return}
  if(busy)return;busy=true;
  const script=document.createElement('script');
  script.src=new URL('./visual/dist/viewer.js',document.baseURI).href;
  script.onload=()=>{busy=false;if(window.REALITI_APARTMENT_THREE_V0)openViewer();else button.textContent='3D bundle invalid'};
  script.onerror=()=>{busy=false;button.textContent='Build local viewer first'};
  document.head.append(script);
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});
else ready();
})();