const STATE_DIAGRAM_HEADER_RE = /^\s*stateDiagram(-v2)?\b/i;

function isStateDiagramSource(source: string): boolean {
  return STATE_DIAGRAM_HEADER_RE.test(source);
}

function escapeStateAliasLabel(label: string): string {
  return label.replace(/"/g, '#quot;');
}

/** 状态名含空格、冒号或「连字符+空格」时需 alias */
function needsStateAlias(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed || trimmed === '[*]') {
    return false;
  }
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || /^_st\d+$/.test(trimmed)) {
    return false;
  }
  return /[\s:：]/.test(trimmed) || /-\S*\s/.test(trimmed);
}

function normalizeTransitionColons(line: string): string {
  if (!/-->/.test(line)) {
    return line;
  }
  return line.replace(/：/g, ':').replace(/(-->\s*[^\n]+?)\s*:\s*/g, '$1 : ');
}

interface ITransitionParts {
  indent: string;
  source: string;
  target: string;
  label: string;
}

function parseTransitionLine(line: string): ITransitionParts | null {
  if (!/-->/.test(line)) {
    return null;
  }
  const indent = line.slice(0, line.length - line.trimStart().length);
  const content = line.slice(indent.length);
  const arrowIndex = content.indexOf('-->');
  if (arrowIndex === -1) {
    return null;
  }
  const source = content.slice(0, arrowIndex).trim();
  let remainder = content.slice(arrowIndex + 3).trim();
  let target = remainder;
  let label = '';
  const labelMatch = remainder.match(/^(.+?)\s+:\s+(.+)$/);
  if (labelMatch) {
    target = labelMatch[1].trim();
    label = labelMatch[2].trim();
  }
  return { indent, source, target, label };
}

function isOrphanNoteLine(trimmed: string, compositeDepth: number): boolean {
  if (compositeDepth <= 0 || !trimmed) {
    return false;
  }
  if (/-->/.test(trimmed)) {
    return false;
  }
  if (/^\[\*\]/.test(trimmed)) {
    return false;
  }
  if (/^state\s+/i.test(trimmed)) {
    return false;
  }
  if (/^note\s+/i.test(trimmed)) {
    return false;
  }
  if (/^end\s+note\b/i.test(trimmed)) {
    return false;
  }
  if (trimmed === '{' || trimmed === '}' || trimmed.endsWith('{')) {
    return false;
  }
  if (/^(classDef|class|direction)\s+/i.test(trimmed)) {
    return false;
  }
  return true;
}

function countChar(text: string, char: string): number {
  return text.split(char).length - 1;
}

function normalizeStateDiagramSource(source: string): string {
  const lines = source.split('\n');
  const nameToId = new Map<string, string>();
  const aliasDecls: string[] = [];
  let aliasCounter = 0;
  let compositeDepth = 0;
  let lastTransitionSource = '';
  const transformedLines: string[] = [];

  const getOrCreateAlias = (name: string): string => {
    const trimmed = name.trim();
    if (!needsStateAlias(trimmed)) {
      return trimmed;
    }
    if (nameToId.has(trimmed)) {
      return nameToId.get(trimmed)!;
    }
    const id = `_st${aliasCounter++}`;
    nameToId.set(trimmed, id);
    aliasDecls.push(`    state "${escapeStateAliasLabel(trimmed)}" as ${id}`);
    return id;
  };

  for (const rawLine of lines) {
    const line = normalizeTransitionColons(rawLine);
    const trimmed = line.trim();

    if (isOrphanNoteLine(trimmed, compositeDepth)) {
      const indent = line.slice(0, line.length - line.trimStart().length);
      const anchor = lastTransitionSource || 'noteAnchor';
      transformedLines.push(`${indent}note right of ${anchor} : ${trimmed}`);
      compositeDepth += countChar(trimmed, '{');
      compositeDepth -= countChar(trimmed, '}');
      compositeDepth = Math.max(0, compositeDepth);
      continue;
    }

    if (/-->/.test(line)) {
      const parsed = parseTransitionLine(line);
      if (parsed) {
        const source = getOrCreateAlias(parsed.source);
        const target = getOrCreateAlias(parsed.target);
        lastTransitionSource = source;
        transformedLines.push(
          parsed.label
            ? `${parsed.indent}${source} --> ${target} : ${parsed.label}`
            : `${parsed.indent}${source} --> ${target}`,
        );
        compositeDepth += countChar(trimmed, '{');
        compositeDepth -= countChar(trimmed, '}');
        compositeDepth = Math.max(0, compositeDepth);
        continue;
      }
    }

    transformedLines.push(line);
    compositeDepth += countChar(trimmed, '{');
    compositeDepth -= countChar(trimmed, '}');
    compositeDepth = Math.max(0, compositeDepth);
  }

  if (aliasDecls.length === 0) {
    return transformedLines.join('\n');
  }

  const outputLines: string[] = [];
  let aliasesInserted = false;
  for (const line of transformedLines) {
    outputLines.push(line);
    if (!aliasesInserted && STATE_DIAGRAM_HEADER_RE.test(line.trim())) {
      outputLines.push(...aliasDecls);
      aliasesInserted = true;
    }
  }

  return outputLines.join('\n');
}

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

  if (isStateDiagramSource(code)) {
    code = normalizeStateDiagramSource(code);
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
