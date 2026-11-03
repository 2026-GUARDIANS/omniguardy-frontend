import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api, isHighOrAbove } from '../../api';
import { TAB_BAR_SPACE } from '../../components/BottomTabBar';
import { DevAlertButton, DevThemeLabel } from '../../components/DevAlertButton';
import { LoadState } from '../../components/LoadState';
import { MixedText } from '../../components/MixedText';
import { RiskBadge } from '../../components/Risk';
import { useApiData } from '../../hooks/useApiData';
import { daysAgo, detectedSentence, formatDateTime, formatTime } from '../../lib/format';
import type { TabScreenProps } from '../../navigation/types';
import { useRealtimeAlert } from '../../state/RealtimeAlertContext';
import { colors, fontSize, fonts, riskColors } from '../../theme/tokens';
import { type } from '../../theme/typography';
import { FadeSwap, FadeUp } from '../motion';
import { Card, P, PEventRow, PIcon, Press, SectionHead, StaleNotice, staleDim } from '../ui';

const RECENT_COUNT = 5;
/** 현재 상태에 최근 이벤트를 보여 주는 시간. 이보다 오래된 이벤트만 있으면 "이상 없음" */
const STATUS_WINDOW_MS = 30 * 60 * 1000;
/** 화면이 켜져 있는 동안 서버에서 다시 불러오는 간격 */
const AUTO_RELOAD_MS = 30 * 60 * 1000;
/** 30분이 지났는지 다시 보는 간격 */
const CLOCK_TICK_MS = 60 * 1000;

