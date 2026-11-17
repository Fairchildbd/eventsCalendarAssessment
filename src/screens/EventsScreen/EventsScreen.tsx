import { useState } from 'react';
import { Keyboard, StyleSheet, Text, View } from 'react-native';

import { EventList } from './components/EventList';
import { FeaturedHero } from './components/FeaturedHero';
import { FilterButton } from './components/FilterButton';
import { FilterSheet } from './components/FilterSheet';
import { Screen } from '@/components/Screen';
import { colors, spacing, typography } from '@/utils/theme';
import { useOpenEvent } from '@/hooks/useOpenEvent';
import { useEventFilters } from '@/store/EventFiltersContext';

export default function EventsScreen() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [barOffscreen, setBarOffscreen] = useState(false);
  const { featured } = useEventFilters();
  const openEvent = useOpenEvent();
  const openFilters = () => {
    Keyboard.dismiss();
    setFiltersOpen(true);
  };

  const lead = (
    <View>
      <FeaturedHero events={featured} onOpen={openEvent} />
      <View style={styles.titles}>
        <Text style={styles.heading} accessibilityRole="header">
          SCHEDULE OF EVENTS
        </Text>
        <Text style={styles.sub}>AT MOHEGAN SUN</Text>
      </View>
    </View>
  );

  return (
    <Screen headerRight={barOffscreen ? <FilterButton onPress={openFilters} /> : undefined}>
      <EventList lead={lead} onFilterBarOffscreen={setBarOffscreen} />
      <FilterSheet visible={filtersOpen} onClose={() => setFiltersOpen(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  titles: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  heading: { ...typography.title, color: colors.text },
  sub: { ...typography.label, color: colors.purple, marginTop: 2 },
});
