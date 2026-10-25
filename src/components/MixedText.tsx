import React from 'react';
import { StyleSheet, Text, type StyleProp, type TextProps, type TextStyle } from 'react-native';

import { splitScript } from '../lib/script';
import { fonts, KO_LINE_HEIGHT_RATIO, MONO_LINE_HEIGHT_RATIO, THEME } from '../theme/tokens';

type Weight = 'regular' | 'medium' | 'semibold' | 'bold';

const KO: Record<Weight, string> = {
  regular: fonts.sansRegular,
  medium: fonts.sansMedium,
  semibold: fonts.sansSemiBold,
  bold: fonts.sansBold,
};
const LATIN: Record<Weight, string> = {
  regular: fonts.latinRegular,
  medium: fonts.latinMedium,
  semibold: fonts.latinSemiBold,
  bold: fonts.latinBold,
};

// 'figma'에서 Plex Mono였던 스타일(custom에서는 fonts.mono* = Nunito)
const MONO_FAMILIES: string[] = [fonts.monoRegular, fonts.monoMedium, fonts.monoSemiBold];

type Props = Omit<TextProps, 'children'> & {
  children: string;
  /** 'figma' 테마에서 쓰는 기존 스타일(글꼴 포함). 그대로 적용된다 */
  style: StyleProp<TextStyle>;
  /** 'custom' 테마에서 한글/영문 글꼴의 굵기 */
  weight: Weight;
};

/**
 * 한글·영문이 섞인 문자열 전용(지정된 문자열에만 사용).
 * - 'figma': 기존과 같은 Text 하나.
 * - 'custom': 한글은 IBM Plex Sans KR, 영문·숫자는 Nunito Sans로 중첩 Text를 만든다.
 *   줄 높이는 현재 앱('figma')에서 그 스타일이 쓰던 글꼴의 기본값으로 고정한다.
 *   (sans 스타일 → Plex Sans KR 1.5, mono 스타일 → Plex Mono 1.3) 글꼴이 섞여도 줄 높이가 바뀌지 않는다.
 */
export function MixedText({ children, style, weight, ...rest }: Props) {
  if (THEME !== 'custom') {
    return (
      <Text style={style} {...rest}>
        {children}
      </Text>
    );
  }
  const flat = StyleSheet.flatten(style) ?? {};
  const wasMono = MONO_FAMILIES.includes(flat.fontFamily ?? '');
  const ratio = wasMono ? MONO_LINE_HEIGHT_RATIO : KO_LINE_HEIGHT_RATIO;
  const lineHeight = flat.lineHeight ?? Math.round((flat.fontSize ?? 14) * ratio * 10) / 10;
  return (
    <Text style={[style, { fontFamily: KO[weight], lineHeight }]} {...rest}>
      {splitScript(children).map((run, i) => (
        <Text key={i} style={{ fontFamily: run.ko ? KO[weight] : LATIN[weight] }}>
          {run.text}
        </Text>
      ))}
    </Text>
  );
}
