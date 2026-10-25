import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fonts, size } from '../theme/tokens';

type Props = {
  /** 스크린리더용 전체 라벨 (예: "MEDIUM 모바일 알림 전송") */
  accessibilityLabel: string;
  value: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
};

/**
 * Figma 설정 화면의 "켜기" + 토글(46×28). 라벨과 토글 전체가 44px 이상 터치 영역.
 * 켜짐: 트랙 colors.toggleTrack, 손잡이 colors.toggleKnob ('figma': 조정 세이지 + rgba(0,0,0,0.32) / 'custom': slate-600 + 흰색).
 * 꺼짐: Figma에 없는 상태라 트랙 테두리를 textMuted로 그려 3:1 이상 대비를 확보.
 */
export function LabeledToggle({ accessibilityLabel, value, onChange, disabled }: Props) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onChange(!value)}
      style={({ pressed }) => [styles.wrap, (pressed || disabled) && { opacity: 0.7 }]}
    >
      <Text style={styles.text}>켜기</Text>
      <View style={[styles.track, value ? styles.trackOn : styles.trackOff]}>
        <View style={[styles.knob, value ? styles.knobOn : styles.knobOff]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { minHeight: size.minTouch, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  text: { fontFamily: fonts.sansRegular, fontSize: fontSize.sm, color: colors.textSecondary },
  track: { width: 46, height: 28, borderRadius: 14, padding: 4, justifyContent: 'center' },
  trackOn: { backgroundColor: colors.toggleTrack, alignItems: 'flex-end' },
  trackOff: { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.textMuted, alignItems: 'flex-start', padding: 2 },
  knob: { width: 20, height: 20, borderRadius: 10 },
  knobOn: { backgroundColor: colors.toggleKnob },
  knobOff: { backgroundColor: colors.textMuted },
});
