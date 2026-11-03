import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RiskLevel } from '../../api';
import { TAB_BAR_SPACE } from '../../components/BottomTabBar';
import { RiskBadge } from '../../components/Risk';
import type { TabScreenProps } from '../../navigation/types';
import { useAuth } from '../../state/AuthContext';
import { colors, fontSize, fonts } from '../../theme/tokens';
import { type } from '../../theme/typography';
import { FadeUp } from '../motion';
import { Card, P, PIcon, Press } from '../ui';

// 위험도별 대응은 백엔드 정책대로 고정이라 설명만 보여준다(screens/SettingsScreen.tsx와 같음)
const RESPONSE_ROWS: { risk: RiskLevel; text: string }[] = [
  { risk: 'LOW', text: '이벤트 기록만 저장' },
  { risk: 'MEDIUM', text: '모바일 알림 전송' },
  { risk: 'HIGH', text: '모바일 알림 + 경고 출력' },
];

export function SettingsScreen({ navigation }: TabScreenProps<'Settings'>) {
  const { user } = useAuth();

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text accessibilityRole="header" style={s.title}>
          설정
        </Text>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <FadeUp index={0}>
          <Card style={s.clip}>
            <Press
              accessibilityRole="button"
              accessibilityLabel={`프로필, ${user?.name ?? ''}`}
              onPress={() => navigation.navigate('Profile')}
              style={s.profileRow}
            >
              <View style={s.profileLeft}>
                <View style={s.profileIcon}>
                  <PIcon name="user18" color={colors.primary} />
                </View>
                <Text style={s.profileText}>프로필</Text>
              </View>
              <View style={s.profileRight}>
                <Text style={s.profileName}>{user?.name ?? '—'}</Text>
                <PIcon name="chevronRight" color={colors.textMuted} size={16} />
              </View>
            </Press>
          </Card>
        </FadeUp>

        <FadeUp index={1} style={s.section}>
          <Text accessibilityRole="header" style={[type.sectionLabel, s.sectionLabel]}>
            위험도별 대응
          </Text>
          <Card>
            {RESPONSE_ROWS.map((row, i) => (
              <View key={row.risk} style={[s.responseRow, i > 0 && s.divider]}>
                <View style={s.badgeCol}>
                  <RiskBadge risk={row.risk} compact />
                </View>
                <Text style={s.responseText}>{row.text}</Text>
              </View>
            ))}
          </Card>
        </FadeUp>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: P.space.lg, paddingBottom: P.space.lg, paddingHorizontal: P.space.xl },
  title: { fontFamily: fonts.sansBold, fontSize: fontSize.displayLg, lineHeight: 40, letterSpacing: -1.02, color: colors.textDecorativeTitle }, // 홈 'OmniGuardy' 제목과 같은 색
  content: { paddingHorizontal: P.gutter, paddingBottom: TAB_BAR_SPACE, gap: P.space.xl },
  clip: { overflow: 'hidden' },
  profileRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: P.space.lg,
    paddingVertical: P.space.md,
  },
  profileLeft: { flexDirection: 'row', alignItems: 'center', gap: P.space.md },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.parchment,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: { fontFamily: fonts.sansSemiBold, fontSize: fontSize.lg, color: colors.textSecondary },
  profileRight: { flexDirection: 'row', alignItems: 'center', gap: P.space.xs },
  profileName: { fontFamily: fonts.sansRegular, fontSize: fontSize.md, color: colors.textMuted },
  section: { gap: P.space.sm },
  sectionLabel: { paddingHorizontal: P.space.xs },
  responseRow: { flexDirection: 'row', alignItems: 'center', gap: P.space.md, paddingHorizontal: P.space.lg, minHeight: 56 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  badgeCol: { width: 80, alignItems: 'flex-start' },
  responseText: { flex: 1, fontFamily: fonts.sansRegular, fontSize: fontSize.md, color: colors.textSecondary },
});
