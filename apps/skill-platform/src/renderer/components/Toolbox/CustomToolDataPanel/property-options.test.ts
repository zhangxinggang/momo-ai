import { describe, expect, it } from 'vitest';

import { getOpenUIPropertyOptions } from './property-options';

describe('OpenUI component property options', () => {
  it('reads enum choices through optional schema wrappers', () => {
    expect(getOpenUIPropertyOptions('Card', 'variant')).toEqual(['card', 'sunk', 'clear']);
    expect(getOpenUIPropertyOptions('Card', 'direction')).toEqual(['row', 'column']);
  });

  it('does not turn unconstrained or unknown properties into selects', () => {
    expect(getOpenUIPropertyOptions('CardHeader', 'title')).toEqual([]);
    expect(getOpenUIPropertyOptions('MissingComponent', 'variant')).toEqual([]);
  });
});
