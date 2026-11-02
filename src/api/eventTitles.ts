// 이벤트 화면 제목(한글). 키는 서버 visionEvents[].eventType이며, 백엔드 판정 규칙(AnalyzeAgentRiskUseCase)의 값과 같다.
// 실제 서버 변환(http/mappers.ts)과 mock 예시 데이터(mock/example-fixtures.ts)가 같은 표를 쓴다.

/** 위험도가 높은 순서. 한 이벤트에 여러 종류가 있으면 앞의 것을 제목으로 쓴다 */
export const VISION_EVENT_TITLES = [
  ['SILENT_SIGNAL', '비상 손동작'],
  ['REAR_CLOSE_APPROACH_SUSPECTED', '후방 접근 의심'],
  ['CAMERA_OCCLUSION_SUSPECTED', '카메라 가림 의심'],
  ['PERSON_DWELL_OBSERVED', '현관 앞 체류 관찰'],
] as const;

export type VisionEventType = (typeof VISION_EVENT_TITLES)[number][0];

export const TITLE_BY_VISION_EVENT: Readonly<Record<VisionEventType, string>> = Object.fromEntries(
  VISION_EVENT_TITLES,
) as Record<VisionEventType, string>;

/** 판단 근거 문장에 쓰는 이름("○○이/가 관찰되었습니다"). 제목과 같되 체류는 "관찰"을 뺀다 */
export const PHRASE_BY_VISION_EVENT: Readonly<Record<VisionEventType, string>> = {
  SILENT_SIGNAL: '비상 손동작',
  REAR_CLOSE_APPROACH_SUSPECTED: '후방 접근 의심',
  CAMERA_OCCLUSION_SUSPECTED: '카메라 가림 의심',
  PERSON_DWELL_OBSERVED: '현관 앞 체류',
};

/** 대응표에 있는 종류를 우선순위 순서로(중복 제거). 표에 없는 종류는 뺀다 */
export function knownVisionEvents(types: readonly string[]): VisionEventType[] {
  const upper = new Set(types.map((t) => t.trim().toUpperCase()));
  return VISION_EVENT_TITLES.map(([type]) => type).filter((type) => upper.has(type));
}

/** 대응표에 있는 종류 중 우선순위가 가장 높은 것의 제목. 없으면 null */
export function titleForVisionEvents(types: readonly string[]): string | null {
  const [first] = knownVisionEvents(types);
  return first ? TITLE_BY_VISION_EVENT[first] : null;
}
