import { describe, expect, it } from 'vitest';
import { formatDate, formatValue } from './format';

describe('format', () => {
  it('formats values with a French decimal comma', () => {
    expect(formatValue(4.5)).toBe('4,5');
    expect(formatValue(50)).toBe('50');
  });

  it('formats dates in French', () => {
    expect(formatDate(new Date(2026, 8, 17, 12).toISOString())).toMatch(/17 sept/);
  });
});
