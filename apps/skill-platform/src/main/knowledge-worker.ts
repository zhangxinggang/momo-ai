import { KnowledgeV2Service } from './services/knowledge-v2';
import { serializeKnowledgeError } from './services/knowledge-v2/error';
import type {
  IKnowledgeWorkerRequest,
  IKnowledgeWorkerResponse,
} from './services/knowledge-v2/protocol';

let service: KnowledgeV2Service | undefined;

async function dispatch(request: IKnowledgeWorkerRequest): Promise<unknown> {
  if (request.method === 'initialize') {
    if (service) throw new Error('Knowledge worker is already initialized');
    service = new KnowledgeV2Service(String(request.args[0]));
    return { ready: true };
  }
  if (!service) throw new Error('Knowledge worker is not initialized');
  const target = service as unknown as Record<string, (...args: unknown[]) => unknown>;
  const method = target[request.method];
  if (typeof method !== 'function' || request.method === 'close') {
    throw new Error(`Unknown knowledge worker method: ${request.method}`);
  }
  return method.apply(service, request.args);
}

process.parentPort.on('message', (event: Electron.MessageEvent) => {
  const request = event.data as IKnowledgeWorkerRequest;
  void dispatch(request)
    .then((value) => {
      process.parentPort.postMessage({
        id: request.id,
        ok: true,
        value,
      } satisfies IKnowledgeWorkerResponse);
    })
    .catch((error) => {
      process.parentPort.postMessage({
        id: request.id,
        ok: false,
        error: serializeKnowledgeError(error),
      } satisfies IKnowledgeWorkerResponse);
    });
});
