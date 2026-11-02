import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';

type State<T> = { data: T | null; error: string | null; loading: boolean };

/**
 * API 호출 결과를 상태로 보관한다. 화면에 다시 들어올 때(focus)와 deps가 바뀔 때 다시 불러온다.
 * 이전 데이터가 있으면 다시 불러오는 동안에도 유지한다.
 */
export function useApiData<T>(fetcher: () => Promise<T>, deps: readonly unknown[] = []) {
  const [state, setState] = useState<State<T>>({ data: null, error: null, loading: true });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const reqId = useRef(0);

  const reload = useCallback(async () => {
    const id = ++reqId.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetcherRef.current();
      if (id === reqId.current) setState({ data, error: null, loading: false });
    } catch (e) {
      if (id === reqId.current)
        setState((s) => ({ ...s, loading: false, error: e instanceof Error ? e.message : '불러오지 못했습니다.' }));
    }
  }, []);

  // 첫 로드는 아래 focus 효과가 담당하고, 여기서는 deps 변경 시에만 다시 불러온다.
  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) void reload();
    mounted.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  return { ...state, reload };
}
