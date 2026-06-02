type ECynefinDomain = 'complex' | 'complicated' | 'clear' | 'chaotic' | 'confusion';

interface ICynefinTransition {
  from: ECynefinDomain;
  to: ECynefinDomain;
  label?: string;
}

interface ICynefinModel {
  title?: string;
  domains: Record<ECynefinDomain, string[]>;
  transitions: ICynefinTransition[];
}

const DOMAIN_NAMES: ECynefinDomain[] = ['complex', 'complicated', 'clear', 'chaotic', 'confusion'];

const DOMAIN_LABEL: Record<ECynefinDomain, string> = {
  complex: 'Complex',
  complicated: 'Complicated',
  clear: 'Clear',
  chaotic: 'Chaotic',
  confusion: 'Confusion',
};

const DOMAIN_COLORS: Record<ECynefinDomain, string> = {
  complex: '#e8d5f5',
  complicated: '#d5e8f5',
  clear: '#d5f5e0',
  chaotic: '#f5d5d5',
  confusion: '#ececec',
};

const DOMAIN_META: Record<Exclude<ECynefinDomain, 'confusion'>, string> = {
  complex: 'Probe → Sense → Respond',
  complicated: 'Sense → Analyse → Respond',
  clear: 'Sense → Categorise → Respond',
  chaotic: 'Act → Sense → Respond',
};

const TRANSITION_RE =
  /^\s*(complex|complicated|clear|chaotic|confusion)\s*-->\s*(complex|complicated|clear|chaotic|confusion)\s*(?::\s*(.+))?\s*$/i;
const QUOTED_ITEM_RE = /^\s*"([^"]+)"\s*$/;
const TITLE_RE = /^\s*title\s+(.+)\s*$/i;

/** 检测是否为 cynefin-beta 图表 */
export function isCynefinBetaSource(source: string): boolean {
  return /^\s*cynefin-beta(?:[\s:]|$)/.test(source.trimStart());
}

/** 解析 cynefin-beta 文本 DSL */
export function parseCynefinSource(source: string): ICynefinModel {
  const model: ICynefinModel = {
    domains: {
      complex: [],
      complicated: [],
      clear: [],
      chaotic: [],
      confusion: [],
    },
    transitions: [],
  };

  let currentDomain: ECynefinDomain | null = null;

  for (const rawLine of source.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('%%')) {
      continue;
    }
    if (/^cynefin-beta/i.test(line)) {
      continue;
    }

    const titleMatch = line.match(TITLE_RE);
    if (titleMatch) {
      model.title = titleMatch[1].trim();
      currentDomain = null;
      continue;
    }

    const transitionMatch = line.match(TRANSITION_RE);
    if (transitionMatch) {
      const from = transitionMatch[1].toLowerCase() as ECynefinDomain;
      const to = transitionMatch[2].toLowerCase() as ECynefinDomain;
      let label = transitionMatch[3]?.trim();
      if (label?.startsWith('"') && label.endsWith('"')) {
        label = label.slice(1, -1);
      }
      model.transitions.push({ from, to, label });
      currentDomain = null;
      continue;
    }

    const domain = line.toLowerCase() as ECynefinDomain;
    if (DOMAIN_NAMES.includes(domain)) {
      currentDomain = domain;
      continue;
    }

    const itemMatch = line.match(QUOTED_ITEM_RE);
    if (itemMatch && currentDomain) {
      model.domains[currentDomain].push(itemMatch[1]);
    }
  }

  return model;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

