import { describe, expect, it } from 'vitest';

import { createApiRequestConfig, executeApiRequest, prepareApiRequest } from './core';

describe('api request core', () => {
  it('builds query, headers, auth and JSON body', () => {
    const config = createApiRequestConfig();
    config.method = 'POST';
    config.url = 'https://example.com/users?existing=1';
    config.query = [{ id: 'q', key: 'page', value: '2', enabled: true }];
    config.headers = [{ id: 'h', key: 'X-Trace', value: 'abc', enabled: true }];
    config.auth = { type: 'bearer', token: 'secret' };
    config.body = { mode: 'json', content: '{"name":"Momo"}' };
    const request = prepareApiRequest(config);
    expect(request.url).toContain('existing=1');
    expect(request.url).toContain('page=2');
    expect(new Headers(request.init.headers).get('authorization')).toBe('Bearer secret');
    expect(new Headers(request.init.headers).get('content-type')).toBe('application/json');
  });

  it('returns non-2xx responses without throwing', async () => {
    const config = createApiRequestConfig();
    config.url = 'https://example.com/missing';
    const response = await executeApiRequest(
      config,
      async () =>
        new Response('{"error":"missing"}', {
          status: 404,
          headers: { 'content-type': 'application/json' },
        }),
    );
    expect(response.status).toBe(404);
    expect(response.ok).toBe(false);
    expect(response.body).toContain('missing');
  });

  it('rejects non-http schemes', () => {
    const config = createApiRequestConfig();
    config.url = 'file:///tmp/a';
    expect(() => prepareApiRequest(config)).toThrow('仅支持 HTTP 和 HTTPS');
  });

  it('rejects malformed data from IPC or persisted configuration', () => {
    expect(() => prepareApiRequest({ method: 'TRACE' } as never)).toThrow('请求方法无效');
  });
});
