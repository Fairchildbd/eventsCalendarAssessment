import { StyleSheet, Text, View } from 'react-native';

import { LabelValueRow } from '@/components/LabelValueRow';
import { colors, radii, spacing, typography } from '@/utils/theme';
import { SERVICE_FEE_CENTS_PER_TICKET } from '@/utils/demoEvents';
import { formatCents, type PriceBreakdown } from '@/utils/money';

export function PricingSummary({ totals }: { totals: PriceBreakdown }) {
  return (
    <View style={styles.box}>
      <LabelValueRow
        label={`Tickets (${totals.quantity} × ${formatCents(totals.unitPriceCents)})`}
        value={formatCents(totals.subtotalCents)}
      />
      <LabelValueRow
        label={`Demo service fee (${formatCents(SERVICE_FEE_CENTS_PER_TICKET)} each)`}
        value={formatCents(totals.feeCents)}
      />
      <View style={styles.divider} />
      <LabelValueRow label="Total" value={formatCents(totals.totalCents)} bold />
      <Text style={styles.note}>Fictional demo pricing. Nothing is charged.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: colors.lavender, borderRadius: radii.md, padding: spacing.lg, gap: spacing.sm },
  divider: { height: 1, backgroundColor: colors.borderStrong },
  note: { ...typography.small, color: colors.textMuted },
});
