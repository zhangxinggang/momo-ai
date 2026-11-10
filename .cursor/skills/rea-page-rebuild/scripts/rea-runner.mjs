import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export const REA_VERSION = '6.8.0';
export const NODE_VERSION = '24.22.1';
export function npmCli() {
  const candidates = [
    process.env.REA_NPM_CLI,
    process.env.npm_execpath,
    path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'),
    path.resolve(path.dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js'),
  ];
  const found = candidates.find(
    (candidate) =>
      candidate && path.basename(candidate) === 'npm-cli.js' && fs.existsSync(candidate),
  );
  if (!found)
    throw new Error('未找到 npm。请安装含 npm 的 Node.js，或设置 REA_NPM_CLI 指向 npm-cli.js');
  return found;
}
export function runRea(args, { timeout = 180000, cwd = process.cwd(), signal } = {}) {
  signal?.throwIfAborted();
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        npmCli(),
        'exec',
        '--yes',
        `--package=node@${NODE_VERSION}`,
        `--package=rea-agents@${REA_VERSION}`,
        '--',
        'rea',
        ...args,
      ],
      {
        cwd,
        windowsHide: true,
        shell: false,
        detached: process.platform !== 'win32',
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );
    const chunks = [],
      errors = [];
    let size = 0,
      overflow = false,
      timedOut = false,
      stopping = false;
    const stop = () => {
      if (stopping || !child.pid) return;
      stopping = true;
      if (process.platform === 'win32') {
        const killer = spawn('taskkill.exe', ['/pid', String(child.pid), '/T', '/F'], {
          windowsHide: true,
          stdio: 'ignore',
          shell: false,
        });
        killer.once('error', () => child.kill());
      } else {
        try {
          process.kill(-child.pid, 'SIGKILL');
        } catch {
          child.kill();
        }
      }
    };
    signal?.addEventListener('abort', stop, { once: true });
    if (signal?.aborted) stop();
    const timer = setTimeout(() => {
      timedOut = true;
      stop();
    }, timeout);
    for (const [stream, output] of [
      [child.stdout, chunks],
      [child.stderr, errors],
    ])
      stream.on('data', (chunk) => {
        size += chunk.length;
        if (size > 64 * 1024 * 1024) {
          overflow = true;
          stop();
        } else output.push(chunk);
      });
    child.once('error', (error) => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', stop);
      reject(error);
    });
    child.once('close', (code, killed) => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', stop);
      const stdout = Buffer.concat(chunks).toString('utf8'),
        stderr = Buffer.concat(errors).toString('utf8');
      if (signal?.aborted) reject(signal.reason || new Error('REA 已取消'));
      else if (code !== 0 || overflow || timedOut)
        reject(
          new Error(
            timedOut
              ? 'REA 执行超时'
              : overflow
                ? 'REA 输出超过 64 MiB'
                : `REA 执行失败 (${code ?? killed})：${stderr.slice(-6000) || stdout.slice(-6000)}`,
          ),
        );
      else resolve(stdout);
    });
  });
}
