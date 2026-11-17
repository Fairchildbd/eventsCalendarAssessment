import type { DateString } from '@/types';
import { formatRange } from '@/utils/date';
import type { CatalogEvent, EventFilters, Facet, FacetOption, FilterOptions } from '@/types/catalog';

export const isSportsEvent = (event: CatalogEvent) =>
  event.eventTypes.some((facet) => facet.id === 'sports' || facet.id === 'sports-entertainment');

export const NO_FILTERS: EventFilters = {
  searchQuery: '',
  range: null,
  venueId: null,
  typeId: null,
  categoryId: null,
  content: 'all',
};

export function normalizeQuery(query: string): string {
  return query.trim().replace(/\s+/g, ' ');
}

function matchesQuery(event: CatalogEvent, query: string): boolean {
  const normalizedQuery = normalizeQuery(query).toLowerCase();
  if (!normalizedQuery) return true;
  const haystack = [
    event.title,
    event.venue?.label,
    event.category?.label,
    ...event.eventTypes.map((facet) => facet.label),
    ...event.promoCategories.map((facet) => facet.label),
    event.description,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return normalizedQuery.split(' ').every((token) => haystack.includes(token));
}

export function countActiveFilters(filters: EventFilters): number {
  return (
    (normalizeQuery(filters.searchQuery) ? 1 : 0) +
    (filters.range ? 1 : 0) +
    (filters.venueId ? 1 : 0) +
    (filters.typeId ? 1 : 0) +
    (filters.categoryId ? 1 : 0) +
    (filters.content !== 'all' ? 1 : 0)
  );
}

export function applyEventFilters(
  events: readonly CatalogEvent[],
  filters: EventFilters,
  today: DateString,
): CatalogEvent[] {
  return events.filter((event) => {
    if (event.endDate < today) return false;
    if (filters.range && !(event.date <= filters.range.end && event.endDate >= filters.range.start)) return false;
    if (filters.content !== 'all' && event.contentType !== filters.content) return false;
    if (!matchesQuery(event, filters.searchQuery)) return false;
    if (filters.venueId && event.venue?.id !== filters.venueId) return false;
    if (filters.typeId && !event.eventTypes.some((facet) => facet.id === filters.typeId)) return false;
    if (
      filters.categoryId &&
      event.category?.id !== filters.categoryId &&
      !event.promoCategories.some((facet) => facet.id === filters.categoryId)
    ) {
      return false;
    }
    return true;
  });
}

function tally(map: Map<string, FacetOption>, facet: Facet | null | undefined) {
  if (!facet) return;
  const existing = map.get(facet.id);
  if (existing) existing.count += 1;
  else map.set(facet.id, { ...facet, count: 1 });
}

const byLabel = (firstOption: FacetOption, secondOption: FacetOption) => firstOption.label.localeCompare(secondOption.label);

export function deriveFilterOptions(events: readonly CatalogEvent[], today: DateString): FilterOptions {
  const venues = new Map<string, FacetOption>();
  const types = new Map<string, FacetOption>();
  const categories = new Map<string, FacetOption>();
  for (const event of events) {
    if (event.endDate < today) continue;
    tally(venues, event.venue);
    event.eventTypes.forEach((facet) => tally(types, facet));
    tally(categories, event.category);
    event.promoCategories.forEach((facet) => {
      if (facet.id !== event.category?.id) tally(categories, facet);
    });
  }
  return {
    venues: [...venues.values()].sort(byLabel),
    types: [...types.values()].sort(byLabel),
    categories: [...categories.values()].sort(byLabel),
  };
}

export type FilterKey = 'query' | 'range' | 'venue' | 'type' | 'category' | 'content';

export interface ActiveChip {
  key: FilterKey;
  label: string;
}

export function filtersEqual(firstFilters: EventFilters, secondFilters: EventFilters): boolean {
  return (
    normalizeQuery(firstFilters.searchQuery) === normalizeQuery(secondFilters.searchQuery) &&
    firstFilters.venueId === secondFilters.venueId &&
    firstFilters.typeId === secondFilters.typeId &&
    firstFilters.categoryId === secondFilters.categoryId &&
    firstFilters.content === secondFilters.content &&
    firstFilters.range?.start === secondFilters.range?.start &&
    firstFilters.range?.end === secondFilters.range?.end
  );
}

const labelFor = (list: FacetOption[], id: string) => list.find((option) => option.id === id)?.label ?? id;

export function buildActiveChips(filters: EventFilters, options: FilterOptions): ActiveChip[] {
  const chips: ActiveChip[] = [];
  const normalizedQuery = normalizeQuery(filters.searchQuery);
  if (normalizedQuery) chips.push({ key: 'query', label: `“${normalizedQuery}”` });
  if (filters.range) chips.push({ key: 'range', label: formatRange(filters.range) });
  if (filters.venueId) chips.push({ key: 'venue', label: labelFor(options.venues, filters.venueId) });
  if (filters.typeId) chips.push({ key: 'type', label: labelFor(options.types, filters.typeId) });
  if (filters.categoryId) chips.push({ key: 'category', label: labelFor(options.categories, filters.categoryId) });
  if (filters.content !== 'all') chips.push({ key: 'content', label: filters.content === 'event' ? 'Events' : 'Promotions' });
  return chips;
}

export function removeFilter(filters: EventFilters, key: FilterKey): EventFilters {
  switch (key) {
    case 'query':
      return { ...filters, searchQuery: '' };
    case 'range':
      return { ...filters, range: null };
    case 'venue':
      return { ...filters, venueId: null };
    case 'type':
      return { ...filters, typeId: null };
    case 'category':
      return { ...filters, categoryId: null };
    case 'content':
      return { ...filters, content: 'all' };
  }
}

export function isFilterBarScrolledPast(scrollY: number, barBottom: number, slack = 8): boolean {
  return scrollY > barBottom - slack;
}
