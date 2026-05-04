const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const PACKAGE_ROOT = path.resolve(__dirname, '..');
const EXAMPLE_SRC = path.join(PACKAGE_ROOT, 'example');
const EXAMPLE_DIST = path.join(PACKAGE_ROOT, 'dist', 'example');

const IGNORE_DIR_NAMES = new Set(['node_modules', 'dist', '.git', '.cursor', 'logs', 'doc']);

function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function collectTsFiles(currentDir, files = []) {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORE_DIR_NAMES.has(entry.name)) {
        continue;
      }
      collectTsFiles(sourcePath, files);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.ts')) {
      files.push(sourcePath);
    }
  }
  return files;
}

function rewriteExampleImports(source) {
  return source
    .replace(/from ['"](\.\.\/)src\/([^'"]+)['"]/g, "from '$1$2.cjs'")
    .replace(/require\(['"](\.\.\/)src\/([^'"]+)['"]\)/g, "require('$1$2.cjs')");
}

function compileExampleFiles() {
  if (!fs.existsSync(EXAMPLE_SRC)) {
    console.warn('[build] example directory not found, skip compile');
    return;
  }

  const tsFiles = collectTsFiles(EXAMPLE_SRC);
  for (const filePath of tsFiles) {
    const relativePath = path.relative(EXAMPLE_SRC, filePath);
    const outFile = path.join(EXAMPLE_DIST, relativePath.replace(/\.ts$/, '.js'));
    ensureDirSync(path.dirname(outFile));

    const source = rewriteExampleImports(fs.readFileSync(filePath, 'utf8'));
    const result = esbuild.transformSync(source, {
      loader: 'ts',
      format: 'cjs',
      platform: 'node',
      target: 'node20',
      sourcefile: filePath,
    });
    fs.writeFileSync(outFile, result.code);
  }

  console.info(`[build] compiled ${tsFiles.length} example ts files to dist/example`);
}

compileExampleFiles();
