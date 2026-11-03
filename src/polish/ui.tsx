// 'polish' 테마 공용 부품. 색·글꼴은 tokens.ts(figma 색 + polish 글꼴)를 그대로 쓴다.
// 통일 규칙
//  - 간격: 4/8 단위(P.space)
//  - 테두리: 1px colors.border 하나
//  - 그림자: card(카드) / float(떠 있는 탭 바) 두 가지
//  - 아이콘: 20px, 같은 선 굵기(크기의 8.75%), 둥근 끝·둥근 꺾임
//  - 터치: 44px 이상, Android는 세이지색 리플, 그 밖은 120ms 배경 변화(크기 변화 없음)
import React, { forwardRef, memo, useEffect, useId, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { SvgXml } from 'react-native-svg';

import { isHighOrAbove, type SecurityEvent } from '../api';
import { figmaSvgs, type FigmaIconName } from '../components/icons/figmaSvgs';
import { MixedText } from '../components/MixedText';
import { EventBadge, eventBadgeLabel, RiskDot } from '../components/Risk';
import { daysAgo, formatDayLabel, formatTime } from '../lib/format';
import { colors, fontSize, fonts } from '../theme/tokens';
import { DURATION, EASE_OUT, NATIVE } from './motion';

export const P = {
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  radius: { card: 20, row: 16, input: 12, pill: 999 },
  gutter: 16,
  minTouch: 44,
  icon: 20,
  border: { borderWidth: 1, borderColor: colors.border },
  shadow: {
    card: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
    float: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 6 },
  },
  /** 세이지(primary #717262) 18% — Android 리플·눌림 배경 */
  pressTint: 'rgba(113,114,98,0.18)',
  /** 세이지 채움 위 눌림 */
  pressTintOnPrimary: 'rgba(255,255,255,0.22)',
} as const;

// ─── 아이콘 ─────────────────────────────────────────────
const VIEWBOX_RE = /viewBox="0 0 ([\d.]+) [\d.]+"/;
const STROKE_RATIO = 0.0875; // 20px에서 1.75px

