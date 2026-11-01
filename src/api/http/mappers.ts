// 서버 DTO → 앱 타입 변환. React Native 의존성이 없는 순수 함수(scripts/verify-mappers.mjs에서 직접 검증).
import type { EventStatus, HomeSummary, RiskLevel, SecurityEvent, Session, User } from '../types';
import type { AuthSessionDataDto, CurrentUserDto, HomeSummaryDto, SecurityEventDto, SecurityPushDataDto } from './dto';

const RISK_VALUES: readonly RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export function toRiskLevel(value: string | null | undefined): RiskLevel | null {
  const upper = value?.trim().toUpperCase();
  return (RISK_VALUES as readonly string[]).includes(upper ?? '') ? (upper as RiskLevel) : null;
}

/** 서버 status → 화면 상태. 위험도가 있으면 판정이 끝난 것으로 본다 */
export function toEventStatus(status: string | null | undefined, risk: RiskLevel | null): EventStatus {
  if (risk) return 'COMPLETED';
  const s = status?.trim().toUpperCase();
  if (s === 'COMPLETED') return 'COMPLETED';
  if (s === 'FAILED') return 'FAILED';
  return 'ANALYZING'; // AUDIO_DETECTED, CAMERA_REQUESTED, VISION_ANALYZED, 알 수 없는 값
}

/** 대응 문구. 서버 필드가 없어 백엔드 RiskResponseService 규칙을 그대로 옮긴다 */
const ACTION_BY_RISK: Record<RiskLevel, string> = {
  LOW: '이벤트 기록만 저장',
  MEDIUM: '모바일 알림 전송',
  HIGH: '모바일 알림 + 경고 출력',
  CRITICAL: '모바일 알림 + 사이렌 출력',
};

/**
 * TODO(사용자 결정 대기): 화면 제목 대응표. 키는 visionEvents[].eventType.
 * 백엔드 판정 규칙(AnalyzeAgentRiskUseCase)에 쓰이는 값: SILENT_SIGNAL, REAR_CLOSE_APPROACH_SUSPECTED,
 * CAMERA_OCCLUSION_SUSPECTED, PERSON_DWELL_OBSERVED. 확정되면 여기에 채운다. 비어 있으면 아래 임시 제목을 쓴다.
 */
export const EVENT_TITLE_BY_VISION_EVENT: Readonly<Record<string, string>> = {};

export function parseVisionEventTypes(json: string | null | undefined): string[] {
  if (!json) return [];
  try {
    const parsed: unknown = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((e) => (e && typeof e === 'object' && 'eventType' in e ? String((e as { eventType: unknown }).eventType) : ''))
      .filter(Boolean);
  } catch {
    return [];
  }
}

const FALLBACK_TITLE: Record<EventStatus, string> = {
  ANALYZING: '분석 중인 보안 이벤트',
  FAILED: '분석에 실패한 보안 이벤트',
  COMPLETED: '보안 이벤트',
};

/** 제목: 대응표 → (임시) 판단 근거 문장 → 상태별 기본 문구 */
export function toEventTitle(dto: Pick<SecurityEventDto, 'visionEvents' | 'agentReason'>, status: EventStatus): string {
  for (const type of parseVisionEventTypes(dto.visionEvents)) {
    const title = EVENT_TITLE_BY_VISION_EVENT[type];
    if (title) return title;
  }
  const reason = dto.agentReason?.trim();
  return reason || FALLBACK_TITLE[status];
}

export function toSecurityEvent(dto: SecurityEventDto): SecurityEvent {
  const risk = toRiskLevel(dto.riskLevel);
  const status = toEventStatus(dto.status, risk);
  return {
    id: dto.eventId,
    title: toEventTitle(dto, status),
    risk,
    status,
    // triggeredAt(시간대 포함)을 우선. createdAt은 시간대가 없어 기기 현지 시각으로 해석된다
    occurredAt: dto.triggeredAt ?? dto.createdAt ?? new Date(0).toISOString(),
    videoUrl: null,
    agentJudgement: {
      risk,
      action: risk ? ACTION_BY_RISK[risk] : '',
      reason: dto.agentReason?.trim() ?? '',
    },
  };
}

/** 로그인·회원가입 응답에는 연락처가 없다. 회원가입은 입력값을 쓰고, 그 외에는 getMe(/api/users/me)로 채운다 */
export function toSession(data: AuthSessionDataDto, phone: string | null = null): Session {
  return { accessToken: data.accessToken, user: { name: data.name, email: data.email, phone } };
}

/** 현재 백엔드의 숫자 등급(RiskResponseService). HIGH·CRITICAL이 모두 3이라 3은 HIGH로 본다 */
const RISK_BY_PUSH_NUMBER: Readonly<Record<string, RiskLevel>> = { '2': 'MEDIUM', '3': 'HIGH' };

/** FCM 데이터의 riskLevel → 앱 위험도. 숫자 문자열("2","3")과 enum 이름(MEDIUM/HIGH/CRITICAL) 둘 다 받는다 */
export function toPushRiskLevel(value: unknown): RiskLevel | null {
  if (typeof value === 'number') value = String(value);
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return RISK_BY_PUSH_NUMBER[trimmed] ?? toRiskLevel(trimmed);
}

export type SecurityPush = { risk: RiskLevel | null; eventId: string | null };

/** 보안 이벤트 푸시가 아니면 null. eventId는 백엔드가 아직 보내지 않아 없을 수 있다 */
export function parseSecurityPush(raw: unknown): SecurityPush | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as SecurityPushDataDto;
  if (data.type !== 'SECURITY_EVENT') return null;
  const eventId = typeof data.eventId === 'string' && data.eventId.trim() ? data.eventId.trim() : null;
  return { risk: toPushRiskLevel(data.riskLevel), eventId };
}

export function toUser(dto: CurrentUserDto): User {
  return { name: dto.name, email: dto.email, phone: dto.phoneNumber?.trim() || null };
}

export function toHomeSummary(dto: HomeSummaryDto): HomeSummary {
  return {
    latestRisk: toRiskLevel(dto.securityStatus),
    lastDetectedAt: dto.lastDetectedAt,
    todayEventCount: dto.todayEventCount ?? 0,
  };
}
