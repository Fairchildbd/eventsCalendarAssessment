import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { memo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { MIN_TOUCH, colors, radii, spacing, typography } from '@/utils/theme';
import type { DateRange, DateString } from '@/types';
import {
  dateStringToPickerDate,
  formatDateMedium,
  normalizeRange,
  dateToDateString,
} from '@/utils/date';

interface Props {
  range: DateRange | null;
  today: DateString;
  onChange: (range: DateRange | null) => void;
}

const asDate = dateStringToPickerDate;

interface DateInputProps {
  label: string;
  date: DateString;
  minimumDate: DateString;
  onChange: (date: DateString) => void;
}

function IosDateInput({ label, date, minimumDate, onChange }: DateInputProps) {
  return (
    <View accessible accessibilityLabel={`${label} ${date}`}>
      <DateTimePicker
        value={asDate(date)}
        mode="date"
        display="compact"
        themeVariant="light"
        accentColor={colors.purple}
        minimumDate={asDate(minimumDate)}
        onValueChange={(_event, picked) => onChange(dateToDateString(picked))}
      />
    </View>
  );
}

function AndroidDateInput({ label, date, minimumDate, onChange }: DateInputProps) {
  const open = () =>
    DateTimePickerAndroid.open({
      value: asDate(date),
      mode: 'date',
      minimumDate: asDate(minimumDate),
      title: label,
      onValueChange: (_event, picked) => onChange(dateToDateString(picked)),
    });
  return (
    <Pressable
      onPress={open}
      accessibilityRole="button"
      accessibilityLabel={`${label} ${formatDateMedium(date)}. Change`}
      style={styles.dateButton}
    >
      <Text style={styles.dateText} numberOfLines={1}>
        {formatDateMedium(date)}
      </Text>
    </Pressable>
  );
}

export const DateRangeField = memo(function DateRangeField({ range, today, onChange }: Props) {
  const openDefault = () => onChange({ start: today, end: today });

  const clear = (
    <Pressable
      onPress={() => onChange(null)}
      accessibilityRole="button"
      accessibilityLabel="Clear date filter"
      hitSlop={4}
      style={styles.clear}
    >
      <Ionicons name="close-circle" size={24} color={colors.purple} />
    </Pressable>
  );

  if (range && (Platform.OS === 'ios' || Platform.OS === 'android')) {
    const DateInput = Platform.OS === 'ios' ? IosDateInput : AndroidDateInput;
    return (
      <View style={styles.field}>
        <View style={styles.pickers}>
          <Ionicons name="calendar-outline" size={22} color={colors.purple} />
          <DateInput
            label="Start date"
            date={range.start}
            minimumDate={today}
            onChange={(start) => onChange(normalizeRange({ start, end: range.end }, 'start'))}
          />
          <Text style={styles.dash}>–</Text>
          <DateInput
            label="End date"
            date={range.end}
            minimumDate={range.start}
            onChange={(end) => onChange(normalizeRange({ start: range.start, end }, 'end'))}
          />
        </View>
        {clear}
      </View>
    );
  }

  return (
    <View style={styles.field}>
      <Pressable
        onPress={openDefault}
        accessibilityRole="button"
        accessibilityLabel="Date filter: all upcoming dates. Choose dates"
        style={styles.main}
      >
        <Ionicons name="calendar-outline" size={22} color={colors.purple} />
        <Text style={styles.label} numberOfLines={1}>
          All Upcoming Dates
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: MIN_TOUCH,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  main: {
    flex: 1,
    minHeight: MIN_TOUCH,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  pickers: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingLeft: spacing.md,
  },
  dash: { ...typography.subheading, color: colors.textMuted },
  dateButton: {
    minHeight: MIN_TOUCH - 8,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.lavender,
  },
  dateText: { ...typography.small, fontWeight: '700', color: colors.deepPurple },
  label: { ...typography.subheading, color: colors.text, flex: 1 },
  clear: { width: MIN_TOUCH - 4, height: MIN_TOUCH, alignItems: 'center', justifyContent: 'center' },
});
