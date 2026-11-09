// Browser-only Three.js visual adapter. Matrix owns all physics and state.
import {WebGLRenderer,Scene,Color,OrthographicCamera,PerspectiveCamera,AmbientLight,
 DirectionalLight,BoxGeometry,SphereGeometry,PlaneGeometry,CapsuleGeometry,
 Mesh,MeshStandardMaterial,Vector3,Quaternion} from 'three';
function mount(){
 if(document.getElementById('realiti-visual'))return;
 const read=window.REALITI_APARTMENT_VISUAL_V0?.snapshot;
 const refs=window.REALITI_APARTMENT_REFERENCE_CAMERAS_V0;
 const actionAPI=window.REALITI_APARTMENT_VISUAL_INPUT_V0;
 if(!read||!refs||!actionAPI)throw Error('MATRIX_VISUAL_READER_REQUIRED');
 const controller=actionAPI.createController({door:window.REALITI_AGENT_DOOR,snapshot:read});
 let state=read();if(state.chart!=='CLOUD_NINE_NEST')throw Error('ONE_HOME_REQUIRED');
 const panel=document.createElement('section');panel.id='realiti-visual';
 panel.style.cssText='position:fixed;inset:3vh 3vw;z-index:99999;background:#141b2a;color:#f7efff;border:1px solid #777;border-radius:14px;padding:12px;display:flex;flex-direction:column;font:13px system-ui';
 const bar=document.createElement('div'),surface=document.createElement('div'),gallery=document.createElement('div');
 surface.style.cssText='flex:1;min-height:260px;overflow:hidden';
 gallery.style.cssText='display:none;grid-template-columns:1fr 1fr;gap:8px;overflow:auto';
 const explorer=document.createElement('div'),targets=document.createElement('select');
 const approach=document.createElement('button'),feedback=document.createElement('span');
 explorer.hidden=true;explorer.style.cssText='padding:7px 0;display:flex;align-items:center;gap:7px;flex-wrap:wrap';
 targets.setAttribute('aria-label','Matrix object to approach');
 targets.style.cssText='background:#27334b;color:#f7eefa;padding:6px;max-width:240px;border:1px solid #737b92;border-radius:7px';
 approach.textContent='Approach';approach.type='button';
 approach.style.cssText='padding:7px;background:#344567;color:white;border-radius:8px;cursor:pointer';
 feedback.setAttribute('role','status');feedback.style.cssText='font-size:12px;color:#d1c7d9';
 explorer.append(targets,approach,feedback);
 panel.append(bar,surface,explorer,gallery);document.body.append(panel);
 let renderer;
 try{renderer=new WebGLRenderer({antialias:true,preserveDrawingBuffer:true,powerPreference:'low-power'})}
 catch(e){panel.remove();throw Error('WEBGL_UNAVAILABLE:'+e.message)}
 renderer.setPixelRatio(Math.min(1.5,window.devicePixelRatio||1));
 surface.append(renderer.domElement);
 renderer.domElement.style.cssText='width:100%;height:100%;display:block';
 const scene=new Scene();scene.background=new Color('#171d2c');
 scene.add(new AmbientLight(0xffffff,1.55));
 const sun=new DirectionalLight(0xffe0ba,2);sun.position.set(-4,3,12);scene.add(sun);
 const geometryCache=new Map(),materialCache=new Map(),objects=new Map();
 const vec=p=>new Vector3(p[0],p[1],p[2]);
 function geometry(e){
  const s=e.shape;
  if(s.kind==='BOX'||s.kind==='VOLUME')return new BoxGeometry(...s.halfExtents.map(x=>x*2));
  if(s.kind==='SPHERE'||s.kind==='POINT')return new SphereGeometry(s.radius,12,8);
  if(s.kind==='PLANE')return new PlaneGeometry(state.bounds.halfExtents[0]*2,state.bounds.halfExtents[1]*2);
  if(s.kind==='CAPSULE'){const g=new CapsuleGeometry(s.radius,s.height-2*s.radius,3,8);g.rotateX(Math.PI/2);return g}
  return null;
 }
 const palette={wood:'#99765b',blanket:'#bea4b5',glass:'#73bacb',cardboard:'#b68d67',
  longfur:'#b7ada7',paper:'#ded4ba',metal:'#b0b4bd',teal:'#64aba7',
  rose:'#cf95a9',plum:'#94709b',moss:'#78946d',midnight:'#414968',amber:'#e4b66c'};
 function material(e,spectator=true){
  const accent=e.tags.find(t=>t.startsWith('accent:'))?.slice(7);
  const shade=palette[accent]||palette[e.material]||'#b1aaa4';
  const opacity=e.tags.includes('wall')?(spectator?.23:1):e.material==='glass'?.44:1;
  const key=shade+':'+opacity;
  if(!materialCache.has(key))materialCache.set(key,new MeshStandardMaterial({
   color:shade,roughness:.85,transparent:opacity!==1,opacity,
   depthWrite:opacity===1,side:2}));
  return materialCache.get(key);
 }
 function apply(snapshot){
  const chosen=targets.value;
  targets.replaceChildren();
  for(const e of snapshot.entities){
   if(e.tags.some(x=>['floor','wall','ceiling','portal','doorway'].includes(x)))continue;
   const option=document.createElement('option');
   option.value=e.id;option.textContent=e.label||e.id;targets.append(option);
  }
  if([...targets.options].some(x=>x.value===chosen))targets.value=chosen;
  else if([...targets.options].some(x=>x.value==='nest.window'))targets.value='nest.window';
  const seen=new Set();
  for(const e of snapshot.entities){
   seen.add(e.id);
   const key=JSON.stringify(e.shape),old=objects.get(e.id);
   let item=old;
   if(!old||old.key!==key){
    if(old)scene.remove(old.mesh);
    if(!geometryCache.has(key))geometryCache.set(key,geometry(e));
    const g=geometryCache.get(key);if(!g)continue;
    item={key,mesh:new Mesh(g,material(e))};
    scene.add(item.mesh);objects.set(e.id,item);
   }
   item.mesh.position.copy(vec(e.position));
   item.mesh.quaternion.set(...e.rotation);
   item.mesh.material=material(e);
   item.entity=e;
  }
  for(const [id,item] of objects)if(!seen.has(id)){scene.remove(item.mesh);objects.delete(id)}
 }
 const ortho=new OrthographicCamera(-15,15,9.7,-9.7,.1,150);
 const eye=new PerspectiveCamera(65,1,.1,100);
 ortho.up.set(0,0,1);eye.up.set(0,0,1);
 let selection='NE',signature='',poll=null;
 function viewCamera(id,aspect){
  if(id==='resident'){
   const p=vec(state.viewer.position),q=new Quaternion(...state.viewer.rotation);
   const lift=state.viewer.posture==='lying'?.16:.52;
   const origin=p.clone().add(new Vector3(0,0,lift));
   const direction=new Vector3(0,1,0).applyQuaternion(q);
   eye.position.copy(origin);eye.lookAt(origin.clone().add(direction));
   eye.aspect=aspect;eye.updateProjectionMatrix();return eye;
  }
  const ref=refs.referenceViews(state).find(v=>v.id===id);
  if(!ref)throw Error('UNKNOWN_REFERENCE_CAMERA');
  const h=ref.frame.halfHeight;
  ortho.left=-h*aspect;ortho.right=h*aspect;ortho.top=h;ortho.bottom=-h;
  ortho.updateProjectionMatrix();ortho.position.copy(vec(ref.position));
  ortho.lookAt(vec(ref.target));return ortho;
 }
 function visualMaterials(mode){
  for(const item of objects.values()){
   const e=item.entity;
   item.mesh.visible=!(mode!=='resident'&&e.tags.includes('ceiling'));
   item.mesh.material=material(e,mode!=='resident');
  }
 }
 function render(){
  if(!renderer||document.hidden)return;
  visualMaterials(selection);
  const w=Math.max(1,surface.clientWidth),h=Math.max(1,surface.clientHeight);
  renderer.setSize(w,h,false);renderer.render(scene,viewCamera(selection,w/h));
 }
 function refresh(){
  if(!renderer||document.hidden)return;
  const next=read();
  const marker=JSON.stringify([next.matrix_revision,next.viewer,
   next.entities.map(e=>[e.id,e.shape,e.position,e.rotation,e.material,e.tags])]);
  if(marker===signature)return;
  signature=marker;state=next;apply(next);render();
 }
 function choose(id){
  selection=id;gallery.style.display='none';
  explorer.hidden=id!=='resident';explorer.style.display=id==='resident'?'flex':'none';
  feedback.textContent=id==='resident'
   ?'W/S or arrows to walk · A/D to turn · Matrix resolves all movement'
   :'Spectator camera only — resident position unchanged';
  render();
 }
 async function act(promise){
  const outcome=await promise;
  feedback.textContent=outcome.ok
   ?(outcome.changed?'Matrix updated · revision '+outcome.matrix_revision:'No Matrix movement')
   :('Refused: '+(outcome.reason||outcome.error||'UNKNOWN'));
  refresh();
 }
 function keyboard(e){
  if(e.key==='Escape'){close();return}
  if(selection!=='resident'||e.repeat||e.ctrlKey||e.altKey||e.metaKey)return;
  if(/^(?:INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName||'')||e.target?.isContentEditable)return;
  if(!actionAPI.keyCommand(e.key))return;
  e.preventDefault();
  if(controller.busy())return;
  act(controller.key(e.key));
 }
 approach.addEventListener('click',()=>{
  if(controller.busy()||selection!=='resident')return;
  act(controller.approach(targets.value));
 });
 function captureFour(){
  refresh();
  const pixel=renderer.getPixelRatio(),w=surface.clientWidth,h=surface.clientHeight;
  const shots=[];
  try{
   renderer.setPixelRatio(1);
   for(const ref of refs.referenceViews(state)){
    renderer.setSize(ref.frame.width,ref.frame.height,false);
    visualMaterials(ref.id);
    renderer.render(scene,viewCamera(ref.id,ref.frame.width/ref.frame.height));
    shots.push({id:ref.id,label:ref.label,png:renderer.domElement.toDataURL('image/png')});
   }
  }finally{renderer.setPixelRatio(pixel);renderer.setSize(w,h,false);render()}
  gallery.replaceChildren();
  for(const shot of shots){
   const figure=document.createElement('figure'),img=document.createElement('img');
   const caption=document.createElement('figcaption');
   figure.style.margin='0';img.style.width='100%';
   img.src=shot.png;img.alt=shot.label+' fixed view';
   caption.textContent=shot.label;figure.append(img,caption);
   img.addEventListener('click',()=>choose(shot.id));gallery.append(figure);
  }
  gallery.style.display='grid';
 }
 function close(){
  clearInterval(poll);window.removeEventListener('resize',render);
  document.removeEventListener('visibilitychange',visible);
  window.removeEventListener('keydown',keyboard);
  for(const g of geometryCache.values())g?.dispose();
  for(const m of materialCache.values())m.dispose();
  renderer.dispose();renderer.forceContextLoss();renderer=null;panel.remove();
 }
 function visible(){if(!document.hidden){refresh();render()}}
 function button(text,action){
  const b=document.createElement('button');b.type='button';b.textContent=text;
  b.style.cssText='border:1px solid #888;border-radius:8px;background:#2b324c;color:#fff;padding:7px;margin:2px;cursor:pointer';
  b.addEventListener('click',action);bar.append(b);
 }
 button('NE',()=>choose('NE'));button('NW',()=>choose('NW'));
 button('SW',()=>choose('SW'));button('SE',()=>choose('SE'));
 button('Resident eye',()=>choose('resident'));
 button('4 reference views',captureFour);button('Close',close);
 const info=document.createElement('p');
 info.textContent='One Matrix scene. Reference cameras are spectator-only, not resident vision.';
 panel.append(info);
 window.addEventListener('resize',render);
 window.addEventListener('keydown',keyboard);
 document.addEventListener('visibilitychange',visible);
 refresh();render();
 poll=setInterval(refresh,750); // No GPU frames at unchanged world state.
}
Object.defineProperty(window,'REALITI_APARTMENT_THREE_V0',{
 value:Object.freeze({mount,referenceIds:Object.freeze(['NE','NW','SW','SE'])})});
