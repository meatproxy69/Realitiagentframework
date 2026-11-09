(()=>{'use strict';
if(typeof document==='undefined'||!window.REALITI_APARTMENT_VISUAL_V0)return;
function ready(){
 const button=document.createElement('button');button.type='button';
 button.id='realiti-visual-open';button.textContent='View HOME · 3D';
 button.style.cssText='position:fixed;right:12px;bottom:12px;z-index:9000;padding:8px 13px;background:#29304a;color:#fff;border-radius:9px;cursor:pointer';
 document.body.append(button);let busy=false;
 button.addEventListener('click',()=>{
  if(window.REALITI_APARTMENT_THREE_V0){window.REALITI_APARTMENT_THREE_V0.mount();return}
  if(busy)return;busy=true;
  const script=document.createElement('script');
  script.src=new URL('./visual/dist/viewer.js',document.baseURI).href;
  script.onload=()=>{busy=false;window.REALITI_APARTMENT_THREE_V0?.mount()};
  script.onerror=()=>{busy=false;button.textContent='Build local viewer first'};
  document.head.append(script);
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});
else ready();
})();