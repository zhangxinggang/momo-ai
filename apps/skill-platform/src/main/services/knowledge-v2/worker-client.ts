import { randomUUID } from 'node:crypto';
import path from 'node:path';

import { utilityProcess, type UtilityProcess } from 'electron';

import { getUserDataPath } from '../../runtime-paths';
import { fromKnowledgeErrorShape, KnowledgeError } from './error';
import type { IKnowledgeWorkerRequest, IKnowledgeWorkerResponse } from './protocol';

interface IPendingCall {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
  initialization?: boolean;
}

export class KnowledgeWorkerClient {
  private child?: UtilityProcess;
  private startPromise?: Promise<void>;
  private terminalFailure?: KnowledgeError;
  private readonly pending = new Map<string, IPendingCall>();

  private start(): Promise<void> {
    if (this.terminalFailure) return Promise.reject(this.terminalFailure);
    if (this.child?.pid) return Promise.resolve();
    if (this.startPromise) return this.startPromise;

    this.startPromise = new Promise<void>((resolve, reject) => {
      const workerPath = path.join(__dirname, '../knowledge-worker/knowledge-worker.js');
      const child = utilityProcess.fork(workerPath, [], {
        serviceName: 'AIM Knowledge V2',
        stdio: 'pipe',
      });
      this.child = child;
      child.stdout?.on('data', (chunk) => console.log(`[knowledge-v2] ${String(chunk).trimEnd()}`));
      child.stderr?.on('data', (chunk) =>
        console.error(`[knowledge-v2] ${String(chunk).trimEnd()}`),
      );
      child.on('message', (message: IKnowledgeWorkerResponse) => this.handleMessage(message));
      child.once('spawn', () => {
        const id = randomUUID();
        this.pending.set(id, {
          resolve: () => resolve(),
          reject,
          initialization: true,
        });
        child.postMessage({
          id,
          method: 'initialize',
          args: [path.join(getUserDataPath(), 'knowledge-v2')],
        } satisfies IKnowledgeWorkerRequest);
      });
      child.once('exit', (code) => this.handleExit(code));
      child.once('error', (_type, location, report) => {
        const error = new KnowledgeError({
          code: 'KNOWLEDGE_WORKER_FATAL',
          stage: 'initialize',
          message: `知识库工作进程启动失败：${location}`,
          details: { report },
          allowedManualActions: ['open_logs'],
        });
        this.terminalFailure = error;
        reject(error);
      });
    }).finally(() => {
      this.startPromise = undefined;
    });
    return this.startPromise;
  }

  async call<T>(method: string, ...args: unknown[]): Promise<T> {
    await this.start();
    const child = this.child;
    if (!child?.pid) {
      throw new KnowledgeError({
        code: 'KNOWLEDGE_WORKER_UNAVAILABLE',
        stage: 'initialize',
        message: '知识库工作进程不可用，请重启应用后处理',
        allowedManualActions: ['open_logs'],
      });
    }
    const id = randomUUID();
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as (value: unknown) => void, reject });
      child.postMessage({ id, method, args } satisfies IKnowledgeWorkerRequest);
    });
  }

  dispose(): void {
    const child = this.child;
    this.child = undefined;
    child?.kill();
  }

  private handleMessage(message: IKnowledgeWorkerResponse): void {
    const pending = this.pending.get(message.id);
    if (!pending) return;
    this.pending.delete(message.id);
    if ('value' in message) {
      pending.resolve(message.value);
      return;
    }
    const error = fromKnowledgeErrorShape(message.error);
    if (pending.initialization) {
      this.terminalFailure = error;
      this.child?.kill();
    }
    pending.reject(error);
  }

  private handleExit(code: number): void {
    this.child = undefined;
    const error =
      this.terminalFailure ||
      new KnowledgeError({
        code: 'KNOWLEDGE_WORKER_EXITED',
        stage: 'initialize',
        message: `知识库工作进程已退出（code ${code}），不会自动恢复，请重启应用后手动处理任务`,
        details: { exitCode: code },
        allowedManualActions: ['open_logs'],
      });
    this.terminalFailure = error;
    for (const pending of this.pending.values()) pending.reject(error);
    this.pending.clear();
  }
}

export const knowledgeWorkerClient = new KnowledgeWorkerClient();
