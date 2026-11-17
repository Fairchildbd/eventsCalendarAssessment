import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { BrandHeader } from '@/components/BrandHeader';
import { colors } from '@/utils/theme';

interface Props {
  onBack?: () => void;
  headerRight?: ReactNode;
  children: ReactNode;
}

export function Screen({ onBack, headerRight, children }: Props) {
  return (
    <View style={styles.screen}>
      <BrandHeader onBack={onBack} right={headerRight} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
});
