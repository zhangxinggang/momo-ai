/** LangChain 文档片段 */
export interface ILangchainDocument {
  pageContent: string;
  metadata?: Record<string, unknown>;
}
