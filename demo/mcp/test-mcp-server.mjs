#!/usr/bin/env node
/**
 * 简易 stdio MCP Server，用于 MCP 管理联调。
 * 工具：
 * - echo: 原样返回文本
 * - add: 两数相加
 * - now: 返回当前时间
 *
 * 启动：node apps/skill-platform/scripts/test-mcp-server.mjs
 */

import readline from 'node:readline';

const SERVER_INFO = {
  name: 'aim-test-mcp',
  version: '1.0.0',
};

const TOOLS = [
  {
    name: 'echo',
    description: '原样返回传入的文本，用于验证 MCP 工具调用链路',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: '要回显的文本' },
      },
      required: ['text'],
    },
  },
  {
    name: 'add',
    description: '计算两个数字的和',
    inputSchema: {
      type: 'object',
      properties: {
        a: { type: 'number', description: '加数 a' },
        b: { type: 'number', description: '加数 b' },
      },
      required: ['a', 'b'],
    },
  },
  {
    name: 'now',
    description: '返回当前本地时间 ISO 字符串',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

function send(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function okResult(id, result) {
  send({ jsonrpc: '2.0', id, result });
}

function errorResult(id, code, message) {
  send({ jsonrpc: '2.0', id, error: { code, message } });
}

function textContent(text) {
  return {
    content: [{ type: 'text', text }],
  };
}

function handleToolsCall(args, name) {
  if (name === 'echo') {
    const text = typeof args?.text === 'string' ? args.text : '';
    return textContent(`echo: ${text}`);
  }
  if (name === 'add') {
    const a = Number(args?.a);
    const b = Number(args?.b);
    if (Number.isNaN(a) || Number.isNaN(b)) {
      return {
        isError: true,
        content: [{ type: 'text', text: '参数 a/b 必须是数字' }],
      };
    }
    return textContent(`sum=${a + b}`);
  }
  if (name === 'now') {
    return textContent(new Date().toISOString());
  }
  return {
    isError: true,
    content: [{ type: 'text', text: `未知工具: ${name}` }],
  };
}

function handleRequest(message) {
  const { id, method, params } = message;

  if (method === 'initialize') {
    okResult(id, {
      protocolVersion: params?.protocolVersion || '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: SERVER_INFO,
    });
    return;
  }

  if (method === 'notifications/initialized' || method === 'initialized') {
    return;
  }

  if (method === 'ping') {
    okResult(id, {});
    return;
  }

  if (method === 'tools/list') {
    okResult(id, { tools: TOOLS });
    return;
  }

  if (method === 'tools/call') {
    const name = params?.name;
    const args = params?.arguments ?? {};
    okResult(id, handleToolsCall(args, name));
    return;
  }

  if (id !== undefined) {
    errorResult(id, -32601, `Method not found: ${method}`);
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  crlfDelay: Infinity,
});

rl.on('line', (line) => {
  const trimmed = line.trim();
  if (!trimmed) {
    return;
  }
  let message;
  try {
    message = JSON.parse(trimmed);
  } catch {
    return;
  }
  if (!message || typeof message !== 'object') {
    return;
  }
  try {
    handleRequest(message);
  } catch (error) {
    if (message.id !== undefined) {
      errorResult(message.id, -32603, error instanceof Error ? error.message : String(error));
    }
  }
});

rl.on('close', () => {
  process.exit(0);
});
