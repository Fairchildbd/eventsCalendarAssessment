import type { DateRange, DateString } from '@/types';

export type ContentType = 'event' | 'promotion';
export type ContentFilter = 'all' | ContentType;

export interface Facet {
  id: string;
  label: string;
}

export interface CatalogEvent {
  id: string;
  sourceId: string;
  title: string;
  contentType: ContentType;
  category: Facet | null;
  eventTypes: Facet[];
  promoCategories: Facet[];
  venue: Facet | null;
  date: DateString;
  endDate: DateString;
  startTime: string | null;
  allDay: boolean;
  timeZone: string;
  thumbnailUrl?: string;
  bannerUrl?: string;
  description: string;
  sourceUrl?: string;
  featured: boolean;
}

export interface EventFilters {
  searchQuery: string;
  range: DateRange | null;
  venueId: string | null;
  typeId: string | null;
  categoryId: string | null;
  content: ContentFilter;
}

export interface FacetOption extends Facet {
  count: number;
}

export interface FilterOptions {
  venues: FacetOption[];
  types: FacetOption[];
  categories: FacetOption[];
}

export type CatalogErrorKind = 'offline' | 'timeout' | 'server' | 'invalid' | 'aborted';

export interface CatalogError {
  kind: CatalogErrorKind;
  message: string;
  status?: number;
}

export interface CatalogState {
  events: CatalogEvent[];
  updatedAt: number | null;
  refreshing: boolean;
  error: CatalogError | null;
  liveEmpty: boolean;
}
