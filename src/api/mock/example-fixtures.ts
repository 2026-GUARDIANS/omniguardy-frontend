// ====================================================================
//  ⚠️ 예시(EXAMPLE) 데이터 — 실제 데이터가 아닙니다.
//  - 전시용 규칙 기준 이벤트 제목만 사용합니다.
//  - 실존처럼 보이는 이름·연락처·수치를 만들지 않습니다.
//  - 날짜·시각은 호출 시점(현재 시각) 기준으로 생성합니다.
// ====================================================================
import type { AgentJudgement, RiskLevel, SecurityEvent } from '../types';

/** 전시용 규칙의 이벤트 제목 */
export const EXAMPLE_EVENT_TITLES = {
  loitering: { title: '현관 앞 체류 관찰', risk: 'LOW' },
  cameraCovered: { title: '카메라 가림 의심', risk: 'MEDIUM' },
  emergencyGesture: { title: '비상 손동작', risk: 'HIGH' },
  rearApproach: { title: '후방 접근 의심', risk: 'HIGH' },
} as const satisfies Record<string, { title: string; risk: RiskLevel }>;

type ExampleKey = keyof typeof EXAMPLE_EVENT_TITLES;

/** 설정 화면의 위험도별 대응과 같은 문구 */
const EXAMPLE_ACTION: Record<RiskLevel, string> = {
  LOW: '이벤트 기록만 저장',
  MEDIUM: '모바일 알림 전송',
  HIGH: '모바일 알림 + 경고 출력',
  CRITICAL: '모바일 알림 + 사이렌 출력',
};

const EXAMPLE_REASON: Record<ExampleKey, string> = {
  loitering: '[예시 응답] 현관 앞에서 머무는 사람이 관찰됨',
  cameraCovered: '[예시 응답] 카메라 화면이 가려진 것으로 의심됨',
  emergencyGesture: '[예시 응답] 등록된 비상 손동작과 유사한 동작이 관찰됨',
  rearApproach: '[예시 응답] 사용자 뒤쪽에서 접근하는 움직임이 의심됨',
};

/** 예시 영상 주소. example.com은 예시 전용 도메인이며 실제 영상이 없습니다. */
export const EXAMPLE_VIDEO_URL = 'https://example.com/example-clip.mp4';

const MIN = 60_000;
const HOUR = 60 * MIN;

let seq = 0;

export function makeExampleEvent(
  key: ExampleKey,
  occurredAt: Date,
  videoUrl: string | null = null,
): SecurityEvent {
  const { title, risk } = EXAMPLE_EVENT_TITLES[key];
  const agentJudgement: AgentJudgement = {
    risk,
    action: EXAMPLE_ACTION[risk],
    reason: EXAMPLE_REASON[key],
  };
  seq += 1;
  return {
    id: `example-${seq}`,
    title,
    risk,
    status: 'COMPLETED',
    occurredAt: occurredAt.toISOString(),
    videoUrl,
    agentJudgement,
  };
}

/** 아직 위험도 판정 전인 예시 이벤트(서버에서 riskLevel이 비어 오는 경우) */
export function makeExampleAnalyzingEvent(occurredAt: Date): SecurityEvent {
  seq += 1;
  return {
    id: `example-${seq}`,
    title: '분석 중인 보안 이벤트',
    risk: null,
    status: 'ANALYZING',
    occurredAt: occurredAt.toISOString(),
    videoUrl: null,
    agentJudgement: { risk: null, action: '', reason: '' },
  };
}

/** 앱 시작 시점 기준의 예시 이벤트 목록(최신순) */
export function createExampleEvents(now: Date = new Date()): SecurityEvent[] {
  const ago = (ms: number) => new Date(now.getTime() - ms);
  return [
    makeExampleAnalyzingEvent(ago(3 * MIN)),
    makeExampleEvent('emergencyGesture', ago(12 * MIN), EXAMPLE_VIDEO_URL),
    makeExampleEvent('rearApproach', ago(48 * MIN)),
    makeExampleEvent('cameraCovered', ago(2 * HOUR)),
    makeExampleEvent('loitering', ago(5 * HOUR)),
    makeExampleEvent('cameraCovered', ago(26 * HOUR)),
    makeExampleEvent('loitering', ago(29 * HOUR)),
  ];
}

/** 예시 사용자 이름(로그인만 하고 회원가입 입력값이 없을 때) */
export const EXAMPLE_USER_NAME = '예시 사용자';
