import type { AuthApi } from '../interfaces';
import { clearSession, loadSession, saveSession } from '../session';
import type { User } from '../types';
import { request, requestData, setAccessToken, setSessionHooks } from './client';
import type { AuthSessionDataDto, CurrentUserDto, LoginRequestDto, SignupRequestDto } from './dto';
import { toSession, toUser } from './mappers';

// 로그인·회원가입 응답의 사용자 정보에는 연락처가 없어, 마이페이지는 getMe(/api/users/me)로 최신 정보를 받는다.
// 로그인 유지: 세션(토큰 + 사용자 정보)을 기기 보안 저장소에 두고 앱 시작 시 restore()로 복원한다.
let currentUser: User | null = null;
const expiredListeners = new Set<() => void>();

function endSession() {
  setAccessToken(null);
  currentUser = null;
  void clearSession();
}

setSessionHooks({
  // 토큰이 재발급되면 저장된 세션도 새 토큰으로 바꾼다
  onTokenRefreshed: (token) => {
    if (currentUser) void saveSession({ accessToken: token, user: currentUser });
  },
  // 재발급까지 실패하면 저장된 세션을 지우고 로그인 화면으로 보낸다
  onExpired: () => {
    if (!currentUser) return;
    endSession();
    expiredListeners.forEach((l) => l());
  },
});

/** phone: 회원가입 때 입력한 연락처. 서버 응답에 연락처가 없어 입력값을 그대로 쓴다(로그인은 null) */
async function startSession(path: string, body: LoginRequestDto | SignupRequestDto, phone: string | null = null) {
  const data = await requestData<AuthSessionDataDto>(path, { method: 'POST', body, anonymous: true });
  const session = toSession(data, phone);
  setAccessToken(session.accessToken);
  currentUser = session.user;
  await saveSession(session);
  return session;
}

export const httpAuthApi: AuthApi = {
  // POST /api/auth/login
  login: (email, password) => startSession('/api/auth/login', { email, password }),

  // POST /api/auth/signup (201, 가입과 동시에 로그인 상태로 응답)
  signup: ({ name, email, password, phone }) =>
    startSession('/api/auth/signup', { name, email, password, phoneNumber: phone }, phone),

  // POST /api/auth/logout. 서버 요청이 실패해도 앱의 로그인 상태와 저장된 세션은 지운다
  async logout() {
    try {
      await request('/api/auth/logout', { method: 'POST', retryOnUnauthorized: false });
    } finally {
      endSession();
    }
  },

  // GET /api/users/me. 받은 정보(연락처 포함)로 저장된 세션의 사용자 정보도 갱신한다
  async getMe() {
    const user = toUser(await requestData<CurrentUserDto>('/api/users/me'));
    currentUser = user;
    const saved = await loadSession();
    if (saved) await saveSession({ ...saved, user });
    return user;
  },

  // 저장된 토큰이 만료됐더라도 그대로 복원한다. 첫 요청이 401이면 쿠키로 재발급하고, 그것도 실패하면 onSessionExpired
  async restore() {
    const session = await loadSession();
    if (!session) return null;
    setAccessToken(session.accessToken);
    currentUser = session.user;
    return session;
  },

  onSessionExpired(listener) {
    expiredListeners.add(listener);
    return () => {
      expiredListeners.delete(listener);
    };
  },
};
