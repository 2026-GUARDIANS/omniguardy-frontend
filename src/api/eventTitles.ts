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

/** 대응표에 있는 종류 중 우선순위가 가장 높은 것의 제목. 없으면 null */
export function titleForVisionEvents(types: readonly string[]): string | null {
  const upper = new Set(types.map((t) => t.trim().toUpperCase()));
  for (const [type, title] of VISION_EVENT_TITLES) {
    if (upper.has(type)) return title;
  }
  return null;
}
