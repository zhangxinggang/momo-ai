import { prefix } from '~/config';

const MARK = '__momo_admonition_registered';

/**
 * 在 tiptap-markdown 的 markdown-it 实例上注册 Admonition 解析规则
 *
 * 语法（与现有 markdown 模式一致）：
 * ```
 * !!! type 可选标题
 * 内容（任意块级 Markdown）
 * !!!
 * ```
 *
 * 这里输出结构化的 HTML，便于 ProseMirror 节点 parseDOM 读取 type / title 属性，
 * 并把内部内容作为子块解析，而不是渲染带 class 的 div + 独立标题元素。
 */
export const registerAdmonitionParse = (md: any) => {
  if (md[MARK]) return;
  md[MARK] = true;

  md.block.ruler.before(
    'code',
    'admonition',
    (state: any, startLine: number, endLine: number, silent: boolean) => {
      const markerStr = '!';
      const markerChar = markerStr.charCodeAt(0);
      const markerCount = 3;

      const start = state.bMarks[startLine] + state.tShift[startLine];
      const max = state.eMarks[startLine];

      // 首字符必须是 '!'
      if (markerChar !== state.src.charCodeAt(start)) {
        return false;
      }

      let pos = start + 1;
      for (; pos <= max; pos++) {
        if (markerStr[(pos - start) % markerStr.length] !== state.src[pos]) {
          break;
        }
      }
      const markerLen = Math.floor((pos - start) / markerStr.length);
      if (markerLen !== markerCount) {
        return false;
      }
      pos -= (pos - start) % markerStr.length;

      const params = state.src.slice(pos, max).trim();
      const spaceIdx = params.indexOf(' ');
      const type = spaceIdx === -1 ? params : params.slice(0, spaceIdx);
      const title = spaceIdx === -1 ? '' : params.slice(spaceIdx + 1).trim();

      if (silent) {
        return true;
      }

      // 查找结束标记
      let nextLine = startLine;
      let autoClosed = false;
      for (;;) {
        nextLine++;
        if (nextLine >= endLine) {
          break;
        }
        const s = state.bMarks[nextLine] + state.tShift[nextLine];
        const m = state.eMarks[nextLine];
        if (s < m && state.sCount[nextLine] < state.blkIndent) {
          break;
        }
        if (markerChar !== state.src.charCodeAt(s)) {
          continue;
        }
        if (state.sCount[nextLine] - state.blkIndent >= 4) {
          continue;
        }
        let p = s + 1;
        for (; p <= m; p++) {
          if (markerStr[(p - s) % markerStr.length] !== state.src[p]) {
            break;
          }
        }
        if (Math.floor((p - s) / markerStr.length) < markerCount) {
          continue;
        }
        p -= (p - s) % markerStr.length;
        p = state.skipSpaces(p);
        if (p < m) {
          continue;
        }
        autoClosed = true;
        break;
      }

      const oldParent = state.parentType;
      state.parentType = 'root';
      const oldLineMax = state.lineMax;
      state.lineMax = nextLine;

      // open token
      const openToken = state.push('admonition_open', 'div', 1);
      openToken.block = true;
      openToken.meta = { type, title };
      openToken.map = [startLine, nextLine];

      // 内部内容作为块级 token 递归解析
      state.md.block.tokenize(state, startLine + 1, nextLine);

      const closeToken = state.push('admonition_close', 'div', -1);
      closeToken.block = true;

      state.parentType = oldParent;
      state.lineMax = oldLineMax;
      state.line = nextLine + (autoClosed ? 1 : 0);

      return true;
    },
    { alt: ['paragraph', 'reference', 'blockquote', 'list'] },
  );

  // 渲染：输出带 data 属性的 div，内部内容由 markdown-it 继续渲染
  md.renderer.rules.admonition_open = (tokens: any, idx: number, _opts: any, _env: any, self: any) => {
    const token = tokens[idx];
    const { type, title } = token.meta || {};
    const attrs: Array<[string, string]> = [
      ['class', `${prefix}-admonition ${prefix}-admonition-${type || ''}`],
      ['data-admonition-type', type || ''],
      ['data-admonition-title', title || ''],
    ];
    return `<div ${self.renderAttrs({ attrs } as any)}>`;
  };
  md.renderer.rules.admonition_close = () => '</div>';
};
