const fs = require('node:fs/promises');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {spawnSync} = require('node:child_process');
module.exports = async function verifyHarnessNative(context) {
  const root = path.join(context.appOutDir, 'resources', 'harness-builtin');
  const manifest = JSON.parse(await fs.readFile(path.join(root, 'runtime.json'), 'utf8'));
  if (manifest.runtimeId !== 'deepseek-harness' || manifest.platform !== context.electronPlatformName || manifest.hostProtocolRange !== '1.x') throw new Error('Harness runtime packaging mismatch');
  const sorted = Object.fromEntries(Object.entries(manifest.files).sort(([a],[b])=>a<b?-1:a>b?1:0));
  if (manifest.bundleId !== 'dsh-'+manifest.coreVersion+'-'+createHash('sha256').update(JSON.stringify(sorted)).digest('hex').slice(0,16)) throw new Error('Harness bundle identity mismatch');
  for (const required of [manifest.node,manifest.entry,'profile/cordis.patch.yml','plugins/momo-host-bridge/index.mjs','plugins/momo-model-credentials/index.mjs','plugins/momo-host-bridge/tool-schema.mjs','plugins/momo-tools/action-worker.mjs','plugins/momo-tools/action-worker.py']) if (!Object.hasOwn(sorted,required)) throw new Error('Harness packaged file missing: '+required);
  const entries = Object.entries(sorted); let next=0;
  await Promise.all(Array.from({length:16},async()=>{while(next<entries.length){
    const [relative,expected]=entries[next++];
    if (path.isAbsolute(relative) || relative.split(/[\\/]/).includes('..')) throw new Error('Unsafe Harness manifest path');
    let current=root; for(const part of relative.split(/[\\/]/)){current=path.join(current,part); if((await fs.lstat(current)).isSymbolicLink()) throw new Error('Harness package contains a link');}
    if (createHash('sha256').update(await fs.readFile(current)).digest('hex')!==expected) throw new Error('Harness packaged file corrupted: '+relative);
  }}));
  const check=spawnSync(path.join(root,manifest.node),['-e','process.stdout.write(JSON.stringify({nodeVersion:process.version,platform:process.platform,arch:process.arch}))'],{cwd:root,encoding:'utf8',windowsHide:true,timeout:10000,env:{...process.env,ELECTRON_RUN_AS_NODE:'1'}});
  if(check.status!==0)throw new Error('Bundled Harness Node cannot start');
  const actual=JSON.parse(check.stdout); for(const key of ['nodeVersion','platform','arch'])if(actual[key]!==manifest[key])throw new Error('Bundled Harness Node mismatch: '+key);
};
