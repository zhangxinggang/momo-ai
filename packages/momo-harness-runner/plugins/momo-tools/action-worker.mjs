// Fresh trusted-code process, isolated from UI preview lifecycle.
import readline from 'node:readline';
import { pathToFileURL } from 'node:url';
console.log = (...args) => process.stderr.write(args.join(' ') + '\n');
const lines = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
const pending = new Map(); let started = false, sequence = 0;
const write = frame => process.stdout.write(JSON.stringify(frame) + '\n');
lines.on('line', async line => {
  if (Buffer.byteLength(line) > 2 * 1024 * 1024) { write({ type: 'error', message: 'INPUT_TOO_LARGE' }); process.exit(1); }
  try {
    const frame = JSON.parse(line);
    if (started) { const item = pending.get(frame.id); if (item) { pending.delete(frame.id); frame.error ? item.reject(Error(frame.error)) : item.resolve(frame.value); } return; }
    started = true;
    const module = await import(pathToFileURL(frame.entry).href);
    const action = module[frame.export ?? 'execute'];
    if (typeof action !== 'function') throw Error('INVALID_ACTION_EXPORT');
    const context = Object.freeze({ toolRoot: frame.toolRoot, dataDir: frame.dataDir,
      callTool: (toolId, input) => new Promise((resolve, reject) => { const id = 'call-' + (++sequence); pending.set(id, { resolve, reject }); write({ type: 'call', id, toolId, input }); }) });
    const value = await action(frame.input, context); write({ type: 'result', value }); lines.close();
  } catch (error) { write({ type: 'error', message: error.message }); lines.close(); }
});
