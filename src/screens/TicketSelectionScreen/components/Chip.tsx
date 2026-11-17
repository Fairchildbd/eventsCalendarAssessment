import { memo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { MIN_TOUCH, colors, radii, typography } from '@/utils/theme';

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}

export const Chip = memo(function Chip({ label, selected, onPress, accessibilityLabel }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      style={[styles.chip, selected && styles.selected]}
    >
      <Text style={[styles.text, selected && styles.selectedText]} maxFontSizeMultiplier={1.3}>
        {label}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  chip: {
    minHeight: MIN_TOUCH - 4,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: { backgroundColor: colors.purple, borderColor: colors.purple },
  text: { ...typography.small, fontWeight: '700', color: colors.deepPurple },
  selectedText: { color: colors.white },
});
