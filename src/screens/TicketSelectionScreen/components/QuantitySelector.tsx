import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MIN_TOUCH, colors, radii, spacing, typography } from '@/utils/theme';
import { MIN_QUANTITY } from '@/utils/money';

interface Props {
  quantity: number;
  max: number;
  onChange: (quantity: number) => void;
}

export function QuantitySelector({ quantity, max, onChange }: Props) {
  const canDec = quantity > MIN_QUANTITY;
  const canInc = quantity < max;
  return (
    <View style={styles.row}>
      <View style={styles.labelCol}>
        <Text style={styles.label}>Quantity</Text>
        <Text style={styles.hint}>Max {max} for this option</Text>
      </View>
      <View style={styles.stepper} accessibilityRole="adjustable" accessibilityValue={{ min: MIN_QUANTITY, max, now: quantity }}>
        <StepButton icon="remove" label="Decrease quantity" disabled={!canDec} onPress={() => onChange(quantity - 1)} />
        <Text style={styles.value} accessibilityLiveRegion="polite">
          {quantity}
        </Text>
        <StepButton icon="add" label="Increase quantity" disabled={!canInc} onPress={() => onChange(quantity + 1)} />
      </View>
    </View>
  );
}

function StepButton({
  icon,
  label,
  disabled,
  onPress,
}: {
  icon: 'add' | 'remove';
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={[styles.step, disabled && styles.stepDisabled]}
    >
      <Ionicons name={icon} size={22} color={colors.white} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  labelCol: { flex: 1 },
  label: { ...typography.subheading, color: colors.text },
  hint: { ...typography.small, color: colors.textMuted },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  step: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    borderRadius: radii.pill,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDisabled: { opacity: 0.35 },
  value: { ...typography.title, color: colors.text, minWidth: 28, textAlign: 'center' },
});
