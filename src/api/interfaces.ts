// 화면은 이 인터페이스만 사용합니다. 구현(mock / http)은 src/api/index.ts에서 고릅니다.
import type {
  DeviceStatus,
  RealtimeMessage,
  RealtimeStatus,
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
  /** 앱 시작 시 기기에 저장된 세션 복원(로그인 유지). 없으면 null */
  restore(): Promise<Session | null>;
  /** 토큰 재발급까지 실패해 다시 로그인해야 할 때 호출된다. 반환값을 호출하면 해제 */
  onSessionExpired(listener: () => void): () => void;
}

export interface EventApi {
  /** 최신순(최근 20개). risk 필터: HIGH는 CRITICAL 포함 */
  list(filter?: { risk?: Exclude<RiskLevel, 'CRITICAL'> }): Promise<SecurityEvent[]>;
  get(id: string): Promise<SecurityEvent>;
  /** 영상 클립 URL(실제 서버는 5분 유효 S3 주소). 영상이 없으면 null */
  getVideoUrl(id: string): Promise<string | null>;
  /** 이벤트 상세의 "확인 완료". 서버 명세 없음: 실제 서버 모드에서는 요청 없이 화면 상태만 정리 */
  acknowledge(id: string): Promise<void>;
}

export interface DeviceApi {
  getStatuses(): Promise<DeviceStatus[]>;
  /** 알림 화면의 "경고 끄기" */
  stopWarning(): Promise<void>;
}

/** 실시간 알림 채널. mock과 실제 FCM 푸시 구현(http/realtime.fcm.ts)이 같은 인터페이스를 따릅니다. */
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
  realtime: RealtimeService;
};

/** 개발용 도구. mock 모드에서만 존재합니다. */
export type DevTools = {
  triggerHighAlert(): void;
};
