import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { isHighOrAbove, type SecurityEvent } from '../api';
import { formatDateTime } from '../lib/format';
import { colors, fontSize, fonts, radius, shadow } from '../theme/tokens';
import { EventBadge, eventBadgeLabel, RiskDot } from './Risk';

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
      accessibilityLabel={`${event.title}, ${eventBadgeLabel(event)}, ${formatDateTime(event.occurredAt)}`}
      accessibilityHint="이벤트 상세를 엽니다"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        list ? styles.list : styles.home,
        isHighOrAbove(event.risk) && list ? shadow.cardMd : shadow.card,
        pressed && { opacity: 0.85 },
      ]}
    >
      <RiskDot risk={event.risk} halo={list && isHighOrAbove(event.risk)} />
      <Text style={styles.title} numberOfLines={1}>
        {event.title}
      </Text>
      <EventBadge event={event} compact={!list} />
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
