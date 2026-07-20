import { Button, Form, Input, Modal, Select, Space, Switch, Table, Tag } from 'antd';
import { PlusIcon, RefreshCwIcon, TrashIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  EMcpConnectionStatus,
  EMcpTransportType,
  type IMcpServerEntry,
  type IMcpServerRuntimeStatus,
  type IMcpServersFile,
} from '@/types/modules/mcp';
import { SettingSection } from '@renderer/components/Settings/SettingPrimitives';
import { useToast } from '@renderer/components/ui/Toast';
import {
  getMcpConfig,
  listMcpServers,
  reconnectMcp,
  setMcpConfig,
  setMcpServerDisabled,
} from '@renderer/services/mcp/api';

import styles from './index.module.less';

interface IServerFormValues {
  name: string;
  type: EMcpTransportType;
  command?: string;
  argsText?: string;
  envText?: string;
  cwd?: string;
  url?: string;
  headersText?: string;
  disabled?: boolean;
}

function parseArgsText(text?: string): string[] | undefined {
  if (!text?.trim()) {
    return undefined;
  }
  const trimmed = text.trim();
  if (trimmed.startsWith('[')) {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== 'string')) {
      throw new Error('args 必须是字符串数组 JSON');
    }
    return parsed as string[];
  }
  return trimmed
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseRecordText(text: string | undefined, fieldLabel: string): Record<string, string> | undefined {
  if (!text?.trim()) {
    return undefined;
  }
  const parsed = JSON.parse(text) as unknown;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`${fieldLabel} 必须是 JSON 对象`);
  }
  const record: Record<string, string> = {};
  for (const [key, value] of Object.entries(parsed)) {
    if (typeof value !== 'string') {
      throw new Error(`${fieldLabel} 的值必须是字符串`);
    }
    record[key] = value;
  }
  return record;
}

function statusColor(status: EMcpConnectionStatus): string {
  switch (status) {
    case EMcpConnectionStatus.EConnected:
      return 'success';
    case EMcpConnectionStatus.EError:
      return 'error';
    case EMcpConnectionStatus.EDisabled:
      return 'default';
    case EMcpConnectionStatus.EConnecting:
      return 'processing';
    default:
      return 'warning';
  }
}

function statusLabel(status: EMcpConnectionStatus): string {
  switch (status) {
    case EMcpConnectionStatus.EConnected:
      return '已连接';
    case EMcpConnectionStatus.EError:
      return '错误';
    case EMcpConnectionStatus.EDisabled:
      return '已禁用';
    case EMcpConnectionStatus.EConnecting:
      return '连接中';
    default:
      return '空闲';
  }
}

