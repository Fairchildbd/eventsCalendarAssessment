import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/utils/theme';

interface Props {
  tone: 'warning' | 'danger';
  text: string;
  icon?: ComponentProps<typeof Ionicons>['name'];
  alert?: boolean;
}

const TONES = {
  warning: { backgroundColor: colors.warningBg, color: colors.warning },
  danger: { backgroundColor: colors.dangerBg, color: colors.danger },
};

export function NoticeBox({ tone, text, icon, alert }: Props) {
  const { backgroundColor, color } = TONES[tone];
  return (
    <View style={[styles.box, { backgroundColor }]} accessibilityRole={alert ? 'alert' : undefined}>
      {icon && <Ionicons name={icon} size={20} color={color} />}
      <Text style={[styles.text, { color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, borderRadius: radii.md, padding: spacing.md },
  text: { ...typography.small, flex: 1 },
});
