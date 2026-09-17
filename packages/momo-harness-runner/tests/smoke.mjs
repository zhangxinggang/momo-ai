import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
const bundle = path.resolve('packages/momo-harness-runner/dist');
const home = path.resolve('temp/harness-smoke-' + randomUUID());
await fs.mkdir(path.join(home, 'profiles/momo'), { recursive: true });
await fs.cp(path.join(bundle, 'profile'), path.join(home, 'profiles/momo'), { recursive: true });
const patchPath = path.join(home, 'profiles/momo/cordis.patch.yml');
await fs.writeFile(patchPath, (await fs.readFile(patchPath, 'utf8')).replace("'__MOMO_BRIDGE_PLUGIN__'", JSON.stringify(path.join(bundle, 'plugins/momo-host-bridge/index.mjs'))).replace("'__MOMO_CREDENTIAL_PLUGIN__'", JSON.stringify(path.join(bundle, 'plugins/momo-model-credentials/index.mjs'))));
const server = createServer(async (req, res) => {
  let data = ''; for await (const chunk of req) data += chunk;
  const request = JSON.parse(data);
  console.log('MODEL_REQUEST', request.model, request.messages.length, (request.tools ?? []).map(t => t.function.name).join(','));
  res.writeHead(200, { 'content-type': 'text/event-stream' });
  const chunk = (delta, finish_reason = null) => res.write('data: ' + JSON.stringify({ id: 'chatcmpl-test', object: 'chat.completion.chunk', model: request.model, choices: [{ index: 0, delta, finish_reason }] }) + '\n\n');
  chunk({ role: 'assistant', content: 'Harness ' }); chunk({ content: '真实执行成功' });
  chunk({}, 'stop'); res.end('data: [DONE]\n\n');
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
const child = spawn(process.execPath, [path.join(bundle, 'node_modules/@deepseek-ai/dsh/lib/bin.js'), '--profile', 'momo'], {
  cwd: bundle, env: { ...process.env, DSH_HOME: home, MOMO_SESSION_ROOT: path.join(home, 'sessions'), MOMO_BRIDGE_PLUGIN: path.join(bundle, 'plugins/momo-host-bridge/index.mjs'),
    MOMO_CREDENTIAL_PLUGIN: path.join(bundle, 'plugins/momo-model-credentials/index.mjs'),
    MOMO_PRESET_ROOT: path.join(bundle, 'profile/agent-presets'), MOMO_BUNDLE_ID: 'smoke', MOMO_CORE_VERSION: '0.1.6-alpha.2' }, windowsHide: true,
});
let buffer = '', seq = 0;
const pending = new Map();
child.stderr.on('data', data => process.stderr.write(data));
child.stdout.on('data', data => {
  buffer += data;
  let i; while ((i = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, i); buffer = buffer.slice(i + 1);
    let frame; try { frame = JSON.parse(line); } catch { console.error('BAD_STDOUT', line); continue; }
    if (frame.method) { child.stdin.write(JSON.stringify({ id: frame.id, result: frame.method === 'host.authorize' ? { allowed: true } : { sum: 5 } }) + '\n'); continue; }
    if (frame.event) { console.log('EVENT', frame.event.type, JSON.stringify(frame.event.payload).slice(0, 350)); if (['run.completed', 'run.failed'].includes(frame.event.type)) finished.resolve(frame.event); continue; }
    const item = pending.get(frame.id); if (item) { pending.delete(frame.id); frame.error ? item.reject(Error(frame.error.message)) : item.resolve(frame.result); }
  }
});
function call(method, params = {}) { const id = 'smoke-' + (++seq); return new Promise((resolve, reject) => { pending.set(id, { resolve, reject }); child.stdin.write(JSON.stringify({ id, method, params }) + '\n'); }); }
const finished = Promise.withResolvers();
const timer = setTimeout(() => { console.error('SMOKE_TIMEOUT'); child.kill(); server.close(); process.exitCode = 1; }, 120000);
try {
  console.log('DESCRIBE', await call('describe')); console.log('AGENTS', await call('listAgents'));
  console.log('FILE', await call('prepareAttachment', { name: 'probe.txt', mimeType: 'text/plain', data: Buffer.from('original bytes').toString('base64') }));
  await call('start', { runId: randomUUID(), sessionId: randomUUID(), agentId: 'default', modeId: 'ask',
    model: { apiProtocol: 'openai', apiUrl: 'http://127.0.0.1:' + port + '/v1', apiKey: 'fake-smoke-key', model: 'mock-model' },
    cwd: home, prompt: '你好', instructions: 'Answer briefly', tools: [], attachments: [] });
  const end = await finished.promise; if (end.type !== 'run.completed') throw Error('Run failed');
  await call('shutdown'); console.log('SMOKE_PASSED');
} catch (error) { console.error(error); process.exitCode = 1; }
finally { clearTimeout(timer); child.kill(); server.close(); }
