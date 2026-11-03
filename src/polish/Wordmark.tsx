import React from 'react';
import { Platform, StyleSheet, Text } from 'react-native';

import { colors } from '../theme/tokens';

/**
 * 'polish' 워드마크. 글꼴·크기는 공용 Wordmark('figma')와 같고(시스템 sans-serif 45/52),
 * 색만 앱 아이콘 바탕색인 세이지(colors.primary #717262, 배경 #FBFBF8 대비 4.8:1)로 바꿨다.
 * 시스템 글꼴이라 글꼴 로드 전(시작 화면)에도 같은 모양으로 보인다.
 */
export function Wordmark({ asHeader = true }: { asHeader?: boolean }) {
  return (
    <Text accessibilityRole={asHeader ? 'header' : undefined} style={s.text}>
      OmniGuardy
    </Text>
  );
}

const s = StyleSheet.create({
  text: {
    fontFamily: Platform.select({ android: 'sans-serif', default: undefined }),
    fontWeight: '400',
    fontSize: 45,
    lineHeight: 52,
    color: colors.primary,
  },
});
