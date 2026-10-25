import React, { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api, RISK_LEVELS, type RiskLevel, type SecurityEvent } from '../api';
import { TAB_BAR_SPACE } from '../components/BottomTabBar';
import { EventRow } from '../components/EventRow';
import { LoadState } from '../components/LoadState';
import { useApiData } from '../hooks/useApiData';
import { formatDayLabel } from '../lib/format';
import type { TabScreenProps } from '../navigation/types';
import { useRealtimeAlert } from '../state/RealtimeAlertContext';
import { colors, fontSize, fonts, hitSlopFor, radius, riskColors } from '../theme/tokens';
import { type } from '../theme/typography';

type Filter = 'ALL' | RiskLevel;

const CHIP_HEIGHT = 36; // Figma 칩 높이. 터치 영역은 hitSlop으로 44px 보정

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

// Figma 1:432 이벤트 기록 조회 화면
export function EventsScreen({ navigation }: TabScreenProps<'Events'>) {
  const { eventsVersion } = useRealtimeAlert();
  const [filter, setFilter] = useState<Filter>('ALL');
  const events = useApiData(
    () => api.events.list(filter === 'ALL' ? undefined : { risk: filter }),
    [filter, eventsVersion],
  );
  const sections = useMemo(() => groupByDay(events.data ?? []), [events.data]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={type.pageTitleDecorative}>
          이벤트 기록
        </Text>
      </View>

      <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel="위험도 필터">
        <FilterChip label="전체" selected={filter === 'ALL'} onPress={() => setFilter('ALL')} />
        {RISK_LEVELS.map((r) => (
          <FilterChip key={r} label={r} risk={r} selected={filter === r} onPress={() => setFilter(r)} />
        ))}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(e) => e.id}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => <DateTag label={section.title} />}
        renderItem={({ item }) => (
          <EventRow event={item} onPress={() => navigation.navigate('EventDetail', { eventId: item.id })} />
        )}
        ItemSeparatorComponent={() => <View style={styles.gap} />}
        SectionSeparatorComponent={() => <View style={styles.gap} />}
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

function FilterChip({
  label,
  risk,
  selected,
  onPress,
}: {
  label: string;
  risk?: RiskLevel;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={risk ? `위험도 ${label}` : label}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      hitSlop={hitSlopFor(CHIP_HEIGHT, 56)}
      style={[styles.chip, risk ? styles.chipRisk : styles.chipAll, selected ? styles.chipSelected : styles.chipIdle]}
    >
      {risk ? <View style={[styles.chipDot, { backgroundColor: riskColors[risk].chipDot }]} /> : null}
      <Text style={[risk ? styles.chipRiskText : styles.chipAllText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

/** 날짜 묶음 태그 (Figma: 양피지 배경, -1.5° 기울임) */
function DateTag({ label }: { label: string }) {
  return (
    <View style={styles.dateWrap}>
      <View style={styles.dateTag}>
        <Text accessibilityRole="header" style={styles.dateText}>
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 24, paddingBottom: 16, paddingHorizontal: 24 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 24, paddingBottom: 16 },
  chip: {
    height: CHIP_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.pill,
  },
  chipAll: { paddingHorizontal: 20 },
  chipRisk: { paddingHorizontal: 16 },
  chipIdle: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  chipSelected: { backgroundColor: colors.primary, borderWidth: 1, borderColor: colors.primary },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipAllText: { fontFamily: fonts.sansBold, fontSize: fontSize.sm, color: colors.textSecondary },
  // Figma 원본 rgba(31,31,31,0.32) → 조정 #6B7280 (대비 2.0:1 → 4.7:1)
  chipRiskText: { fontFamily: fonts.monoMedium, fontSize: fontSize.xs, color: colors.textSecondary },
  chipTextSelected: { color: colors.textOnPrimary },
  list: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: TAB_BAR_SPACE },
  gap: { height: 12 },
  dateWrap: { paddingBottom: 8, alignItems: 'flex-start' },
  dateTag: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.parchment,
    transform: [{ rotate: '-1.5deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  // Figma 원본 #A5A696 → 조정 onParchment (대비 1.9:1 → 5.3:1)
  dateText: { fontFamily: fonts.monoSemiBold, fontSize: fontSize.xs, color: colors.onParchment },
});
