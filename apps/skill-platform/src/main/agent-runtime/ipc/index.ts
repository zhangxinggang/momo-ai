import {
  AGENT_CHANNEL,
  AGENT_EVENT_CHANNEL,
  type RuntimeTurnInput,
  validateTurn,
} from '@momo/agent-contracts';
import type { Database } from 'better-sqlite3';
import { app, BrowserWindow, dialog, ipcMain, type IpcMainInvokeEvent } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getProjectRoot, getUserDataPath } from '../../runtime-paths';
import { ChatApplicationService } from '../application/service';
import { AgentStore } from '../persistence/store';
import { RuntimeBundles } from '../supervisor/bundles';
import type { CustomToolWorkspaceService } from '../../services/custom-tool/workspace';
let service: ChatApplicationService | undefined;
export async function refreshCustomToolCatalog() {
  await service?.refreshCustomTools();
}
const owners = new Map<string, number>();
const watchedSenders = new Set<number>();
function validateSender(event: any) {
  if (!BrowserWindow.fromWebContents(event.sender) || event.senderFrame !== event.sender.mainFrame)
    throw new Error('UNTRUSTED_IPC_SENDER');
  const url = event.senderFrame?.url ?? '';
  if (!url.startsWith('file:') && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(url))
    throw new Error('UNTRUSTED_IPC_ORIGIN');
}
export function registerAgentRuntimeIPC(db: Database, customTools?: CustomToolWorkspaceService) {
  void service?.dispose();
  const root = path.join(getUserDataPath(), 'agent-runtimes');
  const builtin = app.isPackaged
    ? path.join(process.resourcesPath, 'harness-builtin.asar')
    : path.join(getProjectRoot(), '../../packages/momo-harness-runner/dist');
  const store = new AgentStore(db);
  const bundles = new RuntimeBundles(
    path.join(root, 'bundles'),
    builtin,
    app.isPackaged ? path.join(root, 'builtin-cache') : undefined,
  );
  service = new ChatApplicationService(store, bundles, root, customTools);
  service.onEvent = (event) => {
    for (const window of BrowserWindow.getAllWindows())
      if (
        (!owners.has(event.sessionId) || owners.get(event.sessionId) === window.webContents.id) &&
        !window.webContents.isDestroyed()
      )
        window.webContents.send(AGENT_EVENT_CHANNEL, event);
  };
  ipcMain.removeHandler(AGENT_CHANNEL);
  const ownRun = (event: IpcMainInvokeEvent, runId: string, allowMissing = false) => {
    if (typeof runId !== 'string' || !runId.trim() || runId.length > 200)
      throw new Error('INVALID_RUN_ID');
    const run = store.run(runId);
    if (!run) {
      if (allowMissing) return null;
      throw new Error('UNKNOWN_RUN');
    }
    const owner = owners.get(run.session_id);
    if (owner && owner !== event.sender.id) throw new Error('SESSION_OWNED_BY_OTHER_WINDOW');
    return run;
  };
  ipcMain.handle(AGENT_CHANNEL, async (event, operation: string, input: any = {}) => {
    validateSender(event);
    if (!service) throw new Error('Runtime not initialized');
    switch (operation) {
      case 'describe':
        return service.describe();
      case 'listAgents':
        return service.listAgents(input.sessionId);
      case 'startTurn': {
        validateTurn(input);
        const turn = input as RuntimeTurnInput;
        const owner = owners.get(turn.sessionId);
        if (owner && owner !== event.sender.id) throw new Error('SESSION_OWNED_BY_OTHER_WINDOW');
        owners.set(turn.sessionId, event.sender.id);
        if (!watchedSenders.has(event.sender.id)) {
          watchedSenders.add(event.sender.id);
          event.sender.once('destroyed', () => {
            watchedSenders.delete(event.sender.id);
            for (const [id, sender] of owners) if (sender === event.sender.id) owners.delete(id);
          });
        }
        return service.start(turn);
      }
      case 'respond':
        ownRun(event, input.runId);
        return service.respond(input);
      case 'controlGoal':
      case 'exportSession': {
        const owner = owners.get(input.sessionId);
        if (owner && owner !== event.sender.id) throw new Error('SESSION_OWNED_BY_OTHER_WINDOW');
        return operation === 'controlGoal'
          ? service.controlGoal(input.sessionId, input.action)
          : service.exportSession(input.sessionId);
      }
      case 'clearSession': {
        const owner = owners.get(input.sessionId);
        if (owner && owner !== event.sender.id) throw new Error('SESSION_OWNED_BY_OTHER_WINDOW');
        return service.clearSession(input.sessionId);
      }
      case 'setPermission': {
        const owner = owners.get(input.sessionId);
        if (owner && owner !== event.sender.id) throw new Error('SESSION_OWNED_BY_OTHER_WINDOW');
        return service.setPermission(input.sessionId, input.mode);
      }
      case 'cancel': {
        if (input.runId) {
          // Cleanup/stop can race with restored history whose durable run is already gone.
          if (!ownRun(event, input.runId, true)) return;
        } else if (owners.get(input.sessionId) !== event.sender.id)
          throw new Error('UNKNOWN_SESSION_OWNER');
        return service.cancelPending(input);
      }
      case 'events':
        if (!ownRun(event, input.runId, true)) return null;
        return store.events(input.runId, Number.isSafeInteger(input.afterSeq) ? input.afterSeq : 0);
      case 'fileChanges':
        ownRun(event, input.runId);
        return service.fileChanges.list(input.runId);
      case 'reviewChange':
        ownRun(event, input.runId);
        if (typeof input.path !== 'string') throw new Error('INVALID_FILE_PATH');
        return service.fileChanges.review(input.runId, input.path);
      case 'correctChange':
      case 'undoChanges': {
        const run = ownRun(event, input.runId);
        const busy = store.db
          .prepare(
            "SELECT id FROM agent_runs WHERE session_id=? AND status IN ('starting','running','cancelling') LIMIT 1",
          )
          .get(run.session_id);
        if (busy) throw new Error('请等待本轮完成或停止生成后再修改文件');
        if (operation === 'undoChanges') return service.fileChanges.undo(input.runId);
        if (
          typeof input.path !== 'string' ||
          typeof input.content !== 'string' ||
          typeof input.revision !== 'string'
        )
          throw new Error('INVALID_CORRECTION');
        return service.fileChanges.correct(input.runId, input.path, input.content, input.revision);
      }
      case 'sessionBinding':
        return store.session(input.sessionId) ?? null;
      case 'saveSources': {
        if (!Array.isArray(input) || input.length > 10) throw new Error('INVALID_SOURCES');
        const refs = [];
        for (const source of input) {
          if (source.sourceRef) {
            await service.sources.load([source.sourceRef]);
            refs.push(source.sourceRef);
          } else
            refs.push(
              await service.sources.save({
                ...source,
                originalAvailable: source.encoding === 'base64',
              }),
            );
        }
        return refs;
      }
      case 'loadSources':
        return service.sources.load(input);
      case 'prepareAttachment': {
        const { name, mimeType, data } = input;
        const ref = await service.sources.save({
          name,
          mimeType,
          encoding: 'base64',
          content: data,
          originalAvailable: true,
        });
        // Return as soon as the original is durable; start() admits it into the session's Harness.
        return { ref, state: 'ready' };
      }
      case 'syncProjects': {
        if (!Array.isArray(input) || input.length > 1000) throw new Error('INVALID_PROJECTS');
        for (const project of input) {
          if (typeof project.id !== 'string' || !Array.isArray(project.folderPaths))
            throw new Error('INVALID_PROJECT');
          const roots = await Promise.all(
            project.folderPaths.map((root: string) => fs.realpath(root)),
          );
          store.set('project:' + project.id, JSON.stringify({ ...project, folderPaths: roots }));
        }
        return true;
      }
      case 'toolCatalog':
        return service.toolCatalog(input.projectId);
      case 'setToolPolicy':
        return service.setToolPolicy(input.projectId, input.ids);
      case 'exportToolCatalog': {
        const catalog = await service.toolCatalog(input.projectId);
        const result = await dialog.showSaveDialog(BrowserWindow.fromWebContents(event.sender)!, {
          title: '导出 Harness 工具清单',
          defaultPath: 'harness-tool-catalog.json',
          filters: [{ name: 'JSON', extensions: ['json'] }],
        });
        if (!result.canceled && result.filePath)
          await fs.writeFile(result.filePath, JSON.stringify(catalog, null, 2));
        return !result.canceled;
      }
      case 'saveArtifact': {
        const artifact = await service.artifacts.load(input.id);
        ownRun(event, artifact.metadata.runId);
        const choice = await dialog.showSaveDialog(BrowserWindow.fromWebContents(event.sender)!, {
          title: '保存问答产物',
          defaultPath: artifact.metadata.name,
        });
        if (!choice.canceled && choice.filePath)
          await fs.writeFile(choice.filePath, artifact.bytes);
        return !choice.canceled;
      }
      case 'bundles':
        return bundles.list();
      case 'importBundle': {
        const result = await dialog.showOpenDialog(BrowserWindow.fromWebContents(event.sender)!, {
          title: '选择完整的 Harness 运行包目录',
          properties: ['openDirectory'],
        });
        if (result.canceled) return null;
        return bundles.import(result.filePaths[0], (root, manifest) =>
          service!.probe(root, manifest),
        );
      }
      case 'clearGrants':
        store.db.prepare('DELETE FROM agent_grants WHERE project_id=?').run(input.projectId);
        return true;
      default:
        throw new Error('UNKNOWN_RUNTIME_OPERATION');
    }
  });
}

export async function disposeAgentRuntime() {
  await service?.dispose();
  service = undefined;
}
