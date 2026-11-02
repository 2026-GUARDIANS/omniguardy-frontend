import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fonts, hitSlopFor, radius, size } from '../theme/tokens';
import { Icon } from './icons/Icon';

type Props = {
  title: string;
  onBack: () => void;
  /** 뒤로 버튼의 스크린리더 라벨 (예: "이벤트 기록으로 돌아가기") */
  backLabel: string;
  /** Figma: 회원가입 40px, 상세·프로필 46px */
  buttonSize?: number;
  titleColor?: string;
  /** Figma: 회원가입 20, 그 외 18 */
  titleSize?: number;
};

export function BackHeader({
  title,
  onBack,
  backLabel,
  buttonSize = size.backButton,
  titleColor = colors.headerTitle,
  titleSize = fontSize.h3,
}: Props) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={backLabel}
        onPress={onBack}
        hitSlop={hitSlopFor(buttonSize, buttonSize)}
        style={({ pressed }) => [
          styles.button,
          { width: buttonSize, height: buttonSize },
          pressed && { opacity: 0.85 },
        ]}
      >
        <Icon name="chevronLeft" />
      </Pressable>
      <Text accessibilityRole="header" style={[styles.title, { color: titleColor, fontSize: titleSize }]}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 20 },
  button: {
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: fonts.sansBold },
});
