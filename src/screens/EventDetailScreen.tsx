import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '../api';
import { BackHeader } from '../components/BackHeader';
import { LoadState } from '../components/LoadState';
import { MixedText } from '../components/MixedText';
import { PillButton } from '../components/PillButton';
import { RiskBadge } from '../components/Risk';
import { VideoClipArea } from '../components/VideoClipArea';
import { useApiData } from '../hooks/useApiData';
import { formatDateTime } from '../lib/format';
import type { RootScreenProps } from '../navigation/types';
import { useRealtimeAlert } from '../state/RealtimeAlertContext';
import { colors, fontSize, fonts, radius, shadow, themeFlags } from '../theme/tokens';

// Figma 1:494 이벤트 기록 상세 화면
// "처리 이력" 카드와 출처("음성 트리거")는 최소 필드에 없어 숨김(사용자 결정).
export function EventDetailScreen({ navigation, route }: RootScreenProps<'EventDetail'>) {
  const { eventId } = route.params;
  const { clearAlert } = useRealtimeAlert();
  const { data: event, loading, error, reload } = useApiData(() => api.events.get(eventId), [eventId]);
  const [acking, setAcking] = useState(false);
  const [ackError, setAckError] = useState<string | null>(null);

  const acknowledge = async () => {
    setAcking(true);
    setAckError(null);
    try {
      await api.events.acknowledge(eventId);
      clearAlert(eventId);
      navigation.goBack();
    } catch (e) {
      setAckError(e instanceof Error ? e.message : '처리하지 못했습니다.');
      setAcking(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerWrap}>
        <BackHeader title="이벤트 상세" backLabel="이전 화면으로 돌아가기" onBack={() => navigation.goBack()} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <LoadState loading={loading} error={error} onRetry={reload} hasData={!!event} />
        {event ? (
          <>
            <VideoClipArea videoUrl={event.videoUrl} />

            <View style={styles.titleRow}>
              <View style={styles.titleCol}>
                <Text accessibilityRole="header" style={styles.title}>
                  {event.title}
                </Text>
                <Text style={styles.meta}>{formatDateTime(event.occurredAt)}</Text>
              </View>
              <RiskBadge risk={event.risk} large />
            </View>

            <View style={styles.agentCard}>
              {/* 장식: 마스킹 테이프 */}
              {themeFlags.agentCardTape ? (
                <View style={styles.tape} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />
              ) : null}
              <View style={styles.agentHeader}>
                <MixedText accessibilityRole="header" style={styles.agentTitle} weight="bold">
                  Agent 위험도 판단
                </MixedText>
              </View>
              <View style={[styles.agentRow, styles.dashed]}>
                <Text style={styles.agentLabel} numberOfLines={1}>
                  위험도
                </Text>
                <RiskBadge risk={event.agentJudgement.risk} compact />
              </View>
              <View style={[styles.agentRow, styles.dashed]}>
                <Text style={styles.agentLabel} numberOfLines={1}>
                  대응
                </Text>
                <Text style={styles.agentAction}>{event.agentJudgement.action}</Text>
              </View>
              <View style={[styles.agentRow, styles.last]}>
                <Text style={styles.agentLabel} numberOfLines={1}>
                  판단 근거
                </Text>
                <Text style={styles.agentReason}>{event.agentJudgement.reason}</Text>
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>

      {event ? (
        <SafeAreaView edges={['bottom']} style={styles.footer}>
          {ackError ? (
            <Text style={styles.error} accessibilityLiveRegion="polite">
              {ackError}
            </Text>
          ) : null}
          <PillButton label="확인 완료" onPress={acknowledge} loading={acking} />
        </SafeAreaView>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  headerWrap: { paddingBottom: 10 },
  content: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 24, gap: 16 },

  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, paddingHorizontal: 4 },
  titleCol: { flex: 1, gap: 6 },
  title: {
    fontFamily: fonts.sansBold,
    fontSize: fontSize.h1,
    lineHeight: 32.2,
    letterSpacing: -0.56,
    color: colors.textInfoTitle,
  },
  meta: { fontFamily: fonts.monoKoRegular, fontSize: fontSize.xs, color: colors.textMuted },

  agentCard: {
    marginTop: 8,
    marginHorizontal: 4,
    paddingTop: 22,
    paddingBottom: 16,
    paddingHorizontal: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    ...shadow.card,
  },
  tape: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    width: 88,
    height: 20,
    borderRadius: radius.pill,
    backgroundColor: colors.tape,
    transform: [{ rotate: '2deg' }],
  },
  agentHeader: { paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  agentTitle: { fontFamily: fonts.sansBold, fontSize: fontSize.lg, color: colors.textSecondary },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingTop: 11,
    paddingBottom: 12,
  },
  dashed: { borderBottomWidth: 1, borderBottomColor: colors.border, borderStyle: 'dashed' },
  last: { paddingBottom: 2 },
  // 라벨은 줄이지 않는다(긴 판단 근거와 폭을 나눌 때 라벨이 두 줄로 쪼개지던 문제)
  agentLabel: { flexShrink: 0, fontFamily: fonts.sansRegular, fontSize: fontSize.md, color: colors.textSecondary },
  agentAction: { fontFamily: fonts.sansSemiBold, fontSize: fontSize.md, color: colors.textSecondary },
  agentReason: {
    flex: 1,
    textAlign: 'right',
    fontFamily: fonts.monoKoMedium,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },

  footer: {
    paddingTop: 13,
    paddingBottom: 12,
    paddingHorizontal: 16,
    gap: 8,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  error: { fontFamily: fonts.sansRegular, fontSize: fontSize.xs, color: colors.danger, textAlign: 'center' },
});
