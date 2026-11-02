import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fonts, radius, shadow, size, themeFlags } from '../theme/tokens';
import { Icon } from './icons/Icon';

type Props = {
  /**
   * 영상 주소를 받는다. 실제 서버 주소는 5분만 유효하므로 화면에 들어올 때 미리 받지 않고,
   * 재생 버튼을 누를 때(그리고 재생 실패 후 다시 시도할 때) 매번 새로 받는다. 영상이 없으면 null.
   */
  loadUrl: () => Promise<string | null>;
};

type State =
  | { kind: 'idle' }
  | { kind: 'fetching' }
  | { kind: 'ready'; url: string; seq: number }
  | { kind: 'none' }
  | { kind: 'error'; message: string };

/**
 * 이벤트 영상 클립 영역 (Figma 1:502).
 * - 처음: 재생 버튼. 누르면 주소를 받아 바로 재생한다
 * - 주소 받는 중 / 영상 없음 / 주소 받기 실패: Figma의 빈 상태(모서리 브래킷 + 문구)
 * - 재생 중 오류: "다시 시도"가 새 주소를 받아 처음부터 다시 재생한다
 */
export function VideoClipArea({ loadUrl }: Props) {
  const [state, setState] = useState<State>({ kind: 'idle' });
  const seq = useRef(0);

  const play = async () => {
    setState({ kind: 'fetching' });
    try {
      const url = await loadUrl();
      setState(url ? { kind: 'ready', url, seq: ++seq.current } : { kind: 'none' });
    } catch (e) {
      setState({ kind: 'error', message: e instanceof Error ? e.message : '영상 주소를 받지 못했습니다.' });
    }
  };

  // 같은 주소가 다시 와도 플레이어를 새로 만들도록 seq를 key에 넣는다
  if (state.kind === 'ready') return <ClipPlayer key={state.seq} url={state.url} onRetry={play} />;

  if (state.kind === 'idle') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="이벤트 영상 클립 재생"
        onPress={play}
        style={({ pressed }) => [styles.box, pressed && { opacity: 0.85 }]}
      >
        <Brackets />
        <View style={styles.playCircle}>
          <View style={styles.playTriangle} />
        </View>
        <Text style={styles.text}>눌러서 영상 클립 재생</Text>
      </Pressable>
    );
  }

  const fetching = state.kind === 'fetching';
  const message = fetching
    ? '영상 클립을 불러오는 중입니다'
    : state.kind === 'none'
      ? '이 이벤트에는 영상 클립이 없습니다'
      : state.message;
  return (
    <View style={styles.box} accessible accessibilityLabel={message} accessibilityLiveRegion="polite">
      <Brackets />
      {fetching ? <ActivityIndicator color={colors.textSecondary} /> : <Icon name="eye" color={themeFlags.iconTint} />}
      <Text style={styles.text}>{message}</Text>
      {state.kind === 'error' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="영상 다시 불러오기"
          onPress={play}
          style={({ pressed }) => [styles.retry, styles.retryLight, pressed && { opacity: 0.85 }]}
        >
          <Text style={[styles.retryText, styles.retryTextLight]}>다시 시도</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function Brackets() {
  return (
    <>
      {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
        <View key={c} style={[styles.bracket, styles[c]]} />
      ))}
    </>
  );
}

/** 사용자가 재생 버튼을 눌러 만든 플레이어이므로 바로 재생한다 */
function ClipPlayer({ url, onRetry }: { url: string; onRetry: () => void }) {
  const player = useVideoPlayer(url, (p) => {
    p.loop = false;
    p.play();
  });
  const { status } = useEvent(player, 'statusChange', { status: player.status });

  return (
    <View style={[styles.box, styles.playerBox]}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="contain"
        nativeControls
        fullscreenOptions={{ enable: true }}
        accessibilityLabel="이벤트 영상 클립"
      />
      {status === 'loading' ? (
        <View style={styles.overlay} pointerEvents="none">
          <ActivityIndicator color={colors.onVideo} />
        </View>
      ) : null}
      {status === 'error' ? (
        <View style={styles.overlay}>
          <Text style={styles.errorText}>영상을 재생하지 못했습니다</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="영상 다시 불러오기"
            onPress={onRetry}
            style={({ pressed }) => [styles.retry, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.retryText}>다시 시도</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const B = 2;
const PLAY = 56;
const styles = StyleSheet.create({
  box: {
    height: 210,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.cardMd,
    ...shadow.card,
  },
  // 영상은 원본 색을 그대로 보이도록 검은 바탕(테마 색을 입히지 않는다)
  playerBox: { overflow: 'hidden', backgroundColor: colors.videoBg },
  // 웹의 <video>는 top/left/right/bottom만으로는 늘어나지 않고 원본 크기(예: 1280x720)로 그려져 잘린다. 크기를 명시한다
  video: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: colors.videoOverlay,
  },
  playCircle: {
    width: PLAY,
    height: PLAY,
    borderRadius: PLAY / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 테두리로 그린 재생 삼각형(시각 중심을 맞추려고 오른쪽으로 조금 민다)
  playTriangle: {
    marginLeft: 4,
    width: 0,
    height: 0,
    borderTopWidth: 11,
    borderBottomWidth: 11,
    borderLeftWidth: 18,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: colors.onVideo,
  },
  text: { fontFamily: fonts.sansRegular, fontSize: fontSize.sm, color: colors.textSecondary },
  errorText: { fontFamily: fonts.sansRegular, fontSize: fontSize.sm, color: colors.onVideo },
  retry: {
    minHeight: size.minTouch,
    minWidth: 96,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.onVideo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryLight: { borderColor: colors.textSecondary },
  retryText: { fontFamily: fonts.sansSemiBold, fontSize: fontSize.sm, color: colors.onVideo },
  retryTextLight: { color: colors.textSecondary },
  bracket: { position: 'absolute', width: 20, height: 20, borderColor: colors.bracket },
  tl: { top: 16, left: 16, borderTopWidth: B, borderLeftWidth: B },
  tr: { top: 16, right: 16, borderTopWidth: B, borderRightWidth: B },
  bl: { bottom: 16, left: 16, borderBottomWidth: B, borderLeftWidth: B },
  br: { bottom: 16, right: 16, borderBottomWidth: B, borderRightWidth: B },
});
