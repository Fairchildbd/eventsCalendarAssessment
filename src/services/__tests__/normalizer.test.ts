import { InvalidResponseError, encodeOnce, isTrustedLinkHost, normalizeEventSearch } from '../eventNormalizer';
import { TODAY, inst, rawEvent, rawResponse, tag } from '../__fixtures__/fixtures';

describe('normalizeEventSearch', () => {
  it('expands events x instances into one record per performance, sorted', () => {
    const { events, dropped } = normalizeEventSearch(rawResponse(), TODAY);
    expect(dropped).toBe(0);
    expect(events.map((event) => [event.title, event.date, event.startTime])).toEqual([
      ['Metallica', '2026-11-19', '19:30'],
      ['Poker Night', '2026-11-20', '16:00'],
      ['Metallica', '2026-11-21', '19:30'],
      ['Comedy Show', '2026-11-25', '20:00'],
    ]);
  });

  it('keeps separate stable ids for multiple performances of one event', () => {
    const { events } = normalizeEventSearch(rawResponse(), TODAY);
    const metallica = events.filter((event) => event.sourceId === 'evt1');
    expect(metallica).toHaveLength(2);
    expect(new Set(metallica.map((event) => event.id)).size).toBe(2);
    expect(normalizeEventSearch(rawResponse(), TODAY).events.map((event) => event.id)).toEqual(events.map((event) => event.id));
  });

  it('maps source fields without inventing any', () => {
    const [met] = normalizeEventSearch(rawResponse(), TODAY).events;
    expect(met.contentType).toBe('event');
    expect(met.category).toEqual({ id: 'rock', label: 'Rock' });
    expect(met.eventTypes.map((facet) => facet.label)).toEqual(['Rock', 'Pop']);
    expect(met.venue).toEqual({ id: 'mohegan-sun-arena', label: 'Mohegan Sun Arena' });
    expect(met.featured).toBe(true);
    expect(met.description).toBe('');
    expect(met.timeZone).toBe('America/New_York');
    expect(met.thumbnailUrl).toBe('https://mohegansun.com/content/dam/mohegansun/Images/metallica%20thumb.jpg');
    expect(met.bannerUrl).toBe('https://mohegansun.com/content/dam/mohegansun/Images/metallica-hero.jpg');
    expect(met.sourceUrl).toBe('https://mohegansun.com/events-and-promotions/schedule-of-events/metallica.html');
  });

  it('classifies promotions from displayType and reads promo categories', () => {
    const poker = normalizeEventSearch(rawResponse(), TODAY).events.find((event) => event.title === 'Poker Night')!;
    expect(poker.contentType).toBe('promotion');
    expect(poker.promoCategories).toEqual([{ id: 'poker', label: 'Poker' }]);
    expect(poker.category).toBeNull();
    expect(poker.venue).toBeNull();
  });

  it('falls back to the source location text only when there is no venue tag', () => {
    const raw = rawResponse({
      events: [rawEvent({ id: 'evt9', title: 'Pop-up', cqTags: [], location: 'The Lansdowne Pub' })],
      eventInstances: [inst('evt9', '2026-12-01T20:00:00')],
    });
    const event = normalizeEventSearch(raw, TODAY).events.find((candidate) => candidate.sourceId === 'evt9')!;
    expect(event.venue).toEqual({ id: 'the-lansdowne-pub', label: 'The Lansdowne Pub' });
  });

  it('handles all-day and multi-day instances', () => {
    const raw = rawResponse({
      events: [rawEvent({ id: 'expo', title: 'Expo', cqTags: [tag('venue/expo-center', 'Expo Center')] })],
      eventInstances: [inst('expo', '2026-12-04T00:00:00', { allDay: true, end: '2026-12-06T00:00:00' })],
    });
    const event = normalizeEventSearch(raw, TODAY).events.find((candidate) => candidate.sourceId === 'expo')!;
    expect(event.allDay).toBe(true);
    expect(event.startTime).toBeNull();
    expect([event.date, event.endDate]).toEqual(['2026-12-04', '2026-12-06']);
  });

  it('deduplicates the same performance listed twice', () => {
    const raw = rawResponse({ eventInstances: [inst('evt1', '2026-11-19T19:30:00'), inst('evt1', '2026-11-19T19:30:00')] });
    const events = normalizeEventSearch(raw, TODAY).events.filter((event) => event.sourceId === 'evt1');
    expect(events).toHaveLength(2);
  });

  it('drops ended performances and ongoing placeholder listings', () => {
    const raw = rawResponse({
      events: [rawEvent({ id: 'old', title: 'Old' }), rawEvent({ id: 'on', title: 'Ongoing', ongoing: true })],
      eventInstances: [inst('old', '2026-11-01T20:00:00'), inst('on', '2025-01-01T00:00:00', { allDay: true })],
    });
    const titles = normalizeEventSearch(raw, TODAY).events.map((event) => event.title);
    expect(titles).not.toContain('Old');
    expect(titles).not.toContain('Ongoing');
  });

  it('keeps a multi-day event already in progress', () => {
    const raw = rawResponse({
      events: [rawEvent({ id: 'run', title: 'Running' })],
      eventInstances: [inst('run', '2026-11-13T10:00:00', { end: '2026-11-16T10:00:00' })],
    });
    expect(normalizeEventSearch(raw, TODAY).events.some((event) => event.title === 'Running')).toBe(true);
  });
});

