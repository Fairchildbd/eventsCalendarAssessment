import { SERVICE_FEE_CENTS_PER_TICKET } from '@/utils/demoEvents';
import type { TicketedEvent, Reservation, TicketListing } from '@/types';
import { nowInZone } from './date';
import { calculateTotals, validateQuantity } from './money';

const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateReference(random: () => number = Math.random): string {
  let code = '';
  for (let index = 0; index < 6; index += 1) {
    code += REF_ALPHABET[Math.floor(random() * REF_ALPHABET.length)];
  }
  return `DEMO-${code}`;
}

export const RESERVATIONS_CLOSED_MESSAGE = 'Reservations for this event have closed because it has already started.';

export function reservationsOpen(
  event: { date: string; startTime: string; timeZone: string },
  now: Date = new Date(),
): boolean {
  const here = nowInZone(event.timeZone, now);
  return `${here.date} ${here.time}` < `${event.date} ${event.startTime}`;
}

export function buildReservation(
  event: TicketedEvent,
  listing: TicketListing,
  quantity: number,
  now: Date = new Date(),
  random: () => number = Math.random,
  id?: string,
): Reservation {
  const check = validateQuantity(quantity, listing);
  if (!check.ok) throw new Error(check.reason);
  if (!reservationsOpen(event, now)) throw new Error(RESERVATIONS_CLOSED_MESSAGE);
  const totals = calculateTotals(listing.priceCents, quantity, SERVICE_FEE_CENTS_PER_TICKET);
  const reference = generateReference(random);
  return {
    id: id ?? `${reference}-${now.getTime()}`,
    reference,
    createdAt: now.toISOString(),
    event: {
      id: event.id,
      title: event.title,
      venue: event.venue,
      date: event.date,
      startTime: event.startTime,
      timeZone: event.timeZone,
      image: event.image,
    },
    listingId: listing.id,
    sectionNumber: listing.sectionNumber,
    row: listing.row,
    ticketType: listing.ticketType,
    quantity,
    unitPriceCents: totals.unitPriceCents,
    subtotalCents: totals.subtotalCents,
    feeCents: totals.feeCents,
    totalCents: totals.totalCents,
  };
}

export const isCancelled = (reservation: Pick<Reservation, 'cancelledAt'>): boolean => !!reservation.cancelledAt;

export function reservedByListing(reservations: readonly Reservation[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const reservation of reservations) {
    if (isCancelled(reservation)) continue;
    map.set(reservation.listingId, (map.get(reservation.listingId) ?? 0) + reservation.quantity);
  }
  return map;
}
