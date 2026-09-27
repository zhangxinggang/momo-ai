import type { ICustomToolComponentConfig } from '@/types/modules';
import { ApiRequestWorkbench } from '@momo/api-request';
import { executeConfiguredApiRequest } from '@renderer/services/custom-tool/api';
import {
  Alert,
  Button,
  Divider,
  Empty,
  Input,
  InputNumber,
  Radio,
  Select,
  Switch,
  Table,
  Tabs,
  Typography,
} from 'antd';
import { XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import styles from './index.module.less';
import { getOpenUIPropertyOptions, isSelectValue, type TSelectValue } from './property-options';

interface IProps {
  componentId: string;
  value: ICustomToolComponentConfig;
  onChange: (value: ICustomToolComponentConfig) => void;
  onClose: () => void;
}

function JsonEditor({
  value,
  onChange,
  objectOnly,
  placeholder,
  minRows = 7,
}: {
  value: unknown;
  onChange: (value: unknown) => void;
  objectOnly?: boolean;
  placeholder: string;
  minRows?: number;
}) {
  const serialized = JSON.stringify(value, null, 2) ?? '';
  const [draft, setDraft] = useState(serialized);
  const [error, setError] = useState('');
  useEffect(() => setDraft(serialized), [serialized]);
  return (
    <div className={styles.jsonEditor}>
      <Input.TextArea
        className={styles.resizableTextarea}
        value={draft}
        rows={minRows}
        placeholder={placeholder}
        onChange={(event) => {
          const next = event.target.value;
          setDraft(next);
          try {
            const parsed = JSON.parse(next);
            if (objectOnly && (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))) {
              throw new Error('必须是 JSON 对象');
            }
            setError('');
            onChange(parsed);
          } catch (parseError) {
            setError(parseError instanceof Error ? parseError.message : 'JSON 格式无效');
          }
        }}
      />
      {error ? <span className={styles.error}>{error}</span> : null}
    </div>
  );
}

const FRIENDLY_PROP_NAMES: Record<string, string> = {
  title: '标题',
  name: '名称',
  label: '标签',
  description: '说明',
  content: '内容',
  value: '值',
  variant: '样式',
  color: '颜色',
  size: '尺寸',
  disabled: '是否禁用',
  visible: '是否显示',
  placeholder: '输入提示',
  items: '列表项',
  rows: '行数据',
  data: '数据',
};

function friendlyPropName(key: string) {
  return FRIENDLY_PROP_NAMES[key] ?? key.replace(/([a-z])([A-Z])/g, '$1 $2');
}

