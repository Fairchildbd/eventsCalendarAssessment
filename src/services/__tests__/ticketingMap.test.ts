import { normalizeEventSearch } from '../eventNormalizer';
import { canSimulateTickets, toTicketedEvent } from '../ticketedEvent';
import { TODAY, inst, rawEvent, rawResponse, tag } from '../__fixtures__/fixtures';
import { buildReservation } from '@/utils/reservation';

const live = normalizeEventSearch(
  rawResponse({
    events: [rawEvent({ id: 'allday', title: 'Expo', cqTags: [tag('venue/mohegan-sun-arena', 'Mohegan Sun Arena')] })],
    eventInstances: [inst('allday', '2026-12-05T00:00:00', { allDay: true })],
  }),
  TODAY,
).events;
const find = (title: string, date?: string) => live.find((event) => event.title === title && (!date || event.date === date))!;

describe('catalog -> demo ticketing', () => {
  it('simulates tickets only for timed arena events', () => {
    expect(canSimulateTickets(find('Metallica', '2026-11-19'))).toBe(true);
    expect(canSimulateTickets(find('Comedy Show'))).toBe(false);
    expect(canSimulateTickets(find('Poker Night'))).toBe(false);
    expect(canSimulateTickets(find('Expo'))).toBe(false);
    expect(toTicketedEvent(find('Comedy Show'))).toBeNull();
  });

  it('keeps each performance separate with its own fictional inventory ids', () => {
    const firstEvent = toTicketedEvent(find('Metallica', '2026-11-19'))!;
    const secondEvent = toTicketedEvent(find('Metallica', '2026-11-21'))!;
    expect(firstEvent.id).not.toBe(secondEvent.id);
    const ids = new Set([...firstEvent.ticketInventory, ...secondEvent.ticketInventory].map((listing) => listing.id));
    expect(ids.size).toBe(firstEvent.ticketInventory.length + secondEvent.ticketInventory.length);
    expect(firstEvent.notices.some((notice) => notice.id === 'demo')).toBe(true);
  });

  it('listing ids embed the full event id, so no two events can share inventory', () => {
    const firstEvent = toTicketedEvent(find('Metallica', '2026-11-19'))!;
    const secondEvent = toTicketedEvent(find('Metallica', '2026-11-21'))!;
    expect(firstEvent.ticketInventory.every((listing) => listing.id.startsWith(firstEvent.id))).toBe(true);
    expect(secondEvent.ticketInventory.every((listing) => listing.id.startsWith(secondEvent.id))).toBe(true);
    const many = normalizeEventSearch(
      rawResponse({
        events: Array.from({ length: 300 }, (_value, index) => rawEvent({ id: `ev${index}`, title: `E${index}` })),
        eventInstances: Array.from({ length: 300 }, (_value, index) => inst(`ev${index}`, '2026-12-01T20:00:00')),
      }),
      TODAY,
    ).events.filter((event) => event.title.startsWith('E'));
    const ids = many.flatMap((event) => toTicketedEvent(event)!.ticketInventory.map((listing) => listing.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('is deterministic for the same event', () => {
    const event = find('Metallica', '2026-11-19');
    expect(toTicketedEvent(event)).toEqual(toTicketedEvent(event));
  });

  it('builds a self-contained reservation snapshot from a live event', () => {
    const event = toTicketedEvent(find('Metallica', '2026-11-19'))!;
    const listing = event.ticketInventory.find((candidate) => candidate.available >= 2)!;
    const reservation = buildReservation(event, listing, 2);
    expect(reservation.event).toMatchObject({ title: 'Metallica', venue: 'Mohegan Sun Arena', date: '2026-11-19', startTime: '19:30', timeZone: 'America/New_York' });
    expect(reservation.totalCents).toBe(reservation.subtotalCents + reservation.feeCents);
  });
});
