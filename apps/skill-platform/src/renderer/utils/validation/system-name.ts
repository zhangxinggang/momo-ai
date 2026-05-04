/** 跨平台文件/目录名非法字符（Windows 规则，兼容 macOS / Linux） */
const INVALID_NAME_CHARS_REGEX = /[\\/:*?"<>|\x00-\x1f]/;

const WINDOWS_RESERVED_NAMES = new Set<string>([
  'con',
  'prn',
  'aux',
  'nul',
  ...Array.from({ length: 9 }, (_, index) => `com${index + 1}`),
  ...Array.from({ length: 9 }, (_, index) => `lpt${index + 1}`),
]);

/** 单段路径名最大长度（常见文件系统限制） */
const MAX_FILE_NAME_LENGTH = 255;

/**
 * 操作系统文件/目录命名规范校验
 * 适用于工作流名、节点名等会映射到磁盘目录的名称
 */
export function getSystemFileNameError(name: string): string | null {
  if (!name.trim()) {
    return '名称不能为空';
  }
  if (name !== name.trim()) {
    return '名称首尾不能包含空格';
  }
  if (name === '.' || name === '..') {
    return '名称不能为 . 或 ..';
  }
  if (name.length > MAX_FILE_NAME_LENGTH) {
    return `名称不能超过 ${MAX_FILE_NAME_LENGTH} 个字符`;
  }
  if (INVALID_NAME_CHARS_REGEX.test(name)) {
    return '名称不能包含 \\ / : * ? " < > | 或控制字符';
  }
  if (/[.\s]$/.test(name)) {
    return '名称不能以空格或点号结尾';
  }
  const baseSegment = name.includes('.') ? (name.split('.')[0] ?? name) : name;
  if (WINDOWS_RESERVED_NAMES.has(baseSegment.toLowerCase())) {
    return '名称为系统保留名称，请更换';
  }
  return null;
}

export function isValidSystemFileName(name: string): boolean {
  return getSystemFileNameError(name) === null;
}
