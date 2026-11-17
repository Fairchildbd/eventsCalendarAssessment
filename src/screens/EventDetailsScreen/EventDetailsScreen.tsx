import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, type ComponentProps } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryBadge, FeaturedBadge } from '@/components/Badges';
import { PrimaryButton } from '@/components/Buttons';
import { Collapsible } from '@/components/Collapsible';
import { EventImage } from '@/components/EventImage';
import { IconTextRow } from '@/components/IconTextRow';
import { Screen } from '@/components/Screen';
import { StateView } from '@/components/StateViews';
import { colors, radii, spacing, typography } from '@/utils/theme';
import { useGoBack } from '@/hooks/useGoBack';
import { useNow } from '@/hooks/useNow';
import { useTicketedEvent } from '@/hooks/useTicketedEvent';
import { useReservations } from '@/store/ReservationsContext';
import { formatDateLong, formatTime } from '@/utils/date';
import { isSportsEvent } from '@/utils/eventFilters';
import { reservationsOpen } from '@/utils/reservation';

type IconName = ComponentProps<typeof Ionicons>['name'];

const LIMITED_AVAILABILITY_THRESHOLD = 8;

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const goBack = useGoBack('/');
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { remainingFor } = useReservations();
  const { catalogEvent, ticketedEvent } = useTicketedEvent(id);
  const now = useNow();

  const remaining = useMemo(
    () => (ticketedEvent ? ticketedEvent.ticketInventory.reduce((sum, listing) => sum + remainingFor(listing), 0) : 0),
    [ticketedEvent, remainingFor],
  );

  if (!catalogEvent) {
    return (
      <Screen onBack={goBack}>
        <StateView
          icon="alert-circle-outline"
          title="Event not found"
          message="This event isn't in the current event list. It may have been removed or the list may have changed."
          actionLabel="Back to events"
          onAction={() => router.replace('/')}
        />
      </Screen>
    );
  }

  const open = ticketedEvent ? reservationsOpen(ticketedEvent, new Date(now)) : true;
  const soldOut = remaining <= 0;
  const limited = !soldOut && remaining <= LIMITED_AVAILABILITY_THRESHOLD;
  const availability: { icon: IconName; color: string; text: string } = !open
    ? { icon: 'time', color: colors.danger, text: 'Reservations closed (event has started)' }
    : soldOut
      ? { icon: 'close-circle', color: colors.danger, text: 'Sold out (demo inventory)' }
      : limited
        ? { icon: 'alert-circle', color: colors.warning, text: 'Limited availability (demo inventory)' }
        : { icon: 'checkmark-circle', color: colors.success, text: 'Tickets available (demo inventory)' };

  const { sourceUrl } = catalogEvent;
  const kind = catalogEvent.contentType === 'promotion' ? 'Promotion' : 'Entertainment';
  const wide = Boolean(catalogEvent.bannerUrl);
  const tags = [...catalogEvent.eventTypes, ...catalogEvent.promoCategories].map((facet) => facet.label);
  const dateText =
    catalogEvent.endDate !== catalogEvent.date
      ? `${formatDateLong(catalogEvent.date)} – ${formatDateLong(catalogEvent.endDate)}`
      : formatDateLong(catalogEvent.date);
  const timeText =
    catalogEvent.startTime && !catalogEvent.allDay ? `${formatTime(catalogEvent.startTime)} (Eastern Time)` : 'All day';

  return (
    <Screen onBack={goBack}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}>
        <EventImage
          uri={catalogEvent.bannerUrl ?? catalogEvent.thumbnailUrl}
          sports={isSportsEvent(catalogEvent)}
          width={width}
          style={wide ? styles.banner : styles.hero}
          iconSize={56}
        />

        <View style={styles.body}>
          <View style={styles.badges}>
            <CategoryBadge label={kind} />
            {catalogEvent.featured && <FeaturedBadge />}
          </View>
          <Text style={styles.title} accessibilityRole="header">
            {catalogEvent.title}
          </Text>
          {ticketedEvent?.tagline ? <Text style={styles.tagline}>{ticketedEvent.tagline}</Text> : null}
          {tags.length > 0 && <Text style={styles.tags}>{tags.join(' · ')}</Text>}

          <View style={styles.facts}>
            <IconTextRow icon="calendar-outline" text={dateText} />
            <IconTextRow icon="time-outline" text={timeText} />
            {catalogEvent.venue && <IconTextRow icon="location-outline" text={catalogEvent.venue.label} />}
          </View>

          {ticketedEvent ? (
            <>
              <View
                style={styles.statusRow}
                accessible
                accessibilityLabel={`${availability.text}. ${ticketedEvent.onSale}`}
              >
                <Ionicons name={availability.icon} size={20} color={availability.color} />
                <Text style={[styles.status, { color: availability.color }]}>{availability.text}</Text>
              </View>
              <Text style={styles.onSale}>{ticketedEvent.onSale}</Text>

              <View style={styles.notices}>
                {ticketedEvent.notices
                  .filter((notice) => notice.id !== 'demo')
                  .map((notice) => (
                    <View key={notice.id} style={styles.notice}>
                      <Ionicons name={notice.icon} size={20} color={colors.purple} />
                      <Text style={styles.noticeText}>{notice.text}</Text>
                    </View>
                  ))}
              </View>

              <PrimaryButton
                label={!open ? 'Reservations Closed' : soldOut ? 'Sold Out' : 'Choose Tickets'}
                showChevron={open && !soldOut}
                disabled={soldOut || !open}
                onPress={() => router.push({ pathname: '/event/[id]/tickets', params: { id: catalogEvent.id } })}
              />
              <Text style={styles.small}>
                Demo only: prices and availability are fictional and no real tickets are sold or held.
              </Text>
            </>
          ) : (
            <View style={styles.notice}>
              <Ionicons name="information-circle" size={20} color={colors.purple} />
              <Text style={styles.noticeText}>
                {catalogEvent.contentType === 'promotion'
                  ? 'This is a promotion listing. No tickets are involved.'
                  : 'Demo ticket reservations are simulated only for timed Mohegan Sun Arena events.'}
              </Text>
            </View>
          )}

          {catalogEvent.description !== '' && (
            <>
              <Text style={styles.sectionTitle} accessibilityRole="header">
                Event Details
              </Text>
              <Text style={styles.description}>{catalogEvent.description}</Text>
            </>
          )}

          {ticketedEvent?.schedule && (
            <View style={styles.schedule}>
              <Text style={styles.sectionTitle} accessibilityRole="header">
                Event Schedule
              </Text>
              {ticketedEvent.schedule.map((schedule) => (
                <View key={schedule.label} style={styles.scheduleRow}>
                  <Text style={styles.scheduleLabel}>{schedule.label}</Text>
                  <Text style={styles.scheduleDetail}>{schedule.detail}</Text>
                </View>
              ))}
              <Text style={styles.small}>Illustrative schedule for this demo.</Text>
            </View>
          )}

          {sourceUrl && (
            <PrimaryButton
              label="View on mohegansun.com"
              variant="outline"
              onPress={() => {
                void Linking.openURL(sourceUrl).catch(() => undefined);
              }}
            />
          )}

          {ticketedEvent && ticketedEvent.policies.length > 0 && (
            <Collapsible title="Venue Information & Policies">
              {ticketedEvent.policies.map((policy) => (
                <View key={policy.id} style={styles.policy}>
                  <Text style={styles.policyTitle}>{policy.title}</Text>
                  <Text style={styles.policyBody}>{policy.body}</Text>
                </View>
              ))}
              <Text style={styles.small}>
                Illustrative reference copy only, not official or binding policy. Check mohegansun.com for current policies.
              </Text>
            </Collapsible>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', height: 200 },
  banner: { width: '100%', aspectRatio: 1440 / 500 },
  body: {
    padding: spacing.lg,
    gap: spacing.md,
    marginTop: -spacing.lg,
    backgroundColor: colors.cream,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
  },
  badges: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  title: { ...typography.display, color: colors.text },
  tags: { ...typography.small, fontWeight: '700', color: colors.textMuted, marginTop: -spacing.sm },
  tagline: { ...typography.subheading, color: colors.purple, marginTop: -spacing.sm },
  facts: { gap: spacing.sm },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  status: { ...typography.subheading, flex: 1 },
  onSale: { ...typography.small, color: colors.textMuted, marginTop: -spacing.sm },
  notices: { gap: spacing.sm },
  notice: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  noticeText: { ...typography.body, color: colors.text, flex: 1 },
  sectionTitle: { ...typography.heading, color: colors.text, marginTop: spacing.sm },
  description: { ...typography.body, color: colors.text },
  schedule: { gap: spacing.sm },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  scheduleLabel: { ...typography.subheading, color: colors.text },
  scheduleDetail: { ...typography.body, color: colors.textMuted, flexShrink: 1, textAlign: 'right' },
  small: { ...typography.small, color: colors.textMuted },
  policy: { gap: 2 },
  policyTitle: { ...typography.subheading, color: colors.purple },
  policyBody: { ...typography.body, color: colors.text },
});
