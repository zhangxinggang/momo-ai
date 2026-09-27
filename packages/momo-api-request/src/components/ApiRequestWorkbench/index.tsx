import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  PlusOutlined,
  SendOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Checkbox,
  Empty,
  Input,
  InputNumber,
  Radio,
  Select,
  Space,
  Spin,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import { useMemo, useState } from 'react';

import { createApiKeyValue, parseApiResponseBody } from '../../core';
import type {
  ApiHttpMethod,
  ApiRequestAuth,
  ApiRequestExecutor,
  IApiKeyValue,
  IApiRequestConfig,
  IApiRequestResponse,
} from '../../types';
import styles from './index.module.less';

const METHODS: ApiHttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

interface IProps {
  value: IApiRequestConfig;
  onChange: (value: IApiRequestConfig) => void;
  execute: ApiRequestExecutor;
  compact?: boolean;
  title?: string;
}

function KeyValueEditor({
  value,
  onChange,
}: {
  value: IApiKeyValue[];
  onChange: (value: IApiKeyValue[]) => void;
}) {
  const update = (id: string, patch: Partial<IApiKeyValue>) =>
    onChange(value.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  return (
    <div className={styles['key-value-list']}>
      {value.length ? (
        value.map((item) => (
          <div className={styles['key-value-row']} key={item.id}>
            <Checkbox
              checked={item.enabled}
              aria-label='启用参数'
              onChange={(event) => update(item.id, { enabled: event.target.checked })}
            />
            <Input
              value={item.key}
              placeholder='参数名'
              onChange={(event) => update(item.id, { key: event.target.value })}
            />
            <Input
              value={item.value}
              placeholder='值'
              onChange={(event) => update(item.id, { value: event.target.value })}
            />
            <Button
              type='text'
              danger
              icon={<DeleteOutlined />}
              aria-label='删除参数'
              onClick={() => onChange(value.filter((candidate) => candidate.id !== item.id))}
            />
          </div>
        ))
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='暂无配置' />
      )}
      <Button
        type='dashed'
        icon={<PlusOutlined />}
        onClick={() => onChange([...value, createApiKeyValue()])}>
        添加一行
      </Button>
    </div>
  );
}

function AuthEditor({
  value,
  onChange,
}: {
  value: ApiRequestAuth;
  onChange: (value: ApiRequestAuth) => void;
}) {
  return (
    <div className={styles['auth-editor']}>
      <Select
        value={value.type}
        onChange={(type: ApiRequestAuth['type']) => {
          if (type === 'bearer') onChange({ type, token: '' });
          else if (type === 'basic') onChange({ type, username: '', password: '' });
          else if (type === 'api-key') onChange({ type, key: '', value: '', placement: 'header' });
          else onChange({ type: 'none' });
        }}
        options={[
          { value: 'none', label: '无认证' },
          { value: 'bearer', label: 'Bearer Token' },
          { value: 'basic', label: 'Basic Auth' },
          { value: 'api-key', label: 'API Key' },
        ]}
      />
      {value.type === 'bearer' ? (
        <Input.Password
          value={value.token}
          placeholder='Token'
          onChange={(event) => onChange({ ...value, token: event.target.value })}
        />
      ) : null}
      {value.type === 'basic' ? (
        <>
          <Input
            value={value.username}
            placeholder='用户名'
            onChange={(event) => onChange({ ...value, username: event.target.value })}
          />
          <Input.Password
            value={value.password}
            placeholder='密码'
            onChange={(event) => onChange({ ...value, password: event.target.value })}
          />
        </>
      ) : null}
      {value.type === 'api-key' ? (
        <>
          <Input
            value={value.key}
            placeholder='Key 名称'
            onChange={(event) => onChange({ ...value, key: event.target.value })}
          />
          <Input.Password
            value={value.value}
            placeholder='Key 值'
            onChange={(event) => onChange({ ...value, value: event.target.value })}
          />
          <Radio.Group
            value={value.placement}
            onChange={(event) => onChange({ ...value, placement: event.target.value })}>
            <Radio value='header'>Header</Radio>
            <Radio value='query'>Query</Radio>
          </Radio.Group>
        </>
      ) : null}
    </div>
  );
}

function formatBytes(value: number): string {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(2)} KB`;
  return `${(value / 1024 / 1024).toFixed(2)} MB`;
}

function prettyBody(response: IApiRequestResponse): string {
  const parsed = parseApiResponseBody(response);
  return typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2);
}

export function ApiRequestWorkbench({ value, onChange, execute, compact, title }: IProps) {
  const [response, setResponse] = useState<IApiRequestResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const patch = (next: Partial<IApiRequestConfig>) => onChange({ ...value, ...next });
  const responseHeaders = useMemo(
    () => (response ? JSON.stringify(response.headers, null, 2) : ''),
    [response],
  );

  const send = async () => {
    setLoading(true);
    setError('');
    try {
      setResponse(await execute(value));
    } catch (requestError) {
      setResponse(null);
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.workbench} data-compact={compact || undefined}>
      {title ? <div className={styles.title}>{title}</div> : null}
      <div className={styles.requestLine}>
        <Select
          className={styles.method}
          value={value.method}
          onChange={(method) => patch({ method })}
          options={METHODS.map((method) => ({ value: method, label: method }))}
        />
        <Input
          value={value.url}
          placeholder='https://api.example.com/v1/resource'
          onChange={(event) => patch({ url: event.target.value })}
          onPressEnter={() => void send()}
        />
        <Button
          type='primary'
          icon={<SendOutlined />}
          loading={loading}
          onClick={() => void send()}>
          发送
        </Button>
      </div>

      <Tabs
        size='small'
        items={[
          {
            key: 'parameters',
            label: `参数${value.query.length ? ` ${value.query.length}` : ''}`,
            children: <KeyValueEditor value={value.query} onChange={(query) => patch({ query })} />,
          },
          {
            key: 'body',
            label: 'Body',
            children: (
              <div className={styles.bodyEditor}>
                <Radio.Group
                  size='small'
                  value={value.body.mode}
                  onChange={(event) =>
                    patch({ body: { ...value.body, mode: event.target.value } })
                  }>
                  <Radio.Button value='none'>无</Radio.Button>
                  <Radio.Button value='json'>JSON</Radio.Button>
                  <Radio.Button value='text'>Text</Radio.Button>
                  <Radio.Button value='form-urlencoded'>Form URL Encoded</Radio.Button>
                </Radio.Group>
                {value.body.mode !== 'none' ? (
                  <Input.TextArea
                    value={value.body.content}
                    autoSize={{ minRows: 5, maxRows: 14 }}
                    placeholder={value.body.mode === 'json' ? '{\n  "key": "value"\n}' : '请求内容'}
                    onChange={(event) =>
                      patch({ body: { ...value.body, content: event.target.value } })
                    }
                  />
                ) : null}
              </div>
            ),
          },
          {
            key: 'headers',
            label: `Headers${value.headers.length ? ` ${value.headers.length}` : ''}`,
            children: (
              <KeyValueEditor value={value.headers} onChange={(headers) => patch({ headers })} />
            ),
          },
          {
            key: 'authorization',
            label: 'Authorization',
            children: <AuthEditor value={value.auth} onChange={(auth) => patch({ auth })} />,
          },
          {
            key: 'settings',
            label: '设置',
            children: (
              <Space>
                <Typography.Text type='secondary'>超时时间</Typography.Text>
                <InputNumber
                  min={100}
                  max={300_000}
                  step={1000}
                  value={value.timeoutMs}
                  addonAfter='ms'
                  onChange={(timeoutMs) => patch({ timeoutMs: timeoutMs ?? 30_000 })}
                />
              </Space>
            ),
          },
        ]}
      />

      <div className={styles.response}>
        {loading ? (
          <div className={styles.placeholder}>
            <Spin size='small' /> 正在请求接口…
          </div>
        ) : error ? (
          <Alert type='error' showIcon message='请求失败' description={error} />
        ) : response ? (
          <>
            <div className={styles.responseMeta}>
              <Tag
                color={response.ok ? 'success' : 'error'}
                icon={response.ok ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
                {response.status} {response.statusText}
              </Tag>
              <span>耗时 {response.durationMs} ms</span>
              <span>大小 {formatBytes(response.sizeBytes)}</span>
              {response.truncated ? <Tag color='warning'>响应已截断</Tag> : null}
            </div>
            <Tabs
              size='small'
              items={[
                {
                  key: 'pretty',
                  label: 'JSON',
                  children: <pre className={styles.code}>{prettyBody(response)}</pre>,
                },
                {
                  key: 'raw',
                  label: 'Raw',
                  children: <pre className={styles.code}>{response.body}</pre>,
                },
                {
                  key: 'response-headers',
                  label: 'Headers',
                  children: <pre className={styles.code}>{responseHeaders}</pre>,
                },
              ]}
            />
          </>
        ) : (
          <div className={styles.placeholder}>发送请求后在这里查看状态、耗时与响应内容</div>
        )}
      </div>
    </section>
  );
}
