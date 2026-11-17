import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { BackHandler, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/Buttons';
import { Card } from '@/components/Card';
import { Divider } from '@/components/Divider';
import { LabelValueRow } from '@/components/LabelValueRow';
import { NoticeBox } from '@/components/NoticeBox';
import { Screen } from '@/components/Screen';
import { StateView } from '@/components/StateViews';
import { PricingSummary } from '@/components/PricingSummary';
import { colors, spacing, typography } from '@/utils/theme';
import { useGoBack } from '@/hooks/useGoBack';
import { useReservations } from '@/store/ReservationsContext';
import { formatDateLong, formatTime } from '@/utils/date';
import { formatSeat } from '@/utils/format';

export default function ReservationScreen() {
  const { id, fresh } = useLocalSearchParams<{ id: string; fresh?: string }>();
  const router = useRouter();
  const goBack = useGoBack('/tickets');
  const insets = useSafeAreaInsets();
  const { getReservation } = useReservations();
  const reservation = getReservation(id);
  const isFresh = fresh === '1';

  const toEvents = useCallback(() => {
    router.dismissAll();
    router.navigate('/');
  }, [router]);
  const toTickets = useCallback(() => {
    router.dismissAll();
    router.navigate('/tickets');
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      if (!isFresh) return undefined;
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        toEvents();
        return true;
      });
      return () => subscription.remove();
    }, [isFresh, toEvents]),
  );

  if (!reservation) {
    return (
      <Screen onBack={goBack}>
        <StateView
          icon="alert-circle-outline"
          title="Reservation not found"
          message="This demo reservation isn't saved on this device."
          actionLabel="View My Tickets"
          onAction={toTickets}
        />
      </Screen>
    );
  }

  return (
    <Screen onBack={isFresh ? undefined : goBack}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.success}>
          <View style={styles.check}>
            <Ionicons name="checkmark" size={40} color={colors.white} />
          </View>
          <Text style={styles.title} accessibilityRole="header">
            Reservation Confirmed — Demo
          </Text>
          <Text style={styles.reference} selectable>
            {reservation.reference}
          </Text>
        </View>

        <Card>
          <Text style={styles.eventTitle}>{reservation.event.title}</Text>
          <LabelValueRow label="Date" value={formatDateLong(reservation.event.date)} />
          <LabelValueRow label="Time" value={`${formatTime(reservation.event.startTime)} (Eastern Time)`} />
          <LabelValueRow label="Venue" value={reservation.event.venue} />
          <Divider />
          <LabelValueRow label="Seat" value={formatSeat(reservation.sectionNumber, reservation.row)} />
          <LabelValueRow label="Ticket type" value={reservation.ticketType} />
          <PricingSummary totals={reservation} />
        </Card>

        <NoticeBox
          tone="warning"
          icon="information-circle"
          text="This is a simulated reservation. No real tickets have been purchased, held, or reserved."
        />

        <PrimaryButton label="Back to Events" onPress={toEvents} />
        <PrimaryButton label="View My Tickets" variant="outline" onPress={toTickets} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg },
  success: { alignItems: 'center', gap: spacing.sm },
  check: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...typography.title, color: colors.text, textAlign: 'center' },
  reference: { ...typography.heading, color: colors.purple, letterSpacing: 1 },
  eventTitle: { ...typography.heading, color: colors.text, marginBottom: spacing.xs },
});
