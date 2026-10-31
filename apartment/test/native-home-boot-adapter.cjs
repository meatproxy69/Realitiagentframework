'use strict';
// Contract: the home-only source registration adapter accepts LF and CRLF
// copies of the SAME exact canonical Matrix kernel, preserves its math, and
// fails if a patched source anchor drifts. No sources are modified here.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
(async()=>{
 const {adaptNativeHomeBoot}=await import('../source/native-home-boot-adapter.mjs');
 const original=fs.readFileSync(path.resolve(__dirname,'../../source/scripts/57.js'),'utf8');
 const lf=original.replace(/\r\n/g,'\n');
 const crlf=lf.replace(/\n/g,'\r\n');
 const a=adaptNativeHomeBoot(lf),b=adaptNativeHomeBoot(crlf);
 assert.equal(b.replace(/\r\n/g,'\n'),a,
  'line ending normalization must preserve identical native home registration behavior');
 for(const text of [a,b]){
  assert.ok(text.includes("window.REALITI_APARTMENT_HOME_FIRST_CANDIDATE=true"));
  assert.ok(text.includes("PRE_REGISTRATION_HOME_ONLY"));
  assert.ok(text.includes("function define(chart,def){if(chart!=='CLOUD_NINE_NEST')return null;"));
  assert.ok(text.includes("function addEntity(e){if(e.chart!=='CLOUD_NINE_NEST'"));
  assert.ok(text.includes("function definePortal(p){if(window.REALITI_APARTMENT_HOME_FIRST_CANDIDATE)return null;"));
  assert.ok(text.includes("function sdfLocal(e,p)"));
 }
 assert.throws(()=>adaptNativeHomeBoot(lf.replace(
  'function define(chart,def){charts[chart]=',
  'function define(chart,def){ /* different source layout */ charts[chart]=')),
  /HOME_NATIVE_BOOT_SOURCE_ANCHOR_DRIFT:only_define_actual_home_chart/);
 assert.equal(fs.readFileSync(path.resolve(__dirname,'../../source/scripts/57.js'),'utf8'),original);
 console.log('HOME NATIVE MATRIX BOOT SOURCE ADAPTER PASS: LF and CRLF source identity, exact three gates, source drift refusal, canonical unchanged');
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
