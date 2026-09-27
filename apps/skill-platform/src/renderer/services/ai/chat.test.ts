import { afterEach, describe, expect, it, vi } from 'vitest';

import { chatCompletion } from './chat';

describe('chatCompletion token limits', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('clamps an oversized saved value and prevents custom params from overriding it', async () => {
    let requestBody: Record<string, unknown> | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init?: RequestInit) => {
        requestBody = JSON.parse(String(init?.body));
        return new Response(
          JSON.stringify({
            choices: [
              {
                index: 0,
                message: { role: 'assistant', content: 'ok' },
                finish_reason: 'stop',
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }),
    );

    await chatCompletion(
      {
        provider: 'qwen',
        apiProtocol: 'openai',
        apiKey: 'test',
        apiUrl: 'https://example.com/v1',
        model: 'qwen-test',
        chatParams: {
          maxTokens: 1_000_000,
          customParams: {
            max_tokens: 999_999,
            max_completion_tokens: 0,
          },
        },
      },
      [{ role: 'user', content: 'hello' }],
    );

    expect(requestBody?.max_tokens).toBe(131_072);
    expect(requestBody).not.toHaveProperty('max_completion_tokens');
  });
});
