import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/Buttons';
import { Chip } from './components/Chip';
import { ListSeparator } from '@/components/ListSeparator';
import { NoticeBox } from '@/components/NoticeBox';
import { Screen } from '@/components/Screen';
import { StateView } from '@/components/StateViews';
import { PricingSummary } from '@/components/PricingSummary';
import { QuantitySelector } from './components/QuantitySelector';
import { TicketRow } from './components/TicketRow';
import { colors, shadows, spacing, typography } from '@/utils/theme';
import { SERVICE_FEE_CENTS_PER_TICKET } from '@/utils/demoEvents';
import { useGoBack } from '@/hooks/useGoBack';
import { useNow } from '@/hooks/useNow';
import { useTicketedEvent } from '@/hooks/useTicketedEvent';
import { useReservations } from '@/store/ReservationsContext';
import type { TicketListing } from '@/types';
import { formatDateMedium, formatTime } from '@/utils/date';
import { formatTicketCount } from '@/utils/format';
import { calculateTotals, formatCents, maxQuantityFor } from '@/utils/money';
import { RESERVATIONS_CLOSED_MESSAGE, reservationsOpen } from '@/utils/reservation';

const keyExtractor = (listing: TicketListing) => listing.id;

export default function TicketSelectionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { remainingFor } = useReservations();
  const { ticketedEvent: event } = useTicketedEvent(id);

  const [filterSection, setFilterSection] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [requestedQty, setRequestedQty] = useState(1);
  const now = useNow();

  const goBack = useGoBack('/');

  if (event && !reservationsOpen(event, new Date(now))) {
    return (
      <Screen onBack={goBack}>
        <StateView
          icon="time-outline"
          title="Reservations closed"
          message={RESERVATIONS_CLOSED_MESSAGE}
          actionLabel="Back to events"
          onAction={() => router.replace('/')}
        />
      </Screen>
    );
  }

  if (!event) {
    return (
      <Screen onBack={goBack}>
        <StateView
          icon="alert-circle-outline"
          title="Event not found"
          message="This event doesn't exist or is no longer listed."
          actionLabel="Back to events"
          onAction={() => router.replace('/')}
        />
      </Screen>
    );
  }

  const inventory = [...event.ticketInventory].sort(
    (firstListing, secondListing) => firstListing.sectionNumber - secondListing.sectionNumber || firstListing.row.localeCompare(secondListing.row),
  );
  const sections = [...new Set(inventory.map((listing) => listing.sectionNumber))];
  const visible = inventory.filter((listing) => filterSection === null || listing.sectionNumber === filterSection);
  const selected = inventory.find((listing) => listing.id === selectedId);
  const max = selected ? maxQuantityFor({ ...selected, available: remainingFor(selected) }) : 0;
  const quantity = max > 0 ? Math.min(Math.max(requestedQty, 1), max) : 0;
  const totals =
    selected && quantity > 0
      ? calculateTotals(selected.priceCents, quantity, SERVICE_FEE_CENTS_PER_TICKET)
      : null;

  const onSelectSection = (section: number | null) => {
    setFilterSection(section);
    if (selected && section !== null && selected.sectionNumber !== section) setSelectedId(null);
  };

  const renderItem = ({ item }: { item: TicketListing }) => (
    <TicketRow
      listing={item}
      remaining={remainingFor(item)}
      selected={item.id === selectedId}
      onSelect={setSelectedId}
    />
  );

  const header = (
    <View style={styles.header}>
      <Text style={styles.title} accessibilityRole="header">
        Choose Your Tickets
      </Text>
      <Text style={styles.eventName}>{event.title}</Text>
      <Text style={styles.eventMeta}>
        {formatDateMedium(event.date)} · {formatTime(event.startTime)} · {event.venue}
      </Text>
      <NoticeBox
        tone="warning"
        icon="information-circle"
        alert
        text="Demo only: fictional inventory and prices. No real tickets are sold or held."
      />
      <Text style={styles.filterLabel}>SECTION</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        <Chip label="All" selected={filterSection === null} onPress={() => onSelectSection(null)} accessibilityLabel="All sections" />
        {sections.map((sectionNumber) => (
          <Chip
            key={sectionNumber}
            label={String(sectionNumber)}
            selected={filterSection === sectionNumber}
            onPress={() => onSelectSection(filterSection === sectionNumber ? null : sectionNumber)}
            accessibilityLabel={`Section ${sectionNumber}`}
          />
        ))}
      </ScrollView>
    </View>
  );

  const footer = (
    <View style={styles.footer}>
      {selected && max > 0 && totals ? (
        <>
          <QuantitySelector quantity={quantity} max={max} onChange={setRequestedQty} />
          <PricingSummary totals={totals} />
        </>
      ) : (
        <Text style={styles.noSelection}>Select a ticket above to choose a quantity and see your total.</Text>
      )}
    </View>
  );

  return (
    <Screen onBack={goBack}>
      <FlatList
        data={visible}
        extraData={[selectedId, quantity]}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={ListSeparator}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        ListEmptyComponent={<Text style={styles.noSelection}>No tickets listed for this section.</Text>}
        contentContainerStyle={styles.content}
        accessibilityRole="radiogroup"
      />
      <View style={[styles.bar, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.barInfo} accessibilityLiveRegion="polite">
          <Text style={styles.barTop}>
            {totals ? `${formatTicketCount(quantity)} · ${formatCents(totals.totalCents)}` : 'No tickets selected'}
          </Text>
          <Text style={styles.barSub}>{totals ? 'Includes demo fees' : 'Pick a ticket above'}</Text>
        </View>
        <PrimaryButton
          label="Review Reservation"
          disabled={!selected || !totals}
          onPress={() =>
            selected &&
            router.push({
              pathname: '/event/[id]/review',
              params: { id: event.id, listingId: selected.id, quantity: String(quantity) },
            })
          }
          style={styles.barButton}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  header: { gap: spacing.sm, marginBottom: spacing.md },
  title: { ...typography.title, color: colors.text },
  eventName: { ...typography.heading, color: colors.purple },
  eventMeta: { ...typography.small, color: colors.textMuted },
  filterLabel: { ...typography.label, color: colors.textMuted },
  filters: { gap: spacing.sm, paddingRight: spacing.lg },
  footer: { gap: spacing.lg, marginTop: spacing.lg },
  noSelection: { ...typography.body, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.md },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.deepPurple,
    ...shadows.raised,
  },
  barInfo: { flex: 1 },
  barTop: { ...typography.subheading, color: colors.white },
  barSub: { ...typography.small, color: colors.onDarkMuted },
  barButton: { flexShrink: 0 },
});
