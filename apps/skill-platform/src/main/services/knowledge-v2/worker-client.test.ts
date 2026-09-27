import { EventEmitter } from 'node:events';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { KnowledgeWorkerClient } from './worker-client';

const mocks = vi.hoisted(() => ({ fork: vi.fn() }));
vi.mock('electron', () => ({ utilityProcess: { fork: mocks.fork } }));
vi.mock('../../runtime-paths', () => ({ getUserDataPath: () => '/test-data' }));
class Worker extends EventEmitter {
  pid = 123;
  postMessage = vi.fn();
  kill = vi.fn();
  respond(index: number, value: unknown) {
    this.emit('message', { id: this.postMessage.mock.calls[index][0].id, ok: true, value });
  }
}
let client: KnowledgeWorkerClient;
let workers: Worker[];
beforeEach(() => {
  vi.useFakeTimers();
  workers = [];
  mocks.fork.mockReset().mockImplementation(() => {
    const worker = new Worker();
    workers.push(worker);
    return worker;
  });
  client = new KnowledgeWorkerClient();
});
afterEach(() => {
  client.dispose();
  vi.useRealTimers();
});
async function ready(worker = workers.at(-1)!) {
  worker.emit('spawn');
  worker.respond(0, { ready: true });
  await vi.advanceTimersByTimeAsync(0);
}

it('shares initialization, and never sends calls just because a pid exists', async () => {
  const first = client.call('listCollections');
  workers[0].emit('spawn');
  const second = client.call('createCollection', '测试知识库');
  expect(mocks.fork).toHaveBeenCalledTimes(1);
  expect(workers[0].postMessage).toHaveBeenCalledTimes(1);
  workers[0].respond(0, { ready: true });
  await vi.advanceTimersByTimeAsync(0);
  workers[0].respond(1, []);
  workers[0].respond(2, { id: 'collection' });
  expect(await first).toEqual([]);
  expect(await second).toEqual({ id: 'collection' });
});

it('recovers after exit, rejects in-flight writes without replay, and ignores stale worker exits', async () => {
  const write = client.call('createCollection', '集合');
  const rejected = expect(write).rejects.toMatchObject({ code: 'KNOWLEDGE_WORKER_EXITED' });
  await ready();
  workers[0].emit('exit', 1);
  await rejected;
  await vi.advanceTimersByTimeAsync(500);
  expect(workers).toHaveLength(2);
  const read = client.call('listCollections');
  await ready();
  workers[0].emit('exit', 1);
  expect(workers[1].postMessage.mock.calls.map(([request]) => request.method)).toEqual([
    'initialize',
    'listCollections',
  ]);
  workers[1].respond(1, [{ id: 'saved-before-crash' }]);
  expect(await read).toEqual([{ id: 'saved-before-crash' }]);
});

it('settles an exit before spawn and permits the next request to create a new worker', async () => {
  const failed = client.call('listCollections');
  const rejected = expect(failed).rejects.toMatchObject({ code: 'KNOWLEDGE_WORKER_EXITED' });
  workers[0].emit('exit', 1);
  await rejected;
  const next = client.call('createCollection', '重试');
  await ready();
  workers[1].respond(1, { id: 'ok' });
  expect(await next).toEqual({ id: 'ok' });
});

it('times out initialization and stops recovery after disposal', async () => {
  const pending = client.call('listCollections');
  const rejected = expect(pending).rejects.toThrow('启动超时');
  await vi.advanceTimersByTimeAsync(30_000);
  await rejected;
  const next = client.call('listCollections');
  const disposed = expect(next).rejects.toThrow('服务已关闭');
  client.dispose();
  await disposed;
  await vi.advanceTimersByTimeAsync(60_000);
  expect(workers).toHaveLength(2);
  await expect(client.call('listCollections')).rejects.toThrow('服务已关闭');
});
