import { describe, it, expect } from 'vitest';
import {
  toNumber,
  formatDateTime,
  getMaintenanceTab,
  getMaintenanceLabel,
  compact,
  midpoint,
} from '../../utils/add-record';

describe('toNumber', () => {
  it('parses valid integers', () => {
    expect(toNumber('42')).toBe(42);
  });

  it('parses valid floats', () => {
    expect(toNumber('3.14')).toBe(3.14);
  });

  it('parses negative numbers', () => {
    expect(toNumber('-7')).toBe(-7);
  });

  it('returns 0 for empty string', () => {
    expect(toNumber('')).toBe(0);
  });

  it('returns undefined for non-numeric string', () => {
    expect(toNumber('abc')).toBeUndefined();
  });

  it('returns undefined for NaN', () => {
    expect(toNumber('NaN')).toBeUndefined();
  });

  it('returns undefined for Infinity', () => {
    expect(toNumber('Infinity')).toBeUndefined();
  });

  it('returns undefined for -Infinity', () => {
    expect(toNumber('-Infinity')).toBeUndefined();
  });

  it('parses zero', () => {
    expect(toNumber('0')).toBe(0);
  });
});

describe('formatDateTime', () => {
  it('returns fallback for undefined', () => {
    expect(formatDateTime(undefined)).toBe('刚刚');
  });

  it('returns fallback for empty string', () => {
    expect(formatDateTime('')).toBe('刚刚');
  });

  it('returns fallback for invalid date', () => {
    expect(formatDateTime('not-a-date')).toBe('刚刚');
  });

  it('formats a valid ISO date string', () => {
    const result = formatDateTime('2026-05-18T14:30:00.000Z');
    // Result depends on timezone, just check format MM-DD HH:MM
    expect(result).toMatch(/^\d{2}-\d{2} \d{2}:\d{2}$/);
  });

  it('formats a specific date correctly (UTC)', () => {
    // Using a date where hours/minutes are unambiguous in local time
    const result = formatDateTime('2026-01-15T09:05:00.000Z');
    expect(result).toMatch(/^\d{2}-\d{2} \d{2}:\d{2}$/);
  });
});

describe('getMaintenanceTab', () => {
  it('maps FEEDING to feed', () => {
    expect(getMaintenanceTab('FEEDING')).toBe('feed');
  });

  it('maps WATER_CHANGE to water-change', () => {
    expect(getMaintenanceTab('WATER_CHANGE')).toBe('water-change');
  });

  it('maps Chinese feed type', () => {
    expect(getMaintenanceTab('喂食')).toBe('feed');
  });

  it('maps Chinese water change type', () => {
    expect(getMaintenanceTab('换水')).toBe('water-change');
  });

  it('maps lowercase feeding', () => {
    expect(getMaintenanceTab('feeding')).toBe('feed');
  });

  it('returns maintenance for unknown types', () => {
    expect(getMaintenanceTab('CLEANING')).toBe('maintenance');
  });

  it('returns maintenance for empty string', () => {
    expect(getMaintenanceTab('')).toBe('maintenance');
  });
});

describe('getMaintenanceLabel', () => {
  it('returns 喂食 for feed tab', () => {
    expect(getMaintenanceLabel('FEEDING')).toBe('喂食');
  });

  it('returns 换水 for water-change tab', () => {
    expect(getMaintenanceLabel('WATER_CHANGE')).toBe('换水');
  });

  it('returns type itself for maintenance types', () => {
    expect(getMaintenanceLabel('CLEANING')).toBe('CLEANING');
  });

  it('returns fallback for empty type', () => {
    expect(getMaintenanceLabel('')).toBe('维护');
  });
});

describe('compact', () => {
  it('joins non-empty strings with Chinese semicolon', () => {
    expect(compact(['a', 'b', 'c'])).toBe('a；b；c');
  });

  it('filters out undefined values', () => {
    expect(compact(['a', undefined, 'c'])).toBe('a；c');
  });

  it('returns empty string for all undefined', () => {
    expect(compact([undefined, undefined])).toBe('');
  });

  it('handles single element', () => {
    expect(compact(['only'])).toBe('only');
  });

  it('handles empty array', () => {
    expect(compact([])).toBe('');
  });

  it('filters out empty strings', () => {
    expect(compact(['a', '', 'c'])).toBe('a；c');
  });
});

describe('midpoint', () => {
  it('returns average of min and max', () => {
    expect(midpoint(20, 26)).toBe('23');
  });

  it('returns decimal average', () => {
    expect(midpoint(20, 25)).toBe('22.5');
  });

  it('returns fallback when min is undefined', () => {
    expect(midpoint(undefined, 26, 'fallback')).toBe('fallback');
  });

  it('returns fallback when max is undefined', () => {
    expect(midpoint(20, undefined, 'fallback')).toBe('fallback');
  });

  it('returns empty string when no fallback and missing params', () => {
    expect(midpoint(undefined, 26)).toBe('');
  });

  it('returns empty string when both undefined and no fallback', () => {
    expect(midpoint(undefined, undefined)).toBe('');
  });
});
