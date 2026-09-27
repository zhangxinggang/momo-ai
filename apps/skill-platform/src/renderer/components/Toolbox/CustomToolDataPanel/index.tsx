import type { ICustomToolComponentConfig } from '@/types/modules';
import { ApiRequestWorkbench } from '@momo/api-request';
import { executeConfiguredApiRequest } from '@renderer/services/custom-tool/api';
import { Alert, Button, Divider, Input, InputNumber, Radio, Switch, Tabs, Typography } from 'antd';
import { XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import styles from './index.module.less';

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
}: {
  value: unknown;
  onChange: (value: unknown) => void;
  objectOnly?: boolean;
  placeholder: string;
}) {
  const serialized = JSON.stringify(value, null, 2) ?? '';
  const [draft, setDraft] = useState(serialized);
  const [error, setError] = useState('');
  useEffect(() => setDraft(serialized), [serialized]);
  return (
    <div className={styles.jsonEditor}>
      <Input.TextArea
        value={draft}
        autoSize={{ minRows: 7, maxRows: 18 }}
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

export function CustomToolDataPanel({ componentId, value, onChange, onClose }: IProps) {
  const patchData = (patch: Partial<ICustomToolComponentConfig['data']>) =>
    onChange({ ...value, data: { ...value.data, ...patch } });

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
                  <Input
                    value={value.data.targetProp}
                    placeholder='例如 data、items、rows 或 content'
                    onChange={(event) => patchData({ targetProp: event.target.value })}
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
                      <Input
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
                  这里覆盖 OpenUI 生成的组件属性。删除某个键即可恢复生成内容中的默认值。
                </Typography.Paragraph>
                <JsonEditor
                  objectOnly
                  value={value.props}
                  placeholder='{\n  "variant": "card"\n}'
                  onChange={(props) =>
                    onChange({ ...value, props: props as Record<string, unknown> })
                  }
                />
              </div>
            ),
          },
        ]}
      />
    </aside>
  );
}
