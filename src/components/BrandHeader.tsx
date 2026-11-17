import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LOGO_URL, colors, spacing, typography } from '@/utils/theme';

const HEADER_CONTENT_HEIGHT = 64;
const BACK_SIZE = 44;

interface Props {
  onBack?: () => void;
  right?: ReactNode;
}

export function BrandHeader({ onBack, right }: Props) {
  const insets = useSafeAreaInsets();
  const [logoFailed, setLogoFailed] = useState(false);
  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <View style={styles.row}>
        {onBack && (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
            style={styles.back}
          >
            <Ionicons name="chevron-back" size={28} color={colors.white} />
          </Pressable>
        )}
        {right ? <View style={styles.right}>{right}</View> : null}
        <View
          style={styles.logoWrap}
          pointerEvents="none"
          accessible
          accessibilityRole="header"
          accessibilityLabel="Mohegan Sun, a world at play"
        >
          {logoFailed ? (
            <View style={styles.fallback}>
              <Text style={styles.fallbackName}>Mohegan Sun</Text>
              <Text style={styles.fallbackTag}>a world at play</Text>
            </View>
          ) : (
            <Image
              source={{ uri: LOGO_URL }}
              style={styles.logo}
              contentFit="contain"
              cachePolicy="memory-disk"
              onError={() => setLogoFailed(true)}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.purple, zIndex: 2 },
  row: { height: HEADER_CONTENT_HEIGHT, justifyContent: 'center' },
  back: {
    position: 'absolute',
    left: spacing.sm,
    width: BACK_SIZE,
    height: BACK_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  right: { position: 'absolute', right: spacing.sm, zIndex: 1 },
  logoWrap: { alignItems: 'center', justifyContent: 'center' },
  logo: { width: 104, height: 56 },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  fallbackName: { ...typography.heading, color: colors.white, fontStyle: 'italic' },
  fallbackTag: { ...typography.small, color: colors.white },
});
