import type { IAIConfig, IImageTestResult } from '../types';
import { generateImage } from './generate';

export async function testImageGeneration(
  config: IAIConfig,
  testPrompt?: string,
): Promise<IImageTestResult> {
  const startTime = Date.now();
  const prompt = testPrompt || 'A cute cat sitting on a windowsill';

  try {
    // 测试时不传递 size 等参数，让 API 使用默认值
    // Don't pass size and other parameters during testing, let API use default values
    const result = await generateImage({ ...config, imageParams: undefined }, prompt, { n: 1 });

    const imageData = result.data[0];

    return {
      success: true,
      imageUrl: imageData.url,
      imageBase64: imageData.b64_json,
      revisedPrompt: imageData.revised_prompt,
      latency: Date.now() - startTime,
      model: config.model,
      provider: config.provider,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      latency: Date.now() - startTime,
      model: config.model,
      provider: config.provider,
    };
  }
}
