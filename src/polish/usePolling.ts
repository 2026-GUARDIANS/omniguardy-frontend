// 'polish' 화면이 보이는 동안 서버를 주기적으로 다시 확인한다(홈·이벤트 기록·이벤트 상세).
// 실서버는 MEDIUM·HIGH만 푸시를 보내서(LOW·분석 중은 푸시 없음) 푸시만으로는 갱신되지 않는 이벤트가 있다.
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { AppState } from 'react-native';

/** 확인 간격 */
export const POLL_MS = 1000;

/**
 * 화면이 보이고 앱이 앞에 있는 동안 intervalMs마다 refresh를 부른다. 다른 탭·화면으로 가거나 앱이 뒤로 가면 멈춘다.
 * - 앞선 확인이 아직 끝나지 않았으면(느린 네트워크) 이번 확인은 건너뛴다
 * - quiet: 조용한 확인 중이면 true. 화면은 이때 "최신 정보로 바꾸는 중" 표시와 흐림을 띄우지 않는다
 * - refreshQuietly: 당겨서 새로고침처럼 직접 부를 때도 같은 방식으로 확인한다
 */
export function usePolling(refresh: () => Promise<unknown>, intervalMs: number = POLL_MS) {
  const [quiet, setQuiet] = useState(false);
  const inFlight = useRef(false);
  const refreshQuietly = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setQuiet(true);
    try {
      await refresh();
    } finally {
      inFlight.current = false;
      setQuiet(false);
    }
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      const t = setInterval(() => {
        if (AppState.currentState === 'active') void refreshQuietly();
      }, intervalMs);
      return () => clearInterval(t);
    }, [refreshQuietly, intervalMs]),
  );

  return { quiet, refreshQuietly };
}
