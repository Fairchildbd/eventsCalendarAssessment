import {
  VENUE_POLICIES,
  VENUE_TIME_ZONE,
  demoInventory,
} from '@/utils/demoEvents';
import type { TicketedEvent } from '@/types';
import type { CatalogEvent } from '@/types/catalog';

const ARENA_VENUE_ID = 'mohegan-sun-arena';

export function canSimulateTickets(event: CatalogEvent): boolean {
  return (
    event.contentType === 'event' && event.venue?.id === ARENA_VENUE_ID && !event.allDay && event.startTime !== null
  );
}

function hash(text: string): number {
  let hashValue = 0;
  for (let charIndex = 0; charIndex < text.length; charIndex += 1) hashValue = (hashValue * 31 + text.charCodeAt(charIndex)) % 1_000_003;
  return hashValue;
}

export function toTicketedEvent(event: CatalogEvent): TicketedEvent | null {
  if (!canSimulateTickets(event) || event.startTime === null) return null;
  return {
    id: event.id,
    title: event.title,
    category: 'Entertainment',
    venue: event.venue?.label ?? 'Mohegan Sun',
    date: event.date,
    startTime: event.startTime,
    timeZone: event.timeZone || VENUE_TIME_ZONE,
    ...(event.thumbnailUrl ? { image: event.thumbnailUrl } : {}),
    featured: event.featured,
    description: event.description,
    onSale: 'Demo tickets (fictional)',
    notices: [
      {
        id: 'demo',
        icon: 'information-circle',
        text: 'Demo only: prices and availability are fictional and no real tickets are sold or held.',
      },
    ],
    policies: event.venue?.id === ARENA_VENUE_ID ? VENUE_POLICIES : [],
    ticketInventory: demoInventory(event.id, 6000 + (hash(event.id) % 5000)),
  };
}
