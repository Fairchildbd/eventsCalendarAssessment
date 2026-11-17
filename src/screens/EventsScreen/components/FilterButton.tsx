import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii } from '@/utils/theme';
import { useEventFilters } from '@/store/EventFiltersContext';

export function FilterButton({ onPress }: { onPress: () => void }) {
  const { activeCount } = useEventFilters();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={activeCount > 0 ? `Filters, ${activeCount} active` : 'Filters'}
      hitSlop={6}
      style={styles.button}
    >
      <Ionicons name="options-outline" size={24} color={colors.white} />
      {activeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText} maxFontSizeMultiplier={1.2}>
            {activeCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: 4,
    right: 2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.pinkTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 11, lineHeight: 14, fontWeight: '800', color: colors.deepPurple },
});
