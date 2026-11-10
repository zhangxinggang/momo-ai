import type { ToolPageActions } from '@/shared/tool-page';
import { Input, Select } from 'antd';

export function ActionsPanel({
  actions,
  onChange,
}: {
  actions: ToolPageActions;
  onChange: (value: ToolPageActions) => void;
}) {
  return (
    <section style={{ padding: 24, maxWidth: 840, overflow: 'auto' }} aria-label='执行设置'>
      <h3>页面操作</h3>
      <p>页面负责展示。这里设置每个操作要完成的任务，保存后生效。</p>
      {!Object.keys(actions).length && <p>此页面尚未配置执行操作，可在下方描述需要的功能。</p>}
      {Object.entries(actions).map(([id, action]) => (
        <fieldset
          key={id}
          style={{ border: '1px solid #dfe6ef', borderRadius: 8, padding: 20, marginBlock: 20 }}>
          <legend>{action.title}</legend>
          <label>
            操作名称
            <Input
              value={action.title}
              onChange={(event) =>
                onChange({ ...actions, [id]: { ...action, title: event.target.value } })
              }
            />
          </label>
          <label>
            处理要求
            <Input.TextArea
              autoSize={{ minRows: 4, maxRows: 16 }}
              value={action.instruction}
              onChange={(event) =>
                onChange({ ...actions, [id]: { ...action, instruction: event.target.value } })
              }
            />
          </label>
          <label>
            使用技能
            <Input
              value={action.skill || ''}
              placeholder='不使用技能时留空'
              onChange={(event) =>
                onChange({
                  ...actions,
                  [id]: { ...action, skill: event.target.value || undefined },
                })
              }
            />
          </label>
          <label>
            结果展示
            <Select
              style={{ display: 'block', marginTop: 6 }}
              value={action.result}
              options={[
                { value: 'report', label: '章节报告（支持完整 Word 导出）' },
                { value: 'json', label: '由页面展示业务数据' },
              ]}
              onChange={(result) => onChange({ ...actions, [id]: { ...action, result } })}
            />
          </label>
        </fieldset>
      ))}
    </section>
  );
}
