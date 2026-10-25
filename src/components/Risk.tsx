import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { RiskLevel } from '../api';
import { colors, fontSize, fonts, radius, riskColors } from '../theme/tokens';

/** 위험도 배지. 색과 함께 HIGH/MEDIUM/LOW 텍스트를 항상 표시한다. */
export function RiskBadge({ risk, compact = false, large = false }: { risk: RiskLevel; compact?: boolean; large?: boolean }) {
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
      <Text style={[styles.badgeText, large && styles.largeText]}>{risk}</Text>
    </View>
  );
}

/** 위험도 점(장식). 의미는 옆의 텍스트 배지가 전달하므로 접근성 트리에서 숨긴다. */
export function RiskDot({ risk, halo = risk === 'HIGH' }: { risk: RiskLevel; halo?: boolean }) {
  const dot = <View style={[styles.dot, { backgroundColor: riskColors[risk].dot }]} />;
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
  badgeText: { fontFamily: fonts.monoSemiBold, fontSize: fontSize.xxs, color: colors.textOnPrimary },
  largeText: { fontSize: fontSize.xs },
  dot: { width: 10, height: 10, borderRadius: 5 },
  // Figma: 0 0 0 4px rgba(0,0,0,0.08) 링
  halo: {
    width: 18,
    height: 18,
    margin: -4,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
