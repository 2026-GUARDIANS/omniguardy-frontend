import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { api, type SignupInput, type User } from '../api';

type AuthState = {
  user: User | null;
  /** 저장된 세션 복원(로그인 유지) 확인이 끝났는지. 끝나기 전에는 스플래시를 유지한다 */
  ready: boolean;
  signIn(email: string, password: string): Promise<void>;
  signUp(input: SignupInput): Promise<void>;
  signOut(): Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  // 앱 시작 시 기기에 저장된 세션을 복원한다
  useEffect(() => {
    let cancelled = false;
    api.auth
      .restore()
      .then((session) => {
        if (!cancelled && session) setUser(session.user);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // 토큰 재발급까지 실패하면 로그인 화면으로 보낸다(저장된 세션은 auth 구현에서 지움)
  useEffect(() => api.auth.onSessionExpired(() => setUser(null)), []);

  const signIn = useCallback(async (email: string, password: string) => {
    const session = await api.auth.login(email, password);
    setUser(session.user);
  }, []);

  const signUp = useCallback(async (input: SignupInput) => {
    const session = await api.auth.signup(input);
    setUser(session.user);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.auth.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({ user, ready, signIn, signUp, signOut }), [user, ready, signIn, signUp, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth는 AuthProvider 안에서만 사용할 수 있습니다.');
  return ctx;
}
