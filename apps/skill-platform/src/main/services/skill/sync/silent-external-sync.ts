import type { SkillDB } from '../../../database';
import { SkillInstaller } from '../installer';

/** 定时静默同步外部技能的间隔（毫秒） */
const SILENT_EXTERNAL_SKILL_IMPORT_INTERVAL_MS = 30 * 60 * 1000;

/**
 * 启动时立即执行一次，并周期性从外部工具目录静默导入新技能。
 * 已存在的技能由 scanLocal 内部跳过。
 */
export function startSilentExternalSkillImportSchedule(skillDb: SkillDB): () => void {
  const tick = async () => {
    try {
      await SkillInstaller.init();
      const result = await SkillInstaller.scanLocal(skillDb);
      if (result.imported > 0) {
        console.log(
          `[skills] silent external import: +${result.imported} (skipped: ${result.skipped.length})`,
        );
      }
    } catch (err) {
      console.warn('[skills] silent external import failed:', err);
    }
  };

  void tick();
  const timer = setInterval(() => {
    void tick();
  }, SILENT_EXTERNAL_SKILL_IMPORT_INTERVAL_MS);

  return () => {
    clearInterval(timer);
  };
}