describe('malformed data', () => {
  it.each([
    ['null', null],
    ['array', []],
    ['string', 'nope'],
    ['missing arrays', { success: true }],
    ['events not array', { events: {}, eventInstances: [] }],
    ['explicit failure', { success: false, events: [], eventInstances: [] }],
  ])('rejects %s', (_name, payload) => {
    expect(() => normalizeEventSearch(payload, TODAY)).toThrow(InvalidResponseError);
  });

  it('skips individual bad records but keeps good ones, counting what it dropped', () => {
    const raw = rawResponse({
      events: [{ id: 5 }, null, rawEvent({ id: 'notitle', title: '  ' })],
      eventInstances: [
        null,
        { eventRef: 'evt1' },
        inst('missing-event', '2026-11-20T10:00:00'),
        inst('evt1', 'garbage'),
      ],
    });
    const result = normalizeEventSearch(raw, TODAY);
    expect(result.events).toHaveLength(4);
    expect(result.dropped).toBeGreaterThanOrEqual(6);
  });

  it('treats a payload where nothing is usable as invalid, not as an empty schedule', () => {
    const raw = { success: true, events: [{ id: 1 }], eventInstances: [{ nope: true }] };
    expect(() => normalizeEventSearch(raw, TODAY)).toThrow(InvalidResponseError);
  });

  it('a genuinely empty response is a valid, empty result', () => {
    const result = normalizeEventSearch({ success: true, events: [], eventInstances: [] }, TODAY);
    expect(result.events).toEqual([]);
  });
});

describe('URL handling', () => {
  it('does not double-encode already-encoded URLs, and encodes raw spaces once', () => {
    expect(encodeOnce('https://mohegansun.com/dam/My%20Image.jpg')).toBe('https://mohegansun.com/dam/My%20Image.jpg');
    expect(encodeOnce('https://mohegansun.com/dam/My Image.jpg')).toBe('https://mohegansun.com/dam/My%20Image.jpg');
    expect(encodeOnce('https://mohegansun.com/a%20b c.jpg')).toBe('https://mohegansun.com/a%20b%20c.jpg');
    expect(encodeOnce('https://mohegansun.com/100%.jpg')).toBe('https://mohegansun.com/100%25.jpg');
  });

  it('only links to first-party https hosts', () => {
    expect(isTrustedLinkHost('https://mohegansun.com/x')).toBe(true);
    expect(isTrustedLinkHost('https://www.mohegansun.com/x')).toBe(true);
    expect(isTrustedLinkHost('http://mohegansun.com/x')).toBe(false);
    expect(isTrustedLinkHost('https://evilmohegansun.com/x')).toBe(false);
    expect(isTrustedLinkHost('https://mohegansun.com.evil.test/x')).toBe(false);
    expect(isTrustedLinkHost('https://mohegansun.com@evil.test/x')).toBe(false);
    expect(isTrustedLinkHost('javascript:alert(1)')).toBe(false);
  });
});

describe('malformed feed text', () => {
  it('drops a field encodeURI cannot handle (lone surrogate) without failing the whole feed', () => {
    const raw = rawResponse({
      events: [rawEvent({ id: 'evt1', imageLink: '/content/dam/bad\uD800.jpg' }), rawEvent({ id: 'evt2', title: 'Good' })],
      eventInstances: [inst('evt1', '2026-11-19T19:30:00-05:00'), inst('evt2', '2026-11-20T19:30:00-05:00')],
    });
    const { events } = normalizeEventSearch(raw, TODAY);
    const bad = events.find((event) => event.sourceId === 'evt1')!;
    expect(bad.thumbnailUrl).toBeUndefined();
    expect(events.some((event) => event.sourceId === 'evt2')).toBe(true);
  });
});
