const MS_PER_HOUR = 3600 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const MS_PER_MONTH = 30 * MS_PER_DAY;
const MS_PER_YEAR = 365 * MS_PER_DAY;

/**
 * 紧凑相对时间：取最大整单位
 * 例：2h30m → 2h；不足 1h 显示 1h
 */
export function formatRelativeCompact(timestamp: number, now: number = Date.now()): string {
  const diff = Math.max(0, now - timestamp);
  if (diff >= MS_PER_YEAR) {
    return `${Math.floor(diff / MS_PER_YEAR)}ye`;
  }
  if (diff >= MS_PER_MONTH) {
    return `${Math.floor(diff / MS_PER_MONTH)}mo`;
  }
  if (diff >= MS_PER_DAY) {
    return `${Math.floor(diff / MS_PER_DAY)}d`;
  }
  return `${Math.max(1, Math.floor(diff / MS_PER_HOUR))}h`;
}
