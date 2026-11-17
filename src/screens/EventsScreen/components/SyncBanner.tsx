import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, Pressable } from 'react-native';

import { colors, spacing, typography } from '@/utils/theme';
import type { StatusMessage } from '@/utils/catalogStatus';

const TONES = {
  warning: { bg: colors.warningBg, fg: colors.warning, icon: 'cloud-offline' as const },
  info: { bg: colors.lavender, fg: colors.purple, icon: 'information-circle' as const },
};

export function SyncBanner({ message, onAction }: { message: StatusMessage; onAction: () => void }) {
  const toneStyle = TONES[message.tone];
  return (
    <View
      style={[styles.bar, { backgroundColor: toneStyle.bg }]}
      accessibilityRole={message.tone === 'warning' ? 'alert' : 'text'}
      accessibilityLiveRegion="polite"
    >
      <Ionicons name={toneStyle.icon} size={18} color={toneStyle.fg} />
      <Text style={[styles.text, { color: toneStyle.fg }]}>{message.text}</Text>
      {message.action && (
        <Pressable onPress={onAction} accessibilityRole="button" accessibilityLabel={message.action} hitSlop={8} style={styles.action}>
          <Text style={[styles.actionText, { color: toneStyle.fg }]}>{message.action}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: 40,
  },
  text: { ...typography.small, flex: 1 },
  action: { minHeight: 36, justifyContent: 'center', paddingHorizontal: spacing.sm },
  actionText: { ...typography.small, fontWeight: '800', textDecorationLine: 'underline' },
});
