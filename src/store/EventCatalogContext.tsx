import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { EVENTS_API_URL, REQUEST_TIMEOUT_MS } from '@/utils/apiConfig';
import { VENUE_TIME_ZONE } from '@/utils/demoEvents';
import { fetchEvents, type FetchEventsResult } from '@/services/fetchEvents';
import type { CatalogEvent, CatalogState } from '@/types/catalog';
import { todayInZone } from '@/utils/date';

interface CatalogValue {
  state: CatalogState;
  refresh: () => Promise<void>;
  getEvent: (id: string | undefined) => CatalogEvent | undefined;
}

const CatalogContext = createContext<CatalogValue | null>(null);

const loadingState: CatalogState = {
  events: [],
  updatedAt: null,
  refreshing: true,
  error: null,
  liveEmpty: false,
};

const stateAfterFetch = (current: CatalogState, result: FetchEventsResult): CatalogState =>
  result.ok
    ? { events: result.events, updatedAt: Date.now(), refreshing: false, error: null, liveEmpty: result.empty }
    : { ...current, refreshing: false, error: result.error };

export function EventCatalogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CatalogState>(loadingState);
  const activeRequest = useRef<AbortController | null>(null);

  const startRequest = useCallback(() => {
    activeRequest.current?.abort();
    const request = new AbortController();
    activeRequest.current = request;
    return request;
  }, []);

  const requestEvents = useCallback(
    (request: AbortController) =>
      fetchEvents({
        url: EVENTS_API_URL,
        timeoutMs: REQUEST_TIMEOUT_MS,
        today: todayInZone(VENUE_TIME_ZONE),
        signal: request.signal,
      }),
    [],
  );

  const refresh = useCallback(async () => {
    const request = startRequest();
    setState((current) => ({ ...current, refreshing: true }));
    const result = await requestEvents(request);
    if (!request.signal.aborted) setState((current) => stateAfterFetch(current, result));
  }, [startRequest, requestEvents]);

  useEffect(() => {
    const request = startRequest();
    void requestEvents(request).then((result) => {
      if (!request.signal.aborted) setState((current) => stateAfterFetch(current, result));
    });
    return () => request.abort();
  }, [startRequest, requestEvents]);

  const getEvent = useCallback(
    (id: string | undefined) => (id ? state.events.find((event) => event.id === id) : undefined),
    [state.events],
  );

  const value = useMemo(
    () => ({ state, refresh, getEvent }),
    [state, refresh, getEvent],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useEventCatalog(): CatalogValue {
  const catalogValue = useContext(CatalogContext);
  if (!catalogValue) throw new Error('useEventCatalog must be used within EventCatalogProvider');
  return catalogValue;
}
