// ⚠️ 임시(백엔드 명세 확정 전) 타입입니다.
// 화면에 필요한 최소 필드만 둡니다. 명세가 확정되면 이 파일과 http/ 구현만 고칩니다.

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export const RISK_LEVELS: readonly RiskLevel[] = ['HIGH', 'MEDIUM', 'LOW'];

/** 임시: Agent의 위험도 판단 결과 */
export type AgentJudgement = {
  risk: RiskLevel;
  /** 대응 (예: 모바일 알림 전송) */
  action: string;
  /** 판단 근거 (Agent 응답) */
  reason: string;
};

/** 임시: 보안 이벤트 */
export type SecurityEvent = {
  id: string;
  title: string;
  risk: RiskLevel;
  /** ISO 8601 */
  occurredAt: string;
  /** 영상 클립 URL. 없으면 null */
  videoUrl: string | null;
  agentJudgement: AgentJudgement;
};

/** 임시: 사용자 */
export type User = {
  name: string;
  email: string;
  phone: string | null;
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

/** 임시: 현관 장치 종류 */
export type DeviceKind = 'camera' | 'voice' | 'keypad';

export type DeviceStatus = {
  kind: DeviceKind;
  connected: boolean;
};

/** 임시: 위험도별 대응 설정 (LOW는 "기록만 저장" 고정) */
export type ResponseSettings = {
  mediumNotify: boolean;
  highNotifyAndWarn: boolean;
};

export type RealtimeStatus = 'connecting' | 'connected' | 'disconnected';

/** 임시: 실시간 채널 메시지 */
export type RealtimeMessage = { type: 'event'; event: SecurityEvent };
