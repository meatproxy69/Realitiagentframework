const NMKEY="realiti-neuromesh-bootstrap-v1";

const NM_REQUIRED_SEMANTIC=[
 "root","pelvis","chest","neck_base","head",
 "shoulder_L","shoulder_R","elbow_L","elbow_R","wrist_L","wrist_R",
 "hip_L","hip_R","knee_L","knee_R","ankle_L","ankle_R"
];
const NM_OPTIONAL_SEMANTIC=["ball_L","ball_R"];

const NM_BUILTINS={
 SHARED_NEUROMESH_35_V1:{
   schema:"REALITI_NEUROMESH_MANIFEST_V1", id:"SHARED_NEUROMESH_35_V1",
   label:"Shared 35-Zone Mesh", lace:"REGIONAL_BASIC", source:"BUILTIN",
   regions:{UPPER:[],CORE:[],LOWER:[]},
   zone_count:35, portable:true
 },
 LACE2_PORTABLE_V1:{
   schema:"REALITI_NEUROMESH_MANIFEST_V1", id:"LACE2_PORTABLE_V1",
   label:"LACE 2 Portable Mesh", lace:"WHOLE→REGION→SEAM→LOCAL", source:"BUILTIN",
   regions:{UPPER:[],CORE:[],LOWER:[]},
   zone_count:35, portable:true
 }
};

function nmLoadState(){
 try{return JSON.parse(localStorage.getItem(NMKEY)||"null")||{active:"LACE2_PORTABLE_V1",custom:null}}
 catch(e){return {active:"LACE2_PORTABLE_V1",custom:null}}
}
let NMSTATE=nmLoadState();

