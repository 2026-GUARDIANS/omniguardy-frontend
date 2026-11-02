// 서버 응답·요청 형태(DTO). 출처: https://api.omniguardy.cloud/v3/api-docs (OpenAPI 3.1)
// Swagger 예시와 백엔드 코드가 다른 부분은 백엔드 코드(omniguardy-backend c417047)를 따른다.

/** 인증 계열 응답의 공통 껍데기. 보안 이벤트 조회 API는 이 껍데기 없이 본문만 온다 */
export type ApiEnvelope<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T;
};

export type ErrorResponseDto = {
  success: false;
  status: number;
  code: string;
  message: string;
  data?: unknown;
};

export type LoginRequestDto = { email: string; password: string };

export type SignupRequestDto = { email: string; password: string; name: string; phoneNumber?: string | null };

export type AuthSessionDataDto = {
  accessToken: string;
  tokenType: string;
  userId: number;
  email: string;
  name: string;
};

export type TokenDataDto = { accessToken: string; tokenType: string };

/** GET /api/users/me (공통 껍데기 안의 data) */
export type CurrentUserDto = { name: string; email: string; phoneNumber: string | null };

/** GET /api/home/summary (공통 껍데기 안의 data). 서버가 Asia/Seoul 기준 "오늘"로 센다 */
export type HomeSummaryDto = {
  /** 가장 최근 보안 이벤트의 위험도. 이벤트가 없거나 판정 전이면 null */
  securityStatus: string | null;
  /** 시간대 포함(+09:00). 이벤트가 없으면 null */
  lastDetectedAt: string | null;
  todayEventCount: number;
};

/** 백엔드 SecurityEventStatus. Swagger 예시의 "ANALYZED"는 실제 값이 아니다 */
export type SecurityEventStatusDto = 'AUDIO_DETECTED' | 'CAMERA_REQUESTED' | 'VISION_ANALYZED' | 'COMPLETED' | 'FAILED';

export type SecurityEventDto = {
  id: number;
  eventId: string;
  userId: number;
  triggerId: string | null;
  triggerType: 'AUDIO' | 'KEYPAD' | null;
  status: SecurityEventStatusDto | string | null;
  audioEventType: 'BACKGROUND' | 'KNOCK' | 'HANDLE' | null;
  audioProbability: number | null;
  visionPrediction: string | null;
  visionConfidence: number | null;
  visionAnalysisMode: string | null;
  /** JSON 문자열(예: "{\"A18\":0.91}") */
  classProbabilities: string | null;
  /** JSON 문자열(예: "[{\"eventType\":\"PERSON_DWELL_OBSERVED\"}]") */
  visionEvents: string | null;
  personCount: number | null;
  videoDurationSeconds: number | null;
  /** 백엔드 RiskLevel: LOW | MEDIUM | HIGH | CRITICAL. 분석 전·실패·판정 없음이면 null */
  riskLevel: string | null;
  riskScore: number | null;
  agentReason: string | null;
  /** 시간대 포함(+09:00) */
  triggeredAt: string | null;
  visionAnalyzedAt: string | null;
  /** 시간대 없음(서버 로컬 시각) */
  createdAt: string | null;
  updatedAt: string | null;
};

export type SecurityEventPageDto = {
  content: SecurityEventDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type VideoUrlDto = { url: string };

export type DeviceTokenSaveRequestDto = { token: string; deviceType: 'ANDROID' | 'IOS' };

/**
 * FCM 데이터 메시지(백엔드 FirebasePushAdapter).
 * 현재: riskLevel은 숫자 문자열("2"=MEDIUM, "3"=HIGH 이상), eventId 없음.
 * 변경 요청 후: riskLevel은 enum 이름(MEDIUM/HIGH/CRITICAL), eventId 포함. 둘 다 받는다(mappers.parseSecurityPush)
 */
export type SecurityPushDataDto = { type?: unknown; riskLevel?: unknown; eventId?: unknown };
