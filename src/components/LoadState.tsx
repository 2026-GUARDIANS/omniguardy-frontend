import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fonts, size } from '../theme/tokens';

type Props = {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  /** 데이터가 이미 있으면 로딩 표시를 생략한다 */
  hasData: boolean;
  emptyText?: string;
  isEmpty?: boolean;
};

/** 로딩/오류/빈 상태. 해당 상태가 아니면 아무것도 그리지 않는다. */
export function LoadState({ loading, error, onRetry, hasData, emptyText, isEmpty }: Props) {
  if (error) {
    return (
      <View style={styles.box} accessibilityLiveRegion="polite">
        <Text style={styles.text}>{error}</Text>
        <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retry}>
          <Text style={styles.retryText}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }
  if (loading && !hasData) {
    return (
      <View style={styles.box}>
        <ActivityIndicator color={colors.primary} accessibilityLabel="불러오는 중" />
      </View>
    );
  }
  if (isEmpty && emptyText) {
    return (
      <View style={styles.box}>
        <Text style={styles.text}>{emptyText}</Text>
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  box: { paddingVertical: 24, alignItems: 'center', gap: 8 },
  text: { fontFamily: fonts.sansRegular, fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center' },
  retry: { minHeight: size.minTouch, justifyContent: 'center', paddingHorizontal: 12 },
  retryText: { fontFamily: fonts.sansSemiBold, fontSize: fontSize.sm, color: colors.primary },
});
