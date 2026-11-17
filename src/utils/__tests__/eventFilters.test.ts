import { normalizeEventSearch } from '@/services/eventNormalizer';
import { TODAY, inst, rawEvent, rawResponse, tag } from '@/services/__fixtures__/fixtures';
import {
  NO_FILTERS,
  applyEventFilters,
  buildActiveChips,
  countActiveFilters,
  deriveFilterOptions,
  filtersEqual,
  isFilterBarScrolledPast,
  normalizeQuery,
  removeFilter,
} from '@/utils/eventFilters';
import type { EventFilters } from '@/types/catalog';

const live = normalizeEventSearch(
  rawResponse({
    events: [rawEvent({ id: 'wolf', title: 'Wolf Rock', cqTags: [tag('venue/wolf-den', 'Wolf Den'), tag('event/entertaintment/rock', 'Rock')], category: 'Rock', location: 'Wolf Den' })],
    eventInstances: [inst('wolf', '2026-11-21T21:00:00')],
  }),
  TODAY,
).events;

const buildFilters = (over: Partial<EventFilters>): EventFilters => ({ ...NO_FILTERS, ...over });
const titles = (list: ReturnType<typeof applyEventFilters>) => list.map((event) => `${event.title}@${event.date}`);

describe('combined filters', () => {
  it('no filters returns every upcoming listing', () => {
    expect(applyEventFilters(live, NO_FILTERS, TODAY)).toHaveLength(live.length);
  });

  it('venue + type must both match', () => {
    const out = applyEventFilters(live, buildFilters({ venueId: 'wolf-den', typeId: 'rock' }), TODAY);
    expect(titles(out)).toEqual(['Wolf Rock@2026-11-21']);
    expect(applyEventFilters(live, buildFilters({ venueId: 'wolf-den', typeId: 'comedy' }), TODAY)).toEqual([]);
  });

  it('content type separates events from promotions', () => {
    expect(applyEventFilters(live, buildFilters({ content: 'promotion' }), TODAY).map((event) => event.title)).toEqual(['Poker Night']);
    expect(applyEventFilters(live, buildFilters({ content: 'event' }), TODAY).every((event) => event.contentType === 'event')).toBe(true);
  });

  it('category matches an event category or a promotion category', () => {
    expect(applyEventFilters(live, buildFilters({ categoryId: 'poker' }), TODAY).map((event) => event.title)).toEqual(['Poker Night']);
    expect(applyEventFilters(live, buildFilters({ categoryId: 'comedy' }), TODAY).map((event) => event.title)).toEqual(['Comedy Show']);
  });

  it('type matches any of an event\'s several type tags', () => {
    const pop = applyEventFilters(live, buildFilters({ typeId: 'pop' }), TODAY);
    expect(pop.every((event) => event.title === 'Metallica' || event.title === 'Wolf Rock')).toBe(true);
    expect(pop.length).toBeGreaterThan(0);
  });

  it('range + venue + type + content all apply together', () => {
    const range = { start: '2026-11-19', end: '2026-11-21' };
    const out = applyEventFilters(live, buildFilters({ range, venueId: 'mohegan-sun-arena', typeId: 'rock', content: 'event' }), TODAY);
    expect(titles(out)).toEqual(['Metallica@2026-11-19', 'Metallica@2026-11-21']);
    const narrower = applyEventFilters(live, buildFilters({ range: { start: '2026-11-20', end: '2026-11-20' }, venueId: 'mohegan-sun-arena' }), TODAY);
    expect(narrower).toEqual([]);
  });
});

