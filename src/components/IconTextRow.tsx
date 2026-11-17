import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/utils/theme';

interface Props {
  icon: ComponentProps<typeof Ionicons>['name'];
  text: string;
}

export function IconTextRow({ icon, text }: Props) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={20} color={colors.purple} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  text: { ...typography.subheading, color: colors.text, flex: 1, fontWeight: '500' },
});
