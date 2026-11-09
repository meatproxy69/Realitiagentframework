'use strict';
// One-shot local browser/GPU test, no CI/Actions or npm. Use real Chromium.
const cp=require('node:child_process'),path=require('node:path'),fs=require('node:fs');
const {pathToFileURL}=require('node:url');
const page=path.resolve(__dirname,'../visual/smoke.html');
const bins=[process.env.CHROMIUM_BIN,'chromium','chromium-browser','google-chrome']
 .filter(Boolean);
let browser=null;
for(const bin of bins){
 const p=cp.spawnSync(bin,['--version'],{encoding:'utf8',timeout:3000});
 if(p.status===0){browser=bin;break}
}
if(!browser){console.error('CHROMIUM_UNAVAILABLE: set CHROMIUM_BIN or install Chromium.');process.exit(2)}
if(!fs.existsSync(page))throw Error('HOME_VISUAL_SMOKE_PAGE_NOT_FOUND');
const out=process.env.REALITI_VISUAL_SCREENSHOT||
 path.join(require('node:os').tmpdir(),'realiti-matrix-reference-smoke.png');
const url=pathToFileURL(page).href;
const args=['--headless=new','--no-sandbox','--disable-dev-shm-usage',
 '--allow-file-access-from-files','--enable-unsafe-swiftshader',
 '--use-angle=swiftshader','--ozone-platform=headless','--no-first-run',
 '--disable-background-networking','--virtual-time-budget=4500',
 '--window-size=1440,1000','--dump-dom',url];
const res=cp.spawnSync(browser,args,{encoding:'utf8',timeout:35000,
 maxBuffer:8*1024*1024});
const html=res.stdout||'',status=html.match(/RESULT:\s*(PASS|FAIL)/)?.[1];
if(res.error||status!=='PASS'||!html.includes('data-smoke="pass"')){
 console.error('BROWSER_MATRIX_RENDER_FAILED',res.error?.message||'');
 console.error('result:',status||'UNOBSERVED','exit:',res.status,'signal:',res.signal);
 console.error('output:',html.match(/HOME chart:[\s\S]{0,900}/)?.[0]?.slice(0,550)||html.slice(-500));
 console.error('stderr:',String(res.stderr||'').slice(-800));
 process.exit(1);
}
const shot=cp.spawnSync(browser,args.filter(x=>x!=='--dump-dom')
 .concat('--screenshot='+out),{encoding:'utf8',timeout:35000,maxBuffer:1e6});
if(shot.error||shot.status!==0||!fs.existsSync(out)||fs.statSync(out).size<500)
 throw Error('BROWSER_SCREENSHOT_FAILED: '+(shot.error?.message||shot.stderr||'').slice(-350));
console.log('REALITI NATIVE MATRIX + THREE.JS BROWSER: PASS');
console.log('Four reference PNGs 640x400; native Agent Door walked and wall blocked.');
console.log('Preview screenshot:',out);
