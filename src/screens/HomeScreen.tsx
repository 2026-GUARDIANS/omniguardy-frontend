import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api, type DeviceKind, type SecurityEvent } from '../api';
import { TAB_BAR_SPACE } from '../components/BottomTabBar';
import { DevAlertButton } from '../components/DevAlertButton';
import { EventRow } from '../components/EventRow';
import { ExampleTag } from '../components/ExampleTag';
import { Icon } from '../components/icons/Icon';
import type { FigmaIconName } from '../components/icons/figmaSvgs';
import { LoadState } from '../components/LoadState';
import { RiskBadge, RiskDot } from '../components/Risk';
import { useApiData } from '../hooks/useApiData';
import { daysAgo, formatDateTime, formatTime } from '../lib/format';
import type { TabScreenProps } from '../navigation/types';
import { useRealtimeAlert } from '../state/RealtimeAlertContext';
import { colors, fontSize, fonts, hitSlopFor, radius, riskColors, shadow, size } from '../theme/tokens';
import { type } from '../theme/typography';

const DEVICES: Record<DeviceKind, { label: string; icon: FigmaIconName }> = {
  camera: { label: '카메라', icon: 'deviceCamera' },
  voice: { label: '음성 감지', icon: 'deviceVoice' },
  keypad: { label: '키패드', icon: 'deviceKeypad' },
};

const RECENT_COUNT = 2;

