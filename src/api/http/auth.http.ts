import type { AuthApi } from '../interfaces';
import { clearSession, loadSession, saveSession } from '../session';
import type { User } from '../types';
import { ApiError, request, requestData, setAccessToken, setSessionHooks } from './client';
import type { AuthSessionDataDto, LoginRequestDto, SignupRequestDto } from './dto';
import { toSession } from './mappers';

// 서버에 내 정보 조회 API가 없어 로그인·회원가입 응답의 사용자 정보를 쓴다.
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

async function startSession(path: string, body: LoginRequestDto | SignupRequestDto) {
  const data = await requestData<AuthSessionDataDto>(path, { method: 'POST', body, anonymous: true });
  const session = toSession(data);
  setAccessToken(session.accessToken);
  currentUser = session.user;
  await saveSession(session);
  return session;
}

export const httpAuthApi: AuthApi = {
  // POST /api/auth/login
  login: (email, password) => startSession('/api/auth/login', { email, password }),

  // POST /api/auth/signup (201, 가입과 동시에 로그인 상태로 응답). phoneNumber는 화면에 입력칸이 없어 보내지 않는다
  signup: ({ name, email, password }) => startSession('/api/auth/signup', { name, email, password }),

  // POST /api/auth/logout. 서버 요청이 실패해도 앱의 로그인 상태와 저장된 세션은 지운다
  async logout() {
    try {
      await request('/api/auth/logout', { method: 'POST', retryOnUnauthorized: false });
    } finally {
      endSession();
    }
  },

  async getMe() {
    if (!currentUser) throw new ApiError('로그인이 필요합니다.', 401, null);
    return currentUser;
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
