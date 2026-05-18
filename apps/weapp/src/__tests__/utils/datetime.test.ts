import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formatDueAt } from '../../utils/datetime';

describe('formatDueAt', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-18T12:00:00.000Z'));
  });

  it('returns 待定 for undefined', () => {
    expect(formatDueAt(undefined)).toBe('待定');
  });

  it('returns 待定 for empty string', () => {
    expect(formatDueAt('')).toBe('待定');
  });

  it('returns the value itself for invalid date', () => {
    expect(formatDueAt('not-a-date')).toBe('not-a-date');
  });

  it('returns 今天 for past time', () => {
    expect(formatDueAt('2026-05-18T08:00:00.000Z')).toMatch(/^今天 \d{2}:\d{2}$/);
  });

  it('returns 今天 for past time on same day', () => {
    // fake now is 12:00 UTC; use 08:00 UTC which is in the past -> diffDays <= 0
    expect(formatDueAt('2026-05-18T08:00:00.000Z')).toMatch(/^今天 \d{2}:\d{2}$/);
  });

  it('returns 今天 for exact now', () => {
    expect(formatDueAt('2026-05-18T12:00:00.000Z')).toMatch(/^今天 \d{2}:\d{2}$/);
  });

  it('returns 明天 for next day', () => {
    const tomorrow = new Date('2026-05-19T12:00:00.000Z');
    expect(formatDueAt(tomorrow.toISOString())).toMatch(/^明天 \d{2}:\d{2}$/);
  });

  it('returns N天后 without time when showTime is false', () => {
    const future = new Date('2026-05-21T12:00:00.000Z');
    expect(formatDueAt(future.toISOString(), false)).toMatch(/^\d+天后$/);
  });

  it('returns N天后 with time when showTime is true', () => {
    const future = new Date('2026-05-21T12:00:00.000Z');
    expect(formatDueAt(future.toISOString(), true)).toMatch(/^\d+天后 \d{2}:\d{2}$/);
  });

  it('defaults to no time for future dates', () => {
    const future = new Date('2026-05-25T12:00:00.000Z');
    expect(formatDueAt(future.toISOString())).toMatch(/^\d+天后$/);
  });
});
