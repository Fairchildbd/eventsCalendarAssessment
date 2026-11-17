import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { BottomSheet } from './BottomSheet';
import { MIN_TOUCH, colors, radii, spacing, typography } from '@/utils/theme';
import type { FacetOption } from '@/types/catalog';

interface Props {
  visible: boolean;
  title: string;
  allLabel: string;
  options: FacetOption[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onClose: () => void;
}

const SEARCH_THRESHOLD = 8;

export function SelectSheet({ visible, title, allLabel, options, selectedId, onSelect, onClose }: Props) {
  const [query, setQuery] = useState('');
  const searchable = options.length > SEARCH_THRESHOLD;
  const normalizedQuery = query.trim().toLowerCase();
  const shown = normalizedQuery ? options.filter((option) => option.label.toLowerCase().includes(normalizedQuery)) : options;

  const close = () => {
    setQuery('');
    onClose();
  };
  const choose = (id: string | null) => {
    setQuery('');
    onSelect(id);
    onClose();
  };

  return (
    <BottomSheet visible={visible} title={title} onClose={close} closeLabel={`Close ${title} list`} maxHeight={560}>
      {searchable && (
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={`Search ${title.toLowerCase()}`}
            placeholderTextColor={colors.textMuted}
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
            returnKeyType="search"
            accessibilityLabel={`Search ${title.toLowerCase()}`}
            style={styles.input}
          />
        </View>
      )}

      <FlatList
        data={shown}
        keyExtractor={(option) => option.id}
        keyboardShouldPersistTaps="handled"
        style={styles.list}
        ListHeaderComponent={
          normalizedQuery ? undefined : <Row label={allLabel} selected={selectedId === null} onPress={() => choose(null)} />
        }
        renderItem={({ item }) => (
          <Row label={item.label} count={item.count} selected={item.id === selectedId} onPress={() => choose(item.id)} />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No matches for “{query}”.</Text>}
      />
    </BottomSheet>
  );
}

function Row({ label, count, selected, onPress }: { label: string; count?: number; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={count !== undefined ? `${label}, ${count} listings` : label}
      style={styles.row}
    >
      <Text style={[styles.rowLabel, selected && styles.rowSelected]} numberOfLines={1}>
        {label}
      </Text>
      {count !== undefined && <Text style={styles.count}>{count}</Text>}
      {selected && <Ionicons name="checkmark" size={20} color={colors.purple} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.lavender,
    marginBottom: spacing.sm,
  },
  input: { flex: 1, ...typography.body, color: colors.text, paddingVertical: 8 },
  list: { flexGrow: 0 },
  row: {
    minHeight: MIN_TOUCH,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLabel: { ...typography.body, color: colors.text, flex: 1 },
  rowSelected: { fontWeight: '700', color: colors.purple },
  count: { ...typography.small, color: colors.textMuted },
  empty: { ...typography.body, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.xl },
});
