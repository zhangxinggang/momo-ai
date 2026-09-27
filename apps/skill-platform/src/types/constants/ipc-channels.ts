/**
 * IPC channel definitions
 */

export const IPC_CHANNELS = {
  // Settings
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',

  // MCP（应用内）
  MCP_GET_CONFIG: 'mcp:getConfig',
  MCP_SET_CONFIG: 'mcp:setConfig',
  MCP_SET_SERVER_DISABLED: 'mcp:setServerDisabled',
  MCP_LIST_SERVERS: 'mcp:listServers',
  MCP_LIST_TOOLS: 'mcp:listTools',
  MCP_CALL_TOOL: 'mcp:callTool',
  MCP_RECONNECT: 'mcp:reconnect',

  // App lifecycle
  APP_RELAUNCH: 'app:relaunch',

  // 在线配置（版本更新、AI 资讯等）
  ONLINE_CONF_FETCH: 'onlineConf:fetch',

  // 内置 HTTP 服务（system_api）
  SYSTEM_GET_UPLOAD_URL: 'system:getUploadUrl',
  SYSTEM_GET_SYSTEM_LOGO: 'system:getSystemLogo',
  SYSTEM_GET_APP_CONFIG: 'system:getAppConfig',

  // 桌面外壳（对话框、文件系统、Shell、通知、数据目录）
  DIALOG_SELECT_FOLDER: 'dialog:selectFolder',
  DIALOG_SELECT_FOLDERS: 'dialog:selectFolders',
  FS_PATH_EXISTS: 'fs:pathExists',
  DATA_GET_PATH: 'data:getPath',
  DATA_GET_STATUS: 'data:getStatus',
  SHELL_OPEN_PATH: 'shell:openPath',
  SHELL_OPEN_EXTERNAL: 'shell:openExternal',
  NOTIFICATION_SHOW: 'notification:show',

  // AI transport
  AI_HTTP_REQUEST: 'ai:httpRequest',
  AI_HTTP_STREAM: 'ai:httpStream',
  AI_HTTP_STREAM_CHUNK: 'ai:httpStreamChunk',
  AI_HTTP_STREAM_ERROR: 'ai:httpStreamError',

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

  // Custom tools（自定义工具）
  TOOL_LIST_TREE: 'tool:listTree',
  TOOL_CREATE_FOLDER: 'tool:createFolder',
  TOOL_CREATE_FILE: 'tool:createFile',
  TOOL_READ_FILE: 'tool:readFile',
  TOOL_WRITE_FILE: 'tool:writeFile',
  TOOL_RENAME: 'tool:rename',
  TOOL_DELETE: 'tool:delete',
  TOOL_MOVE: 'tool:move',
  TOOL_OPEN_DIRECTORY: 'tool:openDirectory',
  TOOL_READ_SNAPEDIT_HTML: 'tool:readSnapEditHtml',
  TOOL_READ_WEB_PAGE: 'tool:readWebPage',
  TOOL_CHECK_IDENTIFIER: 'tool:checkIdentifier',
  TOOL_VALIDATE_PLUGIN: 'tool:validatePlugin',
  TOOL_INVOKE_PLUGIN: 'tool:invokePlugin',

  // 可复用接口请求工作台
  API_REQUEST_EXECUTE: 'apiRequest:execute',

  // Knowledge base（知识库）
  KNOWLEDGE_LIST_COLLECTIONS: 'knowledge:listCollections',
  KNOWLEDGE_CREATE_COLLECTION: 'knowledge:createCollection',
  KNOWLEDGE_UPDATE_COLLECTION: 'knowledge:updateCollection',
  KNOWLEDGE_DELETE_COLLECTION: 'knowledge:deleteCollection',
  KNOWLEDGE_LIST_DOCUMENTS: 'knowledge:listDocuments',
  KNOWLEDGE_IMPORT_FILES: 'knowledge:importFiles',
  KNOWLEDGE_IMPORT_DIRECTORY: 'knowledge:importDirectory',
  KNOWLEDGE_PICK_DIRECTORY: 'knowledge:pickDirectory',
  KNOWLEDGE_PASTE_TEXT: 'knowledge:pasteText',
  KNOWLEDGE_GET_DOCUMENT: 'knowledge:getDocument',
  KNOWLEDGE_DELETE_DOCUMENT: 'knowledge:deleteDocument',
  KNOWLEDGE_LIST_CHUNKS: 'knowledge:listChunks',
  KNOWLEDGE_GET_CHUNK: 'knowledge:getChunk',
  KNOWLEDGE_EDIT_CHUNK: 'knowledge:editChunk',
  KNOWLEDGE_DELETE_CHUNKS: 'knowledge:deleteChunks',
  KNOWLEDGE_PREVIEW_FILE: 'knowledge:previewFile',
  KNOWLEDGE_RETRIEVE: 'knowledge:retrieve',
  KNOWLEDGE_RETRIEVE_FOR_CHAT: 'knowledge:retrieveForChat',
  KNOWLEDGE_LIST_JOBS: 'knowledge:listJobs',
  KNOWLEDGE_RETRY_JOB: 'knowledge:retryJob',
  KNOWLEDGE_CANCEL_JOB: 'knowledge:cancelJob',

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
  SKILL_LIST_DEFAULT_SKILLS: 'skill:listDefaultSkills',
  SKILL_GET_BUILTIN_SKILLS: 'skill:getBuiltinSkills',
  SKILL_IMPORT_DEFAULT_SKILLS: 'skill:importDefaultSkills',
  SKILL_PREVIEW_LOCAL_ZIPS: 'skill:previewLocalZips',
  SKILL_IMPORT_LOCAL_ZIPS: 'skill:importLocalZips',
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
  SKILL_READ_LOCAL_FILE_BUFFER: 'skill:readLocalFileBuffer',
  SKILL_READ_LOCAL_FILES: 'skill:readLocalFiles',
  SKILL_RENAME_LOCAL_PATH: 'skill:renameLocalPath',
  SKILL_WRITE_LOCAL_FILE: 'skill:writeLocalFile',
  SKILL_DELETE_LOCAL_FILE: 'skill:deleteLocalFile',
  SKILL_CREATE_LOCAL_DIR: 'skill:createLocalDir',
  SKILL_LIST_LOCAL_FILES_BY_PATH: 'skill:listLocalFilesByPath',
  SKILL_READ_LOCAL_FILE_BY_PATH: 'skill:readLocalFileByPath',
  SKILL_READ_LOCAL_FILE_BUFFER_BY_PATH: 'skill:readLocalFileBufferByPath',
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
  SKILL_ENSURE_SESSION_WORKSPACE: 'skill:ensureSessionWorkspace',
  SKILL_WRITE_SESSION_FILE: 'skill:writeSessionFile',

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
  DRAWIO_DIAGRAM_SAVE: 'drawioDiagram:save',
  DRAWIO_DIAGRAM_LOAD: 'drawioDiagram:load',

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
  WORKSPACE_LIST_TREE: 'workspace:listTree',
  WORKSPACE_GREP: 'workspace:grep',
  WORKSPACE_READ_SNIPPET: 'workspace:readSnippet',

  // 爬虫（模型排行）
  SCRAPE_MODEL_RANKING: 'scrape:modelRanking',

  // AI 对话附件解析
  AICHAT_PARSE_ATTACHMENT: 'aichat:parseAttachment',

  // Skill 远程 POST 请求
  SKILL_FETCH_REMOTE_POST: 'skill:fetchRemotePost',
  SKILL_EXTRACT_CLAWHUB_ARCHIVE: 'skill:extractClawhubArchive',
  SKILL_EXTRACT_COCOLOOP_ARCHIVE: 'skill:extractCocoloopArchive',

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

  // Chat 项目 Agent 应用
  AGENT_APP_DETECT: 'agentApp:detect',
  AGENT_APP_RESOLVE_CONTEXT: 'agentApp:resolveContext',
  AGENT_APP_LIST_SLASH: 'agentApp:listSlash',
  AGENT_APP_PREPARE_SUBMIT: 'agentApp:prepareSubmit',
} as const;

export type IPCChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
