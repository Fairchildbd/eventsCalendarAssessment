import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';

import { VENUE_TIME_ZONE } from '@/utils/demoEvents';
import { useEventCatalog } from '@/store/EventCatalogContext';
import type { DateString } from '@/types';
import type { CatalogEvent, EventFilters, FilterOptions } from '@/types/catalog';
import { todayInZone } from '@/utils/date';
import {
  NO_FILTERS,
  applyEventFilters,
  countActiveFilters,
  deriveFilterOptions,
  filtersEqual,
} from '@/utils/eventFilters';

interface EventFiltersValue {
  today: DateString;
  filters: EventFilters;
  activeCount: number;
  applyFilters: (next: EventFilters) => void;
  clearAll: () => void;
  events: CatalogEvent[];
  totalUpcoming: number;
  options: FilterOptions;
  featured: CatalogEvent[];
}

const EventFiltersContext = createContext<EventFiltersValue | null>(null);

const MAX_FEATURED = 5;
const DAY_CHECK_MS = 60_000;

function useVenueToday(): DateString {
  const [today, setToday] = useState<DateString>(() => todayInZone(VENUE_TIME_ZONE));
  useEffect(() => {
    const update = () => setToday(todayInZone(VENUE_TIME_ZONE));
    update();
    const sub = AppState.addEventListener('change', (appState) => {
      if (appState === 'active') update();
    });
    const timer = setInterval(update, DAY_CHECK_MS);
    return () => {
      sub.remove();
      clearInterval(timer);
    };
  }, []);
  return today;
}

export function EventFiltersProvider({ children }: { children: ReactNode }) {
  const { state } = useEventCatalog();
  const [filters, setFilters] = useState<EventFilters>(NO_FILTERS);
  const today = useVenueToday();

  const events = useMemo(
    () => applyEventFilters(state.events, filters, today),
    [state.events, filters, today],
  );
  const totalUpcoming = useMemo(
    () => applyEventFilters(state.events, NO_FILTERS, today).length,
    [state.events, today],
  );
  const options = useMemo(() => deriveFilterOptions(state.events, today), [state.events, today]);
  const featured = useMemo(() => {
    const seen = new Set<string>();
    const out: CatalogEvent[] = [];
    for (const event of applyEventFilters(state.events, NO_FILTERS, today)) {
      if (!event.featured || event.contentType !== 'event' || seen.has(event.sourceId)) continue;
      seen.add(event.sourceId);
      out.push(event);
      if (out.length === MAX_FEATURED) break;
    }
    return out;
  }, [state.events, today]);

  const applyFilters = useCallback(
    (next: EventFilters) => setFilters((cur) => (filtersEqual(cur, next) ? cur : next)),
    [],
  );
  const clearAll = useCallback(() => setFilters((cur) => (filtersEqual(cur, NO_FILTERS) ? cur : NO_FILTERS)), []);

  const value = useMemo(
    () => ({
      today,
      filters,
      activeCount: countActiveFilters(filters),
      applyFilters,
      clearAll,
      events,
      totalUpcoming,
      options,
      featured,
    }),
    [today, filters, applyFilters, clearAll, events, totalUpcoming, options, featured],
  );

  return <EventFiltersContext.Provider value={value}>{children}</EventFiltersContext.Provider>;
}

export function useEventFilters(): EventFiltersValue {
  const ctx = useContext(EventFiltersContext);
  if (!ctx) throw new Error('useEventFilters must be used within EventFiltersProvider');
  return ctx;
}
