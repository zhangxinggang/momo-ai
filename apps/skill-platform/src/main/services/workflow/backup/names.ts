/** 导出 zip 默认文件名中的安全基名 */
export function sanitizeExportFileBaseName(name: string): string {
  const cleaned = name
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.length > 0 ? cleaned : 'workflow';
}

/**
 * 在已占用名称集合中分配唯一名。
 * base 可用则返回 base；否则试 base+suffix、base+suffix 2…
 */
export function allocateUniqueName(
  baseName: string,
  existingNames: Set<string>,
  suffix: string,
): string {
  const base = baseName.trim() || '未命名';
  if (!existingNames.has(base)) {
    return base;
  }
  const withSuffix = `${base}${suffix}`;
  if (!existingNames.has(withSuffix)) {
    return withSuffix;
  }
  let index = 2;
  while (existingNames.has(`${withSuffix}${index}`)) {
    index += 1;
  }
  return `${withSuffix}${index}`;
}
