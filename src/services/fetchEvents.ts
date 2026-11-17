import { EVENTS_API_BRAND } from '@/utils/apiConfig';
import type { DateString } from '@/types';
import type { CatalogError, CatalogEvent } from '@/types/catalog';
import { InvalidResponseError, normalizeEventSearch } from './eventNormalizer';

interface FetchEventsOptions {
  url: string;
  timeoutMs: number;
  today: DateString;
  signal?: AbortSignal;
  fetchFn?: typeof fetch;
}

export type FetchEventsResult =
  | { ok: true; events: CatalogEvent[]; empty: boolean; dropped: number }
  | { ok: false; error: CatalogError };

const failure = (kind: CatalogError['kind'], message: string, status?: number): FetchEventsResult => ({
  ok: false,
  error: { kind, message, ...(status !== undefined ? { status } : {}) },
});

export async function fetchEvents({ url, timeoutMs, today, signal, fetchFn = fetch }: FetchEventsOptions): Promise<FetchEventsResult> {
  const request = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    request.abort();
  }, timeoutMs);
  const cancelRequest = () => request.abort();
  if (signal?.aborted) cancelRequest();
  signal?.addEventListener('abort', cancelRequest);

  const failUnlessInterrupted = (kind: CatalogError['kind'], message: string): FetchEventsResult => {
    if (timedOut) return failure('timeout', 'The request timed out.');
    if (request.signal.aborted) return failure('aborted', 'The request was cancelled.');
    return failure(kind, message);
  };

  try {
    let response: Response;
    try {
      const separator = url.includes('?') ? '&' : '?';
      response = await fetchFn(`${url}${separator}brandName=${EVENTS_API_BRAND}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: request.signal,
      });
    } catch {
      return failUnlessInterrupted('offline', 'The events service could not be reached.');
    }

    if (!response.ok) return failure('server', `The events service returned HTTP ${response.status}.`, response.status);

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      return failUnlessInterrupted('invalid', 'The events service returned unreadable data.');
    }

    try {
      const { events, dropped } = normalizeEventSearch(body, today);
      return { ok: true, events, empty: events.length === 0, dropped };
    } catch (error) {
      if (error instanceof InvalidResponseError) return failure('invalid', error.message);
      return failure('invalid', 'The events service returned data that could not be processed.');
    }
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', cancelRequest);
  }
}
