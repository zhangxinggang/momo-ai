const fs = require('node:fs');
const path = require('node:path');

function findFile(root, basename) {
  if (!fs.existsSync(root)) return undefined;
  const pending = [root];
  while (pending.length) {
    const current = pending.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const target = path.join(current, entry.name);
      if (entry.isDirectory()) pending.push(target);
      else if (entry.name === basename) return target;
    }
  }
  return undefined;
}

module.exports = async function verifyKnowledgeNative(context) {
  await require('./verify-harness-native.cjs')(context);
  const resources = path.join(context.appOutDir, 'resources');
  const root = path.join(resources, 'native');
  const required =
    context.electronPlatformName === 'win32'
      ? [
          'better-sqlite3-v12.9.0-electron-v140-win32-x64.node',
          'lancedb.win32-x64-msvc.node',
          'xberg-node.win32-x64-msvc.node',
          'onnxruntime.dll',
          'onnxruntime_providers_shared.dll',
        ]
      : [];
  const missing = required.filter((basename) => !findFile(root, basename));
  if (missing.length) {
    throw new Error(
      'Knowledge V2 native packaging failed; missing: ' +
        missing.join(', ') +
        '. Inspected: ' +
        root,
    );
  }
  const pending = [resources];
  while (pending.length) {
    const current = pending.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      if (entry.name === 'node_modules') {
        throw new Error(
          'Packaged resources must not contain a node_modules directory: ' +
            path.join(current, entry.name),
        );
      }
      pending.push(path.join(current, entry.name));
    }
  }
  await require('./verify-app-runtime.cjs')(context);
  await require('./verify-harness-cache.cjs')(context);
};
