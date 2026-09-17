import type { RuntimeDescriptor } from '@momo/agent-contracts';
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { EventEmitter } from 'node:events';
export class HarnessProcess extends EventEmitter {
  private child: ChildProcessWithoutNullStreams;
  private buffer = '';
  private sequence = 0;
  private pending = new Map<
    string,
    {
      resolve: (value: any) => void;
      reject: (error: Error) => void;
      timer: ReturnType<typeof setTimeout>;
    }
  >();
  private disposed = false;
  hostRequest?: (method: string, params: any, requestId: string) => Promise<unknown>;
  constructor(node: string, entry: string, options: { cwd: string; env: Record<string, string> }) {
    super();
    this.child = spawn(node, [entry, '--profile', 'momo'], {
      cwd: options.cwd,
      env: { ...process.env, ...options.env },
      windowsHide: true,
      stdio: 'pipe',
    });
    this.child.stdout.setEncoding('utf8');
    this.child.stdout.on('data', (data: string) => {
      this.buffer += data;
      if (Buffer.byteLength(this.buffer) > 24 * 1024 * 1024) {
        this.fail(new Error('RPC_FRAME_TOO_LARGE'));
        this.child.kill();
        return;
      }
      let end;
      while ((end = this.buffer.indexOf('\n')) >= 0) {
        const line = this.buffer.slice(0, end);
        this.buffer = this.buffer.slice(end + 1);
        try {
          this.receive(JSON.parse(line));
        } catch {
          this.fail(new Error('HARNESS_PROTOCOL_CORRUPT'));
          this.child.kill();
        }
      }
    });
    this.child.stderr.on('data', () => {
      /* Never forward raw logs: providers may include credentials. */
    });
    this.child.on('error', (error) => this.fail(error));
    this.child.on('exit', (code) => {
      this.fail(new Error('HARNESS_EXIT_' + code));
      this.emit('exit', code);
    });
  }
  private fail(error: Error) {
    for (const item of this.pending.values()) {
      clearTimeout(item.timer);
      item.reject(error);
    }
    this.pending.clear();
  }
  private receive(frame: any) {
    if (frame.event) {
      this.emit('event', frame.event);
      return;
    }
    if (frame.method) {
      if (!['host.tool', 'host.authorize', 'host.cancel'].includes(frame.method)) {
        this.write({ id: frame.id, error: { message: 'Unknown host method' } });
        return;
      }
      if (frame.method === 'host.cancel') {
        this.emit('host.cancel', frame.params.requestId);
        return;
      }
      void Promise.resolve()
        .then(() => this.hostRequest?.(frame.method, frame.params, frame.id))
        .then(
          (result) => this.write({ id: frame.id, result }),
          (error) =>
            this.write({
              id: frame.id,
              error: { message: error instanceof Error ? error.message : 'HOST_ERROR' },
            }),
        );
      return;
    }
    const item = this.pending.get(frame.id);
    if (!item) return;
    clearTimeout(item.timer);
    this.pending.delete(frame.id);
    frame.error ? item.reject(new Error(frame.error.message)) : item.resolve(frame.result);
  }
  private write(frame: unknown) {
    if (!this.child.stdin.destroyed) this.child.stdin.write(JSON.stringify(frame) + '\n');
  }
  request<T = any>(method: string, params: unknown = {}, timeoutMs = 30000): Promise<T> {
    if (this.disposed) return Promise.reject(new Error('HARNESS_DISPOSED'));
    const id = 'req-' + ++this.sequence;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error('HARNESS_RPC_TIMEOUT: ' + method));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      this.write({ id, method, params });
    });
  }
  async describe(): Promise<RuntimeDescriptor> {
    const descriptor = await this.request<RuntimeDescriptor>('describe', {}, 60000);
    if (
      !descriptor ||
      descriptor.protocolVersion !== '1.0' ||
      !Array.isArray(descriptor.capabilities)
    )
      throw new Error('HARNESS_INCOMPATIBLE');
    for (const capability of [
      'stream',
      'cancel',
      'tools',
      'questions',
      'approvals',
      'attachments',
      'resume',
    ]) {
      if (!descriptor.capabilities.includes(capability))
        throw new Error('HARNESS_MISSING_CAPABILITY: ' + capability);
    }
    return descriptor;
  }
  async dispose() {
    if (this.disposed) return;
    try {
      await this.request('shutdown', {}, 5000);
    } catch {
      /* Force termination on failure. */
    }
    this.disposed = true;
    this.fail(new Error('HARNESS_DISPOSED'));
    this.child.kill();
    this.removeAllListeners();
  }
}
