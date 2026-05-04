export interface DAITransportRequest {
  requestId?: string;
  method: 'GET' | 'POST';
  url: string;
  headers?: Record<string, string>;
  body?: string;
}

export type EAIProtocol = 'openai' | 'gemini' | 'anthropic';

export interface DAITransportResponse {
  ok: boolean;
  status: number;
  statusText: string;
  body: string;
  headers: Record<string, string>;
  error?: string;
}

export interface DAITransportStreamChunk {
  requestId: string;
  chunk: string;
}

export interface DAITransportStreamError {
  requestId: string;
  error: string;
}