// 'polish' 홈. 기능은 screens/HomeScreen.tsx와 같다.
// 순서: 현재 상태(가장 크게) → 위험 카드(현재 상태가 HIGH 이상일 때만) → 마지막 감지·오늘 이벤트 타일 → 최근 이벤트
export function HomeScreen({ navigation }: TabScreenProps<'Home'>) {
  const { eventsVersion } = useRealtimeAlert();
  const events = useApiData(() => api.events.list(), [eventsVersion]);
  const summary = useApiData(() => api.events.getHomeSummary(), [eventsVersion]);

  // 30분이 지나면 현재 상태가 "이상 없음"으로 바뀌도록 1분마다 시계를 갱신한다
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), CLOCK_TICK_MS);
    return () => clearInterval(t);
  }, []);
  // 화면에 들어올 때·새 이벤트가 올 때 말고도 30분마다 다시 불러온다(실시간 연결이 끊겼을 때 대비)
  const reloadEvents = events.reload;
  const reloadSummary = summary.reload;
  useEffect(() => {
    const t = setInterval(() => {
      void reloadEvents();
      void reloadSummary();
      setNow(Date.now());
    }, AUTO_RELOAD_MS);
    return () => clearInterval(t);
  }, [reloadEvents, reloadSummary]);

  const list = events.data ?? [];
  const latest = list[0];
  // 현재 상태: 최근 30분 안에 감지된 이벤트가 있을 때만 그 제목, 없으면 "이상 없음"
  const current = latest && now - new Date(latest.occurredAt).getTime() < STATUS_WINDOW_MS ? latest : null;
  const statusText = events.data ? (current?.title ?? '이상 없음') : '—';
  // 현재 상태가 HIGH 이상이면 경고 아이콘·위험도 색, 아니면 방패 아이콘·세이지
  const danger = !!current && isHighOrAbove(current.risk);
  const eventsStale = !!events.data && (events.loading || !!events.error);
  const summaryStale = !!summary.data && (summary.loading || !!summary.error);
  const lastDetectedAt = summary.data?.lastDetectedAt ?? null;
  const lastText = lastDetectedAt
    ? daysAgo(lastDetectedAt) === 0
      ? formatTime(lastDetectedAt)
      : formatDateTime(lastDetectedAt)
    : '—';
  const openEvent = useCallback((id: string) => navigation.navigate('EventDetail', { eventId: id }), [navigation]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text accessibilityRole="header" style={type.pageTitleDecorative}>
          OmniGuardy
        </Text>
        <Press
          accessibilityRole="button"
          accessibilityLabel="프로필"
          onPress={() => navigation.navigate('Profile')}
          onPrimary
          style={s.profileBtn}
        >
          <PIcon name="user20" color={colors.textOnPrimary} />
        </Press>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {/* 현재 상태 */}
        <FadeUp index={0}>
          <Card style={s.status}>
            <View style={s.between}>
              <Text style={s.caption}>현재 상태</Text>
              <FadeSwap swapKey={danger ? 'danger' : 'ok'}>
                <View style={[s.statusIcon, danger && { backgroundColor: riskColors.HIGH.badge }]}>
                  <PIcon name={danger ? 'alertWarning' : 'shieldCheck'} color={colors.textOnPrimary} />
                </View>
              </FadeSwap>
            </View>
            <FadeSwap swapKey={statusText} style={staleDim(eventsStale)}>
              <Text style={s.statusText} accessibilityLiveRegion="polite">
                {statusText}
              </Text>
            </FadeSwap>
            <StaleNotice hasData={!!events.data} loading={events.loading} error={events.error} onRetry={events.reload} />
            {!events.data ? (
              <LoadState loading={events.loading} error={events.error} onRetry={events.reload} hasData={false} />
            ) : null}
          </Card>
        </FadeUp>

        {/* 위험 카드: 현재 상태(최근 30분 안의 가장 최근 이벤트)가 HIGH 이상일 때만. 누르면 그 이벤트 상세로 간다
            (비상 화면은 실시간 알림이 올 때 자동으로 뜨므로 여기서는 열지 않는다. 'figma'·'custom'은 기존 동작 그대로) */}
        {current && current.risk && isHighOrAbove(current.risk) ? (
          <FadeUp>
            <Press
              accessibilityRole="button"
              accessibilityLabel={`위험도 ${current.risk} 위험 알림. ${detectedSentence(current.title)}`}
              accessibilityHint="이벤트 상세를 엽니다"
              onPress={() => openEvent(current.id)}
              style={[s.cardBase, s.alert]}
            >
              <View style={s.alertBody}>
                <MixedText style={s.alertCaption} weight="semibold">
                  {`${current.risk} · 위험 알림`}
                </MixedText>
                <Text style={s.alertTitle}>{detectedSentence(current.title)}</Text>
                <Text style={s.alertHint}>상세 보기</Text>
              </View>
              <View>
                <RiskBadge risk={current.risk} />
              </View>
            </Press>
          </FadeUp>
        ) : null}

        {/* 마지막 감지 · 오늘 이벤트 (GET /api/home/summary) */}
        <FadeUp index={1} style={s.tilesWrap}>
          <View style={s.tiles}>
            <Card style={s.tile}>
              <Text style={s.caption}>마지막 감지</Text>
              <View style={staleDim(summaryStale)}>
                <MixedText style={s.tileValue} weight="bold" numberOfLines={1} adjustsFontSizeToFit>
                  {lastText}
                </MixedText>
              </View>
            </Card>
            <Card style={s.tile}>
              <Text style={s.caption}>오늘 이벤트</Text>
              <View style={[s.countRow, staleDim(summaryStale)]}>
                <Text style={s.tileValue}>{summary.data ? String(summary.data.todayEventCount) : '—'}</Text>
                <Text style={s.tileUnit}>건</Text>
              </View>
            </Card>
          </View>
          <StaleNotice hasData={!!summary.data} loading={summary.loading} error={summary.error} onRetry={summary.reload} />
          {!summary.data ? (
            <LoadState loading={false} error={summary.error} onRetry={summary.reload} hasData={false} />
          ) : null}
        </FadeUp>

        {/* 최근 이벤트 */}
        <FadeUp index={2} style={s.recent}>
          <SectionHead
            title="최근 이벤트"
            link={{ label: '전체 보기', a11y: '이벤트 전체 보기', onPress: () => navigation.navigate('Events') }}
          />
          <LoadState
            loading={events.loading}
            error={events.data ? null : events.error}
            onRetry={events.reload}
            hasData={!!events.data}
            isEmpty={list.length === 0}
            emptyText="최근 이벤트가 없습니다."
          />
          <View style={[s.recentList, staleDim(eventsStale)]}>
            {list.slice(0, RECENT_COUNT).map((e, i) => (
              <FadeUp key={e.id} index={3 + i}>
                <PEventRow event={e} onOpen={openEvent} withDay />
              </FadeUp>
            ))}
          </View>
        </FadeUp>

        <DevAlertButton />
        <DevThemeLabel />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: P.space.xl,
    paddingRight: P.gutter,
    paddingVertical: P.space.md,
  },
  profileBtn: {
    width: P.minTouch,
    height: P.minTouch,
    borderRadius: P.radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: P.gutter, paddingTop: P.space.xs, paddingBottom: TAB_BAR_SPACE, gap: P.space.lg },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardBase: { backgroundColor: colors.surface, borderRadius: P.radius.card, ...P.border, ...P.shadow.card },

  status: { padding: P.space.xl, gap: P.space.md },
  caption: { fontFamily: fonts.sansMedium, fontSize: fontSize.sm, color: colors.statusCaption },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.statusIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: { fontFamily: fonts.sansBold, fontSize: fontSize.display, lineHeight: 40, color: colors.statusText },

  alert: { flexDirection: 'row', alignItems: 'center', gap: P.space.md, padding: P.space.lg },
  alertBody: { flex: 1, gap: P.space.xs },
  alertCaption: { fontFamily: fonts.monoSemiBold, fontSize: fontSize.xs, color: riskColors.HIGH.dot },
  alertTitle: { fontFamily: fonts.sansBold, fontSize: fontSize.lg, color: colors.textTitle },
  alertHint: { fontFamily: fonts.sansSemiBold, fontSize: fontSize.sm, color: colors.link },

  tiles: { flexDirection: 'row', gap: P.space.md },
  tile: { flex: 1, padding: P.space.lg, gap: P.space.sm },
  tileValue: { fontFamily: fonts.monoSemiBold, fontSize: fontSize.h2, lineHeight: 32, color: colors.textStrong },
  countRow: { flexDirection: 'row', alignItems: 'baseline', gap: P.space.xs },
  tileUnit: { fontFamily: fonts.sansMedium, fontSize: fontSize.md, color: colors.textSecondary },
  tilesWrap: { gap: P.space.sm },

  recent: { gap: P.space.sm },
  recentList: { gap: P.space.sm },
});
