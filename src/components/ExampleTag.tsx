import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { USE_MOCK } from '../api';
import { colors, fontSize, fonts, radius } from '../theme/tokens';

/** mock 값임을 알리는 "예시" 표시. 실제 API 모드에서는 렌더링하지 않는다. */
export function ExampleTag() {
  if (!USE_MOCK) return null;
  return (
    <View style={styles.tag} accessible accessibilityLabel="예시 데이터">
      <Text style={styles.text}>예시</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.parchment,
  },
  text: { fontFamily: fonts.monoMedium, fontSize: fontSize.xxs, color: colors.onParchment },
});
