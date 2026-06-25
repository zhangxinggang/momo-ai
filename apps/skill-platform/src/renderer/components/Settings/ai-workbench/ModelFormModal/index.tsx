import { useState, type Dispatch, type SetStateAction } from 'react';

import type { IModelInfo } from '@renderer/services/ai';
import type { IModelFormState } from '@renderer/types/ai-workbench';
import { Button, Modal } from 'antd';
import { Loader2Icon, PlayIcon } from 'lucide-react';
import { AvailableModelsList } from '../ModelForm/AvailableModelsList';
import { BaseFields } from '../ModelForm/BaseFields';
import { ChatParamsSection } from '../ModelForm/ChatParamsSection';

export function ModelFormModal({
  editingModelId,
  modelForm,
  setModelForm,
  availableModels,
  fetchingModels,
  testingModelId,
  savingModel,
  onClose,
  onFetchModels,
  onTestDraft,
  onSave,
  onBatchAdd,
}: {
  editingModelId: string | null;
  modelForm: IModelFormState;
  setModelForm: Dispatch<SetStateAction<IModelFormState>>;
  availableModels: IModelInfo[];
  fetchingModels: boolean;
  testingModelId: string | null;
  savingModel: boolean;
  onClose: () => void;
  onFetchModels: () => void;
  onTestDraft: () => void;
  onSave: () => void;
  onBatchAdd?: (ids: string[]) => void;
}) {
  const draftTestingKey = editingModelId || '__draft__';
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);

  const isMultiSelect = selectedModelIds.length > 1;

  const handleSaveOrBatch = () => {
    if (isMultiSelect && onBatchAdd) {
      onBatchAdd(selectedModelIds);
    } else {
      onSave();
    }
  };

  return (
    <Modal
      open
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnHidden
      title={
        <div>
          <div>{editingModelId ? '编辑模型' : '添加模型'}</div>
          <div className='text-muted-foreground mt-1 text-xs font-normal'>
            {'保存后会立即写入设置，并参与默认模型选择。'}
          </div>
        </div>
      }>
      <div className='space-y-4'>
        <BaseFields
          modelForm={modelForm}
          setModelForm={setModelForm}
          fetchingModels={fetchingModels}
          onFetchModels={onFetchModels}
          isEditing={Boolean(editingModelId)}
        />

        {!editingModelId ? (
          <AvailableModelsList
            availableModels={availableModels}
            modelForm={modelForm}
            setModelForm={setModelForm}
            selectedIds={selectedModelIds}
            onSelectionChange={setSelectedModelIds}
          />
        ) : null}

        {modelForm.type === 'chat' ? (
          <ChatParamsSection modelForm={modelForm} setModelForm={setModelForm} />
        ) : null}

        <div className='border-border flex items-center justify-between border-t pt-4'>
          <Button
            onClick={onTestDraft}
            disabled={testingModelId === draftTestingKey}
            className='border-border bg-background inline-flex h-9 items-center gap-2 rounded-lg border px-4 text-sm'>
            {testingModelId === draftTestingKey ? (
              <Loader2Icon className='h-4 w-4 animate-spin' />
            ) : (
              <PlayIcon className='h-4 w-4' />
            )}
            {'测试当前配置'}
          </Button>
          <div className='flex items-center gap-2'>
            <Button
              onClick={onClose}
              className='border-border inline-flex h-9 items-center rounded-lg border px-4 text-sm'>
              {'取消'}
            </Button>
            <Button
              type='primary'
              onClick={handleSaveOrBatch}
              disabled={savingModel}
              className='bg-primary text-primary-foreground inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium'>
              {isMultiSelect
                ? `添加 ${selectedModelIds.length} 个模型`
                : editingModelId
                  ? '保存修改'
                  : '添加模型'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
