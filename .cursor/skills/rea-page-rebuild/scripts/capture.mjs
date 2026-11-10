import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import net from 'node:net';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { runRea, REA_VERSION, NODE_VERSION } from './rea-runner.mjs';

function option(args, name) {
  const index = args.indexOf(name);
  return index < 0 ? undefined : args[index + 1];
}
export function parseOptions(args) {
  if (args.includes('--check')) return { check: true };
  const url = new URL(option(args, '--url') || '');
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password)
    throw new Error('--url 必须是 HTTP/HTTPS 网页地址');
  const cdp = option(args, '--cdp');
  if (cdp && !/^http:\/\/127\.0\.0\.1:\d+\/?$/.test(cdp))
    throw new Error('--cdp 仅支持 http://127.0.0.1:PORT');
  if (cdp) new URL(cdp);
  const captures = (option(args, '--capture') || 'page,bundle,screenshot').split(',');
  if (!captures.length || captures.some((name) => !['page', 'bundle', 'screenshot'].includes(name)))
    throw new Error('--capture 仅支持 page,bundle,screenshot');
  return {
    url: url.href,
    out: path.resolve(option(args, '--out') || 'rea-evidence'),
    cdp,
    captures,
  };
}
async function browserPath() {
  const candidates = [
    process.env.REA_CHROME,
    process.env.PROGRAMFILES &&
      path.join(process.env.PROGRAMFILES, 'Google/Chrome/Application/chrome.exe'),
    process.env['PROGRAMFILES(X86)'] &&
      path.join(process.env['PROGRAMFILES(X86)'], 'Microsoft/Edge/Application/msedge.exe'),
    process.env.LOCALAPPDATA &&
      path.join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe'),
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ];
  for (const candidate of candidates.filter(Boolean)) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {}
  }
  throw new Error('未找到 Chrome/Edge。请设置 REA_CHROME，或用 --cdp 连接专用调试浏览器');
}
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export async function saveEvidence(out, name, raw, manifest) {
  const evidence = JSON.parse(raw);
  const result = evidence.normalized_result || {};
  await fs.writeFile(path.join(out, `${name}.json`), raw);
  manifest.operations[name] = {
    status: 'captured',
    file: `${name}.json`,
    completeness: result.completeness?.status,
  };
  if (result.target?.url) {
    manifest.observedUrl = result.target.url;
    if (new URL(result.target.url).pathname !== new URL(manifest.url).pathname) {
      const warning =
        '页面路径发生跳转；采集内容可能是登录页或错误页，请检查 page-summary.json 与截图。';
      if (!manifest.limitations.includes(warning)) manifest.limitations.push(warning);
    }
  }
  if (name === 'page') {
    const summary = {
      target: result.target,
      completeness: result.completeness,
      accessibility: (result.accessibility?.nodes || [])
        .filter((node) => !node.ignored && node.name)
        .slice(0, 300)
        .map(({ role, name }) => ({ role, name })),
      scripts: (result.scripts?.items || []).map(({ url }) => ({ url })),
      limitations: evidence.limitations || [],
    };
    await fs.writeFile(path.join(out, 'page-summary.json'), JSON.stringify(summary, null, 2));
  }
  if (
    name === 'screenshot' &&
    result.artifact?.media_type === 'image/png' &&
    result.artifact.data_base64
  ) {
    const png = Buffer.from(result.artifact.data_base64, 'base64');
    if (createHash('sha256').update(png).digest('hex') !== result.artifact.sha256)
      throw new Error('截图摘要校验失败');
    await fs.writeFile(path.join(out, 'screenshot.png'), png);
    manifest.operations[name].image = 'screenshot.png';
  }
}
async function freePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

export async function capture(options, dependencies = {}) {
  const rea = dependencies.runRea || runRea;
  if (options.check) {
    console.log(await rea(['--version'], { timeout: 600000 }));
    return;
  }
  await fs.mkdir(options.out, { recursive: true });
  let browser,
    profile,
    endpoint = options.cdp;
  const abort = new AbortController();
  const stop = () => {
    abort.abort();
    browser?.kill();
  };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  const manifest = {
    url: options.url,
    reaVersion: REA_VERSION,
    nodeVersion: NODE_VERSION,
    capturedAt: new Date().toISOString(),
    operations: {},
    limitations: [],
  };
  try {
    if (!endpoint) {
      const executable = await browserPath();
      const port = await freePort();
      endpoint = `http://127.0.0.1:${port}`;
      profile = await fs.mkdtemp(path.join(os.tmpdir(), 'momo-rea-browser-'));
      browser = spawn(
        executable,
        [
          '--headless=new',
          '--window-size=1440,1000',
          `--remote-debugging-port=${port}`,
          '--remote-debugging-address=127.0.0.1',
          `--user-data-dir=${profile}`,
          '--no-first-run',
          '--no-default-browser-check',
          options.url,
        ],
        { windowsHide: true, stdio: 'ignore', shell: false },
      );
      browser.on('error', (error) => {
        manifest.limitations.push(error.message);
      });
    }
    let target;
    for (let attempt = 0; attempt < 40 && !target && !abort.signal.aborted; attempt++) {
      try {
        const response = await fetch(`${endpoint}/json/list`, {
          signal: AbortSignal.timeout(1500),
        });
        const targets = await response.json();
        target = targets.find((item) => item.type === 'page' && item.url === options.url);
        if (!target) {
          const sameOrigin = targets.filter((item) => {
            try {
              return (
                item.type === 'page' && new URL(item.url).origin === new URL(options.url).origin
              );
            } catch {
              return false;
            }
          });
          if (sameOrigin.length === 1) target = sameOrigin[0];
        }
      } catch {}
      if (!target) await delay(500);
    }
    if (!target)
      throw new Error(
        '未找到指定来源的网页目标。若页面要求登录，请在专用调试浏览器中登录后使用 --cdp',
      );
    manifest.observedUrl = target.url;
    for (const [name, command, flags] of [
      [
        'page',
        'inspect-web-page',
        ['--include-accessibility-text', '--include-script-sources', '--observation-ms', '1000'],
      ],
      ['bundle', 'analyze-web-bundle', []],
      ['screenshot', 'capture-web-screenshot', []],
    ]) {
      if (options.captures && !options.captures.includes(name)) continue;
      try {
        const raw = await rea([command, endpoint, target.id, ...flags, '--json'], {
          timeout: 600000,
          signal: abort.signal,
        });
        await saveEvidence(options.out, name, raw, manifest);
      } catch (error) {
        manifest.operations[name] = { status: 'failed', error: error.message };
      }
    }
  } catch (error) {
    manifest.limitations.push(error.message);
  } finally {
    stop();
    process.removeListener('SIGINT', stop);
    process.removeListener('SIGTERM', stop);
    // Only a profile created by this invocation is eligible for cleanup.
    if (
      profile &&
      path.dirname(path.resolve(profile)) === path.resolve(os.tmpdir()) &&
      path.basename(profile).startsWith('momo-rea-browser-')
    ) {
      await fs.rm(profile, { recursive: true, force: true }).catch(() => {});
    }
    await fs.writeFile(path.join(options.out, 'manifest.json'), JSON.stringify(manifest, null, 2));
  }
  console.log(JSON.stringify(manifest, null, 2));
  return manifest;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  capture(parseOptions(process.argv.slice(2)))
    .then((manifest) => {
      if (
        manifest &&
        !Object.values(manifest.operations).some((operation) => operation.status === 'captured')
      )
        process.exitCode = 1;
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
