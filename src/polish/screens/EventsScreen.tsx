import React, { useCallback, useMemo, useState } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api, RISK_LEVELS, type RiskLevel, type SecurityEvent } from '../../api';
import { TAB_BAR_SPACE } from '../../components/BottomTabBar';
import { LoadState } from '../../components/LoadState';
import { useApiData } from '../../hooks/useApiData';
import { formatDayLabel } from '../../lib/format';
import type { TabScreenProps } from '../../navigation/types';
import { useRealtimeAlert } from '../../state/RealtimeAlertContext';
import { colors, fontSize, fonts, riskColors } from '../../theme/tokens';
import { type } from '../../theme/typography';
import { Crossfade, FadeUp } from '../motion';
import { P, PEventRow, Press, StaleNotice, staleDim } from '../ui';
import { usePolling } from '../usePolling';

// 필터는 서버가 해당 위험도만 거른다(screens/EventsScreen.tsx와 같음)
type RiskFilter = Exclude<RiskLevel, 'CRITICAL'>;
type Filter = 'ALL' | RiskFilter;

const CHIP_HEIGHT = 40;

function groupByDay(events: SecurityEvent[]) {
  const sections: { title: string; data: SecurityEvent[] }[] = [];
  for (const e of events) {
    const title = formatDayLabel(e.occurredAt);
    const last = sections[sections.length - 1];
    if (last?.title === title) last.data.push(e);
    else sections.push({ title, data: [e] });
  }
  return sections;
}

export function EventsScreen({ navigation }: TabScreenProps<'Events'>) {
  const { eventsVersion } = useRealtimeAlert();
  const [filter, setFilter] = useState<Filter>('ALL');
  const events = useApiData(
    () => api.events.list(filter === 'ALL' ? undefined : { risk: filter }),
    [filter, eventsVersion],
  );
  // 화면이 보이는 동안 1초마다 조용히 새 이벤트 확인(지금 고른 필터 그대로)
  const { quiet } = usePolling(events.reload);
  const loading = events.loading && !quiet;
  const sections = useMemo(() => groupByDay(events.data ?? []), [events.data]);
  const stale = !!events.data && (loading || !!events.error);
  const openEvent = useCallback((id: string) => navigation.navigate('EventDetail', { eventId: id }), [navigation]);

  // 진입 애니메이션 순서: 날짜 묶음을 지나며 줄마다 하나씩
  const order = useMemo(() => {
    const m = new Map<string, number>();
    let i = 0;
    for (const sec of sections) for (const e of sec.data) m.set(e.id, i++);
    return m;
  }, [sections]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text accessibilityRole="header" style={type.pageTitleDecorative}>
          이벤트 기록
        </Text>
      </View>

      <View style={s.chips} accessibilityRole="radiogroup" accessibilityLabel="위험도 필터">
        <Chip label="전체" selected={filter === 'ALL'} onPress={() => setFilter('ALL')} />
        {RISK_LEVELS.map((r) => (
          <Chip key={r} label={r} risk={r} selected={filter === r} onPress={() => setFilter(r)} />
        ))}
      </View>

      <View style={s.notice}>
        <StaleNotice hasData={!!events.data} loading={loading} error={events.error} onRetry={events.reload} />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(e) => e.id}
        style={staleDim(stale)}
        contentContainerStyle={s.list}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <View style={s.dateWrap}>
            <View style={s.dateTag}>
              <Text accessibilityRole="header" style={s.dateText}>
                {section.title}
              </Text>
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <FadeUp index={order.get(item.id) ?? 0}>
            <PEventRow event={item} onOpen={openEvent} />
          </FadeUp>
        )}
        ItemSeparatorComponent={Gap}
        SectionSeparatorComponent={Gap}
        ListEmptyComponent={
          <LoadState
            loading={events.loading}
            error={events.error}
            onRetry={events.reload}
            hasData={!!events.data}
            isEmpty={!!events.data && events.data.length === 0}
            emptyText={filter === 'ALL' ? '이벤트 기록이 없습니다.' : `${filter} 이벤트가 없습니다.`}
          />
        }
      />
    </SafeAreaView>
  );
}

const Gap = () => <View style={s.gap} />;

/** 위험도 필터 칩. 선택 색은 200ms 동안 바뀐다 */
function Chip({ label, risk, selected, onPress }: { label: string; risk?: RiskFilter; selected: boolean; onPress: () => void }) {
  const face = (on: boolean) => (
    <View style={[s.chip, on ? s.chipOn : s.chipOff]}>
      {risk ? <View style={[s.chipDot, { backgroundColor: on ? colors.textOnPrimary : riskColors[risk].chipDot }]} /> : null}
      <Text numberOfLines={1} style={[risk ? s.chipRiskText : s.chipText, on && s.chipTextOn]}>
        {label}
      </Text>
    </View>
  );
  return (
    <Press
      accessibilityRole="radio"
      accessibilityLabel={risk ? `위험도 ${label}` : label}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      hitSlop={{ top: 2, bottom: 2 }}
      style={s.chipPress}
    >
      <Crossfade active={selected} off={face(false)} on={face(true)} fit="center" />
    </Press>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: P.space.xl, paddingBottom: P.space.lg, paddingHorizontal: P.space.xl },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: P.space.sm, paddingHorizontal: P.gutter },
  chipPress: { borderRadius: P.radius.pill },
  chip: {
    height: CHIP_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: P.space.sm,
    paddingHorizontal: P.space.lg,
    borderRadius: P.radius.pill,
    borderWidth: 1,
  },
  chipOff: { backgroundColor: colors.surface, borderColor: colors.border },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipText: { fontFamily: fonts.sansBold, fontSize: fontSize.sm, color: colors.chipText },
  chipRiskText: { fontFamily: fonts.monoSemiBold, fontSize: fontSize.sm, color: colors.chipText },
  chipTextOn: { color: colors.textOnPrimary },
  notice: { paddingHorizontal: P.gutter, paddingTop: P.space.md },
  list: { paddingHorizontal: P.gutter, paddingTop: P.space.sm, paddingBottom: TAB_BAR_SPACE },
  gap: { height: P.space.sm },
  dateWrap: { paddingTop: P.space.sm, paddingBottom: P.space.xs, alignItems: 'flex-start' },
  dateTag: {
    paddingHorizontal: P.space.md,
    paddingVertical: P.space.xs,
    borderRadius: 8,
    backgroundColor: colors.dateTagBg, // 'polish'는 기울이지 않는다
  },
  dateText: { fontFamily: fonts.monoKoSemiBold, fontSize: fontSize.xs, color: colors.dateTagText },
});
