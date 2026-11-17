import type { PolicyItem, TicketListing } from '@/types';

export const VENUE_TIME_ZONE = 'America/New_York';

export const VENUE_POLICIES: PolicyItem[] = [
  {
    id: 'bag',
    title: 'Bag Policy',
    body: 'Arena events commonly limit bag size and may use security screening. Check the official Mohegan Sun Arena page for the current bag policy before you travel.',
  },
  {
    id: 'safety',
    title: 'Arena Safety',
    body: 'Guests may be screened on entry. Follow staff directions and posted signs. Official safety information is published by Mohegan Sun.',
  },
  {
    id: 'box-office',
    title: 'Box Office Payment',
    body: 'Box office payment options can differ by event. Confirm accepted methods with the official box office.',
  },
  {
    id: 'reserved-parking',
    title: 'Reserved Parking',
    body: 'Reserved parking may be offered for select events. Availability and pricing are set by the venue, not by this demo.',
  },
  {
    id: 'free-parking',
    title: 'Free Self-Parking',
    body: 'Self-parking has historically been offered on property. Verify current options and garage locations with Mohegan Sun.',
  },
];

export const buildListing = (
  id: string,
  sectionNumber: number,
  row: string,
  ticketType: string,
  priceCents: number,
  available: number,
): TicketListing => ({ id, sectionNumber, row, ticketType, priceCents, available });

export const demoInventory = (prefix: string, base: number): TicketListing[] => [
  buildListing(`${prefix}-106-e`, 106, 'E', 'Verified Ticket', base + 4000, 6),
  buildListing(`${prefix}-109-h`, 109, 'H', 'Verified Ticket', base + 2000, 8),
  buildListing(`${prefix}-120-l`, 120, 'L', 'Upper Level', base, 12),
  buildListing(`${prefix}-116-p`, 116, 'P', 'Upper Level', base - 1500, 0),
];

export const SERVICE_FEE_CENTS_PER_TICKET = 750;
