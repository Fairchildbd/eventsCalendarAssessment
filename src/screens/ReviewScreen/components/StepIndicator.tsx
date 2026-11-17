import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/utils/theme';

const STEPS = ['Event', 'Seats', 'Confirm'];

export function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`Step ${current} of 3: ${STEPS[current - 1]}`}>
      {STEPS.map((label, index) => {
        const stepNumber = index + 1;
        const done = stepNumber < current;
        const active = stepNumber === current;
        return (
          <View key={label} style={styles.step}>
            {index > 0 && <View style={[styles.line, stepNumber <= current && styles.lineOn]} />}
            <View style={styles.col}>
              <View style={[styles.circle, (done || active) && styles.circleOn]}>
                {done ? (
                  <Ionicons name="checkmark" size={16} color={colors.white} />
                ) : (
                  <Text style={[styles.num, active && styles.numOn]}>{stepNumber}</Text>
                )}
              </View>
              <Text style={styles.label} maxFontSizeMultiplier={1.2}>
                {label}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', paddingVertical: spacing.sm },
  step: { flexDirection: 'row', alignItems: 'flex-start' },
  col: { alignItems: 'center', gap: 2, width: 64 },
  line: { width: 36, height: 2, backgroundColor: colors.borderStrong, marginTop: 13, marginHorizontal: -10 },
  lineOn: { backgroundColor: colors.purple },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleOn: { backgroundColor: colors.purple, borderColor: colors.purple },
  num: { ...typography.small, fontWeight: '800', color: colors.textMuted },
  numOn: { color: colors.white },
  label: { ...typography.small, color: colors.text },
});
