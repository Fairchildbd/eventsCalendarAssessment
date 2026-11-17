import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/Buttons';
import { Screen } from '@/components/Screen';
import { StateView } from '@/components/StateViews';
import { PricingSummary } from '@/components/PricingSummary';
import { colors, radii, shadows, spacing, typography } from '@/utils/theme';
import { useGoBack } from '@/hooks/useGoBack';
import { useReservations } from '@/store/ReservationsContext';
import { formatDateLong, formatTime, isoToDateString, timeZoneLabel } from '@/utils/date';
import { formatTicketCount } from '@/utils/format';
import { isCancelled } from '@/utils/reservation';

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getReservation, cancelReservation, loading } = useReservations();
  const [cancelling, setCancelling] = useState(false);
  const reservation = getReservation(id);
  const goBack = useGoBack('/tickets');

  if (!reservation) {
    return (
      <Screen onBack={goBack}>
        {loading ? (
          <ActivityIndicator color={colors.purple} style={{ marginTop: spacing.xxl }} />
        ) : (
          <StateView
            icon="alert-circle-outline"
            title="Ticket not found"
            message="This demo ticket isn't saved on this device."
            actionLabel="My Tickets"
            onAction={() => router.replace('/tickets')}
          />
        )}
      </Screen>
    );
  }

  const reservedOn = formatDateLong(isoToDateString(reservation.createdAt, reservation.event.timeZone));
  const cancelled = isCancelled(reservation);
  const cancelledOn = reservation.cancelledAt ? formatDateLong(isoToDateString(reservation.cancelledAt, reservation.event.timeZone)) : null;

  const confirmCancel = () =>
    Alert.alert(
      'Cancel this reservation?',
      `${formatTicketCount(reservation.quantity)} for ${reservation.event.title} will be released and become available again. This can't be undone.`,
      [
        { text: 'Keep reservation', style: 'cancel' },
        {
          text: 'Cancel reservation',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              await cancelReservation(reservation.id);
              goBack();
            } catch {
              Alert.alert('Couldn\u2019t cancel', 'Your saved tickets could not be updated. Nothing was changed. Please try again.');
            } finally {
              setCancelling(false);
            }
          },
        },
      ],
    );

  return (
    <Screen onBack={goBack}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.ticket}>
          <View style={[styles.banner, cancelled && styles.bannerCancelled]} accessibilityRole="header">
            <Text style={[styles.bannerTitle, cancelled && styles.bannerTitleCancelled]}>
              {cancelled ? 'CANCELLED' : 'DEMO TICKET'}
            </Text>
            <Text style={styles.bannerSub}>{cancelled ? 'DEMO TICKET · NOT VALID' : 'NOT VALID FOR ENTRY'}</Text>
          </View>

          <View style={styles.body}>
            <Text style={styles.eventTitle}>{reservation.event.title}</Text>
            <Field label="Date" value={formatDateLong(reservation.event.date)} />
            <Field label="Start time" value={`${formatTime(reservation.event.startTime)} ${timeZoneLabel(reservation.event.timeZone)}`} />
            <Field label="Venue" value={reservation.event.venue} />
          </View>

          <View style={styles.perforation}>
            <View style={[styles.notch, styles.notchLeft]} />
            <View style={styles.dashes} />
            <View style={[styles.notch, styles.notchRight]} />
          </View>

          <View style={styles.body}>
            <View style={styles.pair}>
              <Field label="Section" value={String(reservation.sectionNumber)} big />
              <Field label="Row" value={reservation.row} big />
              <Field label="Tickets" value={String(reservation.quantity)} big />
            </View>
            <Field label="Ticket type" value={reservation.ticketType} />
            <Field label="Reservation reference" value={reservation.reference} selectable />
            <Field label="Reserved on" value={reservedOn} />
            {cancelledOn && <Field label="Cancelled on" value={cancelledOn} />}
          </View>
        </View>

        <PricingSummary totals={reservation} />

        {cancelled ? (
          <Text style={styles.releasedText} accessibilityRole="alert">
            These tickets were released and are available again for this event.
          </Text>
        ) : (
          <PrimaryButton
            label="Cancel reservation"
            variant="danger"
            onPress={confirmCancel}
            loading={cancelling}
          />
        )}

        <View style={styles.saved} accessible accessibilityLabel="Saved on this device. Available offline.">
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={styles.savedText}>Saved on This Device · available offline</Text>
        </View>
        <Text style={styles.disclaimer}>
          Simulated reservation. No real tickets were purchased, held, or reserved, and this is not an admission credential.
        </Text>
      </ScrollView>
    </Screen>
  );
}

function Field({ label, value, big, selectable }: { label: string; value: string; big?: boolean; selectable?: boolean }) {
  return (
    <View style={[styles.field, big && styles.fieldBig]} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <Text style={[styles.value, big && styles.valueBig]} selectable={selectable}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg },
  ticket: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  banner: { backgroundColor: colors.deepPurple, padding: spacing.lg, alignItems: 'center', gap: 2 },
  bannerCancelled: { backgroundColor: colors.danger },
  bannerTitle: { ...typography.heading, color: colors.pink, letterSpacing: 2 },
  bannerTitleCancelled: { color: colors.white },
  releasedText: { ...typography.body, fontWeight: '700', color: colors.text, textAlign: 'center' },
  bannerSub: { ...typography.label, color: colors.white, letterSpacing: 1.5 },
  body: { padding: spacing.lg, gap: spacing.md },
  eventTitle: { ...typography.title, color: colors.text },
  pair: { flexDirection: 'row', gap: spacing.lg },
  field: { gap: 2 },
  fieldBig: { flex: 1 },
  label: { ...typography.label, color: colors.textMuted },
  value: { ...typography.subheading, color: colors.text },
  valueBig: { ...typography.title, color: colors.purple },
  perforation: { height: 20, justifyContent: 'center' },
  dashes: { marginHorizontal: 18, borderTopWidth: 2, borderStyle: 'dashed', borderColor: colors.borderStrong },
  notch: { position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: colors.cream },
  notchLeft: { left: -10 },
  notchRight: { right: -10 },
  saved: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, justifyContent: 'center' },
  savedText: { ...typography.small, fontWeight: '700', color: colors.success },
  disclaimer: { ...typography.small, color: colors.textMuted, textAlign: 'center' },
});
