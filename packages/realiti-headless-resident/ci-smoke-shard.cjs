'use strict';
// CI sharding of the existing package.json test chain, not a shorter suite.
// Each command runs on exactly one shard. Every case receives the same repo
// artifact, package dependencies, and Node runtime as the old serial test job.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const here=__dirname,shard=Number(process.argv[2]),count=Number(process.argv[3]);
if(!Number.isInteger(shard)||!Number.isInteger(count)||count<1||count>16||
   shard<0||shard>=count)throw Error('INVALID_SMOKE_SHARD');
const pkg=JSON.parse(fs.readFileSync(path.join(here,'package.json'),'utf8'));
const commands=String(pkg.scripts?.test||'').split(/\s+&&\s+/).filter(Boolean);
if(commands.length<25)throw Error('HEADLESS_TEST_CHAIN_UNEXPECTEDLY_SHORT');
const jobs=commands.map((cmd,index)=>({cmd,index})).filter(({index})=>index%count===shard);
if(jobs.length===0)throw Error('EMPTY_SMOKE_SHARD');
let passed=0;
for(const {cmd,index} of jobs){
 const m=/^node (test\/[a-z0-9-]+\.cjs) (\.\.\/\.\.\/RealitiRELAX\.html)$/.exec(cmd);
 if(!m)throw Error('SMOKE_COMMAND_NOT_RECOGNIZED: '+cmd);
 process.stdout.write('[headless shard '+shard+'/'+count+'] '+(passed+1)+'/'+jobs.length+
  ' suite '+index+': '+m[1]+'\n');
 const p=cp.spawnSync(process.execPath,[m[1],m[2]],{
  cwd:here,stdio:'inherit',timeout:12*60*1000,env:process.env
 });
 if(p.error||p.status!==0){
  console.error('HEADLESS_SHARD_FAIL',JSON.stringify({shard,count,index,command:cmd,
   code:p.status,signal:p.signal,error:p.error?.message||null}));
  process.exit(1);
 }
 passed++;
}
console.log('HEADLESS_SHARD_PASS',JSON.stringify({shard,count,suites:passed,total:commands.length}));
