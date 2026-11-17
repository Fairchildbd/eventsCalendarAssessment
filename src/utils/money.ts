import type { TicketListing } from '@/types';

export const MIN_QUANTITY = 1;

export function formatCents(cents: number): string {
  const negative = cents < 0;
  const abs = Math.abs(Math.round(cents));
  const dollars = Math.floor(abs / 100);
  const rem = abs % 100;
  const whole = String(dollars).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${negative ? '-' : ''}$${whole}${rem ? `.${String(rem).padStart(2, '0')}` : ''}`;
}

export function maxQuantityFor(listing: TicketListing | undefined): number {
  return listing ? Math.max(0, listing.available) : 0;
}

type QuantityCheck = { ok: true } | { ok: false; reason: string };

export function validateQuantity(
  quantity: number,
  listing: TicketListing | undefined,
): QuantityCheck {
  if (!listing) return { ok: false, reason: 'Choose a ticket option first.' };
  if (!Number.isInteger(quantity) || quantity < MIN_QUANTITY) {
    return { ok: false, reason: 'Select at least 1 ticket.' };
  }
  if (listing.available <= 0) return { ok: false, reason: 'This option is sold out.' };
  if (quantity > maxQuantityFor(listing)) {
    return { ok: false, reason: `Only ${listing.available} left in this option.` };
  }
  return { ok: true };
}

export interface PriceBreakdown {
  unitPriceCents: number;
  quantity: number;
  subtotalCents: number;
  feeCents: number;
  totalCents: number;
}

export function calculateTotals(
  unitPriceCents: number,
  quantity: number,
  feePerTicketCents: number,
): PriceBreakdown {
  const subtotalCents = unitPriceCents * quantity;
  const feeCents = feePerTicketCents * quantity;
  return { unitPriceCents, quantity, subtotalCents, feeCents, totalCents: subtotalCents + feeCents };
}
