import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/Buttons';
import { Card } from '@/components/Card';
import { Divider } from '@/components/Divider';
import { IconTextRow } from '@/components/IconTextRow';
import { NoticeBox } from '@/components/NoticeBox';
import { Screen } from '@/components/Screen';
import { StateView } from '@/components/StateViews';
import { PricingSummary } from '@/components/PricingSummary';
import { StepIndicator } from '@/screens/ReviewScreen/components/StepIndicator';
import { colors, spacing, typography } from '@/utils/theme';
import { SERVICE_FEE_CENTS_PER_TICKET } from '@/utils/demoEvents';
import { useGoBack } from '@/hooks/useGoBack';
import { useTicketedEvent } from '@/hooks/useTicketedEvent';
import { useReservations } from '@/store/ReservationsContext';
import { formatDateLong, formatTime } from '@/utils/date';
import { formatSeat, formatTicketCount } from '@/utils/format';
import { calculateTotals, validateQuantity } from '@/utils/money';
import {
  RESERVATIONS_CLOSED_MESSAGE,
  buildReservation,
  reservationsOpen,
} from '@/utils/reservation';

export default function ReviewScreen() {
  const { id, listingId, quantity: qtyParam } = useLocalSearchParams<{
    id: string;
    listingId: string;
    quantity: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addReservation, remainingFor } = useReservations();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitted = useRef(false);

  const { ticketedEvent: event } = useTicketedEvent(id);
  const listing = event?.ticketInventory.find((candidate) => candidate.id === listingId);
  const quantity = Number(qtyParam);
  const goBack = useGoBack('/');

  const confirm = useCallback(async () => {
    if (!event || !listing || submitted.current) return;
    if (!reservationsOpen(event, new Date())) {
      setError(RESERVATIONS_CLOSED_MESSAGE);
      return;
    }
    const live = { ...listing, available: remainingFor(listing) };
    const check = validateQuantity(quantity, live);
    if (!check.ok) {
      setError(check.reason);
      return;
    }
    submitted.current = true;
    setSaving(true);
    setError(null);
    try {
      const reservation = buildReservation(event, live, quantity);
      await addReservation(reservation);
      router.replace({ pathname: '/reservation/[id]', params: { id: reservation.id, fresh: '1' } });
    } catch {
      submitted.current = false;
      setSaving(false);
      setError("We couldn't save your demo reservation on this device. Please try again.");
    }
  }, [event, listing, quantity, remainingFor, addReservation, router]);

  if (!event || !listing || !Number.isInteger(quantity)) {
    return (
      <Screen onBack={goBack}>
        <StateView
          icon="alert-circle-outline"
          title="Nothing to review"
          message="We couldn't find the tickets you selected. Please choose tickets again."
          actionLabel="Back to events"
          onAction={() => router.replace('/')}
        />
      </Screen>
    );
  }

  const totals = calculateTotals(listing.priceCents, quantity, SERVICE_FEE_CENTS_PER_TICKET);

  return (
    <Screen onBack={goBack}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title} accessibilityRole="header">
          Review Reservation
        </Text>
        <StepIndicator current={3} />

        <Card>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <IconTextRow icon="calendar-outline" text={formatDateLong(event.date)} />
          <IconTextRow icon="time-outline" text={formatTime(event.startTime)} />
          <IconTextRow icon="location-outline" text={event.venue} />
          <Divider />
          <IconTextRow icon="ticket-outline" text={formatSeat(listing.sectionNumber, listing.row)} />
          <IconTextRow icon="pricetag-outline" text={listing.ticketType} />
          <IconTextRow icon="people-outline" text={formatTicketCount(quantity)} />
        </Card>

        <PricingSummary totals={totals} />

        <NoticeBox
          tone="warning"
          icon="information-circle"
          text="This is a simulated reservation. No real tickets are purchased, held, or reserved, and nothing is charged."
        />

        {error && <NoticeBox tone="danger" alert text={error} />}
      </ScrollView>
      <View style={[styles.bar, { paddingBottom: insets.bottom + spacing.md }]}>
        <PrimaryButton label="Confirm Reservation" onPress={confirm} loading={saving} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg },
  title: { ...typography.title, color: colors.text, textAlign: 'center' },
  eventTitle: { ...typography.heading, color: colors.text },
  bar: { padding: spacing.lg, paddingBottom: spacing.lg, backgroundColor: colors.deepPurple },
});
