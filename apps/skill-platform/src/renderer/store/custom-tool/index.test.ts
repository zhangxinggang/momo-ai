import { describe, expect, it } from 'vitest';

import { getCustomToolDisplayName } from './index';

describe('custom tool store helpers', () => {
  it('uses the final path segment as display name', () => {
    expect(getCustomToolDisplayName('dashboards/weather')).toBe('weather');
  });
});
