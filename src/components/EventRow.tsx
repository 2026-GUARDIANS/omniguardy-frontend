import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import type { SecurityEvent } from '../api';
import { formatDateTime } from '../lib/format';
import { colors, fontSize, fonts, radius, shadow } from '../theme/tokens';
import { RiskBadge, RiskDot } from './Risk';

type Props = {
  event: SecurityEvent;
  onPress: () => void;
  /** home: 홈 "최근 이벤트"(radius 18, py16) / list: 이벤트 기록(radius 20, py20) */
  variant?: 'home' | 'list';
};

export function EventRow({ event, onPress, variant = 'list' }: Props) {
  const list = variant === 'list';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${event.title}, 위험도 ${event.risk}, ${formatDateTime(event.occurredAt)}`}
      accessibilityHint="이벤트 상세를 엽니다"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        list ? styles.list : styles.home,
        event.risk === 'HIGH' && list ? shadow.cardMd : shadow.card,
        pressed && { opacity: 0.85 },
      ]}
    >
      <RiskDot risk={event.risk} halo={list && event.risk === 'HIGH'} />
      <Text style={styles.title} numberOfLines={1}>
        {event.title}
      </Text>
      <RiskBadge risk={event.risk} compact={!list} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 18,
    paddingRight: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  home: { borderRadius: radius.row, paddingVertical: 16 },
  list: { borderRadius: radius.cardSm, paddingVertical: 20, minHeight: 66 },
  title: { flex: 1, fontFamily: fonts.sansSemiBold, fontSize: fontSize.lg, color: colors.textTitle },
});
