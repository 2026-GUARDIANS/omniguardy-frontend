import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '../../api';
import { ExampleTag } from '../../components/ExampleTag';
import { Icon } from '../../components/icons/Icon';
import { LoadState } from '../../components/LoadState';
import { MixedText } from '../../components/MixedText';
import { useApiData } from '../../hooks/useApiData';
import { detectedSentence, formatTime } from '../../lib/format';
import type { RootScreenProps } from '../../navigation/types';
import { useRealtimeAlert } from '../../state/RealtimeAlertContext';
import { colors, fontSize, fonts, radius } from '../../theme/tokens';
import { P, PButton, PIcon } from '../ui';

// 'polish' 위험 알림. 배치·동작은 screens/AlertScreen.tsx와 같고, 장식은 기존 동심원만 둔다(새 효과 없음).
// 바뀐 점: 아이콘 선 통일, 버튼 눌림 반응, "현관"은 서버 값이 아니라 예시 표시를 붙임
export function AlertScreen({ navigation, route }: RootScreenProps<'Alert'>) {
  const { eventId } = route.params;
  const { activeAlert } = useRealtimeAlert();
  const fetched = useApiData(() => api.events.get(eventId), [eventId]);
  const event = fetched.data ?? (activeAlert?.id === eventId ? activeAlert : null);
  const onStop = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.replace('Main', { screen: 'Home' });
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* 장식: 기존 동심원 그대로 */}
      <View pointerEvents="none" style={s.rings} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Icon name="alertRings" />
      </View>

      <View style={s.top}>
        <View style={s.tag}>
          <MixedText style={s.tagText} weight="semibold">
            {`${event?.risk ?? 'HIGH'} · 위험 알림`}
          </MixedText>
        </View>
      </View>

      <View style={s.middle}>
        {event ? (
          <>
            <View style={s.iconCircle}>
              <PIcon name="alertWarning" color={colors.primary} size={48} />
            </View>
            <Text accessibilityRole="header" accessibilityLiveRegion="assertive" style={s.headline}>
              {detectedSentence(event.title, true)}
            </Text>
            <View style={s.divider} />
            <View style={s.metaRow}>
              <MixedText style={s.meta} weight="medium">{`${formatTime(event.occurredAt)} · 현관`}</MixedText>
              {/* 위치는 서버 응답에 없는 값이라 예시로 표시(mock 모드에서만 보임) */}
              <ExampleTag />
            </View>
            <View style={s.warnPill}>
              <PIcon name="speaker" color={colors.textOnPrimary} />
              <Text style={s.warnText}>경고 출력 중</Text>
            </View>
          </>
        ) : (
          <LoadState loading={fetched.loading} error={fetched.error} onRetry={fetched.reload} hasData={false} />
        )}
      </View>

      <View style={s.actions}>
        <PButton
          label="상세 보기"
          trailingIcon="arrowRight"
          outlineColor={colors.alertDetailBorder === 'transparent' ? undefined : colors.alertDetailBorder}
          disabled={!event}
          onPress={() => navigation.replace('EventDetail', { eventId })}
        />
        <PButton label="경고 끄기" variant="secondary" onPress={onStop} />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.alertBg, paddingHorizontal: P.space.xl, overflow: 'hidden' },
  rings: { position: 'absolute', top: 40, right: -210 },
  top: { paddingTop: P.space.xl, flexDirection: 'row' },
  tag: { backgroundColor: colors.alertTagBg, paddingHorizontal: P.space.md, paddingVertical: 6, borderRadius: radius.pill },
  tagText: { fontFamily: fonts.monoSemiBold, fontSize: fontSize.sm, color: colors.textOnPrimary },
  middle: { flex: 1, justifyContent: 'center', alignItems: 'flex-start' },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.alertIconCircle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: P.space.xxl,
    ...P.border,
    ...P.shadow.card,
  },
  headline: { fontFamily: fonts.sansBold, fontSize: fontSize.hero, lineHeight: 48, color: colors.alertHeadline },
  divider: { width: 56, height: 2, backgroundColor: colors.alertDivider, marginVertical: P.space.xl },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: P.space.sm },
  meta: { fontFamily: fonts.monoMedium, fontSize: fontSize.xl, color: colors.alertMeta },
  warnPill: {
    marginTop: P.space.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: P.space.sm,
    paddingLeft: P.space.md,
    paddingRight: P.space.lg,
    paddingVertical: P.space.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.warnPill,
  },
  warnText: { fontFamily: fonts.sansSemiBold, fontSize: fontSize.md, color: colors.textOnPrimary },
  actions: { paddingTop: P.space.md, paddingBottom: P.space.xxl, gap: P.space.sm },
});
