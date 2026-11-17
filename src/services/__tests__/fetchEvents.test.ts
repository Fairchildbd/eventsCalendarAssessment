import { fetchEvents } from '../fetchEvents';
import { TODAY, hangingFetch, okResponse, rawResponse, statusResponse } from '../__fixtures__/fixtures';

const baseOptions = { url: 'https://example.test/eventsearch', timeoutMs: 1000, today: TODAY };

describe('fetchEvents: success', () => {
  it('makes a single GET with brandName and normalizes the events', async () => {
    const fetchFn = jest.fn(async () => okResponse(rawResponse())) as unknown as typeof fetch;
    const result = await fetchEvents({ ...baseOptions, fetchFn });
    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [url, init] = (fetchFn as unknown as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://example.test/eventsearch?brandName=mohegansun');
    expect(init.method).toBe('GET');
    expect(result.ok && result.events).toHaveLength(4);
    expect(result.ok && result.empty).toBe(false);
  });

  it('reports a successful empty response as empty, not as an error', async () => {
    const fetchFn = (async () => okResponse({ success: true, events: [], eventInstances: [] })) as typeof fetch;
    expect(await fetchEvents({ ...baseOptions, fetchFn })).toMatchObject({ ok: true, empty: true, events: [] });
  });
});

describe('fetchEvents: failures', () => {
  it.each([
    ['offline', (async () => { throw new TypeError('Network request failed'); }) as typeof fetch, 'offline'],
    ['server error', (async () => statusResponse(503)) as typeof fetch, 'server'],
    ['invalid JSON', (async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError('x'); } })) as unknown as typeof fetch, 'invalid'],
    ['invalid schema', (async () => okResponse({ hello: 'world' })) as typeof fetch, 'invalid'],
  ])('%s -> structured error', async (_caseName, fetchFn, kind) => {
    expect(await fetchEvents({ ...baseOptions, fetchFn })).toMatchObject({ ok: false, error: { kind } });
  });

  it('includes the HTTP status on server errors', async () => {
    const fetchFn = (async () => statusResponse(500)) as typeof fetch;
    expect(await fetchEvents({ ...baseOptions, fetchFn })).toMatchObject({ ok: false, error: { kind: 'server', status: 500 } });
  });

  it('times out slow requests', async () => {
    expect(await fetchEvents({ ...baseOptions, timeoutMs: 25, fetchFn: hangingFetch() })).toMatchObject({
      ok: false,
      error: { kind: 'timeout' },
    });
  });

  it('reports a cancelled request as aborted, not as a timeout or an error', async () => {
    const controller = new AbortController();
    const pending = fetchEvents({ ...baseOptions, signal: controller.signal, fetchFn: hangingFetch() });
    controller.abort();
    expect(await pending).toMatchObject({ ok: false, error: { kind: 'aborted' } });
  });

  it('reports invalid data instead of throwing when processing fails unexpectedly', async () => {
    const evil = { success: true, get events(): unknown { throw new RangeError('boom'); }, eventInstances: [] };
    const fetchFn = (async () => okResponse(evil)) as typeof fetch;
    await expect(fetchEvents({ ...baseOptions, fetchFn })).resolves.toMatchObject({ ok: false, error: { kind: 'invalid' } });
  });
});
