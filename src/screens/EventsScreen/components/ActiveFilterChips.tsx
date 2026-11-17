import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { colors, radii, spacing, typography } from '@/utils/theme';
import type { ActiveChip, FilterKey } from '@/utils/eventFilters';

interface Props {
  chips: ActiveChip[];
  onRemove: (key: FilterKey) => void;
  onClearAll: () => void;
}

export const ActiveFilterChips = memo(function ActiveFilterChips({ chips, onRemove, onClearAll }: Props) {
  if (chips.length === 0) return null;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityLabel="Active filters"
    >
      {chips.map((chip) => (
        <Pressable
          key={chip.key}
          onPress={() => onRemove(chip.key)}
          accessibilityRole="button"
          accessibilityLabel={`Remove filter ${chip.label}`}
          style={styles.chip}
          hitSlop={4}
        >
          <Text style={styles.label} numberOfLines={1}>
            {chip.label}
          </Text>
          <Ionicons name="close" size={14} color={colors.white} />
        </Pressable>
      ))}
      {chips.length > 1 && (
        <Pressable onPress={onClearAll} accessibilityRole="button" accessibilityLabel="Clear all filters" style={styles.clear} hitSlop={4}>
          <Text style={styles.clearText}>Clear all</Text>
        </Pressable>
      )}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.xs, alignItems: 'center' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 34,
    maxWidth: 220,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.purple,
  },
  label: { ...typography.small, fontWeight: '700', color: colors.white, flexShrink: 1 },
  clear: { minHeight: 34, justifyContent: 'center', paddingHorizontal: spacing.sm },
  clearText: { ...typography.small, fontWeight: '800', color: colors.purple },
});
