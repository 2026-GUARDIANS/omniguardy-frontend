import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { USE_MOCK } from '../api';
import { colors, fontSize, fonts, radius } from '../theme/tokens';

/** mock 값임을 알리는 "예시" 표시. 실제 API 모드에서는 렌더링하지 않는다. */
export function ExampleTag() {
  if (!USE_MOCK) return null;
  return (
    <View style={[styles.tag, colors.exampleTagBorder !== "transparent" && styles.tagBorder]} accessible accessibilityLabel="예시 데이터">
      <Text style={styles.text}>예시</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.exampleTagBg,
  },
  // custom 테마: 페이지 배경과 구분되도록 테두리("figma"에서는 적용하지 않아 크기 변화 없음)
  tagBorder: { borderWidth: 1, borderColor: colors.exampleTagBorder },
  text: { fontFamily: fonts.monoKoMedium, fontSize: fontSize.xxs, color: colors.onParchment },
});
