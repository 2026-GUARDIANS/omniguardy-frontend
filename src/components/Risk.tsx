import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { isHighOrAbove, type EventStatus, type RiskLevel, type SecurityEvent } from '../api';
import { colors, fontSize, fonts, radius, riskColors } from '../theme/tokens';

type BadgeSize = { compact?: boolean; large?: boolean };

/** 위험도 배지. 색과 함께 HIGH/MEDIUM/LOW/CRITICAL 텍스트를 항상 표시한다. */
export function RiskBadge({ risk, compact = false, large = false }: { risk: RiskLevel } & BadgeSize) {
  return (
    <View
      accessible
      accessibilityLabel={`위험도 ${risk}`}
      style={[
        styles.badge,
        compact && styles.compact,
        large && styles.large,
        { backgroundColor: riskColors[risk].badge },
      ]}
    >
      <Text style={[styles.badgeText, large && styles.largeText, { color: riskColors[risk].badgeText }]}>{risk}</Text>
      {/* 1px 테두리를 겹쳐 그린다(레이아웃에 참여하지 않아 배지 크기는 그대로). 'custom' MEDIUM/LOW만 */}
      {riskColors[risk].badgeBorder ? (
        <View pointerEvents="none" style={[styles.badgeBorder, { borderColor: riskColors[risk].badgeBorder }]} />
      ) : null}
    </View>
  );
}

/** 위험도가 없는 이벤트의 상태 문구 */
export const PENDING_LABEL: Record<EventStatus, string> = {
  ANALYZING: '분석 중',
  FAILED: '분석 실패',
  COMPLETED: '판정 없음',
};

/** 위험도가 없는 이벤트(분석 중·분석 실패·판정 없음)의 상태 배지. 위험도 배지와 같은 크기 */
export function StatusBadge({ status, compact = false, large = false }: { status: EventStatus } & BadgeSize) {
  return (
    <View
      accessible
      accessibilityLabel={`위험도 없음, ${PENDING_LABEL[status]}`}
      style={[styles.badge, compact && styles.compact, large && styles.large, styles.pending]}
    >
      <Text style={[styles.pendingText, large && styles.largeText]}>{PENDING_LABEL[status]}</Text>
      <View pointerEvents="none" style={[styles.badgeBorder, styles.pendingBorder]} />
    </View>
  );
}

/** 이벤트 배지: 위험도가 있으면 위험도 배지, 없으면 상태 배지 */
export function EventBadge({ event, ...size }: { event: Pick<SecurityEvent, 'risk' | 'status'> } & BadgeSize) {
  return event.risk ? <RiskBadge risk={event.risk} {...size} /> : <StatusBadge status={event.status} {...size} />;
}

/** 이벤트 배지의 스크린리더 문구 */
export const eventBadgeLabel = (event: Pick<SecurityEvent, 'risk' | 'status'>) =>
  event.risk ? `위험도 ${event.risk}` : `위험도 없음, ${PENDING_LABEL[event.status]}`;

/** 위험도 점(장식). 의미는 옆의 텍스트 배지가 전달하므로 접근성 트리에서 숨긴다. 위험도가 없으면 중립 색 */
export function RiskDot({ risk, halo = isHighOrAbove(risk) }: { risk: RiskLevel | null; halo?: boolean }) {
  const dot = <View style={[styles.dot, { backgroundColor: risk ? riskColors[risk].dot : colors.pendingDot }]} />;
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={halo ? styles.halo : null}>
      {dot}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.pill, alignSelf: 'flex-start' },
  compact: { paddingHorizontal: 10, paddingVertical: 4 },
  large: { paddingVertical: 7 },
  badgeText: { fontFamily: fonts.monoSemiBold, fontSize: fontSize.xxs },
  largeText: { fontSize: fontSize.xs },
  badgeBorder: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, borderRadius: radius.pill, borderWidth: 1 },
  pending: { backgroundColor: colors.pendingBadgeBg },
  pendingText: { fontFamily: fonts.monoKoSemiBold, fontSize: fontSize.xxs, color: colors.pendingBadgeText },
  pendingBorder: { borderColor: colors.pendingBadgeBorder },
  dot: { width: 10, height: 10, borderRadius: 5 },
  // Figma: 0 0 0 4px rgba(0,0,0,0.08) 링
  halo: {
    width: 18,
    height: 18,
    margin: -4,
    borderRadius: 9,
    backgroundColor: colors.riskHalo,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
