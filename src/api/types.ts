// 앱(화면)이 쓰는 타입. 서버 응답 형태(DTO)는 http/dto.ts에 따로 두고 http/mappers.ts에서 변환한다.
// 기준: OmniGuardy API (https://api.omniguardy.cloud/v3/api-docs) + 백엔드 코드(omniguardy-backend 351cb5d).
// "임시" 표시가 남은 타입은 아직 서버 명세가 없는 부분이다.

/** 백엔드 RiskLevel enum과 같다. CRITICAL은 정의만 있고 현재 판정 규칙으로는 나오지 않는다 */
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/** 필터 칩 순서(Figma). HIGH 필터는 CRITICAL을 포함한다 */
export const RISK_LEVELS: readonly Exclude<RiskLevel, 'CRITICAL'>[] = ['HIGH', 'MEDIUM', 'LOW'];

/** HIGH 이상(HIGH·CRITICAL): 비상 알림 화면 대상 */
export const isHighOrAbove = (risk: RiskLevel | null): boolean => risk === 'HIGH' || risk === 'CRITICAL';

/** 필터 칩 선택값에 이벤트 위험도가 해당하는지 */
export const matchesRiskFilter = (risk: RiskLevel | null, filter: Exclude<RiskLevel, 'CRITICAL'>): boolean =>
  filter === 'HIGH' ? isHighOrAbove(risk) : risk === filter;

/**
 * 이벤트 분석 상태(화면용으로 묶은 값).
 * 서버 status: AUDIO_DETECTED·CAMERA_REQUESTED·VISION_ANALYZED → ANALYZING, COMPLETED, FAILED
 */
export type EventStatus = 'ANALYZING' | 'COMPLETED' | 'FAILED';

/** Agent의 위험도 판단 결과 */
export type AgentJudgement = {
  /** 위험도가 아직 없거나(분석 중·실패) 판정 없이 끝나면 null */
  risk: RiskLevel | null;
  /** 대응. 서버에 필드가 없어 위험도별 대응 규칙(백엔드 RiskResponseService)으로 만든다. 위험도가 없으면 빈 문자열 */
  action: string;
  /** 판단 근거(agentReason). 없으면 빈 문자열 */
  reason: string;
};

/** 보안 이벤트 */
export type SecurityEvent = {
  /** 서버의 공개 식별자 eventId (예: "evt-video-20261029-001") */
  id: string;
  title: string;
  risk: RiskLevel | null;
  status: EventStatus;
  /** ISO 8601 (서버 triggeredAt) */
  occurredAt: string;
  /** 영상 클립 URL. 목록·상세 응답에는 없고 events.getVideoUrl()로 따로 받는다(5분 유효) */
  videoUrl: string | null;
  agentJudgement: AgentJudgement;
};

/** 사용자. 서버에 내 정보 조회 API가 없어 로그인·회원가입 응답 값을 쓴다 */
export type User = {
  name: string;
  email: string;
};

export type Session = {
  user: User;
  accessToken: string;
};

export type SignupInput = {
  name: string;
  email: string;
  password: string;
};

/** 임시(서버 명세 없음): 현관 장치 종류 */
export type DeviceKind = 'camera' | 'voice' | 'keypad';

/** 임시(서버 명세 없음) */
export type DeviceStatus = {
  kind: DeviceKind;
  connected: boolean;
};

export type RealtimeStatus = 'connecting' | 'connected' | 'disconnected';

/** 실시간 채널 메시지. 실제 서버는 FCM 푸시를 받아 이벤트를 조회한 뒤 이 형태로 전달한다 */
export type RealtimeMessage = {
  type: 'event';
  event: SecurityEvent;
  /** 사용자가 알림을 눌러 들어왔고, 푸시의 eventId로 정확한 이벤트를 찾은 경우. HIGH 미만이면 상세 화면을 연다 */
  openDetail?: boolean;
};
