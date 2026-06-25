const DEV_KEYWORDS = /报错|错误|接口|类|函数|配置|实现|模块|组件|源码|代码|文件|目录|仓库|项目/;
const PATH_PATTERN = /[\w.-]+\/[\w./-]+|[\w.-]+\.(ts|tsx|js|jsx|json|md|mdc|less|css|yaml|yml)\b/i;
const IDENTIFIER = /\b[A-Z][a-zA-Z0-9]{2,}\b|\b[a-z][a-zA-Z0-9]{2,}\b/;

/** 判断用户问题是否可能与工作区代码相关 */
export function isWorkspaceRelatedQuestion(message: string): boolean {
  const text = message.trim();
  if (!text) {
    return false;
  }
  return DEV_KEYWORDS.test(text) || PATH_PATTERN.test(text) || IDENTIFIER.test(text);
}
