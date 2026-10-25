import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { api, type RealtimeStatus, type SecurityEvent } from '../api';
import { navigationRef } from '../navigation/navigationRef';
import { useAuth } from './AuthContext';

type RealtimeAlertState = {
  status: RealtimeStatus;
  /** 아직 처리하지 않은 HIGH 알림 */
  activeAlert: SecurityEvent | null;
  /** 실시간 수신으로 이벤트 목록이 바뀔 때마다 증가 → 목록 화면이 다시 불러온다 */
  eventsVersion: number;
  /** "경고 끄기" */
  stopWarning(): Promise<void>;
  /** 알림을 확인 처리(상세 화면 "확인 완료") */
  clearAlert(eventId: string): void;
};

const RealtimeAlertContext = createContext<RealtimeAlertState | null>(null);

/** 로그인 상태일 때 실시간 채널에 연결하고, HIGH 이벤트를 받으면 위험 알림 화면을 띄운다. */
export function RealtimeAlertProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [status, setStatus] = useState<RealtimeStatus>(api.realtime.getStatus());
  const [activeAlert, setActiveAlert] = useState<SecurityEvent | null>(null);
  const [eventsVersion, setEventsVersion] = useState(0);

  useEffect(() => {
    if (!user) return;
    const offStatus = api.realtime.subscribeStatus(setStatus);
    const offMessage = api.realtime.subscribe((message) => {
      if (message.type !== 'event') return;
      setEventsVersion((v) => v + 1);
      if (message.event.risk !== 'HIGH') return;
      setActiveAlert(message.event);
      if (navigationRef.isReady()) navigationRef.navigate('Alert', { eventId: message.event.id });
    });
    api.realtime.connect();
    return () => {
      offMessage();
      offStatus();
      api.realtime.disconnect();
      setActiveAlert(null);
    };
  }, [user]);

  const stopWarning = useCallback(async () => {
    await api.devices.stopWarning();
  }, []);

  const clearAlert = useCallback((eventId: string) => {
    setActiveAlert((cur) => (cur?.id === eventId ? null : cur));
  }, []);

  const value = useMemo(
    () => ({ status, activeAlert, eventsVersion, stopWarning, clearAlert }),
    [status, activeAlert, eventsVersion, stopWarning, clearAlert],
  );
  return <RealtimeAlertContext.Provider value={value}>{children}</RealtimeAlertContext.Provider>;
}

export function useRealtimeAlert() {
  const ctx = useContext(RealtimeAlertContext);
  if (!ctx) throw new Error('useRealtimeAlert는 RealtimeAlertProvider 안에서만 사용할 수 있습니다.');
  return ctx;
}