// Figma 1:285 홈 화면
export function HomeScreen({ navigation }: TabScreenProps<'Home'>) {
  const { activeAlert, eventsVersion } = useRealtimeAlert();
  const events = useApiData(() => api.events.list(), [eventsVersion]);
  const devices = useApiData(() => api.devices.getStatuses());

  const list = events.data ?? [];
  const latest = list[0];
  const todayCount = list.filter((e) => daysAgo(e.occurredAt) === 0).length;
  const openEvent = (e: SecurityEvent) => navigation.navigate('EventDetail', { eventId: e.id });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={type.pageTitleDecorative}>
          OmniGuardy
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="프로필"
          onPress={() => navigation.navigate('Profile')}
          hitSlop={hitSlopFor(size.iconButton, size.iconButton)}
          style={({ pressed }) => [styles.profileBtn, pressed && { opacity: 0.85 }]}
        >
          <Icon name="user20" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* 현재 상태 */}
        <View style={styles.statusCard}>
          <View style={styles.between}>
            <Text style={styles.statusCaption}>현재 상태</Text>
            <View style={styles.statusIcon}>
              <Icon name="shieldCheck" />
            </View>
          </View>
          <Text style={styles.statusText} accessibilityLiveRegion="polite">
            {activeAlert ? '확인 필요' : '이상 없음'}
          </Text>
          <View style={styles.divider} />
          <Text style={styles.statusMeta}>
            마지막 감지:{' '}
            <Text style={styles.statusMetaValue}>
              {latest ? (daysAgo(latest.occurredAt) === 0 ? formatTime(latest.occurredAt) : formatDateTime(latest.occurredAt)) : '—'}
            </Text>
            {' · 오늘 이벤트 '}
            <Text style={styles.statusMetaValue}>{events.data ? todayCount : '—'}</Text>건
          </Text>
        </View>

        {/* 처리하지 않은 HIGH 위험 알림 */}
        {activeAlert ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`위험도 HIGH 위험 알림. ${activeAlert.title}이 감지되었습니다`}
            accessibilityHint="알림 화면을 엽니다"
            onPress={() => navigation.navigate('Alert', { eventId: activeAlert.id })}
            style={({ pressed }) => [styles.alertCard, pressed && { opacity: 0.85 }]}
          >
            <RiskDot risk="HIGH" />
            <View style={styles.alertBody}>
              <Text style={styles.alertCaption}>HIGH · 위험 알림</Text>
              <Text style={styles.alertTitle}>{activeAlert.title}이 감지되었습니다</Text>
              <Text style={styles.alertHint}>탭하여 알림 화면 보기 →</Text>
            </View>
            <RiskBadge risk="HIGH" />
          </Pressable>
        ) : null}

        {/* 장치 연결 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text accessibilityRole="header" style={type.sectionTitle}>
              장치 연결
            </Text>
            <ExampleTag />
          </View>
          <LoadState loading={devices.loading} error={devices.error} onRetry={devices.reload} hasData={!!devices.data} />
          {devices.data ? (
            <View style={styles.tiles}>
              {devices.data.map((d) => (
                <View
                  key={d.kind}
                  style={styles.tile}
                  accessible
                  accessibilityLabel={`${DEVICES[d.kind].label} ${d.connected ? '연결됨' : '연결 끊김'}`}
                >
                  <Icon name={DEVICES[d.kind].icon} />
                  <Text style={styles.tileLabel}>{DEVICES[d.kind].label}</Text>
                  <View style={styles.tileStatus}>
                    <View style={[styles.tileDot, !d.connected && { backgroundColor: colors.textMuted }]} />
                    <Text style={styles.tileStatusText}>{d.connected ? '연결됨' : '끊김'}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* 최근 이벤트 */}
        <View style={styles.sectionRecent}>
          <View style={[styles.sectionHeader, styles.between]}>
            <Text accessibilityRole="header" style={type.sectionTitle}>
              최근 이벤트
            </Text>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="이벤트 전체 보기"
              onPress={() => navigation.navigate('Events')}
              style={styles.moreLink}
            >
              <Text style={type.link}>전체 보기</Text>
            </Pressable>
          </View>
          <LoadState
            loading={events.loading}
            error={events.error}
            onRetry={events.reload}
            hasData={!!events.data}
            isEmpty={list.length === 0}
            emptyText="최근 이벤트가 없습니다."
          />
          <View style={styles.recentList}>
            {list.slice(0, RECENT_COUNT).map((e) => (
              <EventRow key={e.id} event={e} variant="home" onPress={() => openEvent(e)} />
            ))}
          </View>
        </View>

        <DevAlertButton />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 22,
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  profileBtn: {
    width: size.iconButton,
    height: size.iconButton,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: TAB_BAR_SPACE, gap: 14 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  statusCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.card,
    padding: 18,
    gap: 10,
    ...shadow.cardLg,
  },
  statusCaption: { fontFamily: fonts.monoRegular, fontSize: fontSize.xxs, color: colors.primary },
  statusIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: { fontFamily: fonts.sansBold, fontSize: fontSize.display, lineHeight: 36, color: colors.textStrong },
  divider: { height: 1, backgroundColor: colors.border },
  statusMeta: { fontFamily: fonts.sansRegular, fontSize: fontSize.sm, color: colors.primary },
  statusMetaValue: { fontFamily: fonts.monoRegular, color: colors.textSecondary },

  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.cardSm,
    ...shadow.cardMd,
  },
  alertBody: { flex: 1, gap: 3 },
  // Figma 원본 rgba(144,19,24,0.5) → 조정 #901318 (대비 2.6:1 → 9.2:1)
  alertCaption: { fontFamily: fonts.monoSemiBold, fontSize: fontSize.xxs, color: riskColors.HIGH.dot },
  alertTitle: { fontFamily: fonts.sansBold, fontSize: fontSize.lg, color: colors.textTitle },
  alertHint: { fontFamily: fonts.sansRegular, fontSize: fontSize.sm, color: colors.primary },

  section: { gap: 10 },
  sectionRecent: { gap: 6 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 },
  tiles: { flexDirection: 'row', gap: 8 },
  tile: {
    flex: 1,
    padding: 13,
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.tile,
    ...shadow.card,
  },
  tileLabel: { fontFamily: fonts.sansSemiBold, fontSize: fontSize.sm, color: colors.textStrong },
  tileStatus: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tileDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  tileStatusText: { fontFamily: fonts.monoRegular, fontSize: fontSize.xxs, color: colors.primary },
  moreLink: { minHeight: size.minTouch, justifyContent: 'center', paddingLeft: 8 },
  recentList: { gap: 8 },
});
