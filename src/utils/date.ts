import type { DateRange, DateString } from '@/types';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const padTwoDigits = (value: number) => String(value).padStart(2, '0');
const readPart = (parts: Intl.DateTimeFormatPart[], partType: string) =>
  Number(parts.find((part) => part.type === partType)?.value);

function toDateString(year: number, month: number, day: number): DateString {
  return `${year}-${padTwoDigits(month)}-${padTwoDigits(day)}`;
}

function parseDateString(date: DateString): { year: number; month: number; day: number } {
  const [year, month, day] = date.split('-').map(Number);
  return { year, month, day };
}

function weekdayIndex(date: DateString): number {
  const { year, month, day } = parseDateString(date);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function todayInZone(timeZone: string, now: Date = new Date()): DateString {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(now);
    const [year, month, day] = [readPart(parts, 'year'), readPart(parts, 'month'), readPart(parts, 'day')];
    if ([year, month, day].every(Number.isFinite)) return toDateString(year, month, day);
  } catch {
  }
  return dateToDateString(now);
}

export function nowInZone(timeZone: string, now: Date = new Date()): { date: DateString; time: string } {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(now);
    const [year, month, day, hour, minute] = [readPart(parts, 'year'), readPart(parts, 'month'), readPart(parts, 'day'), readPart(parts, 'hour') % 24, readPart(parts, 'minute')];
    if ([year, month, day, hour, minute].every(Number.isFinite)) {
      return { date: toDateString(year, month, day), time: `${padTwoDigits(hour)}:${padTwoDigits(minute)}` };
    }
  } catch {
  }
  return { date: dateToDateString(now), time: dateToTimeString(now) };
}

export function dateStringToPickerDate(date: DateString): Date {
  const { year, month, day } = parseDateString(date);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function dateToDateString(date: Date): DateString {
  return toDateString(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function dateToTimeString(date: Date): string {
  return `${padTwoDigits(date.getHours())}:${padTwoDigits(date.getMinutes())}`;
}

export function formatDateLong(date: DateString): string {
  const { year, month, day } = parseDateString(date);
  return `${WEEKDAYS[weekdayIndex(date)]}, ${MONTHS[month - 1]} ${day}, ${year}`;
}

export function formatDateMedium(date: DateString): string {
  const { month, day } = parseDateString(date);
  return `${WEEKDAYS[weekdayIndex(date)].slice(0, 3)}, ${MONTHS[month - 1].slice(0, 3)} ${day}`;
}

export function formatDateShort(date: DateString): string {
  const { month, day } = parseDateString(date);
  return `${MONTHS[month - 1].slice(0, 3)} ${day}`;
}

export function dateBadgeParts(date: DateString): { month: string; day: string } {
  const { month, day } = parseDateString(date);
  return { month: MONTHS[month - 1].slice(0, 3).toUpperCase(), day: String(day) };
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${padTwoDigits(minutes)} ${suffix}`;
}

const ZONE_LABELS: Record<string, string> = { 'America/New_York': 'ET' };

export function timeZoneLabel(timeZone: string): string {
  return ZONE_LABELS[timeZone] ?? timeZone;
}

export function isoToDateString(iso: string, timeZone: string): DateString {
  return todayInZone(timeZone, new Date(iso));
}

export function normalizeRange(range: DateRange, changed: 'start' | 'end'): DateRange {
  if (range.start <= range.end) return range;
  return changed === 'start' ? { start: range.start, end: range.start } : { start: range.end, end: range.end };
}

export function formatRange(range: DateRange): string {
  if (range.start === range.end) return formatDateLong(range.start);
  const { year: startYear } = parseDateString(range.start);
  const { year: endYear } = parseDateString(range.end);
  const end = startYear === endYear ? formatDateShort(range.end) : `${formatDateShort(range.end)}, ${endYear}`;
  return `${formatDateShort(range.start)}${startYear === endYear ? '' : `, ${startYear}`} – ${end}`;
}

export function formatEventWhen(event: {
  date: DateString;
  endDate: DateString;
  startTime: string | null;
  allDay: boolean;
}): string {
  const days =
    event.endDate !== event.date ? `${formatDateMedium(event.date)} – ${formatDateMedium(event.endDate)}` : formatDateMedium(event.date);
  const time = event.allDay || event.startTime === null ? 'All day' : formatTime(event.startTime);
  return `${days} · ${time}`;
}
