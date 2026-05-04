import {
  BotIcon,
  BugIcon,
  GithubIcon,
  LayoutGridIcon,
  SparkleIcon,
  SparklesIcon,
  TerminalIcon,
  WindIcon,
  ZapIcon,
} from 'lucide-react';
import { useState } from 'react';

// Import platform icons
// 导入平台图标
import antigravityIcon from '@renderer/assets/platforms/antigravity.svg';
import claudeIcon from '@renderer/assets/platforms/claude.png';
import codebuddyDarkIcon from '@renderer/assets/platforms/codebuddy-dark.svg';
import codebuddyLightIcon from '@renderer/assets/platforms/codebuddy-light.svg';
import codexIcon from '@renderer/assets/platforms/codex.png';
import copilotIcon from '@renderer/assets/platforms/copilot.png';
import cursorIcon from '@renderer/assets/platforms/cursor.png';
import geminiIcon from '@renderer/assets/platforms/gemini.png';
import hermesIcon from '@renderer/assets/platforms/hermes.svg';
import kiroIcon from '@renderer/assets/platforms/kiro.png';
import openclawIcon from '@renderer/assets/platforms/openclaw.png';
import opencodeIcon from '@renderer/assets/platforms/opencode.png';
import qoderIcon from '@renderer/assets/platforms/qoder.png';
import qoderworkIcon from '@renderer/assets/platforms/qoderwork.png';
import rooIcon from '@renderer/assets/platforms/roo.png';
import traeIcon from '@renderer/assets/platforms/trae.png';
import windsurfIcon from '@renderer/assets/platforms/windsurf.png';

type PlatformIconSource = string | { light: string; dark: string };

// Platform icon mapping
// 平台图标映射
const PLATFORM_ICONS: Record<string, PlatformIconSource> = {
  claude: claudeIcon,
  cursor: cursorIcon,
  copilot: copilotIcon,
  windsurf: windsurfIcon,
  kiro: kiroIcon,
  gemini: geminiIcon,
  antigravity: antigravityIcon,
  trae: traeIcon,
  opencode: opencodeIcon,
  codex: codexIcon,
  roo: rooIcon,
  openclaw: openclawIcon,
  qoder: qoderIcon,
  qoderwork: qoderworkIcon,
  codebuddy: {
    light: codebuddyLightIcon,
    dark: codebuddyDarkIcon,
  },
  hermes: hermesIcon,
};

// Fallback Lucide icons for platforms without PNG
// 没有 PNG 图标时的 Lucide 图标 fallback
const FALLBACK_ICONS: Record<string, React.ReactNode> = {
  claude: <SparklesIcon />,
  cursor: <TerminalIcon />,
  copilot: <GithubIcon />,
  windsurf: <WindIcon />,
  kiro: <SparkleIcon />,
  gemini: <SparklesIcon />,
  antigravity: <SparklesIcon />,
  trae: <ZapIcon />,
  opencode: <TerminalIcon />,
  codex: <TerminalIcon />,
  roo: <BotIcon />,
  amp: <ZapIcon />,
  openclaw: <BugIcon />,
  qoder: <BotIcon />,
  qoderwork: <BotIcon />,
  codebuddy: <BotIcon />,
  hermes: <BotIcon />,
};

interface IProps {
  platformId: string;
  size?: number;
  className?: string;
}

/**
 * Platform icon component with PNG icons and Lucide fallback
 * 平台图标组件，支持 PNG 图标和 Lucide 图标 fallback
 */
export function PlatformIcon({ platformId, size = 24, className = '' }: IProps) {
  const [imageError, setImageError] = useState(false);

  const iconSrc = PLATFORM_ICONS[platformId];
  const fallbackIcon = FALLBACK_ICONS[platformId] || <LayoutGridIcon />;

  // If no PNG icon or image failed to load, use fallback
  // 如果没有 PNG 图标或图片加载失败，使用 fallback
  if (!iconSrc || imageError) {
    return (
      <span
        className={`inline-flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}>
        {/* Clone the icon element with proper size */}
        <span style={{ width: size, height: size }} className='flex items-center justify-center'>
          {fallbackIcon}
        </span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center ${className} ${
        platformId === 'copilot'
          ? 'rounded-xl bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-800/80 dark:ring-slate-700'
          : ''
      }`}
      style={{ width: size, height: size }}>
      {typeof iconSrc === 'string' ? (
        <img
          src={iconSrc}
          alt={`${platformId} icon`}
          width={size}
          height={size}
          className={`object-contain ${
            platformId === 'copilot' ? 'brightness-0 dark:brightness-0 dark:invert' : ''
          }`}
          onError={() => setImageError(true)}
          loading='lazy'
        />
      ) : (
        <>
          <img
            src={iconSrc.light}
            alt={`${platformId} icon`}
            width={size}
            height={size}
            className='object-contain dark:hidden'
            onError={() => setImageError(true)}
            loading='lazy'
          />
          <img
            src={iconSrc.dark}
            alt={`${platformId} icon`}
            width={size}
            height={size}
            className='hidden object-contain dark:block'
            onError={() => setImageError(true)}
            loading='lazy'
          />
        </>
      )}
    </span>
  );
}

/**
 * Get platform icon as React element (for use in platform config)
 * 获取平台图标作为 React 元素（用于平台配置）
 */
export function getPlatformIconElement(platformId: string, size: number = 16): React.ReactNode {
  return <PlatformIcon platformId={platformId} size={size} />;
}
