import type { EAIProtocol, ISkillProject } from '@/types/modules';
import {
  setAutoLaunch,
  setCloseAction,
  setDebugMode,
  setMinimizeToTray,
} from '@renderer/services/desktop';
import { syncSettingsToMain } from '@renderer/services/settings/api';
import type {
  EAIUsageScenario,
  ECreationMode,
  EThemeMode,
  ETranslationMode,
  IAIModelConfig,
  IScenarioModelDefaults,
} from '@renderer/types/settings';
import { resolveLocalImageSrc } from '@renderer/utils/media/url';
import { FONT_SIZES, MORANDI_THEMES } from '@renderer/utils/settings/appearance';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type {
  EAIModelType,
  EAIUsageScenario,
  ECreationMode,
  EThemeMode,
  ETranslationMode,
  IAIModelConfig,
  IChatModelParams,
  IImageModelParams,
  IScenarioModelDefaults,
} from '@renderer/types/settings';

export {
  FONT_SIZES,
  getRenderedBackgroundImageBlur,
  getRenderedBackgroundImageOpacity,
  MORANDI_THEMES,
} from '@renderer/utils/settings/appearance';

const DEFAULT_TAGS_SECTION_HEIGHT = 140;
const DEFAULT_BACKGROUND_IMAGE_OPACITY = 1;
const DEFAULT_BACKGROUND_IMAGE_BLUR = 0;
const LEGACY_BACKGROUND_IMAGE_BLUR_DEFAULT = 14;
const LOCAL_IMAGE_PROTOCOL_PREFIX = 'local-image://';
const createProjectRecordId = (): string =>
  `project_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
const normalizeProjectRecordPath = (value: string): string => value.trim();

function inferAIProtocol(provider: string | undefined, apiUrl: string | undefined): EAIProtocol {
  const providerLower = (provider || '').trim().toLowerCase();
  const normalizedUrl = (apiUrl || '').trim().toLowerCase();

  if (providerLower === 'anthropic' || normalizedUrl.includes('api.anthropic.com')) {
    return 'anthropic';
  }

  if (
    providerLower === 'google' ||
    providerLower === 'gemini' ||
    normalizedUrl.includes('generativelanguage.googleapis.com')
  ) {
    return 'gemini';
  }

  if (
    providerLower === 'kimi' ||
    providerLower === 'moonshot' ||
    normalizedUrl.includes('moonshot.cn') ||
    normalizedUrl.includes('api.kimi.com')
  ) {
    return 'openai';
  }

  return 'openai';
}

function normalizeAIProtocol(value: unknown, provider?: string, apiUrl?: string): EAIProtocol {
  if (value === 'openai' || value === 'gemini' || value === 'anthropic') {
    return value;
  }
  return inferAIProtocol(provider, apiUrl);
}

type Hs = { hue: number; saturation: number };

const clamp = (n: number, min: number, max: number): number => Math.max(min, Math.min(max, n));

function clampBackgroundImageOpacity(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_BACKGROUND_IMAGE_OPACITY;
  }
  return clamp(Number(value), 0, 1);
}

function clampBackgroundImageBlur(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_BACKGROUND_IMAGE_BLUR;
  }
  return Number(clamp(Number(value), 0, 50).toFixed(1));
}

function normalizeBackgroundImageFileName(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const fileName = trimmed.startsWith(LOCAL_IMAGE_PROTOCOL_PREFIX)
    ? trimmed.slice(LOCAL_IMAGE_PROTOCOL_PREFIX.length)
    : trimmed;

  if (
    !fileName ||
    /^(https?:|data:|blob:)/i.test(fileName) ||
    fileName.includes('..') ||
    /[\0/\\?#]/.test(fileName)
  ) {
    return undefined;
  }

  return fileName;
}

function normalizeBackgroundImageBlur(value: number, persistedVersion?: number): number {
  const normalized = clampBackgroundImageBlur(value);

  // Migrate older installs that are still using the old heavy default blur.
  if ((persistedVersion ?? 0) < 6 && normalized === LEGACY_BACKGROUND_IMAGE_BLUR_DEFAULT) {
    return DEFAULT_BACKGROUND_IMAGE_BLUR;
  }

  return normalized;
}

function applyBackgroundImageVars(options: {
  backgroundImageFileName?: string;
  backgroundImageOpacity?: number;
  backgroundImageBlur?: number;
}): void {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  const fileName = normalizeBackgroundImageFileName(options.backgroundImageFileName);
  const resolvedSrc = fileName ? resolveLocalImageSrc(fileName) : '';

  root.style.setProperty(
    '--app-background-image',
    resolvedSrc ? `url(\"${resolvedSrc.replace(/\"/g, '\\\"')}\")` : 'none',
  );
  root.style.setProperty(
    '--app-background-opacity',
    String(
      clampBackgroundImageOpacity(
        options.backgroundImageOpacity ?? DEFAULT_BACKGROUND_IMAGE_OPACITY,
      ),
    ),
  );
  root.style.setProperty(
    '--app-background-blur',
    `${clampBackgroundImageBlur(options.backgroundImageBlur ?? DEFAULT_BACKGROUND_IMAGE_BLUR)}px`,
  );
}

