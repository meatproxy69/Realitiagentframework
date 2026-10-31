// Derived Apartment HOME candidate only. Preserve REALITI Relax's original
// Matrix SDF math and kinematic kernel. Guard *registration* of historical
// charts/entities/portals from the first execution of the original kernel,
// rather than creating 23 worlds and deleting 22 at the end of startup.
// Source anchors are exact/unique; canonical source/scripts/57.js is untouched.
export function adaptNativeHomeBoot(original){
 if(typeof original!=='string'||!original.includes('window.REALITI_MATRIX_V1'))
  throw Error('HOME_NATIVE_BOOT_ORIGINAL_MATRIX_KERNEL_MISSING');
 const patch=(before,after,id)=>{
  if(original.split(before).length!==2)
   throw Error('HOME_NATIVE_BOOT_SOURCE_ANCHOR_DRIFT:'+id);
  original=original.replace(before,after);
 };
 patch("(()=>{\n'use strict';",
  "(()=>{\n'use strict';\n// Apartment-only home-first launch flag: set before Matrix world scripts execute.\nwindow.REALITI_APARTMENT_HOME_FIRST_CANDIDATE=true;\nwindow.REALITI_APARTMENT_NATIVE_BOOT_V1=Object.freeze({schema:'REALITI_APARTMENT_NATIVE_BOOT_V1',mode:'PRE_REGISTRATION_HOME_ONLY',home:'CLOUD_NINE_NEST',source_kernel_preserved:true});",
  'early_home_first_configuration');
 patch("function define(chart,def){charts[chart]=",
  "function define(chart,def){if(chart!=='CLOUD_NINE_NEST')return null;charts[chart]=",
  'only_define_actual_home_chart');
 patch("function addEntity(e){const rec=",
  "function addEntity(e){if(e.chart!=='CLOUD_NINE_NEST'&&!(e.resident===true&&e.chart==null))return null;const rec=",
  'only_register_real_home_entities_and_transient_resident_bootstrap');
 patch("function definePortal(p){const rec=",
  "function definePortal(p){return null;const rec=",
  'zero_spatial_portals_at_source_registration');
 return original;
}
