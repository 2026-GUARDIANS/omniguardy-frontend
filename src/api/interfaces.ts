// 화면은 이 인터페이스만 사용합니다. 구현(mock / http)은 src/api/index.ts에서 고릅니다.
import type {
  DeviceStatus,
  RealtimeMessage,
  RealtimeStatus,
  ResponseSettings,
  RiskLevel,
  SecurityEvent,
  Session,
  SignupInput,
  User,
} from './types';

export interface AuthApi {
  login(email: string, password: string): Promise<Session>;
  signup(input: SignupInput): Promise<Session>;
  logout(): Promise<void>;
  getMe(): Promise<User>;
}

export interface EventApi {
  /** 최신순 */
  list(filter?: { risk?: RiskLevel }): Promise<SecurityEvent[]>;
  get(id: string): Promise<SecurityEvent>;
  /** 이벤트 상세의 "확인 완료" */
  acknowledge(id: string): Promise<void>;
}

export interface DeviceApi {
  getStatuses(): Promise<DeviceStatus[]>;
  /** 알림 화면의 "경고 끄기" */
  stopWarning(): Promise<void>;
}

export interface SettingsApi {
  getResponseSettings(): Promise<ResponseSettings>;
  updateResponseSettings(patch: Partial<ResponseSettings>): Promise<ResponseSettings>;
}

/** 실시간 알림 채널. mock과 실제 WebSocket 구현이 같은 인터페이스를 따릅니다. */
export interface RealtimeService {
  connect(): void;
  disconnect(): void;
  /** 반환값을 호출하면 구독 해제 */
  subscribe(listener: (message: RealtimeMessage) => void): () => void;
  subscribeStatus(listener: (status: RealtimeStatus) => void): () => void;
  getStatus(): RealtimeStatus;
}

export type Api = {
  auth: AuthApi;
  events: EventApi;
  devices: DeviceApi;
  settings: SettingsApi;
  realtime: RealtimeService;
};

/** 개발용 도구. mock 모드에서만 존재합니다. */
export type DevTools = {
  triggerHighAlert(): void;
};
