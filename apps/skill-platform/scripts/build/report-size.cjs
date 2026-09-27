const fs = require('node:fs/promises');
const path = require('node:path');

async function measure(directory) {
  let bytes = 0,
    files = 0;
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      const nested = await measure(file);
      bytes += nested.bytes;
      files += nested.files;
    } else if (entry.isFile()) {
      bytes += (await fs.stat(file)).size;
      files++;
    }
  }
  return { bytes, files };
}

module.exports = async function reportSize({ outDir, artifactPaths }) {
  const directory = path.join(outDir, 'win-unpacked');
  const installed = await measure(directory);
  const components = {};
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    components[entry.name] = entry.isDirectory()
      ? (await measure(file)).bytes
      : (await fs.stat(file)).size;
  }
  for (const name of ['app.asar', 'harness-builtin.asar', 'native']) {
    const file = path.join(directory, 'resources', name);
    components[`resources/${name}`] = (await fs.stat(file)).isDirectory()
      ? (await measure(file)).bytes
      : (await fs.stat(file)).size;
  }
  const artifacts = {};
  for (const file of artifactPaths) artifacts[path.basename(file)] = (await fs.stat(file)).size;
  const report = { installed, components, artifacts };
  await fs.writeFile(path.join(outDir, 'size-report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(
    `[size] installed ${(installed.bytes / 1048576).toFixed(1)} MiB; ${Object.entries(artifacts)
      .map(([name, bytes]) => `${name}: ${(bytes / 1048576).toFixed(1)} MiB`)
      .join('; ')}`,
  );
  return [];
};
