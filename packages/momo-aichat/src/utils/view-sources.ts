import type { RunEvent } from '@momo/agent-contracts';
import type { IChatSourceRef } from '../types/source';

/** Only host-created artifacts can add generated files to a view's admitted references. */
export function withArtifactSources(refs: IChatSourceRef[], events: RunEvent[] = []) {
  const sources = new Map(refs.map((ref) => [ref.sourceId, ref]));
  for (const event of events) {
    if (event.type !== 'artifact.created') continue;
    const ref = event.payload.sourceRef as IChatSourceRef | undefined;
    if (
      ref &&
      typeof ref.sourceId === 'string' &&
      typeof ref.revision === 'string' &&
      typeof ref.name === 'string' &&
      typeof ref.mimeType === 'string' &&
      (ref.encoding === 'base64' || ref.encoding === 'utf8') &&
      typeof ref.size === 'number'
    )
      sources.set(ref.sourceId, ref);
  }
  return [...sources.values()];
}
