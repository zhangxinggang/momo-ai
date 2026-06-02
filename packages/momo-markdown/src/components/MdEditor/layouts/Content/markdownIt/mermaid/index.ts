import markdownit from 'markdown-it';
import { RefObject } from 'react';
import { prefix } from '~/config';
import { TThemes } from '~/type';
import { mermaidCache } from '~/utils/cache';
import { normalizeMermaidSource } from '~/utils/chart/mermaid-source';

const MERMAID_LANGS = new Set(['mermaid', 'flowchart']);

function normalizeMermaidCode(lang: string, code: string): string {
  const trimmed = normalizeMermaidSource(code.trim());
  if (!trimmed) {
    return 'flowchart TD\n  A --> B';
  }

  if (
    lang === 'flowchart' &&
    !/^flowchart\b/i.test(trimmed) &&
    !/^(graph|sequenceDiagram|classDiagram)\b/i.test(trimmed)
  ) {
    return `flowchart TD\n${trimmed}`;
  }

  return trimmed;
}

const MermaidPlugin = (md: markdownit, options: { themeRef: RefObject<TThemes> }) => {
  const temp = md.renderer.rules.fence!.bind(md.renderer.rules);
  md.renderer.rules.fence = (tokens, idx, ops, env, slf) => {
    const token = tokens[idx];
    const lang = token.info.trim().split(/\s+/)[0];
    const code = token.content.trim();

    if (MERMAID_LANGS.has(lang)) {
      const normalizedCode = normalizeMermaidCode(lang, code);
      token.attrSet('class', `${prefix}-mermaid`);
      token.attrSet('data-mermaid-theme', options.themeRef.current);
      token.attrSet('data-mermaid-lang', lang);

      if (token.map && token.level === 0) {
        const closeLine = token.map[1] - 1;
        const closeLineText = env.srcLines[closeLine]?.trim();
        const isClosingFence = !!closeLineText?.startsWith('```');

        token.attrSet('data-closed', `${isClosingFence}`);
        token.attrSet('data-line', String(token.map[0]));
      }

      const mermaidHtml = mermaidCache.get(normalizedCode) as string;

      if (mermaidHtml) {
        token.attrSet('data-processed', '');
        token.attrSet('data-content', normalizedCode);
        return `<p ${slf.renderAttrs(token)}>${mermaidHtml}</p>`;
      }

      return `<div ${slf.renderAttrs(token)}>${md.utils.escapeHtml(normalizedCode)}</div>`;
    }

    return temp(tokens, idx, ops, env, slf);
  };
};

export default MermaidPlugin;
