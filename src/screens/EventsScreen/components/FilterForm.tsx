import { Ionicons } from '@expo/vector-icons';
import { memo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { DateRangeField } from './DateControls';
import { SelectSheet } from './SelectSheet';
import { MIN_TOUCH, colors, radii, spacing, typography } from '@/utils/theme';
import type { DateRange, DateString } from '@/types';
import type { ContentFilter, EventFilters, FilterOptions } from '@/types/catalog';

const CONTENT: { value: ContentFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'event', label: 'Events' },
  { value: 'promotion', label: 'Promotions' },
];

type SheetKey = 'venue' | 'type' | 'category' | null;

interface Props {
  value: EventFilters;
  options: FilterOptions;
  today: DateString;
  onChange: (patch: Partial<EventFilters>) => void;
  compact?: boolean;
}

export function FilterForm({ value, options, today, onChange, compact }: Props) {
  const [sheet, setSheet] = useState<SheetKey>(null);
  const label = (id: string | null, list: { id: string; label: string }[]) =>
    id ? (list.find((option) => option.id === id)?.label ?? id) : null;

  return (
    <View style={styles.wrap}>
      <SearchField value={value.searchQuery} onChange={(searchQuery) => onChange({ searchQuery })} />

      {!compact && <Text style={styles.sectionLabel}>DATES</Text>}
      <DateRangeField
        range={value.range}
        today={today}
        onChange={(range: DateRange | null) => onChange({ range })}
      />

      {!compact && <Text style={styles.sectionLabel}>VENUE, TYPE &amp; CATEGORY</Text>}
      <View style={styles.selects}>
        <SelectChip name="Venue" value={label(value.venueId, options.venues)} onPress={() => setSheet('venue')} />
        <SelectChip name="Type" value={label(value.typeId, options.types)} onPress={() => setSheet('type')} />
        <SelectChip
          name="Category"
          value={label(value.categoryId, options.categories)}
          onPress={() => setSheet('category')}
        />
      </View>

      {!compact && <Text style={styles.sectionLabel}>SHOW</Text>}
      <Segmented value={value.content} onChange={(content) => onChange({ content })} />

      <SelectSheet
        visible={sheet === 'venue'}
        title="Venue"
        allLabel="All venues"
        options={options.venues}
        selectedId={value.venueId}
        onSelect={(venueId) => onChange({ venueId })}
        onClose={() => setSheet(null)}
      />
      <SelectSheet
        visible={sheet === 'type'}
        title="Event type"
        allLabel="All types"
        options={options.types}
        selectedId={value.typeId}
        onSelect={(typeId) => onChange({ typeId })}
        onClose={() => setSheet(null)}
      />
      <SelectSheet
        visible={sheet === 'category'}
        title="Category"
        allLabel="All categories"
        options={options.categories}
        selectedId={value.categoryId}
        onSelect={(categoryId) => onChange({ categoryId })}
        onClose={() => setSheet(null)}
      />
    </View>
  );
}

function SearchField({ value, onChange }: { value: string; onChange: (query: string) => void }) {
  return (
    <View style={styles.search}>
      <Ionicons name="search" size={20} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Search events, venues, artists"
        placeholderTextColor={colors.textMuted}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        accessibilityLabel="Search events"
        style={styles.searchInput}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChange('')}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={8}
          style={styles.searchClear}
        >
          <Ionicons name="close-circle" size={20} color={colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

const SelectChip = memo(function SelectChip({
  name,
  value,
  onPress,
}: {
  name: string;
  value: string | null;
  onPress: () => void;
}) {
  const active = value !== null;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={active ? `${name} filter: ${value}. Change` : `${name} filter: any. Choose`}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
        {value ?? name}
      </Text>
      <Ionicons name="chevron-down" size={14} color={active ? colors.white : colors.textMuted} />
    </Pressable>
  );
});

const Segmented = memo(function Segmented({
  value,
  onChange,
}: {
  value: ContentFilter;
  onChange: (content: ContentFilter) => void;
}) {
  return (
    <View style={styles.track} accessibilityRole="radiogroup" accessibilityLabel="Content type">
      {CONTENT.map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityLabel={`Show ${option.label.toLowerCase()}`}
            accessibilityState={{ selected }}
            style={[styles.segment, selected && styles.segmentSelected]}
          >
            <Text style={[styles.segmentText, selected && styles.segmentTextSelected]} numberOfLines={1}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  sectionLabel: { ...typography.label, color: colors.textMuted, marginTop: spacing.sm },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: MIN_TOUCH,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  searchInput: { flex: 1, ...typography.body, color: colors.text, paddingVertical: 10 },
  searchClear: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  selects: { flexDirection: 'row', gap: spacing.sm },
  chip: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  chipActive: { backgroundColor: colors.purple, borderColor: colors.purple },
  chipText: { ...typography.small, fontWeight: '700', color: colors.text, flexShrink: 1 },
  chipTextActive: { color: colors.white },
  track: { flexDirection: 'row', backgroundColor: colors.lavender, borderRadius: radii.md, padding: 3 },
  segment: {
    flex: 1,
    minHeight: MIN_TOUCH - 8,
    borderRadius: radii.md - 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentSelected: { backgroundColor: colors.purple },
  segmentText: { ...typography.small, fontWeight: '700', color: colors.deepPurple },
  segmentTextSelected: { color: colors.white },
});
