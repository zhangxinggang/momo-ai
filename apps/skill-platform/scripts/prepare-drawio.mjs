import { unzipSync } from 'fflate';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Official web distribution; keep the editor and every lazy-loaded resource at one version.
const VERSION = '32.0.2';
const SHA256 = '3cb8abec8e9bfc7504760c9cdc9194ecf7e8de178aa2a1d668801c32ecf1a1a7';
const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const destination = path.join(appRoot, 'static', 'drawio');
const versionFile = path.join(destination, 'momo-version.json');

if (
  existsSync(versionFile) &&
  existsSync(path.join(destination, 'index.html')) &&
  JSON.parse(await readFile(versionFile, 'utf8')).sha256 === SHA256
) {
  console.log(`draw.io ${VERSION} already prepared`);
} else {
  const url = 'https://api.github.com/repos/jgraph/drawio/releases/assets/608594683?download=1';
  console.log(`Preparing draw.io ${VERSION} from ${url}`);
  const response = process.env.DRAWIO_ARCHIVE_PATH
    ? null
    : await fetch(url, {
        headers: { Accept: 'application/octet-stream' },
        signal: AbortSignal.timeout(900_000),
      });
  if (response && !response.ok) throw new Error(`draw.io download failed: HTTP ${response.status}`);
  let archive;
  if (response) {
    const chunks = [];
    let bytes = 0;
    let reported = 0;
    for await (const chunk of response.body) {
      chunks.push(chunk);
      bytes += chunk.length;
      if (bytes - reported >= 4 * 1024 * 1024) {
        console.log(`draw.io download: ${Math.round(bytes / 1024 / 1024)} MiB`);
        reported = bytes;
      }
    }
    archive = new Uint8Array(Buffer.concat(chunks));
  } else {
    archive = new Uint8Array(await readFile(process.env.DRAWIO_ARCHIVE_PATH));
  }
  if (createHash('sha256').update(archive).digest('hex') !== SHA256) {
    throw new Error('draw.io archive checksum mismatch');
  }
  const files = unzipSync(archive, {
    filter: (entry) => !/^(WEB-INF|META-INF)\//.test(entry.name) && !entry.name.endsWith('/'),
  });
  if (!files['index.html'] || !files['js/stencils.min.js']) {
    throw new Error('draw.io web distribution is incomplete');
  }
  await mkdir(destination, { recursive: true });
  for (const [name, data] of Object.entries(files)) {
    const target = path.resolve(destination, name);
    const relative = path.relative(destination, target);
    if (relative.startsWith('..') || path.isAbsolute(relative))
      throw new Error('Invalid archive path');
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, data);
  }
  // Completion marker is atomic; interrupted preparation is retried next time.
  const temporary = `${versionFile}.tmp`;
  await writeFile(temporary, JSON.stringify({ version: VERSION, sha256: SHA256 }));
  await rename(temporary, versionFile);
  console.log(`draw.io ${VERSION} ready at ${destination}`);
}
