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
  const roots = [
    path.join(context.appOutDir, 'resources', 'app.asar.unpacked', 'node_modules'),
    path.join(context.appOutDir, 'resources', 'app', 'node_modules'),
  ];
  const required =
    context.electronPlatformName === 'win32'
      ? [
          'lancedb.win32-x64-msvc.node',
          'xberg-node.win32-x64-msvc.node',
          'onnxruntime.dll',
          'onnxruntime_providers_shared.dll',
        ]
      : [];
  const missing = required.filter(
    (basename) => !roots.some((root) => findFile(root, basename)),
  );
  if (missing.length) {
    throw new Error(
      'Knowledge V2 native packaging failed; missing: ' +
        missing.join(', ') +
        '. Inspected: ' +
        roots.join(', '),
    );
  }
};
