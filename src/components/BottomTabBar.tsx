import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fontSize, fonts, radius, shadow, size } from '../theme/tokens';
import { Icon } from './icons/Icon';
import type { FigmaIconName } from './icons/figmaSvgs';

export type TabKey = 'home' | 'events' | 'settings';

const TABS: { key: TabKey; label: string; icon: FigmaIconName }[] = [
  { key: 'home', label: '홈', icon: 'tabHome' },
  { key: 'events', label: '이벤트 기록', icon: 'tabEvents' },
  { key: 'settings', label: '설정', icon: 'tabSettings' },
];

/** 화면 하단 여백: 탭 바 높이(66) + 띄움(19) + 여유 */
export const TAB_BAR_SPACE = 116;

type Props = { active: TabKey; onSelect: (key: TabKey) => void };

/** Figma "Nav - 하단 탭": 떠 있는 알약 모양. 비활성 라벨은 #6B7280(Figma 설정 화면 값)으로 통일. */
export function BottomTabBar({ active, onSelect }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View accessibilityRole="tablist" style={[styles.bar, { bottom: 19 + insets.bottom }]}>
      {TABS.map((t) => {
        const selected = t.key === active;
        return (
          <Pressable
            key={t.key}
            accessibilityRole="tab"
            accessibilityLabel={t.label}
            accessibilityState={{ selected }}
            onPress={() => onSelect(t.key)}
            style={[styles.item, selected && styles.itemActive]}
          >
            <Icon name={t.icon} color={selected ? colors.textOnPrimary : colors.textSecondary} />
            <Text style={selected ? styles.labelActive : styles.label}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 4,
    padding: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.tabBar,
    backgroundColor: colors.tabBarSolid,
    ...shadow.tabBar,
  },
  item: {
    flex: 1,
    minHeight: size.tabItem,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.pill,
  },
  itemActive: { backgroundColor: colors.primary },
  label: { fontFamily: fonts.sansMedium, fontSize: fontSize.sm, color: colors.textSecondary },
  labelActive: { fontFamily: fonts.sansBold, fontSize: fontSize.sm, color: colors.textOnPrimary },
});
