import { Ionicons } from '@expo/vector-icons';
import { memo, type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CategoryBadge, FeaturedBadge } from '@/components/Badges';
import { EventImage } from '@/components/EventImage';
import { colors, radii, shadows, spacing, typography } from '@/utils/theme';
import type { CatalogEvent } from '@/types/catalog';
import { dateBadgeParts, formatEventWhen } from '@/utils/date';
import { isSportsEvent } from '@/utils/eventFilters';

interface Props {
  event: CatalogEvent;
  onPress: (id: string) => void;
}

const THUMB_W = 104;
const THUMB_H = 66;

function EventCardBase({ event, onPress }: Props) {
  const badge = dateBadgeParts(event.date);
  const when = formatEventWhen(event);
  const kind = event.contentType === 'promotion' ? 'Promotion' : 'Entertainment';
  return (
    <Pressable
      onPress={() => onPress(event.id)}
      accessibilityRole="button"
      accessibilityLabel={`${event.title}, ${kind}${event.featured ? ', featured' : ''}, ${when}${event.venue ? `, ${event.venue.label}` : ''}`}
      accessibilityHint="Opens details"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View>
        <EventImage
          uri={event.thumbnailUrl}
          sports={isSportsEvent(event)}
          width={THUMB_W}
          style={styles.thumb}
        />
        <View style={styles.dateBadge}>
          <Text style={styles.dateMonth} maxFontSizeMultiplier={1.2}>
            {badge.month}
          </Text>
          <Text style={styles.dateDay} maxFontSizeMultiplier={1.2}>
            {badge.day}
          </Text>
        </View>
      </View>
      <View style={styles.body}>
        <View style={styles.badges}>
          <CategoryBadge label={kind} />
          {event.featured && <FeaturedBadge />}
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>
        <MetaRow icon="time-outline" text={when} />
        {event.venue && <MetaRow icon="location-outline" text={event.venue.label} />}
      </View>
      <Ionicons name="chevron-forward" size={22} color={colors.purple} style={styles.chevron} />
    </Pressable>
  );
}

function MetaRow({ icon, text }: { icon: ComponentProps<typeof Ionicons>['name']; text: string }) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={14} color={colors.textMuted} />
      <Text style={styles.metaText} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

export const EventCard = memo(EventCardBase);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.sm,
    paddingRight: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  pressed: { opacity: 0.9 },
  thumb: { width: THUMB_W, height: THUMB_H, borderRadius: radii.sm },
  dateBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: colors.white,
    borderRadius: radii.sm,
    paddingHorizontal: 7,
    paddingVertical: 3,
    alignItems: 'center',
    minWidth: 38,
  },
  dateMonth: { ...typography.label, fontSize: 10, color: colors.purple },
  dateDay: { fontSize: 17, lineHeight: 20, fontWeight: '800', color: colors.deepPurple },
  body: { flex: 1, gap: 4 },
  chevron: { alignSelf: 'center' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  title: { ...typography.subheading, color: colors.text },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { ...typography.small, color: colors.textMuted, flexShrink: 1 },
});
