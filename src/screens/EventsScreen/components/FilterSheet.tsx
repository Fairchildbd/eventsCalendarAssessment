import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/BottomSheet';
import { PrimaryButton } from '@/components/Buttons';
import { FilterForm } from '@/screens/EventsScreen/components/FilterForm';
import { colors, spacing, typography } from '@/utils/theme';
import { useEventCatalog } from '@/store/EventCatalogContext';
import { useEventFilters } from '@/store/EventFiltersContext';
import type { EventFilters } from '@/types/catalog';
import { NO_FILTERS, applyEventFilters, countActiveFilters } from '@/utils/eventFilters';

export function FilterSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { state } = useEventCatalog();
  const { filters, options, today, applyFilters } = useEventFilters();

  const [edited, setEdited] = useState<EventFilters | null>(null);
  const draft = edited ?? filters;
  const draftCount = countActiveFilters(draft);
  const matches = applyEventFilters(state.events, draft, today).length;

  const patch = (changes: Partial<EventFilters>) => setEdited({ ...draft, ...changes });
  const cancel = () => {
    setEdited(null);
    onClose();
  };
  const apply = () => {
    applyFilters(draft);
    setEdited(null);
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      title="Filters"
      onClose={cancel}
      closeLabel="Close filters without applying"
      maxHeight="88%"
      headerAction={
        draftCount > 0 ? (
          <Pressable
            onPress={() => setEdited(NO_FILTERS)}
            accessibilityRole="button"
            accessibilityLabel="Reset all filters in this sheet"
            hitSlop={8}
            style={styles.reset}
          >
            <Text style={styles.resetText}>Reset ({draftCount})</Text>
          </Pressable>
        ) : undefined
      }
    >
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.body}>
        <FilterForm value={draft} options={options} today={today} onChange={patch} />
      </ScrollView>

      <View style={styles.actions}>
        <PrimaryButton label="Cancel" variant="outline" onPress={cancel} style={styles.action} />
        <PrimaryButton
          label={matches === 1 ? 'Apply · 1 result' : `Apply · ${matches} results`}
          onPress={apply}
          style={styles.actionWide}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  reset: { minHeight: 44, justifyContent: 'center' },
  resetText: { ...typography.small, fontWeight: '800', color: colors.purple },
  body: { paddingBottom: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  action: { flex: 1 },
  actionWide: { flex: 2 },
});
