import type { DImageGenerationResponse, IAIConfig, IImageReferenceAttachment } from '../types';
import { EImageBackend, resolveImageBackend } from './backends';
import { generateImageViaProtocol } from './protocols';

export async function generateImage(
  config: IAIConfig,
  prompt: string,
  options?: {
    size?: string; // 不同 API 支持不同的尺寸格式 / Different APIs support different size formats
    quality?: 'standard' | 'hd';
    style?: 'vivid' | 'natural';
    n?: number;
    response_format?: 'url' | 'b64_json';
    aspect_ratio?: string; // FLUX/Ideogram 使用
    referenceImages?: IImageReferenceAttachment[];
  },
): Promise<DImageGenerationResponse> {
  const { apiKey, apiUrl, model } = config;
  const mergedOptions = {
    ...config.imageParams,
    ...options,
  };

  if (!apiKey) {
    throw new Error('API Key is not configured');
  }

  if (!apiUrl) {
    throw new Error('API URL is not configured');
  }

  const backend = resolveImageBackend(config);
  if (!backend) {
    throw new Error('当前配置不是生图模型，请先在设置中将模型类型设为「图像模型」');
  }

  if (backend === EImageBackend.EDashscopeMultimodal) {
    const protocolResult = await generateImageViaProtocol(config, prompt, mergedOptions);
    if (protocolResult) {
      return protocolResult;
    }
    throw new Error('DashScope 生图协议调用失败');
  }

  switch (backend) {
    case EImageBackend.EFlux:
      return await generateImageFlux(apiKey, apiUrl, model, prompt, mergedOptions);
    case EImageBackend.EIdeogram:
      return await generateImageIdeogram(apiKey, apiUrl, model, prompt, mergedOptions);
    case EImageBackend.ERecraft:
      return await generateImageRecraft(apiKey, apiUrl, model, prompt, mergedOptions);
    case EImageBackend.EReplicate:
      return await generateImageReplicate(apiKey, model, prompt, mergedOptions);
    case EImageBackend.EStability:
      return await generateImageStability(apiKey, apiUrl, model, prompt, mergedOptions);
    case EImageBackend.EGemini:
      return await generateImageGemini(apiKey, apiUrl, model, prompt, mergedOptions);
    case EImageBackend.EOpenAiImages:
      return await generateImageOpenAI(apiKey, apiUrl, model, prompt, mergedOptions);
    default:
      throw new Error(`未支持的生图后端: ${backend}`);
  }
}