/**
 * Convert HEX color to HSL hue/saturation (lightness is defined by CSS variables)
 * 将 HEX 颜色转换为 HSL 的 hue/saturation（lightness 由 CSS 变量定义）
 * - Only used for theme colors:最终写入 --theme-hue / --theme-saturation
 * - 仅用于主题色：最终写入 --theme-hue / --theme-saturation
 */
const hexToHs = (hex: string): Hs => {
  const normalized = (hex || '').trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return {
    hue: clamp(h, 0, 360),
    saturation: clamp(Math.round(s * 100), 0, 100),
  };
};

interface ISettingsState {
  creationMode: ECreationMode;
  // Clipboard auto-import
  // 剪切板自动导入
  clipboardImportEnabled: boolean;

  // Display settings
  // 显示设置
  themeMode: EThemeMode;
  isDarkMode: boolean;
  themeColor: string;
  themeHue: number;
  themeSaturation: number;
  customThemeHex: string; // Custom theme color (HEX)
  // 自定义主题色（HEX）
  settingsUpdatedAt: string;
  fontSize: string;
  backgroundImageFileName?: string;
  backgroundImageOpacity: number;
  backgroundImageBlur: number;

  // General settings
  // 常规设置
  launchAtStartup: boolean;
  minimizeOnLaunch: boolean;
  debugMode: boolean;

  // 关闭行为设置 (Windows) / Close behavior settings (Windows)
  closeAction: 'ask' | 'minimize' | 'exit'; // ask=prompt every time, minimize=minimize to tray, exit=exit directly
  // ask=每次询问, minimize=最小化到托盘, exit=直接退出

  // Notification settings
  // 通知设置
  enableNotifications: boolean;
  showCopyNotification: boolean;
  showSaveNotification: boolean;

  // Data path
  // 数据路径
  dataPath: string;

  // Sidebar settings
  // 侧边栏设置
  tagsSectionHeight: number;
  isTagsSectionCollapsed: boolean;
  skillTagsSectionHeight: number;
  isSkillTagsSectionCollapsed: boolean;

  // AI model configuration (legacy single model compatibility)
  // SECURITY NOTE: aiApiKey is stored in localStorage (plaintext).
  aiProvider: string;
  aiApiProtocol: EAIProtocol;
  aiApiKey: string;
  aiApiUrl: string;
  aiModel: string;

  // Multi-model configuration (new version)
  // 多模型配置（新版）
  aiModels: IAIModelConfig[];
  scenarioModelDefaults: IScenarioModelDefaults;

  // Translation mode setting / 翻译模式设置
  translationMode: ETranslationMode; // immersive=沉浸式, full=全文翻译

  // 来源历史 / Source history for autocomplete
  sourceHistory: string[];

  // Custom skill scan paths / 自定义 ISkill 扫描路径
  customSkillScanPaths: string[];
  skillProjects: ISkillProject[];

  // Custom platform root paths / 自定义平台根目录
  customPlatformRootPaths: Record<string, string>;
  customSkillPlatformPaths: Record<string, string>;
  skillPlatformOrder: string[];

  // Skill install method / ISkill 安装方式
  skillInstallMethod: 'symlink' | 'copy';
  autoScanInstalledSkills: boolean;
  autoScanStoreSkillsBeforeInstall: boolean;

