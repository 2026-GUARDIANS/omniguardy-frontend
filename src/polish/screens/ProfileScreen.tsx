import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '../../api';
import { TAB_BAR_SPACE } from '../../components/BottomTabBar';
import { ExampleTag } from '../../components/ExampleTag';
import { LoadState } from '../../components/LoadState';
import { MixedText } from '../../components/MixedText';
import { useApiData } from '../../hooks/useApiData';
import { formatMobilePhone } from '../../lib/validation';
import { TAB_TO_ROUTE } from '../../navigation/tabs';
import type { RootScreenProps } from '../../navigation/types';
import { useAuth } from '../../state/AuthContext';
import { colors, fontSize, fonts } from '../../theme/tokens';
import { FadeUp } from '../motion';
import { TabBar } from '../TabBar';
import { Card, P, PBackHeader, PIcon, Press, StaleNotice, staleDim } from '../ui';

// 'polish' 프로필. 기능은 screens/ProfileScreen.tsx와 같다(이름·이메일·연락처, 로그아웃, 하단 탭은 설정 활성)
export function ProfileScreen({ navigation }: RootScreenProps<'Profile'>) {
  const { user: sessionUser, signOut } = useAuth();
  const me = useApiData(() => api.auth.getMe());
  const user = me.data ?? sessionUser;
  const [signingOut, setSigningOut] = useState(false);
  const stale = !!user && (me.loading || !!me.error);

  const onSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } catch (e) {
      setSigningOut(false);
      Alert.alert('로그아웃 실패', e instanceof Error ? e.message : '다시 시도해 주세요.');
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <PBackHeader title="프로필" backLabel="이전 화면으로 돌아가기" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={s.content}>
        <FadeUp index={0} style={s.identity}>
          <View style={s.avatar}>
            <PIcon name="user40" color={colors.primary} size={40} />
          </View>
          <Text accessibilityRole="header" style={s.name}>
            {user?.name ?? '—'}
          </Text>
          <ExampleTag />
        </FadeUp>

        {/* 서버 정보를 아직 못 받았으면 로그인 때 받은 정보를 보여 주고 있다는 것을 알린다 */}
        <LoadState loading={me.loading} error={user ? null : me.error} onRetry={me.reload} hasData={!!user} />
        <StaleNotice hasData={!!user} loading={me.loading} error={me.error} onRetry={me.reload} />

        <FadeUp index={1}>
          <Card style={staleDim(stale)}>
            <InfoRow label="이메일" value={user?.email ?? '—'} />
            <InfoRow label="연락처" value={user?.phone ? formatMobilePhone(user.phone) : '—'} divider />
          </Card>
        </FadeUp>

        <FadeUp index={2}>
          <Card style={s.clip}>
            <Press
              accessibilityRole="button"
              accessibilityLabel="로그아웃"
              accessibilityState={{ busy: signingOut, disabled: signingOut }}
              disabled={signingOut}
              onPress={onSignOut}
              style={s.logoutRow}
            >
              <Text style={s.logout}>로그아웃</Text>
            </Press>
          </Card>
        </FadeUp>
      </ScrollView>

      <TabBar active="settings" onSelect={(key) => navigation.navigate('Main', { screen: TAB_TO_ROUTE[key] })} />
    </SafeAreaView>
  );
}

function InfoRow({ label, value, divider }: { label: string; value: string; divider?: boolean }) {
  return (
    <View style={[s.infoRow, divider && s.divider]} accessible accessibilityLabel={`${label} ${value}`}>
      <Text style={s.label}>{label}</Text>
      <MixedText style={s.value} weight="regular" numberOfLines={1}>
        {value}
      </MixedText>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: P.gutter, paddingTop: P.space.sm, paddingBottom: TAB_BAR_SPACE, gap: P.space.lg },
  identity: { alignItems: 'center', gap: P.space.md, paddingVertical: P.space.sm },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...P.border,
    ...P.shadow.card,
  },
  name: { fontFamily: fonts.sansBold, fontSize: fontSize.h2, letterSpacing: -0.48, color: colors.profileName },
  clip: { overflow: 'hidden' },
  infoRow: {
    minHeight: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: P.space.lg,
    paddingHorizontal: P.space.lg,
  },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  label: { fontFamily: fonts.sansRegular, fontSize: fontSize.md, color: colors.textSecondary },
  value: { flexShrink: 1, fontFamily: fonts.monoRegular, fontSize: fontSize.md, color: colors.textMuted },
  logoutRow: { minHeight: 56, justifyContent: 'center', paddingHorizontal: P.space.lg },
  logout: { fontFamily: fonts.sansSemiBold, fontSize: fontSize.md, color: colors.danger },
});
