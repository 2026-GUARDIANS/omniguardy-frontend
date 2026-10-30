import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api, type RealtimeStatus, type ResponseSettings, type RiskLevel } from '../api';
import { TAB_BAR_SPACE } from '../components/BottomTabBar';
import { ExampleTag } from '../components/ExampleTag';
import { Icon } from '../components/icons/Icon';
import { LabeledToggle } from '../components/LabeledToggle';
import { LoadState } from '../components/LoadState';
import { MixedText } from '../components/MixedText';
import { RiskBadge } from '../components/Risk';
import { useApiData } from '../hooks/useApiData';
import type { TabScreenProps } from '../navigation/types';
import { useAuth } from '../state/AuthContext';
import { useRealtimeAlert } from '../state/RealtimeAlertContext';
import { colors, fontSize, fonts, radius, shadow, themeFlags } from '../theme/tokens';
import { type } from '../theme/typography';

const REALTIME_LABEL: Record<RealtimeStatus, string> = {
  connected: '연결됨',
  connecting: '연결 중',
  disconnected: '끊김',
};

type ToggleKey = keyof ResponseSettings;
const RESPONSE_ROWS: { risk: RiskLevel; text: string; key: ToggleKey | null }[] = [
  { risk: 'LOW', text: '이벤트 기록만 저장', key: null },
  { risk: 'MEDIUM', text: '모바일 알림 전송', key: 'mediumNotify' },
  { risk: 'HIGH', text: '모바일 알림 + 경고 출력', key: 'highNotifyAndWarn' },
];

// Figma 1:569 설정 화면
export function SettingsScreen({ navigation }: TabScreenProps<'Settings'>) {
  const { user } = useAuth();
  const { status: realtimeStatus } = useRealtimeAlert();
  const remote = useApiData(() => api.settings.getResponseSettings());
  const devices = useApiData(() => api.devices.getStatuses());
  // 사용자가 바꾼 값(저장 응답 포함)이 있으면 그것을, 없으면 서버에서 불러온 값을 쓴다.
  const [local, setLocal] = useState<ResponseSettings | null>(null);
  const settings = local ?? remote.data;
  const [saveError, setSaveError] = useState<string | null>(null);

  const toggle = async (key: ToggleKey, next: boolean) => {
    if (!settings) return;
    const prev = settings;
    setLocal({ ...settings, [key]: next }); // 낙관적 업데이트
    setSaveError(null);
    try {
      setLocal(await api.settings.updateResponseSettings({ [key]: next }));
    } catch (e) {
      setLocal(prev);
      setSaveError(e instanceof Error ? e.message : '설정을 저장하지 못했습니다.');
    }
  };

  const allConnected = devices.data?.every((d) => d.connected);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>
          설정
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`프로필, ${user?.name ?? ''}`}
          onPress={() => navigation.navigate('Profile')}
          style={({ pressed }) => [styles.card, styles.profileRow, pressed && { opacity: 0.85 }]}
        >
          <View style={styles.profileLeft}>
            <View style={styles.profileIcon}>
              <Icon name="user18" color={themeFlags.iconTint} />
            </View>
            <Text style={styles.profileText}>프로필</Text>
          </View>
          <Text style={styles.profileName}>{user?.name ?? '—'} →</Text>
        </Pressable>

        <View style={styles.section}>
          <Text accessibilityRole="header" style={[type.sectionLabel, styles.sectionLabel]}>
            위험도별 대응
          </Text>
          <View style={styles.card}>
            {RESPONSE_ROWS.map((row, i) => (
              <View key={row.risk} style={[styles.responseRow, i < RESPONSE_ROWS.length - 1 && styles.rowDivider]}>
                <View style={styles.responseText}>
                  <RiskBadge risk={row.risk} compact />
                  <Text style={type.bodySm}>{row.text}</Text>
                </View>
                {row.key == null ? (
                  <View style={styles.fixedChip} accessible accessibilityLabel="고정, 변경할 수 없음">
                    <Text style={styles.fixedText}>고정</Text>
                  </View>
                ) : (
                  <LabeledToggle
                    accessibilityLabel={`${row.risk} ${row.text}`}
                    value={settings?.[row.key] ?? false}
                    disabled={!settings}
                    onChange={(next) => toggle(row.key as ToggleKey, next)}
                  />
                )}
              </View>
            ))}
          </View>
          <LoadState loading={remote.loading} error={remote.error} onRetry={remote.reload} hasData={!!settings} />
          {saveError ? (
            <Text style={styles.error} accessibilityLiveRegion="polite">
              {saveError}
            </Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text accessibilityRole="header" style={[type.sectionLabel, styles.sectionLabel]}>
            장치
          </Text>
          <View style={styles.card}>
            <View style={[styles.deviceRow, styles.rowDivider]}>
              <Text style={[type.body, styles.flexShrink]}>카메라 / 음성 감지 / 키패드</Text>
              <View style={styles.statusWrap}>
                <ExampleTag />
                <StatusDot
                  label={devices.error ? '확인 불가' : !devices.data ? '확인 중' : allConnected ? '연결됨' : '일부 끊김'}
                  ok={!!allConnected}
                />
              </View>
            </View>
            <View style={styles.deviceRow}>
              <MixedText style={[type.body, styles.flexShrink]} weight="regular">
                실시간 알림 연결 (푸시)
              </MixedText>
              <StatusDot label={REALTIME_LABEL[realtimeStatus]} ok={realtimeStatus === 'connected'} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatusDot({ label, ok }: { label: string; ok: boolean }) {
  return (
    <View style={styles.statusDotRow}>
      <View style={[styles.dot, { backgroundColor: ok ? colors.ok : colors.textMuted }]} />
      <Text style={styles.statusText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 16, paddingBottom: 16, paddingHorizontal: 20 },
  title: {
    fontFamily: fonts.sansBold,
    fontSize: fontSize.displayLg,
    lineHeight: 37.4,
    letterSpacing: -1.02,
    color: colors.settingsTitle,
  },
  content: { paddingHorizontal: 16, paddingBottom: TAB_BAR_SPACE, gap: 20 },
  flexShrink: { flexShrink: 1 },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderParchmentSoft,
    borderRadius: radius.cardSm,
    ...shadow.card,
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.borderParchmentSoft },

  profileRow: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 17,
    paddingVertical: 15,
  },
  profileLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.parchment,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: { fontFamily: fonts.sansSemiBold, fontSize: fontSize.lg, color: colors.textSecondary },
  profileName: { fontFamily: fonts.sansRegular, fontSize: fontSize.md, color: colors.textMuted },

  section: { gap: 8 },
  sectionLabel: { paddingHorizontal: 4, paddingBottom: 2 },
  responseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  responseText: { flexShrink: 1, gap: 6, alignItems: 'flex-start' },
  fixedChip: {
    paddingHorizontal: 13,
    paddingTop: 6,
    paddingBottom: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.parchment,
    borderWidth: 1,
    borderColor: colors.borderParchmentSoft,
  },
  fixedText: { fontFamily: fonts.monoKoRegular, fontSize: fontSize.xs, color: colors.onParchment },

  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 16,
  },
  statusWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDotRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontFamily: fonts.monoKoRegular, fontSize: fontSize.xs, color: colors.textMuted },
  error: { fontFamily: fonts.sansRegular, fontSize: fontSize.xs, color: colors.danger, paddingHorizontal: 4 },
});
