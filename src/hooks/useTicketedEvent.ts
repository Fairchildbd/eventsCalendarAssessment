import { useMemo } from 'react';

import { toTicketedEvent } from '@/services/ticketedEvent';
import { useEventCatalog } from '@/store/EventCatalogContext';

export function useTicketedEvent(id: string | undefined) {
  const { getEvent } = useEventCatalog();
  const catalogEvent = getEvent(id);
  const ticketedEvent = useMemo(() => (catalogEvent ? toTicketedEvent(catalogEvent) : null), [catalogEvent]);
  return { catalogEvent, ticketedEvent };
}
