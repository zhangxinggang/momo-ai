export interface IProps {
  /** 笔记相对路径 */
  path: string;
  /** 输入框镜像层占位文本（与 textarea 等宽） */
  measureText?: string;
  /** 是否显示 tooltip，镜像层传 false */
  showTooltip?: boolean;
  className?: string;
}
