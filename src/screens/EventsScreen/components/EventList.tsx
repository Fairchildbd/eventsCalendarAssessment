import { memo, useCallback, useEffect, useRef, type ReactNode } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { ActiveFilterChips } from './ActiveFilterChips';
import { EventCard } from './EventCard';
import { InlineFilters } from './InlineFilters';
import { ListSeparator } from '@/components/ListSeparator';
import { SyncBanner } from './SyncBanner';
import { StateView } from '@/components/StateViews';
import { colors, spacing, typography } from '@/utils/theme';
import { useEventCatalog } from '@/store/EventCatalogContext';
import { useEventFilters } from '@/store/EventFiltersContext';
import { useNow } from '@/hooks/useNow';
import { useOpenEvent } from '@/hooks/useOpenEvent';
import type { CatalogEvent } from '@/types/catalog';
import { formatUpdated, noDataMessage, statusMessage } from '@/utils/catalogStatus';
import { buildActiveChips, isFilterBarScrolledPast, removeFilter } from '@/utils/eventFilters';

const keyExtractor = (event: CatalogEvent) => event.id;

export const EventList = memo(function EventList({
  lead,
  onFilterBarOffscreen,
}: {
  lead: ReactNode;
  onFilterBarOffscreen?: (offscreen: boolean) => void;
}) {
  const catalog = useEventCatalog();
  const filters = useEventFilters();
  const openEvent = useOpenEvent();
  const { state } = catalog;
  const now = useNow();
  const listRef = useRef<FlatList<CatalogEvent>>(null);
  const filterBarBottom = useRef(Number.POSITIVE_INFINITY);
  const offscreen = useRef(false);

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [filters.filters]);

  const onFiltersLayout = useCallback((event: LayoutChangeEvent) => {
    const { y: top, height } = event.nativeEvent.layout;
    filterBarBottom.current = top + height;
  }, []);
  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const off = isFilterBarScrolledPast(event.nativeEvent.contentOffset.y, filterBarBottom.current);
      if (off !== offscreen.current) {
        offscreen.current = off;
        onFilterBarOffscreen?.(off);
      }
    },
    [onFilterBarOffscreen],
  );

  const retry = useCallback(() => {
    void catalog.refresh();
  }, [catalog]);
  const banner = statusMessage(state);

  const renderItem = useCallback(
    ({ item }: { item: CatalogEvent }) => (
      <View style={styles.item}>
        <EventCard event={item} onPress={openEvent} />
      </View>
    ),
    [openEvent],
  );

  const resultWord =
    filters.filters.content === 'event' ? 'events' : filters.filters.content === 'promotion' ? 'promotions' : 'results';
  const count = filters.events.length;
  const caption =
    state.updatedAt !== null ? formatUpdated(state.updatedAt, now) : null;

  const chips = buildActiveChips(filters.filters, filters.options);

  const header = (
    <View>
      {lead}
      <View style={styles.filters} onLayout={onFiltersLayout}>
        <InlineFilters />
      </View>
      <View style={styles.chipsWrap}>
        <ActiveFilterChips
          chips={chips}
          onRemove={(key) => filters.applyFilters(removeFilter(filters.filters, key))}
          onClearAll={filters.clearAll}
        />
      </View>
      <View style={styles.resultsRow}>
        <Text style={styles.count} accessibilityLiveRegion="polite">
          {count} {count === 1 ? resultWord.replace(/s$/, '') : resultWord}
        </Text>
        <View style={styles.spacer} />
        {caption && <Text style={styles.caption}>{caption}</Text>}
      </View>
    </View>
  );

  let empty: ReactNode;
  if (state.events.length === 0 && state.refreshing) {
    empty = (
      <View style={styles.loading} accessibilityLabel="Loading events" accessibilityLiveRegion="polite">
        <ActivityIndicator color={colors.purple} />
        <Text style={styles.loadingText}>Loading events…</Text>
      </View>
    );
  } else if (state.events.length === 0 && state.error && state.error.kind !== 'aborted') {
    const copy = noDataMessage(state.error.kind, state.error.status);
    empty = (
      <StateView icon="cloud-offline-outline" title={copy.title} message={copy.message} actionLabel="Try again" onAction={retry} />
    );
  } else if (state.events.length === 0) {
    empty = (
      <StateView
        icon="calendar-clear-outline"
        title={state.liveEmpty ? 'No events returned' : 'No events available'}
        message={
          state.liveEmpty
            ? 'The events service responded, but there are no upcoming listings right now. Pull down to refresh.'
            : 'Nothing to show yet.'
        }
      />
    );
  } else if (filters.activeCount > 0) {
    empty = (
      <StateView
        icon="search-outline"
        title="No events match these filters"
        message="Try a different date range, venue or type."
        actionLabel="Clear all filters"
        onAction={filters.clearAll}
      />
    );
  } else {
    empty = <StateView icon="calendar-clear-outline" title="No upcoming events" message="Check back soon." />;
  }

  return (
    <View style={styles.flex}>
      {banner && <SyncBanner message={banner} onAction={retry} />}
      <FlatList
        ref={listRef}
        data={filters.events}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={ListSeparator}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onScroll={onScroll}
        scrollEventThrottle={32}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
        refreshControl={
          <RefreshControl
            refreshing={state.refreshing && state.events.length > 0}
            onRefresh={retry}
            tintColor={colors.purple}
            colors={[colors.purple]}
          />
        }
      />
    </View>
  );
});

const styles = StyleSheet.create({
  flex: { flex: 1 },
  item: { paddingHorizontal: spacing.lg },
  content: { paddingBottom: spacing.xl, paddingHorizontal: 0 },
  filters: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  chipsWrap: { paddingTop: spacing.sm },
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  count: { ...typography.small, fontWeight: '700', color: colors.textMuted },
  spacer: { flex: 1 },
  caption: { ...typography.small, fontSize: 12, color: colors.textMuted },
  loading: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxl },
  loadingText: { ...typography.body, color: colors.textMuted },
});
