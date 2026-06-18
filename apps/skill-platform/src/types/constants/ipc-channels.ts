/**
 * IPC channel definitions
 */

export const IPC_CHANNELS = {
  // Prompt
  PROMPT_CREATE: 'prompt:create',
  PROMPT_GET: 'prompt:get',
  PROMPT_GET_ALL: 'prompt:getAll',
  PROMPT_UPDATE: 'prompt:update',
  PROMPT_DELETE: 'prompt:delete',
  PROMPT_SEARCH: 'prompt:search',
  PROMPT_COPY: 'prompt:copy',
  PROMPT_INSERT_DIRECT: 'prompt:insertDirect',
  PROMPT_SYNC_WORKSPACE: 'prompt:syncWorkspace',

  // Version
  VERSION_GET_ALL: 'version:getAll',
  VERSION_CREATE: 'version:create',
  VERSION_ROLLBACK: 'version:rollback',
  VERSION_DIFF: 'version:diff',
  VERSION_DELETE: 'version:delete',
  VERSION_INSERT_DIRECT: 'version:insertDirect',

  // Folder
  FOLDER_CREATE: 'folder:create',
  FOLDER_GET_ALL: 'folder:getAll',
  FOLDER_UPDATE: 'folder:update',
  FOLDER_DELETE: 'folder:delete',
  FOLDER_REORDER: 'folder:reorder',
  FOLDER_INSERT_DIRECT: 'folder:insertDirect',

  // Settings
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',

  // App lifecycle
  APP_RELAUNCH: 'app:relaunch',

  // 在线配置（版本更新、AI 资讯等）
  ONLINE_CONF_FETCH: 'onlineConf:fetch',

  // 内置 HTTP 服务（system_api）
  SYSTEM_GET_UPLOAD_URL: 'system:getUploadUrl',
  SYSTEM_GET_SYSTEM_LOGO: 'system:getSystemLogo',
  SYSTEM_GET_APP_NAME: 'system:getAppName',

  // AI transport
  AI_HTTP_REQUEST: 'ai:httpRequest',
  AI_HTTP_STREAM: 'ai:httpStream',
  AI_HTTP_STREAM_CHUNK: 'ai:httpStreamChunk',
  AI_HTTP_STREAM_ERROR: 'ai:httpStreamError',

  // Import/Export
  EXPORT_PROMPTS: 'export:prompts',
  IMPORT_PROMPTS: 'import:prompts',

  // Notes（我的笔记）
  NOTE_LIST_TREE: 'note:listTree',
  NOTE_CREATE_FOLDER: 'note:createFolder',
  NOTE_CREATE_FILE: 'note:createFile',
  NOTE_READ_FILE: 'note:readFile',
  NOTE_WRITE_FILE: 'note:writeFile',
  NOTE_RENAME: 'note:rename',
  NOTE_DELETE: 'note:delete',
  NOTE_MOVE: 'note:move',
  NOTE_COPY_FILE: 'note:copyFile',
  NOTE_BOOTSTRAP_CURSOR_RULES: 'note:bootstrapCursorRules',

  // Knowledge base（知识库）
  KB_LIST_COLLECTIONS: 'kb:listCollections',
  KB_CREATE_COLLECTION: 'kb:createCollection',
  KB_UPDATE_COLLECTION: 'kb:updateCollection',
  KB_DELETE_COLLECTION: 'kb:deleteCollection',
  KB_LIST_DOCUMENTS: 'kb:listDocuments',
  KB_UPLOAD_FILES: 'kb:uploadFiles',
  KB_PASTE_TEXT: 'kb:pasteText',
  KB_INGEST_DOCUMENT: 'kb:ingestDocument',
  KB_GET_DOCUMENT: 'kb:getDocument',
  KB_DELETE_DOCUMENT: 'kb:deleteDocument',
  KB_SEARCH: 'kb:search',
  KB_LIST_CHUNKS: 'kb:listChunks',
  KB_UPDATE_CHUNK: 'kb:updateChunk',
  KB_DELETE_CHUNKS: 'kb:deleteChunks',
  KB_RESEGMENT_DOCUMENT: 'kb:resegmentDocument',
  KB_PREVIEW_FILE_SEGMENTS: 'kb:previewFileSegments',

  // Workflows（工作流画布）
  WORKFLOW_CREATE: 'workflow:create',
  WORKFLOW_GET: 'workflow:get',
  WORKFLOW_GET_ALL: 'workflow:getAll',
  WORKFLOW_UPDATE: 'workflow:update',
  WORKFLOW_DELETE: 'workflow:delete',

  // 工作流侧栏目录
  WORKFLOW_FOLDER_CREATE: 'workflowFolder:create',
  WORKFLOW_FOLDER_GET_ALL: 'workflowFolder:getAll',
  WORKFLOW_FOLDER_UPDATE: 'workflowFolder:update',
  WORKFLOW_FOLDER_DELETE: 'workflowFolder:delete',
  WORKFLOW_FOLDER_UPDATE_ORDERS: 'workflowFolder:updateOrders',

  // 工作流业务实例
  WORKFLOW_BUSINESS_CREATE: 'workflowBusiness:create',
  WORKFLOW_BUSINESS_GET_ALL: 'workflowBusiness:getAll',
  WORKFLOW_BUSINESS_UPDATE: 'workflowBusiness:update',
  WORKFLOW_BUSINESS_DELETE: 'workflowBusiness:delete',
  WORKFLOW_BUSINESS_DELETE_BY_WORKFLOW: 'workflowBusiness:deleteByWorkflow',
  WORKFLOW_BUSINESS_HAS_ANY: 'workflowBusiness:hasAny',

  // 工作流 Agent 目录（节点产出与文件）
  WORKFLOW_AGENT_ENSURE_DIR: 'workflowAgent:ensureDir',
  WORKFLOW_AGENT_DELETE_DIR: 'workflowAgent:deleteDir',
  WORKFLOW_AGENT_RENAME_DIR: 'workflowAgent:renameDir',
  WORKFLOW_AGENT_LIST_DIR: 'workflowAgent:listDir',
  WORKFLOW_AGENT_READ_FILE: 'workflowAgent:readFile',
  WORKFLOW_AGENT_WRITE_FILE: 'workflowAgent:writeFile',
  WORKFLOW_AGENT_DELETE_NODE_DIR: 'workflowAgent:deleteNodeDir',
  WORKFLOW_AGENT_RENAME_NODE_DIR: 'workflowAgent:renameNodeDir',
  WORKFLOW_AGENT_LIST_FILE_TREE: 'workflowAgent:listFileTree',
  WORKFLOW_AGENT_DELETE_FILE: 'workflowAgent:deleteFile',
  WORKFLOW_AGENT_CREATE_DIR: 'workflowAgent:createDir',
  WORKFLOW_AGENT_MOVE_PATH: 'workflowAgent:movePath',
  WORKFLOW_AGENT_ENSURE_BUSINESS_DIR: 'workflowAgent:ensureBusinessDir',
  WORKFLOW_AGENT_DELETE_BUSINESS_DIR: 'workflowAgent:deleteBusinessDir',
  WORKFLOW_AGENT_DELETE_NODE_FOR_ALL_BUSINESSES: 'workflowAgent:deleteNodeForAllBusinesses',
  WORKFLOW_AGENT_RENAME_NODE_FOR_ALL_BUSINESSES: 'workflowAgent:renameNodeForAllBusinesses',

  // Skills
  SKILL_CREATE: 'skill:create',
  SKILL_GET: 'skill:get',
  SKILL_GET_ALL: 'skill:getAll',
  SKILL_UPDATE: 'skill:update',
  SKILL_DELETE: 'skill:delete',
  SKILL_SEARCH: 'skill:search',
  SKILL_EXPORT: 'skill:export',
  SKILL_EXPORT_ZIP: 'skill:exportZip',
  SKILL_IMPORT: 'skill:import',
  SKILL_SCAN_LOCAL: 'skill:scanLocal',
  SKILL_SCAN_LOCAL_PREVIEW: 'skill:scanLocalPreview',
  SKILL_SCAN_SAFETY: 'skill:scanSafety',
  SKILL_SAVE_SAFETY_REPORT: 'skill:saveSafetyReport',
  SKILL_INSTALL_TO_PLATFORM: 'skill:installToPlatform',
  SKILL_UNINSTALL_FROM_PLATFORM: 'skill:uninstallFromPlatform',
  SKILL_GET_PLATFORM_STATUS: 'skill:getPlatformStatus',

  // SKILL.md Multi-Platform Installation
  SKILL_GET_SUPPORTED_PLATFORMS: 'skill:getSupportedPlatforms',
  SKILL_DETECT_PLATFORMS: 'skill:detectPlatforms',
  SKILL_INSTALL_MD: 'skill:installMd',
  SKILL_UNINSTALL_MD: 'skill:uninstallMd',
  SKILL_GET_MD_INSTALL_STATUS: 'skill:getMdInstallStatus',
  SKILL_GET_MD_INSTALL_STATUS_BATCH: 'skill:getMdInstallStatusBatch',
  SKILL_INSTALL_MD_SYMLINK: 'skill:installMdSymlink',
  SKILL_FETCH_REMOTE_CONTENT: 'skill:fetchRemoteContent',
  SKILL_FETCH_REMOTE_BINARY: 'skill:fetchRemoteBinary',
  SKILL_SYNC_GIT_STORE: 'skill:syncGitStore',
  SKILL_EXTRACT_SKILLHUB_ARCHIVE: 'skill:extractSkillHubArchive',

  // Skill Local Repo Storage
  SKILL_LIST_LOCAL_FILES: 'skill:listLocalFiles',
  SKILL_READ_LOCAL_FILE: 'skill:readLocalFile',
  SKILL_READ_LOCAL_FILES: 'skill:readLocalFiles',
  SKILL_RENAME_LOCAL_PATH: 'skill:renameLocalPath',
  SKILL_WRITE_LOCAL_FILE: 'skill:writeLocalFile',
  SKILL_DELETE_LOCAL_FILE: 'skill:deleteLocalFile',
  SKILL_CREATE_LOCAL_DIR: 'skill:createLocalDir',
  SKILL_LIST_LOCAL_FILES_BY_PATH: 'skill:listLocalFilesByPath',
  SKILL_READ_LOCAL_FILE_BY_PATH: 'skill:readLocalFileByPath',
  SKILL_RENAME_LOCAL_PATH_BY_PATH: 'skill:renameLocalPathByPath',
  SKILL_WRITE_LOCAL_FILE_BY_PATH: 'skill:writeLocalFileByPath',
  SKILL_DELETE_LOCAL_FILE_BY_PATH: 'skill:deleteLocalFileByPath',
  SKILL_CREATE_LOCAL_DIR_BY_PATH: 'skill:createLocalDirByPath',
  SKILL_IMPORT_LOCAL_FILES: 'skill:importLocalFiles',
  SKILL_IMPORT_LOCAL_FILES_BY_PATH: 'skill:importLocalFilesByPath',
  SKILL_SAVE_TO_REPO: 'skill:saveToRepo',
  SKILL_SAVE_REMOTE_GIT_TO_REPO: 'skill:saveRemoteGitToRepo',
  SKILL_GET_REPO_PATH: 'skill:getRepoPath',
  SKILL_SYNC_FROM_REPO: 'skill:syncFromRepo',
  SKILL_EXECUTE_WORKSPACE: 'skill:executeWorkspace',

  // Image
  DIALOG_SELECT_IMAGE: 'dialog:selectImage',
  IMAGE_SAVE: 'image:save',
  IMAGE_OPEN: 'image:open',
  IMAGE_SAVE_BUFFER: 'image:save-buffer',
  IMAGE_DOWNLOAD: 'image:download',
  IMAGE_LIST: 'image:list',
  IMAGE_GET_SIZE: 'image:getSize',
  IMAGE_READ_BASE64: 'image:readBase64',
  IMAGE_SAVE_BASE64: 'image:saveBase64',
  IMAGE_EXISTS: 'image:exists',
  IMAGE_CLEAR: 'image:clear',

  // Video
  DIALOG_SELECT_VIDEO: 'dialog:selectVideo',
  VIDEO_SAVE: 'video:save',
  VIDEO_OPEN: 'video:open',
  VIDEO_LIST: 'video:list',
  VIDEO_GET_SIZE: 'video:getSize',
  VIDEO_READ_BASE64: 'video:readBase64',
  VIDEO_SAVE_BASE64: 'video:saveBase64',
  VIDEO_EXISTS: 'video:exists',
  VIDEO_GET_PATH: 'video:getPath',
  VIDEO_CLEAR: 'video:clear',

  // 工作区目录（AI 对话上下文）
  WORKSPACE_LIST_DIR: 'workspace:listDir',
  WORKSPACE_READ_FILE: 'workspace:readFile',

  // 爬虫（模型排行）
  SCRAPE_MODEL_RANKING: 'scrape:modelRanking',

  // AI 对话 CLI Agent
  AICHAT_CLI_AGENT_CALL: 'aichat:cliAgentCall',
  AICHAT_CLI_AGENT_DETECT: 'aichat:cliAgentDetect',
  AICHAT_PARSE_ATTACHMENT: 'aichat:parseAttachment',

  // Claude Code 斜杠命令（见 src/claude-code/）
  CLAUDE_CODE_LIST_SLASH: 'claudeCode:listSlashCommands',

  // Skill 远程 POST 请求
  SKILL_FETCH_REMOTE_POST: 'skill:fetchRemotePost',
  SKILL_EXTRACT_CLAWHUB_ARCHIVE: 'skill:extractClawhubArchive',

  // Rules 规则工作区
  RULES_LIST: 'rules:list',
  RULES_SCAN: 'rules:scan',
  RULES_READ: 'rules:read',
  RULES_SAVE: 'rules:save',
  RULES_RESOLVE_CONFLICT: 'rules:resolveConflict',
  RULES_REWRITE: 'rules:rewrite',
  RULES_ADD_PROJECT: 'rules:addProject',
  RULES_REMOVE_PROJECT: 'rules:removeProject',
  RULES_IMPORT_RECORDS: 'rules:importRecords',
} as const;

export type IPCChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
