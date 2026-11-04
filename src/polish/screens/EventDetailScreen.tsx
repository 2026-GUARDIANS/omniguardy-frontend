import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '../../api';
import { LoadState } from '../../components/LoadState';
import { MixedText } from '../../components/MixedText';
import { EventBadge } from '../../components/Risk';
import { VideoClipArea } from '../../components/VideoClipArea';
import { useApiData } from '../../hooks/useApiData';
import { formatDateTime } from '../../lib/format';
import type { RootScreenProps } from '../../navigation/types';
import { useRealtimeAlert } from '../../state/RealtimeAlertContext';
import { colors, fontSize, fonts } from '../../theme/tokens';
import { FadeUp } from '../motion';
import { Card, P, PBackHeader, PButton, StaleNotice, staleDim } from '../ui';
import { usePolling } from '../usePolling';

// 'polish' 이벤트 상세. 기능은 screens/EventDetailScreen.tsx와 같다(영상, 제목·시각·위험도, Agent 판단, 확인 완료)
export function EventDetailScreen({ navigation, route }: RootScreenProps<'EventDetail'>) {
  const { eventId } = route.params;
  const { clearAlert } = useRealtimeAlert();
  const { data: event, loading: fetching, error, reload } = useApiData(() => api.events.get(eventId), [eventId]);
  // 화면이 보이는 동안 1초마다 조용히 다시 확인(분석 결과·위험도·상태가 바뀌면 바로 반영). 영상은 다시 불러오지 않는다
  const { quiet } = usePolling(reload);
  const loading = fetching && !quiet;
  const [acking, setAcking] = useState(false);
  const [ackError, setAckError] = useState<string | null>(null);
  const stale = !!event && (loading || !!error);

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
    <SafeAreaView style={s.safe} edges={['top']}>
      <PBackHeader title="이벤트 상세" backLabel="이전 화면으로 돌아가기" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={s.content}>
        <LoadState loading={loading} error={event ? null : error} onRetry={reload} hasData={!!event} />
        <StaleNotice hasData={!!event} loading={loading} error={error} onRetry={reload} />
        {event ? (
          <>
            {/* 영상: 'figma'와 같은 공용 컴포넌트를 그대로 쓰고, 애니메이션 View로 감싸지 않는다
                (Android 영상 화면이 움직이거나 투명해지는 부모 안에 있으면 깨질 수 있어서). 재생 버튼을 누를 때마다 주소를 새로 받는다 */}
            <VideoClipArea key={eventId} loadUrl={() => api.events.getVideoUrl(eventId)} />

            <FadeUp index={1} style={[s.titleRow, staleDim(stale)]}>
              <View style={s.titleCol}>
                <Text accessibilityRole="header" style={s.title}>
                  {event.title}
                </Text>
                <MixedText style={s.meta} weight="medium">
                  {formatDateTime(event.occurredAt)}
                </MixedText>
              </View>
              <EventBadge event={event} large />
            </FadeUp>

            <FadeUp index={2}>
              <Card style={[s.agent, staleDim(stale)]}>
                <MixedText accessibilityRole="header" style={s.agentTitle} weight="bold">
                  Agent 위험도 판단
                </MixedText>
                <View style={[s.agentRow, s.divider]}>
                  <Text style={s.agentLabel}>위험도</Text>
                  <View>
                    <EventBadge event={{ risk: event.agentJudgement.risk, status: event.status }} compact />
                  </View>
                </View>
                <View style={[s.agentRow, s.divider]}>
                  <Text style={s.agentLabel}>대응</Text>
                  <Text style={s.agentAction}>{event.agentJudgement.action || '—'}</Text>
                </View>
                <View style={s.reason}>
                  <Text style={s.agentLabel}>판단 근거</Text>
                  <Text style={s.agentReason}>{event.agentJudgement.reason || '—'}</Text>
                </View>
              </Card>
            </FadeUp>
          </>
        ) : null}
      </ScrollView>

      {event ? (
        <SafeAreaView edges={['bottom']} style={s.footer}>
          {ackError ? (
            <Text style={s.error} accessibilityLiveRegion="polite">
              {ackError}
            </Text>
          ) : null}
          <PButton label="확인 완료" onPress={acknowledge} loading={acking} />
        </SafeAreaView>
      ) : null}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: P.gutter, paddingTop: P.space.sm, paddingBottom: P.space.xl, gap: P.space.lg },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: P.space.md, paddingHorizontal: P.space.xs },
  titleCol: { flex: 1, gap: P.space.sm },
  title: { fontFamily: fonts.sansBold, fontSize: fontSize.h1, lineHeight: 36, letterSpacing: -0.56, color: colors.textInfoTitle },
  meta: { fontFamily: fonts.monoMedium, fontSize: fontSize.sm, color: colors.textMuted },
  agent: { paddingHorizontal: P.space.lg, paddingTop: P.space.lg, paddingBottom: P.space.sm },
  agentTitle: { fontFamily: fonts.sansBold, fontSize: fontSize.lg, color: colors.textSecondary, paddingBottom: P.space.sm },
  agentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: P.space.lg, minHeight: 48 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  reason: { gap: P.space.sm, paddingVertical: P.space.md, borderTopWidth: 1, borderTopColor: colors.border },
  agentLabel: { flexShrink: 0, fontFamily: fonts.sansRegular, fontSize: fontSize.md, color: colors.textSecondary },
  agentAction: { fontFamily: fonts.sansSemiBold, fontSize: fontSize.md, color: colors.textSecondary },
  agentReason: { fontFamily: fonts.sansRegular, fontSize: fontSize.md, lineHeight: 22, color: colors.textStrong },
  footer: {
    paddingTop: P.space.md,
    paddingBottom: P.space.md,
    paddingHorizontal: P.gutter,
    gap: P.space.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  error: { fontFamily: fonts.sansRegular, fontSize: fontSize.xs, color: colors.danger, textAlign: 'center' },
});
