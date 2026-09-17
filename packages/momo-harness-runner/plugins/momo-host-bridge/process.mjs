/** Model-authored code runs in the same execution world as native attachment paths. */
export async function runManagedCode(subprocess, input, signal) {
  if (!['python', 'node', 'powershell'].includes(input.runtime) || typeof input.code !== 'string' || !input.code || input.code.length > 100000) throw Error('INVALID_EXECUTION');
  const timeoutMs = input.timeoutMs ?? 30000;
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120000) throw Error('INVALID_EXECUTION_TIMEOUT');
  const timeout = AbortSignal.timeout(timeoutMs);
  const deadline = AbortSignal.any([signal, timeout]);
  const program = input.runtime === 'node' ? process.execPath : input.runtime;
  const executable = await subprocess.resolveExecutable(program, undefined, deadline);
  deadline.throwIfAborted();
  const args = input.runtime === 'node' ? ['-e', input.code]
    : input.runtime === 'python' ? ['-X', 'utf8', '-c', input.code]
    : ['-NoLogo', '-NoProfile', '-NonInteractive', '-EncodedCommand', Buffer.from(input.code, 'utf16le').toString('base64')];
  const child = subprocess.spawn({
    argv: [executable, ...args], cwd: input.cwd, signal: deadline, graceMs: 1000,
    stdio: { stdin: 'ignore', stdout: { maxBytes: 64000 }, stderr: { maxBytes: 16000 } },
    env: { PYTHONIOENCODING: 'utf-8', NO_COLOR: '1' },
  });
  try {
    const outcome = await child.done;
    const stdout = child.collected.stdout.readFrom(0), stderr = child.collected.stderr.readFrom(0);
    return { ...outcome, stdout: stdout.text, stderr: stderr.text, truncated: stdout.lossy || stderr.lossy,
      timedOut: timeout.aborted, aborted: signal.aborted };
  } finally {
    // Join the managed range, including descendants, before releasing the tool call.
    child.terminate();
    await child.waitForExit(AbortSignal.timeout(3000));
  }
}