export function McpSettingsPanel() {
  const { showToast } = useToast();
  const [servers, setServers] = useState<IMcpServerRuntimeStatus[]>([]);
  const [jsonText, setJsonText] = useState('{\n  "mcpServers": {}\n}\n');
  const [loading, setLoading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [form] = Form.useForm<IServerFormValues>();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [serverList, config] = await Promise.all([listMcpServers(), getMcpConfig()]);
      setServers(serverList);
      setJsonText(`${JSON.stringify(config, null, 2)}\n`);
    } catch (error) {
      showToast(String(error), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveConfigFile = async (file: IMcpServersFile) => {
    const result = await setMcpConfig(file);
    if (result.errors.length > 0) {
      showToast(
        `部分 Server 无效：${result.errors.map((item) => `${item.name}: ${item.message}`).join('；')}`,
        'error',
      );
    } else {
      showToast('MCP 配置已保存', 'success');
    }
    await refresh();
  };

  const openCreate = () => {
    setEditingName(null);
    form.setFieldsValue({
      name: '',
      type: EMcpTransportType.EStdio,
      command: '',
      argsText: '',
      envText: '',
      cwd: '',
      url: '',
      headersText: '',
      disabled: false,
    });
    setEditorOpen(true);
  };

  const openEdit = (row: IMcpServerRuntimeStatus) => {
    setEditingName(row.name);
    form.setFieldsValue({
      name: row.name,
      type: row.transport,
      command: row.entry.command ?? '',
      argsText: row.entry.args ? JSON.stringify(row.entry.args) : '',
      envText: row.entry.env ? JSON.stringify(row.entry.env, null, 2) : '',
      cwd: row.entry.cwd ?? '',
      url: row.entry.url ?? '',
      headersText: row.entry.headers ? JSON.stringify(row.entry.headers, null, 2) : '',
      disabled: Boolean(row.entry.disabled),
    });
    setEditorOpen(true);
  };

  const handleSubmitServer = async () => {
    try {
      const values = await form.validateFields();
      const name = values.name.trim();
      if (!name) {
        throw new Error('名称不能为空');
      }

      const entry: IMcpServerEntry = {
        type: values.type,
        disabled: Boolean(values.disabled),
      };

      if (values.type === EMcpTransportType.EStdio) {
        entry.command = values.command?.trim();
        entry.args = parseArgsText(values.argsText);
        entry.env = parseRecordText(values.envText, 'env');
        entry.cwd = values.cwd?.trim() || undefined;
      } else {
        entry.url = values.url?.trim();
        entry.headers = parseRecordText(values.headersText, 'headers');
      }

      const config = await getMcpConfig();
      const nextServers = { ...config.mcpServers };
      if (editingName && editingName !== name) {
        delete nextServers[editingName];
      }
      nextServers[name] = entry;
      await saveConfigFile({ mcpServers: nextServers });
      setEditorOpen(false);
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        return;
      }
      showToast(String(error), 'error');
    }
  };

  const handleDelete = async (name: string) => {
    const config = await getMcpConfig();
    const nextServers = { ...config.mcpServers };
    delete nextServers[name];
    await saveConfigFile({ mcpServers: nextServers });
  };

  const handleSaveJson = async () => {
    try {
      const parsed = JSON.parse(jsonText) as IMcpServersFile;
      if (!parsed?.mcpServers || typeof parsed.mcpServers !== 'object') {
        throw new Error('缺少 mcpServers 对象');
      }
      await saveConfigFile(parsed);
    } catch (error) {
      showToast(String(error), 'error');
    }
  };

  const transportOptions = useMemo(
    () => [
      { label: 'stdio', value: EMcpTransportType.EStdio },
      { label: 'sse', value: EMcpTransportType.ESse },
      { label: 'http', value: EMcpTransportType.EHttp },
    ],
    [],
  );

  const selectedType = Form.useWatch('type', form);

  return (
    <div className={styles['mcp-settings']}>
      <SettingSection title={'MCP Servers'}>
        <div className={styles['mcp-settings-toolbar']}>
          <Space>
            <Button
              type='primary'
              icon={<PlusIcon className='h-3.5 w-3.5' />}
              onClick={openCreate}>
              {'新增'}
            </Button>
            <Button
              icon={<RefreshCwIcon className='h-3.5 w-3.5' />}
              loading={loading}
              onClick={() => void refresh()}>
              {'刷新'}
            </Button>
          </Space>
        </div>
        <Table
          rowKey='name'
          size='small'
          loading={loading}
          pagination={false}
          dataSource={servers}
          columns={[
            { title: '名称', dataIndex: 'name', key: 'name' },
            { title: '类型', dataIndex: 'transport', key: 'transport', width: 90 },
            {
              title: '状态',
              dataIndex: 'status',
              key: 'status',
              width: 110,
              render: (status: EMcpConnectionStatus) => (
                <Tag color={statusColor(status)}>{statusLabel(status)}</Tag>
              ),
            },
            { title: '工具数', dataIndex: 'toolCount', key: 'toolCount', width: 80 },
            {
              title: '错误',
              dataIndex: 'errorMessage',
              key: 'errorMessage',
              ellipsis: true,
              render: (message?: string) => message || '-',
            },
            {
              title: '启用',
              key: 'enabled',
              width: 80,
              render: (_: unknown, row: IMcpServerRuntimeStatus) => (
                <Switch
                  checked={!row.entry.disabled}
                  onChange={(checked) => {
                    void setMcpServerDisabled(row.name, !checked)
                      .then(() => refresh())
                      .catch((error) => showToast(String(error), 'error'));
                  }}
                />
              ),
            },
            {
              title: '操作',
              key: 'actions',
              width: 220,
              render: (_: unknown, row: IMcpServerRuntimeStatus) => (
                <Space size='small'>
                  <Button type='link' size='small' onClick={() => openEdit(row)}>
                    {'编辑'}
                  </Button>
                  <Button
                    type='link'
                    size='small'
                    onClick={() => {
                      void reconnectMcp(row.name)
                        .then(() => refresh())
                        .catch((error) => showToast(String(error), 'error'));
                    }}>
                    {'重连'}
                  </Button>
                  <Button
                    type='link'
                    size='small'
                    danger
                    icon={<TrashIcon className='h-3.5 w-3.5' />}
                    onClick={() => {
                      void handleDelete(row.name).catch((error) => showToast(String(error), 'error'));
                    }}>
                    {'删除'}
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      </SettingSection>

      <SettingSection title={'原始 JSON（mcp.json）'}>
        <div className={styles['mcp-settings-json']}>
          <Input.TextArea
            value={jsonText}
            onChange={(event) => setJsonText(event.target.value)}
            autoSize={{ minRows: 12, maxRows: 24 }}
            className={styles['mcp-settings-json-input']}
          />
          <div className={styles['mcp-settings-json-actions']}>
            <Button type='primary' onClick={() => void handleSaveJson()}>
              {'保存 JSON'}
            </Button>
          </div>
        </div>
      </SettingSection>

      <Modal
        title={editingName ? '编辑 MCP Server' : '新增 MCP Server'}
        open={editorOpen}
        onCancel={() => setEditorOpen(false)}
        onOk={() => void handleSubmitServer()}
        destroyOnHidden
        width={640}>
        <Form
          form={form}
          layout='vertical'
          initialValues={{ type: EMcpTransportType.EStdio, disabled: false }}>
          <Form.Item
            label={'名称'}
            name='name'
            rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder={'例如 filesystem'} disabled={Boolean(editingName)} />
          </Form.Item>
          <Form.Item label={'类型'} name='type' rules={[{ required: true }]}>
            <Select options={transportOptions} />
          </Form.Item>
          {selectedType === EMcpTransportType.EStdio ? (
            <>
              <Form.Item
                label={'command'}
                name='command'
                rules={[{ required: true, message: '请输入 command' }]}>
                <Input placeholder={'npx / node / python'} />
              </Form.Item>
              <Form.Item label={'args'} name='argsText'>
                <Input.TextArea placeholder={'JSON 数组或逗号分隔，如 ["-y","pkg"]'} />
              </Form.Item>
              <Form.Item label={'env'} name='envText'>
                <Input.TextArea placeholder={'JSON 对象，如 {"KEY":"value"}'} />
              </Form.Item>
              <Form.Item label={'cwd'} name='cwd'>
                <Input placeholder={'可选工作目录'} />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item
                label={'url'}
                name='url'
                rules={[{ required: true, message: '请输入 url' }]}>
                <Input placeholder={'https://example.com/mcp'} />
              </Form.Item>
              <Form.Item label={'headers'} name='headersText'>
                <Input.TextArea placeholder={'JSON 对象，如 {"Authorization":"Bearer xxx"}'} />
              </Form.Item>
            </>
          )}
          <Form.Item label={'禁用'} name='disabled' valuePropName='checked'>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
