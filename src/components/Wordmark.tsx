import React from 'react';
import { Platform, StyleSheet, Text } from 'react-native';

import { colors, fonts, THEME } from '../theme/tokens';

/**
 * 로그인 화면 "OmniGuardy" 워드마크. 나중에 로고 이미지로 교체 예정.
 * - 'figma': M3/display/medium (Roboto Regular 45/52). 별도 폰트를 추가하지 않고
 *   Android 시스템 Roboto(sans-serif)를 사용한다. iOS에는 Roboto가 없어 시스템 글꼴로 대체된다.
 * - 'custom': Nunito Sans Light, brown-600. 굵기는 family로 지정(fontWeight 미사용).
 */
export function Wordmark() {
  return (
    <Text accessibilityRole="header" style={styles.text}>
      OmniGuardy
    </Text>
  );
}

const styles = StyleSheet.create({
  text:
    THEME === 'custom'
      ? { fontFamily: fonts.latinLight, fontSize: 45, lineHeight: 52, color: colors.wordmark }
      : {
          fontFamily: Platform.select({ android: 'sans-serif', default: undefined }),
          fontWeight: '400',
          fontSize: 45,
          lineHeight: 52,
          color: colors.wordmark,
        },
});
