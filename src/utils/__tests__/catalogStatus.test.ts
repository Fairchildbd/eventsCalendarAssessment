import { formatUpdated, noDataMessage, statusMessage } from '@/utils/catalogStatus';
import type { CatalogEvent, CatalogState } from '@/types/catalog';

const events = [{ id: 'a' }] as unknown as CatalogEvent[];
const base: CatalogState = {
  events,
  updatedAt: 1_000_000,
  refreshing: false,
  error: null,
  liveEmpty: false,
};

describe('statusMessage', () => {
  it('is silent in the normal live state', () => {
    expect(statusMessage(base)).toBeNull();
  });

  it.each([
    ['offline', 'Unable to refresh. Showing the events loaded earlier.'],
    ['timeout', 'Refresh timed out. Showing the events loaded earlier.'],
    ['server', 'Events service unavailable. Showing the events loaded earlier.'],
    ['invalid', 'Received unexpected data. Showing the events loaded earlier.'],
  ] as const)('%s keeps the loaded events and offers retry', (kind, text) => {
    const message = statusMessage({ ...base, error: { kind, message: '' } });
    expect(message).toEqual({ tone: 'warning', text, action: 'Retry' });
  });

  it('leaves the "no data + error" case to the empty state', () => {
    expect(statusMessage({ ...base, events: [], error: { kind: 'offline', message: '' } })).toBeNull();
  });
});

describe('noDataMessage and formatUpdated', () => {
  it('describes each failure with try-again guidance', () => {
    expect(noDataMessage('offline').message).toBe('Connect to the internet and try again.');
    expect(noDataMessage('server', 503).message).toContain('HTTP 503');
    expect(noDataMessage('timeout').title).toBeTruthy();
    expect(noDataMessage('invalid').message).toMatch(/could not read/);
  });

  it.each([
    ['later the same day', new Date(2026, 10, 15, 18, 0), 'Updated 3:42 PM'],
    ['two days later', new Date(2026, 10, 17, 9, 0), 'Updated Nov 15, 3:42 PM'],
  ])('formats the last refresh time %s', (_caseName, now, expected) => {
    const updatedAt = new Date(2026, 10, 15, 15, 42).getTime();
    expect(formatUpdated(updatedAt, now.getTime())).toBe(expected);
  });
});