  // Actions
  // 操作
  setThemeMode: (mode: EThemeMode) => void;
  setDarkMode: (isDark: boolean) => void;
  setThemeColor: (colorId: string) => void;
  setCustomThemeHex: (hex: string) => void;
  setClipboardImportEnabled: (enabled: boolean) => void;
  setFontSize: (size: string) => void;
  applyBackgroundImageSelection: (fileName: string) => void;
  setBackgroundImageFileName: (fileName?: string) => void;
  setBackgroundImageOpacity: (opacity: number) => void;
  setBackgroundImageBlur: (blur: number) => void;
  setLaunchAtStartup: (enabled: boolean) => void;
  setMinimizeOnLaunch: (enabled: boolean) => void;
  setDebugMode: (enabled: boolean) => void;
  setEnableNotifications: (enabled: boolean) => void;
  setCloseAction: (action: 'ask' | 'minimize' | 'exit') => void;
  setShowCopyNotification: (enabled: boolean) => void;
  setShowSaveNotification: (enabled: boolean) => void;
  setDataPath: (path: string) => void;
  setTagsSectionHeight: (height: number) => void;
  setIsTagsSectionCollapsed: (collapsed: boolean) => void;
  setSkillTagsSectionHeight: (height: number) => void;
  setIsSkillTagsSectionCollapsed: (collapsed: boolean) => void;
  setAiProvider: (provider: string) => void;
  setAiApiProtocol: (protocol: EAIProtocol) => void;
  setAiApiKey: (key: string) => void;
  setAiApiUrl: (url: string) => void;
  setAiModel: (model: string) => void;
  // 多模型管理
  addAiModel: (config: Omit<IAIModelConfig, 'id'>) => void;
  updateAiModel: (id: string, config: Partial<IAIModelConfig>) => void;
  deleteAiModel: (id: string) => void;
  setDefaultAiModel: (id: string) => void;
  setScenarioModelDefault: (scenario: EAIUsageScenario, modelId: string | null) => void;
  setCreationMode: (mode: ECreationMode) => void;
  setTranslationMode: (mode: ETranslationMode) => void;
  addSourceHistory: (source: string) => void;
  applyTheme: () => void;
  // Custom skill scan paths actions / 自定义 ISkill 扫描路径操作
  setCustomSkillScanPaths: (paths: string[]) => void;
  addCustomSkillScanPath: (path: string) => void;
  removeCustomSkillScanPath: (path: string) => void;
  addSkillProject: (input: {
    name: string;
    rootPath: string;
    scanPaths?: string[];
  }) => ISkillProject;
  updateSkillProject: (
    projectId: string,
    updates: Partial<Pick<ISkillProject, 'name' | 'rootPath' | 'scanPaths' | 'lastScannedAt'>>,
  ) => void;
  removeSkillProject: (projectId: string) => void;
  setCustomPlatformRootPath: (platformId: string, path: string) => void;
  resetCustomPlatformRootPath: (platformId: string) => void;
  setCustomSkillPlatformPath: (platformId: string, path: string) => void;
  resetCustomSkillPlatformPath: (platformId: string) => void;
  setSkillPlatformOrder: (order: string[]) => void;
  moveSkillPlatformOrder: (platformId: string, direction: 'up' | 'down') => void;
  resetSkillPlatformOrder: () => void;
  // Skill install method action / ISkill 安装方式操作
  setSkillInstallMethod: (method: 'symlink' | 'copy') => void;
  setAutoScanInstalledSkills: (enabled: boolean) => void;
  setAutoScanStoreSkillsBeforeInstall: (enabled: boolean) => void;
}

