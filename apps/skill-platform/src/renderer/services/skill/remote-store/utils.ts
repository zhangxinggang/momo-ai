import type { DMarketplaceReferenceEntry } from '@/types/modules';

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getOffsetFromCursor(cursor?: string | null): number {
  return Math.max(0, Number.parseInt(cursor ?? '0', 10) || 0);
}

export function resolveUrl(baseUrl: string, value?: string | null) {
  if (!value) return null;
  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return value;
  }
}

export function resolveMarketplaceReference(
  entry: string | DMarketplaceReferenceEntry,
): string | undefined {
  if (typeof entry === 'string') return entry;
  return entry.url || entry.index || entry.manifest;
}

export async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R | null>,
): Promise<R[]> {
  const results: Array<R | null> = new Array(items.length).fill(null);
  let nextIndex = 0;

  const runWorker = async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  };

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => runWorker()));
  return results.filter(isDefined);
}
