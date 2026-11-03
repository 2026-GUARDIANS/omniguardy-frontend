// 'polish' 테마 애니메이션. RN 기본 Animated만 쓴다(새 패키지 없음).
// - transform·opacity만 움직인다(네이티브 드라이버, 저사양 폰에서도 끊기지 않게)
// - 시스템 "애니메이션 줄이기"가 켜져 있으면 이동은 없애고 짧은 페이드만 남긴다
import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

/** 강한 ease-out. 시작이 빨라 반응이 즉각적으로 느껴진다 */
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
/** 웹에는 네이티브 드라이버가 없다 */
export const NATIVE = Platform.OS !== 'web';

export const DURATION = {
  /** 눌림 배경 */
  press: 120,
  /** 상태 전환(색·아이콘) */
  state: 240,
  /** 화면 진입 */
  enter: 280,
  /** 진입 순서 간격 */
  stagger: 50,
  /** 줄인 모션일 때 페이드 */
  reduced: 150,
} as const;

// "애니메이션 줄이기" 설정. 앱 시작 때 한 번 읽고 바뀌면 따라간다(첫 화면 전에 스플래시가 있어 대부분 미리 읽혀 있다)
let reduceMotion = false;
const listeners = new Set<(v: boolean) => void>();
void AccessibilityInfo.isReduceMotionEnabled()
  .then((v) => {
    reduceMotion = v;
    listeners.forEach((l) => l(v));
  })
  .catch(() => {});
AccessibilityInfo.addEventListener?.('reduceMotionChanged', (v) => {
  reduceMotion = v;
  listeners.forEach((l) => l(v));
});

export function useReducedMotion() {
  const [value, setValue] = useState(reduceMotion);
  useEffect(() => {
    listeners.add(setValue);
    return () => {
      listeners.delete(setValue);
    };
  }, []);
  return value;
}

/** 화면 진입: 10px 아래에서 올라오며 페이드인. index 순서로 50ms씩 늦게(최대 8번째까지). 터치는 막지 않는다 */
export function FadeUp({
  index = 0,
  style,
  children,
}: {
  index?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const v = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: reduce ? DURATION.reduced : DURATION.enter,
      delay: reduce ? 0 : Math.min(index, 8) * DURATION.stagger,
      easing: EASE_OUT,
      useNativeDriver: NATIVE,
    }).start();
    // 처음 나타날 때 한 번만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const transform = reduce ? [] : [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }];
  return <Animated.View style={[style, { opacity: v, transform }]}>{children}</Animated.View>;
}

/** 0↔1 값을 부드럽게 따라가는 Animated.Value(상태 전환용) */
export function useAnimatedFlag(on: boolean, duration: number = DURATION.state) {
  const v = useState(() => new Animated.Value(on ? 1 : 0))[0];
  useEffect(() => {
    Animated.timing(v, { toValue: on ? 1 : 0, duration, easing: EASE_OUT, useNativeDriver: NATIVE }).start();
  }, [on, duration, v]);
  return v;
}

/**
 * 두 모양(off/on)을 겹쳐 두고 투명도로 바꾼다(색이 바뀌는 칩·탭용).
 * off가 크기를 정하고 on은 그 위에 겹친다.
 * - stretch(기본): on을 off와 같은 크기로 늘린다(탭처럼 칸을 채워야 할 때)
 * - center: on을 자기 크기대로 가운데에 둔다(칩처럼 글자 폭에 맞는 모양).
 *   Android에서 폭을 딱 맞춰 주면 글자 폭을 반올림하다 줄이 바뀌는 문제가 있어 칩은 이쪽을 쓴다
 */
export function Crossfade({
  active,
  off,
  on,
  fit = 'stretch',
}: {
  active: boolean;
  off: React.ReactNode;
  on: React.ReactNode;
  fit?: 'stretch' | 'center';
}) {
  const v = useAnimatedFlag(active);
  return (
    <View>
      <Animated.View style={{ opacity: v.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }}>{off}</Animated.View>
      <Animated.View pointerEvents="none" style={[fit === 'center' ? styles.center : StyleSheet.absoluteFill, { opacity: v }]}>
        {on}
      </Animated.View>
    </View>
  );
}

/** key가 바뀔 때마다 내용을 다시 페이드인(현재 상태 문구·아이콘 전환) */
export function FadeSwap({ swapKey, style, children }: { swapKey: string; style?: StyleProp<ViewStyle>; children: React.ReactNode }) {
  const v = useState(() => new Animated.Value(1))[0];
  const [firstKey] = useState(swapKey);
  const changed = useRef(false);
  useEffect(() => {
    // 처음 그릴 때는 그대로 두고, key가 바뀐 뒤부터 페이드인
    if (!changed.current && swapKey === firstKey) return;
    changed.current = true;
    v.setValue(0);
    Animated.timing(v, { toValue: 1, duration: DURATION.state, easing: EASE_OUT, useNativeDriver: NATIVE }).start();
  }, [swapKey, firstKey, v]);
  return <Animated.View style={[style, { opacity: v }]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  // 양옆으로 8px 여유를 둬서 on 모양이 off 폭에 눌리지 않게(자기 폭대로 가운데)
  center: { position: 'absolute', top: 0, bottom: 0, left: -8, right: -8, alignItems: 'center', justifyContent: 'center' },
});
