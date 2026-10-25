import { StyleSheet } from 'react-native';

import { colors, fontSize, fonts } from './tokens';

// Figma 텍스트 스타일 중 여러 화면에서 반복되는 것만 모았다.
export const type = StyleSheet.create({
  /** Semantic/Label — 폼 라벨 */
  label: { fontFamily: fonts.sansSemiBold, fontSize: fontSize.sm, color: colors.textLabel },
  /** 섹션 라벨(설정 "위험도별 대응" 등) — IBM Plex Mono SemiBold 12, tracking 0.96 */
  sectionLabel: {
    fontFamily: fonts.monoSemiBold,
    fontSize: fontSize.xs,
    letterSpacing: 0.96,
    color: colors.textLabel,
  },
  /** 섹션 제목(홈 "장치 연결", "최근 이벤트") */
  sectionTitle: { fontFamily: fonts.sansBold, fontSize: fontSize.lg, color: colors.textStrong },
  body: { fontFamily: fonts.sansRegular, fontSize: fontSize.md, color: colors.textSecondary },
  bodySm: { fontFamily: fonts.sansRegular, fontSize: fontSize.sm, color: colors.textSecondary },
  /** 값(시각, 이메일 등) — IBM Plex Mono */
  value: { fontFamily: fonts.monoRegular, fontSize: fontSize.sm, color: colors.textMuted },
  /** 링크(“전체 보기”, “회원가입”) */
  link: { fontFamily: fonts.sansSemiBold, fontSize: fontSize.sm, color: colors.primary },
  /** 탭 화면 큰 제목 — 장식용(tokens.ts textDecorativeTitle 주석 참고) */
  pageTitleDecorative: {
    fontFamily: fonts.sansBold,
    fontSize: fontSize.display,
    lineHeight: 38,
    color: colors.textDecorativeTitle,
  },
});
