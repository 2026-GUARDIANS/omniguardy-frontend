import type { AuthApi } from '../interfaces';
import type { Session, User } from '../types';
import { sleep } from './constants';
import { EXAMPLE_USER_NAME } from './example-fixtures';
import { mockStore } from './store';

const session = (user: User): Session => ({ user, accessToken: 'mock-token' });

/** mock: 어떤 이메일/비밀번호든 로그인됩니다. */
export const mockAuthApi: AuthApi = {
  async login(email) {
    await sleep();
    // 같은 이메일로 회원가입했다면 그 입력값을 쓰고, 아니면 예시 사용자로 표시
    if (!mockStore.user || mockStore.user.email !== email) {
      mockStore.user = { name: EXAMPLE_USER_NAME, email, phone: null };
    }
    return session(mockStore.user);
  },
  async signup({ name, email }) {
    await sleep();
    mockStore.user = { name, email, phone: null };
    return session(mockStore.user);
  },
  async logout() {
    await sleep();
  },
  async getMe() {
    await sleep();
    if (!mockStore.user) throw new Error('로그인이 필요합니다.');
    return mockStore.user;
  },
};