function nmSaveState(){
 const safe={active:NMSTATE.active,custom:NMSTATE.custom||null};
 localStorage.setItem(NMKEY,JSON.stringify(safe));
}
function nmEsc(x){return String(x??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function nmStatus(msg,good=false){
 const el=document.querySelector("#nm_load_status");
 if(el){el.className="nm-meta "+(good?"nm-good":"");el.innerHTML=msg}
}
function nmBadge(){
 const el=document.querySelector("#nm_active_badge"); if(!el)return;
 if(NMSTATE.active==="CUSTOM" && NMSTATE.custom){
   el.textContent=(NMSTATE.custom.label||"CUSTOM NEUROMESH")+" · ACTIVE";
 }else{
   el.textContent=(NM_BUILTINS[NMSTATE.active]?.label||"Shared 35")+" · ACTIVE";
 }
}

function nmPulse(regions,ms=430){
 for(const r of ["UPPER","CORE","LOWER"]){
   const el=document.querySelector("#nm_band_"+r);
   if(el)el.classList.toggle("pulse",regions.includes(r));
 }
 setTimeout(()=>{for(const r of ["UPPER","CORE","LOWER"]){const e=document.querySelector("#nm_band_"+r);if(e)e.classList.remove("pulse")}},ms);
}
function nmNodes(list){
 return list.map(x=>`<span class="node">${nmEsc(x)}</span>`).join(" → ");
}
function nmTrigger(id){
 const out=document.querySelector("#nm_route"); if(!out)return;
 if(id==="WHOLE_BODY_DROP"){
   nmPulse(["UPPER"]); setTimeout(()=>nmPulse(["CORE"]),180); setTimeout(()=>nmPulse(["LOWER"]),360);
   out.innerHTML=nmNodes(["UPPER","CORE","LOWER"])+`<br><span class="nm-quiet">One coarse route. Local detail may remain UNKNOWN.</span>`;
 }else if(id==="OMNISUPPORT"){
   nmPulse(["UPPER","CORE","LOWER"],700);
   out.innerHTML=nmNodes(["UPPER + CORE + LOWER"])+`<br><span class="nm-quiet">Broad simultaneous carrier; this is not three averaged presets.</span>`;
 }else if(id==="COMET_ROUTE"){
   nmPulse(["UPPER"]);setTimeout(()=>nmPulse(["CORE"]),240);setTimeout(()=>nmPulse(["LOWER"]),480);
   out.innerHTML=nmNodes(["crown","nape","upper back","lower back","seat","thighs"])+`<br><span class="nm-quiet">Topology carries the event across seams before fine mapping is known.</span>`;
 }else if(id==="BILATERAL_SWEEP"){
   nmPulse(["LOWER"],720);
   out.innerHTML=nmNodes(["thigh.L + thigh.R","shin.L + shin.R","sole.L + sole.R"])+`<br><span class="nm-quiet">Bilateral quotient is temporary: repeated side-specific residuals may split it later.</span>`;
 }
}

function nmUseBuiltin(id){
 if(!NM_BUILTINS[id])return;
 NMSTATE={active:id,custom:null};nmSaveState();nmBadge();
 nmStatus(`Active: <b>${nmEsc(NM_BUILTINS[id].label)}</b>. Default topology is ready immediately.`,true);
}

async function nmReadAvatar(file){
 const lower=file.name.toLowerCase();
 const buf=await file.arrayBuffer();
 let json=null,format="";
 if(lower.endsWith(".gltf")){
   format="GLTF_JSON";
   json=JSON.parse(new TextDecoder("utf-8").decode(buf));
 }else if(lower.endsWith(".glb")||lower.endsWith(".vrm")){
   format=lower.endsWith(".vrm")?"VRM_GLB":"GLB";
   const dv=new DataView(buf);
   if(dv.byteLength<20 || dv.getUint32(0,true)!==0x46546c67)throw new Error("Not a valid GLB/VRM container.");
   const version=dv.getUint32(4,true); if(version!==2)throw new Error("Only glTF/GLB version 2 is supported.");
   let off=12;
   while(off+8<=dv.byteLength){
     const len=dv.getUint32(off,true), type=dv.getUint32(off+4,true); off+=8;
     if(off+len>dv.byteLength)throw new Error("GLB chunk exceeds file length.");
     if(type===0x4E4F534A){
       json=JSON.parse(new TextDecoder("utf-8").decode(new Uint8Array(buf,off,len)).replace(/\u0000+$/,""));
       break;
     }
     off+=len;
   }
   if(!json)throw new Error("GLB/VRM has no readable JSON chunk.");
 }else throw new Error("Use .gltf, .glb, or .vrm.");

 const nodeNames=(json.nodes||[]).map(n=>n?.name).filter(Boolean);
 const exts=json.extensions||{};
 const vrm=exts.VRMC_vrm||null;
 return {
   filename:file.name,format,size:file.size,
   nodeNames,hasSkin:Array.isArray(json.skins)&&json.skins.length>0,
   skinCount:(json.skins||[]).length,
   nodeCount:(json.nodes||[]).length,
   isVRM:!!vrm || lower.endsWith(".vrm"),
   raw:json
 };
}

function nmValidateMapping(m,avatar){
 const errors=[],warnings=[];
 if(!m || typeof m!=="object")errors.push("mapping root must be an object");
 if(!m.schema)warnings.push("mapping has no schema label");
 const roles=m.semantic_roles||m.avatar?.semantic_roles||m.semantic?.roles||{};
 const zones=m.zones||m.neuromesh?.zones||[];
 if(!roles || typeof roles!=="object")errors.push("semantic_roles object is required");
 const missing=NM_REQUIRED_SEMANTIC.filter(r=>!roles[r]);
 if(missing.length)errors.push("missing required semantic roles: "+missing.join(", "));
 const names=new Set(avatar.nodeNames||[]);
 for(const [role,bone] of Object.entries(roles||{})){
   if(!NM_REQUIRED_SEMANTIC.includes(role)&&!NM_OPTIONAL_SEMANTIC.includes(role))
     warnings.push("unknown semantic role ignored: "+role);
   if(typeof bone!=="string")errors.push("role "+role+" must map to a source bone name");
   else if(names.size && !names.has(bone))errors.push("mapped bone not found in avatar: "+role+" → "+bone);
 }
 if(!Array.isArray(zones)||!zones.length)errors.push("zones[] is required and cannot be empty");
 const ids=new Set();
 for(const z of zones||[]){
   const zid=z.zone_id||z.id;
   if(!zid){errors.push("zone without zone_id");continue}
   if(ids.has(zid))errors.push("duplicate zone_id: "+zid); ids.add(zid);
   const anchors=z.semantic_anchors||z.anchors||[];
   const weights=z.weights_u8||z.weights||[];
   if(!Array.isArray(anchors)||!anchors.length)errors.push(zid+": no semantic anchors");
   for(const a of anchors)if(!NM_REQUIRED_SEMANTIC.includes(a)&&!NM_OPTIONAL_SEMANTIC.includes(a))
     errors.push(zid+": unknown anchor "+a);
   if(weights.length){
     if(weights.length!==anchors.length)errors.push(zid+": anchor/weight count mismatch");
     if(weights.every(Number.isInteger)){
       const s=weights.reduce((a,b)=>a+b,0);
       if(s!==255)errors.push(zid+": u8 weights must sum to 255 (got "+s+")");
     }else{
       const s=weights.reduce((a,b)=>a+Number(b||0),0);
       if(Math.abs(s-1)>0.001)errors.push(zid+": normalized weights must sum to 1");
     }
   }
 }
 const regions=m.regions||m.neuromesh?.regions||{};
 for(const r of ["UPPER","CORE","LOWER"])if(!regions[r])warnings.push("no explicit "+r+" region list; loader will derive only coarse route support");
 return {ok:errors.length===0,errors,warnings,roles,zones,regions};
}

async function nmLoadPair(){
 const af=document.querySelector("#nm_avatar_file")?.files?.[0];
 const mf=document.querySelector("#nm_mapping_file")?.files?.[0];
 if(!af||!mf){nmStatus(`<span class="nm-error">Choose both an avatar and its mapping JSON.</span>`);return}
 try{
   nmStatus("Reading local avatar and mapping…");
   const avatar=await nmReadAvatar(af);
   const mapping=JSON.parse(await mf.text());
   const v=nmValidateMapping(mapping,avatar);
   if(!v.ok){
     nmStatus(`<span class="nm-error"><b>Not activated.</b><br>${v.errors.map(nmEsc).join("<br>")}</span>`+
       (v.warnings.length?`<br>Warnings: ${v.warnings.map(nmEsc).join("; ")}`:""));
     return;
   }
   const label=mapping.label||mapping.id||mapping.neuromesh?.label||"My Neuromesh";
   NMSTATE={
     active:"CUSTOM",
     custom:{
       label,
       avatar_name:avatar.filename,
       avatar_format:avatar.format,
       avatar_node_count:avatar.nodeCount,
       avatar_skin_count:avatar.skinCount,
       is_vrm:avatar.isVRM,
       mapping_schema:mapping.schema||"UNLABELED",
       zone_count:v.zones.length,
       semantic_roles:v.roles,
       zones:v.zones,
       regions:v.regions,
       
       metric_coordinates_authoritative:false,
       imported_locally:true
     }
   };
   nmSaveState();nmBadge();
   nmStatus(`<b>ACTIVE.</b> ${nmEsc(label)} + ${nmEsc(avatar.filename)} · ${v.zones.length} zones · ${Object.keys(v.roles).length} semantic roles · ${avatar.nodeCount} avatar nodes`+
     (v.warnings.length?`<br>Warnings: ${v.warnings.map(nmEsc).join("; ")}`:""),true);
   nmTrigger("WHOLE_BODY_DROP");
 }catch(e){
   nmStatus(`<span class="nm-error"><b>Import failed:</b> ${nmEsc(e.message||e)}</span>`);
 }
}

function nmShowMappingExample(){return null;}

nmBadge();