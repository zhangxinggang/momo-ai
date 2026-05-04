/** 主题色预设（莫兰迪色系 + 经典宝蓝） */
export const MORANDI_THEMES = [
  { id: 'royal-blue', hue: 220, saturation: 70, name: 'Royal Blue' },
  { id: 'blue', hue: 210, saturation: 35, name: 'Misty Blue' },
  { id: 'purple', hue: 260, saturation: 30, name: 'Smoky Purple' },
  { id: 'green', hue: 150, saturation: 30, name: 'Bean Green' },
  { id: 'orange', hue: 25, saturation: 40, name: 'Apricot Orange' },
  { id: 'teal', hue: 175, saturation: 30, name: 'Teal Blue' },
];

export const FONT_SIZES = [
  { id: 'small', value: 14, name: 'Small' },
  { id: 'medium', value: 16, name: 'Medium' },
  { id: 'large', value: 18, name: 'Large' },
];

const DEFAULT_BACKGROUND_IMAGE_OPACITY = 1;
const DEFAULT_BACKGROUND_IMAGE_BLUR = 0;

const clamp = (n: number, min: number, max: number): number => Math.max(min, Math.min(max, n));

function clampBackgroundImageBlur(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_BACKGROUND_IMAGE_BLUR;
  }
  return Number(clamp(Number(value), 0, 50).toFixed(1));
}

/** 将背景图不透明度限制在 0–1 */
export function getRenderedBackgroundImageOpacity(value: number): number {
  return clamp(value, 0, 1);
}

/** 将背景图模糊像素限制在 0–50 */
export function getRenderedBackgroundImageBlur(value: number): number {
  return clampBackgroundImageBlur(value);
}
