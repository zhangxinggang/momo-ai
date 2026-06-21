/** 浏览器与主进程均可用的路径片段解析，避免 renderer 打包 Node path */
function getPathExtname(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/');
  const baseName = normalized.slice(normalized.lastIndexOf('/') + 1);
  const dotIndex = baseName.lastIndexOf('.');
  if (dotIndex <= 0) {
    return '';
  }
  return baseName.slice(dotIndex).toLowerCase();
}
function getPathBasename(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/');
  return normalized.slice(normalized.lastIndexOf('/') + 1).toLowerCase();
}

const TEXT_FILE_EXTENSIONS = new Set([
  '.txt',
  '.md',
  '.json',
  '.js',
  '.ts',
  '.tsx',
  '.jsx',
  '.py',
  '.java',
  '.c',
  '.cpp',
  '.h',
  '.hpp',
  '.cs',
  '.go',
  '.rs',
  '.rb',
  '.php',
  '.swift',
  '.kt',
  '.scala',
  '.sh',
  '.bash',
  '.zsh',
  '.fish',
  '.bat',
  '.cmd',
  '.ps1',
  '.html',
  '.htm',
  '.css',
  '.scss',
  '.less',
  '.sass',
  '.xml',
  '.yaml',
  '.yml',
  '.toml',
  '.ini',
  '.cfg',
  '.conf',
  '.sql',
  '.graphql',
  '.proto',
  '.dockerfile',
  '.env',
  '.gitignore',
  '.editorconfig',
  '.prettierrc',
  '.eslintrc',
  '.vue',
  '.svelte',
  '.astro',
  '.csv',
  '.log',
  '.lock',
  '.r',
  '.jl',
  '.lua',
]);

const TEXT_FILE_BASE_NAMES = new Set([
  'makefile',
  'dockerfile',
  'readme',
  'license',
  'changelog',
  'authors',
  'contributors',
]);

/** .env 及 .env.local 等环境变量文件（无常规扩展名） */
function isEnvFilePath(filePath: string): boolean {
  const baseName = getPathBasename(filePath);
  return baseName === '.env' || baseName.startsWith('.env.');
}

/** 判断路径是否为可读的文本类文件 */
export function isTextFilePath(filePath: string): boolean {
  if (isEnvFilePath(filePath)) {
    return true;
  }
  const ext = getPathExtname(filePath).toLowerCase();
  if (TEXT_FILE_EXTENSIONS.has(ext)) {
    return true;
  }
  const baseName = getPathBasename(filePath);
  return TEXT_FILE_BASE_NAMES.has(baseName);
}
