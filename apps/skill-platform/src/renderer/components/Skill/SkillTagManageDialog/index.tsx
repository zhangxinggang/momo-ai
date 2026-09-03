import type { ISkill } from '@/types/modules';
import { useToast } from '@renderer/components/ui/Toast';
import {
  collectAllSkillTags,
  normalizeSkillTag,
  persistAssociateSkillTags,
} from '@renderer/services/skill/modal-utils';
import { useSkillStore } from '@renderer/store';
import { Modal, Transfer } from 'antd';
import { useCallback, useEffect, useMemo, useState, type Key } from 'react';

import { SkillTagSelect } from '../SkillTagSelect';
import styles from './index.module.less';
import type { IProps, ITransferSkillItem } from './types';

function getAssociatedSkillIds(skills: ISkill[], selectedTags: string[]) {
  if (selectedTags.length === 0) {
    return [];
  }
  const normalizedTags = selectedTags.map((tag) => normalizeSkillTag(tag)).filter(Boolean);
  return skills
    .filter((skill) => {
      const skillTagSet = new Set((skill.tags || []).map((tag) => normalizeSkillTag(tag)));
      return normalizedTags.every((tag) => skillTagSet.has(tag));
    })
    .map((skill) => skill.id);
}

function filterTransferItem(input: string, item: ITransferSkillItem) {
  const query = input.trim().toLowerCase();
  if (!query) {
    return true;
  }
  return `${item.title} ${item.description}`.toLowerCase().includes(query);
}

export function SkillTagManageDialog({ open, onClose }: IProps) {
  const { showToast } = useToast();
  const skills = useSkillStore((state) => state.skills);
  const updateSkill = useSkillStore((state) => state.updateSkill);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tagOptions = useMemo(() => collectAllSkillTags(skills), [skills]);
  const dataSource = useMemo<ITransferSkillItem[]>(
    () =>
      skills.map((skill) => ({
        description: skill.description || '',
        key: skill.id,
        title: skill.name,
      })),
    [skills],
  );

  const selectedTagsKey = selectedTags.join('\0');

  useEffect(() => {
    if (!open) {
      setSelectedTags([]);
      setTargetKeys([]);
      setIsSubmitting(false);
      return;
    }
    setTargetKeys(getAssociatedSkillIds(skills, selectedTags));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 仅在打开弹窗或所选标签变化时重算右侧技能
  }, [open, selectedTagsKey]);

  const handleTagChange = useCallback((tags: string[]) => {
    setSelectedTags(tags);
  }, []);

  const handleTransferChange = useCallback((nextTargetKeys: Key[]) => {
    setTargetKeys(nextTargetKeys.map(String));
  }, []);

  const handleConfirm = useCallback(async () => {
    if (selectedTags.length === 0) {
      showToast('请先选择或新建标签', 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      const updatedCount = await persistAssociateSkillTags(
        selectedTags,
        targetKeys,
        skills,
        updateSkill,
      );
      showToast(
        updatedCount > 0
          ? `已将标签关联到 ${targetKeys.length} 个技能，更新 ${updatedCount} 项`
          : '标签关联未发生变化',
      );
      onClose();
    } catch (error) {
      showToast(error instanceof Error ? error.message : '标签关联失败', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [onClose, selectedTags, showToast, skills, targetKeys, updateSkill]);

  return (
    <Modal
      confirmLoading={isSubmitting}
      destroyOnHidden
      okButtonProps={{ disabled: selectedTags.length === 0 }}
      okText='确认'
      open={open}
      title='标签管理'
      width={800}
      onCancel={onClose}
      onOk={handleConfirm}>
      <div className={styles['tag-manage']}>
        <SkillTagSelect
          className={styles['tag-manage-select']}
          options={tagOptions}
          placeholder='选择或新建要管理的标签'
          value={selectedTags}
          onChange={handleTagChange}
        />
        <div className={styles['tag-manage-hint']}>
          {'确认后，选中标签将关联到右侧技能，并从左侧技能中移除。'}
        </div>
        <Transfer<ITransferSkillItem>
          className={styles['tag-manage-transfer']}
          dataSource={dataSource}
          disabled={selectedTags.length === 0}
          filterOption={filterTransferItem}
          render={(item) => item.title}
          showSearch
          styles={{
            section: {
              flex: '1 1 0',
              height: 360,
              width: 'auto',
            },
          }}
          targetKeys={targetKeys}
          titles={['技能列表', '已选技能']}
          onChange={handleTransferChange}
        />
      </div>
    </Modal>
  );
}
