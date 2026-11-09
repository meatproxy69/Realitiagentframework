// Build once on developer machine; local bundle is lazy-loaded at runtime.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
const dir=path.dirname(fileURLToPath(import.meta.url));
const out=path.join(dir,'dist','viewer.js');
await build({entryPoints:[path.join(dir,'viewer-entry.js')],outfile:out,
 bundle:true,format:'iife',platform:'browser',target:['es2020'],
 minify:true,legalComments:'inline'});
const bytes=await fs.readFile(out),gz=zlib.gzipSync(bytes,{level:9});
if(gz.length>250*1024)throw Error('REALITI_VIEWER_JS_BUDGET_EXCEEDED:'+gz.length);
const sha=crypto.createHash('sha256').update(bytes).digest('hex');
await fs.writeFile(path.join(dir,'dist','manifest.json'),
 JSON.stringify({schema:'REALITI_LOCAL_THREE_VIEWER_V0',file:'viewer.js',
 sha256:sha,bytes:bytes.length,gzip_bytes:gz.length,
 external_cdns:0,renderers_per_session:1,reference_views:4},null,2)+'\n');
console.log('Local Three.js viewer',bytes.length,'bytes;',gz.length,'gzip bytes',sha);
