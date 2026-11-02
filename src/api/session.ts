// 로그인 유지: 세션(Access Token + 사용자 정보)을 기기 보안 저장소에 보관한다.
// Android: Keystore로 암호화한 저장소, iOS: Keychain. 웹 등 지원하지 않는 환경에서는 저장하지 않는다.
// refreshToken은 서버가 HttpOnly 쿠키로 관리하므로 여기 저장하지 않는다.
import * as SecureStore from 'expo-secure-store';

import type { Session } from './types';

const KEY = 'omniguardy.session';

async function available() {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function loadSession(): Promise<Session | null> {
  if (!(await available())) return null;
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Session>;
    if (!parsed.accessToken || !parsed.user?.email) return null;
    const { name, email, phone } = parsed.user;
    return { accessToken: parsed.accessToken, user: { name: name ?? '', email, phone: phone ?? null } };
  } catch {
    return null; // 손상된 값은 무시하고 다시 로그인
  }
}

export async function saveSession(session: Session): Promise<void> {
  if (!(await available())) return;
  try {
    await SecureStore.setItemAsync(KEY, JSON.stringify(session));
  } catch (e) {
    console.warn('세션 저장 실패:', e instanceof Error ? e.message : e);
  }
}

export async function clearSession(): Promise<void> {
  if (!(await available())) return;
  try {
    await SecureStore.deleteItemAsync(KEY);
  } catch {
    // 지울 값이 없거나 저장소를 쓸 수 없는 경우
  }
}
