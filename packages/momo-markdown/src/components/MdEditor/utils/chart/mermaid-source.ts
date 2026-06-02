/**
 * 规范化 Mermaid 源码，避免节点标签中的花括号导致解析失败
 */
export function normalizeMermaidSource(source: string): string {
  let code = source;

  if (/^\s*wardley-beta/m.test(code)) {
    code = code.replace(/-->/g, '->');
    const idToName = new Map<string, string>();
    code = code.replace(
      /\b(anchor|component)\s+(\w+)\[([^\]]+)\]\s*(\[[^\]]+\])/g,
      (_match, kind: string, id: string, name: string, coords: string) => {
        idToName.set(id, name);
        return `${kind} ${name} ${coords}`;
      },
    );
    idToName.forEach((name, id) => {
      code = code.replace(new RegExp(`(^|\\s)${id}(\\s*->)`, 'gm'), `$1${name}$2`);
      code = code.replace(new RegExp(`->\\s*${id}(\\s|$)`, 'gm'), `-> ${name}$1`);
    });
  }

  // 方括号节点：G2[文本{requirement}更多] -> G2["文本{requirement}更多"]
  code = code.replace(/(\b[A-Za-z][\w-]*)\[([^\]"\n]+)\]/g, (match, id: string, label: string) => {
    if (label.includes('{') || label.includes('}') || label.includes(':')) {
      const escaped = label.replace(/"/g, '#quot;');
      return `${id}["${escaped}"]`;
    }
    return match;
  });

  // 圆括号节点（排除已加引号的情况）
  code = code.replace(/(\b[A-Za-z][\w-]*)\(([^)"\n]+)\)/g, (match, id: string, label: string) => {
    if (label.includes('{') || label.includes('}') || label.includes(':')) {
      const escaped = label.replace(/"/g, '#quot;');
      return `${id}("${escaped}")`;
    }
    return match;
  });

  // 连线标签：A -->|文本{var}| B
  code = code.replace(
    /(\|)([^|\n]*[{}][^|\n]*)(\|)/g,
    (match, open: string, label: string, close: string) => {
      if (label.startsWith('"') && label.endsWith('"')) {
        return match;
      }
      const escaped = label.replace(/"/g, '#quot;');
      return `${open}"${escaped}"${close}`;
    },
  );

  return code;
}
