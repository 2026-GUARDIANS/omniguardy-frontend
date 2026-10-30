import type { AuthApi } from '../interfaces';
import type { User } from '../types';
import { ApiError, request, requestData, setAccessToken } from './client';
import type { AuthSessionDataDto, LoginRequestDto, SignupRequestDto } from './dto';
import { toSession } from './mappers';

// 서버에 내 정보 조회 API가 없어 로그인·회원가입 응답의 사용자 정보를 메모리에 둔다(앱 재시작 시 다시 로그인)
let currentUser: User | null = null;

async function startSession(path: string, body: LoginRequestDto | SignupRequestDto) {
  const data = await requestData<AuthSessionDataDto>(path, { method: 'POST', body, anonymous: true });
  const session = toSession(data);
  setAccessToken(session.accessToken);
  currentUser = session.user;
  return session;
}

export const httpAuthApi: AuthApi = {
  // POST /api/auth/login
  login: (email, password) => startSession('/api/auth/login', { email, password }),

  // POST /api/auth/signup (201, 가입과 동시에 로그인 상태로 응답). phoneNumber는 화면에 입력칸이 없어 보내지 않는다
  signup: ({ name, email, password }) => startSession('/api/auth/signup', { name, email, password }),

  // POST /api/auth/logout. 서버 요청이 실패해도 앱의 로그인 상태는 지운다
  async logout() {
    try {
      await request('/api/auth/logout', { method: 'POST', retryOnUnauthorized: false });
    } finally {
      setAccessToken(null);
      currentUser = null;
    }
  },

  async getMe() {
    if (!currentUser) throw new ApiError('로그인이 필요합니다.', 401, null);
    return currentUser;
  },
};