// Google Gemini Image Generation via generateContent API
// Google Gemini 通过 generateContent API 生成图片
async function generateImageGemini(
  apiKey: string,
  apiUrl: string,
  model: string,
  prompt: string,
  options?: { n?: number; referenceImages?: IImageReferenceAttachment[] },
): Promise<DImageGenerationResponse> {
  // Build endpoint - Gemini uses generateContent
  // 构建端点 - Gemini 使用 generateContent
  let endpoint = apiUrl.replace(/\/$/, '');

  // Handle different URL formats
  if (endpoint.includes('/chat/completions')) {
    endpoint = endpoint.replace('/chat/completions', '');
  }
  if (endpoint.includes('/v1beta')) {
    endpoint = `${endpoint}/models/${model}:generateContent`;
  } else if (endpoint.includes('/v1')) {
    endpoint = endpoint.replace('/v1', '/v1beta');
    endpoint = `${endpoint}/models/${model}:generateContent`;
  } else {
    // Assume it's a proxy, try OpenAI-compatible chat endpoint
    endpoint = `${endpoint}/v1/chat/completions`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  let body: Record<string, any>;

  // Check if using native Gemini API or OpenAI-compatible proxy
  if (endpoint.includes(':generateContent')) {
    // Native Gemini API format
    headers['x-goog-api-key'] = apiKey;
    body = {
      contents: [
        {
          parts: [
            { text: prompt },
            ...(options?.referenceImages ?? []).map((image) => ({
              inlineData: {
                mimeType: image.mimeType,
                data: image.base64,
              },
            })),
          ],
        },
      ],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    };
  } else {
    // OpenAI-compatible proxy format (use chat completions)
    headers['Authorization'] = `Bearer ${apiKey}`;
    body = {
      model,
      messages: [
        {
          role: 'user',
          content:
            options?.referenceImages && options.referenceImages.length > 0
              ? [
                  { type: 'text', text: prompt },
                  ...options.referenceImages.map((image) => ({
                    type: 'image_url',
                    image_url: {
                      url: `data:${image.mimeType};base64,${image.base64}`,
                    },
                  })),
                ]
              : prompt,
        },
      ],
      stream: false,
    };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Gemini image generation failed (${response.status})`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage =
        errorJson.error?.message ||
        errorJson.error?.status ||
        errorJson.message ||
        (typeof errorJson.error === 'string' ? errorJson.error : null) ||
        errorMessage;

      // Append error code if available
      if (errorJson.error?.code) {
        errorMessage = `${errorMessage} (code: ${errorJson.error.code})`;
      }
    } catch {
      if (errorText) errorMessage = `${errorMessage}: ${errorText.slice(0, 500)}`;
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();

  // Handle different response formats
  // 处理不同的响应格式
  console.log(
    '[generateImageGemini] Response received:',
    JSON.stringify(result, null, 2).slice(0, 2000),
  );

  if (result.candidates) {
    // Native Gemini format
    const candidate = result.candidates[0];
    const parts = candidate?.content?.parts || [];
    console.log('[generateImageGemini] Gemini native format, parts count:', parts.length);

    const imagePart = parts.find((p: any) => p.inlineData?.mimeType?.startsWith('image/'));

    if (imagePart?.inlineData) {
      console.log(
        '[generateImageGemini] Found image data, mimeType:',
        imagePart.inlineData.mimeType,
      );
      return {
        created: Date.now(),
        data: [
          {
            b64_json: imagePart.inlineData.data,
          },
        ],
      };
    }

    // Check if there's text response (might indicate an error or refusal)
    const textPart = parts.find((p: any) => p.text);
    if (textPart?.text) {
      console.warn('[generateImageGemini] Got text instead of image:', textPart.text);
      throw new Error(`Model returned text instead of an image: ${textPart.text.slice(0, 200)}`);
    }

    // No image in response
    console.error('[generateImageGemini] No image data in candidates. Parts:', parts);
    throw new Error(
      'Gemini response did not contain image data. Please ensure you are using a model that supports image generation.',
    );
  }

  if (result.choices) {
    // OpenAI-compatible format from proxy
    const content = result.choices[0]?.message?.content;
    console.log(
      '[generateImageGemini] OpenAI format, content type:',
      typeof content,
      typeof content === 'string' ? content.slice(0, 200) : '(array or object)',
    );

    // Check if content contains image URL or base64
    if (typeof content === 'string') {
      // Try to extract URL if present
      const urlMatch = content.match(/https?:\/\/[^\s"'<>]+/i);
      if (urlMatch) {
        console.log('[generateImageGemini] Found URL in content:', urlMatch[0]);
        return {
          created: Date.now(),
          data: [{ url: urlMatch[0] }],
        };
      }
      // Check if it's base64
      if (content.startsWith('data:image/') || content.match(/^[A-Za-z0-9+/=]{100,}/)) {
        console.log('[generateImageGemini] Found base64 in content');
        return {
          created: Date.now(),
          data: [{ b64_json: content.replace(/^data:image\/[^;]+;base64,/, '') }],
        };
      }

      // Content is text, not image - might be refusal or error
      console.warn('[generateImageGemini] Content is text, not image:', content.slice(0, 500));
      throw new Error(`Model returned text instead of an image: ${content.slice(0, 300)}`);
    }

    // Content might be array with image_url
    if (Array.isArray(result.choices[0]?.message?.content)) {
      console.log('[generateImageGemini] Content is array, looking for image_url...');
      const imgContent = result.choices[0].message.content.find((c: any) => c.type === 'image_url');
      if (imgContent?.image_url?.url) {
        console.log(
          '[generateImageGemini] Found image_url:',
          imgContent.image_url.url.slice(0, 100),
        );
        const url = imgContent.image_url.url;
        if (url.startsWith('data:image/')) {
          return {
            created: Date.now(),
            data: [{ b64_json: url.replace(/^data:image\/[^;]+;base64,/, '') }],
          };
        }
        return {
          created: Date.now(),
          data: [{ url }],
        };
      }
    }

    // Check for images array in message (some proxies use this format)
    // 检查 message.images 数组（某些代理使用此格式）
    const images = result.choices[0]?.message?.images;
    if (Array.isArray(images) && images.length > 0) {
      console.log('[generateImageGemini] Found message.images array:', images.length, 'images');
      const firstImage = images[0];
      const imageUrl = firstImage?.image_url?.url || firstImage?.url;

      if (imageUrl) {
        console.log('[generateImageGemini] Extracted image URL:', imageUrl.slice(0, 100));
        if (imageUrl.startsWith('data:image/')) {
          return {
            created: Date.now(),
            data: [{ b64_json: imageUrl.replace(/^data:image\/[^;]+;base64,/, '') }],
          };
        }
        return {
          created: Date.now(),
          data: [{ url: imageUrl }],
        };
      }
    }

    // Content is null but no images found
    if (result.choices[0]?.message?.content === null) {
      console.error('[generateImageGemini] content is null and no images found in message');
    }
  }

  // If we got here, response format is unexpected
  console.error(
    '[generateImageGemini] Unexpected response format. Full response:',
    JSON.stringify(result, null, 2),
  );
  throw new Error(
    `Failed to extract image from response. Response format: ${JSON.stringify(result).slice(0, 500)}`,
  );
}

// OpenAI 兼容格式
async function generateImageOpenAI(
  apiKey: string,
  apiUrl: string,
  model: string,
  prompt: string,
  options?: {
    size?: string;
    quality?: 'standard' | 'hd';
    style?: 'vivid' | 'natural';
    n?: number;
    response_format?: 'url' | 'b64_json';
    referenceImages?: IImageReferenceAttachment[];
  },
): Promise<DImageGenerationResponse> {
  if (options?.referenceImages && options.referenceImages.length > 0) {
    throw new Error(
      'The selected image generation endpoint does not support reference images. Use a multimodal image generation model or Gemini-compatible endpoint.',
    );
  }

  let endpoint = apiUrl.replace(/\/$/, '');

  if (endpoint.includes('/images/generations')) {
    // 保持原样 / Keep as is
  } else if (endpoint.endsWith('/chat/completions')) {
    endpoint = endpoint.replace(/\/chat\/completions$/, '/images/generations');
  } else if (endpoint.match(/\/v\d+$/)) {
    endpoint = endpoint + '/images/generations';
  } else {
    endpoint = endpoint + '/v1/images/generations';
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };

  const body: Record<string, any> = {
    prompt,
    model: model || 'dall-e-3',
    n: options?.n ?? 1,
  };

  if (options?.size) body.size = options.size;
  if (options?.quality) body.quality = options.quality;
  if (options?.style) body.style = options.style;
  if (options?.response_format !== undefined) body.response_format = options.response_format;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Image generation failed (${response.status})`;
    // Image generation failed
    try {
      const errorJson = JSON.parse(errorText);
      // Try different error message formats
      // 尝试不同的错误消息格式
      errorMessage =
        errorJson.error?.message ||
        errorJson.error?.type ||
        errorJson.message ||
        errorJson.detail ||
        (typeof errorJson.error === 'string' ? errorJson.error : null) ||
        errorMessage;

      // If we have additional error info, append it
      // 如果有更多错误信息，附加上去
      if (errorJson.error?.code) {
        errorMessage = `${errorMessage} (code: ${errorJson.error.code})`;
      }
      if (errorJson.error?.type && errorJson.error?.type !== errorMessage) {
        errorMessage = `[${errorJson.error.type}] ${errorMessage}`;
      }
    } catch {
      if (errorText) errorMessage = errorText.slice(0, 500);
    }
    throw new Error(errorMessage);
  }

  return await response.json();
}

// FLUX (Black Forest Labs) API
async function generateImageFlux(
  apiKey: string,
  apiUrl: string,
  model: string,
  prompt: string,
  options?: { aspect_ratio?: string; n?: number },
): Promise<DImageGenerationResponse> {
  const endpoint = apiUrl.replace(/\/$/, '') + '/images/generations';

  const body: Record<string, any> = {
    prompt,
    model: model || 'flux-pro-1.1',
    width: 1024,
    height: 1024,
  };

  // FLUX 使用 aspect_ratio
  // FLUX uses aspect_ratio
  if (options?.aspect_ratio) {
    const [w, h] = options.aspect_ratio.split(':').map(Number);
    if (w && h) {
      body.width = w > h ? 1024 : Math.round((1024 * w) / h);
      body.height = h > w ? 1024 : Math.round((1024 * h) / w);
    }
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Key': apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`FLUX image generation failed: ${errorText.slice(0, 200)}`);
    // FLUX image generation failed
  }

  const result = await response.json();
  return {
    created: Date.now(),
    data: [{ url: result.sample || result.url || result.image }],
  };
}

// Ideogram API
async function generateImageIdeogram(
  apiKey: string,
  apiUrl: string,
  model: string,
  prompt: string,
  options?: { aspect_ratio?: string; n?: number },
): Promise<DImageGenerationResponse> {
  const endpoint = apiUrl.replace(/\/$/, '') + '/generate';

  const body: Record<string, any> = {
    image_request: {
      prompt,
      model: model || 'V_3',
      aspect_ratio: options?.aspect_ratio || 'ASPECT_1_1',
    },
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ideogram image generation failed: ${errorText.slice(0, 200)}`);
    // Ideogram image generation failed
  }

  const result = await response.json();
  const images = result.data || [];
  return {
    created: Date.now(),
    data: images.map((img: any) => ({ url: img.url })),
  };
}

// Recraft API
async function generateImageRecraft(
  apiKey: string,
  apiUrl: string,
  model: string,
  prompt: string,
  options?: { size?: string; n?: number },
): Promise<DImageGenerationResponse> {
  const endpoint = apiUrl.replace(/\/$/, '') + '/images/generations';

  const body: Record<string, any> = {
    prompt,
    model: model || 'recraftv3',
    n: options?.n ?? 1,
  };

  if (options?.size) body.size = options.size;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Recraft image generation failed: ${errorText.slice(0, 200)}`);
    // Recraft image generation failed
  }

  const result = await response.json();
  return {
    created: Date.now(),
    data: result.data || [{ url: result.image?.url }],
  };
}

