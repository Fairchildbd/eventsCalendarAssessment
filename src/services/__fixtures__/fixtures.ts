
export const TODAY = '2026-11-15';

export const tag = (key: string, value: string) => ({ key: `mohegansun:${key}`, value });

export function rawEvent(over: Record<string, unknown> = {}) {
  return {
    id: 'evt1',
    title: 'Metallica',
    artist: 'Metallica',
    description: '',
    category: 'Rock',
    location: 'Mohegan Sun Arena',
    displayType: 'Event',
    ongoing: false,
    url: '/events-and-promotions/schedule-of-events/metallica.html',
    imageLink: '/content/dam/mohegansun/Images/metallica thumb.jpg',
    carousel: '/content/dam/mohegansun/Images/metallica-hero.jpg',
    cqTags: [
      tag('venue/mohegan-sun-arena', 'Mohegan Sun Arena'),
      tag('event/entertaintment/rock', 'Rock'),
      tag('event/entertaintment/pop', 'Pop'),
      tag('displayarea/carousal', 'Carousal'),
    ],
    ...over,
  };
}

export const inst = (eventRef: string, start: string, over: Record<string, unknown> = {}) => ({
  eventRef,
  allDay: false,
  start,
  end: start,
  ...over,
});

export function rawResponse(extra?: { events?: unknown[]; eventInstances?: unknown[] }) {
  return {
    searchEndDate: '2027-12-19',
    success: true,
    itineraryRequestSuccess: true,
    eventInvitationsRequestSuccess: true,
    events: [
      rawEvent(),
      rawEvent({
        id: 'evt2',
        title: 'Poker Night',
        displayType: 'Promo',
        category: undefined,
        location: undefined,
        cqTags: [tag('promotions', 'Promotions'), tag('promotions/poker', 'Poker')],
      }),
      rawEvent({
        id: 'evt3',
        title: 'Comedy Show',
        category: 'Comedy',
        location: 'Comix Comedy Club',
        cqTags: [tag('venue/comix-comedy-club', 'Comix Comedy Club'), tag('event/entertaintment/comedy', 'Comedy')],
      }),
      ...(extra?.events ?? []),
    ],
    eventInstances: [
      inst('evt1', '2026-11-19T19:30:00', { end: '2026-11-19T23:00:00' }),
      inst('evt1', '2026-11-21T19:30:00', { end: '2026-11-21T23:00:00' }),
      inst('evt2', '2026-11-20T16:00:00', { end: '2026-11-20T20:00:00' }),
      inst('evt3', '2026-11-25T20:00:00', { end: '2026-11-25T22:00:00' }),
      ...(extra?.eventInstances ?? []),
    ],
  };
}

export const okResponse = (body: unknown) =>
  ({ ok: true, status: 200, json: async () => body }) as unknown as Response;
export const statusResponse = (status: number) =>
  ({ ok: false, status, json: async () => ({}) }) as unknown as Response;

export function hangingFetch(): typeof fetch {
  return ((_url: unknown, init?: RequestInit) =>
    new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => {
        const error = new Error('Aborted');
        error.name = 'AbortError';
        reject(error);
      });
    })) as unknown as typeof fetch;
}

export function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}
