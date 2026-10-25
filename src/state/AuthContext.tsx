import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { api, type SignupInput, type User } from '../api';

type AuthState = {
  user: User | null;
  signIn(email: string, password: string): Promise<void>;
  signUp(input: SignupInput): Promise<void>;
  signOut(): Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const signIn = useCallback(async (email: string, password: string) => {
    const session = await api.auth.login(email, password);
    setUser(session.user);
  }, []);

  const signUp = useCallback(async (input: SignupInput) => {
    const session = await api.auth.signup(input);
    setUser(session.user);
  }, []);

  const signOut = useCallback(async () => {
    await api.auth.logout();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, signIn, signUp, signOut }), [user, signIn, signUp, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth는 AuthProvider 안에서만 사용할 수 있습니다.');
  return ctx;
}