interface IDomainLayout {
  cx: number;
  cy: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

function getDomainLayouts(width: number, height: number): Record<ECynefinDomain, IDomainLayout> {
  const hw = width / 2;
  const hh = height / 2;
  return {
    complex: { cx: hw / 2, cy: hh / 2, x: 0, y: 0, w: hw, h: hh },
    complicated: { cx: hw + hw / 2, cy: hh / 2, x: hw, y: 0, w: hw, h: hh },
    chaotic: { cx: hw / 2, cy: hh + hh / 2, x: 0, y: hh, w: hw, h: hh },
    clear: { cx: hw + hw / 2, cy: hh + hh / 2, x: hw, y: hh, w: hw, h: hh },
    confusion: { cx: hw, cy: hh, x: hw * 0.7, y: hh * 0.7, w: hw * 0.6, h: hh * 0.6 },
  };
}

function renderItems(
  items: string[],
  layout: IDomainLayout,
  color: string,
  startY: number,
): string {
  const itemHeight = 26;
  const itemPaddingX = 10;
  const parts: string[] = [];

  items.forEach((label, index) => {
    const badgeWidth = Math.max(label.length * 14 + itemPaddingX * 2, 80);
    const x = layout.cx - badgeWidth / 2;
    const y = startY + index * (itemHeight + 4);
    parts.push(
      `<g transform="translate(${x}, ${y})">` +
        `<rect width="${badgeWidth}" height="${itemHeight}" rx="4" ry="4" fill="${color}" fill-opacity="0.95" stroke="#596273" stroke-width="1"/>` +
        `<text x="${badgeWidth / 2}" y="${itemHeight / 2}" text-anchor="middle" dominant-baseline="central" font-size="12" fill="#1f2329">${escapeXml(label)}</text>` +
        `</g>`,
    );
  });

  return parts.join('');
}

function renderTransitions(
  transitions: ICynefinTransition[],
  layouts: Record<ECynefinDomain, IDomainLayout>,
  markerId: string,
): string {
  return transitions
    .map((transition) => {
      const fromLayout = layouts[transition.from];
      const toLayout = layouts[transition.to];
      if (!fromLayout || !toLayout || transition.from === transition.to) {
        return '';
      }

      const x1 = fromLayout.cx;
      const y1 = fromLayout.cy;
      const x2 = toLayout.cx;
      const y2 = toLayout.cy;
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const offsetAmount = len * 0.15;
      const cpx = mx + (-dy / len) * offsetAmount;
      const cpy = my + (dx / len) * offsetAmount;

      const label = transition.label
        ? `<text x="${cpx}" y="${cpy - 8}" text-anchor="middle" font-size="11" fill="#596273">${escapeXml(transition.label)}</text>`
        : '';

      return (
        `<path d="M${x1},${y1} Q${cpx},${cpy} ${x2},${y2}" fill="none" stroke="#596273" stroke-width="1.5" marker-end="url(#${markerId})"/>` +
        label
      );
    })
    .join('');
}

/**
 * 在 mermaid 尚未内置 cynefin-beta 时渲染 SVG。
 * 上游合并后可删除该 polyfill，改由 mermaid 原生渲染。
 */
export function renderCynefinPolyfill(source: string, svgId = 'cynefin-polyfill'): string {
  const model = parseCynefinSource(source);
  const width = 900;
  const height = 600;
  const padding = 24;
  const totalWidth = width + padding * 2;
  const totalHeight = height + padding * 2;
  const layouts = getDomainLayouts(width, height);
  const markerId = `${svgId}-arrow`;
  const quadrantDomains: Exclude<ECynefinDomain, 'confusion'>[] = [
    'complex',
    'complicated',
    'chaotic',
    'clear',
  ];

  const backgrounds = quadrantDomains
    .map((domain) => {
      const layout = layouts[domain];
      return `<rect x="${layout.x}" y="${layout.y}" width="${layout.w}" height="${layout.h}" fill="${DOMAIN_COLORS[domain]}" fill-opacity="0.55" stroke="none"/>`;
    })
    .join('');

  const boundaries =
    `<line x1="${width / 2}" y1="0" x2="${width / 2}" y2="${height}" stroke="#596273" stroke-width="1.5" stroke-dasharray="6 4"/>` +
    `<line x1="0" y1="${height / 2}" x2="${width}" y2="${height / 2}" stroke="#596273" stroke-width="1.5" stroke-dasharray="6 4"/>` +
    `<line x1="${width / 2}" y1="${height / 2}" x2="${width}" y2="${height / 2}" stroke="#c0392b" stroke-width="3"/>`;

  const confusionRx = width * 0.15;
  const confusionRy = height * 0.15;
  const confusionEllipse = `<ellipse cx="${width / 2}" cy="${height / 2}" rx="${confusionRx}" ry="${confusionRy}" fill="${DOMAIN_COLORS.confusion}" fill-opacity="0.65" stroke="#596273" stroke-width="1.5"/>`;

  const labels = [
    ...quadrantDomains.map((domain) => {
      const layout = layouts[domain];
      const meta = DOMAIN_META[domain];
      return (
        `<text x="${layout.cx}" y="${layout.cy - 28}" text-anchor="middle" font-size="16" font-weight="600" fill="#1f2329">${DOMAIN_LABEL[domain]}</text>` +
        `<text x="${layout.cx}" y="${layout.cy - 10}" text-anchor="middle" font-size="11" fill="#596273">${meta}</text>`
      );
    }),
    `<text x="${width / 2}" y="${height / 2 - 12}" text-anchor="middle" font-size="14" font-weight="600" fill="#1f2329">${DOMAIN_LABEL.confusion}</text>`,
    `<text x="${width / 2}" y="${height / 2 + 4}" text-anchor="middle" font-size="11" fill="#596273">Disorder</text>`,
  ].join('');

  const items = DOMAIN_NAMES.map((domain) => {
    const domainItems = model.domains[domain];
    if (!domainItems.length) {
      return '';
    }
    const layout = layouts[domain];
    const startY = domain === 'confusion' ? layout.cy + 18 : layout.cy + 8;
    return renderItems(domainItems, layout, DOMAIN_COLORS[domain], startY);
  }).join('');

  const title = model.title
    ? `<text x="${width / 2}" y="-8" text-anchor="middle" font-size="18" font-weight="600" fill="#1f2329">${escapeXml(model.title)}</text>`
    : '';

  return (
    `<svg id="${svgId}" xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}" role="img">` +
    `<defs>` +
    `<marker id="${markerId}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">` +
    `<path d="M0,0 L10,5 L0,10 z" fill="#596273"/>` +
    `</marker>` +
    `</defs>` +
    `<g transform="translate(${padding}, ${padding})">` +
    backgrounds +
    boundaries +
    confusionEllipse +
    labels +
    items +
    renderTransitions(model.transitions, layouts, markerId) +
    title +
    `</g>` +
    `</svg>`
  );
}

/** mermaid 是否已注册原生 cynefin 图表 */
export function hasNativeCynefinSupport(mermaidInst: {
  getRegisteredDiagramsMetadata?: () => Array<{ id: string }>;
}): boolean {
  try {
    return (
      mermaidInst.getRegisteredDiagramsMetadata?.().some((item) => item.id === 'cynefin') ?? false
    );
  } catch {
    return false;
  }
}