// Replicate API
async function generateImageReplicate(
  apiKey: string,
  model: string,
  prompt: string,
  options?: { aspect_ratio?: string; n?: number },
): Promise<DImageGenerationResponse> {
  // Replicate 使用 predictions API
  // Replicate uses predictions API
  const endpoint = 'https://api.replicate.com/v1/predictions';

  const body: Record<string, any> = {
    version: model, // Replicate 使用 model version / Replicate uses model version
    input: {
      prompt,
      num_outputs: options?.n ?? 1,
    },
  };

  if (options?.aspect_ratio) {
    body.input.aspect_ratio = options.aspect_ratio;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Replicate image generation failed: ${errorText.slice(0, 200)}`);
    // Replicate image generation failed
  }

  const prediction = await response.json();

  // Replicate 是异步的，需要轮询结果
  // Replicate is asynchronous, need to poll for results
  let result = prediction;
  while (result.status === 'starting' || result.status === 'processing') {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const pollResponse = await fetch(result.urls.get, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    result = await pollResponse.json();
  }

  if (result.status === 'failed') {
    throw new Error(`Replicate image generation failed: ${result.error}`);
    // Replicate image generation failed
  }

  const outputs = Array.isArray(result.output) ? result.output : [result.output];
  return {
    created: Date.now(),
    data: outputs.map((url: string) => ({ url })),
  };
}

// Stability AI API
async function generateImageStability(
  apiKey: string,
  apiUrl: string,
  model: string,
  prompt: string,
  options?: { size?: string; n?: number },
): Promise<DImageGenerationResponse> {
  const endpoint =
    apiUrl.replace(/\/$/, '') +
    '/generation/' +
    (model || 'stable-diffusion-xl-1024-v1-0') +
    '/text-to-image';

  const body: Record<string, any> = {
    text_prompts: [{ text: prompt, weight: 1 }],
    samples: options?.n ?? 1,
    steps: 30,
  };

  if (options?.size) {
    const [width, height] = options.size.split('x').map(Number);
    if (width && height) {
      body.width = width;
      body.height = height;
    }
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Stability AI image generation failed: ${errorText.slice(0, 200)}`);
    // Stability AI image generation failed
  }

  const result = await response.json();
  return {
    created: Date.now(),
    data:
      result.artifacts?.map((art: any) => ({
        b64_json: art.base64,
      })) || [],
  };
}
