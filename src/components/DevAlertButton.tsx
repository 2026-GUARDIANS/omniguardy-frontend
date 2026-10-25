import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { devTools } from '../api';
import { colors, fontSize, fonts, radius, size } from '../theme/tokens';

/** 개발용: mock HIGH 알림을 즉시 발행. 개발 빌드 + mock 모드에서만 보인다. 디자인 요소 아님. */
export function DevAlertButton() {
  if (!__DEV__ || !devTools) return null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="개발용 HIGH 알림 발생"
      onPress={devTools.triggerHighAlert}
      style={({ pressed }) => [styles.btn, pressed && { opacity: 0.8 }]}
    >
      <Text style={styles.text}>[개발용] HIGH 알림 발생</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: size.minTouch,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.input,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.textMuted,
  },
  text: { fontFamily: fonts.monoKoMedium, fontSize: fontSize.sm, color: colors.textSecondary },
});
