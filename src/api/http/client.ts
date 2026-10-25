import { API_BASE_URL } from '../config';

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export class NotImplementedError extends Error {
  constructor(what: string) {
    super(`TODO(백엔드 명세 확정 후 구현): ${what}`);
  }
}

/**
 * 공통 HTTP 요청. 주소는 EXPO_PUBLIC_API_BASE_URL에서만 읽습니다.
 * TODO: 응답 포맷(success/data/message 등), 에러 코드, 토큰 갱신 방식이 확정되면 맞춥니다.
 */
export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_BASE_URL) throw new Error('EXPO_PUBLIC_API_BASE_URL이 설정되지 않았습니다.');
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init.headers,
    },
  });
  if (!res.ok) throw new Error(`요청 실패 (${res.status})`);
  return (await res.json()) as T;
}
