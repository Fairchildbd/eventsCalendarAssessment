import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, typography } from '@/utils/theme';

export const CategoryBadge = memo(function CategoryBadge({ label }: { label: string }) {
  return (
    <View style={[styles.badge, styles.category]}>
      <Text style={styles.text} maxFontSizeMultiplier={1.3}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
});

export const FeaturedBadge = memo(function FeaturedBadge() {
  return (
    <View style={[styles.badge, styles.featured]}>
      <Text style={[styles.text, styles.featuredText]} maxFontSizeMultiplier={1.3}>
        Featured!
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
  },
  category: { backgroundColor: colors.pinkTint },
  featured: { backgroundColor: colors.deepPurple },
  text: { ...typography.label, color: colors.deepPurple },
  featuredText: { color: colors.pink },
});
