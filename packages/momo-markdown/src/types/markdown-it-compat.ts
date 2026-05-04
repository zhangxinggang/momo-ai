/**
 * markdown-it 14 与 @types/markdown-it 使用 export=，命名导出需经此模块再导出
 */
import MarkdownIt from 'markdown-it';

export type MdItInstance = InstanceType<typeof MarkdownIt>;
export type MdItOptions = ConstructorParameters<typeof MarkdownIt>[0];
export type MdToken = ReturnType<MdItInstance['parse']>[number];
export type MdRenderer = MdItInstance['renderer'];
export type MdParserBlock = MdItInstance['block'];
export type MdParserInline = MdItInstance['inline'];

/** 渲染规则（对应 markdown-it Renderer.RenderRule） */
export type MdRenderRule = (
  tokens: MdToken[],
  idx: number,
  options: MdItOptions,
  env: unknown,
  self: MdRenderer,
) => string;

/** 行内解析规则（对应 ParserInline.RuleInline） */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MdRuleInline = (state: any, silent: boolean) => boolean;

/** 块级解析规则（对应 ParserBlock.RuleBlock） */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MdRuleBlock = (state: any, start: number, end: number, silent: boolean) => boolean;

/** 插件函数（对应 markdown-it PluginWithParams） */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MdPluginWithParams = (md: MdItInstance, ...params: any[]) => void;

export { default as markdownit } from 'markdown-it';
