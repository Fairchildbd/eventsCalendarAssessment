import { EVENTS } from '@/utils/__fixtures__/demoEvents';
import { SERVICE_FEE_CENTS_PER_TICKET } from '@/utils/demoEvents';
import { maxQuantityFor } from '@/utils/money';
import {
  RESERVATIONS_CLOSED_MESSAGE,
  buildReservation,
  generateReference,
  isCancelled,
  reservationsOpen,
  reservedByListing,
} from '@/utils/reservation';

describe('reservation construction', () => {
  const event = EVENTS.find((candidate) => candidate.id === 'metallica-2026-11-21')!;
  const listing = event.ticketInventory.find((candidate) => candidate.sectionNumber === 107 && candidate.row === 'H')!;

  it('snapshots event/ticket details and computes totals', () => {
    const reservation = buildReservation(event, listing, 2, new Date('2026-11-15T12:00:00Z'), () => 0);
    expect(reservation.reference).toBe('DEMO-AAAAAA');
    expect(reservation.event.title).toBe('Metallica');
    expect(reservation.sectionNumber).toBe(107);
    expect(reservation.row).toBe('H');
    expect(reservation.subtotalCents).toBe(35000);
    expect(reservation.feeCents).toBe(2 * SERVICE_FEE_CENTS_PER_TICKET);
    expect(reservation.totalCents).toBe(35000 + 2 * SERVICE_FEE_CENTS_PER_TICKET);
  });

  it('is unaffected by later inventory changes (snapshot)', () => {
    const editableListing = { ...listing };
    const reservation = buildReservation(event, editableListing, 1);
    const before = reservation.unitPriceCents;
    editableListing.priceCents = 1;
    expect(reservation.unitPriceCents).toBe(before);
  });

  it('rejects quantity beyond availability', () => {
    expect(() => buildReservation(event, listing, listing.available + 1)).toThrow();
    const sold = event.ticketInventory.find((candidate) => candidate.available === 0)!;
    expect(() => buildReservation(event, sold, 1)).toThrow();
  });

  it('generates demo references', () => {
    expect(generateReference()).toMatch(/^DEMO-[A-Z2-9]{6}$/);
  });
});

describe('cancelled reservations release inventory', () => {
  it('counts only active reservations, and cancelling restores availability', () => {
    const event = EVENTS.find((candidate) => candidate.id === 'il-volo-2026-11-15')!;
    const listing = event.ticketInventory.find((candidate) => candidate.available === 12)!;
    const makeReservation = (key: string, qty: number) => buildReservation(event, listing, qty, new Date('2026-11-15T20:00:00Z'), Math.random, key);
    const firstReservation = makeReservation('res-a', 5);
    const secondReservation = makeReservation('res-b', 4);

    const remaining = (reservations: typeof firstReservation[]) => listing.available - (reservedByListing(reservations).get(listing.id) ?? 0);
    expect(remaining([firstReservation, secondReservation])).toBe(3);
    const cancelledA = { ...firstReservation, cancelledAt: '2026-11-16T15:00:00.000Z' };
    expect(isCancelled(cancelledA)).toBe(true);
    expect(remaining([cancelledA, secondReservation])).toBe(8);
    expect(maxQuantityFor({ ...listing, available: remaining([cancelledA, secondReservation]) })).toBe(8);
    expect(remaining([cancelledA, { ...secondReservation, cancelledAt: 'x' }])).toBe(12);
  });
});

describe('reservation cutoff (event start time, event time zone)', () => {
  const metallica = EVENTS.find((candidate) => candidate.id === 'metallica-2026-11-19')!;

  it.each([
    ['the day before', '2026-11-18T12:00:00Z', true],
    ['one minute before the start', '2026-11-20T00:29:00Z', true],
    ['exactly at the start', '2026-11-20T00:30:00Z', false],
    ['after the event', '2026-11-21T12:00:00Z', false],
  ])('reservations are open or closed %s (%s)', (_caseName, instant, expectedOpen) => {
    expect(reservationsOpen(metallica, new Date(instant))).toBe(expectedOpen);
  });

  it.each([
    ['one minute before the 8 PM start', '2027-07-17T23:59:00Z', true],
    ['at the 8 PM start', '2027-07-18T00:00:00Z', false],
  ])('uses the event time zone, not the device zone, across daylight saving (%s)', (_caseName, instant, expectedOpen) => {
    const summer = { date: '2027-07-17', startTime: '20:00', timeZone: 'America/New_York' };
    expect(reservationsOpen(summer, new Date(instant))).toBe(expectedOpen);
  });

  it('refuses to build a reservation once the event has started', () => {
    const listing = metallica.ticketInventory.find((candidate) => candidate.available >= 2)!;
    expect(() => buildReservation(metallica, listing, 2, new Date('2026-11-20T00:30:00Z'))).toThrow(RESERVATIONS_CLOSED_MESSAGE);
    expect(() => buildReservation(metallica, listing, 2, new Date('2026-11-20T00:29:00Z'))).not.toThrow();
  });
});
