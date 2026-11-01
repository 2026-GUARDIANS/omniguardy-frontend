import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fonts, radius, shadow, size, themeFlags } from '../theme/tokens';
import { Icon } from './icons/Icon';

type Props = {
  videoUrl: string | null;
  /** 영상 주소를 받는 중 */
  loading?: boolean;
  /** 영상 주소를 다시 받는다. 실제 서버 주소는 5분 뒤 만료되므로 재생 실패 시 새 주소로 다시 시도한다 */
  onReload?: () => void;
};

/**
 * 이벤트 영상 클립 영역 (Figma 1:502).
 * - videoUrl 있음: expo-video 플레이어(기본 재생 컨트롤, 자동 재생 안 함)
 * - 주소를 받는 중 / 영상 없음: Figma의 빈 상태(모서리 브래킷 + 문구)
 */
export function VideoClipArea({ videoUrl, loading = false, onReload }: Props) {
  if (videoUrl) return <ClipPlayer key={videoUrl} url={videoUrl} onReload={onReload} />;
  return (
    <View
      style={styles.box}
      accessible
      accessibilityLabel={loading ? '영상 클립을 불러오는 중' : '영상 클립 없음'}
    >
      {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
        <View key={c} style={[styles.bracket, styles[c]]} />
      ))}
      {loading ? <ActivityIndicator color={colors.textSecondary} /> : <Icon name="eye" color={themeFlags.iconTint} />}
      <Text style={styles.text}>{loading ? '영상 클립을 불러오는 중입니다' : '이 이벤트에는 영상 클립이 없습니다'}</Text>
    </View>
  );
}

/** url이 바뀌면(key) 플레이어를 새로 만든다 */
function ClipPlayer({ url, onReload }: { url: string; onReload?: () => void }) {
  const player = useVideoPlayer(url, (p) => {
    p.loop = false;
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
        accessibilityLabel="이벤트 영상 클립. 재생 버튼을 눌러 재생합니다"
      />
      {status === 'loading' ? (
        <View style={styles.overlay} pointerEvents="none">
          <ActivityIndicator color={colors.onVideo} />
        </View>
      ) : null}
      {status === 'error' ? (
        <View style={styles.overlay}>
          <Text style={styles.errorText}>영상을 불러오지 못했습니다</Text>
          {onReload ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="영상 다시 불러오기"
              onPress={onReload}
              style={({ pressed }) => [styles.retry, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.retryText}>다시 시도</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const B = 2;
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
  video: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
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
  retryText: { fontFamily: fonts.sansSemiBold, fontSize: fontSize.sm, color: colors.onVideo },
  bracket: { position: 'absolute', width: 20, height: 20, borderColor: colors.bracket },
  tl: { top: 16, left: 16, borderTopWidth: B, borderLeftWidth: B },
  tr: { top: 16, right: 16, borderTopWidth: B, borderRightWidth: B },
  bl: { bottom: 16, left: 16, borderBottomWidth: B, borderLeftWidth: B },
  br: { bottom: 16, right: 16, borderBottomWidth: B, borderRightWidth: B },
});
