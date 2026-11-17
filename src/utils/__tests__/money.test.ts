import { EVENTS } from '@/utils/__fixtures__/demoEvents';
import { calculateTotals, formatCents, maxQuantityFor, validateQuantity } from '@/utils/money';

describe('money utils', () => {
  it.each([
    [17500, '$175'],
    [17550, '$175.50'],
    [123456789, '$1,234,567.89'],
  ])('formats %i cents as %s', (cents, expected) => {
    expect(formatCents(cents)).toBe(expected);
  });

  it('calculates totals in integer cents', () => {
    expect(calculateTotals(17500, 2, 750)).toEqual({
      unitPriceCents: 17500,
      quantity: 2,
      subtotalCents: 35000,
      feeCents: 1500,
      totalCents: 36500,
    });
  });

  describe('quantity is bounded by remaining inventory only', () => {
    const event = EVENTS.find((candidate) => candidate.id === 'metallica-2026-11-21')!;
    const plenty = event.ticketInventory.find((listing) => listing.available >= 8)!;
    const two = event.ticketInventory.find((listing) => listing.available === 2)!;
    const soldOut = event.ticketInventory.find((listing) => listing.available === 0)!;

    it.each([
      ['every available ticket', plenty.available, plenty, true],
      ['one more than available', plenty.available + 1, plenty, false],
      ['0 tickets', 0, plenty, false],
      ['3 tickets with only 2 available', 3, two, false],
      ['1 ticket when sold out', 1, soldOut, false],
      ['1 ticket for a missing listing', 1, undefined, false],
    ])('validates %s', (_caseName, quantity, listing, expectedOk) => {
      expect(validateQuantity(quantity, listing).ok).toBe(expectedOk);
    });

    it.each([
      ['plenty available', plenty, plenty.available],
      ['2 available', two, 2],
      ['sold out', soldOut, 0],
      ['a missing listing', undefined, 0],
    ])('allows at most the remaining count (%s)', (_caseName, listing, expectedMax) => {
      expect(maxQuantityFor(listing)).toBe(expectedMax);
    });
  });

  it('validation and the quantity control share one maximum', () => {
    const listing = { id: 'x', sectionNumber: 1, row: 'A', ticketType: 't', priceCents: 1000, available: 9 };
    const max = maxQuantityFor(listing);
    expect(validateQuantity(max, listing).ok).toBe(true);
    expect(validateQuantity(max + 1, listing).ok).toBe(false);
  });
});