describe('date range', () => {
  it('is inclusive at both ends', () => {
    const edge = applyEventFilters(live, buildFilters({ range: { start: '2026-11-19', end: '2026-11-21' } }), TODAY);
    expect(edge.map((event) => event.date)).toEqual(['2026-11-19', '2026-11-20', '2026-11-21', '2026-11-21']);
    expect(applyEventFilters(live, buildFilters({ range: { start: '2026-11-20', end: '2026-11-20' } }), TODAY).map((event) => event.title)).toEqual(['Poker Night']);
  });

  it('includes multi-day listings that overlap the range', () => {
    const multi = normalizeEventSearch(
      rawResponse({ events: [rawEvent({ id: 'x', title: 'Expo' })], eventInstances: [inst('x', '2026-12-04T00:00:00', { allDay: true, end: '2026-12-06T00:00:00' })] }),
      TODAY,
    ).events;
    const hit = (start: string, end: string) => applyEventFilters(multi, buildFilters({ range: { start, end } }), TODAY).some((event) => event.title === 'Expo');
    expect(hit('2026-12-05', '2026-12-05')).toBe(true);
    expect(hit('2026-12-06', '2026-12-09')).toBe(true);
    expect(hit('2026-12-07', '2026-12-09')).toBe(false);
  });

  it('clearing the range restores every upcoming listing', () => {
    const narrowed = applyEventFilters(live, buildFilters({ range: { start: '2026-11-25', end: '2026-11-25' } }), TODAY);
    expect(narrowed).toHaveLength(1);
    expect(applyEventFilters(live, buildFilters({ range: null }), TODAY)).toHaveLength(live.length);
  });

  it('never returns listings that already ended', () => {
    expect(applyEventFilters(live, buildFilters({ range: { start: '2026-01-01', end: '2027-01-01' } }), '2026-11-22').every((event) => event.endDate >= '2026-11-22')).toBe(true);
  });
});

describe('options and active filters', () => {
  it('derives venues, types and categories from the dataset only', () => {
    const options = deriveFilterOptions(live, TODAY);
    expect(options.venues.map((option) => option.label)).toEqual(['Comix Comedy Club', 'Mohegan Sun Arena', 'Wolf Den']);
    expect(options.types.map((option) => option.label)).toEqual(['Comedy', 'Pop', 'Rock']);
    expect(options.categories.map((option) => option.label)).toEqual(['Comedy', 'Poker', 'Rock']);
    expect(options.venues.find((option) => option.id === 'mohegan-sun-arena')?.count).toBe(2);
  });

  it('counts active filters', () => {
    expect(countActiveFilters(NO_FILTERS)).toBe(0);
    expect(countActiveFilters(buildFilters({ venueId: 'x', content: 'event', range: { start: 'a', end: 'b' } }))).toBe(3);
  });
});

describe('active chips, removal and apply semantics', () => {
  const opts = deriveFilterOptions(live, TODAY);
  const all = buildFilters({
    range: { start: '2026-11-19', end: '2026-11-25' },
    venueId: 'mohegan-sun-arena',
    typeId: 'rock',
    categoryId: 'poker',
    content: 'event',
  });

  it('builds one labelled chip per active filter, in a stable order', () => {
    expect(buildActiveChips(NO_FILTERS, opts)).toEqual([]);
    expect(buildActiveChips(all, opts)).toEqual([
      { key: 'range', label: 'Nov 19 – Nov 25' },
      { key: 'venue', label: 'Mohegan Sun Arena' },
      { key: 'type', label: 'Rock' },
      { key: 'category', label: 'Poker' },
      { key: 'content', label: 'Events' },
    ]);
    expect(buildActiveChips(buildFilters({ content: 'promotion' }), opts)).toEqual([{ key: 'content', label: 'Promotions' }]);
  });

  it('removing a chip clears only that filter', () => {
    const next = removeFilter(all, 'venue');
    expect(next.venueId).toBeNull();
    expect(next).toEqual({ ...all, venueId: null });
    expect(removeFilter(all, 'range').range).toBeNull();
    expect(removeFilter(all, 'content').content).toBe('all');
    expect(countActiveFilters(removeFilter(removeFilter(all, 'type'), 'category'))).toBe(3);
    expect(all.venueId).toBe('mohegan-sun-arena');
  });

  it('filtersEqual detects an unchanged draft (so Apply can be a no-op)', () => {
    expect(filtersEqual(all, { ...all, range: { ...all.range! } })).toBe(true);
    expect(filtersEqual(NO_FILTERS, { ...NO_FILTERS })).toBe(true);
    expect(filtersEqual(all, removeFilter(all, 'type'))).toBe(false);
    expect(filtersEqual(all, { ...all, range: { start: '2026-11-19', end: '2026-11-26' } })).toBe(false);
    expect(filtersEqual(buildFilters({ range: null }), buildFilters({ range: { start: 'a', end: 'b' } }))).toBe(false);
  });

  it('a draft can be evaluated without being applied', () => {
    const applied = buildFilters({ venueId: 'wolf-den' });
    const draft = buildFilters({ venueId: 'mohegan-sun-arena' });
    const before = applyEventFilters(live, applied, TODAY);
    const preview = applyEventFilters(live, draft, TODAY);
    expect(preview.length).not.toBe(before.length);
    expect(applyEventFilters(live, applied, TODAY)).toEqual(before);
  });
});

