import React, { forwardRef, useId } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, fontSize, fonts, radius, shadow, size } from '../theme/tokens';
import { type } from '../theme/typography';

type Props = TextInputProps & {
  label: string;
  error?: string | null;
};

/** 라벨 + 입력창. Figma 로그인 화면 Input 스타일(테두리 + 그림자)을 회원가입에도 쓴다. 테두리 색은 colors.inputBorder */
export const TextField = forwardRef<TextInput, Props>(function TextField({ label, error, style, ...rest }, ref) {
  const id = useId();
  return (
    <View style={styles.wrap}>
      <Text nativeID={id} style={type.label}>
        {label}
      </Text>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        accessibilityLabelledBy={id}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...rest}
      />
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { width: '100%', gap: 8 },
  input: {
    height: size.input,
    paddingHorizontal: 16,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.surface,
    fontFamily: fonts.monoKoRegular,
    fontSize: fontSize.md,
    color: colors.textStrong,
    ...shadow.input,
  },
  inputError: { borderColor: colors.danger },
  error: { fontFamily: fonts.sansRegular, fontSize: fontSize.xs, color: colors.danger },
});
