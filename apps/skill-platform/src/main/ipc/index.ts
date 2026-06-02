import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type { Database } from 'better-sqlite3';
import { ipcMain } from 'electron';
import { registerClaudeCodeIPC } from '../../claude-code/main/register';
import { FolderDB, PromptDB, SkillDB, WorkflowDB } from '../database';
import { WorkflowBusinessController } from '../database/controller/workflow-business';
import { WorkflowFolderController } from '../database/controller/workflow-folder';
import { registerAIIPC } from './ai';
import { registerAichatIPC } from './aichat-handlers';
import { registerFolderIPC } from './folder';
import { registerImageIPC } from './image';
import { registerKbIPC } from './kb';
import { registerOnlineConfIPC } from './online-conf';
import { registerPromptIPC } from './prompt';
import { registerScraperIPC } from './scraper';
import { registerSettingsIPC } from './settings';
import { registerSkillIPC } from './skill';
import { registerSystemIPC } from './system';
import { registerWorkflowIPC } from './workflow';
import { registerWorkflowAgentIPC } from './workflow-agent';
import { registerWorkflowBusinessIPC } from './workflow-business';
import { registerWorkflowFolderIPC } from './workflow-folder';
import { registerWorkspaceIPC } from './workspace';

const REBINDABLE_DB_CHANNELS = [
  IPC_CHANNELS.PROMPT_CREATE,
  IPC_CHANNELS.PROMPT_GET,
  IPC_CHANNELS.PROMPT_GET_ALL,
  IPC_CHANNELS.PROMPT_UPDATE,
  IPC_CHANNELS.PROMPT_DELETE,
  IPC_CHANNELS.PROMPT_SEARCH,
  IPC_CHANNELS.PROMPT_COPY,
  IPC_CHANNELS.PROMPT_INSERT_DIRECT,
  IPC_CHANNELS.PROMPT_SYNC_WORKSPACE,
  IPC_CHANNELS.VERSION_GET_ALL,
  IPC_CHANNELS.VERSION_CREATE,
  IPC_CHANNELS.VERSION_ROLLBACK,
  IPC_CHANNELS.VERSION_DELETE,
  IPC_CHANNELS.VERSION_INSERT_DIRECT,
  IPC_CHANNELS.FOLDER_CREATE,
  IPC_CHANNELS.FOLDER_GET_ALL,
  IPC_CHANNELS.FOLDER_UPDATE,
  IPC_CHANNELS.FOLDER_DELETE,
  IPC_CHANNELS.FOLDER_REORDER,
  IPC_CHANNELS.FOLDER_INSERT_DIRECT,
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
  IPC_CHANNELS.WORKFLOW_CREATE,
  IPC_CHANNELS.WORKFLOW_GET,
  IPC_CHANNELS.WORKFLOW_GET_ALL,
  IPC_CHANNELS.WORKFLOW_UPDATE,
  IPC_CHANNELS.WORKFLOW_DELETE,
  IPC_CHANNELS.WORKFLOW_BUSINESS_CREATE,
  IPC_CHANNELS.WORKFLOW_BUSINESS_GET_ALL,
  IPC_CHANNELS.WORKFLOW_BUSINESS_UPDATE,
  IPC_CHANNELS.WORKFLOW_BUSINESS_DELETE,
  IPC_CHANNELS.WORKFLOW_BUSINESS_DELETE_BY_WORKFLOW,
  IPC_CHANNELS.WORKFLOW_BUSINESS_HAS_ANY,
  IPC_CHANNELS.KB_LIST_COLLECTIONS,
  IPC_CHANNELS.KB_CREATE_COLLECTION,
  IPC_CHANNELS.KB_UPDATE_COLLECTION,
  IPC_CHANNELS.KB_DELETE_COLLECTION,
  IPC_CHANNELS.KB_LIST_DOCUMENTS,
  IPC_CHANNELS.KB_UPLOAD_FILES,
  IPC_CHANNELS.KB_PASTE_TEXT,
  IPC_CHANNELS.KB_INGEST_DOCUMENT,
  IPC_CHANNELS.KB_GET_DOCUMENT,
  IPC_CHANNELS.KB_DELETE_DOCUMENT,
  IPC_CHANNELS.KB_SEARCH,
  IPC_CHANNELS.KB_PREVIEW_FILE_SEGMENTS,
] as const;

function resetAllRegisteredIpcHandlers(): void {
  for (const channel of REBINDABLE_DB_CHANNELS) {
    ipcMain.removeHandler(channel);
  }
}

/**
 * Register all IPC handlers
 * 注册所有 IPC 处理器
 */
export function registerAllIPC(db: Database): void {
  resetAllRegisteredIpcHandlers();

  const promptDB = new PromptDB();
  const folderDB = new FolderDB();
  const skillDB = new SkillDB();
  const workflowDB = new WorkflowDB();
  const workflowBusinessDB = new WorkflowBusinessController();
  const workflowFolderDB = new WorkflowFolderController();
  registerPromptIPC(promptDB, folderDB);
  registerFolderIPC(folderDB, promptDB);
  registerSkillIPC(skillDB);
  registerWorkflowIPC(workflowDB);
  registerWorkflowBusinessIPC(workflowBusinessDB);
  registerWorkflowFolderIPC(workflowFolderDB);
  registerWorkflowAgentIPC();
  registerSettingsIPC(db);
  registerImageIPC();
  registerAIIPC();
  registerAichatIPC();
  registerClaudeCodeIPC();
  registerKbIPC(db);
  registerWorkspaceIPC();
  registerScraperIPC();
  registerOnlineConfIPC();
  registerSystemIPC();
}
