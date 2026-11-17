import type { EventNotice, TicketedEvent, TicketListing } from '@/types';
import { VENUE_POLICIES, VENUE_TIME_ZONE, buildListing, demoInventory } from '@/utils/demoEvents';

const ARENA = 'Mohegan Sun Arena';

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=70`;

const IMAGES = {
  stage: img('1459749411175-04bf5292ceea'),
  basketball: img('1546519638-68e109498ffc'),
  festival: img('1493225457124-a3eb161ffa5f'),
  mic: img('1429962714451-bb934ecdc4ec'),
} as const;

const demoNotice: EventNotice = {
  id: 'demo',
  icon: 'information-circle',
  text: 'Demo only: prices and availability are fictional and no real tickets are sold or held.',
};

const standingFloor: EventNotice = {
  id: 'standing',
  icon: 'people',
  text: 'Standing floor: floor tickets are general-admission standing room with no assigned seats.',
};

const metallicaInventory = (prefix: string): TicketListing[] => [
  buildListing(`${prefix}-107-h`, 107, 'H', 'Verified Ticket', 17500, 6),
  buildListing(`${prefix}-107-j`, 107, 'J', 'Verified Ticket', 14500, 4),
  buildListing(`${prefix}-118-m`, 118, 'M', 'Verified Ticket', 12500, 8),
  buildListing(`${prefix}-105-c`, 105, 'C', 'Premium Seat', 21000, 2),
  buildListing(`${prefix}-102-k`, 102, 'K', 'Side View', 9900, 12),
  buildListing(`${prefix}-111-f`, 111, 'F', 'Verified Ticket', 11500, 0),
  buildListing(`${prefix}-floor`, 104, 'GA', 'Standing Floor', 19500, 10),
];

const showcaseInventory: TicketListing[] = [
  buildListing('bhof-110-d', 110, 'D', 'Lower Level', 6500, 10),
  buildListing('bhof-108-g', 108, 'G', 'Lower Level', 5500, 6),
  buildListing('bhof-119-n', 119, 'N', 'Upper Level', 3500, 14),
  buildListing('bhof-103-b', 103, 'B', 'Courtside View', 9500, 3),
  buildListing('bhof-117-k', 117, 'K', 'Upper Level', 3000, 0),
];

const base = {
  venue: ARENA,
  timeZone: VENUE_TIME_ZONE,
  policies: VENUE_POLICIES,
  onSale: 'On sale now (demo)',
} as const;

export const EVENTS: TicketedEvent[] = [
  {
    ...base,
    id: 'il-volo-2026-11-15',
    title: 'Il Volo',
    category: 'Entertainment',
    date: '2026-11-15',
    startTime: '20:00',
    featured: true,
    tagline: 'Italian operatic pop trio',
    description:
      'Il Volo brings its celebrated blend of opera and pop vocals to Mohegan Sun Arena for one evening.',
    notices: [demoNotice],
    ticketInventory: demoInventory('ilvolo', 9500),
  },
  {
    ...base,
    id: 'metallica-2026-11-19',
    title: 'Metallica',
    category: 'Entertainment',
    date: '2026-11-19',
    startTime: '19:30',
    featured: false,
    tagline: '25th Anniversary of Mohegan Sun Arena',
    description:
      'Celebrate the 25th Anniversary of Mohegan Sun Arena with Metallica and special guest Spiritbox for an unforgettable night.',
    notices: [
      standingFloor,
      { id: 'guest', icon: 'star', text: 'Special guest: Spiritbox.' },
      demoNotice,
    ],
    ticketInventory: metallicaInventory('met19'),
  },
  {
    ...base,
    id: 'metallica-2026-11-21',
    title: 'Metallica',
    category: 'Entertainment',
    date: '2026-11-21',
    startTime: '19:30',
    featured: true,
    tagline: '25th Anniversary of Mohegan Sun Arena',
    description:
      'Celebrate the 25th Anniversary of Mohegan Sun Arena with Metallica and special guest Spiritbox for an unforgettable night.',
    notices: [
      standingFloor,
      { id: 'guest', icon: 'star', text: 'Special guest: Spiritbox.' },
      demoNotice,
    ],
    ticketInventory: metallicaInventory('met21'),
  },
  {
    ...base,
    id: 'bhof-womens-showcase-2026-11-24',
    title: "Basketball Hall of Fame Women's Showcase",
    category: 'Sports',
    date: '2026-11-24',
    startTime: '17:00',
    featured: true,
    tagline: 'Multi-game basketball event',
    description:
      "A multi-game women's college basketball showcase presented with the Basketball Hall of Fame at Mohegan Sun Arena.",
    notices: [
      {
        id: 'sched',
        icon: 'calendar',
        text: 'Multiple games on one ticket. See the schedule below.',
      },
      demoNotice,
    ],
    schedule: [
      { label: 'Game 1', detail: '5:00 PM tip-off' },
      { label: 'Game 2', detail: '7:30 PM tip-off (approximate)' },
    ],
    ticketInventory: showcaseInventory,
  },
  {
    ...base,
    id: 'wang-feng-2026-11-25',
    title: 'Wang Feng',
    category: 'Entertainment',
    date: '2026-11-25',
    startTime: '23:45',
    featured: false,
    tagline: 'Late-night show',
    description:
      'Chinese rock icon Wang Feng performs a late-night concert at Mohegan Sun Arena.',
    notices: [demoNotice],
    ticketInventory: demoInventory('wang', 8500),
  },
  {
    ...base,
    id: 'tso-2026-11-29',
    title: 'Trans-Siberian Orchestra',
    category: 'Entertainment',
    date: '2026-11-29',
    startTime: '15:00',
    featured: true,
    tagline: 'Matinee performance',
    description:
      'Trans-Siberian Orchestra delivers its theatrical rock-orchestra holiday spectacle in an afternoon matinee.',
    notices: [demoNotice],
    ticketInventory: demoInventory('tso', 7500),
  },
  {
    ...base,
    id: 'holiday-comedy-2026-12-12',
    title: 'Holiday Comedy Showcase',
    category: 'Entertainment',
    date: '2026-12-12',
    startTime: '19:00',
    image: IMAGES.mic,
    featured: false,
    tagline: 'Fictional demo event',
    description:
      'Fictional demo event added to make date filtering useful. A night of stand-up comedy.',
    notices: [demoNotice],
    ticketInventory: demoInventory('comedy', 5500),
  },
  {
    ...base,
    id: 'hockey-classic-2027-01-23',
    title: 'Mohegan Sun Hockey Classic',
    category: 'Sports',
    date: '2027-01-23',
    startTime: '18:00',
    image: IMAGES.basketball,
    featured: false,
    tagline: 'Fictional demo event',
    description: 'Fictional demo sports event added to make category filtering useful.',
    notices: [demoNotice],
    ticketInventory: demoInventory('hockey', 4500),
  },
  {
    ...base,
    id: 'spring-rock-2027-03-06',
    title: 'Spring Rock Revival',
    category: 'Entertainment',
    date: '2027-03-06',
    startTime: '20:00',
    image: IMAGES.stage,
    featured: false,
    tagline: 'Fictional demo event',
    description: 'Fictional demo concert added to make date filtering useful.',
    notices: [demoNotice],
    ticketInventory: demoInventory('spring', 6500),
  },
  {
    ...base,
    id: 'summer-soul-2027-07-17',
    title: 'Summer Soul Nights',
    category: 'Entertainment',
    date: '2027-07-17',
    startTime: '19:30',
    image: IMAGES.festival,
    featured: false,
    tagline: 'Fictional demo event',
    description: 'Fictional demo concert added to make date filtering useful.',
    notices: [demoNotice],
    ticketInventory: demoInventory('soul', 6000),
  },
  {
    ...base,
    id: 'hilary-duff-2027-10-08',
    title: 'Hilary Duff',
    category: 'Entertainment',
    date: '2027-10-08',
    startTime: '19:30',
    featured: false,
    tagline: 'Pop night',
    description: 'Hilary Duff brings her pop hits to Mohegan Sun Arena.',
    notices: [demoNotice],
    ticketInventory: demoInventory('duff', 8000),
  },
];
