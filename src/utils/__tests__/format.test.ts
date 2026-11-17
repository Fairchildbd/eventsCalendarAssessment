import { formatSeat, formatTicketCount } from '@/utils/format';

describe('format utils', () => {
  it.each([
    [1, '1 ticket'],
    [2, '2 tickets'],
    [0, '0 tickets'],
  ])('formats a count of %i as "%s"', (quantity, expected) => {
    expect(formatTicketCount(quantity)).toBe(expected);
  });

  it('formats a seat as section and row', () => {
    expect(formatSeat(107, 'H')).toBe('Section 107 · Row H');
  });
});
