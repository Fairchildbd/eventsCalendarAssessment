import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { MIN_TOUCH, colors, radii, typography } from '@/utils/theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'solid' | 'onPurple' | 'outline' | 'danger';
  showChevron?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  variant = 'solid',
  showChevron,
  style,
}: PrimaryButtonProps) {
  const inactive = disabled || loading;
  const foregroundColor = variant === 'outline' ? colors.purple : variant === 'danger' ? colors.danger : colors.white;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'solid' && styles.solid,
        variant === 'onPurple' && styles.onPurple,
        variant === 'outline' && styles.outline,
        variant === 'danger' && styles.danger,
        inactive && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={foregroundColor} />
      ) : (
        <>
          <Text style={[styles.label, { color: foregroundColor }]} maxFontSizeMultiplier={1.4}>
            {label}
          </Text>
          {showChevron && <Ionicons name="chevron-forward" size={18} color={foregroundColor} />}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: MIN_TOUCH,
    borderRadius: radii.pill,
    paddingHorizontal: 22,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  solid: { backgroundColor: colors.purple },
  onPurple: { backgroundColor: colors.deepPurple },
  outline: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.purple },
  danger: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.danger },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.85 },
  label: { ...typography.button },
});
