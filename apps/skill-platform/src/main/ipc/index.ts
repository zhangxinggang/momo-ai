import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type { Database } from 'better-sqlite3';
import { ipcMain } from 'electron';
import { registerAgentRuntimeIPC } from '../agent-runtime/ipc';
import { SkillDB } from '../database';
import { customToolWorkspaceService } from '../services/custom-tool';
import { registerAgentAppIPC } from './agent-app';
import { registerAIIPC } from './ai';
import { registerAichatIPC } from './aichat-handlers';
import { registerApiRequestIPC } from './api-request';
import { registerBuiltinSkillsIPC } from './builtin-skills';
import { registerCustomToolIPC } from './custom-tool';
import { registerDataIPC } from './data';
import { registerDialogIPC } from './dialog';
import { registerFsIPC } from './fs';
import { registerImageIPC } from './image';
import { KNOWLEDGE_CHANNELS, registerKbIPC } from './kb';
import { registerMcpIPC, startMcpHub } from './mcp';
import { registerNoteIPC } from './note';
import { registerNotificationIPC } from './notification';
import { registerOnlineConfIPC } from './online-conf';
import { registerRulesIPC } from './rules';
import { registerScraperIPC } from './scraper';
import { registerSettingsIPC } from './settings';
import { registerShellIPC } from './shell';
import { registerSkillIPC } from './skill';
import { registerSystemIPC } from './system';
import { registerWindowChromeIPC } from './window-chrome';
import { registerWorkspaceIPC } from './workspace';

const REBINDABLE_DB_CHANNELS = [
  IPC_CHANNELS.SETTINGS_GET,
  IPC_CHANNELS.SETTINGS_SET,
  IPC_CHANNELS.SKILL_CREATE,
  IPC_CHANNELS.SKILL_GET,
  IPC_CHANNELS.SKILL_GET_ALL,
  IPC_CHANNELS.SKILL_UPDATE,
  IPC_CHANNELS.SKILL_DELETE,
  IPC_CHANNELS.SKILL_SEARCH,
  IPC_CHANNELS.SKILL_EXPORT,
  IPC_CHANNELS.SKILL_IMPORT,
  IPC_CHANNELS.SKILL_SCAN_LOCAL,
  IPC_CHANNELS.SKILL_SCAN_LOCAL_PREVIEW,
  IPC_CHANNELS.SKILL_LIST_DEFAULT_SKILLS,
  IPC_CHANNELS.SKILL_IMPORT_DEFAULT_SKILLS,
  IPC_CHANNELS.SKILL_PREVIEW_LOCAL_ZIPS,
  IPC_CHANNELS.SKILL_IMPORT_LOCAL_ZIPS,
  IPC_CHANNELS.SKILL_SCAN_SAFETY,
  IPC_CHANNELS.SKILL_SAVE_SAFETY_REPORT,
  IPC_CHANNELS.SKILL_INSTALL_TO_PLATFORM,
  IPC_CHANNELS.SKILL_UNINSTALL_FROM_PLATFORM,
  IPC_CHANNELS.SKILL_GET_PLATFORM_STATUS,
  IPC_CHANNELS.SKILL_GET_SUPPORTED_PLATFORMS,
  IPC_CHANNELS.SKILL_DETECT_PLATFORMS,
  IPC_CHANNELS.SKILL_INSTALL_MD,
  IPC_CHANNELS.SKILL_UNINSTALL_MD,
  IPC_CHANNELS.SKILL_GET_MD_INSTALL_STATUS,
  IPC_CHANNELS.SKILL_GET_MD_INSTALL_STATUS_BATCH,
  IPC_CHANNELS.SKILL_INSTALL_MD_SYMLINK,
  IPC_CHANNELS.SKILL_FETCH_REMOTE_CONTENT,
  IPC_CHANNELS.SKILL_LIST_LOCAL_FILES,
  IPC_CHANNELS.SKILL_READ_LOCAL_FILE,
  IPC_CHANNELS.SKILL_READ_LOCAL_FILES,
  IPC_CHANNELS.SKILL_RENAME_LOCAL_PATH,
  IPC_CHANNELS.SKILL_WRITE_LOCAL_FILE,
  IPC_CHANNELS.SKILL_DELETE_LOCAL_FILE,
  IPC_CHANNELS.SKILL_CREATE_LOCAL_DIR,
  IPC_CHANNELS.SKILL_SAVE_TO_REPO,
  IPC_CHANNELS.SKILL_GET_REPO_PATH,
  IPC_CHANNELS.SKILL_SYNC_FROM_REPO,
  IPC_CHANNELS.SKILL_EXECUTE_WORKSPACE,
  IPC_CHANNELS.SKILL_ENSURE_SESSION_WORKSPACE,
  IPC_CHANNELS.SKILL_WRITE_SESSION_FILE,
  ...KNOWLEDGE_CHANNELS,
] as const;

function resetAllRegisteredIpcHandlers(): void {
  for (const channel of REBINDABLE_DB_CHANNELS) {
    ipcMain.removeHandler(channel);
  }
}

/**
 * 注册不依赖数据库的 IPC（应用启动时调用）
 */
export function registerBootstrapIPC(): void {
  registerBuiltinSkillsIPC();
  registerDialogIPC();
  registerFsIPC();
  registerDataIPC();
  registerShellIPC();
  registerNotificationIPC();
  registerWindowChromeIPC();
  // 工作区检索不依赖数据库，提前注册避免窗口加载后调用 listTree/grep 无 handler
  registerWorkspaceIPC();
  // Agent 应用探测不依赖数据库
  registerAgentAppIPC();
  // MCP 不依赖数据库
  registerMcpIPC();
  void startMcpHub().catch((error) => {
    console.error('[mcp] startMcpHub failed:', error);
  });
}

/**
 * Register all IPC handlers
 * 注册所有 IPC 处理器
 */
export function registerAllIPC(db: Database): void {
  resetAllRegisteredIpcHandlers();

  const skillDB = new SkillDB();
  registerSkillIPC(skillDB);
  registerSettingsIPC(db);
  registerAgentRuntimeIPC(db, customToolWorkspaceService);
  registerImageIPC();
  registerAIIPC();
  registerAichatIPC();
  registerKbIPC();
  registerScraperIPC();
  registerOnlineConfIPC();
  registerSystemIPC();
  registerRulesIPC();
  registerNoteIPC();
  registerApiRequestIPC();
  registerCustomToolIPC();
}
