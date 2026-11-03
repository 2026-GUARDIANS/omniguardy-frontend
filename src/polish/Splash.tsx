import React, { useEffect, useState } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';

import { colors } from '../theme/tokens';
import { EASE_OUT, NATIVE } from './motion';
import { Wordmark } from './Wordmark';

// 로그인 화면과 같은 로고·워드마크(시작 화면에서 로그인 화면으로 자연스럽게 이어지게)
const logo = require('../../assets/figma/logo-mark.png');

const MIN_VISIBLE_MS = 1000;
const FADE_OUT_MS = 300;

/**
 * 'polish' 시작 화면. 로그인 화면의 로고와 워드마크만 보인다.
 * 글꼴 로드·로그인 확인(ready)이 끝나고 최소 1초가 지나면 300ms 동안 사라지며 아래 화면이 드러난다.
 * 워드마크는 시스템 글꼴이라 글꼴 로드를 기다리지 않는다.
 */
export function PolishSplash({ ready, children }: { ready: boolean; children: React.ReactNode }) {
  const [minElapsed, setMinElapsed] = useState(false);
  const [gone, setGone] = useState(false);
  const opacity = useState(() => new Animated.Value(1))[0];

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), MIN_VISIBLE_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready || !minElapsed) return;
    Animated.timing(opacity, { toValue: 0, duration: FADE_OUT_MS, easing: EASE_OUT, useNativeDriver: NATIVE }).start(() =>
      setGone(true),
    );
  }, [ready, minElapsed, opacity]);

  return (
    <View style={s.root}>
      {children}
      {!gone ? (
        <Animated.View
          style={[s.cover, { opacity }]}
          pointerEvents={ready && minElapsed ? 'none' : 'auto'}
          accessible
          accessibilityLabel="OmniGuardy 시작 중"
        >
          <Image source={logo} style={s.logo} accessibilityIgnoresInvertColors />
          <Wordmark asHeader={false} />
        </Animated.View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  cover: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  // 로그인 화면 로고와 같은 크기
  logo: { width: 96, height: 93 },
});
