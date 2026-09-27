const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { createRequire, isBuiltin } = require('node:module');

// Use the same parser/compiler as Vite; neither tool is shipped in the app.
const buildRequire = createRequire(require.resolve('vite'));
const esbuild = buildRequire('esbuild');
const lexer = buildRequire('es-module-lexer');
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const slash = (value) => value.replaceAll('\\', '/');

function inside(root, target) {
  const relative = path.relative(root, target);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

async function walk(root) {
  const result = [];
  for (const entry of await fs.readdir(root, { withFileTypes: true })) {
    const file = path.join(root, entry.name);
    if (entry.isDirectory()) result.push(...(await walk(file)));
    else if (entry.isFile()) result.push(file);
    else throw new Error('Harness production files must not be links: ' + file);
  }
  return result.sort();
}

function packageName(specifier) {
  if (specifier.startsWith('.') || specifier.startsWith('/') || isBuiltin(specifier)) return null;
  return specifier
    .split('/')
    .slice(0, specifier.startsWith('@') ? 2 : 1)
    .join('/');
}

async function importsIn(files) {
  await lexer.init;
  const names = new Set();
  for (const file of files.filter((file) => /\.[cm]?js$/.test(file))) {
    const code = await fs.readFile(file, 'utf8');
    for (const item of lexer.parse(code)[0]) {
      if (item.d === -2) continue; // import.meta
      if (!item.n) throw new Error('Unaudited dynamic Harness import: ' + file);
      const name = packageName(item.n);
      if (name) names.add(name);
    }
  }
  return [...names];
}

async function resolvePackage(root, from, name) {
  let directory = from;
  while (inside(root, directory)) {
    const candidate = path.join(directory, 'node_modules', name);
    try {
      return {
        directory: candidate,
        manifest: JSON.parse(await fs.readFile(path.join(candidate, 'package.json'), 'utf8')),
      };
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    directory = path.dirname(directory);
  }
  return null;
}

async function selectPackages(root) {
  const selected = new Map();
  const visit = async (name, from, optional = false) => {
    const resolved = await resolvePackage(root, from, name);
    if (!resolved) {
      if (optional) return;
      throw new Error(`Missing Harness dependency ${name} from ${from}`);
    }
    const { directory, manifest } = resolved;
    if (selected.has(directory)) return;
    selected.set(directory, manifest);
    // dsh's npm manifest installs every upstream UI/profile. AIM launches only
    // its own profile, but retains ALL CLI modules and their literal imports.
    // Every other package keeps its complete runtime/peer/optional closure.
    const dependencies =
      manifest.name === '@deepseek-ai/dsh'
        ? await importsIn(await walk(path.join(directory, 'lib')))
        : Object.keys({
            ...manifest.dependencies,
            ...manifest.peerDependencies,
            ...manifest.optionalDependencies,
          });
    for (const dependency of dependencies) {
      await visit(
        dependency,
        directory,
        Boolean(
          manifest.optionalDependencies?.[dependency] ||
          manifest.peerDependenciesMeta?.[dependency]?.optional,
        ),
      );
    }
  };
  const rootPackage = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
  const profile = await fs.readFile(path.join(root, 'profile/cordis.patch.yml'), 'utf8');
  const profilePackages = [...profile.matchAll(/name:\s*['"](@[^'"\s]+)['"]/g)].map(
    (match) => match[1],
  );
  const pluginPackages = await importsIn(await walk(path.join(root, 'plugins')));
  for (const name of new Set([
    ...Object.keys(rootPackage.dependencies),
    ...profilePackages,
    ...pluginPackages,
  ])) {
    await visit(name, root);
  }
  return selected;
}

function keepFile(relative, platform, arch) {
  // Preserve README/license/prompt/schema/runtime assets. Only known development
  // metadata and foreign node-pty prebuilds are removed; .ts may run on Node 22.
  if (/\.(?:map|pdb|tsbuildinfo)$/.test(relative) || /\.d\.[cm]?ts$/.test(relative)) return false;
  if (
    /(^|\/)node_modules\/\.bin\//.test(relative) ||
    /(^|\/)(?:\.package-lock|package-lock)\.json$/.test(relative)
  )
    return false;
  if (
    /node_modules\/(?:@[^/]+\/)?[^/]+\/(?:\.history|\.github|test|tests|__tests__|examples|coverage)\//.test(
      relative,
    )
  )
    return false;
  const prebuild = relative.match(/node_modules\/node-pty\/prebuilds\/([^/]+)\//);
  return !prebuild || prebuild[1] === `${platform}-${arch}`;
}

async function prepareHarness(sourceDir, stagingDir) {
  const root = path.resolve(sourceDir);
  const staging = path.resolve(stagingDir);
  // This stage owns only one fixed build directory, never the source runtime.
  if (
    inside(root, staging) ||
    inside(staging, root) ||
    path.basename(staging) !== 'harness-production'
  ) {
    throw new Error('Unsafe Harness staging directory: ' + staging);
  }
  const original = JSON.parse(await fs.readFile(path.join(root, 'runtime.json'), 'utf8'));
  const selected = await selectPackages(root);
  // The upstream profile resolver discovers builtins from the CLI carrier's
  // dependency graph. Re-declare the shipped closure so plugins formerly
  // reached through removed default profiles still resolve outside the repo.
  const carrierDependencies = Object.fromEntries(
    [...selected]
      .filter(
        ([directory, manifest]) =>
          manifest.name !== '@deepseek-ai/dsh' &&
          !slash(path.relative(path.join(root, 'node_modules'), directory)).includes(
            '/node_modules/',
          ),
      )
      .map(([, manifest]) => [manifest.name, manifest.version])
      .sort(([a], [b]) => a.localeCompare(b)),
  );
  const owners = [...selected.keys()].sort((a, b) => b.length - a.length);
  const files = Object.keys(original.files).filter((relative) => {
    if (!inside(root, path.resolve(root, relative)))
      throw new Error('Unsafe Harness manifest path');
    if (!keepFile(relative, original.platform, original.arch)) return false;
    if (!relative.startsWith('node_modules/')) return true;
    const absolute = path.join(root, relative);
    const owner = owners.find((directory) => inside(directory, absolute));
    return (
      owner &&
      !slash(path.relative(owner, absolute)).includes('/node_modules/') &&
      !slash(path.relative(owner, absolute)).startsWith('node_modules/')
    );
  });
  await fs.rm(staging, { recursive: true, force: true });
  await fs.mkdir(staging, { recursive: true });
  const hashes = {};
  let before = 0,
    after = 0,
    next = 0;
  await Promise.all(
    Array.from({ length: 8 }, async () => {
      while (next < files.length) {
        const relative = files[next++];
        let bytes = await fs.readFile(path.join(root, relative));
        if (digest(bytes) !== original.files[relative])
          throw new Error('Harness source corrupted: ' + relative);
        before += bytes.length;
        if (relative === 'node_modules/@deepseek-ai/dsh/package.json') {
          const carrier = JSON.parse(bytes.toString('utf8'));
          carrier.dependencies = carrierDependencies;
          bytes = Buffer.from(JSON.stringify(carrier));
        }
        if (/\.[cm]?js$/.test(relative)) {
          bytes = Buffer.from(
            (
              await esbuild.transform(bytes.toString('utf8'), {
                minify: true,
                keepNames: true,
                target: 'node22',
                legalComments: 'inline',
                sourcefile: relative,
                logLevel: 'silent',
              })
            ).code,
          );
        }
        const target = path.join(staging, relative);
        await fs.mkdir(path.dirname(target), { recursive: true });
        await fs.writeFile(target, bytes);
        if (relative === original.node && original.platform !== 'win32')
          await fs.chmod(target, 0o755);
        hashes[relative] = digest(bytes);
        after += bytes.length;
      }
    }),
  );
  const sorted = Object.fromEntries(
    Object.entries(hashes).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
  );
  const manifest = {
    ...original,
    files: sorted,
    bundleId: `dsh-${original.coreVersion}-${digest(JSON.stringify(sorted)).slice(0, 16)}`,
  };
  await fs.writeFile(path.join(staging, 'runtime.json'), JSON.stringify(manifest));
  console.log(
    `[prepare-harness] ${selected.size} packages, ${files.length} files, ${(after / 1048576).toFixed(1)} MiB (JS saved ${((before - after) / 1048576).toFixed(1)} MiB)`,
  );
  return { staging, manifest };
}

module.exports = { prepareHarness, selectPackages, keepFile };
