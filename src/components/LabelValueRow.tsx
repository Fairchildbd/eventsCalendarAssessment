import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/utils/theme';

interface Props {
  label: string;
  value: string;
  bold?: boolean;
}

export function LabelValueRow({ label, value, bold }: Props) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={[styles.label, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.value, bold && styles.bold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  label: { ...typography.body, color: colors.text, flex: 1 },
  value: { ...typography.body, color: colors.text },
  bold: { ...typography.heading },
});
