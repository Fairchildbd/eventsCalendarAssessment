import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, shadows, spacing, typography } from '@/utils/theme';
import type { TicketListing } from '@/types';
import { formatSeat } from '@/utils/format';
import { formatCents } from '@/utils/money';

interface Props {
  listing: TicketListing;
  remaining: number;
  selected: boolean;
  onSelect: (listingId: string) => void;
}

function TicketRowBase({ listing, remaining, selected, onSelect }: Props) {
  const soldOut = remaining <= 0;
  const availability = soldOut ? 'Sold out' : remaining <= 4 ? `Only ${remaining} left` : `${remaining} available`;
  return (
    <Pressable
      disabled={soldOut}
      onPress={() => onSelect(listing.id)}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled: soldOut }}
      accessibilityLabel={`${formatSeat(listing.sectionNumber, listing.row)}, ${listing.ticketType}, ${formatCents(listing.priceCents)} each, ${availability}`}
      style={[styles.row, selected && styles.selected, soldOut && styles.soldOut]}
    >
      <View style={[styles.radio, selected && styles.radioOn]}>
        {selected && <View style={styles.radioDot} />}
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>
          Sec {listing.sectionNumber} · Row {listing.row}
        </Text>
        <Text style={styles.sub}>{listing.ticketType}</Text>
        <Text style={[styles.avail, soldOut && styles.availOut]}>{availability}</Text>
      </View>
      <View style={styles.priceCol}>
        <Text style={styles.price}>{formatCents(listing.priceCents)}</Text>
        <Text style={styles.each}>each</Text>
      </View>
    </Pressable>
  );
}

export const TicketRow = memo(TicketRowBase);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 68,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadows.card,
  },
  selected: { borderColor: colors.purple, backgroundColor: '#FBF4FB' },
  soldOut: { opacity: 0.5 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: colors.purple },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.purple },
  info: { flex: 1, gap: 1 },
  title: { ...typography.subheading, color: colors.text },
  sub: { ...typography.small, color: colors.textMuted },
  avail: { ...typography.small, color: colors.success },
  availOut: { color: colors.danger },
  priceCol: { alignItems: 'flex-end' },
  price: { ...typography.heading, color: colors.text },
  each: { ...typography.small, color: colors.textMuted },
});
