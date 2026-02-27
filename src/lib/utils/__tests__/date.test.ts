import { describe, it, expect } from 'vitest';
import { formatDateCustom, nowISO } from '../date';

describe('formatDateCustom', () => {
  it('formats DD/MM/YYYY correctly', () => {
    expect(formatDateCustom('2026-02-28', 'DD/MM/YYYY')).toBe('28/02/2026');
  });

  it('formats MM/DD/YYYY correctly', () => {
    expect(formatDateCustom('2026-02-28', 'MM/DD/YYYY')).toBe('02/28/2026');
  });

  it('formats YYYY-MM-DD correctly', () => {
    expect(formatDateCustom('2026-02-28', 'YYYY-MM-DD')).toBe('2026-02-28');
  });

  it('pads single-digit day and month', () => {
    expect(formatDateCustom('2026-01-05', 'DD/MM/YYYY')).toBe('05/01/2026');
  });
});

describe('nowISO', () => {
  it('returns a valid ISO 8601 string', () => {
    const result = nowISO();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});
