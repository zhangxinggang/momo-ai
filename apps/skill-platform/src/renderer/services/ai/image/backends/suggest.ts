/**
 * 远程模型列表 UI 分组建议（不参与运行时生图判定）。
 * 用于「获取模型」弹窗中预标注「生图 / 对话」，帮助用户批量添加时选择正确类型。
 */
const REMOTE_IMAGE_MODEL_SUGGEST_PATTERN =
  /dall-e|dalle|flux|stable-diffusion|stable_diffusion|imagen|gpt-image|image-preview|seedream|wanx|wan2\.|text-to-image|text2image|qwen-image|ideogram|recraft|sdxl|sd3|kolors|cogview|hunyuan.*image|[-_]image[-_]|[-_]image$/i;

export function suggestRemoteModelAsImage(modelId: string, ownedBy?: string): boolean {
  const hint = `${modelId} ${ownedBy ?? ''}`.toLowerCase();
  return REMOTE_IMAGE_MODEL_SUGGEST_PATTERN.test(hint);
}
