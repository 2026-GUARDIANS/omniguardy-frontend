import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fonts, radius, shadow } from '../theme/tokens';
import { Icon } from './icons/Icon';

const BRACKET_COLOR = '#A5A696'; // 모서리 브래킷은 장식이라 Figma 원본 색 유지

/**
 * 이벤트 영상 클립 영역 (Figma 1:502).
 * - videoUrl 있음: 플레이어 자리. TODO: expo-video 도입 시 이 안에 VideoView를 넣는다(의존성 미설치).
 * - videoUrl 없음: 빈 상태.
 */
export function VideoClipArea({ videoUrl }: { videoUrl: string | null }) {
  const hasClip = videoUrl != null;
  return (
    <View
      style={styles.box}
      accessible
      accessibilityLabel={hasClip ? '영상 클립 재생 영역. 플레이어 준비 중' : '영상 클립 없음'}
    >
      {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
        <View key={c} style={[styles.bracket, styles[c]]} />
      ))}
      <Icon name="eye" />
      <Text style={styles.text}>{hasClip ? '영상 클립 (플레이어 연결 예정)' : '이 이벤트에는 영상 클립이 없습니다'}</Text>
    </View>
  );
}

const B = 2;
const styles = StyleSheet.create({
  box: {
    height: 210,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.cardMd,
    ...shadow.card,
  },
  text: { fontFamily: fonts.sansRegular, fontSize: fontSize.sm, color: colors.textSecondary },
  bracket: { position: 'absolute', width: 20, height: 20, borderColor: BRACKET_COLOR },
  tl: { top: 16, left: 16, borderTopWidth: B, borderLeftWidth: B },
  tr: { top: 16, right: 16, borderTopWidth: B, borderRightWidth: B },
  bl: { bottom: 16, left: 16, borderBottomWidth: B, borderLeftWidth: B },
  br: { bottom: 16, right: 16, borderBottomWidth: B, borderRightWidth: B },
});
