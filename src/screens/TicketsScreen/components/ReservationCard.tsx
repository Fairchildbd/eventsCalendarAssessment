import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, shadows, spacing, typography } from '@/utils/theme';
import type { Reservation } from '@/types';
import { isCancelled } from '@/utils/reservation';
import { dateBadgeParts, formatDateMedium, formatTime } from '@/utils/date';
import { formatSeat, formatTicketCount } from '@/utils/format';
import { formatCents } from '@/utils/money';

interface Props {
  reservation: Reservation;
  onPress: (id: string) => void;
}

function ReservationCardBase({ reservation, onPress }: Props) {
  const cancelled = isCancelled(reservation);
  const when = `${formatDateMedium(reservation.event.date)} · ${formatTime(reservation.event.startTime)}`;
  return (
    <Pressable
      onPress={() => onPress(reservation.id)}
      accessibilityRole="button"
      accessibilityLabel={`${cancelled ? 'Cancelled demo reservation' : 'Demo reservation'} ${reservation.reference}, ${reservation.event.title}, ${when}, ${formatSeat(reservation.sectionNumber, reservation.row)}, ${formatTicketCount(reservation.quantity)}, total ${formatCents(reservation.totalCents)}`}
      accessibilityHint="Opens ticket details"
      style={({ pressed }) => [styles.card, cancelled && styles.cardCancelled, pressed && { opacity: 0.9 }]}
    >
      <View style={[styles.badge, cancelled && styles.badgeCancelled]}>
        <Text style={styles.badgeMonth}>{dateBadgeParts(reservation.event.date).month}</Text>
        <Text style={styles.badgeDay}>{dateBadgeParts(reservation.event.date).day}</Text>
      </View>
      <View style={styles.body}>
        <Text style={[styles.demo, cancelled && styles.cancelledLabel]}>
          {cancelled ? 'CANCELLED · DEMO RESERVATION' : 'DEMO RESERVATION'}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {reservation.event.title}
        </Text>
        <Text style={styles.meta}>{when}</Text>
        <Text style={styles.meta}>
          Sec {reservation.sectionNumber} · Row {reservation.row} · {formatTicketCount(reservation.quantity)}
        </Text>
        <Text style={styles.total}>
          {formatCents(reservation.totalCents)} · {reservation.reference}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color={colors.purple} />
    </Pressable>
  );
}

export const ReservationCard = memo(ReservationCardBase);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: radii.sm,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCancelled: { backgroundColor: colors.lavender },
  badgeCancelled: { backgroundColor: colors.textMuted },
  cancelledLabel: { color: colors.danger },
  badgeMonth: { ...typography.label, color: colors.white },
  badgeDay: { fontSize: 24, lineHeight: 28, fontWeight: '800', color: colors.white },
  body: { flex: 1, gap: 2 },
  demo: { ...typography.label, color: colors.purple },
  title: { ...typography.subheading, color: colors.text },
  meta: { ...typography.small, color: colors.textMuted },
  total: { ...typography.small, fontWeight: '700', color: colors.text, marginTop: 2 },
});