export const useSettingsStore = create<ISettingsState>()(
  persist(
    (set, get) => {
      const touch = (): string => new Date().toISOString();
      const setTouched = (partial: Partial<ISettingsState>) =>
        set({ ...partial, settingsUpdatedAt: touch() } as ISettingsState);
      const normalizeProjectScanPaths = (
        scanPaths: string[] | undefined,
        rootPath: string,
      ): string[] => {
        const normalized = Array.from(
          new Set(
            (scanPaths ?? [rootPath])
              .map((entry) => normalizeProjectRecordPath(entry))
              .filter((entry) => entry.length > 0),
          ),
        );

        return normalized.length > 0 ? normalized : [rootPath];
      };

      return {
        // Default values
        // 默认值
        clipboardImportEnabled: false,
        themeMode: 'system' as EThemeMode,
        isDarkMode: true,
        themeColor: 'royal-blue',
        themeHue: 220,
        themeSaturation: 70,
        customThemeHex: '#3b82f6',
        settingsUpdatedAt: new Date().toISOString(),
        fontSize: 'medium',
        backgroundImageFileName: undefined,
        backgroundImageOpacity: DEFAULT_BACKGROUND_IMAGE_OPACITY,
        backgroundImageBlur: DEFAULT_BACKGROUND_IMAGE_BLUR,
        launchAtStartup: false,
        minimizeOnLaunch: true,
        debugMode: false,
        closeAction: 'ask' as const, // Default to ask every time / 默认每次询问
        enableNotifications: true,
        showCopyNotification: true,
        showSaveNotification: true,
        dataPath: '',
        tagsSectionHeight: DEFAULT_TAGS_SECTION_HEIGHT,
        isTagsSectionCollapsed: false,
        skillTagsSectionHeight: DEFAULT_TAGS_SECTION_HEIGHT,
        isSkillTagsSectionCollapsed: false,
        aiProvider: 'openai',
        aiApiProtocol: 'openai',
        aiApiKey: '',
        aiApiUrl: '',
        aiModel: 'gpt-4o',
        aiModels: [],
        scenarioModelDefaults: {},
        creationMode: 'manual' as ECreationMode,
        translationMode: 'immersive' as ETranslationMode,
        sourceHistory: [],
        customSkillScanPaths: [],
        skillProjects: [],
        customPlatformRootPaths: {},
        customSkillPlatformPaths: {},
        skillPlatformOrder: [],
        skillInstallMethod: 'symlink' as const,
        autoScanInstalledSkills: false,
        autoScanStoreSkillsBeforeInstall: false,

        setCreationMode: (mode) => setTouched({ creationMode: mode }),
        setTranslationMode: (mode) => setTouched({ translationMode: mode }),

        addSourceHistory: (source) => {
          if (!source.trim()) return;
          const history = get().sourceHistory;
          // 移除重复项，放到最前面 / Remove duplicate and add to front
          const filtered = history.filter((s) => s !== source.trim());
          const updated = [source.trim(), ...filtered].slice(0, 20);
          setTouched({ sourceHistory: updated });
        },

        setThemeMode: (mode) => {
          if (mode === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTouched({ themeMode: mode, isDarkMode: prefersDark });
            document.documentElement.classList.toggle('dark', prefersDark);
          } else {
            const isDark = mode === 'dark';
            setTouched({ themeMode: mode, isDarkMode: isDark });
            document.documentElement.classList.toggle('dark', isDark);
          }
        },

        setDarkMode: (isDark) => {
          setTouched({
            isDarkMode: isDark,
            themeMode: isDark ? 'dark' : 'light',
          });
          document.documentElement.classList.toggle('dark', isDark);
        },

        setThemeColor: (colorId) => {
          if (colorId === 'custom') {
            const state = get();
            const hs = hexToHs(state.customThemeHex);
            setTouched({
              themeColor: 'custom',
              themeHue: hs.hue,
              themeSaturation: hs.saturation,
            });
            document.documentElement.style.setProperty('--theme-hue', String(hs.hue));
            document.documentElement.style.setProperty('--theme-saturation', String(hs.saturation));
            return;
          }
          const theme = MORANDI_THEMES.find((t) => t.id === colorId);
          if (theme) {
            setTouched({
              themeColor: colorId,
              themeHue: theme.hue,
              themeSaturation: theme.saturation,
            });
            document.documentElement.style.setProperty('--theme-hue', String(theme.hue));
            document.documentElement.style.setProperty(
              '--theme-saturation',
              String(theme.saturation),
            );
          }
        },
        setCustomThemeHex: (hex) => {
          const hs = hexToHs(hex);
          setTouched({
            customThemeHex: `#${hex.replace(/^#/, '')}`,
            themeColor: 'custom',
            themeHue: hs.hue,
            themeSaturation: hs.saturation,
          });
          document.documentElement.style.setProperty('--theme-hue', String(hs.hue));
          document.documentElement.style.setProperty('--theme-saturation', String(hs.saturation));
        },
        setFontSize: (size) => {
          setTouched({ fontSize: size });
          const fontConfig = FONT_SIZES.find((f) => f.id === size);
          if (fontConfig) {
            document.documentElement.style.setProperty('--base-font-size', `${fontConfig.value}px`);
          }
        },

        applyBackgroundImageSelection: (fileName) => {
          const normalized = normalizeBackgroundImageFileName(fileName);
          if (!normalized) {
            return;
          }

          const nextOpacity = get().backgroundImageOpacity;
          const nextBlur = get().backgroundImageBlur;

          setTouched({
            backgroundImageFileName: normalized,
            backgroundImageOpacity: nextOpacity,
            backgroundImageBlur: nextBlur,
          });
          applyBackgroundImageVars({
            backgroundImageFileName: normalized,
            backgroundImageOpacity: nextOpacity,
            backgroundImageBlur: nextBlur,
          });
        },
        setBackgroundImageFileName: (fileName) => {
          const normalized = normalizeBackgroundImageFileName(fileName);
          if (get().backgroundImageFileName === normalized) {
            return;
          }
          setTouched({ backgroundImageFileName: normalized });
          applyBackgroundImageVars({
            backgroundImageFileName: normalized,
            backgroundImageOpacity: get().backgroundImageOpacity,
            backgroundImageBlur: get().backgroundImageBlur,
          });
        },
        setBackgroundImageOpacity: (opacity) => {
          const normalized = clampBackgroundImageOpacity(opacity);
          if (get().backgroundImageOpacity === normalized) {
            return;
          }
          setTouched({ backgroundImageOpacity: normalized });
          applyBackgroundImageVars({
            backgroundImageFileName: get().backgroundImageFileName,
            backgroundImageOpacity: normalized,
            backgroundImageBlur: get().backgroundImageBlur,
          });
        },
        setBackgroundImageBlur: (blur) => {
          const normalized = clampBackgroundImageBlur(blur);
          if (get().backgroundImageBlur === normalized) {
            return;
          }
          setTouched({ backgroundImageBlur: normalized });
          applyBackgroundImageVars({
            backgroundImageFileName: get().backgroundImageFileName,
            backgroundImageOpacity: get().backgroundImageOpacity,
            backgroundImageBlur: normalized,
          });
        },

        setClipboardImportEnabled: (enabled) => setTouched({ clipboardImportEnabled: enabled }),
        setLaunchAtStartup: (enabled) => {
          setTouched({ launchAtStartup: enabled });
          // Update auto launch with current minimizeOnLaunch setting
          // 更新开机自启，同时传递 minimizeOnLaunch 设置
          const minimizeOnLaunch = get().minimizeOnLaunch;
          setAutoLaunch(enabled, minimizeOnLaunch);
        },
        setMinimizeOnLaunch: (enabled) => {
          setTouched({ minimizeOnLaunch: enabled });
          // Notify main process to update tray status
          // 通知主进程更新托盘状态
          setMinimizeToTray(enabled);
          // If auto launch is enabled, update the openAsHidden setting
          // 如果开机自启已启用，更新 openAsHidden 设置
          const launchAtStartup = get().launchAtStartup;
          if (launchAtStartup) {
            setAutoLaunch(true, enabled);
          }
        },
        setCloseAction: (action) => {
          setTouched({ closeAction: action });
          // Notify main process of close action change / 通知主进程更新关闭行为
          setCloseAction(action);
        },
        setDebugMode: (enabled) => {
          setTouched({ debugMode: enabled });
          setDebugMode(enabled);
        },
        setEnableNotifications: (enabled) => setTouched({ enableNotifications: enabled }),
        setShowCopyNotification: (enabled) => setTouched({ showCopyNotification: enabled }),
        setShowSaveNotification: (enabled) => setTouched({ showSaveNotification: enabled }),
        setDataPath: (path) => setTouched({ dataPath: path }),
        setTagsSectionHeight: (height) => setTouched({ tagsSectionHeight: height }),
        setIsTagsSectionCollapsed: (collapsed) => setTouched({ isTagsSectionCollapsed: collapsed }),
        setSkillTagsSectionHeight: (height) => setTouched({ skillTagsSectionHeight: height }),
        setIsSkillTagsSectionCollapsed: (collapsed) =>
          setTouched({ isSkillTagsSectionCollapsed: collapsed }),
        setAiProvider: (provider) => setTouched({ aiProvider: provider }),
        setAiApiProtocol: (protocol) => setTouched({ aiApiProtocol: protocol }),
        setAiApiKey: (key) => setTouched({ aiApiKey: key }),
        setAiApiUrl: (url) => setTouched({ aiApiUrl: url }),
        setAiModel: (model) => setTouched({ aiModel: model }),

        // Multi-model management methods
        // 多模型管理方法
        addAiModel: (config) => {
          const id = `model_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
          const models = get().aiModels;
          const isFirst = models.length === 0;
          setTouched({
            aiModels: [...models, { ...config, id, isDefault: isFirst }],
          });
          // If it's the first model, sync to legacy configuration
          // 如果是第一个模型，同步到旧版配置
          if (isFirst) {
            setTouched({
              aiProvider: config.provider,
              aiApiProtocol: config.apiProtocol,
              aiApiKey: config.apiKey,
              aiApiUrl: config.apiUrl,
              aiModel: config.model,
            });
          }
        },

        updateAiModel: (id, config) => {
          const models = get().aiModels.map((m) => (m.id === id ? { ...m, ...config } : m));
          setTouched({ aiModels: models });
          // If updating the default model, sync to legacy configuration
          // 如果更新的是默认模型，同步到旧版配置
          const updated = models.find((m) => m.id === id);
          if (updated?.isDefault) {
            setTouched({
              aiProvider: updated.provider,
              aiApiProtocol: updated.apiProtocol,
              aiApiKey: updated.apiKey,
              aiApiUrl: updated.apiUrl,
              aiModel: updated.model,
            });
          }
        },

        deleteAiModel: (id) => {
          const models = get().aiModels;
          const toDelete = models.find((m) => m.id === id);
          const remaining = models.filter((m) => m.id !== id);
          const scenarioModelDefaults = { ...get().scenarioModelDefaults };
          for (const [scenario, modelId] of Object.entries(scenarioModelDefaults)) {
            if (modelId === id) {
              delete scenarioModelDefaults[scenario as EAIUsageScenario];
            }
          }
          // If deleting the default model, set the first one as default
          // 如果删除的是默认模型，设置第一个为默认
          if (toDelete?.isDefault && remaining.length > 0) {
            remaining[0] = { ...remaining[0], isDefault: true };
            setTouched({
              aiProvider: remaining[0].provider,
              aiApiProtocol: remaining[0].apiProtocol,
              aiApiKey: remaining[0].apiKey,
              aiApiUrl: remaining[0].apiUrl,
              aiModel: remaining[0].model,
            });
          }
          setTouched({ aiModels: remaining, scenarioModelDefaults });
        },

        setDefaultAiModel: (id) => {
          const targetModel = get().aiModels.find((m) => m.id === id);
          if (!targetModel) return;

          const targetType = targetModel.type || 'chat';

          // Only update isDefault status for models of the same type
          // 只更新同类型模型的 isDefault 状态
          const models = get().aiModels.map((m) => {
            const modelType = m.type || 'chat';
            if (modelType === targetType) {
              return { ...m, isDefault: m.id === id };
            }
            return m;
          });
          setTouched({ aiModels: models });

          // Only chat models sync to legacy configuration
          // 只有对话模型才同步到旧版配置
          if (targetType === 'chat') {
            setTouched({
              aiProvider: targetModel.provider,
              aiApiProtocol: targetModel.apiProtocol,
              aiApiKey: targetModel.apiKey,
              aiApiUrl: targetModel.apiUrl,
              aiModel: targetModel.model,
            });
          }
        },

        setScenarioModelDefault: (scenario, modelId) => {
          const nextDefaults = { ...get().scenarioModelDefaults };
          if (modelId) {
            nextDefaults[scenario] = modelId;
          } else {
            delete nextDefaults[scenario];
          }
          setTouched({ scenarioModelDefaults: nextDefaults });
        },

        applyTheme: () => {
          const state = get();
          // Handle theme mode
          // 处理主题模式
          let isDark = state.isDarkMode;
          if (state.themeMode === 'system') {
            isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          } else {
            isDark = state.themeMode === 'dark';
          }
          document.documentElement.classList.toggle('dark', isDark);
          document.documentElement.style.setProperty('--theme-hue', String(state.themeHue));
          document.documentElement.style.setProperty(
            '--theme-saturation',
            String(state.themeSaturation),
          );
          const fontConfig = FONT_SIZES.find((f) => f.id === state.fontSize);
          if (fontConfig) {
            document.documentElement.style.setProperty('--base-font-size', `${fontConfig.value}px`);
          }
          applyBackgroundImageVars(state);
          // Initialize tray status
          // 初始化托盘状态
          if (state.minimizeOnLaunch) {
            setMinimizeToTray(true);
          }
          if (state.debugMode) {
            setDebugMode(true);
          }
          // Sync close action
          if (state.closeAction) {
            setCloseAction(state.closeAction);
          }
        },

        // Custom skill scan paths actions / 自定义 ISkill 扫描路径操作
        setCustomSkillScanPaths: (paths) => setTouched({ customSkillScanPaths: paths }),
        addCustomSkillScanPath: (path) =>
          setTouched({
            customSkillScanPaths: get().customSkillScanPaths.includes(path)
              ? get().customSkillScanPaths
              : [...get().customSkillScanPaths, path],
          }),
        removeCustomSkillScanPath: (path) =>
          setTouched({
            customSkillScanPaths: get().customSkillScanPaths.filter((p) => p !== path),
          }),
        addSkillProject: (input) => {
          const name = input.name.trim();
          const rootPath = normalizeProjectRecordPath(input.rootPath);
          if (!name || !rootPath) {
            throw new Error('ISkill project name and rootPath are required');
          }

          const now = Date.now();
          const nextProject: ISkillProject = {
            id: createProjectRecordId(),
            name,
            rootPath,
            scanPaths: normalizeProjectScanPaths(input.scanPaths, rootPath),
            createdAt: now,
            updatedAt: now,
          };

          const existingProjects = get().skillProjects;
          const hasConflict = existingProjects.some(
            (project) => project.rootPath.toLowerCase() === nextProject.rootPath.toLowerCase(),
          );
          if (hasConflict) {
            throw new Error('ISkill project root path already exists');
          }

          setTouched({ skillProjects: [nextProject, ...existingProjects] });
          syncSettingsToMain({ skillProjects: [nextProject, ...existingProjects] });
          return nextProject;
        },
        updateSkillProject: (projectId, updates) => {
          const currentProjects = get().skillProjects;
          const currentProject = currentProjects.find((project) => project.id === projectId);
          if (!currentProject) {
            return;
          }

          const nextRootPath =
            typeof updates.rootPath === 'string'
              ? normalizeProjectRecordPath(updates.rootPath)
              : currentProject.rootPath;
          const nextName =
            typeof updates.name === 'string' ? updates.name.trim() : currentProject.name;

          if (!nextName || !nextRootPath) {
            throw new Error('ISkill project name and rootPath are required');
          }

          const hasConflict = currentProjects.some(
            (project) =>
              project.id !== projectId &&
              project.rootPath.toLowerCase() === nextRootPath.toLowerCase(),
          );
          if (hasConflict) {
            throw new Error('ISkill project root path already exists');
          }

          const nextProjects = currentProjects.map((project) => {
            if (project.id !== projectId) {
              return project;
            }

            return {
              ...project,
              name: nextName,
              rootPath: nextRootPath,
              scanPaths:
                updates.scanPaths === undefined
                  ? project.scanPaths
                  : normalizeProjectScanPaths(updates.scanPaths, nextRootPath),
              lastScannedAt:
                updates.lastScannedAt === undefined ? project.lastScannedAt : updates.lastScannedAt,
              updatedAt: Date.now(),
            };
          });

          setTouched({ skillProjects: nextProjects });
          syncSettingsToMain({ skillProjects: nextProjects });
        },
        removeSkillProject: (projectId) => {
          const nextProjects = get().skillProjects.filter((project) => project.id !== projectId);
          setTouched({ skillProjects: nextProjects });
          syncSettingsToMain({ skillProjects: nextProjects });
        },
        setCustomPlatformRootPath: (platformId, pathValue) => {
          const normalizedPath = pathValue.trim();
          const nextPaths = { ...get().customPlatformRootPaths };
          if (normalizedPath) {
            nextPaths[platformId] = normalizedPath;
          } else {
            delete nextPaths[platformId];
          }
          setTouched({ customPlatformRootPaths: nextPaths });
          syncSettingsToMain({ customPlatformRootPaths: nextPaths });
        },
        resetCustomPlatformRootPath: (platformId) => {
          const nextPaths = { ...get().customPlatformRootPaths };
          delete nextPaths[platformId];
          setTouched({ customPlatformRootPaths: nextPaths });
          syncSettingsToMain({ customPlatformRootPaths: nextPaths });
        },
        setCustomSkillPlatformPath: (platformId, pathValue) => {
          get().setCustomPlatformRootPath(platformId, pathValue);
        },
        resetCustomSkillPlatformPath: (platformId) => {
          get().resetCustomPlatformRootPath(platformId);
        },
        setSkillPlatformOrder: (order) => {
          const nextOrder = order.filter(
            (platformId, index) =>
              typeof platformId === 'string' &&
              platformId.trim().length > 0 &&
              order.indexOf(platformId) === index,
          );
          setTouched({ skillPlatformOrder: nextOrder });
          syncSettingsToMain({ skillPlatformOrder: nextOrder });
        },
        moveSkillPlatformOrder: (platformId, direction) => {
          const currentOrder = [...get().skillPlatformOrder];
          const currentIndex = currentOrder.indexOf(platformId);
          if (currentIndex === -1) {
            return;
          }

          const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
          if (targetIndex < 0 || targetIndex >= currentOrder.length) {
            return;
          }

          [currentOrder[currentIndex], currentOrder[targetIndex]] = [
            currentOrder[targetIndex],
            currentOrder[currentIndex],
          ];

          setTouched({ skillPlatformOrder: currentOrder });
          syncSettingsToMain({ skillPlatformOrder: currentOrder });
        },
        resetSkillPlatformOrder: () => {
          setTouched({ skillPlatformOrder: [] });
          syncSettingsToMain({ skillPlatformOrder: [] });
        },
        // Skill install method action / ISkill 安装方式操作
        setSkillInstallMethod: (method) => setTouched({ skillInstallMethod: method }),
        setAutoScanInstalledSkills: (enabled) => setTouched({ autoScanInstalledSkills: enabled }),
        setAutoScanStoreSkillsBeforeInstall: (enabled) =>
          setTouched({ autoScanStoreSkillsBeforeInstall: enabled }),
      };
    },
    {
      name: 'aim-settings',
      version: 9,
      migrate: (state, version) => {
        if (!state || typeof state !== 'object') {
          return state as ISettingsState;
        }
        const next = { ...(state as ISettingsState) };
        next.aiApiProtocol = normalizeAIProtocol(
          next.aiApiProtocol,
          next.aiProvider,
          next.aiApiUrl,
        );
        if (!Array.isArray(next.aiModels)) {
          next.aiModels = [];
        } else {
          next.aiModels = next.aiModels
            .filter((model): model is IAIModelConfig => {
              return Boolean(
                model &&
                typeof model.id === 'string' &&
                typeof model.provider === 'string' &&
                typeof model.apiUrl === 'string' &&
                typeof model.model === 'string',
              );
            })
            .map((model) => ({
              ...model,
              apiProtocol: normalizeAIProtocol(model.apiProtocol, model.provider, model.apiUrl),
            }));
        }
        if (
          typeof next.tagsSectionHeight === 'number' &&
          next.tagsSectionHeight < DEFAULT_TAGS_SECTION_HEIGHT
        ) {
          next.tagsSectionHeight = DEFAULT_TAGS_SECTION_HEIGHT;
        }
        if (
          !next.scenarioModelDefaults ||
          typeof next.scenarioModelDefaults !== 'object' ||
          Array.isArray(next.scenarioModelDefaults)
        ) {
          next.scenarioModelDefaults = {};
        }
        if (
          !next.customPlatformRootPaths ||
          typeof next.customPlatformRootPaths !== 'object' ||
          Array.isArray(next.customPlatformRootPaths)
        ) {
          next.customPlatformRootPaths = {};
        }
        if (
          !next.customSkillPlatformPaths ||
          typeof next.customSkillPlatformPaths !== 'object' ||
          Array.isArray(next.customSkillPlatformPaths)
        ) {
          next.customSkillPlatformPaths = {};
        }
        if (
          version < 7 &&
          Object.keys(next.customPlatformRootPaths).length === 0 &&
          Object.keys(next.customSkillPlatformPaths).length > 0
        ) {
          next.customPlatformRootPaths = { ...next.customSkillPlatformPaths };
        }
        if (
          !Array.isArray(next.skillPlatformOrder) ||
          next.skillPlatformOrder.some((platformId) => typeof platformId !== 'string')
        ) {
          next.skillPlatformOrder = [];
        }
        if (!Array.isArray(next.skillProjects)) {
          next.skillProjects = [];
        } else {
          next.skillProjects = next.skillProjects
            .filter((project): project is ISkillProject => {
              return Boolean(
                project &&
                typeof project.id === 'string' &&
                typeof project.name === 'string' &&
                typeof project.rootPath === 'string',
              );
            })
            .map((project) => {
              const normalizedRootPath =
                typeof project.rootPath === 'string' ? project.rootPath.trim() : '';
              const normalizedScanPaths = Array.from(
                new Set(
                  (Array.isArray(project.scanPaths) ? project.scanPaths : [normalizedRootPath])
                    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
                    .filter((entry) => entry.length > 0),
                ),
              );

              return {
                ...project,
                name: project.name.trim(),
                rootPath: normalizedRootPath,
                scanPaths:
                  normalizedScanPaths.length > 0 ? normalizedScanPaths : [normalizedRootPath],
                createdAt: typeof project.createdAt === 'number' ? project.createdAt : Date.now(),
                updatedAt: typeof project.updatedAt === 'number' ? project.updatedAt : Date.now(),
                lastScannedAt:
                  typeof project.lastScannedAt === 'number' ? project.lastScannedAt : undefined,
              };
            })
            .filter((project) => project.name.length > 0 && project.rootPath.length > 0);
        }
        if (typeof next.autoScanInstalledSkills !== 'boolean') {
          next.autoScanInstalledSkills = false;
        }
        if (typeof next.autoScanStoreSkillsBeforeInstall !== 'boolean') {
          next.autoScanStoreSkillsBeforeInstall = false;
        }
        if (version < 8) {
          next.aiApiProtocol = normalizeAIProtocol(
            next.aiApiProtocol,
            next.aiProvider,
            next.aiApiUrl,
          );
          next.aiModels = next.aiModels.map((model) => ({
            ...model,
            apiProtocol: normalizeAIProtocol(model.apiProtocol, model.provider, model.apiUrl),
          }));
        }
        next.backgroundImageFileName = normalizeBackgroundImageFileName(
          next.backgroundImageFileName,
        );
        next.backgroundImageOpacity = clampBackgroundImageOpacity(
          typeof next.backgroundImageOpacity === 'number'
            ? next.backgroundImageOpacity
            : DEFAULT_BACKGROUND_IMAGE_OPACITY,
        );
        next.backgroundImageBlur = normalizeBackgroundImageBlur(
          typeof next.backgroundImageBlur === 'number'
            ? next.backgroundImageBlur
            : DEFAULT_BACKGROUND_IMAGE_BLUR,
          version,
        );
        return next;
      },
      onRehydrateStorage: () => (state) => {
        applyBackgroundImageVars({
          backgroundImageFileName: state?.backgroundImageFileName,
          backgroundImageOpacity: state?.backgroundImageOpacity,
          backgroundImageBlur: state?.backgroundImageBlur,
        });
        syncSettingsToMain({
          customPlatformRootPaths: state?.customPlatformRootPaths || {},
          customSkillPlatformPaths: state?.customSkillPlatformPaths || {},
          skillPlatformOrder: state?.skillPlatformOrder || [],
          skillProjects: state?.skillProjects || [],
        });
      },
    },
  ),
);
