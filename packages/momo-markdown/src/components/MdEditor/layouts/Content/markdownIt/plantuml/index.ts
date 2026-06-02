import markdownit from 'markdown-it';
import { prefix } from '~/config';

const PLANTUML_LANGS = new Set(['plantuml', 'puml']);

const PlantumlPlugin = (md: markdownit) => {
  const temp = md.renderer.rules.fence!.bind(md.renderer.rules);
  md.renderer.rules.fence = (tokens, idx, ops, env, slf) => {
    const token = tokens[idx];
    const lang = token.info.trim().split(/\s+/)[0];
    const code = token.content.trim();

    if (PLANTUML_LANGS.has(lang)) {
      token.attrSet('class', `${prefix}-plantuml`);
      token.attrSet('data-plantuml-pending', 'true');

      if (token.map && token.level === 0) {
        const closeLine = token.map[1] - 1;
        const closeLineText = env.srcLines[closeLine]?.trim();
        const isClosingFence = !!closeLineText?.startsWith('```');

        token.attrSet('data-closed', `${isClosingFence}`);
        token.attrSet('data-line', String(token.map[0]));
      }

      return `<div ${slf.renderAttrs(token)}>${md.utils.escapeHtml(code)}</div>`;
    }

    return temp(tokens, idx, ops, env, slf);
  };
};

export default PlantumlPlugin;