/** Figma SVG를 같은 선 굵기·둥근 끝으로 바꿔 그린다. 장식용(라벨은 감싸는 요소가 준다) */
export function PIcon({ name, color, size = P.icon }: { name: FigmaIconName; color: string; size?: number }) {
  const xml = useMemo(() => {
    const raw: string = figmaSvgs[name];
    const vb = Number(VIEWBOX_RE.exec(raw)?.[1] ?? 24);
    const sw = (vb * STROKE_RATIO).toFixed(3);
    return raw
      .replace(/stroke="(?!none)[^"]*"/g, `stroke="${color}"`)
      .replace(/\sstroke-(width|linecap|linejoin)="[^"]*"/g, '')
      .replace(/stroke="([^"]*)"/g, `stroke="$1" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"`);
  }, [name, color]);
  return (
    <SvgXml xml={xml} width={size} height={size} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />
  );
}

// ─── 누를 수 있는 영역 ──────────────────────────────────
type PressProps = Omit<PressableProps, 'style' | 'children'> & {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  /** 세이지 채움 위라면 true(밝은 눌림 색) */
  onPrimary?: boolean;
};

/** Android: 세이지 리플 / iOS·웹: 120ms 배경 변화. 크기는 바꾸지 않는다. 모서리 밖으로 번지지 않게 overflow hidden */
export function Press({ style, children, onPrimary, onPressIn, onPressOut, ...rest }: PressProps) {
  const tint = onPrimary ? P.pressTintOnPrimary : P.pressTint;
  const v = useState(() => new Animated.Value(0))[0];
  const to = (value: number) =>
    Animated.timing(v, { toValue: value, duration: DURATION.press, easing: EASE_OUT, useNativeDriver: NATIVE }).start();
  const android = Platform.OS === 'android';
  return (
    <Pressable
      android_ripple={android ? { color: tint } : undefined}
      onPressIn={(e) => {
        if (!android) to(1);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        if (!android) to(0);
        onPressOut?.(e);
      }}
      style={[styles.pressBase, style]}
      {...rest}
    >
      {children}
      {!android ? (
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: tint, opacity: v }]} />
      ) : null}
    </Pressable>
  );
}

// ─── 카드 ───────────────────────────────────────────────
export function Card({ style, children }: { style?: StyleProp<ViewStyle>; children: React.ReactNode }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// ─── 버튼 ───────────────────────────────────────────────
export function PButton({
  label,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  trailingIcon,
  outlineColor,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
  trailingIcon?: FigmaIconName;
  outlineColor?: string;
}) {
  const primary = variant === 'primary';
  const inactive = !!(disabled || loading);
  const fg = primary ? colors.textOnPrimary : colors.onButtonSecondary;
  return (
    <Press
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: !!loading }}
      disabled={inactive}
      onPress={onPress}
      onPrimary={primary}
      style={[
        styles.button,
        primary ? styles.buttonPrimary : styles.buttonSecondary,
        outlineColor ? { borderWidth: 1, borderColor: outlineColor } : null,
        inactive && { opacity: 0.6 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.buttonRow}>
          <Text style={[styles.buttonText, { color: fg }]}>{label}</Text>
          {trailingIcon ? <PIcon name={trailingIcon} color={fg} size={18} /> : null}
        </View>
      )}
    </Press>
  );
}

// ─── 입력창 ─────────────────────────────────────────────
export const PField = forwardRef<TextInput, TextInputProps & { label: string; error?: string | null }>(function PField(
  { label, error, style, ...rest },
  ref,
) {
  const id = useId();
  return (
    <View style={styles.fieldWrap}>
      <Text nativeID={id} style={styles.fieldLabel}>
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
        <Text style={styles.fieldError} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
});

// ─── 뒤로 가기 머리 ─────────────────────────────────────
export function PBackHeader({ title, onBack, backLabel }: { title: string; onBack: () => void; backLabel: string }) {
  return (
    <View style={styles.backRow}>
      <Press accessibilityRole="button" accessibilityLabel={backLabel} onPress={onBack} onPrimary style={styles.backBtn}>
        <PIcon name="chevronLeft" color={colors.textOnPrimary} />
      </Press>
      <Text accessibilityRole="header" style={styles.backTitle}>
        {title}
      </Text>
    </View>
  );
}

// ─── 오래된 상태 표시 ───────────────────────────────────
/**
 * 이미 보여 주는 데이터가 있는데 다시 불러오는 중이거나 실패했을 때 알린다.
 * (데이터가 없을 때는 LoadState가 맡는다) 다시 불러오기가 빨리 끝나면 깜빡이지 않게 300ms 뒤에 보인다.
 */
export function StaleNotice({
  hasData,
  loading,
  error,
  onRetry,
}: {
  hasData: boolean;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  const [delayed, setDelayed] = useState(false);
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setDelayed(true), 300);
    return () => {
      clearTimeout(t);
      setDelayed(false);
    };
  }, [loading]);
  const showLoading = loading && delayed;

  if (!hasData) return null;
  if (error) {
    return (
      <View style={[styles.stale, styles.staleError]} accessibilityLiveRegion="polite">
        <Text style={styles.staleText}>최신 정보를 불러오지 못했어요. 아래는 이전에 받은 내용이에요.</Text>
        <Press accessibilityRole="button" accessibilityLabel="다시 시도" onPress={onRetry} style={styles.staleRetry}>
          <Text style={styles.staleRetryText}>다시 시도</Text>
        </Press>
      </View>
    );
  }
  if (showLoading) {
    return (
      <View style={styles.stale} accessibilityLiveRegion="polite">
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.staleText}>최신 정보로 바꾸는 중</Text>
      </View>
    );
  }
  return null;
}

/** 오래된 데이터 위에 덮는 흐림(새로 불러오는 중·실패) */
export const staleDim = (stale: boolean) => (stale ? { opacity: 0.55 } : null);

// ─── 이벤트 줄 ──────────────────────────────────────────
/** 시각 | 위험도 점 | 제목 | 배지. withDay면 오늘이 아닌 이벤트에 날짜를 붙인다 */
export const PEventRow = memo(function PEventRow({
  event,
  onOpen,
  withDay,
}: {
  event: SecurityEvent;
  onOpen: (id: string) => void;
  withDay?: boolean;
}) {
  const time = formatTime(event.occurredAt);
  const day = withDay && daysAgo(event.occurredAt) !== 0 ? formatDayLabel(event.occurredAt) : null;
  return (
    <Press
      accessibilityRole="button"
      accessibilityLabel={`${day ? `${day} ` : ''}${time}, ${event.title}, ${eventBadgeLabel(event)}`}
      accessibilityHint="이벤트 상세를 엽니다"
      onPress={() => onOpen(event.id)}
      style={[styles.row, isHighOrAbove(event.risk) && styles.rowHigh]}
    >
      <View style={styles.when}>
        <Text style={styles.time}>{time}</Text>
        {day ? <Text style={styles.day}>{day}</Text> : null}
      </View>
      <RiskDot risk={event.risk} />
      <Text style={styles.rowTitle} numberOfLines={1}>
        {event.title}
      </Text>
      {/* 공용 배지는 alignSelf: flex-start라 줄 가운데에 맞추려고 감싼다 */}
      <View style={styles.badge}>
        <EventBadge event={event} compact />
      </View>
    </Press>
  );
});

/** 섹션 머리: 제목 + 오른쪽 링크(선택) */
export function SectionHead({ title, link }: { title: string; link?: { label: string; a11y: string; onPress: () => void } }) {
  return (
    <View style={styles.sectionHead}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>
        {title}
      </Text>
      {link ? (
        <Press accessibilityRole="link" accessibilityLabel={link.a11y} onPress={link.onPress} style={styles.link}>
          <Text style={styles.linkText}>{link.label}</Text>
        </Press>
      ) : null}
    </View>
  );
}

/** 숫자·영문이 섞인 짧은 값(Nunito + Plex Sans KR) */
export function Value({ children, style }: { children: string; style: object }) {
  return (
    <MixedText style={style} weight="semibold">
      {children}
    </MixedText>
  );
}

const styles = StyleSheet.create({
  pressBase: { overflow: 'hidden' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: P.radius.card,
    ...P.border,
    ...P.shadow.card,
  },
  button: {
    minHeight: 56,
    borderRadius: P.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: P.space.xl,
  },
  buttonPrimary: { backgroundColor: colors.primary },
  buttonSecondary: { backgroundColor: colors.buttonSecondaryBg },
  buttonRow: { flexDirection: 'row', alignItems: 'center', gap: P.space.sm },
  buttonText: { fontFamily: fonts.sansBold, fontSize: fontSize.xl },

  fieldWrap: { gap: P.space.sm },
  fieldLabel: { fontFamily: fonts.sansSemiBold, fontSize: fontSize.sm, color: colors.textLabel },
  input: {
    height: 52,
    paddingHorizontal: P.space.lg,
    borderRadius: P.radius.input,
    ...P.border,
    backgroundColor: colors.surface,
    fontFamily: fonts.sansRegular,
    fontSize: fontSize.md,
    color: colors.textStrong,
  },
  inputError: { borderColor: colors.danger },
  fieldError: { fontFamily: fonts.sansRegular, fontSize: fontSize.xs, color: colors.danger },

  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: P.space.md,
    paddingHorizontal: P.gutter,
    paddingTop: P.space.lg,
    paddingBottom: P.space.sm,
  },
  backBtn: {
    width: P.minTouch,
    height: P.minTouch,
    borderRadius: P.radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backTitle: { fontFamily: fonts.sansBold, fontSize: fontSize.h3, color: colors.headerTitle },

  stale: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: P.space.sm,
    paddingHorizontal: P.space.md,
    paddingVertical: P.space.sm,
    borderRadius: P.radius.input,
    backgroundColor: colors.parchment,
  },
  staleError: { paddingVertical: P.space.xs },
  staleText: { flex: 1, fontFamily: fonts.sansMedium, fontSize: fontSize.sm, color: colors.onParchment },
  staleRetry: { minHeight: P.minTouch, justifyContent: 'center', paddingHorizontal: P.space.sm, borderRadius: P.radius.input },
  staleRetryText: { fontFamily: fonts.sansBold, fontSize: fontSize.sm, color: colors.primary },

  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: P.space.md,
    paddingHorizontal: P.space.lg,
    paddingVertical: P.space.md,
    backgroundColor: colors.surface,
    borderRadius: P.radius.row,
    ...P.border,
  },
  rowHigh: P.shadow.card,
  badge: { alignSelf: 'center' },
  when: { width: 44 },
  time: { fontFamily: fonts.monoSemiBold, fontSize: fontSize.md, color: colors.textSecondary },
  day: { fontFamily: fonts.sansRegular, fontSize: fontSize.xxs, color: colors.textMuted },
  rowTitle: { flex: 1, fontFamily: fonts.sansSemiBold, fontSize: fontSize.lg, color: colors.textTitle },

  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: P.space.xs },
  sectionTitle: { fontFamily: fonts.sansBold, fontSize: fontSize.lg, color: colors.textStrong },
  link: { minHeight: P.minTouch, justifyContent: 'center', paddingHorizontal: P.space.sm, borderRadius: P.radius.input },
  linkText: { fontFamily: fonts.sansSemiBold, fontSize: fontSize.sm, color: colors.link },
});
