import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
const lock = JSON.parse(await fs.readFile(path.join(root, 'core-lock.json'), 'utf8'));
const [major, minor] = process.versions.node.split('.').map(Number);
if (!(major === 22 && minor >= 19 || major >= 24)) throw new Error('Harness build requires Node >=22.19 <23 or >=24');
const packages = ['dsh', 'dsh-agent', 'dsh-agent-loop', 'dsh-llm', 'dsh-session', 'dsh-system-prompt',
  'dsh-tools', 'dsh-session-persistence-jsonl', 'dsh-session-projection', 'dsh-attachment-local', 'dsh-fs-local', 'dsh-subprocess-local',
  'dsh-llm-pi-ai', 'dsh-user-questions', 'dsh-user-approval', 'dsh-plan-mode', 'dsh-commands', 'dsh-skill',
  'dsh-tool-skill', 'dsh-tool-ask-user', 'dsh-agent-presets', 'dsh-token-meter', 'dsh-goal', 'dsh-goal-round-driver', 'dsh-tool-goal',
  'dsh-command-goal', 'dsh-compaction-basic', 'dsh-command-compact'];
const dependencies = Object.fromEntries(packages.map(p => [`@deepseek-ai/${p}`, lock.version]));
const sameDependencies = value => JSON.stringify(Object.entries(value ?? {}).sort()) === JSON.stringify(Object.entries(dependencies).sort());
const assetPaths = [];
async function walk(dir, callback) {
  for (const item of (await fs.readdir(dir, { withFileTypes: true })).sort((a,b) => a.name < b.name ? -1 : 1)) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) await walk(full, callback);
    else if (item.isFile()) await callback(full);
    else if (item.isSymbolicLink()) throw new Error('Runtime bundle must contain real files: ' + full);
  }
}
for (const area of ['plugins','profile']) await walk(path.join(root,area), async file => assetPaths.push(file));
if (process.argv.includes('--ensure')) {
  try {
    const manifest = JSON.parse(await fs.readFile(path.join(output,'runtime.json'),'utf8'));
    const current = manifest.coreVersion === lock.version && manifest.nodeVersion === process.version && manifest.platform === process.platform && manifest.arch === process.arch;
    if (current && (await Promise.all(assetPaths.map(async file => manifest.files[path.relative(root,file).replaceAll('\\','/')] === createHash('sha256').update(await fs.readFile(file)).digest('hex')))).every(Boolean)) {
      console.log('Harness runtime ready:', manifest.bundleId); process.exit(0);
    }
  } catch { /* Build a missing or stale runtime. */ }
}
await fs.mkdir(output,{recursive:true});
await fs.writeFile(path.join(output,'package.json'),JSON.stringify({private:true,type:'module',dependencies},null,2));
let installed;
try { installed = JSON.parse(await fs.readFile(path.join(output,'package-lock.json'),'utf8')); } catch {}
const dependenciesReady = sameDependencies(installed?.packages?.['']?.dependencies) && (await Promise.all(packages.map(p => fs.access(path.join(output,'node_modules/@deepseek-ai',p,p === 'dsh' ? 'lib/bin.js' : 'lib/index.js')).then(()=>true,()=>false)))).every(Boolean);
const reuse = process.argv.includes('--reuse-dependencies') || process.argv.includes('--ensure') && dependenciesReady;
if (reuse && !dependenciesReady) throw new Error('Runtime dependencies changed; run harness:build without --reuse-dependencies');
if (!reuse) {
  let tracked; try { tracked = JSON.parse(await fs.readFile(path.join(root,'runtime-package-lock.json'),'utf8')); } catch {}
  const fixed = sameDependencies(tracked?.packages?.['']?.dependencies);
  if (fixed) await fs.copyFile(path.join(root,'runtime-package-lock.json'),path.join(output,'package-lock.json'));
  const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm',[fixed ? 'ci' : 'install','--omit=dev','--registry=https://registry.npmjs.org','--cache='+path.join(root,'../../temp/npm-cache')],{cwd:output,stdio:'inherit',shell:process.platform === 'win32'});
  if (result.status !== 0) process.exit(result.status ?? 1);
}
await fs.copyFile(path.join(output,'package-lock.json'),path.join(root,'runtime-package-lock.json'));
await fs.cp(path.join(root,'plugins'),path.join(output,'plugins'),{recursive:true});
await fs.cp(path.join(root,'profile'),path.join(output,'profile'),{recursive:true});
const node = process.platform === 'win32' ? 'node.exe' : 'node';
const bundledNode = path.join(output, node);
// Windows locks a running executable. An unchanged Node binary needs no replacement.
let sameNode = false;
try {
  const [sourceStat, targetStat] = await Promise.all([fs.stat(process.execPath), fs.stat(bundledNode)]);
  if (sourceStat.size === targetStat.size) {
    const digest = bytes => createHash('sha256').update(bytes).digest('hex');
    sameNode = digest(await fs.readFile(process.execPath)) === digest(await fs.readFile(bundledNode));
  }
} catch { /* A missing runtime executable is copied below. */ }
if (!sameNode) await fs.copyFile(process.execPath, bundledNode);
if (process.platform !== 'win32') await fs.chmod(path.join(output,node),0o755);
const licenses = JSON.parse(await fs.readFile(path.join(root,'runtime-package-lock.json'),'utf8'));
await fs.writeFile(path.join(output,'THIRD_PARTY_LICENSES.json'),JSON.stringify(Object.fromEntries(Object.entries(licenses.packages).filter(([p])=>p).map(([p,value])=>[p,{version:value.version,license:value.license,resolved:value.resolved}])),null,2));
try { await fs.copyFile(path.join(path.dirname(process.execPath),'LICENSE'),path.join(output,'NODE_LICENSE')); } catch { /* Redistributor should supply the Node license if their Node installation omits it. */ }
const paths = [], files = {}; await walk(output,async file=>{if(path.basename(file)!=='runtime.json')paths.push(file);});
let next = 0;
await Promise.all(Array.from({length:16},async()=>{while(next<paths.length){const full=paths[next++];files[path.relative(output,full).replaceAll('\\','/')]=createHash('sha256').update(await fs.readFile(full)).digest('hex');}}));
const sorted=Object.fromEntries(Object.entries(files).sort(([a],[b])=>a<b?-1:a>b?1:0));
const digest=createHash('sha256').update(JSON.stringify(sorted)).digest('hex').slice(0,16);
await fs.writeFile(path.join(output,'runtime.json'),JSON.stringify({runtimeId:'deepseek-harness',bundleId:`dsh-${lock.version}-${digest}`,coreVersion:lock.version,coreCommit:lock.publishedCommit,adapterVersion:lock.adapterVersion,hostProtocolRange:'1.x',platform:process.platform,arch:process.arch,nodeVersion:process.version,entry:'node_modules/@deepseek-ai/dsh/lib/bin.js',node,source:lock.source,files:sorted},null,2));
console.log('Harness runtime built:',digest);