describe('header filter button visibility', () => {
  it.each([
    ['at the top', 0, 1200, false],
    ['partway down', 600, 1200, false],
    ['just before the bar leaves the screen', 1192, 1200, false],
    ['once the bar has scrolled out of view', 1193, 1200, true],
    ['far down the list', 5000, 1200, true],
    ['before the bar has been measured', 9999, Number.POSITIVE_INFINITY, false],
    ['pulled down past the top (pull-to-refresh overscroll)', -80, 1200, false],
  ])('is hidden or shown correctly %s', (_caseName, scrollOffset, barBottom, expectedVisible) => {
    expect(isFilterBarScrolledPast(scrollOffset, barBottom)).toBe(expectedVisible);
  });
});

describe('search', () => {
  const titles2 = (query: string, over: Partial<EventFilters> = {}) =>
    applyEventFilters(live, buildFilters({ searchQuery: query, ...over }), TODAY).map((event) => event.title);

  it.each([
    ['the title', 'metallica', ['Metallica', 'Metallica']],
    ['the title, case-insensitively', 'METALLICA', ['Metallica', 'Metallica']],
    ['part of a title', 'comed', ['Comedy Show']],
    ['the venue', 'wolf den', ['Wolf Rock']],
    ['another venue', 'comix', ['Comedy Show']],
    ['the category', 'poker', ['Poker Night']],
    ['every word, in any order', 'rock wolf', ['Wolf Rock']],
    ['nothing when one word has no match', 'wolf metallica', []],
    ['nothing for text that matches no listing', 'zzzz-no-such-event', []],
    ['text with surrounding whitespace', '   metallica   ', ['Metallica', 'Metallica']],
    ['text with repeated whitespace', 'wolf    den', ['Wolf Rock']],
  ])('matches %s ("%s")', (_caseName, query, expectedTitles) => {
    expect(titles2(query)).toEqual(expectedTitles);
  });

  it('matches type labels too', () => {
    expect(titles2('pop').length).toBeGreaterThan(0);
  });

  it('treats a blank query as no search', () => {
    expect(titles2('   ')).toHaveLength(applyEventFilters(live, NO_FILTERS, TODAY).length);
    expect(normalizeQuery('  a   b ')).toBe('a b');
  });

  it.each([
    ['a venue that matches', 'rock', { venueId: 'wolf-den' }, ['Wolf Rock']],
    ['a venue that does not match', 'rock', { venueId: 'comix-comedy-club' }, []],
    ['a date range', 'metallica', { range: { start: '2026-11-21', end: '2026-11-21' } }, ['Metallica']],
    ['the event content type', 'poker', { content: 'event' }, []],
    ['the promotion content type', 'poker', { content: 'promotion' }, ['Poker Night']],
  ] as const)('combines with %s', (_caseName, query, otherFilters, expectedTitles) => {
    expect(titles2(query, otherFilters)).toEqual(expectedTitles);
  });

  it('counts as one active filter only when non-blank, and shows as a removable chip', () => {
    expect(countActiveFilters(buildFilters({ searchQuery: 'metallica' }))).toBe(1);
    expect(countActiveFilters(buildFilters({ searchQuery: '   ' }))).toBe(0);
    const chips = buildActiveChips(buildFilters({ searchQuery: ' wolf  den ', venueId: 'wolf-den' }), deriveFilterOptions(live, TODAY));
    expect(chips[0]).toEqual({ key: 'query', label: '“wolf den”' });
    expect(removeFilter(buildFilters({ searchQuery: 'wolf', typeId: 'rock' }), 'query')).toEqual(buildFilters({ searchQuery: '', typeId: 'rock' }));
  });

  it.each([
    ['equivalent queries', 'wolf den', '  wolf   den ', true],
    ['different queries', 'wolf', 'den', false],
    ['a blank query and no filters', '', '', true],
  ])('compares %s so Apply stays a no-op when nothing changed', (_caseName, firstQuery, secondQuery, expectedEqual) => {
    expect(filtersEqual(buildFilters({ searchQuery: firstQuery }), buildFilters({ searchQuery: secondQuery }))).toBe(expectedEqual);
  });
});
