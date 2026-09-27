import { pluginEntrySource } from '@/shared/custom-tool-plugin';
import type { ICustomToolDocument, ICustomToolPlugin } from '@/types/modules';
import { CodeFileEditor } from '@momo/file-editor';
import {
  invokeCustomToolPlugin,
  openCustomToolDirectory,
} from '@renderer/services/custom-tool/api';
import { isCustomToolDirty, useCustomToolStore } from '@renderer/store/custom-tool';
import { Alert, App, Button, Empty, Form, Input, InputNumber, Select, Switch, Tag } from 'antd';
import {
  CheckCircle2Icon,
  FileCode2Icon,
  FileJsonIcon,
  FolderOpenIcon,
  PlayIcon,
  PlugIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import styles from './index.module.less';

type Schema = Record<string, any>;
export function PluginResult({
  value,
  schema = {},
  depth = 0,
}: {
  value: unknown;
  schema?: Schema;
  depth?: number;
}) {
  if (depth > 8) return <span>内容层级过深</span>;
  if (value === null || value === undefined) return <span>—</span>;
  if (Array.isArray(value))
    return (
      <div className={styles.results}>
        {value.slice(0, 100).map((item, i) => (
          <div className={styles.resultItem} key={i}>
            <PluginResult value={item} schema={schema.items} depth={depth + 1} />
          </div>
        ))}
        {value.length > 100 ? <p>共 {value.length} 项，显示前 100 项</p> : null}
      </div>
    );
  if (typeof value === 'object')
    return (
      <dl className={styles.resultFields}>
        {Object.entries(value).map(([key, item]) => (
          <div key={key}>
            <dt>{schema.properties?.[key]?.title ?? key}</dt>
            <dd>
              <PluginResult value={item} schema={schema.properties?.[key]} depth={depth + 1} />
            </dd>
          </div>
        ))}
      </dl>
    );
  return (
    <span className={styles.resultValue}>
      {typeof value === 'boolean' ? (value ? '是' : '否') : String(value)}
    </span>
  );
}

function Verification({ document, busy }: { document: ICustomToolDocument; busy: boolean }) {
  const [form] = Form.useForm();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ value: unknown; elapsed: number }>();
  const callSequence = useRef(0);
  const verifiedRevision = useRef('');
  const plugin = document.plugin!;
  const properties = (plugin.inputSchema.properties ?? {}) as Record<string, Schema>;
  const dirty = isCustomToolDirty();
  const available = Boolean(document.validation) && !dirty && !busy;
  const applyExample = (input: Record<string, unknown>) => {
    form.resetFields();
    form.setFieldsValue(
      Object.fromEntries(
        Object.entries(input).map(([key, value]) => [
          key,
          ['object', 'array'].includes(properties[key]?.type)
            ? JSON.stringify(value, null, 2)
            : value,
        ]),
      ),
    );
  };
  useEffect(() => {
    callSequence.current++;
    setRunning(false);
    setResult(undefined);
    setError('');
    applyExample(plugin.tests[0]?.input ?? {});
    return () => {
      callSequence.current++;
    };
  }, [document.id, document.validation?.revision, document.content, JSON.stringify(plugin)]);
  const run = async () => {
    const call = ++callSequence.current;
    try {
      const values = await form.validateFields();
      const input: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(values)) {
        if (value === undefined || value === null) continue;
        input[key] = ['object', 'array'].includes(properties[key]?.type)
          ? JSON.parse(String(value))
          : value;
      }
      setRunning(true);
      setError('');
      setResult(undefined);
      const started = performance.now();
      const output = await invokeCustomToolPlugin(document.id, input);
      if (call === callSequence.current)
        setResult({ value: output, elapsed: Math.round(performance.now() - started) });
    } catch (failure) {
      if (call === callSequence.current)
        setError(failure instanceof Error ? failure.message : '请检查输入参数');
    } finally {
      if (call === callSequence.current) setRunning(false);
    }
  };
  useEffect(() => {
    const revision = document.id + ':' + document.validation?.revision;
    if (!available || !plugin.tests.length || verifiedRevision.current === revision) return;
    verifiedRevision.current = revision;
    void run();
  }, [available, document.id, document.validation?.revision]);
  return (
    <section className={styles.verify} aria-label='插件验证界面'>
      <div className={styles.sectionHeading}>
        <PlayIcon size={16} />
        <strong>运行验证</strong>
        <Tag color={available ? 'success' : 'default'}>
          {available ? '已注册' : document.validation ? '修改待校验' : '待生成'}
        </Tag>
      </div>
      {!document.content ? (
        <Empty description='描述工具需求后，将自动生成参数表单与验证结果界面' />
      ) : (
        <>
          <p className={styles.description}>{plugin.description}</p>
          {!available ? (
            <Alert type='info' showIcon title='先保存并通过校验，即可调用当前插件' />
          ) : null}
          {plugin.tests.length ? (
            <div className={styles.examples}>
              {plugin.tests.map((test, i) => (
                <Button
                  size='small'
                  disabled={running}
                  key={i}
                  onClick={() => applyExample(test.input)}>
                  {test.name}
                </Button>
              ))}
            </div>
          ) : null}
          <Form form={form} layout='vertical' disabled={!available || running}>
            {Object.entries(properties).map(([key, schema]) => (
              <Form.Item
                key={key}
                name={key}
                label={schema.title || key}
                extra={schema.description}
                valuePropName={schema.type === 'boolean' ? 'checked' : 'value'}
                initialValue={schema.default}
                rules={[
                  {
                    validator: async (_, value) => {
                      if (
                        (plugin.inputSchema.required as string[] | undefined)?.includes(key) &&
                        (value === undefined || value === null)
                      )
                        throw Error('请填写此参数');
                    },
                  },
                ]}>
                {schema.enum ? (
                  <Select
                    options={schema.enum.map((value: unknown) => ({ label: String(value), value }))}
                  />
                ) : schema.type === 'boolean' ? (
                  <Switch />
                ) : ['number', 'integer'].includes(schema.type) ? (
                  <InputNumber
                    style={{ width: '100%' }}
                    min={schema.minimum}
                    max={schema.maximum}
                    precision={schema.type === 'integer' ? 0 : undefined}
                  />
                ) : ['array', 'object'].includes(schema.type) ? (
                  <Input.TextArea
                    autoSize={{ minRows: 3, maxRows: 9 }}
                    placeholder='输入 JSON 数据'
                  />
                ) : (
                  <Input.TextArea autoSize={{ minRows: 1, maxRows: 6 }} />
                )}
              </Form.Item>
            ))}
            <Button
              type='primary'
              icon={<PlayIcon size={14} />}
              onClick={() => void run()}
              loading={running}
              disabled={!available}>
              调用插件
            </Button>
          </Form>
          {error ? <Alert type='error' title='调用未通过' description={error} showIcon /> : null}
          {result ? (
            <div className={styles.result}>
              <div className={styles.sectionHeading}>
                <CheckCircle2Icon size={16} />
                <strong>调用成功</strong>
                <span>{result.elapsed} ms</span>
              </div>
              <PluginResult value={result.value} schema={plugin.outputSchema} />
            </div>
          ) : null}
          {document.validation ? (
            <p className={styles.testStatus}>
              已通过 {document.validation.results.length} 个生成测试。验证表单与 AI
              对话使用同一插件实现。
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}

export function CustomToolPluginWorkspace({
  document,
  editing,
  busy,
  onValidityChange,
}: {
  document: ICustomToolDocument;
  editing: boolean;
  busy: boolean;
  onValidityChange: (valid: boolean) => void;
}) {
  const { message } = App.useApp();
  const [selected, setSelected] = useState('execute.js');
  const [manifest, setManifest] = useState('');
  const [manifestError, setManifestError] = useState('');
  const plugin = document.plugin!;
  const setPluginDraft = useCustomToolStore((state) => state.setPluginDraft);
  useEffect(() => {
    onValidityChange(!manifestError);
    return () => onValidityChange(true);
  }, [manifestError, onValidityChange]);
  useEffect(() => {
    setManifest(JSON.stringify(plugin, null, 2));
    setManifestError('');
  }, [JSON.stringify(plugin)]);
  const files = ['index.mjs', 'plugin.json', 'execute.js'];
  const source =
    selected === 'index.mjs'
      ? pluginEntrySource(plugin)
      : selected === 'plugin.json'
        ? manifest
        : document.content;
  const change = (value: string) => {
    if (!editing || busy || selected === 'index.mjs') return;
    if (selected === 'execute.js') setPluginDraft(value, plugin);
    else {
      setManifest(value);
      try {
        const parsed = JSON.parse(value) as ICustomToolPlugin;
        if (
          parsed.identifier !== plugin.identifier ||
          !parsed.inputSchema ||
          !parsed.outputSchema ||
          !Array.isArray(parsed.tests) ||
          parsed.tests.some((test) => !test || typeof test.name !== 'string' || !test.input) ||
          typeof parsed.description !== 'string'
        )
          throw Error('请保留工具标识、描述、参数定义和测试数组');
        setManifestError('');
        setPluginDraft(document.content, parsed);
      } catch (error) {
        setManifestError(error instanceof Error ? error.message : String(error));
      }
    }
  };
  return (
    <div className={styles.workspace}>
      <section className={styles.files} aria-label='插件文件管理器'>
        <div className={styles.sectionHeading}>
          <PlugIcon size={16} />
          <strong>{plugin.identifier}</strong>
          <Button
            type='text'
            size='small'
            icon={<FolderOpenIcon size={16} />}
            aria-label='打开插件目录'
            onClick={() =>
              void openCustomToolDirectory(document.id).catch((error) =>
                message.error(String(error)),
              )
            }
          />
        </div>
        <div className={styles.fileBody}>
          <nav className={styles.fileTree} aria-label='插件文件'>
            {files.map((file) => (
              <button
                type='button'
                key={file}
                aria-current={selected === file ? 'page' : undefined}
                onClick={() => setSelected(file)}>
                {file.endsWith('.json') ? <FileJsonIcon size={15} /> : <FileCode2Icon size={15} />}
                {file}
              </button>
            ))}
          </nav>
          <div className={styles.editor}>
            <div className={styles.fileHeading}>
              {selected}
              {selected === 'index.mjs' ? ' · 自动生成的注册入口' : !editing ? ' · 只读' : ''}
            </div>
            {manifestError ? (
              <Alert
                type='error'
                title='定义未应用，请修正 JSON 后保存'
                description={manifestError}
              />
            ) : null}
            <CodeFileEditor
              key={selected}
              relativePath={selected}
              value={source}
              readOnly={!editing || busy || selected === 'index.mjs'}
              onChange={change}
            />
          </div>
        </div>
      </section>
      <Verification document={document} busy={busy || Boolean(manifestError)} />
    </div>
  );
}
