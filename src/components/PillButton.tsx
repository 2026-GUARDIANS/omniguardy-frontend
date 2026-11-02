import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, fontSize, fonts, radius, shadow, size } from '../theme/tokens';
import { Icon } from './icons/Icon';
import type { FigmaIconName } from './icons/figmaSvgs';

type Props = {
  label: string;
  onPress: () => void;
  /** primary: colors.primary 채움(로그인/가입하기/상세 보기/확인 완료), secondary: colors.buttonSecondaryBg(경고 끄기) */
  variant?: 'primary' | 'secondary';
  trailingIcon?: FigmaIconName;
  loading?: boolean;
  disabled?: boolean;
  /** Figma 로그인 버튼은 그림자가 흰색(사실상 없음)이라 false로 쓴다 */
  elevated?: boolean;
  /** Figma 기본 16, 알림 화면 "상세 보기"만 17 */
  labelSize?: number;
  /** 테두리 색(1.5px). "transparent"나 미지정이면 테두리 없음 */
  outlineColor?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
};

export function PillButton({
  label,
  onPress,
  variant = 'primary',
  trailingIcon,
  loading = false,
  disabled = false,
  elevated = true,
  labelSize,
  outlineColor,
  style,
  accessibilityHint,
}: Props) {
  const primary = variant === 'primary';
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        primary ? styles.primary : styles.secondary,
        primary && elevated && shadow.button,
        outlineColor && outlineColor !== "transparent" ? { borderWidth: 1.5, borderColor: outlineColor } : null,
        (pressed || inactive) && { opacity: inactive ? 0.6 : 0.85 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={primary ? colors.textOnPrimary : colors.onButtonSecondary} />
      ) : (
        <View style={styles.row}>
          <Text style={[primary ? styles.primaryText : styles.secondaryText, labelSize ? { fontSize: labelSize } : null]}>
            {label}
          </Text>
          {trailingIcon ? <Icon name={trailingIcon} /> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { width: '100%', borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  primary: { minHeight: size.button, paddingVertical: 16, backgroundColor: colors.primary },
  secondary: {
    minHeight: size.buttonSecondary,
    paddingVertical: 18,
    backgroundColor: colors.buttonSecondaryBg,
    borderWidth: 1,
    borderColor: colors.surface,
  },
  primaryText: { fontFamily: fonts.sansBold, fontSize: fontSize.xl, color: colors.textOnPrimary },
  secondaryText: { fontFamily: fonts.sansSemiBold, fontSize: fontSize.xl, color: colors.onButtonSecondary },
});
