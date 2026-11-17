import {
  dateStringToPickerDate,
  formatEventWhen,
  formatDateLong,
  formatRange,
  formatTime,
  normalizeRange,
  dateToDateString,
  todayInZone,
} from '@/utils/date';

describe('date utils', () => {
  it.each([
    ['2026-11-21', 'Saturday, November 21, 2026'],
    ['2027-10-08', 'Friday, October 8, 2027'],
  ])('formats %s as "%s" without time zone shifts', (date, expected) => {
    expect(formatDateLong(date)).toBe(expected);
  });

  it.each([
    ['19:30', '7:30 PM'],
    ['23:45', '11:45 PM'],
    ['00:05', '12:05 AM'],
    ['12:00', '12:00 PM'],
  ])('formats the 24h time %s as %s', (time, expected) => {
    expect(formatTime(time)).toBe(expected);
  });

  it.each(['2026-11-01', '2027-03-14'])('round-trips the picker date %s', (date) => {
    expect(dateToDateString(dateStringToPickerDate(date))).toBe(date);
  });

  it.each([
    ['2026-11-16T02:00:00Z', '2026-11-15'],
    ['2026-11-16T06:00:00Z', '2026-11-16'],
  ])('computes "today" in the venue zone, not UTC (%s)', (instant, expected) => {
    expect(todayInZone('America/New_York', new Date(instant))).toBe(expected);
  });
});

describe('date range helpers', () => {
  it.each([
    ['2026-11-25', '2026-11-20', 'start', { start: '2026-11-25', end: '2026-11-25' }],
    ['2026-11-25', '2026-11-20', 'end', { start: '2026-11-20', end: '2026-11-20' }],
    ['2026-11-19', '2026-11-20', 'end', { start: '2026-11-19', end: '2026-11-20' }],
  ] as const)('normalizes %s to %s when the %s changes', (start, end, changed, expected) => {
    expect(normalizeRange({ start, end }, changed)).toEqual(expected);
  });

  it.each([
    ['2026-11-19', '2026-11-19', 'Thursday, November 19, 2026'],
    ['2026-11-19', '2026-11-24', 'Nov 19 – Nov 24'],
    ['2026-12-28', '2027-01-03', 'Dec 28, 2026 – Jan 3, 2027'],
  ])('formats the range %s to %s as "%s"', (start, end, expected) => {
    expect(formatRange({ start, end })).toBe(expected);
  });

  it.each([
    ['a single-day timed listing', { date: '2026-11-21', endDate: '2026-11-21', startTime: '19:30', allDay: false }, 'Sat, Nov 21 · 7:30 PM'],
    ['a multi-day all-day listing', { date: '2026-12-04', endDate: '2026-12-06', startTime: null, allDay: true }, 'Fri, Dec 4 – Sun, Dec 6 · All day'],
  ])('formats event times for %s', (_caseName, event, expected) => {
    expect(formatEventWhen(event)).toBe(expected);
  });
});