function PropertyValueEditor({
  value,
  options,
  onChange,
}: {
  value: unknown;
  options: TSelectValue[];
  onChange: (value: unknown) => void;
}) {
  if (options.length) {
    return (
      <Select
        className={styles.propertySelect}
        value={isSelectValue(value) ? value : undefined}
        options={options.map((option) => ({ label: String(option), value: option }))}
        onChange={onChange}
      />
    );
  }
  if (typeof value === 'boolean') return <Switch checked={value} onChange={onChange} />;
  if (typeof value === 'number') {
    return <InputNumber value={value} onChange={(next) => onChange(next ?? 0)} />;
  }
  if (typeof value === 'string') {
    return (
      <Input.TextArea
        className={styles.resizableTextarea}
        rows={2}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }
  return <JsonEditor value={value} minRows={2} placeholder='请输入 JSON 值' onChange={onChange} />;
}

export function CustomToolDataPanel({ componentId, value, onChange, onClose }: IProps) {
  const patchData = (patch: Partial<ICustomToolComponentConfig['data']>) =>
    onChange({ ...value, data: { ...value.data, ...patch } });
  const effectiveProps = { ...value.sourceProps, ...value.props };
  const propertyRows = Object.entries(effectiveProps).map(([key, propertyValue]) => ({
    key,
    propertyValue,
    options: getOpenUIPropertyOptions(value.componentType, key),
  }));
  const targetPropOptions = [...new Set([...Object.keys(effectiveProps), value.data.targetProp])]
    .filter(Boolean)
    .map((propertyName) => ({
      label: `${friendlyPropName(propertyName)} (${propertyName})`,
      value: propertyName,
    }));

  return (
    <aside className={styles.panel} aria-label='组件数据设置'>
      <header className={styles.header}>
        <div>
          <Typography.Text strong>{value.componentType}</Typography.Text>
          <div className={styles.componentId}>{componentId}</div>
        </div>
        <Button
          type='text'
          icon={<XIcon size={16} />}
          aria-label='关闭数据面板'
          onClick={onClose}
        />
      </header>
      <Tabs
        className={styles.tabs}
        items={[
          {
            key: 'data',
            label: '数据',
            children: (
              <div className={styles.content}>
                <label className={styles.field}>
                  <span>数据来源</span>
                  <Radio.Group
                    value={value.data.mode}
                    optionType='button'
                    buttonStyle='solid'
                    options={[
                      { label: '静态数据', value: 'static' },
                      { label: '接口请求', value: 'api' },
                    ]}
                    onChange={(event) => patchData({ mode: event.target.value })}
                  />
                </label>
                <label className={styles.field}>
                  <span>写入组件属性</span>
                  <Select
                    value={value.data.targetProp}
                    options={targetPropOptions}
                    placeholder='选择接收数据的组件属性'
                    onChange={(targetProp) => patchData({ targetProp })}
                  />
                </label>
                {value.data.mode === 'static' ? (
                  <label className={styles.field}>
                    <span>静态 JSON</span>
                    <JsonEditor
                      value={value.data.staticValue}
                      placeholder='[]'
                      onChange={(staticValue) => patchData({ staticValue })}
                    />
                  </label>
                ) : (
                  <>
                    <Alert
                      type='info'
                      showIcon
                      message='接口由 Electron 主进程发出，不受页面跨域限制。认证信息会随工具配置保存在本机。'
                    />
                    <ApiRequestWorkbench
                      compact
                      value={value.data.request}
                      execute={executeConfiguredApiRequest}
                      onChange={(request) => patchData({ request })}
                    />
                    <Divider />
                    <label className={styles.field}>
                      <span>响应取值路径</span>
                      <Input.TextArea
                        className={styles.resizableTextarea}
                        rows={2}
                        value={value.data.responsePath}
                        placeholder='例如 data.items；留空使用完整响应'
                        onChange={(event) => patchData({ responsePath: event.target.value })}
                      />
                    </label>
                    <div className={styles.polling}>
                      <div>
                        <Typography.Text>轮询请求</Typography.Text>
                        <div className={styles.help}>默认只请求一次；开启后按间隔自动刷新。</div>
                      </div>
                      <Switch
                        checked={value.data.polling.enabled}
                        onChange={(enabled) =>
                          patchData({ polling: { ...value.data.polling, enabled } })
                        }
                      />
                    </div>
                    {value.data.polling.enabled ? (
                      <label className={styles.field}>
                        <span>轮询间隔</span>
                        <InputNumber
                          min={1}
                          max={86_400}
                          value={Math.round(value.data.polling.intervalMs / 1000)}
                          addonAfter='秒'
                          onChange={(seconds) =>
                            patchData({
                              polling: {
                                ...value.data.polling,
                                intervalMs: Math.max(1, seconds ?? 30) * 1000,
                              },
                            })
                          }
                        />
                      </label>
                    ) : null}
                  </>
                )}
              </div>
            ),
          },
          {
            key: 'props',
            label: '组件配置',
            children: (
              <div className={styles.content}>
                <Typography.Paragraph type='secondary'>
                  表格用于直观修改组件内容；需要增加属性或批量编辑时，可切换到 JSON。
                </Typography.Paragraph>
                <Tabs
                  className={styles.propertyTabs}
                  items={[
                    {
                      key: 'table',
                      label: '表格',
                      children: propertyRows.length ? (
                        <Table
                          size='small'
                          pagination={false}
                          rowKey='key'
                          dataSource={propertyRows}
                          columns={[
                            {
                              title: '配置项',
                              dataIndex: 'key',
                              width: 132,
                              render: (key: string) => (
                                <div>
                                  <div className={styles.friendlyName}>{friendlyPropName(key)}</div>
                                  <code className={styles.propertyKey}>{key}</code>
                                </div>
                              ),
                            },
                            {
                              title: '当前值',
                              dataIndex: 'propertyValue',
                              render: (
                                propertyValue: unknown,
                                row: { key: string; options: TSelectValue[] },
                              ) => (
                                <PropertyValueEditor
                                  value={propertyValue}
                                  options={row.options}
                                  onChange={(nextValue) =>
                                    onChange({
                                      ...value,
                                      props: { ...value.props, [row.key]: nextValue },
                                    })
                                  }
                                />
                              ),
                            },
                            {
                              title: '',
                              width: 58,
                              render: (_: unknown, row: { key: string }) =>
                                row.key in value.props ? (
                                  <Button
                                    type='link'
                                    size='small'
                                    onClick={() => {
                                      const props = { ...value.props };
                                      delete props[row.key];
                                      onChange({ ...value, props });
                                    }}>
                                    恢复
                                  </Button>
                                ) : null,
                            },
                          ]}
                        />
                      ) : (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description='该组件暂无可配置属性'
                        />
                      ),
                    },
                    {
                      key: 'json',
                      label: 'JSON',
                      children: (
                        <JsonEditor
                          objectOnly
                          value={effectiveProps}
                          placeholder='{\n  "variant": "card"\n}'
                          onChange={(props) =>
                            onChange({ ...value, props: props as Record<string, unknown> })
                          }
                        />
                      ),
                    },
                  ]}
                />
              </div>
            ),
          },
        ]}
      />
    </aside>
  );
}
