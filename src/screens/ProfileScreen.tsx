import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '../api';
import { BackHeader } from '../components/BackHeader';
import { BottomTabBar, TAB_BAR_SPACE } from '../components/BottomTabBar';
import { ExampleTag } from '../components/ExampleTag';
import { Icon } from '../components/icons/Icon';
import { LoadState } from '../components/LoadState';
import { useApiData } from '../hooks/useApiData';
import { TAB_TO_ROUTE } from '../navigation/tabs';
import type { RootScreenProps } from '../navigation/types';
import { useAuth } from '../state/AuthContext';
import { colors, fontSize, fonts, radius, shadow, themeFlags } from '../theme/tokens';

// Figma 1:658 마이페이지(프로필). 하단 탭은 "설정"이 활성(Figma 기준).
export function ProfileScreen({ navigation }: RootScreenProps<'Profile'>) {
  const { user: sessionUser, signOut } = useAuth();
  const me = useApiData(() => api.auth.getMe());
  const user = me.data ?? sessionUser;
  const [signingOut, setSigningOut] = useState(false);

  const onSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut(); // 로그인 화면으로 전환됨
    } catch (e) {
      setSigningOut(false);
      Alert.alert('로그아웃 실패', e instanceof Error ? e.message : '다시 시도해 주세요.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerWrap}>
        <BackHeader
          title="프로필"
          backLabel="이전 화면으로 돌아가기"
          titleColor={colors.headerTitleProfile}
          onBack={() => navigation.goBack()}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Icon name="user40" color={themeFlags.iconTint} />
          </View>
          <Text accessibilityRole="header" style={styles.name}>
            {user?.name ?? '—'}
          </Text>
          {/* mock 모드: 계정 정보가 예시 값임을 표시(실제 API 모드에서는 렌더링 안 함) */}
          <ExampleTag />
        </View>

        <LoadState loading={me.loading} error={me.error} onRetry={me.reload} hasData={!!user} />

        <View style={styles.card}>
          {/* Figma의 "연락처" 줄은 서버에 값이 없어 뺐다(사용자 결정) */}
          <InfoRow label="이메일" value={user?.email ?? '—'} />
        </View>

        <View style={styles.card}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="비밀번호 변경"
            onPress={() => Alert.alert('비밀번호 변경', '준비 중인 기능입니다.')}
            style={({ pressed }) => [styles.linkRow, styles.divider, pressed && styles.pressed]}
          >
            <Text style={styles.label}>비밀번호 변경</Text>
            <Icon name="chevronRight" color={themeFlags.iconTint} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="로그아웃"
            accessibilityState={{ busy: signingOut, disabled: signingOut }}
            disabled={signingOut}
            onPress={onSignOut}
            style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}
          >
            <Text style={styles.logout}>로그아웃</Text>
          </Pressable>
        </View>
      </ScrollView>

      <BottomTabBar active="settings" onSelect={(key) => navigation.navigate('Main', { screen: TAB_TO_ROUTE[key] })} />
    </SafeAreaView>
  );
}

function InfoRow({ label, value, divider }: { label: string; value: string; divider?: boolean }) {
  return (
    <View style={[styles.infoRow, divider && styles.divider]} accessible accessibilityLabel={`${label} ${value}`}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  headerWrap: { paddingBottom: 6 },
  content: { paddingHorizontal: 16, paddingBottom: TAB_BAR_SPACE, gap: 16 },

  identity: { alignItems: 'center', gap: 12, paddingTop: 8, paddingBottom: 4 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: colors.avatarBorder,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.avatar,
  },
  // figma: 원본 #A5A696 → 조정 primary (대비 2.4:1 → 4.8:1) / custom: brown-600 (6.19:1)
  name: { fontFamily: fonts.sansBold, fontSize: fontSize.h2, letterSpacing: -0.48, color: colors.profileName },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderParchment,
    borderRadius: radius.cardSm,
    overflow: 'hidden',
  },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.borderParchment },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 16,
  },
  linkRow: {
    minHeight: 55,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  pressed: { backgroundColor: colors.background },
  label: { fontFamily: fonts.sansRegular, fontSize: fontSize.md, color: colors.textSecondary },
  value: { flexShrink: 1, fontFamily: fonts.monoRegular, fontSize: fontSize.sm, color: colors.textMuted },
  logout: { fontFamily: fonts.sansSemiBold, fontSize: fontSize.md, color: colors.danger },
});
