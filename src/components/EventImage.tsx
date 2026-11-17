import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { memo, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/utils/theme';
import { sizedImage } from '@/utils/image';

interface Props {
  uri?: string;
  sports?: boolean;
  width: number;
  style?: StyleProp<ViewStyle>;
  iconSize?: number;
}

function EventImageBase({ uri, sports, width, style, iconSize = 32 }: Props) {
  const [failed, setFailed] = useState(false);
  return (
    <View style={[styles.box, style]} accessibilityElementsHidden importantForAccessibility="no">
      <Ionicons
        name={sports ? 'basketball' : 'musical-notes'}
        size={iconSize}
        color="rgba(255,255,255,0.35)"
      />
      {uri && !failed && (
        <Image
          source={{ uri: sizedImage(uri, width * 2) }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
          recyclingKey={uri}
          onError={() => setFailed(true)}
        />
      )}
    </View>
  );
}

export const EventImage = memo(EventImageBase);

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
