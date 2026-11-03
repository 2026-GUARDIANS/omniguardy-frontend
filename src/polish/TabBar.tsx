import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { TabKey } from '../components/BottomTabBar';
import type { FigmaIconName } from '../components/icons/figmaSvgs';
import { colors, fontSize, fonts } from '../theme/tokens';
import { Crossfade } from './motion';
import { P, PIcon, Press } from './ui';

const TABS: { key: TabKey; label: string; icon: FigmaIconName }[] = [
  { key: 'home', label: '홈', icon: 'tabHome' },
  { key: 'events', label: '이벤트 기록', icon: 'tabEvents' },
  { key: 'settings', label: '설정', icon: 'tabSettings' },
];

/** 'polish' 하단 탭. figma와 같은 떠 있는 알약 모양, 그림자는 float 하나. 활성 탭 색은 200ms 동안 바뀐다 */
export function TabBar({ active, onSelect }: { active: TabKey; onSelect: (key: TabKey) => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View accessibilityRole="tablist" style={[s.bar, { bottom: 19 + insets.bottom }]}>
      {TABS.map((t) => {
        const selected = t.key === active;
        const face = (on: boolean) => (
          <View style={[s.item, on && s.itemOn]}>
            <PIcon name={t.icon} color={on ? colors.textOnPrimary : colors.textSecondary} />
            <Text style={on ? s.labelOn : s.label}>{t.label}</Text>
          </View>
        );
        return (
          <Press
            key={t.key}
            accessibilityRole="tab"
            accessibilityLabel={t.label}
            accessibilityState={{ selected }}
            onPress={() => onSelect(t.key)}
            style={s.press}
          >
            <Crossfade active={selected} off={face(false)} on={face(true)} />
          </Press>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: P.gutter,
    right: P.gutter,
    flexDirection: 'row',
    gap: P.space.xs,
    padding: P.space.sm,
    borderRadius: P.radius.pill,
    ...P.border,
    backgroundColor: colors.tabBarSolid,
    ...P.shadow.float,
  },
  press: { flex: 1, borderRadius: P.radius.pill },
  item: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: P.space.sm,
    borderRadius: P.radius.pill,
  },
  itemOn: { backgroundColor: colors.primary },
  label: { fontFamily: fonts.sansMedium, fontSize: fontSize.sm, color: colors.textSecondary },
  labelOn: { fontFamily: fonts.sansBold, fontSize: fontSize.sm, color: colors.textOnPrimary },
});
