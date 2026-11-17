type EventCategory = 'Entertainment' | 'Sports';

export type DateString = string;

export interface DateRange {
  start: DateString;
  end: DateString;
}

export interface PolicyItem {
  id: string;
  title: string;
  body: string;
}

export interface TicketListing {
  id: string;
  sectionNumber: number;
  row: string;
  ticketType: string;
  priceCents: number;
  available: number;
}

export interface EventNotice {
  id: string;
  icon: 'ticket' | 'people' | 'star' | 'calendar' | 'information-circle';
  text: string;
}

interface EventSchedule {
  label: string;
  detail: string;
}

export interface TicketedEvent {
  id: string;
  title: string;
  category: EventCategory;
  venue: string;
  date: DateString;
  startTime: string;
  timeZone: string;
  image?: string;
  featured: boolean;
  tagline?: string;
  description: string;
  onSale: string;
  notices: EventNotice[];
  schedule?: EventSchedule[];
  policies: PolicyItem[];
  ticketInventory: TicketListing[];
}

interface ReservationEventSnapshot {
  id: string;
  title: string;
  venue: string;
  date: DateString;
  startTime: string;
  timeZone: string;
  image?: string;
}

export interface Reservation {
  id: string;
  reference: string;
  createdAt: string;
  event: ReservationEventSnapshot;
  listingId: string;
  sectionNumber: number;
  row: string;
  ticketType: string;
  quantity: number;
  unitPriceCents: number;
  subtotalCents: number;
  feeCents: number;
  totalCents: number;
  cancelledAt?: string;
}
