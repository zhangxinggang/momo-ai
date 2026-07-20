import { isProductDesignOrConsultIntent } from '@renderer/services/aichat/intent/product-design';

const DEV_KEYWORDS =
  /报错|错误|接口|类|函数|配置|实现|模块|组件|源码|代码|文件|目录|仓库|项目|重构|改造|优化|bug|error|fix|refactor|implement/i;
const PRODUCT_KEYWORDS =
  /设计|方案|功能|页面|界面|交互|列表|批量|管理|标签|筛选|编辑|面板|弹窗|UI|UX|体验/i;
const PATH_PATTERN =
  /[\w.-]+\/[\w./-]+|[\w.-]+\.(ts|tsx|js|jsx|json|md|mdc|less|css|yaml|yml)\b/i;
const IDENTIFIER = /\b[A-Z][a-zA-Z0-9]{2,}\b|\b[a-z][a-zA-Z0-9]{2,}\b/;

/** 是否应向模型注入工作区上下文（目录树等）；比 Grep 门槛更严，避免闲聊被带偏 */
export function shouldAttachWorkspaceContext(message: string): boolean {
  const text = message.trim();
  if (!text) {
    return false;
  }
  return (
    DEV_KEYWORDS.test(text) ||
    PRODUCT_KEYWORDS.test(text) ||
    PATH_PATTERN.test(text) ||
    isProductDesignOrConsultIntent(text)
  );
}

/** 判断用户问题是否可能与工作区代码相关（用于 Grep 片段检索） */
export function isWorkspaceRelatedQuestion(message: string): boolean {
  const text = message.trim();
  if (!text) {
    return false;
  }
  return shouldAttachWorkspaceContext(text) || IDENTIFIER.test(text);
}
