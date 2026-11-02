/** mock 실시간 채널이 연결 후 HIGH 이벤트를 발행하기까지의 시간 */
export const MOCK_HIGH_ALERT_DELAY_MS = 15_000;

/** mock API 응답 지연(로딩 상태 확인용) */
export const MOCK_LATENCY_MS = 300;

export const sleep = (ms: number = MOCK_LATENCY_MS) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
