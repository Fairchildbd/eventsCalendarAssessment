import type { CatalogErrorKind, CatalogState } from '@/types/catalog';
import { dateToDateString, dateToTimeString, formatDateShort, formatTime } from '@/utils/date';

export interface StatusMessage {
  tone: 'warning' | 'info';
  text: string;
  action: string | null;
}

export function statusMessage(state: CatalogState): StatusMessage | null {
  if (state.error) {
    if (state.events.length === 0) return null;
    const lead: Record<Exclude<CatalogErrorKind, 'aborted'>, string> = {
      offline: 'Unable to refresh.',
      timeout: 'Refresh timed out.',
      server: 'Events service unavailable.',
      invalid: 'Received unexpected data.',
    };
    const kind = state.error.kind === 'aborted' ? 'offline' : state.error.kind;
    return { tone: 'warning', text: `${lead[kind]} Showing the events loaded earlier.`, action: 'Retry' };
  }

  return null;
}

export function noDataMessage(kind: CatalogErrorKind, status?: number): { title: string; message: string } {
  switch (kind) {
    case 'timeout':
      return {
        title: 'Events are taking too long',
        message: 'The events service did not respond in time. Check your connection and try again.',
      };
    case 'server':
      return {
        title: 'Events service unavailable',
        message: `The events service returned an error${status ? ` (HTTP ${status})` : ''}. Try again shortly.`,
      };
    case 'invalid':
      return {
        title: 'Unexpected response',
        message: 'The events service returned data this app could not read.',
      };
    default:
      return {
        title: 'You appear to be offline',
        message: 'Connect to the internet and try again.',
      };
  }
}

export function formatUpdated(updatedAt: number, now: number): string {
  const updatedDate = new Date(updatedAt);
  const time = formatTime(dateToTimeString(updatedDate));
  const updatedDay = dateToDateString(updatedDate);
  return updatedDay === dateToDateString(new Date(now)) ? `Updated ${time}` : `Updated ${formatDateShort(updatedDay)}, ${time}`;
}
