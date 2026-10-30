import { API_BASE_URL } from '../config';
import type { ApiEnvelope, ErrorResponseDto, TokenDataDto } from './dto';

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

/** 세션 상태 변화를 auth 구현에 알리는 훅(저장소 갱신, 강제 로그아웃) */
type SessionHooks = {
  /** 토큰 재발급 성공: 저장된 세션의 토큰을 갱신한다 */
  onTokenRefreshed?: (token: string) => void;
  /** 재발급까지 실패: 다시 로그인해야 한다 */
  onExpired?: () => void;
};
let sessionHooks: SessionHooks = {};

export function setSessionHooks(hooks: SessionHooks) {
  sessionHooks = hooks;
}

export class NotImplementedError extends Error {
  constructor(what: string) {
    super(`서버 명세에 없는 기능입니다: ${what}`);
  }
}

/** 서버 ErrorResponse({ success:false, status, code, message })를 담는 오류 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string | null;

  constructor(message: string, status: number, code: string | null) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** 토큰을 붙이지 않는 요청(로그인·회원가입·재발급) */
  anonymous?: boolean;
  /** 401일 때 토큰 재발급 후 1회 재시도 (기본 true) */
  retryOnUnauthorized?: boolean;
};

const ERROR_BY_STATUS: Record<number, string> = {
  400: '요청 값을 확인해 주세요.',
  401: '로그인이 필요합니다.',
  403: '권한이 없습니다.',
  404: '찾을 수 없습니다.',
  409: '이미 처리된 요청입니다.',
  502: '서버 연결에 문제가 있습니다. 잠시 후 다시 시도해 주세요.',
  503: '서버를 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.',
};

async function toApiError(res: Response): Promise<ApiError> {
  let body: Partial<ErrorResponseDto> | null = null;
  try {
    body = (await res.json()) as Partial<ErrorResponseDto>;
  } catch {
    body = null;
  }
  const message = body?.message || ERROR_BY_STATUS[res.status] || `요청 실패 (${res.status})`;
  return new ApiError(message, body?.status ?? res.status, body?.code ?? null);
}

let refreshing: Promise<boolean> | null = null;

/**
 * Access Token 재발급. refreshToken은 서버가 HttpOnly 쿠키로 관리하며,
 * React Native의 fetch는 같은 도메인 쿠키를 자동으로 저장·전송한다(실기기 확인 필요).
 * 동시에 여러 요청이 401을 받아도 재발급은 한 번만 한다.
 */
export function refreshAccessToken(): Promise<boolean> {
  refreshing ??= (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, { method: 'POST', credentials: 'include' });
      if (!res.ok) return false;
      const json = (await res.json()) as ApiEnvelope<TokenDataDto>;
      setAccessToken(json.data.accessToken);
      sessionHooks.onTokenRefreshed?.(json.data.accessToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

/**
 * 공통 HTTP 요청. 주소는 EXPO_PUBLIC_API_BASE_URL에서만 읽고, 응답 본문(JSON)을 그대로 돌려준다.
 * 인증 계열처럼 { success, data }로 감싼 응답은 requestData()를 쓴다.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!API_BASE_URL) throw new Error('EXPO_PUBLIC_API_BASE_URL이 설정되지 않았습니다.');
  const { method = 'GET', body, anonymous = false, retryOnUnauthorized = true } = options;
  const send = () =>
    fetch(`${API_BASE_URL}${path}`, {
      method,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(!anonymous && accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

  let res: Response;
  try {
    res = await send();
  } catch {
    throw new ApiError('서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.', 0, 'NETWORK_ERROR');
  }
  if (res.status === 401 && !anonymous && retryOnUnauthorized) {
    if (await refreshAccessToken()) res = await send();
    // 재발급 실패 또는 재시도도 401: 세션 만료로 보고 로그인 화면으로 보낸다
    if (res.status === 401) sessionHooks.onExpired?.();
  }
  if (!res.ok) throw await toApiError(res);
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/** { success, code, message, data } 껍데기를 벗겨 data만 돌려준다 */
export async function requestData<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const envelope = await request<ApiEnvelope<T>>(path, options);
  return envelope.data;
}
