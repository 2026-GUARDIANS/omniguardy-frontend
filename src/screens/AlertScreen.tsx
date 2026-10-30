import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '../api';
import { Icon } from '../components/icons/Icon';
import { LoadState } from '../components/LoadState';
import { MixedText } from '../components/MixedText';
import { PillButton } from '../components/PillButton';
import { useApiData } from '../hooks/useApiData';
import { detectedSentence, formatTime } from '../lib/format';
import type { RootScreenProps } from '../navigation/types';
import { useRealtimeAlert } from '../state/RealtimeAlertContext';
import { colors, fontSize, fonts, radius, shadow, THEME, themeFlags } from '../theme/tokens';

// Figma 1:399 사일런트 시그널 알림 화면 (HIGH 위험 알림)
export function AlertScreen({ navigation, route }: RootScreenProps<'Alert'>) {
  const { eventId } = route.params;
  const { activeAlert, stopWarning } = useRealtimeAlert();
  const fetched = useApiData(() => api.events.get(eventId), [eventId]);
  // 실시간으로 받은 이벤트가 있으면 조회를 기다리지 않고 바로 표시
  const event = fetched.data ?? (activeAlert?.id === eventId ? activeAlert : null);
  const [warning, setWarning] = useState(true);
  const [stopping, setStopping] = useState(false);
  const [stopError, setStopError] = useState<string | null>(null);

  const onStop = async () => {
    setStopping(true);
    setStopError(null);
    try {
      await stopWarning();
      setWarning(false);
      navigation.goBack();
    } catch (e) {
      setStopError(e instanceof Error ? e.message : '경고를 끄지 못했습니다.');
      setStopping(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* 장식: 동심원 */}
      {/* custom 테마: 어두운 배경이라 상태 표시줄 글자를 밝게 */}
      {THEME === 'custom' ? <StatusBar style="light" /> : null}
      {themeFlags.alertRings ? (
        <View pointerEvents="none" style={styles.rings} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Icon name="alertRings" />
        </View>
      ) : null}

      <View style={styles.top}>
        <View style={styles.tag}>
          <MixedText style={styles.tagText} weight="semibold">
            {`${event?.risk ?? 'HIGH'} · 위험 알림`}
          </MixedText>
        </View>
      </View>

      <View style={styles.middle}>
        {event ? (
          <>
            <View style={styles.iconCircle}>
              <Icon name="alertWarning" color={themeFlags.alertIconColor} />
            </View>
            <Text accessibilityRole="header" accessibilityLiveRegion="assertive" style={styles.headline}>
              {detectedSentence(event.title, true)}
            </Text>
            <View style={styles.divider} />
            <MixedText style={styles.meta} weight="medium">{`${formatTime(event.occurredAt)} · 현관`}</MixedText>
            <View style={[styles.warnPill, !warning && styles.warnPillOff]} accessibilityLiveRegion="polite">
              <Icon name="speaker" color={warning ? undefined : colors.warnPillOffText} />
              <Text style={[styles.warnText, !warning && styles.warnTextOff]}>
                {warning ? '경고 출력 중' : '경고 꺼짐'}
              </Text>
            </View>
          </>
        ) : (
          <LoadState loading={fetched.loading} error={fetched.error} onRetry={fetched.reload} hasData={false} />
        )}
      </View>

      <View style={styles.actions}>
        {stopError ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {stopError}
          </Text>
        ) : null}
        <PillButton
          label="상세 보기"
          trailingIcon="arrowRight"
          outlineColor={colors.alertDetailBorder}
          labelSize={fontSize.xxl}
          disabled={!event}
          onPress={() => navigation.replace('EventDetail', { eventId })}
        />
        <PillButton label="경고 끄기" variant="secondary" loading={stopping} disabled={!warning} onPress={onStop} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.alertBg, paddingHorizontal: 24, overflow: 'hidden' },
  rings: { position: 'absolute', top: 40, right: -210 },
  top: { paddingTop: 24, flexDirection: 'row' },
  tag: { backgroundColor: colors.alertTagBg, paddingHorizontal: 12, paddingTop: 6, paddingBottom: 7, borderRadius: radius.pill },
  tagText: { fontFamily: fonts.monoSemiBold, fontSize: fontSize.sm, color: colors.textOnPrimary },

  middle: { flex: 1, justifyContent: 'center', alignItems: 'flex-start' },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.alertIconCircle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    ...shadow.cardLg,
  },
  headline: { fontFamily: fonts.sansBold, fontSize: fontSize.hero, lineHeight: 44, color: colors.alertHeadline },
  divider: { width: 56, height: 2, backgroundColor: colors.alertDivider, marginTop: 24, marginBottom: 24 },
  // Figma 컨테이너의 좌우 여백 16을 없애 제목과 같은 왼쪽 정렬로 맞춤(사용자 결정, 두 테마 공통)
  meta: { fontFamily: fonts.monoMedium, fontSize: fontSize.xl, color: colors.alertMeta },
  warnPill: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 12,
    paddingRight: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.warnPill,
  },
  warnPillOff: { backgroundColor: colors.warnPillOffBg },
  warnText: { fontFamily: fonts.sansSemiBold, fontSize: fontSize.md, color: colors.textOnPrimary },
  warnTextOff: { color: colors.warnPillOffText },

  actions: { paddingTop: 12, paddingBottom: 36, gap: 10 },
  error: { fontFamily: fonts.sansRegular, fontSize: fontSize.xs, color: colors.alertError, textAlign: 'center' },
});
