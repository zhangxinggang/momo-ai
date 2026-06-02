import { App, Form, Input, Modal } from 'antd';
import { useCallback, useEffect } from 'react';

export interface IWorkflowCreateBusinessValues {
  name: string;
  remark: string;
}

interface IProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (values: IWorkflowCreateBusinessValues) => Promise<void> | void;
}

/** 新建工作流业务实例弹窗 */
export function WorkflowCreateBusinessModal({ open, onCancel, onConfirm }: IProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm<IWorkflowCreateBusinessValues>();

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [form, open]);

  const handleOk = useCallback(async () => {
    try {
      const values = await form.validateFields();
      await onConfirm({
        name: values.name.trim(),
        remark: values.remark?.trim() ?? '',
      });
    } catch (e) {
      if (e && typeof e === 'object' && 'errorFields' in e) {
        return;
      }
      console.error(e);
      message.error('创建失败');
    }
  }, [form, message, onConfirm]);

  return (
    <Modal
      cancelText='取消'
      destroyOnClose
      okText='创建'
      onCancel={onCancel}
      onOk={() => void handleOk()}
      open={open}
      title='新建业务'>
      <Form form={form} layout='vertical' requiredMark={false}>
        <Form.Item label='名称' name='name' rules={[{ required: true, message: '请输入业务名称' }]}>
          <Input placeholder='请输入业务名称' />
        </Form.Item>
        <Form.Item label='备注' name='remark'>
          <Input.TextArea placeholder='可选备注' rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
