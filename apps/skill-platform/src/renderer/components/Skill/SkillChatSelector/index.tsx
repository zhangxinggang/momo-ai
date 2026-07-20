import type { ISkill } from '@/types/modules';
import { ChatFeatureDropdown } from '@momo/aichat';
import { buildSkillChatTree } from '@renderer/services/skill/chat-skill-tree';
import { useEffect, useMemo, useState } from 'react';

import styles from './index.module.less';
import type { IProps } from './types';

function buildSkillDetail(skill: ISkill): string {
  const lines = [skill.name];
  const description = skill.description?.trim();
  if (description) {
    lines.push(description);
  }
  const tags = (skill.tags ?? []).map((tag) => tag.trim()).filter(Boolean);
  if (tags.length > 0) {
    lines.push(`标签：${tags.join('、')}`);
  }
  return lines.join('\n');
}

function matchesQuery(skill: ISkill, query: string): boolean {
  if (!query) {
    return true;
  }
  const haystack = [skill.name, skill.description ?? '', ...(skill.tags ?? [])]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

/** 对话输入栏技能选择：样式与 RAG / 工作区一致的单一下拉 */
export function SkillChatSelector({ skills, selectedSkillId, onSelect }: IProps) {
  const [query, setQuery] = useState('');
  const [isEnabled, setIsEnabled] = useState(Boolean(selectedSkillId));

  useEffect(() => {
    if (selectedSkillId) {
      setIsEnabled(true);
    }
  }, [selectedSkillId]);

  const selectedSkill = useMemo(
    () => (selectedSkillId ? skills.find((skill) => skill.id === selectedSkillId) : undefined),
    [selectedSkillId, skills],
  );

  const groups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = normalizedQuery
      ? skills.filter((skill) => matchesQuery(skill, normalizedQuery))
      : skills;
    return buildSkillChatTree(filtered);
  }, [query, skills]);

  const handleEnabledChange = (enabled: boolean) => {
    setIsEnabled(enabled);
    if (!enabled) {
      onSelect(null);
      setQuery('');
    }
  };

  const handleSelect = (skillId: string) => {
    setIsEnabled(true);
    onSelect(skillId);
  };

  return (
    <ChatFeatureDropdown
      label='技能'
      enabled={isEnabled}
      onEnabledChange={handleEnabledChange}
      enableTitle='是否启用'
      enableHint={
        selectedSkill
          ? `当前：${selectedSkill.name}`
          : '启用后选择技能，将按该技能指令执行对话'
      }>
      <div className={styles['skill-picker']}>
        <input
          type='search'
          value={query}
          placeholder='筛选技能'
          className={styles['skill-picker-search']}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className={styles['skill-picker-body']}>
          {groups.length === 0 ? (
            <p className={styles['skill-picker-empty']}>
              {skills.length === 0 ? '暂无技能，请先到「我的 Skills」添加' : '没有匹配的技能'}
            </p>
          ) : (
            groups.map((group) => (
              <section
                key={group.key}
                className={styles['skill-picker-group']}
                aria-label={group.title}>
                <h4 className={styles['skill-picker-group-title']}>{group.title}</h4>
                <ul className={styles['skill-picker-list']}>
                  {group.skills.map((skill) => {
                    const isActive = skill.id === selectedSkillId;
                    return (
                      <li key={skill.id}>
                        <button
                          type='button'
                          className={
                            isActive
                              ? `${styles['skill-picker-item']} ${styles['skill-picker-item--active']}`
                              : styles['skill-picker-item']
                          }
                          title={buildSkillDetail(skill)}
                          onClick={() => handleSelect(skill.id)}>
                          <span className={styles['skill-picker-item-name']}>{skill.name}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          )}
        </div>
      </div>
    </ChatFeatureDropdown>
  );
}
