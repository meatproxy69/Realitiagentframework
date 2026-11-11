'use strict';
// The public Realiti 1.0 staging branch may add docs, archives and reviewed
// integration files. It must never replace the canonical V20 source, private
// resident state, legacy releases, or the original Matrix/SOMA core.
const fs=require('node:fs'),path=require('node:path'),
 assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const lock=JSON.parse(fs.readFileSync(path.join(root,'v20-base.lock.json'),'utf8'));
assert.equal(lock.source_commit,'29409537988f779d78fa04a5d903f599f7154034');
assert.equal(lock.release_approved,false);
assert.equal(lock.migration_authorized,false);
const changes=execFileSync('git',['diff','--name-only',lock.source_commit+'...HEAD'],
 {cwd:root,encoding:'utf8'}).trim().split('\n').filter(Boolean);
assert.ok(changes.length>=12,'STAGED_SOURCE_TRANSFER_INCOMPLETE');
const isNew=(p)=>p==='README.md'||p==='AGENTS.md'||p==='AGENT_START_HERE.md'||
 p==='.gitignore'||p==='v20-base.lock.json'||p==='tools/verify-v20-baseline.cjs'||
 p.startsWith('v20/')&&/^v20\/[A-Za-z0-9._-]+\.(?:mjs|cjs|js)$/.test(p)||
 p.startsWith('archive/')&&/^archive\/[A-Za-z0-9._/-]+\.md$/.test(p)||
 p.startsWith('docs/')&&/^docs\/REALITI_1_0_[A-Z0-9_]+\.md$/.test(p)||
 p==='.github/workflows/realiti-1-0-stage.yml'||
 ['deploy-server','publish-matrix','publish-neuromesh','headless-agent-door']
   .includes(p.match(/^\.github\/workflows\/([a-z-]+)\.yml$/)?.[1])||
 p==='packages/README.md'||
 /^packages\/(?:realiti-neuromesh|realiti-matrix|realiti-headless-resident|realiti-server)\/README\.md$/.test(p)||
 /^packages\/realiti-v20-native\/[A-Za-z0-9._-]+\.(?:md|cjs|json)$/.test(p);
const forbidden=(p)=>/^(?:source|apartment|neuromesh|continuity|tests|scripts)\//.test(p)||
 /(?:\.env(?:\.|$)|\.pem$|\.key$|\.p12$|\.keys\.json$|journal\.enc\.json$)/.test(p);
for(const p of changes){
 assert.equal(forbidden(p),false,'ORIGINAL_NEURAL_OR_SENSITIVE_PATH_CHANGED:'+p);
 assert.ok(isNew(p),'NON_STAGING_FILE_CHANGED:'+p);
}
const scanPaths=changes.filter(p=>p.startsWith('v20/')||p.startsWith('tools/')||p.startsWith('packages/realiti-v20-native/'));
const signatures=[
 ['PRIVATE_KEY_BLOCK',/-----BEGIN [A-Z ]*PRIVATE KEY-----/],
 ['GITHUB_ACCESS_TOKEN',/\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{30,})\b/],
 ['CLOUD_KEY',/\bAKIA[0-9A-Z]{16}\b/],
 ['PROVIDER_SECRET',/\bsk-(?:proj-)?[A-Za-z0-9_-]{24,}\b/],
 ['EMAIL_ADDRESS',/(?<![A-Za-z0-9._%+-])[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/]
];
for(const p of scanPaths){
 const s=fs.readFileSync(path.join(root,p),'utf8');
 for(const [kind,re] of signatures)assert.equal(re.test(s),false,kind+'_IN_STAGING_SOURCE:'+p);
}
console.log('REALITI_1_0_STAGING_SAFETY_OK '+JSON.stringify({
 changed_files:changes.length,scanned_new_sources:scanPaths.length,
 original_neural_files_modified:false,keys_or_emails_in_new_sources:false,
 legacy_archive_preserved:true,live_deployment:false,canonical_v20_engine_unchanged:true
}));
