import { memo, useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { FeaturedBadge } from '@/components/Badges';
import { PrimaryButton } from '@/components/Buttons';
import { EventImage } from '@/components/EventImage';
import { colors, radii, spacing, typography } from '@/utils/theme';
import type { CatalogEvent } from '@/types/catalog';
import { formatEventWhen } from '@/utils/date';
import { isSportsEvent } from '@/utils/eventFilters';

interface Props {
  events: CatalogEvent[];
  onOpen: (id: string) => void;
}

function FeaturedHeroBase({ events, onOpen }: Props) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const imageHeight = Math.round((width * 500) / 1440) + 36;

  const onScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = Math.round(event.nativeEvent.contentOffset.x / width);
      setIndex((cur) => (cur === next ? cur : next));
    },
    [width],
  );

  if (events.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        accessibilityLabel="Featured events carousel"
      >
        {events.map((event) => (
          <View key={event.id} style={{ width }}>
            <EventImage
              uri={event.bannerUrl ?? event.thumbnailUrl}
              sports={isSportsEvent(event)}
              width={width}
              style={{ width, height: imageHeight }}
              iconSize={48}
            />
            <View style={styles.panel}>
              <View style={styles.info}>
                <FeaturedBadge />
                <Text style={styles.title} numberOfLines={2} accessibilityRole="header">
                  {event.title}
                </Text>
                <Text style={styles.meta} numberOfLines={1}>
                  {formatEventWhen(event)}
                </Text>
                {event.venue && (
                  <Text style={styles.meta} numberOfLines={1}>
                    {event.venue.label}
                  </Text>
                )}
              </View>
              <PrimaryButton label="View Event" variant="onPurple" onPress={() => onOpen(event.id)} style={styles.button} />
            </View>
          </View>
        ))}
      </ScrollView>
      {events.length > 1 && (
        <View
          style={styles.dots}
          accessible
          accessibilityLabel={`Featured event ${index + 1} of ${events.length}`}
        >
          {events.map((event, eventIndex) => (
            <View key={event.id} style={[styles.dot, eventIndex === index && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
}

export const FeaturedHero = memo(FeaturedHeroBase);

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.purple },
  panel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xl + spacing.sm,
    backgroundColor: colors.purple,
  },
  info: { flex: 1, gap: 2, alignItems: 'flex-start' },
  title: { ...typography.heading, fontSize: 20, color: colors.white, marginTop: 4 },
  meta: { ...typography.small, color: colors.white },
  button: { flexShrink: 0, paddingHorizontal: 18 },
  dots: { position: 'absolute', bottom: 10, alignSelf: 'center', flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: radii.pill, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: colors.white, width: 20 },
});
