import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { useEventCatalog, EventCatalogProvider } from '@/store/EventCatalogContext';
import { deferred, hangingFetch, okResponse, rawResponse, statusResponse } from '@/services/__fixtures__/fixtures';

const wrapper = ({ children }: { children: ReactNode }) => <EventCatalogProvider>{children}</EventCatalogProvider>;

const offline = async () => {
  throw new TypeError('Network request failed');
};

const mockFetch = (implementation: (...args: Parameters<typeof fetch>) => Promise<unknown>) => {
  const fetchMock = jest.fn(implementation);
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
};

afterEach(() => {
  jest.restoreAllMocks();
});

describe('useEventCatalog', () => {
  it('shows loading, then the live events', async () => {
    const gate = deferred<Response>();
    mockFetch(() => gate.promise);
    const { result } = await renderHook(() => useEventCatalog(), { wrapper });
    expect(result.current.state).toMatchObject({ refreshing: true, events: [] });

    await act(async () => {
      gate.resolve(okResponse(rawResponse()));
    });
    await waitFor(() => expect(result.current.state.updatedAt).not.toBeNull());
    expect(result.current.state).toMatchObject({ refreshing: false, error: null });
    expect(result.current.state.events).toHaveLength(4);
    expect(result.current.state.updatedAt).not.toBeNull();
  });

  it('starting offline leaves no events and reports the error', async () => {
    mockFetch(offline);
    const { result } = await renderHook(() => useEventCatalog(), { wrapper });
    await waitFor(() => expect(result.current.state.error?.kind).toBe('offline'));
    expect(result.current.state).toMatchObject({ events: [], refreshing: false, updatedAt: null });
  });

  it('retrying after an offline start loads the events and clears the error', async () => {
    const fetchMock = mockFetch(offline);
    const { result } = await renderHook(() => useEventCatalog(), { wrapper });
    await waitFor(() => expect(result.current.state.error?.kind).toBe('offline'));

    fetchMock.mockImplementation(async () => okResponse(rawResponse()));
    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.state).toMatchObject({ error: null });
    expect(result.current.state.events).toHaveLength(4);
  });

  it.each([
    ['a server error', async () => statusResponse(503), 'server'],
    ['an invalid response', async () => okResponse({ nope: 1 }), 'invalid'],
  ])('a failed refresh (%s) keeps the loaded events and reports the error', async (_caseName, failingFetch, kind) => {
    const fetchMock = mockFetch(async () => okResponse(rawResponse()));
    const { result } = await renderHook(() => useEventCatalog(), { wrapper });
    await waitFor(() => expect(result.current.state.updatedAt).not.toBeNull());

    fetchMock.mockImplementation(failingFetch);
    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.state).toMatchObject({ error: { kind }, refreshing: false });
    expect(result.current.state.events).toHaveLength(4);
  });

  it('cancels the in-flight request when the provider unmounts', async () => {
    const fetchMock = mockFetch(hangingFetch());
    const { unmount } = await renderHook(() => useEventCatalog(), { wrapper });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.signal?.aborted).toBe(false);
    await unmount();
    expect(init.signal?.aborted).toBe(true);
  });

  it('finds an event by id', async () => {
    mockFetch(async () => okResponse(rawResponse()));
    const { result } = await renderHook(() => useEventCatalog(), { wrapper });
    await waitFor(() => expect(result.current.state.updatedAt).not.toBeNull());
    const [first] = result.current.state.events;
    expect(result.current.getEvent(first.id)).toBe(first);
    expect(result.current.getEvent('missing')).toBeUndefined();
    expect(result.current.getEvent(undefined)).toBeUndefined();
  });
});
