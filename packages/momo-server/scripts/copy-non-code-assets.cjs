const fs = require('fs');
const path = require('path');

const PACKAGE_ROOT = path.resolve(__dirname, '..');
const SRC_ROOT = path.join(PACKAGE_ROOT, 'src');
const DIST_ROOT = path.join(PACKAGE_ROOT, 'dist');

const IGNORE_DIR_NAMES = new Set(['node_modules', 'dist', '.git', '.cursor', 'logs', 'doc']);

const CODE_EXTENSIONS = new Set(['.ts', '.js']);

function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function shouldSkipDir(dirName) {
  return IGNORE_DIR_NAMES.has(dirName);
}

function shouldCopyFile(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  return !CODE_EXTENSIONS.has(ext);
}

function copyAssetsRecursive(currentDir) {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(currentDir, entry.name);
    const relativePath = path.relative(SRC_ROOT, sourcePath);
    const distPath = path.join(DIST_ROOT, relativePath);

    if (entry.isDirectory()) {
      if (shouldSkipDir(entry.name)) {
        continue;
      }
      copyAssetsRecursive(sourcePath);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (!shouldCopyFile(entry.name)) {
      continue;
    }

    ensureDirSync(path.dirname(distPath));
    fs.copyFileSync(sourcePath, distPath);
  }
}

function copyDirRecursive(sourceDir, destDir) {
  if (!fs.existsSync(sourceDir)) {
    return;
  }
  ensureDirSync(destDir);
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      if (shouldSkipDir(entry.name)) {
        continue;
      }
      copyDirRecursive(sourcePath, destPath);
      continue;
    }
    if (entry.isFile()) {
      if (shouldCopyFile(entry.name)) {
        fs.copyFileSync(sourcePath, destPath);
      }
    }
  }
}

function main() {
  if (!fs.existsSync(SRC_ROOT)) {
    console.warn('[build] src directory not found, skip asset copy');
  } else {
    ensureDirSync(DIST_ROOT);
    copyAssetsRecursive(SRC_ROOT);
    console.info('[build] non-js/ts assets copied from src to dist');
  }

  const exampleSrc = path.join(PACKAGE_ROOT, 'example');
  const exampleDist = path.join(DIST_ROOT, 'example');
  if (fs.existsSync(exampleSrc)) {
    copyDirRecursive(exampleSrc, exampleDist);
    console.info('[build] example directory copied to dist/example');
  }
}

main();
