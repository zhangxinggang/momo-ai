/** 用户是否在征求产品/功能设计或咨询方案（而非执行技能脚本） */
export function isProductDesignOrConsultIntent(message: string): boolean {
  const text = message.trim();
  if (!text) {
    return false;
  }

  // 明确要求按技能执行或产出脚本/文件 → 走技能执行
  if (
    /skill-run|执行脚本|运行脚本|生成脚本|帮我生成文件|按照(?:该|此|这个)?技能|用这个技能|执行该技能|产出交付物/i.test(
      text,
    )
  ) {
    return false;
  }

  if (
    /请帮我设计|设计一个方案|设计方案|交互方案|产品方案|功能方案|改造方案|优化方案|帮我规划/.test(
      text,
    )
  ) {
    return true;
  }

  if (
    /(不方便|不好用|难用|体验差|不好管理)/.test(text) &&
    /(管理|设置|编辑|替换|新增|批量|列表)/.test(text)
  ) {
    return true;
  }

  if (
    /如何(实现|改进|优化|改造|设计)/.test(text) &&
    /(功能|页面|界面|列表|标签|组件|面板)/.test(text)
  ) {
    return true;
  }

  return false;
}
