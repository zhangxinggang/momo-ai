import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { utilityProcess, type UtilityProcess } from 'electron';
import { getUserDataPath } from '../../runtime-paths';
import { fromKnowledgeErrorShape, KnowledgeError } from './error';
import type { IKnowledgeWorkerRequest, IKnowledgeWorkerResponse } from './protocol';

interface IPendingCall {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}

export class KnowledgeWorkerClient {
  private child?: UtilityProcess;
  private startPromise?: Promise<void>;
  private ready = false;
  private disposed = false;
  private recoveryAttempts = 0;
  private recoveryTimer?: ReturnType<typeof setTimeout>;
  private stopWorker?: (error: KnowledgeError) => void;
  private readonly pending = new Map<string, IPendingCall>();

  private start(): Promise<void> {
    if (this.disposed) return Promise.reject(new Error('知识库服务已关闭'));
    // pid is assigned before initialize completes; all callers must await readiness.
    if (this.startPromise) return this.startPromise;
    if (this.ready && this.child?.pid) return Promise.resolve();
    clearTimeout(this.recoveryTimer);
    this.startPromise = new Promise<void>((resolve, reject) => {
      const child = utilityProcess.fork(
        path.join(__dirname, '../knowledge-worker/knowledge-worker.js'),
        [],
        { serviceName: 'AIM Knowledge V2', stdio: 'pipe' },
      );
      this.child = child;
      let diagnostic = '';
      const timer = setTimeout(
        () =>
          fail(
            new KnowledgeError({
              code: 'KNOWLEDGE_WORKER_UNAVAILABLE',
              stage: 'initialize',
              message: '知识库工作进程启动超时，请重试',
              allowedManualActions: ['open_logs'],
            }),
          ),
        30_000,
      );
      const fail = (error: KnowledgeError) => {
        if (this.child !== child) return;
        clearTimeout(timer);
        const wasReady = this.ready;
        this.ready = false;
        this.child = undefined;
        this.stopWorker = undefined;
        reject(error);
        const calls = [...this.pending.values()];
        this.pending.clear();
        for (const call of calls) call.reject(error);
        child.kill();
        // Recover the service, never replay a possibly committed mutation.
        if (!this.disposed && wasReady && this.recoveryAttempts < 2) {
          this.recoveryAttempts += 1;
          this.recoveryTimer = setTimeout(() => {
            void this.start().catch((reason) => console.error('[knowledge-v2] 恢复失败', reason));
          }, this.recoveryAttempts * 500);
        }
      };
      this.stopWorker = fail;
      child.stdout?.on('data', (chunk) => console.log(`[knowledge-v2] ${String(chunk).trimEnd()}`));
      child.stderr?.on('data', (chunk) => {
        diagnostic = (diagnostic + String(chunk)).slice(-8000);
        console.error(`[knowledge-v2] ${String(chunk).trimEnd()}`);
      });
      child.on('message', (message: IKnowledgeWorkerResponse) => {
        if (this.child !== child) return;
        const call = this.pending.get(message.id);
        if (!call) return;
        this.pending.delete(message.id);
        if ('value' in message) call.resolve(message.value);
        else call.reject(fromKnowledgeErrorShape(message.error));
      });
      child.once('spawn', () => {
        if (this.child !== child) return;
        const id = randomUUID();
        this.pending.set(id, {
          resolve: () => {
            clearTimeout(timer);
            this.ready = true;
            resolve();
          },
          reject: (error) => {
            fail(error as KnowledgeError);
            reject(error);
          },
        });
        try {
          child.postMessage({
            id,
            method: 'initialize',
            args: [path.join(getUserDataPath(), 'knowledge-v2')],
          } satisfies IKnowledgeWorkerRequest);
        } catch (error) {
          fail(
            new KnowledgeError({
              code: 'KNOWLEDGE_WORKER_UNAVAILABLE',
              stage: 'initialize',
              message: String(error),
              allowedManualActions: ['open_logs'],
            }),
          );
        }
      });
      child.once('exit', (code) =>
        fail(
          new KnowledgeError({
            code: 'KNOWLEDGE_WORKER_EXITED',
            stage: 'initialize',
            message: `知识库工作进程已退出（code ${code}），服务将重新启动，请重试当前操作`,
            details: { exitCode: code, stderr: diagnostic },
            allowedManualActions: ['open_logs'],
          }),
        ),
      );
      child.once('error', (_type, location, report) =>
        fail(
          new KnowledgeError({
            code: 'KNOWLEDGE_WORKER_FATAL',
            stage: 'initialize',
            message: `知识库工作进程启动失败：${location}，请重试`,
            details: { report, stderr: diagnostic },
            allowedManualActions: ['open_logs'],
          }),
        ),
      );
    }).finally(() => {
      this.startPromise = undefined;
    });
    return this.startPromise;
  }

  async call<T>(method: string, ...args: unknown[]): Promise<T> {
    await this.start();
    const child = this.child;
    if (!child?.pid || !this.ready) throw new Error('知识库工作进程不可用，请重试');
    const id = randomUUID();
    const result = await new Promise<T>((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as (value: unknown) => void, reject });
      try {
        child.postMessage({ id, method, args } satisfies IKnowledgeWorkerRequest);
      } catch (error) {
        this.pending.delete(id);
        reject(error);
      }
    });
    this.recoveryAttempts = 0;
    return result;
  }

  dispose(): void {
    this.disposed = true;
    clearTimeout(this.recoveryTimer);
    this.stopWorker?.(
      new KnowledgeError({
        code: 'KNOWLEDGE_WORKER_UNAVAILABLE',
        stage: 'initialize',
        message: '知识库服务已关闭',
        allowedManualActions: ['open_logs'],
      }),
    );
  }
}

export const knowledgeWorkerClient = new KnowledgeWorkerClient();
