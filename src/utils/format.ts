export const formatTicketCount = (quantity: number): string => `${quantity} ${quantity === 1 ? 'ticket' : 'tickets'}`;

export const formatSeat = (sectionNumber: number, row: string): string => `Section ${sectionNumber} · Row ${row}`;
