import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { ListSeparator } from '@/components/ListSeparator';
import { NoticeBox } from '@/components/NoticeBox';
import { Screen } from '@/components/Screen';
import { StateView } from '@/components/StateViews';
import { ReservationCard } from '@/screens/TicketsScreen/components/ReservationCard';
import { colors, spacing, typography } from '@/utils/theme';
import { useReservations } from '@/store/ReservationsContext';
import type { Reservation } from '@/types';
import { isCancelled } from '@/utils/reservation';

const keyExtractor = (reservation: Reservation) => reservation.id;

export default function TicketsScreen() {
  const router = useRouter();
  const { reservations, loading, loadError } = useReservations();
  const active = reservations.filter((reservation) => !isCancelled(reservation));

  const openReservation = useCallback(
    (id: string) => router.push({ pathname: '/ticket/[id]', params: { id } }),
    [router],
  );
  const renderItem = useCallback(
    ({ item }: { item: Reservation }) => <ReservationCard reservation={item} onPress={openReservation} />,
    [openReservation],
  );

  return (
    <Screen>
      <FlatList
        data={active}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={ListSeparator}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title} accessibilityRole="header">
              My Tickets
            </Text>
            <Text style={styles.sub}>
              Demo tickets saved on this device. They open without internet. No real tickets are held or sold.
            </Text>
            {loadError && (
              <NoticeBox
                tone="warning"
                alert
                text="Your saved tickets couldn't be read, so new reservations are paused to keep them safe."
              />
            )}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.purple} style={{ marginTop: spacing.xl }} />
          ) : (
            <StateView
              icon="ticket-outline"
              title="No reservations yet"
              message="Reserve demo tickets for an event and they will appear here."
              actionLabel="Browse events"
              onAction={() => router.navigate('/')}
            />
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  header: { gap: spacing.sm, marginBottom: spacing.md },
  title: { ...typography.display, color: colors.text },
  sub: { ...typography.body, color: colors.textMuted },
});
