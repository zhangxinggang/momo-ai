interface ImmersiveSegment {
  type: 'original' | 'translation';
  text: string;
}

export function renderImmersiveSegments(raw: string): ImmersiveSegment[] {
  const lines = raw.split('\n');
  const segments: ImmersiveSegment[] = [];
  let buffer: string[] = [];
  let currentType: ImmersiveSegment['type'] = 'original';

  const flush = () => {
    const joined = buffer.join('\n');
    if (joined.trim()) {
      segments.push({ type: currentType, text: joined });
    }
    buffer = [];
  };

  for (const line of lines) {
    const translationMatch = line.match(/^<t>(.*)<\/t>$/);
    if (translationMatch) {
      flush();
      currentType = 'translation';
      buffer.push(translationMatch[1]);
      flush();
      currentType = 'original';
      continue;
    }
    buffer.push(line);
  }

  flush();
  return segments;
}
