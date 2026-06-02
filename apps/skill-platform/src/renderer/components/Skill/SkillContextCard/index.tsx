import type { ISkill } from '@/types/modules';

import { SkillIcon } from '../SkillIcon';
import styles from './index.module.less';

interface IProps {
  skill: ISkill;
}

/** 技能 AI 对话顶部的当前技能上下文卡片（只读） */
export function SkillContextCard({ skill }: IProps) {
  const description = skill.description?.trim() || '技能描述，帮助 AI 理解何时使用此技能';

  return (
    <div className={styles['skill-context-card']}>
      <SkillIcon
        iconUrl={skill.icon_url}
        iconEmoji={skill.icon_emoji}
        backgroundColor={skill.icon_background}
        name={skill.name}
        size='md'
      />
      <div className={styles['skill-context-card-body']}>
        <p className={styles['skill-context-card-label']}>{`当前：${skill.name}`}</p>
        <h4 className={styles['skill-context-card-name']}>{skill.name}</h4>
        <p className={styles['skill-context-card-desc']}>{description}</p>
        {skill.tags && skill.tags.length > 0 ? (
          <div className={styles['skill-context-card-tags']}>
            {skill.tags.slice(0, 6).map((tag) => (
              <span key={tag} className={styles['skill-context-card-tag']}>
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
